import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/user.js";


dotenv.config();

const requiredEnv = ["MONGO_URI", "ADMIN_FULL_NAME", "ADMIN_EMAIL", "ADMIN_PASSWORD"];

const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.log("Missing required environment variables", { missing });
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const fullName = process.env.ADMIN_FULL_NAME.trim();
    const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    const replaceExisting = String(process.env.ADMIN_REPLACE_EXISTING || "false").toLowerCase() === "true";

    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.role === "admin") {
        console.log("Admin account already exists for this email", { email });
        return;
      }

      if (!replaceExisting) {
        console.log("A non-admin user already exists and replace is disabled", { email });
        console.log("Set ADMIN_REPLACE_EXISTING=true to delete and recreate this user as Admin");
        return;
      } else {
        await User.deleteOne({ _id: existing._id });
        console.log("Deleted existing non-admin user before admin creation", { email });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: fullName,
      email,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
    });
    console.log("Admin user created successfully", { email });
  } catch (error) {
    console.log("Failed to create admin", { error: error.message, stack: error.stack });
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();