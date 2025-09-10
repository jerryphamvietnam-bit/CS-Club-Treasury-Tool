// server.js
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // serve HTML/JS/CSS

// Load transactions from file
let transactions = [];
const dataFile = path.join(__dirname, "transactions.json");

try {
  if (fs.existsSync(dataFile)) {
    transactions = JSON.parse(fs.readFileSync(dataFile));
  }
} catch (err) {
  console.error("Failed to load transactions:", err);
}

// Save transactions to file
function saveToFile() {
  fs.writeFileSync(dataFile, JSON.stringify(transactions, null, 2));
}

// API routes
app.get("/api/transactions", (req, res) => {
  res.json(transactions);
});

app.post("/api/transactions", (req, res) => {
  transactions = req.body;
  saveToFile();
  res.json({ status: "ok" });
});

// Serve index.html for all other routes (so React/SPA or HTML works)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
