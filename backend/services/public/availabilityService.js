import { generatePublicAvailableSlots } from "../../utils/generatePublicAvailableSlots.js";
import { Appointment } from "../../models/appointmentModel.js";
import { Availability } from "../../models/availabilityModel.js";


export const getAvailableDays = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const LOOKAHEAD_DAYS = 14;
    const today = new Date();
    const availableDays = [];

    for (let i = 0; i < LOOKAHEAD_DAYS; i++) {
      const date = new Date(today);
      console.log({
        local: date.toString(),
        iso: date.toISOString(),
        dayOfWeek: date.getDay(),
      });
      date.setDate(today.getDate() + i);

      const dayOfWeek = date.getDay();

      //get availability for that day
      const availability = await Availability.findOne({
        doctor: doctorId,
        dayOfWeek: dayOfWeek,
        isAvailable: true,
      });

      if (!availability || !availability.startTime || !availability.endTime)
        continue;

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
        bookedAppointments,
      );

      if (slots.length > 0) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");

        availableDays.push(`${yyyy}-${mm}-${dd}`);
      }
    }

    return res.status(200).json({ availableDays });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching available days", error: error });
    console.log(error);
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
      day, // local midnight
      0,
      0,
      0,
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
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

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
      bookedAppointments,
    );

    res.status(200).json(availableSlots);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching available slots", error: error });
    console.log(error);
  }
};