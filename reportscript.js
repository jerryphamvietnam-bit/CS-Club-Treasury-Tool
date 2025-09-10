document.getElementById("reportSelection").addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const date1 = new Date(document.getElementById("date1").value);
  const date2 = new Date(document.getElementById("date2").value);

  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  const filtered = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate >= date1 && tDate <= date2;
  });

  let totalFunding = 0;
  let totalExpenses = 0;

  filtered.forEach(t => {
    if (t.type === "Funding") {
      totalFunding += t.amount;
    } else if (t.type === "Expense") {
      totalExpenses += t.amount;
    }
  });

  const container = document.getElementById("pagesContainer");
  const reportPage = document.createElement("div");
  reportPage.style.border = "1px solid #ccc";
  reportPage.style.padding = "15px";
  reportPage.style.margin = "10px 0";
  reportPage.style.backgroundColor = "#2a2a2a";
  reportPage.style.color = "#C1C1C1";

  reportPage.innerHTML = `
    <h2>${name}</h2>
    <p><strong>Date Range:</strong> ${date1.toLocaleDateString()} → ${date2.toLocaleDateString()}</p>
    <p><strong>Total Funding:</strong> $${totalFunding.toFixed(2)}</p>
    <p><strong>Total Expenses:</strong> $${totalExpenses.toFixed(2)}</p>
    <p><strong>Net:</strong> $${(totalFunding - totalExpenses).toFixed(2)}</p>
  `;

  container.appendChild(reportPage);
});
