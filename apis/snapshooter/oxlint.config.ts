import apis from '../oxlint.apis.ts';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [apis],
  rules: {
    'no-dynamic-require': 'off', // Rollup config uses dynamic require for package.json
    'no-param-reassign': 'off', // Renderer mutates element parameter for error display
  },
});
