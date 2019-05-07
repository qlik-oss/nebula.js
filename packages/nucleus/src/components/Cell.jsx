import React, {
  useMemo,
} from 'react';

import {
  createTheme,
  ThemeProvider,
  StylesProvider,
  createGenerateClassName,
} from '@nebula.js/ui/theme';

import {
  Grid,
} from '@nebula.js/ui/components';

import Requirements from './Requirements';
import CError from './Error';
import Header from './Header';
import Footer from './Footer';
import Supernova from './Supernova';
import Placeholder from './Placeholder';

const generateClassName = createGenerateClassName({
  productionPrefix: 'cell-',
  disableGlobal: true,
  seed: 'nebula',
});

const showRequirements = (sn, layout) => {
  if (!sn || !sn.generator || !sn.generator.qae || !layout || !layout.qHyperCube) {
    return false;
  }
  const def = sn.generator.qae.data.targets[0];
  if (!def) {
    return false;
  }
  const minD = def.dimensions.min();
  const minM = def.measures.min();
  return (layout.qHyperCube.qDimensionInfo.length < minD
    || layout.qHyperCube.qMeasureInfo.length < minM);
};

const Content = ({ children }) => (
  <div style={{ position: 'relative', height: '100%' }}>
    <div
      className="nebulajs-sn"
      style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        right: '8px',
        bottom: '8px',
      }}
    >
      {children}
    </div>
  </div>
);

export default function Cell({
  objectProps,
  userProps,
  themeDefinition = {},
}) {
  const theme = useMemo(() => createTheme(themeDefinition), [JSON.stringify(themeDefinition)]);
  const SN = (showRequirements(objectProps.sn, objectProps.layout) ? Requirements : Supernova);
  const Comp = !objectProps.sn ? Placeholder : SN;
  const err = objectProps.error || false;
  return (
    <StylesProvider generateClassName={generateClassName}>
      <ThemeProvider theme={theme}>
        <Grid container direction="column" spacing={0} style={{ height: '100%', padding: '8px', boxSixing: 'borderBox' }}>
          <Grid item style={{ maxWidth: '100%' }}>
            <Header layout={objectProps.layout} sn={objectProps.sn}>&nbsp;</Header>
          </Grid>
          <Grid item xs>
            <Content>
              {err
                ? (<CError {...err} />)
                : (
                  <Comp
                    key={objectProps.layout.visualization}
                    sn={objectProps.sn}
                    snContext={userProps.context}
                    snOptions={userProps.options}
                    layout={objectProps.layout}
                  />
                )
              }
            </Content>
          </Grid>
          <Footer layout={objectProps.layout} />
        </Grid>
      </ThemeProvider>
    </StylesProvider>
  );
}
