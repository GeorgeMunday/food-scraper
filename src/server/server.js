import express from "express";
import dotenv from "dotenv";
import { testDatabaseConnection } from "../helpers/db.js";
import { scrapeAllSites } from "../helpers/scrapers/index.js";

dotenv.config({ debug: false });

const app = express();

app.get("/test-db", async (req, res) => {
  try {
    const result = await testDatabaseConnection();
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
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

app.get("/scrape", async (req, res) => {
  res.json({ message: "Scraping started in background" });
  scrapeAllSites().catch(console.error);
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
  console.log(`Test DB: http://localhost:${process.env.PORT}/test-db`);
  console.log(`Trigger scrape: http://localhost:${process.env.PORT}/scrape\n`);

  scrapeAllSites().catch(console.error);
});
