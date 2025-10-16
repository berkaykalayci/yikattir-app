import express from "express";
import { addSmartAppointment } from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/smart", addSmartAppointment);

export default router;
