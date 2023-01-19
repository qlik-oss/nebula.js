import { Paper } from '@mui/material';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import React, { useContext } from 'react';
import InstanceContext from '../../../contexts/InstanceContext';
import ListBoxDisclaimer from './ListBoxDisclaimer';

const maxWidth = 350;
const RootContainer = styled(Paper)(({ theme, left }) => ({
  position: 'absolute',
  bottom: '12px',
  display: 'flex',
  border: `1px solid ${theme.palette.divider}`,
  width: 'calc(100% - 11px)',
  maxWidth,
  left,
}));

const LeftItem = styled('div')(() => ({
  paddingRight: '10px',
  paddingLeft: '6px',
  flexGrow: 1,
}));

const RightItem = styled('div')(() => ({
  paddingRight: '10px',
  display: 'flex',
  alignItems: 'center',
}));

export default function ListBoxFooter({ text, dismiss, parentWidth = 0 }) {
  const { translator } = useContext(InstanceContext);
  const hasDismissButton = typeof dismiss === 'function';
  const left = Math.max(parentWidth / 2 - maxWidth / 2, 0);

  return (
    <RootContainer left={left}>
      <LeftItem>
        <ListBoxDisclaimer text={text} />
      </LeftItem>
      <RightItem>
        {hasDismissButton && (
          <Button
            variant="contained"
            onClick={() => {
              dismiss();
            }}
          >
            {translator.get('Listbox.Dismiss')}
          </Button>
        )}
      </RightItem>
    </RootContainer>
  );
}
