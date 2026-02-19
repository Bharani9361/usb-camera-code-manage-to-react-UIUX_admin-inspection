import React, { useState, useEffect, useRef, useCallback } from 'react';
import MetaTags from 'react-meta-tags';

import {
  Container, CardTitle, Button, Col,
  Row, Modal, Form, Label, Input, Table,
  FormGroup, Spinner, ButtonGroup,
  ModalBody, ModalHeader, Card, CardBody,
  UncontrolledTooltip
} from 'reactstrap';
import urlSocket from "./urlSocket";
import PropTypes from "prop-types";
import { useHistory } from 'react-router-dom';
import { Tooltip } from 'antd';
import { Spin, Switch } from 'antd';
import SearchField from "react-search-field";
import Nodata_admin from "assets/images/nodata/nodata_admin.jpg";
import Swal from 'sweetalert2';
import Webcam from 'react-webcam';
import { green } from '@mui/material/colors';
import { Dialog } from '@mui/material';
import PaginationComponent from './PaginationComponent';
import { LoadingOutlined } from '@ant-design/icons';
import Breadcrumbs from 'components/Common/Breadcrumb';
import { Progress, CheckCircleOutlined, ClockCircleOutlined } from 'antd';


import { DEFAULT_RESOLUTION } from './cameraConfig';
import FullScreenLoader from 'components/Common/FullScreenLoader';
import { Steps } from 'antd';
const CompInfo = ({ history }) => {
  // Individual state hooks
  const [addCompModal, setAddCompModal] = useState(false);
  const [isCompStatusModalOpen, setIsCompStatusModalOpen] = useState(false);
  const [modal_center, setModalCenter] = useState(false);
  const [comp_name, setCompName] = useState("");
  const [comp_code, setCompCode] = useState("");
  const [qr_value, setQrValue] = useState("");
  const [bgremove, setBgRemove] = useState(false);
  const [includeCamera, setIncludeCamera] = useState(false);
  const [componentNameError, setComponentNameError] = useState("");
  const [componentCodeError, setComponentCodeError] = useState("");
  const [qr_valueerror, setQrValueError] = useState("");
  const [componentList, setComponentList] = useState([]);
  console.log('componentList44', componentList)
  const [originalData, setOriginalData] = useState([]);
  const [search_componentList, setSearchComponentList] = useState([]);
  const [ver_log, setVerLog] = useState([]);
  const [compAssignedStations, setCompAssignedStations] = useState([]);
  const [modelInfo, setModelInfo] = useState([]);
  const [SearchField, setSearchField] = useState("");
  const [selectFilter, setSelectFilter] = useState(0);
  const [modelfilter, setModelFilter] = useState(0);
  const [filter_compStatus, setFilterCompStatus] = useState('all');
  const [filter_modelStatus, setFilterModelStatus] = useState('all');
  const [sorting, setSorting] = useState({ field: "", order: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage_stock, setCurrentPageStock] = useState(1);
  const [items_per_page_stock, setItemsPerPageStock] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [componentLoading, setComponentLoading] = useState(true);
  const [adding_component, setAddingComponent] = useState(false);
  const [qr_not_found, setQrNotFound] = useState(false);
  const [togglingCompStatus, setTogglingCompStatus] = useState({});
  const [compStatusDataTemp, setCompStatusDataTemp] = useState({});
  const [cameraOpen, setCameraOpen] = useState(false);
  const [webcamEnabled, setWebcamEnabled] = useState(true);
  const [cameraDisconnected, setCameraDisconnected] = useState(false);
  const [videoInputDevices, setVideoInputDevices] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);

  const webcamRef = useRef(null);
  const historyHook = useHistory();

  // Effects
  // useEffect(() => {
  //   const paginationCompInfo = JSON.parse(sessionStorage.getItem('paginationCompInfo'));
  //   console.log('paginationCompInfo', paginationCompInfo)
  //   if (paginationCompInfo?.currentPage) {
  //     setCurrentPage(paginationCompInfo.currentPage);
  //   }

  //   getComp_info();
  //   getModel_info();
  //   checkWebcam();

  //   navigator.mediaDevices.addEventListener('devicechange', checkWebcam);
  //   sessionStorage.removeItem("manageData");
  //   sessionStorage.removeItem('profiletype');
  //   sessionStorage.removeItem('type');

  //   return () => {
  //     navigator.mediaDevices.removeEventListener('devicechange', checkWebcam);
  //     sessionStorage.setItem("paginationCompInfo", JSON.stringify({ currentPage }));
  //     sessionStorage.removeItem("paginationCompInfo");
  //   };
  // }, [currentPage]);

  // run once on mount — initial fetch + setup
  useEffect(() => {
    const paginationCompInfo = JSON.parse(sessionStorage.getItem('paginationCompInfo') || "{}");
    console.log('paginationCompInfo', paginationCompInfo)
    if (paginationCompInfo?.currentPage) {
      setCurrentPage(paginationCompInfo.currentPage);
    }

    getComp_info();
    getModel_info();
    checkWebcam();

    navigator.mediaDevices.addEventListener('devicechange', checkWebcam);
    sessionStorage.removeItem("manageData");
    sessionStorage.removeItem('profiletype');
    sessionStorage.removeItem('type');

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', checkWebcam);
      // do NOT remove paginationCompInfo here — we want it persisted
    };
  }, []); // <-- run only on mount

  // persist pagination when currentPage changes
  useEffect(() => {
    try {
      sessionStorage.setItem("paginationCompInfo", JSON.stringify({ currentPage }));
    } catch (err) {
      console.warn('Could not save pagination to sessionStorage', err);
    }
  }, [currentPage]);

  // Helper functions
  const error_handler = useCallback((error) => {
    sessionStorage.removeItem("authUser");
    historyHook.push("/login");
  }, [historyHook]);

  const getComp_info = useCallback(async () => {
    try {
      const response = await urlSocket.post('/api/components/get_comp_info', { mode: 'no-cors' });
      console.log('response', response)
      if (response.data.error === "Tenant not found") {
        error_handler(response.data.error);
      } else {
        statusinfo(response.data);

      }
    } catch (error) {
      console.log(error);
    } finally {
      setComponentLoading(false);
    }
  });

  const getModel_info = useCallback(async () => {
    try {
      const response = await urlSocket.post('/get_model_info', { mode: 'no-cors' });
      if (response.data.error === "Tenant not found") {
        error_handler(response.data.error);
      } else {
        setModelInfo(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  }, [error_handler]);

  const submitForm = useCallback(async () => {
    setComponentNameError('');
    setComponentCodeError('');
    setQrValueError('');

    const trimmedComponentName = comp_name.trim().toUpperCase();
    const trimmedComponentCode = comp_code.trim().toUpperCase();
    const compNameRegex = /^[A-Za-z0-9 _-]+$/;

    if (!trimmedComponentName || !trimmedComponentCode) {
      setComponentNameError(!trimmedComponentName ? 'The component name is required' : '');
      setComponentCodeError(!trimmedComponentCode ? 'The component code is required' : '');
      return;
    }

    if (trimmedComponentCode.includes('-')) {
      setComponentCodeError('Component code cannot include the "-" symbol');
      return;
    }

    if (includeCamera && (!qr_value || qr_value === 'QR NOT FOUND')) {
      setQrValueError('Proper QR/Bar Code is required');
      return;
    }

    if (!compNameRegex.test(trimmedComponentName)) {
      setComponentNameError('Component name cannot contain special characters like ":"');
      return;
    }

    try {
      setAddingComponent(true);
      const qr_data = includeCamera ? qr_value : '';
      const response = await urlSocket.post('/api/components/add_comp', {
        comp_name: trimmedComponentName,
        comp_code: trimmedComponentCode,
        qr_data,
        bgremove
      }, { mode: 'no-cors' });

      console.log('response202', response)

      if (response.data.error === "Tenant not found") {
        error_handler(response.data.error);
      } else if (response.data === 'Comp code is already created') {
        setComponentCodeError('The component code is already created');
      } else if (response.data === 'Comp name is already created') {
        setComponentNameError('The component Name is already created');
      } else if (response.data === 'QR/Bar code is already created') {
        setQrValueError('QR/Bar code is already created');
      } else {
        setAddCompModal(false);
        setComponentList(response.data);
        setOriginalData(response.data);
        setSearchComponentList(response.data);
        setCompName('');
        setCompCode('');
        setComponentCodeError('');
        setComponentNameError('');
      }
    } catch (error) {
      console.log(error);
    } finally {
      setAddingComponent(false);
    }

    await activeOrInactive("all", 0);
    await modelFilter("all", 0);
  }, [comp_name, comp_code, qr_value, includeCamera, bgremove]);

  const bgremovefunction = () => {
    setBgRemove(prev => !prev);
  };

  const statusinfo = async (data) => {
    try {
      const response = await urlSocket.post('/model_status_change', { 'modelData': data }, { mode: 'no-cors' });
      console.log('response237', response)
      if (response.data.error === "Tenant not found") {
        error_handler(response.data.error);
      } else {
        setComponentList(response.data);
        setOriginalData(response.data);
        setSearchComponentList(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleModelInfo = async (data) => {
    console.log('data215', data)
    let modelInfo_data = {
      compInfo: data,
      modelInfo
    };
    console.log('modelInfo_data', modelInfo_data)
    await sessionStorage.removeItem("manageData");
    await sessionStorage.setItem("manageData", JSON.stringify(modelInfo_data));
    historyHook.push('/manageModel');
  };


  const handlestagelInfo = async (data) => {
    console.log('data215', data)
    let modelInfo_data = {
      compInfo: data,
      modelInfo
    };
    console.log('modelInfo_data', modelInfo_data)
    await sessionStorage.removeItem("manageData");
    await sessionStorage.setItem("manageData", JSON.stringify(modelInfo_data));
    historyHook.push('/manageStages');
  };


  const manageStation = (value) => {
    console.log('value284', value)
    let data = {
      component_info: value,
      page_info: '/comp_info'
    };
    sessionStorage.removeItem("InfoComp");
    sessionStorage.setItem("InfoComp", JSON.stringify(data));
    historyHook.push('/profileCreation');
  };


  const checkIsAssignedToStations = async (data, checked) => {
    try {
      const response = await urlSocket.post('/api/components/component_assigned_stations', { '_id': data._id, 'comp_status': checked }, { mode: 'no-cors' });
      if (response.data.error === "Tenant not found") {
        error_handler(response.data.error);
      } else {
        return response.data.station_list;
      }
    } catch (error) {
      console.error(error);
      return [];
    }
  };


  const changeComponentStatus = async (checked, data) => {
    console.log('checked, data', checked, data);
    setIsCompStatusModalOpen(false);

    let comp_id = data._id;
    let comp_name = data.comp_name;
    let comp_code = data.comp_code;

    try {
      const response = await urlSocket.post('/api/components/comp_status_upd', {
        '_id': comp_id,
        'comp_name': comp_name,
        'comp_code': comp_code,
        'comp_status': checked
      }, { mode: 'no-cors' });

      console.log('response', response);

      if (response.data.error === "Tenant not found") {
        error_handler(response.data.error);
        setTogglingCompStatus(prev => ({ ...prev, [data._id]: false }));
        return; // Don't refresh if there's an error
      }

      // Show success message
      Swal.fire({
        icon: 'success',
        title: `"${comp_name}" has been set to <span style="color: ${checked ? 'green' : 'red'}">${checked ? 'Active' : 'Inactive'}</span>.`,
        showConfirmButton: false,
        timer: 4000
      });

      // **KEY FIX: Await the filter refresh**
      if (selectFilter === 1) {
        await activeOrInactive(true, 1);
      } else if (selectFilter === 2) {
        await activeOrInactive(false, 2);
      } else if (selectFilter === 0) {
        await activeOrInactive("all", 0);
      }

    } catch (error) {
      console.error('Error updating component status:', error);
      // Optionally show error message to user
      Swal.fire({
        icon: 'error',
        title: 'Failed to update component status',
        text: 'Please try again',
        showConfirmButton: true
      });
    } finally {
      setTogglingCompStatus(prev => ({ ...prev, [data._id]: false }));
      setCompStatusDataTemp({});
    }
  };



  // const changeComponentStatus = async (checked, data) => {
  //   console.log('checked, data', checked, data)
  //   setIsCompStatusModalOpen(false);
  //   // const { data, checked } = compStatusDataTemp;
  //   console.log('241', data)
  //   let comp_id = data._id;
  //   let comp_name = data.comp_name;
  //   let comp_code = data.comp_code;

  //   try {
  //     const response = await urlSocket.post('/api/components/comp_status_upd', {
  //       '_id': comp_id,
  //       'comp_name': comp_name,
  //       'comp_code': comp_code,
  //       'comp_status': checked
  //     }, { mode: 'no-cors' });

  //     console.log('response', response)

  //     if (response.data.error === "Tenant not found") {
  //       error_handler(response.data.error);
  //     } else {
  //       Swal.fire({
  //         icon: 'success',
  //         title: `"${comp_name}" has been set to <span style="color: ${checked ? 'green' : 'red'}">${checked ? 'Active' : 'Inactive'}</span>.`,
  //         showConfirmButton: false,
  //         timer: 4000
  //       });

  //       if (selectFilter === 1) {
  //         activeOrInactive(true, 1);
  //       } else if (selectFilter === 2) {
  //         activeOrInactive(false, 2);
  //       } else if (selectFilter === 0) {
  //         activeOrInactive("all", 0);
  //       }
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     setTogglingCompStatus(prev => ({ ...prev, [data._id]: false }));
  //     setCompStatusDataTemp({});
  //   }
  // };

  const toggleCompStatusModal = async () => {
    const { data } = compStatusDataTemp;
    setIsCompStatusModalOpen(false);
    setTogglingCompStatus(prev => ({ ...prev, [data._id]: false }));
  };

  const onChange = async (checked, data) => {
    setTogglingCompStatus(prev => ({ ...prev, [data._id]: true }));
    setCompStatusDataTemp({ data, checked });

    try {
      const station_list = await checkIsAssignedToStations(data, checked);
      const isAssignedToStations = station_list.length > 0;

      if (!isAssignedToStations) {
        await changeComponentStatus(checked, data);
      } else {
        setCompAssignedStations(station_list);
        setIsCompStatusModalOpen(true);
      }
    } catch (error) {
      console.log('second')
      console.error("Error toggling component status:", error);
      setTogglingCompStatus(prev => ({ ...prev, [data._id]: false }));
      setCompStatusDataTemp({});
    }
  };

  const logComp = (data) => {
    if (data.datasets === undefined) {
      data.datasets = [];
    }
    let { comp_name, comp_code, _id } = data;

    let datas = {
      component_name: comp_name,
      component_code: comp_code,
      datasets: data.datasets,
      status: data.status,
      positive: data.positive,
      negative: data.negative,
      posble_match: data.posble_match,
      _id,
      config_data: {}
    };
    sessionStorage.removeItem("compData");
    sessionStorage.setItem("compData", JSON.stringify(datas));
    historyHook.push('/comp_log');
  };



  const info = (data) => {
    setModalCenter(true);
    try {
      urlSocket.post('/version_info', { 'comp_id': data._id }, { mode: 'no-cors' })
        .then((response) => {
          if (response.data.error === "Tenant not found") {
            error_handler(response.data.error);
          } else {
            const sortedData = response.data.sort((a, b) => a.model_live_ver - b.model_live_ver);
            setVerLog(sortedData);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const activeOrInactive = async (string, value) => {
    console.log('string, value', string, value)
    setSelectFilter(value);
    setFilterCompStatus(string);
    setCurrentPage(1);

    try {
      const response = await urlSocket.post('/active_inactive', { 'is_active': string, 'model_status': filter_modelStatus }, { mode: 'no-cors' });
      console.log('response487', response)
      if (response.data.error === "Tenant not found") {
        error_handler(response.data.error);
      } else {
        if (!response.data || response.data.length === 0) {
          setComponentList([]);
          setSearchComponentList([]);
        } else {
          setComponentList(response.data);
          setSearchComponentList(response.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const modelFilter = async (str, value) => {
    setModelFilter(value);
    setFilterModelStatus(str);
    setCurrentPage(1);

    try {
      const response = await urlSocket.post('/model_status_filter', { 'model_status': str, 'comp_status': filter_compStatus }, { mode: 'no-cors' });
      console.log('response4511', response)
      if (response.data.error === "Tenant not found") {
        error_handler(response.data.error);
      } else {
        if (!response.data || response.data.length === 0) {
          setComponentList([]);
          setSearchComponentList([]);
        } else {
          setComponentList(response.data);
          setSearchComponentList(response.data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };



  useEffect(() => {
    const delayDebounce = () => {
      if (SearchField.trim() !== "") {
        dataListProcess();
      } else {
        dataListProcess();
      }
    };
    delayDebounce()

    // return () => clearTimeout(delayDebounce);
  }, [SearchField]);

  const onSearch = (search) => {
    setSearchField(search);
    setCurrentPageStock(1);
    setCurrentPage(1);
    // setTimeout(() => {
    //   dataListProcess();
    // }, 100);
  };

  const dataListProcess = () => {
    try {
      let tempList = [...search_componentList];

      if (SearchField) {
        tempList = tempList.filter(d =>
          d.comp_name.toUpperCase().includes(SearchField.toUpperCase()) ||
          d.comp_code.toUpperCase().includes(SearchField.toUpperCase())
        );
      }

      if (sorting.field) {
        const reversed = sorting.order === "asc" ? 1 : -1;
        tempList = tempList.sort((a, b) => reversed * a[sorting.field].localeCompare(b[sorting.field]));
      }

      const slicedData = tempList.slice(
        (currentPage_stock - 1) * items_per_page_stock,
        (currentPage_stock - 1) * items_per_page_stock + items_per_page_stock
      );
      setComponentList(slicedData);
      // setTotalItemsStock(tempList.length);
    } catch (error) {
      console.error(error);
    }
  };

  const handleModalClosed = () => {
    setAddCompModal(false);
    setCompName('');
    setCompCode('');
    setComponentNameError('');
    setComponentCodeError('');
    setCameraOpen(false);
    setIncludeCamera(false);
    setQrValue('');
    setQrValueError('');
    setBgRemove(true);
  };

  const handleIncludeCameraToggle = () => {
    setIncludeCamera(prev => !prev);
    setCameraOpen(prev => !prev);
    setIsLoading(true);
    setQrValueError('');
    setQrValue('');
  };

  const handleWebcamLoad = (msg) => {
    if (msg === 'error') {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  };

  const checkBarCode = async () => {
    setQrNotFound(false);
    setQrValueError('');

    const formData = new FormData();
    const imageSrc = webcamRef.current.getScreenshot({ width: DEFAULT_RESOLUTION.width, height: DEFAULT_RESOLUTION.height });
    const blob = await fetch(imageSrc).then((res) => res.blob());
    const today = new Date();
    const _today = today.toLocaleDateString();
    const time = today.toLocaleTimeString().replace(/:/g, '_');
    const compdata = `${comp_name}_${comp_code}_${_today}_${time}`;
    formData.append('datasets', blob, `${compdata}.png`);

    try {
      const qr_result = await urlSocket.post("/api/components/qr_add_comp", formData, {
        headers: { "content-type": "multipart/form-data" },
        mode: "no-cors"
      });

      if (qr_result.data.error === "Tenant not found") {
        error_handler(qr_result.data.error);
      } else if (qr_result.data !== "QR not found") {
        setQrValue(qr_result.data.data);
      } else {
        setQrNotFound(true);
        setQrValue(qr_result.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkWebcam = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
      console.log('videoInputDevices :>>', videoInputDevices);
      if (!videoInputDevices.length) {
        setWebcamEnabled(false);
        setCameraDisconnected(true);
      } else {
        setWebcamEnabled(true);
        setCameraDisconnected(false);
        setVideoInputDevices(videoInputDevices);
      }
    } catch (error) {
      console.error('Error checking devices:', error);
    }
  };

  const handleCameraChange = event => {
    setSelectedCamera(event.target.value);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const showLiveVersionNums = (live_versions) => {
    const flattenedValues = live_versions.flat();
    return flattenedValues.map(value => `V${value}`).join(', ');
  };

  const isAllStagesApproved = (stg_info) => {
    if (!stg_info || stg_info.length === 0) return false;
    return stg_info.every(s => s.model_status === "Approved" || s.model_status === "Live");
  };

  return (
    <>
      {adding_component && <FullScreenLoader />}
      <div className='page-content'>
        <MetaTags>
          <title>Component Information</title>
        </MetaTags>
        <Breadcrumbs title="COMPONENT INFORMATION" />
        <Container fluid={true}>
          <Card>
            <CardBody>
              <Row className="d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-2 mb-2">
                <Col xs="12" lg="auto" className="text-center">
                  <div className="search-box">
                    <div className="position-relative">
                      <Input
                        onChange={(e) => onSearch(e.target.value)}
                        id="search-user"
                        type="text"
                        className="form-control"
                        placeholder="Search name or code..."
                        value={SearchField}
                      />
                      <i className="bx bx-search-alt search-icon" />
                    </div>
                  </div>
                </Col>
                <Col xs="12" lg="auto" className="text-center">
                  <ButtonGroup>
                    <Button className='btn btn-sm' color="primary" outline={selectFilter !== 0} onClick={() => activeOrInactive("all", 0)}>All</Button>
                    <Button className='btn btn-sm' color="primary" outline={selectFilter !== 1} onClick={() => activeOrInactive(true, 1)}>Active</Button>
                    <Button className='btn btn-sm' color="primary" outline={selectFilter !== 2} onClick={() => activeOrInactive(false, 2)}>Inactive</Button>
                  </ButtonGroup>
                </Col>
                <Col xs="12" lg="auto" className="text-center">
                  <ButtonGroup>
                    <Button className='btn btn-sm' color="success" outline={modelfilter !== 0} onClick={() => modelFilter("all", 0)}>All</Button>
                    <Button className='btn btn-sm' color="success" outline={modelfilter !== 4} onClick={() => modelFilter("No Models Available", 4)}>No Models</Button>
                    <Button className='btn btn-sm' color="success" outline={modelfilter !== 1} onClick={() => modelFilter("Draft", 1)}>Draft</Button>
                    <Button className='btn btn-sm' color="success" outline={modelfilter !== 2} onClick={() => modelFilter("Approved", 2)}>Approved</Button>
                    <Button className='btn btn-sm' color="success" outline={modelfilter !== 3} onClick={() => modelFilter("Live", 3)}>Live</Button>
                  </ButtonGroup>
                </Col>
                <Col xs="12" lg="auto" className="text-center">
                  <Button color="primary" className="w-sm btn btn-sm d-flex align-items-center" onClick={() => setAddCompModal(true)}>
                    <i className="bx bx-list-plus me-1" style={{ fontSize: '18px' }} /> Add Component
                  </Button>
                </Col>
              </Row>
              <div className='table-responsive'>
                {componentLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <Spinner color="primary" />
                    <h5 className="mt-4">
                      <strong>Loading components...</strong>
                    </h5>
                  </div>
                ) : componentList.length === 0 ? (
                  <div className="container" style={{ position: 'relative', height: '50vh' }}>
                    <div className="text-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                      <img src={Nodata_admin} className="img-sm h-auto" style={{ width: '20%' }} />
                      <h5 className="text-secondary">No Components Available</h5>
                    </div>
                  </div>
                ) : (
                  <div className='table-responsive'>
                    <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
                      <thead className="table-light">
                        <tr>
                          <th>S. No.</th>
                          <th>Component Name</th>
                          <th>Component Code</th>
                          <th>Component Status</th>
                          <th>Stage Status</th>
                          <th>Model Status</th>

                          <th>Model Live Version</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      {
                        console.log('componentList', componentList)

                      }
                      <tbody>
                        {componentList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((data, index) => {
                          const allStagesApproved = isAllStagesApproved(data.stg_info);

                          return (
                            <tr key={index} id="recent-list">
                              <td style={{ backgroundColor: "white" }}>{index + 1 + ((currentPage - 1) * itemsPerPage)}</td>
                              <td style={{ backgroundColor: "white" }}>{data.comp_name}</td>
                              <td style={{ backgroundColor: "white" }}>{data.comp_code}</td>
                              <td style={{ backgroundColor: "white" }}>
                                {togglingCompStatus?.[data._id] ? (
                                  <div className='ms-2'>
                                    <Spin indicator={<LoadingOutlined />} />
                                  </div>
                                ) : (
                                  <Switch
                                    checked={data.comp_status}
                                    onChange={(e) => onChange(e, data)}
                                    checkedChildren="Active"
                                    unCheckedChildren="Inactive"
                                  />
                                )}
                              </td>

                              <td style={{ backgroundColor: "white" }}>
                                <div className="d-flex gap-2 align-items-center">
                                  {data.stg_info && data.stg_info.length > 0 ? (
                                    (() => {
                                      const total = data.stg_info.length;
                                      const approved = data.stg_info.filter(s => s.model_status === "Approved" || s.model_status === "Live").length;
                                      const percentage = Math.round((approved / total) * 100);

                                      return (
                                        <>
                                          <span style={{ minWidth: "40px", fontWeight: 500 }}>{approved}/{total}</span>
                                          <Progress
                                            percent={percentage}
                                            steps={total}
                                            strokeColor="#52c41a"
                                            trailColor="#d9d9d9"
                                            strokeWidth={12}
                                            style={{ width: "120px" }}
                                          />
                                        </>
                                      );
                                    })()
                                  ) : (
                                    <>
                                      <span style={{ minWidth: "40px", fontWeight: 500 }}>0/0</span>
                                      <Progress
                                        percent={0}
                                        steps={0}
                                        strokeWidth={12}
                                        style={{ width: "120px" }}
                                      />
                                    </>
                                  )}
                                </div>
                              </td>
                              {/* <td style={{ backgroundColor: "white" }}>{data.model_status}</td> */}
                              <td style={{ backgroundColor: "white" }}>
                                <span className={data.model_status === 'Live' ? 'badge badge-soft-success' : data.model_status === 'Approved' ? 'badge badge-soft-warning' : data.model_status === 'Draft' ? 'badge badge-soft-info' : 'badge badge-soft-danger'}>
                                  {data.model_status}
                                </span>
                              </td>

                              <td style={{ backgroundColor: "white" }}>
                                {data.model_live_ver && data.model_live_ver.length > 0 ? (
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }} onClick={() => console.log(data.model_live_ver)}>
                                    {showLiveVersionNums(data.model_live_ver)}
                                    <i className='bx bx-info-circle' onClick={() => info(data)}></i>
                                  </div>
                                ) : "NA"}
                              </td>

                              <td style={{ backgroundColor: "white" }}>
                                <div className="d-flex gap-1 align-items-center" style={{ cursor: "pointer" }}>
                                  {data.comp_status !== false && (
                                    <>
                                      <Button color="primary" className='btn btn-sm' onClick={() => handlestagelInfo(data)} id={`stage-${data._id}`}>
                                        Stage Info
                                      </Button>
                                      <UncontrolledTooltip placement="top" target={`stage-${data._id}`}>
                                        Manage Stage Info
                                      </UncontrolledTooltip>
                                    </>
                                  )}

                                  {/* {data.comp_status !== false && allStagesApproved && (
                                   */}
                                  {data.comp_status !== false && allStagesApproved && (
                                    <>
                                      <Button color="primary" className='btn btn-sm' onClick={() => manageStation(data)} id={`station-${data._id}`}>
                                        Station Info
                                      </Button>
                                      <UncontrolledTooltip placement="top" target={`station-${data._id}`}>
                                        Manage Station Info
                                      </UncontrolledTooltip>
                                    </>
                                  )}

                                  {data.comp_status !== false && !allStagesApproved && (
                                    <>
                                      <Button
                                        color="info"
                                        className='btn btn-sm'
                                        // disabled
                                        id={`station-disabled-${data._id}`}
                                      >
                                        Station Info
                                      </Button>
                                      <UncontrolledTooltip placement="top" target={`station-disabled-${data._id}`}>
                                        Complete all stages to unlock Station Info
                                      </UncontrolledTooltip>
                                    </>
                                  )}

                                  <>
                                    <Button color="primary" className='btn btn-sm' onClick={() => logComp(data)} id={`log-${data._id}`}>
                                      Log Info
                                    </Button>
                                    <UncontrolledTooltip placement="top" target={`log-${data._id}`}>
                                      Log Info
                                    </UncontrolledTooltip>
                                  </>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                    <PaginationComponent
                      totalItems={componentList.length}
                      itemsPerPage={itemsPerPage}
                      currentPage={currentPage}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {isCompStatusModalOpen && (
            <Modal isOpen={isCompStatusModalOpen} toggle={toggleCompStatusModal} centered>
              <ModalBody>
                <p>If you deactivate this component, it will be deleted from the following stations:</p>
                <Table responsive striped bordered size="sm">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Station Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compAssignedStations.map((station, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{station}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <div className='d-flex my-2 justify-content-end gap-2'>
                  <Button size='sm' color="danger" onClick={changeComponentStatus}>
                    Yes, Deactivate
                  </Button>
                  <Button size='sm' color="secondary" onClick={toggleCompStatusModal}>
                    Cancel
                  </Button>
                </div>
              </ModalBody>
            </Modal>
          )}

          <Modal isOpen={addCompModal} onClosed={handleModalClosed}>
            <div className="modal-header">
              <h5 className="modal-title mt-0" id="myModalLabel">
                Enter Component Details
              </h5>
              <button
                type="button"
                onClick={() => setAddCompModal(false)}
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <Form>
                <div className="row mb-4">
                  <Col sm={12}>
                    <Label>Component name <span className="text-danger">*</span></Label>
                    <Input
                      type="text"
                      className="form-control"
                      id="horizontal-compname-Input"
                      placeholder="Enter Your Component Name"
                      value={comp_name}
                      maxLength="40"
                      // onChange={(e) => setCompName(e.target.value)}
                      onChange={(e) => {
                        setCompName(e.target.value);
                        if (componentNameError) setComponentNameError('');
                      }}
                    />
                    {componentNameError && <p className="error-message" style={{ color: "red" }}>{componentNameError}</p>}
                  </Col>
                </div>
                <div className="row mb-4">
                  <Col sm={12}>
                    <Label>Component code <span className="text-danger">*</span></Label>
                    <Input
                      type="text"
                      className="form-control"
                      id="example-number-input"
                      placeholder="Enter Your Component Code"
                      maxLength="32"
                      value={comp_code}
                      // onChange={(e) => setCompCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 8))}
                      onChange={(e) => {
                        setCompCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 8));
                        if (componentCodeError) setComponentCodeError('');
                      }}
                    />
                    {componentCodeError && <p className="error-message" style={{ color: "red" }}>{componentCodeError}</p>}
                  </Col>
                </div>
                <div className="row mb-4">
                  <Col sm={12}>
                    {/* <FormGroup check>
                        <Label check>
                          <Input type="checkbox" checked={bgremove} onChange={bgremovefunction} />
                          Background Remove if Needed
                        </Label>
                      </FormGroup>
                      <FormGroup check>
                        <Label check>
                          <Input type="checkbox" checked={includeCamera} onChange={handleIncludeCameraToggle} />
                          Capture QR/Bar code
                        </Label>
                      </FormGroup> */}
                    {includeCamera && cameraOpen && (
                      <>
                        <Input
                          type="text"
                          className="form-control mb-3"
                          id="example-number-input"
                          placeholder="Enter Your"
                          maxLength="32"
                          value={qr_value}
                          disabled
                        />
                        {qr_valueerror && <p className="error-message" style={{ color: "red" }}>{qr_valueerror}</p>}
                        {isLoading && (
                          <div className='d-flex flex-column justify-content-center align-items-center' style={{ width: '100%' }}>
                            <Spinner className='mt-2' color="primary" />
                            <div className='mt-2' style={{ fontWeight: 'bold' }}>Waiting for Camera...</div>
                          </div>
                        )}
                        <div style={{ display: isLoading ? 'none' : 'block' }}>
                          {cameraDisconnected ? (
                            <div className='d-flex flex-column justify-content-center align-items-center' style={{ width: '100%' }}>
                              <h5 style={{ fontWeight: 'bold' }}>Webcam Disconnected</h5>
                              <Spinner className='mt-2' color="primary" />
                              <div className='mt-2' style={{ fontWeight: 'bold' }}>Please check your webcam connection...</div>
                            </div>
                          ) : (
                            <>
                              <Webcam
                                key={selectedCamera}
                                videoConstraints={selectedCamera ? { deviceId: selectedCamera } : {}}
                                style={{ width: '100%', height: 'auto' }}
                                onUserMedia={() => handleWebcamLoad()}
                                onUserMediaError={() => handleWebcamLoad('error')}
                                screenshotFormat="image/png"
                                ref={webcamRef}
                              />
                              <Button className='mt-2' color='primary' onClick={checkBarCode}>Add QR/Barcode</Button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </Col>
                </div>
                <div className="row justify-content-end">
                  <Col sm={9}>
                    <div className="text-end">
                      <Button color="primary" className="w-md" onClick={submitForm}>
                        ADD
                      </Button>
                    </div>
                  </Col>
                </div>
              </Form>
            </div>
          </Modal>




          <Modal isOpen={modal_center} centered={true} size="xl">
            <div className="modal-header">
              <h5 className="modal-title mt-0">Component Live version details</h5>
              <button
                type="button"
                onClick={() => setModalCenter(false)}
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className='modal-body'>
              <div style={{ overflowX: 'auto' }}>
                <Table striped bordered style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ whiteSpace: 'nowrap' }}>Component Name</th>
                      <th style={{ whiteSpace: 'nowrap' }}>Component Code</th>
                      <th style={{ whiteSpace: 'nowrap' }}>Stage Name</th>
                      <th style={{ whiteSpace: 'nowrap' }}>Stage Code</th>
                      <th style={{ whiteSpace: 'nowrap' }}>Model Name</th>
                      <th style={{ whiteSpace: 'nowrap' }}>Model Version</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ver_log.map((data, index) => {
                      const showCompInfo = index === 0 ||
                        ver_log[index - 1].comp_name !== data.comp_name ||
                        ver_log[index - 1].comp_code !== data.comp_code;

                      const stageCount = ver_log.filter(item =>
                        item.comp_name === data.comp_name && item.comp_code === data.comp_code
                      ).length;

                      return (
                        <tr key={index}>
                          {showCompInfo ? (
                            <>
                              <td rowSpan={stageCount} style={{
                                fontWeight: 'bold',
                                verticalAlign: 'middle',
                                backgroundColor: '#f0f4ff',
                                borderLeft: '4px solid #007bff',
                                whiteSpace: 'nowrap'
                              }}>
                                {data.comp_name}
                              </td>
                              <td rowSpan={stageCount} style={{
                                fontWeight: 'bold',
                                verticalAlign: 'middle',
                                backgroundColor: '#f0f4ff',
                                whiteSpace: 'nowrap'
                              }}>
                                {data.comp_code}
                              </td>
                            </>
                          ) : null}
                          <td style={{ paddingLeft: '20px' }}>
                            <span style={{ color: '#6c757d', marginRight: '8px' }}>▪</span>
                            {data.stage_name}
                          </td>
                          <td style={{ whiteSpace: 'nowrap' }}>{data.stage_code}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{data.model_name}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            {data.model_live_ver.map((value, idx) => (
                              <span key={idx}>
                                {`V${value}${idx < data.model_live_ver.length - 1 ? ', ' : ''}`}
                              </span>
                            ))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </div>
          </Modal>





        </Container>
      </div>
    </>
  );
};

CompInfo.propTypes = {
  history: PropTypes.any.isRequired
};

export default CompInfo;

