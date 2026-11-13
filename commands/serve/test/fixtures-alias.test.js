import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';

import fixturesAlias, { fixturesIgnoreWarnings } from '../lib/fixtures-alias.js';

describe('fixtures-alias', () => {
  let dir;
  let cwd;

  before(() => {
    cwd = process.cwd();
    dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'serve-fixtures-')));
    process.chdir(dir);
  });

  after(() => {
    process.chdir(cwd);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('should leave the alias out when the folder does not exist', () => {
    assert.deepEqual(fixturesAlias('test/component'), {});
  });

  it('should alias the folder when it exists', () => {
    fs.mkdirSync(path.join(dir, 'test/component'), { recursive: true });
    assert.deepEqual(fixturesAlias('test/component'), { fixtures: path.join(dir, 'test/component') });
  });

  it('should ignore the warning of the bundler about the missing alias', () => {
    assert.ok(fixturesIgnoreWarnings.some((re) => re.test("Module not found: Can't resolve 'fixtures'")));
  });
});
