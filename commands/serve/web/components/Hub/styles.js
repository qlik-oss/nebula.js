import Box from '@mui/material/Box';
import { styled } from '@mui/system';
import Stepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';

export const ConnectionBoxWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(2, 2),
  backgroundColor: 'white',
  borderRadius: theme.spacing(1),
}));

export const StepperWrapper = styled(Stepper)(({ theme }) => ({
  backgroundColor: 'transparent',
  padding: theme.spacing(3),
}));

export const CustomStepLabel = styled(StepLabel, {
  shouldForwardProp: (prop) => prop !== 'shouldBePointer',
})(({ shouldBePointer = false }) => ({
  cursor: shouldBePointer ? 'pointer' : 'default',
}));
