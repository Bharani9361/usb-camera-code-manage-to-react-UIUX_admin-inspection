import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Container, CardTitle, Button, Col, Row, Form, Label, Input, Table,
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
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import CountdownTimer from "react-component-countdown-timer";
import Webcam from "react-webcam";
import { Radio } from 'antd';
import Swal from 'sweetalert2';
import PropTypes from "prop-types";
import { sample, set } from 'lodash';
import "./Css/style.css";
import "./Css/profileTest.css"
import Select from 'react-select';
import { rectangle } from 'leaflet';
import { DEFAULT_RESOLUTION } from './cameraConfig';
import WebcamCapture from 'pages/WebcamCustom/WebcamCapture';
import urlSocket from "./urlSocket";
import { image_url } from './imageUrl';
let ImageUrl = image_url;

const StageProfileRatioHandler = (props) => {
    const { history } = props;

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
        "Red Outline",
        "Green Outline",
        "Blue Outline",
        "Black Outline",
        "Orange Outline",
        "Yellow Outline",
    ]);
    const [outline_path, setOutlinePath] = useState('');
    console.log('outline_path', outline_path)
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



    console.log('cameraList', cameraList)
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
    }, []); // Empty dependency for mount/unmount

    // componentDidUpdate for canvas drawing
    // useEffect(() => {
    //     console.log('rectanglesByCamera', rectanglesByCamera);

    //     if (!canvasRef.current || Object.keys(rectanglesByCamera).length === 0) {
    //         return;
    //     }

    //     // Draw rectangles on each camera's canvas
    //     Object.entries(rectanglesByCamera).forEach(([cameraLabel, rectangles]) => {
    //         const canvasEl = canvasRef.current[cameraLabel];

    //         if (!canvasEl || typeof canvasEl.getContext !== 'function') {
    //             console.warn(`Canvas not found for camera: ${cameraLabel}`);
    //             return;
    //         }

    //         const ctx = canvasEl.getContext('2d');
    //         if (!ctx) {
    //             console.error(`Failed to get context for camera: ${cameraLabel}`);
    //             return;
    //         }

    //         // Clear canvas
    //         ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

    //         if (res_img && rectangles && rectangles.length > 0) {
    //             rectangles.forEach((rect, index) => {
    //                 // Draw rectangle
    //                 ctx.lineWidth = 2;
    //                 ctx.strokeStyle = rect.colour;
    //                 ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

    //                 // Draw region name
    //                 const textPosX = rect.x + 10;
    //                 const textPosY = rect.y + 15;

    //                 ctx.font = 'bold 14px Arial';
    //                 ctx.lineWidth = 3;
    //                 ctx.strokeStyle = 'black';
    //                 ctx.strokeText(rect.name, textPosX, textPosY);
    //                 ctx.fillStyle = 'white';
    //                 ctx.fillText(rect.name, textPosX, textPosY);

    //                 // Draw result and value
    //                 const resultText = `${rect.result} (${rect.value})`;
    //                 const resultPosY = rect.y + rect.height - 10;
    //                 ctx.strokeText(resultText, textPosX, resultPosY);
    //                 ctx.fillStyle = rect.colour;
    //                 ctx.fillText(resultText, textPosX, resultPosY);
    //             });
    //         }
    //     });

    // }, [res_img, rectanglesByCamera]); // Updated dependencies
    useEffect(() => {
        console.log('rectanglesByCamera', rectanglesByCamera);

        if (!canvasRef.current) {
            return;
        }

        // If we have rectangles by camera, draw them
        if (Object.keys(rectanglesByCamera).length > 0) {
            Object.entries(rectanglesByCamera).forEach(([cameraLabel, rectangles]) => {
                const canvasEl = canvasRef.current[cameraLabel];
                console.log('canvasEl', canvasEl)

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
            });
        } else {
            // Clear all canvases if no rectangles
            Object.values(canvasRef.current).forEach((canvasEl) => {
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
    const getReferenceImageForCamera = useCallback((cameraLabel, modelVer, refImage) => {
        console.log('cameraLabel, modelVer', cameraLabel, modelVer, refImage);

        if (!refImage || !Array.isArray(refImage)) return "";

        // Normalize label for consistent comparison
        const normalizedLabel = cameraLabel?.trim().toLowerCase().replace(/\s+/g, "_");

        // Filter all matching entries
        const matchingEntries = refImage.filter(item =>
            item?.position?.trim().toLowerCase().replace(/\s+/g, "_") === normalizedLabel &&
            item?.model_ver === modelVer
        );

        console.log('matchingEntries', matchingEntries);

        if (matchingEntries.length === 0) {
            console.log(`No image found for ${cameraLabel} with model_ver ${modelVer}`);
            return "";
        }

        // Return the first matching entry (since they're duplicates)
        const cameraEntry = matchingEntries[0];
        console.log('cameraEntry (first match)', cameraEntry);

        return showImage(cameraEntry.image_path);
    }, []);




    const getCurrentOutlinePath = (cameraOriginalLabel) => {
        console.log('outline_pathoutline_pathoutline_path', outline_path)
        if (!outline_path) {
            return null;
        }

        // For single camera mode, outline_path is a string
        if (typeof outline_path === 'string') {
            return outline_path;
        }

        // For multi-camera mode, outline_path is an object with camera keys
        if (typeof outline_path === 'object' && cameraOriginalLabel) {
            const selectedCamera = cameraList.find(cam => cam.originalLabel === cameraOriginalLabel);
            console.log('Selected camera for outline:', selectedCamera);

            if (selectedCamera) {
                const possibleKeys = [
                    selectedCamera.label.trim().toLowerCase().replace(/\s+/g, "_"),
                    selectedCamera.label.trim().toLowerCase().replace(/\s+/g, "_").replace(/#/g, "_"),
                    selectedCamera.originalLabel?.trim().toLowerCase().replace(/\s+/g, "_"),
                    selectedCamera.originalLabel?.trim().toLowerCase().replace(/\s+/g, "_").replace(/#/g, "_"),
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

    const handleSampleCountChange = (value) => {
        setSampleCount(value);
    };

    const handleManualAuto = (e) => {
        setInspectionType(e.target.value);
    };

    const handleTimerChange = (value) => {
        setTimerValue(value);
    };

    const showOutline = () => {
        setShowOutline(prev => !prev);
    };



    const newOutlineChange = (ot_label) => {
        setDefaultOutline(ot_label);
        const { comp_info: compInfo } = { comp_info };
        console.log('compInfo', compInfo) // Destructure from state if needed
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
    const fetchData = async () => {
        const db_info = JSON.parse(localStorage.getItem('db_info'));
        ImageUrl = `${image_url}${db_info?.db_name}/`;
        const zoom_values = JSON.parse(sessionStorage.getItem('zoom_values'));
        if (zoom_values) {
            setZoomValue(zoom_values);
        }
        let sessionData = JSON.parse(sessionStorage.getItem("computeProfData"));
        console.log('sessionData', sessionData)
        let choosenProf = sessionData.current_profile;
        console.log('choosenProf', choosenProf)
        setBatchId(choosenProf.batch_id || '');
        let component_data_ = sessionData.current_comp_info;
        let res_data = await getRefImage(choosenProf);

        setRegionSelection(choosenProf.region_selection);
        setPageInfo(choosenProf.page_info);
        let initialData = {
            choosen_prof: choosenProf,
            // ref_img_path: res_data.path,
            config: res_data.config_data,
            page_info: choosenProf.page_info,
            component_data: component_data_
        };
        const getstagename = choosenProf?.stage_profiles || {};
        console.log('getstagename', getstagename)
        // const stageName = Object.keys(getstagename)?.[0] || '';
        // console.log('stageName', stageName)
        // setStageName(stageName);
        const stageNames = Object.keys(getstagename) || [];
        console.log('stageNames', stageNames);
        setStageName(stageNames);


        // const stageProfiles = choosenProf?.stage_profiles?.[stageName] || {};
        // console.log('stageProfiles', stageProfiles)

        // const cameras = Object.keys(stageProfiles).map(label => {
        //     const cam = stageProfiles[label] || {};
        //     const firstModel = Array.isArray(cam.ng_model_data) ? cam.ng_model_data[0] : cam.ok_model_data[0];
        //     console.log('camcam', cam)

        //     return {
        //         label: cam.label || label,
        //         model_ver: firstModel.model_ver,
        //         originalLabel: cam.originalLabel || '',
        //         p_id: cam.p_id || '',
        //         port: cam.port || '',
        //         v_id: cam.v_id || '',
        //         value: cam.value || ''
        //     };
        // });

        // console.log('cameraList', cameras);
        // setCameraList(cameras);


        const allCameras = Object.entries(getstagename).flatMap(([stageName, stageProfiles]) => {
            return Object.keys(stageProfiles).map(label => {
                const cam = stageProfiles[label] || {};
                console.log('cam483', cam)
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
            });
        });

        console.log('allCameras', allCameras);
        setCameraList(allCameras);


        let count_value = await getCountBeforeRefresh(choosenProf);
        showRefOutline(choosenProf);
        // if (count_value !== '') {
        //     initialData.ok_count = count_value[0].ok;
        //     initialData.ng_count = count_value[0].notok;
        //     initialData.t_count = count_value[0].total;
        //     initialData.obj_count = count_value[0].total;
        // }
        setChoosenProf(initialData.choosen_prof);
        // // setRefImgPath(initialData.ref_img_path);
        // setConfig(initialData.config);
        // setPageInfo(initialData.page_info);
        // setComponentData(initialData.component_data);
        // setOkCount(initialData.ok_count || 0);
        // setNgCount(initialData.ng_count || 0);
        // setTCount(initialData.t_count || 0);
        // setObjCount(initialData.obj_count || 0);
        console.log('data91 ', choosenProf, choosenProf?.qrbar_check, choosenProf?.qrbar_value);
        if (choosenProf?.qrbar_check === true) {
            setQrbarShowStart(true);
            setQrbar(true);
        } else {
            setShowStart(true);
        }
        // Add device change listener
        navigator.mediaDevices.addEventListener('devicechange', checkWebcam);
        // Initial check
        checkWebcam();
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);
        window.history.pushState(null, null, window.location.pathname); // Reset the history state
    };

    // getRefImage function
    const getRefImage = async (choosenProf) => {
        console.log('62choosen_prof : ', choosenProf);
        try {
            const response = await urlSocket.post('/api/stage/getProfRefImage_stg', {
                'prof_data': choosenProf
            }, { mode: 'no-cors' });
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
    const getCountBeforeRefresh = async (prof_value) => {
        console.log('prof_value.batch_id', prof_value.batch_id);
        try {
            const availCount = await urlSocket.post('/api/stage/refresh_profile_test_stg',
                { 'batch_id': prof_value.batch_id },
                { mode: 'no-cors' });
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
    const showRefOutline = async (ver_data) => {
        console.log('data153 ', ver_data);
        try {
            const response = await urlSocket.post('/api/stage/profilecheck_outline_stg', {
                'comp_id': ver_data.comp_id,
                'position': ver_data.position,
                'ver_data': ver_data
            }, { mode: 'no-cors' });
            let getInfo = response.data;
            console.log('data131 ', getInfo);
            if (getInfo.show == 'yes') {
                console.log('22222', getInfo.comp_info[0].datasets)
                setShowOutline(true);
                setOutlineCheckbox(true);
                setCompInfo(getInfo.comp_info[0]);
                // setOutlinePath(getInfo.comp_info[0].datasets);
                const allDatasets = Object.assign(
                    {},
                    ...getInfo.comp_info.map(item => item.datasets)
                );
                console.log('allDatasets', allDatasets)

                setOutlinePath(allDatasets);

            } else if (getInfo.show == 'no') {
                setCaptureFixedRefimage(true);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // getImage function
    const getImage = (image_path) => {
        let result = image_path.replaceAll("\\", "/");
        let output = ImageUrl + result;
        return output;
    };

    // showImage function
    const showImage = (output_img) => {
        let imgurl = ImageUrl;
        const parts = output_img.split("/");
        const newPath = parts.slice(1).join("/");
        let startIndex;
        if (newPath.includes("Datasets/")) {
            startIndex = newPath.indexOf("Datasets/");
        } else {
            startIndex = newPath.indexOf("receive/");
        }
        const relativePath = newPath.substring(startIndex);
        console.log('output_img : ', imgurl + relativePath);
        return `${imgurl + relativePath}`;
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


    const objectDetectionOnly = async () => {
        console.log("📸 Starting Multi-Camera Object Detection", config);

        const {
            choosen_prof: choosenProf,
            // config: config,
            obj_count: objCount,
            sample_count: sampleCount,
            ok_count: okCount,
            ng_count: ngCount,
            t_count: tCount,
        } = { choosen_prof, obj_count, sample_count, ok_count, ng_count, t_count };

        setResImg(false);
        setRectangles([]);
        setOutputRect(false);
        setResMessage({});
        setRectanglesByCamera({})
        console.log("🔍 Region Selection:", choosen_prof);

        if (sampleCount === null || sampleCount === undefined) {
            Swal.fire({
                icon: "info",
                title: "No. of Test Samples Required",
                confirmButtonText: "OK",
            });
            return;
        }

        if (sampleCount <= 0) {
            Swal.fire({
                icon: "info",
                title: "The number of test samples must be greater than zero.",
                confirmButtonText: "OK",
            });
            return;
        }

        try {

            const capturedImages = [];

            for (const cam of cameraList) {
                console.log('cam', cam)
                const labelName = cam.label;
                const version = cam.model_ver;
                const stagename = cam.stageName;
                const stagecode = cam.stage_code;
                const stage_id = cam.stage_id;
                const originalLabel = cam.originalLabel;
                const webcamInstance = webcamRef.current?.[originalLabel];
                console.log('webcamInstance', webcamInstance)

                if (!webcamInstance || !webcamInstance.captureZoomedImage) {
                    console.warn(`⚠️ Webcam not ready for ${labelName}`);
                    continue;
                }

                const imageSrc = await webcamInstance.captureZoomedImage();
                if (!imageSrc) {
                    console.warn(`⚠️ Failed to capture from ${labelName}`);
                    continue;
                }

                const blob = await fetch(imageSrc).then((r) => r.blob());
                capturedImages.push({
                    label: labelName,
                    version: version,
                    stageName: stagename,
                    stagecode: stagecode,
                    stage_id: stage_id,
                    blob,
                    filename: `${labelName}_${Date.now()}.png`,
                });
                console.log('capturedImages', capturedImages)
            }

            if (capturedImages.length === 0) {
                console.log("❌ No cameras captured images.");
                return;
            }

            setResImg(capturedImages[0].blob);
            // setPlaceobjCount((prev) => prev + 1);
            // placeobj_count += 1;

            setShow(false);
            setMsg(false);
            setShowNext(false);
            setShowplaceobject(false);
            setShowresult(false);
            setShowstatus(false);
            setSetValues(true);
            setShowStart(false);


            const formData = new FormData();
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, "0");
            const dd = String(today.getDate()).padStart(2, "0");
            const _today = `${dd}/${mm}/${yyyy}`;
            const test_date = `${yyyy}-${mm}-${dd}`;
            const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
            const milliseconds = `${time}.${today.getMilliseconds().toString().padStart(3, "0")}`;

            formData.append("comp_name", choosenProf.comp_name);
            formData.append("comp_code", choosenProf.comp_code);
            formData.append("comp_id", choosenProf.comp_id);
            formData.append("obj_detect", choosenProf.detect_selection);
            formData.append("detect_type", config.detection_type);
            formData.append("positive", config.positive);
            formData.append("negative", config.negative);
            formData.append("posble_match", config.posble_match);
            // formData.append("station_name", station_name);
            // formData.append("station_id", station_id);
            formData.append("inspected_ondate", test_date);
            formData.append("date", _today);
            formData.append("time", time);
            formData.append("milliseconds", milliseconds);
            formData.append("batch_id", choosenProf.batch_id);
            formData.append("prof_data", JSON.stringify(choosenProf.stage_profiles));
            // formData.append("our_rectangles", JSON.stringify(component_data.rectangles));
            // formData.append("qrbar_result", qrbar_result);

            capturedImages.forEach((img, idx) => {
                formData.append(`datasets[${idx}]`, img.blob, img.filename);
                formData.append(`camera_labels[${idx}]`, img.label);
                formData.append(`model_versions[${idx}]`, img.version);
                formData.append(`stage_names[${idx}]`, img.stageName);
                formData.append(`stage_codes[${idx}]`, img.stagecode);
                formData.append(`stage_ids[${idx}]`, img.stage_id);
            });

            // for (let [key, value] of formData.entries()) {
            //     if (value instanceof Blob) {
            //         console.log(`${key}: [Blob] filename=${value.name}, size=${value.size}`);
            //     } else {
            //         console.log(`${key}:`, value);
            //     }
            // }

            // -----------------------
            const response = await urlSocket.post("/api/stage/obj_detection_profile_multi", formData, {
                headers: { "content-type": "multipart/form-data" },
                mode: "no-cors",
            });

            console.log("🟢 obj_detection_profile Response:", response.data);
            const resultsByCamera = {};
            response.data.detection_result.forEach(item => {
                resultsByCamera[item.camera_label] = item.detection_result;
            });
            console.log('resultsByCamera', resultsByCamera)
            setResMessage(resultsByCamera);
            setShowstatus(true);
            setCompFound(resultsByCamera === "Object Detected" ? 2 : 1);
            const capturedImagesData = response.data.captured_image || [];
            const detectionResults = response.data.detection_result || [];
            const updatedRectanglesList = response.data?.updated_rectangles || [];
            console.log('updatedRectanglesList', updatedRectanglesList);

            const hasNoObject = detectionResults.some(item => item.detection_result === 'No Object Detected');
            const hasIncorrectObject = detectionResults.some(item => item.detection_result === 'Incorrect Object');
            const hasObjectDetected = detectionResults.some(item => item.detection_result === 'Object Detected');


            await new Promise((resolve) => setTimeout(resolve, 1500));


            if (hasObjectDetected && !hasNoObject && !hasIncorrectObject) {
                // setResMessage("Checking ...");
                setResMessage(prev => {
                    const updated = { ...prev };
                    // For all cameras currently in detection_results
                    detectionResults.forEach(item => {
                        updated[item.camera_label] = "Checking ...";
                    });
                    return updated;
                });
                setShowstatus(true);
                let ratio_data_;
                let show_ratio = false;
                console.log('choosenProf', choosenProf)

                const detection = await urlSocket.post(
                    "/api/stage/overall_result_profile_stg",
                    {
                        comp_id: choosenProf.comp_id,
                        comp_name: choosenProf.comp_name,
                        comp_code: choosenProf.comp_code,
                        batch_id: choosenProf.batch_id,
                        captured_image: capturedImagesData,
                        insp_result_id: response?.data?._id,
                        start_time_with_milliseconds: response?.data?.start_time_with_milliseconds,
                        positive: config.positive,
                        negative: config.negative,
                        posble_match: config.posble_match,
                        choosen_prof: JSON.stringify(choosenProf.stage_profiles),
                        region_selection: region_selection,
                        updated_rectangles: updatedRectanglesList,
                    },
                    { mode: "no-cors" }
                );

                console.log("🧩 overall_result_profile Response:", detection.data);


                setShowstatus(false);
                setCompFound(2);

                if (choosenProf?.qrbar_check === true) setQrbarShowStart(true);
                else setShowStart(true);
                const cameraResults = {};
                const cameraValues = {};

                detection.data.forEach((cameraResult) => {
                    // const cameraLabel = cameraResult.camera_label;
                    const cameraLabel = cameraResult.camera_label.charAt(0).toUpperCase() + cameraResult.camera_label.slice(1);

                    console.log('cameraLabel', cameraLabel)
                    const status = cameraResult.status; // "OK" or "NG"
                    console.log('status', status)

                    // Store result message per camera
                    if (status === "OK") {
                        cameraResults[cameraLabel] = config[0].positive;
                    } else if (status === "NG") {
                        cameraResults[cameraLabel] = config[0].negative;
                    }

                    // Store the highest confidence value for this camera
                    const maxValue = Math.max(...cameraResult.region_results.map(r => r.value));
                    console.log('maxValue', maxValue)
                    cameraValues[cameraLabel] = maxValue;
                });

                console.log('Per-camera results:', cameraResults);
                console.log('Per-camera values:', cameraValues);

                // const testing_result = detection.data[0].status;
                // Instead of just checking detection.data[0].status
                const allCameraStatuses = detection.data.map(cam => cam.status);
                const overallStatus = allCameraStatuses.every(status => status === "OK") ? "OK" : "NG";
                const testing_result = overallStatus;

                console.log('All camera statuses:', allCameraStatuses);
                console.log('Overall testing result:', testing_result);

                // if (region_selection) {
                const originalWidth = 640;
                const originalHeight = 480;
                const targetWidth = DEFAULT_RESOLUTION.width;
                const targetHeight = DEFAULT_RESOLUTION.height;

                const scaleX = targetWidth / originalWidth;
                const scaleY = targetHeight / originalHeight;



                // In your objectDetectionOnly function, before setting state:
                const rectanglesByCam = {};

                detection.data.forEach((cameraResult) => {
                    // const backendLabel = cameraResult.camera_label;
                    const backendLabel = cameraResult.camera_label.charAt(0).toUpperCase() + cameraResult.camera_label.slice(1);
                    console.log('backendLabel', backendLabel, cameraResult)

                    // Find matching camera in your cameraList
                    const matchingCamera = cameraList.find(cam =>
                        cam.label === backendLabel &&
                        cam.stageName === cameraResult.stage_name
                    );
                    console.log('matchingCamera', matchingCamera)

                    if (!matchingCamera) {
                        console.warn(`⚠️ No matching camera found for ${backendLabel}`);
                        return;
                    }

                    // const frontendLabel = matchingCamera.originalLabel; // Use this for canvas
                    const frontendLabel = matchingCamera.label;
                    console.log('frontendLabel', frontendLabel)

                    const retrievedRectangles = cameraResult.region_results.map((rect) => ({
                        x: rect.rectangles.coordinates.x / scaleX,
                        y: rect.rectangles.coordinates.y / scaleY,
                        height: rect.rectangles.coordinates.height / scaleY,
                        width: rect.rectangles.coordinates.width / scaleX,
                        id: rect.rectangles.id,
                        name: rect.rectangles.name,
                        colour: rect.result === "OK" ? "green" : "red",
                        result: rect.result,
                        value: rect.value
                    }));
                    console.log('retrievedRectangles', retrievedRectangles)

                    rectanglesByCam[frontendLabel] = retrievedRectangles; // Use frontendLabel as key
                    console.log(`Mapped ${backendLabel} → ${frontendLabel}`);
                });

                console.log('rectanglesByCamee', rectanglesByCam);
                setRectanglesByCamera(rectanglesByCam);
                setResMessage(cameraResults); // Per-camera results
                setResponseValue(cameraValues); // Per-camera values
                setOutputRect(true);
                setShowresult(true);
                setResultKey(true);
                // }

                // ✅ Update OK/NG counters and ratio
                const nextCount = (objCount ?? 0) + 1;
                console.log('nextCount', nextCount)
                const reachedSampleTarget = Number.isFinite(sampleCount) && nextCount >= sampleCount;
                console.log('reachedSampleTarget', reachedSampleTarget)
                if (reachedSampleTarget) {
                    show_ratio = true;

                    const test_opt_response = await urlSocket.post(
                        "/api/stage/test_opt",
                        {
                            batch_id: choosenProf.batch_id,
                            profile_id: choosenProf._id,
                        },
                        { mode: "no-cors" }
                    );
                    ratio_data_ = test_opt_response.data;
                    console.log("📊 test_opt Response:", ratio_data_);
                }


                if (testing_result === "OK") {
                    let updated_ok = okCount + 1;
                    let updated_total = updated_ok + ngCount;
                    setResponseMessage(config.positive);
                    setResponseValue(detection.data[0].value);
                    setShowresult(true);
                    setResultKey(true);
                    setObjCount(objCount + 1);
                    setShowRatio(show_ratio);
                    setRatioData(ratio_data_);
                    setCompResult(2);
                    setOkCount(updated_ok);
                    setTCount(updated_total);
                } else if (testing_result === "NG") {
                    let updated_ng = ngCount + 1;
                    let updated_total = okCount + updated_ng;
                    setResponseMessage(config.negative);
                    setResponseValue(detection.data[0].value);
                    setShowresult(true);
                    setResultKey(true);
                    setObjCount(objCount + 1);
                    setShowRatio(show_ratio);
                    setRatioData(ratio_data_);
                    setCompResult(1);
                    setNgCount(updated_ng);
                    setTCount(updated_total);
                }
                // } else {
                //     // Not yet at target → do NOT call test_opt, and hide ratio UI
                //     setShowRatio(false);

                //     if (testing_result === "OK") {
                //         let updated_ok = okCount + 1;
                //         let updated_total = updated_ok + ngCount;
                //         setResponseMessage(config.positive);
                //         setResponseValue(detection.data[0].value);
                //         setShowresult(true);
                //         setResultKey(true);
                //         setObjCount(objCount + 1);
                //         setShowRatio(true);
                //         setRatioData(ratio_data_);
                //         setCompResult(2);
                //         setOkCount(updated_ok);
                //         setTCount(updated_total);
                //     } else if (testing_result === "NG") {
                //         let updated_ng = ngCount + 1;
                //         let updated_total = okCount + updated_ng;
                //         setResponseMessage(config.negative);
                //         setResponseValue(detection.data[0].value);
                //         setShowresult(true);
                //         setResultKey(true);
                //         setObjCount(objCount + 1);
                //         setShowRatio(true);
                //         setRatioData(ratio_data_);
                //         setCompResult(1);
                //         setNgCount(updated_ng);
                //         setTCount(updated_total);
                //     }
                // }

            } else {
                setShowStart(choosenProf?.qrbar_check === true ? false : true);
                setQrbarShowStart(choosenProf?.qrbar_check === true ? true : false);
            }
        } catch (error) {
            console.error("❌ objectDetectionOnly Error:", error);
        }
    };


    // find_qrbarcode function
    const find_qrbarcode = async () => {
        const { choosen_prof: choosenProf } = { choosen_prof };
        const { compData, inspection_type: inspectionType } = { compData: component_data, inspection_type };
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
        const blob = await fetch(imageSrc).then((res) => res.blob());
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
        let milliseconds = hours + ':' + min + ':' + secc + '.' + today.getMilliseconds().toString().padStart(3, '0').slice(0, 5);
        let replace = _today + '_' + time.replaceAll(":", "_");
        let compdata = component_name + "_" + component_code + '_' + replace;
        formData.append('comp_id', choosenProf.comp_id);
        formData.append('datasets', blob, compdata + '.png');
        try {
            const response = await urlSocket.post("/barcode_compare", formData, {
                headers: {
                    "content-type": "multipart/form-data",
                },
                mode: "no-cors",
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
                if ((choosenProf.qrbar_check_type === null) || (choosenProf.qrbar_check_type === undefined)
                    || (parseInt(choosenProf.qrbar_check_type) === 1)) {
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
    const object_detected = async (event) => {
        const { resultKey, compData } = { resultKey: result_key, compData: component_data };
        setPlaceobjCount(prev => prev + 1); // to hide the Result at the starting
        // clearInterval(intervalId) - assuming intervalId is managed elsewhere
        setShow(false);
        setMsg(false);
        setShowNext(false);
        setShowplaceobject(false);
        setShowresult(false);
        setShowstatus(false);
        const imageSrc = await webcamRef.current.captureZoomedImage();
        const blob = await fetch(imageSrc).then((res) => res.blob());
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
        let milliseconds = hours + ':' + min + ':' + secc + '.' + today.getMilliseconds().toString().padStart(3, '0').slice(0, 5);
        console.log('time', time);
        let replace = _today + '_' + time.replaceAll(":", "_");
        let compdata = component_name + "_" + component_code + '_' + replace;
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
            setCompFound(response.data[0].detection_result === "Object Detected" ? 2 : 1);
            setTimeout(() => {
                if (response.data[0].detection_result === "Object Detected") {
                    let Checking = "Checking ...";
                    setResMessage(Checking);
                    setShowstatus(true);
                    // after object detection
                    urlSocket.post('/inspectionResult',
                        {
                            'comp_name': component_name,
                            "comp_code": component_code,
                            "batch_id": batch_id, // Assuming batch_id
                            "captured_image": response.data[0].captured_image,
                            "insp_result_id": response.data[0].insp_result_id,
                            "start_time_with_milliseconds": response.data[0].start_time_with_milliseconds,
                            "positive": positive, // Assuming positive from state
                            "negative": negative, // Assuming negative from state
                            "posble_match": posble_match, // Assuming posble_match from state
                        },
                        { mode: 'no-cors' })
                        .then((detection) => {
                            setShowstatus(false);
                            setCompFound(2);
                            if (compBarcode) {
                                setShowNext(true);
                                setShow(true);
                            }
                            let testing_result = detection.data[0].status;
                            console.log('response >>> ', response);
                            console.log('testing_result', testing_result);
                            if (testing_result === positive) { // Assuming positive
                                let positive_ = testing_result.replaceAll(testing_result, config_positive); // Assuming config_positive
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
                            } else if (testing_result === negative) { // Assuming negative
                                console.log('response.data.value <<< >>> ', response.data.value);
                                let negative_ = testing_result.replaceAll(testing_result, config_negative); // Assuming config_negative
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
                            } else if (testing_result === posble_match) { // Assuming posble_match
                                let posble_match_ = testing_result.replaceAll(testing_result, config_posble_match); // Assuming config_posble_match
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
        const { page_info: pageInfo, choosen_prof: choosenProf } = { page_info, choosen_prof };
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
        }).then((result) => {
            if (result.isConfirmed) {
                console.log('Testing process aborted');
                urlSocket.post('/abortProfileTest',
                    {
                        'batch_id': batch_id,
                    },
                    { mode: 'no-cors' })
                    .then(async (abortdata) => {
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
        const { page_info: pageInfo, choosen_prof: choosenProf } = { page_info, choosen_prof };
        console.log('page_info, choosen_prof ', page_info, choosen_prof)
        try {
            const response = await urlSocket.post('/getCompUpdatedProfile', { 'comp_id': choosenProf.comp_id }, { mode: 'no-cors' });
            console.log('628response', response, choosenProf);
            let updateChoosenProf = {};
            if (response.data.length > 0) {
                let profileData = response.data.filter(data_ => data_._id === choosenProf._id);
                console.log('profileData634', profileData);
                updateChoosenProf.profData = response.data;
            }
            console.log('636updateChoosenProf', updateChoosenProf);
            sessionStorage.setItem("updatedProfile", JSON.stringify(updateChoosenProf));
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



    // handleBeforeUnload function
    const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = '';
        const message = 'Are you sure you want to leave?';
        return message;
    };

    // handlePopState function
    const handlePopState = (e) => {
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
            index === self.findIndex((c) =>
                c.stageName === cam.stageName && c.originalLabel === cam.originalLabel
            )
    );
    console.log('uniqueCameras', uniqueCameras)

    const handleStartClick = () => {
        if (show_start) {
            objectDetectionOnly();
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
            return placeobj_count > 0 ? 'Place the next object and press' : 'Place the object and press';
        } else if (qrbar_show_start) {
            return placeobj_count > 0 ? 'Place QR/Barcode and press' : 'Place QR/Barcode and press';
        }
        return 'Place the object and press';
    };

    // Check if we should show the start button
    const shouldShowStartButton = inspection_type === "Manual" &&
        (show_start || qrbar_show_start || showplaceobject || show_next);


    const generateStageColors = (cameras) => {
        const stages = [...new Set(cameras.map(cam => cam.stageName || "Unknown"))];
        const colors = [
            "#e91e63", // Pink
            "#4caf50", // Green


            "#cddc39", // Lime

            "#9c27b0", // Purple
            "#3f51b5", // Indigo

            "#ff9800", // Orange
            "#2196f3", // Blue
            "#f44336", // Red
            "#00bcd4", // Cyan
            "#ff5722", // Deep Orange
            "#673ab7", // Deep Purple
            "#009688", // Teal

            "#ffc107", // Amber
            "#8bc34a", // Light Green
            "#795548", // Brown
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
    const getStageColor = (stageName) => {
        return stageColors[stageName] || "#1976d2";
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
        const stage = camera.stageName || "Unknown";
        if (!acc[stage]) {
            acc[stage] = [];
        }
        acc[stage].push(camera);
        return acc;
    }, {});


    return (
        <div className='page-content'>
            <Row className="mb-3">
                <Col xs={9}>
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="mb-0 mt-2 m-2 font-size-14 fw-bold">PROFILE TESTING</div>
                    </div>
                </Col>
                <Col xs={3} className='d-flex align-items-center justify-content-end'>
                    <button className='btn btn-primary btn-sm me-2 w-md' color="primary" onClick={abort}>ABORT</button>
                </Col>
            </Row>
            {
                console.log('stageName', stageName)
            }
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
                                        <td>
                                            {stageName.join(", ")}
                                        </td>

                                        <td>{choosen_prof.profile_name}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        )}

                        <Row>
                            <div className="ms-3 d-flex align-items-start justify-content-start">
                                <div>
                                    <p style={{ fontWeight: 'bold' }} className="me-3">No. of Test Samples :</p>
                                    <InputNumber
                                        min={0}
                                        value={sample_count}
                                        onChange={handleSampleCountChange}
                                        disabled={set_values}
                                    />
                                </div>
                                <div className='ms-auto me-3'>
                                    <p style={{ fontWeight: 'bold' }} className="me-3">
                                        Sample Completed: {obj_count} / {sample_count}
                                    </p>
                                </div>
                            </div>
                        </Row>
                        {qrbar && (
                            <Row>
                                <Col>
                                    <Card className="mb-3">
                                        <CardBody>
                                            <h5 className="">
                                                Barcode Found:
                                                {qrbar_found === 0 ? (
                                                    <ExclamationCircleOutlined className={`ms-3 ${qrbar_found === 0 && 'zoom-in'}`} style={{ color: 'deepskyblue', fontSize: '1.5rem' }} />
                                                ) : qrbar_found === 1 ? (
                                                    <CloseCircleOutlined className={`ms-3 ${qrbar_found === 1 && 'zoom-in'}`} style={{ color: 'red', fontSize: '1.5rem' }} />
                                                ) : qrbar_found === 2 && (
                                                    <CheckCircleOutlined className={`ms-3 ${qrbar_found === 2 && 'zoom-in'}`} style={{ color: 'green', fontSize: '1.5rem' }} />
                                                )}
                                                <span className='ms-3'></span>
                                                Barcode Result:
                                                {qrbar_result === 0 ? (
                                                    <ExclamationCircleOutlined className={`ms-3 ${qrbar_result === 0 && 'zoom-in'}`} style={{ color: 'deepskyblue', fontSize: '1.5rem' }} />
                                                ) : qrbar_result === 1 ? (
                                                    <CloseCircleOutlined className={`ms-3 ${qrbar_result === 1 && 'zoom-in'}`} style={{ color: 'red', fontSize: '1.5rem' }} />
                                                ) : qrbar_result === 2 && (
                                                    <CheckCircleOutlined className={`ms-3 ${qrbar_result === 2 && 'zoom-in'}`} style={{ color: 'green', fontSize: '1.5rem' }} />
                                                )}
                                                {choosen_prof.detect_selection == true && (
                                                    <>
                                                        <span className='ms-3'></span>
                                                        Component Found:
                                                        {comp_found === 0 ? (
                                                            <ExclamationCircleOutlined className={`ms-3 ${comp_found === 0 && 'zoom-in'}`} style={{ color: 'deepskyblue', fontSize: '1.5rem' }} />
                                                        ) : comp_found === 1 ? (
                                                            <CloseCircleOutlined className={`ms-3 ${comp_found === 1 && 'zoom-in'}`} style={{ color: 'red', fontSize: '1.5rem' }} />
                                                        ) : comp_found === 2 && (
                                                            <CheckCircleOutlined className={`ms-3 ${comp_found === 2 && 'zoom-in'}`} style={{ color: 'green', fontSize: '1.5rem' }} />
                                                        )}
                                                    </>
                                                )}
                                                <span className='ms-3'></span>
                                                Component Result:
                                                {comp_result === 0 ? (
                                                    <ExclamationCircleOutlined className={`ms-3 ${comp_result === 0 && 'zoom-in'}`} style={{ color: 'deepskyblue', fontSize: '1.5rem' }} />
                                                ) : comp_result === 1 ? (
                                                    <CloseCircleOutlined className={`ms-3 ${comp_result === 1 && 'zoom-in'}`} style={{ color: 'red', fontSize: '1.5rem' }} />
                                                ) : comp_result === 2 && (
                                                    <CheckCircleOutlined className={`ms-3 ${comp_result === 2 && 'zoom-in'}`} style={{ color: 'green', fontSize: '1.5rem' }} />
                                                )}
                                            </h5>
                                        </CardBody>
                                    </Card>
                                </Col>
                            </Row>
                        )}
                        {outline_checkbox && (
                            <>
                                <div className='my-3'>
                                    <FormGroup check>
                                        <Label check>
                                            <Input
                                                type="checkbox"
                                                checked={show_outline}
                                                onChange={showOutline}
                                            />
                                            Show Outline
                                        </Label>
                                    </FormGroup>
                                </div>
                                {
                                    console.log('outline_colors', outline_colors)
                                }
                                {show_outline && (
                                    <div className='d-flex align-items-center'>
                                        <Label className='my-1'>Outline Color : </Label>
                                        <div className='mx-3 d-flex'>
                                            {outline_colors.map((otline, otl_id) => (
                                                <Button
                                                    key={otl_id}
                                                    className='mx-1'
                                                    style={{
                                                        backgroundColor:
                                                            otline === "White Outline" ? 'white' :
                                                                otline === "Red Outline" ? 'red' :
                                                                    otline === "Green Outline" ? 'green' :
                                                                        otline === "Blue Outline" ? 'blue' :
                                                                            otline === "Black Outline" ? 'black' :
                                                                                otline === "Orange Outline" ? 'orange' :
                                                                                    otline === "Yellow Outline" ? 'yellow' : 'gray',
                                                        boxShadow: default_outline == otline && '0px 0px 5px 2px rgba(0, 0, 0, 0.5)',
                                                        border: otline == "White Outline" ? 'auto' : 'none'
                                                    }}
                                                    outline={default_outline !== otline}
                                                    onClick={() => newOutlineChange(otline)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <div>
                            {/* Global Start Button - Shown once at the top */}
                            {shouldShowStartButton && (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    padding: '20px 20px 10px 20px'
                                }}>
                                    <div style={{
                                        backgroundColor: '#ffffff',
                                        padding: '16px 24px',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        border: '2px solid #1976d2'
                                    }}>
                                        <h4 style={{
                                            fontWeight: '600',
                                            margin: 0,
                                            color: '#333'
                                        }}>
                                            {getStartMessage()}
                                        </h4>
                                        <Button
                                            color='primary'
                                            size="lg"
                                            onClick={handleStartClick}
                                            style={{ whiteSpace: 'nowrap' }}
                                        >
                                            Start
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div style={{ padding: "20px" }}>
                                {Object.entries(groupedCameras).map(([stageName, cameras]) => (
                                    <div key={stageName} style={{ marginBottom: "24px" }}>
                                        {/* Stage Header */}
                                        <div style={{
                                            padding: "10px 16px",
                                            backgroundColor: getStageColor(stageName),
                                            color: "#fff",
                                            borderRadius: "8px 8px 0 0",
                                            fontSize: "15px",
                                            fontWeight: "700",
                                            textTransform: "uppercase",
                                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                                        }}>
                                            {stageName}
                                            <span style={{
                                                marginLeft: "10px",
                                                fontSize: "13px",
                                                fontWeight: "400",
                                                opacity: 0.9
                                            }}>
                                                ({cameras.length} camera{cameras.length !== 1 ? 's' : ''})
                                            </span>
                                        </div>

                                        {/* Cameras Grid - 2 cameras per row */}
                                        <div style={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(2, 1fr)",
                                            gap: "16px",
                                            border: `2px solid ${getStageColor(stageName)}`,
                                            borderTop: "none",
                                            borderRadius: "0 0 8px 8px",
                                            padding: "16px",
                                            backgroundColor: "#fafafa"
                                        }}>
                                            {cameras.map((camera, index) => (
                                                <div
                                                    key={`${stageName}-${camera.originalLabel}`}
                                                    style={{
                                                        display: "flex",
                                                        gap: "12px",
                                                        border: `2px solid ${getStageColor(stageName)}`,
                                                        padding: "12px",
                                                        borderRadius: "8px",
                                                        backgroundColor: "#ffffff",
                                                        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                                                        minHeight: "350px"
                                                    }}
                                                >
                                                    {/* Reference Image Column */}
                                                    <div style={{
                                                        flex: 1,
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        minWidth: 0
                                                    }}>
                                                        <div style={{
                                                            padding: "8px",
                                                            backgroundColor: "#f5f5f5",
                                                            borderRadius: "6px",
                                                            textAlign: "center",
                                                            marginBottom: "10px",
                                                            borderLeft: `3px solid ${getStageColor(stageName)}`
                                                        }}>
                                                            <div style={{
                                                                fontSize: "12px",
                                                                fontWeight: "600",
                                                                color: "#333"
                                                            }}>
                                                                REFERENCE
                                                            </div>
                                                            <div style={{
                                                                fontSize: "11px",
                                                                color: "#666",
                                                                marginTop: "2px"
                                                            }}>
                                                                {camera.label}
                                                            </div>
                                                        </div>

                                                        <div style={{
                                                            flex: 1,
                                                            position: "relative",
                                                            width: "100%",
                                                            paddingBottom: "75%",
                                                            backgroundColor: "#fafafa",
                                                            borderRadius: "6px",
                                                            overflow: "hidden",
                                                            border: "1px solid #e0e0e0"
                                                        }}>
                                                            {getReferenceImageForCamera(camera.label, camera.model_ver, ref_img_path) ? (
                                                                <img
                                                                    src={getReferenceImageForCamera(camera.label, camera.model_ver, ref_img_path)}
                                                                    alt={`Reference for ${camera.label}`}
                                                                    style={{
                                                                        position: "absolute",
                                                                        top: 0,
                                                                        left: 0,
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        objectFit: "cover"
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div style={{
                                                                    position: "absolute",
                                                                    top: 0,
                                                                    left: 0,
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    color: "#999",
                                                                    fontSize: "12px"
                                                                }}>
                                                                    No reference image
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Live Camera Column */}
                                                    <div style={{
                                                        flex: 1,
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        minWidth: 0
                                                    }}>
                                                        <div style={{
                                                            padding: "8px",
                                                            backgroundColor: `${getStageColor(stageName)}15`,
                                                            borderRadius: "6px",
                                                            textAlign: "center",
                                                            marginBottom: "10px",
                                                            borderLeft: `3px solid ${getStageColor(stageName)}`
                                                        }}>
                                                            <div style={{
                                                                fontSize: "12px",
                                                                fontWeight: "600",
                                                                color: getStageColor(stageName)
                                                            }}>
                                                                LIVE
                                                            </div>
                                                            <div style={{
                                                                fontSize: "11px",
                                                                color: "#666",
                                                                marginTop: "2px"
                                                            }}>
                                                                {camera.label}
                                                            </div>
                                                        </div>

                                                        <div style={{
                                                            flex: 1,
                                                            position: "relative",
                                                            width: "100%",
                                                            paddingBottom: "75%",
                                                            backgroundColor: "#000",
                                                            borderRadius: "6px",
                                                            overflow: "hidden",
                                                            border: showresult && response_message && response_message[camera.label]
                                                                ? response_message[camera.label] === "OK" || response_message[camera.label] === config?.positive
                                                                    ? '6px solid #52c41a'
                                                                    : response_message[camera.label] === "NG" || response_message[camera.label] === config?.negative
                                                                        ? '6px solid #ff4d4f'
                                                                        : `2px solid ${getStageColor(stageName)}`
                                                                : `2px solid ${getStageColor(stageName)}`
                                                        }}>
                                                            <div style={{
                                                                position: "absolute",
                                                                top: 0,
                                                                left: 0,
                                                                width: "100%",
                                                                height: "100%"
                                                            }}>
                                                                {cameraDisconnected && cameraDisconnected[camera.originalLabel] ? (
                                                                    <div style={{
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                                                                        padding: "16px"
                                                                    }}>
                                                                        <div style={{ textAlign: "center" }}>
                                                                            <h6 style={{ fontWeight: "600", marginBottom: "12px", fontSize: "14px" }}>
                                                                                Webcam Disconnected
                                                                            </h6>
                                                                            <Spinner color="primary" />
                                                                            <div style={{ fontSize: "12px", marginTop: "12px" }}>
                                                                                Please check connection...
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        {getCurrentOutlinePath(camera.originalLabel) && (
                                                                            <img
                                                                                src={showImage(getCurrentOutlinePath(camera.originalLabel))}
                                                                                alt={`${camera.label} Outline`}
                                                                                style={{
                                                                                    position: "absolute",
                                                                                    top: 0,
                                                                                    left: 0,
                                                                                    width: "100%",
                                                                                    height: "100%",
                                                                                    zIndex: 2,
                                                                                    pointerEvents: "none",
                                                                                    objectFit: "cover"
                                                                                }}
                                                                            />
                                                                        )}

                                                                        <WebcamCapture
                                                                            ref={(el) => { if (el) webcamRef.current[camera.originalLabel] = el; }}
                                                                            resolution={DEFAULT_RESOLUTION}
                                                                            videoConstraints={{
                                                                                width: DEFAULT_RESOLUTION.width,
                                                                                height: DEFAULT_RESOLUTION.height,
                                                                            }}
                                                                            zoom={zoom_value?.zoom}
                                                                            center={zoom_value?.center}
                                                                            cameraLabel={camera.originalLabel}
                                                                            style={{
                                                                                position: "absolute",
                                                                                top: 0,
                                                                                left: 0,
                                                                                width: "100%",
                                                                                height: "100%",
                                                                                objectFit: "cover"
                                                                            }}
                                                                        />
                                                                        {
                                                                            console.log('canvasRef', canvasRef)
                                                                        }

                                                                        <canvas
                                                                            ref={(el) => { if (el) canvasRef.current[camera.label] = el; }}
                                                                            width={640}
                                                                            height={480}
                                                                            style={{
                                                                                position: 'absolute',
                                                                                top: 0,
                                                                                left: 0,
                                                                                width: '100%',
                                                                                height: '100%',
                                                                                zIndex: 1,
                                                                                pointerEvents: 'none'
                                                                            }}
                                                                        />
                                                                        {/* 
                                                                        <div style={{
                                                                            position: "absolute",
                                                                            bottom: "8px",
                                                                            left: "8px",
                                                                            padding: "4px 8px",
                                                                            backgroundColor: getStageColor(stageName),
                                                                            color: "#fff",
                                                                            fontSize: "11px",
                                                                            borderRadius: "4px",
                                                                            fontWeight: "500",
                                                                            zIndex: 3
                                                                        }}>
                                                                            {camera.label}
                                                                        </div> */}

                                                                        <div style={{
                                                                            position: "absolute",
                                                                            top: "10%",
                                                                            left: "50%",
                                                                            transform: "translate(-50%, -50%)",
                                                                            zIndex: 4,
                                                                            textAlign: "center",
                                                                            width: "90%"
                                                                        }}>
                                                                            {show && msg && (
                                                                                <div style={{
                                                                                    color: '#fff',
                                                                                    fontSize: "14px",
                                                                                    fontWeight: "600",
                                                                                    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                                                                                    marginBottom: "8px"
                                                                                }}>
                                                                                    {msg}
                                                                                </div>
                                                                            )}

                                                                            {showstatus && res_message && res_message[camera.label] && (
                                                                                <div style={{
                                                                                    color:
                                                                                        res_message[camera.label] === "Object Detected" ? '#52c41a' :
                                                                                            res_message[camera.label] === "Barcode is correct" ? '#52c41a' :
                                                                                                res_message[camera.label] === "No Object Detected" ? '#fadb14' :
                                                                                                    res_message[camera.label] === "Incorrect Object" ? '#ff4d4f' :
                                                                                                        res_message[camera.label] === "Barcode is incorrect" ? '#ff4d4f' :
                                                                                                            res_message[camera.label] === "Unable to read Barcode" ? '#ffffff' :
                                                                                                                res_message[camera.label] === "Checking ..." ? '#fffb8f' :
                                                                                                                    '#ffffff',
                                                                                    fontSize: "16px",
                                                                                    fontWeight: "bold",
                                                                                    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                                                                                    marginBottom: "8px"
                                                                                }}>
                                                                                    {res_message[camera.label]}
                                                                                </div>
                                                                            )}

                                                                            {
                                                                                console.log('showstatus && res_message && res_message[camera.label]', showstatus, showresult, res_message, res_message[camera.label], config)
                                                                            }
                                                                            {showresult && res_message && res_message[camera.label] && (
                                                                                <div style={{
                                                                                    display: "flex",
                                                                                    flexDirection: "column",
                                                                                    alignItems: "left",
                                                                                    gap: "8px"
                                                                                }}>
                                                                                    <span
                                                                                        style={{
                                                                                            fontWeight: "bold",
                                                                                            color: res_message[camera.label] === "OK" ? "#28c76f" : "#e81919ff",
                                                                                            textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                                                                                            fontSize: "15px",
                                                                                        }}
                                                                                        className='mt-5'
                                                                                    >
                                                                                        Result: {res_message[camera.label]}
                                                                                    </span>


                                                                                    {(res_message[camera.label] === "OK" ||
                                                                                        res_message[camera.label] === config[0].positive) && (
                                                                                            <CheckCircleOutlined style={{
                                                                                                fontSize: '60px',
                                                                                                color: '#52c41a',
                                                                                                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
                                                                                            }} />
                                                                                        )}

                                                                                    {(res_message[camera.label] === "NG" ||
                                                                                        res_message[camera.label] === config[0].negative) && (
                                                                                            <CloseCircleOutlined style={{
                                                                                                fontSize: '60px',
                                                                                                color: '#bf171aff',
                                                                                                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
                                                                                            }} />
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
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </Container>
            {
                console.log('show_ratioshow_ratio', show_ratio)
            }
            {show_ratio && (
                <Modal isOpen={show_ratio} toggle={toggle} keyboard={false} centered size="lg">
                    <ModalHeader toggle={toggle} style={{ fontWeight: 'bold', textAlign: 'center' }}>
                        Acceptance Ratio Calculation
                    </ModalHeader>
                    <ModalBody>
                        <p style={{ fontWeight: 'bold', marginBottom: '20px' }}>
                            {`Profile Acceptance Ratio: ${ratio_data?.profile_Ratio || ''}`}
                        </p>

                        <p className='mt-4' style={{ fontWeight: 'bold', marginBottom: '15px' }}>
                            Stage-wise Acceptance Ratio
                        </p>

                        {ratio_data && Object.keys(ratio_data.algo_ratio).map((stageKey) => {
                            const stage = ratio_data.algo_ratio[stageKey];
                            return (
                                <div key={stageKey} style={{ marginBottom: '25px' }}>
                                    <h6 style={{ fontWeight: 'bold', color: '#0d6efd', marginBottom: '10px' }}>
                                        Stage Name: {stage.stage_name} (Code: {stage.stage_code})
                                    </h6>

                                    {Object.keys(stage.stage_acceptance_ratio).map((position) => {
                                        const algorithms = stage.stage_acceptance_ratio[position];
                                        return (
                                            <div key={position} style={{ marginLeft: '15px', marginBottom: '15px' }}>
                                                <p style={{ fontWeight: '600', marginBottom: '8px' }}>
                                                    Camera: {position}
                                                </p>
                                                <Table striped bordered hover size="sm" style={{ marginLeft: '15px' }}>
                                                    <thead>
                                                        <tr>
                                                            <th>Algorithm</th>
                                                            <th>Ratio (%)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Object.keys(algorithms).map((algoName) => (
                                                            <tr key={algoName}>
                                                                <td>{algoName}</td>
                                                                <td>{algorithms[algoName]}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </ModalBody>
                    <ModalFooter>
                        <Button color='primary' onClick={navigate}>OK</Button>
                    </ModalFooter>
                </Modal>
            )}
        </div>
    );
};

StageProfileRatioHandler.propTypes = { history: PropTypes.any.isRequired };

export default StageProfileRatioHandler;