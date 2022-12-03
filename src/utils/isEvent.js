import { is } from 'ramda';

export default function isEvent(v) {
  if (!v) {
    return false;
  }

  const isObj = is(Object, v);
  let isNativeEvt = false;

  if (v.nativeEvent) {
    isNativeEvt = v.nativeEvent.constructor.name.indexOf('Event') > -1;
  }

  return isObj && isNativeEvt;
}
