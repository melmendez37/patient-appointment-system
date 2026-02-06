import express from "express";
import { validateFields } from "../middleware/validateFields.js";
import { createAppointment, verifyAppointmentAccess, getAppointmentById, updateAppointmentById, getDoctors, getAvailableDays, getAvailableSlots } from "../controllers/public/publicController.js";
import { requirePublicAppointmentToken } from "../middleware/requirePublicAppointmentToken.js";

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

router.get("/appointments/:id", requirePublicAppointmentToken, getAppointmentById);

//Fetch appointment by verifying email address and reference
router.post("/verify", verifyAppointmentAccess);

//Update appointment by ID
router.put("/update/:id", updateAppointmentById);

//fetching doctors
router.get("/doctors", getDoctors);

//fetching available days
router.get("/schedules/:doctorId/available-days", getAvailableDays);

//fetching available time slots
router.get("/schedules/:doctorId/available-slots", getAvailableSlots);


export default router;