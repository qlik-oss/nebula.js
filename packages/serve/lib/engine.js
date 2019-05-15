const path = require('path');
const execa = require('execa');

/* eslint no-use-before-define:0 */
const startEngine = () => {
  if (process.env.ACCEPT_EULA == null || process.env.ACCEPT_EULA.toLowerCase() !== 'yes') {
    throw new Error('Need to accept EULA in order to start engine container');
  }
  console.log('Starting engine container ...');
  return new Promise((resolve, reject) => {
    const c = execa.shell('cross-env ACCEPT_EULA=yes docker-compose up -d --build', {
      cwd: path.resolve(__dirname, '../'),
      stdio: 'inherit',
    });

    const ping = setInterval(() => {
      const { stdout } = execa.shellSync('docker ps -q -f name=engine -f status=running');
      if (stdout) {
        console.log('... engine container running');
        clear();
        resolve();
      }
    }, 1000);

    const timeout = setTimeout(() => {
      clear();
      reject();
    }, 60000);

    function clear() {
      clearInterval(ping);
      clearTimeout(timeout);
    }

    c.on('exit', (code) => {
      if (code !== 0) {
        clear();
        reject();
      }
    });
  });
};

const stopEngine = () => {
  execa.shellSync('docker-compose down', {
    cwd: path.resolve(__dirname, '../'),
    stdio: 'inherit',
  });
};

module.exports = {
  startEngine,
  stopEngine,
};
