import preact from 'preact';

import styled from './styled';

const sizes = {
  small: { fontSize: '12px', lineHeight: '16px' },
  medium: { fontSize: '14px', lineHeight: '16px' },
  large: { fontSize: '16px', lineHeight: '24px' },
  xlarge: { fontSize: '24px', lineHeight: '32px' },
};

const weights = {
  light: 300,
  regular: 400,
  semibold: 600,
};

export default function Text({
  children,
  style,
  size = 'medium',
  weight = 'regular',
  nowrap,
  faded,
  block,
}) {
  const { fontSize, lineHeight } = sizes[size];
  const fontWeight = weights[weight];

  const nowrapStyle = nowrap ? {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } : {};

  const family = {
    fontFamily: '$fontFamily',
  };

  const inlineStyle = {
    fontSize,
    fontWeight,
    lineHeight,
    display: block ? 'block' : 'inline-block',
    color: faded ? '$alpha55' : '',
  };
  const classes = styled([family, inlineStyle, nowrapStyle, style]);
  return (
    <span className={classes.join(' ')}>
      {children}
    </span>
  );
}
