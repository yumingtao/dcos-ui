import React, { Component } from "react";
import PropTypes from "prop-types";
import SchemaForm from "react-jsonschema-form";

export default class SchemaTabForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedTab: Object.keys(props.schema.properties)[0],
      errorTabs: new Set()
    };
  }

  handleTabChange(key) {
    this.setState({ selectedTab: key });
  }

  // todo this isn't working right now
  transformErrors(errors) {
    const errorTabs = new Set();
    for (const error of errors) {
      const errorTab = Object.keys(this.props.schema.properties).find(tab => {
        return error.property.indexOf(tab);
      });
      errorTabs.add(errorTab);
    }

    this.setState({ errorTabs });

    return errors;
  }

  render() {
    const { errorTabs } = this.state;

    const tabs = Object.keys(this.props.schema.properties).map(tab => {
      return (
        <div
          key={tab}
          onClick={this.handleTabChange.bind(this, tab)}
          className={errorTabs.has(tab) ? "has-errors" : ""}
        >
          {tab}
        </div>
      );
    });

    const uiSchema = {};

    // use number input for type: number in json schema
    Object.keys(this.props.schema.properties).forEach(tab => {
      uiSchema[tab] = {};
      Object.keys(
        this.props.schema.properties[tab].properties
      ).forEach(field => {
        uiSchema[tab][field] = {};
        if (
          this.props.schema.properties[tab].properties[field].type === "number"
        ) {
          uiSchema[tab][field]["ui:widget"] = "updown";
        }
      });
    });

    // hide tabs that aren't the current tab
    Object.keys(this.props.schema.properties).forEach(key => {
      if (key !== this.state.selectedTab) {
        uiSchema[key].classNames = "hidden";
      }
    });

    return (
      <div className="multiple-form">
        <div className="multiple-form-left-column">
          {tabs}
        </div>
        <div className="multiple-form-right-column gm-prevented">
          <SchemaForm
            schema={this.props.schema}
            formData={this.props.formData}
            onChange={this.props.onChange}
            uiSchema={uiSchema}
            transformErrors={this.transformErrors.bind(this)}
          >
            <div />
          </SchemaForm>
        </div>
      </div>
    );
  }
}

SchemaTabForm.propTypes = {
  schema: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired
};
