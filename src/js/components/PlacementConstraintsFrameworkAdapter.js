import React, { Component } from "react";
import Batch from "#SRC/js/structs/Batch";
import Transaction from "#SRC/js/structs/Transaction";
import { deepCopy } from "#SRC/js/utils/Util";
import TransactionTypes from "#SRC/js/constants/TransactionTypes";
import PlacementConstraintsPartial
  from "#SRC/js/components/PlacementConstraintsPartial";
import JSONSingleContainerParser
  from "#PLUGINS/services/src/js/reducers/JSONSingleContainerParser";
import CreateServiceModalFormUtil
  from "#PLUGINS/services/src/js/utils/CreateServiceModalFormUtil";

export default class PlacementConstriantsFrameworkAdapter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      batch: new Batch(),
      appConfig: this.getInitialAppConfig()
    };
  }

  getInitialAppConfig() {
    // parse
    const arrayified = JSON.parse(this.props.data);

    // add a transaction for each in the array of given constraints
    const batch = new Batch();

    return this.getAppConfig(batch);
  }

  getAppConfig(batch = this.state.batch, baseConfig = {}) {
    const baseConfigCopy = deepCopy(baseConfig);
    const newConfig = batch.reduce(JSONSingleContainerParser, baseConfigCopy);

    return CreateServiceModalFormUtil.stripEmptyProperties(newConfig);
  }

  // direct copy paste
  handleFormChange(event) {
    const fieldName = event.target.getAttribute("name");
    if (!fieldName) {
      return;
    }

    let { batch } = this.state;
    let value = event.target.value;
    if (event.target.type === "checkbox") {
      value = event.target.checked;
    }
    const path = fieldName.split(".");
    batch = batch.add(new Transaction(path, value));

    const newState = {
      appConfig: this.getAppConfig(batch),
      batch,
      editingFieldPath: fieldName
    };

    this.setState(newState);
  }

  // direct copy paste
  handleAddItem(event) {
    const { value, path } = event;
    let { batch } = this.state;

    batch = batch.add(
      new Transaction(path.split("."), value, TransactionTypes.ADD_ITEM)
    );

    this.setState({ batch, appConfig: this.getAppConfig(batch) });
  }

  // direct copy paste
  handleRemoveItem(event) {
    const { value, path } = event;
    let { batch } = this.state;

    batch = batch.add(
      new Transaction(path.split("."), value, TransactionTypes.REMOVE_ITEM)
    );

    this.setState({ batch, appConfig: this.getAppConfig(batch) });
  }

  render() {
    const { batch } = this.state;

    const data = batch.reduce(JSONSingleContainerParser, {});

    // todo what to do about errors
    return (
      <PlacementConstraintsPartial
        data={{ constraints: data }}
        onAddItem={this.handleAddItem}
        onRemoveItem={this.handleAddItem}
      />
    );
  }
}
