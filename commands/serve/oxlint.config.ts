import commands from '../oxlint.commands.ts';
import { defineConfig } from 'oxlint';
import { react } from '@qlik/oxlint-config';

export default defineConfig({
  extends: [commands, react],
  rules: {},
});
