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
  var prefix = 'data:image/svg+xml,'
  var space = '%20'
  var quotes = '%22'
  var equal = '%3D'

  return function (template, option) {
    if (typeof option === 'undefined') {
      option = {
        doubleQuote: false
      }
    }

    if (template.indexOf(prefix) === 0) {
      template = template.replace(new RegExp(prefix.replace(/\+/, '\\+')), '')
      template = template.replace(/'/g, '"')
      return decodeURIComponent(template)
    }

    var data = encodeURIComponent(template)

    // 处理空格
    data = data.replace(new RegExp(space, 'g'), ' ')
    // 处理引号
    data = data.replace(new RegExp(quotes, 'g'), option.doubleQuote ? '"' : "'")
    // 处理等号
    data = data.replace(new RegExp(equal, 'g'), '=')

    return prefix + data
  }
})