import express from "express";
import morrisonsScraper from "./morrisons";

const app = express();

// main logic
morrisonsScraper();
asdaScraper();

app.listen(3000, () => {
  console.log("Server running");
});
