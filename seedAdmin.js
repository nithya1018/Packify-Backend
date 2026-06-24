import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { User } from "./models/user.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME;

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin user already exists");
      await mongoose.disconnect();
      process.exit(0);
    }

    const admin = new User({
      name,
      email,
      password,
      role: "admin",
    });

    await admin.save();
    console.log("Admin user created successfully:", email);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }
};

seedAdmin();