import express from "express";
import { chromium } from "playwright";
import { db } from "./firebase.js";
import { scrapeCategory } from "../services/scrapers/morrisons/scraper.js";
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

const foodCategories = [
  "chicken",
  "beef",
  "salmon",
  "bread",
  "milk",
  "eggs",
  "cheese",
  "pasta",
  "rice",
  "tomatoes",
];

async function scrapeAllSites() {
  console.log(`Starting scrape for (${foodCategories.length} foods)`);

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--disable-gpu",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-extensions",
      "--disable-setuid-sandbox",
    ],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 },
    locale: "en-GB",
    timezoneId: "Europe/London",
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
    });
  });

  const page = await context.newPage();
  await page.goto(`https://groceries.morrisons.com`, {
    waitUntil: "domcontentloaded",
  });
  try {
    const rejectButton = page.getByRole("button", { name: /reject all/i });
    await rejectButton.click({ timeout: 5000 });
    console.log("Cookies rejected");
  } catch {
    console.log("No cookie popup");
  }

  for (const category of foodCategories) {
    try {
      const products = await scrapeCategory(category, page);
      console.log(category);
      console.log(products);
    } catch (error) {
      console.log(error);
    }
  }
  await browser.close();
  console.log("end of scrape");
}

app.listen(process.env.PORT, () => {
  console.log(
    `Test database connection: http://localhost:${process.env.PORT}/test-db`,
  );
  scrapeAllSites();
});
