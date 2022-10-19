/* eslint no-nested-ternary: 0 */
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import AppList from './AppList';
import SelectEngine from './SelectEngine/SelectEngine';
import ConnectionSteps from './ConnectionSteps';
import { getConnectionInfo, connect } from '../../connect';
import storageFn from '../../storage';
import { ThemeWrapper } from '../ThemeWrapper';

const storage = storageFn({});

export default function Hub() {
  const [info, setInfo] = useState();
  const [glob, setGlobal] = useState();
  const [treatAsDesktop, setTreatAsDesktop] = useState(false);
  const [error, setError] = useState();
  const [activeStep, setActiveStep] = useState(0);

  const reset = () => {
    window.location.href = window.location.origin;
  };

  useEffect(() => {
    getConnectionInfo().then((i) => {
      if (i.enigma.appId) {
        window.location.href = `/dev/${window.location.search}`;
        return;
      }
      setInfo(i);
    });
  }, []);

  const manageConnections = (i) => {
    const conns = storage.get('connections') || [];
    let url = '';
    if (i.clientId) url = `${i.engineUrl}?qlik-client-id=${i.clientId}`;
    if (i.webIntegrationId) url = `${i.engineUrl}?qlik-web-integration-id=${i.webIntegrationId}`;
    if (conns.indexOf(url) === -1 && url.length !== 0) {
      conns.push(url);
      storage.save('connections', conns);
    }
  };

  useEffect(() => {
    if (!info || !info.engineUrl) {
      return;
    }
    if (info.invalid) {
      setError({
        message: 'Connection failed',
        hints: ['The WebSocket URL is not valid.'],
      });
      return;
    }
    connect()
      .then((g) => {
        if (g.session) {
          g.session.on('notification:OnAuthenticationInformation', (e) => {
            if (e.mustAuthenticate) {
              setError({
                message: 'Could not authenticate.',
                hints: [
                  `In your virtual proxy advanced settings in the QMC, make sure to whitelist ${window.location.host}, ensure "Has secure attribute" is enabled and that "SameSite attribute" is set to "None".`,
                ],
              });
              setGlobal(null);
            }
          });
        }

        setGlobal(g);
        if (!g.getDocList) return;
        setActiveStep(1);
        manageConnections(info);
        g.getConfiguration().then((c) => {
          if (c.qFeatures && c.qFeatures.qIsDesktop) {
            setTreatAsDesktop(true);
          }
        });
      })
      .catch((e) => {
        const oops = {
          message: 'Something went wrong, check the devtools console',
          hints: [],
        };
        if (e.target instanceof WebSocket) {
          oops.message = `Connection failed to ${info.engineUrl}`;
          if (/\.qlik[A-Za-z0-9-]+\.com/.test(info.engineUrl) && !info.webIntegrationId) {
            oops.hints.push(
              'If you are connecting to Qlik Cloud Services, make sure to provide a qlik-web-integration-id.'
            );
          }
          setError(oops);
          return;
        }
        setError(oops);
        console.error(e);
      });
  }, [info]);

  if (!info) {
    return null;
  }

  if (info.engineUrl && !(glob || error)) {
    return null;
  }

  return (
    <ThemeWrapper themeName="light">
      <Container maxWidth="md">
        <ConnectionSteps {...{ glob, error, reset, activeStep }} />
        <Box p={[2, 2]} m={2} bgcolor="background.paper" boxShadow={24} borderRadius={1}>
          {glob ? (
            glob.status === 401 ? (
              <Typography variant="h5">Connecting...</Typography>
            ) : (
              <AppList {...{ info, glob, treatAsDesktop }} />
            )
          ) : (
            <SelectEngine {...{ info, error }} />
          )}
        </Box>
      </Container>
    </ThemeWrapper>
  );
}
