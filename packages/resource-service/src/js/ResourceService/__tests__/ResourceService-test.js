import ResourceService from "../ResourceService.js";

describe("ResourceService", () => {
  it("inits", () => {
    expect(() => {
      return new ResourceService();
    }).not.toThrowError();
  });

  it("loads", done => {
    ResourceService.load("http://example.com/").then(connection => {
      expect(connection.state).toEqual(3);
      done();
    });
  });
});
