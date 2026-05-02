import { embed } from '@nebula.js/stardust';
import pie from '@nebula.js/sn-pie-chart';
import bar from '@nebula.js/sn-bar-chart';
import line from '@nebula.js/sn-line-chart';
import combo from '@nebula.js/sn-combo-chart';
import connect from './connect';

let viz;
let nebbie;

async function init() {
  await connect().then((app) => {
    nebbie = embed(app, {
      types: [
        {
          name: 'pie',
          load: () => Promise.resolve(pie),
        },
        {
          name: 'bar',
          load: () => Promise.resolve(bar),
        },
        {
          name: 'line',
          load: () => Promise.resolve(line),
        },
        {
          name: 'combo',
          load: () => Promise.resolve(combo),
        },
      ],
    });

    nebbie.selections().then((s) => s.mount(document.querySelector('.toolbar')));
  });

  viz = await nebbie.render({
    type: 'pie',
    element: document.querySelector('#pie'),
    fields: ['Alpha', '=Sum(Expression1)'],
  });
}

const barChart = document.getElementById('convertToBarChart');
const lineChart = document.getElementById('convertToLineChart');
const pieChart = document.getElementById('convertToPieChart');
const comboChart = document.getElementById('convertToComboChart');
// eslint-disable-next-line unicorn/prefer-add-event-listener -- Example code; addEventListener unnecessary for demo
barChart.onclick = () => viz.convertTo('bar');
// eslint-disable-next-line unicorn/prefer-add-event-listener -- Example code; addEventListener unnecessary for demo
lineChart.onclick = () => viz.convertTo('line');
// eslint-disable-next-line unicorn/prefer-add-event-listener -- Example code; addEventListener unnecessary for demo
pieChart.onclick = () => viz.convertTo('pie');
// eslint-disable-next-line unicorn/prefer-add-event-listener -- Example code; addEventListener unnecessary for demo
comboChart.onclick = () => viz.convertTo('combo');

init();
