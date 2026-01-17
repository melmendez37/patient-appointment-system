import mongoose from "mongoose";
import { User } from "../../models/userModel.js";
import bcrypt from "bcrypt";

export const addNewUser = async (req, res) => {
  try {
    if(req.user.role !== "admin"){
      res.status(403).send({ message: "Admins only" });
    }

    if(req.body.doctors !== undefined){
      if(role !== "staff"){
        res.status(400).json({ message: "Only staff can have assigned doctors"})
      }

      if(!Array.isArray(doctors)){
        return res.status(400).json({
          message: "Doctors must be an array",
        });
      }

      const foundDoctors = await User.find({
        _id: { $in: doctors },
        role: "doctor",
      })

      if (foundDoctors.length !== doctors.length) {
        return res.status(400).json({
          message: "One or more doctor IDs are invalid",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPassword,
      role: req.body.role,
      doctors: role === "staff" ? req.body.doctors || [] : [],
    });

    const user = await User.create(newUser);

    res.status(201).send(user);
  } catch (error) {
    res.status(500).send({ message: "Error creating user", error });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    return res.status(200).json({
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).send({ message: "Error fetching users", error });
  }
};

export const getDoctors = async (req, res) => {
  try {
    const user = req.user;
    console.log(user);
    let doctors;

    if(user.role === "admin"){
      doctors = await User.find({ role: "doctor"}).select("_id name");
    }

    if(user.role === "staff"){
      doctors = await User.find({
        _id: { $in: [user.doctor] },
      }).select("_id name")
    }

    if(user.role === "doctor"){
      doctors = await User.find({ _id: user._id }).select("_id name");
    }

    res.status(200).send(doctors);
  } catch (error) {
    res.status(500).send({ message: "Error fetching doctors", error });
  }


}

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      res.status(404).send({ message: "User not found" });
    }

    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({ message: "Cannot view other users" });
    }

    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({ message: "Error fetching user", error });
  }
};

export const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    let updateData = {};

    if (req.body.password) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      req.body.password = hashedPassword;
    }

    if (role === "admin") {
      const allowedUpdates = [
        "name",
        "email",
        "phone",
        "role",
        "doctors",
        "isActive",
        "deletedAt",
      ];

      allowedUpdates.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(req.body, field)) {
          updateData[field] = req.body[field];
        }
      });

      if(Object.prototype.hasOwnProperty.call(updateData, "doctors")){
        if(!Array.isArray(updateData.doctors)){
          return res
            .status(400)
            .json({ message: "Doctors must be an array of IDs" });
        }

        const invalidIds = updateData.doctors.filter(
          (id) => !mongoose.Types.ObjectId.isValid(id)
        );

        if(invalidIds.length > 0){
          return res.status(400).json({
            message: "Invalid doctor ObjectId format",
            invalidIds,
          });
        }

        const doctorsFound = await User.find({
          _id: { $in: updateData.doctors },
          role: "doctor",
        }).select("_id");

        if (doctorsFound.length !== updateData.doctors.length) {
          return res.status(400).json({
            message: "One or more users are not doctors",
          });
        }

        // cast ONCE
        updateData.doctors = updateData.doctors.map(
          (id) => new mongoose.Types.ObjectId(id)
        );
      }
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).send({ message: "User not found" });
    }

    return res
      .status(200)
      .send({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).send({ message: "Error updating user", error });
  }
};

export const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndUpdate(
      id,
      {
        isActive: false,
        deletedAt: Date().now(),
      },
      { new: true }
    );

    if (!deletedUser) {
      return res.status(404).send({ message: "User not found" });
    }

    return res.status(200).send({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).send({ message: "Error deleting user", error });
  }
};
