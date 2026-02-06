// Authentication System
const Auth = {
  register(fullname, email, mobile, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Email already registered' };
    }
    
    users.push({ fullname, email, mobile, password, createdAt: Date.now() });
    localStorage.setItem('users', JSON.stringify(users));
    return { success: true, message: 'Registration successful' };
  },

  login(username, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => (u.email === username || u.mobile === username) && u.password === password);
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify({ email: user.email, fullname: user.fullname }));
      return { success: true, message: 'Login successful' };
    }
    return { success: false, message: 'Invalid credentials' };
  },

  logout() {
    localStorage.removeItem('currentUser');
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
  },

  isLoggedIn() {
    return !!localStorage.getItem('currentUser');
  }
};

// Data Management System
const DataManager = {
  saveTransactions(transactions) {
    const user = Auth.getCurrentUser();
    if (!user) return;
    localStorage.setItem(`transactions_${user.email}`, JSON.stringify(transactions));
  },

  loadTransactions() {
    const user = Auth.getCurrentUser();
    if (!user) return [];
    return JSON.parse(localStorage.getItem(`transactions_${user.email}`) || '[]');
  }
};
