//importing
import express, { Request, Response } from "express";
import { IUser, User } from "../../model/user/user";
import bcrypt from "bcrypt";
import crypto from 'crypto';
import { MailService } from "../../service/mail-service";
import jwt from 'jsonwebtoken';
import validator from 'validator';
import { authenticate } from "../../service/authentication-service";

// router config
const router = express.Router();

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { emailId, password } = req.body;

        // check if email is valid
        if ((!validator.isEmail(emailId))) {
            res.status(400).json({
                message: "Invalid email address"
            });
        }
        // check if user exists
        const user: IUser = await User.findOne({ emailId });

        // check if passwords match
        let isUserAuthenticated: boolean = user && user.isActive && await bcrypt.compare(password, user.password);
        if (isUserAuthenticated) {

            // create a jwt token for the user payload and send it to user
            const token: string = jwt.sign({ userId: user._id, emailId: user.emailId, username: user.username }, process.env.ACCESS_TOKEN_SECRET_KEY, { expiresIn: '1h' });

            // send response to the user
            res.json({
                message: 'User Logged in',
                token,
                user
            })
        } else if (!user.isActive) {

            // send response if the user is not activated
            res.status(401).json({
                status: 'Failed to login',
                message: 'Account is not activated',
            })
        } else {

            // send response if the credentials are invalid
            res.status(401).json({
                status: 'Failed to login',
                message: 'Provided credentials are wrong please verify',
            })
        }
    } catch (err) {
        console.log(err);
        // handle error response
        res.status(400).json({
            message: 'Unable to Login user'
        })
    }
});

// register user
router.post('/sign-up', async (req: Request, res: Response) => {
    try {
        // get details from request
        const { emailId, password, confirmPassword, username } = req.body;

        // check if user exists
        const user: IUser = await User.findOne({ emailId });

        // validate the details send for registration
        if (user) {
            res.status(400).json({
                message: "Email already registered"
            });
        } else if (!validator.isEmail(emailId)) {
            res.status(400).json({
                message: "Invalid email address"
            });
        } else {
            // encrypt the password for security purpose
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);

            // create a random string for activation code
            const activationCode = crypto.randomBytes(32).toString('hex');

            // save details in the db
            const newUser: IUser = new User({
                emailId,
                username,
                password: hashPassword,
                accountActivationCode: activationCode,

                // set the expiration time to 5 mins from the time the activation code was created
                accountActivationCodeExpiry: Date.now() + 300000,
            })
            const result = await newUser.save();

            // Set value to send for account activation
            const mailService = new MailService();
            const mailSubject = 'Account Activation for zoom clone';
            const mailBody = `<div>
                                <h4>
                                 To activate the account please 
                                     <a href="${process.env.REQUEST_ORIGIN}/activate-account/${activationCode}">click here</a>
                                </h4>
                             </div>`;

            const mailTo = emailId;

            // send the mail to the user for account activation
            mailService.sendMail(mailSubject, mailBody, mailTo);

            // send response message 
            res.json({
                message: `Mail has been sent to   ${mailTo}  for account activation`,
                data: result
            })
        }

    } catch (err) {
        console.log(err);
        // handle error response
        res.status(400).json({
            message: 'Unable to register user'
        })
    }
});

router.post('/activate-account/:activationCode', async (req: Request, res: Response) => {
    try {
        const { activationCode } = req.params;

        // check if user exists with that activation code and is expired or not.
        const user: IUser = await User.findOne({ $and: [{ accountActivationCode: activationCode }, { accountActivationCodeExpiry: { $gt: Date.now() } }] })

        // if user exits then activate the user and send response to the user
        if (user) {
            user.isActive = true;
            user.accountActivationCode = '';
            user.accountActivationCodeExpiry = Date.now();
            await user.save();

            // send reponse for success
            res.json({
                message: 'Account activated successfully',
            })
        } else {

            // send response if token is expired
            res.json({
                message: 'Account activation failed, token expired'
            })
        }
    } catch (err) {

        // handle error response
        res.json({
            message: 'Account activation failed, token expired'
        })

    }
})

router.post('/forgot-password', async (req: Request, res: Response) => {
    try {
        const { emailId } = req.body;

        // check if the user exists with the email
        const user = await User.findOne({ emailId });

        if (user) {
            // create a reset password token with expiry time
            const resetToken = crypto.randomBytes(32).toString('hex');

            // save the token in the db for that user.
            user.resetPasswordToken = resetToken;
            user.resetPasswordTokenExpiry = Date.now() + 30000;
            await user.save();

            // send a mail with the reset password link with the reset password token to the user
            const mailService = new MailService();
            const mailSubject = 'Reset Password for zoom clone';
            const mailBody = `<div>
                                <h3>Reset Password</h3>
                                <p>Please click the given link to reset your password <a target="_blank" href="${process.env.REQUEST_ORIGIN}/reset-password/${encodeURI(resetToken)}"> click here </a></p>
                            </div>`;

            const mailTo = user.emailId;

            // send mail for reset password
            mailService.sendMail(mailSubject, mailBody, mailTo);

            // send response to user
            res.json({
                message: `Mail has been sent to ${user.emailId}</h4> with further instructions`,
            })

        } else {
            res.status(401).json({
                message: 'User not found',
            })
        }

    } catch (err) {
        // handle error response
        res.status(400).json({
            message: 'Unable to recover your password',
        })
    }
})

router.post('/reset-password', async (req: Request, res: Response) => {
    try {

        const { password, confirmPassword, resetToken } = req.body;

        // check if the user exists with the given reset token and is not passed expiry time
        const user: IUser = await User.findOne({ resetPasswordToken: resetToken, resetPasswordTokenExpiry: { $gt: Date.now() } })

        //check if apssword is valid
        const isPasswordValid: boolean = (password === confirmPassword);

        // check if the password and confirm password is same and valid
        if (user && user.isActive && isPasswordValid) {

            // encrypt the password for security
            let salt = await bcrypt.genSalt(10);
            let hashPassword = await bcrypt.hash(password, salt);

            // save the new password for the user in db 
            user.password = hashPassword;
            user.resetPasswordToken = '';
            user.resetPasswordTokenExpiry = Date.now();
            await user.save();

            // send a mail to the user on successfully changing the password
            const mailService = new MailService();
            const mailSubject = 'Successfully Reset Password for zoom clone';
            const mailBody = `<div>
                 <h3>Your password was changed successfully </h3>
             </div>`;

            const mailTo = user.emailId;

            // send mail for account activation
            mailService.sendMail(mailSubject, mailBody, mailTo);

            // send response for user
            res.json({
                message: "Password was changed successfully, check your mail for confirmation",
                user
            })
        } else {
            res.status(401).json({
                message: "Failed to update password, token invalid",
            })
        }
    } catch (err) {
        //handle error response
        res.status(401).json({
            message: 'Unable to change the password'
        })
    }
})

router.get('/isUserLoggedIn', authenticate, async (req: Request, res: Response) => {
    try {

        const { userId } = req.body;
        // check if user exists and is activated
        let user: IUser = await User.findOne({ _id: userId });
        if (user && user.isActive) {
            res.json({
                message: "user is logged in",
                user
            })
        } else {
            res.status(400).json({
                message: "User Does not exists",
            })
        }

    } catch (err) {
        // handle error response
        res.status(400).json({
            message: "User Does not exists",
        })
    }
})

export default router;