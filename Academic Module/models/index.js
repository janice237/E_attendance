// academic-module/models/index.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config(); // Correct import for ES modules

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: "mysql", // Change to "mysql" if using MySQL
  logging: false,
}
);

const db = { Sequelize, sequelize };

// Import models using ES module syntax
import UserModel from "./user.model.js";
import CourseModel from "./course.model.js";
import StudentModel from "./student.model.js";
import EnrollmentModel from "./enrollment.model.js";
import GradeModel from "./grade.model.js";
import ExamModel from "./exam.model.js";

// Initialize models
db.User = UserModel(sequelize, Sequelize);
db.Course = CourseModel(sequelize, Sequelize);
db.Student = StudentModel(sequelize, Sequelize);
db.Enrollment = EnrollmentModel(sequelize, Sequelize);
db.Grade = GradeModel(sequelize, Sequelize);
db.Exam = ExamModel(sequelize, Sequelize);

export default db;
