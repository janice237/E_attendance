/*
import express from 'express';
import { Result, Attendance } from '../models/exam.js';
import { generateCSV } from '../utils/csvHelper.js'; // Assuming you have a CSV helper function

const router = express.Router();

// Generate grade report
router.get('/grades', async (req, res) => {
  try {
    const results = await Result.findAll();
    const csvData = generateCSV(results); // Generate CSV data
    res.header('Content-Type', 'text/csv');
    res.attachment('grade_report.csv');
    res.send(csvData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Generate attendance report
router.get('/attendance', async (req, res) => {
  try {
    const attendance = await Attendance.findAll();
    const csvData = generateCSV(attendance); // Generate CSV data
    res.header('Content-Type', 'text/csv');
    res.attachment('attendance_report.csv');
    res.send(csvData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
*/

// result.routes.js - Result routes
import express from "express";
import { publishResult, getResults } from "../controllers/result.controller.js";
import { authenticateUser, authorizeRole } from "../middleware/auth.middleware.js";

const router = express.Router();


router.post("/", authenticateUser, authorizeRole(["admin,instructor"]), publishResult);
router.get("/", authenticateUser, getResults);
export default router;