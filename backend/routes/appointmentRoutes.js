import {
  createAppointment,
  deleteAppointmentById,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentById,
} from "../controllers/protected/appointmentController.js";
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import { validateFields } from "../middleware/validateFields.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorizeRoles("staff"),
  validateFields([
    "patientName",
    "patientEmail",
    "patientPhone",
    "doctor",
    "startTime",
  ]),
  createAppointment
);

router.get(
  "/",
  authMiddleware,
  authorizeRoles("staff", "doctor", "admin"),
  getAllAppointments
);

router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("staff", "doctor"),
  getAppointmentById
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("staff", "doctor"),
  updateAppointmentById
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("staff"),
  deleteAppointmentById
);

export default router;
