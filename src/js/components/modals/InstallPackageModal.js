import classNames from "classnames";
import mixin from "reactjs-mixin";
import React from "react";
import { StoreMixin } from "mesosphere-shared-reactjs";
import { routerShape } from "react-router";
import { Link } from "react-router";

import BetaOptInUtil from "../../utils/BetaOptInUtil";
import Breadcrumb from "../../components/Breadcrumb";
import BreadcrumbTextContent from "../../components/BreadcrumbTextContent";
import CosmosErrorHeader from "../CosmosErrorHeader";
import CosmosErrorMessage from "../CosmosErrorMessage";
import CosmosPackagesStore from "../../stores/CosmosPackagesStore";
import defaultServiceImage
  from "../../../../plugins/services/src/img/icon-service-default-large@2x.png";
import Icon from "../Icon";
import Image from "../Image";
import Page from "../Page";
import InternalStorageMixin from "../../mixins/InternalStorageMixin";
import Loader from "../Loader";
import ReviewConfig from "../ReviewConfig";
import SchemaForm from "../SchemaForm";
import SchemaUtil from "../../utils/SchemaUtil";
import StringUtil from "../../utils/StringUtil";
import TabsMixin from "../../mixins/TabsMixin";
import UniversePackage from "../../structs/UniversePackage";

const PREINSTALL_NOTES_CHAR_LIMIT = 140;

const METHODS_TO_BIND = [
  "getAdvancedSubmit",
  "handleAcceptBetaTerms",
  "handleChangeTab",
  "handleInstallPackage",
  "handleAdvancedFormChange",
  "handleModalClose",
  "handlePreinstallNotesToggle"
];

const PackageDetailBreadcrumbs = ({ cosmosPackage }) => {
  const name = cosmosPackage.getName();
  const version = cosmosPackage.getCurrentVersion();

  const crumbs = [
    <Breadcrumb key={0} title="Catalog">
      <BreadcrumbTextContent>
        <Link to="/catalog/packages">Catalog</Link>
      </BreadcrumbTextContent>
    </Breadcrumb>,
    <Breadcrumb key={1} title={name}>
      <BreadcrumbTextContent>
        <Link to={`/catalog/packages/${name}`} query={{ version }} key={0}>
          {name}
        </Link>
      </BreadcrumbTextContent>
    </Breadcrumb>,
    <Breadcrumb key={2} title={name}>
      <BreadcrumbTextContent>
        <Link to={`/catalog/packages/${name}/configure`} key={0}>
          configure
        </Link>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  return <Page.Header.Breadcrumbs iconID="packages" breadcrumbs={crumbs} />;
};

class InstallPackageModal
  extends mixin(InternalStorageMixin, TabsMixin, StoreMixin) {
  constructor() {
    super(...arguments);

    this.tabs_tabs = {
      betaTerms: "BetaTerms",
      defaultInstall: "DefaultInstall",
      advancedInstall: "AdvancedInstall",
      reviewAdvancedConfig: "ReviewAdvancedConfig",
      packageInstalled: "PackageInstalled"
    };

    this.internalStorage_set({
      descriptionError: null,
      hasFormErrors: false,
      installError: null,
      pendingRequest: false
    });

    this.state = {
      currentTab: "advancedInstall",
      schemaIncorrect: false,
      truncatedPreInstallNotes: true
    };

    this.store_listeners = [
      {
        name: "cosmosPackages",
        events: [
          "descriptionError",
          "descriptionSuccess",
          "installError",
          "installSuccess"
        ]
      }
    ];

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }
  componentDidMount() {
    super.componentDidMount(...arguments);

    const { packageName } = this.props.params;
    const { version } = this.props.location.query;
    // Fetch package description
    CosmosPackagesStore.fetchPackageDescription(packageName, version);
  }

  componentWillReceiveProps(nextProps) {
    super.componentWillReceiveProps(...arguments);
    const { props } = this;
    const { packageName } = this.props.params;
    const { version } = this.props.location.query;
    // Fetch package description
    console.log(
      CosmosPackagesStore.fetchPackageDescription(packageName, version)
    );
    const cosmosPackage = CosmosPackagesStore.getPackageDetails();
    console.log("props", version, packageName, cosmosPackage);
    const nextState = {
      cosmosPackage,
      isBetaPackage: BetaOptInUtil.isBeta(cosmosPackage.getConfig)
    };
    console.log(props, nextProps);

    // Return early if open prop did not change
    if (props.open === nextProps.open) {
      return;
    } else {
      this.setState({
        currentTab: "advancedInstall",
        cosmosPackage: nextState.cosmosPackage,
        isBetaPackage: nextState.isBetaPackage
      });
    }

    // If closing
    if (props.open && !nextProps.open) {
      this.internalStorage_set({
        descriptionError: null,
        installError: null,
        pendingRequest: false
      });
      // Reset our trigger submit for advanced install
      this.triggerAdvancedSubmit = undefined;
      this.setState({
        currentTab: "defaultInstall",
        truncatedPreInstallNotes: true,
        cosmosPackage,
        isBetaPackage: nextState.isBetaPackage
      });

      return;
    }

    // If opening

    if (nextProps.isBetaPackage) {
      this.setState({
        betaTermsAccepted: false,
        betaOptInProperties: BetaOptInUtil.getProperty(
          nextProps.cosmosPackage.getConfig()
        ),
        currentTab: "betaTerms",
        cosmosPackage,
        isBetaPackage: nextState.isBetaPackage
      });

      return;
    }

    if (nextProps.advancedConfig) {
      this.setState({
        currentTab: "advancedInstall",
        cosmosPackage,
        isBetaPackage: nextState.isBetaPackage
      });

      return;
    }

    this.setState(nextState);
    this.handleInstallPackage();
  }

  componentDidUpdate() {
    if (this.triggerAdvancedSubmit) {
      // Trigger submit upfront to validate fields and potentially disable buttons
      const { isValidated } = this.triggerAdvancedSubmit();
      this.internalStorage_update({ hasFormErrors: !isValidated });
    }
  }

  onCosmosPackagesStoreDescriptionError(descriptionError) {
    this.internalStorage_update({ descriptionError });
    this.forceUpdate();
  }

  onCosmosPackagesStoreDescriptionSuccess() {
    // const { cosmosPackage } = this.state;
    const cosmosPackage = CosmosPackagesStore.getPackageDetails();
    const schemaIncorrect = !SchemaUtil.validateSchema(
      cosmosPackage.getConfig()
    );

    this.internalStorage_update({
      hasError: schemaIncorrect
    });

    this.setState({ schemaIncorrect, cosmosPackage });
  }

  onCosmosPackagesStoreInstallError(installError) {
    this.internalStorage_update({
      installError,
      pendingRequest: false
    });
    this.setState({ currentTab: "defaultInstall" });
  }

  onCosmosPackagesStoreInstallSuccess(name, version, appId) {
    this.internalStorage_update({
      installError: null,
      pendingRequest: false,
      appId
    });
    this.setState({ currentTab: "packageInstalled" });
  }

  handleAcceptBetaTerms() {
    if (this.props.advancedConfig) {
      // Accept terms and move to advanced install tab
      this.setState({
        betaTermsAccepted: true,
        currentTab: "advancedInstall"
      });

      return;
    }
    // Auto-install
    this.setState({ betaTermsAccepted: true }, this.handleInstallPackage);
  }

  handleAdvancedFormChange(formObject) {
    this.internalStorage_update({ hasFormErrors: !formObject.isValidated });
    this.forceUpdate();
  }

  handleChangeTab(currentTab) {
    const newState = { installError: null };
    if (currentTab === "advancedInstall") {
      // Change back to previous state and clean up stored config
      newState.advancedConfiguration = null;
    }

    if (currentTab === "reviewAdvancedConfig") {
      const { isValidated, model } = this.triggerAdvancedSubmit();

      // Change state if form fields are validated and store configuration
      // for submission
      if (isValidated) {
        newState.advancedConfiguration = model;
      }
    }

    this.internalStorage_update(newState);
    this.tabs_handleTabClick(currentTab);
  }

  handleInstallPackage() {
    const { betaTermsAccepted, cosmosPackage } = this.state;
    const { isBetaPackage } = this.props;
    const name = cosmosPackage.getName();
    const version = cosmosPackage.getCurrentVersion();
    let configuration = this.getPackageConfiguration();

    if (isBetaPackage && betaTermsAccepted) {
      configuration = BetaOptInUtil.setBetaOptIn(configuration);
    }

    CosmosPackagesStore.installPackage(name, version, configuration);
    this.internalStorage_update({ pendingRequest: true });
    this.forceUpdate();
  }

  handleModalClose() {
    this.setState({ schemaIncorrect: false });
    this.props.onClose();
  }

  handlePreinstallNotesToggle() {
    const truncatedPreInstallNotes = !this.state.truncatedPreInstallNotes;
    this.setState({ truncatedPreInstallNotes });
  }

  getAdvancedSubmit(triggerSubmit) {
    this.triggerAdvancedSubmit = triggerSubmit;
  }

  getPackageConfiguration() {
    const { advancedConfiguration } = this.internalStorage_get();
    const { currentTab } = this.state;
    const { cosmosPackage } = this.state;

    const isAdvancedInstall =
      currentTab === "advancedInstall" || currentTab === "reviewAdvancedConfig";

    if (isAdvancedInstall && advancedConfiguration) {
      return advancedConfiguration;
    }

    if (isAdvancedInstall && !advancedConfiguration) {
      return SchemaUtil.definitionToJSONDocument(
        SchemaUtil.schemaToMultipleDefinition({
          schema: cosmosPackage.getConfig()
        })
      );
    }

    return {};
  }

  getLoadingScreen() {
    return (
      <div className="modal-content-loading-indicator vertical-center">
        <Loader />
      </div>
    );
  }
  getInstallErrorScreen() {
    const { pendingRequest, installError } = this.internalStorage_get();

    return (
      <div>
        <div className="modal-body">
          <CosmosErrorHeader>
            An Error Occurred
          </CosmosErrorHeader>
          <CosmosErrorMessage error={installError} flushBottom={true} />
        </div>
        <div className="modal-footer">
          <div className="button-collection button-collection-stacked">
            <button
              disabled={pendingRequest}
              className="button button-block"
              onClick={this.handleChangeTab.bind(this, "advancedInstall")}
            >
              Edit Configuration
            </button>
          </div>
        </div>
      </div>
    );
  }

  getPreInstallNotes(notes, truncated) {
    if (!notes) {
      return null;
    }

    if (truncated) {
      notes = notes.slice(0, PREINSTALL_NOTES_CHAR_LIMIT);
    }

    return (
      <p className="small text-align-left flush-bottom">
        {notes}{this.getPreInstallNotesToggle(truncated, notes)}
      </p>
    );
  }

  getPreInstallNotesToggle(truncated, notes) {
    if (notes.length < PREINSTALL_NOTES_CHAR_LIMIT) {
      return null;
    }

    let ellipses = "";
    let textTruncationToggleWord = "collapse";

    if (truncated) {
      ellipses = "...";
      textTruncationToggleWord = "expand";
    }

    const text = (
      <span className="clickable" onClick={this.handlePreinstallNotesToggle}>
        <u>{textTruncationToggleWord}</u>
      </span>
    );

    return (
      <span>
        {ellipses} {text}
      </span>
    );
  }

  renderBetaTermsTabView() {
    const { title, description } = this.state.betaOptInProperties;

    return (
      <div>
        <div className="modal-body">
          <div className="horizontal-center">
            <h2 className="flush-top">
              {title}
            </h2>
            <p className="text-align-center">
              {description}
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <div className="button-collection button-collection-align-horizontal-center flush-bottom">
            <button className="button" onClick={this.props.onClose}>
              Cancel
            </button>
            <button
              className="button button-success"
              onClick={this.handleAcceptBetaTerms}
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    );
  }

  renderDefaultInstallTabView() {
    const {
      descriptionError,
      pendingRequest,
      installError
    } = this.internalStorage_get();
    const { cosmosPackage } = this.state;
    const preInstallNotes = cosmosPackage.getPreInstallNotes();
    const name = cosmosPackage.getName();
    const version = cosmosPackage.getCurrentVersion();
    const truncated = this.state.truncatedPreInstallNotes;
    const packageVersionClasses = classNames({
      "flush-bottom": !preInstallNotes
    });

    if (installError) {
      return this.getInstallErrorScreen();
    }

    if (pendingRequest) {
      return this.getLoadingScreen();
    }

    let error;
    if (descriptionError) {
      error = (
        <p className="text-danger small text-align-center">
          {descriptionError}
        </p>
      );
    }

    return (
      <div>
        <div className="modal-body">
          <div className="text-align-center">
            <div className="icon icon-jumbo icon-image-container icon-app-container icon-app-container--borderless">
              <Image
                fallbackSrc={defaultServiceImage}
                src={cosmosPackage.getIcons()["icon-large"]}
              />
            </div>
            <p className="h2 short-top short-bottom">{name}</p>
            <p className={packageVersionClasses}>{version}</p>
            {this.getPreInstallNotes(preInstallNotes, truncated)}
            {error}
          </div>
        </div>
        <div className="modal-footer">
          <div className="button-collection button-collection-stacked horizontal-center">
            <button
              className="button button-success button-block"
              onClick={this.props.onClose}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }

  renderAdvancedInstallTabView() {
    const { pendingRequest, hasFormErrors } = this.internalStorage_get();
    // Only return footer, we always render SchemaForm, but just change
    // the hidden class in render

    return (
      <div className="modal-footer">
        <div className="button-collection flush-bottom">
          <button className="button" onClick={this.context.router.goBack}>
            Cancel
          </button>
          <button
            disabled={pendingRequest || hasFormErrors}
            className="button button-success"
            onClick={this.handleChangeTab.bind(this, "reviewAdvancedConfig")}
          >
            Review and Deploy
          </button>
        </div>
      </div>
    );
  }

  renderReviewAdvancedConfigTabView() {
    const { pendingRequest } = this.internalStorage_get();
    const { cosmosPackage } = this.state;
    const name = cosmosPackage.getName();
    const version = cosmosPackage.getCurrentVersion();
    let buttonText = "Deploy";

    if (pendingRequest) {
      buttonText = "Deploying...";
    }

    return (
      <div className="modal--install-package__review__wrapper">
        <ReviewConfig
          packageIcon={cosmosPackage.getIcons()["icon-small"]}
          packageName={name}
          packageVersion={version}
          configuration={this.getPackageConfiguration()}
        />
        <div className="modal-footer">
          <div className="button-collection flush-bottom">
            <button
              className="button"
              onClick={this.handleChangeTab.bind(this, "advancedInstall")}
            >
              Back
            </button>
            <button
              disabled={pendingRequest}
              className="button button-success"
              onClick={this.handleInstallPackage}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    );
  }

  renderPackageInstalledTabView() {
    const { appId } = this.internalStorage_get();
    const { cosmosPackage } = this.state;

    const notes = cosmosPackage.getPostInstallNotes();

    const parsedNotes = StringUtil.parseMarkdown(notes);

    return (
      <div>
        <div className="modal-body">
          <div className="horizontal-center">
            <span className="text-success">
              <Icon id="circle-check" size="large" color="green" />
            </span>
            <h2 className="short-top short-bottom">Success!</h2>
            <div
              className="install-package-modal-package-notes text-overflow-break-word"
              dangerouslySetInnerHTML={parsedNotes}
            />
          </div>
        </div>
        <div className="modal-footer">
          <div className="button-collection button-collection-stacked horizontal-center">
            <a
              className="button button-success button-block"
              href={`#/services/detail/${encodeURIComponent(appId)}`}
            >
              Go To Service
            </a>
          </div>
        </div>
      </div>
    );
  }

  getIncorrectSchemaWarning(cosmosPackage) {
    let errorText =
      "The schema for this package is not properly configured. " +
      "If you are the package owner, please check your configuration.";

    const maintainer = cosmosPackage.getMaintainer();
    if (maintainer) {
      errorText = (
        <span>
          {`${errorText} Or you may contact the maintainer: `}
          <a href={`mailto:${maintainer}`}>{maintainer}</a>
        </span>
      );
    }

    return (
      <div>
        <div className="modal-body">
          <div className="horizontal-center">
            <h3>Invalid Configuration</h3>
            <p className="text-danger text-align-center">
              {errorText}
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <div className="button-collection button-collection-stacked horizontal-center">
            <button
              className="button button-wide button-block"
              onClick={this.handleModalClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  getModalContents() {
    const { currentTab, schemaIncorrect, cosmosPackage } = this.state;
    const { isBetaPackage } = this.props;

    console.log(this.props, this.state, "CONTENSTS");
    console.log("RENDER", schemaIncorrect, cosmosPackage);
    if (cosmosPackage == null) {
      return null;
    }

    if (schemaIncorrect) {
      return this.getIncorrectSchemaWarning(cosmosPackage);
    }

    let schema = cosmosPackage.getConfig();

    if (isBetaPackage) {
      // Remove beta opt-in from schema for better UX
      schema = BetaOptInUtil.filterProperty(cosmosPackage.getConfig());
    }

    const name = cosmosPackage.getName();
    const version = cosmosPackage.getCurrentVersion();
    const advancedConfigClasses = classNames(
      "modal-install-package-body-and-header",
      {
        hidden: currentTab !== "advancedInstall"
      }
    );

    return (
      <Page>
        <Page.Header
          breadcrumbs={
            <PackageDetailBreadcrumbs cosmosPackage={cosmosPackage} />
          }
        />
        <div className="modal-install-package-tab-form-wrapper">
          <div className={advancedConfigClasses}>
            <SchemaForm
              packageIcon={cosmosPackage.getIcons()["icon-small"]}
              packageName={name}
              packageVersion={version}
              schema={schema}
              onChange={this.handleAdvancedFormChange}
              getTriggerSubmit={this.getAdvancedSubmit}
            />
          </div>
          {this.tabs_getTabView()}
        </div>
      </Page>
    );
  }

  render() {
    console.log(this.props, this.state);
    const { props, state } = this;
    const { currentTab } = state;

    const isAdvanced =
      currentTab === "advancedInstall" || currentTab === "reviewAdvancedConfig";

    return this.getModalContents();
  }
}

InstallPackageModal.defaultProps = {
  advancedConfig: true,
  isBetaPackage: false,
  onClose() {},
  open: true
};

InstallPackageModal.propTypes = {
  advancedConfig: React.PropTypes.bool,
  open: React.PropTypes.bool,
  onClose: React.PropTypes.func
};

InstallPackageModal.contextTypes = {
  router: routerShape
};

module.exports = InstallPackageModal;
