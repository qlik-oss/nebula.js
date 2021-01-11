const path = require('path');
const { spawn } = require('child_process');

const execCmd = (cmd, cmdArgs = [], opts) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, cmdArgs, opts);
    const res = {
      exitCode: null,
      out: '',
      err: '',
    };
    child.on('error', reject);
    child.stdout.on('data', (chunk) => {
      res.out += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      res.err += chunk.toString();
    });
    child.on('exit', (exitCode) => {
      res.exitCode = exitCode;
      if (exitCode === 0) {
        resolve(res);
      } else {
        reject(res);
      }
    });
  });

const useEngine = ({ ACCEPT_EULA = false, cwd = path.resolve(__dirname, '../'), files }) => {
  if (ACCEPT_EULA !== true) {
    throw new Error('Need to accept EULA in order to start engine container');
  }
  console.error('Starting engine container...');
  const f = (files || []).reduce((acc, curr) => [...acc, '-f', curr], []);
  process.env.ACCEPT_EULA = 'yes';
  const stopEngine = async () => {
    console.error('Stopping engine container...');
    try {
      await execCmd('docker-compose', [...f, 'down', '--remove-orphans'], {
        cwd,
      });
    } catch (err) {
      console.error(err);
    }
  };
  return execCmd('docker-compose', [...f, 'up', '-d', '--build'], { cwd }).then(() => stopEngine);
};

module.exports = useEngine;
