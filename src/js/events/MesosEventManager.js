import MasterClient from "../components/MesosOperatorApiClient";
import EventUtil from "../utils/mesos-operator-api/EventUtil";

const Rx = require("rxjs/Rx");

const { List } = require("immutable");

const observers = [];
var immutableQueue = List([]);

var MesosEventManager = {
  createEventStream() {
    const stream = Rx.Observable.create(function(observer) {
      observers.push(observer);
      observer.next(immutableQueue);
    });

    console.log("Stream is: ", stream);

    return stream;
  },
  startConnection() {
    function triggerEvent(immutableEvents) {
      observers.forEach(function(observer) {
        observer.next(immutableEvents);
      });
    }
    const eventsClient = new MasterClient({
      masterApiUri: "/mesos/api/v1",
      handlers: {
        SUBSCRIBED(data) {
          console.log("SUBSCRIBED ");
          console.log(data);

          const arr = List(
            EventUtil.generateEventsFromSubscribed(data["get_state"], false)
          );

          immutableQueue = immutableQueue.concat(arr);

          // console.log("Diff Queue");
          // console.log(arr);

          triggerEvent(arr);
        },
        TASK_ADDED(data) {
          // console.log("Got TASK_ADDED");
          // console.log(data);
          const arr = List(
            EventUtil.generateEventsFromTask(data["task"], false)
          );

          immutableQueue = immutableQueue.concat(arr);

          // console.log("Diff Queue");
          // console.log(arr);

          triggerEvent(arr);
        },
        TASK_UPDATED(data) {
          // console.log("Got TASK_UPDATED");
          // console.log(data);
          const arr = List(EventUtil.generateEventsFromTaskUpdate(data));

          immutableQueue = immutableQueue.concat(arr);

          // console.log("Diff Queue");
          // console.log(arr);

          triggerEvent(arr);
        },
        AGENT_ADDED(data) {
          // console.log("Got AGENT_ADDED");
          // console.log(data);
          const arr = List(EventUtil.generateEventsFromAgent(data, false));
          immutableQueue = immutableQueue.concat(arr);

          // console.log("Diff Queue");
          // console.log(arr);

          triggerEvent(arr);
        },
        AGENT_REMOVED(data) {
          // console.log("Got AGENT_REMOVED");
          // console.log(data);
          const arr = List(
            EventUtil.generateEventsFromAgentRemoved(data["agent_removed"])
          );
          immutableQueue = immutableQueue.concat(arr);

          // console.log("Diff Queue");
          // console.log(arr);

          triggerEvent(arr);
        },
        FRAMEWORK_ADDED(data) {
          // console.log("Got FRAMEWORK_ADDED" + data);
          // console.log(data);
          const arr = List(
            EventUtil.generateEventsFromFramework(data["framework"], false)
          );
          immutableQueue = immutableQueue.concat(arr);

          // console.log("Diff Queue");
          // console.log(arr);

          triggerEvent(arr);
        },
        FRAMEWORK_UPDATED(data) {
          // console.log("Got FRAMEWORK_UPDATED");
          // console.log(data);
          const arr = List(
            EventUtil.generateEventsFromFramework(data["framework"], true)
          );
          immutableQueue = immutableQueue.concat(arr);

          // console.log("Diff Queue");
          // console.log(arr);

          triggerEvent(arr);
        },
        FRAMEWORK_REMOVED(data) {
          // console.log("Got FRAMEWORK_REMOVED");
          // console.log(data);
          const arr = List(EventUtil.generateEventsFromFrameworkRemoved(data));
          immutableQueue = immutableQueue.concat(arr);

          // console.log("Diff Queue");
          // console.log(arr);

          triggerEvent(arr);
        }
      }
    });

    eventsClient.on("subscribed", function() {
      // console.log("SUBSCRIBED");
    });

    // Catch error events
    eventsClient.on("error", function(errorObj) {
      console.log("Got an error");
      console.log(JSON.stringify(errorObj));
    });

    eventsClient.subscribe();
  }
};

module.exports = MesosEventManager;
