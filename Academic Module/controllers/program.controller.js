// aprogram.controller.js - Program controller
import db from "../models/index.js";

export const createProgram = async (req, res) => {
  try {
    const { name, description } = req.body;
    const program = await db.Program.create({ name, description });
    res.status(201).json({ message: "Program created successfully", program });
  } catch (error) {
    res.status(500).json({ message: "Program creation failed", error });
  }
};

export const getPrograms = async (req, res) => {
  try {
    const programs = await db.Program.findAll();
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch programs", error });
  }
};
