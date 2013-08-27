"use strict";

var sh = require("shelljs")
var oddweb = require("./index.js")
var t = {}

t.setUp = function (cb) {
  sh.mkdir("./tmp")
  sh.cp("-R", "./fixtures/*", "./tmp")
  cb()
}

t.tearDown = function (cb) {
  sh.rm("-R", "./tmp")
  cb()
}

t.testRead = function (test) {
  var site = oddweb.read("./tmp")

  test.deepEqual(site.cache, {
    "main.html": "<html>{{ content }}</html>"
  })

  test.deepEqual(site.pages, [
    { meta: { id: 0, path: "about/index.html", url: "/about/", template: "main.html", type: "html" },
      data: "<h1>About me!</h1>" },
    { meta: { id: 1, path: "blog/archive/index.html", url: "archive", type: "html" },
      data: "<html><h1>Archive</h1></html>" },
    { meta: { id: 2, blog: true, title: "My post", date: "2013-08-27", altUrl: "/ap/", altPath: "ap/index.html",
              path: 'blog/post.html', url: '/blog/post.html', type: "md" },
      data: '**This is my post**' },
    { meta: { id: 3, path: "index.html", template: "main.html", url: '/index.html', type: "html" },
      data: "<h1>Welcome!</h1> <div>{{#posts}}{{{date meta.date \"MMM Do, YYYY\"}}} | {{meta.url}} | {{meta.title}}{{/posts}}</div>" }
  ])

  test.deepEqual(site.resources, [
    { meta: { path: "scripts.js", binary: true }, data: "while (true) {}" },
    { meta: { path: "styles.css", binary: false }, data: "body { color: hotpink; }" }
  ])

  test.done()
}

t.testBuild = function (test) {
  var site = oddweb.read("./tmp")
  site = oddweb.build(site)

  test.deepEqual(site.pages, [
    { meta: { id: 0, template: 'main.html', url: '/about/', path: 'about/index.html', type: "html" },
      data: '<html><h1>About me!</h1></html>' },
    { meta: { id: 1, url: 'archive', path: 'blog/archive/index.html', type: "html" },
      data: '<html><h1>Archive</h1></html>' },
    { meta: { id: 2, blog: true, title: "My post", date: "2013-08-27", altUrl: "/ap/", altPath: "ap/index.html",
              path: 'blog/post.html', type: "md", url: "/blog/post.html" },
      data: '<p><strong>This is my post</strong></p>' },      
    { meta: { id: 3, template: 'main.html', path: 'index.html', type: "html", url: "/index.html" },
      data: '<html><h1>Welcome!</h1> <div>Aug 27th, 2013 | /blog/post.html | My post</div></html>' }
  ])

  test.done()
}

t.testWrite = function (test) {
  var site = oddweb.read("./tmp")
  site = oddweb.build(site)
  oddweb.write(site, "./tmp")

  test.equal(sh.cat("./tmp/site/index.html"),
    "<html><h1>Welcome!</h1> <div>Aug 27th, 2013 | /blog/post.html | My post</div></html>")
  test.equal(sh.cat("./tmp/site/blog/archive/index.html"),
    "<html><h1>Archive</h1></html>")
  test.equal(sh.cat("./tmp/site/about/index.html"),
    "<html><h1>About me!</h1></html>")
  test.equal(sh.cat("./tmp/site/blog/post.html"),
    "<p><strong>This is my post</strong></p>")
  test.equal(sh.cat("./tmp/site/ap/index.html"),
    "<html><meta http-equiv=refresh content=\'0;/blog/post.html\'></html>")

  test.equal(sh.cat("./tmp/site/res/scripts.js"), "while (true) {}")
  test.equal(sh.cat("./tmp/site/res/styles.css"), "body { color: hotpink; }")

  test.done()
}

module.exports = t