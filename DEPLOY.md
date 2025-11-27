# Quick Deployment Guide

## Fastest Way to Get Started (5 minutes)

### Method 1: Netlify Drop (Easiest)

1. Go to https://app.netlify.com/drop
2. Drag and drop these 3 files:
   - `index.html`
   - `styles.css`
   - `app.js`
3. Done! You'll get a live URL instantly

### Method 2: GitHub Pages (Free Forever)

1. Create account on https://github.com (if you don't have one)
2. Create new repository (click + icon → New repository)
3. Name it anything (e.g., "affiliate-tracker")
4. Upload these files via "Add file" → "Upload files"
5. Go to Settings → Pages
6. Under "Source", select "main" branch
7. Click Save
8. Your site URL will appear (e.g., https://yourusername.github.io/affiliate-tracker)

### Method 3: Vercel (Fast & Free)

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import your GitHub repository (or drag and drop files)
5. Click "Deploy"
6. Get your live URL

### Method 4: Your Own Hosting

If you already have web hosting (GoDaddy, Bluehost, etc.):

1. Log into your hosting control panel (cPanel)
2. Go to File Manager
3. Navigate to `public_html` folder
4. Upload all 3 files
5. Access via your domain: `https://yourdomain.com/index.html`

## Files You Need

Only these 3 files are required:
- ✅ `index.html` - The main page
- ✅ `styles.css` - The styling
- ✅ `app.js` - The functionality

That's it! No database, no backend, no complex setup.

## Testing Locally First

Want to test before deploying?

**Option A: Double-click**
Just double-click `index.html` and it will open in your browser.

**Option B: Local Server** (if you're technical)
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve

# PHP
php -S localhost:8000
```

Then visit http://localhost:8000

## Custom Domain

After deploying to Netlify/Vercel/GitHub Pages, you can connect your own domain:
1. Go to your deployment settings
2. Add custom domain
3. Update your DNS records as instructed
4. Wait a few hours for DNS propagation

## Updating Your Site

After making changes:
- **Netlify Drop**: Just drop the files again
- **GitHub Pages**: Commit and push changes to GitHub
- **Vercel**: Push to GitHub (auto-deploys)
- **Own Hosting**: Re-upload via FTP/cPanel

## Security Considerations

This app has NO built-in password protection. To add protection:

### Option 1: Hosting Password Protection
Most hosts offer folder password protection in cPanel:
1. Go to cPanel → Directory Privacy
2. Select your folder
3. Set username and password

### Option 2: Cloudflare Access (Free)
1. Put your site behind Cloudflare
2. Use Cloudflare Access to add authentication
3. Works with Google/Microsoft login

### Option 3: Simple Password (Basic)
Add this to the top of `app.js`:
```javascript
const password = prompt('Enter password:');
if (password !== 'your-password-here') {
    document.body.innerHTML = 'Access Denied';
    throw new Error('Access Denied');
}
```
**Note:** This is NOT secure for sensitive data!

## Need Help?

Common issues:
- **Files not showing**: Check file names are exact (case-sensitive)
- **Styles not loading**: Make sure `styles.css` is in same folder as `index.html`
- **JavaScript not working**: Check `app.js` is in same folder
- **Data not saving**: Enable cookies/localStorage in browser settings

---

**Ready to deploy? Pick a method above and go!** 🚀
