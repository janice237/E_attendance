// course.routes.js - Course routes
import express from "express";
import { createCourse, getCourses, getCourseById, updateCourse, deleteCourse } from "../controllers/course.controller.js";
import { authenticateUser, authorizeRole } from "../middleware/auth.middleware.js";
import { validateCourse } from "../middleware/validation.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management routes
 */

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               credits:
 *                 type: integer
 *               instructorId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Course created successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of courses
 */
router.post("/", authenticateUser, authorizeRole(["admin", "instructor"]), validateCourse, createCourse);
router.get("/", authenticateUser, getCourses);
router.get("/:id", authenticateUser, getCourseById);
router.put("/:id", authenticateUser, authorizeRole(["admin", "instructor"]), validateCourse, updateCourse);
router.delete("/:id", authenticateUser, authorizeRole(["admin"]), deleteCourse);
router.post("/:id/enroll", authenticateUser, enrollCourse);


export default router;