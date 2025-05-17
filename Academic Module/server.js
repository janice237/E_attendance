// academic-module/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import courseRoutes from "./routes/course.routes.js";
import studentRoutes from "./routes/student.routes.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";
import gradeRoutes from "./routes/grade.routes.js";
import examRoutes from "./routes/exam.routes.js";
import db from "./models/index.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { setupSwagger } from './swagger/swagger.js';
import programRoutes from "./routes/program.routes.js";
import resultRoutes from "./routes/result.routes.js";
import reportRoutes from "./routes/report.routes.js";
// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(errorHandler);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/reports", reportRoutes);

// Call setupSwagger to serve Swagger API docs at /api-docs
setupSwagger(app);

console.log("Swagger UI available at http://localhost:5000/api-docs");

// Database Sync
db.sequelize.sync({ force: false }).then(() => {
  console.log("Database synced.");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
