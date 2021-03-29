// importing
import express from "express";
import { IMeeting, Meeting } from "../../model/meeting/meeting";
import { authenticate } from "../../service/authentication-service";
import crypto from 'crypto';
import mongoose from "mongoose";
import { IRoomMessage, Message } from "../../model/roomMessages/roomMessage";
import { MailService } from "../../service/mail-service";

// router config
const router = express.Router();

router.post('/host', authenticate, async (req, res) => {
    try {
        const { userId } = req.body;
        const meetingDetails = await Meeting.findOne({ $and: [{ hostId: userId }, { isActive: true }] });
        if (meetingDetails) {
            res.json({
                message: 'created room Successfully',
                meeting: meetingDetails
            })
        } else {
            const roomId = crypto.randomBytes(32).toString('hex');
            const meeting: IMeeting = new Meeting({
                roomId,
                // recording: ,
                hostId: userId,
                messageIds: [],
                isActive: true,
            })
            await meeting.save();
            res.json({
                message: 'created room Successfully',
                meeting
            })
        }
    } catch (err) {
        res.status(400).json({
            message: 'Unable to host a meeting'
        })
    }
})


router.get('/chat/:roomId', authenticate, async (req, res) => {
    try {

        // find the group by group id 
        let meeting: IMeeting = await Meeting.findOne({ roomId: req.params.roomId });

        if (!meeting) {
            res.status(401).json({
                message: 'meeting does not exists'
            })
        } else {
            // fetch the messages for the group
            let messsageIds = meeting.messageIds.map(messageId => mongoose.Types.ObjectId(messageId));
            let messages: Array<IRoomMessage> = await Message.find({ _id: { $in: messsageIds } });

            // if message exists send response message
            if (messages) {
                res.json({
                    message: 'Room Chat fetched',
                    messages
                })
            } else {
                res.status(400).json({
                    message: 'No chat available'
                })
            }
        }
    } catch (err) {
        console.log(err);
        res.status(400).json({
            message: 'unable to fetch the Room chat'
        })
    }
})

router.post('/join', authenticate, async (req, res) => {
    try {
        const meeting = await Meeting.findOne({ isActive: true });
        if (meeting) {
            res.json({
                message: 'Meeting Join success',
                meeting
            })
        } else {
            res.status(400).json({
                message: 'Room invalid or room closed'
            })
        }

    } catch (err) {
        res.status(400).json({
            message: 'room invalid or room closed'
        })
    }
})

router.post('/invite', authenticate, async (req, res) => {
    try {
        const { emailIds, inviteLink } = req.body;

        const mailService = new MailService();
        const mailSubject = 'Invite to join the meeting';
        const mailBody = `<div>
             <h3>You are invited to join the meeting, Meeting Link : <a href='${inviteLink}' target="_blank">Click here</a>  </h3>
         </div>`;

        emailIds.forEach(email => {
            const mailTo = email;
            // send mail for account activation
            mailService.sendMail(mailSubject, mailBody, mailTo);
        })


        // send response for user
        res.json({
            message: "Invite has been send to all the email ids",
        })
    } catch (err) {

    }
})

export default router;