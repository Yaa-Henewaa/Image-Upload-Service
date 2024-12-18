const amqplib = require("amqplib");

let channel;
let connection;


const connectRabbitMQ = async () => {
  if (!connection) {
    try {
      connection = await amqplib.connect("amqp://localhost");
      channel = await connection.createChannel();
      console.log("Connected to RabbitMQ");
    } catch (error) {
      console.error("Error connecting to RabbitMQ:", error);
    }
  }
};


const sendToQueue = async (queueName, message) => {
  try {
    await connectRabbitMQ(); 
    await channel.assertQueue(queueName, { durable: true });
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
    console.log("Message sent to queue:", queueName);
  } catch (error) {
    console.error("Error sending message to RabbitMQ:", error);
  }
};

module.exports = { connectRabbitMQ, sendToQueue };
