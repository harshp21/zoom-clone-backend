"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// authenticate the user is logged in or not
function authenticate(req, res, next) {
    if (req.headers.authorization) {
        jsonwebtoken_1.default.verify(req.headers.authorization, process.env.ACCESS_TOKEN_SECRET_KEY, function (err, data) {
            if (data) {
                if (data.userId) {
                    req.body.userId = data.userId;
                    req.body.emailId = data.emailId;
                    req.body.username = data.username;
                    next();
                }
                else {
                    res.status(401).json({
                        message: "Not Authorized"
                    });
                }
            }
            else {
                res.status(400).json({
                    message: "User need to sign in"
                });
            }
        });
    }
    else {
        res.status(400).json({
            messsage: "No Token Present"
        });
    }
}
exports.authenticate = authenticate;
