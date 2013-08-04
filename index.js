"use strict";

var async = require("async");
var fs    = require("fs");
var path  = require("path");
var hbrs  = require("handlebars");

function mkdir(dir, cb) {
  async.reduce(dir.split(path.sep), "", function (acc, curr, cb) {
    var ap = path.join(acc, curr);

    fs.exists(ap, function (exists) {
      if (exists)
        cb(null, ap);

      fs.mkdir(ap, function (err) { cb(err, ap) });
    });
  }, cb);
}

function walk(dir, cb) {
  if (!fs.statSync(dir).isDirectory())
    return cb(new Error("argument is not a directory"), []);

  fs.readdir(dir, function (err, files) {
    if (err) return void cb(err, []);

    async.reduce(files, [], function (acc, file, cb) {
      var ap = path.join(dir, file);

      if (fs.statSync(ap).isDirectory()) return walk(ap, cb);
      acc.push(ap);
      cb(null, acc);
    }, cb);
  });
}

function read(next) {
  walk("./pages/", function (err, pages) {
    if (err) return void next(err, {});

    async.reduce(pages, [], function (acc, file, cb) {
      fs.readFile(file, { encoding: "utf8" }, function (err, data) {
        if (err) return void cb(err, acc);

        var data = data.toString();
        var meta = {};

        if (data.trim()[0] === "{") {
          data = data.split("\n\n");
          meta = JSON.parse(data[0]);
          data = data[1];
        }

        meta.path = meta.url || file.replace(/^pages\//, "");
        if (path.extname(meta.path) === "")
          meta.path = path.join(meta.path, "index.html");

        acc.push({
          meta: meta,
          data: data
        });

        cb(null, acc);
      });
    }, next);
  });
}

function compile(pages, next) {
  pages = pages.map(function (page) {
    if (path.extname(page.meta.path) === ".html")
      page.data = hbrs.compile(page.data)(page.meta);

    return page;
  });

  next(null, pages);
}

function write(pages, next) {
  async.each(pages, function (page, cb) {
    var dest = path.join("site", page.meta.path);

    fs.exists(path.dirname(dest), function (exists) {
      if (exists)
        return void fs.writeFile(dest, page.data, { encoding: "utf8" }, cb);

      mkdir(path.dirname(dest), function () {
        fs.writeFile(dest, page.data, { encoding: "utf8" }, cb);  
      });
    });
  }, next);
}

async.waterfall([ read, compile, write ], function (err) {
  console.log("DONE");
});