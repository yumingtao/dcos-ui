import Util from "#SRC/js/utils/Util";

import MesosEventManager from "#SRC/js/events/MesosEventManager";

import Schema from "./StateSchemas";
import StateMapper from "./StateMapper";
import MesosMapper from "./MesosMapper";

const StateAdapter = {
  stateObject: null,
  stateLookups: null,

  // Traverse the events from the stream and build an object
  buildMesosState() {
    console.log("Called build state");
    const self = this;
    MesosEventManager.createEventStream(function(events) {
      console.log("Events are:");
      console.log(events);

      for (var i = 0; i < events.size; i++) {
        const eventObject = events.get(i);
        if (self.stateObject == null) {
          console.log("Made state object for event");
          self.stateObject = self.generateState(eventObject.value);
          console.log(self.stateObject);
          self.setLookupsForEntites();
        } else {
          console.log("Update state object for event");
          self.insertToStateObject(eventObject);
        }
      }
      // events.forEach(function(event) {
      //   const eventObject = event.get(0);
      //   if (self.stateObject == null) {
      //     console.log("Made state object for event");
      //     self.stateObject = self.generateState(eventObject.value);
      //     self.setLookupsForEntites();
      //   } else {
      //     console.log("Update state object for event");
      //     self.insertToStateObject(eventObject);
      //   }
      // });
    });

    // const self = this;
    // stream.subscribe(function(events) {
    //   console.log("Events are:");
    //   console.log(events);
    //   events.forEach(function(event) {
    //     const eventObject = event.get(0);
    //     if (self.stateObject == null) {
    //       console.log("Made state object for event");
    //       self.stateObject = self.generateState(eventObject.value);
    //       self.setLookupsForEntites();
    //     } else {
    //       console.log("Update state object for event");
    //       self.insertToStateObject(eventObject);
    //     }
    //   });
    // });
  },

  getStateObject() {
    return this.stateObject;
  },

  insertToStateObject(event) {
    const pathId = event.path.slice(0, 2).join(".");
    let restOfPath = event.path.slice(2).join(".");

    const item = Util.findNestedPropertyInObject(this.stateLookups, pathId);

    if (MesosMapper[restOfPath]) {
      restOfPath = MesosMapper[restOfPath];
    }

    this.insertNestedPropertyInObject(restOfPath, event.value, item);
  },

  setLookupsForEntites() {
    const taskKeys = ["tasks", "completed_tasks"];
    const frameworkKeys = ["frameworks", "completed_frameworks"];

    const tasks = {};
    const frameworks = {};
    const agents = {};

    frameworkKeys
      .map(function(frameworkKey) {
        return this.stateObject[frameworkKey];
      }, this)
      .forEach(function(framework) {
        frameworks[framework.id] = framework;

        taskKeys.forEach(function(taskKey) {
          if (!framework[taskKey]) {
            return;
          }
          framework[taskKey].forEach(function(task) {
            tasks[task.id] = task;
          });
        });
      });

    this.stateObject.slaves.forEach(function(slave) {
      agents[slave.id] = slave;
    });

    this.stateLookups = {
      TASK: tasks,
      FRAMEWORK: frameworks,
      AGENT: agents
    };
  },

  // Add to state object based on path and value
  insertNestedPropertyInObject(path, value, object) {
    if (path == null || object == null || value == null) {
      return;
    }

    let current = object;
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

  applyStateSchema(schemaKey, schemaKeys, mesosObject) {
    const stateObject = Object.assign({}, Schema[schemaKey]);
    const stateKeys = Object.keys(stateObject);
    const customKeys = Object.keys(StateMapper);

    if (!mesosObject) {
      return stateObject;
    }

    const mesosKeys = Object.keys(mesosObject);

    stateKeys.forEach(function(stateKey) {
      const newKey = schemaKey + "." + stateKey;
      if (schemaKeys.includes(newKey)) {
        const newMesosObject = StateMapper[newKey]
          ? StateMapper[newKey](mesosObject)
          : mesosObject[stateKey];
        if (Array.isArray(stateObject[stateKey])) {
          stateObject[stateKey] = this.applyArrayStateSchema(
            newKey,
            schemaKeys,
            newMesosObject
          );
        } else {
          stateObject[stateKey] = this.applyStateSchema(
            newKey,
            schemaKeys,
            newMesosObject
          );
        }
      } else if (customKeys.includes(newKey)) {
        stateObject[stateKey] = StateMapper[newKey](mesosObject);
      } else if (mesosKeys.includes(stateKey)) {
        stateObject[stateKey] = mesosObject[stateKey];
      }
    }, this);

    return stateObject;
  },

  applyArrayStateSchema(schemaKey, schemaKeys, mesosObjects) {
    const results = [];
    if (!mesosObjects) {
      return results;
    }

    const customKeys = Object.keys(StateMapper);

    mesosObjects.forEach(function(mesosEntry) {
      const stateObject = Object.assign({}, Schema[schemaKey]);

      Object.keys(stateObject).forEach(function(field) {
        const newKey = schemaKey + "." + field;
        if (schemaKeys.includes(newKey)) {
          const newMesosObjects = StateMapper[newKey]
            ? StateMapper[newKey](mesosEntry)
            : mesosEntry[field];
          if (Array.isArray(stateObject[field])) {
            stateObject[field] = this.applyArrayStateSchema(
              newKey,
              schemaKeys,
              newMesosObjects
            );
          } else {
            stateObject[field] = this.applyStateSchema(
              newKey,
              schemaKeys,
              newMesosObjects
            );
          }
        } else if (customKeys.includes(newKey)) {
          stateObject[field] = StateMapper[newKey](mesosEntry);
        } else {
          stateObject[field] = mesosEntry[field];
        }
      }, this);

      results.push(stateObject);
    }, this);

    return results;
  },

  updateFrameworksWithTasks(frameworks, groupedTasks) {
    frameworks.forEach(function(framework) {
      Object.keys(groupedTasks).forEach(function(type) {
        if (!framework[type]) {
          framework[type] = [];
        }

        groupedTasks[type].forEach(function(task) {
          if (task.framework_id.value === framework.framework_info.id.value) {
            framework[type].push(task);
          }
        });
      });
    });
  },

  // Generate state based on Mesos object
  generateState(mesosState) {
    const schemaKeys = Object.keys(Schema);

    Object.keys(mesosState["get_frameworks"]).forEach(function(frameworkGroup) {
      this.updateFrameworksWithTasks(
        mesosState["get_frameworks"][frameworkGroup],
        mesosState["get_tasks"]
      );
    }, this);

    const state = this.applyStateSchema("state", schemaKeys, mesosState);

    return state;
  }
};

module.exports = StateAdapter;
