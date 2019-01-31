import schema from '../../node_modules/enigma.js/schemas/3.2.json';

const connect = () => {
  const createConnection = () => window.enigma.create({
    schema,
    url: `ws://${window.location.hostname || 'localhost'}:9076/app/temp-test`,
  }).open().then(qix => qix.createSessionApp());

  return createConnection().then(app => app.setScript(`
  Characters:
  Load Chr(RecNo()+Ord('A')-1) as Alpha, RecNo() as Num autogenerate 26;
    
  ASCII:
  Load 
    if(RecNo()>=65 and RecNo()<=90,RecNo()-64) as Num,
    Chr(RecNo()) as AsciiAlpha, 
    RecNo() as AsciiNum
  autogenerate 85
    Where (RecNo()>=65 and RecNo()<=126) or RecNo()>=160;
  `).then(() => app.doReload().then(() => app)));
};

connect().then((app) => {
  const sn = {
    component: {
      mounted(element) {
        element.textContent = 'Hello!'; // eslint-disable-line no-param-reassign
      },
    },
  };

  const nebbie = window.nucleus(app)
    .load((type, config) => config.Promise.resolve(sn));

  nebbie.create({
    type: 'bar',
  }, {
    element: document.querySelector('#chart-container'),
    props: {
      showTitles: true,
      title: 'Yeah!',
      subtitle: 'smaller title',
      footnote: 'foooooter',
    },
  });
});
