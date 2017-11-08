import React from "react";

import CosmosPackagesStore from "#SRC/js/stores/CosmosPackagesStore";
import Loader from "#SRC/js/components/Loader";
import UniversePackage from "#SRC/js/structs/UniversePackage";

import Framework from "#PLUGINS/services/src/js/structs/Framework";
import { COSMOS_SERVICE_DESCRIBE_CHANGE } from "#SRC/js/constants/EventTypes";
import HashMapDisplay from "#SRC/js/components/HashMapDisplay";
import Util from "#SRC/js/utils/Util";
import StringUtil from "#SRC/js/utils/StringUtil";

const METHODS_TO_BIND = [
  "onCosmosPackagesStoreServiceDescriptionSuccess",
  "reorderResolvedOptions",
  "getHashMapRenderKeys"
];

class FrameworkConfigurationContainer extends React.Component {
  constructor(props) {
    super(props);

    const { service } = this.props;

    this.state = {
      frameworkData: null
    };

    CosmosPackagesStore.fetchServiceDescription(service.getId());

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    CosmosPackagesStore.addChangeListener(
      COSMOS_SERVICE_DESCRIBE_CHANGE,
      this.onCosmosPackagesStoreServiceDescriptionSuccess
    );
  }

  componentWillUnmount() {
    CosmosPackagesStore.removeChangeListener(
      COSMOS_SERVICE_DESCRIBE_CHANGE,
      this.onCosmosPackagesStoreServiceDescriptionSuccess
    );
  }

  onCosmosPackagesStoreServiceDescriptionSuccess() {
    const fullPackage = CosmosPackagesStore.getServiceDetails();
    const packageDetails = new UniversePackage(fullPackage.package);

    // necessary to have review screen same order of tabs as the form
    const frameworkData = this.reorderResolvedOptions(
      fullPackage.resolvedOptions,
      packageDetails.getConfig()
    );

    this.setState({ frameworkData });
  }

  reorderResolvedOptions(resolvedOptions, config) {
    const order = Object.keys(config.properties);
    const orderedResolvedOptions = {};
    order.forEach(tab => {
      orderedResolvedOptions[tab] = resolvedOptions[tab];
    });

    return orderedResolvedOptions;
  }

  getHashMapRenderKeys(formData) {
    if (!Util.isObject(formData)) {
      return {};
    }

    let renderKeys = {};
    Object.keys(formData).forEach(key => {
      renderKeys[key] = StringUtil.capitalizeEveryWord(key);
      renderKeys = Object.assign(
        renderKeys,
        this.getHashMapRenderKeys(formData[key])
      );
    });

    return renderKeys;
  }

  render() {
    const { frameworkData } = this.state;

    if (!frameworkData) {
      return <Loader />;
    }

    return (
      <div className="container">
        <HashMapDisplay
          hash={frameworkData}
          renderKeys={this.getHashMapRenderKeys(frameworkData)}
          headlineClassName={"text-capitalize"}
          emptyValue={"\u2014"}
        />
      </div>
    );
  }
}

FrameworkConfigurationContainer.defaultProps = {
  errors: []
};

FrameworkConfigurationContainer.propTypes = {
  onEditClick: React.PropTypes.func,
  errors: React.PropTypes.array,
  service: React.PropTypes.instanceOf(Framework)
};

module.exports = FrameworkConfigurationContainer;
