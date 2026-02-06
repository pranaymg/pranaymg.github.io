# Authentication & Memory System

## Overview
This Personal Finance Tracker now includes a complete authentication and data persistence system using browser localStorage.

## Features

### Authentication
- **User Registration**: Create new accounts with email, mobile, and password
- **User Login**: Login with email or mobile number
- **Session Management**: Automatic session persistence across page reloads
- **Logout**: Clear session and return to login

### Data Persistence
- **Transaction Storage**: All transactions are saved per user
- **Automatic Loading**: Transactions load automatically when user logs in
- **User Isolation**: Each user's data is stored separately

## How It Works

### Registration Flow
1. User fills signup form (name, email, mobile, password)
2. System validates password match
3. User data stored in localStorage
4. Redirect to login page

### Login Flow
1. User enters email/mobile and password
2. System validates credentials
3. Session created in localStorage
4. Redirect to main page with user's data loaded

### Data Storage
- **Users**: `localStorage.users` - Array of all registered users
- **Current Session**: `localStorage.currentUser` - Currently logged in user
- **Transactions**: `localStorage.transactions_{email}` - User-specific transactions

## Files Modified

1. **auth.js** (NEW)
   - Authentication functions
   - Data management functions

2. **login.html**
   - Added form submission handler
   - Integrated with Auth system

3. **sign-up.html**
   - Added registration handler
   - Password validation

4. **index.html**
   - Shows user name when logged in
   - Logout button
   - Conditional UI display

5. **script.js**
   - Load transactions on page load
   - Save transactions after add/edit/delete
   - User-specific data storage

## Usage

### For Users
1. **Sign Up**: Go to sign-up page and create account
2. **Login**: Use email or mobile with password
3. **Track Finances**: Add transactions - they're automatically saved
4. **Logout**: Click logout button to end session

### For Developers
```javascript
// Check if user is logged in
if (Auth.isLoggedIn()) {
  const user = Auth.getCurrentUser();
  console.log(user.fullname);
}

// Save transactions
DataManager.saveTransactions(transactions);

// Load transactions
const transactions = DataManager.loadTransactions();
```

## Security Notes
- Passwords are stored in plain text (localStorage only)
- For production, implement proper backend authentication
- Use HTTPS and secure password hashing
- Consider JWT tokens for session management

## Browser Compatibility
Works in all modern browsers that support localStorage:
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)
