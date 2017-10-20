import classNames from "classnames";
import React from "react";

const ModalHeading = props => {
  const { children } = props;

  return React.createElement(
    `h2`,
    {
      className: classNames("modal-header-title")
    },
    children
  );
};

ModalHeading.propTypes = {
  align: React.PropTypes.oneOf(["left", "right", "center"]),
  children: React.PropTypes.node.isRequired,
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ]),
  flush: React.PropTypes.bool,
  level: React.PropTypes.oneOf([1, 2, 3, 4, 5, 6])
};

module.exports = ModalHeading;
