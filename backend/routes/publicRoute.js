import express from "express";
import { User } from "../models/userModel.js";
import { Appointment } from "../models/appointmentModel.js";

const router = express.Router();

//Create a new appointment
router.post("/", async (req, res) => {
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

    const newAppointment = new Appointment({
      patientName: req.body.patientName,
      patientEmail: req.body.patientEmail,
      patientPhone: req.body.patientPhone,
      doctor: req.body.doctor,
      startTime: new Date(req.body.startTime),
      status: "scheduled",
      isWalkIn: false,
    });

    const appointment = await Appointment.create(newAppointment);

    res.status(201).send(appointment);
  } catch (error) {
    res.status(500).send({ message: "Error creating user", error });
  }
});

//Fetch all appointments (DELETE WHEN DONE TESTING)
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find({});

    return res.status(200).json({
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    res.status(500).send({ message: "Error fetching appointments", error });
  }
});

//Fetch appointment by verifying email address and reference
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      res.status(404).send({ message: "Appointment not found" });
    }

    res.status(200).send(appointment);
  } catch (error) {
    res.status(500).send({ message: "Error fetching appointment", error });
  }
});

//Update appointment by ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      req.body
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
});

export default router;
