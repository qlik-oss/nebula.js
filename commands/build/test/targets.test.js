/* eslint-disable import/extensions */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

import getTargets from '../lib/targets.js';

const require = createRequire(import.meta.url);

describe('targets of the transform', () => {
  it('is the oldest version of every browser of the query', () => {
    assert.deepEqual(getTargets(['chrome 62', 'chrome 70', 'Safari >= 11', 'ios_saf 12.2', 'firefox 100']).sort(), [
      'chrome62',
      'firefox100',
      'ios12.2',
      'safari11',
    ]);
  });

  it('names the oldest version of a range of versions of a browser', () => {
    assert.deepEqual(getTargets(['ios_saf 18.5-18.7', 'ios_saf 18.4']), ['ios18.4']);
    assert.deepEqual(getTargets(['ios_saf 18.5-18.7']), ['ios18.5']);
  });

  it('leaves out the browsers the transformer does not know of', () => {
    assert.deepEqual(getTargets(['chrome 62', 'samsung 20', 'op_mini all']), ['chrome62']);
  });

  it('works for the browserslist of the build, one target per browser', () => {
    const targets = getTargets(require('@qlik/browserslist-config'));
    assert.deepEqual(targets.map((t) => t.replace(/[\d.]+$/, '')).sort(), [
      'chrome',
      'edge',
      'firefox',
      'ios',
      'safari',
    ]);
  });
});
