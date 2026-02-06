// LocalStorage Only - No JSONBin
const Auth = {
  register: function(fullname, email, mobile, password) {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (users[email]) {
      return { success: false, message: 'Email already registered' };
    }
    
    const userId = 'user_' + Date.now();
    users[email] = {
      userId,
      email,
      password: btoa(password),
      fullname,
      mobile
    };
    
    localStorage.setItem('users', JSON.stringify(users));
    
    return { success: true, message: 'Registration successful! Please login.' };
  },

  login: function(username, password) {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const user = users[username];
    
    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }
    
    if (user.password !== btoa(password)) {
      return { success: false, message: 'Invalid credentials' };
    }
    
    localStorage.setItem('currentUser', JSON.stringify({ 
      email: user.email, 
      fullname: user.fullname, 
      userId: user.userId
    }));
    
    return { success: true, message: 'Login successful!' };
  },

  logout: function() {
    localStorage.removeItem('currentUser');
    window.location.href = './login.html';
  },

  getCurrentUser: function() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  },

  isLoggedIn: function() {
    return localStorage.getItem('currentUser') !== null;
  }
};

const DataManager = {
  saveTransactions(transactions) {
    const user = Auth.getCurrentUser();
    if (!user) return;
    localStorage.setItem('transactions_' + user.userId, JSON.stringify(transactions));
  },

  loadTransactions() {
    const user = Auth.getCurrentUser();
    if (!user) return [];
    const data = localStorage.getItem('transactions_' + user.userId);
    return data ? JSON.parse(data) : [];
  }
};
