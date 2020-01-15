/* eslint import/no-extraneous-dependencies: 0 */

import { useState, useEffect, useLayout, useElement, useTheme, useTranslator, usePromise } from '@nebula.js/supernova';

function sn() {
  return {
    component: () => {
      const [count, setCount] = useState(0);
      const element = useElement();
      const translator = useTranslator();
      const theme = useTheme();
      const layout = useLayout();

      useEffect(() => {
        const listener = () => {
          setCount(prev => prev + 1);
        };
        element.addEventListener('click', listener);

        return () => {
          element.removeEventListener('click', listener);
        };
      }, [element]);

      const [v] = usePromise(
        () =>
          new Promise(r => {
            setTimeout(() => {
              r('ready!');
            }, 100);
          }),
        []
      );

      element.innerHTML = `<div>
        <div class="state">${count}</div>
        <div class="layout">${layout.showTitles}</div>
        <div class="translator">${translator.get('Common.Cancel')}</div>
        <div class="theme">${theme.getColorPickerColor({ index: 2 })}</div>
        <div class="promise">${v || 'pending'}</div>
      </div>
      `;
    },
  };
}

export default function fixture() {
  return {
    type: 'sn-mounted',
    sn,
    snConfig: {
      context: {
        permissions: ['passive', 'interact'],
      },
    },
  };
}
