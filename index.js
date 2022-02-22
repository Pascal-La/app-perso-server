const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const cors = require("cors");

const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");

const connectDB = require("./db");

dotenv.config();
connectDB();
const app = express();

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json({limit: '1000kb'}));
app.use(express.urlencoded({limit: '1000kb'}));
app.use(express.json()); // req.body, to accept JSON Data

app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);

app.listen(5000, () => {
  console.log(`Server is running on port:5000`.yellow.bold);
});
