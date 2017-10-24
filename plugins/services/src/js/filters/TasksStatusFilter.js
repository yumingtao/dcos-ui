import DSLFilterTypes from "#SRC/js/constants/DSLFilterTypes";
import DSLFilter from "#SRC/js/structs/DSLFilter";

const LABELS = ["is", "zone"];

const LABEL_TO_STATUS = {
  active: "active",
  completed: "completed",
  zone: "zone"
};

/**
 * This filter handles the `health:status` for services using `getHealth`
 */
class TasksStatusFilter extends DSLFilter {
  /**
   * Handle all `health:XXXX` attribute filters that we can handle.
   *
   * @override
   */
  filterCanHandle(filterType, filterArguments) {
    return (
      filterType === DSLFilterTypes.ATTRIB &&
      LABELS.contains(filterArguments.label) &&
      LABEL_TO_STATUS[filterArguments.text.toLowerCase()] != null
    );
  }

  /**
   * Keep only services whose health status matches the value of
   * the `health` label
   *
   * @override
   */
  filterApply(resultset, filterType, filterArguments) {
    const testStatus = LABEL_TO_STATUS[filterArguments.text.toLowerCase()];

    return resultset.filterItems(task => {
      return task.state.toLowerCase() === testStatus;
    });
  }
}

module.exports = TasksStatusFilter;
