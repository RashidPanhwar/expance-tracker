import express from "express";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { sendMail } from "./mail.service.js";
import OTP from "../models/otp.model.js";

export const login = async ({ email, password }) => {

    if (!email || !password) {
        throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new Error("Invalid email or password");
    }

    if(user.isVerified !== true) {
        const error = new Error("Please verify your email first.");
        error.statusCode = 403;
        throw error
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

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const token = generateAccessToken({ id: newUser._id, email: newUser.email });

    await OTP.deleteOne({userId: newUser._id});

    await OTP.create({
        userId: newUser._id,
        otp: otp,
        expireAt: new Date(Date.now() + 2 * 60 * 1000)
    })

    await sendMail({
        to: newUser.email,
        subject: "Verification code send to your email",
        text: `Please verify your account by ${otp}`
    })

    return {
        userId: newUser._id
    }
}

export const verifyEmail = async ({userId, otp}) => {
    if(!userId || !otp) {
        throw new Error("UserId and OTP Both Are Required");
    }

    const user = await User.findById(userId);

    if(!user) {
        throw new Error("User Not Found");
    }

    const storedOtp = await OTP.findOne({userId: user._id});

    if(!storedOtp) {
        throw new Error("OTP Mismatch");
    }

    if(storedOtp.expireAt.getTime() < Date.now()) {
        throw new Error("OTP Expired!");
    }

    if(String(storedOtp.otp) !== String(otp)) {
        throw new Error("Please Put Valid OTP");
    }

    await storedOtp.deleteOne();

    user.isVerified = true
    await user.save()

    return {
        success: true,
        message: "OTP Verified Sucessfully"
    }
}

export const getUserById = async (id) => {
    const user = await User.findById(id);

    if(!user) {
        throw new Error("User Not Found");
    }

    const token = generateAccessToken({id: user._id, email: user.email})
    
    return {user, token}

} 

export const sendOtp = async (email) => {

    if(!email) {
        throw new Error("Email is Required")
    }
    const user = await User.findOne(email);

    if(!user) {
        throw new Error("Email Not Exist")
    }

    const token = generateAccessToken({ id: user._id, email: user.email });

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

    return {
        token
    }
}

export const verifyOTP = async ({userId, otp}) => {
    const otpRecord = await OTP.findOne({userId});

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

    return {
        success: true,
        message: "Password Update Successfully"
    }
}

export const changePassword = async ({userId, oldPassword, newPassword}) => {
    
    const user = await User.findById(userId).select("+password");

    if(!user) {
        throw new Error("User not found");
    };

    const isPasswordValid = bcrypt.compare(oldPassword, user.password);

    if(!isPasswordValid) {
        throw new Error("Wrong Password");
    }

    const updatedPassword = await bcrypt.hash(newPassword, 10)

    user.password = updatedPassword
    await user.save();

    return {
        success: true,
        message: "Password Update Successfully"
    }
}