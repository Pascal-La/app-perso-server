const asyncHandler = require("express-async-handler");

const Task = require("../models/taskModel");

//* ======================== ADD TASK ========================

// const addTask = (req, res) => {
//   const { content, completed } = req.body;
//   new Task({ content, completed })
//     .save()
//     // .then(() => res.status(201).json({ message: "Tâche enregistrée" }))
//     .then((task) => res.status(201).json(task))
//     .catch((error) => res.status(400).json({ error }));
// };

const addTask = asyncHandler(async (req, res) => {
  const { content, completed } = req.body;
  if (!content) {
    console.log("Tâche vide");
    return res.sendStatus(400);
  }
  let newTask = {
    content,
    completed,
    //* One user or more per task
    userId: [req.user._id],
    //* One user per task
    // userId: req.user._id,
  };
  try {
    let createTask = await Task.create(newTask);
    createTask = await createTask.populate("userId", "-password");
    res.json(createTask);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//* ======================== GET TASKS ========================

// const getTasks = (req, res) => {
//   Task.find()
//     .then((tasks) => res.status(200).json(tasks))
//     .catch((error) => res.status(400).json({ error }));
// };

const getTasks = asyncHandler(async (req, res) => {
  try {
    const allTasks = await Task.find({
      //* One user or more per task
      userId: { $elemMatch: { $eq: req.user._id } },

      //* One user per task
      // userId: req.user._id,
    });
    res.status(200).json(allTasks);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//* ====================== GET ONE TASK ======================

// const getOneTask = (req, res) => {
//   Task.find({ _id: req.params.id })
//     .then((task) => res.status(200).json(task))
//     .catch((error) => res.status(400).json({ error }));
// };

const getOneTask = asyncHandler(async (req, res) => {
  try {
    const oneTask = await Task.findOne({ _id: req.params.id });
    res.json(oneTask);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//* ======================= UPDATE TASK =======================

const updateTask = (req, res) => {
  Task.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: "Tâche modifiée" }))
    .catch((error) => res.status(400).json({ error }));
};

// const updateTask = asyncHandler(async (req, res) => {
//   const updateOneTask = await Task.findByIdAndUpdate(
//     { _id: req.params.id },
//     { ...req.body },
//     { new: true }
//   );

//   if (!updateOneTask) {
//     res.status(400);
//     throw new Error("Tâche introuvable");
//   } else {
//     res.json(updateOneTask);
//   }
// });

//* ======================= DELETE TASK =======================

const deleteTask = (req, res) => {
  Task.deleteOne({ _id: req.params.id })
    .then(() => {
      res.status(200).json({ message: "Tâche supprimée!" });
    })
    .catch((error) => res.status(400).json({ error }));
};

module.exports = { addTask, getOneTask, getTasks, updateTask, deleteTask };
