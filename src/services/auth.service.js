import express from "express";
import User from "../models/userodel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

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

    // userSchema.pre("save", async function (next) {
    //     if(!this.isModified("password")) return next();
    //     this.password = await bcrypt.hash(this.password, 10);

    //     next();
    // });

    // userSchema.methods.comparePassword = async function(password) {
    //     return await bcrypt.compare(password, this.password);
    // };

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