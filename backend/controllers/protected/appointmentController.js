import { User } from "../../models/userModel.js";
import { Appointment } from "../../models/appointmentModel.js";
import { Availability } from "../../models/availabilityModel.js";
import { sendAppointmentEmail } from "../../utils/emailService.js";
import { generateAvailableSlots } from "../../utils/generateAvailableSlots.js";
import { getOrSetCache } from "../../utils/getOrSetCache.js";
import { clearCache } from "../../utils/clearCache.js";

export const createAppointment = async (req, res) => {
  try {
    const doctorExists = await User.findOne({
      _id: req.body.doctor,
      role: "doctor",
    });

    if (!doctorExists) {
      return res.status(400).send({ message: "Doctor ID invalid" });
    }

    if (req.user.role === "staff") {
      const assignedDoctors = req.user.doctors.map((id) => id.toString());
      if (!assignedDoctors.includes(req.body.doctor)) {
        return res.status(403).send({
          message: "You can only create appointments for your assigned doctors",
        });
      }
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

    const slots = generateAvailableSlots(
      targetDate,
      availability.startTime,
      availability.endTime,
      bookedAppointments,
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
      status: req.body.status || "scheduled",
      isWalkIn: req.body.isWalkIn || false,
    });

    const appointment = await Appointment.create(newAppointment);
    appointment.referenceNumber = appointment._id
      .toString()
      .slice(-6)
      .toUpperCase();

    await appointment.save();

    await clearCache([
      `appointments:list:${req.user.id}:${req.user.role}`,
    ]);

    console.log(`appointments:list:${req.user.id}:${req.user.role}`,)


    //using Nodemailer to send email notification to patient; testing through Gmail + Mailgen
    sendAppointmentEmail({
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      startTime: appointment.startTime,
      status: appointment.status,
      referenceNumber: appointment.referenceNumber, // last 6 digits of appointment ID
    }).catch((error) => {
      console.error("Error sending appointment email:", error);
    });

    res.status(201).send(appointment);
  } catch (error) {
    res.status(500).send({ message: "Error creating user", error });
    console.log(error.message)
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "doctor") {
      filter.doctor = req.user.id;
    } else if (req.user.role === "staff") {
      filter.doctor = { $in: req.user.doctors };
    }

    //fetch data from cache/db for fast response time
    const appointments = await getOrSetCache(
      `appointments:list:${req.user.id}:${req.user.role}`,
      async () => {
        return Appointment.find(filter).populate("doctor", "name");
      },
    );

    return res.status(200).json({
      role: req.user.role,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error fetching appointments", error: error.message });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId, doctors } = req.user;
    let filter = { _id: id };

    if (role === "doctor") {
      filter.doctor = { $in: [userId] };
    } else if (role === "staff") {
      filter.doctor = { $in: doctors.map(String) };
    }

    //fetch data from cache/db for fast response time
    const appointment = await getOrSetCache(
      `appointments:detail:${id}`,
      async () => {
        return Appointment.findOne(filter);
      },
    );

    if (!appointment) {
      res.status(404).send({ message: "Appointment not found" });
    }

    res.status(200).send(appointment);
  } catch (error) {
    res.status(500).send({ message: "Error fetching appointment", error });
  }
};

export const updateAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId, doctors } = req.user;
    let filter = { _id: id };

    if (role === "doctor") {
      filter.doctor = { $in: [userId] };
    } else if (role === "staff") {
      filter.doctor = { $in: doctors.map(String) };
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
      { new: true },
    );

     await clearCache([
      `appointments:list:${req.user.id}:${req.user.role}`,
    ]);

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

export const deleteAppointmentById = async (req, res) => {
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
      { new: true },
    );

    await clearCache([
      `appointments:list:${req.user.id}:${req.user.role}`,
    ]);

    if (!deletedAppointment) {
      return res.status(404).send({ message: "Appointment not found" });
    }

    return res
      .status(200)
      .send({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).send({ message: "Error updating appointment", error });
  }
};
