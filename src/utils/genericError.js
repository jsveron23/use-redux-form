export default function genericError(message, props = {}) {
  const err = new Error(message);

  Object.keys(props).forEach((key) => {
    const val = props[key];

    err[key] = val;
  });

  return err;
}
