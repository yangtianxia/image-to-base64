// ── Image Conversion ─────────────────────────────────────

function readFileAsDataURL(file, cb) {
  var r = new FileReader(); r.readAsDataURL(file)
  r.onload = function () { cb(r.result) }; r.onerror = function () { cb(null) }
}

function compressImage(file) {
  return new Promise(function (resolve) {
    var maxWidth = parseInt(maxWidthInput.value) || 1200
    var quality  = parseFloat(qualityInput.value) || 0.85
    var img = new Image(), blobUrl = URL.createObjectURL(file)
    img.onload = function () {
      URL.revokeObjectURL(blobUrl)
      var w = img.naturalWidth, h = img.naturalHeight
      if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth }
      var canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality))
    }
    img.onerror = function () { URL.revokeObjectURL(blobUrl); resolve(null) }
    img.src = blobUrl
  })
}

function processFile(file) {
  return new Promise(function (resolve) {
    if (file.type === 'image/svg+xml') {
      var reader = new FileReader()
      reader.readAsText(file, 'utf-8')
      reader.onload = function () {
        var res = ImageToBase64(reader.result, { doubleQuote: checkbox.checked })
        var b64 = typeof res === 'string' ? res : res.input
        resolve({ base64: b64, imgSrc: b64, name: file.name })
      }
      reader.onerror = function () { resolve(null) }
    } else {
      var canCompress = file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/bmp'
      if (canCompress) {
        compressImage(file).then(function (compressed) {
          if (compressed) resolve({ base64: compressed, imgSrc: compressed, name: file.name })
          else readFileAsDataURL(file, function (b) { resolve(b ? { base64: b, imgSrc: b, name: file.name } : null) })
        })
      } else {
        readFileAsDataURL(file, function (b) { resolve(b ? { base64: b, imgSrc: b, name: file.name } : null) })
      }
    }
  })
}
