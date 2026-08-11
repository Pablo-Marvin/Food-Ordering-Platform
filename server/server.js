require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const cluster = require('cluster');
const os = require('os');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter, orderLimiter } = require('./middleware/rateLimiter');

// Routes
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payment');
const authRoutes = require('./routes/auth'); // NEW: Auth routes

const PORT = process.env.PORT || 5000;
const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork(); // Replace the dead worker
  });
} else {
  // Try to connect to MongoDB in the worker process
  connectDB().then((conn) => {
    if (!conn) {
      console.error(`Worker ${process.pid} failed to connect to DB. Exiting...`);
      process.exit(1);
    }

    const app = express();

  // Security middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // CORS
  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'],
    credentials: true
  }));



  // Body parser for all other routes
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Rate limiting
  app.use('/api/', apiLimiter);
  app.use('/api/orders', orderLimiter);

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/menu', menuRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/payment', paymentRoutes);
  
  // Webhook and Verification Routes
  const webhookRouter = require('./routes/webhook');
  app.use('/api/webhook', webhookRouter);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Crispiest Chicken API is running! 🍗', worker: process.pid });
  });

  // Error handler
  app.use(errorHandler);

  app.listen(PORT, () => {
      console.log(`Worker ${process.pid} started on port ${PORT}`);
    });
  });
}
