/* eslint-disable no-console */

export const printSummary = ({ report }) => {
  const status = report.ok ? 'PASS' : 'FAIL';
  console.log(`\nnebula validate: ${status}`);

  report.steps.forEach((step) => {
    const marker = step.ok ? 'ok' : step.skipped ? 'skipped' : 'failed';
    console.log(` - ${step.name}: ${marker} (${step.details})`);
  });

  if (!report.findings.length) {
    return;
  }

  console.log('\nFindings:');
  report.findings.forEach((finding) => {
    const line = finding.line ? `:${finding.line}` : '';
    console.log(` - [${finding.severity}] ${finding.file}${line} ${finding.message}`);
  });
};
