"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
var mongoose_1 = __importDefault(require("mongoose"));
var validator_1 = __importDefault(require("validator"));
var userSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: true,
    },
    emailId: {
        type: String,
        required: true,
        vaidate: {
            validator: function (value) {
                return validator_1.default.isEmail(value);
            }
        }
    },
    password: {
        type: String,
        required: true,
    },
    accountActivationCode: String,
    accountActivationCodeExpiry: Number,
    isActive: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordTokenExpiry: Number
});
;
var User = mongoose_1.default.model('User', userSchema);
exports.User = User;
