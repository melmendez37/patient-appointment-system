import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../../models/userModel.js";

export const login = async (req, res) => {
    console.log("Auth route passed")
  try {
    //Authenticate login
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      res.status(404).send({ message: "Account not found." });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).send({ message: "Password does not match." });
    }

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
    res.status(500).send({ message: "Error logging in", error });
  }
}