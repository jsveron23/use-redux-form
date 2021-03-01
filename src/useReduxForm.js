import { useState, useEffect } from 'react'
import { useSelector, shallowEqual } from 'react-redux'
import { compose, identity, F, find, values, defaultTo } from 'ramda'
import {
  isNotNil,
  isNone,
  isEvent,
  genericError,
  parsePath,
  extractByPath,
  excludeProps,
} from './utils'

function useReduxForm({
  storePath,
  disable = F,
  validate = () => ({}),
  transform = (props) => props.value,
  onChange = identity,
  onSubmit = identity,
} = {}) {
  if (!storePath) {
    throw genericError('[storePath] is required!')
  }

  const [isDisabled, setIsDisabled] = useState(false)
  const getFormState = compose(extractByPath, parsePath)(storePath)
  const formState = useSelector(getFormState, shallowEqual)

  useEffect(() => {
    setIsDisabled(disable())
  }, [disable])

  const handleSubmit = (fn) => {
    const errors = validate(formState) || {}
    const isInvalid = compose(
      isNotNil,
      find(identity),
      values,
      defaultTo({}),
    )(errors)
    const args = { values: formState, isInvalid, errors }

    if (typeof fn === 'function') {
      fn({ ...args, onSubmit })
    } else {
      onSubmit({ ...args })
    }
  }

  const getFieldProps = (fieldPath, options = {}) => {
    const { isRequired = false, exclude = [], name = '', key } = options
    let computedKey = fieldPath
    let computedValue = extractByPath(parsePath(fieldPath), formState)

    if (!fieldPath || typeof fieldPath !== 'string') {
      throw genericError('invalid [fieldPath] given')
    }

    if (typeof key === 'function') {
      const computedPath = key(computedValue, formState)
      const hasNagativeIndex = /\[(-\d+?)\]/.test(computedPath)

      // to get rid of negitive array index
      if (hasNagativeIndex) {
        computedValue = ''
      } else {
        computedKey = `${fieldPath}${computedPath}`
        computedValue = extractByPath(parsePath(computedKey), formState)
      }
    }

    computedValue = String(defaultTo('', computedValue))

    const transformedValue = transform({
      value: computedValue,
      name: computedKey,
    })

    const isFalsy = isRequired && isNone(transformedValue)
    const errors = validate(formState) || {}
    const isInvalid = isFalsy || !!errors[computedKey]

    return excludeProps(exclude, {
      value: transformedValue,
      selected: transformedValue,
      disabled: isDisabled,
      name: name || computedKey,
      isInvalid,

      onChange: (evt) => {
        const { value } = isEvent(evt) ? evt.target : { value: evt }

        onChange(
          {
            value: transform({ name: computedKey, value }, evt),
            name: computedKey,
          },
          evt,
        )
      },
    })
  }

  return {
    isDisabled,
    handleSubmit,
    getFieldProps,
  }
}

export default useReduxForm
