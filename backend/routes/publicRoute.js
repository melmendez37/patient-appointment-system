import express from "express";
import { validateFields } from "../middleware/validateFields.js";
import { createAppointment, getAppointmentById, getAppointments, updateAppointmentById, viewAppointmentByEmail } from "../controllers/public/publicController.js";

const router = express.Router();

//Create a new appointment
router.post(
  "/",
  validateFields([
    "patientName",
    "patientEmail",
    "patientPhone",
    "doctor",
    "startTime",
  ]),
  createAppointment
);

//Fetch all appointments (DELETE WHEN DONE TESTING)
router.get("/", getAppointments);

//Fetch appointment by verifying email address and reference
router.get("/lookup", viewAppointmentByEmail);

//Update appointment by ID
router.put("/:id", updateAppointmentById);

export default router;