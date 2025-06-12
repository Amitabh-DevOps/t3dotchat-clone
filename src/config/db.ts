import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/t3dotchat';
    
    await mongoose.connect(mongoUri);
    
    console.log('✅ MongoDB Connected Successfully!');

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
  }
};

export default connectDB; 