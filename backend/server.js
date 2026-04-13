const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Initialize SQLite Database in memory
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  // Create table
  db.run("CREATE TABLE user (name TEXT, age INTEGER, gender TEXT)");

  const stmt = db.prepare("INSERT INTO user VALUES (?, ?, ?)");
  stmt.run("Alice", 25, "Female");
  stmt.run("Bob", 30, "Male");
  stmt.run("Charlie", 22, "Male");
  stmt.run("Shaun", 28, "Male");
  stmt.finalize();
  
  console.log("Database initialized with sample data.");
});

// Endpoint to fetch all users (for debugging/testing)
app.get('/api/users', (req, res) => {
    db.all("SELECT * FROM user", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Endpoint to check data
app.post('/api/check', (req, res) => {
    const { name, age, gender } = req.body;
    
    if (!name || age === undefined || !gender) {
        return res.status(400).json({ error: "Please provide name, age, and gender context" });
    }

    db.get(
        "SELECT * FROM user WHERE LOWER(name) = LOWER(?) AND age = ? AND LOWER(gender) = LOWER(?)", 
        [name, parseInt(age), gender], 
        (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (row) {
                res.json({ exists: true, user: row, message: "User found in the database!" });
            } else {
                res.json({ exists: false, message: "User not found in the database." });
            }
        }
    );
});

// Start the server
app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});
