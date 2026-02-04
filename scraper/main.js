import { chromium } from "playwright";

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

async function scrapeCategory(productName) {
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

  console.log(`Navigating to ASDA ${productName} search...`);
  await page.goto(`https://www.asda.com/groceries/search/${productName}`, {
    waitUntil: "domcontentloaded",
  });

  try {
    const rejectButton = page.getByRole("button", { name: /reject all/i });
    await rejectButton.click({ timeout: 5000 });
    console.log("Cookies rejected");
  } catch (e) {
    console.log("No cookie consent found");
  }

  console.log("Waiting for products to load...");
  await page.waitForSelector('[id^="product-"]', { timeout: 10000 });
  await page.waitForTimeout(2000);

  const products = await page.evaluate(() => {
    const productElements = document.querySelectorAll('[id^="product-"]');

    return Array.from(productElements).map((product, index) => {
      const nameElement = product.querySelector(
        '[data-locator="txt-product-name"]',
      );
      const name = nameElement ? nameElement.textContent.trim() : "N/A";
      const priceElement = product.querySelector(
        '[data-locator="txt-product-price"]',
      );
      const price = priceElement ? priceElement.textContent.trim() : "N/A";
      const pricePerUnitElement = product.querySelector(
        '[data-locator="txt-product-price-per-uom"]',
      );
      const pricePerUnit = pricePerUnitElement
        ? pricePerUnitElement.textContent.trim()
        : null;
      const linkElement = product.querySelector(
        'h3 a[href*="/groceries/product/"]',
      );
      const url = linkElement
        ? `https://www.asda.com${linkElement.getAttribute("href")}`
        : "N/A";
      const productId = product.getAttribute("id");

      return {
        id: productId,
        name,
        price,
        pricePerUnit,
        url,
      };
    });
  });

  console.log(`Found ${products.length} products for ${productName}\n`);

  await browser.close();

  return products;
}

async function main() {
  console.log(`Starting scrape of ${foodCategories.length} categories...\n`);

  const allResults = {};

  for (const category of foodCategories) {
    console.log(`\n${"=".repeat(50)}`);
    console.log(`Scraping category: ${category.toUpperCase()}`);
    console.log(`${"=".repeat(50)}\n`);

    try {
      const products = await scrapeCategory(category);
      allResults[category] = products;

      console.log(
        `Successfully scraped ${products.length} products for ${category}`,
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error scraping ${category}:`, error);
      allResults[category] = [];
    }
  }
  const fs = await import("fs");
  fs.writeFileSync(
    "asda-all-products.json",
    JSON.stringify(allResults, null, 2),
  );

  const totalProducts = Object.values(allResults).reduce(
    (sum, products) => sum + products.length,
    0,
  );

  console.log("\n\n" + "=".repeat(50));
  console.log("SCRAPING COMPLETE");
  console.log("=".repeat(50));
  console.log(`Total categories scraped: ${foodCategories.length}`);
  console.log(`Total products found: ${totalProducts}`);
  console.log(`Results saved to: asda-all-products.json`);
}

main().catch(console.error);
