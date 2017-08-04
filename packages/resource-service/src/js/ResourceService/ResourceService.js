import { XHRConnection, ConnectionManager } from "connection-manager";

export default class ResourceService {
  constructor() {
    console.log("init!");
  }
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
