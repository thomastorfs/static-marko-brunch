# static-marko-brunch
This is a simple implementation of the Marko render engine for static site generation. This version allows you to compile your templates to static HTML and JS in 2 ways. There is no need to render the templates to JS. However, the JS templates can be rendered from a different directory allowing to replace parts of your static website without fetching markup from the server. In short, it allows you to create a hybrid website which both loads very fast and also allows for quick navigation.

## Example configuration
```
  plugins:
    brunch:
      createJs: true
      templatePath: 'app/views'
      jsTemplatePath: 'app/views/content'
```

## License
Copyright (c) 2016 Thomas Torfs

Licensed under the [MIT license](https://github.com/thomastorfs/static-marko-brunch/blob/master/LICENSE).