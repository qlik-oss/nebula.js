/* global configured */
(() => {
  document.querySelectorAll('.object').forEach(element => {
    const type = element.getAttribute('data-type');
    const obj = {
      getLayout: () =>
        Promise.resolve({
          qInfo: {
            qId: 'id:',
          },
          visualization: type,
        }),
      on() {},
      once() {},
    };

    const app = {
      createSessionObject: () => Promise.resolve({}),
      getObject: () => Promise.resolve(obj),
    };

    const n = configured(app);

    n.create(
      {
        type,
      },
      {
        element,
      }
    ).then(viz => {
      element.addEventListener('click', () => {
        viz.exportImage().then(res => {
          element.setAttribute('data-captured', res.url);
        });
      });
    });
  });
})();
