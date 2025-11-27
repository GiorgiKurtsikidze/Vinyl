const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ entries: [] }, null, 2));
}

// Helper function to read data
function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { entries: [] };
  }
}

// Helper function to write data
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// API Routes

// Get all entries
app.get('/api/entries', (req, res) => {
  const data = readData();
  res.json(data.entries);
});

// Add new entry
app.post('/api/entries', (req, res) => {
  const { title, content, date } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const data = readData();
  const newEntry = {
    id: Date.now().toString(),
    title: title.trim(),
    content: content.trim(),
    date: date || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  data.entries.unshift(newEntry); // Add to beginning
  writeData(data);

  res.json({ success: true, entry: newEntry });
});

// Update entry
app.put('/api/entries/:id', (req, res) => {
  const { id } = req.params;
  const { title, content, date } = req.body;

  const data = readData();
  const entryIndex = data.entries.findIndex(e => e.id === id);

  if (entryIndex === -1) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  if (title) data.entries[entryIndex].title = title.trim();
  if (content) data.entries[entryIndex].content = content.trim();
  if (date) data.entries[entryIndex].date = date;

  writeData(data);
  res.json({ success: true, entry: data.entries[entryIndex] });
});

// Delete entry
app.delete('/api/entries/:id', (req, res) => {
  const { id } = req.params;

  const data = readData();
  const entryIndex = data.entries.findIndex(e => e.id === id);

  if (entryIndex === -1) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  data.entries.splice(entryIndex, 1);
  writeData(data);

  res.json({ success: true });
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Data file: ${DATA_FILE}`);
});
