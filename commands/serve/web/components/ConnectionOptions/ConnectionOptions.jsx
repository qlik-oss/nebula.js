import React, { useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

import FormManager from './FormManager';

const OptionsToConnect = [
  { id: 0, label: 'Local Engine', formFields: ['Engine WebSocket URL'] },
  { id: 1, label: 'Web Integration Id', formFields: ['Engine WebSocket URL', 'Web Integration Id'] },
  { id: 2, label: 'Client Id', formFields: ['Engine WebSocket URL', 'Client Id'] },
];

export default function ConnectionOptions({ info, onKeyDown, error }) {
  const [tabIdx, setTabIdx] = useState(0);
  const handleChange = (_, idx) => setTabIdx(idx);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabIdx} onChange={handleChange} aria-label="basic tabs example">
          {OptionsToConnect.map(({ id, label }) => (
            <Tab key={id} label={label} />
          ))}
        </Tabs>
      </Box>

      {OptionsToConnect.map(({ id, formFields }) => (
        <TabPanel tabIdx={tabIdx} idx={id} key={id}>
          <FormManager info={info} handleSubmit={onKeyDown} fields={formFields} error={error} />
        </TabPanel>
      ))}
    </Box>
  );
}

function TabPanel({ children, tabIdx, idx }) {
  if (tabIdx === idx) return <Box sx={{ p: 3, pb: 1 }}>{children}</Box>;
  return null;
}
