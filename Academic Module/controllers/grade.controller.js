// grade.controller.js - Grade controller
import db from "../models/index.js";
export const recordGrade = async (req, res) => {
    try {
      const { studentId, courseId, grade, attendance } = req.body;
      const recordedGrade = await db.Grade.create({ studentId, courseId, grade, attendance });
      res.status(201).json({ message: "Grade recorded successfully", recordedGrade });
    } catch (error) {
      res.status(500).json({ message: "Grade recording failed", error });
    }
  };
  
  export const getGrades = async (req, res) => {
    try {
      const grades = await db.Grade.findAll();
      res.json(grades);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch grades", error });
    }
  };

  export const getGradesByCourseId = async (req, res) => {
    try {
      const grades = await db.Grade.findAll({ where: { courseId: req.params.courseId } });
      res.json(grades);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch grades for course", error });
    }
  };

  export const getGradesByStudentId = async (req, res) => {
    try {
      const grades = await db.Grade.findAll({ where: { studentId: req.params.studentId } });
      res.json(grades);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch grades for student", error });
    }
  };

  export const deleteGrade = async (req, res) => {
    try {
      const grade = await db.Grade.findByPk(req.params.id);
      if (!grade) {
        return res.status(404).json({ message: "Grade not found" });
      }
      await grade.destroy();
      res.json({ message: "Grade deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Grade deletion failed", error });
    }
  };

  export const updateGrade = async (req, res) => {
    try {
      const { studentId, courseId, grade, attendance } = req.body;
      const gradeToUpdate = await db.Grade.findByPk(req.params.id);
      if (!gradeToUpdate) {
        return res.status(404).json({ message: "Grade not found" });
      }
      await gradeToUpdate.update({ studentId, courseId, grade, attendance });
      res.json({ message: "Grade updated successfully", gradeToUpdate });
    } catch (error) {
      res.status(500).json({ message: "Grade update failed", error });
    }
  };


  export default { recordGrade, getGrades, getGradesByCourseId, getGradesByStudentId, deleteGrade, updateGrade };
