const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 5000;

const db = new Database(path.join(__dirname, 'donors.db'));

db.prepare(`
  CREATE TABLE IF NOT EXISTS donors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    bloodType TEXT,
    city TEXT,
    phone TEXT
  )
`).run();

app.use(cors());
app.use(express.json());

// --- 1. ADD THIS: Allows the server to find your pages, css, and js folders ---
app.use(express.static(path.join(__dirname, '../'))); 

// Get all donors
app.get('/donors', (req, res) => {
  const donors = db.prepare('SELECT * FROM donors').all();
  res.json(donors);
});

// Add a new donor
app.post('/donors', (req, res) => {
  const { name, bloodType, city, phone } = req.body;
  const info = db.prepare(
    'INSERT INTO donors (name, bloodType, city, phone) VALUES (?, ?, ?, ?)'
  ).run(name, bloodType, city, phone);
  
  res.json({ id: info.lastInsertRowid, name, bloodType, city, phone });
});

// --- 2. ADD THIS: The Admin "Delete" Route ---
app.delete('/donors/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM donors WHERE id = ?').run(id);
  res.json({ message: "Donor deleted successfully" });
});

app.get('/', (req, res) => {
  res.send('🚀 Blood Donation Server is Running and Ready!');
});

app.listen(PORT, () => {
  console.log(`✅ SUCCESS! Easy Server running at http://localhost:${PORT}`);
});