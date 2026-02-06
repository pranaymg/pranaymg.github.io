// Auth system
const Auth = {
  signup(email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[email]) return false;
    users[email] = password;
    localStorage.setItem('users', JSON.stringify(users));
    return true;
  },

  login(email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[email] && users[email] === password) {
      localStorage.setItem('currentUser', email);
      return true;
    }
    return false;
  },

  logout() {
    localStorage.removeItem('currentUser');
  },

  getCurrentUser() {
    return localStorage.getItem('currentUser');
  },

  isLoggedIn() {
    return !!localStorage.getItem('currentUser');
  },

  requireAuth() {
    if (!this.isLoggedIn() && !window.location.pathname.includes('login') && !window.location.pathname.includes('sign-up')) {
      window.location.href = './login.html';
    }
  }
};

// Initialize auth check
Auth.requireAuth();
