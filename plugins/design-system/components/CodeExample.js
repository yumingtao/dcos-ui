import React, { Component } from "react";
import ReactCodeMirror from "react-codemirror";
import "../vendor/simplescrollbars.js";

require("codemirror/mode/jsx/jsx");

class CodeExample extends Component {
  updateCode(newCode) {
    this.setState({
      code: newCode
    });
  }

  setHeight(ref) {
    if (ref != null) {
      const cm = ref.getCodeMirror();
      const { height } = this.props;

      cm.setSize(null, height);
    }
  }

  render() {
    const { lang } = this.props;
    var options = {
      lineNumbers: true,
      mode: lang,
      theme: "one-dark",
      scrollbarStyle: "overlay",
      readOnly: true
    };

    return (
      <ReactCodeMirror
        ref={this.setHeight.bind(this)}
        value={this.props.children}
        onChange={this.updateCode}
        options={options}
      />
    );
  }
}

module.exports = CodeExample;
