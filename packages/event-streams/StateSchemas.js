const StateSchemas = {
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
    gpus: undefined
  },
  "state.frameworks.tasks.statuses": {
    timestamp: ""
  },
  "state.frameworks.tasks.labels": {
    key: "",
    value: ""
  },
  "state.frameworks.completed_tasks.labels": {
    key: "",
    value: ""
  },
  "state.frameworks.completed_tasks": {
    id: "",
    labels: []
  },
  "state.executors": {
    id: "",
    type: "",
    directory: ""
  },
  "state.completed_executors": {
    id: "",
    type: "",
    directory: ""
  },
  "state.slaves": {
    id: "",
    hostname: ""
  }
};

module.export = StateSchemas;
