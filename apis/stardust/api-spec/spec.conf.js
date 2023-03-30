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
      '../enigma-mocker/src/**/*.js',
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
          url: 'https://qlik.dev/apis/json-rpc/qix/doc#%23%2Fentries%2FDoc',
        },
        'EngineAPI.IGenericObjectLayout': {
          url: 'https://qlik.dev/apis/json-rpc/qix/schemas#%23%2Fdefinitions%2Fschemas%2Fentries%2FGenericObjectLayout',
        },
        'EngineAPI.IGenericObjectProperties': {
          url: 'https://qlik.dev/apis/json-rpc/qix/schemas#%23%2Fdefinitions%2Fschemas%2Fentries%2FGenericObjectProperties',
        },
        'EngineAPI.INxDimension': {
          url: 'https://qlik.dev/apis/json-rpc/qix/schemas#%23%2Fdefinitions%2Fschemas%2Fentries%2FNxDimension',
        },
        'EngineAPI.INxMeasure': {
          url: 'https://qlik.dev/apis/json-rpc/qix/schemas#%23%2Fdefinitions%2Fschemas%2Fentries%2FNxMeasure',
        },
        Emitter: {
          url: 'https://nodejs.org/api/events.html#class-eventemitter',
        },
      },
    },
  },
  toDts: {
    spec: './api-spec/spec.json',
    output: {
      file: './types/index.d.ts',
    },
    dependencies: {
      references: ['qlik-engineapi'],
    },
  },
};
