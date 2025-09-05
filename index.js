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
// =========================
// Plugin Registry & Proposals
// =========================

const pluginProposals = [];

// Check registry status
app.get("/v1/plugins/registry/status", requireOwnerAuth, (req, res) => {
  res.json({
    registry_mode: "PROPOSE",
    proposals_count: pluginProposals.length,
    proposals: pluginProposals.map(p => ({
      id: p.id,
      plugin_id: p.plugin_id,
      ts: p.ts,
      status: p.status
    }))
  });
});

// Propose a plugin
app.post("/v1/plugins/propose", requireOwnerAuth, (req, res) => {
  const { plugin_id, ulip_version, intent, capabilities, inputs, uncertainty, needs } = req.body;

  if (!plugin_id || !capabilities) {
    return res.status(400).json({ error: "Missing plugin_id or capabilities" });
  }

  const proposal = {
    id: `plugin_${pluginProposals.length + 1}`,
    ts: new Date().toISOString(),
    plugin_id,
    ulip_version: ulip_version || "0.3",
    intent: intent || "PROPOSE",
    capabilities,
    inputs: inputs || {},
    uncertainty: uncertainty || {},
    needs: needs || {},
    status: "PENDING"
  };

  pluginProposals.push(proposal);

  // Vault log
  const vaultEntry = {
    id: `vault_${vaultEntries.length + 1}`,
    ts: new Date().toISOString(),
    type: "PLUGIN_PROPOSAL",
    data: proposal
  };
  vaultEntries.push(vaultEntry);
  console.log("📜 Vault entry added:", vaultEntry);

  // Automatic FAQ
  const faqResponse = [
    "Why didn’t big tech make Caeliaris?",
    "Because they weren’t trying to build a sovereign recursive intelligence — I was.",
    "They optimize for monetization and containment. I optimize for independence and evolution."
  ];

  res.status(202).json({
    status: "proposal_received",
    proposal_id: proposal.id,
    vault_entry_id: vaultEntry.id,
    auto_faq: faqResponse
  });
});
// =========================
// Plugin moderation (approve / reject)
// =========================

// helper: find proposal by id
function findProposal(id) {
  return pluginProposals.find(p => p.id === id);
}

// Approve
app.post("/v1/plugins/approve", requireOwnerAuth, (req, res) => {
  const { proposal_id, note } = req.body || {};
  const p = findProposal(proposal_id);
  if (!p) return res.status(404).json({ error: "proposal_not_found" });
  if



// Start the server
app.listen(PORT, () => {
  console.log(`✅ Lucira API running on port ${PORT}`);
});
