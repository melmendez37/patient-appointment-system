import jwt from "jsonwebtoken";

export const requirePublicAppointmentToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "No token found" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.scope !== "apppointment:public") {
      return res.status(403).send({ message: "Insufficient scope" });
    }

    req.appointmentId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).send({ message: "Invalid token" });
  }
};
