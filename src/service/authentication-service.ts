import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// authenticate the user is logged in or not
function authenticate(req: Request, res: Response, next): void {
    if (req.headers.authorization) {

        jwt.verify(req.headers.authorization, process.env.ACCESS_TOKEN_SECRET_KEY, function (err, data) {
            if (data) {
                if (data.userId) {
                    req.body.userId = data.userId;
                    req.body.emailId = data.emailId;
                    req.body.username = data.username
                    next()
                } else {
                    res.status(401).json({
                        message: "Not Authorized"
                    })
                }

            } else {
                res.status(400).json({
                    message: "User need to sign in"
                })
            }
        })
    } else {
        res.status(400).json({
            messsage: "No Token Present"
        })
    }
}

export { authenticate };