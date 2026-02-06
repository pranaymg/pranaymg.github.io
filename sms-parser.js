// SMS Transaction Parser
const SMSParser = {
  // Common bank SMS patterns
  patterns: [
    // Debit patterns
    {
      regex: /(?:debited|spent|paid|withdrawn).*?(?:rs\.?|inr|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
      type: 'expense',
      amountGroup: 1
    },
    {
      regex: /(?:rs\.?|inr|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?).*?(?:debited|spent|paid|withdrawn)/i,
      type: 'expense',
      amountGroup: 1
    },
    // Credit patterns
    {
      regex: /(?:credited|received|deposited).*?(?:rs\.?|inr|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
      type: 'income',
      amountGroup: 1
    },
    {
      regex: /(?:rs\.?|inr|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?).*?(?:credited|received|deposited)/i,
      type: 'income',
      amountGroup: 1
    }
  ],

  // Extract merchant/description
  extractDescription(sms) {
    // Try to find merchant name
    const merchantPatterns = [
      /(?:at|to|from)\s+([A-Z][A-Za-z0-9\s]{2,30}?)(?:\s+on|\.|$)/,
      /(?:merchant|vendor):\s*([A-Za-z0-9\s]{3,30})/i,
      /UPI-([A-Za-z0-9\s]{3,30}?)(?:\s|$)/i
    ];

    for (let pattern of merchantPatterns) {
      const match = sms.match(pattern);
      if (match) return match[1].trim();
    }

    // Fallback: first 30 chars
    return sms.substring(0, 30).trim();
  },

  // Parse SMS message
  parse(smsText) {
    for (let pattern of this.patterns) {
      const match = smsText.match(pattern.regex);
      if (match) {
        const amountStr = match[pattern.amountGroup].replace(/,/g, '');
        const amount = parseFloat(amountStr);
        const description = this.extractDescription(smsText);
        
        return {
          amount,
          type: pattern.type,
          description,
          date: new Date(),
          source: 'SMS'
        };
      }
    }
    return null;
  },

  // Process multiple SMS messages
  parseMultiple(smsArray) {
    return smsArray
      .map(sms => this.parse(sms))
      .filter(transaction => transaction !== null);
  }
};

// SMS Reader Interface (Browser-based)
const SMSReader = {
  // Manual SMS input
  showSMSInput() {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.8); z-index: 10000;
      display: flex; align-items: center; justify-content: center;
    `;
    
    modal.innerHTML = `
      <div style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; width: 90%;">
        <h2 style="margin-top: 0;">Import SMS Transactions</h2>
        <p style="color: #666;">Paste your bank SMS messages below (one per line):</p>
        <textarea id="sms-input" rows="10" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;" placeholder="Example:
Rs.500 debited from A/c XX1234 at AMAZON on 15-Jan
Rs.2000 credited to A/c XX1234 from SALARY on 16-Jan"></textarea>
        <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
          <button onclick="this.closest('div').parentElement.remove()" style="padding: 10px 20px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer;">Cancel</button>
          <button onclick="SMSReader.processSMSInput()" style="padding: 10px 20px; border: none; background: #0b0081; color: white; border-radius: 6px; cursor: pointer;">Import</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  },

  // Process manual SMS input
  processSMSInput() {
    const textarea = document.getElementById('sms-input');
    const smsMessages = textarea.value.split('\n').filter(line => line.trim());
    
    const transactions = SMSParser.parseMultiple(smsMessages);
    
    if (transactions.length === 0) {
      showErrorMessage('No valid transactions found in SMS messages');
      return;
    }

    // Add to transactions array
    transactions.forEach(trans => {
      const transaction = {
        primeId: trans.date.getTime() + Math.random(),
        description: trans.description,
        amount: trans.amount,
        type: trans.type
      };
      window.transactions.push(transaction);
    });

    // Save and update
    DataManager.saveTransactions(window.transactions);
    updateBalance();
    updateTransactionTable();

    // Close modal
    document.querySelector('[style*="rgba(0,0,0,0.8)"]').remove();
    
    showSuccessMessage(`${transactions.length} transaction(s) imported from SMS`);
  },

  // File upload for SMS export
  showFileUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.csv';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        const smsMessages = content.split('\n').filter(line => line.trim());
        const transactions = SMSParser.parseMultiple(smsMessages);
        
        if (transactions.length === 0) {
          showErrorMessage('No valid transactions found');
          return;
        }

        transactions.forEach(trans => {
          const transaction = {
            primeId: trans.date.getTime() + Math.random(),
            description: trans.description,
            amount: trans.amount,
            type: trans.type
          };
          window.transactions.push(transaction);
        });

        DataManager.saveTransactions(window.transactions);
        updateBalance();
        updateTransactionTable();
        showSuccessMessage(`${transactions.length} transaction(s) imported`);
      };
      reader.readAsText(file);
    };
    input.click();
  }
};

// Android SMS Reader (requires mobile app or PWA with permissions)
const AndroidSMSReader = {
  async requestPermission() {
    if (!('permissions' in navigator)) {
      return { error: 'SMS permissions not supported in browser' };
    }
    
    try {
      // This would work in a PWA or mobile app context
      const result = await navigator.permissions.query({ name: 'sms' });
      return { granted: result.state === 'granted' };
    } catch (error) {
      return { error: 'SMS access requires mobile app or PWA' };
    }
  },

  // Note: Actual SMS reading requires native mobile app
  getInstructions() {
    return `
      To enable automatic SMS reading:
      
      1. MOBILE APP OPTION:
         - Build Android app using Cordova/Capacitor
         - Add SMS READ permission
         - Use native SMS plugin
      
      2. MANUAL IMPORT (Current):
         - Copy SMS messages
         - Click "Import SMS" button
         - Paste messages
         - Auto-parse transactions
      
      3. EXPORT FROM PHONE:
         - Use SMS backup app
         - Export as TXT/CSV
         - Upload file here
    `;
  }
};
