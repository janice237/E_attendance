// enrollment.controller.js - Enrollment controller
import db from "../models/index.js";

export const enrollStudent = async (req, res) => {
  try {
    const { studentId, courseId, semester } = req.body;
    const enrollment = await db.Enrollment.create({ studentId, courseId, semester });
    res.status(201).json({ message: "Student enrolled successfully", enrollment });
  } catch (error) {
    res.status(500).json({ message: "Enrollment failed", error });
  }
};

export const getEnrollments = async (req, res) => {
  try {
    const enrollments = await db.Enrollment.findAll();
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch enrollments", error });
  }
};

export const getEnrollmentById = async (req, res) => {
  try {
    const enrollment = await db.Enrollment.findByPk(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }
    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch enrollment", error });
  }
};

export const updateEnrollment = async (req, res) => {
  try {
    const { studentId, courseId, semester } = req.body;
    const enrollment = await db.Enrollment.findByPk(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }
    await enrollment.update({ studentId, courseId, semester });
    res.json({ message: "Enrollment updated successfully", enrollment });
  } catch (error) {
    res.status(500).json({ message: "Enrollment update failed", error });
  }
};

export const deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await db.Enrollment.findByPk(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }
    await enrollment.destroy();
    res.json({ message: "Enrollment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Enrollment deletion failed", error });
  }
};

export default { enrollStudent, getEnrollments, getEnrollmentById, updateEnrollment, deleteEnrollment };