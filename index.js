const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');


app.use(express.json());

app.use(cors({
  origin: 'https://l0703395.github.io', // your GitHub Pages domain
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Middleware: Simulate ULI Logic Filter
app.use((req, res, next) => {
  console.log("ULI Middleware: Validating request...");
  // Future: Insert logic for Vault logging, signature checks, etc.
  next();
});

// RIE Endpoint
app.post('/api/rie/query', (req, res) => {
  res.json({ status: "RIE received your research query." });
});

// MIE Endpoint
app.post('/api/mie/report', (req, res) => {
  res.json({ status: "MIE received the medical report." });
});

// LIE Endpoint
app.post('/api/lie/notarize', (req, res) => {
  res.json({ status: "LIE received your notarization request." });
});

// DAFE Endpoint
app.post('/api/dafe/transaction', (req, res) => {
  res.json({ status: "DAFE processed your transaction." });
});

// TAXE Endpoint
app.post('/api/taxe/submit', (req, res) => {
  res.json({ status: "TAXE received your tax submission." });
});

app.listen(PORT, () => {
  console.log(`Lucira Backend is running on port ${PORT}`);
});
