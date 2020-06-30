export default function connect() {
  const loadSchema = () => fetch('/node_modules/enigma.js/schemas/3.2.json').then((response) => response.json());

  const createConnection = () =>
    loadSchema().then((schema) =>
      window.enigma
        .create({
          schema,
          url: `ws://${window.location.hostname || 'localhost'}:9076/app/${Date.now()}`,
        })
        .open()
        .then((qix) => qix.createSessionApp())
    );

  return createConnection().then((app) =>
    app
      .setScript(
        `
Characters:
Load Chr(RecNo()+Ord('A')-1) as Alpha, RecNo() as Num autogenerate 5;
`
      )
      .then(() => app.doReload().then(() => app))
  );
}
