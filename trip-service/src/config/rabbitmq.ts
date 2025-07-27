import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL;
if (!RABBITMQ_URL) {
  console.error("FATAL ERROR: RABBITMQ_URL is not defined in environment variables.");
  process.exit(1);
}

let channel: amqp.Channel | null = null;
const exchangeName = 'aai_events'; // Central exchange for all our application events

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    // Assert a 'topic' exchange to make sure it exists. It's idempotent.
    await channel.assertExchange(exchangeName, 'topic', { durable: true });
    console.log('Connected to RabbitMQ and exchange is ready.');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ', error);
    // Retry logic could be added here in a real production app
    process.exit(1);
  }
};

export const publishEvent = (routingKey: string, message: any) => {
  if (!channel) {
    console.error('RabbitMQ channel is not available. Cannot publish event.');
    return;
  }
  
  const msgBuffer = Buffer.from(JSON.stringify(message));
  
  // Publish the message to our central exchange with a specific routing key
  channel.publish(exchangeName, routingKey, msgBuffer);
  console.log(`Published event with key "${routingKey}"`);
};