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
//importing
var express_1 = __importDefault(require("express"));
var user_1 = require("../../model/user/user");
var bcrypt_1 = __importDefault(require("bcrypt"));
var crypto_1 = __importDefault(require("crypto"));
var mail_service_1 = require("../../service/mail-service");
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var validator_1 = __importDefault(require("validator"));
var authentication_service_1 = require("../../service/authentication-service");
// router config
var router = express_1.default.Router();
router.post('/login', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, emailId, password, user, isUserAuthenticated, _b, token, err_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                _a = req.body, emailId = _a.emailId, password = _a.password;
                // check if email is valid
                if ((!validator_1.default.isEmail(emailId))) {
                    res.status(400).json({
                        message: "Invalid email address"
                    });
                }
                return [4 /*yield*/, user_1.User.findOne({ emailId: emailId })];
            case 1:
                user = _c.sent();
                _b = user && user.isActive;
                if (!_b) return [3 /*break*/, 3];
                return [4 /*yield*/, bcrypt_1.default.compare(password, user.password)];
            case 2:
                _b = (_c.sent());
                _c.label = 3;
            case 3:
                isUserAuthenticated = _b;
                if (isUserAuthenticated) {
                    token = jsonwebtoken_1.default.sign({ userId: user._id, emailId: user.emailId, username: user.username }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '1h' });
                    // send response to the user
                    res.json({
                        message: 'User Logged in',
                        token: token,
                        user: user
                    });
                }
                else if (!user.isActive) {
                    // send response if the user is not activated
                    res.status(401).json({
                        status: 'Failed to login',
                        message: 'Account is not activated',
                    });
                }
                else {
                    // send response if the credentials are invalid
                    res.status(401).json({
                        status: 'Failed to login',
                        message: 'Provided credentials are wrong please verify',
                    });
                }
                return [3 /*break*/, 5];
            case 4:
                err_1 = _c.sent();
                console.log(err_1);
                // handle error response
                res.status(400).json({
                    message: 'Unable to Login user'
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// register user
router.post('/sign-up', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, emailId, password, confirmPassword, username, user, salt, hashPassword, activationCode, newUser, result, mailService, mailSubject, mailBody, mailTo, err_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 8, , 9]);
                _a = req.body, emailId = _a.emailId, password = _a.password, confirmPassword = _a.confirmPassword, username = _a.username;
                return [4 /*yield*/, user_1.User.findOne({ emailId: emailId })];
            case 1:
                user = _b.sent();
                if (!user) return [3 /*break*/, 2];
                res.status(400).json({
                    message: "Email already registered"
                });
                return [3 /*break*/, 7];
            case 2:
                if (!!validator_1.default.isEmail(emailId)) return [3 /*break*/, 3];
                res.status(400).json({
                    message: "Invalid email address"
                });
                return [3 /*break*/, 7];
            case 3: return [4 /*yield*/, bcrypt_1.default.genSalt(10)];
            case 4:
                salt = _b.sent();
                return [4 /*yield*/, bcrypt_1.default.hash(password, salt)];
            case 5:
                hashPassword = _b.sent();
                activationCode = crypto_1.default.randomBytes(32).toString('hex');
                newUser = new user_1.User({
                    emailId: emailId,
                    username: username,
                    password: hashPassword,
                    accountActivationCode: activationCode,
                    // set the expiration time to 5 mins from the time the activation code was created
                    accountActivationCodeExpiry: Date.now() + 300000,
                });
                return [4 /*yield*/, newUser.save()];
            case 6:
                result = _b.sent();
                mailService = new mail_service_1.MailService();
                mailSubject = 'Account Activation for zoom clone';
                mailBody = "<div>\n                                <h4>\n                                 To activate the account please \n                                     <a href=\"" + process.env.REQUEST_ORIGIN + "/activate-account/" + activationCode + "\">click here</a>\n                                </h4>\n                             </div>";
                mailTo = emailId;
                // send the mail to the user for account activation
                mailService.sendMail(mailSubject, mailBody, mailTo);
                // send response message 
                res.json({
                    message: "Mail has been sent to   " + mailTo + "  for account activation",
                    data: result
                });
                _b.label = 7;
            case 7: return [3 /*break*/, 9];
            case 8:
                err_2 = _b.sent();
                console.log(err_2);
                // handle error response
                res.status(400).json({
                    message: 'Unable to register user'
                });
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); });
router.post('/activate-account/:activationCode', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var activationCode, user, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                activationCode = req.params.activationCode;
                return [4 /*yield*/, user_1.User.findOne({ $and: [{ accountActivationCode: activationCode }, { accountActivationCodeExpiry: { $gt: Date.now() } }] })
                    // if user exits then activate the user and send response to the user
                ];
            case 1:
                user = _a.sent();
                if (!user) return [3 /*break*/, 3];
                user.isActive = true;
                user.accountActivationCode = '';
                user.accountActivationCodeExpiry = Date.now();
                return [4 /*yield*/, user.save()];
            case 2:
                _a.sent();
                // send reponse for success
                res.json({
                    message: 'Account activated successfully',
                });
                return [3 /*break*/, 4];
            case 3:
                // send response if token is expired
                res.json({
                    message: 'Account activation failed, token expired'
                });
                _a.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                err_3 = _a.sent();
                // handle error response
                res.json({
                    message: 'Account activation failed, token expired'
                });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
router.post('/forgot-password', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var emailId, user, resetToken, mailService, mailSubject, mailBody, mailTo, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                emailId = req.body.emailId;
                return [4 /*yield*/, user_1.User.findOne({ emailId: emailId })];
            case 1:
                user = _a.sent();
                if (!user) return [3 /*break*/, 3];
                resetToken = crypto_1.default.randomBytes(32).toString('hex');
                // save the token in the db for that user.
                user.resetPasswordToken = resetToken;
                user.resetPasswordTokenExpiry = Date.now() + 30000;
                return [4 /*yield*/, user.save()];
            case 2:
                _a.sent();
                mailService = new mail_service_1.MailService();
                mailSubject = 'Reset Password for zoom clone';
                mailBody = "<div>\n                                <h3>Reset Password</h3>\n                                <p>Please click the given link to reset your password <a target=\"_blank\" href=\"" + process.env.REQUEST_ORIGIN + "/reset-password/" + encodeURI(resetToken) + "\"> click here </a></p>\n                            </div>";
                mailTo = user.emailId;
                // send mail for reset password
                mailService.sendMail(mailSubject, mailBody, mailTo);
                // send response to user
                res.json({
                    message: "Mail has been sent to " + user.emailId + "</h4> with further instructions",
                });
                return [3 /*break*/, 4];
            case 3:
                res.status(401).json({
                    message: 'User not found',
                });
                _a.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                err_4 = _a.sent();
                // handle error response
                res.status(400).json({
                    message: 'Unable to recover your password',
                });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
router.post('/reset-password', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, password, confirmPassword, resetToken, user, isPasswordValid, salt, hashPassword, mailService, mailSubject, mailBody, mailTo, err_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 7, , 8]);
                _a = req.body, password = _a.password, confirmPassword = _a.confirmPassword, resetToken = _a.resetToken;
                return [4 /*yield*/, user_1.User.findOne({ resetPasswordToken: resetToken, resetPasswordTokenExpiry: { $gt: Date.now() } })
                    //check if apssword is valid
                ];
            case 1:
                user = _b.sent();
                isPasswordValid = (password === confirmPassword);
                if (!(user && user.isActive && isPasswordValid)) return [3 /*break*/, 5];
                return [4 /*yield*/, bcrypt_1.default.genSalt(10)];
            case 2:
                salt = _b.sent();
                return [4 /*yield*/, bcrypt_1.default.hash(password, salt)];
            case 3:
                hashPassword = _b.sent();
                // save the new password for the user in db 
                user.password = hashPassword;
                user.resetPasswordToken = '';
                user.resetPasswordTokenExpiry = Date.now();
                return [4 /*yield*/, user.save()];
            case 4:
                _b.sent();
                mailService = new mail_service_1.MailService();
                mailSubject = 'Successfully Reset Password for zoom clone';
                mailBody = "<div>\n                 <h3>Your password was changed successfully </h3>\n             </div>";
                mailTo = user.emailId;
                // send mail for account activation
                mailService.sendMail(mailSubject, mailBody, mailTo);
                // send response for user
                res.json({
                    message: "Password was changed successfully, check your mail for confirmation",
                    user: user
                });
                return [3 /*break*/, 6];
            case 5:
                res.status(401).json({
                    message: "Failed to update password, token invalid",
                });
                _b.label = 6;
            case 6: return [3 /*break*/, 8];
            case 7:
                err_5 = _b.sent();
                //handle error response
                res.status(401).json({
                    message: 'Unable to change the password'
                });
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
router.get('/isUserLoggedIn', authentication_service_1.authenticate, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, user, err_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.body.userId;
                return [4 /*yield*/, user_1.User.findOne({ _id: userId })];
            case 1:
                user = _a.sent();
                if (user && user.isActive) {
                    res.json({
                        message: "user is logged in",
                        user: user
                    });
                }
                else {
                    res.status(400).json({
                        message: "User Does not exists",
                    });
                }
                return [3 /*break*/, 3];
            case 2:
                err_6 = _a.sent();
                // handle error response
                res.status(400).json({
                    message: "User Does not exists",
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
