const Task = require("../models/Task");
const Project = require("../models/Project");

const visibleTaskQuery = async (userId) => {
  const projects = await Project.find({ "members.user": userId }).select("_id");
  const projectIds = projects.map((project) => project._id);

  return {
    $or: [{ user: userId }, { assignedTo: userId }, { project: { $in: projectIds } }],
  };
};

const addActivity = (task, message) => {
  task.activityLog.push({ message });
};

exports.createTask = async (req, res) => {
  try {
    const taskData = { ...req.body };

    if (!taskData.project) {
      delete taskData.project;
    }

    if (!taskData.assignedTo) {
      delete taskData.assignedTo;
    }

    const labels = req.body.labels
      ? req.body.labels.split(",").map((label) => label.trim()).filter(Boolean)
      : [];

    const attachments = req.body.attachments
      ? req.body.attachments.split(",").map((file) => file.trim()).filter(Boolean)
      : [];

    const subtasks = req.body.subtasks
      ? req.body.subtasks
          .split(",")
          .map((title) => ({ title: title.trim() }))
          .filter((item) => item.title)
      : [];

    const task = new Task({
      ...taskData,
      labels,
      attachments,
      subtasks,
      user: req.user.id,
    });

    addActivity(task, "Task created");

    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

exports.getTasks = async (req, res) => {
  try {
    const query = await visibleTaskQuery(req.user.id);

    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;
    if (req.query.project) query.project = req.query.project;

    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: "i" };
    }

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email")
      .populate("user", "name email")
      .populate("project", "name")
      .populate("comments.user", "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ msg: "Task not found" });

    const query = await visibleTaskQuery(req.user.id);
    const allowed = await Task.findOne({ _id: req.params.id, ...query });

    if (!allowed) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    const oldStatus = task.status;
    const oldPriority = task.priority;

    Object.assign(task, req.body);

    if (oldStatus !== task.status) {
      addActivity(task, `Status changed from ${oldStatus} to ${task.status}`);
    }

    if (oldPriority !== task.priority) {
      addActivity(task, `Priority changed from ${oldPriority} to ${task.priority}`);
    }

    await task.save();
    task = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("user", "name email")
      .populate("project", "name")
      .populate("comments.user", "name email");

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
    const query = await visibleTaskQuery(req.user.id);
    const now = new Date();

    const total = await Task.countDocuments(query);

    const completed = await Task.countDocuments({
      ...query,
      status: "completed",
    });

    const todo = await Task.countDocuments({
      ...query,
      status: "todo",
    });

    const inProgress = await Task.countDocuments({
      ...query,
      status: "in progress",
    });

    const overdue = await Task.countDocuments({
      ...query,
      status: { $ne: "completed" },
      deadline: { $lt: now },
    });

    res.json({
      total,
      completed,
      todo,
      inProgress,
      overdue,
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.addComment = async (req, res) => {
  try {
    const query = await visibleTaskQuery(req.user.id);
    const task = await Task.findOne({ _id: req.params.id, ...query });

    if (!task) return res.status(404).json({ msg: "Task not found" });

    task.comments.push({ text: req.body.text, user: req.user.id });
    addActivity(task, "Comment added");
    await task.save();

    const updatedTask = await Task.findById(task._id).populate("comments.user", "name email");
    res.json(updatedTask);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

exports.toggleSubtask = async (req, res) => {
  try {
    const query = await visibleTaskQuery(req.user.id);
    const task = await Task.findOne({ _id: req.params.id, ...query });

    if (!task) return res.status(404).json({ msg: "Task not found" });

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) return res.status(404).json({ msg: "Subtask not found" });

    subtask.done = !subtask.done;
    addActivity(task, `Subtask ${subtask.done ? "completed" : "reopened"}`);
    await task.save();

    res.json(task);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};
