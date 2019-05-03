import React, { useMemo } from 'react';

import themes from '../theme';

export default function ButtonInline({
  children,
  disabled,
  theme = themes('light'),
  ...props
}) {
  const s = {
  };

  const className = useMemo(() => theme.style({
    padding: '$spacing.4',
    border: '0px solid transparent',
    background: 'transparent',
    borderRadius: '$shape.borderRadius',
    cursor: 'pointer',
    color: '$palette.text.primary',
    font: 'normal 14px/0 $typography.fontFamily',

    '&:hover': {
      background: '$palette.background.hover',
    },

    '&:active': {
      background: '$palette.background.active',
    },

    '&:disabled': {
      opacity: '0.3',
      cursor: 'default',
    },
  }), [theme]);

  return (
    <button
      className={className}
      type="button"
      disabled={disabled}
      style={s}
      {...props}
    >
      {children}
    </button>
  );
}
