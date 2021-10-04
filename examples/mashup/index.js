/* eslint-disable */
const { useElement } = stardust;

connect().then((app) => {
  const sn = {
    component() {
      useElement().innerHTML = 'Hello';
    },
  };

  const nebbie = stardust.embed(app, {
    types: [
      {
        name: 'foo',
        load: () => Promise.resolve(sn),
      },
    ],
  });

  nebbie.selections().then((s) => s.mount(document.querySelector('.toolbar')));

  document.querySelectorAll('.object').forEach((el) => {
    const type = el.getAttribute('data-type');

    nebbie.render({
      type,
      element: el,
    });
  });
});
