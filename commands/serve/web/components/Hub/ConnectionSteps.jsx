import React from 'react';
import Step from '@mui/material/Step';
import { ThemeWrapper } from '../ThemeWrapper';
import { StepperWrapper, CustomStepLabel } from './styles';
import { useNavigate } from 'react-router-dom';

import { useRootContext } from '../../contexts/RootContext';

const ConnectionSteps = () => {
  const navigate = useNavigate();
  const { activeStep, glob, error, setError } = useRootContext();

  const steps = ['Connect to engine', 'Select app', 'Develop'];

  const handleStepperClick = () => {
    if (!(glob || error)) return;

    setError();
    navigate('/');
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
