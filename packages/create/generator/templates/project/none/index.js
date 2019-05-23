import properties from './object-properties';
import data from './data';

export default function supernova(env) {
  return {
    qae: {
      properties,
      data,
    },
    component: {
      created() {
        console.log('created', env);
      },
      mounted(element) {
        element.innerHTML = '<div>Hello!</div>'; // eslint-disable-line
      },
      render({
        layout,
        context,
      }) {
        console.log('render', layout, context);
      },
      resize() {},
      willUnmount() {},
      destroy() {},
    },
  };
}
