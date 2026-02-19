import React, { useEffect, useState } from 'react';
import MetaTags from 'react-meta-tags';
import PropTypes from 'prop-types';
import {
  Col,
  Container,
  Row,
  CardTitle,
  Button,
  Table,
  Modal,
  CardBody,
  CardText,
  Card,
  ButtonGroup
} from 'reactstrap';

import { DatePicker } from 'antd';
import urlSocket from './urlSocket';
import Select from 'react-select';

import { img_url } from './imageUrl';
import Breadcrumbs from 'components/Common/Breadcrumb';
import PaginationComponent from 'components/Common/PaginationComponent';
import { filter, min } from 'lodash';

const { RangePicker } = DatePicker;

//worked till 25 nov 2025
// const Report = ({ history }) => {
//   const [showTable2, setShowTable2] = useState(false);
//   const [tempIndex, setTempIndex] = useState(0);
//   const [filterCompName, setFilterCompName] = useState('');
//   const [filterCompCode, setFilterCompCode] = useState('');
//   const [positive, setPositive] = useState('');
//   const [negative, setNegative] = useState('');
//   const [possibleMatch, setPossibleMatch] = useState('');
//   const [filterDate, setFilterDate] = useState('');
//   const [compName, setCompName] = useState('');
//   const [compCode, setCompCode] = useState('');
//   const [date, setDate] = useState('');
//   const [stationId, setStationId] = useState('');
//   const [okCount, setOkCount] = useState(0);
//   const [notOkCount, setNotOkCount] = useState(0);
//   const [noObjCount, setNoObjCount] = useState(0);
//   const [incorrectObj, setIncorrectObj] = useState(0);

//   const [configPositive, setConfigPositive] = useState('');
//   const [configNegative, setConfigNegative] = useState('');

//   const [dateWiseData, setDateWiseData] = useState(null);
//   const [timeWiseFilterData, setTimeWiseFilterData] = useState([]);

//   const [dataLoaded, setDataLoaded] = useState(false);

//   const [showModal, setShowModal] = useState(false);
//   const [modalData, setModalData] = useState({});
//   const [imageSrc, setImageSrc] = useState('');

//   const [selectedFilter, setSelectedFilter] = useState(0);

//   // PAGINATION
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   const [stageOptions, setStageOptions] = useState([]);
//   const [cameraOptions, setCameraOptions] = useState([]);

//   const [selectedStages, setSelectedStages] = useState([]);
//   const [selectedCameras, setSelectedCameras] = useState([]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [selectedStages]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [selectedCameras]);

//   const getStageOptions = data => {
//     const stageMap = new Map();

//     data.forEach(item => {
//       item.stage_camera_result?.forEach(stage => {
//         stageMap.set(stage.stage_code, {
//           label: stage.stage_name,
//           value: stage.stage_code
//         });
//       });
//     });

//     console.log('stageMap.values()', stageMap.values());

//     return Array.from(stageMap.values());
//   };

//   useEffect(() => {
//     if (timeWiseFilterData.length > 0) {
//       const stages = getStageOptions(timeWiseFilterData);
//       console.log('Generated stage options:', stages);

//       setStageOptions(stages);
//     }
//   }, [timeWiseFilterData]);

//   const getCameraOptions = (data, selectedStageValues) => {
//     const cameraMap = new Map();

//     data.forEach(item => {
//       item.stage_camera_result?.forEach(stage => {
//         if (selectedStageValues.includes(stage.stage_code)) {
//           const key = `${stage.stage_code}-${stage.camera_label}`;
//           cameraMap.set(key, {
//             label: stage.camera_label,
//             value: key,
//             stage_code: stage.stage_code
//           });
//         }
//       });
//     });

//     return Array.from(cameraMap.values());
//   };

//   const onStageSelect = selected => {
//     console.log('Selected stages:', selected);

//     const stages = selected || [];
//     setSelectedStages(stages);

//     const stageValues = stages.map(s => s.value);
//     console.log('stageValues', stageValues);
//     const cameraList = getCameraOptions(timeWiseFilterData, stageValues);
//     setCameraOptions(cameraList);

//     setSelectedCameras([]);

//     setCurrentPage(1);
//     fetchFilteredData(selectedStatus, selectedLevel, stages, []);
//   };

//   const onCameraSelect = selected => {
//     console.log('Selected cameras:', selected);
//     const cameras = selected || [];
//     setSelectedCameras(cameras);

//     // Auto-apply filter when camera changes
//     setCurrentPage(1);
//     fetchFilteredData(selectedStatus, selectedLevel, selectedStages, cameras);
//   };

//   const getImage = data1 => {
//     console.log('dddddddddddddd', data1);
//     if (data1 !== undefined && data1 !== null) {
//       let baseurl =
//         typeof img_url === 'object'
//           ? img_url.url || img_url.baseUrl || ''
//           : img_url;
//       let imagePath = '';

//       if (Array.isArray(data1) && data1.length > 0) {
//         imagePath = data1[0].captured_image;
//         console.log('imagePath_array', imagePath);
//       } else if (typeof data1 === 'string') {
//         imagePath = data1;
//       } else {
//         console.log('Unexpected data format:', data1);
//         return null;
//       }

//       console.log('imagePath', imagePath);
//       console.log('baseurl', baseurl);
//       let replace = imagePath.replace(/\\/g, '/');
//       let output = img_url + replace;
//       console.log('output', output);
//       return output;
//     } else {
//       return null;
//     }
//   };

//   useEffect(() => {
//     const timeData = JSON.parse(sessionStorage.getItem('timeWiseData'));
//     const dateData = JSON.parse(sessionStorage.getItem('dateWiseData'));
//     setDateWiseData(dateData);

//     setOkCount(timeData.ok);
//     setNotOkCount(timeData.notok);
//     setNoObjCount(timeData.no_obj);
//     setIncorrectObj(timeData.incorrect_obj);

//     setConfigPositive(timeData.config_positive);
//     setConfigNegative(timeData.config_negative);

//     fetchLabelData(timeData);
//     fetchTimeWiseFilteredData(timeData);
//   }, []);

//   const fetchLabelData = timeWiseData => {
//     urlSocket
//       .post('/comp_Data', {
//         comp_name: timeWiseData.comp_name,
//         comp_code: timeWiseData.comp_code
//       })
//       .then(res => {
//         setPositive(res.data[0].positive);
//         setNegative(res.data[0].negative);
//       })
//       .catch(err => console.log(err));
//   };

//   const fetchTimeWiseFilteredData = timeWiseData => {
//     urlSocket
//       .post('/timeWise_filterData', {
//         comp_name: timeWiseData.comp_name,
//         comp_code: timeWiseData.comp_code,
//         station_id: timeWiseData.station_id,
//         date: timeWiseData.date
//       })
//       .then(response => {
//         const data = response.data;
//         setTimeWiseFilterData(data);
//         setCompName(data[0].comp_name);
//         setCompCode(data[0].comp_code);
//         setDate(data[0].date);
//         setStationId(data[0].station_id);
//         setDataLoaded(true);
//         console.log('timewisedata', data);
//       })
//       .catch(error => console.log(error));
//   };

//   const [selectedLevel, setSelectedLevel] = useState('stages'); // 'stages' or 'cameras'

//   const [selectedStatus, setSelectedStatus] = useState('');

//   // const statusFilter = (status, filterValue) => {
//   //   setSelectedFilter(filterValue);
//   //   setCurrentPage(1);

//   //   urlSocket
//   //     .post('/result_filterData', {
//   //       comp_name: compName,
//   //       comp_code: compCode,
//   //       date,
//   //       result: status,
//   //       station_id: stationId,
//   //     })
//   //     .then(response => setTimeWiseFilterData(response.data))
//   //     .catch(error => console.log(error));
//   // };

//   // const statusFilter = (status, filterValue, level) => {
//   //   setSelectedFilter(filterValue);
//   //   setCurrentPage(1);

//   //   if (!compName || !compCode || !date || !stationId) return;

//   //   urlSocket
//   //     .post('/result_filterData', {
//   //       comp_name: compName,
//   //       comp_code: compCode,
//   //       date,
//   //       result: status,
//   //       station_id: stationId,
//   //       level: level
//   //     })
//   //     .then(response => {
//   //       const data = response.data || [];
//   //       setTimeWiseFilterData(data);
//   //       setTempIndex(0);
//   //     })
//   //     .catch(error => console.log(error));
//   // };

//   const fetchFilteredData = async (
//     status,
//     level,
//     stageFilters = [],
//     cameraFilters = []
//   ) => {
//     try {
//       const requestBody = {
//         comp_name: compName,
//         comp_code: compCode,
//         date,
//         station_id: stationId,
//         result: status,
//         level: level
//       };

//       // Add stage filters if selected
//       if (stageFilters.length > 0) {
//         requestBody.selected_stages = stageFilters.map(s => s.value);
//       }

//       // Add camera filters if selected
//       if (cameraFilters.length > 0) {
//         requestBody.selected_cameras = cameraFilters.map(c => c.label);
//       }

//       console.log('Request Body:', requestBody);

//       const response = await urlSocket.post('/result_filterData', requestBody);

//       if (!response.data || response.data.length === 0) {
//         setTimeWiseFilterData([]);
//       } else {
//         setTimeWiseFilterData(response.data);
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const statusFilter = (status, filterValue) => {
//     setSelectedStatus(status);
//     setSelectedFilter(filterValue);
//     setCurrentPage(1);

//     fetchFilteredData(status, selectedLevel, selectedStages, selectedCameras);
//   };

//   // const levelFilter = level => {
//   //   setSelectedLevel(level);
//   //   setCurrentPage(1);

//   //   fetchFilteredData(selectedStatus, level, selectedStages, selectedCameras);
//   // };

//   // const applyStageAndCameraFilter = () => {
//   //   setCurrentPage(1);
//   //   fetchFilteredData(
//   //     selectedStatus,
//   //     selectedLevel,
//   //     selectedStages,
//   //     selectedCameras
//   //   );
//   // };

//   const backButton = () => {
//     sessionStorage.setItem(
//       'dateWiseData',
//       JSON.stringify({
//         startDate: dateWiseData.startDate,
//         endDate: dateWiseData.endDate,
//         comp_name: dateWiseData.comp_name,
//         comp_code: dateWiseData.comp_code
//       })
//     );
//     history.push('/inspectResult');
//   };

//   const onNext = () => {
//     let index = tempIndex + 1;
//     let selectedData = filteredData[index];
//     setModalData(selectedData);
//     setImageSrc(getImage(selectedData.captured_image));
//     setTempIndex(index);
//   };

//   const onPrev = () => {
//     let index = tempIndex - 1;
//     let selectedData = filteredData[index];
//     setModalData(selectedData);
//     setImageSrc(getImage(selectedData.captured_image));
//     setTempIndex(index);
//   };

//   // const indexOfLastItem = currentPage * itemsPerPage;
//   // const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   // const currentItems = timeWiseFilterData.slice(
//   //   indexOfFirstItem,
//   //   indexOfLastItem
//   // );

//   // console.log('currentItems', currentItems);

//   // const filteredData = timeWiseFilterData.filter(item => {
//   //   // Stage Filter - extract values from selected stage objects
//   //   if (selectedStages.length > 0) {
//   //     const selectedStageCodes = selectedStages.map(s => s.value);
//   //     const stageCodes = item.stage_camera_result?.map(s => s.stage_code) || [];
//   //     if (!stageCodes.some(code => selectedStageCodes.includes(code)))
//   //       return false;
//   //   }

//   //   // Camera Filter - extract labels from selected camera objects
//   //   if (selectedCameras.length > 0) {
//   //     const selectedCamLabels = selectedCameras.map(c => c.label);
//   //     const cameras = item.stage_camera_result?.map(s => s.camera_label) || [];
//   //     if (!cameras.some(cam => selectedCamLabels.includes(cam))) return false;
//   //   }

//   //   return true;
//   // });

//   const filteredData = timeWiseFilterData;

//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;

//   const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

//   if (!dataLoaded) return null;

//   return (
//     <div className='page-content'>
//       <MetaTags>
//         <title>Inspection Result Details</title>
//       </MetaTags>

//       <Breadcrumbs
//         title='INSPECTION RESULT'
//         isBackButtonEnable={true}
//         gotoBack={backButton}
//       />

//       <Container fluid>
//         <Card>
//           <CardBody>
//             <div className='d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-2 mb-2'>
//               <div>
//                 <CardTitle className='mb-0'>
//                   <span className='me-2 font-size-12'>Component Name :</span>
//                   {compName}
//                 </CardTitle>
//                 <CardText className='mb-0'>
//                   <span className='me-2 font-size-12'>Component Code :</span>
//                   {compCode}
//                 </CardText>
//                 <CardText className='mb-0'>
//                   <span className='me-2 font-size-12'>Date:</span> {date}
//                 </CardText>
//               </div>

//               <div className='d-flex align-items-center gap-1'>
//                 <div>
//                   <Select
//                     options={stageOptions}
//                     value={selectedStages}
//                     onChange={onStageSelect}
//                     isMulti
//                     placeholder='Select Stages'
//                     className='custom-select-width'
//                     closeMenuOnSelect={false}
//                   />
//                 </div>

//                 {selectedStages.length > 0 && (
//                   <div>
//                     <Select
//                       options={cameraOptions}
//                       value={selectedCameras}
//                       onChange={onCameraSelect}
//                       isMulti
//                       placeholder='Select Cameras'
//                       className='custom-select-width'
//                     />
//                   </div>
//                 )}
//               </div>

//               <div>
//                 <ButtonGroup className='d-flex flex-wrap flex-lg-nowrap w-100'>
//                   <Button
//                     color='primary'
//                     outline={selectedFilter !== 0}
//                     onClick={() => statusFilter('', 0)}
//                     className='flex-fill text-nowrap px-2 px-lg-3'
//                   >
//                     Total ({okCount + notOkCount + noObjCount + incorrectObj})
//                   </Button>

//                   <Button
//                     color='primary'
//                     outline={selectedFilter !== 1}
//                     onClick={() => statusFilter(positive, 1)}
//                     className='flex-fill text-nowrap px-2 px-lg-3'
//                   >
//                     {configPositive} ({okCount})
//                   </Button>

//                   <Button
//                     color='primary'
//                     outline={selectedFilter !== 2}
//                     onClick={() => statusFilter(negative, 2)}
//                     className='flex-fill text-nowrap px-2 px-lg-3'
//                   >
//                     {configNegative} ({notOkCount})
//                   </Button>

//                   <Button
//                     color='primary'
//                     outline={selectedFilter !== 3}
//                     onClick={() => statusFilter('No Object Found', 3)}
//                     className='flex-fill text-nowrap px-2 px-lg-3'
//                   >
//                     No Object Found ({noObjCount})
//                   </Button>

//                   <Button
//                     color='primary'
//                     outline={selectedFilter !== 4}
//                     onClick={() => statusFilter('Incorrect Object', 4)}
//                     className='flex-fill text-nowrap px-2 px-lg-3'
//                   >
//                     Incorrect Object ({incorrectObj})
//                   </Button>
//                 </ButtonGroup>
//               </div>
//             </div>
//             {/* <Row className='d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-2 mb-2'>
//               <Col xs='12' lg='auto'>
//                 <CardTitle className='mb-0'>
//                   <span className='me-2 font-size-12'>Component Name :</span>
//                   {compName}
//                 </CardTitle>
//                 <CardText className='mb-0'>
//                   <span className='me-2 font-size-12'>Component Code :</span>
//                   {compCode}
//                 </CardText>
//                 <CardText className='mb-0'>
//                   <span className='me-2 font-size-12'>Date:</span> {date}
//                 </CardText>
//               </Col>

//               <Col xs='12' lg='auto' className='mb-2 mb-lg-0 '>
//                 <Row className='mb-3 '>
//                   <Col
//                     xs='12'
//                     md='6'
//                     lg='5'
//                     className='ps-0'
//                     style={{ width: '50%', marginTop: 20 }}
//                   >
//                     <Select
//                       options={stageOptions}
//                       value={selectedStages}
//                       onChange={onStageSelect}
//                       isMulti
//                       placeholder='Select Stages'
//                       styles={{
//                         control: base => ({
//                           ...base,
//                           minHeight: '38px'
//                         }),
//                         menu: base => ({
//                           ...base,
//                           zIndex: 9999
//                         })
//                       }}
//                     />
//                   </Col>

//                   {selectedStages.length > 0 && (
//                     <Col
//                       xs='12'
//                       md='6'
//                       lg='5'
//                       className='ps-0'
//                       style={{ width: '50%', marginTop: 20 }}
//                     >
//                       <Select
//                         options={cameraOptions}
//                         value={selectedCameras}
//                         onChange={onCameraSelect}
//                         isMulti
//                         placeholder='Select Cameras'
//                         styles={{
//                           control: base => ({
//                             ...base,
//                             minHeight: '38px'
//                           }),
//                           menu: base => ({
//                             ...base,
//                             zIndex: 9999
//                           })
//                         }}
//                       />
//                     </Col>
//                   )}
//                 </Row>
//               </Col>

//               <Col xs='12' lg='auto' className='text-center'>
//                 <ButtonGroup className='d-flex flex-wrap flex-lg-nowrap w-100'>
//                   <Button
//                     color='primary'
//                     outline={selectedFilter !== 0}
//                     onClick={() => statusFilter('', 0)}
//                     className='flex-fill text-nowrap px-2 px-lg-3'
//                   >
//                     Total ({okCount + notOkCount + noObjCount + incorrectObj})
//                   </Button>

//                   <Button
//                     color='primary'
//                     outline={selectedFilter !== 1}
//                     onClick={() => statusFilter(positive, 1)}
//                     className='flex-fill text-nowrap px-2 px-lg-3'
//                   >
//                     {configPositive} ({okCount})
//                   </Button>

//                   <Button
//                     color='primary'
//                     outline={selectedFilter !== 2}
//                     onClick={() => statusFilter(negative, 2)}
//                     className='flex-fill text-nowrap px-2 px-lg-3'
//                   >
//                     {configNegative} ({notOkCount})
//                   </Button>

//                   <Button
//                     color='primary'
//                     outline={selectedFilter !== 3}
//                     onClick={() => statusFilter('No Object Found', 3)}
//                     className='flex-fill text-nowrap px-2 px-lg-3'
//                   >
//                     No Object Found ({noObjCount})
//                   </Button>

//                   <Button
//                     color='primary'
//                     outline={selectedFilter !== 4}
//                     onClick={() => statusFilter('Incorrect Object', 4)}
//                     className='flex-fill text-nowrap px-2 px-lg-3'
//                   >
//                     Incorrect Object ({incorrectObj})
//                   </Button>
//                 </ButtonGroup>
//               </Col>
//             </Row> */}
//             {filteredData.length === 0 ? (
//               <div className='text-center ' style={{ height: '20vh' }}>
//                 <h5 className='text-secondary '>No Records Found</h5>
//               </div>
//             ) : (
//               <div className='table-responsive'>
//                 <Table
//                   className='table mb-0 align-middle table-nowrap table-check'
//                   bordered
//                 >
//                   <thead className='table-light'>
//                     <tr>
//                       <th>S. No.</th>
//                       <th>Time</th>
//                       <th>Stage Names</th>
//                       <th>Stage Code</th>
//                       <th>Camera</th>
//                       <th>Result</th>
//                       <th>Captured Image</th>
//                     </tr>
//                   </thead>
//                   {/* <tbody>
//                     {currentItems.map((data, index) => (
//                       <tr key={index}>
//                         <td>{index + 1 + (currentPage - 1) * 10}</td>
//                         <td>{data.inspected_ontime}</td>

//                         <td>
//                           {data.stage_camera_result[0]?.stage_name || '-'}
//                         </td>
//                         <td>
//                           {data.stage_camera_result[0]?.stage_code || '-'}
//                         </td>

//                         <td style={{ padding: 0 }}>
//                           {data.stage_camera_result.map((stage, i) => (
//                             <div key={i}>
//                               <div style={{ padding: '8px 12px' }}>
//                                 {stage.camera_label}
//                               </div>
//                               {i < data.stage_camera_result.length - 1 && (
//                                 <hr
//                                   style={{ margin: 0, borderColor: '#dee2e6' }}
//                                 />
//                               )}
//                             </div>
//                           ))}
//                         </td>

//                         <td style={{ padding: 0 }}>
//                           {data.stage_camera_result.map((stage, i) => (
//                             <div key={i}>
//                               <div
//                                 style={{
//                                   padding: '8px 12px',
//                                   color:
//                                     stage.result?.trim().toUpperCase() === 'NG'
//                                       ? 'red'
//                                       : stage.result?.trim().toUpperCase() ===
//                                         'OK'
//                                       ? 'green'
//                                       : 'black'
//                                 }}
//                               >
//                                 {stage.result}
//                               </div>
//                               {i < data.stage_camera_result.length - 1 && (
//                                 <hr
//                                   style={{ margin: 0, borderColor: '#dee2e6' }}
//                                 />
//                               )}
//                             </div>
//                           ))}
//                         </td>

//                         <td style={{ padding: 0 }}>
//                           {data.stage_camera_result.map((stage, i) => {
//                             const imagesForCamera = data.captured_image.filter(
//                               img => img.camera_label === stage.camera_label
//                             );

//                             return (
//                               <div key={i}>
//                                 <div style={{ padding: '8px 12px' }}>
//                                   {imagesForCamera.map((imgObj, j) => (
//                                     <img
//                                       key={j}
//                                       src={getImage(imgObj.captured_image)}
//                                       style={{
//                                         width: 'auto',
//                                         height: 100,
//                                         marginRight: 10,
//                                         cursor: 'pointer'
//                                       }}
//                                       onClick={() => {
//                                         setShowModal(true);
//                                         setModalData(data);
//                                         setTempIndex(
//                                           index + (currentPage - 1) * 10
//                                         );
//                                         setImageSrc(
//                                           getImage(imgObj.captured_image)
//                                         );
//                                       }}
//                                     />
//                                   ))}
//                                 </div>
//                                 {i < data.stage_camera_result.length - 1 && (
//                                   <hr
//                                     style={{
//                                       margin: 0,
//                                       borderColor: '#dee2e6'
//                                     }}
//                                   />
//                                 )}
//                               </div>
//                             );
//                           })}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody> */}
//                   {/* split method */}
//                   {/* <tbody>
//                     {currentItems.map((data, index) => {
//                       const stages = Array.isArray(data.stage_camera_result)
//                         ? data.stage_camera_result
//                         : data.stage_camera_result
//                         ? [data.stage_camera_result]
//                         : [];

//                       const capturedImages = Array.isArray(data.captured_image)
//                         ? data.captured_image
//                         : data.captured_image
//                         ? [data.captured_image]
//                         : [];

//                       return (
//                         <tr key={index}>
//                           <td>{index + 1 + (currentPage - 1) * 10}</td>

//                           <td>{data.inspected_ontime}</td>

//                           <td>{stages[0]?.stage_name}</td>
//                           <td>{stages[0]?.stage_code}</td>

//                           <td style={{ padding: 0 }}>
//                             {stages.map((stage, i) => (
//                               <div key={i}>
//                                 <div style={{ padding: '8px 12px' }}>
//                                   {stage.camera_label}
//                                 </div>

//                                 {i < stages.length - 1 && (
//                                   <hr
//                                     style={{
//                                       margin: 0,
//                                       borderColor: '#dee2e6'
//                                     }}
//                                   />
//                                 )}
//                               </div>
//                             ))}
//                           </td>

//                           <td style={{ padding: 0 }}>
//                             {stages.map((stage, i) => (
//                               <div key={i}>
//                                 <div
//                                   style={{
//                                     padding: '8px 12px',
//                                     color:
//                                       stage.result?.trim().toUpperCase() ===
//                                       'NG'
//                                         ? 'red'
//                                         : stage.result?.trim().toUpperCase() ===
//                                           'OK'
//                                         ? 'green'
//                                         : 'black'
//                                   }}
//                                 >
//                                   {stage.result}
//                                 </div>

//                                 {i < stages.length - 1 && (
//                                   <hr
//                                     style={{
//                                       margin: 0,
//                                       borderColor: '#dee2e6'
//                                     }}
//                                   />
//                                 )}
//                               </div>
//                             ))}
//                           </td>

//                           <td style={{ padding: 0 }}>
//                             {stages.map((stage, i) => {
//                               const imagesForCamera = capturedImages.filter(
//                                 img => img.camera_label === stage.camera_label
//                               );

//                               return (
//                                 <div key={i}>
//                                   <div style={{ padding: '8px 12px' }}>
//                                     {imagesForCamera.map((imgObj, j) => (
//                                       <img
//                                         key={j}
//                                         src={getImage(imgObj.captured_image)}
//                                         style={{
//                                           width: 'auto',
//                                           height: 100,
//                                           marginRight: 10,
//                                           cursor: 'pointer'
//                                         }}
//                                         onClick={() => {
//                                           setShowModal(true);
//                                           setModalData(data);
//                                           setTempIndex(
//                                             index + (currentPage - 1) * 10
//                                           );
//                                           setImageSrc(
//                                             getImage(imgObj.captured_image)
//                                           );
//                                         }}
//                                       />
//                                     ))}
//                                   </div>

//                                   {i < stages.length - 1 && (
//                                     <hr
//                                       style={{
//                                         margin: 0,
//                                         borderColor: '#dee2e6'
//                                       }}
//                                     />
//                                   )}
//                                 </div>
//                               );
//                             })}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody> */}
//                   {/* no split */}

//                   <tbody>
//                     {(() => {
//                       let rowSerial = 1;

//                       return currentItems.flatMap((data, dataIndex) => {
//                         const stages = Array.isArray(data.stage_camera_result)
//                           ? data.stage_camera_result
//                           : [];

//                         const images = Array.isArray(data.captured_image)
//                           ? data.captured_image
//                           : [];

//                         return stages.map((stage, stageIndex) => {
//                           const serial = rowSerial++;

//                           const imagesForCamera = images.filter(
//                             img => img.camera_label === stage.camera_label
//                           );

//                           return (
//                             <tr key={`${dataIndex}-${stageIndex}`}>
//                               <td>{serial}</td>

//                               <td>{data.inspected_ontime}</td>

//                               <td>{stage.stage_name || '-'}</td>

//                               <td>{stage.stage_code || '-'}</td>

//                               <td>{stage.camera_label}</td>

//                               <td
//                                 style={{
//                                   color:
//                                     stage.result?.trim().toUpperCase() === 'NG'
//                                       ? 'red'
//                                       : stage.result?.trim().toUpperCase() ===
//                                         'OK'
//                                       ? 'green'
//                                       : 'black'
//                                 }}
//                               >
//                                 {stage.result}
//                               </td>

//                               <td>
//                                 {imagesForCamera.map((imgObj, j) => (
//                                   <img
//                                     key={j}
//                                     src={getImage(imgObj.captured_image)}
//                                     style={{
//                                       width: 'auto',
//                                       height: 100,
//                                       marginRight: 10,
//                                       cursor: 'pointer'
//                                     }}
//                                     onClick={() => {
//                                       setShowModal(true);
//                                       setModalData(data);
//                                       setTempIndex(serial - 1);
//                                       setImageSrc(
//                                         getImage(imgObj.captured_image)
//                                       );
//                                     }}
//                                   />
//                                 ))}
//                               </td>
//                             </tr>
//                           );
//                         });
//                       });
//                     })()}
//                   </tbody>
//                 </Table>

//                 <PaginationComponent
//                   totalItems={filteredData.length}
//                   itemsPerPage={itemsPerPage}
//                   currentPage={currentPage}
//                   onPageChange={setCurrentPage}
//                 />
//               </div>
//             )}
//           </CardBody>
//         </Card>
//       </Container>

//       {/* IMAGE MODAL */}
//       <Modal size='l' isOpen={showModal} centered>
//         <div className='modal-header'>
//           <h5>Image</h5>
//           <Button className='close' onClick={() => setShowModal(false)}>
//             ×
//           </Button>
//         </div>

//         <div className='modal-body'>
//           <div className='text-center'>
//             <img className='img-fluid' src={imageSrc} alt='captured' />
//           </div>

//           <Row className='mt-4'>
//             <Col sm={6}>
//               Component Name: <b>{compName}</b>
//             </Col>

//             <Col sm={6} className='text-end'>
//               Result:
//               <span
//                 style={{
//                   color:
//                     modalData.result === 'No Objects Detected' ||
//                     modalData.result === 'notok'
//                       ? 'red'
//                       : 'green'
//                 }}
//               >
//                 {modalData.result}
//               </span>
//             </Col>
//           </Row>

//           <Row>
//             <Col sm={6}>
//               Component Code: <b>{compCode}</b>
//             </Col>

//             <Col sm={6} className='text-end'>
//               Date: <b>{modalData.date}</b> Time:{' '}
//               <b>{modalData.inspected_ontime}</b>
//             </Col>
//           </Row>

//           {/* PREV/NEXT BUTTONS */}
//           <Row className='mt-4'>
//             <Col md={6}>
//               {tempIndex !== 0 && <Button onClick={onPrev}>Previous</Button>}
//             </Col>

//             <Col md={6} className='text-end'>
//               {filteredData.length !== tempIndex + 1 && (
//                 <Button onClick={onNext}>Next</Button>
//               )}
//             </Col>
//           </Row>
//         </div>

//         <Row>
//           <Col className='text-center'>
//             ({tempIndex + 1} / {filteredData.length})
//           </Col>
//         </Row>
//       </Modal>
//     </div>
//   );
// };

//fixed stagewise filtering , prev and next options issues

// const Report = ({ history }) => {
//   const [showTable2, setShowTable2] = useState(false);
//   const [tempIndex, setTempIndex] = useState(0);
//   const [filterCompName, setFilterCompName] = useState('');
//   const [filterCompCode, setFilterCompCode] = useState('');
//   const [positive, setPositive] = useState('');
//   const [negative, setNegative] = useState('');
//   const [possibleMatch, setPossibleMatch] = useState('');
//   const [filterDate, setFilterDate] = useState('');
//   const [compName, setCompName] = useState('');
//   const [compCode, setCompCode] = useState('');
//   const [date, setDate] = useState('');
//   const [stationId, setStationId] = useState('');
//   const [okCount, setOkCount] = useState(0);
//   const [notOkCount, setNotOkCount] = useState(0);
//   const [noObjCount, setNoObjCount] = useState(0);
//   const [incorrectObj, setIncorrectObj] = useState(0);

//   const [configPositive, setConfigPositive] = useState('');
//   const [configNegative, setConfigNegative] = useState('');

//   const [dateWiseData, setDateWiseData] = useState(null);
//   const [timeWiseFilterData, setTimeWiseFilterData] = useState([]);

//   // NEW: Store the original unfiltered data
//   const [originalData, setOriginalData] = useState([]);

//   const [dataLoaded, setDataLoaded] = useState(false);

//   const [showModal, setShowModal] = useState(false);
//   const [modalData, setModalData] = useState({});
//   const [imageSrc, setImageSrc] = useState('');

//   const [selectedFilter, setSelectedFilter] = useState(0);

//   // PAGINATION
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   const [stageOptions, setStageOptions] = useState([]);
//   const [cameraOptions, setCameraOptions] = useState([]);

//   const [selectedStages, setSelectedStages] = useState([]);
//   const [selectedCameras, setSelectedCameras] = useState([]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [selectedStages]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [selectedCameras]);

//   const getStageOptions = data => {
//     const stageMap = new Map();

//     data.forEach(item => {
//       item.stage_camera_result?.forEach(stage => {
//         stageMap.set(stage.stage_code, {
//           label: stage.stage_name,
//           value: stage.stage_code
//         });
//       });
//     });

//     console.log('stageMap.values()', stageMap.values());

//     return Array.from(stageMap.values());
//   };

//   // FIXED: Use originalData instead of timeWiseFilterData for stage options
//   useEffect(() => {
//     if (originalData.length > 0) {
//       const stages = getStageOptions(originalData);
//       console.log('Generated stage options:', stages);

//       // Add "All" option at the beginning
//       const stagesWithAll = [{ label: 'All Stages', value: 'all' }, ...stages];

//       setStageOptions(stagesWithAll);
//     }
//   }, [originalData]);

//   const getCameraOptions = (data, selectedStageValues) => {
//     const cameraMap = new Map();

//     data.forEach(item => {
//       item.stage_camera_result?.forEach(stage => {
//         if (selectedStageValues.includes(stage.stage_code)) {
//           const key = `${stage.stage_code}-${stage.camera_label}`;
//           cameraMap.set(key, {
//             label: stage.camera_label,
//             value: key,
//             stage_code: stage.stage_code
//           });
//         }
//       });
//     });

//     return Array.from(cameraMap.values());
//   };

//   const onStageSelect = selected => {
//     console.log('Selected stages:', selected);

//     const stages = selected || [];
//     setSelectedStages(stages);

//     const stageValues = stages.map(s => s.value);
//     console.log('stageValues', stageValues);

//     // FIXED: Use originalData for camera options
//     const cameraList = getCameraOptions(originalData, stageValues);
//     setCameraOptions(cameraList);

//     setSelectedCameras([]);

//     setCurrentPage(1);
//     fetchFilteredData(selectedStatus, selectedLevel, stages, []);
//   };

//   // const onCameraSelect = selected => {
//   //   console.log('Selected cameras:', selected);
//   //   const cameras = selected || [];
//   //   setSelectedCameras(cameras);

//   //   // Auto-apply filter when camera changes
//   //   setCurrentPage(1);
//   //   fetchFilteredData(selectedStatus, selectedLevel, selectedStages, cameras);
//   // };

//   const onCameraSelect = selected => {
//     console.log('Selected cameras:', selected);
//     const cameras = selected || [];

//     // Check if "All" is in the new selection
//     const hasAll = cameras.some(c => c.value === 'all');
//     const previousHadAll = selectedCameras.some(c => c.value === 'all');

//     let finalCameras = cameras;

//     // If "All" was just selected, keep only "All"
//     if (hasAll && !previousHadAll) {
//       finalCameras = cameras.filter(c => c.value === 'all');
//     }
//     // If other options are selected while "All" is present, remove "All"
//     else if (hasAll && cameras.length > 1) {
//       finalCameras = cameras.filter(c => c.value !== 'all');
//     }

//     setSelectedCameras(finalCameras);

//     // Auto-apply filter when camera changes
//     setCurrentPage(1);
//     fetchFilteredData(
//       selectedStatus,
//       selectedLevel,
//       selectedStages,
//       finalCameras
//     );
//   };

//   const getImage = data1 => {
//     console.log('dddddddddddddd', data1);
//     if (data1 !== undefined && data1 !== null) {
//       let baseurl =
//         typeof img_url === 'object'
//           ? img_url.url || img_url.baseUrl || ''
//           : img_url;
//       let imagePath = '';

//       if (Array.isArray(data1) && data1.length > 0) {
//         imagePath = data1[0].captured_image;
//         console.log('imagePath_array', imagePath);
//       } else if (typeof data1 === 'string') {
//         imagePath = data1;
//       } else {
//         console.log('Unexpected data format:', data1);
//         return null;
//       }

//       console.log('imagePath', imagePath);
//       console.log('baseurl', baseurl);
//       let replace = imagePath.replace(/\\/g, '/');
//       let output = img_url + replace;
//       console.log('output', output);
//       return output;
//     } else {
//       return null;
//     }
//   };

//   useEffect(() => {
//     const timeData = JSON.parse(sessionStorage.getItem('timeWiseData'));
//     const dateData = JSON.parse(sessionStorage.getItem('dateWiseData'));
//     setDateWiseData(dateData);

//     setOkCount(timeData.ok);
//     setNotOkCount(timeData.notok);
//     setNoObjCount(timeData.no_obj);
//     setIncorrectObj(timeData.incorrect_obj);

//     setConfigPositive(timeData.config_positive);
//     setConfigNegative(timeData.config_negative);

//     fetchLabelData(timeData);
//     fetchTimeWiseFilteredData(timeData);
//   }, []);

//   const fetchLabelData = timeWiseData => {
//     urlSocket
//       .post('/comp_Data', {
//         comp_name: timeWiseData.comp_name,
//         comp_code: timeWiseData.comp_code
//       })
//       .then(res => {
//         setPositive(res.data[0].positive);
//         setNegative(res.data[0].negative);
//       })
//       .catch(err => console.log(err));
//   };

//   const fetchTimeWiseFilteredData = timeWiseData => {
//     urlSocket
//       .post('/timeWise_filterData', {
//         comp_name: timeWiseData.comp_name,
//         comp_code: timeWiseData.comp_code,
//         station_id: timeWiseData.station_id,
//         date: timeWiseData.date
//       })
//       .then(response => {
//         const data = response.data;

//         // FIXED: Store original data separately
//         setOriginalData(data);
//         setTimeWiseFilterData(data);

//         setCompName(data[0].comp_name);
//         setCompCode(data[0].comp_code);
//         setDate(data[0].date);
//         setStationId(data[0].station_id);
//         setDataLoaded(true);
//         console.log('timewisedata', data);
//       })
//       .catch(error => console.log(error));
//   };

//   const [selectedLevel, setSelectedLevel] = useState('stages');

//   const [selectedStatus, setSelectedStatus] = useState('');

//   // const fetchFilteredData = async (
//   //   status,
//   //   level,
//   //   stageFilters = [],
//   //   cameraFilters = []
//   // ) => {
//   //   try {
//   //     const requestBody = {
//   //       comp_name: compName,
//   //       comp_code: compCode,
//   //       date,
//   //       station_id: stationId,
//   //       result: status,
//   //       level: level
//   //     };

//   //     // Add stage filters if selected
//   //     if (stageFilters.length > 0) {
//   //       requestBody.selected_stages = stageFilters.map(s => s.value);
//   //     }

//   //     // Add camera filters if selected
//   //     if (cameraFilters.length > 0) {
//   //       requestBody.selected_cameras = cameraFilters.map(c => c.label);
//   //     }

//   //     console.log('Request Body:', requestBody);

//   //     const response = await urlSocket.post('/result_filterData', requestBody);

//   //     if (!response.data || response.data.length === 0) {
//   //       setTimeWiseFilterData([]);
//   //     } else {
//   //       setTimeWiseFilterData(response.data);
//   //     }
//   //   } catch (err) {
//   //     console.log(err);
//   //   }
//   // };

//   const fetchFilteredData = async (
//     status,
//     level,
//     stageFilters = [],
//     cameraFilters = []
//   ) => {
//     try {
//       const requestBody = {
//         comp_name: compName,
//         comp_code: compCode,
//         date,
//         station_id: stationId,
//         result: status,
//         level: level
//       };

//       // Add stage filters if selected (skip if "all" is selected)
//       const hasAllStages = stageFilters.some(s => s.value === 'all');
//       if (stageFilters.length > 0 && !hasAllStages) {
//         requestBody.selected_stages = stageFilters.map(s => s.value);
//       }

//       // Add camera filters if selected (skip if "all" is selected)
//       const hasAllCameras = cameraFilters.some(c => c.value === 'all');
//       if (cameraFilters.length > 0 && !hasAllCameras) {
//         requestBody.selected_cameras = cameraFilters.map(c => c.label);
//       }

//       console.log('Request Body:', requestBody);

//       const response = await urlSocket.post('/result_filterData', requestBody);

//       if (!response.data || response.data.length === 0) {
//         setTimeWiseFilterData([]);
//       } else {
//         setTimeWiseFilterData(response.data);
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const statusFilter = (status, filterValue) => {
//     setSelectedStatus(status);
//     setSelectedFilter(filterValue);
//     setCurrentPage(1);

//     fetchFilteredData(status, selectedLevel, selectedStages, selectedCameras);
//   };

//   const backButton = () => {
//     sessionStorage.setItem(
//       'dateWiseData',
//       JSON.stringify({
//         startDate: dateWiseData.startDate,
//         endDate: dateWiseData.endDate,
//         comp_name: dateWiseData.comp_name,
//         comp_code: dateWiseData.comp_code
//       })
//     );
//     history.push('/inspectResult');
//   };

//   const onNext = () => {
//     // Create flattened array to match table rows
//     const flattenedData = filteredData.flatMap(data => {
//       const stages = Array.isArray(data.stage_camera_result)
//         ? data.stage_camera_result
//         : [];
//       return stages.map(stage => ({
//         ...data,
//         currentStage: stage,
//         currentCamera: stage.camera_label
//       }));
//     });

//     let index = tempIndex + 1;
//     if (index < flattenedData.length) {
//       let selectedData = flattenedData[index];
//       const imagesForCamera = (
//         Array.isArray(selectedData.captured_image)
//           ? selectedData.captured_image
//           : []
//       ).filter(img => img.camera_label === selectedData.currentCamera);

//       setModalData(selectedData);
//       setImageSrc(getImage(imagesForCamera[0]?.captured_image));
//       setTempIndex(index);
//     }
//   };

//   const onPrev = () => {
//     // Create flattened array to match table rows
//     const flattenedData = filteredData.flatMap(data => {
//       const stages = Array.isArray(data.stage_camera_result)
//         ? data.stage_camera_result
//         : [];
//       return stages.map(stage => ({
//         ...data,
//         currentStage: stage,
//         currentCamera: stage.camera_label
//       }));
//     });

//     let index = tempIndex - 1;
//     if (index >= 0) {
//       let selectedData = flattenedData[index];
//       const imagesForCamera = (
//         Array.isArray(selectedData.captured_image)
//           ? selectedData.captured_image
//           : []
//       ).filter(img => img.camera_label === selectedData.currentCamera);

//       setModalData(selectedData);
//       setImageSrc(getImage(imagesForCamera[0]?.captured_image));
//       setTempIndex(index);
//     }
//   };

//   const filteredData = timeWiseFilterData;

//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;

//   const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

//   if (!dataLoaded) return null;

//   return (
//     <div className='page-content'>
//       <MetaTags>
//         <title>Inspection Result Details</title>
//       </MetaTags>

//       <Breadcrumbs
//         title='INSPECTION RESULT'
//         isBackButtonEnable={true}
//         gotoBack={backButton}
//       />

//       <Container fluid>
//         <Card>
//           <CardBody>
//             <div className='d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-2 mb-2'>
//               <div>
//                 <CardTitle className='mb-0'>
//                   <span className='me-2 font-size-12'>Component Name :</span>
//                   {compName}
//                 </CardTitle>
//                 <CardText className='mb-0'>
//                   <span className='me-2 font-size-12'>Component Code :</span>
//                   {compCode}
//                 </CardText>
//                 <CardText className='mb-0'>
//                   <span className='me-2 font-size-12'>Date:</span> {date}
//                 </CardText>
//               </div>

//               <div className='d-flex align-items-center gap-1'>
//                 <div>
//                   <Select
//                     options={stageOptions}
//                     value={selectedStages}
//                     onChange={onStageSelect}
//                     isMulti
//                     placeholder='Select Stages'
//                     className='custom-select-width'
//                     closeMenuOnSelect={false}
//                   />
//                 </div>

//                 {selectedStages.length > 0 && (
//                   <div>
//                     <Select
//                       options={cameraOptions}
//                       value={selectedCameras}
//                       onChange={onCameraSelect}
//                       isMulti
//                       placeholder='Select Cameras'
//                       className='custom-select-width'
//                     />
//                   </div>
//                 )}
//               </div>

//               <div>
//                 <ButtonGroup className='d-flex flex-wrap flex-lg-nowrap w-100'>
//                   <Button
//                     color='primary'
//                     outline={selectedFilter !== 0}
//                     onClick={() => statusFilter('', 0)}
//                     className='flex-fill text-nowrap px-2 px-lg-3'
//                   >
//                     Total ({okCount + notOkCount + noObjCount + incorrectObj})
//                   </Button>

//                   <Button
//                     color='primary'
//                     outline={selectedFilter !== 1}
//                     onClick={() => statusFilter(positive, 1)}
//                     className='flex-fill text-nowrap px-2 px-lg-3'
//                   >
//                     {configPositive} ({okCount})
//                   </Button>

//                   <Button
//                     color='primary'
//                     outline={selectedFilter !== 2}
//                     onClick={() => statusFilter(negative, 2)}
//                     className='flex-fill text-nowrap px-2 px-lg-3'
//                   >
//                     {configNegative} ({notOkCount})
//                   </Button>

//                   <Button
//                     color='primary'
//                     outline={selectedFilter !== 3}
//                     onClick={() => statusFilter('No Object Found', 3)}
//                     className='flex-fill text-nowrap px-2 px-lg-3'
//                   >
//                     No Object Found ({noObjCount})
//                   </Button>

//                   <Button
//                     color='primary'
//                     outline={selectedFilter !== 4}
//                     onClick={() => statusFilter('Incorrect Object', 4)}
//                     className='flex-fill text-nowrap px-2 px-lg-3'
//                   >
//                     Incorrect Object ({incorrectObj})
//                   </Button>
//                 </ButtonGroup>
//               </div>
//             </div>

//             {filteredData.length === 0 ? (
//               <div className='text-center ' style={{ height: '20vh' }}>
//                 <h5 className='text-secondary '>No Records Found</h5>
//               </div>
//             ) : (
//               <div className='table-responsive'>
//                 <Table
//                   className='table mb-0 align-middle table-nowrap table-check'
//                   bordered
//                 >
//                   <thead className='table-light'>
//                     <tr>
//                       <th>S. No.</th>
//                       <th>Time</th>
//                       <th>Stage Names</th>
//                       <th>Stage Code</th>
//                       <th>Camera</th>
//                       <th>Result</th>
//                       <th>Captured Image</th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {(() => {
//                       let rowSerial = 1;

//                       return currentItems.flatMap((data, dataIndex) => {
//                         const stages = Array.isArray(data.stage_camera_result)
//                           ? data.stage_camera_result
//                           : [];

//                         const images = Array.isArray(data.captured_image)
//                           ? data.captured_image
//                           : [];

//                         return stages.map((stage, stageIndex) => {
//                           const serial = rowSerial++;

//                           const imagesForCamera = images.filter(
//                             img => img.camera_label === stage.camera_label
//                           );

//                           return (
//                             <tr key={`${dataIndex}-${stageIndex}`}>
//                               <td>{serial}</td>

//                               <td>{data.inspected_ontime}</td>

//                               <td>{stage.stage_name || '-'}</td>

//                               <td>{stage.stage_code || '-'}</td>

//                               <td>{stage.camera_label}</td>

//                               <td
//                                 style={{
//                                   color:
//                                     stage.result?.trim().toUpperCase() === 'NG'
//                                       ? 'red'
//                                       : stage.result?.trim().toUpperCase() ===
//                                         'OK'
//                                       ? 'green'
//                                       : 'black'
//                                 }}
//                               >
//                                 {stage.result}
//                               </td>

//                               <td>
//                                 {imagesForCamera.map((imgObj, j) => (
//                                   <img
//                                     key={j}
//                                     src={getImage(imgObj.captured_image)}
//                                     style={{
//                                       width: 'auto',
//                                       height: 100,
//                                       marginRight: 10,
//                                       cursor: 'pointer'
//                                     }}
//                                     onClick={() => {
//                                       setShowModal(true);
//                                       setModalData({
//                                         ...data,
//                                         currentStage: stage,
//                                         currentCamera: stage.camera_label
//                                       });
//                                       setTempIndex(
//                                         indexOfFirstItem +
//                                           currentItems
//                                             .slice(0, dataIndex)
//                                             .reduce((acc, item) => {
//                                               return (
//                                                 acc +
//                                                 (Array.isArray(
//                                                   item.stage_camera_result
//                                                 )
//                                                   ? item.stage_camera_result
//                                                       .length
//                                                   : 0)
//                                               );
//                                             }, 0) +
//                                           stageIndex
//                                       );
//                                       setImageSrc(
//                                         getImage(imgObj.captured_image)
//                                       );
//                                     }}
//                                   />
//                                 ))}
//                               </td>
//                             </tr>
//                           );
//                         });
//                       });
//                     })()}
//                   </tbody>
//                 </Table>

//                 <PaginationComponent
//                   totalItems={filteredData.length}
//                   itemsPerPage={itemsPerPage}
//                   currentPage={currentPage}
//                   onPageChange={setCurrentPage}
//                 />
//               </div>
//             )}
//           </CardBody>
//         </Card>
//       </Container>

//       {/* IMAGE MODAL */}
//       <Modal size='l' isOpen={showModal} centered>
//         <div className='modal-header'>
//           <h5>Image</h5>
//           <Button className='close' onClick={() => setShowModal(false)}>
//             ×
//           </Button>
//         </div>

//         <div className='modal-body'>
//           <div className='text-center'>
//             <img className='img-fluid' src={imageSrc} alt='captured' />
//           </div>

//           <Row className='mt-4'>
//             <Col sm={6}>
//               Component Name: <b>{compName}</b>
//             </Col>

//             <Col sm={6} className='text-end'>
//               Result:
//               <span
//                 style={{
//                   color:
//                     modalData.currentStage?.result?.trim().toUpperCase() ===
//                       'NG' ||
//                     modalData.result === 'No Objects Detected' ||
//                     modalData.result === 'notok'
//                       ? 'red'
//                       : 'green'
//                 }}
//               >
//                 {' '}
//                 <b>{modalData.currentStage?.result || modalData.result}</b>
//               </span>
//             </Col>
//           </Row>

//           <Row>
//             <Col sm={6}>
//               Component Code: <b>{compCode}</b>
//             </Col>

//             <Col sm={6} className='text-end'>
//               Date: <b>{modalData.date}</b> Time:{' '}
//               <b>{modalData.inspected_ontime}</b>
//             </Col>
//           </Row>

//           {modalData.currentStage && (
//             <Row className='mt-2'>
//               <Col sm={6}>
//                 Stage: <b>{modalData.currentStage.stage_name}</b> (
//                 {modalData.currentStage.stage_code})
//               </Col>
//               <Col sm={6} className='text-end'>
//                 Camera: <b>{modalData.currentCamera}</b>
//               </Col>
//             </Row>
//           )}

//           {/* PREV/NEXT BUTTONS */}
//           <Row className='mt-4'>
//             <Col md={6}>
//               {tempIndex !== 0 && <Button onClick={onPrev}>Previous</Button>}
//             </Col>

//             <Col md={6} className='text-end'>
//               {(() => {
//                 const totalRows = filteredData.reduce((acc, item) => {
//                   return (
//                     acc +
//                     (Array.isArray(item.stage_camera_result)
//                       ? item.stage_camera_result.length
//                       : 0)
//                   );
//                 }, 0);
//                 return (
//                   tempIndex < totalRows - 1 && (
//                     <Button onClick={onNext}>Next</Button>
//                   )
//                 );
//               })()}
//             </Col>
//           </Row>
//         </div>

//         <Row>
//           <Col className='text-center'>
//             ({tempIndex + 1} /{' '}
//             {filteredData.reduce((acc, item) => {
//               return (
//                 acc +
//                 (Array.isArray(item.stage_camera_result)
//                   ? item.stage_camera_result.length
//                   : 0)
//               );
//             }, 0)}
//             )
//           </Col>
//         </Row>
//       </Modal>
//     </div>
//   );
// };

//testing

// const Report = ({ history }) => {
//   const [showTable2, setShowTable2] = useState(false);
//   const [tempIndex, setTempIndex] = useState(0);
//   const [filterCompName, setFilterCompName] = useState('');
//   const [filterCompCode, setFilterCompCode] = useState('');
//   const [positive, setPositive] = useState('');
//   const [negative, setNegative] = useState('');
//   const [possibleMatch, setPossibleMatch] = useState('');
//   const [filterDate, setFilterDate] = useState('');
//   const [compName, setCompName] = useState('');
//   const [compCode, setCompCode] = useState('');
//   const [date, setDate] = useState('');
//   const [stationId, setStationId] = useState('');
//   const [okCount, setOkCount] = useState(0);
//   const [notOkCount, setNotOkCount] = useState(0);
//   const [noObjCount, setNoObjCount] = useState(0);
//   const [incorrectObj, setIncorrectObj] = useState(0);

//   const [configPositive, setConfigPositive] = useState('');
//   const [configNegative, setConfigNegative] = useState('');

//   const [dateWiseData, setDateWiseData] = useState(null);
//   const [timeWiseFilterData, setTimeWiseFilterData] = useState([]);

//   // NEW: Store the original unfiltered data
//   const [originalData, setOriginalData] = useState([]);

//   const [dataLoaded, setDataLoaded] = useState(false);

//   const [showModal, setShowModal] = useState(false);
//   const [modalData, setModalData] = useState({});
//   const [imageSrc, setImageSrc] = useState('');

//   const [selectedFilter, setSelectedFilter] = useState(0);

//   // PAGINATION
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   const [stageOptions, setStageOptions] = useState([]);
//   const [cameraOptions, setCameraOptions] = useState([]);

//   const [selectedStages, setSelectedStages] = useState([]);
//   const [selectedCameras, setSelectedCameras] = useState([]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [selectedStages]);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [selectedCameras]);

//   const getStageOptions = data => {
//     const stageMap = new Map();

//     data.forEach(item => {
//       item.stage_camera_result?.forEach(stage => {
//         stageMap.set(stage.stage_code, {
//           label: stage.stage_name,
//           value: stage.stage_code
//         });
//       });
//     });

//     console.log('stageMap.values()', stageMap.values());

//     return Array.from(stageMap.values());
//   };

//   // FIXED: Use originalData instead of timeWiseFilterData for stage options
//   useEffect(() => {
//     if (originalData.length > 0) {
//       const stages = getStageOptions(originalData);
//       console.log('Generated stage options:', stages);

//       // Add "All" option at the beginning
//       const stagesWithAll = [{ label: 'All Stages', value: 'all' }, ...stages];

//       setStageOptions(stagesWithAll);
//     }
//   }, [originalData]);

//   const getCameraOptions = (data, selectedStageValues) => {
//     const cameraMap = new Map();

//     // If "all" is selected, get cameras from all stages
//     const isAllSelected = selectedStageValues.includes('all');

//     data.forEach(item => {
//       item.stage_camera_result?.forEach(stage => {
//         if (isAllSelected || selectedStageValues.includes(stage.stage_code)) {
//           const key = `${stage.stage_code}-${stage.camera_label}`;
//           cameraMap.set(key, {
//             label: stage.camera_label,
//             value: key,
//             stage_code: stage.stage_code
//           });
//         }
//       });
//     });

//     const cameras = Array.from(cameraMap.values());

//     // Add "All" option at the beginning if there are cameras
//     if (cameras.length > 0) {
//       return [{ label: 'All Cameras', value: 'all' }, ...cameras];
//     }

//     return cameras;
//   };

//   const onStageSelect = selected => {
//     console.log('Selected stages:', selected);

//     const stages = selected || [];

//     // Check if "All" is in the new selection
//     const hasAll = stages.some(s => s.value === 'all');
//     const previousHadAll = selectedStages.some(s => s.value === 'all');

//     let finalStages = stages;

//     // If "All" was just selected, keep only "All"
//     if (hasAll && !previousHadAll) {
//       finalStages = stages.filter(s => s.value === 'all');
//     }
//     // If other options are selected while "All" is present, remove "All"
//     else if (hasAll && stages.length > 1) {
//       finalStages = stages.filter(s => s.value !== 'all');
//     }

//     setSelectedStages(finalStages);

//     const stageValues = finalStages.map(s => s.value);
//     console.log('stageValues', stageValues);

//     // FIXED: Use originalData for camera options
//     const cameraList = getCameraOptions(originalData, stageValues);
//     setCameraOptions(cameraList);

//     setSelectedCameras([]);

//     setCurrentPage(1);
//     fetchFilteredData(selectedStatus, selectedLevel, finalStages, []);
//   };

//   const onCameraSelect = selected => {
//     console.log('Selected cameras:', selected);
//     const cameras = selected || [];

//     // Check if "All" is in the new selection
//     const hasAll = cameras.some(c => c.value === 'all');
//     const previousHadAll = selectedCameras.some(c => c.value === 'all');

//     let finalCameras = cameras;

//     // If "All" was just selected, keep only "All"
//     if (hasAll && !previousHadAll) {
//       finalCameras = cameras.filter(c => c.value === 'all');
//     }
//     // If other options are selected while "All" is present, remove "All"
//     else if (hasAll && cameras.length > 1) {
//       finalCameras = cameras.filter(c => c.value !== 'all');
//     }

//     setSelectedCameras(finalCameras);

//     // Auto-apply filter when camera changes
//     setCurrentPage(1);
//     fetchFilteredData(
//       selectedStatus,
//       selectedLevel,
//       selectedStages,
//       finalCameras
//     );
//   };

//   const getImage = data1 => {
//     console.log('dddddddddddddd', data1);
//     if (data1 !== undefined && data1 !== null) {
//       let baseurl =
//         typeof img_url === 'object'
//           ? img_url.url || img_url.baseUrl || ''
//           : img_url;
//       let imagePath = '';

//       if (Array.isArray(data1) && data1.length > 0) {
//         imagePath = data1[0].captured_image;
//         console.log('imagePath_array', imagePath);
//       } else if (typeof data1 === 'string') {
//         imagePath = data1;
//       } else {
//         console.log('Unexpected data format:', data1);
//         return null;
//       }

//       console.log('imagePath', imagePath);
//       console.log('baseurl', baseurl);
//       let replace = imagePath.replace(/\\/g, '/');
//       let output = img_url + replace;
//       console.log('output', output);
//       return output;
//     } else {
//       return null;
//     }
//   };

//   useEffect(() => {
//     const timeData = JSON.parse(sessionStorage.getItem('timeWiseData'));
//     const dateData = JSON.parse(sessionStorage.getItem('dateWiseData'));
//     setDateWiseData(dateData);

//     setOkCount(timeData.ok);
//     setNotOkCount(timeData.notok);
//     setNoObjCount(timeData.no_obj);
//     setIncorrectObj(timeData.incorrect_obj);

//     setConfigPositive(timeData.config_positive);
//     setConfigNegative(timeData.config_negative);

//     fetchLabelData(timeData);
//     fetchTimeWiseFilteredData(timeData);
//   }, []);

//   const fetchLabelData = timeWiseData => {
//     urlSocket
//       .post('/comp_Data', {
//         comp_name: timeWiseData.comp_name,
//         comp_code: timeWiseData.comp_code
//       })
//       .then(res => {
//         console.log('first', res)
//         setPositive(res.data[0].positive);
//         setNegative(res.data[0].negative);
//       })
//       .catch(err => console.log(err));
//   };

//   const fetchTimeWiseFilteredData = timeWiseData => {
//     urlSocket
//       .post('/timeWise_filterData', {
//         comp_name: timeWiseData.comp_name,
//         comp_code: timeWiseData.comp_code,
//         station_id: timeWiseData.station_id,
//         date: timeWiseData.date
//       })
//       .then(response => {
//         const data = response.data;

//         console.log('Fetched time-wise data:', data);

//         // FIXED: Store original data separately
//         setOriginalData(data);
//         setTimeWiseFilterData(data);

//         setCompName(data[0].comp_name);
//         setCompCode(data[0].comp_code);
//         setDate(data[0].date);
//         setStationId(data[0].station_id);
//         setDataLoaded(true);
//         console.log('timewisedata', data);
//       })
//       .catch(error => console.log(error));
//   };

//   const [selectedLevel, setSelectedLevel] = useState('stages');

//   const [selectedStatus, setSelectedStatus] = useState('');

//   const fetchFilteredData = async (
//     status,
//     level,
//     stageFilters = [],
//     cameraFilters = []
//   ) => {
//     try {
//       const requestBody = {
//         comp_name: compName,
//         comp_code: compCode,
//         date,
//         station_id: stationId,
//         result: status,
//         level: level
//       };

//       // Add stage filters if selected (skip if "all" is selected)
//       const hasAllStages = stageFilters.some(s => s.value === 'all');
//       if (stageFilters.length > 0 && !hasAllStages) {
//         requestBody.selected_stages = stageFilters.map(s => s.value);
//       }

//       // Add camera filters if selected (skip if "all" is selected)
//       const hasAllCameras = cameraFilters.some(c => c.value === 'all');
//       if (cameraFilters.length > 0 && !hasAllCameras) {
//         requestBody.selected_cameras = cameraFilters.map(c => c.label);
//       }

//       console.log('Request Body:', requestBody);

//       const response = await urlSocket.post('/result_filterData', requestBody);

//       if (!response.data || response.data.length === 0) {
//         setTimeWiseFilterData([]);
//       } else {
//         setTimeWiseFilterData(response.data);
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const statusFilter = (status, filterValue) => {
//     setSelectedStatus(status);
//     setSelectedFilter(filterValue);
//     setCurrentPage(1);

//     fetchFilteredData(status, selectedLevel, selectedStages, selectedCameras);
//   };

//   const backButton = () => {
//     sessionStorage.setItem(
//       'dateWiseData',
//       JSON.stringify({
//         startDate: dateWiseData.startDate,
//         endDate: dateWiseData.endDate,
//         comp_name: dateWiseData.comp_name,
//         comp_code: dateWiseData.comp_code
//       })
//     );
//     history.push('/inspectResult');
//   };

//   const onNext = () => {
//     // Create flattened array to match table rows
//     const flattenedData = filteredData.flatMap(data => {
//       const stages = Array.isArray(data.stage_camera_result)
//         ? data.stage_camera_result
//         : [];
//       return stages.map(stage => ({
//         ...data,
//         currentStage: stage,
//         currentCamera: stage.camera_label
//       }));
//     });

//     let index = tempIndex + 1;
//     if (index < flattenedData.length) {
//       let selectedData = flattenedData[index];
//       const imagesForCamera = (
//         Array.isArray(selectedData.captured_image)
//           ? selectedData.captured_image
//           : []
//       ).filter(img => img.camera_label === selectedData.currentCamera);

//       setModalData(selectedData);
//       setImageSrc(getImage(imagesForCamera[0]?.captured_image));
//       setTempIndex(index);
//     }
//   };

//   const onPrev = () => {
//     // Create flattened array to match table rows
//     const flattenedData = filteredData.flatMap(data => {
//       const stages = Array.isArray(data.stage_camera_result)
//         ? data.stage_camera_result
//         : [];
//       return stages.map(stage => ({
//         ...data,
//         currentStage: stage,
//         currentCamera: stage.camera_label
//       }));
//     });

//     let index = tempIndex - 1;
//     if (index >= 0) {
//       let selectedData = flattenedData[index];
//       const imagesForCamera = (
//         Array.isArray(selectedData.captured_image)
//           ? selectedData.captured_image
//           : []
//       ).filter(img => img.camera_label === selectedData.currentCamera);

//       setModalData(selectedData);
//       setImageSrc(getImage(imagesForCamera[0]?.captured_image));
//       setTempIndex(index);
//     }
//   };

//   const filteredData = timeWiseFilterData;

//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;

//   const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

//   if (!dataLoaded) return null;

//   return (
//     <div className='page-content'>
//       <MetaTags>
//         <title>Inspection Result Details</title>
//       </MetaTags>

//       <Breadcrumbs
//         title='INSPECTION RESULT'
//         isBackButtonEnable={true}
//         gotoBack={backButton}
//       />

//       <Container fluid>
//         <Card>
//           <CardBody>
//             <div className='d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-2 mb-2'>
//               <div>
//                 <CardTitle className='mb-0'>
//                   <span className='me-2 font-size-12'>Component Name :</span>
//                   {compName}
//                 </CardTitle>
//                 <CardText className='mb-0'>
//                   <span className='me-2 font-size-12'>Component Code :</span>
//                   {compCode}
//                 </CardText>
//                 <CardText className='mb-0'>
//                   <span className='me-2 font-size-12'>Date:</span> {date}
//                 </CardText>
//               </div>

//               <div className='d-flex align-items-center gap-1'>
//                 <div>
//                   <Select
//                     options={stageOptions}
//                     value={selectedStages}
//                     onChange={onStageSelect}
//                     isMulti
//                     placeholder='Select Stages'
//                     className='custom-select-width'
//                     closeMenuOnSelect={false}
//                   />
//                 </div>

//                 {selectedStages.length > 0 && (
//                   <div>
//                     <Select
//                       options={cameraOptions}
//                       value={selectedCameras}
//                       onChange={onCameraSelect}
//                       isMulti
//                       placeholder='Select Cameras'
//                       className='custom-select-width'
//                     />
//                   </div>
//                 )}
//               </div>

//               <div>
//                 <ButtonGroup className='d-flex flex-wrap flex-lg-nowrap w-100'>
//                   <Button
//                     color='primary'
//                     outline={selectedFilter !== 0}
//                     onClick={() => statusFilter('', 0)}
//                     className='flex-fill text-nowrap px-2 px-lg-3'
//                   >
//                     Total ({okCount + notOkCount + noObjCount + incorrectObj})
//                   </Button>

//                   <Button
//                     color='primary'
//                     outline={selectedFilter !== 1}
//                     onClick={() => statusFilter(positive, 1)}
//                     className='flex-fill text-nowrap px-2 px-lg-3'
//                   >
//                     {configPositive} ({okCount})
//                   </Button>

//                   <Button
//                     color='primary'
//                     outline={selectedFilter !== 2}
//                     onClick={() => statusFilter(negative, 2)}
//                     className='flex-fill text-nowrap px-2 px-lg-3'
//                   >
//                     {configNegative} ({notOkCount})
//                   </Button>

//                   <Button
//                     color='primary'
//                     outline={selectedFilter !== 3}
//                     onClick={() => statusFilter('No Object Found', 3)}
//                     className='flex-fill text-nowrap px-2 px-lg-3'
//                   >
//                     No Object Found ({noObjCount})
//                   </Button>

//                   <Button
//                     color='primary'
//                     outline={selectedFilter !== 4}
//                     onClick={() => statusFilter('Incorrect Object', 4)}
//                     className='flex-fill text-nowrap px-2 px-lg-3'
//                   >
//                     Incorrect Object ({incorrectObj})
//                   </Button>
//                 </ButtonGroup>
//               </div>
//             </div>

//             {filteredData.length === 0 ? (
//               <div className='text-center ' style={{ height: '20vh' }}>
//                 <h5 className='text-secondary '>No Records Found</h5>
//               </div>
//             ) : (
//               <div className='table-responsive'>
//                 <Table
//                   className='table mb-0 align-middle table-nowrap table-check'
//                   bordered
//                 >
//                   <thead className='table-light'>
//                     <tr>
//                       <th>S. No.</th>
//                       <th>Time</th>
//                       <th>Stage Names</th>
//                       <th>Stage Code</th>
//                       <th>Camera</th>
//                       <th>Result</th>
//                       <th>Captured Image</th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {(() => {
//                       let rowSerial = 1;

//                       return currentItems.flatMap((data, dataIndex) => {
//                         const stages = Array.isArray(data.stage_camera_result)
//                           ? data.stage_camera_result
//                           : [];

//                         const images = Array.isArray(data.captured_image)
//                           ? data.captured_image
//                           : [];

//                         return stages.map((stage, stageIndex) => {
//                           const serial = rowSerial++;

//                           const imagesForCamera = images.filter(
//                             img => img.camera_label === stage.camera_label
//                           );

//                           return (
//                             <tr key={`${dataIndex}-${stageIndex}`}>
//                               <td>{serial}</td>

//                               <td>{data.inspected_ontime}</td>

//                               <td>{stage.stage_name || '-'}</td>

//                               <td>{stage.stage_code || '-'}</td>

//                               <td>{stage.camera_label}</td>

//                               <td
//                                 style={{
//                                   color:
//                                     stage.result?.trim().toUpperCase() === 'NG'
//                                       ? 'red'
//                                       : stage.result?.trim().toUpperCase() ===
//                                         'OK'
//                                       ? 'green'
//                                       : 'black'
//                                 }}
//                               >
//                                 {stage.result}
//                               </td>

//                               {/* <td>
//                                 {imagesForCamera.map((imgObj, j) => (
//                                   <img
//                                     key={j}
//                                     src={getImage(imgObj.captured_image)}
//                                     style={{
//                                       width: 'auto',
//                                       height: 100,
//                                       marginRight: 10,
//                                       cursor: 'pointer'
//                                     }}
//                                     onClick={() => {
//                                       setShowModal(true);
//                                       setModalData({
//                                         ...data,
//                                         currentStage: stage,
//                                         currentCamera: stage.camera_label
//                                       });
//                                       setTempIndex(
//                                         indexOfFirstItem +
//                                           currentItems
//                                             .slice(0, dataIndex)
//                                             .reduce((acc, item) => {
//                                               return (
//                                                 acc +
//                                                 (Array.isArray(
//                                                   item.stage_camera_result
//                                                 )
//                                                   ? item.stage_camera_result
//                                                       .length
//                                                   : 0)
//                                               );
//                                             }, 0) +
//                                           stageIndex
//                                       );
//                                       setImageSrc(
//                                         getImage(imgObj.captured_image)
//                                       );
//                                     }}
//                                   />
//                                 ))}
//                               </td> */}

//                               <td>
//                                 {images
//                                   .filter(
//                                     img =>
//                                       img.camera_label === stage.camera_label &&
//                                       img.stage_code === stage.stage_code
//                                   )
//                                   .map((imgObj, j) => (
//                                     <img
//                                       key={j}
//                                       src={getImage(imgObj.captured_image)}
//                                       style={{
//                                         width: 'auto',
//                                         height: 100,
//                                         marginRight: 10,
//                                         cursor: 'pointer'
//                                       }}
//                                       onClick={() => {
//                                         setShowModal(true);
//                                         setModalData({
//                                           ...data,
//                                           currentStage: stage,
//                                           currentCamera: stage.camera_label
//                                         });
//                                         setTempIndex(modalIndex);
//                                         setImageSrc(
//                                           getImage(imgObj.captured_image)
//                                         );
//                                       }}
//                                     />
//                                   ))}
//                               </td>
//                             </tr>
//                           );
//                         });
//                       });
//                     })()}
//                   </tbody>
//                 </Table>

//                 <PaginationComponent
//                   totalItems={filteredData.length}
//                   itemsPerPage={itemsPerPage}
//                   currentPage={currentPage}
//                   onPageChange={setCurrentPage}
//                 />
//               </div>
//             )}
//           </CardBody>
//         </Card>
//       </Container>

//       {/* IMAGE MODAL */}
//       <Modal size='l' isOpen={showModal} centered>
//         <div className='modal-header'>
//           <h5>Image</h5>
//           <Button className='close' onClick={() => setShowModal(false)}>
//             ×
//           </Button>
//         </div>

//         <div className='modal-body'>
//           <div className='text-center'>
//             <img className='img-fluid' src={imageSrc} alt='captured' />
//           </div>

//           <Row className='mt-4'>
//             <Col sm={6}>
//               Component Name: <b>{compName}</b>
//             </Col>

//             <Col sm={6} className='text-end'>
//               Result:
//               <span
//                 style={{
//                   color:
//                     modalData.currentStage?.result?.trim().toUpperCase() ===
//                       'NG' ||
//                     modalData.result === 'No Objects Detected' ||
//                     modalData.result === 'notok'
//                       ? 'red'
//                       : 'green'
//                 }}
//               >
//                 {' '}
//                 <b>{modalData.currentStage?.result || modalData.result}</b>
//               </span>
//             </Col>
//           </Row>

//           <Row>
//             <Col sm={6}>
//               Component Code: <b>{compCode}</b>
//             </Col>

//             <Col sm={6} className='text-end'>
//               Date: <b>{modalData.date}</b> Time:{' '}
//               <b>{modalData.inspected_ontime}</b>
//             </Col>
//           </Row>

//           {modalData.currentStage && (
//             <Row className='mt-2'>
//               <Col sm={6}>
//                 Stage: <b>{modalData.currentStage.stage_name}</b> (
//                 {modalData.currentStage.stage_code})
//               </Col>
//               <Col sm={6} className='text-end'>
//                 Camera: <b>{modalData.currentCamera}</b>
//               </Col>
//             </Row>
//           )}

//           {/* PREV/NEXT BUTTONS */}
//           <Row className='mt-4'>
//             <Col md={6}>
//               {tempIndex !== 0 && <Button onClick={onPrev}>Previous</Button>}
//             </Col>

//             <Col md={6} className='text-end'>
//               {(() => {
//                 const totalRows = filteredData.reduce((acc, item) => {
//                   return (
//                     acc +
//                     (Array.isArray(item.stage_camera_result)
//                       ? item.stage_camera_result.length
//                       : 0)
//                   );
//                 }, 0);
//                 return (
//                   tempIndex < totalRows - 1 && (
//                     <Button onClick={onNext}>Next</Button>
//                   )
//                 );
//               })()}
//             </Col>
//           </Row>
//         </div>

//         <Row>
//           <Col className='text-center'>
//             ({tempIndex + 1} /{' '}
//             {filteredData.reduce((acc, item) => {
//               return (
//                 acc +
//                 (Array.isArray(item.stage_camera_result)
//                   ? item.stage_camera_result.length
//                   : 0)
//               );
//             }, 0)}
//             )
//           </Col>
//         </Row>
//       </Modal>
//     </div>
//   );
// };

const Report = ({ history }) => {
  const [showTable2, setShowTable2] = useState(false);
  const [tempIndex, setTempIndex] = useState(0);
  const [filterCompName, setFilterCompName] = useState('');
  const [filterCompCode, setFilterCompCode] = useState('');
  const [positive, setPositive] = useState('');
  const [negative, setNegative] = useState('');
  const [possibleMatch, setPossibleMatch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [compName, setCompName] = useState('');
  const [compCode, setCompCode] = useState('');
  const [date, setDate] = useState('');
  const [stationId, setStationId] = useState('');
  const [okCount, setOkCount] = useState(0);
  const [notOkCount, setNotOkCount] = useState(0);
  const [noObjCount, setNoObjCount] = useState(0);
  const [incorrectObj, setIncorrectObj] = useState(0);

  const [configPositive, setConfigPositive] = useState('');
  const [configNegative, setConfigNegative] = useState('');

  const [dateWiseData, setDateWiseData] = useState(null);
  const [timeWiseFilterData, setTimeWiseFilterData] = useState([]);

  // NEW: Store region results separately
  const [regionResults, setRegionResults] = useState([]);

  const [originalData, setOriginalData] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({});
  const [imageSrc, setImageSrc] = useState('');

  const [selectedFilter, setSelectedFilter] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [stageOptions, setStageOptions] = useState([]);
  const [cameraOptions, setCameraOptions] = useState([]);

  const [selectedStages, setSelectedStages] = useState([]);
  const [selectedCameras, setSelectedCameras] = useState([]);

  const [selectedLevel, setSelectedLevel] = useState('stages');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCameras]);

  const getStageOptions = data => {
    const stageMap = new Map();

    data.forEach(item => {
      item.stage_camera_result?.forEach(stage => {
        stageMap.set(stage.stage_code, {
          label: stage.stage_name,
          value: stage.stage_code
        });
      });
    });

    return Array.from(stageMap.values());
  };

  useEffect(() => {
    if (originalData.length > 0) {
      const stages = getStageOptions(originalData);
      const stagesWithAll = [{ label: 'All Stages', value: 'all' }, ...stages];
      setStageOptions(stagesWithAll);
    }
  }, [originalData]);

  const getCameraOptions = (data, selectedStageValues) => {
    const cameraMap = new Map();
    const isAllSelected = selectedStageValues.includes('all');

    data.forEach(item => {
      item.stage_camera_result?.forEach(stage => {
        if (isAllSelected || selectedStageValues.includes(stage.stage_code)) {
          const key = `${stage.stage_code}-${stage.camera_label}`;
          cameraMap.set(key, {
            label: stage.camera_label,
            value: key,
            stage_code: stage.stage_code
          });
        }
      });
    });

    const cameras = Array.from(cameraMap.values());

    if (cameras.length > 0) {
      return [{ label: 'All Cameras', value: 'all' }, ...cameras];
    }

    return cameras;
  };

  const onStageSelect = selected => {
    const stages = selected || [];
    const hasAll = stages.some(s => s.value === 'all');
    const previousHadAll = selectedStages.some(s => s.value === 'all');

    let finalStages = stages;

    if (hasAll && !previousHadAll) {
      finalStages = stages.filter(s => s.value === 'all');
    } else if (hasAll && stages.length > 1) {
      finalStages = stages.filter(s => s.value !== 'all');
    }

    setSelectedStages(finalStages);

    const stageValues = finalStages.map(s => s.value);
    const cameraList = getCameraOptions(originalData, stageValues);
    setCameraOptions(cameraList);

    setSelectedCameras([]);
    setCurrentPage(1);
    fetchFilteredData(selectedStatus, selectedLevel, finalStages, []);
  };

  const onCameraSelect = selected => {
    const cameras = selected || [];
    const hasAll = cameras.some(c => c.value === 'all');
    const previousHadAll = selectedCameras.some(c => c.value === 'all');

    let finalCameras = cameras;

    if (hasAll && !previousHadAll) {
      finalCameras = cameras.filter(c => c.value === 'all');
    } else if (hasAll && cameras.length > 1) {
      finalCameras = cameras.filter(c => c.value !== 'all');
    }

    setSelectedCameras(finalCameras);
    setCurrentPage(1);
    fetchFilteredData(
      selectedStatus,
      selectedLevel,
      selectedStages,
      finalCameras
    );
  };

  // Helper function to get region results for a specific stage and camera
  const getRegionResultsForStageCamera = (stageCode, cameraLabel) => {
    const matchingRegion = regionResults.find(
      region =>
        region.stage_code === stageCode && region.camera_label === cameraLabel
    );

    return matchingRegion?.region_results || [];
  };

  const getImage = data1 => {
    if (data1 !== undefined && data1 !== null) {
      let baseurl =
        typeof img_url === 'object'
          ? img_url.url || img_url.baseUrl || ''
          : img_url;
      let imagePath = '';

      if (Array.isArray(data1) && data1.length > 0) {
        imagePath = data1[0].captured_image;
      } else if (typeof data1 === 'string') {
        imagePath = data1;
      } else {
        return null;
      }

      let replace = imagePath.replace(/\\/g, '/');
      let output = img_url + replace;
      return output;
    } else {
      return null;
    }
  };

  useEffect(() => {
    const timeData = JSON.parse(sessionStorage.getItem('timeWiseData'));
    const dateData = JSON.parse(sessionStorage.getItem('dateWiseData'));
    setDateWiseData(dateData);

    setOkCount(timeData.ok);
    setNotOkCount(timeData.notok);
    setNoObjCount(timeData.no_obj);
    setIncorrectObj(timeData.incorrect_obj);

    setConfigPositive(timeData.config_positive);
    setConfigNegative(timeData.config_negative);

    fetchLabelData(timeData);
    fetchTimeWiseFilteredData(timeData);
  }, []);

  const fetchLabelData = timeWiseData => {
    urlSocket
      .post('/comp_Data', {
        comp_name: timeWiseData.comp_name,
        comp_code: timeWiseData.comp_code
      })
      .then(res => {
        setPositive(res.data[0].positive);
        setNegative(res.data[0].negative);
      })
      .catch(err => console.log(err));
  };

  const fetchTimeWiseFilteredData = timeWiseData => {
    urlSocket
      .post('/timeWise_filterData', {
        comp_name: timeWiseData.comp_name,
        comp_code: timeWiseData.comp_code,
        station_id: timeWiseData.station_id,
        date: timeWiseData.date
      })
      .then(response => {
        const data = response.data;
        console.log('Response data:', data);

        // FIXED: Handle new data structure with separate arrays
        let inspectResults = [];
        let regionResultsData = [];

        // Check if data has the new structure
        if (data.inspect_result && Array.isArray(data.inspect_result)) {
          inspectResults = data.inspect_result;
          regionResultsData = data.region_results || [];
        } else if (Array.isArray(data)) {
          // Old structure - data is directly an array
          inspectResults = data;
          // Try to get region_results from first item if it exists
          regionResultsData = data[0]?.region_results || [];
        }

        console.log('Inspect Results:', inspectResults);
        console.log('Region Results:', regionResultsData);

        // Store region results separately
        setRegionResults(regionResultsData);

        // Store inspect results
        setOriginalData(inspectResults);
        setTimeWiseFilterData(inspectResults);

        if (inspectResults.length > 0) {
          setCompName(inspectResults[0].comp_name);
          setCompCode(inspectResults[0].comp_code);
          setDate(inspectResults[0].date);
          setStationId(inspectResults[0].station_id);
        }

        setDataLoaded(true);
      })
      .catch(error => console.log(error));
  };

  const fetchFilteredData = async (
    status,
    level,
    stageFilters = [],
    cameraFilters = []
  ) => {
    try {
      const requestBody = {
        comp_name: compName,
        comp_code: compCode,
        date,
        station_id: stationId,
        result: status,
        level: level
      };

      const hasAllStages = stageFilters.some(s => s.value === 'all');
      if (stageFilters.length > 0 && !hasAllStages) {
        requestBody.selected_stages = stageFilters.map(s => s.value);
      }

      const hasAllCameras = cameraFilters.some(c => c.value === 'all');
      if (cameraFilters.length > 0 && !hasAllCameras) {
        requestBody.selected_cameras = cameraFilters.map(c => c.label);
      }

      console.log('Request Body:', requestBody);

      const response = await urlSocket.post('/result_filterData', requestBody);

      // FIXED: Handle response structure
      let filteredResults = [];
      if (response.data) {
        if (
          response.data.inspect_result &&
          Array.isArray(response.data.inspect_result)
        ) {
          filteredResults = response.data.inspect_result;
          // Update region results if they come with filtered data
          if (response.data.region_results) {
            setRegionResults(response.data.region_results);
          }
        } else if (Array.isArray(response.data)) {
          filteredResults = response.data;
        }
      }

      setTimeWiseFilterData(filteredResults);
    } catch (err) {
      console.log(err);
    }
  };

  const statusFilter = (status, filterValue) => {
    setSelectedStatus(status);
    setSelectedFilter(filterValue);
    setCurrentPage(1);
    fetchFilteredData(status, selectedLevel, selectedStages, selectedCameras);
  };

  const backButton = () => {
    sessionStorage.setItem(
      'dateWiseData',
      JSON.stringify({
        startDate: dateWiseData.startDate,
        endDate: dateWiseData.endDate,
        comp_name: dateWiseData.comp_name,
        comp_code: dateWiseData.comp_code
      })
    );
    history.push('/inspectResult');
  };

  const onNext = () => {
    const flattenedData = filteredData.flatMap(data => {
      const stages = Array.isArray(data.stage_camera_result)
        ? data.stage_camera_result
        : [];
      return stages.map(stage => ({
        ...data,
        currentStage: stage,
        currentCamera: stage.camera_label
      }));
    });

    let index = tempIndex + 1;
    if (index < flattenedData.length) {
      let selectedData = flattenedData[index];
      const imagesForCamera = (
        Array.isArray(selectedData.captured_image)
          ? selectedData.captured_image
          : []
      ).filter(img => img.camera_label === selectedData.currentCamera);

      setModalData(selectedData);
      setImageSrc(getImage(imagesForCamera[0]?.captured_image));
      setTempIndex(index);
    }
  };

  const onPrev = () => {
    const flattenedData = filteredData.flatMap(data => {
      const stages = Array.isArray(data.stage_camera_result)
        ? data.stage_camera_result
        : [];
      return stages.map(stage => ({
        ...data,
        currentStage: stage,
        currentCamera: stage.camera_label
      }));
    });

    let index = tempIndex - 1;
    if (index >= 0) {
      let selectedData = flattenedData[index];
      const imagesForCamera = (
        Array.isArray(selectedData.captured_image)
          ? selectedData.captured_image
          : []
      ).filter(img => img.camera_label === selectedData.currentCamera);

      setModalData(selectedData);
      setImageSrc(getImage(imagesForCamera[0]?.captured_image));
      setTempIndex(index);
    }
  };

  // FIXED: Ensure filteredData is always an array
  const filteredData = Array.isArray(timeWiseFilterData)
    ? timeWiseFilterData
    : [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  if (!dataLoaded) return null;

  return (
    <div className='page-content'>
      <Container fluid>
        <Card>
          <CardBody>
            <div className='d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-2 mb-2'>
              <div>
                <CardTitle className='mb-0'>
                  <span className='me-2 font-size-12'>Component Name:</span>
                  {compName}
                </CardTitle>
                <CardText className='mb-0'>
                  <span className='me-2 font-size-12'>Component Code:</span>
                  {compCode}
                </CardText>
                <CardText className='mb-0'>
                  <span className='me-2 font-size-12'>Date:</span> {date}
                </CardText>
              </div>

              <div className='d-flex align-items-center gap-1'>
                <div>
                  <Select
                    options={stageOptions}
                    value={selectedStages}
                    onChange={onStageSelect}
                    isMulti
                    placeholder='Select Stages'
                    className='custom-select-width'
                    closeMenuOnSelect={false}
                  />
                </div>

                {selectedStages.length > 0 && (
                  <div>
                    <Select
                      options={cameraOptions}
                      value={selectedCameras}
                      onChange={onCameraSelect}
                      isMulti
                      placeholder='Select Cameras'
                      className='custom-select-width'
                    />
                  </div>
                )}
              </div>

              <div>
                <ButtonGroup className='d-flex flex-wrap flex-lg-nowrap w-100'>
                  <Button
                    color='primary'
                    outline={selectedFilter !== 0}
                    onClick={() => statusFilter('', 0)}
                    className='flex-fill text-nowrap px-2 px-lg-3'
                  >
                    Total ({okCount + notOkCount + noObjCount + incorrectObj})
                  </Button>

                  <Button
                    color='primary'
                    outline={selectedFilter !== 1}
                    onClick={() => statusFilter(positive, 1)}
                    className='flex-fill text-nowrap px-2 px-lg-3'
                  >
                    {configPositive} ({okCount})
                  </Button>

                  <Button
                    color='primary'
                    outline={selectedFilter !== 2}
                    onClick={() => statusFilter(negative, 2)}
                    className='flex-fill text-nowrap px-2 px-lg-3'
                  >
                    {configNegative} ({notOkCount})
                  </Button>

                  <Button
                    color='primary'
                    outline={selectedFilter !== 3}
                    onClick={() => statusFilter('No Object Found', 3)}
                    className='flex-fill text-nowrap px-2 px-lg-3'
                  >
                    No Object Found ({noObjCount})
                  </Button>

                  <Button
                    color='primary'
                    outline={selectedFilter !== 4}
                    onClick={() => statusFilter('Incorrect Object', 4)}
                    className='flex-fill text-nowrap px-2 px-lg-3'
                  >
                    Incorrect Object ({incorrectObj})
                  </Button>
                </ButtonGroup>
              </div>
            </div>

            {filteredData.length === 0 ? (
              <div className='text-center' style={{ height: '20vh' }}>
                <h5 className='text-secondary'>No Records Found</h5>
              </div>
            ) : (
              <div className='table-responsive'>
                <Table
                  className='table mb-0 align-middle table-nowrap table-check'
                  bordered
                >
                  <thead className='table-light'>
                    <tr>
                      <th>S. No.</th>
                      <th>Time</th>
                      <th>Stage Names</th>
                      <th>Stage Code</th>
                      <th>Camera</th>
                      <th>Result</th>
                      <th>Captured Image</th>
                      <th>Region Result</th>
                      <th>Region Output Images</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(() => {
                      let rowSerial = 1;

                      return currentItems.flatMap((data, dataIndex) => {
                        const stages = Array.isArray(data.stage_camera_result)
                          ? data.stage_camera_result
                          : [];

                        const images = Array.isArray(data.captured_image)
                          ? data.captured_image
                          : [];

                        return stages.map((stage, stageIndex) => {
                          const serial = rowSerial++;

                          const imagesForCamera = images.filter(
                            img =>
                              img.camera_label === stage.camera_label &&
                              img.stage_code === stage.stage_code
                          );

                          // Get region results for this stage and camera
                          const regionResultsForCamera =
                            getRegionResultsForStageCamera(
                              stage.stage_code,
                              stage.camera_label
                            );

                          return (
                            <tr key={`${dataIndex}-${stageIndex}`}>
                              <td>{serial}</td>
                              <td>{data.inspected_ontime}</td>
                              <td>{stage.stage_name || '-'}</td>
                              <td>{stage.stage_code || '-'}</td>
                              <td>{stage.camera_label}</td>
                              <td
                                style={{
                                  color:
                                    stage.result?.trim().toUpperCase() === 'NG'
                                      ? 'red'
                                      : stage.result?.trim().toUpperCase() ===
                                        'OK'
                                        ? 'green'
                                        : 'black'
                                }}
                              >
                                {stage.result}
                              </td>

                              {/* Captured Images */}
                              <td>
                                {imagesForCamera.map((imgObj, j) => (
                                  <img
                                    key={j}
                                    src={getImage(imgObj.captured_image)}
                                    style={{
                                      width: 'auto',
                                      height: 100,
                                      marginRight: 10,
                                      cursor: 'pointer'
                                    }}
                                    onClick={() => {
                                      setShowModal(true);
                                      setModalData({
                                        ...data,
                                        currentStage: stage,
                                        currentCamera: stage.camera_label
                                      });
                                      const modalIndex =
                                        indexOfFirstItem +
                                        currentItems
                                          .slice(0, dataIndex)
                                          .reduce((acc, item) => {
                                            return (
                                              acc +
                                              (Array.isArray(
                                                item.stage_camera_result
                                              )
                                                ? item.stage_camera_result
                                                  .length
                                                : 0)
                                            );
                                          }, 0) +
                                        stageIndex;
                                      setTempIndex(modalIndex);
                                      setImageSrc(
                                        getImage(imgObj.captured_image)
                                      );
                                    }}
                                    alt='captured'
                                  />
                                ))}
                              </td>

                              {/* Region Results */}
                              <td>
                                {regionResultsForCamera.length > 0 ? (
                                  regionResultsForCamera.map((region, idx) => (
                                    <div key={idx} style={{ marginBottom: 5 }}>
                                      <strong>
                                        {region.rectangles?.name || 'Region'}:
                                      </strong>{' '}
                                      <span
                                        style={{
                                          color:
                                            region.result?.toUpperCase() ===
                                              'NG'
                                              ? 'red'
                                              : region.result?.toUpperCase() ===
                                                'OK'
                                                ? 'green'
                                                : 'black',
                                          fontWeight: 'bold'
                                        }}
                                      >
                                        {region.result}
                                      </span>{' '}
                                      ({region.value})
                                    </div>
                                  ))
                                ) : (
                                  <span className='text-muted'>-</span>
                                )}
                              </td>

                              {/* Region Output Images */}
                              <td>
                                {regionResultsForCamera.length > 0 ? (
                                  regionResultsForCamera.map((region, idx) => (
                                    <img
                                      key={idx}
                                      src={getImage(region.output_img)}
                                      style={{
                                        width: 'auto',
                                        height: 100,
                                        marginRight: 10,
                                        marginBottom: 5,
                                        cursor: 'pointer',
                                        border: '1px solid #ddd'
                                      }}
                                      onClick={() => {
                                        setShowModal(true);
                                        setModalData({
                                          ...data,
                                          currentStage: stage,
                                          currentCamera: stage.camera_label,
                                          regionResult: region
                                        });
                                        setImageSrc(
                                          getImage(region.output_img)
                                        );
                                      }}
                                      alt={`region-${region.rectangles?.name}`}
                                    />
                                  ))
                                ) : (
                                  <span className='text-muted'>-</span>
                                )}
                              </td>
                            </tr>
                          );
                        });
                      });
                    })()}
                  </tbody>
                </Table>

                {/* Pagination Component would go here */}
              </div>
            )}
          </CardBody>
        </Card>
      </Container>

      {/* IMAGE MODAL */}
      <Modal size='lg' isOpen={showModal} centered>
        <div className='modal-header'>
          <h5>Image Details</h5>
          <Button className='close' onClick={() => setShowModal(false)}>
            ×
          </Button>
        </div>

        <div className='modal-body'>
          <div className='text-center'>
            <img className='img-fluid' src={imageSrc} alt='captured' />
          </div>

          <Row className='mt-4'>
            <Col sm={6}>
              Component Name: <b>{compName}</b>
            </Col>
            <Col sm={6} className='text-end'>
              Result:
              <span
                style={{
                  color:
                    modalData.currentStage?.result?.trim().toUpperCase() ===
                      'NG' ||
                      modalData.result === 'No Objects Detected' ||
                      modalData.result === 'notok'
                      ? 'red'
                      : 'green'
                }}
              >
                {' '}
                <b>{modalData.currentStage?.result || modalData.result}</b>
              </span>
            </Col>
          </Row>

          <Row>
            <Col sm={6}>
              Component Code: <b>{compCode}</b>
            </Col>
            <Col sm={6} className='text-end'>
              Date: <b>{modalData.date}</b> Time:{' '}
              <b>{modalData.inspected_ontime}</b>
            </Col>
          </Row>

          {modalData.currentStage && (
            <Row className='mt-2'>
              <Col sm={6}>
                Stage: <b>{modalData.currentStage.stage_name}</b> (
                {modalData.currentStage.stage_code})
              </Col>
              <Col sm={6} className='text-end'>
                Camera: <b>{modalData.currentCamera}</b>
              </Col>
            </Row>
          )}

          {modalData.regionResult && (
            <Row className='mt-2'>
              <Col sm={12}>
                <strong>Region:</strong>{' '}
                {modalData.regionResult.rectangles?.name}
                <br />
                <strong>Result:</strong>{' '}
                <span
                  style={{
                    color:
                      modalData.regionResult.result?.toUpperCase() === 'NG'
                        ? 'red'
                        : 'green'
                  }}
                >
                  {modalData.regionResult.result}
                </span>{' '}
                (Value: {modalData.regionResult.value})
              </Col>
            </Row>
          )}

          {/* PREV/NEXT BUTTONS */}
          <Row className='mt-4'>
            <Col md={6}>
              {tempIndex !== 0 && <Button onClick={onPrev}>Previous</Button>}
            </Col>

            <Col md={6} className='text-end'>
              {(() => {
                const totalRows = filteredData.reduce((acc, item) => {
                  return (
                    acc +
                    (Array.isArray(item.stage_camera_result)
                      ? item.stage_camera_result.length
                      : 0)
                  );
                }, 0);
                return (
                  tempIndex < totalRows - 1 && (
                    <Button onClick={onNext}>Next</Button>
                  )
                );
              })()}
            </Col>
          </Row>
        </div>

        <Row>
          <Col className='text-center'>
            ({tempIndex + 1} /{' '}
            {filteredData.reduce((acc, item) => {
              return (
                acc +
                (Array.isArray(item.stage_camera_result)
                  ? item.stage_camera_result.length
                  : 0)
              );
            }, 0)}
            )
          </Col>
        </Row>
      </Modal>
    </div>
  );
};


Report.propTypes = {
  history: PropTypes.any.isRequired
};

export default Report;
