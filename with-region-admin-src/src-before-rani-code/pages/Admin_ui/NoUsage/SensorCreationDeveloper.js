import React, { useState } from "react";
import { Modal, Form, Input, Button, Select } from "antd";
import { Formik, Form as FormikForm, Field, FieldArray } from "formik";
import * as Yup from "yup";
import PropTypes from "prop-types";

const SensorCreationDeveloper = ({ visible, onClose, onCreate }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const validationSchema = Yup.object().shape({
        brandName: Yup.string().required("Brand name is required"),
        models: Yup.array()
            .of(
                Yup.object().shape({
                    modelName: Yup.string().required("Model name is required"),
                    type: Yup.string().required("Type is required"),
                    description: Yup.string().required("Description is required"),
                })
            )
            .min(1, "At least one model is required"),
    });

    return (
        <Modal
            title="Create Developer Sensor List"
            visible={visible}
            onCancel={onClose}
            footer={null}
        >
            <Formik
                initialValues={{
                    brandName: "",
                    models: [{ modelName: "", type: "", description: "" }],
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { resetForm }) => {
                    onCreate(values);
                    resetForm();
                    onClose();
                }}
            >
                {({ values, errors, touched, setFieldValue }) => (
                    <FormikForm>
                        <Form.Item
                            label="Brand Name"
                            validateStatus={touched.brandName && errors.brandName ? "error" : ""}
                            help={touched.brandName && errors.brandName}
                        >
                            <Field name="brandName" as={Input} />
                        </Form.Item>

                        <FieldArray name="models">
                            {({ push, remove }) => (
                                <>
                                    {values.models.map((_, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                border: "1px solid #ddd",
                                                padding: "10px",
                                                marginBottom: "10px",
                                                borderRadius: "4px",
                                            }}
                                        >
                                            <Form.Item
                                                label="Model Name"
                                                validateStatus={
                                                    touched.models?.[index]?.modelName &&
                                                    errors.models?.[index]?.modelName
                                                        ? "error"
                                                        : ""
                                                }
                                                help={
                                                    touched.models?.[index]?.modelName &&
                                                    errors.models?.[index]?.modelName
                                                }
                                            >
                                                <Field name={`models[${index}].modelName`} as={Input} />
                                            </Form.Item>

                                            <Form.Item
                                                label="Type"
                                                validateStatus={
                                                    touched.models?.[index]?.type &&
                                                    errors.models?.[index]?.type
                                                        ? "error"
                                                        : ""
                                                }
                                                help={
                                                    touched.models?.[index]?.type &&
                                                    errors.models?.[index]?.type
                                                }
                                            >
                                                <Field name={`models[${index}].type`} as={Input} />
                                            </Form.Item>

                                            <Form.Item
                                                label="Description"
                                                validateStatus={
                                                    touched.models?.[index]?.description &&
                                                    errors.models?.[index]?.description
                                                        ? "error"
                                                        : ""
                                                }
                                                help={
                                                    touched.models?.[index]?.description &&
                                                    errors.models?.[index]?.description
                                                }
                                            >
                                                <Field name={`models[${index}].description`} as={Input} />
                                            </Form.Item>

                                            <Button
                                                type="danger"
                                                onClick={() => remove(index)}
                                                style={{ marginTop: "10px" }}
                                            >
                                                Remove Model
                                            </Button>
                                        </div>
                                    ))}

                                    <Button
                                        type="dashed"
                                        onClick={() => push({ modelName: "", type: "", description: "" })}
                                        style={{ width: "100%", marginBottom: "10px" }}
                                    >
                                        Add Model
                                    </Button>
                                </>
                            )}
                        </FieldArray>

                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Create Sensor List
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

SensorCreationDeveloper.propTypes = {
  visible: PropTypes.array.isRequired, 
  onClose: PropTypes.array.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default SensorCreationDeveloper;