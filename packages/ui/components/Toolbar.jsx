import React, { useMemo } from 'react';

import themes from '../theme';

export default function Toolbar({
  children,
  style,
  theme = themes('light'),
}) {
  const className = useMemo(() => theme.style({
    background: '$palette.grey.98',
    color: '$palette.text.primary',
    height: '48px',
    fontFamily: '$typography.fontFamily',
  }), [theme]);

  return (
    <div
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}
