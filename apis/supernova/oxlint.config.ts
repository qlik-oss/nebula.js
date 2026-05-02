import apis, { SHARED_APIS_NO_UNDERSCORE_DANGLE_ALLOW } from '../oxlint.apis.ts';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [apis],
  rules: {
    'no-underscore-dangle': [
      'error',
      {
        allow: [
          ...SHARED_APIS_NO_UNDERSCORE_DANGLE_ALLOW, // Development flag and public API escape hatch
          '__hooks', // Component hooks internal state
          '__actionsDispatch', // Action dispatcher callback
          '__snInterceptor', // Hooks interceptor internal
          '__hooked', // Hooks tracking internal
          '_config', // Test mock configuration
          'RO_', // ResizeObserver backup in tests
        ],
      },
    ],
    'no-param-reassign': 'off', // Hook initialization mutates component and options objects
  },
});
