import exress from "express";
import * as authService from "../services/auth.service.js";

export const login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        })
    } catch (error) {
        next(error);
    }
}

export const signup = async (req, res, next) => {
    try {
        const result = await authService.signup(req.body);

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

export const verifyEmail = async (req, res, next) => {
    try {
        const result = await authService.verifyEmail({
            userId: req.body.userId,
            otp: req.body.otp
        });

        return res.status(200).json({
            success: true,
            message: "Email Varified Successfully",
        })
    } catch (error) {
        next(error);
    }
}

export const sendOtp = async (req, res, next) => {
    try {
        const result = await authService.sendOtp(req.body);

        return res.status(200).json({
            success: true,
            message: "OTP Send to the email",
            data: result
        })
    } catch (error) {
        next(error);
    }

}

export const getUserById = async (req, res, next) => {
    try {
        const result = await authService.getUserById(req.user.id);

        return res.status(200).json({
            success: true,
            message: "User Fatched Successfully",
            data: result,
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internel Server Error"
        })
    }



}

export const verifyOTP = async (req, res, next) => {
    try {
        const result = await authService.verifyOTP({
            userId: req.user.id,
            otp: req.body.otp
        })

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully.",
            data: result
        })
    } catch (error) {
        next(error);
    }
}

export const resetPassword = async (req, res, next) => {
    try {
        const result = await authService.resetPassword({
            userId: req.user.id,
            newPassword: req.body.password
        })

        return res.status(201).json({
            success: true,
            message: "Password Update Successfully",
        })
    } catch (error) {
        next(error)
    }

}

export const changePassword = async (req, res, next) => {
    try {
        const result = await authService.changePassword({
            userId: req.user.id,
            oldPassword: req.body.oldPassword,
            newPassword: req.body.newPassword
        })

        return res.status(201).json({
            success: true,
            message: "Password Changed Successfully",
        })
    } catch (error) {
        next(error)
    }
}

