const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.use(express.static(__dirname));

let transactions = [];
const transactionsFile = path.join(__dirname, "transactions.json");
try {
  if (fs.existsSync(transactionsFile)) {
    transactions = JSON.parse(fs.readFileSync(transactionsFile, "utf8"));
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

let ideas = [];
const ideasFile = path.join(__dirname, "ideas.json");
try {
  if (fs.existsSync(ideasFile)) {
    ideas = JSON.parse(fs.readFileSync(ideasFile, "utf8"));
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

app.get("/api/ideas", (req, res) => res.json(ideas));

app.post("/api/ideas", (req, res) => {
  const newIdea = req.body;
  if (!newIdea || (!newIdea.name && !newIdea.idea && !newIdea.imageBase64)) {
    return res.status(400).json({ error: "Invalid idea data" });
  }

  ideas.push(newIdea);
  saveIdeas();
  res.json({ status: "ok" });
});

app.delete("/api/ideas/:index", (req, res) => {
  const idx = parseInt(req.params.index, 10);
  if (!isNaN(idx) && idx >= 0 && idx < ideas.length) {
    ideas.splice(idx, 1);
    saveIdeas();
    res.json({ status: "ok" });
  } else {
    res.status(400).json({ error: "Invalid index" });
  }
});

app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
