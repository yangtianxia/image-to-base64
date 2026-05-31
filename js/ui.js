// ── Params Visibility ────────────────────────────────────
function updateParamsVisibility(mode) {
  if (mode === 'none') {
    compressSection.style.display = 'none'
  } else if (mode === 'svg') {
    compressSection.style.display = 'flex'
    maxWidthItem.style.display    = 'none'
    qualityItem.style.display     = 'none'
    doubleQuoteItem.style.display = 'flex'
  } else {
    var hasPng  = pendingFiles.some(function (f) { return f.type === 'image/png' })
    var hasJpeg = pendingFiles.some(function (f) { return f.type === 'image/jpeg' || f.type === 'image/bmp' })
    var hasSvg  = pendingFiles.some(function (f) { return f.type === 'image/svg+xml' })
    compressSection.style.display = (hasPng || hasJpeg || hasSvg) ? 'flex' : 'none'
    maxWidthItem.style.display    = (hasPng || hasJpeg) ? 'flex' : 'none'
    qualityItem.style.display     = hasJpeg ? 'flex' : 'none'
    doubleQuoteItem.style.display = hasSvg ? 'flex' : 'none'
  }
}

// ── Result UI ────────────────────────────────────────────
function resultToggle(display) {
  var show = display !== 'none'
  resultSection.style.display = show ? 'flex' : 'none'
  outputEmpty.style.display   = show ? 'none' : 'flex'
}
function convertDisabled(d) { convert.disabled = d }
function clearUploader() { uploader.value = '' }

function showSingleResult(base64, imgSrc, mime, svgTagOnly) {
  currentBase64 = base64; currentMime = mime || ''
  var isSvg = currentMime === 'image/svg+xml'
  var tagOnly = isSvg && !!svgTagOnly
  resultTextarea.value = getFormattedOutput(base64, tagOnly ? 'html' : currentFormat)
  resultImg.src = imgSrc || base64
  resultSingle.style.display = 'block'; resultBatch.style.display = 'none'
  resultFormatSvg.style.display  = tagOnly ? 'flex' : 'none'
  resultFormatTabs.style.display = tagOnly ? 'none' : 'flex'
  var ext = mimeToExt(mime)
  resultTypeBadge.textContent = ext
  resultTypeBadge.className = 'result-type-badge' + (ext !== '未知' ? ' result-type-badge--' + ext.toLowerCase() : '')
  resultSizeDisplay.textContent = calcBase64Size(base64)
  resultMeta.style.display = 'flex'
  resultToggle('block')
}

function renderBatchList(showAll) {
  batchList.innerHTML = ''
  var items = (showAll || batchResults.length <= BATCH_PREVIEW)
    ? batchResults : batchResults.slice(0, BATCH_PREVIEW)
  items.forEach(function (item) {
    var card = document.createElement('div'); card.className = 'batch-item'
    var thumb = document.createElement('img'); thumb.className = 'batch-thumb'
    thumb.src = item.imgSrc || item.base64; thumb.alt = item.name
    var info = document.createElement('div'); info.className = 'batch-info'
    var nameEl = document.createElement('div'); nameEl.className = 'batch-name'
    nameEl.textContent = item.name; nameEl.title = item.name
    var output = document.createElement('textarea'); output.className = 'batch-output'
    output.readOnly = true; output.value = getFormattedOutput(item.base64, currentFormat)
    ;(function (el) { el.addEventListener('click', function () { copyText(el.value) }) })(output)
    info.appendChild(nameEl); info.appendChild(output)
    card.appendChild(thumb); card.appendChild(info); batchList.appendChild(card)
  })
  if (batchResults.length > BATCH_PREVIEW) {
    var btn = document.createElement('button')
    btn.type = 'button'; btn.className = 'batch-toggle-btn'
    if (showAll) {
      btn.textContent = '收起'
      btn.addEventListener('click', function () { renderBatchList(false) })
    } else {
      btn.textContent = '展开全部 ' + batchResults.length + ' 个结果 ↓'
      btn.addEventListener('click', function () { renderBatchList(true) })
    }
    batchList.appendChild(btn)
  }
}
function showBatchResults(items) {
  batchResults = items; batchCount.textContent = '共 ' + items.length + ' 个文件'
  resultSingle.style.display = 'none'; resultBatch.style.display = 'block'
  resultToggle('block'); renderBatchList()
}

// ── History Rendering ────────────────────────────────────
function makeHistoryCard(item) {
  var card = document.createElement('div')
  card.className = 'history-item'

  var thumb = document.createElement('img')
  thumb.className = 'history-thumb'; thumb.alt = item.name
  if (item.file) {
    var blobUrl = URL.createObjectURL(item.file)
    thumb.src = blobUrl
    thumb.onload = function () { URL.revokeObjectURL(blobUrl) }
  } else if (item.isText && item.mimeType === 'image/svg+xml') {
    try {
      var svgBlob = new Blob([item.textContent], { type: 'image/svg+xml' })
      var svgUrl = URL.createObjectURL(svgBlob)
      thumb.src = svgUrl
      thumb.onload = function () { URL.revokeObjectURL(svgUrl) }
    } catch (e) {}
  }

  var info = document.createElement('div')
  info.className = 'history-info'

  var top = document.createElement('div')
  top.className = 'history-info-top'

  var nameEl = document.createElement('div')
  nameEl.className = 'history-name'
  nameEl.textContent = item.name; nameEl.title = item.name

  var ext = item.mimeType ? mimeToExt(item.mimeType) : ''
  var sizeStr = item.size ? formatFileSize(item.size) : (item.isText ? '文本' : '')
  var metaEl = document.createElement('span')
  metaEl.className = 'history-params'
  metaEl.textContent = [ext, sizeStr].filter(Boolean).join(' · ')
  metaEl.style.display = (ext || sizeStr) ? '' : 'none'

  var timeEl = document.createElement('div')
  timeEl.className = 'history-time'
  timeEl.textContent = new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  var delBtn = document.createElement('button')
  delBtn.type = 'button'; delBtn.className = 'history-delete-btn'; delBtn.textContent = '删除'
  ;(function (id) {
    delBtn.addEventListener('click', async function () {
      await HistoryDB.remove(id); renderHistory(); renderDrawer(historySearch.value)
    })
  })(item.id)

  top.appendChild(nameEl); top.appendChild(metaEl)
  top.appendChild(timeEl); top.appendChild(delBtn)

  var btns = document.createElement('div')
  btns.className = 'history-copy-btns'
  var showBtns = mimeHasCompressParams(item.mimeType)
  ;(showBtns ? (item.recentParams || []) : []).forEach(function (p) {
    var btn = document.createElement('button')
    btn.type = 'button'; btn.className = 'history-copy-btn'
    btn.textContent = formatParamLabel(item.mimeType, p)
    btn.title = item.isText ? '还原并转换' : '用此配置重新转换'
    ;(function (hi, hp) {
      btn.addEventListener('click', function () { reConvertFromHistory(hi, hp) })
    })(item, p)
    btns.appendChild(btn)
  })

  info.appendChild(top); info.appendChild(btns)
  card.appendChild(thumb); card.appendChild(info)
  return card
}

function formatGroupDate(ts) {
  var d = new Date(ts), today = new Date(), yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString())     return '今天'
  if (d.toDateString() === yesterday.toDateString()) return '昨天'
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

async function renderHistory() {
  var history = await HistoryDB.getAll()
  historySection.style.display = history.length === 0 ? 'none' : 'block'
  viewMoreBtn.style.display    = history.length > HISTORY_PREVIEW ? 'inline-block' : 'none'
  historyList.innerHTML = ''
  history.slice(0, HISTORY_PREVIEW).forEach(function (item) {
    historyList.appendChild(makeHistoryCard(item))
  })
}

async function renderDrawer(keyword) {
  var history = await HistoryDB.getAll()
  if (keyword) {
    var kw = keyword.toLowerCase()
    history = history.filter(function (x) { return x.name.toLowerCase().indexOf(kw) !== -1 })
  }
  drawerList.innerHTML = ''
  var lastGroup = ''
  history.forEach(function (item) {
    var group = formatGroupDate(item.time)
    if (group !== lastGroup) {
      var title = document.createElement('div')
      title.className = 'drawer-group-title'; title.textContent = group
      drawerList.appendChild(title); lastGroup = group
    }
    drawerList.appendChild(makeHistoryCard(item))
  })
  if (history.length === 0) {
    var empty = document.createElement('div')
    empty.className = 'drawer-empty'
    empty.textContent = keyword ? '没有匹配的记录' : '暂无历史记录'
    drawerList.appendChild(empty)
  }
}

function openDrawer() {
  renderDrawer(historySearch.value)
  historyDrawer.classList.add('drawer--open')
  drawerOverlay.classList.add('drawer-overlay--show')
  document.body.style.overflow = 'hidden'
}
function closeDrawer() {
  historyDrawer.classList.remove('drawer--open')
  drawerOverlay.classList.remove('drawer-overlay--show')
  document.body.style.overflow = ''
}

// ── Input Tab Switch ─────────────────────────────────────
function switchInputTab(tab) {
  for (var k = 0; k < inputTabBtns.length; k++) {
    inputTabBtns[k].classList.toggle('input-tab--active', inputTabBtns[k].getAttribute('data-tab') === tab)
  }
  tabUpload.style.display = tab === 'upload' ? 'block' : 'none'
  tabPaste.style.display  = tab === 'paste'  ? 'block' : 'none'
  if (tab === 'upload') {
    textarea.value = ''
    updateParamsVisibility(pendingFiles.length ? 'image' : 'none')
    if (!pendingFiles.length) { convertDisabled(true) }
  } else {
    pendingFiles = []; renderFilePreview()
    updateParamsVisibility(textarea.value ? 'svg' : 'none')
    convertDisabled(!textarea.value)
  }
}

// ── File Preview ─────────────────────────────────────────
function renderFilePreview() {
  if (pendingFiles.length === 0) {
    filePreview.style.display = 'none'
    uploadZone.classList.remove('upload-zone--has-files')
    return
  }
  uploadZone.classList.add('upload-zone--has-files')
  filePreview.style.display = 'flex'
  filePreview.innerHTML = ''
  pendingFiles.forEach(function (file, idx) {
    var card = document.createElement('div'); card.className = 'file-card'
    var thumb = document.createElement('img'); thumb.className = 'file-card-thumb'
    var url = URL.createObjectURL(file); thumb.src = url; thumb.alt = file.name
    thumb.onload = function () { URL.revokeObjectURL(url) }
    var name = document.createElement('span'); name.className = 'file-card-name'
    name.textContent = file.name; name.title = file.name
    var rm = document.createElement('button'); rm.type = 'button'
    rm.className = 'file-card-remove'; rm.textContent = '×'
    ;(function (i) {
      rm.addEventListener('click', function (e) {
        e.stopPropagation()
        pendingFiles.splice(i, 1)
        renderFilePreview()
        if (pendingFiles.length === 0) {
          convertDisabled(true); resultToggle('none')
          updateParamsVisibility('none')
        } else {
          updateParamsVisibility('image')
        }
      })
    })(idx)
    card.appendChild(thumb); card.appendChild(name); card.appendChild(rm)
    filePreview.appendChild(card)
  })
}
