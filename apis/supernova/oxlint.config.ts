import apis from '../oxlint.apis.ts';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [apis],
  rules: {
    'no-underscore-dangle': [
      'error',
      {
        allow: [
          '__hooks', // Component hooks internal state
          '__actionsDispatch', // Action dispatcher callback
          '__NEBULA_DEV__', // Development flag
          '__DO_NOT_USE__', // Public API escape hatch
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
