import generateUUID from './generateUUID'
import { message } from "ant-design-vue";
import { buildURL, getFileSuffixByURL } from './buildURL'

let input = null

export function uploadHandler(_params) {
  const { fileList, fileType, fileSize, filename, withFile, request: { url, data, params, headers, onProgress, fieldName = 'file', getResult, withCredentials } = { fieldName: 'file' } } = _params
  for (let i = 0; i < fileList.length; i++) {
    const cur = fileList[i];
    const file = cur.file;
    if(cur.status !== 'await') continue

    if(fileType instanceof Array && !fileType.includes('*')) {
      const typeArr = fileType.map(item => item.toUpperCase())
      if(!typeArr.includes(getFileSuffixByURL(file.name).toUpperCase())) {
        message.warning(`文件类型${getFileSuffixByURL(file.name)}不支持`)
        continue
      }
    }

    if(typeof fileSize === 'number' && fileSize !== 0) {
      const size = file.size / 1024 / 1024 < (fileSize / 1024);
      if (!size) {
        message.warning(`文件大小不能超过${Math.round(+(fileSize / 1024) + 'e' + 1) / Math.pow(10, 1)}MB`)
        continue
      }
    }

    cur.status = 'uploading'
    onProgress && onProgress(fileList)
    const formData = new FormData()
    formData.append(fieldName, file, filename||`${cur.id}.${getFileSuffixByURL(file.name)}`)
    if(data) {
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          const element = data[key];
          formData.append(key,element)
        }
      }
    }
    const xhr = new XMLHttpRequest()
    xhr.open('post', buildURL(url, params), true)
    xhr.timeout = 0
    xhr.withCredentials = withCredentials
    xhr.upload.onprogress = event => {
      cur.progress = parseInt(String(((event.loaded / event.total) * 100) | 0), 10)
      onProgress && onProgress(fileList)
    }
    headers && Object.entries(headers).forEach(([key, val]) => { xhr.setRequestHeader(key, val) })
    xhr.onerror = function () {
      cur.status = 'fail'
      cur.progress = 0
      onProgress && onProgress(fileList)
      message.error(xhr.responseText||'error')
    }
    xhr.onload = async () => {
      if(xhr.status !== 200) {
        xhr.onerror()
        return
      }
      if(getResult) {
        const { isSuccess, url } = await getResult(xhr)
        if(!isSuccess) {
          xhr.onerror()
          return
        }
        cur.status = 'success'
        cur.url = url
        fileList.forEach(item => withFile && delete item.file)
        onProgress && onProgress(fileList)
      }
    }
    xhr.send(formData)
  }
}

function clearDefaultFn(event) {
  const e = event || window.event;
  e.preventDefault();
}

export function clearDefault(event) {
  document.addEventListener('dragentetr', clearDefaultFn);
  document.addEventListener('dragleave', clearDefaultFn);
  document.addEventListener('drop', clearDefaultFn);
  document.addEventListener('dragover', clearDefaultFn);
}

function onchange(files, options) {
  if(['multiple'].includes(options.mode)) {
    options.fileList.push(...Array.prototype.map.call(files, item => ({file:item,status:'await',id:generateUUID(),filename: item.name,progress: 0})))
  }else {
    options.fileList.splice(0, options.fileList.length)
    fileList.push([{file:files[0],status:'await',id:generateUUID(),filename: files[0].name,progress: 0}])
  }
  uploadHandler(options)
}

export function trigger(action = 'click', options = {}, e) {
  switch (action) {
    case 'click':
      input && input.remove()
      input = document.createElement('input')
      input.type = 'file'
      input.multiple = ['multiple'].includes(options.mode)
      // input.webkitdirectory = true
      // input.directory = true
      input.style.display = 'none'
      input.onchange = () => {
        if (!input.files||!input.files.length) return
        onchange(input.files, options)
      };
      document.body.append(input)
      input.click()
      break
    case 'drop':
      if (!e.dataTransfer.files.length) return
      onchange(e.dataTransfer.files, options)
      break
  }
}

export default {
  install(_Vue) {
    _Vue.prototype.$fileUpload = {
      trigger,
      uploadHandler
    }
  }
}
