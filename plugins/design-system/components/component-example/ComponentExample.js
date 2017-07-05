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
  "handleCodeCopy",
  "handleCanExpand"
];

const { REACT, HTML, PREVIEW } = ComponentExampleConstants;

class ComponentExample extends Component {
  constructor() {
    super(...arguments);

    this.state = {
      isExpanded: false,
      isCodeCopied: false,
      canExpand: false
    };

    if (this.hasTabs()) {
      this.state.activeTab = this.props.activeTab || REACT;
    }

    this.defaultHeight = this.props.defaultHeight || DEFAULT_HEIGHT;

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  isReactCode() {
    return this.isReactOnly() || this.state.activeTab === REACT;
  }

  isReactOnly() {
    return this.props.only === REACT;
  }

  isHtmlOnly() {
    return this.props.only === HTML;
  }

  isSingleCodeType() {
    return this.isReactOnly() || this.isHtmlOnly();
  }

  hasTabs() {
    return !this.isSingleCodeType();
  }

  isPreviewOnly() {
    return this.props.only === PREVIEW;
  }

  expandCollapseToggle() {
    this.setState({ isExpanded: !this.state.isExpanded });
  }

  handleTabChange(activeTab) {
    this.setState({ activeTab });
    this.setState({ isExpanded: false });
  }

  handleCanExpand(canExpand) {
    this.setState({ canExpand });
  }

  handleCodeCopy() {
    this.setState({ isCodeCopied: true });
  }

  generateCodeExample(lang, code) {
    return (
      <CodeExample
        lang={lang}
        height={this.state.isExpanded ? "100%" : this.defaultHeight}
        handleCanExpand={this.handleCanExpand}
      >
        {`${code}`}
      </CodeExample>
    );
  }

  generateFooter() {
    const expandButton = (
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
    );

    return (
      <CodeExampleFooter>
        {this.state.isExpanded || this.state.canExpand ? expandButton : ""}
      </CodeExampleFooter>
    );
  }

  render() {
    const code = this.props.children;
    const header = (
      <CodeExampleHeader>
        {code}
      </CodeExampleHeader>
    );

    if (this.isPreviewOnly()) {
      return header;
    }

    const reactCode = reactElementToJSXString(code, REACT_STRING_OPTIONS);
    const htmlCode = JSBeautify.html(ReactDOMServer.renderToStaticMarkup(code));

    const clipboard = (
      <ClipboardTrigger
        className="clickable"
        copyText={this.isReactCode() ? reactCode : htmlCode}
        onTextCopy={this.handleCodeCopy}
        useTooltip={true}
      >
        <Icon size="small" id="clipboard" />
      </ClipboardTrigger>
    );

    const reactCodeExample = this.generateCodeExample("jsx", reactCode);
    const htmlCodeExample = this.generateCodeExample("text/html", htmlCode);

    const codeBody = (
      <div>
        <div className="code-example-heading">
          {clipboard}
        </div>
        {this.isReactOnly() ? reactCodeExample : htmlCodeExample}
      </div>
    );

    const tabsBody = (
      <Tabs
        handleTabChange={this.handleTabChange}
        activeTab={this.state.activeTab}
      >
        <TabButtonList className="code-example-heading tabs">
          <ComponentExampleTab
            className="code-example-tab"
            id={REACT}
            label={REACT.toUpperCase()}
          />
          <ComponentExampleTab
            className="code-example-tab"
            id={HTML}
            label={HTML.toUpperCase()}
          />
          {clipboard}
        </TabButtonList>
        <TabViewList>
          <TabView id={REACT}>
            {reactCodeExample}
          </TabView>
          <TabView id={HTML}>
            {htmlCodeExample}
          </TabView>
        </TabViewList>
      </Tabs>
    );

    const footer = this.generateFooter();

    return (
      <div>
        {header}
        {this.isSingleCodeType() ? codeBody : tabsBody}
        {footer}
      </div>
    );
  }
}

ComponentExample.propTypes = {
  only: React.PropTypes.oneOf([REACT, HTML, PREVIEW])
};

module.exports = ComponentExample;
