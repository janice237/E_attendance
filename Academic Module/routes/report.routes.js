import express from "express";
import { generateGradeReport, generateAttendanceReport } from "../controllers/report.controller.js";
import { authenticateUser, authorizeRole } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/grades", authenticateUser, authorizeRole(["admin", "instructor", "student"]), generateGradeReport);
router.get("/attendance", authenticateUser, authorizeRole(["admin", "instructor", "student"]), generateAttendanceReport);

export default router;