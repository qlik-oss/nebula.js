import React from 'react';
import AppList from './AppList';
import SelectEngine from './SelectEngine/SelectEngine';
import ConnectionSteps from './ConnectionSteps';
import { ThemeWrapper } from '../ThemeWrapper';
import { useInfo, useConnection } from '../../hooks';
import { ConnectionBoxWrapper } from './styles';

export default function Hub() {
  const { info } = useInfo();
  const { glob, treatAsDesktop, error, activeStep } = useConnection({ info });

  if (!info) return null;
  if (info.engineUrl && !(glob || error)) return null;

  return (
    <ThemeWrapper themeName="light">
      <ConnectionSteps {...{ glob, error, activeStep }} />
      <ConnectionBoxWrapper>
        {glob ? <AppList {...{ info, glob, treatAsDesktop }} /> : <SelectEngine {...{ info, error }} />}
      </ConnectionBoxWrapper>
    </ThemeWrapper>
  );
}
