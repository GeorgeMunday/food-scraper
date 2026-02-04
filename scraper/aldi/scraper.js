import { chromium } from "playwright";
import fs from "fs";

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

async function scrapeCategory(productName, browser) {
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

  console.log(`Navigating to Morrisons: ${productName}`);

  await page.goto(``, { waitUntil: "domcontentloaded" });
}

export async function aldiScraper() {
  //   console.log(
  //     `Starting Morrisons scrape (${foodCategories.length} categories)\n`,
  //   );
  //   const browser = await chromium.launch({
  //     headless: true,
  //     args: [
  //       "--disable-blink-features=AutomationControlled",
  //       "--disable-gpu",
  //       "--no-sandbox",
  //       "--disable-dev-shm-usage",
  //       "--disable-extensions",
  //       "--disable-setuid-sandbox",
  //     ],
  //   });
  //   const allResults = {};
  //   for (const category of foodCategories) {
  //     console.log("=================================");
  //     console.log(`SCRAPING: ${category.toUpperCase()}`);
  //     console.log("=================================");
  //     try {
  //       const products = await scrapeCategory(category, browser);
  //       allResults[category] = products;
  //       console.log(`Found ${products.length} products\n`);
  //       await new Promise((r) => setTimeout(r, 2000));
  //     } catch (err) {
  //       console.error(`Error scraping ${category}`, err);
  //       allResults[category] = [];
  //     }
  //   }
  //   await browser.close();
  //   fs.writeFileSync(
  //     "morrisons-all-products.json",
  //     JSON.stringify(allResults, null, 2),
  //   );
  //   const totalProducts = Object.values(allResults).reduce(
  //     (sum, arr) => sum + arr.length,
  //     0,
  //   );
  //   console.log("=================================");
  //   console.log("SCRAPE COMPLETE");
  //   console.log("=================================");
  //   console.log("Categories:", foodCategories.length);
  //   console.log("Total products:", totalProducts);
  //   console.log("Saved to: morrisons-all-products.json");
}

morrisonsScraper();
