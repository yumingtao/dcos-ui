import PureRender from "react-addons-pure-render-mixin";
import PropTypes from "prop-types";
import React from "react";

import FilterBar from "#SRC/js/components/FilterBar";
import FilterButtons from "#SRC/js/components/FilterButtons";
import FilterHeadline from "#SRC/js/components/FilterHeadline";
import ResourceBarChart from "#SRC/js/components/charts/ResourceBarChart";

import FilterByService
  from "../../../../../services/src/js/components/FilterByService";

const HEALTH_FILTER_BUTTONS = ["all", "healthy", "unhealthy"];

const METHODS_TO_BIND = ["onResetFilter"];

class HostsPageContent extends React.Component {
  constructor() {
    super(...arguments);
    this.shouldComponentUpdate = PureRender.shouldComponentUpdate.bind(this);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  onResetFilter() {
    this.props.onResetFilter(...arguments);

    if (this.serviceFilter !== null && this.serviceFilter.dropdown !== null) {
      this.serviceFilter.setDropdownValue("default");
    }
  }

  render() {
    const {
      byServiceFilter,
      children,
      filterButtonContent,
      filterInputText,
      filterItemList,
      filteredNodeCount,
      handleFilterChange,
      hosts,
      isFiltering,
      nodeCount,
      onFilterChange,
      onResourceSelectionChange,
      refreshRate,
      selectedFilter,
      selectedResource,
      services,
      totalHostsResources,
      totalNodeCount,
      totalResources,
      viewTypeRadioButtons
    } = this.props;

    return (
      <div>
        <ResourceBarChart
          itemCount={nodeCount}
          onResourceSelectionChange={onResourceSelectionChange}
          refreshRate={refreshRate}
          resourceType="Nodes"
          resources={totalHostsResources}
          selectedResource={selectedResource}
          totalResources={totalResources}
        />
        <FilterHeadline
          currentLength={filteredNodeCount}
          isFiltering={isFiltering}
          name="Node"
          onReset={this.onResetFilter}
          totalLength={totalNodeCount}
        />
        <FilterBar rightAlignLastNChildren={1}>
          {filterInputText}
          <FilterButtons
            filterByKey="title"
            filters={HEALTH_FILTER_BUTTONS}
            itemList={filterItemList}
            onFilterChange={onFilterChange}
            renderButtonContent={filterButtonContent}
            selectedFilter={selectedFilter}
          />
          <div className="form-group flush-bottom">
            <FilterByService
              byServiceFilter={byServiceFilter}
              handleFilterChange={handleFilterChange}
              ref={ref => (this.serviceFilter = ref)}
              services={services}
              totalHostsCount={totalNodeCount}
            />
          </div>
          {viewTypeRadioButtons}
        </FilterBar>
        {React.cloneElement(children, {
          hosts,
          selectedResource,
          services
        })}
      </div>
    );
  }
}

HostsPageContent.propTypes = {
  byServiceFilter: PropTypes.string,
  filterButtonContent: PropTypes.func,
  filterInputText: PropTypes.node,
  filterItemList: PropTypes.array.isRequired,
  filteredNodeCount: PropTypes.number.isRequired,
  handleFilterChange: PropTypes.func.isRequired,
  hosts: PropTypes.array.isRequired,
  isFiltering: PropTypes.bool,
  nodeCount: PropTypes.number.isRequired,
  onFilterChange: PropTypes.func,
  onResetFilter: PropTypes.func.isRequired,
  onResourceSelectionChange: PropTypes.func.isRequired,
  refreshRate: PropTypes.number.isRequired,
  selectedFilter: PropTypes.string,
  selectedResource: PropTypes.string.isRequired,
  services: PropTypes.array.isRequired,
  totalHostsResources: PropTypes.object.isRequired,
  totalNodeCount: PropTypes.number.isRequired,
  totalResources: PropTypes.object.isRequired,
  viewTypeRadioButtons: PropTypes.node.isRequired
};

module.exports = HostsPageContent;
