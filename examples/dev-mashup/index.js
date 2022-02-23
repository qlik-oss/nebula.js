import { embed } from '@nebula.js/stardust';
// import bar from '@nebula.js/sn-bar-chart';
// import line from '@nebula.js/sn-line-chart';
import connect from './connect';

function init() {
  connect().then((app) => {
    const nebbie = embed(app, {
      // types: [
      //   {
      //     name: 'bar',
      //     load: () => Promise.resolve(bar),
      //   },
      //   {
      //     name: 'line',
      //     load: () => Promise.resolve(line),
      //   },
      // ],
      toolbar: false,
    });

    nebbie.selections().then((s) => s.mount(document.querySelector('.toolbar')));
    // nebbie.field('Alpha').then((s) => s.mount(document.querySelector('.listbox')));
    nebbie.field('Dim2').then((s) =>
      s.mount(document.querySelector('.listbox'), {
        toolbar: true,
        checkboxes: true,
      })
    );
    nebbie.field('Dim1').then((s) => s.mount(document.querySelector('.listbox2'), { checkboxes: false }));
    nebbie.field('Alpha').then((s) => s.mount(document.querySelector('.listbox3'), { checkboxes: true }));

    document.querySelectorAll('.object').forEach((el) => {
      const type = el.getAttribute('data-type');

      nebbie.render({
        type,
        element: el,

        fields: ['Alpha', '=Sum(Expression1)'],
      });
    });
  });
}

init();
