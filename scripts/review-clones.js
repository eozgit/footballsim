import fs from 'node:fs';
import { execSync } from 'node:child_process';

const reportPath = './scripts/jscpd-report.json';

if (!fs.existsSync(reportPath)) {
  console.error('Report not found. Run jscpd with JSON reporter first.');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const duplicates = (report.duplicates || []).sort((a, b) => b.lines - a.lines).slice(0, 3);

duplicates.forEach((clone, index) => {
  const f1 = clone.firstFile;
  const f2 = clone.secondFile;

  // Header for the console
  console.log(`\n${'='.repeat(80)}`);
  console.log(`WHALE #${index + 1}: ${clone.lines} LINES`);
  console.log(`${'='.repeat(80)}\n`);

  try {
    /**
     * We construct a valid Unified Diff format manually.
     * --- and +++ set the filenames.
     * @@ -start,len +start,len @@ tells Delta the real line offsets.
     */
    const diffCmd = `
      (
        echo "--- ${f1.name}"
        echo "+++ ${f2.name}"
        echo "@@ -${f1.start},${clone.lines} +${f2.start},${clone.lines} @@"
        diff -u \
          <(sed -n '${f1.start},${f1.end}p' "${f1.name}") \
          <(sed -n '${f2.start},${f2.end}p' "${f2.name}") | tail -n +3
      ) | delta --line-numbers --navigate
    `;

    execSync(diffCmd, { shell: '/bin/bash', stdio: 'inherit' });
  } catch (error) {
    // Diff exit code 1 is normal
  }
});
