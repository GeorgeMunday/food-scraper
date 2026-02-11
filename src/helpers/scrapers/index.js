import { scrapeAsda } from "./asda.js";
import { scrapeMorrisons } from "./morrisons.js";
import { foodCategories } from "../constants.js";

export async function scrapeAllSites() {
  console.log(
    `Starting scrape for ${foodCategories.length} categories from 2 stores\n`,
  );
  console.log("=".repeat(60));

  const startTime = Date.now();

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

export { scrapeAsda } from "./asda.js";
export { scrapeMorrisons } from "./morrisons.js";
