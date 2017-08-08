import "../__mocks__/XMLHttpRequest-mock.js";
import XHRConnection from "../XHRConnection.js";

const token = "Token";
const url = "http://example.com/url.json";

describe("XHRConnection", () => {
  describe("defaults", () => {
    it("uses method=GET as default", function() {
      const req = new XHRConnection(url);
      req.open(token);
      expect(req.__protected__.native.open.mock.calls).toEqual([["GET", url]]);
    });

    it("uses data=null as default", function() {
      const req = new XHRConnection(url);
      req.open(token);
      expect(req.__protected__.native.send.mock.calls).toEqual([[null]]);
    });

    it("uses contentType=null as default (does not set header)", function() {
      const req = new XHRConnection(url);
      req.open(token);
      expect(
        req.__protected__.native.setRequestHeader.mock.calls
      ).not.toContainEqual(["Content-Type", null]);
    });
  });

  describe("initialisation", () => {
    it("fails to init without url", function() {
      expect(() => {
        return new XHRConnection();
      }).toThrowError();
    });

    it("init with url", function() {
      expect(() => {
        return new XHRConnection(url);
      }).not.toThrowError();
    });

    it("init with url and method", function() {
      expect(() => {
        return new XHRConnection(url, "POST");
      }).not.toThrowError();
    });

    it("init with url, method and data", function() {
      expect(() => {
        return new XHRConnection(
          url,
          "POST",
          JSON.stringify({ foo: "bar", baz: 0 })
        );
      }).not.toThrowError();
    });

    it("init with url, method, data and content-type", function() {
      expect(() => {
        return new XHRConnection(
          url,
          "POST",
          JSON.stringify({ foo: "bar", baz: 0 }),
          "text/json"
        );
      }).not.toThrowError();
    });
  });

  describe("open connection", () => {
    it("can open without token", function() {
      expect(() => {
        return new XHRConnection(url).open();
      }).not.toThrowError();
    });

    it("can open connection with token", function() {
      expect(() => {
        return new XHRConnection(url).open(token);
      }).not.toThrowError();
    });

    it("open correctly with given token", function() {
      const req = new XHRConnection(url);
      req.open(token);
      expect(
        req.__protected__.native.setRequestHeader.mock.calls
      ).toContainEqual(["Authorization", "Bearer " + token]);
    });

    it("opens connection with correct url", function() {
      const req = new XHRConnection(url, "GET");
      req.open(token);
      expect(req.__protected__.native.open.mock.calls).toEqual([["GET", url]]);
    });

    ["GET", "POST", "DELETE", "PUT"].forEach(method => {
      it(`opens connection with given method (${method})`, function() {
        const req = new XHRConnection(url, method);
        req.open(token);
        expect(req.__protected__.native.open.mock.calls).toEqual([
          [method, url]
        ]);
      });
    });
  });

  describe("state", () => {
    it("has correct state on init", () => {
      const req = new XHRConnection(url);

      expect(req.state).toEqual(0);
    });

    it("sets correct state on open", () => {
      const req = new XHRConnection(url);

      req.open(token);

      req.handleOpenEvent();

      expect(req.state).toEqual(1);
    });

    it("sets correct state on abort", () => {
      const req = new XHRConnection(url);

      req.open(token);
      req.handleAbortEvent();

      expect(req.state).toEqual(2);
    });

    it("sets correct state on error", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.open(token);
      req.addListener("error", cb);
      req.handleErrorEvent();

      expect(req.state).toEqual(2);
    });

    it("sets correct state on load", () => {
      const req = new XHRConnection(url);

      req.open(token);
      req.handleLoadEvent();

      expect(req.state).toEqual(2);
    });

    it("sets correct state on timeout", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.open(token);
      req.addListener("error", cb);
      req.handleTimeoutEvent();

      expect(req.state).toEqual(2);
    });
  });

  describe("events", () => {
    it("emits open event on open", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.on("open", cb);
      req.open(token);

      req.handleOpenEvent();

      expect(cb).toHaveBeenCalled();
    });

    it("emits abort event on abort", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.open(token);
      req.addListener("abort", cb);
      req.handleAbortEvent();

      expect(cb).toHaveBeenCalled();
    });

    it("emits close event on abort", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.open(token);
      req.addListener("close", cb);
      req.handleAbortEvent();

      expect(cb).toHaveBeenCalled();
    });

    it("emits error event on error", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.open(token);
      req.addListener("error", cb);
      req.handleErrorEvent();

      expect(cb).toHaveBeenCalled();
    });

    it("emits close event on error", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.open(token);
      req.addListener("close", cb);
      req.addListener("error", () => {});
      req.handleErrorEvent();

      expect(cb).toHaveBeenCalled();
    });

    it("emits error event on load (error)", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.open(token);
      req.addListener("error", cb);
      req.__protected__.native.status = 400;

      req.handleLoadEvent();

      expect(cb).toHaveBeenCalled();
    });

    it("emits success event on load (success)", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.open(token);
      req.addListener("success", cb);
      req.__protected__.native.status = 200;

      req.handleLoadEvent();

      expect(cb).toHaveBeenCalled();
    });

    it("emits close event on load (always)", () => {
      const req = new XHRConnection(url);
      const cb = jest.fn();

      req.open(token);
      req.addListener("close", cb);
      req.__protected__.native.status = 200;

      req.handleLoadEvent();

      expect(cb).toHaveBeenCalled();
    });
  });
});
