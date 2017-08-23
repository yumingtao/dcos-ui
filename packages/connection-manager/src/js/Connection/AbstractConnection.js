import { EventEmitter } from "events";

/**
 * AbstractConnection provides some default properties/methods used by Connection Manager
 *
 * Events which has to be fired by all SubClasses:
 * open: when the connection actually blocks a pipe
 * close: when the connection frees its pipe
 * error: when an error occurs
 */
export default class AbstractConnection extends EventEmitter {
  constructor(url) {
    super();

    if (this.constructor === AbstractConnection) {
      throw new Error("Can't instantiate abstract class!");
    }

    if (!url) {
      throw new Error("Can't instantiate without given URL!");
    }

    Object.defineProperty(this, "protected", {
      value: {
        url,
        created: Date.now(),
        native: null,
        state: 0,
        uid: Symbol("Connection:" + url)
      }
    });
  }

  set state(state) {
    if (state >= this.protected.state) {
      this.protected.state = state;
    }
  }
  get state() {
    return this.protected.state;
  }
  get url() {
    return this.protected.url;
  }
  get uid() {
    return this.protected.uid;
  }
  // Abstract Methods
  /* eslint-disable no-unused-vars */
  /**
   * Opens the connection
   * @param {string} token – Authentication token
   */
  open(token) {}
  /**
   * Closes the connection
   */
  close() {}
  /**
   * Resets the connection
   */
  reset() {}
}
