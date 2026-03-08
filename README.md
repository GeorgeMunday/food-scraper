# Food Scraper

A Node.js price comparison scraper that searches ASDA and Morrisons for grocery products and stores the results in Firebase Firestore. Built with Playwright for browser automation and Express for the HTTP server.

---

## Latest Scrape Statistics

| Stat | Value |
|---|---|
| Stores scraped | 2 (ASDA + Morrisons) |
| Categories searched | 78 |
| ASDA products | 385 |
| Morrisons products | 370 |
| Total products | **755** |
| Time taken | 394.96s (~6.5 mins) |

---

## Stores

### Currently Scraping

| Store | Status |
|---|---|
| ASDA | Live |
| Morrisons | Live |

### Coming Soon

| Store | Status |
|---|---|
| Tesco | Coming soon |
| Sainsbury's | Coming soon |
| Waitrose | Coming soon |
| Lidl | Coming soon |
| Aldi | Coming soon |
| Iceland | Coming soon |
| Co-op | Coming soon |

> More stores are actively being worked on. Each new store added will increase the total product count and price comparison coverage.

---

## Project Structure

```
food-scraper/
├── src/
│   ├── config/
│   │   ├── constants.js        # Search terms / food categories
│   │   └── firebase.js         # Firebase admin initialisation
│   ├── db/
│   │   └── index.js            # saveProducts, deleteComparePrices, testDatabaseConnection
│   ├── helpers/
│   │   └── scrapers/
│   │       ├── index.js        # scrapeAllSites orchestrator
│   │       ├── browser.js      # Playwright browser/context helpers
│   │       ├── asda/
│   │       │   ├── index.js    # ASDA scrape loop
│   │       │   └── scraper.js  # ASDA page scraping logic
│   │       └── morrisons/
│   │           ├── index.js    # Morrisons scrape loop
│   │           └── scraper.js  # Morrisons page scraping logic
│   └── server/
│       ├── firebase.js         # Exports Firestore db instance
│       └── server.js           # Express server + routes
├── .env                        # Environment variables (not committed)
├── package.json
└── README.md
```

---

## Firestore Data Structure

Each scrape **clears the entire `compare-prices` collection first**, then writes fresh data.

```
compare-prices/                        (collection)
  └── asda/                            (document)
        └── chicken breast/            (subcollection)
              └── product-1234/        (document)
                    ├── name
                    ├── price
                    ├── pricePerUnit
                    ├── url
                    ├── store
                    ├── category
                    └── scrapedAt
  └── morrisons/                       (document)
        └── chicken breast/            (subcollection)
              └── abc123/              (document)
                    └── ...
```

---

## Categories Scraped

78 search terms across 11 departments:

| Department | Terms |
|---|---|
| Dairy & Eggs | whole milk, cheddar cheese, butter, greek yogurt, eggs, cream |
| Meat & Fish | chicken breast, beef mince, pork sausages, bacon, salmon fillet, cod fillet, lamb chops |
| Fruit | bananas, apples, strawberries, oranges, grapes, blueberries, avocado |
| Vegetables | broccoli, spinach, carrots, potatoes, tomatoes, onions, garlic, cucumber, peppers, mushrooms |
| Bakery | white bread, wholemeal bread, croissants, bagels, sourdough |
| Pantry & Dry Goods | pasta, rice, tinned tomatoes, baked beans, lentils, chickpeas, olive oil, plain flour, porridge oats |
| Drinks | orange juice, apple juice, sparkling water, still water, coffee, tea bags, energy drink, cola |
| Snacks | crisps, chocolate bar, biscuits, nuts, popcorn, cereal bars |
| Breakfast | cornflakes, granola, peanut butter, jam |
| Frozen | frozen peas, frozen chips, ice cream, frozen pizza, frozen fish fingers |
| Condiments & Sauces | ketchup, mayonnaise, soy sauce, hot sauce, pasta sauce |
| Cleaning & Household | washing up liquid, laundry detergent, toilet roll, kitchen roll, bin bags |

---

## Setup

### 1. Clone the repo

```sh
git clone https://github.com/GeorgeMunday/food-scraper.git
cd food-scraper
```

### 2. Install dependencies

```sh
npm install
npx playwright install chromium
```

### 3. Create a `.env` file

```sh
PORT=3000

FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-client-email@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
FIREBASE_UNIVERSE_DOMAIN=googleapis.com
```

> All values come from your Firebase service account JSON file. In the Firebase console go to **Project Settings -> Service Accounts -> Generate new private key**.

### 4. Start the server

```sh
npm start
```

The server will start and **automatically trigger a scrape on boot**.

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/scrape` | Clears Firestore and starts a fresh scrape in the background |
| `GET` | `/test-db` | Tests the Firebase connection by writing and reading a document |

---

## How a Scrape Works

1. Server starts (or `/scrape` is hit)
2. `deleteComparePrices()` -- wipes the entire `compare-prices` Firestore collection
3. ASDA and Morrisons scrapers launch **in parallel**, each opening a Chromium browser
4. Cookies are rejected on each site
5. Each of the 78 search terms is searched in sequence per store
6. The first **5 results** per search are scraped (name, price, price per unit, URL)
7. Results are saved to Firestore under `compare-prices/{store}/{category}/{productId}`
8. Browser closes, totals are logged

---

## Dependencies

| Package | Purpose |
|---|---|
| `playwright` | Browser automation for scraping |
| `express` | HTTP server |
| `firebase-admin` | Firestore database |
| `dotenv` | Environment variable loading |
| `node-cron` | (Available) Scheduled scrape runs |

---

## Notes

- The browser runs in **headed mode** (visible) -- you will see two Chromium windows open during a scrape
- A full scrape takes roughly **6-7 minutes** due to page load waits and the volume of searches
- The scraper is rate-limited by `waitForTimeout(2000)` between Morrisons categories to avoid being blocked
- Firestore data is **fully replaced** on every run -- there is no incremental update