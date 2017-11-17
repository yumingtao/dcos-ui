import {
  GET_TASKS,
  TASK_ADDED,
  TASK_UPDATED
} from "../../../constants/MesosStreamMessageTypes";
import { scalar } from "./ProtobufUtil";

function convertResource(resource) {
  switch (resource.type) {
    case "SCALAR":
      return scalar(resource.scalar);
    case "RANGES":
      return resource.ranges.range;
    case "SET":
      return resource.set;
  }
}

function processTask(task) {
  task.id = scalar(task.task_id);
  task.agent_id = scalar(task.agent_id);
  task.framework_id = scalar(task.framework_id);
  task.executor_id = scalar(task.executor_id);
  task.labels = task.labels && task.labels.labels;
  task.resources = task.resources.reduce(function(acc, resource) {
    acc[resource.name] = convertResource(resource);

    return acc;
  }, {});

  return task;
}

export function getTasksAction(state, message) {
  if (message.type !== GET_TASKS) {
    return state;
  }

  const tasks = Object.keys(message.get_tasks).reduce((acc, key) => {
    return acc.concat(message.get_tasks[key].map(processTask));
  }, []);

  return Object.assign(state, { tasks });
}

export function taskAddedAction(state, message) {
  if (message.type !== TASK_ADDED) {
    return state;
  }

  const task = processTask(message.task_added.task);

  return Object.assign(state, { tasks: [...state.tasks, task] });
}

export function taskUpdatedAction(state, message) {
  if (message.type !== TASK_UPDATED) {
    return state;
  }

  const taskUpdate = message.task_updated;
  const task_id = scalar(taskUpdate.status.task_id);
  const tasks = state.tasks.reduce(function(acc, task) {
    if (task.task_id.value === task_id) {
      const statuses = task.statuses || [];

      return acc.concat(
        Object.assign({}, task, {
          state: taskUpdate.state,
          statuses: [...statuses, taskUpdate.status]
        })
      );
    }

    return acc.concat(task);
  }, []);

  return Object.assign(state, { tasks });
}
