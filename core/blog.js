"use script";

module.exports = function (site, handlebars) {
  var posts = site.pages.map(function (page) {
    if (!page.meta.blog)
      return

    if (!page.meta.date)
      return

    return page
  })

  posts = posts.filter(function (post) {
    return post !== undefined
  })

  handlebars.registerHelper("posts", function (options) {
    return posts
      .sort(function (a, b) {
        a = new Date(a.meta.date)
        b = new Date(b.meta.date)

        if (a > b) return 1
        if (a < b) return -1
        return 0
      })
      .reverse()
      .map(function (c) {
        return options.fn(c)
      })
      .join("")
  })

  return site
}