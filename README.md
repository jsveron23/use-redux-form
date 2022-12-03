# use-redux-form

[![npm](https://img.shields.io/npm/v/use-redux-form)](https://www.npmjs.com/package/use-redux-form)

With `use-redux-form`, any kind of React form components can be possible to use
simply with Redux store object.

> Inspired by ReduxForm

- Compatible with any component using `input tag`, `select tag`.
- For example `<DatePicker {...getFieldProps('createdAt')} />`

## Install

```bash
npm install use-redux-form
```

## Example

[https://codesandbox.io/s/zen-hooks-3y684](https://codesandbox.io/s/zen-hooks-3y684)

## API Reference

> `useReduxForm(options)`

```js
const {
  isValidated,
  isDisabled,
  values, // state of redux store
  errors, // return object from validate function
  handleSubmit,
  getFieldProps
} = useReduxForm({
  /**
   * Redux store path
   * @type {String}
   * @required
   */
  storePath: 'user.form',

  /**
   * Exclude props from `getFieldProps` return
   * @default []
   * @type {Array}
   */
  exclude: [],

  /**
   * Enable or Disable fields
   * @default F
   * @see {@link https://ramdajs.com/docs/#F}
   * @return {Boolean}
   */
  onDisable: () => isLoading,

  /**
   * Form validate
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
   * Transform values before reaching to `value`, `onChange`.
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
   * @default null
   * @see {@link https://ramdajs.com/docs/#identity}
   * @param  {String} name  fieldPath (getFieldProps)
   * @param  {*}      value value that you typed or stored in Redux store
   */
  onChange: ({ name, value }) => {
    if (name === 'A') {
      actionA(value)
    }

    actionB(value)
  },

  /**
   * Submit function
   * @default @default identity
   * @see {@link https://ramdajs.com/docs/#identity}
   * @param {Object} values
   * @param {Object} errors
   */
  onSubmit: ({ values, errors }) => {
    if (!isEmpty(errors)) {
      return Object.values(errors).forEach((value) => {
        if (value) {
          invalidAlert(value);
        }
      });
    }

    submit(values);
  },

  /**
   * Display current state log on console
   * @default falss
   */
  debug: true
})

return (
  <Field {...getFieldProps('username')} />
  <Button onClick={handleSubmit}>Submit<Button>
);
```

> `getFieldProps(fieldPath, options?)`

A function return form field props

```js
// reducer/user.js
const initialState = {
  form: {
    username: '',
    someObj: {
      password: '',
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
    },
  },
};

const { value, selected, disabled, name, onChange } = getFieldProps(
  /**
   * fieldPath (`username` => '')
   * @type {String}
   * @required
   */
  'someParentState.list.0.type', // => 'A'

  {
    /**
     * Field name
     * @type {String}
     * @default ''
     */
    name: 'userid',

    /**
     * Exclude props of field
     * @type {Array}
     * @default []
     */
    exclude: ['selected'],
  },
);
```

## License

MIT
