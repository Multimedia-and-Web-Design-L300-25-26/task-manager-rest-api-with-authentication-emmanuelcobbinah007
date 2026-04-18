import express from "express";
import Task from "../models/Task.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware
router.use(authMiddleware);

// POST /api/tasks
router.post("/", async (req, res) => {
  const { title, description } = req.body;

  // - Validate input
  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  // - Create task
  const newTask = new Task({
    title,
    description,
    owner: req.user._id
  });

  // - Attach owner = req.user._id
  await newTask.save();
  res.status(201).json(newTask);
});

// GET /api/tasks
router.get("/", async (req, res) => {

  // - Return only tasks belonging to req.user
  const tasks = await Task.find({ owner: req.user._id });
  res.json(tasks);
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res) => {

  // - Check ownership
  const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  
  // - Delete task
  await Task.deleteOne({ _id: req.params.id, owner: req.user._id });
  res.json({ message: "Task deleted successfully" });
});

export default router;