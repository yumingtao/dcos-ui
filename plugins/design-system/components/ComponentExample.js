import React, { Component } from "react";
import ReactDOMServer from "react-dom/server";
import JSBeautify from "js-beautify";
import reactElementToJSXString from "react-element-to-jsx-string";

import TabButton from "#SRC/js/components/TabButton";
import TabButtonList from "#SRC/js/components/TabButtonList";
import Tabs from "#SRC/js/components/Tabs";
import TabView from "#SRC/js/components/TabView";
import TabViewList from "#SRC/js/components/TabViewList";

import ClipboardTrigger from "#SRC/js/components/ClipboardTrigger";

import CodeExample from "./CodeExample";
import CodeExampleFooter from "./CodeExampleFooter";
import CodeExampleHeader from "./CodeExampleHeader";

import ComponentExampleConstants from "../constants/ComponentExample";

const DEFAULT_HEIGHT = 205;

const REACT_STRING_OPTIONS = {
  showDefaultProps: false,
  useBooleanShorthandSyntax: false
};

const { type: { REACT, HTML } } = ComponentExampleConstants;

class ComponentExample extends Component {
  constructor() {
    super(...arguments);

    this.state = {
      isExpanded: false,
      isCodeCopied: false,
      activeTab: this.props.activeTab
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

  handleCodeCopy() {
    this.setState({ isCodeCopied: true });
  }

  getCopyCode(code) {
    if (this.state.activeTab === REACT) {
      return reactElementToJSXString(code, REACT_STRING_OPTIONS);
    }

    return JSBeautify.html(ReactDOMServer.renderToStaticMarkup(code));
  }

  render() {
    const code = this.props.children;

    return (
      <div>
        <ClipboardTrigger
          className="dropdown-menu-item-padding-surrogate clickable"
          copyText={this.getCopyCode(code)}
          onTextCopy={this.handleCodeCopy}
          useTooltip="true"
        >
          Test
        </ClipboardTrigger>
        <CodeExampleHeader>
          {code}
        </CodeExampleHeader>
        <Tabs
          handleTabChange={this.handleTabChange}
          activeTab={this.state.activeTab}
        >
          <TabButtonList className="code-example-tab-container">
            <TabButton id={REACT} label="React" />
            <TabButton id={HTML} label="HTML" />
          </TabButtonList>
          <TabViewList>
            <TabView id={REACT}>
              <CodeExample
                lang="jsx"
                height={this.state.isExpanded ? "100%" : this.defaultHeight}
              >
                {`${reactElementToJSXString(code, REACT_STRING_OPTIONS)}`}
              </CodeExample>
            </TabView>
            <TabView id={HTML}>
              <CodeExample
                lang="text/html"
                height={this.state.isExpanded ? "100%" : this.defaultHeight}
              >
                {`${JSBeautify.html(ReactDOMServer.renderToStaticMarkup(code))}`}
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
