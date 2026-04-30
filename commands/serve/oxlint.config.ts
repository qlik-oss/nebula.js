import commands from '../oxlint.commands.ts';
import { defineConfig } from 'oxlint';
import { react } from '@qlik/oxlint-config';

export default defineConfig({
  extends: [commands, react],
  rules: {
    // Circular dependencies exist between web/contexts/RootContext.jsx and web/hooks/
    // Fixing requires significant architectural refactoring
    'import/no-cycle': 'off',
    // Express async handlers in lib/ have try/catch and are safe in practice
    'no-async-endpoint-handlers': 'off',
    // chokidar and puppeteer are used via their default export objects (standard API)
    'import/no-named-as-default-member': 'off',
  },
});
