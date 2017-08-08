import __protected from "object-utilities";
import AbstractConnection from "./AbstractConnection";

/**
 * Basic XHR Connection
 */
export default class XHRConnection extends AbstractConnection {
  /**
   * Initialises an Instance of XHRConnection
   * @constructor
   * @param {string} url – URL to be fetched
   * @param {string} [method=GET] – used method
   * @param {mixed} [data] – payload for request
   * @param {string} [contentType] – content type of payload
   */
  constructor(url, method = "GET", data = null, contentType = null) {
    super(url);

    __protected(this).method = method;
    __protected(this).contentType = contentType;
    __protected(this).data = data;

    this.handleOpenEvent = this.handleOpenEvent.bind(this);

    this.handleProgressEvent = this.handleProgressEvent.bind(this);

    this.handleAbortEvent = this.handleAbortEvent.bind(this);
    this.handleErrorEvent = this.handleErrorEvent.bind(this);
    this.handleLoadEvent = this.handleLoadEvent.bind(this);
    this.handleTimeoutEvent = this.handleTimeoutEvent.bind(this);
  }

  /**
   * native getter
   */
  get response() {
    return __protected(this).native.response;
  }
  get readyState() {
    return __protected(this).native.readyState;
  }
  get responseType() {
    return __protected(this).native.responseType;
  }
  get status() {
    return __protected(this).native.status;
  }

  /**
   * create, prepare, open and send the xhr request
   * @param {string} [token] – authentication token
   */
  open(token) {
    if (__protected(this).native !== null) {
      throw new Error("cannot open XHR Connection a second time!");
    }
    __protected(this).native = new XMLHttpRequest();

    __protected(this).native.addEventListener(
      "progress",
      this.handleProgressEvent
    );

    __protected(this).native.addEventListener("abort", this.handleAbortEvent);
    __protected(this).native.addEventListener("error", this.handleErrorEvent);
    __protected(this).native.addEventListener("load", this.handleLoadEvent);
    __protected(this).native.addEventListener(
      "timeout",
      this.handleTimeoutEvent
    );
    __protected(this).native.open(
      __protected(this).method,
      __protected(this).url
    );

    this.handleOpenEvent();

    // __protected(this).native.withCredentials = true;

    if (__protected(this).contentType !== null) {
      __protected(this).native.setRequestHeader(
        "Content-Type",
        __protected(this).contentType
      );
    }
    if (token !== undefined && token !== "") {
      __protected(this).native.setRequestHeader(
        "Authorization",
        "Bearer " + token
      );
    }

    __protected(this).native.send(__protected(this).data);
  }
  /**
   * aborts native xhr
   */
  close() {
    __protected(this).native.abort();
  }
  /**
   *
   * @todo abort here before delete?
   */
  reset() {
    delete __protected(this).native;
  }

  /**
   * handle open event of native xhr
   */
  handleOpenEvent() {
    this.state = 1;
    this.emit("open", this);
  }
  /**
   * handle open event of native xhr
   */
  handleProgressEvent() {
    this.emit("progress", this);
  }
  /**
   * handle abort event of native xhr
   */
  handleAbortEvent() {
    this.state = 2;
    this.emit("abort", this);
    this.emit("close", this);
  }
  /**
   * handle error event of native xhr
   */
  handleErrorEvent() {
    this.state = 2;
    this.emit("error", this);
    this.emit("close", this);
  }
  /**
   * handle load event of native xhr
   */
  handleLoadEvent() {
    this.state = 2;
    if (this.status >= 400) {
      this.emit("error", this);
    } else {
      this.emit("success", this);
    }
    this.emit("close", this);
  }
  /**
   * handle timeout event of native xhr
   */
  handleTimeoutEvent() {
    this.handleErrorEvent();
  }
}
