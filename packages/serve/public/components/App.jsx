/* global SN_NAME */

import React, {
  useEffect,
  useState,
  useRef,
} from 'react';

import {
  Button,
} from 'react-leonardo-ui';

import nucleus from '@nebula.js/nucleus';
import snDefinition from 'snDefinition'; // eslint-disable-line

import {
  Toolbar,
  Grid,
  Panel,
} from '../ui-components';

import Properties from './Properties';
import Stage from './Stage';

import AppContext from '../contexts/AppContext';

export default function App({
  app,
}) {
  const [viz, setViz] = useState(null);
  const [sn, setSupernova] = useState(null);
  const sel = useRef(null);

  useEffect(() => {
    const nebbie = nucleus(app)
      .load((type, config) => config.Promise.resolve(snDefinition));

    nebbie.types.supernova(SN_NAME).then(setSupernova);
    nebbie.selections().mount(sel.current);

    const create = () => {
      nebbie.create({
        type: SN_NAME || '__undefined__',
      }, {}).then((v) => {
        v.context({
          permissions: ['passive', 'interact', 'select', 'fetch'],
        });
        setViz(v);
      });
    };

    const render = () => {
      create();
    };

    render();
  }, []);

  return (
    <AppContext.Provider value={app}>
      <Grid vertical noSpacing>
        <Toolbar style={{ backgroundColor: '#fff' }}>
          <a href={window.location.origin}>
            <Button>
              <Button.Icon name="arrow-left" />
              <Button.Text>Hub</Button.Text>
            </Button>
          </a>
        </Toolbar>
        <div ref={sel} style={{ flex: '0 0 auto' }} />
        <Grid noSpacing className="content">
          <Stage viz={viz} sn={sn} />
          <Panel>
            <Properties sn={sn} model={viz && viz.model} />
          </Panel>
        </Grid>
      </Grid>
    </AppContext.Provider>
  );
}
