const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  confirmDelete,
} = require("../controllers/userControllers");
//? we could've done that:
//? const userControllers = require('../controllers/userControllers')
const { protected } = require("../middleware/authMiddleware");

//? we could've done that:
//? router.post("/register", userControllers.registerUser);
router.post("/register", registerUser);
router.put("/update/:id", protected, updateUser);
router.post("/login", loginUser);
router.post("/confirmDelete", protected, confirmDelete);
router.delete("/delete/:id", protected, deleteUser);

module.exports = router;
