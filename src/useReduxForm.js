import { useState, useEffect } from 'react'
import { useSelector, shallowEqual } from 'react-redux'
import {
  isEmpty,
  isNil,
  compose,
  identity,
  F,
  flip,
  find,
  values,
  complement,
  anyPass,
} from 'ramda'
import {
  isEvent,
  genericError,
  falsyToEmpty,
  extractState,
  excludeProps,
} from './utils'

const isNotNil = complement(isNil)
const isNotEmpty = complement(isEmpty)
const isNotNone = anyPass([isNotNil, isNotEmpty])

function useReduxForm({
  storePath = 'form',
  disable = () => F,
  validate = () => ({}),
  transform = (props) => props.value,
  onChange = identity,
  onSubmit = identity,
} = {}) {
  const [isDisabled, setIsDisabled] = useState(false)
  const getReduxState = flip(extractState)(storePath)
  const formState = useSelector(getReduxState, shallowEqual)

  useEffect(() => {
    setIsDisabled(disable())
  }, [disable])

  const handleSubmit = (fn) => {
    const errors = validate(formState)
    const isInvalid = compose(isNotNone, find(identity), values)(errors)

    if (typeof fn === 'function') {
      fn({ values: formState, isInvalid, errors, onSubmit })
    } else {
      onSubmit({ values: formState, isInvalid, errors })
    }
  }

  const getFieldProps = (name, options = {}) => {
    const { isRequired = false, exclude = [] } = options

    if (!name) {
      throw genericError('[name] is required')
    }

    const reduxStoreValue = compose(
      String,
      falsyToEmpty,
      extractState(formState),
    )(name)

    const transformedValue = transform({
      value: reduxStoreValue,
      name,
    })
    const isNone = isEmpty(transformedValue) || isNil(transformedValue)
    const isFalsy = isRequired && isNone
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
