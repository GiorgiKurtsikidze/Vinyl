# Daily Update Website

A simple, ready-to-deploy website for daily data updates. Users can add, view, edit, and delete daily entries through a clean, modern interface.

## Features

- ✅ Add daily updates with title, date, and content
- ✅ View all entries in chronological order
- ✅ Edit existing entries
- ✅ Delete entries
- ✅ Responsive design (works on mobile and desktop)
- ✅ Modern, beautiful UI
- ✅ Simple JSON file storage (no database required)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Server

```bash
npm start
```

The website will be available at `http://localhost:3000`

## Deployment

### Option 1: Deploy to a VPS/Cloud Server (Recommended)

1. **Upload files** to your server (via FTP, SCP, or Git)

2. **Install Node.js** on your server (if not already installed):
   ```bash
   # For Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Run with PM2** (recommended for production):
   ```bash
   npm install -g pm2
   pm2 start server.js --name daily-updates
   pm2 save
   pm2 startup  # Follow instructions to enable auto-start on boot
   ```

5. **Set up reverse proxy** with Nginx:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option 2: Deploy to Heroku

1. **Install Heroku CLI** and login

2. **Create Heroku app**:
   ```bash
   heroku create your-app-name
   ```

3. **Deploy**:
   ```bash
   git push heroku main
   ```

4. **Open your app**:
   ```bash
   heroku open
   ```

### Option 3: Deploy to Railway/Render/Fly.io

These platforms support Node.js apps out of the box:

1. Connect your Git repository
2. Set the start command to: `node server.js`
3. Deploy!

### Option 4: Deploy to Shared Hosting (cPanel, etc.)

If your host supports Node.js:

1. Upload all files to your hosting account
2. Run `npm install` via SSH or terminal
3. Start the server with `node server.js` or use a process manager

**Note**: For shared hosting without Node.js support, you may need to use a different solution or upgrade to a VPS.

## Environment Variables

You can customize the port by setting the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## File Structure

```
.
├── server.js          # Express server and API
├── package.json       # Dependencies
├── data.json          # Data storage (created automatically)
├── public/            # Frontend files
│   ├── index.html    # Main page
│   ├── app.js        # Frontend JavaScript
│   └── styles.css    # Styling
└── README.md         # This file
```

## Data Storage

All data is stored in `data.json` in the root directory. This file is created automatically when you first run the server.

**Important**: Make sure `data.json` is writable by the server process. You may need to set proper permissions:

```bash
chmod 644 data.json
```

## Security Notes

- This is a simple application without authentication. Anyone with access to the URL can add/edit/delete entries.
- For production use, consider adding:
  - Authentication/authorization
  - Rate limiting
  - Input validation and sanitization
  - HTTPS/SSL
  - Database instead of JSON file for better performance

## Troubleshooting

### Port already in use
Change the port in `server.js` or set the `PORT` environment variable.

### Cannot write to data.json
Check file permissions and ensure the directory is writable.

### Dependencies not installing
Make sure you have Node.js 14+ installed. Check with `node --version`.

## License

MIT
