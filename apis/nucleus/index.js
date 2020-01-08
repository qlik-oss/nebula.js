if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/nucleus.js');
} else {
  module.exports = require('./dist/nucleus.dev.js');
}
