/*
  It's important to always import a file written in the same case, that why we proxy it here.
  This way you can import "authStore" or "AuthStore.js" and will get the same Instance.
*/
import AuthStore from "./AuthStoreInstance.js";

export default (function() {
  return AuthStore;
})();
