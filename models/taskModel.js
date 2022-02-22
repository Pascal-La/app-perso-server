const mongoose = require("mongoose");

const taskModel = mongoose.Schema(
  {
    content: { type: String, trim: true, required: true },
    completed: { type: Boolean, default: false, required: true },
    //* One user or more per task
    userId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    //* One user per task
    // user: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    // },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskModel);

module.exports = Task;
