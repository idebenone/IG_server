import * as dotenv from "dotenv";
dotenv.config();
import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { generateOTP } from "../utility/otp";
import User from '../models/User';

const saltRounds = 10;
const auth = Router();

auth.post("/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) res.status(422).json({ message: "Some parameters are missing" })
    try {
        const user: any = await User.find({ email }).exec();
        const decryptedPass = await bcrypt.compare(password, user[0].password)
        if (user && decryptedPass) {
            const token = jwt.sign(
                { user_id: user[0]._id, time: new Date().getTime() },
                process.env.SECRET_KEY_AUTH || '',
                { expiresIn: '1d' }
            );
            res.status(201).json({ token: token })
        } else {
            res.status(404).json({ message: "User not found" })
        }
    } catch (error) {
        res.status(501).json({ message: "Something went wrong" })
    }
})

auth.post("/register", async (req: Request, res: Response) => {
    const { email, name, username, password } = req.body;
    if (!email || !name || !username || !password) res.status(422).json({ message: "Some parameters are missing" })
    try {
        const user: any = await User.find({ email }).exec();
        if (user.length === 0) {
            const otp = generateOTP();
            const encryptedPass = await bcrypt.hash(password, saltRounds);
            const newUser = new User({ email, name, username, password: encryptedPass, otp });
            await newUser.save();
            return res.status(201).json({ message: "Verification code has been shared" });
        } else if (user[0].is_verified === false) {
            const otp = generateOTP();
            await User.findOneAndUpdate({ email }, { $set: { otp } }).exec();
            return res.status(201).json({ message: "Verification code has been sent" });
        } else {
            return res.status(404).json({ message: "Email already in use" });
        }
    } catch (error) {
        res.status(501).json({ message: "Something went wrong" })
    }
})

auth.post("/verify", async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    if (!email || !otp) res.status(422).json({ message: "Some parameters are missing" })
    try {
        const user: any = await User.find({ email }).exec();
        if (user && user[0].otp === parseInt(otp)) {
            const updateUser = await User.findOneAndUpdate({ email: email }, { $set: { is_verified: true } }, { new: true }).exec()
            const token = jwt.sign(
                { user_id: user._id, time: new Date().getTime() },
                process.env.SECRET_KEY_AUTH || '',
                { expiresIn: '1d' }
            );
            res.status(201).json({ token: token })
        } else {
            res.status(201).json({ message: "Invalid OTP" })
        }
    } catch (error) {
        res.status(501).json({ message: "Something went wrong" })
    }
})

export default auth;