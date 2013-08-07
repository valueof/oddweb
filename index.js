"use strict";

var path  = require("path")
var sh    = require("shelljs")

var handlebars = require("handlebars")
var markdown   = require("markdown").markdown

function read(dir) {
  var site = {}

  site.pages = sh.ls("-R", path.join(dir, "pages"))
  site.pages = site.pages.reduce(function (acc, file) {
    var ap = path.join(dir, "pages", file)

    if (sh.test("-d", ap))
      return acc

    var data = sh.cat(ap)
    var meta = {}

    if (data.trim()[0] === "{") {
      data = data.split("\n\n")
      meta = JSON.parse(data[0])
      data = data[1]
    }

    meta.path = file

    if (meta.url) {
      if (meta.url[0] === "/")
        meta.path = meta.url.slice(1)
      else
        meta.path = path.join(path.dirname(meta.path), meta.url)
    }

    if (path.extname(meta.path) === "")
      meta.path = path.join(meta.path, "index.html")

    if (meta.template && path.extname(meta.template) === "")
      meta.template = meta.template + ".html"

    return acc.concat({ meta: meta, data: data })
  }, [])

  site.cache = sh.ls("-R", path.join(dir, "templates"))
  site.cache = site.cache.reduce(function (acc, file) {
    var ap = path.join(dir, "templates", file)

    if (sh.test("-d", ap) || path.extname(ap) !== ".html")
      return acc

    acc[file] = sh.cat(ap)
    return acc
  }, {})

  site.resources = sh.ls("-R", path.join(dir, "res"))
  site.resources = site.resources.reduce(function (acc, file) {
    var ap = path.join(dir, "res", file)

    if (sh.test("-d", ap))
      return acc

    var data = sh.cat(ap)
    var meta = { path: file }

    return acc.concat({ meta: meta, data: data })
  }, [])

  return site
}

function build(site) {
  site.pages = site.pages.map(function (page) {
    switch (path.extname(page.meta.path)) {
    case ".html":
      page.data = handlebars.compile(page.data)(page.meta)
      break
    case ".md":
      page.data = markdown.toHTML(page.data)
      if (!page.meta.url)
        page.meta.path = page.meta.path.replace(/\.md$/, ".html")
    }

    if (page.meta.template) {
      page.data = handlebars.compile(site.cache[page.meta.template])({
        content: new handlebars.SafeString(page.data)
      })
    }

    return page
  })

  return site
}

function write(site, dest) {
  function wrt(list, root) {
    list.forEach(function (item) {
      var dir = path.join(root, path.dirname(item.meta.path))

      if (!sh.test("-e", dir))
        sh.mkdir("-p", dir)

      item.data.to(path.join(root, item.meta.path))
    })
  }

  wrt(site.pages, path.resolve(path.join(dest, "site")))
  wrt(site.resources, path.resolve(path.join(dest, "site", "res")))

  return site
}

module.exports = {
  read:  read,
  build: build,
  write: write
}