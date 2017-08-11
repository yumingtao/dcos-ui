import Aliases from "./StateAliases";

const Schema = {
  state: {
    version: "",
    cluster: "",
    leader_info: {},
    build_time: undefined,
    start_time: undefined,
    elected_time: undefined,
    build_user: "",
    frameworks: [],
    completed_frameworks: [],
    executors: [],
    completed_executors: [],
    slaves: []
  },
  "state.leader_info": {
    hostname: "",
    port: undefined
  },
  "state.frameworks": {
    name: "",
    id: "",
    tasks: [],
    completed_tasks: []
  },
  "state.frameworks.tasks": {
    id: "",
    name: "",
    slave_id: "",
    framework_id: "",
    discovery: {},
    container: {},
    resources: {},
    statuses: [],
    state: "",
    labels: []
  },
  "state.frameworks.tasks.discovery": {
    ports: {}
  },
  "state.frameworks.tasks.resources": {
    cpus: undefined,
    disk: undefined,
    mem: undefined,
    gpus: undefined,
    ports: undefined
  },
  "state.frameworks.tasks.statuses": {
    state: "",
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
    pid: "",
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

module.exports = Schema;
