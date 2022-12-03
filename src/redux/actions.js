import { UPDATE_FIELD } from './types';

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
