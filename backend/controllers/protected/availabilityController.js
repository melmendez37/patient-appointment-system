import { User } from "../../models/userModel.js";
import { Availability } from "../../models/availabilityModel.js";

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

export const getAvailableSlots = async (req, res) => {
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

    const startOfDay = new Date(
      Date.UTC(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate(),
        0,
        0,
        0
      )
    );
    const endOfDay = new Date(
      Date.UTC(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate(),
        23,
        59,
        59,
        999
      )
    );

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
    res.status(500).send({ message: "Error fetching available slots", error });
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
