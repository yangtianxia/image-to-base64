// ── Toast ────────────────────────────────────────────────
function showToast(msg, type) {
  var t = document.createElement('div')
  t.className = 'toast toast--' + (type || 'success')
  t.textContent = msg
  toastContainer.appendChild(t)
  requestAnimationFrame(function () { requestAnimationFrame(function () { t.classList.add('toast--show') }) })
  setTimeout(function () {
    t.classList.remove('toast--show')
    t.addEventListener('transitionend', function h() {
      t.removeEventListener('transitionend', h)
      if (t.parentNode) t.parentNode.removeChild(t)
    })
  }, 2500)
}

// ── Clipboard ────────────────────────────────────────────
function copyText(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
      .then(function () { showToast('复制成功', 'success') })
      .catch(function (err) { fallbackCopy(text, err) })
  } else { fallbackCopy(text, null) }
}
function fallbackCopy(text, err) {
  var tmp = document.createElement('textarea')
  tmp.value = text
  tmp.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none'
  document.body.appendChild(tmp); tmp.focus(); tmp.select()
  var ok = false; try { ok = document.execCommand('copy') } catch (e) {}
  document.body.removeChild(tmp)
  showToast(ok ? '复制成功' : (err ? err.message : '复制失败，请手动复制'), ok ? 'success' : 'error')
}

// ── Format helpers ───────────────────────────────────────
function getFormattedOutput(base64, format) {
  if (format === 'css')  return 'background-image: url("' + base64 + '");'
  if (format === 'html') return '<img src="' + base64 + '" alt="" />'
  return base64
}
function calcBase64Size(base64) {
  var data = base64.replace(/^data:[^;]+;base64,/, '')
  var bytes = Math.round(data.length * 3 / 4)
  return bytes < 1024 ? bytes + ' B'
    : bytes < 1024 * 1024 ? (bytes / 1024).toFixed(1) + ' KB'
    : (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

// ── File / MIME helpers ──────────────────────────────────
function formatFileSize(bytes) {
  return bytes < 1024 ? bytes + ' B'
    : bytes < 1024 * 1024 ? (bytes / 1024).toFixed(1) + ' KB'
    : (bytes / 1024 / 1024).toFixed(2) + ' MB'
}
function mimeToExt(mime) {
  var sub = (mime || '').split('/')[1] || ''
  return (sub.replace('jpeg', 'jpg').replace('x-icon', 'ico').replace('vnd.microsoft.icon', 'ico').toUpperCase()) || '未知'
}
function formatParamLabel(mimeType, p) {
  var parts = []
  if (mimeType === 'image/svg+xml') {
    parts.push(p.doubleQuote ? '双引号' : 'SVG')
  } else if (mimeType === 'image/jpeg' || mimeType === 'image/bmp') {
    if (p.quality != null) parts.push(Math.round(p.quality * 100) + '%')
    if (p.maxWidth)        parts.push(p.maxWidth + 'px')
  } else if (mimeType === 'image/png') {
    if (p.maxWidth)        parts.push(p.maxWidth + 'px')
  }
  if (p.convertedSize) parts.push(p.convertedSize)
  return parts.join(' · ') || '默认'
}
function mimeHasCompressParams(mimeType) {
  return mimeType === 'image/svg+xml' || mimeType === 'image/jpeg' ||
    mimeType === 'image/bmp' || mimeType === 'image/png'
}

// ── Dark Mode ────────────────────────────────────────────
function setTheme(dark) {
  document.body.classList.toggle('dark', dark)
  themeToggle.textContent = dark ? '☀️' : '🌙'
  localStorage.setItem('theme', dark ? 'dark' : 'light')
}
