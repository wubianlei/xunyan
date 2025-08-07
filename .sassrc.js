/**
 * SASS configuration to silence all deprecation warnings
 * This is especially important for taro-ui which uses deprecated syntax
 */
module.exports = {
  // Silence all deprecation warnings from dependencies
  quietDeps: true,
  // Silence all deprecation warnings
  quietDeprecation: true,
  // Custom message handler that doesn't output deprecation warnings
  logger: {
    warn: function(message) {
      if (!message.includes('Deprecation')) {
        console.warn(message);
      }
    },
    debug: function() {},
  }
}
