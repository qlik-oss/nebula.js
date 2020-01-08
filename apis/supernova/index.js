if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/supernova.js');
} else {
  module.exports = require('./dist/supernova.dev.js');
}
