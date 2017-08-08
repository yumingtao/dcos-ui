import ResourceService from "../ResourceService.js";

describe("ResourceService", () => {
  it("inits", () => {
    expect(() => {
      return new ResourceService();
    }).not.toThrowError();
  });
});
