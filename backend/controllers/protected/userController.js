import mongoose from "mongoose";
import { User } from "../../models/userModel.js";
import bcrypt from "bcrypt";
import { getOrSetCache } from "../../utils/getOrSetCache.js";

export const addNewUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).send({ message: "Admins only" });
    }

    if (req.body.doctors !== undefined) {
      if (req.body.role !== "staff") {
        return res
          .status(400)
          .json({ message: "Only staff can have assigned doctors" });
      }

      if (!Array.isArray(req.body.doctors)) {
        return res.status(400).json({ message: "Doctors must be an array" });
      }

      const foundDoctors = await User.find({
        _id: { $in: req.body.doctors },
        role: "doctor",
      });

      if (foundDoctors.length !== req.body.doctors.length) {
        return res
          .status(400)
          .json({ message: "One or more doctor IDs are invalid" });
      }
    }

    const DEFAULT_PASSWORD = "12345678";
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPassword,
      role: req.body.role,
      isActive: req.body.isActive || false,
      doctors: req.body.role === "staff" ? req.body.doctors || [] : [],
    });

    const user = await User.create(newUser);

    res.status(201).send(user);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error creating user", error: error.message });
    console.log(error.message);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await getOrSetCache(`users:list`, async () => {
      return User.find({}).select("-password");
    });

    return res.status(200).json({
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).send({ message: "Error fetching users", error });
    console.log(error);
  }
};

export const getDoctors = async (req, res) => {
  try {
    const user = req.user;
    let query = {};
    let cacheKey = '';

    if (user.role === "admin") {
      query = { role: "doctor" };
      cacheKey = `doctors:admin`;
    }

    if (user.role === "staff") {
      query = {_id: { $in: user.doctors }};
      cacheKey = `doctors:staff:${user._id}`
    }

    if (user.role === "doctor") {
      query = { _id: user._id };
      cacheKey = `doctors:doctor:${user._id}`
    }

    const doctors = await getOrSetCache(
      cacheKey,
      async () => {
        return User.find(query).select("_id name");
      }
    )

    res.status(200).send(doctors);
  } catch (error) {
    res.status(500).send({ message: "Error fetching doctors", error });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await getOrSetCache(
      `user:${id}`,
      async () => {
        return User.findById(id);
      }
    );

    if (!user) {
      res.status(404).send({ message: "User not found" });
    }

    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({ message: "Cannot view other users" });
    }

    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({ message: "Error fetching user", error:error.message });
    console.log(error)
  }
};

export const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;

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

      if (Object.prototype.hasOwnProperty.call(updateData, "doctors")) {
        if (!Array.isArray(updateData.doctors)) {
          return res
            .status(400)
            .json({ message: "Doctors must be an array of IDs" });
        }

        const invalidIds = updateData.doctors.filter(
          (id) => !mongoose.Types.ObjectId.isValid(id),
        );

        if (invalidIds.length > 0) {
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
          (id) => new mongoose.Types.ObjectId(id),
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
    res
      .status(500)
      .send({ message: "Error updating user", error: error.message });
  }
};

export const changePassword = async (req, res) => {
  console.log(req.body);
  try {
    const { id } = req.params;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (req.user.id !== id) {
      return res
        .status(403)
        .json({ message: "Cannot change other users' passwords" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters long." });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error changing password", error: error.message });
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
      { new: true },
    );

    if (!deletedUser) {
      return res.status(404).send({ message: "User not found" });
    }

    return res.status(200).send({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).send({ message: "Error deleting user", error });
  }
};
