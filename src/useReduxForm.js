import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import * as R from 'ramda';
import { get } from 'lens-o';
import { setInitialValues, updateField } from './redux/actions';
import { isEvent, genericError } from './utils';

/**
 * use-redux-from hook
 * @param  {String}  storePath
 * @param  {Object?} [options={}]
 * @param  {Object?} [initialValues={}] for now, only work when `onChange` is not given
 * @return {Object}
 */
function useReduxForm(storePath, options = {}, initialValues = {}) {
  /**
   * @param {Function?} transform
   * @param {Function?} validate
   * @param {Function?} onSubmit
   * @param {Function?} onDisable
   * @param {Function?} onChange
   * @param {Boolean?}  debug
   */
  const {
    debug = false,
    exclude = [],
    transform = (o) => o.value,
    validate = R.always({}),
    onSubmit = R.identity,
    onDisable = R.F,
    onChange = null,
  } = options;

  if (!R.is(String, storePath) || R.isNil(storePath)) {
    throw genericError('invalid [storePath] given!');
  }

  const dispatch = useDispatch();
  const formState = useSelector(get(storePath), shallowEqual);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    if (!onChange) {
      if (storePath.indexOf('.') === -1) {
        dispatch(setInitialValues(initialValues));
      } else {
        const [, ...restPath] = storePath.split('.');
        const _storePath = restPath.join('.');

        dispatch(updateField({ name: _storePath, value: initialValues }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setIsDisabled(onDisable());
  }, [onDisable]);

  const errors = useMemo(() => {
    // NOTE `initialValues` is possible to be given but not initialzed yet
    if (!formState) {
      return {};
    }

    return validate(formState) || {};
  }, [validate, formState]);

  const handleChange = useCallback(
    (name) => (evt) => {
      let value = evt;

      if (isEvent(evt)) {
        value = evt.target.value;
      }

      const args = {
        value: transform({ name, value }),
        name,
      };

      if (typeof onChange === 'function') {
        onChange(args);
      } else {
        if (storePath.indexOf('.') > -1) {
          const [, ...restPath] = storePath.split('.');
          const _storePath = restPath.join('.');

          args.name = `${_storePath}.${args.name}`;
        }

        dispatch(updateField(args));
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
