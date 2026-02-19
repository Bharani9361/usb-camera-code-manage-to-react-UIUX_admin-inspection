import React, { useState, useEffect, useRef, useCallback } from 'react';

import { Link, useHistory, useLocation } from "react-router-dom";
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
// import 'antd/dist/antd.css';
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
// import ImageUrl from './imageUrl'
import { image_url } from './imageUrl';
let ImageUrl = image_url;


let okCount1;
let notokCount1;

const ModelCreation = () => {
    const history = useHistory();
    const location = useLocation();

    // State variables
    const [compName, setCompName] = useState('');
    const [compCode, setCompCode] = useState('');
    const [modelName, setModelName] = useState('');
    const [compModelVerInfo, setCompModelVerInfo] = useState([]);
    const [config, setConfig] = useState([]);
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
    const [lableName, setLableName] = useState('');
    const [webcamEnabled, setWebcamEnabled] = useState(false);
    const [imageSrcNone, setImageSrcNone] = useState(false);
    const [showTrainingINProgs, setShowTrainingINProgs] = useState(false);
    const [refersh, setRefersh] = useState(false);
    const [initvalue, setInitvalue] = useState(1);
    const [activeTab, setActiveTab] = useState('1');
    const [customActiveTab, setCustomActiveTab] = useState('');
    const [modalXlarge, setModalXlarge] = useState(false);
    const [modalXlarge1, setModalXlarge1] = useState(false);
    const [isImageHidden, setIsImageHidden] = useState({});
    const [logData, setLogData] = useState([]);
    const [selected, setSelected] = useState([]);
    const [newGallery, setNewGallery] = useState(false);
    const [checkedValues, setCheckedValues] = useState([]);
    const [selectedList, setSelectedList] = useState([]);
    const [hidVer, setHidVer] = useState([]);
    const [selectedCheckBox, setSelectedCheckBox] = useState([]);
    const [uniqueModelVersions, setUniqueModelVersions] = useState([]);
    const [groupedData, setGroupedData] = useState({});
    const [activeGroupData, setActiveGroupData] = useState({});
    const [showRetrain, setShowRetrain] = useState(false);
    const [addAccTestInProg, setAddAccTestInProg] = useState(false);

    const [imagesLength, setImagesLength] = useState(0);
    const [selectedImages, setSelectedImages] = useState([]);
    const [imgPaths, setImgPaths] = useState([]);
    const [rangeValue, setRangeValue] = useState(0.9);
    const [imgRotation, setImgRotation] = useState(false);
    const [noOfRotation, setNoOfRotation] = useState(0);
    const [position, setPosition] = useState('');
    const [type, setType] = useState('');

    const [addingImage, setAddingImage] = useState(false);
    const [outlineThres, setOutlineThres] = useState(100);
    const [showOutline, setShowOutline] = useState(false);
    const [captureFixedRefimage, setCaptureFixedRefimage] = useState(false);

    const [outlineOptions] = useState([
        { label: "White Outline" },
        { label: "Red Outline" },
        { label: "Green Outline" },
        { label: "Blue Outline" },
        { label: "Black Outline" },
        { label: "Orange Outline" },
        { label: "Yellow Outline" },
    ]);
    const [defaultOutline, setDefaultOutline] = useState('White Outline');
    const [outlineColors] = useState([
        "White Outline",
        "Blue Outline",
        "Black Outline",
        "Orange Outline",
        "Yellow Outline",
    ]);
    const [outlinePath, setOutlinePath] = useState('');

    const [addingTrainImage, setAddingTrainImage] = useState(false);
    const [showTrainImage, setShowTrainImage] = useState(false);

    // Region drawing sections
    const [regionSelection, setRegionSelection] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    const [clearCanvasFlag, setClearCanvasFlag] = useState(false);
    const [cvLoaded, setCvLoaded] = useState(false);
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

    const [testingOptions] = useState([
        { 'option': 0, 'value': 'Entire Component' },
        { 'option': 1, 'value': 'Regions Only' },
        { 'option': 2, 'value': 'Entire Component with Regions' }
    ]);
    const [overallTesting, setOverallTesting] = useState(true);
    const [regionWiseTesting, setRegionWiseTesting] = useState(false);
    const [regionTestingRequired, setRegionTestingRequired] = useState(false);

    const [zoom, setZoom] = useState(1); // Initial zoom level

    const [isPanning, setIsPanning] = useState(false); // State to track if panning is active
    const [panStartX, setPanStartX] = useState(0); // Initial x position when panning starts
    const [panStartY, setPanStartY] = useState(0); // Initial y position when panning starts

    const [canvasWidth, setCanvasWidth] = useState(640); // initial width
    const [canvasHeight, setCanvasHeight] = useState(480); // initial height

    const [modelVersionLoading, setModelVersionLoading] = useState(true);
    const [versionCount, setVersionCount] = useState(1);

    const [showTestingOptions, setShowTestingOptions] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [zoomValue, setZoomValue] = useState({
        zoom: 1,
        center: { x: 0.5, y: 0.5 }
    });
    const [isSharing, setIsSharing] = useState(false);
    const [hasPushedState, setHasPushedState] = useState(false);

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
    const timer = useRef(null);
    const trainingStatusInterval = useRef(null);

    // Error handler function
    const errorHandler = useCallback((error) => {
        sessionStorage.removeItem("authUser");
        history.push("/login");
    }, [history]);

    // Add missing functions that are referenced in useEffect
    const checkWebcam = useCallback(async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
            setWebcamEnabled(videoInputDevices.length > 0);
        } catch (error) {
            console.error('Error checking webcam:', error);
            setWebcamEnabled(false);
        }
    }, []);

    const updateCanvasSize = useCallback(() => {
        // Canvas size update logic would go here
        console.log('Canvas size updated');
    }, []);

    const blockBackNavigation = useCallback((event) => {
        if (isSharing) {
            event.preventDefault();
            event.returnValue = '';
        }
        if (!hasPushedState) {
            window.history.pushState(null, "", window.location.href);
            setHasPushedState(true);
        }
    }, [isSharing, hasPushedState]);

    const fetchTrainingStatus = useCallback(async (versionData) => {
        // Training status fetch logic would go here
        console.log('Fetching training status for:', versionData);
    }, []);

    const showRefOutline = useCallback(async (data1, data2) => {
        try {
            const response = await urlSocket.post('/check_outline', {
                'comp_id': data2.comp_id,
                'model_id': data2.model_id,
            }, { mode: 'no-cors' });
            let getInfo = response.data;
            if (getInfo.error === "Tenant not found") {
                console.log("data error", getInfo.error);
                errorHandler(getInfo.error);
            }
            else {
                if (getInfo.show == 'yes') {
                    setShowOutline(true);
                    setOutlinePath(getInfo.comp_info.datasets.white_path);
                } else if (getInfo.show == 'no') {
                    setCaptureFixedRefimage(true);
                }
            }

        } catch (error) {
            console.error(error);
        }
    }, [errorHandler]);

    const getModelCreation = useCallback(async (compModelVInfo) => {
        try {
            const response = await urlSocket.post('/getCompModel_ver_info', { 'compModelInfo': compModelVInfo }, { mode: 'no-cors' });
            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                errorHandler(response.data.error);
            }
            else {
                let default_thres = rangeValue;
                const compModelVerInfoData = response.data.version_data;

                const myArray = [];
                myArray.push(compModelVerInfoData);
                const show_train_image = compModelVerInfoData?.sift_train_datasets?.length > 0 ? true : false;

                setRegionSelection(response.data.comp_data.region_selection);
                if (compModelVerInfoData.thres === undefined) {
                    setCompModelVerInfo(myArray);
                    setRefersh(true);
                    setShowTrainImage(show_train_image);
                    setRangeValue(default_thres);
                }
                else {
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
                    trainingStatusInterval.current = setInterval(() => fetchTrainingStatus(myArray[0]), 5000);
                }
                imgGlry();
            }
        } catch (error) {
            console.log('error', error)
        }
    }, [rangeValue, errorHandler, fetchTrainingStatus]);

    const imgGlry = useCallback(async () => {
        try {
            const response = await urlSocket.post('/modelImages', { 'compModelInfo': compModelVerInfo[0] }, { mode: 'no-cors' });
            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                errorHandler(response.data.error);
            }
            else {
                const compModelVerInfoData = response.data;
                const allModelVersions = compModelVerInfoData.reduce((acc, item) => {
                    // Combine all used_model_ver arrays into a single array
                    acc.push(...item.used_model_ver);
                    return acc;
                }, []);

                // Use Set to get unique model versions
                const uniqueModelVersionsResult = [...new Set(allModelVersions)].sort();

                const groupedDataResult = compModelVerInfoData.reduce((acc, item) => {
                    item.used_model_ver.forEach((version) => {
                        // Check if the version key exists, if not, create it
                        if (!acc[version]) {
                            acc[version] = [];
                        }
                        // Push the item to the array of that version
                        acc[version].push(item);
                    });

                    return acc;
                }, {});

                setUniqueModelVersions(uniqueModelVersionsResult);
                setGroupedData(groupedDataResult);
                setActiveGroupData(groupedDataResult);
            }
        } catch (error) {
            console.log('error', error)
        }
    }, [compModelVerInfo, errorHandler]);

    const getConfigInfo = useCallback(async (result_mode) => {
        try {
            const response = await urlSocket.post('/config', { mode: 'no-cors' });
            console.log('/config ', response)
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
            console.log('error', error)
        }
    }, [errorHandler]);

    const getOK = useCallback((ok, tabFilter, tab) => {
        let reqImgCount = config[0]?.min_ok_for_training;
        setTabFilter(tabFilter);
        setShowOkButton(true);
        setShowNotokButton(false);
        setShowCamera(false);
        setShowGallery(false);
        setShowLabelName(ok);
        setReqImgCount(reqImgCount);
        setActiveTab(tab);
        setCustomActiveTab('');
    }, [config]);

    const getNotok = useCallback((notok, tabFilter, tab) => {
        let reqImgCount = config[0]?.min_notok_for_training;
        setTabFilter(tabFilter);
        setShowNotokButton(true);
        setShowOkButton(false);
        setShowCamera(false);
        setShowGallery(false);
        setShowLabelName(notok);
        setReqImgCount(reqImgCount);
        setActiveTab(tab);
        setCustomActiveTab('');
    }, [config]);

    // Component mount effect
    useEffect(() => {
        const initializeComponent = async () => {
            const db_info = JSON.parse(localStorage.getItem('db_info'));
            ImageUrl = `${image_url}${db_info?.db_name}/`;
            console.log('()componentDidMount')

            try {
                const zoom_values = JSON.parse(sessionStorage.getItem('zoom_values'));
                if (zoom_values) {
                    setZoomValue(zoom_values);
                }

                let compModelInfo = JSON.parse(sessionStorage.getItem('compModelData'));

                const data = JSON.parse(sessionStorage.getItem('compModelVInfo'));
                const compModelVInfo = data.versionInfo;
                const versionCountData = data.versionCount;

                console.log('versionCount ', versionCountData, compModelVInfo)

                setCompName(compModelInfo.comp_name);
                setCompCode(compModelInfo.comp_code);
                setModelName(compModelInfo.model_name);
                setPosition(compModelInfo.position);
                setType(compModelInfo.type);
                setRefersh(true);
                setVersionCount(versionCountData);

                await getModelCreation(compModelVInfo);
                await getConfigInfo(compModelVInfo.result_mode);

                await showRefOutline(compModelInfo, compModelVInfo);

                // Add device change listener
                navigator.mediaDevices.addEventListener('devicechange', checkWebcam);
                // Initial check
                await checkWebcam();
                window.history.pushState(null, "", window.location.href);
                window.addEventListener("popstate", blockBackNavigation);
            }
            catch (error) {
                console.error('/didmount ', error)
            }
            finally {
                setModelVersionLoading(false);
            }
        };

        initializeComponent();

        // Cleanup function (componentWillUnmount equivalent)
        return () => {
            // Clear the interval to avoid memory leaks
            clearInterval(trainingStatusInterval.current);

            // Remove device change listener
            navigator.mediaDevices.removeEventListener('devicechange', checkWebcam);
            window.removeEventListener("popstate", blockBackNavigation);
        };
    }, [getConfigInfo, getModelCreation, showRefOutline, checkWebcam, blockBackNavigation]);

    return (
        <>
            <div className="page-content">
                <Container fluid={true}>
                    <Breadcrumbs title="Model Creation" breadcrumbItem="Model Creation" />
                    {modelVersionLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                            <Spinner color="primary" />
                            <h5 className="mt-4">
                                <strong>Loading model version...</strong>
                            </h5>
                        </div>
                    ) : (
                        <div>
                            {/* Main content */}
                            <Card>
                                <CardBody>
                                    <CardTitle>Model Creation - {compName}</CardTitle>
                                    <CardText>Component Code: {compCode}</CardText>
                                    <CardText>Model Name: {modelName}</CardText>
                                    <CardText>Type: {type}</CardText>
                                    {/* Add your existing JSX content here */}
                                    <p>This is a basic functional component structure. The full UI implementation would go here.</p>
                                </CardBody>
                            </Card>
                        </div>
                    )}
                </Container>
            </div>
        </>
    );
};

export default ModelCreation;
