import MesosEventManager from "#SRC/js/events/MesosEventManager";
import AppDispatcher from "#SRC/js/events/AppDispatcher";
import ActionTypes from "#SRC/js/constants/ActionTypes";
import MesosStateUtil from "#SRC/js/utils/MesosStateUtil";

import Schema from "./StateSchemas";
import StateMapper from "./mappers/StateMapper";
import MesosMapper from "./mappers/MesosMapper";

const TASK_TYPES = ["tasks", "completed_tasks"];
const FRAMEWORK_TYPES = ["frameworks", "completed_frameworks"];
const TASK_ACTIVE_STATES = ["TASK_STARTING", "TASK_STAGING", "TASK_RUNNING"];

const EventTypes = {
  ADD: 1,
  UPDATE: 2,
  REMOVE: 3
};

const StateAdapterUtil = {
  remove(array, element) {
    const index = array.indexOf(element);
    if (index !== -1) {
      array.splice(index, 1);
    }
  }
};

const StateAdapter = {
  stateObject: null,
  stateLookups: null,

  getFrameworkById(frameworkId) {
    return this.stateObject.frameworks.find(function(framework) {
      return framework.id === frameworkId;
    });
  },

  shouldAddToTasks(eventId, updateField) {
    return this.stateLookups["TASK"][eventId] && updateField === "framework_id";
  },

  shouldCompleteTask(eventId, updateField, eventValue) {
    return (
      this.stateLookups["TASK"][eventId] &&
      updateField === "state" &&
      !TASK_ACTIVE_STATES.includes(eventValue)
    );
  },

  shouldRemoveFramework(eventType, entityType) {
    return eventType === EventTypes.REMOVE && entityType === "FRAMEWORK";
  },

  // Traverse the events from the stream and build an object
  buildMesosState() {
    const self = this;

    const eventStream = MesosEventManager.createEventStream();
    eventStream.subscribe(function(events) {
      for (var i = 0; i < events.size; i++) {
        const eventObject = events.get(i);
        if (self.stateObject == null) {
          self.stateObject = self.generateState(eventObject.value);
          self.setLookupsForEntities();
        } else {
          self.insertToStateObject(eventObject);
        }

        AppDispatcher.handleServerAction({
          type: ActionTypes.REQUEST_MESOS_STATE_SUCCESS,
          data: MesosStateUtil.flagMarathonTasks(self.stateObject)
        });
      }
    });
  },

  getStateObject() {
    return this.stateObject;
  },

  insertToStateObject(event) {
    const newEvent = Object.assign({}, event);
    const pathId = newEvent.path.slice(0, 2);
    const entityType = pathId[0];
    const eventId = pathId[1];
    const schemaKeys = Object.keys(Schema);

    let fieldPath = {
      key: newEvent.path.slice(2)
    };

    const mapIndex = fieldPath.key.join(".");
    if (MesosMapper[mapIndex]) {
      fieldPath = Object.assign({}, MesosMapper[mapIndex]);
    }

    let schemaObject = this.findNestedPropertyInObject(
      this.stateLookups,
      pathId
    );

    if (!schemaObject) {
      if (entityType === "TASK") {
        schemaObject = Object.assign({}, Schema["state.frameworks.tasks"]);
      } else if (entityType === "AGENT") {
        schemaObject = Object.assign({}, Schema["state.slaves"]);
        this.stateObject.slaves.push(schemaObject);
      } else if (entityType === "FRAMEWORK") {
        schemaObject = Object.assign({}, Schema["state.frameworks"]);
        this.stateObject.frameworks.push(schemaObject);
      }

      if (schemaObject) {
        this.stateLookups[entityType][eventId] = schemaObject;
        schemaObject["id"] = eventId;
      }
    }

    const updateField = fieldPath.key[fieldPath.key.length - 1];

    if (schemaObject) {
      if (typeof newEvent.value === "object" && fieldPath.schema) {
        const updateFieldIndex = fieldPath.schema.lastIndexOf(".");
        const wrapperSchema = fieldPath.schema.substring(0, updateFieldIndex);

        const field = fieldPath.schema.substring(updateFieldIndex + 1);

        const wrapperObject = {};

        // TEMP HACK
        // TO-DO: Remove
        if (updateField === "statuses" && !Array.isArray(newEvent.value)) {
          wrapperObject[updateField] = [newEvent.value];
        } else {
          wrapperObject[updateField] = newEvent.value;
        }

        const result = this.applyStateSchema(
          wrapperSchema,
          schemaKeys,
          wrapperObject
        )[field];

        this.insertNestedPropertyInObject(fieldPath.key, result, schemaObject);
      } else {
        this.insertNestedPropertyInObject(
          fieldPath.key,
          newEvent.value,
          schemaObject
        );
      }

      if (this.shouldAddToTasks(eventId, updateField)) {
        const task = this.stateLookups["TASK"][eventId];
        const framework = this.getFrameworkById(task["framework_id"]);
        if (framework) {
          framework.tasks.push(task);
        }
      } else if (
        this.shouldCompleteTask(eventId, updateField, newEvent.value)
      ) {
        const task = this.stateLookups["TASK"][eventId];
        const framework = this.getFrameworkById(task["framework_id"]);
        if (framework) {
          framework.completed_tasks.push(task);
          StateAdapterUtil.remove(framework.tasks, task);
        }
      }

      if (this.shouldRemoveFramework(newEvent.type, entityType)) {
        const framework = this.stateLookups["FRAMEWORK"][eventId];
        if (framework) {
          this.stateObject.completed_frameworks.push(framework);
          StateAdapterUtil.remove(this.stateObject.frameworks, framework);
        } else {
          const task = this.stateLookups["TASK"][eventId];
          if (task) {
            const idParts = task.id.split(".");
            const frameworkSchema = Object.assign(
              {},
              Schema["state.completed_frameworks"]
            );
            this.insertNestedPropertyInObject(
              ["name"],
              idParts[0],
              frameworkSchema
            );
            this.insertNestedPropertyInObject(
              ["id"],
              idParts[1],
              frameworkSchema
            );
            this.insertNestedPropertyInObject(
              ["completed_tasks"],
              [task],
              frameworkSchema
            );

            this.stateObject.completed_frameworks.push(frameworkSchema);
          }
        }
      }
    }
  },

  setLookupsForEntities() {
    const tasks = {};
    const frameworks = {};
    const agents = {};

    FRAMEWORK_TYPES.map(function(frameworkKey) {
      return this.stateObject[frameworkKey];
    }, this).forEach(function(mappedFrameworks) {
      mappedFrameworks.forEach(function(framework) {
        frameworks[framework.id] = framework;

        TASK_TYPES.forEach(function(taskKey) {
          if (!framework[taskKey]) {
            return;
          }
          framework[taskKey].forEach(function(task) {
            tasks[task.id] = task;
          });
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
  insertNestedPropertyInObject(pathFields, value, object) {
    if (pathFields == null || object == null || value == null) {
      return;
    }

    let current = object;
    pathFields.slice(0, pathFields.length - 1).forEach(function(prop) {
      if (!Object.keys(current).includes(prop)) {
        current[prop] = {};
      }

      current = current[prop];
    });

    const inputField = pathFields[pathFields.length - 1];
    if (inputField in current) {
      if (Array.isArray(value)) {
        const fieldArray = current[inputField];
        current[inputField] = fieldArray.concat(value);
      } else if (typeof value === "object") {
        Object.keys(value).forEach(function(key) {
          if (value[key]) {
            current[inputField][key] = value[key];
          }
        });
      } else {
        current[inputField] = value;
      }
    }
  },

  findNestedPropertyInObject(obj, pathFields) {
    if (pathFields == null || obj == null) {
      return null;
    }

    return pathFields.reduce(function(current, nextProp) {
      if (current == null) {
        return current;
      }

      return current[nextProp];
    }, obj);
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
      const stateKeys = Object.keys(stateObject);
      const mesosKeys = Object.keys(mesosEntry);

      stateKeys.forEach(function(field) {
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
        } else if (mesosKeys.includes(field)) {
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

    // Default fill-in values since V1 does not provide these values yet
    this.insertNestedPropertyInObject(["version"], "1.4.0", state);
    this.insertNestedPropertyInObject(
      ["leader_info"],
      {
        hostname: "10.0.4.214",
        port: 5050
      },
      state
    );
    this.insertNestedPropertyInObject(["cluster"], "tnguyen-8kdgd6a", state);

    this.insertNestedPropertyInObject(["build_time"], 1501785347, state);
    this.insertNestedPropertyInObject(["start_time"], 1502730853.78009, state);
    this.insertNestedPropertyInObject(["elected_time"], 1502730853.863, state);

    return state;
  }
};

module.exports = StateAdapter;
