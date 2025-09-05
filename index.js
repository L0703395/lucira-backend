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
// =========================
// Vault & ULI Activation
// =========================

// Owner token from environment
const OWNER = process.env.OWNER_AUTH_TOKEN;

// In-memory store for Vault entries
const vaultEntries = [];

// In-memory state for ULI
let uliState = { mode: "LOCKDOWN", phase: "IDLE", started_at: null };

// Auth middleware
function requireOwnerAuth(req, res, next) {
  const h = req.header("Authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!OWNER || token !== OWNER) {
    return res.status(401).json({ error: "unauthorized" });
  }
  next();
}

// Health check
app.get("/v1/health", (req, res) => {
  res.json({ ok: true, mode: uliState.mode, phase: uliState.phase });
});

// Add Vault entry
app.post("/v1/vault/entries", requireOwnerAuth, (req, res) => {
  const entry = {
    id: `vault_${vaultEntries.length + 1}`,
    ts: new Date().toISOString(),
    ...req.body
  };
  vaultEntries.push(entry);
  console.log("📜 Vault entry added:", entry);
  res.status(202).json({ status: "accepted", entry_id: entry.id });
});

// Reactivate ULI
app.post("/v1/uli/control/reactivate", requireOwnerAuth, (req, res) => {
  console.log("🚀 ULI reactivation started");
  uliState = { mode: "READ_ONLY", phase: "WARMUP", started_at: new Date().toISOString() };

  setTimeout(() => {
    uliState = { mode: "FULL_OPERATIONAL", phase: "RUNNING", started_at: uliState.started_at };
    console.log("✅ ULI now FULL_OPERATIONAL");
  }, 90 * 1000);

  res.status(202).json({ status: "queued", mode: uliState.mode, transition_id: "reactivation-1" });
});

// Get ULI status
app.get("/v1/uli/control/status", requireOwnerAuth, (req, res) => {
  res.json(uliState);
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Lucira API running on port ${PORT}`);
});
