require("../_support/utils/ServicesUtil");
const { Timeouts } = require("../_support/constants");

describe("GPU", function() {
  /**
   * Test the applications
   */
  describe("GPUs", function() {
    beforeEach(function() {
      cy.visitUrl(`services/overview/`);
    });

    afterEach(() => {
      cy.window().then(win => {
        win.location.href = "about:blank";
      });
    });

    it("should create an app with GPU support", function() {
      const serviceName = "gpu-service";

      cy
        .get(".page-body-content table", {
          timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT
        })
        .contains(serviceName, { timeout: Timeouts.SERVICE_DEPLOYMENT_TIMEOUT })
        .should("exist");
    });
  });
});
