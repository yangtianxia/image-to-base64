(function(root, factory) {
  if (typeof exports === 'object' && typeof module === 'object') {
    module.exports = factory(require)
  } else if (typeof define === 'function' && define.md) {
    define(factory())
  } else if (typeof exports === 'object') {
    exports['ImageToBase64'] = factory()
  } else {
    root.ImageToBase64 = factory()
  }
})(this, function() {
  var prefix = 'data:image/'
  var svg = prefix + 'svg+xml,'
  var space = '%20'
  var quotes = '%22'
  var equal = '%3D'

  return function (template, option) {
    if (typeof option === 'undefined') {
      option = {
        doubleQuote: false
      }
    }

    if (template.indexOf(svg) === 0) {
      var str = template.replace(new RegExp(svg.replace(/\+/, '\\+')), '')
      str = str.replace(/'/g, '"') 
      return {
        data: decodeURIComponent(str),
        input: template
      }
    } else if (template.indexOf(prefix) === 0) {
      return template
    }

    var data = encodeURIComponent(template)

    // 处理空格
    data = data.replace(new RegExp(space, 'g'), ' ')
    // 处理引号
    data = data.replace(new RegExp(quotes, 'g'), option.doubleQuote ? '"' : "'")
    // 处理等号
    data = data.replace(new RegExp(equal, 'g'), '=')

    return svg + data
  }
})