import React from 'react';

import { IconButton } from '@mui/material';

import SvgIcon from '@nebula.js/ui/icons/SvgIcon';
import { useTheme } from '@nebula.js/ui/theme';

import useActionState from '../hooks/useActionState';

/**
 * @interface
 * @extends HTMLElement
 * @since 2.0.0
 */
const ActionElement = {
  /** @type {'njs-cell-action'} */
  className: 'njs-cell-action',
};

const Item = React.forwardRef(({ ariaExpanded = false, item, addAnchor = false }, ref) => {
  const theme = useTheme();
  const { hidden, disabled, style, hasSvgIconShape } = useActionState(item);
  if (hidden) return null;

  const spacing = Number.parseInt(theme.spacing(0.5), 10);

  const handleKeyDown = item.keyboardAction
    ? (e) => ['Enter', ' ', 'Spacebar'].includes(e.key) && item.keyboardAction()
    : null;

  return (
    <IconButton
      ref={!addAnchor ? ref : null}
      title={item.label}
      onClick={item.action}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      style={style}
      className={ActionElement.className}
      size="large"
      disableRipple
      aria-expanded={ariaExpanded}
      aria-controls="moreMenuList"
    >
      {hasSvgIconShape && SvgIcon(item.getSvgIconShape())}
      {addAnchor && (
        <div
          ref={ref}
          style={{
            bottom: -spacing,
            right: 0,
            position: 'absolute',
            width: '100%',
            height: 0,
          }}
        />
      )}
    </IconButton>
  );
});

export default Item;
