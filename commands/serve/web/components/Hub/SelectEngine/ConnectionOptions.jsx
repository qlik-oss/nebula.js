import React, { useEffect, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormManager from './FormManager';
import { useRootContext } from '../../../contexts/RootContext';
import { OptionsToConnect } from '../../../constants/optionsToConnect';
import { detectDefaultConnectionStep, checkIfConnectionOptionDisabled } from '../../../utils';

export default function ConnectionOptions() {
  const { info, error } = useRootContext();
  const [tabIdx, setTabIdx] = useState(0);
  const handleChange = (_, idx) => setTabIdx(idx);

  useEffect(() => {
    const idx = detectDefaultConnectionStep(info);
    if (idx) setTabIdx(idx);
  }, [info]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        New connection with:
      </Typography>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabIdx} onChange={handleChange} aria-label="basic tabs example">
            {OptionsToConnect.map(({ id, label }) => (
              <Tab key={id} label={label} disabled={checkIfConnectionOptionDisabled({ info, label })} />
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
