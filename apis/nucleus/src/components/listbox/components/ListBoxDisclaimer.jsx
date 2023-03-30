import { Tooltip, Typography } from '@mui/material';
import React, { useContext } from 'react';
import { styled } from '@mui/material/styles';
import InstanceContext from '../../../contexts/InstanceContext';

const StyledText = styled(Typography, { shouldForwardProp: (p) => !['width', 'dense'].includes(p) })(
  ({ width, dense }) => ({
    minWidth: `${width}px`,
    textAlign: 'center',
    fontSize: `${dense ? '12px' : '14px'}`,
    ...(dense && {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      width,
    }),
  })
);

export default function ListBoxDisclaimer({ width, text, dense, tooltip }) {
  const { translator } = useContext(InstanceContext);

  return (
    <Tooltip title={tooltip ? translator.get(text) : ''}>
      <StyledText width={width} dense={dense} component="div" variant="body1" py="12px">
        {translator.get(text)}
      </StyledText>
    </Tooltip>
  );
}
