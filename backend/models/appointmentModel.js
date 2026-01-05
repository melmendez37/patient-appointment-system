import mongoose from "mongoose";

const appointmentModel = new mongoose.Schema(
  {
    patientName: { type: String, required: true },
    patientEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    patientPhone: { type: String, required: true },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "no-show"],
      default: "scheduled",
      required: false
    },
    referenceNumber : { type: String, required: false },
    isWalkIn: { type: Boolean, default: false, required: false },
    isDeleted: { type: Boolean, default: false, required: false},
    deletedAt: { type: Date, default: null, required: false },
  },
  { timestamps: true }
);

export const Appointment = mongoose.model("Appointment", appointmentModel);
