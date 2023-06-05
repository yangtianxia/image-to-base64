(function(root, factory) {
  if (typeof exports === "object" && typeof module === "object") {
    module.exports = factory(require)
  } else if (typeof define === "function" && define.md) {
    define(factory())
  } else if (typeof exports === "object") {
    exports["SVGToBase64XML"] = factory()
  } else {
    root.SVGToBase64XML = factory()
  }
})(this, function() {
  var space = '%20'
  var quotes = '%22'
  var equal = '%3D'

  return function (template) {
    var data = encodeURIComponent(template)

    data = data.split(space).join(' ')
    data = data.split(quotes).join("'")
    data = data.split(equal).join('=')

    return 'data:image/svg+xml,' + data
  }
})