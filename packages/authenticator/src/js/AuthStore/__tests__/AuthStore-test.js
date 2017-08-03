import AuthStore1 from "../authStore";
import AuthStore2 from "../AuthStore.js";

describe("AuthStore", () => {
  beforeEach(() => {
    AuthStore1._.tokens = [];
  });

  afterEach(() => {
    AuthStore1._.tokens = [];
  });

  it("both are same instance", () => {
    expect(AuthStore1).toEqual(AuthStore2);
  });

  it("token set in one is same in other", () => {
    AuthStore1.setTokenForDomain("foo.com", "Test");
    expect(
      AuthStore1.getTokenForURL("foo.com") ===
        AuthStore2.getTokenForURL("foo.com")
    ).toEqual(true);
  });

  it("get empty token for unknown url", () => {
    expect(AuthStore1.getTokenForURL("unknown.com")).toEqual("");
  });
});
