import express from "express";
import dotenv from "dotenv";
import { login } from "../controllers/protected/authController.js";

dotenv.config();
const router = express.Router();

router.post("/login", login);

export default router;