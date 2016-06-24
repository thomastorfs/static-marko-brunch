'use strict';

const _ = require('lodash');
const fs = require('fs');
const umd = require('umd-wrapper');
const path = require('path');
const marko = require('marko');
const mkdirp = require('mkdirp');

class StaticMarkoCompiler {
  constructor(brunchConfig) {
    // Get the Brunch configuration for marko.
    this.config = brunchConfig && brunchConfig.plugins && brunchConfig.plugins.static_marko || {};

    // Complete the config with defaults where necessary.
    this.config = _.defaults(this.config, {
      createJs: true,
      templatePath: 'app/views',
      jsTemplatePath: 'app/views/content',
    });

    // Get the data.
    this.templateData = brunchConfig.templateData || {};

    // Also store the public path for later usage.
    this.publicPath = brunchConfig.paths.public;

    // Enable hot reload.
    require('marko/hot-reload').enable();
  }

  compile(params) {
    return new Promise((resolve, reject) => {
      let config, publicPath, result, error;

      // Store the config in a local variable so functions can use it.
      config = this.config;
      publicPath = this.publicPath;

      try {
        // Render the template.
        let template;
        template = marko.load(params.path, {writeToDisk: false});
        template.render(this.templateData, function(err, html, out) {
          if (err) {
            console.error('An error occurred: ' + err);
            return;
          }

          // Create the JS result.
          // Since everything is static, we do not use the built-in Marko
          // compiler in order to generate CommonJS modules, at least for now.
          if (config.createJs && params.path.indexOf(config.jsTemplatePath) === 0) {
            result = umd(JSON.stringify(html));
          }
          // Create the static file.
          else if (params.path.indexOf(config.templatePath) === 0) {
            // Define the output path.
            let outputPath = path.join(
              publicPath,
              path.relative(config.templatePath, path.dirname(params.path)),
              path.basename(params.path, '.marko') + '.html'
            );

            // Create the output directory if it doesn't exist yet.
            mkdirp(path.dirname(outputPath));

            // Write the resulting html to the destination
            fs.writeFile(outputPath, html);
          }

          // Let marko handle the modified file.
          require('marko/hot-reload').handleFileModified(params.path);
        });
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
