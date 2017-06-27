import React, { Component } from "react";

import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";

import ComponentExample from "../../../../components/ComponentExample";

class CodeTab extends Component {
  render() {
    return (
      <ComponentExample>
        <div>
          <FormGroup>
            <FieldLabel>
              <FieldInput
                checked={false}
                disabled={false}
                name="check_box_first"
                type="checkbox"
              />
              Check Me First
            </FieldLabel>
          </FormGroup>
          <FormGroup>
            <FieldLabel>
              <FieldInput
                checked={false}
                disabled={false}
                name="check_box_second"
                type="checkbox"
              />
              Check Me Second
            </FieldLabel>
          </FormGroup>
        </div>
      </ComponentExample>
    );
  }
}

module.exports = CodeTab;
