import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Table } from "reactstrap";
import { sensorData } from "../SensorOp/data";
import PropTypes from "prop-types";

// const MasteredDataInformation = ({ sensorData, measurementData, open, toggle }) => {

//     // Map sensor IDs to sensor names
//     const sensorMap = sensorData.reduce((acc, sensor) => {
//         acc[sensor._id] = sensor.name;
//         return acc;
//     }, {});

//     // Group measurements by sensor
//     const groupedData = measurementData.reduce((acc, measurement) => {
//         if (!acc[measurement.sensorId]) {
//             acc[measurement.sensorId] = [];
//         }
//         acc[measurement.sensorId].push(measurement);
//         return acc;
//     }, {});

//     let rowIndex = 1; // For S.No

//     return (
//             <Modal isOpen={open} toggle={toggle} size="lg" keyboard={false} backdrop="static">
//                 <ModalHeader toggle={toggle}>Runout Value for Each Measurement and Sensors</ModalHeader>
//                 <ModalBody>
//                     <Table bordered className="table-responsive">
//                         <thead>
//                             <tr>
//                                 <th>S.No</th>
//                                 <th>Sensor Name</th>
//                                 <th>Measurement Name</th>
//                                 <th>Region Name</th>
//                                 <th>Max Tolerance</th>
//                                 <th>Min Tolerance</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {Object.keys(groupedData).map((sensorId) => {
//                                 const measurements = groupedData[sensorId];
//                                 const sensorRowSpan = measurements.reduce(
//                                     (total, measurement) => total + measurement.regions.length,
//                                     0
//                                 );

//                                 return measurements.map((measurement, measurementIndex) => {
//                                     const regions = measurement.regions;
//                                     const measurementRowSpan = regions.length;

//                                     return regions.map((region, regionIndex) => (
//                                         <tr key={`${sensorId}-${measurement.id}-${region.id}`}>
//                                             {regionIndex === 0 && measurementIndex === 0 && (
//                                                 <td rowSpan={sensorRowSpan}>{rowIndex++}</td>
//                                             )}
//                                             {regionIndex === 0 && measurementIndex === 0 && (
//                                                 <td rowSpan={sensorRowSpan}>{sensorMap[sensorId]}</td>
//                                             )}
//                                             {regionIndex === 0 && (
//                                                 <td rowSpan={measurementRowSpan}>{measurement.name}</td>
//                                             )}
//                                             <td>{region.name}</td>
//                                             <td>{region.max_tolerance}</td>
//                                             <td>{region.min_tolerance}</td>
//                                         </tr>
//                                     ));
//                                 });
//                             })}
//                         </tbody>
//                     </Table>
//                 </ModalBody>
//                 <ModalFooter>
//                     <Button color="secondary" onClick={toggle}>
//                         Close
//                     </Button>
//                 </ModalFooter>
//             </Modal>
//     );
// };


// const MasteredDataInformation = ({ sensorData, measurementData, open, toggle }) => {

//     // Flatten the data
//     const flattenedData = [];

//     sensorData.forEach((sensor) => {
//         sensor.measurements.forEach((measurement) => {
//             measurement.regions.forEach((region) => {
//                 region.measurement_type.forEach((type) => {
//                     flattenedData.push({
//                         sensorName: sensor.name,
//                         measurementName: measurement.name,
//                         regionName: region.name,
//                         measurementType: type,
//                         minTolerance: region[type]?.min_tolerance || "-",
//                         maxTolerance: region[type]?.max_tolerance || "-",
//                     });
//                 });
//             });
//         });
//     });

//     return (
//             <Modal isOpen={open} toggle={toggle} size="lg" keyboard={false} backdrop="static">
//                 <ModalHeader toggle={toggle}>Runout Value for Each Measurement and Sensors</ModalHeader>
//                 <ModalBody>
//                 <Table bordered striped hover className="text-center">
//                     <thead className="thead-dark">
//                         <tr>
//                             <th>Sensor Name</th>
//                             <th>Measurement Name</th>
//                             <th>Region Name</th>
//                             <th>Measurement Type</th>
//                             <th>Min Tolerance</th>
//                             <th>Max Tolerance</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {flattenedData.map((row, index) => (
//                             <tr key={index}>
//                                 <td>{row.sensorName}</td>
//                                 <td>{row.measurementName}</td>
//                                 <td>{row.regionName}</td>
//                                 <td>{row.measurementType}</td>
//                                 <td>{row.minTolerance}</td>
//                                 <td>{row.maxTolerance}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </Table>
//                 </ModalBody>
//                 <ModalFooter>
//                     <Button color="secondary" onClick={toggle}>
//                         Close
//                     </Button>
//                 </ModalFooter>
//             </Modal>
//     );
// };


const MasteredDataInformation = ({ sensorData, measurementData, open, toggle }) => {

    const flattenedData = [];
    const sensorRowSpanMap = new Map();
    const measurementRowSpanMap = new Map();
    const regionRowSpanMap = new Map();

    // Flatten data and calculate row spans
    sensorData.forEach((sensor) => {
        let sensorRowCount = 0;

        sensor.measurements.forEach((measurement) => {
            let measurementRowCount = 0;

            measurement.regions.forEach((region) => {
                let regionRowCount = region.measurement_type.length;

                // Store row spans
                regionRowSpanMap.set(`${sensor.name}_${measurement.name}_${region.name}`, regionRowCount);
                measurementRowCount += regionRowCount;
            });

            measurementRowSpanMap.set(`${sensor.name}_${measurement.name}`, measurementRowCount);
            sensorRowCount += measurementRowCount;
        });

        sensorRowSpanMap.set(sensor.name, sensorRowCount);
    });

    // Construct table data
    sensorData.forEach((sensor) => {
        sensor.measurements.forEach((measurement) => {
            measurement.regions.forEach((region) => {
                region.measurement_type.forEach((type, index) => {
                    flattenedData.push({
                        sensorName: sensor.name,
                        measurementName: measurement.name,
                        uniqueMeasurementName: `${sensor.name}_${measurement.name}`,
                        regionName: region.name,
                        uniqueRegionName: `${sensor.name}_${measurement.name}_${region.name}`,
                        measurementType: type,
                        minTolerance: region[type]?.min_tolerance,  //  || "-"
                        maxTolerance: region[type]?.max_tolerance,  //  || "-"
                        isFirstSensorRow: sensorRowSpanMap.get(sensor.name) === flattenedData.length + 1,
                        isFirstMeasurementRow:
                            measurementRowSpanMap.get(`${sensor.name}_${measurement.name}`) === flattenedData.length + 1,
                        isFirstRegionRow:
                            regionRowSpanMap.get(`${sensor.name}_${measurement.name}_${region.name}`) === flattenedData.length + 1,
                    });
                });
            });
        });
    });

    return (
            <Modal isOpen={open} toggle={toggle} size="lg" keyboard={false} backdrop="static">
                <ModalHeader toggle={toggle}>Runout Value for Each Measurement and Sensors</ModalHeader>
                <ModalBody>
                <div className="table-responsive">
                    <Table bordered striped hover className="text-center">
                        <thead className="thead-dark">
                            <tr>
                                <th>Sensor Name</th>
                                <th>Measurement Name</th>
                                <th>Region Name</th>
                                <th>Measurement Type</th>
                                <th>Min Tolerance</th>
                                <th>Max Tolerance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {flattenedData.map((row, index) => (
                                <tr key={index}>
                                    {/* Sensor Name with RowSpan */}
                                    {index === 0 ||
                                        flattenedData[index - 1].sensorName !== row.sensorName ? (
                                        <td rowSpan={sensorRowSpanMap.get(row.sensorName)}>{row.sensorName}</td>
                                    ) : null}

                                    {/* Measurement Name with RowSpan */}
                                    {index === 0 ||
                                        flattenedData[index - 1].uniqueMeasurementName !== row.uniqueMeasurementName ? (
                                        <td rowSpan={measurementRowSpanMap.get(`${row.sensorName}_${row.measurementName}`)}>
                                            {row.measurementName}
                                        </td>
                                    ) : null}

                                    {/* Region Name with RowSpan */}
                                    {index === 0 ||
                                        flattenedData[index - 1].uniqueRegionName !== row.uniqueRegionName ? (
                                        <td rowSpan={regionRowSpanMap.get(`${row.sensorName}_${row.measurementName}_${row.regionName}`)}>
                                            {row.regionName}
                                        </td>
                                    ) : null}

                                    {/* Measurement Type, Min, and Max Tolerance */}
                                    <td>{row.measurementType}</td>
                                    <td>{row.minTolerance}</td>
                                    <td>{row.maxTolerance}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggle}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
    );
};

MasteredDataInformation.propTypes = {
    sensorData: PropTypes.any.isRequired,
    measurementData: PropTypes.any.isRequired,
    open: PropTypes.any.isRequired,
    toggle: PropTypes.any.isRequired,
}

export default MasteredDataInformation;
