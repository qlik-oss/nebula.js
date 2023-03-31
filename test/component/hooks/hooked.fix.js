export default function fixture() {
  return {
    type: 'sn-mounted',
    instanceConfig: {
      flags: {
        MAGIC_FLAG: true,
      },
    },
    snConfig: {
      options: {
        myOption: 'opts',
      },
      events: ['somethingEmitted'],
    },
    genericObjects: [
      {
        getLayout() {
          return {
            qInfo: { qId: 'bb8' },
            visualization: 'sn-mounted',
            showTitles: true,
          };
        },
      },
    ],
  };
}
