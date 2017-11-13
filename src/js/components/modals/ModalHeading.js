import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";

const ModalHeading = props => {
  const { align, children, className, flush, level } = props;

  return React.createElement(
    `h${level}`,
    {
      className: classNames(
        `text-align-${align}`,
        {
          flush
        },
        className
      )
    },
    children
  );
};

ModalHeading.defaultProps = {
  align: "center",
  flush: true,
  level: 2
};

ModalHeading.propTypes = {
  align: PropTypes.oneOf(["left", "right", "center"]),
  children: PropTypes.node.isRequired,
  className: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ]),
  flush: PropTypes.bool,
  level: PropTypes.oneOf([1, 2, 3, 4, 5, 6])
};

module.exports = ModalHeading;
