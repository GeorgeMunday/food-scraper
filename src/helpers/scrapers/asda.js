import { scrapeCategoryAsda } from "../../services/scrapers/asda/scraper.js";
import { saveProducts } from "../db.js";
import {
  launchBrowser,
  createBrowserContext,
  rejectCookies,
} from "../browser.js";
import { foodCategories } from "../constants.js";

export async function scrapeAsda() {
  console.log("Starting ASDA scrape...\n");
  let totalProducts = 0;

  const browser = await launchBrowser();
  const context = await createBrowserContext(browser);
  const page = await context.newPage();

  try {
    console.log("Handling ASDA cookies...");
    await page.goto("https://www.asda.com/", {
      waitUntil: "domcontentloaded",
    });

    await rejectCookies(page);

    for (const category of foodCategories) {
      try {
        console.log(`[ASDA] Scraping: ${category}`);
        const products = await scrapeCategoryAsda(category, page);
        console.log(`[ASDA] Found ${products.length} products`);

        await saveProducts("asda", category, products);
        totalProducts += products.length;

        await page.waitForTimeout(2000);
      } catch (error) {
        console.error(`[ASDA] Error scraping ${category}:`, error.message);
      }
    }
  } finally {
    await browser.close();
    console.log(`\n[ASDA] scrape complete - ${totalProducts} products saved\n`);
  }

  return totalProducts;
}
