import React, { useState, useEffect, useRef, useCallback } from 'react';
import MetaTags from 'react-meta-tags';
import {
  Container, CardTitle, Button, Col,
  Row, Modal, Form, Label, Input, Table,
  FormGroup, Spinner, ButtonGroup,
  ModalBody, ModalHeader, Card, CardBody,
  UncontrolledTooltip, CardText
} from 'reactstrap';
import urlSocket from "./urlSocket";
import PropTypes from "prop-types";
import { useHistory } from 'react-router-dom';
import { Spin, Switch } from 'antd';
import Nodata_admin from "assets/images/nodata/nodata_admin.jpg";
import Swal from 'sweetalert2';
import Webcam from 'react-webcam';
import Select from 'react-select';


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
  const [compInfo, setCompInfo] = useState("");


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
  const [splitView, setSplitView] = useState({});
  // Camera Selection States
  const [multiCameraSelected, setMultiCameraSelected] = useState([]);
  const [singleCameraSelected, setSingleCameraSelected] = useState(null);
  const [cameraData, setCameraData] = useState([]);

  // Error states for camera selection
  const [cameraSelectionError, setCameraSelectionError] = useState("");

  const [editStageModal, setEditStageModal] = useState(false);
  const [editingStage, setEditingStage] = useState(null);
  const [trainInfo, setTrainInfo] = useState([]);
  const [application_mode, setapplication_mode] = useState('');


  console.log('cameraData', cameraData)

  const webcamRef = useRef(null);
  const historyHook = useHistory();

  useEffect(() => {
    const currentPageItems = componentList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const currentPageIds = currentPageItems.map(item => item._id);
    const allSelected = currentPageIds.every(id => selectedStages.includes(id));
    setIsAllSelected(allSelected);
  }, [selectedStages, currentPage, componentList]);

  useEffect(() => {
    if (!compInfo?._id) return;

    const fetchData = async () => {
      try {
        const res = await urlSocket.post(
          "/get_station_comp_train_info",
          { comp_id: compInfo._id },
          { mode: "no-cors" }
        );
        console.log("Train Info Data:", res.data);

        setTrainInfo(res.data);

        // ✅ Extract stage IDs
        if (res.data?.length > 0 && res.data[0]?.stages) {
          const stageIds = res.data[0].stages.map(stg => stg._id);
          console.log("Preselected Stage IDs:", stageIds);
          setSelectedStages(stageIds); // ✅ pre-select those checkboxes
        }
      } catch (error) {
        console.error("Error fetching train info:", error);
      }
    };

    fetchData();
  }, [compInfo]);
  useEffect(() => {
    console.log("hiiiiiiiiiiiii")
    const loadTrainingConfig = async () => {
      try {
        const res = await urlSocket.post("/training_config");
        const data = res.data;
        console.log("training config data:", data.config);

        if (data.status) {
          setapplication_mode(data.config.application_mode);
        }
      } catch (err) {
        console.log("Error:", err);
      }
    };

    loadTrainingConfig();
  }, []);
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
  useEffect(() => {
    const initialSplitView = {};
    selectedStages.forEach((stage) => {
      initialSplitView[stage._id] = stage.split; // use DB value
    });
    setSplitView(initialSplitView);
  }, [selectedStages]); // stages is your data array

  // Effects
  useEffect(() => {
    const paginationCompInfo = JSON.parse(sessionStorage.getItem('paginationCompInfo'));
    if (paginationCompInfo?.currentPage) {
      setCurrentPage(paginationCompInfo.currentPage);
    }

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
    // setSelectedStages([]);
    setIsAllSelected(false);
  }, [componentList]);

  // Update "Select All" state based on selected stages
  useEffect(() => {
    const currentPageItems = componentList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const currentPageIds = currentPageItems.map(item => item._id);
    const selectedCurrentPageItems = selectedStages.filter(id => currentPageIds.includes(id));

    setIsAllSelected(currentPageItems.length > 0 && selectedCurrentPageItems.length === currentPageItems.length);
  }, [selectedStages, componentList, currentPage, itemsPerPage]);

  // Get list of cameras for qr preview
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const cams = devices.filter((d) => d.kind === "videoinput");
      setVideoInputDevices(cams);
      if (cams.length > 0 && !selectedCamera) {
        setSelectedCamera(cams[0].deviceId); // default to first
      }
    });
  }, []);

  // Apply selected camera for qr preview
  useEffect(() => {
    if (!selectedCamera) return;

    (async () => {
      // Stop existing stream if any
      if (webcamRef.current && webcamRef.current.stream) {
        webcamRef.current.stream.getTracks().forEach((t) => t.stop());
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedCamera } },
        });
        if (webcamRef.current?.video) {
          webcamRef.current.video.srcObject = stream;
        }
      } catch (err) {
        console.error("Error switching camera:", err);
      }
    })();
  }, [selectedCamera]);

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


  // const toggleSplitView = async (stageId, dbSplit) => {
  //   setSplitView((prev) => {
  //     const current = prev[stageId] ?? dbSplit; // local or DB value

  //     if (current === true) {
  //       return prev;
  //     }

  //     const newSplit = true;

  //     urlSocket.post("/api/stage/update_stage_split", {
  //       stage_id: stageId,
  //       split: newSplit,
  //     })
  //       .then(res => {
  //         console.log("✅ Split set to true in backend:", res.data);
  //       })
  //       .catch(err => {
  //         console.error("❌ Failed to set split:", err);
  //       });

  //     return {
  //       ...prev,
  //       [stageId]: newSplit,
  //     };
  //   });
  // };

  const setSplitViewMode = async (stageId, newSplit) => {
    setSplitView((prev) => ({
      ...prev,
      [stageId]: newSplit,
    }));
    changeComponentStatus({
      _id: stageId,
      split: newSplit
    }, { showToast: false, toggleLoading: false, resetTemp: false });

    // update backend
    try {
      const res = await urlSocket.post("/api/stage/update_stage_split", {
        stage_id: stageId,
        split: newSplit,
      });
      console.log(`✅ Split set to ${newSplit ? "true" : "false"} in backend:`, res.data);
    } catch (err) {
      console.error("❌ Failed to update split:", err);
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



  const back = () => {
    console.log('back is working');
    historyHook.push('/comp_info');
  };
  const handleTraining = (operation) => {
    const selectedData = getSelectedStagesData();
    console.log('Selected stages for operation:', operation, selectedData);
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
            console.log('Activating stages:', selectedData);
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

      case 'TrainingMode':
        Swal.fire({
          title: 'Assign Selected Stages to Training Mode?',
          text: `Are you sure you want to assign ${selectedData.length} selected stages to Training Mode?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, assign them!'
        }).then((result) => {
          if (result.isConfirmed) {
            sessionStorage.setItem('selectedStages', JSON.stringify(selectedData));
            historyHook.push('/station_data_stg');
            console.log('Assigning stages to training mode:', selectedData);
            // You can call your bulk assign to training mode API here
          }
        });
        break;

      default:
        console.log('Unknown operation:', operation);
    }
  };

  // const handleBulkOperation = (operation) => {
  //   const selectedData = getSelectedStagesData();

  //   switch (operation) {

  //     case 'AssignStation':
  //       Swal.fire({
  //         title: 'Assign Station Selected Stages?',
  //         text: `Are you sure you want to Assign Station ${selectedData.length} selected stages?`,
  //         icon: 'question',
  //         showCancelButton: true,
  //         confirmButtonColor: '#3085d6',
  //         cancelButtonColor: '#d33',
  //         confirmButtonText: 'Yes, activate them!'
  //       }).then((result) => {
  //         if (result.isConfirmed) {
  //           // Implement bulk activate logic here
  //           console.log('Assign Station this stage:', selectedData);
  //           // You can call your bulk activation API here
  //         }
  //       });
  //       break;
  //     case 'activate':
  //       Swal.fire({
  //         title: 'Activate Selected Stages?',
  //         text: `Are you sure you want to activate ${selectedData.length} selected stages?`,
  //         icon: 'question',
  //         showCancelButton: true,
  //         confirmButtonColor: '#3085d6',
  //         cancelButtonColor: '#d33',
  //         confirmButtonText: 'Yes, activate them!'
  //       }).then((result) => {
  //         if (result.isConfirmed) {
  //           console.log('Activating stages:', selectedData);
  //         }
  //       });
  //       break;

  //     case 'deactivate':
  //       Swal.fire({
  //         title: 'Deactivate Selected Stages?',
  //         text: `Are you sure you want to deactivate ${selectedData.length} selected stages?`,
  //         icon: 'warning',
  //         showCancelButton: true,
  //         confirmButtonColor: '#d33',
  //         cancelButtonColor: '#3085d6',
  //         confirmButtonText: 'Yes, deactivate them!'
  //       }).then((result) => {
  //         if (result.isConfirmed) {
  //           // Implement bulk deactivate logic here
  //           console.log('Deactivating stages:', selectedData);
  //           // You can call your bulk deactivation API here
  //         }
  //       });
  //       break;

  //     case 'delete':
  //       Swal.fire({
  //         title: 'Delete Selected Stages?',
  //         text: `Are you sure you want to delete ${selectedData.length} selected stages? This action cannot be undone!`,
  //         icon: 'warning',
  //         showCancelButton: true,
  //         confirmButtonColor: '#d33',
  //         cancelButtonColor: '#3085d6',
  //         confirmButtonText: 'Yes, delete them!'
  //       }).then((result) => {
  //         if (result.isConfirmed) {
  //           // Implement bulk delete logic here
  //           console.log('Deleting stages:', selectedData);
  //           // You can call your bulk delete API here
  //         }
  //       });
  //       break;

  //     default:
  //       console.log('Unknown operation:', operation);
  //   }
  // };

  // Helper functions
  const error_handler = useCallback((error) => {
    sessionStorage.removeItem("authUser");
    historyHook.push("/login");
  }, [historyHook]);

  const getStage_info = useCallback(async (compData) => {
    console.log('compData._id', compData._id)
    try {
      const response = await urlSocket.post('/api/stage/get_stage_info', { comp_id: compData._id }, { mode: 'no-cors' });
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
      const response = await urlSocket.post('/api/camera/get_camera_collection', { mode: 'no-cors' });
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
        originalLabel: cam.title || cam.label

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
        comp_id: editingStage.comp_id,
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
      const response = await urlSocket.post('/api/stage/model_stage_status_change', { 'modelData': data }, { mode: 'no-cors' });
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


  const handleModelInfo = async (data, cam = null) => {
    // shallow copy stage
    let selectedStage = { ...data };
    console.log("selectedStage", selectedStage);
    // pick the camera: from split view (cam) or single mode
    let selectedCamera = cam
      ? cam
      : (data.camera_selection?.camera || null);
    console.log("selectedCamera", selectedCamera);

    if (selectedCamera) {
      // replace only the cameras array, keep mode unchanged
      selectedStage = {
        ...selectedStage,
        camera_selection: {
          ...selectedStage.camera_selection,
          cameras: [selectedCamera],   // keep only the clicked camera
        }
      };
    }

    let modelInfo_data = {
      ManageStage: selectedStage,
      modelInfo,
      compInfo: compData,
    };

    console.log("modelInfo_data", modelInfo_data);

    await sessionStorage.setItem("managestageData", JSON.stringify(modelInfo_data));
    historyHook.push("/stageManageModel");
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


  //Bharani
  // const changeComponentStatus = async (checked, data) => {
  //   console.log('checked, data', checked, data)
  //   setIsCompStatusModalOpen(false);
  //   console.log('241', data)
  //   let stage_id = data._id;
  //   console.log('stage_id :>> ', stage_id);
  //   let stage_name = data.stage_name;
  //   let stage_code = data.stage_code;


  //   try {
  //     const response = await urlSocket.post('/api/stage/stage_status_upd', {


  //       '_id': stage_id,
  //       'stage_name': stage_name,
  //       'stage_code': stage_code,
  //       'stage_status': checked
  //     }, { mode: 'no-cors' });

  //     console.log('response564', response)

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


  //Chiran
  const changeComponentStatus = async (payload, options = {}) => {
    // options:
    // { showToast: true/false, toggleLoading: true/false }

    if (!payload?._id) {
      console.warn("No stage _id provided in payload");
      return;
    }

    const stage_id = payload._id;

    // Only show loading if toggleLoading !== false
    if (options.toggleLoading !== false) {
      setTogglingCompStatus(prev => ({ ...prev, [stage_id]: true }));
    }

    // Close modal only if explicitly set
    if (options.closeModal) {
      setIsCompStatusModalOpen(false);
    }

    try {
      const response = await urlSocket.post(
        '/api/stage/stage_status_upd',
        payload
      );

      console.log('Backend response:', response);

      if (options.showToast !== false) {
        Swal.fire({
          icon: 'success',
          title: `"${payload.stage_name || "Stage"}" updated successfully.`,
          showConfirmButton: false,
          timer: 3000
        });
      }

      // Optionally refresh filtered view
      if (payload.stage_status !== undefined && options.updateFilter !== false) {
        if (selectFilter === 1) {
          activeOrInactive(true, 1);
        } else if (selectFilter === 2) {
          activeOrInactive(false, 2);
        } else if (selectFilter === 0) {
          activeOrInactive("all", 0);
        }
      }
    } catch (error) {
      console.error('Error updating stage:', error);
    } finally {
      if (options.toggleLoading !== false) {
        setTogglingCompStatus(prev => ({ ...prev, [stage_id]: false }));
      }
      if (options.resetTemp !== false) {
        setCompStatusDataTemp({});
      }
    }
  };

  const toggleCompStatusModal = async () => {
    const { data } = compStatusDataTemp;
    setIsCompStatusModalOpen(false);
    setTogglingCompStatus(prev => ({ ...prev, [data._id]: false }));
  };


  //bHARANI
  // const onChange = async (checked, data) => {
  //   setTogglingCompStatus(prev => ({ ...prev, [data._id]: true }));
  //   setCompStatusDataTemp({ data, checked });

  //   try {
  //     const station_list = await checkIsAssignedToStations(data, checked);
  //     const isAssignedToStations = station_list.length > 0;

  //     if (!isAssignedToStations) {
  //       await changeComponentStatus(checked, data);
  //     } else {
  //       setCompAssignedStations(station_list);
  //       setIsCompStatusModalOpen(true);
  //     }
  //   } catch (error) {
  //     console.log('second')
  //     console.error("Error toggling component status:", error);
  //     setTogglingCompStatus(prev => ({ ...prev, [data._id]: false }));
  //     setCompStatusDataTemp({});
  //   }
  // };


  //chiran
  // const logComp = (data) => {
  //   if (data.datasets === undefined) {
  //     data.datasets = [];
  //   }
  //   let { stage_name, stage_code, _id } = data;

  //   let datas = {
  //     parent_id: compData._id,
  //     stage_name: stage_name,
  //     stage_code: stage_code,
  //     datasets: data.datasets,
  //     status: data.status,
  //     positive: data.positive,
  //     negative: data.negative,
  //     posble_match: data.posble_match,
  //     _id,
  //     config_data: {} // Assuming config_data was part of state, but not shown in original
  //   };
  //   console.log('object :>> ', datas);
  //   sessionStorage.removeItem("stageData");
  //   sessionStorage.setItem("stageData", JSON.stringify(datas));
  //   historyHook.push('/stagelog');
  // };


  //CHIRAN
  // const onChange = async (checked, data) => {
  //   setTogglingCompStatus(prev => ({ ...prev, [data._id]: true }));
  //   setCompStatusDataTemp({ data, checked });

  //   try {
  //     const station_list = await checkIsAssignedToStations(data, checked);
  //     const isAssignedToStations = station_list.length > 0;

  //     if (!isAssignedToStations) {
  //       await changeComponentStatus({
  //         _id: data._id,
  //         stage_status: checked,
  //       }, { showToast: true });
  //     } else {
  //       setCompAssignedStations(station_list);
  //       setIsCompStatusModalOpen(true);
  //     }
  //   } catch (error) {
  //     console.error("Error toggling component status:", error);
  //     setTogglingCompStatus(prev => ({ ...prev, [data._id]: false }));
  //     setCompStatusDataTemp({});
  //   }
  // };

  const onChange = async (checked, data) => {
    setTogglingCompStatus(prev => ({ ...prev, [data._id]: true }));
    setCompStatusDataTemp({ data, checked });

    try {
      // ⭐ SINGLE MODE CHECK
      if (application_mode === "Single" && checked === true) {

        // Find if any other stage is active
        const anotherActive = componentList.some(
          (stage) => stage._id !== data._id && stage.stage_status === true
        );

        if (anotherActive) {
          Swal.fire({
            icon: "warning",
            title: "Single Mode Restriction",
            text: "Another stage is already active. Please deactivate that stage before activating this one.",
          });

          // STOP SWITCH TOGGLE
          setTogglingCompStatus(prev => ({ ...prev, [data._id]: false }));
          return;
        }
      }

      // ⭐ Now proceed with original logic
      const station_list = await checkIsAssignedToStations(data, checked);
      const isAssignedToStations = station_list.length > 0;

      if (!isAssignedToStations) {
        await changeComponentStatus(
          {
            _id: data._id,
            stage_status: checked,
          },
          { showToast: true }
        );
      } else {
        setCompAssignedStations(station_list);
        setIsCompStatusModalOpen(true);
      }
    } catch (error) {
      console.error("Error toggling component status:", error);
      setTogglingCompStatus(prev => ({ ...prev, [data._id]: false }));
      setCompStatusDataTemp({});
    }
  };


  const logComp = (data) => {
    if (data.datasets === undefined) {
      data.datasets = [];
    }
    let { stage_name, stage_code, _id } = data;

    let datas = {
      stage_id: data._id,
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

  //Bharani
  // const EditStage = (stage) => {
  //   setEditingStage(stage);

  //   // Prefill fields
  //   setStageName(stage.stage_name);
  //   setStageCode(stage.stage_code);
  //   setQrValue(stage.qrOrBar_code || '');
  //   setBgRemove(stage.background || false);
  //   setCameraMode(stage.camera_selection?.mode || '');
  //   setMultiCameraSelected(stage.camera_selection?.mode === 'multi' ? stage.camera_selection.cameras : []);
  //   setSingleCameraSelected(stage.camera_selection?.mode === 'single' ? stage.camera_selection.camera : null);
  //   setIncludeCamera(!!stage.qrOrBar_code && stage.qrOrBar_code !== 'NA');

  //   // Finally, open modal
  //   setEditStageModal(true);
  // };


  //Chiran
  const EditStage = (stage) => {
    setEditingStage(stage);
    setStageName(stage.stage_name);
    setStageCode(stage.stage_code);
    setQrValue(stage.qrOrBar_code || '');
    setBgRemove(stage.background || false);
    setCameraMode(stage.camera_selection?.mode || '');
    setMultiCameraSelected(stage.camera_selection?.mode === 'multi' ? stage.camera_selection.cameras : []);
    setSingleCameraSelected(stage.camera_selection?.mode === 'single' ? stage.camera_selection.camera : null);
    setIncludeCamera(!!stage.qrOrBar_code && stage.qrOrBar_code !== 'NA');

    const payload = {
      _id: stage._id,
      stage_name: stage.stage_name,
      stage_code: stage.stage_code,
      qrOrBar_code: stage.qrOrBar_code || '',
      background: stage.background || false,
      camera_selection: stage.camera_selection || {},
      split: stage.split ?? false,
      region_selection: stage.region_selection ?? false,
      stage_status: stage.stage_status ?? true
    };

    changeComponentStatus(payload, { showToast: false, toggleLoading: false, resetTemp: false });

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
    console.log('data', data)
    try {
      urlSocket.post('/stage_version_info', { 'stage_id': data._id }, { mode: 'no-cors' })
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
      const response = await urlSocket.post('/api/stage/stage_active_inactive', { 'comp_id': compData._id, 'is_active': string, 'model_status': filter_modelStatus }, { mode: 'no-cors' });
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
      const response = await urlSocket.post('/api/stage/stage_status_filter', { 'comp_id': compData._id, 'model_status': str, 'stage_status': filter_compStatus }, { mode: 'no-cors' });
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
    dataListProcess();
  }, [SearchField, currentPage_stock, sorting]);

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
          d.stage_name.toUpperCase().includes(SearchField.toUpperCase()) ||
          d.stage_code.toUpperCase().includes(SearchField.toUpperCase())
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
                  {/* <Button color="primary" className="w-sm btn btn-sm d-flex align-items-center" onClick={() => setAddCompModal(true)}>
                    <i className="bx bx-list-plus me-1" style={{ fontSize: '18px' }} /> Add Stage
                  </Button> */}
                  <Button
                    color="primary"
                    className="w-sm btn btn-sm d-flex align-items-center"
                    onClick={() => {

                      if (application_mode === "Single") {
                        const hasActiveStage = componentList.some(stage => stage.stage_status === true);

                        if (hasActiveStage) {
                          Swal.fire({
                            icon: "warning",
                            title: "Active Stage Exists",
                            text: "Please deactivate the active stage before adding a new one.",
                          });
                          return;
                        }
                      }

                      // Allow adding stage in Multi mode OR when no active stage exists
                      setAddCompModal(true);
                    }}
                  >
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
                      <div className="d-flex gap-2">
                        {/* <Button size="sm" color="success" onClick={() => handleBulkOperation('AssignStation')}>
                          <i className="bx bx-check-circle me-1" />
                          Submit
                        </Button> */}
                        {/* <Button size="sm" color="success" onClick={() => handleTraining('AssignStation')}>
                          <i className="bx bx-check-circle me-1" />
                          Submit
                        </Button> */}

                        <Button size="sm" color="success" onClick={() => handleTraining('TrainingMode')}>
                          <i className="bx bx-brain me-1" />
                          Assign to Training Mode
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

                            <td style={{ backgroundColor: 'white' }}>
                              {data.camera_selection ? (
                                <div className="text-start">
                                  {data.camera_selection.mode === 'multi' ? (
                                    <div>
                                      <div className="d-flex align-items-center justify-content-between mb-1">
                                        <span className="badge bg-info">
                                          Multi Camera
                                        </span>
                                        {/* Trendy Edit Button with Text */}
                                        <button
                                          className="btn btn-sm px-3 py-1 rounded-pill"
                                          onClick={() => EditStage(data)}
                                          style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            border: 'none',
                                            color: 'white',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                                            transition: 'transform 0.2s'
                                          }}
                                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                          <i className="bx bx-edit-alt me-1"></i> Edit
                                        </button>
                                      </div>
                                      <small className="text-muted">
                                        {data.camera_selection.cameras.length} camera
                                        {data.camera_selection.cameras.length > 1 ? 's' : ''} assigned
                                      </small>
                                      <div className="mt-1">
                                        {data.camera_selection.cameras.map((cam, idx) => (
                                          <small
                                            key={idx}
                                            className="d-block text-truncate"
                                            style={{ maxWidth: '120px' }}
                                          >
                                            • {cam.label}
                                          </small>
                                        ))}
                                      </div>

                                      <div className="d-inline-flex border rounded-pill bg-light shadow-sm mt-2">
                                        {/* Split Button */}
                                        <div
                                          className={`px-3 py-1 ${(splitView[data._id] ?? data.split)
                                            ? "bg-primary text-white border rounded-pill "
                                            : "text-muted bg-light cursor-pointer "
                                            }`}
                                          onClick={() => {
                                            if (!(splitView[data._id] ?? data.split)) {
                                              setSplitViewMode(data._id, true);
                                            }
                                          }}
                                        >
                                          <i className="bx bx-git-branch me-1"></i> Split
                                        </div>

                                        {/* Combined Button */}
                                        <div
                                          className={`px-3 py-1 ${!(splitView[data._id] ?? data.split)
                                            ? "bg-primary text-white border rounded-pill "
                                            : "text-muted bg-light cursor-pointer "
                                            }`}
                                          onClick={() => {
                                            if (splitView[data._id] ?? data.split) {
                                              setSplitViewMode(data._id, false);
                                            }
                                          }}
                                        >
                                          <i className="bx bx-link me-1"></i> Combined
                                        </div>
                                      </div>

                                    </div>
                                  ) : data.camera_selection.mode === 'single' ? (
                                    <div>
                                      <div className="d-flex align-items-center justify-content-between mb-1">
                                        <span className="badge bg-success">Single Camera</span>
                                        {/* Trendy Edit Button with Text */}
                                        <button
                                          className="btn btn-sm px-3 py-1 rounded-pill"
                                          onClick={() => EditStage(data)}
                                          style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #7c13e4ff 100%)',
                                            border: 'none',
                                            color: 'white',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            boxShadow: '0 2px 8px rgba(219, 219, 219, 0.3)',
                                            transition: 'transform 0.2s'
                                          }}
                                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                          <i className="bx bx-edit-alt me-1"></i> Edit
                                        </button>
                                      </div>
                                      <small
                                        className="text-muted d-block text-truncate"
                                        style={{ maxWidth: '120px' }}
                                      >
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
                            <td style={{ backgroundColor: 'white' }}>
                              {data.camera_selection ? (
                                <div className="d-flex flex-column gap-2">
                                  {(splitView[data._id] ?? data.split) && data.camera_selection.mode === 'multi' ? (
                                    // Split View: Each camera in its own card
                                    data.camera_selection.cameras.map((cam, idx) => (
                                      <div key={idx} className="p-3 rounded-3 shadow-sm bg-white mb-2">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                          <span className="fw-semibold d-flex align-items-center gap-2">
                                            <i className="bx bx-camera text-primary fs-5"></i> {cam.label}
                                          </span>
                                        </div>

                                        <div className="d-flex flex-wrap gap-2">
                                          {data.stage_status && (
                                            <>

                                              <Button
                                                color="primary"
                                                size="sm"
                                                onClick={() => handleModelInfo(data, cam)}
                                              >
                                                <i className="bx bx-cube me-1"></i> Model Info
                                              </Button>
                                            </>
                                          )}

                                          {/* <Button
                                            color="primary"
                                            size="sm"
                                            onClick={() => handleModelInfo(data, cam)}
                                          >
                                            <i className="bx bx-cube me-1"></i> Model Info
                                          </Button> */}
                                          {/* <Button
                                            color="primary"
                                            size="sm"
                                            onClick={() => manageStation(data, cam)}
                                          >
                                            <i className="bx bx-building me-1"></i> Station Info
                                          </Button> */}
                                          <Button
                                            color="primary"
                                            size="sm"
                                            onClick={() => logComp(data, cam)}
                                          >
                                            <i className="bx bx-list-ul me-1"></i> Log Info
                                          </Button>
                                          {/* <Button
                                            color="primary"
                                            size="sm"
                                            onClick={() => EditStage(data, cam)}
                                          >
                                            <i className="bx bx-edit-alt me-1"></i> Edit
                                          </Button> */}
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    // Combined View: Single card
                                    <div className="p-3 rounded-3 shadow-sm bg-white border">
                                      <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="fw-semibold d-flex align-items-center gap-2">
                                          <i className="bx bx-camera text-primary fs-5"></i>
                                          {data.camera_selection.mode === "multi"
                                            ? `${data.camera_selection.cameras.length} Cameras`
                                            : data.camera_selection.camera.label}
                                        </span>
                                      </div>

                                      <div className="d-flex flex-wrap gap-2">
                                        {data.stage_status && (
                                          <div className="d-flex flex-wrap gap-2">
                                            <>
                                              <Button
                                                color="primary"
                                                size="sm"
                                                onClick={() => handleModelInfo(data)} id={`Model-${data._id}`}
                                              >
                                                <i className="bx bx-cube me-1"></i> Model Info
                                              </Button>

                                              <UncontrolledTooltip placement="top" target={`Model-${data._id}`}>
                                                Model Info
                                              </UncontrolledTooltip>
                                            </>
                                            {/* <>
                                              <Button
                                                color="primary"
                                                size="sm"
                                                onClick={() => manageStation(data)} id={`Station-${data._id}`}
                                              >
                                                <i className="bx bx-building me-1"></i> Station Info


                                              </Button>
                                              <UncontrolledTooltip placement="top" target={`Station-${data._id}`}>
                                                Station Info
                                              </UncontrolledTooltip>
                                            </> */}

                                          </div>
                                        )}
                                        <>
                                          <Button
                                            color="primary"
                                            size="sm"
                                            onClick={() => logComp(data)} id={`Log-${data._id}`}
                                          >
                                            <i className="bx bx-list-ul me-1"></i> Log Info
                                          </Button>
                                          {/* <Button
                                          color="primary"
                                          size="sm"
                                          onClick={() => EditStage(data)}
                                        >
                                          <i className="bx bx-edit-alt me-1"></i> Edit
                                        </Button> */}
                                          <UncontrolledTooltip placement="top" target={`Log-${data._id}`}>
                                            Log Info
                                          </UncontrolledTooltip>
                                        </>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                // No Camera: default card
                                <div className="p-3 rounded shadow-sm bg-white border">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-muted">
                                      <i className="bx bx-camera-off me-1"></i> No Camera
                                    </span>
                                    <div className="d-flex gap-2 flex-wrap">
                                      <Button
                                        size="sm"
                                        variant="primary"
                                        className="rounded-pill px-3"
                                        onClick={() => logComp(data)}
                                      >
                                        <i className="bx bx-list-ul me-1"></i> Log
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="primary"
                                        className="rounded-pill px-3"
                                        onClick={() => EditStage(data)}
                                      >
                                        <i className="bx bx-edit-alt me-1"></i> Edit
                                      </Button>
                                    </div>
                                  </div>
                                </div>
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
                    <Label>Stage name <span className="text-danger">*</span></Label>
                    <Input
                      type="text"
                      className="form-control"
                      id="horizontal-compname-Input"
                      placeholder="Enter Your Stage Name"
                      value={stageName}
                      maxLength="40"
                      // onChange={(e) => setStageName(e.target.value)}
                      onChange={(e) => {
                        setStageName(e.target.value);
                        if (componentNameError) setComponentNameError('');
                      }}
                    />
                    {componentNameError && <p className="error-message" style={{ color: "red" }}>{componentNameError}</p>}
                  </Col>
                </div>

                <div className="row mb-4">
                  <Col sm={12}>
                    <Label>Stage code <span className="text-danger">*</span></Label>
                    <Input
                      type="text"
                      className="form-control"
                      id="example-number-input"
                      placeholder="Enter Your Stage Code"
                      maxLength="32"
                      value={stageCode}
                      // onChange={(e) => setStageCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 8))}
                      onChange={(e) => {
                        setStageCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 8));
                        if (componentCodeError) setComponentCodeError('');
                      }}
                    />
                    {componentCodeError && <p className="error-message" style={{ color: "red" }}>{componentCodeError}</p>}
                  </Col>
                </div>


                {/* CAMERA SELECTION SECTION */}
                {cameraData.length > 0 ? (
                  <div className="row mb-4">
                    <Col sm={12}>
                      <Label className="fw-bold mb-3">Camera Selection <span className="text-danger">*</span></Label>

                      {/* Multi Camera Selection Dropdown */}
                      {/* <div className="mb-3">
                        <Label htmlFor="multiCameraSelect" className="form-label">
                          Select Multiple Cameras
                        </Label>
                        {console.log('cameraData', cameraData)}
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
                      </div> */}

                      <Select
                        id="multiCameraSelect"
                        isMulti={application_mode !== "Single"}   // <-- Multi only when mode = Multi
                        options={cameraData}
                        placeholder={application_mode === "Single" ? "Select One Camera" : "Select Cameras"}
                        value={multiCameraSelected}
                        onChange={(selected) => {
                          if (application_mode === "Single") {
                            // Keep only the selected camera
                            setMultiCameraSelected(selected ? [selected] : []);
                          } else {
                            // Multi mode
                            setMultiCameraSelected(selected || []);
                          }
                          setCameraSelectionError('');
                        }}
                        classNamePrefix="react-select"
                        className="react-select-container"
                      />


                      {/* Camera Selection Error */}
                      {cameraSelectionError && (
                        <div className="alert alert-danger py-2" role="alert">
                          <small>
                            <i className="bx bx-error-circle me-1"></i>
                            {cameraSelectionError}
                          </small>
                        </div>
                      )}

                      {multiCameraSelected.length > 0 && (
                        <div className="alert alert-info py-2" role="alert">
                          <small>
                            <strong>Camera Configuration: </strong>
                            {application_mode === "Single"
                              ? `Single camera mode - 1 camera selected`
                              : `Multi-camera mode with ${multiCameraSelected.length} cameras`}
                          </small>
                        </div>
                      )}
                    </Col>
                  </div>
                ) : (
                  <div className="alert alert-warning py-2 mt-2" role="alert">
                    <small>
                      <i className="bx bx-info-circle me-1"></i>
                      Please configure cameras
                    </small>
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
                                      // videoConstraints={selectedCamera ? { deviceId: selectedCamera } : {}}
                                      videoConstraints={{}}
                                      style={{ width: '100%', height: '100%', display: 'block' }}
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
                      {/* <Label className="fw-bold mb-3">Camera Selection</Label> */}

                      {/* <div className="d-flex gap-4 mb-3">
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
                      </div> */}

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
                            isMulti={application_mode !== "Single"}
                            options={cameraData}
                            placeholder={application_mode === "Single" ? "Select One Camera" : "Select Cameras"}
                            value={multiCameraSelected}
                            onChange={(selected) => {
                              if (application_mode === "Single") {
                                // Keep only the selected camera
                                setMultiCameraSelected(selected ? [selected] : []);
                              } else {
                                // Multi mode
                                setMultiCameraSelected(selected || []);
                              }
                              setCameraSelectionError('');
                            }}
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
                              {application_mode === "Single"
                                ? `Single camera mode - 1 camera selected`
                                : `Multi-camera mode with ${multiCameraSelected.length} cameras`}
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

                    <div className="modal-footer">
                      {/* <Button color="secondary" onClick={() => setEditStageModal(false)}>Cancel</Button> */}
                      <Button
                        color="primary"
                        onClick={submitEditStage}
                      >
                        {"Update Stage"}
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
                    <th>Stage name</th>
                    <th>Stage code</th>
                    <th>Model Name</th>
                    <th>Model version</th>
                  </tr>
                </thead>
                {
                  console.log('ver_log', ver_log)
                }
                <tbody>
                  {ver_log.map((data, index) => (
                    <tr key={index}>
                      <td>{data.stage_name}</td>
                      <td>{data.stage_code}</td>
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

