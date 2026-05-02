const Task = require("../models/Task");

exports.createTask = async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      user: req.user.id,
    });

    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ msg: "Task not found" });

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.json(task);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.deleteTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ msg: "Task not found" });

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    await task.deleteOne();

    res.json({ msg: "Task deleted" });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.getTaskStats = async (req, res) => {
  try {
    const total = await Task.countDocuments({ user: req.user.id });

    const completed = await Task.countDocuments({
      user: req.user.id,
      status: "completed",
    });

    const pending = await Task.countDocuments({
      user: req.user.id,
      status: "pending",
    });

    res.json({
      total,
      completed,
      pending,
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};
