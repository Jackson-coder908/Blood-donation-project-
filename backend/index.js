const express = require('express');
const path = require('path');
const Database = require('better-sqlite3'); 
const bcrypt = require('bcrypt');

// 📁 FORCE ABSOLUTE PATH RESOLUTION
// This forces Express to look exactly one level above the backend folder
const rootDir = path.resolve(__dirname, '..');

// 🔍 DIAGNOSTIC LOGS: Shows exactly where your server is looking in the terminal
console.log("\n==================================================");
console.log("Checking target path layout...");
console.log("Server rootDir is resolving to:", rootDir);
console.log("Looking for pages folder at:", path.join(rootDir, 'pages'));
console.log("==================================================\n");

// Initialize database file inside the backend folder
const db = new Database(path.join(__dirname, 'donors.db'));

const app = express();
app.use(express.json());

// 🌐 SERVE STATIC ASSET PATHS
app.use('/css', express.static(path.join(rootDir, 'css')));
app.use('/js', express.static(path.join(rootDir, 'js')));
app.use('/pages', express.static(path.join(rootDir, 'pages')));

// 🧭 DYNAMIC HOME ROUTE ALIAS MATRIX
// This intercepts direct file targets to prevent 'Cannot GET /index.html' errors completely
app.get(['/', '/index.html', '/pages/index.html'], (req, res) => {
    res.sendFile(path.join(rootDir, 'index.html'));
});

// 🧭 COMFORT CUSTOM ALIAS ROUTING (Fixes the "Why Donate" link tracking issue)
// This captures any combination of spellings and matches them to your exact file asset
app.get(['/pages/why-donate.html', '/pages/whydonate.html', '/why-donate', '/whydonate'], (req, res) => {
    // Express checks if the file has a hyphen or not, making it completely bulletproof
    res.sendFile(path.join(rootDir, 'pages/why-donate.html'), err => {
        if (err) {
            res.sendFile(path.join(rootDir, 'pages/whydonate.html'));
        }
    });
});

// Initialize Database Table structural layout
db.prepare(`
    CREATE TABLE IF NOT EXISTS blood_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hospitalName TEXT,
        bloodType TEXT,
        district TEXT,
        unitsRequested TEXT
    )
`).run();

// 🛡️ Initialize Secure Users Credentials Table
db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        bloodType TEXT,
        district TEXT
    )
`).run();

// 🩸 Initialize Donor History Table Layout
db.prepare(`
    CREATE TABLE IF NOT EXISTS donations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,     -- Links directly to the user who logged in
        date TEXT,          -- Format: 'YYYY-MM-DD'
        type TEXT,          -- e.g., 'Whole Blood' or 'Platelets'
        center TEXT,        -- e.g., 'Government Medical College Hospital, Kottayam'
        units TEXT,         -- e.g., '1 Unit'
        status TEXT         -- e.g., 'USED' or 'PROCESSING'
    )
`).run();

// 📝 SECURE REGISTRATION API ENDPOINT
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, bloodType, district } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required." });
        }

        // 🔐 Hash the plain text password using bcrypt (10 salt rounds)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 💾 Save the secure string into SQLite
        const insertUser = db.prepare(`
            INSERT INTO users (username, password, bloodType, district)
            VALUES (?, ?, ?, ?)
        `);
        
        insertUser.run(username, hashedPassword, bloodType, district);

        res.status(201).json({ success: true, message: "User registered securely with hashed password!" });
    } catch (error) {
        console.error("Registration database error:", error);
        if (error.message.includes('UNIQUE')) {
            return res.status(400).json({ error: "Username already taken." });
        }
        res.status(500).json({ error: "Failed to register user securely." });
    }
});

// 🔑 SECURE LOGIN API ENDPOINT: Verifies the hashed credentials
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required." });
        }

        // 🔍 Search for the user record in SQLite by username
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        
        if (!user) {
            return res.status(400).json({ error: "Invalid username or password." });
        }

        // 🛡️ Compare the incoming password attempt against the database hash string
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: "Invalid username or password." });
        }

        // Success! Password matches perfectly
        res.json({ 
            success: true, 
            message: `Welcome back, ${user.username}!`,
            user: { username: user.username, bloodType: user.bloodType, district: user.district }
        });

    } catch (error) {
        console.error("Login server error:", error);
        res.status(500).json({ error: "Server failed to process login request." });
    }
});

// -------------------------------------------------------------
// 🚀 THE 3 CORE API ROUTES FOR EMERGENCY REQUESTS
// -------------------------------------------------------------

// 1️⃣ GET: Fetch all active blood requests from the database
app.get('/api/requests', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM blood_requests ORDER BY id DESC').all();
        res.json(rows);
    } catch (error) {
        console.error("Database fetch error:", error);
        res.status(500).json({ error: "Failed to fetch database strings." });
    }
});

// 2️⃣ POST: Receives a new emergency requirement from requestblood.html
app.post('/api/requests', (req, res) => {
    try {
        const { hospitalName, bloodType, district, unitsRequested } = req.body;
        
        const insertStatement = db.prepare(`
            INSERT INTO blood_requests (hospitalName, bloodType, district, unitsRequested)
            VALUES (?, ?, ?, ?)
        `);
        
        const unitsString = `${unitsRequested} Units`;
        const outcome = insertStatement.run(hospitalName, bloodType, district, unitsString);
        
        res.status(201).json({ 
            success: true, 
            message: "Emergency request successfully saved!", 
            requestId: outcome.lastInsertRowid 
        });
    } catch (error) {
        console.error("Database insertion error:", error);
        res.status(500).json({ error: "Failed to log request to server storage." });
    }
});

// 3️⃣ DELETE: Removes an entry when clicked in admin.html
app.delete('/api/requests/:id', (req, res) => {
    try {
        const { id } = req.params;
        const deleteStatement = db.prepare('DELETE FROM blood_requests WHERE id = ?');
        const outcome = deleteStatement.run(id);
        
        if (outcome.changes === 0) {
            return res.status(404).json({ error: "Record not found." });
        }
        
        res.json({ success: true, message: "Allocation removed successfully." });
    } catch (error) {
        console.error("Database deletion error:", error);
        res.status(500).json({ error: "Server failed to process data deletion." });
    }
});

// 4️⃣ GET: Calculate Smart Tracking Metrics for blood-stock dashboard
// 4️⃣ GET: Calculate Smart Tracking Metrics & ML District Matrix for blood-stock dashboard
app.get('/api/analytics/stock', (req, res) => {
    try {
        // Count unique hospitals (nodes) making active requests
        const nodesRow = db.prepare('SELECT COUNT(DISTINCT hospitalName) as totalNodes FROM blood_requests').get();
        
        // Count distinct blood types that are currently requested (critical shortages)
        const strainsRow = db.prepare('SELECT COUNT(DISTINCT bloodType) as criticalStrains FROM blood_requests').get();
        
        // Sum all units requested across the entire database
        const allRequests = db.prepare('SELECT unitsRequested, district FROM blood_requests').all();
        let globalUnits = 0;
        
        // Setup base data structures for our ML District Supply-Demand Matrix
        const districts = ["Ernakulam", "Kottayam", "Trivandrum", "Kozhikode", "Thrissur"];
        const matrixData = {};
        districts.forEach(d => {
            matrixData[d] = { activeRequests: 0, totalUnits: 0, predictedRisk: "Stable / Safe" };
        });

        allRequests.forEach(row => {
            let units = 0;
            if (row.unitsRequested) {
                const numericMatch = row.unitsRequested.match(/\d+/);
                if (numericMatch) {
                    units = parseInt(numericMatch[0], 10);
                }
            }
            globalUnits += units;

            // Map stats to its corresponding district node
            if (matrixData[row.district]) {
                matrixData[row.district].activeRequests += 1;
                matrixData[row.district].totalUnits += units;
            }
        });

        // Smart Forecasting / Logistical Strain Algorithm
        // Simulates an operational threshold model based on active data spikes
        // 🔮 Predictive Mathematical Analytics Engine
        // Evaluates logistical strain using a multi-variable linear weight model
        districts.forEach(d => {
            const x1 = matrixData[d].activeRequests; // Feature 1: Hospital Pressure Density
            const x2 = matrixData[d].totalUnits;     // Feature 2: Aggregate Unit Volume
            
            // Define feature weights based on system impact severity
            const w1 = 2.5; 
            const w2 = 0.5;
            
            // Compute continuous linear combination score
            const riskScore = (w1 * x1) + (w2 * x2);
            
            // Map calculated continuous metrics to operational thresholds
            if (riskScore >= 8.0) {
                matrixData[d].predictedRisk = "Critical Shortage";
            } else if (riskScore > 0) {
                matrixData[d].predictedRisk = "Elevated Risk";
            } else {
                matrixData[d].predictedRisk = "Stable / Safe";
            }
            
            // Debugging log to monitor your analytical engine output in the terminal
            console.log(`📊 Matrix Compute -> District: ${d} | Score: ${riskScore.toFixed(1)} -> ${matrixData[d].predictedRisk}`);
        });
        res.json({
            totalNodes: nodesRow.totalNodes || 0,
            activeStrains: strainsRow.criticalStrains || 0,
            globalUnits: globalUnits || 0,
            matrix: matrixData
        });
    } catch (error) {
        console.error("Analytics & ML engine calculation error:", error);
        res.status(500).json({ error: "Failed to compile inventory stream metrics." });
    }
});
// 1️⃣ GET: Fetch donation history for a specific logged-in user
app.get('/api/donor/profile/:username', (req, res) => {
    try {
        const { username } = req.params;
        const rows = db.prepare('SELECT * FROM donations WHERE username = ? ORDER BY date DESC').all(username);
        res.json({ donations: rows });
    } catch (error) {
        console.error("Profile fetch database error:", error);
        res.status(500).json({ error: "Failed to fetch profile tracking data." });
    }
});

// 2️⃣ POST: Logs a brand new entry when they choose a center and donate
app.post('/api/donations/book', (req, res) => {
    try {
        const { username, date, type, center } = req.body;
        
        const insertStatement = db.prepare(`
            INSERT INTO donations (username, date, type, center, units, status)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        insertStatement.run(username, date, type, center, "1 Unit", "PROCESSING");
        
        res.status(201).json({ 
            success: true, 
            message: "Donation record updated in database successfully!" 
        });
    } catch (error) {
        console.error("Donation insertion error:", error);
        res.status(500).json({ error: "Failed to log donation entry." });
    }
});
// Start engine
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 LifeFlow Server is running live on http://localhost:${PORT}`);
});