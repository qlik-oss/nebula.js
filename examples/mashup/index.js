connect().then((app) => {
  const sn = {
    component: {
      mounted(element) {
        element.textContent = 'Hello';
      },
    },
  };

  const nebbie = window.nucleus(app)
    .load((type, config) => config.Promise.resolve(sn));

  document.querySelectorAll('.object').forEach((el) => {
    const type = el.getAttribute('data-type');

    nebbie.create({
      type,
    }, {
      element: el,
    });
  });
});
