// student.routes.js - Student routes
import express from "express";
import { createStudent, getStudents, getStudentById, updateStudent, deleteStudent } from "../controllers/student.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { validateStudent } from "../middleware/validation.middleware.js";

const router = express.Router();


router.post("/", authenticateUser, validateStudent, createStudent);
router.get("/", authenticateUser, getStudents);
router.get("/:id", authenticateUser, getStudentById);
router.put("/:id", authenticateUser, validateStudent, updateStudent);
router.delete("/:id", authenticateUser, deleteStudent);

export default router;