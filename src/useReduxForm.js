import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import * as R from 'ramda';
import { get } from 'lens-o';
import usePrevious from 'use-previous';
import { setInitialValues, updateField } from './redux/actions';
import { isEvent, genericError, computeExclude } from './utils';

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
  const prevFormState = usePrevious(formState);
  const [isDisabled, setIsDisabled] = useState(false);

  const errors = useMemo(() => {
    // NOTE `initialValues` is possible to be given but not initialzed yet
    if (!formState) {
      return {};
    }

    return validate(formState) || {};
  }, [validate, formState]);

  useEffect(() => {
    if (R.isNil(onChange) && !R.isNil(initialValues)) {
      if (storePath.indexOf('.') === -1) {
        dispatch(setInitialValues(initialValues));
      } else {
        dispatch(
          updateField({
            name: R.compose(R.join('.'), R.tail, R.split('.'))(storePath),
            value: initialValues,
          }),
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setIsDisabled(onDisable());
  }, [onDisable]);

  // to Redux
  const handleChange = useCallback(
    (name, _shouldTransform) => (evt) => {
      let value = evt;

      if (isEvent(evt)) {
        value = get('target.value', evt);
      }

      const args = {
        value: _shouldTransform ? transform({ name, value }) : value,
        name,
      };

      if (typeof onChange === 'function') {
        onChange(args);
      } else {
        if (storePath.indexOf('.') > -1) {
          args.name = R.compose(
            R.join('.'),
            R.append(args.name),
            R.tail,
            R.split('.'),
          )(storePath);
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
        _fieldPath = [_fieldPath, key(_value, formState)].join('.');
        _value = get(_fieldPath, formState);
      }

      if (_shouldTransform) {
        // to field
        _value = transform({
          name: _fieldPath,
          value: R.compose((v) => String(v), R.defaultTo(''))(_value),
        });
      }

      return R.omit(
        R.compose(computeExclude(include), R.concat(exclude))(_exclude),
        {
          onChange: handleChange(_fieldPath, _shouldTransform),
          value: _value,
          selected: _value,
          disabled: isDisabled,
          name: name || _fieldPath,
        },
      );
    },
    [formState, isDisabled, handleChange, transform, exclude],
  );

  if (debug) {
    /* eslint-disable */
    // TODO render only once
    console.groupCollapsed('%cuseReuxForm:', 'color: #bada55');
    console.log('previous form state: ', prevFormState);
    console.log('current form state: ', formState);
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
