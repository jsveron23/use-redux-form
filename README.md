# use-redux-form

[![npm](https://img.shields.io/npm/v/use-redux-form)](https://www.npmjs.com/package/use-redux-form) <!--<img alt="npm" src="https://img.shields.io/npm/dw/use-redux-form">-->

With `use-redux-form`, any kind of form components can be possible to use simply with Redux store object.

> Inspired by ReduxForm

* Compatible with any component using `input tag`, `select tag`.
* For example `<DatePicker {...getFieldProps('createdAt')} />`

## Install

```bash
npm install use-redux-form
```

## API Reference

### `useReduxForm`

> `useReduxForm(options)`

```js
const { isValidated, isDisabled, handleSubmit, getFieldProps } = useReduxForm({
  /**
   * Base target of Redux store path
   * @type {String}
   * @required
   */
  storePath: 'user.form',

  /**
   * Set/unset disable fields which components using `getFieldProps`.
   * @default F
   * @see {@link https://ramdajs.com/docs/#F}
   * @return {Boolean}
   */
  disable: () => isLoading,

  /**
   * Validate function
   * @default () => ({})
   * @param  {Object} values
   * @return {Object} empty object = valid
   */
  validate: (values) => {
    const errors = {}

    if (!values.username) {
      errors['username'] = 'required!'
    }

    return errors;
  },

  /**
   * Transform values before reaching to `value`, `onChange`. It runs first render also.
   * @default (args) => args.value
   * @param  {String} name  fieldPath
   * @param  {*}      value
   * @param  {*?}     evt   if nil value, not from `onChange`
   * @return {*}            a component asks specific data type
   */
  transform: ({ name, value }, evt) => {
    if (name === 'nil-to-zero') {
      return '0'
    }

    if (name === 'date') {
      return new Date(value)
    }

    return value;
  },

  /**
   * General `onChange` prop for all components using `getFieldProps`.
   * @default identity
   * @see {@link https://ramdajs.com/docs/#identity}
   * @param  {String} name  fieldPath (getFieldProps)
   * @param  {*}      value value that you typed or stored in Redux store
   * @param  {*?}     evt   same as component return value from `onChange`
   */
  onChange: ({ name, value }, evt) => {
    if (name === 'A') {
      actionA(value)
    }

    action(value)
  },

  /**
   * Submit function
   * @default @default identity
   * @see {@link https://ramdajs.com/docs/#identity}
   * @param {Object}  values
   * @param {Boolean} isInvalid
   * @param {Object}  errors    'validate'
   */
  onSubmit: ({ values, isInvalid, errors }) => {
    if (isInvalid) {
      return Object.values(errors).forEach((value) => {
        if (value) {
          invalidAlert(value);
        }
      });
    }

    action(values);
  },
})

return (
  <Field {...getFieldProps('username')} />
  <Button onClick={handleSubmit}>Submit<Button>
  <Button onClick={() => handleSubmit(
    /**
     * Extra process you need to do before submitting
     * @param {Object}  values
     * @param {Boolean} isInvalid
     * @param {Object}  errors    'validate'
     */
    ({ values, isInvalid, errors }) => {
      if (isInvalid) {
        return Object.values(errors).forEach((value) => {
          if (value) {
            invalidAlert(value);
          }
        });
      }

      action();
    }
  )}>Submit<Button>
);
```

### `getFieldProps`

A function return form field props

> `getFieldProps(fieldPath, options?)`

```js
// reducer/user.js
const initialState = {
  form: {
    username: '',
    someObj: {
      password: ''
    },
    someArray1: ['hello', 'world'],
    someParentState: {
      someArray2: ['world', 'hello'],
      list: [
        {
          id: 1,
          type: 'A',
          name: 'X',
        },
        {
          id: 2,
          type: 'B',
          name: 'Y',
        },
        {
          id: 3,
          type: 'C',
          name: 'Z',
        },
      ],
    }
  }
}

function reducer() {
  switch() {
    ...
  }
}

export default reducer

// reducer/index.js
import { combineReducers } from 'redux';
import user from './user.js'

export default combineReducers({ user });

// usage
const { value, selected, disabled, name, isInvalid, onChange } = getFieldProps(
  /**
   * fieldPath
   * is input field name if `option.name` is not given
   * is target property name
   * is parent node when `options.key` given
   * @type {String}
   * @required
   */
  'someParentState',

  {
    /**
     * Whether a field component required or not
     * - it would not validate value
     * - only for `isInvalid` prop currently
     * - validation before submitting, check `useReduxForm({ onSubmit })`
     * @type {Boolean}
     * @default false
     */
    isRequired: true,

    /**
     * Field name (if not given, it would use `someParentState` as field name)
     * @type {String}
     * @default ''
     */
    name: 'userid',

    /**
     * If <Field /> do not support specify props which `useReduxForm` uses,
     * then it could display error|warning on browser console.
     * To get rid of the message, use it like this.
     * @type {Array}
     * @default []
     */
    exclude: ['isInvalid', 'selected'],

    /**
     * Specific field path is impossible to sync value, such as dynamic list.
     * There is a list array that dynamically add/remove by some action.
     * It would be changed index number after the action triggering,
     * you can use unique id as example to track it.
     * @default undefined
     * @param  {*}      childState this case child node of `someParentState`
     * @return {String} fieldPath
     */
    key: (childState) => {
      const foundIndex = childState.findIndex(lookingForSpecificId)

      // now, this field component can track specific field without index
      // -> `form.someParentState.list[${foundIndex}].name`
      return `[${foundIndex}].name`,
    }
  }
)

// usage #1
const { getFieldProps } = useReduxForm({ storePath: 'user.form' })
return <Field {...getFieldProps('username')} />
// or
const { getFieldProps } = useReduxForm({ storePath: 'user' })
return <Field {...getFieldProps('form.username')} />

// usage #2
const { getFieldProps } = useReduxForm({ storePath: 'user.form' })
return <Field {...getFieldProps('someObj.password')} />

// usage #3
const { getFieldProps } = useReduxForm({ storePath: 'user.form' })
return <Field {...getFieldProps('someArray1[0]')} /> // -> hello
```

## Troubleshoot

**Duplicate dependencies issues**

You could have [Invalid Hook Call Warning](https://reactjs.org/warnings/invalid-hook-call-warning.html) issue if you use such as `npm link` or something.

There is a way to solve this issue by using `alias`, please read [this](https://github.com/facebook/react/issues/13991#issuecomment-435587809).

```js
alias: {
  react: Path.resolve('./node_modules/react'),
  'react-redux': Path.resolve('./node_modules/react-redux'),
  ...
},
```

## Todo

- [ ] unit test(useReduxForm.js)
- [ ] Provide action, action.type

## License

MIT
