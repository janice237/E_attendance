// validation.middleware.js - Validation middleware
import Joi from "joi";

export const validateCourse = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    credits: Joi.number().integer().required(),
    instructorId: Joi.string().uuid().required(),
  });
  validateRequest(req, res, next, schema);
};

export const validateStudent = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    program: Joi.string().required(),
    year: Joi.number().integer().required(),
  });
  validateRequest(req, res, next, schema);
};

export const validateEnrollment = (req, res, next) => {
  const schema = Joi.object({
    studentId: Joi.string().uuid().required(),
    courseId: Joi.string().uuid().required(),
    semester: Joi.string().required(),
  });
  validateRequest(req, res, next, schema);
};

export const validateGrade = (req, res, next) => {
  const schema = Joi.object({
    studentId: Joi.string().uuid().required(),
    courseId: Joi.string().uuid().required(),
    grade: Joi.string().required(),
    attendance: Joi.number().integer().min(0).max(100).required(),
  });
  validateRequest(req, res, next, schema);
};

export const validateExam = (req, res, next) => {
  const schema = Joi.object({
    courseId: Joi.string().uuid().required(),
    date: Joi.date().required(),
    time: Joi.string().required(),
    location: Joi.string().required(),
  });
  validateRequest(req, res, next, schema);
};

const validateRequest = (req, res, next, schema) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};
