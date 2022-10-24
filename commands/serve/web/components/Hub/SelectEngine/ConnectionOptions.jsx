import React, { useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormManager from './FormManager';

import { useRootContext } from '../../../contexts/RootContext';

const OptionsToConnect = [
  { id: 0, label: 'Local Engine', formFields: ['Engine WebSocket URL'] },
  { id: 1, label: 'Web Integration Id', formFields: ['Engine WebSocket URL', 'Web Integration Id'] },
  { id: 2, label: 'Client Id', formFields: ['Engine WebSocket URL', 'Client Id'] },
];
const detectDefaultStep = (info) => {
  if (info?.isWebIntegrationIdProvided) return OptionsToConnect.findIndex((x) => x.label === 'Web Integration Id');
  if (info?.isClientIdProvided) return OptionsToConnect.findIndex((x) => x.label === 'Client Id');
  return 0;
};

export default function ConnectionOptions() {
  const { info, error } = useRootContext();
  const [tabIdx, setTabIdx] = useState(detectDefaultStep(info));
  const handleChange = (_, idx) => setTabIdx(idx);

  const checkIfTabDisabled = ({ label }) => {
    const labelKey = label
      .split(' ')
      .map((x) => x.toLowerCase())
      .join('-');

    if (info?.isWebIntegrationIdProvided) {
      if (labelKey === 'web-integration-id') return false;
      return true;
    }

    if (info?.isClientIdProvided) {
      if (labelKey === 'client-id') return false;
      return true;
    }

    return false;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        New connection with:
      </Typography>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabIdx} onChange={handleChange} aria-label="basic tabs example">
            {OptionsToConnect.map(({ id, label }) => (
              <Tab key={id} label={label} disabled={checkIfTabDisabled({ label })} />
            ))}
          </Tabs>
        </Box>

        {OptionsToConnect.map(({ id, formFields }) => (
          <TabPanel tabIdx={tabIdx} idx={id} key={id}>
            <FormManager
              info={info}
              error={error}
              fields={formFields}
              isCredentialProvided={info?.isWebIntegrationIdProvided || info?.isClientIdProvided}
            />
          </TabPanel>
        ))}
      </Box>
    </Box>
  );
}

function TabPanel({ children, tabIdx, idx }) {
  if (tabIdx === idx) return <Box sx={{ p: 3, pb: 1 }}>{children}</Box>;
  return null;
}
