// ── 常量 & 状态 ──────────────────────────────────────────
var supportType = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/gif', 'image/webp',
  'image/avif', 'image/bmp', 'image/x-icon', 'image/vnd.microsoft.icon']
var FILE_SIZE_WARNING = 5 * 1024 * 1024
var HISTORY_PREVIEW = 6
var MAX_FILES = 10
var BATCH_PREVIEW = 3
var currentFormat = 'raw', currentBase64 = '', currentMime = '', batchResults = [], pendingFiles = []

// ── DOM refs ─────────────────────────────────────────────
var uploader        = document.getElementById('fileupload')
var textarea        = document.getElementById('textarea')
var convert         = document.getElementById('convert')
var checkbox        = document.getElementById('checkbox')
var resultSection   = document.getElementById('result')
var resultImg       = document.getElementById('result-img')
var resultTextarea  = document.getElementById('result-textarea')
var toastContainer  = document.getElementById('toast-container')
var formatBtns      = document.querySelectorAll('.format-btn')
var resultSingle    = document.getElementById('result-single')
var resultBatch     = document.getElementById('result-batch')
var batchList       = document.getElementById('batch-list')
var batchCount      = document.getElementById('batch-count')
var resultFormatTabs  = document.getElementById('result-format-tabs')
var resultFormatSvg   = document.getElementById('result-format-svg')
var resultMeta        = document.getElementById('result-meta')
var resultTypeBadge   = document.getElementById('result-type-badge')
var resultSizeDisplay = document.getElementById('result-size-display')
var resultCopyBtn     = document.getElementById('result-copy-btn')
var resultDownloadBtn = document.getElementById('result-download-btn')
var historyList     = document.getElementById('history-list')
var clearHistoryBtn = document.getElementById('clear-history')
var historySection  = document.getElementById('history-section')
var viewMoreBtn     = document.getElementById('view-more-history')
var drawerOverlay   = document.getElementById('drawer-overlay')
var historyDrawer   = document.getElementById('history-drawer')
var drawerClose     = document.getElementById('drawer-close')
var drawerList      = document.getElementById('drawer-list')
var historySearch   = document.getElementById('history-search')
var themeToggle     = document.getElementById('theme-toggle')
var maxWidthInput   = document.getElementById('max-width')
var qualityInput    = document.getElementById('quality')
var qualityDisplay  = document.getElementById('quality-display')
var compressSection  = document.getElementById('compress-section')
var maxWidthItem     = document.getElementById('max-width-item')
var qualityItem      = document.getElementById('quality-item')
var doubleQuoteItem  = document.getElementById('double-quote-item')
var outputEmpty      = document.getElementById('output-empty')
var uploadZone       = document.getElementById('upload-zone')
var filePreview      = document.getElementById('file-preview')
var storageBadge     = document.getElementById('storage-badge')
var tabUpload        = document.getElementById('tab-upload')
var tabPaste         = document.getElementById('tab-paste')
var inputTabBtns     = document.querySelectorAll('.input-tab')

// ── Theme ────────────────────────────────────────────────
var savedTheme = localStorage.getItem('theme')
var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
setTheme(savedTheme === 'dark' || (!savedTheme && prefersDark))
themeToggle.addEventListener('click', function () { setTheme(!document.body.classList.contains('dark')) })

// ── History actions ──────────────────────────────────────
async function saveToHistory(name, fileOrNull, mimeType, params, textContent, base64Result) {
  if (!HistoryDB.isIDB()) return
  var key = fileOrNull
    ? (name + '_' + fileOrNull.size)
    : ('text_' + mimeType + '_' + (textContent || '').slice(0, 80))
  var all = await HistoryDB.getAll()
  var existing = null
  for (var i = 0; i < all.length; i++) { if (all[i].key === key) { existing = all[i]; break } }
  var newParam = Object.assign({}, params, { time: Date.now(), base64: base64Result || '' })
  if (existing) {
    var rp = (existing.recentParams || []).filter(function (p) {
      if (mimeType === 'image/svg+xml') return p.doubleQuote !== newParam.doubleQuote
      return !(p.quality === newParam.quality && p.maxWidth === newParam.maxWidth)
    })
    existing.recentParams = [newParam].concat(rp).slice(0, 3)
    existing.time = Date.now()
    if (fileOrNull) existing.file = fileOrNull
    await HistoryDB.put(existing)
  } else {
    var item = {
      id: Date.now() + '_' + Math.random().toString(36).slice(2),
      key: key, name: name, mimeType: mimeType,
      time: Date.now(), recentParams: [newParam]
    }
    if (fileOrNull) { item.file = fileOrNull; item.size = fileOrNull.size }
    else { item.isText = true; item.textContent = textContent || '' }
    await HistoryDB.add(item)
  }
  renderHistory()
}

viewMoreBtn.addEventListener('click', openDrawer)
drawerClose.addEventListener('click', closeDrawer)
drawerOverlay.addEventListener('click', closeDrawer)
historySearch.addEventListener('input', function () { renderDrawer(historySearch.value) })
clearHistoryBtn.addEventListener('click', async function () {
  await HistoryDB.clear(); renderHistory(); renderDrawer(historySearch.value)
  showToast('历史已清除', 'success')
})

// ── Quality slider ───────────────────────────────────────
qualityInput.addEventListener('input', function () {
  qualityDisplay.textContent = Math.round(qualityInput.value * 100) + '%'
})

// ── Format buttons ────────────────────────────────────────
for (var i = 0; i < formatBtns.length; i++) {
  formatBtns[i].addEventListener('click', function (e) {
    for (var j = 0; j < formatBtns.length; j++) formatBtns[j].classList.remove('format-btn--active')
    e.currentTarget.classList.add('format-btn--active')
    currentFormat = e.currentTarget.getAttribute('data-format')
    if (currentBase64) resultTextarea.value = getFormattedOutput(currentBase64, currentFormat)
    if (batchResults.length > 0) renderBatchList()
  })
}
resultCopyBtn.addEventListener('click', function () {
  if (resultTextarea.value) copyText(resultTextarea.value)
})
resultDownloadBtn.addEventListener('click', function () {
  if (!currentBase64) return
  var mime = currentMime || 'application/octet-stream'
  var blob
  if (currentBase64.indexOf(';base64,') !== -1) {
    var b64str = currentBase64.split(';base64,')[1]
    var binary = atob(b64str)
    var bytes = new Uint8Array(binary.length)
    for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    blob = new Blob([bytes], { type: mime })
  } else {
    var svgText = decodeURIComponent(currentBase64.split(',').slice(1).join(','))
    blob = new Blob([svgText], { type: 'image/svg+xml' })
  }
  var ext = mimeToExt(mime).toLowerCase()
  var filename = 'image.' + (ext === '未知' ? 'bin' : ext)
  var url = URL.createObjectURL(blob)
  var a = document.createElement('a'); a.href = url; a.download = filename
  document.body.appendChild(a); a.click()
  document.body.removeChild(a); URL.revokeObjectURL(url)
})

// ── Input tab buttons ────────────────────────────────────
for (var t = 0; t < inputTabBtns.length; t++) {
  inputTabBtns[t].addEventListener('click', function (e) {
    switchInputTab(e.currentTarget.getAttribute('data-tab'))
  })
}

// ── Re-convert from history ───────────────────────────────
async function reConvertFromHistory(item, params) {
  if (item.isText) {
    switchInputTab('paste')
    textarea.value = item.textContent
    checkbox.checked = params.doubleQuote || false
    updateParamsVisibility('svg')
    convertDisabled(false)
    svgToBase64()
  } else if (item.file) {
    switchInputTab('upload')
    if (item.mimeType === 'image/svg+xml') {
      checkbox.checked = params.doubleQuote || false
    } else {
      if (params.maxWidth) { maxWidthInput.value = params.maxWidth }
      if (params.quality != null) {
        qualityInput.value = params.quality
        qualityDisplay.textContent = Math.round(params.quality * 100) + '%'
      }
    }
    pendingFiles = [item.file]
    updateParamsVisibility('image')
    renderFilePreview()
    convertDisabled(false)
    var res = await processFile(item.file)
    if (res) showSingleResult(res.base64, res.imgSrc, item.mimeType, false, item.file.size)
    else showToast('转换失败', 'error')
  }
}

// ── SVG Conversion ───────────────────────────────────────
function svgToBase64() {
  var input = textarea.value.trim()
  var b64pre = 'data:image/svg+xml;base64,'
  var isBase64Input = input.indexOf(b64pre) === 0
  if (isBase64Input) {
    try { input = atob(input.slice(b64pre.length)); textarea.value = input }
    catch (e) { showToast('Base64 解码失败', 'error'); return }
  }
  pendingFiles = []
  var res = ImageToBase64(input, { doubleQuote: checkbox.checked })
  var base64 = typeof res === 'string' ? res : res.input
  showSingleResult(base64, base64, 'image/svg+xml', isBase64Input, new Blob([input]).size)
  saveToHistory('SVG', null, 'image/svg+xml',
    { doubleQuote: checkbox.checked, convertedSize: calcBase64Size(base64) }, input, base64)
}

// ── File Transfer ────────────────────────────────────────
async function transferFiles(files) {
  if (!files || files.length === 0) return
  var valid = [], hasInvalid = false
  var allFiles = Array.prototype.slice.call(files)
  if (allFiles.length > MAX_FILES) {
    showToast('最多支持 ' + MAX_FILES + ' 张，已忽略超出部分', 'warning')
    allFiles = allFiles.slice(0, MAX_FILES)
  }
  for (var k = 0; k < allFiles.length; k++) {
    if (supportType.indexOf(allFiles[k].type) !== -1) {
      valid.push(allFiles[k])
      if (allFiles[k].size > FILE_SIZE_WARNING)
        showToast(allFiles[k].name + ' 较大（' + (allFiles[k].size / 1024 / 1024).toFixed(1) + 'MB）', 'warning')
    } else { hasInvalid = true }
  }
  if (hasInvalid) showToast('已跳过不支持的文件格式', 'error')
  if (valid.length === 0) { clearUploader(); return }

  var combined = pendingFiles.concat(valid)
  if (combined.length > MAX_FILES) {
    showToast('最多支持 ' + MAX_FILES + ' 张，已忽略超出部分', 'warning')
    combined = combined.slice(0, MAX_FILES)
  }
  pendingFiles = combined; textarea.value = ''
  updateParamsVisibility('image')
  convertDisabled(false); renderFilePreview()

  var results = []
  for (var m = 0; m < pendingFiles.length; m++) {
    var res = await processFile(pendingFiles[m])
    if (res) results.push(res)
    else showToast(pendingFiles[m].name + ' 处理失败', 'error')
  }
  if (results.length === 1) {
    showSingleResult(results[0].base64, results[0].imgSrc, pendingFiles[0].type, false, pendingFiles[0].size)
    var p0 = pendingFiles[0]
    await saveToHistory(results[0].name, p0, p0.type, p0.type === 'image/svg+xml'
      ? { doubleQuote: checkbox.checked, convertedSize: calcBase64Size(results[0].base64) }
      : { quality: parseFloat(qualityInput.value), maxWidth: parseInt(maxWidthInput.value), convertedSize: calcBase64Size(results[0].base64) },
      undefined, results[0].base64)
  } else if (results.length > 1) {
    showBatchResults(results)
    for (var m2 = 0; m2 < results.length; m2++) {
      var pm = pendingFiles[m2]
      await saveToHistory(results[m2].name, pm, pm.type, pm.type === 'image/svg+xml'
        ? { doubleQuote: checkbox.checked, convertedSize: calcBase64Size(results[m2].base64) }
        : { quality: parseFloat(qualityInput.value), maxWidth: parseInt(maxWidthInput.value), convertedSize: calcBase64Size(results[m2].base64) },
        undefined, results[m2].base64)
    }
  }
  clearUploader()
}

// ── Convert button ────────────────────────────────────────
convert.addEventListener('click', async function () {
  if (pendingFiles.length > 0) {
    var results = []
    for (var r = 0; r < pendingFiles.length; r++) {
      var res = await processFile(pendingFiles[r])
      if (res) results.push(res)
    }
    if (results.length === 1) {
      showSingleResult(results[0].base64, results[0].imgSrc, pendingFiles[0].type, false, pendingFiles[0].size)
      var p0 = pendingFiles[0]
      await saveToHistory(results[0].name, p0, p0.type, p0.type === 'image/svg+xml'
        ? { doubleQuote: checkbox.checked, convertedSize: calcBase64Size(results[0].base64) }
        : { quality: parseFloat(qualityInput.value), maxWidth: parseInt(maxWidthInput.value), convertedSize: calcBase64Size(results[0].base64) },
        undefined, results[0].base64)
    } else if (results.length > 1) {
      showBatchResults(results)
      for (var s = 0; s < results.length; s++) {
        var ps = pendingFiles[s]
        await saveToHistory(results[s].name, ps, ps.type, ps.type === 'image/svg+xml'
          ? { doubleQuote: checkbox.checked, convertedSize: calcBase64Size(results[s].base64) }
          : { quality: parseFloat(qualityInput.value), maxWidth: parseInt(maxWidthInput.value), convertedSize: calcBase64Size(results[s].base64) },
          undefined, results[s].base64)
      }
    }
  } else if (textarea.value) {
    if (textarea.value.indexOf('<svg') === -1)
      showToast('内容不含 <svg 标签，请确认格式', 'warning')
    svgToBase64()
  }
})

// ── Textarea smart paste ─────────────────────────────────
textarea.addEventListener('paste', function (e) {
  var text = (e.clipboardData || window.clipboardData).getData('text')
  if (!text || text.indexOf('data:image/') !== 0) return
  e.preventDefault()
  e.stopPropagation()

  var SVG_B64 = 'data:image/svg+xml;base64,'
  var SVG_URI = 'data:image/svg+xml,'
  var IMG_B64 = /^data:image\/[^;]+;base64,/i

  if (text.indexOf(SVG_B64) === 0) {
    textarea.value = ''
    showSingleResult(text, text, 'image/svg+xml', true)
    showToast('已识别 SVG Base64，结果已显示', 'success')
  } else if (text.indexOf(SVG_URI) === 0) {
    try {
      textarea.value = decodeURIComponent(text.slice(SVG_URI.length))
      textarea.dispatchEvent(new Event('input'))
      showToast('已解码为 SVG 代码', 'success')
    } catch (err) { showToast('SVG URI 解码失败', 'error') }
  } else if (IMG_B64.test(text)) {
    var mimeExt = text.match(/^data:image\/([^;]+)/i)[1]
    var mime = 'image/' + mimeExt
    textarea.value = ''
    showSingleResult(text, text, mime)
    showToast('已识别 ' + mimeToExt(mime) + ' Base64，结果已显示', 'success')
  } else {
    showToast('不支持的数据格式，请粘贴 SVG 代码或标准 Base64 图片', 'error')
  }
})

// ── Textarea events ───────────────────────────────────────
textarea.addEventListener('focus', function () { textarea.parentElement.classList.add('focus') })
textarea.addEventListener('blur',  function () { textarea.parentElement.classList.remove('focus') })
textarea.addEventListener('input', function (e) {
  if (e.target.value) {
    convertDisabled(false); updateParamsVisibility('svg'); pendingFiles = []; renderFilePreview()
  } else { resultToggle('none'); convertDisabled(true); updateParamsVisibility('none') }
})

// ── File & Drop events ────────────────────────────────────
uploader.addEventListener('change', function (e) { transferFiles(e.target.files) })
document.addEventListener('drop', function (e) { transferFiles(e.dataTransfer.files) })
document.ondrop     = function (e) { e.preventDefault() }
document.ondragover = function (e) { e.preventDefault() }
document.addEventListener('paste', function (e) {
  var items = e.clipboardData && e.clipboardData.items
  if (!items) return
  var files = []
  for (var p = 0; p < items.length; p++) {
    if (items[p].kind === 'file' && items[p].type.indexOf('image/') === 0) {
      var f = items[p].getAsFile(); if (f) files.push(f)
    }
  }
  if (files.length > 0) transferFiles(files)
})

// ── Init ─────────────────────────────────────────────────
HistoryDB.init().then(function () {
  storageBadge.textContent = HistoryDB.isIDB() ? 'IndexedDB' : ''
  storageBadge.style.display = HistoryDB.isIDB() ? '' : 'none'
  renderHistory()
})
