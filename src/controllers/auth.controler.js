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

