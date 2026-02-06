// Transactions array - per user
const currentUser = Auth.getCurrentUser();
let transactions = JSON.parse(localStorage.getItem('transactions_' + currentUser) || '[]');

// Save to localStorage - per user
function saveTransactions() {
  localStorage.setItem('transactions_' + currentUser, JSON.stringify(transactions));
}

// Add transaction
function addTransaction() {
  const description = document.getElementById('description').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const type = document.getElementById('type').value;
  const date = document.getElementById('date').value || new Date().toISOString().split('T')[0];

  if (!description || !amount) {
    alert('Please enter description and amount');
    return;
  }

  transactions.push({
    id: Date.now(),
    description,
    amount,
    category,
    type,
    date
  });

  saveTransactions();
  document.getElementById('description').value = '';
  document.getElementById('amount').value = '';
  document.getElementById('date').value = '';
  updateBalance();
  updateTable();
}

// Delete transaction
function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveTransactions();
  updateBalance();
  updateTable();
}

// Update balance
function updateBalance() {
  const balance = transactions.reduce((sum, t) => {
    return t.type === 'income' ? sum + t.amount : sum - t.amount;
  }, 0);

  const currency = document.getElementById('currency').value;
  const symbols = { USD: '$', EUR: '€', INR: '₹' };
  document.getElementById('balance').textContent = symbols[currency] + balance.toFixed(2);
}

// Update table
function updateTable() {
  const table = document.getElementById('transaction-table');
  while (table.rows.length > 1) table.deleteRow(1);

  transactions.forEach(t => {
    const row = table.insertRow();
    row.innerHTML = `
      <td>${t.date}</td>
      <td>${t.description}</td>
      <td>${t.amount}</td>
      <td>${t.category}</td>
      <td>${t.type}</td>
      <td>
        <button class="delete-button" onclick="deleteTransaction(${t.id})">Delete</button>
      </td>
    `;
  });
}

// Category analysis
function showCategoryAnalysis() {
  const expenses = transactions.filter(t => t.type === 'expense');
  const totals = {};
  let total = 0;
  
  expenses.forEach(t => {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
    total += t.amount;
  });

  const currency = document.getElementById('currency').value;
  const symbols = { USD: '$', EUR: '€', INR: '₹' };
  
  let html = '<h2 style="text-align:center;margin-bottom:30px"><i class="fas fa-chart-pie"></i> Expense Categories</h2>';
  
  if (Object.keys(totals).length === 0) {
    html += '<p style="text-align:center;opacity:0.7">No expenses recorded yet.</p>';
  } else {
    html += '<div style="display:grid;gap:20px">';
    Object.entries(totals).sort((a,b) => b[1] - a[1]).forEach(([cat, amt]) => {
      const percent = ((amt/total)*100).toFixed(1);
      html += `
        <div style="padding:20px;background:rgba(255,255,255,0.05);border-radius:15px;border:1px solid rgba(255,255,255,0.1)">
          <div style="display:flex;justify-content:space-between;margin-bottom:10px">
            <strong style="font-size:16px">${cat}</strong>
            <span style="color:#43e97b;font-weight:bold;font-size:16px">${symbols[currency]}${amt.toFixed(2)}</span>
          </div>
          <div style="background:rgba(255,255,255,0.1);border-radius:10px;height:12px;overflow:hidden;margin-bottom:8px">
            <div style="background:linear-gradient(135deg,#43e97b 0%,#38f9d7 100%);height:100%;width:${percent}%;transition:width 0.5s ease"></div>
          </div>
          <div style="text-align:right;font-size:14px;color:rgba(255,255,255,0.7);font-weight:600">${percent}%</div>
        </div>
      `;
    });
    html += '</div>';
  }
  
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:10000;padding:20px';
  modal.onclick = () => modal.remove();
  
  const card = document.createElement('div');
  card.style.cssText = 'background:rgba(0,0,0,0.4);backdrop-filter:blur(40px) saturate(200%) brightness(110%);padding:40px;border-radius:30px;max-width:600px;width:100%;max-height:80vh;overflow-y:auto;border:1px solid rgba(255,255,255,0.1);box-shadow:0 8px 32px rgba(0,0,0,0.3);color:#fff';
  card.onclick = (e) => e.stopPropagation();
  
  card.innerHTML = html + '<button onclick="this.closest(\'div\').parentElement.remove()" style="padding:15px;border:none;background:linear-gradient(135deg,#43e97b 0%,#38f9d7 100%);color:#1a1a2e;border-radius:15px;cursor:pointer;width:100%;font-weight:700;font-size:16px;margin-top:20px">Close</button>';
  
  modal.appendChild(card);
  document.body.appendChild(modal);
}

// Export
function handleDownload() {
  const csv = 'Date,Description,Amount,Category,Type\n' + 
    transactions.map(t => `${t.date},${t.description},${t.amount},${t.category},${t.type}`).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'transactions.csv';
  a.click();
}

// SMS Reader stub
const SMSReader = {
  showSMSInput: () => alert('SMS import feature coming soon!')
};

// Email invite
function sendEmailInvite() {
  const email = document.getElementById('invite-email').value;
  if (email) {
    window.location.href = `mailto:${email}?subject=Join Finance Tracker`;
  }
}

function shareOnLinkedIn() {
  window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(window.location.href));
}

function shareOnTwitter() {
  window.open('https://twitter.com/intent/tweet?url=' + encodeURIComponent(window.location.href));
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  if (currentUser) {
    document.getElementById('user-name').textContent = currentUser;
  }
  updateBalance();
  updateTable();
});

// Logout
function logout() {
  Auth.logout();
  window.location.href = './login.html';
}
