import { useState, useEffect } from 'react'
import { useSelector, shallowEqual } from 'react-redux'
import { compose, identity, F, path, find, values } from 'ramda'
import {
  isNotNil,
  isNone,
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
  const getFormState = compose(path, parsePath)(storePath)
  const formState = useSelector(getFormState, shallowEqual)

  useEffect(() => {
    setIsDisabled(disable())
  }, [disable])

  const handleSubmit = (fn) => {
    const errors = validate(formState)
    const isInvalid = compose(isNotNil, find(identity), values)(errors)
    const args = { values: formState, isInvalid, errors }

    if (typeof fn === 'function') {
      fn({ ...args, onSubmit })
    } else {
      onSubmit({ ...args })
    }
  }

  const getFieldProps = (name, options = {}) => {
    const { isRequired = false, exclude = [], compute } = options
    let computedName = name
    let computedValue = path(parsePath(name), formState)

    if (!name || typeof name !== 'string') {
      throw genericError('[name] is required')
    }

    if (compute) {
      const computed = compute(computedValue, formState)

      computedName = `${name}${computed.name}`
      computedValue = computed.value
    }

    computedValue = compose(
      String, // if number, wrap it to string
      orEmpty,
    )(computedValue)

    const transformedValue = transform({
      value: computedValue,
      name: computedName,
    })

    const isFalsy = isRequired && isNone(transformedValue)
    const errors = validate(formState)
    const isInvalid = isFalsy || !!errors[computedName]

    return excludeProps(exclude, {
      value: transformedValue,
      selected: transformedValue,
      disabled: isDisabled,
      name: computedName,
      isInvalid,

      onChange: (evt) => {
        const { value } = isEvent(evt) ? evt.target : { value: evt }

        onChange({
          value: transform({ name: computedName, value }),
          name: computedName,
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
