import {
  is,
  compose,
  map,
  filter,
  split,
  reduce,
  keys,
  test,
  complement,
  isNil,
  isEmpty,
  cond,
  identity,
  T,
} from 'ramda'

export const isNotNil = complement(isNil)
export const isNotEmpty = complement(isEmpty)

export function isNone(v) {
  return isEmpty(v) || isNil(v)
}

export function orEmpty(v) {
  return v || ''
}

export function isEvent(v) {
  if (!v) {
    return false
  }

  const isNativeEvt = v.nativeEvent.constructor.name.indexOf('Event') > -1

  return is(Object, v) && !!v.nativeEvent && isNativeEvt
}

export function genericError(message, props = {}) {
  const err = new Error(message)

  Object.keys(props).forEach((key) => {
    const val = props[key]

    err[key] = val
  })

  return err
}

export function parsePath(unparsedPath) {
  return compose(
    map(
      cond([
        [test(/[0-9]/), Number],
        [T, identity],
      ]),
    ),
    filter(Boolean),
    split(/\.|\[(.+)\]/),
  )(unparsedPath)
}

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
