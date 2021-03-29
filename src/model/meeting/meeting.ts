import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
    roomId: {
        type: String
    },
    recording: {
        type: String
    },
    hostId: {
        type: String
    },
    messageIds: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: false
    }
});

interface IMeeting extends mongoose.Document {
    roomId: string,
    recording: string,
    hostId: string,
    messageIds: Array<string>,
    isActive: boolean
}

const Meeting = mongoose.model<IMeeting>('Meeting', meetingSchema);

export { Meeting, IMeeting };