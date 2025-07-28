import amqp from 'amqplib';
import dotenv from 'dotenv';

dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL;
if (!RABBITMQ_URL) {
  console.error("FATAL ERROR: RABBITMQ_URL is not defined in environment variables.");
  process.exit(1);
}
const EXCHANGE_NAME = 'aai_events';
const QUEUE_NAME = 'notification_queue';

// Define all the event routing keys this service will listen to
const BINDING_KEYS = [
  'booking.created',
  'trip.imported',
  // Add future keys here, e.g., 'flight.delayed'
];

// --- Global RabbitMQ Channel ---
let channel: amqp.Channel | null = null;

/**
 * Publishes an event back to the RabbitMQ exchange.
 * Used by our mock payment logic.
 * @param routingKey The key for the event (e.g., 'payment.succeeded')
 * @param message The event payload
 */
const publishEvent = (routingKey: string, message: any) => {
  if (channel) {
    const msgBuffer = Buffer.from(JSON.stringify(message));
    channel.publish(EXCHANGE_NAME, routingKey, msgBuffer);
    console.log(`   [-] Published event "${routingKey}"`);
  } else {
    console.error("Cannot publish event: RabbitMQ channel is not available.");
  }
};


// --- Event Handler Functions ---

/**
 * Handles the 'booking.created' event.
 * It simulates a payment and publishes a 'payment.succeeded' event.
 * @param payload The message content from the event
 */
const handleBookingCreated = (payload: any) => {
  console.log('   [-] Simulating payment for booking:', payload.bookingId);
  // This is our "mock payment gateway" logic
  publishEvent('payment.succeeded', { bookingId: payload.bookingId });
};

/**
 * Handles the 'trip.imported' event.
 * It simulates sending a notification to the user.
 * @param payload The message content from the event
 */
const handleTripImported = (payload: any) => {
  console.log('   [-] Simulating sending "Trip Imported" notification for trip:', payload.tripId);
  // In a real app, you might send an email here.
};


// --- Event Router ---

// This object maps a routing key to its corresponding handler function.
const eventHandlers: { [key: string]: (payload: any) => void } = {
  'booking.created': handleBookingCreated,
  'trip.imported': handleTripImported,
};


/**
 * Main function to start the RabbitMQ consumer.
 */
async function main() {
  console.log('Starting Notification Service...');

  try {
    const connection = await amqp.connect(RABBITMQ_URL!);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    console.log('[*] Binding queue to keys:', BINDING_KEYS.join(', '));
    for (const key of BINDING_KEYS) {
      await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, key);
    }

    console.log(`[*] Waiting for messages. To exit press CTRL+C`);

    channel.consume(QUEUE_NAME, (msg) => {
      if (msg) {
        const routingKey = msg.fields.routingKey;
        console.log(`[x] Received event "${routingKey}"`);
        
        // Find the correct handler for the received routing key
        const handler = eventHandlers[routingKey];
        
        if (handler) {
          try {
            const messageContent = JSON.parse(msg.content.toString());
            handler(messageContent); // Execute the handler
          } catch (error) {
            console.error(`Error processing message for key ${routingKey}:`, error);
          }
        } else {
          console.warn(`No handler found for routing key: ${routingKey}`);
        }
        
        channel!.ack(msg); // Acknowledge the message regardless of handler existence
      }
    });

  } catch (error) {
    console.error('Failed to start Notification Service consumer:', error);
    process.exit(1);
  }
}

main();