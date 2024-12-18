const express = require("express");
require("dotenv").config(); 
const uploadRoute = require("./controllers/routeUpload");
const connectDB = require("./db/Db");
const { connectRabbitMQ } = require("./utils/rabbitmq");

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json()); 


connectDB()
  .then(() => console.log("Database connected successfully"))
  .catch((error) => {
    console.error("Database connection failed:", error.message);
    process.exit(1); 
});

connectRabbitMQ();

// Routes
app.use("/api/users", uploadRoute);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the Image Upload Service!" });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server",
  });
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
