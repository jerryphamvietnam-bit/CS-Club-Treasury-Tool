const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(express.static(__dirname));

let transactions = [];
const transactionsFile = path.join(__dirname, "transactions.json");

try {
  if (fs.existsSync(transactionsFile)) {
    transactions = JSON.parse(fs.readFileSync(transactionsFile));
  }
} catch (err) {
  console.error("Failed to load transactions:", err);
}

function saveToFile() {
  try {
    fs.writeFileSync(transactionsFile, JSON.stringify(transactions, null, 2));
  } catch (err) {
    console.error("Failed to save transactions:", err);
  }
}

app.get("/api/transactions", (req, res) => {
  res.json(transactions);
});

app.post("/api/transactions", (req, res) => {
  transactions = req.body;
  saveToFile();
  res.json({ status: "ok" });
});

app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
