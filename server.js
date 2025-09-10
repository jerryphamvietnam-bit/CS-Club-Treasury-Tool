const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(express.static(__dirname));

// --- Transactions setup ---
let transactions = [];
const transactionsFile = path.join(__dirname, "transactions.json");

try {
  if (fs.existsSync(transactionsFile)) {
    transactions = JSON.parse(fs.readFileSync(transactionsFile));
  }
} catch (err) {
  console.error("Failed to load transactions:", err);
}

function saveTransactionsToFile() {
  try {
    fs.writeFileSync(transactionsFile, JSON.stringify(transactions, null, 2));
  } catch (err) {
    console.error("Failed to save transactions:", err);
  }
}

// --- Ideas setup ---
let ideas = [];
const ideasFile = path.join(__dirname, "ideas.json");

try {
  if (fs.existsSync(ideasFile)) {
    ideas = JSON.parse(fs.readFileSync(ideasFile));
  }
} catch (err) {
  console.error("Failed to load ideas:", err);
}

function saveIdeasToFile() {
  try {
    fs.writeFileSync(ideasFile, JSON.stringify(ideas, null, 2));
  } catch (err) {
    console.error("Failed to save ideas:", err);
  }
}

// --- Transactions API ---
app.get("/api/transactions", (req, res) => res.json(transactions));

app.post("/api/transactions", (req, res) => {
  transactions = req.body;
  saveTransactionsToFile();
  res.json({ status: "ok" });
});

// --- Ideas API ---
app.get("/api/ideas", (req, res) => res.json(ideas));

app.post("/api/ideas", (req, res) => {
  ideas = req.body;
  saveIdeasToFile();
  res.json({ status: "ok" });
});

app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
