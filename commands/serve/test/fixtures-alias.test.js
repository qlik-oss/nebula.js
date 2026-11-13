import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';

import fixturesAlias, { fixturesIgnoreWarnings } from '../lib/fixtures-alias.js';

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

  it('should be silent when the default path does not exist', () => {
    warn.mock.resetCalls();
    assert.deepEqual(fixturesAlias(undefined), {});
    assert.equal(warn.mock.callCount(), 0);
    assert.equal(fixturesIgnoreWarnings(undefined).length, 1);
  });

  it('should warn when a path that was passed does not exist', () => {
    warn.mock.resetCalls();
    assert.deepEqual(fixturesAlias('nope'), {});
    assert.equal(warn.mock.callCount(), 1);
    assert.deepEqual(fixturesIgnoreWarnings('nope'), []);
  });

  it('should alias the default path when it exists', () => {
    fs.mkdirSync(path.join(dir, 'test/component'), { recursive: true });
    assert.deepEqual(fixturesAlias(undefined), { fixtures: path.join(dir, 'test/component') });
  });
});
