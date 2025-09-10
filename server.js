// server.js
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Use JSON parser
app.use(bodyParser.json());
app.use(express.static("public")); // serve your HTML/JS

// In-memory storage (or load from file)
let transactions = [];
try {
  transactions = JSON.parse(fs.readFileSync("transactions.json"));
} catch {}

function saveToFile() {
  fs.writeFileSync("transactions.json", JSON.stringify(transactions, null, 2));
}

// GET all transactions
app.get("/api/transactions", (req, res) => {
  res.json(transactions);
});

// POST updated transactions
app.post("/api/transactions", (req, res) => {
  transactions = req.body;
  saveToFile();
  res.json({ status: "ok" });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
