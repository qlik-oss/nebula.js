const { execSync } = require('child_process');

const cmd = 'mocha test/rendering/listbox/listbox.spec.js --bail false --timeout 30000';
execSync(cmd, { stdio: 'inherit' });
