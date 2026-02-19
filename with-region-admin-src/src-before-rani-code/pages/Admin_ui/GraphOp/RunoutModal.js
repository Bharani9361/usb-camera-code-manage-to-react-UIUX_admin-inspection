import React from "react";
import { Modal, ModalHeader, ModalBody, Table, Button, Input, FormFeedback } from "reactstrap";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import PropTypes from "prop-types";
import "./RunoutModal.css"; // Import custom styles

const RunoutModal = ({ visible, toggle, data, selectedUnit, closeModel }) => {

    const convertFromMM = (value, type) => {
        switch (type) {
            case 'inches':
                return (value / 25.4).toFixed(4); // Convert mm to inches
            case 'cm':
                return (value / 10).toFixed(4); // Convert mm to cm
            case 'mm':
            default:
                return value.toFixed(4); // No conversion
        }
    };

    const convertToMM = (value, toUnit) => {
        if (toUnit === "mm") {
            switch (selectedUnit) {
                case "cm":
                    return value * 10; // 1 cm = 10 mm
                case "inches":
                    return value * 25.4; // 1 inch = 25.4 mm
                default:
                    return value; // Already in mm
            }
        }
        return value; // Add logic for other unit conversions if needed
    };
    const validationSchema = Yup.object().shape({
        regions: Yup.array().of(
            Yup.object().shape({
                min_tolerance: Yup.number()
                    .required("Min Tolerance is required")
                    .test("min-less-than-runout", "Min Tolerance must be less than runout", function (value) {
                        return value < this.parent.runout;
                    }),
                max_tolerance: Yup.number()
                    .required("Max Tolerance is required")
                    .test("max-greater-than-runout", "Max Tolerance must be greater than runout", function (value) {
                        return value > this.parent.runout;
                    }),
            })
        ),
    });

    const initialValues = {
        regions: data.map((region, index) => ({
            ...region,
            runout: region.is_points_taken ? convertFromMM(region.runout, selectedUnit) : region.runout, 
            min_deviation: region.is_points_taken ? convertFromMM(region.min_deviation, selectedUnit) : region.min_deviation, 
            max_deviation: region.is_points_taken ? convertFromMM(region.max_deviation, selectedUnit) : region.max_deviation, 
            min_tolerance: "",
            max_tolerance: "",
        })),
    };


    const handleSubmit = (values) => {
        console.log("Submitted Values:", values);
        
        // Convert tolerances to mm
        const convertedData = {
            regions: values.regions.map(region => ({
                ...region,
                min_tolerance: convertToMM(region.min_tolerance, "mm"),
                max_tolerance: convertToMM(region.max_tolerance, "mm"),
            }))
        };

        console.log('convertedData ', convertedData)

        toggle(convertedData);
    };

    const handleCancel = () => {
        closeModel();
    }

    return (
        <Modal isOpen={visible} toggle={closeModel} size="xl" keyboard={false} backdrop="static">
            <ModalHeader toggle={closeModel} className="custom-modal-header">
                Measurement Mastering Results
            </ModalHeader>
            <ModalBody className="custom-modal-body">
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values }) => (
                        <Form>
                            <Table bordered hover responsive className="custom-table scroll-design">
                                <thead className="table-header">
                                    <tr>
                                        <th rowSpan="2">S.No</th>
                                        <th rowSpan="2">Name</th>
                                        <th rowSpan="2" style={{ textTransform: 'none' }}>
                                            Max Deviation<br/>{`(${selectedUnit})`}
                                        </th>
                                        <th rowSpan="2" style={{ textTransform: 'none' }}>
                                            Min Deviation<br/>{`(${selectedUnit})`}
                                        </th>
                                        <th rowSpan="2" style={{ textTransform: 'none' }}>
                                            Runout<br/>{`(${selectedUnit})`}
                                        </th>
                                        <th colSpan="2" className="centered-header" style={{ textTransform: 'none' }}>
                                            Acceptable Runout Range for OK {`(${selectedUnit})`}
                                        </th>
                                    </tr>
                                    <tr>
                                        <th>Max</th>
                                        <th>Min</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {values.regions.map((region, index) => (
                                        <tr key={region.id}>
                                            <td>{index+1}</td>
                                            <td>{region.name}</td>
                                            {
                                                region.is_points_taken ?
                                                <>
                                                    <td>
                                                        {region.max_deviation}
                                                        {/* {convertFromMM(region.max_deviation, selectedUnit)} */}
                                                    </td>
                                                    <td>
                                                        {region.min_deviation}
                                                        {/* {convertFromMM(region.min_deviation, selectedUnit)} */}
                                                    </td>
                                                    <td>
                                                        {region.runout}
                                                        {/* {convertFromMM(region.runout, selectedUnit)} */}
                                                    </td>
                                                    <td>
                                                        <Field name={`regions[${index}].max_tolerance`}>
                                                            {({ field, meta }) => (
                                                                <div className="field-wrapper">
                                                                    <Input
                                                                        type="number"
                                                                        {...field}
                                                                        className={`custom-input ${meta.touched && meta.error ? "is-invalid" : ""
                                                                            }`}
                                                                    />
                                                                    <FormFeedback>{meta.error}</FormFeedback>
                                                                </div>
                                                            )}
                                                        </Field>
                                                    </td>
                                                    <td>
                                                        <Field name={`regions[${index}].min_tolerance`}>
                                                            {({ field, meta }) => (
                                                                <div className="field-wrapper">
                                                                    <Input
                                                                        type="number"
                                                                        {...field}
                                                                        className={`custom-input ${meta.touched && meta.error ? "is-invalid" : ""
                                                                            }`}
                                                                    />
                                                                    <FormFeedback>{meta.error}</FormFeedback>
                                                                </div>
                                                            )}
                                                        </Field>
                                                    </td>
                                                </>
                                                :
                                                <td colSpan={5} style={{ fontWeight: 'bold', color: 'red' }}>* Incomplete data: No Data Points Taken for this Region</td>
                                            }
                                            
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>

                            {
                                values.regions.some(item => !item.is_points_taken) ?
                                    <p className='my-1' style={{ fontWeight: 'bold', color: 'black' }}>
                                        {`* Ensure all regions have data points before accepting.`}
                                    </p>
                                    : null
                            }
                            <div className="d-flex justify-content-end mt-3">
                                {
                                    !values.regions.some(item => !item.is_points_taken) ?
                                        <Button color="success" type="submit" className="me-2 custom-button">
                                            Accept
                                        </Button>
                                        : null
                                }
                                <Button color="danger" onClick={closeModel} className="custom-button">
                                    Cancel
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </ModalBody>
        </Modal>
    );
};

RunoutModal.propTypes = {
    visible: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    data: PropTypes.array.isRequired,
    closeModel: PropTypes.func.isRequired,
    selectedUnit: PropTypes.any.isRequired,
}

export default RunoutModal;
