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
      Doc: {
        url: 'https://qlik.dev/apis/json-rpc/qix/doc#%23%2Fentries%2FDoc',
      },
      GenericObjectLayout: {
        url: 'https://qlik.dev/apis/json-rpc/qix/schemas#%23%2Fdefinitions%2Fschemas%2Fentries%2FGenericObjectLayout',
      },
      GenericObjectProperties: {
        url: 'https://qlik.dev/apis/json-rpc/qix/schemas#%23%2Fdefinitions%2Fschemas%2Fentries%2FGenericObjectProperties',
      },
      NxDimension: {
        url: 'https://qlik.dev/apis/json-rpc/qix/schemas#%23%2Fdefinitions%2Fschemas%2Fentries%2FNxDimension',
      },
      NxMeasure: {
        url: 'https://qlik.dev/apis/json-rpc/qix/schemas#%23%2Fdefinitions%2Fschemas%2Fentries%2FNxMeasure',
      },
    },
  },
};
