import { User } from "../../models/userModel.js";
import { Appointment } from "../../models/appointmentModel.js";
import { sendAppointmentEmail } from "../../utils/emailService.js";
import { Availability } from "../../models/availabilityModel.js";
import { generatePublicAvailableSlots } from "../../utils/generatePublicAvailableSlots.js";
import jwt from "jsonwebtoken";
import { getOrSetCache } from "../../utils/getOrSetCache.js";

export const createAppointment = async (req, res) => {
    try {
      const doctorExists = await User.findOne({
        _id: req.body.doctor,
        role: "doctor",
      });

      if (!doctorExists) {
        return res.status(400).send({ message: "Doctor ID invalid" });
      }

      //appointment should be created 24 or more hours in advance
      const now = new Date();
      const diffInMs = new Date(req.body.startTime) - now;
      const diffInHours = diffInMs / (1000 * 60 * 60);
      if (diffInHours < 24) {
        return res
          .status(400)
          .send({ message: "Appointments must be booked at least 24 hours in advance" });
      }

      const targetDate = new Date(req.body.startTime);
      const dayOfWeek = targetDate.getUTCDay(); // 0 (Sun) - 6 (Sat)

      //GET availability for that doctor on that day
      const availability = await Availability.findOne({
        doctor: req.body.doctor,
        dayOfWeek: dayOfWeek,
        isAvailable: true,
      });

      if (!availability)
        return res
          .status(400)
          .send({ message: "Doctor is not available on the selected time" });

      //GET BOOKED appointments for that doctor on that day
      const startOfDay = new Date(targetDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const bookedAppointments = await Appointment.find({
        doctor: req.body.doctor,
        startTime: { $gte: startOfDay, $lte: endOfDay },
        status: "scheduled",
      });

      const slots = generatePublicAvailableSlots(
        targetDate,
        availability.startTime,
        availability.endTime,
        bookedAppointments
      );

      //check if requested startTime is in availableSlots
      const requestedStartTime = new Date(req.body.startTime);
      if (
        !slots.some((slot) => slot.getTime() === requestedStartTime.getTime())
      ) {
        return res
          .status(400)
          .send({ message: "Requested time slot is not available" });
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
      appointment.referenceNumber = appointment._id.toString().slice(-6).toUpperCase();

      await appointment.save();

      //using Nodemailer to send email notification to patient; testing through Gmail + Mailgen
      sendAppointmentEmail({
        patientName: appointment.patientName,
        patientEmail: appointment.patientEmail,
        startTime: appointment.startTime,
        status: appointment.status,
        referenceNumber: appointment._id.toString().slice(-6).toUpperCase(), // last 6 digits of appointment ID
      }).catch((error) => {
        console.error("Error sending appointment email:", error);
      });

      res.status(201).send(appointment);
    } catch (error) {
      console.log(error)
      res.status(500).send({ message: "Error creating user", error });
    }
  };

export const getAppointmentById = async (req, res) => {
  try {
    //change logic to verify email address and reference number
    const { id } = req.params;
    const appointment = await Appointment.findById(id).populate("doctor", "name email");

    if (!appointment) {
      res.status(404).send({ message: "Appointment not found" });
    }

    res.status(200).send(appointment);
  } catch (error) {
    res.status(500).send({ message: "Error fetching appointment", error });
  }
};

const generateAppointmentToken = (appointment) => {
  return jwt.sign(
    {
      id: appointment._id,
      scope: "apppointment:public",
      referenceNumber: appointment.referenceNumber,
},
process.env.JWT_SECRET,
{ expiresIn: "15m" }
)};

export const verifyAppointmentAccess = async (req, res) => {
    try {
        const { email, ref } = req.body;
        const appointment = await Appointment.findOne({
            patientEmail: email,
            referenceNumber: ref.toUpperCase(),
        });

        if (!appointment) {
            return res.status(404).send({ message: "Appointment not found" });
        }

        const token = generateAppointmentToken(appointment);
        
        res.status(200).send({
          appointment,
          token,
        });
    } catch (error) {
        res.status(500).send({ message: "Error fetching appointment", error });
    }
};

export const updateAppointmentById = async (req, res) => {
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
};

export const getDoctors = async (req, res) => {
  try {
    const doctors = await getOrSetCache("doctors", async () => {
      return User.find({ role: "doctor"}).select("_id name");
    })
    return res.status(200).send(doctors);
  } catch (error) {
    res.status(500).send({ message: "Error fetching doctors", error: error.message });
    console.log(error)
  }
};

export const getAvailableDays = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const LOOKAHEAD_DAYS = 14;
    const today = new Date();
    const availableDays = [];

    for(let i = 0; i < LOOKAHEAD_DAYS; i++){
      const date = new Date(today);
      console.log({
        local: date.toString(),
        iso: date.toISOString(),
        dayOfWeek: date.getDay()
      });
      date.setDate(today.getDate() + i);

      const dayOfWeek = date.getDay();

      //get availability for that day
      const availability = await Availability.findOne({
        doctor: doctorId,
        dayOfWeek: dayOfWeek,
        isAvailable: true,
      });

      if (!availability || !availability.startTime || !availability.endTime) continue;

      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const bookedAppointments = await Appointment.find({
        doctor: doctorId,
        startTime: { $gte: startOfDay, $lte: endOfDay },
        status: "scheduled",
      });

      const slots = generatePublicAvailableSlots(
        date,
        availability.startTime,
        availability.endTime,
        bookedAppointments
      );

      if (slots.length > 0) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0")

        availableDays.push(`${yyyy}-${mm}-${dd}`)
      }
    }

    return res.status(200).json({availableDays});
  } catch (error) {
    res.status(500).json({ message: "Error fetching available days", error:error });
    console.log(error)
  }
};

export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).send({ message: "Date is required" });
    }

    const [year, month, day] = date.split("-").map(Number);

    const targetDate = new Date(
      year,
      month - 1,
      day,     // local midnight
      0, 0, 0
    );

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

    const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
    const endOfDay   = new Date(year, month - 1, day, 23, 59, 59, 999); 

    //get booked appointments for that day
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      startTime: { $gte: startOfDay, $lte: endOfDay },
      status: "scheduled",
    });

    const availableSlots = generatePublicAvailableSlots(
      targetDate,
      availability.startTime,
      availability.endTime,
      bookedAppointments
    );

    res.status(200).json(availableSlots);
  } catch (error) {
    res.status(500).json({ message: "Error fetching available slots", error:error });
    console.log(error)
  }
};

