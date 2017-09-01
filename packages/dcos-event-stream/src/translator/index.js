import Rx from "rxjs/Rx";

import apiClient from "../MesosOperatorApiClient";
import MesosOperatorEventTypes from "../constants/MesosOperatorEventTypes";
import MesosEventTypes from "../constants/MesosEventTypes";
import JsonToEventArrayUtil from "../utils/JsonToEventArrayUtil";

const stream = new Rx.ReplaySubject();

const translateEvent = function(event) {
  switch (event.type) {
    case MesosOperatorEventTypes.SUBSCRIBED:
      stream.next(
        JsonToEventArrayUtil.flatten(event["subscribed"], MesosEventTypes.ADD)
      );
      break;
    case MesosOperatorEventTypes.TASK_ADDED:
      stream.next(
        JsonToEventArrayUtil.flatten(event["task_added"], MesosEventTypes.ADD)
      );
      break;
    case MesosOperatorEventTypes.TASK_UPDATED:
      stream.next(
        JsonToEventArrayUtil.flatten(event["task_updated"], MesosEventTypes.ADD)
      );
      break;
    case MesosOperatorEventTypes.AGENT_ADDED:
      stream.next(
        JsonToEventArrayUtil.flatten(event["agent_added"], MesosEventTypes.ADD)
      );
      break;
    case MesosOperatorEventTypes.AGENT_REMOVED:
      stream.next(
        JsonToEventArrayUtil.flatten(
          event["agent_removed"],
          MesosEventTypes.ADD
        )
      );
      break;
    case MesosOperatorEventTypes.FRAMEWORK_ADDED:
      stream.next(
        JsonToEventArrayUtil.flatten(
          event["framework_added"],
          MesosEventTypes.ADD
        )
      );
      break;
    case MesosOperatorEventTypes.FRAMEWORK_UPDATED:
      stream.next(
        JsonToEventArrayUtil.flatten(
          event["framework_updated"],
          MesosEventTypes.ADD
        )
      );
      break;
    case MesosOperatorEventTypes.FRAMEWORK_REMOVED:
      stream.next(
        JsonToEventArrayUtil.flatten(
          event["framework_removed"],
          MesosEventTypes.ADD
        )
      );
      break;
  }
};

apiClient.stream.subscribe(
  function(x) {
    translateEvent(x);
  },
  function(error) {
    console.log("onError: ", error);
  },
  function() {
    console.log("onCompleted");
  }
);

module.exports = { stream };
