# getFieldProps

A function return form field props automatically base of given parameters

```js
// getFieldProps(...args) =>
//   { name, value, selected, onChange, disabled, isInvalid }
const { getFieldProps } = useReduxForm(options)
```

## Base

Redux structure

```js
// reducer<user.js>
const initialState = {
  form: {
    username: '',
    someObj: {
      password: ''
    },
    someArray1: ['hello', 'world'],
    someParentPath: {
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

## Usage

### `name` (string)

- is input field name
- is child property name of given Redux store path
- is parent path when options.compute given

```js
// usage #1
const { getFieldProps } = useReduxForm({ storePath: 'user.form' })
return <Input {...getFieldProps('username')} />

// usage #2
const { getFieldProps } = useReduxForm({ storePath: 'user' })
return <Input {...getFieldProps('form.username')} />

// usage #3
const { getFieldProps } = useReduxForm({ storePath: 'user.form' })
return <Input {...getFieldProps('someObj.password')} />

// usage #4
const { getFieldProps } = useReduxForm({ storePath: 'user.form' })
return <Input {...getFieldProps('someArray1[0]')} /> // -> hello

// usage #5
const { getFieldProps } = useReduxForm({ storePath: 'user.form' })
return (
  <Input
    {...getFieldProps('someParentPath', {
      compute() {
        // -> world
        return {
          name: 'someArray2[0]',
          ...
        }
      }
    })}
  />)
```

### `options` (object?)

#### `options.isRequired` (boolean?, default: false)

Whether a field component required or not

- only for `isInvalid` prop currently
- want to block processes before submitting, check `useReduxForm({ onSubmit })`

```js
const { getFieldProps } = useReduxForm({ storePath: 'user.form' })
return (
  <Input
    {...getFieldProps('loginId', {
      isRequired: true,
    })}
  />
)
```

#### `options.exclude` (array?, default: [])

If component do not support specify props which `useReduxForm` want to use, then it displays validation error on browser console. To get rid of the error message, use it like this.

```js
const { getFieldProps } = useReduxForm({ storePath: 'user.form' })
return (
  <Input
    {...getFieldProps('segment-id', {
      // getFieldProps return `isInvalid` as prop
      // but component did not support
      exclude: ['isInvalid'],
    })}
  />
)
```

### `options.compute` (function?)

Specific path is not possible to track by given path, let's say, there is a list array that dynamically add/remove by some action, then it will change index number after the action.

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
// it can be ok at the first render, if would be expected 'A' value,
// but after remove first item, then `list[0]` will be 'B' value
return <Input {...getFieldProps('form.list[0]')} />

// this option is designed for dynamic list
return (
  <SomeComponent>
    {list.map(({ id, type, name }) => {
      return (
        <Input
          {...getFieldProps('form.list', {
            // can be computing name|path from outside scope,
            // then compute function not needed anymore
            compute(state /* `name`, applied given name as path */) {
              // state -> [{ type: 'A' }, ...]
              const foundIndex = state.findIndex(lookingForSpecificId)
              const foundValue = state.find(lookingForSpecificId)

              // now, this field component can track specific field without index
              return {
                name: `[${foundIndex}].name`, // -> 'form.list[index].name'
                value: found.name,
              }
            },
          })}
        />
      )
    })}
    <Button onClick={removeItem}>Remove</Button>
  </SomeComponent>
)
```
