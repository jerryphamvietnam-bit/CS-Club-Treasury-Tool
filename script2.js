document.addEventListener("DOMContentLoaded", () => {
  const transactionForm = document.getElementById("transactionForm");

  let transactions = [];
  let history = [];

  // --- Load transactions from server ---
  async function loadTransactions() {
    try {
      const res = await fetch("/api/transactions");
      transactions = await res.json();
      if (typeof renderTable === "function") renderTable();
    } catch (err) {
      console.error("Failed to load transactions from server:", err);
    }
  }

  // --- Save transactions to server ---
  async function saveTransactions() {
    try {
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactions)
      });
    } catch (err) {
      console.error("Failed to save transactions to server:", err);
    }
  }

  // --- Form submit handler ---
  transactionForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const source = document.getElementById("source").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);
    const date = document.getElementById("date").value;
    const type = document.getElementById("type").value;

    if (!source || isNaN(amount) || !date || !type) {
      alert("Please fill in all fields correctly!");
      return;
    }

    // Save history for undo/redo
    history.push(JSON.parse(JSON.stringify(transactions)));

    // Add new transaction
    transactions.push({ source, amount, date, type });

    // Save to server
    await saveTransactions();

    // Reset form
    transactionForm.reset();

    // Update table if renderTable exists
    if (typeof renderTable === "function") renderTable();

    alert("Transaction added!");
  });

  // --- Initial load ---
  loadTransactions();
});
