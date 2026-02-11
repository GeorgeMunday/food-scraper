import { scrapeCategoryMorrisons } from "../../services/scrapers/morrisons/scraper.js";
import { saveProducts } from "../db.js";
import {
  launchBrowser,
  createBrowserContext,
  rejectCookies,
} from "../browser.js";
import { foodCategories } from "../constants.js";

export async function scrapeMorrisons() {
  console.log("🛒 Starting Morrisons scrape...\n");
  let totalProducts = 0;

  const browser = await launchBrowser();
  const context = await createBrowserContext(browser);
  const page = await context.newPage();

  try {
    console.log("Handling Morrisons cookies...");
    await page.goto("https://groceries.morrisons.com", {
      waitUntil: "domcontentloaded",
    });

    await rejectCookies(page);

    for (const category of foodCategories) {
      try {
        console.log(`[Morrisons] Scraping: ${category}`);
        const products = await scrapeCategoryMorrisons(category, page);
        console.log(`[Morrisons] Found ${products.length} products`);

        await saveProducts("morrisons", category, products);
        totalProducts += products.length;

        await page.waitForTimeout(2000);
      } catch (error) {
        console.error(`[Morrisons] Error scraping ${category}:`, error.message);
      }
    }
  } finally {
    await browser.close();
    console.log(
      `\n[Morrisons] scrape complete - ${totalProducts} products saved\n`,
    );
  }

  return totalProducts;
}
