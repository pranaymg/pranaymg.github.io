# SMS Auto-Tracking Feature

## Overview
Your Personal Finance Tracker now includes SMS transaction parsing to automatically import bank transactions from SMS messages.

## How It Works

### Browser Limitations
⚠️ **Important**: Web browsers cannot directly read SMS messages due to security restrictions. However, we provide easy manual import options.

## Features

### 1. Manual SMS Import (Available Now)
- Click "Import SMS" button
- Paste your bank SMS messages
- Automatic parsing and categorization
- Instant transaction import

### 2. Supported SMS Formats
The parser recognizes common Indian bank SMS patterns:

**Debit/Expense:**
```
Rs.500 debited from A/c XX1234 at AMAZON on 15-Jan
Your A/c XX1234 debited by Rs 1,250.00 at SWIGGY
INR 750 spent at UBER on 20-Jan-2025
```

**Credit/Income:**
```
Rs.2000 credited to A/c XX1234 from SALARY on 16-Jan
Your A/c credited with Rs 5,000.00 on 18-Jan
INR 1500 received from UPI-JOHN DOE
```

### 3. Auto-Detection
- Amount extraction (handles Rs, INR, ₹)
- Transaction type (debit/credit)
- Merchant/description
- Automatic categorization

## Usage Instructions

### Method 1: Copy-Paste (Easiest)
1. Open your SMS app
2. Copy bank transaction messages
3. Click "Import SMS" in Finance Tracker
4. Paste messages (one per line)
5. Click "Import"
6. ✅ Transactions automatically added!

### Method 2: File Upload
1. Export SMS to text file
2. Click "Import SMS"
3. Upload file
4. Auto-parse and import

### Method 3: SMS Backup Apps
Use apps like:
- SMS Backup & Restore
- SMS Organizer
- Export to TXT/CSV
- Import to Finance Tracker

## For Mobile App (Future Enhancement)

To enable true automatic SMS reading, you would need:

### Android App Requirements:
```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.READ_SMS" />
<uses-permission android:name="android.permission.RECEIVE_SMS" />
```

### Technologies:
- **Cordova/Capacitor**: Convert web app to mobile
- **React Native**: Build native mobile app
- **Flutter**: Cross-platform mobile app
- **PWA**: Progressive Web App with limited SMS access

### Implementation Steps:
1. Convert to mobile app using Cordova/Capacitor
2. Add SMS permissions
3. Install SMS plugin
4. Auto-read and parse new SMS
5. Background sync

## Example SMS Messages

Try importing these sample messages:

```
Rs.500 debited from A/c XX1234 at AMAZON on 15-Jan-2025
Rs.2000 credited to A/c XX1234 from SALARY on 16-Jan-2025
Your A/c XX5678 debited by Rs 1,250.00 at SWIGGY on 17-Jan
INR 750 spent at UBER on 18-Jan-2025
Rs 5,000.00 credited to your account on 19-Jan
```

## Privacy & Security

✅ **Your data is safe:**
- All processing happens locally in your browser
- No SMS data sent to servers
- No external API calls
- Data stored only in your browser's localStorage

## Supported Banks

The parser works with SMS from most Indian banks:
- SBI, HDFC, ICICI, Axis
- Kotak, PNB, BOB, Canara
- PayTM, PhonePe, Google Pay
- And many more!

## Tips for Best Results

1. **Clean SMS**: Remove extra spaces and special characters
2. **One per line**: Each SMS on a new line
3. **Recent messages**: Import recent transactions first
4. **Verify amounts**: Check imported transactions for accuracy
5. **Edit if needed**: You can edit any imported transaction

## Troubleshooting

**No transactions detected?**
- Check SMS format matches patterns
- Ensure amount is clearly visible
- Try reformatting the message

**Wrong amount?**
- Parser looks for Rs, INR, or ₹ symbols
- Handles commas in amounts (1,250.00)
- Edit transaction after import if needed

**Wrong type (income/expense)?**
- Parser looks for keywords: debited, credited, spent, received
- Manually change type after import

## Future Enhancements

- [ ] AI-powered SMS parsing
- [ ] More bank patterns
- [ ] Automatic categorization
- [ ] Duplicate detection
- [ ] Mobile app with auto-read
- [ ] Email transaction import
- [ ] Bank API integration
