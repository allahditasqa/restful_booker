// Custom Playwright reporter: module-wise reports that open without a server.
// After every run it writes (see scripts/lib/report-writer.js, shared with the other automation repositories):
//   reports/<module-slug>/<Module Name> test <DD-MM-YYYY>_<HH-mm-ss>.html        one self-contained HTML report per module
//   reports/<module-slug>/<Module Name> test cases <DD-MM-YYYY>_<HH-mm-ss>.csv   the cases of the module + the real result of this run
//   reports/index.html and reports/history.json                                  all runs, newest on top
// Old reports are never overwritten because the date and time are part of the file name.
// Cases marked test.fail() are known defects (DEFECTS.md): they are shown as "known defect", not as pass.
// If such a case starts to pass (the API was fixed) it is reported as FAILED, so the test.fail() mark gets removed.
import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

const { writeRun } = require('../scripts/lib/report-writer.js') as {
  writeRun: (run: Record<string, unknown>) => { files: string[]; index: string };
};

interface Row {
  id: string;
  title: string;
  suite: string;
  status: string;
  known: boolean;
  note: string;
  duration: number;
  retry: number;
  error: string;
}

export default class OfflineReporter implements Reporter {
  private rows = new Map<string, Row>();
  private startedAt = new Date();
  private reportsDir: string;
  private url: string;

  constructor(options: { outputDir?: string } = {}) {
    this.reportsDir = options.outputDir ?? 'reports';
    this.url = process.env.BASE_URL ?? 'https://restful-booker.herokuapp.com';
  }

  onBegin(): void {
    this.startedAt = new Date();
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const id = test.title.match(/TC_[A-Z0-9_.]+/)?.[0];
    if (!id) return;
    const expectedFail = test.expectedStatus === 'failed';
    const raw = result.status === 'passed' ? 'passed' : result.status === 'skipped' ? 'skipped' : 'failed';
    const known = expectedFail && raw === 'failed';
    const fixed = expectedFail && raw === 'passed'; // the defect is gone: test.fail() must be removed
    this.rows.set(test.id, {
      id,
      title: test.title,
      suite: test.titlePath().slice(2, -1).join(' › '),
      status: fixed ? 'failed' : known ? 'passed' : raw,
      known,
      note: test.annotations.find((a) => a.type === 'fail')?.description ?? '',
      duration: result.duration,
      retry: result.retry,
      error: fixed
        ? 'Known defect no longer reproduces: the API behaves as documented. Remove test.fail() and close the defect in DEFECTS.md.'
        : result.error
          ? (result.error.message ?? String(result.error))
          : '',
    });
  }

  onEnd(): void {
    if (this.rows.size === 0) return;
    const { files, index } = writeRun({
      reportsDir: this.reportsDir,
      startedAt: this.startedAt,
      durationSec: Math.round((Date.now() - this.startedAt.getTime()) / 1000),
      tool: 'Restful-Booker API',
      browser: 'None (API tests, Playwright request client)',
      url: this.url,
      results: [...this.rows.values()],
    });
    for (const file of files.filter((f) => f.endsWith('.html'))) console.log(`Module report: ${file}`);
    console.log(`All reports index: ${index}`);
  }
}
