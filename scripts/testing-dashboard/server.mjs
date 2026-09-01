// Local-only test dashboard for TESTING.md. Polls the REAL, deployed D1
// database (via `wrangler d1 execute --remote`, same as the npm db:*
// scripts) and walks the tester group through TESTING.md step by step,
// auto-advancing whenever a step's expected data mutation shows up.
//
// Never deployed: this file is not part of the Worker (src/), is not
// under public/ (Cloudflare static assets), and is only ever run with
// `npm run testing:dashboard` on a developer's own machine.
import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { steps } from './steps.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const STATE_FILE = path.join(__dirname, '.session-state.json');
const PORT = process.env.TESTING_DASHBOARD_PORT || 4173;

const TABLES = [
  { name: 'users', sql: 'SELECT * FROM users ORDER BY user_id' },
  { name: 'events', sql: 'SELECT * FROM events ORDER BY id' },
  { name: 'participants', sql: 'SELECT * FROM participants ORDER BY event_id, user_id' },
  { name: 'participant_history', sql: 'SELECT * FROM participant_history ORDER BY id' },
  { name: 'passcode_reports', sql: 'SELECT * FROM passcode_reports ORDER BY id' },
  { name: 'passcode_candidates', sql: 'SELECT * FROM passcode_candidates ORDER BY event_id, position, value' },
  { name: 'passcode_resolutions', sql: 'SELECT * FROM passcode_resolutions ORDER BY event_id, position' },
  { name: 'event_trust', sql: 'SELECT * FROM event_trust ORDER BY event_id, user_id' },
  { name: 'known_words', sql: 'SELECT * FROM known_words ORDER BY word' },
  { name: 'admin_claims', sql: 'SELECT * FROM admin_claims ORDER BY event_id' },
  { name: 'admin_claim_candidates', sql: 'SELECT * FROM admin_claim_candidates ORDER BY event_id, user_id' },
  { name: 'pending_newevents', sql: 'SELECT * FROM pending_newevents ORDER BY user_id' },
];

// ---------------------------------------------------------------- state
function freshState() {
  return {
    agents: {
      A: { username: '', manualId: null, user_id: null },
      B: { username: '', manualId: null, user_id: null },
      C: { username: '', manualId: null, user_id: null },
      D: { username: '', manualId: null, user_id: null },
    },
    vars: {},
    stepIndex: 0,
    baseline: null,
    baselineForStep: null,
  };
}

let state = freshState();
try {
  state = { ...freshState(), ...JSON.parse(await readFile(STATE_FILE, 'utf8')) };
  console.log('Sessió recuperada de .session-state.json');
} catch { /* no previous session, start fresh */ }

async function persist() {
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2)).catch(() => {});
}

// ------------------------------------------------------------ templating
function resolveValue(token, ctx) {
  const t = token.trim();
  if (['A', 'B', 'C', 'D'].includes(t)) return ctx.agents[t]?.user_id ?? null;
  const [name, field] = t.split('.');
  // `me.<field>` resolves per rendering agent (see renderStep's `self`),
  // reading `ctx.vars[field][self]` — used for values that legitimately
  // differ per agent, e.g. step 0.3's per-agent suggested language.
  if (name === 'me') {
    const letter = ctx.self;
    const v = field ? ctx.vars[field] : null;
    return letter && v ? (v[letter] ?? null) : null;
  }
  const v = ctx.vars[name];
  if (v == null) return null;
  return field ? v[field] : v;
}
function tplSql(str, ctx) {
  return str.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, tok) => {
    const v = resolveValue(tok, ctx);
    return v == null ? 'NULL' : String(v);
  });
}
function tplText(str, ctx) {
  return str.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, tok) => {
    const v = resolveValue(tok, ctx);
    return v == null ? `<${tok.trim()}?>` : String(v);
  });
}

// -------------------------------------------------------------- D1 access
// `wrangler d1 execute --file` only returns one aggregate summary for a
// multi-statement batch, not per-statement rows, so per-statement results
// require `--command`. Passing that command string through npx/wrangler's
// *.cmd shim on Windows needs shell:true, whose quoting mangles a long
// multi-line SQL string — so instead we invoke wrangler's real JS entry
// point directly with node.exe (a plain executable, not a .cmd shim),
// where argv is passed through untouched.
const WRANGLER_BIN = path.join(REPO_ROOT, 'node_modules', 'wrangler', 'bin', 'wrangler.js');

function runD1Batch(statements) {
  return new Promise((resolve, reject) => {
    const cmd = statements.join(';\n');
    execFile(
      process.execPath,
      [WRANGLER_BIN, 'd1', 'execute', 'ifs-passcode-relay', '--remote', '--json', '--command', cmd],
      { cwd: REPO_ROOT, maxBuffer: 1024 * 1024 * 16, timeout: 30000 },
      (err, stdout, stderr) => {
        if (err) return reject(new Error(stderr || err.message));
        try {
          const jsonStart = stdout.indexOf('[');
          const parsed = JSON.parse(stdout.slice(jsonStart));
          resolve(parsed.map(r => r.results ?? []));
        } catch (e) {
          reject(new Error(`No s'ha pogut parsejar la resposta de wrangler: ${e.message}`));
        }
      },
    );
  });
}

// Column names per table, fetched once (schema doesn't change mid-session)
// via PRAGMA table_info, so an empty table can still render its header
// row instead of a bare "(buida)" placeholder.
let tableColumns = null;

async function fetchTableColumns() {
  const results = await runD1Batch(TABLES.map(t => `PRAGMA table_info(${t.name})`));
  const columns = {};
  TABLES.forEach((t, i) => { columns[t.name] = (results[i] || []).map(r => r.name); });
  return columns;
}

// --------------------------------------------------------- agent resolution
function resolveAgents(usersRows) {
  const byUsername = new Map(
    usersRows.filter(u => u.username).map(u => [String(u.username).toLowerCase().replace(/^@/, ''), u.user_id]),
  );
  for (const letter of ['A', 'B', 'C', 'D']) {
    const a = state.agents[letter];
    if (a.manualId) { a.user_id = Number(a.manualId); continue; }
    if (a.username) {
      a.user_id = byUsername.get(a.username.toLowerCase().replace(/^@/, '')) ?? null;
    } else {
      a.user_id = null;
    }
  }
}

// --------------------------------------------------------------- step engine
async function poll() {
  if (!tableColumns) tableColumns = await fetchTableColumns();

  const ctxForNamedQueries = { agents: state.agents, vars: state.vars };
  const step = steps[state.stepIndex];

  const statements = TABLES.map(t => t.sql);
  const needsBaseline = step && step.baselineSql && state.baselineForStep !== step.id;
  const baselineIdx = needsBaseline ? statements.push(tplSql(step.baselineSql, ctxForNamedQueries)) - 1 : null;
  const currentIdx = step && step.currentSql ? statements.push(tplSql(step.currentSql, ctxForNamedQueries)) - 1 : null;

  const results = await runD1Batch(statements);

  const tables = {};
  TABLES.forEach((t, i) => { tables[t.name] = results[i]; });

  resolveAgents(tables.users);

  if (needsBaseline) {
    state.baseline = results[baselineIdx];
    state.baselineForStep = step.id;
    // `prepare` derives per-agent values (e.g. step 0.3's suggested
    // /language target) from the just-captured baseline, once per step,
    // so they're available for rendering from the very first poll —
    // unlike `captured` (below), which only lands once `compare` says done.
    if (step.prepare) {
      Object.assign(state.vars, step.prepare(state.baseline, ctxForNamedQueries));
    }
  }

  let stepStatus = null;
  if (step) {
    if (step.kind === 'agentsResolved') {
      const missing = step.agents.filter(l => !state.agents[l].user_id);
      stepStatus = {
        done: missing.length === 0,
        detail: missing.length ? `Esperant identificar: ${missing.join(', ')}` : 'Tots els agents identificats.',
      };
    } else if (step.manual) {
      stepStatus = { done: false, manual: true, detail: 'Pas manual — clica "Fet" quan ho hagis comprovat a Telegram.' };
    } else if (step.currentSql) {
      const current = results[currentIdx];
      const out = step.compare(state.baseline, current, ctxForNamedQueries);
      stepStatus = out;
      if (out.done && out.captured) {
        Object.assign(state.vars, out.captured);
      }
    }

    if (stepStatus?.done && !step.manual) {
      state.stepIndex += 1;
      state.baseline = null;
      state.baselineForStep = null;
    }
  }

  await persist();

  return {
    tables,
    tableColumns,
    agents: state.agents,
    vars: state.vars,
    stepIndex: state.stepIndex,
    totalSteps: steps.length,
    step: step ? renderStep(step, ctxForNamedQueries) : null,
    stepStatus,
    finished: !step,
  };
}

function renderStep(step, ctx) {
  // Each agent's copy line is rendered with its own `self`, so a `{{me.*}}`
  // token (see resolveValue) can differ per line — e.g. step 0.3's
  // per-agent suggested language. The header action uses the first agent
  // as a representative preview.
  return {
    id: step.id,
    phase: step.phase,
    agents: step.agents,
    action: tplText(step.action, { ...ctx, self: step.agents[0] }),
    expected: step.expected,
    manual: !!step.manual,
    copyLines: step.agents.map(a => `${a}: ${tplText(step.action, { ...ctx, self: a })}`),
  };
}

// -------------------------------------------------------------------- http
const html = await readFile(path.join(__dirname, 'dashboard.html'), 'utf8');

function send(res, status, body, type = 'application/json') {
  res.writeHead(status, { 'Content-Type': type, 'Access-Control-Allow-Origin': '*' });
  res.end(type === 'application/json' ? JSON.stringify(body) : body);
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'GET' && url.pathname === '/') return send(res, 200, html, 'text/html; charset=utf-8');

    if (req.method === 'GET' && url.pathname === '/api/state') {
      const s = await poll();
      return send(res, 200, s);
    }

    if (req.method === 'POST' && url.pathname === '/api/agents') {
      const body = await readBody(req);
      for (const letter of ['A', 'B', 'C', 'D']) {
        if (body[letter]) {
          if ('username' in body[letter]) state.agents[letter].username = body[letter].username;
          if ('manualId' in body[letter]) state.agents[letter].manualId = body[letter].manualId || null;
        }
      }
      await persist();
      return send(res, 200, { ok: true });
    }

    if (req.method === 'POST' && url.pathname === '/api/advance') {
      state.stepIndex = Math.min(state.stepIndex + 1, steps.length);
      state.baseline = null;
      state.baselineForStep = null;
      await persist();
      return send(res, 200, { ok: true });
    }

    if (req.method === 'POST' && url.pathname === '/api/back') {
      state.stepIndex = Math.max(state.stepIndex - 1, 0);
      state.baseline = null;
      state.baselineForStep = null;
      await persist();
      return send(res, 200, { ok: true });
    }

    if (req.method === 'POST' && url.pathname === '/api/reset-session') {
      state = freshState();
      await persist();
      return send(res, 200, { ok: true });
    }

    send(res, 404, { error: 'not found' });
  } catch (e) {
    send(res, 500, { error: e.message });
  }
});

server.listen(PORT, () => {
  console.log(`Testing dashboard: http://localhost:${PORT}`);
  console.log('Fa polling contra D1 REMOT (la base real de @ifs_relay_bot).');
});
