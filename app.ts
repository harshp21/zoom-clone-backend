// importing
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import bodyParser from 'body-parser';
import userRoute from './src/router/user/user-route';
import meetingRoute from './src/router/meeting/meeting-route';
import { PeerServer, ExpressPeerServer } from 'peer';
import { Meeting } from './src/model/meeting/meeting';
import { IRoomMessage, Message } from './src/model/roomMessages/roomMessage';

// app config
const app = express();
dotenv.config();
const port = process.env.PORT || 5000;

// middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
    origin: process.env.REQUEST_ORIGIN
}))

// router
app.use('/user', userRoute);
app.use('/meeting', meetingRoute);

// db config
const connectionUrl = process.env.MONGODB_CONNECTION_URL;
mongoose.connect(connectionUrl, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("Successfully connected to mongodb")).catch(err => console.log("mongo error", err));

// app listen
const server = app.listen(port, () => console.log(`listening on port : ${port}`));

// peer server config
PeerServer({ path: '/peerjs', port: 9000 });
// const peerServer = ExpressPeerServer(server, {
//     path: '/peerjs'
// });

// app.use('/peerjs', peerServer);

//ip address
import address from 'address';

app.get('/', (req, res) => {
    res.json({ message: `${address.ip()}` });
})

// registering a socket for server
const io = require('socket.io')(server, {
    cors: {
        origin: process.env.REQUEST_ORIGIN,
        methods: ["GET", "POST"]
    }
});




let rooms = [];

// socket connection 
io.use(async (socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token) {
        jwt.verify(socket.handshake.query.token, process.env.ACCESS_TOKEN_SECRET_KEY, function (err, decoded) {
            if (err) return next(new Error('Authentication error'));
            socket.decoded = decoded;
            next();
        });
    }
    else {
        next(new Error('Authentication error'));
    }
}).on('connection', (socket) => {

    console.log('connection');

    socket.on('join-room', async (roomId: string, streamingOptions: any) => {

        let hostId = '';
        try {
            const meeting = await Meeting.findOne({ $and: [{ roomId }, { isActive: true }] });
            if (!meeting) {
                io.emit('error-connection', 'Room Invalid or room Closed');
                socket.leave();
            } else {
                hostId = meeting.hostId;
                socket.join(roomId);
            }
        } catch (err) {
            console.log(err);
        }

        const { userId, username, emailId } = socket.decoded;
        const isRoomPresent = rooms.some(room => room.roomId === roomId);

        if (isRoomPresent) {
            rooms = rooms.map((room) => {
                if (room.roomId === roomId) {
                    const isUserAlreadyJoined = room.users.some(user => user.userId === userId);
                    !isUserAlreadyJoined && room.users.push({ userId, username, emailId, streamingOptions });
                    return room;
                } else {
                    return room;
                }
            })
        } else {
            const user = {
                userId,
                username,
                emailId,
                streamingOptions
            }
            const room = {
                roomId,
                users: [user],
            }
            rooms.push(room);
        }

        io.in(roomId).emit('room-joined', rooms.find(room => room.roomId === roomId), { userId, username, emailId, streamingOptions });

        socket.to(roomId).on('room-message', async (msg: string) => {

            try {
                const roomMessage: IRoomMessage = new Message({
                    userId,
                    username,
                    message: msg,
                    timeStamp: new Date(),
                });
                const message: IRoomMessage = await roomMessage.save();
                await Meeting.updateOne({ roomId }, { $push: { messageIds: message._id } });

                const newRoomMessage = {
                    _id: message._id,
                    message: msg,
                    username: socket.decoded.username,
                    timestamp: message.timestamp,
                    userId: message.userId
                };
                socket.to(roomId).emit("room-messages", newRoomMessage);
            } catch (err) {
                console.log(err);
            }

        });

        socket.to(roomId).on('streaming-options-change', (streamingOptions) => {
            rooms = rooms.map((room) => {
                if (room.roomId === roomId) {
                    room.users.map(user => {
                        if (user.userId === userId)
                            return user.streamingOptions = streamingOptions;
                        else
                            return user;
                    })
                    return room;
                } else {
                    return room;
                }
            });
            socket.to(roomId).emit('room-users', rooms.find(room => room.roomId === roomId));
        })

        socket.to(roomId).on('share-screen', (userId) => {
            socket.to(roomId).emit('share-screen', userId);
        })

        socket.to(roomId).on('screen-share-stopped', () => {
            socket.to(roomId).emit('screen-share-stopped');
        })

        socket.to(roomId).on('leave-group', () => {
            removeUserFromRoom();
            const isHost = hostId === userId;
            isHost ?
                updateAndInvalidateMeeting() :
                io.to(roomId).emit('room-users', rooms.find(room => room.roomId === roomId));
        })

        socket.to(roomId).on('disconnect', () => {
            io.in(roomId).emit('user-disconnected', userId, username);
            removeUserFromRoom();
            io.to(roomId).emit('room-users', rooms.find(room => room.roomId === roomId));
        })

        const removeUserFromRoom = () => {
            rooms = rooms.map(room => {
                if (room.roomId === roomId)
                    return {
                        roomId: room.roomId,
                        users: room.users.filter(user => user.userId !== userId),
                    }
                return room;
            });
        }

        const updateAndInvalidateMeeting = async () => {
            await Meeting.updateOne({ roomId }, { $set: { isActive: false } })
            socket.to(roomId).emit('room-invalid')
        }


    });

});