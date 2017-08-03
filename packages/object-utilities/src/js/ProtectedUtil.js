/**
 * Creates an protected property in the given object
 * Use this for protected properties, functions are public for now.
 *
 * First Usage:
 * __protected(this, {foo:"bar"})
 *
 * After that:
 * read: var foo = __protected(this).foo;
 * write: __protected(this).foo = "baz";
 *
 * @param {Object} object – given object
 * @param {Object} [value] – given value
 * @return {Object} protected property / context
 */
export default function __protected(object, value) {
  if (!object.__protected__) {
    Object.defineProperty(object, "__protected__", {
      configurable: false,
      enumerable: false,
      writeable: false,
      value: value || {}
    });
  } else if (value !== undefined) {
    throw new Error("value attribute only allowed on first call");
  }

  return object.__protected__;
}
