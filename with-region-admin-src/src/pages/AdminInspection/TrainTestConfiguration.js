import React, { useState, useEffect } from "react";
import {
    Button,
    Form,
    FormGroup,
    Label,
    Input,
    FormFeedback,
    Container,
    Row,
    Col,
    Card,
    CardBody,
    CardHeader,
} from "reactstrap";
import urlSocket from "./urlSocket";
import toastr from "toastr";

const TrainTestConfiguration = () => {
    const [formData, setFormData] = useState({
        minOkImages: "0",
        minNgImages: "0",
        testingMode: "Manual",
        autoTestSeconds: "",
        detectionType: "ML",
        testSamples: "",
        accuracyTime: "",
        cycleCount: "",
        okLabel: "",
        ngLabel: "",
        application_mode: "Multi",
    });

    const [errors, setErrors] = useState({});
    const [configData, setConfigData] = useState({})

    useEffect(() => {
        getConfigDetails();
    }, []);

    const getConfigDetails = async () => {
        try {
            const response = await urlSocket.post("/config");
            if (response.data.error === "Tenant not found") {
                error_handler(response.data);
            }
            else {
                const config = response.data[0];

                setFormData({
                    minOkImages: config.min_ok_for_training,
                    minNgImages: config.min_notok_for_training,
                    testingMode: config.inspection_type,
                    autoTestSeconds: config.countdown,
                    detectionType: config.detection_type,
                    testSamples: config.test_samples,
                    accuracyTime: config.train_acc_timer_per_sample,
                    cycleCount: config.train_cycle_count,
                    okLabel: config.positive,
                    ngLabel: config.negative,
                    application_mode: config.application_mode
                });
                setConfigData(config);
            }

        } catch (error) {
            console.error("Error fetching config", error);
        }
    };

    const toastSuccess = (title, message) => {
        // title = "Success"
        toastr.options.closeDuration = 8000
        toastr.options.positionClass = "toast-bottom-right"
        toastr.success(message, title)
    }

    const toastWarning = (message) => {
        let title = "Failed"
        toastr.options.closeDuration = 8000
        toastr.options.positionClass = "toast-bottom-right"
        toastr.warning(message, title)
    }

    const toastError = (title, message) => {
        // let title = "Failed"
        toastr.options.closeDuration = 8000
        toastr.options.positionClass = "toast-bottom-right"
        toastr.error(message, title)
    }

    const validateForm = () => {
        let newErrors = {};
        const textFields = ["okLabel", "ngLabel"];
        const numberFields = ["testSamples", "accuracyTime", "cycleCount"];

        textFields.forEach((field) => {
            if (!formData[field]?.trim()) {
                newErrors[field] = "Required";
            }
        });
        numberFields.forEach((field) => {
            console.log('formData.field', formData[field], Number(formData[field]), "__________")
            if (!formData[field] || Number(formData[field]) === 0) {
                newErrors[field] = "Must be greater than 0";
            }
        });

        if (formData.testingMode === "Auto" && (!formData.autoTestSeconds || Number(formData.autoTestSeconds) === 0)) {
            newErrors.autoTestSeconds = "Must be greater than 0";
        }

        return newErrors;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } else {
            //   alert("Form submitted successfully!");
            console.log("Form Data:", formData);
            setErrors({});
            await submitUpdatedValues();

        }
    };

    const error_handler = (error) => {
        sessionStorage.removeItem("authUser");
        history.push("/login");
    }

    const submitUpdatedValues = async () => {
        try {
            const updated_config = {
                min_ok_for_training: Number(formData.minOkImages),
                min_notok_for_training: Number(formData.minNgImages),
                inspection_type: formData.testingMode,
                countdown: Number(formData.autoTestSeconds),
                detection_type: formData.detectionType,
                test_samples: Number(formData.testSamples),
                train_acc_timer_per_sample: Number(formData.accuracyTime),
                train_cycle_count: Number(formData.cycleCount),
                positive: formData.okLabel,
                negative: formData.ngLabel,
                application_mode: formData.application_mode,
            }
            const payload = {
                _id: configData._id,
                updated_config: updated_config
            }
            console.log("payload", payload)
            const response = await urlSocket.post('/update_configuration', payload);
            if (response.data.error === "Tenant not found") {
                error_handler(response.data);
            }

            console.log('/update_configuration ', response.data);
            toastSuccess('Configurations Updated Successfully', '')
        } catch (error) {
            console.error(error)
            toastError('Error on updating configurations', '')
        }
    }

    const handleChange = (event) => {
        const { name, value, type } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "number" ? value.replace(/\D/, "") : value,
        }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleRadioChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const formFields = [
        {
            title: "Training Images",
            fields: [
                { label: "Minimum number of ok images for training", name: "minOkImages", type: "select", options: [...Array(20).keys()].map(num => num + 1) },
                { label: "Minimum number of not ok images for training", name: "minNgImages", type: "select", options: [...Array(20).keys()].map(num => num + 1) },
            ],
        },
        {
            title: "Testing Settings",
            fields: [
                {
                    label: "Testing Mode",
                    name: "testingMode",
                    type: "radio",
                    options: ["Manual", "Auto"],
                },
                {
                    label: "Auto Test Countdown (seconds)",
                    name: "autoTestSeconds",
                    type: "number",
                    condition: formData.testingMode === "Auto",
                },
                {
                    label: "Object Detection Type",
                    name: "detectionType",
                    type: "radio",
                    options: ["ML", "DL"],
                },
                { label: "No. of Test Samples", name: "testSamples", type: "number" },
                { label: "Time per Sample (seconds)", name: "accuracyTime", type: "number" },
            ],
        },
        {
            title: "Training Information",
            fields: [
                { label: "Training Cycle Count", name: "cycleCount", type: "number" },
            ],
        },
        {
            title: "Label Names",
            fields: [
                { label: "OK Label Name", name: "okLabel", type: "text" },
                { label: "Not Good Label Name", name: "ngLabel", type: "text" },
            ],
        },

        {
            title: "Application Mode",
            fields: [
                {
                    label: "Mode",
                    name: "application_mode",
                    type: "radio",
                    options: ["Single", "Multi"],
                }
            ],
        },

    ];

    return (

        <Form onSubmit={handleSubmit}>
            <Row className="row-cols-1 row-cols-lg-3 g-3">
                {formFields.map((section, index) => (
                    <Col key={index} md={4} lg={3}>
                        <Card className="shadow-sm border-0 rounded-lg h-100">
                            <CardHeader className="bg-light text-center">
                                <h5 className="fw-bold mb-0">{section.title}</h5>
                            </CardHeader>
                            <CardBody>
                                {section.fields.map(({ label, name, type, options, condition }) =>
                                    condition === false ? null : (
                                        <FormGroup key={name}>
                                            <Label className="fw-bold">{label}</Label>
                                            {
                                                type === "select" ?
                                                    (
                                                        <Input type="select" name={name} value={formData[name]} onChange={handleChange}>
                                                            {options.map((option) => (
                                                                <option key={option} value={option}>
                                                                    {option}
                                                                </option>
                                                            ))}
                                                        </Input>
                                                    )
                                                    :
                                                    type === "radio" ? (
                                                        <div className="d-flex gap-3">
                                                            {options.map((option) => (
                                                                <div className="form-check" key={option}>
                                                                    <Input
                                                                        className="form-check-input"
                                                                        type="radio"
                                                                        name={name}
                                                                        value={option}
                                                                        checked={formData[name] === option}
                                                                        onChange={handleRadioChange}
                                                                    />
                                                                    <Label className="form-check-label">{option}</Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )
                                                        : (
                                                            <>
                                                                <Input
                                                                    type={type}
                                                                    name={name}
                                                                    placeholder="Enter value"
                                                                    value={formData[name]}
                                                                    onChange={handleChange}
                                                                    invalid={!!errors[name]}
                                                                />
                                                                <FormFeedback>{errors[name]}</FormFeedback>
                                                            </>
                                                        )
                                            }
                                        </FormGroup>
                                    )
                                )}
                            </CardBody>
                        </Card>
                    </Col>
                ))}
            </Row>

            <div className="text-end mt-4">
                <Button size="sm" color="primary" type="submit" className="w-md">
                    Submit
                </Button>
            </div>
        </Form>

    );
};

export default TrainTestConfiguration;
