import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import {
  Container,
  CardTitle,
  Button,
  Col,
  Row,
  Form,
  Label,
  Input,
  Table,
  Card,
  CardBody,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  InputGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Spinner
} from 'reactstrap';
import { InputNumber } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import CountdownTimer from 'react-component-countdown-timer';
import Webcam from 'react-webcam';
import { Radio } from 'antd';
import Swal from 'sweetalert2';
import PropTypes from 'prop-types';
import { sample, set } from 'lodash';
import './Css/style.css';
import './Css/profileTest.css';
import Select from 'react-select';
import { rectangle } from 'leaflet';
import { DEFAULT_RESOLUTION } from './cameraConfig';
import WebcamCapture from 'pages/WebcamCustom/WebcamCapture';
import urlSocket from './urlSocket';
import { image_url } from './imageUrl';
let ImageUrl = image_url;

const StageProfileRatioHandlerInsp = props => {
  const { history } = props;

  const location = useLocation();
  const galleryData = location.state?.galleryData || [];

  console.log('Received Gallery Data:', galleryData);

  useEffect(() => {
    if (!galleryData) return;
    const grouped = groupImagesByCamera(galleryData);
    setGroupedGallery(grouped);
  }, [galleryData]);

  const [groupedGallery, setGroupedGallery] = useState({});
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const cameraOrder = Object.keys(groupedGallery);

  // All state variables using useState
  const [sample_count, setSampleCount] = useState(10);
  const [get_samp_count, setGetSampCount] = useState(true);
  const [inspection_type, setInspectionType] = useState('Manual');
  const [timerValue, setTimerValue] = useState(10);
  const [placeobj_count, setPlaceobjCount] = useState(0);
  const [obj_count, setObjCount] = useState(0);
  const [set_values, setSetValues] = useState(false);
  const [showresult, setShowresult] = useState(false);
  const [result_key, setResultKey] = useState(false);
  const [ok_count, setOkCount] = useState(0);
  const [ng_count, setNgCount] = useState(0);
  const [t_count, setTCount] = useState(0);
  const [qrbar_found, setQrbarFound] = useState(0);
  const [qrbar_result, setQrbarResult] = useState(0);
  const [comp_found, setCompFound] = useState(0);
  const [comp_result, setCompResult] = useState(0);
  const [show_outline, setShowOutline] = useState(false);
  const [outline_options] = useState([
    { label: 'White Outline' },
    { label: 'Red Outline' },
    { label: 'Green Outline' },
    { label: 'Blue Outline' },
    { label: 'Black Outline' },
    { label: 'Orange Outline' },
    { label: 'Yellow Outline' }
  ]);
  const [default_outline, setDefaultOutline] = useState('White Outline');
  const [outline_colors] = useState([
    'White Outline',
    'Red Outline',
    'Green Outline',
    'Blue Outline',
    'Black Outline',
    'Orange Outline',
    'Yellow Outline'
  ]);
  const [outline_path, setOutlinePath] = useState('');
  console.log('outline_path', outline_path);
  const [region_selection, setRegionSelection] = useState(false);
  const [rectangles, setRectangles] = useState([]);
  const [output_Rect, setOutputRect] = useState(false);
  const [res_img, setResImg] = useState(null);
  const [selectedRectangleIndex, setSelectedRectangleIndex] = useState(null);
  const [editingRectangleIndex, setEditingRectangleIndex] = useState(null);
  const [selecting, setSelecting] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [clearCanvasFlag, setClearCanvasFlag] = useState(false);
  const [zoom_value, setZoomValue] = useState({
    zoom: 1,
    center: { x: 0.5, y: 0.5 }
  });
  const [modal2Open, setModal2Open] = useState(false);
  const [choosen_prof, setChoosenProf] = useState(null);
  const [ref_img_path, setRefImgPath] = useState(null);
  const [config, setConfig] = useState(null);
  const [page_info, setPageInfo] = useState(null);
  const [component_data, setComponentData] = useState(null);
  const [show_ratio, setShowRatio] = useState(false);
  const [ratio_data, setRatioData] = useState(null);
  const [res_message, setResMessage] = useState('');
  const [showstatus, setShowstatus] = useState(false);
  const [response_message, setResponseMessage] = useState('');
  const [response_value, setResponseValue] = useState('');
  const [show_start, setShowStart] = useState(false);
  const [qrbar_show_start, setQrbarShowStart] = useState(false);
  const [qrbar, setQrbar] = useState(false);
  const [outline_checkbox, setOutlineCheckbox] = useState(false);
  const [comp_info, setCompInfo] = useState(null);
  const [capture_fixed_refimage, setCaptureFixedRefimage] = useState(false);
  const [cameraDisconnected, setCameraDisconnected] = useState(false);
  const [showplaceobject, setShowplaceobject] = useState(false);
  const [show_next, setShowNext] = useState(false);
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState(false);
  const [station_name, setStationName] = useState('');
  const [station_id, setStationId] = useState('');
  const [gotoPage, setGotoPage] = useState(null);
  const [trainingStatusInterval, setTrainingStatusInterval] = useState(null);
  const [showdata, setShowdata] = useState(false);
  const [resume, setResume] = useState(false);
  const [qr_checking, setQrChecking] = useState(false);
  const [qruniq_checking, setQruniqChecking] = useState(false);
  const [barcode_data, setBarcodeData] = useState(null);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [qrbar_countdown_active, setQrbarCountdownActive] = useState(false);
  const [qrbar_start_btn, setQrbarStartBtn] = useState(false);
  const [movingRectangleIndex, setMovingRectangleIndex] = useState(null);
  const [newAvailableCameras, setNewAvailableCameras] = useState([]);
  const [pysclCameraList, setPysclCameraList] = useState([]);
  const [cameraList, setCameraList] = useState([]);
  const [stageName, setStageName] = useState('');
  const [batch_id, setBatchId] = useState('');
  const [rectanglesByCamera, setRectanglesByCamera] = useState({});
  // Format: { "position1": [...rectangles], "position2": [...rectangles] }

  console.log('cameraList', cameraList);
  // Refs
  // const canvasRef = useRef(null);

  const canvasRef = useRef({});
  const canvasRef2 = useRef({});

  const videoRef = useRef(null);
  const trashButtonsRef = useRef([]);
  const animationRef = useRef(null);
  // const webcamRef = useRef(null);
  const webcamRef = useRef([]);

  // componentDidMount useEffect
  useEffect(() => {
    fetchData();
    return () => {
      // Cleanup for unmount
      if (trainingStatusInterval) {
        clearInterval(trainingStatusInterval);
      }
      navigator.mediaDevices.removeEventListener('devicechange', checkWebcam);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  useEffect(() => {
    console.log('rectanglesByCamera', rectanglesByCamera);

    if (!canvasRef.current) {
      return;
    }

    if (Object.keys(rectanglesByCamera).length > 0) {
      Object.entries(rectanglesByCamera).forEach(
        ([cameraLabel, rectangles]) => {
          const canvasEl = canvasRef.current[cameraLabel];

          if (!canvasEl || typeof canvasEl.getContext !== 'function') {
            console.warn(`Canvas not found for camera: ${cameraLabel}`);
            return;
          }

          const ctx = canvasEl.getContext('2d');
          if (!ctx) {
            console.error(`Failed to get context for camera: ${cameraLabel}`);
            return;
          }

          // Clear canvas first
          ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

          // Draw rectangles if res_img is true
          if (res_img && rectangles && rectangles.length > 0) {
            rectangles.forEach((rect, index) => {
              // Draw rectangle border
              ctx.lineWidth = 2;
              ctx.strokeStyle = rect.colour;
              ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

              // Draw region name (top-left)
              const textPosX = rect.x + 10;
              const textPosY = rect.y + 15;

              ctx.font = 'bold 14px Arial';
              ctx.lineWidth = 3;

              // Text outline
              ctx.strokeStyle = 'black';
              ctx.strokeText(rect.name, textPosX, textPosY);

              // Text fill
              ctx.fillStyle = 'white';
              ctx.fillText(rect.name, textPosX, textPosY);

              // Draw result and value (bottom-left)
              const resultText = `${rect.result} (${rect.value})`;
              const resultPosY = rect.y + rect.height - 10;

              ctx.strokeStyle = 'black';
              ctx.strokeText(resultText, textPosX, resultPosY);

              ctx.fillStyle = rect.colour;
              ctx.fillText(resultText, textPosX, resultPosY);
            });
          }
        }
      );
    } else {
      // Clear all canvases if no rectangles
      Object.values(canvasRef.current).forEach(canvasEl => {
        if (canvasEl && typeof canvasEl.getContext === 'function') {
          const ctx = canvasEl.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
          }
        }
      });
    }
  }, [res_img, rectanglesByCamera]); // Correct dependencies

  // const getReferenceImageForCamera = useCallback((cameraLabel, modelVer, refImage) => {
  //     console.log('cameraLabel, modelVer', cameraLabel, modelVer, refImage)
  //     if (!refImage || !Array.isArray(refImage)) return "";

  //     // // normalize label for consistent comparison
  //     const normalizedLabel = cameraLabel.trim().toLowerCase().replace(/\s+/g, "_");

  //     // // find the model entry that matches both camera label and version
  //     const cameraEntry = refImage.find(item =>
  //         item?.position?.trim().toLowerCase().replace(/\s+/g, "_") === normalizedLabel &&
  //         item?.model_ver === modelVer
  //     );
  //     console.log('cameraEntry', cameraEntry)

  //     if (!cameraEntry) {
  //         console.log(`No model data found for ${cameraLabel} with model_ver ${modelVer}`);
  //         return "";
  //     }

  //     // // within that camera’s datasets, get the first OK image
  //     const Image = cameraEntry.datasets?.find(d => d.type === "OK");

  //     if (!Image) {
  //         console.log(`No OK dataset found for ${cameraLabel} with model_ver ${modelVer}`);
  //         return "";
  //     }

  //     // construct full path using showImage()
  //     return showImage(Image.image_path);
  // }, []);

  // const getReferenceImageForCamera = useCallback((cameraLabel, modelVer, refImage) => {
  //     console.log('cameraLabel, modelVer', cameraLabel, modelVer, refImage);

  //     if (!refImage || !Array.isArray(refImage)) return "";

  //     // Normalize label for consistent comparison
  //     const normalizedLabel = cameraLabel?.trim().toLowerCase().replace(/\s+/g, "_");

  //     // Filter all matching entries
  //     const matchingEntries = refImage.filter(item =>
  //         item?.position?.trim().toLowerCase().replace(/\s+/g, "_") === normalizedLabel &&
  //         item?.model_ver === modelVer
  //     );

  //     console.log('matchingEntries', matchingEntries);

  //     if (matchingEntries.length === 0) {
  //         console.log(`No image found for ${cameraLabel} with model_ver ${modelVer}`);
  //         return "";
  //     }

  //     // Return the first matching entry (since they're duplicates)
  //     const cameraEntry = matchingEntries[0];
  //     console.log('cameraEntry (first match)', cameraEntry);

  //     return cameraEntry.image_path;
  // }, []);
  const getReferenceImageForCamera = useCallback(
    (cameraLabel, modelVer, refImage) => {
      console.log('cameraLabel, modelVer', cameraLabel, modelVer, refImage);

      if (!refImage || !Array.isArray(refImage)) return '';

      // Normalize label for consistent comparison
      const normalizedLabel = cameraLabel
        ?.trim()
        .toLowerCase()
        .replace(/\s+/g, '_');

      // Filter all matching entries
      const matchingEntries = refImage.filter(
        item =>
          item?.position?.trim().toLowerCase().replace(/\s+/g, '_') ===
            normalizedLabel && item?.model_ver === modelVer
      );

      console.log('matchingEntries', matchingEntries);

      if (matchingEntries.length === 0) {
        console.log(
          `No image found for ${cameraLabel} with model_ver ${modelVer}`
        );
        return '';
      }

      // Return the first matching entry (since they're duplicates)
      const cameraEntry = matchingEntries[0];
      console.log('cameraEntry (first match)', cameraEntry);

      return showImage(cameraEntry.image_path);
    },
    []
  );

  const getCurrentOutlinePath = cameraOriginalLabel => {
    console.log('outline_pathoutline_pathoutline_path', outline_path);
    if (!outline_path) {
      return null;
    }

    // For single camera mode, outline_path is a string
    if (typeof outline_path === 'string') {
      return outline_path;
    }

    // For multi-camera mode, outline_path is an object with camera keys
    if (typeof outline_path === 'object' && cameraOriginalLabel) {
      const selectedCamera = cameraList.find(
        cam => cam.originalLabel === cameraOriginalLabel
      );
      console.log('Selected camera for outline:', selectedCamera);

      if (selectedCamera) {
        const possibleKeys = [
          selectedCamera.label.trim().toLowerCase().replace(/\s+/g, '_'),
          selectedCamera.label
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/#/g, '_'),
          selectedCamera.originalLabel
            ?.trim()
            .toLowerCase()
            .replace(/\s+/g, '_'),
          selectedCamera.originalLabel
            ?.trim()
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/#/g, '_')
        ];

        for (const key of possibleKeys) {
          if (outline_path[key]) {
            if (typeof outline_path[key] === 'object') {
              // Map outline color to path property
              if (default_outline === 'White Outline') {
                return outline_path[key].white_path;
              } else if (default_outline === 'Red Outline') {
                return outline_path[key].red_path;
              } else if (default_outline === 'Green Outline') {
                return outline_path[key].green_path;
              } else if (default_outline === 'Blue Outline') {
                return outline_path[key].blue_path;
              } else if (default_outline === 'Black Outline') {
                return outline_path[key].black_path;
              } else if (default_outline === 'Orange Outline') {
                return outline_path[key].orange_path;
              } else if (default_outline === 'Yellow Outline') {
                return outline_path[key].yellow_path;
              } else {
                return outline_path[key].white_path;
              }
            } else {
              return outline_path[key];
            }
          }
        }
      }
    }

    return null;
  };

  // Handlers
  const toggleModal2 = () => {
    setModal2Open(prev => !prev);
  };

  const handleSampleCountChange = value => {
    setSampleCount(value);
  };

  const handleManualAuto = e => {
    setInspectionType(e.target.value);
  };

  const handleTimerChange = value => {
    setTimerValue(value);
  };

  const showOutline = () => {
    setShowOutline(prev => !prev);
  };

  const newOutlineChange = ot_label => {
    setDefaultOutline(ot_label);
    const { comp_info: compInfo } = { comp_info };
    console.log('compInfo', compInfo); // Destructure from state if needed
    // if (ot_label === 'White Outline') {
    //     setOutlinePath(compInfo.datasets[0].white_path);
    // } else if (ot_label === 'Red Outline') {
    //     setOutlinePath(compInfo.datasets[0].red_path);
    // } else if (ot_label === 'Green Outline') {
    //     setOutlinePath(compInfo.datasets[0].green_path);
    // } else if (ot_label === 'Blue Outline') {
    //     setOutlinePath(compInfo.datasets[0].blue_path);
    // } else if (ot_label === 'Black Outline') {
    //     setOutlinePath(compInfo.datasets[0].black_path);
    // } else if (ot_label === 'Orange Outline') {
    //     setOutlinePath(compInfo.datasets[0].orange_path);
    // } else if (ot_label === 'Yellow Outline') {
    //     setOutlinePath(compInfo.datasets[0].yellow_path);
    // }
  };

  // Fetch data function
  // const fetchData = async () => {
  //   const db_info = JSON.parse(localStorage.getItem('db_info'));
  //   ImageUrl = `${image_url}${db_info?.db_name}/`;
  //   const zoom_values = JSON.parse(sessionStorage.getItem('zoom_values'));
  //   if (zoom_values) {
  //     setZoomValue(zoom_values);
  //   }
  //   let sessionData = JSON.parse(sessionStorage.getItem('computeProfData'));
  //   console.log('sessionData', sessionData);
  //   let choosenProf = sessionData.current_profile;
  //   console.log('choosenProf', choosenProf);
  //   setBatchId(choosenProf.batch_id || '');
  //   let component_data_ = sessionData.current_comp_info;
  //   let res_data = await getRefImage(choosenProf);

  //   setRegionSelection(choosenProf.region_selection);
  //   setPageInfo(choosenProf.page_info);
  //   let initialData = {
  //     choosen_prof: choosenProf,
  //     // ref_img_path: res_data.path,
  //     config: res_data.config_data,
  //     page_info: choosenProf.page_info,
  //     component_data: component_data_
  //   };
  //   const getstagename = choosenProf?.stage_profiles || {};
  //   console.log('getstagename', getstagename);
  //   // const stageName = Object.keys(getstagename)?.[0] || '';
  //   // console.log('stageName', stageName)
  //   // setStageName(stageName);
  //   const stageNames = Object.keys(getstagename) || [];
  //   console.log('stageNames', stageNames);
  //   setStageName(stageNames);

  //   // const stageProfiles = choosenProf?.stage_profiles?.[stageName] || {};
  //   // console.log('stageProfiles', stageProfiles)

  //   // const cameras = Object.keys(stageProfiles).map(label => {
  //   //     const cam = stageProfiles[label] || {};
  //   //     const firstModel = Array.isArray(cam.ng_model_data) ? cam.ng_model_data[0] : cam.ok_model_data[0];
  //   //     console.log('camcam', cam)

  //   //     return {
  //   //         label: cam.label || label,
  //   //         model_ver: firstModel.model_ver,
  //   //         originalLabel: cam.originalLabel || '',
  //   //         p_id: cam.p_id || '',
  //   //         port: cam.port || '',
  //   //         v_id: cam.v_id || '',
  //   //         value: cam.value || ''
  //   //     };
  //   // });

  //   // console.log('cameraList', cameras);
  //   // setCameraList(cameras);

  //   const allCameras = Object.entries(getstagename).flatMap(
  //     ([stageName, stageProfiles]) => {
  //       return Object.keys(stageProfiles).map(label => {
  //         const cam = stageProfiles[label] || {};
  //         console.log('cam483', cam);
  //         const firstModel = Array.isArray(cam.ng_model_data)
  //           ? cam.ng_model_data[0]
  //           : cam.ok_model_data?.[0];
  //         return {
  //           stageName,
  //           label: cam.label || label,
  //           model_ver: firstModel?.model_ver || '',
  //           originalLabel: cam.originalLabel || '',
  //           p_id: cam.p_id || '',
  //           port: cam.port || '',
  //           v_id: cam.v_id || '',
  //           value: cam.value || '',
  //           stage_id: cam._id || '',
  //           stage_code: cam.stage_code || ''
  //         };
  //       });
  //     }
  //   );

  //   console.log('allCameras', allCameras);
  //   setCameraList(allCameras);

  //   let count_value = await getCountBeforeRefresh(choosenProf);
  //   showRefOutline(choosenProf);
  //   // if (count_value !== '') {
  //   //     initialData.ok_count = count_value[0].ok;
  //   //     initialData.ng_count = count_value[0].notok;
  //   //     initialData.t_count = count_value[0].total;
  //   //     initialData.obj_count = count_value[0].total;
  //   // }
  //   setChoosenProf(initialData.choosen_prof);
  //   // // setRefImgPath(initialData.ref_img_path);
  //   // setConfig(initialData.config);
  //   // setPageInfo(initialData.page_info);
  //   // setComponentData(initialData.component_data);
  //   // setOkCount(initialData.ok_count || 0);
  //   // setNgCount(initialData.ng_count || 0);
  //   // setTCount(initialData.t_count || 0);
  //   // setObjCount(initialData.obj_count || 0);
  //   console.log(
  //     'data91 ',
  //     choosenProf,
  //     choosenProf?.qrbar_check,
  //     choosenProf?.qrbar_value
  //   );
  //   if (choosenProf?.qrbar_check === true) {
  //     setQrbarShowStart(true);
  //     setQrbar(true);
  //   } else {
  //     setShowStart(true);
  //   }
  //   // Add device change listener
  //   navigator.mediaDevices.addEventListener('devicechange', checkWebcam);
  //   // Initial check
  //   checkWebcam();
  //   window.addEventListener('beforeunload', handleBeforeUnload);
  //   window.addEventListener('popstate', handlePopState);
  //   window.history.pushState(null, null, window.location.pathname); // Reset the history state
  // };

  const fetchData = async () => {
    const db_info = JSON.parse(localStorage.getItem('db_info'));
    ImageUrl = `${image_url}${db_info?.db_name}/`;

    // --- Get zoom values ---
    const zoom_values = JSON.parse(sessionStorage.getItem('zoom_values'));
    if (zoom_values) setZoomValue(zoom_values);

    // --- Get items from sessionStorage set in AcceptanceRatioGallery ---
    const currentCompInfo = JSON.parse(
      sessionStorage.getItem('current_comp_info')
    );
    const currentProfile = JSON.parse(
      sessionStorage.getItem('current_profile')
    );

    if (!currentCompInfo || !currentProfile) {
      console.error(
        'No current_comp_info or current_profile in sessionStorage'
      );
      return;
    }

    console.log('currentCompInfo', currentCompInfo);
    console.log('currentProfile', currentProfile);

    setBatchId(currentProfile.batch_id || '');
    setRegionSelection(currentProfile.region_selection);
    setPageInfo(currentProfile.page_info);

    const res_data = await getRefImage(currentProfile);

    const initialData = {
      choosen_prof: currentProfile,
      config: res_data.config_data,
      page_info: currentProfile.page_info,
      component_data: currentCompInfo
    };

    const stageProfilesObj = currentProfile?.stage_profiles || {};
    const stageNames = Object.keys(stageProfilesObj);
    console.log('stageNames', stageNames);
    setStageName(stageNames);

    // Flatten all cameras across all stage profiles
    const allCameras = Object.entries(stageProfilesObj).flatMap(
      ([stageName, stageProfiles]) =>
        Object.keys(stageProfiles).map(label => {
          const cam = stageProfiles[label] || {};
          const firstModel = Array.isArray(cam.ng_model_data)
            ? cam.ng_model_data[0]
            : cam.ok_model_data?.[0];

          return {
            stageName,
            label: cam.label || label,
            model_ver: firstModel?.model_ver || '',
            originalLabel: cam.originalLabel || '',
            p_id: cam.p_id || '',
            port: cam.port || '',
            v_id: cam.v_id || '',
            value: cam.value || '',
            stage_id: cam._id || '',
            stage_code: cam.stage_code || ''
          };
        })
    );

    console.log('allCameras', allCameras);
    setCameraList(allCameras);

    let count_value = await getCountBeforeRefresh(currentProfile);
    showRefOutline(currentProfile);

    setChoosenProf(initialData.choosen_prof);

    console.log(
      'data91 ',
      currentProfile,
      currentProfile?.qrbar_check,
      currentProfile?.qrbar_value
    );

    if (currentProfile?.qrbar_check === true) {
      setQrbarShowStart(true);
      setQrbar(true);
    } else {
      setShowStart(true);
    }

    // Add device change listener
    navigator.mediaDevices.addEventListener('devicechange', checkWebcam);
    checkWebcam();

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.history.pushState(null, null, window.location.pathname); // Reset the history state
  };

  // getRefImage function
  const getRefImage = async choosenProf => {
    console.log('62choosen_prof : ', choosenProf);
    try {
      const response = await urlSocket.post(
        '/api/stage/getProfRefImage_stg',
        {
          prof_data: choosenProf
        },
        { mode: 'no-cors' }
      );
      const data = response.data;
      setRefImgPath(data.ref_images);
      setConfig(data.config_data);
      console.log('data : ', data);
      return data;
    } catch (error) {
      console.log('error : ', error);
      return error;
    }
  };

  // getCountBeforeRefresh function
  const getCountBeforeRefresh = async prof_value => {
    console.log('prof_value.batch_id', prof_value.batch_id);
    try {
      const availCount = await urlSocket.post(
        '/api/stage/refresh_profile_test_stg',
        { batch_id: prof_value.batch_id },
        { mode: 'no-cors' }
      );
      console.log('111availCount :', availCount.data, availCount.data.length);
      if (availCount.data.length > 0) {
        return availCount.data;
      } else {
        return '';
      }
    } catch (error) {
      console.log(error);
      return '';
    }
  };

  // showRefOutline function
  const showRefOutline = async ver_data => {
    console.log('data153 ', ver_data);
    try {
      const response = await urlSocket.post(
        '/api/stage/profilecheck_outline_stg',
        {
          comp_id: ver_data.comp_id,
          position: ver_data.position,
          ver_data: ver_data
        },
        { mode: 'no-cors' }
      );
      let getInfo = response.data;
      console.log('data131 ', getInfo);
      if (getInfo.show == 'yes') {
        console.log('data131', getInfo.comp_info[0].datasets);
        setShowOutline(true);
        setOutlineCheckbox(true);
        setCompInfo(getInfo.comp_info[0]);
        setOutlinePath(getInfo.comp_info[0].datasets);
      } else if (getInfo.show == 'no') {
        setCaptureFixedRefimage(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // getImage function
  const getImage = image_path => {
    let result = image_path.replaceAll('\\', '/');
    let output = ImageUrl + result;
    return output;
  };

  // showImage function
  //   const showImage = output_img => {
  //     let imgurl = ImageUrl;
  //     const parts = output_img.split('/');
  //     const newPath = parts.slice(1).join('/');
  //     let startIndex;
  //     if (newPath.includes('Datasets/')) {
  //       startIndex = newPath.indexOf('Datasets/');
  //     } else {
  //       startIndex = newPath.indexOf('receive/');
  //     }
  //     const relativePath = newPath.substring(startIndex);
  //     console.log('output_img : ', imgurl + relativePath);
  //     return `${imgurl + relativePath}`;
  //   };

  // const showImage = output_img => {
  //   let imgurl = ImageUrl;

  //   const parts = output_img.split('/');
  //   const newPath = parts.slice(1).join('/');

  //   let startIndex = -1;

  //   if (newPath.includes('Datasets/')) {
  //     startIndex = newPath.indexOf('Datasets/');
  //   } else if (newPath.includes('receive/')) {
  //     startIndex = newPath.indexOf('receive/');
  //   } else if (newPath.includes('ProfileCreation/')) {
  //     startIndex = newPath.indexOf('ProfileCreation/');
  //   } else {
  //     console.warn('⚠️ Unexpected image path:', output_img);
  //     return null;
  //   }

  //   const relativePath = newPath.substring(startIndex);
  //   console.log('relativePath', relativePath);
  //   return `${imgurl}${relativePath}`;
  // };

  const showImage = output_img => {
    let imgurl = ImageUrl;

    if (!output_img) return null;

    // Keep the full path but remove only the initial "Vs_inspection/" if needed
    const newPath = output_img.startsWith('Vs_inspection/')
      ? output_img // do not slice parts, keep full path for your logic
      : output_img;

    let startIndex = -1;

    if (newPath.includes('Datasets/')) {
      startIndex = newPath.indexOf('Datasets/');
    } else if (newPath.includes('receive/')) {
      startIndex = newPath.indexOf('receive/');
    } else if (newPath.includes('ProfileCreation/')) {
      startIndex = newPath.indexOf('ProfileCreation/');
    } else {
      console.warn('⚠️ Unexpected image path:', output_img);
      return null;
    }

    const relativePath = newPath.substring(startIndex);
    console.log('relativePath', relativePath);

    return `${imgurl}${relativePath}?t=${Date.now()}`; // cache-busting
  };

  // objectDetectionOnly function
  // const objectDetectionOnly = async () => {
  //     console.log("first6619")
  //     const {
  //         choosen_prof: choosenProf, config: config_, obj_count: objCount, sample_count: sampleCount,
  //         ok_count: okCount, ng_count: ngCount, t_count: tCount
  //     } = { choosen_prof, config, obj_count, sample_count, ok_count, ng_count, t_count };
  //     setResImg(false);
  //     setRectangles([]);
  //     setOutputRect(false);
  //     console.log('data448 ', choosenProf.region_selection, region_selection);
  //     if (sampleCount === null || sampleCount === undefined) {
  //         Swal.fire({
  //             icon: 'info',
  //             title: 'No. of Test Samples Required',
  //             confirmButtonText: 'OK',
  //         });
  //     } else if (sampleCount <= 0) {
  //         Swal.fire({
  //             icon: 'info',
  //             title: 'The number of test samples must be greater than zero.',
  //             confirmButtonText: 'OK',
  //         });
  //     } else {
  //         const imageSrc = await webcamRef.current.captureZoomedImage();
  //         setResImg(imageSrc);
  //         if (!imageSrc) {
  //             console.log('webcam is not properly connected.');
  //             return;
  //         }
  //         setPlaceobjCount(prev => prev + 1);
  //         placeobj_count += 1; // to hide the Result at the starting
  //         setShow(false);
  //         setMsg(false);
  //         setShowNext(false);
  //         setShowplaceobject(false);
  //         setShowresult(false);
  //         setShowstatus(false);
  //         setSetValues(true);
  //         setShowStart(false);
  //         const blob = await fetch(imageSrc).then((res) => res.blob());
  //         const formData = new FormData();
  //         console.log('100data ', choosenProf, config);
  //         let component_code = choosenProf.comp_code;
  //         let component_name = choosenProf.comp_name;
  //         let today = new Date();
  //         let yyyy = today.getFullYear();
  //         let mm = today.getMonth() + 1;
  //         let dd = today.getDate();
  //         let _today = dd + '/' + mm + '/' + yyyy;
  //         let test_date = yyyy + '-' + mm + '-' + dd;
  //         let hours = today.getHours();
  //         let min = today.getMinutes();
  //         let secc = today.getSeconds();
  //         let time = hours + ':' + min + ':' + secc;
  //         let milliseconds = hours + ':' + min + ':' + secc + '.' + today.getMilliseconds().toString().padStart(3, '0').slice(0, 5);
  //         console.log('time', time);
  //         let replace = _today + '_' + time.replaceAll(":", "_");
  //         let compdata = component_name + "_" + component_code + '_' + replace;
  //         formData.append('comp_name', choosenProf.comp_name);
  //         formData.append('comp_code', choosenProf.comp_code);
  //         formData.append('comp_id', choosenProf.comp_id);
  //         formData.append('obj_detect', choosenProf.detect_selection);
  //         formData.append('detect_type', config_.detection_type);
  //         formData.append('positive', config_.positive);
  //         formData.append('negative', config_.negative);
  //         formData.append('posble_match', config_.posble_match);
  //         formData.append('datasets', blob, compdata + '.png');
  //         formData.append('station_name', station_name);
  //         formData.append('station_id', station_id);
  //         formData.append('inspected_ondate', test_date);
  //         formData.append('date', _today);
  //         formData.append('time', time);
  //         formData.append('milliseconds', milliseconds);
  //         formData.append('batch_id', choosenProf.batch_id);
  //         formData.append('prof_data', JSON.stringify(choosenProf));
  //         formData.append('our_rectangles', JSON.stringify(component_data.rectangles));
  //         formData.append('qrbar_result', qrbar_result);
  //         try {
  //             const response = await urlSocket.post('/obj_detection_profile',
  //                 formData, {
  //                 headers: {
  //                     'content-type': 'multipart/form-data'
  //                 },
  //                 mode: 'no-cors'
  //             });
  //             console.log('154response.data : ', response.data);
  //             let obj_result = response.data[0].detection_result;
  //             setResMessage(response.data[0].detection_result);
  //             setShowstatus(true);
  //             setCompFound(response.data[0].detection_result === "Object Detected" ? 2 : 1);
  //             // show obj detection for 1 sec
  //             await new Promise(resolve => setTimeout(resolve, 1500));
  //             let updated_rectangles = [];
  //             if (response.data[0]?.updated_rectangles) {
  //                 updated_rectangles = response.data[0].updated_rectangles;
  //             }
  //             setTimeout(() => {
  //                 if ((choosenProf.detect_selection == true && obj_result == "Object Detected") ||
  //                     (choosenProf.detect_selection == false && obj_result == "")) {
  //                     let show_ratio_ = false;
  //                     let ratio_data_ = null;
  //                     let Checking = "Checking ...";
  //                     setResMessage(Checking);
  //                     setShowstatus(true);
  //                     // after object detection
  //                     urlSocket.post('/overall_result_profile',
  //                         {
  //                             'comp_id': choosenProf.comp_id,
  //                             'comp_name': choosenProf.comp_name,
  //                             "comp_code": choosenProf.comp_code,
  //                             "batch_id": choosenProf.batch_id,
  //                             "captured_image": response.data[0].captured_image,
  //                             "insp_result_id": response.data[0].insp_result_id,
  //                             "start_time_with_milliseconds": response.data[0].start_time_with_milliseconds,
  //                             "positive": config_.positive,
  //                             "negative": config_.negative,
  //                             "posble_match": config_.posble_match,
  //                             "choosen_prof": JSON.stringify(choosenProf),
  //                             "region_selection": region_selection,
  //                             "updated_rectangles": updated_rectangles,
  //                         },
  //                         { mode: 'no-cors' })
  //                         .then(async (detection) => {
  //                             setShowstatus(false);
  //                             setCompFound(2);
  //                             if (choosenProf?.qrbar_check === true) {
  //                                 setQrbarShowStart(true);
  //                             } else {
  //                                 setShowStart(true);
  //                             }
  //                             let testing_result = detection.data[0].status;
  //                             console.log('data576 ', detection);
  //                             if (region_selection) {
  //                                 const originalWidth = 640;
  //                                 const originalHeight = 480;
  //                                 const targetWidth = DEFAULT_RESOLUTION.width;
  //                                 const targetHeight = DEFAULT_RESOLUTION.height;
  //                                 // Calculate scaling factors
  //                                 const scaleX = targetWidth / originalWidth;
  //                                 const scaleY = targetHeight / originalHeight;
  //                                 const retrievedRectangles = detection.data[0].region_results.map((rect) => ({
  //                                     x: rect.rectangles.coordinates.x / scaleX,
  //                                     y: rect.rectangles.coordinates.y / scaleY,
  //                                     height: rect.rectangles.coordinates.height / scaleY,
  //                                     width: rect.rectangles.coordinates.width / scaleX,
  //                                     id: rect.rectangles.id,
  //                                     name: rect.rectangles.name,
  //                                     colour: rect.result === 'OK' ? 'green' : 'red'
  //                                 }));
  //                                 setRectangles(retrievedRectangles);
  //                                 setOutputRect(true);
  //                             }
  //                             if (sampleCount === null || sampleCount === undefined || objCount + 1 >= sampleCount) {
  //                                 show_ratio_ = true;
  //                                 const test_opt_response = await urlSocket.post('/test_opt', {
  //                                     'batch_id': choosenProf.batch_id,
  //                                     'profile_id': choosenProf._id
  //                                 }, { mode: 'no-cors' });
  //                                 ratio_data_ = test_opt_response.data;
  //                                 console.log('180response', test_opt_response);
  //                             }
  //                             if (testing_result === 'OK') {
  //                                 let updated_ok = okCount + 1;
  //                                 let updated_total = updated_ok + ngCount;
  //                                 setResponseMessage(config_.positive);
  //                                 setResponseValue(detection.data[0].value);
  //                                 setShowresult(true);
  //                                 setResultKey(true);
  //                                 setObjCount(objCount + 1);
  //                                 setShowRatio(show_ratio_);
  //                                 setRatioData(ratio_data_);
  //                                 setShowStart(choosenProf?.qrbar_check === true ? false : true);
  //                                 setQrbarShowStart(choosenProf?.qrbar_check === true ? true : false);
  //                                 setCompResult(2);
  //                                 setOkCount(updated_ok);
  //                                 setTCount(updated_total);
  //                             } else if (testing_result === 'NG') {
  //                                 let updated_ng = ngCount + 1;
  //                                 let updated_total = okCount + updated_ng;
  //                                 setResponseMessage(config_.negative);
  //                                 setResponseValue(detection.data[0].value);
  //                                 setShowresult(true);
  //                                 setResultKey(true);
  //                                 setObjCount(objCount + 1);
  //                                 setShowRatio(show_ratio_);
  //                                 setRatioData(ratio_data_);
  //                                 setShowStart(choosenProf?.qrbar_check === true ? false : true);
  //                                 setQrbarShowStart(choosenProf?.qrbar_check === true ? true : false);
  //                                 setCompResult(1);
  //                                 setNgCount(updated_ng);
  //                                 setTCount(updated_total);
  //                             }
  //                         });
  //                 } else {
  //                     setShowStart(choosenProf?.qrbar_check === true ? false : true);
  //                     setQrbarShowStart(choosenProf?.qrbar_check === true ? true : false);
  //                 }
  //             }, 500);
  //         } catch (error) {
  //             console.log('error : ', error);
  //         }
  //     }
  // };

  //working for live camera
  // const objectDetectionOnly = async () => {
  //   console.log('📸 Starting Multi-Camera Object Detection', config);

  //   const {
  //     choosen_prof: choosenProf,
  //     // config: config,
  //     obj_count: objCount,
  //     sample_count: sampleCount,
  //     ok_count: okCount,
  //     ng_count: ngCount,
  //     t_count: tCount
  //   } = { choosen_prof, obj_count, sample_count, ok_count, ng_count, t_count };

  //   setResImg(false);
  //   setRectangles([]);
  //   setOutputRect(false);
  //   setResMessage({});
  //   setRectanglesByCamera({});
  //   console.log('🔍 Region Selection:', choosen_prof);

  //   if (sampleCount === null || sampleCount === undefined) {
  //     Swal.fire({
  //       icon: 'info',
  //       title: 'No. of Test Samples Required',
  //       confirmButtonText: 'OK'
  //     });
  //     return;
  //   }

  //   if (sampleCount <= 0) {
  //     Swal.fire({
  //       icon: 'info',
  //       title: 'The number of test samples must be greater than zero.',
  //       confirmButtonText: 'OK'
  //     });
  //     return;
  //   }

  //   try {
  //     const capturedImages = [];

  //     for (const cam of cameraList) {
  //       console.log('cam', cam);
  //       const labelName = cam.label;
  //       const version = cam.model_ver;
  //       const stagename = cam.stageName;
  //       const stagecode = cam.stage_code;
  //       const stage_id = cam.stage_id;
  //       const originalLabel = cam.originalLabel;
  //       const webcamInstance = webcamRef.current?.[originalLabel];
  //       console.log('webcamInstance', webcamInstance);

  //       if (!webcamInstance || !webcamInstance.captureZoomedImage) {
  //         console.warn(`⚠️ Webcam not ready for ${labelName}`);
  //         continue;
  //       }

  //       const imageSrc = await webcamInstance.captureZoomedImage();
  //       if (!imageSrc) {
  //         console.warn(`⚠️ Failed to capture from ${labelName}`);
  //         continue;
  //       }

  //       const blob = await fetch(imageSrc).then(r => r.blob());
  //       capturedImages.push({
  //         label: labelName,
  //         version: version,
  //         stageName: stagename,
  //         stagecode: stagecode,
  //         stage_id: stage_id,
  //         blob,
  //         filename: `${labelName}_${Date.now()}.png`
  //       });
  //       console.log('capturedImages', capturedImages);
  //     }

  //     if (capturedImages.length === 0) {
  //       console.log('❌ No cameras captured images.');
  //       return;
  //     }

  //     setResImg(capturedImages[0].blob);
  //     // setPlaceobjCount((prev) => prev + 1);
  //     // placeobj_count += 1;

  //     setShow(false);
  //     setMsg(false);
  //     setShowNext(false);
  //     setShowplaceobject(false);
  //     setShowresult(false);
  //     setShowstatus(false);
  //     setSetValues(true);
  //     setShowStart(false);

  //     const formData = new FormData();
  //     const today = new Date();
  //     const yyyy = today.getFullYear();
  //     const mm = String(today.getMonth() + 1).padStart(2, '0');
  //     const dd = String(today.getDate()).padStart(2, '0');
  //     const _today = `${dd}/${mm}/${yyyy}`;
  //     const test_date = `${yyyy}-${mm}-${dd}`;
  //     const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
  //     const milliseconds = `${time}.${today
  //       .getMilliseconds()
  //       .toString()
  //       .padStart(3, '0')}`;

  //     formData.append('comp_name', choosenProf.comp_name);
  //     formData.append('comp_code', choosenProf.comp_code);
  //     formData.append('comp_id', choosenProf.comp_id);
  //     formData.append('obj_detect', choosenProf.detect_selection);
  //     formData.append('detect_type', config.detection_type);
  //     formData.append('positive', config.positive);
  //     formData.append('negative', config.negative);
  //     formData.append('posble_match', config.posble_match);
  //     // formData.append("station_name", station_name);
  //     // formData.append("station_id", station_id);
  //     formData.append('inspected_ondate', test_date);
  //     formData.append('date', _today);
  //     formData.append('time', time);
  //     formData.append('milliseconds', milliseconds);
  //     formData.append('batch_id', choosenProf.batch_id);
  //     formData.append('prof_data', JSON.stringify(choosenProf.stage_profiles));
  //     // formData.append("our_rectangles", JSON.stringify(component_data.rectangles));
  //     // formData.append("qrbar_result", qrbar_result);

  //     capturedImages.forEach((img, idx) => {
  //       formData.append(`datasets[${idx}]`, img.blob, img.filename);
  //       formData.append(`camera_labels[${idx}]`, img.label);
  //       formData.append(`model_versions[${idx}]`, img.version);
  //       formData.append(`stage_names[${idx}]`, img.stageName);
  //       formData.append(`stage_codes[${idx}]`, img.stagecode);
  //       formData.append(`stage_ids[${idx}]`, img.stage_id);
  //     });

  //     for (let [key, value] of formData.entries()) {
  //       if (value instanceof Blob) {
  //         console.log(
  //           `${key}: [Blob] filename=${value.name}, size=${value.size}`
  //         );
  //       } else {
  //         console.log(`${key}:`, value);
  //       }
  //     }

  //     // -----------------------
  //     const response = await urlSocket.post(
  //       '/api/stage/obj_detection_profile_multi',
  //       formData,
  //       {
  //         headers: { 'content-type': 'multipart/form-data' },
  //         mode: 'no-cors'
  //       }
  //     );

  //     console.log('🟢 obj_detection_profile Response:', response.data);
  //     const resultsByCamera = {};
  //     response.data.detection_result.forEach(item => {
  //       resultsByCamera[item.camera_label] = item.detection_result;
  //     });
  //     console.log('resultsByCamera', resultsByCamera);
  //     setResMessage(resultsByCamera);
  //     setShowstatus(true);
  //     setCompFound(resultsByCamera === 'Object Detected' ? 2 : 1);
  //     const capturedImagesData = response.data.captured_image || [];
  //     const detectionResults = response.data.detection_result || [];
  //     const updatedRectanglesList = response.data?.updated_rectangles || [];
  //     console.log('updatedRectanglesList', updatedRectanglesList);

  //     const hasNoObject = detectionResults.some(
  //       item => item.detection_result === 'No Object Detected'
  //     );
  //     const hasIncorrectObject = detectionResults.some(
  //       item => item.detection_result === 'Incorrect Object'
  //     );
  //     const hasObjectDetected = detectionResults.some(
  //       item => item.detection_result === 'Object Detected'
  //     );

  //     await new Promise(resolve => setTimeout(resolve, 1500));

  //     if (hasObjectDetected && !hasNoObject && !hasIncorrectObject) {
  //       setResMessage('Checking ...');
  //       setShowstatus(true);
  //       let ratio_data_;
  //       let show_ratio = false;
  //       console.log('choosenProf', choosenProf);

  //       const detection = await urlSocket.post(
  //         '/api/stage/overall_result_profile_stg',
  //         {
  //           comp_id: choosenProf.comp_id,
  //           comp_name: choosenProf.comp_name,
  //           comp_code: choosenProf.comp_code,
  //           batch_id: choosenProf.batch_id,
  //           captured_image: capturedImagesData,
  //           insp_result_id: response?.data?._id,
  //           start_time_with_milliseconds:
  //             response?.data?.start_time_with_milliseconds,
  //           positive: config.positive,
  //           negative: config.negative,
  //           posble_match: config.posble_match,
  //           choosen_prof: JSON.stringify(choosenProf.stage_profiles),
  //           region_selection: region_selection,
  //           updated_rectangles: updatedRectanglesList
  //         },
  //         { mode: 'no-cors' }
  //       );

  //       console.log('🧩 overall_result_profile Response:', detection.data);

  //       setShowstatus(false);
  //       setCompFound(2);

  //       if (choosenProf?.qrbar_check === true) setQrbarShowStart(true);
  //       else setShowStart(true);
  //       const cameraResults = {};
  //       const cameraValues = {};

  //       detection.data.forEach(cameraResult => {
  //         // const cameraLabel = cameraResult.camera_label;
  //         const cameraLabel =
  //           cameraResult.camera_label.charAt(0).toUpperCase() +
  //           cameraResult.camera_label.slice(1);

  //         console.log('cameraLabel', cameraLabel);
  //         const status = cameraResult.status; // "OK" or "NG"
  //         console.log('status', status);

  //         // Store result message per camera
  //         if (status === 'OK') {
  //           cameraResults[cameraLabel] = config[0].positive;
  //         } else if (status === 'NG') {
  //           cameraResults[cameraLabel] = config[0].negative;
  //         }

  //         // Store the highest confidence value for this camera
  //         const maxValue = Math.max(
  //           ...cameraResult.region_results.map(r => r.value)
  //         );
  //         console.log('maxValue', maxValue);
  //         cameraValues[cameraLabel] = maxValue;
  //       });

  //       console.log('Per-camera results:', cameraResults);
  //       console.log('Per-camera values:', cameraValues);

  //       // const testing_result = detection.data[0].status;
  //       // Instead of just checking detection.data[0].status
  //       const allCameraStatuses = detection.data.map(cam => cam.status);
  //       const overallStatus = allCameraStatuses.every(status => status === 'OK')
  //         ? 'OK'
  //         : 'NG';
  //       const testing_result = overallStatus;

  //       console.log('All camera statuses:', allCameraStatuses);
  //       console.log('Overall testing result:', testing_result);

  //       // if (region_selection) {
  //       const originalWidth = 640;
  //       const originalHeight = 480;
  //       const targetWidth = DEFAULT_RESOLUTION.width;
  //       const targetHeight = DEFAULT_RESOLUTION.height;

  //       const scaleX = targetWidth / originalWidth;
  //       const scaleY = targetHeight / originalHeight;

  //       // In your objectDetectionOnly function, before setting state:
  //       const rectanglesByCam = {};

  //       detection.data.forEach(cameraResult => {
  //         // const backendLabel = cameraResult.camera_label;
  //         const backendLabel =
  //           cameraResult.camera_label.charAt(0).toUpperCase() +
  //           cameraResult.camera_label.slice(1);
  //         console.log('backendLabel', backendLabel, cameraResult);

  //         // Find matching camera in your cameraList
  //         const matchingCamera = cameraList.find(
  //           cam =>
  //             cam.label === backendLabel &&
  //             cam.stageName === cameraResult.stage_name
  //         );
  //         console.log('matchingCamera', matchingCamera);

  //         if (!matchingCamera) {
  //           console.warn(`⚠️ No matching camera found for ${backendLabel}`);
  //           return;
  //         }

  //         // const frontendLabel = matchingCamera.originalLabel; // Use this for canvas
  //         const frontendLabel = matchingCamera.label;
  //         console.log('frontendLabel', frontendLabel);

  //         const retrievedRectangles = cameraResult.region_results.map(rect => ({
  //           x: rect.rectangles.coordinates.x / scaleX,
  //           y: rect.rectangles.coordinates.y / scaleY,
  //           height: rect.rectangles.coordinates.height / scaleY,
  //           width: rect.rectangles.coordinates.width / scaleX,
  //           id: rect.rectangles.id,
  //           name: rect.rectangles.name,
  //           colour: rect.result === 'OK' ? 'green' : 'red',
  //           result: rect.result,
  //           value: rect.value
  //         }));
  //         console.log('retrievedRectangles', retrievedRectangles);

  //         rectanglesByCam[frontendLabel] = retrievedRectangles; // Use frontendLabel as key
  //         console.log(`Mapped ${backendLabel} → ${frontendLabel}`);
  //       });

  //       console.log('rectanglesByCamee', rectanglesByCam);
  //       setRectanglesByCamera(rectanglesByCam);
  //       setResMessage(cameraResults); // Per-camera results
  //       setResponseValue(cameraValues); // Per-camera values
  //       setOutputRect(true);
  //       setShowresult(true);
  //       setResultKey(true);
  //       // }

  //       // ✅ Update OK/NG counters and ratio
  //       const nextCount = (objCount ?? 0) + 1;
  //       console.log('nextCount', nextCount);
  //       const reachedSampleTarget =
  //         Number.isFinite(sampleCount) && nextCount >= sampleCount;
  //       console.log('reachedSampleTarget', reachedSampleTarget);
  //       if (reachedSampleTarget) {
  //         show_ratio = true;

  //         const test_opt_response = await urlSocket.post(
  //           '/api/stage/test_opt',
  //           {
  //             batch_id: choosenProf.batch_id,
  //             profile_id: choosenProf._id
  //           },
  //           { mode: 'no-cors' }
  //         );
  //         ratio_data_ = test_opt_response.data;
  //         console.log('📊 test_opt Response:', ratio_data_);
  //       }

  //       if (testing_result === 'OK') {
  //         let updated_ok = okCount + 1;
  //         let updated_total = updated_ok + ngCount;
  //         setResponseMessage(config.positive);
  //         setResponseValue(detection.data[0].value);
  //         setShowresult(true);
  //         setResultKey(true);
  //         setObjCount(objCount + 1);
  //         setShowRatio(show_ratio);
  //         setRatioData(ratio_data_);
  //         setCompResult(2);
  //         setOkCount(updated_ok);
  //         setTCount(updated_total);
  //       } else if (testing_result === 'NG') {
  //         let updated_ng = ngCount + 1;
  //         let updated_total = okCount + updated_ng;
  //         setResponseMessage(config.negative);
  //         setResponseValue(detection.data[0].value);
  //         setShowresult(true);
  //         setResultKey(true);
  //         setObjCount(objCount + 1);
  //         setShowRatio(show_ratio);
  //         setRatioData(ratio_data_);
  //         setCompResult(1);
  //         setNgCount(updated_ng);
  //         setTCount(updated_total);
  //       }
  //       // } else {
  //       //     // Not yet at target → do NOT call test_opt, and hide ratio UI
  //       //     setShowRatio(false);

  //       //     if (testing_result === "OK") {
  //       //         let updated_ok = okCount + 1;
  //       //         let updated_total = updated_ok + ngCount;
  //       //         setResponseMessage(config.positive);
  //       //         setResponseValue(detection.data[0].value);
  //       //         setShowresult(true);
  //       //         setResultKey(true);
  //       //         setObjCount(objCount + 1);
  //       //         setShowRatio(true);
  //       //         setRatioData(ratio_data_);
  //       //         setCompResult(2);
  //       //         setOkCount(updated_ok);
  //       //         setTCount(updated_total);
  //       //     } else if (testing_result === "NG") {
  //       //         let updated_ng = ngCount + 1;
  //       //         let updated_total = okCount + updated_ng;
  //       //         setResponseMessage(config.negative);
  //       //         setResponseValue(detection.data[0].value);
  //       //         setShowresult(true);
  //       //         setResultKey(true);
  //       //         setObjCount(objCount + 1);
  //       //         setShowRatio(true);
  //       //         setRatioData(ratio_data_);
  //       //         setCompResult(1);
  //       //         setNgCount(updated_ng);
  //       //         setTCount(updated_total);
  //       //     }
  //       // }
  //     } else {
  //       setShowStart(choosenProf?.qrbar_check === true ? false : true);
  //       setQrbarShowStart(choosenProf?.qrbar_check === true ? true : false);
  //     }
  //   } catch (error) {
  //     console.error('❌ objectDetectionOnly Error:', error);
  //   }
  // };

  //working for captured images testing
  //   const objectDetectionOnly = async () => {
  //     try {
  //       console.log('▶️ Running objectDetectionOnly()...');
  //       console.log('cameraList', cameraList);

  //       if (!cameraList || cameraList.length === 0) {
  //         console.error('❌ No cameras available.');
  //         return;
  //       }

  //       if (!groupedGallery || Object.keys(groupedGallery).length === 0) {
  //         console.error('❌ No gallery images loaded.');
  //         return;
  //       }

  //       const capturedImages = [];

  //       // ====================================================
  //       // 🔥 REPLACED WEBCAM CAPTURE WITH GALLERY IMAGE LOADING
  //       // ====================================================
  //       for (const cam of cameraList) {
  //         const labelName = cam.label; // Position1, Position2...
  //         const version = cam.model_ver;
  //         const stagename = cam.stageName;
  //         const stagecode = cam.stage_code;
  //         const stage_id = cam.stage_id;
  //         const originalLabel = cam.originalLabel;

  //         const imagesForCamera = groupedGallery[labelName];

  //         if (!imagesForCamera || imagesForCamera.length === 0) {
  //           console.warn(`⚠️ No gallery images found for camera: ${labelName}`);
  //           continue;
  //         }

  //         // Pick sequential image for this camera
  //         const imageObj =
  //           imagesForCamera[currentImageIndex] || imagesForCamera[0];

  //         console.log('imageObj', imageObj);

  //         // 🔥 get final image URL (NO BLOB FETCHING)
  //         const finalUrl = showImage(imageObj.s3_path);

  //         capturedImages.push({
  //           label: labelName,
  //           version,
  //           stageName: stagename,
  //           stagecode,
  //           stage_id,
  //           url: finalUrl,
  //           filename: imageObj.filename
  //         });
  //       }

  //       console.log('📷 Captured gallery images:', capturedImages);

  //       if (capturedImages.length === 0) {
  //         console.error('❌ No images were picked from gallery.');
  //         return;
  //       }

  //       // ====================================================
  //       // 🔥 REMAINDER OF YOUR ORIGINAL FUNCTION (UNCHANGED)
  //       // ====================================================

  //       const formData = new FormData();
  //       formData.append('comp_code', galleryData.comp_code);
  //       formData.append('comp_name', galleryData.comp_name);

  //       capturedImages.forEach(img => {
  //         formData.append('image_urls', img.url);
  //         formData.append('filenames', img.filename);
  //         formData.append('labels', img.label);
  //         formData.append('versions', img.version);
  //         formData.append('stage_names', img.stageName);
  //         formData.append('stage_codes', img.stagecode);
  //         formData.append('stage_ids', img.stage_id);
  //       });

  //       const response = await urlSocket.post(
  //         '/api/stage/obj_detection_profile_multi',
  //         formData,
  //         { headers: { 'Content-Type': 'multipart/form-data' } }
  //       );

  //       console.log('🔵 Response:', response.data);

  //       const results = response.data?.results || [];
  //       if (!results.length) {
  //         console.error('❌ No results returned.');
  //         return;
  //       }

  //       // Process detection results
  //       const updated = results.map(r => {
  //         const isNG = (r.circle?.length || 0) > 0;
  //         return { ...r, isNG };
  //       });

  //       setDetectionResults(updated);

  //       // Update OK/NG counts
  //       let ngCount = 0;
  //       let okCount = 0;

  //       updated.forEach(r => {
  //         if (r.isNG) ngCount++;
  //         else okCount++;
  //       });

  //       setTotalNG(prev => prev + ngCount);
  //       setTotalOK(prev => prev + okCount);

  //       // Advance to next image
  //       setCurrentImageIndex(prev => prev + 1);

  //       // If last image is processed
  //       const sampleCount =
  //         groupedGallery[Object.keys(groupedGallery)[0]]?.length;
  //       if (currentImageIndex + 1 >= sampleCount) {
  //         Swal.fire({
  //           icon: 'success',
  //           title: '🎉 All gallery images processed!',
  //           text: 'You have completed the test run.'
  //         });
  //       }
  //     } catch (err) {
  //       console.error('🔥 Error in objectDetectionOnly:', err);
  //     }
  //   };

  //19-nov-2025-till object
  // const objectDetectionOnly = async () => {
  //   console.log('📸 Starting OBJECT DETECTION with LOADED IMAGES');

  //   setResImg(false);
  //   setRectangles([]);
  //   setOutputRect(false);
  //   setResMessage({});
  //   setRectanglesByCamera({});
  //   setShowstatus(false);

  //   if (!galleryData || galleryData.length === 0) {
  //     Swal.fire({
  //       icon: 'info',
  //       title: 'No loaded images',
  //       text: 'Please load images before starting test'
  //     });
  //     return;
  //   }

  //   if (!sample_count || sample_count <= 0) {
  //     Swal.fire({
  //       icon: 'info',
  //       title: 'Invalid number of test samples',
  //       text: 'Please set sample count > 0'
  //     });
  //     return;
  //   }

  //   try {
  //     // -------------------------------------------------------
  //     // 🔥 BUILD PAYLOAD USING GALLERY IMAGES
  //     // -------------------------------------------------------
  //     const formData = new FormData();

  //     // formData.append('comp_name', choosen_prof.comp_name);
  //     // formData.append('comp_code', choosen_prof.comp_code);
  //     // formData.append('comp_id', choosen_prof.comp_id);
  //     // formData.append('batch_id', choosen_prof.batch_id);
  //     // formData.append('prof_data', JSON.stringify(choosen_prof));

  //     const now = new Date();
  //     const today = `${String(now.getDate()).padStart(2, '0')}/${String(
  //       now.getMonth() + 1
  //     ).padStart(2, '0')}/${now.getFullYear()}`;
  //     const testDate = `${now.getFullYear()}-${String(
  //       now.getMonth() + 1
  //     ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  //     const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
  //     const ms = now.getMilliseconds().toString().padStart(3, '0');

  //     // formData.append('date', today);
  //     // formData.append('inspected_ondate', testDate);
  //     // formData.append('time', time);
  //     // formData.append('milliseconds', `${time}.${ms}`);

  //     formData.append('comp_name', choosen_prof.comp_name);
  //     formData.append('comp_code', choosen_prof.comp_code);
  //     formData.append('comp_id', choosen_prof.comp_id);
  //     formData.append('obj_detect', choosen_prof.detect_selection);
  //     formData.append('detect_type', config.detection_type);
  //     formData.append('positive', config.positive);
  //     formData.append('negative', config.negative);
  //     formData.append('posble_match', config.posble_match);
  //     // formData.append("station_name", station_name);
  //     // formData.append("station_id", station_id);
  //     formData.append('inspected_ondate', testDate);
  //     formData.append('date', today);
  //     formData.append('time', time);
  //     formData.append('milliseconds', `${time}.${ms}`);
  //     formData.append('batch_id', choosen_prof.batch_id);
  //     formData.append('prof_data', JSON.stringify(choosen_prof.stage_profiles));

  //     console.log('🖼 Sending images…');

  //     // Map loaded gallery image for each camera
  //     //   cameraList.forEach((cam, idx) => {
  //     //     // const galleryImg = galleryData.find(g => g.camera_label === cam.label);
  //     //     const galleryImg = galleryData.find(
  //     //       g =>
  //     //         g.camera_label.trim().toLowerCase() ===
  //     //         cam.label.trim().toLowerCase()
  //     //     );

  //     //     if (!galleryImg) {
  //     //       console.warn(`No image found for camera: ${cam.label}`);
  //     //       return;
  //     //     }

  //     //     // remove the "Vs_inspection/" prefix from s3_path
  //     //     const cleanedPath = galleryImg.s3_path.replace(/^Vs_inspection\//, '');

  //     //     formData.append('image_urls', image_url + cleanedPath);

  //     //     formData.append('image_urls', galleryImg.s3_path);
  //     //     formData.append('filenames', galleryImg.filename);
  //     //     formData.append('labels', cam.label);
  //     //     formData.append('versions', cam.model_ver);
  //     //     formData.append('stage_names', cam.stageName);
  //     //     formData.append('stage_codes', cam.stage_code);
  //     //     formData.append('stage_ids', cam.stage_id);
  //     //   });

  //     cameraList.forEach((cam, idx) => {
  //       // get all images for this camera/position
  //       const imagesForCam = galleryData.filter(
  //         g =>
  //           g.camera_label.trim().toLowerCase() ===
  //           cam.label.trim().toLowerCase()
  //       );

  //       if (!imagesForCam.length) {
  //         console.warn(`No images found for camera: ${cam.label}`);
  //         return;
  //       }

  //       imagesForCam.forEach(galleryImg => {
  //         // remove leading "Vs_inspection/" only to avoid duplicate path
  //         const cleanedPath = galleryImg.s3_path.replace(
  //           /^Vs_inspection\/+/,
  //           ''
  //         );

  //         // build the final URL
  //         const fullUrl = image_url + cleanedPath;

  //         formData.append('image_urls', fullUrl);
  //         formData.append('filenames', galleryImg.filename);
  //         formData.append('labels', cam.label);
  //         formData.append('versions', cam.model_ver);
  //         formData.append('stage_names', cam.stageName);
  //         formData.append('stage_codes', cam.stage_code);
  //         formData.append('stage_ids', cam.stage_id);
  //       });
  //     });

  //     // -------------------------------------------------------
  //     // 🔥 SEND TO BACKEND (object detection)
  //     // -------------------------------------------------------
  //     const response = await urlSocket.post(
  //       '/api/stage/obj_detection_profile_multi_gallery',
  //       formData,
  //       {
  //         headers: { 'content-type': 'multipart/form-data' }
  //       }
  //     );

  //     console.log('🎯 Detection Response:', response.data);

  //     const detectionResults = response.data?.detection_result ?? [];
  //     console.log('detectionResults', detectionResults)
  //     const capturedImages = response.data?.captured_image ?? [];

  //     const resultsByCamera = {};
  //     detectionResults.forEach(item => {
  //       resultsByCamera[item.camera_label] = item.detection_result;
  //     });

  //     setResMessage(resultsByCamera);
  //     setShowstatus(true);

  //     const hasObjectDetected = detectionResults.some(
  //       item => item.detection_result === 'Object Detected'
  //     );

  //     if (!hasObjectDetected) {
  //       setShowStart(true);
  //       return;
  //     }

  //     // -------------------------------------------------------
  //     // 🔥 CALL OVERALL TEST API
  //     // -------------------------------------------------------
  //     setResMessage('Checking...');
  //     setShowstatus(true);

  //     const finalCheck = await urlSocket.post(
  //       '/api/stage/overall_result_profile_stg_gallery',
  //       {
  //         comp_id: choosen_prof.comp_id,
  //         comp_name: choosen_prof.comp_name,
  //         comp_code: choosen_prof.comp_code,
  //         batch_id: choosen_prof.batch_id,
  //         captured_image: capturedImages,
  //         insp_result_id: response.data?._id,
  //         start_time_with_milliseconds:
  //           response.data?.start_time_with_milliseconds,
  //         positive: config.positive,
  //         negative: config.negative,
  //         posble_match: config.posble_match,
  //         choosen_prof: JSON.stringify(choosen_prof.stage_profiles),
  //         region_selection: region_selection,
  //         updated_rectangles: response.data?.updated_rectangles || []
  //       }
  //     );

  //     console.log('🧩 Overall Result:', finalCheck.data);

  //     const overallData = finalCheck.data;
  //     const cameraResults = {};
  //     const cameraValues = {};

  //     overallData.forEach(cam => {
  //       const camLabel =
  //         cam.camera_label.charAt(0).toUpperCase() + cam.camera_label.slice(1);

  //       cameraResults[camLabel] =
  //         cam.status === 'OK' ? config.positive : config.negative;

  //       cameraValues[camLabel] = Math.max(
  //         ...cam.region_results.map(r => r.value)
  //       );
  //     });

  //     setResMessage(cameraResults);
  //     setResponseValue(cameraValues);
  //     setOutputRect(true);
  //     setShowresult(true);

  //     const allStatus = overallData.map(r => r.status);
  //     const finalStatus = allStatus.every(s => s === 'OK') ? 'OK' : 'NG';

  //     // -------------------------------------------------------
  //     // 🔥 UPDATE COUNTERS
  //     // -------------------------------------------------------
  //     const nextCount = (obj_count ?? 0) + 1;
  //     const reachedTarget = nextCount >= sample_count;

  //     if (reachedTarget) {
  //       const testOpt = await urlSocket.post('/api/stage/test_opt', {
  //         batch_id: choosen_prof.batch_id,
  //         profile_id: choosen_prof._id
  //       });

  //       setRatioData(testOpt.data);
  //       setShowRatio(true);
  //     }

  //     if (finalStatus === 'OK') {
  //       setOkCount(ok_count + 1);
  //       setCompResult(2);
  //     } else {
  //       setNgCount(ng_count + 1);
  //       setCompResult(1);
  //     }

  //     setObjCount(nextCount);
  //     setTCount(ok_count + ng_count + 1);

  //     setShowStart(true);
  //   } catch (err) {
  //     console.error('❌ objectDetectionOnly Error:', err);
  //   }
  // };

  function findCameraLabel (cameraNameFromAPI, cameraList) {
    const apiLabel = cameraNameFromAPI.trim().toLowerCase();

    return (
      cameraList.find(
        c =>
          (c.label && c.label.trim().toLowerCase() === apiLabel) ||
          (c.originalLabel && c.originalLabel.trim().toLowerCase() === apiLabel)
      )?.label || cameraNameFromAPI
    );
  }

  //my working code 20 nov 2025
  // const objectDetectionOnly = async () => {
  //   console.log('📸 Starting OBJECT DETECTION with LOADED IMAGES');

  //   setResImg(false);
  //   setRectangles([]);
  //   setOutputRect(false);
  //   setResMessage({});
  //   setRectanglesByCamera({});
  //   setShowstatus(false);

  //   if (!galleryData || galleryData.length === 0) {
  //     Swal.fire({
  //       icon: 'info',
  //       title: 'No loaded images',
  //       text: 'Please load images before starting test'
  //     });
  //     return;
  //   }

  //   if (!sample_count || sample_count <= 0) {
  //     Swal.fire({
  //       icon: 'info',
  //       title: 'Invalid number of test samples',
  //       text: 'Please set sample count > 0'
  //     });
  //     return;
  //   }

  //   try {
  //     const formData = new FormData();
  //     const now = new Date();
  //     const today = `${String(now.getDate()).padStart(2, '0')}/${String(
  //       now.getMonth() + 1
  //     ).padStart(2, '0')}/${now.getFullYear()}`;
  //     const testDate = `${now.getFullYear()}-${String(
  //       now.getMonth() + 1
  //     ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  //     const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
  //     const ms = now.getMilliseconds().toString().padStart(3, '0');

  //     formData.append('comp_name', choosen_prof.comp_name);
  //     formData.append('comp_code', choosen_prof.comp_code);
  //     formData.append('comp_id', choosen_prof.comp_id);
  //     formData.append('obj_detect', choosen_prof.detect_selection);
  //     formData.append('detect_type', config.detection_type);
  //     formData.append('positive', config.positive);
  //     formData.append('negative', config.negative);
  //     formData.append('posble_match', config.posble_match);
  //     formData.append('inspected_ondate', testDate);
  //     formData.append('date', today);
  //     formData.append('time', time);
  //     formData.append('milliseconds', `${time}.${ms}`);
  //     formData.append('batch_id', choosen_prof.batch_id);
  //     formData.append('prof_data', JSON.stringify(choosen_prof.stage_profiles));

  //     console.log('🖼 Sending images for object detection…');

  //     // Send all images for object detection
  //     cameraList.forEach(cam => {
  //       const imagesForCam = galleryData.filter(
  //         g =>
  //           g.camera_label.trim().toLowerCase() ===
  //           cam.label.trim().toLowerCase()
  //       );

  //       if (!imagesForCam.length) {
  //         console.warn(`No images found for camera: ${cam.label}`);
  //         return;
  //       }

  //       imagesForCam.forEach(galleryImg => {
  //         const cleanedPath = galleryImg.s3_path.replace(
  //           /^Vs_inspection\/+/,
  //           ''
  //         );
  //         const fullUrl = image_url + cleanedPath;

  //         formData.append('image_urls', fullUrl);
  //         formData.append('filenames', galleryImg.filename);
  //         formData.append('labels', cam.label);
  //         formData.append('versions', cam.model_ver);
  //         formData.append('stage_names', cam.stageName);
  //         formData.append('stage_codes', cam.stage_code);
  //         formData.append('stage_ids', cam.stage_id);
  //       });
  //     });

  //     // -------------------------------------------------------
  //     // 🔥 OBJECT DETECTION
  //     // -------------------------------------------------------
  //     const response = await urlSocket.post(
  //       '/api/stage/obj_detection_profile_multi_gallery',
  //       formData,
  //       {
  //         headers: { 'content-type': 'multipart/form-data' }
  //       }
  //     );

  //     console.log('🎯 Detection Response:', response.data);

  //     const detectionResults = response.data?.detection_result ?? [];
  //     const capturedImages = response.data?.captured_image ?? [];

  //     console.log('📊 Detection Results:', detectionResults);
  //     console.log('📷 Captured Images:', capturedImages);

  //     // Show detection results
  //     const resultsByCamera = {};
  //     detectionResults.forEach(item => {
  //       if (!resultsByCamera[item.camera_label]) {
  //         resultsByCamera[item.camera_label] = [];
  //       }
  //       resultsByCamera[item.camera_label].push(item.detection_result);
  //     });

  //     // Display detection summary
  //     const detectionSummary = {};
  //     Object.keys(resultsByCamera).forEach(cam => {
  //       const detected = resultsByCamera[cam].filter(
  //         r => r === 'Object Detected'
  //       ).length;
  //       const total = resultsByCamera[cam].length;
  //       detectionSummary[cam] = `${detected}/${total} detected`;
  //     });

  //     setResMessage(detectionSummary);
  //     setShowstatus(true);

  //     const hasObjectDetected = detectionResults.some(
  //       item => item.detection_result === 'Object Detected'
  //     );

  //     if (!hasObjectDetected) {
  //       Swal.fire({
  //         icon: 'warning',
  //         title: 'No Objects Detected',
  //         text: 'No objects were detected in any of the images'
  //       });
  //       setShowStart(true);
  //       return;
  //     }

  //     // -------------------------------------------------------
  //     // 🔥 PROCESS EACH IMAGE INDIVIDUALLY
  //     // -------------------------------------------------------
  //     setResMessage('Testing images...');
  //     setShowstatus(true);

  //     // Group captured images by camera
  //     const imagesByCamera = {};
  //     capturedImages.forEach(img => {
  //       if (!imagesByCamera[img.camera_label]) {
  //         imagesByCamera[img.camera_label] = [];
  //       }
  //       imagesByCamera[img.camera_label].push(img);
  //     });

  //     console.log('📸 Images grouped by camera:', imagesByCamera);

  //     // Store all test results
  //     const allTestResults = [];
  //     let processedCount = 0;
  //     const totalImages = capturedImages.length;

  //     // Process each image one by one
  //     for (const [cameraLabel, images] of Object.entries(imagesByCamera)) {
  //       console.log(`\n${'='.repeat(50)}`);
  //       console.log(`📷 Processing ${images.length} images for ${cameraLabel}`);
  //       console.log(`${'='.repeat(50)}`);

  //       for (let i = 0; i < images.length; i++) {
  //         const currentImage = images[i];
  //         processedCount++;

  //         console.log(
  //           `\n🔍 Testing image ${i + 1}/${images.length} for ${cameraLabel}`
  //         );
  //         console.log(`Overall progress: ${processedCount}/${totalImages}`);

  //         setResMessage({
  //           ...detectionSummary,
  //           status: `Testing ${cameraLabel} - Image ${i + 1}/${images.length}`
  //         });

  //         try {
  //           // Test THIS SINGLE IMAGE
  //           const finalCheck = await urlSocket.post(
  //             '/api/stage/overall_result_profile_stg_gallery',
  //             {
  //               comp_id: choosen_prof.comp_id,
  //               comp_name: choosen_prof.comp_name,
  //               comp_code: choosen_prof.comp_code,
  //               batch_id: choosen_prof.batch_id,
  //               captured_image: [currentImage], // 🔥 SEND ONLY ONE IMAGE AT A TIME
  //               insp_result_id: response.data?._id,
  //               start_time_with_milliseconds:
  //                 response.data?.start_time_with_milliseconds,
  //               positive: config.positive,
  //               negative: config.negative,
  //               posble_match: config.posble_match,
  //               choosen_prof: JSON.stringify(choosen_prof.stage_profiles),
  //               region_selection: region_selection,
  //               updated_rectangles: response.data?.updated_rectangles || []
  //             }
  //           );

  //           console.log(
  //             `✅ Result for ${cameraLabel} image ${i + 1}:`,
  //             finalCheck.data
  //           );

  //           // Store the result
  //           allTestResults.push({
  //             camera: cameraLabel,
  //             imageIndex: i,
  //             imagePath: currentImage.captured_image,
  //             result: finalCheck.data[0], // The API returns array with single result
  //             timestamp: new Date().toISOString()
  //           });

  //           setCameraImageIndex(prev => ({
  //             ...prev,
  //             [cameraLabel]: i // show current tested image
  //           }));

  //           console.log(
  //             `✅ Result for ${cameraLabel} image ${i + 1}:`,
  //             finalCheck.data
  //           );
  //         } catch (error) {
  //           console.error(
  //             `❌ Error testing ${cameraLabel} image ${i + 1}:`,
  //             error
  //           );

  //           // Store error result
  //           allTestResults.push({
  //             camera: cameraLabel,
  //             imageIndex: i,
  //             imagePath: currentImage.captured_image,
  //             result: { status: 'ERROR', error: error.message },
  //             timestamp: new Date().toISOString()
  //           });
  //         }

  //         // Small delay between tests to avoid overwhelming the server
  //         await new Promise(resolve => setTimeout(resolve, 500));
  //       }
  //     }

  //     console.log('\n📊 All Test Results:', allTestResults);

  //     // -------------------------------------------------------
  //     // 🔥 AGGREGATE RESULTS BY CAMERA
  //     // -------------------------------------------------------
  //     const cameraResults = {};

  //     // Group results by camera
  //     allTestResults.forEach(test => {
  //       const cam = test.camera.trim();

  //       if (!cameraResults[cam]) {
  //         cameraResults[cam] = [];
  //       }

  //       cameraResults[cam].push(test.result.status);
  //     });

  //     // Determine final status per camera: OK if all images are OK, else NG
  //     const finalCameraStatus = {};
  //     Object.keys(cameraResults).forEach(cameraLabel => {
  //       const statuses = cameraResults[cameraLabel];
  //       const allOK = statuses.every(s => s === 'OK');
  //       finalCameraStatus[cameraLabel] = allOK ? 'OK' : 'NG';
  //     });

  //     // Optional: extract max region value if needed
  //     const cameraValues = {};
  //     allTestResults.forEach(test => {
  //       const cam = test.camera.trim();
  //       const values =
  //         test.result.region_results?.map(rr => rr.value || 0) || [];
  //       if (!cameraValues[cam]) cameraValues[cam] = 0;
  //       if (values.length)
  //         cameraValues[cam] = Math.max(cameraValues[cam], ...values);
  //     });

  //     console.log('Camera Status:', finalCameraStatus);
  //     console.log('Camera Values:', cameraValues);

  //     // Update UI
  //     setResMessage(finalCameraStatus);
  //     setResponseValue(cameraValues);
  //     setOutputRect(true);
  //     setShowresult(true);

  //     // Final status: OK only if all cameras are OK
  //     const finalStatus = Object.values(cameraResults).every(
  //       r => r === config.positive
  //     )
  //       ? 'OK'
  //       : 'NG';

  //     console.log(`\n🎯 FINAL STATUS: ${finalStatus}`);

  //     // -------------------------------------------------------
  //     // 🔥 UPDATE COUNTERS
  //     // -------------------------------------------------------
  //     const nextCount = (obj_count ?? 0) + 1;
  //     const reachedTarget = nextCount >= sample_count;

  //     if (reachedTarget) {
  //       const testOpt = await urlSocket.post('/api/stage/test_opt', {
  //         batch_id: choosen_prof.batch_id,
  //         profile_id: choosen_prof._id
  //       });

  //       console.log('testOpt', testOpt);

  //       // setRatioData(testOpt.data);
  //       setRatioData({
  //         profile_Ratio: testOpt.data?.profile_Ratio,
  //         Final_algorithm_acceptance_ratio: testOpt.data?.algo_ratio
  //       });

  //       setShowRatio(true);
  //     }

  //     if (finalStatus === 'OK') {
  //       setOkCount(ok_count + 1);
  //       setCompResult(2);
  //     } else {
  //       setNgCount(ng_count + 1);
  //       setCompResult(1);
  //     }

  //     setObjCount(nextCount);
  //     setTCount(ok_count + ng_count + 1);

  //     setShowStart(true);

  //     // Show completion message
  //     // Swal.fire({
  //     //   icon: finalStatus === 'OK' ? 'success' : 'error',
  //     //   title: `Test Complete - ${finalStatus}`,
  //     //   html: `
  //     //   <div style="text-align: left;">
  //     //     <p><strong>Images Tested:</strong> ${totalImages}</p>
  //     //     ${Object.entries(res_message).map(([camera, status]) => (
  //     //       <div key={camera} style={{ marginBottom: 8 }}>
  //     //         <strong>{camera}:</strong>{' '}
  //     //         <span style={{ color: status === 'OK' ? 'green' : 'red' }}>
  //     //           {status}
  //     //         </span>
  //     //       </div>
  //     //     ))}

  //     //   </div>
  //     // `,
  //     //   timer: 3000
  //     // });

  //     Swal.fire({
  //       icon: finalStatus === 'OK' ? 'success' : 'error',
  //       title: `Test Complete - ${finalStatus}`,
  //       html: Object.entries(finalCameraStatus)
  //         .map(
  //           ([camera, status]) => `<p><strong>${camera}:</strong> ${status}</p>`
  //         )
  //         .join(''),
  //       timer: 3000,
  //       showConfirmButton: false
  //     });
  //   } catch (err) {
  //     console.error('❌ objectDetectionOnly Error:', err);
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Testing Error',
  //       text: err.message || 'An error occurred during testing'
  //     });
  //   }
  // };

  // find_qrbarcode function

  //checking
  // const objectDetectionOnly = async () => {
  //   console.log('📸 Starting OBJECT DETECTION with LOADED IMAGES');

  //   setResImg(false);
  //   setRectangles([]);
  //   setOutputRect(false);
  //   setResMessage({});
  //   setRectanglesByCamera({});
  //   setShowstatus(false);

  //   if (!galleryData || galleryData.length === 0) {
  //     Swal.fire({
  //       icon: 'info',
  //       title: 'No loaded images',
  //       text: 'Please load images before starting test'
  //     });
  //     return;
  //   }

  //   if (!sample_count || sample_count <= 0) {
  //     Swal.fire({
  //       icon: 'info',
  //       title: 'Invalid number of test samples',
  //       text: 'Please set sample count > 0'
  //     });
  //     return;
  //   }

  //   try {
  //     const formData = new FormData();
  //     const now = new Date();
  //     const today = `${String(now.getDate()).padStart(2, '0')}/${String(
  //       now.getMonth() + 1
  //     ).padStart(2, '0')}/${now.getFullYear()}`;
  //     const testDate = `${now.getFullYear()}-${String(
  //       now.getMonth() + 1
  //     ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  //     const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
  //     const ms = now.getMilliseconds().toString().padStart(3, '0');

  //     formData.append('comp_name', choosen_prof.comp_name);
  //     formData.append('comp_code', choosen_prof.comp_code);
  //     formData.append('comp_id', choosen_prof.comp_id);
  //     formData.append('obj_detect', choosen_prof.detect_selection);
  //     formData.append('detect_type', config.detection_type);
  //     formData.append('positive', config.positive);
  //     formData.append('negative', config.negative);
  //     formData.append('posble_match', config.posble_match);
  //     formData.append('inspected_ondate', testDate);
  //     formData.append('date', today);
  //     formData.append('time', time);
  //     formData.append('milliseconds', `${time}.${ms}`);
  //     formData.append('batch_id', choosen_prof.batch_id);
  //     formData.append('prof_data', JSON.stringify(choosen_prof.stage_profiles));

  //     console.log('🖼 Sending images for object detection…');

  //     // Send all images for object detection
  //     cameraList.forEach(cam => {
  //       const imagesForCam = galleryData.filter(
  //         g =>
  //           g.camera_label.trim().toLowerCase() ===
  //           cam.label.trim().toLowerCase()
  //       );

  //       if (!imagesForCam.length) {
  //         console.warn(`No images found for camera: ${cam.label}`);
  //         return;
  //       }

  //       imagesForCam.forEach(galleryImg => {
  //         const cleanedPath = galleryImg.s3_path.replace(
  //           /^Vs_inspection\/+/,
  //           ''
  //         );
  //         const fullUrl = image_url + cleanedPath;

  //         formData.append('image_urls', fullUrl);
  //         formData.append('filenames', galleryImg.filename);
  //         formData.append('labels', cam.label);
  //         formData.append('versions', cam.model_ver);
  //         formData.append('stage_names', cam.stageName);
  //         formData.append('stage_codes', cam.stage_code);
  //         formData.append('stage_ids', cam.stage_id);
  //       });
  //     });

  //     // -------------------------------------------------------
  //     // 🔥 OBJECT DETECTION
  //     // -------------------------------------------------------
  //     const response = await urlSocket.post(
  //       '/api/stage/obj_detection_profile_multi_gallery',
  //       formData,
  //       {
  //         headers: { 'content-type': 'multipart/form-data' }
  //       }
  //     );

  //     console.log('🎯 Detection Response:', response.data);

  //     const detectionResults = response.data?.detection_result ?? [];
  //     const capturedImages = response.data?.captured_image ?? [];

  //     console.log('📊 Detection Results:', detectionResults);
  //     console.log('📷 Captured Images:', capturedImages);

  //     // Show detection results
  //     const resultsByCamera = {};
  //     detectionResults.forEach(item => {
  //       if (!resultsByCamera[item.camera_label]) {
  //         resultsByCamera[item.camera_label] = [];
  //       }
  //       resultsByCamera[item.camera_label].push(item.detection_result);
  //     });

  //     // Build initial detection messages for each camera
  //     const currentDetectionMessages = {};

  //     // For each camera, show the detection result of the FIRST image
  //     cameraList.forEach(cam => {
  //       const imagesForCam = galleryData.filter(
  //         g =>
  //           g.camera_label.trim().toLowerCase() ===
  //           cam.label.trim().toLowerCase()
  //       );

  //       if (imagesForCam.length > 0) {
  //         // Get the first image (index 0)
  //         const currentIndex = 0;

  //         // Find the detection result for this specific image
  //         const detectionForCurrentImage = detectionResults.find(
  //           item =>
  //             item.camera_label === cam.label &&
  //             item.filename === imagesForCam[currentIndex]?.filename
  //         );

  //         // Set the detection message for this camera
  //         currentDetectionMessages[cam.label] =
  //           detectionForCurrentImage?.detection_result || 'Checking...';
  //       }
  //     });

  //     // Update the UI with individual detection messages
  //     setResMessage(currentDetectionMessages);
  //     setShowstatus(true);

  //     const hasObjectDetected = detectionResults.some(
  //       item => item.detection_result === 'Object Detected'
  //     );

  //     if (!hasObjectDetected) {
  //       Swal.fire({
  //         icon: 'warning',
  //         title: 'No Objects Detected',
  //         text: 'No objects were detected in any of the images'
  //       });
  //       setShowStart(true);
  //       return;
  //     }

  //     // -------------------------------------------------------
  //     // 🔥 PROCESS EACH IMAGE INDIVIDUALLY
  //     // -------------------------------------------------------
  //     // Group captured images by camera
  //     const imagesByCamera = {};
  //     capturedImages.forEach(img => {
  //       if (!imagesByCamera[img.camera_label]) {
  //         imagesByCamera[img.camera_label] = [];
  //       }
  //       imagesByCamera[img.camera_label].push(img);
  //     });

  //     console.log('📸 Images grouped by camera:', imagesByCamera);

  //     // Store all test results
  //     const allTestResults = [];
  //     let processedCount = 0;
  //     const totalImages = capturedImages.length;

  //     // Process each image one by one
  //     for (const [cameraLabel, images] of Object.entries(imagesByCamera)) {
  //       console.log(`\n${'='.repeat(50)}`);
  //       console.log(`📷 Processing ${images.length} images for ${cameraLabel}`);
  //       console.log(`${'='.repeat(50)}`);

  //       for (let i = 0; i < images.length; i++) {
  //         const currentImage = images[i];
  //         processedCount++;

  //         console.log(
  //           `\n🔍 Testing image ${i + 1}/${images.length} for ${cameraLabel}`
  //         );
  //         console.log(`Overall progress: ${processedCount}/${totalImages}`);

  //         // Find the detection result for THIS specific image
  //         const detectionForThisImage = detectionResults.find(
  //           item =>
  //             item.camera_label === cameraLabel &&
  //             item.filename === currentImage.filename
  //         );

  //         // Update message to show detection result for THIS image
  //         setResMessage(prev => ({
  //           ...prev,
  //           [cameraLabel]:
  //             detectionForThisImage?.detection_result || 'Checking...'
  //         }));

  //         // Update the image index so UI shows the current image
  //         setCameraImageIndex(prev => ({
  //           ...prev,
  //           [cameraLabel]: i
  //         }));

  //         try {
  //           // Test THIS SINGLE IMAGE
  //           const finalCheck = await urlSocket.post(
  //             '/api/stage/overall_result_profile_stg_gallery',
  //             {
  //               comp_id: choosen_prof.comp_id,
  //               comp_name: choosen_prof.comp_name,
  //               comp_code: choosen_prof.comp_code,
  //               batch_id: choosen_prof.batch_id,
  //               captured_image: [currentImage], // 🔥 SEND ONLY ONE IMAGE AT A TIME
  //               insp_result_id: response.data?._id,
  //               start_time_with_milliseconds:
  //                 response.data?.start_time_with_milliseconds,
  //               positive: config.positive,
  //               negative: config.negative,
  //               posble_match: config.posble_match,
  //               choosen_prof: JSON.stringify(choosen_prof.stage_profiles),
  //               region_selection: region_selection,
  //               updated_rectangles: response.data?.updated_rectangles || []
  //             }
  //           );

  //           console.log(
  //             `✅ Result for ${cameraLabel} image ${i + 1}:`,
  //             finalCheck.data
  //           );

  //           // Store the result
  //           allTestResults.push({
  //             camera: cameraLabel,
  //             imageIndex: i,
  //             imagePath: currentImage.captured_image,
  //             result: finalCheck.data[0], // The API returns array with single result
  //             timestamp: new Date().toISOString()
  //           });

  //           console.log(
  //             `✅ Result for ${cameraLabel} image ${i + 1}:`,
  //             finalCheck.data
  //           );
  //         } catch (error) {
  //           console.error(
  //             `❌ Error testing ${cameraLabel} image ${i + 1}:`,
  //             error
  //           );

  //           // Store error result
  //           allTestResults.push({
  //             camera: cameraLabel,
  //             imageIndex: i,
  //             imagePath: currentImage.captured_image,
  //             result: { status: 'ERROR', error: error.message },
  //             timestamp: new Date().toISOString()
  //           });
  //         }

  //         // Small delay between tests to avoid overwhelming the server
  //         await new Promise(resolve => setTimeout(resolve, 500));
  //       }
  //     }

  //     console.log('\n📊 All Test Results:', allTestResults);

  //     // -------------------------------------------------------
  //     // 🔥 AGGREGATE RESULTS BY CAMERA
  //     // -------------------------------------------------------
  //     const cameraResults = {};

  //     // Group results by camera
  //     allTestResults.forEach(test => {
  //       const cam = test.camera.trim();

  //       if (!cameraResults[cam]) {
  //         cameraResults[cam] = [];
  //       }

  //       cameraResults[cam].push(test.result.status);
  //     });

  //     // Determine final status per camera: OK if all images are OK, else NG
  //     const finalCameraStatus = {};
  //     Object.keys(cameraResults).forEach(cameraLabel => {
  //       const statuses = cameraResults[cameraLabel];
  //       const allOK = statuses.every(s => s === 'OK');
  //       finalCameraStatus[cameraLabel] = allOK ? 'OK' : 'NG';
  //     });

  //     // Optional: extract max region value if needed
  //     const cameraValues = {};
  //     allTestResults.forEach(test => {
  //       const cam = test.camera.trim();
  //       const values =
  //         test.result.region_results?.map(rr => rr.value || 0) || [];
  //       if (!cameraValues[cam]) cameraValues[cam] = 0;
  //       if (values.length)
  //         cameraValues[cam] = Math.max(cameraValues[cam], ...values);
  //     });

  //     console.log('Camera Status:', finalCameraStatus);
  //     console.log('Camera Values:', cameraValues);

  //     // Update UI
  //     setResMessage(finalCameraStatus);
  //     setResponseValue(cameraValues);
  //     setOutputRect(true);
  //     setShowresult(true);

  //     // Final status: OK only if all cameras are OK
  //     const finalStatus = Object.values(finalCameraStatus).every(
  //       r => r === 'OK'
  //     )
  //       ? 'OK'
  //       : 'NG';

  //     console.log(`\n🎯 FINAL STATUS: ${finalStatus}`);

  //     // -------------------------------------------------------
  //     // 🔥 UPDATE COUNTERS
  //     // -------------------------------------------------------
  //     const nextCount = (obj_count ?? 0) + 1;
  //     const reachedTarget = nextCount >= sample_count;

  //     if (reachedTarget) {
  //       const testOpt = await urlSocket.post('/api/stage/test_opt', {
  //         batch_id: choosen_prof.batch_id,
  //         profile_id: choosen_prof._id
  //       });

  //       console.log('testOpt', testOpt);

  //       setRatioData({
  //         profile_Ratio: testOpt.data?.profile_Ratio,
  //         Final_algorithm_acceptance_ratio: testOpt.data?.algo_ratio
  //       });

  //       setShowRatio(true);
  //     }

  //     if (finalStatus === 'OK') {
  //       setOkCount(ok_count + 1);
  //       setCompResult(2);
  //     } else {
  //       setNgCount(ng_count + 1);
  //       setCompResult(1);
  //     }

  //     setObjCount(nextCount);
  //     setTCount(ok_count + ng_count + 1);

  //     setShowStart(true);

  //     // Show completion message
  //     Swal.fire({
  //       icon: finalStatus === 'OK' ? 'success' : 'error',
  //       title: `Test Complete - ${finalStatus}`,
  //       html: Object.entries(finalCameraStatus)
  //         .map(
  //           ([camera, status]) => `<p><strong>${camera}:</strong> ${status}</p>`
  //         )
  //         .join(''),
  //       timer: 3000,
  //       showConfirmButton: false
  //     });
  //   } catch (err) {
  //     console.error('❌ objectDetectionOnly Error:', err);
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Testing Error',
  //       text: err.message || 'An error occurred during testing'
  //     });
  //   }
  // };

  //current working function for multiple stage cameras detection
  // const objectDetectionOnly = async () => {
  //   console.log('📸 Starting OBJECT DETECTION with LOADED IMAGES');

  //   setResImg(false);
  //   setRectangles([]);
  //   setOutputRect(false);
  //   setResMessage({});
  //   setRectanglesByCamera({});
  //   setShowstatus(false);

  //   if (!galleryData || galleryData.length === 0) {
  //     Swal.fire({
  //       icon: 'info',
  //       title: 'No loaded images',
  //       text: 'Please load images before starting test'
  //     });
  //     return;
  //   }

  //   if (!sample_count || sample_count <= 0) {
  //     Swal.fire({
  //       icon: 'info',
  //       title: 'Invalid number of test samples',
  //       text: 'Please set sample count > 0'
  //     });
  //     return;
  //   }

  //   try {
  //     const formData = new FormData();
  //     const now = new Date();
  //     const today = `${String(now.getDate()).padStart(2, '0')}/${String(
  //       now.getMonth() + 1
  //     ).padStart(2, '0')}/${now.getFullYear()}`;
  //     const testDate = `${now.getFullYear()}-${String(
  //       now.getMonth() + 1
  //     ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  //     const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
  //     const ms = now.getMilliseconds().toString().padStart(3, '0');

  //     // Append general info
  //     formData.append('comp_name', choosen_prof.comp_name);
  //     formData.append('comp_code', choosen_prof.comp_code);
  //     formData.append('comp_id', choosen_prof.comp_id);
  //     formData.append('obj_detect', choosen_prof.detect_selection);
  //     formData.append('detect_type', config.detection_type);
  //     formData.append('positive', config.positive);
  //     formData.append('negative', config.negative);
  //     formData.append('posble_match', config.posble_match);
  //     formData.append('inspected_ondate', testDate);
  //     formData.append('date', today);
  //     formData.append('time', time);
  //     formData.append('milliseconds', `${time}.${ms}`);
  //     formData.append('batch_id', choosen_prof.batch_id);
  //     formData.append('prof_data', JSON.stringify(choosen_prof.stage_profiles));

  //     console.log('🖼 Preparing stage-specific images for object detection…');

  //     // Append images per camera per stage
  //     cameraList.forEach(cam => {
  //       const imagesForCamStage = galleryData.filter(
  //         g =>
  //           g.camera_label.trim().toLowerCase() ===
  //             cam.label.trim().toLowerCase() && g.stage_name === cam.stageName
  //       );

  //       if (!imagesForCamStage.length) {
  //         console.warn(
  //           `No images found for camera: ${cam.label} stage: ${cam.stageName}`
  //         );
  //         return;
  //       }

  //       imagesForCamStage.forEach(img => {
  //         const cleanedPath = img.s3_path.replace(/^Vs_inspection\/+/, '');
  //         const fullUrl = image_url + cleanedPath;

  //         formData.append('image_urls', fullUrl);
  //         formData.append('filenames', img.filename);
  //         formData.append('labels', cam.label);
  //         formData.append('versions', cam.model_ver);
  //         formData.append('stage_names', cam.stageName);
  //         formData.append('stage_codes', cam.stage_code);
  //         formData.append('stage_ids', cam.stage_id);
  //       });
  //     });

  //     // Send to backend
  //     const response = await urlSocket.post(
  //       '/api/stage/obj_detection_profile_multi_gallery',
  //       formData,
  //       { headers: { 'content-type': 'multipart/form-data' } }
  //     );

  //     console.log('🎯 Detection Response:', response.data);

  //     const detectionResults = response.data?.detection_result ?? [];
  //     const capturedImages = response.data?.captured_image ?? [];

  //     // Group captured images by stage + camera
  //     const imagesByStageCamera = {};
  //     capturedImages.forEach(img => {
  //       const key = `${img.stage_name}_${img.camera_label}`;
  //       if (!imagesByStageCamera[key]) imagesByStageCamera[key] = [];
  //       imagesByStageCamera[key].push(img);
  //     });

  //     console.log('📸 Images grouped by stage+camera:', imagesByStageCamera);

  //     // inside objectDetectionOnly
  //     const allTestResults = [];
  //     const imageCountByStageCamera = {};
  //     const detectionMessageByStageCamera = {};
  //     const finalStatusByStageCamera = {};
  //     let processedCount = 0;
  //     const totalImages = capturedImages.length;

  //     for (const [key, images] of Object.entries(imagesByStageCamera)) {
  //       const [stageName, cameraLabel] = key.split('_');
  //       imageCountByStageCamera[key] = images.length;

  //       for (let i = 0; i < images.length; i++) {
  //         const currentImage = images[i];
  //         processedCount++;

  //         // 1️⃣ Update detection message as "Checking..."
  //         const detectionForThisImage = detectionResults.find(
  //           item =>
  //             item.camera_label === cameraLabel &&
  //             item.stage_name === stageName &&
  //             item.filename === currentImage.filename
  //         );

  //         detectionMessageByStageCamera[key] =
  //           detectionForThisImage?.detection_result || 'Checking...';

  //         // 2️⃣ Update image index for UI rotation
  //         setCameraImageIndex(prev => ({
  //           ...prev,
  //           // [key]: i
  //           [cameraLabel]: i
  //         }));

  //         // 3️⃣ Update messages for UI
  //         // setResMessage(prev => ({
  //         //   ...prev,
  //         //   [key]: {
  //         //     message: detectionMessageByStageCamera[key],
  //         //     imageIndex: i + 1,
  //         //     totalImages: images.length
  //         //   }
  //         // }));

  //         setResMessage(prev => ({
  //           ...prev,
  //           [cameraLabel]:
  //             detectionForThisImage?.detection_result || 'Checking...'
  //         }));

  //         try {
  //           // Test single image
  //           const finalCheck = await urlSocket.post(
  //             '/api/stage/overall_result_profile_stg_gallery',
  //             {
  //               comp_id: choosen_prof.comp_id,
  //               comp_name: choosen_prof.comp_name,
  //               comp_code: choosen_prof.comp_code,
  //               batch_id: choosen_prof.batch_id,
  //               captured_image: [currentImage],
  //               insp_result_id: response.data?._id,
  //               start_time_with_milliseconds:
  //                 response.data?.start_time_with_milliseconds,
  //               positive: config.positive,
  //               negative: config.negative,
  //               posble_match: config.posble_match,
  //               choosen_prof: JSON.stringify(choosen_prof.stage_profiles),
  //               region_selection: region_selection,
  //               updated_rectangles: response.data?.updated_rectangles || []
  //             }
  //           );

  //           allTestResults.push({
  //             camera: cameraLabel,
  //             stage: stageName,
  //             imageIndex: i,
  //             imagePath: currentImage.captured_image,
  //             result: finalCheck.data[0],
  //             timestamp: new Date().toISOString()
  //           });

  //           // Update status overlay
  //           finalStatusByStageCamera[key] = finalCheck.data[0].status;

  //           // Update UI with status
  //           setResMessage(prev => ({
  //             ...prev,
  //             [key]: {
  //               message: detectionMessageByStageCamera[key],
  //               imageIndex: i + 1,
  //               totalImages: images.length,
  //               status: finalCheck.data[0].status
  //             }
  //           }));
  //         } catch (error) {
  //           console.error(
  //             `❌ Error testing ${cameraLabel} stage ${stageName} image ${
  //               i + 1
  //             }:`,
  //             error
  //           );

  //           allTestResults.push({
  //             camera: cameraLabel,
  //             stage: stageName,
  //             imageIndex: i,
  //             imagePath: currentImage.captured_image,
  //             result: { status: 'ERROR', error: error.message },
  //             timestamp: new Date().toISOString()
  //           });

  //           finalStatusByStageCamera[key] = 'ERROR';
  //           setResMessage(prev => ({
  //             ...prev,
  //             [key]: {
  //               message: 'ERROR',
  //               imageIndex: i + 1,
  //               totalImages: images.length,
  //               status: 'ERROR'
  //             }
  //           }));
  //         }

  //         await new Promise(resolve => setTimeout(resolve, 500));
  //       }
  //     }

  //     // Aggregate results per camera per stage
  //     const finalStatusByCameraStage = {};
  //     allTestResults.forEach(test => {
  //       const key = `${test.stage}_${test.camera}`;
  //       finalStatusByCameraStage[key] = test.result.status;
  //     });

  //     console.log('Final Camera-Stage Status:', finalStatusByCameraStage);

  //     setResMessage(finalStatusByCameraStage);
  //     setOutputRect(true);
  //     setShowresult(true);
  //     setShowStart(true);

  //     //     // Final status: OK only if all cameras are OK
  //     const finalStatus = Object.values(finalStatusByCameraStage).every(
  //       r => r === 'OK'
  //     )
  //       ? 'OK'
  //       : 'NG';

  //     console.log(`\n🎯 FINAL STATUS: ${finalStatus}`);

  //     // -------------------------------------------------------
  //     // 🔥 UPDATE COUNTERS
  //     // -------------------------------------------------------
  //     const nextCount = (obj_count ?? 0) + 1;
  //     const reachedTarget = nextCount >= sample_count;

  //     if (reachedTarget) {
  //       const testOpt = await urlSocket.post('/api/stage/test_opt', {
  //         batch_id: choosen_prof.batch_id,
  //         profile_id: choosen_prof._id
  //       });

  //       console.log('testOpt', testOpt);

  //       setRatioData({
  //         profile_Ratio: testOpt.data?.profile_Ratio,
  //         Final_algorithm_acceptance_ratio: testOpt.data?.algo_ratio
  //       });

  //       setShowRatio(true);
  //     }

  //     if (finalStatus === 'OK') {
  //       setOkCount(ok_count + 1);
  //       setCompResult(2);
  //     } else {
  //       setNgCount(ng_count + 1);
  //       setCompResult(1);
  //     }

  //     setObjCount(nextCount);
  //     setTCount(ok_count + ng_count + 1);

  //     setShowStart(true);

  //     Swal.fire({
  //       icon: 'info',
  //       title: 'Test Complete',
  //       html: Object.entries(finalStatusByCameraStage)
  //         .map(([key, status]) => `<p><strong>${key}:</strong> ${status}</p>`)
  //         .join(''),
  //       timer: 3000,
  //       showConfirmButton: false
  //     });
  //   } catch (err) {
  //     console.error('❌ objectDetectionOnly Error:', err);
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Testing Error',
  //       text: err.message || 'An error occurred during testing'
  //     });
  //   }
  // };

  //test 1 loop error
  // const objectDetectionOnly = async () => {
  //   console.log('📸 Starting OBJECT DETECTION with LOADED IMAGES');

  //   setResImg(false);
  //   setRectangles([]);
  //   setOutputRect(false);
  //   setResMessage({});
  //   setRectanglesByCamera({});
  //   setShowstatus(true); // ✅ Changed from false to true
  //   setShowresult(false); // ✅ Ensure it starts false

  //   if (!galleryData || galleryData.length === 0) {
  //     Swal.fire({
  //       icon: 'info',
  //       title: 'No loaded images',
  //       text: 'Please load images before starting test'
  //     });
  //     return;
  //   }

  //   if (!sample_count || sample_count <= 0) {
  //     Swal.fire({
  //       icon: 'info',
  //       title: 'Invalid number of test samples',
  //       text: 'Please set sample count > 0'
  //     });
  //     return;
  //   }

  //   try {
  //     const formData = new FormData();
  //     const now = new Date();
  //     const today = `${String(now.getDate()).padStart(2, '0')}/${String(
  //       now.getMonth() + 1
  //     ).padStart(2, '0')}/${now.getFullYear()}`;
  //     const testDate = `${now.getFullYear()}-${String(
  //       now.getMonth() + 1
  //     ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  //     const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
  //     const ms = now.getMilliseconds().toString().padStart(3, '0');

  //     // Append general info
  //     formData.append('comp_name', choosen_prof.comp_name);
  //     formData.append('comp_code', choosen_prof.comp_code);
  //     formData.append('comp_id', choosen_prof.comp_id);
  //     formData.append('obj_detect', choosen_prof.detect_selection);
  //     formData.append('detect_type', config.detection_type);
  //     formData.append('positive', config.positive);
  //     formData.append('negative', config.negative);
  //     formData.append('posble_match', config.posble_match);
  //     formData.append('inspected_ondate', testDate);
  //     formData.append('date', today);
  //     formData.append('time', time);
  //     formData.append('milliseconds', `${time}.${ms}`);
  //     formData.append('batch_id', choosen_prof.batch_id);
  //     formData.append('prof_data', JSON.stringify(choosen_prof.stage_profiles));

  //     console.log('🖼 Preparing stage-specific images for object detection…');

  //     // Append images per camera per stage
  //     cameraList.forEach(cam => {
  //       const imagesForCamStage = galleryData.filter(
  //         g =>
  //           g.camera_label.trim().toLowerCase() ===
  //             cam.label.trim().toLowerCase() && g.stage_name === cam.stageName
  //       );

  //       if (!imagesForCamStage.length) {
  //         console.warn(
  //           `No images found for camera: ${cam.label} stage: ${cam.stageName}`
  //         );
  //         return;
  //       }

  //       imagesForCamStage.forEach(img => {
  //         const cleanedPath = img.s3_path.replace(/^Vs_inspection\/+/, '');
  //         const fullUrl = image_url + cleanedPath;

  //         formData.append('image_urls', fullUrl);
  //         formData.append('filenames', img.filename);
  //         formData.append('labels', cam.label);
  //         formData.append('versions', cam.model_ver);
  //         formData.append('stage_names', cam.stageName);
  //         formData.append('stage_codes', cam.stage_code);
  //         formData.append('stage_ids', cam.stage_id);
  //       });
  //     });

  //     // Send to backend
  //     const response = await urlSocket.post(
  //       '/api/stage/obj_detection_profile_multi_gallery',
  //       formData,
  //       { headers: { 'content-type': 'multipart/form-data' } }
  //     );

  //     console.log('🎯 Detection Response:', response.data);

  //     const detectionResults = response.data?.detection_result ?? [];
  //     const capturedImages = response.data?.captured_image ?? [];

  //     // ✅ Group captured images by stage + camera using CONSISTENT key format
  //     const imagesByStageCamera = {};
  //     capturedImages.forEach(img => {
  //       const key = `${img.stage_name}_${img.camera_label}`;
  //       if (!imagesByStageCamera[key]) imagesByStageCamera[key] = [];
  //       imagesByStageCamera[key].push(img);
  //     });

  //     console.log('📸 Images grouped by stage+camera:', imagesByStageCamera);

  //     const allTestResults = [];
  //     const imageCountByStageCamera = {};
  //     const detectionMessageByStageCamera = {};
  //     const finalStatusByStageCamera = {};
  //     let processedCount = 0;
  //     const totalImages = capturedImages.length;

  //     // ✅ Process images sequentially by stage+camera combination
  //     for (const [key, images] of Object.entries(imagesByStageCamera)) {
  //       const [stageName, cameraLabel] = key.split('_');
  //       imageCountByStageCamera[key] = images.length;

  //       console.log(`\n🔄 Processing ${key} - ${images.length} images`);

  //       for (let i = 0; i < images.length; i++) {
  //         const currentImage = images[i];
  //         processedCount++;

  //         console.log(`  📷 Image ${i + 1}/${images.length} for ${key}`);

  //         // 1️⃣ Find detection result for this specific image
  //         const detectionForThisImage = detectionResults.find(
  //           item =>
  //             item.camera_label === cameraLabel &&
  //             item.stage_name === stageName &&
  //             item.filename === currentImage.filename
  //         );

  //         const detectionMessage =
  //           detectionForThisImage?.detection_result || 'Checking...';

  //         // 2️⃣ Update image index for UI rotation (use camera label as key)
  //         setCameraImageIndex(prev => ({
  //           ...prev,
  //           [cameraLabel]: i
  //         }));

  //         // 3️⃣ Update detection message for UI (DURING processing)
  //         setResMessage(prev => ({
  //           ...prev,
  //           [cameraLabel]: detectionMessage
  //         }));

  //         // ✅ Small delay to let UI update
  //         await new Promise(resolve => setTimeout(resolve, 100));

  //         try {
  //           // Test single image
  //           const finalCheck = await urlSocket.post(
  //             '/api/stage/overall_result_profile_stg_gallery',
  //             {
  //               comp_id: choosen_prof.comp_id,
  //               comp_name: choosen_prof.comp_name,
  //               comp_code: choosen_prof.comp_code,
  //               batch_id: choosen_prof.batch_id,
  //               captured_image: [currentImage],
  //               insp_result_id: response.data?._id,
  //               start_time_with_milliseconds:
  //                 response.data?.start_time_with_milliseconds,
  //               positive: config.positive,
  //               negative: config.negative,
  //               posble_match: config.posble_match,
  //               choosen_prof: JSON.stringify(choosen_prof.stage_profiles),
  //               region_selection: region_selection,
  //               updated_rectangles: response.data?.updated_rectangles || []
  //             }
  //           );

  //           const resultStatus = finalCheck.data[0].status;

  //           allTestResults.push({
  //             camera: cameraLabel,
  //             stage: stageName,
  //             imageIndex: i,
  //             imagePath: currentImage.captured_image,
  //             result: finalCheck.data[0],
  //             timestamp: new Date().toISOString()
  //           });

  //           // ✅ Update with final status for this image
  //           finalStatusByStageCamera[key] = resultStatus;

  //           console.log(
  //             `  ✅ Result for ${key} image ${i + 1}: ${resultStatus}`
  //           );
  //         } catch (error) {
  //           console.error(
  //             `❌ Error testing ${cameraLabel} stage ${stageName} image ${
  //               i + 1
  //             }:`,
  //             error
  //           );

  //           allTestResults.push({
  //             camera: cameraLabel,
  //             stage: stageName,
  //             imageIndex: i,
  //             imagePath: currentImage.captured_image,
  //             result: { status: 'ERROR', error: error.message },
  //             timestamp: new Date().toISOString()
  //           });

  //           finalStatusByStageCamera[key] = 'ERROR';
  //         }

  //         // Delay between images
  //         await new Promise(resolve => setTimeout(resolve, 500));
  //       }
  //     }

  //     // ✅ Now convert to camera-based keys for final display
  //     const finalStatusByCamera = {};
  //     Object.entries(finalStatusByStageCamera).forEach(([key, status]) => {
  //       const [stageName, cameraLabel] = key.split('_');
  //       finalStatusByCamera[cameraLabel] = status;
  //     });

  //     console.log('Final Camera Status:', finalStatusByCamera);

  //     // ✅ Set final results and enable result display
  //     setResMessage(finalStatusByCamera);
  //     setShowstatus(false); // Hide "checking" messages
  //     setShowresult(true); // Show OK/NG results
  //     setOutputRect(true);
  //     setShowStart(true);

  //     // Final status: OK only if all cameras are OK
  //     const finalStatus = Object.values(finalStatusByCamera).every(
  //       r => r === 'OK'
  //     )
  //       ? 'OK'
  //       : 'NG';

  //     console.log(`\n🎯 FINAL STATUS: ${finalStatus}`);

  //     // Update counters
  //     const nextCount = (obj_count ?? 0) + 1;
  //     const reachedTarget = nextCount >= sample_count;

  //     if (reachedTarget) {
  //       const testOpt = await urlSocket.post('/api/stage/test_opt', {
  //         batch_id: choosen_prof.batch_id,
  //         profile_id: choosen_prof._id
  //       });

  //       console.log('testOpt', testOpt);

  //       setRatioData({
  //         profile_Ratio: testOpt.data?.profile_Ratio,
  //         Final_algorithm_acceptance_ratio: testOpt.data?.algo_ratio
  //       });

  //       setShowRatio(true);
  //     }

  //     if (finalStatus === 'OK') {
  //       setOkCount(ok_count + 1);
  //       setCompResult(2);
  //     } else {
  //       setNgCount(ng_count + 1);
  //       setCompResult(1);
  //     }

  //     setObjCount(nextCount);
  //     setTCount(ok_count + ng_count + 1);

  //     Swal.fire({
  //       icon: 'info',
  //       title: 'Test Complete',
  //       html: Object.entries(finalStatusByCamera)
  //         .map(
  //           ([camera, status]) => `<p><strong>${camera}:</strong> ${status}</p>`
  //         )
  //         .join(''),
  //       timer: 3000,
  //       showConfirmButton: false
  //     });
  //   } catch (err) {
  //     console.error('❌ objectDetectionOnly Error:', err);
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Testing Error',
  //       text: err.message || 'An error occurred during testing'
  //     });
  //   }
  // };

  //test2
  const objectDetectionOnly = async () => {
    console.log('📸 Starting OBJECT DETECTION with LOADED IMAGES');

    setResImg(false);
    setRectangles([]);
    setOutputRect(false);
    setResMessage({});
    setRectanglesByCamera({});
    setShowstatus(true);
    setShowresult(false);

    if (!galleryData || galleryData.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No loaded images',
        text: 'Please load images before starting test'
      });
      return;
    }

    if (!sample_count || sample_count <= 0) {
      Swal.fire({
        icon: 'info',
        title: 'Invalid number of test samples',
        text: 'Please set sample count > 0'
      });
      return;
    }

    try {
      const formData = new FormData();
      const now = new Date();
      const today = `${String(now.getDate()).padStart(2, '0')}/${String(
        now.getMonth() + 1
      ).padStart(2, '0')}/${now.getFullYear()}`;
      const testDate = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
      const ms = now.getMilliseconds().toString().padStart(3, '0');

      // Append general info
      formData.append('comp_name', choosen_prof.comp_name);
      formData.append('comp_code', choosen_prof.comp_code);
      formData.append('comp_id', choosen_prof.comp_id);
      formData.append('obj_detect', choosen_prof.detect_selection);
      formData.append('detect_type', config.detection_type);
      formData.append('positive', config.positive);
      formData.append('negative', config.negative);
      formData.append('posble_match', config.posble_match);
      formData.append('inspected_ondate', testDate);
      formData.append('date', today);
      formData.append('time', time);
      formData.append('milliseconds', `${time}.${ms}`);
      formData.append('batch_id', choosen_prof.batch_id);
      formData.append('prof_data', JSON.stringify(choosen_prof.stage_profiles));

      console.log('🖼 Preparing stage-specific images for object detection…');

      // Append images per camera per stage
      cameraList.forEach(cam => {
        const imagesForCamStage = galleryData.filter(
          g =>
            g.camera_label.trim().toLowerCase() ===
              cam.label.trim().toLowerCase() && g.stage_name === cam.stageName
        );

        if (!imagesForCamStage.length) {
          console.warn(
            `No images found for camera: ${cam.label} stage: ${cam.stageName}`
          );
          return;
        }

        imagesForCamStage.forEach(img => {
          const cleanedPath = img.s3_path.replace(/^Vs_inspection\/+/, '');
          const fullUrl = image_url + cleanedPath;

          formData.append('image_urls', fullUrl);
          formData.append('filenames', img.filename);
          formData.append('labels', cam.label);
          formData.append('versions', cam.model_ver);
          formData.append('stage_names', cam.stageName);
          formData.append('stage_codes', cam.stage_code);
          formData.append('stage_ids', cam.stage_id);
        });
      });

      // Send to backend
      const response = await urlSocket.post(
        '/api/stage/obj_detection_profile_multi_gallery',
        formData,
        { headers: { 'content-type': 'multipart/form-data' } }
      );

      console.log('🎯 Detection Response:', response.data);

      const detectionResults = response.data?.detection_result ?? [];
      const capturedImages = response.data?.captured_image ?? [];

      // ✅ Group captured images by stage + camera
      const imagesByStageCamera = {};
      capturedImages.forEach(img => {
        const key = `${img.stage_name}_${img.camera_label}`;
        if (!imagesByStageCamera[key]) imagesByStageCamera[key] = [];
        imagesByStageCamera[key].push(img);
      });

      console.log('📸 Images grouped by stage+camera:', imagesByStageCamera);

      const allTestResults = [];
      const finalStatusByStageCamera = {};

      // ✅ Process images sequentially by stage+camera combination
      for (const [key, images] of Object.entries(imagesByStageCamera)) {
        const [stageName, cameraLabel] = key.split('_');

        console.log(`\n🔄 Processing ${key} - ${images.length} images`);

        for (let i = 0; i < images.length; i++) {
          const currentImage = images[i];

          console.log(`  📷 Image ${i + 1}/${images.length} for ${key}`);

          // 1️⃣ Find detection result for this specific image
          const detectionForThisImage = detectionResults.find(
            item =>
              item.camera_label === cameraLabel &&
              item.stage_name === stageName &&
              item.filename === currentImage.filename
          );

          const detectionMessage =
            detectionForThisImage?.detection_result || 'Checking...';

          // 2️⃣ Update image index for UI rotation - USE STAGE_CAMERA KEY
          setCameraImageIndex(prev => ({
            ...prev,
            [key]: i // ✅ Use full key with stage
          }));

          // 3️⃣ Update detection message for UI - USE STAGE_CAMERA KEY
          setResMessage(prev => ({
            ...prev,
            [key]: detectionMessage // ✅ Use full key with stage
          }));

          // ✅ Small delay to let UI update
          await new Promise(resolve => setTimeout(resolve, 100));

          try {
            // Test single image
            const finalCheck = await urlSocket.post(
              '/api/stage/overall_result_profile_stg_gallery',
              {
                comp_id: choosen_prof.comp_id,
                comp_name: choosen_prof.comp_name,
                comp_code: choosen_prof.comp_code,
                batch_id: choosen_prof.batch_id,
                captured_image: [currentImage],
                insp_result_id: response.data?._id,
                start_time_with_milliseconds:
                  response.data?.start_time_with_milliseconds,
                positive: config.positive,
                negative: config.negative,
                posble_match: config.posble_match,
                choosen_prof: JSON.stringify(choosen_prof.stage_profiles),
                region_selection: region_selection,
                updated_rectangles: response.data?.updated_rectangles || []
              }
            );

            const resultStatus = finalCheck.data[0].status;

            allTestResults.push({
              key: key,
              camera: cameraLabel,
              stage: stageName,
              imageIndex: i,
              imagePath: currentImage.captured_image,
              result: finalCheck.data[0],
              timestamp: new Date().toISOString()
            });

            // ✅ Store status using stage_camera key
            finalStatusByStageCamera[key] = resultStatus;

            console.log(
              `  ✅ Result for ${key} image ${i + 1}: ${resultStatus}`
            );
          } catch (error) {
            console.error(`❌ Error testing ${key} image ${i + 1}:`, error);

            allTestResults.push({
              key: key,
              camera: cameraLabel,
              stage: stageName,
              imageIndex: i,
              imagePath: currentImage.captured_image,
              result: { status: 'ERROR', error: error.message },
              timestamp: new Date().toISOString()
            });

            finalStatusByStageCamera[key] = 'ERROR';
          }

          // Delay between images
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      console.log('Final Stage-Camera Status:', finalStatusByStageCamera);

      // ✅ Set final results with stage_camera keys
      setResMessage(finalStatusByStageCamera);
      setShowstatus(false);
      setShowresult(true);
      setOutputRect(true);
      setShowStart(true);

      // Final status: OK only if ALL stage+camera combinations are OK
      const finalStatus = Object.values(finalStatusByStageCamera).every(
        r => r === 'OK'
      )
        ? 'OK'
        : 'NG';

      console.log(`\n🎯 FINAL STATUS: ${finalStatus}`);

      // Update counters
      const nextCount = (obj_count ?? 0) + 1;
      const reachedTarget = nextCount >= sample_count;

      if (reachedTarget) {
        const testOpt = await urlSocket.post('/api/stage/test_opt', {
          batch_id: choosen_prof.batch_id,
          profile_id: choosen_prof._id
        });

        console.log('testOpt', testOpt);

        setRatioData({
          profile_Ratio: testOpt.data?.profile_Ratio,
          Final_algorithm_acceptance_ratio: testOpt.data?.algo_ratio
        });

        setShowRatio(true);
      }

      if (finalStatus === 'OK') {
        setOkCount(ok_count + 1);
        setCompResult(2);
      } else {
        setNgCount(ng_count + 1);
        setCompResult(1);
      }

      setObjCount(nextCount);
      setTCount(ok_count + ng_count + 1);

      Swal.fire({
        icon: 'info',
        title: 'Test Complete',
        html: Object.entries(finalStatusByStageCamera)
          .map(([key, status]) => `<p><strong>${key}:</strong> ${status}</p>`)
          .join(''),
        timer: 3000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('❌ objectDetectionOnly Error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Testing Error',
        text: err.message || 'An error occurred during testing'
      });
    }
  };

  const find_qrbarcode = async () => {
    const { choosen_prof: choosenProf } = { choosen_prof };
    const { compData, inspection_type: inspectionType } = {
      compData: component_data,
      inspection_type
    };
    setShowstatus(true);
    setResMessage('Detecting Barcode');
    setQrbarFound(0);
    setQrbarResult(0);
    setCompFound(0);
    setCompResult(0);
    setShowresult(false);
    setQrbarShowStart(false);
    // Wait for 1 second using a promise
    await new Promise(resolve => setTimeout(resolve, 1500));
    const imageSrc = await webcamRef.current.captureZoomedImage();
    const blob = await fetch(imageSrc).then(res => res.blob());
    const formData = new FormData();
    let component_code = choosenProf.comp_name;
    let component_name = choosenProf.comp_code;
    let today = new Date();
    let yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();
    let _today = dd + '/' + mm + '/' + yyyy;
    let test_date = yyyy + '-' + mm + '-' + dd;
    let hours = today.getHours();
    let min = today.getMinutes();
    let secc = today.getSeconds();
    let time = hours + ':' + min + ':' + secc;
    let milliseconds =
      hours +
      ':' +
      min +
      ':' +
      secc +
      '.' +
      today.getMilliseconds().toString().padStart(3, '0').slice(0, 5);
    let replace = _today + '_' + time.replaceAll(':', '_');
    let compdata = component_name + '_' + component_code + '_' + replace;
    formData.append('comp_id', choosenProf.comp_id);
    formData.append('datasets', blob, compdata + '.png');
    try {
      const response = await urlSocket.post('/barcode_compare', formData, {
        headers: {
          'content-type': 'multipart/form-data'
        },
        mode: 'no-cors'
      });
      console.log('barcode_detection: ', response.data);
      let code_data = response.data.result;
      if (code_data === 'Barcode is correct') {
        setResMessage(code_data);
        setQrbarFound(2);
        setTimeout(() => {
          setQrbarResult(2);
          setShowStart(true);
        }, 1000);
      } else if (code_data === 'Barcode is incorrect') {
        if (
          choosenProf.qrbar_check_type === null ||
          choosenProf.qrbar_check_type === undefined ||
          parseInt(choosenProf.qrbar_check_type) === 1
        ) {
          setResMessage(code_data);
          setQrbarFound(2);
          setTimeout(() => {
            setQrbarResult(1);
            setShowStart(true);
          }, 1000);
        } else if (parseInt(choosenProf.qrbar_check_type) === 0) {
          setResMessage(code_data);
          setQrbarFound(2);
          setQrbarResult(1);
          setQrbarShowStart(true);
        }
      } else if (code_data === 'Unable to read Barcode') {
        setResMessage(code_data);
        setQrbarFound(1);
        setQrbarShowStart(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // object_detected function (Note: This seems to have some undefined variables like component_code1, positive, etc. - assuming they are from state or props)
  const object_detected = async event => {
    const { resultKey, compData } = {
      resultKey: result_key,
      compData: component_data
    };
    setPlaceobjCount(prev => prev + 1); // to hide the Result at the starting
    // clearInterval(intervalId) - assuming intervalId is managed elsewhere
    setShow(false);
    setMsg(false);
    setShowNext(false);
    setShowplaceobject(false);
    setShowresult(false);
    setShowstatus(false);
    const imageSrc = await webcamRef.current.captureZoomedImage();
    const blob = await fetch(imageSrc).then(res => res.blob());
    const formData = new FormData();
    let component_code = component_code1; // Undefined - adjust as needed
    let component_name = component_name1; // Undefined - adjust as needed
    let vpositive = positive; // Undefined - adjust as needed
    let vnegative = negative; // Undefined - adjust as needed
    let vposble_match = posble_match; // Undefined - adjust as needed
    let today = new Date();
    let yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();
    let _today = dd + '/' + mm + '/' + yyyy;
    let test_date = yyyy + '-' + mm + '-' + dd;
    let hours = today.getHours();
    let min = today.getMinutes();
    let secc = today.getSeconds();
    let time = hours + ':' + min + ':' + secc;
    let milliseconds =
      hours +
      ':' +
      min +
      ':' +
      secc +
      '.' +
      today.getMilliseconds().toString().padStart(3, '0').slice(0, 5);
    console.log('time', time);
    let replace = _today + '_' + time.replaceAll(':', '_');
    let compdata = component_name + '_' + component_code + '_' + replace;
    formData.append('comp_name', component_name);
    formData.append('comp_code', component_code);
    formData.append('comp_id', comp_id); // Assuming comp_id from state
    formData.append('positive', vpositive);
    formData.append('negative', vnegative);
    formData.append('posble_match', vposble_match);
    formData.append('datasets', blob, compdata + '.png');
    formData.append('station_name', station_name);
    formData.append('station_id', station_id);
    formData.append('inspected_ondate', test_date);
    formData.append('date', _today);
    formData.append('time', time);
    formData.append('milliseconds', milliseconds);
    formData.append('batch_id', batch_id); // Assuming batch_id from state
    formData.append('detect_type', compData.detection_type);
    formData.append('qrbar_result', qrbar_result);
    console.log('data915 ', barcode_data);
    const compBarcode = barcode_data === null || barcode_data === undefined;
    try {
      const response = await urlSocket.post('/objectDetectionOnly', formData, {
        headers: {
          'content-type': 'multipart/form-data'
        },
        mode: 'no-cors'
      });
      console.log(`success`, response.data);
      setResMessage(response.data[0].detection_result);
      setShowstatus(true);
      setCompFound(
        response.data[0].detection_result === 'Object Detected' ? 2 : 1
      );
      setTimeout(() => {
        if (response.data[0].detection_result === 'Object Detected') {
          let Checking = 'Checking ...';
          setResMessage(Checking);
          setShowstatus(true);
          // after object detection
          urlSocket
            .post(
              '/inspectionResult',
              {
                comp_name: component_name,
                comp_code: component_code,
                batch_id: batch_id, // Assuming batch_id
                captured_image: response.data[0].captured_image,
                insp_result_id: response.data[0].insp_result_id,
                start_time_with_milliseconds:
                  response.data[0].start_time_with_milliseconds,
                positive: positive, // Assuming positive from state
                negative: negative, // Assuming negative from state
                posble_match: posble_match // Assuming posble_match from state
              },
              { mode: 'no-cors' }
            )
            .then(detection => {
              setShowstatus(false);
              setCompFound(2);
              if (compBarcode) {
                setShowNext(true);
                setShow(true);
              }
              let testing_result = detection.data[0].status;
              console.log('response >>> ', response);
              console.log('testing_result', testing_result);
              if (testing_result === positive) {
                // Assuming positive
                let positive_ = testing_result.replaceAll(
                  testing_result,
                  config_positive
                ); // Assuming config_positive
                let okCount_ = ok_count + 1;
                let old_ok_ = old_ok + 1; // Assuming old_ok managed elsewhere
                let old_total_ = old_total + 1; // Assuming old_total
                let tCount_ = okCount_ + ng_count + ps_match; // Assuming ps_match
                setResponseMessage(positive_);
                setResponseValue(detection.data[0].value);
                setShowresult(true);
                setOkCount(okCount_);
                setTCount(tCount_);
                // set old_ok, old_total, etc. if managed
                setResultKey(true);
                setCompResult(2);
                if (compBarcode === false) {
                  setQrbarStartBtn(true);
                }
              } else if (testing_result === negative) {
                // Assuming negative
                console.log(
                  'response.data.value <<< >>> ',
                  response.data.value
                );
                let negative_ = testing_result.replaceAll(
                  testing_result,
                  config_negative
                ); // Assuming config_negative
                let ngCount_ = ng_count + 1;
                let old_ng_ = old_ng + 1; // Assuming old_ng
                let old_total_ = old_total + 1;
                let tCount_ = ok_count + ngCount_ + ps_match;
                setResponseMessage(negative_);
                setResponseValue(detection.data[0].value);
                setShowresult(true);
                setNgCount(ngCount_);
                setTCount(tCount_);
                // set old_ng, old_total, etc.
                setResultKey(true);
                setCompResult(1);
                if (compBarcode === false) {
                  setQrbarStartBtn(true);
                }
              } else if (testing_result === posble_match) {
                // Assuming posble_match
                let posble_match_ = testing_result.replaceAll(
                  testing_result,
                  config_posble_match
                ); // Assuming config_posble_match
                console.log('posbl_match563', posble_match_);
                let ps_match_ = ps_match + 1; // Assuming ps_match
                let old_pm_ = old_pm + 1; // Assuming old_pm
                let old_total_ = old_total + 1;
                let tCount_ = ok_count + ng_count + ps_match_;
                setResponseMessage(posble_match_);
                setResponseValue(detection.data[0].value);
                setShowresult(true);
                // set ps_match, t_count, old_pm, old_total
                setResultKey(true);
              }
              // cont_apiCall() - assuming defined elsewhere
            });
        } else {
          if (compBarcode) {
            // cont_apiCall();
          } else {
            setShow(true);
            setCompFound(1);
          }
        }
      }, 300); // Object detected time
    } catch (error) {
      console.log('error', error);
    }
  };

  // toggle function
  const toggle = () => {
    const { page_info: pageInfo } = { page_info };
    setShowRatio(prev => !prev);
    history.push(pageInfo);
  };

  // abort function
  const abort = () => {
    const { page_info: pageInfo, choosen_prof: choosenProf } = {
      page_info,
      choosen_prof
    };
    console.log('back is working:', pageInfo, choosenProf);
    Swal.fire({
      title: 'Abort - User Request',
      text: 'This will stop the testing process',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      cancelButtonColor: '#28a745',
      confirmButtonText: 'OK',
      confirmButtonColor: '#007bff'
    }).then(result => {
      if (result.isConfirmed) {
        console.log('Testing process aborted');
        urlSocket
          .post(
            '/abortProfileTest',
            {
              batch_id: batch_id
            },
            { mode: 'no-cors' }
          )
          .then(async abortdata => {
            console.log('579abortdata : ', abortdata);
          });
        history.push(pageInfo);
      } else {
        console.log('User canceled');
      }
    });
  };

  // navigate function
  const navigate = async () => {
    const { page_info: pageInfo, choosen_prof: choosenProf } = {
      page_info,
      choosen_prof
    };
    console.log('page_info, choosen_prof ', page_info, choosen_prof);
    try {
      const response = await urlSocket.post(
        '/getCompUpdatedProfile',
        { comp_id: choosenProf.comp_id },
        { mode: 'no-cors' }
      );
      console.log('628response', response, choosenProf);
      let updateChoosenProf = {};
      if (response.data.length > 0) {
        let profileData = response.data.filter(
          data_ => data_._id === choosenProf._id
        );
        console.log('profileData634', profileData);
        updateChoosenProf.profData = response.data;
      }
      console.log('636updateChoosenProf', updateChoosenProf);
      sessionStorage.setItem(
        'updatedProfile',
        JSON.stringify(updateChoosenProf)
      );
      history.push(pageInfo);
    } catch (error) {
      console.log('error', error);
    }
  };

  // pauseCountdown, resumeCountdown - assuming defined elsewhere
  const pauseCountdown = () => {
    // Implementation
  };

  const resumeCountdown = () => {
    // Implementation
  };

  // uniq_btnidentity, uniq_identification - assuming defined elsewhere
  const uniq_btnidentity = () => {
    // Implementation
  };

  const uniq_identification = () => {
    // Implementation
  };

  // cont_apiCall - assuming defined elsewhere
  const cont_apiCall = () => {
    // Implementation
  };

  // checkWebcam function
  // const checkWebcam = async () => {
  //     try {
  //         const devices = await navigator.mediaDevices.enumerateDevices();
  //         const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
  //         if (!videoInputDevices.length) {
  //             setCameraDisconnected(true);
  //         } else {
  //             setCameraDisconnected(false);
  //         }
  //     } catch (error) {
  //         console.error('Error checking devices:', error);
  //     }
  // };

  const checkWebcam = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputDevices = devices.filter(
        device => device.kind === 'videoinput'
      );

      if (!videoInputDevices.length) {
        setCameraDisconnected(true);
      } else {
        console.log('Available Cameras: ', videoInputDevices);

        const newAvailableCameras = videoInputDevices.map((camera, index) => {
          const portInfo = extractPortInfo(camera.label);
          const generatedPort = generatePortNumber(index, camera.deviceId);

          return {
            deviceId: camera.deviceId,
            label: camera.label,
            camIndex: index,
            pos_no: index,
            id: index + 1,
            title: camera.label,
            positionName: `Position${index + 1}`,
            originalDeviceId: camera.deviceId,
            groupId: camera.groupId,
            v_id: portInfo.v_id,
            p_id: portInfo.p_id,
            portNumber: portInfo.portNumber || generatedPort,
            customPort: false
          };
        });

        console.log('Available cameras with full data:', newAvailableCameras);
        setPysclCameraList(newAvailableCameras);
        setNewAvailableCameras(newAvailableCameras);
        setCameraDisconnected(false);
      }
    } catch (error) {
      console.log('Error Info: ', error);
    }
  }, []);

  const generatePortNumber = (camIndex, deviceId) => {
    const basePort = 8000;
    const indexPort = camIndex !== undefined ? camIndex : 0;
    const deviceHash = deviceId ? deviceId.slice(-4) : '0000';
    const hashNumber = parseInt(deviceHash, 16) % 1000;
    return (basePort + indexPort * 10 + (hashNumber % 10)).toString();
  };

  const extractPortInfo = label => {
    let v_id = '',
      p_id = '',
      portNumber = '';

    if (label && label.includes('(') && label.includes(')')) {
      const portInfo = label.slice(label.indexOf('(') + 1, label.indexOf(')'));
      const parts = portInfo.split(':');
      v_id = parts[0] || '';
      p_id = parts[1] || '';

      const portMatch = portInfo.match(/port[:\s]*(\d+)|(\d{4,})/i);
      if (portMatch) {
        portNumber = portMatch[1] || portMatch[2];
      }
    }

    return { v_id, p_id, portNumber };
  };

  // handleBeforeUnload function
  const handleBeforeUnload = e => {
    e.preventDefault();
    e.returnValue = '';
    const message = 'Are you sure you want to leave?';
    return message;
  };

  // handlePopState function
  const handlePopState = e => {
    const { gotoPage: gotoPage_ } = { gotoPage };
    window.history.pushState(null, null, window.location.pathname);
    if (window.confirm('Are you sure you want to go back?')) {
      abort();
    } else {
      window.history.pushState(null, null, window.location.pathname);
    }
  };

  // const uniqueCameras = cameraList.filter(
  //     (cam, index, self) =>
  //         index === self.findIndex((c) => c.originalLabel === cam.originalLabel)
  // );
  const uniqueCameras = cameraList.filter(
    (cam, index, self) =>
      index ===
      self.findIndex(
        c =>
          c.stageName === cam.stageName && c.originalLabel === cam.originalLabel
      )
  );
  console.log('uniqueCameras', uniqueCameras);

  const groupImagesByCamera = data => {
    const map = {};
    data.forEach(img => {
      if (!map[img.camera_label]) map[img.camera_label] = [];
      map[img.camera_label].push(img);
    });
    return map;
  };

  // const handleStartClick = () => {
  //   if (show_start) {
  //     objectDetectionOnly();
  //   } else if (qrbar_show_start) {
  //     find_qrbarcode();
  //   } else if (qr_checking) {
  //     if (qruniq_checking) {
  //       uniq_btnidentity();
  //     } else {
  //       uniq_identification();
  //     }
  //   } else {
  //     object_detected();
  //   }
  // };

  const [isRunning, setIsRunning] = useState(false);

  const handleStartClick = async () => {
    if (show_start) {
      setIsRunning(true); // Hide/disable button
      try {
        await objectDetectionOnly(); // assuming this can be async
      } catch (err) {
        console.error(err);
      }
      setIsRunning(false); // Show button again after completion
    } else if (qrbar_show_start) {
      find_qrbarcode();
    } else if (qr_checking) {
      if (qruniq_checking) {
        uniq_btnidentity();
      } else {
        uniq_identification();
      }
    } else {
      object_detected();
    }
  };

  // Determine the message to show
  const getStartMessage = () => {
    if (show_start || showplaceobject || show_next) {
      return placeobj_count > 0
        ? 'Place the next object and press'
        : 'Place the object and press';
    } else if (qrbar_show_start) {
      return placeobj_count > 0
        ? 'Place QR/Barcode and press'
        : 'Place QR/Barcode and press';
    }
    return 'Place the object and press';
  };

  // Check if we should show the start button
  const shouldShowStartButton =
    inspection_type === 'Manual' &&
    (show_start || qrbar_show_start || showplaceobject || show_next);

  const generateStageColors = cameras => {
    const stages = [...new Set(cameras.map(cam => cam.stageName || 'Unknown'))];
    const colors = [
      '#e91e63', // Pink
      '#4caf50', // Green

      '#cddc39', // Lime

      '#9c27b0', // Purple
      '#3f51b5', // Indigo

      '#ff9800', // Orange
      '#2196f3', // Blue
      '#f44336', // Red
      '#00bcd4', // Cyan
      '#ff5722', // Deep Orange
      '#673ab7', // Deep Purple
      '#009688', // Teal

      '#ffc107', // Amber
      '#8bc34a', // Light Green
      '#795548' // Brown
    ];

    const stageColors = {};
    stages.forEach((stage, index) => {
      stageColors[stage] = colors[index % colors.length];
    });

    return stageColors;
  };

  // Generate colors dynamically
  const stageColors = generateStageColors(uniqueCameras);

  // Function to get color for a stage
  const getStageColor = stageName => {
    return stageColors[stageName] || '#1976d2';
  };

  // Group cameras by stage name
  // const groupedCameras = uniqueCameras.reduce((acc, camera) => {
  //     const stage = camera.stageName || "Unknown";
  //     if (!acc[stage]) {
  //         acc[stage] = [];
  //     }
  //     acc[stage].push(camera);
  //     return acc;
  // }, {});

  const groupedCameras = uniqueCameras.reduce((acc, camera) => {
    const stage = camera.stageName || 'Unknown';
    if (!acc[stage]) {
      acc[stage] = [];
    }
    acc[stage].push(camera);
    return acc;
  }, {});

  //   const getImageForCamera = label => {
  //     console.log('whatisthelabel', label);
  //     if (!galleryData) return null;

  //     const match = galleryData.find(img => img.camera_label === label);

  //     console.log('match', match);
  //     return match ? match.s3_path : null;
  //   };

  // const [cameraImageIndex, setCameraImageIndex] = useState({});

  //   const getImageForCamera = label => {
  //     if (!galleryData) return null;

  //     const match = galleryData.find(img => img.camera_label === label);

  //     return match ? showImage(match.s3_path) : null;
  //   };
  const [cameraImageIndex, setCameraImageIndex] = useState({});

  // const getImageForCamera = label => {
  //   if (!galleryData) return null;

  //   const imagesForCamera = galleryData.filter(
  //     img => img.camera_label === label
  //   );
  //   if (imagesForCamera.length === 0) return null;

  //   const index = cameraImageIndex[label] ?? 0; // default to first image
  //   return showImage(imagesForCamera[index].s3_path);
  // };

  // const getImageForCamera = (label, stageName) => {
  //   console.log('getstagenamebycamera', stageName);
  //   if (!galleryData || galleryData.length === 0) return null;

  //   // Filter images for this camera and stage
  //   const imagesForCamera = galleryData.filter(
  //     img => img.camera_label === label && img.stage_name === stageName
  //   );

  //   if (imagesForCamera.length === 0) return null;

  //   // Use a stage-specific index so multiple stages don't mix
  //   // const index = cameraImageIndex[`${stageName}_${label}`] ?? 0;
  //   const index = cameraImageIndex[label] ?? 0;
  //   const image = imagesForCamera[index];
  //   console.log('imagefile', image);

  //   if (!image || !image.s3_path) return null;

  //   return showImage(image.s3_path);
  // };

  const getImageForCamera = (label, stageName) => {
    console.log('getstagenamebycamera', stageName);
    if (!galleryData || galleryData.length === 0) return null;

    // Filter images for this camera and stage
    const imagesForCamera = galleryData.filter(
      img => img.camera_label === label && img.stage_name === stageName
    );

    if (imagesForCamera.length === 0) return null;

    // ✅ Use stage_camera key consistently
    const key = `${stageName}_${label}`;
    const index = cameraImageIndex[key] ?? 0;
    const image = imagesForCamera[index];
    console.log('imagefile', image);

    if (!image || !image.s3_path) return null;

    return showImage(image.s3_path);
  };

  return (
    <div className='page-content'>
      <Row className='mb-3'>
        <Col xs={9}>
          <div className='d-flex align-items-center justify-content-between'>
            <div className='mb-0 mt-2 m-2 font-size-14 fw-bold'>
              PROFILE TESTING
            </div>
          </div>
        </Col>
        <Col xs={3} className='d-flex align-items-center justify-content-end'>
          <button
            className='btn btn-primary btn-sm me-2 w-md'
            color='primary'
            onClick={abort}
          >
            ABORT
          </button>
        </Col>
      </Row>
      {console.log('stageName', stageName)}
      <Container fluid>
        <Card>
          <CardBody>
            {choosen_prof && (
              <Table striped bordered>
                <thead>
                  <tr>
                    <th>Component Name</th>
                    <th>Stage Name</th>
                    <th>Profile Name</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{choosen_prof.comp_name}</td>
                    <td>{stageName.join(', ')}</td>

                    <td>{choosen_prof.profile_name}</td>
                  </tr>
                </tbody>
              </Table>
            )}

            <Row>
              <div className='ms-3 d-flex align-items-start justify-content-start'>
                <div>
                  <p style={{ fontWeight: 'bold' }} className='me-3'>
                    No. of Test Samples :
                  </p>
                  <InputNumber
                    min={0}
                    value={sample_count}
                    onChange={handleSampleCountChange}
                    disabled={set_values}
                  />
                </div>
                <div className='ms-auto me-3'>
                  <p style={{ fontWeight: 'bold' }} className='me-3'>
                    Sample Completed: {obj_count} / {sample_count}
                  </p>
                </div>
              </div>
            </Row>
            {qrbar && (
              <Row>
                <Col>
                  <Card className='mb-3'>
                    <CardBody>
                      <h5 className=''>
                        Barcode Found:
                        {qrbar_found === 0 ? (
                          <ExclamationCircleOutlined
                            className={`ms-3 ${qrbar_found === 0 && 'zoom-in'}`}
                            style={{ color: 'deepskyblue', fontSize: '1.5rem' }}
                          />
                        ) : qrbar_found === 1 ? (
                          <CloseCircleOutlined
                            className={`ms-3 ${qrbar_found === 1 && 'zoom-in'}`}
                            style={{ color: 'red', fontSize: '1.5rem' }}
                          />
                        ) : (
                          qrbar_found === 2 && (
                            <CheckCircleOutlined
                              className={`ms-3 ${
                                qrbar_found === 2 && 'zoom-in'
                              }`}
                              style={{ color: 'green', fontSize: '1.5rem' }}
                            />
                          )
                        )}
                        <span className='ms-3'></span>
                        Barcode Result:
                        {qrbar_result === 0 ? (
                          <ExclamationCircleOutlined
                            className={`ms-3 ${
                              qrbar_result === 0 && 'zoom-in'
                            }`}
                            style={{ color: 'deepskyblue', fontSize: '1.5rem' }}
                          />
                        ) : qrbar_result === 1 ? (
                          <CloseCircleOutlined
                            className={`ms-3 ${
                              qrbar_result === 1 && 'zoom-in'
                            }`}
                            style={{ color: 'red', fontSize: '1.5rem' }}
                          />
                        ) : (
                          qrbar_result === 2 && (
                            <CheckCircleOutlined
                              className={`ms-3 ${
                                qrbar_result === 2 && 'zoom-in'
                              }`}
                              style={{ color: 'green', fontSize: '1.5rem' }}
                            />
                          )
                        )}
                        {choosen_prof.detect_selection == true && (
                          <>
                            <span className='ms-3'></span>
                            Component Found:
                            {comp_found === 0 ? (
                              <ExclamationCircleOutlined
                                className={`ms-3 ${
                                  comp_found === 0 && 'zoom-in'
                                }`}
                                style={{
                                  color: 'deepskyblue',
                                  fontSize: '1.5rem'
                                }}
                              />
                            ) : comp_found === 1 ? (
                              <CloseCircleOutlined
                                className={`ms-3 ${
                                  comp_found === 1 && 'zoom-in'
                                }`}
                                style={{ color: 'red', fontSize: '1.5rem' }}
                              />
                            ) : (
                              comp_found === 2 && (
                                <CheckCircleOutlined
                                  className={`ms-3 ${
                                    comp_found === 2 && 'zoom-in'
                                  }`}
                                  style={{ color: 'green', fontSize: '1.5rem' }}
                                />
                              )
                            )}
                          </>
                        )}
                        <span className='ms-3'></span>
                        Component Result:
                        {comp_result === 0 ? (
                          <ExclamationCircleOutlined
                            className={`ms-3 ${comp_result === 0 && 'zoom-in'}`}
                            style={{ color: 'deepskyblue', fontSize: '1.5rem' }}
                          />
                        ) : comp_result === 1 ? (
                          <CloseCircleOutlined
                            className={`ms-3 ${comp_result === 1 && 'zoom-in'}`}
                            style={{ color: 'red', fontSize: '1.5rem' }}
                          />
                        ) : (
                          comp_result === 2 && (
                            <CheckCircleOutlined
                              className={`ms-3 ${
                                comp_result === 2 && 'zoom-in'
                              }`}
                              style={{ color: 'green', fontSize: '1.5rem' }}
                            />
                          )
                        )}
                      </h5>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            )}

            <div>
              {/* Global Start Button - Shown once at the top */}
              {shouldShowStartButton && !isRunning && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '20px 20px 10px 20px'
                  }}
                >
                  <div
                    style={{
                      backgroundColor: '#ffffff',
                      padding: '16px 24px',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '16px',
                      border: '2px solid #1976d2'
                    }}
                  >
                    <h4
                      style={{
                        fontWeight: '600',
                        margin: 0,
                        color: '#333'
                      }}
                    >
                      {getStartMessage()}
                    </h4>
                    <Button
                      color='primary'
                      size='lg'
                      onClick={handleStartClick}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Start
                    </Button>
                  </div>
                </div>
              )}

              <div style={{ padding: '20px' }}>
                {Object.entries(groupedCameras).map(([stageName, cameras]) => (
                  <div key={stageName} style={{ marginBottom: '24px' }}>
                    {/* Stage Header */}
                    <div
                      style={{
                        padding: '10px 16px',
                        backgroundColor: getStageColor(stageName),
                        color: '#fff',
                        borderRadius: '8px 8px 0 0',
                        fontSize: '15px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      {stageName}
                      <span
                        style={{
                          marginLeft: '10px',
                          fontSize: '13px',
                          fontWeight: '400',
                          opacity: 0.9
                        }}
                      >
                        ({cameras.length} camera
                        {cameras.length !== 1 ? 's' : ''})
                      </span>
                    </div>

                    {/* Cameras Grid - 2 cameras per row */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '16px',
                        border: `2px solid ${getStageColor(stageName)}`,
                        borderTop: 'none',
                        borderRadius: '0 0 8px 8px',
                        padding: '16px',
                        backgroundColor: '#fafafa'
                      }}
                    >
                      {/* {cameras.map(camera => (
                        <div
                          key={`${stageName}-${camera.originalLabel}`}
                          style={{
                            display: 'flex',
                            gap: '12px',
                            border: `2px solid ${getStageColor(stageName)}`,
                            padding: '12px',
                            borderRadius: '8px',
                            backgroundColor: '#ffffff',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                            minHeight: '350px'
                          }}
                        >
                          <div
                            style={{
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              minWidth: 0
                            }}
                          >
                            <div
                              style={{
                                padding: '8px',
                                backgroundColor: '#f5f5f5',
                                borderRadius: '6px',
                                textAlign: 'center',
                                marginBottom: '10px',
                                borderLeft: `3px solid ${getStageColor(
                                  stageName
                                )}`
                              }}
                            >
                              <div
                                style={{
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  color: '#333'
                                }}
                              >
                                REFERENCE
                              </div>
                              <div
                                style={{
                                  fontSize: '11px',
                                  color: '#666',
                                  marginTop: '2px'
                                }}
                              >
                                {camera.label}
                              </div>
                            </div>

                            <div
                              style={{
                                flex: 1,
                                position: 'relative',
                                width: '100%',
                                paddingBottom: '75%',
                                backgroundColor: '#fafafa',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                border: '1px solid #e0e0e0'
                              }}
                            >
                              {getReferenceImageForCamera(
                                camera.label,
                                camera.model_ver,
                                ref_img_path
                              ) ? (
                                <img
                                  src={getReferenceImageForCamera(
                                    camera.label,
                                    camera.model_ver,
                                    ref_img_path
                                  )}
                                  alt={`Reference for ${camera.label}`}
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#999',
                                    fontSize: '12px'
                                  }}
                                >
                                  No reference image
                                </div>
                              )}
                            </div>
                          </div>

                          <div
                            style={{
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              minWidth: 0
                            }}
                          >
                           
                            <div
                              style={{
                                padding: '8px',
                                backgroundColor: `${getStageColor(
                                  stageName
                                )}15`,
                                borderRadius: '6px',
                                textAlign: 'center',
                                marginBottom: '10px',
                                borderLeft: `3px solid ${getStageColor(
                                  stageName
                                )}`
                              }}
                            >
                              <div
                                style={{
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  color: getStageColor(stageName)
                                }}
                              >
                                IMAGES
                                {cameraImageIndex[camera.label] !==
                                  undefined && (
                                  <span
                                    style={{
                                      marginLeft: '8px',
                                      fontSize: '11px',
                                      fontWeight: '400'
                                    }}
                                  >
                                    - Image (
                                    {cameraImageIndex[camera.label] + 1} /{' '}
                                    {
                                      galleryData.filter(
                                        img => img.camera_label === camera.label
                                      ).length
                                    }
                                    )
                                  </span>
                                )}
                              </div>
                              <div
                                style={{
                                  fontSize: '11px',
                                  color: '#666',
                                  marginTop: '2px'
                                }}
                              >
                                {camera.label}
                              </div>
                            </div>

                            <div
                              style={{
                                flex: 1,
                                position: 'relative',
                                width: '100%',
                                paddingBottom: '75%',
                                backgroundColor: '#000',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                border:
                                  showresult &&
                                  response_message &&
                                  response_message[camera.label]
                                    ? response_message[camera.label] === 'OK' ||
                                      response_message[camera.label] ===
                                        config?.positive
                                      ? '6px solid #52c41a'
                                      : response_message[camera.label] ===
                                          'NG' ||
                                        response_message[camera.label] ===
                                          config?.negative
                                      ? '6px solid #ff4d4f'
                                      : `2px solid ${getStageColor(stageName)}`
                                    : `2px solid ${getStageColor(stageName)}`
                              }}
                            >
                              <div
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%'
                                }}
                              >
                                {cameraDisconnected &&
                                cameraDisconnected[camera.originalLabel] ? (
                                  <div
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      backgroundColor:
                                        'rgba(255, 255, 255, 0.95)',
                                      padding: '16px'
                                    }}
                                  >
                                    <div style={{ textAlign: 'center' }}>
                                      <h6
                                        style={{
                                          fontWeight: '600',
                                          marginBottom: '12px',
                                          fontSize: '14px'
                                        }}
                                      >
                                        Webcam Disconnected
                                      </h6>
                                      <Spinner color='primary' />
                                      <div
                                        style={{
                                          fontSize: '12px',
                                          marginTop: '12px'
                                        }}
                                      >
                                        Please check connection...
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div
                                      style={{
                                        position: 'relative',
                                        width: '100%',
                                        height: '100%'
                                      }}
                                    >
                                      {getImageForCamera(
                                        camera.label,
                                        stageName
                                      ) ? (
                                        <img
                                          src={getImageForCamera(
                                            camera.label,
                                            stageName
                                          )}
                                          alt={camera.label}
                                          style={{
                                            position: 'absolute',
                                            top: 0,
                                            
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            zIndex: 1
                                          }}
                                        />
                                      ) : (
                                        <div
                                          style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#aaa',
                                            fontSize: '13px'
                                          }}
                                        >
                                          No Image Available
                                        </div>
                                      )}

                                    </div>

                                    <div
                                      style={{
                                        position: 'absolute',
                                        top: '10%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        zIndex: 4,
                                        textAlign: 'center',
                                        width: '90%'
                                      }}
                                    >
                                      {show && msg && (
                                        <div
                                          style={{
                                            color: '#fff',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            textShadow:
                                              '2px 2px 4px rgba(0,0,0,0.8)',
                                            marginBottom: '8px'
                                          }}
                                        >
                                          {msg}
                                        </div>
                                      )}

                                      {!showresult &&
                                        showstatus &&
                                        res_message &&
                                        res_message[camera.label] && (
                                          <div
                                            style={{
                                              color:
                                                res_message[camera.label] ===
                                                'Object Detected'
                                                  ? '#52c41a'
                                                  : res_message[
                                                      camera.label
                                                    ] === 'Barcode is correct'
                                                  ? '#52c41a'
                                                  : res_message[
                                                      camera.label
                                                    ] === 'No Object Detected'
                                                  ? '#fadb14'
                                                  : res_message[
                                                      camera.label
                                                    ] === 'Incorrect Object'
                                                  ? '#ff4d4f'
                                                  : res_message[
                                                      camera.label
                                                    ] === 'Barcode is incorrect'
                                                  ? '#ff4d4f'
                                                  : res_message[
                                                      camera.label
                                                    ] ===
                                                    'Unable to read Barcode'
                                                  ? '#ffffff'
                                                  : res_message[
                                                      camera.label
                                                    ] === 'Checking ...'
                                                  ? '#fffb8f'
                                                  : '#ffffff',
                                              fontSize: '16px',
                                              fontWeight: 'bold',
                                              textShadow:
                                                '2px 2px 4px rgba(0,0,0,0.8)',
                                              marginBottom: '8px',
                                              padding: '8px 12px',
                                              // backgroundColor:
                                              //   'rgba(0, 0, 0, 0.7)',
                                              borderRadius: '6px',
                                              display: 'inline-block'
                                            }}
                                          >
                                            {res_message[camera.label]}
                                          </div>
                                        )}

                                      {console.log(
                                        'showstatus && res_message && res_message[camera.label]',
                                        showstatus,
                                        showresult,
                                        res_message,
                                        res_message[camera.label],
                                        config
                                      )}
                                      {showresult &&
                                        res_message &&
                                        res_message[camera.label] && (
                                          <div
                                            style={{
                                              display: 'flex',
                                              flexDirection: 'column',
                                              alignItems: 'left',
                                              gap: '8px'
                                            }}
                                          >
                                            <span
                                             

                                              style={{
                                                fontWeight: 'bold',
                                                color:
                                                  res_message[camera.label] ===
                                                    'OK' ||
                                                  res_message[camera.label] ===
                                                    config[0]?.positive
                                                    ? '#52c41a' 
                                                    : res_message[
                                                        camera.label
                                                      ] === 'NG' ||
                                                      res_message[
                                                        camera.label
                                                      ] === config[0]?.negative
                                                    ? '#ff4d4f' 
                                                    : '#fff',
                                                textShadow:
                                                  '2px 2px 4px rgba(0,0,0,0.8)',
                                                fontSize: '15px',
                                                
                                                borderRadius: '6px'
                                              }}
                                              className='mt-5'
                                            >
                                              Result:{' '}
                                              {res_message[camera.label]}
                                            </span>

                                            {(res_message[camera.label] ===
                                              'OK' ||
                                              res_message[camera.label] ===
                                                config[0].positive) && (
                                              <CheckCircleOutlined
                                                style={{
                                                  fontSize: '60px',
                                                  color: '#52c41a',
                                                  filter:
                                                    'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
                                                }}
                                              />
                                            )}

                                            {(res_message[camera.label] ===
                                              'NG' ||
                                              res_message[camera.label] ===
                                                config[0].negative) && (
                                              <CloseCircleOutlined
                                                style={{
                                                  fontSize: '60px',
                                                  color: '#bf171aff',
                                                  filter:
                                                    'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
                                                }}
                                              />
                                            )}
                                          </div>
                                        )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))} */}
                      {cameras.map(camera => {
                        const cameraKey = `${stageName}_${camera.label}`;
                        // const cameraKey = camera.label;

                        return (
                          <div
                            key={`${stageName}-${camera.originalLabel}`}
                            style={{
                              display: 'flex',
                              gap: '12px',
                              border: `2px solid ${getStageColor(stageName)}`,
                              padding: '12px',
                              borderRadius: '8px',
                              backgroundColor: '#ffffff',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                              minHeight: '350px'
                            }}
                          >
                            {/* Reference Image Column */}
                            <div
                              style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                minWidth: 0
                              }}
                            >
                              <div
                                style={{
                                  padding: '8px',
                                  backgroundColor: '#f5f5f5',
                                  borderRadius: '6px',
                                  textAlign: 'center',
                                  marginBottom: '10px',
                                  borderLeft: `3px solid ${getStageColor(
                                    stageName
                                  )}`
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#333'
                                  }}
                                >
                                  REFERENCE
                                </div>
                                <div
                                  style={{
                                    fontSize: '11px',
                                    color: '#666',
                                    marginTop: '2px'
                                  }}
                                >
                                  {camera.label}
                                </div>{' '}
                              </div>

                              <div
                                style={{
                                  flex: 1,
                                  position: 'relative',
                                  width: '100%',
                                  paddingBottom: '75%',
                                  backgroundColor: '#fafafa',
                                  borderRadius: '6px',
                                  overflow: 'hidden',
                                  border: '1px solid #e0e0e0'
                                }}
                              >
                                {getReferenceImageForCamera(
                                  camera.label,
                                  camera.model_ver,
                                  ref_img_path
                                ) ? (
                                  <img
                                    src={getReferenceImageForCamera(
                                      camera.label,
                                      camera.model_ver,
                                      ref_img_path
                                    )}
                                    alt={`Reference for ${camera.label}`}
                                    style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      height: '100%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#999',
                                      fontSize: '12px'
                                    }}
                                  >
                                    No reference image
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Live Camera Column */}
                            <div
                              style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                minWidth: 0
                              }}
                            >
                              <div
                                style={{
                                  padding: '8px',
                                  backgroundColor: `${getStageColor(
                                    stageName
                                  )}15`,
                                  borderRadius: '6px',
                                  textAlign: 'center',
                                  marginBottom: '10px',
                                  borderLeft: `3px solid ${getStageColor(
                                    stageName
                                  )}`
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: getStageColor(stageName)
                                  }}
                                >
                                  IMAGES
                                  {cameraImageIndex[cameraKey] !==
                                    undefined && (
                                    <span
                                      style={{
                                        marginLeft: '8px',
                                        fontSize: '11px',
                                        fontWeight: '400'
                                      }}
                                    >
                                      - Image ({cameraImageIndex[cameraKey] + 1}{' '}
                                      /{' '}
                                      {
                                        galleryData.filter(
                                          img =>
                                            img.camera_label === camera.label &&
                                            img.stage_name === stageName
                                        ).length
                                      }
                                      )
                                    </span>
                                  )}
                                </div>
                                <div
                                  style={{
                                    fontSize: '11px',
                                    color: '#666',
                                    marginTop: '2px'
                                  }}
                                >
                                  {camera.label}
                                </div>
                              </div>

                              <div
                                style={{
                                  flex: 1,
                                  position: 'relative',
                                  width: '100%',
                                  paddingBottom: '75%',
                                  backgroundColor: '#000',
                                  borderRadius: '6px',
                                  overflow: 'hidden',
                                  border:
                                    showresult &&
                                    response_message &&
                                    response_message[cameraKey]
                                      ? response_message[cameraKey] === 'OK' ||
                                        response_message[cameraKey] ===
                                          config?.positive
                                        ? '6px solid #52c41a'
                                        : response_message[cameraKey] ===
                                            'NG' ||
                                          response_message[cameraKey] ===
                                            config?.negative
                                        ? '6px solid #ff4d4f'
                                        : `2px solid ${getStageColor(
                                            stageName
                                          )}`
                                      : `2px solid ${getStageColor(stageName)}`
                                }}
                              >
                                <div
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%'
                                  }}
                                >
                                  {cameraDisconnected &&
                                  cameraDisconnected[camera.originalLabel] ? (
                                    <div
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor:
                                          'rgba(255, 255, 255, 0.95)',
                                        padding: '16px'
                                      }}
                                    >
                                      <div style={{ textAlign: 'center' }}>
                                        <h6
                                          style={{
                                            fontWeight: '600',
                                            marginBottom: '12px',
                                            fontSize: '14px'
                                          }}
                                        >
                                          Webcam Disconnected
                                        </h6>
                                        <Spinner color='primary' />
                                        <div
                                          style={{
                                            fontSize: '12px',
                                            marginTop: '12px'
                                          }}
                                        >
                                          Please check connection...
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div
                                        style={{
                                          position: 'relative',
                                          width: '100%',
                                          height: '100%'
                                        }}
                                      >
                                        {getImageForCamera(
                                          camera.label,
                                          stageName
                                        ) ? (
                                          <img
                                            src={getImageForCamera(
                                              camera.label,
                                              stageName
                                            )}
                                            alt={camera.label}
                                            style={{
                                              position: 'absolute',
                                              top: 0,
                                              left: 0,
                                              width: '100%',
                                              height: '100%',
                                              objectFit: 'cover',
                                              zIndex: 1
                                            }}
                                          />
                                        ) : (
                                          <div
                                            style={{
                                              position: 'absolute',
                                              top: 0,
                                              left: 0,
                                              width: '100%',
                                              height: '100%',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              color: '#aaa',
                                              fontSize: '13px'
                                            }}
                                          >
                                            No Image Available
                                          </div>
                                        )}
                                      </div>

                                      <div
                                        style={{
                                          position: 'absolute',
                                          top: '10%',
                                          left: '50%',
                                          transform: 'translate(-50%, -50%)',
                                          zIndex: 4,
                                          textAlign: 'center',
                                          width: '90%'
                                        }}
                                      >
                                        {show && msg && (
                                          <div
                                            style={{
                                              color: '#fff',
                                              fontSize: '14px',
                                              fontWeight: '600',
                                              textShadow:
                                                '2px 2px 4px rgba(0,0,0,0.8)',
                                              marginBottom: '8px'
                                            }}
                                          >
                                            {msg}
                                          </div>
                                        )}

                                        {!showresult &&
                                          showstatus &&
                                          res_message &&
                                          res_message[cameraKey] && (
                                            <div
                                              style={{
                                                color:
                                                  res_message[cameraKey] ===
                                                  'Object Detected'
                                                    ? '#52c41a'
                                                    : res_message[cameraKey] ===
                                                      'Barcode is correct'
                                                    ? '#52c41a'
                                                    : res_message[cameraKey] ===
                                                      'No Object Detected'
                                                    ? '#fadb14'
                                                    : res_message[cameraKey] ===
                                                      'Incorrect Object'
                                                    ? '#ff4d4f'
                                                    : res_message[cameraKey] ===
                                                      'Barcode is incorrect'
                                                    ? '#ff4d4f'
                                                    : res_message[cameraKey] ===
                                                      'Unable to read Barcode'
                                                    ? '#ffffff'
                                                    : res_message[cameraKey] ===
                                                      'Checking ...'
                                                    ? '#fffb8f'
                                                    : '#ffffff',
                                                fontSize: '16px',
                                                fontWeight: 'bold',
                                                textShadow:
                                                  '2px 2px 4px rgba(0,0,0,0.8)',
                                                marginBottom: '8px',
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                display: 'inline-block'
                                              }}
                                            >
                                              {res_message[cameraKey]}
                                            </div>
                                          )}

                                        {showresult &&
                                          res_message &&
                                          res_message[cameraKey] && (
                                            <div
                                              style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'left',
                                                gap: '8px'
                                              }}
                                            >
                                              <span
                                                style={{
                                                  fontWeight: 'bold',
                                                  color:
                                                    res_message[cameraKey] ===
                                                      'OK' ||
                                                    res_message[cameraKey] ===
                                                      config[0]?.positive
                                                      ? '#52c41a'
                                                      : res_message[
                                                          cameraKey
                                                        ] === 'NG' ||
                                                        res_message[
                                                          cameraKey
                                                        ] ===
                                                          config[0]?.negative
                                                      ? '#ff4d4f'
                                                      : '#fff',
                                                  textShadow:
                                                    '2px 2px 4px rgba(0,0,0,0.8)',
                                                  fontSize: '15px',
                                                  borderRadius: '6px'
                                                }}
                                                className='mt-5'
                                              >
                                                Result: {res_message[cameraKey]}
                                              </span>

                                              {(res_message[cameraKey] ===
                                                'OK' ||
                                                res_message[cameraKey] ===
                                                  config[0].positive) && (
                                                <CheckCircleOutlined
                                                  style={{
                                                    fontSize: '60px',
                                                    color: '#52c41a',
                                                    filter:
                                                      'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
                                                  }}
                                                />
                                              )}

                                              {(res_message[cameraKey] ===
                                                'NG' ||
                                                res_message[cameraKey] ===
                                                  config[0].negative) && (
                                                <CloseCircleOutlined
                                                  style={{
                                                    fontSize: '60px',
                                                    color: '#bf171aff',
                                                    filter:
                                                      'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
                                                  }}
                                                />
                                              )}
                                            </div>
                                          )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </Container>
      {console.log('show_ratioshow_ratio', ratio_data)}
      {/* {show_ratio && (
        <Modal isOpen={show_ratio} toggle={toggle} keyboard={false} centered>
          <ModalHeader
            toggle={toggle}
            style={{ fontWeight: 'bold', textAlign: 'center' }}
          >
            Acceptance Ratio Calculation
          </ModalHeader>
          <ModalBody>
            <p style={{ fontWeight: 'bold' }}>
              {`Profile's Acceptance Ratio: ${ratio_data?.profile_Ratio || ''}`}
            </p>
            <p className='mt-5' style={{ fontWeight: 'bold' }}>
              {`Algorithm's Acceptance Ratio`}
            </p>
            <Table striped bordered hover className='mt-3'>
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Ratio</th>
                </tr>
              </thead>
              <tbody>
                {ratio_data &&
                  Object.keys(ratio_data.algo_ratio).map(key => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{ratio_data.algo_ratio[key]}</td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </ModalBody>
          <ModalFooter>
            <Button color='primary' onClick={navigate}>
              OK
            </Button>
          </ModalFooter>
        </Modal>
      )} */}

      {show_ratio && (
        <Modal isOpen={show_ratio} toggle={toggle} keyboard={false} centered>
          <ModalHeader
            toggle={toggle}
            style={{ fontWeight: 'bold', textAlign: 'center' }}
          >
            Acceptance Ratio Calculation{' '}
          </ModalHeader>{' '}
          <ModalBody>
            {' '}
            <p>Profile Acceptance Ratio: {ratio_data?.profile_Ratio || ''}</p>
            <p className='mt-4' style={{ fontWeight: 'bold' }}>
              Algorithm&apos;s Acceptance Ratio
            </p>
            <Table striped bordered hover className='mt-2'>
              <thead>
                <tr>
                  <th>Stage / Algorithm</th>
                  <th>Acceptance Ratio</th>
                </tr>
              </thead>
              <tbody>
                {ratio_data?.Final_algorithm_acceptance_ratio &&
                  Object.entries(
                    ratio_data.Final_algorithm_acceptance_ratio
                  ).map(([stageKey, stageData]) => (
                    <tr key={stageKey}>
                      <td>
                        {stageData.stage_name} ({stageData.stage_code})
                      </td>
                      <td>
                        {Object.entries(stageData.stage_acceptance_ratio).map(
                          ([position, ratios]) => (
                            <div key={position} style={{ marginBottom: 4 }}>
                              <strong>{position}:</strong>{' '}
                              {Object.entries(ratios)
                                .map(([label, value]) => `${label} = ${value}%`)
                                .join(', ')}
                            </div>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </ModalBody>
          <ModalFooter>
            <Button color='primary' onClick={navigate}>
              OK
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
};

StageProfileRatioHandlerInsp.propTypes = {
  history: PropTypes.any.isRequired
};

export default StageProfileRatioHandlerInsp;
