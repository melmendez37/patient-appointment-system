import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import { validateFields } from "../middleware/validateFields.js";
import {
  addNewUser,
  deleteUserById,
  getAllUsers,
  getDoctors,
  getUserById,
  updateUserById,
} from "../controllers/protected/userController.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  validateFields(["name", "email", "phone", "password", "role"]),
  addNewUser
);

router.get("/", authMiddleware, authorizeRoles("admin"), getAllUsers);

router.get(
  "/doctors",
  authMiddleware,
  authorizeRoles("admin", "staff", "doctor"),
  getDoctors
);

router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "staff", "doctor"),
  getUserById
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "staff", "doctor"),
  updateUserById
);

router.delete("/:id", authMiddleware, authorizeRoles("admin"), deleteUserById);

export default router;
