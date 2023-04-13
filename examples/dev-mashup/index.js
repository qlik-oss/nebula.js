import { embed } from '@nebula.js/stardust';
import bar from '@nebula.js/sn-bar-chart';
import line from '@nebula.js/sn-line-chart';
import connect from './connect';

function init() {
  connect().then((app) => {
    const nebbie = embed(app, {
      types: [
        {
          name: 'bar',
          load: () => Promise.resolve(bar),
        },
        {
          name: 'line',
          load: () => Promise.resolve(line),
        },
      ],
    });

    nebbie.selections().then((s) => s.mount(document.querySelector('.toolbar')));
    nebbie.field('Alpha').then((s) => s.mount(document.querySelector('.listbox')));

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
