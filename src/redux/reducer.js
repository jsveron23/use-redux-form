import { set } from 'lens-o';
import { UPDATE_FIELD } from './types';

const initialState = {};

function reducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case UPDATE_FIELD: {
      return set(`${payload.key}.${payload.name}`, payload.value, state);
    }

    default: {
      return state;
    }
  }
}

export default reducer;
