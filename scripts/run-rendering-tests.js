const { execSync } = require('child_process');

const cmd =
  'mocha test/rendering/**/*.spec.js --bail false --timeout 30000  --chrome.browserWSEndpoint "ws://localhost:3000" --no-launch';
execSync(cmd, { stdio: 'inherit' });
