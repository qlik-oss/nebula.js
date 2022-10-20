import React from 'react';
import Step from '@mui/material/Step';
import { ThemeWrapper } from '../ThemeWrapper';
import { StepperWrapper, CustomStepLabel } from './styles';

const ConnectionSteps = ({ activeStep, glob, error }) => {
  const steps = ['Connect to engine', 'Select app', 'Develop'];

  const handleStepperClick = () => {
    if (!(glob || error)) return;
    window.location.href = window.location.origin;
  };

  return (
    <ThemeWrapper themeName="dark">
      <StepperWrapper alternativeLabel activeStep={activeStep}>
        {steps.map((label, i) => (
          <Step key={label}>
            <CustomStepLabel onClick={handleStepperClick} shouldBePointer={glob || error} error={!!error && !i}>
              {label}
            </CustomStepLabel>
          </Step>
        ))}
      </StepperWrapper>
    </ThemeWrapper>
  );
};

export default ConnectionSteps;
