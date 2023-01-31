import { Tooltip, Typography } from '@mui/material';
import React, { useContext } from 'react';
import { styled } from '@mui/material/styles';
import InstanceContext from '../../../contexts/InstanceContext';

export default function ListBoxDisclaimer({ width, text, dense, tooltip }) {
  const { translator } = useContext(InstanceContext);
  const StyledText = styled(Typography)(() => ({
    minWidth: `${width}px`,
    textAlign: 'center',
    fontSize: `${dense ? '12px' : '14px'}`,
    ...(dense && {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      width,
    }),
  }));

  return (
    <Tooltip title={tooltip ? translator.get(text) : ''}>
      <StyledText component="div" variant="body1" py="12px">
        {translator.get(text)}
      </StyledText>
    </Tooltip>
  );
}
