// server.js
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(express.static(__dirname));

// --- Transactions ---
let transactions = [];
const transactionsFile = path.join(__dirname, "transactions.json");
try {
  if (fs.existsSync(transactionsFile)) {
    transactions = JSON.parse(fs.readFileSync(transactionsFile));
  }
} catch (err) {
  console.error("Failed to load transactions:", err);
}
function saveTransactions() {
  try {
    fs.writeFileSync(transactionsFile, JSON.stringify(transactions, null, 2));
  } catch (err) {
    console.error("Failed to save transactions:", err);
  }
}

app.get("/api/transactions", (req, res) => res.json(transactions));
app.post("/api/transactions", (req, res) => {
  transactions = req.body;
  saveTransactions();
  res.json({ status: "ok" });
});

// --- Fundraising Ideas ---
let ideas = [];
const ideasFile = path.join(__dirname, "ideas.json");
try {
  if (fs.existsSync(ideasFile)) {
    ideas = JSON.parse(fs.readFileSync(ideasFile));
  }
} catch (err) {
  console.error("Failed to load ideas:", err);
}

function saveIdeas() {
  try {
    fs.writeFileSync(ideasFile, JSON.stringify(ideas, null, 2));
  } catch (err) {
    console.error("Failed to save ideas:", err);
  }
}

// Get all ideas
app.get("/api/ideas", (req, res) => res.json(ideas));

// Add one idea
app.post("/api/ideas", (req, res) => {
  const newIdea = req.body;
  ideas.push(newIdea);
  saveIdeas();
  res.json({ status: "ok" });
});

// Delete one idea by index
app.delete("/api/ideas/:index", (req, res) => {
  const idx = parseInt(req.params.index);
  if (!isNaN(idx) && idx >= 0 && idx < ideas.length) {
    ideas.splice(idx, 1);
    saveIdeas();
    res.json({ status: "ok" });
  } else {
    res.status(400).json({ error: "Invalid index" });
  }
});

app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
