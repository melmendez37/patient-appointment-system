import { User } from "../../models/userModel.js";
import bcrypt from "bcrypt";

export const addNewUser = async (req, res) => {
  try {
    const doctorAllowedRoles = ["staff"];

    if (req.body.doctor) {
      if (!doctorAllowedRoles.includes(req.body.role)) {
        return res
          .status(400)
          .send({ message: `${req.body.role} cannot have a doctor assigned` });
      }

      const docExists = await User.findOne({
        _id: req.body.doctor,
        role: "doctor",
      });
      if (!docExists) {
        res.status(400).send({ message: "Doctor not found or invalid role" });
      }
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: hashedPassword,
      role: req.body.role,
      doctor: req.body.doctor || null,
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
    if (req.body.password) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      req.body.password = hashedPassword;
    }

    const { id } = req.params;
    const { role, id: userId } = req.user;

    let updateData = {};

    if (role === "admin") {
      const allowedUpdates = [
        "name",
        "email",
        "phone",
        "role",
        "doctor",
        "isActive",
        "deletedAt",
      ];

      allowedUpdates.forEach((field) => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });
      console.log("passed by admin");
    } else {
      //non-admin
      if (id !== userId) {
        return res.status(403).json({ message: "Cannot edit other users" });
      }

      const allowedUpdates = ["name", "email", "phone", "password"];
      const forbiddenUpdates = ["role", "isActive", "doctor", "deletedAt"];

      const attemptedForbiddenUpdates = forbiddenUpdates.filter(
        (f) => f in req.body
      );

      if (attemptedForbiddenUpdates.length > 0) {
        return res.status(403).json({
          message: `Cannot update fields: ${attemptedForbiddenUpdates.join(
            ", "
          )}`,
        });
      }

      allowedUpdates.forEach((field) => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });
      console.log(updateData);
    }

    if (role !== "admin") {
      ["role", "isActive", "doctor", "deletedAt"].forEach((field) => {
        if (field in updateData) delete updateData[field];
      });
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).send({ message: "User not found" });
    }

    return res
      .status(200)
      .send({ message: "User updated successfully" + updatedUser });
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
