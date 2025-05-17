// course.controller.js - Course controller
import db from "../models/index.js";

export const createCourse = async (req, res) => {
  try {
    const { name, description, credits, instructorId } = req.body;
    const course = await db.Course.create({ name, description, credits, instructorId });
    res.status(201).json({ message: "Course created successfully", course });
  } catch (error) {
    res.status(500).json({ message: "Course creation failed", error });
  }
};

export const getCourses = async (req, res) => {
  try {
    const courses = await db.Course.findAll();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch courses", error });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await db.Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch course", error });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const course = await db.Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    await course.update(req.body);
    res.json({ message: "Course updated successfully", course });
  } catch (error) {
    res.status(500).json({ message: "Course update failed", error });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await db.Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    await course.destroy();
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Course deletion failed", error });
  }
};

export const enrollCourse = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is available from authentication middleware
    const courseId = req.params.id;

    // Check if course exists
    const course = await db.Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if user is already enrolled
    const existingEnrollment = await db.Enrollment.findOne({ where: { userId, courseId } });
    if (existingEnrollment) {
      return res.status(400).json({ message: "User already enrolled in this course" });
    }

    // Enroll user in course
    await db.Enrollment.create({ userId, courseId });
    res.status(201).json({ message: "Enrollment successful" });

  } catch (error) {
    res.status(500).json({ message: "Enrollment failed", error });
  }
};
