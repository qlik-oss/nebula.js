#! /usr/bin/env node

const yargs = require('yargs');

const mashupServer = require('../test/mashup/server');
const sseServer = require('../test/fixtures/sse');

const args = yargs
  .option('start', {
    default: true,
    type: 'boolean',
    describe: 'Start the mashup server',
  })
  .option('sse', {
    default: true,
    type: 'boolean',
    describe: 'Start the SSE plugin',
  }).argv;

const { start, sse } = args;

let hasCleanedUp = false;
const services = [];

if (start) {
  let m;
  services.push({
    name: 'Mashup server',
    start: async () => {
      m = await mashupServer();
      process.env.BASE_URL = m.url;
    },
    stop: async () => {
      await m.close();
    },
  });
}

if (sse) {
  const s = sseServer;
  services.push({
    name: 'SSE plugin server',
    start: () => {
      s.start();
    },
    stop: () => s.close(),
  });
}

function cleanup() {
  if (hasCleanedUp) {
    return;
  }
  hasCleanedUp = true;
  console.log('> Stopping services');
  services.forEach(async (service) => {
    console.log(`${service.name}`);
    await service.stop();
  });
}

async function run() {
  console.log('> Starting services');

  try {
    for await (const service of services) {
      console.log(`${service.name}`);
      await service.start();
    }
    console.log('> All up and running');
  } catch (err) {
    console.error(`\x1b[31m${JSON.stringify(err)}\x1b[0m`);
    cleanup();
    throw err;
  }
}

process.on('exit', cleanup);
process.on('SIGINT', process.exit);
process.on('SIGTERM', process.exit);
process.on('uncaughtException', (err) => {
  if (!hasCleanedUp) {
    console.log(err.stack);
    process.exit(1);
  }
});

run();
