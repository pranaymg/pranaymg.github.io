# Firebase Setup Instructions

## Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Enter project name: "finance-tracker" (or any name)
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication
1. In Firebase Console, click "Authentication"
2. Click "Get started"
3. Click "Email/Password" under Sign-in method
4. Enable "Email/Password"
5. Click "Save"

## Step 3: Enable Realtime Database
1. In Firebase Console, click "Realtime Database"
2. Click "Create Database"
3. Select location (closest to your users)
4. Start in "Test mode" (for development)
5. Click "Enable"

## Step 4: Get Configuration
1. Click the gear icon ⚙️ next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps"
4. Click the web icon (</>)
5. Register app with nickname "finance-tracker-web"
6. Copy the firebaseConfig object

## Step 5: Update firebase-config.js
Replace the firebaseConfig in `firebase-config.js` with your copied config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR-API-KEY",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Step 6: Update Database Rules (Optional - for production)
In Realtime Database > Rules, replace with:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "transactions": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

## Done!
Your app now uses Firebase instead of localStorage. All user data is stored online.

## Free Tier Limits
- 1GB storage
- 10GB/month bandwidth
- 100 simultaneous connections
- Perfect for small to medium projects
