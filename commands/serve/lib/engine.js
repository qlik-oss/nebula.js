const path = require('path');
const { spawn } = require('child_process');

const cwd = path.resolve(__dirname, '../');

const execCmd = (cmd, cmdArgs = [], opts) => {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, cmdArgs, opts);
    const res = {
      exitCode: null,
      out: '',
      err: '',
    };
    child.on('error', reject);
    child.stdout.on('data', chunk => {
      res.out += chunk.toString();
    });
    child.stderr.on('data', chunk => {
      res.err += chunk.toString();
    });
    child.on('exit', exitCode => {
      res.exitCode = exitCode;
      if (exitCode === 0) {
        resolve(res);
      } else {
        reject(res);
      }
    });
  });
};

const useEngine = ({ ACCEPT_EULA = false }) => {
  if (ACCEPT_EULA !== true) {
    throw new Error('Need to accept EULA in order to start engine container');
  }
  console.error('Starting engine container...');
  process.env.ACCEPT_EULA = 'yes';
  const stopEngine = async () => {
    console.error('Stopping engine container...');
    try {
      await execCmd('docker-compose', ['down', '--remove-orphans'], {
        cwd,
      });
    } catch (err) {
      console.error(err);
    }
  };
  return execCmd('docker-compose', ['up', '-d', '--build'], { cwd }).then(() => stopEngine);
};

module.exports = useEngine;
