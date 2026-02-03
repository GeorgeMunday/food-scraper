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
  await page.waitForLoadState("networkidle");
  const title = await page.title();
  console.log(`Page title: ${title}`);
  await browser.close();
}

main();
