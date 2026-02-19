import React, { useState, useEffect, useRef, useCallback } from 'react';
import MetaTags from 'react-meta-tags';
import {
  Container, CardTitle, Button, Col,
  Row, Modal, Form, Label, Input, Table,
  FormGroup, Spinner, ButtonGroup,
  ModalBody, ModalHeader, Card, CardBody,
  UncontrolledTooltip,CardText
} from 'reactstrap';
import urlSocket from "./urlSocket";
import PropTypes from "prop-types";
import { useHistory } from 'react-router-dom';
import { Spin, Switch } from 'antd';
import SearchField from "react-search-field";
import Nodata_admin from "assets/images/nodata/nodata_admin.jpg";
import Swal from 'sweetalert2';
import Webcam from 'react-webcam';
import Select from 'react-select';

import { green } from '@mui/material/colors';
import { Dialog } from '@mui/material';
import PaginationComponent from './PaginationComponent';
import { LoadingOutlined } from '@ant-design/icons';
import Breadcrumbs from 'components/Common/Breadcrumb';
import { DEFAULT_RESOLUTION } from './cameraConfig';
import FullScreenLoader from 'components/Common/FullScreenLoader';

const ManageStage = ({ history }) => {
  // Individual state hooks

  const [compData, setCompData] = useState("");
  const [stageName, setStageName] = useState("");
  const [stageCode, setStageCode] = useState("");
  const [compInfo,setCompInfo] = useState("");


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

  // NEW CHECKBOX STATE
  const [selectedStages, setSelectedStages] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isMultiCamera, setIsMultiCamera] = useState(false);
const [isSingleCamera, setIsSingleCamera] = useState(false);
const [cameraMode, setCameraMode] = useState(''); // 'multi' or 'single'

// Camera Selection States
const [multiCameraSelected, setMultiCameraSelected] = useState([]);
const [singleCameraSelected, setSingleCameraSelected] = useState(null);
const [cameraData, setCameraData] = useState([]); 

// Error states for camera selection
const [cameraSelectionError, setCameraSelectionError] = useState("");

const [editStageModal, setEditStageModal] = useState(false);
const [editingStage, setEditingStage] = useState(null);


console.log('cameraData', cameraData)

  const webcamRef = useRef(null);
  const historyHook = useHistory();



  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem('manageData'));
    console.log('maganestage seesion data', data)
    if (data) {
      const compData = data?.compInfo;
      console.log('compDataxx', compData)
      const compInfo = data?.compInfo.comp_name;
      const compcode = data?.compInfo.comp_code;
      const modelInfo = data.modelInfo;
      setCompName(compInfo)
      setCompInfo(compData)
      setCompCode(compcode)
      setCompData(compData)
      getCameraCollection();
      getStage_info(compData);
      getModel_info();

    }
  }, []);

  // Effects
  useEffect(() => {
    const paginationCompInfo = JSON.parse(sessionStorage.getItem('paginationCompInfo'));
    if (paginationCompInfo?.currentPage) {
      setCurrentPage(paginationCompInfo.currentPage);
    }

    // getStage_info();
    // getModel_info();
    // checkWebcam();
    checkWebcam();


    navigator.mediaDevices.addEventListener('devicechange', checkWebcam);
    // sessionStorage.removeItem("manageData");
    sessionStorage.removeItem('profiletype');
    sessionStorage.removeItem('type');

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', checkWebcam);
      sessionStorage.setItem("paginationCompInfo", JSON.stringify({ currentPage }));
      sessionStorage.removeItem("paginationCompInfo");
    };
  }, [currentPage]);

  // Update checkbox states when component list changes
  useEffect(() => {
    // Reset selected stages when component list changes
    setSelectedStages([]);
    setIsAllSelected(false);
  }, [componentList]);

  // Update "Select All" state based on selected stages
  useEffect(() => {
    const currentPageItems = componentList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const currentPageIds = currentPageItems.map(item => item._id);
    const selectedCurrentPageItems = selectedStages.filter(id => currentPageIds.includes(id));
    
    setIsAllSelected(currentPageItems.length > 0 && selectedCurrentPageItems.length === currentPageItems.length);
  }, [selectedStages, componentList, currentPage, itemsPerPage]);

  // CHECKBOX FUNCTIONS
  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const currentPageItems = componentList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const currentPageIds = currentPageItems.map(item => item._id);
    
    if (isChecked) {
      // Add current page items to selected stages (avoid duplicates)
      setSelectedStages(prev => {
        const newSelected = [...prev];
        currentPageIds.forEach(id => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      });
    } else {
      // Remove current page items from selected stages
      setSelectedStages(prev => prev.filter(id => !currentPageIds.includes(id)));
    }
  };

  const handleStageSelect = (stageId, isChecked) => {
    if (isChecked) {
      setSelectedStages(prev => [...prev, stageId]);
    } else {
      setSelectedStages(prev => prev.filter(id => id !== stageId));
    }
  };


  const getSelectionOrder = (stageId) => {
  return selectedStages.indexOf(stageId) + 1;
};

  const isStageSelected = (stageId) => {
    return selectedStages.includes(stageId);
  };

  const getSelectedStagesCount = () => {
    return selectedStages.length;
  };

  const getSelectedStagesData = () => {
    return componentList.filter(stage => selectedStages.includes(stage._id));
  };

  const clearAllSelections = () => {
    setSelectedStages([]);
    setIsAllSelected(false);
  };

  const back = () => {
    console.log('back is working');
     historyHook.push('/comp_info');
  };

  // Bulk operations for selected stages
  const handleBulkOperation = (operation) => {
    const selectedData = getSelectedStagesData();
    
    switch (operation) {

       case 'AssignStation':
        Swal.fire({
          title: 'Assign Station Selected Stages?',
          text: `Are you sure you want to Assign Station ${selectedData.length} selected stages?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, activate them!'
        }).then((result) => {
          if (result.isConfirmed) {
            // Implement bulk activate logic here
            console.log('Assign Station this stage:', selectedData);
            // You can call your bulk activation API here
          }
        });
        break;
      case 'activate':
        Swal.fire({
          title: 'Activate Selected Stages?',
          text: `Are you sure you want to activate ${selectedData.length} selected stages?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, activate them!'
        }).then((result) => {
          if (result.isConfirmed) {
            // Implement bulk activate logic here
            console.log('Activating stages:', selectedData);
            // You can call your bulk activation API here
          }
        });
        break;
      
      case 'deactivate':
        Swal.fire({
          title: 'Deactivate Selected Stages?',
          text: `Are you sure you want to deactivate ${selectedData.length} selected stages?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, deactivate them!'
        }).then((result) => {
          if (result.isConfirmed) {
            // Implement bulk deactivate logic here
            console.log('Deactivating stages:', selectedData);
            // You can call your bulk deactivation API here
          }
        });
        break;
        
      case 'delete':
        Swal.fire({
          title: 'Delete Selected Stages?',
          text: `Are you sure you want to delete ${selectedData.length} selected stages? This action cannot be undone!`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, delete them!'
        }).then((result) => {
          if (result.isConfirmed) {
            // Implement bulk delete logic here
            console.log('Deleting stages:', selectedData);
            // You can call your bulk delete API here
          }
        });
        break;
        
      default:
        console.log('Unknown operation:', operation);
    }
  };

  // Helper functions
  const error_handler = useCallback((error) => {
    sessionStorage.removeItem("authUser");
    historyHook.push("/login");
  }, [historyHook]);

  const getStage_info = useCallback(async (compData) => {
    console.log('compData._id', compData._id)
    try {
      const response = await urlSocket.post('/get_stage_info', {comp_id: compData._id},{ mode: 'no-cors' });
      console.log('response254', response)
      if (response.data.error === "Tenant not found") {
        error_handler(response.data.error);
      } else {
        await statusinfo(response.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setComponentLoading(false);
    }
  }, [error_handler]);

  const getCameraCollection = async () => {
    try {
      const response = await urlSocket.post('/get_camera_collection', { mode: 'no-cors' });
      console.log('Camera collection:', response.data);
      const cameras = (response.data && response.data.length > 0)
        ? response.data[0].camera_position
        : [];
      console.log('cameras', cameras);

      const options = cameras.map((cam) => ({
        value: cam.deviceId,
        v_id: cam.v_id,
        p_id: cam.v_id,
        port: cam.portNumber,
        label: cam.positionName,
        positionName: cam.positionName,
        originalLabel:cam.title || cam.label

      }));

      setCameraData(options);
  } catch (error) {
    console.error('Error fetching camera collection:', error);
  }
};

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

  // UPDATED SUBMIT FORM WITH CAMERA SAVE FUNCTIONALITY
  // const submitForm = useCallback(async () => {
  //   setComponentNameError('');
  //   setComponentCodeError('');
  //   setQrValueError('');
  //   setCameraSelectionError('');

  //   const trimmedStageName = stageName.trim().toUpperCase();
  //   const trimmedStageCode = stageCode.trim().toUpperCase();
  //   const compNameRegex = /^[A-Za-z0-9 _-]+$/;

  //   // Basic validation
  //   if (!trimmedStageName || !trimmedStageCode) {
  //     setComponentNameError(!trimmedStageName ? 'The Stage name is required' : '');
  //     setComponentCodeError(!trimmedStageCode ? 'The Stage code is required' : '');
  //     return;
  //   }

  //   if (trimmedStageCode.includes('-')) {
  //     setComponentCodeError('Component code cannot include the "-" symbol');
  //     return;
  //   }

  //   if (includeCamera && (!qr_value || qr_value === 'QR NOT FOUND')) {
  //     setQrValueError('Proper QR/Bar Code is required');
  //     return;
  //   }

  //   if (!compNameRegex.test(trimmedStageName)) {
  //     setComponentNameError('Stage name cannot contain special characters like ":"');
  //     return;
  //   }

  //   // Camera selection validation
  //   if (cameraMode === 'multi' && (!multiCameraSelected || multiCameraSelected.length === 0)) {
  //     setCameraSelectionError('Please select at least one camera for multi-camera mode');
  //     return;
  //   }

  //   if (cameraMode === 'single' && !singleCameraSelected) {
  //     setCameraSelectionError('Please select a camera for single camera mode');
  //     return;
  //   }

  //   // If no camera mode is selected but we have cameras available, require selection
  //   if (cameraData.length > 0 && !cameraMode) {
  //     setCameraSelectionError('Please select a camera mode (Multi or Single)');
  //     return;
  //   }

  //   try {
  //     setAddingComponent(true);
  //     const qr_data = includeCamera ? qr_value : '';
      
  //     // Prepare camera data to save
  //     let cameraSelectionData = {};
      
  //     if (cameraMode === 'multi' && multiCameraSelected.length > 0) {
  //       cameraSelectionData = {
  //         mode: 'multi',
  //         cameras: multiCameraSelected.map(cam => ({
  //           value: cam.value,
  //           v_id: cam.v_id,
  //           p_id: cam.p_id,
  //           port: cam.port,
  //           label: cam.label,
  //           originalLabel: cam.originalLabel
  //         }))
  //       };
  //     } else if (cameraMode === 'single' && singleCameraSelected) {
  //       cameraSelectionData = {
  //         mode: 'single',
  //         camera: {
  //           value: singleCameraSelected.value,
  //           v_id: singleCameraSelected.v_id,
  //           p_id: singleCameraSelected.p_id,
  //           port: singleCameraSelected.port,
  //           label: singleCameraSelected.label,
  //           originalLabel: singleCameraSelected.originalLabel
  //         }
  //       };
  //     }

  //     console.log('Camera selection data to save:', cameraSelectionData);

  //     const response = await urlSocket.post('/api/components/add_stage', {
  //       comp_name:comp_name,
  //       comp_code:comp_code,
  //       comp_id: compData._id,
  //       stage_name: trimmedStageName,
  //       stage_code: trimmedStageCode,
  //       qr_data,
  //       bgremove,
  //       camera_selection: cameraSelectionData 
  //     }, { mode: 'no-cors' });

  //     console.log('response337', response)

  //     if (response.data.error === "Tenant not found") {
  //       error_handler(response.data.error);
  //     } else if (response.data === 'stage code is already created') {
  //       setComponentCodeError('The Stage code is already created');
  //     } else if (response.data === 'stage name is already created') {
  //       setComponentNameError('The stage Name is already created');
  //     } else if (response.data === 'QR/Bar code is already created') {
  //       setQrValueError('QR/Bar code is already created');
  //     } else {
  //       // Success
  //       Swal.fire({
  //         icon: 'success',
  //         title: 'Stage Created Successfully!',
  //         text: `Stage "${trimmedStageName}" has been created with ${cameraMode === 'multi' ? `${multiCameraSelected.length} cameras` : cameraMode === 'single' ? '1 camera' : 'no cameras'} assigned.`,
  //         timer: 3000,
  //         showConfirmButton: false
  //       });

  //       setAddCompModal(false);
  //       setComponentList(response.data);
  //       setOriginalData(response.data);
  //       setSearchComponentList(response.data);
        
  //       // Reset form
  //       setStageName('');
  //       setStageCode('');
  //       setComponentCodeError('');
  //       setComponentNameError('');
  //       setCameraSelectionError('');
  //       setCameraMode('');
  //       setMultiCameraSelected([]);
  //       setSingleCameraSelected(null);
  //       setQrValue('');
  //       setBgRemove(false);
  //       setIncludeCamera(false);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Error Creating Stage',
  //       text: 'There was an error creating the stage. Please try again.',
  //     });
  //   } finally {
  //     setAddingComponent(false);
  //   }
  //   await activeOrInactive("all", 0);
  //   await modelFilter("all", 0);
  // }, [stageName, stageCode, qr_value, includeCamera, bgremove, cameraMode, multiCameraSelected, singleCameraSelected, cameraData, compData._id]);


const submitForm = useCallback(async () => {
  setComponentNameError('');
  setComponentCodeError('');
  setQrValueError('');
  setCameraSelectionError('');

  const trimmedStageName = stageName.trim().toUpperCase();
  const trimmedStageCode = stageCode.trim().toUpperCase();
  const compNameRegex = /^[A-Za-z0-9 _-]+$/;

  // Basic validation
  if (!trimmedStageName || !trimmedStageCode) {
    setComponentNameError(!trimmedStageName ? 'The Stage name is required' : '');
    setComponentCodeError(!trimmedStageCode ? 'The Stage code is required' : '');
    return;
  }

  if (trimmedStageCode.includes('-')) {
    setComponentCodeError('Component code cannot include the "-" symbol');
    return;
  }

  if (includeCamera && (!qr_value || qr_value === 'QR NOT FOUND')) {
    setQrValueError('Proper QR/Bar Code is required');
    return;
  }

  if (!compNameRegex.test(trimmedStageName)) {
    setComponentNameError('Stage name cannot contain special characters like ":"');
    return;
  }

  // Camera selection validation (only multi-camera now)
  if (!multiCameraSelected || multiCameraSelected.length === 0) {
    setCameraSelectionError('Please select at least one camera');
    return;
  }

  try {
    setAddingComponent(true);
    const qr_data = includeCamera ? qr_value : '';
    
    // Prepare camera data to save (only multi-camera)
    const cameraSelectionData = {
      mode: 'multi',
      cameras: multiCameraSelected.map(cam => ({
        value: cam.value,
        v_id: cam.v_id,
        p_id: cam.p_id,
        port: cam.port,
        label: cam.label,
        originalLabel: cam.originalLabel
      }))
    };

    console.log('Camera selection data to save:', cameraSelectionData);

    const response = await urlSocket.post('/api/components/add_stage', {
      comp_name: comp_name,
      comp_code: comp_code,
      comp_id: compData._id,
      stage_name: trimmedStageName,
      stage_code: trimmedStageCode,
      qr_data,
      bgremove,
      camera_selection: cameraSelectionData 
    }, { mode: 'no-cors' });

    console.log('response337', response);

    if (response.data.error === "Tenant not found") {
      error_handler(response.data.error);
    } else if (response.data === 'stage code is already created') {
      setComponentCodeError('The Stage code is already created');
    } else if (response.data === 'stage name is already created') {
      setComponentNameError('The stage Name is already created');
    } else if (response.data === 'QR/Bar code is already created') {
      setQrValueError('QR/Bar code is already created');
    } else {
      // Success
      Swal.fire({
        icon: 'success',
        title: 'Stage Created Successfully!',
        text: `Stage "${trimmedStageName}" has been created with ${multiCameraSelected.length} cameras assigned.`,
        timer: 3000,
        showConfirmButton: false
      });

      setAddCompModal(false);
      setComponentList(response.data);
      setOriginalData(response.data);
      setSearchComponentList(response.data);
      
      // Reset form
      setStageName('');
      setStageCode('');
      setComponentCodeError('');
      setComponentNameError('');
      setCameraSelectionError('');
      setMultiCameraSelected([]);
      setQrValue('');
      setBgRemove(false);
      setIncludeCamera(false);
    }
  } catch (error) {
    console.log(error);
    Swal.fire({
      icon: 'error',
      title: 'Error Creating Stage',
      text: 'There was an error creating the stage. Please try again.',
    });
  } finally {
    setAddingComponent(false);
  }
  await activeOrInactive("all", 0);
  await modelFilter("all", 0);
}, [stageName, stageCode, qr_value, includeCamera, bgremove, multiCameraSelected, compData._id]);

  const submitEditStage = async () => {
  try {
    setAddingComponent(true);
    console.log('editingStage', editingStage)

    const response = await urlSocket.put('/api/components/update_stage', {
      comp_id:editingStage.comp_id,
      stage_id: editingStage._id,
      stage_name: stageName.trim().toUpperCase(),
      stage_code: stageCode.trim().toUpperCase(),
      qr_data: includeCamera ? qr_value : '',
      bgremove,
      camera_selection: cameraMode === 'multi'
        ? { mode: 'multi', cameras: multiCameraSelected }
        : cameraMode === 'single'
        ? { mode: 'single', camera: singleCameraSelected }
        : {}
    });

    if (response.data.error) {
      Swal.fire({ icon: 'error', title: 'Error', text: response.data.error });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Stage Updated Successfully!',
        timer: 3000,
        showConfirmButton: false
      });

      setEditStageModal(false);
      setComponentList(response.data);
      setOriginalData(response.data);
      setSearchComponentList(response.data);
    }
  } catch (error) {
    console.error(error);
    Swal.fire({ icon: 'error', title: 'Update Failed', text: 'Please try again.' });
  } finally {
    setAddingComponent(false);
            // Reset form
        setStageName('');
        setStageCode('');
        setComponentCodeError('');
        setComponentNameError('');
        setCameraSelectionError('');
        setCameraMode('');
        setMultiCameraSelected([]);
        setSingleCameraSelected(null);
        setQrValue('');
        setBgRemove(false);
        setIncludeCamera(false);
  }
};
  const bgremovefunction = () => {
    setBgRemove(prev => !prev);
  };

  const statusinfo = async (data) => {
    console.log('data', data)
    try {
      const response = await urlSocket.post('/model_stage_status_change', { 'modelData': data }, { mode: 'no-cors' });
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

  const handleModelInfo = async(data) => {
    console.log('data215', data)
    let modelInfo_data = {
      ManageStage: data,
      modelInfo,
      compInfo :compData
    };
    console.log('modelInfo_data', modelInfo_data) 
    // await sessionStorage.removeItem("manageData");
    await sessionStorage.setItem("managestageData", JSON.stringify(modelInfo_data));
    historyHook.push('/stageManageModel');
  };

  const checkIsAssignedToStations = async (data, checked) => {
    try {
      const response = await urlSocket.post('/component_assigned_stations', { '_id': data._id, 'comp_status': checked }, { mode: 'no-cors' });
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
    console.log('checked, data', checked, data)
    setIsCompStatusModalOpen(false);
    console.log('241', data)
     let stage_id = data._id;
    console.log('stage_id :>> ', stage_id);
    let stage_name = data.stage_name;
    let stage_code = data.stage_code;


    try {
      const response = await urlSocket.post('/stage_status_upd', {
        

        '_id': stage_id,
        'stage_name': stage_name,
        'stage_code': stage_code,
        'stage_status': checked
      }, { mode: 'no-cors' });

      console.log('response564', response)

      if (response.data.error === "Tenant not found") {
        error_handler(response.data.error);
      } else {
        Swal.fire({
          icon: 'success',
          title: `"${comp_name}" has been set to <span style="color: ${checked ? 'green' : 'red'}">${checked ? 'Active' : 'Inactive'}</span>.`,
          showConfirmButton: false,
          timer: 4000
        });

        if (selectFilter === 1) {
          activeOrInactive(true, 1);
        } else if (selectFilter === 2) {
          activeOrInactive(false, 2);
        } else if (selectFilter === 0) {
          activeOrInactive("all", 0);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setTogglingCompStatus(prev => ({ ...prev, [data._id]: false }));
      setCompStatusDataTemp({});
    }
  };

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

  //Bharani
  // const logComp = (data) => {
  //   if (data.datasets === undefined) {
  //     data.datasets = [];
  //   }
  //   let { comp_name, comp_code, _id } = data;

  //   let datas = {
  //     component_name: comp_name,
  //     component_code: comp_code,
  //     datasets: data.datasets,
  //     status: data.status,
  //     positive: data.positive,
  //     negative: data.negative,
  //     posble_match: data.posble_match,
  //     _id,
  //     config_data: {} // Assuming config_data was part of state, but not shown in original
  //   };
  //   sessionStorage.removeItem("compData");
  //   sessionStorage.setItem("compData", JSON.stringify(datas));
  //   historyHook.push('/stagelog');
  // };


  //chiran
    const logComp = (data) => {
    if (data.datasets === undefined) {
      data.datasets = [];
    }
    let { stage_name, stage_code, _id } = data;

    let datas = {
      parent_id : compData._id,
      stage_name: stage_name,
      stage_code: stage_code,
      datasets: data.datasets,
      status: data.status,
      positive: data.positive,
      negative: data.negative,
      posble_match: data.posble_match,
      _id,
      config_data: {} // Assuming config_data was part of state, but not shown in original
    };
    console.log('object :>> ', datas);
    sessionStorage.removeItem("stageData");
    sessionStorage.setItem("stageData", JSON.stringify(datas));
    historyHook.push('/stagelog');
  };

  const EditStage = (stage) => {
  setEditingStage(stage);

  // Prefill fields
  setStageName(stage.stage_name);
  setStageCode(stage.stage_code);
  setQrValue(stage.qrOrBar_code || '');
  setBgRemove(stage.background || false);
  setCameraMode(stage.camera_selection?.mode || '');
  setMultiCameraSelected(stage.camera_selection?.mode === 'multi' ? stage.camera_selection.cameras : []);
  setSingleCameraSelected(stage.camera_selection?.mode === 'single' ? stage.camera_selection.camera : null);
  setIncludeCamera(!!stage.qrOrBar_code && stage.qrOrBar_code !== 'NA');

  // Finally, open modal
  setEditStageModal(true);
};

  const manageStation = (value) => {
    let data = {
      component_info: value,
      page_info: '/comp_info'
    };
    sessionStorage.removeItem("InfoComp");
    sessionStorage.setItem("InfoComp", JSON.stringify(data));
    historyHook.push('/profileCreation');
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
    setSelectFilter(value);
    setFilterCompStatus(string);
    setCurrentPage(1);

    try {
      const response = await urlSocket.post('/stage_active_inactive', { 'comp_id': compData._id , 'is_active': string, 'model_status': filter_modelStatus }, { mode: 'no-cors' });
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
      const response = await urlSocket.post('/stage_status_filter', {'comp_id': compData._id , 'model_status': str, 'comp_status': filter_compStatus }, { mode: 'no-cors' });
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

  

  const onSearch = (search) => {
    setSearchField(search);
    setCurrentPageStock(1);
    setCurrentPage(1);
    setTimeout(() => {
      dataListProcess();
    }, 100);
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
    } catch (error) {
      console.error(error);
    }
  };

  const handleModalClosed = () => {
    setAddCompModal(false);
    setComponentNameError('');
    setComponentCodeError('');
    setCameraSelectionError('');
    setCameraOpen(false);
    setIncludeCamera(false);
    setQrValue('');
    setQrValueError('');
    setBgRemove(false);
    setSelectedCamera(null);
    setQrNotFound(false);
    setIsLoading(false);
    
    // Reset camera selections
    setCameraMode('');
    setMultiCameraSelected([]);
    setSingleCameraSelected(null);
    setStageName('');
    setStageCode('');
  };

  const handleIncludeCameraToggle = async () => {
    const newIncludeCamera = !includeCamera;
    setIncludeCamera(newIncludeCamera);
    setCameraOpen(newIncludeCamera);
    setQrValueError('');
    setQrValue('');
    setQrNotFound(false);
    
    if (newIncludeCamera) {
      setIsLoading(true);
      // Refresh camera devices and auto-select if only one available
      await checkWebcam();
      if (videoInputDevices.length === 1) {
        setSelectedCamera(videoInputDevices[0].deviceId);
      } else if (videoInputDevices.length === 0) {
        setSelectedCamera(null);
      }
    } else {
      setSelectedCamera(null);
      setIsLoading(false);
    }
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
      
      setVideoInputDevices(videoInputDevices);
      
      if (!videoInputDevices.length) {
        setWebcamEnabled(false);
        setCameraDisconnected(true);
        setSelectedCamera(null);
      } else {
        setWebcamEnabled(true);
        setCameraDisconnected(false);
        
        // Auto-select first camera if none is selected and camera is open
        if (!selectedCamera && cameraOpen && videoInputDevices.length === 1) {
          setSelectedCamera(videoInputDevices[0].deviceId);
        }
      }
    } catch (error) {
      console.error('Error checking devices:', error);
      setWebcamEnabled(false);
      setCameraDisconnected(true);
      setVideoInputDevices([]);
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

    return (
        <>
            {adding_component && <FullScreenLoader />}
            <div className='page-content'>
                <MetaTags>
                    <title>Stage Information</title>
                </MetaTags>
                <Row className="mb-3">
                            <Col xs={9}>
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="mb-0 mt-2 m-2 font-size-14 fw-bold">STAGE INFORMATION</div>
                              </div>
                            </Col>
                            <Col xs={3} className='d-flex align-items-center justify-content-end'>
                              <button className='btn btn-outline-primary btn-sm me-2' color="primary" 
                              onClick={back}>
                                Back
                               <i className="mdi mdi-arrow-left"></i>
                               </button>
                            </Col>
                          </Row>
                
                <Container fluid={true}>

                    <Card>

                        <CardBody>
                             <CardText className="mb-1 ">
                        <span className="me-2 font-size-12">
                            Component Name :
                        </span>
                        {comp_name}
                    </CardText>
                    <CardText className="mb-2">
                        <span className="me-2 font-size-12">
                            Component Code :
                        </span>
                        {comp_code}
                    </CardText>
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
                    <i className="bx bx-list-plus me-1" style={{ fontSize: '18px' }} /> Add Stage
                  </Button>
                </Col>
              </Row>

              {/* SELECTION INFO AND BULK ACTIONS */}
              {getSelectedStagesCount() > 0 && (
                <Row className="mb-3">
                  <Col xs="12">
                    <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                      <div>
                        <span className="fw-bold text-primary">
                          {getSelectedStagesCount()} stage{getSelectedStagesCount() > 1 ? 's' : ''} selected
                        </span>
                      </div>
                        <div className="gap-2">
                          <Button size="sm" color="success" onClick={() => handleBulkOperation('AssignStation')}>
                            <i className="bx bx-check-circle me-1" />
                            Assign Station
                          </Button>
                        </div>
                    </div>
                  </Col>
                </Row>
              )}

              <div className='table-responsive'>
                {componentLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <Spinner color="primary" />
                    <h5 className="mt-4">
                      <strong>Loading Stage...</strong>
                    </h5>
                  </div>
                ) : componentList.length === 0 ? (
                  <div className="container" style={{ position: 'relative', height: '50vh' }}>
                    <div className="text-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                          <img src={Nodata_admin} className="img-sm h-auto" style={{ width: '20%' }} />
                          <h5 className="text-secondary">No Stage Available</h5>
                        </div>
                      </div>
                    ) : (
                      <div className='table-responsive'>
                        <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
                          <thead className="table-light">
                            <tr>
                              <th style={{ width: '50px' }}>
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="checkboxSelectAll"
                                    checked={isAllSelected}
                                    onChange={handleSelectAll}
                                  />
                                  <label className="form-check-label" htmlFor="checkboxSelectAll"></label>
                                </div>
                              </th>
                              <th>S. No.</th>
                              <th>Stage Name</th>
                              <th>Stage Code</th>
                              <th>Stage Status</th>
                              <th>Model Status</th>
                              <th>Model Live Version</th>
                              <th>Camera Info</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {componentList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((data, index) => (
                              <tr key={index} id="recent-list" className={isStageSelected(data._id) ? 'table-active' : ''}>
                                <td style={{ backgroundColor: "white" }}>
                                  <div className="form-check d-flex align-items-center">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id={`checkbox-${data._id}`}
                                      checked={isStageSelected(data._id)}
                                      onChange={(e) => handleStageSelect(data._id, e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor={`checkbox-${data._id}`}></label>
                                    {/* Counter display when checked */}
                                    {isStageSelected(data._id) && (
                                      <span className="ms-2 badge bg-primary rounded-pill">
                                        {getSelectionOrder(data._id)}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td style={{ backgroundColor: "white" }}>{index + 1 + ((currentPage - 1) * itemsPerPage)}</td>
                                <td style={{ backgroundColor: "white" }}>{data.stage_name}</td>
                                <td style={{ backgroundColor: "white" }}>{data.stage_code}</td>
                                <td style={{ backgroundColor: "white" }}>
                              {togglingCompStatus?.[data._id] ? (
                                <div className='ms-2'>
                                  <Spin indicator={<LoadingOutlined />} />
                                </div>
                              ) : (
                                <Switch
                                  checked={data.stage_status}
                                  onChange={(e) => onChange(e, data)}
                                  checkedChildren="Active"
                                  unCheckedChildren="Inactive"
                                />
                              )}
                            </td>
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
                              ) : null}
                            </td>
                            {/* NEW CAMERA INFO COLUMN */}
                            <td style={{ backgroundColor: "white" }}>
                              {data.camera_selection ? (
                                <div className="text-start">
                                  {data.camera_selection.mode === 'multi' ? (
                                    <div>
                                      <span className="badge bg-info mb-1">Multi Camera</span>
                                      <br />
                                      <small className="text-muted">
                                        {data.camera_selection.cameras.length} camera{data.camera_selection.cameras.length > 1 ? 's' : ''} assigned
                                      </small>
                                      <div className="mt-1">
                                        {data.camera_selection.cameras.map((cam, idx) => (
                                          <small key={idx} className="d-block text-truncate" style={{maxWidth: '120px'}}>
                                            • {cam.label}
                                          </small>
                                        ))}
                                      </div>
                                    </div>
                                  ) : data.camera_selection.mode === 'single' ? (
                                    <div>
                                      <span className="badge bg-success mb-1">Single Camera</span>
                                      <br />
                                      <small className="text-muted d-block text-truncate" style={{maxWidth: '120px'}}>
                                        {data.camera_selection.camera.label}
                                      </small>
                                    </div>
                                  ) : (
                                    <span className="badge bg-secondary">No Camera</span>
                                  )}
                                </div>
                              ) : (
                                <span className="badge bg-secondary">No Camera</span>
                              )}
                            </td>
                            {/* <td style={{ backgroundColor: "white" }}>
                              <div className="d-flex gap-1 align-items-center" style={{ cursor: "pointer" }}>
                                {data.comp_status !== false && (
                                  <>
                                    <Button color="primary" className='btn btn-sm' onClick={() => handleModelInfo(data)} id={`model-${data._id}`}>
                                      Model Info
                                    </Button>
                                    <UncontrolledTooltip placement="top" target={`model-${data._id}`}>
                                      Manage Model Info
                                    </UncontrolledTooltip>
                                  </>
                                )}
                                {data.comp_status !== false && (
                                  <>
                                    <Button color="primary" className='btn btn-sm' onClick={() => manageStation(data)} id={`station-${data._id}`}>
                                          Station Info
                                        </Button>
                                        <UncontrolledTooltip placement="top" target={`station-${data._id}`}>
                                          Manage Station Info
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

                                    <>
                                      <Button
                                        color="primary"
                                        className='btn btn-sm'
                                        onClick={() => EditStage(data)}
                                        id={`edit-${data._id}`}
                                      >
                                        Edit
                                      </Button>
                                      <UncontrolledTooltip placement="top" target={`edit-${data._id}`}>
                                        Log Info
                                      </UncontrolledTooltip>

                                    </>
                                  </div>
                                </td> */}

                                {/* CAMERA INFO + ACTIONS BOX STYLE */}
<td style={{ backgroundColor: "white" }}>
  {data.camera_selection ? (
    <div className="d-flex flex-column gap-2">
      {(data.camera_selection.mode === 'multi'
        ? data.camera_selection.cameras
        : data.camera_selection.mode === 'single'
          ? [data.camera_selection.camera]
          : []
      ).map((cam, idx) => (
        <div
          key={idx}
          className="d-flex justify-content-between align-items-center border p-2 rounded"
        >
          {/* Camera Label */}
          <div className="fw-semibold text-truncate" style={{ maxWidth: "150px" }}>
            {cam?.label || "No Camera"}
          </div>

          {/* Actions */}
          <div className="d-flex gap-2 flex-wrap">
            {data.comp_status !== false && (
              <>
                <Button
                  color="primary"
                  size="sm"
                  onClick={() => manageStation(data)}
                >
                  Station Info
                </Button>
                <Button
                  color="primary"
                  size="sm"
                  onClick={() => handleModelInfo(data)}
                >
                  Model Info
                </Button>
              </>
            )}

            <Button
              color="primary"
              size="sm"
              onClick={() => logComp(data)}
            >
              Log Info
            </Button>
            <Button
              color="primary"
              size="sm"
              onClick={() => EditStage(data)}
            >
              Edit
            </Button>
          </div>
        </div>
      ))}

      {/* If no camera */}
      {(!data.camera_selection ||
        (data.camera_selection.mode !== "multi" &&
         data.camera_selection.mode !== "single")) && (
        <div className="d-flex justify-content-between align-items-center border p-2 rounded">
          <span className="text-muted">No Camera</span>
          <div className="d-flex gap-2 flex-wrap">
            <Button color="primary" size="sm" onClick={() => logComp(data)}>
              Log Info
            </Button>
            <Button color="primary" size="sm" onClick={() => EditStage(data)}>
              Edit
            </Button>
          </div>
        </div>
      )}
    </div>
  ) : (
    <span className="badge bg-secondary">No Camera</span>
  )}
</td>

                              </tr>
                        ))}
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
                <p>If you deactivate this Stage, it will be deleted from the following stations:</p>
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
                  <Button size='sm' color="danger" onClick={() => changeComponentStatus(compStatusDataTemp.checked, compStatusDataTemp.data)}>
                    Yes, Deactivate
                  </Button>
                  <Button size='sm' color="secondary" onClick={toggleCompStatusModal}>
                    Cancel
                  </Button>
                </div>
              </ModalBody>
            </Modal>
          )}

          <Modal isOpen={addCompModal} onClosed={handleModalClosed} size="lg">
            <div className="modal-header">
              <h5 className="modal-title mt-0" id="myModalLabel">
                Enter Stage Details
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
                      <Label>Stage name</Label>
                      <Input
                        type="text"
                        className="form-control"
                        id="horizontal-compname-Input"
                        placeholder="Enter Your Stage Name"
                        value={stageName}
                        maxLength="40"
                        onChange={(e) => setStageName(e.target.value)}
                      />
                      {componentNameError && <p className="error-message" style={{ color: "red" }}>{componentNameError}</p>}
                    </Col>
                  </div>
                  
                  <div className="row mb-4">
                    <Col sm={12}>
                      <Label>Stage code</Label>
                      <Input
                        type="text"
                        className="form-control"
                        id="example-number-input"
                        placeholder="Enter Your Stage Code"
                        maxLength="32"
                        value={stageCode}
                        onChange={(e) => setStageCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 8))}
                      />
                      {componentCodeError && <p className="error-message" style={{ color: "red" }}>{componentCodeError}</p>}
                    </Col>
                  </div>

                  {/* CAMERA SELECTION SECTION */}
                  {/* {cameraData.length > 0 && (
                    <div className="row mb-4">
                      <Col sm={12}>
                        <Label className="fw-bold mb-3">Camera Selection</Label>
                        
                        <div className="d-flex gap-4 mb-3">
                          <div className="d-flex align-items-center">
                            <Input
                              type="radio"
                              name="cameraMode"
                              id="multiCameraMode"
                              checked={cameraMode === 'multi'}
                              onChange={() => {
                                setCameraMode('multi');
                                setSingleCameraSelected(null);
                                setCameraSelectionError('');
                              }}
                            />
                            <Label htmlFor="multiCameraMode" className="ms-2 mb-0">
                              Multi Camera Selection
                            </Label>
                          </div>

                          <div className="d-flex align-items-center">
                            <Input
                              type="radio"
                              name="cameraMode"
                              id="singleCameraMode"
                              checked={cameraMode === 'single'}
                              onChange={() => {
                                setCameraMode('single');
                                setMultiCameraSelected([]);
                                setCameraSelectionError('');
                              }}
                            />
                            <Label htmlFor="singleCameraMode" className="ms-2 mb-0">
                              Single Camera Selection
                            </Label>
                          </div>
                        </div>

                        {cameraMode === 'multi' && (
                          <div className="mb-3">
                            <Label htmlFor="multiCameraSelect" className="form-label">
                              Select Multiple Cameras
                            </Label>
                            {
                              console.log('cameraDsssssata', cameraData)
                            }
                            <Select
                              id="multiCameraSelect"
                              isMulti
                              options={cameraData}
                              placeholder="Select Cameras"
                              value={multiCameraSelected}
                              onChange={(selected) => {
                                setMultiCameraSelected(selected || []);
                                setCameraSelectionError('');
                              }}
                              classNamePrefix="react-select"
                              className="react-select-container"
                            />
                            {multiCameraSelected.length > 0 && (
                              <div className="mt-2">
                                <small className="text-success">
                                  <i className="bx bx-check-circle me-1"></i>
                                  {multiCameraSelected.length} camera{multiCameraSelected.length > 1 ? 's' : ''} selected
                                </small>
                              </div>
                            )}
                          </div>
                        )}

                        {cameraMode === 'single' && (
                          <div className="mb-3">
                            <Label htmlFor="singleCameraSelect" className="form-label">
                              Select Single Camera
                            </Label>
                            <Select
                              id="singleCameraSelect"
                              isMulti={false}
                              options={cameraData}
                              placeholder="Select a Camera"
                              value={singleCameraSelected}
                              onChange={(selected) => {
                                setSingleCameraSelected(selected);
                                setCameraSelectionError('');
                              }}
                              classNamePrefix="react-select"
                              className="react-select-container"
                            />
                            {singleCameraSelected && (
                              <div className="mt-2">
                                <small className="text-success">
                                  <i className="bx bx-check-circle me-1"></i>
                                  Camera selected: {singleCameraSelected.label}
                                </small>
                              </div>
                            )}
                          </div>
                        )}

                        {cameraSelectionError && (
                          <div className="alert alert-danger py-2" role="alert">
                            <small>
                              <i className="bx bx-error-circle me-1"></i>
                              {cameraSelectionError}
                            </small>
                          </div>
                        )}

                        {((cameraMode === 'multi' && multiCameraSelected.length > 0) || 
                          (cameraMode === 'single' && singleCameraSelected)) && (
                          <div className="alert alert-info py-2" role="alert">
                            <small>
                              <strong>Camera Configuration:</strong>
                              {cameraMode === 'multi' ? (
                                <span> Multi-camera mode with {multiCameraSelected.length} cameras</span>
                              ) : (
                                <span> Single-camera mode with 1 camera</span>
                              )}
                            </small>
                          </div>
                        )}
                      </Col>
                    </div>
                  )} */}
{/* CAMERA SELECTION SECTION */}
{cameraData.length > 0 && (
  <div className="row mb-4">
    <Col sm={12}>
      <Label className="fw-bold mb-3">Camera Selection</Label>

      {/* Multi Camera Selection Dropdown */}
      <div className="mb-3">
        <Label htmlFor="multiCameraSelect" className="form-label">
          Select Multiple Cameras
        </Label>
        {
          console.log('cameraData', cameraData)
        }
        <Select
          id="multiCameraSelect"
          isMulti
          options={cameraData}
          placeholder="Select Cameras"
          value={multiCameraSelected}
          onChange={(selected) => {
            setMultiCameraSelected(selected || []);
            setCameraSelectionError('');
          }}
          classNamePrefix="react-select"
          className="react-select-container"
        />
        {multiCameraSelected.length > 0 && (
          <div className="mt-2">
            <small className="text-success">
              <i className="bx bx-check-circle me-1"></i>
              {multiCameraSelected.length} camera
              {multiCameraSelected.length > 1 ? 's' : ''} selected
            </small>
          </div>
        )}
      </div>

      {/* Camera Selection Error */}
      {cameraSelectionError && (
        <div className="alert alert-danger py-2" role="alert">
          <small>
            <i className="bx bx-error-circle me-1"></i>
            {cameraSelectionError}
          </small>
        </div>
      )}

      {/* Camera Selection Summary */}
      {multiCameraSelected.length > 0 && (
        <div className="alert alert-info py-2" role="alert">
          <small>
            <strong>Camera Configuration:</strong>
            Multi-camera mode with {multiCameraSelected.length} cameras
          </small>
        </div>
      )}
    </Col>
  </div>
)}

                  <div className="row mb-4">
                    <Col sm={12}>
                      <FormGroup check>
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
                    </FormGroup>
                    {includeCamera && cameraOpen && (
                      <>
                        {videoInputDevices.length > 1 && (
                          <div className="row mb-3">
                            <Col sm={12}>
                              <Label>Select Camera for QR Scanning</Label>
                              <Input
                                type="select"
                                className="form-control"
                                value={selectedCamera || ''}
                                onChange={handleCameraChange}
                              >
                                <option value="">Select Camera Device</option>
                                {videoInputDevices.map((device, index) => (
                                  <option key={device.deviceId} value={device.deviceId}>
                                    {device.label || `Camera ${index + 1}`}
                                  </option>
                                ))}
                              </Input>
                            </Col>
                          </div>
                        )}

                        <Input
                          type="text"
                          className="form-control mb-3"
                          id="example-number-input"
                          placeholder="QR/Bar Code will appear here"
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
                              {videoInputDevices.length === 0 ? (
                                <div className='d-flex flex-column justify-content-center align-items-center' style={{ width: '100%' }}>
                                  <h5 style={{ fontWeight: 'bold', color: 'red' }}>No Camera Found</h5>
                                  <p>Please connect a camera device and try again.</p>
                                </div>
                              ) : (
                                <>
                                  <div className="camera-container mb-3" style={{ position: 'relative', border: '2px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
                                    <Webcam
                                      key={selectedCamera || 'default'}
                                      videoConstraints={selectedCamera ? { deviceId: selectedCamera } : {}}
                                      style={{ width: '100%', height: 'auto', display: 'block' }}
                                      onUserMedia={() => handleWebcamLoad()}
                                      onUserMediaError={() => handleWebcamLoad('error')}
                                      screenshotFormat="image/png"
                                      ref={webcamRef}
                                    />
                                    {selectedCamera && (
                                      <div style={{ 
                                        position: 'absolute', 
                                        top: '10px', 
                                        left: '10px', 
                                        background: 'rgba(0,0,0,0.7)', 
                                        color: 'white', 
                                        padding: '5px 10px', 
                                        borderRadius: '4px', 
                                        fontSize: '12px' 
                                      }}>
                                        {videoInputDevices.find(device => device.deviceId === selectedCamera)?.label || 'Selected Camera'}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="d-flex gap-2 align-items-center">
                                    <Button 
                                      color='primary' 
                                      onClick={checkBarCode}
                                      disabled={!selectedCamera && videoInputDevices.length > 1}
                                    >
                                      <i className="bx bx-qr-scan me-1"></i>
                                      Capture QR/Barcode
                                    </Button>
                                    
                                    {qr_value && qr_value !== 'QR NOT FOUND' && (
                                      <Button 
                                        color='success' 
                                        size='sm'
                                        disabled
                                      >
                                        <i className="bx bx-check me-1"></i>
                                        QR Captured
                                      </Button>
                                    )}
                                    
                                    {qr_not_found && (
                                      <Button 
                                        color='warning' 
                                        size='sm'
                                        disabled
                                      >
                                        <i className="bx bx-error me-1"></i>
                                        QR Not Found
                                      </Button>
                                    )}
                                  </div>
                                  
                                  {videoInputDevices.length > 1 && !selectedCamera && (
                                    <div className="alert alert-info mt-2" role="alert">
                                      <small>
                                        <i className="bx bx-info-circle me-1"></i>
                                        Multiple cameras detected. Please select a camera from the dropdown above.
                                      </small>
                                    </div>
                                  )}
                                </>
                              )}
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
                      <Button 
                        color="primary" 
                        className="w-md" 
                        onClick={submitForm}
                        disabled={adding_component}
                      >
                        {adding_component ? (
                          <>
                            <Spinner size="sm" className="me-2" />
                            Adding...
                          </>
                        ) : (
                          'ADD STAGE'
                        )}
                      </Button>
                    </div>
                  </Col>
                </div>
              </Form>
            </div>
          </Modal>



         <Modal isOpen={editStageModal} onClosed={handleModalClosed} size="lg">
  <div className="modal-header">
    <h5 className="modal-title">
      {"Edit Stage"}
    </h5>
    <button
      type="button"
      onClick={() => setEditStageModal(false)}
      className="close"
    >
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
              <div className="modal-body">
                <Form>
                  <div className="row mb-4">
                    <Col sm={12}>
                      <Label>Stage name</Label>
                      <Input
                        type="text"
                        className="form-control"
                        id="horizontal-compname-Input"
                        placeholder="Enter Your Stage Name"
                        value={stageName}
                        maxLength="40"
                        onChange={(e) => setStageName(e.target.value)}
                      />
                      {componentNameError && <p className="error-message" style={{ color: "red" }}>{componentNameError}</p>}
                    </Col>
                  </div>
                  
                  <div className="row mb-4">
                    <Col sm={12}>
                      <Label>Stage code</Label>
                      <Input
                        type="text"
                        className="form-control"
                        id="example-number-input"
                        placeholder="Enter Your Stage Code"
                        maxLength="32"
                        value={stageCode}
                        onChange={(e) => setStageCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 8))}
                      />
                      {componentCodeError && <p className="error-message" style={{ color: "red" }}>{componentCodeError}</p>}
                    </Col>
                  </div>

                  {/* CAMERA SELECTION SECTION */}
                  {cameraData.length > 0 && (
                    <div className="row mb-4">
                      <Col sm={12}>
                        <Label className="fw-bold mb-3">Camera Selection</Label>
                        
                        {/* Camera Mode Selection */}
                        <div className="d-flex gap-4 mb-3">
                          <div className="d-flex align-items-center">
                            <Input
                              type="radio"
                              name="cameraMode"
                              id="multiCameraMode"
                              checked={cameraMode === 'multi'}
                              onChange={() => {
                                setCameraMode('multi');
                                setSingleCameraSelected(null);
                                setCameraSelectionError('');
                              }}
                            />
                            <Label htmlFor="multiCameraMode" className="ms-2 mb-0">
                              Multi Camera Selection
                            </Label>
                          </div>

                          <div className="d-flex align-items-center">
                            <Input
                              type="radio"
                              name="cameraMode"
                              id="singleCameraMode"
                              checked={cameraMode === 'single'}
                              onChange={() => {
                                setCameraMode('single');
                                setMultiCameraSelected([]);
                                setCameraSelectionError('');
                              }}
                            />
                            <Label htmlFor="singleCameraMode" className="ms-2 mb-0">
                              Single Camera Selection
                            </Label>
                          </div>
                        </div>

                        {/* Camera Selection Dropdowns */}
                        {cameraMode === 'multi' && (
                          <div className="mb-3">
                            <Label htmlFor="multiCameraSelect" className="form-label">
                              Select Multiple Cameras
                            </Label>
                            {
                              console.log('cameraDsssssata', cameraData)
                            }
                            <Select
                              id="multiCameraSelect"
                              isMulti
                              options={cameraData}
                              placeholder="Select Cameras"
                              value={multiCameraSelected}
                              onChange={(selected) => {
                                setMultiCameraSelected(selected || []);
                                setCameraSelectionError('');
                              }}
                              classNamePrefix="react-select"
                              className="react-select-container"
                            />
                            {multiCameraSelected.length > 0 && (
                              <div className="mt-2">
                                <small className="text-success">
                                  <i className="bx bx-check-circle me-1"></i>
                                  {multiCameraSelected.length} camera{multiCameraSelected.length > 1 ? 's' : ''} selected
                                </small>
                              </div>
                            )}
                          </div>
                        )}

                        {cameraMode === 'single' && (
                          <div className="mb-3">
                            <Label htmlFor="singleCameraSelect" className="form-label">
                              Select Single Camera
                            </Label>
                            <Select
                              id="singleCameraSelect"
                              isMulti={false}
                              options={cameraData}
                              placeholder="Select a Camera"
                              value={singleCameraSelected}
                              onChange={(selected) => {
                                setSingleCameraSelected(selected);
                                setCameraSelectionError('');
                              }}
                              classNamePrefix="react-select"
                              className="react-select-container"
                            />
                            {singleCameraSelected && (
                              <div className="mt-2">
                                <small className="text-success">
                                  <i className="bx bx-check-circle me-1"></i>
                                  Camera selected: {singleCameraSelected.label}
                                </small>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Camera Selection Error */}
                        {cameraSelectionError && (
                          <div className="alert alert-danger py-2" role="alert">
                            <small>
                              <i className="bx bx-error-circle me-1"></i>
                              {cameraSelectionError}
                            </small>
                          </div>
                        )}

                        {/* Camera Selection Summary */}
                        {((cameraMode === 'multi' && multiCameraSelected.length > 0) || 
                          (cameraMode === 'single' && singleCameraSelected)) && (
                          <div className="alert alert-info py-2" role="alert">
                            <small>
                              <strong>Camera Configuration:</strong>
                              {cameraMode === 'multi' ? (
                                <span> Multi-camera mode with {multiCameraSelected.length} cameras</span>
                              ) : (
                                <span> Single-camera mode with 1 camera</span>
                              )}
                            </small>
                          </div>
                        )}
                      </Col>
                    </div>
                  )}

                  <div className="row mb-4">
                    <Col sm={12}>
                      <FormGroup check>
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
                    </FormGroup>
                    {includeCamera && cameraOpen && (
                      <>
                        {videoInputDevices.length > 1 && (
                          <div className="row mb-3">
                            <Col sm={12}>
                              <Label>Select Camera for QR Scanning</Label>
                              <Input
                                type="select"
                                className="form-control"
                                value={selectedCamera || ''}
                                onChange={handleCameraChange}
                              >
                                <option value="">Select Camera Device</option>
                                {videoInputDevices.map((device, index) => (
                                  <option key={device.deviceId} value={device.deviceId}>
                                    {device.label || `Camera ${index + 1}`}
                                  </option>
                                ))}
                              </Input>
                            </Col>
                          </div>
                        )}

                        <Input
                          type="text"
                          className="form-control mb-3"
                          id="example-number-input"
                          placeholder="QR/Bar Code will appear here"
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
                              {videoInputDevices.length === 0 ? (
                                <div className='d-flex flex-column justify-content-center align-items-center' style={{ width: '100%' }}>
                                  <h5 style={{ fontWeight: 'bold', color: 'red' }}>No Camera Found</h5>
                                  <p>Please connect a camera device and try again.</p>
                                </div>
                              ) : (
                                <>
                                  <div className="camera-container mb-3" style={{ position: 'relative', border: '2px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
                                    <Webcam
                                      key={selectedCamera || 'default'}
                                      videoConstraints={selectedCamera ? { deviceId: selectedCamera } : {}}
                                      style={{ width: '100%', height: 'auto', display: 'block' }}
                                      onUserMedia={() => handleWebcamLoad()}
                                      onUserMediaError={() => handleWebcamLoad('error')}
                                      screenshotFormat="image/png"
                                      ref={webcamRef}
                                    />
                                    {selectedCamera && (
                                      <div style={{ 
                                        position: 'absolute', 
                                        top: '10px', 
                                        left: '10px', 
                                        background: 'rgba(0,0,0,0.7)', 
                                        color: 'white', 
                                        padding: '5px 10px', 
                                        borderRadius: '4px', 
                                        fontSize: '12px' 
                                      }}>
                                        {videoInputDevices.find(device => device.deviceId === selectedCamera)?.label || 'Selected Camera'}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="d-flex gap-2 align-items-center">
                                    <Button 
                                      color='primary' 
                                      onClick={checkBarCode}
                                      disabled={!selectedCamera && videoInputDevices.length > 1}
                                    >
                                      <i className="bx bx-qr-scan me-1"></i>
                                      Capture QR/Barcode
                                    </Button>
                                    
                                    {qr_value && qr_value !== 'QR NOT FOUND' && (
                                      <Button 
                                        color='success' 
                                        size='sm'
                                        disabled
                                      >
                                        <i className="bx bx-check me-1"></i>
                                        QR Captured
                                      </Button>
                                    )}
                                    
                                    {qr_not_found && (
                                      <Button 
                                        color='warning' 
                                        size='sm'
                                        disabled
                                      >
                                        <i className="bx bx-error me-1"></i>
                                        QR Not Found
                                      </Button>
                                    )}
                                  </div>
                                  
                                  {videoInputDevices.length > 1 && !selectedCamera && (
                                    <div className="alert alert-info mt-2" role="alert">
                                      <small>
                                        <i className="bx bx-info-circle me-1"></i>
                                        Multiple cameras detected. Please select a camera from the dropdown above.
                                      </small>
                                    </div>
                                  )}
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </Col>
                </div>
                
                <div className="row justify-content-end">
                  <Col sm={9}>
                    {/* <div className="text-end">
                      <Button 
                        color="primary" 
                        className="w-md" 
                        onClick={submitForm}
                        disabled={adding_component}
                      >
                        {adding_component ? (
                          <>
                            <Spinner size="sm" className="me-2" />
                            Adding...
                          </>
                        ) : (
                          'ADD STAGE'
                        )}
                      </Button>
                    </div> */}
                      <div className="modal-footer">
                        {/* <Button color="secondary" onClick={() => setEditStageModal(false)}>Cancel</Button> */}
                        <Button
                          color="primary"
                          onClick={submitEditStage}
                        >
                          {"Update Stage" }
                        </Button>
                      </div>
                    </Col>
                  </div>
              </Form>
            </div>
          </Modal>

          <Modal isOpen={modal_center} centered={true}>
            <div className="modal-header">
              <h5 className="modal-title mt-0">Stage Live version details</h5>
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
            <div className='modal-body table-responsive'>
              <Table striped>
                <thead>
                  <tr>
                    <th>comp name</th>
                    <th>comp code</th>
                    <th>Model Name</th>
                    <th>Model version</th>
                  </tr>
                </thead>
                <tbody>
                  {ver_log.map((data, index) => (
                    <tr key={index}>
                      <td>{data.comp_name}</td>
                      <td>{data.comp_code}</td>
                      <td>{data.model_name}</td>
                      <td>
                        {data.model_live_ver.map((value, index) => (
                          <span key={index}>
                            {`V${value}${index < data.model_live_ver.length - 1 ? ', ' : ''}`}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Modal>
        </Container>
      </div>
    </>
  );
};

ManageStage.propTypes = {
  history: PropTypes.any.isRequired
};

export default ManageStage;



// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import MetaTags from 'react-meta-tags';
// import {
//   Container, CardTitle, Button, Col,
//   Row, Modal, Form, Label, Input, Table,
//   FormGroup, Spinner, ButtonGroup,
//   ModalBody, ModalHeader, Card, CardBody,
//   UncontrolledTooltip,CardText
// } from 'reactstrap';
// import urlSocket from "./urlSocket";
// import PropTypes from "prop-types";
// import { useHistory } from 'react-router-dom';
// import { Spin, Switch } from 'antd';
// import SearchField from "react-search-field";
// import Nodata_admin from "assets/images/nodata/nodata_admin.jpg";
// import Swal from 'sweetalert2';
// import Webcam from 'react-webcam';
// import Select from 'react-select';

// import { green } from '@mui/material/colors';
// import { Dialog } from '@mui/material';
// import PaginationComponent from './PaginationComponent';
// import { LoadingOutlined } from '@ant-design/icons';
// import Breadcrumbs from 'components/Common/Breadcrumb';
// import { DEFAULT_RESOLUTION } from './cameraConfig';
// import FullScreenLoader from 'components/Common/FullScreenLoader';

// const ManageStage = ({ history }) => {
//   // Individual state hooks

//   const [compData, setCompData] = useState("");
//   const [stageName, setStageName] = useState("");
//   const [stageCode, setStageCode] = useState("");


//   const [addCompModal, setAddCompModal] = useState(false);
//   const [isCompStatusModalOpen, setIsCompStatusModalOpen] = useState(false);
//   const [modal_center, setModalCenter] = useState(false);
//   const [comp_name, setCompName] = useState("");
//   const [comp_code, setCompCode] = useState("");
//   const [qr_value, setQrValue] = useState("");
//   const [bgremove, setBgRemove] = useState(true);
//   const [includeCamera, setIncludeCamera] = useState(false);
//   const [componentNameError, setComponentNameError] = useState("");
//   const [componentCodeError, setComponentCodeError] = useState("");
//   const [qr_valueerror, setQrValueError] = useState("");
//   const [componentList, setComponentList] = useState([]);
//   const [originalData, setOriginalData] = useState([]);
//   const [search_componentList, setSearchComponentList] = useState([]);
//   const [ver_log, setVerLog] = useState([]);
//   const [compAssignedStations, setCompAssignedStations] = useState([]);
//   const [modelInfo, setModelInfo] = useState([]);
//   const [SearchField, setSearchField] = useState("");
//   const [selectFilter, setSelectFilter] = useState(0);
//   const [modelfilter, setModelFilter] = useState(0);
//   const [filter_compStatus, setFilterCompStatus] = useState('all');
//   const [filter_modelStatus, setFilterModelStatus] = useState('all');
//   const [sorting, setSorting] = useState({ field: "", order: "" });
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [currentPage_stock, setCurrentPageStock] = useState(1);
//   const [items_per_page_stock, setItemsPerPageStock] = useState(100);
//   const [isLoading, setIsLoading] = useState(false);
//   const [componentLoading, setComponentLoading] = useState(true);
//   const [adding_component, setAddingComponent] = useState(false);
//   const [qr_not_found, setQrNotFound] = useState(false);
//   const [togglingCompStatus, setTogglingCompStatus] = useState({});
//   const [compStatusDataTemp, setCompStatusDataTemp] = useState({});
//   const [cameraOpen, setCameraOpen] = useState(false);
//   const [webcamEnabled, setWebcamEnabled] = useState(true);
//   const [cameraDisconnected, setCameraDisconnected] = useState(false);
//   const [videoInputDevices, setVideoInputDevices] = useState([]);
//   const [selectedCamera, setSelectedCamera] = useState(null);

//   // NEW CHECKBOX STATE
//   const [selectedStages, setSelectedStages] = useState([]);
//   const [isAllSelected, setIsAllSelected] = useState(false);
//   const [isMultiCamera, setIsMultiCamera] = useState(false);
// const [isSingleCamera, setIsSingleCamera] = useState(false);
// const [cameraMode, setCameraMode] = useState(''); // 'multi' or 'single'

// // const [multiCameraSelected, setMultiCameraSelected] = useState([]);
// // const [singleCameraSelected, setSingleCameraSelected] = useState(null);
// //   const [cameraData, setCameraData] = useState([]);
// // const cameraOptions = [
// //   { value: 'cam1', label: 'Camera 1' },
// //   { value: 'cam2', label: 'Camera 2' },
// //   { value: 'cam3', label: 'Camera 3' }
// // ];
// // State
// const [multiCameraSelected, setMultiCameraSelected] = useState([]);
// const [singleCameraSelected, setSingleCameraSelected] = useState(null);
// const [cameraData, setCameraData] = useState([]); 
// console.log('cameraData', cameraData)

//   const webcamRef = useRef(null);
//   const historyHook = useHistory();



//     useEffect(() => {
//       const data = JSON.parse(sessionStorage.getItem('manageData'));
//       console.log('maganestage seesion data', data)
//       if (data) {
//         const compData = data?.compInfo;
//         console.log('compDataxx', compData)
//         const compInfo = data?.compInfo.comp_name;
//         const compcode = data?.compInfo.comp_code;
//         const modelInfo = data.modelInfo;
//         setCompName(compInfo)
//         setCompCode(compcode)
//         setCompData(compData)

//     getCameraCollection();

//         getStage_info(compData);
//         getModel_info();

//       }
//     }, []);

//   // Effects
//   useEffect(() => {
//     const paginationCompInfo = JSON.parse(sessionStorage.getItem('paginationCompInfo'));
//     if (paginationCompInfo?.currentPage) {
//       setCurrentPage(paginationCompInfo.currentPage);
//     }

//     // getStage_info();
//     // getModel_info();
//     // checkWebcam();
//     checkWebcam();


//     navigator.mediaDevices.addEventListener('devicechange', checkWebcam);
//     // sessionStorage.removeItem("manageData");
//     sessionStorage.removeItem('profiletype');
//     sessionStorage.removeItem('type');

//     return () => {
//       navigator.mediaDevices.removeEventListener('devicechange', checkWebcam);
//       sessionStorage.setItem("paginationCompInfo", JSON.stringify({ currentPage }));
//       sessionStorage.removeItem("paginationCompInfo");
//     };
//   }, [currentPage]);

//   // Update checkbox states when component list changes
//   useEffect(() => {
//     // Reset selected stages when component list changes
//     setSelectedStages([]);
//     setIsAllSelected(false);
//   }, [componentList]);

//   // Update "Select All" state based on selected stages
//   useEffect(() => {
//     const currentPageItems = componentList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
//     const currentPageIds = currentPageItems.map(item => item._id);
//     const selectedCurrentPageItems = selectedStages.filter(id => currentPageIds.includes(id));
    
//     setIsAllSelected(currentPageItems.length > 0 && selectedCurrentPageItems.length === currentPageItems.length);
//   }, [selectedStages, componentList, currentPage, itemsPerPage]);





//   // CHECKBOX FUNCTIONS
//   const handleSelectAll = (e) => {
//     const isChecked = e.target.checked;
//     const currentPageItems = componentList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
//     const currentPageIds = currentPageItems.map(item => item._id);
    
//     if (isChecked) {
//       // Add current page items to selected stages (avoid duplicates)
//       setSelectedStages(prev => {
//         const newSelected = [...prev];
//         currentPageIds.forEach(id => {
//           if (!newSelected.includes(id)) {
//             newSelected.push(id);
//           }
//         });
//         return newSelected;
//       });
//     } else {
//       // Remove current page items from selected stages
//       setSelectedStages(prev => prev.filter(id => !currentPageIds.includes(id)));
//     }
//   };

//   const handleStageSelect = (stageId, isChecked) => {
//     if (isChecked) {
//       setSelectedStages(prev => [...prev, stageId]);
//     } else {
//       setSelectedStages(prev => prev.filter(id => id !== stageId));
//     }
//   };


//   const getSelectionOrder = (stageId) => {
//   return selectedStages.indexOf(stageId) + 1;
// };

//   const isStageSelected = (stageId) => {
//     return selectedStages.includes(stageId);
//   };

//   const getSelectedStagesCount = () => {
//     return selectedStages.length;
//   };

//   const getSelectedStagesData = () => {
//     return componentList.filter(stage => selectedStages.includes(stage._id));
//   };

//   const clearAllSelections = () => {
//     setSelectedStages([]);
//     setIsAllSelected(false);
//   };

//   const back = () => {
//     console.log('back is working');
//      historyHook.push('/comp_info');
//   };
//   // Bulk operations for selected stages
//   const handleBulkOperation = (operation) => {
//     const selectedData = getSelectedStagesData();
    
//     switch (operation) {

//        case 'AssignStation':
//         Swal.fire({
//           title: 'Assign Station Selected Stages?',
//           text: `Are you sure you want to Assign Station ${selectedData.length} selected stages?`,
//           icon: 'question',
//           showCancelButton: true,
//           confirmButtonColor: '#3085d6',
//           cancelButtonColor: '#d33',
//           confirmButtonText: 'Yes, activate them!'
//         }).then((result) => {
//           if (result.isConfirmed) {
//             // Implement bulk activate logic here
//             console.log('Assign Station this stage:', selectedData);
//             // You can call your bulk activation API here
//           }
//         });
//         break;
//       case 'activate':
//         Swal.fire({
//           title: 'Activate Selected Stages?',
//           text: `Are you sure you want to activate ${selectedData.length} selected stages?`,
//           icon: 'question',
//           showCancelButton: true,
//           confirmButtonColor: '#3085d6',
//           cancelButtonColor: '#d33',
//           confirmButtonText: 'Yes, activate them!'
//         }).then((result) => {
//           if (result.isConfirmed) {
//             // Implement bulk activate logic here
//             console.log('Activating stages:', selectedData);
//             // You can call your bulk activation API here
//           }
//         });
//         break;
      
//       case 'deactivate':
//         Swal.fire({
//           title: 'Deactivate Selected Stages?',
//           text: `Are you sure you want to deactivate ${selectedData.length} selected stages?`,
//           icon: 'warning',
//           showCancelButton: true,
//           confirmButtonColor: '#d33',
//           cancelButtonColor: '#3085d6',
//           confirmButtonText: 'Yes, deactivate them!'
//         }).then((result) => {
//           if (result.isConfirmed) {
//             // Implement bulk deactivate logic here
//             console.log('Deactivating stages:', selectedData);
//             // You can call your bulk deactivation API here
//           }
//         });
//         break;
        
//       case 'delete':
//         Swal.fire({
//           title: 'Delete Selected Stages?',
//           text: `Are you sure you want to delete ${selectedData.length} selected stages? This action cannot be undone!`,
//           icon: 'warning',
//           showCancelButton: true,
//           confirmButtonColor: '#d33',
//           cancelButtonColor: '#3085d6',
//           confirmButtonText: 'Yes, delete them!'
//         }).then((result) => {
//           if (result.isConfirmed) {
//             // Implement bulk delete logic here
//             console.log('Deleting stages:', selectedData);
//             // You can call your bulk delete API here
//           }
//         });
//         break;
        
//       default:
//         console.log('Unknown operation:', operation);
//     }
//   };

//   // Helper functions
//   const error_handler = useCallback((error) => {
//     sessionStorage.removeItem("authUser");
//     historyHook.push("/login");
//   }, [historyHook]);

//   const getStage_info = useCallback(async (compData) => {
//     console.log('compData._id', compData._id)
//     try {
//       const response = await urlSocket.post('/get_stage_info', {parent_comp_id: compData._id},{ mode: 'no-cors' });
//       console.log('response254', response)
//       if (response.data.error === "Tenant not found") {
//         error_handler(response.data.error);
//       } else {
//         await statusinfo(response.data);
//       }
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setComponentLoading(false);
//     }
//   }, [error_handler]);

//   //   const getCameraCollection = async () => {
//   //   try {
//   //     const response = await urlSocket.post('/get_camera_collection',{ mode: 'no-cors' });
//   //     console.log('Camera collection:', response.data);
//   //     setCameraData(response.data || []); 
//   //   } catch (error) {
//   //     console.error('Error fetching camera collection:', error);
//   //   } 
//   // };


//   const getCameraCollection = async () => {
//     try {
//       const response = await urlSocket.post('/get_camera_collection', { mode: 'no-cors' });
//       console.log('Camera collection:', response.data);
//       const cameras = (response.data && response.data.length > 0)
//         ? response.data[0].camera_position
//         : [];
//       console.log('cameras', cameras);


//       const options = cameras.map((cam) => ({
//         value: cam.deviceId,
//         v_id: cam.v_id,
//         p_id: cam.v_id,
//         port: cam.portNumber,
//         label: cam.positionName || cam.label,
//       }));

//       setCameraData(options);
//   } catch (error) {
//     console.error('Error fetching camera collection:', error);
//   }
// };



//   const getModel_info = useCallback(async () => {
//     try {
//       const response = await urlSocket.post('/get_model_info', { mode: 'no-cors' });
//       if (response.data.error === "Tenant not found") {
//         error_handler(response.data.error);
//       } else {
//         setModelInfo(response.data);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   }, [error_handler]);

//   const submitForm = useCallback(async () => {
//     setComponentNameError('');
//     setComponentCodeError('');
//     setQrValueError('');

//     const trimmedStageName = stageName.trim().toUpperCase();
//     const trimmedStageCode = stageCode.trim().toUpperCase();
//     const compNameRegex = /^[A-Za-z0-9 _-]+$/;

//     if (!trimmedStageName || !trimmedStageCode) {
//       setComponentNameError(!trimmedStageName ? 'The Stage name is required' : '');
//       setComponentCodeError(!trimmedStageCode ? 'The Stage code is required' : '');
//       return;
//     }

//     if (trimmedStageCode.includes('-')) {
//       setComponentCodeError('Component code cannot include the "-" symbol');
//       return;
//     }

//     if (includeCamera && (!qr_value || qr_value === 'QR NOT FOUND')) {
//       setQrValueError('Proper QR/Bar Code is required');
//       return;
//     }

//     if (!compNameRegex.test(trimmedStageName)) {
//       setComponentNameError('Stage name cannot contain special characters like ":"');
//       return;
//     }

//     // console.log('6853b1e66083b03e3b15bbb3', compData._id)

//     try {
//       setAddingComponent(true);
//       const qr_data = includeCamera ? qr_value : '';
//       const response = await urlSocket.post('/api/components/add_stage', {
//         parent_comp_id: compData._id,
//         stage_name: trimmedStageName,
//         stage_code: trimmedStageCode,
//         qr_data,
//         bgremove
//       }, { mode: 'no-cors' });

//       console.log('response337', response)

//       if (response.data.error === "Tenant not found") {
//         error_handler(response.data.error);
//       } else if (response.data === 'stage code is already created') {
//         setComponentCodeError('The Stage code is already created');
//       } else if (response.data === 'stage name is already created') {
//         setComponentNameError('The stage Name is already created');
//       } else if (response.data === 'QR/Bar code is already created') {
//         setQrValueError('QR/Bar code is already created');
//       } else {
//         setAddCompModal(false);
//         setComponentList(response.data);
//         setOriginalData(response.data);
//         setSearchComponentList(response.data);
//         setStageName('');
//         setStageCode('');
//         setComponentCodeError('');
//         setComponentNameError('');
//       }
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setAddingComponent(false);
//     }

//     // await activeOrInactive("all", 0);
//     // await modelFilter("all", 0);
//   }, [stageName, stageCode, qr_value, includeCamera, bgremove]);

//   const bgremovefunction = () => {
//     setBgRemove(prev => !prev);
//   };

//   const statusinfo = async (data) => {
//     console.log('data', data)
//     try {
//       const response = await urlSocket.post('/model_stage_status_change', { 'modelData': data }, { mode: 'no-cors' });
//       if (response.data.error === "Tenant not found") {
//         error_handler(response.data.error);
//       } else {
//         setComponentList(response.data);
//         setOriginalData(response.data);
//         setSearchComponentList(response.data);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const handleModelInfo = async(data) => {
//     console.log('data215', data)
//     let modelInfo_data = {
//       ManageStage: data,
//       modelInfo
//     };
//     console.log('modelInfo_data', modelInfo_data)
//     // await sessionStorage.removeItem("manageData");
//     await sessionStorage.setItem("manageData", JSON.stringify(modelInfo_data));
//     historyHook.push('/manageModel');
//   };

//   const checkIsAssignedToStations = async (data, checked) => {
//     try {
//       const response = await urlSocket.post('/component_assigned_stations', { '_id': data._id, 'comp_status': checked }, { mode: 'no-cors' });
//       if (response.data.error === "Tenant not found") {
//         error_handler(response.data.error);
//       } else {
//         return response.data.station_list;
//       }
//     } catch (error) {
//       console.error(error);
//       return [];
//     }
//   };

//   const changeComponentStatus = async (checked, data) => {
//     console.log('checked, data', checked, data)
//     setIsCompStatusModalOpen(false);
//     console.log('241', data)
//     let comp_id = data._id;
//     let comp_name = data.comp_name;
//     let comp_code = data.comp_code;

//     try {
//       const response = await urlSocket.post('/comp_status_upd', {
//         '_id': comp_id,
//         'comp_name': comp_name,
//         'comp_code': comp_code,
//         'comp_status': checked
//       }, { mode: 'no-cors' });

//       console.log('response', response)

//       if (response.data.error === "Tenant not found") {
//         error_handler(response.data.error);
//       } else {
//         Swal.fire({
//           icon: 'success',
//           title: `"${comp_name}" has been set to <span style="color: ${checked ? 'green' : 'red'}">${checked ? 'Active' : 'Inactive'}</span>.`,
//           showConfirmButton: false,
//           timer: 4000
//         });

//         if (selectFilter === 1) {
//           activeOrInactive(true, 1);
//         } else if (selectFilter === 2) {
//           activeOrInactive(false, 2);
//         } else if (selectFilter === 0) {
//           activeOrInactive("all", 0);
//         }
//       }
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setTogglingCompStatus(prev => ({ ...prev, [data._id]: false }));
//       setCompStatusDataTemp({});
//     }
//   };

//   const toggleCompStatusModal = async () => {
//     const { data } = compStatusDataTemp;
//     setIsCompStatusModalOpen(false);
//     setTogglingCompStatus(prev => ({ ...prev, [data._id]: false }));
//   };

//   const onChange = async (checked, data) => {
//     setTogglingCompStatus(prev => ({ ...prev, [data._id]: true }));
//     setCompStatusDataTemp({ data, checked });

//     try {
//       const station_list = await checkIsAssignedToStations(data, checked);
//       const isAssignedToStations = station_list.length > 0;

//       if (!isAssignedToStations) {
//         await changeComponentStatus(checked, data);
//       } else {
//         setCompAssignedStations(station_list);
//         setIsCompStatusModalOpen(true);
//       }
//     } catch (error) {
//       console.log('second')
//       console.error("Error toggling component status:", error);
//       setTogglingCompStatus(prev => ({ ...prev, [data._id]: false }));
//       setCompStatusDataTemp({});
//     }
//   };

//   const logComp = (data) => {
//     if (data.datasets === undefined) {
//       data.datasets = [];
//     }
//     let { comp_name, comp_code, _id } = data;

//     let datas = {
//       component_name: comp_name,
//       component_code: comp_code,
//       datasets: data.datasets,
//       status: data.status,
//       positive: data.positive,
//       negative: data.negative,
//       posble_match: data.posble_match,
//       _id,
//       config_data: {} // Assuming config_data was part of state, but not shown in original
//     };
//     sessionStorage.removeItem("compData");
//     sessionStorage.setItem("compData", JSON.stringify(datas));
//     historyHook.push('/comp_log');
//   };

//   const manageStation = (value) => {
//     let data = {
//       component_info: value,
//       page_info: '/comp_info'
//     };
//     sessionStorage.removeItem("InfoComp");
//     sessionStorage.setItem("InfoComp", JSON.stringify(data));
//     historyHook.push('/profileCreation');
//   };

//   const info = (data) => {
//     setModalCenter(true);
//     try {
//       urlSocket.post('/version_info', { 'comp_id': data._id }, { mode: 'no-cors' })
//         .then((response) => {
//           if (response.data.error === "Tenant not found") {
//             error_handler(response.data.error);
//           } else {
//             const sortedData = response.data.sort((a, b) => a.model_live_ver - b.model_live_ver);
//             setVerLog(sortedData);
//           }
//         })
//         .catch((error) => {
//           console.log(error);
//         });
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const activeOrInactive = async (string, value) => {
//     setSelectFilter(value);
//     setFilterCompStatus(string);
//     setCurrentPage(1);

//     try {
//       const response = await urlSocket.post('/active_inactive', { 'is_active': string, 'model_status': filter_modelStatus }, { mode: 'no-cors' });
//       if (response.data.error === "Tenant not found") {
//         error_handler(response.data.error);
//       } else {
//         if (!response.data || response.data.length === 0) {
//           setComponentList([]);
//           setSearchComponentList([]);
//         } else {
//           setComponentList(response.data);
//           setSearchComponentList(response.data);
//         }
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const modelFilter = async (str, value) => {
//     setModelFilter(value);
//     setFilterModelStatus(str);
//     setCurrentPage(1);

//     try {
//       const response = await urlSocket.post('/model_status_filter', { 'model_status': str, 'comp_status': filter_compStatus }, { mode: 'no-cors' });
//       if (response.data.error === "Tenant not found") {
//         error_handler(response.data.error);
//       } else {
//         if (!response.data || response.data.length === 0) {
//           setComponentList([]);
//           setSearchComponentList([]);
//         } else {
//           setComponentList(response.data);
//           setSearchComponentList(response.data);
//         }
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const onSearch = (search) => {
//     setSearchField(search);
//     setCurrentPageStock(1);
//     setCurrentPage(1);
//     setTimeout(() => {
//       dataListProcess();
//     }, 100);
//   };

//   const dataListProcess = () => {
//     try {
//       let tempList = [...search_componentList];

//       if (SearchField) {
//         tempList = tempList.filter(d =>
//           d.comp_name.toUpperCase().includes(SearchField.toUpperCase()) ||
//           d.comp_code.toUpperCase().includes(SearchField.toUpperCase())
//         );
//       }

//       if (sorting.field) {
//         const reversed = sorting.order === "asc" ? 1 : -1;
//         tempList = tempList.sort((a, b) => reversed * a[sorting.field].localeCompare(b[sorting.field]));
//       }

//       const slicedData = tempList.slice(
//         (currentPage_stock - 1) * items_per_page_stock,
//         (currentPage_stock - 1) * items_per_page_stock + items_per_page_stock
//       );
//       setComponentList(slicedData);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const handleModalClosed = () => {
//     setAddCompModal(false);
//     // setCompName('');
//     // setCompCode('');
//     setComponentNameError('');
//     setComponentCodeError('');
//     setCameraOpen(false);
//     setIncludeCamera(false);
//     setQrValue('');
//     setQrValueError('');
//     setBgRemove(true);
//     setSelectedCamera(null);
//     setQrNotFound(false);
//     setIsLoading(false);
//   };

//   const handleIncludeCameraToggle = async () => {
//     const newIncludeCamera = !includeCamera;
//     setIncludeCamera(newIncludeCamera);
//     setCameraOpen(newIncludeCamera);
//     setQrValueError('');
//     setQrValue('');
//     setQrNotFound(false);
    
//     if (newIncludeCamera) {
//       setIsLoading(true);
//       // Refresh camera devices and auto-select if only one available
//       await checkWebcam();
//       if (videoInputDevices.length === 1) {
//         setSelectedCamera(videoInputDevices[0].deviceId);
//       } else if (videoInputDevices.length === 0) {
//         setSelectedCamera(null);
//       }
//     } else {
//       setSelectedCamera(null);
//       setIsLoading(false);
//     }
//   };

//   const handleWebcamLoad = (msg) => {
//     if (msg === 'error') {
//       setIsLoading(true);
//     } else {
//       setIsLoading(false);
//     }
//   };

//   const checkBarCode = async () => {
//     setQrNotFound(false);
//     setQrValueError('');

//     const formData = new FormData();
//     const imageSrc = webcamRef.current.getScreenshot({ width: DEFAULT_RESOLUTION.width, height: DEFAULT_RESOLUTION.height });
//     const blob = await fetch(imageSrc).then((res) => res.blob());
//     const today = new Date();
//     const _today = today.toLocaleDateString();
//     const time = today.toLocaleTimeString().replace(/:/g, '_');
//     const compdata = `${comp_name}_${comp_code}_${_today}_${time}`;
//     formData.append('datasets', blob, `${compdata}.png`);

//     try {
//       const qr_result = await urlSocket.post("/api/components/qr_add_comp", formData, {
//         headers: { "content-type": "multipart/form-data" },
//         mode: "no-cors"
//       });

//       if (qr_result.data.error === "Tenant not found") {
//         error_handler(qr_result.data.error);
//       } else if (qr_result.data !== "QR not found") {
//         setQrValue(qr_result.data.data);
//       } else {
//         setQrNotFound(true);
//         setQrValue(qr_result.data);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const checkWebcam = async () => {
//     try {
//       const devices = await navigator.mediaDevices.enumerateDevices();
//       const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
      
//       setVideoInputDevices(videoInputDevices);
      
//       if (!videoInputDevices.length) {
//         setWebcamEnabled(false);
//         setCameraDisconnected(true);
//         setSelectedCamera(null);
//       } else {
//         setWebcamEnabled(true);
//         setCameraDisconnected(false);
        
//         // Auto-select first camera if none is selected and camera is open
//         if (!selectedCamera && cameraOpen && videoInputDevices.length === 1) {
//           setSelectedCamera(videoInputDevices[0].deviceId);
//         }
//       }
//     } catch (error) {
//       console.error('Error checking devices:', error);
//       setWebcamEnabled(false);
//       setCameraDisconnected(true);
//       setVideoInputDevices([]);
//     }
//   };

//   const handleCameraChange = event => {
//     setSelectedCamera(event.target.value);
//   };

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   const showLiveVersionNums = (live_versions) => {
//     const flattenedValues = live_versions.flat();
//     return flattenedValues.map(value => `V${value}`).join(', ');
//   };

//     return (
//         <>
//             {adding_component && <FullScreenLoader />}
//             <div className='page-content'>
//                 <MetaTags>
//                     <title>Stage Information</title>
//                 </MetaTags>
//                 {/* <Breadcrumbs title="STAGE INFORMATION" /> */}
//                 <Row className="mb-3">
//                             <Col xs={9}>
//                               <div className="d-flex align-items-center justify-content-between">
//                                 <div className="mb-0 mt-2 m-2 font-size-14 fw-bold">STAGE INFORMATION</div>
//                               </div>
//                             </Col>
//                             <Col xs={3} className='d-flex align-items-center justify-content-end'>
//                               <button className='btn btn-outline-primary btn-sm me-2' color="primary" 
//                               onClick={back}>
//                                 Back
//                                <i className="mdi mdi-arrow-left"></i>
//                                </button>
//                             </Col>
//                           </Row>
                
//                 <Container fluid={true}>

//                     <Card>

//                         <CardBody>
//                              <CardTitle className="mb-1 ">
//                         <span className="me-2 font-size-12">
//                             Component Name :
//                         </span>
//                         {comp_name}
//                     </CardTitle>
//                     <CardText className="mb-2">
//                         <span className="me-2 font-size-12">
//                             Component Code :
//                         </span>
//                         {comp_code}
//                     </CardText>
//                             <Row className="d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-2 mb-2">
//                                 <Col xs="12" lg="auto" className="text-center">
//                                     <div className="search-box">
//                                         <div className="position-relative">
//                                             <Input
//                                                 onChange={(e) => onSearch(e.target.value)}
//                                                 id="search-user"
//                                                 type="text"
//                                                 className="form-control"
//                                                 placeholder="Search name or code..."
//                                                 value={SearchField}
//                                             />
//                                             <i className="bx bx-search-alt search-icon" />
//                                         </div>
//                                     </div>
//                 </Col>
//                 <Col xs="12" lg="auto" className="text-center">
//                   <ButtonGroup>
//                     <Button className='btn btn-sm' color="primary" outline={selectFilter !== 0} onClick={() => activeOrInactive("all", 0)}>All</Button>
//                     <Button className='btn btn-sm' color="primary" outline={selectFilter !== 1} onClick={() => activeOrInactive(true, 1)}>Active</Button>
//                     <Button className='btn btn-sm' color="primary" outline={selectFilter !== 2} onClick={() => activeOrInactive(false, 2)}>Inactive</Button>
//                   </ButtonGroup>
//                 </Col>
//                 <Col xs="12" lg="auto" className="text-center">
//                   <ButtonGroup>
//                     <Button className='btn btn-sm' color="success" outline={modelfilter !== 0} onClick={() => modelFilter("all", 0)}>All</Button>
//                     <Button className='btn btn-sm' color="success" outline={modelfilter !== 4} onClick={() => modelFilter("No Models Available", 4)}>No Models</Button>
//                     <Button className='btn btn-sm' color="success" outline={modelfilter !== 1} onClick={() => modelFilter("Draft", 1)}>Draft</Button>
//                     <Button className='btn btn-sm' color="success" outline={modelfilter !== 2} onClick={() => modelFilter("Approved", 2)}>Approved</Button>
//                     <Button className='btn btn-sm' color="success" outline={modelfilter !== 3} onClick={() => modelFilter("Live", 3)}>Live</Button>
//                   </ButtonGroup>
//                 </Col>
//                 <Col xs="12" lg="auto" className="text-center">
//                   <Button color="primary" className="w-sm btn btn-sm d-flex align-items-center" onClick={() => setAddCompModal(true)}>
//                     <i className="bx bx-list-plus me-1" style={{ fontSize: '18px' }} /> Add Stage
//                   </Button>
//                 </Col>
//               </Row>

//               {/* SELECTION INFO AND BULK ACTIONS */}
//               {getSelectedStagesCount() > 0 && (
//                 <Row className="mb-3">
//                   <Col xs="12">
//                     <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
//                       <div>
//                         <span className="fw-bold text-primary">
//                           {getSelectedStagesCount()} stage{getSelectedStagesCount() > 1 ? 's' : ''} selected
//                         </span>
//                       </div>
//                       {/* <div className="d-flex gap-2">
//                         <Button size="sm" color="success" onClick={() => handleBulkOperation('activate')}>
//                           <i className="bx bx-check-circle me-1" />
//                           Activate Selected
//                         </Button>
//                         <Button size="sm" color="warning" onClick={() => handleBulkOperation('deactivate')}>
//                           <i className="bx bx-x-circle me-1" />
//                           Deactivate Selected
//                         </Button>
//                         <Button size="sm" color="danger" onClick={() => handleBulkOperation('delete')}>
//                           <i className="bx bx-trash me-1" />
//                           Delete Selected
//                         </Button>
//                         <Button size="sm" color="secondary" onClick={clearAllSelections}>
//                           <i className="bx bx-x me-1" />
//                           Clear Selection
//                         </Button>
//                       </div> */}
//                         <div className="gap-2">

//                           <Button size="sm" color="success" onClick={() => handleBulkOperation('AssignStation')}>
//                             <i className="bx bx-check-circle me-1" />
//                             Assign Station
//                           </Button>

//                         </div>

//                     </div>
//                   </Col>
//                 </Row>
//               )}

//               <div className='table-responsive'>
//                 {componentLoading ? (
//                   <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
//                     <Spinner color="primary" />
//                     <h5 className="mt-4">
//                       <strong>Loading Stage...</strong>
//                     </h5>
//                   </div>
//                 ) : componentList.length === 0 ? (
//                   <div className="container" style={{ position: 'relative', height: '50vh' }}>
//                     <div className="text-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
//                           <img src={Nodata_admin} className="img-sm h-auto" style={{ width: '20%' }} />
//                           <h5 className="text-secondary">No Stage Available</h5>
//                         </div>
//                       </div>
//                     ) : (
//                       <div className='table-responsive'>
//                         <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
//                           <thead className="table-light">
//                             <tr>
//                               <th style={{ width: '50px' }}>
//                                 <div className="form-check">
//                                   <input
//                                     className="form-check-input"
//                                     type="checkbox"
//                                     id="checkboxSelectAll"
//                                     checked={isAllSelected}
//                                     onChange={handleSelectAll}
//                                   />
//                                   <label className="form-check-label" htmlFor="checkboxSelectAll"></label>
//                                 </div>
//                               </th>
//                               <th>S. No.</th>
//                               <th>Stage Name</th>
//                               <th>Stage Code</th>
//                               <th>Stage Status</th>
//                               <th>Model Status</th>
//                               <th>Model Live Version</th>
//                               <th>Actions</th>
//                             </tr>
//                           </thead>
//                           {
//                             console.log('componentList', componentList)
//                           }
//                           <tbody>
//                             {componentList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((data, index) =>

//                             (

//                               <tr key={index} id="recent-list" className={isStageSelected(data._id) ? 'table-active' : ''}>
//                                 {/* {
//                                                     console.log('901', data)
//                         } */}
//                                 {/* <td style={{ backgroundColor: "white" }}>
//                               <div className="form-check">
//                                 <input
//                                   className="form-check-input"
//                                   type="checkbox"
//                                   id={`checkbox-${data._id}`}
//                                   checked={isStageSelected(data._id)}
//                                   onChange={(e) => handleStageSelect(data._id, e.target.checked)}
//                                 />
//                                 <label className="form-check-label" htmlFor={`checkbox-${data._id}`}></label>
//                               </div>
//                             </td> */}
//                                 <td style={{ backgroundColor: "white" }}>
//                                   <div className="form-check d-flex align-items-center">
//                                     <input
//                                       className="form-check-input"
//                                       type="checkbox"
//                                       id={`checkbox-${data._id}`}
//                                       checked={isStageSelected(data._id)}
//                                       onChange={(e) => handleStageSelect(data._id, e.target.checked)}
//                                     />
//                                     <label className="form-check-label" htmlFor={`checkbox-${data._id}`}></label>
//                                     {/* Counter display when checked */}
//                                     {isStageSelected(data._id) && (
//                                       <span className="ms-2 badge bg-primary rounded-pill">
//                                         {getSelectionOrder(data._id)}
//                                       </span>
//                                     )}
//                                   </div>
//                                 </td>

//                                 <td style={{ backgroundColor: "white" }}>{index + 1 + ((currentPage - 1) * itemsPerPage)}</td>
//                                 <td style={{ backgroundColor: "white" }}>{data.stage_name}</td>
//                                 <td style={{ backgroundColor: "white" }}>{data.stage_code}</td>
//                                 <td style={{ backgroundColor: "white" }}>
//                               {togglingCompStatus?.[data._id] ? (
//                                 <div className='ms-2'>
//                                   <Spin indicator={<LoadingOutlined />} />
//                                 </div>
//                               ) : (
//                                 <Switch
//                                   checked={data.stage_status}
//                                   onChange={(e) => onChange(e, data)}
//                                   checkedChildren="Active"
//                                   unCheckedChildren="Inactive"
//                                 />
//                               )}
//                             </td>
//                             <td style={{ backgroundColor: "white" }}>
//                               <span className={data.model_status === 'Live' ? 'badge badge-soft-success' : data.model_status === 'Approved' ? 'badge badge-soft-warning' : data.model_status === 'Draft' ? 'badge badge-soft-info' : 'badge badge-soft-danger'}>
//                                 {data.model_status}
//                               </span>
//                             </td>
//                             <td style={{ backgroundColor: "white" }}>
//                               {data.model_live_ver && data.model_live_ver.length > 0 ? (
//                                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }} onClick={() => console.log(data.model_live_ver)}>
//                                   {showLiveVersionNums(data.model_live_ver)}
//                                   <i className='bx bx-info-circle' onClick={() => info(data)}></i>
//                                 </div>
//                               ) : null}
//                             </td>
//                             <td style={{ backgroundColor: "white" }}>
//                               <div className="d-flex gap-1 align-items-center" style={{ cursor: "pointer" }}>
//                                 {data.comp_status !== false && (
//                                   <>
//                                     <Button color="primary" className='btn btn-sm' onClick={() => handleModelInfo(data)} id={`model-${data._id}`}>
//                                       Model Info
//                                     </Button>
//                                     <UncontrolledTooltip placement="top" target={`model-${data._id}`}>
//                                       Manage Model Info
//                                     </UncontrolledTooltip>
//                                   </>
//                                 )}
//                                 {data.comp_status !== false && (
//                                   <>
//                                     <Button color="primary" className='btn btn-sm' onClick={() => manageStation(data)} id={`station-${data._id}`}>
//                                       Station Info
//                                     </Button>
//                                     <UncontrolledTooltip placement="top" target={`station-${data._id}`}>
//                                       Manage Station Info
//                                     </UncontrolledTooltip>
//                                   </>
//                                 )}
//                                 <>
//                                   <Button color="primary" className='btn btn-sm' onClick={() => logComp(data)} id={`log-${data._id}`}>
//                                     Log Info
//                                   </Button>
//                                   <UncontrolledTooltip placement="top" target={`log-${data._id}`}>
//                                     Log Info
//                                   </UncontrolledTooltip>
//                                 </>
//                               </div>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </Table>
//                     <PaginationComponent
//                       totalItems={componentList.length}
//                       itemsPerPage={itemsPerPage}
//                       currentPage={currentPage}
//                       onPageChange={handlePageChange}
//                     />
//                   </div>
//                 )}
//               </div>
//             </CardBody>
//           </Card>

//           {isCompStatusModalOpen && (
//             <Modal isOpen={isCompStatusModalOpen} toggle={toggleCompStatusModal} centered>
//               <ModalBody>
//                 <p>If you deactivate this Stage, it will be deleted from the following stations:</p>
//                 <Table responsive striped bordered size="sm">
//                   <thead>
//                     <tr>
//                       <th>S.No</th>
//                       <th>Station Name</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {compAssignedStations.map((station, index) => (
//                       <tr key={index}>
//                         <td>{index + 1}</td>
//                         <td>{station}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </Table>
//                 <div className='d-flex my-2 justify-content-end gap-2'>
//                   <Button size='sm' color="danger" onClick={() => changeComponentStatus(compStatusDataTemp.checked, compStatusDataTemp.data)}>
//                     Yes, Deactivate
//                   </Button>
//                   <Button size='sm' color="secondary" onClick={toggleCompStatusModal}>
//                     Cancel
//                   </Button>
//                 </div>
//               </ModalBody>
//             </Modal>
//           )}

//           <Modal isOpen={addCompModal} onClosed={handleModalClosed}>
//             <div className="modal-header">
//               <h5 className="modal-title mt-0" id="myModalLabel">
//                 Enter Stage Details
//               </h5>
//               <button
//                 type="button"
//                 onClick={() => setAddCompModal(false)}
//                 className="close"
//                 data-dismiss="modal"
//                   aria-label="Close"
//                 >
//                   <span aria-hidden="true">&times;</span>
//                 </button>
//               </div>
//               <div className="modal-body">
//                 <Form>
//                   <div className="row mb-4">
//                     <Col sm={12}>
//                       <Label>Stage name</Label>
//                       <Input
//                         type="text"
//                         className="form-control"
//                         id="horizontal-compname-Input"
//                         placeholder="Enter Your Component Name"
//                         value={stageName}
//                         maxLength="40"
//                         onChange={(e) => setStageName(e.target.value)}
//                       />
//                       {componentNameError && <p className="error-message" style={{ color: "red" }}>{componentNameError}</p>}
//                     </Col>
//                   </div>
//                   <div className="row mb-4">
//                     <Col sm={12}>
//                       <Label>Stage code</Label>
//                       <Input
//                         type="text"
//                         className="form-control"
//                         id="example-number-input"
//                         placeholder="Enter Your Component Code"
//                         maxLength="32"
//                         value={stageCode}
//                         onChange={(e) => setStageCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 8))}
//                       />
//                       {componentCodeError && <p className="error-message" style={{ color: "red" }}>{componentCodeError}</p>}
//                     </Col>
//                   </div>



//                   <div className="row mb-4">
//                     {/* Camera Mode Selection */}
//                     <Col md={12} className="mb-3">
//                       <div className="d-flex gap-4">
//                         <div className="d-flex align-items-center">
//                           <Input
//                             type="radio"
//                             name="cameraMode"
//                             id="multiCameraMode"
//                             checked={cameraMode === 'multi'}
//                             onChange={() => {
//                               setCameraMode('multi');
//                               setSingleCameraSelected(null);
//                             }}
//                           />
//                           <Label htmlFor="multiCameraMode" className="ms-2 mb-0">
//                             Multicamera Selection
//                           </Label>
//                         </div>

//                         <div className="d-flex align-items-center">
//                           <Input
//                             type="radio"
//                             name="cameraMode"
//                             id="singleCameraMode"
//                             checked={cameraMode === 'single'}
//                             onChange={() => {
//                               setCameraMode('single');
//                               setMultiCameraSelected([]);
//                             }}
//                           />
//                           <Label htmlFor="singleCameraMode" className="ms-2 mb-0">
//                             Single Camera Selection
//                           </Label>
//                         </div>
//                       </div>
//                     </Col>

//                     {/* Camera Selection Dropdowns */}
//                     {cameraMode === 'multi' && (
//                       <Col md={12} sm={6}>
//                         <Select
//                           id="multiCameraSelect"
//                           isMulti
//                           options={cameraData}
//                           placeholder="Select Cameras"
//                           value={multiCameraSelected}
//                           onChange={(selected) => {
//                             setMultiCameraSelected(selected || []);
//                           }}
//                           classNamePrefix="react-select"
//                         />
//                       </Col>
//                     )}

//                     {cameraMode === 'single' && (
//                       <Col md={12} sm={6}>
//                         <Select
//                           id="singleCameraSelect"
//                           isMulti={false}
//         options={cameraData}
//         placeholder="Select a Camera"
//         value={singleCameraSelected}
//         onChange={(selected) => {
//           setSingleCameraSelected(selected);
//         }}
//         classNamePrefix="react-select"
//       />
//     </Col>
//   )}
// </div>



//                   <div className="row mb-4">
//                     <Col sm={12}>
//                       <FormGroup check>
//                       <Label check>
//                         <Input type="checkbox" checked={bgremove} onChange={bgremovefunction} />
//                         Background Remove if Needed
//                       </Label>
//                     </FormGroup>
//                     <FormGroup check>
//                       <Label check>
//                         <Input type="checkbox" checked={includeCamera} onChange={handleIncludeCameraToggle} />
//                         Capture QR/Bar code
//                       </Label>
//                     </FormGroup>
//                     {includeCamera && cameraOpen && (
//                       <>
//                         {videoInputDevices.length > 1 && (
//                           <div className="row mb-3">
//                             <Col sm={12}>
//                               <Label>Select Camera</Label>
//                               <Input
//                                 type="select"
//                                 className="form-control"
//                                 value={selectedCamera || ''}
//                                 onChange={handleCameraChange}
//                               >
//                                 <option value="">Select Camera Device</option>
//                                 {videoInputDevices.map((device, index) => (
//                                   <option key={device.deviceId} value={device.deviceId}>
//                                     {device.label || `Camera ${index + 1}`}
//                                   </option>
//                                 ))}
//                               </Input>
//                             </Col>
//                           </div>
//                         )}

//                         <Input
//                           type="text"
//                           className="form-control mb-3"
//                           id="example-number-input"
//                           placeholder="QR/Bar Code will appear here"
//                           maxLength="32"
//                           value={qr_value}
//                           disabled
//                         />
//                         {qr_valueerror && <p className="error-message" style={{ color: "red" }}>{qr_valueerror}</p>}
                        
//                         {isLoading && (
//                           <div className='d-flex flex-column justify-content-center align-items-center' style={{ width: '100%' }}>
//                             <Spinner className='mt-2' color="primary" />
//                             <div className='mt-2' style={{ fontWeight: 'bold' }}>Waiting for Camera...</div>
//                           </div>
//                         )}
                        
//                         <div style={{ display: isLoading ? 'none' : 'block' }}>
//                           {cameraDisconnected ? (
//                             <div className='d-flex flex-column justify-content-center align-items-center' style={{ width: '100%' }}>
//                               <h5 style={{ fontWeight: 'bold' }}>Webcam Disconnected</h5>
//                               <Spinner className='mt-2' color="primary" />
//                               <div className='mt-2' style={{ fontWeight: 'bold' }}>Please check your webcam connection...</div>
//                             </div>
//                           ) : (
//                             <>
//                               {videoInputDevices.length === 0 ? (
//                                 <div className='d-flex flex-column justify-content-center align-items-center' style={{ width: '100%' }}>
//                                   <h5 style={{ fontWeight: 'bold', color: 'red' }}>No Camera Found</h5>
//                                   <p>Please connect a camera device and try again.</p>
//                                 </div>
//                               ) : (
//                                 <>
//                                   <div className="camera-container mb-3" style={{ position: 'relative', border: '2px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
//                                     <Webcam
//                                       key={selectedCamera || 'default'}
//                                       videoConstraints={selectedCamera ? { deviceId: selectedCamera } : {}}
//                                       style={{ width: '100%', height: 'auto', display: 'block' }}
//                                       onUserMedia={() => handleWebcamLoad()}
//                                       onUserMediaError={() => handleWebcamLoad('error')}
//                                       screenshotFormat="image/png"
//                                       ref={webcamRef}
//                                     />
//                                     {selectedCamera && (
//                                       <div style={{ 
//                                         position: 'absolute', 
//                                         top: '10px', 
//                                         left: '10px', 
//                                         background: 'rgba(0,0,0,0.7)', 
//                                         color: 'white', 
//                                         padding: '5px 10px', 
//                                         borderRadius: '4px', 
//                                         fontSize: '12px' 
//                                       }}>
//                                         {videoInputDevices.find(device => device.deviceId === selectedCamera)?.label || 'Selected Camera'}
//                                       </div>
//                                     )}
//                                   </div>
                                  
//                                   <div className="d-flex gap-2 align-items-center">
//                                     <Button 
//                                       color='primary' 
//                                       onClick={checkBarCode}
//                                       disabled={!selectedCamera && videoInputDevices.length > 1}
//                                     >
//                                       <i className="bx bx-qr-scan me-1"></i>
//                                       Capture QR/Barcode
//                                     </Button>
                                    
//                                     {qr_value && qr_value !== 'QR NOT FOUND' && (
//                                       <Button 
//                                         color='success' 
//                                         size='sm'
//                                         disabled
//                                       >
//                                         <i className="bx bx-check me-1"></i>
//                                         QR Captured
//                                       </Button>
//                                     )}
                                    
//                                     {qr_not_found && (
//                                       <Button 
//                                         color='warning' 
//                                         size='sm'
//                                         disabled
//                                       >
//                                         <i className="bx bx-error me-1"></i>
//                                         QR Not Found
//                                       </Button>
//                                     )}
//                                   </div>
                                  
//                                   {videoInputDevices.length > 1 && !selectedCamera && (
//                                     <div className="alert alert-info mt-2" role="alert">
//                                       <small>
//                                         <i className="bx bx-info-circle me-1"></i>
//                                         Multiple cameras detected. Please select a camera from the dropdown above.
//                                       </small>
//                                     </div>
//                                   )}
//                                 </>
//                               )}
//                             </>
//                           )}
//                         </div>
//                       </>
//                     )}
//                   </Col>
//                 </div>
//                 <div className="row justify-content-end">
//                   <Col sm={9}>
//                     <div className="text-end">
//                       <Button color="primary" className="w-md" onClick={submitForm}>
//                         ADD
//                       </Button>
//                     </div>
//                   </Col>
//                 </div>
//               </Form>
//             </div>
//           </Modal>

//           <Modal isOpen={modal_center} centered={true}>
//             <div className="modal-header">
//               <h5 className="modal-title mt-0">Stage Live version details</h5>
//               <button
//                 type="button"
//                 onClick={() => setModalCenter(false)}
//                 className="close"
//                 data-dismiss="modal"
//                 aria-label="Close"
//               >
//                 <span aria-hidden="true">&times;</span>
//               </button>
//             </div>
//             <div className='modal-body table-responsive'>
//               <Table striped>
//                 <thead>
//                   <tr>
//                     <th>comp name</th>
//                     <th>comp code</th>
//                     <th>Model Name</th>
//                     <th>Model version</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {ver_log.map((data, index) => (
//                     <tr key={index}>
//                       <td>{data.comp_name}</td>
//                       <td>{data.comp_code}</td>
//                       <td>{data.model_name}</td>
//                       <td>
//                         {data.model_live_ver.map((value, index) => (
//                           <span key={index}>
//                             {`V${value}${index < data.model_live_ver.length - 1 ? ', ' : ''}`}
//                           </span>
//                         ))}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </Table>
//             </div>
//           </Modal>
//         </Container>
//       </div>
//     </>
//   );
// };

// ManageStage.propTypes = {
//   history: PropTypes.any.isRequired
// };

// export default ManageStage;



// // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // import MetaTags from 'react-meta-tags';
// // import {
// //   Container, CardTitle, Button, Col,
// //   Row, Modal, Form, Label, Input, Table,
// //   FormGroup, Spinner, ButtonGroup,
// //   ModalBody, ModalHeader, Card, CardBody,
// //   UncontrolledTooltip
// // } from 'reactstrap';
// // import urlSocket from "./urlSocket";
// // import PropTypes from "prop-types";
// // import { useHistory } from 'react-router-dom';
// // import { Spin, Switch } from 'antd';
// // import SearchField from "react-search-field";
// // import Nodata_admin from "assets/images/nodata/nodata_admin.jpg";
// // import Swal from 'sweetalert2';
// // import Webcam from 'react-webcam';
// // import { green } from '@mui/material/colors';
// // import { Dialog } from '@mui/material';
// // import PaginationComponent from './PaginationComponent';
// // import { LoadingOutlined } from '@ant-design/icons';
// // import Breadcrumbs from 'components/Common/Breadcrumb';
// // import { DEFAULT_RESOLUTION } from './cameraConfig';
// // import FullScreenLoader from 'components/Common/FullScreenLoader';

// // const ManageStage = ({ history }) => {
// //   // Individual state hooks
// //   const [addCompModal, setAddCompModal] = useState(false);
// //   const [isCompStatusModalOpen, setIsCompStatusModalOpen] = useState(false);
// //   const [modal_center, setModalCenter] = useState(false);
// //   const [comp_name, setCompName] = useState("");
// //   const [comp_code, setCompCode] = useState("");
// //   const [qr_value, setQrValue] = useState("");
// //   const [bgremove, setBgRemove] = useState(true);
// //   const [includeCamera, setIncludeCamera] = useState(false);
// //   const [componentNameError, setComponentNameError] = useState("");
// //   const [componentCodeError, setComponentCodeError] = useState("");
// //   const [qr_valueerror, setQrValueError] = useState("");
// //   const [componentList, setComponentList] = useState([]);
// //   const [originalData, setOriginalData] = useState([]);
// //   const [search_componentList, setSearchComponentList] = useState([]);
// //   const [ver_log, setVerLog] = useState([]);
// //   const [compAssignedStations, setCompAssignedStations] = useState([]);
// //   const [modelInfo, setModelInfo] = useState([]);
// //   const [SearchField, setSearchField] = useState("");
// //   const [selectFilter, setSelectFilter] = useState(0);
// //   const [modelfilter, setModelFilter] = useState(0);
// //   const [filter_compStatus, setFilterCompStatus] = useState('all');
// //   const [filter_modelStatus, setFilterModelStatus] = useState('all');
// //   const [sorting, setSorting] = useState({ field: "", order: "" });
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [itemsPerPage, setItemsPerPage] = useState(10);
// //   const [currentPage_stock, setCurrentPageStock] = useState(1);
// //   const [items_per_page_stock, setItemsPerPageStock] = useState(100);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [componentLoading, setComponentLoading] = useState(true);
// //   const [adding_component, setAddingComponent] = useState(false);
// //   const [qr_not_found, setQrNotFound] = useState(false);
// //   const [togglingCompStatus, setTogglingCompStatus] = useState({});
// //   const [compStatusDataTemp, setCompStatusDataTemp] = useState({});
// //   const [cameraOpen, setCameraOpen] = useState(false);
// //   const [webcamEnabled, setWebcamEnabled] = useState(true);
// //   const [cameraDisconnected, setCameraDisconnected] = useState(false);
// //   const [videoInputDevices, setVideoInputDevices] = useState([]);
// //   const [selectedCamera, setSelectedCamera] = useState(null);

// //   // NEW CHECKBOX STATE
// //   const [selectedStages, setSelectedStages] = useState([]);
// //   const [isAllSelected, setIsAllSelected] = useState(false);

// //   const webcamRef = useRef(null);
// //   const historyHook = useHistory();

// //   // Effects
// //   useEffect(() => {
// //     const paginationCompInfo = JSON.parse(sessionStorage.getItem('paginationCompInfo'));
// //     if (paginationCompInfo?.currentPage) {
// //       setCurrentPage(paginationCompInfo.currentPage);
// //     }

// //     getComp_info();
// //     getModel_info();
// //     checkWebcam();

// //     navigator.mediaDevices.addEventListener('devicechange', checkWebcam);
// //     sessionStorage.removeItem("manageData");
// //     sessionStorage.removeItem('profiletype');
// //     sessionStorage.removeItem('type');

// //     return () => {
// //       navigator.mediaDevices.removeEventListener('devicechange', checkWebcam);
// //       sessionStorage.setItem("paginationCompInfo", JSON.stringify({ currentPage }));
// //       sessionStorage.removeItem("paginationCompInfo");
// //     };
// //   }, [currentPage]);

// //   // Update checkbox states when component list changes
// //   useEffect(() => {
// //     // Reset selected stages when component list changes
// //     setSelectedStages([]);
// //     setIsAllSelected(false);
// //   }, [componentList]);

// //   // Update "Select All" state based on selected stages
// //   useEffect(() => {
// //     const currentPageItems = componentList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
// //     const currentPageIds = currentPageItems.map(item => item._id);
// //     const selectedCurrentPageItems = selectedStages.filter(id => currentPageIds.includes(id));
    
// //     setIsAllSelected(currentPageItems.length > 0 && selectedCurrentPageItems.length === currentPageItems.length);
// //   }, [selectedStages, componentList, currentPage, itemsPerPage]);

// //   // CHECKBOX FUNCTIONS
// //   const handleSelectAll = (e) => {
// //     const isChecked = e.target.checked;
// //     const currentPageItems = componentList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
// //     const currentPageIds = currentPageItems.map(item => item._id);
    
// //     if (isChecked) {
// //       // Add current page items to selected stages (avoid duplicates)
// //       setSelectedStages(prev => {
// //         const newSelected = [...prev];
// //         currentPageIds.forEach(id => {
// //           if (!newSelected.includes(id)) {
// //             newSelected.push(id);
// //           }
// //         });
// //         return newSelected;
// //       });
// //     } else {
// //       // Remove current page items from selected stages
// //       setSelectedStages(prev => prev.filter(id => !currentPageIds.includes(id)));
// //     }
// //   };

// //   const handleStageSelect = (stageId, isChecked) => {
// //     if (isChecked) {
// //       setSelectedStages(prev => [...prev, stageId]);
// //     } else {
// //       setSelectedStages(prev => prev.filter(id => id !== stageId));
// //     }
// //   };

// //   const isStageSelected = (stageId) => {
// //     return selectedStages.includes(stageId);
// //   };

// //   const getSelectedStagesCount = () => {
// //     return selectedStages.length;
// //   };

// //   const getSelectedStagesData = () => {
// //     return componentList.filter(stage => selectedStages.includes(stage._id));
// //   };

// //   const clearAllSelections = () => {
// //     setSelectedStages([]);
// //     setIsAllSelected(false);
// //   };

// //   // Bulk operations for selected stages
// //   const handleBulkOperation = (operation) => {
// //     const selectedData = getSelectedStagesData();
    
// //     switch (operation) {
// //       case 'activate':
// //         Swal.fire({
// //           title: 'Activate Selected Stages?',
// //           text: `Are you sure you want to activate ${selectedData.length} selected stages?`,
// //           icon: 'question',
// //           showCancelButton: true,
// //           confirmButtonColor: '#3085d6',
// //           cancelButtonColor: '#d33',
// //           confirmButtonText: 'Yes, activate them!'
// //         }).then((result) => {
// //           if (result.isConfirmed) {
// //             // Implement bulk activate logic here
// //             console.log('Activating stages:', selectedData);
// //             // You can call your bulk activation API here
// //           }
// //         });
// //         break;
      
// //       case 'deactivate':
// //         Swal.fire({
// //           title: 'Deactivate Selected Stages?',
// //           text: `Are you sure you want to deactivate ${selectedData.length} selected stages?`,
// //           icon: 'warning',
// //           showCancelButton: true,
// //           confirmButtonColor: '#d33',
// //           cancelButtonColor: '#3085d6',
// //           confirmButtonText: 'Yes, deactivate them!'
// //         }).then((result) => {
// //           if (result.isConfirmed) {
// //             // Implement bulk deactivate logic here
// //             console.log('Deactivating stages:', selectedData);
// //             // You can call your bulk deactivation API here
// //           }
// //         });
// //         break;
        
// //       case 'delete':
// //         Swal.fire({
// //           title: 'Delete Selected Stages?',
// //           text: `Are you sure you want to delete ${selectedData.length} selected stages? This action cannot be undone!`,
// //           icon: 'warning',
// //           showCancelButton: true,
// //           confirmButtonColor: '#d33',
// //           cancelButtonColor: '#3085d6',
// //           confirmButtonText: 'Yes, delete them!'
// //         }).then((result) => {
// //           if (result.isConfirmed) {
// //             // Implement bulk delete logic here
// //             console.log('Deleting stages:', selectedData);
// //             // You can call your bulk delete API here
// //           }
// //         });
// //         break;
        
// //       default:
// //         console.log('Unknown operation:', operation);
// //     }
// //   };

// //   // Helper functions
// //   const error_handler = useCallback((error) => {
// //     sessionStorage.removeItem("authUser");
// //     historyHook.push("/login");
// //   }, [historyHook]);

// //   const getComp_info = useCallback(async () => {
// //     try {
// //       const response = await urlSocket.post('/api/components/get_comp_info', { mode: 'no-cors' });
// //       console.log('response', response)
// //       if (response.data.error === "Tenant not found") {
// //         error_handler(response.data.error);
// //       } else {
// //         await statusinfo(response.data);
// //       }
// //     } catch (error) {
// //       console.log(error);
// //     } finally {
// //       setComponentLoading(false);
// //     }
// //   }, [error_handler]);

// //   const getModel_info = useCallback(async () => {
// //     try {
// //       const response = await urlSocket.post('/get_model_info', { mode: 'no-cors' });
// //       if (response.data.error === "Tenant not found") {
// //         error_handler(response.data.error);
// //       } else {
// //         setModelInfo(response.data);
// //       }
// //     } catch (error) {
// //       console.log(error);
// //     }
// //   }, [error_handler]);

// //   const submitForm = useCallback(async () => {
// //     setComponentNameError('');
// //     setComponentCodeError('');
// //     setQrValueError('');

// //     const trimmedComponentName = comp_name.trim().toUpperCase();
// //     const trimmedComponentCode = comp_code.trim().toUpperCase();
// //     const compNameRegex = /^[A-Za-z0-9 _-]+$/;

// //     if (!trimmedComponentName || !trimmedComponentCode) {
// //       setComponentNameError(!trimmedComponentName ? 'The Stage name is required' : '');
// //       setComponentCodeError(!trimmedComponentCode ? 'The Stage code is required' : '');
// //       return;
// //     }

// //     if (trimmedComponentCode.includes('-')) {
// //       setComponentCodeError('Component code cannot include the "-" symbol');
// //       return;
// //     }

// //     if (includeCamera && (!qr_value || qr_value === 'QR NOT FOUND')) {
// //       setQrValueError('Proper QR/Bar Code is required');
// //       return;
// //     }

// //     if (!compNameRegex.test(trimmedComponentName)) {
// //       setComponentNameError('Stage name cannot contain special characters like ":"');
// //       return;
// //     }

// //     try {
// //       setAddingComponent(true);
// //       const qr_data = includeCamera ? qr_value : '';
// //       const response = await urlSocket.post('/api/components/add_comp', {
// //         comp_name: trimmedComponentName,
// //         comp_code: trimmedComponentCode,
// //         qr_data,
// //         bgremove
// //       }, { mode: 'no-cors' });

// //       if (response.data.error === "Tenant not found") {
// //         error_handler(response.data.error);
// //       } else if (response.data === 'Comp code is already created') {
// //         setComponentCodeError('The Stage code is already created');
// //       } else if (response.data === 'Comp name is already created') {
// //         setComponentNameError('The Stage Name is already created');
// //       } else if (response.data === 'QR/Bar code is already created') {
// //         setQrValueError('QR/Bar code is already created');
// //       } else {
// //         setAddCompModal(false);
// //         setComponentList(response.data);
// //         setOriginalData(response.data);
// //         setSearchComponentList(response.data);
// //         setCompName('');
// //         setCompCode('');
// //         setComponentCodeError('');
// //         setComponentNameError('');
// //       }
// //     } catch (error) {
// //       console.log(error);
// //     } finally {
// //       setAddingComponent(false);
// //     }

// //     await activeOrInactive("all", 0);
// //     await modelFilter("all", 0);
// //   }, [comp_name, comp_code, qr_value, includeCamera, bgremove]);

// //   const bgremovefunction = () => {
// //     setBgRemove(prev => !prev);
// //   };

// //   const statusinfo = async (data) => {
// //     try {
// //       const response = await urlSocket.post('/model_status_change', { 'modelData': data }, { mode: 'no-cors' });
// //       if (response.data.error === "Tenant not found") {
// //         error_handler(response.data.error);
// //       } else {
// //         setComponentList(response.data);
// //         setOriginalData(response.data);
// //         setSearchComponentList(response.data);
// //       }
// //     } catch (error) {
// //       console.log(error);
// //     }
// //   };

// //   const handleModelInfo = async(data) => {
// //     console.log('data215', data)
// //     let modelInfo_data = {
// //       ManageStage: data,
// //       modelInfo
// //     };
// //     console.log('modelInfo_data', modelInfo_data)
// //     await sessionStorage.removeItem("manageData");
// //     await sessionStorage.setItem("manageData", JSON.stringify(modelInfo_data));
// //     historyHook.push('/manageModel');
// //   };

// //   const checkIsAssignedToStations = async (data, checked) => {
// //     try {
// //       const response = await urlSocket.post('/component_assigned_stations', { '_id': data._id, 'comp_status': checked }, { mode: 'no-cors' });
// //       if (response.data.error === "Tenant not found") {
// //         error_handler(response.data.error);
// //       } else {
// //         return response.data.station_list;
// //       }
// //     } catch (error) {
// //       console.error(error);
// //       return [];
// //     }
// //   };

// //   const changeComponentStatus = async (checked, data) => {
// //     console.log('checked, data', checked, data)
// //     setIsCompStatusModalOpen(false);
// //     console.log('241', data)
// //     let comp_id = data._id;
// //     let comp_name = data.comp_name;
// //     let comp_code = data.comp_code;

// //     try {
// //       const response = await urlSocket.post('/comp_status_upd', {
// //         '_id': comp_id,
// //         'comp_name': comp_name,
// //         'comp_code': comp_code,
// //         'comp_status': checked
// //       }, { mode: 'no-cors' });

// //       console.log('response', response)

// //       if (response.data.error === "Tenant not found") {
// //         error_handler(response.data.error);
// //       } else {
// //         Swal.fire({
// //           icon: 'success',
// //           title: `"${comp_name}" has been set to <span style="color: ${checked ? 'green' : 'red'}">${checked ? 'Active' : 'Inactive'}</span>.`,
// //           showConfirmButton: false,
// //           timer: 4000
// //         });

// //         if (selectFilter === 1) {
// //           activeOrInactive(true, 1);
// //         } else if (selectFilter === 2) {
// //           activeOrInactive(false, 2);
// //         } else if (selectFilter === 0) {
// //           activeOrInactive("all", 0);
// //         }
// //       }
// //     } catch (error) {
// //       console.log(error);
// //     } finally {
// //       setTogglingCompStatus(prev => ({ ...prev, [data._id]: false }));
// //       setCompStatusDataTemp({});
// //     }
// //   };

// //   const toggleCompStatusModal = async () => {
// //     const { data } = compStatusDataTemp;
// //     setIsCompStatusModalOpen(false);
// //     setTogglingCompStatus(prev => ({ ...prev, [data._id]: false }));
// //   };

// //   const onChange = async (checked, data) => {
// //     setTogglingCompStatus(prev => ({ ...prev, [data._id]: true }));
// //     setCompStatusDataTemp({ data, checked });

// //     try {
// //       const station_list = await checkIsAssignedToStations(data, checked);
// //       const isAssignedToStations = station_list.length > 0;

// //       if (!isAssignedToStations) {
// //         await changeComponentStatus(checked, data);
// //       } else {
// //         setCompAssignedStations(station_list);
// //         setIsCompStatusModalOpen(true);
// //       }
// //     } catch (error) {
// //       console.log('second')
// //       console.error("Error toggling component status:", error);
// //       setTogglingCompStatus(prev => ({ ...prev, [data._id]: false }));
// //       setCompStatusDataTemp({});
// //     }
// //   };

// //   const logComp = (data) => {
// //     if (data.datasets === undefined) {
// //       data.datasets = [];
// //     }
// //     let { comp_name, comp_code, _id } = data;

// //     let datas = {
// //       component_name: comp_name,
// //       component_code: comp_code,
// //       datasets: data.datasets,
// //       status: data.status,
// //       positive: data.positive,
// //       negative: data.negative,
// //       posble_match: data.posble_match,
// //       _id,
// //       config_data: {} // Assuming config_data was part of state, but not shown in original
// //     };
// //     sessionStorage.removeItem("compData");
// //     sessionStorage.setItem("compData", JSON.stringify(datas));
// //     historyHook.push('/comp_log');
// //   };

// //   const manageStation = (value) => {
// //     let data = {
// //       component_info: value,
// //       page_info: '/comp_info'
// //     };
// //     sessionStorage.removeItem("InfoComp");
// //     sessionStorage.setItem("InfoComp", JSON.stringify(data));
// //     historyHook.push('/profileCreation');
// //   };

// //   const info = (data) => {
// //     setModalCenter(true);
// //     try {
// //       urlSocket.post('/version_info', { 'comp_id': data._id }, { mode: 'no-cors' })
// //         .then((response) => {
// //           if (response.data.error === "Tenant not found") {
// //             error_handler(response.data.error);
// //           } else {
// //             const sortedData = response.data.sort((a, b) => a.model_live_ver - b.model_live_ver);
// //             setVerLog(sortedData);
// //           }
// //         })
// //         .catch((error) => {
// //           console.log(error);
// //         });
// //     } catch (error) {
// //       console.log(error);
// //     }
// //   };

// //   const activeOrInactive = async (string, value) => {
// //     setSelectFilter(value);
// //     setFilterCompStatus(string);
// //     setCurrentPage(1);

// //     try {
// //       const response = await urlSocket.post('/active_inactive', { 'is_active': string, 'model_status': filter_modelStatus }, { mode: 'no-cors' });
// //       if (response.data.error === "Tenant not found") {
// //         error_handler(response.data.error);
// //       } else {
// //         if (!response.data || response.data.length === 0) {
// //           setComponentList([]);
// //           setSearchComponentList([]);
// //         } else {
// //           setComponentList(response.data);
// //           setSearchComponentList(response.data);
// //         }
// //       }
// //     } catch (error) {
// //       console.log(error);
// //     }
// //   };

// //   const modelFilter = async (str, value) => {
// //     setModelFilter(value);
// //     setFilterModelStatus(str);
// //     setCurrentPage(1);

// //     try {
// //       const response = await urlSocket.post('/model_status_filter', { 'model_status': str, 'comp_status': filter_compStatus }, { mode: 'no-cors' });
// //       if (response.data.error === "Tenant not found") {
// //         error_handler(response.data.error);
// //       } else {
// //         if (!response.data || response.data.length === 0) {
// //           setComponentList([]);
// //           setSearchComponentList([]);
// //         } else {
// //           setComponentList(response.data);
// //           setSearchComponentList(response.data);
// //         }
// //       }
// //     } catch (error) {
// //       console.log(error);
// //     }
// //   };

// //   const onSearch = (search) => {
// //     setSearchField(search);
// //     setCurrentPageStock(1);
// //     setCurrentPage(1);
// //     setTimeout(() => {
// //       dataListProcess();
// //     }, 100);
// //   };

// //   const dataListProcess = () => {
// //     try {
// //       let tempList = [...search_componentList];

// //       if (SearchField) {
// //         tempList = tempList.filter(d =>
// //           d.comp_name.toUpperCase().includes(SearchField.toUpperCase()) ||
// //           d.comp_code.toUpperCase().includes(SearchField.toUpperCase())
// //         );
// //       }

// //       if (sorting.field) {
// //         const reversed = sorting.order === "asc" ? 1 : -1;
// //         tempList = tempList.sort((a, b) => reversed * a[sorting.field].localeCompare(b[sorting.field]));
// //       }

// //       const slicedData = tempList.slice(
// //         (currentPage_stock - 1) * items_per_page_stock,
// //         (currentPage_stock - 1) * items_per_page_stock + items_per_page_stock
// //       );
// //       setComponentList(slicedData);
// //     } catch (error) {
// //       console.error(error);
// //     }
// //   };

// //   const handleModalClosed = () => {
// //     setAddCompModal(false);
// //     setCompName('');
// //     setCompCode('');
// //     setComponentNameError('');
// //     setComponentCodeError('');
// //     setCameraOpen(false);
// //     setIncludeCamera(false);
// //     setQrValue('');
// //     setQrValueError('');
// //     setBgRemove(true);
// //   };

// //   const handleIncludeCameraToggle = () => {
// //     setIncludeCamera(prev => !prev);
// //     setCameraOpen(prev => !prev);
// //     setIsLoading(true);
// //     setQrValueError('');
// //     setQrValue('');
// //   };

// //   const handleWebcamLoad = (msg) => {
// //     if (msg === 'error') {
// //       setIsLoading(true);
// //     } else {
// //       setIsLoading(false);
// //     }
// //   };

// //   const checkBarCode = async () => {
// //     setQrNotFound(false);
// //     setQrValueError('');

// //     const formData = new FormData();
// //     const imageSrc = webcamRef.current.getScreenshot({ width: DEFAULT_RESOLUTION.width, height: DEFAULT_RESOLUTION.height });
// //     const blob = await fetch(imageSrc).then((res) => res.blob());
// //     const today = new Date();
// //     const _today = today.toLocaleDateString();
// //     const time = today.toLocaleTimeString().replace(/:/g, '_');
// //     const compdata = `${comp_name}_${comp_code}_${_today}_${time}`;
// //     formData.append('datasets', blob, `${compdata}.png`);

// //     try {
// //       const qr_result = await urlSocket.post("/api/components/qr_add_comp", formData, {
// //         headers: { "content-type": "multipart/form-data" },
// //         mode: "no-cors"
// //       });

// //       if (qr_result.data.error === "Tenant not found") {
// //         error_handler(qr_result.data.error);
// //       } else if (qr_result.data !== "QR not found") {
// //         setQrValue(qr_result.data.data);
// //       } else {
// //         setQrNotFound(true);
// //         setQrValue(qr_result.data);
// //       }
// //     } catch (error) {
// //       console.log(error);
// //     }
// //   };

// //   const checkWebcam = async () => {
// //     try {
// //       const devices = await navigator.mediaDevices.enumerateDevices();
// //       const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
// //       if (!videoInputDevices.length) {
// //         setWebcamEnabled(false);
// //         setCameraDisconnected(true);
// //       } else {
// //         setWebcamEnabled(true);
// //         setCameraDisconnected(false);
// //         setVideoInputDevices(videoInputDevices);
// //       }
// //     } catch (error) {
// //       console.error('Error checking devices:', error);
// //     }
// //   };

// //   const handleCameraChange = event => {
// //     setSelectedCamera(event.target.value);
// //   };

// //   const handlePageChange = (pageNumber) => {
// //     setCurrentPage(pageNumber);
// //   };

// //   const showLiveVersionNums = (live_versions) => {
// //     const flattenedValues = live_versions.flat();
// //     return flattenedValues.map(value => `V${value}`).join(', ');
// //   };

// //   return (
// //     <>
// //       {adding_component && <FullScreenLoader />}
// //       <div className='page-content'>
// //         <MetaTags>
// //           <title>Stage Information</title>
// //         </MetaTags>
// //         <Breadcrumbs title="STAGE INFORMATION" />
// //         <Container fluid={true}>
// //           <Card>
// //             <CardBody>
// //               <Row className="d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-2 mb-2">
// //                 <Col xs="12" lg="auto" className="text-center">
// //                   <div className="search-box">
// //                     <div className="position-relative">
// //                       <Input
// //                         onChange={(e) => onSearch(e.target.value)}
// //                         id="search-user"
// //                         type="text"
// //                         className="form-control"
// //                         placeholder="Search name or code..."
// //                         value={SearchField}
// //                       />
// //                       <i className="bx bx-search-alt search-icon" />
// //                     </div>
// //                   </div>
// //                 </Col>
// //                 <Col xs="12" lg="auto" className="text-center">
// //                   <ButtonGroup>
// //                     <Button className='btn btn-sm' color="primary" outline={selectFilter !== 0} onClick={() => activeOrInactive("all", 0)}>All</Button>
// //                     <Button className='btn btn-sm' color="primary" outline={selectFilter !== 1} onClick={() => activeOrInactive(true, 1)}>Active</Button>
// //                     <Button className='btn btn-sm' color="primary" outline={selectFilter !== 2} onClick={() => activeOrInactive(false, 2)}>Inactive</Button>
// //                   </ButtonGroup>
// //                 </Col>
// //                 <Col xs="12" lg="auto" className="text-center">
// //                   <ButtonGroup>
// //                     <Button className='btn btn-sm' color="success" outline={modelfilter !== 0} onClick={() => modelFilter("all", 0)}>All</Button>
// //                     <Button className='btn btn-sm' color="success" outline={modelfilter !== 4} onClick={() => modelFilter("No Models Available", 4)}>No Models</Button>
// //                     <Button className='btn btn-sm' color="success" outline={modelfilter !== 1} onClick={() => modelFilter("Draft", 1)}>Draft</Button>
// //                     <Button className='btn btn-sm' color="success" outline={modelfilter !== 2} onClick={() => modelFilter("Approved", 2)}>Approved</Button>
// //                     <Button className='btn btn-sm' color="success" outline={modelfilter !== 3} onClick={() => modelFilter("Live", 3)}>Live</Button>
// //                   </ButtonGroup>
// //                 </Col>
// //                 <Col xs="12" lg="auto" className="text-center">
// //                   <Button color="primary" className="w-sm btn btn-sm d-flex align-items-center" onClick={() => setAddCompModal(true)}>
// //                     <i className="bx bx-list-plus me-1" style={{ fontSize: '18px' }} /> Add Stage
// //                   </Button>
// //                 </Col>
// //               </Row>

// //               {/* SELECTION INFO AND BULK ACTIONS */}
// //               {getSelectedStagesCount() > 0 && (
// //                 <Row className="mb-3">
// //                   <Col xs="12">
// //                     <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
// //                       <div>
// //                         <span className="fw-bold text-primary">
// //                           {getSelectedStagesCount()} stage{getSelectedStagesCount() > 1 ? 's' : ''} selected
// //                         </span>
// //                       </div>
// //                       <div className="d-flex gap-2">
// //                         <Button size="sm" color="success" onClick={() => handleBulkOperation('activate')}>
// //                           <i className="bx bx-check-circle me-1" />
// //                           Activate Selected
// //                         </Button>
// //                         <Button size="sm" color="warning" onClick={() => handleBulkOperation('deactivate')}>
// //                           <i className="bx bx-x-circle me-1" />
// //                           Deactivate Selected
// //                         </Button>
// //                         <Button size="sm" color="danger" onClick={() => handleBulkOperation('delete')}>
// //                           <i className="bx bx-trash me-1" />
// //                           Delete Selected
// //                         </Button>
// //                         <Button size="sm" color="secondary" onClick={clearAllSelections}>
// //                           <i className="bx bx-x me-1" />
// //                           Clear Selection
// //                         </Button>
// //                       </div>
// //                     </div>
// //                   </Col>
// //                 </Row>
// //               )}

// //               <div className='table-responsive'>
// //                 {componentLoading ? (
// //                   <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
// //                     <Spinner color="primary" />
// //                     <h5 className="mt-4">
// //                       <strong>Loading Stage...</strong>
// //                     </h5>
// //                   </div>
// //                 ) : componentList.length === 0 ? (
// //                   <div className="container" style={{ position: 'relative', height: '50vh' }}>
// //                     <div className="text-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
// //                       <img src={Nodata_admin} className="img-sm h-auto" style={{ width: '20%' }} />
// //                       <h5 className="text-secondary">No Stage Available</h5>
// //                     </div>
// //                   </div>
// //                 ) : (
// //                   <div className='table-responsive'>
// //                     <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
// //                       <thead className="table-light">
// //                         <tr>
// //                           <th style={{ width: '50px' }}>
// //                             <div className="form-check">
// //                               <input
// //                                 className="form-check-input"
// //                                 type="checkbox"
// //                                 id="checkboxSelectAll"
// //                                 checked={isAllSelected}
// //                                 onChange={handleSelectAll}
// //                               />
// //                               <label className="form-check-label" htmlFor="checkboxSelectAll"></label>
// //                             </div>
// //                           </th>
// //                           <th>S. No.</th>
// //                           <th>Stage Name</th>
// //                           <th>Stage Code</th>
// //                           <th>Stage Status</th>
// //                           <th>Model Status</th>
// //                           <th>Stage Live Version</th>
// //                           <th>Actions</th>
// //                         </tr>
// //                       </thead>
// //                       <tbody>
// //                         {componentList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((data, index) => (
// //                           <tr key={index} id="recent-list" className={isStageSelected(data._id) ? 'table-active' : ''}>
// //                             <td style={{ backgroundColor: "white" }}>
// //                               <div className="form-check">
// //                                 <input
// //                                   className="form-check-input"
// //                                   type="checkbox"
// //                                   id={`checkbox-${data._id}`}
// //                                   checked={isStageSelected(data._id)}
// //                                   onChange={(e) => handleStageSelect(data._id, e.target.checked)}
// //                                 />
// //                                 <label className="form-check-label" htmlFor={`checkbox-${data._id}`}></label>
// //                               </div>
// //                             </td>
// //                             <td style={{ backgroundColor: "white" }}>{index + 1 + ((currentPage - 1) * itemsPerPage)}</td>
// //                             <td style={{ backgroundColor: "white" }}>{data.comp_name}</td>
// //                             <td style={{ backgroundColor: "white" }}>{data.comp_code}</td>
// //                             <td style={{ backgroundColor: "white" }}>
// //                               {togglingCompStatus?.[data._id] ? (
// //                                 <div className='ms-2'>
// //                                   <Spin indicator={<LoadingOutlined />} />
// //                                 </div>
// //                               ) : (
// //                                 <Switch
// //                                   checked={data.comp_status}
// //                                   onChange={(e) => onChange(e, data)}
// //                                   checkedChildren="Active"
// //                                   unCheckedChildren="Inactive"
// //                                 />
// //                               )}
// //                             </td>
// //                             <td style={{ backgroundColor: "white" }}>
// //                               <span className={data.model_status === 'Live' ? 'badge badge-soft-success' : data.model_status === 'Approved' ? 'badge badge-soft-warning' : data.model_status === 'Draft' ? 'badge badge-soft-info' : 'badge badge-soft-danger'}>
// //                                 {data.model_status}
// //                               </span>
// //                             </td>
// //                             <td style={{ backgroundColor: "white" }}>
// //                               {data.model_live_ver && data.model_live_ver.length > 0 ? (
// //                                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }} onClick={() => console.log(data.model_live_ver)}>
// //                                   {showLiveVersionNums(data.model_live_ver)}
// //                                   <i className='bx bx-info-circle' onClick={() => info(data)}></i>
// //                                 </div>
// //                               ) : null}
// //                             </td>
// //                             <td style={{ backgroundColor: "white" }}>
// //                               <div className="d-flex gap-1 align-items-center" style={{ cursor: "pointer" }}>
// //                                 {data.comp_status !== false && (
// //                                   <>
// //                                     <Button color="primary" className='btn btn-sm' onClick={() => handleModelInfo(data)} id={`model-${data._id}`}>
// //                                       Model Info
// //                                     </Button>
// //                                     <UncontrolledTooltip placement="top" target={`model-${data._id}`}>
// //                                       Manage Model Info
// //                                     </UncontrolledTooltip>
// //                                   </>
// //                                 )}
// //                                 {data.comp_status !== false && (
// //                                   <>
// //                                     <Button color="primary" className='btn btn-sm' onClick={() => manageStation(data)} id={`station-${data._id}`}>
// //                                       Station Info
// //                                     </Button>
// //                                     <UncontrolledTooltip placement="top" target={`station-${data._id}`}>
// //                                       Manage Station Info
// //                                     </UncontrolledTooltip>
// //                                   </>
// //                                 )}
// //                                 <>
// //                                   <Button color="primary" className='btn btn-sm' onClick={() => logComp(data)} id={`log-${data._id}`}>
// //                                     Log Info
// //                                   </Button>
// //                                   <UncontrolledTooltip placement="top" target={`log-${data._id}`}>
// //                                     Log Info
// //                                   </UncontrolledTooltip>
// //                                 </>
// //                               </div>
// //                             </td>
// //                           </tr>
// //                         ))}
// //                       </tbody>
// //                     </Table>
// //                     <PaginationComponent
// //                       totalItems={componentList.length}
// //                       itemsPerPage={itemsPerPage}
// //                       currentPage={currentPage}
// //                       onPageChange={handlePageChange}
// //                     />
// //                   </div>
// //                 )}
// //               </div>
// //             </CardBody>
// //           </Card>

// //           {isCompStatusModalOpen && (
// //             <Modal isOpen={isCompStatusModalOpen} toggle={toggleCompStatusModal} centered>
// //               <ModalBody>
// //                 <p>If you deactivate this Stage, it will be deleted from the following stations:</p>
// //                 <Table responsive striped bordered size="sm">
// //                   <thead>
// //                     <tr>
// //                       <th>S.No</th>
// //                       <th>Station Name</th>
// //                     </tr>
// //                   </thead>
// //                   <tbody>
// //                     {compAssignedStations.map((station, index) => (
// //                       <tr key={index}>
// //                         <td>{index + 1}</td>
// //                         <td>{station}</td>
// //                       </tr>
// //                     ))}
// //                   </tbody>
// //                 </Table>
// //                 <div className='d-flex my-2 justify-content-end gap-2'>
// //                   <Button size='sm' color="danger" onClick={() => changeComponentStatus(compStatusDataTemp.checked, compStatusDataTemp.data)}>
// //                     Yes, Deactivate
// //                   </Button>
// //                   <Button size='sm' color="secondary" onClick={toggleCompStatusModal}>
// //                     Cancel
// //                   </Button>
// //                 </div>
// //               </ModalBody>
// //             </Modal>
// //           )}

// //           <Modal isOpen={addCompModal} onClosed={handleModalClosed}>
// //             <div className="modal-header">
// //               <h5 className="modal-title mt-0" id="myModalLabel">
// //                 Enter Stage Details
// //               </h5>
// //               <button
// //                 type="button"
// //                 onClick={() => setAddCompModal(false)}
// //                 className="close"
// //                 data-dismiss="modal"
// //                 aria-label="Close"
// //               >
// //                 <span aria-hidden="true">&times;</span>
// //               </button>
// //             </div>
// //             <div className="modal-body">
// //               <Form>
// //                 <div className="row mb-4">
// //                   <Col sm={12}>
// //                     <Label>Stage name</Label>
// //                     <Input
// //                       type="text"
// //                       className="form-control"
// //                       id="horizontal-compname-Input"
// //                       placeholder="Enter Your Component Name"
// //                       value={comp_name}
// //                       maxLength="40"
// //                       onChange={(e) => setCompName(e.target.value)}
// //                     />
// //                     {componentNameError && <p className="error-message" style={{ color: "red" }}>{componentNameError}</p>}
// //                   </Col>
// //                 </div>
// //                 <div className="row mb-4">
// //                   <Col sm={12}>
// //                     <Label>Stage code</Label>
// //                     <Input
// //                       type="text"
// //                       className="form-control"
// //                       id="example-number-input"
// //                       placeholder="Enter Your Component Code"
// //                       maxLength="32"
// //                       value={comp_code}
// //                       onChange={(e) => setCompCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 8))}
// //                     />
// //                     {componentCodeError && <p className="error-message" style={{ color: "red" }}>{componentCodeError}</p>}
// //                   </Col>
// //                 </div>
// //                 <div className="row mb-4">
// //                   <Col sm={12}>
// //                     <FormGroup check>
// //                       <Label check>
// //                         <Input type="checkbox" checked={bgremove} onChange={bgremovefunction} />
// //                         Background Remove if Needed
// //                       </Label>
// //                     </FormGroup>
// //                     <FormGroup check>
// //                       <Label check>
// //                         <Input type="checkbox" checked={includeCamera} onChange={handleIncludeCameraToggle} />
// //                         Capture QR/Bar code
// //                       </Label>
// //                     </FormGroup>
// //                     {includeCamera && cameraOpen && (
// //                       <>
// //                         <Input
// //                           type="text"
// //                           className="form-control mb-3"
// //                           id="example-number-input"
// //                           placeholder="Enter Your"
// //                           maxLength="32"
// //                           value={qr_value}
// //                           disabled
// //                         />
// //                         {qr_valueerror && <p className="error-message" style={{ color: "red" }}>{qr_valueerror}</p>}
// //                         {isLoading && (
// //                           <div className='d-flex flex-column justify-content-center align-items-center' style={{ width: '100%' }}>
// //                             <Spinner className='mt-2' color="primary" />
// //                             <div className='mt-2' style={{ fontWeight: 'bold' }}>Waiting for Camera...</div>
// //                           </div>
// //                         )}
// //                         <div style={{ display: isLoading ? 'none' : 'block' }}>
// //                           {cameraDisconnected ? (
// //                             <div className='d-flex flex-column justify-content-center align-items-center' style={{ width: '100%' }}>
// //                               <h5 style={{ fontWeight: 'bold' }}>Webcam Disconnected</h5>
// //                               <Spinner className='mt-2' color="primary" />
// //                               <div className='mt-2' style={{ fontWeight: 'bold' }}>Please check your webcam connection...</div>
// //                             </div>
// //                           ) : (
// //                             <>
// //                               <Webcam
// //                                 key={selectedCamera}
// //                                 videoConstraints={selectedCamera ? { deviceId: selectedCamera } : {}}
// //                                 style={{ width: '100%', height: 'auto' }}
// //                                 onUserMedia={() => handleWebcamLoad()}
// //                                 onUserMediaError={() => handleWebcamLoad('error')}
// //                                 screenshotFormat="image/png"
// //                                 ref={webcamRef}
// //                               />
// //                               <Button className='mt-2' color='primary' onClick={checkBarCode}>Add QR/Barcode</Button>
// //                             </>
// //                           )}
// //                         </div>
// //                       </>
// //                     )}
// //                   </Col>
// //                 </div>
// //                 <div className="row justify-content-end">
// //                   <Col sm={9}>
// //                     <div className="text-end">
// //                       <Button color="primary" className="w-md" onClick={submitForm}>
// //                         ADD
// //                       </Button>
// //                     </div>
// //                   </Col>
// //                 </div>
// //               </Form>
// //             </div>
// //           </Modal>

// //           <Modal isOpen={modal_center} centered={true}>
// //             <div className="modal-header">
// //               <h5 className="modal-title mt-0">Stage Live version details</h5>
// //               <button
// //                 type="button"
// //                 onClick={() => setModalCenter(false)}
// //                 className="close"
// //                 data-dismiss="modal"
// //                 aria-label="Close"
// //               >
// //                 <span aria-hidden="true">&times;</span>
// //               </button>
// //             </div>
// //             <div className='modal-body table-responsive'>
// //               <Table striped>
// //                 <thead>
// //                   <tr>
// //                     <th>comp name</th>
// //                     <th>comp code</th>
// //                     <th>Model Name</th>
// //                     <th>Model version</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {ver_log.map((data, index) => (
// //                     <tr key={index}>
// //                       <td>{data.comp_name}</td>
// //                       <td>{data.comp_code}</td>
// //                       <td>{data.model_name}</td>
// //                       <td>
// //                         {data.model_live_ver.map((value, index) => (
// //                           <span key={index}>
// //                             {`V${value}${index < data.model_live_ver.length - 1 ? ', ' : ''}`}
// //                           </span>
// //                         ))}
// //                       </td>
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //               </Table>
// //             </div>
// //           </Modal>
// //         </Container>
// //       </div>
// //     </>
// //   );
// // };

// // ManageStage.propTypes = {
// //   history: PropTypes.any.isRequired
// // };

// // export default ManageStage;

// // // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // // import MetaTags from 'react-meta-tags';
// // // import {
// // //   Container, CardTitle, Button, Col,
// // //   Row, Modal, Form, Label, Input, Table,
// // //   FormGroup, Spinner, ButtonGroup,
// // //   ModalBody, ModalHeader, Card, CardBody,
// // //   UncontrolledTooltip
// // // } from 'reactstrap';
// // // import urlSocket from "./urlSocket";
// // // import PropTypes from "prop-types";
// // // import { useHistory } from 'react-router-dom';
// // // import { Spin, Switch } from 'antd';
// // // import SearchField from "react-search-field";
// // // import Nodata_admin from "assets/images/nodata/nodata_admin.jpg";
// // // import Swal from 'sweetalert2';
// // // import Webcam from 'react-webcam';
// // // import { green } from '@mui/material/colors';
// // // import { Dialog } from '@mui/material';
// // // import PaginationComponent from './PaginationComponent';
// // // import { LoadingOutlined } from '@ant-design/icons';
// // // import Breadcrumbs from 'components/Common/Breadcrumb';
// // // import { DEFAULT_RESOLUTION } from './cameraConfig';
// // // import FullScreenLoader from 'components/Common/FullScreenLoader';

// // // const ManageStage = ({ history }) => {
// // //   // Individual state hooks
// // //   const [addCompModal, setAddCompModal] = useState(false);
// // //   const [isCompStatusModalOpen, setIsCompStatusModalOpen] = useState(false);
// // //   const [modal_center, setModalCenter] = useState(false);
// // //   const [comp_name, setCompName] = useState("");
// // //   const [comp_code, setCompCode] = useState("");
// // //   const [qr_value, setQrValue] = useState("");
// // //   const [bgremove, setBgRemove] = useState(true);
// // //   const [includeCamera, setIncludeCamera] = useState(false);
// // //   const [componentNameError, setComponentNameError] = useState("");
// // //   const [componentCodeError, setComponentCodeError] = useState("");
// // //   const [qr_valueerror, setQrValueError] = useState("");
// // //   const [componentList, setComponentList] = useState([]);
// // //   const [originalData, setOriginalData] = useState([]);
// // //   const [search_componentList, setSearchComponentList] = useState([]);
// // //   const [ver_log, setVerLog] = useState([]);
// // //   const [compAssignedStations, setCompAssignedStations] = useState([]);
// // //   const [modelInfo, setModelInfo] = useState([]);
// // //   const [SearchField, setSearchField] = useState("");
// // //   const [selectFilter, setSelectFilter] = useState(0);
// // //   const [modelfilter, setModelFilter] = useState(0);
// // //   const [filter_compStatus, setFilterCompStatus] = useState('all');
// // //   const [filter_modelStatus, setFilterModelStatus] = useState('all');
// // //   const [sorting, setSorting] = useState({ field: "", order: "" });
// // //   const [currentPage, setCurrentPage] = useState(1);
// // //   const [itemsPerPage, setItemsPerPage] = useState(10);
// // //   const [currentPage_stock, setCurrentPageStock] = useState(1);
// // //   const [items_per_page_stock, setItemsPerPageStock] = useState(100);
// // //   const [isLoading, setIsLoading] = useState(false);
// // //   const [componentLoading, setComponentLoading] = useState(true);
// // //   const [adding_component, setAddingComponent] = useState(false);
// // //   const [qr_not_found, setQrNotFound] = useState(false);
// // //   const [togglingCompStatus, setTogglingCompStatus] = useState({});
// // //   const [compStatusDataTemp, setCompStatusDataTemp] = useState({});
// // //   const [cameraOpen, setCameraOpen] = useState(false);
// // //   const [webcamEnabled, setWebcamEnabled] = useState(true);
// // //   const [cameraDisconnected, setCameraDisconnected] = useState(false);
// // //   const [videoInputDevices, setVideoInputDevices] = useState([]);
// // //   const [selectedCamera, setSelectedCamera] = useState(null);

// // //   const webcamRef = useRef(null);
// // //   const historyHook = useHistory();

// // //   // Effects
// // //   useEffect(() => {
// // //     const paginationCompInfo = JSON.parse(sessionStorage.getItem('paginationCompInfo'));
// // //     if (paginationCompInfo?.currentPage) {
// // //       setCurrentPage(paginationCompInfo.currentPage);
// // //     }

// // //     getComp_info();
// // //     getModel_info();
// // //     checkWebcam();

// // //     navigator.mediaDevices.addEventListener('devicechange', checkWebcam);
// // //     sessionStorage.removeItem("manageData");
// // //     sessionStorage.removeItem('profiletype');
// // //     sessionStorage.removeItem('type');

// // //     return () => {
// // //       navigator.mediaDevices.removeEventListener('devicechange', checkWebcam);
// // //       sessionStorage.setItem("paginationCompInfo", JSON.stringify({ currentPage }));
// // //       sessionStorage.removeItem("paginationCompInfo");
// // //     };
// // //   }, [currentPage]);

// // //   // Helper functions
// // //   const error_handler = useCallback((error) => {
// // //     sessionStorage.removeItem("authUser");
// // //     historyHook.push("/login");
// // //   }, [historyHook]);

// // //   const getComp_info = useCallback(async () => {
// // //     try {
// // //       const response = await urlSocket.post('/api/components/get_comp_info', { mode: 'no-cors' });
// // //       console.log('response', response)
// // //       if (response.data.error === "Tenant not found") {
// // //         error_handler(response.data.error);
// // //       } else {
// // //         await statusinfo(response.data);
// // //       }
// // //     } catch (error) {
// // //       console.log(error);
// // //     } finally {
// // //       setComponentLoading(false);
// // //     }
// // //   }, [error_handler]);

// // //   const getModel_info = useCallback(async () => {
// // //     try {
// // //       const response = await urlSocket.post('/get_model_info', { mode: 'no-cors' });
// // //       if (response.data.error === "Tenant not found") {
// // //         error_handler(response.data.error);
// // //       } else {
// // //         setModelInfo(response.data);
// // //       }
// // //     } catch (error) {
// // //       console.log(error);
// // //     }
// // //   }, [error_handler]);

// // //   const submitForm = useCallback(async () => {
// // //     setComponentNameError('');
// // //     setComponentCodeError('');
// // //     setQrValueError('');

// // //     const trimmedComponentName = comp_name.trim().toUpperCase();
// // //     const trimmedComponentCode = comp_code.trim().toUpperCase();
// // //     const compNameRegex = /^[A-Za-z0-9 _-]+$/;

// // //     if (!trimmedComponentName || !trimmedComponentCode) {
// // //       setComponentNameError(!trimmedComponentName ? 'The Stage name is required' : '');
// // //       setComponentCodeError(!trimmedComponentCode ? 'The Stage code is required' : '');
// // //       return;
// // //     }

// // //     if (trimmedComponentCode.includes('-')) {
// // //       setComponentCodeError('Component code cannot include the "-" symbol');
// // //       return;
// // //     }

// // //     if (includeCamera && (!qr_value || qr_value === 'QR NOT FOUND')) {
// // //       setQrValueError('Proper QR/Bar Code is required');
// // //       return;
// // //     }

// // //     if (!compNameRegex.test(trimmedComponentName)) {
// // //       setComponentNameError('Stage name cannot contain special characters like ":"');
// // //       return;
// // //     }

// // //     try {
// // //       setAddingComponent(true);
// // //       const qr_data = includeCamera ? qr_value : '';
// // //       const response = await urlSocket.post('/api/components/add_comp', {
// // //         comp_name: trimmedComponentName,
// // //         comp_code: trimmedComponentCode,
// // //         qr_data,
// // //         bgremove
// // //       }, { mode: 'no-cors' });

// // //       if (response.data.error === "Tenant not found") {
// // //         error_handler(response.data.error);
// // //       } else if (response.data === 'Comp code is already created') {
// // //         setComponentCodeError('The Stage code is already created');
// // //       } else if (response.data === 'Comp name is already created') {
// // //         setComponentNameError('The Stage Name is already created');
// // //       } else if (response.data === 'QR/Bar code is already created') {
// // //         setQrValueError('QR/Bar code is already created');
// // //       } else {
// // //         setAddCompModal(false);
// // //         setComponentList(response.data);
// // //         setOriginalData(response.data);
// // //         setSearchComponentList(response.data);
// // //         setCompName('');
// // //         setCompCode('');
// // //         setComponentCodeError('');
// // //         setComponentNameError('');
// // //       }
// // //     } catch (error) {
// // //       console.log(error);
// // //     } finally {
// // //       setAddingComponent(false);
// // //     }

// // //     await activeOrInactive("all", 0);
// // //     await modelFilter("all", 0);
// // //   }, [comp_name, comp_code, qr_value, includeCamera, bgremove]);

// // //   const bgremovefunction = () => {
// // //     setBgRemove(prev => !prev);
// // //   };

// // //   const statusinfo = async (data) => {
// // //     try {
// // //       const response = await urlSocket.post('/model_status_change', { 'modelData': data }, { mode: 'no-cors' });
// // //       if (response.data.error === "Tenant not found") {
// // //         error_handler(response.data.error);
// // //       } else {
// // //         setComponentList(response.data);
// // //         setOriginalData(response.data);
// // //         setSearchComponentList(response.data);
// // //       }
// // //     } catch (error) {
// // //       console.log(error);
// // //     }
// // //   };

// // //   const handleModelInfo = async(data) => {
// // //     console.log('data215', data)
// // //     let modelInfo_data = {
// // //       ManageStage: data,
// // //       modelInfo
// // //     };
// // //     console.log('modelInfo_data', modelInfo_data)
// // //     await sessionStorage.removeItem("manageData");
// // //     await sessionStorage.setItem("manageData", JSON.stringify(modelInfo_data));
// // //     historyHook.push('/manageModel');
// // //   };

  
// // //   // const handlestagelInfo = async(data) => {
// // //   //   console.log('data215', data)
// // //   //   let modelInfo_data = {
// // //   //     compInfo: data,
// // //   //     modelInfo
// // //   //   };
// // //   //   console.log('modelInfo_data', modelInfo_data)
// // //   //   await sessionStorage.removeItem("manageData");
// // //   //   await sessionStorage.setItem("manageData", JSON.stringify(modelInfo_data));
// // //   //   historyHook.push('/manageStages');
// // //   // };


// // //   const checkIsAssignedToStations = async (data, checked) => {
// // //     try {
// // //       const response = await urlSocket.post('/component_assigned_stations', { '_id': data._id, 'comp_status': checked }, { mode: 'no-cors' });
// // //       if (response.data.error === "Tenant not found") {
// // //         error_handler(response.data.error);
// // //       } else {
// // //         return response.data.station_list;
// // //       }
// // //     } catch (error) {
// // //       console.error(error);
// // //       return [];
// // //     }
// // //   };

// // //   const changeComponentStatus = async (checked, data) => {
// // //     console.log('checked, data', checked, data)
// // //     setIsCompStatusModalOpen(false);
// // //     // const { data, checked } = compStatusDataTemp;
// // //     console.log('241', data)
// // //     let comp_id = data._id;
// // //     let comp_name = data.comp_name;
// // //     let comp_code = data.comp_code;

// // //     try {
// // //       const response = await urlSocket.post('/comp_status_upd', {
// // //         '_id': comp_id,
// // //         'comp_name': comp_name,
// // //         'comp_code': comp_code,
// // //         'comp_status': checked
// // //       }, { mode: 'no-cors' });

// // //       console.log('response', response)

// // //       if (response.data.error === "Tenant not found") {
// // //         error_handler(response.data.error);
// // //       } else {
// // //         Swal.fire({
// // //           icon: 'success',
// // //           title: `"${comp_name}" has been set to <span style="color: ${checked ? 'green' : 'red'}">${checked ? 'Active' : 'Inactive'}</span>.`,
// // //           showConfirmButton: false,
// // //           timer: 4000
// // //         });

// // //         if (selectFilter === 1) {
// // //           activeOrInactive(true, 1);
// // //         } else if (selectFilter === 2) {
// // //           activeOrInactive(false, 2);
// // //         } else if (selectFilter === 0) {
// // //           activeOrInactive("all", 0);
// // //         }
// // //       }
// // //     } catch (error) {
// // //       console.log(error);
// // //     } finally {
// // //       setTogglingCompStatus(prev => ({ ...prev, [data._id]: false }));
// // //       setCompStatusDataTemp({});
// // //     }
// // //   };

// // //   const toggleCompStatusModal = async () => {
// // //     const { data } = compStatusDataTemp;
// // //     setIsCompStatusModalOpen(false);
// // //     setTogglingCompStatus(prev => ({ ...prev, [data._id]: false }));
// // //   };

// // //   const onChange = async (checked, data) => {
// // //     setTogglingCompStatus(prev => ({ ...prev, [data._id]: true }));
// // //     setCompStatusDataTemp({ data, checked });

// // //     try {
// // //       const station_list = await checkIsAssignedToStations(data, checked);
// // //       const isAssignedToStations = station_list.length > 0;

// // //       if (!isAssignedToStations) {
// // //         await changeComponentStatus(checked, data);
// // //       } else {
// // //         setCompAssignedStations(station_list);
// // //         setIsCompStatusModalOpen(true);
// // //       }
// // //     } catch (error) {
// // //       console.log('second')
// // //       console.error("Error toggling component status:", error);
// // //       setTogglingCompStatus(prev => ({ ...prev, [data._id]: false }));
// // //       setCompStatusDataTemp({});
// // //     }
// // //   };

// // //   const logComp = (data) => {
// // //     if (data.datasets === undefined) {
// // //       data.datasets = [];
// // //     }
// // //     let { comp_name, comp_code, _id } = data;

// // //     let datas = {
// // //       component_name: comp_name,
// // //       component_code: comp_code,
// // //       datasets: data.datasets,
// // //       status: data.status,
// // //       positive: data.positive,
// // //       negative: data.negative,
// // //       posble_match: data.posble_match,
// // //       _id,
// // //       config_data: {} // Assuming config_data was part of state, but not shown in original
// // //     };
// // //     sessionStorage.removeItem("compData");
// // //     sessionStorage.setItem("compData", JSON.stringify(datas));
// // //     historyHook.push('/comp_log');
// // //   };

// // //   const manageStation = (value) => {
// // //     let data = {
// // //       component_info: value,
// // //       page_info: '/comp_info'
// // //     };
// // //     sessionStorage.removeItem("InfoComp");
// // //     sessionStorage.setItem("InfoComp", JSON.stringify(data));
// // //     historyHook.push('/profileCreation');
// // //   };

// // //   const info = (data) => {
// // //     setModalCenter(true);
// // //     try {
// // //       urlSocket.post('/version_info', { 'comp_id': data._id }, { mode: 'no-cors' })
// // //         .then((response) => {
// // //           if (response.data.error === "Tenant not found") {
// // //             error_handler(response.data.error);
// // //           } else {
// // //             const sortedData = response.data.sort((a, b) => a.model_live_ver - b.model_live_ver);
// // //             setVerLog(sortedData);
// // //           }
// // //         })
// // //         .catch((error) => {
// // //           console.log(error);
// // //         });
// // //     } catch (error) {
// // //       console.log(error);
// // //     }
// // //   };

// // //   const activeOrInactive = async (string, value) => {
// // //     setSelectFilter(value);
// // //     setFilterCompStatus(string);
// // //     setCurrentPage(1);

// // //     try {
// // //       const response = await urlSocket.post('/active_inactive', { 'is_active': string, 'model_status': filter_modelStatus }, { mode: 'no-cors' });
// // //       if (response.data.error === "Tenant not found") {
// // //         error_handler(response.data.error);
// // //       } else {
// // //         if (!response.data || response.data.length === 0) {
// // //           setComponentList([]);
// // //           setSearchComponentList([]);
// // //         } else {
// // //           setComponentList(response.data);
// // //           setSearchComponentList(response.data);
// // //         }
// // //       }
// // //     } catch (error) {
// // //       console.log(error);
// // //     }
// // //   };

// // //   const modelFilter = async (str, value) => {
// // //     setModelFilter(value);
// // //     setFilterModelStatus(str);
// // //     setCurrentPage(1);

// // //     try {
// // //       const response = await urlSocket.post('/model_status_filter', { 'model_status': str, 'comp_status': filter_compStatus }, { mode: 'no-cors' });
// // //       if (response.data.error === "Tenant not found") {
// // //         error_handler(response.data.error);
// // //       } else {
// // //         if (!response.data || response.data.length === 0) {
// // //           setComponentList([]);
// // //           setSearchComponentList([]);
// // //         } else {
// // //           setComponentList(response.data);
// // //           setSearchComponentList(response.data);
// // //         }
// // //       }
// // //     } catch (error) {
// // //       console.log(error);
// // //     }
// // //   };

// // //   const onSearch = (search) => {
// // //     setSearchField(search);
// // //     setCurrentPageStock(1);
// // //     setCurrentPage(1);
// // //     setTimeout(() => {
// // //       dataListProcess();
// // //     }, 100);
// // //   };

// // //   const dataListProcess = () => {
// // //     try {
// // //       let tempList = [...search_componentList];

// // //       if (SearchField) {
// // //         tempList = tempList.filter(d =>
// // //           d.comp_name.toUpperCase().includes(SearchField.toUpperCase()) ||
// // //           d.comp_code.toUpperCase().includes(SearchField.toUpperCase())
// // //         );
// // //       }

// // //       if (sorting.field) {
// // //         const reversed = sorting.order === "asc" ? 1 : -1;
// // //         tempList = tempList.sort((a, b) => reversed * a[sorting.field].localeCompare(b[sorting.field]));
// // //       }

// // //       const slicedData = tempList.slice(
// // //         (currentPage_stock - 1) * items_per_page_stock,
// // //         (currentPage_stock - 1) * items_per_page_stock + items_per_page_stock
// // //       );
// // //       setComponentList(slicedData);
// // //       setTotalItemsStock(tempList.length);
// // //     } catch (error) {
// // //       console.error(error);
// // //     }
// // //   };

// // //   const handleModalClosed = () => {
// // //     setAddCompModal(false);
// // //     setCompName('');
// // //     setCompCode('');
// // //     setComponentNameError('');
// // //     setComponentCodeError('');
// // //     setCameraOpen(false);
// // //     setIncludeCamera(false);
// // //     setQrValue('');
// // //     setQrValueError('');
// // //     setBgRemove(true);
// // //   };

// // //   const handleIncludeCameraToggle = () => {
// // //     setIncludeCamera(prev => !prev);
// // //     setCameraOpen(prev => !prev);
// // //     setIsLoading(true);
// // //     setQrValueError('');
// // //     setQrValue('');
// // //   };

// // //   const handleWebcamLoad = (msg) => {
// // //     if (msg === 'error') {
// // //       setIsLoading(true);
// // //     } else {
// // //       setIsLoading(false);
// // //     }
// // //   };

// // //   const checkBarCode = async () => {
// // //     setQrNotFound(false);
// // //     setQrValueError('');

// // //     const formData = new FormData();
// // //     const imageSrc = webcamRef.current.getScreenshot({ width: DEFAULT_RESOLUTION.width, height: DEFAULT_RESOLUTION.height });
// // //     const blob = await fetch(imageSrc).then((res) => res.blob());
// // //     const today = new Date();
// // //     const _today = today.toLocaleDateString();
// // //     const time = today.toLocaleTimeString().replace(/:/g, '_');
// // //     const compdata = `${comp_name}_${comp_code}_${_today}_${time}`;
// // //     formData.append('datasets', blob, `${compdata}.png`);

// // //     try {
// // //       const qr_result = await urlSocket.post("/api/components/qr_add_comp", formData, {
// // //         headers: { "content-type": "multipart/form-data" },
// // //         mode: "no-cors"
// // //       });

// // //       if (qr_result.data.error === "Tenant not found") {
// // //         error_handler(qr_result.data.error);
// // //       } else if (qr_result.data !== "QR not found") {
// // //         setQrValue(qr_result.data.data);
// // //       } else {
// // //         setQrNotFound(true);
// // //         setQrValue(qr_result.data);
// // //       }
// // //     } catch (error) {
// // //       console.log(error);
// // //     }
// // //   };

// // //   const checkWebcam = async () => {
// // //     try {
// // //       const devices = await navigator.mediaDevices.enumerateDevices();
// // //       const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
// // //       if (!videoInputDevices.length) {
// // //         setWebcamEnabled(false);
// // //         setCameraDisconnected(true);
// // //       } else {
// // //         setWebcamEnabled(true);
// // //         setCameraDisconnected(false);
// // //         setVideoInputDevices(videoInputDevices);
// // //       }
// // //     } catch (error) {
// // //       console.error('Error checking devices:', error);
// // //     }
// // //   };

// // //   const handleCameraChange = event => {
// // //     setSelectedCamera(event.target.value);
// // //   };

// // //   const handlePageChange = (pageNumber) => {
// // //     setCurrentPage(pageNumber);
// // //   };

// // //   const showLiveVersionNums = (live_versions) => {
// // //     const flattenedValues = live_versions.flat();
// // //     return flattenedValues.map(value => `V${value}`).join(', ');
// // //   };

// // //   return (
// // //     <>
// // //       {adding_component && <FullScreenLoader />}
// // //       <div className='page-content'>
// // //         <MetaTags>
// // //           <title>Stage Information</title>
// // //         </MetaTags>
// // //         <Breadcrumbs title="STAGE INFORMATION" />
// // //         <Container fluid={true}>
// // //           <Card>
// // //             <CardBody>
// // //               <Row className="d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-2 mb-2">
// // //                 <Col xs="12" lg="auto" className="text-center">
// // //                   <div className="search-box">
// // //                     <div className="position-relative">
// // //                       <Input
// // //                         onChange={(e) => onSearch(e.target.value)}
// // //                         id="search-user"
// // //                         type="text"
// // //                         className="form-control"
// // //                         placeholder="Search name or code..."
// // //                         value={SearchField}
// // //                       />
// // //                       <i className="bx bx-search-alt search-icon" />
// // //                     </div>
// // //                     </div>
// // //                   </Col>
// // //                   <Col xs="12" lg="auto" className="text-center">
// // //                     <ButtonGroup>
// // //                       <Button className='btn btn-sm' color="primary" outline={selectFilter !== 0} onClick={() => activeOrInactive("all", 0)}>All</Button>
// // //                       <Button className='btn btn-sm' color="primary" outline={selectFilter !== 1} onClick={() => activeOrInactive(true, 1)}>Active</Button>
// // //                       <Button className='btn btn-sm' color="primary" outline={selectFilter !== 2} onClick={() => activeOrInactive(false, 2)}>Inactive</Button>
// // //                     </ButtonGroup>
// // //                   </Col>
// // //                   <Col xs="12" lg="auto" className="text-center">
// // //                     <ButtonGroup>
// // //                       <Button className='btn btn-sm' color="success" outline={modelfilter !== 0} onClick={() => modelFilter("all", 0)}>All</Button>
// // //                       <Button className='btn btn-sm' color="success" outline={modelfilter !== 4} onClick={() => modelFilter("No Models Available", 4)}>No Models</Button>
// // //                       <Button className='btn btn-sm' color="success" outline={modelfilter !== 1} onClick={() => modelFilter("Draft", 1)}>Draft</Button>
// // //                       <Button className='btn btn-sm' color="success" outline={modelfilter !== 2} onClick={() => modelFilter("Approved", 2)}>Approved</Button>
// // //                       <Button className='btn btn-sm' color="success" outline={modelfilter !== 3} onClick={() => modelFilter("Live", 3)}>Live</Button>
// // //                     </ButtonGroup>
// // //                   </Col>
// // //                   <Col xs="12" lg="auto" className="text-center">
// // //                     <Button color="primary" className="w-sm btn btn-sm d-flex align-items-center" onClick={() => setAddCompModal(true)}>
// // //                       <i className="bx bx-list-plus me-1" style={{ fontSize: '18px' }} /> Add Stage
// // //                     </Button>
// // //                   </Col>
// // //                 </Row>
// // //                 <div className='table-responsive'>
// // //                   {componentLoading ? (
// // //                     <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
// // //                       <Spinner color="primary" />
// // //                       <h5 className="mt-4">
// // //                         <strong>Loading Stage...</strong>
// // //                       </h5>
// // //                     </div>
// // //                   ) : componentList.length === 0 ? (
// // //                     <div className="container" style={{ position: 'relative', height: '50vh' }}>
// // //                       <div className="text-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
// // //                         <img src={Nodata_admin} className="img-sm h-auto" style={{ width: '20%' }} />
// // //                         <h5 className="text-secondary">No Stage Available</h5>
// // //                       </div>
// // //                     </div>
// // //                   ) : (
// // //                     <div className='table-responsive'>
// // //                       <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
// // //                         <thead className="table-light">
// // //                           <tr>
// // //                             <th>S. No.</th>
// // //                             <th>Stage Name</th>
// // //                             <th>Stage Code</th>
// // //                             <th>Stage Status</th>
// // //                             <th>Stage Status</th>
// // //                             <th>Stage Live Version</th>
// // //                             <th>Actions</th>
// // //                           </tr>
// // //                         </thead>
// // //                         <tbody>
// // //                           {componentList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((data, index) => (
// // //                             <tr key={index} id="recent-list">
// // //                               <td style={{ backgroundColor: "white" }}>{index + 1 + ((currentPage - 1) * itemsPerPage)}</td>
// // //                               <td style={{ backgroundColor: "white" }}>{data.comp_name}</td>
// // //                               <td style={{ backgroundColor: "white" }}>{data.comp_code}</td>
// // //                               <td style={{ backgroundColor: "white" }}>
// // //                                 {togglingCompStatus?.[data._id] ? (
// // //                                   <div className='ms-2'>
// // //                                     <Spin indicator={<LoadingOutlined />} />
// // //                                   </div>
// // //                                 ) : (
// // //                                   <Switch
// // //                                     checked={data.comp_status}
// // //                                     onChange={(e) => onChange(e, data)}
// // //                                     checkedChildren="Active"
// // //                                     unCheckedChildren="Inactive"
// // //                                   />
// // //                                 )}
// // //                               </td>
// // //                               <td style={{ backgroundColor: "white" }}>
// // //                                 <span className={data.model_status === 'Live' ? 'badge badge-soft-success' : data.model_status === 'Approved' ? 'badge badge-soft-warning' : data.model_status === 'Draft' ? 'badge badge-soft-info' : 'badge badge-soft-danger'}>
// // //                                   {data.model_status}
// // //                                 </span>
// // //                               </td>
// // //                               <td style={{ backgroundColor: "white" }}>
// // //                                 {data.model_live_ver && data.model_live_ver.length > 0 ? (
// // //                                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }} onClick={() => console.log(data.model_live_ver)}>
// // //                                     {showLiveVersionNums(data.model_live_ver)}
// // //                                     <i className='bx bx-info-circle' onClick={() => info(data)}></i>
// // //                                   </div>
// // //                                 ) : null}
// // //                               </td>
// // //                               <td style={{ backgroundColor: "white" }}>
// // //                                 <div className="d-flex gap-1 align-items-center" style={{ cursor: "pointer" }}>
// // //                                   {data.comp_status !== false && (
// // //                                     <>
// // //                                       <Button color="primary" className='btn btn-sm' onClick={() => handleModelInfo(data)} id={`model-${data._id}`}>

// // //                                         Model Info
// // //                                       </Button>
// // //                                       <UncontrolledTooltip placement="top" target={`model-${data._id}`}>
// // //                                         Manage Model Info
// // //                                       </UncontrolledTooltip>
// // //                                     </>
// // //                                   )}

// // //                                       {/* {data.comp_status !== false && (
// // //                                     <>
// // //                                       <Button color="primary" className='btn btn-sm' onClick={() => handlestagelInfo(data)} id={`model-${data._id}`}>

// // //                                       Stage Info
// // //                                       </Button>
// // //                                       <UncontrolledTooltip placement="top" target={`model-${data._id}`}>
// // //                                         Manage Stage Info
// // //                                       </UncontrolledTooltip>
// // //                                     </>
// // //                                   )} */}
// // //                                   {data.comp_status !== false && (
// // //                                     <>
// // //                                       <Button color="primary" className='btn btn-sm' onClick={() => manageStation(data)} id={`station-${data._id}`}>
// // //                                         Station Info
// // //                                       </Button>
// // //                                       <UncontrolledTooltip placement="top" target={`station-${data._id}`}>
// // //                                         Manage Station Info
// // //                                       </UncontrolledTooltip>
// // //                                     </>
// // //                                   )}
// // //                                   <>
// // //                                     <Button color="primary" className='btn btn-sm' onClick={() => logComp(data)} id={`log-${data._id}`}>
// // //                                       Log Info
// // //                                     </Button>
// // //                                     <UncontrolledTooltip placement="top" target={`log-${data._id}`}>
// // //                                       Log Info
// // //                                     </UncontrolledTooltip>
// // //                                   </>
// // //                                 </div>
// // //                               </td>
// // //                             </tr>
// // //                           ))}
// // //                         </tbody>
// // //                       </Table>
// // //                       <PaginationComponent
// // //                         totalItems={componentList.length}
// // //                         itemsPerPage={itemsPerPage}
// // //                         currentPage={currentPage}
// // //                         onPageChange={handlePageChange}
// // //                       />
// // //                     </div>
// // //                   )}
// // //                 </div>
// // //               </CardBody>
// // //             </Card>

// // //             {isCompStatusModalOpen && (
// // //               <Modal isOpen={isCompStatusModalOpen} toggle={toggleCompStatusModal} centered>
// // //                 <ModalBody>
// // //                   <p>If you deactivate this Stage, it will be deleted from the following stations:</p>
// // //                   <Table responsive striped bordered size="sm">
// // //                     <thead>
// // //                       <tr>
// // //                         <th>S.No</th>
// // //                         <th>Station Name</th>
// // //                       </tr>
// // //                     </thead>
// // //                     <tbody>
// // //                       {compAssignedStations.map((station, index) => (
// // //                         <tr key={index}>
// // //                           <td>{index + 1}</td>
// // //                           <td>{station}</td>
// // //                         </tr>
// // //                       ))}
// // //                     </tbody>
// // //                   </Table>
// // //                   <div className='d-flex my-2 justify-content-end gap-2'>
// // //                     <Button size='sm' color="danger" onClick={changeComponentStatus}>
// // //                       Yes, Deactivate
// // //                     </Button>
// // //                     <Button size='sm' color="secondary" onClick={toggleCompStatusModal}>
// // //                       Cancel
// // //                     </Button>
// // //                   </div>
// // //                 </ModalBody>
// // //               </Modal>
// // //             )}

// // //             <Modal isOpen={addCompModal} onClosed={handleModalClosed}>
// // //               <div className="modal-header">
// // //                 <h5 className="modal-title mt-0" id="myModalLabel">
// // //                   Enter Stage Details
// // //                 </h5>
// // //                 <button
// // //                   type="button"
// // //                   onClick={() => setAddCompModal(false)}
// // //                   className="close"
// // //                   data-dismiss="modal"
// // //                   aria-label="Close"
// // //                 >
// // //                   <span aria-hidden="true">&times;</span>
// // //                 </button>
// // //               </div>
// // //               <div className="modal-body">
// // //                 <Form>
// // //                   <div className="row mb-4">
// // //                     <Col sm={12}>
// // //                       <Label>Stage name</Label>
// // //                       <Input
// // //                         type="text"
// // //                         className="form-control"
// // //                         id="horizontal-compname-Input"
// // //                         placeholder="Enter Your Component Name"
// // //                         value={comp_name}
// // //                         maxLength="40"
// // //                         onChange={(e) => setCompName(e.target.value)}
// // //                       />
// // //                       {componentNameError && <p className="error-message" style={{ color: "red" }}>{componentNameError}</p>}
// // //                     </Col>
// // //                   </div>
// // //                   <div className="row mb-4">
// // //                     <Col sm={12}>
// // //                       <Label>Stage code</Label>
// // //                       <Input
// // //                         type="text"
// // //                         className="form-control"
// // //                         id="example-number-input"
// // //                         placeholder="Enter Your Component Code"
// // //                         maxLength="32"
// // //                         value={comp_code}
// // //                         onChange={(e) => setCompCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 8))}
// // //                       />
// // //                       {componentCodeError && <p className="error-message" style={{ color: "red" }}>{componentCodeError}</p>}
// // //                     </Col>
// // //                   </div>
// // //                   <div className="row mb-4">
// // //                     <Col sm={12}>
// // //                       <FormGroup check>
// // //                         <Label check>
// // //                           <Input type="checkbox" checked={bgremove} onChange={bgremovefunction} />
// // //                           Background Remove if Needed
// // //                         </Label>
// // //                       </FormGroup>
// // //                       <FormGroup check>
// // //                         <Label check>
// // //                           <Input type="checkbox" checked={includeCamera} onChange={handleIncludeCameraToggle} />
// // //                           Capture QR/Bar code
// // //                         </Label>
// // //                       </FormGroup>
// // //                       {includeCamera && cameraOpen && (
// // //                         <>
// // //                           <Input
// // //                             type="text"
// // //                             className="form-control mb-3"
// // //                             id="example-number-input"
// // //                             placeholder="Enter Your"
// // //                             maxLength="32"
// // //                             value={qr_value}
// // //                             disabled
// // //                           />
// // //                           {qr_valueerror && <p className="error-message" style={{ color: "red" }}>{qr_valueerror}</p>}
// // //                           {isLoading && (
// // //                             <div className='d-flex flex-column justify-content-center align-items-center' style={{ width: '100%' }}>
// // //                               <Spinner className='mt-2' color="primary" />
// // //                               <div className='mt-2' style={{ fontWeight: 'bold' }}>Waiting for Camera...</div>
// // //                             </div>
// // //                           )}
// // //                           <div style={{ display: isLoading ? 'none' : 'block' }}>
// // //                             {cameraDisconnected ? (
// // //                               <div className='d-flex flex-column justify-content-center align-items-center' style={{ width: '100%' }}>
// // //                                 <h5 style={{ fontWeight: 'bold' }}>Webcam Disconnected</h5>
// // //                                 <Spinner className='mt-2' color="primary" />
// // //                                 <div className='mt-2' style={{ fontWeight: 'bold' }}>Please check your webcam connection...</div>
// // //                               </div>
// // //                             ) : (
// // //                               <>
// // //                                 <Webcam
// // //                                   key={selectedCamera}
// // //                                   videoConstraints={selectedCamera ? { deviceId: selectedCamera } : {}}
// // //                                   style={{ width: '100%', height: 'auto' }}
// // //                                   onUserMedia={() => handleWebcamLoad()}
// // //                                   onUserMediaError={() => handleWebcamLoad('error')}
// // //                                   screenshotFormat="image/png"
// // //                                   ref={webcamRef}
// // //                                 />
// // //                                 <Button className='mt-2' color='primary' onClick={checkBarCode}>Add QR/Barcode</Button>
// // //                               </>
// // //                             )}
// // //                           </div>
// // //                         </>
// // //                       )}
// // //                     </Col>
// // //                   </div>
// // //                   <div className="row justify-content-end">
// // //                     <Col sm={9}>
// // //                       <div className="text-end">
// // //                         <Button color="primary" className="w-md" onClick={submitForm}>
// // //                           ADD
// // //                         </Button>
// // //                       </div>
// // //                     </Col>
// // //                   </div>
// // //                 </Form>
// // //               </div>
// // //             </Modal>

// // //             <Modal isOpen={modal_center} centered={true}>
// // //               <div className="modal-header">
// // //                 <h5 className="modal-title mt-0">Stage Live version details</h5>
// // //                 <button
// // //                   type="button"
// // //                   onClick={() => setModalCenter(false)}
// // //                   className="close"
// // //                   data-dismiss="modal"
// // //                   aria-label="Close"
// // //                 >
// // //                   <span aria-hidden="true">&times;</span>
// // //                 </button>
// // //               </div>
// // //               <div className='modal-body table-responsive'>
// // //                 <Table striped>
// // //                   <thead>
// // //                     <tr>
// // //                       <th>comp name</th>
// // //                       <th>comp code</th>
// // //                       <th>Model Name</th>
// // //                       <th>Model version</th>
// // //                     </tr>
// // //                   </thead>
// // //                   <tbody>
// // //                     {ver_log.map((data, index) => (
// // //                       <tr key={index}>
// // //                         <td>{data.comp_name}</td>
// // //                         <td>{data.comp_code}</td>
// // //                         <td>{data.model_name}</td>
// // //                         <td>
// // //                           {data.model_live_ver.map((value, index) => (
// // //                             <span key={index}>
// // //                               {`V${value}${index < data.model_live_ver.length - 1 ? ', ' : ''}`}
// // //                             </span>
// // //                           ))}
// // //                         </td>
// // //                       </tr>
// // //                     ))}
// // //                   </tbody>
// // //                 </Table>
// // //               </div>
// // //             </Modal>
// // //           </Container>
// // //         </div>
// // //       </>
// // //     );
// // // };

// // // ManageStage.propTypes = {
// // //   history: PropTypes.any.isRequired
// // // };

// // // export default ManageStage;




// // // // import React from 'react';
// // // // import MetaTags from 'react-meta-tags';
// // // // import {
// // // //   Container, CardTitle, Button, Col,
// // // //   Row, Modal, Form, Label, Input, Table,
// // // //   FormGroup, Spinner,
// // // //   ButtonGroup,
// // // //     ModalBody,
// // // //     ModalHeader,
// // // //     Card,
// // // //     CardBody,
// // // //     UncontrolledTooltip
// // // // } from 'reactstrap';

// // // // const ManageStage = () => {
// // // //     return (
// // // //         <>
// // // //             <div className="page-content">
// // // //                 <MetaTags>
// // // //                     <title> Stages Information</title>
// // // //                 </MetaTags>

// // // //                 <Container fluid={true}>

// // // //                     <Card>
// // // //                         <CardBody>
// // // //                             <Row className="d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-2 mb-2">
// // // //                                 <Col xs="12" lg="auto" className="text-center">
// // // //                                     <div className="search-box">
// // // //                                         <div className="position-relative">
// // // //                                             <Input
// // // //                                                 onChange={e => onSearch(e.target.value)}
// // // //                                                 id="search-user"
// // // //                                                 type="text"
// // // //                                                 className="form-control"
// // // //                                                 placeholder="Search name or code..."
// // // //                                             // value={state.SearchField}
// // // //                                             />
// // // //                                             <i className="bx bx-search-alt search-icon" />
// // // //                                         </div>
// // // //                                     </div>
// // // //                                 </Col>
// // // //                                 <Col xs="12" lg="auto" className="text-center">
// // // //                                     <ButtonGroup>
// // // //                                         <Button
// // // //                                             className="btn btn-sm"
// // // //                                             color="primary"
// // // //                                             // outline={state.selectFilter !== 0}
// // // //                                                 outline
// // // //                                             onClick={() => activeOrInactive('all', 0)}
// // // //                                         >
// // // //                                             All
// // // //                                         </Button>
// // // //                                         <Button
// // // //                                             className="btn btn-sm"
// // // //                                             color="primary"
// // // //                                             // outline={state.selectFilter !== 1}
// // // //                                                 outline
// // // //                                             onClick={() => activeOrInactive(true, 1)}
// // // //                                         >
// // // //                                             Active
// // // //                                         </Button>
// // // //                                         <Button
// // // //                                             className="btn btn-sm"
// // // //                                             color="primary"
// // // //                                             // outline={state.selectFilter !== 2}
// // // //                                                 outline
// // // //                                             onClick={() => activeOrInactive(false, 2)}
// // // //                                         >
// // // //                                             Inactive
// // // //                                         </Button>
// // // //                                     </ButtonGroup>
// // // //                                 </Col>
// // // //                                 <Col xs="12" lg="auto" className="text-center">
// // // //                                     <ButtonGroup>
// // // //                                         <Button
// // // //                                             className="btn btn-sm"
// // // //                                             color="success"
// // // //                                             // outline={state.modelfilter !== 0}
// // // //                                                 outline
// // // //                                             onClick={() => modelFilter('all', 0)}
// // // //                                         >
// // // //                                             All
// // // //                                         </Button>
// // // //                                         <Button
// // // //                                             className="btn btn-sm"
// // // //                                             color="success"
// // // //                                             // outline={state.modelfilter !== 4}
// // // //                                                 outline
// // // //                                             onClick={() => modelFilter('No Models Available', 4)}
// // // //                                         >
// // // //                                             No Models
// // // //                                         </Button>
// // // //                                         <Button
// // // //                                             className="btn btn-sm"
// // // //                                             color="success"
// // // //                                             // outline={state.modelfilter !== 1}
// // // //                                                 outline
// // // //                                             onClick={() => modelFilter('Draft', 1)}
// // // //                                         >
// // // //                                             Draft
// // // //                                         </Button>
// // // //                                         <Button
// // // //                                             className="btn btn-sm"
// // // //                                             color="success"
// // // //                                             outline
// // // //                                             onClick={() => modelFilter('Approved', 2)}
// // // //                                         >
// // // //                                             Approved
// // // //                                         </Button>
// // // //                                         <Button
// // // //                                             className="btn btn-sm"
// // // //                                             color="success"
// // // //                                             // outline={state.modelfilter !== 3}
// // // //                                                 outline
// // // //                                             onClick={() => modelFilter('Live', 3)}
// // // //                                         >
// // // //                                             Live
// // // //                                         </Button>
// // // //                                     </ButtonGroup>
// // // //                                 </Col>
// // // //                                 <Col xs="12" lg="auto" className="text-center">
// // // //                                     <Button
// // // //                                         color="primary"
// // // //                                         className="w-sm btn btn-sm d-flex align-items-center"
// // // //                                         // onClick={() => setState(prev => ({ ...prev, addCompModal: true }))}
// // // //                                     >
// // // //                                         <i className="bx bx-list-plus me-1" style={{ fontSize: '18px' }} /> Add Stages
// // // //                                     </Button>
// // // //                                 </Col>
// // // //                             </Row>
// // // //                         </CardBody>
// // // //                     </Card>
// // // //                 </Container>
// // // //             </div>

// // // //         </>
// // // //     );
// // // // };

// // // // export default ;
// // // ManageStage