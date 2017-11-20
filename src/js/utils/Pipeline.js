import { isCallable } from "./ValidatorUtil";

export default class Pipeline {
  constructor(callables) {
    if (!callables.every(isCallable)) {
      throw new Error("All callables should implement a callable interface!");
    }

    this.callables = callables;
  }

  run(state, ...rest) {
    return this.callables.reduce(function(acc, callable) {
      return callable.call(callable, acc, ...rest);
    }, state);
  }
}
