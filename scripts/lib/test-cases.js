// Test case tooling shared by the report writer, the CLI (scripts/export-test-cases.js) and the reporters.
//
// The documents in docs/test-cases/*.md are the single source of truth. Each document has
//   - a header line:  **Module:** Auth | **Sub-module:** Login | **Spec:** `tests/auth/login.spec.ts`
//   - test case tables with the columns   ID | Title | Priority | Preconditions | Steps | Expected result
//   - one "## Traceability" table with    ID | Type | Test data | Automation | Spec file | Requirement
// From them this file builds the master CSV (regression list) and checks that every documented case has a test.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DOCS = path.join(ROOT, 'docs', 'test-cases');
// Where the automation code lives and how a spec file is recognised (edit these two lines per repository).
const SPEC_DIRS = ['tests'];
const SPEC_FILE = /\.spec\.ts$/;

const MASTER_HEADER = [
  'Test Case ID', 'Module', 'Sub-module', 'Group', 'Title', 'Priority', 'Test Type', 'Preconditions', 'Test Steps',
  'Test Data', 'Expected Result', 'Automation Status', 'Spec File', 'Requirement', 'Regression', 'Last Updated',
];

const quote = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const clean = (v) => v.trim().replace(/`/g, '').replace(/<br\s*\/?>/gi, ' ');
const byId = (a, b) => a.localeCompare(b, undefined, { numeric: true });
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const two = (n) => String(n).padStart(2, '0');
const today = () => {
  const d = new Date();
  return `${two(d.getDate())}-${two(d.getMonth() + 1)}-${d.getFullYear()}`;
};

/** Splits "| a | b | c |" into trimmed cells (an escaped pipe \| stays inside the cell). */
function cells(line) {
  const body = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return body.split(/(?<!\\)\|/).map((c) => clean(c.replace(/\\\|/g, '|')));
}

/** Reads every document: [{ base, module, slug, sub, spec, rows: [case] }]. */
function listDocs() {
  const out = [];
  if (!fs.existsSync(DOCS)) return out;
  for (const file of fs.readdirSync(DOCS).filter((f) => f.endsWith('.md')).sort()) {
    const text = fs.readFileSync(path.join(DOCS, file), 'utf8');
    const head = text.match(/\*\*Module:\*\*\s*([^|\n]+?)\s*\|\s*\*\*Sub-module:\*\*\s*([^|\n]+?)\s*\|\s*\*\*Spec:\*\*\s*`([^`]+)`/);
    if (!head) continue;
    const [, module, sub, spec] = head;
    const rows = new Map();
    const trace = new Map();
    let group = '';
    let inTrace = false;
    for (const line of text.split(/\r?\n/)) {
      const heading = line.match(/^##\s+(?:[A-Z]\.\s*)?(.*)$/);
      if (heading) {
        group = heading[1].trim();
        inTrace = /^traceability/i.test(group);
        continue;
      }
      const row = line.match(/^\|\s*(TC_[A-Z0-9_.]+)\s*\|/);
      if (!row) continue;
      const c = cells(line);
      if (inTrace) {
        if (c.length === 6) trace.set(c[0], { type: c[1], data: c[2], automation: c[3], spec: c[4], requirement: c[5] });
      } else if (c.length === 6) {
        rows.set(c[0], { id: c[0], group, title: c[1], priority: c[2], pre: c[3], steps: c[4], expected: c[5] });
      }
    }
    const merged = [...rows.values()].map((r) => {
      const t = trace.get(r.id) ?? { type: '', data: '', automation: '', spec: '', requirement: '' };
      return { ...r, module: module.trim(), slug: slugify(module), sub: sub.trim(), ...t, spec: t.spec || spec };
    });
    out.push({
      base: path.basename(file, '.md'), module: module.trim(), slug: slugify(module), sub: sub.trim(), spec,
      rows: merged, traceIds: [...trace.keys()],
    });
  }
  return out;
}

/** All documented cases as a Map: id -> case. */
function loadCases() {
  const map = new Map();
  for (const d of listDocs()) for (const r of d.rows) map.set(r.id, r);
  return map;
}

function toCsv(header, rows) {
  // UTF-8 BOM so Excel opens the file with the right encoding
  return '﻿' + [header, ...rows].map((r) => r.map(quote).join(',')).join('\r\n') + '\r\n';
}

// ---------- master CSV ----------

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const s = text.replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"' && s[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const masterPath = (base) => path.join(DOCS, `${base}.csv`);
const masterRow = (r) => [
  r.id, r.module, r.sub, r.group, r.title, r.priority, r.type, r.pre, r.steps, r.data, r.expected,
  r.automation, r.spec, r.requirement, 'Yes',
];

function readMaster(base) {
  const file = masterPath(base);
  if (!fs.existsSync(file)) return new Map();
  const [, ...rows] = parseCsv(fs.readFileSync(file, 'utf8'));
  return new Map(rows.map((r) => [r[0], r]));
}

function exportMaster() {
  const summary = [];
  for (const d of listDocs()) {
    const old = readMaster(d.base);
    let added = 0;
    let changed = 0;
    const rows = d.rows
      .slice()
      .sort((a, b) => byId(a.id, b.id))
      .map((r) => {
        const expected = masterRow(r);
        const previous = old.get(r.id);
        if (!previous) {
          added++;
          return [...expected, today()];
        }
        const same = expected.every((value, i) => value === previous[i]);
        if (!same) changed++;
        return [...expected, same ? previous[15] || today() : today()];
      });
    const removed = [...old.keys()].filter((id) => !d.rows.some((r) => r.id === id)).length;
    fs.writeFileSync(masterPath(d.base), toCsv(MASTER_HEADER, rows), 'utf8');
    summary.push({ file: `${d.base}.csv`, total: rows.length, added, changed, removed });
  }
  return summary;
}

/** Names of master CSV files that no longer match their document (empty = all fine). */
function checkMaster() {
  const stale = [];
  for (const d of listDocs()) {
    const old = readMaster(d.base);
    const same =
      old.size === d.rows.length &&
      d.rows.every((r) => {
        const previous = old.get(r.id);
        return previous && masterRow(r).every((value, i) => value === previous[i]);
      });
    if (!same) stale.push(`${d.base}.csv`);
  }
  return stale;
}

// ---------- traceability: document <-> code, 1:1 ----------

function traceability() {
  const found = new Map(); // id -> [{ file, title }]
  const prefixes = []; // data-driven titles such as TC_X_16.${i + 1}
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'setup' && entry.name !== 'node_modules') walk(file);
        continue;
      }
      if (!SPEC_FILE.test(entry.name)) continue;
      const rel = path.relative(ROOT, file).split(path.sep).join('/');
      const source = fs.readFileSync(file, 'utf8');
      // matches test('TC_X_01 - ...'  it("TC_X_01 - ..."  and titles that prettier wrapped onto the next line
      const re = /\b(?:test|it)(?:\.\w+)?\(\s*(?:`([^`]*)`|'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g;
      for (const m of source.matchAll(re)) {
        const title = (m[1] ?? m[2] ?? m[3]).replace(/\\(['"`])/g, '$1');
        const id = title.match(/^(TC_[A-Z0-9]+_\d+(?:\.\d+|\.\$\{[^}]*\})?)/)?.[1];
        if (!id) continue;
        if (id.includes('${')) prefixes.push(id.split('${')[0]);
        else found.set(id, [...(found.get(id) ?? []), { file: rel, title }]);
      }
    }
  };
  for (const d of SPEC_DIRS) walk(path.join(ROOT, d));

  const docs = listDocs();
  const documented = new Map();
  for (const d of docs) for (const r of d.rows) documented.set(r.id, r);
  const inCode = (id) => found.has(id) || prefixes.some((p) => id.startsWith(p));
  const wrongSpec = [];
  const titleDiff = [];
  for (const [id, r] of documented) {
    const hits = found.get(id);
    if (!hits) continue;
    if (!hits.some((h) => h.file === r.spec)) wrongSpec.push(`${id} (doc says ${r.spec}, code is in ${hits[0].file})`);
    if (!hits.some((h) => h.title === `${id} - ${r.title}`)) titleDiff.push(id);
  }
  return {
    count: documented.size,
    missingInCode: [...documented.keys()].filter((id) => !inCode(id)),
    undocumented: [...found.keys()].filter((id) => !documented.has(id)),
    duplicates: [...found.entries()].filter(([, hits]) => hits.length > 1).map(([id]) => id),
    noTraceRow: docs.flatMap((d) => d.rows.filter((r) => !r.type || !d.traceIds.includes(r.id)).map((r) => r.id)),
    docDuplicates: [...documented.keys()].length === docs.reduce((n, d) => n + d.rows.length, 0) ? [] : ['(an ID is used in two documents)'],
    wrongSpec,
    titleDiff,
  };
}

module.exports = {
  ROOT, DOCS, MASTER_HEADER, quote, toCsv, parseCsv, slugify, two, listDocs, loadCases, exportMaster, checkMaster, traceability,
};
