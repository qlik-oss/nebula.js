module.exports = {
  glob: ['./src/**/*.js', '!./src/**/*.spec.js', '!./src/hooks/useObjectSelections.js'],
  api: {
    stability: 'experimental',
    properties: {
      'x-qlik-visibility': 'public',
    },
    visibility: 'public',
  },
  output: {
    file: './spec/spec.json',
  },
  parse: {
    types: {
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
    },
  },
};
