// Step definitions for the TESTING.md walkthrough dashboard, covering
// all of Fases 0-12. Each step mirrors one or more rows of TESTING.md's
// "Pas | Agent | Acció | Resultat esperat" tables.
//
// A step is either:
//   - automatic: has `currentSql` (and optionally `baselineSql`), plus a
//     `compare(baseline, current, ctx)` function returning
//     `{ done, detail, captured? }`. The dashboard polls D1 and advances
//     on its own once `done` is true.
//   - manual: has no SQL at all. The host reads `expected`, checks it on
//     Telegram, and clicks "Fet ✅" in the dashboard to advance.
//
// `{{A}}`/`{{B}}`/`{{C}}`/`{{D}}` in SQL resolve to that agent's Telegram
// user_id once identified (see server.mjs's agent-resolution). `{{event1.id}}`
// / `{{event1.code}}` (etc.) resolve to values captured by an earlier
// step's `captured` result.
//
// Rows whose "Resultat esperat" is purely about Telegram message content,
// button layout, or a negative ("nothing happens") are marked manual —
// D1 has no footprint to poll for those. Rows with a real, specific data
// mutation are automatic.

export const steps = [
  // ---------------------------------------------------------------- FASE 0
  {
    id: '0.1', phase: 0, agents: ['A', 'B', 'C', 'D'],
    action: '/start',
    expected: "Missatge de benvinguda en l'idioma detectat automàticament del client de Telegram.",
    kind: 'agentsResolved',
  },
  {
    id: '0.2', phase: 0, agents: ['A', 'B', 'C', 'D'],
    action: '/help',
    expected: 'Llista de comandes disponibles, en el mateix idioma.',
    manual: true,
  },
  {
    id: '0.3', phase: 0, agents: ['A', 'B', 'C', 'D'],
    action: '/language {{me.langTarget}}',
    expected:
      "Confirmació en el NOU idioma; els missatges ja enviats no canvien. L'idioma suggerit a cada agent es calcula a partir del que ja tenia detectat al pas 0.1 (taula users) i és sempre diferent del seu; entre els 4 agents es couen 4 idiomes diferents entre si d'entre els 6 suportats (en/ca/es/fr/gl/eu) sempre que sigui possible — només no ho és si els 4 ja tenien exactament el mateix idioma de partida.",
    baselineSql: "SELECT user_id, language FROM users WHERE user_id IN ({{A}},{{B}},{{C}},{{D}})",
    currentSql: "SELECT user_id, language FROM users WHERE user_id IN ({{A}},{{B}},{{C}},{{D}})",
    // Computes, once per step (from the baseline just captured), a
    // per-agent target language different from that agent's own current
    // one — a permutation of 4 of the 6 supported languages across
    // A/B/C/D when one exists, so a spread of distinct languages gets
    // exercised across the group (there are only 4 test agents, so a
    // single run can't exercise all 6). Falls back to a single shared
    // different language only in the degenerate case where all 4 agents
    // already share the same current language (a permutation avoiding
    // everyone's own language is then impossible).
    prepare(baseline, ctx) {
      const LANGS = ['en', 'ca', 'es', 'fr', 'gl', 'eu'];
      const letters = ['A', 'B', 'C', 'D'];
      const cur = {};
      for (const l of letters) {
        const uid = ctx.agents[l]?.user_id;
        const row = (baseline || []).find(r => String(r.user_id) === String(uid));
        cur[l] = row?.language ?? null;
      }
      const permutations = (arr) =>
        arr.length <= 1
          ? [arr]
          : arr.flatMap((x, i) => permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map(p => [x, ...p]));
      const chosen =
        permutations(LANGS).find(perm => letters.every((l, i) => cur[l] == null || perm[i] !== cur[l])) ??
        letters.map(() => LANGS.find(x => x !== cur.A) ?? LANGS[0]);
      const langTarget = {};
      letters.forEach((l, i) => { langTarget[l] = chosen[i]; });
      return { langTarget, langCurrent: cur };
    },
    compare(baseline, current, ctx) {
      const byId = (rows) => Object.fromEntries((rows || []).map(r => [String(r.user_id), r.language]));
      const b = byId(baseline || []), c = byId(current || []);
      const letters = ['A', 'B', 'C', 'D'];
      const changed = letters.every(l => {
        const uid = ctx.agents[l]?.user_id;
        return uid && b[uid] && c[uid] && b[uid] !== c[uid];
      });
      const detail = letters.map(l => {
        const uid = ctx.agents[l]?.user_id;
        if (!uid) return `${l}: (no identificat)`;
        const target = ctx.vars.langTarget?.[l];
        return `${l}: ${b[uid] ?? '?'} → ${c[uid] ?? '?'} (suggerit: ${target ?? '?'})`;
      }).join('  ·  ');
      return { done: changed, detail };
    },
  },
  {
    id: '0.4', phase: 0, agents: ['A'],
    action: '/language de',
    expected:
      "Codi no suportat: missatge d'error / ús, sense canviar l'idioma actual. Tot seguit, cadascú (A inclòs) estableix amb /language <codi> l'idioma amb què vol continuar la resta de les proves: el que li va tocar al pas 0.3, el seu original detectat al pas 0.1, o qualsevol altre — incloent-hi no fer res, per mantenir el del pas 0.3.",
    manual: true,
  },
  {
    id: '0.5', phase: 0, agents: ['A', 'B', 'C', 'D'],
    action: '/current',
    expected: 'Missatge indicant que no es pertany a cap esdeveniment.',
    manual: true,
  },
  {
    // The only point in the whole plan where none of the 4 agents has
    // participated in anything yet — from Fase 1 onward, every one of
    // them accumulates events via participant_history (see Fase 12).
    id: '0.6', phase: 0, agents: ['A', 'B', 'C', 'D'],
    action: '/events',
    expected: 'Llista buida amb el missatge corresponent, per als quatre.',
    currentSql: `SELECT
        (SELECT COUNT(*) FROM participants WHERE user_id IN ({{A}},{{B}},{{C}},{{D}})) AS current_n,
        (SELECT COUNT(*) FROM participant_history WHERE user_id IN ({{A}},{{B}},{{C}},{{D}})) AS history_n`,
    compare(_b, current) {
      const r = current?.[0];
      const done = Number(r?.current_n ?? -1) === 0 && Number(r?.history_n ?? -1) === 0;
      return { done, detail: r ? `Participacions actuals: ${r.current_n} · a l'historial: ${r.history_n}` : 'Sense dades.' };
    },
  },

  // ---------------------------------------------------------------- FASE 1
  {
    id: '1.1', phase: 1, agents: ['A'],
    action: '/newevent Proves Principal',
    expected: "Es crea l'esdeveniment amb el patró per defecte XXX99*999XX; abans d'unir-s'hi s'envia automàticament el text per compartir.",
    currentSql: "SELECT id, code FROM events WHERE admin_user_id={{A}} AND name='Proves Principal' AND pattern='XXX99*999XX' ORDER BY id ASC LIMIT 1",
    compare(_b, current) {
      if (!current?.length) return { done: false, detail: 'Encara no creat.' };
      const { id, code } = current[0];
      return { done: true, detail: `Event 1 = id ${id}, codi ${code}`, captured: { event1: { id, code } } };
    },
  },
  {
    id: '1.2', phase: 1, agents: ['A'],
    action: '(cap comanda — prova els botons del 2n missatge)',
    expected: "Només apareixen els idiomes diferents de l'actual d'A, tots en una sola fila.",
    manual: true,
  },
  {
    id: '1.3', phase: 1, agents: ['A'],
    action: '(prémer el botó ES)',
    expected: "S'envia un nou parell de missatges en espanyol; el botó ES ja no hi surt.",
    manual: true,
  },
  {
    id: '1.4', phase: 1, agents: ['A'],
    action: '/current',
    expected: "Mostra nom, codi, patró, 1 participant i A com a administrador actual (amb el marcador \"(tu)\").",
    manual: true,
  },
  {
    // A is still a participant of Event 1 (active) at this point, so
    // /newevent now asks to confirm leaving it first (see CLAUDE.md
    // "Succession on leaving an event") instead of creating anything
    // right away — declining creates nothing at all.
    id: '1.5', phase: 1, agents: ['A'],
    action: '/newevent Proves Principal  (confirmar amb Sí quan pregunti si vols deixar Event 1)',
    expected: "Es crea un segon esdeveniment nou amb un codi diferent (Event 1b) — anotat per a la Fase 2.",
    currentSql: "SELECT id, code FROM events WHERE admin_user_id={{A}} AND name='Proves Principal' AND pattern='XXX99*999XX' ORDER BY id ASC",
    compare(_b, current) {
      if (!current || current.length < 2) return { done: false, detail: `${current?.length ?? 0}/2 esdeveniments trobats.` };
      const { id, code } = current[1];
      return { done: true, detail: `Event 1b = id ${id}, codi ${code}`, captured: { event1b: { id, code } } };
    },
  },
  {
    id: '1.6', phase: 1, agents: ['A'],
    action: '/sharetext',
    expected: "Regenera el text per al codi de l'esdeveniment actual d'A, en el seu idioma actual.",
    manual: true,
  },
  {
    id: '1.7', phase: 1, agents: ['A'],
    action: '/sharetext {{event1.code}} fr',
    expected: 'Regenera el text per a aquell codi concret en francès.',
    manual: true,
  },
  {
    id: '1.8', phase: 1, agents: ['A'],
    action: '/newevent Proves X | XY1',
    expected: "Rebutjat (el patró només admet X, 9, *).",
    manual: true,
  },
  {
    // Step 1.5's /newevent auto-joined A to Event 1b, and since A
    // administered Event 1 with nobody else in it yet, that implicit
    // departure ran the same succession /leave uses (see CLAUDE.md
    // "Succession on leaving an event") and closed Event 1 as
    // `abandoned`. Joining its code here doesn't get rejected — a
    // closed-abandoned event revives under whoever joins it next (see
    // CLAUDE.md "Reviving an abandoned event"), so this both reopens
    // Event 1 and makes A its administrator again, which Fase 4+ needs.
    // Also the only place in this plan that accepts (Sí) a /join
    // switch confirmation — 2.5 tests declining (No) one.
    id: '1.9', phase: 1, agents: ['A'],
    action: '/join {{event1.code}}  (i confirmar amb Sí el canvi que es proposa — revifarà Event 1)',
    expected:
      "Event 1 es reobre (status=active, closed_reason=NULL) i A en torna a ser l'administrador (marcat trusted); Event 1b, on A quedava sol, tanca alhora com a abandoned pel mateix motiu.",
    currentSql:
      "SELECT status, closed_reason, admin_user_id FROM events WHERE id={{event1.id}}",
    compare(_b, current, ctx) {
      const row = current?.[0];
      if (!row) return { done: false, detail: 'Sense dades.' };
      const aId = ctx.agents.A?.user_id;
      const done = row.status === 'active' && row.closed_reason === null && String(row.admin_user_id) === String(aId);
      return { done, detail: `Event 1: status=${row.status}, closed_reason=${row.closed_reason ?? 'NULL'}, admin=${row.admin_user_id}` };
    },
  },

  // ---------------------------------------------------------------- FASE 2
  {
    id: '2.1', phase: 2, agents: ['B'],
    action: '/join {{event1.code}}',
    expected: "S'uneix; rep un missatge d'estat en viu i el nudge cap a /sharetext.",
    currentSql: "SELECT 1 FROM participants WHERE user_id={{B}} AND event_id={{event1.id}}",
    compare(_b, current) { return { done: !!current?.length, detail: current?.length ? 'B és participant.' : 'Encara no.' }; },
  },
  {
    id: '2.2', phase: 2, agents: ['C'],
    action: '/join {{event1.code}}',
    expected: 'Igual que B.',
    currentSql: "SELECT 1 FROM participants WHERE user_id={{C}} AND event_id={{event1.id}}",
    compare(_b, current) { return { done: !!current?.length, detail: current?.length ? 'C és participant.' : 'Encara no.' }; },
  },
  {
    id: '2.3', phase: 2, agents: ['D'],
    action: '/join {{event1.code}}',
    expected: 'Igual que B.',
    currentSql: "SELECT 1 FROM participants WHERE user_id={{D}} AND event_id={{event1.id}}",
    compare(_b, current) { return { done: !!current?.length, detail: current?.length ? 'D és participant.' : 'Encara no.' }; },
  },
  {
    id: '2.4', phase: 2, agents: ['B'],
    action: '/join ZZZZZZ',
    expected: "Error de codi no trobat, sense afectar l'esdeveniment actual de B.",
    manual: true,
  },
  {
    id: '2.5', phase: 2, agents: ['B'],
    action: '/join {{event1b.code}}',
    expected: "Confirmació 'ja ets en un esdeveniment, vols canviar?' — respondre que NO; B segueix a Event 1.",
    manual: true,
  },
  {
    id: '2.6', phase: 2, agents: ['A', 'B', 'C', 'D'],
    action: '/current',
    expected: '4 participants per a tots; només A hi veu el marcador "(tu)" al costat de l\'administrador.',
    manual: true,
  },

  // ---------------------------------------------------------------- FASE 3
  {
    id: '3.1', phase: 3, agents: ['B'],
    action: '1 A',
    expected: 'Acceptat sense confirmació.',
    currentSql: "SELECT value FROM passcode_reports WHERE event_id={{event1.id}} AND user_id={{B}} AND position=1 ORDER BY id DESC LIMIT 1",
    compare(_b, current) {
      const v = current?.[0]?.value;
      return { done: v === 'A', detail: v ? `Valor actual de B a pos.1: ${v}` : 'Sense report.' };
    },
  },
  {
    id: '3.2', phase: 3, agents: ['B'],
    action: '1 A',
    expected: 'Resposta de no-op curta; no s\'escriu res nou.',
    manual: true,
  },
  {
    id: '3.3', phase: 3, agents: ['B'],
    action: '1 B',
    expected: "Autocorrecció sense confirmació: s'esborra el report anterior i es desa el nou; l'acusament esmenta ambdós valors.",
    currentSql: "SELECT value FROM passcode_reports WHERE event_id={{event1.id}} AND user_id={{B}} AND position=1",
    compare(_b, current) {
      const done = current?.length === 1 && current[0].value === 'B';
      return { done, detail: `Reports de B a pos.1: ${JSON.stringify(current?.map(r => r.value))}` };
    },
  },
  {
    id: '3.4', phase: 3, agents: ['B'],
    action: '1',
    expected: "Elimina el report actual de B a la posició 1; el missatge confirma quin valor s'ha tret.",
    currentSql: "SELECT COUNT(*) AS n FROM passcode_reports WHERE event_id={{event1.id}} AND user_id={{B}} AND position=1",
    compare(_b, current) { const n = current?.[0]?.n ?? 1; return { done: n === 0, detail: `Reports de B a pos.1: ${n}` }; },
  },
  {
    id: '3.5', phase: 3, agents: ['B'],
    action: '1',
    expected: 'El bot indica que B no tenia cap report en aquesta posició.',
    manual: true,
  },
  {
    id: '3.6', phase: 3, agents: ['B'],
    action: '/submit 2 K',
    expected: 'Equivalent explícit a "2 K"; acceptat.',
    currentSql: "SELECT value FROM passcode_reports WHERE event_id={{event1.id}} AND user_id={{B}} AND position=2 ORDER BY id DESC LIMIT 1",
    compare(_b, current) { const v = current?.[0]?.value; return { done: v === 'K', detail: v ? `B a pos.2: ${v}` : 'Sense report.' }; },
  },
  {
    id: '3.7', phase: 3, agents: ['C'],
    action: '2 Z  (confirmar amb Sí quan es dispari la confirmació Sí/No)',
    expected: "S'afegeix Z com a candidat addicional a la posició 2 (no substitueix el de B); ara 2 candidats.",
    currentSql: "SELECT value FROM passcode_reports WHERE event_id={{event1.id}} AND user_id={{C}} AND position=2 ORDER BY id DESC LIMIT 1",
    compare(_b, current) { const v = current?.[0]?.value; return { done: v === 'Z', detail: v ? `C a pos.2: ${v}` : 'Sense report.' }; },
  },
  {
    id: '3.8', phase: 3, agents: ['D'],
    action: '2 Z',
    expected: 'No hi ha confirmació (coincideix amb un candidat existent); D s\'afegeix com a suport addicional del mateix candidat.',
    currentSql: "SELECT value FROM passcode_reports WHERE event_id={{event1.id}} AND user_id={{D}} AND position=2 ORDER BY id DESC LIMIT 1",
    compare(_b, current) { const v = current?.[0]?.value; return { done: v === 'Z', detail: v ? `D a pos.2: ${v}` : 'Sense report.' }; },
  },
  {
    id: '3.9', phase: 3, agents: ['C'],
    action: '4 X  (confirmar amb No quan es dispari la confirmació de tipus)',
    expected: "Es dispara la confirmació Sí/No pel tipus (posició 4 espera un dígit); en confirmar amb No, no es desa res i la posició 4 segueix sense report de C.",
    manual: true,
  },
  {
    id: '3.10', phase: 3, agents: ['C'],
    action: '4 X',
    expected: "S'accepta igualment tot i el tipus incorrecte (confirmar amb Sí).",
    currentSql: "SELECT value FROM passcode_reports WHERE event_id={{event1.id}} AND user_id={{C}} AND position=4 ORDER BY id DESC LIMIT 1",
    compare(_b, current) { const v = current?.[0]?.value; return { done: v === 'X', detail: v ? `C a pos.4: ${v}` : 'Sense report.' }; },
  },
  {
    id: '3.11', phase: 3, agents: ['B'],
    action: '4 Y',
    expected: 'El missatge de confirmació esmenta DESACORD i TIPUS incorrecte alhora (confirmar amb Sí).',
    currentSql: "SELECT value FROM passcode_reports WHERE event_id={{event1.id}} AND user_id={{B}} AND position=4 ORDER BY id DESC LIMIT 1",
    compare(_b, current) { const v = current?.[0]?.value; return { done: v === 'Y', detail: v ? `B a pos.4: ${v}` : 'Sense report.' }; },
  },
  {
    // Fixed, pre-agreed values (not "free choice") so this step can be
    // validated automatically instead of via a manual checkbox. Position
    // 9 is deliberately included here with a consensus value even though
    // Fase 4.10 later creates a fresh conflict there — that step has C
    // switch away from this same consensus value, which counts as a
    // self-correction that reopens the position, while B reaffirming the
    // same value is a harmless no-op.
    id: '3.12', phase: 3, agents: ['B', 'C', 'D'],
    action: '5 7  ·  6 GLYPH  ·  7 3  ·  8 4  ·  9 5  ·  10 Q  ·  11 R  (un missatge per posició, els mateixos valors els tres)',
    expected: "Cada posició (5-11) queda amb un únic candidat consistent, suportat pels tres; la posició 2 (Fase 3.7/3.8) segueix sent l'única en conflicte de cara a la Fase 4.",
    currentSql:
      "SELECT position, value, COUNT(DISTINCT user_id) AS n FROM passcode_reports WHERE event_id={{event1.id}} AND position IN (5,6,7,8,9,10,11) GROUP BY position, value",
    compare(_b, current) {
      const EXPECTED = { 5: '7', 6: 'GLYPH', 7: '3', 8: '4', 9: '5', 10: 'Q', 11: 'R' };
      const byPos = Object.fromEntries((current || []).map(r => [String(r.position), r]));
      const missing = Object.entries(EXPECTED).filter(([pos, val]) => {
        const r = byPos[pos];
        return !r || String(r.value).toUpperCase() !== val || Number(r.n) < 3;
      }).map(([pos]) => pos);
      return {
        done: missing.length === 0,
        detail: missing.length ? `Falten o inconsistents: posicions ${missing.join(', ')}.` : 'Posicions 5-11 consistents entre B, C i D.',
      };
    },
  },

  // ---------------------------------------------------------------- FASE 4
  {
    id: '4.1', phase: 4, agents: ['A'],
    action: '/status',
    expected: 'Mostra el progrés i les combinacions possibles (2, per sota del límit de 16).',
    manual: true,
  },
  {
    id: '4.2', phase: 4, agents: ['B'],
    action: '/status',
    expected: "Es reenvia com a missatge NOU; status_message_id de B queda repuntat cap aquest.",
    baselineSql: 'SELECT status_message_id FROM participants WHERE user_id={{B}}',
    currentSql: 'SELECT status_message_id FROM participants WHERE user_id={{B}}',
    compare(baseline, current) {
      const b = baseline?.[0]?.status_message_id, c = current?.[0]?.status_message_id;
      return { done: c != null && c !== b, detail: `status_message_id: ${b ?? '?'} → ${c ?? '?'}` };
    },
  },
  {
    id: '4.3', phase: 4, agents: ['A'],
    action: '/resolve 2',
    expected: 'Llista els candidats de la posició 2 (K amb 1 suport, Z amb 2) amb botons, sense desglossament de confiança encara.',
    manual: true,
  },
  {
    id: '4.4', phase: 4, agents: ['A'],
    action: '/trust B',
    expected: "B queda trusted; tornant a /resolve 2, el candidat de B mostra el desglossament n (m).",
    currentSql: "SELECT status FROM event_trust WHERE event_id={{event1.id}} AND user_id={{B}}",
    compare(_b, current) { const s = current?.[0]?.status; return { done: s === 'trusted', detail: s ? `event_trust(B) = ${s}` : 'Sense fila.' }; },
  },
  {
    id: '4.5', phase: 4, agents: ['A'],
    action: '(prémer el botó del candidat Z al /resolve 2)',
    expected: 'Es resol la posició 2 a Z; estat en viu de tots els participants s\'actualitza.',
    currentSql: "SELECT value FROM passcode_resolutions WHERE event_id={{event1.id}} AND position=2",
    compare(_b, current) { const v = current?.[0]?.value; return { done: v === 'Z', detail: v ? `Resolució pos.2: ${v}` : 'Encara sense resoldre.' }; },
  },
  {
    id: '4.6', phase: 4, agents: ['A'],
    action: '/resolve 2',
    expected: 'Encara llista els candidats vius i permet canviar el valor sense passar per /unresolve.',
    manual: true,
  },
  {
    id: '4.7', phase: 4, agents: ['A'],
    action: '/unresolve 2',
    expected: 'La posició torna a quedar oberta.',
    currentSql: "SELECT COUNT(*) AS n FROM passcode_resolutions WHERE event_id={{event1.id}} AND position=2",
    compare(_b, current) { const n = current?.[0]?.n ?? 1; return { done: n === 0, detail: `Resolucions pos.2: ${n}` }; },
  },
  {
    id: '4.8', phase: 4, agents: ['A'],
    action: '/resolve 2 K',
    expected: 'Resol directament sense passar pel llistat de botons.',
    currentSql: "SELECT value FROM passcode_resolutions WHERE event_id={{event1.id}} AND position=2",
    compare(_b, current) { const v = current?.[0]?.value; return { done: v === 'K', detail: v ? `Resolució pos.2: ${v}` : 'Encara sense resoldre.' }; },
  },
  {
    id: '4.9', phase: 4, agents: ['A'],
    action: '/resolve 4 @C',
    expected: 'Resol la posició 4 amb el valor que va reportar C.',
    currentSql: "SELECT value FROM passcode_resolutions WHERE event_id={{event1.id}} AND position=4",
    compare(_b, current) { const v = current?.[0]?.value; return { done: v === 'X', detail: v ? `Resolució pos.4: ${v}` : 'Encara sense resoldre.' }; },
  },
  {
    id: '4.10', phase: 4, agents: ['B', 'C'],
    // Position 9 already has a 3-way consensus value ('5', from step
    // 3.12), so this doesn't submit two fresh reports — it deliberately
    // reopens the conflict: B resubmits the same value (identical to
    // its own last report, so a harmless no-op) while C switches to a
    // different one (a self-correction, since it differs from C's own
    // last report at that position — no confirmation either way, and
    // '8' is still a valid digit so no type-mismatch confirmation
    // fires). `baselineSql` is trivial and only exists to trigger
    // `prepare` once so each agent's copy line shows just its own
    // fixed value instead of both agents' lines concatenated together
    // (same `{{me.*}}` pattern as step 0.3).
    baselineSql: 'SELECT 1',
    prepare() { return { p9: { B: '5', C: '8' } }; },
    action: '9 {{me.p9}}',
    expected: "B reafirma el valor ja consensuat a la posició 9 (no-op); C hi canvia a un valor diferent (autocorrecció, sense confirmació). Es crea així un segon conflicte (candidats 5 i 8), a més del de la posició 2, per tenir-ne almenys 2 quan A faci /resolve sense arguments.",
    currentSql: `SELECT position FROM passcode_candidates WHERE event_id={{event1.id}}
      GROUP BY position HAVING COUNT(*) > 1`,
    compare(_b, current) {
      const n = current?.length ?? 0;
      return { done: n >= 2, detail: `Posicions en conflicte: ${n} (${(current || []).map(r => r.position).join(', ')})` };
    },
  },
  {
    id: '4.11', phase: 4, agents: ['A'],
    action: '/resolve   (sense arguments; prémer els botons del recorregut fins que no quedin conflictes)',
    expected: 'Resol cada posició en conflicte una darrere l\'altra sense tornar a escriure /resolve; en acabar, cap posició queda en desacord.',
    currentSql: `SELECT position FROM passcode_candidates WHERE event_id={{event1.id}}
      AND position NOT IN (SELECT position FROM passcode_resolutions WHERE event_id={{event1.id}})
      GROUP BY position HAVING COUNT(*) > 1`,
    compare(_b, current) {
      const n = current?.length ?? 0;
      return { done: n === 0, detail: n === 0 ? 'Cap conflicte pendent.' : `Encara en conflicte: ${(current || []).map(r => r.position).join(', ')}` };
    },
  },
  {
    id: '4.12', phase: 4, agents: ['A'],
    action: '(el mateix /resolve del pas anterior, últim missatge)',
    expected: "El bot indica que ja no hi ha cap desacord pendent, i NO ofereix cap drecera per tancar l'esdeveniment — remet a /verify.",
    manual: true,
  },
  {
    id: '4.13', phase: 4, agents: ['A'],
    action: '/resolve 99',
    expected: "Error d'ús / posició invàlida.",
    manual: true,
  },
  {
    id: '4.14', phase: 4, agents: ['A'],
    // Position 6 (the word slot) was never in conflict — B, C and D all
    // reported the same consensus value, GLYPH, back in step 3.12. This
    // step just shows /resolve works on a word-type position too, even
    // without a disagreement to settle.
    action: '/resolve 6 GLYPH',
    expected: 'Funciona igual que per a lletres/dígits — les paraules també es resolen per posició.',
    currentSql: "SELECT value FROM passcode_resolutions WHERE event_id={{event1.id}} AND position=6",
    compare(_b, current) { const v = current?.[0]?.value; return { done: v === 'GLYPH', detail: v ? `Resolució pos.6: ${v}` : 'Encara sense resoldre.' }; },
  },

  // ---------------------------------------------------------------- FASE 5
  {
    id: '5.1', phase: 5, agents: ['A'],
    action: '/troll D',
    expected: 'D queda marcat troll per a Event 1.',
    currentSql: "SELECT status FROM event_trust WHERE event_id={{event1.id}} AND user_id={{D}}",
    compare(_b, current) { const s = current?.[0]?.status; return { done: s === 'troll', detail: s ? `event_trust(D) = ${s}` : 'Sense fila.' }; },
  },
  {
    // Position 3 is the only position still untouched since Fase 3 —
    // reporting anywhere else would collide with the consensus set up
    // at 3.12 and introduce an unintended extra conflict.
    id: '5.2', phase: 5, agents: ['D'],
    action: '3 M',
    expected: "S'accepta a passcode_reports, però no compta a passcode_candidates mentre D sigui troll.",
    currentSql: "SELECT value FROM passcode_reports WHERE event_id={{event1.id}} AND user_id={{D}} AND position=3 ORDER BY id DESC LIMIT 1",
    compare(_b, current) { const v = current?.[0]?.value; return { done: v === 'M', detail: v ? `D a pos.3: ${v}` : 'Sense report.' }; },
  },
  {
    id: '5.3', phase: 5, agents: ['A'],
    action: '/resolve 3',
    expected: 'El candidat de D (M) no apareix al llistat, tot i existir el report.',
    manual: true,
  },
  {
    id: '5.4', phase: 5, agents: ['B', 'C'],
    action: '/status',
    expected: "Segueixen rebent actualitzacions amb normalitat; D és l'única persona que ha deixat de rebre-les.",
    manual: true,
  },
  {
    // The trust flag itself is D1-checkable; the immediate status-message
    // refresh /untrust also triggers for D isn't (Telegram-side, no D1
    // footprint), so verify that part by eye on D's chat.
    id: '5.5', phase: 5, agents: ['A'],
    action: '/untrust D',
    expected: "D torna a l'estat neutral; el seu missatge d'estat es refresca de seguida amb l'estat actual (comprovar-ho al xat de D).",
    currentSql: "SELECT status FROM event_trust WHERE event_id={{event1.id}} AND user_id={{D}}",
    compare(_b, current) { const s = current?.[0]?.status; return { done: !s, detail: s ? `event_trust(D) = ${s}` : 'Sense fila (neutral).' }; },
  },
  {
    id: '5.6', phase: 5, agents: ['A'],
    action: '/resolve 3',
    expected: 'El candidat de D (M) torna a aparèixer al llistat.',
    manual: true,
  },
  {
    id: '5.7', phase: 5, agents: ['B', 'C', 'D'],
    action: '/status',
    expected: "Tots reben l'actualització amb normalitat, D inclòs — el seu missatge ja estava al dia des del pas 5.5.",
    manual: true,
  },
  {
    id: '5.8', phase: 5, agents: ['A'],
    action: '/trust C',
    expected: 'C queda marcat trusted.',
    currentSql: "SELECT status FROM event_trust WHERE event_id={{event1.id}} AND user_id={{C}}",
    compare(_b, current) { const s = current?.[0]?.status; return { done: s === 'trusted', detail: s ? `event_trust(C) = ${s}` : 'Sense fila.' }; },
  },
  {
    id: '5.9', phase: 5, agents: ['A'],
    action: '/untrust C',
    expected: "Torna a neutral; no dispara cap resolució automàtica.",
    currentSql: "SELECT status FROM event_trust WHERE event_id={{event1.id}} AND user_id={{C}}",
    compare(_b, current) { const s = current?.[0]?.status; return { done: !s, detail: s ? `event_trust(C) = ${s}` : 'Sense fila (neutral).' }; },
  },
  {
    id: '5.10', phase: 5, agents: ['A'],
    action: '/kick D',
    expected: 'D deixa de ser participant.',
    currentSql: "SELECT 1 FROM participants WHERE user_id={{D}} AND event_id={{event1.id}}",
    compare(_b, current) { return { done: !current?.length, detail: current?.length ? 'D encara hi és.' : 'D ja no és participant.' }; },
  },
  {
    id: '5.11', phase: 5, agents: ['D'],
    action: '3 P',
    expected: 'Rebutjat — cal ser participant actiu per poder reportar.',
    manual: true,
  },
  {
    id: '5.12', phase: 5, agents: ['D'],
    action: '/join {{event1.code}}',
    expected: 'D torna a entrar com a participant nou.',
    currentSql: "SELECT 1 FROM participants WHERE user_id={{D}} AND event_id={{event1.id}}",
    compare(_b, current) { return { done: !!current?.length, detail: current?.length ? 'D torna a ser participant.' : 'Encara no.' }; },
  },
  {
    id: '5.13', phase: 5, agents: ['A'],
    action: '/resolve 3',
    expected: "Comprovar si el report nou de D compta segons si li havia quedat el flag troll d'abans del /kick.",
    manual: true,
  },

  // ---------------------------------------------------------------- FASE 6
  {
    id: '6.1', phase: 6, agents: ['A'],
    action: '/promote B',
    expected: 'B esdevé administrador; queda marcat trusted; sense confirmació.',
    currentSql: "SELECT admin_user_id FROM events WHERE id={{event1.id}}",
    compare(_b, current, ctx) { const a = current?.[0]?.admin_user_id; return { done: String(a) === String(ctx.agents.B?.user_id), detail: `admin_user_id = ${a}` }; },
  },
  {
    id: '6.2', phase: 6, agents: ['A', 'B'],
    action: '(comprovar notificacions)',
    expected: 'A rep confirmació directa; B rep un missatge nou anunciant el traspàs.',
    manual: true,
  },
  {
    id: '6.3', phase: 6, agents: ['A'],
    action: '(comprovar el propi flag de confiança)',
    expected: 'A manté trusted (ja ho era des de la creació); segueix sent participant normal.',
    manual: true,
  },
  {
    id: '6.4', phase: 6, agents: ['A'],
    action: '/kick C',
    expected: "Rebutjada — A ja no és l'administrador.",
    manual: true,
  },
  {
    id: '6.5', phase: 6, agents: ['B'],
    action: '/promote A',
    expected: 'Retorna el rol a A.',
    currentSql: "SELECT admin_user_id FROM events WHERE id={{event1.id}}",
    compare(_b, current, ctx) { const a = current?.[0]?.admin_user_id; return { done: String(a) === String(ctx.agents.A?.user_id), detail: `admin_user_id = ${a}` }; },
  },

  // --------------------------------------------------------------- FASE 7a
  {
    // Combined check: Event 1's succession to B (triggered by /newevent,
    // not /leave — see CLAUDE.md "Succession on leaving an event") AND
    // Event 2's creation, in one query.
    id: '7a.1', phase: 7, agents: ['A'],
    action: '/newevent Proves Successio A  (confirmar amb Sí quan pregunti si vols deixar Event 1)',
    expected: 'Event 1 passa a administrar-lo B (successió disparada per /newevent); es crea Event 2, amb A com a administrador i trusted.',
    currentSql: `SELECT
        (SELECT admin_user_id FROM events WHERE id={{event1.id}}) AS ev1_admin,
        e2.id AS ev2_id, e2.code AS ev2_code
      FROM (SELECT id, code FROM events WHERE admin_user_id={{A}} AND name='Proves Successio A' ORDER BY id ASC LIMIT 1) e2`,
    compare(_b, current, ctx) {
      const r = current?.[0];
      if (!r) return { done: false, detail: 'Event 2 encara no creat.' };
      const bId = ctx.agents.B?.user_id;
      const done = String(r.ev1_admin) === String(bId);
      return {
        done,
        detail: `Event1 admin: ${r.ev1_admin} (esperat B=${bId}) · Event2: id ${r.ev2_id}, codi ${r.ev2_code}`,
        captured: done ? { event2: { id: r.ev2_id, code: r.ev2_code } } : undefined,
      };
    },
  },
  {
    id: '7a.2', phase: 7, agents: ['B', 'C', 'D'],
    action: '/join {{event2.code}}  (en aquest ordre: B, C, D — confirmant el canvi respecte Event 1)',
    expected: "Els tres s'uneixen a Event 2; Event 1 es va buidant i acaba tancant-se com a abandoned, registrat sota D.",
    currentSql: `SELECT
        (SELECT COUNT(*) FROM participants WHERE event_id={{event2.id}} AND user_id IN ({{B}},{{C}},{{D}})) AS joined,
        (SELECT status FROM events WHERE id={{event1.id}}) AS ev1_status,
        (SELECT closed_reason FROM events WHERE id={{event1.id}}) AS ev1_reason,
        (SELECT admin_user_id FROM events WHERE id={{event1.id}}) AS ev1_admin`,
    compare(_b, current, ctx) {
      const r = current?.[0];
      if (!r) return { done: false, detail: 'Sense dades.' };
      const dId = ctx.agents.D?.user_id;
      const done = Number(r.joined) === 3 && r.ev1_status === 'closed' && r.ev1_reason === 'abandoned' && String(r.ev1_admin) === String(dId);
      return { done, detail: `B/C/D a Event2: ${r.joined}/3 · Event1: status=${r.ev1_status}, reason=${r.ev1_reason ?? 'NULL'}, admin=${r.ev1_admin} (esperat D=${dId})` };
    },
  },
  {
    id: '7a.3', phase: 7, agents: ['A'],
    action: '/trust B',
    expected: 'B queda trusted a Event 2.',
    currentSql: "SELECT status FROM event_trust WHERE event_id={{event2.id}} AND user_id={{B}}",
    compare(_b, current) { const s = current?.[0]?.status; return { done: s === 'trusted', detail: s ? `event_trust(B) = ${s}` : 'Sense fila.' }; },
  },
  {
    id: '7a.4', phase: 7, agents: ['B'],
    action: '1 A',
    expected: 'Poques aportacions (1 sola posició).',
    currentSql: "SELECT value FROM passcode_reports WHERE event_id={{event2.id}} AND user_id={{B}} AND position=1 ORDER BY id DESC LIMIT 1",
    compare(_b, current) { const v = current?.[0]?.value; return { done: v === 'A', detail: v ? `B a pos.1: ${v}` : 'Sense report.' }; },
  },
  {
    id: '7a.5', phase: 7, agents: ['C'],
    action: '2 B  ·  3 C  ·  4 1',
    expected: 'Més aportacions que B (3 posicions), però sense trust.',
    currentSql: "SELECT position, value FROM passcode_reports WHERE event_id={{event2.id}} AND user_id={{C}} AND position IN (2,3,4)",
    compare(_b, current) {
      const EXPECTED = { 2: 'B', 3: 'C', 4: '1' };
      const byPos = Object.fromEntries((current || []).map(r => [String(r.position), String(r.value).toUpperCase()]));
      const missing = Object.entries(EXPECTED).filter(([p, v]) => byPos[p] !== v).map(([p]) => p);
      return { done: missing.length === 0, detail: missing.length ? `Falten posicions: ${missing.join(', ')}` : 'Les 3 posicions de C fetes.' };
    },
  },
  {
    id: '7a.6', phase: 7, agents: ['A'],
    action: '/leave',
    expected: 'A surt; el successor ha de ser B (pool trusted no buit), malgrat que C té més aportacions.',
    currentSql: `SELECT
        (SELECT COUNT(*) FROM participants WHERE event_id={{event2.id}} AND user_id={{A}}) AS a_still_there,
        (SELECT admin_user_id FROM events WHERE id={{event2.id}}) AS admin`,
    compare(_b, current, ctx) {
      const r = current?.[0];
      if (!r) return { done: false, detail: 'Sense dades.' };
      const bId = ctx.agents.B?.user_id;
      const done = Number(r.a_still_there) === 0 && String(r.admin) === String(bId);
      return { done, detail: `A encara hi és: ${r.a_still_there} · admin actual: ${r.admin} (esperat B=${bId})` };
    },
  },
  {
    id: '7a.7', phase: 7, agents: ['A', 'B'],
    action: '(comprovar notificacions)',
    expected: "A rep confirmació de qui ha pres el relleu; B rep l'avís separat.",
    manual: true,
  },

  // --------------------------------------------------------------- FASE 7b
  {
    id: '7b.1', phase: 7, agents: ['A'],
    action: '/newevent Proves Successio B',
    expected: 'Nou esdeveniment; A no pertany a cap actiu, així que no hi ha confirmació.',
    currentSql: "SELECT id, code FROM events WHERE admin_user_id={{A}} AND name='Proves Successio B' ORDER BY id ASC LIMIT 1",
    compare(_b, current) {
      if (!current?.length) return { done: false, detail: 'Encara no creat.' };
      const { id, code } = current[0];
      return { done: true, detail: `Event 3 = id ${id}, codi ${code}`, captured: { event3: { id, code } } };
    },
  },
  {
    id: '7b.2', phase: 7, agents: ['B', 'C', 'D'],
    action: '/join {{event3.code}}  (en aquest ordre: B, C, D — confirmant el canvi respecte Event 2)',
    expected: "S'uneixen a Event 3; Event 2 es buida del tot i acaba tancant-se com a abandoned, registrat sota D.",
    currentSql: `SELECT
        (SELECT COUNT(*) FROM participants WHERE event_id={{event3.id}} AND user_id IN ({{B}},{{C}},{{D}})) AS joined,
        (SELECT status FROM events WHERE id={{event2.id}}) AS ev2_status,
        (SELECT closed_reason FROM events WHERE id={{event2.id}}) AS ev2_reason,
        (SELECT admin_user_id FROM events WHERE id={{event2.id}}) AS ev2_admin`,
    compare(_b, current, ctx) {
      const r = current?.[0];
      if (!r) return { done: false, detail: 'Sense dades.' };
      const dId = ctx.agents.D?.user_id;
      const done = Number(r.joined) === 3 && r.ev2_status === 'closed' && r.ev2_reason === 'abandoned' && String(r.ev2_admin) === String(dId);
      return { done, detail: `B/C/D a Event3: ${r.joined}/3 · Event2: status=${r.ev2_status}, reason=${r.ev2_reason ?? 'NULL'}, admin=${r.ev2_admin} (esperat D=${dId})` };
    },
  },
  {
    id: '7b.3', phase: 7, agents: ['A'],
    action: '/troll D',
    expected: 'D marcat troll a Event 3.',
    currentSql: "SELECT status FROM event_trust WHERE event_id={{event3.id}} AND user_id={{D}}",
    compare(_b, current) { const s = current?.[0]?.status; return { done: s === 'troll', detail: s ? `event_trust(D) = ${s}` : 'Sense fila.' }; },
  },
  {
    id: '7b.4', phase: 7, agents: ['D'],
    action: '1 D  ·  2 E  ·  3 F  ·  4 2',
    expected: 'El nombre més alt de tots (4 posicions), però ha de quedar exclòs per troll.',
    currentSql: "SELECT position, value FROM passcode_reports WHERE event_id={{event3.id}} AND user_id={{D}} AND position IN (1,2,3,4)",
    compare(_b, current) {
      const EXPECTED = { 1: 'D', 2: 'E', 3: 'F', 4: '2' };
      const byPos = Object.fromEntries((current || []).map(r => [String(r.position), String(r.value).toUpperCase()]));
      const missing = Object.entries(EXPECTED).filter(([p, v]) => byPos[p] !== v).map(([p]) => p);
      return { done: missing.length === 0, detail: missing.length ? `Falten posicions: ${missing.join(', ')}` : 'Les 4 posicions de D fetes.' };
    },
  },
  {
    id: '7b.5', phase: 7, agents: ['B', 'C'],
    action: 'B: 5 3  ·  7 5     C: 8 6  ·  9 7',
    expected: 'Empat a 2 posicions cadascun; cap trusted, cap troll entre ells dos.',
    currentSql: `SELECT user_id, position, value FROM passcode_reports WHERE event_id={{event3.id}}
      AND ((user_id={{B}} AND position IN (5,7)) OR (user_id={{C}} AND position IN (8,9)))`,
    compare(_b, current, ctx) {
      const bId = String(ctx.agents.B?.user_id), cId = String(ctx.agents.C?.user_id);
      const EXPECTED = [[bId, '5', '3'], [bId, '7', '5'], [cId, '8', '6'], [cId, '9', '7']];
      const rows = (current || []).map(r => [String(r.user_id), String(r.position), String(r.value).toUpperCase()]);
      const missing = EXPECTED.filter(e => !rows.some(r => r[0] === e[0] && r[1] === e[1] && r[2] === e[2]));
      return { done: missing.length === 0, detail: `${4 - missing.length}/4 reports fets.` };
    },
  },
  {
    id: '7b.6', phase: 7, agents: ['A'],
    action: '/leave',
    expected: "A surt; empat B/C → desempat aleatori, l'administrador resultant ha de ser B o C, mai D.",
    currentSql: `SELECT
        (SELECT COUNT(*) FROM participants WHERE event_id={{event3.id}} AND user_id={{A}}) AS a_still_there,
        (SELECT admin_user_id FROM events WHERE id={{event3.id}}) AS admin`,
    compare(_b, current, ctx) {
      const r = current?.[0];
      if (!r) return { done: false, detail: 'Sense dades.' };
      const bId = String(ctx.agents.B?.user_id), cId = String(ctx.agents.C?.user_id);
      const admin = String(r.admin);
      const done = Number(r.a_still_there) === 0 && (admin === bId || admin === cId);
      return { done, detail: `A encara hi és: ${r.a_still_there} · admin actual: ${r.admin} (ha de ser B=${bId} o C=${cId})` };
    },
  },
  {
    id: '7b.7', phase: 7, agents: ['A', 'B', 'C'],
    action: '(comprovar notificacions i que el guanyador queda trusted)',
    expected: 'Igual que a /promote — el guanyador (B o C) queda notificat i trusted.',
    manual: true,
  },

  // ---------------------------------------------------------------- FASE 8
  {
    id: '8.1', phase: 8, agents: ['A'],
    action: '/newevent Proves Abandonat A',
    expected: 'Nou esdeveniment.',
    currentSql: "SELECT id, code FROM events WHERE admin_user_id={{A}} AND name='Proves Abandonat A' ORDER BY id ASC LIMIT 1",
    compare(_b, current) {
      if (!current?.length) return { done: false, detail: 'Encara no creat.' };
      const { id, code } = current[0];
      return { done: true, detail: `Event 4 = id ${id}, codi ${code}`, captured: { event4: { id, code } } };
    },
  },
  {
    id: '8.2', phase: 8, agents: ['B'],
    action: '/join {{event4.code}}  (confirmant el canvi si es demana)',
    expected: "Únic altre participant; l'efecte lateral sobre Event 3 no cal comprovar-lo.",
    currentSql: "SELECT 1 FROM participants WHERE user_id={{B}} AND event_id={{event4.id}}",
    compare(_b, current) { return { done: !!current?.length, detail: current?.length ? 'B és participant.' : 'Encara no.' }; },
  },
  {
    id: '8.3', phase: 8, agents: ['A'],
    action: '/troll B',
    expected: "Ara tots els participants que no són l'administrador estan trollejats.",
    currentSql: "SELECT status FROM event_trust WHERE event_id={{event4.id}} AND user_id={{B}}",
    compare(_b, current) { const s = current?.[0]?.status; return { done: s === 'troll', detail: s ? `event_trust(B) = ${s}` : 'Sense fila.' }; },
  },
  {
    id: '8.4', phase: 8, agents: ['A'],
    action: '/leave',
    expected: "No hi ha ningú elegible → es tanca com abandoned; no s'envia cap passcode final.",
    currentSql: "SELECT status, closed_reason FROM events WHERE id={{event4.id}}",
    compare(_b, current) {
      const r = current?.[0];
      const done = r?.status === 'closed' && r?.closed_reason === 'abandoned';
      return { done, detail: r ? `status=${r.status}, reason=${r.closed_reason ?? 'NULL'}` : 'Sense dades.' };
    },
  },
  {
    id: '8.5', phase: 8, agents: ['A'],
    action: '/newevent Proves Abandonat B',
    expected: "Nou esdeveniment, ningú més s'hi uneix.",
    currentSql: "SELECT id, code FROM events WHERE admin_user_id={{A}} AND name='Proves Abandonat B' ORDER BY id ASC LIMIT 1",
    compare(_b, current) {
      if (!current?.length) return { done: false, detail: 'Encara no creat.' };
      const { id, code } = current[0];
      return { done: true, detail: `Event 5 = id ${id}, codi ${code}`, captured: { event5: { id, code } } };
    },
  },
  {
    id: '8.6', phase: 8, agents: ['A'],
    action: '/leave',
    expected: 'Mateix resultat: es tanca com abandoned immediatament.',
    currentSql: "SELECT status, closed_reason FROM events WHERE id={{event5.id}}",
    compare(_b, current) {
      const r = current?.[0];
      const done = r?.status === 'closed' && r?.closed_reason === 'abandoned';
      return { done, detail: r ? `status=${r.status}, reason=${r.closed_reason ?? 'NULL'}` : 'Sense dades.' };
    },
  },
  {
    id: '8.7', phase: 8, agents: ['A'],
    action: '/events',
    expected: 'Ambdós esdeveniments abandonats apareixen amb status = closed.',
    currentSql: `SELECT
        (SELECT status FROM events WHERE id={{event4.id}}) AS ev4,
        (SELECT status FROM events WHERE id={{event5.id}}) AS ev5`,
    compare(_b, current) {
      const r = current?.[0];
      const done = r?.ev4 === 'closed' && r?.ev5 === 'closed';
      return { done, detail: r ? `Event4=${r.ev4}, Event5=${r.ev5}` : 'Sense dades.' };
    },
  },

  // --------------------------------------------------------------- FASE 9a
  {
    // Inline subquery so the just-created event's id can be used in the
    // same query that checks B's join, without needing it captured yet.
    id: '9a.1', phase: 9, agents: ['A', 'B'],
    action: 'A: /newevent Proves Claim Keep     B: /join <codi>',
    expected: 'Preparació. Ni A ni B pertanyien a cap esdeveniment actiu (Event 5 i Event 4 ja eren closed), així que cap confirmació es dispara.',
    currentSql: `SELECT e.id AS ev_id, e.code AS ev_code,
        (SELECT COUNT(*) FROM participants WHERE event_id=e.id AND user_id={{B}}) AS b_joined
      FROM events e WHERE e.admin_user_id={{A}} AND e.name='Proves Claim Keep' ORDER BY e.id ASC LIMIT 1`,
    compare(_b, current) {
      const r = current?.[0];
      if (!r) return { done: false, detail: 'Event 6 encara no creat.' };
      const done = Number(r.b_joined) >= 1;
      return {
        done,
        detail: `Event 6 = id ${r.ev_id}, codi ${r.ev_code} · B unit: ${r.b_joined}`,
        captured: done ? { event6: { id: r.ev_id, code: r.ev_code } } : undefined,
      };
    },
  },
  {
    id: '9a.2', phase: 9, agents: ['B'],
    action: '/claim',
    expected: "Rebutjat: l'administrador (A) encara no porta prou temps inactiu.",
    manual: true,
  },
  {
    id: '9a.3', phase: 9, agents: [],
    action: "(fora del bot) UPDATE participants SET last_active_at = datetime('now', '-31 minutes') WHERE user_id IN (SELECT admin_user_id FROM events WHERE status = 'active')",
    expected: "Simula 31 minuts d'inactivitat de l'administrador (A) sense esperar-los.",
    currentSql: "SELECT (julianday('now') - julianday(last_active_at)) * 1440 AS minutes_inactive FROM participants WHERE user_id={{A}} AND event_id={{event6.id}}",
    compare(_b, current) {
      const m = current?.[0]?.minutes_inactive;
      return { done: m != null && m >= 30, detail: m != null ? `Inactivitat d'A: ${Math.round(m)} min` : 'Sense dades.' };
    },
  },
  {
    id: '9a.4', phase: 9, agents: ['B'],
    action: '/claim',
    expected: 'S\'obre la negociació; A rep botons "Mantenir el rol" / "Cedir el rol".',
    currentSql: "SELECT 1 FROM admin_claims WHERE event_id={{event6.id}}",
    compare(_b, current) { return { done: !!current?.length, detail: current?.length ? 'Negociació oberta.' : 'Encara no.' }; },
  },
  {
    id: '9a.5', phase: 9, agents: ['A'],
    action: '(prémer "Mantenir el rol")',
    expected: 'La negociació es descarta; A segueix administrador; res canvia.',
    currentSql: "SELECT 1 FROM admin_claims WHERE event_id={{event6.id}}",
    compare(_b, current) { return { done: !current?.length, detail: current?.length ? 'Encara oberta.' : 'Negociació descartada.' }; },
  },
  {
    id: '9a.6', phase: 9, agents: ['B'],
    action: '/claim',
    expected: "Rebutjat de nou: prémer el botó és activitat real d'A, el rellotge s'ha reiniciat de debò.",
    manual: true,
  },

  // --------------------------------------------------------------- FASE 9b
  {
    id: '9b.1', phase: 9, agents: ['A', 'B', 'C'],
    action: 'A: /newevent Proves Claim Handover (confirmant respecte Event 6)     B: /join <codi> (confirmant respecte Event 6)     C: /join <codi> (confirmant respecte Event 3)',
    expected: "Preparació. Event 6 acaba tancant-se com a abandoned (sota B); Event 3 també, en marxar-ne C (sota C mateix, ja que només hi quedava D, troll).",
    currentSql: `SELECT e.id AS ev_id, e.code AS ev_code,
        (SELECT COUNT(*) FROM participants WHERE event_id=e.id AND user_id IN ({{B}},{{C}})) AS joined,
        (SELECT status FROM events WHERE id={{event6.id}}) AS ev6_status,
        (SELECT closed_reason FROM events WHERE id={{event6.id}}) AS ev6_reason,
        (SELECT status FROM events WHERE id={{event3.id}}) AS ev3_status,
        (SELECT closed_reason FROM events WHERE id={{event3.id}}) AS ev3_reason
      FROM events e WHERE e.admin_user_id={{A}} AND e.name='Proves Claim Handover' ORDER BY e.id ASC LIMIT 1`,
    compare(_b, current) {
      const r = current?.[0];
      if (!r) return { done: false, detail: 'Event 7 encara no creat.' };
      const done = Number(r.joined) === 2 && r.ev6_status === 'closed' && r.ev6_reason === 'abandoned' && r.ev3_status === 'closed' && r.ev3_reason === 'abandoned';
      return {
        done,
        detail: `Event7: id ${r.ev_id} · B+C units: ${r.joined}/2 · Event6: ${r.ev6_status}/${r.ev6_reason ?? 'NULL'} · Event3: ${r.ev3_status}/${r.ev3_reason ?? 'NULL'}`,
        captured: done ? { event7: { id: r.ev_id, code: r.ev_code } } : undefined,
      };
    },
  },
  {
    id: '9b.2', phase: 9, agents: ['B', 'C'],
    action: 'B: 1 A     C: 2 B  ·  3 C',
    expected: 'Perquè el desempat per aportacions dins del pool de /claim es pugui comprovar més endavant.',
    currentSql: `SELECT user_id, position, value FROM passcode_reports WHERE event_id={{event7.id}}
      AND ((user_id={{B}} AND position=1) OR (user_id={{C}} AND position IN (2,3)))`,
    compare(_b, current, ctx) {
      const bId = String(ctx.agents.B?.user_id), cId = String(ctx.agents.C?.user_id);
      const EXPECTED = [[bId, '1', 'A'], [cId, '2', 'B'], [cId, '3', 'C']];
      const rows = (current || []).map(r => [String(r.user_id), String(r.position), String(r.value).toUpperCase()]);
      const missing = EXPECTED.filter(e => !rows.some(r => r[0] === e[0] && r[1] === e[1] && r[2] === e[2]));
      return { done: missing.length === 0, detail: `${3 - missing.length}/3 reports fets.` };
    },
  },
  {
    id: '9b.3', phase: 9, agents: [],
    action: "(fora del bot) UPDATE last_active_at de l'administrador (A)",
    expected: 'Simula la inactivitat.',
    currentSql: "SELECT (julianday('now') - julianday(last_active_at)) * 1440 AS minutes_inactive FROM participants WHERE user_id={{A}} AND event_id={{event7.id}}",
    compare(_b, current) {
      const m = current?.[0]?.minutes_inactive;
      return { done: m != null && m >= 30, detail: m != null ? `Inactivitat d'A: ${Math.round(m)} min` : 'Sense dades.' };
    },
  },
  {
    id: '9b.4', phase: 9, agents: ['B'],
    action: '/claim',
    expected: 'Obre la negociació; A notificat.',
    currentSql: "SELECT 1 FROM admin_claims WHERE event_id={{event7.id}}",
    compare(_b, current) { return { done: !!current?.length, detail: current?.length ? 'Negociació oberta.' : 'Encara no.' }; },
  },
  {
    id: '9b.5', phase: 9, agents: ['C'],
    action: '/claim',
    expected: "S'afegeix al pool de candidats sense tornar a notificar A.",
    currentSql: "SELECT COUNT(*) AS n FROM admin_claim_candidates WHERE event_id={{event7.id}}",
    compare(_b, current) { const n = current?.[0]?.n ?? 0; return { done: n >= 2, detail: `Candidats al pool: ${n}` }; },
  },
  {
    id: '9b.6', phase: 9, agents: ['A'],
    action: '(prémer "Cedir el rol")',
    expected: "Guanya C (més aportacions, cap dels dos trusted); queda trusted i notificat; el missatge d'A s'edita.",
    currentSql: `SELECT
        (SELECT admin_user_id FROM events WHERE id={{event7.id}}) AS admin,
        (SELECT status FROM event_trust WHERE event_id={{event7.id}} AND user_id={{C}}) AS c_trust,
        (SELECT COUNT(*) FROM admin_claims WHERE event_id={{event7.id}}) AS still_open`,
    compare(_b, current, ctx) {
      const r = current?.[0];
      if (!r) return { done: false, detail: 'Sense dades.' };
      const cId = ctx.agents.C?.user_id;
      const done = String(r.admin) === String(cId) && r.c_trust === 'trusted' && Number(r.still_open) === 0;
      return { done, detail: `admin=${r.admin} (esperat C=${cId}), c_trust=${r.c_trust}, negociació oberta=${r.still_open}` };
    },
  },

  // --------------------------------------------------------------- FASE 9c
  {
    id: '9c.1', phase: 9, agents: ['A', 'B'],
    action: 'A: /newevent Proves Claim Timeout (confirmant respecte Event 7)     B: /join <codi> (confirmant respecte Event 7)',
    expected: "Preparació. Ni A ni B eren administradors d'Event 7 (C ho és); en marxar-ne tots dos, Event 7 hi queda només amb C, sense tancar-se.",
    currentSql: `SELECT e.id AS ev_id, e.code AS ev_code,
        (SELECT COUNT(*) FROM participants WHERE event_id=e.id AND user_id={{B}}) AS b_joined,
        (SELECT COUNT(*) FROM participants WHERE event_id={{event7.id}}) AS ev7_count,
        (SELECT admin_user_id FROM events WHERE id={{event7.id}}) AS ev7_admin
      FROM events e WHERE e.admin_user_id={{A}} AND e.name='Proves Claim Timeout' ORDER BY e.id ASC LIMIT 1`,
    compare(_b, current, ctx) {
      const r = current?.[0];
      if (!r) return { done: false, detail: 'Event 8 encara no creat.' };
      const cId = ctx.agents.C?.user_id;
      const done = Number(r.b_joined) >= 1 && Number(r.ev7_count) === 1 && String(r.ev7_admin) === String(cId);
      return {
        done,
        detail: `Event8: id ${r.ev_id} · B unit: ${r.b_joined} · Event7: ${r.ev7_count} participant(s), admin=${r.ev7_admin} (esperat C=${cId})`,
        captured: done ? { event8: { id: r.ev_id, code: r.ev_code } } : undefined,
      };
    },
  },
  {
    id: '9c.2', phase: 9, agents: [],
    action: "(fora del bot) UPDATE last_active_at de l'administrador (A)",
    expected: 'Simula la inactivitat.',
    currentSql: "SELECT (julianday('now') - julianday(last_active_at)) * 1440 AS minutes_inactive FROM participants WHERE user_id={{A}} AND event_id={{event8.id}}",
    compare(_b, current) {
      const m = current?.[0]?.minutes_inactive;
      return { done: m != null && m >= 30, detail: m != null ? `Inactivitat d'A: ${Math.round(m)} min` : 'Sense dades.' };
    },
  },
  {
    id: '9c.3', phase: 9, agents: ['B'],
    action: '/claim',
    expected: 'Obre negociació; A notificat; queden pendents els botons.',
    currentSql: "SELECT 1 FROM admin_claims WHERE event_id={{event8.id}}",
    compare(_b, current) { return { done: !!current?.length, detail: current?.length ? 'Negociació oberta.' : 'Encara no.' }; },
  },
  {
    id: '9c.4', phase: 9, agents: [],
    action: "(fora del bot) UPDATE admin_claims SET initiated_at = datetime('now', '-6 minutes')",
    expected: 'Simula que ja han passat els 5 minuts de marge sense esperar-los.',
    currentSql: "SELECT (julianday('now') - julianday(initiated_at)) * 1440 AS minutes_open FROM admin_claims WHERE event_id={{event8.id}}",
    compare(_b, current) {
      const m = current?.[0]?.minutes_open;
      return { done: m != null && m >= 5, detail: m != null ? `Negociació oberta fa: ${Math.round(m)} min` : 'Ja no hi ha negociació oberta.' };
    },
  },
  {
    id: '9c.5', phase: 9, agents: ['B'],
    action: '/claim',
    expected: 'Dispara la resolució pendent en favor del pool acumulat (només B); B esdevé administrador i queda trusted.',
    currentSql: `SELECT
        (SELECT admin_user_id FROM events WHERE id={{event8.id}}) AS admin,
        (SELECT status FROM event_trust WHERE event_id={{event8.id}} AND user_id={{B}}) AS b_trust,
        (SELECT COUNT(*) FROM admin_claims WHERE event_id={{event8.id}}) AS still_open`,
    compare(_b, current, ctx) {
      const r = current?.[0];
      if (!r) return { done: false, detail: 'Sense dades.' };
      const bId = ctx.agents.B?.user_id;
      const done = String(r.admin) === String(bId) && r.b_trust === 'trusted' && Number(r.still_open) === 0;
      return { done, detail: `admin=${r.admin} (esperat B=${bId}), b_trust=${r.b_trust}, negociació oberta=${r.still_open}` };
    },
  },
  {
    id: '9c.6', phase: 9, agents: ['A'],
    action: '(prémer "Mantenir el rol" del missatge original, ara obsolet)',
    expected: 'Ha de trobar que la negociació ja no existeix i informar-ho amb gràcia.',
    manual: true,
  },

  // --------------------------------------------------------------- FASE 10
  {
    id: '10.1', phase: 10, agents: ['A'],
    action: '/join {{event1.code}}  (confirmant el canvi respecte Event 8 i que reviurà Event 1)',
    expected: "Event 1 (abandoned des de la Fase 7a.2) es reobre; A en torna a ser l'administrador, trusted.",
    currentSql: "SELECT status, closed_reason, admin_user_id FROM events WHERE id={{event1.id}}",
    compare(_b, current, ctx) {
      const row = current?.[0];
      if (!row) return { done: false, detail: 'Sense dades.' };
      const aId = ctx.agents.A?.user_id;
      const done = row.status === 'active' && row.closed_reason === null && String(row.admin_user_id) === String(aId);
      return { done, detail: `Event 1: status=${row.status}, closed_reason=${row.closed_reason ?? 'NULL'}, admin=${row.admin_user_id}` };
    },
  },
  {
    id: '10.2', phase: 10, agents: ['A'],
    action: '/verify <passcode que NO coincideixi amb cap combinació>',
    expected: "Cap combinació coincideix; el bot ho informa i no resol ni tanca res.",
    manual: true,
  },
  {
    id: '10.3', phase: 10, agents: ['A'],
    action: '(fora del bot) recopilar una combinació vàlida completa',
    expected: 'Preparació manual, com faria un jugador real.',
    manual: true,
  },
  {
    id: '10.4', phase: 10, agents: ['A'],
    action: '/verify <passcode construït al pas anterior>',
    expected: "Coincideix amb exactament una combinació: resol totes les posicions i tanca l'esdeveniment com completed.",
    currentSql: `SELECT
        (SELECT status FROM events WHERE id={{event1.id}}) AS status,
        (SELECT COUNT(*) FROM passcode_resolutions WHERE event_id={{event1.id}}) AS resolved`,
    compare(_b, current) {
      const r = current?.[0];
      const done = r?.status === 'completed' && Number(r?.resolved) === 11;
      return { done, detail: r ? `status=${r.status}, posicions resoltes=${r.resolved}/11` : 'Sense dades.' };
    },
  },
  {
    id: '10.5', phase: 10, agents: ['A'],
    action: '/status',
    expected: "Reflecteix que l'esdeveniment ja no és actiu.",
    manual: true,
  },
  {
    id: '10.6', phase: 10, agents: ['A'],
    action: '(comprovar el missatge nou del passcode final)',
    expected: "És l'únic participant d'Event 1 en aquest punt — B, C i D se'n van anar a la Fase 7a.2 i mai hi han tornat.",
    manual: true,
  },

  // --------------------------------------------------------------- FASE 11
  {
    id: '11.1', phase: 11, agents: ['A'],
    action: '/newevent Proves Patró Invertit | 999XX*XXX99',
    expected: 'Nou esdeveniment (patró invertit).',
    currentSql: "SELECT id, code FROM events WHERE admin_user_id={{A}} AND name='Proves Patró Invertit' AND pattern='999XX*XXX99' ORDER BY id ASC LIMIT 1",
    compare(_b, current) {
      if (!current?.length) return { done: false, detail: 'Encara no creat.' };
      const { id, code } = current[0];
      return { done: true, detail: `Event 9 = id ${id}, codi ${code}`, captured: { event9: { id, code } } };
    },
  },
  {
    id: '11.2', phase: 11, agents: ['B'],
    action: '/join {{event9.code}}  (confirmant el canvi respecte Event 8)',
    expected: "S'uneix a Event 9; Event 8 hi queda sense ningú i es tanca com a abandoned, sota B.",
    currentSql: `SELECT
        (SELECT 1 FROM participants WHERE event_id={{event9.id}} AND user_id={{B}}) AS joined,
        (SELECT status FROM events WHERE id={{event8.id}}) AS ev8_status,
        (SELECT closed_reason FROM events WHERE id={{event8.id}}) AS ev8_reason,
        (SELECT admin_user_id FROM events WHERE id={{event8.id}}) AS ev8_admin`,
    compare(_b, current, ctx) {
      const r = current?.[0];
      if (!r) return { done: false, detail: 'Sense dades.' };
      const bId = ctx.agents.B?.user_id;
      const done = !!r.joined && r.ev8_status === 'closed' && r.ev8_reason === 'abandoned' && String(r.ev8_admin) === String(bId);
      return { done, detail: `B unit a Event9: ${!!r.joined} · Event8: ${r.ev8_status}/${r.ev8_reason ?? 'NULL'}, admin=${r.ev8_admin}` };
    },
  },
  {
    id: '11.3', phase: 11, agents: ['A'],
    action: '1 X  (confirmar amb Sí)',
    expected: 'Es dispara la confirmació Sí/No pel tipus (posició 1 espera un dígit).',
    currentSql: "SELECT value FROM passcode_reports WHERE event_id={{event9.id}} AND user_id={{A}} AND position=1 ORDER BY id DESC LIMIT 1",
    compare(_b, current) { const v = current?.[0]?.value; return { done: v === 'X', detail: v ? `A a pos.1: ${v}` : 'Sense report.' }; },
  },
  {
    id: '11.4', phase: 11, agents: ['A'],
    action: '1 5 · 2 1 · 3 2 · 4 A · 5 B · 6 ALPHA · 7 C · 8 D · 9 E · 10 9 · 11 8',
    expected: "Preparació per a l'estrès de variants (la 1 substitueix l'X anterior per autocorrecció).",
    currentSql: "SELECT position, value FROM passcode_reports WHERE event_id={{event9.id}} AND user_id={{A}} AND position BETWEEN 1 AND 11",
    compare(_b, current) {
      const EXPECTED = { 1: '5', 2: '1', 3: '2', 4: 'A', 5: 'B', 6: 'ALPHA', 7: 'C', 8: 'D', 9: 'E', 10: '9', 11: '8' };
      const byPos = Object.fromEntries((current || []).map(r => [String(r.position), String(r.value).toUpperCase()]));
      const missing = Object.entries(EXPECTED).filter(([p, v]) => byPos[p] !== v).map(([p]) => p);
      return { done: missing.length === 0, detail: missing.length ? `Falten o incorrectes: ${missing.join(', ')}` : "Les 11 posicions d'A fetes." };
    },
  },
  {
    id: '11.5', phase: 11, agents: ['B'],
    action: '1 7 · 2 3 · 3 4 · 4 X · 5 Y',
    expected: '5 posicions amb 2 candidats cadascuna = 32 combinacions, per sobre del límit de renderització (16).',
    currentSql: "SELECT position, value FROM passcode_reports WHERE event_id={{event9.id}} AND user_id={{B}} AND position BETWEEN 1 AND 5",
    compare(_b, current) {
      const EXPECTED = { 1: '7', 2: '3', 3: '4', 4: 'X', 5: 'Y' };
      const byPos = Object.fromEntries((current || []).map(r => [String(r.position), String(r.value).toUpperCase()]));
      const missing = Object.entries(EXPECTED).filter(([p, v]) => byPos[p] !== v).map(([p]) => p);
      return { done: missing.length === 0, detail: missing.length ? `Falten o incorrectes: ${missing.join(', ')}` : 'Les 5 posicions de B fetes.' };
    },
  },
  {
    id: '11.6', phase: 11, agents: ['A'],
    action: '/status',
    expected: 'Mostra un resum en comptes de llistar les 32 combinacions.',
    manual: true,
  },
  {
    id: '11.7', phase: 11, agents: ['B'],
    action: '6 BETA · 7 F · 8 G · 9 H · 10 0 · 11 1',
    expected: 'Ara les 11 posicions tenen 2 candidats cadascuna = 2048 combinacions, per sobre del límit de seguretat (2000).',
    currentSql: "SELECT position, value FROM passcode_reports WHERE event_id={{event9.id}} AND user_id={{B}} AND position BETWEEN 6 AND 11",
    compare(_b, current) {
      const EXPECTED = { 6: 'BETA', 7: 'F', 8: 'G', 9: 'H', 10: '0', 11: '1' };
      const byPos = Object.fromEntries((current || []).map(r => [String(r.position), String(r.value).toUpperCase()]));
      const missing = Object.entries(EXPECTED).filter(([p, v]) => byPos[p] !== v).map(([p]) => p);
      return { done: missing.length === 0, detail: missing.length ? `Falten o incorrectes: ${missing.join(', ')}` : 'Les 6 posicions restants de B fetes.' };
    },
  },
  {
    id: '11.8', phase: 11, agents: ['A'],
    action: '/verify 512ABALPHACDE98',
    expected: 'El bot demana resoldre posicions manualment abans, en lloc de comparar amb el límit superat.',
    manual: true,
  },
  {
    id: '11.9', phase: 11, agents: ['A'],
    action: '/resolve  (sense arguments, diverses vegades fins reduir prou el nombre de posicions en conflicte)',
    expected: "Un cop per sota del límit, /status torna a mostrar combinacions i /verify torna a poder-se intentar.",
    manual: true,
  },

  // --------------------------------------------------------------- FASE 12
  {
    // /events now lists every event a participant has EVER been part
    // of (participants + participant_history, deduplicated by
    // event_id), not who currently administers what — see CLAUDE.md
    // "Data model" (participant_history) and the Fase 12 intro. Counts
    // below are the full trail derived from every /join, /newevent and
    // /leave each agent runs across this whole plan.
    id: '12.1', phase: 12, agents: ['A'],
    action: '/events',
    expected: '10 esdeveniments: Event 1, 1b, 2-8 com a passats, Event 9 com a actual.',
    currentSql: `SELECT COUNT(DISTINCT event_id) AS n FROM (
        SELECT event_id FROM participants WHERE user_id={{A}}
        UNION SELECT event_id FROM participant_history WHERE user_id={{A}}
      )`,
    compare(_b, current) {
      const n = current?.[0]?.n ?? 0;
      return { done: n === 10, detail: `Esdeveniments en què A ha participat: ${n}/10` };
    },
  },
  {
    id: '12.2', phase: 12, agents: ['B'],
    action: '/events',
    expected: '8 esdeveniments: Event 1, 2, 3, 4, 6, 7, 8 com a passats, Event 9 com a actual.',
    currentSql: `SELECT COUNT(DISTINCT event_id) AS n FROM (
        SELECT event_id FROM participants WHERE user_id={{B}}
        UNION SELECT event_id FROM participant_history WHERE user_id={{B}}
      )`,
    compare(_b, current) {
      const n = current?.[0]?.n ?? 0;
      return { done: n === 8, detail: `Esdeveniments en què B ha participat: ${n}/8` };
    },
  },
  {
    id: '12.3', phase: 12, agents: ['C'],
    action: '/events',
    expected: '4 esdeveniments: Event 1, 2, 3 com a passats, Event 7 com a actual.',
    currentSql: `SELECT COUNT(DISTINCT event_id) AS n FROM (
        SELECT event_id FROM participants WHERE user_id={{C}}
        UNION SELECT event_id FROM participant_history WHERE user_id={{C}}
      )`,
    compare(_b, current) {
      const n = current?.[0]?.n ?? 0;
      return { done: n === 4, detail: `Esdeveniments en què C ha participat: ${n}/4` };
    },
  },
  {
    id: '12.4', phase: 12, agents: ['D'],
    action: '/events',
    expected: '3 esdeveniments: Event 1, 2 com a passats, Event 3 com a actual.',
    currentSql: `SELECT COUNT(DISTINCT event_id) AS n FROM (
        SELECT event_id FROM participants WHERE user_id={{D}}
        UNION SELECT event_id FROM participant_history WHERE user_id={{D}}
      )`,
    compare(_b, current) {
      const n = current?.[0]?.n ?? 0;
      return { done: n === 3, detail: `Esdeveniments en què D ha participat: ${n}/3` };
    },
  },
];
