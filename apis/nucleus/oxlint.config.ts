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
          '_listRef',
          '__snInterceptor',
          '_outerRef', // react-window internal ref accessed in useSelectionsInteractions
        ],
      },
    ],
    'no-param-reassign': 'off', // React ref mutations (.current) and mixin patterns are intentional throughout nucleus
    'eslint-plugin-react-hooks/exhaustive-deps': 'off', // Intentional mount-only and selectively-triggered effects; fixing requires per-component analysis — tracked as follow-up
  },
});
