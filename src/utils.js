import { is, compose, flip, path, split, reduce, keys, curry } from 'ramda'

export function falsyToEmpty(v) {
  return v || ''
}

export function isEvent(v) {
  if (!v) {
    return false
  }

  const isNativeEvt = v.nativeEvent.constructor.name.indexOf('Event') > -1

  return is(Object, v) && !!v.nativeEvent && isNativeEvt
}

export function clean(v = []) {
  return v.filter(Boolean)
}

export function genericError(message, props = {}) {
  const err = new Error(message)

  Object.keys(props).forEach((key) => {
    const val = props[key]

    err[key] = val
  })

  return err
}

function _extractState(state, rootPath) {
  return compose(flip(path)(state), clean, split(/\.|\[(.+)\]/))(rootPath)
}
export const extractState = curry(_extractState)

export function excludeProps(exclude, props) {
  return compose(
    reduce((acc, key) => {
      if (exclude.includes(key)) {
        return acc
      }

      return {
        ...acc,
        [key]: props[key],
      }
    }, {}),
    keys,
  )(props)
}
