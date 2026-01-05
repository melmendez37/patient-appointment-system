import mongoose from "mongoose";

const availabilityModel = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dayOfWeek: {
      type: [Number], //0 - SUNDAY, 6 - SATURDAY
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      required: true,
    },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Availability = mongoose.model("Availability", availabilityModel);
