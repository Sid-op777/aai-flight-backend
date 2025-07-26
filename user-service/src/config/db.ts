import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGO_URI not found in environment variables.");
      process.exit(1);
    }
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected...');
  } catch (err: any) {
    console.error(err.message);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;