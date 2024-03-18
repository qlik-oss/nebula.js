import SvgIcon from './SvgIcon';

const cyclic = (props) => ({
  ...props,
  shapes: [
    {
      type: 'path',
      attrs: {
        d: 'M 6 2 h 10 V 1 H 6 Z m 5 5 h 5 V 6 h -5 Z m 5 5 h -5 v -1 h 5 Z M 5 10 h 1 v 2.663 a 3.5 3.5 0 1 0 -2.922 0.036 l -0.406 0.914 A 4.501 4.501 0 1 1 7.329 13 H 9 v 1 H 5 Z',
      },
    },
  ],
});
export default (props) => SvgIcon(cyclic(props));
export { cyclic };
