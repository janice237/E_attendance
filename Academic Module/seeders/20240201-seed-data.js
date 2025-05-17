// seeders file 20240201-seed-data.js
import db from "../models/index.js";
import bcrypt from "bcryptjs";

const seedDatabase = async () => {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db.User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
    });
    console.log("Database seeded successfully.");
  } catch (error) {
    console.error("Seeding failed:", error);
  }
};

seedDatabase();