import PluginSDK from "PluginSDK";

import { SERVER_ACTION } from "#SRC/js/constants/ActionTypes";
import AppDispatcher from "#SRC/js/events/AppDispatcher";
import GetSetBaseStore from "#SRC/js/stores/GetSetBaseStore";

import {
  REQUEST_SDK_ENDPOINTS_SUCCESS,
  REQUEST_SDK_ENDPOINTS_ERROR,
  REQUEST_SDK_ENDPOINT_SUCCESS,
  REQUEST_SDK_ENDPOINT_ERROR
} from "../constants/ActionTypes";
import SDKEndpointActions from "../events/SDKEndpointActions";
import SDKServiceEndpoint from "../structs/SDKServiceEndpoint";

class SDKEndpointStore extends GetSetBaseStore {
  constructor() {
    super(...arguments);

    this.getSet_data = {
      endpoints: []
    };

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      unmountWhen() {
        return true;
      },
      listenAlways: true
    });

    this.dispatcherIndex = AppDispatcher.register(payload => {
      if (payload.source !== SERVER_ACTION) {
        return false;
      }

      const { type, data } = payload.action;
      switch (type) {
        case REQUEST_SDK_ENDPOINTS_SUCCESS:
          this.processNewEndpoints(data.serviceId, data.endpoints);
          break;
        case REQUEST_SDK_ENDPOINTS_ERROR:
          break;
        case REQUEST_SDK_ENDPOINT_SUCCESS:
          this.processNewEndpoint(
            data.serviceId,
            data.endpointName,
            data.endpointData,
            data.contentType
          );
          break;
        case REQUEST_SDK_ENDPOINT_ERROR:
          break;
      }

      return true;
    });
  }

  getEndpoints(serviceId) {
    if (!this.get("endpoints")) {
      return [];
    }

    return this.get("endpoints")
      .filter(function(endpoint) {
        return endpoint.serviceId === serviceId;
      })
      .map(endpoint => {
        return new SDKServiceEndpoint(endpoint);
      });
  }

  processNewEndpoints(serviceId, endpoints) {
    this.set({ endpoints: [] });
    endpoints.forEach(function(endpoint) {
      SDKEndpointActions.fetchEndpoint(serviceId, endpoint);
    }, this);
  }

  processNewEndpoint(serviceId, endpointName, endpointData, contentType) {
    const endpoints = this.get("endpoints").concat([
      { serviceId, endpointName, endpointData, contentType }
    ]);
    this.set({ endpoints });
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);
  }

  get storeID() {
    return "SDKEndpoint";
  }
}

module.exports = new SDKEndpointStore();
