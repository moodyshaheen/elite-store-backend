import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { connectDb } from "./config/db.js"
import 'dotenv/config'
import { errorHandler, notFound } from './midelwhere/errorHandler.js'

// Import Routes
import authRoute from './route/authRoute.js'
import userRoute from './route/userRoute.js'
import profileRoute from './route/profileRoute.js'
import productRoute from './route/productRoute.js'
import orderRoute from './route/orderRoute.js'
import categoryRoute from './route/categoryRoute.js'

// App config
const app = express()
const port = process.env.PORT || 4000

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
// CORS Configuration
const getCorsOrigins = () => {
  const isDevelopment = process.env.NODE_ENV !== 'production'

  // في وضع الإنتاج، استخدم متغيرات البيئة مع إضافة الدومينات القديمة للتوافق
  if (!isDevelopment) {
    const origins = []
    if (process.env.FRONTEND_URL) origins.push(process.env.FRONTEND_URL)
    if (process.env.ADMIN_URL) origins.push(process.env.ADMIN_URL)

    // إضافة الدومينات القديمة للتوافق
    origins.push('https://elite-store-frontend.surge.sh')
    origins.push('https://elite-store-admin.surge.sh')
    origins.push('https://elite-store-frontend-new.surge.sh')
    origins.push('https://elite-store-admin-new.surge.sh')

    return origins.length > 0 ? origins : false
  }

  // في وضع التطوير، اسمح بأي origin من localhost
  return (origin, callback) => {
    if (!origin ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.startsWith('https://localhost:') ||
      origin.startsWith('https://127.0.0.1:') ||
      origin.includes('.surge.sh')) {
      callback(null, true)
    } else {
      const allowedOrigins = []
      if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL)
      if (process.env.ADMIN_URL) allowedOrigins.push(process.env.ADMIN_URL)

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(null, true) // في التطوير، اسمح بكل شيء
      }
    }
  }
}

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// CORS Configuration - Allow all surge.sh domains
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow all surge.sh domains
    if (origin.includes('.surge.sh') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.includes('vercel.app')) {
      return callback(null, true);
    }

    // Allow specific domains
    const allowedOrigins = [
      'https://elite-store-frontend-new.surge.sh',
      'https://elite-store-admin-new.surge.sh',
      'https://elite-store-frontend.surge.sh',
      'https://elite-store-admin.surge.sh'
    ];

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // For development, allow everything
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With'],
  optionsSuccessStatus: 200
}))

// Serve uploaded files
app.use('/upload', express.static('upload'))

// DB connection
connectDb()

// API Routes
app.use('/api/auth', authRoute)
app.use('/api/users', userRoute)
app.use('/api/profile', profileRoute)
app.use('/api/products', productRoute)
app.use('/api/orders', orderRoute)
app.use('/api/categories', categoryRoute)

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "EliteStore API is working!",
    version: "1.0.0"
  })
})

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is healthy",
    timestamp: new Date().toISOString()
  })
})

// Error handling
app.use(notFound)
app.use(errorHandler)

// Start server
app.listen(port, () => {
  console.log(`🚀 Server Started on http://localhost:${port}`)
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`)
})
