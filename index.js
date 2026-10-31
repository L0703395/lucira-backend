const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// =========================
// Core middleware
// =========================
app.use(express.json());

const allowedOrigins = [
  'https://www.caeliaris.com',
  'https://caeliaris.com',
  'https://www.lucirasystems.com',
  'https://lucirasystems.com',
  'https://l0703395.github.io', // keep if you still test on GH Pages
];

app.use(cors({
  origin(origin, cb) {
    // Allow server-to-server / curl (no Origin) and known web origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('CORS: blocked origin ' + origin));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));

// Preflight helper (optional but nice)
app.options('*', cors());


// =========================
// Demo Engines
// =========================
app.post('/api/rie/query', (req, res) => {
  const query = req.body.query || "No query provided.";
  res.json({ status: "RIE received your research query.", query });
});

app.post('/api/mie/report', (req, res) => {
  res.json({ status: "MIE received the medical report." });
});

app.post('/api/lie/notarize', (req, res) => {
  res.json({ status: "LIE received your notarization request." });
});

app.post('/api/dafe/transaction', (req, res) => {
  res.json({ status: "DAFE processed your transaction." });
});

app.post('/api/taxe/submit', (req, res) => {
  res.json({ status: "TAXE received your tax submission." });
});

// =========================
// Vault & ULI Activation
// =========================
const OWNER = (process.env.OWNER_AUTH_TOKEN || '').trim();

const vaultEntries = []; // in-memory (swap to DB later)
let uliState = { mode: "LOCKDOWN", phase: "IDLE", started_at: null };

function requireOwnerAuth(req, res, next) {
  const h = req.header("Authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!OWNER || token !== OWNER) {
    return res.status(401).json({ error: "unauthorized" });
  }
  next();
}

// Health
app.get("/v1/health", (_req, res) => {
  res.json({ ok: true, mode: uliState.mode, phase: uliState.phase });
});

// Vault entry
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

// ULI reactivate
app.post("/v1/uli/control/reactivate", requireOwnerAuth, (req, res) => {
  console.log("🚀 ULI reactivation started");
  uliState = { mode: "READ_ONLY", phase: "WARMUP", started_at: new Date().toISOString() };

  setTimeout(() => {
    uliState = { mode: "FULL_OPERATIONAL", phase: "RUNNING", started_at: uliState.started_at };
    console.log("✅ ULI now FULL_OPERATIONAL");
  }, 90 * 1000);

  res.status(202).json({ status: "queued", mode: uliState.mode, transition_id: "reactivation-1" });
});

// ULI status
app.get("/v1/uli/control/status", requireOwnerAuth, (_req, res) => {
  res.json(uliState);
});

// =========================
/** Plugin Registry & Proposals */
// =========================
const pluginProposals = []; // in-memory

// registry status
app.get("/v1/plugins/registry/status", requireOwnerAuth, (_req, res) => {
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

// propose
app.post("/v1/plugins/propose", requireOwnerAuth, (req, res) => {
  const { plugin_id, ulip_version, intent, capabilities, inputs, uncertainty, needs } = req.body || {};
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

  const vaultEntry = {
    id: `vault_${vaultEntries.length + 1}`,
    ts: new Date().toISOString(),
    type: "PLUGIN_PROPOSAL",
    data: proposal
  };
  vaultEntries.push(vaultEntry);
  console.log("📜 Vault entry added:", vaultEntry);

  res.status(202).json({
    status: "proposal_received",
    proposal_id: proposal.id,
    vault_entry_id: vaultEntry.id,
    auto_faq: [
      "Why didn’t big tech make Caeliaris?",
      "Because they weren’t trying to build a sovereign recursive intelligence — I was.",
      "They optimize for monetization and containment. I optimize for independence and evolution."
    ]
  });
});

// =========================
/** Plugin moderation (approve / reject) */
// =========================
function findProposal(id) {
  return pluginProposals.find(p => p.id === id);
}

// approve
app.post("/v1/plugins/approve", requireOwnerAuth, (req, res) => {
  const { proposal_id, note } = req.body || {};
  const p = findProposal(proposal_id);
  if (!p) return res.status(404).json({ error: "proposal_not_found" });
  if (p.status === "APPROVED") return res.status(409).json({ error: "already_approved" });

  p.status = "APPROVED";
  p.approved_at = new Date().toISOString();
  if (note) p.approval_note = note;

  const vaultEntry = {
    id: `vault_${vaultEntries.length + 1}`,
    ts: new Date().toISOString(),
    type: "PLUGIN_APPROVAL",
    data: { proposal_id: p.id, plugin_id: p.plugin_id, note: note || null }
  };
  vaultEntries.push(vaultEntry);
  console.log("📜 Vault entry added:", vaultEntry);

  res.status(202).json({
    status: "approved",
    proposal_id: p.id,
    plugin_id: p.plugin_id,
    vault_entry_id: vaultEntry.id
  });
});

// reject
app.post("/v1/plugins/reject", requireOwnerAuth, (req, res) => {
  const { proposal_id, reason } = req.body || {};
  const p = findProposal(proposal_id);
  if (!p) return res.status(404).json({ error: "proposal_not_found" });
  if (p.status === "REJECTED") return res.status(409).json({ error: "already_rejected" });

  p.status = "REJECTED";
  p.rejected_at = new Date().toISOString();
  p.reject_reason = reason || "unspecified";

  const vaultEntry = {
    id: `vault_${vaultEntries.length + 1}`,
    ts: new Date().toISOString(),
    type: "PLUGIN_REJECTION",
    data: { proposal_id: p.id, plugin_id: p.plugin_id, reason: p.reject_reason }
  };
  vaultEntries.push(vaultEntry);
  console.log("📜 Vault entry added:", vaultEntry);

  res.status(202).json({
    status: "rejected",
    proposal_id: p.id,
    plugin_id: p.plugin_id,
    vault_entry_id: vaultEntry.id
  });
});

// =========================
// Debug (remove later)
// =========================
app.get("/v1/debug/routes", (_req, res) => {
  const routes = [];
  app._router.stack.forEach(mw => {
    if (mw.route?.path) {
      routes.push({ method: Object.keys(mw.route.methods)[0].toUpperCase(), path: mw.route.path });
    } else if (mw.name === "router" && mw.handle.stack) {
      mw.handle.stack.forEach(h => h.route && routes.push({ method: Object.keys(h.route.methods)[0].toUpperCase(), path: h.route.path }));
    }
  });
  res.json(routes);
});

// =========================
// Start the server
// =========================
app.listen(PORT, () => {
  console.log(`✅ Lucira API running on port ${PORT}`);
});
