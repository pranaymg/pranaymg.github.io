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
  
  updateStats();
}

// Update stats cards
function updateStats() {
  const currency = document.getElementById('currency').value;
  const symbols = { USD: '$', EUR: '€', INR: '₹' };
  
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  
  const now = new Date();
  const monthExpense = transactions.filter(t => {
    const tDate = new Date(t.date);
    return t.type === 'expense' && tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
  }).reduce((sum, t) => sum + t.amount, 0);
  
  document.getElementById('total-income').textContent = symbols[currency] + totalIncome.toFixed(2);
  document.getElementById('total-expense').textContent = symbols[currency] + totalExpense.toFixed(2);
  document.getElementById('month-expense').textContent = symbols[currency] + monthExpense.toFixed(2);
  document.getElementById('total-transactions').textContent = transactions.length;
}

// Update table
function updateTable() {
  const table = document.getElementById('transaction-table');
  while (table.rows.length > 1) table.deleteRow(1);

  transactions.forEach(t => {
    const row = table.insertRow();
    row.className = t.type === 'income' ? 'income-row' : 'expense-row';
    row.innerHTML = `
      <td>${t.date}</td>
      <td>${t.description}</td>
      <td style="color: ${t.type === 'income' ? '#00ff88' : '#ff2e97'}; font-weight: 700;">${t.type === 'income' ? '+' : '-'}${t.amount}</td>
      <td>${t.category}</td>
      <td><span style="padding: 5px 10px; border-radius: 10px; background: ${t.type === 'income' ? 'rgba(0,255,136,0.2)' : 'rgba(255,46,151,0.2)'}; color: ${t.type === 'income' ? '#00ff88' : '#ff2e97'}; font-size: 0.85rem; font-weight: 600;">${t.type}</span></td>
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
  // Set today's date as default
  document.getElementById('date').valueAsDate = new Date();
  updateBalance();
  updateTable();
});

// Logout
function logout() {
  Auth.logout();
  window.location.href = './login.html';
}

// Charts
let pieChart, lineChart;

function showCharts() {
  const section = document.getElementById('charts-section');
  section.style.display = section.style.display === 'none' ? 'block' : 'none';
  
  if (section.style.display === 'block') {
    renderPieChart();
    renderLineChart();
  }
}

function renderPieChart() {
  const expenses = transactions.filter(t => t.type === 'expense');
  const totals = {};
  
  expenses.forEach(t => {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  });
  
  const ctx = document.getElementById('pieChart');
  if (pieChart) pieChart.destroy();
  
  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(totals),
      datasets: [{
        data: Object.values(totals),
        backgroundColor: [
          '#00ff88', '#00d4ff', '#b537f2', '#ff2e97',
          '#ffd700', '#ff6b6b', '#667eea', '#38f9d7'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#fff', padding: 15, font: { size: 12 } }
        }
      }
    }
  });
}

function renderLineChart() {
  const last7Days = [];
  const incomeData = [];
  const expenseData = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    last7Days.push(dateStr);
    
    const dayIncome = transactions.filter(t => t.type === 'income' && t.date === dateStr).reduce((sum, t) => sum + t.amount, 0);
    const dayExpense = transactions.filter(t => t.type === 'expense' && t.date === dateStr).reduce((sum, t) => sum + t.amount, 0);
    
    incomeData.push(dayIncome);
    expenseData.push(dayExpense);
  }
  
  const ctx = document.getElementById('lineChart');
  if (lineChart) lineChart.destroy();
  
  lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: last7Days.map(d => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          borderColor: '#00ff88',
          backgroundColor: 'rgba(0, 255, 136, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Expenses',
          data: expenseData,
          borderColor: '#ff2e97',
          backgroundColor: 'rgba(255, 46, 151, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: { color: '#fff', padding: 15, font: { size: 12 } }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#fff' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        x: {
          ticks: { color: '#fff' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
      }
    }
  });
}

// Particle Background
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
for (let i = 0; i < 100; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 2 + 1,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5
  });
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0, 212, 255, 0.5)';
  
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  
  requestAnimationFrame(animateParticles);
}

animateParticles();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Toast Notifications
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle'
  };
  
  toast.innerHTML = `
    <i class="fas ${icons[type]}"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Confetti Effect
function createConfetti() {
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * window.innerWidth + 'px';
    confetti.style.top = '-10px';
    confetti.style.background = ['#00ff88', '#00d4ff', '#b537f2', '#ff2e97'][Math.floor(Math.random() * 4)];
    confetti.style.animationDelay = Math.random() * 0.5 + 's';
    document.body.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 3000);
  }
}

// Quick Add Transaction (FAB)
function quickAddTransaction() {
  document.getElementById('description').focus();
  document.getElementById('tracker').scrollIntoView({ behavior: 'smooth' });
}

// Update addTransaction to include toast and confetti
const originalAddTransaction = addTransaction;
addTransaction = function() {
  const oldBalance = transactions.reduce((sum, t) => {
    return t.type === 'income' ? sum + t.amount : sum - t.amount;
  }, 0);
  
  originalAddTransaction();
  
  const newBalance = transactions.reduce((sum, t) => {
    return t.type === 'income' ? sum + t.amount : sum - t.amount;
  }, 0);
  
  if (newBalance > oldBalance) {
    createConfetti();
    showToast('Transaction added! Balance increased! 🎉', 'success');
  } else {
    showToast('Transaction added successfully!', 'success');
  }
};

// Update deleteTransaction to include toast
const originalDeleteTransaction = deleteTransaction;
deleteTransaction = function(id) {
  originalDeleteTransaction(id);
  showToast('Transaction deleted', 'info');
};

// AI Insights
function showAIInsights() {
  const section = document.getElementById('ai-insights-section');
  section.style.display = section.style.display === 'none' ? 'block' : 'none';
  
  if (section.style.display === 'block') {
    generateAIInsights();
  }
}

function generateAIInsights() {
  const currency = document.getElementById('currency').value;
  const symbols = { USD: '$', EUR: '€', INR: '₹' };
  
  // Calculate metrics
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const avgExpense = totalExpense / (transactions.filter(t => t.type === 'expense').length || 1);
  
  // Category analysis
  const categoryTotals = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  
  // Trend analysis
  const last7Days = transactions.filter(t => {
    const date = new Date(t.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date >= weekAgo && t.type === 'expense';
  }).reduce((sum, t) => sum + t.amount, 0);
  
  // Day analysis
  const daySpending = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    const day = new Date(t.date).toLocaleDateString('en', { weekday: 'long' });
    daySpending[day] = (daySpending[day] || 0) + t.amount;
  });
  const bestDay = Object.entries(daySpending).sort((a, b) => a[1] - b[1])[0];
  
  // Financial Score (0-100)
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  const score = Math.max(0, Math.min(100, Math.round(savingsRate)));
  
  // Generate insights
  document.getElementById('ai-recommendation').textContent = 
    topCategory ? `You're spending most on ${topCategory[0]} (${symbols[currency]}${topCategory[1].toFixed(2)}). Consider setting a budget limit for this category.` 
    : 'Start tracking expenses to get personalized recommendations!';
  
  document.getElementById('ai-trend').textContent = 
    last7Days > 0 ? `Your spending in the last 7 days: ${symbols[currency]}${last7Days.toFixed(2)}. ${last7Days > avgExpense * 7 ? '⚠️ Higher than usual!' : '✅ Looking good!'}` 
    : 'No recent transactions to analyze.';
  
  document.getElementById('ai-alert').textContent = 
    totalExpense > totalIncome ? `⚠️ You've spent ${symbols[currency]}${(totalExpense - totalIncome).toFixed(2)} more than earned. Time to cut back!` 
    : `✅ Great! You're ${symbols[currency]}${(totalIncome - totalExpense).toFixed(2)} ahead.`;
  
  document.getElementById('ai-score').textContent = 
    `Your financial health score: ${score}/100. ${score >= 70 ? '🏆 Excellent!' : score >= 40 ? '📈 Good, keep improving!' : '⚠️ Needs attention!'}`;
  
  document.getElementById('ai-savings').textContent = 
    totalIncome > 0 ? `You could save ${symbols[currency]}${(totalExpense * 0.2).toFixed(2)} by reducing expenses by 20%. Small changes make big differences!` 
    : 'Add income transactions to see savings potential.';
  
  document.getElementById('ai-bestday').textContent = 
    bestDay ? `${bestDay[0]} is your lowest spending day (${symbols[currency]}${bestDay[1].toFixed(2)}). Try shopping on this day!` 
    : 'Track more transactions to find your best spending day.';
}

// Voice Command System
let recognition;
let isListening = false;

function initVoiceRecognition() {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      isListening = true;
      document.querySelector('.voice-btn').classList.add('listening');
      document.getElementById('voice-status').textContent = 'Listening... Speak now!';
      document.getElementById('voice-animation').style.display = 'flex';
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      document.getElementById('voice-transcript').textContent = `"${transcript}"`;
      processVoiceCommand(transcript);
    };
    
    recognition.onerror = (event) => {
      showToast('Voice recognition error: ' + event.error, 'error');
      stopListening();
    };
    
    recognition.onend = () => {
      stopListening();
    };
  } else {
    showToast('Voice recognition not supported in this browser', 'error');
  }
}

function toggleVoiceCommand() {
  const modal = document.getElementById('voice-modal');
  
  if (modal.style.display === 'none') {
    modal.style.display = 'flex';
    document.getElementById('voice-transcript').textContent = '';
    document.getElementById('voice-status').textContent = 'Click microphone to start...';
    document.getElementById('voice-animation').style.display = 'none';
    
    if (!recognition) initVoiceRecognition();
    
    setTimeout(() => {
      if (recognition) {
        recognition.start();
      }
    }, 500);
  } else {
    modal.style.display = 'none';
    if (recognition && isListening) {
      recognition.stop();
    }
  }
}

function stopListening() {
  isListening = false;
  document.querySelector('.voice-btn').classList.remove('listening');
  document.getElementById('voice-status').textContent = 'Processing...';
  document.getElementById('voice-animation').style.display = 'none';
}

function processVoiceCommand(command) {
  // Parse: "add 500 rupees food expense"
  // Parse: "add 1000 salary income"
  // Parse: "show balance"
  // Parse: "show charts"
  
  if (command.includes('show balance')) {
    document.getElementById('voice-modal').style.display = 'none';
    document.getElementById('tracker').scrollIntoView({ behavior: 'smooth' });
    showToast('Showing balance', 'info');
    return;
  }
  
  if (command.includes('show chart')) {
    document.getElementById('voice-modal').style.display = 'none';
    showCharts();
    showToast('Opening charts', 'info');
    return;
  }
  
  if (command.includes('show insight')) {
    document.getElementById('voice-modal').style.display = 'none';
    showAIInsights();
    showToast('Opening AI insights', 'info');
    return;
  }
  
  // Extract amount
  const amountMatch = command.match(/(\d+)/);
  if (!amountMatch) {
    showToast('Could not understand amount. Try: "add 500 food expense"', 'error');
    setTimeout(() => document.getElementById('voice-modal').style.display = 'none', 2000);
    return;
  }
  
  const amount = parseFloat(amountMatch[1]);
  
  // Determine type
  const isIncome = command.includes('income') || command.includes('salary') || command.includes('earning');
  const type = isIncome ? 'income' : 'expense';
  
  // Determine category
  let category = 'Other';
  const categories = ['food', 'shopping', 'transport', 'bills', 'entertainment', 'health', 'education', 'salary'];
  for (const cat of categories) {
    if (command.includes(cat)) {
      category = cat.charAt(0).toUpperCase() + cat.slice(1);
      break;
    }
  }
  
  // Add transaction
  const description = `Voice: ${category} ${type}`;
  const date = new Date().toISOString().split('T')[0];
  
  transactions.push({
    id: Date.now(),
    description,
    amount,
    category,
    type,
    date
  });
  
  saveTransactions();
  updateBalance();
  updateTable();
  
  document.getElementById('voice-modal').style.display = 'none';
  showToast(`Added ${type}: ₹${amount} for ${category}`, 'success');
  
  if (type === 'income') {
    createConfetti();
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  initVoiceRecognition();
});
