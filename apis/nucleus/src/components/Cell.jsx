import React, { useEffect, useState } from 'react';

import { Grid, Paper } from '@nebula.js/ui/components';
import { useTheme } from '@nebula.js/ui/theme';

import Requirements from './Requirements';
import CError from './Error';
import Header from './Header';
import Footer from './Footer';
import Supernova from './Supernova';
import Placeholder from './Placeholder';

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
  return layout.qHyperCube.qDimensionInfo.length < minD || layout.qHyperCube.qMeasureInfo.length < minM;
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

export default function Cell({ api, onInitial }) {
  const [, setChanged] = useState(0);
  const theme = useTheme();
  useEffect(() => {
    const onChanged = () => setChanged(Date.now());
    api.on('changed', onChanged);
    return () => {
      api.removeListener('changed', onChanged);
    };
  }, [api]);

  useEffect(() => {
    onInitial();
  });

  const objectProps = api.objectProps();
  const userProps = api.userProps();

  const SN = showRequirements(objectProps.sn, objectProps.layout) ? Requirements : Supernova;
  const Comp = !objectProps.sn ? Placeholder : SN;
  const err = objectProps.error || false;
  return (
    <Paper style={{ height: '100%', position: 'relative' }} elevation={0} square>
      <Grid container direction="column" spacing={0} style={{ height: '100%', padding: theme.spacing(1) }}>
        <Grid item style={{ maxWidth: '100%' }}>
          <Header layout={objectProps.layout} sn={objectProps.sn}>
            &nbsp;
          </Header>
        </Grid>
        <Grid item xs>
          <Content>
            {err ? (
              <CError message={err.message} />
            ) : (
              <Comp
                key={objectProps.layout.visualization}
                sn={objectProps.sn}
                snContext={userProps.context}
                snOptions={userProps.options}
                layout={objectProps.layout}
              />
            )}
          </Content>
        </Grid>
        <Footer layout={objectProps.layout} />
      </Grid>
    </Paper>
  );
}
