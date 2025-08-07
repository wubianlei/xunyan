/**
 * A webpack plugin to suppress SASS deprecation warnings
 */
class SuppressSassWarningsPlugin {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tap('SuppressSassWarningsPlugin', (compilation) => {
      // Clear out SASS deprecation warnings
      compilation.warnings = compilation.warnings.filter(warning => {
        // Check if the warning is from sass-loader and contains a deprecation warning
        if (warning.name === 'ModuleWarning' && 
            warning.message && 
            warning.message.includes('sass-loader') && 
            warning.message.includes('Deprecation Warning')) {
          return false; // Filter out SASS deprecation warnings
        }
        return true; // Keep other warnings
      });
    });
  }
}

module.exports = SuppressSassWarningsPlugin;
