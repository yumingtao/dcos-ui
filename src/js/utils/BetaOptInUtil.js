import Util from "./Util";

const BETA_OPTIN_CONFIG_PATH = ["service"];
const BETA_OPTIN_SCHEMA_PATH = ["properties", "service", "properties"];
// SDK sets/reads this property within package config.
const BETA_OPTIN_PROPERTY_NAME = "beta-optin";
// Convert to dot notation for `Util.findNestedPropertyInObject`
const DOT_NOTATION_SCHEMA_PATH = BETA_OPTIN_SCHEMA_PATH.concat(
  BETA_OPTIN_PROPERTY_NAME
).join(".");

function getBetaProperty(configSchema) {
  if (!Util.isObject(configSchema)) {
    return false;
  }

  return Util.findNestedPropertyInObject(
    configSchema,
    DOT_NOTATION_SCHEMA_PATH
  );
}

const BetaOptInUtil = {
  /**
   * Finds beta-optin property within cosmos package config schema.
   *
   * @param  {Object} configSchema - cosmos package config schema
   * @return {Boolean} Returns true if configSchema contains beta-optin property
   */
  isBeta(configSchema) {
    return getBetaProperty(configSchema) != null;
  },

  /**
   * Get beta-optin property within config Object
   *
   * @param  {Object} configSchema - cosmos package config schema
   * @return {Object} Returns property if found or null.
   */
  getProperty(configSchema) {
    return getBetaProperty(configSchema);
  },

  /**
   * Removes beta-optin property within config schema
   *
   * @param  {Object} configSchema - cosmos package config schema
   * @return {Object} Returns new config Object without opt-in property
   */
  filterProperty(configSchema) {
    const filteredConfig = Util.deepCopy(configSchema);

    let keyIndex = 0;
    let pointer = filteredConfig;

    while (keyIndex < BETA_OPTIN_SCHEMA_PATH.length - 1) {
      pointer = pointer[BETA_OPTIN_SCHEMA_PATH[keyIndex++]];
    }
    if ("required" in pointer) {
      pointer.required = pointer.required.filter(
        key => key !== BETA_OPTIN_PROPERTY_NAME
      );
    }
    // Move into properties object
    pointer = pointer[BETA_OPTIN_SCHEMA_PATH[keyIndex]];

    delete pointer[BETA_OPTIN_PROPERTY_NAME];

    return filteredConfig;
  },

  /**
   * Inserts beta-optin property at path within config model
   *
   * @param  {Object} config - cosmos package config model
   * @return {Object} Returns new cosmos package config with beta
   * opt-in property set to true
   */
  acceptTerms(config) {
    if (!Util.isObject(config)) {
      return config;
    }

    const betaConfig = Util.deepCopy(config);

    let keyIndex = 0;
    let pointer = betaConfig;

    while (keyIndex < BETA_OPTIN_CONFIG_PATH.length) {
      const key = BETA_OPTIN_CONFIG_PATH[keyIndex++];

      if (!(key in pointer)) {
        pointer[key] = {};
      }
      pointer = pointer[key];
    }
    // Set accept to true
    pointer[BETA_OPTIN_PROPERTY_NAME] = true;

    return betaConfig;
  }
};

module.exports = BetaOptInUtil;
