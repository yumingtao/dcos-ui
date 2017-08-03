import { EventEmitter } from "events";

/**
 * Connection Queue which holds queued connections.
 * 
 * @todo check if optimisation of storage is needed (performance tests needed)
 */
export default class ConnectionQueue extends EventEmitter {
  /**
   * Initialises an instance of ConnectionQueue
   * @constructor
   * @param {Integer} maxPriority [3] – Maximum used priority for this queue
   * @return {ConnectionQueue} – Initialised instance
   */
  constructor(maxPriority = 3) {
    super();
    Object.defineProperty(this, "_", {
      configurable: false,
      enumerable: false,
      writeable: false,
      value: {
        queue: [],
        maxPriority
      }
    });
    for (var i = 0; i <= this._.maxPriority; i++) {
      this._.queue[i] = [];
    }
  }
  /**
   * Adds given connection with given (or default) priority to queue
   * @param {AbstractConnection} connection – Connection to be added to queue 
   * @param {integer} priority – Priority for given connection
   * @return {boolean} true = added, false = connection already in queue
   * 
   * @todo how (and where) to deal with duplicate entries? just skip them?
   */
  add(connection, priority) {
    priority = priority || this._.maxPriority;
    if (priority > this._.maxPriority) {
      throw Error("invalid Priority, max priority is " + this._.maxPriority);
    }
    if (!this.includes(connection)) {
      this._.queue[priority].push(connection);
      this.emit("add");
      return true;
    }

    return false;
  }
  /**
   * Removes first element from Queue and returns it.
   * @return {AbstractConnection} – shifted connection
   */
  shift() {
    var priority = 0,
      connection;
    while (priority < this._.maxPriority && !this._.queue[priority].length) {
      priority += 1;
    }
    connection = this._.queue[priority].shift();
    this.emit("shift");

    return connection;
  }
  /**
   * Return current length of queue
   * @return {integer} length of queue
   */
  get length() {
    var priority = 0,
      count = 0;
    for (priority = 0; priority <= this._.maxPriority; priority += 1) {
      count += this._.queue[priority].length;
    }

    return count;
  }
  /**
   * Checks if given connection already is in queue
   * @param {AbstractConnection} connection – connection to search for
   * @return {boolean} – true = found, false = nope
   */
  includes(connection, fromIndex = 0) {
    var priority,
      index,
      length;
    for (priority = 0; priority <= this._.maxPriority; priority += 1) {
      length = this._.queue[priority].length;
      for (index = 0; index < length; index += 1) {
        fromIndex = Math.max(fromIndex - 1, 0);
        if (fromIndex === 0 && connection === this._.queue[priority][index]) {
          return true;
        }
      }
    }
    return false;
  }
}
