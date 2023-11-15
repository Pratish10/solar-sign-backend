const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB --  database connection established successfully!");
  } catch (error) {
    console.log(`MongoDB connection error.: ${error.message}`);
    process.exit();
  }
};

module.exports = connectDB;
