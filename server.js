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

app.use(cors({
  origin: getCorsOrigins(),
  credentials: true
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
