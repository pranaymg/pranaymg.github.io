// JSONBin.io Configuration - Free Online Database
const DB_CONFIG = {
  apiKey: '$2a$10$vXqKjH8xGxGxGxGxGxGxGxGxGxGxGxGxGxGxGxGxGxGxGxGxGxGx',
  baseUrl: 'https://api.jsonbin.io/v3'
};

// Database Helper
const DB = {
  async request(method, endpoint, data = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': DB_CONFIG.apiKey
      }
    };
    if (data) options.body = JSON.stringify(data);
    
    const response = await fetch(DB_CONFIG.baseUrl + endpoint, options);
    return response.json();
  },

  async createBin(data) {
    return this.request('POST', '/b', data);
  },

  async readBin(binId) {
    return this.request('GET', `/b/${binId}/latest`);
  },

  async updateBin(binId, data) {
    return this.request('PUT', `/b/${binId}`, data);
  }
};

// Auth Object with JSONBin
const Auth = {
  register: function(email, password, fullname) {
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
      binId: null
    };
    
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify({ email, fullname, userId }));
    
    return { success: true, user: { email, fullname, userId } };
  },

  login: function(email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const user = users[email];
    
    if (!user || user.password !== btoa(password)) {
      return { success: false, message: 'Invalid email or password' };
    }
    
    localStorage.setItem('currentUser', JSON.stringify({ 
      email: user.email, 
      fullname: user.fullname, 
      userId: user.userId,
      binId: user.binId
    }));
    
    return { success: true, user: { email: user.email, fullname: user.fullname, userId: user.userId } };
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

// DataManager Object with JSONBin
const DataManager = {
  async saveTransactions(transactions) {
    const user = Auth.getCurrentUser();
    if (!user) return;

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const userData = users[user.email];

    try {
      if (userData.binId) {
        await DB.updateBin(userData.binId, { transactions });
      } else {
        const result = await DB.createBin({ transactions });
        userData.binId = result.metadata.id;
        users[user.email] = userData;
        localStorage.setItem('users', JSON.stringify(users));
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        currentUser.binId = result.metadata.id;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }
    } catch (error) {
      console.error('Error saving to JSONBin:', error);
      localStorage.setItem('transactions_' + user.userId, JSON.stringify(transactions));
    }
  },

  async loadTransactions() {
    const user = Auth.getCurrentUser();
    if (!user) return [];

    if (user.binId) {
      try {
        const result = await DB.readBin(user.binId);
        return result.record.transactions || [];
      } catch (error) {
        console.error('Error loading from JSONBin:', error);
      }
    }
    
    const local = localStorage.getItem('transactions_' + user.userId);
    return local ? JSON.parse(local) : [];
  }
};
