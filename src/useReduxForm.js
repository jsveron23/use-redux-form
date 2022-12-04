import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import * as R from 'ramda';
import { get } from 'lens-o';
import { setInitialValues, updateField } from './redux/actions';
import { isEvent, genericError } from './utils';

/**
 * use-redux-from hook
 * @param  {String}   storePath
 * @param  {Object}   options
 * @param  {Array}    options.exclude
 * @param  {Function} options.transform
 * @param  {Function} options.validate
 * @param  {Function} options.onSubmit
 * @param  {Function} options.onDisable
 * @param  {Function} options.onChange
 * @param  {Boolean}  options.debug
 * @return {Object}
 */
function useReduxForm(
  storePath,
  {
    debug = false,
    exclude = [],
    transform = (o) => o.value,
    validate = R.always({}),
    onSubmit = R.identity,
    onDisable = R.F,
    onChange = null,
  } = {},
  initialValues = {},
) {
  if (R.isNil(storePath)) {
    throw genericError('given [storePath] is empty!');
  }

  const dispatch = useDispatch();
  const formState = useSelector(get(storePath), shallowEqual);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    if (!onChange) {
      dispatch(setInitialValues(initialValues));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setIsDisabled(onDisable());
  }, [onDisable]);

  const errors = useMemo(() => {
    return validate(formState) || {};
  }, [validate, formState]);

  const handleChange = useCallback(
    (fieldPath) => (evt) => {
      let value = evt;

      if (isEvent(evt)) {
        value = evt.target.value;
      }

      const args = {
        value: transform({ name: fieldPath, value }),
        name: fieldPath,
      };

      if (typeof onChange === 'function') {
        onChange(args);
      } else {
        dispatch(updateField(storePath, args));
      }
    },
    [storePath, transform, onChange, dispatch],
  );

  const computeExclude = useCallback(
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
      if (R.isNil(fieldPath) || !R.is(String, fieldPath)) {
        throw genericError('invalid [fieldPath] given!');
      }

      const { exclude: _exclude = [], include = [], name = '' } = options;
      const transformedValue = transform({
        name: fieldPath,
        value: R.compose(
          (v) => String(v),
          R.defaultTo(''),
          get(fieldPath),
        )(formState),
      });

      const fieldProps = {
        onChange: handleChange(fieldPath),
        value: transformedValue,
        selected: transformedValue,
        disabled: isDisabled,
        name: name || fieldPath,
      };
      const excludeKeys = computeExclude(_exclude, include);

      return R.omit(excludeKeys, fieldProps);
    },
    [formState, isDisabled, handleChange, transform, computeExclude],
  );

  if (debug) {
    /* eslint-disable */
    console.groupCollapsed('%cuseReuxForm:', 'color: #bada55');
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
