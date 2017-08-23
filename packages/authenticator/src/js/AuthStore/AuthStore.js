export default class AuthStore {
  constructor() {
    Object.defineProperty(this, "_", {
      configurable: false,
      enumerable: false,
      writeable: false,
      value: {
        tokens: []
      }
    });
  }
  setTokenForDomain(domain, token) {
    this._.tokens[domain] = token;
  }
  getTokenForURL(url) {
    return this._.tokens[url] || "";
  }
}
