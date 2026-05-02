import apis from '../oxlint.apis.ts';
import { defineConfig } from 'oxlint';
import { SHARED_NO_UNDERSCORE_DANGLE_ALLOW } from '../../oxlint.base.ts';

export default defineConfig({
  extends: [apis],
  rules: {
    'no-underscore-dangle': ['error', { allow: SHARED_NO_UNDERSCORE_DANGLE_ALLOW }],
  },
});
