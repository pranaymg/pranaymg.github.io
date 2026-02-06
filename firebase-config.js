// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvXxvxKp7VZQqH5vYJ9K_8xGxGxGxGxGx",
  authDomain: "finance-tracker-pec.firebaseapp.com",
  databaseURL: "https://finance-tracker-pec-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "finance-tracker-pec",
  storageBucket: "finance-tracker-pec.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789abcdef"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Auth Object with Firebase
const Auth = {
  register: function(email, password, fullname) {
    return auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        return database.ref('users/' + user.uid).set({
          fullname: fullname,
          email: email,
          createdAt: Date.now()
        }).then(() => ({ success: true, user: { email, fullname, uid: user.uid } }));
      })
      .catch((error) => ({ success: false, message: error.message }));
  },

  login: function(email, password) {
    return auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        return database.ref('users/' + user.uid).once('value')
          .then((snapshot) => {
            const userData = snapshot.val();
            return { success: true, user: { email, fullname: userData.fullname, uid: user.uid } };
          });
      })
      .catch((error) => ({ success: false, message: error.message }));
  },

  logout: function() {
    return auth.signOut();
  },

  getCurrentUser: function() {
    const user = auth.currentUser;
    if (user) {
      return database.ref('users/' + user.uid).once('value')
        .then((snapshot) => {
          const userData = snapshot.val();
          return { email: user.email, fullname: userData.fullname, uid: user.uid };
        });
    }
    return Promise.resolve(null);
  },

  isLoggedIn: function() {
    return auth.currentUser !== null;
  }
};

// DataManager Object with Firebase
const DataManager = {
  saveTransactions: function(transactions) {
    const user = auth.currentUser;
    if (user) {
      return database.ref('transactions/' + user.uid).set(transactions);
    }
  },

  loadTransactions: function() {
    const user = auth.currentUser;
    if (user) {
      return database.ref('transactions/' + user.uid).once('value')
        .then((snapshot) => snapshot.val() || []);
    }
    return Promise.resolve([]);
  }
};
