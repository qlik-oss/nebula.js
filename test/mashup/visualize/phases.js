const baseProps = {
  qInfo: {
    qType: 'doesnt matter',
  },
  visualization: 'my-chart',
  qHyperCubeDef: {},
};

const badType = {
  ...baseProps,
  visualization: 'voooz',
};

const calcCond = {
  ...baseProps,
  qHyperCubeDef: {
    qCalcCondition: {
      qCond: { qv: '0' },
    },
    qDimensions: [{ qDef: { qFieldDefs: ['=a'] } }],
    qMeasures: [{ qDef: { qDef: '=1' } }],
  },
};

const cubeError = {
  ...baseProps,
  qHyperCubeDef: {
    qMode: 'S',
    qMeasures: [{}],
    qInterColumnSortOrder: [-2],
  },
};

const fulfilled = {
  ...baseProps,
  qHyperCubeDef: {
    qDimensions: [{ qDef: { qFieldDefs: ['=a'] } }],
    qMeasures: [{ qDef: { qDef: '=1' } }],
  },
};

const longRunning = {
  ...baseProps,
  qHyperCubeDef: {
    qInitialDataFetch: [
      {
        qTop: 0,
        qLeft: 0,
        qWidth: 2,
        qHeight: 10,
      },
    ],
    qDimensions: [{ qDef: { qFieldDefs: ['=a'] } }],
    qMeasures: [{ qDef: { qDef: 'sse.heavy(4001)' } }],
  },
};

const { useElement, useLayout } = window.stardust;
const chart = {
  qae: {
    data: {
      targets: [
        {
          path: '/qHyperCubeDef',
          dimensions: { min: 1, description: () => 'Some dimension' },
          measures: { min: 1 },
        },
      ],
    },
  },
  component() {
    const element = useElement();
    const layout = useLayout();

    element.innerHTML = `
    <div>
      <div class="rendered">Success!</div>
      <div class="pages">${layout.qHyperCube.qDataPages[0] && layout.qHyperCube.qDataPages[0].qMatrix[0][1].qText}</div>
    </div>
    `;
  },
};

// eslint-disable-next-line
const configured = stardust.embed.createConfiguration({
  types: [
    {
      name: 'my-chart',
      load: () => Promise.resolve(chart),
    },
  ],
});

export default function phases({ app }) {
  let viz;
  let obj;
  return {
    phases: [
      {
        name: 'Init as bad type',
        action: async () => {
          if (obj) {
            throw new Error('Already initiated');
          }
          obj = await app.createSessionObject(badType);
          viz = await configured(app).render({
            element: document.querySelector('.viz'),
            id: obj.id,
          });
        },
      },
      {
        name: 'Set proper type',
        action: () => {
          obj.setProperties(baseProps);
        },
      },
      {
        name: 'Set calc condition',
        action: () => {
          obj.setProperties(calcCond);
        },
      },
      {
        name: 'Hypercube error',
        action: () => {
          obj.setProperties(cubeError);
        },
      },
      {
        name: 'Fulfill requirements',
        action: () => {
          obj.setProperties(fulfilled);
        },
      },
      {
        name: 'Long running query',
        action: () => {
          obj.setProperties(longRunning);
        },
      },
      {
        name: 'Destroy',
        action: () => {
          viz.destroy();
        },
      },
    ],
  };
}
