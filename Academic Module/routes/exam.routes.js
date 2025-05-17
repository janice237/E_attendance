// exam.routes.js - Exam routes
import express from "express";
import { scheduleExam, getExams, getExamById, updateExam, deleteExam, getExamsByCourseId } from "../controllers/exam.controller.js";
import { authenticateUser, authorizeRole } from "../middleware/auth.middleware.js";
import { validateExam } from "../middleware/validation.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Exams
 *   description: Examination scheduling and management
 */

/**
 * @swagger
 * /api/exams:
 *   post:
 *     summary: Schedule a new exam
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: string
 *                 format: uuid
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Exam scheduled successfully
 */

/**
 * @swagger
 * /api/exams:
 *   get:
 *     summary: Get all scheduled exams
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of exams
 */

router.post("/", authenticateUser, authorizeRole(["admin", "instructor"]), validateExam, scheduleExam);
router.get("/", authenticateUser, getExams);
router.get("/course/:courseId", authenticateUser, getExamsByCourseId);
router.get("/:id", authenticateUser, getExamById);
router.put("/:id", authenticateUser, authorizeRole(["admin", "instructor"]), validateExam, updateExam);
router.delete("/:id", authenticateUser, authorizeRole(["admin"]), deleteExam);

export default router;
