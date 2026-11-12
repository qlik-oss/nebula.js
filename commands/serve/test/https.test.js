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
    const result = resolve(undefined, both);
    assert.equal(result.https, true);
    assert.match(result.reason, /certificates found in \/home\/\.certs/);
  });

  it('should use http when the certificates are not installed and nothing is asked for', () => {
    const result = resolve(undefined, []);
    assert.equal(result.https, false);
    assert.match(result.reason, /no certificates in \/home\/\.certs, install them to serve over https/);
    assert.equal(resolve(undefined, [paths.keyPath]).https, false);
  });

  it('should use http when it is asked for, also when the certificates are installed', () => {
    const result = resolve(false, both);
    assert.equal(result.https, false);
    assert.match(result.reason, /turned off.*--no-https/);
  });

  it('should use https when it is asked for', () => {
    const result = resolve(true, both);
    assert.equal(result.https, true);
    assert.match(result.reason, /asked for/);
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
