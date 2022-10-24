import React from 'react';
import AppList from './AppList';
import SelectEngine from './SelectEngine/SelectEngine';
import ConnectionSteps from './ConnectionSteps';
import { ThemeWrapper } from '../ThemeWrapper';
// import { useInfo, useConnection } from '../../hooks';

// import { useRootContext } from '../../contexts/RootContext';

export default function Hub() {
  // const { glob, info, treatAsDesktop, error, activeStep } = useRootContext();

  const { info } = useInfo();
  const { glob, treatAsDesktop, error, activeStep } = useConnection({ info });

  if (!info) return null;
  if (info.engineUrl && !(glob || error)) return null;

  return (
    <ThemeWrapper themeName="light">
      <ConnectionSteps glob={glob} error={error} activeStep={activeStep} />
      {glob ? (
        <AppList info={info} glob={glob} treatAsDesktop={treatAsDesktop} />
      ) : (
        <SelectEngine info={info} error={error} />
      )}
    </ThemeWrapper>
  );
}
