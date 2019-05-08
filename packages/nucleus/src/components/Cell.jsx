import React, {
  useEffect,
  useState,
} from 'react';

import {
  Grid,
} from '@nebula.js/ui/components';

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
  api,
}) {
  const [state, setState] = useState({
    objectProps: api.objectProps(),
    userProps: api.userProps(),
  });
  useEffect(() => {
    const onChanged = () => {
      setState({
        objectProps: api.objectProps(),
        userProps: api.userProps(),
      });
    };
    api.on('changed', onChanged);
    return () => {
      api.removeListener('changed', onChanged);
    };
  }, [api]);

  const SN = (showRequirements(state.objectProps.sn, state.objectProps.layout) ? Requirements : Supernova);
  const Comp = !state.objectProps.sn ? Placeholder : SN;
  const err = state.objectProps.error || false;
  return (
    <Grid container direction="column" spacing={0} style={{ height: '100%', padding: '8px', boxSixing: 'borderBox' }}>
      <Grid item style={{ maxWidth: '100%' }}>
        <Header layout={state.objectProps.layout} sn={state.objectProps.sn}>&nbsp;</Header>
      </Grid>
      <Grid item xs>
        <Content>
          {err
            ? (<CError {...err} />)
            : (
              <Comp
                key={state.objectProps.layout.visualization}
                sn={state.objectProps.sn}
                snContext={state.userProps.context}
                snOptions={state.userProps.options}
                layout={state.objectProps.layout}
              />
            )
          }
        </Content>
      </Grid>
      <Footer layout={state.objectProps.layout} />
    </Grid>
  );
}
