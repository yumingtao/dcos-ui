const ConnectionQueue = require("../ConnectionQueue").default;

describe("ConnectionQueue", () => {
  it("initialize", () => {
    expect(() => {
      return new ConnectionQueue();
    }).not.toThrowError();
  });

  it("have length 0 after init", () => {
    const q = new ConnectionQueue();
    expect(q.length).toEqual(0);
  });

  it("adds connection with correct prio", () => {
    const q = new ConnectionQueue();
    const c = { foo: "bar" };
    expect(q.add(c, 2)).toEqual(true);
  });
  it("adds connection without prio (max prio)", () => {
    const q = new ConnectionQueue();
    const c = { foo: "bar" };
    expect(q.add(c)).toEqual(true);
  });
  it("does not add duplicate connection", () => {
    const q = new ConnectionQueue();
    const c = { foo: "bar" };
    q.add(c, 2);
    expect(q.add(c, 2)).toEqual(false);
  });

  it("calculate correct length after adding multiple items with same priority", () => {
    const q = new ConnectionQueue();
    q.add({ foo: "bar" }, 2);
    q.add({ foo: "bar" }, 2);
    q.add({ foo: "bar" }, 2);
    q.add({ foo: "bar" }, 2);
    expect(q.length).toEqual(4);
  });

  it("calculate correct length after adding 1 item with prio 0", () => {
    const q = new ConnectionQueue();
    q.add({ foo: "bar" }, 0);
    expect(q.length).toEqual(1);
  });

  it("calculate correct length after adding 1 item with max prio (implicit)", () => {
    const q = new ConnectionQueue();
    q.add({ foo: "bar" });
    expect(q.length).toEqual(1);
  });
  it("calculate correct length after adding 1 item with max prio (explicit)", () => {
    const q = new ConnectionQueue();
    q.add({ foo: "bar" }, 3);
    expect(q.length).toEqual(1);
  });

  it("have length 0 after last shift", () => {
    const q = new ConnectionQueue();
    q.add({ foo: "bar" }, 2);
    q.shift();
    expect(q.length).toEqual(0);
  });

  it("always shift item with lowest priority", () => {
    const q = new ConnectionQueue(), item = { foo: "baz" };
    q.add({ foo: "bar" }, 2);
    q.add({ foo: "bar" }, 3);
    q.add(item, 1);
    q.add({ foo: "bar" }, 2);
    expect(q.shift()).toEqual(item);
  });

  it("default priority = maxPriority", () => {
    const q = new ConnectionQueue();
    expect(q.add({ foo: "bar" })).toEqual(true);
    expect(q.__protected__.queue[q.__protected__.maxPriority].length).toEqual(
      1
    );
  });

  it("emits 'add' event on add", () => {
    const q = new ConnectionQueue();
    const cb = jest.fn();
    q.on("add", cb);
    q.add({ foo: "bar" });
    expect(cb).toBeCalled();
  });

  it("emits 'shift' event on shift", () => {
    const q = new ConnectionQueue();
    const cb = jest.fn();
    q.on("shift", cb);
    q.add({ foo: "bar" });
    q.shift({ foo: "bar" });
    expect(cb).toBeCalled();
  });

  it("finds queued connection", () => {
    const q = new ConnectionQueue();
    const c = { foo: "bar" };
    q.add(c);
    expect(q.includes(c)).toEqual(true);
  });

  it("does not find not queued connection", () => {
    const q = new ConnectionQueue();
    const c = { foo: "bar" };
    expect(q.includes(c)).toEqual(false);
  });
});
