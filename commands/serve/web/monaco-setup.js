// Monaco Editor manual worker setup
import * as monaco from 'monaco-editor';

// Configure monaco environment with dynamic worker loading
// eslint-disable-next-line no-restricted-globals
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker', import.meta.url));
    }
    return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url));
  },
};

// Export monaco-editor
export * from 'monaco-editor';
export default monaco;
