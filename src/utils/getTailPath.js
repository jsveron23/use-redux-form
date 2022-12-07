import { compose, join, tail, split } from 'ramda';

export default function getTailPath(basePath) {
	return compose(join('.'), tail, split('.'))(basePath);
}
