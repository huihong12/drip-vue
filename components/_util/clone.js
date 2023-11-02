export function clone(obj) {
  if (!obj) return obj
  if (Object.prototype.toString.call(obj) === '[object Object]') {
    const object = {}
    Object.entries(obj).forEach(([key, val]) => {
      if (val && Object.prototype.toString.call(val) === '[object Object]') object[key] = clone(val)
      else object[key] = val
    })
    return object
  }
  if (Object.prototype.toString.call(obj) === '[object Array]') {
    const arr = []
    obj.forEach((item, i) => {
      if (
        item &&
        (Object.prototype.toString.call(item) === '[object Object]' ||
          Object.prototype.toString.call(item) === '[object Array]')
      )
        arr[i] = clone(item)
      else arr[i] = item
    })
    return arr
  }
  return obj
}