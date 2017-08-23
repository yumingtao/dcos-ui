var ConnectionManager = require("../ConnectionManager").default;
// var ConnectionStore = require("../../ConnectionQueue/ConnectionQueue").default;

describe("ConnectionManager", () => {
  beforeEach(() => {
    ConnectionManager.connectionStore.includes = jest.fn(() => false);
    ConnectionManager.connectionStore.add = jest.fn(() => true);
    ConnectionManager.connectionStore.openCount = jest.fn(() => 0);
    ConnectionManager.connectionStore.waitingCount = jest.fn(() => 0);
    ConnectionManager.connectionStore.waitingHead = jest.fn(() => {});
    ConnectionManager.connectionStore.delete = jest.fn(() => {});
  });
  it("queue new connection", () => {
    var connection = { state: 0, on: jest.fn() }, priority = 2;

    ConnectionManager.queue(connection, priority);
    expect(ConnectionManager.connectionStore.add).toBeCalledWith(
      connection,
      priority
    );
  });
  it("queue open connection", () => {
    var connection = { state: 1 }, priority = 2;

    ConnectionManager.queue(connection, priority);
    expect(ConnectionManager.connectionStore.add).toBeCalledWith(
      connection,
      priority
    );
  });
  it("not queue known connection", () => {
    var connection = { state: 0, on: jest.fn() }, priority = 2;
    ConnectionManager.connectionStore.includes.mockReturnValueOnce(true);

    ConnectionManager.queue(connection, priority);
    expect(ConnectionManager.connectionStore.add).not.toBeCalled();
  });
  it("not queue closed connection", () => {
    var connection = { state: 2 }, priority = 2;

    ConnectionManager.queue(connection, priority);
    expect(ConnectionManager.connectionStore.add).not.toBeCalled();
  });
  it("open next waiting connection from store", () => {
    var connection = { open: jest.fn() };
    ConnectionManager.connectionStore.waitingCount.mockReturnValueOnce(1);
    ConnectionManager.connectionStore.waitingHead.mockReturnValueOnce(
      connection
    );

    ConnectionManager.handleQueueActivity();
    expect(connection.open).toBeCalled();
  });
  it("delete closed connection from store", () => {
    var connection = { state: 2 };

    ConnectionManager.handleConnectionClosingEvents(connection);
    expect(ConnectionManager.connectionStore.delete).toBeCalled();
  });
});
