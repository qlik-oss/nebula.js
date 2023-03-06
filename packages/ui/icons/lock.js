import SvgIcon from './SvgIcon';

const lock = (props) => ({
  ...props,
  shapes: [
    {
      type: 'path',
      attrs: {
        d: 'M8 10a1 1 0 0 1 .5 1.866v.634a.5.5 0 0 1-1 0v-.634A1 1 0 0 1 8 10ZM3.625 7.035A2 2 0 0 0 2 9v5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9a2 2 0 0 0-1.625-1.965V5.383a4.375 4.375 0 0 0-8.75 0v1.652ZM3 9a1 1 0 0 1 .931-.998h8.138A1 1 0 0 1 13 9v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9Zm8.375-3.617V7h-6.75V5.383a3.375 3.375 0 0 1 6.75 0Z',
      },
    },
  ],
});
export default (props) => SvgIcon(lock(props));
export { lock };
