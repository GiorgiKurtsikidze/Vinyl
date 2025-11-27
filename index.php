<?php
// Initialize database
require_once 'config.php';
require_once 'database.php';

$db = new Database();
$entries = $db->getAllEntries();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Updates</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>Daily Updates</h1>
            <a href="admin.php" class="admin-link">Admin</a>
        </header>
        
        <main>
            <?php if (empty($entries)): ?>
                <div class="empty-state">
                    <p>No updates yet. Check back soon!</p>
                </div>
            <?php else: ?>
                <div class="updates-list">
                    <?php foreach ($entries as $entry): ?>
                        <div class="update-card">
                            <div class="update-header">
                                <h2><?php echo htmlspecialchars($entry['title']); ?></h2>
                                <span class="date"><?php echo date('M d, Y', strtotime($entry['date'])); ?></span>
                            </div>
                            <div class="update-content">
                                <p><?php echo nl2br(htmlspecialchars($entry['content'])); ?></p>
                            </div>
                            <?php if (!empty($entry['value'])): ?>
                                <div class="update-value">
                                    <strong>Value:</strong> <?php echo htmlspecialchars($entry['value']); ?>
                                </div>
                            <?php endif; ?>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </main>
        
        <footer>
            <p>&copy; <?php echo date('Y'); ?> Daily Updates</p>
        </footer>
    </div>
</body>
</html>
