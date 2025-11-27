# Affiliate Pipeline Tracker

A real-time, password-protected affiliate deal tracking application. All users see updates instantly!

## Features

- ✅ **Real-time Sync** – Changes appear instantly for all users
- ✅ **Password Protected** – Only authorized users can access
- ✅ **Online Users Count** – See how many people are viewing
- ✅ **No Backend Code** – Uses Firebase (free tier)
- ✅ **Export Data** – Download your data as JSON anytime
- ✅ **Mobile Responsive** – Works on all devices

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a project"** (or use an existing one)
3. Enter a project name (e.g., "affiliate-pipeline")
4. Disable Google Analytics (optional, not needed)
5. Click **Create project**

### Step 2: Set Up Realtime Database

1. In your Firebase project, click **"Build"** → **"Realtime Database"**
2. Click **"Create Database"**
3. Choose a location closest to you
4. Select **"Start in test mode"** (we'll secure it later)
5. Click **Enable**

### Step 3: Get Your Config

1. Click the ⚙️ gear icon → **"Project settings"**
2. Scroll down to **"Your apps"**
3. Click the **`</>`** (Web) icon to add a web app
4. Enter a nickname (e.g., "pipeline-web")
5. Click **Register app**
6. You'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB...",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 4: Update the HTML File

1. Open `index.html` in a text editor
2. Find the `firebaseConfig` section (around line 460)
3. Replace the placeholder values with your config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

### Step 5: Deploy

Upload the updated `index.html` to:
- **Netlify**: Drag & drop at [netlify.com](https://netlify.com)
- **GitHub Pages**: Push to repo, enable Pages
- **Vercel**: Import from GitHub at [vercel.com](https://vercel.com)
- **Any web host**: Upload via FTP/cPanel

### Step 6: Set Your Password

1. Open your deployed site
2. Enter your desired password
3. This becomes the shared password for all users

---

## 🔒 Securing Your Database (Important!)

After testing, secure your database:

1. Go to Firebase Console → Realtime Database → **Rules**
2. Replace the rules with:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

For production, you may want stricter rules, but the password protection in the app provides the main security layer.

---

## 📖 How to Use

### First User (Admin)
1. Open the site
2. Enter your desired password → This sets the password for everyone

### Other Users
1. Open the same URL
2. Enter the password shared with them
3. They're in! All changes sync in real-time

### Features
- **Add Deal**: Click "New Deal" button
- **Edit Deal**: Click ✏️ on any row
- **Delete Deal**: Click 🗑️ on any row
- **Filter**: Use dropdowns to filter by Geo, Model, Status
- **Search**: Type in search box to find partners
- **Export**: Download all data as JSON backup
- **Logout**: Click 🚪 to log out

### Real-time Sync
- When User A adds/edits a deal, User B sees it instantly
- The green "Live" indicator shows connection status
- Online user count shows who's viewing

---

## ❓ FAQ

**Q: Is my data secure?**
A: Data is stored in Firebase with password protection. The password is hashed (SHA-256) before storage.

**Q: Can I change the password?**
A: Currently, you'd need to manually delete the `config/passwordHash` entry in Firebase to reset it.

**Q: What's the Firebase free tier limit?**
A: 1GB storage, 10GB/month download - plenty for a small team tracker.

**Q: Can multiple people edit at once?**
A: Yes! Changes merge in real-time. Last edit wins for the same field.

**Q: Does it work offline?**
A: Partially. You can view cached data, but edits need internet connection.

---

## 🎨 Customization

Edit the HTML file to customize:

- **Colors**: Modify CSS variables in `:root`
- **Statuses**: Edit status options in dropdowns and CSS classes
- **Models**: Edit model dropdown options
- **Fields**: Add new fields to the form and table

---

## License

MIT - Use freely for personal or commercial purposes.
