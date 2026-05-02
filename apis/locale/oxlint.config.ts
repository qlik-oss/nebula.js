import apis from '../oxlint.apis.ts';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [apis],
  rules: {
    'no-underscore-dangle': [
      'error',
      { allow: ['__dirname'] }, // ESM import.meta.url helper
    ],
  },
});
