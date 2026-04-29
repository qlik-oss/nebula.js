import apis from '../oxlint.apis.ts';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [apis],
  rules: {
    'no-underscore-dangle': [
      'error',
      { allow: ['_r', '_g', '_b', '_a', 'h_', '_inherit', '_variables', 'rgb_', '_invalid', '_spaces', '_lumi'] },
    ],
  },
});
