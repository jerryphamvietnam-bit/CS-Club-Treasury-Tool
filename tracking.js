const tableBody = document.getElementById("transactionTable");
const balanceEl = document.getElementById("balance");

let transactions = [];
let history = [];
let historyRedo = [];

// --- Load transactions from server ---
async function loadTransactions() {
  try {
    const res = await fetch("/api/transactions");
    transactions = await res.json();
    renderTable();
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

// --- Render table ---
function renderTable() {
  tableBody.innerHTML = "";
  let balance = 0;

  transactions.forEach((t, index) => {
    const row = document.createElement("tr");
    row.dataset.index = index;

    const sourceCell = document.createElement("td");
    sourceCell.textContent = t.source;

    const amountCell = document.createElement("td");
    amountCell.textContent = "$" + t.amount.toFixed(2);

    const dateCell = document.createElement("td");
    dateCell.textContent = t.date;

    const typeCell = document.createElement("td");
    typeCell.textContent = t.type;

    const buttonCell = document.createElement("td");
    const button = document.createElement("button");
    button.textContent = "Delete";
    button.classList.add("delete-btn");
    button.style.width = "100px";
    button.style.height = "50px";
    buttonCell.appendChild(button);

    row.appendChild(sourceCell);
    row.appendChild(amountCell);
    row.appendChild(dateCell);
    row.appendChild(typeCell);
    row.appendChild(buttonCell);

    tableBody.appendChild(row);

    if (t.type === "Funding") {
      balance += t.amount;
    } else {
      balance -= t.amount;
    }
  });

  balanceEl.textContent = "Balance: $" + balance.toFixed(2);
}

// --- Delete transaction ---
tableBody.addEventListener("click", async function (e) {
  if (e.target.classList.contains("delete-btn")) {
    const row = e.target.closest("tr");
    const index = row.dataset.index;

    history.push(JSON.parse(JSON.stringify(transactions)));
    historyRedo = [];

    transactions.splice(index, 1);
    await saveTransactions();
    renderTable();
  }
});

// --- Undo/Redo ---
async function undo() {
  if (history.length > 0) {
    historyRedo.push(JSON.parse(JSON.stringify(transactions)));
    transactions = history.pop();
    await saveTransactions();
    renderTable();
  }
}

async function redo() {
  if (historyRedo.length > 0) {
    history.push(JSON.parse(JSON.stringify(transactions)));
    transactions = historyRedo.pop();
    await saveTransactions();
    renderTable();
  }
}

document.addEventListener("keydown", function(event) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
    event.preventDefault();
    undo();
  }
  if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
    event.preventDefault();
    redo();
  }
});

// --- Initial load ---
loadTransactions();
