import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';

import fixturesAlias from '../lib/fixtures-alias.js';

describe('fixtures-alias', () => {
  let dir;
  let cwd;
  let warn;

  before(() => {
    cwd = process.cwd();
    dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'serve-fixtures-')));
    process.chdir(dir);
    warn = mock.method(console, 'warn', () => {});
  });

  after(() => {
    warn.mock.restore();
    process.chdir(cwd);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('should warn once with the folder when no fixtures are found', () => {
    warn.mock.resetCalls();
    assert.deepEqual(fixturesAlias('test/component'), {});
    assert.equal(warn.mock.callCount(), 1);
    assert.match(warn.mock.calls[0].arguments[0], /no fixtures found under ".*test\/component"/);
  });

  it('should alias the folder when it exists', () => {
    warn.mock.resetCalls();
    fs.mkdirSync(path.join(dir, 'test/component'), { recursive: true });
    assert.deepEqual(fixturesAlias('test/component'), { fixtures: path.join(dir, 'test/component') });
    assert.equal(warn.mock.callCount(), 0);
  });
});
