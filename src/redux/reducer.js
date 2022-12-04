import { set } from 'lens-o';
import { SET_INITIAL_VALUES, UPDATE_FIELD } from './types';

const initialState = {};

function reducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case SET_INITIAL_VALUES: {
      return {
        ...state,
        ...payload,
      };
    }

    case UPDATE_FIELD: {
      return set(payload.name, payload.value, state);
    }

    default: {
      return state;
    }
  }
}

export default reducer;
