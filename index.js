'use strict';

const _ = require('lodash');
const fs = require('fs');
const umd = require('umd-wrapper');
const path = require('path');
const marko = require('marko');
const mkdirp = require('mkdirp');

class StaticMarkoCompiler {
  constructor(brunchConfig) {
    // Get the Brunch configuration for marko
    this.config = brunchConfig && brunchConfig.plugins && brunchConfig.plugins.marko || {};

    // Complete the config with defaults where necessary
    this.config = _.defaults(this.config, {
      'createJs': true,
      'templatePath': 'app/views/templates',
      'jsTemplatePath': 'app/views/templates/subdir'
    });

    // Also store the public path for later usage
    this.publicPath = brunchConfig.paths.public;

    // Make sure marko doesn't write any files by itself
    require('marko/compiler').defaultOptions.writeToDisk = false;

    // Enable hot reload
    require('marko/hot-reload').enable();
  }

  compile(params) {
    return new Promise((resolve, reject) => {
      let result, error;

      try {
        let template, staticResult;

        // Let marko handle the modified file
        require('marko/hot-reload').handleFileModified(params.path);

        // Create the static file
        if (params.path.indexOf(this.config.templatePath) === 0) {
          // Define the output path
          var outputPath = path.join(
            this.publicPath,
            path.relative(this.config.templatePath, path.dirname(params.path)),
            path.basename(params.path, '.marko') + '.html'
          );

          // Create it if it doesn't exist yet
          mkdirp(path.dirname(outputPath));

          // Render the template
          template = marko.load(params.path);
          staticResult = template.renderSync();

          // Write the result to a file
          fs.writeFile(outputPath, staticResult);
        }

        // Create the JS result
        // Since everything is static, we do not use the built-in Marko
        // compiler in order to generate CommonJS modules, at least for now.
        if (this.config.createJs && params.path.indexOf(this.config.jsTemplatePath) === 0) {
          if (this.config.jsTemplatePath !== this.config.templatePath) {
            // Render the template
            template = marko.load(params.path);
            staticResult = template.renderSync();
          }
          staticResult = JSON.stringify(staticResult);
          result = umd(staticResult);
        }
      }
      catch (_error) {
        error = _error;
      }
      finally {
        if (error)
          return reject(error);

        resolve(result);
      }
    });

  }
}

StaticMarkoCompiler.prototype.brunchPlugin = true;
StaticMarkoCompiler.prototype.type = 'template';
StaticMarkoCompiler.prototype.extension = 'marko';

module.exports = StaticMarkoCompiler;




