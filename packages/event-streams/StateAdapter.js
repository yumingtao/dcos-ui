import { Schema } from "./StateSchema";

// var Bacon = require("baconjs").Bacon;
// const DELAY = 10;
// const eventStream = Bacon.fromArray(events);
// eventStream.bufferWithTime(DELAY).reduce();

const EventTypes = {
  Framework: "FRAMEWORK",
  Task: "TASK",
  Agent: "AGENT"
};

const customFieldMapper = {
  "state.frameworks.tasks.resources": mesosObject => {
    return mesosObject["resources"].reduce(function(result, entry) {
      result[entry.name] = entry.scalar.value;
    }, {});
  },
  "state.frameworks.tasks.ports": mesosObject => {
    return Object.values(mesosObject["discovery"]["ports"]).toString();
  },
  "state.frameworks.tasks.framework_id": mesosObject => {
    return mesosObject["framework_id"]["value"];
  },
  "state.frameworks": mesosObject => {
    const frameworkIds = Object.keys(mesosObject[EventTypes.Framework]);

    return frameworkIds.map(function(frameworkId) {
      const framework = mesosObject[EventTypes.Framework][frameworkId];
      framework["id"] = frameworkId;

      return framework;
    });
  },
  "state.slaves": mesosObject => {
    const slaveIds = Object.keys(mesosObject[EventTypes.Agent]);

    return slaveIds.map(function(slaveId) {
      const slave = mesosObject[EventTypes.Agent][slaveId];
      slave["id"] = slaveId;

      return slave;
    });
  },
  "state.frameworks.tasks": mesosObject => {
    const taskIds = Object.keys(mesosObject[EventTypes.Task]);

    return taskIds.map(function(taskId) {
      const task = mesosObject[EventTypes.Task][taskId];
      task["id"] = taskId;

      return task;
    });
  }
};

const StateAdapter = {
  mesosState: {},

  // Traverse the events from the stream and build an object
  buildMesosState(streamArray) {
    streamArray.forEach(function(event) {
      this.insertNestedPropertyInObject(event.path, event.value);
    });
  },

  // Add to mesos state object based on path and value
  insertNestedPropertyInObject(path, value) {
    if (path == null || this.mesosState == null || value == null) {
      return;
    }

    let current = this.mesosState;
    const fields = path.split(".");
    fields.slice(0, fields.length - 1).forEach(function(prop) {
      if (!Object.keys(current).includes(prop)) {
        current[prop] = {};
      }

      current = current[prop];
    });

    const inputField = fields.pop();
    if (Array.isArray(value)) {
      const fieldArray = current[inputField] || [];
      current[inputField] = fieldArray.concat(value);
    } else {
      current[inputField] = value;
    }
  },

  groupTasks(tasks) {
    const groupedTasks = {
      active: [],
      completed: []
    };

    tasks.forEach(function(task) {
      if (task.state === "TASK_RUNNING") {
        groupedTasks.active.add(task);
      } else {
        groupedTasks.completed.add(task);
      }
    });

    return groupedTasks;
  },

  groupFrameworks(frameworks) {
    const groupedFrameworks = {
      active: [],
      completed: []
    };

    frameworks.forEach(function(framework) {
      if (!framework.active || !framework.connected) {
        groupedFrameworks.completed.add(framework);
      } else {
        groupedFrameworks.active.add(framework);
      }
    });

    return groupedFrameworks;
  },

  getTasksByFrameworkId(tasks, frameworkId) {
    return tasks.filter(function(task) {
      return task.framework_id === frameworkId;
    });
  },

  applyStateSchema(schemaKey, schemaKeys, mesosObject) {
    const stateObject = Object.assign({}, Schema[schemaKey]);
    const stateKeys = Object.keys(stateObject);
    const customKeys = Object.keys(customFieldMapper);

    if (!mesosObject) {
      return stateObject;
    }

    const mesosKeys = Object.keys(mesosObject);

    stateKeys.forEach(function(stateKey) {
      const newKey = schemaKey + "." + stateKey;
      if (schemaKeys.includes(newKey)) {
        if (Array.isArray(stateObject[stateKey])) {
          stateObject[stateKey] = this.applyArrayStateSchema(
            newKey,
            schemaKeys,
            customFieldMapper[newKey](mesosObject)
          );
        } else {
          stateObject[stateKey] = this.applyStateSchema(
            newKey,
            schemaKeys,
            customFieldMapper[newKey](mesosObject)
          );
        }
      } else if (customKeys.includes(newKey)) {
        stateObject[stateKey] = customFieldMapper[newKey](mesosObject);
      } else if (mesosKeys.includes(stateKey)) {
        stateObject[stateKey] = mesosObject[stateKey];
      }
    });

    return stateObject;
  },

  applyArrayStateSchema(schemaKey, schemaKeys, mesosObjects) {
    const results = [];
    if (!mesosObjects) {
      return results;
    }

    const customKeys = Object.keys(customFieldMapper);

    mesosObjects.forEach(function(mesosEntry) {
      const stateObject = Object.assign({}, Schema[schemaKey]);

      Object.keys(stateObject).forEach(function(field) {
        const newKey = schemaKey + "." + field;
        if (schemaKeys.includes(newKey)) {
          if (Array.isArray(stateObject[field])) {
            stateObject[field] = this.applyArrayStateSchema(
              newKey,
              schemaKeys,
              customFieldMapper[newKey](mesosEntry)
            );
          } else {
            stateObject[field] = this.applyStateSchema(
              newKey,
              schemaKeys,
              customFieldMapper[newKey](mesosEntry)
            );
          }
        } else if (customKeys.includes(newKey)) {
          stateObject[field] = customFieldMapper[newKey](mesosEntry);
        } else {
          stateObject[field] = mesosEntry[field];
        }
      });

      results.add(stateObject);
    });

    return results;
  },

  // Generate state based on Mesos object
  generateState() {
    const schemaKeys = Object.keys(Schema);

    const state = this.applyStateSchema("state", schemaKeys, this.mesosState);

    return state;
    // const agents = this.applyStateSchema(
    //   this.mesosState[EventTypes.Agent],
    //   EventTypes.Agent
    // );

    // const frameworks = this.applyStateSchema(
    //   this.mesosState[EventTypes.Framework],
    //   EventTypes.Framework
    // );

    // const tasks = this.applyStateSchema(
    //   this.mesosState[EventTypes.Task],
    //   EventTypes.Task
    // );

    // const groupedFrameworks = this.groupFrameworks(frameworks);
    // const groupedTasks = this.groupTasks(tasks);

    // stateObject.slaves.add(agents);

    // stateObject.frameworks.add(groupedFrameworks.active);
    // stateObject.completed_frameworks.add(groupedFrameworks.completed);

    // stateObject.frameworks.forEach(function(framework) {
    //   framework.tasks = this.getTasksByFramework(
    //     groupedTasks.active,
    //     framework.id
    //   );

    //   framework.completed_tasks = this.getTasksByFramework(
    //     groupedTasks.completed,
    //     framework.id
    //   );
    // });

    // stateKeys
    //   .filter(function(key) {
    //     return !Object.keys(customFieldMapper).includes(key);
    //   })
    //   .forEach(function(key) {
    //     if (Object.keys(this.mesosState).includes(key)) {
    //       stateObject[key] = this.mesosState[key];
    //     }
    //   });
  }
};

module.export = StateAdapter;
