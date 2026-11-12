import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import yargs from 'yargs';

import initConfig from '../lib/init-config.js';
import { resolveHttps } from '../lib/https.js';

const paths = { keyPath: '/home/.certs/key.pem', certPath: '/home/.certs/cert.pem' };
const resolve = (https, installed) => resolveHttps({ https, paths, exists: (file) => installed.includes(file) });
const both = [paths.keyPath, paths.certPath];

describe('resolveHttps', () => {
  it('should use https when the certificates are installed and nothing is asked for', () => {
    assert.deepEqual(resolve(undefined, both), { https: true, auto: true, ...paths });
  });

  it('should use http when the certificates are not installed and nothing is asked for', () => {
    assert.deepEqual(resolve(undefined, []), { https: false, auto: true, ...paths });
    assert.equal(resolve(undefined, [paths.keyPath]).https, false);
  });

  it('should use http when it is asked for, also when the certificates are installed', () => {
    assert.deepEqual(resolve(false, both), { https: false, auto: false, ...paths });
  });

  it('should use https when it is asked for', () => {
    assert.deepEqual(resolve(true, both), { https: true, auto: false, ...paths });
  });

  it('should not start without the certificates when https is asked for', () => {
    assert.throws(() => resolve(true, []), /Missing key cert at path \/home\/\.certs\/key\.pem.*--no-https/);
    assert.throws(() => resolve(true, [paths.keyPath]), /Missing cert at path \/home\/\.certs\/cert\.pem/);
  });
});

describe('the https option', () => {
  it('should be left unset unless it is given', () => {
    assert.equal(initConfig(yargs([])).argv.https, undefined);
    assert.equal(initConfig(yargs(['--https'])).argv.https, true);
    assert.equal(initConfig(yargs(['--no-https'])).argv.https, false);
  });
});
