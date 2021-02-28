# getFieldProps

A function return form field props automatically base of given parameters

```js
const Component = () => {
  // getFieldProps(...args) =>
  //   { name, value, selected, onChange, disabled, isInvalid }
  const { getFieldProps } = useReduxForm(options)

  return (
    <Field {...getFieldProps(fieldPath, options?)} />
  )
}
```

**Base Redux structure**

```js
// reducer<user.js>
const initialState = {
  form: {
    username: '',
    someObj: {
      password: ''
    },
    someArray1: ['hello', 'world'],
    someParentState: {
      someArray2: ['world', 'hello']
    }
  }
}

function reducer() {
  ...
}

export default reducer

// combineReducers
import { combineReducers } from 'redux';
import user from './user.js'

export default combineReducers({ user });
```

## API

### `fieldPath` (string)

* is input field name if option.name is not given
* is target property name
* is parent node when options.compute given

```js
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

// usage #4
const { getFieldProps } = useReduxForm({ storePath: 'user.form' })
return (
  <Field
    {...getFieldProps('someParentState', {
      key(childNodeState) {
        // -> world
        return 'someArray2[0]'
      }
    })}
  />)
```

### `options` (object?)

#### `options.isRequired`
> boolean?, default: false

Whether a field component required or not

* it would not validate value
* only for `isInvalid` prop currently
* validation before submitting, check `useReduxForm({ onSubmit })`

```js
const { getFieldProps } = useReduxForm({ storePath: 'user.form' })
return (
  <Field
    {...getFieldProps('username', {
      isRequired: true,
    })}
  />
)
```

#### `options.name`
> string?, default: ''

Field name

```js
const { getFieldProps } = useReduxForm({ storePath: 'user.form' })
return (
  <Field
    {...getFieldProps('username', {
      name: 'userid' // if not given, it would use `username`
    })}
  />
)
```

#### `options.exclude`
> array?, default: []

If <Field /> do not support specify props which `useReduxForm` want to use, then it could display error on browser console. To get rid of the error message, use it like this.

```js
const { getFieldProps } = useReduxForm({ storePath: 'user.form' })
return (
  <Field
    {...getFieldProps('segment-id', {
      exclude: ['isInvalid'],
    })}
  />
)
```

#### `options.key`
> function?

Specific field path is not possible to sync value, such as dynamic list. There is a list array that dynamically add/remove by some action. It would be changed index number after the action triggering, You can use unique id as example to track it.

```js
// reducer<user.js>
const initialState = {
  form: {
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
}

const { getFieldProps } = useReduxForm({ storePath: 'user.form' })
// after remove first item, then `list[0]` will be 'B' value
return <Field {...getFieldProps('form.list[0]')} />

// this option is designed for dynamic list
return (
  <SomeComponent>
    {list.map(({ id, type, name }) => {
      return (
        <Field
          {...getFieldProps('form.list', {
            key(childState /* `form.list` is parent node path */) {
              const foundIndex = childState.findIndex(lookingForSpecificId)

              // now, this field component can track specific field without index
              return `[${foundIndex}].name`, // -> 'form.list[index].name'
            },
          })}
        />
      )
    })}
    <Button onClick={removeItem}>Remove</Button>
  </SomeComponent>
)
```
