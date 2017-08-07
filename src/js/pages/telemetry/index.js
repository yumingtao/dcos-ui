import React from "react";

import Icon from "../../components/Icon";

class TelemetryPage extends React.Component {
  render() {
    return this.props.children;
  }
}

TelemetryPage.routeConfig = {
  label: "Telemetry",
  icon: <Icon id="packages-inverse" size="small" family="product" />,
  matches: /^\/telemetry/
};

module.exports = TelemetryPage;
