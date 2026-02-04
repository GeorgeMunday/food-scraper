import { asdaScraper } from "./asda/scraper.js";
import { morrisonsScraper } from "./morrisons/scraper.js";

async function main() {
  await asdaScraper();
  await morrisonsScraper();
}

main();
