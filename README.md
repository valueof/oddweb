![oddweb](https://raw.github.com/antonkovalyov/oddweb/master/logo.jpg)

## oddweb—super simple static site generator

Oddweb is a small program written in JavaScript that takes a bunch of files
and generates a static website for you. It is similar to Jekyll and others.

It was written for [the JSHint website](http://jshint.com). Before that,
JSHint was using Jekyll but I got tired of dealing with Ruby gems on all
my computers. Oddweb works perfectly well when installed as a local NPM
module.

### Features

Oddweb currently supports only plain HTML, Handlebars templates and Markdown
files. But it's super easy to write plugins for it so there's that.

### How to

Here I'll show how I use oddweb for [my personal website](http://anton.kovalyov.net/).
You can find full source code here: [antonkovalyov/home](https://github.com/antonkovalyov/home/).

First of all, my website has a package.json file to manage dependencies and all
that:

```json
{
  "name": "anton.kovalyov.net",
  "version": "0.0.0",
  "description": "No Admittance",
  "main": "index.js",

  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "oddweb dev .",
    "build": "oddweb build ."
  },

  "dependencies": {
    "oddweb": "~0.0.2"
  },

  "oddwebPlugins": [
    "core/time",
    "core/blog"
  ],

  "author": "Anton Kovalyov <anton@kovalyov.net>",
  "license": "BSD"
}
```

Note that **oddweb** is a normal dependency there. Also not that I use **scripts**
to add shortcuts for oddweb's commands (**dev** starts a local server, **build**
generates a production site).

There are three directories: **res** that contains files that has to be copied
as is (i.e. images), **templates** to hold Handlebars templates and **pages**
for your actual content. When I run `npm start` oddweb starts a local server
where I can try out my website. When I run `npm run-script build` oddweb
generates a static file into the **site** directory.

My website is a blog so I use a built-in plugin called **core/blog**. This plugin
expects all posts to be in the **pages/blog** subdirectory.

You can add meta-info to each file by prepending it with a JSON structure. See
[this file](https://raw.github.com/antonkovalyov/home/master/pages/blog/firefox-profiler.md) for example.

Plugins that don't start with **core/** are loaded from your site's directory. A plugin
is simply a function that takes two parameters—a site structure and handlebars instance—and returns
a modified site structure.

```javascript
// myplugin.js: this plugin replaces word 'cloud' with 'cat' on all pages.

module.exports = function (site, handlebars) {
  site.pages = site.pages.map(function (page) {
    page.data = page.data.replace(/cloud/g, "cat")
    return page
  })
  
  return site
}
```

For more examples check out core plugins in this repo and **minify.js**, **options.js**, **version.js**
in [the jshint.com repo](https://github.com/antonkovalyov/jshint.com/).

That's it. Bye.
