/**
 * HTML for the private admin dashboard at /admin — a read-only, D1-backed
 * view of the bot's data, gated by the login in routes.ts. Every query
 * runs on demand (page load, event selection, or the refresh button);
 * there is no polling or auto-refresh, since the whole point is a
 * snapshot "as of right now" rather than a live feed (unlike the
 * scripts/testing-dashboard developer tool, this is meant to be left
 * open for a while during a real event without hammering D1).
 */

const STYLE = `
  :root {
    --bg: #0f1115; --panel: #171a21; --panel2: #1e222c; --border: #2a2f3a;
    --text: #e8eaf0; --muted: #8b93a7; --accent: #5b9dff; --ok: #35c47c; --err: #ef5757;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text); font-family: -apple-system, "Segoe UI", Roboto, sans-serif; }
  a { color: var(--accent); }
`;

/** Renders the /admin/login page. `wrongPassword` shows an error banner after a failed attempt. */
export function renderLoginPage(wrongPassword = false): string {
  return `<!doctype html>
<html lang="ca">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>IFS Passcode Relay — Admin</title>
<style>
  ${STYLE}
  body { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
  .card { background: var(--panel); border: 1px solid var(--border); border-radius: 12px; padding: 32px; width: 100%; max-width: 340px; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .sub { color: var(--muted); font-size: 13px; margin: 0 0 20px; }
  input { width: 100%; padding: 10px 12px; background: var(--panel2); border: 1px solid var(--border); color: var(--text); border-radius: 7px; font-size: 14px; margin-bottom: 12px; }
  button { width: 100%; padding: 10px 12px; background: var(--accent); border: none; color: #06111f; font-weight: 600; border-radius: 7px; cursor: pointer; font-size: 14px; }
  .error { background: rgba(239,87,87,.12); color: var(--err); padding: 8px 10px; border-radius: 7px; font-size: 13px; margin-bottom: 14px; }
</style>
</head>
<body>
  <main class="card">
    <h1>IFS Passcode Relay</h1>
    <p class="sub">Tauler d'administració</p>
    ${wrongPassword ? '<div class="error">Contrasenya incorrecta.</div>' : ""}
    <form method="post" action="/admin/login">
      <input type="password" name="password" placeholder="Contrasenya" autofocus required>
      <button type="submit">Entra</button>
    </form>
  </main>
</body>
</html>`;
}

/**
 * Renders the /admin dashboard shell. All data is loaded client-side via
 * /admin/api/data, since it must be re-fetchable on demand (event
 * selection, refresh button) without a full page reload.
 */
export function renderDashboardShell(): string {
  return `<!doctype html>
<html lang="ca">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>IFS Passcode Relay — Admin</title>
<style>
  ${STYLE}
  header { padding: 14px 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  header h1 { font-size: 17px; margin: 0; }
  header form { margin: 0; }
  header button.logout { background: none; border: 1px solid var(--border); color: var(--muted); padding: 6px 12px; border-radius: 7px; cursor: pointer; font-size: 12px; }
  header button.logout:hover { border-color: var(--err); color: var(--err); }
  main { padding: 20px 24px 60px; max-width: 1100px; margin: 0 auto; }

  .controls { background: var(--panel); border: 1px solid var(--border); border-radius: 8px; padding: 12px 14px; margin-bottom: 18px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .controls label { font-size: 13px; color: var(--muted); }
  select { background: var(--panel2); color: var(--text); border: 1px solid var(--border); border-radius: 6px; padding: 7px 10px; font-size: 13px; min-width: 260px; }
  button.refresh { background: var(--panel2); color: var(--text); border: 1px solid var(--border); padding: 7px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; }
  button.refresh:hover { border-color: var(--accent); }
  .queried-at { color: var(--muted); font-size: 12px; margin-left: auto; }

  h2.section { font-size: 14px; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; margin: 24px 0 10px; }
  .hint { color: var(--muted); font-size: 13px; padding: 10px 0; }

  details.table-block { background: var(--panel); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 8px; }
  details.table-block > summary { padding: 10px 14px; cursor: pointer; font-weight: 600; font-size: 14px; display: flex; justify-content: space-between; }
  details.table-block > summary .count { color: var(--muted); font-weight: 400; }
  .table-wrap { overflow-x: auto; padding: 0 14px 12px; }
  table { border-collapse: collapse; width: 100%; font-size: 12px; }
  th, td { border-bottom: 1px solid var(--border); padding: 5px 8px; text-align: left; white-space: nowrap; }
  th { color: var(--muted); font-weight: 600; }
  .empty { color: var(--muted); font-size: 13px; padding: 10px 14px; }
  .err { color: var(--err); font-size: 13px; padding: 10px 14px; }
</style>
</head>
<body>
<header>
  <h1>IFS Passcode Relay — Admin</h1>
  <form method="post" action="/admin/logout"><button class="logout" type="submit">Tanca sessió</button></form>
</header>
<main>
  <div class="controls">
    <label for="eventSelect">Esdeveniment:</label>
    <select id="eventSelect"><option value="">— cap seleccionat —</option></select>
    <button class="refresh" id="refreshBtn">🔄 Actualitza</button>
    <span class="queried-at" id="queriedAt"></span>
  </div>

  <h2 class="section">Dades globals</h2>
  <div id="globalTables"></div>

  <h2 class="section">Dades de l'esdeveniment seleccionat</h2>
  <div id="eventTables"></div>
</main>

<script>
function el(tag, attrs, children) {
  attrs = attrs || {}; children = children || [];
  const e = document.createElement(tag);
  for (const k in attrs) {
    const v = attrs[k];
    if (k === 'text') e.textContent = v;
    else e.setAttribute(k, v);
  }
  [].concat(children).forEach(function (c) { if (c) e.appendChild(c); });
  return e;
}

function renderTables(container, tables, tableColumns) {
  container.innerHTML = '';
  Object.keys(tables).forEach(function (name) {
    const rows = tables[name];
    const details = el('details', { class: 'table-block' });
    details.open = true;
    details.appendChild(el('summary', {}, [
      el('span', { text: name }),
      el('span', { class: 'count', text: rows.length + ' files' }),
    ]));
    // Column names come from the first row when there's data, or from
    // the schema (fetched fresh on every request via PRAGMA table_info)
    // when the table is empty — either way the header row always
    // renders, just with no <tr> underneath when there's nothing to show.
    const cols = rows.length ? Object.keys(rows[0]) : ((tableColumns && tableColumns[name]) || []);
    if (cols.length) {
      const table = el('table');
      table.appendChild(el('thead', {}, el('tr', {}, cols.map(function (c) { return el('th', { text: c }); }))));
      const tbody = el('tbody', {}, rows.map(function (r) {
        return el('tr', {}, cols.map(function (c) { return el('td', { text: r[c] === null ? '·' : String(r[c]) }); }));
      }));
      table.appendChild(tbody);
      details.appendChild(el('div', { class: 'table-wrap' }, table));
    } else {
      details.appendChild(el('div', { class: 'empty', text: '(cap fila)' }));
    }
    container.appendChild(details);
  });
}

function populateEventSelect(events, keepSelection) {
  const select = document.getElementById('eventSelect');
  const current = keepSelection ? select.value : '';
  select.innerHTML = '';
  select.appendChild(el('option', { value: '', text: '— cap seleccionat —' }));
  events.forEach(function (ev) {
    const label = ev.code + ' — ' + ev.name + ' (' + ev.status + ')';
    const opt = el('option', { value: String(ev.id), text: label });
    select.appendChild(opt);
  });
  select.value = current;
}

async function loadData(eventId) {
  const globalContainer = document.getElementById('globalTables');
  const eventContainer = document.getElementById('eventTables');
  try {
    const url = '/admin/api/data' + (eventId ? '?event=' + encodeURIComponent(eventId) : '');
    const res = await fetch(url);
    if (res.status === 401) { window.location.href = '/admin/login'; return; }
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    renderTables(globalContainer, data.global, data.tableColumns);
    populateEventSelect(data.global.events, true);

    if (data.eventTables) {
      renderTables(eventContainer, data.eventTables, data.tableColumns);
    } else {
      eventContainer.innerHTML = '';
      eventContainer.appendChild(el('div', { class: 'hint', text: 'Selecciona un esdeveniment per veure\\'n les dades.' }));
    }

    document.getElementById('queriedAt').textContent = 'Consultat: ' + new Date().toLocaleTimeString('ca-ES');
  } catch (e) {
    globalContainer.innerHTML = '';
    globalContainer.appendChild(el('div', { class: 'err', text: 'Error carregant les dades: ' + e.message }));
  }
}

document.getElementById('eventSelect').addEventListener('change', function (e) {
  loadData(e.target.value || null);
});
document.getElementById('refreshBtn').addEventListener('click', function () {
  loadData(document.getElementById('eventSelect').value || null);
});

loadData(null);
</script>
</body>
</html>`;
}
