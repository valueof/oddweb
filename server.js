"use strict";

var fs     = require("fs")
var http   = require("http")
var url    = require("url")
var path   = require("path")
var mime   = require("mime")
var oddweb = require("./index.js")

function server(dir, port) {
  function rebuild() {
    console.log("rebuilding...")
    oddweb.write(oddweb.build(oddweb.read(dir)), dir)
  }

  rebuild()
  fs.watch(path.join(dir, "pages"), rebuild)
  fs.watch(path.join(dir, "res"), rebuild)
  fs.watch(path.join(dir, "templates"), rebuild)

  http.createServer(function (req, resp) {
    var uri  = url.parse(req.url).pathname
    var file = path.join(dir, "site", uri)

    console.log("GET", uri);
    fs.exists(file, function (exists) {
      if (!exists) {
        resp.writeHead(404, { "Content-Type": "text/plain" })
        resp.write("404 File Not Found")
        resp.end()
        return
      }

      if (fs.statSync(file).isDirectory())
        file += "/index.html"

      fs.readFile(file, "binary", function (err, f) {
        if (err) {
          resp.writeHead(500, { "Content-Type": "text/plain" })
          resp.write(err + "\n")
          resp.end()
          return
        }

        resp.writeHead(200, { "Content-Type": mime.lookup(file) })
        resp.write(f, "binary")
        resp.end()
      })
    })
  }).listen(port)

  console.log("listening on localhost:" + port)
}

module.exports = server