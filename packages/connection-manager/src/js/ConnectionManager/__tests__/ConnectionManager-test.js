import ConnectionManager from "../ConnectionManager.js";

const AuthStore = {
  getTokenForURL: () => {
    return "token";
  }
};

describe("ConnectionManager", () => {
  it("fails on init without store and queue", () => {
    expect(() => {
      return new ConnectionManager();
    }).toThrowError();
  });

  it("inits with store", () => {
    expect(() => {
      return new ConnectionManager(AuthStore);
    }).not.toThrowError();
  });

  it("queues connection", () => {
    const cm = new ConnectionManager(AuthStore);
    const c = { state: 0, on: jest.fn() };

    cm._.queue.add = jest.fn();

    cm.queue(c, 3);

    expect(cm._.queue.add).toBeCalledWith(c, 3);
  });

  it("does not queue duplicate connection", () => {
    const cm = new ConnectionManager(AuthStore);
    const c = { state: 0, on: jest.fn() };
    
    cm._.queue.includes = jest.fn().mockReturnValue(true);

    expect(cm.queue(c, 3)).toEqual(false);
  });

  it("does not queue open connection", () => {
    const cm = new ConnectionManager(AuthStore);
    const c = { state: 1, on: jest.fn() };

    expect(cm.queue(c, 3)).toEqual(false);
  });

  it("shifts connection from queue and opens it", () => {
    const c = { on: jest.fn(), open: jest.fn() };
    const cm = new ConnectionManager(AuthStore);

    cm.queue(c);

    expect(c.open).toBeCalledWith(AuthStore.getTokenForURL());
  });
});
