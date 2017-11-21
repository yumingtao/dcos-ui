import React, { Component } from "react";
import Batch from "#SRC/js/structs/Batch";
import Transaction from "#SRC/js/structs/Transaction";
import { deepCopy } from "#SRC/js/utils/Util";
import TransactionTypes from "#SRC/js/constants/TransactionTypes";
import PlacementConstraintsPartial
  from "#SRC/js/components/PlacementConstraintsPartial";
import { JSONReducer, JSONParser }
  from "#PLUGINS/services/src/js/reducers/serviceForm/JSONReducers/Constraints";
import { FormReducer }
  from "#PLUGINS/services/src/js/reducers/serviceForm/FormReducers/Constraints";
import CreateServiceModalFormUtil
  from "#PLUGINS/services/src/js/utils/CreateServiceModalFormUtil";

export default class PlacementConstriantsFrameworkAdapter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      batch: new Batch(),
      appConfig: [],
      ready: false
    };
  }

  componentDidMount() {
    this.getInitialAppConfig();
  }

  // todo call this every time the JSON changes!
  getInitialAppConfig() {
    const arrayified = { constraints: JSON.parse(this.props.data)};

    // Regenerate batch
    // I'm not sure if I should be calling this Constriants parser directly of calling the big parser like JSONSingleContainerParser
    const batch = JSONParser(deepCopy(arrayified))
      .reduce((batch, item) => {
        return batch.add(item);
      }, new Batch());

    const appConfig = this.getAppConfig(batch, arrayified);

    this.setState({ batch, appConfig, ready: true });
  }

  // this is the value for the JSON editor...use reducer to convert to JSON
  getAppConfig(batch, baseConfig) {
    const newConfig = batch.reduce(JSONReducer, deepCopy(baseConfig));

    return CreateServiceModalFormUtil.stripEmptyProperties(newConfig);
  }

  // direct copy paste, todo change
  // handleFormChange(event) {
  //   const fieldName = event.target.getAttribute("name");
  //   if (!fieldName) {
  //     return;
  //   }

  //   let { batch } = this.state;
  //   let value = event.target.value;
  //   if (event.target.type === "checkbox") {
  //     value = event.target.checked;
  //   }
  //   const path = fieldName.split(".");
  //   batch = batch.add(new Transaction(path, value));

  //   const newState = {
  //     appConfig: this.getAppConfig(batch),
  //     batch,
  //     editingFieldPath: fieldName
  //   };

  //   this.setState(newState);
  // }

  // // direct copy paste, todo change
  // handleAddItem(event) {
  //   const { value, path } = event;
  //   let { batch } = this.state;

  //   batch = batch.add(
  //     new Transaction(path.split("."), value, TransactionTypes.ADD_ITEM)
  //   );

  //   this.setState({ batch, appConfig: this.getAppConfig(batch) });
  // }

  // // direct copy paste, todo change
  // handleRemoveItem(event) {
  //   const { value, path } = event;
  //   let { batch } = this.state;

  //   batch = batch.add(
  //     new Transaction(path.split("."), value, TransactionTypes.REMOVE_ITEM)
  //   );

  //   this.setState({ batch, appConfig: this.getAppConfig(batch) });
  // }

  render() {
    const { batch, ready } = this.state;

    if (!ready) {
      return null;
    }

    // same as for marathon form
    const data = batch.reduce(FormReducer, {});

    // todo what to do about errors
    return (
      <PlacementConstraintsPartial
        data={data}
        onAddItem={this.handleAddItem}
        onRemoveItem={this.handleAddItem}
      />
    );
  }
}
