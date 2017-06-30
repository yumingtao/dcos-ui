import React, { Component } from "react";
import ReactDOMServer from "react-dom/server";
import JSBeautify from "js-beautify";
import reactElementToJSXString from "react-element-to-jsx-string";

import TabButtonList from "#SRC/js/components/TabButtonList";
import Tabs from "#SRC/js/components/Tabs";
import TabView from "#SRC/js/components/TabView";
import TabViewList from "#SRC/js/components/TabViewList";

import ClipboardTrigger from "#SRC/js/components/ClipboardTrigger";
import Icon from "#SRC/js/components/Icon";

import CodeExample from "./CodeExample";
import CodeExampleFooter from "./CodeExampleFooter";
import CodeExampleHeader from "./CodeExampleHeader";
import ComponentExampleTab from "./ComponentExampleTab";

import ComponentExampleConstants from "../../constants/ComponentExample";

const DEFAULT_HEIGHT = 205;

const REACT_STRING_OPTIONS = {
  showDefaultProps: false,
  useBooleanShorthandSyntax: false
};

const METHODS_TO_BIND = [
  "expandCollapseToggle",
  "handleTabChange",
  "handleCodeCopy"
];

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

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
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
        <CodeExampleHeader>
          {code}
        </CodeExampleHeader>
        <Tabs
          handleTabChange={this.handleTabChange}
          activeTab={this.state.activeTab}
        >
          <TabButtonList className="code-example-tab-container">
            <ComponentExampleTab
              className="code-example-tab"
              id={REACT}
              label={REACT}
            />
            <ComponentExampleTab
              className="code-example-tab"
              id={HTML}
              label={HTML}
            />

            <ClipboardTrigger
              className="clickable"
              copyText={this.getCopyCode(code)}
              onTextCopy={this.handleCodeCopy}
              useTooltip="true"
            >
              <Icon size="small" id="clipboard" />
            </ClipboardTrigger>
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
            className="button button-link"
            type="button"
            onClick={this.expandCollapseToggle}
          >
            {this.state.isExpanded ? "Show less" : "Show more"}
            <Icon
              size="mini"
              id={this.state.isExpanded ? "caret-up" : "caret-down"}
            />
          </button>
        </CodeExampleFooter>
      </div>
    );
  }
}

module.exports = ComponentExample;
