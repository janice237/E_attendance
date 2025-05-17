// grade.routes.js - Grade routes
import express from "express";
import { recordGrade, getGrades, deleteGrade, updateGrade, getGradesByCourseId, getGradesByStudentId } from "../controllers/grade.controller.js";
import { authenticateUser, authorizeRole } from "../middleware/auth.middleware.js";
import { validateGrade } from "../middleware/validation.middleware.js";

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Grades
 *   description: Student grades management
 */

/**
 * @swagger
 * /api/grades:
 *   post:
 *     summary: Record a student's grade
 *     tags: [Grades]
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
 *               grade:
 *                 type: string
 *               attendance:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *     responses:
 *       201:
 *         description: Grade recorded successfully
 */

router.post("/", authenticateUser, authorizeRole(["admin", "instructor"]), validateGrade, recordGrade);
router.get("/", authenticateUser, getGrades);
router.get("/student/:studentId", authenticateUser, getGradesByStudentId);
router.get("/course/:courseId", authenticateUser, getGradesByCourseId);
router.put("/:id", authenticateUser, authorizeRole(["admin", "instructor"]), validateGrade, updateGrade);
router.delete("/:id", authenticateUser, authorizeRole(["admin"]), deleteGrade);

export default router;