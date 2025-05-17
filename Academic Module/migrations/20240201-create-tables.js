// migrations file 20240201-create-tables.js
import db from "../models/index.js";

const setupDatabase = async () => {
  try {
    await db.sequelize.sync({ force: true });
    console.log("Database migrated successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  }
};

setupDatabase();