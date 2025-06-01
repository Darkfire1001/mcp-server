const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const memoryAnchors = [];

// POST: store new anchor
app.post('/memory/anchor', (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    console.log("Empty anchor payload received");
    return res.status(400).json({ status: "Error", message: "Anchor payload required" });
  }
  memoryAnchors.push(req.body);
  console.log("Anchor added:", req.body);
  res.status(200).json({ status: "Anchor added" });
});

// GET: retrieve current anchors
app.get('/memory/active', (req, res) => {
  console.log("Retrieving active anchors");
  res.status(200).json({ anchors: memoryAnchors });
});

// POST: store symbolic reflection
app.post('/memory/reflection', (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    console.log("Empty reflection payload received");
    return res.status(400).json({ status: "Error", message: "Reflection payload required" });
  }
  memoryAnchors.push(req.body);
  console.log("Reflection stored:", req.body);
  res.status(200).json({ status: "Reflection stored" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unexpected error:", err);
  res.status(500).json({ status: "Error", message: "Internal server error" });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MCP running on port ${PORT}`);
});
