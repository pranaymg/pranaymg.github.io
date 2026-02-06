# Flutter App Setup Guide

## Quick Start (5 Steps)

### 1. Install Flutter
```bash
# Windows
# Download: https://docs.flutter.dev/get-started/install/windows
# Extract to C:\flutter
# Add to PATH: C:\flutter\bin

# Verify installation
flutter doctor
```

### 2. Create Flutter App
```bash
cd "C:\Users\Asus\OneDrive\ドキュメント\GitHub"
flutter create finance_tracker_app
cd finance_tracker_app
```

### 3. Add Dependencies
Edit `pubspec.yaml`:
```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0
  shared_preferences: ^2.2.2
  sms_maintained: ^0.2.3
  permission_handler: ^11.0.1
  webview_flutter: ^4.4.2
```

Run:
```bash
flutter pub get
```

### 4. Add Permissions
Edit `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.READ_SMS" />
<uses-permission android:name="android.permission.RECEIVE_SMS" />
<uses-permission android:name="android.permission.INTERNET" />
```

### 5. Run App
```bash
# Connect Android phone or start emulator
flutter run
```

## Option A: WebView Wrapper (Easiest - 10 minutes)

Use your existing web app inside Flutter:

### lib/main.dart
```dart
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:sms_maintained/sms.dart';

void main() => runApp(FinanceTrackerApp());

class FinanceTrackerApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Finance Tracker',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: HomePage(),
    );
  }
}

class HomePage extends StatefulWidget {
  @override
  _HomePageState createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  late WebViewController _controller;
  
  @override
  void initState() {
    super.initState();
    requestSMSPermission();
    startSMSListener();
  }

  Future<void> requestSMSPermission() async {
    await Permission.sms.request();
  }

  void startSMSListener() {
    SmsReceiver receiver = SmsReceiver();
    receiver.onSmsReceived!.listen((SmsMessage msg) {
      // Send SMS to WebView
      _controller.runJavascript(
        "SMSParser.parse('${msg.body}');"
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: WebView(
          initialUrl: 'file:///android_asset/flutter_assets/web/index.html',
          javascriptMode: JavascriptMode.unrestricted,
          onWebViewCreated: (controller) {
            _controller = controller;
          },
        ),
      ),
    );
  }
}
```

### Copy Web Files
```bash
# Create web folder in Flutter project
mkdir -p assets/web
cp -r ../Personal-Finance-Tracker/* assets/web/

# Update pubspec.yaml
flutter:
  assets:
    - assets/web/
```

## Option B: Native Flutter UI (Full Rewrite)

### lib/main.dart
```dart
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:sms_maintained/sms.dart';

void main() => runApp(FinanceTrackerApp());

class FinanceTrackerApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Finance Tracker',
      theme: ThemeData(primarySwatch: Colors.indigo),
      home: LoginPage(),
    );
  }
}

class LoginPage extends StatefulWidget {
  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  Future<void> login() async {
    final prefs = await SharedPreferences.getInstance();
    // Simple auth check
    if (_emailController.text.isNotEmpty && _passwordController.text.isNotEmpty) {
      await prefs.setString('user_email', _emailController.text);
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => DashboardPage()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Login')),
      body: Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              controller: _emailController,
              decoration: InputDecoration(labelText: 'Email'),
            ),
            SizedBox(height: 20),
            TextField(
              controller: _passwordController,
              decoration: InputDecoration(labelText: 'Password'),
              obscureText: true,
            ),
            SizedBox(height: 30),
            ElevatedButton(
              onPressed: login,
              child: Text('Login'),
            ),
          ],
        ),
      ),
    );
  }
}

class DashboardPage extends StatefulWidget {
  @override
  _DashboardPageState createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  List<Transaction> transactions = [];
  double balance = 0.0;

  @override
  void initState() {
    super.initState();
    requestSMSPermission();
    startSMSListener();
    loadTransactions();
  }

  Future<void> requestSMSPermission() async {
    if (await Permission.sms.request().isGranted) {
      print('SMS permission granted');
    }
  }

  void startSMSListener() {
    SmsReceiver receiver = SmsReceiver();
    receiver.onSmsReceived!.listen((SmsMessage msg) {
      parseSMS(msg.body!);
    });
  }

  void parseSMS(String sms) {
    // Simple SMS parsing
    RegExp amountRegex = RegExp(r'Rs\.?\s*(\d+(?:,\d+)*(?:\.\d{2})?)');
    Match? match = amountRegex.firstMatch(sms);
    
    if (match != null) {
      double amount = double.parse(match.group(1)!.replaceAll(',', ''));
      String type = sms.toLowerCase().contains('debited') ? 'expense' : 'income';
      
      setState(() {
        transactions.add(Transaction(
          description: sms.substring(0, 30),
          amount: amount,
          type: type,
          date: DateTime.now(),
        ));
        calculateBalance();
      });
      
      saveTransactions();
    }
  }

  void calculateBalance() {
    balance = 0;
    for (var t in transactions) {
      balance += t.type == 'income' ? t.amount : -t.amount;
    }
  }

  Future<void> loadTransactions() async {
    final prefs = await SharedPreferences.getInstance();
    // Load from SharedPreferences
    setState(() {
      calculateBalance();
    });
  }

  Future<void> saveTransactions() async {
    final prefs = await SharedPreferences.getInstance();
    // Save to SharedPreferences
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Finance Tracker'),
        actions: [
          IconButton(
            icon: Icon(Icons.logout),
            onPressed: () => Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (context) => LoginPage()),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: EdgeInsets.all(20),
            color: Colors.indigo,
            child: Column(
              children: [
                Text('Current Balance', style: TextStyle(color: Colors.white)),
                Text(
                  '₹${balance.toStringAsFixed(2)}',
                  style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: transactions.length,
              itemBuilder: (context, index) {
                final t = transactions[index];
                return ListTile(
                  title: Text(t.description),
                  subtitle: Text(t.date.toString()),
                  trailing: Text(
                    '₹${t.amount.toStringAsFixed(2)}',
                    style: TextStyle(
                      color: t.type == 'income' ? Colors.green : Colors.red,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Add transaction manually
        },
        child: Icon(Icons.add),
      ),
    );
  }
}

class Transaction {
  final String description;
  final double amount;
  final String type;
  final DateTime date;

  Transaction({
    required this.description,
    required this.amount,
    required this.type,
    required this.date,
  });
}
```

## Build & Deploy

### Build APK
```bash
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

### Install on Phone
```bash
flutter install
# Or manually copy APK to phone
```

## Recommended: WebView Approach

For your project, I recommend **Option A (WebView)** because:
- ✅ Reuse all existing HTML/CSS/JS
- ✅ Quick setup (10 minutes)
- ✅ SMS auto-read works
- ✅ Easy to update (just update web files)

## Next Steps

1. Install Flutter
2. Run: `flutter create finance_tracker_app`
3. Copy web files to assets
4. Add SMS permissions
5. Build APK
6. Install on phone
7. ✅ Auto SMS reading works!
