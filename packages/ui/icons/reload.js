import SvgIcon from './SvgIcon';

const reload = (props) => ({
  ...props,
  shapes: [
    {
      type: 'path',
      attrs: {
        d: 'M1 8a7 7 0 1 1 10 6.326V11h-1v5h5v-1h-3.124A8 8 0 1 0 8 16v-1a7 7 0 0 1-7-7Z',
      },
    },
  ],
});
export default (props) => SvgIcon(reload(props));
export { reload };
