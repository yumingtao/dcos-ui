import Aliases from "./StateAliases";

const StateMapper = {
  "state.frameworks": mesosObject => {
    if (mesosObject["get_frameworks"]) {
      return mesosObject["get_frameworks"]["frameworks"];
    }

    return [];
  },
  "state.completed_frameworks": mesosObject => {
    if (mesosObject["get_frameworks"]) {
      return mesosObject["get_frameworks"]["completed_frameworks"];
    }

    return [];
  },
  "state.frameworks.id": mesosObject => {
    return mesosObject["framework_info"]["id"]["value"];
  },
  "state.frameworks.name": mesosObject => {
    return mesosObject["framework_info"]["name"];
  },
  "state.frameworks.tasks.resources": mesosObject => {
    return mesosObject["resources"].reduce(function(result, entry) {
      if (entry.type === "SCALAR") {
        result[entry.name] = entry.scalar.value;
      } else if (entry.type === "RANGES") {
        result[entry.name] =
          "[" +
          entry.ranges.range
            .map(function(range) {
              return range.begin + "-" + range.end;
            })
            .toString() +
          "]";
      }

      return result;
    }, {});
  },
  "state.frameworks.tasks.labels": mesosObject => {
    if (mesosObject["labels"]) {
      return mesosObject["labels"]["labels"];
    }
  },
  "state.frameworks.tasks.id": mesosObject => {
    return mesosObject["task_id"]["value"];
  },
  "state.frameworks.tasks.slave_id": mesosObject => {
    return mesosObject["agent_id"]["value"];
  },
  "state.frameworks.tasks.framework_id": mesosObject => {
    return mesosObject["framework_id"]["value"];
  },
  "state.slaves": mesosObject => {
    if (mesosObject["get_agents"]) {
      return mesosObject["get_agents"]["agents"];
    }

    return [];
  },
  "state.slaves.id": mesosObject => {
    return mesosObject["agent_info"]["id"]["value"];
  },
  "state.slaves.hostname": mesosObject => {
    return mesosObject["agent_info"]["hostname"];
  }
};

Object.keys(Aliases).forEach(function(aliasKey) {
  Object.keys(StateMapper).forEach(function(schemaKey) {
    if (
      schemaKey.length !== aliasKey.length &&
      schemaKey.startsWith(aliasKey)
    ) {
      Aliases[aliasKey].forEach(function(alias) {
        StateMapper[schemaKey.replace(aliasKey, alias)] =
          StateMapper[schemaKey];
      });
    }
  });
});

module.exports = StateMapper;
