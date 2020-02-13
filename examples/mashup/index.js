/* eslint-disable */
const { useElement } = supernova;

connect().then(app => {
  const sn = {
    component() {
      useElement().innerHTML = 'Hello';
    },
  };

  const nebbie = window.nucleus(app, {
    load: (type, config) => Promise.resolve(sn),
  });

  nebbie.selections().then(s => s.mount(document.querySelector('.toolbar')));

  document.querySelectorAll('.object').forEach(el => {
    const type = el.getAttribute('data-type');

    nebbie.create(
      {
        type,
      },
      {
        element: el,
      }
    );
  });
});
