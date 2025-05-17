import db from "../models/index.js";

export const generateGradeReport = async (req, res) => {
  try {
    if (req.user.role === "student") {
      const grades = await db.Grade.findAll({ where: { studentId: req.user.id }, include: [db.Course] });
      return res.json(grades);
    }
    const grades = await db.Grade.findAll({ include: [db.Student, db.Course] });
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate grade report", error });
  }
};

export const generateAttendanceReport = async (req, res) => {
  try {
    if (req.user.role === "student") {
      const attendance = await db.Attendance.findAll({ where: { studentId: req.user.id }, include: [db.Course] });
      return res.json(attendance);
    }
    const attendance = await db.Attendance.findAll({ include: [db.Student, db.Course] });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate attendance report", error });
  }
};
