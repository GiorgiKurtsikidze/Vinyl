# Daily Updates Website

A simple, ready-to-deploy website for daily data updates. Upload to any PHP hosting and start using immediately.

## Features

- **Public Display Page**: View all daily updates in a clean, modern interface
- **Admin Panel**: Secure admin interface to add/edit/delete entries
- **SQLite Database**: No MySQL setup required - uses SQLite for easy deployment
- **Responsive Design**: Works on desktop and mobile devices
- **Password Protected**: Admin area is password protected

## Quick Start

1. **Upload Files**: Upload all files to your web hosting directory
2. **Set Permissions**: Make sure the directory is writable (for SQLite database creation)
   ```bash
   chmod 755 /path/to/your/site
   ```
3. **Change Admin Password**: Edit `admin.php` and change the password on line 5:
   ```php
   $password = 'your-secure-password-here';
   ```
4. **Access Your Site**: 
   - Public site: `http://yoursite.com/index.php` or `http://yoursite.com/`
   - Admin panel: `http://yoursite.com/admin.php`

## Usage

### Adding Daily Updates

1. Go to the admin panel (`admin.php`)
2. Enter your password
3. Fill in the form:
   - **Title**: A brief title for the update
   - **Content**: The main content/description
   - **Value**: Optional numeric or text value
   - **Date**: Select the date (defaults to today)
4. Click "Add Entry"

### Viewing Updates

Visit the main page (`index.php`) to see all updates, sorted by date (newest first).

## Requirements

- PHP 5.6 or higher
- SQLite support (enabled by default in most PHP installations)
- Web server (Apache, Nginx, etc.)

## File Structure

```
/
├── index.php          # Public display page
├── admin.php          # Admin panel
├── config.php         # Configuration
├── database.php       # Database class
├── style.css          # Stylesheet
├── .htaccess          # Apache configuration
└── data.db            # SQLite database (created automatically)
```

## Security Notes

- **Change the admin password** immediately after deployment
- The database file (`data.db`) is protected via `.htaccess`
- Consider using HTTPS for production
- For better security, consider implementing proper user authentication

## Customization

- Edit `style.css` to change colors, fonts, and layout
- Modify `index.php` to change the public display format
- Update `admin.php` to add more fields or features

## Support

This is a simple, self-contained solution. All data is stored in the SQLite database file (`data.db`). Make sure to backup this file regularly.

## License

Free to use and modify as needed.
