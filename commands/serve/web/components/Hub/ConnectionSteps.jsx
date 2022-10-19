import React from 'react';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
// import { createTheme, ThemeProvider, StyledEngineProvider } from '@nebula.js/ui/theme';
import { ThemeWrapper } from '../ThemeWrapper';

// const themeDark = createTheme('dark');

const steps = ['Connect to an engine', 'Select an app', 'Develop'];

const ConnectionSteps = ({ activeStep, glob, error, reset }) => {
  return (
    // <StyledEngineProvider injectFirst>
    //   <ThemeProvider theme={themeDark}>
    <ThemeWrapper themeName="dark">
      <Stepper alternativeLabel activeStep={activeStep} style={{ backgroundColor: 'transparent', padding: 24 }}>
        {steps.map((label, i) => (
          <Step key={label}>
            {i ? (
              <StepLabel>{label}</StepLabel>
            ) : (
              <StepLabel
                onClick={glob || error ? reset : null}
                error={!!error}
                style={{
                  cursor: glob || error ? 'pointer' : 'default',
                }}
              >
                {label}
              </StepLabel>
            )}
          </Step>
        ))}
      </Stepper>
    </ThemeWrapper>
    //   </ThemeProvider>
    // </StyledEngineProvider>
  );
};

export default ConnectionSteps;
