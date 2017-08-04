import { EventEmitter } from "events";
import __protected from "object-utilities";

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

    __protected(this, {
      url,
      created: Date.now(),
      native: null,
      state: 0
    });
  }
  set state(state) {
    if (state >= __protected(this).state) {
      __protected(this).state = state;
    }
  }
  get state() {
    return __protected(this).state;
  }
  get url() {
    return __protected(this).url;
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
