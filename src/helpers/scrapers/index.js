import { scrapeAsda } from "./asda/index.js";
import { scrapeMorrisons } from "./morrisons/index.js";
import { foodCategories } from "../../config/constants.js";
import { deleteComparePrices } from "../../db/index.js";

export async function scrapeAllSites() {
  console.log(
    `Starting scrape for ${foodCategories.length} categories from 2 stores\n`,
  );
  console.log("=".repeat(60));

  const startTime = Date.now();

  await deleteComparePrices();

  try {
    const [asdaTotal, morrisonsTotal] = await Promise.all([
      scrapeAsda(),
      scrapeMorrisons(),
    ]);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("=".repeat(60));
    console.log("ALL SCRAPING COMPLETE");
    console.log("=".repeat(60));
    console.log(`ASDA products: ${asdaTotal}`);
    console.log(`Morrisons products: ${morrisonsTotal}`);
    console.log(`Total products: ${asdaTotal + morrisonsTotal}`);
    console.log(`Time taken: ${duration}s`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("Error in scrapeAllSites:", error);
  }
}

export { scrapeAsda } from "./asda/index.js";
export { scrapeMorrisons } from "./morrisons/index.js";
