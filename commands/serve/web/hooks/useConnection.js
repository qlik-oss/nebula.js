import { useState, useEffect } from 'react';
import { manageConnections } from '../utils';
import { connect } from '../connect';

export const useConnection = ({ info }) => {
  const [glob, setGlobal] = useState();
  const [treatAsDesktop, setTreatAsDesktop] = useState(false);
  const [error, setError] = useState();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!info || !info.engineUrl) return;

    if (info.invalid) {
      setError({
        message: 'Connection failed',
        hints: ['The WebSocket URL is not valid.'],
      });
      return;
    }

    connect()
      .then((result) =>
        handleConnectionSuccess({
          result,
          info,
          setGlobal,
          setActiveStep,
          setError,
          setTreatAsDesktop,
        })
      )
      .catch((error) => handleConnectionFailure({ error, setError }));
  }, [info]);

  return { glob, treatAsDesktop, error, activeStep };
};

export const handleConnectionSuccess = async ({
  result,
  info,
  setGlobal,
  setActiveStep,
  setTreatAsDesktop,
  setError,
}) => {
  handleSessionNotification({ result, setError });
  setGlobal(result);
  if (!result.getDocList) return;
  setActiveStep(1);
  manageConnections(info);
  try {
    const config = await result.getConfiguration();
    if (config?.qFeatures?.qIsDesktop) setTreatAsDesktop(true);
  } catch (error) {
    throw new Error('Failed to get configuration');
  }
};

export const handleConnectionFailure = ({ error, setError }) => {
  const oops = {
    message: 'Something went wrong, check the devtools console',
    hints: [],
  };
  if (error.target instanceof WebSocket) {
    oops.message = `Connection failed to ${info.engineUrl}`;
    if (/\.qlik[A-Za-z0-9-]+\.com/.test(info.engineUrl) && !info.webIntegrationId) {
      oops.hints.push(
        'If you are connecting to Qlik Cloud Services, make sure to provide a web integration id or client id.'
      );
    }
    setError(oops);
    return;
  }
  setError(oops);
  console.error(error);
};

// TODO:
// when we would get session property on enigma instance?
// this seems to be the only case when we return enigma instace
export const handleSessionNotification = ({ result, setError }) => {
  if (result.session) {
    result.session.on('notification:OnAuthenticationInformation', (e) => {
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
};
