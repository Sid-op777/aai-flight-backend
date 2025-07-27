import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL;
if (!RABBITMQ_URL) {
  throw new Error("RabbitMQ URL is not configured.");
}

const exchangeName = 'aai_events';
const queueName = 'notification_queue';
const routingKey = 'booking.created';

async function startConsumer() {
  console.log('Starting Notification Service consumer...');
  try {
    const connection = await amqp.connect(RABBITMQ_URL!);
    const channel = await connection.createChannel();

    // Make sure the exchange exists, matching the producer's setup
    await channel.assertExchange(exchangeName, 'topic', { durable: true });
    
    // Assert a queue. `durable: true` means the queue will survive a broker restart.
    await channel.assertQueue(queueName, { durable: true });

    // Bind the queue to the exchange with our specific routing key
    await channel.bindQueue(queueName, exchangeName, routingKey);

    console.log(`[*] Waiting for messages with key "${routingKey}". To exit press CTRL+C`);

    channel.consume(queueName, (msg) => {
      if (msg !== null) {
        try {
          const messageContent = JSON.parse(msg.content.toString());
          console.log(`[x] Received event "${msg.fields.routingKey}"`);
          
          // --- This is where the notification logic would go ---
          console.log('   [-] Simulating sending booking confirmation...');
          console.log(`   [-] To: ${messageContent.userEmail}`);
          console.log(`   [-] Booking ID: ${messageContent.bookingId}`);
          console.log(`   [-] Flight: ${messageContent.flightDetails.flightNumber} (${messageContent.flightDetails.departure} to ${messageContent.flightDetails.arrival})`);
          // --------------------------------------------------------

          // Acknowledge the message so RabbitMQ knows it's been processed
          channel.ack(msg);
        } catch (error) {
          console.error("Error processing message:", error);
          // In a real app, you might reject the message and send it to a dead-letter queue
          channel.nack(msg, false, false);
        }
      }
    });

  } catch (error) {
    console.error('Failed to start consumer', error);
    process.exit(1);
  }
}

startConsumer();