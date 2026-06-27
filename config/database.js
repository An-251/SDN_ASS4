const mongoose = require("mongoose");

async function connectDatabase() {
  const mongoUri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/SimpleQuiz";

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`Connected to MongoDB database: ${mongoose.connection.name}`);
  } catch (error) {
    const usingLocalFallback = !process.env.MONGODB_URI && !process.env.MONGO_URI;
    const hint = usingLocalFallback
      ? " Set MONGODB_URI in Render to your MongoDB Atlas connection string."
      : " Check the MONGODB_URI value and allow Render outbound IPs in MongoDB Atlas Network Access.";

    throw new Error(`MongoDB connection failed: ${error.message}.${hint}`);
  }
}

module.exports = connectDatabase;
