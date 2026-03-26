import fs from 'fs';
import path from 'path';

import { runStaticAnalysis } from './analysis/static-analysis.js';
import { inferDataRequirements } from './data-requirements.js';
import { printSummary } from './report.js';
import { runSmokeStep } from './steps/smoke-step.js';
import { inferType, parseSteps, resolveEntry } from './target.js';
import { exists, normalizePath, readJson } from './utils/file-system.js';

const runStaticStep = ({ cwd }) => {
  const findings = runStaticAnalysis({ cwd });
  return {
    findings,
    step: {
      name: 'static',
      ok: true,
      skipped: false,
      details: `Found ${findings.length} finding(s)`,
    },
  };
};

const writeReportFile = ({ cwd, reportFile, report }) => {
  if (!reportFile) {
    return;
  }

  const reportPath = path.resolve(cwd, reportFile);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
};

const resolveTarget = ({ argv }) => {
  const cwd = path.resolve(argv.cwd || process.cwd());
  const pkgFile = path.join(cwd, 'package.json');
  if (!exists(pkgFile)) {
    throw new Error(`package.json not found in ${cwd}`);
  }

  const pkg = readJson(pkgFile);
  const { entry, candidates } = resolveEntry({ cwd, pkg, explicitEntry: argv.entry });
  if (!entry) {
    throw new Error(
      `Unable to resolve an entrypoint. Checked: ${candidates
        .map((candidate) => path.resolve(cwd, candidate))
        .join(', ')}`
    );
  }

  return {
    cwd,
    pkg,
    entry,
    type: inferType({ argv, pkg, entry }),
  };
};

export default async function validate(argv) {
  const target = resolveTarget({ argv });
  const requestedSteps = parseSteps(argv.steps);
  const findings = [];
  const steps = [];

  if (requestedSteps.includes('static')) {
    const result = runStaticStep({ cwd: target.cwd });
    findings.push(...result.findings);
    steps.push(result.step);
  }

  if (requestedSteps.includes('smoke')) {
    const dataRequirements = inferDataRequirements({ argv, entry: target.entry, type: target.type });
    const smokeStep = await runSmokeStep({
      cwd: target.cwd,
      type: target.type,
      entry: target.entry,
      dataRequirements,
      smokeTimeout: argv.smokeTimeout,
    });
    steps.push({ name: 'smoke', ...smokeStep });
  }

  const failedStep = steps.find((step) => !step.ok && !step.skipped);
  const report = {
    ok: !failedStep,
    cwd: target.cwd,
    type: target.type,
    entry: normalizePath(target.cwd, target.entry),
    steps,
    findings,
  };

  writeReportFile({ cwd: target.cwd, reportFile: argv.reportFile, report });
  printSummary({ report });

  return report;
}
