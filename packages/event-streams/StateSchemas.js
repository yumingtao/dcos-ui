import { Aliases } from "./StateAliases";

const Schema = {
  state: {
    version: "",
    cluster: "",
    leader_info: {},
    build_time: 0,
    start_time: 0,
    elected_time: 0,
    build_user: "",
    frameworks: [],
    completed_frameworks: [],
    executors: [],
    completed_executors: [],
    slaves: []
  },
  "state.leader_info": {
    hostname: "",
    port: 0
  },
  "state.frameworks": {
    name: "",
    id: "",
    tasks: [],
    completed_tasks: []
  },
  "state.frameworks.tasks": {
    id: "",
    slave_id: "",
    framework_id: "",
    resources: {},
    statuses: [],
    state: "",
    labels: []
  },
  "state.frameworks.tasks.resources": {
    cpus: "",
    disk: "",
    mem: "",
    gpus: undefined,
    ports: ""
  },
  "state.frameworks.tasks.statuses": {
    timestamp: ""
  },
  "state.frameworks.tasks.labels": {
    key: "",
    value: ""
  },
  "state.executors": {
    id: "",
    type: "",
    directory: ""
  },
  "state.slaves": {
    id: "",
    hostname: ""
  }
};

Object.keys(Aliases).forEach(function(aliasKey) {
  Object.keys(Schema).forEach(function(schemaKey) {
    if (schemaKey.startsWith(aliasKey)) {
      Aliases[aliasKey].forEach(function(alias) {
        Schema[schemaKey.replace(aliasKey, alias)] = Schema[schemaKey];
      });
    }
  });
});

module.export = Schema;
