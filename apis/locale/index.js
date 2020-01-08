if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/locale.js');
} else {
  module.exports = require('./dist/locale.dev.js');
}
