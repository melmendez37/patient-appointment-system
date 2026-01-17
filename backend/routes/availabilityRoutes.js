import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import { validateFields } from "../middleware/validateFields.js";
import { addAvailability, deleteAvailability, getAvailabilities, getAvailabilityById, getAvailableSlots, updateAvailability } from "../controllers/protected/availabilityController.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin", "staff"),
  validateFields([
    "doctor",
    "dayOfWeek",
    "startTime",
    "endTime",
    "isAvailable",
  ]),
  addAvailability
);

router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin", "staff", "doctor"),
  getAvailabilities
);

router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "staff", "doctor"),
  getAvailabilityById
);
// /schedules/:doctorId/available-slots?date=YYYY-MM-DD
router.get(
  "/:doctorId/available-slots",
  authMiddleware,
  authorizeRoles("admin", "staff", "doctor"),
  getAvailableSlots
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("staff", "admin", "doctor"),
  updateAvailability
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "staff"),
  deleteAvailability
);

export default router;
