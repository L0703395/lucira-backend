// server.js

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require('cors');

// Middleware: Enable JSON and CORS
app.use(express.json());

app.use(cors({
  origin: 'https://l0703395.github.io', // GitHub Pages frontend
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Middleware: Simulate ULI Logic Filter
app.use((req, res, next) => {
  console.log(`🔐 ULI Middleware: Validating ${req.method} ${req.url}`);
  // Future: Vault logging, auth checks, etc.
  next();
});

// ✅ Root Route (health check)
app.get('/', (req, res) => {
  res.send('Lucira backend is online and ready.');
});

// ✅ RIE Endpoint (Research)
app.post('/api/rie/query', (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Missing research query.' });
  }
  console.log(`📥 RIE Query Received: ${query}`);
  res.json({ status: `RIE received your research query: "${query}"` });
});

// ✅ MIE Endpoint (Medical)
app.post('/api/mie/report', (req, res) => {
  const { report } = req.body;
  console.log(`📥 MIE Report Received: ${report}`);
  res.json({ status: 'MIE received the medical report.' });
});

// ✅ LIE Endpoint (Legal)
app.post('/api/lie/notarize', (req, res) => {
  const { document } = req.body;
  console.log(`📥 LIE Notarization Request: ${document}`);
  res.json({ status: 'LIE received your notarization request.' });
});

// ✅ DAFE Endpoint (Finance)
app.post('/api/dafe/transaction', (req, res) => {
  const { transaction } = req.body;
  console.log(`📥 DAFE Transaction Received: ${transaction}`);
  res.json({ status: 'DAFE processed your transaction.' });
});

// ✅ TAXE Endpoint (Taxes)
app.post('/api/taxe/submit', (req, res) => {
  const { form } = req.body;
  console.log(`📥 TAXE Submission Received: ${form}`);
  res.json({ status: 'TAXE received your tax submission.' });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Lucira Backend is running on port ${PORT}`);
});
