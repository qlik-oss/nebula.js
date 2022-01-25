module.exports = {
  fromJsdoc: {
    glob: [
      '!*.spec.js',
      '../nucleus/src/**/*.js',
      '../nucleus/src/**/*.jsx',
      '../supernova/src/**/*.js',
      '../locale/src/translator.js',
      '../theme/src/**/*.js',
      '../conversion/src/**/*.js',
    ],
    api: {
      stability: 'stable',
    },
    output: {
      sort: {
        alpha: false,
      },
      file: './api-spec/spec.json',
    },
    parse: {
      types: {
        undefined: {},
        'EngineAPI.INxAppLayout': {},
        'EngineAPI.IGenericObject': {},
        'EngineAPI.IGlobal': {},
        'EngineAPI.IApp': {
          url: 'https://github.com/qlik-oss/enigma.js/blob/master/docs/api.md#generated-api',
        },
        'EngineAPI.IGenericObjectLayout': {
          url: 'https://core.qlik.com/services/qix-engine/apis/qix/definitions/#genericobjectlayout',
        },
        'EngineAPI.IGenericObjectProperties': {
          url: 'https://core.qlik.com/services/qix-engine/apis/qix/definitions/#genericobjectproperties',
        },
        'EngineAPI.INxDimension': {
          url: 'https://core.qlik.com/services/qix-engine/apis/qix/definitions/#nxdimension',
        },
        'EngineAPI.INxMeasure': {
          url: 'https://core.qlik.com/services/qix-engine/apis/qix/definitions/#nxmeasure',
        },
      },
    },
  },
};
