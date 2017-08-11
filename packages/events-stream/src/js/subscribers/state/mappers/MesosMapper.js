const MesosMapper = {
  agent_id: {
    key: ["slave_id"]
  },
  status: {
    key: ["statuses"],
    schema: "state.frameworks.tasks.statuses"
  },
  resources: {
    key: ["resources"],
    schema: "state.frameworks.tasks.resources"
  },
  "framework_info.name": {
    key: ["name"]
  },
  "framework_id.value": {
    key: ["framework_id"]
  },
  "agent_info.hostname": {
    key: ["hostname"]
  }
};

module.exports = MesosMapper;
