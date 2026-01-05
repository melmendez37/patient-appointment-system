import express from "express";
import { Appointment } from "../models/appointmentModel.js";
import { User } from "../models/userModel.js";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import { sendAppointmentEmail } from "../utils/emailService.js";

const router = express.Router();

//Create a new appointment (staff) DONE
router.post("/", authMiddleware, authorizeRoles("staff"), async (req, res) => {
  try {
    if (
      !req.body.patientName ||
      !req.body.patientEmail ||
      !req.body.patientPhone ||
      !req.body.doctor ||
      !req.body.startTime
    ) {
      return res.status(400).send({ message: "All fields are required" });
    }

    const doctorExists = await User.findOne({
      _id: req.body.doctor,
      role: "doctor",
    });

    if (!doctorExists) {
      return res.status(400).send({ message: "Doctor ID invalid" });
    }

    if(req.user.doctor.toString() !== req.body.doctor){
      return res.status(403).send({ message: "You can only create appointment for your assigned doctor" });
    }

    const newAppointment = new Appointment({
      patientName: req.body.patientName,
      patientEmail: req.body.patientEmail,
      patientPhone: req.body.patientPhone,
      doctor: req.body.doctor,
      startTime: new Date(req.body.startTime),
      status: req.body.status || "scheduled",
      isWalkIn: req.body.isWalkIn || false,
    });

    const appointment = await Appointment.create(newAppointment);

    //using Nodemailer to send email notification to patient; testing through Gmail + Mailgen
    sendAppointmentEmail({
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      startTime: appointment.startTime,
      status: appointment.status,
      referenceNumber: appointment._id.toString().slice(-6).toUpperCase() // last 6 digits of appointment ID
    }).catch((error) => {
      console.error("Error sending appointment email:", error);
    });

    res.status(201).send(appointment);
  } catch (error) {
    res.status(500).send({ message: "Error creating user", error });
  }
});

//Fetch all appointments assigned to doctor (staff/doctor). admin can view all DONE
router.get(
  "/",
  authMiddleware,
  authorizeRoles("staff", "doctor", "admin"),
  async (req, res) => {
    try {
      let filter = {};

      if (req.user.role === "doctor") {
        filter.doctor = req.user.id;
      } else if (req.user.role === "staff") {
        filter.doctor = req.user.doctor;
      }
      const appointments = await Appointment.find(filter);

      return res.status(200).json({
        role: req.user.role,
        count: appointments.length,
        data: appointments,
      });
    } catch (error) {
      res.status(500).send({ message: "Error fetching appointments", error });
    }
  }
);

//Fetch appointment by ID assigned to doctor (staff/doctor). admin can view all DONE
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("staff", "doctor"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { role, id: userId, doctor } = req.user;

      let filter = { _id: id };

      if (role === "doctor") {
        filter.doctor = userId;
      } else if (role === "staff") {
        filter.doctor = doctor;
      }

      const appointment = await Appointment.findOne(filter);

      if (!appointment) {
        res.status(404).send({ message: "Appointment not found" });
      }

      res.status(200).send(appointment);
    } catch (error) {
      res.status(500).send({ message: "Error fetching appointment", error });
    }
  }
);

//Update appointment by ID (staff/doctor) DONE
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("staff", "doctor"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { role, id: userId, doctor } = req.user;

      let filter = { _id: id };

      if (role === "doctor") {
        filter.doctor = userId;
      } else if (role === "staff") {
        filter.doctor = doctor;
      }

      let updateData = {};

      if (role === "doctor") {
        updateData.status = req.body.status;
      } else if (role === "staff") {
        const allowedUpdates = [
          "patientName",
          "patientEmail",
          "patientPhone",
          "doctor",
          "startTime",
          "status",
          "isWalkIn",
        ];

        allowedUpdates.forEach((field) => {
          if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
          }
        });
      }

      //admin logic (optional)?

      const updatedAppointment = await Appointment.findOneAndUpdate(
        filter,
        updateData,
        { new: true }
      );

      if (!updatedAppointment) {
        return res.status(404).send({ message: "Appointment not found" });
      }

      return res
        .status(200)
        .send({ message: "Appointment updated successfully" });
    } catch (error) {
      res.status(500).send({ message: "Error updating appointment", error });
    }
  }
);

//Delete appointment by ID (staff)
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("staff"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const doctor = req.user.doctor;

      let filter = { _id: id, doctor: doctor };

      const deletedAppointment = await Appointment.findByIdAndUpdate(
        filter,
        {
          isDeleted: true,
          deletedAt: Date().now(),
        },
        { new: true }
      );

      if (!deletedAppointment) {
        return res.status(404).send({ message: "Appointment not found" });
      }

      return res
        .status(200)
        .send({ message: "Appointment deleted successfully" });
    } catch (error) {
      res.status(500).send({ message: "Error updating appointment", error });
    }
  }
);

export default router;
