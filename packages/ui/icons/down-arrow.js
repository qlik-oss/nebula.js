import SvgIcon from './SvgIcon';

const downArrow = props => ({
  ...props,
  shapes: [{ type: 'path', attrs: { d: 'M8,9 L12.5,4.5 L14,6 L9.5,10.5 L8,12 L2,6 L3.5,4.5 L8,9 Z' } }],
});
export default props => SvgIcon(downArrow(props));
export { downArrow };
