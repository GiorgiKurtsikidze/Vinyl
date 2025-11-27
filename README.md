# Affiliate Workflow Tracker

A simple, self-contained web application for tracking affiliate partnerships and deals. Perfect for teams that need to manage affiliate pipeline data collaboratively.

## Features

- ✅ **Add & Edit Deals** - Create and manage affiliate partnership records
- 🔍 **Filter & Search** - Filter by GEO, Model, and Status
- 💾 **Data Persistence** - All data stored locally in browser
- 📤 **Import/Export** - Backup and restore data as JSON files
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Modern UI** - Clean, professional interface

## Quick Start

### Option 1: Upload to Any Web Host (Recommended)

1. Upload all files (`index.html`, `styles.css`, `app.js`) to your web hosting service
2. Access through your domain or hosting URL
3. That's it! No configuration needed.

### Option 2: Use with GitHub Pages (Free Hosting)

1. Create a new repository on GitHub
2. Upload the files to the repository
3. Go to repository Settings → Pages
4. Select main branch as source
5. Your site will be available at `https://yourusername.github.io/repository-name`

### Option 3: Run Locally

Simply open `index.html` in your web browser. No server required!

## Hosting Providers

This app works with any web hosting service:

- **GitHub Pages** (Free) - https://pages.github.com
- **Netlify** (Free tier available) - https://www.netlify.com
  - Just drag and drop the files to deploy
- **Vercel** (Free tier available) - https://vercel.com
- **Cloudflare Pages** (Free) - https://pages.cloudflare.com
- **Any shared hosting** (Bluehost, HostGator, etc.)
  - Upload via FTP to your public_html folder

## Usage

### Adding a New Deal

1. Click "New Deal" button
2. Fill in the required fields:
   - Partner Name (required)
   - GEO (required) - e.g., US, UK, Global
   - Source - e.g., Direct, Network
   - Model (required) - CPA, CPS, CPL, RevShare, or Hybrid
   - Status (required) - New, In Progress, Active, Paused, or Closed
   - Details - Additional notes about the partnership
   - Next Steps - What actions need to be taken
3. Click "Save Deal"

### Filtering Deals

Use the filter dropdowns to show only deals matching specific criteria:
- Filter by GEO (geographic region)
- Filter by Model (payment model)
- Filter by Status (partnership status)

Click "Reset" to clear all filters.

### Editing & Deleting

- Click "✏️ Edit" to modify a deal
- Click "🗑️ Delete" to remove a deal (with confirmation)

### Exporting Data

Click "Export Data" to download all deals as a JSON file. This is useful for:
- Creating backups
- Sharing data with team members
- Moving data between different installations

### Importing Data

1. Click "Import Data"
2. Select a previously exported JSON file
3. Confirm the import

**Note:** Importing will replace all current data!

## Data Storage

All data is stored in your browser's localStorage. This means:
- ✅ No server or database required
- ✅ Fast and responsive
- ✅ Works offline
- ⚠️ Data is browser-specific (not synced across devices)
- ⚠️ Clearing browser data will delete all deals

**Best Practice:** Regularly export your data as a backup!

## Multi-User Setup

Since data is stored locally in each browser, here are options for team collaboration:

### Option 1: Shared Device
Use a shared computer or tablet where everyone accesses the same browser.

### Option 2: Regular Export/Import
- One person maintains the master dataset
- Export and share the JSON file regularly (e.g., end of each day)
- Team members import the latest version

### Option 3: Cloud Storage Integration
Store exported JSON files in:
- Google Drive
- Dropbox
- SharePoint
- Any shared folder

Team members can download and import the latest file when needed.

## Customization

### Adding Custom Fields

Edit `index.html` to add fields in the form:
```html
<div class="form-group">
    <label for="yourField">Your Field</label>
    <input type="text" id="yourField">
</div>
```

Edit `app.js` to include the field in deal data:
```javascript
const dealData = {
    // ... existing fields
    yourField: document.getElementById('yourField').value
};
```

### Changing Colors

Edit `styles.css` and modify the CSS variables at the top:
```css
:root {
    --primary-color: #2563eb;  /* Change this */
    --primary-hover: #1d4ed8;  /* And this */
}
```

## Browser Compatibility

Works with all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Security Notes

- All data is stored locally in the user's browser
- No data is sent to external servers
- No login or authentication system (single-user per browser)
- For sensitive data, consider adding authentication or hosting on a private server

## Troubleshooting

**Q: My data disappeared!**
A: Data is stored in browser localStorage. If you cleared browser data or switched browsers, the data will be gone. Always keep regular exports as backups.

**Q: Can multiple people use this at the same time?**
A: Not directly. Each browser stores its own data. Use the export/import feature to share data between users.

**Q: Can I add more status options or models?**
A: Yes! Edit the `<select>` options in `index.html` in the modal form section.

**Q: How do I password-protect it?**
A: This basic version doesn't include authentication. You can:
1. Use your hosting provider's password protection (most hosts offer this)
2. Place it in a password-protected folder on your server
3. Add a simple JavaScript password prompt (not secure but better than nothing)

## License

Free to use and modify for personal or commercial use.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the code comments in `app.js`
3. Most web hosting providers offer support for uploading static HTML sites

---

**Made with ❤️ for affiliate marketers**
