require("dotenv").config(); 
const amqplib = require("amqplib");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");
const connectDB = require("../db/Db");
const Image = require("../models/Image");


connectDB();

// Uploading to Cloudinary
const uploadToCloudinary = async (filePath, fileName) => {
  return await cloudinary.uploader.upload(filePath, {
    folder: "blog_images",
    public_id: fileName.split(".")[0],
  });
};

// Worker function
const startWorker = async () => {
  const connection = await amqplib.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const queue = "image_upload_queue";
  await channel.assertQueue(queue, { durable: true });

  console.log("Worker listening for messages...");

  channel.consume(queue, async (message) => {
    if (message) {
      const { filePath, fileName, application } = JSON.parse(
        message.content.toString()
      );

      try {
        console.log(`Uploading ${fileName} to Cloudinary...`);
        const result = await uploadToCloudinary(filePath, fileName);

        console.log(`Upload successful! URL: ${result.secure_url}`);

        // Saving URL to MongoDB
        const newImage = new Image({
          fileName,
          url: result.secure_url,
          application,
        });

        await newImage.save();
        console.log("Image URL saved to MongoDB!");

        // Deleting the temporary local file
        fs.unlinkSync(filePath);

        
        channel.ack(message);
      } catch (error) {
        console.error("Error processing job:", error);
        channel.nack(message, false, true); 
      }
    }
  });
};

startWorker();
