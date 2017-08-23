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

    this.protected.method = method;
    this.protected.contentType = contentType;
    this.protected.data = data;

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
    return this.protected.native.response;
  }
  get readyState() {
    return this.protected.native.readyState;
  }
  get responseType() {
    return this.protected.native.responseType;
  }
  get status() {
    return this.protected.native.status;
  }

  /**
   * create, prepare, open and send the xhr request
   * @param {string} [token] – authentication token
   */
  open(token) {
    if (this.protected.native !== null) {
      throw new Error("cannot open XHR Connection a second time!");
    }
    this.protected.native = new XMLHttpRequest();

    this.protected.native.addEventListener(
      "progress",
      this.handleProgressEvent
    );

    this.protected.native.addEventListener("abort", this.handleAbortEvent);
    this.protected.native.addEventListener("error", this.handleErrorEvent);
    this.protected.native.addEventListener("load", this.handleLoadEvent);
    this.protected.native.addEventListener("timeout", this.handleTimeoutEvent);
    this.protected.native.open(this.protected.method, this.protected.url);

    this.handleOpenEvent();

    // this.protected.native.withCredentials = true;

    if (this.protected.contentType !== null) {
      this.protected.native.setRequestHeader(
        "Content-Type",
        this.protected.contentType
      );
    }
    if (token !== undefined && token !== "") {
      this.protected.native.setRequestHeader(
        "Authorization",
        "Bearer " + token
      );
    }

    this.protected.native.send(this.protected.data);
  }
  /**
   * aborts native xhr
   */
  close() {
    this.protected.native.abort();
  }
  /**
   *
   * @todo abort here before delete?
   */
  reset() {
    delete this.protected.native;
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
