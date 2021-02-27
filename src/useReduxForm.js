import { useState, useEffect } from 'react'
import { useSelector, shallowEqual } from 'react-redux'
import { compose, identity, F, path, find, values } from 'ramda'
import {
  isNone,
  isNotNone,
  isEvent,
  genericError,
  orEmpty,
  parsePath,
  excludeProps,
} from './utils'

function useReduxForm({
  storePath = 'form',
  disable = F,
  validate = () => ({}),
  transform = (props) => props.value,
  onChange = identity,
  onSubmit = identity,
} = {}) {
  const [isDisabled, setIsDisabled] = useState(false)
  const getState = compose(path, parsePath)(storePath)
  const formState = useSelector(getState, shallowEqual)

  useEffect(() => {
    setIsDisabled(disable())
  }, [disable])

  const handleSubmit = (fn) => {
    const errors = validate(formState)
    const isInvalid = compose(isNotNone, find(identity), values)(errors)
    const args = { values: formState, isInvalid, errors }

    if (typeof fn === 'function') {
      fn({ ...args, onSubmit })
    } else {
      onSubmit({ ...args })
    }
  }

  const getFieldProps = (name, options = {}) => {
    const { isRequired = false, exclude = [] } = options

    if (!name) {
      throw genericError('[name] is required')
    }

    const storeValue = compose(
      String, // if number, wrap it to string
      orEmpty,
      path(parsePath(name)),
    )(formState)

    const transformedValue = transform({
      value: storeValue,
      name,
    })
    const isFalsy = isRequired && isNone(transformedValue)
    const errors = validate(formState)
    const isInvalid = isFalsy || !!errors[name]

    return excludeProps(exclude, {
      value: transformedValue,
      selected: transformedValue,
      disabled: isDisabled,
      name,
      isInvalid,

      onChange: (evt) => {
        const { value } = isEvent(evt) ? evt.target : { value: evt }

        onChange({
          value: transform({ name, value }),
          name,
        })
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
