import __protected from "object-utilities";
import { AuthStore } from "authenticator";
import ConnectionQueue from "../ConnectionQueue/ConnectionQueue.js";

/**
 * Connection Manager
 */
class ConnectionManager {
  /**
   * Initialises an Instance of CM
   * @param {AuthStore} authstore – Component which stores the Auth Token
   */
  constructor(authstore) {
    if (authstore === undefined) {
      throw new Error("Needs Token Storage");
    }

    __protected(this, {
      openConnections: 0,
      maxConnections: 6,
      authstore,
      queue: new ConnectionQueue()
    });

    this.handleQueueActivity = this.handleQueueActivity.bind(this);
    this.handleConnectionOpen = this.handleConnectionOpen.bind(this);
    this.handleConnectionClose = this.handleConnectionClose.bind(this);
    this.handleConnectionError = this.handleConnectionError.bind(this);

    // __protected(this).queue.on("add", this.handleQueueActivity);
    // __protected(this).queue.on("shift", this.handleQueueActivity);
  }
  set maxConnections(maxConnections) {
    __protected(this).maxConnections = maxConnections;
  }
  get maxConnections() {
    return __protected(this).maxConnections;
  }
  set openConnections(openConnections) {
    __protected(this).openConnections = openConnections;
  }
  get openConnections() {
    return __protected(this).openConnections;
  }
  /**
   * Queues given connection with given priorority
   * @param {AbstractConnection} connection – connection to queue
   * @param {integer} [priority] – priority given connection is enqueued with
   * @return {boolean} true = enqueed, false = already in
   */
  queue(connection, priority) {
    var retval = false;
    if (
      connection.state === 0 &&
      !__protected(this).queue.includes(connection)
    ) {
      // connection.on("open", this.handleConnectionOpen);
      connection.on("close", this.handleConnectionClose);
      // connection.on("error", this.handleConnectionError);

      retval = __protected(this).queue.add(connection, priority);
      this.handleQueueActivity();
    }

    return retval;
  }
  /**
   * handle all queue activity events
   * @param {AbstractConnection} connection
   * @return {void}
   *
   * @todo only get token if needed for given domain, should be handled here or in AuthStore.getTokenForURL()?!
   */
  handleQueueActivity() {
    var connection;
    if (
      this.openConnections < this.maxConnections &&
      __protected(this).queue.length
    ) {
      this.openConnections += 1;
      connection = __protected(this).queue.shift();
      connection.open(
        __protected(this).authstore.getTokenForURL(connection.url)
      );
      this.handleQueueActivity();
    }
  }
  /**
   * handle connection open event
   * @return {void}
   */
  handleConnectionOpen() {
    // this.openConnections += 1;
  }
  /**
   * handle connection close event
   * @return {void}
   */
  handleConnectionClose() {
    this.openConnections -= 1;
  }
  /**
   * handle connection error event
   * @return {void}
   */
  handleConnectionError() {
    // nothing
  }
}

export default new ConnectionManager(AuthStore);
