const express = require('express');
const path = require('path');

async function startServer() {
  const app = express();
  const port = 8050;
  const url = `http://localhost:${port}`;
  app.use(express.static(path.resolve(__dirname)));
  app.use('/apis', express.static(path.resolve(__dirname, '../../apis')));
  app.use('/node_modules', express.static(path.resolve(__dirname, '../../node_modules')));

  let server;

  await new Promise((resolve) => {
    server = app.listen(port, () => {
      console.log(`Running rendering server at ${url}`);
      resolve();
    });
  });

  const destroy = () => {
    server.close();
  };

  return {
    url,
    destroy,
  };
}

module.exports = startServer;
