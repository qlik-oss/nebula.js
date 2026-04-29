import apis from '../oxlint.apis.ts';
import { defineConfig } from 'oxlint';
import { react } from '@qlik/oxlint-config';

export default defineConfig({
  extends: [apis, react],
  rules: {},
});
