const options = {
  cwd: {
    type: 'string',
    description: 'Project directory to validate',
    default: process.cwd(),
  },
  entry: {
    type: 'string',
    description: 'Visualization entry file. Defaults to package metadata or src/index.*',
  },
  type: {
    type: 'string',
    description: 'Visualization type used in smoke fixture rendering',
  },
  steps: {
    type: 'string',
    description: 'Comma separated validation steps: static,smoke',
    default: 'static,smoke',
  },
  smokeTimeout: {
    type: 'number',
    description: 'Milliseconds to wait for onRender in smoke step',
    default: 30000,
  },
  dataProfile: {
    type: 'string',
    description: 'Mock data profile for smoke fixture: auto or mekko',
    default: 'auto',
  },
  reportFile: {
    type: 'string',
    description: 'Optional path to write JSON report',
  },
};

export default (yargs) => yargs.options(options);
