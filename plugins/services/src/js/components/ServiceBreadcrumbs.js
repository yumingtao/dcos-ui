import ReactDOM from "react-dom";
import React from "react";
import { Link } from "react-router";

import StringUtil from "#SRC/js/utils/StringUtil";
import DCOSStore from "#SRC/js/stores/DCOSStore";
import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbSupplementalContent
  from "#SRC/js/components/BreadcrumbSupplementalContent";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import PageHeaderBreadcrumbs from "#SRC/js/components/PageHeaderBreadcrumbs";
import Util from "#SRC/js/utils/Util";

import ServiceStatusProgressBar from "./ServiceStatusProgressBar";
import ServiceStatusWarningWithDebugInformation
  from "./ServiceStatusWarningWithDebugInstruction";
import ServiceTree from "../structs/ServiceTree";

// The breadcrumb's margin is hardcoded to avoid calling #getComputedStyle.
const BREADCRUMB_CONTENT_MARGIN = 7;
const METHODS_TO_BIND = ["checkBreadcrumbOverflow", "handleViewportResize"];

class ServiceBreadcrumbs extends React.Component {
  constructor() {
    super();

    this.breadcrumbStatusRef = null;
    this.primaryBreadcrumbTextRef = null;
    this.lastStatusWidth = 0;

    this.state = {
      shouldRenderServiceStatus: true
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });

    this.handleViewportResize = Util.debounce(this.handleViewportResize, 100);
  }

  componentDidMount() {
    this.checkBreadcrumbOverflow();
    global.addEventListener("resize", this.handleViewportResize);
  }

  componentDidUpdate() {
    this.checkBreadcrumbOverflow();
  }

  componentWillUnmount() {
    global.removeEventListener("resize", this.handleViewportResize);
  }

  handleViewportResize() {
    this.checkBreadcrumbOverflow();
  }

  /**
   * Check if the breadcrumbs are overflowing their container. If they are,
   * we hide the service's status bar.
   */
  checkBreadcrumbOverflow() {
    if (this.primaryBreadcrumbTextRef != null) {
      const availableWidth = this.getAvailableBreadcrumbWidth();
      const progressBarWidth = this.getBreadcrumbProgressBarWidth();

      if (availableWidth <= 0 && this.state.shouldRenderServiceStatus) {
        // Hide the status bar when the breadcrumbs are wider than the
        // container's width.
        this.setState({ shouldRenderServiceStatus: false });
      } else if (
        availableWidth > progressBarWidth &&
        !this.state.shouldRenderServiceStatus
      ) {
        // Show the status bar if its width is less than the amount of available
        // space.
        this.setState({ shouldRenderServiceStatus: true });
      }
    }
  }

  /**
   * Calculates the number of unused pixels after the last breadcrumb.
   *
   * @returns {Number} width in pixels
   */
  getAvailableBreadcrumbWidth() {
    const breadcrumbsNode = ReactDOM.findDOMNode(this);
    const breadcrumbsDimensions = breadcrumbsNode.getBoundingClientRect();
    const lastBreadcrumbNode = breadcrumbsNode.querySelector(
      ".breadcrumb:last-child"
    );
    const lastBreadcrumbDimensions = lastBreadcrumbNode.getBoundingClientRect();

    return (
      breadcrumbsDimensions.left +
      breadcrumbsDimensions.width -
      lastBreadcrumbDimensions.right
    );
  }

  /**
   * Calculates the width of the status indicator, plus its sibling's margin.
   *
   * @returns {Number} width in pixels
   */
  getBreadcrumbProgressBarWidth() {
    if (this.breadcrumbStatusRef != null) {
      this.lastStatusWidth =
        ReactDOM.findDOMNode(this.breadcrumbStatusRef).clientWidth +
        BREADCRUMB_CONTENT_MARGIN;
    }

    return this.lastStatusWidth;
  }

  getServiceStatus(service) {
    if (service == null || !this.state.shouldRenderServiceStatus) {
      return null;
    }

    let progressBar = null;
    const { tasksRunning } = service.getTasksSummary();
    const instancesTotal = service.getInstancesCount();
    const tooltipContent = `${tasksRunning} ${StringUtil.pluralize("instance", tasksRunning)} running out of ${instancesTotal}`;

    if (this.props.taskID == null) {
      progressBar = (
        <BreadcrumbSupplementalContent hasProgressBar={true}>
          <ServiceStatusProgressBar key="status-bar" service={service} />
        </BreadcrumbSupplementalContent>
      );
    }

    return (
      <BreadcrumbSupplementalContent
        ref={ref => (this.breadcrumbStatusRef = ref)}
      >
        <BreadcrumbSupplementalContent>
          <ServiceStatusWarningWithDebugInformation
            service={service}
            showTooltip={true}
            tooltipContent={tooltipContent}
          />
        </BreadcrumbSupplementalContent>
        {progressBar}
      </BreadcrumbSupplementalContent>
    );
  }

  getServiceImage(service, aggregateIDs) {
    if (service == null || service instanceof ServiceTree) {
      return null;
    }

    return (
      <BreadcrumbSupplementalContent>
        <Link to={"/services/detail/" + aggregateIDs}>
          <span className="icon icon-small icon-image-container icon-app-container">
            <img src={service.getImages()["icon-small"]} />
          </span>
        </Link>
      </BreadcrumbSupplementalContent>
    );
  }

  render() {
    const { serviceID, taskID, taskName, extra } = this.props;

    let crumbs = [
      <Breadcrumb key={-1} title="Services">
        <BreadcrumbTextContent>
          <Link to="/services">Services</Link>
        </BreadcrumbTextContent>
      </Breadcrumb>
    ];

    let aggregateIDs = "";
    const trimmedServiceID = decodeURIComponent(serviceID).replace(/^\//, "");
    const ids = trimmedServiceID.split("/");

    if (serviceID != null && trimmedServiceID.length > 0) {
      const serviceCrumbs = ids.map((id, index) => {
        let breadcrumbStatus = null;
        let serviceImage = null;

        aggregateIDs += encodeURIComponent(`/${id}`);
        let routePath = "/services/overview/" + aggregateIDs;
        if (index === ids.length - 1) {
          const service = DCOSStore.serviceTree.findItemById(serviceID);
          // Make sure to change to detail route if service is not a group
          if (!(service instanceof ServiceTree)) {
            routePath = "/services/detail/" + aggregateIDs;
          }
          breadcrumbStatus = this.getServiceStatus(service);
          serviceImage = this.getServiceImage(service, aggregateIDs);
        }

        return (
          <Breadcrumb key={index} title={ids.slice(0, index + 1).join("/")}>
            {serviceImage}
            <BreadcrumbTextContent
              ref={ref => (this.primaryBreadcrumbTextRef = ref)}
            >
              <Link to={routePath}>
                {id}
              </Link>
            </BreadcrumbTextContent>
            {breadcrumbStatus}
          </Breadcrumb>
        );
      });

      crumbs.push(...serviceCrumbs);
    }

    if (taskID != null && taskName != null) {
      const encodedTaskID = encodeURIComponent(taskID);
      crumbs.push(
        <Breadcrumb key={trimmedServiceID.length + 1} title={taskID}>
          <BreadcrumbTextContent>
            <Link
              to={`/services/detail/${aggregateIDs}/tasks/${encodedTaskID}`}
              index={taskID}
            >
              {taskName}
            </Link>
          </BreadcrumbTextContent>
        </Breadcrumb>
      );
    }

    if (Array.isArray(extra)) {
      crumbs = crumbs.concat(extra);
    }

    return (
      <PageHeaderBreadcrumbs
        iconID="services"
        iconRoute="/services"
        breadcrumbs={crumbs}
      />
    );
  }
}

ServiceBreadcrumbs.defaultProps = {
  serviceID: ""
};

ServiceBreadcrumbs.propTypes = {
  extra: React.PropTypes.arrayOf(React.PropTypes.node),
  serviceID: React.PropTypes.string,
  taskID: React.PropTypes.string,
  taskName: React.PropTypes.string
};

module.exports = ServiceBreadcrumbs;
