import qlik from '@qlik/oxlint-config';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [qlik.recommended],
});
