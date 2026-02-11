export async function scrapeCategoryAsda(productName, page) {
  await page.goto(`https://www.asda.com/groceries/search/${productName}`, {
    waitUntil: "domcontentloaded",
  });

  console.log("Waiting for products to load...");
  await page.waitForSelector('[id^="product-"]', { timeout: 10000 });
  await page.waitForTimeout(2000);

  const items = await page.evaluate(() => {
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
  return items;
}
