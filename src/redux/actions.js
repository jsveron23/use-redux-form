import { SET_INITIAL_VALUES, UPDATE_FIELD } from './types';

export function setInitialValues(values) {
	return {
		type: SET_INITIAL_VALUES,
		payload: values,
	};
}

export function updateField(parentState, { name, value }) {
	return {
		type: UPDATE_FIELD,
		payload: {
			key: parentState,
			name,
			value,
		},
	};
}
