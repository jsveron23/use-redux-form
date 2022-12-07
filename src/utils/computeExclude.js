import { compose, without, uniq, curry } from 'ramda';

function computeExclude(include, exclude) {
  return compose(without(...include), uniq)(exclude);
}

export default curry(computeExclude);
