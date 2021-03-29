"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Meeting = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var meetingSchema = new mongoose_1.default.Schema({
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
var Meeting = mongoose_1.default.model('Meeting', meetingSchema);
exports.Meeting = Meeting;
