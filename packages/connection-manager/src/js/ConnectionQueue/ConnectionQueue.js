/**
 * Connection Queue which holds queued connections.
 *
 * @todo check if optimisation of storage is needed (performance tests needed)
 */
export default class ConnectionQueue {
  /**
   * Initialises an instance of ConnectionQueue
   * @constructor
   * @param {Integer} maxPriority [3] – Maximum used priority for this queue
   */
  constructor(maxPriority = 3) {
    Object.defineProperty(this, "protected", {
      value: {
        queue: [],
        maxPriority
      }
    });

    for (var i = 0; i <= this.protected.maxPriority; i++) {
      this.protected.queue[i] = [];
    }
  }
  /**
   * Adds given connection with given (or default) priority to queue
   * @param {AbstractConnection} connection – Connection to be added to queue
   * @param {integer} priority – Priority for given connection
   * @return {boolean} true = added, false = connection already in queue
   *
   * @todo how (and where) to deal with duplicate entries? just skip them?
   */
  add(connection, priority) {
    priority = priority || this.protected.maxPriority;
    if (priority > this.protected.maxPriority) {
      throw Error(
        "invalid Priority, max priority is " + this.protected.maxPriority
      );
    }
    if (!this.includes(connection)) {
      this.protected.queue[priority].push(connection);

      return true;
    }

    return false;
  }
  /**
   * Removes first element from Queue and returns it.
   * @return {AbstractConnection} – shifted connection
   */
  shift() {
    var priority = 0, connection;
    while (
      priority < this.protected.maxPriority &&
      !this.protected.queue[priority].length
    ) {
      priority += 1;
    }
    connection = this.protected.queue[priority].shift();

    return connection;
  }
  /**
   * Return current length of queue
   * @return {integer} length of queue
   */
  get length() {
    var priority = 0, count = 0;
    for (priority = 0; priority <= this.protected.maxPriority; priority += 1) {
      count += this.protected.queue[priority].length;
    }

    return count;
  }
  /**
   * Checks if given connection already is in queue
   * @param {AbstractConnection} connection – connection to search for
   * @param {integer} fromIndex – first index to search at
   * @return {boolean} – true = found, false = nope
   */
  includes(connection, fromIndex = 0) {
    var priority, index, length;
    for (priority = 0; priority <= this.protected.maxPriority; priority += 1) {
      length = this.protected.queue[priority].length;
      for (index = 0; index < length; index += 1) {
        fromIndex = Math.max(fromIndex - 1, 0);
        if (
          fromIndex === 0 &&
          connection === this.protected.queue[priority][index]
        ) {
          return true;
        }
      }
    }

    return false;
  }
}
