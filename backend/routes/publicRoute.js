import express from "express";
import { validateFields } from "../middleware/validateFields.js";
import { createAppointment, verifyAppointmentAccess, getAppointments, updateAppointmentById } from "../controllers/public/publicController.js";

const router = express.Router();

//Create a new appointment
router.post(
  "/add",
  validateFields([
    "patientName",
    "patientEmail",
    "patientPhone",
    "doctor",
    "startTime",
  ]),
  createAppointment
);

//Fetch appointment by verifying email address and reference
router.post("/verify", verifyAppointmentAccess);

//Update appointment by ID
router.put("/update/:id", updateAppointmentById);

export default router;