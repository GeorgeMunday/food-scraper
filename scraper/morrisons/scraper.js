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

  await page.goto(
    `https://groceries.morrisons.com/search?q=${encodeURIComponent(productName)}`,
    { waitUntil: "domcontentloaded" },
  );

  try {
    const rejectButton = page.getByRole("button", { name: /reject all/i });
    await rejectButton.click({ timeout: 5000 });
    console.log("Cookies rejected");
  } catch {
    console.log("No cookie popup");
  }
  await page.waitForSelector('[data-retailer-anchor="product-list"]', {
    timeout: 60000,
  });
  const items = await page.$$eval(
    '[data-retailer-anchor="product-list"] [data-test="fop-price"]',
    (prices) =>
      prices.slice(0, 12).map((priceEl, index) => {
        const card =
          priceEl.closest('[data-test="fop-body"]') ||
          priceEl.closest('[data-retailer-anchor="fop"]') ||
          priceEl.parentElement;

        const name =
          card?.querySelector('[data-test="fop-title"]')?.innerText.trim() ||
          null;

        const price = priceEl.innerText.trim();

        const pricePerUnit =
          card?.querySelector('[data-test="fop-size"]')?.innerText.trim() ||
          null;

        const link = card
          ?.querySelector('a[href*="/products/"]')
          ?.getAttribute("href");

        return {
          id: link ? link.split("/").pop() : index + 1,
          name,
          price,
          pricePerUnit,
          url: link ? "https://groceries.morrisons.com" + link : null,
        };
      }),
  );

  await context.close();

  return items;
}

export async function morrisonsScraper() {
  console.log(
    `Starting Morrisons scrape (${foodCategories.length} categories)\n`,
  );

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

  const allResults = {};

  for (const category of foodCategories) {
    console.log("=================================");
    console.log(`SCRAPING: ${category.toUpperCase()}`);
    console.log("=================================");

    try {
      const products = await scrapeCategory(category, browser);

      allResults[category] = products;

      console.log(`Found ${products.length} products\n`);
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      console.error(`Error scraping ${category}`, err);
      allResults[category] = [];
    }
  }

  await browser.close();
  fs.writeFileSync(
    "morrisons-all-products.json",
    JSON.stringify(allResults, null, 2),
  );

  const totalProducts = Object.values(allResults).reduce(
    (sum, arr) => sum + arr.length,
    0,
  );

  console.log("=================================");
  console.log("SCRAPE COMPLETE");
  console.log("=================================");
  console.log("Categories:", foodCategories.length);
  console.log("Total products:", totalProducts);
  console.log("Saved to: morrisons-all-products.json");
}
