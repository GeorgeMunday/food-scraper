import { chromium } from "playwright";

async function main() {
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

  console.log("Navigating to ASDA chicken search...");
  await page.goto("https://www.asda.com/groceries/search/chicken", {
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

  console.log(`\n✓ Found ${products.length} products\n`);
  products.forEach((product, index) => {
    console.log(`\n--- Product ${index + 1} ---`);
    console.log(`ID: ${product.id}`);
    console.log(`Name: ${product.name}`);
    console.log(`Price: ${product.price}`);
    if (product.pricePerUnit) {
      console.log(`Price per unit: ${product.pricePerUnit}`);
    }
    console.log(`URL: ${product.url}`);
  });
  const fs = await import("fs");
  fs.writeFileSync(
    "asda-chicken-products.json",
    JSON.stringify(products, null, 2),
  );
  console.log(`\n Successfully scraped ${products.length} products`);
  console.log("Results saved to asda-chicken-products.json");

  await browser.close();
}

main().catch(console.error);
