import React from "react";

import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import ConfigurationMapHeading
  from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection
  from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import Icon from "#SRC/js/components/Icon";
import AlertPanel from "#SRC/js/components/AlertPanel";
import AlertPanelHeader from "#SRC/js/components/AlertPanelHeader";

import SDKEndpointActions from "../../events/SDKEndpointActions";
import SDKEndpointStore from "../../stores/SDKEndpointStore";

const METHODS_TO_BIND = [];

class SDKServiceConnectionContainer extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
    const service = this.props.service;

    SDKEndpointActions.fetchEndpoints(service.getId());
  }

  getEndpointAddress(endpoint) {
    return (
      <ConfigurationMapValue> {endpoint.getAddress()} </ConfigurationMapValue>
    );
  }

  getEndpointDNS(endpoint) {
    return <ConfigurationMapValue> {endpoint.getDns()} </ConfigurationMapValue>;
  }

  getEndpointVIP(endpoint) {
    return <ConfigurationMapValue> {endpoint.getVip()} </ConfigurationMapValue>;
  }

  getEndpoint(endpoint) {
    return (
      <ConfigurationMapSection>
        <ConfigurationMapHeading>
          {endpoint.getEndpointName()}
        </ConfigurationMapHeading>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            Address
          </ConfigurationMapLabel>
          {this.getEndpointAddress(endpoint)}
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            DNS
          </ConfigurationMapLabel>
          {this.getEndpointDNS(endpoint)}
        </ConfigurationMapRow>
        <ConfigurationMapRow>
          <ConfigurationMapLabel>
            VIP
          </ConfigurationMapLabel>
          {this.getEndpointVIP(endpoint)}
        </ConfigurationMapRow>
      </ConfigurationMapSection>
    );
  }

  getFileEndpoint(endpoint) {
    return (
      <ConfigurationMapRow>
        <ConfigurationMapLabel>
          {endpoint.getEndpointName()}
        </ConfigurationMapLabel>
        <ConfigurationMapValue>
          <a
            className="active"
            download={endpoint.getEndpointName()}
            href={`data:text/plain;content-disposition=attachment;filename=${endpoint.getEndpointName()};charset=utf-8,${encodeURIComponent(endpoint.getEndpointData())}`}
          >
            <span><Icon id="download" size="mini" /> Download</span>
          </a>
        </ConfigurationMapValue>
      </ConfigurationMapRow>
    );
  }

  getFileEndpoints(endpoints) {
    const fileEndpoints = endpoints.filter(endpoint => {
      return !endpoint.isJSON();
    });

    if (!fileEndpoints || fileEndpoints.length === 0) {
      return;
    }

    return (
      <ConfigurationMapSection>
        <ConfigurationMapHeading>
          Files
        </ConfigurationMapHeading>
        {endpoints.map(endpoint => {
          return this.getFileEndpoint(endpoint);
        })}
      </ConfigurationMapSection>
    );
  }

  render() {
    const endpoints = SDKEndpointStore.getEndpoints(this.props.service.getId());

    if (!endpoints || endpoints.length === 0) {
      return (
        <AlertPanel>
          <AlertPanelHeader>No endpoints detected</AlertPanelHeader>
          <p className="flush-bottom">
            There a currently no endpoints found for your service.
          </p>
        </AlertPanel>
      );
    }

    return (
      <div className="container">
        <ConfigurationMap>
          {endpoints.map(endpoint => {
            if (!endpoint.isJSON()) return;

            return this.getEndpoint(endpoint);
          })}

          {this.getFileEndpoints(endpoints)}
        </ConfigurationMap>
      </div>
    );
  }
}

module.exports = SDKServiceConnectionContainer;
