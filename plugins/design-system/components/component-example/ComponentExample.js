import React, { Component } from "react";
import ReactDOMServer from "react-dom/server";
import reactElementToJSXString from "react-element-to-jsx-string";

import StringUtil from "#SRC/js/utils/StringUtil";
import ClipboardTrigger from "#SRC/js/components/ClipboardTrigger";
import Icon from "#SRC/js/components/Icon";

import CodeExample from "./CodeExample";
import CodeExampleFooter from "./CodeExampleFooter";
import CodeExampleHeader from "./CodeExampleHeader";

import CodeExampleTabButtonList from "./CodeExampleTabButtonList";
import CodeExampleTabs from "./CodeExampleTabs";
import CodeExampleTabView from "./CodeExampleTabView";
import CodeExampleTabViewList from "./CodeExampleTabViewList";

import CodeExampleTabButton from "./CodeExampleTabButton";

import { ReactCode, HtmlCode, Preview } from "./ComponentExampleOverrides";

const DEFAULT_HEIGHT = 205;

const REACT_STRING_OPTIONS = {
  showDefaultProps: false,
  useBooleanShorthandSyntax: false
};

const TAB_LABELS = {
  React: "REACT",
  Html: "HTML"
};

const METHODS_TO_BIND = [
  "expandCollapseToggle",
  "handleTabChange",
  "handleCodeCopy",
  "handleCanExpand"
];

class ComponentExample extends Component {
  constructor() {
    super(...arguments);

    this.state = {
      isExpanded: false,
      isCodeCopied: false,
      canExpand: false,
      activeTab: this.isTabbedMode() ? this.props.activeTab || ReactCode : null
    };

    this.defaultHeight = this.props.defaultHeight || DEFAULT_HEIGHT;

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  findChildByType(type) {
    return [].concat(this.props.children).find(function(child) {
      return child.type === type;
    });
  }

  isEmptyHtmlOverride() {
    const htmlCode = this.findChildByType(HtmlCode);

    return htmlCode && !htmlCode.props.children;
  }

  isEmptyReactOverride() {
    const reactCode = this.findChildByType(ReactCode);

    return reactCode && !reactCode.props.children;
  }

  isPreviewMode() {
    return this.isEmptyHtmlOverride() && this.isEmptyReactOverride();
  }

  isSingleBlockMode() {
    return (
      !this.isPreviewMode() &&
      (this.isEmptyHtmlOverride() || this.isEmptyReactOverride())
    );
  }

  isReactMode() {
    return this.isSingleBlockMode() && this.isEmptyHtmlOverride();
  }

  isShowingReactCode() {
    return this.isReactMode() || this.state.activeTab === ReactCode;
  }

  isTabbedMode() {
    return !this.isSingleBlockMode();
  }

  getHtmlCode(jsxCode) {
    let htmlCode = this.findChildByType(HtmlCode);
    if (htmlCode) {
      htmlCode = htmlCode.props.children;
    }

    return StringUtil.formatMarkdown(
      ReactDOMServer.renderToStaticMarkup(htmlCode || jsxCode)
    );
  }

  getReactCode(jsxCode) {
    let reactCode = this.findChildByType(ReactCode);
    if (reactCode) {
      reactCode = reactCode.props.children;
    }

    return reactElementToJSXString(reactCode || jsxCode, REACT_STRING_OPTIONS);
  }

  expandCollapseToggle() {
    this.setState({ isExpanded: !this.state.isExpanded });
  }

  handleTabChange(activeTab) {
    this.setState({
      activeTab,
      isExpanded: false
    });
  }

  handleCanExpand(canExpand) {
    this.setState({ canExpand });
  }

  handleCodeCopy() {
    this.setState({ isCodeCopied: true });
  }

  generateCodeExample(lang, code) {
    const height = this.state.isExpanded ? "100%" : this.defaultHeight;

    return (
      <CodeExample
        lang={lang}
        height={height}
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
    const componentPreview = this.findChildByType(Preview).props.children;
    const header = (
      <CodeExampleHeader>
        {componentPreview}
      </CodeExampleHeader>
    );

    if (this.isPreviewMode()) {
      return header;
    }

    const reactCode = this.getReactCode(componentPreview);
    const htmlCode = this.getHtmlCode(componentPreview);

    const clipboard = (
      <ClipboardTrigger
        className="clickable"
        copyText={this.isShowingReactCode() ? reactCode : htmlCode}
        onTextCopy={this.handleCodeCopy}
        useTooltip={true}
      >
        <Icon size="small" id="clipboard" />
      </ClipboardTrigger>
    );

    const reactCodeExample = this.generateCodeExample("jsx", reactCode);
    const htmlCodeExample = this.generateCodeExample("html", htmlCode);

    const codeBody = (
      <div>
        <div className="code-example-heading single">
          {clipboard}
        </div>
        {this.isReactMode() ? reactCodeExample : htmlCodeExample}
      </div>
    );

    const tabsBody = (
      <CodeExampleTabs
        handleTabChange={this.handleTabChange}
        activeTab={this.state.activeTab}
      >
        <CodeExampleTabButtonList className="tabs">
          <CodeExampleTabButton id={ReactCode} label={TAB_LABELS.React} />
          <CodeExampleTabButton id={HtmlCode} label={TAB_LABELS.Html} />
          {clipboard}
        </CodeExampleTabButtonList>
        <CodeExampleTabViewList>
          <CodeExampleTabView id={ReactCode}>
            {reactCodeExample}
          </CodeExampleTabView>
          <CodeExampleTabView id={HtmlCode}>
            {htmlCodeExample}
          </CodeExampleTabView>
        </CodeExampleTabViewList>
      </CodeExampleTabs>
    );

    return (
      <div>
        {header}
        {this.isSingleBlockMode() ? codeBody : tabsBody}
        {this.generateFooter()}
      </div>
    );
  }
}

module.exports = ComponentExample;
