import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb+srv://moshaheen616_db_user:123456123@cluster0.quhg3zy.mongodb.net/elitestore?retryWrites=true&w=majority"
    )
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`)
    process.exit(1)
  }
}