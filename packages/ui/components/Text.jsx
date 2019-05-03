import React, { useMemo } from 'react';

import themes from '../theme';

const sizes = {
  small: { fontSize: '$typography.small.fontSize', lineHeight: '$typography.small.lineHeight' },
  medium: { fontSize: '$typography.medium.fontSize', lineHeight: '$typography.small.lineHeight' },
  large: { fontSize: '$typography.large.fontSize', lineHeight: '$typography.large.lineHeight' },
  xlarge: { fontSize: '$typography.xlarge.fontSize', lineHeight: '$typography.xlarge.lineHeight' },
};

const weights = {
  light: '$typography.weight.light',
  regular: '$typography.weight.regular',
  semibold: '$typography.weight.semibold',
};

export default function Text({
  children,
  style,
  size = 'medium',
  weight = 'regular',
  nowrap,
  faded,
  block,
  theme = themes('light'),
}) {
  const { fontSize, lineHeight } = sizes[size];
  const fontWeight = weights[weight];

  const nowrapClass = useMemo(() => (nowrap ? theme.style({
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }) : ''), [nowrap]);

  const familyClass = useMemo(() => theme.style({
    fontFamily: '$typography.fontFamily',
  }), [theme]);

  const inlineClass = theme.style({
    fontSize,
    fontWeight,
    lineHeight,
    display: block ? 'block' : 'inline-block',
    color: faded ? '$palette.text.secondary' : '$palette.text.primary',
  });

  const classes = [nowrapClass, familyClass, inlineClass];

  return (
    <span className={classes.join(' ')} style={style}>
      {children}
    </span>
  );
}
