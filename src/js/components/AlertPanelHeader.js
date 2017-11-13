import PropTypes from "prop-types";
import React from "react";

const AlertPanelHeader = function(props) {
  return (
    <h3 className="flush-top">
      {props.children}
    </h3>
  );
};

AlertPanelHeader.propTypes = {
  children: PropTypes.node
};

module.exports = AlertPanelHeader;
