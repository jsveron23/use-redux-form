# use-redux-form

[![npm](https://img.shields.io/npm/v/use-redux-form)](https://www.npmjs.com/package/use-redux-form)

With `use-redux-form`, any kind of React form components can be possible to use
simply with Redux store object.

- Compatible with any component using `input tag`, `select tag`.
- For example `<DatePicker {...getFieldProps('createdAt')} />`

## Install

```bash
npm install use-redux-form
```

## Upgrade to v2

```js
// useReduxForm
const { isValidated, isDisabled, values, errors, handleSubmit, getFieldProps } =
  useReduxForm();

// storePath
useReduxForm({ storePath: 'this-is-store-path' }); // v1
useReduxForm('this-is-store-path', {}); // v2
// disable - onDisable
useReduxForm({ disable: () => isLoading }); // v1
useReduxForm('this-is-store-path', { onDisable: () => isLoading }); // v2
// exclude (new)
useReduxForm('this-is-store-path', { exclude: [] }); // v2
// debug (new)
useReduxForm('this-is-store-path', { debug: true }); // v2
// initialValues (new) - only work when onChange is not given
useReduxForm(
  'this-is-store-path',
  {},
  {
    /* here */
  },
); // v2

// getFieldProps
const { value, selected, disabled, name, onChange } = getFieldProps('a.2.b', {
  key: () => {}, // no more
  isRequired: true, // no more
  include: [], // new
  exclude: [], // v1, v2
  name: 'my-name-is', // v1, v2
});
```

## Example

[Example](https://codesandbox.io/s/zen-hooks-3y684)

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
} = useReduxForm('user.form', {
  /**
   * Exclude props from `getFieldProps` returns (global)
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
   * @default always({})
   * @see {@link https://ramdajs.com/docs/#always}
   * @param  {Object} values
   * @return {Object}        empty object = valid
   */
  validate: (values) => {
    const errors = {}

    if (!values.username) {
      errors.username = 'required!'
    }

    return errors;
  },

  /**
   * Transform values before reaching to `value`, `onChange`.
   * @default (o) => o.value
   * @param  {String} name  fieldPath
   * @param  {*}      value
   * @return {*}            a component asks specific data type
   */
  transform: ({ name, value }) => {
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
}, {
  /*
     - initialValues
     - work only when onChange is not given (experimental feature)
   */
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
   * fieldPath
   * @type {String}
   * @required
   */
  'someParentState.list.0.type', // => 'A'

  {
    /**
     * Field name
     * @type {String}
     * @default fieldPath
     */
    name: 'userid',

    /**
     * Include props what excluded global (local)
     * @type {Array}
     * @default []
     */
    include: ['name'],

    /**
     * Exclude props from `getFieldProps` returns (local)
     * @type {Array}
     * @default []
     */
    exclude: ['selected'],

    /**
     * Dynamic fieldPath
     * (let's say 'someParentState.list' is `fieldPath`)
     * @param  {Array|Object}  fieldState object from `fieldPath`
     * @param  {Array|Object}  state
     * @return {String|Number}
     */
    key: (fieldState, state) => {
      const idx = fieldState.findIndex((item) => item.id === 2);

      // === someParentState.list.1.type
      return `${idx}.type`;
    },

    /**
     * Force transform stop
     * @type {Boolean}
     */
    transform: false,
  },
);
```

## License

MIT
