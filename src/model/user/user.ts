import mongoose from 'mongoose';
import validator from "validator";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    emailId: {
        type: String,
        required: true,
        vaidate: {
            validator: (value: string) => {
                return validator.isEmail(value);
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

interface IUser extends mongoose.Document {
    username: string,
    emailId: string,
    password: string,
    accountActivationCode: string,
    accountActivationCodeExpiry: number,
    isActive: boolean,
    resetPasswordToken: string,
    resetPasswordTokenExpiry: number,
};

const User = mongoose.model<IUser>('User', userSchema);

export { User, IUser };