import express from "express";
import {signup, login, getUserById} from "../controllers/auth.controler.js";
import { authMiddleware, loginMidleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", loginMidleware, login);
router.get("/get-user/:id", authMiddleware, getUserById)

export default router;