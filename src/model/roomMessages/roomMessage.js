"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
// importing
var mongoose_1 = __importDefault(require("mongoose"));
// Creating schema for whats app messages
var zoomRoomMessagesSchema = new mongoose_1.default.Schema({
    // userId to identify which user has sent the message
    userId: {
        type: String,
        required: true
    },
    // username to identify which user has sent the message
    username: {
        type: String,
        required: true
    },
    // message id to identify which message is sent
    message: {
        type: String,
        required: true
    },
    // timestamp to identify at what time message was sent
    timestamp: {
        type: Date,
        default: new Date()
    },
    // to identify if the message was sent in a group and which group
    roomId: String
});
//Creating model/ Collection for messages schema
var Message = mongoose_1.default.model('Message', zoomRoomMessagesSchema);
exports.Message = Message;
