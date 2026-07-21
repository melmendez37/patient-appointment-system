import { User } from "../../models/userModel.js";
import { getOrSetCache } from "../../utils/getOrSetCache.js";

export const getDoctors = async (req, res) => {
  try {
    const doctors = await getOrSetCache("doctors", async () => {
      return User.find({ role: "doctor" }).select("_id name");
    });

    return res.status(200).send(doctors);
  } catch (error) {
    res.status(500).send({ message: "Error fetching doctors", error: error.message });
  }
};