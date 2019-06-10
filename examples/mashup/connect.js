window.connect = function connect() {
  const loadSchema = () => fetch('https://unpkg.com/enigma.js/schemas/3.2.json').then(response => response.json());

  const createConnection = () => loadSchema().then(schema => window.enigma.create({
    schema,
    url: `ws://${window.location.hostname || 'localhost'}:9076/app/${Date.now()}`,
  }).open().then(qix => qix.createSessionApp()));

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
