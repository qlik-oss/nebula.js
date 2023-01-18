import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import React, { useContext } from 'react';
import InstanceContext from '../../../contexts/InstanceContext';
import ListBoxDisclaimer from './ListBoxDisclaimer';

const RootContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  zIndex: 1,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: 'white',
  width: 'calc(100% - 2px)',
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

export default function ListBoxFooter({ width, dismiss }) {
  const { translator } = useContext(InstanceContext);
  const hasDismissButton = typeof dismiss === 'function';

  return (
    <RootContainer container>
      <LeftItem>
        <ListBoxDisclaimer width={width} text="Listbox.ItemsOverflow" />
      </LeftItem>
      <RightItem>
        {hasDismissButton && (
          <Button
            type="button"
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
