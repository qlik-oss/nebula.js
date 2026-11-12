import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import yargs from 'yargs';

import initConfig from '../lib/init-config.js';

describe('init-config', () => {
  let dir;
  let config;

  before(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'serve-config-'));
    config = path.join(dir, 'nebula.config.js');
    fs.writeFileSync(config, 'module.exports = { serve: { port: 8123 } };');
  });

  after(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('should have no port unless one is asked for', () => {
    assert.equal(initConfig(yargs([])).argv.port, undefined);
  });

  it('should take the port from the config file', () => {
    assert.equal(initConfig(yargs(['--config', config])).argv.port, 8123);
  });

  it('should take the port of -p before the one of the config file', () => {
    assert.equal(initConfig(yargs(['--config', config, '-p', '9001'])).argv.port, 9001);
  });
});
