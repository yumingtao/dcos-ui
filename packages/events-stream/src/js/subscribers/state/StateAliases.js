const Aliases = {
  "state.frameworks": ["state.completed_frameworks"],
  "state.frameworks.tasks": ["state.frameworks.completed_tasks"],
  "state.completed_frameworks.tasks": [
    "state.completed_frameworks.completed_tasks"
  ],
  "state.executors": ["state.completed_executors"]
};

module.exports = Aliases;
