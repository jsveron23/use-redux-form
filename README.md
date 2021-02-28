# use-redux-form

[![npm](https://img.shields.io/npm/v/use-redux-form)](https://www.npmjs.com/package/use-redux-form)

- **this is beta version**
- **please, report any bugs**
- **thank you!**

With `use-redux-form`, any kind of form components can be possible to use simply with Redux store object.

> Inspired by ReduxForm

## Install

```bash
npm install use-redux-form
```

## Usage

- Advanced usages is creating...

```js
import React from 'react'
import { useDispatch } from 'react-redux'
import useReduxForm from 'use-redux-form/es'

const Component = ({ isLoading }) => {
  const dispatch = useDispatch();
  const { handleSubmit, getFieldProps } = useReduxForm({
    storePath: 'user.form',

    disable: () => isLoading,

    validate: (values) => {
      const errors = {};

      if (!values.a) {
        errors.a = 'error!';
      }

      return errors;
    },

    onSubmit: ({ isInvalid, errors }) => {
      if (isInvalid) {
        return Object.values(errors).forEach((value) => {
          if (value) {
            someAlert(value);
          }
        });
      }

      dispatch(someAction());
    },

    // transform data before into props data
    // e.g. some components ask specific field type as value
    transform: ({ name, value }) => {
      if (name === 'a' && isData(value)) {
        return new Date(value);
      }

      return value;
    },

    onChange: ({ name, value }) {
      // name is key name
      // value is from field
      dispatch(someAction({ name, value }))
    },
  });

  return (
    {/* value, onChange */}
    <Input {...getFieldProps('some-field-name', {
      isRequired: true // default = false

      // some components prop is not compatible with
      // ['value', 'selected', 'disabled', 'name', 'isInvalid', 'onChange']
      // that useReduxForm uses and also, you can un-use it
      exclude: ['isInvalid'] // default = []
    })} />
    <Button onClick={handleSubmit}>Confirm</Button>
  )
}
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

- [ ] Unit test
- [ ] Provide API doc
- [ ] Provide examples
- [ ] Provide actions, types
- [ ] Release 1.0.0 🎉

## License

MIT
