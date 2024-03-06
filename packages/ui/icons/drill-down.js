import SvgIcon from './SvgIcon';

const drillDown = (props) => ({
  ...props,
  shapes: [
    {
      type: 'path',
      attrs: {
        d: 'M7 4h9v1H7zm2 4h7v1H9zm2 4h5v1h-5zM1 4v3.526a3.5 3.5 0 0 0 3.5 3.5h2.31L5.22 9.402l.715-.7L8.7 11.527 5.935 14.35l-.714-.7 1.59-1.624H4.5a4.5 4.5 0 0 1-4.5-4.5V4z',
      },
    },
  ],
});
export default (props) => SvgIcon(drillDown(props));
export { drillDown };
