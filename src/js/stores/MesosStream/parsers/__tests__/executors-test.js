import getExecutorsAction from "../executors";

describe("executors message parser", function() {
  describe("#getExecutorsAction", function() {
    it("parses the correct message", function() {
      const state = {};
      const message = {
        type: "GET_EXECUTORS",
        get_executors: {
          executors: [
            {
              agent_id: {
                value: "628984d0-4213-4140-bcb0-99d7ef46b1df-S0"
              },
              executor_info: {
                command: {
                  shell: true,
                  value: ""
                },
                executor_id: {
                  value: "default"
                },
                framework_id: {
                  value: "628984d0-4213-4140-bcb0-99d7ef46b1df-0000"
                }
              }
            }
          ]
        }
      };

      const result = getExecutorsAction(state, message);

      expect(result).toEqual({
        executors: [
          {
            agent_id: "628984d0-4213-4140-bcb0-99d7ef46b1df-S0",
            command: {
              shell: true,
              value: ""
            },
            executor_id: {
              value: "default"
            },
            id: "default",
            framework_id: "628984d0-4213-4140-bcb0-99d7ef46b1df-0000"
          }
        ]
      });
    });
  });
});
