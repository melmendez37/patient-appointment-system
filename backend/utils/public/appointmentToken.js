import jwt from "jsonwebtoken";

export const generateAppointmentToken = (appointment) => {
  return jwt.sign(
    {
      id: appointment._id,
      scope: "apppointment:public",
      referenceNumber: appointment.referenceNumber,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );
};