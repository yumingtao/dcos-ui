import React, { Component } from "react";
import reactElementToJSXString from "react-element-to-jsx-string";

import TabButton from "#SRC/js/components/TabButton";
import TabButtonList from "#SRC/js/components/TabButtonList";
import Tabs from "#SRC/js/components/Tabs";
import TabView from "#SRC/js/components/TabView";
import TabViewList from "#SRC/js/components/TabViewList";

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
      isExpanded: false,
      activeTab: null
    };

    this.defaultHeight = this.props.defaultHeight || DEFAULT_HEIGHT;
    this.expandCollapseToggle = this.expandCollapseToggle.bind(this);
    this.handleTabChange = this.handleTabChange.bind(this);
  }

  expandCollapseToggle() {
    this.setState({ isExpanded: !this.state.isExpanded });
  }

  handleTabChange(activeTab) {
    this.setState({ activeTab });
  }

  render() {
    const code = this.props.children;

    return (
      <div>
        <CodeExampleHeader>
          {code}
        </CodeExampleHeader>
        <Tabs
          handleTabChange={this.handleTabChange}
          activeTab={this.state.activeTab}
        >
          <TabButtonList className="code-example-tab-container">
            <TabButton id="react" label="React" />
            <TabButton id="html" label="HTML" />
          </TabButtonList>
          <TabViewList>
            <TabView id="react">
              <CodeExample
                lang="jsx"
                height={this.state.isExpanded ? "100%" : this.defaultHeight}
              >
                {`${reactElementToJSXString(code, REACT_STRING_OPTIONS)}`}
              </CodeExample>
            </TabView>
            <TabView id="html">
              <CodeExample
                lang="text/html"
                height={this.state.isExpanded ? "100%" : this.defaultHeight}
              >
                {"<div><p>Hello</p></div>"}
              </CodeExample>
            </TabView>
          </TabViewList>
        </Tabs>
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
