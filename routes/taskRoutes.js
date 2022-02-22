const express = require("express");
const {
  addTask,
  getOneTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controllers/taskControllers");
const { protected } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protected, addTask).get(protected, getTasks);
router
  .route("/:id")
  .get(protected, getOneTask)
  .put(protected, updateTask)
  .delete(protected, deleteTask);

module.exports = router;
