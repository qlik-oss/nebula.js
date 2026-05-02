import base from '../../oxlint.base.ts';
import { defineConfig } from 'oxlint';
import { react } from '@qlik/oxlint-config';

export default defineConfig({
  extends: [base, react],
});
