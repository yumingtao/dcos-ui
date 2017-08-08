import { EventEmitter } from "events";
import __protected from "object-utilities";

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
   */
  constructor(maxPriority = 3) {
    super();

    __protected(this, {
      queue: [],
      maxPriority
    });

    for (var i = 0; i <= __protected(this).maxPriority; i++) {
      __protected(this).queue[i] = [];
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
    priority = priority || __protected(this).maxPriority;
    if (priority > __protected(this).maxPriority) {
      throw Error(
        "invalid Priority, max priority is " + __protected(this).maxPriority
      );
    }
    if (!this.includes(connection)) {
      __protected(this).queue[priority].push(connection);
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
    var priority = 0, connection;
    while (
      priority < __protected(this).maxPriority &&
      !__protected(this).queue[priority].length
    ) {
      priority += 1;
    }
    connection = __protected(this).queue[priority].shift();
    this.emit("shift");

    return connection;
  }
  /**
   * Return current length of queue
   * @return {integer} length of queue
   */
  get length() {
    var priority = 0, count = 0;
    for (
      priority = 0;
      priority <= __protected(this).maxPriority;
      priority += 1
    ) {
      count += __protected(this).queue[priority].length;
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
    for (
      priority = 0;
      priority <= __protected(this).maxPriority;
      priority += 1
    ) {
      length = __protected(this).queue[priority].length;
      for (index = 0; index < length; index += 1) {
        fromIndex = Math.max(fromIndex - 1, 0);
        if (
          fromIndex === 0 &&
          connection === __protected(this).queue[priority][index]
        ) {
          return true;
        }
      }
    }

    return false;
  }
}
