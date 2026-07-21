import { generateAppointmentToken } from "../../utils/public/appointmentToken.js";
import { Appointment } from "../../models/appointmentModel.js";

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