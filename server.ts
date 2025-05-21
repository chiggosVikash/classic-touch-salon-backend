import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// For Vercel serverless deployment
let isConnected = false;

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Rate limiter configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 300,
  message: 'Too many requests from this IP, please try again 15 Min.',
  headers: true,
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));
app.use(limiter);

// Health check endpoint for Vercel
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

app.use(routes);

// Error handler middleware
app.use(errorHandler);

// Database connection function
const connectDB = async () => {
  if (isConnected) {
    console.log('Already connected to MongoDB');
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // For serverless environment, we should handle this gracefully
    return;
  }
};

// Connect to database
connectDB();

// Only start the server in development mode
// In Vercel serverless environment, the serverless function
// will handle the requests without explicitly listening
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export the app for serverless functions
export default app;
