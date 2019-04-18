import preact from 'preact';

import styled from './styled';

export default function ButtonInline({
  children,
  disabled,
  ...props
}) {
  const s = {
  };

  const classes = styled({
    padding: '8px',
    border: '0px solid transparent',
    background: 'transparent',
    borderRadius: '2px',
    cursor: 'pointer',
    color: '$grey25',
    font: 'normal 14px/0 "Source Sans Pro", Arial, sans-serif',

    '&:hover': {
      background: 'rgba(0, 0, 0, 0.03)',
    },

    '&:active': {
      background: 'rgba(0, 0, 0, 0.1)',
    },

    '&:disabled': {
      opacity: '0.3',
      cursor: 'default',
    },
  });

  return (
    <button
      className={classes.join(' ')}
      type="button"
      disabled={disabled}
      style={s}
      {...props}
    >
      {children}
    </button>
  );
}
