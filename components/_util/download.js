export function downloadData(data, strFileName, strMimeType) {
  var self = window, // this script is only for browsers anyway...
    u = 'application/octet-stream', // this default mime also triggers iframe downloads
    m = strMimeType || u,
    x = data,
    D = document,
    a = D.createElement('a'),
    z = function (a) {
      return String(a);
    },
    B = self.Blob || self.MozBlob || self.WebKitBlob || z,
    BB = self.MSBlobBuilder || self.WebKitBlobBuilder || self.BlobBuilder,
    fn = strFileName || 'download',
    blob,
    b,
    ua,
    fr;

  //if(typeof B.bind === 'function' ){ B=B.bind(self); }

  if (String(this) === 'true') {
    //reverse arguments, allowing download.bind(true, "text/xml", "export.xml") to act as a callback
    x = [x, m];
    m = x[0];
    x = x[1];
  }

  //go ahead and download dataURLs right away
  if (String(x).match(/^data\:[\w+\-]+\/[\w+\-]+[,;]/)) {
    return navigator.msSaveBlob // IE10 can't do a[download], only Blobs:
      ? navigator.msSaveBlob(d2b(x), fn)
      : saver(x); // everyone else can save dataURLs un-processed
  } //end if dataURL passed?

  try {
    blob = x instanceof B ? x : new B([x], { type: m });
  } catch (y) {
    if (BB) {
      b = new BB();
      b.append([x]);
      blob = b.getBlob(m); // the blob
    }
  }

  function d2b(u) {
    var p = u.split(/[:;,]/),
      t = p[1],
      dec = p[2] == 'base64' ? window.atob : window.decodeURIComponent,
      bin = dec(p.pop()),
      mx = bin.length,
      i = 0,
      uia = new Uint8Array(mx);

    for (i; i < mx; ++i) uia[i] = bin.charCodeAt(i);

    return new B([uia], { type: t });
  }

  function saver(url, winMode) {
    if ('download' in a) {
      //html5 A[download]
      a.href = url;
      a.setAttribute('download', fn);
      a.innerHTML = 'downloading...';
      a.style = 'display:none';
      D.body.appendChild(a);
      setTimeout(function () {
        a.click();
        D.body.removeChild(a);
        if (winMode === true) {
          setTimeout(function () {
            self.URL.revokeObjectURL(a.href);
          }, 250);
        }
      }, 66);
      return true;
    }

    //do iframe dataURL download (old ch+FF):
    var f = D.createElement('iframe');
    D.style = 'display:none';
    D.body.appendChild(f);
    if (!winMode) {
      // force a mime that will download:
      url = 'data:' + url.replace(/^data:([\w\/\-\+]+)/, u);
    }

    f.src = url;
    setTimeout(function () {
      D.body.removeChild(f);
    }, 333);
  } //end saver

  if (navigator.msSaveBlob) {
    // IE10+ : (has Blob, but not a[download] or URL)
    return navigator.msSaveBlob(blob, fn);
  }

  if (self.URL) {
    // simple fast and modern way using Blob and URL:
    saver(self.URL.createObjectURL(blob), true);
  } else {
    // handle non-Blob()+non-URL browsers:
    if (typeof blob === 'string' || blob.constructor === z) {
      try {
        return saver('data:' + m + ';base64,' + self.btoa(blob));
      } catch (y) {
        return saver('data:' + m + ',' + encodeURIComponent(blob));
      }
    }

    // Blob but not URL:
    fr = new FileReader();
    fr.onload = function (e) {
      saver(this.result);
    };
    fr.readAsDataURL(blob);
  }
  return true;
}

export function download(url, name, callback, _options) {
  if(!url) return
  let options = _options||{}
  let filename = name
  if(!filename) {
    let _url = new URL(url)
    filename = _url.pathname.split('/').pop()
  }

  return new Promise((res, rej) => {
    const x = new XMLHttpRequest()
    x.open(options.method||'GET', url, true)
    x.responseType = 'blob'
    x.timeout = 0
    x.onprogress = options.onprogress
    options.headers && Object.entries(options.headers).forEach(([key, val]) => { x.setRequestHeader(key, val) })
    x.onload = function () {
      downloadData(x.response, filename, x.response.type)
      res()
      callback && callback()
    }
    x.onerror = function () {
      rej()
    }
    x.send(options.body)
  })
}
