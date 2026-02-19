import React, { useState, useEffect, useRef } from 'react';
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

let okCount1;
let notokCount1;

const ModelCreation = () => {
    const history = useHistory();

    // State variables
    const [comp_name, setCompName] = useState('');
    const [comp_code, setCompCode] = useState('');
    const [model_name, setModelName] = useState('');
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
    const [lable_name, setLableName] = useState('');
    const [webcamEnabled, setWebcamEnabled] = useState(false);
    const [imageSrcNone, setImageSrcNone] = useState(false);
    const [showTrainingINProgs, setShowTrainingINProgs] = useState(false);
    const [refersh, setRefersh] = useState(false);
    const [initvalue, setInitvalue] = useState(1);
    const [activeTab, setActiveTab] = useState('1');
    const [customActiveTab, setCustomActiveTab] = useState('');
    const [modal_xlarge, setModalXlarge] = useState(false);
    const [modal_xlarge1, setModalXlarge1] = useState(false);
    const [isImageHidden, setIsImageHidden] = useState({});
    const [log_data, setLogData] = useState([]);
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

    const [images_length, setImagesLength] = useState(0);
    const [selectedImages, setSelectedImages] = useState([]);
    const [img_paths, setImgPaths] = useState([]);
    const [rangeValue, setRangeValue] = useState(0.9);
    const [img_rotation, setImgRotation] = useState(false);
    const [no_of_rotation, setNoOfRotation] = useState(0);
    const [position, setPosition] = useState('');
    const [type, setType] = useState('');

    const [adding_image, setAddingImage] = useState(false);
    const [outline_thres, setOutlineThres] = useState(100);
    const [show_outline, setShowOutline] = useState(false);
    const [capture_fixed_refimage, setCaptureFixedRefimage] = useState(false);

    const [outline_options] = useState([
        { label: "White Outline" },
        { label: "Red Outline" },
        { label: "Green Outline" },
        { label: "Blue Outline" },
        { label: "Black Outline" },
        { label: "Orange Outline" },
        { label: "Yellow Outline" },
    ]);
    const [default_outline, setDefaultOutline] = useState('White Outline');
    const [outline_colors] = useState([
        "White Outline",
        "Blue Outline",
        "Black Outline",
        "Orange Outline",
        "Yellow Outline",
    ]);
    const [outline_path, setOutlinePath] = useState('');

    const [adding_train_image, setAddingTrainImage] = useState(false);
    const [show_train_image, setShowTrainImage] = useState(false);

    // Region drawing sections
    const [region_selection, setRegionSelection] = useState(false);
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

    const [testing_options] = useState([
        { 'option': 0, 'value': 'Entire Component' },
        { 'option': 1, 'value': 'Regions Only' },
        { 'option': 2, 'value': 'Entire Component with Regions' }
    ]);
    const [overall_testing, setOverallTesting] = useState(true);
    const [region_wise_testing, setRegionWiseTesting] = useState(false);
    const [region_testing_required, setRegionTestingRequired] = useState(false);

    const [zoom, setZoom] = useState(1);
    const [isPanning, setIsPanning] = useState(false);
    const [panStartX, setPanStartX] = useState(0);
    const [panStartY, setPanStartY] = useState(0);
    const [canvas_width, setCanvasWidth] = useState(640);
    const [canvas_height, setCanvasHeight] = useState(480);

    const [modelVersionLoading, setModelVersionLoading] = useState(true);
    const [versionCount, setVersionCount] = useState(1);

    const [show_testing_options, setShowTestingOptions] = useState(false);
    const [selected_version, setSelectedVersion] = useState(null);
    const [zoom_value, setZoomValue] = useState({
        zoom: 1,
        center: { x: 0.5, y: 0.5 }
    });
    const [isSharing, setIsSharing] = useState(false);
    const [hasPushedState, setHasPushedState] = useState(false);

    // Additional state variables
    const [comp_info, setCompInfo] = useState(null);
    const [imgGlr, setImgGlr] = useState([]);
    const [response_message, setResponseMessage] = useState('');
    const [webcamLoaded, setWebcamLoaded] = useState(false);

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

    // useEffect for componentDidMount equivalent
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
            if (trainingStatusIntervalRef.current) {
                clearInterval(trainingStatusIntervalRef.current);
            }

            // Remove device change listener
            navigator.mediaDevices.removeEventListener('devicechange', checkWebcam);
            window.removeEventListener("popstate", blockBackNavigation);
        };
    }, []);

    // Helper functions and methods will be added in the next part
    const showRefOutline = async (data1, data2) => {
        // Implementation will be added
    };

    const getModelCreation = async (compModelVInfo) => {
        // Implementation will be added
    };

    const getConfigInfo = async (result_mode) => {
        // Implementation will be added
    };

    const checkWebcam = async () => {
        // Implementation will be added
    };

    const blockBackNavigation = (event) => {
        // Implementation will be added
    };

    const error_handler = (error) => {
        console.error("Error:", error);
        // Add your error handling logic here
    };

    return (
        <>
            <div className='page-content'>
                <MetaTags>
                    <title>Component Information</title>
                </MetaTags>
                <Breadcrumbs
                    title="MODEL CREATION"
                    isBackButtonEnable={!isSharing}
                    gotoBack={() => history.push("/modelVerInfo")}
                />
                <Container fluid>
                    <Card>
                        <CardBody>
                            <Row className="d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-2 mb-2">
                                <Col xs="12" lg="auto" className="text-left">
                                    <CardTitle className="mb-0 "><span className="me-2 font-size-12">Component Name :</span>{comp_name}</CardTitle>
                                    <CardText className="mb-0"><span className="me-2 font-size-12">Component Code :</span>{comp_code}</CardText>
                                    <CardText className="mb-0"><span className="me-2 font-size-12">Model Name:</span>{model_name}</CardText>
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
                                    <div>
                                        {/* Main content will be added here */}
                                        <p>Model Creation Content - To be implemented</p>
                                    </div>
                            }
                        </CardBody>
                    </Card>
                </Container>
            </div>
        </>
    );
};

ModelCreation.propTypes = {
    // Add any prop types if needed
};

export default ModelCreation;
