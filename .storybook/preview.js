import React from 'react';
import { createTheme, ThemeProvider } from '@nebula.js/ui/theme';

import InstanceContext from '../apis/nucleus/src/contexts/InstanceContext';

const translator = {
  get(s) {
    return s;
  },
};

const t = createTheme('light');

export const decorators = [
  (Story) => (
    <ThemeProvider theme={t}>
      <InstanceContext.Provider value={{ translator }}>
        <Story />
      </InstanceContext.Provider>
    </ThemeProvider>
  ),
];

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
