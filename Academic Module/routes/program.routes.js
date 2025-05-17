import express from "express";
import { createProgram, getPrograms } from "../controllers/program.controller.js";
import { authenticateUser, authorizeRole } from "../middleware/auth.middleware.js";

const router = express.Router();


router.post("/", authenticateUser, authorizeRole(["admin"]), createProgram);
router.get("/", authenticateUser, getPrograms);
export default router;