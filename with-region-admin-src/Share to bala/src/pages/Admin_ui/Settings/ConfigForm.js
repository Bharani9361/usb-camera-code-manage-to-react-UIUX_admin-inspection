import React, { Component } from "react";
import { Card, CardHeader, CardBody, Label, Input, Button, Col } from "reactstrap";
import PropTypes from "prop-types";


// Reusable Form Row Component
const FormRow = ({ label, type, name, placeholder, value, onChange, error, disabled }) => (
  <div className="row my-3">
    <Col sm={6} md={6} lg={6} className="mt-2">
      <Label>{label}</Label>
    </Col>
    <Col sm={6} md={6} lg={6}>
      <Input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
      {error && <p style={{ color: "red" }}>*{error}</p>}
    </Col>
  </div>
);

FormRow.propTypes = {
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired,
    error: PropTypes.string,
    disabled: PropTypes.bool,
  };
  

class ConfigForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      temp_insp_type: "",
      temp_time_duration: "",
      temp_no_of_rotation: "",
      temp_lead_time: "",
      editMode: false,
      errors: {},
    };
  }

  // Centralized State Update
  configUpdate = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  // Toggle Edit Mode
  toggleEditMode = () => {
    this.setState((prevState) => ({ editMode: !prevState.editMode }));
  };

  // Apply Changes with Validation
  applyChanges = () => {
    const errors = {};

    if (!this.state.temp_time_duration || this.state.temp_time_duration <= 0) {
      errors.temp_time_duration = "Time duration must be greater than 0";
    }

    if (!this.state.temp_no_of_rotation || this.state.temp_no_of_rotation <= 0) {
      errors.temp_no_of_rotation = "No. of rotation must be greater than 0";
    }

    if (!this.state.temp_lead_time || this.state.temp_lead_time <= 0) {
      errors.temp_lead_time = "Lead time must be greater than 0";
    }

    if (Object.keys(errors).length > 0) {
      this.setState({ errors });
      return;
    }

    // Reset Errors and Save Changes
    this.setState({ errors: {} });
    console.log("Changes applied:", this.state);
    this.toggleEditMode();
  };

  // Reset to Default State
  resetChanges = () => {
    this.setState({
      temp_insp_type: "",
      temp_time_duration: "",
      temp_no_of_rotation: "",
      temp_lead_time: "",
      errors: {},
    });
  };

  render() {
    const { temp_insp_type, temp_time_duration, temp_no_of_rotation, temp_lead_time, editMode, errors } = this.state;
    const isDisabled = !editMode;

    return (
      <Card>
        <CardHeader className="bg-primary text-white">
          Inspection Configuration
        </CardHeader>
        <CardBody>
          {/* Inspection Type */}
          <FormRow
            label="Inspection Type"
            type="text"
            name="temp_insp_type"
            placeholder="Enter inspection type"
            value={temp_insp_type}
            onChange={this.configUpdate}
            disabled={isDisabled}
          />

          {/* Time Duration */}
          <FormRow
            label="Time Duration (seconds)"
            type="number"
            name="temp_time_duration"
            placeholder="Enter time duration"
            value={temp_time_duration}
            onChange={this.configUpdate}
            error={errors.temp_time_duration}
            disabled={isDisabled}
          />

          {/* Number of Rotations */}
          <FormRow
            label="No. of Rotation"
            type="number"
            name="temp_no_of_rotation"
            placeholder="Enter no. of rotation"
            value={temp_no_of_rotation}
            onChange={this.configUpdate}
            error={errors.temp_no_of_rotation}
            disabled={isDisabled}
          />

          {/* Lead Time */}
          <FormRow
            label="Lead Time (seconds)"
            type="number"
            name="temp_lead_time"
            placeholder="Enter lead time here"
            value={temp_lead_time}
            onChange={this.configUpdate}
            error={errors.temp_lead_time}
            disabled={isDisabled}
          />

          {/* Buttons */}
          <div className="d-flex justify-content-end mt-4">
            {editMode ? (
              <>
                <Button color="success" className="me-2" onClick={this.applyChanges}>
                  Apply
                </Button>
                <Button color="secondary" onClick={this.resetChanges}>
                  Reset
                </Button>
              </>
            ) : (
              <Button color="primary" onClick={this.toggleEditMode}>
                Edit
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    );
  }
}

export default ConfigForm;
