import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { image_url } from './imageUrl';

let ImageUrl = image_url;
console.log('ImageUrlImageUrl', ImageUrl)
let okCount1;
let notokCount1;

const StageImgCap = () => {
    const history = useHistory();

    // Basic Component Information
    const [compName, setCompName] = useState('');
    const [compCode, setCompCode] = useState('');
    const [modelName, setModelName] = useState('');
    const [position, setPosition] = useState('');
    const [type, setType] = useState('');

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
    const [regionSelection, setRegionSelection] = useState(false);
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
    console.log('cameraListcameraList', cameraList)
    const [pysclCameraList, setPysclCameraList] = useState([]);
    // State management
    const [connectedCameras, setConnectedCameras] = useState([]);
    const [defaultCamOrder, setDefaultCamOrder] = useState([]);
    const [modelInfo, setModelInfo] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newAvailableCameras, setNewAvailableCameras] = useState([]);
    const [selectedCameraLabel, setSelectedCameraLabel] = useState(null);
    console.log('selectedCameraLabel', selectedCameraLabel)
    const [showCameraSelector, setShowCameraSelector] = useState(false);


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
    const timerRef = useRef(null);
    const trainingStatusIntervalRef = useRef(null);



    useEffect(() => {
        debugImageData();
    }, [activeGroupData, labelName, selectedCameraLabel]);
    // Initialize component
    useEffect(() => {
        const initializeComponent = async () => {
            const db_info = JSON.parse(localStorage.getItem('db_info'));
            ImageUrl = `${image_url}${db_info?.db_name}/`;
            console.log('()componentDidMount');

            try {
                const zoom_values = JSON.parse(sessionStorage.getItem('zoom_values'));
                if (zoom_values) {
                    setZoomValue(zoom_values);
                }
                let compModelInfo = JSON.parse(sessionStorage.getItem('compModelData'));
                console.log('compMcompModelInfocompModelInfoodelInfo', compModelInfo)
                setModelInfo(compModelInfo)
                await getMUltiVInfo(compModelInfo);






                navigator.mediaDevices.addEventListener('devicechange', checkWebcam);
                await checkWebcam();
                window.history.pushState(null, "", window.location.href);
                window.addEventListener("popstate", blockBackNavigation);
            }
            catch (error) {
                console.error('/didmount ', error);
            }
            finally {
                setModelVersionLoading(false);
            }
        };

        initializeComponent();

        // Cleanup
        return () => {
            // Clear the interval to avoid memory leaks
            if (trainingStatusIntervalRef.current) {
                clearInterval(trainingStatusIntervalRef.current);
            }
            // Remove device change listener
            navigator.mediaDevices.removeEventListener('devicechange', checkWebcam);
            window.removeEventListener("popstate", blockBackNavigation);
        };
    }, []);

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


    const getMUltiVInfo = async (compModelInfo) => {
        console.log('compModelInfo', compModelInfo)
        try {
            const response = await urlSocket.post('/getMUltiVInfo_stg', { 'data': compModelInfo }, { mode: 'no-cors' });
            console.log('getMUltiVInfo', response)

        } catch (error) {
            console.log('error', error);
        }
    };


    const showRefOutline = async (data1, data2) => {
        console.log('data2', data2)
        try {
            const response = await urlSocket.post('/check_outline_stgchk', {
                'camera_mode': data2?.camera_selection,
                'parent_comp_id': data2.parent_comp_id,
                'stage_id': data2.stage_id,
                'comp_id': data2.comp_id,
                'model_id': data2.model_id,
            }, { mode: 'no-cors' });
            let getInfo = response.data;
            console.log('getInfo', getInfo)
            if (getInfo.error === "Tenant not found") {
                console.log("data error", getInfo.error);
                errorHandler(getInfo.error);
            }
            else {

                if (getInfo.show === 'yes') {
                    setShowOutline(true);
                    setCompInfo(getInfo.stage_info);
                    setStageInfo(getInfo.stage_info);

                    const stageInfo = getInfo.stage_info;
                    const cameraSelection = stageInfo.camera_selection || {};

                    if (cameraSelection.mode === 'single') {
                        // single camera → just one outline
                        setOutlinePath(stageInfo.datasets.white_path);
                    } else if (cameraSelection.mode === 'multi') {
                        // multi camera → store the entire datasets object
                        console.log('=== MULTI-CAMERA OUTLINE SETUP ===');
                        console.log('Cameras:', cameraSelection.cameras);
                        console.log('Stage datasets:', stageInfo.datasets);

                        // Store the entire datasets object so getCurrentOutlinePath can access any camera's data
                        setOutlinePath(stageInfo.datasets);

                        console.log('Set outlinePath to full datasets for multi-camera mode');
                        console.log('=== MULTI-CAMERA OUTLINE SETUP END ===');
                    }
                } else if (getInfo.show === 'no') {
                    setCaptureFixedRefimage(true);
                }

            }
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

    // Helper function to get the current outline path for the selected camera
    const getCurrentOutlinePath = () => {
        console.log('=== GET CURRENT OUTLINE PATH ===');
        console.log('outlinePath:', outlinePath);
        console.log('selectedCameraLabel:', selectedCameraLabel);
        console.log('defaultOutline:', defaultOutline);
        console.log('cameraList:', cameraList);

        if (!outlinePath) {
            console.log('No outline path available');
            return null;
        }

        // For single camera mode, outlinePath is a string
        if (typeof outlinePath === 'string') {
            console.log('Single camera mode, returning:', outlinePath);
            return outlinePath;
        }

        // For multi-camera mode, outlinePath is an object with camera keys
        if (typeof outlinePath === 'object' && selectedCameraLabel) {
            const selectedCamera = cameraList.find(cam => cam.originalLabel === selectedCameraLabel);
            console.log('Selected camera:', selectedCamera);

            if (selectedCamera) {
                // Try multiple possible key formats
                const possibleKeys = [
                    selectedCamera.label.trim().toLowerCase().replace(/\s+/g, "_"),
                    selectedCamera.label.trim().toLowerCase().replace(/\s+/g, "_").replace(/#/g, "_"),
                    selectedCamera.originalLabel?.trim().toLowerCase().replace(/\s+/g, "_"),
                    selectedCamera.originalLabel?.trim().toLowerCase().replace(/\s+/g, "_").replace(/#/g, "_"),
                ];

                console.log('Trying possible keys:', possibleKeys);
                console.log('Available outline keys:', Object.keys(outlinePath));

                for (const key of possibleKeys) {
                    if (outlinePath[key]) {
                        console.log(`Found outline data with key: ${key}`, outlinePath[key]);

                        // If it's an object with different outline colors, return the correct color path
                        if (typeof outlinePath[key] === 'object') {
                            let colorPath;

                            // Map outline label to path property
                            if (defaultOutline === 'White Outline') {
                                colorPath = outlinePath[key].white_path;
                            } else if (defaultOutline === 'Red Outline') {
                                colorPath = outlinePath[key].red_path;
                            } else if (defaultOutline === 'Green Outline') {
                                colorPath = outlinePath[key].green_path;
                            } else if (defaultOutline === 'Blue Outline') {
                                colorPath = outlinePath[key].blue_path;
                            } else if (defaultOutline === 'Black Outline') {
                                colorPath = outlinePath[key].black_path;
                            } else if (defaultOutline === 'Orange Outline') {
                                colorPath = outlinePath[key].orange_path;
                            } else if (defaultOutline === 'Yellow Outline') {
                                colorPath = outlinePath[key].yellow_path;
                            } else {
                                // Default to white if no match
                                colorPath = outlinePath[key].white_path;
                            }

                            console.log(`Returning ${defaultOutline} path:`, colorPath);
                            return colorPath;
                        } else {
                            console.log('Returning direct path:', outlinePath[key]);
                            return outlinePath[key];
                        }
                    }
                }

                console.log('No matching key found for camera');
            }
        }

        console.log('No valid outline path found');
        return null;
    };

    const getModelCreation = async (compModelVInfo) => {
        try {
            const response = await urlSocket.post('/getCompModel_ver_info_stg', { 'compModelInfo': compModelVInfo }, { mode: 'no-cors' });
            console.log('firstresponse', response)
            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                errorHandler(response.data.error);
            }
            else {
                let default_thres = rangeValue;
                const compModelVerInfoData = response.data.version_data;
                console.log('compModelVercompModelVerInfoDataInfoData', compModelVerInfoData)

                const myArray = [];
                myArray.push(compModelVerInfoData);
                const show_train_image = compModelVerInfoData?.sift_train_datasets?.length > 0 ? true : false;

                setRegionSelection(response.data.comp_data.region_selection);
                if (compModelVerInfoData.thres === undefined) {
                    console.log('first', myArray)
                    setCompModelVerInfo(myArray);
                    setRefersh(true);
                    setShowTrainImage(show_train_image);
                    setRangeValue(default_thres);
                }
                else {
                    console.log('two', myArray)
                    setCompModelVerInfo(myArray);
                    setRefersh(true);
                    setShowTrainImage(show_train_image);
                    setRangeValue(compModelVerInfoData.thres);
                }

                if (compModelVerInfoData.training_status === 'training_in_progress') {
                    setShowTrainingINProgs(true);
                }
                else if (compModelVerInfoData.training_status === 'admin accuracy testing in_progress') {
                    setAddAccTestInProg(true);
                    fetchTrainingStatus(myArray[0]);
                }
                else if (compModelVerInfoData.training_status === 'retrain') {
                    setShowRetrain(true);
                }

                if (compModelVerInfoData.training_status === 'training_in_progress' || compModelVerInfoData.training_status === 'retrain') {
                    trainingStatusIntervalRef.current = setInterval(() => fetchTrainingStatus(myArray[0]), 5000);
                }
                console.log('myArray[0],', myArray[0])
                setArray(myArray[0])
                imgGlry(myArray[0]);
            }
        } catch (error) {
            console.log('error', error);
        }
    };

    // Fix 2: Update the imgGlry function to avoid unnecessary calls
    const imgGlry = async (compModelVInfo, cameraLabelParam) => {
        console.log('compModelVInfo', compModelVInfo);

        // If a cameraLabel was passed, use it. Otherwise fallback to state.
        const cameraLabel = cameraLabelParam || selectedCameraLabel;

        const selectedCamera = cameraList.find(
            cam => cam.originalLabel === cameraLabel
        );

        // Normalize for backend
        const selectedCameraName = selectedCamera?.label.replace(/\s+/g, "_") || cameraLabel;
        console.log('Selected camera for backend:', selectedCameraName);

        try {
            const response = await urlSocket.post('/modelImages_stg', {
                compModelInfo: compModelVInfo,
                selectedCameraName
            }, { mode: 'no-cors' });

            console.log('response526', response);

            if (response.data.error === "Tenant not found") {
                errorHandler(response.data.error);
            } else {
                const compModelVerInfoData = response.data;

                const allModelVersions = compModelVerInfoData.flatMap(item => item.used_model_ver);
                const uniqueModelVersionsData = [...new Set(allModelVersions)].sort();

                const groupedDataResult = compModelVerInfoData.reduce((acc, item) => {
                    item.used_model_ver.forEach((version) => {
                        if (!acc[version]) acc[version] = [];
                        acc[version].push(item);
                    });
                    return acc;
                }, {});

                setImgGlr(compModelVerInfoData);
                setUniqueModelVersions(uniqueModelVersionsData);
                setGroupedData(groupedDataResult);
                setActiveGroupData(groupedDataResult);
            }
        } catch (error) {
            console.log('error', error);
        }
    };



    const getConfigInfo = async (result_mode) => {
        try {
            const response = await urlSocket.post('/config', { mode: 'no-cors' });
            console.log('/config ', response);
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


    // Fix 3: Update the startLiveCamera function to prevent unnecessary imgGlry calls
    const startLiveCamera = (selectFilterVal, lable_name_val, tab) => {
        let img_length = imagesLengthCalc(activeGroupData, compModelVerInfo[0].model_ver, lable_name_val);

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

        // Only call imgGlry if we don't have data or the camera has changed
        if (!imgGlr || imgGlr.length === 0 || !activeGroupData || Object.keys(activeGroupData).length === 0) {
            imgGlry(array);
        }

        // Simulate slow enable process for demonstration
        setTimeout(() => {
            setWebcamEnabled(true);
        }, 1000);
    };





    // Fix 4: Update the captureImage function to refresh gallery data only after successful capture
    const captureImage = async (labelNameVal) => {
        console.log('labelNameVal', labelNameVal)
        if (isNaN(noOfRotation)) {
            Swal.fire({
                icon: 'info',
                title: 'No. of rotations required',
                confirmButtonText: 'OK',
            }).then((result) => {
                if (result.isConfirmed) {
                    setNoOfRotation(0);
                } else {
                    console.log('User canceled');
                }
            });
        } else {
            setAddingImage(true);

            const imageSrcData = await webcamRef.current.captureZoomedImage();
            console.log('first', selectedCameraLabel)

            if (!imageSrcData) {
                setImageSrcNone(true);
                setAddingImage(false);
                return;
            }

            const selectedCamera = cameraList.find(
                (cam) => cam.originalLabel === selectedCameraLabel
            );

            const selectedCameraName = selectedCamera?.label.replace(/\s+/g, "_");

            console.log('selectedCameraName', selectedCameraName, selectedCameraLabel, selectedCamera?.label)

            setImageSrc(imageSrcData);
            const blob = dataURLtoBlob(imageSrcData);
            const formData = new FormData();
            let imgUuid = uuidv4();
            formData.append('_id', compModelVerInfo[0]._id);
            formData.append('labelName', labelNameVal);
            formData.append('image_rotation', noOfRotation);
            formData.append('imgName', blob, imgUuid + '.png');
            formData.append('camera_originalLabel', selectedCameraLabel);
            formData.append('camera_label', selectedCameraName);

            try {
                console.log('formData', formData)
                const response = await urlSocket.post('/addImage_stg', formData, {
                    headers: {
                        'content-type': 'multipart/form-data'
                    },
                    mode: 'no-cors'
                });
                console.log('responseaddImage_stg', response)
                let getInfo = response.data;
                if (getInfo.error === "Tenant not found") {
                    console.log("data error", getInfo.error);
                    errorHandler(getInfo.error);
                }
                else {
                    if (getInfo.message === 'Image successfully added') {
                        setResponseMessage(getInfo.message);
                        console.log('three', getInfo.comp_model_ver_info_list)
                        setCompModelVerInfo(getInfo.comp_model_ver_info_list);
                        setRefersh(true);
                        setImagesLength(getInfo.img_count);
                        setAddingImage(false);

                        // Refresh gallery data after successful image addition
                        await imgGlry(compModelVerInfo[0]);
                    }
                    else {
                        setResponseMessage(getInfo.message);
                        setAddingImage(false);
                    }

                    setTimeout(() => {
                        setResponseMessage("");
                    }, 1000);
                }
            } catch (error) {
                console.log('error', error);
                setAddingImage(false);
            }
        }
    };
    const debugImageData = () => {
        console.log('=== DEBUG IMAGE DATA ===');
        console.log('activeGroupData:', activeGroupData);
        console.log('imgGlr:', imgGlr);
        console.log('labelName:', labelName);
        console.log('compModelVerInfo[0].model_ver:', compModelVerInfo[0]?.model_ver);
        console.log('selectedCameraLabel:', selectedCameraLabel);
        console.log('cameraList:', cameraList);

        // Check if we have images for the current label
        const currentVersionImages = Object.entries(activeGroupData).filter(([version, items]) => {
            return compModelVerInfo[0]?.model_ver === parseInt(version);
        });

        console.log('currentVersionImages:', currentVersionImages);

        currentVersionImages.forEach(([version, items]) => {
            const labelImages = items.filter(item =>
                item.imagePathType &&
                item.imagePathType[0] &&
                item.imagePathType[0].type === labelName
            );
            console.log(`Images for version ${version} and label ${labelName}:`, labelImages);
        });
        console.log('=== END DEBUG ===');
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

    const getImages = (data1) => {
        const baseurl = ImageUrl;
        if (data1 && data1.image_path) {
            let result = data1.image_path.replace(/\\/g, "/");
            result = encodeURI(result);
            const output = baseurl + String(result);
            console.log('image output', output);
            return output;
        }
        return null;
    };

    const deleteImageClick = async (data, ver, labelNameVal) => {
        try {
            let idxVal = data.used_model_ver.indexOf(ver);
            let imgName = data.imagePathType[idxVal].image_path;
            let fileName = data.filename;
            const formData = new FormData();
            formData.append('_id', compModelVerInfo[0]._id);
            formData.append('model_ver', parseInt(data.org_model_ver));
            formData.append('labelName', labelNameVal);
            formData.append('fileName', fileName);
            formData.append('imgName', imgName);
            formData.append('stage_name', compModelVerInfo[0].stage_name);
            formData.append('stage_code', compModelVerInfo[0].stage_code);
            formData.append('_compId', compModelVerInfo[0].parent_comp_id);
            formData.append('model_name', compModelVerInfo[0].model_name);
            formData.append('model_id', compModelVerInfo[0].model_id);
            formData.append('training_status', compModelVerInfo[0].training_status);
            formData.append('model_status', compModelVerInfo[0].model_status);
            formData.append('stage_id', compModelVerInfo[0].stage_id);

            const response = await urlSocket.post('/delete_image_stg', formData, {
                headers: {
                    'content-type': 'multipart/form-data'
                },
                mode: 'no-cors'
            });
            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                errorHandler(response.data.error);
            }
            else {
                setResponseMessage(response.data.message);
                console.log('four', response.data.comp_model_ver_info_list)
                setCompModelVerInfo(response.data.comp_model_ver_info_list);
                setImagesLength(response.data.img_count);
                setActiveGroupData(prev => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach(version => {
                        updated[version] = updated[version].filter(item => item.filename !== fileName);
                    });
                    return updated;
                });

                // ✅ Also clear from selected images if selected
                setSelectedImages(prev => prev.filter(img => img.filename !== fileName));


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


    const train = async (data, index) => {
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
                console.log('firstconfig', data, config)

                const updatedCompModelVerInfo = [...compModelVerInfo];
                updatedCompModelVerInfo[0].training_status_id = 0;
                updatedCompModelVerInfo[0].training_start_time = '00:00:00';
                console.log('five', updatedCompModelVerInfo)
                setCompModelVerInfo(updatedCompModelVerInfo);
                setRefersh(true);
                setShowTrainingINProgs(true);

                trainingStatusIntervalRef.current = setInterval(() => fetchTrainingStatus(data), 5000);

                try {
                    const response = await urlSocket.post('/Train_stg', {
                        compModelVerInfo: data,
                        config: config
                    }, { mode: 'no-cors' });
                    console.log('response', response)
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

    const fetchTrainingStatus = async (data) => {
        try {
            const response = await urlSocket.post('/getTrainingStatus_stg', { 'compModelVerInfo': data }, { mode: 'no-cors' });
            const updatedCompModelVerInfo = response.data;
            console.log('six', updatedCompModelVerInfo)
            setCompModelVerInfo(updatedCompModelVerInfo);
            setRefersh(true);

            if (updatedCompModelVerInfo[0].training_status === 'training completed') {
                updatedCompModelVerInfo[0].training_status_id = 4;
                updatedCompModelVerInfo[0].training_status = 'training completed';
                setShowTrainingINProgs(false);
                setRefersh(true);
                clearInterval(trainingStatusIntervalRef.current);
            }
            else if (updatedCompModelVerInfo[0].training_status === 'admin approved trained model') {
                setShowTrainingINProgs(false);
                setRefersh(true);
                clearInterval(trainingStatusIntervalRef.current);
            }
            else if (updatedCompModelVerInfo[0].training_status !== 'training_in_progress' && updatedCompModelVerInfo[0].training_status !== 'training_queued') {
                setShowTrainingINProgs(false);
                setShowRetrain(false);
                setRefersh(true);
                clearInterval(trainingStatusIntervalRef.current);
            }

            if (updatedCompModelVerInfo[0].training_status === 'training_in_progress' || updatedCompModelVerInfo[0].training_status === 'training_queued') {
                setShowTrainingINProgs(true);
            }
            else if (updatedCompModelVerInfo[0].training_status === 'retrain') {
                setShowRetrain(true);
            }
        } catch (error) {
            console.log('Error fetching training status:', error);
        }
    };

    const closeAdminTestOptions = () => {
        setShowTestingOptions(false);
    };

    const continueAdminTest = (selected_options) => {
        setShowTestingOptions(false);
        console.log('selected options: ', selected_options);

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
        console.log('ask_testing_type', ask_testing_type, data);

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

        console.log('options::: ', options);

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

        console.log('values ', values);

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
                console.log('seven', getInfo.comp_model_ver_info_list)
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
                            console.log('eight', response.data.comp_model_ver_info_list)
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

    const versionHide = (ids) => {
        const updatedHidVer = [...hidVer];
        const index = updatedHidVer.indexOf(ids);
        if (index !== -1) {
            updatedHidVer.splice(index, 1);
        } else {
            updatedHidVer.push(ids);
        }
        setHidVer(updatedHidVer);
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
        let img_paths_to_delete;

        if (img_path) {
            img_paths_to_delete = [img_path];
        } else {
            // ✅ use selectedImages instead of imgPaths
            img_paths_to_delete = selectedImages.map(img => img.imagePathType[0].image_path);
        }

        if (img_paths_to_delete.length === 0) {
            Swal.fire({
                title: 'No items selected',
                icon: 'info',
                timer: 1500,
                showConfirmButton: false,
            });
            return;
        }

        Swal.fire({
            title: `Delete ${img_paths_to_delete.length} item${img_paths_to_delete.length > 1 ? 's' : ''}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                imgDeletion(img_paths_to_delete);   // ✅ pass the list
            }
        });
    };


    const imgDeletion = async (img_paths_to_delete) => {
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
            formData.append('_id', compModelVerInfo[0]._id);
            formData.append('labelName', labelName);
            formData.append('img_paths', JSON.stringify(img_paths_to_delete));  // ✅ actual selected paths
            formData.append('type', type);
            formData.append('position', position);

            const response = await urlSocket.post('/deleteSelectedImage_stg', formData, {
                headers: {
                    'content-type': 'multipart/form-data'
                },
                mode: 'no-cors'
            });

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

        setSelectedImages([]);  // ✅ clear after deletion
    };


    const multiImgDelete = (items, img_label) => {
        const allSelected = selectedImages.length === items.length;
        const updatedSelectedImages = allSelected ? [] : items;

        let std_img_paths = [];
        let ver = compModelVerInfo[0].model_ver;

        updatedSelectedImages.forEach((item, itemId) => {
            let idxVal = item.used_model_ver.indexOf(parseInt(ver));
            let imgName = item.imagePathType[idxVal].image_path;

            if (item.imagePathType[idxVal].type === img_label) {
                std_img_paths.push(imgName);
            }
        });

        setSelectedImages(updatedSelectedImages);
        setImgPaths(std_img_paths);
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
                console.log('ten', response.data)
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
                console.log('eleven', response.data)
                setCompModelVerInfo(response.data);
            }
        } catch (error) {
            console.log('error', error);
        }
    };


    // Generate a unique port number based on camera index and device ID
    const generatePortNumber = (camIndex, deviceId) => {
        // Base port number starting from 8000
        const basePort = 8000;
        // Use camera index or generate from deviceId hash
        const indexPort = camIndex !== undefined ? camIndex : 0;
        // Create a simple hash from deviceId for uniqueness
        const deviceHash = deviceId ? deviceId.slice(-4) : '0000';
        const hashNumber = parseInt(deviceHash, 16) % 1000;

        return (basePort + indexPort * 10 + (hashNumber % 10)).toString();
    };
    // Extract port information from camera label
    const extractPortInfo = (label) => {
        let v_id = '', p_id = '', portNumber = '';

        if (label && label.includes('(') && label.includes(')')) {
            const portInfo = label.slice(label.indexOf('(') + 1, label.indexOf(')'));
            const parts = portInfo.split(':');
            v_id = parts[0] || '';
            p_id = parts[1] || '';

            // Extract port number - could be in various formats
            // Looking for patterns like "port:1234" or just numbers
            const portMatch = portInfo.match(/port[:\s]*(\d+)|(\d{4,})/i);
            if (portMatch) {
                portNumber = portMatch[1] || portMatch[2];
            }
        }

        return { v_id, p_id, portNumber };
    };


    const checkWebcam = useCallback(async () => {
        try {
            // Now enumerate devices
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

                console.log('Available cameras with full data:', newAvailableCameras);
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

    // Function to match cameras from cameraList with newAvailableCameras
    const getMatchedCameras = () => {
        if (!cameraList.length || !newAvailableCameras.length) return [];

        return cameraList.map(configCamera => {
            // Find matching camera in newAvailableCameras by comparing p_id, v_id, and originalLabel
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


    // 4. Update the camera switching function to reload images
    const switchCamera = (cameraLabel) => {
        console.log('=== SWITCHING CAMERA ===');
        console.log('Switching to camera:', cameraLabel);

        setSelectedCameraLabel(cameraLabel);
        setShowCameraSelector(false);

        // Reload images for the selected camera (pass cameraLabel directly)
        if (compModelVerInfo && compModelVerInfo[0]) {
            imgGlry(compModelVerInfo[0], cameraLabel);
        }

        // Update outline for the selected camera if in multi-camera mode
        if (stageInfo?.camera_selection?.mode === 'multi' && showOutline) {
            console.log('Updating outline for multi-camera mode');
            newOutlineChange(defaultOutline);
        }

        console.log('=== CAMERA SWITCH COMPLETE ===');
    };




    const newOutlineChange = (ot_label) => {
        console.log('=== OUTLINE CHANGE ===');
        console.log('ot_label', ot_label);
        console.log('stageInfo.datasets:', stageInfo?.datasets);
        setDefaultOutline(ot_label);

        // Handle multi-camera mode
        if (stageInfo?.camera_selection?.mode === 'multi') {
            console.log('Multi-camera mode detected');

            // For multi-camera mode, we need to store the entire datasets object
            // so that getCurrentOutlinePath can access the correct color for each camera
            setOutlinePath(stageInfo.datasets);

            console.log('Set outlinePath to full datasets:', stageInfo.datasets);
        } else {
            // Handle single camera mode (original logic)
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
        // Group images by camera using originalLabel as the key
        const imagesByCamera = {};

        Object.entries(activeGroupData).forEach(([version, items]) => {
            if (compModelVerInfo[0].model_ver === parseInt(version)) {
                items.forEach(item => {
                    if (
                        item.imagePathType &&
                        item.imagePathType[0] &&
                        item.imagePathType[0].type === labelName
                    ) {
                        // ✅ use originalLabel from image metadata if available
                        const cameraKey = normalizeCameraKey(item.imagePathType[0].camera);
                        if (!imagesByCamera[cameraKey]) {
                            imagesByCamera[cameraKey] = [];
                        }
                        imagesByCamera[cameraKey].push({ item, version });
                    }
                });
            }
        });

        // Filter based on selectedCameraLabel
        const filteredImagesByCamera = selectedCameraLabel
            ? (() => {
                const selectedCamera = cameraList.find(
                    cam => cam.originalLabel === selectedCameraLabel
                );
                if (!selectedCamera) return imagesByCamera;

                const cameraKey = normalizeCameraKey(selectedCamera.label);

                return imagesByCamera[cameraKey]
                    ? { [cameraKey]: imagesByCamera[cameraKey] }
                    : {};
            })()
            : imagesByCamera;

        console.log("filteredImagesByCamera", filteredImagesByCamera, selectedCameraLabel);
        console.log("imagesByCamera", imagesByCamera);
        console.log("labelName", labelName);

        return Object.entries(filteredImagesByCamera).map(
            ([cameraKey, cameraImages], cameraIndex) => {
                // Find the camera config that matches this originalLabel
                const camera = cameraList.find(
                    cam => normalizeCameraKey(cam.label) === cameraKey
                );
                const displayName = camera ? camera.label : cameraKey.replace(/_/g, " ");
                const isOnline =
                    camera &&
                    newAvailableCameras.some(availCam => availCam.label === camera.originalLabel);

                return (
                    <div key={cameraIndex} className="mb-4">
                        {/* Camera Section Header */}
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
                                                // Add all images from this camera (avoiding duplicates)
                                                const newItems = cameraImages.map(({ item }) => item);
                                                const merged = [...new Set([...selectedImages, ...newItems])];
                                                setSelectedImages(merged);
                                            } else {
                                                // Remove all images from this camera
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
                                                            onConfirm={() =>
                                                                deleteImageClick(
                                                                    item,
                                                                    compModelVerInfo[0].model_ver,
                                                                    labelName
                                                                )
                                                            }
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


    const showImage = (output_img) => {
        console.log('output_img : ', output_img);

        let pathToUse;

        // Handle the camera-based image path structure
        if (typeof output_img === 'string') {
            pathToUse = output_img;
        } else if (Array.isArray(output_img)) {
            pathToUse = output_img[0];
        } else if (typeof output_img === 'object' && !Array.isArray(output_img)) {
            // For multi-camera mode with selected camera
            if (selectedCameraLabel) {
                const selectedCamera = cameraList.find(cam => cam.originalLabel === selectedCameraLabel);
                if (selectedCamera) {
                    const normalizedLabel = selectedCamera.label.trim().toLowerCase().replace(/\s+/g, "_");
                    pathToUse = output_img[normalizedLabel];
                    console.log('Multi-camera mode - using path for camera:', normalizedLabel, pathToUse);
                }
            }
            // Fallback to first available path
            if (!pathToUse) {
                pathToUse = Object.values(output_img)[0];
            }
        }

        if (!pathToUse) {
            console.warn('No valid path found in output_img:', output_img);
            return '';
        }

        // Process the path to get the correct URL
        const parts = pathToUse.split("/");
        const newPath = parts.slice(1).join("/");

        let startIndex;
        if (newPath.includes("Datasets/")) {
            startIndex = newPath.indexOf("Datasets/");
        } else {
            startIndex = newPath.indexOf("receive/");
        }

        const relativePath = newPath.substring(startIndex);
        console.log('Final image URL: ', ImageUrl + relativePath);
        return `${ImageUrl + relativePath}`;
    };


    const setVersionData = (value) => {
        const show_train_image = value?.sift_train_datasets?.length > 0 ? true : false;
        console.log('twlene', [value])
        setCompModelVerInfo([value]);
        setShowTrainImage(show_train_image);
    };

    const changeShowTrainImages = (data) => {
        const value = data === 0 ? false : true;
        setShowTrainImage(value);
    };

    const imageSelectAll = (e) => {
        console.log('1st', new Date());
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
        console.log('2nd ', new Date());
    };

    const getImgPath = (img_path) => {
        console.log('ImageUrl+img_path', ImageUrl + img_path);
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

    const tooltipFormatter = (value) => {
        if (value === 0) {
            return 'Min';
        } else if (value === 1) {
            return 'Max';
        } else {
            return (value);
        }
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
                            <Row className="d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-2 mb-2">
                                <Col xs="12" lg="auto" className="text-left">
                                    <CardTitle className="mb-0 "><span className="me-2 font-size-12">Component Name :</span>{compName}</CardTitle>
                                    <CardText className="mb-0"><span className="me-2 font-size-12">Component Code :</span>{compCode}</CardText>
                                    <CardText className="mb-0"><span className="me-2 font-size-12">Model Name:</span>{modelName}</CardText>
                                    <CardText className="mb-0"><span className="me-2 font-size-12">Type:</span>{type}</CardText>
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
                                        {/* version data in Table */}
                                        {
                                            refersh ?
                                                <div className='table-responsive mt-2 mb-4'>
                                                    <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th>Model Version</th>
                                                                <th>Model Status</th>
                                                                <th>Created on</th>
                                                                <th>Approved on</th>
                                                                <th>Live on</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
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
                                                                        <td style={{ backgroundColor: "white" }}>{'V'}{data.model_ver}</td>
                                                                        <td style={{ backgroundColor: "white" }}>
                                                                            <span className={data.model_status === 'Live' ? 'badge badge-soft-success' : data.model_status === 'Approved' ? 'badge badge-soft-warning' : data.model_status === 'Draft' ? 'badge badge-soft-info' : 'badge badge-soft-danger'}>
                                                                                {data.model_status}
                                                                            </span>
                                                                        </td>
                                                                        <td style={{ backgroundColor: "white" }}>{data.created_on}</td>
                                                                        <td style={{ backgroundColor: "white" }}>{data.approved_on}</td>
                                                                        <td style={{ backgroundColor: "white" }}>{data.live_on}</td>
                                                                        <td style={{ backgroundColor: "white", fontSize: '18px' }} >
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
                                                                                    console.log('firstisTrainingInProgress', showTrainingINProgs, isInactive, isTrainingInProgress, allCamerasTrained)
                                                                                }

                                                                                {
                                                                                    // !(data.type === 'ML') &&
                                                                                    // !showTrainingINProgs && !isInactive && !isTrainingInProgress && (
                                                                                    //     isTrainingCompleted ? (
                                                                                    //         <Button className='btn btn-sm' color='success' onClick={() => startAdminTest(data)}>
                                                                                    //             Start Admin Accuracy Test
                                                                                    //         </Button>
                                                                                    //     ) : (() => {
                                                                                    //         if (isTrainingInProgress || !isTrainingNotStarted) return null;

                                                                                    //         const { result_mode } = compModelVerInfo[0];
                                                                                    //         const minOk = Number(config[0]?.min_ok_for_training);
                                                                                    //         const minNotOk = Number(config[0]?.min_notok_for_training);

                                                                                    //         const canTrain =
                                                                                    //             (result_mode === "both" && okCount >= minOk && notokCount >= minNotOk) ||
                                                                                    //             (result_mode === "ng" && notokCount >= minNotOk) ||
                                                                                    //             (result_mode === "ok" && okCount >= minOk);

                                                                                    //         console.log('canTrain', canTrain, minOk, minNotOk)

                                                                                    //         return canTrain ? (
                                                                                    //             <Button className='btn btn-sm' color="primary" onClick={() => train(data)}>
                                                                                    //                 Train
                                                                                    //             </Button>
                                                                                    //         ) : null;
                                                                                    //     })()
                                                                                    // )

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

                                                                                            console.log('canTrain', canTrain, minOk, minNotOk);

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
                                                                                                    {/* bhrani */}
                                                                                                    {/* {
                                                                                                        data?.region_selection ?
                                                                                                            <div className='d-flex flex-column'>
                                                                                                                <h5>Regions</h5>
                                                                                                                {data?.rectangles?.map((region, region_id) => (
                                                                                                                    <div key={region_id} className='d-flex flex-column'>
                                                                                                                        <h5>{region_id + 1}. {region.name}</h5>
                                                                                                                        <Row>
                                                                                                                            {region.training_status_id === 0 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="primary" value={100} animated>Loading...</Progress></Progress>}
                                                                                                                            {region.training_status_id === 1 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={20}>20%</Progress><Progress bar color="primary" value={80} animated></Progress></Progress>}
                                                                                                                            {region.training_status_id === 2 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={40}>40%</Progress><Progress bar color="primary" value={60} animated></Progress></Progress>}
                                                                                                                            {region.training_status_id === 3 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={60}>60%</Progress><Progress bar color="primary" value={40} animated></Progress></Progress>}
                                                                                                                            {region.training_status_id === 4 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={80}>80%</Progress><Progress bar color="primary" value={20} animated></Progress></Progress>}
                                                                                                                            {region.training_status_id === 5 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={100}>100%</Progress></Progress>}
                                                                                                                        </Row>
                                                                                                                    </div>
                                                                                                                ))}
                                                                                                            </div>
                                                                                                            : null
                                                                                                    } */}

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
                                                                {compModelVerInfo.map((data, index) => (
                                                                    data.model_status !== 'Inactive' && (
                                                                        <React.Fragment key={index}>
                                                                            {data.model_status !== 'Live' && (
                                                                                <NavItem>
                                                                                    <NavLink
                                                                                        style={{
                                                                                            cursor: 'pointer',
                                                                                            color: customActiveTab === '2' ? 'red' : '',
                                                                                            fontSize: '20px',
                                                                                            fontWeight: customActiveTab === '2' ? 'bold' : '',
                                                                                        }}
                                                                                        outline={selectFilter !== 1}
                                                                                        className={classnames({ active: customActiveTab === '2' })}
                                                                                        onClick={() => startLiveCamera(1, 'OK', '2')}
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
                                                                                                cursor: 'pointer',
                                                                                                color: customActiveTab === '1' ? 'green' : '',
                                                                                                fontSize: '20px',
                                                                                                fontWeight: customActiveTab === '1' ? 'bold' : '',
                                                                                            }}
                                                                                            outline={selectFilter !== 0}
                                                                                            className={classnames({ active: customActiveTab === '1' })}
                                                                                            onClick={() => getImgGalleryInfo(0, 'OK', '1')}
                                                                                        >
                                                                                            Image Gallery
                                                                                        </NavLink>
                                                                                    </NavItem>
                                                                                )}
                                                                        </React.Fragment>
                                                                    )
                                                                ))}
                                                            </Nav>
                                                        </div>
                                                    </TabPane>

                                                    <TabPane tabId="2">
                                                        <div>
                                                            <Nav tabs>
                                                                {compModelVerInfo.map((data, index) => (
                                                                    data.model_status !== 'Live' && (
                                                                        <NavItem key={index}>
                                                                            <NavLink
                                                                                style={{
                                                                                    cursor: "pointer",
                                                                                    color: customActiveTab === '4' ? 'red' : '',
                                                                                    fontSize: '20px',
                                                                                    fontWeight: customActiveTab === '4' ? 'bold' : ''
                                                                                }}
                                                                                outline={selectFilter !== 4}
                                                                                className={classnames({ active: customActiveTab === "4" })}
                                                                                onClick={() => startLiveCamera(4, 'NG', '4')}
                                                                            >
                                                                                Live Camera
                                                                            </NavLink>
                                                                        </NavItem>
                                                                    )
                                                                ))}
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
                                                        <Col sm={6} md={6} lg={6}>
                                                            <Card>
                                                                <CardBody>
                                                                    {type === 'ML' &&
                                                                        <>
                                                                            <CardTitle className='mb-4'>
                                                                                <div>
                                                                                    Capture Image for Reference
                                                                                </div>
                                                                            </CardTitle>
                                                                        </>
                                                                    }
                                                                    {type !== 'ML' &&
                                                                        <>
                                                                            <CardTitle className='mb-4'>Capture Image for Training</CardTitle>
                                                                            <label>
                                                                                {showLabelName} component (minimum required image: {reqImgCount})
                                                                                No. of Added Images:
                                                                                {
                                                                                    showLabelName === config[0]?.positive ? okCount1 :
                                                                                        showLabelName === config[0]?.negative ? notokCount1 :
                                                                                            null
                                                                                }
                                                                            </label>
                                                                        </>
                                                                    }
                                                                    {
                                                                        position === 'Fixed' &&
                                                                        <>
                                                                            <div className='my-3'>
                                                                                <Row>
                                                                                    <Col>
                                                                                        <Checkbox
                                                                                            type="checkbox"
                                                                                            checked={showOutline}
                                                                                            onChange={() => toggleShowOutline()}
                                                                                        >Show Outline</Checkbox>
                                                                                    </Col>
                                                                                </Row>
                                                                            </div>

                                                                            <Row className='my-2'>
                                                                                <Col>
                                                                                    {
                                                                                        showOutline &&
                                                                                        <div className='d-flex my-auto'>
                                                                                            <Label className='my-auto'>Outline Color : </Label>
                                                                                            <div className='mx-3 d-flex'>
                                                                                                {
                                                                                                    outlineColors.map((otline, otl_id) => (
                                                                                                        <Button
                                                                                                            key={otl_id}
                                                                                                            className='mx-1'
                                                                                                            style={{
                                                                                                                backgroundColor:
                                                                                                                    otline === "White Outline" ? 'white' :
                                                                                                                        otline === "Blue Outline" ? 'blue' :
                                                                                                                            otline === "Black Outline" ? 'black' :
                                                                                                                                otline === "Orange Outline" ? 'orange' :
                                                                                                                                    otline === "Yellow Outline" ? 'yellow' : 'gray',
                                                                                                                boxShadow: defaultOutline === otline && '0px 0px 5px 2px rgba(0, 0, 0, 0.5)',
                                                                                                                border: otline === "White Outline" ? 'auto' : 'none'
                                                                                                            }}
                                                                                                            outline={defaultOutline !== otline}
                                                                                                            onClick={() => { newOutlineChange(otline) }}
                                                                                                        ></Button>
                                                                                                    ))
                                                                                                }
                                                                                            </div>
                                                                                        </div>
                                                                                    }
                                                                                </Col>
                                                                            </Row>
                                                                        </>
                                                                    }


                                                                    {/* Debug Info for Multi-Camera Outline */}
                                                                    {/* {cameraList.length > 1 && process.env.NODE_ENV === 'development' && (
                                                                        <div className="mb-2 p-2 bg-light border rounded">
                                                                            <small>
                                                                                <strong>Debug Info:</strong><br/>
                                                                                Selected Camera: {selectedCameraLabel}<br/>
                                                                                Outline Type: {typeof outlinePath}<br/>
                                                                                Current Outline: {getCurrentOutlinePath() ? 'Available' : 'None'}<br/>
                                                                                {typeof outlinePath === 'object' && (
                                                                                    <>Available Cameras: {Object.keys(outlinePath).join(', ')}</>
                                                                                )}
                                                                            </small>
                                                                        </div>
                                                                    )} */}

                                                                    {cameraList.length > 0 && (
                                                                        <div className="mb-3">
                                                                            <div className="d-flex gap-2 flex-wrap mb-2">
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

                                                                                        <span style={{ fontWeight: 'bold', color: camera ? '#fafafaff' : '#dc3545' }}>
                                                                                            {camera.label}
                                                                                        </span>

                                                                                    </Button>
                                                                                ))}
                                                                            </div>


                                                                        </div>
                                                                    )}


                                                                    <div className="containerImg">
                                                                        {!webcamEnabled && <p className="small-text">Camera is not started. Please wait...</p>}
                                                                        {webcamEnabled && (
                                                                            cameraDisconnected ?
                                                                                <div className='my-2' style={{ outline: '2px solid #000', padding: '10px', borderRadius: '5px', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                                                                                    <div className='d-flex flex-column justify-content-center align-items-center webcam-disconnected' style={{ width: '100%' }}>
                                                                                        <h5 style={{ fontWeight: 'bold' }}>Webcam Disconnected</h5>
                                                                                        <Spinner className='mt-2' color="primary" />
                                                                                        <h6 className='mt-2' style={{ fontWeight: 'bold' }}>Please check your webcam connection....</h6>
                                                                                    </div>
                                                                                </div>
                                                                                :
                                                                                <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
                                                                                    {
                                                                                        console.log('=== OUTLINE RENDER CHECK ===')
                                                                                    }
                                                                                    {
                                                                                        console.log('showOutline:', showOutline)
                                                                                    }
                                                                                    {
                                                                                        console.log('outlinePath:', outlinePath)
                                                                                    }
                                                                                    {
                                                                                        console.log('selectedCameraLabel:', selectedCameraLabel)
                                                                                    }
                                                                                    {
                                                                                        console.log('getCurrentOutlinePath():', getCurrentOutlinePath())
                                                                                    }

                                                                                    {
                                                                                        showOutline &&
                                                                                        getCurrentOutlinePath() &&

                                                                                        <img
                                                                                            style={{
                                                                                                width: '100%',
                                                                                                position: 'absolute',
                                                                                                height: 'auto',
                                                                                                zIndex: '1',
                                                                                            }}
                                                                                            src={showImage(getCurrentOutlinePath())}
                                                                                            alt="Outline overlay"
                                                                                        />
                                                                                    }
                                                                                    <WebcamCapture
                                                                                        ref={webcamRef}
                                                                                        resolution={DEFAULT_RESOLUTION}
                                                                                        videoConstraints={{
                                                                                            width: DEFAULT_RESOLUTION.width,
                                                                                            height: DEFAULT_RESOLUTION.height,
                                                                                        }}
                                                                                        zoom={zoomValue?.zoom}
                                                                                        center={zoomValue?.center}
                                                                                        cameraLabel={selectedCameraLabel}
                                                                                    />
                                                                                </div>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        {
                                                                            addingImage ?
                                                                                <Button className="btn btn-sm w-md" color='info' style={{ whiteSpace: 'pre' }} disabled>
                                                                                    Adding Images...  <Spin spinning={true}></Spin>
                                                                                </Button>
                                                                                :
                                                                                (webcamEnabled && cameraDisconnected === false) &&
                                                                                <Button className="btn btn-sm w-md" color='primary' onClick={() => captureImage(labelName)}>Add Image</Button>
                                                                        }
                                                                        {
                                                                            addingTrainImage &&
                                                                            <Button className="btn btn-sm w-md ms-3" color='info' style={{ whiteSpace: 'pre' }} disabled>
                                                                                Adding Train Image...  <Spin spinning={true}></Spin>
                                                                            </Button>
                                                                        }
                                                                    </div>
                                                                </CardBody>
                                                            </Card>
                                                        </Col>

                                                        <Col className='scrlHide' sm={6} md={6} lg={6} style={{ boxShadow: '0px 0px 10px grey', borderRadius: '5px', height: '70vh', overflowY: 'auto' }}>
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

                                                                    {/* Camera-wise Image Display Header */}

                                                                    <CardBody>
                                                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                                                            <h5 className="mb-0" style={{ fontWeight: 'bold', color: '#333' }}>
                                                                                Camera Gallerys
                                                                            </h5>
                                                                            <span className="badge badge-info">
                                                                                Active: {selectedCameraLabel || 'No Camera Selected'}
                                                                            </span>
                                                                        </div>

                                                                        {cameraList.length > 1 && (
                                                                            <div className="mb-3">
                                                                                <div className="d-flex flex-wrap gap-2">
                                                                                    {/* <Button
                                                                                        size="sm"
                                                                                        color={!selectedCameraLabel ? "primary" : "outline-primary"}
                                                                                        // onClick={() => setSelectedCameraLabel(null)}
                                                                                        onClick={() => switchCamera(null)}

                                                                                    >
                                                                                        All Cameras
                                                                                    </Button> */}
                                                                                    {console.log("cameraList", cameraList)}
                                                                                    {cameraList.map((camera, index) => (
                                                                                        <Button
                                                                                            key={index}
                                                                                            size="sm"
                                                                                            color={selectedCameraLabel === camera.originalLabel ? "primary" : "outline-primary"}
                                                                                            onClick={() => switchCamera(camera.originalLabel)}
                                                                                        >
                                                                                            {camera.label}
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
                                                                                    {/* <div>
                                                                                        <strong>Total Images: {imagesLength}</strong>
                                                                                    </div>
                                                                                    <div>
                                                                                        <strong>Selected: {selectedImages.length}</strong>
                                                                                    </div> */}
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

                                                            {/* ML Type Camera Gallery */}
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
                                                                                            {/* Camera Selection for ML Type */}
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

StageImgCap.propTypes = {
    // Add any prop validations if needed
};

export default StageImgCap;

////bharani----

// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import { useHistory } from "react-router-dom";
// import PropTypes from "prop-types";
// import MetaTags from 'react-meta-tags';
// import {
//     Container, CardTitle, Button, Table, Label, Row, Col,
//     CardBody, Modal, Card, Progress, Nav, NavItem, NavLink,
//     TabContent, TabPane, Spinner, ModalBody, CardText,
//     FormGroup,
//     Input,
//     UncontrolledTooltip
// } from 'reactstrap';
// import Webcam from "react-webcam";

// import { v4 as uuidv4 } from 'uuid';
// import Cookies from 'js-cookie';
// import { Popconfirm, Image, Slider, Tooltip, Spin } from 'antd';
// import { DeleteTwoTone, CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons';
// import moment from 'moment';
// import Swal from 'sweetalert2';
// import { Draggable, Droppable } from 'react-drag-and-drop'
// import { JsonTable } from 'react-json-to-html';
// import classnames from "classnames"
// import { Checkbox } from 'antd';
// import { Multiselect } from "multiselect-react-dropdown";
// import Alert from '@mui/material/Alert';
// import AlertTitle from '@mui/material/AlertTitle';

// import Breadcrumbs from "components/Common/Breadcrumb";
// import TrainImages from './adminComponent/TrainImages';

// import "./Css/style.css"
// import AdminTestingOptions from './RegionFunctions/AdminTestingOptions';
// import { DEFAULT_RESOLUTION } from './cameraConfig';
// import WebcamCapture from 'pages/WebcamCustom/WebcamCapture';

// import urlSocket from "./urlSocket"
// import image_url from './imageUrl';

// let ImageUrl = image_url;
// console.log('ImageUrlImageUrl', ImageUrl)
// let okCount1;
// let notokCount1;

// const StageModelCreation = () => {
//     const history = useHistory();

//     // Basic Component Information
//     const [compName, setCompName] = useState('');
//     const [compCode, setCompCode] = useState('');
//     const [modelName, setModelName] = useState('');
//     const [position, setPosition] = useState('');
//     const [type, setType] = useState('');

//     // Model Version and Configuration
//     const [compModelVerInfo, setCompModelVerInfo] = useState([]);
//     const [config, setConfig] = useState([]);
//     const [versionCount, setVersionCount] = useState(1);
//     const [modelVersionLoading, setModelVersionLoading] = useState(true);

//     // UI Labels and Controls
//     const [positive, setPositive] = useState('');
//     const [negative, setNegative] = useState('');
//     const [selectFilter, setSelectFilter] = useState(null);
//     const [tabFilter, setTabFilter] = useState(null);
//     const [showOkButton, setShowOkButton] = useState(false);
//     const [showNotokButton, setShowNotokButton] = useState(false);
//     const [showCamera, setShowCamera] = useState(false);
//     const [showGallery, setShowGallery] = useState(false);
//     const [showLabelName, setShowLabelName] = useState('');
//     const [reqImgCount, setReqImgCount] = useState(null);
//     const [labelName, setLabelName] = useState('');

//     // Camera and Webcam States
//     const [webcamEnabled, setWebcamEnabled] = useState(false);
//     const [imageSrcNone, setImageSrcNone] = useState(false);
//     const [cameraDisconnected, setCameraDisconnected] = useState(false);
//     const [webcamLoaded, setWebcamLoaded] = useState(false);

//     // Training and Process States
//     const [showTrainingINProgs, setShowTrainingINProgs] = useState(false);
//     const [showRetrain, setShowRetrain] = useState(false);
//     const [addAccTestInProg, setAddAccTestInProg] = useState(false);
//     const [addingImage, setAddingImage] = useState(false);
//     const [addingTrainImage, setAddingTrainImage] = useState(false);
//     const [showTrainImage, setShowTrainImage] = useState(false);

//     // UI Control States
//     const [refersh, setRefersh] = useState(false);
//     const [initvalue, setInitvalue] = useState(1);
//     const [activeTab, setActiveTab] = useState('1');
//     const [customActiveTab, setCustomActiveTab] = useState('');

//     // Modal States
//     const [modalXlarge, setModalXlarge] = useState(false);
//     const [modalXlarge1, setModalXlarge1] = useState(false);
//     const [showTestingOptions, setShowTestingOptions] = useState(false);

//     // Image and Gallery States
//     const [imagesLength, setImagesLength] = useState(0);
//     const [selectedImages, setSelectedImages] = useState([]);
//     const [imgPaths, setImgPaths] = useState([]);
//     const [imgGlr, setImgGlr] = useState([]);
//     const [newGallery, setNewGallery] = useState(false);
//     const [checkedValues, setCheckedValues] = useState([]);
//     const [selectedList, setSelectedList] = useState([]);
//     const [hidVer, setHidVer] = useState([]);
//     const [selectedCheckBox, setSelectedCheckBox] = useState([]);
//     const [uniqueModelVersions, setUniqueModelVersions] = useState([]);
//     const [groupedData, setGroupedData] = useState({});
//     const [activeGroupData, setActiveGroupData] = useState({});

//     // Response and Log States
//     const [responseMessage, setResponseMessage] = useState('');
//     const [logData, setLogData] = useState([]);
//     const [selected, setSelected] = useState([]);

//     // Image Processing States
//     const [rangeValue, setRangeValue] = useState(0.9);
//     const [imgRotation, setImgRotation] = useState(false);
//     const [noOfRotation, setNoOfRotation] = useState(0);

//     // Outline and Display States
//     const [outlineThres, setOutlineThres] = useState(100);
//     const [showOutline, setShowOutline] = useState(false);
//     const [captureFixedRefimage, setCaptureFixedRefimage] = useState(false);
//     const [defaultOutline, setDefaultOutline] = useState('White Outline');
//     const [outlinePath, setOutlinePath] = useState('');
//     const [compInfo, setCompInfo] = useState({});
//     const [stageInfo, setStageInfo] = useState({});

//     // Region Selection States
//     const [regionSelection, setRegionSelection] = useState(false);
//     const [imageSrc, setImageSrc] = useState(null);
//     const [clearCanvasFlag, setClearCanvasFlag] = useState(false);
//     const [cvLoaded, setCvLoaded] = useState(false);
//     const [selecting, setSelecting] = useState(false);
//     const [selectedRectangleIndex, setSelectedRectangleIndex] = useState(null);
//     const [editingRectangleIndex, setEditingRectangleIndex] = useState(null);
//     const [resizingRectangleIndex, setResizingRectangleIndex] = useState(null);
//     const [movingRectangleIndex, setMovingRectangleIndex] = useState(null);
//     const [rectNameInput, setRectNameInput] = useState('');
//     const [nestedRectNameInput, setNestedRectNameInput] = useState('');
//     const [capturedImage, setCapturedImage] = useState(null);
//     const [testingImage, setTestingImage] = useState(null);
//     const [imageId, setImageId] = useState(null);
//     const [selectingRectangle, setSelectingRectangle] = useState('');
//     const [inputRectangleName, setInputRectangleName] = useState(null);
//     const [existRectangleNameError, setExistRectangleNameError] = useState(false);
//     const [selectedColor, setSelectedColor] = useState('blue');
//     const [showRegion, setShowRegion] = useState(true);

//     // Testing Options States
//     const [overallTesting, setOverallTesting] = useState(true);
//     const [regionWiseTesting, setRegionWiseTesting] = useState(false);
//     const [regionTestingRequired, setRegionTestingRequired] = useState(false);
//     const [selectedVersion, setSelectedVersion] = useState(null);
//     const [array, setArray] = useState([]);

//     // Zoom and Canvas States
//     const [zoom, setZoom] = useState(1);
//     const [isPanning, setIsPanning] = useState(false);
//     const [panStartX, setPanStartX] = useState(0);
//     const [panStartY, setPanStartY] = useState(0);
//     const [canvasWidth, setCanvasWidth] = useState(640);
//     const [canvasHeight, setCanvasHeight] = useState(480);
//     const [zoomValue, setZoomValue] = useState({
//         zoom: 1,
//         center: { x: 0.5, y: 0.5 }
//     });

//     // Sharing and Navigation States
//     const [isSharing, setIsSharing] = useState(false);
//     const [hasPushedState, setHasPushedState] = useState(false);
//     const [cameraList, setCameraList] = useState([]);
//     console.log('cameraListcameraList', cameraList)
//     const [pysclCameraList, setPysclCameraList] = useState([]);
//     // State management
//     const [connectedCameras, setConnectedCameras] = useState([]);
//     const [defaultCamOrder, setDefaultCamOrder] = useState([]);
//     const [modelInfo, setModelInfo] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [newAvailableCameras, setNewAvailableCameras] = useState([]);
//     const [selectedCameraLabel, setSelectedCameraLabel] = useState(null);
//     console.log('selectedCameraLabel', selectedCameraLabel)
//     const [showCameraSelector, setShowCameraSelector] = useState(false);


//     // Constants
//     const outlineOptions = [
//         { label: "White Outline" },
//         { label: "Red Outline" },
//         { label: "Green Outline" },
//         { label: "Blue Outline" },
//         { label: "Black Outline" },
//         { label: "Orange Outline" },
//         { label: "Yellow Outline" },
//     ];

//     const outlineColors = [
//         "White Outline",
//         "Blue Outline",
//         "Black Outline",
//         "Orange Outline",
//         "Yellow Outline",
//     ];

//     const testingOptions = [
//         { 'option': 0, 'value': 'Entire Component' },
//         { 'option': 1, 'value': 'Regions Only' },
//         { 'option': 2, 'value': 'Entire Component with Regions' }
//     ];

//     // Refs
//     const parentDivRef = useRef();
//     const canvasRef = useRef();
//     const videoRef = useRef();
//     const animationRef = useRef();
//     const nestedRectangleRef = useRef();
//     const rectangleRef = useRef();
//     const trashButtonsRef = useRef([]);
//     const draggingRectIndexRef = useRef();
//     const resizingRectIndexRef = useRef();
//     const webcamRef = useRef();
//     const timerRef = useRef(null);
//     const trainingStatusIntervalRef = useRef(null);



//     useEffect(() => {
//         debugImageData();
//     }, [activeGroupData, labelName, selectedCameraLabel]);
//     // Initialize component
//     useEffect(() => {
//         const initializeComponent = async () => {
//             const db_info = JSON.parse(localStorage.getItem('db_info'));
//             ImageUrl = `${image_url}${db_info?.db_name}/`;
//             console.log('()componentDidMount');

//             try {
//                 const zoom_values = JSON.parse(sessionStorage.getItem('zoom_values'));
//                 if (zoom_values) {
//                     setZoomValue(zoom_values);
//                 }

//                 let compModelInfo = JSON.parse(sessionStorage.getItem('compModelData'));
//                 console.log('compMcompModelInfocompModelInfoodelInfo', compModelInfo)
//                 const data = JSON.parse(sessionStorage.getItem('compModelVInfo'));
//                 // console.log('datadata', compModelInfo, data)
//                 const compModelVInfo = data.versionInfo;
//                 const versionCountData = data.versionCount;

//                 // console.log('versionCount ', versionCountData, compModelVInfo);
//                 setModelInfo(compModelInfo)
//                 setCompName(compModelInfo.stage_name);
//                 setCompCode(compModelInfo.stage_code);
//                 setModelName(compModelInfo.model_name);
//                 setPosition(compModelInfo.position);
//                 setType(compModelInfo.type);
//                 setRefersh(true);
//                 setVersionCount(versionCountData);

//                 await getModelCreation(compModelVInfo);
//                 await getConfigInfo(compModelVInfo.result_mode);
//                 await showRefOutline(compModelInfo, compModelVInfo);

//                 // Add device change listener
//                 navigator.mediaDevices.addEventListener('devicechange', checkWebcam);
//                 // Initial check
//                 await checkWebcam();
//                 await getCameraPosition(compModelInfo);
//                 window.history.pushState(null, "", window.location.href);
//                 window.addEventListener("popstate", blockBackNavigation);
//             }
//             catch (error) {
//                 console.error('/didmount ', error);
//             }
//             finally {
//                 setModelVersionLoading(false);
//             }
//         };

//         initializeComponent();

//         // Cleanup
//         return () => {
//             // Clear the interval to avoid memory leaks
//             if (trainingStatusIntervalRef.current) {
//                 clearInterval(trainingStatusIntervalRef.current);
//             }
//             // Remove device change listener
//             navigator.mediaDevices.removeEventListener('devicechange', checkWebcam);
//             window.removeEventListener("popstate", blockBackNavigation);
//         };
//     }, []);

//     // Close camera selector when clicking outside
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (showCameraSelector && !event.target.closest('.camera-selector-container')) {
//                 setShowCameraSelector(false);
//             }
//         };

//         document.addEventListener('mousedown', handleClickOutside);
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [showCameraSelector]);

//     const showRefOutline = async (data1, data2) => {
//         console.log('data2', data2)
//         try {
//             const response = await urlSocket.post('/check_outline_stgchk', {
//                 'camera_mode': data2?.camera_selection,
//                 'parent_comp_id': data2.parent_comp_id,
//                 'stage_id': data2.stage_id,
//                 'comp_id': data2.comp_id,
//                 'model_id': data2.model_id,
//             }, { mode: 'no-cors' });
//             let getInfo = response.data;
//             console.log('getInfo', getInfo)
//             if (getInfo.error === "Tenant not found") {
//                 console.log("data error", getInfo.error);
//                 errorHandler(getInfo.error);
//             }
//             else {
//                 // if (getInfo.show === 'yes') {
//                 //     setShowOutline(true);
//                 //     // setCompInfo(getInfo.comp_info);
//                 //      setCompInfo(getInfo.stage_info)
//                 //     setStageInfo(getInfo.stage_info)

//                 //     setOutlinePath(getInfo.comp_info.datasets.white_path);
//                 // } else if (getInfo.show === 'no') {
//                 //     setCaptureFixedRefimage(true);
//                 // }
//                 if (getInfo.show === 'yes') {
//                     setShowOutline(true);
//                     setCompInfo(getInfo.stage_info);
//                     setStageInfo(getInfo.stage_info);

//                     const stageInfo = getInfo.stage_info;
//                     const cameraSelection = stageInfo.camera_selection || {};

//                     if (cameraSelection.mode === 'single') {
//                         // single camera → just one outline
//                         setOutlinePath(stageInfo.datasets.white_path);
//                     } else if (cameraSelection.mode === 'multi') {
//                         // multi camera → store the entire datasets object
//                         console.log('=== MULTI-CAMERA OUTLINE SETUP ===');
//                         console.log('Cameras:', cameraSelection.cameras);
//                         console.log('Stage datasets:', stageInfo.datasets);

//                         // Store the entire datasets object so getCurrentOutlinePath can access any camera's data
//                         setOutlinePath(stageInfo.datasets);

//                         console.log('Set outlinePath to full datasets for multi-camera mode');
//                         console.log('=== MULTI-CAMERA OUTLINE SETUP END ===');
//                     }
//                 } else if (getInfo.show === 'no') {
//                     setCaptureFixedRefimage(true);
//                 }

//             }
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     const handleWebcamLoad = () => {
//         setWebcamLoaded(true);
//     };

//     const toggleShowOutline = () => {
//         setShowOutline(prev => !prev);
//     };

//     // Helper function to get the current outline path for the selected camera
//     const getCurrentOutlinePath = () => {
//         console.log('=== GET CURRENT OUTLINE PATH ===');
//         console.log('outlinePath:', outlinePath);
//         console.log('selectedCameraLabel:', selectedCameraLabel);
//         console.log('defaultOutline:', defaultOutline);
//         console.log('cameraList:', cameraList);

//         if (!outlinePath) {
//             console.log('No outline path available');
//             return null;
//         }

//         // For single camera mode, outlinePath is a string
//         if (typeof outlinePath === 'string') {
//             console.log('Single camera mode, returning:', outlinePath);
//             return outlinePath;
//         }

//         // For multi-camera mode, outlinePath is an object with camera keys
//         if (typeof outlinePath === 'object' && selectedCameraLabel) {
//             const selectedCamera = cameraList.find(cam => cam.originalLabel === selectedCameraLabel);
//             console.log('Selected camera:', selectedCamera);

//             if (selectedCamera) {
//                 // Try multiple possible key formats
//                 const possibleKeys = [
//                     selectedCamera.label.trim().toLowerCase().replace(/\s+/g, "_"),
//                     selectedCamera.label.trim().toLowerCase().replace(/\s+/g, "_").replace(/#/g, "_"),
//                     selectedCamera.originalLabel?.trim().toLowerCase().replace(/\s+/g, "_"),
//                     selectedCamera.originalLabel?.trim().toLowerCase().replace(/\s+/g, "_").replace(/#/g, "_"),
//                 ];

//                 console.log('Trying possible keys:', possibleKeys);
//                 console.log('Available outline keys:', Object.keys(outlinePath));

//                 for (const key of possibleKeys) {
//                     if (outlinePath[key]) {
//                         console.log(`Found outline data with key: ${key}`, outlinePath[key]);

//                         // If it's an object with different outline colors, return the correct color path
//                         if (typeof outlinePath[key] === 'object') {
//                             let colorPath;

//                             // Map outline label to path property
//                             if (defaultOutline === 'White Outline') {
//                                 colorPath = outlinePath[key].white_path;
//                             } else if (defaultOutline === 'Red Outline') {
//                                 colorPath = outlinePath[key].red_path;
//                             } else if (defaultOutline === 'Green Outline') {
//                                 colorPath = outlinePath[key].green_path;
//                             } else if (defaultOutline === 'Blue Outline') {
//                                 colorPath = outlinePath[key].blue_path;
//                             } else if (defaultOutline === 'Black Outline') {
//                                 colorPath = outlinePath[key].black_path;
//                             } else if (defaultOutline === 'Orange Outline') {
//                                 colorPath = outlinePath[key].orange_path;
//                             } else if (defaultOutline === 'Yellow Outline') {
//                                 colorPath = outlinePath[key].yellow_path;
//                             } else {
//                                 // Default to white if no match
//                                 colorPath = outlinePath[key].white_path;
//                             }

//                             console.log(`Returning ${defaultOutline} path:`, colorPath);
//                             return colorPath;
//                         } else {
//                             console.log('Returning direct path:', outlinePath[key]);
//                             return outlinePath[key];
//                         }
//                     }
//                 }

//                 console.log('No matching key found for camera');
//             }
//         }

//         console.log('No valid outline path found');
//         return null;
//     };

//     const getModelCreation = async (compModelVInfo) => {
//         try {
//             const response = await urlSocket.post('/getCompModel_ver_info_stg', { 'compModelInfo': compModelVInfo }, { mode: 'no-cors' });
//             console.log('firstresponse', response)
//             if (response.data.error === "Tenant not found") {
//                 console.log("data error", response.data.error);
//                 errorHandler(response.data.error);
//             }
//             else {
//                 let default_thres = rangeValue;
//                 const compModelVerInfoData = response.data.version_data;
//                 console.log('compModelVercompModelVerInfoDataInfoData', compModelVerInfoData)

//                 const myArray = [];
//                 myArray.push(compModelVerInfoData);
//                 const show_train_image = compModelVerInfoData?.sift_train_datasets?.length > 0 ? true : false;

//                 setRegionSelection(response.data.comp_data.region_selection);
//                 if (compModelVerInfoData.thres === undefined) {
//                     console.log('first', myArray)
//                     setCompModelVerInfo(myArray);
//                     setRefersh(true);
//                     setShowTrainImage(show_train_image);
//                     setRangeValue(default_thres);
//                 }
//                 else {
//                     console.log('two', myArray)
//                     setCompModelVerInfo(myArray);
//                     setRefersh(true);
//                     setShowTrainImage(show_train_image);
//                     setRangeValue(compModelVerInfoData.thres);
//                 }

//                 if (compModelVerInfoData.training_status === 'training_in_progress') {
//                     setShowTrainingINProgs(true);
//                 }
//                 else if (compModelVerInfoData.training_status === 'admin accuracy testing in_progress') {
//                     setAddAccTestInProg(true);
//                     fetchTrainingStatus(myArray[0]);
//                 }
//                 else if (compModelVerInfoData.training_status === 'retrain') {
//                     setShowRetrain(true);
//                 }

//                 if (compModelVerInfoData.training_status === 'training_in_progress' || compModelVerInfoData.training_status === 'retrain') {
//                     trainingStatusIntervalRef.current = setInterval(() => fetchTrainingStatus(myArray[0]), 5000);
//                 }
//                 console.log('myArray[0],', myArray[0])
//                 setArray(myArray[0])
//                 imgGlry(myArray[0]);
//             }
//         } catch (error) {
//             console.log('error', error);
//         }
//     };

//     // Fix 2: Update the imgGlry function to avoid unnecessary calls
//     const imgGlry = async (compModelVInfo) => {
//         console.log('compModelVInfocompModelVInfo', compModelVInfo)

//         // Get the selected camera info
//         const selectedCamera = cameraList.find(
//             (cam) => cam.originalLabel === selectedCameraLabel
//         );

//         // Use the camera field from imagePathType (not label)
//         const selectedCameraName = selectedCamera?.label.replace(/\s+/g, "_") || selectedCameraLabel;
//         console.log('Selected camera for backend:', selectedCameraName)

//         try {
//             const response = await urlSocket.post('/modelImages_stg', {
//                 'compModelInfo': compModelVInfo,
//                 'selectedCameraName': selectedCameraName
//             }, { mode: 'no-cors' });

//             console.log('response526', response)

//             if (response.data.error === "Tenant not found") {
//                 console.log("data error", response.data.error);
//                 errorHandler(response.data.error);
//             }
//             else {
//                 const compModelVerInfoData = response.data;
//                 const allModelVersions = compModelVerInfoData.reduce((acc, item) => {
//                     acc.push(...item.used_model_ver);
//                     return acc;
//                 }, []);

//                 const uniqueModelVersionsData = [...new Set(allModelVersions)].sort();

//                 const groupedDataResult = compModelVerInfoData.reduce((acc, item) => {
//                     item.used_model_ver.forEach((version) => {
//                         if (!acc[version]) {
//                             acc[version] = [];
//                         }
//                         acc[version].push(item);
//                     });
//                     return acc;
//                 }, {});

//                 console.log('groupedDataResult', uniqueModelVersionsData)
//                 setImgGlr(compModelVerInfoData);
//                 setUniqueModelVersions(uniqueModelVersionsData);
//                 setGroupedData(groupedDataResult);
//                 setActiveGroupData(groupedDataResult);
//             }
//         } catch (error) {
//             console.log('error', error);
//         }
//     };

//     // const imgGlry = async (compModelVInfo) => {
//     //     console.log('compModelVInfocompModelVInfo', compModelVInfo)

//     //     // Get the selected camera info
//     //     const selectedCamera = cameraList.find(
//     //         (cam) => cam.originalLabel === selectedCameraLabel
//     //     );

//     //     // Use the camera field from imagePathType (not label)
//     //     // Based on your data structure, the backend expects the camera field value
//     //     const selectedCameraName = selectedCamera?.label.replace(/\s+/g, "_") || selectedCameraLabel;
//     //     console.log('Selected camera for backend:', selectedCameraName)

//     //     try {
//     //         const response = await urlSocket.post('/modelImages_stg', {
//     //             'compModelInfo': compModelVInfo,
//     //             'selectedCameraName': selectedCameraName
//     //         }, { mode: 'no-cors' });

//     //         console.log('response526', response)

//     //         if (response.data.error === "Tenant not found") {
//     //             console.log("data error", response.data.error);
//     //             errorHandler(response.data.error);
//     //         }
//     //         else {
//     //             const compModelVerInfoData = response.data;
//     //             const allModelVersions = compModelVerInfoData.reduce((acc, item) => {
//     //                 acc.push(...item.used_model_ver);
//     //                 return acc;
//     //             }, []);

//     //             const uniqueModelVersionsData = [...new Set(allModelVersions)].sort();

//     //             const groupedDataResult = compModelVerInfoData.reduce((acc, item) => {
//     //                 item.used_model_ver.forEach((version) => {
//     //                     if (!acc[version]) {
//     //                         acc[version] = [];
//     //                     }
//     //                     acc[version].push(item);
//     //                 });
//     //                 return acc;
//     //             }, {});

//     //             console.log('groupedDataResult', uniqueModelVersionsData)
//     //             setImgGlr(compModelVerInfoData);
//     //             setUniqueModelVersions(uniqueModelVersionsData);
//     //             setGroupedData(groupedDataResult);
//     //             setActiveGroupData(groupedDataResult);
//     //         }
//     //     } catch (error) {
//     //         console.log('error', error);
//     //     }
//     // };
//     // const imgGlry = async (compModelVInfo) => {
//     //     // const compModelVInfo = compModelVerInfo[0];
//     //     console.log('compModelVInfocompModelVInfo', compModelVInfo)
//     //     const selectedCamera = cameraList.find(
//     //         (cam) => cam.originalLabel === selectedCameraLabel
//     //     );

//     //     // Get the "label" (fallback to selectedCameraLabel if not found)
//     //     // const selectedCameraName = selectedCamera ? selectedCamera.label : selectedCameraLabel;

//     //     const selectedCameraName = selectedCamera?.label.replace(/\s+/g, "_");
//     //     console.log('522', selectedCameraName)

//     //     try {
//     //         const response = await urlSocket.post('/modelImages_stg', { 'compModelInfo': compModelVInfo, 'selectedCameraName': selectedCameraName }, { mode: 'no-cors' });
//     //         console.log('response526', response.data)
//     //         if (response.data.error === "Tenant not found") {
//     //             console.log("data error", response.data.error);
//     //             errorHandler(response.data.error);
//     //         }
//     //         else {
//     //             const compModelVerInfoData = response.data;
//     //             const allModelVersions = compModelVerInfoData.reduce((acc, item) => {
//     //                 acc.push(...item.used_model_ver);
//     //                 return acc;
//     //             }, []);

//     //             const uniqueModelVersionsData = [...new Set(allModelVersions)].sort();

//     //             const groupedDataResult = compModelVerInfoData.reduce((acc, item) => {
//     //                 item.used_model_ver.forEach((version) => {
//     //                     if (!acc[version]) {
//     //                         acc[version] = [];
//     //                     }
//     //                     acc[version].push(item);
//     //                 });
//     //                 return acc;
//     //             }, {});
//     //             console.log('groupedDataResult', uniqueModelVersionsData)
//     //             setImgGlr(compModelVerInfoData);
//     //             setUniqueModelVersions(uniqueModelVersionsData);
//     //             setGroupedData(groupedDataResult);
//     //             setActiveGroupData(groupedDataResult);
//     //         }
//     //     } catch (error) {
//     //         console.log('error', error);
//     //     }
//     // };

//     const getConfigInfo = async (result_mode) => {
//         try {
//             const response = await urlSocket.post('/config', { mode: 'no-cors' });
//             console.log('/config ', response);
//             const configData = response.data;
//             if (configData.error === "Tenant not found") {
//                 console.log("data error", configData.error);
//                 errorHandler(configData.error);
//             }
//             else {
//                 setConfig(configData);
//                 setPositive(configData[0].positive);
//                 setNegative(configData[0].negative);

//                 if (result_mode !== "ng") {
//                     getOK(configData[0].positive, 0, '1');
//                 } else {
//                     getNotok(configData[0].negative, 1, '2');
//                 }
//             }
//         } catch (error) {
//             console.log('error', error);
//         }
//     };

//     const getOK = (ok, tabFilterVal, tab) => {
//         let reqImgCountVal = config[0]?.min_ok_for_training || 0;
//         setTabFilter(tabFilterVal);
//         setShowOkButton(true);
//         setShowNotokButton(false);
//         setShowCamera(false);
//         setShowGallery(false);
//         setShowLabelName(ok);
//         setReqImgCount(reqImgCountVal);
//         setActiveTab(tab);
//         setCustomActiveTab('');
//     };

//     const getNotok = (notok, tabFilterVal, tab) => {
//         let reqImgCountVal = config[0]?.min_notok_for_training || 0;
//         setTabFilter(tabFilterVal);
//         setShowNotokButton(true);
//         setShowOkButton(false);
//         setShowCamera(false);
//         setShowGallery(false);
//         setShowLabelName(notok);
//         setReqImgCount(reqImgCountVal);
//         setActiveTab(tab);
//         setCustomActiveTab('');
//     };

//     const getImgGalleryInfo = (selectFilterVal, lable_name_val, tab) => {
//         let img_length = imagesLengthCalc(activeGroupData, compModelVerInfo[0].model_ver, lable_name_val);

//         setSelectFilter(selectFilterVal);
//         setShowCamera(false);
//         setShowGallery(true);
//         setLabelName(lable_name_val);
//         setCustomActiveTab(tab);
//         setImagesLength(img_length);
//         setSelectedList([]);
//         setSelectedImages([]);
//         setImgPaths([]);

//         imgGlry();
//     };


//     // Fix 3: Update the startLiveCamera function to prevent unnecessary imgGlry calls
//     const startLiveCamera = (selectFilterVal, lable_name_val, tab) => {
//         let img_length = imagesLengthCalc(activeGroupData, compModelVerInfo[0].model_ver, lable_name_val);

//         setSelectFilter(selectFilterVal);
//         setShowCamera(true);
//         setShowGallery(false);
//         setLabelName(lable_name_val);
//         setCustomActiveTab(tab);
//         setImagesLength(img_length);
//         setImageSrcNone(false);
//         setSelectedList([]);
//         setSelectedImages([]);
//         setImgPaths([]);

//         // Only call imgGlry if we don't have data or the camera has changed
//         if (!imgGlr || imgGlr.length === 0 || !activeGroupData || Object.keys(activeGroupData).length === 0) {
//             imgGlry(array);
//         }

//         // Simulate slow enable process for demonstration
//         setTimeout(() => {
//             setWebcamEnabled(true);
//         }, 1000);
//     };





//     // const startLiveCamera = (selectFilterVal, lable_name_val, tab) => {
//     //     let img_length = imagesLengthCalc(activeGroupData, compModelVerInfo[0].model_ver, lable_name_val);

//     //     setSelectFilter(selectFilterVal);
//     //     setShowCamera(true);
//     //     setShowGallery(false);
//     //     setLabelName(lable_name_val);
//     //     setCustomActiveTab(tab);
//     //     setImagesLength(img_length);
//     //     setImageSrcNone(false);
//     //     setSelectedList([]);
//     //     setSelectedImages([]);
//     //     setImgPaths([]);

//     //     imgGlry(array);

//     //     // Simulate slow enable process for demonstration
//     //     setTimeout(() => {
//     //         setWebcamEnabled(true);
//     //     }, 1000);
//     // };

//     // const captureImage = async (labelNameVal) => {
//     //     console.log('labelNameVal', labelNameVal)
//     //     if (isNaN(noOfRotation)) {
//     //         Swal.fire({
//     //             icon: 'info',
//     //             title: 'No. of rotations required',
//     //             confirmButtonText: 'OK',
//     //         }).then((result) => {
//     //             if (result.isConfirmed) {
//     //                 setNoOfRotation(0);
//     //             } else {
//     //                 console.log('User canceled');
//     //             }
//     //         });
//     //     } else {
//     //         setAddingImage(true);

//     //         const imageSrcData = await webcamRef.current.captureZoomedImage();
//     //         console.log('first', selectedCameraLabel)

//     //         if (!imageSrcData) {
//     //             setImageSrcNone(true);
//     //             setAddingImage(false);
//     //             return;
//     //         }
//     //         // Find the camera object where originalLabel matches selectedCameraLabel
//     //         const selectedCamera = cameraList.find(
//     //             (cam) => cam.originalLabel === selectedCameraLabel
//     //         );

//     //         // Get the "label" (fallback to selectedCameraLabel if not found)
//     //         // const selectedCameraName = selectedCamera ? selectedCamera.label : selectedCameraLabel;

//     //         const selectedCameraName = selectedCamera?.label.replace(/\s+/g, "_");


//     //         console.log('selectedCameraName', selectedCameraName, selectedCameraLabel, selectedCamera?.label)


//     //         setImageSrc(imageSrcData);
//     //         const blob = dataURLtoBlob(imageSrcData);
//     //         const formData = new FormData();
//     //         let imgUuid = uuidv4();
//     //         formData.append('_id', compModelVerInfo[0]._id);
//     //         formData.append('labelName', labelNameVal);
//     //         formData.append('image_rotation', noOfRotation);
//     //         formData.append('imgName', blob, imgUuid + '.png');
//     //         formData.append('camera_originalLabel', selectedCameraLabel);
//     //         formData.append('camera_label', selectedCameraName);


//     //         try {
//     //             console.log('formData', formData)
//     //             const response = await urlSocket.post('/addImage_stg', formData, {
//     //                 headers: {
//     //                     'content-type': 'multipart/form-data'
//     //                 },
//     //                 mode: 'no-cors'
//     //             });
//     //             console.log('responseaddImage_stg', response)
//     //             let getInfo = response.data;
//     //             if (getInfo.error === "Tenant not found") {
//     //                 console.log("data error", getInfo.error);
//     //                 errorHandler(getInfo.error);
//     //             }
//     //             else {
//     //                 if (getInfo.message === 'Image successfully added') {
//     //                     setResponseMessage(getInfo.message);
//     //                     console.log('three', getInfo.comp_model_ver_info_list)
//     //                     setCompModelVerInfo(getInfo.comp_model_ver_info_list);
//     //                     setRefersh(true);
//     //                     setImagesLength(getInfo.img_count);
//     //                     setAddingImage(false);
//     //                 }
//     //                 else {
//     //                     setResponseMessage(getInfo.message);
//     //                     setAddingImage(false);
//     //                 }
//     //                 imgGlry(compModelVerInfo[0]);
//     //                 setTimeout(() => {
//     //                     setResponseMessage("");
//     //                 }, 1000);
//     //             }
//     //         } catch (error) {
//     //             console.log('error', error);
//     //         }
//     //     }
//     // };

//     // Fix 4: Update the captureImage function to refresh gallery data only after successful capture
//     const captureImage = async (labelNameVal) => {
//         console.log('labelNameVal', labelNameVal)
//         if (isNaN(noOfRotation)) {
//             Swal.fire({
//                 icon: 'info',
//                 title: 'No. of rotations required',
//                 confirmButtonText: 'OK',
//             }).then((result) => {
//                 if (result.isConfirmed) {
//                     setNoOfRotation(0);
//                 } else {
//                     console.log('User canceled');
//                 }
//             });
//         } else {
//             setAddingImage(true);

//             const imageSrcData = await webcamRef.current.captureZoomedImage();
//             console.log('first', selectedCameraLabel)

//             if (!imageSrcData) {
//                 setImageSrcNone(true);
//                 setAddingImage(false);
//                 return;
//             }

//             const selectedCamera = cameraList.find(
//                 (cam) => cam.originalLabel === selectedCameraLabel
//             );

//             const selectedCameraName = selectedCamera?.label.replace(/\s+/g, "_");

//             console.log('selectedCameraName', selectedCameraName, selectedCameraLabel, selectedCamera?.label)

//             setImageSrc(imageSrcData);
//             const blob = dataURLtoBlob(imageSrcData);
//             const formData = new FormData();
//             let imgUuid = uuidv4();
//             formData.append('_id', compModelVerInfo[0]._id);
//             formData.append('labelName', labelNameVal);
//             formData.append('image_rotation', noOfRotation);
//             formData.append('imgName', blob, imgUuid + '.png');
//             formData.append('camera_originalLabel', selectedCameraLabel);
//             formData.append('camera_label', selectedCameraName);

//             try {
//                 console.log('formData', formData)
//                 const response = await urlSocket.post('/addImage_stg', formData, {
//                     headers: {
//                         'content-type': 'multipart/form-data'
//                     },
//                     mode: 'no-cors'
//                 });
//                 console.log('responseaddImage_stg', response)
//                 let getInfo = response.data;
//                 if (getInfo.error === "Tenant not found") {
//                     console.log("data error", getInfo.error);
//                     errorHandler(getInfo.error);
//                 }
//                 else {
//                     if (getInfo.message === 'Image successfully added') {
//                         setResponseMessage(getInfo.message);
//                         console.log('three', getInfo.comp_model_ver_info_list)
//                         setCompModelVerInfo(getInfo.comp_model_ver_info_list);
//                         setRefersh(true);
//                         setImagesLength(getInfo.img_count);
//                         setAddingImage(false);

//                         // Refresh gallery data after successful image addition
//                         await imgGlry(compModelVerInfo[0]);
//                     }
//                     else {
//                         setResponseMessage(getInfo.message);
//                         setAddingImage(false);
//                     }

//                     setTimeout(() => {
//                         setResponseMessage("");
//                     }, 1000);
//                 }
//             } catch (error) {
//                 console.log('error', error);
//                 setAddingImage(false);
//             }
//         }
//     };
//     const debugImageData = () => {
//         console.log('=== DEBUG IMAGE DATA ===');
//         console.log('activeGroupData:', activeGroupData);
//         console.log('imgGlr:', imgGlr);
//         console.log('labelName:', labelName);
//         console.log('compModelVerInfo[0].model_ver:', compModelVerInfo[0]?.model_ver);
//         console.log('selectedCameraLabel:', selectedCameraLabel);
//         console.log('cameraList:', cameraList);

//         // Check if we have images for the current label
//         const currentVersionImages = Object.entries(activeGroupData).filter(([version, items]) => {
//             return compModelVerInfo[0]?.model_ver === parseInt(version);
//         });

//         console.log('currentVersionImages:', currentVersionImages);

//         currentVersionImages.forEach(([version, items]) => {
//             const labelImages = items.filter(item =>
//                 item.imagePathType &&
//                 item.imagePathType[0] &&
//                 item.imagePathType[0].type === labelName
//             );
//             console.log(`Images for version ${version} and label ${labelName}:`, labelImages);
//         });
//         console.log('=== END DEBUG ===');
//     };

//     const dataURLtoBlob = (dataURL) => {
//         const arr = dataURL.split(',');
//         const mime = arr[0].match(/:(.*?);/)[1];
//         const bstr = atob(arr[1]);
//         let n = bstr.length;
//         const u8arr = new Uint8Array(n);
//         while (n--) {
//             u8arr[n] = bstr.charCodeAt(n);
//         }
//         return new Blob([u8arr], { type: mime });
//     };

//     const getImages = (data1) => {
//         const baseurl = ImageUrl;
//         if (data1 && data1.image_path) {
//             let result = data1.image_path.replace(/\\/g, "/");
//             result = encodeURI(result);
//             const output = baseurl + String(result);
//             console.log('image output', output);
//             return output;
//         }
//         return null;
//     };

//     const deleteImageClick = async (data, ver, labelNameVal) => {
//         try {
//             let idxVal = data.used_model_ver.indexOf(ver);
//             let imgName = data.imagePathType[idxVal].image_path;
//             let fileName = data.filename;
//             const formData = new FormData();
//             formData.append('_id', compModelVerInfo[0]._id);
//             formData.append('model_ver', parseInt(data.org_model_ver));
//             formData.append('labelName', labelNameVal);
//             formData.append('fileName', fileName);
//             formData.append('imgName', imgName);
//             formData.append('comp_named', compModelVerInfo[0].comp_name);
//             formData.append('comp_code', compModelVerInfo[0].comp_code);
//             formData.append('comp_id', compModelVerInfo[0].comp_id);
//             formData.append('model_name', compModelVerInfo[0].model_name);
//             formData.append('model_id', compModelVerInfo[0].model_id);
//             formData.append('training_status', compModelVerInfo[0].training_status);
//             formData.append('model_status', compModelVerInfo[0].model_status);

//             const response = await urlSocket.post('/delete_image', formData, {
//                 headers: {
//                     'content-type': 'multipart/form-data'
//                 },
//                 mode: 'no-cors'
//             });
//             if (response.data.error === "Tenant not found") {
//                 console.log("data error", response.data.error);
//                 errorHandler(response.data.error);
//             }
//             else {
//                 setResponseMessage(response.data.message);
//                 console.log('four', response.data.comp_model_ver_info_list)
//                 setCompModelVerInfo(response.data.comp_model_ver_info_list);
//                 setImagesLength(response.data.img_count);

//                 await imgGlry();

//                 if (selectedList.length !== 0) {
//                     const updatedImgGlr = imgGlr;
//                     const filteredGroupedData = selectedList.reduce((acc, itemList) => {
//                         const version = itemList.value;
//                         const itemsForVersion = updatedImgGlr.filter(item => item.used_model_ver.includes(version));
//                         acc[version] = itemsForVersion;
//                         return acc;
//                     }, {});

//                     setGroupedData(filteredGroupedData);
//                 }

//                 setTimeout(() => {
//                     setResponseMessage("");
//                 }, 1000);
//             }
//         } catch (error) {
//             console.log('error', error);
//         }
//     };

//     const train = async (data, index) => {
//         const swalWithBootstrapButtons = Swal.mixin({
//             customClass: {
//                 confirmButton: 'btn btn-success',
//                 cancelButton: 'btn btn-danger'
//             },
//             buttonsStyling: false
//         });

//         swalWithBootstrapButtons.fire({
//             title: 'Start Training?',
//             text: "Training this version may take some time to complete. Please ensure that you have provided all necessary inputs before proceeding.",
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonText: 'Continue',
//             cancelButtonText: 'Cancel',
//             reverseButtons: true
//         }).then(async (result) => {
//             if (result.isConfirmed) {
//                 const updatedCompModelVerInfo = [...compModelVerInfo];
//                 updatedCompModelVerInfo[0].training_status_id = 0;
//                 updatedCompModelVerInfo[0].training_start_time = '00:00:00';
//                 console.log('five', updatedCompModelVerInfo)
//                 setCompModelVerInfo(updatedCompModelVerInfo);
//                 setRefersh(true);
//                 setShowTrainingINProgs(true);

//                 trainingStatusIntervalRef.current = setInterval(() => fetchTrainingStatus(data), 5000);

//                 try {
//                     const response = await urlSocket.post('/Train', {
//                         compModelVerInfo: data,
//                         config: config
//                     }, { mode: 'no-cors' });
//                     if (response.data.error === "Tenant not found") {
//                         console.log("data error", response.data.error);
//                         clearInterval(trainingStatusIntervalRef.current);
//                         errorHandler(response.data.error);
//                     }

//                     swalWithBootstrapButtons.fire(
//                         'Training Started',
//                         'Please wait while the training process completes.',
//                         'success'
//                     );
//                 } catch (error) {
//                     console.log('Error starting training:', error);
//                     clearInterval(trainingStatusIntervalRef.current);
//                     swalWithBootstrapButtons.fire(
//                         'Error',
//                         'Failed to start training. Please try again later.',
//                         'error'
//                     );
//                 }
//             } else if (result.dismiss === Swal.DismissReason.cancel) {
//                 swalWithBootstrapButtons.fire(
//                     'Training Canceled',
//                     `You can start the training anytime when you're ready.`,
//                     'error'
//                 );
//             }
//         });
//     };

//     const clock = (data) => {
//         if (data && data !== '00:00:00') {
//             let st_date = new Date(data).toISOString();
//             var time = moment.utc(st_date).format("DD/MM/YYYY HH:mm:ss");
//             let start = new Date().toString();
//             var endtime = moment.utc(start).format("DD/MM/YYYY HH:mm:ss");

//             var startTime = moment(time, "DD/MM/YYYY HH:mm:ss");
//             var endTime = moment(endtime, "DD/MM/YYYY HH:mm:ss");

//             var duration = moment.duration(endTime.diff(startTime));

//             var days = Math.floor(duration.asDays());
//             var hours = duration.hours();
//             var minutes = duration.minutes();
//             var seconds = duration.seconds();

//             var result = "";
//             if (days > 0) {
//                 result += days + " Day";
//                 if (days > 1) {
//                     result += "s";
//                 }
//                 result += " and ";
//             }
//             result += hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
//             return result;
//         } else {
//             return '00:00:00';
//         }
//     };

//     const fetchTrainingStatus = async (data) => {
//         try {
//             const response = await urlSocket.post('/getTrainingStatus', { 'compModelVerInfo': data }, { mode: 'no-cors' });
//             const updatedCompModelVerInfo = response.data;
//             console.log('six', updatedCompModelVerInfo)
//             setCompModelVerInfo(updatedCompModelVerInfo);
//             setRefersh(true);

//             if (updatedCompModelVerInfo[0].training_status === 'training completed') {
//                 updatedCompModelVerInfo[0].training_status_id = 4;
//                 updatedCompModelVerInfo[0].training_status = 'training completed';
//                 setShowTrainingINProgs(false);
//                 setRefersh(true);
//                 clearInterval(trainingStatusIntervalRef.current);
//             }
//             else if (updatedCompModelVerInfo[0].training_status === 'admin approved trained model') {
//                 setShowTrainingINProgs(false);
//                 setRefersh(true);
//                 clearInterval(trainingStatusIntervalRef.current);
//             }
//             else if (updatedCompModelVerInfo[0].training_status !== 'training_in_progress' && updatedCompModelVerInfo[0].training_status !== 'training_queued') {
//                 setShowTrainingINProgs(false);
//                 setShowRetrain(false);
//                 setRefersh(true);
//                 clearInterval(trainingStatusIntervalRef.current);
//             }

//             if (updatedCompModelVerInfo[0].training_status === 'training_in_progress' || updatedCompModelVerInfo[0].training_status === 'training_queued') {
//                 setShowTrainingINProgs(true);
//             }
//             else if (updatedCompModelVerInfo[0].training_status === 'retrain') {
//                 setShowRetrain(true);
//             }
//         } catch (error) {
//             console.log('Error fetching training status:', error);
//         }
//     };

//     const closeAdminTestOptions = () => {
//         setShowTestingOptions(false);
//     };

//     const continueAdminTest = (selected_options) => {
//         setShowTestingOptions(false);
//         console.log('selected options: ', selected_options);

//         const data = JSON.parse(JSON.stringify(selectedVersion));
//         goToAdminTestingPage(data, selected_options);
//     };

//     const startAdminTest = async (data, model) => {
//         const details = JSON.parse(sessionStorage.getItem('manageData'));
//         const model_info = details.modelInfo;

//         const ask_testing_type = model_info.find(model =>
//             model._id === data.model_id
//             && model.region_testing === true
//         ) !== undefined;
//         console.log('ask_testing_type', ask_testing_type, data);

//         if (ask_testing_type) {
//             setShowTestingOptions(true);
//             setSelectedVersion(data);
//         } else {
//             goToAdminTestingPage(data);
//         }
//     };

//     const goToAdminTestingPage = (version_data, options = {}) => {
//         if (version_data.result_mode === "ok") {
//             Swal.fire({
//                 title: "This is an OK Model",
//                 text: "Test only with OK images to get better accuracy",
//                 icon: "info",
//                 confirmButtonText: "OK"
//             });
//         } else if (version_data.result_mode === "ng") {
//             Swal.fire({
//                 title: "This is an NG Model",
//                 text: "Test only with NG images to get better accuracy",
//                 icon: "warning",
//                 confirmButtonText: "OK"
//             });
//         }

//         let count = initvalue;
//         let values = {
//             config: config,
//             testCompModelVerInfo: version_data,
//             batch_no: count++,
//             page: 'modelverinfo'
//         };

//         console.log('options::: ', options);

//         if (options?.testing_mode?.length > 0) {
//             values.overall_testing = false;
//             values.region_wise_testing = false;

//             if (options.testing_mode.length >= 2) {
//                 values.option = 'Entire Component with Regions';
//                 values.overall_testing = true;
//                 values.region_wise_testing = true;
//             } else if (options.testing_mode.includes("component_testing")) {
//                 values.option = 'Entire Component';
//                 values.overall_testing = true;
//             } else if (options.testing_mode.includes("region_testing")) {
//                 values.option = 'Regions Only';
//                 values.region_wise_testing = true;
//             }

//             if (options?.testing_mode.includes("region_testing")) {
//                 values.detection_type = options.detection_type;
//                 values.regions = options.regions;
//             }
//         }

//         sessionStorage.removeItem("modelData");
//         localStorage.setItem('modelData', JSON.stringify(values));

//         console.log('values ', values);

//         history.push('/adminAccTesting');
//     };

//     const back = () => {
//         history.push("/StageModelVerInfo");
//     };

//     const onDrop = async (data) => {
//         const droppedData = JSON.parse(data.dragdrop);

//         try {
//             const response = await urlSocket.post('/dragImg', { 'compModelInfo': compModelVerInfo[0], 'drgImg': droppedData }, { mode: 'no-cors' });
//             if (response.data.error === "Tenant not found") {
//                 console.log("data error", response.data.error);
//                 errorHandler(response.data.error);
//             }
//             else {
//                 const getInfo = response.data;
//                 setResponseMessage(getInfo.message);
//                 console.log('seven', getInfo.comp_model_ver_info_list)
//                 setCompModelVerInfo(getInfo.comp_model_ver_info_list);
//                 setRefersh(true);
//                 setImagesLength(getInfo.img_count);

//                 await imgGlry();

//                 if (selectedList.length !== 0) {
//                     const updatedImgGlr = imgGlr;
//                     const filteredGroupedData = selectedList.reduce((acc, itemList) => {
//                         const version = itemList.value;
//                         const itemsForVersion = updatedImgGlr.filter(item => item.used_model_ver.includes(version));
//                         acc[version] = itemsForVersion;
//                         return acc;
//                     }, {});

//                     setGroupedData(filteredGroupedData);
//                 }
//                 setTimeout(() => {
//                     setResponseMessage("");
//                 }, 1000);
//             }
//         } catch (error) {
//             console.log('error', error);
//         }
//     };

//     const togXlarge = () => {
//         setModalXlarge(prev => !prev);
//         log();
//         removeBodyCss();
//     };

//     const log = () => {
//         try {
//             urlSocket.post('/version_log_info', {
//                 'comp_name': compModelVerInfo[0].comp_name,
//                 'model_name': compModelVerInfo[0].model_name,
//                 "comp_code": compModelVerInfo[0].comp_code,
//                 "model_ver": compModelVerInfo[0].model_ver
//             }, { mode: 'no-cors' })
//                 .then((response) => {
//                     let data1 = response.data;
//                     if (data1.error === "Tenant not found") {
//                         console.log("data error", data1.error);
//                         errorHandler(data1.error);
//                     }
//                     else {
//                         setLogData(data1);
//                     }
//                 })
//                 .catch((error) => {
//                     console.log(error);
//                 });
//         } catch (error) {
//             console.log("----", error);
//         }
//     };

//     const removeBodyCss = () => {
//         document.body.classList.add("no_padding");
//     };

//     const handleChange = (e) => {
//         const updatedImgGlr = imgGlr.map((img, imgId) => {
//             if (img.filename === e.target.name) {
//                 return { ...img, checked: e.target.checked };
//             }
//             return img;
//         });
//         setImgGlr(updatedImgGlr);
//     };

//     const shareImgData = async () => {
//         const selectedImages = imgGlr.filter(img => img.checked === true);

//         if (selectedImages.length === 0) {
//             Swal.fire({
//                 icon: 'warning',
//                 title: 'No Image Selected',
//                 text: 'Please select at least one image before sharing.',
//             });
//             return;
//         }
//         setIsSharing(true);
//         window.history.pushState(null, "", window.location.href);

//         try {
//             for (const img of selectedImages) {
//                 if (img.checked === true) {
//                     try {
//                         const response = await urlSocket.post('/sharedImage', {
//                             'compModelInfo': compModelVerInfo[0],
//                             'imageData': img
//                         }, {
//                             mode: 'no-cors'
//                         });

//                         let data1 = response.data;
//                         if (data1.error === "Tenant not found") {
//                             console.log("data error", data1.error);
//                             errorHandler(data1.error);
//                         }
//                         else {
//                             setResponseMessage(response.data.message);
//                             console.log('eight', response.data.comp_model_ver_info_list)
//                             setCompModelVerInfo(response.data.comp_model_ver_info_list);
//                             setImagesLength(response.data.img_count);

//                             setTimeout(() => {
//                                 setResponseMessage("");
//                             }, 1000);
//                         }
//                     } catch (error) {
//                         console.log(error);
//                     }
//                 }
//             }

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
//         }
//         finally {
//             setIsSharing(false);
//             setHasPushedState(false);
//             window.removeEventListener("popstate", blockBackNavigation);
//             window.history.replaceState(null, "", window.location.href);
//         }
//     };

//     const blockBackNavigation = (event) => {
//         if (isSharing) {
//             Swal.fire({
//                 icon: 'info',
//                 title: 'Sharing in Progress',
//                 text: 'Please wait until image sharing is complete.',
//             });

//             if (!hasPushedState) {
//                 setHasPushedState(true);
//                 window.history.pushState(null, "", window.location.href);
//             }
//         }
//     };

//     const onSelectValues = (selectedListVal, selectedItem) => {
//         setSelectedList(selectedListVal);
//         const groupedDataResult = imgGlr.reduce((acc, item) => {
//             item.used_model_ver.forEach((version) => {
//                 if (!acc[version]) {
//                     acc[version] = [];
//                 }
//                 acc[version].push(item);
//             });
//             return acc;
//         }, {});

//         const filteredGroupedData = selectedListVal.reduce((acc, itemList) => {
//             const version = itemList.value;
//             if (groupedDataResult[version]) {
//                 acc[version] = groupedDataResult[version];
//             }
//             return acc;
//         }, {});

//         setGroupedData(filteredGroupedData);
//     };

//     const onRemove = (selectedListVal, selectedItem, index) => {
//         if (selectedListVal.length === 0) {
//             const groupedDataResult = imgGlr.reduce((acc, item) => {
//                 item.used_model_ver.forEach((version) => {
//                     if (!acc[version]) {
//                         acc[version] = [];
//                     }
//                     acc[version].push(item);
//                 });
//                 return acc;
//             }, {});
//             setGroupedData(groupedDataResult);
//         }
//         else {
//             setSelectedList(selectedListVal);
//             const groupedDataResult = imgGlr.reduce((acc, item) => {
//                 item.used_model_ver.forEach((version) => {
//                     if (!acc[version]) {
//                         acc[version] = [];
//                     }
//                     acc[version].push(item);
//                 });
//                 return acc;
//             }, {});

//             const filteredGroupedData = selectedListVal.reduce((acc, itemList) => {
//                 const version = itemList.value;
//                 if (groupedDataResult[version]) {
//                     acc[version] = groupedDataResult[version];
//                 }
//                 return acc;
//             }, {});

//             setGroupedData(filteredGroupedData);
//         }
//     };

//     const versionHide = (ids) => {
//         const updatedHidVer = [...hidVer];
//         const index = updatedHidVer.indexOf(ids);
//         if (index !== -1) {
//             updatedHidVer.splice(index, 1);
//         } else {
//             updatedHidVer.push(ids);
//         }
//         setHidVer(updatedHidVer);
//     };

//     const imagesLengthCalc = (activeGroupDataVal, model_ver, lable_name_val) => {
//         const labelItemCount = Object.entries(activeGroupDataVal)
//             .filter(([version]) => model_ver === parseInt(version))
//             .flatMap(([_, items]) => items)
//             .filter(item => item.imagePathType[0].type === lable_name_val)
//             .length;

//         return labelItemCount;
//     };

//     const handleCheckboxChange = (item, ver) => {
//         const index = selectedImages.indexOf(item);
//         let idxVal = item.used_model_ver.indexOf(parseInt(ver));
//         let imgName = item.imagePathType[idxVal].image_path;

//         if (index === -1) {
//             setSelectedImages([...selectedImages, item]);
//             setImgPaths([...imgPaths, imgName]);
//         } else {
//             const updatedSelectedImages = [...selectedImages];
//             updatedSelectedImages.splice(index, 1);

//             const updatedPaths = [...imgPaths];
//             updatedPaths.splice(index, 1);

//             setSelectedImages(updatedSelectedImages);
//             setImgPaths(updatedPaths);
//         }
//     };

//     const handleDeleteSelectedImages = async (img_path) => {
//         let img_paths_to_delete;
//         if (img_path) {
//             img_paths_to_delete = [img_path];
//         } else {
//             img_paths_to_delete = imgPaths;
//         }

//         if (img_paths_to_delete.length === 0) {
//             Swal.fire({
//                 title: 'No items selected',
//                 icon: 'info',
//                 timer: 1500,
//                 showConfirmButton: false,
//             });
//             return;
//         }

//         Swal.fire({
//             title: `Delete ${img_paths_to_delete.length} item${img_paths_to_delete.length > 1 ? 's' : ''}?`,
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonText: 'OK',
//             cancelButtonText: 'Cancel',
//         }).then((result) => {
//             if (result.isConfirmed) {
//                 imgDeletion(img_path);
//             }
//         });
//     };

//     const imgDeletion = async (img_path) => {
//         let img_paths_to_delete;
//         if (img_path) {
//             img_paths_to_delete = [img_path];
//         } else {
//             img_paths_to_delete = imgPaths;
//         }

//         try {
//             const formData = new FormData();
//             formData.append('_id', compModelVerInfo[0]._id);
//             formData.append('labelName', labelName);
//             formData.append('img_paths', JSON.stringify(img_paths_to_delete));
//             formData.append('type', type);
//             formData.append('position', position);

//             const response = await urlSocket.post('/deleteSelectedImage', formData, {
//                 headers: {
//                     'content-type': 'multipart/form-data'
//                 },
//                 mode: 'no-cors'
//             });

//             if (response.data.error === "Tenant not found") {
//                 console.log("data error", response.data.error);
//                 errorHandler(response.data.error);
//             }
//             else {

//                 setResponseMessage(response.data.message);
//                 console.log('nine', response.data.comp_model_ver_info_list)
//                 setCompModelVerInfo(response.data.comp_model_ver_info_list);
//                 setImagesLength(response.data.img_count);

//                 await imgGlry();

//                 if (selectedList.length !== 0) {
//                     const updatedImgGlr = imgGlr;
//                     const filteredGroupedData = selectedList.reduce((acc, itemList) => {
//                         const version = itemList.value;
//                         const itemsForVersion = updatedImgGlr.filter(item => item.used_model_ver.includes(version));
//                         acc[version] = itemsForVersion;
//                         return acc;
//                     }, {});

//                     setGroupedData(filteredGroupedData);
//                 }

//                 setTimeout(() => {
//                     setResponseMessage("");
//                 }, 1000);
//             }
//         } catch (error) {
//             console.log('error', error);
//         }

//         setSelectedImages([]);
//         setImgPaths([]);
//     };

//     const multiImgDelete = (items, img_label) => {
//         const allSelected = selectedImages.length === items.length;
//         const updatedSelectedImages = allSelected ? [] : items;

//         let std_img_paths = [];
//         let ver = compModelVerInfo[0].model_ver;

//         updatedSelectedImages.forEach((item, itemId) => {
//             let idxVal = item.used_model_ver.indexOf(parseInt(ver));
//             let imgName = item.imagePathType[idxVal].image_path;

//             if (item.imagePathType[idxVal].type === img_label) {
//                 std_img_paths.push(imgName);
//             }
//         });

//         setSelectedImages(updatedSelectedImages);
//         setImgPaths(std_img_paths);
//     };

//     const similarityChange = async (value) => {
//         setRangeValue(value);
//         try {
//             const response = await urlSocket.post('/threshold_changes', {
//                 'comp_name': compModelVerInfo[0].comp_name,
//                 'comp_code': compModelVerInfo[0].comp_code,
//                 'model_name': compModelVerInfo[0].model_name,
//                 'model_ver': compModelVerInfo[0].model_ver,
//                 'thres': value
//             }, { mode: 'no-cors' });

//             if (response.data.error === "Tenant not found") {
//                 console.log("data error", response.data.error);
//                 errorHandler(response.data.error);
//             }
//             else {
//                 console.log('ten', response.data)
//                 setCompModelVerInfo(response.data);
//             }
//         } catch (error) {
//             console.log('error', error);
//         }
//     };

//     const rotation = (e) => {
//         setImgRotation(e.target.checked);
//         if (e.target.checked === true) {
//             setNoOfRotation(1);
//         }
//         if (e.target.checked === false) {
//             setNoOfRotation(0);
//             try {
//                 urlSocket.post('/rotation_update', {
//                     'comp_name': compModelVerInfo[0].comp_name,
//                     'comp_code': compModelVerInfo[0].comp_code,
//                     'model_name': compModelVerInfo[0].model_name,
//                     'model_ver': compModelVerInfo[0].model_ver,
//                     'image_rotation': 0
//                 }, { mode: 'no-cors' });
//             } catch (error) {
//                 console.log('error', error);
//             }
//         }
//     };

//     const rotationUpdate = async (rotate_val) => {
//         let value = parseInt(rotate_val);

//         if (value > 100) {
//             value = 100;
//         }

//         setNoOfRotation(value);
//         try {
//             const response = await urlSocket.post('/rotation_update', {
//                 'comp_name': compModelVerInfo[0].comp_name,
//                 'comp_code': compModelVerInfo[0].comp_code,
//                 'model_name': compModelVerInfo[0].model_name,
//                 'model_ver': compModelVerInfo[0].model_ver,
//                 'image_rotation': value
//             }, { mode: 'no-cors' });

//             if (response.data.error === "Tenant not found") {
//                 console.log("data error", response.data.error);
//                 errorHandler(response.data.error);
//             }
//             else {
//                 console.log('eleven', response.data)
//                 setCompModelVerInfo(response.data);
//             }
//         } catch (error) {
//             console.log('error', error);
//         }
//     };

//     // const checkWebcam = async () => {
//     //     try {
//     //         const devices = await navigator.mediaDevices.enumerateDevices();
//     //         const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
//     //         if (!videoInputDevices.length) {
//     //             setCameraDisconnected(true);
//     //         } else {
//     //             setCameraDisconnected(false);
//     //         }
//     //     } catch (error) {
//     //         console.error('Error checking devices:', error);
//     //     }
//     // };

//     // Generate a unique port number based on camera index and device ID
//     const generatePortNumber = (camIndex, deviceId) => {
//         // Base port number starting from 8000
//         const basePort = 8000;
//         // Use camera index or generate from deviceId hash
//         const indexPort = camIndex !== undefined ? camIndex : 0;
//         // Create a simple hash from deviceId for uniqueness
//         const deviceHash = deviceId ? deviceId.slice(-4) : '0000';
//         const hashNumber = parseInt(deviceHash, 16) % 1000;

//         return (basePort + indexPort * 10 + (hashNumber % 10)).toString();
//     };
//     // Extract port information from camera label
//     const extractPortInfo = (label) => {
//         let v_id = '', p_id = '', portNumber = '';

//         if (label && label.includes('(') && label.includes(')')) {
//             const portInfo = label.slice(label.indexOf('(') + 1, label.indexOf(')'));
//             const parts = portInfo.split(':');
//             v_id = parts[0] || '';
//             p_id = parts[1] || '';

//             // Extract port number - could be in various formats
//             // Looking for patterns like "port:1234" or just numbers
//             const portMatch = portInfo.match(/port[:\s]*(\d+)|(\d{4,})/i);
//             if (portMatch) {
//                 portNumber = portMatch[1] || portMatch[2];
//             }
//         }

//         return { v_id, p_id, portNumber };
//     };


//     const checkWebcam = useCallback(async () => {
//         try {
//             // Now enumerate devices
//             const devices = await navigator.mediaDevices.enumerateDevices();
//             const videoInputDevices = devices.filter(device => device.kind === 'videoinput');

//             if (!videoInputDevices.length) {
//                 setCameraDisconnected(true);
//             } else {
//                 console.log('Available Cameras: ', videoInputDevices);

//                 const newAvailableCameras = videoInputDevices
//                     .map((camera, index) => {
//                         const portInfo = extractPortInfo(camera.label);
//                         const generatedPort = generatePortNumber(index, camera.deviceId);

//                         return {
//                             deviceId: camera.deviceId,
//                             label: camera.label,
//                             camIndex: index,
//                             pos_no: index,
//                             id: index + 1,
//                             title: camera.label,
//                             positionName: `Position ${index + 1}`,
//                             originalDeviceId: camera.deviceId,
//                             groupId: camera.groupId,
//                             v_id: portInfo.v_id,
//                             p_id: portInfo.p_id,
//                             portNumber: portInfo.portNumber || generatedPort,
//                             customPort: false
//                         };
//                     });

//                 console.log('Available cameras with full data:', newAvailableCameras);
//                 setPysclCameraList(newAvailableCameras);
//                 setNewAvailableCameras(newAvailableCameras);
//                 setCameraDisconnected(false);

//                 // Set default camera if none selected and cameras are available
//                 if (!selectedCameraLabel && cameraList.length > 0 && newAvailableCameras.length > 0) {
//                     const firstConfiguredCamera = cameraList[0];
//                     if (firstConfiguredCamera) {
//                         setSelectedCameraLabel(firstConfiguredCamera.originalLabel);
//                     }
//                 }
//                 // await getCameraPosition();
//             }
//         } catch (error) {
//             console.log('Error Info: ', error);
//             Swal.fire({
//                 title: "Camera Error",
//                 text: "Please allow camera access or check camera port",
//                 icon: "error",
//                 confirmButtonText: "OK"
//             });
//         }
//     }, []);

//     // Function to match cameras from cameraList with newAvailableCameras
//     const getMatchedCameras = () => {
//         if (!cameraList.length || !newAvailableCameras.length) return [];

//         return cameraList.map(configCamera => {
//             // Find matching camera in newAvailableCameras by comparing p_id, v_id, and originalLabel
//             const matchedCamera = newAvailableCameras.find(availableCamera => {
//                 const pIdMatch = configCamera.p_id === availableCamera.p_id;
//                 const vIdMatch = configCamera.v_id === availableCamera.v_id;
//                 const labelMatch = configCamera.originalLabel === availableCamera.title;

//                 return pIdMatch && vIdMatch && labelMatch;
//             });

//             return {
//                 ...configCamera,
//                 isAvailable: !!matchedCamera,
//                 deviceId: matchedCamera?.deviceId || null,
//                 actualLabel: matchedCamera?.label || configCamera.originalLabel
//             };
//         });
//     };

//     // Function to switch camera
//     // const switchCamera = (cameraLabel) => {
//     //     console.log('=== SWITCHING CAMERA ===');
//     //     console.log('Switching to camera:', cameraLabel);
//     //     console.log('Current outlinePath:', outlinePath);
//     //     console.log('Current stageInfo datasets:', stageInfo?.datasets);

//     //     setSelectedCameraLabel(cameraLabel);
//     //     setShowCameraSelector(false);

//     //     // Update outline for the selected camera if in multi-camera mode
//     //     if (stageInfo?.camera_selection?.mode === 'multi' && showOutline) {
//     //         console.log('Updating outline for multi-camera mode');
//     //         // Trigger outline update for the new camera
//     //         newOutlineChange(defaultOutline);
//     //     }

//     //     // Log the current outline path for the selected camera
//     //     const selectedCamera = cameraList.find(cam => cam.originalLabel === cameraLabel);
//     //     if (selectedCamera && typeof outlinePath === 'object') {
//     //         const normalizedLabel = selectedCamera.label.trim().toLowerCase().replace(/\s+/g, "_");
//     //         console.log('Selected camera normalized label:', normalizedLabel);
//     //         console.log('Outline path for selected camera:', outlinePath[normalizedLabel]);
//     //     }
//     //     console.log('=== CAMERA SWITCH COMPLETE ===');
//     // };
//     // 4. Update the camera switching function to reload images
//     const switchCamera = (cameraLabel) => {
//         console.log('=== SWITCHING CAMERA ===');
//         console.log('Switching to camera:', cameraLabel);

//         setSelectedCameraLabel(cameraLabel);
//         setShowCameraSelector(false);

//         // Reload images for the selected camera
//         if (compModelVerInfo && compModelVerInfo[0]) {
//             imgGlry(compModelVerInfo[0]);
//         }

//         // Update outline for the selected camera if in multi-camera mode
//         if (stageInfo?.camera_selection?.mode === 'multi' && showOutline) {
//             console.log('Updating outline for multi-camera mode');
//             newOutlineChange(defaultOutline);
//         }

//         console.log('=== CAMERA SWITCH COMPLETE ===');
//     };


//     // const getCameraPosition = async (modelInfo) => {
//     //     try {
//     //         setLoading(true);
//     //         console.log("modelInfo", modelInfo);

//     //         const response = await urlSocket.post(
//     //             "/get_camera_stg",
//     //             modelInfo,
//     //             {
//     //                 headers: { "Content-Type": "application/json" }, // ✅ use JSON
//     //             }
//     //         );
//     //         console.log("response", response);

//     //         if (response.data.status === "success") {
//     //             if(response.data.camera_selection?.mode === 'single'){// ✅ extract only cameras array
//     //                                 console.log('camerascameras',response.data.camera_selection.camera?.originalLabel)

//     //             const camera = response.data.camera_selection?.camera?.originalLabel || [];
//     //             console.log('camerascamerascamerascamerascameras', camera)
//     //             setCameraList(camera); // store cameras array in state

//     //             // Set default camera if none selected and cameras are available
//     //             if (!selectedCameraLabel && cameras.length > 0) {
//     //                 setSelectedCameraLabel(cameras[0].originalLabel);
//     //             }}
//     //             else{
//     //                 const cameras = response.data.camera_selection?.cameras || [];
//     //             console.log('cameras', cameras)
//     //             setCameraList(cameras); // store cameras array in state

//     //             // Set default camera if none selected and cameras are available
//     //             if (!selectedCameraLabel && cameras.length > 0) {
//     //                 setSelectedCameraLabel(cameras[0].originalLabel);
//     //             }}


//     //         } else {
//     //             console.error("Camera data not found:", response.data.message);
//     //         }
//     //     } catch (error) {
//     //         console.log("Error Info: ", error);
//     //     } finally {
//     //         setLoading(false);
//     //     }
//     // };

//     const getCameraPosition = async (modelInfo) => {
//         try {
//             setLoading(true);
//             console.log("modelInfo", modelInfo);

//             const response = await urlSocket.post("/get_camera_stg", modelInfo, {
//                 headers: { "Content-Type": "application/json" },
//             });

//             console.log("response", response);

//             if (response.data.status === "success") {
//                 let cameras = [];

//                 if (response.data.camera_selection?.mode === "single") {
//                     const camera = response.data.camera_selection?.camera;
//                     if (camera) cameras = [camera]; // normalize into array
//                 } else {
//                     cameras = response.data.camera_selection?.cameras || [];
//                 }

//                 console.log("cameras", cameras);
//                 setCameraList(cameras);

//                 // Set default selected camera if not already selected
//                 if (!selectedCameraLabel && cameras.length > 0) {
//                     setSelectedCameraLabel(cameras[0].originalLabel);
//                 }
//             } else {
//                 console.error("Camera data not found:", response.data.message);
//             }
//         } catch (error) {
//             console.log("Error Info: ", error);
//         } finally {
//             setLoading(false);
//         }
//     };


//     const newOutlineChange = (ot_label) => {
//         console.log('=== OUTLINE CHANGE ===');
//         console.log('ot_label', ot_label);
//         console.log('stageInfo.datasets:', stageInfo?.datasets);
//         setDefaultOutline(ot_label);

//         // Handle multi-camera mode
//         if (stageInfo?.camera_selection?.mode === 'multi') {
//             console.log('Multi-camera mode detected');

//             // For multi-camera mode, we need to store the entire datasets object
//             // so that getCurrentOutlinePath can access the correct color for each camera
//             setOutlinePath(stageInfo.datasets);

//             console.log('Set outlinePath to full datasets:', stageInfo.datasets);
//         } else {
//             // Handle single camera mode (original logic)
//             if (ot_label === 'White Outline') {
//                 setOutlinePath(compInfo.datasets.white_path);
//             }
//             else if (ot_label === 'Red Outline') {
//                 setOutlinePath(compInfo.datasets.red_path);
//             }
//             else if (ot_label === 'Green Outline') {
//                 setOutlinePath(compInfo.datasets.green_path);
//             }
//             else if (ot_label === 'Blue Outline') {
//                 setOutlinePath(compInfo.datasets.blue_path);
//             }
//             else if (ot_label === 'Black Outline') {
//                 setOutlinePath(compInfo.datasets.black_path);
//             }
//             else if (ot_label === 'Orange Outline') {
//                 setOutlinePath(compInfo.datasets.orange_path);
//             }
//             else if (ot_label === 'Yellow Outline') {
//                 setOutlinePath(compInfo.datasets.yellow_path);
//             }
//         }
//     };

//     const renderCameraGallery = () => {
//         // Group images by camera using the correct camera field
//         const imagesByCamera = {};

//         Object.entries(activeGroupData).forEach(([version, items]) => {
//             if (compModelVerInfo[0].model_ver === parseInt(version)) {
//                 items.forEach(item => {
//                     if (item.imagePathType && item.imagePathType[0] && item.imagePathType[0].type === labelName) {
//                         // Use the camera field from imagePathType
//                         const cameraKey = item.imagePathType[0].camera;
//                         if (!imagesByCamera[cameraKey]) {
//                             imagesByCamera[cameraKey] = [];
//                         }
//                         imagesByCamera[cameraKey].push({ item, version });
//                     }
//                 });
//             }
//         });

//         // Filter by selected camera if one is selected
//         const filteredImagesByCamera = selectedCameraLabel ? (() => {
//             const selectedCamera = cameraList.find(cam => cam.originalLabel === selectedCameraLabel);
//             if (!selectedCamera) return imagesByCamera;

//             const cameraKey = selectedCamera.label.replace(/\s+/g, "_");
//             return imagesByCamera[cameraKey] ? { [cameraKey]: imagesByCamera[cameraKey] } : {};
//         })() : imagesByCamera;

//         console.log('filteredImagesByCamera', filteredImagesByCamera, selectedCameraLabel);
//         console.log('imagesByCamera', imagesByCamera);
//         console.log('labelName', labelName);

//         return Object.entries(filteredImagesByCamera).map(([cameraKey, cameraImages], cameraIndex) => {
//             // Find the camera config that matches this cameraKey
//             const camera = cameraList.find(cam =>
//                 cam.label.replace(/\s+/g, "_") === cameraKey
//             );
//             const displayName = camera ? camera.label : cameraKey.replace(/_/g, " ");
//             const isOnline = camera && newAvailableCameras.some(availCam =>
//                 availCam.label === camera.originalLabel
//             );

//             return (
//                 <div key={cameraIndex} className="mb-4">
//                     {/* Camera Section Header */}
//                     <div className="d-flex justify-content-between align-items-center mb-2 p-2"
//                         style={{
//                             backgroundColor: '#f8f9fa',
//                             borderRadius: '5px',
//                             border: `2px solid ${isOnline ? '#28a745' : '#dc3545'}`
//                         }}>
//                         <div className="d-flex align-items-center">
//                             <span className={`badge ${isOnline ? 'badge-success' : 'badge-danger'} me-2`}>
//                                 {isOnline ? '🟢' : '🔴'}
//                             </span>
//                             <h6 className="mb-0" style={{ fontWeight: 'bold' }}>
//                                 {displayName}
//                             </h6>
//                         </div>
//                         <div className="d-flex align-items-center gap-2">
//                             <span className="badge badge-secondary">
//                                 {cameraImages.length} images
//                             </span>
//                             <div style={{ display: 'flex', alignItems: 'center' }}>
//                                 <Checkbox
//                                     style={{
//                                         borderColor: 'slategray',
//                                         borderWidth: '2px',
//                                         borderStyle: 'solid',
//                                         borderRadius: '7px',
//                                         height: '18px',
//                                         width: '18px',
//                                         marginRight: '5px',
//                                     }}
//                                     checked={cameraImages.every(({ item }) => selectedImages.includes(item))}
//                                     onChange={(e) => {
//                                         const isChecked = e.target.checked;
//                                         cameraImages.forEach(({ item, version }) => {
//                                             const isCurrentlySelected = selectedImages.includes(item);
//                                             if (isChecked && !isCurrentlySelected) {
//                                                 handleCheckboxChange(item, version);
//                                             } else if (!isChecked && isCurrentlySelected) {
//                                                 handleCheckboxChange(item, version);
//                                             }
//                                         });
//                                     }}
//                                 />
//                                 <small>Select All</small>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Camera Images Grid */}
//                     <Row>
//                         {cameraImages.map(({ item, version }, itemId) => {
//                             const isSelected = selectedImages.includes(item);
//                             const imageIndex = itemId + 1;

//                             return (
//                                 <Col sm={3} md={3} key={`${cameraIndex}-${itemId}`}>
//                                     <Card style={{
//                                         borderRadius: '7px',
//                                         marginBottom: '10px'
//                                     }}>
//                                         <CardBody style={{
//                                             padding: '7px',
//                                             border: isSelected ? '2px solid red' : '2px solid green',
//                                             borderRadius: '7px'
//                                         }}>
//                                             <div style={{
//                                                 fontWeight: 'bold',
//                                                 textAlign: 'left',
//                                                 whiteSpace: 'pre',
//                                                 display: 'flex',
//                                                 justifyContent: 'space-between',
//                                                 alignItems: 'center',
//                                                 marginBottom: '5px'
//                                             }}>
//                                                 <div style={{ display: 'flex', alignItems: 'center' }}>
//                                                     <Checkbox
//                                                         style={{
//                                                             borderColor: 'slategray',
//                                                             borderWidth: '2px',
//                                                             borderStyle: 'solid',
//                                                             borderRadius: '7px',
//                                                             height: '16px',
//                                                             width: '16px',
//                                                             marginRight: '5px'
//                                                         }}
//                                                         checked={isSelected}
//                                                         onChange={() => handleCheckboxChange(item, version)}
//                                                     />
//                                                     <span style={{ fontSize: '12px' }}>#{imageIndex}</span>
//                                                 </div>
//                                                 <div style={{ textAlign: 'right' }}>
//                                                     <Popconfirm
//                                                         placement="rightBottom"
//                                                         title="Do you want to delete?"
//                                                         onConfirm={() => deleteImageClick(item, compModelVerInfo[0].model_ver, labelName)}
//                                                         okText="Yes"
//                                                     >
//                                                         <DeleteTwoTone
//                                                             twoToneColor="red"
//                                                             style={{
//                                                                 fontSize: '16px',
//                                                                 background: 'white',
//                                                                 borderRadius: '5px',
//                                                                 cursor: 'pointer'
//                                                             }}
//                                                         />
//                                                     </Popconfirm>
//                                                 </div>
//                                             </div>

//                                             <Image
//                                                 src={showImage(item.imagePathType[0].image_path)}
//                                                 alt='Image not there'
//                                                 style={{ width: '100%', borderRadius: '3px' }}
//                                             />

//                                             <div style={{
//                                                 fontSize: '10px',
//                                                 marginTop: '5px',
//                                                 display: 'flex',
//                                                 flexDirection: 'column',
//                                                 gap: '2px'
//                                             }}>
//                                                 <div style={{ fontWeight: 'bold' }}>
//                                                     Used In: {item.used_model_ver.join(', ')}
//                                                 </div>
//                                                 <div style={{ color: '#666' }}>
//                                                     Camera: {displayName}
//                                                 </div>
//                                                 <div style={{ color: '#666' }}>
//                                                     Type: {item.imagePathType[0].type}
//                                                 </div>
//                                                 {item.imagePathType[0].date && (
//                                                     <div style={{ color: '#888', fontSize: '9px' }}>
//                                                         {new Date(item.imagePathType[0].date).toLocaleString()}
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         </CardBody>
//                                     </Card>
//                                 </Col>
//                             );
//                         })}
//                     </Row>

//                     {/* Camera Statistics */}
//                     <div className="text-center mb-3 p-2" style={{
//                         backgroundColor: '#f1f3f4',
//                         borderRadius: '5px',
//                         fontSize: '12px'
//                     }}>
//                         <strong>{displayName}</strong> - Total Images: {cameraImages.length} |
//                         Selected: {cameraImages.filter(({ item }) => selectedImages.includes(item)).length}
//                     </div>
//                 </div>
//             );
//         });
//     };

//     // 2. Fix the camera gallery display logic
//     // const renderCameraGallery = () => {
//     //     // Group images by camera using the correct camera field
//     //     const imagesByCamera = {};

//     //     Object.entries(activeGroupData).forEach(([version, items]) => {
//     //         if (compModelVerInfo[0].model_ver === parseInt(version)) {
//     //             items.forEach(item => {
//     //                 if (item.imagePathType[0].type === labelName) {
//     //                     // Use the camera field from imagePathType
//     //                     const cameraKey = item.imagePathType[0].camera;
//     //                     if (!imagesByCamera[cameraKey]) {
//     //                         imagesByCamera[cameraKey] = [];
//     //                     }
//     //                     imagesByCamera[cameraKey].push({ item, version });
//     //                 }
//     //             });
//     //         }
//     //     });

//     //     // Filter by selected camera if one is selected
//     //     const filteredImagesByCamera = selectedCameraLabel ? (() => {
//     //         const selectedCamera = cameraList.find(cam => cam.originalLabel === selectedCameraLabel);
//     //         if (!selectedCamera) return imagesByCamera;

//     //         const cameraKey = selectedCamera.label.replace(/\s+/g, "_");
//     //         return imagesByCamera[cameraKey] ? { [cameraKey]: imagesByCamera[cameraKey] } : {};
//     //     })() : imagesByCamera;

//     //     console.log('filteredImagesByCamera', filteredImagesByCamera, selectedCameraLabel);

//     //     return Object.entries(filteredImagesByCamera).map(([cameraKey, cameraImages], cameraIndex) => {
//     //         // Find the camera config that matches this cameraKey
//     //         const camera = cameraList.find(cam =>
//     //             cam.label.replace(/\s+/g, "_") === cameraKey
//     //         );
//     //         const displayName = camera ? camera.label : cameraKey.replace(/_/g, " ");
//     //         const isOnline = camera && newAvailableCameras.some(availCam =>
//     //             availCam.label === camera.originalLabel
//     //         );

//     //         return (
//     //             <div key={cameraIndex} className="mb-4">
//     //                 {/* Camera Section Header */}
//     //                 <div className="d-flex justify-content-between align-items-center mb-2 p-2"
//     //                     style={{
//     //                         backgroundColor: '#f8f9fa',
//     //                         borderRadius: '5px',
//     //                         border: `2px solid ${isOnline ? '#28a745' : '#dc3545'}`
//     //                     }}>
//     //                     <div className="d-flex align-items-center">
//     //                         <span className={`badge ${isOnline ? 'badge-success' : 'badge-danger'} me-2`}>
//     //                             {isOnline ? '🟢' : '🔴'}
//     //                         </span>
//     //                         <h6 className="mb-0" style={{ fontWeight: 'bold' }}>
//     //                             {displayName}
//     //                         </h6>
//     //                     </div>
//     //                     <div className="d-flex align-items-center gap-2">
//     //                         <span className="badge badge-secondary">
//     //                             {cameraImages.length} images
//     //                         </span>
//     //                         <div style={{ display: 'flex', alignItems: 'center' }}>
//     //                             <Checkbox
//     //                                 style={{
//     //                                     borderColor: 'slategray',
//     //                                     borderWidth: '2px',
//     //                                     borderStyle: 'solid',
//     //                                     borderRadius: '7px',
//     //                                     height: '18px',
//     //                                     width: '18px',
//     //                                     marginRight: '5px',
//     //                                 }}
//     //                                 checked={cameraImages.every(({ item }) => selectedImages.includes(item))}
//     //                                 onChange={(e) => {
//     //                                     const isChecked = e.target.checked;
//     //                                     cameraImages.forEach(({ item, version }) => {
//     //                                         const isCurrentlySelected = selectedImages.includes(item);
//     //                                         if (isChecked && !isCurrentlySelected) {
//     //                                             handleCheckboxChange(item, version);
//     //                                         } else if (!isChecked && isCurrentlySelected) {
//     //                                             handleCheckboxChange(item, version);
//     //                                         }
//     //                                     });
//     //                                 }}
//     //                             />
//     //                             <small>Select All</small>
//     //                         </div>
//     //                     </div>
//     //                 </div>

//     //                 {/* Camera Images Grid */}
//     //                 <Row>
//     //                     {cameraImages.map(({ item, version }, itemId) => {
//     //                         const isSelected = selectedImages.includes(item);
//     //                         const imageIndex = itemId + 1;

//     //                         return (
//     //                             <Col sm={3} md={3} key={`${cameraIndex}-${itemId}`}>
//     //                                 <Card style={{
//     //                                     borderRadius: '7px',
//     //                                     marginBottom: '10px'
//     //                                 }}>
//     //                                     <CardBody style={{
//     //                                         padding: '7px',
//     //                                         border: isSelected ? '2px solid red' : '2px solid green',
//     //                                         borderRadius: '7px'
//     //                                     }}>
//     //                                         <div style={{
//     //                                             fontWeight: 'bold',
//     //                                             textAlign: 'left',
//     //                                             whiteSpace: 'pre',
//     //                                             display: 'flex',
//     //                                             justifyContent: 'space-between',
//     //                                             alignItems: 'center',
//     //                                             marginBottom: '5px'
//     //                                         }}>
//     //                                             <div style={{ display: 'flex', alignItems: 'center' }}>
//     //                                                 <Checkbox
//     //                                                     style={{
//     //                                                         borderColor: 'slategray',
//     //                                                         borderWidth: '2px',
//     //                                                         borderStyle: 'solid',
//     //                                                         borderRadius: '7px',
//     //                                                         height: '16px',
//     //                                                         width: '16px',
//     //                                                         marginRight: '5px'
//     //                                                     }}
//     //                                                     checked={isSelected}
//     //                                                     onChange={() => handleCheckboxChange(item, version)}
//     //                                                 />
//     //                                                 <span style={{ fontSize: '12px' }}>#{imageIndex}</span>
//     //                                             </div>
//     //                                             <div style={{ textAlign: 'right' }}>
//     //                                                 <Popconfirm
//     //                                                     placement="rightBottom"
//     //                                                     title="Do you want to delete?"
//     //                                                     onConfirm={() => deleteImageClick(item, compModelVerInfo[0].model_ver, labelName)}
//     //                                                     okText="Yes"
//     //                                                 >
//     //                                                     <DeleteTwoTone
//     //                                                         twoToneColor="red"
//     //                                                         style={{
//     //                                                             fontSize: '16px',
//     //                                                             background: 'white',
//     //                                                             borderRadius: '5px',
//     //                                                             cursor: 'pointer'
//     //                                                         }}
//     //                                                     />
//     //                                                 </Popconfirm>
//     //                                             </div>
//     //                                         </div>

//     //                                         <Image
//     //                                             src={showImage(item.imagePathType[0].image_path)}
//     //                                             alt='Image not there'
//     //                                             style={{ width: '100%', borderRadius: '3px' }}
//     //                                         />

//     //                                         <div style={{
//     //                                             fontSize: '10px',
//     //                                             marginTop: '5px',
//     //                                             display: 'flex',
//     //                                             flexDirection: 'column',
//     //                                             gap: '2px'
//     //                                         }}>
//     //                                             <div style={{ fontWeight: 'bold' }}>
//     //                                                 Used In: {item.used_model_ver.join(', ')}
//     //                                             </div>
//     //                                             <div style={{ color: '#666' }}>
//     //                                                 Camera: {displayName}
//     //                                             </div>
//     //                                             {item.imagePathType[0].date && (
//     //                                                 <div style={{ color: '#888', fontSize: '9px' }}>
//     //                                                     {new Date(item.imagePathType[0].date).toLocaleString()}
//     //                                                 </div>
//     //                                             )}
//     //                                         </div>
//     //                                     </CardBody>
//     //                                 </Card>
//     //                             </Col>
//     //                         );
//     //                     })}
//     //                 </Row>

//     //                 {/* Camera Statistics */}
//     //                 <div className="text-center mb-3 p-2" style={{
//     //                     backgroundColor: '#f1f3f4',
//     //                     borderRadius: '5px',
//     //                     fontSize: '12px'
//     //                 }}>
//     //                     <strong>{displayName}</strong> - Total Images: {cameraImages.length} |
//     //                     Selected: {cameraImages.filter(({ item }) => selectedImages.includes(item)).length}
//     //                 </div>
//     //             </div>
//     //         );
//     //     });
//     // };
//     // 3. Fix the showImage function for camera-based images
//     const showImage = (output_img) => {
//         console.log('output_img : ', output_img);

//         let pathToUse;

//         // Handle the camera-based image path structure
//         if (typeof output_img === 'string') {
//             pathToUse = output_img;
//         } else if (Array.isArray(output_img)) {
//             pathToUse = output_img[0];
//         } else if (typeof output_img === 'object' && !Array.isArray(output_img)) {
//             // For multi-camera mode with selected camera
//             if (selectedCameraLabel) {
//                 const selectedCamera = cameraList.find(cam => cam.originalLabel === selectedCameraLabel);
//                 if (selectedCamera) {
//                     const normalizedLabel = selectedCamera.label.trim().toLowerCase().replace(/\s+/g, "_");
//                     pathToUse = output_img[normalizedLabel];
//                     console.log('Multi-camera mode - using path for camera:', normalizedLabel, pathToUse);
//                 }
//             }
//             // Fallback to first available path
//             if (!pathToUse) {
//                 pathToUse = Object.values(output_img)[0];
//             }
//         }

//         if (!pathToUse) {
//             console.warn('No valid path found in output_img:', output_img);
//             return '';
//         }

//         // Process the path to get the correct URL
//         const parts = pathToUse.split("/");
//         const newPath = parts.slice(1).join("/");

//         let startIndex;
//         if (newPath.includes("Datasets/")) {
//             startIndex = newPath.indexOf("Datasets/");
//         } else {
//             startIndex = newPath.indexOf("receive/");
//         }

//         const relativePath = newPath.substring(startIndex);
//         console.log('Final image URL: ', ImageUrl + relativePath);
//         return `${ImageUrl + relativePath}`;
//     };


//     const setVersionData = (value) => {
//         const show_train_image = value?.sift_train_datasets?.length > 0 ? true : false;
//         console.log('twlene', [value])
//         setCompModelVerInfo([value]);
//         setShowTrainImage(show_train_image);
//     };

//     const changeShowTrainImages = (data) => {
//         const value = data === 0 ? false : true;
//         setShowTrainImage(value);
//     };

//     const imageSelectAll = (e) => {
//         console.log('1st', new Date());
//         const isChecked = e.target.checked;

//         const selectedVersions = selectedList.map((ver) => ver.value);
//         const isNoVerSelected = selectedVersions.length === 0;
//         const largeSet = new Set(selectedVersions);

//         const checkIfAnyExist = (smallArray) =>
//             isNoVerSelected || smallArray.some((num) => largeSet.has(num));

//         const updatedGallery = imgGlr.map((imgVal) => {
//             if (
//                 imgVal.imagePathType[0].type !== labelName ||
//                 imgVal.used_model_ver.includes(compModelVerInfo[0].model_ver)
//             ) {
//                 return imgVal;
//             }

//             return checkIfAnyExist(imgVal.used_model_ver)
//                 ? { ...imgVal, checked: isChecked }
//                 : imgVal;
//         });

//         setImgGlr(updatedGallery);
//         console.log('2nd ', new Date());
//     };

//     const getImgPath = (img_path) => {
//         console.log('ImageUrl+img_path', ImageUrl + img_path);
//         return ImageUrl + img_path;
//     };

//     const showOtherVersionImages = () => {
//         const selectedVersions = new Set(selectedList.map((ver) => ver.value));
//         const isNoVerSelected = selectedVersions.size === 0;
//         const currentVersion = compModelVerInfo[0].model_ver;

//         const checkIfAnyExist = (usedVersions) =>
//             isNoVerSelected || usedVersions.some((num) => selectedVersions.has(num));

//         let allImageCount = 0;
//         let selectedCount = 0;

//         const filteredImages = imgGlr.filter((imgVal) => {
//             if (imgVal.imagePathType[0].type !== labelName) return false;
//             if (!checkIfAnyExist(imgVal.used_model_ver)) return false;
//             if (imgVal.used_model_ver.length === 1 && imgVal.used_model_ver.includes(currentVersion)) return false;

//             allImageCount++;

//             if (imgVal.used_model_ver.includes(currentVersion) || imgVal.checked) {
//                 selectedCount++;
//             }

//             return true;
//         });

//         const isAllChecked = allImageCount > 0 && allImageCount === selectedCount;

//         return (
//             <>
//                 <div className="d-flex justify-content-between my-2">
//                     <h5 className="fw-bold">Other Versions</h5>
//                     <Button color="primary" className="btn btn-sm w-sm" onClick={shareImgData} disabled={isSharing}>
//                         {isSharing ? (
//                             <>
//                                 <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
//                                 Sharing...
//                             </>
//                         ) : (
//                             'Share'
//                         )}
//                     </Button>
//                 </div>
//                 <FormGroup check className="d-flex align-items-center gap-2 my-2">
//                     <Input
//                         type="checkbox"
//                         id="customCheckbox"
//                         checked={isAllChecked}
//                         onChange={imageSelectAll}
//                         className="custom-control-input"
//                     />
//                     <Label
//                         for="customCheckbox"
//                         className="fw-bold my-auto"
//                         style={{ cursor: "pointer", userSelect: "none" }}
//                     >
//                         Select All
//                     </Label>
//                 </FormGroup>
//                 <Row className="scroll-design" style={{ height: "70vh", overflowY: "auto" }}>
//                     {filteredImages.map((imgVal, imgId) => {
//                         const isCurrentVersion = imgVal.used_model_ver.includes(currentVersion);
//                         return (
//                             <Col md={3} lg={3} key={imgId}>
//                                 <Draggable type="dragdrop" data={JSON.stringify(imgVal)}>
//                                     <Card
//                                         style={{
//                                             borderRadius: "7px",
//                                             border: `2px solid ${isCurrentVersion ? "red" : "green"}`,
//                                             background: isCurrentVersion ? "pink" : "transparent",
//                                         }}
//                                     >
//                                         <FormGroup check className="d-flex align-items-center gap-2 mb-2 ms-2">
//                                             <Input
//                                                 type="checkbox"
//                                                 id={`${imgVal.filename}-${imgId}`}
//                                                 name={imgVal.filename}
//                                                 checked={isCurrentVersion || !!imgVal.checked}
//                                                 onChange={(e) => !isCurrentVersion && handleChange(e)}
//                                                 className="custom-control-input"
//                                             />
//                                             <Label
//                                                 for={`${imgVal.filename}-${imgId}`}
//                                                 className="fw-bold my-auto"
//                                                 style={{ cursor: "pointer", userSelect: "none" }}
//                                             >
//                                                 Select
//                                             </Label>
//                                         </FormGroup>
//                                         <Image src={showImage(imgVal.imagePathType[0].image_path)} alt="image not loaded" />
//                                         <p className="fw-bold ms-2 mt-2">
//                                             {`Used In: ${imgVal.used_model_ver.join(", ")}`}
//                                         </p>
//                                     </Card>
//                                 </Draggable>
//                             </Col>
//                         );
//                     })}
//                 </Row>
//             </>
//         );
//     };

//     const errorHandler = (error) => {
//         sessionStorage.removeItem("authUser");
//         history.push("/login");
//     };

//     // const showImage = (output_img) => {
//     //     console.log('output_img : ', output_img);

//     //     let pathToUse;

//     //     // Handle multi-camera mode with selected camera
//     //     if (typeof output_img === 'object' && !Array.isArray(output_img) && selectedCameraLabel) {
//     //         // Find the camera in cameraList to get its label
//     //         const selectedCamera = cameraList.find(cam => cam.originalLabel === selectedCameraLabel);
//     //         if (selectedCamera) {
//     //             const normalizedLabel = selectedCamera.label.trim().toLowerCase().replace(/\s+/g, "_");
//     //             pathToUse = output_img[normalizedLabel];
//     //             console.log('Multi-camera mode - using path for camera:', normalizedLabel, pathToUse);
//     //         }
//     //     }

//     //     // Fallback to original logic
//     //     if (!pathToUse) {
//     //         pathToUse = Array.isArray(output_img)
//     //             ? output_img[0]
//     //             : typeof output_img === 'object'
//     //                 ? Object.values(output_img)[0]
//     //                 : output_img;
//     //     }

//     //     if (!pathToUse) {
//     //         console.warn('No valid path found in output_img:', output_img);
//     //         return '';
//     //     }

//     //     const parts = pathToUse.split("/");
//     //     const newPath = parts.slice(1).join("/");

//     //     let startIndex;
//     //     if (newPath.includes("Datasets/")) {
//     //         startIndex = newPath.indexOf("Datasets/");
//     //     } else {
//     //         startIndex = newPath.indexOf("receive/");
//     //     }

//     //     const relativePath = newPath.substring(startIndex);
//     //     console.log('output_img : ', ImageUrl + relativePath);
//     //     return `${ImageUrl + relativePath}`;
//     // };



//     // Render helper functions
//     const marks = {
//         0: <Tooltip title="Min">0</Tooltip>,
//         1: <Tooltip title="Max">1</Tooltip>,
//     };

//     const marks1 = {
//         0: 0,
//         200: 200
//     };

//     const tooltipFormatter = (value) => {
//         if (value === 0) {
//             return 'Min';
//         } else if (value === 1) {
//             return 'Max';
//         } else {
//             return (value);
//         }
//     };

//     const videoConstraints = {
//         height: DEFAULT_RESOLUTION.height,
//         width: DEFAULT_RESOLUTION.width,
//         facingMode: "user"
//     };

//     let diffVal = uniqueModelVersions
//         ? uniqueModelVersions
//             .filter(ver => ver !== compModelVerInfo[0]?.model_ver)
//             .map(number => ({ label: `Version ${number}`, value: number }))
//         : [];

//     return (
//         <>
//             <div className='page-content'>
//                 <MetaTags>
//                     <title>Component Information</title>
//                 </MetaTags>
//                 <Breadcrumbs
//                     title="MODEL CREATION"
//                     isBackButtonEnable={!isSharing}
//                     gotoBack={back}
//                 />
//                 <Container fluid>
//                     <Card>
//                         <CardBody>
//                             <Row className="d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-2 mb-2">
//                                 <Col xs="12" lg="auto" className="text-left">
//                                     <CardTitle className="mb-0 "><span className="me-2 font-size-12">Component Name :</span>{compName}</CardTitle>
//                                     <CardText className="mb-0"><span className="me-2 font-size-12">Component Code :</span>{compCode}</CardText>
//                                     <CardText className="mb-0"><span className="me-2 font-size-12">Model Name:</span>{modelName}</CardText>
//                                     <CardText className="mb-0"><span className="me-2 font-size-12">Type:</span>{type}</CardText>
//                                 </Col>
//                             </Row>
//                             {
//                                 modelVersionLoading ?
//                                     <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
//                                         <Spinner color="primary" />
//                                         <h5 className="mt-4">
//                                             <strong>Loading Model Version Details...</strong>
//                                         </h5>
//                                     </div>
//                                     :
//                                     <>
//                                         <Row>
//                                             <Col lg={6} >
//                                                 <Label style={{ fontWeight: 'bold' }}>Similarity Adjustment </Label>
//                                                 <Slider min={0.00} max={1.00} step={0.01} value={rangeValue}
//                                                     tooltip={{ open: true, placement: 'top', overlayStyle: { zIndex: 1000 } }}
//                                                     onChange={similarityChange} marks={marks}
//                                                 />
//                                             </Col>
//                                             {/* Image Rotation */}
//                                             {
//                                                 activeTab !== '2' && position !== 'Fixed' && type !== 'ML' &&
//                                                 <Col lg={3} >
//                                                     <Checkbox style={{
//                                                         borderColor: 'slategray', borderWidth: '2px', borderStyle: 'solid', borderRadius: '7px', height: '20px',
//                                                         width: '20px'
//                                                     }}
//                                                         onChange={(e) => rotation(e)}
//                                                         checked={imgRotation}
//                                                     />
//                                                     <Label style={{ fontWeight: 'bold', marginLeft: '5px' }}>Image rotation </Label>
//                                                     <Row>
//                                                         <Col lg={6}>
//                                                             <input
//                                                                 type='number'
//                                                                 className="form-control"
//                                                                 placeholder='Enter No.Of.Rotations'
//                                                                 value={noOfRotation}
//                                                                 onChange={(e) => rotationUpdate(e.target.value)}
//                                                                 disabled={imgRotation === false}
//                                                                 min={1}
//                                                                 max={100}
//                                                             />
//                                                         </Col>
//                                                     </Row>
//                                                 </Col>
//                                             }
//                                         </Row>
//                                         {/* version data in Table */}
//                                         {
//                                             refersh ?
//                                                 <div className='table-responsive mt-2 mb-4'>
//                                                     <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
//                                                         <thead className="table-light">
//                                                             <tr>
//                                                                 <th>Model Version</th>
//                                                                 <th>Model Status</th>
//                                                                 <th>Created on</th>
//                                                                 <th>Approved on</th>
//                                                                 <th>Live on</th>
//                                                                 <th>Action</th>
//                                                             </tr>
//                                                         </thead>
//                                                         <tbody>
//                                                             {compModelVerInfo.map((data, index) => {
//                                                                 let okCount = [];
//                                                                 let notokCount = [];
//                                                                 if (data.type === 'DL') {
//                                                                     okCount = data.datasets.filter((dataset) => dataset.type === 'OK').length;
//                                                                     notokCount = data.datasets.filter((dataset) => dataset.type === 'NG').length;
//                                                                     okCount1 = okCount;
//                                                                     notokCount1 = notokCount;
//                                                                 }

//                                                                 const isInactive = data.model_status === 'Inactive';
//                                                                 const isTrainingInProgress = data.training_status === 'training_in_progress';
//                                                                 const isApprovedTrainedModel = (data.training_status === 'admin approved trained model' && data.model_status !== 'Live');
//                                                                 const isTrainingCompleted = data.training_status === 'training completed';
//                                                                 const isRetrain = data.training_status === 'training_queued';
//                                                                 const isTrainingNotStarted = data.training_status === 'training_not_started';
//                                                                 const isAdminAccuracyInProgress = data.training_status === 'admin accuracy testing in_progress';
//                                                                 const isDl = data.type !== 'ML';

//                                                                 return (
//                                                                     <tr key={index} id='recent-list'>
//                                                                         <td style={{ backgroundColor: "white" }}>{'V'}{data.model_ver}</td>
//                                                                         <td style={{ backgroundColor: "white" }}>
//                                                                             <span className={data.model_status === 'Live' ? 'badge badge-soft-success' : data.model_status === 'Approved' ? 'badge badge-soft-warning' : data.model_status === 'Draft' ? 'badge badge-soft-info' : 'badge badge-soft-danger'}>
//                                                                                 {data.model_status}
//                                                                             </span>
//                                                                         </td>
//                                                                         <td style={{ backgroundColor: "white" }}>{data.created_on}</td>
//                                                                         <td style={{ backgroundColor: "white" }}>{data.approved_on}</td>
//                                                                         <td style={{ backgroundColor: "white" }}>{data.live_on}</td>
//                                                                         <td style={{ backgroundColor: "white", fontSize: '18px' }} >
//                                                                             <div className="d-flex align-items-start flex-wrap gap-2">
//                                                                                 <>
//                                                                                     <Button color="primary" className='btn btn-sm me-2' onClick={() => togXlarge()} data-toggle="modal" data-target=".bs-example-modal-xl" id={`log-${data._id}`}>
//                                                                                         Log Info
//                                                                                     </Button>
//                                                                                     <UncontrolledTooltip placement="top" target={`log-${data._id}`}>
//                                                                                         Log Info
//                                                                                     </UncontrolledTooltip>
//                                                                                 </>

//                                                                                 {isInactive && (
//                                                                                     <Button style={{ backgroundColor: 'green', color: 'white' }} onClick={() => activateModel(data, index)}>
//                                                                                         Activate
//                                                                                     </Button>
//                                                                                 )}

//                                                                                 {
//                                                                                     !(data.type === 'ML') &&
//                                                                                     !showTrainingINProgs && !isInactive && !isTrainingInProgress && (
//                                                                                         isTrainingCompleted ? (
//                                                                                             <Button className='btn btn-sm' color='success' onClick={() => startAdminTest(data)}>
//                                                                                                 Start Admin Accuracy Test
//                                                                                             </Button>
//                                                                                         ) : (() => {
//                                                                                             if (isTrainingInProgress || !isTrainingNotStarted) return null;

//                                                                                             const { result_mode } = compModelVerInfo[0];
//                                                                                             const minOk = Number(config[0]?.min_ok_for_training);
//                                                                                             const minNotOk = Number(config[0]?.min_notok_for_training);

//                                                                                             const canTrain =
//                                                                                                 (result_mode === "both" && okCount >= minOk && notokCount >= minNotOk) ||
//                                                                                                 (result_mode === "ng" && notokCount >= minNotOk) ||
//                                                                                                 (result_mode === "ok" && okCount >= minOk);

//                                                                                             return canTrain ? (
//                                                                                                 <Button className='btn btn-sm' color="primary" onClick={() => train(data)}>
//                                                                                                     Train
//                                                                                                 </Button>
//                                                                                             ) : null;
//                                                                                         })()
//                                                                                     )
//                                                                                 }

//                                                                                 {isAdminAccuracyInProgress && !showTrainingINProgs && !isTrainingInProgress && (
//                                                                                     <div>
//                                                                                         <p>Admin Accuracy Testing In_Progress</p>
//                                                                                         <Button className='btn btn-sm' color="success" onClick={() => startAdminTest(data)}>
//                                                                                             Continue
//                                                                                         </Button>
//                                                                                     </div>
//                                                                                 )}

//                                                                                 {
//                                                                                     (!(position === 'Fixed' && regionSelection === true)) ?
//                                                                                         showTrainingINProgs && (
//                                                                                             <div>
//                                                                                                 <Row className="col-lg-6">
//                                                                                                     {data.training_status_id === 0 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="primary" value={100} animated>Loading...</Progress></Progress>}
//                                                                                                     {data.training_status_id === 1 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={20}>20%</Progress><Progress bar color="primary" value={80} animated></Progress></Progress>}
//                                                                                                     {data.training_status_id === 2 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={40}>40%</Progress><Progress bar color="primary" value={60} animated></Progress></Progress>}
//                                                                                                     {data.training_status_id === 3 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={60}>60%</Progress><Progress bar color="primary" value={40} animated></Progress></Progress>}
//                                                                                                     {data.training_status_id === 4 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={80}>80%</Progress><Progress bar color="primary" value={20} animated></Progress></Progress>}
//                                                                                                     {data.training_status_id === 5 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={100}>100%</Progress></Progress>}
//                                                                                                     <div style={{ 'textAlign': 'center' }}>{data.training_start_time ? clock(data.training_start_time) : 'Training started ...'}</div>
//                                                                                                     <div className='loading-content'>
//                                                                                                         Training In Progress
//                                                                                                         <div className="dot-loader">
//                                                                                                             <div className="dot"></div>
//                                                                                                             <div className="dot"></div>
//                                                                                                             <div className="dot"></div>
//                                                                                                         </div>
//                                                                                                     </div>
//                                                                                                 </Row>
//                                                                                             </div>
//                                                                                         )
//                                                                                         :
//                                                                                         showTrainingINProgs && data?.training_status !== 'training_queued' && (
//                                                                                             <div>
//                                                                                                 <Row className='d-flex flex-column'>
//                                                                                                     <div style={{ 'textAlign': 'start' }}>{data.training_start_time ? clock(data.training_start_time) : 'Training started ...'}</div>
//                                                                                                     <div className='loading-content'>Training In Progress<div className="dot-loader"><div className="dot"></div><div className="dot"></div></div></div>

//                                                                                                     {
//                                                                                                         data?.region_selection ?
//                                                                                                             <div className='d-flex flex-column'>
//                                                                                                                 <h5>Regions</h5>
//                                                                                                                 {data?.rectangles?.map((region, region_id) => (
//                                                                                                                     <div key={region_id} className='d-flex flex-column'>
//                                                                                                                         <h5>{region_id + 1}. {region.name}</h5>
//                                                                                                                         <Row>
//                                                                                                                             {region.training_status_id === 0 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="primary" value={100} animated>Loading...</Progress></Progress>}
//                                                                                                                             {region.training_status_id === 1 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={20}>20%</Progress><Progress bar color="primary" value={80} animated></Progress></Progress>}
//                                                                                                                             {region.training_status_id === 2 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={40}>40%</Progress><Progress bar color="primary" value={60} animated></Progress></Progress>}
//                                                                                                                             {region.training_status_id === 3 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={60}>60%</Progress><Progress bar color="primary" value={40} animated></Progress></Progress>}
//                                                                                                                             {region.training_status_id === 4 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={80}>80%</Progress><Progress bar color="primary" value={20} animated></Progress></Progress>}
//                                                                                                                             {region.training_status_id === 5 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={100}>100%</Progress></Progress>}
//                                                                                                                         </Row>
//                                                                                                                     </div>
//                                                                                                                 ))}
//                                                                                                             </div>
//                                                                                                             : null
//                                                                                                     }
//                                                                                                     <div className='d-flex flex-column'>
//                                                                                                         <h5>Component</h5>
//                                                                                                         <Row>
//                                                                                                             {data.training_status_id === 0 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="primary" value={100} animated>Loading...</Progress></Progress>}
//                                                                                                             {data.training_status_id === 1 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={20}>20%</Progress><Progress bar color="primary" value={80} animated></Progress></Progress>}
//                                                                                                             {data.training_status_id === 2 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={40}>40%</Progress><Progress bar color="primary" value={60} animated></Progress></Progress>}
//                                                                                                             {data.training_status_id === 3 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={60}>60%</Progress><Progress bar color="primary" value={40} animated></Progress></Progress>}
//                                                                                                             {data.training_status_id === 4 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={80}>80%</Progress><Progress bar color="primary" value={20} animated></Progress></Progress>}
//                                                                                                             {data.training_status_id === 5 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={100}>100%</Progress></Progress>}
//                                                                                                         </Row>
//                                                                                                     </div>
//                                                                                                 </Row>
//                                                                                             </div>
//                                                                                         )
//                                                                                 }
//                                                                                 {
//                                                                                     isRetrain &&
//                                                                                     <div>
//                                                                                         <Row>
//                                                                                             <Progress multi style={{ height: '17px', fontWeight: 'bold' }}>
//                                                                                                 <Progress bar color="primary" value={100} animated>
//                                                                                                     Training In Queue
//                                                                                                 </Progress>
//                                                                                             </Progress>
//                                                                                         </Row>
//                                                                                     </div>
//                                                                                 }
//                                                                             </div>
//                                                                         </td>
//                                                                     </tr>
//                                                                 );
//                                                             })}
//                                                         </tbody>
//                                                     </Table>
//                                                 </div> : null
//                                         }

//                                         {/* After including Navbar tab code  Here */}
//                                         <div className={(showTrainingINProgs || showRetrain || addAccTestInProg || compModelVerInfo.some(data => data.model_status === 'Inactive') || compModelVerInfo.some(data => data.training_status === 'training_queued')) ? 'hidden' : ''}>
//                                             <div>
//                                                 {type !== 'ML' ? (
//                                                     <Nav tabs>
//                                                         <React.Fragment>
//                                                             {
//                                                                 (compModelVerInfo[0]?.result_mode === 'ok' || compModelVerInfo[0]?.result_mode === 'both') &&
//                                                                 <NavItem style={{ width: '10%' }}>
//                                                                     <NavLink
//                                                                         style={{
//                                                                             cursor: 'pointer',
//                                                                             color: activeTab === '1' ? 'green' : '',
//                                                                             fontSize: '16px',
//                                                                             fontWeight: activeTab === '1' ? 'bolder' : '',
//                                                                         }}
//                                                                         className={classnames({ active: activeTab === '1' })}
//                                                                         onClick={() => getOK(positive, 0, '1')}
//                                                                         disabled={showTrainingINProgs}
//                                                                     >
//                                                                         {positive}
//                                                                     </NavLink>
//                                                                 </NavItem>
//                                                             }
//                                                             {
//                                                                 (compModelVerInfo[0]?.result_mode === 'ng' || compModelVerInfo[0]?.result_mode === 'both') &&
//                                                                 <NavItem style={{ width: '10%' }}>
//                                                                     <NavLink
//                                                                         style={{
//                                                                             cursor: 'pointer',
//                                                                             color: activeTab === '2' ? 'red' : '',
//                                                                             fontSize: '16px',
//                                                                             fontWeight: activeTab === '2' ? 'bolder' : '',
//                                                                         }}
//                                                                         className={classnames({ active: activeTab === '2' })}
//                                                                         onClick={() => getNotok(negative, 1, '2')}
//                                                                         disabled={showTrainingINProgs}
//                                                                     >
//                                                                         {negative}
//                                                                     </NavLink>
//                                                                 </NavItem>
//                                                             }
//                                                         </React.Fragment>
//                                                     </Nav>) : (
//                                                     <Nav tabs>
//                                                         <React.Fragment>
//                                                             <NavItem style={{ width: '25%' }}>
//                                                                 <NavLink
//                                                                     style={{
//                                                                         cursor: 'pointer',
//                                                                         color: activeTab === '1' ? 'green' : '',
//                                                                         fontSize: '16px',
//                                                                         fontWeight: activeTab === '1' ? 'bolder' : '',
//                                                                         textAlign: 'center'
//                                                                     }}
//                                                                     className={classnames({ active: activeTab === '1' })}
//                                                                     onClick={() => getOK(positive, 0, '1')}
//                                                                     disabled={showTrainingINProgs}
//                                                                 >
//                                                                     Reference Image
//                                                                 </NavLink>
//                                                             </NavItem>
//                                                         </React.Fragment>
//                                                     </Nav>
//                                                 )
//                                                 }
//                                                 <TabContent activeTab={activeTab}>
//                                                     <br /> <br />
//                                                     <TabPane tabId="1">
//                                                         <div>
//                                                             <Nav tabs>
//                                                                 {compModelVerInfo.map((data, index) => (
//                                                                     data.model_status !== 'Inactive' && (
//                                                                         <React.Fragment key={index}>
//                                                                             {data.model_status !== 'Live' && (
//                                                                                 <NavItem>
//                                                                                     <NavLink
//                                                                                         style={{
//                                                                                             cursor: 'pointer',
//                                                                                             color: customActiveTab === '2' ? 'red' : '',
//                                                                                             fontSize: '20px',
//                                                                                             fontWeight: customActiveTab === '2' ? 'bold' : '',
//                                                                                         }}
//                                                                                         outline={selectFilter !== 1}
//                                                                                         className={classnames({ active: customActiveTab === '2' })}
//                                                                                         onClick={() => startLiveCamera(1, 'OK', '2')}
//                                                                                     >
//                                                                                         Live Camera
//                                                                                     </NavLink>
//                                                                                 </NavItem>
//                                                                             )}

//                                                                             {
//                                                                                 type !== 'ML' &&
//                                                                                 versionCount > 1 &&
//                                                                                 imgGlr &&
//                                                                                 imgGlr.length > 1 &&
//                                                                                 (
//                                                                                     <NavItem>
//                                                                                         <NavLink
//                                                                                             style={{
//                                                                                                 cursor: 'pointer',
//                                                                                                 color: customActiveTab === '1' ? 'green' : '',
//                                                                                                 fontSize: '20px',
//                                                                                                 fontWeight: customActiveTab === '1' ? 'bold' : '',
//                                                                                             }}
//                                                                                             outline={selectFilter !== 0}
//                                                                                             className={classnames({ active: customActiveTab === '1' })}
//                                                                                             onClick={() => getImgGalleryInfo(0, 'OK', '1')}
//                                                                                         >
//                                                                                             Image Gallery
//                                                                                         </NavLink>
//                                                                                     </NavItem>
//                                                                                 )}
//                                                                         </React.Fragment>
//                                                                     )
//                                                                 ))}
//                                                             </Nav>
//                                                         </div>
//                                                     </TabPane>

//                                                     <TabPane tabId="2">
//                                                         <div>
//                                                             <Nav tabs>
//                                                                 {compModelVerInfo.map((data, index) => (
//                                                                     data.model_status !== 'Live' && (
//                                                                         <NavItem key={index}>
//                                                                             <NavLink
//                                                                                 style={{
//                                                                                     cursor: "pointer",
//                                                                                     color: customActiveTab === '4' ? 'red' : '',
//                                                                                     fontSize: '20px',
//                                                                                     fontWeight: customActiveTab === '4' ? 'bold' : ''
//                                                                                 }}
//                                                                                 outline={selectFilter !== 4}
//                                                                                 className={classnames({ active: customActiveTab === "4" })}
//                                                                                 onClick={() => startLiveCamera(4, 'NG', '4')}
//                                                                             >
//                                                                                 Live Camera
//                                                                             </NavLink>
//                                                                         </NavItem>
//                                                                     )
//                                                                 ))}
//                                                                 {
//                                                                     type !== 'ML' &&
//                                                                     versionCount > 1 &&
//                                                                     imgGlr &&
//                                                                     imgGlr.length > 1 &&
//                                                                     (
//                                                                         <NavItem>
//                                                                             <NavLink
//                                                                                 style={{
//                                                                                     cursor: "pointer",
//                                                                                     color: customActiveTab === '3' ? 'green' : '',
//                                                                                     fontSize: '20px',
//                                                                                     fontWeight: customActiveTab === '3' ? 'bold' : ''
//                                                                                 }}
//                                                                                 outline={selectFilter !== 3}
//                                                                                 className={classnames({ active: customActiveTab === "3" })}
//                                                                                 onClick={() => getImgGalleryInfo(3, 'NG', '3')}
//                                                                             >
//                                                                                 Image Gallery
//                                                                             </NavLink>
//                                                                         </NavItem>
//                                                                     )}
//                                                             </Nav>
//                                                         </div>
//                                                     </TabPane>
//                                                 </TabContent>
//                                             </div>
//                                             <div style={{ userSelect: 'none' }}>
//                                                 {showCamera ? (
//                                                     <Row lg={12} className='text-center'>
//                                                         <Col sm={6} md={6} lg={6}>
//                                                             <Card>
//                                                                 <CardBody>
//                                                                     {type === 'ML' &&
//                                                                         <>
//                                                                             <CardTitle className='mb-4'>
//                                                                                 <div>
//                                                                                     Capture Image for Reference
//                                                                                 </div>
//                                                                             </CardTitle>
//                                                                         </>
//                                                                     }
//                                                                     {type !== 'ML' &&
//                                                                         <>
//                                                                             <CardTitle className='mb-4'>Capture Image for Training</CardTitle>
//                                                                             <label>
//                                                                                 {showLabelName} component (minimum required image: {reqImgCount})
//                                                                                 No. of Added Images:
//                                                                                 {
//                                                                                     showLabelName === config[0]?.positive ? okCount1 :
//                                                                                         showLabelName === config[0]?.negative ? notokCount1 :
//                                                                                             null
//                                                                                 }
//                                                                             </label>
//                                                                         </>
//                                                                     }
//                                                                     {
//                                                                         position === 'Fixed' &&
//                                                                         <>
//                                                                             <div className='my-3'>
//                                                                                 <Row>
//                                                                                     <Col>
//                                                                                         <Checkbox
//                                                                                             type="checkbox"
//                                                                                             checked={showOutline}
//                                                                                             onChange={() => toggleShowOutline()}
//                                                                                         >Show Outline</Checkbox>
//                                                                                     </Col>
//                                                                                 </Row>
//                                                                             </div>

//                                                                             <Row className='my-2'>
//                                                                                 <Col>
//                                                                                     {
//                                                                                         showOutline &&
//                                                                                         <div className='d-flex my-auto'>
//                                                                                             <Label className='my-auto'>Outline Color : </Label>
//                                                                                             <div className='mx-3 d-flex'>
//                                                                                                 {
//                                                                                                     outlineColors.map((otline, otl_id) => (
//                                                                                                         <Button
//                                                                                                             key={otl_id}
//                                                                                                             className='mx-1'
//                                                                                                             style={{
//                                                                                                                 backgroundColor:
//                                                                                                                     otline === "White Outline" ? 'white' :
//                                                                                                                         otline === "Blue Outline" ? 'blue' :
//                                                                                                                             otline === "Black Outline" ? 'black' :
//                                                                                                                                 otline === "Orange Outline" ? 'orange' :
//                                                                                                                                     otline === "Yellow Outline" ? 'yellow' : 'gray',
//                                                                                                                 boxShadow: defaultOutline === otline && '0px 0px 5px 2px rgba(0, 0, 0, 0.5)',
//                                                                                                                 border: otline === "White Outline" ? 'auto' : 'none'
//                                                                                                             }}
//                                                                                                             outline={defaultOutline !== otline}
//                                                                                                             onClick={() => { newOutlineChange(otline) }}
//                                                                                                         ></Button>
//                                                                                                     ))
//                                                                                                 }
//                                                                                             </div>
//                                                                                         </div>
//                                                                                     }
//                                                                                 </Col>
//                                                                             </Row>
//                                                                         </>
//                                                                     }


//                                                                     {/* Debug Info for Multi-Camera Outline */}
//                                                                     {/* {cameraList.length > 1 && process.env.NODE_ENV === 'development' && (
//                                                                         <div className="mb-2 p-2 bg-light border rounded">
//                                                                             <small>
//                                                                                 <strong>Debug Info:</strong><br/>
//                                                                                 Selected Camera: {selectedCameraLabel}<br/>
//                                                                                 Outline Type: {typeof outlinePath}<br/>
//                                                                                 Current Outline: {getCurrentOutlinePath() ? 'Available' : 'None'}<br/>
//                                                                                 {typeof outlinePath === 'object' && (
//                                                                                     <>Available Cameras: {Object.keys(outlinePath).join(', ')}</>
//                                                                                 )}
//                                                                             </small>
//                                                                         </div>
//                                                                     )} */}

//                                                                     {cameraList.length > 0 && (
//                                                                         <div className="mb-3">
//                                                                             <div className="d-flex gap-2 flex-wrap mb-2">
//                                                                                 {cameraList.map((camera, index) => (

//                                                                                     <Button
//                                                                                         key={index}
//                                                                                         color={selectedCameraLabel === camera.originalLabel ? "primary" : "secondary"}
//                                                                                         size="sm"
//                                                                                         onClick={() => switchCamera(camera.originalLabel)}
//                                                                                         style={{
//                                                                                             minWidth: '90px',
//                                                                                             fontSize: '10px',
//                                                                                             padding: '4px 4px',
//                                                                                             display: 'flex',
//                                                                                             flexDirection: 'column',
//                                                                                             alignItems: 'center'
//                                                                                         }}
//                                                                                     >

//                                                                                         <span style={{ fontWeight: 'bold', color: camera ? '#fafafaff' : '#dc3545' }}>
//                                                                                             {'✅'} {camera.label}
//                                                                                         </span>

//                                                                                     </Button>
//                                                                                 ))}
//                                                                             </div>


//                                                                         </div>
//                                                                     )}


//                                                                     <div className="containerImg">
//                                                                         {!webcamEnabled && <p className="small-text">Camera is not started. Please wait...</p>}
//                                                                         {webcamEnabled && (
//                                                                             cameraDisconnected ?
//                                                                                 <div className='my-2' style={{ outline: '2px solid #000', padding: '10px', borderRadius: '5px', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
//                                                                                     <div className='d-flex flex-column justify-content-center align-items-center webcam-disconnected' style={{ width: '100%' }}>
//                                                                                         <h5 style={{ fontWeight: 'bold' }}>Webcam Disconnected</h5>
//                                                                                         <Spinner className='mt-2' color="primary" />
//                                                                                         <h6 className='mt-2' style={{ fontWeight: 'bold' }}>Please check your webcam connection....</h6>
//                                                                                     </div>
//                                                                                 </div>
//                                                                                 :
//                                                                                 <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
//                                                                                     {
//                                                                                         console.log('=== OUTLINE RENDER CHECK ===')
//                                                                                     }
//                                                                                     {
//                                                                                         console.log('showOutline:', showOutline)
//                                                                                     }
//                                                                                     {
//                                                                                         console.log('outlinePath:', outlinePath)
//                                                                                     }
//                                                                                     {
//                                                                                         console.log('selectedCameraLabel:', selectedCameraLabel)
//                                                                                     }
//                                                                                     {
//                                                                                         console.log('getCurrentOutlinePath():', getCurrentOutlinePath())
//                                                                                     }

//                                                                                     {
//                                                                                         showOutline &&
//                                                                                         getCurrentOutlinePath() &&

//                                                                                         <img
//                                                                                             style={{
//                                                                                                 width: '100%',
//                                                                                                 position: 'absolute',
//                                                                                                 height: 'auto',
//                                                                                                 zIndex: '1',
//                                                                                             }}
//                                                                                             src={showImage(getCurrentOutlinePath())}
//                                                                                             alt="Outline overlay"
//                                                                                         />
//                                                                                     }
//                                                                                     <WebcamCapture
//                                                                                         ref={webcamRef}
//                                                                                         resolution={DEFAULT_RESOLUTION}
//                                                                                         zoom={zoomValue?.zoom}
//                                                                                         center={zoomValue?.center}
//                                                                                         cameraLabel={selectedCameraLabel}
//                                                                                     />
//                                                                                 </div>
//                                                                         )}
//                                                                     </div>
//                                                                     <div>
//                                                                         {
//                                                                             addingImage ?
//                                                                                 <Button className="btn btn-sm w-md" color='info' style={{ whiteSpace: 'pre' }} disabled>
//                                                                                     Adding Images...  <Spin spinning={true}></Spin>
//                                                                                 </Button>
//                                                                                 :
//                                                                                 (webcamEnabled && cameraDisconnected === false) &&
//                                                                                 <Button className="btn btn-sm w-md" color='primary' onClick={() => captureImage(labelName)}>Add Image</Button>
//                                                                         }
//                                                                         {
//                                                                             addingTrainImage &&
//                                                                             <Button className="btn btn-sm w-md ms-3" color='info' style={{ whiteSpace: 'pre' }} disabled>
//                                                                                 Adding Train Image...  <Spin spinning={true}></Spin>
//                                                                             </Button>
//                                                                         }
//                                                                     </div>
//                                                                 </CardBody>
//                                                             </Card>
//                                                         </Col>

//                                                         <Col className='scrlHide' sm={6} md={6} lg={6} style={{ boxShadow: '0px 0px 10px grey', borderRadius: '5px', height: '70vh', overflowY: 'auto' }}>
//                                                             {
//                                                                 type === 'DL' &&
//                                                                 <Card className='mt-2' style={{ position: 'relative' }}>
//                                                                     <div style={{ position: 'absolute', zIndex: '2' }}>
//                                                                         {responseMessage && (
//                                                                             <Alert severity={responseMessage === 'Image successfully added' ? 'success' : 'error'}>
//                                                                                 <AlertTitle style={{ fontWeight: 'bold', margin: 'auto' }}>{responseMessage}</AlertTitle>
//                                                                             </Alert>
//                                                                         )}
//                                                                     </div>

//                                                                     {/* Camera-wise Image Display Header */}
//                                                                     <CardBody>
//                                                                         <div className="d-flex justify-content-between align-items-center mb-3">
//                                                                             <h5 className="mb-0" style={{ fontWeight: 'bold', color: '#333' }}>
//                                                                                 Camera Gallery
//                                                                             </h5>
//                                                                             <span className="badge badge-info">
//                                                                                 Active: {selectedCameraLabel || 'No Camera Selected'}
//                                                                             </span>
//                                                                         </div>

//                                                                         {/* Camera Tabs/Filters */}
//                                                                         {cameraList.length > 1 && (
//                                                                             <div className="mb-3">
//                                                                                 <div className="d-flex flex-wrap gap-2">
//                                                                               <Button
//                                                                                         size="sm"
//                                                                                         color={!selectedCameraLabel ? "primary" : "outline-primary"}
//                                                                                         onClick={() => setSelectedCameraLabel(null)}
//                                                                                     >
//                                                                                         All Cameras
//                                                                                     </Button>
//                                                                                     {cameraList.map((camera, index) => (
//                                                                                         <Button
//                                                                                             key={index}
//                                                                                             size="sm"
//                                                                                             color={selectedCameraLabel === camera.originalLabel ? "primary" : "outline-primary"}
//                                                                                             onClick={() => setSelectedCameraLabel(camera.originalLabel)}
//                                                                                         >
//                                                                                             {camera.label}
//                                                                                         </Button>
//                                                                                     ))}
//                                                                                 </div>
//                                                                             </div>
//                                                                         )}

//                                                                         {
//                                                                             imagesLength < 1 ?
//                                                                                 <Row>
//                                                                                     <h5 className='my-3' style={{ fontWeight: 'bold', textAlign: 'center' }}>
//                                                                                         No Images available....
//                                                                                     </h5>
//                                                                                     <br />
//                                                                                     <h6 className='my-3' style={{ fontWeight: 'bold', textAlign: 'center' }}>
//                                                                                         Add Images from the Live Camera...
//                                                                                     </h6>
//                                                                                 </Row>
//                                                                                 :
//                                                                                 renderCameraGallery()  // <- Replace the complex (() => {...})() with this



//                                                                         }

//                                                                         {/* Overall Statistics */}
//                                                                         {imagesLength > 0 && (
//                                                                             <div className="mt-3 p-3" style={{
//                                                                                 backgroundColor: '#e9ecef',
//                                                                                 borderRadius: '5px',
//                                                                                 textAlign: 'center'
//                                                                             }}>
//                                                                                 <div className="d-flex justify-content-between align-items-center">
//                                                                                     <div>
//                                                                                         <strong>Total Images: {imagesLength}</strong>
//                                                                                     </div>
//                                                                                     <div>
//                                                                                         <strong>Selected: {selectedImages.length}</strong>
//                                                                                     </div>
//                                                                                     <Button
//                                                                                         className="btn btn-sm w-sm"
//                                                                                         color='danger'
//                                                                                         onClick={() => handleDeleteSelectedImages()}
//                                                                                         disabled={selectedImages.length === 0}
//                                                                                     >
//                                                                                         Delete Selected ({selectedImages.length})
//                                                                                     </Button>
//                                                                                 </div>
//                                                                             </div>
//                                                                         )}
//                                                                     </CardBody>
//                                                                 </Card>
//                                                             }

//                                                             {/* ML Type Camera Gallery */}
//                                                             {
//                                                                 type === 'ML' &&
//                                                                 (
//                                                                     showTrainImage === true ?
//                                                                         <TrainImages versionData={compModelVerInfo[0]} setVersionData={(e) => setVersionData(e)} />
//                                                                         :
//                                                                         <>
//                                                                             <Row >
//                                                                                 {
//                                                                                     imagesLength < 1 ?
//                                                                                         <Col>
//                                                                                             <h5 className='my-3' style={{ fontWeight: 'bold', textAlign: 'center' }}>
//                                                                                                 No Images Preview available....
//                                                                                             </h5>
//                                                                                             <br />
//                                                                                             <h6 className='my-3' style={{ fontWeight: 'bold', textAlign: 'center' }}>
//                                                                                                 Add Images from the Live Camera...
//                                                                                             </h6>
//                                                                                         </Col> :
//                                                                                         <>
//                                                                                             {/* Camera Selection for ML Type */}
//                                                                                             {cameraList.length > 1 && (
//                                                                                                 <Col sm={12} className="mb-3">
//                                                                                                     <Card style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
//                                                                                                         <CardBody className="p-2">
//                                                                                                             <div className="d-flex justify-content-between align-items-center">
//                                                                                                                 <h6 className="mb-0">Current Camera:</h6>
//                                                                                                                 <span className="badge badge-primary">
//                                                                                                                     {selectedCameraLabel || 'No Camera Selected'}
//                                                                                                                 </span>
//                                                                                                             </div>
//                                                                                                         </CardBody>
//                                                                                                     </Card>
//                                                                                                 </Col>
//                                                                                             )}

//                                                                                             {
//                                                                                                 compModelVerInfo[0]?.model_name !== 'SIFT' &&
//                                                                                                 <Col sm={12} md={12} lg={12} className='d-flex justify-content-end my-2'>
//                                                                                                     <Button
//                                                                                                         className="btn btn-sm w-sm"
//                                                                                                         color='danger'
//                                                                                                         onClick={() => handleDeleteSelectedImages(compModelVerInfo[0].datasets[0].image_path)}
//                                                                                                     >
//                                                                                                         Delete
//                                                                                                     </Button>
//                                                                                                 </Col>
//                                                                                             }

//                                                                                             <Col sm={6} md={6} lg={6}>
//                                                                                                 <Card className='mt-2' style={{
//                                                                                                     position: 'relative',
//                                                                                                     backgroundColor: '#f0f0f0',
//                                                                                                     boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//                                                                                                     border: '2px solid #ddd'
//                                                                                                 }}>
//                                                                                                     <CardTitle className='my-2' style={{
//                                                                                                         color: '#333',
//                                                                                                         borderBottom: '2px solid #ddd',
//                                                                                                         padding: '0.5rem 1rem',
//                                                                                                         display: 'flex',
//                                                                                                         justifyContent: 'space-between',
//                                                                                                         alignItems: 'center'
//                                                                                                     }}>
//                                                                                                         <span>Reference Image</span>
//                                                                                                         {selectedCameraLabel && (
//                                                                                                             <span className="badge badge-info" style={{ fontSize: '10px' }}>
//                                                                                                                 {cameraList.find(cam => cam.originalLabel === selectedCameraLabel)?.label || selectedCameraLabel}
//                                                                                                             </span>
//                                                                                                         )}
//                                                                                                     </CardTitle>
//                                                                                                     <CardBody>
//                                                                                                         <Image
//                                                                                                             src={showImage({
//                                                                                                                 ...compModelVerInfo[0].datasets[0],
//                                                                                                                 image_path: compModelVerInfo[0].datasets[0].image_path
//                                                                                                             })}
//                                                                                                             alt='Image not there'
//                                                                                                         />
//                                                                                                         {compModelVerInfo[0].datasets[0].camera_label && (
//                                                                                                             <div className="mt-2 text-center" style={{ fontSize: '12px', color: '#666' }}>
//                                                                                                                 Captured from: {compModelVerInfo[0].datasets[0].camera_label}
//                                                                                                             </div>
//                                                                                                         )}
//                                                                                                     </CardBody>
//                                                                                                 </Card>
//                                                                                             </Col>
//                                                                                         </>
//                                                                                 }
//                                                                             </Row>
//                                                                         </>
//                                                                 )
//                                                             }
//                                                         </Col>


//                                                     </Row>
//                                                 ) : null}
//                                             </div>

//                                             <div className='storedImages mt-5' style={{ userSelect: 'none' }}>
//                                                 {showGallery && (
//                                                     <Card>
//                                                         <Row>
//                                                             <label style={{ textAlign: 'center' }}>
//                                                                 {showLabelName} component (minimum required image: {reqImgCount})
//                                                                 No. of Added Images:
//                                                                 {
//                                                                     showLabelName === config[0]?.positive ? okCount1 :
//                                                                         showLabelName === config[0]?.negative ? notokCount1 :
//                                                                             null
//                                                                 }
//                                                             </label>

//                                                             <Col className='scrlHide' sm={6} md={6} style={{ border: '1px solid' }}>
//                                                                 <Multiselect
//                                                                     onRemove={(selectedList, selectedItem) => onRemove(selectedList, selectedItem)}
//                                                                     onSelect={(selectedList, selectedItem, index) => onSelectValues(selectedList, selectedItem, index)}
//                                                                     options={diffVal}
//                                                                     displayValue="label"
//                                                                     closeOnSelect={false}
//                                                                     placeholder='select versions...'
//                                                                 />
//                                                                 {
//                                                                     imgGlr?.length > 0 ?
//                                                                         showOtherVersionImages()
//                                                                         : null
//                                                                 }
//                                                             </Col>

//                                                             <Col className='scrlHide' sm={6} md={6} style={{ border: '1px solid' }}>
//                                                                 <Droppable types={['dragdrop']} onDrop={onDrop}>
//                                                                     <div>
//                                                                         <h5 className='ftOtVer'>
//                                                                             Active Version
//                                                                         </h5>
//                                                                     </div>
//                                                                     <Card className='mt-2' style={{ position: 'relative', height: '97vh', overflowY: 'auto', overflowX: 'hidden' }}>
//                                                                         <div style={{ position: 'absolute', zIndex: '2' }}>
//                                                                             {responseMessage && (
//                                                                                 <Alert severity={responseMessage === 'Image successfully added' ? 'success' : 'error'}>
//                                                                                     <AlertTitle style={{ fontWeight: 'bold', margin: 'auto' }}>{responseMessage}</AlertTitle>
//                                                                                 </Alert>
//                                                                             )}
//                                                                         </div>
//                                                                         {
//                                                                             imagesLength < 1 ?
//                                                                                 <Row>
//                                                                                     <h5 className='my-3' style={{ fontWeight: 'bold', textAlign: 'center' }}>
//                                                                                         Images Not Available...
//                                                                                     </h5>
//                                                                                 </Row>
//                                                                                 :
//                                                                                 Object.entries(activeGroupData).map(([version, items], verId) => {
//                                                                                     if (compModelVerInfo[0].model_ver === parseInt(version)) {
//                                                                                         let imgCount = 0;
//                                                                                         return (
//                                                                                             <React.Fragment key={verId}>
//                                                                                                 <div className='d-flex justify-content-between align-items-center'>
//                                                                                                     <div style={{ display: 'flex', alignItems: 'center' }}>
//                                                                                                         <Checkbox
//                                                                                                             style={{
//                                                                                                                 borderColor: 'slategray',
//                                                                                                                 borderWidth: '2px',
//                                                                                                                 borderStyle: 'solid',
//                                                                                                                 borderRadius: '7px',
//                                                                                                                 height: '20px',
//                                                                                                                 width: '20px',
//                                                                                                                 marginRight: '5px',
//                                                                                                             }}
//                                                                                                             checked={selectedImages.length === items.length}
//                                                                                                             onChange={() => {
//                                                                                                                 multiImgDelete(items, labelName);
//                                                                                                             }}
//                                                                                                         />
//                                                                                                         <span>Select All</span>
//                                                                                                     </div>
//                                                                                                     <Button className="btn btn-sm w-sm" color='danger' onClick={() => handleDeleteSelectedImages()}>
//                                                                                                         Delete
//                                                                                                     </Button>
//                                                                                                 </div>
//                                                                                                 <Row key={verId} className='mt-2'>
//                                                                                                     {items.map((item, itemId) => {
//                                                                                                         if (item.imagePathType[0].type === labelName) {
//                                                                                                             const isSelected = selectedImages.includes(item);
//                                                                                                             return (
//                                                                                                                 <Col sm={3} md={3} key={itemId}>
//                                                                                                                     <Card style={{ borderRadius: '7px' }}>
//                                                                                                                         <CardBody style={{ padding: '7px', border: isSelected ? '2px solid red' : '2px solid green', borderRadius: '7px' }}>
//                                                                                                                             <div style={{ fontWeight: 'bold', textAlign: 'left', whiteSpace: 'pre' }}>
//                                                                                                                                 <Checkbox style={{
//                                                                                                                                     borderColor: 'slategray', borderWidth: '2px', borderStyle: 'solid', borderRadius: '7px', height: '20px',
//                                                                                                                                     width: '20px'
//                                                                                                                                 }}
//                                                                                                                                     checked={isSelected}
//                                                                                                                                     onChange={() => handleCheckboxChange(item, version)}
//                                                                                                                                 />
//                                                                                                                                 {'   '}
//                                                                                                                                 {imgCount += 1}
//                                                                                                                             </div>
//                                                                                                                             <Image src={showImage(item.imagePathType[item.used_model_ver.indexOf(parseInt(version))].image_path)} alt='Image not there' />
//                                                                                                                             <div style={{ fontWeight: 'bold', textAlign: 'left' }}>
//                                                                                                                                 Used In : {item.used_model_ver.join(', ')}
//                                                                                                                             </div>
//                                                                                                                             <div style={{ textAlign: 'right' }}>
//                                                                                                                                 <Popconfirm placement="rightBottom" title="Do you want to delete?" onConfirm={() => deleteImageClick(item, compModelVerInfo[0].model_ver, labelName)} okText="Yes">
//                                                                                                                                     <DeleteTwoTone twoToneColor="red" style={{ fontSize: '18px', background: 'white', borderRadius: '5px' }} />
//                                                                                                                                 </Popconfirm>
//                                                                                                                             </div>
//                                                                                                                         </CardBody>
//                                                                                                                     </Card>
//                                                                                                                 </Col>
//                                                                                                             );
//                                                                                                         }
//                                                                                                         return null;
//                                                                                                     })}
//                                                                                                 </Row>
//                                                                                             </React.Fragment>
//                                                                                         )
//                                                                                     }
//                                                                                     return null;
//                                                                                 })
//                                                                         }
//                                                                     </Card>
//                                                                 </Droppable>
//                                                             </Col>
//                                                         </Row>
//                                                     </Card>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     </>
//                             }
//                         </CardBody>
//                     </Card>
//                 </Container>

//                 {/* Modal 4 - select admin testing option */}
//                 {
//                     showTestingOptions ?
//                         <AdminTestingOptions
//                             isOpen={showTestingOptions}
//                             toggle={closeAdminTestOptions}
//                             onContinue={continueAdminTest}
//                             rectangles={compInfo?.rectangles}
//                         />
//                         : null
//                 }

//                 {/* Modal 2 - Log Info */}
//                 <Modal size="xl" isOpen={modalXlarge} toggle={togXlarge} scrollable={true}>
//                     <div className="modal-header">
//                         <h5 className="modal-title mt-0" id="myExtraLargeModalLabel">Version Log</h5>
//                         <Button onClick={() => setModalXlarge(false)} type="button" className="close" data-dismiss="modal" aria-label="Close">
//                             <span aria-hidden="true">&times;</span>
//                         </Button>
//                     </div>
//                     <div className="table-responsive">
//                         <Table striped>
//                             <thead>
//                                 <tr>
//                                     <th>Date and time</th>
//                                     <th>User Info</th>
//                                     <th>Component name</th>
//                                     <th>Component code</th>
//                                     <th>Model Name</th>
//                                     <th>Model version</th>
//                                     <th>Screen Name</th>
//                                     <th>Actions</th>
//                                     <th>Activity</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {logData.map((data, index) => (
//                                     <tr key={index}>
//                                         <td>{data.date_time}</td>
//                                         <td>{data.user_info}</td>
//                                         <td>{data.comp_name}</td>
//                                         <td>{data.comp_code}</td>
//                                         <td>{data.model_name}</td>
//                                         <td>{data.model_version}</td>
//                                         <td>{data.screen_name}</td>
//                                         <td>{data.action}</td>
//                                         <td><JsonTable json={data.report_data[0]} /></td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </Table>
//                     </div>
//                     <div className="modal-footer">
//                         <Button type="button" className="btn btn-secondary" onClick={() => setModalXlarge(false)}>Close</Button>
//                     </div>
//                 </Modal>
//             </div>
//         </>
//     );
// };

// StageModelCreation.propTypes = {
//     // Add any prop validations if needed
// };

// export default StageModelCreation;