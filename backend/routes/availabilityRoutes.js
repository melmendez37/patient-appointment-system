import express from "express";
import { Availability } from "../models/availabilityModel.js";
import { Appointment } from "../models/appointmentModel.js";
import { User } from "../models/userModel.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
const router = express.Router();

//Add an availability/schedule (staff/admin) DONE
router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin", "staff"),
  async (req, res) => {
    try {
      if (
        !req.body.doctor ||
        !req.body.dayOfWeek ||
        !req.body.startTime ||
        !req.body.endTime ||
        !req.body.isAvailable
      ) {
        return res.status(400).send({ message: "All fields are required" });
      }

      const { role } = req.user;

      const doctorExists = await User.findOne({
        _id: req.body.doctor,
        role: "doctor",
      });

      if (!doctorExists) {
        return res.status(400).send({ message: "Doctor ID invalid" });
      }

      if (role !== "admin") {
        if (req.user.doctor.toString() !== req.body.doctor) {
          return res
            .status(403)
            .send({
              message: "You can only add schedule for your assigned doctor",
            });
        }
      }

      const newAvailability = new Availability({
        doctor: req.body.doctor,
        dayOfWeek: req.body.dayOfWeek,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        isAvailable: req.body.isAvailable,
      });

      const availability = await Availability.create(newAvailability);

      res.status(201).send(availability);
    } catch (error) {
      res.status(500).send({ message: "Error adding schedule", error });
    }
  }
);

//get schedule of assigned doctor (all users) DONE
router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin", "staff", "doctor"),
  async (req, res) => {
    try {
      let filter = {};

      if (req.user.role === "doctor") {
        filter.doctor = req.user.id;
      } else if (req.user.role === "staff") {
        filter.doctor = req.user.doctor;
      }

      const availabilities = await Availability.find(filter);

      return res.status(200).json({
        count: availabilities.length,
        data: availabilities,
      });
    } catch (error) {
      res.status(500).send({ message: "Error fetching schedules", error });
    }
  }
);

//get specific schedule of assigned doctor (all users) DONE
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "staff", "doctor"),
  async (req, res) => {
    try {
      const { id } = req.params;
      let filter = { _id: id };

      if (req.user.role === "doctor") {
        filter.doctor = req.user.id;
      } else if (req.user.role === "staff") {
        filter.doctor = req.user.doctor;
      }
      const availability = await Availability.findOne(filter);

      if (!availability) {
        res.status(404).send({ message: "Schedule not found" });
      }

      res.status(200).send(availability);
    } catch (error) {
      res.status(500).send({ message: "Error fetching schedule", error });
    }
  }
);

//get api for available slots
router.get(
  "/:doctorId/available-slots",
  authMiddleware,
  authorizeRoles("admin", "staff", "doctor"),
  async (req, res) => {
    try {
      const { doctorId } = req.params;
      const { date } = req.query;

      if (!date) {
        return res.status(400).send({ message: "Date is required" });
      }

      if (req.user.role === "doctor" && req.user.id !== doctorId) {
        return res.status(403).send({ message: "Access denied" });
      }

      if (req.user.role === "staff" && req.user.doctor !== doctorId) {
        return res.status(403).send({ message: "Access denied" });
      }

      const targetDate = new Date(date);
      const dayOfWeek = targetDate.getDay();

      //get availability for that day
      const availability = await Availability.findOne({
        doctor: doctorId,
        dayOfWeek: dayOfWeek,
        isAvailable: true,
      });

      if (!availability) {
        return res
          .status(404)
          .send({ message: "No available slots for this date" });
      }

      //get booked appointments for that day
      const bookedAppointments = await Appointment.find({
        doctor: doctorId,
        startTime: { $in: slots },
        status: "scheduled",
      });

      
      res.status(200).json( availableSlots );
    } catch (error) {
      res
        .status(500)
        .send({ message: "Error fetching available slots", error });
    }
  }
);

//Edit schedule (staff/admin/doctor) DONE
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("staff", "admin", "doctor"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { role, id: userId, doctor } = req.user;

      let filter = { _id: id };

      if (role !== "admin") {
        if (role === "doctor") {
          filter.doctor = userId;
        } else if (role === "staff") {
          filter.doctor = doctor;
        }
      }

      const updatedAvailability = await Availability.findOneAndUpdate(
        filter,
        req.body,
        { new: true }
      );

      if (!updatedAvailability) {
        return res.status(404).send({ message: "Schedule not found" });
      }

      return res.status(200).send({ message: "Schedule updated successfully" });
    } catch (error) {
      res.status(500).send({ message: "Error editing schedule", error });
    }
  }
);

//delete schedule (staff/admin)
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "staff"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { role, doctor, id: userId } = req.user;

      let filter = { _id: id };

      if (role !== "admin") {
        filter.doctor = doctor;
      }

      const deletedAvailability = await Availability.findByIdAndUpdate(filter, {
        isAvailable: false,
        deletedAt: Date().now(),
      });

      if (!deletedAvailability) {
        return res.status(404).send({ message: "Schedule not found" });
      }

      return res.status(200).send({ message: "Schedule deleted successfully" });
    } catch (error) {
      res.status(500).send({ message: "Error deleting schedule", error });
    }
  }
);

export default router;
