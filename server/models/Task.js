const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    deadline: Date,
    status: {
      type: String,
      enum: ["todo", "in progress", "completed"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    labels: [String],
    attachments: [String],
    subtasks: [
      {
        title: String,
        done: {
          type: Boolean,
          default: false,
        },
      },
    ],
    comments: [
      {
        text: String,
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    activityLog: [
      {
        message: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    reminderMailSent: {
      type: Boolean,
      default: false,
    },
    deadlineGoneMailSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
