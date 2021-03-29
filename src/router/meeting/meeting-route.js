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
var meeting_1 = require("../../model/meeting/meeting");
var authentication_service_1 = require("../../service/authentication-service");
var crypto_1 = __importDefault(require("crypto"));
var mongoose_1 = __importDefault(require("mongoose"));
var roomMessage_1 = require("../../model/roomMessages/roomMessage");
var mail_service_1 = require("../../service/mail-service");
// router config
var router = express_1.default.Router();
router.post('/host', authentication_service_1.authenticate, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, meetingDetails, roomId, meeting, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                userId = req.body.userId;
                return [4 /*yield*/, meeting_1.Meeting.findOne({ $and: [{ hostId: userId }, { isActive: true }] })];
            case 1:
                meetingDetails = _a.sent();
                if (!meetingDetails) return [3 /*break*/, 2];
                res.json({
                    message: 'created room Successfully',
                    meeting: meetingDetails
                });
                return [3 /*break*/, 4];
            case 2:
                roomId = crypto_1.default.randomBytes(32).toString('hex');
                meeting = new meeting_1.Meeting({
                    roomId: roomId,
                    // recording: ,
                    hostId: userId,
                    messageIds: [],
                    isActive: true,
                });
                return [4 /*yield*/, meeting.save()];
            case 3:
                _a.sent();
                res.json({
                    message: 'created room Successfully',
                    meeting: meeting
                });
                _a.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                err_1 = _a.sent();
                res.status(400).json({
                    message: 'Unable to host a meeting'
                });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
router.get('/chat/:roomId', authentication_service_1.authenticate, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var meeting, messsageIds, messages, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                return [4 /*yield*/, meeting_1.Meeting.findOne({ roomId: req.params.roomId })];
            case 1:
                meeting = _a.sent();
                if (!!meeting) return [3 /*break*/, 2];
                res.status(401).json({
                    message: 'meeting doesnot exists'
                });
                return [3 /*break*/, 4];
            case 2:
                messsageIds = meeting.messageIds.map(function (messageId) { return mongoose_1.default.Types.ObjectId(messageId); });
                return [4 /*yield*/, roomMessage_1.Message.find({ _id: { $in: messsageIds } })];
            case 3:
                messages = _a.sent();
                // if message exists send response message
                if (messages) {
                    res.json({
                        message: 'Room Chat fetched',
                        messages: messages
                    });
                }
                else {
                    res.status(400).json({
                        message: 'No chat available'
                    });
                }
                _a.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                err_2 = _a.sent();
                console.log(err_2);
                res.status(400).json({
                    message: 'unable to fetch the Room chat'
                });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
router.post('/join', authentication_service_1.authenticate, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var meeting, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, meeting_1.Meeting.findOne({ isActive: true })];
            case 1:
                meeting = _a.sent();
                if (meeting) {
                    res.json({
                        message: 'Meeting Join success',
                        meeting: meeting
                    });
                }
                else {
                    res.status(400).json({
                        message: 'Room invalid or room closed'
                    });
                }
                return [3 /*break*/, 3];
            case 2:
                err_3 = _a.sent();
                res.status(400).json({
                    message: 'room invalid or room closed'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.post('/invite', authentication_service_1.authenticate, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, emailIds, inviteLink, mailService_1, mailSubject_1, mailBody_1;
    return __generator(this, function (_b) {
        try {
            _a = req.body, emailIds = _a.emailIds, inviteLink = _a.inviteLink;
            mailService_1 = new mail_service_1.MailService();
            mailSubject_1 = 'Invite to join the meeting';
            mailBody_1 = "<div>\n             <h3>You are invited to join the meeting, Meeting Link : <a href='" + inviteLink + "' target=\"_blank\">Click here</a>  </h3>\n         </div>";
            emailIds.forEach(function (email) {
                var mailTo = email;
                // send mail for account activation
                mailService_1.sendMail(mailSubject_1, mailBody_1, mailTo);
            });
            // send response for user
            res.json({
                message: "Invite has been send to all the email ids",
            });
        }
        catch (err) {
        }
        return [2 /*return*/];
    });
}); });
exports.default = router;
