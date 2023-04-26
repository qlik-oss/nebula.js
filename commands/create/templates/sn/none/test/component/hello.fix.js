export default function fixture() {
  return {
    type: 'hello',
    genericObjects: [
      {
        getLayout() {
          return {
            qInfo: {
              qId: 'bb8',
            },
            visualization: 'hello',
          };
        },
      },
    ],
  };
}
