import apis from '../oxlint.apis.ts';
import { defineConfig } from 'oxlint';
import { react } from '@qlik/oxlint-config';

export default defineConfig({
  extends: [apis, react],
  rules: {
    'no-underscore-dangle': [
      'error',
      {
        allow: [
          '_ref',
          '_popoverInstance',
          '__DO_NOT_USE__',
          '__NEBULA_DEV__',
          '_instance',
          '_nuked',
          '_popover',
          '__timedOut',
          '_divider',
        ],
      },
    ],
  },
});
