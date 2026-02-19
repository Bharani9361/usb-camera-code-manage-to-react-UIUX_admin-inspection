// import React, { useState } from 'react';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
  Input,
} from 'reactstrap';

const AdminTestingOptions = ({ isOpen, toggle, onContinue, rectangles,selectedVersiondata = [] , page }) => {
  console.log('selectedVersiondata', page)
  const data = Array.isArray(selectedVersiondata) ? selectedVersiondata : [selectedVersiondata];
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [options, setOptions] = useState([
    { label: 'Overall Image Testing', value: 'component_testing' },
    { label: 'Region-Wise Image Testing', value: 'region_testing' },
  ]);

  const [error, setError] = useState({});
  const [detectionType, setDetectionType] = useState(['ML', 'DL']);
  const [modalDetectionType, setModalDetectionType] = useState(null);
  const [modalSelectedRegions, setModalSelectedRegions] = useState([]);
  const [showValidationMsg, setShowValidationMsg] = useState(false);
  const [showTestingMethod, setShowTestingMethod] = useState(false);
  console.log('showTestingMethod', showTestingMethod)

  // 🆕 New state for testing method (Manual / Auto)
  const [testingMethod, setTestingMethod] = useState(null);
  
  useEffect(() => {
        const details = JSON.parse(sessionStorage.getItem('manageData'));
        console.log('details', details)
        const model_info = details.modelInfo;

        // const ask_testing_type = model_info.find(model =>
        //     model._id === data.model_id
        //     // && model.region_testing === true
        // ) !== undefined;
        // const ask_testing_type = data.some(item =>
        //     model_info.find(model => model._id === item.model_id)
        // ) !== undefined;
        const ask_testing_type = (Array.isArray(data) ? data : [data]).some(item =>
            model_info.some(model => model._id === item.model_id)
        );
        const setoptions = (Array.isArray(data) ? data : [data]).some(item =>item.region_selection=== false )
        console.log('setoptions', setoptions)
        if(setoptions){
          setOptions([{ label: 'Overall Image Testing', value: 'component_testing' }])
        }
        setShowTestingMethod(ask_testing_type);
        console.log('ask_testing_task_testing_type', ask_testing_type)

      }, []);
  
  const handleCheckboxChange = (value) => {
    setSelectedOptions((prevSelected) => {
      if (prevSelected.includes(value)) {
        const filteredOptions = prevSelected.filter((v) => v !== value);
        if (value === 'region_testing') {
          setModalSelectedRegions([]);
          setModalDetectionType(null);
        }
        return filteredOptions;
      } else {
        if (value === 'region_testing') {
          setModalSelectedRegions([]);
          setModalDetectionType(null);
        }
        return [...prevSelected, value];
      }
    });

    setError((prev) => {
      const newErrorState = { ...prev };
      delete newErrorState['testing_mode'];
      return newErrorState;
    });
  };

  const resetOptions = () => {
    setModalDetectionType(null);
    setModalSelectedRegions([]);
    setShowValidationMsg(false);
    setSelectedOptions([]);
    setTestingMethod(null); // 🆕 reset new field
    setError({});
  };

  const handleContinue = () => {
    if (showTestingMethod && selectedOptions.length === 0) {
      setError((prev) => ({
        ...prev,
        testing_mode: 'Please select at least one testing mode.',
      }));
    } else if (!testingMethod) {
      setError((prev) => ({
        ...prev,
        testing_method: 'Please select a testing method.',
      }));
    } else if (modalDetectionType === 'Smart Object Locator' && modalSelectedRegions.length === 0) {
      setShowValidationMsg(true);
    } else if (!modalDetectionType) {
      setError((prev) => ({
        ...prev,
        detection_type: 'Please select an object detection method.',
      }));
    } else {
      resetOptions();
      const data = {
        testing_mode: selectedOptions,
        testing_method: testingMethod, // 🆕 include in payload
        detection_type: modalDetectionType,
        regions: modalSelectedRegions,
      };
      onContinue(data);
    }
  };

  const handleClose = () => {
    resetOptions();
    toggle();
  };

  const handleRegionSelection = (e, region, idx) => {
    const isChecked = e.target.checked;
    setModalSelectedRegions((prev) =>
      isChecked ? [...prev, region.name] : prev.filter((r) => r !== region.name)
    );
    setShowValidationMsg(false);
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} backdrop="static" keyboard={false}>
      <ModalBody>
        {/* Select Testing Mode */}
      {showTestingMethod && (
  <>
    <h6 className='fw-bold my-2'>Select Testing Mode</h6>
    
    {/* Map over options */}
    {options.map((opt, idx) => (
      <FormGroup check key={idx} className="mb-2">
        <Label check style={{ cursor: 'pointer' }}>
          <Input
            type="checkbox"
            value={opt.value}
            checked={selectedOptions.includes(opt.value)}
            onChange={() => handleCheckboxChange(opt.value)}
          />{' '}
          {opt.label}
        </Label>
      </FormGroup>
    ))}

    {/* Optional error message */}
    {error?.testing_mode && (
      <div className="text-danger mt-2">{`*${error?.testing_mode}`}</div>
    )}
  </>
)}


        {/* 🆕 Select Testing Method (Manual / Auto) */}
        <h6 className='fw-bold my-3'>Select Testing Method</h6>
        <div className="d-flex gap-3">
          <FormGroup check>
            <Label check>
              <Input
                type="radio"
                name="testingMethod"
                value="manual"
                checked={testingMethod === 'manual'}
                onChange={(e) => setTestingMethod(e.target.value)}
              />{' '}
              Manual
            </Label>
          </FormGroup>
          {page !== 'AdminGallery' && (
          <FormGroup check>
            <Label check>
              <Input
                type="radio"
                name="testingMethod"
                value="auto"
                checked={testingMethod === 'auto'}
                onChange={(e) => setTestingMethod(e.target.value)}
              />{' '}
              Auto
            </Label>
          </FormGroup>
          )}
        </div>
        {error?.testing_method && <div className="text-danger mt-3">{`*${error?.testing_method}`}</div>}

        {/* Select Object Detection Method */}
        <h6 className='fw-bold my-3'>Select Object Detection Mode</h6>
        {detectionType.map((type, i) => (
          <FormGroup check key={i}>
            <Label check>
              <Input
                type="radio"
                name="detectMethod"
                value={type}
                checked={modalDetectionType === type}
                onChange={(e) => setModalDetectionType(e.target.value)}
              />{' '}
              {type}
            </Label>
          </FormGroup>
        ))}
        {error?.detection_type && <div className="text-danger mt-3">{`*${error?.detection_type}`}</div>}

        {modalDetectionType === 'Smart Object Locator' && (
          <div style={{ marginTop: '1rem' }}>
            <div
              style={{
                backgroundColor: '#f1f1f1',
                padding: '12px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                marginBottom: '10px'
              }}
            >
              <p style={{ marginBottom: 4 }}>
                This mode automatically locates components even if they are <strong>not in fixed positions</strong>.
              </p>

              <div className='p-2 rounded' style={{ backgroundColor: 'white', border: '1px solid #ccc' }}>
                <p><strong>Select regions where movement might happen:</strong></p>

                {rectangles.map((region, idx) => (
                  <FormGroup check key={idx}>
                    <Label check style={{ userSelect: 'none' }}>
                      <Input
                        type="checkbox"
                        checked={modalSelectedRegions.includes(region.name)}
                        onChange={(e) => handleRegionSelection(e, region, idx)}
                      />{' '}
                      {region.name}
                    </Label>
                  </FormGroup>
                ))}

                {showValidationMsg && (
                  <div style={{ color: 'red', marginTop: 8 }}>
                    {`*Please select at least one region for Smart Object Locator to work.`}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button size='sm' color="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button size='sm' color="primary" onClick={handleContinue}>
          Continue
        </Button>
      </ModalFooter>
    </Modal>
  );
};

AdminTestingOptions.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  onContinue: PropTypes.func.isRequired,
  rectangles: PropTypes.any,
  selectedVersiondata: PropTypes.any,
  page: PropTypes.any
};

export default AdminTestingOptions;

// // import React, { useState } from 'react';
// import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
// import PropTypes from 'prop-types';
// import {
//   Modal,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   Button,
//   FormGroup,
//   Label,
//   Input,
// } from 'reactstrap';

// const AdminTestingOptions = ({ isOpen, toggle, onContinue, rectangles,selectedVersiondata = [] }) => {
//   console.log('selectedVersiondata', selectedVersiondata)
//   const data = Array.isArray(selectedVersiondata) ? selectedVersiondata : [selectedVersiondata];
//   const [selectedOptions, setSelectedOptions] = useState([]);
//   const [options, setOptions] = useState([
//     { label: 'Overall Image Testing', value: 'component_testing' },
//     { label: 'Region-Wise Image Testing', value: 'region_testing' },
//   ]);

//   const [error, setError] = useState({});
//   const [detectionType, setDetectionType] = useState(['ML', 'DL']);
//   const [modalDetectionType, setModalDetectionType] = useState(null);
//   const [modalSelectedRegions, setModalSelectedRegions] = useState([]);
//   const [showValidationMsg, setShowValidationMsg] = useState(false);
//   const [showTestingMethod, setShowTestingMethod] = useState(false);
//   console.log('showTestingMethod', showTestingMethod)

//   // 🆕 New state for testing method (Manual / Auto)
//   const [testingMethod, setTestingMethod] = useState(null);
  
//   useEffect(() => {
//         const details = JSON.parse(sessionStorage.getItem('manageData'));
//         console.log('details', details)
//         const model_info = details.modelInfo;

//         // const ask_testing_type = model_info.find(model =>
//         //     model._id === data.model_id
//         //     // && model.region_testing === true
//         // ) !== undefined;
//         // const ask_testing_type = data.some(item =>
//         //     model_info.find(model => model._id === item.model_id)
//         // ) !== undefined;
//         const ask_testing_type = (Array.isArray(data) ? data : [data]).some(item =>
//             model_info.some(model => model._id === item.model_id && model.region_testing === true)
//         );
//         setShowTestingMethod(ask_testing_type);
//         console.log('ask_testing_task_testing_type', ask_testing_type)

//       }, []);
  
//   const handleCheckboxChange = (value) => {
//     setSelectedOptions((prevSelected) => {
//       if (prevSelected.includes(value)) {
//         const filteredOptions = prevSelected.filter((v) => v !== value);
//         if (value === 'region_testing') {
//           setModalSelectedRegions([]);
//           setModalDetectionType(null);
//         }
//         return filteredOptions;
//       } else {
//         if (value === 'region_testing') {
//           setModalSelectedRegions([]);
//           setModalDetectionType(null);
//         }
//         return [...prevSelected, value];
//       }
//     });

//     setError((prev) => {
//       const newErrorState = { ...prev };
//       delete newErrorState['testing_mode'];
//       return newErrorState;
//     });
//   };

//   const resetOptions = () => {
//     setModalDetectionType(null);
//     setModalSelectedRegions([]);
//     setShowValidationMsg(false);
//     setSelectedOptions([]);
//     setTestingMethod(null); // 🆕 reset new field
//     setError({});
//   };

//   const handleContinue = () => {
//     if (selectedOptions.length === 0) {
//       setError((prev) => ({
//         ...prev,
//         testing_mode: 'Please select at least one testing mode.',
//       }));
//     } else if (!testingMethod) {
//       setError((prev) => ({
//         ...prev,
//         testing_method: 'Please select a testing method.',
//       }));
//     } else if (modalDetectionType === 'Smart Object Locator' && modalSelectedRegions.length === 0) {
//       setShowValidationMsg(true);
//     } else if (!modalDetectionType) {
//       setError((prev) => ({
//         ...prev,
//         detection_type: 'Please select an object detection method.',
//       }));
//     } else {
//       resetOptions();
//       const data = {
//         testing_mode: selectedOptions,
//         testing_method: testingMethod, // 🆕 include in payload
//         detection_type: modalDetectionType,
//         regions: modalSelectedRegions,
//       };
//       onContinue(data);
//     }
//   };

//   const handleClose = () => {
//     resetOptions();
//     toggle();
//   };

//   const handleRegionSelection = (e, region, idx) => {
//     const isChecked = e.target.checked;
//     setModalSelectedRegions((prev) =>
//       isChecked ? [...prev, region.name] : prev.filter((r) => r !== region.name)
//     );
//     setShowValidationMsg(false);
//   };

//   return (
//     <Modal isOpen={isOpen} toggle={handleClose} backdrop="static" keyboard={false}>
//       <ModalBody>
//         {/* Select Testing Mode */}
//       {showTestingMethod && (
//   <>
//     <h6 className='fw-bold my-2'>Select Testing Mode</h6>
    
//     {/* Map over options */}
//     {options.map((opt, idx) => (
//       <FormGroup check key={idx} className="mb-2">
//         <Label check style={{ cursor: 'pointer' }}>
//           <Input
//             type="checkbox"
//             value={opt.value}
//             checked={selectedOptions.includes(opt.value)}
//             onChange={() => handleCheckboxChange(opt.value)}
//           />{' '}
//           {opt.label}
//         </Label>
//       </FormGroup>
//     ))}

//     {/* Optional error message */}
//     {error?.testing_mode && (
//       <div className="text-danger mt-2">{`*${error?.testing_mode}`}</div>
//     )}
//   </>
// )}


//         {/* 🆕 Select Testing Method (Manual / Auto) */}
//         <h6 className='fw-bold my-3'>Select Testing Method</h6>
//         <div className="d-flex gap-3">
//           <FormGroup check>
//             <Label check>
//               <Input
//                 type="radio"
//                 name="testingMethod"
//                 value="manual"
//                 checked={testingMethod === 'manual'}
//                 onChange={(e) => setTestingMethod(e.target.value)}
//               />{' '}
//               Manual
//             </Label>
//           </FormGroup>
//           <FormGroup check>
//             <Label check>
//               <Input
//                 type="radio"
//                 name="testingMethod"
//                 value="auto"
//                 checked={testingMethod === 'auto'}
//                 onChange={(e) => setTestingMethod(e.target.value)}
//               />{' '}
//               Auto
//             </Label>
//           </FormGroup>
//         </div>
//         {error?.testing_method && <div className="text-danger mt-3">{`*${error?.testing_method}`}</div>}

//         {/* Select Object Detection Method */}
//         <h6 className='fw-bold my-3'>Select Object Detection Mode</h6>
//         {detectionType.map((type, i) => (
//           <FormGroup check key={i}>
//             <Label check>
//               <Input
//                 type="radio"
//                 name="detectMethod"
//                 value={type}
//                 checked={modalDetectionType === type}
//                 onChange={(e) => setModalDetectionType(e.target.value)}
//               />{' '}
//               {type}
//             </Label>
//           </FormGroup>
//         ))}
//         {error?.detection_type && <div className="text-danger mt-3">{`*${error?.detection_type}`}</div>}

//         {modalDetectionType === 'Smart Object Locator' && (
//           <div style={{ marginTop: '1rem' }}>
//             <div
//               style={{
//                 backgroundColor: '#f1f1f1',
//                 padding: '12px',
//                 borderRadius: '5px',
//                 border: '1px solid #ccc',
//                 marginBottom: '10px'
//               }}
//             >
//               <p style={{ marginBottom: 4 }}>
//                 This mode automatically locates components even if they are <strong>not in fixed positions</strong>.
//               </p>

//               <div className='p-2 rounded' style={{ backgroundColor: 'white', border: '1px solid #ccc' }}>
//                 <p><strong>Select regions where movement might happen:</strong></p>

//                 {rectangles.map((region, idx) => (
//                   <FormGroup check key={idx}>
//                     <Label check style={{ userSelect: 'none' }}>
//                       <Input
//                         type="checkbox"
//                         checked={modalSelectedRegions.includes(region.name)}
//                         onChange={(e) => handleRegionSelection(e, region, idx)}
//                       />{' '}
//                       {region.name}
//                     </Label>
//                   </FormGroup>
//                 ))}

//                 {showValidationMsg && (
//                   <div style={{ color: 'red', marginTop: 8 }}>
//                     {`*Please select at least one region for Smart Object Locator to work.`}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </ModalBody>

//       <ModalFooter>
//         <Button size='sm' color="secondary" onClick={handleClose}>
//           Cancel
//         </Button>
//         <Button size='sm' color="primary" onClick={handleContinue}>
//           Continue
//         </Button>
//       </ModalFooter>
//     </Modal>
//   );
// };

// AdminTestingOptions.propTypes = {
//   isOpen: PropTypes.bool.isRequired,
//   toggle: PropTypes.func.isRequired,
//   onContinue: PropTypes.func.isRequired,
//   rectangles: PropTypes.any,
//   selectedVersiondata: PropTypes.any
// };

// export default AdminTestingOptions;

// // import React, { useState } from 'react';
// // import PropTypes from 'prop-types';
// // import {
// //   Modal,
// //   ModalHeader,
// //   ModalBody,
// //   ModalFooter,
// //   Button,
// //   FormGroup,
// //   Label,
// //   Input,
// // } from 'reactstrap';

// // const AdminTestingOptions = ({ isOpen, toggle, onContinue, rectangles =[] }) => { // , options = []
// //   console.log('rectangles002 ', rectangles)
// //   const [selectedOptions, setSelectedOptions] = useState([]);
// //   const [options, setOptions] = useState([
// //     { label: 'Overall Image Testing', value: 'component_testing' },
// //     { label: 'Region-Wise Image Testing', value: 'region_testing' },
// //   ]);

// //   const [error, setError] = useState({});
// //   const [detectionType, setDetectionType] = useState(['ML', 'DL']);
// //   const [modalDetectionType, setModalDetectionType] = useState(null);
// //   const [modalSelectedRegions, setModalSelectedRegions] = useState([]);
// //   const [showValidationMsg, setShowValidationMsg] = useState(false);


// //   const handleCheckboxChange = (value) => {
// //     setSelectedOptions((prevSelected) => {
// //       if (prevSelected.includes(value)) {
// //         // If the value is already selected, remove it
// //         const filteredOptions = prevSelected.filter((v) => v !== value);

// //         // Perform side effects if 'region_testing' is being deselected
// //         if (value === 'region_testing') {
// //           setDetectionType(['ML', 'DL']); // Reset detection type when 'region_testing' is deselected
// //           setModalSelectedRegions([]); // Reset selected regions
// //           setModalDetectionType(null);    // Reset modal detection type
// //         }

// //         return filteredOptions;
// //       } else {
// //         if (value === 'region_testing') {
// //           // setDetectionType((prev) => [...prev, 'Smart Object Locator']); // Add Smart Object Locator when 'region_testing' is selected
// //           setModalSelectedRegions([]); // Reset selected regions
// //           setModalDetectionType(null);    // Reset modal detection type
// //         }
// //         // If the value is not selected, add it
// //         return [...prevSelected, value];
// //       }
// //     });

// //     setError((prev) => {
// //       const newErrorState = { ...prev };
// //       delete newErrorState['testing_mode'];
// //       return newErrorState;
// //     });
// //   };

// //   const resetOptions = () => {
// //     // reset object detection settings & regions
// //     // setDetectionType(prev => prev.filter(type => type !== 'Smart Object Locator'));
// //     setModalDetectionType(null);
// //     setModalSelectedRegions([]);
// //     setShowValidationMsg(false);
    
// //     // reset selected options
// //     setSelectedOptions([]);
// //     setError({});
// //   }

// //   const handleContinue = () => {
// //     if (selectedOptions.length === 0) {
// //       setError((prev) => ({
// //         ...prev,
// //         testing_mode: 'Please select at least one testing mode.'
// //       }));
// //     }
// //     else if (modalDetectionType === 'Smart Object Locator' && modalSelectedRegions.length === 0) {
// //       setShowValidationMsg(true);
// //     }
// //     else if (!modalDetectionType) {
// //       setError((prev) => ({
// //         ...prev,
// //         detection_type: 'Please select an object detection method.'
// //       }));
// //     }
// //     else {
// //       resetOptions();
// //       const data = {
// //         testing_mode: selectedOptions,
// //         detection_type: modalDetectionType,
// //         regions: modalSelectedRegions
// //       }
// //       onContinue(data);
// //     }
// //   };

// //   const handleClose = () => { 
// //     resetOptions();
// //     toggle(); // Close the modal
// //   }

// //   const handleRegionSelection = (e, region, idx) => {

// //     const isChecked = e.target.checked;
// //     setModalSelectedRegions((prev) => {
// //       if (isChecked) {
// //         return [...prev, region.name];
// //       } else {
// //         return prev.filter((r) => r !== region.name);
// //       }
// //     })


// //     setShowValidationMsg(false);
// //   }


// //   return (
// //     <Modal isOpen={isOpen} toggle={handleClose} backdrop="static" keyboard={false}>
// //       <ModalBody>
// //         <h6 className='fw-bold my-2'>Select Testing Mode</h6>
// //         {options.map((opt, idx) => (
// //           <FormGroup check key={idx} className="mb-2">
// //             <Label check>
// //               <Input
// //                 type="checkbox"
// //                 value={opt.value}
// //                 checked={selectedOptions.includes(opt.value)}
// //                 onChange={() => handleCheckboxChange(opt.value)}
// //               />{' '}
// //               {opt.label}
// //             </Label>
// //           </FormGroup>
// //         ))}
// //         {error?.testing_mode && <div className="text-danger mt-3">{`*${error?.testing_mode}`}</div>}

        
// //         {/* Choose Object Detection Method */}
// //         <h6 className='fw-bold my-2'>Select Object Detection Mode</h6>
// //         {detectionType.map((type, i) => (
// //           <FormGroup check key={i}>
// //             <Label check>
// //               <Input
// //                 type="radio"
// //                 name="detectMethod"
// //                 value={type}
// //                 checked={modalDetectionType === type}
// //                 onChange={(e) => setModalDetectionType(e.target.value)}
// //               />{' '}
// //               {type}
// //             </Label>
// //           </FormGroup>
// //         ))}
// //         {error?.detection_type && <div className="text-danger mt-3">{`*${error?.detection_type}`}</div>}

// //         {modalDetectionType === 'Smart Object Locator' && (
// //           <div style={{ marginTop: '1rem' }}>
// //             <div
// //               style={{
// //                 backgroundColor: '#f1f1f1',
// //                 padding: '12px',
// //                 borderRadius: '5px',
// //                 border: '1px solid #ccc',
// //                 marginBottom: '10px'
// //               }}
// //             >
// //               <p style={{ marginBottom: 4 }}>
// //                 This mode automatically locates components even if they are <strong>not in their fixed positions</strong>.
// //                 Useful when objects <strong>shift/move inside the test image</strong>.
// //               </p>

// //               <div className='p-2 rounded' style={{ backgroundColor: 'white', border: '1px solid #ccc' }}>
// //                 <p><strong>Select regions where movement might happen:</strong></p>

// //                 {rectangles.map((region, idx) => (
// //                   <FormGroup check key={idx}>
// //                     <Label check style={{ userSelect: 'none' }}>
// //                       <Input
// //                         type="checkbox"
// //                         checked={modalSelectedRegions.includes(region.name)}
// //                         onChange={(e) => handleRegionSelection(e, region, idx)}
// //                       />{' '}
// //                       {region.name}
// //                     </Label>
// //                   </FormGroup>
// //                 ))}

// //                 {/* Warning message */}
// //                 {showValidationMsg && (
// //                   <div style={{ color: 'red', marginTop: 8 }}>
// //                     {`*Please select at least one region for Smart Object Locator to work.`}
// //                   </div>
// //                 )}
// //               </div>
// //               <p style={{ fontStyle: 'italic' }}>
// //                 You can uncheck regions where components always stay fixed.
// //               </p>
// //             </div>
// //           </div>
// //         )}
// //       </ModalBody>
// //       <ModalFooter>
// //         <Button size='sm' color="secondary" onClick={handleClose}>
// //           Cancel
// //         </Button>
// //         <Button size='sm' color="primary" onClick={handleContinue}>
// //           Continue
// //         </Button>
// //       </ModalFooter>
// //     </Modal>
// //   );
// // };

// // AdminTestingOptions.propTypes = {
// //   isOpen: PropTypes.bool.isRequired,
// //   toggle: PropTypes.func.isRequired,
// //   onContinue: PropTypes.func.isRequired,
// //   options: PropTypes.any,
// //   // .arrayOf(
// //   //   PropTypes.shape({
// //   //     value: PropTypes.string.isRequired,
// //   //     label: PropTypes.string.isRequired,
// //   //   })
// //   // ).isRequired,
// //   rectangles: PropTypes.any, // Assuming it is an array of objects
// // };

// // export default AdminTestingOptions;
