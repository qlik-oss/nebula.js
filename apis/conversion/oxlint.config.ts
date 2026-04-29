import apis from '../oxlint.apis.ts';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [apis],
  rules: {
    'no-param-reassign': 'off', // Array and object mutations in converters/helpers are intentional
  },
});
