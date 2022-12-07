import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import * as R from 'ramda';
import { get } from 'lens-o';
import { setInitialValues, updateField } from './redux/actions';
import { isEvent, getTailPath, genericError, computeExclude } from './utils';

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
    if (R.isNil(onChange)) {
      if (storePath.indexOf('.') === -1) {
        dispatch(setInitialValues(initialValues));
      } else {
        dispatch(
          updateField({ name: getTailPath(storePath), value: initialValues }),
        );
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

  // to Redux
  const handleChange = useCallback(
    (name, _shouldTransform) => (evt) => {
      let value = evt;

      if (isEvent(evt)) {
        value = evt.target.value;
      }

      const args = {
        value: _shouldTransform ? transform({ name, value }) : value,
        name,
      };

      if (typeof onChange === 'function') {
        onChange(args);
      } else {
        if (storePath.indexOf('.') > -1) {
          args.name = `${getTailPath(storePath)}.${args.name}`;
        }

        dispatch(updateField(args));
      }
    },
    [storePath, transform, onChange, dispatch],
  );

  const handleSubmit = useCallback(() => {
    onSubmit({ values: formState, errors });
  }, [onSubmit, errors, formState]);

  const getFieldProps = useCallback(
    (fieldPath, options = {}) => {
      // TODO strict checking (no special char except .)
      if (R.isNil(fieldPath) || !R.is(String, fieldPath)) {
        throw genericError('invalid [fieldPath] given!');
      }

      const {
        exclude: _exclude = [],
        transform: _shouldTransform = true,
        include = [],
        name = '',
        key,
      } = options;
      let _fieldPath = fieldPath;
      let _value = get(_fieldPath, formState);

      if (typeof key === 'function' && R.is(Array, _value)) {
        _fieldPath = `${_fieldPath}.${key(_value, formState)}`;
        _value = get(_fieldPath, formState);
      }

      if (_shouldTransform) {
        // to field
        _value = transform({
          name: _fieldPath,
          value: R.compose((v) => String(v), R.defaultTo(''))(_value),
        });
      }

      const fieldProps = {
        onChange: handleChange(_fieldPath, _shouldTransform),
        value: _value,
        selected: _value,
        disabled: isDisabled,
        name: name || _fieldPath,
      };

      return R.omit(
        R.compose(computeExclude(include), R.concat(exclude))(_exclude),
        fieldProps,
      );
    },
    [formState, isDisabled, handleChange, transform, exclude],
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
