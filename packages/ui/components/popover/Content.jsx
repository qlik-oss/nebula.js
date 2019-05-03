import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
} from 'react';

import { oppositeDock, positionToElement } from 'react-leonardo-ui/src/positioner';

import themes from '../../theme';

export default function PopoverContent({
  children,
  alignTo,
  theme = themes('light'),
}) {
  const [p, setP] = useState(null);
  const ref = useRef(null);

  const {
    container,
    arrowContent,
    arrowLeft,
    arrowTop,
    arrowBottom,
    arrowRight,
  } = useMemo(() => ({
    container: theme.style({
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '$shape.borderRadius',
      margin: 'auto',
      minWidth: '250px',
      border: '1px solid transparent',
      zIndex: '1021',
      backgroundColor: '$palette.background.lightest',
      borderColor: '$palette.black.05',
      boxShadow: '$shadows.3',
    }),
    arrowContent: theme.style({
      position: 'absolute',
      '&::before': {
        content: '""',
        position: 'absolute',
        width: 0,
        height: 0,
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        width: 0,
        height: 0,
      },
    }),
    arrowTop: theme.style({
      position: 'absolute',
      top: 0,
      '&::before': {
        left: '-8px',
        bottom: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderBottom: '8px solid $palette.black.05',
      },
      '&::after': {
        left: '-8px',
        bottom: '-1px',
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderBottom: '8px solid $palette.background.lightest',
      },
    }),
    arrowBottom: theme.style({
      position: 'absolute',
      bottom: 0,
      '&::before': {
        left: '-8px',
        top: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderTop: '8px solid $palette.black.05',
      },
      '&::after': {
        left: '-8px',
        top: '-1px',
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderTop: '8px solid $palette.background.lightest',
      },
    }),
    arrowLeft: theme.style({
      position: 'absolute',
      left: 0,
      top: '50%',
      '&::before': {
        top: '-8px',
        right: 0,
        borderRight: '8px solid $palette.black.05',
        borderTop: '8px solid transparent',
        borderBottom: '8px solid transparent',
      },
      '&::after': {
        top: '-8px',
        right: '-1px',
        borderRight: '8px solid $palette.background.lightest',
        borderTop: '8px solid transparent',
        borderBottom: '8px solid transparent',
      },
    }),
    arrowRight: theme.style({
      position: 'absolute',
      left: 0,
      top: '50%',
      '&::before': {
        top: '-8px',
        left: 0,
        borderLeft: '8px solid $palette.black.05',
        borderTop: '8px solid transparent',
        borderBottom: '8px solid transparent',
      },
      '&::after': {
        top: '-8px',
        left: '-1px',
        borderLeft: '8px solid $palette.background.lightest',
        borderTop: '8px solid transparent',
        borderBottom: '8px solid transparent',
      },
    }),
  }), [theme]);

  const arrows = {
    left: arrowLeft,
    right: arrowRight,
    top: arrowTop,
    bottom: arrowBottom,
  };

  const style = {
    visibility: p ? 'visible' : 'hidden',
    position: 'absolute',
    maxWidth: '500px',
    top: p ? `${p.position.top}px` : '-99999px',
    left: p ? `${p.position.left}px` : '-99999px',
  };

  useEffect(() => {
    const pp = positionToElement(ref.current, alignTo, 'bottom', {
      dock: 'bottom',
      offset: 8,
      minWindowOffset: 8,
      minEdgeOffset: 4,
    });
    setP(pp);
  }, [alignTo]);

  const arrow = {
    dock: '',
    style: {},
  };
  if (p) {
    arrow.dock = oppositeDock(p.dock);
    if (arrow.dock === 'top' || arrow.dock === 'bottom') {
      arrow.style.left = `${p.toPosition.left - p.position.left}px`;
    } else {
      arrow.style.top = `${p.toPosition.top - p.position.top}px`;
    }
  }
  const arrowElem = (
    <div
      className={[arrowContent, arrows[arrow.dock]].join(' ')}
      style={arrow.style}
    />
  );
  return (
    <div
      className={container}
      ref={ref}
      role="dialog"
      style={style}
    >
      {children}
      {arrowElem}
    </div>
  );
}
