import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/buysell"

let isConnected = false

export const connectDB = async () => {
  if (isConnected) {
    return
  }

  try {
    const db = await mongoose.connect(MONGODB_URI)
    isConnected = db.connections[0].readyState === 1
    console.log("MongoDB connected successfully")
  } catch (err) {
    console.error("MongoDB connection error:", err)
    throw new Error("Database connection failed")
  }
}

export default connectDB
