import express from "express";
import morrisonsScraper from "../scrapers/morrisons/scraper.js";
import { db } from "./firebase.js";

import dotenv from "dotenv";

dotenv.config({ debug: false });

const app = express();

app.get("/test-db", async (req, res) => {
  try {
    const testRef = db.collection("_connection_test");
    const timestamp = new Date().toISOString();
    await testRef.doc("test").set({
      message: "Connection successful",
      timestamp: timestamp,
    });
    const doc = await testRef.doc("test").get();

    if (doc.exists) {
      const data = doc.data();
      await testRef.doc("test").delete();

      res.json({
        success: true,
        message: "Database connection successful!",
        data: data,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Could not verify write operation",
      });
    }
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

app.listen(process.env.PORT, () => {
  console.log("server starting");
  console.log(
    `Test database connection: http://localhost:${process.env.PORT}/test-db`,
  );
});
