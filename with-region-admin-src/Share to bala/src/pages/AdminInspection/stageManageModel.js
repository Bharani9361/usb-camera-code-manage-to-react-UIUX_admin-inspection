//Rani
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Container, CardTitle, Button, Table, Row, Col,
    Modal, ModalHeader, ModalBody, ModalFooter,
    Card, CardBody, CardHeader, Spinner,
    Label, Input, InputGroup, InputGroupText,
    CardFooter,
    CardText,
    ButtonGroup
} from 'reactstrap';
import { useHistory } from 'react-router-dom';
import { Dropdown, Menu, Checkbox, Radio, Space, Spin, Slider, Image as AntdImage, Popconfirm } from 'antd';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import SweetAlert from "react-bootstrap-sweetalert";
import { FaTrash, FaArrowsAlt, FaExpand, FaEdit, FaTrashAlt, FaSave, FaTimes } from 'react-icons/fa';
import ColorPicker_1 from './colorPicker_1';
import RegionConfirmationModal from './RegionFunctions/RegionConfirmationModal';
import FullScreenLoader from 'components/Common/FullScreenLoader';
import SelectAdminTestMultipleVersions from './RegionFunctions/SelectAdminTestMultipleVersions';
import { DEFAULT_RESOLUTION } from './cameraConfig';
import ZoomableWebcamViewer from 'pages/WebcamCustom/ZoomableWebcamViewer';

import urlSocket from "./urlSocket";
import { image_url } from './imageUrl';
import { debugMultiCameraOutline } from './debugMultiCameraOutline';

let img_url = image_url;
console.log('img_url :>> ', img_url);

const stageManageModel = () => {
    const history = useHistory();

    const [stageName, setStageName] = useState('');
    const [stageCode, setStageCode] = useState('');
    const [mngstateInfo, setMngstateInfo] = useState(null);
    const [mngstateInfoType, setMngstateInfoType] = useState(null);
    // console.log('Setting active camera to:', mngstateInfo?.camera_selection.cameras);
    const [canvasRect, setCanvasRect] = useState(null);

    // Basic component information
    const [compName, setCompName] = useState('');
    const [compCode, setCompCode] = useState('');
    const [compInfo, setCompInfo] = useState(null);
    const [stageModelInfo, setStageModelInfo] = useState([]);

    // Model management states
    const [modelInfo, setModelInfo] = useState([]);
    const [selectedModel, setSelectedModel] = useState(null);
    const [compModelInfo, setCompModelInfo] = useState([]);
    const [configChange, setConfigChange] = useState(false);
    const [setPartialySelected, setSetPartialySelected] = useState(false);
    const [setSelectAll, setSetSelectAll] = useState(false);
    const [allAny, setAllAny] = useState(null);
    const [modelAccuracyTest, setModelAccuracyTest] = useState([]);
    const [checkbox, setCheckbox] = useState(false);
    const [radiobtn, setRadiobtn] = useState(false);
    const [anySelected, setAnySelected] = useState(false);
    const [config, setConfig] = useState([]);
    const [positive, setPositive] = useState(null);
    const [negative, setNegative] = useState(null);
    const [activeCameraIndex, setActiveCameraIndex] = useState(0);

    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedVersions, setSelectedVersions] = useState([]);
    const [selectFilter, setSelectFilter] = useState('');
    const [tabs, setTabs] = useState(false);


    // Camera and image states
    const [webcamEnabled, setWebcamEnabled] = useState(false);
    const [imageSrcNone, setImageSrcNone] = useState(false);
    const [addingImage, setAddingImage] = useState(false);
    const [imagesLength, setImagesLength] = useState(0);
    const [outlineThres, setOutlineThres] = useState(100);
    const [thresLoad, setThresLoad] = useState(false);
    const [outlineType, setOutlineType] = useState('3');
    const [cameraDisconnected, setCameraDisconnected] = useState(false);
    const [showOutline, setShowOutline] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [captureFiexdRefImage, setCaptureFiexdRefImage] = useState(false);

    // Region selection states
    const [regionTesting, setRegionTesting] = useState(false);
    const [modalXlarge1, setModalXlarge1] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    const [activeImagePath, setActiveImagePath] = useState("");
    const [clearCanvasFlag, setClearCanvasFlag] = useState(false);
    const [cvLoaded, setCvLoaded] = useState(false);
    const [rectangles, setRectangles] = useState([]);
    const [previousRectangle, setPreviousRectangle] = useState([]);
    const [unchangesRectangles, setUnchangesRectangles] = useState([]);
    const [selecting, setSelecting] = useState(false);
    const [selectedRectangleIndex, setSelectedRectangleIndex] = useState(null);
    const [editingRectangleIndex, setEditingRectangleIndex] = useState(null);
    const [resizingRectangleIndex, setResizingRectangleIndex] = useState(null);
    const [movingRectangleIndex, setMovingRectangleIndex] = useState(null);
    const [rectNameInput, setRectNameInput] = useState('');
    const [nestedRectNameInput, setNestedRectNameInput] = useState('');
    const [capturedImage, setCapturedImage] = useState(null);
    const [testingImage, setTestingImage] = useState(null);
    const [imageId, setImageId] = useState(null);
    const [selectingRectangle, setSelectingRectangle] = useState('');
    const [inputRectangleName, setInputRectangleName] = useState(null);
    const [existRectangleNameError, setExistRectangleNameError] = useState(false);
    const [selectedColor, setSelectedColor] = useState('blue');
    const [showRegion, setShowRegion] = useState(true);
    const [canvasWidth, setCanvasWidth] = useState(640);
    const [canvasHeight, setCanvasHeight] = useState(480);
    const [zoom, setZoom] = useState(1);
    const [regionChanges, setRegionChanges] = useState(false);
    const [isPanning, setIsPanning] = useState(false);
    const [panStartX, setPanStartX] = useState(0);
    const [panStartY, setPanStartY] = useState(0);


    // Testing states
    const [overallTesting, setOverallTesting] = useState(false);
    const [regionWiseTesting, setRegionWiseTesting] = useState(false);
    const [testingModeRequired, setTestingModeRequired] = useState(false);

    // Loading and confirmation states
    const [modelInfoLoading, setModelInfoLoading] = useState(true);
    const [showRegionConfirmation, setShowRegionConfirmation] = useState(false);
    const [updatingRegions, setUpdatingRegions] = useState(false);
    const [regionConfirmationDatas, setRegionConfirmationDatas] = useState({});
    const [fullScreenLoading, setFullScreenLoading] = useState(false);
    const [showRegionEditModal, setShowRegionEditModal] = useState(false);
    const [regionSelecting, setRegionSelecting] = useState(false);
    const [isCreatingRegion, setIsCreatingRegion] = useState(false);
    const [zoomValue, setZoomValue] = useState({
        center: { x: 0.5, y: 0.5 },
        zoom: 1
    });
    const [loadingButtonIndex, setLoadingButtonIndex] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [trainingStatus, setTrainingStatus] = useState(' ');

    // Multi-Camera Outline States
    const [multiCameraOutlines, setMultiCameraOutlines] = useState({});
    const [activeCameraForOutline, setActiveCameraForOutline] = useState(null);
    const [cameraOutlineConfigs, setCameraOutlineConfigs] = useState({});
    const [outlineProgress, setOutlineProgress] = useState({});
    const [showMultiCameraOutline, setShowMultiCameraOutline] = useState(false);
    const [cameraWebcamRefs, setCameraWebcamRefs] = useState({});
    const [cameraZoomValues, setCameraZoomValues] = useState({});
    const [cameraDisconnectedStates, setCameraDisconnectedStates] = useState({});

    // Multi-camera region states
    const [multiCameraRegions, setMultiCameraRegions] = useState({});
    const [activeCameraForRegion, setActiveCameraForRegion] = useState(null);
    const [showMultiCameraRegion, setShowMultiCameraRegion] = useState(false);
    const [cameraRegionConfigs, setCameraRegionConfigs] = useState({});
    // const [cameraCanvasRefs, setCameraCanvasRefs] = useState({});
    const [cameraRegionStates, setCameraRegionStates] = useState({});
    const [activeCameraDevices, setActiveCameraDevices] = useState([]);
    const [backupCameraSelection, setBackupCameraSelection] = useState(null);
    const [backupStageIds, setBackupStageIds] = useState({ _id: null, comp_id: null });
    const [isLoadingRegions, setIsLoadingRegions] = useState(false);
    const [outlinePreviewRefresh, setOutlinePreviewRefresh] = useState(0);

    const cameraCanvasRefs = useRef({});
    const loadedRegionsRef = useRef(new Set()); // Track which cameras have loaded regions

    // Multi-camera edit modal state
    const [multiEditingRectangleIndex, setMultiEditingRectangleIndex] = useState(null);
    const [multiEditingRectangleName, setMultiEditingRectangleName] = useState("");
    const [multiOriginalRectangleName, setMultiOriginalRectangleName] = useState("");
    const [showMultiRegionEditModal, setShowMultiRegionEditModal] = useState(false);




    // one central resize state for multi-cam
    const [resizeState, setResizeState] = useState({
        isResizing: false,
        cameraIndex: null,
        rectIndex: null,
        startX: 0,
        startY: 0,
        startWidth: 0,
        startHeight: 0,
        showHandles: false,   // <- show the red handle when in resize mode
    });

    const [actionState, setActionState] = useState({
        isResizing: false,
        isDragging: false,
        rectIndex: null,
        cameraIndex: null,
        startX: null,
        startY: null,
    });
    // const [isMoveMode, setIsMoveMode] = useState(false);
    const [moveMode, setMoveMode] = useState(false);



    // Refs
    const parentDivRef = useRef();
    const canvasRef = useRef();
    const videoRef = useRef();
    const animationRef = useRef();
    const nestedRectangleRef = useRef();
    const rectangleRef = useRef();
    const trashButtonsRef = useRef([]);
    const draggingRectIndexRef = useRef();
    const resizingRectIndexRef = useRef();
    const webcamRef = useRef();
    const trainingStatusInterval = useRef();
    const cameraCanvas_multi_Refs = useRef({});
    // Multi-Camera Outline Utility Functions

    const initializeCameraRefs = useCallback(() => {
        if (mngstateInfo?.camera_selection?.cameras) {
            const refs = {};
            const configs = {};
            const canvasRefs = {};
            const regionStates = {};
            mngstateInfo.camera_selection.cameras.forEach(camera => {
                if (!refs[camera.originalLabel]) {
                    refs[camera.originalLabel] = React.createRef();
                }
                // Initialize camera outline config with default values
                if (!configs[camera.originalLabel]) {
                    configs[camera.originalLabel] = {
                        type: '3' // Default outline type
                    };
                }
                // Initialize canvas refs for region drawing
                if (!canvasRefs[camera.originalLabel]) {
                    canvasRefs[camera.originalLabel] = React.createRef();
                }
                // Initialize region states for each camera
                if (!regionStates[camera.originalLabel]) {
                    regionStates[camera.originalLabel] = {
                        rectangles: [],
                        showRegion: true,
                        isCreatingRegion: false,
                        selectedRectangleIndex: null
                    };
                }

            });
            console.log("mngstateInfo", mngstateInfo);

            setCameraWebcamRefs(refs);
            setCameraOutlineConfigs(prev => ({ ...prev, ...configs }));
            console.log('cameraWebcamRefs', canvasRefs)
            // setCameraCanvasRefs(canvasRefs);
            setCameraRegionStates(prev => ({ ...prev, ...regionStates }));
        }
    }, [mngstateInfo]);


    useEffect(() => {
        const initializeComponent = async () => {
            const dbInfo = JSON.parse(localStorage.getItem('db_info'));
            img_url = `${image_url}${dbInfo?.db_name}/`;

            try {
                getConfigInfo();
                let data = JSON.parse(sessionStorage.getItem('managestageData'));
                console.log("data116 ", data);
                let compInfoData = data.compInfo;
                let stageInfoData = data.ManageStage;
                let modelInfoData = data.modelInfo;
                console.log('modelInfo', modelInfoData, compInfoData);
                const stageId = data.mngstateInfo?._id;

                const trainingStatusCookie = Cookies.get(`training_status_${stageId}`);
                const trainingStatusValue = trainingStatusCookie === 'true';

                if (data?.ManageStage?.zoom_value) {
                    const zoomValues = data?.ManageStage?.zoom_value;
                    sessionStorage.setItem('zoom_values', JSON.stringify(zoomValues));
                    setZoomValue(zoomValues);
                }

                setCompName(compInfoData.comp_name);
                setCompCode(compInfoData.comp_code);
                setStageName(stageInfoData.stage_name);
                setStageCode(stageInfoData.stage_code);
                setModelInfo(modelInfoData);
                setCompInfo(compInfoData);
                console.log('firststageInfoData', stageInfoData)
                setMngstateInfo(stageInfoData)
                setRegionTesting(stageInfoData.region_selection);
                setTrainingStatus(trainingStatusValue);

                // Debug stage data structure for region selection
                console.log('🔍 STAGE DATA DEBUG:', {
                    stageName: stageInfoData.stage_name,
                    cameraMode: stageInfoData?.camera_selection?.mode,
                    hasDatasets: !!stageInfoData?.datasets,
                    datasetsKeys: Object.keys(stageInfoData?.datasets || {}),
                    allStageKeys: Object.keys(stageInfoData || {}),
                    imagePathKeys: Object.keys(stageInfoData || {}).filter(key => key.includes('image_path'))
                });

                // Debug region data
                console.log('🔍 Region Debug Info:', {
                    showRegion,
                    regionTesting: stageInfoData.region_selection,
                    rectangles: stageInfoData.rectangles,
                    rectanglesLength: stageInfoData.rectangles?.length || 0,
                    imageSrc
                });

                // Initialize multi-camera outline functionality
                if (stageInfoData?.camera_selection?.mode === 'multi') {
                    console.log('Multi-camera mode detected, initializing refs');

                    // Debug the stage data structure
                    debugMultiCameraOutline.analyzeStageData(stageInfoData);
                    debugMultiCameraOutline.validateCameraConfig(stageInfoData);

                    initializeCameraRefs();

                    // Load existing multi-camera outlines
                    loadExistingMultiCameraOutlines(stageInfoData);
                }

                gettingBack();

                navigator.mediaDevices.addEventListener('devicechange', checkWebcam);
                checkWebcam();

                window.addEventListener('resize', updateCanvasSize);
                updateCanvasSize();
            } catch (error) {
                console.error('/didmount ', error);
            } finally {
                setModelInfoLoading(false);
            }
        };

        initializeComponent();

        // Cleanup function
        return () => {
            clearInterval(trainingStatusInterval.current);
            navigator.mediaDevices.removeEventListener('devicechange', checkWebcam);
            window.removeEventListener('resize', updateCanvasSize);
        };
    }, []);


    // State to store image paths per position
    useEffect(() => {
        if (
            mngstateInfo?.camera_selection?.cameras &&
            mngstateInfo?.datasets
        ) {
            const cameras = mngstateInfo.camera_selection.cameras;
            const activeCamera = cameras[activeCameraIndex];

            if (activeCamera) {
                // Use the actual camera label (formatted for dataset key)
                const cameraLabel = activeCamera.label?.toLowerCase()?.replace(/\s+/g, '_');
                const dataset = mngstateInfo.datasets[cameraLabel];

                if (dataset?.image_path) {
                    console.log("Multi-camera dataset image path:", dataset.image_path, "for camera:", cameraLabel);
                    setActiveImagePath(dataset.image_path);
                } else {
                    console.log("No dataset found for camera label:", cameraLabel, "Available datasets:", Object.keys(mngstateInfo.datasets));

                    // Fallback: try the old position-based key for backward compatibility
                    const fallbackKey = `position_${activeCameraIndex + 1}`;
                    const fallbackDataset = mngstateInfo.datasets[fallbackKey];
                    if (fallbackDataset?.image_path) {
                        console.log("Using fallback dataset key:", fallbackKey);
                        setActiveImagePath(fallbackDataset.image_path);
                    }
                }
            }

        }
    }, [activeCameraIndex, mngstateInfo]);


    const updateCameraOutlineConfig = (cameraId, configKey, value) => {
        setCameraOutlineConfigs(prev => ({
            ...prev,
            [cameraId]: {
                ...prev[cameraId],
                [configKey]: value
            }
        }));
    };



    const checkMultiCameraOutlineRequirement = (model) => {
        if (mngstateInfo?.camera_selection?.mode === 'multi') {
            const requiredCameras = mngstateInfo.camera_selection.cameras.length;
            const completedOutlines = getCompletedOutlinesCount();

            if (completedOutlines < requiredCameras && model.position === "Fixed") {
                Swal.fire({
                    title: 'Multi-Camera Outlines Required',
                    text: `Please create outlines for all ${requiredCameras} cameras before assigning models.`,
                    icon: 'warning',
                    confirmButtonText: 'Create Outlines',
                    showCancelButton: true
                }).then((result) => {
                    if (result.isConfirmed) {
                        setShowMultiCameraOutline(true);
                        // Set first camera as active if none selected
                        if (!activeCameraForOutline && mngstateInfo.camera_selection.cameras.length > 0) {
                            setActiveCameraForOutline(mngstateInfo.camera_selection.cameras[0].originalLabel);
                        }
                    }
                });
                return false;
            }
        }
        return true;
    };

    const captureOutlineForCamera = async (camera) => {
        console.log('🎬 Starting capture for camera:', camera);
        try {
            console.log('⏳ Setting capture state to true...');
            setOutlineProgress(prev => ({
                ...prev,
                [camera.originalLabel]: { capturing: true }
            }));

            // Reset previous outline data
            setMultiCameraOutlines(prev => ({
                ...prev,
                [camera.originalLabel]: null
            }));

            const webcamRef = cameraWebcamRefs[camera.originalLabel];
            if (!webcamRef?.current) {
                throw new Error('Camera not ready');
            }

            const outlineImageSrc = await webcamRef.current.capture();
            if (!outlineImageSrc) {
                throw new Error('Failed to capture image from camera');
            }

            const { zoom, center } = webcamRef.current.getZoomAndCenter();
            const zoomValue = { zoom, center };
            const blob = dataURLtoBlob(outlineImageSrc);
            const formData = new FormData();
            formData.append('_id', mngstateInfo._id);
            formData.append('comp_id', mngstateInfo?.comp_id || compInfo?._id);
            formData.append('camera_label', camera.label);
            formData.append('imgName', blob, `${camera.label.replace(/\s+/g, '_')}_${Date.now()}_outline.png`); // Add timestamp to filename
            formData.append('outline_type', cameraOutlineConfigs[camera.originalLabel]?.type || '3');
            formData.append('zoom_value', JSON.stringify(zoomValue));

            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
                console.error('❌ API call timed out after 30 seconds');
            }, 30000);

            const response = await urlSocket.post(
                '/api/stage/addMultiCameraOutline_stg',
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    signal: controller.signal,
                    timeout: 30000
                }
            );

            clearTimeout(timeoutId);
            console.log('✅ API call completed successfully');
            console.log('New image paths:', {
                white_path: response.data.stage_info?.[0]?.datasets?.[camera.label.replace(/\s+/g, '_').toLowerCase()]?.white_path,
                image_path: response.data.stage_info?.[0]?.datasets?.[camera.label.replace(/\s+/g, '_').toLowerCase()]?.image_path
            });

            if (response.data.success || response.data.message === "Image successfully added" || response.status === 200) {
                const stageInfo = response.data.stage_info?.[0];
                if (!stageInfo) {
                    throw new Error('No stage info returned from server');
                }

                const cameraPosition = camera.label.replace(/\s+/g, '_').toLowerCase();
                const cameraData = stageInfo.datasets?.[cameraPosition];
                if (!cameraData) {
                    throw new Error(`Camera data not found for ${camera.label}`);
                }
                console.log('firststageInfo', stageInfo)
                // setMngstateInfo(stageInfo);
                // After your API call succeeds and you have stageInfo:

                // Build a new updated camera list by comparing labels with datasets
                const updatedCameras = (mngstateInfo?.camera_selection?.cameras || []).map(cam => {
                    const cameraPosition = cam.label.replace(/\s+/g, '_').toLowerCase();
                    const cameraData = stageInfo.datasets?.[cameraPosition];

                    if (cameraData) {
                        // Attach server dataset info to the camera
                        return {
                            ...cam,
                            dataset: cameraData, // keep full dataset info for this camera
                            position: cameraPosition
                        };
                    }
                    return cam; // unchanged if dataset not found
                });

                // Now update mngstateInfo with merged data
                setMngstateInfo(prev => ({
                    ...prev,
                    ...stageInfo, // keep other stageInfo fields
                    camera_selection: {
                        ...(stageInfo.camera_selection || prev.camera_selection),
                        cameras: updatedCameras
                    }
                }));


                const zoomValueKey = `${cameraPosition}_zoom_value`;
                const cameraZoomValue = stageInfo[zoomValueKey] || zoomValue;

                setCameraZoomValues(prev => ({
                    ...prev,
                    [camera.originalLabel]: cameraZoomValue
                }));

                const timestamp = Date.now();
                const whitePathUrl = cameraData.white_path
                    ? `${showImage(cameraData.white_path)}?t=${timestamp}`
                    : null;
                const imagePathUrl = cameraData.image_path
                    ? `${showImage(cameraData.image_path)}?t=${timestamp}`
                    : null;

                setMultiCameraOutlines(prev => ({
                    ...prev,
                    [camera.originalLabel]: {
                        preview: whitePathUrl || imagePathUrl,
                        raw_preview: imagePathUrl,
                        path: cameraData.image_path,
                        white_path: cameraData.white_path,
                        zoom_value: cameraZoomValue,
                        outline_type: cameraOutlineConfigs[camera.originalLabel]?.type || '3',
                        camera_config: camera,
                        status: 'completed',
                        camera_position: cameraPosition,
                        camera_data: cameraData,
                        last_updated: timestamp
                    }
                }));

                setOutlinePreviewRefresh(prev => prev + 1);
                Swal.fire({
                    icon: 'success',
                    title: 'Outline Captured!',
                    text: `Outline successfully captured for ${camera.label}`,
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                throw new Error(response.data.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Error capturing outline:', error);
            Swal.fire({
                icon: 'error',
                title: 'Capture Failed',
                html: `
                <div style="text-align: left;">
                    <p><strong>Camera:</strong> ${camera.label}</p>
                    <p><strong>Error:</strong> ${error.message || 'Network error'}</p>
                    ${error.response?.data?.error ? `<p><strong>Server Error:</strong> ${error.response.data.error}</p>` : ''}
                </div>
            `,
                confirmButtonText: 'OK'
            });
        } finally {
            setOutlineProgress(prev => ({
                ...prev,
                [camera.originalLabel]: { capturing: false }
            }));
        }
    };
    const createMultiCameraOutline = useCallback(() => {
        if (mngstateInfo?.camera_selection?.mode === 'multi') {

            // Initialize camera refs first
            initializeCameraRefs();

            // Set first camera as active
            if (mngstateInfo.camera_selection.cameras.length > 0) {
                setActiveCameraForOutline(mngstateInfo.camera_selection.cameras[0].originalLabel);
            }
            // Show modal after initialization
            setShowMultiCameraOutline(true);
        } else {
            // For single camera, use existing outline functionality
            createOutline();
        }
    }, [mngstateInfo, initializeCameraRefs]);


    // Count completed outlines based on actual camera data in datasets
    const getCompletedOutlinesCount = useCallback(() => {
        if (!mngstateInfo?.camera_selection?.cameras) return 0;

        let count = 0;
        mngstateInfo.camera_selection.cameras.forEach(camera => {
            const cameraPosition = camera.label.replace(/\s+/g, '_').toLowerCase();

            // Check if camera data exists in datasets structure
            const cameraData = mngstateInfo.datasets?.[cameraPosition];


            // Count as completed if camera has white_path or image_path
            if (cameraData && (cameraData.white_path || cameraData.image_path)) {
                count++;
                console.log(`✅ Found outline for ${camera.label}:`, cameraData);
            } else {
                console.log(`❌ No outline found for ${camera.label}, cameraPosition: ${cameraPosition}`);
            }
        });

        console.log(`📊 Completed outlines: ${count}/${mngstateInfo.camera_selection.cameras.length}`);
        return count;
    }, [mngstateInfo]);

    // Load existing multi-camera outlines from stage data
    const loadExistingMultiCameraOutlines = useCallback((stageData) => {
        if (!stageData?.camera_selection?.cameras) return;

        console.log('🔍 Loading existing multi-camera outlines...');
        console.log('🔍 Stage data structure:', {
            datasets: stageData.datasets,
            cameraCount: stageData.camera_selection.cameras.length
        });

        const existingOutlines = {};

        stageData.camera_selection.cameras.forEach(camera => {
            const cameraPosition = camera.label.replace(/\s+/g, '_').toLowerCase();

            // Look for camera data in datasets structure
            const cameraData = stageData.datasets?.[cameraPosition];
            const zoomValueKey = `${cameraPosition}_zoom_value`;
            const cameraZoomValue = stageData[zoomValueKey];

            console.log(`🔍 Checking camera ${camera.label}:`, {
                cameraPosition,
                cameraData,
                zoomValueKey,
                cameraZoomValue
            });

            if (cameraData && (cameraData.white_path || cameraData.image_path)) {
                console.log(`✅ Found existing outline for ${camera.label}:`, cameraData);

                // Add cache busting for existing outlines to ensure fresh display
                const timestamp = Date.now();

                // Construct cache-busted URLs properly for existing outlines
                const whitePathUrl = cameraData.white_path ? `${showImage(cameraData.white_path)}${showImage(cameraData.white_path).includes('?') ? '&' : '?'}t=${timestamp}` : null;
                const imagePathUrl = cameraData.image_path ? `${showImage(cameraData.image_path)}${showImage(cameraData.image_path).includes('?') ? '&' : '?'}t=${timestamp}` : null;

                console.log('🔗 Loading existing outline URLs:', {
                    camera: camera.label,
                    original_white_path: cameraData.white_path,
                    original_image_path: cameraData.image_path,
                    white_path_url: whitePathUrl,
                    image_path_url: imagePathUrl
                });

                existingOutlines[camera.originalLabel] = {
                    preview: whitePathUrl || imagePathUrl,
                    raw_preview: imagePathUrl,
                    path: cameraData.image_path,
                    white_path: cameraData.white_path,
                    zoom_value: cameraZoomValue || { zoom: 1, center: { x: 0.5, y: 0.5 } },
                    outline_type: '3', // Default type
                    camera_config: camera,
                    status: 'completed',
                    camera_position: cameraPosition,
                    camera_data: cameraData,
                    last_updated: timestamp // Track when this was loaded
                };
            } else {
                console.log(`❌ No outline found for ${camera.label}`);
            }
        });

        // Set multiCameraOutlines to show existing previews immediately
        if (Object.keys(existingOutlines).length > 0) {
            console.log('📸 Setting existing multi-camera outlines for immediate preview:', existingOutlines);
            setMultiCameraOutlines(existingOutlines);
        } else {
            console.log('📸 No existing multi-camera outlines found');
        }
    }, []);


    //rani changes
    useEffect(() => {
        console.log('imageSrc :>> ', imageSrc);
        if (!imageSrc) return;

        const timer = setTimeout(() => {
            if (!canvasRef.current) {
                console.log("❌ Still no canvas after timeout");
                return;
            }

            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = imageSrc;
        }, 100); // wait 100ms for modal & DOM to finish rendering

        return () => clearTimeout(timer);
    }, [imageSrc]);
    ///multicamera image crc useeffect


    // Show image utility
    const showImage = useCallback((outputImg) => {
        const parts = outputImg.split("/");
        const newPath = parts.slice(1).join("/");

        let startIndex;
        if (newPath.includes("Datasets/")) {
            startIndex = newPath.indexOf("Datasets/");
        } else {
            startIndex = newPath.indexOf("receive/");
        }

        const relativePath = newPath.substring(startIndex);

        // URL encode the path to handle spaces and special characters
        const encodedPath = relativePath.split('/').map(segment => encodeURIComponent(segment)).join('/');

        console.log('output_img : ', img_url + encodedPath);
        console.log('original path:', relativePath);
        console.log('encoded path:', encodedPath);

        return `${img_url + encodedPath}`;
    }, []);

    useEffect(() => {
        console.log("Canvas effect triggered...");

        if (!mngstateInfo || activeCameraIndex == null) return;

        const canvas = cameraCanvasRefs.current[activeCameraIndex];
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        console.log("🎯 Loading image for activeCameraIndex:", activeCameraIndex);
        console.log("👉 activeImagePath:", activeImagePath);

        if (!activeImagePath) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        const img = new Image();
        console.log(" img", img);
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };

        // Process the image path through showImage function to construct proper URL
        const processedImageUrl = showImage(activeImagePath);
        img.src = processedImageUrl;

        console.log("✅ img.src set to:", img.src);
        console.log("✅ Original activeImagePath:", activeImagePath);
        console.log("✅ Processed URL:", processedImageUrl);

        img.onerror = (err) => {
            console.error("❌ Failed to load image:", img, err);
            console.error("❌ Original path:", activeImagePath);
            console.error("❌ Processed URL:", processedImageUrl);
        };
    }, [activeImagePath, activeCameraIndex, cameraCanvasRefs, mngstateInfo, showImage]);





    // Watch for active camera changes
    useEffect(() => {
        if (activeCameraForOutline) {
            console.log('=== ACTIVE CAMERA CHANGED ===');
            console.log('Active camera changed to:', activeCameraForOutline);
            const camera = mngstateInfo?.camera_selection?.cameras?.find(c => c.originalLabel === activeCameraForOutline);
            if (camera) {
                console.log('Camera details:', camera);
                console.log('Camera originalLabel that will be passed:', camera.originalLabel);
            } else {
                console.log('Camera not found in camera list!');
            }

            // Force camera disconnection state reset
            setCameraDisconnectedStates(prev => ({
                ...prev,
                [activeCameraForOutline]: false
            }));

            // Initialize zoom values for this camera if not exists
            if (!cameraZoomValues[activeCameraForOutline]) {
                setCameraZoomValues(prev => ({
                    ...prev,
                    [activeCameraForOutline]: {
                        zoom: 1,
                        center: { x: 0.5, y: 0.5 }
                    }
                }));
            }
        }
    }, [activeCameraForOutline, mngstateInfo, cameraZoomValues]);

    useEffect(() => {
        if (!imageSrc) return;

        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Reset rectangle states if showRegion turned off
        if (!showRegion) {
            setMovingRectangleIndex(null);
            setResizingRectangleIndex(null);
            setEditingRectangleIndex(null);
        }

        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            if (showRegion && rectangles.length > 0) {
                drawFrame();
            }
        };
        img.onerror = (err) => console.error("Image load error:", err);
        img.src = imageSrc;

    }, [
        imageSrc,
        showRegion,
        rectangles,
        selectedRectangleIndex,
        movingRectangleIndex,
        editingRectangleIndex,   // add this
        capturedImage,           // add this if used
        clearCanvasFlag,         // add this if used
        selecting,               // add this if used
        modalXlarge1             // if modal check is intentional
    ]);



    // Utility function for debouncing
    const debounce = useCallback((func, delay) => {
        return function (...args) {
            const context = this;
            clearTimeout(context.timer);
            context.timer = setTimeout(() => func.apply(context, args), delay);
        };
    }, []);


    // // Update rectangles utility function
    // const updatingRectangles = useCallback(async (regionValues) => {
    //     let rectangleValues = [];
    //     const originalWidth = 640;
    //     const originalHeight = 480;
    //     const targetWidth = DEFAULT_RESOLUTION.width;
    //     const targetHeight = DEFAULT_RESOLUTION.height;
    //     const scaleX = targetWidth / originalWidth;
    //     const scaleY = targetHeight / originalHeight;

    //     rectangleValues = regionValues.map((rect) => ({
    //         x: rect.coordinates.x / scaleX,
    //         y: rect.coordinates.y / scaleY,
    //         width: rect.coordinates.width / scaleX,
    //         height: rect.coordinates.height / scaleY,
    //         id: rect.id,
    //         name: rect.name,
    //         colour: rect.colour
    //     }));

    //     return rectangleValues;
    // }, []);

    const updatingRectangles = useCallback(async (regionValues) => {
        const originalWidth = 640;
        const originalHeight = 480;
        const targetWidth = DEFAULT_RESOLUTION.width;
        const targetHeight = DEFAULT_RESOLUTION.height;
        const scaleX = targetWidth / originalWidth;
        const scaleY = targetHeight / originalHeight;

        // Convert object → array
        const rectanglesArray = Object.values(regionValues || {}).flatMap(camRects =>
            Object.values(camRects) // handle nested structure like grease_cam -> { 1: {...} }
        );

        const rectangleValues = rectanglesArray.map((rect) => ({
            x: rect.coordinates.x / scaleX,
            y: rect.coordinates.y / scaleY,
            width: rect.coordinates.width / scaleX,
            height: rect.coordinates.height / scaleY,
            id: rect.id,
            name: rect.name,
            colour: rect.colour
        }));

        return rectangleValues;
    }, []);




    // Check if rectangles changed
    const isRectangleChanged = useCallback(() => {
        const prevRectangles = [...previousRectangle];
        const newRectangles = [...rectangles];
        let isChanged = false;

        prevRectangles.forEach(prev => {
            const exists = newRectangles.some(r => r.id === prev.id);
            if (!exists) {
                isChanged = true;
            }
        });

        newRectangles.forEach(current => {
            const prev = prevRectangles.find(r => r.id === current.id);
            if (!prev) {
                isChanged = true;
            } else {
                if (prev.name !== current.name) {
                    isChanged = true;
                }
                const keys = ["x", "y", "width", "height"];
                keys.forEach(key => {
                    if (
                        typeof prev[key] === 'number' &&
                        typeof current[key] === 'number' &&
                        Math.abs(prev[key] - current[key]) > 0.001
                    ) {
                        isChanged = true;
                    }
                });
            }
        });

        console.log('is_changed ', isChanged, prevRectangles, newRectangles);
        return isChanged;
    }, [previousRectangle, rectangles]);

    // Error handler
    const errorHandler = useCallback((error) => {
        sessionStorage.removeItem("authUser");
        history.push("/login");
    }, [history]);

    // Get config info
    const getConfigInfo = useCallback(async () => {
        try {
            const response = await urlSocket.post('/config', { mode: 'no-cors' });
            const configData = response.data;
            if (configData.error === "Tenant not found") {
                console.log("data error", configData.error);
                errorHandler(configData.error);
            } else {
                setConfig(configData);
                setPositive(configData[0].positive);
                setNegative(configData[0].negative);
            }
        } catch (error) {
            console.log('error', error);
        }
    }, [errorHandler]);

    // Get component model info
    const getStageModelInfo = useCallback(async (mngstateInfo, string) => {
        console.log('mngstateInfomngstateInfomngstateInfo', mngstateInfo);
        try {
            const response = await urlSocket.post('/api/stage/get_stage_model_info',
                { 'stage_id': mngstateInfo?._id, 'comp_id': mngstateInfo?.comp_id || compInfo?._id, 'position': string, 'camera_selection': mngstateInfo?.camera_selection, 'split': mngstateInfo?.split },
                { mode: 'no-cors' }
            );
            console.log('data306 ', response.data);

            const zoomValues = response?.data?.comp_info?.zoom_value;
            if (zoomValues) {
                sessionStorage.setItem('zoom_values', JSON.stringify(zoomValues));
                setZoomValue(zoomValues);
            }

            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                errorHandler(response.data.error);
            } else {
                const stageModelInfoData = response.data.stage_model_list;
                console.log('stageModelInfoData', stageModelInfoData)

                statusCheck(stageModelInfoData);

                const unusedModelIds = response.data.model_info
                    .filter(model => !stageModelInfoData.some(stageModel => stageModel.model_id === model._id))
                    .map(model => model._id);
                console.log('unusedModelIds', unusedModelIds);

                const filteredModelInfo = response.data.model_info.filter(model => unusedModelIds.includes(model._id));
                const stageInfoResponse = response.data.stage_info;
                console.log('stageInfoResponse', stageInfoResponse, filteredModelInfo);
                let prevstageInfo = mngstateInfo;
                prevstageInfo.datasets = stageInfoResponse?.datasets;
                console.log('prevstageInfo', prevstageInfo);

                const updatedStageInfo = response.data.stage_info;
                let updatedRectangles = [];
                if (updatedStageInfo?.rectangles) {
                    updatedRectangles = await updatingRectangles(updatedStageInfo.rectangles);
                }
                console.log('updatedRectangles', updatedRectangles)

                console.log('firststageModelInfoData', stageModelInfoData[0])

                setStageModelInfo(stageModelInfoData);
                setModelInfo(filteredModelInfo);
                console.log('firstprevstageInfo', prevstageInfo)
                setMngstateInfo(prevstageInfo);
                setRectangles(updatedRectangles);
                setPreviousRectangle(JSON.parse(JSON.stringify(updatedRectangles)));
            }
        } catch (error) {
            console.log('error', error);
        }
    }, [errorHandler, updatingRectangles]);

    // Status check
    const statusCheck = useCallback((compModelInfoData) => {
        console.log('compModelInfoDdddddata', compModelInfoData);
        try {
            urlSocket.post('/api/stage/model_info_check_stg', { 'modelData': compModelInfoData }, { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data;
                    if (data.error === "Tenant not found") {
                        console.log("data error", data.error);
                        errorHandler(data.error);
                    } else {
                        setCompModelInfo(data);
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        } catch (error) {
            console.log("----", error);
        }
    }, [errorHandler]);

    // Check webcam
    const checkWebcam = useCallback(async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
            if (!videoInputDevices.length) {
                setCameraDisconnected(true);
                setActiveCameraDevices([]);
            } else {
                setCameraDisconnected(false);
                setActiveCameraDevices(videoInputDevices);
            }
        } catch (error) {
            console.error('Error checking devices:', error);
            setCameraDisconnected(true);
            setActiveCameraDevices([]);
        }
    }, []);

    // Update canvas size
    const updateCanvasSize = useCallback(() => {
        if (canvasRef.current) {
            setCanvasWidth(canvasRef.current.offsetWidth);
            setCanvasHeight(canvasRef.current.offsetHeight);
        }
    }, []);

    // Draw frame on canvas
    const drawFrame = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = imageSrc;

        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            rectangles.forEach((rect, index) => {
                const isSelected = index === selectedRectangleIndex;
                if (isSelected) {
                    ctx.lineWidth = 4;
                    ctx.strokeStyle = 'black';
                    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

                    ctx.lineWidth = 2;
                    ctx.strokeStyle = '#50a5f1';
                    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
                } else {
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = rect.colour;
                    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
                }

                const textPosX = index === movingRectangleIndex ? rect.x + 25 : rect.x + 10;
                ctx.font = 'bold 14px Arial';
                ctx.lineWidth = 3;
                ctx.strokeStyle = 'black';
                ctx.strokeText(rect.name, textPosX, rect.y + 15);
                ctx.fillStyle = 'white';
                ctx.fillText(rect.name, textPosX, rect.y + 15);
            });
        };
    }, [imageSrc, rectangles, selectedRectangleIndex, movingRectangleIndex]);

    // const gettingBack = useCallback(() => {
    //     try {
    //         let type = JSON.parse(sessionStorage.getItem('type'));
    //         console.log('typtypetypee', type)
    //         setMngstateInfo(type.mngstateInfo);
    //         console.log('type.string, type.value', type.string, type.value, type.mngstateInfo)
    //         fixedOrany(type.string, type.value);
    //     } catch {
    //         setSelectFilter('');
    //         setTabs(false);
    //     }
    // }, []);

    const gettingBack = useCallback(() => {
        try {
            let type = JSON.parse(sessionStorage.getItem('type'));
            console.log('typtypetypee', type);
            setMngstateInfoType(type); // just set it, don’t chain work here
        } catch {
            setSelectFilter('');
            setTabs(false);
        }
    }, []);

    useEffect(() => {
        if (mngstateInfoType) {
            console.log('type.string, type.value', mngstateInfoType.string, mngstateInfoType.value, mngstateInfoType.mngstateInfo);
            fixedOrany(mngstateInfoType.string, mngstateInfoType.value);
        }
    }, [mngstateInfoType]);
    // Check region changes
    const checkingRegionChanges = useCallback(async () => {
        try {
            const payload = { stage_id: mngstateInfo._id, comp_id: mngstateInfo?.comp_id || compInfo._id };
            const response = await urlSocket.post('/api/regions/regions_assigned_areas_stg', payload);
            console.log('/regions_assigned_areas ', response.data);

            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                errorHandler(response.data.error);
            }
            return response.data;
        } catch (error) {
            console.error(error);
            return {};
        }
    }, [stageModelInfo, modelInfo, mngstateInfo, errorHandler]);

    // Confirmation region
    const confirmationRegion = useCallback(async () => {
        console.log('this is working');
        try {
            const payload = {
                comp_id: mngstateInfo?.comp_id || compInfo?._id,
                stage_id: mngstateInfo._id,
                region_selection: !regionTesting,
                region_confirmation_datas: regionConfirmationDatas,
            };

            console.log('Payload:', payload);
            const response = await urlSocket.post('/api/regions/region_select_stg', payload);
            console.log('API Response:', response);

            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                errorHandler(response.data.error);
            } else {
                if (response.data) {
                    setRegionTesting(!regionTesting);
                    setRegionSelecting(false);
                    setShowRegionConfirmation(false);

                    const data = JSON.parse(sessionStorage.getItem('managestageData'));
                    console.log('dat3434a', data);
                    if (data && data.ManageStage) {
                        data.ManageStage.region_selection = !regionTesting;
                        sessionStorage.setItem('managestageData', JSON.stringify(data));
                    }
                    await getStageModelInfo(mngstateInfo, 'Fixed');
                }
            }
        } catch (error) {
            console.log('Error:', error);
        }
    }, [mngstateInfo, regionTesting, regionConfirmationDatas, errorHandler, getStageModelInfo]);

    // Save region changes
    const saveRegionChanges = useCallback(async () => {
        setFullScreenLoading(true);
        const isRectangleChangedResult = isRectangleChanged();

        if (isRectangleChangedResult) {
            const data = await checkingRegionChanges();
            data.message = "Do you want to save changes?";
            setFullScreenLoading(false);
            setShowRegionConfirmation(true);
            setRegionConfirmationDatas(data);
            setIsCreatingRegion(false);
        } else {
            setFullScreenLoading(false);
            setIsCreatingRegion(false);
            Swal.fire({
                title: 'No Changes Occurred',
                icon: 'warning',
                showCancelButton: false,
                confirmButtonText: 'OK',
            });
        }
    }, [isRectangleChanged, checkingRegionChanges]);

    // Discard region changes
    const discardRegionChanges = useCallback(() => {
        const prevRectangleValues = [...previousRectangle];
        setShowRegionConfirmation(false);
        setRectangles(prevRectangleValues);
        setModalXlarge1(false);
        setRegionConfirmationDatas({});
        setSelectedRectangleIndex(null);
        setEditingRectangleIndex(null);
        setResizingRectangleIndex(null);
        setMovingRectangleIndex(null);
        Swal.fire("Changes are not saved", "", "info");
    }, [previousRectangle]);

    // Handle model select
    const handleModelSelect = useCallback(async (model) => {
        console.log('mossssssssssssdel', model)

        // Check multi-camera outline requirement first

        if (!checkMultiCameraOutlineRequirement(model)) {
            return;
        }

        if (selectFilter == 0) {
            console.log('mngstateInfo?.cameras', mngstateInfo?.camera_selection?.cameras?.map(c => c.label) || [])
            try {
                const response = await urlSocket.post('/api/stage/check_outline_stg', {


                    'stage_id': mngstateInfo._id,
                    'comp_id': mngstateInfo?.comp_id || compInfo?._id,
                    'camera_label': mngstateInfo?.camera_selection?.cameras?.map(c => c.label) || [],
                    'model_id': model._id,
                }, { mode: 'no-cors' });
                console.log('response.data', response.data);
                let getInfo = response.data;
                if (getInfo.show == 'yes') {
                    setSelectedModel(model);
                    try {
                        // console.log('compInffdsfsdo', compInfo)
                        const response = await urlSocket.post('/api/stage/comp_stg_model_info',
                            { 'compInfo': compInfo, 'stageInfo': mngstateInfo, 'modelInfo': model, 'camera_selection': mngstateInfo?.camera_selection }
                        );
                        console.log('respofdgggnse.data', response);
                        if (response.data.error === "Tenant not found") {
                            console.log("data error", response.data.error);
                            errorHandler(response.data.error);
                        } else {
                            let compstgModelInfoData = response.data.comp_stg_model_list;
                            let modelInfoData = response.data.model_config_list;

                            const unusedModelIds = modelInfoData
                                .filter(model => !compstgModelInfoData.some(compModel =>
                                    compModel.model_id === model._id && compModel.position === model.position))
                                .map(model => model._id);
                            const filteredModelInfo = modelInfoData.filter(model => unusedModelIds.includes(model._id));

                            // setCompModelInfo(compModelInfoData);
                            console.log('firstsecond', compstgModelInfoData)
                            setStageModelInfo(compstgModelInfoData);

                            setModelInfo(filteredModelInfo);
                            setModelAccuracyTest([]);
                        }
                    } catch (error) {
                        console.log('error', error);
                    }
                } else if (getInfo.show == 'no') {
                    setCaptureFiexdRefImage(true);
                    const isMultiCamera = mngstateInfo?.camera_selection?.mode === 'multi';
                    Swal.fire({
                        title: isMultiCamera ? 'Create Multi-Camera Outlines to continue...' : 'Create Outline to continue...',
                        text: isMultiCamera
                            ? 'Before Assigning Models, Create Outlines for all Cameras in this Stage'
                            : 'Before Assigning Models, Create a Common Outline for all Models',
                        icon: 'warning',
                        showCancelButton: false,
                        confirmButtonText: 'OK',
                        cancelButtonText: 'Cancel',
                    });
                }
            } catch (error) {
                console.error(error);
            }
        } else if (selectFilter == 1) {
            console.log('mngstateInfoselectFilter', mngstateInfo)
            setSelectedModel(model);

            try {
                // console.log('compInffdsfsdo', compInfo)
                const response = await urlSocket.post('/api/stage/comp_stg_model_info',
                    { 'compInfo': compInfo, 'stageInfo': mngstateInfo, 'modelInfo': model }
                );
                console.log('respofdgggnse.data', response);
                if (response.data.error === "Tenant not found") {
                    console.log("data error", response.data.error);
                    errorHandler(response.data.error);
                } else {
                    let compstgModelInfoData = response.data.comp_stg_model_list;
                    let modelInfoData = response.data.model_config_list;

                    const unusedModelIds = modelInfoData
                        .filter(model => !compstgModelInfoData.some(compModel =>
                            compModel.model_id === model._id && compModel.position === model.position))
                        .map(model => model._id);
                    const filteredModelInfo = modelInfoData.filter(model => unusedModelIds.includes(model._id));

                    // setCompModelInfo(compModelInfoData);
                    console.log('firstthirs', compstgModelInfoData)
                    setStageModelInfo(compstgModelInfoData);

                    setModelInfo(filteredModelInfo);
                    setModelAccuracyTest([]);
                }
            } catch (error) {
                console.log('error', error);
            }

        }
    }, [selectFilter, mngstateInfo, errorHandler]);

    // Fixed or any function
    const fixedOrany = useCallback(async (string, value) => {
        console.log('dfkjkjdnfjsd', string, mngstateInfo, value)
        setIsLoading(true);
        setLoadingButtonIndex(value);

        try {
            await getStageModelInfo(mngstateInfo, string);
            setSelectFilter(value);
            setTabs(true);
            setModelAccuracyTest([]);

            let dataToStore = {
                string: string,
                value: value,
                mngstateInfo: mngstateInfo,
            };
            console.log('dataToStore', dataToStore)
            sessionStorage.setItem('type', JSON.stringify(dataToStore));
        } catch (error) {
            console.error('Error in getStageModelInfo:', error);
        } finally {
            setIsLoading(false);
            setLoadingButtonIndex(null);
        }
    }, [mngstateInfo, getStageModelInfo]);

    // Create outline
    const createOutline = useCallback(() => {
        let setData = {
            webcamEnabled: true,
            imageSrcNone: false,
            showOutline: true,
        };

        if (mngstateInfo && mngstateInfo.datasets?.white_path) {
            setData.images_length = 1;
        }

        setWebcamEnabled(setData.webcamEnabled);
        setImageSrcNone(setData.imageSrcNone);
        setShowOutline(setData.showOutline);
        if (setData.images_length) {
            setImagesLength(setData.images_length);
        }
    }, [mngstateInfo]);

    // Close outline
    const closeOutline = useCallback(() => {
        setWebcamEnabled(false);
        setImageSrcNone(false);
        setShowOutline(false);
    }, []);

    // Data URL to blob
    const dataURLtoBlob = useCallback((dataURL) => {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }, []);

    // Capture image
    const captureImage = useCallback(async (labelName) => {
        if (mngstateInfo?.rectangles?.length > 0) {
            console.log('if');
            Swal.fire({
                title: "Do you want to Delete Drawn Regions?",
                icon: "warning",
                showDenyButton: true,
                confirmButtonColor: 'green',
                confirmButtonText: "Yes",
                denyButtonText: 'No',
                text: "Updating the outline will remove all previously drawn regions."
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await deleteDrawnRegions();
                    await captureOutlineImage();
                } else if (result.isDenied) {
                    return;
                }
            });
        } else {
            console.log('else');
            await captureOutlineImage();
        }
    }, [mngstateInfo]);

    // Capture outline image
    const captureOutlineImage = useCallback(async () => {
        setAddingImage(true);

        const outlineImageSrc = await webcamRef.current.capture();
        const { zoom: zoomVal, center } = webcamRef.current.getZoomAndCenter();
        const zoomValueData = { zoom: zoomVal, center: center };
        console.log(outlineImageSrc, zoomVal, center, 'zoom, center: ');

        if (!outlineImageSrc) {
            setImageSrcNone(true);
            return;
        }

        const blob = dataURLtoBlob(outlineImageSrc);
        const formData = new FormData();
        let imgUuid = uuidv4();
        formData.append('comp_id', mngstateInfo?.comp_id || compInfo?._id);
        formData.append('_id', mngstateInfo?._id);
        formData.append('imgName', blob, imgUuid + '.png');
        formData.append('outline_type', outlineType);
        formData.append('zoom_value', JSON.stringify(zoomValueData));

        sessionStorage.setItem('zoom_values', JSON.stringify(zoomValueData));
        setZoomValue(zoomValueData);

        try {
            const response = await urlSocket.post('/api/stage/addOutline_stg', formData, {
                headers: { 'content-type': 'multipart/form-data' },
                mode: 'no-cors'
            });
            console.log('response.data', response.data.stage_info[0])

            let getInfo = response.data;
            if (getInfo.error === "Tenant not found") {
                console.log("data error", getInfo.error);
                errorHandler(getInfo.error);
            } else {
                if (getInfo.message === 'Image successfully added') {
                    setResponseMessage(getInfo.message);
                    // setCompInfo(getInfo.comp_info[0]);
                    console.log('firstgetInfo.stage_info[0]', getInfo.stage_info[0])
                    setMngstateInfo(getInfo.stage_info[0]);
                    setImagesLength(getInfo.img_count);
                    setAddingImage(false);
                } else {
                    setResponseMessage(getInfo.message);
                    setAddingImage(false);
                }
                setTimeout(() => {
                    setResponseMessage("");
                }, 1000);
            }
        } catch (error) {
            console.log('error', error);
        }
    }, [mngstateInfo, outlineType, dataURLtoBlob, errorHandler]);

    // Delete drawn regions
    const deleteDrawnRegions = useCallback(async () => {
        let rectsData = [];
        try {
            const payload = {
                _id: mngstateInfo._id,
                rectangles: rectsData,
            };

            const response = await urlSocket.post('/api/regions/save_stg', payload);
            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                errorHandler(response.data.error);
            } else {
                console.log('firstresponse.data.result', response.data.result)
                setMngstateInfo(response.data.result);
                // setCompInfo(response.data.result);
                setRectangles([]);

                if (response.data.success === true) {
                    Swal.fire({
                        title: 'Drawn Regions Deleted Successfully',
                        icon: 'success',
                        showConfirmButton: false,
                        confirmButtonText: 'OK'
                    });
                }
            }
        } catch (error) {
            console.error('Error sending coordinates and image:', error.message);
        }
    }, [mngstateInfo, errorHandler]);



    // Handle change for model selection
    const handleChange = useCallback((e, modelType) => {
        const isChecked = e.target.checked;
        console.log("handleChange", isChecked, modelType)

        if (e.target.value.training_sts !== "Training Completed" && e.target.value.training_sts !== "No training required") {
            if (modelType == "ML") {
                Swal.fire({
                    icon: 'info',
                    title: 'Oops...',
                    text: "To continue, Add image to this Model's version",
                });
            } else if (modelType == "DL") {
                Swal.fire({
                    icon: 'info',
                    title: 'Oops...',
                    text: 'Training for this model has not been completed!',
                });
            }
        } else {
            if (isChecked) {
                setModelAccuracyTest(prev => [...prev, e.target.value]);
            } else {
                const updatedRows = modelAccuracyTest.filter(row => row !== e.target.value);
                console.log("updatedRows", updatedRows);
                setModelAccuracyTest(updatedRows);
            }

            const updatedCompModelInfo = stageModelInfo.map((data, index) => {
                if (data.model_name === e.target.name) {
                    return { ...data, checked: e.target.checked };
                }
                return data;
            });
            console.log("updatedRows", updatedCompModelInfo);
            setCompModelInfo(updatedCompModelInfo);
        }
    }, [modelAccuracyTest, compModelInfo]);

    // Select all or any
    const selectAllorAny = useCallback((e) => {
        setAllAny(e.target.value);
        setRadiobtn(true);
        if (e.target.value === 'Any') {
            setAnySelected(true);
        } else {
            setAnySelected(false);
        }
    }, []);

    // Accuracy test
    const acctest = useCallback((modelTestingData) => {
        const { componentTest, regionTest, selectedData } = modelTestingData;
        let modelInfoData = {
            config: config,
            testCompModelVerInfo: selectedData,
            allAny: allAny,
            page: 'manageModel',
            comp_position: 1,
            region_testing: regionTesting && regionTest,
        };

        if (selectFilter == 0) {
            modelInfoData['comp_position'] = 0;
        }
        if (regionTesting === true && regionTest === true) {
            modelInfoData['overall_testing'] = componentTest;
            modelInfoData['region_wise_testing'] = regionTest;
        }
        if ('detection_type' in modelTestingData) {
            modelInfoData['detection_type'] = modelTestingData.detection_type;
            modelInfoData['regions'] = modelTestingData.regions;
        }

        console.log('value: ', componentTest, regionTest, selectedData);
        sessionStorage.removeItem("model_info_data");
        sessionStorage.setItem("model_info_data", JSON.stringify(modelInfoData));
        history.push("/modelAccuracyTesting");
    }, [config, allAny, regionTesting, selectFilter, history]);

    // Toggle modal
    const toggleModal = useCallback(() => {
        setSelectedVersions([]);

        if (modelAccuracyTest.length !== 0) {
            setModalOpen(prev => !prev);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Model Selection Required',
                text: 'Select Any Model to Continue...',
            });
        }
    }, [modelAccuracyTest]);

    // Close modal
    const closeModal = useCallback(() => {
        setModalOpen(prev => !prev);
        setSelectedVersions([]);
    }, []);

    // Handle version select
    const handleVersionSelect = useCallback((modelIndex, versionIndex) => {
        const isSelected = selectedVersions.some(
            (v) => v.modelIndex === modelIndex && v.versionIndex === versionIndex
        );
        if (isSelected) {
            setSelectedVersions(prev => prev.filter(
                (v) => !(v.modelIndex === modelIndex && v.versionIndex === versionIndex)
            ));
        } else {
            setSelectedVersions(prev => [...prev, { modelIndex, versionIndex }]);
        }
    }, [selectedVersions]);

    // Get selected data
    const getSelectedData = useCallback(() => {
        const groupedData = new Map();

        selectedVersions.forEach(({ modelIndex, versionIndex }) => {
            const currentItem = modelAccuracyTest[modelIndex];
            const { comp_name, model_name } = currentItem;
            const key = `${comp_name}_${model_name}`;

            if (!groupedData.has(key)) {
                groupedData.set(key, {
                    ...currentItem,
                    trained_ver_list: [],
                    version_status: [],
                });
            }
            groupedData.get(key).trained_ver_list.push(currentItem.trained_ver_list[versionIndex]);
            groupedData.get(key).version_status.push(currentItem.version_status[versionIndex]);
        });

        const selectedData = Array.from(groupedData.values());
        return selectedData;
    }, [selectedVersions, modelAccuracyTest]);

    // Go to model version management
    const goTOModelVerMgmt = useCallback((compModelInfoData) => {
        sessionStorage.removeItem("compModelData");
        sessionStorage.setItem("compModelData", JSON.stringify(compModelInfoData));
        history.push('/StageModelVerInfo');
        // console.log("compinfo", compModelInfoData);
    }, [history]);

    // Back function
    const back = useCallback(() => {
        history.push("/manageStages");
    }, [history]);

    // Handle outline change
    const onOutlineChange = useCallback(async (value) => {
        setThresLoad(true);
        if (mngstateInfo.datasets.image_path) {
            let path = mngstateInfo.datasets.image_path;
            path = path.substring(0, path.lastIndexOf("/"));

            const pathParts = mngstateInfo.datasets.image_path.split('/');
            const filename = pathParts[pathParts.length - 1];
            let [file] = filename.split('.');

            try {
                const response = await urlSocket.post('/comp_outline_change', {
                    'path': path,
                    'filename': file,
                    'outline': value,
                    'id': mngstateInfo._id,
                    'outline_type': outlineType
                }, { mode: 'no-cors' });

                let getInfo = response.data;
                if (getInfo.error === "Tenant not found") {
                    console.log("data error", getInfo.error);
                    errorHandler(getInfo.error);
                } else {
                    setCompInfo(getInfo.comp_info[0]);
                }
            } catch (error) {
                console.log('error1266', error);
            }
            setOutlineThres(value);
            setThresLoad(false);
        }
    }, [mngstateInfo, outlineType, errorHandler]);

    // Handle select change for outline type
    const handleSelectChange = useCallback((event) => {
        setOutlineType(event.target.value);
    }, []);

    // Remove body CSS
    const removeBodyCss = useCallback(() => {
        document.body.classList.add("no_padding");
    }, []);

    // Region selection
    const regionSelection = useCallback(async (e) => {
        const data = await checkingRegionChanges();
        data.message = "Do you want to save changes?";
        setFullScreenLoading(false);
        setRegionSelecting(true);
        setRegionConfirmationDatas(data);
        console.log('data 895 regiondata', data);
    }, [checkingRegionChanges]);

    // Toggle xlarge modal
    const togXlarge1 = useCallback(async () => {
        console.log('🔍 DEBUG: togXlarge1 called');

        // Check if stage info exists
        if (!mngstateInfo) {
            console.log('❌ No stage info available');
            return;
        }

        // Check if any image path exists (single or multi-camera)
        let hasImagePath = false;
        let foundImagePath = null;

        // First check for multi-camera mode
        if (mngstateInfo?.camera_selection?.mode === 'multi') {
            console.log('🔍 Multi-camera mode detected');
            const cameras = mngstateInfo.camera_selection.cameras || [];

            // Check each camera for image path
            for (const camera of cameras) {
                const cameraPosition = camera.label.replace(/\s+/g, '_').toLowerCase();

                // Check multiple possible path formats
                const possibleKeys = [
                    `${cameraPosition}_image_path`,
                    `position_${cameraPosition}_image_path`,
                    `${cameraPosition}`,
                ];

                for (const key of possibleKeys) {
                    if (mngstateInfo[key]) {
                        hasImagePath = true;
                        foundImagePath = mngstateInfo[key];
                        console.log(`✅ Found image path for ${camera.label} at key ${key}:`, foundImagePath);
                        break;
                    }
                }

                if (hasImagePath) break;

                // Also check in datasets structure
                if (mngstateInfo.datasets?.[cameraPosition]?.image_path) {
                    hasImagePath = true;
                    foundImagePath = mngstateInfo.datasets[cameraPosition].image_path;


                    console.log(`✅ Found image path in datasets for ${camera.label}:`, foundImagePath);
                    break;
                }
            }
        } else {
            console.log('🔍 Single camera mode detected');
            // Single camera mode: check datasets.image_path
            if (mngstateInfo?.datasets?.image_path) {
                hasImagePath = true;
                foundImagePath = mngstateInfo.datasets.image_path;
                console.log('✅ Found single camera image path:', foundImagePath);
            }
        }

        if (!hasImagePath) {
            console.log('❌ No image path found for region selection');
            console.log('🔍 Available stage keys:', Object.keys(mngstateInfo || {}));
            console.log('🔍 Datasets structure:', mngstateInfo?.datasets);
            Swal.fire({
                title: 'No Image Available',
                text: 'Please capture an outline image first before creating regions.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        console.log('✅ Proceeding with region selection modal');

        const isRectangleChangedResult = isRectangleChanged();
        if (modalXlarge1 === true && isRectangleChangedResult) {
            await Swal.fire({
                title: "Do you want to save changes?",
                icon: "warning",
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonColor: 'green',
                confirmButtonText: "Save",
                denyButtonText: "Don't save"
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await saveRegionChanges();
                    setIsCreatingRegion(false);
                } else if (result.isDenied) {
                    Swal.fire("Changes are not saved", "", "info");
                    setRectangles(unchangesRectangles);
                    setModalXlarge1(false);
                    setRegionConfirmationDatas({});
                    setSelectedRectangleIndex(null);
                    setEditingRectangleIndex(null);
                    setResizingRectangleIndex(null);
                    setMovingRectangleIndex(null);
                    setIsCreatingRegion(false);
                }
            });
            return;
        }

        console.log('823 working');
        setModalXlarge1(prev => !prev);
        setSelectedRectangleIndex(null);
        setEditingRectangleIndex(null);
        setResizingRectangleIndex(null);
        setMovingRectangleIndex(null);

        if (!modalXlarge1) {
            let oldRectangles = [...rectangles];

            // Load existing rectangles from stage info if available
            if (mngstateInfo?.rectangles && mngstateInfo.rectangles.length > 0) {
                console.log('🔍 Loading existing rectangles from stage info:', mngstateInfo.rectangles.length);
                try {
                    const loadedRectangles = await updatingRectangles(mngstateInfo.rectangles);
                    setRectangles(loadedRectangles);
                    setPreviousRectangle(JSON.parse(JSON.stringify(loadedRectangles)));
                    oldRectangles = [...loadedRectangles];
                    console.log('✅ Rectangles loaded successfully:', loadedRectangles.length);
                } catch (error) {
                    console.error('❌ Error loading rectangles:', error);
                }
            }

            let imagePath = foundImagePath; // Use the path we already found


            if (imagePath) {
                console.log('🔍 Setting image source for region selection:', imagePath);
                const processedImageUrl = showImage(imagePath);
                const finalImageUrl = `${processedImageUrl}?timestamp=${new Date().getTime()}`;
                console.log('🔍 Final image URL:', finalImageUrl);

                setImageSrc(finalImageUrl);
                setUnchangesRectangles(oldRectangles);

                // Initialize canvas after a short delay to ensure DOM is ready
                setTimeout(() => {
                    if (canvasRef.current) {
                        console.log('✅ Canvas ref available, initializing...');
                        updateCanvasSize(); // Update canvas size
                    } else {
                        console.log('❌ Canvas ref not available after timeout');
                    }
                }, 200);
            } else {
                console.error('❌ No image path available for region selection');
                return;
            }
        }

        removeBodyCss();
        setIsCreatingRegion(false);
    }, [mngstateInfo, modalXlarge1, isRectangleChanged, saveRegionChanges, unchangesRectangles, rectangles, removeBodyCss]);

    // Mouse event handlers for canvas
    const handleMouseDown = useCallback((e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const zoomVal = zoom;

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let x, y;

        if (e?.type === 'mousedown') {
            if (zoomVal == 1) {
                x = ((e.clientX - rect.left) * scaleX) / zoomVal;
                y = ((e.clientY - rect.top) * scaleY) / zoomVal;
            } else {
                x = (e.clientX - rect.left) * scaleX;
                y = (e.clientY - rect.top) * scaleY;
            }
        } else if (e?.type === 'touchstart') {
            if (zoomVal == 1) {
                x = ((e.touches[0].clientX - rect.left) * scaleX) / zoomVal;
                y = ((e.touches[0].clientY - rect.top) * scaleY) / zoomVal;
            } else {
                x = (e.touches[0].clientX - rect.left) * scaleX;
                y = (e.touches[0].clientY - rect.top) * scaleY;
            }
        }

        const clickedIndex = rectangles.findIndex(rectangle =>
            x >= rectangle.x && x <= rectangle.x + rectangle.width &&
            y >= rectangle.y && y <= rectangle.y + rectangle.height
        );

        setSelectingRectangle(clickedIndex);
        setSelecting(true);

        rectangleRef.current = {
            x,
            y,
            width: 0,
            height: 0,
            name: rectNameInput,
            id: uuidv4(),
            colour: selectedColor,
        };
    }, [zoom, rectangles, rectNameInput, selectedColor]);

    // Mouse move handler
    const handleMouseMove = useCallback((e) => {
        if (selecting) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const zoomVal = zoom;

            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            let x, y;

            if (e?.type === 'mousemove') {
                if (zoomVal == 1) {
                    x = ((e.clientX - rect.left) * scaleX) / zoomVal;
                    y = ((e.clientY - rect.top) * scaleY) / zoomVal;
                } else {
                    x = (e.clientX - rect.left) * scaleX;
                    y = (e.clientY - rect.top) * scaleY;
                }
            } else if (e?.type === 'touchmove') {
                if (zoomVal == 1) {
                    x = ((e.touches[0].clientX - rect.left) * scaleX) / zoomVal;
                    y = ((e.touches[0].clientY - rect.top) * scaleY) / zoomVal;
                } else {
                    x = (e.touches[0].clientX - rect.left) * scaleX;
                    y = (e.touches[0].clientY - rect.top) * scaleY;
                }
            }

            if (nestedRectangleRef.current) {
                nestedRectangleRef.current.width = x - nestedRectangleRef.current.x;
                nestedRectangleRef.current.height = y - nestedRectangleRef.current.y;
            } else {
                rectangleRef.current.width = x - rectangleRef.current.x;
                rectangleRef.current.height = y - rectangleRef.current.y;
            }
        }
    }, [selecting, zoom]);

    // Mouse up handler
    const handleMouseUp = useCallback(() => {
        if (selecting) {
            if (nestedRectangleRef.current) {
                const { parentIndex, x, y, width, height, name } = nestedRectangleRef.current;
                if (width < 30 && height < 30) {
                    nestedRectangleRef.current = null;
                    setNestedRectNameInput('');
                } else {
                    const updatedRectangles = [...rectangles];
                    let updatedName = (!name) ? `${parentIndex + 1}_${updatedRectangles[parentIndex].nestedRectangles.length + 1}` : name;
                    updatedRectangles[parentIndex].nestedRectangles.push({ x, y, width, height, name: updatedName });
                    setRectangles(updatedRectangles);
                    setNestedRectNameInput('');
                    nestedRectangleRef.current = null;
                }
            } else {
                const { x, y, width, height, name, id, nestedRectangles, colour } = rectangleRef.current;
                if (width < 30 || height < 30) {
                    console.log('rectangle is too small.');
                    rectangleRef.current = null;
                    setRectNameInput('');
                    setSelectedRectangleIndex(selectingRectangle);
                    setResizingRectangleIndex(null);
                    setMovingRectangleIndex(null);
                } else {
                    const updatedRectangles = [...rectangles];
                    let i = 1;
                    let updatedName = `${updatedRectangles.length + i}`;
                    let isNameFound = updatedRectangles.some((item, index) => item.name == updatedName);
                    while (isNameFound) {
                        i = i + 1;
                        updatedName = `${updatedRectangles.length + i}`;
                        isNameFound = updatedRectangles.some((item, index) => item.name == updatedName);
                    }
                    updatedRectangles.push({ x, y, width, height, name: updatedName, id, colour });
                    setRectangles(updatedRectangles);
                    setRectNameInput('');
                    setSelectedRectangleIndex(null);
                    setResizingRectangleIndex(null);
                    setMovingRectangleIndex(null);
                    rectangleRef.current = null;
                }
            }
            setSelecting(false);
        }
    }, [selecting, rectangles, selectingRectangle]);

    // Handle name change
    const handleNameChange = useCallback((e) => {
        const { value } = e.target;
        const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        setInputRectangleName(sanitizedValue);
        setExistRectangleNameError(false);
    }, []);

    // Handle name submit
    const handleNameSubmit = useCallback((e, index) => {
        const isNameFound = rectangles.some((item, i) => item.name === inputRectangleName && i !== editingRectangleIndex);
        if (isNameFound) {
            setExistRectangleNameError(true);
        } else {
            const updatedRectangles = [...rectangles];
            if (editingRectangleIndex !== null) {
                updatedRectangles[editingRectangleIndex].name = inputRectangleName;
            }
            setRectangles(updatedRectangles);
            setShowRegionEditModal(false);
            setEditingRectangleIndex(null);
            setExistRectangleNameError(false);
            setInputRectangleName('');
        }
    }, [rectangles, inputRectangleName, editingRectangleIndex]);

    // Send coordinates to backend
    const sendCoordinatesToBackend = useCallback(async () => {
        setUpdatingRegions(true);

        const originalWidth = 640;
        const originalHeight = 480;
        const targetWidth = DEFAULT_RESOLUTION.width;
        const targetHeight = DEFAULT_RESOLUTION.height;

        const scaleX = targetWidth / originalWidth;
        const scaleY = targetHeight / originalHeight;

        const rectsData = rectangles.map(rect => ({
            id: rect.id,
            name: rect.name,
            coordinates: {
                x: rect.x * scaleX,
                y: rect.y * scaleY,
                width: rect.width * scaleX,
                height: rect.height * scaleY
            },
            colour: rect.colour
        }));

        console.log('**** rectsData ', rectsData, scaleX, scaleY);

        try {
            const payload = {
                _id: mngstateInfo._id,
                rectangles: rectsData,
                region_confirmation_datas: regionConfirmationDatas
            };



            const response = await urlSocket.post('/api/regions/save_stg', payload);
            console.log("response", response)
            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                errorHandler(response.data.error);
            } else {
                setCompInfo(response.data.result);
                if (response.data.success === true) {
                    const updatedRectangles = [...rectangles];

                    setModalXlarge1(false);
                    console.log('firstresponse.data.result', response.data.result)
                    setMngstateInfo(response.data.result);
                    setCompInfo(response.data.result);
                    setShowRegionConfirmation(false);
                    setRectangles(updatedRectangles);
                    setPreviousRectangle(JSON.parse(JSON.stringify(updatedRectangles)));
                    setSelectedRectangleIndex(null);
                    setEditingRectangleIndex(null);
                    setResizingRectangleIndex(null);
                    setMovingRectangleIndex(null);

                    const sessionData = JSON.parse(sessionStorage.getItem('managestageData'));
                    sessionData.mngstageInfo = response.data.result;
                    sessionStorage.setItem('managestageData', JSON.stringify(sessionData));

                    Swal.fire({
                        title: 'Region Values Updated Successfully',
                        icon: 'success',
                        showConfirmButton: false,
                    });
                }
            }
        } catch (error) {
            console.error('Error sending coordinates and image:', error.message);
        } finally {
            setUpdatingRegions(false);
            setRegionConfirmationDatas({});
        }
    }, [rectangles, mngstateInfo, regionConfirmationDatas, errorHandler]);

    // Delete selected rectangle
    const deleteSelectedRectangle = useCallback((clickedIndex) => {
        if (clickedIndex !== null && clickedIndex !== undefined && clickedIndex >= 0) {
            setRectangles(prev => prev.filter((_, index) => index !== clickedIndex));
        } else {
            if (selectedRectangleIndex !== null) {
                setRectangles(prev => prev.filter((_, index) => index !== selectedRectangleIndex));
                setSelectedRectangleIndex(null);
            }
        }
        setEditingRectangleIndex(null);
        setInputRectangleName('');
        setExistRectangleNameError(false);
    }, [selectedRectangleIndex]);

    // Edit selected rectangle
    const editSelectedRectangle = useCallback((clickedIndex) => {
        console.log("hi");
        setEditingRectangleIndex(clickedIndex);
        setInputRectangleName(rectangles[clickedIndex].name);
        setShowRegionEditModal(true);
    }, [rectangles]);

    // Resize selected rectangle
    const resizeSelectedRectangle = useCallback((clickedIndex) => {
        console.log("resize");
        setResizingRectangleIndex(clickedIndex);
    }, []);

    // Move selected rectangle
    const moveSelectedRectangle = useCallback((clickedIndex) => {
        setMovingRectangleIndex(clickedIndex);
    }, []);

    // Handle rectangle selection
    const handleRectangle = useCallback((clickedIndex) => {
        console.log("hui");
        setSelectedRectangleIndex(clickedIndex);
        setExistRectangleNameError(false);
    }, []);

    // Handle resize start
    const handleResizeStart = useCallback((e, index) => {
        e.stopPropagation();
        e.preventDefault();

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        let offsetX, offsetY;

        if (e.type === 'mousedown' || e.type === 'mousemove') {
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
        } else if (e.type === 'touchstart' || e.type === 'touchmove') {
            offsetX = e.touches[0].clientX - rect.left;
            offsetY = e.touches[0].clientY - rect.top;
        }

        const initialRect = rectangles[index];
        const initialX = initialRect.x;
        const initialY = initialRect.y;
        const initialWidth = initialRect.width;
        const initialHeight = initialRect.height;

        resizingRectIndexRef.current = index;

        const onMouseMove = debounce((moveEvent) => {
            let moveX, moveY;

            if (moveEvent.type === 'mousemove') {
                moveX = moveEvent.clientX - rect.left;
                moveY = moveEvent.clientY - rect.top;
            } else if (moveEvent.type === 'touchmove') {
                moveX = moveEvent.touches[0].clientX - rect.left;
                moveY = moveEvent.touches[0].clientY - rect.top;
            }

            if (resizingRectIndexRef.current !== index) return;

            let newWidth = initialWidth + moveX - offsetX;
            let newHeight = initialHeight + moveY - offsetY;

            newWidth = Math.min(newWidth, canvas.width - initialX);
            newHeight = Math.min(newHeight, canvas.height - initialY);

            requestAnimationFrame(() => {
                setRectangles(prev => {
                    const updated = [...prev];
                    updated[index] = {
                        ...initialRect,
                        width: newWidth > 40 ? newWidth : 40,
                        height: newHeight > 40 ? newHeight : 40,
                    };
                    return updated;
                });
            });
        }, 1);

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchmove', onMouseMove);
            document.removeEventListener('touchend', onMouseUp);
            resizingRectIndexRef.current = null;
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('touchmove', onMouseMove);
        document.addEventListener('touchend', onMouseUp);
    }, [rectangles, debounce]);

    // Handle move start
    const handleMoveStart = useCallback((e, index) => {
        e.stopPropagation();
        e.preventDefault();

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        let offsetX, offsetY;

        if (e.type === 'mousedown' || e.type === 'mousemove') {
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
        } else if (e.type === 'touchstart' || e.type === 'touchmove') {
            offsetX = e.touches[0].clientX - rect.left;
            offsetY = e.touches[0].clientY - rect.top;
        }

        const initialRect = rectangles[index];
        const initialX = initialRect.x;
        const initialY = initialRect.y;

        draggingRectIndexRef.current = index;

        const onMouseMove = debounce((moveEvent) => {
            let moveX, moveY;
            if (moveEvent.type === 'mousemove') {
                moveX = moveEvent.clientX - rect.left;
                moveY = moveEvent.clientY - rect.top;
            } else if (moveEvent.type === 'touchmove') {
                moveX = moveEvent.touches[0].clientX - rect.left;
                moveY = moveEvent.touches[0].clientY - rect.top;
            }

            if (draggingRectIndexRef.current !== index) return;

            let newX = initialX + moveX - offsetX;
            let newY = initialY + moveY - offsetY;

            newX = Math.max(0, Math.min(newX, canvas.width - initialRect.width));
            newY = Math.max(0, Math.min(newY, canvas.height - initialRect.height));

            requestAnimationFrame(() => {
                setRectangles(prev => {
                    const updated = [...prev];
                    updated[index] = {
                        ...initialRect,
                        x: newX,
                        y: newY
                    };
                    return updated;
                });
            });
        }, 1);

        const onEnd = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onEnd);
            document.removeEventListener('touchmove', onMouseMove);
            document.removeEventListener('touchend', onEnd);
            draggingRectIndexRef.current = null;
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchmove', onMouseMove);
        document.addEventListener('touchend', onEnd);
    }, [rectangles, debounce]);

    // Zoom functions
    const handleZoomIn = useCallback(() => {
        setZoom(prev => {
            if (prev < 1.7) {
                return prev * 1.2;
            }
            return prev;
        });
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom(prev => {
            if (prev > 0.7) {
                return prev / 1.2;
            }
            return prev;
        });
    }, []);

    const handleZoomReset = useCallback(() => {
        setZoom(1);
    }, []);

    // Handle show region toggle
    const handleShowRegion = useCallback(() => {
        setShowRegion(prev => !prev);
    }, []);
    const handleManageClick = async (data) => {
        console.log('data :>> ', data);
        try {
            let dataaa = JSON.parse(sessionStorage.getItem('managestageData'));
            console.log("dataaa", dataaa);

            const stageId = dataaa.ManageStage?._id;
            const payload = { stage_id: stageId };
            console.log("payload", payload);

            const response = await urlSocket.post('/check_regions', payload, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.data.success) {
                Swal.fire({
                    title: 'Region Check Failed',
                    text: 'Please draw and save at least one region before managing.',
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });
                return;
            }

            // ✅ All good, proceed
            goTOModelVerMgmt(data);

        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Error',
                text: 'Could not validate regions. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    };




    // const handleMultiCameraShowRegion = useCallback((cameraIndex) => {
    //     setCameraRegionStates(prev => ({
    //         ...prev,
    //         [cameraIndex]: {
    //             ...prev[cameraIndex],
    //             showRegion: !prev[cameraIndex]?.showRegion,
    //             rectangles: prev[cameraIndex]?.rectangles || [] // ensure array exists
    //         }
    //     }));
    // }, []);



    const createMultiCameraRegion = useCallback((cameraIndex) => {
        console.log("createregion", cameraIndex);
        setCameraRegionStates(prev => ({
            ...prev,
            [cameraIndex]: {
                ...prev[cameraIndex],
                isCreatingRegion: true,
                showRegion: true,
                rectangles: prev[cameraIndex]?.rectangles || [] // Keep existing rectangles, don't add a default one
            }
        }));
    }, []);

    const drawMultiCameraRegions = useCallback((cameraIndex, imagePath) => {
        const canvas = cameraCanvasRefs.current[cameraIndex];
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const regionState = cameraRegionStates[cameraIndex];

        const imageUrl = showImage(imagePath);

        const drawWithZoom = (img) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Apply zoom transformation
            ctx.save();
            if (zoom !== 1) {
                // Center the zoom
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                ctx.translate(centerX, centerY);
                ctx.scale(zoom, zoom);
                ctx.translate(-centerX, -centerY);
            }

            // Draw image
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Draw rectangles
            if (regionState?.showRegion) {
                regionState?.rectangles?.forEach((r, index) => {
                    const isSelected = index === regionState.selectedRectangleIndex;
                    ctx.save();
                    ctx.lineWidth = isSelected ? 4 : 2;
                    ctx.strokeStyle = isSelected ? "#50a5f1" : r.colour || "blue";
                    ctx.strokeRect(r.x, r.y, r.width, r.height);

                    // --- White dot for move ---
                    if (isSelected && moveMode) {
                        const handleSize = 10;
                        ctx.fillStyle = "white";
                        ctx.beginPath();
                        ctx.arc(r.x + handleSize / 2, r.y + handleSize / 2, handleSize / 2, 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.strokeStyle = "black";
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }

                    // --- Draw label ---
                    ctx.font = "bold 14px Arial";
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = "black";
                    ctx.strokeText(r.name, r.x + 10, r.y + 15);
                    ctx.fillStyle = "white";
                    ctx.fillText(r.name, r.x + 10, r.y + 15);

                    // --- Draw trash/delete icon ---
                    const trashSize = 15;
                    const trashwidthsize = 12;
                    const padding = 4;
                    r.deleteIcon = {
                        x: r.x + r.width - trashSize - padding,
                        y: r.y + padding,
                        width: trashwidthsize,
                        height: trashSize
                    };

                    ctx.fillStyle = "red";
                    ctx.strokeStyle = "black";
                    ctx.lineWidth = 1;
                    ctx.fillRect(r.deleteIcon.x, r.deleteIcon.y, trashSize, trashSize * 0.8);
                    ctx.strokeRect(r.deleteIcon.x, r.deleteIcon.y, trashSize, trashSize * 0.8);
                    ctx.fillRect(r.deleteIcon.x + trashSize * 0.25, r.deleteIcon.y - trashSize * 0.2, trashSize * 0.5, trashSize * 0.2);
                    ctx.strokeRect(r.deleteIcon.x + trashSize * 0.25, r.deleteIcon.y - trashSize * 0.2, trashSize * 0.5, trashSize * 0.2);

                    ctx.restore();
                });
            }

            ctx.restore();
        };

        if (imageCache.current[imageUrl]) {
            drawWithZoom(imageCache.current[imageUrl]);
        } else {
            const img = new Image();
            img.onload = () => {
                imageCache.current[imageUrl] = img;
                drawWithZoom(img);
            };
            img.src = imageUrl;
        }
    }, [cameraCanvasRefs, cameraRegionStates, zoom, moveMode]);


    //Bharani
    // const handleMultiCameraShowRegion = useCallback((cameraIndex) => {
    //     setCameraRegionStates(prev => {
    //         const updated = {
    //             ...prev,
    //             [cameraIndex]: {
    //                 ...prev[cameraIndex],
    //                 showRegion: !prev[cameraIndex]?.showRegion,
    //                 rectangles: prev[cameraIndex]?.rectangles || []
    //             }
    //         };

    //         // trigger a redraw after state update
    //         if (activeImagePath) {
    //             requestAnimationFrame(() => {
    //                 drawMultiCameraRegions(cameraIndex, activeImagePath);
    //             });
    //         }

    //         return updated;
    //     });
    // }, [activeImagePath, drawMultiCameraRegions]);


    //Chiran
    const handleMultiCameraShowRegion = useCallback((cameraIndex) => {
        setCameraRegionStates(prev => {
            const prevState = prev[cameraIndex] || {};
            const newShowRegion = !prevState.showRegion;

            // 🧹 Stop any ongoing drawing when hiding regions
            if (!newShowRegion) {
                setActionState({
                    isDragging: false,
                    isResizing: false,
                    rectIndex: null,
                    cameraIndex: null,
                    startX: null,
                    startY: null,
                });
                setResizeState(prev => ({ ...prev, isResizing: false }));
                setMoveMode(false);
            }

            return {
                ...prev,
                [cameraIndex]: {
                    ...prevState,
                    showRegion: newShowRegion,
                    isDrawing: false,
                    startX: null,
                    startY: null,
                }
            };
        });
    }, [setCameraRegionStates, setActionState, setResizeState, setMoveMode]);


    useEffect(() => {
        if (!activeImagePath) return;
        if (activeCameraIndex == null) return;

        const regionState = cameraRegionStates[activeCameraIndex];

        // Only redraw if not currently drawing to avoid interference with mouse events
        if (!regionState?.isDrawing) {
            const timer = setTimeout(() => {
                drawMultiCameraRegions(activeCameraIndex, activeImagePath);
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [activeImagePath, activeCameraIndex, cameraRegionStates, drawMultiCameraRegions]);

    // Cleanup image cache when component unmounts or camera changes
    useEffect(() => {
        return () => {
            // Clear image cache when component unmounts
            imageCache.current = {};
        };
    }, []);

    // Clear cache when switching cameras to prevent memory issues
    useEffect(() => {
        // Clear cache when active camera changes to ensure fresh images
        if (activeCameraIndex !== null) {
            // Keep only the current camera's image in cache
            const currentImageUrl = activeImagePath ? showImage(activeImagePath) : null;
            if (currentImageUrl && imageCache.current[currentImageUrl]) {
                const currentImage = imageCache.current[currentImageUrl];
                imageCache.current = { [currentImageUrl]: currentImage };
            } else {
                imageCache.current = {};
            }
        }
    }, [activeCameraIndex, activeImagePath, showImage]);





    // Initialize active camera for regions when modal opens
    useEffect(() => {
        if (showMultiCameraRegion && !activeCameraForRegion && mngstateInfo?.camera_selection?.cameras?.length > 0) {
            setActiveCameraForRegion(mngstateInfo.camera_selection.cameras[0].originalLabel);
            console.log("camera.label", mngstateInfo.camera_selection.cameras[0].originalLabel);
            console.log("mngstateInfo.camera_selection.cameras[0].originalLabel", mngstateInfo.camera_selection.cameras[0].originalLabel);
        }
    }, [showMultiCameraRegion, activeCameraForRegion, mngstateInfo]);


    // const getCanvasCoords = (e, canvas) => {
    //     const rect = canvas.getBoundingClientRect();

    //     // Scale factor between displayed size vs. actual canvas resolution
    //     const scaleX = canvas.width / rect.width;
    //     const scaleY = canvas.height / rect.height;

    //     return {
    //         x: (e.clientX - rect.left) * scaleX,
    //         y: (e.clientY - rect.top) * scaleY
    //     };
    // };
    const getCanvasCoords = (e, canvas) => {
        const rect = canvas.getBoundingClientRect();
        const zoomVal = zoom;
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let x, y;

        if (e?.type === 'mousedown' || e?.type === 'mousemove' || e?.type === 'mouseup') {
            if (zoomVal === 1) {
                x = ((e.clientX - rect.left) * scaleX) / zoomVal;
                y = ((e.clientY - rect.top) * scaleY) / zoomVal;
            } else {
                x = (e.clientX - rect.left) * scaleX;
                y = (e.clientY - rect.top) * scaleY;
            }
        } else if (e?.type === 'touchstart' || e?.type === 'touchmove' || e?.type === 'touchend') {
            if (zoomVal === 1) {
                x = ((e.touches[0].clientX - rect.left) * scaleX) / zoomVal;
                y = ((e.touches[0].clientY - rect.top) * scaleY) / zoomVal;
            } else {
                x = (e.touches[0].clientX - rect.left) * scaleX;
                y = (e.touches[0].clientY - rect.top) * scaleY;
            }
        }

        return { x, y };
    };
    const imageCache = useRef({});


    const isOnResizeHandle = (x, y, rect, size = 12) => {
        const hx = rect.x + rect.width - size;   // put the whole square inside the rect
        const hy = rect.y + rect.height - size;
        return x >= hx && x <= hx + size && y >= hy && y <= hy + size;
    };

    // const startResizeMode = (cameraIndex, rectIndex) => {
    //     // mark which rect is selected so the handle renders
    //     setCameraRegionStates(prev => {
    //         const cam = prev[cameraIndex] || {};
    //         return {
    //             ...prev,
    //             [cameraIndex]: {
    //                 ...cam,
    //                 selectedRectangleIndex: rectIndex, // important
    //                 showRegion: true,                  // ensure drawn
    //             }
    //         };
    //     });

    //     // turn handles on for that camera + rect
    //     setResizeState({
    //         isResizing: false,
    //         cameraIndex,
    //         rectIndex,
    //         startX: 0,
    //         startY: 0,
    //         startWidth: 0,
    //         startHeight: 0,
    //         showHandles: true,
    //     });

    //     // force a redraw so the handle appears immediately
    //     if (activeImagePath) {
    //         drawMultiCameraRegions(cameraIndex, activeImagePath);
    //     }
    // };

    // Helper: detect which handle we're over


    const startResizeMode = (cameraIndex, rectIndex) => {
        console.log("started resizing");
        if (!showRegion) return;
        setCameraRegionStates(prev => {
            const cam = prev[cameraIndex] || {};

            const newCam = {
                ...cam,
                selectedRectangleIndex: rectIndex,
            };

            const newState = {
                ...prev,
                [cameraIndex]: newCam,
            };


            const regionVisible = (typeof newCam.showRegion === 'boolean') ? newCam.showRegion : showRegion;
            if (activeImagePath && regionVisible) {

                requestAnimationFrame(() => drawMultiCameraRegions(cameraIndex, activeImagePath));
            }

            return newState;
        });


        setResizeState({
            isResizing: false,
            cameraIndex,
            rectIndex,
            startX: 0,
            startY: 0,
            startWidth: 0,
            startHeight: 0,
            showHandles: true,
        });
    };



    function getHandleAtPosition(x, y, rect, handleSize = 6) {
        // corners
        if (
            Math.abs(x - rect.x) <= handleSize &&
            Math.abs(y - rect.y) <= handleSize
        ) return "nw"; // top-left

        if (
            Math.abs(x - (rect.x + rect.width)) <= handleSize &&
            Math.abs(y - rect.y) <= handleSize
        ) return "ne"; // top-right

        if (
            Math.abs(x - rect.x) <= handleSize &&
            Math.abs(y - (rect.y + rect.height)) <= handleSize
        ) return "sw"; // bottom-left

        if (
            Math.abs(x - (rect.x + rect.width)) <= handleSize &&
            Math.abs(y - (rect.y + rect.height)) <= handleSize
        ) return "se"; // bottom-right

        // edges
        if (Math.abs(y - rect.y) <= handleSize &&
            x >= rect.x && x <= rect.x + rect.width)
            return "n"; // top edge

        if (Math.abs(y - (rect.y + rect.height)) <= handleSize &&
            x >= rect.x && x <= rect.x + rect.width)
            return "s"; // bottom edge

        if (Math.abs(x - rect.x) <= handleSize &&
            y >= rect.y && y <= rect.y + rect.height)
            return "w"; // left edge

        if (Math.abs(x - (rect.x + rect.width)) <= handleSize &&
            y >= rect.y && y <= rect.y + rect.height)
            return "e"; // right edge

        return null;
    }

    // const deleteMultiCameraRegion = useCallback(async (cameraIndex, regionIndex, regionData) => {
    //     try {
    //         const isSaved = !!regionData.id; // If id exists, it's saved

    //         // Confirm deletion
    //         const result = await Swal.fire({
    //             title: 'Delete Region?',
    //             text: `Are you sure you want to delete "${regionData.name}"?`,
    //             icon: 'warning',
    //             showCancelButton: true,
    //             confirmButtonColor: '#d33',
    //             cancelButtonColor: '#3085d6',
    //             confirmButtonText: 'Yes, delete it!'
    //         });

    //         if (!result.isConfirmed) return;

    //         if (isSaved) {
    //             // Prepare payload and call API for saved region
    //             const selectedCamera = mngstateInfo?.camera_selection?.cameras?.[cameraIndex];
    //             const cameraLabel = selectedCamera?.label?.toLowerCase()?.replace(/\s+/g, '_');

    //             const deletePayload = {
    //                 _id: mngstateInfo?._id || backupStageIds._id,
    //                 comp_id: mngstateInfo?.comp_id || compInfo?._id || backupStageIds.comp_id,
    //                 camera_index: cameraIndex,
    //                 camera_label: cameraLabel,
    //                 region_id: regionData.id,
    //                 region_name: regionData.name,
    //                 multi_camera: true
    //             };

    //             const response = await urlSocket.post('/api/regions/delete_multi_camera_region', deletePayload);

    //             if (!response.data.success) throw new Error(response.data.message || 'Failed to delete region');
    //         }

    //         // Remove from local state directly for both saved and unsaved
    //         setCameraRegionStates(prev => ({
    //             ...prev,
    //             [cameraIndex]: {
    //                 ...prev[cameraIndex],
    //                 rectangles: prev[cameraIndex].rectangles.filter((_, i) => i !== regionIndex),
    //                 selectedRectangleIndex: prev[cameraIndex].selectedRectangleIndex === regionIndex ? null : prev[cameraIndex].selectedRectangleIndex
    //             }
    //         }));

    //         Swal.fire({
    //             icon: 'success',
    //             title: 'Deleted!',
    //             text: `Region "${regionData.name}" has been deleted.`,
    //             timer: 2000,
    //             showConfirmButton: false
    //         });

    //     } catch (error) {
    //         console.error('Error deleting region:', error);
    //         Swal.fire({
    //             icon: 'error',
    //             title: 'Delete Failed',
    //             text: error.message || 'Failed to delete region. Please try again.',
    //             confirmButtonText: 'OK'
    //         });
    //     }
    // }, [mngstateInfo, compInfo, backupStageIds])

    // MouseDown — start drawing
    const deleteMultiCameraRegion = useCallback(async (cameraIndex, regionIndex, regionData) => {
        try {
            const isSaved = !!regionData.id; // If id exists, it's saved

            // Confirm deletion
            const result = await Swal.fire({
                title: 'Delete Region?',
                text: `Are you sure you want to delete "${regionData.name}"?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            });

            if (!result.isConfirmed) return;

            if (isSaved) {
                // Prepare payload and call API for saved region
                const selectedCamera = mngstateInfo?.camera_selection?.cameras?.[cameraIndex];
                const cameraLabel = selectedCamera?.label
                const checkRes = await urlSocket.post('/api/regions/check_training_status', {
                    stage_id: mngstateInfo?._id,
                    camera_label: cameraLabel
                });

                const trainingStatus = checkRes.data.training_status;
                console.log('Training status before delete:', trainingStatus);

                // ✅ Step 2: If training completed, confirm reset
                if (trainingStatus === 'training completed') {
                    const confirmReset = await Swal.fire({
                        title: 'Training Completed',
                        text: 'Training has been completed for this camera. Deleting this region will reset the training status. Continue?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Yes, delete & reset training',
                        cancelButtonText: 'No, cancel'
                    });

                    if (!confirmReset.isConfirmed) {
                        Swal.fire('Cancelled', 'Region deletion cancelled.', 'info');
                        return;
                    }
                }
                const deletePayload = {
                    _id: mngstateInfo?._id || backupStageIds._id,
                    comp_id: mngstateInfo?.comp_id || compInfo?._id || backupStageIds.comp_id,
                    camera_index: cameraIndex,
                    camera_label: cameraLabel,
                    region_id: regionData.id,
                    region_name: regionData.name,
                    multi_camera: true
                };

                const response = await urlSocket.post('/api/regions/delete_multi_camera_region', deletePayload);

                if (!response.data.success) throw new Error(response.data.message || 'Failed to delete region');
            }

            // Remove from local state directly for both saved and unsaved
            setCameraRegionStates(prev => ({
                ...prev,
                [cameraIndex]: {
                    ...prev[cameraIndex],
                    rectangles: prev[cameraIndex].rectangles.filter((_, i) => i !== regionIndex),
                    selectedRectangleIndex: prev[cameraIndex].selectedRectangleIndex === regionIndex ? null : prev[cameraIndex].selectedRectangleIndex
                }
            }));

            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: `Region "${regionData.name}" has been deleted.`,
                timer: 2000,
                showConfirmButton: false
            });

        } catch (error) {
            console.error('Error deleting region:', error);
            Swal.fire({
                icon: 'error',
                title: 'Delete Failed',
                text: error.message || 'Failed to delete region. Please try again.',
                confirmButtonText: 'OK'
            });
        }
    }, [mngstateInfo, compInfo, backupStageIds])


    const handleMultiCameraMouseDown = useCallback((e, cameraIndex) => {
        const canvas = cameraCanvasRefs.current[cameraIndex];
        if (!canvas) return;

        const { x, y } = getCanvasCoords(e, canvas);
        const regionState = cameraRegionStates[cameraIndex];
        if (!regionState) return;
        if (!regionState.showRegion) return;


        let clickedRectIndex = null;

        // --- Resize handle ---
        if (resizeState.showHandles && resizeState.cameraIndex === cameraIndex && resizeState.rectIndex !== null) {
            const rect = regionState.rectangles?.[resizeState.rectIndex];
            if (rect) {
                const handle = getHandleAtPosition(x, y, rect);
                if (handle) {
                    setResizeState(prev => ({
                        ...prev,
                        isResizing: true,
                        activeHandle: handle,
                        startX: x,
                        startY: y,
                        startWidth: rect.width,
                        startHeight: rect.height,
                        startRectX: rect.x,
                        startRectY: rect.y,
                    }));
                    canvas.style.cursor =
                        handle === "n" || handle === "s"
                            ? "ns-resize"
                            : handle === "e" || handle === "w"
                                ? "ew-resize"
                                : handle === "ne" || handle === "sw"
                                    ? "nesw-resize"
                                    : "nwse-resize";
                    e.preventDefault();
                    return;
                }
            }
        }

        // --- Move mode (relocate) ---
        if (moveMode && regionState.selectedRectangleIndex !== null) {
            const rect = regionState.rectangles[regionState.selectedRectangleIndex];

            if (rect) {
                const handleSize = 10;
                const dotX = rect.x + handleSize / 2;
                const dotY = rect.y + handleSize / 2;

                if (Math.abs(x - dotX) <= handleSize / 2 && Math.abs(y - dotY) <= handleSize / 2) {
                    setActionState({
                        isDragging: true,
                        isResizing: false,
                        rectIndex: regionState.selectedRectangleIndex,
                        cameraIndex,
                        startX: x,
                        startY: y,
                    });
                    canvas.style.cursor = "move";
                    e.preventDefault();
                    return;
                }
            }
        }

        // --- Detect click inside rectangle for selection or delete ---
        let actionHandled = false;
        regionState.rectangles?.forEach((r, i) => {
            if (actionHandled) return;

            // Delete icon click
            if (
                r.deleteIcon &&
                x >= r.deleteIcon.x &&
                x <= r.deleteIcon.x + r.deleteIcon.width &&
                y >= r.deleteIcon.y &&
                y <= r.deleteIcon.y + r.deleteIcon.height
            ) {
                deleteMultiCameraRegion(cameraIndex, i, r);

                // --- Reset drawing state to prevent ghost rectangle ---
                setCameraRegionStates(prev => ({
                    ...prev,
                    [cameraIndex]: {
                        ...prev[cameraIndex],
                        isDrawing: false,
                        startX: null,
                        startY: null,
                        selectedRectangleIndex: null, // optional: deselect any rectangle
                    },
                }));

                e.preventDefault();
                actionHandled = true;
                return;
            }

            // --- Check click inside rectangle for selection ---
            if (x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height) {
                clickedRectIndex = i;
            }
        });

        // --- Select rectangle if clicked ---
        if (clickedRectIndex !== null && !actionHandled) {
            setCameraRegionStates(prev => ({
                ...prev,
                [cameraIndex]: {
                    ...prev[cameraIndex],
                    selectedRectangleIndex: clickedRectIndex,
                    isDragging: false,
                    dragStartX: x,
                    dragStartY: y,
                },
            }));
            canvas.style.cursor = moveMode ? "move" : "default";
            return;
        }

        // --- Start drawing new rectangle only if moveMode is OFF and no action handled ---
        if (!moveMode && !actionHandled) {
            setCameraRegionStates(prev => ({
                ...prev,
                [cameraIndex]: {
                    ...prev[cameraIndex],
                    startX: x,
                    startY: y,
                    isDrawing: true,
                },
            }));
        }

    }, [cameraCanvasRefs, cameraRegionStates, resizeState, moveMode, deleteMultiCameraRegion]);

    // MouseMove — live preview with selectedColor
    // const handleMultiCameraMouseMove = useCallback((e, cameraIndex) => {
    //     const canvas = cameraCanvasRefs.current[cameraIndex];
    //     if (!canvas) return;

    //     const ctx = canvas.getContext("2d");
    //     const { x: currentX, y: currentY } = getCanvasCoords(e, canvas);
    //     const regionState = cameraRegionStates[cameraIndex];
    //     if (!regionState) return;

    //     let cursor = "default";

    //     // --- MOVE MODE: dragging a rectangle ---
    //     if (actionState.isDragging && moveMode && !actionState.isResizing) {
    //         const dx = currentX - actionState.startX;
    //         const dy = currentY - actionState.startY;

    //         setCameraRegionStates(prev => {
    //             const updatedRects = [...prev[cameraIndex].rectangles];
    //             const rect = updatedRects[actionState.rectIndex];

    //             // Clamp rectangle within canvas edges
    //             rect.x = Math.max(0, Math.min(canvas.width - rect.width, rect.x + dx));
    //             rect.y = Math.max(0, Math.min(canvas.height - rect.height, rect.y + dy));

    //             return {
    //                 ...prev,
    //                 [cameraIndex]: {
    //                     ...prev[cameraIndex],
    //                     rectangles: updatedRects,
    //                 }
    //             };
    //         });

    //         setActionState(prev => ({
    //             ...prev,
    //             startX: currentX,
    //             startY: currentY,
    //         }));

    //         canvas.style.cursor = "move";
    //         if (activeImagePath) drawMultiCameraRegions(cameraIndex, activeImagePath);
    //         return;
    //     }

    //     // --- RESIZE MODE ---
    //     if (
    //         resizeState.isResizing &&
    //         resizeState.cameraIndex === cameraIndex &&
    //         resizeState.rectIndex !== null
    //     ) {
    //         setCameraRegionStates(prev => {
    //             const cam = prev[cameraIndex];
    //             if (!cam) return prev;
    //             const rects = [...(cam.rectangles || [])];
    //             const r = { ...rects[resizeState.rectIndex] };

    //             // Clamp width/height and edges
    //             r.width = Math.max(5, Math.min(canvas.width - r.x, resizeState.startWidth + (currentX - resizeState.startX)));
    //             r.height = Math.max(5, Math.min(canvas.height - r.y, resizeState.startHeight + (currentY - resizeState.startY)));

    //             rects[resizeState.rectIndex] = r;

    //             return {
    //                 ...prev,
    //                 [cameraIndex]: {
    //                     ...cam,
    //                     rectangles: rects
    //                 }
    //             };
    //         });

    //         canvas.style.cursor = "nwse-resize";
    //         if (activeImagePath) drawMultiCameraRegions(cameraIndex, activeImagePath);
    //         return;
    //     }

    //     // --- CHANGE CURSOR OVER HANDLE or RECTANGLE ---
    //     const selectedRect = resizeState.rectIndex !== null ? regionState.rectangles?.[resizeState.rectIndex] : null;
    //     if (selectedRect) {
    //         const handle = getHandleAtPosition(currentX, currentY, selectedRect);
    //         switch (handle) {
    //             case "nw":
    //             case "se": cursor = "nwse-resize"; break;
    //             case "ne":
    //             case "sw": cursor = "nesw-resize"; break;
    //             case "n":
    //             case "s": cursor = "ns-resize"; break;
    //             case "e":
    //             case "w": cursor = "ew-resize"; break;
    //             default:
    //                 if (
    //                     currentX >= selectedRect.x &&
    //                     currentX <= selectedRect.x + selectedRect.width &&
    //                     currentY >= selectedRect.y &&
    //                     currentY <= selectedRect.y + selectedRect.height
    //                 ) cursor = moveMode ? "move" : "default";
    //         }
    //     }

    //     canvas.style.cursor = cursor;

    //     // --- DRAW SCENE WITH ZOOM ---
    //     const imageUrl = showImage(activeImagePath);
    //     const drawScene = (img) => {
    //         requestAnimationFrame(() => {
    //             ctx.clearRect(0, 0, canvas.width, canvas.height);

    //             // Apply zoom transformation
    //             ctx.save();
    //             if (zoom !== 1) {
    //                 const centerX = canvas.width / 2;
    //                 const centerY = canvas.height / 2;
    //                 ctx.translate(centerX, centerY);
    //                 ctx.scale(zoom, zoom);
    //                 ctx.translate(-centerX, -centerY);
    //             }

    //             ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    //             regionState.rectangles?.forEach((r, index) => {
    //                 const isSelected = index === regionState.selectedRectangleIndex;
    //                 ctx.save();
    //                 ctx.lineWidth = isSelected ? 4 : 2;
    //                 ctx.strokeStyle = isSelected ? "#50a5f1" : r.colour || "blue";
    //                 ctx.strokeRect(r.x, r.y, r.width, r.height);

    //                 // --- White dot for move ---
    //                 if (isSelected && moveMode) {
    //                     const handleSize = 10;
    //                     ctx.fillStyle = "white";
    //                     ctx.beginPath();
    //                     ctx.arc(r.x + handleSize / 2, r.y + handleSize / 2, handleSize / 2, 0, 2 * Math.PI);
    //                     ctx.fill();
    //                     ctx.strokeStyle = "black";
    //                     ctx.lineWidth = 1;
    //                     ctx.stroke();
    //                 }

    //                 // --- Draw label ---
    //                 ctx.font = "bold 14px Arial";
    //                 ctx.lineWidth = 3;
    //                 ctx.strokeStyle = "black";
    //                 ctx.strokeText(r.name, r.x + 10, r.y + 15);
    //                 ctx.fillStyle = "white";
    //                 ctx.fillText(r.name, r.x + 10, r.y + 15);

    //                 // --- Draw trash/delete icon ---
    //                 const trashSize = 15;
    //                 const trashwidthsize = 12;
    //                 const padding = 4;
    //                 r.deleteIcon = {
    //                     x: r.x + r.width - trashSize - padding,
    //                     y: r.y + padding,
    //                     width: trashwidthsize,
    //                     height: trashSize
    //                 };

    //                 ctx.fillStyle = "red";
    //                 ctx.strokeStyle = "black";
    //                 ctx.lineWidth = 1;
    //                 ctx.fillRect(r.deleteIcon.x, r.deleteIcon.y, trashSize, trashSize * 0.8);
    //                 ctx.strokeRect(r.deleteIcon.x, r.deleteIcon.y, trashSize, trashSize * 0.8);
    //                 ctx.fillRect(r.deleteIcon.x + trashSize * 0.25, r.deleteIcon.y - trashSize * 0.2, trashSize * 0.5, trashSize * 0.2);
    //                 ctx.strokeRect(r.deleteIcon.x + trashSize * 0.25, r.deleteIcon.y - trashSize * 0.2, trashSize * 0.5, trashSize * 0.2);

    //                 ctx.restore();
    //             });

    //             // --- DRAW NEW RECTANGLE LIVE ONLY IF NOT IN MOVE MODE ---
    //             if (!moveMode && regionState.isDrawing) {
    //                 const clamp = (val, min, max) => Math.max(min, Math.min(val, max));
    //                 const startX = clamp(regionState.startX, 0, canvas.width);
    //                 const startY = clamp(regionState.startY, 0, canvas.height);
    //                 const endX = clamp(currentX, 0, canvas.width);
    //                 const endY = clamp(currentY, 0, canvas.height);

    //                 const w = endX - startX;
    //                 const h = endY - startY;

    //                 ctx.save();
    //                 ctx.lineWidth = 2;
    //                 ctx.strokeStyle = selectedColor || "blue";
    //                 ctx.strokeRect(startX, startY, w, h);
    //                 ctx.restore();
    //             }

    //             ctx.restore();
    //         });
    //     };

    //     if (imageCache.current[imageUrl]) drawScene(imageCache.current[imageUrl]);
    //     else {
    //         const img = new Image();
    //         img.onload = () => {
    //             imageCache.current[imageUrl] = img;
    //             drawScene(img);
    //         };
    //         img.src = imageUrl;
    //     }

    // }, [cameraRegionStates, cameraCanvasRefs, resizeState, actionState, moveMode, activeImagePath, selectedColor, zoom]);

    const handleMultiCameraMouseMove = useCallback((e, cameraIndex) => {
        const canvas = cameraCanvasRefs.current[cameraIndex];
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const { x: currentX, y: currentY } = getCanvasCoords(e, canvas);
        const regionState = cameraRegionStates[cameraIndex];
        if (!regionState) return;
        if (!regionState.showRegion) return;


        let cursor = "default";

        // --- MOVE MODE: dragging a rectangle ---
        if (actionState.isDragging && moveMode && !actionState.isResizing) {
            const dx = currentX - actionState.startX;
            const dy = currentY - actionState.startY;

            setCameraRegionStates(prev => {
                const camState = prev[cameraIndex];
                if (!camState) return prev;

                const updatedRects = camState.rectangles.map((rect, i) => {
                    if (i === actionState.rectIndex) {
                        return {
                            ...rect,
                            x: Math.max(0, Math.min(canvas.width - rect.width, rect.x + dx)),
                            y: Math.max(0, Math.min(canvas.height - rect.height, rect.y + dy)),
                        };
                    }
                    return rect;
                });

                return {
                    ...prev,
                    [cameraIndex]: {
                        ...camState,
                        rectangles: updatedRects,
                    }
                };
            });

            setActionState(prev => ({
                ...prev,
                startX: currentX,
                startY: currentY,
            }));

            canvas.style.cursor = "move";
            if (activeImagePath) drawMultiCameraRegions(cameraIndex, activeImagePath);
            return;
        }

        // --- RESIZE MODE ---
        if (
            resizeState.isResizing &&
            resizeState.cameraIndex === cameraIndex &&
            resizeState.rectIndex !== null
        ) {
            setCameraRegionStates(prev => {
                const cam = prev[cameraIndex];
                if (!cam) return prev;
                const rects = cam.rectangles.map((rect, i) => {
                    if (i === resizeState.rectIndex) {
                        const newWidth = Math.max(5, Math.min(canvas.width - rect.x, resizeState.startWidth + (currentX - resizeState.startX)));
                        const newHeight = Math.max(5, Math.min(canvas.height - rect.y, resizeState.startHeight + (currentY - resizeState.startY)));
                        return { ...rect, width: newWidth, height: newHeight };
                    }
                    return rect;
                });

                return {
                    ...prev,
                    [cameraIndex]: {
                        ...cam,
                        rectangles: rects
                    }
                };
            });

            canvas.style.cursor = "nwse-resize";
            if (activeImagePath) drawMultiCameraRegions(cameraIndex, activeImagePath);
            return;
        }

        // --- CHANGE CURSOR OVER HANDLE or RECTANGLE ---
        const selectedRect = resizeState.rectIndex !== null ? regionState.rectangles?.[resizeState.rectIndex] : null;
        if (selectedRect) {
            const handle = getHandleAtPosition(currentX, currentY, selectedRect);
            switch (handle) {
                case "nw":
                case "se": cursor = "nwse-resize"; break;
                case "ne":
                case "sw": cursor = "nesw-resize"; break;
                case "n":
                case "s": cursor = "ns-resize"; break;
                case "e":
                case "w": cursor = "ew-resize"; break;
                default:
                    if (
                        currentX >= selectedRect.x &&
                        currentX <= selectedRect.x + selectedRect.width &&
                        currentY >= selectedRect.y &&
                        currentY <= selectedRect.y + selectedRect.height
                    ) cursor = moveMode ? "move" : "default";
            }
        }

        canvas.style.cursor = cursor;

        // --- DRAW SCENE WITH ZOOM ---
        const imageUrl = showImage(activeImagePath);
        const drawScene = (img) => {
            requestAnimationFrame(() => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.save();
                if (zoom !== 1) {
                    const centerX = canvas.width / 2;
                    const centerY = canvas.height / 2;
                    ctx.translate(centerX, centerY);
                    ctx.scale(zoom, zoom);
                    ctx.translate(-centerX, -centerY);
                }
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                regionState.rectangles?.forEach((r, index) => {
                    const isSelected = index === regionState.selectedRectangleIndex;
                    ctx.save();
                    ctx.lineWidth = isSelected ? 4 : 2;
                    ctx.strokeStyle = isSelected ? "#50a5f1" : r.colour || "blue";
                    ctx.strokeRect(r.x, r.y, r.width, r.height);

                    // White dot for move
                    if (isSelected && moveMode) {
                        const handleSize = 10;
                        ctx.fillStyle = "white";
                        ctx.beginPath();
                        ctx.arc(r.x + handleSize / 2, r.y + handleSize / 2, handleSize / 2, 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.strokeStyle = "black";
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }

                    // Draw label
                    ctx.font = "bold 14px Arial";
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = "black";
                    ctx.strokeText(r.name, r.x + 10, r.y + 15);
                    ctx.fillStyle = "white";
                    ctx.fillText(r.name, r.x + 10, r.y + 15);

                    // Draw trash/delete icon
                    const trashSize = 15;
                    const trashwidthsize = 12;
                    const padding = 4;
                    r.deleteIcon = {
                        x: r.x + r.width - trashSize - padding,
                        y: r.y + padding,
                        width: trashwidthsize,
                        height: trashSize
                    };
                    ctx.fillStyle = "red";
                    ctx.strokeStyle = "black";
                    ctx.lineWidth = 1;
                    ctx.fillRect(r.deleteIcon.x, r.deleteIcon.y, trashSize, trashSize * 0.8);
                    ctx.strokeRect(r.deleteIcon.x, r.deleteIcon.y, trashSize, trashSize * 0.8);
                    ctx.fillRect(r.deleteIcon.x + trashSize * 0.25, r.deleteIcon.y - trashSize * 0.2, trashSize * 0.5, trashSize * 0.2);
                    ctx.strokeRect(r.deleteIcon.x + trashSize * 0.25, r.deleteIcon.y - trashSize * 0.2, trashSize * 0.5, trashSize * 0.2);

                    ctx.restore();
                });

                // Draw new rectangle live if not in move mode
                if (!moveMode && regionState.isDrawing) {
                    const clamp = (val, min, max) => Math.max(min, Math.min(val, max));
                    const startX = clamp(regionState.startX, 0, canvas.width);
                    const startY = clamp(regionState.startY, 0, canvas.height);
                    const endX = clamp(currentX, 0, canvas.width);
                    const endY = clamp(currentY, 0, canvas.height);

                    const w = endX - startX;
                    const h = endY - startY;

                    ctx.save();
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = selectedColor || "blue";
                    ctx.strokeRect(startX, startY, w, h);
                    ctx.restore();
                }

                ctx.restore();
            });
        };

        if (imageCache.current[imageUrl]) drawScene(imageCache.current[imageUrl]);
        else {
            const img = new Image();
            img.onload = () => {
                imageCache.current[imageUrl] = img;
                drawScene(img);
            };
            img.src = imageUrl;
        }

    }, [cameraRegionStates, cameraCanvasRefs, resizeState, actionState, moveMode, activeImagePath, selectedColor, zoom]);


    const getNextRegionName = (existingRegions = []) => {
        const numbers = existingRegions
            .map(r => {
                const match = r.name?.match(/Region_(\d+)/);
                return match ? parseInt(match[1], 10) : null;
            })
            .filter(n => n !== null);

        const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
        return `Region_${nextNumber}`;
    };

    // MouseUp — finalize rectangle with selectedColor
    const handleMultiCameraMouseUp = useCallback((e, cameraIndex) => {
        const canvas = cameraCanvasRefs.current[cameraIndex];
        if (!canvas) return;

        const { x: mouseX, y: mouseY } = getCanvasCoords(e, canvas);
        const regionState = cameraRegionStates[cameraIndex];
        if (!regionState) return;
        if (!regionState.showRegion) return;


        // --- Finish resizing ---
        if (resizeState.isResizing) {
            setResizeState({
                isResizing: false,
                rectIndex: null,
                cameraIndex: null,
                showHandles: false,
            });
            if (activeImagePath) drawMultiCameraRegions(cameraIndex, activeImagePath);
            return;
        }

        // --- Finish dragging (relocate) ---
        if (actionState.isDragging && moveMode) {
            setActionState({
                isDragging: false,
                isResizing: false,
                rectIndex: null,
                cameraIndex: null,
                startX: null,
                startY: null,
            });
            setMoveMode(false);
            return;
        }

        // --- Deselect if clicked outside rectangle ---
        const clickedInside = regionState?.rectangles?.some(
            r => mouseX >= r.x && mouseX <= r.x + r.width &&
                mouseY >= r.y && mouseY <= r.y + r.height
        );

        if (!clickedInside) {
            setCameraRegionStates(prev => ({
                ...prev,
                [cameraIndex]: {
                    ...prev[cameraIndex],
                    selectedRectangleIndex: null,
                },
            }));
            setResizeState(prev => ({
                ...prev,
                rectIndex: null,
                cameraIndex: null,
                showHandles: false,
            }));
            // Reset moveMode and actionState
            setMoveMode(false);
            setActionState({
                isDragging: false,
                isResizing: false,
                rectIndex: null,
                cameraIndex: null,
                startX: null,
                startY: null,
            });
        }

        // --- Finish drawing new rectangle only if moveMode is OFF ---
        if (!moveMode && regionState?.isDrawing) {
            const startX = regionState.startX;
            const startY = regionState.startY;
            const endX = mouseX;
            const endY = mouseY;

            // --- Clamp coordinates to canvas edges ---
            const clamp = (val, min, max) => Math.max(min, Math.min(val, max));
            const startXClamped = clamp(startX, 0, canvas.width);
            const startYClamped = clamp(startY, 0, canvas.height);
            const endXClamped = clamp(endX, 0, canvas.width);
            const endYClamped = clamp(endY, 0, canvas.height);

            // --- Calculate width/height with minimum size 5px ---
            const width = Math.max(5, Math.abs(endXClamped - startXClamped));
            const height = Math.max(5, Math.abs(endYClamped - startYClamped));

            if (width > 5 && height > 5) {
                const updated = [
                    ...(regionState.rectangles || []),
                    {
                        x: Math.min(startXClamped, endXClamped),
                        y: Math.min(startYClamped, endYClamped),
                        width,
                        height,
                        // name: `Region_${regionState.rectangles?.length + 1}`,
                        name: getNextRegionName(regionState.rectangles),
                        colour: selectedColor || "blue",
                    }
                ];

                setCameraRegionStates(prev => ({
                    ...prev,
                    [cameraIndex]: {
                        ...prev[cameraIndex],
                        rectangles: updated,
                        isDrawing: false,
                        startX: null,
                        startY: null,
                    }
                }));
            } else {
                // Cancel drawing if too small
                setCameraRegionStates(prev => ({
                    ...prev,
                    [cameraIndex]: {
                        ...prev[cameraIndex],
                        isDrawing: false,
                        startX: null,
                        startY: null,
                    }
                }));
            }
        }

        // --- Redraw canvas ---
        if (activeImagePath) drawMultiCameraRegions(cameraIndex, activeImagePath);

    }, [cameraRegionStates, resizeState, actionState, moveMode, activeImagePath, selectedColor]);



    useEffect(() => {
        if (activeImagePath && activeCameraIndex !== null) {
            drawMultiCameraRegions(activeCameraIndex, activeImagePath);
        }
    }, [zoom, activeImagePath, activeCameraIndex, drawMultiCameraRegions]);

    // // Save Multi-Camera Region functionality
    // const saveMultiCameraRegion = useCallback(async (cameraIndex) => {
    //     if (cameraIndex == null) return;

    //     // Check if required IDs are available
    //     if (!mngstateInfo?._id) {
    //         Swal.fire({
    //             title: 'Save Error',
    //             text: 'Missing stage ID. Please refresh the page and try again.',
    //             icon: 'error',
    //             confirmButtonText: 'OK'
    //         });
    //         return;
    //     }

    //     const regionState = cameraRegionStates[cameraIndex];
    //     if (!regionState?.rectangles?.length) {
    //         Swal.fire({
    //             title: 'No Regions to Save',
    //             text: 'Please create some regions before saving.',
    //             icon: 'warning',
    //             confirmButtonText: 'OK'
    //         });
    //         return;
    //     }

    //     console.log('Save attempt - IDs check:', {
    //         _id: mngstateInfo?._id,
    //         parent_comp_id: mngstateInfo?.parent_comp_id || compInfo?._id,
    //         cameraIndex,
    //         rectangleCount: regionState.rectangles.length
    //     });

    //     setFullScreenLoading(true);

    //     try {
    //         // Get the actual camera label from camera selection based on camera index
    //         const selectedCamera = mngstateInfo?.camera_selection?.cameras?.[cameraIndex];
    //         const cameraLabel = selectedCamera?.label
    //             ?.toLowerCase()        // "position 1"
    //             .replace(/\s+/g, '_'); // "position_1"


    //         // Scale coordinates to target resolution (similar to single camera)
    //         const originalWidth = 640;
    //         const originalHeight = 480;
    //         const targetWidth = DEFAULT_RESOLUTION.width;
    //         const targetHeight = DEFAULT_RESOLUTION.height;

    //         const scaleX = targetWidth / originalWidth;
    //         const scaleY = targetHeight / originalHeight;

    //         // Prepare rectangle data for backend
    //         const rectsData = regionState.rectangles.map((rect, index) => ({
    //             id: index + 1,
    //             name: rect.name,
    //             coordinates: {
    //                 x: Math.round(rect.x * scaleX),
    //                 y: Math.round(rect.y * scaleY),
    //                 width: Math.round(rect.width * scaleX),
    //                 height: Math.round(rect.height * scaleY)
    //             },
    //             colour: rect.colour || "blue"
    //         }));

    //         console.log('Multi-Camera Region Data:', {
    //             cameraIndex,
    //             cameraLabel,
    //             selectedCamera,
    //             rectsData,
    //             scaleFactors: { scaleX, scaleY }
    //         });

    //         // Prepare payload for backend with fallback IDs
    //         const stageId = mngstateInfo?._id || backupStageIds._id;
    //         const parentCompId = mngstateInfo?.parent_comp_id || compInfo?._id || backupStageIds.parent_comp_id;

    //         const payload = {
    //             _id: stageId,
    //             parent_comp_id: parentCompId,
    //             camera_index: cameraIndex,
    //             camera_label: cameraLabel, // Send the specific camera label for the selected camera position
    //             rectangles: rectsData,
    //             multi_camera: true // Flag to indicate this is multi-camera data
    //         };

    //         console.log("payload", payload);

    //         // Final validation before sending
    //         if (!payload._id || !payload.parent_comp_id) {
    //             throw new Error(`Missing required IDs: _id=${payload._id}, parent_comp_id=${payload.parent_comp_id}`);
    //         }

    //         // Send to backend API
    //         const response = await urlSocket.post('/api/regions/save_multi_camera_stg', payload);
    //         console.log("response", response.data)
    //         if (response.data.error === "Tenant not found") {
    //             console.log("API Error:", response.data.error);
    //             errorHandler(response.data.error);
    //         } else if (response.data.success === true) {
    //             // Preserve critical data before updating
    //             const currentCameraSelection = mngstateInfo?.camera_selection;
    //             const currentId = mngstateInfo?._id;
    //             const currentParentCompId = mngstateInfo?.parent_comp_id || compInfo?._id;

    //             // Update state info with response but preserve critical data
    //             const updatedStateInfo = {
    //                 ...mngstateInfo, // Start with current state
    //                 ...response.data.result, // Apply backend updates
    //                 _id: currentId, // Preserve _id
    //                 parent_comp_id: currentParentCompId, // Preserve parent_comp_id
    //                 camera_selection: currentCameraSelection // Preserve camera selection
    //             };

    //             console.log('Updated state info:', {
    //                 _id: updatedStateInfo._id,
    //                 parent_comp_id: updatedStateInfo.parent_comp_id,
    //                 camera_selection: updatedStateInfo.camera_selection?.cameras?.length
    //             });

    //             setMngstateInfo(updatedStateInfo);
    //             setCompInfo(updatedStateInfo);

    //             // Update session storage with preserved data
    //             const sessionData = JSON.parse(sessionStorage.getItem('managestageData'));
    //             if (sessionData) {
    //                 sessionData.mngstageInfo = updatedStateInfo;
    //                 sessionStorage.setItem('managestageData', JSON.stringify(sessionData));
    //             }

    //             // Reset editing states for this camera
    //             setCameraRegionStates(prev => ({
    //                 ...prev,
    //                 [cameraIndex]: {
    //                     ...prev[cameraIndex],
    //                     selectedRectangleIndex: null,
    //                     editingRectangleIndex: null,
    //                     resizingRectangleIndex: null,
    //                     movingRectangleIndex: null,
    //                     isMoving: false,
    //                     isResizing: false
    //                 }
    //             }));

    //             // Success notification with callback to maintain modal state
    //             Swal.fire({
    //                 title: 'Multi-Camera Regions Saved Successfully',
    //                 text: `${rectsData.length} regions saved for ${cameraLabel}`,
    //                 icon: 'success',
    //                 showConfirmButton: true,
    //                 confirmButtonText: 'OK',
    //                 allowOutsideClick: false,
    //                 allowEscapeKey: false,
    //                 didClose: () => {
    //                     // Force re-render and ensure all states are maintained
    //                     setTimeout(() => {
    //                         // Debug camera data
    //                         debugCameraData();

    //                         // Ensure modal stays open
    //                         setShowMultiCameraRegion(true);

    //                         // Maintain active camera index
    //                         setActiveCameraIndex(cameraIndex);

    //                         // Force re-render by updating a dummy state
    //                         setFullScreenLoading(false);

    //                         // Additional delay to ensure state is properly set
    //                         setTimeout(() => {
    //                             // Redraw the canvas with saved regions
    //                             if (activeImagePath) {
    //                                 drawMultiCameraRegions(cameraIndex, activeImagePath);
    //                             }

    //                             // Final debug to confirm camera data is intact
    //                             console.log('Final camera check:', mngstateInfo?.camera_selection?.cameras?.length);
    //                         }, 100);
    //                     }, 50);
    //                 }
    //             });

    //             console.log('Multi-Camera regions saved successfully:', response.data);
    //         } else {
    //             throw new Error(response.data.message || 'Failed to save regions');
    //         }

    //     } catch (error) {
    //         console.error('Error saving multi-camera regions:', error);

    //         Swal.fire({
    //             title: 'Save Failed',
    //             text: error.message || 'Failed to save multi-camera regions. Please try again.',
    //             icon: 'error',
    //             confirmButtonText: 'OK'
    //         });
    //     } finally {
    //         setFullScreenLoading(false);
    //     }
    // }, [cameraRegionStates, mngstateInfo, compInfo, errorHandler]);




    // Save Multi-Camera Region functionality
    //   const saveMultiCameraRegion = useCallback(
    //   async (cameraIndex, { fromCloseButton = false } = {}) => {
    //     if (cameraIndex == null) return;

    //     const regionState = cameraRegionStates[cameraIndex];
    //     if (!regionState?.rectangles?.length) {
    //       Swal.fire({
    //         title: 'No Regions to Save',
    //         text: 'Please create some regions before saving.',
    //         icon: 'warning',
    //         confirmButtonText: 'OK'
    //       });
    //       return;
    //     }

    //     setFullScreenLoading(true);

    //     try {
    //       const selectedCamera = mngstateInfo?.camera_selection?.cameras?.[cameraIndex];
    //       const cameraLabel = selectedCamera?.label?.toLowerCase().replace(/\s+/g, '_');

    //       const scaleX = DEFAULT_RESOLUTION.width / 640;
    //       const scaleY = DEFAULT_RESOLUTION.height / 480;

    //       const rectsData = regionState.rectangles.map((rect, index) => ({
    //         id: index + 1,
    //         name: rect.name,
    //         coordinates: {
    //           x: Math.round(rect.x * scaleX),
    //           y: Math.round(rect.y * scaleY),
    //           width: Math.round(rect.width * scaleX),
    //           height: Math.round(rect.height * scaleY)
    //         },
    //         colour: rect.colour || 'blue'
    //       }));

    //       const stageId = mngstateInfo?._id || backupStageIds._id;
    //       const parentCompId = mngstateInfo?.parent_comp_id || compInfo?._id || backupStageIds.parent_comp_id;

    //       const payload = {
    //         _id: stageId,
    //         parent_comp_id: parentCompId,
    //         camera_index: cameraIndex,
    //         camera_label: cameraLabel,
    //         rectangles: rectsData,
    //         multi_camera: true
    //       };

    //       const response = await urlSocket.post('/api/regions/save_multi_camera_stg', payload);

    //       if (response.data.success) {
    //         const updatedStateInfo = {
    //           ...mngstateInfo,
    //           ...response.data.result,
    //           _id: mngstateInfo._id,
    //           parent_comp_id: mngstateInfo.parent_comp_id || compInfo?._id,
    //           camera_selection: mngstateInfo.camera_selection
    //         };

    //         setMngstateInfo(updatedStateInfo);
    //         setCompInfo(updatedStateInfo);

    //         // Update session storage
    //         const sessionData = JSON.parse(sessionStorage.getItem('managestageData'));
    //         if (sessionData) {
    //           sessionData.mngstageInfo = updatedStateInfo;
    //           sessionStorage.setItem('managestageData', JSON.stringify(sessionData));
    //         }

    //         // Mark rectangles as saved
    //         setCameraRegionStates(prev => {
    //           const newState = { ...prev };
    //           const camState = newState[cameraIndex];
    //           if (camState) {
    //             newState[cameraIndex] = {
    //               ...camState,
    //               selectedRectangleIndex: null,
    //               editingRectangleIndex: null,
    //               resizingRectangleIndex: null,
    //               movingRectangleIndex: null,
    //               isMoving: false,
    //               isResizing: false,
    //               savedRectangles: camState.rectangles ? [...camState.rectangles] : []
    //             };
    //           }
    //           return newState;
    //         });

    //         Swal.fire({
    //           title: 'Multi-Camera Regions Saved Successfully',
    //           text: `${rectsData.length} regions saved for ${cameraLabel}`,
    //           icon: 'success',
    //           showConfirmButton: true,
    //           confirmButtonText: 'OK',
    //           allowOutsideClick: false,
    //           allowEscapeKey: false,
    //           didClose: () => {
    //             if (!fromCloseButton) {
    //               setTimeout(() => {
    //                 debugCameraData();
    //                 setShowMultiCameraRegion(true);
    //                 setActiveCameraIndex(cameraIndex);
    //                 setFullScreenLoading(false);
    //                 if (activeImagePath) drawMultiCameraRegions(cameraIndex, activeImagePath);
    //               }, 50);
    //             }
    //           }
    //         });
    //       } else {
    //         throw new Error(response.data.message || 'Failed to save regions');
    //       }
    //     } catch (error) {
    //       Swal.fire({
    //         title: 'Save Failed',
    //         text: error.message || 'Failed to save multi-camera regions. Please try again.',
    //         icon: 'error',
    //         confirmButtonText: 'OK'
    //       });
    //     } finally {
    //       setFullScreenLoading(false);
    //     }
    //   },
    //   [cameraRegionStates, mngstateInfo, compInfo, errorHandler]
    // );

    //update on 25 -aug -2025

    const saveMultiCameraRegion = useCallback(
        async (cameraIndex, { fromCloseButton = false } = {}) => {
            if (cameraIndex == null) return;

            const regionState = cameraRegionStates[cameraIndex];
            if (!regionState?.rectangles?.length) {
                Swal.fire({
                    title: 'No Regions to Save',
                    text: 'Please create some regions before saving.',
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });
                return;
            }

            setFullScreenLoading(true);

            try {
                const selectedCamera = mngstateInfo?.camera_selection?.cameras?.[cameraIndex];
                const cameraLabel = selectedCamera?.label?.toLowerCase().replace(/\s+/g, '_');

                const scaleX = DEFAULT_RESOLUTION.width / 640;
                const scaleY = DEFAULT_RESOLUTION.height / 480;

                const rectsData = regionState.rectangles.map((rect, index) => ({
                    id: index + 1,
                    name: rect.name,
                    coordinates: {
                        x: Math.round(rect.x * scaleX),
                        y: Math.round(rect.y * scaleY),
                        width: Math.round(rect.width * scaleX),
                        height: Math.round(rect.height * scaleY)
                    },
                    colour: rect.colour || 'blue'
                }));

                const stageId = mngstateInfo?._id || backupStageIds._id;
                const parentCompId = mngstateInfo?.comp_id || compInfo?._id || backupStageIds.comp_id;

                const payload = {
                    _id: stageId,
                    comp_id: parentCompId,
                    camera_index: cameraIndex,
                    camera_label: cameraLabel,
                    rectangles: rectsData,
                    multi_camera: true
                };

                const response = await urlSocket.post('/api/regions/save_multi_camera_stg', payload);

                if (response.data.success) {
                    const updatedStateInfo = {
                        ...mngstateInfo,
                        ...response.data.result,
                        _id: mngstateInfo._id,
                        comp_id: mngstateInfo?.comp_id || compInfo?._id,
                        camera_selection: mngstateInfo.camera_selection
                    };
                    console.log('firstupdatedStateInfo', updatedStateInfo)

                    setMngstateInfo(updatedStateInfo);
                    // setCompInfo(updatedStateInfo);

                    const sessionData = JSON.parse(sessionStorage.getItem('managestageData'));
                    if (sessionData) {
                        sessionData.mngstageInfo = updatedStateInfo;
                        sessionStorage.setItem('managestageData', JSON.stringify(sessionData));
                    }

                    // Mark rectangles as saved
                    setCameraRegionStates(prev => {
                        const newState = { ...prev };

                        const camState = newState[cameraIndex];
                        const savedRects = camState.rectangles ? [...camState.rectangles] : [];

                        if (camState) {
                            newState[cameraIndex] = {
                                ...camState,
                                selectedRectangleIndex: null,
                                editingRectangleIndex: null,
                                resizingRectangleIndex: null,
                                movingRectangleIndex: null,
                                isMoving: false,
                                isResizing: false,
                                savedRectangles: camState.rectangles ? [...camState.rectangles] : [],
                                initialRectangles: savedRects
                            };
                        }
                        return newState;
                    });

                    Swal.fire({
                        title: 'Multi-Camera Regions Saved Successfully',
                        text: `${rectsData.length} regions saved for ${cameraLabel}`,
                        icon: 'success',
                        showConfirmButton: true,
                        confirmButtonText: 'OK',
                        allowOutsideClick: false,
                        allowEscapeKey: false
                    });
                } else {
                    throw new Error(response.data.message || 'Failed to save regions');
                }
            } catch (error) {
                Swal.fire({
                    title: 'Save Failed',
                    text: error.message || 'Failed to save multi-camera regions. Please try again.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            } finally {
                setFullScreenLoading(false);
            }
        },
        [cameraRegionStates, mngstateInfo, compInfo, errorHandler]
    );

    const saveMultiCameraRegionWithTrainingCheck = async (cameraIndex) => {
        const selectedCamera = mngstateInfo?.camera_selection?.cameras?.[cameraIndex];
        const cameraLabel = selectedCamera?.label;
        const stageId = mngstateInfo._id;

        // 1️⃣ Check backend training status
        const res = await urlSocket.post('/api/regions/check_training_status', {
            stage_id: stageId,
            camera_label: cameraLabel
        });

        const trainingStatus = res.data.training_status;
        console.log('Training status:', trainingStatus);

        let resetTraining = false;

        // 2️⃣ If training completed → ask user what to do
        if (trainingStatus === 'training completed') {
            const result = await Swal.fire({
                title: 'Training Completed',
                text: 'Training has already been completed for this camera. Do you want to reset it and retrain?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, retrain',
                cancelButtonText: 'No, cancel'
            });

            if (!result.isConfirmed) {
                // ❌ User clicked "No" → do not save
                Swal.fire({
                    icon: 'info',
                    title: 'Cancelled',
                    text: 'Region save cancelled. Training was not reset.',
                    timer: 2000,
                    showConfirmButton: false
                });
                return; // stop execution here
            }

            resetTraining = true; // ✅ only allow save if retrain confirmed
        }

        // 3️⃣ Proceed to save only if allowed
        await saveMultiCameraRegion(cameraIndex, { resetTraining });
    };


    const handleZoomIn_mul = useCallback(() => {
        setZoom(prev => {
            if (prev < 1.7) {
                const newZoom = prev * 1.2;
                // Trigger redraw after state update
                setTimeout(() => {
                    if (activeImagePath) drawMultiCameraRegions(activeCameraIndex, activeImagePath);
                }, 0);
                return newZoom;
            }
            return prev;
        });
    }, [activeImagePath, activeCameraIndex, drawMultiCameraRegions]);

    const handleZoomOut_mul = useCallback(() => {
        setZoom(prev => {
            if (prev > 0.7) {
                const newZoom = prev / 1.2;
                // Trigger redraw after state update
                setTimeout(() => {
                    if (activeImagePath) drawMultiCameraRegions(activeCameraIndex, activeImagePath);
                }, 0);
                return newZoom;
            }
            return prev;
        });
    }, [activeImagePath, activeCameraIndex, drawMultiCameraRegions]);

    const handleZoomReset_mul = useCallback(() => {
        setZoom(1);
        // Trigger redraw after state update
        setTimeout(() => {
            if (activeImagePath) drawMultiCameraRegions(activeCameraIndex, activeImagePath);
        }, 0);
    }, [activeImagePath, activeCameraIndex, drawMultiCameraRegions]);

    // 6. Add useEffect to redraw when zoom changes
    useEffect(() => {
        if (activeImagePath && activeCameraIndex !== null) {
            drawMultiCameraRegions(activeCameraIndex, activeImagePath);
        }
    }, [zoom, activeImagePath, activeCameraIndex, drawMultiCameraRegions]);


    // Optional: Add mouse wheel zoom
    const handleCanvasWheel = useCallback((e, cameraIndex) => {
        e.preventDefault();

        const canvas = cameraCanvasRefs.current[cameraIndex];
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
        const mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);

        const delta = e.deltaY > 0 ? -0.1 : 0.1;

        setZoom(prev => {
            const newScale = Math.max(0.5, Math.min(3, prev.scale + delta));

            if (newScale !== prev.scale) {
                const scaleFactor = newScale / prev.scale;
                const newOffsetX = mouseX - (mouseX - prev.offsetX) * scaleFactor;
                const newOffsetY = mouseY - (mouseY - prev.offsetY) * scaleFactor;

                return {
                    scale: newScale,
                    offsetX: newOffsetX,
                    offsetY: newOffsetY,
                };
            }

            return prev;
        });

        if (activeImagePath) {
            setTimeout(() => drawMultiCameraRegions(cameraIndex, activeImagePath), 0);
        }
    }, [activeImagePath, cameraCanvasRefs]);

    // Save all multi-camera regions at once
    const saveAllMultiCameraRegions = useCallback(async () => {
        const camerasWithRegions = Object.keys(cameraRegionStates).filter(
            cameraIndex => cameraRegionStates[cameraIndex]?.rectangles?.length > 0
        );

        if (camerasWithRegions.length === 0) {
            Swal.fire({
                title: 'No Regions to Save',
                text: 'Please create regions on at least one camera before saving.',
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            return;
        }

        // Show confirmation dialog
        const result = await Swal.fire({
            title: 'Save All Camera Regions?',
            text: `This will save regions for ${camerasWithRegions.length} camera(s). Continue?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Save All',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) return;

        setFullScreenLoading(true);

        try {
            let successCount = 0;
            let errorCount = 0;

            // Save regions for each camera sequentially
            for (const cameraIndex of camerasWithRegions) {
                try {
                    await saveMultiCameraRegion(parseInt(cameraIndex));
                    successCount++;
                } catch (error) {
                    console.error(`Failed to save regions for camera ${cameraIndex}:`, error);
                    errorCount++;
                }
            }

            // Show final result
            if (errorCount === 0) {
                Swal.fire({
                    title: 'All Regions Saved Successfully',
                    text: `Regions saved for ${successCount} camera(s)`,
                    icon: 'success',
                    showConfirmButton: true,
                    confirmButtonText: 'OK',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didClose: () => {
                        setTimeout(() => {
                            setShowMultiCameraRegion(true);
                            setFullScreenLoading(false);
                        }, 50);
                    }
                });
            } else {
                Swal.fire({
                    title: 'Partial Save Completed',
                    text: `${successCount} camera(s) saved successfully, ${errorCount} failed`,
                    icon: 'warning',
                    confirmButtonText: 'OK',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didClose: () => {
                        setTimeout(() => {
                            setShowMultiCameraRegion(true);
                            setFullScreenLoading(false);
                        }, 50);
                    }
                });
            }

        } catch (error) {
            console.error('Error saving all multi-camera regions:', error);

            Swal.fire({
                title: 'Save Failed',
                text: 'Failed to save regions. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setFullScreenLoading(false);
        }
    }, [cameraRegionStates, saveMultiCameraRegion]);

    // Load saved multi-camera regions from backend
    // const loadMultiCameraRegions = useCallback(async (specificCameraIndex = null, forceReload = false) => {
    //     if (!mngstateInfo?._id || !mngstateInfo?.camera_selection?.cameras?.length) return;

    //     // Prevent multiple simultaneous loads
    //     if (isLoadingRegions && !forceReload) {
    //         console.log('Already loading regions, skipping...');
    //         return;
    //     }

    //     // Check if regions are already loaded for this camera (unless force reload)
    //     if (specificCameraIndex !== null && !forceReload) {
    //         const cameraKey = `${mngstateInfo._id}_${specificCameraIndex}`;
    //         if (loadedRegionsRef.current.has(cameraKey)) {
    //             console.log(`Regions already loaded for camera ${specificCameraIndex}, drawing from cache...`);

    //             // Always draw canvas when regions are cached (especially important for modal reopening)
    //             if (showMultiCameraRegion && activeImagePath) {
    //                 setTimeout(() => {
    //                     drawMultiCameraRegions(specificCameraIndex, activeImagePath);
    //                 }, 100);
    //             }
    //             return;
    //         }
    //     }

    //     setIsLoadingRegions(true);

    //     try {
    //         const response = await urlSocket.get(`/api/regions/get_multi_camera_stg/${mngstateInfo._id}`);
    //         console.log("get_multi_camera_stg", response)

    //         if (response.data.success && response.data.data) {
    //             const savedRegions = response.data.data; // 👈 now it's an object keyed by camera_label

    //             const originalWidth = 640;
    //             const originalHeight = 480;
    //             const targetWidth = DEFAULT_RESOLUTION.width;
    //             const targetHeight = DEFAULT_RESOLUTION.height;

    //             const scaleX = originalWidth / targetWidth;
    //             const scaleY = originalHeight / targetHeight;

    //             const regionsByCamera = {};

    //             Object.entries(savedRegions).forEach(([cameraLabel, cameraData]) => {
    //                 const canvasRectangles = cameraData.rectangles.map(rect => ({
    //                     id: rect.id,
    //                     name: rect.name,
    //                     x: Math.round(rect.coordinates.x * scaleX),
    //                     y: Math.round(rect.coordinates.y * scaleY),
    //                     width: Math.round(rect.coordinates.width * scaleX),
    //                     height: Math.round(rect.coordinates.height * scaleY),
    //                     colour: rect.colour || "blue"
    //                 }));

    //                 regionsByCamera[cameraLabel] = canvasRectangles;
    //             });

    //             // If specific camera index is provided, load only that camera's regions
    //             if (specificCameraIndex !== null) {
    //                 const selectedCamera = mngstateInfo?.camera_selection?.cameras?.[specificCameraIndex];
    //                 const cameraLabel = selectedCamera?.label?.toLowerCase()?.replace(/\s+/g, '_');

    //                 console.log(`Loading regions for camera ${specificCameraIndex} (${cameraLabel}):`, regionsByCamera[cameraLabel]);

    //                 setCameraRegionStates(prev => ({
    //                     ...prev,
    //                     [specificCameraIndex]: {
    //                         ...prev[specificCameraIndex],
    //                         rectangles: regionsByCamera[cameraLabel] || [],
    //                         showRegion: true
    //                     }
    //                 }));

    //                 // Mark this camera as loaded
    //                 const cameraKey = `${mngstateInfo._id}_${specificCameraIndex}`;
    //                 loadedRegionsRef.current.add(cameraKey);

    //                 // Draw regions for the specific camera
    //                 setTimeout(() => {
    //                     if (activeImagePath) {
    //                         drawMultiCameraRegions(specificCameraIndex, activeImagePath);
    //                     }
    //                 }, 100);

    //             } else {
    //                 // Load all cameras' regions (for initial load)
    //                 setCameraRegionStates(prev => {
    //                     const newState = { ...prev };

    //                     // Map camera labels to camera indices
    //                     mngstateInfo.camera_selection.cameras.forEach((camera, index) => {
    //                         const cameraLabel = camera.label?.toLowerCase()?.replace(/\s+/g, '_');
    //                         if (regionsByCamera[cameraLabel]) {
    //                             newState[index] = {
    //                                 ...newState[index],
    //                                 rectangles: regionsByCamera[cameraLabel],
    //                                 showRegion: true
    //                             };
    //                         }
    //                     });

    //                     return newState;
    //                 });

    //                 console.log('Multi-camera regions loaded successfully:', regionsByCamera);

    //                 // Force immediate canvas redraw for active camera after loading all regions
    //                 setTimeout(() => {
    //                     if (activeImagePath && activeCameraIndex !== null) {
    //                         drawMultiCameraRegions(activeCameraIndex, activeImagePath);
    //                     }
    //                 }, 200);
    //             }
    //         }
    //     } catch (error) {
    //         console.error('Error loading multi-camera regions:', error);
    //     } finally {
    //         setIsLoadingRegions(false);
    //     }
    // }, [mngstateInfo, activeImagePath, drawMultiCameraRegions, isLoadingRegions, activeCameraIndex, showMultiCameraRegion]);

    // Load saved multi-camera regions from backend
    //update on 25 -aug -2025
    const loadMultiCameraRegions = useCallback(async (specificCameraIndex = null, forceReload = false) => {
        if (!mngstateInfo?._id || !mngstateInfo?.camera_selection?.cameras?.length) return;

        if (isLoadingRegions && !forceReload) {
            console.log('Already loading regions, skipping...');
            return;
        }

        if (specificCameraIndex !== null && !forceReload) {
            const cameraKey = `${mngstateInfo._id}_${specificCameraIndex}`;
            if (loadedRegionsRef.current.has(cameraKey)) {
                console.log(`Regions already loaded for camera ${specificCameraIndex}, drawing from cache...`);
                if (showMultiCameraRegion && activeImagePath) {
                    setTimeout(() => {
                        drawMultiCameraRegions(specificCameraIndex, activeImagePath);
                    }, 100);
                }
                return;
            }
        }

        setIsLoadingRegions(true);

        try {
            const response = await urlSocket.post('/api/regions/get_multi_camera_stg', {
                stage_id: mngstateInfo._id
            });
            console.log("get_multi_camera_stg", response);

            if (response.data.success && response.data.data) {
                const savedRegions = response.data.data;
                const originalWidth = 640;
                const originalHeight = 480;
                const targetWidth = DEFAULT_RESOLUTION.width;
                const targetHeight = DEFAULT_RESOLUTION.height;
                const scaleX = originalWidth / targetWidth;
                const scaleY = originalHeight / targetHeight;

                const regionsByCamera = {};

                Object.entries(savedRegions).forEach(([cameraLabel, cameraData]) => {
                    const canvasRectangles = cameraData.rectangles.map(rect => ({
                        id: rect.id,
                        name: rect.name,
                        x: Math.round(rect.coordinates.x * scaleX),
                        y: Math.round(rect.coordinates.y * scaleY),
                        width: Math.round(rect.coordinates.width * scaleX),
                        height: Math.round(rect.coordinates.height * scaleY),
                        colour: rect.colour || "blue"
                    }));
                    regionsByCamera[cameraLabel] = canvasRectangles;
                });

                if (specificCameraIndex !== null) {
                    const selectedCamera = mngstateInfo?.camera_selection?.cameras?.[specificCameraIndex];
                    const cameraLabel = selectedCamera?.label?.toLowerCase()?.replace(/\s+/g, '_');
                    const loadedRects = regionsByCamera[cameraLabel] || [];

                    setCameraRegionStates(prev => ({
                        ...prev,
                        [specificCameraIndex]: {
                            ...prev[specificCameraIndex],
                            rectangles: loadedRects,
                            savedRectangles: [...loadedRects],     // Last saved snapshot
                            initialRectangles: [...loadedRects],   // Snapshot for detecting changes
                            showRegion: true
                        }
                    }));

                    const cameraKey = `${mngstateInfo._id}_${specificCameraIndex}`;
                    loadedRegionsRef.current.add(cameraKey);

                    setTimeout(() => {
                        if (activeImagePath) drawMultiCameraRegions(specificCameraIndex, activeImagePath);
                    }, 100);

                } else {
                    // Load all cameras
                    setCameraRegionStates(prev => {
                        const newState = { ...prev };

                        mngstateInfo.camera_selection.cameras.forEach((camera, index) => {
                            const cameraLabel = camera.label?.toLowerCase()?.replace(/\s+/g, '_');
                            const loadedRects = regionsByCamera[cameraLabel] || [];

                            newState[index] = {
                                ...newState[index],
                                rectangles: loadedRects,
                                savedRectangles: [...loadedRects],
                                initialRectangles: [...loadedRects],
                                showRegion: true
                            };
                        });

                        return newState;
                    });

                    setTimeout(() => {
                        if (activeImagePath && activeCameraIndex !== null) {
                            drawMultiCameraRegions(activeCameraIndex, activeImagePath);
                        }
                    }, 200);
                }
            }
        } catch (error) {
            console.error('Error loading multi-camera regions:', error);
        } finally {
            setIsLoadingRegions(false);
        }
    }, [mngstateInfo, activeImagePath, drawMultiCameraRegions, isLoadingRegions, activeCameraIndex, showMultiCameraRegion]);

    // Check if any camera has regions to save
    const hasRegionsToSave = useCallback(() => {
        return Object.keys(cameraRegionStates).some(
            cameraIndex => cameraRegionStates[cameraIndex]?.rectangles?.length > 0
        );
    }, [cameraRegionStates]);

    // Force immediate canvas redraw for active camera
    const forceCanvasRedraw = useCallback(() => {
        if (activeCameraIndex !== null && activeImagePath && showMultiCameraRegion) {
            setTimeout(() => {
                drawMultiCameraRegions(activeCameraIndex, activeImagePath);
            }, 50);
        }
    }, [activeCameraIndex, activeImagePath, showMultiCameraRegion, drawMultiCameraRegions]);

    // Debug function to check camera data integrity
    const debugCameraData = useCallback(() => {
        console.log('=== CAMERA DEBUG INFO ===');
        console.log('mngstateInfo:', mngstateInfo);
        console.log('camera_selection:', mngstateInfo?.camera_selection);
        console.log('cameras array:', mngstateInfo?.camera_selection?.cameras);
        console.log('cameras length:', mngstateInfo?.camera_selection?.cameras?.length);
        console.log('activeCameraIndex:', activeCameraIndex);
        console.log('showMultiCameraRegion:', showMultiCameraRegion);
        console.log('========================');
    }, [mngstateInfo, activeCameraIndex, showMultiCameraRegion]);

    // Backup camera selection data to prevent loss during save operations
    useEffect(() => {
        if (mngstateInfo?.camera_selection?.cameras?.length > 0) {
            setBackupCameraSelection(mngstateInfo.camera_selection);
        }
    }, [mngstateInfo?.camera_selection]);

    // Backup stage IDs to prevent loss during save operations
    useEffect(() => {
        if (mngstateInfo?._id) {
            setBackupStageIds({
                _id: mngstateInfo._id,
                comp_id: mngstateInfo.comp_id || compInfo?._id
            });
        }
    }, [mngstateInfo?._id, mngstateInfo?.comp_id, compInfo?._id]);

    // Load multi-camera regions when component mounts or modal opens
    useEffect(() => {
        if (mngstateInfo?._id && mngstateInfo?.camera_selection?.mode === 'multi' && !isLoadingRegions) {
            // Clear loaded regions cache when mngstateInfo._id changes
            loadedRegionsRef.current.clear();

            // Load all regions initially (only once per _id)
            const loadKey = `initial_${mngstateInfo._id}`;
            if (!loadedRegionsRef.current.has(loadKey)) {
                loadedRegionsRef.current.add(loadKey);
                loadMultiCameraRegions();
            }
        }
    }, [mngstateInfo?._id, mngstateInfo?.camera_selection?.mode]);

    // Load regions immediately when modal opens (including reopening)
    useEffect(() => {
        if (showMultiCameraRegion && mngstateInfo?._id && !isLoadingRegions) {
            console.log('Modal opened/reopened, loading regions for camera index:', activeCameraIndex);

            // Ensure we have a valid camera index (default to 0 if null)
            const cameraIndexToLoad = activeCameraIndex !== null ? activeCameraIndex : 0;

            // Set active camera index if it's null
            if (activeCameraIndex === null) {
                setActiveCameraIndex(0);
            }

            // Clear the loaded regions cache to force reload when modal reopens
            if (showMultiCameraRegion) {
                console.log('Clearing loaded regions cache for modal reopen');
                loadedRegionsRef.current.clear();
            }

            // Load regions for the active camera immediately when modal opens/reopens
            setTimeout(() => {
                loadMultiCameraRegions(cameraIndexToLoad, true); // Force reload on modal open
            }, 100);
        }
    }, [showMultiCameraRegion, mngstateInfo?._id]); // Removed activeCameraIndex from deps to prevent loop

    // Force canvas redraw when active camera changes or regions are updated
    useEffect(() => {
        if (showMultiCameraRegion && activeCameraIndex !== null && activeImagePath) {
            const currentRegions = cameraRegionStates[activeCameraIndex]?.rectangles;
            if (currentRegions && currentRegions.length > 0) {
                // Delay to ensure canvas is ready
                setTimeout(() => {
                    forceCanvasRedraw();
                }, 150);
            }
        }
    }, [activeCameraIndex, cameraRegionStates, showMultiCameraRegion, activeImagePath, forceCanvasRedraw]);

    // Handle modal close/reopen - clear cache to force reload
    useEffect(() => {
        if (!showMultiCameraRegion) {
            // When modal closes, don't clear the cache immediately
            // This preserves the regions for when modal reopens
            console.log('Multi-camera modal closed');
        } else {
            // When modal opens, ensure regions are loaded
            console.log('Multi-camera modal opened, ensuring regions are loaded');
            if (mngstateInfo?._id && activeCameraIndex !== null) {
                // Force reload regions when modal reopens
                setTimeout(() => {
                    loadMultiCameraRegions(activeCameraIndex, true); // Force reload
                }, 200);
            }
        }
    }, [showMultiCameraRegion, mngstateInfo?._id, activeCameraIndex]);

    // Initialize camera index when modal opens
    useEffect(() => {
        if (showMultiCameraRegion && activeCameraIndex === null && mngstateInfo?.camera_selection?.cameras?.length > 0) {
            console.log('Setting initial camera index to 0');
            setActiveCameraIndex(0);
        }
    }, [showMultiCameraRegion, activeCameraIndex, mngstateInfo?.camera_selection?.cameras]);

    // Handle modal reopening - ensure regions are visible
    useEffect(() => {
        if (showMultiCameraRegion && activeCameraIndex !== null && activeImagePath) {
            console.log('Modal reopened, ensuring regions are visible for camera:', activeCameraIndex);

            // Force canvas redraw after a short delay to ensure modal is fully rendered
            setTimeout(() => {
                const currentRegions = cameraRegionStates[activeCameraIndex]?.rectangles;
                if (currentRegions && currentRegions.length > 0) {
                    console.log('Drawing existing regions for camera:', activeCameraIndex, 'regions:', currentRegions.length);
                    drawMultiCameraRegions(activeCameraIndex, activeImagePath);
                } else {
                    console.log('No existing regions found, will load from backend');
                }
            }, 200);
        }

        // Cleanup when modal closes
        return () => {
            if (!showMultiCameraRegion) {
                console.log('Modal closed, preserving region state for next open');
                // Don't clear the regions state - keep it for next modal open
            }
        };
    }, [showMultiCameraRegion]); // Only trigger when modal opens/closes

    // Immediate canvas setup when modal opens
    useEffect(() => {
        if (showMultiCameraRegion && activeImagePath && activeCameraIndex !== null) {
            // Draw canvas immediately when modal opens (even without regions)
            setTimeout(() => {
                drawMultiCameraRegions(activeCameraIndex, activeImagePath);
            }, 50);
        }
    }, [showMultiCameraRegion, activeImagePath, activeCameraIndex, drawMultiCameraRegions]);

    // Force outline preview refresh when multiCameraOutlines changes
    useEffect(() => {
        console.log('🔄 MultiCameraOutlines changed, forcing preview refresh');
        setOutlinePreviewRefresh(prev => prev + 1);
    }, [multiCameraOutlines]);

    // Testing functions
    const overallTest = useCallback((e) => {
        setOverallTesting(e.target.checked);
        if (e.target.checked === true) {
            setTestingModeRequired(false);
        }
    }, []);

    const regionWiseTest = useCallback((e) => {
        setRegionWiseTesting(e.target.checked);
        if (e.target.checked === true) {
            setTestingModeRequired(false);
        }
    }, []);


    // Render component
    console.log('stageModelInfo', stageModelInfo)
    const showButton = stageModelInfo.some(data => data.training_sts === 'Training Completed' || data.training_sts === 'No training required');
    const types = [...new Set(modelInfo.map(model => model.type))];
    const mlModels = modelInfo.filter(model => model.type === 'ML');
    const dlModels = modelInfo.filter(model => model.type === 'DL');
    // console.log('firstdlModels', mlModels, dlModels)

    const marks1 = {
        0: 0,
        200: 200
    };



    //Functionalities for the multicam region
    const editMultiCameraRectangle = useCallback((cameraIndex, rectIndex) => {
        const rect = cameraRegionStates[cameraIndex]?.rectangles?.[rectIndex];
        if (!rect) return;

        setMultiEditingRectangleIndex(rectIndex);
        setMultiEditingRectangleName(rect.name);
        setMultiOriginalRectangleName(rect.name);
        setShowMultiRegionEditModal(true);
    }, [cameraRegionStates]);

    const handleMultiRectangleNameChange = (e) => {
        const updatedName = e.target.value;
        setMultiEditingRectangleName(updatedName);

        setCameraRegionStates(prev => {
            if (!prev || !prev[activeCameraIndex]) return prev;

            return {
                ...prev,
                [activeCameraIndex]: {
                    ...prev[activeCameraIndex],
                    rectangles: prev[activeCameraIndex].rectangles.map((rect, idx) =>
                        idx === multiEditingRectangleIndex ? { ...rect, name: updatedName } : rect
                    ),
                },
            };
        });
    };

    // const saveMultiRectangleName = useCallback(async () => {
    //     try {
    //         const currentRect = cameraRegionStates[activeCameraIndex]?.rectangles?.[multiEditingRectangleIndex];
    //         if (!currentRect) throw new Error('Rectangle not found');

    //         const isSaved = !!currentRect.id; // Detect if saved

    //         if (isSaved) {
    //             const selectedCamera = mngstateInfo?.camera_selection?.cameras?.[activeCameraIndex];
    //             const cameraLabel = selectedCamera?.label?.toLowerCase()?.replace(/\s+/g, '_');

    //             const renamePayload = {
    //                 _id: mngstateInfo?._id || backupStageIds._id,
    //                 comp_id: mngstateInfo?.comp_id || compInfo?._id || backupStageIds.comp_id,
    //                 camera_index: activeCameraIndex,
    //                 camera_label: cameraLabel,
    //                 region_id: currentRect.id,
    //                 old_name: multiOriginalRectangleName,
    //                 new_name: multiEditingRectangleName,
    //                 multi_camera: true
    //             };

    //             const response = await urlSocket.post('/api/regions/rename_multi_camera_region', renamePayload);
    //             if (!response.data.success) throw new Error(response.data.message || 'Failed to rename region');
    //         }

    //         // Update local state for both saved and unsaved
    //         setCameraRegionStates(prev => ({
    //             ...prev,
    //             [activeCameraIndex]: {
    //                 ...prev[activeCameraIndex],
    //                 rectangles: prev[activeCameraIndex].rectangles.map((rect, idx) =>
    //                     idx === multiEditingRectangleIndex ? { ...rect, name: multiEditingRectangleName } : rect
    //                 )
    //             }
    //         }));

    //         Swal.fire({
    //             icon: 'success',
    //             title: 'Renamed!',
    //             text: `Region renamed to "${multiEditingRectangleName}".`,
    //             timer: 2000,
    //             showConfirmButton: false
    //         });

    //     } catch (error) {
    //         console.error('Error renaming region:', error);
    //         Swal.fire({
    //             icon: 'error',
    //             title: 'Rename Failed',
    //             text: error.message || 'Failed to rename region. Please try again.',
    //             confirmButtonText: 'OK'
    //         });
    //     } finally {
    //         setMultiEditingRectangleIndex(null);
    //         setMultiEditingRectangleName("");
    //         setMultiOriginalRectangleName("");
    //         setShowMultiRegionEditModal(false);
    //     }
    // }, [activeCameraIndex, multiEditingRectangleIndex, multiEditingRectangleName, multiOriginalRectangleName,
    //     cameraRegionStates, mngstateInfo, compInfo, backupStageIds]);


    //Bharani
    // const saveMultiRectangleName = useCallback(async () => {
    //     try {
    //         const cameraState = cameraRegionStates[activeCameraIndex];
    //         const currentRect = cameraState?.rectangles?.[multiEditingRectangleIndex];
    //         if (!currentRect) throw new Error('Rectangle not found');

    //         // 🔎 Duplicate name check
    //         const duplicate = cameraState.rectangles.some(
    //             (rect, idx) =>
    //                 idx !== multiEditingRectangleIndex &&
    //                 rect.name.trim().toLowerCase() === multiEditingRectangleName.trim().toLowerCase()
    //         );

    //         if (duplicate) {
    //             Swal.fire({
    //                 icon: 'warning',
    //                 title: 'Duplicate Name',
    //                 text: `A region named "${multiEditingRectangleName}" already exists.`,
    //                 confirmButtonText: 'OK'
    //             });
    //             return; // ❌ stop saving
    //         }

    //         const isSaved = !!currentRect.id;
    //         let resetTraining = false;
    //         if (isSaved) {
    //             const selectedCamera = mngstateInfo?.camera_selection?.cameras?.[activeCameraIndex];
    //             const cameraLabel = selectedCamera?.label;
    //             console.log('Training status before rename:', cameraLabel);
    //             const checkRes = await urlSocket.post('/api/regions/check_training_status', {
    //                 stage_id: mngstateInfo?._id,
    //                 camera_label: cameraLabel
    //             });

    //             const trainingStatus = checkRes.data.training_status;
    //             console.log('Training status before rename:', trainingStatus);

    //             // ✅ Step 2: Ask user only if training completed
    //             if (trainingStatus === 'training completed') {
    //                 const confirmRes = await Swal.fire({
    //                     title: 'Training Completed',
    //                     text: 'Training has already been completed. Do you want to reset training and continue renaming?',
    //                     icon: 'warning',
    //                     showCancelButton: true,
    //                     confirmButtonText: 'Yes, reset training',
    //                     cancelButtonText: 'No, keep training'
    //                 });

    //                 // Stop execution if user clicks "No"
    //                 if (!confirmRes.isConfirmed) {
    //                     Swal.fire({
    //                         icon: 'info',
    //                         title: 'Rename Cancelled',
    //                         text: 'Region renaming cancelled to preserve training status.',
    //                         timer: 2000,
    //                         showConfirmButton: false
    //                     });
    //                     setCameraRegionStates(prev => ({
    //                         ...prev,
    //                         [activeCameraIndex]: {
    //                             ...prev[activeCameraIndex],
    //                             rectangles: prev[activeCameraIndex].rectangles.map((rect, idx) =>
    //                                 idx === multiEditingRectangleIndex
    //                                     ? { ...rect, name: multiOriginalRectangleName }
    //                                     : rect
    //                             )
    //                         }
    //                     }));

    //                     return;
    //                 }

    //                 resetTraining = true;
    //             }


    //             const renamePayload = {
    //                 _id: mngstateInfo?._id || backupStageIds._id,
    //                 comp_id: mngstateInfo?.comp_id || compInfo?._id || backupStageIds.comp_id,
    //                 camera_index: activeCameraIndex,
    //                 camera_label: cameraLabel,
    //                 region_id: currentRect.id,
    //                 old_name: multiOriginalRectangleName,
    //                 new_name: multiEditingRectangleName,
    //                 multi_camera: true,
    //                 reset_training: resetTraining
    //             };

    //             const response = await urlSocket.post('/api/regions/rename_multi_camera_region', renamePayload);
    //             if (!response.data.success)
    //                 throw new Error(response.data.message || 'Failed to rename region');
    //         }


    //         // ✅ Update local state
    //         setCameraRegionStates(prev => ({
    //             ...prev,
    //             [activeCameraIndex]: {
    //                 ...prev[activeCameraIndex],
    //                 rectangles: prev[activeCameraIndex].rectangles.map((rect, idx) =>
    //                     idx === multiEditingRectangleIndex ? { ...rect, name: multiEditingRectangleName } : rect
    //                 )
    //             }
    //         }));

    //         Swal.fire({
    //             icon: 'success',
    //             title: 'Renamed!',
    //             text: `Region renamed to "${multiEditingRectangleName}".`,
    //             timer: 2000,
    //             showConfirmButton: false
    //         });

    //     } catch (error) {
    //         console.error('Error renaming region:', error);
    //         Swal.fire({
    //             icon: 'error',
    //             title: 'Rename Failed',
    //             text: error.message || 'Failed to rename region. Please try again.',
    //             confirmButtonText: 'OK'
    //         });
    //     } finally {
    //         setMultiEditingRectangleIndex(null);
    //         setMultiEditingRectangleName("");
    //         setMultiOriginalRectangleName("");
    //         setShowMultiRegionEditModal(false);
    //     }
    // }, [activeCameraIndex, multiEditingRectangleIndex, multiEditingRectangleName, multiOriginalRectangleName,
    //     cameraRegionStates, mngstateInfo, compInfo, backupStageIds]);


    //Chiran
    const saveMultiRectangleName = useCallback(async () => {
        console.log("I am changed ")
        try {
            const cameraState = cameraRegionStates[activeCameraIndex];
            const currentRect = cameraState?.rectangles?.[multiEditingRectangleIndex];
            if (!currentRect) throw new Error('Rectangle not found');

            // 1) Prevent empty or whitespace-only name
            if (!multiEditingRectangleName.trim()) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'Invalid Name',
                    text: 'Region name cannot be empty.',
                    confirmButtonText: 'OK'
                });

                // Revert UI change (because handleMultiRectangleNameChange updates the local rect name optimistically)
                setCameraRegionStates(prev => ({
                    ...prev,
                    [activeCameraIndex]: {
                        ...prev[activeCameraIndex],
                        rectangles: prev[activeCameraIndex].rectangles.map((rect, idx) =>
                            idx === multiEditingRectangleIndex ? { ...rect, name: multiOriginalRectangleName } : rect
                        )
                    }
                }));

                return; // keep modal open
            }

            // 2) Duplicate name check
            const duplicate = cameraState.rectangles.some(
                (rect, idx) =>
                    idx !== multiEditingRectangleIndex &&
                    rect.name.trim().toLowerCase() === multiEditingRectangleName.trim().toLowerCase()
            );

            if (duplicate) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'Duplicate Name',
                    text: `A region named "${multiEditingRectangleName}" already exists.`,
                    confirmButtonText: 'OK'
                });

                // Revert UI change
                setCameraRegionStates(prev => ({
                    ...prev,
                    [activeCameraIndex]: {
                        ...prev[activeCameraIndex],
                        rectangles: prev[activeCameraIndex].rectangles.map((rect, idx) =>
                            idx === multiEditingRectangleIndex ? { ...rect, name: multiOriginalRectangleName } : rect
                        )
                    }
                }));

                return; // keep modal open
            }

            // 3) If region is already saved on server, check training status and possibly confirm reset
            const isSaved = !!currentRect.id;
            let resetTraining = false;
            let cameraLabel;
            if (isSaved) {
                const selectedCamera = mngstateInfo?.camera_selection?.cameras?.[activeCameraIndex];
                cameraLabel = selectedCamera?.label;

                const checkRes = await urlSocket.post('/api/regions/check_training_status', {
                    stage_id: mngstateInfo?._id,
                    camera_label: cameraLabel
                });

                const trainingStatus = checkRes.data.training_status;

                if (trainingStatus === 'training completed') {
                    const confirmRes = await Swal.fire({
                        title: 'Training Completed',
                        text: 'Training has already been completed. Do you want to reset training and continue renaming?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Yes, reset training',
                        cancelButtonText: 'No, keep training'
                    });

                    if (!confirmRes.isConfirmed) {
                        await Swal.fire({
                            icon: 'info',
                            title: 'Rename Cancelled',
                            text: 'Region renaming cancelled to preserve training status.',
                            timer: 2000,
                            showConfirmButton: false
                        });

                        // Restore old name
                        setCameraRegionStates(prev => ({
                            ...prev,
                            [activeCameraIndex]: {
                                ...prev[activeCameraIndex],
                                rectangles: prev[activeCameraIndex].rectangles.map((rect, idx) =>
                                    idx === multiEditingRectangleIndex
                                        ? { ...rect, name: multiOriginalRectangleName }
                                        : rect
                                )
                            }
                        }));

                        return; // keep modal open
                    }

                    resetTraining = true;
                }
            }

            // 4) Call rename API if needed
            if (isSaved) {
                const renamePayload = {
                    _id: mngstateInfo?._id || backupStageIds._id,
                    comp_id: mngstateInfo?.comp_id || compInfo?._id || backupStageIds.comp_id,
                    camera_index: activeCameraIndex,
                    camera_label: cameraLabel,
                    region_id: currentRect.id,
                    old_name: multiOriginalRectangleName,
                    new_name: multiEditingRectangleName,
                    multi_camera: true,
                    reset_training: resetTraining
                };

                const response = await urlSocket.post('/api/regions/rename_multi_camera_region', renamePayload);
                if (!response.data.success) {
                    throw new Error(response.data.message || 'Failed to rename region');
                }
            }

            // 5) Update local state (apply the new name)
            setCameraRegionStates(prev => ({
                ...prev,
                [activeCameraIndex]: {
                    ...prev[activeCameraIndex],
                    rectangles: prev[activeCameraIndex].rectangles.map((rect, idx) =>
                        idx === multiEditingRectangleIndex ? { ...rect, name: multiEditingRectangleName } : rect
                    )
                }
            }));

            await Swal.fire({
                icon: 'success',
                title: 'Renamed!',
                text: `Region renamed to "${multiEditingRectangleName}".`,
                timer: 1500,
                showConfirmButton: false
            });

            // 6) Clean up and close modal (only on success)
            setMultiEditingRectangleIndex(null);
            setMultiEditingRectangleName("");
            setMultiOriginalRectangleName("");
            setShowMultiRegionEditModal(false);

        } catch (error) {
            console.error('Error renaming region:', error);

            // Keep the modal open on error and revert UI to original name (if available)
            setCameraRegionStates(prev => {
                if (!prev || !prev[activeCameraIndex]) return prev;
                return {
                    ...prev,
                    [activeCameraIndex]: {
                        ...prev[activeCameraIndex],
                        rectangles: prev[activeCameraIndex].rectangles.map((rect, idx) =>
                            idx === multiEditingRectangleIndex ? { ...rect, name: multiOriginalRectangleName } : rect
                        )
                    }
                };
            });

            await Swal.fire({
                icon: 'error',
                title: 'Rename Failed',
                text: error.message || 'Failed to rename region. Please try again.',
                confirmButtonText: 'OK'
            });
        }
    }, [
        activeCameraIndex,
        multiEditingRectangleIndex,
        multiEditingRectangleName,
        multiOriginalRectangleName,
        cameraRegionStates,
        mngstateInfo,
        compInfo,
        backupStageIds
    ]);

    // Cancel changes (revert to original)
    const cancelMultiRectangleEditing = () => {
        setCameraRegionStates(prev => {
            if (!prev || !prev[activeCameraIndex]) return prev;

            return {
                ...prev,
                [activeCameraIndex]: {
                    ...prev[activeCameraIndex],
                    rectangles: prev[activeCameraIndex].rectangles.map((rect, idx) =>
                        idx === multiEditingRectangleIndex ? { ...rect, name: multiOriginalRectangleName } : rect
                    ),
                },
            };
        });

        setMultiEditingRectangleIndex(null);
        setMultiEditingRectangleName("");
        setMultiOriginalRectangleName("");
        setShowMultiRegionEditModal(false);
    };

    //Pop up for Multicam Modal when Close 25 aug 2025
    const isMultiCameraRegionChanged = useCallback(() => {
        // Loop through all cameras and check if any rectangles are modified
        return Object.keys(cameraRegionStates).some((cameraIndex) => {
            const camState = cameraRegionStates[cameraIndex];
            if (!camState) return false;
            return camState.isChanged; // assuming you track changes with `isChanged`
        });
    }, [cameraRegionStates]);

    // const handleMultiCameraClose = async () => {
    //     // Check if any camera has unsaved changes
    //     const unsavedCamera = Object.keys(cameraRegionStates).find(index => {
    //         const state = cameraRegionStates[index];
    //         if (!state) return false;
    //         const savedRects = state.savedRectangles || [];
    //         const currentRects = state.rectangles || [];
    //         // Check if current rectangles are different from last saved
    //         return JSON.stringify(savedRects) !== JSON.stringify(currentRects);
    //     });

    //     if (unsavedCamera != null) {
    //         // Show Save / Don't Save / Cancel
    //         const result = await Swal.fire({
    //             title: 'Do you want to save changes?',
    //             icon: 'warning',
    //             showCancelButton: true,
    //             showDenyButton: true,
    //             confirmButtonText: 'Save',
    //             denyButtonText: "Don't Save",
    //             cancelButtonText: 'Cancel',
    //         });

    //         if (result.isConfirmed) {
    //             // Save all unsaved cameras
    //             await saveMultiCameraRegion(Number(unsavedCamera));
    //             setShowMultiCameraRegion(false);
    //         } else if (result.isDenied) {
    //             // Discard changes and close
    //             setCameraRegionStates(prev => {
    //                 const newState = { ...prev };
    //                 if (unsavedCamera != null) {
    //                     newState[unsavedCamera] = {
    //                         ...prev[unsavedCamera],
    //                         rectangles: prev[unsavedCamera].savedRectangles || []
    //                     };
    //                 }
    //                 return newState;
    //             });
    //             setShowMultiCameraRegion(false);
    //         }
    //         // Cancel just returns without closing
    //         return;
    //     }

    //     // No unsaved changes, just close
    //     setShowMultiCameraRegion(false);
    // };

    //update on 25 -aug -2025
    // const handleMultiCameraClose = async () => {
    //     // Find if any camera has unsaved changes compared to initial snapshot
    //     const unsavedCamera = Object.keys(cameraRegionStates).find(index => {
    //         const state = cameraRegionStates[index];
    //         if (!state) return false;
    //         const initialRects = state.initialRectangles || [];
    //         const currentRects = state.rectangles || [];
    //         // Show popup only if user made changes to the original regions
    //         return JSON.stringify(initialRects) !== JSON.stringify(currentRects);
    //     });

    //     if (unsavedCamera != null) {
    //         const result = await Swal.fire({
    //             title: 'Do you want to save changes?',
    //             icon: 'warning',
    //             showCancelButton: true,
    //             showDenyButton: true,
    //             confirmButtonText: 'Save',
    //             denyButtonText: "Don't Save",
    //             cancelButtonText: 'Cancel',
    //         });

    //         if (result.isConfirmed) {
    //             // Save changes
    //             await saveMultiCameraRegion(Number(unsavedCamera), { fromCloseButton: true });
    //             setShowMultiCameraRegion(false);
    //         } else if (result.isDenied) {
    //             // Discard changes
    //             setCameraRegionStates(prev => {
    //                 const newState = { ...prev };
    //                 const camState = newState[unsavedCamera];
    //                 if (camState) {
    //                     newState[unsavedCamera] = {
    //                         ...camState,
    //                         rectangles: camState.initialRectangles ? [...camState.initialRectangles] : [],
    //                         savedRectangles: camState.initialRectangles ? [...camState.initialRectangles] : [],
    //                     };
    //                 }
    //                 return newState;
    //             });
    //             setShowMultiCameraRegion(false);

    //             Swal.fire({
    //                 title: 'Changes are not saved',
    //                 icon: 'info',
    //                 timer: 2000,
    //                 showConfirmButton: false
    //             });
    //         }
    //         // Cancel does nothing
    //         return;
    //     }

    //     // No changes detected, close normally
    //     setShowMultiCameraRegion(false);
    // };
    const handleMultiCameraClose = async () => {
        // --- Find if any camera has unsaved changes ---
        const unsavedCamera = Object.keys(cameraRegionStates).find(index => {
            const state = cameraRegionStates[index];
            if (!state) return false;

            const initialRects = state.initialRectangles || [];
            const currentRects = state.rectangles || [];

            // Check for any change in length
            if (initialRects.length !== currentRects.length) return true;

            // Check for any property change: id, x, y, width, height, name, colour
            return initialRects.some((r, i) => {
                const curr = currentRects[i];
                return !curr ||
                    r.id !== curr.id ||
                    r.x !== curr.x ||
                    r.y !== curr.y ||
                    r.width !== curr.width ||
                    r.height !== curr.height ||
                    r.name !== curr.name ||
                    r.colour !== curr.colour;
            });
        });

        if (unsavedCamera != null) {
            const result = await Swal.fire({
                title: 'Do you want to save changes?',
                icon: 'warning',
                showCancelButton: true,
                showDenyButton: true,
                confirmButtonText: 'Save',
                denyButtonText: "Don't Save",
                cancelButtonText: 'Cancel',
            });

            if (result.isConfirmed) {
                // Save changes
                await saveMultiCameraRegion(Number(unsavedCamera), { fromCloseButton: true });
                setShowMultiCameraRegion(false);
            } else if (result.isDenied) {
                // Discard changes: reset to initial snapshot
                setCameraRegionStates(prev => {
                    const camState = prev[unsavedCamera];
                    if (!camState) return prev;

                    return {
                        ...prev,
                        [unsavedCamera]: {
                            ...camState,
                            rectangles: camState.initialRectangles ? [...camState.initialRectangles] : [],
                            savedRectangles: camState.initialRectangles ? [...camState.initialRectangles] : [],
                        }
                    };
                });

                setShowMultiCameraRegion(false);

                Swal.fire({
                    title: 'Changes are not saved',
                    icon: 'info',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
            // Cancel does nothing
            return;
        }

        // --- No changes detected, close normally ---
        setShowMultiCameraRegion(false);
    };





    const saveRelocatedRectangle = () => {
        const cameraIndex = 0; // or get dynamically
        const rectIndex = cameraRegionStates[cameraIndex].selectedRectangleIndex;
        if (rectIndex === null) return;

        const movedRect = cameraRegionStates[cameraIndex].rectangles[rectIndex];
        handleRectangleDrag(cameraIndex, movedRect);
    };






    return (
        <>
            {fullScreenLoading && <FullScreenLoader />}

            <div className="page-content">
                <Row className="mb-3">
                    <Col xs={9}>
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="mb-0 mt-2 m-2 font-size-14 fw-bold">
                                MODEL INFORMATION TO STAGE
                            </div>
                        </div>
                    </Col>
                    <Col xs={3} className="d-flex align-items-center justify-content-end">
                        <button
                            className="btn btn-outline-primary btn-sm me-2"
                            color="primary"
                            onClick={back}
                        >
                            Back <i className="mdi mdi-arrow-left"></i>
                        </button>
                    </Col>
                </Row>

                <Container fluid={true}>
                    <Card>
                        <CardBody>
                            {modelInfoLoading ? (
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        height: '50vh',
                                    }}
                                >
                                    <Spinner color="primary" />
                                    <h5 className="mt-4">
                                        <strong>Loading Model Details...</strong>
                                    </h5>
                                </div>
                            ) : (
                                <>
                                    {/* <CardText className="mb-0 ">
                                        <span className="me-2 font-size-12">
                                            Comp Name :
                                        </span>
                                        {compName}
                                    </CardText>
                                    <CardText className="mb-0">
                                        <span className="me-2 font-size-12">
                                            Comp Code :
                                        </span>
                                        {compCode}
                                    </CardText>
                                    <CardText className="mb-0 ">
                                        <span className="me-2 font-size-12">
                                            Stage Name :
                                        </span>
                                        {stageName}
                                    </CardText>
                                    <CardText className="mb-0">
                                        <span className="me-2 font-size-12">
                                            Stage Code :
                                        </span>
                                        {stageCode}
                                    </CardText> */}
                                    <Row className="d-flex flex-wrap justify-content-start align-items-center gap-3 mb-2">
                                        <Col xs="12" lg="auto">
                                            <CardText className="mb-0">
                                                <span className="me-2 font-size-12">Comp Name :</span>{compName}
                                            </CardText>
                                        </Col>
                                        <Col xs="12" lg="auto">
                                            <CardText className="mb-0">
                                                <span className="me-2 font-size-12">Comp Code :</span>{compCode}
                                            </CardText>
                                        </Col>
                                        <Col xs="12" lg="auto">
                                            <CardText className="mb-0">
                                                <span className="me-2 font-size-12">Stage Name :</span>{stageName}
                                            </CardText>
                                        </Col>
                                        <Col xs="12" lg="auto">
                                            <CardText className="mb-0">
                                                <span className="me-2 font-size-12">Stage Code :</span>{stageCode}
                                            </CardText>
                                        </Col>
                                        <Col xs="12" lg="auto">
                                            <CardText className="mb-0">
                                                <span className="me-2 font-size-12">Camera_label:</span>
                                                {mngstateInfo?.camera_selection?.cameras?.length > 0
                                                    ? mngstateInfo.camera_selection.cameras.map((cam, index) => (
                                                        <span key={index} className="me-2">{cam.label}</span>
                                                    ))
                                                    : "No Camera"}
                                            </CardText>
                                        </Col>

                                    </Row>

                                    <ButtonGroup className='my-2'>
                                        <Button
                                            className='btn btn-sm'
                                            color="primary"
                                            outline={selectFilter !== 0}
                                            onClick={() => fixedOrany('Fixed', 0)}
                                            disabled={isLoading}
                                        >
                                            {isLoading && loadingButtonIndex === 0 ? (
                                                <>
                                                    <Spinner size="sm" className="me-2" />
                                                    Loading...
                                                </>
                                            ) : (
                                                'Fixed position'
                                            )}
                                        </Button>
                                        <Button
                                            className='btn btn-sm'
                                            color="primary"
                                            outline={selectFilter !== 1}
                                            onClick={() => fixedOrany('any', 1)}
                                            disabled={isLoading}
                                        >
                                            {isLoading && loadingButtonIndex === 1 ? (
                                                <>
                                                    <Spinner size="sm" className="me-2" />
                                                    Loading...
                                                </>
                                            ) : (
                                                'Any position'
                                            )}
                                        </Button>
                                    </ButtonGroup>

                                    {selectFilter === 0 && (
                                        <div className="my-1 mx-1">
                                            <Checkbox
                                                checked={regionTesting}
                                                onChange={regionSelection}
                                                disabled={trainingStatus}

                                            >
                                                Region Selection
                                            </Checkbox>
                                        </div>
                                    )}

                                    {tabs && (
                                        <>
                                            <div className="d-flex my-3">
                                                <Dropdown
                                                    overlay={
                                                        <Menu>
                                                            <Menu.SubMenu title="ML Models">
                                                                {mlModels.length !== 0 ? (
                                                                    mlModels.map((model, idx) => (
                                                                        <Menu.Item
                                                                            key={idx.toString()}
                                                                            onClick={() => handleModelSelect(model)}
                                                                            className={
                                                                                selectedModel === model
                                                                                    ? 'ant-menu-item-selected'
                                                                                    : ''
                                                                            }
                                                                        >
                                                                            {model.model_name}
                                                                        </Menu.Item>
                                                                    ))
                                                                ) : (
                                                                    <Menu.Item key="no-model" disabled>
                                                                        No ML Models available
                                                                    </Menu.Item>
                                                                )}
                                                            </Menu.SubMenu>
                                                            <Menu.SubMenu title="DL Models">
                                                                {dlModels.length !== 0 ? (
                                                                    dlModels.map((model, idx) => (
                                                                        <Menu.Item
                                                                            key={idx.toString()}
                                                                            onClick={() => handleModelSelect(model)}
                                                                            className={
                                                                                selectedModel === model
                                                                                    ? 'ant-menu-item-selected'
                                                                                    : ''
                                                                            }
                                                                        >
                                                                            {model.model_name}
                                                                        </Menu.Item>
                                                                    ))
                                                                ) : (
                                                                    <Menu.Item key="no-model" disabled>
                                                                        No DL Models available
                                                                    </Menu.Item>
                                                                )}
                                                            </Menu.SubMenu>
                                                        </Menu>
                                                    }
                                                    arrow
                                                >
                                                    <Button className="btn btn-sm" color="info">
                                                        Select a Model to Assign
                                                    </Button>
                                                </Dropdown>

                                                {selectFilter === 0 && (
                                                    <div className="ms-3">
                                                        <Button
                                                            className="btn btn-sm"
                                                            color={
                                                                mngstateInfo?.datasets?.white_path
                                                                    ? 'success'
                                                                    : 'warning'
                                                            }
                                                            onClick={createMultiCameraOutline}
                                                            disabled={trainingStatus}
                                                        >
                                                            {(() => {
                                                                const isMultiCamera = mngstateInfo?.camera_selection?.mode === 'multi';
                                                                const hasOutline = mngstateInfo?.datasets?.white_path;
                                                                const totalCameras = mngstateInfo?.camera_selection?.cameras?.length || 0;
                                                                const completedOutlines = getCompletedOutlinesCount();

                                                                if (isMultiCamera) {
                                                                    if (completedOutlines === totalCameras && totalCameras > 0) {
                                                                        return `View Outlines (${completedOutlines}/${totalCameras})`;
                                                                    } else {
                                                                        return `Create Multi-Camera Outlines (${completedOutlines}/${totalCameras})`;
                                                                    }
                                                                } else {
                                                                    return hasOutline ? 'View Outline' : 'Add Outline';
                                                                }
                                                            })()}
                                                        </Button>
                                                    </div>
                                                )}

                                                {/* Multi-Camera Region Button */}
                                                {selectFilter === 0 &&
                                                    regionTesting === true &&
                                                    mngstateInfo?.camera_selection?.mode === 'multi' && (
                                                        // <div className="ms-3">
                                                        //     <Button
                                                        //         className="btn btn-sm"
                                                        //         color="info"
                                                        //         onClick={() => setShowMultiCameraRegion(true)}
                                                        //         disabled={trainingStatus}
                                                        //     >
                                                        //         <i className="bx bx-shape-square me-1"></i>
                                                        //         Multi-Camera Regions
                                                        //     </Button>
                                                        // </div>
                                                        <div className="ms-3">
                                                            <Button
                                                                className="btn btn-sm"
                                                                color="info"
                                                                disabled={trainingStatus}
                                                                onClick={() => {
                                                                    // Check condition before allowing region creation
                                                                    const needsOutline =
                                                                        !(
                                                                            mngstateInfo?.datasets?.white_path ||
                                                                            (mngstateInfo?.camera_selection?.mode === 'multi' &&
                                                                                getCompletedOutlinesCount() > 0)
                                                                        );

                                                                    if (needsOutline) {
                                                                        Swal.fire({
                                                                            icon: "warning",
                                                                            title: "Outline Required",
                                                                            text: "Please create the outline first before proceeding to Multi-Camera Regions.",
                                                                            confirmButtonColor: "#3085d6",
                                                                            confirmButtonText: "OK",
                                                                        });
                                                                        return; // stop further execution
                                                                    }

                                                                    // Otherwise, open the multi-camera region modal
                                                                    setShowMultiCameraRegion(true);
                                                                }}
                                                            >
                                                                <i className="bx bx-shape-square me-1"></i>
                                                                Multi-Camera Regions
                                                            </Button>
                                                        </div>
                                                    )}

                                                {selectFilter === 0 &&
                                                    regionTesting === true &&
                                                    mngstateInfo?.camera_selection?.mode !== 'multi' &&
                                                    mngstateInfo?.datasets?.image_path && (
                                                        <div className="ms-3">
                                                            <Button
                                                                className="btn btn-sm"
                                                                color={
                                                                    mngstateInfo?.rectangles?.length > 0
                                                                        ? 'success'
                                                                        : 'warning'
                                                                }
                                                                onClick={togXlarge1}
                                                                disabled={trainingStatus}
                                                            >
                                                                {mngstateInfo?.rectangles?.length > 0
                                                                    ? 'View Region(s)'
                                                                    : 'Draw Region(s)'}
                                                            </Button>
                                                        </div>
                                                    )}

                                                {/* {showButton && (
                                                    <Button
                                                        color="success"
                                                        className="ms-auto btn btn-sm w-md"
                                                        onClick={toggleModal}
                                                    >
                                                        Start Admin Accuracy Testing
                                                    </Button>
                                                )} */}
                                            </div>

                                            <div className="table-responsive">
                                                <Table
                                                    className="table mb-0 align-middle table-nowrap table-check"
                                                    bordered
                                                >
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>S. No.</th>
                                                            <th>Model Name</th>
                                                            <th>Model Type</th>
                                                            <th>Model Status</th>
                                                            <th>Model Live Version</th>
                                                            <th>Training Status</th>
                                                            <th>Trained Version list</th>
                                                            <th>Model Version Info</th>
                                                            {/* <th>Admin Test</th> */}
                                                        </tr>
                                                    </thead>
                                                    {console.log("stageModelInfo5023", stageModelInfo)}
                                                    <tbody>
                                                        {stageModelInfo.map((data, index) => (
                                                            <tr key={index} id="recent-list">
                                                                <td style={{ backgroundColor: 'white' }}>
                                                                    {index + 1}
                                                                </td>
                                                                <td style={{ backgroundColor: 'white' }}>
                                                                    {data.model_name}
                                                                </td>
                                                                <td style={{ backgroundColor: 'white' }}>
                                                                    {data.type}
                                                                </td>
                                                                <td style={{ backgroundColor: "white" }}>
                                                                    <span className={
                                                                        data.model_status === 'Live' ? 'badge badge-soft-success' :
                                                                            data.model_status === 'Approved' ? 'badge badge-soft-warning' :
                                                                                data.model_status === 'Draft' ? 'badge badge-soft-info' :
                                                                                    'badge badge-soft-danger'
                                                                    }>
                                                                        {data.model_status}
                                                                    </span>
                                                                </td>
                                                                <td style={{ backgroundColor: 'white' }}>
                                                                    {data.model_live_ver && data.model_live_ver.length > 0 ? (
                                                                        <div
                                                                            style={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'space-around',
                                                                            }}
                                                                        >
                                                                            {data.model_live_ver === 'NA'
                                                                                ? 'NA'
                                                                                : 'V' +
                                                                                (Array.isArray(data.model_live_ver)
                                                                                    ? data.model_live_ver.join(' ,V')
                                                                                    : data.model_live_ver)}
                                                                        </div>
                                                                    ) : (
                                                                        <div
                                                                            style={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'space-around',
                                                                            }}
                                                                        >
                                                                            NA
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td style={{ backgroundColor: "white" }}>
                                                                    {(!data.training_sts || data.training_sts === '') ?
                                                                        'NA'
                                                                        : (Array.isArray(data.training_sts) ?
                                                                            data.training_sts.join(' , ') :
                                                                            data.training_sts)
                                                                    }
                                                                </td>
                                                                <td style={{ backgroundColor: 'white' }}>
                                                                    {data.trained_ver_list && data.trained_ver_list.length > 0 ? (
                                                                        <div
                                                                            style={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'space-around',
                                                                            }}
                                                                        >
                                                                            {Array.isArray(data.trained_ver_list) &&
                                                                                data.trained_ver_list[0] === 'NA'
                                                                                ? 'NA'
                                                                                : 'V' +
                                                                                (Array.isArray(data.trained_ver_list)
                                                                                    ? data.trained_ver_list.join(' ,V')
                                                                                    : data.trained_ver_list)}
                                                                        </div>
                                                                    ) : (
                                                                        <div
                                                                            style={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'space-around',
                                                                            }}
                                                                        >
                                                                            NA
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td style={{ backgroundColor: 'white' }}>

                                                                    {

                                                                    /*bharani code
                                                                     <Button
                                                                        color="primary"
                                                                        className="btn btn-sm"
                                                                        onClick={() => {
                                                                            console.log(!data?.region_selection, '!data?.region_selection');
                                                                            console.log("hiiii",
                                                                                !data?.region_selection ||
                                                                                !regionTesting ||
                                                                                (regionTesting && mngstateInfo?.rectangles?.length > 0)
                                                                            )
                                                                            if (
                                                                                !data?.region_selection ||
                                                                                !regionTesting ||
                                                                                (regionTesting && mngstateInfo?.rectangles?.length > 0)
                                                                            ) {
                                                                                goTOModelVerMgmt(data);
                                                                            } else {
                                                                                Swal.fire({
                                                                                    icon: 'warning',
                                                                                    title: 'Region Required',
                                                                                    text: 'At least create one region before managing the model.',
                                                                                });
                                                                            }
                                                                        }}
                                                                    >
                                                                        Manage
                                                                    </Button> */}
                                                                    <Button
                                                                        color="primary"
                                                                        className="btn btn-sm"
                                                                        onClick={() => handleManageClick(data)}
                                                                    >
                                                                        Manage
                                                                    </Button>

                                                                </td>
                                                                {/* <td style={{ backgroundColor: 'white' }}>
                                                                    <Checkbox
                                                                        name={data.model_name}
                                                                        value={data}
                                                                        checked={data?.checked || false}
                                                                        onChange={(e) => handleChange(e, data.type)}
                                                                    />
                                                                </td> */}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                                {compModelInfo.length === 0 && (
                                                    <div
                                                        className="container"
                                                        style={{
                                                            position: 'relative',
                                                            height: '20vh',
                                                        }}
                                                    >
                                                        <div
                                                            className="text-center"
                                                            style={{
                                                                position: 'absolute',
                                                                top: '50%',
                                                                left: '50%',
                                                                transform: 'translate(-50%, -50%)',
                                                            }}
                                                        >
                                                            <h5 className="text-secondary">
                                                                Please Select the Model
                                                            </h5>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </CardBody>
                    </Card>
                </Container>
            </div>

            {/* Modal window for Outline capturing */}
            <Modal
                isOpen={showOutline}
                toggle={closeOutline}
                centered
                size="xl"
                style={{ zIndex: 1000 }}
            >
                <ModalHeader toggle={closeOutline}>
                    <div>
                        Stage Name: {stageName}  Stage Code: {stageCode}
                    </div>
                </ModalHeader>
                <ModalBody>
                    <Row lg={12} className="text-center row-eq-height">
                        <Col sm={6} md={6} lg={6}>
                            <Card
                                className="mt-2"
                                style={{
                                    position: 'relative',
                                    backgroundColor: '#f0f0f0',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    border: '2px solid #ddd',
                                    flex: '1',
                                }}
                            >
                                <CardTitle
                                    className="my-2"
                                    style={{
                                        color: '#333',
                                        borderBottom: '2px solid #ddd',
                                        padding: '0.5rem 1rem',
                                    }}
                                >
                                    Capture Outline for Reference
                                </CardTitle>
                                <CardBody
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    {webcamEnabled &&
                                        (cameraDisconnected ? (
                                            <div
                                                className="my-2"
                                                style={{
                                                    outline: '2px solid #000',
                                                    padding: '10px',
                                                    borderRadius: '5px',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                }}
                                            >
                                                <div
                                                    className="d-flex flex-column justify-content-center align-items-center webcam-disconnected"
                                                    style={{ width: '100%' }}
                                                >
                                                    <h5 style={{ fontWeight: 'bold' }}>
                                                        Webcam Disconnected
                                                    </h5>
                                                    <Spinner className="mt-2" color="primary" />
                                                    <h6
                                                        className="mt-2"
                                                        style={{ fontWeight: 'bold' }}
                                                    >
                                                        Please check your webcam connection....
                                                    </h6>
                                                </div>
                                            </div>
                                        ) : (
                                            <ZoomableWebcamViewer
                                                ref={webcamRef}
                                                zoomVal={zoomValue?.zoom || 1}
                                                centerVal={zoomValue?.center || { x: 0.5, y: 0.5 }}
                                                cameraLabel={(() => {
                                                    const selectedCamera = mngstateInfo?.camera_selection?.camera?.originalLabel;
                                                    console.log('Single camera mode - Selected camera:', selectedCamera);
                                                    console.log('Camera selection data:', mngstateInfo?.camera_selection);
                                                    return selectedCamera;
                                                })()}
                                                onDisconnect={() => {
                                                    setCameraDisconnected(true);
                                                }}
                                                onCameraReady={() => {
                                                    setCameraDisconnected(false);
                                                }}
                                            />
                                        ))}
                                </CardBody>
                                <CardFooter>
                                    <div>
                                        <InputGroup className="my-3">
                                            <InputGroupText id="basic-addon1">
                                                Select Outline Type
                                            </InputGroupText>
                                            <Input
                                                type="select"
                                                value={outlineType}
                                                onChange={handleSelectChange}
                                            >
                                                <option value="1">Type 1</option>
                                                <option value="2">Type 2</option>
                                                <option value="3">Type 3</option>
                                                <option value="4">Type 4</option>
                                            </Input>
                                        </InputGroup>
                                    </div>
                                    <div>
                                        {addingImage ? (
                                            <Button
                                                color="info"
                                                className="btn btn-sm"
                                                style={{ whiteSpace: 'pre' }}
                                                disabled
                                            >
                                                Adding Outline... <Spin spinning={true}></Spin>
                                            </Button>
                                        ) : (
                                            webcamEnabled &&
                                            cameraDisconnected === false && (
                                                <Button
                                                    color="primary"
                                                    className="btn btn-sm"
                                                    onClick={captureImage}
                                                >
                                                    Add Outline
                                                </Button>
                                            )
                                        )}
                                    </div>
                                </CardFooter>
                            </Card>
                        </Col>
                        <Col
                            className="scrlHide"
                            sm={6}
                            md={6}
                            lg={6}
                            style={{
                                borderRadius: '5px',
                                height: '70vh',
                                overflowY: 'auto',
                            }}
                        >
                            <Row>
                                {imagesLength < 1 ? (
                                    <Col>
                                        <h5
                                            className="my-4"
                                            style={{ fontWeight: 'bold', textAlign: 'center' }}
                                        >
                                            No Outline available. Upload one to display.
                                        </h5>
                                    </Col>
                                ) : (
                                    <>
                                        <Card
                                            className="mt-2"
                                            style={{
                                                position: 'relative',
                                                backgroundColor: '#f0f0f0',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                border: '2px solid #ddd',
                                                flex: '1',
                                            }}
                                        >
                                            <div style={{ position: 'absolute', zIndex: '2' }}>
                                                {responseMessage && (
                                                    <Alert
                                                        severity={
                                                            responseMessage === 'Image successfully added'
                                                                ? 'success'
                                                                : 'error'
                                                        }
                                                    >
                                                        <AlertTitle
                                                            style={{
                                                                fontWeight: 'bold',
                                                                margin: 'auto',
                                                            }}
                                                        >
                                                            {responseMessage}
                                                        </AlertTitle>
                                                    </Alert>
                                                )}
                                            </div>
                                            <CardTitle
                                                className="my-2"
                                                style={{
                                                    color: '#333',
                                                    borderBottom: '2px solid #ddd',
                                                    padding: '0.5rem 1rem',
                                                }}
                                            >
                                                Image Outline Preview
                                            </CardTitle>
                                            <CardBody
                                                className="mb-2"
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    backgroundColor: 'rgb(42,48,66)',
                                                    zIndex: 100,
                                                    borderRadius: '10px',
                                                }}
                                            >
                                                {thresLoad === false ? (
                                                    <>
                                                        <AntdImage
                                                            key={outlineThres}
                                                            src={showImage(mngstateInfo.datasets.white_path)}
                                                            alt="Image not there"
                                                        />
                                                    </>
                                                ) : (
                                                    <Spinner className="mt-2" color="primary" />
                                                )}
                                            </CardBody>
                                        </Card>
                                    </>
                                )}
                            </Row>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>

            {/* Modal for Admin Accuracy Testing */}
            {modalOpen && (
                <SelectAdminTestMultipleVersions
                    modalOpen={modalOpen}
                    modelaccuracytest={modelAccuracyTest}
                    toggleModal={toggleModal}
                    closeModal={closeModal}
                    acctest={acctest}
                    rectangles={rectangles}
                />
            )}

            {/* Modal for Region Selection */}
            <Modal
                size="xl"
                isOpen={modalXlarge1}
                toggle={togXlarge1}
                scrollable={true}
                fullscreen
            >
                <ModalHeader toggle={togXlarge1}>
                    <div>
                        stage Name: {stageName} , stage Code: {stageCode}
                    </div>
                </ModalHeader>
                <ModalBody>
                    <Row>
                        <Col xs={12} md={6} lg={6}>
                            <Card
                                className="mt-2"
                                style={{
                                    position: 'relative',
                                    top: '0',
                                    zIndex: '1000',
                                    backgroundColor: '#f0f0f0',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    border: '2px solid #ddd',
                                    flex: '1',
                                }}
                            >
                                <CardTitle
                                    className="my-2 text-center"
                                    style={{
                                        color: '#333',
                                        borderBottom: '2px solid #ddd',
                                        padding: '0.5rem 1rem',
                                    }}
                                >
                                    Region Selectionds
                                </CardTitle>
                                <CardBody
                                    className="mb-2"
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        zIndex: 100,
                                        borderRadius: '10px',
                                    }}
                                >
                                    {(() => {
                                        console.log('🎯 REGION SELECTION DEBUG:');
                                        console.log('imageSrc', imageSrc);
                                        console.log('modalXlarge1', modalXlarge1);
                                        console.log('mngstateInfo camera mode:', mngstateInfo?.camera_selection?.mode);
                                        return null;
                                    })()}
                                    {
                                        console.log('canvasRefcanvasRef', canvasRef)
                                    }
                                    {imageSrc && (
                                        <div className="d-flex flex-column">
                                            <div
                                                ref={parentDivRef}
                                                className="d-flex"
                                                style={{
                                                    overflow: 'scroll',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                        transform: `scale(${zoom})`,
                                                        transformOrigin: 'top left',
                                                    }}
                                                >
                                                    <canvas
                                                        ref={canvasRef}
                                                        width={640}
                                                        height={480}
                                                        onMouseDown={
                                                            showRegion && isCreatingRegion
                                                                ? handleMouseDown
                                                                : null
                                                        }
                                                        onMouseMove={
                                                            showRegion && isCreatingRegion
                                                                ? handleMouseMove
                                                                : null
                                                        }
                                                        onMouseUp={
                                                            showRegion && isCreatingRegion
                                                                ? handleMouseUp
                                                                : null
                                                        }
                                                        onTouchStart={
                                                            showRegion && isCreatingRegion
                                                                ? handleMouseDown
                                                                : null
                                                        }
                                                        onTouchMove={
                                                            showRegion && isCreatingRegion
                                                                ? handleMouseMove
                                                                : null
                                                        }
                                                        onTouchEnd={
                                                            showRegion && isCreatingRegion
                                                                ? handleMouseUp
                                                                : null
                                                        }
                                                        style={{
                                                            borderRadius: '10px',
                                                            width: '100%',
                                                            height: 'auto',
                                                        }}
                                                    />
                                                    {rectangles.map((rect, index) => {
                                                        const canvas = canvasRef.current;
                                                        if (canvas?.getBoundingClientRect()) {
                                                            const canvasRect = canvas?.getBoundingClientRect();
                                                            const canvasWidthRect = canvasRect.width;
                                                            const canvasHeightRect = canvasRect.height;

                                                            const handleSizeW = 16 * (canvasWidth / 640);
                                                            const resizeW = 18 * (canvasWidth / 640);
                                                            const resizeH = 18 * (canvasHeight / 480);
                                                            const movingW = 20 * (canvasWidth / 640);
                                                            const movingH = 20 * (canvasHeight / 480);

                                                            return (
                                                                <React.Fragment key={index}>
                                                                    {showRegion && (
                                                                        <Popconfirm
                                                                            placement="rightBottom"
                                                                            title="Do you want to delete this region?"
                                                                            onConfirm={() => deleteSelectedRectangle(index)}
                                                                            zIndex={1200}
                                                                            okText="Yes"
                                                                            cancelText="No"
                                                                        >
                                                                            <button
                                                                                className="btn btn-sm"
                                                                                ref={(el) => (trashButtonsRef.current[index] = el)}
                                                                                style={{
                                                                                    position: 'absolute',
                                                                                    left: `${((rect.x + rect.width - handleSizeW) / 640) * 100}%`,
                                                                                    top: `${(rect.y / 480) * 100}%`,
                                                                                    background: 'none',
                                                                                    border: 'none',
                                                                                    cursor: 'pointer',
                                                                                    fontSize: `${handleSizeW}px`,
                                                                                    color: 'red',
                                                                                    transform: 'translate(-50%, 0%)',
                                                                                    zIndex: 10,
                                                                                }}
                                                                            >
                                                                                <FaTrashAlt />
                                                                            </button>
                                                                        </Popconfirm>
                                                                    )}

                                                                    {selectedRectangleIndex === index &&
                                                                        resizingRectangleIndex === index && (
                                                                            <div
                                                                                style={{
                                                                                    position: 'absolute',
                                                                                    left: `${((rect.x + rect.width) / 640) * 100}%`,
                                                                                    top: `${((rect.y + rect.height) / 480) * 100}%`,
                                                                                    width: `${resizeW}px`,
                                                                                    height: `${resizeH}px`,
                                                                                    background: 'white',
                                                                                    cursor: 'nwse-resize',
                                                                                    border: '2px solid black',
                                                                                    borderRadius: '50%',
                                                                                    transform: 'translate(-100%, -100%)',
                                                                                }}
                                                                                onMouseDown={(e) => handleResizeStart(e, index)}
                                                                                onTouchStart={(e) => handleResizeStart(e, index)}
                                                                            />
                                                                        )}
                                                                    {selectedRectangleIndex === index &&
                                                                        movingRectangleIndex === index && (
                                                                            <div
                                                                                style={{
                                                                                    position: 'absolute',
                                                                                    left: `${(rect.x / 640) * 100}%`,
                                                                                    top: `${(rect.y / 480) * 100}%`,
                                                                                    width: `${movingW}px`,
                                                                                    height: `${movingH}px`,
                                                                                    background: 'rgba(0, 0, 0, 0.5)',
                                                                                    cursor: 'move',
                                                                                }}
                                                                                onMouseDown={(e) => handleMoveStart(e, index)}
                                                                                onTouchStart={(e) => handleMoveStart(e, index)}
                                                                            />
                                                                        )}
                                                                </React.Fragment>
                                                            );
                                                        }
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardBody>
                                <CardFooter>
                                    <InputGroup>
                                        <Label className="mx-1">
                                            Choose Rectangle Color:{' '}
                                        </Label>
                                        <ColorPicker_1
                                            selectedColor={selectedColor}
                                            setSelectedColor={setSelectedColor}
                                        />
                                    </InputGroup>
                                    <InputGroup className="mx-3 my-3">
                                        <Label
                                            check
                                            className="py-1 px-2"
                                            style={{
                                                userSelect: 'none',
                                                boxShadow: showRegion
                                                    ? '0px 0px 10px 5px green'
                                                    : '0px 0px 10px 5px #ccc',
                                                borderRadius: '5px',
                                            }}
                                        >
                                            <Input
                                                type="checkbox"
                                                checked={showRegion}
                                                onChange={handleShowRegion}
                                            />{' '}
                                            Show Region
                                        </Label>
                                    </InputGroup>
                                    <Button
                                        className="mx-2 my-2 btn btn-sm"
                                        onClick={saveRegionChanges}
                                    >
                                        Save Changesdd
                                    </Button>
                                    <Button
                                        className="me-2 btn btn-sm"
                                        color="success"
                                        onClick={handleZoomIn}
                                    >
                                        Zoom In
                                    </Button>
                                    <Button
                                        className="me-2 btn btn-sm"
                                        color="warning"
                                        onClick={handleZoomOut}
                                    >
                                        Zoom Out
                                    </Button>
                                    <Button
                                        className="me-2 btn btn-sm"
                                        color="info"
                                        onClick={handleZoomReset}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        color="primary"
                                        className="me-2 btn btn-sm"
                                        onClick={() => setIsCreatingRegion(true)}
                                        disabled={!showRegion}
                                    >
                                        Create Region
                                    </Button>
                                </CardFooter>
                            </Card>
                        </Col>

                        <Col xs={12} md={6} lg={6}>
                            <div style={{ height: '30vh', overflowY: 'auto' }}>
                                {rectangles.map((rectangle, idRect) => (
                                    <div key={idRect} className="d-flex my-2">
                                        <div
                                            onMouseDown={() => handleRectangle(idRect)}
                                            className="d-flex item-button w-50 h-50"
                                            color="info"
                                        >
                                            <span className="me-auto">{rectangle.name}</span>

                                            <i
                                                className="mx-2"
                                                style={{ fontSize: '1rem', color: 'black' }}
                                                onMouseDown={() => {
                                                    if (showRegion) {
                                                        moveSelectedRectangle(idRect);
                                                    }
                                                }}
                                            >
                                                <FaArrowsAlt />
                                            </i>
                                            <i
                                                className="mx-2"
                                                style={{ fontSize: '1rem', color: 'black' }}
                                                onMouseDown={() => {
                                                    if (showRegion) {
                                                        resizeSelectedRectangle(idRect);
                                                    }
                                                }}
                                            >
                                                <FaExpand />
                                            </i>
                                            <i
                                                className="mx-2"
                                                style={{ fontSize: '1rem', color: 'black' }}
                                                onMouseDown={() => {
                                                    if (showRegion) {
                                                        editSelectedRectangle(idRect);
                                                    }
                                                }}
                                            >
                                                <FaEdit />
                                            </i>
                                            {showRegion && (
                                                <Popconfirm
                                                    placement="rightBottom"
                                                    title="Do you want to delete this region?"
                                                    onConfirm={() => deleteSelectedRectangle(idRect)}
                                                    zIndex={1200}
                                                    okText="Yes"
                                                    cancelText="No"
                                                >
                                                    <i
                                                        className="ms-2"
                                                        style={{
                                                            fontSize: '1rem',
                                                            color: 'red',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        <FaTrash />
                                                    </i>
                                                </Popconfirm>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Col>
                    </Row>
                </ModalBody>
            </Modal>

            {/* Modal for Region Name Edit */}
            <Modal
                isOpen={showRegionEditModal}
                toggle={() => setShowRegionEditModal(false)}
                backdrop="static"
                keyboard={false}
                centered
            >
                <ModalBody
                    className="rounded shadow"
                    style={{
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #dee2e6',
                        borderRadius: '1rem',
                    }}
                >
                    <CardTitle className="fw-bold fs-5 mb-3 text-dark">✏️ Edit Region Name</CardTitle>

                    <InputGroup className="gap-2">
                        <Input
                            type="text"
                            value={inputRectangleName}
                            onChange={handleNameChange}
                            maxLength="8"
                            pattern="^[a-zA-Z0-9]{1,8}$"
                            title="Only letters and numbers allowed, up to 8 characters."
                            className="rounded-3 shadow-sm border-secondary"
                            style={{ backgroundColor: '#fff', color: '#333' }}
                        />

                        <Button
                            size="sm"
                            color="success"
                            className="d-flex align-items-center rounded-3 px-3 shadow-sm"
                            onClick={() => handleNameSubmit(editingRectangleIndex)}
                        >
                            <FaSave className="me-2" />
                            Save
                        </Button>

                        <Button
                            size="sm"
                            color="secondary"
                            className="d-flex align-items-center rounded-3 px-3 shadow-sm"
                            onClick={() => {
                                setShowRegionEditModal(false);
                                setEditingRectangleIndex(null);
                                setExistRectangleNameError(false);
                                setInputRectangleName('');
                            }}
                        >
                            <FaTimes className="me-2" />
                            Cancel
                        </Button>
                    </InputGroup>

                    {existRectangleNameError && (
                        <Label className="text-danger mt-3 d-block">
                            * Rectangle Name Already Exists
                        </Label>
                    )}
                </ModalBody>
            </Modal>

            {/* Region Confirmation Modals */}
            {showRegionConfirmation && (
                <RegionConfirmationModal
                    isOpen={showRegionConfirmation}
                    toggle={discardRegionChanges}
                    onConfirm={sendCoordinatesToBackend}
                    message={regionConfirmationDatas}
                    updatingRegions={updatingRegions}
                />
            )}

            {regionSelecting && (
                <RegionConfirmationModal
                    isOpen={regionSelecting}
                    toggle={() => setRegionSelecting(false)}
                    onConfirm={confirmationRegion}
                    message={regionConfirmationDatas}
                    updatingRegions={updatingRegions}
                />
            )}

            {regionChanges === true && (
                <SweetAlert
                    title="Are you sure?"
                    warning
                    showCancel
                    confirmBtnBsStyle="success"
                    cancelBtnBsStyle="danger"
                    onConfirm={() => {
                        // Handle confirm
                        console.log('Confirmed');
                    }}
                    onCancel={() => {
                        // Handle cancel
                        console.log('Cancelled');
                    }}
                >
                    You won&apos;t be able to revert this!
                </SweetAlert>
            )}

            {/* Multi-Camera Outline Modal */}
            <Modal isOpen={showMultiCameraOutline} size="xl" toggle={() => setShowMultiCameraOutline(false)} centered>
                <ModalHeader toggle={() => setShowMultiCameraOutline(false)}>
                    Multi-Camera Outline Creation - Stage: {mngstateInfo?.stage_name}
                </ModalHeader>
                <ModalBody className="p-3">
                    {/* Camera Selection Tabs */}
                    <div className="camera-tabs mb-3">
                        <h6 className="mb-2">Select Camera for Outline Creation:</h6>
                        <div className="mb-2">
                            <small className="text-info">
                                Available Cameras: {mngstateInfo?.camera_selection?.cameras?.length || 0}
                            </small>
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                            {console.log('mngstateInfo', mngstateInfo)}
                            {mngstateInfo?.camera_selection?.cameras?.map((camera, index) => (
                                <Button
                                    key={camera.originalLabel}
                                    color={activeCameraForOutline === camera.originalLabel ? "primary" : "secondary"}
                                    onClick={() => {
                                        console.log('=== CAMERA TAB CLICKED ===');
                                        console.log('Switching to camera:', camera.originalLabel, camera.label);
                                        console.log('Camera originalLabel:', camera.originalLabel);
                                        console.log('Previous active camera:', activeCameraForOutline);
                                        setActiveCameraForOutline(camera.originalLabel);
                                        console.log('=== CAMERA TAB CLICK END ===');
                                    }}
                                    className="d-flex align-items-center"
                                    size="sm"
                                >
                                    {camera.label}
                                    {multiCameraOutlines[camera.originalLabel] && (
                                        <i className="bx bx-check-circle ms-1 text-success"></i>
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Active Camera Outline Interface */}
                    {activeCameraForOutline && (
                        <Card className="mb-0" key={`camera-card-${activeCameraForOutline}`}>
                            {/* <CardHeader className="pb-2">
                                <h5 className="mb-1">
                                    Camera: {mngstateInfo?.camera_selection?.cameras?.find(c => c.originalLabel === activeCameraForOutline)?.label || 'Unknown Camera'}
                                </h5>

                                <div className="mt-1">
                                    <small className="badge badge-soft-info me-2">
                                        Active Camera
                                    </small>
                                    <small className="badge badge-soft-warning">
                                        Device: {activeCameraForOutline}
                                    </small>
                                </div>
                            </CardHeader> */}
                            <CardBody className="pt-2">
                                <Row className="g-3">
                                    {/* Left Side - Camera Preview */}
                                    <Col sm={6} md={6} lg={6}>
                                        <Card className="mb-0">
                                            <CardHeader className="py-2">
                                                <h6 className="mb-0">Live Camera Feed</h6>
                                            </CardHeader>
                                            <CardBody className="p-2">
                                                <div style={{ position: 'relative', width: '100%', height: '400px' }}>
                                                    {activeCameraForOutline && (
                                                        <ZoomableWebcamViewer
                                                            key={`camera-viewer-${activeCameraForOutline}`}
                                                            ref={cameraWebcamRefs[activeCameraForOutline]}
                                                            deviceId={null}
                                                            cameraLabel={mngstateInfo?.camera_selection?.cameras?.find(c => c.originalLabel === activeCameraForOutline)?.originalLabel}
                                                            zoomVal={cameraZoomValues[activeCameraForOutline]?.zoom || 1}
                                                            centerVal={cameraZoomValues[activeCameraForOutline]?.center || { x: 0.5, y: 0.5 }}
                                                            onDisconnect={() => {
                                                                setCameraDisconnectedStates(prev => ({
                                                                    ...prev,
                                                                    [activeCameraForOutline]: true
                                                                }));
                                                            }}
                                                            onCameraReady={() => {
                                                                setCameraDisconnectedStates(prev => ({
                                                                    ...prev,
                                                                    [activeCameraForOutline]: false
                                                                }));
                                                            }}
                                                        />
                                                    )}

                                                    {!activeCameraForOutline && (
                                                        <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                                                            <div className="text-center">
                                                                <i className="bx bx-camera" style={{ fontSize: '48px', color: '#6c757d' }}></i>
                                                                <p className="mt-2 text-muted mb-0">No camera selected</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {cameraDisconnectedStates[activeCameraForOutline] && (
                                                        <div className="camera-disconnected-overlay">
                                                            <div className="text-center">
                                                                <i className="bx bx-camera-off" style={{ fontSize: '48px', color: '#dc3545' }}></i>
                                                                <h5 className="mt-2 text-danger mb-1">Camera Disconnected</h5>
                                                                <p className="mb-0">Please check camera connection</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Outline Controls */}
                                                <div className="outline-controls mt-5 mb-0">
                                                    <Row className="align-items-end g-2">
                                                        <Col md={4}>
                                                            <Label className="mb-1">Outline Type</Label>
                                                            <Input
                                                                type="select"
                                                                value={cameraOutlineConfigs[activeCameraForOutline]?.type || '3'}
                                                                onChange={(e) => updateCameraOutlineConfig(activeCameraForOutline, 'type', e.target.value)}
                                                            >
                                                                <option value="1">Type 1</option>
                                                                <option value="2">Type 2</option>
                                                                <option value="3">Type 3</option>
                                                                <option value="4">Type 4</option>
                                                            </Input>
                                                        </Col>
                                                        <Col md={4}>
                                                            <div className="d-flex flex-column">
                                                                <Button
                                                                    color="primary"
                                                                    onClick={() => captureOutlineForCamera(
                                                                        mngstateInfo?.camera_selection?.cameras?.find(c => c.originalLabel === activeCameraForOutline)
                                                                    )}
                                                                    disabled={outlineProgress[activeCameraForOutline]?.capturing || cameraDisconnectedStates[activeCameraForOutline]}
                                                                    className="flex-grow-1"
                                                                >
                                                                    {outlineProgress[activeCameraForOutline]?.capturing ? (
                                                                        <>
                                                                            <Spinner size="sm" className="me-2" />
                                                                            Capturing...
                                                                        </>
                                                                    ) : multiCameraOutlines[activeCameraForOutline] ? (
                                                                        'Update Outline'
                                                                    ) : (
                                                                        'Capture Outline'
                                                                    )}
                                                                </Button>


                                                            </div>
                                                        </Col>
                                                        <Col md={4}>
                                                            <div className=" gap-2">
                                                                {outlineProgress[activeCameraForOutline]?.capturing && (

                                                                    <Button
                                                                        color="warning"
                                                                        size="md"
                                                                        onClick={() => {
                                                                            console.log('🔄 Resetting capture state for:', activeCameraForOutline);
                                                                            setOutlineProgress(prev => ({
                                                                                ...prev,
                                                                                [activeCameraForOutline]: { capturing: false }
                                                                            }));
                                                                        }}
                                                                        title="Reset if stuck"
                                                                    >
                                                                        Reset
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            </CardBody>
                                        </Card>

                                        {/* Complete setup button */}
                                        {/* <div className="d-flex justify-content-center mt-3 mb-0">
                                <Button
                                    color="primary"
                                    onClick={() => {
                                        const totalCameras = mngstateInfo?.camera_selection?.cameras?.length || 0;
                                        const completedOutlines = getCompletedOutlinesCount();

                                        if (completedOutlines === totalCameras) {
                                            setShowMultiCameraOutline(false);
                                            Swal.fire({
                                                icon: 'success',
                                                title: 'All Outlines Completed!',
                                                text: 'You can now proceed with model assignment.',
                                                timer: 2000
                                            });
                                        } else {
                                            Swal.fire({
                                                icon: 'warning',
                                                title: 'Incomplete Outlines',
                                                text: `Please complete outlines for all ${totalCameras} cameras.`
                                            });
                                        }
                                    }}
                                    disabled={(() => {
                                        const totalCameras = mngstateInfo?.camera_selection?.cameras?.length || 0;
                                        const completedOutlines = getCompletedOutlinesCount();
                                        return completedOutlines < totalCameras;
                                    })()}
                                >
                                    Complete Setup
                                </Button>
                            </div> */}
                                    </Col>

                                    {/* Right Side - Outline Preview */}
                                    <Col sm={6} md={6} lg={6} className="d-flex flex-column">
                                        <Card className="mb-0 flex-fill">
                                            <CardHeader className="py-2" style={{ borderBottom: '1px solid #ddd' }}>
                                                <h6 className="mb-0">Outline Preview</h6>
                                            </CardHeader>
                                            <CardBody className="p-3 d-flex flex-column justify-content-center">
                                                {(() => {
                                                    const activeCamera = mngstateInfo?.camera_selection?.cameras?.find(c => c.originalLabel === activeCameraForOutline);
                                                    if (!activeCamera) return null;

                                                    const cameraPosition = activeCamera.label.replace(/\s+/g, '_').toLowerCase();
                                                    const cameraData = mngstateInfo?.datasets?.[cameraPosition];
                                                    const outlineData = multiCameraOutlines?.[activeCameraForOutline];

                                                    const hasDatasetOutline = cameraData && (cameraData.white_path || cameraData.image_path);
                                                    const hasOutlineData = outlineData && (outlineData.white_path || outlineData.path);

                                                    if (!hasDatasetOutline && !hasOutlineData) {
                                                        return (
                                                            <div className="text-center">
                                                                <h5 className="mb-0" style={{ fontWeight: 'bold' }}>
                                                                    No Outline available. Capture one to display.
                                                                </h5>
                                                            </div>
                                                        );
                                                    }

                                                    const imageSource = cameraData?.white_path
                                                        ? `${showImage(cameraData.white_path)}?t=${Date.now()}`
                                                        : (outlineData?.preview || null);

                                                    if (!imageSource) {
                                                        return (
                                                            <div className="d-flex justify-content-center">
                                                                <div style={{
                                                                    width: '200px',
                                                                    height: '150px',
                                                                    border: '1px solid #ddd',
                                                                    borderRadius: '4px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    backgroundColor: '#f8f9fa'
                                                                }}>
                                                                    <span className="text-muted">Image not available</span>
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <div className="text-center">

                                                            <div className="d-flex flex-column align-items-center gap-3">
                                                                <img
                                                                    key={`outline-${activeCameraForOutline}-${Date.now()}`}
                                                                    src={imageSource}
                                                                    alt="Camera outline - Black background with white lines"
                                                                    style={{
                                                                        maxWidth: "100%",
                                                                        maxHeight: "100%",
                                                                        border: '1px solid black',
                                                                        borderRadius: '4px',
                                                                        backgroundColor: 'black'
                                                                    }}
                                                                    onError={(e) => {
                                                                        console.error('❌ Image failed to load:', e.target.src);
                                                                        e.target.style.display = 'none';
                                                                        const errorDiv = document.createElement('div');
                                                                        errorDiv.style.cssText = `
                                                                width: 200px;
                                                                height: 150px;
                                                                border: 1px solid #dc3545;
                                                                border-radius: 4px;
                                                                display: flex;
                                                                align-items: center;
                                                                justify-content: center;
                                                                background-color: #f8d7da;
                                                                color: #721c24;
                                                            `;
                                                                        errorDiv.innerHTML = '<span>Image not found</span>';
                                                                        e.target.parentNode.insertBefore(errorDiv, e.target);
                                                                    }}
                                                                    onLoad={() => {
                                                                        console.log('✅ Image loaded successfully:', imageSource);
                                                                    }}
                                                                />
                                                                <div className="text-start">

                                                                    {outlineData?.preview === outlineData?.raw_preview ? (
                                                                        <span className="badge badge-soft-info">
                                                                            <i className="bx bx-loader-alt bx-spin me-1"></i>
                                                                            Processing...
                                                                        </span>
                                                                    ) : (
                                                                        <span className="badge badge-soft-success">Processed</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </CardBody>
                                        </Card>

                                        {/* Outline Progress Card */}
                                        <Card className="mt-3 mb-0">
                                            <CardBody className="p-3">
                                                <h6 className="mb-2">Outline Progress</h6>
                                                {(() => {
                                                    const totalCameras = mngstateInfo?.camera_selection?.cameras?.length || 0;
                                                    const completedOutlines = getCompletedOutlinesCount();
                                                    const progressPercentage = totalCameras > 0 ? (completedOutlines / totalCameras) * 100 : 0;

                                                    return (
                                                        <>
                                                            <div className="progress mb-2">
                                                                <div
                                                                    className="progress-bar"
                                                                    style={{ width: `${progressPercentage}%` }}
                                                                >
                                                                    {Math.round(progressPercentage)}%
                                                                </div>
                                                            </div>
                                                            <small className="text-muted d-block mb-2">
                                                                {completedOutlines} of {totalCameras} camera outlines completed
                                                            </small>


                                                        </>
                                                    );
                                                })()}
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                    )}
                </ModalBody>
            </Modal>

            {/* Multi-Camera Region Modal */}
            <Modal
                isOpen={showMultiCameraRegion}
                // toggle={() => setShowMultiCameraRegion(false)}
                toggle={handleMultiCameraClose}
                onOpened={() => {
                    // redraw canvas when modal finishes opening
                    const canvas = cameraCanvasRefs.current[activeCameraIndex];
                    if (canvas && activeImagePath) {
                        const ctx = canvas.getContext("2d");
                        const img = new Image();
                        img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        img.src = showImage(activeImagePath);
                    }
                }}
                size="xl"
                backdrop="static"
                keyboard={false}
                centered
            >
                {/* <ModalHeader toggle={() => setShowMultiCameraRegion(false)}> */}
                <ModalHeader toggle={handleMultiCameraClose}>
                    <h5 className="modal-title">Multi-Camera Region Selection</h5>
                </ModalHeader>
                <ModalBody>
                    <Card>
                        <CardBody>
                            {/* Camera Selection Tabs */}
                            {/* <div className="camera-tabs mb-3">
                                <ButtonGroup>
                             
                                    {
                                        console.log('mngstateInfo :>> ', mngstateInfo)
                                    }
                                    {(() => {
                                        // Use current camera selection or fallback to backup
                                        const cameraData = mngstateInfo?.camera_selection?.cameras || backupCameraSelection?.cameras;
                                        console.log('Camera data for buttons:', cameraData);

                                        if (cameraData?.length > 0) {
                                            return cameraData.map((camera, index) => (
                                                <Button
                                                    key={`camera-${index}-${camera.value || camera.originalLabel}`}
                                                    color={activeCameraIndex === index ? "primary" : "outline-primary"}
                                                    onClick={() => {
                                                        console.log('Camera button clicked:', index, camera.label);
                                                        setActiveCameraIndex(index);

                                                        // Load regions for this specific camera (don't force reload to prevent blinking)
                                                        loadMultiCameraRegions(index, false);
                                                    }}
                                                    size="sm"
                                                >
                                                    {camera.label}
                                                </Button>
                                            ));
                                        } else {
                                            return (
                                                <div className="text-muted">
                                                    <small>No cameras available</small>
                                                    <br />
                                                    <small>Debug: mngstateInfo cameras: {mngstateInfo?.camera_selection?.cameras?.length || 0}</small>
                                                    <br />
                                                    <small>Debug: backup cameras: {backupCameraSelection?.cameras?.length || 0}</small>
                                                </div>
                                            );
                                        }
                                    })()}

                                </ButtonGroup>
                            </div> */}
                            {/* updated on 25 - aug - 2025 */}
                            <div className="camera-tabs mb-3">
                                <ButtonGroup>
                                    {(() => {
                                        // Use current camera selection or fallback to backup
                                        const cameraData =
                                            mngstateInfo?.camera_selection?.cameras ||
                                            backupCameraSelection?.cameras;

                                        console.log("Camera data for buttons:", cameraData);

                                        if (cameraData?.length > 0) {
                                            return cameraData.map((camera, index) => (
                                                <Button
                                                    key={`camera-${index}-${camera.value || camera.originalLabel}`}
                                                    color={
                                                        activeCameraIndex === index ? "primary" : "outline-primary"
                                                    }
                                                    onClick={async () => {
                                                        console.log("Camera button clicked:", index, camera.label);

                                                        // --- Check for unsaved changes in current camera before switching ---
                                                        const currentIndex = activeCameraIndex;
                                                        const state = cameraRegionStates[currentIndex];
                                                        if (state) {
                                                            const initialRects = state.initialRectangles || [];
                                                            const currentRects = state.rectangles || [];

                                                            const hasChanges =
                                                                initialRects.length !== currentRects.length ||
                                                                initialRects.some((r, i) => {
                                                                    const curr = currentRects[i];
                                                                    return (
                                                                        !curr ||
                                                                        r.id !== curr.id ||
                                                                        Math.round(r.x) !== Math.round(curr.x) || // relocate detection
                                                                        Math.round(r.y) !== Math.round(curr.y) ||
                                                                        Math.round(r.width) !== Math.round(curr.width) ||
                                                                        Math.round(r.height) !== Math.round(curr.height) ||
                                                                        r.name !== curr.name ||
                                                                        r.colour !== curr.colour
                                                                    );
                                                                });

                                                            if (hasChanges) {
                                                                const result = await Swal.fire({
                                                                    title: "Do you want to save changes?",
                                                                    icon: "warning",
                                                                    showCancelButton: true,
                                                                    showDenyButton: true,
                                                                    confirmButtonText: "Save",
                                                                    denyButtonText: "Don't Save",
                                                                    cancelButtonText: "Cancel",
                                                                });

                                                                if (result.isConfirmed) {
                                                                    // Save current camera regions before switching
                                                                    await saveMultiCameraRegion(currentIndex, {
                                                                        fromTabSwitch: true,
                                                                    });
                                                                } else if (result.isDenied) {
                                                                    // Reset current camera state back to initial snapshot
                                                                    setCameraRegionStates((prev) => ({
                                                                        ...prev,
                                                                        [currentIndex]: {
                                                                            ...prev[currentIndex],
                                                                            rectangles: [
                                                                                ...(prev[currentIndex]?.initialRectangles || []),
                                                                            ],
                                                                        },
                                                                    }));

                                                                    Swal.fire({
                                                                        title: "Changes discarded",
                                                                        icon: "info",
                                                                        timer: 2000,
                                                                        showConfirmButton: false,
                                                                    });
                                                                } else {
                                                                    // Cancel → don't switch
                                                                    return;
                                                                }
                                                            }
                                                        }

                                                        // --- Now safe to switch camera ---
                                                        setActiveCameraIndex(index);
                                                        loadMultiCameraRegions(index, false);
                                                    }}
                                                    size="sm"
                                                >
                                                    {camera.label}
                                                </Button>
                                            ));
                                        } else {
                                            return (
                                                <div className="text-muted">
                                                    <small>No cameras available</small>
                                                    <br />
                                                    <small>
                                                        Debug: mngstateInfo cameras:{" "}
                                                        {mngstateInfo?.camera_selection?.cameras?.length || 0}
                                                    </small>
                                                    <br />
                                                    <small>
                                                        Debug: backup cameras:{" "}
                                                        {backupCameraSelection?.cameras?.length || 0}
                                                    </small>
                                                </div>
                                            );
                                        }
                                    })()}
                                </ButtonGroup>
                            </div>


                            {
                                console.log('cameraCanvasRefs[activeCameraForRegion]', cameraCanvasRefs[activeCameraForRegion])
                            }
                            {activeCameraForRegion && (

                                <Row>
                                    {/* Left Side - Camera Preview with Region Drawing */}
                                    <Col sm={6} md={6} lg={6}>
                                        <Card>
                                            <CardHeader>
                                                <h6 className="mb-0">
                                                    Camera: {mngstateInfo?.camera_selection?.cameras?.[activeCameraIndex]?.label || 'N/A'}
                                                </h6>

                                                {/* <h6 className="mb-0">Camerass: {mngstateInfo?.camera_selection?.cameras?.find(c => c.originalLabel === activeCameraForRegion)?.label}</h6> */}
                                            </CardHeader>
                                            <CardBody>

                                                <div style={{ position: 'relative', width: '100%', height: '400px' }}>
                                                    {/* Canvas for region drawing */}
                                                    {/* <canvas
                                                        ref={cameraCanvasRefs[activeCameraForRegion]}
                                                        width={640}
                                                        height={480}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '4px',
                                                            cursor: cameraRegionStates[activeCameraForRegion]?.isCreatingRegion ? 'crosshair' : 'default'
                                                        }}
                                                        onMouseDown={(e) => handleMultiCameraMouseDown(e, activeCameraForRegion)}
                                                        onMouseMove={(e) => handleMultiCameraMouseMove(e, activeCameraForRegion)}
                                                        onMouseUp={(e) => handleMultiCameraMouseUp(e, activeCameraForRegion)}
                                                    /> */}


                                                    <canvas
                                                        ref={(el) => {
                                                            if (el) cameraCanvasRefs.current[activeCameraIndex] = el;
                                                        }}
                                                        width={640}
                                                        height={480}
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            border: "1px solid #ddd",
                                                            borderRadius: "4px",
                                                            cursor: cameraRegionStates[activeCameraIndex]?.isCreatingRegion ? "crosshair" : "default",
                                                        }}
                                                        onMouseDown={(e) => handleMultiCameraMouseDown(e, activeCameraIndex)}
                                                        onMouseMove={(e) => handleMultiCameraMouseMove(e, activeCameraIndex)}
                                                        onMouseUp={(e) => handleMultiCameraMouseUp(e, activeCameraIndex)}
                                                        onTouchStart={(e) => handleMultiCameraMouseDown(e, activeCameraIndex)}
                                                        onTouchMove={(e) => handleMultiCameraMouseMove(e, activeCameraIndex)}
                                                        onTouchEnd={(e) => handleMultiCameraMouseUp(e, activeCameraIndex)}
                                                    />


                                                </div>

                                                {/* Region Controls */}
                                                <div className="region-controls mt-3">
                                                    <Row className="align-items-center">
                                                        <Col md={6}>
                                                            <div className="form-check">
                                                                <Input
                                                                    type="checkbox"
                                                                    checked={cameraRegionStates[activeCameraIndex]?.showRegion || false}
                                                                    onChange={() => handleMultiCameraShowRegion(activeCameraIndex)}
                                                                    className="form-check-input"
                                                                />
                                                                <Label className="form-check-label">
                                                                    Show Regions
                                                                </Label>
                                                            </div>
                                                        </Col>
                                                        <Col md={6}>
                                                            <Button
                                                                color="primary"
                                                                size="sm"
                                                                onClick={() => createMultiCameraRegion(activeCameraIndex)}
                                                                disabled={!cameraRegionStates[activeCameraIndex]?.showRegion}
                                                            >
                                                                <i className="bx bx-plus me-1"></i>
                                                                Create Region
                                                            </Button>
                                                        </Col>
                                                    </Row>

                                                    <InputGroup className='mt-2'>
                                                        <Label className="mx-1 mt-2">
                                                            Choose Rectangle Color:{' '}
                                                        </Label>
                                                        <ColorPicker_1

                                                            selectedColor={selectedColor}
                                                            setSelectedColor={setSelectedColor}
                                                        />
                                                    </InputGroup>

                                                    <Row className="align-items-center mt-3">
                                                        <Col>
                                                            <div className="d-flex flex-wrap gap-2">
                                                                <Button color="success" size="sm" onClick={() => saveMultiCameraRegionWithTrainingCheck(activeCameraIndex)}
                                                                    disabled={!cameraRegionStates[activeCameraIndex]?.showRegion || !cameraRegionStates[activeCameraIndex]?.rectangles?.length}>
                                                                    <i className="bx bx-save me-1"></i>
                                                                    Save Changes
                                                                </Button>


                                                                <Button color="success" className="btn btn-sm" onClick={handleZoomIn_mul}>Zoom In</Button>
                                                                <Button color="warning" className="btn btn-sm" onClick={handleZoomOut_mul}>Zoom Out</Button>
                                                                <Button color="info" className="btn btn-sm" onClick={handleZoomReset_mul}>Reset</Button>


                                                            </div>
                                                        </Col>
                                                    </Row>

                                                </div>
                                            </CardBody>
                                        </Card>
                                    </Col>

                                    <Col sm={6} md={6} lg={6}>
                                        <Card>
                                            <CardHeader>
                                                {/* <h6 className="mb-0">Regions for {mngstateInfo?.camera_selection?.cameras?.find(c => c.originalLabel === activeCameraForRegion)?.label}</h6> */}
                                                <h6 className="mb-0">Regions for {mngstateInfo?.camera_selection?.cameras?.[activeCameraIndex]?.label || 'N/A'}</h6>
                                            </CardHeader>
                                            <CardBody>
                                                {cameraRegionStates[activeCameraIndex]?.rectangles?.length > 0 ? (
                                                    <div className="region-list"
                                                        style={{
                                                            maxHeight: '540px', // set maximum height
                                                            overflowY: 'auto',  // scroll vertically when content exceeds maxHeight
                                                            paddingRight: '5px', // avoid scrollbar overlapping content
                                                        }}>
                                                        {cameraRegionStates[activeCameraIndex].rectangles.map((region, index) => (
                                                            <div key={index} className="region-item p-2 mb-2 border rounded">
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <div>
                                                                        <strong>{region.name}</strong>
                                                                        {/* <div className="text-muted small">
                                                                            Position: ({region.x}, {region.y}) | Size: {region.width}x{region.height}
                                                                        </div> */}

                                                                        {/* Buttons Container */}
                                                                        <div
                                                                            style={{
                                                                                display: "flex",
                                                                                gap: "5px", // spacing between buttons
                                                                                marginTop: "10px", // space above the buttons
                                                                            }}
                                                                        >

                                                                            {/* Relocate Button */}
                                                                            {/* Relocate / Move Mode Button */}
                                                                            {/* <Button
                                                                                color="primary"
                                                                                size="sm"
                                                                                title="Relocate"
                                                                                onClick={() => {
                                                                                    const cameraIndex = 0;
                                                                                    const rectIndex = index;

                                                                                    // Select rectangle
                                                                                    setCameraRegionStates(prev => {
                                                                                        const camState = prev[cameraIndex];
                                                                                        if (!camState) return prev;

                                                                                        return {
                                                                                            ...prev,
                                                                                            [cameraIndex]: {
                                                                                                ...camState,
                                                                                                selectedRectangleIndex: rectIndex,
                                                                                            },
                                                                                        };
                                                                                    });

                                                                                    // Enable move mode (white dot shows)
                                                                                    setMoveMode(true);

                                                                                    // Do NOT set isDragging yet, drag starts on white dot click
                                                                                }}
                                                                            >
                                                                                <i className="bx bx-move"></i>
                                                                            </Button> */}
                                                                            {/* updated on 25 - aug - 2025 */}
                                                                            <Button
                                                                                color="primary"
                                                                                size="sm"
                                                                                title="Relocate"
                                                                                onClick={() => {
                                                                                    const cameraIndex = activeCameraIndex; // <-- use current active camera
                                                                                    const rectIndex = index; // Current rectangle in this camera

                                                                                    // Select the rectangle for relocation in THIS camera
                                                                                    setCameraRegionStates(prev => {
                                                                                        const camState = prev[cameraIndex];
                                                                                        if (!camState) return prev;

                                                                                        return {
                                                                                            ...prev,
                                                                                            [cameraIndex]: {
                                                                                                ...camState,
                                                                                                selectedRectangleIndex: rectIndex, // mark this rectangle
                                                                                            },
                                                                                        };
                                                                                    });

                                                                                    // Enable move mode (white dot shows)
                                                                                    setMoveMode(true);
                                                                                }}
                                                                            >
                                                                                <i className="bx bx-move"></i>
                                                                            </Button>


                                                                            {/* Resize Button */}
                                                                            <Button
                                                                                color="warning"
                                                                                size="sm"
                                                                                title="Resize"
                                                                                onClick={() => {
                                                                                    startResizeMode(activeCameraIndex, index);
                                                                                    // saveResizedRectangle(activeCameraIndex, index);  // now defined
                                                                                }}
                                                                            >
                                                                                <i className="bx bx-expand"></i>
                                                                            </Button>
                                                                            {/* <Button
                                                                            color="warning"
                                                                            size="sm"
                                                                            title="Resize"
                                                                            onClick={() => startResizeMode(activeCameraIndex, index)}
                                                                            >
                                                                            <i className="bx bx-expand"></i>
                                                                        </Button> */}

                                                                            {/* Edit Button */}
                                                                            <Button
                                                                                color="info"
                                                                                size="sm"
                                                                                title='Edit'
                                                                                onClick={() => editMultiCameraRectangle(activeCameraIndex, index)}

                                                                            >
                                                                                {/* {console.log('activeCameraIndex :>> ', activeCameraIndex)} */}
                                                                                <i className="bx bx-edit"></i>
                                                                            </Button>

                                                                            {/* Model for Region Name Change */}

                                                                            <Modal
                                                                                isOpen={showMultiRegionEditModal}
                                                                                toggle={cancelMultiRectangleEditing}
                                                                                centered>
                                                                                <ModalHeader toggle={cancelMultiRectangleEditing}>✏️ Edit Region Name</ModalHeader>
                                                                                <ModalBody>
                                                                                    <Input
                                                                                        value={multiEditingRectangleName}
                                                                                        onChange={handleMultiRectangleNameChange}
                                                                                        placeholder="Enter new region name"
                                                                                    />
                                                                                </ModalBody>
                                                                                <ModalFooter>
                                                                                    <Button color="primary" onClick={saveMultiRectangleName}>Save</Button>
                                                                                    <Button color="secondary" onClick={cancelMultiRectangleEditing}>Cancel</Button>
                                                                                </ModalFooter>
                                                                            </Modal>


                                                                            {/* Trash Button */}
                                                                            <Button
                                                                                color="danger"
                                                                                size="sm"
                                                                                title='Delete'
                                                                                onClick={() => deleteMultiCameraRegion(activeCameraIndex, index, region)}
                                                                            >
                                                                                <i className="bx bx-trash"></i>
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center text-muted py-4">
                                                        <i className="bx bx-shape-square" style={{ fontSize: '48px' }}></i>
                                                        <p className="mt-2">No regions created yet</p>
                                                        <p className="small">Click &quot;Create Region&quot; to start drawing regions on the camera feed</p>
                                                    </div>
                                                )}
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row>
                            )}
                        </CardBody>
                    </Card>
                </ModalBody>
                {/* <div className="modal-footer">
                    <Button
                        color="secondary"
                        // onClick={() => setShowMultiCameraRegion(false)}
                        onClick={handleMultiCameraClose}

                    >
                        Close
                    </Button>
                    <Button
                        color="primary"
                        onClick={() => {
                            // Save regions logic here
                            setShowMultiCameraRegion(false);
                            Swal.fire({
                                icon: 'success',
                                title: 'Regions Saved!',
                                text: 'Multi-camera regions have been saved successfully.',
                                timer: 2000,
                                showConfirmButton: false
                            });
                        }}
                    >
                        Save Regions
                    </Button>
                </div> */}
            </Modal>
        </>
    );
};
// // PropTypes
// stageManageModel.propTypes = {
//   history: PropTypes.object,
// };

export default stageManageModel;

// Add CSS styles for multi-camera outline interface
const styles = `
.camera-disconnected-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.camera-preview-container {
    border: 2px solid #e9ecef;
    border-radius: 8px;
    overflow: hidden;
    background: #f8f9fa;
}

.camera-tabs .btn {
    margin-right: 8px;
    margin-bottom: 8px;
}

.outline-controls {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid #e9ecef;
}

.existing-outline {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid #e9ecef;
}

.camera-status-list .border-bottom:last-child {
    border-bottom: none !important;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

