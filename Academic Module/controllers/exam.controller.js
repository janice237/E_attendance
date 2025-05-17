// exam.controller.js - Exam controller
import db from "../models/index.js";
export const scheduleExam = async (req, res) => {
    try {
      const { courseId, date, time, location } = req.body;
      const exam = await db.Exam.create({ courseId, date, time, location });
      res.status(201).json({ message: "Exam scheduled successfully", exam });
    } catch (error) {
      res.status(500).json({ message: "Exam scheduling failed", error });
    }
  };
  
  export const getExams = async (req, res) => {
    try {
      const exams = await db.Exam.findAll();
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exams", error });
    }
  };

  export const getExamById = async (req, res) => {
    try {
      const exam = await db.Exam.findByPk(req.params.id);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      res.json(exam);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exam", error });
    }
  };

  export const deleteExam = async (req, res) => {
    try {
      const exam = await db.Exam.findByPk(req.params.id);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      await exam.destroy();
      res.json({ message: "Exam deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Exam deletion failed", error });
    }
  };

  export const updateExam = async (req, res) => {
    try {
      const { courseId, date, time, location } = req.body;
      const exam = await db.Exam.findByPk(req.params.id);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      await exam.update({ courseId, date, time, location });
      res.json({ message: "Exam updated successfully", exam });
    } catch (error) {
      res.status(500).json({ message: "Exam update failed", error });
    }
  };

  export const getExamsByCourseId = async (req, res) => {
    try {
      const exams = await db.Exam.findAll({ where: { courseId: req.params.courseId } });
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exams for course", error });
    }
  };
  
  export const getExamsByDate = async (req, res) => {
    try {
      const exams = await db.Exam.findAll({ where: { date: req.params.date } });
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exams for date", error });
    }
  };
  
  export const getExamsByLocation = async (req, res) => {
    try {
      const exams = await db.Exam.findAll({ where: { location: req.params.location } });
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exams for location", error });
    }
  };
  
  export const getExamsByTime = async (req, res) => {
    try {
      const exams = await db.Exam.findAll({ where: { time: req.params.time } });
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exams for time", error });
    }
  };
  
  export const getExamsByCourseIdAndDate = async (req, res) => {
    try {
      const exams = await db.Exam.findAll({ where: { courseId: req.params.courseId, date: req.params.date } });
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exams for course and date", error });
    }
  };

  export const getExamsByCourseIdAndLocation = async (req, res) => {
    try {
      const exams = await db.Exam.findAll({ where: { courseId: req.params.courseId, location: req.params.location } });
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exams for course and location", error });
    }
  };
  
  export const getExamsByCourseIdAndTime = async (req, res) => {
    try {
      const exams = await db.Exam.findAll({ where: { courseId: req.params.courseId, time: req.params.time } });
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exams for course and time", error });
    }
  };
  
  export const getExamsByDateAndLocation = async (req, res) => {
    try {
      const exams = await db.Exam.findAll({ where: { date: req.params.date, location: req.params.location } });
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exams for date and location", error });
    }
  };
  
  export const getExamsByDateAndTime = async (req, res) => {
    try {
      const exams = await db.Exam.findAll({ where: { date: req.params.date, time: req.params.time } });
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exams for date and time", error });
    }
  };

  export const getExamsByLocationAndTime = async (req, res) => {
    try {
      const exams = await db.Exam.findAll({ where: { location: req.params.location, time: req.params.time } });
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exams for location and time", error });
    }
  };

  export const getExamsByCourseIdAndDateAndLocation = async (req, res) => {
    try {
      const exams = await db.Exam.findAll({ where: { courseId: req.params.courseId, date: req.params.date, location: req.params.location } });
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exams for course, date, and location", error });
    }
  };

  export const getExamsByCourseIdAndDateAndTime = async (req, res) => {
    try {
      const exams = await db.Exam.findAll({ where: { courseId: req.params.courseId, date: req.params.date, time: req.params.time } });
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exams for course, date, and time", error });
    }
  };

  export const getExamsByCourseIdAndLocationAndTime = async (req, res) => {
    try {
      const exams = await db.Exam.findAll({ where: { courseId: req.params.courseId, location: req.params.location, time: req.params.time } });
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exams for course, location, and time", error });
    }
  };

  export const getExamsByDateAndLocationAndTime = async (req, res) => {
    try {
      const exams = await db.Exam.findAll({ where: { date: req.params.date, location: req.params.location, time: req.params.time } });
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exams for date, location, and time", error });
    }
  };

  export const getExamsByCourseIdAndDateAndLocationAndTime = async (req, res) => {
    try {
      const exams = await db.Exam.findAll({ where: { courseId: req.params.courseId, date: req.params.date, location: req.params.location, time: req.params.time } });
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exams for course, date, location, and time", error });
    }
  };

  export default {
    scheduleExam,
    getExams,
    getExamById,
    updateExam,
    deleteExam,
    getExamsByCourseId,
    getExamsByCourseIdAndDate,
    getExamsByCourseIdAndTime,
    getExamsByDateAndLocation,
    getExamsByDateAndTime,
    getExamsByLocationAndTime,
    getExamsByCourseIdAndDateAndLocation,
    getExamsByCourseIdAndDateAndTime,
    getExamsByCourseIdAndLocationAndTime,
    getExamsByDateAndLocationAndTime,
    getExamsByCourseIdAndDateAndLocationAndTime
  };