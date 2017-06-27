import React, { Component } from "react";
import reactElementToJSXString from "react-element-to-jsx-string";

import CodeExample from "./CodeExample";
import CodeExampleFooter from "./CodeExampleFooter";
import CodeExampleHeader from "./CodeExampleHeader";

const DEFAULT_HEIGHT = 205;

const REACT_STRING_OPTIONS = {
  showDefaultProps: false,
  useBooleanShorthandSyntax: false
};

class ComponentExample extends Component {
  constructor() {
    super(...arguments);

    this.state = {
      isExpanded: false
    };

    this.defaultHeight = this.props.defaultHeight || DEFAULT_HEIGHT;
    this.expandCollapseToggle = this.expandCollapseToggle.bind(this);
  }

  expandCollapseToggle() {
    this.setState({ isExpanded: !this.state.isExpanded });
  }

  render() {
    const code = this.props.children;

    return (
      <div>
        <h3 className="flush-top">Checkbox</h3>
        <CodeExampleHeader>
          {code}
        </CodeExampleHeader>
        <CodeExample
          height={this.state.isExpanded ? "100%" : this.defaultHeight}
        >
          {`${reactElementToJSXString(code, REACT_STRING_OPTIONS)}`}
        </CodeExample>
        <CodeExampleFooter>
          <button
            className="button"
            type="button"
            onClick={this.expandCollapseToggle}
          >
            {this.state.isExpanded ? "Show less code" : "Show more code"}
          </button>
        </CodeExampleFooter>
      </div>
    );
  }
}

module.exports = ComponentExample;
