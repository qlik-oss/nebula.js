if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/stardust.js');
} else {
  module.exports = require('./dist/stardust.dev.js');
}
