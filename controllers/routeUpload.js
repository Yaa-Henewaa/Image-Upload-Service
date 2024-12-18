const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const { sendToQueue } = require("../utils/rabbitmq");

router.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  try {
    // Creating a job to send to RabbitMQ
    const job = {
      filePath: req.file.path, 
      fileName: req.file.originalname, 
      application: "blog-app",
    };

    // Send job to RabbitMQ
    await sendToQueue("image_upload_queue", job);

    res.status(202).json({
      success: true,
      message: "Image queued for upload",
      job: job,
    });
  } catch (error) {
    console.error("Error sending job to RabbitMQ:", error);
    res.status(500).json({
      success: false,
      message: "Failed to queue image",
    });
  }
});

module.exports = router;
