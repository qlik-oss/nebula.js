import base from '../oxlint.base.ts';
import { defineConfig } from 'oxlint';

export const SHARED_APIS_NO_UNDERSCORE_DANGLE_ALLOW = ['__NEBULA_DEV__', '__DO_NOT_USE__'];

export default defineConfig({
  extends: [base],
});
