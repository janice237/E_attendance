export const publishResult = async (req, res) => {
    try {
      const { studentId, examId, score } = req.body;
      const result = await db.Result.create({ studentId, examId, score });
      res.status(201).json({ message: "Result published successfully", result });
    } catch (error) {
      res.status(500).json({ message: "Failed to publish result", error });
    }
  };
  
  export const getResults = async (req, res) => {
    try {
      const results = await db.Result.findAll();
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch results", error });
    }
  };

  export const updateResults = async (req, res) => {
    try {
      const { studentId, examId, score } = req.body;
      const result = await db.Result.findByPk(req.params.id);
      if (!result) {
        return res.status(404).json({ message: "Result not found" });
      }
      result.studentId = studentId;
      result.examId = examId;
      result.score = score;
      await result.save();
      res.json({ message: "Result updated successfully", result });
    } catch (error) {
      res.status(500).json({ message: "Failed to update result", error });
    }
  };
  
  export const deleteResult = async (req, res) => {
    try {
      const result = await db.Result.findByPk(req.params.id);
      if (!result) {
        return res.status(404).json({ message: "Result not found" });
      }
      await result.destroy();
      res.json({ message: "Result deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete result", error });
    }
  };
  