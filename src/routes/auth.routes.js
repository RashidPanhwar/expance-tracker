import express from "express";
import {signup, login, getUserById, forgetPassword, verifyOTP, resetPassword} from "../controllers/auth.controler.js";
import { authMiddleware, loginMidleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", loginMidleware, login);
router.get("/get-user/:id", authMiddleware, getUserById);
router.post("/forgote-password", loginMidleware, forgetPassword);
router.post("/verify-otp", authMiddleware, verifyOTP);
router.patch("/reset-password", authMiddleware, resetPassword);

export default router;