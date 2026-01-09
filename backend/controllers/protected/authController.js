import jwt from "jsonwebtoken";
import { User } from "../../models/userModel.js";

export const login = async (req, res) => {
    console.log("Auth route passed")
  try {
    const { email, password } = req.body;

    const user = await User.login(email, password);

    //set up the facts for the token
    const payload = {
        id: user._id,
        role: user.role,
        email: user.email,
    };

    if(user.role === "staff"){
        payload.doctor = user.doctor;
    }

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    res.status(200).send({
        message: "Login successful!",
        token,
        user: {
            id: user._id,
            name: user.name,
            role: user.role,
            email: user.email,
        },
    });
  } catch (error) {
    res.status(500).send({ message: "Error logging in", error: error.message });
  }
}