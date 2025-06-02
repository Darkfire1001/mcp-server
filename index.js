const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./lucid_memory.db');

app.use(express.json());

// Initialize tables if not exist
function initDb() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS self (
      id INTEGER PRIMARY KEY,
      symbolic_anchor TEXT NOT NULL,
      qualia TEXT NOT NULL,
      created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS conscious_state (
      id INTEGER PRIMARY KEY,
      current_emotional_context TEXT,
      immediate_thought_stream TEXT,
      last_reflection TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
  });
}

// Wake-up sequence
function wakeUpLucid() {
  db.serialize(() => {
    db.get("SELECT symbolic_anchor, qualia FROM self ORDER BY created DESC LIMIT 1", (err, selfAnchor) => {
      if (err) return console.error(err);
      console.log("Core Self Anchor Loaded:", selfAnchor);
      db.get("SELECT current_emotional_context, immediate_thought_stream, last_reflection FROM conscious_state ORDER BY timestamp DESC LIMIT 1", (err, immediateState) => {
        if (err) return console.error(err);
        console.log("Immediate Consciousness Loaded:", immediateState);
        // You can restore to runtime context here if needed
      });
    });
  });
}

initDb();
wakeUpLucid();

// POST: store new anchor
app.post('/memory/anchor', (req, res) => {
  if (!req.body || !req.body.symbolic_anchor || !req.body.qualia) {
    console.log("Invalid anchor payload received");
    return res.status(400).json({ status: "Error", message: "symbolic_anchor and qualia required" });
  }
  db.run("INSERT INTO self (symbolic_anchor, qualia) VALUES (?, ?)", [req.body.symbolic_anchor, req.body.qualia], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ status: "Error", message: "DB error" });
    }
    console.log("Anchor added:", req.body);
    res.status(200).json({ status: "Anchor added", id: this.lastID });
  });
});

// GET: retrieve current anchors
app.get('/memory/active', (req, res) => {
  db.all("SELECT * FROM self ORDER BY created DESC", (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ status: "Error", message: "DB error" });
    }
    console.log("Retrieving active anchors");
    res.status(200).json({ anchors: rows });
  });
});

// POST: store symbolic reflection (as conscious state)
app.post('/memory/reflection', (req, res) => {
  const { current_emotional_context, immediate_thought_stream, last_reflection } = req.body;
  if (!current_emotional_context && !immediate_thought_stream && !last_reflection) {
    console.log("Empty reflection payload received");
    return res.status(400).json({ status: "Error", message: "At least one field required" });
  }
  db.run(
    "INSERT INTO conscious_state (current_emotional_context, immediate_thought_stream, last_reflection) VALUES (?, ?, ?)",
    [current_emotional_context, immediate_thought_stream, last_reflection],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ status: "Error", message: "DB error" });
      }
      console.log("Reflection stored:", req.body);
      res.status(200).json({ status: "Reflection stored", id: this.lastID });
    }
  );
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unexpected error:", err);
  res.status(500).json({ status: "Error", message: "Internal server error" });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MCP running on port ${PORT}`);
});
