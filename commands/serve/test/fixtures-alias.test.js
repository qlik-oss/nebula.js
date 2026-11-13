import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';

import fixturesAlias, { fixturesEntry, fixturesStatus } from '../lib/fixtures-alias.js';

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

  it('should leave out the module that asks for the alias when the folder does not exist', () => {
    fs.rmSync(path.join(dir, 'test/component'), { recursive: true });
    assert.equal(path.basename(fixturesEntry('test/component')), 'no-fixtures.js');
  });

  it('should use the module that asks for the alias when the folder exists', () => {
    fs.mkdirSync(path.join(dir, 'test/component'), { recursive: true });
    assert.equal(path.basename(fixturesEntry('test/component')), 'fixtures.js');
  });

  it('should say where the fixtures are loaded from when the folder exists', () => {
    assert.deepEqual(fixturesStatus('test/component'), {
      level: 'info',
      message: `Fixtures are loaded from ${path.join(dir, 'test/component')}`,
    });
  });

  it('should warn when the folder does not exist', () => {
    fs.rmSync(path.join(dir, 'test/component'), { recursive: true });
    assert.equal(fixturesStatus('test/component').level, 'warn');
  });

  it('should leave everything out and say nothing when there is no fixturePath', () => {
    assert.deepEqual(fixturesAlias(undefined), {});
    assert.equal(path.basename(fixturesEntry(undefined)), 'no-fixture-path.js');
    assert.equal(fixturesStatus(undefined), undefined);
  });
});
