
// const data = [
//     {
//         "diameter": {
//             "is_points_taken": true,
//             "result": 0.28139
//         },
//         "length": {
//             "is_points_taken": true,
//             "result": 0.28139
//         },
//         "measurement_type": [
//             "runout",
//             "diameter", 
//             "length"
//         ],
//         "name": "region_1",
//         "runout": {
//             "is_points_taken": true,
//             "max_deviation": 224.2,
//             "min_deviation": 215.635,
//             "result": 8.565
//         },
//     },
//     {
//         "diameter": {
//             "is_points_taken": true,
//             "result": -0.47338
//         },
//         "measurement_type": [
//             "diameter"
//         ],
//         "name": "region_2",
//     },
//     {
//         "measurement_type": [
//             "runout"
//         ],
//         "name": "region_3",
//         "runout": {
//             "is_points_taken": true,
//             "max_deviation": 217.755,
//             "min_deviation": 217.73,
//             "result": 0.025
//         },
//     },
//     {
//         "measurement_type": [
//             "runout"
//         ],
//         "name": "region_4",
//         "runout": {
//             "is_points_taken": true,
//             "max_deviation": 217.755,
//             "min_deviation": 217.73,
//             "result": 0.025
//         },
//     },
//     {
//         "measurement_type": [
//             "runout"
//         ],
//         "name": "region_5",
//         "runout": {
//             "is_points_taken": true,
//             "max_deviation": 217.465,
//             "min_deviation": 217.465,
//             "result": 1
//         },
//     }
// ]

// import React, { useState } from "react";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import {
//   Table,
//   Button,
//   Modal,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   Input,
// } from "reactstrap";


// export const DynamicResults = () => {   // { data }
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // Extract unique measurement types dynamically
//   const measurementTypes = Array.from(
//     new Set(data.flatMap((item) => item.measurement_type))
//   );

//   // Create validation schema dynamically
//   const validationSchema = Yup.object(
//     Object.fromEntries(
//       data.flatMap((item) =>
//         item.measurement_type.map((type) => [
//           `${item.name}_${type}_min`,
//           Yup.number()
//             .max(Yup.ref(`${item.name}_${type}_max`), "Min should be less than Max")
//             .required("Required"),
//         ])
//       )
//     )
//   );

//   const formik = useFormik({
//     initialValues: data.reduce((acc, item) => {
//       item.measurement_type.forEach((type) => {
//         acc[`${item.name}_${type}_min`] = "";
//         acc[`${item.name}_${type}_max`] = "";
//       });
//       return acc;
//     }, {}),
//     validationSchema,
//     onSubmit: (values) => {
//       console.log("Submitted Values:", values);
//       setIsModalOpen(false);
//     },
//   });

//   return (
//     <div className="page-content">
//       <Button color="primary" onClick={() => setIsModalOpen(true)}>
//         Show Measurement Data
//       </Button>

//       <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(!isModalOpen)} size="lg">
//         <ModalHeader toggle={() => setIsModalOpen(!isModalOpen)}>
//           Measurement Tables
//         </ModalHeader>
//         <ModalBody>
//           <form onSubmit={formik.handleSubmit}>
//             {measurementTypes.map((type) => (
//               <div key={type} className="mb-4">
//                 <h5 className="text-center text-uppercase">{type} Table</h5>
//                 <Table bordered>
//                   <thead>
//                     <tr>
//                       <th>Name</th>
//                       {/* Extract field headers dynamically */}
//                       {Object.keys(data.find((item) => item[type])?.[type] || {})
//                         .map((key) =>
//                           key !== "is_points_taken" ? <th key={key}>{key.replace("_", " ").toUpperCase()}</th> : null
//                         )
//                         .filter(Boolean)}
//                       <th>Min Tolerance</th>
//                       <th>Max Tolerance</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {data
//                       .filter((item) => item.measurement_type.includes(type))
//                       .map((record) => (
//                         <tr key={record.name}>
//                           <td>{record.name}</td>
//                           {Object.keys(record[type] || {})
//                             .map((key) =>
//                               key !== "is_points_taken" ? <td key={key}>{record[type][key]}</td> : null
//                             )
//                             .filter(Boolean)}
//                           <td>
//                             <Input
//                               type="number"
//                               name={`${record.name}_${type}_min`}
//                               value={formik.values[`${record.name}_${type}_min`]}
//                               onChange={formik.handleChange}
//                               onBlur={formik.handleBlur}
//                               invalid={!!formik.errors[`${record.name}_${type}_min`]}
//                             />
//                           </td>
//                           <td>
//                             <Input
//                               type="number"
//                               name={`${record.name}_${type}_max`}
//                               value={formik.values[`${record.name}_${type}_max`]}
//                               onChange={formik.handleChange}
//                               onBlur={formik.handleBlur}
//                               invalid={!!formik.errors[`${record.name}_${type}_max`]}
//                             />
//                           </td>
//                         </tr>
//                       ))}
//                   </tbody>
//                 </Table>
//               </div>
//             ))}
//           </form>
//         </ModalBody>
//         <ModalFooter>
//           <Button color="secondary" onClick={() => setIsModalOpen(false)}>
//             Cancel
//           </Button>
//           <Button color="primary" onClick={formik.handleSubmit}>
//             Submit
//           </Button>
//         </ModalFooter>
//       </Modal>
//     </div>
//   );
// };


import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  FormFeedback,
} from "reactstrap";
import PropTypes from "prop-types";

export const DynamicResults = ({ visible, toggle, data, selectedUnit, closeModel }) => {       // { data }
  
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
          return parseFloat(value * 10); // 1 cm = 10 mm
        case "inches":
          return parseFloat(value * 25.4); // 1 inch = 25.4 mm
        default:
          return parseFloat(value); // Already in mm
      }
    }
    return parseFloat(value); // Add logic for other unit conversions if needed
  };  
  
  // Extract unique measurement types dynamically
    const measurementTypes = Array.from(
      new Set(data.flatMap((item) => item.measurement_type))
    );
  
    // Create validation schema dynamically, validation will occur on submit
    const validationSchema = Yup.object(
      data.reduce((acc, item) => {
        item.measurement_type.forEach((type) => {
          acc[`${item.name}_${type}_min`] = Yup.number()
            .required("Min tolerance is required")
            .test("min-tolerance", "Min should be less than the result", function (value) {
              const result = convertFromMM(item[type]?.result,selectedUnit);
              return result && value < result;
            });
          acc[`${item.name}_${type}_max`] = Yup.number()
            .required("Max tolerance is required")
            .test("max-tolerance", "Max should be greater than the result", function (value) {
              const result = convertFromMM(item[type]?.result,selectedUnit);
              return result && value > result;
            });
        });
        return acc;
      }, {})
    );


  
    const formik = useFormik({
      initialValues: data.reduce((acc, item) => {
        item.measurement_type.forEach((type) => {
          acc[`${item.name}_${type}_min`] = "";
          acc[`${item.name}_${type}_max`] = "";
        });
        return acc;
      }, {}),
      validationSchema,
      onSubmit: (values) => {
          // Process and store the submitted values with tolerances
          const processedValues = data.map((item) => {
              const result = {};
              item.measurement_type.forEach((type) => {
                  const minTolField = `${item.name}_${type}_min`;
                  const maxTolField = `${item.name}_${type}_max`;

                  // Add min and max tolerance directly to the respective measurement field
                  result[type] = {
                      ...item[type],
                      min_tolerance: convertToMM(values[minTolField], "mm"),
                      max_tolerance: convertToMM(values[maxTolField], "mm"),
                  };
              });
              return { ...item, ...result };
          });

        //   setSubmittedValues(processedValues);  // Store the processed values
          console.log("Processed Values:", processedValues);

          const value = {
            regions: processedValues
          }
          toggle(value)

        //   setIsModalOpen(false);
      },
    });

    const hasInvalidPoints = data.some((item) =>
        item.measurement_type.some((type) => item[type] && !item[type].is_points_taken)
    );
    
  
    return (
        <Modal isOpen={visible} toggle={closeModel} size="lg" keyboard={false} backdrop="static">
          <ModalHeader toggle={closeModel}>
            MEASUREMENT MASTERING RESULTS
          </ModalHeader>
          <ModalBody>
            <form onSubmit={formik.handleSubmit}>
              {measurementTypes.map((type) => (
                <div key={type} className="mb-4">
                  <h5 className="text-center text-uppercase">{type} Table</h5>
                  <Table bordered>
                    <thead>
                      <tr>
                        <th>Name</th>
                        {/* Extract field headers dynamically */}
                        {Object.keys(data.find((item) => item[type])?.[type] || {})
                          .map((key) =>
                            key !== "is_points_taken" ? 
                            <th key={key}>
                              {key.replace("_", " ").toUpperCase()}
                              <br/>
                              {`(${selectedUnit})`}
                            </th> 
                            : null
                          )
                          .filter(Boolean)}
                        <th>Max Tolerance<br/>{`(${selectedUnit})`}
                        </th>
                        <th>Min Tolerance<br/>{`(${selectedUnit})`}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data
                        .filter((item) => item.measurement_type.includes(type))
                        .map((record) => (
                          <tr key={record.name}>
                            <td>{record.name}</td>
                            {
                                record[type].is_points_taken ?
                                <>
                                    {Object.keys(record[type] || {})
                                        .map((key) =>
                                            key !== "is_points_taken" ?
                                                <td key={key}>
                                                  {convertFromMM(record[type][key], selectedUnit)}
                                                </td>
                                                : null
                                        )
                                        .filter(Boolean)}
                                    <td>
                                        <Input
                                            type="number"
                                            name={`${record.name}_${type}_max`}
                                            value={formik.values[`${record.name}_${type}_max`]}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            invalid={!!formik.errors[`${record.name}_${type}_max`] && formik.touched[`${record.name}_${type}_max`]}
                                        />
                                        {formik.errors[`${record.name}_${type}_max`] && formik.touched[`${record.name}_${type}_max`] && (
                                            <FormFeedback>{formik.errors[`${record.name}_${type}_max`]}</FormFeedback>
                                        )}
                                    </td>
                                    <td>
                                        <Input
                                            type="number"
                                            name={`${record.name}_${type}_min`}
                                            value={formik.values[`${record.name}_${type}_min`]}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            invalid={!!formik.errors[`${record.name}_${type}_min`] && formik.touched[`${record.name}_${type}_min`]}
                                        />
                                        {formik.errors[`${record.name}_${type}_min`] && formik.touched[`${record.name}_${type}_min`] && (
                                            <FormFeedback>{formik.errors[`${record.name}_${type}_min`]}</FormFeedback>
                                        )}
                                    </td>
                                </>
                                : 
                                <td 
                                    colSpan={Object.keys(record[type]).length +1}
                                    style={{ color: 'red' }}
                                >
                                    * Incomplete data: No Data Points Taken for this Region</td>
                            }
                            
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                </div>
              ))}
            </form>
          </ModalBody>
            <ModalFooter>
                {
                    !hasInvalidPoints ?
                    <Button color="primary" onClick={formik.handleSubmit}>
                        Submit
                    </Button>
                    : null
                }
                <Button color="secondary" onClick={closeModel}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
  };

DynamicResults.propTypes = {
    visible: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    data: PropTypes.array.isRequired,
    closeModel: PropTypes.func.isRequired,
    selectedUnit: PropTypes.any.isRequired,
}

// export const DynamicResults = () => {       // { data }
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // Extract unique measurement types dynamically
//   const measurementTypes = Array.from(
//     new Set(data.flatMap((item) => item.measurement_type))
//   );

//   // Create validation schema dynamically
//   const validationSchema = Yup.object(
//     data.reduce((acc, item) => {
//       item.measurement_type.forEach((type) => {
//         const resultValue = item[type]?.result || 0; // Get the result value (or default to 0)

//         acc[`${item.name}_${type}_min`] = Yup.number()
//           .max(resultValue, `Min tolerance should be less than the result (${resultValue})`)
//           .required("Required");

//         acc[`${item.name}_${type}_max`] = Yup.number()
//           .min(resultValue, `Max tolerance should be greater than the result (${resultValue})`)
//           .required("Required");
//       });
//       return acc;
//     }, {})
//   );

//   const formik = useFormik({
//     initialValues: data.reduce((acc, item) => {
//       item.measurement_type.forEach((type) => {
//         acc[`${item.name}_${type}_min`] = "";
//         acc[`${item.name}_${type}_max`] = "";
//       });
//       return acc;
//     }, {}),
//     validationSchema,
//     onSubmit: (values) => {
//       console.log("Submitted Values:", values);
//       setIsModalOpen(false);
//     },
//   });

//   return (
//     <div className="page-content">
//       <Button color="primary" onClick={() => setIsModalOpen(true)}>
//         Show Measurement Data
//       </Button>

//       <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(!isModalOpen)} size="lg">
//         <ModalHeader toggle={() => setIsModalOpen(!isModalOpen)}>
//           Measurement Tables
//         </ModalHeader>
//         <ModalBody>
//           <form onSubmit={formik.handleSubmit}>
//             {measurementTypes.map((type) => (
//               <div key={type} className="mb-4">
//                 <h5 className="text-center text-uppercase">{type} Table</h5>
//                 <Table bordered>
//                   <thead>
//                     <tr>
//                       <th>Name</th>
//                       {/* Extract field headers dynamically */}
//                       {Object.keys(data.find((item) => item[type])?.[type] || {})
//                         .map((key) =>
//                           key !== "is_points_taken" ? <th key={key}>{key.replace("_", " ").toUpperCase()}</th> : null
//                         )
//                         .filter(Boolean)}
//                       <th>Min Tolerance</th>
//                       <th>Max Tolerance</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {data
//                       .filter((item) => item.measurement_type.includes(type))
//                       .map((record) => {
//                         const resultValue = record[type]?.result || 0; // Get the result value (or default to 0)
//                         return (
//                           <tr key={record.name}>
//                             <td>{record.name}</td>
//                             {Object.keys(record[type] || {})
//                               .map((key) =>
//                                 key !== "is_points_taken" ? <td key={key}>{record[type][key]}</td> : null
//                               )
//                               .filter(Boolean)}
//                             <td>
//                               <Input
//                                 type="number"
//                                 name={`${record.name}_${type}_min`}
//                                 value={formik.values[`${record.name}_${type}_min`]}
//                                 onChange={formik.handleChange}
//                                 onBlur={formik.handleBlur}
//                                 invalid={!!formik.errors[`${record.name}_${type}_min`]}
//                               />
//                             </td>
//                             <td>
//                               <Input
//                                 type="number"
//                                 name={`${record.name}_${type}_max`}
//                                 value={formik.values[`${record.name}_${type}_max`]}
//                                 onChange={formik.handleChange}
//                                 onBlur={formik.handleBlur}
//                                 invalid={!!formik.errors[`${record.name}_${type}_max`]}
//                               />
//                             </td>
//                           </tr>
//                         );
//                       })}
//                   </tbody>
//                 </Table>
//               </div>
//             ))}
//           </form>
//         </ModalBody>
//         <ModalFooter>
//           <Button color="secondary" onClick={() => setIsModalOpen(false)}>
//             Cancel
//           </Button>
//           <Button color="primary" onClick={formik.handleSubmit}>
//             Submit
//           </Button>
//         </ModalFooter>
//       </Modal>
//     </div>
//   );
// };



