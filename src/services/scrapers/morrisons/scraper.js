export async function scrapeCategory(productName, page) {
  await page.goto(
    `https://groceries.morrisons.com/search?q=${encodeURIComponent(productName)}`,
    { waitUntil: "domcontentloaded" },
  );

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

  return items;
}
