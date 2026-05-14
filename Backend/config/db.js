import mongoose from "mongoose";

const connectDb = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URL not found in .env");
    }

    await mongoose.connect(process.env.MONGODB_URL);

    console.log("DB Connected");
  } catch (error) {
    console.log("DB Error:", error.message);

    process.exit(1);
  }
};

export default connectDb;