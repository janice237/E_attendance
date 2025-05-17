// student.controller.js - Student controller
export const createStudent = async (req, res) => {
    try {
      const { name, email, program, year } = req.body;
      const student = await db.Student.create({ name, email, program, year });
      res.status(201).json({ message: "Student registered successfully", student });
    } catch (error) {
      res.status(500).json({ message: "Student registration failed", error });
    }
  };
  
  export const getStudents = async (req, res) => {
    try {
      const students = await db.Student.findAll();
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students", error });
    }
  };

  export const getStudentById = async (req, res) => {
    try {
      const student = await db.Student.findByPk(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch student", error });
    }
  };

  export const updateStudent = async (req, res) => {
    try {
      const student = await db.Student.findByPk(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      const { name, email, program, year } = req.body;
      await student.update({ name, email, program, year });
      res.json({ message: "Student updated successfully", student });
    } catch (error) {
      res.status(500).json({ message: "Student update failed", error });
    }
  };

  export const deleteStudent = async (req, res) => {
    try {
      const student = await db.Student.findByPk(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      await student.destroy();
      res.json({ message: "Student deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Student deletion failed", error });
    }
  };

  export default { createStudent, getStudents, getStudentById, updateStudent, deleteStudent };
