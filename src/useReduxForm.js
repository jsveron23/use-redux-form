import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import * as R from 'ramda';
import { get } from 'lens-o';
import { updateField } from './redux/actions';
import { isEvent, genericError } from './utils';

// TODO initial state

/**
 * use-redux-from hook
 * @param  {Object}   options
 * @param  {String}   options.storePath
 * @param  {Array}    options.exclude
 * @param  {Function} options.transform
 * @param  {Function} options.validate
 * @param  {Function} options.onSubmit
 * @param  {Function} options.onDisable
 * @param  {Function} options.onChange
 * @param  {Boolean}  options.debug
 * @return {Object}
 */
function useReduxForm({
  storePath = '',
  exclude = [],
  transform = (o) => o.value,
  validate = R.identity,
  onSubmit = R.identity,
  onDisable = R.F,
  onChange = null,
  debug = false,
} = {}) {
  if (R.isNil(storePath)) {
    throw genericError('given [storePath] is empty!');
  }

  const dispatch = useDispatch();
  const formState = useSelector(get(storePath), shallowEqual);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    setIsDisabled(onDisable());
  }, [onDisable]);

  const errors = useMemo(() => {
    return validate(formState) || {};
  }, [validate, formState]);

  const handleTransform = useCallback(
    (name, value) => {
      return transform({ name, value });
    },
    [transform],
  );

  const handleChange = useCallback(
    (fieldPath) => (evt) => {
      let value = evt;

      if (isEvent(evt)) {
        value = evt.target;
      }

      const args = {
        value: handleTransform(fieldPath, value),
        name: fieldPath,
      };

      // changing value

      if (onChange === 'function') {
        onChange(args);
      } else {
        dispatch(updateField(storePath, args));
      }
    },
    [storePath, handleTransform, onChange, dispatch],
  );

  const getKeys = useCallback(
    (_exclude = [], include = []) => {
      return R.compose(
        R.without(...include),
        R.uniq,
        R.concat(exclude),
      )(_exclude);
    },
    [exclude],
  );

  const handleSubmit = useCallback(() => {
    onSubmit({ values: formState, errors });
  }, [onSubmit, errors, formState]);

  const getFieldProps = useCallback(
    (fieldPath, options = {}) => {
      if (!R.isNil(fieldPath) || !R.is(String, fieldPath)) {
        throw genericError('invalid [fieldPath] given!');
      }

      const { exclude: _exclude = [], include = [], name = '' } = options;

      // before change
      // TODO compose
      const transformedValue = handleTransform(
        fieldPath,
        String(R.defaultTo('', get(fieldPath, formState))),
      );

      const fieldProps = {
        onChange: handleChange(fieldPath),
        value: transformedValue,
        selected: transformedValue,
        disabled: isDisabled,
        name: name || fieldPath,
      };

      return R.omit(getKeys(_exclude, include), fieldProps);
    },
    [formState, isDisabled, handleChange, handleTransform, getKeys],
  );

  if (debug) {
    /* eslint-disable */
    console.groupCollapsed('useReuxForm:');
    // TODO diff
    console.log('state: ', formState);
    console.groupEnd();
    /* eslint-enable */
  }

  return {
    isValidated: R.isEmpty(errors),
    values: formState,
    errors,
    isDisabled,
    handleSubmit,
    getFieldProps,
  };
}

export default useReduxForm;
