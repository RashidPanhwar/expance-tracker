import { Router } from "express";
import authRoutes from './auth.routes.js';

const router = Router();

// All Authenticated Related Routes
router.use("/auth", authRoutes);

export default router