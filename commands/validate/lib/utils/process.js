import path from 'path';
import { spawn } from 'child_process';

import { exists } from './file-system.js';

export const getPackageManager = (cwd) => {
  if (exists(path.join(cwd, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }
  if (exists(path.join(cwd, 'yarn.lock'))) {
    return 'yarn';
  }
  return 'npm';
};

export const runCommand = ({ cwd, cmd, args }) =>
  new Promise((resolve) => {
    const cp = spawn(cmd, args, {
      cwd,
      stdio: 'inherit',
      env: {
        ...process.env,
        CI: process.env.CI || '1',
        COREPACK_ENABLE_DOWNLOAD_PROMPT: process.env.COREPACK_ENABLE_DOWNLOAD_PROMPT || '0',
      },
      shell: process.platform === 'win32',
    });
    cp.on('close', (code) => resolve(code || 0));
  });
