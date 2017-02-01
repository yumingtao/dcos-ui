jest.unmock('../VipLabelsValidators');
const VipLabelsValidators = require('../VipLabelsValidators');

const message = 'VIP label should be in the following format: <ip-address|name>:<port>';

describe('VipLabelsValidators', function () {

  describe('#mustContainPort', function () {

    describe('with a Single container app', function () {
      it('returns no errors if portDefinitions is empty', function () {
        const spec = {portDefinitions: []};
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([]);
      });

      it('returns no errors if portMappings is empty', function () {
        const spec = {container: {docker: {portMappings: []}}};
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([]);
      });

      it('returns no errors if VIP label is correct', function () {
        const spec = {
          portDefinitions: [
            {labels: {VIP_0: 'endpoint-name:1000'}}
          ]
        };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([]);
      });

      it('returns no errors if VIP label is correct', function () {
        const spec = {
          container: {
            docker: {
              portMappings: [
                {labels: {VIP_0: '0.0.0.0:1000'}}
              ]
            }
          }
        };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([]);
      });

      it('returns an error if VIP label is incorrect', function () {
        const spec = {
          portDefinitions: [
            {labels: {VIP_0: 'endpoint-name'}}
          ]
        };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([
          {
            message,
            path: ['portDefinitions', 0, 'labels', 'VIP_0']
          }
        ]);
      });

      it('returns an error if VIP label is incorrect', function () {
        const spec = {
          container: {
            docker: {
              portMappings: [
                {labels: {VIP_0: '0.0.0.0:port'}}
              ]
            }
          }
        };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([
          {
            message,
            path: ['container', 'docker', 'portMappings', 0, 'labels', 'VIP_0']
          }
        ]);
      });

    });

    describe('with a Multi container app', function () {
      it('returns no errors if endpoints is empty', function () {
        const spec = {containers: [{endpoints: []}]};
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([]);
      });

      it('returns no errors if VIP label is correct', function () {
        const spec = {
          containers: [
            {
              endpoints: [{labels: {VIP_0: '0.0.0.0:9090'}}]
            }
          ]
        };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([]);
      });

      it('returns an error if VIP label is incorrect', function () {
        const spec = {
          containers: [
            {
              endpoints: [
                {labels: {VIP_0: ':9090'}}
              ]
            }
          ]
        };
        expect(VipLabelsValidators.mustContainPort(spec)).toEqual([
          {
            message,
            path: ['containers', 0, 'endpoints', 0, 'labels', 'VIP_0']
          }
        ]);
      });

    });

  });

});
