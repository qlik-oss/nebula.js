export default function fixture() {
  return {
    type: 'react-chart',
    genericObjects: [
      {
        getLayout() {
          return {
            qInfo: { qId: 'react1' },
            visualization: 'react-chart',
            title: 'Hello React',
          };
        },
      },
    ],
  };
}
