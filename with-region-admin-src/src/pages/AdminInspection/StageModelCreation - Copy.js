import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useHistory } from "react-router-dom";
import PropTypes from "prop-types";
import MetaTags from 'react-meta-tags';
import {
    Container, CardTitle, Button, Table, Label, Row, Col,
    CardBody, Modal, Card, Progress, Nav, NavItem, NavLink,
    TabContent, TabPane, Spinner, ModalBody, CardText,
    FormGroup,
    Input,
    UncontrolledTooltip
} from 'reactstrap';
import Webcam from "react-webcam";

import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';
import { Popconfirm, Image, Slider, Tooltip, Spin } from 'antd';
import { DeleteTwoTone, CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons';
import moment from 'moment';
import Swal from 'sweetalert2';
import { Draggable, Droppable } from 'react-drag-and-drop'
import { JsonTable } from 'react-json-to-html';
import classnames from "classnames"
import { Checkbox } from 'antd';
import { Multiselect } from "multiselect-react-dropdown";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

import Breadcrumbs from "components/Common/Breadcrumb";
import TrainImages from './adminComponent/TrainImages';

import "./Css/style.css"
import AdminTestingOptions from './RegionFunctions/AdminTestingOptions';
import { DEFAULT_RESOLUTION } from './cameraConfig';
import WebcamCapture from 'pages/WebcamCustom/WebcamCapture';

import urlSocket from "./urlSocket"
import { image_url, remote_img_url } from './imageUrl';

// import image_url from './imageUrl';

let ImageUrl = image_url;
let RemoteImageUrl = remote_img_url;
console.log('ImageUrlImageUrl', ImageUrl)
let okCount1;
let notokCount1;

const StageModelCreation = () => {
    const history = useHistory();

    // Basic Component Information
    const [compName, setCompName] = useState('');
    const [compCode, setCompCode] = useState('');
    const [modelName, setModelName] = useState('');
    const [position, setPosition] = useState('');
    const [type, setType] = useState('');
    const [selectedCamera, setSelectedCamera] = useState(null);

    // Model Version and Configuration
    const [compModelVerInfo, setCompModelVerInfo] = useState([]);
    const [config, setConfig] = useState([]);
    const [versionCount, setVersionCount] = useState(1);
    const [modelVersionLoading, setModelVersionLoading] = useState(true);

    // UI Labels and Controls
    const [positive, setPositive] = useState('');
    const [negative, setNegative] = useState('');
    const [selectFilter, setSelectFilter] = useState(null);
    const [tabFilter, setTabFilter] = useState(null);
    const [showOkButton, setShowOkButton] = useState(false);
    const [showNotokButton, setShowNotokButton] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [showLabelName, setShowLabelName] = useState('');
    const [reqImgCount, setReqImgCount] = useState(null);
    const [labelName, setLabelName] = useState('');

    // Camera and Webcam States
    const [webcamEnabled, setWebcamEnabled] = useState(false);
    const [imageSrcNone, setImageSrcNone] = useState(false);
    const [cameraDisconnected, setCameraDisconnected] = useState(false);
    const [webcamLoaded, setWebcamLoaded] = useState(false);

    // Training and Process States
    const [showTrainingINProgs, setShowTrainingINProgs] = useState(false);
    const [showRetrain, setShowRetrain] = useState(false);
    const [addAccTestInProg, setAddAccTestInProg] = useState(false);
    const [addingImage, setAddingImage] = useState(false);
    const [addingTrainImage, setAddingTrainImage] = useState(false);
    const [showTrainImage, setShowTrainImage] = useState(false);

    // UI Control States
    const [refersh, setRefersh] = useState(false);
    const [initvalue, setInitvalue] = useState(1);
    const [activeTab, setActiveTab] = useState('1');
    const [customActiveTab, setCustomActiveTab] = useState('');

    // Modal States
    const [modalXlarge, setModalXlarge] = useState(false);
    const [modalXlarge1, setModalXlarge1] = useState(false);
    const [showTestingOptions, setShowTestingOptions] = useState(false);

    // Image and Gallery States
    const [imagesLength, setImagesLength] = useState(0);
    const [selectedImages, setSelectedImages] = useState([]);
    const [imgPaths, setImgPaths] = useState([]);
    const [imgGlr, setImgGlr] = useState([]);
    const [newGallery, setNewGallery] = useState(false);
    const [checkedValues, setCheckedValues] = useState([]);
    const [selectedList, setSelectedList] = useState([]);
    const [hidVer, setHidVer] = useState([]);
    const [selectedCheckBox, setSelectedCheckBox] = useState([]);
    const [uniqueModelVersions, setUniqueModelVersions] = useState([]);
    const [groupedData, setGroupedData] = useState({});
    const [activeGroupData, setActiveGroupData] = useState({});

    // Response and Log States
    const [responseMessage, setResponseMessage] = useState('');
    const [logData, setLogData] = useState([]);
    const [selected, setSelected] = useState([]);

    // Image Processing States
    const [rangeValue, setRangeValue] = useState(0.9);
    const [imgRotation, setImgRotation] = useState(false);
    const [noOfRotation, setNoOfRotation] = useState(0);

    // Outline and Display States
    const [outlineThres, setOutlineThres] = useState(100);
    const [showOutline, setShowOutline] = useState(false);
    const [captureFixedRefimage, setCaptureFixedRefimage] = useState(false);
    const [defaultOutline, setDefaultOutline] = useState('White Outline');
    const [outlinePath, setOutlinePath] = useState('');
    const [compInfo, setCompInfo] = useState({});
    const [stageInfo, setStageInfo] = useState({});

    // Region Selection States
    // const [regionSelection, setRegionSelection] = useState(false);
    const [regionSelection, setRegionSelection] = useState([]); // array instead of single value

    const [imageSrc, setImageSrc] = useState(null);



    const [selectedVersion, setSelectedVersion] = useState(null);
    const [array, setArray] = useState([]);

    const [zoomValue, setZoomValue] = useState({
        zoom: 1,
        center: { x: 0.5, y: 0.5 }
    });

    // Sharing and Navigation States
    const [isSharing, setIsSharing] = useState(false);
    const [hasPushedState, setHasPushedState] = useState(false);
    const [cameraList, setCameraList] = useState([]);
    const [pysclCameraList, setPysclCameraList] = useState([]);
    // State management
    const [connectedCameras, setConnectedCameras] = useState([]);
    const [defaultCamOrder, setDefaultCamOrder] = useState([]);
    const [modelInfo, setModelInfo] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newAvailableCameras, setNewAvailableCameras] = useState([]);
    const [selectedCameraLabel, setSelectedCameraLabel] = useState(null);
    const [showCameraSelector, setShowCameraSelector] = useState(false);

    const [showRemoteAccess, setShowRemoteAccess] = useState(false);
    const [maxCount, setMaxCount] = useState("");
    const [capturing, setCapturing] = useState(false);
    const [remoteGallery, setRemoteGallery] = useState({});
    const [cameraCaptureCounts, setCameraCaptureCounts] = useState({});
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectionMode, setSelectionMode] = useState(null); // 'admin_test' or 'training' or null




    // Constants
    const outlineOptions = [
        { label: "White Outline" },
        { label: "Red Outline" },
        { label: "Green Outline" },
        { label: "Blue Outline" },
        { label: "Black Outline" },
        { label: "Orange Outline" },
        { label: "Yellow Outline" },
    ];

    const outlineColors = [
        "White Outline",
        "Blue Outline",
        "Black Outline",
        "Orange Outline",
        "Yellow Outline",
    ];

    const testingOptions = [
        { 'option': 0, 'value': 'Entire Component' },
        { 'option': 1, 'value': 'Regions Only' },
        { 'option': 2, 'value': 'Entire Component with Regions' }
    ];

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
    const webcamRefs = useRef([]);

    const timerRef = useRef(null);
    const trainingStatusIntervalRef = useRef(null);
    const prevMaxCount = useRef("");





    useEffect(() => {
        debugImageData();
    }, [activeGroupData, labelName, selectedCameraLabel]);
    // Initialize component
    useEffect(() => {
        const initializeComponent = async () => {
            try {
                const compModelInfo = JSON.parse(sessionStorage.getItem("compModelData"));
                const data = JSON.parse(sessionStorage.getItem("compModelVInfo"));
                console.log("data", data);

                // ✅ unwrap first array
                // Unwrap and flatten ALL arrays
                const compModelVerList = Array.isArray(data?.compModel)
                    ? data.compModel.flat()   // merges nested arrays
                    : [data?.compModel];

                console.log("compModelVerList", compModelVerList);

                if (compModelVerList) {
                    const default_thres = rangeValue;
                    const myArray = Array.isArray(compModelVerList)
                        ? compModelVerList
                        : [compModelVerList];
                    console.log('myArray', myArray)

                    setCompModelVerInfo(myArray);
                    setRefersh(true);

                    if (compModelVerList.thres === undefined) {
                        setRangeValue(default_thres);
                    } else {
                        setRangeValue(compModelVerList.thres);
                    }

                    if (compModelVerList.training_status === "training_in_progress") {
                        setShowTrainingINProgs(true);
                    } else if (
                        compModelVerList.training_status ===
                        "admin accuracy testing in_progress"
                    ) {
                        setAddAccTestInProg(true);
                        fetchTrainingStatus(myArray[0]);
                    } else if (compModelVerList.training_status === "retrain") {
                        setShowRetrain(true);
                    }

                    if (
                        compModelVerList.training_status === "training_in_progress" ||
                        compModelVerList.training_status === "retrain"
                    ) {
                        trainingStatusIntervalRef.current = setInterval(
                            () => fetchTrainingStatus(myArray[0]),
                            5000
                        );
                    }

                    setArray(myArray[0]);
                    imgGlry(myArray[0]);
                }

                // ✅ Build camera set
                const compModelVInfo = data.versionInfo;
                const modeldata = data?.compModel

                console.log('compModelcompModelVInfoVInfo', compModelVInfo, modeldata)
                let cameras = [];
                if (Array.isArray(compModelVerList) && compModelVerList.length > 1) {
                    console.log('first')
                    cameras = compModelVerList
                        .map(item => item.camera)
                        .filter(cam => cam?.checked === true);
                } else if (compModelVerList[0].camera) {
                    console.log('firstsecond')
                    cameras = [compModelVerList[0].camera]
                    // cameras = compModelVerList
                    //     .map(item => item.camera)
                }


                console.log("cameras", cameras);

                // if (!selectedCameraLabel && cameras.length > 0) {
                //     setSelectedCameraLabel(cameras[0].originalLabel);
                // }

                setCameraList(cameras);

                // rest of your existing code...
                const versionCountData = data.versionCount;
                setModelInfo(compModelInfo);
                setCompName(compModelInfo.stage_name);
                setCompCode(compModelInfo.stage_code);
                setModelName(compModelInfo.model_name);
                setPosition(compModelInfo.position);
                setType(compModelInfo.type);
                setRefersh(true);
                setVersionCount(versionCountData);

                await getModelCreation(compModelVInfo);
                await getConfigInfo(compModelVInfo?.result_mode);
                await showRefOutline(compModelInfo, compModelVInfo);

                navigator.mediaDevices.addEventListener("devicechange", checkWebcam);
                await checkWebcam();
                window.history.pushState(null, "", window.location.href);
                window.addEventListener("popstate", blockBackNavigation);
            } catch (error) {
                console.error("/didmount ", error);
            } finally {
                setModelVersionLoading(false);
            }
        };

        initializeComponent();

        return () => {
            if (trainingStatusIntervalRef.current) {
                clearInterval(trainingStatusIntervalRef.current);
            }
            navigator.mediaDevices.removeEventListener("devicechange", checkWebcam);
            window.removeEventListener("popstate", blockBackNavigation);
        };
    }, []);

    useEffect(() => {
        if (cameraList && cameraList.length > 0) {
            switchCamera(cameraList[0]);
        }
    }, [cameraList]);
    // Close camera selector when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showCameraSelector && !event.target.closest('.camera-selector-container')) {
                setShowCameraSelector(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showCameraSelector]);



    useEffect(() => {
        if (customActiveTab === "remote" && compModelVerInfo[0]?._id) {
            loadRemoteGallery();
        }
    }, [customActiveTab, compModelVerInfo, selectedCameraLabel]);



    //REMOTE ACCESS 
    const loadRemoteGallery = async () => {
        const galleryData = await fetchRemoteAccessGallery(
            compModelVerInfo[0]?._id,
            selectedCameraLabel
        );
        console.log('galleryData :>> ', galleryData);
        setRemoteGallery(galleryData || {});
    };




    useEffect(() => {
        console.log("remoteGallery changed:", remoteGallery);
        const counts = {};
        Object.entries(remoteGallery).forEach(([cameraKey, imgs]) => {
            counts[cameraKey] = imgs.length;
        });
        setCameraCaptureCounts(counts);
    }, [remoteGallery]);


    //Similarity changes useEffect
    // Initialize selected camera to the first one in the list
    // Initialize selected camera
    useEffect(() => {
        if (cameraList && cameraList.length > 0) {
            switchCamera(cameraList[0]);
        }
    }, [cameraList]);



    //REMOTE GALLERY FETCH 10 SEP 2025
    const fetchRemoteAccessGallery = async (compModelVerId) => {
        if (!compModelVerId) return {};

        try {
            const response = await urlSocket.post("/remoteAccessImages", { _id: compModelVerId });

            console.log('response 655:>> ', response);

            if (response.data.error) {
                console.error("Remote Access Gallery Error:", response.data.error);
                return {};
            }

            return response.data; // ✅ grouped by camera_label
        } catch (err) {
            console.error("Remote Access Gallery Fetch Error:", err);
            return {};
        }
    };

    const showRefOutline = async (compArray) => {
        try {
            const response = await urlSocket.post(
                '/api/stage/check_outline_stgchk',
                compArray, // send array directly
                { mode: 'no-cors' }
            );

            const results = response.data.data;
            console.log("results", results);

            results.forEach((getInfo) => {
                if (getInfo.show === 'yes') {
                    setShowOutline(true);
                    setCompInfo(getInfo.stage_info);
                    setStageInfo(getInfo.stage_info);

                    const stageInfo = getInfo.stage_info;
                    const cameraSelection = stageInfo.camera_selection || {};

                    if (cameraSelection.mode === 'single') {
                        setOutlinePath(stageInfo.datasets.white_path);
                    } else if (cameraSelection.mode === 'multi') {
                        setOutlinePath(stageInfo.datasets);
                    }
                } else if (getInfo.show === 'no') {
                    setCaptureFixedRefimage(true);
                }
            });
        } catch (error) {
            console.error(error);
        }
    };


    const handleWebcamLoad = () => {
        setWebcamLoaded(true);
    };

    const toggleShowOutline = () => {
        setShowOutline(prev => !prev);
    };

    const getCurrentOutlinePath = (cameraOriginalLabel) => {
        if (!outlinePath) {
            console.log("No outline path available");
            return null;
        }

        // Single camera mode: outlinePath is a string
        if (typeof outlinePath === "string") {
            return outlinePath;
        }

        // Multi-camera mode: outlinePath is an object keyed by camera labels
        if (typeof outlinePath === "object" && cameraOriginalLabel) {
            const selectedCamera = cameraList.find(
                (cam) => cam.originalLabel === cameraOriginalLabel
            );

            if (selectedCamera) {
                const possibleKeys = [
                    selectedCamera.label.trim().toLowerCase().replace(/\s+/g, "_"),
                    selectedCamera.label.trim().toLowerCase().replace(/\s+/g, "_").replace(/#/g, "_"),
                    selectedCamera.originalLabel.trim().toLowerCase().replace(/\s+/g, "_"),
                    selectedCamera.originalLabel.trim().toLowerCase().replace(/\s+/g, "_").replace(/#/g, "_"),
                ];

                for (const key of possibleKeys) {
                    if (outlinePath[key]) {
                        // If multiple color options exist
                        if (typeof outlinePath[key] === "object") {
                            switch (defaultOutline) {
                                case "White Outline": return outlinePath[key].white_path;
                                case "Red Outline": return outlinePath[key].red_path;
                                case "Green Outline": return outlinePath[key].green_path;
                                case "Blue Outline": return outlinePath[key].blue_path;
                                case "Black Outline": return outlinePath[key].black_path;
                                case "Orange Outline": return outlinePath[key].orange_path;
                                case "Yellow Outline": return outlinePath[key].yellow_path;
                                default: return outlinePath[key].white_path;
                            }
                        } else {
                            return outlinePath[key]; // single outline path
                        }
                    }
                }
            }
        }

        console.log("No valid outline path found for", cameraOriginalLabel);
        return null;
    };



    const getModelCreation = async (compModelVInfoArray) => {
        try {
            const response = await urlSocket.post(
                '/api/stage/getCompModel_ver_info_stg',
                { compModelInfo: compModelVInfoArray },
                { mode: 'no-cors' }
            );

            console.log('response', response);

            // Backend already returns array of objects in desired format
            setRegionSelection(response.data.data);
        } catch (error) {
            console.log('error', error);
        }
    };



    const imgGlry = async (compModelVInfo, cameraOriginalLabel, modelVer) => {
        if (!compModelVInfo) return;

        // Normalize cameraLabel
        // const selectedCameraName = cameraLabelParam?.replace(/\s+/g, "_");

        try {
            const response = await urlSocket.post(
                "/modelImages_stg",
                {
                    compModelInfo: compModelVInfo,   // 🔑 dynamic per camera
                    cameraOriginalLabel,
                    modelVer         // 🔑 passed explicitly
                },
                { mode: "no-cors" }
            );
            console.log("response", response);
            console.log("compModelVInfo", compModelVInfo, cameraOriginalLabel, modelVer);

            if (response.data.error === "Tenant not found") {
                errorHandler(response.data.error);
            } else {
                const compModelVerInfoData = response.data;

                const allModelVersions = compModelVerInfoData.flatMap(
                    (item) => item.used_model_ver
                );
                const uniqueModelVersionsData = [
                    ...new Set(allModelVersions),
                ].sort();

                const groupedDataResult = compModelVerInfoData.reduce(
                    (acc, item) => {
                        item.used_model_ver.forEach((version) => {
                            if (!acc[version]) acc[version] = [];
                            acc[version].push(item);
                        });
                        return acc;
                    },
                    {}
                );
                console.log('groupedDataResult', groupedDataResult)

                setImgGlr(compModelVerInfoData);
                setUniqueModelVersions(uniqueModelVersionsData);
                setGroupedData(groupedDataResult);
                setActiveGroupData(groupedDataResult);
            }
        } catch (error) {
            console.log("error", error);
        }
    };


    // const handleSelectRow = (id, rowData) => {
    //     setSelectedRows((prev) => {
    //         if (prev.some((item) => item._id === id)) {
    //             return prev.filter((item) => item._id !== id);
    //         } else {
    //             return [...prev, rowData];
    //         }
    //     });
    // };


    // Helper function to determine row type based on your existing logic
    const getRowType = (data) => {
        const isAdminAccuracyInProgress = data.training_status === 'admin accuracy testing in_progress';
        const isTrainingCompleted = data.training_status === 'training completed';
        const allCamerasTrained = data.camera_training_status &&
            data.camera_training_status.length > 0 &&
            data.camera_training_status.every(
                (cam) => cam.result === 'training completed' && cam.training_status === 'completed'
            );

        // This is an admin test row if it has "Start Admin Accuracy Test" button or is in admin testing
        if (isAdminAccuracyInProgress || (allCamerasTrained && data.type !== 'ML')) {
            return 'admin_test';
        }

        // This is a training row if it has "Train" button or is in training states
        const isTrainingNotStarted = data.training_status === 'training_not_started';
        const isTrainingInProgress = data.training_status === 'training_in_progress';
        const isTrainingQueued = data.training_status === 'training_queued';

        if (isTrainingNotStarted || isTrainingInProgress || isTrainingQueued) {
            return 'training';
        }

        return 'other'; // For inactive, live, etc.
    };

    // Modified handleSelectRow
    const handleSelectRow = (id, rowData) => {
        const rowType = getRowType(rowData);

        setSelectedRows((prev) => {
            const isCurrentlySelected = prev.some((item) => item._id === id);

            if (isCurrentlySelected) {
                // Deselecting - remove from selection
                const newSelection = prev.filter((item) => item._id !== id);

                // If no items left, reset selection mode
                if (newSelection.length === 0) {
                    setSelectionMode(null);
                }

                return newSelection;
            } else {
                // Selecting new item
                if (prev.length === 0) {
                    // First selection - set the mode
                    if (rowType === 'admin_test' || rowType === 'training') {
                        setSelectionMode(rowType);
                    }
                    return [...prev, rowData];
                } else {
                    // Additional selections - only allow same type
                    if (selectionMode === rowType) {
                        return [...prev, rowData];
                    }
                    // If different type, don't add (this shouldn't happen if checkbox is disabled)
                    return prev;
                }
            }
        });
    };

    // Function to check if checkbox should be disabled
    const isCheckboxDisabled = (data) => {
        if (!selectionMode) return false; // No selection mode, all enabled

        const rowType = getRowType(data);

        // Disable if the row type doesn't match the current selection mode
        return rowType !== selectionMode;
    };


    // Handle training button click
    const handleTrainSelected = () => {
        console.log("Training selected rows: ", selectedRows);
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger'
            },
            buttonsStyling: false
        });

        swalWithBootstrapButtons.fire({
            title: 'Start Training?',
            text: "Training this version may take some time to complete. Please ensure that you have provided all necessary inputs before proceeding.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Continue',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        }).then(async (result) => {
            if (result.isConfirmed) {

                const updatedCompModelVerInfo = [...compModelVerInfo];
                // updatedCompModelVerInfo[0].training_status_id = 0;
                // updatedCompModelVerInfo[0].training_start_time = '00:00:00';
                updatedCompModelVerInfo.forEach((item, idx) => {
                    item.training_status_id = 0;
                    item.training_start_time = '00:00:00';
                });
                setCompModelVerInfo(updatedCompModelVerInfo);
                setRefersh(true);
                setShowTrainingINProgs(true);

                trainingStatusIntervalRef.current = setInterval(() => fetchTrainingStatus(selectedRows), 5000);

                try {
                    const response = await urlSocket.post('/api/stage/Train_stg', {
                        compModelVerInfo: selectedRows,
                        config: config
                    }, { mode: 'no-cors' });
                    if (response.data.error === "Tenant not found") {
                        console.log("data error", response.data.error);
                        // setShowTrainingINProgs(false)
                        clearInterval(trainingStatusIntervalRef.current);
                        errorHandler(response.data.error);
                    }

                    swalWithBootstrapButtons.fire(
                        'Training Started',
                        'Please wait while the training process completes.',
                        'success'
                    );

                } catch (error) {
                    console.log('Error starting training:', error);
                    clearInterval(trainingStatusIntervalRef.current);
                    // setShowTrainingINProgs(false)
                    swalWithBootstrapButtons.fire(
                        'Error',
                        'Failed to start training. Please try again later.',
                        'error'
                    );
                }
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire(
                    'Training Canceled',
                    `You can start the training anytime when you're ready.`,
                    'error'
                );
            }
        });


    };



    const getConfigInfo = async (result_mode) => {
        try {
            const response = await urlSocket.post('/config', { mode: 'no-cors' });
            const configData = response.data;
            if (configData.error === "Tenant not found") {
                console.log("data error", configData.error);
                errorHandler(configData.error);
            }
            else {
                setConfig(configData);
                setPositive(configData[0].positive);
                setNegative(configData[0].negative);

                if (result_mode !== "ng") {
                    getOK(configData[0].positive, 0, '1');
                } else {
                    getNotok(configData[0].negative, 1, '2');
                }
            }
        } catch (error) {
            console.log('error', error);
        }
    };

    const getOK = (ok, tabFilterVal, tab) => {
        let reqImgCountVal = config[0]?.min_ok_for_training || 0;
        setTabFilter(tabFilterVal);
        setShowOkButton(true);
        setShowNotokButton(false);
        setShowCamera(false);
        setShowGallery(false);
        setShowLabelName(ok);
        setReqImgCount(reqImgCountVal);
        setActiveTab(tab);
        setCustomActiveTab('');
    };

    const getNotok = (notok, tabFilterVal, tab) => {
        let reqImgCountVal = config[0]?.min_notok_for_training || 0;
        setTabFilter(tabFilterVal);
        setShowNotokButton(true);
        setShowOkButton(false);
        setShowCamera(false);
        setShowGallery(false);
        setShowLabelName(notok);
        setReqImgCount(reqImgCountVal);
        setActiveTab(tab);
        setCustomActiveTab('');
    };

    const getImgGalleryInfo = (selectFilterVal, lable_name_val, tab) => {
        let img_length = imagesLengthCalc(activeGroupData, compModelVerInfo[0].model_ver, lable_name_val);

        setSelectFilter(selectFilterVal);
        setShowCamera(false);
        setShowGallery(true);
        setLabelName(lable_name_val);
        setCustomActiveTab(tab);
        setImagesLength(img_length);
        setSelectedList([]);
        setSelectedImages([]);
        setImgPaths([]);

        imgGlry();
    };

    const getRemoteAccess = () => {
        setActiveTab('');
        setCustomActiveTab('remote');
        setShowCamera(true);
        setShowGallery(false);

        setImagesLength(0);
        setImageSrcNone(false);
        setSelectedList([]);
        setSelectedImages([]);
        setImgPaths([]);

        setShowRemoteAccess(true);
        setWebcamEnabled(true);
        setMaxCount(0)
    };

    // Fix 3: Update the startLiveCamera function to prevent unnecessary imgGlry calls
    // const startLiveCamera = (selectFilterVal, lable_name_val, tab) => {
    //     let img_length = imagesLengthCalc(activeGroupData, compModelVerInfo[0].model_ver, lable_name_val);

    //     setSelectFilter(selectFilterVal);
    //     setShowCamera(true);
    //     setShowGallery(false);
    //     setLabelName(lable_name_val);
    //     setCustomActiveTab(tab);
    //     setImagesLength(img_length);
    //     setImageSrcNone(false);
    //     setSelectedList([]);
    //     setSelectedImages([]);
    //     setImgPaths([]);

    //     // Only call imgGlry if we don't have data or the camera has changed
    //     if (!imgGlr || imgGlr.length === 0 || !activeGroupData || Object.keys(activeGroupData).length === 0) {
    //         imgGlry(array);
    //     }

    //     // Simulate slow enable process for demonstration
    //     setTimeout(() => {
    //         setWebcamEnabled(true);
    //     }, 1000);
    // };

    const startLiveCamera = (selectFilterVal, lable_name_val, tab) => {
        // find current camera
        let selectedCamera = null;
        if (selectedCameraLabel) {
            const [label, ver] = selectedCameraLabel.split("_");
            selectedCamera = compModelVerInfo.find(
                (doc) =>
                    doc.camera.label.trim().toLowerCase() === label.trim().toLowerCase() &&
                    String(doc.camera.model_ver) === String(ver)
            );
        }

        // fallback: first camera if nothing is selected
        const modelVer = selectedCamera ? selectedCamera.camera.model_ver : compModelVerInfo[0]?.camera.model_ver;

        let img_length = imagesLengthCalc(activeGroupData, modelVer, lable_name_val);

        setSelectFilter(selectFilterVal);
        setShowCamera(true);
        setShowGallery(false);
        setLabelName(lable_name_val);
        setCustomActiveTab(tab);
        setImagesLength(img_length);
        setImageSrcNone(false);
        setSelectedList([]);
        setSelectedImages([]);
        setImgPaths([]);

        if (!imgGlr || imgGlr.length === 0 || !activeGroupData || Object.keys(activeGroupData).length === 0) {
            imgGlry(array);
        }

        setTimeout(() => {
            setWebcamEnabled(true);
        }, 1000);
    };



    const captureImage = async (labelNameVal) => {
        console.log("labelNameVal", labelNameVal);
        if (isNaN(noOfRotation)) {
            Swal.fire({
                icon: "info",
                title: "No. of rotations required",
                confirmButtonText: "OK",
            }).then((result) => {
                if (result.isConfirmed) setNoOfRotation(0);
            });
            return;
        }

        setAddingImage(true);

        try {



            for (let i = 0; i < cameraList.length; i++) {
                const cam = cameraList[i];
                const webcamInstance = webcamRefs.current[cam.originalLabel]; // use single ref

                if (!webcamInstance) {
                    console.warn(`Webcam not ready for ${cam.originalLabel}, skipping...`);
                    continue;
                }

                const imageSrcData = await webcamInstance.captureZoomedImage();
                if (!imageSrcData) continue;

                const selectedCameraName = cam.label.replace(/\s+/g, "_");

                // Find the matching model version info
                const camInfo = compModelVerInfo.find(
                    (info) =>
                        info.camera.originalLabel === cam.originalLabel &&
                        info.model_ver === cam.model_ver
                );

                if (!camInfo) continue;

                const blob = dataURLtoBlob(imageSrcData);
                const formData = new FormData();
                const imgUuid = uuidv4();

                formData.append("_id", camInfo._id);
                formData.append("labelName", labelNameVal);
                formData.append("image_rotation", noOfRotation);
                formData.append("imgName", blob, imgUuid + ".png");
                formData.append("camera_originalLabel", cam.originalLabel);
                formData.append("camera_label", selectedCameraName);
                formData.append("model_ver", cam.model_ver);

                const response = await urlSocket.post("/api/stage/addImage_stg", formData, {
                    headers: { "content-type": "multipart/form-data" },
                    mode: "no-cors",
                });

                const getInfo = response.data;
                if (getInfo.error) {
                    errorHandler(getInfo.error);
                } else {
                    setResponseMessage(getInfo.message);
                    // await imgGlry(compModelVerInfo[0]);
                    await imgGlry(camInfo); // 👈 pass the correct item instead of always [0]
                    // await imgGlry(camInfo, selectedCameraName);
                    if (getInfo.message === "Image successfully added") {
                        console.log("getInfo", getInfo);
                        setCompModelVerInfo(getInfo.comp_model_ver_info_list);
                        setRefersh(true);
                        setImagesLength(getInfo.img_count);

                    }
                }
            }


            setAddingImage(false);
            setTimeout(() => setResponseMessage(""), 1000);
        } catch (error) {
            console.error("error", error);
            setAddingImage(false);
        }
    };



    const totalAddedImages = useMemo(() => {
        return Object.values(remoteGallery).reduce(
            (sum, imgs) => sum + (imgs?.length || 0),
            0
        );
    }, [remoteGallery]);



    // const startRemoteCapture = async () => {
    //     console.log("first startRemoteCapture called");
    //     if (capturing) return;

    //     const max = maxCount ?? 0;
    //     const isUnlimited = !max || max <= 0;

    //     let tempCounts = {};
    //     if (prevMaxCount.current !== max) {
    //         cameraList.forEach(cam => {
    //             tempCounts[cam.label] = 0;
    //         });
    //         prevMaxCount.current = max;
    //         setCameraCaptureCounts(tempCounts); // reset state
    //     } else {
    //         tempCounts = { ...cameraCaptureCounts };
    //     }

    //     setCapturing(true);
    //     setShowCamera(true);

    //     try {
    //         const successfulCameras = [];
    //         let allReachedLimit = true;

    //         for (let i = 0; i < cameraList.length; i++) {
    //             const cam = cameraList[i];
    //             const webcamInstance = webcamRefs.current[i];
    //             console.log('webcamInstance', webcamInstance)
    //             if (!webcamInstance) continue;

    //             const currentCount = tempCounts[cam.label] || 0;

    //             if (!isUnlimited && currentCount >= max) continue;

    //             allReachedLimit = false;

    //             // Capture image
    //             const imageSrcData = webcamInstance.captureZoomedImage();
    //             console.log('imageSrcData', imageSrcData)
    //             if (!imageSrcData) continue;

    //             const selectedCameraName = cam.label?.replace(/\s+/g, "_");
    //             const blob = dataURLtoBlob(imageSrcData);
    //             const fileName = uuidv4() + ".png";

    //             const imgObj = new window.Image();
    //             imgObj.src = imageSrcData;
    //             await new Promise(resolve => { imgObj.onload = resolve; });
    //             const width = imgObj.naturalWidth;
    //             const height = imgObj.naturalHeight;

    //             const cameraDoc = compModelVerInfo.find(doc => doc.camera.label === cam.label);
    //             if (!cameraDoc) continue;

    //             const formData = new FormData();
    //             formData.append("camera_label", cam.label);
    //             formData.append("imgName", blob, fileName);
    //             formData.append("comp_id", cameraDoc.comp_id);
    //             formData.append("stage_id", cameraDoc.stage_id);
    //             formData.append("model_id", cameraDoc.model_id);
    //             formData.append("width", width);
    //             formData.append("height", height);

    //             const response = await urlSocket.post("/remoteCapture", formData, {
    //                 headers: { Accept: "application/json" },
    //             });
    //             console.log('responresponseresponseresponsese', response)

    //             if (!response.data?.error) {
    //                 successfulCameras.push(cam.label);

    //                 // Update gallery
    //                 setRemoteGallery(prev => {
    //                     const camGallery = prev[selectedCameraName] || [];
    //                     const newImage = {
    //                         filename: fileName,
    //                         local_path: response.data.local_path,
    //                         date: new Date().toISOString(),
    //                         camera_label: cam.label || "Unknown",
    //                         width,
    //                         height,
    //                     };
    //                     return { ...prev, [selectedCameraName]: [newImage, ...camGallery] };
    //                 });

    //                 // Increment count
    //                 tempCounts[cam.label] = currentCount + 1;
    //             }
    //         }

    //         // Update counts state after capture
    //         setCameraCaptureCounts(tempCounts);

    //         if (successfulCameras.length > 0) {
    //             Swal.fire({
    //                 icon: "success",
    //                 title: "Images Added",
    //                 text: `Images successfully added to: ${successfulCameras.join(", ")}`,
    //                 timer: 2500,
    //                 showConfirmButton: false,
    //             });
    //         }

    //         if (!isUnlimited && allReachedLimit) {
    //             Swal.fire({
    //                 icon: "warning",
    //                 title: "Limit Reached",
    //                 text: `Each camera has reached the maximum count of ${max} images.`,
    //             });

    //             // Reset input box after reaching limit
    //             setMaxCount("");
    //             prevMaxCount.current = 0;
    //         }
    //     } catch (err) {
    //         console.error("Remote capture error:", err);
    //     }

    //     setCapturing(false);
    // };



    const startRemoteCapture = async () => {
        console.log("first startRemoteCapture called");
        if (capturing) return;

        const max = maxCount ?? 0;
        const isUnlimited = !max || max <= 0;

        let tempCounts = {};
        if (prevMaxCount.current !== max) {
            cameraList.forEach(cam => {
                tempCounts[cam.label] = 0;
            });
            prevMaxCount.current = max;
            setCameraCaptureCounts(tempCounts); // reset state
        } else {
            tempCounts = { ...cameraCaptureCounts };
        }

        setCapturing(true);
        setShowCamera(true);

        try {
            const successfulCameras = [];
            let allReachedLimit = true;

            for (let i = 0; i < cameraList.length; i++) {
                const cam = cameraList[i];

                const refKey = `${cam.originalLabel}_${cam.model_ver}`;
                // const webcamInstance = webcamRefs.current[refKey];
                const webcamInstance = webcamRefs.current[cam.originalLabel];
                console.log("webcamInstance", refKey, webcamInstance);

                if (!webcamInstance) continue;

                const currentCount = tempCounts[cam.label] || 0;
                if (!isUnlimited && currentCount >= max) continue;

                allReachedLimit = false;

                // ✅ Await the capture if it's async
                const imageSrcData = await webcamInstance.captureZoomedImage();
                if (!imageSrcData) continue;

                const selectedCameraName = cam.label?.replace(/\s+/g, "_");
                const blob = dataURLtoBlob(imageSrcData);
                const fileName = uuidv4() + ".png";

                // ✅ Load image to get dimensions
                const imgObj = new window.Image();
                imgObj.src = imageSrcData;
                await new Promise(resolve => {
                    imgObj.onload = resolve;
                    imgObj.onerror = resolve; // prevent hang on error
                });
                const width = imgObj.naturalWidth || 0;
                const height = imgObj.naturalHeight || 0;

                // ✅ Find correct camera doc (match both label + model_ver if needed)
                const cameraDoc = compModelVerInfo.find(
                    doc =>
                        doc.camera.originalLabel === cam.originalLabel &&
                        doc.model_ver === cam.model_ver
                );
                if (!cameraDoc) continue;

                const formData = new FormData();
                formData.append("camera_label", cam.label);
                formData.append("imgName", blob, fileName);
                formData.append("comp_id", cameraDoc.comp_id);
                formData.append("stage_id", cameraDoc.stage_id);
                formData.append("model_id", cameraDoc.model_id);
                formData.append("width", width);
                formData.append("height", height);

                const response = await urlSocket.post("/remoteCapture", formData, {
                    headers: { Accept: "application/json" },
                });
                console.log("remoteCapture response", response);

                if (!response.data?.error) {
                    successfulCameras.push(cam.label);

                    // ✅ Update gallery
                    setRemoteGallery(prev => {
                        const camGallery = prev[selectedCameraName] || [];
                        const newImage = {
                            filename: fileName,
                            local_path: response.data.local_path,
                            date: new Date().toISOString(),
                            camera_label: cam.label || "Unknown",
                            width,
                            height,
                        };
                        return { ...prev, [selectedCameraName]: [newImage, ...camGallery] };
                    });

                    // ✅ Increment count
                    tempCounts[cam.label] = currentCount + 1;
                }
            }

            // ✅ Update counts state after capture
            setCameraCaptureCounts(tempCounts);

            if (successfulCameras.length > 0) {
                Swal.fire({
                    icon: "success",
                    title: "Images Added",
                    text: `Images successfully added to: ${successfulCameras.join(", ")}`,
                    timer: 2500,
                    showConfirmButton: false,
                });
            }

            if (!isUnlimited && allReachedLimit) {
                Swal.fire({
                    icon: "warning",
                    title: "Limit Reached",
                    text: `Each camera has reached the maximum count of ${max} images.`,
                });

                // Reset input box after reaching limit
                setMaxCount("");
                prevMaxCount.current = 0;
            }
        } catch (err) {
            console.error("Remote capture error:", err);
        }

        setCapturing(false);
    };


    const debugImageData = () => {

        // Check if we have images for the current label
        const currentVersionImages = Object.entries(activeGroupData).filter(([version, items]) => {
            return compModelVerInfo[0]?.model_ver === parseInt(version);
        });


        currentVersionImages.forEach(([version, items]) => {
            const labelImages = items.filter(item =>
                item.imagePathType &&
                item.imagePathType[0] &&
                item.imagePathType[0].type === labelName
            );
        });
    };

    const dataURLtoBlob = (dataURL) => {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    };



    // const deleteImageClick = async (data, ver, labelNameVal) => {
    //     try {
    //         let idxVal = data.used_model_ver.indexOf(ver);
    //         let imgName = data.imagePathType[idxVal].image_path;
    //         let fileName = data.filename;
    //         const formData = new FormData();
    //         formData.append('_id', compModelVerInfo[0]._id);
    //         formData.append('model_ver', parseInt(data.org_model_ver));
    //         formData.append('labelName', labelNameVal);
    //         formData.append('fileName', fileName);
    //         formData.append('imgName', imgName);
    //         formData.append('stage_name', compModelVerInfo[0].stage_name);
    //         formData.append('stage_code', compModelVerInfo[0].stage_code);
    //         formData.append('_compId', compModelVerInfo[0].parent_comp_id);
    //         formData.append('model_name', compModelVerInfo[0].model_name);
    //         formData.append('model_id', compModelVerInfo[0].model_id);
    //         formData.append('training_status', compModelVerInfo[0].training_status);
    //         formData.append('model_status', compModelVerInfo[0].model_status);
    //         formData.append('stage_id', compModelVerInfo[0].stage_id);

    //         const response = await urlSocket.post('/delete_image_stg', formData, {
    //             headers: {
    //                 'content-type': 'multipart/form-data'
    //             },
    //             mode: 'no-cors'
    //         });
    //         if (response.data.error === "Tenant not found") {
    //             console.log("data error", response.data.error);
    //             errorHandler(response.data.error);
    //         }
    //         else {
    //             setResponseMessage(response.data.message);
    //             setCompModelVerInfo(response.data.comp_model_ver_info_list);
    //             setImagesLength(response.data.img_count);
    //             setActiveGroupData(prev => {
    //                 const updated = { ...prev };
    //                 Object.keys(updated).forEach(version => {
    //                     updated[version] = updated[version].filter(item => item.filename !== fileName);
    //                 });
    //                 return updated;
    //             });

    //             setSelectedImages(prev => prev.filter(img => img.filename !== fileName));


    //             await imgGlry();

    //             if (selectedList.length !== 0) {
    //                 const updatedImgGlr = imgGlr;
    //                 const filteredGroupedData = selectedList.reduce((acc, itemList) => {
    //                     const version = itemList.value;
    //                     const itemsForVersion = updatedImgGlr.filter(item => item.used_model_ver.includes(version));
    //                     acc[version] = itemsForVersion;
    //                     return acc;
    //                 }, {});

    //                 setGroupedData(filteredGroupedData);
    //             }

    //             setTimeout(() => {
    //                 setResponseMessage("");
    //             }, 1000);
    //         }
    //     } catch (error) {
    //         console.log('error', error);
    //     }
    // };
    const deleteImageClick = async (data, ver, labelNameVal, camera_label, docId) => {
        console.log("formData error", data, ver, labelNameVal, camera_label, docId);
        try {
            let idxVal = data.used_model_ver.indexOf(ver);
            let imgName = data.imagePathType[idxVal].image_path;
            let fileName = data.filename;
            const formData = new FormData();


            formData.append('_id', docId);
            formData.append('model_ver', parseInt(data.org_model_ver));
            formData.append('labelName', labelNameVal);
            formData.append('fileName', fileName);
            formData.append('imgName', imgName);
            formData.append('stage_name', compModelVerInfo[0].stage_name);
            formData.append('stage_code', compModelVerInfo[0].stage_code);
            formData.append('_compId', compModelVerInfo[0].comp_id);
            formData.append('model_name', compModelVerInfo[0].model_name);
            formData.append('model_id', compModelVerInfo[0].model_id);
            formData.append('training_status', compModelVerInfo[0].training_status);
            formData.append('model_status', compModelVerInfo[0].model_status);
            formData.append('stage_id', compModelVerInfo[0].stage_id);
            formData.append('camera_label', camera_label);


            console.log("formData error", formData);


            const response = await urlSocket.post('/api/stage/delete_image_stg', formData, {
                headers: {
                    'content-type': 'multipart/form-data'
                },
                mode: 'no-cors'
            });
            console.log("formData response", response);
            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                errorHandler(response.data.error);
            }
            else {
                setResponseMessage(response.data.message);
                setCompModelVerInfo(response.data.comp_model_ver_info_list);
                setImagesLength(response.data.img_count);
                setActiveGroupData(prev => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach(version => {
                        updated[version] = updated[version].filter(item => item.filename !== fileName);
                        // If after deletion the array is empty, remove the key
                        if (updated[version].length === 0) delete updated[version];
                    });
                    return updated;
                });

                setSelectedImages(prev => prev.filter(img => img.filename !== fileName));


                const matchingDoc = response.data.comp_model_ver_info_list.find(
                    doc =>
                        doc.camera.model_ver === parseInt(data.org_model_ver) &&
                        doc.camera.label.trim().toLowerCase() === camera_label.trim().toLowerCase()
                );

                if (matchingDoc) {
                    imgGlry(matchingDoc, camera_label, matchingDoc.camera.model_ver);
                }

                if (selectedList.length !== 0) {
                    const updatedImgGlr = imgGlr;
                    const filteredGroupedData = selectedList.reduce((acc, itemList) => {
                        const version = itemList.value;
                        const itemsForVersion = updatedImgGlr.filter(item => item.used_model_ver.includes(version));
                        acc[version] = itemsForVersion;
                        return acc;
                    }, {});

                    setGroupedData(filteredGroupedData);
                }

                setTimeout(() => {
                    setResponseMessage("");
                }, 1000);
            }
        } catch (error) {
            console.log('error', error);
        }
    };

    const train = async (data, index) => {
        console.log('data', data)
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger'
            },
            buttonsStyling: false
        });

        swalWithBootstrapButtons.fire({
            title: 'Start Training?',
            text: "Training this version may take some time to complete. Please ensure that you have provided all necessary inputs before proceeding.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Continue',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        }).then(async (result) => {
            if (result.isConfirmed) {

                const updatedCompModelVerInfo = [...compModelVerInfo];
                updatedCompModelVerInfo[0].training_status_id = 0;
                updatedCompModelVerInfo[0].training_start_time = '00:00:00';
                setCompModelVerInfo(updatedCompModelVerInfo);
                setRefersh(true);
                setShowTrainingINProgs(true);

                trainingStatusIntervalRef.current = setInterval(() => fetchTrainingStatus(data), 5000);

                try {
                    const response = await urlSocket.post('/api/stage/Train_stg', {
                        // compModelVerInfo: data,
                        compModelVerInfo: [data],
                        config: config
                    }, { mode: 'no-cors' });
                    if (response.data.error === "Tenant not found") {
                        console.log("data error", response.data.error);
                        // setShowTrainingINProgs(false)
                        clearInterval(trainingStatusIntervalRef.current);
                        errorHandler(response.data.error);
                    }

                    swalWithBootstrapButtons.fire(
                        'Training Started',
                        'Please wait while the training process completes.',
                        'success'
                    );

                } catch (error) {
                    console.log('Error starting training:', error);
                    clearInterval(trainingStatusIntervalRef.current);
                    // setShowTrainingINProgs(false)
                    swalWithBootstrapButtons.fire(
                        'Error',
                        'Failed to start training. Please try again later.',
                        'error'
                    );
                }
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire(
                    'Training Canceled',
                    `You can start the training anytime when you're ready.`,
                    'error'
                );
            }
        });
    };

    const clock = (data) => {
        if (data && data !== '00:00:00') {
            let st_date = new Date(data).toISOString();
            var time = moment.utc(st_date).format("DD/MM/YYYY HH:mm:ss");
            let start = new Date().toString();
            var endtime = moment.utc(start).format("DD/MM/YYYY HH:mm:ss");

            var startTime = moment(time, "DD/MM/YYYY HH:mm:ss");
            var endTime = moment(endtime, "DD/MM/YYYY HH:mm:ss");

            var duration = moment.duration(endTime.diff(startTime));

            var days = Math.floor(duration.asDays());
            var hours = duration.hours();
            var minutes = duration.minutes();
            var seconds = duration.seconds();

            var result = "";
            if (days > 0) {
                result += days + " Day";
                if (days > 1) {
                    result += "s";
                }
                result += " and ";
            }
            result += hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
            return result;
        } else {
            return '00:00:00';
        }
    };

    // const fetchTrainingStatus = async (data) => {
    //     try {
    //         const response = await urlSocket.post('/api/stage/getTrainingStatus_stg', { 'compModelVerInfo': data }, { mode: 'no-cors' });
    //         const updatedCompModelVerInfo = response.data;
    //         console.log('six', updatedCompModelVerInfo)
    //         setCompModelVerInfo(updatedCompModelVerInfo);
    //         setRefersh(true);

    //         if (updatedCompModelVerInfo[0].training_status === 'training completed') {
    //             updatedCompModelVerInfo[0].training_status_id = 4;
    //             updatedCompModelVerInfo[0].training_status = 'training completed';
    //             setShowTrainingINProgs(false);
    //             setRefersh(true);
    //             clearInterval(trainingStatusIntervalRef.current);
    //         }
    //         else if (updatedCompModelVerInfo[0].training_status === 'admin approved trained model') {
    //             setShowTrainingINProgs(false);
    //             setRefersh(true);
    //             clearInterval(trainingStatusIntervalRef.current);
    //         }
    //         else if (updatedCompModelVerInfo[0].training_status !== 'training_in_progress' && updatedCompModelVerInfo[0].training_status !== 'training_queued') {
    //             setShowTrainingINProgs(false);
    //             setShowRetrain(false);
    //             setRefersh(true);
    //             clearInterval(trainingStatusIntervalRef.current);
    //         }

    //         if (updatedCompModelVerInfo[0].training_status === 'training_in_progress' || updatedCompModelVerInfo[0].training_status === 'training_queued') {
    //             setShowTrainingINProgs(true);
    //         }
    //         else if (updatedCompModelVerInfo[0].training_status === 'retrain') {
    //             setShowRetrain(true);
    //         }
    //     } catch (error) {
    //         console.log('Error fetching training status:', error);
    //     }
    // };
    const fetchTrainingStatus = async (data) => {
        console.log('Fetching training status for:', data);
        try {
            const response = await urlSocket.post(
                '/api/stage/getTrainingStatus_stg',
                { compModelVerInfo: data },
                { mode: 'no-cors' }
            );

            const updatedCompModelVerInfo = response.data;
            console.log('Training status response:', updatedCompModelVerInfo);

            setCompModelVerInfo(updatedCompModelVerInfo);
            setRefersh(true);

            let allCompleted = true;
            let anyInProgress = false;
            let anyRetrain = false;

            updatedCompModelVerInfo.forEach((item) => {
                if (item.training_status === 'training_in_progress' || item.training_status === 'training_queued') {
                    anyInProgress = true;
                    allCompleted = false;
                } else if (item.training_status === 'retrain') {
                    anyRetrain = true;
                    allCompleted = false;
                } else if (
                    item.training_status !== 'training completed' &&
                    item.training_status !== 'admin approved trained model'
                ) {
                    allCompleted = false;
                }
            });

            if (allCompleted) {
                setShowTrainingINProgs(false);
                setShowRetrain(false);
                clearInterval(trainingStatusIntervalRef.current);
            } else {
                setShowTrainingINProgs(anyInProgress);
                setShowRetrain(anyRetrain);
            }

        } catch (error) {
            console.log('Error fetching training status:', error);
            clearInterval(trainingStatusIntervalRef.current);
        }
    };
    const closeAdminTestOptions = () => {
        setShowTestingOptions(false);
    };

    const continueAdminTest = (selected_options) => {
        setShowTestingOptions(false);

        const data = JSON.parse(JSON.stringify(selectedVersion));
        goToAdminTestingPage(data, selected_options);
    };

    const startAdminTest = async (data, model) => {
        const details = JSON.parse(sessionStorage.getItem('manageData'));
        const model_info = details.modelInfo;

        const ask_testing_type = model_info.find(model =>
            model._id === data.model_id
            && model.region_testing === true
        ) !== undefined;

        if (ask_testing_type) {
            setShowTestingOptions(true);
            setSelectedVersion(data);
        } else {
            goToAdminTestingPage(data);
        }
    };

    const goToAdminTestingPage = (version_data, options = {}) => {
        if (version_data.result_mode === "ok") {
            Swal.fire({
                title: "This is an OK Model",
                text: "Test only with OK images to get better accuracy",
                icon: "info",
                confirmButtonText: "OK"
            });
        } else if (version_data.result_mode === "ng") {
            Swal.fire({
                title: "This is an NG Model",
                text: "Test only with NG images to get better accuracy",
                icon: "warning",
                confirmButtonText: "OK"
            });
        }

        let count = initvalue;
        let values = {
            config: config,
            testCompModelVerInfo: version_data,
            batch_no: count++,
            page: 'modelverinfo'
        };


        if (options?.testing_mode?.length > 0) {
            values.overall_testing = false;
            values.region_wise_testing = false;

            if (options.testing_mode.length >= 2) {
                values.option = 'Entire Component with Regions';
                values.overall_testing = true;
                values.region_wise_testing = true;
            } else if (options.testing_mode.includes("component_testing")) {
                values.option = 'Entire Component';
                values.overall_testing = true;
            } else if (options.testing_mode.includes("region_testing")) {
                values.option = 'Regions Only';
                values.region_wise_testing = true;
            }

            if (options?.testing_mode.includes("region_testing")) {
                values.detection_type = options.detection_type;
                values.regions = options.regions;
            }
        }

        sessionStorage.removeItem("modelData");
        localStorage.setItem('modelData', JSON.stringify(values));


        history.push('/StageAdminAccTesting');
    };

    const back = () => {
        history.push("/StageModelVerInfo");
    };

    const onDrop = async (data) => {
        const droppedData = JSON.parse(data.dragdrop);

        try {
            const response = await urlSocket.post('/dragImg', { 'compModelInfo': compModelVerInfo[0], 'drgImg': droppedData }, { mode: 'no-cors' });
            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                errorHandler(response.data.error);
            }
            else {
                const getInfo = response.data;
                setResponseMessage(getInfo.message);
                setCompModelVerInfo(getInfo.comp_model_ver_info_list);
                setRefersh(true);
                setImagesLength(getInfo.img_count);

                await imgGlry();

                if (selectedList.length !== 0) {
                    const updatedImgGlr = imgGlr;
                    const filteredGroupedData = selectedList.reduce((acc, itemList) => {
                        const version = itemList.value;
                        const itemsForVersion = updatedImgGlr.filter(item => item.used_model_ver.includes(version));
                        acc[version] = itemsForVersion;
                        return acc;
                    }, {});

                    setGroupedData(filteredGroupedData);
                }
                setTimeout(() => {
                    setResponseMessage("");
                }, 1000);
            }
        } catch (error) {
            console.log('error', error);
        }
    };

    const togXlarge = () => {
        setModalXlarge(prev => !prev);
        log();
        removeBodyCss();
    };

    const log = () => {
        try {
            urlSocket.post('/version_log_info', {
                'comp_name': compModelVerInfo[0].comp_name,
                'model_name': compModelVerInfo[0].model_name,
                "comp_code": compModelVerInfo[0].comp_code,
                "model_ver": compModelVerInfo[0].model_ver
            }, { mode: 'no-cors' })
                .then((response) => {
                    let data1 = response.data;
                    if (data1.error === "Tenant not found") {
                        console.log("data error", data1.error);
                        errorHandler(data1.error);
                    }
                    else {
                        setLogData(data1);
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        } catch (error) {
            console.log("----", error);
        }
    };

    const removeBodyCss = () => {
        document.body.classList.add("no_padding");
    };

    const handleChange = (e) => {
        const updatedImgGlr = imgGlr.map((img, imgId) => {
            if (img.filename === e.target.name) {
                return { ...img, checked: e.target.checked };
            }
            return img;
        });
        setImgGlr(updatedImgGlr);
    };

    const shareImgData = async () => {
        const selectedImages = imgGlr.filter(img => img.checked === true);

        if (selectedImages.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Image Selected',
                text: 'Please select at least one image before sharing.',
            });
            return;
        }
        setIsSharing(true);
        window.history.pushState(null, "", window.location.href);

        try {
            for (const img of selectedImages) {
                if (img.checked === true) {
                    try {
                        const response = await urlSocket.post('/sharedImage', {
                            'compModelInfo': compModelVerInfo[0],
                            'imageData': img
                        }, {
                            mode: 'no-cors'
                        });

                        let data1 = response.data;
                        if (data1.error === "Tenant not found") {
                            console.log("data error", data1.error);
                            errorHandler(data1.error);
                        }
                        else {
                            setResponseMessage(response.data.message);
                            setCompModelVerInfo(response.data.comp_model_ver_info_list);
                            setImagesLength(response.data.img_count);

                            setTimeout(() => {
                                setResponseMessage("");
                            }, 1000);
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
            }

            await imgGlry();

            if (selectedList.length !== 0) {
                const updatedImgGlr = imgGlr;
                const filteredGroupedData = selectedList.reduce((acc, itemList) => {
                    const version = itemList.value;
                    const itemsForVersion = updatedImgGlr.filter(item => item.used_model_ver.includes(version));
                    acc[version] = itemsForVersion;
                    return acc;
                }, {});

                setGroupedData(filteredGroupedData);
            }
        }
        finally {
            setIsSharing(false);
            setHasPushedState(false);
            window.removeEventListener("popstate", blockBackNavigation);
            window.history.replaceState(null, "", window.location.href);
        }
    };

    const blockBackNavigation = (event) => {
        if (isSharing) {
            Swal.fire({
                icon: 'info',
                title: 'Sharing in Progress',
                text: 'Please wait until image sharing is complete.',
            });

            if (!hasPushedState) {
                setHasPushedState(true);
                window.history.pushState(null, "", window.location.href);
            }
        }
    };

    const onSelectValues = (selectedListVal, selectedItem) => {
        setSelectedList(selectedListVal);
        const groupedDataResult = imgGlr.reduce((acc, item) => {
            item.used_model_ver.forEach((version) => {
                if (!acc[version]) {
                    acc[version] = [];
                }
                acc[version].push(item);
            });
            return acc;
        }, {});

        const filteredGroupedData = selectedListVal.reduce((acc, itemList) => {
            const version = itemList.value;
            if (groupedDataResult[version]) {
                acc[version] = groupedDataResult[version];
            }
            return acc;
        }, {});

        setGroupedData(filteredGroupedData);
    };

    const onRemove = (selectedListVal, selectedItem, index) => {
        if (selectedListVal.length === 0) {
            const groupedDataResult = imgGlr.reduce((acc, item) => {
                item.used_model_ver.forEach((version) => {
                    if (!acc[version]) {
                        acc[version] = [];
                    }
                    acc[version].push(item);
                });
                return acc;
            }, {});
            setGroupedData(groupedDataResult);
        }
        else {
            setSelectedList(selectedListVal);
            const groupedDataResult = imgGlr.reduce((acc, item) => {
                item.used_model_ver.forEach((version) => {
                    if (!acc[version]) {
                        acc[version] = [];
                    }
                    acc[version].push(item);
                });
                return acc;
            }, {});

            const filteredGroupedData = selectedListVal.reduce((acc, itemList) => {
                const version = itemList.value;
                if (groupedDataResult[version]) {
                    acc[version] = groupedDataResult[version];
                }
                return acc;
            }, {});

            setGroupedData(filteredGroupedData);
        }
    };



    const imagesLengthCalc = (activeGroupDataVal, model_ver, lable_name_val) => {
        const labelItemCount = Object.entries(activeGroupDataVal)
            .filter(([version]) => model_ver === parseInt(version))
            .flatMap(([_, items]) => items)
            .filter(item => item.imagePathType[0].type === lable_name_val)
            .length;

        return labelItemCount;
    };

    const handleCheckboxChange = (item, ver) => {
        const index = selectedImages.indexOf(item);
        let idxVal = item.used_model_ver.indexOf(parseInt(ver));
        let imgName = item.imagePathType[idxVal].image_path;

        if (index === -1) {
            setSelectedImages([...selectedImages, item]);
            setImgPaths([...imgPaths, imgName]);
        } else {
            const updatedSelectedImages = [...selectedImages];
            updatedSelectedImages.splice(index, 1);

            const updatedPaths = [...imgPaths];
            updatedPaths.splice(index, 1);

            setSelectedImages(updatedSelectedImages);
            setImgPaths(updatedPaths);
        }
    };

    const handleDeleteSelectedImages = async (img_path) => {
        let imgPathsToDelete = [];
        let imagesGroupedByDoc = {};

        if (img_path) {
            imgPathsToDelete = [img_path];
        } else {
            imgPathsToDelete = selectedImages.map(img => img.imagePathType[0].image_path);
        }

        if (imgPathsToDelete.length === 0) {
            Swal.fire({
                title: 'No items selected',
                icon: 'info',
                timer: 1500,
                showConfirmButton: false,
            });
            return;
        }

        // Group selected images by the document they belong to
        imgPathsToDelete.forEach(path => {
            const doc = compModelVerInfo.find(doc =>
                doc.datasets?.some(d => d.image_path === path) ||
                doc.datasets_history?.some(d => d.image_path === path)
            );

            if (doc) {
                if (!imagesGroupedByDoc[doc._id]) imagesGroupedByDoc[doc._id] = [];
                imagesGroupedByDoc[doc._id].push(path);
            }
        });

        Swal.fire({
            title: `Delete ${imgPathsToDelete.length} item${imgPathsToDelete.length > 1 ? 's' : ''}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
        }).then(async (result) => {
            if (result.isConfirmed) {
                for (const [docId, paths] of Object.entries(imagesGroupedByDoc)) {
                    await imgDeletion(paths, docId);
                }
            }
        });
    };


    const imgDeletion = async (img_paths_to_delete, docId) => {
        try {

            setActiveGroupData(prev => {
                const updated = { ...prev };
                Object.keys(updated).forEach(version => {
                    updated[version] = updated[version].filter(
                        item => !img_paths_to_delete.includes(item.imagePathType[0].image_path)
                    );
                });
                return updated;
            });

            setSelectedImages(prev =>
                prev.filter(img => !img_paths_to_delete.includes(img.imagePathType[0].image_path))
            );

            setImagesLength(prev => prev - img_paths_to_delete.length);
            const formData = new FormData();
            formData.append('_id', docId);
            formData.append('labelName', labelName);
            formData.append('img_paths', JSON.stringify(img_paths_to_delete));
            formData.append('type', type);
            formData.append('position', position);
            formData.append("camera_label", selectedCamera?.label || "");
            formData.append("model_ver", selectedCamera?.model_ver || "")
            const response = await urlSocket.post('/api/stage/deleteSelectedImage_stg', formData, {
                headers: {
                    'content-type': 'multipart/form-data'
                },
                mode: 'no-cors'
            });
            console.log("response", response,)
            console.log("formData", formData)

            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                errorHandler(response.data.error);
            } else {
                setResponseMessage(response.data.message);
                setCompModelVerInfo(response.data.comp_model_ver_info_list);
                setImagesLength(response.data.img_count);

                // Refresh gallery
                await imgGlry();

                if (selectedList.length !== 0) {
                    const updatedImgGlr = imgGlr;
                    const filteredGroupedData = selectedList.reduce((acc, itemList) => {
                        const version = itemList.value;
                        const itemsForVersion = updatedImgGlr.filter(item => item.used_model_ver.includes(version));
                        acc[version] = itemsForVersion;
                        return acc;
                    }, {});

                    setGroupedData(filteredGroupedData);
                }

                setTimeout(() => {
                    setResponseMessage("");
                }, 1000);
            }
        } catch (error) {
            console.log('error', error);
        }

        setSelectedImages([]);
    };




    const similarityChange = async (value) => {
        setRangeValue(value);
        try {
            const response = await urlSocket.post('/threshold_changes', {
                'comp_name': compModelVerInfo[0].comp_name,
                'comp_code': compModelVerInfo[0].comp_code,
                'model_name': compModelVerInfo[0].model_name,
                'model_ver': compModelVerInfo[0].model_ver,
                'thres': value
            }, { mode: 'no-cors' });

            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                errorHandler(response.data.error);
            }
            else {
                setCompModelVerInfo(response.data);
            }
        } catch (error) {
            console.log('error', error);
        }
    };

    const rotation = (e) => {
        setImgRotation(e.target.checked);
        if (e.target.checked === true) {
            setNoOfRotation(1);
        }
        if (e.target.checked === false) {
            setNoOfRotation(0);
            try {
                urlSocket.post('/rotation_update', {
                    'comp_name': compModelVerInfo[0].comp_name,
                    'comp_code': compModelVerInfo[0].comp_code,
                    'model_name': compModelVerInfo[0].model_name,
                    'model_ver': compModelVerInfo[0].model_ver,
                    'image_rotation': 0
                }, { mode: 'no-cors' });
            } catch (error) {
                console.log('error', error);
            }
        }
    };

    const rotationUpdate = async (rotate_val) => {
        let value = parseInt(rotate_val);

        if (value > 100) {
            value = 100;
        }

        setNoOfRotation(value);
        try {
            const response = await urlSocket.post('/rotation_update', {
                'comp_name': compModelVerInfo[0].comp_name,
                'comp_code': compModelVerInfo[0].comp_code,
                'model_name': compModelVerInfo[0].model_name,
                'model_ver': compModelVerInfo[0].model_ver,
                'image_rotation': value
            }, { mode: 'no-cors' });

            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                errorHandler(response.data.error);
            }
            else {
                setCompModelVerInfo(response.data);
            }
        } catch (error) {
            console.log('error', error);
        }
    };


    const generatePortNumber = (camIndex, deviceId) => {
        const basePort = 8000;
        const indexPort = camIndex !== undefined ? camIndex : 0;
        const deviceHash = deviceId ? deviceId.slice(-4) : '0000';
        const hashNumber = parseInt(deviceHash, 16) % 1000;

        return (basePort + indexPort * 10 + (hashNumber % 10)).toString();
    };
    const extractPortInfo = (label) => {
        let v_id = '', p_id = '', portNumber = '';

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


    const checkWebcam = useCallback(async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputDevices = devices.filter(device => device.kind === 'videoinput');

            if (!videoInputDevices.length) {
                setCameraDisconnected(true);
            } else {
                console.log('Available Cameras: ', videoInputDevices);

                const newAvailableCameras = videoInputDevices
                    .map((camera, index) => {
                        const portInfo = extractPortInfo(camera.label);
                        const generatedPort = generatePortNumber(index, camera.deviceId);

                        return {
                            deviceId: camera.deviceId,
                            label: camera.label,
                            camIndex: index,
                            pos_no: index,
                            id: index + 1,
                            title: camera.label,
                            positionName: `Position ${index + 1}`,
                            originalDeviceId: camera.deviceId,
                            groupId: camera.groupId,
                            v_id: portInfo.v_id,
                            p_id: portInfo.p_id,
                            portNumber: portInfo.portNumber || generatedPort,
                            customPort: false
                        };
                    });

                setPysclCameraList(newAvailableCameras);
                setNewAvailableCameras(newAvailableCameras);
                setCameraDisconnected(false);

                // Set default camera if none selected and cameras are available
                if (!selectedCameraLabel && cameraList.length > 0 && newAvailableCameras.length > 0) {
                    const firstConfiguredCamera = cameraList[0];
                    if (firstConfiguredCamera) {
                        setSelectedCameraLabel(firstConfiguredCamera.originalLabel);
                    }
                }
                // await getCameraPosition();
            }
        } catch (error) {
            console.log('Error Info: ', error);
            Swal.fire({
                title: "Camera Error",
                text: "Please allow camera access or check camera port",
                icon: "error",
                confirmButtonText: "OK"
            });
        }
    }, []);

    const getMatchedCameras = () => {
        if (!cameraList.length || !newAvailableCameras.length) return [];

        return cameraList.map(configCamera => {
            const matchedCamera = newAvailableCameras.find(availableCamera => {
                const pIdMatch = configCamera.p_id === availableCamera.p_id;
                const vIdMatch = configCamera.v_id === availableCamera.v_id;
                const labelMatch = configCamera.originalLabel === availableCamera.title;

                return pIdMatch && vIdMatch && labelMatch;
            });

            return {
                ...configCamera,
                isAvailable: !!matchedCamera,
                deviceId: matchedCamera?.deviceId || null,
                actualLabel: matchedCamera?.label || configCamera.originalLabel
            };
        });
    };


    // // 4. Update the camera switching function to reload images
    // const switchCamera = (camera) => {
    //     console.log("camera", camera);
    //     const combinedKey = camera.label + "_" + camera.model_ver;
    //     console.log("combinedKey", combinedKey);
    //     setSelectedCameraLabel(combinedKey);
    //     setShowCameraSelector(false);

    //     // Reload images for the selected camera (pass cameraLabel directly)
    //     if (compModelVerInfo && compModelVerInfo.length > 0) {
    //         const matchingDoc = compModelVerInfo.find(
    //             (doc) => doc.model_ver === camera.model_ver
    //         );

    //         if (matchingDoc) {
    //             imgGlry(matchingDoc, camera.label, camera.model_ver);
    //         }
    //     }

    //     // Update outline for the selected camera if in multi-camera mode
    //     if (stageInfo?.camera_selection?.mode === 'multi' && showOutline) {
    //         console.log('Updating outline for multi-camera mode');
    //         newOutlineChange(defaultOutline);
    //     }

    // };
    const switchCamera = (camera) => {
        console.log("camera", camera);
        const combinedKey = camera.label + "_" + camera.model_ver;
        console.log("combinedKey", combinedKey);
        setSelectedCamera(camera);
        setSelectedCameraLabel(combinedKey);
        setShowCameraSelector(false);

        // Reload images for the selected camera (pass cameraLabel directly)
        if (compModelVerInfo && compModelVerInfo.length > 0) {
            console.log("compModelVerInfo", compModelVerInfo);
            // const matchingDoc = compModelVerInfo.find(
            //     (doc) => doc.model_ver === camera.model_ver
            // );
            const matchingDoc = compModelVerInfo.find(
                (doc) =>
                    doc.camera.model_ver === camera.model_ver &&
                    doc.camera.label.trim().toLowerCase() === camera.label.trim().toLowerCase()
            );

            console.log("matchingDoc", matchingDoc);
            if (matchingDoc) {
                const imagesForVersion = matchingDoc.datasets || [];
                setSelectedImages([]);
                setGroupedData({
                    [camera.model_ver]: imagesForVersion
                });

                // Update images length
                setImagesLength(imagesForVersion.length);


                imgGlry(matchingDoc, camera.label, camera.model_ver);
            }
        }

        // Update outline for the selected camera if in multi-camera mode
        if (stageInfo?.camera_selection?.mode === 'multi' && showOutline) {
            console.log('Updating outline for multi-camera mode');
            newOutlineChange(defaultOutline);
        }

    };




    const newOutlineChange = (ot_label) => {

        setDefaultOutline(ot_label);

        if (stageInfo?.camera_selection?.mode === 'multi') {
            console.log('Multi-camera mode detected');

            setOutlinePath(stageInfo.datasets);

        } else {
            if (ot_label === 'White Outline') {
                setOutlinePath(compInfo.datasets.white_path);
            }
            else if (ot_label === 'Red Outline') {
                setOutlinePath(compInfo.datasets.red_path);
            }
            else if (ot_label === 'Green Outline') {
                setOutlinePath(compInfo.datasets.green_path);
            }
            else if (ot_label === 'Blue Outline') {
                setOutlinePath(compInfo.datasets.blue_path);
            }
            else if (ot_label === 'Black Outline') {
                setOutlinePath(compInfo.datasets.black_path);
            }
            else if (ot_label === 'Orange Outline') {
                setOutlinePath(compInfo.datasets.orange_path);
            }
            else if (ot_label === 'Yellow Outline') {
                setOutlinePath(compInfo.datasets.yellow_path);
            }
        }
    };

    const normalizeCameraKey = (str) => (str ? str.replace(/\s+/g, "_") : "");

    const renderCameraGallery = () => {
        console.log("hiiirender");
        const imagesByCamera = {};

        Object.entries(activeGroupData).forEach(([version, items]) => {
            items.forEach(item => {
                if (item.imagePathType && item.imagePathType[0] && item.imagePathType[0].type === labelName) {
                    const modelVer = item.imagePathType[0].model_ver || version; // take dataset model_ver
                    const cameraKey = normalizeCameraKey(item.imagePathType[0].camera) + "_" + modelVer;
                    if (!imagesByCamera[cameraKey]) imagesByCamera[cameraKey] = [];
                    imagesByCamera[cameraKey].push({ item, version });
                }
            });
        });



        const filteredImagesByCamera = selectedCameraLabel
            ? { [selectedCameraLabel]: imagesByCamera[selectedCameraLabel] || [] }
            : imagesByCamera;
        console.log("imagesByCamera", imagesByCamera);
        console.log("filteredImagesByCamera", filteredImagesByCamera);
        console.log("selectedCameraLabel", selectedCameraLabel);



        return Object.entries(filteredImagesByCamera).map(
            ([cameraKey, cameraImages], cameraIndex) => {
                const camera = cameraList.find(
                    cam => normalizeCameraKey(cam.label) === cameraKey
                );
                const displayName = camera ? camera.label : cameraKey.replace(/_/g, " ");
                const isOnline =
                    camera &&
                    newAvailableCameras.some(availCam => availCam.label === camera.originalLabel);

                return (
                    <div key={cameraIndex} className="mb-4">
                        <div
                            className="d-flex justify-content-between align-items-center mb-2 p-2"
                            style={{
                                backgroundColor: "#f8f9fa",
                                borderRadius: "5px",
                                border: `2px solid ${isOnline ? "#28a745" : "#dc3545"}`
                            }}
                        >
                            <div className="d-flex align-items-center">
                                <span
                                    className={`badge ${isOnline ? "badge-success" : "badge-danger"} me-2`}
                                >
                                    {isOnline ? "🟢" : "🔴"}
                                </span>
                                <h6 className="mb-0" style={{ fontWeight: "bold" }}>
                                    {displayName}
                                </h6>


                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <span className="badge badge-secondary">
                                    {cameraImages.length} images
                                </span>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <Checkbox
                                        style={{
                                            borderColor: "slategray",
                                            borderWidth: "2px",
                                            borderStyle: "solid",
                                            borderRadius: "7px",
                                            height: "18px",
                                            width: "18px",
                                            marginRight: "5px"
                                        }}
                                        checked={cameraImages.every(({ item }) =>
                                            selectedImages.includes(item)
                                        )}
                                        onChange={e => {
                                            const isChecked = e.target.checked;

                                            if (isChecked) {
                                                const newItems = cameraImages.map(({ item }) => item);
                                                const merged = [...new Set([...selectedImages, ...newItems])];
                                                setSelectedImages(merged);
                                            } else {
                                                const cameraItems = cameraImages.map(({ item }) => item);
                                                const filtered = selectedImages.filter(sel => !cameraItems.includes(sel));
                                                setSelectedImages(filtered);
                                            }
                                        }}

                                    />
                                    <small>Select Alldd</small>
                                </div>
                            </div>
                        </div>

                        {/* Camera Images Grid */}
                        <Row>
                            {cameraImages.map(({ item, version }, itemId) => {
                                const isSelected = selectedImages.includes(item);
                                const imageIndex = itemId + 1;

                                return (
                                    <Col sm={3} md={3} key={`${cameraIndex}-${itemId}`}>
                                        <Card
                                            style={{
                                                borderRadius: "7px",
                                                marginBottom: "10px"
                                            }}
                                        >
                                            <CardBody
                                                style={{
                                                    padding: "7px",
                                                    border: isSelected
                                                        ? "2px solid red"
                                                        : "2px solid green",
                                                    borderRadius: "7px"
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontWeight: "bold",
                                                        textAlign: "left",
                                                        whiteSpace: "pre",
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                        marginBottom: "5px"
                                                    }}
                                                >
                                                    <div style={{ display: "flex", alignItems: "center" }}>
                                                        <Checkbox
                                                            style={{
                                                                borderColor: "slategray",
                                                                borderWidth: "2px",
                                                                borderStyle: "solid",
                                                                borderRadius: "7px",
                                                                height: "16px",
                                                                width: "16px",
                                                                marginRight: "5px"
                                                            }}
                                                            checked={isSelected}
                                                            onChange={() => handleCheckboxChange(item, version)}
                                                        />
                                                        <span style={{ fontSize: "12px" }}>#{imageIndex}</span>
                                                    </div>
                                                    <div style={{ textAlign: "right" }}>
                                                        <Popconfirm
                                                            placement="rightBottom"
                                                            title="Do you want to delete?"
                                                            // onConfirm={() =>
                                                            //     deleteImageClick(
                                                            //         item,
                                                            //         compModelVerInfo[0].model_ver,
                                                            //         labelName
                                                            //     )
                                                            // }

                                                            onConfirm={() => {
                                                                // Prefer using docId if available
                                                                // const currentDoc = compModelVerInfo.find(doc => doc._id === item.docId)
                                                                //     || compModelVerInfo.find(doc => doc.camera.label === item.camera_label);
                                                                // console.error("currentDoc", currentDoc.model_ver);
                                                                const currentDoc = compModelVerInfo.find(doc =>
                                                                    doc.camera.label === item.camera_label &&
                                                                    item.used_model_ver.includes(doc.model_ver)
                                                                );

                                                                if (currentDoc) {
                                                                    deleteImageClick(
                                                                        item,
                                                                        currentDoc.model_ver,
                                                                        labelName,
                                                                        currentDoc.camera.label,
                                                                        currentDoc._id  // pass correct _id
                                                                    );
                                                                } else {
                                                                    console.error("No matching document found for image:", item.filename);
                                                                }
                                                            }}
                                                            okText="Yes"
                                                        >
                                                            <DeleteTwoTone
                                                                twoToneColor="red"
                                                                style={{
                                                                    fontSize: "16px",
                                                                    background: "white",
                                                                    borderRadius: "5px",
                                                                    cursor: "pointer"
                                                                }}
                                                            />
                                                        </Popconfirm>
                                                    </div>
                                                </div>

                                                <Image
                                                    src={showImage(item.imagePathType[0].image_path)}
                                                    alt="Image not there"
                                                    style={{ width: "100%", borderRadius: "3px" }}
                                                />

                                                <div
                                                    style={{
                                                        fontSize: "10px",
                                                        marginTop: "5px",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: "2px"
                                                    }}
                                                >
                                                    <div style={{ fontWeight: "bold" }}>
                                                        Used In: {item.used_model_ver.join(", ")}
                                                    </div>
                                                    <div style={{ color: "#666" }}>
                                                        Camera: {displayName}
                                                    </div>
                                                    <div style={{ color: "#666" }}>
                                                        Type: {item.imagePathType[0].type}
                                                    </div>
                                                    {item.imagePathType[0].date && (
                                                        <div style={{ color: "#888", fontSize: "9px" }}>
                                                            {new Date(item.imagePathType[0].date).toLocaleString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                );
                            })}
                        </Row>

                        {/* Camera Statistics */}
                        <div
                            className="text-center mb-3 p-2"
                            style={{
                                backgroundColor: "#f1f3f4",
                                borderRadius: "5px",
                                fontSize: "12px"
                            }}
                        >
                            <strong>{displayName}</strong> - Total Images:{" "}
                            {cameraImages.length} | Selected:{" "}
                            {cameraImages.filter(({ item }) => selectedImages.includes(item)).length}
                        </div>
                    </div>
                );
            }
        );
    };
    const RemoteAccessGallery = ({ galleryData }) => {
        const [remotecameraFilter, remotesetCameraFilter] = useState(null);
        const [selectedImages, setSelectedImages] = useState([]);


        const normalizeCameraKey = (str) => (str ? str.replace(/\s+/g, "_") : "");

        const showToast = (icon, title, img) => {
            Swal.fire({
                showConfirmButton: false,
                timer: 2000,
                icon: icon, // 'success', 'error', 'warning', etc.
                title: title,
                text: img ? `Image deleted successfully from ${img.camera_label}` : title,

            });
        };





        useEffect(() => {
            if (!remotecameraFilter && remoteGallery && Object.keys(remoteGallery).length > 0) {
                const firstCameraKey = Object.keys(remoteGallery)[0];
                console.log("Default firstCameraKey", firstCameraKey);
                remotesetCameraFilter(firstCameraKey);
            }
        }, [remoteGallery, remotecameraFilter]);

        useEffect(() => {
            if (galleryData && Array.isArray(galleryData) && galleryData.length > 0) {
                showToast("success", "Images added successfully");
            }
        }, [galleryData]);

        if (!remoteGallery || Object.keys(remoteGallery).length === 0) {
            return <h6 className="text-center my-3">No Images available...</h6>;
        }


        const imagesByCamera = useMemo(() => remoteGallery, [remoteGallery]);

        const handleCheckboxChange = useCallback((img) => {
            setSelectedImages((prev) =>
                prev.includes(img) ? prev.filter((i) => i !== img) : [...prev, img]
            );
        }, []);


        const showImage = useCallback((img) => {
            const remoteurl = RemoteImageUrl;

            if (img && img.local_path) {
                let result = img.local_path.replace(/\\/g, "/");

                result = encodeURI(result);

                const output = remoteurl + String(result);
                console.log("image output", output);
                return output;
            }

            return null;
        }, []);




        const handleDeleteSelected = useCallback(async () => {
            if (selectedImages.length === 0) return;

            const result = await Swal.fire({
                title: `Delete ${selectedImages.length} images?`,
                text: "This action cannot be undone!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Yes, delete!",
                cancelButtonText: "Cancel",
            });

            if (!result.isConfirmed) return;

            try {
                // 1️⃣ Delete all selected images in parallel
                await Promise.all(
                    selectedImages.map((img) => {
                        const formData = new FormData();
                        formData.append("comp_id", compModelVerInfo[0].comp_id);
                        formData.append("stage_id", compModelVerInfo[0].stage_id);
                        formData.append("model_id", compModelVerInfo[0].model_id);
                        formData.append("camera_label", img.camera_label);
                        formData.append("filename", img.filename);
                        formData.append("model_ver", img.model_ver)

                        return urlSocket.post("/deleteRemoteImage", formData, {
                            headers: { "Content-Type": "multipart/form-data" },
                        });
                    })


                );


                setRemoteGallery((prev) => {
                    if (!prev) return {};

                    const updated = { ...prev };
                    const newCounts = {};

                    selectedImages.forEach((sel) => {
                        const key = normalizeCameraKey(sel.camera_label);
                        if (updated[key]) {
                            updated[key] = updated[key].filter(
                                (img) => img.filename !== sel.filename
                            );
                            if (updated[key].length === 0) {
                                delete updated[key];
                            }
                        }
                    });

                    // update counts inline
                    Object.entries(updated).forEach(([k, imgs]) => {
                        newCounts[k] = imgs.length;
                    });
                    setCameraCaptureCounts(newCounts);

                    return { ...updated };
                });



                const camerasDeleted = [
                    ...new Set(selectedImages.map((img) => img.camera_label)),
                ].join(", ");
                showToast(
                    "success",
                    `Deleted ${selectedImages.length} images from: ${camerasDeleted}`
                );
                console.error("camerasDeleted", camerasDeleted);

                setSelectedImages([]);
            } catch (err) {
                console.error("Error deleting images:", err);
                showToast("error", "Failed to delete selected images");
            }
        }, [selectedImages, compModelVerInfo]);


        // Delete a single image
        const remotedeleteImageClick = useCallback(async (img) => {
            try {
                const formData = new FormData();
                formData.append("comp_id", compModelVerInfo[0].comp_id);
                formData.append("stage_id", compModelVerInfo[0].stage_id);
                formData.append("model_id", compModelVerInfo[0].model_id);
                formData.append("camera_label", img.camera_label);
                formData.append("filename", img.filename);

                const response = await urlSocket.post("/deleteRemoteImage", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                if (response.data.error)
                    return console.error("Delete error:", response.data.error);

                // Update gallery state per camera
                // setRemoteGallery((prev) => {

                setRemoteGallery((prev) => {
                    if (!prev) return {};

                    const updated = { ...prev };
                    const newCounts = {};

                    // compute cameraKey from img.camera_label
                    const cameraKey = normalizeCameraKey(img.camera_label);
                    const filename = img.filename;

                    if (updated[cameraKey]) {
                        updated[cameraKey] = updated[cameraKey].filter(
                            (i) => i.filename !== filename
                        );
                        if (updated[cameraKey].length === 0) {
                            delete updated[cameraKey];
                        }
                    }

                    // update counts inline
                    Object.entries(updated).forEach(([k, imgs]) => {
                        newCounts[k] = imgs.length;
                    });
                    setCameraCaptureCounts(newCounts);

                    return { ...updated };
                });




                setSelectedImages((prev) =>
                    prev.filter((i) => i.filename !== img.filename)
                );

                showToast("success", "Image deleted successfully", img);
            } catch (err) {
                console.error("Error deleting image:", err);
                showToast("error", "Failed to delete image", img);
            }
        }, []);


        const getBase64FromUrl = useCallback(async (url) => {
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
                const blob = await res.blob();
                return await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result.split(",")[1]); // base64 only
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } catch (err) {
                console.error("getBase64FromUrl error:", err);
                return null;
            }
        }, []);







        const handleSend = useCallback(
            async (status = "OK") => {
                try {
                    if (!cameraList || cameraList.length === 0) {
                        Swal.fire("Error", "No cameras available", "error");
                        return;
                    }

                    let selectedCamera =
                        cameraList.find((cam) => cam.originalLabel === selectedCameraLabel) ||
                        cameraList[0]; // fallback to first camera

                    if (!selectedCamera) {
                        Swal.fire("Error", "No camera selected or found", "error");
                        return;
                    }

                    // ✅ Ensure there are images to send
                    if (!selectedImages || selectedImages.length === 0) {
                        Swal.fire("Error", "No images to send", "error");
                        return;
                    }

                    const compModelInfo = JSON.parse(sessionStorage.getItem("compModelData")) || {};

                    // ✅ Build datasets payload with correct camera_label
                    const datasetsPayload = selectedImages.map((img, idx) => ({
                        camera_label: img.camera_label || selectedCamera.originalLabel,
                        filename: img.filename || `capture_${Date.now()}_${idx}.png`,
                        local_path: img.local_path,
                        model_name: selectedCamera.model_name,
                        model_ver: selectedCamera.model_ver,
                        type: status,
                        width: img.width || img.img_width,
                        height: img.height || img.img_height
                    }));

                    console.log("datasetsPayload :>> ", datasetsPayload);

                    // ✅ Build payload for backend
                    const payload = {
                        stage_id: selectedCamera.stage_id,
                        status,
                        stageInfo: {
                            _id: selectedCamera._id,
                            comp_id: selectedCamera.comp_id,
                            comp_name: compModelInfo.comp_name || "",
                            comp_code: compModelInfo.comp_code || "",
                            stage_id: selectedCamera.stage_id,
                            stage_name: compModelInfo.stage_name || "",
                            stage_code: compModelInfo.stage_code || "",
                            comp_stg_model_id: selectedCamera.comp_stg_model_id,
                            model_id: selectedCamera.model_id,
                            model_ver: selectedCamera.model_ver,
                            model_name: selectedCamera.model_name
                        },
                        datasets: datasetsPayload
                    };

                    // ✅ Send to backend
                    const res = await urlSocket.post("/RemoteAccess_Gallery_Imageshare", payload);

                    Swal.fire("Success", "Images shared successfully!", "success");

                    // ✅ Clear selected images
                    setSelectedImages([]);

                    // ✅ Remove sent images from gallery
                    setRemoteGallery((prev) => {
                        if (!prev) return {};

                        const updated = { ...prev };
                        datasetsPayload.forEach((ds) => {
                            const key = normalizeCameraKey(ds.camera_label);
                            if (updated[key]) {
                                updated[key] = updated[key].filter((img) => img.filename !== ds.filename);
                                if (updated[key].length === 0) delete updated[key];
                            }
                        });

                        return updated;
                    });

                    console.log("Response:", res.data);
                } catch (error) {
                    console.error("handleSend error:", error);
                    Swal.fire("Error", "Failed to share images", "error");
                }
            },
            [selectedImages, selectedCameraLabel, cameraList]
        );




        const ImageCard = React.memo(({ img, idx, displayName, isSelected }) => (
            <Col sm={3} md={3} key={idx}>
                <Card style={{ borderRadius: "7px", marginBottom: "10px" }}>
                    <CardBody
                        style={{
                            padding: "7px",
                            border: isSelected ? "2px solid red" : "2px solid green",
                            borderRadius: "7px",
                        }}
                    >
                        <div
                            style={{
                                fontWeight: "bold",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "5px",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <Checkbox checked={isSelected} onChange={() => handleCheckboxChange(img)} />
                                <span style={{ fontSize: "12px" }}>#{idx + 1}</span>
                            </div>

                            <Popconfirm
                                placement="rightBottom"
                                title="Do you want to delete?"
                                onConfirm={() => remotedeleteImageClick(img)}
                                okText="Yes"
                            >
                                <DeleteTwoTone twoToneColor="red" style={{ fontSize: "16px", cursor: "pointer" }} />
                            </Popconfirm>
                        </div>

                        <img src={showImage(img)} alt={img.filename} style={{ width: "100%", borderRadius: "3px" }} />




                        <div style={{ fontSize: "10px", marginTop: "5px" }}>
                            <div style={{ color: "#666" }}>Camera: {displayName}</div>
                            <div style={{ color: "#888", fontSize: "9px" }}>
                                {new Date(img.date?.$date || img.date).toLocaleString()}
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </Col>
        ));

        ImageCard.displayName = "ImageCard";
        ImageCard.displayName = "ImageCard";
        ImageCard.propTypes = {
            img: PropTypes.shape({
                camera_label: PropTypes.string.isRequired,
                filename: PropTypes.string.isRequired,
                s3_path: PropTypes.string,
                image_path: PropTypes.string,

                width: PropTypes.number,
                height: PropTypes.number,
                date: PropTypes.oneOfType([
                    PropTypes.string,
                    PropTypes.shape({ $date: PropTypes.string })
                ]),
                model_name: PropTypes.string,
                model_ver: PropTypes.number
            }).isRequired,
            idx: PropTypes.number.isRequired,
            displayName: PropTypes.string.isRequired,
            isSelected: PropTypes.bool.isRequired
        };

        return (
            <div>
                <div className="d-flex justify-content-between align-items-center flex-wrap my-2">
                    <div className="d-flex gap-2 flex-wrap">
                        {Object.keys(imagesByCamera).map((cameraKey) => {
                            const displayName = cameraKey.replace(/_/g, " ");
                            return (
                                <Button
                                    key={cameraKey}
                                    size="sm"
                                    color={remotecameraFilter === cameraKey ? "primary" : "outline-primary"}
                                    onClick={() => remotesetCameraFilter(cameraKey)}
                                >
                                    {displayName}
                                </Button>
                            );
                        })}
                    </div>

                    {/* Send buttons */}
                    <div className="d-flex gap-2">
                        <Button style={{ backgroundColor: "green", color: "white", width: "100px", height: "30px" }} onClick={() => handleSend("OK")}>
                            Send to OK
                        </Button>
                        <Button style={{ backgroundColor: "red", color: "white", width: "100px", height: "30px" }} onClick={() => handleSend("NG")}>
                            Send to NG
                        </Button>
                    </div>
                </div>

                {/* Delete Selected */}
                {selectedImages.length > 0 && (
                    <div className="d-flex justify-content-start my-2">
                        <Button style={{ backgroundColor: "darkred", color: "white" }} onClick={handleDeleteSelected}>
                            Delete Selected  ({selectedImages.length})
                        </Button>
                    </div>
                )}

                {console.log('selectedImages :>> ', selectedImages)}

                {/* Images for selected camera */}
                {Object.entries(imagesByCamera)
                    .filter(([cameraKey]) => remotecameraFilter && cameraKey === remotecameraFilter)
                    .map(([cameraKey, images], idx) => {
                        const displayName = cameraKey.replace(/_/g, " ");
                        const isOnline = newAvailableCameras.some((c) => c.label === displayName);

                        return (
                            <div key={idx} className="mb-4">
                                <div
                                    className="d-flex justify-content-between align-items-center mb-2 p-2"
                                    style={{
                                        backgroundColor: "#f8f9fa",
                                        borderRadius: "5px",
                                        border: `2px solid ${isOnline ? "#28a745" : "#dc3545"}`,
                                    }}
                                >
                                    <div className="d-flex align-items-center">
                                        <span className={`badge ${isOnline ? "badge-success" : "badge-danger"} me-2`}>
                                            {isOnline ? "🟢" : "🔴"}
                                        </span>
                                        <h6 className="mb-0" style={{ fontWeight: "bold" }}>{displayName}</h6>
                                    </div>

                                    <div className="d-flex align-items-center gap-2">
                                        <span className="badge badge-secondary">{images.length} images</span>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <Checkbox
                                                checked={images.every((img) => selectedImages.includes(img))}
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    if (isChecked) {
                                                        setSelectedImages((prev) => [...new Set([...prev, ...images])]);
                                                    } else {
                                                        setSelectedImages((prev) => prev.filter((sel) => !images.includes(sel)));
                                                    }
                                                }}
                                            />
                                            <small>Select All</small>
                                        </div>
                                    </div>
                                </div>

                                <Row>
                                    {images.map((img, i) => (
                                        <ImageCard key={i} img={img} idx={i} displayName={displayName} isSelected={selectedImages.includes(img)} />
                                    ))}
                                </Row>
                            </div>
                        );
                    })}
            </div>
        );
    };






    const showImage = (output_img) => {
        console.log("output_img", output_img);

        let pathToUse;

        if (typeof output_img === "string") {
            pathToUse = output_img;
        } else if (Array.isArray(output_img)) {
            pathToUse = output_img[0];
        } else if (typeof output_img === "object" && !Array.isArray(output_img)) {
            if (selectedCameraLabel) {
                const selectedCamera = cameraList.find(
                    (cam) => cam.originalLabel === selectedCameraLabel
                );
                if (selectedCamera) {
                    const normalizedLabel = selectedCamera.label
                        .trim()
                        .toLowerCase()
                        .replace(/\s+/g, "_");
                    pathToUse = output_img[normalizedLabel];
                }
            }
            if (!pathToUse) {
                pathToUse = Object.values(output_img)[0];
            }
        }

        if (!pathToUse) {
            console.warn("No valid path found in output_img:", output_img);
            return "";
        }

        // ✅ Remove leading Vs_inspection/ if ImageUrl already contains it
        if (pathToUse.startsWith("Vs_inspection/")) {
            pathToUse = pathToUse.replace(/^Vs_inspection\//, "");
        }

        // Encode spaces and other special characters
        const encodedPath = encodeURI(pathToUse);

        const finalUrl = `${ImageUrl}${encodedPath}?t=${Date.now()}`;
        console.log("Image loaded successfully:", finalUrl);

        return finalUrl;
    };

    const setVersionData = (value) => {
        const show_train_image = value?.sift_train_datasets?.length > 0 ? true : false;
        setCompModelVerInfo([value]);
        setShowTrainImage(show_train_image);
    };

    const changeShowTrainImages = (data) => {
        const value = data === 0 ? false : true;
        setShowTrainImage(value);
    };

    const imageSelectAll = (e) => {
        const isChecked = e.target.checked;

        const selectedVersions = selectedList.map((ver) => ver.value);
        const isNoVerSelected = selectedVersions.length === 0;
        const largeSet = new Set(selectedVersions);

        const checkIfAnyExist = (smallArray) =>
            isNoVerSelected || smallArray.some((num) => largeSet.has(num));

        const updatedGallery = imgGlr.map((imgVal) => {
            if (
                imgVal.imagePathType[0].type !== labelName ||
                imgVal.used_model_ver.includes(compModelVerInfo[0].model_ver)
            ) {
                return imgVal;
            }

            return checkIfAnyExist(imgVal.used_model_ver)
                ? { ...imgVal, checked: isChecked }
                : imgVal;
        });

        setImgGlr(updatedGallery);
    };

    const getImgPath = (img_path) => {
        return ImageUrl + img_path;
    };

    const showOtherVersionImages = () => {
        const selectedVersions = new Set(selectedList.map((ver) => ver.value));
        const isNoVerSelected = selectedVersions.size === 0;
        const currentVersion = compModelVerInfo[0].model_ver;

        const checkIfAnyExist = (usedVersions) =>
            isNoVerSelected || usedVersions.some((num) => selectedVersions.has(num));

        let allImageCount = 0;
        let selectedCount = 0;

        const filteredImages = imgGlr.filter((imgVal) => {
            if (imgVal.imagePathType[0].type !== labelName) return false;
            if (!checkIfAnyExist(imgVal.used_model_ver)) return false;
            if (imgVal.used_model_ver.length === 1 && imgVal.used_model_ver.includes(currentVersion)) return false;

            allImageCount++;

            if (imgVal.used_model_ver.includes(currentVersion) || imgVal.checked) {
                selectedCount++;
            }

            return true;
        });

        const isAllChecked = allImageCount > 0 && allImageCount === selectedCount;

        return (
            <>
                <div className="d-flex justify-content-between my-2">
                    <h5 className="fw-bold">Other Versions</h5>
                    <Button color="primary" className="btn btn-sm w-sm" onClick={shareImgData} disabled={isSharing}>
                        {isSharing ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Sharing...
                            </>
                        ) : (
                            'Share'
                        )}
                    </Button>
                </div>
                <FormGroup check className="d-flex align-items-center gap-2 my-2">
                    <Input
                        type="checkbox"
                        id="customCheckbox"
                        checked={isAllChecked}
                        onChange={imageSelectAll}
                        className="custom-control-input"
                    />
                    <Label
                        for="customCheckbox"
                        className="fw-bold my-auto"
                        style={{ cursor: "pointer", userSelect: "none" }}
                    >
                        Select All
                    </Label>
                </FormGroup>
                <Row className="scroll-design" style={{ height: "70vh", overflowY: "auto" }}>
                    {filteredImages.map((imgVal, imgId) => {
                        const isCurrentVersion = imgVal.used_model_ver.includes(currentVersion);
                        return (
                            <Col md={3} lg={3} key={imgId}>
                                <Draggable type="dragdrop" data={JSON.stringify(imgVal)}>
                                    <Card
                                        style={{
                                            borderRadius: "7px",
                                            border: `2px solid ${isCurrentVersion ? "red" : "green"}`,
                                            background: isCurrentVersion ? "pink" : "transparent",
                                        }}
                                    >
                                        <FormGroup check className="d-flex align-items-center gap-2 mb-2 ms-2">
                                            <Input
                                                type="checkbox"
                                                id={`${imgVal.filename}-${imgId}`}
                                                name={imgVal.filename}
                                                checked={isCurrentVersion || !!imgVal.checked}
                                                onChange={(e) => !isCurrentVersion && handleChange(e)}
                                                className="custom-control-input"
                                            />
                                            <Label
                                                for={`${imgVal.filename}-${imgId}`}
                                                className="fw-bold my-auto"
                                                style={{ cursor: "pointer", userSelect: "none" }}
                                            >
                                                Select
                                            </Label>
                                        </FormGroup>
                                        <Image src={showImage(imgVal.imagePathType[0].image_path)} alt="image not loaded" />
                                        <p className="fw-bold ms-2 mt-2">
                                            {`Used In: ${imgVal.used_model_ver.join(", ")}`}
                                        </p>
                                    </Card>
                                </Draggable>
                            </Col>
                        );
                    })}
                </Row>
            </>
        );
    };

    const errorHandler = (error) => {
        sessionStorage.removeItem("authUser");
        history.push("/login");
    };

    // Render helper functions
    const marks = {
        0: <Tooltip title="Min">0</Tooltip>,
        1: <Tooltip title="Max">1</Tooltip>,
    };

    const marks1 = {
        0: 0,
        200: 200
    };



    const videoConstraints = {
        height: DEFAULT_RESOLUTION.height,
        width: DEFAULT_RESOLUTION.width,
        facingMode: "user"
    };

    let diffVal = uniqueModelVersions
        ? uniqueModelVersions
            .filter(ver => ver !== compModelVerInfo[0]?.model_ver)
            .map(number => ({ label: `Version ${number}`, value: number }))
        : [];

    // Ensure only unique cameras by label
    const uniqueCameras = cameraList.filter(
        (cam, index, self) =>
            index === self.findIndex((c) => c.originalLabel === cam.originalLabel)
    );


    return (
        <>
            <div className='page-content'>
                <MetaTags>
                    <title>Component Information</title>
                </MetaTags>
                <Breadcrumbs
                    title="MODEL CREATION"
                    isBackButtonEnable={!isSharing}
                    gotoBack={back}
                />
                <Container fluid>
                    <Card>
                        <CardBody>

                            <Row className="d-flex flex-wrap justify-content-start align-items-center gap-3 mb-2">
                                <Col xs="12" lg="auto">
                                    <CardTitle className="mb-0">
                                        <span className="me-2 font-size-12">Stage Name :</span>{compName}
                                    </CardTitle>
                                </Col>
                                <Col xs="12" lg="auto">
                                    <CardText className="mb-0">
                                        <span className="me-2 font-size-12">Stage Code :</span>{compCode}
                                    </CardText>
                                </Col>
                                <Col xs="12" lg="auto">
                                    <CardText className="mb-0">
                                        <span className="me-2 font-size-12">Model Name :</span>{modelName}
                                    </CardText>
                                </Col>
                                <Col xs="12" lg="auto">
                                    <CardText className="mb-0">
                                        <span className="me-2 font-size-12">Type :</span>{type}
                                    </CardText>
                                </Col>
                            </Row>

                            {
                                modelVersionLoading ?
                                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                                        <Spinner color="primary" />
                                        <h5 className="mt-4">
                                            <strong>Loading Model Version Details...</strong>
                                        </h5>
                                    </div>
                                    :
                                    <>
                                        <Row>
                                            <Col lg={6} >
                                                <Label style={{ fontWeight: 'bold' }}>Similarity Adjustment </Label>
                                                <Slider min={0.00} max={1.00} step={0.01} value={rangeValue}
                                                    tooltip={{ open: true, placement: 'top', overlayStyle: { zIndex: 1000 } }}
                                                    onChange={similarityChange} marks={marks}
                                                />
                                            </Col>
                                            {/* Image Rotation */}
                                            {
                                                activeTab !== '2' && position !== 'Fixed' && type !== 'ML' &&
                                                <Col lg={3} >
                                                    <Checkbox style={{
                                                        borderColor: 'slategray', borderWidth: '2px', borderStyle: 'solid', borderRadius: '7px', height: '20px',
                                                        width: '20px'
                                                    }}
                                                        onChange={(e) => rotation(e)}
                                                        checked={imgRotation}
                                                    />
                                                    <Label style={{ fontWeight: 'bold', marginLeft: '5px' }}>Image rotation </Label>
                                                    <Row>
                                                        <Col lg={6}>
                                                            <input
                                                                type='number'
                                                                className="form-control"
                                                                placeholder='Enter No.Of.Rotations'
                                                                value={noOfRotation}
                                                                onChange={(e) => rotationUpdate(e.target.value)}
                                                                disabled={imgRotation === false}
                                                                min={1}
                                                                max={100}
                                                            />
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            }
                                        </Row>


                                        <div className="d-flex justify-content-end mb-2">
                                            {/* <Button
                                                color="primary"
                                                disabled={selectedRows.length === 0}
                                                onClick={handleTrainSelected}
                                            >
                                                Train Selected
                                            </Button> */}
                                            <Button
                                                // color="primary"
                                                color={selectionMode === 'admin_test' ? 'success' : 'primary'}
                                                disabled={selectedRows.length === 0}
                                                onClick={handleTrainSelected}
                                            >
                                                {selectionMode === 'admin_test' ? 'Start Admin Test for Selected' : 'Train Selected'}
                                            </Button>
                                        </div>
                                        {/* version data in Table */}
                                        {
                                            refersh ?
                                                <div className='table-responsive mt-2 mb-4'>
                                                    <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th>Select Training</th>
                                                                <th>Model Version</th>
                                                                <th>Model Status</th>
                                                                <th>Created on</th>
                                                                <th>Camera</th>

                                                                <th>Approved on</th>
                                                                <th>Live on</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {
                                                                console.log('compModelVerInfo', compModelVerInfo)
                                                            }
                                                            {compModelVerInfo.map((data, index) => {
                                                                let okCount = [];
                                                                let notokCount = [];
                                                                if (data.type === 'DL') {
                                                                    okCount = data.datasets.filter((dataset) => dataset.type === 'OK').length;
                                                                    notokCount = data.datasets.filter((dataset) => dataset.type === 'NG').length;
                                                                    okCount1 = okCount;
                                                                    notokCount1 = notokCount;
                                                                }

                                                                const isInactive = data.model_status === 'Inactive';
                                                                const isTrainingInProgress = data.training_status === 'training_in_progress';
                                                                const isApprovedTrainedModel = (data.training_status === 'admin approved trained model' && data.model_status !== 'Live');
                                                                const isTrainingCompleted = data.training_status === 'training completed';
                                                                const isRetrain = data.training_status === 'training_queued';
                                                                const isTrainingNotStarted = data.training_status === 'training_not_started';
                                                                const isAdminAccuracyInProgress = data.training_status === 'admin accuracy testing in_progress';
                                                                const isDl = data.type !== 'ML';

                                                                const allCamerasTrained =
                                                                    data.camera_training_status &&
                                                                    data.camera_training_status.length > 0 &&
                                                                    data.camera_training_status.every(
                                                                        (cam) => cam.result === 'training completed' && cam.training_status === 'completed'
                                                                    );

                                                                return (
                                                                    <tr key={index} id='recent-list'>
                                                                        {/* <td style={{ backgroundColor: "white" }}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={selectedRows.some((item) => item._id === data._id)}
                                                                                onChange={() => handleSelectRow(data._id, data)}
                                                                            />
                                                                        </td> */}
                                                                        {/* <td style={{ backgroundColor: "white" }}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={selectedRows.some((item) => item._id === data._id)}
                                                                                onChange={() => handleSelectRow(data._id, data)}
                                                                                disabled={isCheckboxDisabled(data)}
                                                                                style={{
                                                                                    opacity: isCheckboxDisabled(data) ? 0.5 : 1,
                                                                                    cursor: isCheckboxDisabled(data) ? 'not-allowed' : 'pointer'
                                                                                }}
                                                                            />
                                                                        </td> */}
                                                                        {/* <td style={{ backgroundColor: "white" }}>
                                                                            {(() => {


                                                                                if (isTrainingInProgress || !isTrainingNotStarted) return null;

                                                                                const { result_mode } = compModelVerInfo[0];
                                                                                const minOk = Number(config[0]?.min_ok_for_training);
                                                                                const minNotOk = Number(config[0]?.min_notok_for_training);

                                                                                const canTrain =
                                                                                    (result_mode === "both" && okCount >= minOk && notokCount >= minNotOk) ||
                                                                                    (result_mode === "ng" && notokCount >= minNotOk) ||
                                                                                    (result_mode === "ok" && okCount >= minOk);
                                                                                console.log('canTrain', canTrain)
                                                                                // Define which training statuses should show checkboxes
                                                                                const showCheckboxFor = [
                                                                                    'training_not_started',
                                                                                    'training_in_progress',
                                                                                    'training_queued',
                                                                                    'training completed'
                                                                                ];

                                                                                // Only show checkbox if the row has a training status that needs it
                                                                                if (showCheckboxFor.includes(data.training_status)) {
                                                                                    return (
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={selectedRows.some((item) => item._id === data._id)}
                                                                                            onChange={() => handleSelectRow(data._id, data)}
                                                                                            disabled={isCheckboxDisabled(data)}
                                                                                            style={{
                                                                                                opacity: isCheckboxDisabled(data) ? 0.5 : 1,
                                                                                                cursor: isCheckboxDisabled(data) ? 'not-allowed' : 'pointer'
                                                                                            }}
                                                                                        />
                                                                                    );
                                                                                }

                                                                                // Return empty space or dash for non-training rows
                                                                                return <span>-</span>;
                                                                            })()}
                                                                        </td> */}


                                                                        {/* <td style={{ backgroundColor: "white" }}>
                                                                            {(data.training_status === 'training_not_started' ||
                                                                                data.training_status === 'training_queued' ||
                                                                                data.training_status === 'training completed') ? (
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={selectedRows.some((item) => item._id === data._id)}
                                                                                    onChange={() => handleSelectRow(data._id, data)}
                                                                                    disabled={isCheckboxDisabled(data)}
                                                                                />
                                                                            ) : (
                                                                                <span>-</span>
                                                                            )}
                                                                        </td> */}

                                                                        <td style={{ backgroundColor: "white" }}>
                                                                            {(() => {
                                                                                const { result_mode } = compModelVerInfo[0];
                                                                                const minOk = Number(config[0]?.min_ok_for_training);
                                                                                const minNotOk = Number(config[0]?.min_notok_for_training);

                                                                                const canTrain =
                                                                                    (result_mode === "both" && okCount >= minOk && notokCount >= minNotOk) ||
                                                                                    (result_mode === "ng" && notokCount >= minNotOk) ||
                                                                                    (result_mode === "ok" && okCount >= minOk);

                                                                                console.log('canTrain', canTrain);

                                                                                // Show checkbox only for specific training statuses AND if canTrain is true
                                                                                if ((data.training_status === 'training_not_started' ||
                                                                                    data.training_status === 'training_queued' ||
                                                                                    data.training_status === 'training completed') && canTrain) {
                                                                                    return (
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={selectedRows.some((item) => item._id === data._id)}
                                                                                            onChange={() => handleSelectRow(data._id, data)}
                                                                                            disabled={isCheckboxDisabled(data)}
                                                                                        />
                                                                                    );
                                                                                }

                                                                                return <span>-</span>;
                                                                            })()}
                                                                        </td>
                                                                        <td style={{ backgroundColor: "white" }}>{'V'}{data.model_ver}</td>
                                                                        <td style={{ backgroundColor: "white" }}>
                                                                            <span className={data.model_status === 'Live' ? 'badge badge-soft-success' : data.model_status === 'Approved' ? 'badge badge-soft-warning' : data.model_status === 'Draft' ? 'badge badge-soft-info' : 'badge badge-soft-danger'}>
                                                                                {data.model_status}
                                                                            </span>
                                                                        </td>
                                                                        <td style={{ backgroundColor: "white" }}>{data.created_on}</td>
                                                                        <td style={{ backgroundColor: "white" }}>{data.camera.label}</td>
                                                                        <td style={{ backgroundColor: "white" }}>{data.approved_on}</td>
                                                                        <td style={{ backgroundColor: "white" }}>{data.live_on}</td>
                                                                        {/* <td style={{ backgroundColor: "white", fontSize: '18px' }} >
                                                                            <div className="d-flex align-items-start flex-wrap gap-2">
                                                                                <>
                                                                                    <Button color="primary" className='btn btn-sm me-2' onClick={() => togXlarge()} data-toggle="modal" data-target=".bs-example-modal-xl" id={`log-${data._id}`}>
                                                                                        Log Info
                                                                                    </Button>
                                                                                    <UncontrolledTooltip placement="top" target={`log-${data._id}`}>
                                                                                        Log Info
                                                                                    </UncontrolledTooltip>
                                                                                </>

                                                                                {isInactive && (
                                                                                    <Button style={{ backgroundColor: 'green', color: 'white' }} onClick={() => activateModel(data, index)}>
                                                                                        Activate
                                                                                    </Button>
                                                                                )}


                                                                                {


                                                                                    !(data.type === 'ML') &&
                                                                                    !showTrainingINProgs &&
                                                                                    !isInactive &&
                                                                                    !isTrainingInProgress && (
                                                                                        allCamerasTrained ? (
                                                                                            <Button
                                                                                                className="btn btn-sm"
                                                                                                color="success"
                                                                                                onClick={() => startAdminTest(data)}
                                                                                            >
                                                                                                Start Admin Accuracy Test
                                                                                            </Button>
                                                                                        ) : (() => {
                                                                                            if (isTrainingInProgress || !isTrainingNotStarted) return null;

                                                                                            const { result_mode } = compModelVerInfo[0];
                                                                                            const minOk = Number(config[0]?.min_ok_for_training);
                                                                                            const minNotOk = Number(config[0]?.min_notok_for_training);

                                                                                            const canTrain =
                                                                                                (result_mode === "both" && okCount >= minOk && notokCount >= minNotOk) ||
                                                                                                (result_mode === "ng" && notokCount >= minNotOk) ||
                                                                                                (result_mode === "ok" && okCount >= minOk);


                                                                                            return canTrain ? (
                                                                                                <Button
                                                                                                    className="btn btn-sm"
                                                                                                    color="primary"
                                                                                                    onClick={() => train(data)}
                                                                                                >
                                                                                                    Train
                                                                                                </Button>
                                                                                            ) : null;
                                                                                        })()
                                                                                    )

                                                                                }

                                                                                {isAdminAccuracyInProgress && !showTrainingINProgs && !isTrainingInProgress && (
                                                                                    <div>
                                                                                        <p>Admin Accuracy Testing In_Progress</p>
                                                                                        <Button className='btn btn-sm' color="success" onClick={() => startAdminTest(data)}>
                                                                                            Continue
                                                                                        </Button>
                                                                                    </div>
                                                                                )}

                                                                                {
                                                                                    (!(position === 'Fixed' && regionSelection === true)) ?
                                                                                        showTrainingINProgs && (
                                                                                            <div>
                                                                                                <Row className="col-lg-6">
                                                                                                    {data.training_status_id === 0 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="primary" value={100} animated>Loading...</Progress></Progress>}
                                                                                                    {data.training_status_id === 1 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={20}>20%</Progress><Progress bar color="primary" value={80} animated></Progress></Progress>}
                                                                                                    {data.training_status_id === 2 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={40}>40%</Progress><Progress bar color="primary" value={60} animated></Progress></Progress>}
                                                                                                    {data.training_status_id === 3 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={60}>60%</Progress><Progress bar color="primary" value={40} animated></Progress></Progress>}
                                                                                                    {data.training_status_id === 4 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={80}>80%</Progress><Progress bar color="primary" value={20} animated></Progress></Progress>}
                                                                                                    {data.training_status_id === 5 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={100}>100%</Progress></Progress>}
                                                                                                    <div style={{ 'textAlign': 'center' }}>{data.training_start_time ? clock(data.training_start_time) : 'Training started ...'}</div>
                                                                                                    <div className='loading-content'>
                                                                                                        Training In Progress
                                                                                                        <div className="dot-loader">
                                                                                                            <div className="dot"></div>
                                                                                                            <div className="dot"></div>
                                                                                                            <div className="dot"></div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </Row>
                                                                                            </div>
                                                                                        )
                                                                                        :
                                                                                        showTrainingINProgs && data?.training_status !== 'training_queued' && (
                                                                                            <div>
                                                                                                <Row className='d-flex flex-column'>
                                                                                                    <div style={{ 'textAlign': 'start' }}>{data.training_start_time ? clock(data.training_start_time) : 'Training started ...'}</div>
                                                                                                    <div className='loading-content'>Training In Progress<div className="dot-loader"><div className="dot"></div><div className="dot"></div></div></div>


                                                                                                    {data?.rectangles &&
                                                                                                        Object.values(data.rectangles).map((position, posIndex) => (
                                                                                                            <div key={posIndex} className="d-flex flex-column">
                                                                                                                {Object.values(position).map((region, region_id) => (
                                                                                                                    <div key={region.id} className="d-flex flex-column">
                                                                                                                        <h5>{region_id + 1}. {region.name}</h5>
                                                                                                                        <Row>
                                                                                                                            {region.training_status_id === 0 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}>
                                                                                                                                <Progress bar color="primary" value={100} animated>Loading...</Progress>
                                                                                                                            </Progress>}
                                                                                                                            {region.training_status_id === 1 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}>
                                                                                                                                <Progress bar color="success" value={20}>20%</Progress>
                                                                                                                                <Progress bar color="primary" value={80} animated></Progress>
                                                                                                                            </Progress>}
                                                                                                                            {region.training_status_id === 2 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}>
                                                                                                                                <Progress bar color="success" value={40}>40%</Progress>
                                                                                                                                <Progress bar color="primary" value={60} animated></Progress>
                                                                                                                            </Progress>}
                                                                                                                            {region.training_status_id === 3 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}>
                                                                                                                                <Progress bar color="success" value={60}>60%</Progress>
                                                                                                                                <Progress bar color="primary" value={40} animated></Progress>
                                                                                                                            </Progress>}
                                                                                                                            {region.training_status_id === 4 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}>
                                                                                                                                <Progress bar color="success" value={80}>80%</Progress>
                                                                                                                                <Progress bar color="primary" value={20} animated></Progress>
                                                                                                                            </Progress>}
                                                                                                                            {region.training_status_id === 5 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}>
                                                                                                                                <Progress bar color="success" value={100}>100%</Progress>
                                                                                                                            </Progress>}
                                                                                                                        </Row>
                                                                                                                    </div>
                                                                                                                ))}
                                                                                                            </div>
                                                                                                        ))
                                                                                                    }
                                                                                                    <div className='d-flex flex-column'>
                                                                                                        <h5>Component</h5>
                                                                                                        <Row>
                                                                                                            {data.training_status_id === 0 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="primary" value={100} animated>Loading...</Progress></Progress>}
                                                                                                            {data.training_status_id === 1 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={20}>20%</Progress><Progress bar color="primary" value={80} animated></Progress></Progress>}
                                                                                                            {data.training_status_id === 2 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={40}>40%</Progress><Progress bar color="primary" value={60} animated></Progress></Progress>}
                                                                                                            {data.training_status_id === 3 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={60}>60%</Progress><Progress bar color="primary" value={40} animated></Progress></Progress>}
                                                                                                            {data.training_status_id === 4 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={80}>80%</Progress><Progress bar color="primary" value={20} animated></Progress></Progress>}
                                                                                                            {data.training_status_id === 5 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={100}>100%</Progress></Progress>}
                                                                                                        </Row>
                                                                                                    </div>
                                                                                                </Row>
                                                                                            </div>
                                                                                        )
                                                                                }
                                                                                {
                                                                                    isRetrain &&
                                                                                    <div>
                                                                                        <Row>
                                                                                            <Progress multi style={{ height: '17px', fontWeight: 'bold' }}>
                                                                                                <Progress bar color="primary" value={100} animated>
                                                                                                    Training In Queue
                                                                                                </Progress>
                                                                                            </Progress>
                                                                                        </Row>
                                                                                    </div>
                                                                                }
                                                                            </div>
                                                                        </td> */}

                                                                        <td style={{ backgroundColor: "white", fontSize: "18px" }}>
                                                                            <div className="d-flex align-items-start flex-wrap gap-2">
                                                                                {/* Log Info Button */}
                                                                                <>
                                                                                    <Button
                                                                                        color="primary"
                                                                                        className="btn btn-sm me-2"
                                                                                        onClick={() => togXlarge()}
                                                                                        data-toggle="modal"
                                                                                        data-target=".bs-example-modal-xl"
                                                                                        id={`log-${data._id}`}
                                                                                    >
                                                                                        Log Info
                                                                                    </Button>
                                                                                    <UncontrolledTooltip placement="top" target={`log-${data._id}`}>
                                                                                        Log Info
                                                                                    </UncontrolledTooltip>
                                                                                </>

                                                                                {/* Activate */}
                                                                                {isInactive && (
                                                                                    <Button
                                                                                        style={{ backgroundColor: "green", color: "white" }}
                                                                                        onClick={() => activateModel(data, index)}
                                                                                    >
                                                                                        Activate
                                                                                    </Button>
                                                                                )}

                                                                                {/* Train / Admin Accuracy Test */}
                                                                                {!(data.type === "ML") &&
                                                                                    !isInactive &&
                                                                                    !isTrainingInProgress &&
                                                                                    !isRetrain &&
                                                                                    (allCamerasTrained ? (
                                                                                        <Button
                                                                                            className="btn btn-sm"
                                                                                            color="success"
                                                                                            onClick={() => startAdminTest(data)}
                                                                                        >
                                                                                            Start Admin Accuracy Test
                                                                                        </Button>
                                                                                    ) : (() => {
                                                                                        if (isTrainingInProgress || !isTrainingNotStarted) return null;

                                                                                        const { result_mode } = compModelVerInfo[0];
                                                                                        const minOk = Number(config[0]?.min_ok_for_training);
                                                                                        const minNotOk = Number(config[0]?.min_notok_for_training);

                                                                                        const canTrain =
                                                                                            (result_mode === "both" &&
                                                                                                okCount >= minOk &&
                                                                                                notokCount >= minNotOk) ||
                                                                                            (result_mode === "ng" && notokCount >= minNotOk) ||
                                                                                            (result_mode === "ok" && okCount >= minOk);

                                                                                        return canTrain ? (
                                                                                            <Button
                                                                                                className="btn btn-sm"
                                                                                                color="primary"
                                                                                                onClick={() => train(data)}
                                                                                            >
                                                                                                Train
                                                                                            </Button>
                                                                                        ) : null;
                                                                                    })())}

                                                                                {/* Admin Accuracy Test In Progress */}
                                                                                {isAdminAccuracyInProgress && !isTrainingInProgress && (
                                                                                    <div>
                                                                                        <p>Admin Accuracy Testing In_Progress</p>
                                                                                        <Button
                                                                                            className="btn btn-sm"
                                                                                            color="success"
                                                                                            onClick={() => startAdminTest(data)}
                                                                                        >
                                                                                            Continue
                                                                                        </Button>
                                                                                    </div>
                                                                                )}

                                                                                {/* Training In Progress */}
                                                                                {isTrainingInProgress && (
                                                                                    <Row className="col-lg-6">
                                                                                        {data.training_status_id === 0 && (
                                                                                            <Progress multi style={{ height: "17px", fontWeight: "bold" }}>
                                                                                                <Progress bar color="primary" value={100} animated>
                                                                                                    Loading...
                                                                                                </Progress>
                                                                                            </Progress>
                                                                                        )}
                                                                                        {data.training_status_id === 1 && (
                                                                                            <Progress multi style={{ height: "17px", fontWeight: "bold" }}>
                                                                                                <Progress bar color="success" value={20}>
                                                                                                    20%
                                                                                                </Progress>
                                                                                                <Progress bar color="primary" value={80} animated></Progress>
                                                                                            </Progress>
                                                                                        )}

                                                                                        {data.training_status_id === 2 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={40}>40%</Progress><Progress bar color="primary" value={60} animated></Progress></Progress>}
                                                                                        {data.training_status_id === 3 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={60}>60%</Progress><Progress bar color="primary" value={40} animated></Progress></Progress>}
                                                                                        {data.training_status_id === 4 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={80}>80%</Progress><Progress bar color="primary" value={20} animated></Progress></Progress>}
                                                                                        {data.training_status_id === 5 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={100}>100%</Progress></Progress>}
                                                                                        {/* ... other status_id steps ... */}
                                                                                        <div style={{ textAlign: "center" }}>
                                                                                            {data.training_start_time
                                                                                                ? clock(data.training_start_time)
                                                                                                : "Training started ..."}
                                                                                        </div>
                                                                                        <div className="loading-content">
                                                                                            Training In Progress
                                                                                            <div className="dot-loader">
                                                                                                <div className="dot"></div>
                                                                                                <div className="dot"></div>
                                                                                                <div className="dot"></div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </Row>
                                                                                )}

                                                                                {/* Training In Queue */}
                                                                                {isRetrain && (
                                                                                    <Row>
                                                                                        <Progress multi style={{ height: "17px", fontWeight: "bold" }}>
                                                                                            <Progress bar color="primary" value={100} animated>
                                                                                                Training In Queue
                                                                                            </Progress>
                                                                                        </Progress>
                                                                                    </Row>
                                                                                )}
                                                                            </div>
                                                                        </td>

                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </Table>
                                                </div> : null
                                        }

                                        {/* After including Navbar tab code  Here */}
                                        <div className={(showTrainingINProgs || showRetrain || addAccTestInProg || compModelVerInfo.some(data => data.model_status === 'Inactive') || compModelVerInfo.some(data => data.training_status === 'training_queued')) ? 'hidden' : ''}>
                                            <div>
                                                {type !== 'ML' ? (
                                                    <Nav tabs>
                                                        <React.Fragment>
                                                            {
                                                                (compModelVerInfo[0]?.result_mode === 'ok' || compModelVerInfo[0]?.result_mode === 'both') &&
                                                                <NavItem style={{ width: '10%' }}>
                                                                    <NavLink
                                                                        style={{
                                                                            cursor: 'pointer',
                                                                            color: activeTab === '1' ? 'green' : '',
                                                                            fontSize: '16px',
                                                                            fontWeight: activeTab === '1' ? 'bolder' : '',
                                                                        }}
                                                                        className={classnames({ active: activeTab === '1' })}
                                                                        onClick={() => getOK(positive, 0, '1')}
                                                                        disabled={showTrainingINProgs}
                                                                    >
                                                                        {positive}
                                                                    </NavLink>
                                                                </NavItem>
                                                            }
                                                            {
                                                                (compModelVerInfo[0]?.result_mode === 'ng' || compModelVerInfo[0]?.result_mode === 'both') &&
                                                                <NavItem style={{ width: '10%' }}>
                                                                    <NavLink
                                                                        style={{
                                                                            cursor: 'pointer',
                                                                            color: activeTab === '2' ? 'red' : '',
                                                                            fontSize: '16px',
                                                                            fontWeight: activeTab === '2' ? 'bolder' : '',
                                                                        }}
                                                                        className={classnames({ active: activeTab === '2' })}
                                                                        onClick={() => getNotok(negative, 1, '2')}
                                                                        disabled={showTrainingINProgs}
                                                                    >
                                                                        {negative}
                                                                    </NavLink>
                                                                </NavItem>
                                                            }
                                                            {
                                                                <NavItem style={{ width: '15%' }}>
                                                                    <NavLink
                                                                        style={{
                                                                            cursor: 'pointer',
                                                                            color: customActiveTab === 'remote' ? 'SlateBlue' : '',
                                                                            fontSize: '16px',
                                                                            fontWeight: customActiveTab === 'remote' ? 'bold' : ''
                                                                        }}
                                                                        className={classnames({ active: customActiveTab === 'remote' })}
                                                                        onClick={() => getRemoteAccess('remote')}
                                                                        disabled={showTrainingINProgs}
                                                                    >
                                                                        Remote Access
                                                                    </NavLink>
                                                                </NavItem>
                                                            }
                                                        </React.Fragment>
                                                    </Nav>) : (
                                                    <Nav tabs>
                                                        <React.Fragment>
                                                            <NavItem style={{ width: '25%' }}>
                                                                <NavLink
                                                                    style={{
                                                                        cursor: 'pointer',
                                                                        color: activeTab === '1' ? 'green' : '',
                                                                        fontSize: '16px',
                                                                        fontWeight: activeTab === '1' ? 'bolder' : '',
                                                                        textAlign: 'center'
                                                                    }}
                                                                    className={classnames({ active: activeTab === '1' })}
                                                                    onClick={() => getOK(positive, 0, '1')}
                                                                    disabled={showTrainingINProgs}
                                                                >
                                                                    Reference Image
                                                                </NavLink>
                                                            </NavItem>
                                                        </React.Fragment>
                                                    </Nav>
                                                )
                                                }
                                                <TabContent activeTab={activeTab}>
                                                    <br /> <br />
                                                    <TabPane tabId="1">
                                                        <div>
                                                            <Nav tabs>
                                                                {
                                                                    console.log('compModelcompModelVerInfoVerInfo', compModelVerInfo)
                                                                }

                                                                {compModelVerInfo.some(
                                                                    (data) => data.model_status !== "Inactive" && data.model_status !== "Live"
                                                                ) && (
                                                                        <NavItem>
                                                                            <NavLink
                                                                                style={{
                                                                                    cursor: "pointer",
                                                                                    color: customActiveTab === "2" ? "red" : "",
                                                                                    fontSize: "20px",
                                                                                    fontWeight: customActiveTab === "2" ? "bold" : "",
                                                                                }}
                                                                                outline={selectFilter !== 1}
                                                                                className={classnames({ active: customActiveTab === "2" })}
                                                                                onClick={() => startLiveCamera(1, "OK", "2")}
                                                                            >
                                                                                Live Camera
                                                                            </NavLink>
                                                                        </NavItem>
                                                                    )}

                                                                {/** ✅ Image Gallery link (also show only once) */}
                                                                {type !== "ML" &&
                                                                    versionCount > 1 &&
                                                                    imgGlr &&
                                                                    imgGlr.length > 1 && (
                                                                        <NavItem>
                                                                            <NavLink
                                                                                style={{
                                                                                    cursor: "pointer",
                                                                                    color: customActiveTab === "1" ? "green" : "",
                                                                                    fontSize: "20px",
                                                                                    fontWeight: customActiveTab === "1" ? "bold" : "",
                                                                                }}
                                                                                outline={selectFilter !== 0}
                                                                                className={classnames({ active: customActiveTab === "1" })}
                                                                                onClick={() => getImgGalleryInfo(0, "OK", "1")}
                                                                            >
                                                                                Image Gallery
                                                                            </NavLink>
                                                                        </NavItem>
                                                                    )}

                                                            </Nav>
                                                        </div>
                                                    </TabPane>

                                                    <TabPane tabId="2">
                                                        <div>
                                                            <Nav tabs>
                                                                {compModelVerInfo.some(
                                                                    (data) => data.model_status !== "Inactive" && data.model_status !== "Live"
                                                                ) && (
                                                                        <NavItem>
                                                                            <NavLink
                                                                                style={{
                                                                                    cursor: "pointer",
                                                                                    color: customActiveTab === "4" ? "red" : "",
                                                                                    fontSize: "20px",
                                                                                    fontWeight: customActiveTab === "4" ? "bold" : "",
                                                                                }}
                                                                                outline={selectFilter !== 4}
                                                                                className={classnames({ active: customActiveTab === "4" })}
                                                                                onClick={() => startLiveCamera(4, "NG", "4")}
                                                                            >
                                                                                Live Camera
                                                                            </NavLink>
                                                                        </NavItem>
                                                                    )}

                                                                {
                                                                    type !== 'ML' &&
                                                                    versionCount > 1 &&
                                                                    imgGlr &&
                                                                    imgGlr.length > 1 &&
                                                                    (
                                                                        <NavItem>
                                                                            <NavLink
                                                                                style={{
                                                                                    cursor: "pointer",
                                                                                    color: customActiveTab === '3' ? 'green' : '',
                                                                                    fontSize: '20px',
                                                                                    fontWeight: customActiveTab === '3' ? 'bold' : ''
                                                                                }}
                                                                                outline={selectFilter !== 3}
                                                                                className={classnames({ active: customActiveTab === "3" })}
                                                                                onClick={() => getImgGalleryInfo(3, 'NG', '3')}
                                                                            >
                                                                                Image Gallery
                                                                            </NavLink>
                                                                        </NavItem>
                                                                    )}
                                                            </Nav>
                                                        </div>
                                                    </TabPane>
                                                </TabContent>
                                            </div>
                                            <div style={{ userSelect: 'none' }}>
                                                {showCamera ? (
                                                    <Row lg={12} className='text-center'>


                                                        <Col sm={6} md={6} lg={6} style={{ maxHeight: "70vh", overflowY: "auto" }}>
                                                            <Card>
                                                                <CardBody>
                                                                    {/* ---- Header ---- */}
                                                                    {type === "ML" ? (
                                                                        <CardTitle className="mb-3">Capture Image for Reference</CardTitle>
                                                                    ) : (
                                                                        <>
                                                                            <CardTitle className="mb-3">Capture Image for Training</CardTitle>
                                                                            <label>
                                                                                {showLabelName} component (min required: {reqImgCount}) <br />
                                                                                Added:{" "}
                                                                                {showLabelName === config[0]?.positive
                                                                                    ? okCount1
                                                                                    : showLabelName === config[0]?.negative
                                                                                        ? notokCount1
                                                                                        : 0}
                                                                            </label>
                                                                        </>
                                                                    )}

                                                                    {/* ---- Outline Controls ---- */}
                                                                    {position === "Fixed" && (
                                                                        <>
                                                                            <div className="my-2 text-start">
                                                                                <Checkbox checked={showOutline} onChange={toggleShowOutline}>
                                                                                    Show Outline
                                                                                </Checkbox>
                                                                            </div>

                                                                            {showOutline && (
                                                                                <div className="d-flex flex-wrap gap-1 mb-3">
                                                                                    {outlineColors.map((otline, otl_id) => (
                                                                                        <Button
                                                                                            key={otl_id}
                                                                                            size="sm"
                                                                                            style={{
                                                                                                backgroundColor:
                                                                                                    otline === "White Outline"
                                                                                                        ? "white"
                                                                                                        : otline === "Blue Outline"
                                                                                                            ? "blue"
                                                                                                            : otline === "Black Outline"
                                                                                                                ? "black"
                                                                                                                : otline === "Orange Outline"
                                                                                                                    ? "orange"
                                                                                                                    : otline === "Yellow Outline"
                                                                                                                        ? "yellow"
                                                                                                                        : "gray",
                                                                                                border:
                                                                                                    defaultOutline === otline
                                                                                                        ? "2px solid black"
                                                                                                        : "1px solid #ccc",
                                                                                            }}
                                                                                            outline={defaultOutline !== otline}
                                                                                            onClick={() => newOutlineChange(otline)}
                                                                                        />
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </>
                                                                    )}



                                                                    <div
                                                                        style={{
                                                                            display: "grid",
                                                                            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                                                                            gap: "5px",
                                                                        }}
                                                                    >
                                                                        {uniqueCameras.map((camera, index) => (
                                                                            <div
                                                                                key={camera.originalLabel}
                                                                                style={{
                                                                                    position: "relative",
                                                                                    border: "1px solid #ddd",
                                                                                    borderRadius: "0px",
                                                                                    overflow: "hidden",
                                                                                }}
                                                                            >
                                                                                {showOutline && getCurrentOutlinePath(camera.originalLabel) && (
                                                                                    <img
                                                                                        src={showImage(getCurrentOutlinePath(camera.originalLabel))}
                                                                                        alt={`${camera.label} Outline`}
                                                                                        style={{
                                                                                            width: "100%",
                                                                                            height: "100%",
                                                                                            position: "absolute",
                                                                                            top: 0,
                                                                                            left: 0,
                                                                                            zIndex: 2,
                                                                                            pointerEvents: "none",
                                                                                            objectFit: "cover",
                                                                                        }}
                                                                                    />
                                                                                )}


                                                                                {/* 
                                                                                <WebcamCapture
                                                                                    ref={(el) => {
                                                                                        if (el) {
                                                                                            const refKey = `${camera.originalLabel}_${camera.model_ver}`;
                                                                                            webcamRefs.current[refKey] = el;
                                                                                        }
                                                                                    }}
                                                                                    resolution={DEFAULT_RESOLUTION}
                                                                                    zoom={zoomValue?.zoom}
                                                                                    center={zoomValue?.center}
                                                                                    cameraLabel={camera.originalLabel}
                                                                                    style={{
                                                                                        width: "100%",
                                                                                        height: "100%",
                                                                                        objectFit: "cover",
                                                                                        display: "block",
                                                                                    }}
                                                                                /> */}

                                                                                <WebcamCapture
                                                                                    ref={(el) => {
                                                                                        if (el) {
                                                                                            webcamRefs.current[camera.originalLabel] = el;
                                                                                        }
                                                                                    }}
                                                                                    resolution={DEFAULT_RESOLUTION}
                                                                                    zoom={zoomValue?.zoom}
                                                                                    center={zoomValue?.center}
                                                                                    cameraLabel={camera.originalLabel}
                                                                                    style={{
                                                                                        width: "100%",
                                                                                        height: "100%",
                                                                                        objectFit: "cover",
                                                                                        display: "block",
                                                                                    }}
                                                                                />


                                                                                <div
                                                                                    style={{
                                                                                        position: "absolute",
                                                                                        bottom: "5px",
                                                                                        left: "5px",
                                                                                        padding: "2px 6px",
                                                                                        backgroundColor: "rgba(0,0,0,0.6)",
                                                                                        color: "#fff",
                                                                                        fontSize: "12px",
                                                                                        borderRadius: "4px",
                                                                                    }}
                                                                                >
                                                                                    {camera.label}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>


                                                                    <div className="mt-3 text-center">

                                                                        {customActiveTab === 'remote' ? (
                                                                            <>

                                                                                <div className="container">
                                                                                    <div className="row mb-2 justify-content-center">
                                                                                        <div className="col-auto d-flex align-items-center">
                                                                                            <label className="form-label me-2 mb-0">Enter Count:</label>
                                                                                            <input
                                                                                                type="number"
                                                                                                className="form-control form-control-sm me-3"
                                                                                                style={{ width: "120px" }}
                                                                                                value={maxCount ?? ""}
                                                                                                onChange={(e) =>
                                                                                                    setMaxCount(e.target.value ? Number(e.target.value) : null)
                                                                                                }
                                                                                                placeholder="Unlimited if empty"
                                                                                            />
                                                                                            <span className="">
                                                                                                Total : {totalAddedImages} Images Added
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>



                                                                                    {/* Row 2: Button */}
                                                                                    <div className="row justify-content-center">
                                                                                        <div className="col-auto">
                                                                                            <Button
                                                                                                type="button"   // prevent accidental form submission
                                                                                                size="sm"
                                                                                                color="success"
                                                                                                className="me-2"
                                                                                                onClick={startRemoteCapture}
                                                                                                disabled={capturing}
                                                                                            >
                                                                                                Add Image
                                                                                            </Button>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                {addingImage ? (
                                                                                    <Button size="sm" color="info" disabled>
                                                                                        Adding Images... <Spin spinning={true} />
                                                                                    </Button>
                                                                                ) : (
                                                                                    webcamEnabled &&
                                                                                    !cameraDisconnected && (
                                                                                        <Button
                                                                                            size="sm"
                                                                                            color="primary"
                                                                                            onClick={() => captureImage(labelName)}
                                                                                        >
                                                                                            Add Image
                                                                                        </Button>
                                                                                    )
                                                                                )}
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </CardBody>
                                                            </Card>
                                                        </Col>



                                                        <Col className='scrlHide' sm={6} md={6} lg={6} style={{ boxShadow: '0px 0px 10px grey', borderRadius: '5px', height: '70vh', overflowY: 'auto' }}>

                                                            {customActiveTab === "remote" ? (
                                                                // ✅ Remote Access Camera Gallery
                                                                <Card className="mt-2" style={{ position: "relative" }}>
                                                                    <div style={{ position: "absolute", zIndex: "2" }}>
                                                                        {responseMessage && (
                                                                            <Alert
                                                                                severity={
                                                                                    responseMessage === "Image successfully added"
                                                                                        ? "success"
                                                                                        : "error"
                                                                                }
                                                                            >
                                                                                <AlertTitle
                                                                                    style={{ fontWeight: "bold", margin: "auto" }}
                                                                                >
                                                                                    {responseMessage}
                                                                                </AlertTitle>
                                                                            </Alert>
                                                                        )}
                                                                    </div>

                                                                    <CardBody>
                                                                        {/* Title & Active Camera Badge */}
                                                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                                                            <h5
                                                                                className="mb-0"
                                                                                style={{ fontWeight: "bold", color: "#333" }}
                                                                            >
                                                                                Remote Camera Gallery
                                                                            </h5>
                                                                            <span className="badge badge-info">
                                                                                Active: {selectedCameraLabel || "No Camera Selected"}
                                                                            </span>
                                                                        </div>


                                                                        {(!remoteGallery || Object.values(remoteGallery || {}).flat().length < 1) ? (
                                                                            <Row>
                                                                                <h5 className="my-3 text-center font-weight-bold">
                                                                                    No Images available....
                                                                                </h5>
                                                                            </Row>
                                                                        ) : (
                                                                            <RemoteAccessGallery galleryData={remoteGallery} />
                                                                        )}
                                                                    </CardBody>
                                                                </Card>
                                                            ) : (
                                                                <>
                                                                    {
                                                                        type === 'DL' &&
                                                                        <Card className='mt-2' style={{ position: 'relative' }}>
                                                                            <div style={{ position: 'absolute', zIndex: '2' }}>
                                                                                {responseMessage && (
                                                                                    <Alert severity={responseMessage === 'Image successfully added' ? 'success' : 'error'}>
                                                                                        <AlertTitle style={{ fontWeight: 'bold', margin: 'auto' }}>{responseMessage}</AlertTitle>
                                                                                    </Alert>
                                                                                )}
                                                                            </div>


                                                                            <CardBody>
                                                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                                                    <h5 className="mb-0" style={{ fontWeight: 'bold', color: '#333' }}>
                                                                                        Camera Gallerys
                                                                                    </h5>
                                                                                    <span className="badge badge-info">
                                                                                        Active: {selectedCameraLabel || 'No Camera Selected'}
                                                                                    </span>
                                                                                </div>

                                                                                {cameraList.length > 0 && (
                                                                                    <div className="mb-3">
                                                                                        <div className="d-flex flex-wrap gap-2">

                                                                                            {cameraList.map((camera, index) => (
                                                                                                <Button
                                                                                                    key={index}
                                                                                                    size="sm"
                                                                                                    color={selectedCameraLabel === camera.label + "_" + camera.model_ver ? "primary" : "outline-primary"}
                                                                                                    onClick={() => switchCamera(camera)}
                                                                                                >
                                                                                                    {`${camera.label}_v${camera.model_ver}`}
                                                                                                </Button>
                                                                                            ))}

                                                                                        </div>
                                                                                    </div>
                                                                                )}

                                                                                {
                                                                                    imagesLength < 1 ?
                                                                                        <Row>
                                                                                            <h5 className='my-3' style={{ fontWeight: 'bold', textAlign: 'center' }}>
                                                                                                No Images available....
                                                                                            </h5>
                                                                                            <br />
                                                                                            <h6 className='my-3' style={{ fontWeight: 'bold', textAlign: 'center' }}>
                                                                                                Add Images from the Live Camera...
                                                                                            </h6>
                                                                                        </Row>
                                                                                        :
                                                                                        renderCameraGallery()



                                                                                }

                                                                                {imagesLength > 0 && (
                                                                                    <div className="mt-3 p-3" style={{
                                                                                        backgroundColor: '#e9ecef',
                                                                                        borderRadius: '5px',
                                                                                        textAlign: 'center'
                                                                                    }}>
                                                                                        <div className="d-flex justify-content-between align-items-center">
                                                                                            <div>
                                                                                                <strong>Total Images: {imagesLength}</strong>
                                                                                            </div>
                                                                                            <div>
                                                                                                <strong>Selected: {selectedImages.length}</strong>
                                                                                            </div>
                                                                                            <Button
                                                                                                className="btn btn-sm w-sm"
                                                                                                color='danger'
                                                                                                onClick={() => handleDeleteSelectedImages()}
                                                                                                disabled={selectedImages.length === 0}
                                                                                            >
                                                                                                Delete Selected ({selectedImages.length})
                                                                                            </Button>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </CardBody>
                                                                        </Card>
                                                                    }


                                                                    {
                                                                        type === 'ML' &&
                                                                        (
                                                                            showTrainImage === true ?
                                                                                <TrainImages versionData={compModelVerInfo[0]} setVersionData={(e) => setVersionData(e)} />
                                                                                :
                                                                                <>
                                                                                    <Row >
                                                                                        {
                                                                                            imagesLength < 1 ?
                                                                                                <Col>
                                                                                                    <h5 className='my-3' style={{ fontWeight: 'bold', textAlign: 'center' }}>
                                                                                                        No Images Preview available....
                                                                                                    </h5>
                                                                                                    <br />
                                                                                                    <h6 className='my-3' style={{ fontWeight: 'bold', textAlign: 'center' }}>
                                                                                                        Add Images from the Live Camera...
                                                                                                    </h6>
                                                                                                </Col> :
                                                                                                <>
                                                                                                    {cameraList.length > 1 && (
                                                                                                        <Col sm={12} className="mb-3">
                                                                                                            <Card style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
                                                                                                                <CardBody className="p-2">
                                                                                                                    <div className="d-flex justify-content-between align-items-center">
                                                                                                                        <h6 className="mb-0">Current Camera:</h6>
                                                                                                                        <span className="badge badge-primary">
                                                                                                                            {selectedCameraLabel || 'No Camera Selected'}
                                                                                                                        </span>
                                                                                                                    </div>
                                                                                                                </CardBody>
                                                                                                            </Card>
                                                                                                        </Col>
                                                                                                    )}

                                                                                                    {
                                                                                                        compModelVerInfo[0]?.model_name !== 'SIFT' &&
                                                                                                        <Col sm={12} md={12} lg={12} className='d-flex justify-content-end my-2'>
                                                                                                            <Button
                                                                                                                className="btn btn-sm w-sm"
                                                                                                                color='danger'
                                                                                                                onClick={() => handleDeleteSelectedImages(compModelVerInfo[0].datasets[0].image_path)}
                                                                                                            >
                                                                                                                Delete
                                                                                                            </Button>
                                                                                                        </Col>
                                                                                                    }

                                                                                                    <Col sm={6} md={6} lg={6}>
                                                                                                        <Card className='mt-2' style={{
                                                                                                            position: 'relative',
                                                                                                            backgroundColor: '#f0f0f0',
                                                                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                                                                            border: '2px solid #ddd'
                                                                                                        }}>
                                                                                                            <CardTitle className='my-2' style={{
                                                                                                                color: '#333',
                                                                                                                borderBottom: '2px solid #ddd',
                                                                                                                padding: '0.5rem 1rem',
                                                                                                                display: 'flex',
                                                                                                                justifyContent: 'space-between',
                                                                                                                alignItems: 'center'
                                                                                                            }}>
                                                                                                                <span>Reference Image</span>
                                                                                                                {selectedCameraLabel && (
                                                                                                                    <span className="badge badge-info" style={{ fontSize: '10px' }}>
                                                                                                                        {cameraList.find(cam => cam.originalLabel === selectedCameraLabel)?.label || selectedCameraLabel}
                                                                                                                    </span>
                                                                                                                )}
                                                                                                            </CardTitle>
                                                                                                            <CardBody>
                                                                                                                <Image
                                                                                                                    src={showImage({
                                                                                                                        ...compModelVerInfo[0].datasets[0],
                                                                                                                        image_path: compModelVerInfo[0].datasets[0].image_path
                                                                                                                    })}
                                                                                                                    alt='Image not there'
                                                                                                                />
                                                                                                                {compModelVerInfo[0].datasets[0].camera_label && (
                                                                                                                    <div className="mt-2 text-center" style={{ fontSize: '12px', color: '#666' }}>
                                                                                                                        Captured from: {compModelVerInfo[0].datasets[0].camera_label}
                                                                                                                    </div>
                                                                                                                )}
                                                                                                            </CardBody>
                                                                                                        </Card>
                                                                                                    </Col>
                                                                                                </>
                                                                                        }
                                                                                    </Row>
                                                                                </>
                                                                        )
                                                                    }
                                                                </>)}
                                                        </Col>


                                                    </Row>
                                                ) : null}
                                            </div>

                                            <div className='storedImages mt-5' style={{ userSelect: 'none' }}>
                                                {showGallery && (
                                                    <Card>
                                                        <Row>
                                                            <label style={{ textAlign: 'center' }}>
                                                                {showLabelName} component (minimum required image: {reqImgCount})
                                                                No. of Added Images:
                                                                {
                                                                    showLabelName === config[0]?.positive ? okCount1 :
                                                                        showLabelName === config[0]?.negative ? notokCount1 :
                                                                            null
                                                                }
                                                            </label>

                                                            <Col className='scrlHide' sm={6} md={6} style={{ border: '1px solid' }}>
                                                                <Multiselect
                                                                    onRemove={(selectedList, selectedItem) => onRemove(selectedList, selectedItem)}
                                                                    onSelect={(selectedList, selectedItem, index) => onSelectValues(selectedList, selectedItem, index)}
                                                                    options={diffVal}
                                                                    displayValue="label"
                                                                    closeOnSelect={false}
                                                                    placeholder='select versions...'
                                                                />
                                                                {
                                                                    imgGlr?.length > 0 ?
                                                                        showOtherVersionImages()
                                                                        : null
                                                                }
                                                            </Col>

                                                            {/* <Col className='scrlHide' sm={6} md={6} style={{ border: '1px solid' }}>
                                                                <Droppable types={['dragdrop']} onDrop={onDrop}>
                                                                    <div>
                                                                        <h5 className='ftOtVer'>
                                                                            Active Version
                                                                        </h5>
                                                                    </div>
                                                                    <Card className='mt-2' style={{ position: 'relative', height: '97vh', overflowY: 'auto', overflowX: 'hidden' }}>
                                                                        <div style={{ position: 'absolute', zIndex: '2' }}>
                                                                            {responseMessage && (
                                                                                <Alert severity={responseMessage === 'Image successfully added' ? 'success' : 'error'}>
                                                                                    <AlertTitle style={{ fontWeight: 'bold', margin: 'auto' }}>{responseMessage}</AlertTitle>
                                                                                </Alert>
                                                                            )}
                                                                        </div>
                                                                        {
                                                                            imagesLength < 1 ?
                                                                                <Row>
                                                                                    <h5 className='my-3' style={{ fontWeight: 'bold', textAlign: 'center' }}>
                                                                                        Images Not Available...
                                                                                    </h5>
                                                                                </Row>
                                                                                :
                                                                                Object.entries(activeGroupData).map(([version, items], verId) => {
                                                                                    if (compModelVerInfo[0].model_ver === parseInt(version)) {
                                                                                        let imgCount = 0;
                                                                                        return (
                                                                                            <React.Fragment key={verId}>
                                                                                                <div className='d-flex justify-content-between align-items-center'>
                                                                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                                                        <Checkbox
                                                                                                            style={{
                                                                                                                borderColor: 'slategray',
                                                                                                                borderWidth: '2px',
                                                                                                                borderStyle: 'solid',
                                                                                                                borderRadius: '7px',
                                                                                                                height: '20px',
                                                                                                                width: '20px',
                                                                                                                marginRight: '5px',
                                                                                                            }}
                                                                                                            checked={selectedImages.length === items.length}
                                                                                                            onChange={() => {
                                                                                                                multiImgDelete(items, labelName);
                                                                                                            }}
                                                                                                        />
                                                                                                        <span>Select All</span>
                                                                                                    </div>
                                                                                                    <Button className="btn btn-sm w-sm" color='danger' onClick={() => handleDeleteSelectedImages()}>
                                                                                                        Delete
                                                                                                    </Button>
                                                                                                </div>
                                                                                                <Row key={verId} className='mt-2'>
                                                                                                    {items.map((item, itemId) => {
                                                                                                        if (item.imagePathType[0].type === labelName) {
                                                                                                            const isSelected = selectedImages.includes(item);
                                                                                                            return (
                                                                                                                <Col sm={3} md={3} key={itemId}>
                                                                                                                    <Card style={{ borderRadius: '7px' }}>
                                                                                                                        <CardBody style={{ padding: '7px', border: isSelected ? '2px solid red' : '2px solid green', borderRadius: '7px' }}>
                                                                                                                            <div style={{ fontWeight: 'bold', textAlign: 'left', whiteSpace: 'pre' }}>
                                                                                                                                <Checkbox style={{
                                                                                                                                    borderColor: 'slategray', borderWidth: '2px', borderStyle: 'solid', borderRadius: '7px', height: '20px',
                                                                                                                                    width: '20px'
                                                                                                                                }}
                                                                                                                                    checked={isSelected}
                                                                                                                                    onChange={() => handleCheckboxChange(item, version)}
                                                                                                                                />
                                                                                                                                {'   '}
                                                                                                                                {imgCount += 1}
                                                                                                                            </div>
                                                                                                                            <Image src={showImage(item.imagePathType[item.used_model_ver.indexOf(parseInt(version))].image_path)} alt='Image not there' />
                                                                                                                            <div style={{ fontWeight: 'bold', textAlign: 'left' }}>
                                                                                                                                Used In : {item.used_model_ver.join(', ')}
                                                                                                                            </div>
                                                                                                                            <div style={{ textAlign: 'right' }}>
                                                                                                                                <Popconfirm placement="rightBottom" title="Do you want to delete?" onConfirm={() => deleteImageClick(item, compModelVerInfo[0].model_ver, labelName)} okText="Yes">
                                                                                                                                    <DeleteTwoTone twoToneColor="red" style={{ fontSize: '18px', background: 'white', borderRadius: '5px' }} />
                                                                                                                                </Popconfirm>
                                                                                                                            </div>
                                                                                                                        </CardBody>
                                                                                                                    </Card>
                                                                                                                </Col>
                                                                                                            );
                                                                                                        }
                                                                                                        return null;
                                                                                                    })}
                                                                                                </Row>
                                                                                            </React.Fragment>
                                                                                        )
                                                                                    }
                                                                                    return null;
                                                                                })
                                                                        }
                                                                    </Card>
                                                                </Droppable>
                                                            </Col> */}
                                                            <Col className='scrlHide' sm={6} md={6} style={{ border: '1px solid' }}>
                                                                <Droppable types={['dragdrop']} onDrop={onDrop}>
                                                                    <div>
                                                                        <h5 className='ftOtVer'>
                                                                            Active Version
                                                                        </h5>
                                                                    </div>
                                                                    <Card className='mt-2' style={{ position: 'relative', height: '97vh', overflowY: 'auto', overflowX: 'hidden' }}>
                                                                        <div style={{ position: 'absolute', zIndex: '2' }}>
                                                                            {responseMessage && (
                                                                                <Alert severity={responseMessage === 'Image successfully added' ? 'success' : 'error'}>
                                                                                    <AlertTitle style={{ fontWeight: 'bold', margin: 'auto' }}>{responseMessage}</AlertTitle>
                                                                                </Alert>
                                                                            )}
                                                                        </div>

                                                                        {/* Camera Selection Buttons - Same as Camera Gallery */}
                                                                        {cameraList.length > 0 && (
                                                                            <div className="mb-3 p-2" style={{ backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                                                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                                                    <h6 className="mb-0" style={{ fontWeight: 'bold', color: '#333' }}>
                                                                                        Select Camera:
                                                                                    </h6>
                                                                                    <span className="badge badge-info">
                                                                                        Active: {selectedCameraLabel || 'All Cameras'}
                                                                                    </span>
                                                                                </div>
                                                                                <div className="d-flex gap-2 flex-wrap">
                                                                                    {/* All Cameras Button */}
                                                                                    <Button
                                                                                        color={!selectedCameraLabel ? "primary" : "secondary"}
                                                                                        size="sm"
                                                                                        onClick={() => switchCamera(null)}
                                                                                        style={{
                                                                                            minWidth: '80px',
                                                                                            fontSize: '10px',
                                                                                            padding: '4px 8px',
                                                                                            display: 'flex',
                                                                                            alignItems: 'center',
                                                                                            justifyContent: 'center'
                                                                                        }}
                                                                                    >
                                                                                        <span style={{ fontWeight: 'bold' }}>
                                                                                            All Cameras
                                                                                        </span>
                                                                                    </Button>

                                                                                    {/* Individual Camera Buttons */}
                                                                                    {cameraList.map((camera, index) => (
                                                                                        <Button
                                                                                            key={index}
                                                                                            color={selectedCameraLabel === camera.originalLabel ? "primary" : "secondary"}
                                                                                            size="sm"
                                                                                            onClick={() => switchCamera(camera.originalLabel)}
                                                                                            style={{
                                                                                                minWidth: '90px',
                                                                                                fontSize: '10px',
                                                                                                padding: '4px 4px',
                                                                                                display: 'flex',
                                                                                                flexDirection: 'column',
                                                                                                alignItems: 'center'
                                                                                            }}
                                                                                        >
                                                                                            <span style={{ fontWeight: 'bold', color: '#fafafaff' }}>
                                                                                                {'✅'} {camera.label}
                                                                                            </span>
                                                                                        </Button>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {
                                                                            imagesLength < 1 ?
                                                                                <Row>
                                                                                    <h5 className='my-3' style={{ fontWeight: 'bold', textAlign: 'center' }}>
                                                                                        Images Not Available...
                                                                                    </h5>
                                                                                </Row>
                                                                                :
                                                                                Object.entries(activeGroupData).map(([version, items], verId) => {
                                                                                    if (compModelVerInfo[0].model_ver === parseInt(version)) {
                                                                                        let imgCount = 0;

                                                                                        // Filter items based on selected camera
                                                                                        const filteredItems = selectedCameraLabel
                                                                                            ? items.filter(item => {
                                                                                                if (item.imagePathType && item.imagePathType[0] && item.imagePathType[0].type === labelName) {
                                                                                                    // Find the matching camera
                                                                                                    const selectedCamera = cameraList.find(cam => cam.originalLabel === selectedCameraLabel);
                                                                                                    if (selectedCamera) {
                                                                                                        const normalizedCameraLabel = selectedCamera.label.replace(/\s+/g, "_");
                                                                                                        const itemCameraLabel = item.imagePathType[0].camera;
                                                                                                        return itemCameraLabel === normalizedCameraLabel;
                                                                                                    }
                                                                                                }
                                                                                                return false;
                                                                                            })
                                                                                            : items.filter(item => item.imagePathType && item.imagePathType[0] && item.imagePathType[0].type === labelName);

                                                                                        if (filteredItems.length === 0) {
                                                                                            return (
                                                                                                <div key={verId} className="text-center p-3">
                                                                                                    <h6 style={{ color: '#666' }}>
                                                                                                        No images available for {selectedCameraLabel ?
                                                                                                            cameraList.find(cam => cam.originalLabel === selectedCameraLabel)?.label : 'selected camera'
                                                                                                        }
                                                                                                    </h6>
                                                                                                </div>
                                                                                            );
                                                                                        }

                                                                                        return (
                                                                                            <React.Fragment key={verId}>
                                                                                                <div className='d-flex justify-content-between align-items-center p-2'>
                                                                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                                                        <Checkbox
                                                                                                            style={{
                                                                                                                borderColor: 'slategray',
                                                                                                                borderWidth: '2px',
                                                                                                                borderStyle: 'solid',
                                                                                                                borderRadius: '7px',
                                                                                                                height: '20px',
                                                                                                                width: '20px',
                                                                                                                marginRight: '5px',
                                                                                                            }}
                                                                                                            checked={filteredItems.every(item => selectedImages.includes(item))}
                                                                                                            onChange={() => {
                                                                                                                const allSelected = filteredItems.every(item => selectedImages.includes(item));
                                                                                                                if (allSelected) {
                                                                                                                    // Unselect all filtered items
                                                                                                                    const newSelection = selectedImages.filter(img => !filteredItems.includes(img));
                                                                                                                    setSelectedImages(newSelection);
                                                                                                                } else {
                                                                                                                    // Select all filtered items
                                                                                                                    const newSelection = [...selectedImages];
                                                                                                                    filteredItems.forEach(item => {
                                                                                                                        if (!newSelection.includes(item)) {
                                                                                                                            newSelection.push(item);
                                                                                                                        }
                                                                                                                    });
                                                                                                                    setSelectedImages(newSelection);
                                                                                                                }
                                                                                                            }}
                                                                                                        />
                                                                                                        <span>Select All ({filteredItems.length} images)</span>
                                                                                                    </div>
                                                                                                    <Button
                                                                                                        className="btn btn-sm w-sm"
                                                                                                        color='danger'
                                                                                                        onClick={() => handleDeleteSelectedImages()}
                                                                                                        disabled={selectedImages.length === 0}
                                                                                                    >
                                                                                                        Delete ({selectedImages.filter(img => filteredItems.includes(img)).length})
                                                                                                    </Button>
                                                                                                </div>

                                                                                                {/* Show camera info if specific camera is selected */}
                                                                                                {selectedCameraLabel && (
                                                                                                    <div className="mb-2 p-2" style={{
                                                                                                        backgroundColor: '#e3f2fd',
                                                                                                        borderRadius: '5px',
                                                                                                        border: '1px solid #2196f3'
                                                                                                    }}>
                                                                                                        <div className="d-flex justify-content-between align-items-center">
                                                                                                            <span style={{ fontWeight: 'bold', color: '#1976d2' }}>
                                                                                                                📷 {cameraList.find(cam => cam.originalLabel === selectedCameraLabel)?.label}
                                                                                                            </span>
                                                                                                            <span className="badge badge-primary">
                                                                                                                {filteredItems.length} images
                                                                                                            </span>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                )}

                                                                                                <Row key={verId} className='mt-2'>
                                                                                                    {filteredItems.map((item, itemId) => {
                                                                                                        const isSelected = selectedImages.includes(item);
                                                                                                        imgCount += 1;

                                                                                                        return (
                                                                                                            <Col sm={3} md={3} key={itemId}>
                                                                                                                <Card style={{ borderRadius: '7px', marginBottom: '10px' }}>
                                                                                                                    <CardBody style={{
                                                                                                                        padding: '7px',
                                                                                                                        border: isSelected ? '2px solid red' : '2px solid green',
                                                                                                                        borderRadius: '7px'
                                                                                                                    }}>
                                                                                                                        <div style={{
                                                                                                                            fontWeight: 'bold',
                                                                                                                            textAlign: 'left',
                                                                                                                            whiteSpace: 'pre',
                                                                                                                            display: 'flex',
                                                                                                                            justifyContent: 'space-between',
                                                                                                                            alignItems: 'center',
                                                                                                                            marginBottom: '5px'
                                                                                                                        }}>
                                                                                                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                                                                                <Checkbox
                                                                                                                                    style={{
                                                                                                                                        borderColor: 'slategray',
                                                                                                                                        borderWidth: '2px',
                                                                                                                                        borderStyle: 'solid',
                                                                                                                                        borderRadius: '7px',
                                                                                                                                        height: '20px',
                                                                                                                                        width: '20px',
                                                                                                                                        marginRight: '5px'
                                                                                                                                    }}
                                                                                                                                    checked={isSelected}
                                                                                                                                    onChange={() => handleCheckboxChange(item, version)}
                                                                                                                                />
                                                                                                                                <span style={{ fontSize: '12px' }}>#{imgCount}</span>
                                                                                                                            </div>
                                                                                                                            <div style={{ textAlign: 'right' }}>
                                                                                                                                <Popconfirm
                                                                                                                                    placement="rightBottom"
                                                                                                                                    title="Do you want to delete?"
                                                                                                                                    onConfirm={() => deleteImageClick(item, compModelVerInfo[0].model_ver, labelName)}
                                                                                                                                    okText="Yes"
                                                                                                                                >
                                                                                                                                    <DeleteTwoTone
                                                                                                                                        twoToneColor="red"
                                                                                                                                        style={{
                                                                                                                                            fontSize: '18px',
                                                                                                                                            background: 'white',
                                                                                                                                            borderRadius: '5px',
                                                                                                                                            cursor: 'pointer'
                                                                                                                                        }}
                                                                                                                                    />
                                                                                                                                </Popconfirm>
                                                                                                                            </div>
                                                                                                                        </div>

                                                                                                                        <Image
                                                                                                                            src={showImage(item.imagePathType[item.used_model_ver.indexOf(parseInt(version))].image_path)}
                                                                                                                            alt='Image not there'
                                                                                                                            style={{ width: '100%', borderRadius: '3px' }}
                                                                                                                        />

                                                                                                                        <div style={{
                                                                                                                            fontSize: '10px',
                                                                                                                            marginTop: '5px',
                                                                                                                            display: 'flex',
                                                                                                                            flexDirection: 'column',
                                                                                                                            gap: '2px'
                                                                                                                        }}>
                                                                                                                            <div style={{ fontWeight: 'bold' }}>
                                                                                                                                Used In: {item.used_model_ver.join(', ')}
                                                                                                                            </div>
                                                                                                                            <div style={{ color: '#666' }}>
                                                                                                                                Camera: {item.imagePathType[0].camera?.replace(/_/g, ' ') || 'Unknown'}
                                                                                                                            </div>
                                                                                                                            <div style={{ color: '#666' }}>
                                                                                                                                Type: {item.imagePathType[0].type}
                                                                                                                            </div>
                                                                                                                            {item.imagePathType[0].date && (
                                                                                                                                <div style={{ color: '#888', fontSize: '9px' }}>
                                                                                                                                    {new Date(item.imagePathType[0].date).toLocaleString()}
                                                                                                                                </div>
                                                                                                                            )}
                                                                                                                        </div>
                                                                                                                    </CardBody>
                                                                                                                </Card>
                                                                                                            </Col>
                                                                                                        );
                                                                                                    })}
                                                                                                </Row>
                                                                                            </React.Fragment>
                                                                                        )
                                                                                    }
                                                                                    return null;
                                                                                })
                                                                        }
                                                                    </Card>
                                                                </Droppable>
                                                            </Col>
                                                        </Row>
                                                    </Card>
                                                )}
                                            </div>
                                        </div>
                                    </>
                            }
                        </CardBody>
                    </Card>
                </Container>

                {/* Modal 4 - select admin testing option */}
                {
                    showTestingOptions ?
                        <AdminTestingOptions
                            isOpen={showTestingOptions}
                            toggle={closeAdminTestOptions}
                            onContinue={continueAdminTest}
                            rectangles={compInfo?.rectangles}
                        />
                        : null
                }

                {/* Modal 2 - Log Info */}
                <Modal size="xl" isOpen={modalXlarge} toggle={togXlarge} scrollable={true}>
                    <div className="modal-header">
                        <h5 className="modal-title mt-0" id="myExtraLargeModalLabel">Version Log</h5>
                        <Button onClick={() => setModalXlarge(false)} type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </Button>
                    </div>
                    <div className="table-responsive">
                        <Table striped>
                            <thead>
                                <tr>
                                    <th>Date and time</th>
                                    <th>User Info</th>
                                    <th>Component name</th>
                                    <th>Component code</th>
                                    <th>Model Name</th>
                                    <th>Model version</th>
                                    <th>Screen Name</th>
                                    <th>Actions</th>
                                    <th>Activity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logData.map((data, index) => (
                                    <tr key={index}>
                                        <td>{data.date_time}</td>
                                        <td>{data.user_info}</td>
                                        <td>{data.comp_name}</td>
                                        <td>{data.comp_code}</td>
                                        <td>{data.model_name}</td>
                                        <td>{data.model_version}</td>
                                        <td>{data.screen_name}</td>
                                        <td>{data.action}</td>
                                        <td><JsonTable json={data.report_data[0]} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                    <div className="modal-footer">
                        <Button type="button" className="btn btn-secondary" onClick={() => setModalXlarge(false)}>Close</Button>
                    </div>
                </Modal>
            </div>
        </>
    );
};

StageModelCreation.propTypes = {
    galleryData: PropTypes.object.isRequired,
    compModelVerId: PropTypes.string.isRequired,
    compModelVerInfo: PropTypes.array.isRequired,
    cameraList: PropTypes.array.isRequired,
    setVersionData: PropTypes.func,
    type: PropTypes.string,
    showTrainImage: PropTypes.bool,
    responseMessage: PropTypes.string,
    selectedCameraLabel: PropTypes.string,
    remoteGallery: PropTypes.object,
    renderRemoteCameraGallery: PropTypes.func,
    renderCameraGallery: PropTypes.func,
    handleDeleteSelectedImages: PropTypes.func,
    imagesLength: PropTypes.number,
    selectedImages: PropTypes.array,
    switchCamera: PropTypes.func,
    cameraList: PropTypes.array,          // optional
    newAvailableCameras: PropTypes.array, // optional
    ImageUrl: PropTypes.string.isRequired,
    // Add any prop validations if needed
    urlSocket: PropTypes.object.isRequired,
    setRemoteGallery: PropTypes.func.isRequired
};

export default StageModelCreation;
