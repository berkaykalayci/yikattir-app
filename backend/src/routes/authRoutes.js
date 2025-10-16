import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

// Kayıt
router.post("/register", register);

// Giriş
router.post("/login", login);

export default router;
