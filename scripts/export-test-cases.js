// CLI for the test case documents (docs/test-cases/*.md are the source of truth, never edit the CSV by hand).
//   npm run cases:csv     rebuild the master CSV files (rows that did not change keep their "Last Updated" date)
//   npm run cases:check   fail when documents, master CSV and automation code do not agree (used by CI)
const { exportMaster, checkMaster, traceability } = require('./lib/test-cases');

if (process.argv.includes('--check')) {
  let failed = false;
  const problem = (list, message) => {
    if (list.length) {
      console.log(`ERROR ${message}: ${list.join(', ')}`);
      failed = true;
    }
  };
  const stale = checkMaster();
  problem(stale, 'master CSV is out of date, run "npm run cases:csv"');
  const t = traceability();
  problem(t.missingInCode, 'documented but no test in code');
  problem(t.undocumented, 'test in code but not documented');
  problem(t.duplicates, 'duplicate test IDs in code');
  problem(t.docDuplicates, 'duplicate IDs in the documents');
  problem(t.noTraceRow, 'no row (or no Type) in the Traceability table');
  problem(t.wrongSpec, 'the Spec in the document is not the file that holds the test');
  problem(t.titleDiff, 'title in code differs from the title in the document');
  if (!failed) console.log(`OK    ${t.count} documented test cases = ${t.count} tests in code (IDs and titles match 1:1), master CSV is current.`);
  process.exit(failed ? 1 : 0);
} else {
  for (const s of exportMaster()) {
    console.log(`${s.file}: ${s.total} cases (new ${s.added}, changed ${s.changed}, removed ${s.removed})`);
  }
}
