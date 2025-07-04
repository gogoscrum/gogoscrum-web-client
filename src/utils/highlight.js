const highlight = function (elements, keyword, ...attributes) {
  if (keyword) {
    elements.forEach((element) => {
      attributes.forEach((attr) => {
        let attrValue = getDeepValue(element, attr)

        if (
          attrValue &&
          attrValue.toUpperCase().includes(keyword.toUpperCase())
        ) {
          element[`${attr}HighlightLabel`] = attrValue.replace(
            new RegExp(keyword, 'ig'),
            `<span style="color: red;">${'$&'}</span>`
          )
        }
      })
    })
  }

  return elements
}

function getDeepValue(obj, path) {
  let parts = path.split('.')
  if (parts.length == 1) {
    return obj[parts[0]]
  }
  return getDeepValue(obj[parts[0]], parts.slice(1).join('.'))
}

export default {
  highlight,
}
