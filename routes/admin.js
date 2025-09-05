// routes/admin.js
import express from "express";

const router = express.Router();
const OWNER = process.env.OWNER_AUTH_TOKEN;

// bearer auth
function auth(req, res, next) {
  const h = req.header("Authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!OWNER || token !== OWNER) return res.status(401).json({ error: "unauthorized" });
  next();
}

// simple health
router.get("/v1/health", (_req, res) => res.json({ ok: true }));

// ---- Vault (stub) ----
const vault = [];
router.post("/v1/vault/entries", auth, express.json(), (req, res) => {
  const entry = { id: `vault_${vault.length + 1}`, ts: new Date().toISOString(), ...req.body };
  vault.push(entry);
  return res.status(202).json({ status: "accepted", entry_id: entry.id });
});

// ---- ULI control (stub) ----
let uli = { mode: "LOCKDOWN", phase: "IDLE", started_at: null };
router.post("/v1/uli/control/reactivate", auth, express.json(), (req, res) => {
  uli = { mode: "READ_ONLY", phase: "WARMUP", started_at: new Date().toISOString() };
  setTimeout(() => {
    uli = { mode: "FULL_OPERATIONAL", phase: "RUNNING", started_at: uli.started_at };
  }, 90 * 1000);
  return res.status(202).json({ status: "queued", mode: uli.mode, transition_id: "reactivation-1" });
});

router.get("/v1/uli/control/status", auth, (_req, res) => res.json(uli));

export default router;
