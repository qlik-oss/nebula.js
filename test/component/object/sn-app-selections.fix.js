const onClick = () => {
  console.log('wh0p');
};
const sn = {
  component: {
    mounted(element) {
      element.addEventListener('click', onClick);
    },
    unmount() {
      this.element.removeListener('click', onClick);
    },
  },
};

export default function fixture() {
  return {
    type: 'sn-app-selections',
    sn,
  };
}
