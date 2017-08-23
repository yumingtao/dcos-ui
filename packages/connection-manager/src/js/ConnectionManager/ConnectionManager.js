import { AuthStore } from "authenticator";
import ConnectionStore from "../ConnectionQueue/ConnectionQueue.js";

/**
 * The Connection Manager which is responsible for
 * queueing Connections into the ConnectionStore and
 * actually starting them, when they are head of
 * waiting line.
 */
class ConnectionManager {
  /**
   * Initialises an Instance of CM
   * @param {Integer} maxConnections – max open connections
   */
  constructor(maxConnections = 6) {
    this.maxConnections = maxConnections;
    this.connectionStore = new ConnectionStore();

    // this.handleQueueActivity = this.handleQueueActivity.bind(this);

    this.handleConnectionClosingEvents = this.handleConnectionClosingEvents.bind(
      this
    );
  }

  /**
   * Queues given connection with given priority
   * @param {AbstractConnection} connection – connection to queue
   * @param {integer} [priority] – priority given connection is enqueued with
   * @return {boolean} true = enqueued, false = already in
   */
  queue(connection, priority) {
    var returnValue = false;

    if (connection.state === 0 && !this.connectionStore.includes(connection)) {
      connection.on("close", this.handleConnectionClosingEvents);
      connection.on("error", this.handleConnectionClosingEvents);

      this.connectionStore.add(connection, priority);
    } else if (connection.state === 1) {
      returnValue = this.connectionStore.add(connection, priority);
    }
    this.handleQueueActivity();

    return returnValue;
  }
  /**
   * handles all queue activity events
   * @param {AbstractConnection} connection
   * @return {void}
   */
  handleQueueActivity() {
    var connection;
    if (
      this.connectionStore.openCount() < this.maxConnections &&
      this.connectionStore.waitingCount()
    ) {
      connection = this.connectionStore.waitingHead();
      connection.open(AuthStore.getTokenForURL(connection.url));

      this.handleQueueActivity();
    }
  }
  /**
   * handles connection events, removes connection from ConnectionStore
   * @param {AbstractConnection} connection
   * @return {void}
   */
  handleConnectionClosingEvents(connection) {
    this.connectionStore.delete(connection);
    this.handleQueueActivity();
  }
}

/**
 * Make it (something like) a Singleton
 */
export default new ConnectionManager();
