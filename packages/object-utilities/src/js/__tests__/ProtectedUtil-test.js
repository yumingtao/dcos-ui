import { default as __protected } from "../ProtectedUtil.js";

describe("ProtectedUtil", () => {
  it("call without object fails", () => {
    expect(__protected()).toThrowError();
  });

  it("call with object creates protected property and returns that object", () => {
    const obj = {};
    expect(__protected(obj)).toEqual(obj.__protected__);
  });

  it("cant call 'init call' a second time", () => {
    const obj = {};
    __protected(obj, { foo: "bar" });
    expect(__protected(obj, { foo: "bar" })).toThrowError();
  });

  it("saved stuff is saved", () => {
    const o = {}, val = "bar";
    __protected(o).foo = val;
    expect(__protected(o).foo).toEqual(val);
  });
});
