import React, { useEffect, useState } from 'react';
import { Modal, ModalHeader, ModalBody, Table, Button, Input, FormFeedback } from "reactstrap";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import PropTypes from "prop-types";
import "./RunoutModal.css"; // Import custom styles


const masteredData = [
    {
        "color": "rgba(236, 188, 65, 0.5)",
        "id": "f3c01edc-e67a-4732-8752-636f3eb4724a",
        "measurement_type": [
            "runout"
        ],
        "name": "region_1",
        "runout": {
            "is_points_taken": true,
            "max_deviation": 222.755,
            "min_deviation": 219.955,
            "result": 2.8
        },
        "x": [
            -46.94189602446483,
            -43.27217125382263
        ],
        "y": [
            52.90012406947891,
            282.18052109181144
        ]
    },
    {
        "color": "rgba(117, 39, 59, 0.5)",
        "diameter": {
            "is_points_taken": true,
            "max_deviation": 219.905,
            "min_deviation": 219.875,
            "result": 0.03
        },
        "id": "68af4d8c-dae2-495f-9c7e-2d7e7b60460e",
        "measurement_type": [
            "runout",
            "diameter"
        ],
        "name": "region_2",
        "runout": {
            "is_points_taken": true,
            "max_deviation": 219.905,
            "min_deviation": 219.875,
            "result": 0.03
        },
        "x": [
            16.36085626911315,
            21.559633027522935
        ],
        "y": [
            32.04759414225941,
            271.16893305439334
        ]
    },
    {
        "color": "rgba(205, 155, 162, 0.5)",
        "diameter": {
            "is_points_taken": true,
            "max_deviation": 219.905,
            "min_deviation": 219.875,
            "result": 0.03
        },
        "id": "8018cd45-1db9-4255-ae0d-50011d47e359",
        "measurement_type": [
            "diameter",
            "runout"
        ],
        "name": "region_3",
        "runout": {
            "is_points_taken": true,
            "max_deviation": 219.905,
            "min_deviation": 219.875,
            "result": 0.03
        },
        "x": [
            60.091743119266056,
            63.76146788990825
        ],
        "y": [
            44.59989539748954,
            284.97646443514645
        ]
    },
    {
        "color": "rgba(60, 178, 70, 0.5)",
        "diameter": {
            "is_points_taken": true,
            "max_deviation": 216.91,
            "min_deviation": 216.04,
            "result": 0.87
        },
        "fillcolor": "rgba(255, 0, 0, 0.3)",
        "id": "fd3e86ef-e6af-40b3-bb46-3e09db376b25",
        "line": {
            "color": "rgba(255, 0, 0, 1)"
        },
        "measurement_type": [
            "runout",
            "diameter"
        ],
        "name": "region_4",
        "runout": {
            "is_points_taken": true,
            "max_deviation": 216.91,
            "min_deviation": 216.04,
            "result": 0.87
        },
        "x": [
            -24.00611620795107,
            -20.33639143730887
        ],
        "y": [
            28.90794979079498,
            288.7405857740586
        ]
    },
    {
        "color": "rgba(155, 0, 229, 0.5)",
        "diameter": {
            "is_points_taken": true,
            "max_deviation": 218.74,
            "min_deviation": 218.705,
            "result": 0.035
        },
        "fillcolor": "rgba(255, 0, 0, 0.3)",
        "id": "224229e7-a8a2-4d7d-9a31-6f1137e219e1",
        "line": {
            "color": "rgba(255, 0, 0, 1)"
        },
        "measurement_type": [
            "diameter"
        ],
        "name": "region_5",
        "x": [
            -91.28440366972477,
            -87.61467889908256
        ],
        "y": [
            45.853556485355654,
            279.326359832636
        ]
    }
]


const MasteringResults = ({ visible, toggle, data, selectedUnit, closeModel }) => {

    const [masterData, setMasterData] = useState([]);
    const [runoutRegions, setRunoutRegions] = useState([]);
    const [diameterRegions, setDiameterRegions] = useState([])

    useEffect(() => {
        if(data) {
            const runoutR = data.filter((region, rid) => {
                if(region.measurement_type.includes("runout")) {
                    return region
                }
            });
            setRunoutRegions(runoutR);
            const diameterR = data.filter((region, rid) => {
                if(region.measurement_type.includes("diameter")) {
                    return region
                }
            });
            setDiameterRegions(diameterR);
            console.log('runoutR, diameterR', runoutR, diameterR)
        }
    }, [data])

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
    const runoutSchema = Yup.object().shape({
        regions: Yup.array().of(
            Yup.object().shape({
                runout: Yup.object().shape({
                    min_tolerance: Yup.number()
                        .required("Min Tolerance is required")
                        .test("min-less-than-runout", "Min Tolerance must be less than runout", function (value) {
                            return value < this.parent.result;
                        }),
                    max_tolerance: Yup.number()
                        .required("Max Tolerance is required")
                        .test("max-greater-than-runout", "Max Tolerance must be greater than runout", function (value) {
                            return value > this.parent.result;
                        }),
                })
                
            })
        ),
    });

    const initialrunoutValues = {
        regions: runoutRegions.map((region) => ({
            ...region,
            runout: {
                ...region.runout,
                result: region.runout.is_points_taken
                    ? convertFromMM(region.runout.result, selectedUnit)
                    : region.runout.result,
                min_deviation: region.runout.is_points_taken
                    ? convertFromMM(region.runout.min_deviation, selectedUnit)
                    : region.runout.min_deviation,
                max_deviation: region.runout.is_points_taken
                    ? convertFromMM(region.runout.max_deviation, selectedUnit)
                    : region.runout.max_deviation,
                min_tolerance: "",
                max_tolerance: "",
            },
        })),
    };

    const diameterSchema = Yup.object().shape({
        regions: Yup.array().of(
            Yup.object().shape({
                diameter: Yup.object().shape({
                    min_tolerance: Yup.number()
                        .required("Min Tolerance is required")
                        .test("min-less-than-diameter", "Min Tolerance must be less than diameter", function (value) {
                            return value < this.parent.result;
                        }),
                    max_tolerance: Yup.number()
                        .required("Max Tolerance is required")
                        .test("max-greater-than-diameter", "Max Tolerance must be greater than diameter", function (value) {
                            return value > this.parent.result;
                        }),
                })
                
            })
        ),
    });

    const initialdiameterValues = {
        regions: diameterRegions.map((region) => ({
            ...region,
            diameter: {
                ...region.diameter,
                result: region.diameter.is_points_taken
                    ? convertFromMM(region.diameter.result, selectedUnit)
                    : region.diameter.result,
                min_deviation: region.diameter.is_points_taken
                    ? convertFromMM(region.diameter.min_deviation, selectedUnit)
                    : region.diameter.min_deviation,
                max_deviation: region.diameter.is_points_taken
                    ? convertFromMM(region.diameter.max_deviation, selectedUnit)
                    : region.diameter.max_deviation,
                min_tolerance: "",
                max_tolerance: "",
            },
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
                {
                    runoutRegions.length > 0 ?
                    <>
                    <h5>Runout Values</h5>
                    <Formik
                        initialValues={initialrunoutValues}
                        validationSchema={runoutSchema}
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
                                                Max Deviation<br />{`(${selectedUnit})`}
                                            </th>
                                            <th rowSpan="2" style={{ textTransform: 'none' }}>
                                                Min Deviation<br />{`(${selectedUnit})`}
                                            </th>
                                            <th rowSpan="2" style={{ textTransform: 'none' }}>
                                                Runout<br />{`(${selectedUnit})`}
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
                                                <td>{index + 1}</td>
                                                <td>{region.name}</td>
                                                {
                                                    region.runout.is_points_taken ?
                                                        <>
                                                            <td>
                                                                {region.runout.max_deviation}
                                                                {/* {convertFromMM(region.max_deviation, selectedUnit)} */}
                                                            </td>
                                                            <td>
                                                                {region.runout.min_deviation}
                                                                {/* {convertFromMM(region.min_deviation, selectedUnit)} */}
                                                            </td>
                                                            <td>
                                                                {region.runout.result}
                                                                {/* {convertFromMM(region.runout, selectedUnit)} */}
                                                            </td>
                                                            <td>
                                                                <Field name={`regions[${index}].runout.max_tolerance`}>
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
                                                                <Field name={`regions[${index}].runout.min_tolerance`}>
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
                                    values.regions.some(item => !item.runout.is_points_taken) ?
                                        <p className='my-1' style={{ fontWeight: 'bold', color: 'black' }}>
                                            {`* Ensure all regions have data points before accepting.`}
                                        </p>
                                        : null
                                }
                                <div className="d-flex justify-content-end mt-3">
                                    {
                                        !values.regions.some(item => !item.runout.is_points_taken) ?
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
                    </>
                    : null
                }
                {
                    diameterRegions.length > 0 ?
                    <>
                    <h5>Diameter Values</h5>
                    <Formik
                        initialValues={initialdiameterValues}
                        validationSchema={diameterSchema}
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
                                                Max Deviation<br />{`(${selectedUnit})`}
                                            </th>
                                            <th rowSpan="2" style={{ textTransform: 'none' }}>
                                                Min Deviation<br />{`(${selectedUnit})`}
                                            </th>
                                            <th rowSpan="2" style={{ textTransform: 'none' }}>
                                                Diameter<br />{`(${selectedUnit})`}
                                            </th>
                                            <th colSpan="2" className="centered-header" style={{ textTransform: 'none' }}>
                                                Acceptable Diameter Range for OK {`(${selectedUnit})`}
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
                                                <td>{index + 1}</td>
                                                <td>{region.name}</td>
                                                {
                                                    region.diameter.is_points_taken ?
                                                        <>
                                                            <td>
                                                                {region.diameter.max_deviation}
                                                                {/* {convertFromMM(region.max_deviation, selectedUnit)} */}
                                                            </td>
                                                            <td>
                                                                {region.diameter.min_deviation}
                                                                {/* {convertFromMM(region.min_deviation, selectedUnit)} */}
                                                            </td>
                                                            <td>
                                                                {region.diameter.result}
                                                                {/* {convertFromMM(region.runout, selectedUnit)} */}
                                                            </td>
                                                            <td>
                                                                <Field name={`regions[${index}].diameter.max_tolerance`}>
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
                                                                <Field name={`regions[${index}].diameter.min_tolerance`}>
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
                                    values.regions.some(item => !item.diameter.is_points_taken) ?
                                        <p className='my-1' style={{ fontWeight: 'bold', color: 'black' }}>
                                            {`* Ensure all regions have data points before accepting.`}
                                        </p>
                                        : null
                                }
                                <div className="d-flex justify-content-end mt-3">
                                    {
                                        !values.regions.some(item => !item.diameter.is_points_taken) ?
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
                    </>
                    : null
                }
                
            </ModalBody>
        </Modal>
    );
};

MasteringResults.propTypes = {
    visible: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    data: PropTypes.array.isRequired,
    closeModel: PropTypes.func.isRequired,
    selectedUnit: PropTypes.any.isRequired,
}

export default MasteringResults;
