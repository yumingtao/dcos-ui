import AbstractConnection from "./AbstractConnection";

export default class WebSocketConnection extends AbstractConnection {
  constructor(url, protocols) {
    super(url);
    this.protected.protocols = protocols;
    this.protected.messages = [];
  }
  open(token) {
    if (this.protected.native !== null) return false;

    this.protected.native = new WebSocket(
      this.protected.url,
      this.protected.protocols
    );
    this.emit("open");

    this.protected.native.addEventListener("close", () => {
      this.state = 2;
      this.emit("close");
    });
    this.protected.native.addEventListener("error", () => {
      this.state = 2;
      this.emit("error");
      this.emit("close");
    });
    this.protected.native.addEventListener("message", event => {
      this.state = 1;
      this.emit("message", event.data);
    });

    this.state = 1;
    this.protected.native.send("Authorization: Bearer " + token);
    this.protected.native.send(this.protected.data);

    return true;
  }
  close(code, reason) {
    return this.protected.native.close(code, reason);
  }

  // WebSocket methods
  message(message) {
    this.protected.messages.push(message);
    while (this.state === 1 && this.protected.messages.length) {
      this.protected.native.send(this.protected.messages.shift());
    }

    return this.protected.messages.length;
  }
}
