// Auth system
const Auth = {
  signup(email, password) {
    if (!email) return false;
    localStorage.setItem('currentUser', email);
    return true;
  },

  login(email, password) {
    if (!email) return false;
    localStorage.setItem('currentUser', email);
    return true;
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
