import express from "express";
import {signup, login, getUserById, sendOtp, verifyOTP, resetPassword, changePassword, verifyEmail} from "../controllers/auth.controler.js";
import { authMiddleware, loginMidleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Signup
router.post("/signup", signup);
// Verify Email
router.post("/verify-email", authMiddleware, verifyEmail)

// Reset Password
router.post("/send-otp", loginMidleware, sendOtp);
router.post("/verify-otp", authMiddleware, verifyOTP);
router.patch("/reset-password", authMiddleware, resetPassword);

// Login 
router.post("/login", loginMidleware, login);

// Get User By Id
router.get("/get-user/:id", authMiddleware, getUserById);

// Update Password
router.patch("/change-password", authMiddleware, changePassword);

export default router;