import React, { useState } from "react";
import { Modal, Form, Input, Select, Button } from "antd";
import { Formik, Form as FormikForm, Field } from "formik";
import * as Yup from "yup";
import PropTypes from "prop-types";

// Developer sensor list
const sensorList = [
    {
        brandName: "Wenglor",
        models: [
            { modelName: "MLSL123", type: "sensorA" },
            { modelName: "MLSL225", type: "sensorC" },
            { modelName: "MLSL122", type: "sensorD" },
            { modelName: "MLWL223", type: "sensorE" },
        ],
    },
    {
        brandName: "ScanControl",
        models: [
            { modelName: "2600-100", type: "sensorB" },
            { modelName: "2600-50", type: "sensorC" },
            { modelName: "3000-02", type: "sensorF" },
            { modelName: "2500-150", type: "sensorG" },
        ],
    },
];

const SensorCreationModal = ({ visible, onClose, onCreate }) => {
    const [selectedBrand, setSelectedBrand] = useState("");

    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Sensor name is required"),
        brand: Yup.string().required("Brand is required"),
        model: Yup.string().required("Model is required"),
        ip: Yup.string()
            .matches(
                /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/,
                "Invalid IP address"
            )
            .required("IP address is required"),
        port: Yup.number()
            .min(1, "Port number must be at least 1")
            .max(65535, "Port number must be less than 65536")
            .required("Port number is required"),
    });

    return (
        <Modal
            title="Create Sensor"
            visible={visible}
            onCancel={onClose}
            footer={null}
        >
            <Formik
                initialValues={{
                    name: "",
                    brand: "",
                    model: "",
                    ip: "",
                    port: "",
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { resetForm }) => {
                    onCreate(values); // Pass created sensor data to parent
                    resetForm();
                    onClose();
                }}
            >
                {({ values, errors, touched, setFieldValue }) => (
                    <FormikForm>
                        <Form.Item
                            label="Sensor Name"
                            validateStatus={touched.name && errors.name ? "error" : ""}
                            help={touched.name && errors.name}
                        >
                            <Field name="name" as={Input} />
                        </Form.Item>

                        <Form.Item
                            label="Brand"
                            validateStatus={touched.brand && errors.brand ? "error" : ""}
                            help={touched.brand && errors.brand}
                        >
                            <Select
                                value={values.brand}
                                onChange={(value) => {
                                    setSelectedBrand(value);
                                    setFieldValue("brand", value);
                                    setFieldValue("model", ""); // Reset model when brand changes
                                }}
                            >
                                {sensorList.map((brand) => (
                                    <Select.Option key={brand.brandName} value={brand.brandName}>
                                        {brand.brandName}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Model"
                            validateStatus={touched.model && errors.model ? "error" : ""}
                            help={touched.model && errors.model}
                        >
                            <Select
                                value={values.model}
                                onChange={(value) => setFieldValue("model", value)}
                                disabled={!selectedBrand}
                            >
                                {selectedBrand &&
                                    sensorList
                                        .find((brand) => brand.brandName === selectedBrand)
                                        ?.models.map((model) => (
                                            <Select.Option key={model.modelName} value={model.modelName}>
                                                {model.modelName}
                                            </Select.Option>
                                        ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="IP Address"
                            validateStatus={touched.ip && errors.ip ? "error" : ""}
                            help={touched.ip && errors.ip}
                        >
                            <Field name="ip" as={Input} />
                        </Form.Item>

                        <Form.Item
                            label="Port"
                            validateStatus={touched.port && errors.port ? "error" : ""}
                            help={touched.port && errors.port}
                        >
                            <Field name="port" as={Input} type="number" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Create Sensor
                            </Button>
                            <Button style={{ marginLeft: 8 }} onClick={onClose}>
                                Cancel
                            </Button>
                        </Form.Item>
                    </FormikForm>
                )}
            </Formik>
        </Modal>
    );
};

SensorCreationModal.propTypes = {
  visible: PropTypes.array.isRequired, 
  onClose: PropTypes.array.isRequired,
  onCreate: PropTypes.func.isRequired,
//   sensorList: PropTypes.any.isRequired,
};

export default SensorCreationModal;
