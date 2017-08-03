import AuthStore from "../AuthStore/AuthStore";

export default class Authenticator {
  constructor() {
    Object.defineProperty(this, "_", {
      configurable: false,
      enumerable: false,
      writeable: false,
      value: {}
    });
  }
}
