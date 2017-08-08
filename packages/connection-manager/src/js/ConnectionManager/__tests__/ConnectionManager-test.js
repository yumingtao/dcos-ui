jest.dontMock("object-utilities");
jest.dontMock("../ConnectionManager");

const ConnectionManager = require("../ConnectionManager").default;
const ConnectionManager2 = require("../ConnectionManager").default;

describe("ConnectionManager", () => {
  it("is always the same instance", () => {
    expect(ConnectionManager).toEqual(ConnectionManager2);
  });

  it("queues connection", () => {
    const c = { state: 0, on: jest.fn() };

    ConnectionManager.__protected__.queue.add = jest.fn();

    ConnectionManager.queue(c, 3);

    expect(ConnectionManager.__protected__.queue.add).toBeCalledWith(c, 3);
  });

  it("does not queue duplicate connection", () => {
    const c = { state: 0, on: jest.fn() };

    ConnectionManager.__protected__.queue.includes = jest
      .fn()
      .mockReturnValue(true);

    expect(ConnectionManager.queue(c, 3)).toEqual(false);
  });

  it("does not queue open connection", () => {
    const c = { state: 1, on: jest.fn() };

    expect(ConnectionManager.queue(c, 3)).toEqual(false);
  });

  // it("shifts connection from queue and opens it", () => {
  //   const c = { on: jest.fn(), open: jest.fn() };
  //   ConnectionManager.queue(c);
  //   expect(c.open).toBeCalled();
  // });
});
