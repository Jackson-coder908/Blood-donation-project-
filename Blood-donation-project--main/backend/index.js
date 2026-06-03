const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 5000;

const db = new Database(path.join(__dirname, 'donors.db'));

// 1. DATABASE UPDATED: Added age, weight, and lastDonationDate columns
db.prepare(`
  CREATE TABLE IF NOT EXISTS donors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    bloodType TEXT,
    city TEXT,
    phone TEXT,
    age INTEGER,
    weight INTEGER,
    lastDonationDate TEXT
  )
`).run();

app.use(cors());
app.use(express.json());

// Allows the server to find your pages, css, and js folders
app.use(express.static(path.join(__dirname, '../'))); 

// Get all donors
app.get('/donors', (req, res) => {
  const donors = db.prepare('SELECT * FROM donors').all();
  res.json(donors);
});

// 2. REGISTRATION ROUTE UPDATED: Saves eligibility metrics into the database
app.post('/donors', (req, res) => {
  const { name, bloodType, city, phone, age, weight, lastDonationDate } = req.body;
  
  const info = db.prepare(`
    INSERT INTO donors (name, bloodType, city, phone, age, weight, lastDonationDate) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(name, bloodType, city, phone, age, weight, lastDonationDate || "");
  
  res.json({ 
    id: info.lastInsertRowid, 
    name, 
    bloodType, 
    city, 
    phone, 
    age, 
    weight, 
    lastDonationDate 
  });
});

// The Admin "Delete" Route
app.delete('/donors/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM donors WHERE id = ?').run(id);
  res.json({ message: "Donor deleted successfully" });
});

// DONOR ENDPOINT GATEWAY
app.post('/api/login/donor', (req, res) => {
  const { email, password } = req.body;
  
  if (email === "donor@test.com" && password === "password123") {
    return res.json({ token: "demo-donor-token-abcde", role: "donor" });
  }
  
  res.status(401).json({ message: "Invalid donor credentials matching profile details." });
});

// RECIPIENT/ADMIN ENDPOINT GATEWAY
app.post('/api/login/recipient', (req, res) => {
  const { identity, password } = req.body;
  
  if ((identity === "admin@lifeflow.org" || identity === "admin") && password === "admin123") {
    return res.json({ token: "demo-recipient-token-xyz789", role: "recipient" });
  }
  
  res.status(401).json({ message: "Access Denied: Invalid Hospital identity profile metrics." });
});

app.get('/', (req, res) => {
  res.send('🚀 Blood Donation Server is Running and Ready!');
});

app.listen(PORT, () => {
  console.log(`✅ SUCCESS! Easy Server running at http://localhost:${PORT}`);
});