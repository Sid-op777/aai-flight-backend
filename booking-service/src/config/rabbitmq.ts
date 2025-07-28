import amqp from 'amqplib';
import dotenv from 'dotenv';
import { handlePaymentSuccess } from '../services/booking-logic';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL;
if (!RABBITMQ_URL) {
  throw new Error("RabbitMQ URL is not configured.");
}

let channel: amqp.Channel | null = null;
const exchangeName = 'aai_events';

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    // Assert an exchange to make sure it exists
    await channel.assertExchange(exchangeName, 'topic', { durable: true });
    console.log('Connected to RabbitMQ and exchange is ready.');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ', error);
    process.exit(1);
  }
};

export const publishEvent = (routingKey: string, message: any) => {
  if (!channel) {
    console.error('RabbitMQ channel is not available.');
    return;
  }
  const msgBuffer = Buffer.from(JSON.stringify(message));
  channel.publish(exchangeName, routingKey, msgBuffer);
  console.log(`Published event with key "${routingKey}"`);
};

export const subscribeToEvents = async () => {
  if (!channel) {
    throw new Error("RabbitMQ channel not available.");
  }

  const queueName = 'booking_service_queue';
  await channel.assertQueue(queueName, { durable: true });

  // Listen for payment success events
  const paymentSuccessKey = 'payment.succeeded';
  await channel.bindQueue(queueName, exchangeName, paymentSuccessKey);

  console.log(`[*] Subscribed to events with key "${paymentSuccessKey}"`);

  channel.consume(queueName, async (msg) => {
    if (msg) {
      try {
        // Route the message to the correct handler
        if (msg.fields.routingKey === paymentSuccessKey) {
          await handlePaymentSuccess(JSON.parse(msg.content.toString()));
        }
        channel!.ack(msg);
      } catch (error) {
        console.error("Error processing message:", error);
        channel!.nack(msg, false, false);
      }
    }
  });
};