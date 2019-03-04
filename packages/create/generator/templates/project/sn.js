import properties from './object-properties';

export default function sn(env) {
  return {
    qae: {
      properties,
    },
    component: {
      created() {},
      mounted(element) {
        console.log(env);
        this.element = element;
        this.element.innerHTML = '<div>Hello!</div>';
      },
      render({
        layout,
        context,
      }) {
        console.log(layout, context);
      },
      resize() {},
      willUnmount() {},
      destroy() {},
    },
  };
}
