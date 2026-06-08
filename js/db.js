var HistoryDB = (function () {
  var IDB_NAME = 'img2b64', IDB_VER = 2, STORE = 'history'
  var HIST_MAX = 50
  var _db = null, _idb = false

  function _open() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(IDB_NAME, IDB_VER)
      req.onupgradeneeded = function (e) {
        var db = e.target.result
        if (db.objectStoreNames.contains(STORE)) db.deleteObjectStore(STORE)
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
      req.onsuccess = function (e) { resolve(e.target.result) }
      req.onerror   = function () { reject() }
    })
  }

  return {
    init: function () {
      if (!window.indexedDB) return Promise.resolve()
      return _open().then(function (db) { _db = db; _idb = true }).catch(function () {})
    },
    isIDB: function () { return _idb },
    getAll: function () {
      if (!_idb) return Promise.resolve([])
      return new Promise(function (resolve) {
        var req = _db.transaction(STORE, 'readonly').objectStore(STORE).getAll()
        req.onsuccess = function () { resolve((req.result || []).slice().reverse()) }
        req.onerror   = function () { resolve([]) }
      })
    },
    add: function (item) {
      if (!_idb) return Promise.resolve()
      return new Promise(function (resolve) {
        var tx = _db.transaction(STORE, 'readwrite'), store = tx.objectStore(STORE)
        store.add(item)
        tx.oncomplete = function () {
          var tx2 = _db.transaction(STORE, 'readwrite'), s2 = tx2.objectStore(STORE)
          var cnt = s2.count()
          cnt.onsuccess = function () {
            if (cnt.result > HIST_MAX) {
              var cur = s2.openCursor(); var del = cnt.result - HIST_MAX
              cur.onsuccess = function (e) {
                var c = e.target.result
                if (c && del > 0) { c.delete(); del--; c.continue() }
              }
            }
          }
          resolve()
        }
        tx.onerror = resolve
      })
    },
    put: function (item) {
      if (!_idb) return Promise.resolve()
      return new Promise(function (resolve) {
        var tx = _db.transaction(STORE, 'readwrite')
        tx.objectStore(STORE).put(item)
        tx.oncomplete = resolve; tx.onerror = resolve
      })
    },
    remove: function (id) {
      if (!_idb) return Promise.resolve()
      return new Promise(function (resolve) {
        var tx = _db.transaction(STORE, 'readwrite')
        tx.objectStore(STORE).delete(id)
        tx.oncomplete = resolve; tx.onerror = resolve
      })
    },
    clear: function () {
      if (!_idb) return Promise.resolve()
      return new Promise(function (resolve) {
        var tx = _db.transaction(STORE, 'readwrite')
        tx.objectStore(STORE).clear()
        tx.oncomplete = resolve; tx.onerror = resolve
      })
    }
  }
})()
