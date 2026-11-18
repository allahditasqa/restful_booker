// Writes the module-wise reports of ONE run. Used by the Playwright reporter, the Cypress report script and the
// restful_booker reporter, so all three repositories produce exactly the same files:
//
//   reports/index.html                                                history of all runs, newest on top
//   reports/history.json                                              data behind the index
//   reports/<module-slug>/<Module Name> test <DD-MM-YYYY>_<HH-mm-ss>.html        self-contained HTML report
//   reports/<module-slug>/<Module Name> test cases <DD-MM-YYYY>_<HH-mm-ss>.csv   cases + real result of this run
//
// The date and time are part of the name, so an old report is never overwritten.
const fs = require('fs');
const path = require('path');
const { loadCases, toCsv, slugify, two } = require('./test-cases');

const RUN_CSV_HEADER = [
  'Test Case ID', 'Module', 'Sub-module', 'Test Case Title', 'Priority', 'Test Type', 'Preconditions', 'Test Steps',
  'Test Data', 'Expected Result', 'Actual Result', 'Execution Status', 'Execution Type', 'Automation Method',
  'Requirement', 'Duration (s)', 'Executed On', 'Browser', 'Environment (URL)',
];

/* eslint-disable no-control-regex */
const esc = (s) =>
  String(s ?? '')
    .replace(/\u001b\[[0-9;]*m/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
const plain = (s) => String(s ?? '').replace(/\u001b\[[0-9;]*m/g, '');
/* eslint-enable no-control-regex */

const STYLE = `
:root{--bg:#f6f7f9;--fg:#1c1f24;--card:#fff;--line:#dde1e6;--pass:#1a7f37;--fail:#cf222e;--skip:#8a6d00;--known:#9a4f00;--mute:#6b7380}
@media(prefers-color-scheme:dark){:root{--bg:#14161a;--fg:#e6e8eb;--card:#1d2026;--line:#2e333b;--pass:#3fb950;--fail:#ff7b72;--skip:#d4a72c;--known:#f0883e;--mute:#9aa3b0}}
body{margin:0;padding:24px 16px;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,Segoe UI,sans-serif}
main{max-width:1100px;margin:auto}h1{margin:0 0 4px}h2{margin:28px 0 8px}.meta{color:var(--mute);font-size:13px}a{color:inherit}
.sum{display:flex;gap:12px;flex-wrap:wrap;margin:16px 0}.sum div{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:10px 16px}
.sum b{font-size:22px;display:block}.card{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--line);border-radius:8px;padding:12px 16px;margin:12px 0}
.card.passed{border-left-color:var(--pass)}.card.failed{border-left-color:var(--fail)}.card.skipped{border-left-color:var(--skip)}.card.known{border-left-color:var(--known)}
.head{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}.badge{font-size:12px;text-transform:uppercase;padding:2px 8px;border-radius:99px;border:1px solid currentColor}
.badge.passed{color:var(--pass)}.badge.failed{color:var(--fail)}.badge.skipped{color:var(--skip)}.badge.known{color:var(--known)}
pre{background:var(--bg);padding:10px;border-radius:6px;overflow:auto;white-space:pre-wrap;color:var(--fail)}
.shots{display:flex;gap:12px;flex-wrap:wrap;margin-top:10px}figure{margin:0}img{max-width:300px;border:1px solid var(--line);border-radius:6px;cursor:zoom-in}
img.big{max-width:100%;cursor:zoom-out}figcaption{font-size:12px;color:var(--mute)}
table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line)}th,td{text-align:left;padding:8px 12px;border-bottom:1px solid var(--line);vertical-align:top}
details{margin-top:6px}details table th{width:150px;white-space:nowrap}
.passed-t{color:var(--pass)}.failed-t{color:var(--fail)}.skipped-t{color:var(--skip)}.known-t{color:var(--known)}
`;

const stamp = (d) =>
  `${two(d.getDate())}-${two(d.getMonth() + 1)}-${d.getFullYear()}_${two(d.getHours())}-${two(d.getMinutes())}-${two(d.getSeconds())}`;

const label = (r) => (r.known ? 'known defect' : r.status);
const cls = (r) => (r.known ? 'known' : r.status);
const CSV_STATUS = { passed: 'Pass', failed: 'Fail', skipped: 'Skip' };

function actualResult(r) {
  if (r.known) return `Known defect: ${r.note || 'the API behaves differently from its documentation'} (see DEFECTS.md)`;
  if (r.status === 'passed') return 'As expected (all assertions passed)';
  if (r.status === 'skipped') return 'Skipped (not executed in this run)';
  return plain(r.error).split('\n').filter(Boolean).slice(0, 6).join(' | ').slice(0, 600) || 'Failed';
}

/**
 * run = {
 *   reportsDir, startedAt: Date, durationSec, tool: 'Playwright', browser, url,
 *   results: [{ id, title, status: 'passed'|'failed'|'skipped', known?: boolean, note?, duration (ms), retry?, error?, shots?: [{name, src}], suite? }]
 * }
 * Returns { files: [...], index }
 */
function writeRun(run) {
  const cases = loadCases();
  const reportsDir = path.resolve(run.reportsDir);

  // group the results by module (taken from the document of each case)
  const modules = new Map();
  for (const r of run.results) {
    const c = cases.get(r.id) ?? {};
    const name = c.module ?? 'Other';
    if (!modules.has(name)) modules.set(name, { name, slug: slugify(name), rows: [] });
    modules.get(name).rows.push({ ...r, c });
  }

  // An old report is never overwritten: when a file of this second already exists, move to the next second.
  let d = new Date(run.startedAt);
  const taken = (when) =>
    [...modules.values()].some((m) => fs.existsSync(path.join(reportsDir, m.slug, `${m.name} test ${stamp(when)}.html`)));
  while (taken(d)) d = new Date(d.getTime() + 1000);
  const time = stamp(d);
  const date = `${two(d.getDate())}-${two(d.getMonth() + 1)}-${d.getFullYear()}`;
  const clock = `${two(d.getHours())}:${two(d.getMinutes())}:${two(d.getSeconds())}`;

  const written = [];
  const entries = [];
  for (const m of [...modules.values()].sort((a, b) => a.name.localeCompare(b.name))) {
    m.rows.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
    const count = (pick) => m.rows.filter(pick).length;
    const total = m.rows.length;
    const known = count((r) => r.known);
    const passed = count((r) => r.status === 'passed' && !r.known);
    const failed = count((r) => r.status === 'failed');
    const skipped = count((r) => r.status === 'skipped');
    const secs = m.rows.reduce((n, r) => n + r.duration, 0) / 1000;
    const base = `${m.name} test ${time}`;
    const htmlRel = `${m.slug}/${base}.html`;
    const csvRel = `${m.slug}/${m.name} test cases ${time}.csv`;
    fs.mkdirSync(path.join(reportsDir, m.slug), { recursive: true });

    fs.writeFileSync(
      path.join(reportsDir, htmlRel),
      renderModule(m, { total, passed, failed, skipped, known }, { date, clock, run, secs }),
      'utf8',
    );
    const csvRows = m.rows.map((r) => [
      r.id, m.name, r.c.sub ?? '', r.c.title ?? r.title.replace(/^TC_[A-Z0-9_.]+\s*-\s*/, ''), r.c.priority ?? '', r.c.type ?? '',
      r.c.pre ?? '', r.c.steps ?? '', r.c.data ?? '', r.c.expected ?? '', actualResult(r),
      r.known ? 'Known Defect' : CSV_STATUS[r.status] ?? r.status, 'Automated', r.c.spec ?? '', r.c.requirement ?? '',
      (r.duration / 1000).toFixed(1), `${date} ${clock}`, run.browser ?? '', run.url ?? '',
    ]);
    fs.writeFileSync(path.join(reportsDir, csvRel), toCsv(RUN_CSV_HEADER, csvRows), 'utf8');
    written.push(path.join(reportsDir, htmlRel), path.join(reportsDir, csvRel));
    entries.push({
      Module: m.name, ReportPath: htmlRel, CsvPath: csvRel, Total: total, Passed: passed, Failed: failed,
      Skipped: skipped, KnownDefects: known,
      Results: Object.fromEntries(m.rows.map((r) => [r.id, r.known ? 'known' : r.status])), DurationSeconds: Math.round(secs * 10) / 10,
    });
  }

  const historyFile = path.join(reportsDir, 'history.json');
  let history = [];
  try {
    history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
  } catch {
    /* first run */
  }
  history.push({
    RunId: `${d.getFullYear()}${two(d.getMonth() + 1)}${two(d.getDate())}-${two(d.getHours())}${two(d.getMinutes())}${two(d.getSeconds())}`,
    StartedAt: d.toISOString(),
    Tool: run.tool,
    Browser: run.browser ?? '',
    Environment: run.url ?? '',
    DurationSeconds: run.durationSec,
    Modules: entries,
  });
  history.sort((a, b) => b.RunId.localeCompare(a.RunId)); // newest first
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2), 'utf8');
  const index = writeIndex(reportsDir, history, run.tool);
  return { files: written, index };
}

function renderModule(m, n, ctx) {
  const cards = m.rows
    .map((r) => {
      const images = (r.shots ?? [])
        .map(
          (s) =>
            `<figure><img src="${s.src}" alt="${esc(s.name)}" onclick="this.classList.toggle('big')"><figcaption>${esc(s.name)}</figcaption></figure>`,
        )
        .join('');
      const c = r.c;
      const details = c.steps
        ? `<details><summary class="meta">Test case details</summary><table>
<tr><th>Module / Sub-module</th><td>${esc(c.module)} / ${esc(c.sub)}</td></tr>
<tr><th>Preconditions</th><td>${esc(c.pre)}</td></tr>
<tr><th>Test steps</th><td>${esc(c.steps).replace(/\s(\d+\.)\s/g, '<br>$1 ')}</td></tr>
<tr><th>Test data</th><td>${esc(c.data)}</td></tr>
<tr><th>Expected result</th><td>${esc(c.expected)}</td></tr>
<tr><th>Requirement</th><td>${esc(c.requirement)}</td></tr>
<tr><th>Spec file</th><td>${esc(c.spec)}</td></tr></table></details>`
        : '';
      return `<section class="card ${cls(r)}">
<div class="head"><span class="badge ${cls(r)}">${esc(label(r))}</span><b>${esc(r.title)}</b>
<span class="meta">${esc(c.group ?? r.suite ?? '')} · ${(r.duration / 1000).toFixed(1)}s${r.retry ? ` · retry #${r.retry}` : ''}</span></div>
<div class="meta">${esc(c.priority ?? '')} · ${esc(c.type ?? '')}</div>
${details}
<p><b>Actual result:</b> ${esc(actualResult(r))}</p>
${r.status === 'failed' && !r.known && r.error ? `<pre>${esc(r.error)}</pre>` : ''}
${images ? `<div class="shots">${images}</div>` : ''}
</section>`;
    })
    .join('\n');
  const overall = n.failed ? 'failed' : 'passed';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(m.name)} Test Report ${esc(ctx.date)} ${esc(ctx.clock)}</title><style>${STYLE}</style></head><body><main>
<p class="meta"><a href="../index.html">&larr; All reports</a></p>
<h1>${esc(m.name)}</h1>
<div class="meta">Run: ${esc(ctx.date)} ${esc(ctx.clock)} · ${esc(ctx.run.tool)} · ${esc(ctx.run.browser ?? '')} · ${esc(ctx.run.url ?? '')} · module time ${ctx.secs.toFixed(0)}s · overall: ${overall} · click a screenshot to enlarge</div>
<div class="sum"><div><b>${n.total}</b>total</div><div><b class="passed-t">${n.passed}</b>passed</div><div><b class="failed-t">${n.failed}</b>failed</div><div><b class="skipped-t">${n.skipped}</b>skipped</div><div><b class="known-t">${n.known}</b>known defects</div></div>
${cards}
</main></body></html>`;
}

function writeIndex(reportsDir, history, tool) {
  let body = '';
  for (const run of history) {
    const sum = (k) => run.Modules.reduce((n, e) => n + (e[k] ?? 0), 0);
    const [datePart, timePart] = [run.RunId.slice(0, 8), run.RunId.slice(9)];
    const when = `${datePart.slice(6, 8)}-${datePart.slice(4, 6)}-${datePart.slice(0, 4)}  •  ${timePart.slice(0, 2)}:${timePart.slice(2, 4)}:${timePart.slice(4, 6)}`;
    const rows = run.Modules.map(
      (e) => `<tr><td>${esc(e.Module)}</td><td>${e.Total}</td><td class="passed-t">${e.Passed}</td><td class="${e.Failed ? 'failed-t' : ''}">${e.Failed}</td><td class="skipped-t">${e.Skipped}</td><td class="known-t">${e.KnownDefects ?? 0}</td><td class="${e.Failed ? 'failed-t' : 'passed-t'}">${e.Failed ? 'Failed' : 'Passed'}</td><td><a href="${esc(encodeURI(e.ReportPath))}">HTML</a></td><td><a href="${esc(encodeURI(e.CsvPath))}">CSV</a></td></tr>`,
    ).join('');
    body += `<h2>${esc(when)} <span class="meta">&nbsp;total ${sum('Total')} · <span class="passed-t">${sum('Passed')} pass</span> · <span class="${sum('Failed') ? 'failed-t' : ''}">${sum('Failed')} fail</span> · <span class="skipped-t">${sum('Skipped')} skip</span> · <span class="known-t">${sum('KnownDefects')} known defect</span> · ${Math.round(run.DurationSeconds)}s · ${esc(run.Browser)}</span></h2>
<table><thead><tr><th>Module</th><th>Total</th><th>Pass</th><th>Fail</th><th>Skip</th><th>Known defect</th><th>Result</th><th>Report</th><th>Test cases</th></tr></thead><tbody>${rows}</tbody></table>`;
  }
  const file = path.join(reportsDir, 'index.html');
  fs.writeFileSync(
    file,
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(tool)} - Test Reports</title><style>${STYLE}</style></head><body><main><h1>${esc(tool)} - Test Reports</h1><div class="meta">History: newest run on top. Under each date-time you see the module-wise reports. Old runs are never overwritten or deleted.</div>${body}</main></body></html>`,
    'utf8',
  );
  return file;
}

module.exports = { writeRun, RUN_CSV_HEADER };
