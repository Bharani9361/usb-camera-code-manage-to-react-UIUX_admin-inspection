import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import PropTypes from 'prop-types';
import {
  Col,
  Container,
  Row,
  CardTitle,
  Button,
  Table,
  CardText,
  ButtonGroup,
  Card,
  CardBody,
  Modal,
  ModalBody
} from 'reactstrap';
import { useHistory } from 'react-router-dom';
import PaginationComponent from './PaginationComponent';
import Breadcrumbs from 'components/Common/Breadcrumb';
import urlSocket from '../AdminInspection/urlSocket';
import { image_url } from '../AdminInspection/imageUrl';
import Select from 'react-select';

let ImageUrl = image_url;

// const TimeWiseReport = () => {
//   const history = useHistory();

//   // State management
//   const [showTable2, setShowTable2] = useState(false);
//   const [tbIndex, setTbIndex] = useState(0);
//   const [temp_index, setTempIndex] = useState(0);
//   const [filter_comp_name, setFilterCompName] = useState('');
//   const [filter_comp_code, setFilterCompCode] = useState('');
//   const [config_positive, setConfigPositive] = useState('');
//   const [config_negative, setConfigNegative] = useState('');
//   const [config_posble_match, setConfigPosbleMatch] = useState('');
//   const [positive, setPositive] = useState('');
//   const [negative, setNegative] = useState('');
//   const [posble_match, setPosbleMatch] = useState('');
//   const [filter_date, setFilterDate] = useState('');
//   const [comp_name, setCompName] = useState('');
//   const [comp_code, setCompCode] = useState('');
//   const [date, setDate] = useState('');
//   const [okCount, setOkCount] = useState('');
//   const [notokCount, setNotokCount] = useState('');
//   const [totalCount, setTotalCount] = useState('');
//   const [posblMatchCount, setPosblMatchCount] = useState('');
//   const [no_objCount, setNoObjCount] = useState('');
//   const [inc_objCount, setIncObjCount] = useState('');
//   const [station_name, setStationName] = useState('');
//   const [station_id, setStationId] = useState('');
//   const [dateWiseData, setDateWiseData] = useState([]);
//   const [timeWise_filterdata, setTimeWiseFilterdata] = useState([]);
//   const [dataloaded, setDataloaded] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [modal_data, setModalData] = useState({});
//   const [timeWiseData, setTimeWiseData] = useState([]);
//   const [image_src, setImageSrc] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);
//   const [selectedFilter, setSelectedFilter] = useState(0);

//   // Error handler
//   const error_handler = error => {
//     sessionStorage.removeItem('authUser');
//     history.push('/login');
//   };

//   const getImage = output_img => {
//     console.log('output_img', output_img);
//     if (!output_img) return '';

//     let pathToUse = '';

//     // If string, use directly
//     if (typeof output_img === 'string') {
//       pathToUse = output_img.replace(/\\/g, '/'); // convert backslashes
//     }

//     if (!pathToUse) return '';

//     // Remove leading 'Vs_inspection/' if it exists
//     pathToUse = pathToUse.replace(/^Vs_inspection\//, '');

//     const finalUrl = `${image_url}${pathToUse}?t=${Date.now()}`;
//     console.log('finalUrl', finalUrl);
//     return finalUrl;
//   };

//   const compListAPICall = async timeWiseData => {
//     console.log('timeWiseData', timeWiseData);
//     const filter_comp_name = timeWiseData.comp_name;
//     console.log('filter_comp_name', filter_comp_name);
//     const filter_comp_code = timeWiseData.comp_code;
//     const filter_date = timeWiseData.date;
//     const station_id = timeWiseData.station_id;

//     try {
//       const response = await urlSocket.post(
//         '/tWise_filterData',
//         {
//           comp_name: filter_comp_name,
//           comp_code: filter_comp_code,
//           date: filter_date,
//           station_id: station_id
//         },
//         { mode: 'no-cors' }
//       );

//       const data = response.data;
//       console.log('timewisedata', data);

//       if (data.error === 'Tenant not found') {
//         console.log('data error', data.error);
//         error_handler(data.error);
//       } else {
//         console.log('timeWise_filterdata95', data);
//         const comp_name = data[0].comp_name;
//         const comp_code = data[0].comp_code;
//         const Date = data[0].date;
//         const result = data[0].result;
//         const station_name = data[0].station_name;
//         const station_id = data[0].station_id;

//         console.log('Result', result);
//         console.log('CompNam...', comp_name);

//         setTimeWiseFilterdata(data);
//         setCompName(comp_name);
//         setCompCode(comp_code);
//         setDate(Date);
//         setStationName(station_name);
//         setStationId(station_id);
//         setDataloaded(true);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   // Fetch label data
//   const labelData = async timeWiseData => {
//     console.log('timeWiseData113', timeWiseData);

//     try {
//       const response = await urlSocket.post(
//         '/comp_Data',
//         {
//           comp_name: timeWiseData.comp_name,
//           comp_code: timeWiseData.comp_code
//         },
//         { mode: 'no-cors' }
//       );

//       const data = response.data;

//       if (data.error === 'Tenant not found') {
//         console.log('data error', data.error);
//         error_handler(data.error);
//       } else {
//         console.log('Comp_data', data);
//         setPositive(data[0].positive);
//         setNegative(data[0].negative);
//         setPosbleMatch(data[0].posble_match);
//         setDataloaded(true);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   // Filter by status
//   const status_filter = async (status, filterValue) => {
//     setSelectedFilter(filterValue);

//     let currentStationId = station_id;
//     console.log('139', currentStationId);

//     if (currentStationId === undefined) {
//       currentStationId = '';
//     }

//     try {
//       const response = await urlSocket.post(
//         '/label_filterData',
//         {
//           comp_name: comp_name,
//           comp_code: comp_code,
//           date: date,
//           result: status,
//           station_id: currentStationId
//         },
//         { mode: 'no-cors' }
//       );

//       const filtered_data = response.data;

//       if (filtered_data.error === 'Tenant not found') {
//         console.log('data error', filtered_data.error);
//         error_handler(filtered_data.error);
//       } else {
//         console.log('152', filtered_data);
//         setTimeWiseFilterdata(filtered_data);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   // Back button handler
//   const backButton = () => {
//     const data = {
//       startDate: dateWiseData.startDate,
//       endDate: dateWiseData.endDate,
//       comp_name: dateWiseData.comp_name,
//       comp_code: dateWiseData.comp_code
//     };

//     console.log('data', data);
//     sessionStorage.removeItem('dateWiseData');
//     sessionStorage.setItem('dateWiseData', JSON.stringify(data));
//     history.push('/station_report');
//   };

//   const flatStageList = React.useMemo(() => {
//     const list = [];
//     timeWise_filterdata.forEach(data => {
//       (data.captured_image || []).forEach(imgObj => {
//         list.push({
//           ...data,
//           ...imgObj,
//           image: imgObj.captured_image
//         });
//       });
//     });
//     return list;
//   }, [timeWise_filterdata]);

//   const onGotoNxtImg = () => {
//     try {
//       const next = temp_index + 1;
//       const selectedData = flatStageList[next];

//       if (!selectedData) return; // boundary protection

//       setModalData(selectedData);
//       setImageSrc(getImage(selectedData.image));
//       setTempIndex(next);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   const onGotoPrevImg = () => {
//     try {
//       const prev = temp_index - 1;
//       const selectedData = flatStageList[prev];

//       if (!selectedData) return; // protection

//       setModalData(selectedData);
//       setImageSrc(getImage(selectedData.image));
//       setTempIndex(prev);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   //   // Navigate to next image
//   //   const onGotoNxtImg = () => {
//   //     try {
//   //       const index = temp_index + 1;
//   //       const allData = timeWise_filterdata;
//   //       console.log(index, allData);
//   //       const selectedData = allData[index];

//   //       const image_src = getImage(selectedData.captured_image);

//   //       setModalData(selectedData);
//   //       setImageSrc(image_src);
//   //       setTempIndex(index);
//   //     } catch (error) {
//   //       console.log(error);
//   //     }
//   //   };

//   //   // Navigate to previous image
//   //   const onGotoPrevImg = () => {
//   //     try {
//   //       const index = temp_index - 1;
//   //       const allData = timeWise_filterdata;
//   //       console.log(index, allData);
//   //       const selectedData = allData[index];

//   //       const image_src = getImage(selectedData.captured_image);

//   //       setModalData(selectedData);
//   //       setImageSrc(image_src);
//   //       setTempIndex(index);
//   //     } catch (error) {
//   //       console.log(error);
//   //     }
//   //   };

//   // Handle page change
//   const handlePageChange = pageNumber => {
//     setCurrentPage(pageNumber);
//   };

//   // ComponentDidMount equivalent
//   useEffect(() => {
//     const db_info = JSON.parse(localStorage.getItem('db_info'));
//     ImageUrl = `${image_url}${db_info?.db_name}/`;

//     const timeWiseData = JSON.parse(sessionStorage.getItem('timeWiseData'));
//     const dateWiseData = JSON.parse(sessionStorage.getItem('dateWiseData'));

//     console.log('dateWiseData', dateWiseData);
//     console.log('comp_name', timeWiseData);

//     const ok_Count = timeWiseData.ok;
//     const notok_Count = timeWiseData.notok;
//     const total_Count = timeWiseData.total;
//     const posblMatch_Count = timeWiseData.posbl_match;
//     const noobj_Count = timeWiseData.no_obj;
//     const incobj_Count = timeWiseData.incorrect_obj;
//     const station_id = timeWiseData.station_id;

//     console.log('station_id78', station_id);

//     setTimeWiseData(timeWiseData);
//     setStationId(station_id);
//     setDateWiseData(dateWiseData);
//     setOkCount(ok_Count);
//     setNotokCount(notok_Count);
//     setTotalCount(total_Count);
//     setPosblMatchCount(posblMatch_Count);
//     setNoObjCount(noobj_Count);
//     setIncObjCount(incobj_Count);
//     setConfigPositive(timeWiseData.config_positive);
//     setConfigNegative(timeWiseData.config_negative);
//     setConfigPosbleMatch(timeWiseData.config_posble_match);

//     labelData(timeWiseData);
//     compListAPICall(timeWiseData);
//   }, []);

//   // Pagination calculations
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = timeWise_filterdata.slice(
//     indexOfFirstItem,
//     indexOfLastItem
//   );

//   if (!dataloaded) {
//     return null;
//   }

//   return (
//     <React.Fragment>
//       <div className='page-content'>
//         <MetaTags>
//           <title>Inspection Result Details</title>
//         </MetaTags>
//         <Breadcrumbs
//           title='TIMEWISE REPORT'
//           isBackButtonEnable={true}
//           gotoBack={backButton}
//         />
//         <Container fluid>
//           <Card>
//             <CardBody>
//               <Row className='d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-2 mb-2'>
//                 <Col xs='12' lg='auto' className='text-left'>
//                   <CardTitle className='mb-0'>
//                     <span className='me-2 font-size-12'>Component Name :</span>
//                     {comp_name}
//                   </CardTitle>
//                   <CardText className='mb-0'>
//                     <span className='me-2 font-size-12'>Component Code :</span>
//                     {comp_code}
//                   </CardText>
//                   <CardText className='mb-0'>
//                     <span className='me-2 font-size-12'>Date:</span>
//                     {date}
//                   </CardText>
//                 </Col>

//                 <Col xs='12' lg='auto' className='text-center'>
//                   <ButtonGroup>
//                     <Button
//                       className='btn btn-sm w-md text-center'
//                       color='primary'
//                       outline={selectedFilter !== 0}
//                       onClick={() => status_filter('', 0)}
//                     >
//                       Total {'('}{' '}
//                       {okCount +
//                         notokCount +
//                         posblMatchCount +
//                         no_objCount +
//                         inc_objCount}{' '}
//                       {')'}
//                     </Button>
//                     <Button
//                       className='btn btn-sm w-md text-center'
//                       color='primary'
//                       outline={selectedFilter !== 1}
//                       onClick={() => status_filter(positive, 1)}
//                     >
//                       {config_positive} {'('} {okCount} {')'}
//                     </Button>
//                     <Button
//                       className='btn btn-sm w-md text-center'
//                       color='primary'
//                       outline={selectedFilter !== 2}
//                       onClick={() => status_filter(negative, 2)}
//                     >
//                       {config_negative} {'('} {notokCount} {')'}
//                     </Button>
//                     <Button
//                       className='btn btn-sm w-md text-center'
//                       color='primary'
//                       outline={selectedFilter !== 3}
//                       onClick={() => status_filter('No Object Found', 3)}
//                     >
//                       No object found {'('} {no_objCount} {')'}
//                     </Button>
//                     <Button
//                       className='btn btn-sm w-md text-center'
//                       color='primary'
//                       outline={selectedFilter !== 4}
//                       onClick={() => status_filter('Incorrect Object', 4)}
//                     >
//                       Incorrect Object {'('} {inc_objCount} {')'}
//                     </Button>
//                   </ButtonGroup>
//                 </Col>
//               </Row>
//               {timeWise_filterdata.length === 0 ? (
//                 <div
//                   className='container'
//                   style={{ position: 'relative', height: '20vh' }}
//                 >
//                   <div
//                     className='text-center'
//                     style={{
//                       position: 'absolute',
//                       top: '50%',
//                       left: '50%',
//                       transform: 'translate(-50%, -50%)'
//                     }}
//                   >
//                     <h5 className='text-secondary'>No Records Found</h5>
//                   </div>
//                 </div>
//               ) : (
//                 <div className='table-responsive'>
//                   <Table
//                     className='table mb-0 align-middle table-nowrap table-check'
//                     bordered
//                   >
//                     {/* <thead className='table-light'>
//                       <tr>
//                         <th>S. No.</th>
//                         <th>Time</th>
//                         <th>Station Name</th>
//                         <th>Result</th>
//                         <th>Captured Image</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {currentItems.map((data, index) => (
//                         <tr key={index}>
//                           <td className='bg-white'>
//                             {index + 1 + (currentPage - 1) * 10}
//                           </td>
//                           <td className='bg-white'>{data.inspected_ontime}</td>
//                           <td className='bg-white'>{data.station_name}</td>
//                           <td className='bg-white'>{data.result}</td>
//                           <td className='bg-white'>
//                             <img
//                               onClick={() => {
//                                 setShowModal(true);
//                                 setModalData(data);
//                                 setTempIndex(index + (currentPage - 1) * 10);
//                                 setImageSrc(getImage(data.captured_image));
//                               }}
//                               style={{
//                                 width: 'auto',
//                                 height: 100,
//                                 cursor: 'pointer'
//                               }}
//                               src={getImage(data.captured_image)}
//                               alt='Component'
//                             />
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody> */}

//                     <thead className='table-light'>
//                       <tr>
//                         <th>S. No.</th>
//                         <th>Time</th>
//                         <th>Station Name</th>
//                         <th>Result</th>
//                         <th>Stage Name</th>
//                         <th>Stage Code</th>
//                         <th>Camera Label</th>
//                         <th>Captured Image</th>
//                       </tr>
//                     </thead>
//                     {/* <tbody>
//                       {currentItems.map((data, index) => {

//                         return data.captured_image.map((imgObj, imgIndex) => (
//                           <tr key={`${index}-${imgIndex}`}>

//                             <td className='bg-white'>
//                               {index * data.captured_image.length +
//                                 imgIndex +
//                                 1 +
//                                 (currentPage - 1) * 10}
//                             </td>
//                             <td className='bg-white'>
//                               {data.inspected_ontime}
//                             </td>
//                             <td className='bg-white'>{data.station_name}</td>
//                             <td className='bg-white'>{data.result}</td>
//                             <td className='bg-white'>{imgObj.stage_name}</td>
//                             <td className='bg-white'>{imgObj.stage_code}</td>
//                             <td className='bg-white'>{imgObj.camera_label}</td>
//                             <td className='bg-white'>
//                               <img
//                                 onClick={() => {
//                                   setShowModal(true);
//                                   setModalData(data);
//                                   setTempIndex(

//                                     index * data.captured_image.length +
//                                       imgIndex +
//                                       1 +
//                                       (currentPage - 1) * itemsPerPage
//                                   );
//                                   setImageSrc(getImage(imgObj.captured_image));
//                                 }}
//                                 style={{
//                                   width: 'auto',
//                                   height: 100,
//                                   cursor: 'pointer'
//                                 }}
//                                 src={getImage(imgObj.captured_image)}
//                                 alt='Component'
//                               />
//                             </td>
//                           </tr>
//                         ));
//                       })}
//                     </tbody> */}

//                     <tbody>
//                       {(() => {
//                         let rowSerial = indexOfFirstItem + 1; // continuous numbering across pages
//                         let flatIndex = indexOfFirstItem; // continuous flat index for modal

//                         return currentItems.flatMap((data, dataIndex) => {
//                           const stages = Array.isArray(data.captured_image)
//                             ? data.captured_image
//                             : [];

//                           return stages.map((imgObj, stageIndex) => {
//                             console.log('imgObj', imgObj);
//                             const serial = rowSerial++; // shown in table
//                             const modalIndex = flatIndex++; // used for modal navigation

//                             return (
//                               <tr key={`${dataIndex}-${stageIndex}`}>
//                                 {/* SERIAL */}
//                                 <td className='bg-white'>{serial}</td>

//                                 {/* TIME */}
//                                 <td className='bg-white'>
//                                   {data.inspected_ontime}
//                                 </td>

//                                 {/* STATION */}
//                                 <td className='bg-white'>
//                                   {data.station_name}
//                                 </td>

//                                 {/* RESULT */}
//                                 <td className='bg-white'>{data.result}</td>

//                                 {/* STAGE */}
//                                 <td className='bg-white'>
//                                   {imgObj.stage_name}
//                                 </td>

//                                 {/* STAGE CODE */}
//                                 <td className='bg-white'>
//                                   {imgObj.stage_code}
//                                 </td>

//                                 {/* CAMERA */}
//                                 <td className='bg-white'>
//                                   {imgObj.camera_label}
//                                 </td>

//                                 {/* IMAGE */}
//                                 <td className='bg-white'>
//                                   <img
//                                     src={getImage(imgObj.captured_image)}
//                                     style={{
//                                       width: 'auto',
//                                       height: 100,
//                                       cursor: 'pointer'
//                                     }}
//                                     onClick={() => {
//                                       setShowModal(true);
//                                       setModalData({
//                                         ...data,
//                                         currentStage: imgObj.stage_name,
//                                         currentCamera: imgObj.camera_label
//                                       });

//                                       // IMPORTANT: modal index must be continuous (flat index)
//                                       setTempIndex(modalIndex);

//                                       setImageSrc(
//                                         getImage(imgObj.captured_image)
//                                       );
//                                     }}
//                                     alt='Component'
//                                   />
//                                 </td>
//                               </tr>
//                             );
//                           });
//                         });
//                       })()}
//                     </tbody>
//                   </Table>
//                   <PaginationComponent
//                     totalItems={timeWise_filterdata.length}
//                     itemsPerPage={itemsPerPage}
//                     currentPage={currentPage}
//                     onPageChange={handlePageChange}
//                   />
//                 </div>
//               )}
//             </CardBody>
//           </Card>
//         </Container>

//         <Modal
//           title='Image'
//           centered
//           isOpen={showModal}
//           toggle={() => setShowModal(false)}
//           size='lg'
//         >
//           <div className='modal-header'>
//             <h5>Image</h5>
//             <Button
//               onClick={() => setShowModal(false)}
//               type='button'
//               className='close mt-1'
//               data-dismiss='modal'
//               aria-label='Close'
//             >
//               <span aria-hidden='true'>&times;</span>
//             </Button>
//           </div>
//           <ModalBody>
//             <div className='text-center'>
//               <img
//                 src={image_src}
//                 alt='Component'
//                 className='img-fluid'
//                 style={{ maxWidth: '100%', height: 'auto' }}
//               />
//             </div>

//             <Row className='mt-3'>
//               <Col md={6} className='text-start'>
//                 Component Name: <b>{comp_name}</b>
//               </Col>
//               <Col md={6} className='text-end'>
//                 Result:
//                 <span
//                   style={{
//                     color:
//                       modal_data.result === 'No Object Found' ||
//                       modal_data.result === 'notok'
//                         ? 'red'
//                         : modal_data.result === 'Possible Match'
//                         ? 'orange'
//                         : 'green'
//                   }}
//                 >
//                   {' '}
//                   {modal_data.result}
//                 </span>
//               </Col>
//             </Row>

//             <Row>
//               <Col md={6} className='text-start'>
//                 Component Code: <b>{comp_code}</b>
//               </Col>
//               <Col md={6} className='text-end'>
//                 Date: <b>{modal_data.date} </b>
//                 Time: <b>{modal_data.inspected_ontime}</b>
//               </Col>
//             </Row>

//             <Row>
//               <Col md={6} className='text-start'>
//                 {temp_index !== 0 && (
//                   <Button color='primary' onClick={onGotoPrevImg}>
//                     Previous
//                   </Button>
//                 )}
//               </Col>
//               <Col md={6} className='text-end'>
//                 {timeWise_filterdata.length !== temp_index + 1 && (
//                   <Button color='primary' onClick={onGotoNxtImg}>
//                     Next
//                   </Button>
//                 )}
//               </Col>
//             </Row>

//             <Row>
//               <Col md={12} className='text-center'>
//                 ({temp_index + 1} / {timeWise_filterdata.length})
//               </Col>
//             </Row>
//           </ModalBody>
//         </Modal>
//       </div>
//     </React.Fragment>
//   );
// };

const TimeWiseReport = () => {
  const history = useHistory();

  // State management
  const [showTable2, setShowTable2] = useState(false);
  const [tbIndex, setTbIndex] = useState(0);
  const [temp_index, setTempIndex] = useState(0);
  const [filter_comp_name, setFilterCompName] = useState('');
  const [filter_comp_code, setFilterCompCode] = useState('');
  const [config_positive, setConfigPositive] = useState('');
  const [config_negative, setConfigNegative] = useState('');
  const [config_posble_match, setConfigPosbleMatch] = useState('');
  const [positive, setPositive] = useState('');
  const [negative, setNegative] = useState('');
  const [posble_match, setPosbleMatch] = useState('');
  const [filter_date, setFilterDate] = useState('');
  const [comp_name, setCompName] = useState('');
  const [comp_code, setCompCode] = useState('');
  const [date, setDate] = useState('');
  const [okCount, setOkCount] = useState('');
  const [notokCount, setNotokCount] = useState('');
  const [totalCount, setTotalCount] = useState('');
  const [posblMatchCount, setPosblMatchCount] = useState('');
  const [no_objCount, setNoObjCount] = useState('');
  const [inc_objCount, setIncObjCount] = useState('');
  const [station_name, setStationName] = useState('');
  const [station_id, setStationId] = useState('');
  const [dateWiseData, setDateWiseData] = useState([]);
  const [timeWise_filterdata, setTimeWiseFilterdata] = useState([]);

  // NEW: Store original unfiltered data
  const [originalData, setOriginalData] = useState([]);

  const [dataloaded, setDataloaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modal_data, setModalData] = useState({});
  const [timeWiseData, setTimeWiseData] = useState([]);
  const [image_src, setImageSrc] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedFilter, setSelectedFilter] = useState(0);

  // NEW: Stage and Camera filter states
  const [stageOptions, setStageOptions] = useState([]);
  const [cameraOptions, setCameraOptions] = useState([]);
  const [selectedStages, setSelectedStages] = useState([]);
  const [selectedCameras, setSelectedCameras] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('stages');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCameras]);

  // Error handler
  const error_handler = error => {
    sessionStorage.removeItem('authUser');
    history.push('/login');
  };

  const getImage = output_img => {
    console.log('output_img', output_img);
    if (!output_img) return '';

    let pathToUse = '';

    // If string, use directly
    if (typeof output_img === 'string') {
      pathToUse = output_img.replace(/\\/g, '/');
    }

    if (!pathToUse) return '';

    // Remove leading 'Vs_inspection/' if it exists
    pathToUse = pathToUse.replace(/^Vs_inspection\//, '');

    const finalUrl = `${image_url}${pathToUse}?t=${Date.now()}`;
    console.log('finalUrl', finalUrl);
    return finalUrl;
  };

  // Extract stage options from data
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

    console.log('stageMap.values()', stageMap.values());
    return Array.from(stageMap.values());
  };

  // Generate stage options when original data loads
  useEffect(() => {
    if (originalData.length > 0) {
      const stages = getStageOptions(originalData);
      console.log('Generated stage options:', stages);

      // Add "All" option at the beginning
      const stagesWithAll = [{ label: 'All Stages', value: 'all' }, ...stages];
      setStageOptions(stagesWithAll);
    }
  }, [originalData]);

  // Extract camera options based on selected stages
  const getCameraOptions = (data, selectedStageValues) => {
    const cameraMap = new Map();

    // If "all" is selected, get cameras from all stages
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

    // Add "All" option at the beginning if there are cameras
    if (cameras.length > 0) {
      return [{ label: 'All Cameras', value: 'all' }, ...cameras];
    }

    return cameras;
  };

  // Handle stage selection
  const onStageSelect = selected => {
    console.log('Selected stages:', selected);

    const stages = selected || [];

    // Check if "All" is in the new selection
    const hasAll = stages.some(s => s.value === 'all');
    const previousHadAll = selectedStages.some(s => s.value === 'all');

    let finalStages = stages;

    // If "All" was just selected, keep only "All"
    if (hasAll && !previousHadAll) {
      finalStages = stages.filter(s => s.value === 'all');
    }
    // If other options are selected while "All" is present, remove "All"
    else if (hasAll && stages.length > 1) {
      finalStages = stages.filter(s => s.value !== 'all');
    }

    setSelectedStages(finalStages);

    const stageValues = finalStages.map(s => s.value);
    console.log('stageValues', stageValues);

    // Generate camera options based on selected stages
    const cameraList = getCameraOptions(originalData, stageValues);
    setCameraOptions(cameraList);

    // Reset camera selection
    setSelectedCameras([]);

    setCurrentPage(1);
    fetchFilteredData(selectedStatus, selectedLevel, finalStages, []);
  };

  // Handle camera selection
  const onCameraSelect = selected => {
    console.log('Selected cameras:', selected);
    const cameras = selected || [];

    // Check if "All" is in the new selection
    const hasAll = cameras.some(c => c.value === 'all');
    const previousHadAll = selectedCameras.some(c => c.value === 'all');

    let finalCameras = cameras;

    // If "All" was just selected, keep only "All"
    if (hasAll && !previousHadAll) {
      finalCameras = cameras.filter(c => c.value === 'all');
    }
    // If other options are selected while "All" is present, remove "All"
    else if (hasAll && cameras.length > 1) {
      finalCameras = cameras.filter(c => c.value !== 'all');
    }

    setSelectedCameras(finalCameras);

    // Auto-apply filter when camera changes
    setCurrentPage(1);
    fetchFilteredData(
      selectedStatus,
      selectedLevel,
      selectedStages,
      finalCameras
    );
  };

  const compListAPICall = async timeWiseData => {
    console.log('timeWiseData', timeWiseData);
    const filter_comp_name = timeWiseData.comp_name;
    console.log('filter_comp_name', filter_comp_name);
    const filter_comp_code = timeWiseData.comp_code;
    const filter_date = timeWiseData.date;
    const station_id = timeWiseData.station_id;

    try {
      const response = await urlSocket.post(
        '/tWise_filterData',
        {
          comp_name: filter_comp_name,
          comp_code: filter_comp_code,
          date: filter_date,
          station_id: station_id
        },
        { mode: 'no-cors' }
      );

      const data = response.data;
      console.log('timewisedata', data);

      if (data.error === 'Tenant not found') {
        console.log('data error', data.error);
        error_handler(data.error);
      } else {
        console.log('timeWise_filterdata95', data);
        const comp_name = data[0].comp_name;
        const comp_code = data[0].comp_code;
        const Date = data[0].date;
        const result = data[0].result;
        const station_name = data[0].station_name;
        const station_id = data[0].station_id;

        console.log('Result', result);
        console.log('CompNam...', comp_name);

        // Store both original and filtered data
        setOriginalData(data);
        setTimeWiseFilterdata(data);
        setCompName(comp_name);
        setCompCode(comp_code);
        setDate(Date);
        setStationName(station_name);
        setStationId(station_id);
        setDataloaded(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch label data
  // const labelData = async timeWiseData => {
  //   console.log('timeWiseData113', timeWiseData);

  //   try {
  //     const response = await urlSocket.post(
  //       '/comp_Data',
  //       {
  //         comp_name: timeWiseData.comp_name,
  //         comp_code: timeWiseData.comp_code
  //       },
  //       { mode: 'no-cors' }
  //     );

  //     const data = response.data;
  //     console.log('labeldataresponse', data);

  //     if (data.error === 'Tenant not found') {
  //       console.log('data error', data.error);
  //       error_handler(data.error);
  //     } else {
  //       console.log('Comp_data', data);
  //       setPositive(data[0].positive);
  //       setNegative(data[0].negative);
  //       setPosbleMatch(data[0].posble_match);
  //       setDataloaded(true);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const labelData = async timeWiseData => {
    console.log('timeWiseData113', timeWiseData);

    try {
      const response = await urlSocket.post(
        '/comp_Data',
        {
          comp_name: timeWiseData.comp_name,
          comp_code: timeWiseData.comp_code
        },
        { mode: 'no-cors' }
      );

      const data = response.data;
      console.log('labeldataresponse', data);

      if (data.error === 'Tenant not found') {
        console.log('data error', data.error);
        error_handler(data.error);
        return;
      }

      console.log('Comp_data', data);

      // FIXED: Map real keys properly
      setPositive(data[0].ok);
      setNegative(data[0].notok);
      setPosbleMatch(data[0].posbl_match);

      setDataloaded(true);
    } catch (error) {
      console.log(error);
    }
  };

  // NEW: Fetch filtered data with stage and camera filters
  const fetchFilteredData = async (
    status,
    level,
    stageFilters = [],
    cameraFilters = []
  ) => {
    try {
      const requestBody = {
        comp_name: comp_name,
        comp_code: comp_code,
        date: date,
        station_id: station_id,
        result: status,
        level: level
      };

      // Add stage filters if selected (skip if "all" is selected)
      const hasAllStages = stageFilters.some(s => s.value === 'all');
      if (stageFilters.length > 0 && !hasAllStages) {
        requestBody.selected_stages = stageFilters.map(s => s.value);
      }

      // Add camera filters if selected (skip if "all" is selected)
      const hasAllCameras = cameraFilters.some(c => c.value === 'all');
      if (cameraFilters.length > 0 && !hasAllCameras) {
        requestBody.selected_cameras = cameraFilters.map(c => c.label);
      }

      console.log('Request Body:', requestBody);

      const response = await urlSocket.post('/label_filterData', requestBody);

      const filtered_data = response.data;

      if (filtered_data.error === 'Tenant not found') {
        console.log('data error', filtered_data.error);
        error_handler(filtered_data.error);
      } else {
        console.log('Filtered data:', filtered_data);
        if (!filtered_data || filtered_data.length === 0) {
          setTimeWiseFilterdata([]);
        } else {
          setTimeWiseFilterdata(filtered_data);
        }
      }
    } catch (error) {
      console.log(error);
      setTimeWiseFilterdata([]);
    }
  };

  // Filter by status (modified to work with stage/camera filters)
  const status_filter = async (status, filterValue) => {
    console.log('status', status);
    setSelectedStatus(status);
    setSelectedFilter(filterValue);
    setCurrentPage(1);

    fetchFilteredData(status, selectedLevel, selectedStages, selectedCameras);
  };

  // Back button handler
  const backButton = () => {
    const data = {
      startDate: dateWiseData.startDate,
      endDate: dateWiseData.endDate,
      comp_name: dateWiseData.comp_name,
      comp_code: dateWiseData.comp_code
    };

    console.log('data', data);
    sessionStorage.removeItem('dateWiseData');
    sessionStorage.setItem('dateWiseData', JSON.stringify(data));
    history.push('/station_report');
  };

  // Create flat list for modal navigation (based on filtered data)
  const flatStageList = React.useMemo(() => {
    const list = [];
    timeWise_filterdata.forEach(data => {
      const stages = Array.isArray(data.stage_camera_result)
        ? data.stage_camera_result
        : [];

      const images = Array.isArray(data.captured_image)
        ? data.captured_image
        : [];

      stages.forEach(stage => {
        const imagesForCamera = images.filter(
          img => img.camera_label === stage.camera_label
        );

        list.push({
          ...data,
          currentStage: stage,
          currentCamera: stage.camera_label,
          image: imagesForCamera[0]?.captured_image
        });
      });
    });
    return list;
  }, [timeWise_filterdata]);

  const onGotoNxtImg = () => {
    try {
      const next = temp_index + 1;
      if (next >= flatStageList.length) return;

      const selectedData = flatStageList[next];
      if (!selectedData) return;

      setModalData(selectedData);
      setImageSrc(getImage(selectedData.image));
      setTempIndex(next);
    } catch (err) {
      console.log(err);
    }
  };

  const onGotoPrevImg = () => {
    try {
      const prev = temp_index - 1;
      if (prev < 0) return;

      const selectedData = flatStageList[prev];
      if (!selectedData) return;

      setModalData(selectedData);
      setImageSrc(getImage(selectedData.image));
      setTempIndex(prev);
    } catch (err) {
      console.log(err);
    }
  };

  // Handle page change
  const handlePageChange = pageNumber => {
    setCurrentPage(pageNumber);
  };

  // ComponentDidMount equivalent
  useEffect(() => {
    const db_info = JSON.parse(localStorage.getItem('db_info'));
    ImageUrl = `${image_url}${db_info?.db_name}/`;

    const timeWiseData = JSON.parse(sessionStorage.getItem('timeWiseData'));
    console.log('timeWiseData1232', timeWiseData);
    const dateWiseData = JSON.parse(sessionStorage.getItem('dateWiseData'));
    console.log('dateWiseData', dateWiseData);

    console.log('dateWiseData', dateWiseData);
    console.log('comp_name', timeWiseData);

    const ok_Count = timeWiseData.ok;
    const notok_Count = timeWiseData.notok;
    const total_Count = timeWiseData.total;
    const posblMatch_Count = timeWiseData.posbl_match;
    const noobj_Count = timeWiseData.no_obj;
    const incobj_Count = timeWiseData.incorrect_obj;
    const station_id = timeWiseData.station_id;

    console.log('station_id78', station_id);

    setTimeWiseData(timeWiseData);
    setStationId(station_id);
    setDateWiseData(dateWiseData);
    setOkCount(ok_Count);
    setNotokCount(notok_Count);
    setTotalCount(total_Count);
    setPosblMatchCount(posblMatch_Count);
    setNoObjCount(noobj_Count);
    setIncObjCount(incobj_Count);
    setConfigPositive(timeWiseData.config_positive);
    setConfigNegative(timeWiseData.config_negative);
    setConfigPosbleMatch(timeWiseData.config_posble_match);

    labelData(timeWiseData);
    compListAPICall(timeWiseData);
  }, []);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = timeWise_filterdata.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  if (!dataloaded) {
    return null;
  }

  // return (
  //   <React.Fragment>
  //     <div className='page-content'>
  //       <MetaTags>
  //         <title>Inspection Result Details</title>
  //       </MetaTags>
  //       <Breadcrumbs
  //         title='TIMEWISE REPORT'
  //         isBackButtonEnable={true}
  //         gotoBack={backButton}
  //       />
  //       <Container fluid>
  //         <Card>
  //           <CardBody>
  //             <Row className='d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-2 mb-2'>
  //               <Col xs='12' lg='auto' className='text-left'>
  //                 <CardTitle className='mb-0'>
  //                   <span className='me-2 font-size-12'>Component Name :</span>
  //                   {comp_name}
  //                 </CardTitle>
  //                 <CardText className='mb-0'>
  //                   <span className='me-2 font-size-12'>Component Code :</span>
  //                   {comp_code}
  //                 </CardText>
  //                 <CardText className='mb-0'>
  //                   <span className='me-2 font-size-12'>Date:</span>
  //                   {date}
  //                 </CardText>
  //               </Col>

  //               {/* NEW: Stage and Camera Dropdowns */}
  //               <Col
  //                 xs='12'
  //                 lg='auto'
  //                 className='d-flex align-items-center gap-2'
  //               >
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
  //                       closeMenuOnSelect={false}
  //                     />
  //                   </div>
  //                 )}
  //               </Col>

  //               <Col xs='12' lg='auto' className='text-center'>
  //                 <ButtonGroup>
  //                   <Button
  //                     className='btn btn-sm w-md text-center'
  //                     color='primary'
  //                     outline={selectedFilter !== 0}
  //                     onClick={() => status_filter('', 0)}
  //                   >
  //                     Total (
  //                     {okCount +
  //                       notokCount +
  //                       posblMatchCount +
  //                       no_objCount +
  //                       inc_objCount}
  //                     )
  //                   </Button>
  //                   <Button
  //                     className='btn btn-sm w-md text-center'
  //                     color='primary'
  //                     outline={selectedFilter !== 1}
  //                     onClick={() => status_filter(positive, 1)}
  //                   >
  //                     {config_positive} ({okCount})
  //                   </Button>
  //                   <Button
  //                     className='btn btn-sm w-md text-center'
  //                     color='primary'
  //                     outline={selectedFilter !== 2}
  //                     onClick={() => status_filter(negative, 2)}
  //                   >
  //                     {config_negative} ({notokCount})
  //                   </Button>
  //                   <Button
  //                     className='btn btn-sm w-md text-center'
  //                     color='primary'
  //                     outline={selectedFilter !== 3}
  //                     onClick={() => status_filter('No Object Found', 3)}
  //                   >
  //                     No object found ({no_objCount})
  //                   </Button>
  //                   <Button
  //                     className='btn btn-sm w-md text-center'
  //                     color='primary'
  //                     outline={selectedFilter !== 4}
  //                     onClick={() => status_filter('Incorrect Object', 4)}
  //                   >
  //                     Incorrect Object ({inc_objCount})
  //                   </Button>
  //                 </ButtonGroup>
  //               </Col>
  //             </Row>

  //             {timeWise_filterdata.length === 0 ? (
  //               <div
  //                 className='container'
  //                 style={{ position: 'relative', height: '20vh' }}
  //               >
  //                 <div
  //                   className='text-center'
  //                   style={{
  //                     position: 'absolute',
  //                     top: '50%',
  //                     left: '50%',
  //                     transform: 'translate(-50%, -50%)'
  //                   }}
  //                 >
  //                   <h5 className='text-secondary'>No Records Found</h5>
  //                 </div>
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
  //                       let rowSerial = indexOfFirstItem + 1;

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
  //                               {/* SERIAL */}
  //                               <td className='bg-white'>{serial}</td>

  //                               {/* TIME */}
  //                               <td className='bg-white'>
  //                                 {data.inspected_ontime}
  //                               </td>

  //                               {/* STAGE NAME */}
  //                               <td className='bg-white'>
  //                                 {stage.stage_name || '-'}
  //                               </td>

  //                               {/* STAGE CODE */}
  //                               <td className='bg-white'>
  //                                 {stage.stage_code || '-'}
  //                               </td>

  //                               {/* CAMERA */}
  //                               <td className='bg-white'>
  //                                 {stage.camera_label}
  //                               </td>

  //                               {/* RESULT */}
  //                               <td
  //                                 className='bg-white'
  //                                 style={{
  //                                   color:
  //                                     stage.result?.trim().toUpperCase() ===
  //                                     'NG'
  //                                       ? 'red'
  //                                       : stage.result?.trim().toUpperCase() ===
  //                                         'OK'
  //                                       ? 'green'
  //                                       : 'black'
  //                                 }}
  //                               >
  //                                 {stage.result}
  //                               </td>

  //                               {/* IMAGE */}
  //                               <td className='bg-white'>
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

  //                                       // Calculate correct temp_index
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
  //                                     alt='Component'
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
  //                   totalItems={timeWise_filterdata.length}
  //                   itemsPerPage={itemsPerPage}
  //                   currentPage={currentPage}
  //                   onPageChange={handlePageChange}
  //                 />
  //               </div>
  //             )}
  //           </CardBody>
  //         </Card>
  //       </Container>

  //       <Modal
  //         title='Image'
  //         centered
  //         isOpen={showModal}
  //         toggle={() => setShowModal(false)}
  //         size='lg'
  //       >
  //         <div className='modal-header'>
  //           <h5>Image</h5>
  //           <Button
  //             onClick={() => setShowModal(false)}
  //             type='button'
  //             className='close mt-1'
  //             data-dismiss='modal'
  //             aria-label='Close'
  //           >
  //             <span aria-hidden='true'>&times;</span>
  //           </Button>
  //         </div>
  //         <ModalBody>
  //           <div className='text-center'>
  //             <img
  //               src={image_src}
  //               alt='Component'
  //               className='img-fluid'
  //               style={{ maxWidth: '100%', height: 'auto' }}
  //             />
  //           </div>

  //           <Row className='mt-3'>
  //             <Col md={6} className='text-start'>
  //               Component Name: <b>{comp_name}</b>
  //             </Col>
  //             <Col md={6} className='text-end'>
  //               Result:
  //               <span
  //                 style={{
  //                   color:
  //                     modal_data.currentStage?.result?.trim().toUpperCase() ===
  //                       'NG' ||
  //                     modal_data.result === 'No Object Found' ||
  //                     modal_data.result === 'notok'
  //                       ? 'red'
  //                       : modal_data.currentStage?.result
  //                           ?.trim()
  //                           .toUpperCase() === 'OK'
  //                       ? 'green'
  //                       : 'black'
  //                 }}
  //               >
  //                 {' '}
  //                 <b>{modal_data.currentStage?.result || modal_data.result}</b>
  //               </span>
  //             </Col>
  //           </Row>

  //           <Row>
  //             <Col md={6} className='text-start'>
  //               Component Code: <b>{comp_code}</b>
  //             </Col>
  //             <Col md={6} className='text-end'>
  //               Date: <b>{modal_data.date} </b>
  //               Time: <b>{modal_data.inspected_ontime}</b>
  //             </Col>
  //           </Row>

  //           {modal_data.currentStage && (
  //             <Row className='mt-2'>
  //               <Col md={6} className='text-start'>
  //                 Stage: <b>{modal_data.currentStage.stage_name}</b> (
  //                 {modal_data.currentStage.stage_code})
  //               </Col>
  //               <Col md={6} className='text-end'>
  //                 Camera: <b>{modal_data.currentCamera}</b>
  //               </Col>
  //             </Row>
  //           )}

  //           <Row>
  //             <Col md={6} className='text-start'>
  //               {temp_index !== 0 && (
  //                 <Button color='primary' onClick={onGotoPrevImg}>
  //                   Previous
  //                 </Button>
  //               )}
  //             </Col>
  //             <Col md={6} className='text-end'>
  //               {flatStageList.length !== temp_index + 1 && (
  //                 <Button color='primary' onClick={onGotoNxtImg}>
  //                   Next
  //                 </Button>
  //               )}
  //             </Col>
  //           </Row>

  //           <Row>
  //             <Col md={12} className='text-center'>
  //               ({temp_index + 1} / {flatStageList.length})
  //             </Col>
  //           </Row>
  //         </ModalBody>
  //       </Modal>
  //     </div>
  //   </React.Fragment>
  // );

  return (
    <React.Fragment>
      <div className='page-content'>
        <MetaTags>
          <title>Inspection Result Details</title>
        </MetaTags>
        <Breadcrumbs
          title='TIMEWISE REPORT'
          isBackButtonEnable={true}
          gotoBack={backButton}
        />
        <Container fluid>
          <Card>
            <CardBody>
              <Row className='d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-2 mb-2'>
                <Col xs='12' lg='auto' className='text-left'>
                  <CardTitle className='mb-0'>
                    <span className='me-2 font-size-12'>Component Name :</span>
                    {comp_name}
                  </CardTitle>
                  <CardText className='mb-0'>
                    <span className='me-2 font-size-12'>Component Code :</span>
                    {comp_code}
                  </CardText>
                  <CardText className='mb-0'>
                    <span className='me-2 font-size-12'>Date:</span>
                    {date}
                  </CardText>
                </Col>
                <Col
                  xs='12'
                  lg='auto'
                  className='d-flex align-items-center gap-2'
                >
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
                        closeMenuOnSelect={false}
                      />
                    </div>
                  )}
                </Col>
                {/* <Col xs='12' lg='auto' className='text-center'>
                  <ButtonGroup>
                    <Button
                      className='btn btn-sm w-md text-center'
                      color='primary'
                      outline={selectedFilter !== 0}
                      onClick={() => status_filter('', 0)}
                    >
                      Total {'('}{' '}
                      {okCount +
                        notokCount +
                        posblMatchCount +
                        no_objCount +
                        inc_objCount}{' '}
                      {')'}
                    </Button>
                    <Button
                      className='btn btn-sm w-md text-center'
                      color='primary'
                      outline={selectedFilter !== 1}
                      onClick={() => status_filter(positive, 1)}
                    >
                      {config_positive} {'('} {okCount} {')'}
                    </Button>
                    <Button
                      className='btn btn-sm w-md text-center'
                      color='primary'
                      outline={selectedFilter !== 2}
                      onClick={() => status_filter(negative, 2)}
                    >
                      {config_negative} {'('} {notokCount} {')'}
                    </Button>
                    <Button
                      className='btn btn-sm w-md text-center'
                      color='primary'
                      outline={selectedFilter !== 3}
                      onClick={() => status_filter('No Object Found', 3)}
                    >
                      No object found {'('} {no_objCount} {')'}
                    </Button>
                    <Button
                      className='btn btn-sm w-md text-center'
                      color='primary'
                      outline={selectedFilter !== 4}
                      onClick={() => status_filter('Incorrect Object', 4)}
                    >
                      Incorrect Object {'('} {inc_objCount} {')'}
                    </Button>
                  </ButtonGroup>
                </Col> */}
                <Col xs='12' lg='auto' className='text-center'>
                  <ButtonGroup>
                    {/* TOTAL */}
                    <Button
                      className='btn btn-sm w-md text-center'
                      color='primary'
                      outline={selectedFilter !== 0}
                      onClick={() => status_filter('', 0)}
                    >
                      Total (
                      {okCount +
                        notokCount +
                        posblMatchCount +
                        no_objCount +
                        inc_objCount}
                      )
                    </Button>

                    {/* OK */}
                    <Button
                      className='btn btn-sm w-md text-center'
                      color='primary'
                      outline={selectedFilter !== 1}
                      onClick={() => status_filter('OK', 1)}
                    >
                      {config_positive} ({okCount})
                    </Button>

                    {/* NG */}
                    <Button
                      className='btn btn-sm w-md text-center'
                      color='primary'
                      outline={selectedFilter !== 2}
                      onClick={() => status_filter('NG', 2)}
                    >
                      {config_negative} ({notokCount})
                    </Button>

                    {/* NO OBJECT */}
                    <Button
                      className='btn btn-sm w-md text-center'
                      color='primary'
                      outline={selectedFilter !== 3}
                      onClick={() => status_filter('NO_OBJECT', 3)}
                    >
                      No Object Found ({no_objCount})
                    </Button>

                    {/* INCORRECT OBJECT */}
                    <Button
                      className='btn btn-sm w-md text-center'
                      color='primary'
                      outline={selectedFilter !== 4}
                      onClick={() => status_filter('INCORRECT_OBJECT', 4)}
                    >
                      Incorrect Object ({inc_objCount})
                    </Button>
                  </ButtonGroup>
                </Col>
              </Row>
              {timeWise_filterdata.length === 0 ? (
                <div
                  className='container'
                  style={{ position: 'relative', height: '20vh' }}
                >
                  <div
                    className='text-center'
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <h5 className='text-secondary'>No Records Found</h5>
                  </div>
                </div>
              ) : (
                <div className='table-responsive'>
                  <Table
                    className='table mb-0 align-middle table-nowrap table-check'
                    bordered
                  >
                    {/* <thead className='table-light'>
                      <tr>
                        <th>S. No.</th>
                        <th>Time</th>
                        <th>Station Name</th>
                        <th>Result</th>
                        <th>Captured Image</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((data, index) => (
                        <tr key={index}>
                          <td className='bg-white'>
                            {index + 1 + (currentPage - 1) * 10}
                          </td>
                          <td className='bg-white'>{data.inspected_ontime}</td>
                          <td className='bg-white'>{data.station_name}</td>
                          <td className='bg-white'>{data.result}</td>
                          <td className='bg-white'>
                            <img
                              onClick={() => {
                                setShowModal(true);
                                setModalData(data);
                                setTempIndex(index + (currentPage - 1) * 10);
                                setImageSrc(getImage(data.captured_image));
                              }}
                              style={{
                                width: 'auto',
                                height: 100,
                                cursor: 'pointer'
                              }}
                              src={getImage(data.captured_image)}
                              alt='Component'
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody> */}

                    <thead className='table-light'>
                      <tr>
                        <th>S. No.</th>
                        <th>Time</th>
                        <th>Station Name</th>
                        <th>Stage Name</th>
                        <th>Stage Code</th>
                        <th>Camera Label</th>
                        <th>Result</th>
                        <th>Captured Image</th>
                      </tr>
                    </thead>
                    {/* <tbody>
                      {currentItems.map((data, index) => {

                        return data.captured_image.map((imgObj, imgIndex) => (
                          <tr key={`${index}-${imgIndex}`}>

                            <td className='bg-white'>
                              {index * data.captured_image.length +
                                imgIndex +
                                1 +
                                (currentPage - 1) * 10}
                            </td>
                            <td className='bg-white'>
                              {data.inspected_ontime}
                            </td>
                            <td className='bg-white'>{data.station_name}</td>
                            <td className='bg-white'>{data.result}</td>
                            <td className='bg-white'>{imgObj.stage_name}</td>
                            <td className='bg-white'>{imgObj.stage_code}</td>
                            <td className='bg-white'>{imgObj.camera_label}</td>
                            <td className='bg-white'>
                              <img
                                onClick={() => {
                                  setShowModal(true);
                                  setModalData(data);
                                  setTempIndex(

                                    index * data.captured_image.length +
                                      imgIndex +
                                      1 +
                                      (currentPage - 1) * itemsPerPage
                                  );
                                  setImageSrc(getImage(imgObj.captured_image));
                                }}
                                style={{
                                  width: 'auto',
                                  height: 100,
                                  cursor: 'pointer'
                                }}
                                src={getImage(imgObj.captured_image)}
                                alt='Component'
                              />
                            </td>
                          </tr>
                        ));
                      })}
                    </tbody> */}

                    <tbody>
                      {(() => {
                        let rowSerial = indexOfFirstItem + 1; // continuous numbering across pages
                        let flatIndex = indexOfFirstItem; // continuous flat index for modal

                        return currentItems.flatMap((data, dataIndex) => {
                          const stages = Array.isArray(data.captured_image)
                            ? data.captured_image
                            : [];

                          return stages.map((imgObj, stageIndex) => {
                            console.log('imgObj', imgObj);
                            const serial = rowSerial++; // shown in table
                            const modalIndex = flatIndex++; // used for modal navigation

                            return (
                              <tr key={`${dataIndex}-${stageIndex}`}>
                                {/* SERIAL */}
                                <td className='bg-white'>{serial}</td>

                                {/* TIME */}
                                <td className='bg-white'>
                                  {data.inspected_ontime}
                                </td>

                                {/* STATION */}
                                <td className='bg-white'>
                                  {data.station_name}
                                </td>

                                {/* STAGE */}
                                <td className='bg-white'>
                                  {imgObj.stage_name}
                                </td>

                                {/* STAGE CODE */}
                                <td className='bg-white'>
                                  {imgObj.stage_code}
                                </td>

                                {/* CAMERA */}
                                <td className='bg-white'>
                                  {imgObj.camera_label}
                                </td>

                                {/* RESULT */}
                                <td
                                  className='bg-white'
                                  style={{
                                    color:
                                      data.result?.trim().toUpperCase() === 'NG'
                                        ? 'red'
                                        : data.result?.trim().toUpperCase() ===
                                          'OK'
                                        ? 'green'
                                        : 'black'
                                  }}
                                >
                                  {data.result}
                                </td>
                                {/* IMAGE */}
                                <td className='bg-white'>
                                  <img
                                    src={getImage(imgObj.captured_image)}
                                    style={{
                                      width: 'auto',
                                      height: 100,
                                      cursor: 'pointer'
                                    }}
                                    onClick={() => {
                                      setShowModal(true);
                                      setModalData({
                                        ...data,
                                        currentStage: imgObj.stage_name,
                                        currentCamera: imgObj.camera_label
                                      });

                                      // IMPORTANT: modal index must be continuous (flat index)
                                      setTempIndex(modalIndex);

                                      setImageSrc(
                                        getImage(imgObj.captured_image)
                                      );
                                    }}
                                    alt='Component'
                                  />
                                </td>
                              </tr>
                            );
                          });
                        });
                      })()}
                    </tbody>
                  </Table>
                  <PaginationComponent
                    totalItems={timeWise_filterdata.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </CardBody>
          </Card>
        </Container>

        <Modal
          title='Image'
          centered
          isOpen={showModal}
          toggle={() => setShowModal(false)}
          size='lg'
        >
          <div className='modal-header'>
            <h5>Image</h5>
            <Button
              onClick={() => setShowModal(false)}
              type='button'
              className='close mt-1'
              data-dismiss='modal'
              aria-label='Close'
            >
              <span aria-hidden='true'>&times;</span>
            </Button>
          </div>
          <ModalBody>
            <div className='text-center'>
              <img
                src={image_src}
                alt='Component'
                className='img-fluid'
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>

            <Row className='mt-3'>
              <Col md={6} className='text-start'>
                Component Name: <b>{comp_name}</b>
              </Col>
              <Col md={6} className='text-end'>
                Result:
                <span
                  style={{
                    color:
                      modal_data.result === 'No Object Found' ||
                      modal_data.result === 'notok'
                        ? 'red'
                        : modal_data.result === 'Possible Match'
                        ? 'orange'
                        : 'green'
                  }}
                >
                  {' '}
                  {modal_data.result}
                </span>
              </Col>
            </Row>

            <Row>
              <Col md={6} className='text-start'>
                Component Code: <b>{comp_code}</b>
              </Col>
              <Col md={6} className='text-end'>
                Date: <b>{modal_data.date} </b>
                Time: <b>{modal_data.inspected_ontime}</b>
              </Col>
            </Row>

            <Row>
              <Col md={6} className='text-start'>
                {temp_index !== 0 && (
                  <Button color='primary' onClick={onGotoPrevImg}>
                    Previous
                  </Button>
                )}
              </Col>
              <Col md={6} className='text-end'>
                {timeWise_filterdata.length !== temp_index + 1 && (
                  <Button color='primary' onClick={onGotoNxtImg}>
                    Next
                  </Button>
                )}
              </Col>
            </Row>

            <Row>
              <Col md={12} className='text-center'>
                ({temp_index + 1} / {timeWise_filterdata.length})
              </Col>
            </Row>
          </ModalBody>
        </Modal>
      </div>
    </React.Fragment>
  );
};

export default TimeWiseReport;

TimeWiseReport.propTypes = {
  history: PropTypes.any
};

// export default TimeWiseReport;
