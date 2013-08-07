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
    { meta: { path: "about/index.html", url: "/about/", template: "main.html" },
      data: "<h1>About me!</h1>" },
    { meta: { path: "blog/archive/index.html", url: "archive" },
      data: "<html><h1>Archive</h1></html>" },
    { meta: { path: 'blog/post.md' },
      data: '**This is my post**' },      
    { meta: { path: "index.html", template: "main.html" },
      data: "<h1>Welcome to my new site!</h1>" }
  ])

  test.deepEqual(site.resources, [
    { meta: { path: "scripts.js" }, data: "while (true) {}" },
    { meta: { path: "styles.css" }, data: "body { color: hotpink; }" }
  ])

  test.done()
}

t.testBuild = function (test) {
  var site = oddweb.read("./tmp")
  site = oddweb.build(site)

  test.deepEqual(site.pages, [
    { meta: { template: 'main.html', url: '/about/', path: 'about/index.html' },
      data: '<html><h1>About me!</h1></html>' },
    { meta: { url: 'archive', path: 'blog/archive/index.html' },
      data: '<html><h1>Archive</h1></html>' },
    { meta: { path: 'blog/post.html' },
      data: '<p><strong>This is my post</strong></p>' },      
    { meta: { template: 'main.html', path: 'index.html' },
      data: '<html><h1>Welcome to my new site!</h1></html>' }
  ])

  test.done()
}

t.testWrite = function (test) {
  var site = oddweb.read("./tmp")
  site = oddweb.build(site)
  oddweb.write(site, "./tmp")

  test.equal(sh.cat("./tmp/site/index.html"),
    "<html><h1>Welcome to my new site!</h1></html>")
  test.equal(sh.cat("./tmp/site/blog/archive/index.html"),
    "<html><h1>Archive</h1></html>")
  test.equal(sh.cat("./tmp/site/about/index.html"),
    "<html><h1>About me!</h1></html>")
  test.equal(sh.cat("./tmp/site/blog/post.html"),
    "<p><strong>This is my post</strong></p>")

  test.equal(sh.cat("./tmp/site/res/scripts.js"), "while (true) {}")
  test.equal(sh.cat("./tmp/site/res/styles.css"), "body { color: hotpink; }")

  test.done()
}

module.exports = t