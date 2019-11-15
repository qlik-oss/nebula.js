/* eslint import/no-amd: 0 */
/* global define */

define([], function s() {
  const sn = {
    component: {
      mounted(element) {
        element.textContent = 'Hello engine!'; // eslint-disable-line no-param-reassign
      },
    },
  };

  return sn;
});
