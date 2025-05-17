// enrollment.routes.js - Enrollment routes
import express from "express";
import { enrollStudent, getEnrollments, getEnrollmentById, updateEnrollment, deleteEnrollment } from "../controllers/enrollment.controller.js";
import { authenticateUser, authorizeRole } from "../middleware/auth.middleware.js";
import { validateEnrollment } from "../middleware/validation.middleware.js";


const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Enrollments
 *   description: Student course enrollments
 */

/**
 * @swagger
 * /api/enrollments:
 *   post:
 *     summary: Enroll a student in a course
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *                 format: uuid
 *               courseId:
 *                 type: string
 *                 format: uuid
 *               semester:
 *                 type: string
 *     responses:
 *       201:
 *         description: Enrollment successful
 */


router.post("/", authenticateUser, authorizeRole(["admin", "instructor"]), validateEnrollment, enrollStudent);
router.get("/", authenticateUser, getEnrollments);
router.get("/:id", authenticateUser, getEnrollmentById);
router.put("/:id", authenticateUser, authorizeRole(["admin", "instructor"]), validateEnrollment, updateEnrollment);
router.delete("/:id", authenticateUser, authorizeRole(["admin"]), deleteEnrollment);

export default router;