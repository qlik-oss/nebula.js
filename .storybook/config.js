import React from 'react';
import { addDecorator, addParameters, configure } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import { create } from '@storybook/theming';
import { createTheme, ThemeProvider } from '@nebula.js/ui/theme';

import InstanceContext from '../apis/stardust/src/embed/contexts/InstanceContext';

const translator = {
  get(s) {
    return s;
  },
};

const t = createTheme('light');

addDecorator((storyFn) => {
  return <ThemeProvider theme={t}>{storyFn()}</ThemeProvider>;
});

addDecorator((storyFn) => {
  return <InstanceContext.Provider value={{ translator }}>{storyFn()}</InstanceContext.Provider>;
});

addDecorator(withKnobs);

const storybookTheme = create({
  base: 'light',

  brandTitle: 'nebula.js',
  brandUrl: 'https://github.com/qlik-oss/nebula.js',
  brandImage: 'https://raw.githubusercontent.com/qlik-oss/nebula.js/master/docs/assets/logos/nebula.png',
});

addParameters({
  options: {
    theme: storybookTheme,
  },
});

configure(require.context('../apis', true, /__stories__\/.+\.jsx?$/), module);
