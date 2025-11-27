# Affiliate Pipeline Tracker

A simple, self-contained affiliate deal tracking application. Upload it to any static host and start tracking your partner pipeline immediately.

![Status Tracking](https://img.shields.io/badge/Status-Ready%20to%20Deploy-brightgreen)

## Features

- ✅ **No Backend Required** – Runs entirely in the browser
- ✅ **Data Persistence** – Uses localStorage (data survives page refresh)
- ✅ **Export/Import** – Backup and share data via JSON files
- ✅ **Filtering** – Filter by Geo, Model, Status, or search by name
- ✅ **Mobile Responsive** – Works on desktop and mobile devices
- ✅ **Dark Theme** – Easy on the eyes

## Quick Deploy

### Option 1: GitHub Pages (Free)
1. Create a new GitHub repository
2. Upload `index.html`
3. Go to Settings → Pages → Select "main" branch
4. Your site will be live at `https://yourusername.github.io/repo-name`

### Option 2: Netlify (Free)
1. Go to [netlify.com](https://netlify.com) and sign up
2. Drag & drop the `index.html` file onto the dashboard
3. Done! You'll get a URL like `random-name.netlify.app`

### Option 3: Vercel (Free)
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repo or upload the file
3. Instant deployment

### Option 4: Any Web Host
Simply upload `index.html` to your web hosting provider (cPanel, FTP, etc.)

## How to Use

### Adding Deals
1. Click **"New Deal"** button
2. Fill in partner details
3. Click **Save Deal**

### Editing Deals
1. Click the ✏️ edit button on any row
2. Modify the details
3. Click **Save Deal**

### Filtering
Use the dropdown filters to narrow down by:
- **Geo** – Geographic region
- **Model** – Revenue model (CPA, RevShare, Hybrid, Flat Fee)
- **Status** – Current deal status
- **Search** – Type to search partner names

### Data Backup
- **Export**: Click "Export" to download all data as JSON
- **Import**: Click "Import" to restore data from a JSON file

### Keyboard Shortcuts
- `Ctrl/Cmd + N` – Open new deal form
- `Escape` – Close modal

## Deal Statuses

| Status | Description |
|--------|-------------|
| 🔵 New | Just added, not contacted yet |
| 🟡 Contacted | Initial outreach made |
| 🟣 Negotiating | In active discussions |
| 🟢 Approved | Deal approved, pending activation |
| 🔷 Active | Live and running |
| 🟠 Paused | Temporarily on hold |
| 🔴 Rejected | Deal did not proceed |

## Data Storage

Data is stored in your browser's localStorage. This means:
- ✅ Data persists between sessions
- ✅ Works offline once loaded
- ⚠️ Data is per-browser (different browsers = different data)
- ⚠️ Clearing browser data will erase the deals

**Pro Tip**: Use the Export feature regularly to backup your data!

## Sharing Data Between Users

Since data is stored locally in each browser:

1. **User A** exports data via the Export button
2. Share the JSON file with **User B** (email, Slack, etc.)
3. **User B** imports the file via the Import button

For real-time collaboration, consider upgrading to a version with a backend database.

## Customization

The entire application is in a single `index.html` file. You can easily customize:

- **Colors**: Modify CSS variables in `:root`
- **Statuses**: Edit the status options in both the filter dropdown and form
- **Models**: Edit the model options
- **Fields**: Add new form fields and table columns

## License

MIT – Use freely for personal or commercial purposes.
