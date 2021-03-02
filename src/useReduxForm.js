import { useState, useEffect } from 'react'
import { useSelector, shallowEqual } from 'react-redux'
import { compose, identity, F, find, values, path, defaultTo } from 'ramda'
import {
  isNotNil,
  isNone,
  isEvent,
  genericError,
  parsePath,
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
  const getFormState = compose(path, parsePath)(storePath)
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
    if (!fieldPath || typeof fieldPath !== 'string') {
      throw genericError('invalid [fieldPath] given')
    }

    const { isRequired = false, exclude = [], name = '', key } = options
    const parentPath = fieldPath
    const parentRoot = path(parsePath(fieldPath), formState)
    let finalPath = parentPath
    let finalValue = parentRoot

    if (typeof key === 'function') {
      const childPath = key(parentRoot, formState)
      const hasNagativeIndex = /\[(-\d+?)\]/.test(childPath)

      finalPath = `${parentPath}${childPath}`

      if (hasNagativeIndex) {
        finalValue = null
      } else {
        finalPath = `${parentPath}${childPath}`
        finalValue = path(parsePath(finalPath), formState)
      }
    }

    finalValue = String(defaultTo('', finalValue))

    const transformedValue = transform({
      value: finalValue,
      name: finalPath,
    })

    const isFalsy = isRequired && isNone(transformedValue)
    const errors = validate(formState) || {}
    const isInvalid = isFalsy || !!errors[finalPath] || !!errors[name]

    return excludeProps(exclude, {
      value: transformedValue,
      selected: transformedValue,
      disabled: isDisabled,
      name: name || finalPath,
      isInvalid,

      onChange: (evt) => {
        const { value } = isEvent(evt) ? evt.target : { value: evt }

        onChange(
          {
            value: transform({ name: finalPath, value }, evt),
            name: finalPath,
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
