<?php
session_start();

// Simple password protection
$password = 'admin123'; // Change this password!
if (!isset($_SESSION['authenticated'])) {
    if (isset($_POST['password'])) {
        if ($_POST['password'] === $password) {
            $_SESSION['authenticated'] = true;
        } else {
            $error = 'Incorrect password';
        }
    }
    if (!isset($_SESSION['authenticated'])) {
        ?>
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin Login</title>
            <link rel="stylesheet" href="style.css">
        </head>
        <body>
            <div class="container">
                <div class="login-form">
                    <h1>Admin Login</h1>
                    <?php if (isset($error)): ?>
                        <div class="error"><?php echo htmlspecialchars($error); ?></div>
                    <?php endif; ?>
                    <form method="POST">
                        <input type="password" name="password" placeholder="Enter password" required>
                        <button type="submit">Login</button>
                    </form>
                    <a href="index.php">← Back to site</a>
                </div>
            </div>
        </body>
        </html>
        <?php
        exit;
    }
}

require_once 'config.php';
require_once 'database.php';

$db = new Database();
$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['action'])) {
        if ($_POST['action'] === 'add') {
            $title = $_POST['title'] ?? '';
            $content = $_POST['content'] ?? '';
            $value = $_POST['value'] ?? '';
            $date = $_POST['date'] ?? date('Y-m-d');
            
            if (!empty($title) && !empty($content)) {
                if ($db->addEntry($title, $content, $value, $date)) {
                    $message = '<div class="success">Entry added successfully!</div>';
                } else {
                    $message = '<div class="error">Error adding entry.</div>';
                }
            } else {
                $message = '<div class="error">Title and content are required.</div>';
            }
        } elseif ($_POST['action'] === 'delete' && isset($_POST['id'])) {
            if ($db->deleteEntry($_POST['id'])) {
                $message = '<div class="success">Entry deleted successfully!</div>';
            } else {
                $message = '<div class="error">Error deleting entry.</div>';
            }
        }
    }
}

if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: admin.php');
    exit;
}

$entries = $db->getAllEntries();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>Admin Panel</h1>
            <div class="header-actions">
                <a href="index.php">View Site</a>
                <a href="?logout=1">Logout</a>
            </div>
        </header>
        
        <main>
            <?php echo $message; ?>
            
            <div class="admin-section">
                <h2>Add New Entry</h2>
                <form method="POST" class="add-form">
                    <input type="hidden" name="action" value="add">
                    <div class="form-group">
                        <label for="title">Title *</label>
                        <input type="text" id="title" name="title" required>
                    </div>
                    <div class="form-group">
                        <label for="content">Content *</label>
                        <textarea id="content" name="content" rows="5" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="value">Value (optional)</label>
                        <input type="text" id="value" name="value">
                    </div>
                    <div class="form-group">
                        <label for="date">Date</label>
                        <input type="date" id="date" name="date" value="<?php echo date('Y-m-d'); ?>">
                    </div>
                    <button type="submit">Add Entry</button>
                </form>
            </div>
            
            <div class="admin-section">
                <h2>Existing Entries</h2>
                <?php if (empty($entries)): ?>
                    <p>No entries yet.</p>
                <?php else: ?>
                    <div class="entries-list">
                        <?php foreach ($entries as $entry): ?>
                            <div class="entry-item">
                                <div class="entry-info">
                                    <h3><?php echo htmlspecialchars($entry['title']); ?></h3>
                                    <p class="entry-date"><?php echo date('M d, Y', strtotime($entry['date'])); ?></p>
                                    <p class="entry-content"><?php echo htmlspecialchars($entry['content']); ?></p>
                                    <?php if (!empty($entry['value'])): ?>
                                        <p class="entry-value"><strong>Value:</strong> <?php echo htmlspecialchars($entry['value']); ?></p>
                                    <?php endif; ?>
                                </div>
                                <form method="POST" class="delete-form" onsubmit="return confirm('Are you sure you want to delete this entry?');">
                                    <input type="hidden" name="action" value="delete">
                                    <input type="hidden" name="id" value="<?php echo $entry['id']; ?>">
                                    <button type="submit" class="delete-btn">Delete</button>
                                </form>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        </main>
    </div>
</body>
</html>
