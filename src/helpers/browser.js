import { chromium } from "playwright";

const BROWSER_ARGS = [
  "--disable-blink-features=AutomationControlled",
  "--disable-gpu",
  "--no-sandbox",
  "--disable-dev-shm-usage",
  "--disable-extensions",
  "--disable-setuid-sandbox",
  "--window-position=-2400,-2400",
];

const BROWSER_CONTEXT_OPTIONS = {
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  viewport: { width: 1920, height: 1080 },
  locale: "en-GB",
  timezoneId: "Europe/London",
};

export async function launchBrowser() {
  return await chromium.launch({
    headless: false,
    args: BROWSER_ARGS,
  });
}

export async function createBrowserContext(browser) {
  const context = await browser.newContext(BROWSER_CONTEXT_OPTIONS);

  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
    });
  });

  return context;
}

export async function rejectCookies(page) {
  try {
    const rejectButton = page.getByRole("button", { name: /reject all/i });
    await rejectButton.click({ timeout: 5000 });
    console.log("✓ Cookies rejected\n");
    return true;
  } catch {
    console.log("No cookie popup\n");
    return false;
  }
}
