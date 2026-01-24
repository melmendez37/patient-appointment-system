import { User } from "../../models/userModel.js";
import { Availability } from "../../models/availabilityModel.js";
import { Appointment } from "../../models/appointmentModel.js";
import { generateAvailableSlots } from "../../utils/generateAvailableSlots.js";

export const addAvailability = async (req, res) => {
  try {
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
        return res.status(403).send({
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
};

export const getAvailabilities = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "doctor") {
      filter.doctor = req.user.id;
    } else if (req.user.role === "staff") {
      filter.doctor = req.user.doctors;
    }

    const availabilities = await Availability.find(filter).populate("doctor", "name");

    return res.status(200).json({
      count: availabilities.length,
      data: availabilities,
    });
  } catch (error) {
    res.status(500).send({ message: "Error fetching schedules", error });
  }
};

export const getAvailabilityById = async (req, res) => {
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
};

export const getAvailableDays = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const allowedDoctorsId = req.user.doctors?.map(String);

    if (req.user.role === "doctor" && req.user.id.toString() !== doctorId) {
      return res.status(403).send({ message: "Access denied" });
    }

    if (req.user.role === "staff" && !allowedDoctorsId.includes(doctorId)) {
      return res.status(403).send({ message: "Access denied" });
    }

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

      const slots = generateAvailableSlots(
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

    const allowedDoctorsId = req.user.doctors.map(String);

    if (!date) {
      return res.status(400).send({ message: "Date is required" });
    }

    if (req.user.role === "doctor" && req.user.id.toString() !== doctorId) {
      return res.status(403).send({ message: "Access denied" });
    }

    if (req.user.role === "staff" && !allowedDoctorsId.includes(doctorId)) {
      return res.status(403).send({ message: "Access denied" });
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

    const availableSlots = generateAvailableSlots(
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

export const updateAvailability = async (req, res) => {
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
};

export const deleteAvailability = async (req, res) => {
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
};
