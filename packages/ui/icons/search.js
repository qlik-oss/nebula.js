import SvgIcon from './SvgIcon';

const search = (props) => ({
  ...props,
  shapes: [
    {
      type: 'path',
      attrs: {
        d: 'M8.588 11.415a6 6 0 1 1 2.828-2.829l4.101 4a1.5 1.5 0 0 1 .014 2.134l-.707.707a1.5 1.5 0 0 1-2.108.014l-4.128-4.026ZM11 6A5 5 0 1 0 1 6a5 5 0 0 0 10 0Zm-1.52 4.888 3.934 3.837a.5.5 0 0 0 .703-.005l.707-.707a.5.5 0 0 0-.005-.711l-3.926-3.829a6.034 6.034 0 0 1-1.413 1.415Z',
      },
    },
  ],
});
export default (props) => SvgIcon(search(props));
export { search as remove };
