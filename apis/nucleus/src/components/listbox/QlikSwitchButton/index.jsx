import React, { useCallback } from 'react';

import QlikSwitchWithLabel from './QlikSwitchWithLabel';

export default function QlikSwitchButton({ config: c, setOptions }) {
  const setOptionsWrapper = (overrides = {}) => {
    setOptions((o) => {
      const ALLOWED_OPTS = ['checkboxes', 'search', 'toolbar', 'rangeSelect', 'dense'];
      const disallowed = [];
      const validOverrides = Object.fromEntries(
        Object.entries(overrides).filter(([ovKey]) => {
          const isAllowed = ALLOWED_OPTS.includes(ovKey);
          if (!isAllowed) {
            disallowed.push(ovKey);
          }
          return isAllowed;
        })
      );
      if (disallowed.length) {
        throw new Error(`Setting these Listbox option(s) is disallowed: ${disallowed.join(', ')}.`);
      }
      return { ...o, ...validOverrides };
    });
  };

  const onSwitchChange = useCallback(
    (on) => {
      if (!c) {
        return;
      }
      if (c.option) {
        setOptionsWrapper({ [c.option]: c.invert ? !on : on });
      }
      if (c.onChange) {
        c.onChange(on, { setOptions: setOptionsWrapper });
      }
    },
    [c, setOptionsWrapper]
  );

  return (
    <QlikSwitchWithLabel
      label={c.label}
      helperText={c.helperText}
      startOn={c.startOn}
      onChange={onSwitchChange}
      className="switchButton"
      styling={{
        iconOn: c.iconOn,
        iconOff: c.iconOff,
      }}
    />
  );
}
