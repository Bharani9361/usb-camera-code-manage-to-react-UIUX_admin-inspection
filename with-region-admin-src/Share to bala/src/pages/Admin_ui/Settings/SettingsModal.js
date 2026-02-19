import React, { useState, useContext } from "react";
import { Modal, Card, Tabs, Button, Input, Row, Col, Radio } from "antd";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import PropTypes from 'prop-types';
import { AppContext } from "../contexts/Context";
import toastr from "toastr";

// Validation schemas for each form
const applicationSettingsSchema = Yup.object().shape({
  inspectionType: Yup.string().required("Inspection type is required"),
  numRotation: Yup.number()
    .when("inspectionType", {
      is: "rotation-based",
      then: Yup.number()
        .required("Number of rotations is required")
        .min(1, "Number of rotations must be at least 1")
        .max(100, "Number of rotations must be at most 100")
    })
    .nullable(),
  timeDuration: Yup.number()
    .when("inspectionType", {
      is: "time-based",
      then: Yup.number()
      .required("Time duration is required")
      .min(1, "Time duration must be at least 1")
      .max(100, "Time duration must be at most 100"),
    })
    .nullable(),
  leadTime: Yup.number()
    .required("Lead time is required")
    .min(1, "Lead time must be at least 1")
    .max(100, "Lead time must be at most 100"),
});

const networkSettingsSchema = Yup.object().shape({
  ip_address: Yup.string()
    .matches(
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      "Invalid IP address format"
    )
    .required("IP address is required"),
  port: Yup.number()
    .typeError("Port must be a number")
    .required("Port is required"),
});

const profileSettingsSchema = Yup.object().shape({
  exposureTime: Yup.number()
    .min(10, "Exposure time must be at least 10")
    .max(10000, "Exposure time must be at most 10000")
    .required("Exposure time is required"),
  measuringRate: Yup.number()
    .min(1, "Measuring rate must be at least 1")
    .max(2000, "Measuring rate must be at most 2000")
    .required("Measuring rate is required"),
});

const SettingsModal = ({ open, onClose, }) => {   // initialValues, onSubmit 
  const { settings, setSettings, selectedSensor, masterAvailable, sensorConnected } = useContext(AppContext)
  // const [settings, setSettings] = useState(initialValues);

  const toastSuccess = (title, message = "") => {
    toastr.options.closeDuration = 8000
    toastr.options.positionClass = "toast-bottom-right"
    toastr.success(message, title)
  }

  // Update values locally
  const handleFormSubmit = (values, tabName) => {
    setSettings((prev) => ({
      ...prev,
      ...values,
    }));
    toastSuccess(`${tabName} Applied`)
    console.log(`${tabName} updated values:`, values, settings);
  };

  const handleClose = () => {
    onClose(); // Pass updated settings back to the parent
  };

  // Render input fields
  const renderInput = (label, name, placeholder, type = "text", is_disabled = false) => (
    <Row align="middle" gutter={16} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={8}>
        <label htmlFor={name}>{label}</label>
      </Col>
      <Col xs={24} sm={16}>
        <Field name={name}>
          {({ field, form }) => ( // Access form context for touched and errors
            <>
              <Input
                {...field}
                id={name}
                placeholder={placeholder}
                type={type}
                style={{ width: "100%" }}
                disabled={is_disabled} // Pass the disabled prop here!
                onKeyDown={(e) => {
                  if (e.key === '.' || e.key === ',') {
                    e.preventDefault();
                  }
                }}
              />
              {form.touched[name] && form.errors[name] && ( // Conditionally render error message
                <div style={{ color: "red", fontSize: "12px" }}>
                  {form.errors[name]}
                </div>
              )}
            </>
          )}
        </Field>
      </Col>
    </Row>
  );

  return (
    <Modal
      title="Settings"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={700}
      destroyOnClose
    >
      {/* Master Settings Card */}
      <Card
        // title="Master Settings"
        style={{ marginBottom: 20, backgroundColor: "#f0f2f5", border: !sensorConnected?.status ? "1px solid red" : "none"}}
      >
        {
          !sensorConnected?.status ?
          <p className="bg-transparent border-danger fw-bold">
              <h5 className="my-0 text-danger">
                <i className="mdi mdi-block-helper me-3"></i>
                {`Sensor connection required`}
              </h5>
            </p>
          : null
        }
        {
          masterAvailable ?
            <p className="bg-transparent border-danger fw-bold">
              <p className="my-0 text-danger">
                <i className="mdi mdi-block-helper me-3"></i>
                {`These values cannot be changed. because one or more measurements have been mastered. To modify them, you must first delete the mastering data for the relevant measurements.`}
              </p>
            </p>
            :
            <p className="bg-transparent border-warning fw-bold">
              <p className="my-0 text-warning">
                <i className="bx bx-error me-3" ></i>
                {`values can be changed only before mastering. if any one measurement's mastering is completed you can't able to change this values.`}
              </p>
            </p>
        }
        <h5>Master Settings</h5>
        <Tabs defaultActiveKey="1">
          {/* Application Settings Tab */}
          <Tabs.TabPane tab="Application Settings" key="1">
            <Formik
              initialValues={{
                inspectionType: settings.inspectionType,
                numRotation: settings.numRotation,
                timeDuration: settings.timeDuration,
                leadTime: settings.leadTime,
              }}
              validationSchema={applicationSettingsSchema}
              onSubmit={(values) => handleFormSubmit(values, "Application Settings")}
            >
              {({ setFieldValue, values }) => {
                const isDisabled = masterAvailable || !sensorConnected?.status;
                return (
                  <Form>
                    {/* Inspection Type - Radio Buttons */}
                    <Row align="middle" gutter={16} style={{ marginBottom: 16 }}>
                      <Col xs={24} sm={8}>
                        <label>Inspection Type</label>
                      </Col>
                      <Col xs={24} sm={16}>
                        <Field name="inspectionType">
                          {({ field }) => (
                            <Radio.Group
                              {...field}
                              onChange={(e) => setFieldValue("inspectionType", e.target.value)}
                            >
                              <Radio value="time-based" disabled={isDisabled}>Time Based</Radio>
                              <Radio value="rotation-based" disabled={isDisabled}>Rotation Based</Radio>
                            </Radio.Group>
                          )}
                        </Field>
                      </Col>
                    </Row>

                    {/* Number of Rotation / Time Duration */}
                    {values.inspectionType === "rotation-based" &&
                      renderInput("Number of Rotations", "numRotation", "Enter rotations", "number", isDisabled)}
                    {values.inspectionType === "time-based" &&
                      renderInput("Time Duration", "timeDuration", "Enter duration", "number", isDisabled)}

                    {/* Lead Time */}
                    {renderInput("Lead Time", "leadTime", "Enter lead time", "number", isDisabled)}

                    <Button type="primary" htmlType="submit" disabled={isDisabled}>
                      Apply
                    </Button>
                  </Form>
                )
              }}
            </Formik>
          </Tabs.TabPane>

          {/* Network Settings Tab */}
          {/* <Tabs.TabPane tab="Network Settings" key="2">
            <Formik
              initialValues={{
                ip_address: settings.ip_address,
                port: settings.port,
              }}
              validationSchema={networkSettingsSchema}
              onSubmit={(values) => handleFormSubmit(values, "Network Settings")}
            >
              {() => (
                <Form>
                  {renderInput("Sensor IP Address", "ip_address", "Enter IP address")}
                  {renderInput("Port", "port", "Enter port number", "number")}
                  <Button type="primary" htmlType="submit">
                    Apply
                  </Button>
                </Form>
              )}
            </Formik>
          </Tabs.TabPane> */}
        </Tabs>
      </Card>

      {
        selectedSensor?.brand_name == "Wenglor" ?
          <Card
            // title="Sensor Settings" 
            style={{ backgroundColor: "#e6f7ff" }}
          >
            {/* Sensor Settings Card */}
            <h5>Sensor Settings</h5>
            <Tabs defaultActiveKey="1">
              {/* Profile Settings Tab */}
              <Tabs.TabPane tab="Profile Settings" key="1">
                <Formik
                  initialValues={{
                    exposureTime: settings.exposureTime,
                    measuringRate: settings.measuringRate,
                  }}
                  validationSchema={profileSettingsSchema}
                  onSubmit={(values) => handleFormSubmit(values, "Profile Settings")}
                >
                  {() => (
                    <Form>
                      {renderInput("Exposure Time", "exposureTime", "Enter exposure time", "number")}
                      {renderInput("Measuring Rate", "measuringRate", "Enter measuring rate", "number")}
                      <Button type="primary" htmlType="submit">
                        Apply
                      </Button>
                    </Form>
                  )}
                </Formik>
              </Tabs.TabPane>

              {/* General Settings Tab */}
              <Tabs.TabPane tab="General Settings" key="2">
                <Row justify="space-between">
                  <Button type="primary">Reset Sensor Settings</Button>
                  <Button type="primary" danger>
                    Restart Sensor
                  </Button>
                </Row>
              </Tabs.TabPane>
            </Tabs>
          </Card>
        : null
      }
      
    </Modal>
  );
};

SettingsModal.propTypes = {
  open: PropTypes.any.isRequired,
  onClose: PropTypes.any.isRequired,
  // initialValues: PropTypes.any.isRequired,
  // onSubmit: PropTypes.any.isRequired,
}

export default SettingsModal;
