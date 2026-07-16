import express from "express";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { sendMail } from "./mail.service.js";
import OTP, { otpSchema } from "../models/otp.model.js";

export const login = async ({ email, password }) => {
    if (!email || !password) {
        throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new Error("Invalid email or password");
    }

    if (user.lockUntil && user.lockUntil >= new Date()) {
        throw new Error("Account is locked for 5 minutes. Please try again later.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        if (user.loginAttempts >= 5) {
            await User.updateOne(
                { _id: user._id },
                {
                    $set: {
                        lockUntil: new Date(Date.now() + 5 * 60 * 1000), // Lock for 5 minutes
                    }
                }
            )
        } else {
            await User.updateOne(
                { _id: user._id },
                {
                    $inc: { loginAttempts: 1 },
                }
            )
        }
        const error = new Error("Password is incorrect");
        error.statusCode = 401;

        throw error;
    }

    const accessToken = generateAccessToken({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
    });

    user.lastLogin = new Date();
    await User.updateOne(
        { _id: user._id },
        {
            $set: {
                loginAttempts: 0,
                lockUntil: null,
            }
        }
    )
    await user.save();


    return {
        user: user,
        accessToken,
    }

}


export const signup = async ({ firstName, lastName, email, password }) => {

    if (!firstName || !lastName || !email || !password) {
        throw new Error("All fields are required");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error("User already exists")
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
    });

    const accessToken = generateAccessToken({ id: newUser._id, email: newUser.email });

    const user = await User.findById(newUser._id);
    // await newUser.save();

    return {
        user: user,
        accessToken,
    }
}

export const getUserById = async (id) => {
    console.log("id in service", id)
    const user = await User.findById(id);

    if(!user) {
        throw new Error("User Not Found");
    }

    const token = generateAccessToken({id: user._id, email: user.email})
    
    return {user, token}

} 

export const forgetPassword = async (email) => {
    if(!email) {
        throw new Error("Email is Required")
    }
    const user = await User.findOne(email);

    if(!user) {
        throw new Error("Email Not Exist")
    }

    const accessToken = generateAccessToken({ id: user._id, email: user.email });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteOne({userId: user._id});

    await OTP.create({
        userId: user._id,
        otp: otp,
        expireAt: new Date(Date.now() + 2 * 60 * 1000)
    })

    await sendMail({
        to: user.email,
        subject: "Password Reset OTP",
        text: `Your password reset OTP is ${otp}. This OTP is valid for 10 minutes.`,
    });



    console.log("User", user);

    return {
        accessToken
    }
}

export const verifyOTP = async ({userId, otp}) => {
    const otpRecord = await OTP.findOne({userId});

    console.log("DB OTP:", otpRecord.otp, typeof otpRecord.otp);
    console.log("User OTP:", otp, typeof otp);

    if(!otpRecord) {
        throw new Error("OTP not found");
    }

    if(otpRecord.expireAt.getTime() < Date.now()) {
        throw new Error("OTP has been Expired");
    };

    if(String(otpRecord.otp) !== String(otp)) {
        throw new Error("Invalid OTP");
    }

    const token = generateAccessToken(
        {id: otpRecord.userId}
    )

    await otpRecord.deleteOne();

    return {
        success: true,
        message: "OTP verified successfully.",
        token
    };
}

export const resetPassword = async ({userId, newPassword}) => {

    if(!newPassword) {
        throw new Error("Password is required");
    }

    const user = await User.findById(userId).select("+password");

    if(!user) {
        throw new Error("User Not Found")
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save()

    console.log("find user", user)
    return {
        success: true,
        message: "Password Update Successfully"
    }
}