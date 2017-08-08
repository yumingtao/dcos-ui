import { XHRConnection, ConnectionManager } from "connection-manager";

/**
 * this is only a proof-of-concept
 */
export default class ResourceService {
  static load(url, method = "GET", data = null, contentType = null) {
    return new Promise((resolve, reject) => {
      const connection = new XHRConnection(url, "GET", data, contentType);
      connection.on("success", resolve);
      connection.on("error", reject);
      ConnectionManager.queue(connection);
    });
  }
  static json(url, method = "GET", data = null, contentType = null) {
    return new Promise((resolve, reject) => {
      this.load(url, method, data, contentType)
        .then(connection => {
          resolve(JSON.parse(connection.response));
        })
        .catch(reject);
    });
  }
}
