import SvgIcon from './SvgIcon';

const filter = (props) => ({
  ...props,
  shapes: [
    {
      type: 'path',
      attrs: {
        d: 'M14.07 0a1 1 0 0 1 .816 1.577L10 8.5v4.398a1 1 0 0 1-.532.884l-2.734 1.445A.5.5 0 0 1 6 14.785V8.5L1.112 1.577A1 1 0 0 1 1.93 0zm0 1H1.93L7 8.183v5.772l2-1.057V8.183z',
      },
    },
  ],
});
export default (props) => SvgIcon(filter(props));
export { filter };
