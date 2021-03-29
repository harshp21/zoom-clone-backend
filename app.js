"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// importing
var express_1 = __importDefault(require("express"));
var dotenv_1 = __importDefault(require("dotenv"));
var mongoose_1 = __importDefault(require("mongoose"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var cors_1 = __importDefault(require("cors"));
var body_parser_1 = __importDefault(require("body-parser"));
var user_route_1 = __importDefault(require("./src/router/user/user-route"));
var meeting_route_1 = __importDefault(require("./src/router/meeting/meeting-route"));
var meeting_1 = require("./src/model/meeting/meeting");
var roomMessage_1 = require("./src/model/roomMessages/roomMessage");
// app config
var app = express_1.default();
dotenv_1.default.config();
var port = process.env.PORT || 5000;
// middleware
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.use(cors_1.default({
    origin: process.env.REQUEST_ORIGIN
}));
// router
app.use('/user', user_route_1.default);
app.use('/meeting', meeting_route_1.default);
// db config
var connectionUrl = process.env.MONGODB_CONNECTION_URL;
mongoose_1.default.connect(connectionUrl, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(function () { return console.log("Successfully connected to mongodb"); }).catch(function (err) { return console.log("mongo error", err); });
// app listen
var server = app.listen(port, function () { return console.log("listening on port : " + port); });
// registering a socket for server
var io = require('socket.io')(server, {
    cors: {
        origin: process.env.REQUEST_ORIGIN,
        methods: ["GET", "POST"]
    }
});
// peer server config
var ExpressPeerServer = require('peer').ExpressPeerServer;
var peer = express_1.default();
var expressPort = 9000;
var expressServer = peer.listen(expressPort);
var peerServer = ExpressPeerServer(expressServer);
peer.use('/peerjs', peerServer);
var rooms = [];
// socket connection 
io.use(function (socket, next) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (socket.handshake.query && socket.handshake.query.token) {
            jsonwebtoken_1.default.verify(socket.handshake.query.token, process.env.ACCESS_TOKEN_SECRET_KEY, function (err, decoded) {
                if (err)
                    return next(new Error('Authentication error'));
                socket.decoded = decoded;
                next();
            });
        }
        else {
            next(new Error('Authentication error'));
        }
        return [2 /*return*/];
    });
}); }).on('connection', function (socket) {
    console.log('connection');
    socket.on('join-room', function (roomId, streamingOptions) { return __awaiter(void 0, void 0, void 0, function () {
        var hostId, meeting, err_1, _a, userId, username, emailId, isRoomPresent, user, room, removeUserFromRoom, updateAndInvalidateMeeting;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    hostId = '';
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, meeting_1.Meeting.findOne({ $and: [{ roomId: roomId }, { isActive: true }] })];
                case 2:
                    meeting = _b.sent();
                    if (!meeting) {
                        io.emit('error-connection', 'Room Invalid or room Closed');
                        socket.leave();
                    }
                    else {
                        hostId = meeting.hostId;
                        socket.join(roomId);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _b.sent();
                    console.log(err_1);
                    return [3 /*break*/, 4];
                case 4:
                    _a = socket.decoded, userId = _a.userId, username = _a.username, emailId = _a.emailId;
                    isRoomPresent = rooms.some(function (room) { return room.roomId === roomId; });
                    if (isRoomPresent) {
                        rooms = rooms.map(function (room) {
                            if (room.roomId === roomId) {
                                var isUserAlreadyJoined = room.users.some(function (user) { return user.userId === userId; });
                                !isUserAlreadyJoined && room.users.push({ userId: userId, username: username, emailId: emailId, streamingOptions: streamingOptions });
                                return room;
                            }
                            else {
                                return room;
                            }
                        });
                    }
                    else {
                        user = {
                            userId: userId,
                            username: username,
                            emailId: emailId,
                            streamingOptions: streamingOptions
                        };
                        room = {
                            roomId: roomId,
                            users: [user],
                        };
                        rooms.push(room);
                    }
                    io.in(roomId).emit('room-joined', rooms.find(function (room) { return room.roomId === roomId; }), { userId: userId, username: username, emailId: emailId, streamingOptions: streamingOptions });
                    socket.to(roomId).on('room-message', function (msg) { return __awaiter(void 0, void 0, void 0, function () {
                        var roomMessage, message, newRoomMessage, err_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 3, , 4]);
                                    roomMessage = new roomMessage_1.Message({
                                        userId: userId,
                                        username: username,
                                        message: msg,
                                        timeStamp: new Date(),
                                    });
                                    return [4 /*yield*/, roomMessage.save()];
                                case 1:
                                    message = _a.sent();
                                    return [4 /*yield*/, meeting_1.Meeting.updateOne({ roomId: roomId }, { $push: { messageIds: message._id } })];
                                case 2:
                                    _a.sent();
                                    newRoomMessage = {
                                        _id: message._id,
                                        message: msg,
                                        username: socket.decoded.username,
                                        timestamp: message.timestamp,
                                        userId: message.userId
                                    };
                                    socket.to(roomId).emit("room-messages", newRoomMessage);
                                    return [3 /*break*/, 4];
                                case 3:
                                    err_2 = _a.sent();
                                    console.log(err_2);
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    socket.to(roomId).on('streaming-options-change', function (streamingOptions) {
                        rooms = rooms.map(function (room) {
                            if (room.roomId === roomId) {
                                room.users.map(function (user) {
                                    if (user.userId === userId)
                                        return user.streamingOptions = streamingOptions;
                                    else
                                        return user;
                                });
                                return room;
                            }
                            else {
                                return room;
                            }
                        });
                        socket.to(roomId).emit('room-users', rooms.find(function (room) { return room.roomId === roomId; }));
                    });
                    socket.to(roomId).on('share-screen', function (userId) {
                        socket.to(roomId).emit('share-screen', userId);
                    });
                    socket.to(roomId).on('screen-share-stopped', function () {
                        socket.to(roomId).emit('screen-share-stopped');
                    });
                    socket.to(roomId).on('leave-group', function () {
                        removeUserFromRoom();
                        var isHost = hostId === userId;
                        isHost ?
                            updateAndInvalidateMeeting() :
                            io.to(roomId).emit('room-users', rooms.find(function (room) { return room.roomId === roomId; }));
                    });
                    socket.to(roomId).on('disconnect', function () {
                        io.in(roomId).emit('user-disconnected', userId, username);
                        removeUserFromRoom();
                        io.to(roomId).emit('room-users', rooms.find(function (room) { return room.roomId === roomId; }));
                    });
                    removeUserFromRoom = function () {
                        rooms = rooms.map(function (room) {
                            if (room.roomId === roomId)
                                return {
                                    roomId: room.roomId,
                                    users: room.users.filter(function (user) { return user.userId !== userId; }),
                                };
                            return room;
                        });
                    };
                    updateAndInvalidateMeeting = function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, meeting_1.Meeting.updateOne({ roomId: roomId }, { $set: { isActive: false } })];
                                case 1:
                                    _a.sent();
                                    socket.to(roomId).emit('room-invalid');
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    return [2 /*return*/];
            }
        });
    }); });
});
