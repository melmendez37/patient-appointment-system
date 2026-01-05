import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import userRouter from "./routes/userRoutes.js";
import appointmentRouter from "./routes/appointmentRoutes.js"
import availabilityRouter from "./routes/availabilityRoutes.js"
import authRoute from "./routes/authRoute.js"
import publicRoute from "./routes/publicRoute.js"

const app = express();
app.use(cors());
app.use(express.json());
app.use("/users", userRouter);
app.use("/appointments", appointmentRouter);
app.use("/schedules", availabilityRouter);
app.use("/auth", authRoute);
app.use("/public/appointments", publicRoute);

const port = process.env.PORT;
const db = process.env.MONGODB_URL;

app.get("/", (req, res) => {
  console.log(res);
  return res.status(200).send("Welcome to RoundBout");
});

mongoose
  .connect(db)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
