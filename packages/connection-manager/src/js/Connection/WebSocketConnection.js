import __protected from "object-utilities";
import AbstractConnection from "./AbstractConnection";

export default class WebSocketConnection extends AbstractConnection {
  constructor(url, protocols) {
    super(url);
    __protected(this).protocols = protocols;
    __protected(this).messages = [];
  }
  open(token) {
    if (__protected(this).native !== null) return false;

    __protected(this).native = new WebSocket(
      __protected(this).url,
      __protected(this).protocols
    );
    this.emit("open");

    __protected(this).native.addEventListener("close", () => {
      this.state = 2;
      this.emit("close");
    });
    __protected(this).native.addEventListener("error", () => {
      this.state = 2;
      this.emit("error");
      this.emit("close");
    });
    __protected(this).native.addEventListener("message", event => {
      this.state = 1;
      this.emit("message", event.data);
    });

    this.state = 1;
    __protected(this).native.send("Authorization: Bearer " + token);
    __protected(this).native.send(__protected(this).data);

    return true;
  }
  close(code, reason) {
    return __protected(this).native.close(code, reason);
  }

  // WebSocket methods
  message(message) {
    __protected(this).messages.push(message);
    while (this.state === 1 && __protected(this).messages.length) {
      __protected(this).native.send(__protected(this).messages.shift());
    }

    return __protected(this).messages.length;
  }
}
