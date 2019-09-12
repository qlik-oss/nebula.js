import SvgIcon from './SvgIcon';

const tick = props => ({
  ...props,
  d: 'M6,10 L13,3 L15,5 L8,12 L6,14 L1,9 L3,7 L6,10 Z',
});

export default props => SvgIcon(tick(props));
export { tick };
