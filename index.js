const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON parsing
app.use(express.json());

// Enable CORS for your GitHub Pages frontend
app.use(cors({
  origin: 'https://l0703395.github.io', // Replace with your actual frontend domain if different
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Middleware: Simulate ULI logic
app.use((req, res, next) => {
  console.log(`[ULI Middleware] ${req.method} request to ${req.path}`);
  next();
});

// Research Engine (RIE)
app.post('/api/rie/query', (req, res) => {
  const query = req.body.query || "No query provided.";
  res.json({ status: "RIE received your research query.", query });
});

// Medical Engine (MIE)
app.post('/api/mie/report', (req, res) => {
  res.json({ status: "MIE received the medical report." });
});

// Legal Engine (LIE)
app.post('/api/lie/notarize', (req, res) => {
  res.json({ status: "LIE received your notarization request." });
});

// Finance Engine (DAFE)
app.post('/api/dafe/transaction', (req, res) => {
  res.json({ status: "DAFE processed your transaction." });
});

// Tax Engine (TAXE)
app.post('/api/taxe/submit', (req, res) => {
  res.json({ status: "TAXE received your tax submission." });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Lucira API running on port ${PORT}`);
});
