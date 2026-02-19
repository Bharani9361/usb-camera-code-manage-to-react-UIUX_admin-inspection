
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Container, CardTitle, Button, Table, Label, Row, Col, CardBody, Card, CardText,
    FormGroup, Input, Spinner, Modal, ModalHeader, ModalFooter, ModalBody
} from 'reactstrap';
import Webcam from "react-webcam";
import './Css/style.css';
import CountdownTimer from "react-component-countdown-timer";
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Image as AntdImage } from 'antd';
import { Popconfirm, Image, Slider, Tooltip, Spin } from 'antd';

import PropTypes from "prop-types";
import Select from 'react-select';
import { DEFAULT_RESOLUTION } from './cameraConfig';
import WebcamCapture from 'pages/WebcamCustom/WebcamCapture';
import FullScreenLoader from 'components/Common/FullScreenLoader';
import AccuracyModal from './AccuracyModal';
import urlSocket from "./urlSocket"
import { image_url } from './imageUrl';
let ImageUrl = image_url;

var _ = require('lodash');

const StageAdminAccTesting = ({ history }) => {
    const [modelData, setModelData] = useState([]);
    const [config, setConfig] = useState([]);
    const [showstatus, setShowstatus] = useState(false);
    const [res_message, setRes_message] = useState('');
    const [response_message, setResponse_message] = useState('');
    const [msg, setMsg] = useState('');
    const [mssg, setMssg] = useState('');
    const [startCapture, setStartCapture] = useState(true);
    const [capture_duration, setCapture_duration] = useState(10);
    const [testing_duration, setTesting_duration] = useState(10);
    const [test_duration, setTest_duration] = useState(null);
    const [positive, setPositive] = useState('');
    const [negative, setNegative] = useState('');
    const [posble_match, setPosble_match] = useState('');
    const [timer, setTimer] = useState(false);
    const [time_elapsed, setTime_elapsed] = useState(false);
    const [extendTimer, setExtendTimer] = useState(false);
    const [timeExtend, setTimeExtend] = useState(false);
    const [show_timer, setShow_timer] = useState(false);
    const [show_acc, setShow_acc] = useState(false);
    const [showresult, setShowresult] = useState(false);
    const [manual_abort, setManual_abort] = useState(false);
    const [collection, setCollection] = useState(null);
    const [count, setCount] = useState(1);
    const [initvalue1, setInitvalue1] = useState(1);
    const [initvalue2, setInitvalue2] = useState(1);
    const [sample_count, setSample_count] = useState('0');
    console.log('sample_count55', sample_count)
    const [train_accuracy, setTrain_accuracy] = useState('');
    const [get_a, setGet_a] = useState('');
    const [get_b, setGet_b] = useState('');
    const [get_c, setGet_c] = useState('');
    const [get_d, setGet_d] = useState('');
    console.log('get_d', get_d, get_b)
    const [get_e, setGet_e] = useState('');
    const [get_f, setGet_f] = useState('');
    const [get_g, setGet_g] = useState('');
    const [get_h, setGet_h] = useState('');
    const [get_i, setGet_i] = useState('');
    const [gotoPage, setGotoPage] = useState('');
    const [ReTrain, setReTrain] = useState(false);
    const [show_result_img, setShow_result_img] = useState(false);
    const [barcode_data, setBarcode_data] = useState('');
    const [show_outline, setShow_outline] = useState(false);
    const [default_outline, setDefault_outline] = useState('White Outline');
    const [outline_colors] = useState([
        "White Outline",
        "Blue Outline",
        "Black Outline",
        "Orange Outline",
        "Yellow Outline",
    ]);
    const [outline_path, setOutline_path] = useState('');
    const [canvasUrl, setCanvasUrl] = useState(null);
    const [detectionData, setDetectionData] = useState(null);
    const [slt_od_method, setSlt_od_method] = useState('');
    const [selectedRegions, setSelectedRegions] = useState([]);
    const [zoom_value, setZoom_value] = useState({
        zoom: 1,
        center: { x: 0.5, y: 0.5 }
    });
    const [full_screen_loading, setFull_screen_loading] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [regionImageLoaded, setRegionImageLoaded] = useState(false);
    const [compImageLoaded, setCompImageLoaded] = useState(false);
    const [regionImagesLoaded, setRegionImagesLoaded] = useState({});
    const [approving_model_inprogress, setApproving_model_inprogress] = useState(false);
    const [batch_id, setBatch_id] = useState('');
    const [res_mode, setRes_mode] = useState('');
    const [region_test_type, setRegion_test_type] = useState('');
    const [overall_testing, setOverall_testing] = useState(true);
    const [region_wise_testing, setRegion_wise_testing] = useState(false);
    const [output_img_path, setOutput_img_path] = useState('');
    const [response_value, setResponse_value] = useState('');
    const [sift_matches, setSift_matches] = useState('');
    const [region_results, setRegion_results] = useState([]);
    const [show_region_webcam, setShow_region_webcam] = useState(false);
    const [show_region_popup, setShow_region_popup] = useState(false);
    const [compOnlyResultPath, setCompOnlyResultPath] = useState('');
    const [compOnlyResult, setCompOnlyResult] = useState('');
    const [compOnlyResultValue, setCompOnlyResultValue] = useState('');
    const [outline_checkbox, setOutline_checkbox] = useState(false);
    const [comp_info, setComp_info] = useState({});
    const [capture_fixed_refimage, setCapture_fixed_refimage] = useState(false);
    const [cameraDisconnected, setCameraDisconnected] = useState(false);
    const [show, setShow] = useState(false);
    const [showdata, setShowdata] = useState(false);
    const [train_acc_both, setTrain_acc_both] = useState(0);
    const [train_acc_ok, setTrain_acc_ok] = useState(0);
    console.log('train_acc_ok1117', train_acc_ok)
    const [train_acc_ng, setTrain_acc_ng] = useState(0);
    const [intervalId, setIntervalId] = useState(null);
    const [trainingStatusInterval, setTrainingStatusInterval] = useState(null);
    // NEW CAMERA STATES
    const [cameraList, setCameraList] = useState([]);
    const [selectedCameraLabel, setSelectedCameraLabel] = useState(null);
    const [newAvailableCameras, setNewAvailableCameras] = useState([]);
    const [selectedCameranameLabel, setSelectedCameranameLabel] = useState(null);
    // console.log('selectedCameranameLabel', selectedCameranameLabel, selectedCameraLabel)



    const [pysclCameraList, setPysclCameraList] = useState([]);
    const [canvasUrlsByCamera, setCanvasUrlsByCamera] = useState({});
    const [loading, setLoading] = useState(false);
    const [showCameraSelector, setShowCameraSelector] = useState(false);
    const [referenceImageUrl, setReferenceImageUrl] = useState("");
    const [showAll, setShowAll] = useState(false);
    const [modal_center, setModalCenter] = useState(false);
    const [results, setResults] = useState({});




    // Refs
    const canvasRef = useRef({});
    const canvasRef2 = useRef({});
    const canvasRef3 = useRef();
    // const webcamRef = useRef();

    const webcamRef = useRef([]);


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

    // UPDATED Check webcam function
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

                console.log('Available cameras with full data:', newAvailableCameras);
                setPysclCameraList(newAvailableCameras);
                setNewAvailableCameras(newAvailableCameras);
                setCameraDisconnected(false);


            }
        } catch (error) {
            console.log('Error Info: ', error);
        }
    }, [cameraList]);



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

    // Handle before unload
    const handleBeforeUnload = useCallback((e) => {
        e.preventDefault();
        e.returnValue = '';
        const message = 'Are you sure you want to leave?';
        return message;
    }, []);

    // Handle pop state
    const handlePopState = useCallback((e) => {
        window.history.pushState(null, null, window.location.pathname);

        if (window.confirm('Are you sure you want to go back?')) {
            // setStartCapture(false);
            // setShowdata(false);
            // setShowstatus(false);
            // setShowresult(false);
            // setManual_abort(true);
        } else {
            window.history.pushState(null, null, window.location.pathname);
        }
    }, []);


    const showRefOutline = async (data2) => {
        console.log('data2', data2)
        try {
            const response = await urlSocket.post('/api/stage/check_outline_stgchk',
                data2, { mode: 'no-cors' });
            let getInfo = response?.data.data;
            console.log('getInfo', getInfo)
            if (getInfo.error === "Tenant not found") {
                console.log("data error", getInfo.error);
                errorHandler(getInfo.error);
            }
            else {

                if (getInfo[0].show === 'yes') {
                    // setShowOutline(true);
                    setShow_outline(true)
                    setComp_info(getInfo[0].stage_info);
                    setOutline_checkbox(true);

                    const stageInfo = getInfo[0].stage_info;
                    const cameraSelection = stageInfo.camera_selection || {};

                    if (cameraSelection.mode === 'single') {
                        // single camera → just one outline
                        // setOutlinePath(stageInfo.datasets.white_path);
                        setOutline_path(stageInfo.datasets.white_path)
                    } else if (cameraSelection.mode === 'multi') {
                        // multi camera → store the entire datasets object
                        console.log('=== MULTI-CAMERA OUTLINE SETUP ===');
                        console.log('Cameras:', cameraSelection.cameras);
                        console.log('Stage datasets:', stageInfo.datasets);

                        // Store the entire datasets object so getCurrentOutlinePath can access any camera's data
                        setOutline_path(stageInfo.datasets);

                        console.log('Set outlinePath to full datasets for multi-camera mode');
                        console.log('=== MULTI-CAMERA OUTLINE SETUP END ===');
                    }
                } else if (getInfo.show === 'no') {
                    setCapture_fixed_refimage(true);
                }

            }
        } catch (error) {
            console.error(error);
        }
    };


    // Batch info
    const batchInfo = useCallback((modelData, config, overall_testing, region_wise_testing) => {
        console.log('modelData, config, overall_testing, region_wise_testing', modelData, config, overall_testing, region_wise_testing)
        try {
            urlSocket.post('/api/stage/batch_info_stg',
                {
                    modelData,
                    config,
                    overall_testing,
                    region_wise_testing
                },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data;
                    setBatch_id(data.batch_id);
                    setRes_mode(data.res_mode);
                })
                .catch((error) => {
                    console.log(error);
                });
        } catch (error) {
            // Handle error
        }
    }, []);


    const showImage = useCallback((output_img) => {

        if (!output_img || typeof output_img !== "string") {
            console.warn("Invalid output_img:", output_img);
            return "";
        }

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
        return imgurl + relativePath;

    }, []);


    // Show alert timer
    const showAlertTimer = useCallback((test_duration) => {
        let second = test_duration - 20;
        setTest_duration(second);
        setTimeout(() => {
            setExtendTimer(true);
        }, second * 1000);
    }, []);

    // Continue API call
    const cont_apiCall = useCallback(() => {
        setShowstatus(false);
        setShowresult(false);
        if (startCapture) {
            apiCall();
        }
    }, [startCapture]);

    // API call
    const apiCall = useCallback(() => {
        let message = 'Place the object and press start';
        setMsg(message);
        setShow(true);
    }, []);

    // App call
    const appCall = useCallback(() => {
        setStartCapture(true);
        setTimer(true);
        setShowstatus(false);
        setShowresult(false);
        let message = 'Place the object';
        setMssg(message);
        setShowdata(true);
    }, []);

    // On time up
    const onTimeup = useCallback(() => {
        setStartCapture(false);
        setShow(false);
        setShow_timer(false);
        setTimeExtend(true);
    }, []);

    // On time up course
    const onTimeupCourse = useCallback(() => {
        setTimer(true);
        if (config[0]?.qr_checking === true) {
            if (config[0]?.qr_uniq_checking === true) {
                uniqness_checking();
            } else {
                uniq_object_detection();
            }
        } else {
            adminAccTestingAuto();
        }
    }, [config]);



    const findAccuracy = useCallback((cameraData) => {
        if (!Array.isArray(cameraData) || cameraData.length === 0) return { both: 0, ok: 0, ng: 0 };

        // Sum counts for positive (OK) and negative (NG) results
        const totalAgreeOK = _.sumBy(cameraData, d => d.result === config[0].positive ? Number(d.agree || 0) : 0);
        const totalDisagreeOK = _.sumBy(cameraData, d => d.result === config[0].positive ? Number(d.disagree || 0) : 0);
        const totalAgreeNG = _.sumBy(cameraData, d => d.result === config[0].negative ? Number(d.agree || 0) : 0);
        const totalDisagreeNG = _.sumBy(cameraData, d => d.result === config[0].negative ? Number(d.disagree || 0) : 0);

        const totalSamples = _.sumBy(cameraData, d => Number(d.total || 0)) || 1;

        // Accuracy calculations
        const train_acc_both = ((totalAgreeOK + totalAgreeNG) / totalSamples) * 100;
        const train_acc_ok = (totalAgreeOK + totalDisagreeOK > 0)
            ? (totalAgreeOK / (totalAgreeOK + totalDisagreeOK)) * 100
            : 0;
        const train_acc_ng = (totalAgreeNG + totalDisagreeNG > 0)
            ? (totalAgreeNG / (totalAgreeNG + totalDisagreeNG)) * 100
            : 0;

        // Return as an object
        return {
            both: train_acc_both,
            ok: train_acc_ok,
            ng: train_acc_ng
        };
    }, [config]);




    // const findAccuracy = useCallback((cameraData) => {
    //     console.log('cameraData', cameraData)
    //     if (!Array.isArray(cameraData) || cameraData.length === 0) return 0;

    //     // Extract all result counts for this camera
    //     const totalAgreeOK = _.sumBy(cameraData, (d) =>
    //         d.result === config[0].positive ? Number(d.agree || 0) : 0
    //     );
    //     const totalDisagreeOK = _.sumBy(cameraData, (d) =>
    //         d.result === config[0].positive ? Number(d.disagree || 0) : 0
    //     );
    //     const totalAgreeNG = _.sumBy(cameraData, (d) =>
    //         d.result === config[0].negative ? Number(d.agree || 0) : 0
    //     );
    //     const totalDisagreeNG = _.sumBy(cameraData, (d) =>
    //         d.result === config[0].negative ? Number(d.disagree || 0) : 0
    //     );

    //     const totalSamples = _.sumBy(cameraData, (d) => Number(d.total || 0)) || 1;

    //     // Calculate accuracies
    //     const train_acc_both = ((totalAgreeOK + totalAgreeNG) / totalSamples) * 100;
    //     const ok_acc = (totalAgreeOK / (totalAgreeOK + totalDisagreeOK)) * 100;
    //     const ng_acc = (totalAgreeNG / (totalAgreeNG + totalDisagreeNG)) * 100;

    //     const train_acc_ok = isNaN(ok_acc) ? 0 : ok_acc;
    //     const train_acc_ng = isNaN(ng_acc) ? 0 : ng_acc;

    //     // Optionally set states if you maintain them globally
    //     setTrain_acc_both((prev) => ({ ...prev, [cameraData[0].camera_label]: train_acc_both }));
    //     setTrain_acc_ok((prev) => ({ ...prev, [cameraData[0].camera_label]: train_acc_ok }));
    //     setTrain_acc_ng((prev) => ({ ...prev, [cameraData[0].camera_label]: train_acc_ng }));

    //     if (res_mode === "ok") {
    //         return train_acc_ok;
    //     } else if (res_mode === "ng") {
    //         return train_acc_ng;
    //     }

    //     return train_acc_both;
    // }, [res_mode, config]);


    // Admin accuracy testing auto
    const adminAccTestingAuto = useCallback(async (event) => {
        setShowdata(false);

        if (manual_abort || time_elapsed) {
            return;
        }

        const imageSrc = await webcamRef.current.captureZoomedImage();
        if (!imageSrc) {
            setShowdata(true);
            return;
        }

        setInitvalue1(prev => prev + 1);
        const blob = await fetch(imageSrc).then((res) => res.blob());
        const formData = new FormData();

        const today = new Date();
        const _today = today.toLocaleDateString();
        const time = today.toLocaleTimeString().replace(/:/g, '_');
        const compdata = `${modelData.comp_name}_${modelData.comp_code}_${_today}_${time}`;

        const { comp_name, comp_code, model_name, model_ver, model_id, comp_id, comp_model_id, _id, thres } = modelData;

        formData.append('comp_name', comp_name);
        formData.append('comp_code', comp_code);
        formData.append('model_name', model_name);
        formData.append('model_ver', model_ver);
        formData.append('model_id', model_id);
        formData.append('comp_id', comp_id);
        formData.append('comp_model_id', comp_model_id);
        formData.append('detect_type', slt_od_method ? slt_od_method : config[0].detection_type);

        if (selectedRegions) {
            formData.append('our_rectangles', JSON.stringify(comp_info?.rectangles));
            formData.append('selected_regions', JSON.stringify(selectedRegions));
        }
        formData.append('positive', config[0].positive);
        formData.append('negative', config[0].negative);
        formData.append('posble_match', config[0].posble_match);
        formData.append('upper_bound_conf', config[0].upper_bound_conf);
        formData.append('lower_bound_conf', config[0].lower_bound_conf);
        formData.append('count', initvalue1);
        formData.append('batch_id', batch_id);
        formData.append('_id', _id);
        formData.append('date', _today);
        formData.append('time', time);
        formData.append('thres', thres);
        formData.append('datasets', blob, `${compdata}.png`);

        try {
            console.log('formData', formData)
            const response = await urlSocket.post("/api/stage/obj_detection_ver_stg", formData, {
                headers: {
                    "content-type": "multipart/form-data",
                },
                mode: "no-cors",
            });

            setRes_message(response.data.detection_result);
            setShowstatus(true);

            if (response.data.detection_result === 'No Object Found') {
                setTimeout(() => {
                    appCall();
                }, 1000);
            } else if (response.data.detection_result === 'Incorrect Object') {
                setTimeout(() => {
                    appCall();
                }, 1000);
            } else if (response.data.detection_result === "Object Detected" || response.data.detection_result === "") {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                let Checking = "Checking ...";
                setRes_message(Checking);
                setCollection(response.data._id);

                let trainAccResultId = response.data._id;
                let logId = response.data.log_id;

                let updated_rectangles = [];
                if (response.data?.updated_rectangles) {
                    updated_rectangles = response.data.updated_rectangles;
                }

                await urlSocket.post('/api/stage/result_ver',
                    {
                        'comp_id': comp_id, 'comp_name': comp_name, 'comp_code': comp_code, 'model_name': model_name, 'model_ver': model_ver,
                        'path': response.data.captured_image, 'thres': thres, 'positive': config[0].positive, 'negative': config[0].negative,
                        'posble_match': config[0].posble_match, 'trainAccId': trainAccResultId,
                        'logId': logId, 'ref_img_path': modelData.datasets[0].image_path, 'type': modelData.type, 'position': modelData.position,
                        '_id': modelData._id, 'region_test_type': region_test_type,
                        'overall_testing': overall_testing, 'region_wise_testing': region_wise_testing,
                        'updated_rectangles': updated_rectangles,
                    },
                    { mode: 'no-cors' })
                    .then(async detection => {
                        let stateInsertion = {
                            response_message: detection.data.status,
                            response_value: detection.data.value,
                            output_img_path: detection.data.res_img_path,
                            sift_matches: detection.data.sift_matches,
                            region_results: detection.data.region_results
                        };

                        setShowstatus(false);
                        setShowresult(true);
                        setResponse_message(detection.data.status);
                        setResponse_value(detection.data.value);
                        setOutput_img_path(detection.data.res_img_path);
                        setSift_matches(detection.data.sift_matches);
                        setRegion_results(detection.data.region_results);

                        console.log('data556 ', detection);
                        if (detection.data.region_results && detection.data.res_img_path) {
                            const originalWidth = 640;
                            const originalHeight = 480;
                            const targetWidth = DEFAULT_RESOLUTION.width;
                            const targetHeight = DEFAULT_RESOLUTION.height;

                            const scaleX = targetWidth / originalWidth;
                            const scaleY = targetHeight / originalHeight;

                            const rectNameMap = new Map(modelData.rectangles.map(rect => [rect.name, rect]));
                            let retrivedrectangle = [];

                            retrivedrectangle = detection.data.region_results.map((rect, rect_index) => {
                                const rectangle_values = rectNameMap.get(rect.name);
                                return {
                                    name: rect.rectangles.name,
                                    status: rect.status,
                                    value: rect.value,
                                    x: rect.rectangles.coordinates.x / scaleX,
                                    y: rect.rectangles.coordinates.y / scaleY,
                                    width: rect.rectangles.coordinates.width / scaleX,
                                    height: rect.rectangles.coordinates.height / scaleY
                                };
                            });

                            const canvas = canvasRef.current;
                            const ctx = canvas.getContext('2d');
                            ctx.clearRect(0, 0, canvas.width, canvas.height);

                            retrivedrectangle.map((rect, rect_id) => {
                                const isSelected = rect.status == 'OK';
                                if (isSelected) {
                                    ctx.lineWidth = 2;
                                    ctx.strokeStyle = 'green';
                                    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
                                } else {
                                    ctx.lineWidth = 2;
                                    ctx.strokeStyle = 'red';
                                    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
                                }
                                ctx.font = 'bold 14px Arial';
                                ctx.lineWidth = 3;
                                ctx.strokeStyle = 'black';
                                ctx.strokeText(rect.name, rect.x + 10, rect.y + 15);
                                ctx.fillStyle = 'white';
                                ctx.fillText(rect.name, rect.x + 10, rect.y + 15);
                            });

                            setCanvasUrl(canvas.toDataURL());
                            setShow_region_webcam(true);
                            setShow_region_popup(true);
                        } else if (detection.data.res_img_path) {
                            setShow_result_img(true);
                        }

                        if (region_wise_testing && overall_testing) {
                            setCompOnlyResultPath(detection.data.compOnlyResultPath);
                            setCompOnlyResult(detection.data.compOnlyResult);
                            setCompOnlyResultValue(detection.data.compOnlyResultValue);
                        }
                    });
            } else {
                appCall();
            }
        } catch (error) {
            console.error(error);
        }
    }, [manual_abort, time_elapsed, batch_id, config, initvalue1, modelData, slt_od_method, selectedRegions, region_test_type, overall_testing, region_wise_testing, appCall]);


    const adminAccTesting = useCallback(async (config) => {
        if (manual_abort || time_elapsed) return;

        clearInterval(intervalId);
        setShow(false);

        const capturedImages = [];
        const today = new Date();
        const _today = today.toLocaleDateString();
        const time = today.toLocaleTimeString().replace(/:/g, '_');


        try {
            // 1️⃣ Capture images from all cameras first
            for (const cam of modelData) {
                const labelName = cam.camera.label;
                const version = cam.camera.model_ver;
                const webcamInstance = webcamRef.current[cam.camera.originalLabel];

                if (!webcamInstance) {
                    console.warn(`Webcam not ready for ${labelName}, skipping...`);
                    continue;
                }

                const imageSrc = await webcamInstance.captureZoomedImage();
                if (!imageSrc) continue;

                const blob = await fetch(imageSrc).then(res => res.blob());
                const today = new Date();
                const _today = today.toLocaleDateString();
                const time = today.toLocaleTimeString().replace(/:/g, "_");
                const compdata = `${modelData[0].stage_name}_${modelData[0].stage_code}_${_today}_${time}_${labelName}`;

                capturedImages.push({
                    label: labelName,
                    version: version,
                    blob,
                    filename: `${compdata}.png`,
                    imageSrc
                });
            }

            // 2️⃣ Prepare FormData for all captured images
            const formData = new FormData();
            formData.append('comp_name', modelData[0].comp_name);
            formData.append('comp_code', modelData[0].comp_code);
            formData.append('stage_name', modelData[0].stage_name);
            formData.append('stage_code', modelData[0].stage_code);
            formData.append('stage_id', modelData[0].stage_id);
            formData.append('model_name', modelData[0].model_name);
            formData.append('model_ver', modelData[0].model_ver);
            formData.append('model_id', modelData[0].model_id);
            formData.append('comp_id', modelData[0].comp_id);
            formData.append('comp_stg_model_id', modelData[0].comp_stg_model_id);
            formData.append('detect_type', slt_od_method ? slt_od_method : config.detection_type);
            formData.append('positive', config.positive);
            formData.append('negative', config.negative);
            formData.append('posble_match', config.posble_match);
            formData.append('upper_bound_conf', config.upper_bound_conf);
            formData.append('lower_bound_conf', config.lower_bound_conf);
            formData.append('count', initvalue1);
            formData.append('batch_id', batch_id);
            formData.append('modelData', modelData);
            formData.append('date', _today);
            formData.append('time', time);


            // append all images
            capturedImages.forEach((img, idx) => {
                formData.append(`datasets[${idx}]`, img.blob, img.filename);
                formData.append(`camera_labels[${idx}]`, img.label);
            });

            formData.append('capturedImages', capturedImages);
            // formData.forEach((value, key) => {
            //     console.log(key, value);
            // })
            const response = await urlSocket.post("/api/stage/obj_detection_ver_stg", formData, {
                headers: { "content-type": "multipart/form-data" },
                mode: "no-cors",
            });
            console.log('response.data', response.data)
            // setRes_message(response.data.detection_result);
            const resultsByCamera = {};
            response.data.detection_result.forEach(item => {
                resultsByCamera[item.camera_label] = item.detection_result;
            });
            console.log('resultsByCamera', resultsByCamera)
            setRes_message(resultsByCamera);
            setShowstatus(true);

            const capturedImagesData = response.data.captured_image || [];
            const detectionResults = response.data.detection_result || [];
            const updatedRectanglesList = response.data?.updated_rectangles || [];

            const hasNoObject = detectionResults.some(item => item.detection_result === 'No Object Detected');
            const hasIncorrectObject = detectionResults.some(item => item.detection_result === 'Incorrect Object');
            const hasObjectDetected = detectionResults.some(item => item.detection_result === 'Object Detected');

            if (hasNoObject || hasIncorrectObject) {
                setTimeout(() => {
                    cont_apiCall();
                }, 1000);
            } else if (hasObjectDetected || detectionResults.length === 0) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                let Checking = "Checking ...";
                // setRes_message(Checking);
                setRes_message(prev => {
                    const updated = { ...prev };
                    // For all cameras currently in detection_results
                    detectionResults.forEach(item => {
                        updated[item.camera_label] = "Checking ...";
                    });
                    return updated;
                });

                setCollection(response.data._id);

                const trainAccResultId = response.data._id;
                const logId = response.data.log_id;
                const comp_id = modelData[0].comp_id;
                const stage_id = modelData[0].stage_id;
                const stage_name = modelData[0].stage_name;
                const stage_code = modelData[0].stage_code;
                const model_name = modelData[0].model_name;
                const model_ver = modelData.map(item => item.model_ver);
                const comp_name = modelData[0].comp_name;
                const comp_code = modelData[0].comp_code;
                // Use capturedImages to get the original paths
                const ref_img_paths = capturedImages.map(img => img.imageSrc || img.image_path || img.filename);
                const ids = modelData.map(item => item._id);
                const thres = modelData.map(item => item.thres);


                const resultPayload = {
                    comp_id,
                    comp_name,
                    comp_code,
                    stage_id,
                    stage_name,
                    stage_code,
                    model_name,
                    model_ver,
                    trainAccId: trainAccResultId,
                    logId,
                    thres,
                    positive: config.positive,
                    negative: config.negative,
                    posble_match: config.posble_match,
                    ref_img_paths: ref_img_paths,
                    type: modelData.type,
                    position: modelData.position,
                    _id: modelData._id,
                    region_test_type,
                    overall_testing,
                    region_wise_testing,
                    ids,
                    // Multiple images and rectangles
                    captured_images: capturedImagesData,
                    detection_results: detectionResults,
                    updated_rectangles: updatedRectanglesList
                };

                await urlSocket.post('/api/stage/result_ver_stg', resultPayload, { mode: 'no-cors' })
                    .then(async detection => {
                        setShowstatus(false);
                        setShowresult(true);

                        console.log('data556 ', detection.data);

                        // const resultsByCamera = {};
                        // detection.data.forEach(cameraObj => {
                        //     const label = Object.keys(cameraObj)[0]; // "4kcamera" or "zoomcamera"
                        //     const data = cameraObj[label];

                        //     // Decide result based on NG / OK counts
                        //     if (data.OK > 0) {
                        //         resultsByCamera[label] = "OK";
                        //     } else if (data.NG > 0) {
                        //         resultsByCamera[label] = "NG";
                        //     } else {
                        //         resultsByCamera[label] = "PM"; // or some fallback
                        //     }
                        // });
                        const resultsByCamera = {};

                        detection.data.forEach(cameraObj => {
                            Object.entries(cameraObj).forEach(([label, data]) => {
                                // let resultsByCamera[label];
                                if (data.OK > 0) {
                                    resultsByCamera[label] = "OK";
                                } else if (data.NG > 0) {
                                    resultsByCamera[label] = "NG";
                                } else {
                                    resultsByCamera[label] = "PM";
                                }

                                // resultsByCamera[label] = {
                                //     result,
                                //     version: data.version || null // <-- include version if exists
                                // };
                            });
                        });


                        console.log('resultsByCamera', resultsByCamera)
                        // const formattedData = detection.data.reduce((acc, item) => {
                        //     const [key, value] = Object.entries(item)[0]; // e.g. ['Position2', {...}]
                        //     acc[key.toLowerCase()] = value.results;
                        //     return acc;
                        // }, {});
                        const formattedData = detection.data.reduce((acc, item) => {
                            Object.entries(item).forEach(([key, value]) => {
                                acc[key.toLowerCase()] = value.results;
                            });
                            return acc;
                        }, {});
                        console.log('formattedData', formattedData)
                        // Set state
                        setResponse_message(resultsByCamera);
                        setResults(formattedData);

                        setResponse_value(detection.data.value);
                        setOutput_img_path(detection.data);
                        setSift_matches(detection.data.sift_matches);
                        setRegion_results(detection.data.region_results);


                        const initialSelections = {};
                        if (Array.isArray(detection.data) && resultsByCamera) {
                            detection.data.forEach((cameraData) => {
                                const cameraLabel = Object.keys(cameraData)[0];
                                initialSelections[cameraLabel] = resultsByCamera[cameraLabel] || 'OK';
                            });
                            setUserSelections(initialSelections);
                        }



                        //  if (!Array.isArray(detection.data) || detection.data.length === 0) return;

                        console.log('Drawing rectangles for cameras:', detection.data);

                        // Small delay to ensure canvases are mounted
                        // setTimeout(() => {
                        const newCanvasUrls = {};

                        // detection.data is an array with one object containing all cameras
                        const allCameras = detection.data[0]; // Get the first (and only) object

                        // Object.entries(allCameras).forEach(([cameraLabel, cameraData]) => {
                        //     console.log(`Processing camera: ${cameraLabel}`, cameraData);

                        //     // Check if this camera has region results
                        //     if (cameraData.region_results) {

                        //         // Loop through each version's region results
                        //         Object.entries(cameraData.region_results).forEach(([version, regions]) => {
                        //             const canvasKey = `${cameraLabel}-v${version}`;
                        //             const canvas = canvasRef.current[canvasKey];

                        //             console.log(`Looking for canvas: ${canvasKey}`, canvas ? 'FOUND' : 'NOT FOUND');

                        //             if (!canvas) {
                        //                 console.warn(`Canvas not found for ${canvasKey}`);
                        //                 return;
                        //             }

                        //             console.log(`Drawing on canvas for ${canvasKey}`, regions);

                        //             const ctx = canvas.getContext('2d');

                        //             // Set canvas size
                        //             canvas.width = 640;
                        //             canvas.height = 480;

                        //             ctx.clearRect(0, 0, canvas.width, canvas.height);

                        //             // Define your resolution scaling
                        //             const originalWidth = 1920;
                        //             const originalHeight = 1080;
                        //             const canvasWidth = 640;
                        //             const canvasHeight = 480;

                        //             const scaleX = canvasWidth / originalWidth;
                        //             const scaleY = canvasHeight / originalHeight;

                        //             console.log(`Scale factors for ${canvasKey}: X=${scaleX}, Y=${scaleY}`);

                        //             // Draw rectangles for this version's regions
                        //             regions.forEach((region) => {
                        //                 const coords = region.coordinates;

                        //                 console.log(`Drawing region ${region.name}:`, coords);

                        //                 // Scale coordinates to canvas size
                        //                 const scaledX = coords.x * scaleX;
                        //                 const scaledY = coords.y * scaleY;
                        //                 const scaledWidth = coords.width * scaleX;
                        //                 const scaledHeight = coords.height * scaleY;

                        //                 console.log(`Scaled coordinates: x=${scaledX}, y=${scaledY}, w=${scaledWidth}, h=${scaledHeight}`);

                        //                 // Determine color based on status
                        //                 const strokeColor = region.status === 'OK' ? 'green' : 'red';

                        //                 // Draw rectangle
                        //                 ctx.lineWidth = 3;
                        //                 ctx.strokeStyle = strokeColor;
                        //                 ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

                        //                 // Draw label with background
                        //                 ctx.font = 'bold 16px Arial';

                        //                 // Black outline for text
                        //                 ctx.lineWidth = 4;
                        //                 ctx.strokeStyle = 'black';
                        //                 ctx.strokeText(region.name, scaledX + 10, scaledY + 25);

                        //                 // White fill for text
                        //                 ctx.fillStyle = 'white';
                        //                 ctx.fillText(region.name, scaledX + 10, scaledY + 25);

                        //                 // Draw status below name
                        //                 const statusText = `${region.status}: ${region.value}`;
                        //                 ctx.strokeText(statusText, scaledX + 10, scaledY + 45);
                        //                 ctx.fillStyle = strokeColor;
                        //                 ctx.fillText(statusText, scaledX + 10, scaledY + 45);
                        //             });

                        //             // Store the canvas data URL with the composite key
                        //             const dataUrl = canvas.toDataURL();
                        //             newCanvasUrls[canvasKey] = dataUrl;
                        //             console.log(`Canvas URL created for ${canvasKey}:`, dataUrl.substring(0, 50) + '...');
                        //         });
                        //     }
                        // });

                        // console.log('All canvas URLs:', Object.keys(newCanvasUrls));
                        // setCanvasUrlsByCamera(newCanvasUrls);

                        setDetectionData(detection.data);
                        setIsOpen(true)
                    });
            } else {
                cont_apiCall();
            }
            cont_apiCall();
        } catch (error) {
            console.error(error);
            cont_apiCall()
        }

    }, [manual_abort, time_elapsed, batch_id, config, initvalue1, modelData, slt_od_method, selectedRegions, region_test_type, overall_testing, region_wise_testing, cont_apiCall, appCall]);




    // Unique object detection


    const uniq_object_detection = useCallback(async () => {
        setShowdata(false);

        if (manual_abort || time_elapsed) {
            return;
        }

        setInitvalue1(prev => prev + 1);
        const imageSrc = await webcamRef.current.captureZoomedImage();
        const blob = await fetch(imageSrc).then((res) => res.blob());
        const formData = new FormData();

        const today = new Date();
        const _today = today.toLocaleDateString();
        const time = today.toLocaleTimeString().replace(/:/g, '_');
        const compdata = `${modelData.comp_name}_${modelData.comp_code}_${_today}_${time}`;

        const { comp_name, comp_code, model_name, model_ver, model_id, comp_id, comp_model_id, _id } = modelData;

        formData.append('comp_name', comp_name);
        formData.append('comp_code', comp_code);
        formData.append('model_name', model_name);
        formData.append('model_ver', model_ver);
        formData.append('model_id', model_id);
        formData.append('comp_id', comp_id);
        formData.append('comp_model_id', comp_model_id);
        formData.append('positive', config[0].positive);
        formData.append('negative', config[0].negative);
        formData.append('posble_match', config[0].posble_match);
        formData.append('count', initvalue1);
        formData.append('batch_id', batch_id);
        formData.append('_id', _id);
        formData.append('date', _today);
        formData.append('time', time);
        formData.append('datasets', blob, `${compdata}.png`);

        try {
            const response = await urlSocket.post("/qr_detection", formData, {
                headers: {
                    "content-type": "multipart/form-data",
                },
                mode: "no-cors",
            });

            await new Promise((resolve) => setTimeout(resolve, 2000));
            setRes_message(response.data.detection_result);
            setShowstatus(true);

            if (response.data.detection_result === 'No Object Found') {
                setTimeout(() => {
                    appCall();
                }, 1000);
            } else if (response.data.detection_result === "Data Found") {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                let Checking = "Checking ...";
                setRes_message(Checking);
                setShowstatus(true);

                await new Promise((resolve) => setTimeout(resolve, 1000));
                setShowstatus(false);
                setCollection(response.data._id);
                setResponse_message(response.data.status);
                setResponse_value(response.data.value);
                setShowresult(true);
            } else {
                appCall();
            }
        } catch (error) {
            console.error(error);
        }
    }, [manual_abort, time_elapsed, batch_id, config, initvalue1, modelData, appCall]);

    const ask_show = useCallback(async (data) => {
        console.log('dat1126a', data)
        setInitvalue2(prev => prev + 1);
        setResponse_message('');
        setSample_count(initvalue2.toString());
        console.log('initvalue2', initvalue2,)
        setShow_result_img(false);
        setShow_region_popup(false);
        agree_not(collection, data, batch_id, results, initvalue2.toString());

    }, [initvalue2, collection, batch_id, results]);

    const agree_not = (data, datas, batch_id, result, sample_countfunc) => {
        console.log('data,datas, batch_id, result', data, datas, batch_id, result);
        try {
            urlSocket.post('/api/stage/agree_not_stg', {
                '_id': data,
                'agree': datas,
                'batch_id': batch_id,
                'config': config,
                'modelData': modelData,
                'result': result,
                'camera_label': selectedCameranameLabel
            }, { mode: 'no-cors' })
                .then((response) => {
                    const data = response.data.data;
                    console.log('data', data)

                    const new_a = {}, new_b = {}, new_c = {};
                    const new_d = {}, new_e = {}, new_f = {};
                    const new_g = {}, new_h = {}, new_i = {};
                    const new_train_accuracy = {};
                    const new_train_acc_ok = {};
                    const new_train_acc_ng = {};
                    // const new_train_acc_both = {};

                    // const groupedByCameraVersion = _.groupBy(data, (item) => `${item.camera_label}-V${item.version}`);
                    // Object.keys(groupedByCameraVersion).forEach((cameraVersion) => {
                    //     const dataArray = groupedByCameraVersion[cameraVersion];
                    //     console.log('dataArray', dataArray, config)

                    //     const summary_ok = _.find(dataArray, (o) => o.result === config[0].positive);
                    //     const summary_notok = _.find(dataArray, (o) => o.result === config[0].negative);
                    //     const summary_posbl_match = _.find(dataArray, (o) => o.result === config[0].posble_match);
                    //     console.log('summary_ok', summary_ok, summary_notok, summary_posbl_match)

                    //     if (summary_ok) {
                    //         new_a[cameraVersion] = summary_ok.ok;
                    //         new_d[cameraVersion] = summary_ok.agree;
                    //         new_g[cameraVersion] = summary_ok.disagree;

                    //     }

                    //     if (summary_notok) {
                    //         new_b[cameraVersion] = summary_notok.notok;
                    //         new_e[cameraVersion] = summary_notok.agree;
                    //         new_h[cameraVersion] = summary_notok.disagree;
                    //     }

                    //     if (summary_posbl_match) {
                    //         new_c[cameraVersion] = summary_posbl_match.posbl_match;
                    //         new_f[cameraVersion] = summary_posbl_match.qc_ok;
                    //         new_i[cameraVersion] = summary_posbl_match.qc_notok;
                    //     }

                    //     // Compute accuracy
                    //     // new_train_accuracy[cameraVersion] = findAccuracy(dataArray);
                    //     const acc = findAccuracy(dataArray); // dataArray for this camera-version
                    //     new_train_accuracy[cameraVersion] = acc.both; // store "both" accuracy
                    //     // Optionally, you can store ok/ng if you need:
                    //     new_train_acc_ok[cameraVersion] = acc.ok;
                    //     new_train_acc_ng[cameraVersion] = acc.ng;
                    //     setTrain_accuracy(new_train_accuracy);
                    //     setTrain_acc_both(new_train_accuracy);
                    //     setTrain_acc_ok(new_train_acc_ok);
                    //     setTrain_acc_ng(new_train_acc_ng);


                    // });
                    const groupedByCameraVersion = _.groupBy(data, (item) => `${item.camera_label}-V${item.version}`);

                    Object.keys(groupedByCameraVersion).forEach((cameraVersion) => {
                        const dataArray = groupedByCameraVersion[cameraVersion];

                        const summary_ok = _.find(dataArray, (o) =>
                            o.result?.toUpperCase() === config[0].positive ||
                            (o.ok && o.ok > 0)
                        );

                        const summary_notok = _.find(dataArray, (o) =>
                            o.result?.toUpperCase() === config[0].negative ||
                            (o.notok && o.notok > 0)
                        );

                        const summary_posbl_match = _.find(dataArray, (o) =>
                            o.result === config[0].posble_match ||
                            (o.posbl_match && o.posbl_match > 0)
                        );

                        console.log('summary_ok, summary_notok, summary_posbl_match', summary_ok, summary_notok, summary_posbl_match)

                        if (summary_ok) {
                            new_a[cameraVersion] = summary_ok.ok;
                            new_d[cameraVersion] = summary_ok.agree;
                            new_g[cameraVersion] = summary_ok.disagree;
                        }

                        if (summary_notok) {
                            new_b[cameraVersion] = summary_notok.notok;
                            new_e[cameraVersion] = summary_notok.agree;
                            new_h[cameraVersion] = summary_notok.disagree;
                        }

                        if (summary_posbl_match) {
                            new_c[cameraVersion] = summary_posbl_match.posbl_match;
                            new_f[cameraVersion] = summary_posbl_match.qc_ok;
                            new_i[cameraVersion] = summary_posbl_match.qc_notok;
                        }

                        const acc = findAccuracy(dataArray);
                        new_train_accuracy[cameraVersion] = acc.both;
                        new_train_acc_ok[cameraVersion] = acc.ok;
                        new_train_acc_ng[cameraVersion] = acc.ng;

                        setTrain_accuracy(new_train_accuracy);
                        setTrain_acc_both(new_train_accuracy);
                        setTrain_acc_ok(new_train_acc_ok);
                        setTrain_acc_ng(new_train_acc_ng);
                    });




                    // Update all states immediately
                    setGet_a(new_a);
                    setGet_b(new_b);
                    setGet_c(new_c);
                    setGet_d(new_d);
                    setGet_e(new_e);
                    setGet_f(new_f);
                    setGet_g(new_g);
                    setGet_h(new_h);
                    setGet_i(new_i);
                    setTrain_accuracy(new_train_accuracy);
                    console.log("configconfigconfigconfigconfigconfigconfigconfigconfigconfigconfigconfigconfigconfigconfig")

                    setShow_acc(true);

                    // Continue with inspection-type logic (unchanged)
                    if (config[0].inspection_type === "Manual") {
                        console.log('first if working');
                        if (Number(sample_countfunc) !== Number(config[0].test_samples)) {
                            console.log('first if 1189 working', sample_countfunc, config[0].test_samples);
                            cont_apiCall();
                        } else {
                            const train_acc_global = _.mean(Object.values(new_train_accuracy));
                            console.log('first elseif 1193 working', train_acc_global);
                            if (train_acc_global !== 100) {
                                callapiLog(
                                    config[0].test_samples,
                                    sample_countfunc,
                                    config[0].positive,
                                    config[0].negative,
                                    config[0].posble_match,
                                    new_a, new_b, new_c, new_d, new_e, new_f, new_g, new_h, new_i, new_train_accuracy
                                );

                                const filteredModels = modelData.filter(model => {
                                    const label = model.camera.label;
                                    const version = model.model_ver;
                                    const key = `${label}-V${version}`;
                                    return new_train_accuracy[key] < 100;
                                });

                                const filteredTrainAcc = filteredModels.map(model => {
                                    const camLabel = model.camera.label;
                                    const model_ver = model.model_ver;
                                    const key = `${camLabel}-V${model_ver}`;

                                    return {
                                        camLabel,
                                        model_ver,
                                        train_acc_both: new_train_accuracy[key],
                                        train_acc_ok: new_train_acc_ok[key],
                                        train_acc_ng: new_train_acc_ng[key]
                                    };
                                });

                                const unfilteredModels = modelData.filter(model => {
                                    const label = model.camera.label;
                                    const version = model.model_ver;
                                    const key = `${label}-V${version}`;
                                    return new_train_accuracy[key] === 100;
                                });

                                const unfilteredTrainAcc = unfilteredModels.map(model => {
                                    const camLabel = model.camera.label;
                                    const model_ver = model.model_ver;
                                    const key = `${camLabel}-V${model_ver}`;

                                    return {
                                        camLabel,
                                        model_ver,
                                        train_acc_both: new_train_accuracy[key],
                                        train_acc_ok: new_train_acc_ok[key],
                                        train_acc_ng: new_train_acc_ng[key]
                                    };
                                });

                                console.log("filteredModels:", filteredModels);
                                console.log("filteredTrainAcc:", filteredTrainAcc);
                                console.log("unfilteredModels:", unfilteredModels);
                                console.log("unfilteredTrainAcc:", unfilteredTrainAcc);


                                trainClick(filteredModels, filteredTrainAcc);
                                navigateto1(unfilteredModels, unfilteredTrainAcc)
                            } else {
                                console.log('first else 1204 working');
                                callapiLog(
                                    config[0].test_samples,
                                    sample_countfunc,
                                    config[0].positive,
                                    config[0].negative,
                                    config[0].posble_match,
                                    new_a, new_b, new_c, new_d, new_e, new_f, new_g, new_h, new_i, new_train_accuracy
                                );

                            }
                        }
                    } else {
                        if (Number(sample_countfunc) !== Number(config[0].test_samples)) {
                            console.log('second else 1216 working');
                            appCall();
                        } else {
                            const train_acc_global = _.mean(Object.values(new_train_accuracy));
                            console.log('second else if 1219 working');
                            if (train_acc_global !== 100) {
                                callapiLog(
                                    config[0].test_samples,
                                    sample_countfunc,
                                    config[0].positive,
                                    config[0].negative,
                                    config[0].posble_match,
                                    new_a, new_b, new_c, new_d, new_e, new_f, new_g, new_h, new_i, new_train_accuracy
                                );

                                const filteredModels = modelData.filter(model => {
                                    const label = model.camera.label;
                                    const version = model.model_ver;
                                    const key = `${label}-V${version}`;
                                    return new_train_accuracy[key] < 100;
                                });

                                const filteredTrainAcc = filteredModels.map(model => {
                                    const camLabel = model.camera.label;
                                    const model_ver = model.model_ver;
                                    const key = `${camLabel}-V${model_ver}`;

                                    return {
                                        camLabel,
                                        model_ver,
                                        train_acc_both: new_train_accuracy[key],
                                        train_acc_ok: new_train_acc_ok[key],
                                        train_acc_ng: new_train_acc_ng[key]
                                    };
                                });

                                const unfilteredModels = modelData.filter(model => {
                                    const label = model.camera.label;
                                    const version = model.model_ver;
                                    const key = `${label}-V${version}`;
                                    return new_train_accuracy[key] === 100;
                                });

                                const unfilteredTrainAcc = unfilteredModels.map(model => {
                                    const camLabel = model.camera.label;
                                    const model_ver = model.model_ver;
                                    const key = `${camLabel}-V${model_ver}`;

                                    return {
                                        camLabel,
                                        model_ver,
                                        train_acc_both: new_train_accuracy[key],
                                        train_acc_ok: new_train_acc_ok[key],
                                        train_acc_ng: new_train_acc_ng[key]
                                    };
                                });

                                console.log("filteredModels:", filteredModels);
                                console.log("filteredTrainAcc:", filteredTrainAcc);
                                console.log("unfilteredModels:", unfilteredModels);
                                console.log("unfilteredTrainAcc:", unfilteredTrainAcc);


                                trainClick(filteredModels, filteredTrainAcc);
                                navigateto1(unfilteredModels, unfilteredTrainAcc)
                            } else {
                                console.log('second else 1231 working');
                                callapiLog(
                                    config[0].test_samples,
                                    sample_countfunc,
                                    config[0].positive,
                                    config[0].negative,
                                    config[0].posble_match,
                                    new_a, new_b, new_c, new_d, new_e, new_f, new_g, new_h, new_i, new_train_accuracy
                                );

                            }
                        }
                    }
                })
                .catch((error) => console.log(error));
        } catch (error) {
            console.log("----", error);
        }
    };


    // const agree_not = (data, datas, batch_id, result, sample_countfunc) => {
    //     console.log('data,datas, batch_id, result 1142', data, datas, batch_id, result);
    //     try {
    //         urlSocket.post('/api/stage/agree_not_stg', {
    //             '_id': data,
    //             'agree': datas,
    //             'batch_id': batch_id,
    //             'config': config,
    //             'modelData': modelData,
    //             'result': result,
    //             'camera_label': selectedCameranameLabel
    //         }, { mode: 'no-cors' })
    //             .then((response) => {
    //                 const data = response.data.data;
    //                 console.log("agree_not (camera-wise)", data);

    //                 const groupedByCameraVersion = _.groupBy(data, (item) => `${item.camera_label}-V${item.version}`);
    //                 Object.keys(groupedByCameraVersion).forEach((cameraVersion) => {
    //                     const dataArray = groupedByCameraVersion[cameraVersion];

    //                     console.log(`Processing results for: ${cameraVersion}`, dataArray);

    //                     const summary_ok = _.find(dataArray, (o) => o.result === config[0].positive);
    //                     const summary_notok = _.find(dataArray, (o) => o.result === config[0].negative);
    //                     const summary_posbl_match = _.find(dataArray, (o) => o.result === config[0].posble_match);

    //                     // Parse camera and version
    //                     const [camera, version] = cameraVersion.split('-V');
    //                     console.log('summary_notok', summary_ok, summary_notok);

    //                     if (summary_ok) {
    //                         setGet_a((prev) => ({ ...prev, [cameraVersion]: summary_ok.ok }));
    //                         setGet_d((prev) => ({ ...prev, [cameraVersion]: summary_ok.agree }));
    //                         setGet_g((prev) => ({ ...prev, [cameraVersion]: summary_ok.disagree }));
    //                     }

    //                     if (summary_notok) {
    //                         setGet_b((prev) => ({ ...prev, [cameraVersion]: summary_notok.notok }));
    //                         setGet_e((prev) => ({ ...prev, [cameraVersion]: summary_notok.agree }));
    //                         setGet_h((prev) => ({ ...prev, [cameraVersion]: summary_notok.disagree }));
    //                     }

    //                     if (summary_posbl_match) {
    //                         setGet_c((prev) => ({ ...prev, [cameraVersion]: summary_posbl_match.posbl_match }));
    //                         setGet_f((prev) => ({ ...prev, [cameraVersion]: summary_posbl_match.qc_ok }));
    //                         setGet_i((prev) => ({ ...prev, [cameraVersion]: summary_posbl_match.qc_notok }));
    //                     }

    //                     // Compute accuracy per camera-version
    //                     const train_acc = findAccuracy(dataArray);
    //                     console.log('train_acc1278', train_acc);
    //                     setTrain_accuracy((prev) => ({ ...prev, [cameraVersion]: train_acc }));
    //                 });

    //                 setShow_acc(true);

    //                 // Continue your existing inspection - type logic
    //                 if (config[0].inspection_type === "Manual") {
    //                     console.log('first if working');
    //                     if (Number(sample_countfunc) !== Number(config[0].test_samples)) {
    //                         console.log('first if 1189 working', sample_countfunc, config[0].test_samples);
    //                         cont_apiCall();
    //                     } else if (Number(sample_countfunc) === Number(config[0].test_samples)) {
    //                         const train_acc_global = _.mean(Object.values(train_accuracy));
    //                         console.log('first elseif 1193 working', train_acc_global);
    //                         if (train_acc_global !== 100) {
    //                             callapiLog(
    //                                 config[0].test_samples,
    //                                 sample_countfunc,
    //                                 config[0].positive,
    //                                 config[0].negative,
    //                                 config[0].posble_match
    //                             );
    //                             trainClick();
    //                         } else {
    //                             console.log('first else 1204 working');
    //                             callapiLog(
    //                                 config[0].test_samples,
    //                                 sample_countfunc,
    //                                 config[0].positive,
    //                                 config[0].negative,
    //                                 config[0].posble_match
    //                             );
    //                         }
    //                     }
    //                 } else {
    //                     if (Number(sample_countfunc) !== Number(config[0].test_samples)) {
    //                         console.log('second else 1216 working');
    //                         appCall();
    //                     } else if (Number(sample_countfunc) === Number(config[0].test_samples)) {
    //                         console.log('second else if 1219 working');
    //                         const train_acc_global = _.mean(Object.values(train_accuracy));
    //                         if (train_acc_global !== 100) {
    //                             callapiLog(
    //                                 config[0].test_samples,
    //                                 sample_countfunc,
    //                                 config[0].positive,
    //                                 config[0].negative,
    //                                 config[0].posble_match
    //                             );
    //                             trainClick();
    //                         } else {
    //                             console.log('second else 1231 working');
    //                             callapiLog(
    //                                 config[0].test_samples,
    //                                 sample_countfunc,
    //                                 config[0].positive,
    //                                 config[0].negative,
    //                                 config[0].posble_match
    //                             );
    //                         }
    //                     }
    //                 }
    //             })
    //             .catch((error) => {
    //                 console.log(error);
    //             });
    //     } catch (error) {
    //         console.log("----", error);
    //     }
    // };


    // const agree_not = useCallback((data, datas, batch_id, result, sample_countfunc) => {
    //     console.log('data,datas, batch_id, result 1142', data, datas, batch_id, result)
    //     try {
    //         urlSocket.post('/api/stage/agree_not_stg', {
    //             '_id': data,
    //             'agree': datas,
    //             'batch_id': batch_id,
    //             'config': config,
    //             'modelData': modelData,
    //             'result': result,
    //             'camera_label': selectedCameranameLabel
    //         }, { mode: 'no-cors' })
    //             .then((response) => {
    //                 const data = response.data.data;
    //                 console.log("agree_not (camera-wise)", data);



    //                 const groupedByCameraVersion = _.groupBy(data, (item) => `${item.camera_label}-V${item.version}`);
    //                 Object.keys(groupedByCameraVersion).forEach((cameraVersion) => {
    //                     const dataArray = groupedByCameraVersion[cameraVersion];

    //                     console.log(`Processing results for: ${cameraVersion}`, dataArray);

    //                     const summary_ok = _.find(dataArray, (o) => o.result === config[0].positive);
    //                     const summary_notok = _.find(dataArray, (o) => o.result === config[0].negative);
    //                     const summary_posbl_match = _.find(dataArray, (o) => o.result === config[0].posble_match);

    //                     // Parse camera and version
    //                     const [camera, version] = cameraVersion.split('-V');
    //                     console.log('summary_notok', summary_ok, summary_notok)

    //                     if (summary_ok) {
    //                         setGet_a((prev) => ({ ...prev, [cameraVersion]: summary_ok.ok }));
    //                         setGet_d((prev) => ({ ...prev, [cameraVersion]: summary_ok.agree }));
    //                         setGet_g((prev) => ({ ...prev, [cameraVersion]: summary_ok.disagree }));
    //                     }

    //                     if (summary_notok) {
    //                         setGet_b((prev) => ({ ...prev, [cameraVersion]: summary_notok.notok }));
    //                         setGet_e((prev) => ({ ...prev, [cameraVersion]: summary_notok.agree }));
    //                         setGet_h((prev) => ({ ...prev, [cameraVersion]: summary_notok.disagree }));
    //                     }

    //                     if (summary_posbl_match) {
    //                         setGet_c((prev) => ({ ...prev, [cameraVersion]: summary_posbl_match.posbl_match }));
    //                         setGet_f((prev) => ({ ...prev, [cameraVersion]: summary_posbl_match.qc_ok }));
    //                         setGet_i((prev) => ({ ...prev, [cameraVersion]: summary_posbl_match.qc_notok }));
    //                     }

    //                     // Compute accuracy per camera-version
    //                     const train_acc = findAccuracy(dataArray);
    //                     console.log('train_acc1278', train_acc)
    //                     setTrain_accuracy((prev) => ({ ...prev, [cameraVersion]: train_acc }));
    //                 });




    //                 setShow_acc(true);

    //                 // Continue your existing inspection - type logic
    //                 if (config[0].inspection_type === "Manual") {
    //                     console.log('first if working')
    //                     if (Number(sample_countfunc) !== Number(config[0].test_samples)) {

    //                         console.log('first if 1189 working', sample_countfunc, config[0].test_samples)
    //                         cont_apiCall();
    //                     } else if (Number(sample_countfunc) === Number(config[0].test_samples)) {
    //                         const train_acc_global = _.mean(Object.values(train_accuracy));
    //                         console.log('first elseif 1193 working', train_acc_global, get_d)
    //                         if (train_acc_global !== 100) {
    //                             callapiLog(
    //                                 config[0].test_samples,
    //                                 sample_countfunc,
    //                                 config[0].positive,
    //                                 config[0].negative,
    //                                 config[0].posble_match
    //                             );
    //                             trainClick();
    //                         } else {
    //                             console.log('first else 1204 working')
    //                             callapiLog(
    //                                 config[0].test_samples,
    //                                 sample_countfunc,
    //                                 config[0].positive,
    //                                 config[0].negative,
    //                                 config[0].posble_match
    //                             );
    //                         }
    //                     }
    //                 } else {
    //                     if (Number(sample_countfunc) !== Number(config[0].test_samples)) {
    //                         console.log('second else 1216 working')
    //                         appCall();
    //                     } else if (Number(sample_countfunc) === Number(config[0].test_samples)) {
    //                         console.log('second else if 1219 working')
    //                         const train_acc_global = _.mean(Object.values(train_accuracy));
    //                         if (train_acc_global !== 100) {
    //                             callapiLog(
    //                                 config[0].test_samples,
    //                                 sample_countfunc,
    //                                 config[0].positive,
    //                                 config[0].negative,
    //                                 config[0].posble_match
    //                             );
    //                             trainClick();
    //                         } else {
    //                             console.log('second else 1231 working')
    //                             callapiLog(
    //                                 config[0].test_samples,
    //                                 sample_countfunc,
    //                                 config[0].positive,
    //                                 config[0].negative,
    //                                 config[0].posble_match
    //                             );
    //                         }
    //                     }
    //                 }
    //             })
    //             .catch((error) => {
    //                 console.log(error);
    //             });
    //     }
    //     catch (error) {
    //         console.log("----", error);
    //     }

    // }, [config, modelData, findAccuracy, cont_apiCall, appCall]);


    // Navigate to function
    const navigateto = useCallback(async () => {
        console.log('this navigato function called')
        setApproving_model_inprogress(true);

        try {
            await urlSocket.post('/api/stage/status_change_stg',
                {
                    'modelData': modelData,
                    'camera_label': selectedCameranameLabel,
                    'config': config,
                    'batch_id': batch_id,
                    'train_accuracy': train_accuracy,
                    'train_acc_both': train_acc_both,
                    'train_acc_ok': train_acc_ok,
                    'train_acc_ng': train_acc_ng
                },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data;
                    console.log('datadatadata', data)
                    setStartCapture(false);
                    if (gotoPage === 'StageModelCreation') {
                        history.push("/StageModelCreation");
                    } else {
                        history.push("/StageModelVerInfo");
                    }

                })
                .catch((error) => {
                    console.log(error);
                });
        } catch (error) {
            console.log("----", error);
        } finally {
            setApproving_model_inprogress(false);
        }
    });

    const navigateto1 = useCallback(async (unfilteredModels, unfilteredTrainAcc) => {
        // setApproving_model_inprogress(true);

        try {
            const payload = {
                modelData: unfilteredModels,
                camera_label: selectedCameranameLabel,
                config: config,
                batch_id: batch_id,
                train_accuracy: {},
                train_acc_both: {},
                train_acc_ok: {},
                train_acc_ng: {}
            };

            // Populate the accuracy values dynamically from unfilteredTrainAcc
            unfilteredTrainAcc.forEach(item => {
                const key = `${item.camLabel}-V${item.model_ver}`;
                payload.train_accuracy[key] = item.train_acc_both;
                payload.train_acc_both[key] = item.train_acc_both;
                payload.train_acc_ok[key] = item.train_acc_ok;
                payload.train_acc_ng[key] = item.train_acc_ng;
            });

            const response = await urlSocket.post('/api/stage/status_change_stg', payload, { mode: 'no-cors' });

            console.log('Response data:', response.data);
            setStartCapture(false);

        } catch (error) {
            console.log("Error in navigateto1:", error);
        } finally {
            // setApproving_model_inprogress(false);
        }
    }, [selectedCameranameLabel, config, batch_id]);

    // Call API log
    const callapiLog = useCallback(async (
        data, datas, positive, negative, posble_match,
        a, b, c, d, e, f, g, h, i, accuracy
    ) => {
        let comp_name = modelData[0].comp_name;
        let comp_code = modelData[0].comp_code;
        console.log('modelData', modelData)
        console.log(' a, b, c, d, e, f, g, h, i', a, b, c, d, e, f, g, h, i)
        try {
            await urlSocket.post('/callapiLog', {
                comp_name,
                comp_code,
                test_samples: data,
                sample_count: datas,
                positive,
                negative,
                posble_match,
                ok: a,
                notok: b,
                agree_ok: d,
                agree_notok: e,
                disagree_ok: g,
                disagree_notok: h,
                possible_match: c,
                ok_possible: f,
                notok_possible: i,
                accuracy
            }, { mode: 'no-cors' })
                .then((response) => {
                    let inspected_data = response.data;
                })
                .catch((error) => {
                    console.log(error);
                });
        } catch (error) {
            console.log(error);
        }
    }, [modelData, train_accuracy]);

    // Train click function
    // const trainClick = useCallback(async (models, filteredTrainAcc) => {
    //     console.log('trainClick1305', models, filteredTrainAcc)
    //     console.log('config', config)
    //     console.log('batch_id', batch_id)

    //     try {
    //         urlSocket.post('/re_train',
    //             {
    //                 'modelData': models,
    //                 'config': config,
    //                 'batch_id': batch_id,
    //                 'train_accuracy': train_accuracy,
    //                 'train_acc_both': train_acc_both,
    //                 'train_acc_ok': train_acc_ok,
    //                 'train_acc_ng': train_acc_ng
    //             },
    //             { mode: 'no-cors' })
    //             .then((response) => {
    //                 let inspected_data = response.data;
    //                 if (inspected_data === 'Exceed the Re-Train Limit') {
    //                     setReTrain(true);
    //                 }
    //             })
    //             .catch((error) => {
    //                 console.log(error);
    //             });
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }, [modelData, config, batch_id, train_accuracy, train_acc_both, train_acc_ok, train_acc_ng]);

    const trainClick = useCallback(async (models, filteredTrainAcc) => {
        console.log('trainClick - filtered models:', models);
        console.log('trainClick - filtered train accuracies:', filteredTrainAcc);
        console.log('config:', config);
        console.log('batch_id:', batch_id);

        try {

            const payload = {
                modelData: models,
                config: config,
                batch_id: batch_id,
                train_accuracy: {}, // populate from filteredTrainAcc
                train_acc_both: {},
                train_acc_ok: {},
                train_acc_ng: {}
            };

            filteredTrainAcc.forEach(item => {
                const key = `${item.camLabel}-V${item.model_ver}`;
                payload.train_accuracy[key] = item.train_acc_both; // or overall? adjust if needed
                payload.train_acc_both[key] = item.train_acc_both;
                payload.train_acc_ok[key] = item.train_acc_ok;
                payload.train_acc_ng[key] = item.train_acc_ng;
            });
            console.log('payload', payload)

            const response = await urlSocket.post('/api/stage/re_train_stg', payload, { mode: 'no-cors' });

            const inspected_data = response.data;
            if (inspected_data === 'Exceed the Re-Train Limit') {
                setReTrain(true);
            }
        } catch (error) {
            console.log('trainClick error:', error);
        }
    }, [config, batch_id]);

    // Navigate function
    const navigate = useCallback(() => {
        setStartCapture(false);
        if (gotoPage === 'StageModelCreation') {
            history.push("/StageModelCreation");
        } else {
            history.push("/StageModelVerInfo");
        }
    }, [gotoPage, history]);

    // Manual abort testing
    const manual_abortTesting = useCallback(async (event) => {
        setStartCapture(false);
        setShowdata(false);
        setShowstatus(false);
        setShowresult(false);
        setManual_abort(true);
    }, []);

    // Navigation function
    const navigation = useCallback(async () => {
        setManual_abort(false);
        setFull_screen_loading(true);

        try {
            const abortResponse = await urlSocket.post('/api/stage/manual_abort_stg', {
                'batch_id': batch_id,
                'comp_name': modelData.comp_name,
                'comp_code': modelData.comp_code,
                'positive': config[0].positive,
                'negative': config[0].negative,
                'posble_match': config[0].posble_match,
                'type': modelData.type,
                'position': modelData.position,
            }, { mode: 'no-cors' });

            const aborted_data = abortResponse.data;
            setShowdata(false);

            const statusResponse = await urlSocket.post('/api/stage/status_update_stg', {
                'model_data': modelData,
                'status': 'training completed'
            }, { mode: 'no-cors' });

            const data = statusResponse.data;
            setStartCapture(false);

            if (gotoPage === 'StageModelcreation') {
                history.push("/StageModelCreation");
            } else {
                history.push("/stageModelVerInfo");
            }

        } catch (error) {
            console.log("----", error);
        } finally {
            setFull_screen_loading(false);
        }
    }, [batch_id, modelData, config, gotoPage, history]);

    // Extend timer function
    const ExtendTimer = useCallback(() => {
        setTimeout(() => {
            setShow_timer(false);
        }, 1000);

        setTimeout(() => {
            setTesting_duration(testing_duration);
            setShow_timer(true);
        }, 1000);

        setExtendTimer(false);
        showAlertTimer(testing_duration);
    }, [testing_duration, showAlertTimer]);

    // Timer extension function
    const timerExtention = useCallback(async () => {
        setTimeExtend(false);
        setTesting_duration(testing_duration);
        setShow_timer(true);
        setShow(true);
    }, [testing_duration]);

    // Abort testing function
    const abortTesting = useCallback(async (event) => {
        setTimeExtend(false);
        setStartCapture(false);
        setShow(false);
        setShowdata(false);

        let comp_name = modelData.comp_name;
        let comp_code = modelData.comp_code;

        try {
            urlSocket.post('/abort', {
                'batch_id': batch_id, 'comp_name': comp_name, 'comp_code': comp_code,
                'positive': config[0].positive, 'negative': config[0].negative, 'posble_match': config[0].posble_match
            }, { mode: 'no-cors' })
                .then((response) => {
                    let aborted_data = response.data;
                    setTime_elapsed(true);
                    setStartCapture(false);
                    setShow(false);
                    setShowdata(false);
                })
                .catch((error) => {
                    console.log(error);
                });
        } catch (error) {
            // Handle error
        }
    }, [modelData, batch_id, config]);

    // Re-train limit function
    const reTrainLimit = useCallback(() => {
        setReTrain(false);
    }, []);

    // Barcode testing
    const barcodeTesting = useCallback(async (config) => {
        if (manual_abort || time_elapsed) {
            return;
        }

        setInitvalue1(prev => prev + 1);
        clearInterval(intervalId);
        setShow(false);

        const imageSrc = await webcamRef.current.captureZoomedImage();
        const blob = await fetch(imageSrc).then((res) => res.blob());
        const formData = new FormData();

        const today = new Date();
        const _today = today.toLocaleDateString();
        const time = today.toLocaleTimeString().replace(/:/g, '_');
        const compdata = `${modelData.comp_name}_${modelData.comp_code}_${_today}_${time}`;

        const { comp_name, comp_code, model_name, model_ver, comp_id, thres } = modelData;

        formData.append('comp_id', comp_id);
        formData.append('count', initvalue1);
        formData.append('batch_id', batch_id);
        formData.append('date', _today);
        formData.append('time', time);
        formData.append('thres', thres);
        formData.append('datasets', blob, `${compdata}.png`);

        try {
            const response = await urlSocket.post("/barcode_compare", formData, {
                headers: {
                    "content-type": "multipart/form-data",
                },
                mode: "no-cors",
            });

            setRes_message(response.data);
            setShowstatus(true);
        } catch (error) {
            console.error(error);
        }
    }, [manual_abort, time_elapsed, batch_id, initvalue1, modelData, intervalId]);

    // Barcode info
    const barcodeInfo = useCallback((modelData) => {
        try {
            urlSocket.post('/barcode_info', { modelData }, { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data;
                    setBarcode_data(data);
                });
        } catch (error) {
            console.log('error', error);
        }
    }, []);

    // Show outline function
    const showOutline = useCallback(() => {
        setShow_outline(prevState => !prevState);
    }, []);

    // Outline changes
    const outlinechanges = useCallback((e) => {
        setDefault_outline(e);
        if (e.label === 'White Outline') {
            setOutline_path(comp_info.datasets.white_path);
        } else if (e.label === 'Red Outline') {
            setOutline_path(comp_info.datasets.red_path);
        } else if (e.label === 'Green Outline') {
            setOutline_path(comp_info.datasets.green_path);
        } else if (e.label === 'Blue Outline') {
            setOutline_path(comp_info.datasets.blue_path);
        } else if (e.label === 'Black Outline') {
            setOutline_path(comp_info.datasets.black_path);
        } else if (e.label === 'Orange Outline') {
            setOutline_path(comp_info.datasets.orange_path);
        } else if (e.label === 'Yellow Outline') {
            setOutline_path(comp_info.datasets.yellow_path);
        }
    }, [comp_info]);


    const newOutlineChange = useCallback((ot_label) => {
        console.log('=== OUTLINE CHANGE ===');
        console.log('ot_label', ot_label);
        console.log('stageInfo.datasets:', comp_info?.datasets);

        setDefault_outline(ot_label);

        // Handle multi-camera mode
        if (comp_info?.camera_selection?.mode === 'multi') {
            console.log('Multi-camera mode detected');

            // Store the entire datasets object so each camera can access its outline
            setOutline_path(comp_info.datasets);

            console.log('Set outlinePath to full datasets:', comp_info.datasets);
        } else {
            // Handle single camera mode
            if (ot_label === 'White Outline') {
                setOutline_path(comp_info.datasets.white_path);
            } else if (ot_label === 'Red Outline') {
                setOutline_path(comp_info.datasets.red_path);
            } else if (ot_label === 'Green Outline') {
                setOutline_path(comp_info.datasets.green_path);
            } else if (ot_label === 'Blue Outline') {
                setOutline_path(comp_info.datasets.blue_path);
            } else if (ot_label === 'Black Outline') {
                setOutline_path(comp_info.datasets.black_path);
            } else if (ot_label === 'Orange Outline') {
                setOutline_path(comp_info.datasets.orange_path);
            } else if (ot_label === 'Yellow Outline') {
                setOutline_path(comp_info.datasets.yellow_path);
            } else {
                console.warn(`No matching outline found for label: ${ot_label}`);
            }
        }
    }, [comp_info]);

    // Image URL to blob
    const imageUrlToBlob = useCallback(async (imageUrl) => {
        try {
            if (imageUrl !== undefined) {
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                return blob;
            }
        } catch (error) {
            console.log('Error converting image to blob:', error);
        }
    }, []);

    // Copy rectangle
    const copyRectangle = useCallback(() => {
        try {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
                const canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                if (canvasRef2.current) {
                    const canvas2 = canvasRef2.current;
                    const ctx2 = canvas2.getContext('2d');
                    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
                    ctx2.putImageData(canvasData, 0, 0);
                }
            }
        } catch (error) {
            console.warn(error);
        }
    }, []);

    // Are all required images loaded
    const areAllRequiredImagesLoaded = useCallback(() => {
        if (show_result_img && !imageLoaded) return false;
        if (show_region_popup && !regionImageLoaded) return false;
        if (region_wise_testing && overall_testing && !compImageLoaded) return false;
        if (region_wise_testing) {
            for (let i = 0; i < region_results.length; i++) {
                if (!regionImagesLoaded[i]) return false;
            }
        }
        return true;
    }, [show_result_img, show_region_popup, region_wise_testing, overall_testing, region_results, imageLoaded, regionImageLoaded, compImageLoaded, regionImagesLoaded]);


    // Add this state at the component level (outside the useCallback)
    const [userSelections, setUserSelections] = useState({});
    const [isOpen, setIsOpen] = useState(false);
    console.log('setIsOpen(true)', isOpen)

    const handleSelectionChange = useCallback((cameraLabel, version, value) => {
        console.log('cameraLabel, version, value', cameraLabel, version, value)
        setUserSelections(prev => ({
            ...prev,
            [cameraLabel]: {
                ...prev[cameraLabel],
                [version]: value
            }
        }));
    }, []);

    const handleSubmit = useCallback(() => {
        console.log("User selections before transform:", userSelections);

        // Validation: Check if all cameras have selections for all their VALID versions
        const allCamerasSelected = output_img_path.every(cameraData => {
            return Object.entries(cameraData).every(([cameraLabel, data]) => {
                if (!data.results || Object.keys(data.results).length === 0) {
                    return true;
                }

                // Only check versions that have valid results (OK or NG)
                return Object.entries(data.results).every(([version, result]) => {
                    if (result !== 'OK' && result !== 'NG') {
                        return true; // Skip invalid results
                    }
                    return userSelections[cameraLabel]?.[version] !== undefined;
                });
            });
        });

        if (!allCamerasSelected) {
            alert('Please provide your assessment for all camera versions before submitting.');
            return;
        }

        // Transform data to required structure - ONLY include valid versions
        const transformedData = {};

        output_img_path.forEach(cameraData => {
            // 🔧 Loop through *each* camera inside this object
            Object.entries(cameraData).forEach(([cameraLabel, data]) => {
                if (data.results && Object.keys(data.results).length > 0) {
                    transformedData[cameraLabel] = {};

                    Object.entries(data.results).forEach(([version, systemResult]) => {
                        if (systemResult === 'OK' || systemResult === 'NG') {
                            const userSelection = userSelections[cameraLabel]?.[version];
                            if (userSelection) {
                                const isAgree = userSelection === systemResult;
                                transformedData[cameraLabel][`V${version}`] = {
                                    agree: userSelection === 'OK' ? 1 : 0,
                                    disagree: userSelection === 'OK' ? 0 : 1
                                };
                            }
                        }
                    });
                }
            });
        });

        console.log('transformedDatatransformedData', transformedData);

        ask_show(transformedData);
        setIsOpen(false);
    }, [userSelections, output_img_path, ask_show]);


    // const handleSubmit = useCallback(() => {
    //     console.log("User selections before transform:", userSelections);

    //     // Validation: Check if all cameras have selections for all their VALID versions
    //     const allCamerasSelected = output_img_path.every(cameraData => {
    //         const cameraLabel = Object.keys(cameraData)[0];
    //         const data = cameraData[cameraLabel];

    //         if (!data.results || Object.keys(data.results).length === 0) {
    //             return true;
    //         }

    //         // Only check versions that have valid results (OK or NG)
    //         return Object.entries(data.results).every(([version, result]) => {
    //             if (result !== 'OK' && result !== 'NG') {
    //                 return true; // Skip invalid results
    //             }
    //             return userSelections[cameraLabel]?.[version] !== undefined;
    //         });
    //     });

    //     if (!allCamerasSelected) {
    //         alert('Please provide your assessment for all camera versions before submitting.');
    //         return;
    //     }

    //     // Transform data to required structure - ONLY include valid versions
    //     const transformedData = {};

    //     output_img_path.forEach(cameraData => {
    //         const cameraLabel = Object.keys(cameraData)[0];
    //         const data = cameraData[cameraLabel];

    //         if (data.results && Object.keys(data.results).length > 0) {
    //             transformedData[cameraLabel] = {};

    //             Object.entries(data.results).forEach(([version, systemResult]) => {
    //                 // ONLY process versions with valid OK/NG results
    //                 if (systemResult === 'OK' || systemResult === 'NG') {
    //                     const userSelection = userSelections[cameraLabel]?.[version];

    //                     if (userSelection) {
    //                         const isAgree = userSelection === systemResult;

    //                         transformedData[cameraLabel][`V${version}`] = {
    //                             agree: isAgree ? 0 : 1,
    //                             disagree: isAgree ? 1 : 0
    //                         };
    //                     }
    //                 }
    //             });
    //         }
    //     });

    //     console.log('transformedDatatransformedData', transformedData)



    //     // ask_show(allAgree ? 'yes' : 'no', transformedData);
    //     ask_show(transformedData); // Always send 'no' to force manual review
    //     setIsOpen(false);
    // }, [userSelections, output_img_path, ask_show]);
    // Toggle modal
    const toggleModal = useCallback(() => {
        setIsOpen(!isOpen);
    }, [isOpen]);



    const renderResultSweetAlert = useCallback(({ type }) => {
        console.log("renderResultModal - type:", type);
        // console.log("output_img_path:", output_img_path);
        console.log("response_message:", response_message);

        const isPositive = type === 'positive';
        const isNegative = type === 'negative';

        const allCamerasMatch = response_message &&
            Object.keys(response_message).length > 0 &&
            Object.values(response_message).every(result =>
                result === (isPositive ? "OK" : "NG")
            );

        const shouldShowBase = allCamerasMatch && !manual_abort && !time_elapsed;

        if (!shouldShowBase || !Array.isArray(output_img_path) || output_img_path.length === 0) return null;

        const resultColor = isPositive ? 'green' : 'red';

        // Calculate totals
        const totalOK = output_img_path.reduce((sum, cameraData) => {
            const cameraLabel = Object.keys(cameraData)[0];
            const data = cameraData[cameraLabel];
            return sum + (data.OK || 0);
        }, 0);

        const totalNG = output_img_path.reduce((sum, cameraData) => {
            const cameraLabel = Object.keys(cameraData)[0];
            const data = cameraData[cameraLabel];
            return sum + (data.NG || 0);
        }, 0);

        const totalPM = output_img_path.reduce((sum, cameraData) => {
            const cameraLabel = Object.keys(cameraData)[0];
            const data = cameraData[cameraLabel];
            return sum + (data.PM || 0);
        }, 0);

        const overallResult = totalOK > 0 && totalNG === 0 ? positive :
            totalNG > 0 ? negative : 'Partial Match';
        // Transform data to separate by version
        const transformedData = [];
        console.log('output_img_path', output_img_path)



        output_img_path.forEach((cameraData) => {
            Object.entries(cameraData).forEach(([cameraLabel, data]) => {
                const results = data.results || {};

                Object.entries(results).forEach(([version, versionResult]) => {
                    // console.log('cameraLabel2334', cameraLabel)
                    // console.log('version', version)
                    // console.log('versionResult', versionResult)
                    // console.log('data', data)
                    // console.log('response_message[cameraLabel]', response_message[cameraLabel])
                    transformedData.push({
                        cameraLabel,
                        version,
                        versionResult,
                        data,
                        cameraResult: response_message[cameraLabel]
                    });
                });
            });
        });
        const hasImages = transformedData.some(
            item =>
                item.data?.captured_imaged && Object.keys(item.data.captured_imaged).length > 0 ||
                item.data?.res_img_path && Object.keys(item.data.res_img_path).length > 0
        );

        return (
            <Modal isOpen={isOpen} size="xl" scrollable={true} style={{ maxWidth: '1200px' }} modalClassName="modal-xl">
                <ModalBody style={{ padding: 0, maxHeight: 'calc(100vh - 100px)', overflow: 'auto' }}>
                    {/* Header Section - Now inside ModalBody */}
                    <div style={{
                        borderBottom: `3px solid ${resultColor}`,
                        backgroundColor: isPositive ? '#d4edda' : '#f8d7da',
                        padding: '16px 24px',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ color: resultColor, fontWeight: 'bold', fontSize: 18 }}>
                            Overall Testing Results
                        </div>

                    </div>

                    {/* Table Content */}
                    <div style={{ padding: '15px' }}>

                        <Table bordered striped size="sm" style={{ fontSize: 12, marginBottom: 0 }}>
                            <thead style={{ backgroundColor: '#f0f0f0' }}>
                                <tr>
                                    <th style={{ width: '12%' }}>Camera</th>
                                    <th style={{ width: '10%' }}>version</th>
                                    <th style={{ width: '10%' }}>System</th>
                                    <th style={{ width: '15%' }}>Your Assessment</th>
                                    {/* {(overall_testing || !region_wise_testing) && (<th style={{ width: '18%' }}>captured Image</th>)}
                                    {(overall_testing || !region_wise_testing) && (<th style={{ width: '18%' }}>Overall Result Image</th>)} */}
                                    {hasImages && <th style={{ width: '18%' }}>Captured Image</th>}
                                    {hasImages && <th style={{ width: '18%' }}>Overall Result Image</th>}

                                    <th style={{ width: '18%' }}>Regions</th>
                                </tr>
                            </thead>


                            {
                                console.log('transformedData', transformedData)
                            }




                            <tbody>
                                {transformedData.map((row, index) => {
                                    const bgColor =
                                        row.versionResult === "OK"
                                            ? "#d4edda"
                                            : row.versionResult === "NG"
                                                ? "#f8d7da"
                                                : "#fff3cd";

                                    const selectionKey = `${row.cameraLabel}-v${row.version}`;
                                    console.log('selectionKey', selectionKey)
                                    const isSelected = userSelections[selectionKey];

                                    const cameraResult = row.cameraResult;
                                    const data = row.data;
                                    console.log('data1986', data)
                                    let reg_res = "";

                                    if (data.region_results && Object.keys(data.region_results).length > 0) {
                                        reg_res = Object.values(data.region_results)
                                            .every(arr => arr.every(r => r.status === "OK")) ? "OK" : "NG";
                                    }

                                    return (
                                        <tr
                                            key={`${row.cameraLabel}-v${row.version}-${index}`}
                                            style={{
                                                backgroundColor: bgColor,
                                                borderBottom: "1px solid #ddd",
                                            }}
                                        >
                                            {/* Camera Name */}
                                            <td
                                                style={{
                                                    padding: "8px 12px",
                                                    fontWeight: "bold",
                                                    fontSize: 13,
                                                    border: "1px solid #ddd",
                                                    verticalAlign: "middle",
                                                }}
                                            >
                                                {row.cameraLabel}
                                            </td>

                                            {/* Version */}
                                            <td
                                                style={{
                                                    padding: "8px 12px",
                                                    fontWeight: "bold",
                                                    textAlign: "center",
                                                    border: "1px solid #ddd",
                                                    verticalAlign: "middle",
                                                }}
                                            >
                                                V{row.version}
                                            </td>

                                            <td
                                                style={{
                                                    padding: "8px 12px",
                                                    fontSize: 12,
                                                    border: "1px solid #ddd",
                                                    verticalAlign: "middle",
                                                    textAlign: "center",
                                                    fontWeight: "bold",
                                                    color: row.versionResult === "NG" ? "red" : row.versionResult === "OK" ? "green" : "inherit",
                                                }}
                                            >
                                                {(modelData.model_name === "SIFT" ||
                                                    modelData.model_name === "ANY_SIFT") && (
                                                        <div>SIFT: {data.sift_matches || 0}</div>
                                                    )}
                                                {row.versionResult}



                                                {/* <div style={{ marginTop: 3 }}>
                                                    Region: {reg_res}
                                                </div> */}

                                                {/* {data.compOnlyResult ? (
                                                    <div style={{ marginTop: 3 }}>
                                                        <strong>Comp:</strong> {data.compOnlyResult}
                                                    </div>
                                                ) :
                                                    (
                                                        <div style={{ marginTop: 3 }}>
                                                            Comp: {row.versionResult}
                                                        </div>
                                                    )
                                                }
                                                {reg_res && (
                                                    <div style={{ marginTop: 3 }}>
                                                        Region: {reg_res}
                                                    </div>
                                                )} */}
                                            </td>

                                            {/* User Assessment */}
                                            <td
                                                style={{
                                                    padding: "8px 12px",
                                                    textAlign: "center",
                                                    border: "1px solid #ddd",
                                                    verticalAlign: "middle",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: "8px",
                                                        justifyContent: "center",
                                                        fontSize: 11,
                                                    }}
                                                >
                                                    <label
                                                        style={{
                                                            cursor: "pointer",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            margin: 0,
                                                        }}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`result-${selectionKey}`}
                                                            value="OK"
                                                            defaultChecked={isSelected === "OK"}
                                                            onChange={(e) =>
                                                                handleSelectionChange(
                                                                    row.cameraLabel,
                                                                    row.version,
                                                                    e.target.value
                                                                )
                                                            }
                                                            style={{ marginRight: 4, cursor: "pointer" }}
                                                        />
                                                        Agree
                                                    </label>
                                                    <label
                                                        style={{
                                                            cursor: "pointer",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            margin: 0,
                                                        }}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`result-${selectionKey}`}
                                                            value="NG"
                                                            defaultChecked={isSelected === "NG"}
                                                            onChange={(e) =>
                                                                handleSelectionChange(
                                                                    row.cameraLabel,
                                                                    row.version,
                                                                    e.target.value
                                                                )
                                                            }
                                                            style={{ marginRight: 4, cursor: "pointer" }}
                                                        />
                                                        Disagree
                                                    </label>
                                                </div>
                                            </td>





                                            {/* {(overall_testing || !region_wise_testing) && ( */}
                                            {hasImages && (

                                                <>
                                                    <td
                                                        style={{
                                                            padding: "8px 12px",
                                                            textAlign: "center",
                                                            border: "1px solid #ddd",
                                                            verticalAlign: "middle",
                                                            position: "relative",
                                                        }}
                                                    >
                                                        {data.captured_imaged ? (
                                                            <div
                                                                style={{
                                                                    position: "relative",
                                                                    display: "inline-block",
                                                                    maxWidth: "100%",
                                                                }}
                                                            >
                                                                {console.log(' data.captured_imaged[row.version]', data.captured_imaged[row.version])}


                                                                <img
                                                                    src={showImage(
                                                                        data.captured_imaged[row.version] || data.captured_imaged[index]
                                                                    )}
                                                                    alt={`${row.cameraLabel}-v${row.version}`}
                                                                    style={{
                                                                        maxWidth: "100%",
                                                                        maxHeight: "100px",
                                                                        objectFit: "contain",
                                                                        border: "1px solid #ddd",
                                                                        display: "block",
                                                                    }}
                                                                    onError={(e) => (e.target.style.display = "none")}
                                                                />

                                                                {/* <canvas
                                                                    ref={(el) => {
                                                                        if (el) {
                                                                            canvasRef.current[
                                                                                `${row.cameraLabel}-v${row.version}`
                                                                            ] = el;
                                                                        }
                                                                    }}
                                                                    width={640}
                                                                    height={480}
                                                                    style={{
                                                                        position: "absolute",
                                                                        top: 0,
                                                                        left: 0,
                                                                        maxWidth: "100%",
                                                                        maxHeight: "100px",
                                                                        objectFit: "contain",
                                                                        pointerEvents: "none",
                                                                        border: "1px solid black",
                                                                    }}
                                                                /> */}
                                                            </div>
                                                        ) : (
                                                            <span style={{ color: "#999" }}>No image</span>
                                                        )}
                                                    </td>

                                                    <td
                                                        style={{
                                                            padding: "8px 12px",
                                                            textAlign: "center",
                                                            border: "1px solid #ddd",
                                                            verticalAlign: "middle",
                                                            position: "relative",
                                                        }}
                                                    >
                                                        {data.res_img_path ? (
                                                            <Image
                                                                src={showImage(
                                                                    data.res_img_path[row.version] || data.res_img_path
                                                                )}
                                                                alt={`${row.cameraLabel}-v${row.version}`}
                                                                style={{
                                                                    maxWidth: "100%",
                                                                    maxHeight: "100px",
                                                                    objectFit: "contain",
                                                                    border: "1px solid #ddd",
                                                                    display: "block",
                                                                }}
                                                                onError={(e) => (e.target.style.display = "none")}
                                                            />
                                                        ) : (
                                                            <span style={{ color: "#999" }}>No image</span>
                                                        )}
                                                    </td>
                                                </>
                                            )}




                                            {/* REGIONS */}
                                            <td
                                                style={{
                                                    padding: "8px 12px",
                                                    fontSize: 10,
                                                    border: "1px solid #ddd",
                                                    verticalAlign: "middle",
                                                }}
                                            >
                                                {region_wise_testing &&
                                                    data.region_results &&
                                                    data.region_results[row.version] &&
                                                    data.region_results[row.version].length > 0 ? (
                                                    <div>
                                                        {data.region_results[row.version].map((region, rIndex) => (
                                                            <div
                                                                key={`${row.cameraLabel}-v${row.version}-region-${rIndex}`}
                                                                style={{
                                                                    marginBottom: 3,
                                                                    padding: 2,
                                                                    borderBottom:
                                                                        rIndex <
                                                                            data.region_results[row.version].length - 1
                                                                            ? "1px solid #ddd"
                                                                            : "none",
                                                                }}
                                                            >
                                                                <div style={{ fontWeight: "bold" }}>
                                                                    {rIndex + 1}. {region.name}
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        color: region.status === "OK" ? "green" : "red",
                                                                    }}
                                                                >
                                                                    {region.status}: {region.value}
                                                                </div>
                                                                {region.output_img && (
                                                                    <Image
                                                                        src={showImage(region.output_img)}
                                                                        alt={`Region ${region.name}`}
                                                                        style={{
                                                                            maxWidth: "80px",
                                                                            maxHeight: "50px",
                                                                            objectFit: "contain",
                                                                            marginTop: 2,
                                                                            border: "1px solid #ddd",
                                                                        }}
                                                                        onError={(e) => (e.target.style.display = "none")}
                                                                    />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: "#999" }}>No regions</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>



                        </Table>
                    </div>

                    <div style={{
                        borderTop: `2px solid ${resultColor}`,
                        padding: '12px 24px',
                        position: 'sticky',
                        bottom: 0,
                        backgroundColor: '#fff',
                        zIndex: 10,
                        display: 'flex',
                        justifyContent: 'flex-end'
                    }}>
                        <Button color="primary" onClick={handleSubmit} style={{ fontWeight: 'bold' }}>
                            Submit Assessment
                        </Button>
                    </div>
                </ModalBody>
            </Modal>
        );

    }, [
        isOpen,
        response_message,
        manual_abort,
        time_elapsed,
        output_img_path,
        region_wise_testing,
        overall_testing,
        positive,
        negative,
        modelData,
        showImage,
        userSelections,
        handleSelectionChange,
        handleSubmit,
        toggleModal
    ]);



    const uniqueCameras = cameraList.filter(
        (cam, index, self) =>
            index === self.findIndex((c) => c.originalLabel === cam.originalLabel || c.label === cam.label)
    );
    console.log('uniqueCameras', uniqueCameras)


    useEffect(() => {
        console.log('detectionData', detectionData)
        if (!detectionData || !detectionData[0]) return;

        // Small delay to ensure canvases are mounted
        const timer = setTimeout(() => {
            console.log('Drawing canvases now...');
            console.log('Available canvas refs:', Object.keys(canvasRef.current));

            const newCanvasUrls = {};
            const allCameras = detectionData[0];

            Object.entries(allCameras).forEach(([cameraLabel, cameraData]) => {
                console.log(`Processing camera: ${cameraLabel}`, cameraData);

                if (cameraData.region_results) {
                    Object.entries(cameraData.region_results).forEach(([version, regions]) => {
                        const canvasKey = `${cameraLabel}-v${version}`;
                        const canvas = canvasRef.current[canvasKey];

                        console.log(`Looking for canvas: ${canvasKey}`, canvas ? 'FOUND ✅' : 'NOT FOUND ❌');

                        if (!canvas) {
                            console.warn(`Canvas not found for ${canvasKey}`);
                            return;
                        }

                        console.log(`Drawing on canvas for ${canvasKey}`);

                        const ctx = canvas.getContext('2d');
                        canvas.width = 640;
                        canvas.height = 480;
                        ctx.clearRect(0, 0, canvas.width, canvas.height);

                        // Scaling
                        const originalWidth = 1920;
                        const originalHeight = 1080;
                        const scaleX = 640 / originalWidth;
                        const scaleY = 480 / originalHeight;

                        // Draw rectangles
                        regions.forEach((region) => {
                            const coords = region.coordinates;
                            const scaledX = coords.x * scaleX;
                            const scaledY = coords.y * scaleY;
                            const scaledWidth = coords.width * scaleX;
                            const scaledHeight = coords.height * scaleY;

                            const strokeColor = region.status === 'OK' ? 'green' : 'red';

                            // Draw rectangle
                            ctx.lineWidth = 6;
                            ctx.strokeStyle = strokeColor;
                            ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

                            // Draw text
                            ctx.font = 'bold 16px Arial';
                            ctx.lineWidth = 4;
                            ctx.strokeStyle = 'black';
                            ctx.strokeText(region.name, scaledX + 10, scaledY + 25);
                            ctx.fillStyle = 'white';
                            ctx.fillText(region.name, scaledX + 10, scaledY + 25);

                            const statusText = `${region.status}: ${region.value}`;
                            ctx.strokeText(statusText, scaledX + 10, scaledY + 45);
                            ctx.fillStyle = strokeColor;
                            ctx.fillText(statusText, scaledX + 10, scaledY + 45);
                        });

                        // Store canvas URL
                        const dataUrl = canvas.toDataURL();
                        newCanvasUrls[canvasKey] = dataUrl;
                        console.log(`✅ Canvas URL created for ${canvasKey}`);
                    });
                }
            });

            console.log('All canvas URLs:', Object.keys(newCanvasUrls));
            setCanvasUrlsByCamera(newCanvasUrls);
        }, 100); // 100ms delay to ensure DOM is ready

        return () => clearTimeout(timer);
    }, [detectionData]); // Re-run when detectionData changes

    // UseEffect for component did mount
    useEffect(() => {
        const db_info = JSON.parse(localStorage.getItem('db_info'));
        ImageUrl = `${image_url}${db_info?.db_name}/`;

        const zoom_values = JSON.parse(sessionStorage.getItem('zoom_values'));
        if (zoom_values) {
            setZoom_value(zoom_values);
        }

        // Retrieve data from localStorage
        const getModelData = localStorage.getItem('modelData');
        // console.log('getModelData', getModelData)
        if (getModelData === undefined || getModelData === null) {
            // history.push('comp_info');
            return;
        } else {
            const parsedModelData = JSON.parse(getModelData);
            console.log('parsedModelData', parsedModelData)
            if (parsedModelData?.detection_type) {
                setSlt_od_method(parsedModelData.detection_type);
                setSelectedRegions(parsedModelData.regions || []);
            }


            const configData = parsedModelData.config || [];
            const modelDataInfo = parsedModelData.testCompModelVerInfo;
            console.log('modelDataInfo', modelDataInfo)
            const batch_no = parsedModelData.batch_no;
            const gotoPageInfo = parsedModelData.page;
            let test_duration = Number(configData[0].train_acc_timer_per_sample) * Number(configData[0].test_samples);
            showAlertTimer(parseInt(test_duration));

            let region_test_type = '';
            let overall_testing = true;
            let region_wise_testing = false;
            if (parsedModelData.option) {
                console.log('option value: ', parsedModelData);
                region_test_type = parsedModelData.option;
                overall_testing = parsedModelData.overall_testing;
                region_wise_testing = parsedModelData.region_wise_testing;
            }

            setModelData(modelDataInfo);
            setConfig(configData);
            setPositive(configData[0].positive);
            setNegative(configData[0].negative);
            setPosble_match(configData[0].posble_match);
            setCapture_duration(Number(configData[0].countdown));
            setTesting_duration(test_duration);
            setShow_timer(true);
            setGotoPage(gotoPageInfo);
            setRegion_test_type(region_test_type);
            setOverall_testing(overall_testing);
            setRegion_wise_testing(region_wise_testing);
            let cameras = [];
            if (Array.isArray(modelDataInfo) && modelDataInfo.length > 1) {
                cameras = modelDataInfo
                    .map(item => item.camera)
                    .filter(cam => cam?.checked === true);
            } else if (modelDataInfo[0].camera) {
                cameras = [modelDataInfo[0].camera]

            }


            console.log('camerascameras', cameras)

            setCameraList(cameras);

            batchInfo(modelDataInfo, configData, overall_testing, region_wise_testing);

            if (parsedModelData.config[0].inspection_type === 'Manual') {
                cont_apiCall();
            } else {
                if (startCapture) {
                    setTimeout(() => { appCall(); }, 2000);
                }
            }

            // Add device change listener
            navigator.mediaDevices.addEventListener('devicechange', checkWebcam);
            // Initial check
            checkWebcam();
            showRefOutline(modelDataInfo);

            // getCameraPosition(modelDataInfo);


            // window.addEventListener('beforeunload', handleBeforeUnload);
            window.addEventListener('popstate', handlePopState);
            window.history.pushState(null, null, window.location.pathname);
            // }
            // }, 
            // [history, showAlertTimer, batchInfo, cont_apiCall, appCall, startCapture, checkWebcam, handleBeforeUnload, handlePopState]);
        }
    }, []);

    // UseEffect for component did update
    useEffect(() => {
        if (response_message && canvasRef2.current) {
            console.log('canvasRef2 present 02 : ', canvasRef2.current);
            copyRectangle();
        }
        if (!response_message) {
            setImageLoaded(false);
            setRegionImageLoaded(false);
            setCompImageLoaded(false);
            setRegionImagesLoaded({});
        }
    }, [response_message, copyRectangle]);


    // Missing functions that need to be implemented
    const uniqness_checking = useCallback(() => {
        // Implementation needed based on original code
        console.log('uniqness_checking function needs implementation');
    }, []);

    const videoConstraints = {
        width: DEFAULT_RESOLUTION.width,
        height: DEFAULT_RESOLUTION.height,
        facingMode: "user"
    };

    const rowsToDisplay = showAll ? modelData : modelData.slice(0, 1);
    const groupedData = modelData.reduce((acc, item) => {
        if (!acc[item.stage_id]) {
            acc[item.stage_id] = {
                stage_name: item.stage_name,
                stage_code: item.stage_code,
                model_name: item.model_name,
                type: item.type,
                cameras: [],
            };
        }
        acc[item.stage_id].cameras.push(item);
        return acc;
    }, {});



    const getReferenceImageForCamera = useCallback((cameraLabel, modelVer) => {
        console.log('cameraLabel, modelVer', cameraLabel, modelVer, modelData)
        if (!modelData || !Array.isArray(modelData)) return "";

        // normalize label for consistent comparison
        const normalizedLabel = cameraLabel.trim().toLowerCase().replace(/\s+/g, "_");

        // find the model entry that matches both camera label and version
        const cameraEntry = modelData.find(item =>
            item.camera?.label?.trim().toLowerCase().replace(/\s+/g, "_") === normalizedLabel &&
            item.camera?.model_ver === modelVer
        );
        console.log('cameraEntry', cameraEntry)

        if (!cameraEntry) {
            console.log(`No model data found for ${cameraLabel} with model_ver ${modelVer}`);
            return "";
        }

        // within that camera’s datasets, get the first OK image
        const okImage = cameraEntry.datasets?.find(d => d.type === "OK");

        if (!okImage) {
            console.log(`No OK dataset found for ${cameraLabel} with model_ver ${modelVer}`);
            return "";
        }

        // construct full path using showImage()
        return showImage(okImage.image_path);
    }, [modelData, showImage]);


    return (
        <>
            {(full_screen_loading || approving_model_inprogress) && <FullScreenLoader />}

            <div className='page-content'>
                <Row className="mb-3">
                    <Col xs={9}>
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="mb-0 mt-2 m-2 font-size-14 fw-bold">ADMIN ACCURACY TESTING</div>
                        </div>
                    </Col>

                </Row>

                <Container fluid>
                    <Card>
                        <CardBody>



                            <div>
                                {Object.values(groupedData).map((stage) => {
                                    const camerasToShow = showAll
                                        ? stage.cameras
                                        : stage.cameras.slice(0, 1);

                                    return (
                                        <>
                                            {/* Stage info div */}
                                            <div key={stage.stage_name} className="mb-4">
                                                <Row className="d-flex flex-wrap justify-content-start align-items-center gap-3 mb-2">
                                                    <Col xs="12" lg="auto">
                                                        <CardText className="mb-0">
                                                            <span className="me-2 font-size-12">Stage Name :</span>
                                                            {stage.stage_name}
                                                        </CardText>
                                                    </Col>
                                                    <Col xs="12" lg="auto">
                                                        <CardText className="mb-0">
                                                            <span className="me-2 font-size-12">Stage Code :</span>
                                                            {stage.stage_code}
                                                        </CardText>
                                                    </Col>
                                                    <Col xs="12" lg="auto">
                                                        <CardText className="mb-0">
                                                            <span className="me-2 font-size-12">Model Name :</span>
                                                            {stage.model_name}
                                                        </CardText>
                                                    </Col>
                                                    <Col xs="12" lg="auto">
                                                        <CardText className="mb-0">
                                                            <span className="me-2 font-size-12">Camera and Model version :</span>
                                                            <i
                                                                className="bx bx-info-circle"
                                                                onClick={() => setModalCenter(true)}
                                                                style={{ cursor: "pointer" }}
                                                            ></i>
                                                        </CardText>
                                                    </Col>
                                                </Row>
                                            </div>

                                            <Modal isOpen={modal_center} centered={true}>
                                                <div className="modal-header">
                                                    <h5 className="modal-title mt-0">Camera and Model version :</h5>
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

                                                <div className="table-responsive">
                                                    <Table bordered hover striped className="text-center">
                                                        <thead className="thead-dark">
                                                            <tr>
                                                                <th>Camera</th>
                                                                {Object.entries(
                                                                    stage.cameras.reduce((acc, cam) => {
                                                                        const label = cam.camera.label;
                                                                        if (!acc[label]) acc[label] = [];
                                                                        acc[label].push(cam.model_ver);
                                                                        return acc;
                                                                    }, {})
                                                                ).map(([label]) => (
                                                                    <th key={label}>{label}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <th>Version</th>
                                                                {Object.entries(
                                                                    stage.cameras.reduce((acc, cam) => {
                                                                        const label = cam.camera.label;
                                                                        if (!acc[label]) acc[label] = [];
                                                                        acc[label].push(cam.model_ver);
                                                                        return acc;
                                                                    }, {})
                                                                ).map(([label, versions]) => (
                                                                    <td key={label}>
                                                                        {versions.map((ver, idx) => (
                                                                            <span key={idx}>
                                                                                {'V'}
                                                                                {ver}
                                                                                {idx < versions.length - 1 && ', '}
                                                                            </span>
                                                                        ))}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        </tbody>
                                                    </Table>
                                                </div>
                                            </Modal>
                                        </>
                                    );
                                })}
                            </div>



                            <div>
                                <div className='d-flex flex-column my-2' style={{ minHeight: 'auto' }}>

                                    <div className='d-flex justify-content-between align-items-center'>

                                        {outline_checkbox && (
                                            <div className='d-flex flex-wrap justify-content-start align-items-center gap-3 me-auto'>
                                                <FormGroup check>
                                                    <Label check>
                                                        <Input
                                                            type="checkbox"
                                                            checked={show_outline}
                                                            onChange={() => showOutline()}
                                                        />
                                                        <span style={{ userSelect: 'none' }}>Show Outline</span>
                                                    </Label>
                                                </FormGroup>
                                                {show_outline && (
                                                    <div className='d-flex align-items-center'>
                                                        <Label className='my-1'>Outline Color : </Label>
                                                        <div className='d-flex gap-2'>
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
                                                                    onClick={() => { newOutlineChange(otline); }}
                                                                ></Button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {
                                            console.log('config', config)
                                        }


                                        {!cameraDisconnected && (
                                            <div className="position-relative w-100">
                                                {config.map((data, index) =>
                                                    data.inspection_type === "Manual" && show ? (
                                                        <Row key={index} className="mb-3 align-items-center">
                                                            <Col xs={12} lg={9}>
                                                                <button
                                                                    className="btn btn-primary btn-sm me-2 w-md"
                                                                    onClick={async () => {
                                                                        await adminAccTesting(data);
                                                                    }}
                                                                >
                                                                    Start All Cameras
                                                                </button>
                                                            </Col>

                                                            <Col
                                                                xs={12}
                                                                lg={3}
                                                                className="position-absolute end-0 d-flex align-items-center justify-content-end"
                                                                style={{ right: 0 }}
                                                            >
                                                                {extendTimer && (
                                                                    <button
                                                                        className="btn btn-primary btn-sm me-2 w-md"
                                                                        onClick={() => ExtendTimer()}
                                                                    >
                                                                        EXTEND TIMER
                                                                    </button>
                                                                )}
                                                                <button
                                                                    className="btn btn-danger btn-sm w-md"
                                                                    onClick={() => manual_abortTesting()}
                                                                >
                                                                    ABORT
                                                                </button>
                                                            </Col>
                                                        </Row>
                                                    ) : null
                                                )}
                                            </div>
                                        )}

                                    </div>
                                </div>







                                <div>

                                    <div className='d-flex justify-content-between align-items-center'>
                                        <div className='d-flex gap-2 justify-content-start align-items-center'>
                                            <div className='font-size-14 fw-bold'>Time to complete:</div>
                                            {show_timer && config.map((data, index) => (
                                                <div className='font-size-14 fw-bold' key={index}>
                                                    {Number(sample_count) !== Number(data.test_samples) && (
                                                        <CountdownTimer
                                                            hideDay={true}
                                                            hideHours={false}
                                                            count={testing_duration}
                                                            onEnd={() => { onTimeup(); }}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className='d-flex gap-2 justify-content-end align-items-center'>
                                            {config.map((data, index) => (
                                                <div className='font-size-14 fw-bold' key={index}>
                                                    <Label>Sample completed: {sample_count} / {data.test_samples}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>







                                    <div style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(600px, 1fr))",
                                        gap: "24px",
                                        padding: "20px"
                                    }}>
                                        {uniqueCameras.map((camera) => (
                                            <div
                                                key={camera.originalLabel}
                                                style={{
                                                    display: "flex",
                                                    gap: "16px",
                                                    border: "1px solid #e0e0e0",
                                                    padding: "16px",
                                                    borderRadius: "12px",
                                                    backgroundColor: "#ffffff",
                                                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                                    minHeight: "500px"
                                                }}
                                            >
                                                {/* Reference Image Column */}
                                                <div style={{
                                                    flex: 1,
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    minWidth: 0
                                                }}>
                                                    {/* Spacer to match training accuracy height */}
                                                    {show_acc && (
                                                        <div style={{
                                                            height: Object.keys(train_accuracy)
                                                                .filter((cameraVersion) => cameraVersion.startsWith(`${camera.label}-V`))
                                                                .length > 0
                                                                ? `${Object.keys(train_accuracy).filter((cameraVersion) => cameraVersion.startsWith(`${camera.label}-V`)).length * 29}px`
                                                                : '0px'
                                                        }} />
                                                    )}

                                                    {/* Header */}
                                                    <div style={{
                                                        padding: "12px",
                                                        backgroundColor: "#f5f5f5",
                                                        borderRadius: "8px",
                                                        textAlign: "center",
                                                        marginBottom: "12px"
                                                    }}>
                                                        <div style={{
                                                            fontSize: "14px",
                                                            fontWeight: "600",
                                                            color: "#333"
                                                        }}>
                                                            REFERENCE IMAGE
                                                        </div>
                                                        <div style={{
                                                            fontSize: "12px",
                                                            color: "#666",
                                                            marginTop: "4px"
                                                        }}>
                                                            {camera.label}
                                                        </div>
                                                    </div>

                                                    {/* Image Container with Fixed Aspect Ratio */}
                                                    <div style={{
                                                        flex: 1,
                                                        position: "relative",
                                                        width: "100%",
                                                        paddingBottom: "75%", // 4:3 aspect ratio
                                                        backgroundColor: "#fafafa",
                                                        borderRadius: "8px",
                                                        overflow: "hidden",
                                                        border: "1px solid #e0e0e0"
                                                    }}>
                                                        {getReferenceImageForCamera(camera.label, camera.model_ver) ? (
                                                            <img
                                                                src={getReferenceImageForCamera(camera.label, camera.model_ver)}
                                                                alt={`Reference for ${camera.label}`}
                                                                style={{
                                                                    position: "absolute",
                                                                    top: 0,
                                                                    left: 0,
                                                                    width: "100%",
                                                                    height: "100%",
                                                                    objectFit: "cover"
                                                                }}
                                                                onError={(e) => {
                                                                    console.error(`Reference image failed to load for ${camera.label}:`, e.target.src);
                                                                }}
                                                                onLoad={() => {
                                                                    console.log(`Reference image loaded successfully for camera: ${camera.label}`);
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
                                                                fontSize: "14px",
                                                                textAlign: "center",
                                                                padding: "20px"
                                                            }}>
                                                                No reference image available
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
                                                    {/* Training Accuracy Display */}
                                                    {show_acc && Object.keys(train_accuracy)
                                                        .filter((cameraVersion) => cameraVersion.startsWith(`${camera.label}-V`))
                                                        .map((cameraVersion) => {
                                                            const version = cameraVersion.split('-V')[1];
                                                            const accuracy = parseFloat(train_accuracy[cameraVersion] || 0).toFixed(2);
                                                            return (
                                                                <div
                                                                    key={cameraVersion}
                                                                    style={{
                                                                        color: train_accuracy[cameraVersion] === 100 ? '#52c41a' : '#ff4d4f',
                                                                        fontSize: "13px",
                                                                        fontWeight: "500",
                                                                        marginBottom: "8px"
                                                                    }}
                                                                >
                                                                    Camera {camera.label} V{version} Training Accuracy: {accuracy}%
                                                                </div>
                                                            );
                                                        })}

                                                    {/* Header */}
                                                    <div style={{
                                                        padding: "12px",
                                                        backgroundColor: "#e3f2fd",
                                                        borderRadius: "8px",
                                                        textAlign: "center",
                                                        marginBottom: "12px"
                                                    }}>
                                                        <div style={{
                                                            fontSize: "14px",
                                                            fontWeight: "600",
                                                            color: "#1976d2"
                                                        }}>
                                                            LIVE
                                                        </div>
                                                        <div style={{
                                                            fontSize: "12px",
                                                            color: "#666",
                                                            marginTop: "4px"
                                                        }}>
                                                            {camera.label}
                                                        </div>
                                                    </div>

                                                    {/* Camera Container with Fixed Aspect Ratio */}
                                                    <div style={{
                                                        flex: 1,
                                                        position: "relative",
                                                        width: "100%",
                                                        paddingBottom: "75%", // 4:3 aspect ratio
                                                        backgroundColor: "#000",
                                                        borderRadius: "8px",
                                                        overflow: "hidden",
                                                        border: "1px solid #e0e0e0"
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
                                                                    padding: "20px",
                                                                    border: "2px solid #000",
                                                                    borderRadius: "8px"
                                                                }}>
                                                                    <div style={{ textAlign: "center" }}>
                                                                        <h5 style={{ fontWeight: "600", marginBottom: "16px" }}>
                                                                            Webcam Disconnected
                                                                        </h5>
                                                                        <Spinner color="primary" className="mb-3" />
                                                                        <h6 style={{ fontWeight: "500", marginTop: "16px" }}>
                                                                            Please check your webcam connection...
                                                                        </h6>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    {/* Outline Overlay */}
                                                                    {show_outline && getCurrentOutlinePath(camera.originalLabel) && (
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

                                                                    {/* Webcam Component */}
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

                                                                    {/* Canvas Overlay */}
                                                                    <canvas
                                                                        ref={(el) => { if (el) canvasRef.current[camera.originalLabel] = el; }}
                                                                        width={640}
                                                                        height={480}
                                                                        style={{
                                                                            display: !show_region_webcam ? 'none' : 'block',
                                                                            position: 'absolute',
                                                                            top: 0,
                                                                            left: 0,
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            zIndex: 1,
                                                                            pointerEvents: 'none'
                                                                        }}
                                                                    />

                                                                    {/* Camera Label Badge */}


                                                                    {/* Center Overlay Content */}
                                                                    <div style={{
                                                                        position: "absolute",
                                                                        top: "50%",
                                                                        left: "50%",
                                                                        transform: "translate(-50%, -50%)",
                                                                        zIndex: 4,
                                                                        textAlign: "center",
                                                                        width: "90%"
                                                                    }}>
                                                                        {/* Messages */}
                                                                        {show && msg && (
                                                                            <div style={{
                                                                                color: msg === "Place the object and press start" ? 'white' : '#fff',
                                                                                fontSize: "16px",
                                                                                fontWeight: "600",
                                                                                textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                                                                                marginBottom: "12px"
                                                                            }}>
                                                                                {msg}
                                                                            </div>
                                                                        )}

                                                                        {showdata && mssg && (
                                                                            <div style={{
                                                                                color: mssg === "Place the object" ? 'white' : '#fff',
                                                                                fontSize: "18px",
                                                                                fontWeight: "bold",
                                                                                textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                                                                                marginBottom: "12px"
                                                                            }}>
                                                                                {mssg}
                                                                            </div>
                                                                        )}

                                                                        {/* Status Messages */}
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
                                                                                fontSize: "20px",
                                                                                fontWeight: "bold",
                                                                                textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                                                                                marginBottom: "12px"
                                                                            }}>
                                                                                {res_message[camera.label]}
                                                                            </div>
                                                                        )}

                                                                        {/* Result Icons */}
                                                                        {showresult && response_message && response_message[camera.label] && (
                                                                            <div style={{
                                                                                display: "flex",
                                                                                flexDirection: "column",
                                                                                alignItems: "center",
                                                                                gap: "12px",
                                                                                marginBottom: "12px"
                                                                            }}>
                                                                                <span style={{
                                                                                    fontWeight: "bold",
                                                                                    color: "#fff",
                                                                                    textShadow: "2px 2px 4px rgba(0,0,0,0.8)"
                                                                                }}>
                                                                                    {camera.label}
                                                                                </span>

                                                                                {response_message[camera.label] === "OK" && (
                                                                                    <CheckCircleOutlined style={{
                                                                                        fontSize: '80px',
                                                                                        color: '#52c41a',
                                                                                        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
                                                                                    }} />
                                                                                )}

                                                                                {response_message[camera.label] === "NG" && (
                                                                                    <CloseCircleOutlined style={{
                                                                                        fontSize: '80px',
                                                                                        color: '#ff4d4f',
                                                                                        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
                                                                                    }} />
                                                                                )}
                                                                            </div>
                                                                        )}

                                                                        {/* Countdown Timer */}
                                                                        {showdata && (
                                                                            <div style={{
                                                                                display: "inline-block",
                                                                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                                                                padding: "12px 20px",
                                                                                borderRadius: "8px",
                                                                                boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                                                                            }}>
                                                                                <CountdownTimer
                                                                                    backgroundColor="transparent"
                                                                                    hideDay={true}
                                                                                    hideHours={true}
                                                                                    count={capture_duration}
                                                                                    onEnd={() => { onTimeupCourse(); }}
                                                                                />
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

                            </div>
                        </CardBody>
                    </Card>
                </Container>

                {time_elapsed && (
                    <SweetAlert
                        title="Abort"
                        confirmBtnText="Ok"
                        onConfirm={() => navigation()}
                        closeOnClickOutside={false}
                        style={{ zIndex: 998 }}
                    >
                        <div style={{ fontSize: '22px' }}>
                            Testing process aborted
                        </div>
                    </SweetAlert>
                )}

                {manual_abort && (
                    <SweetAlert
                        showCancel
                        title="Abort - User Request"
                        cancelBtnBsStyle="success"
                        confirmBtnText="Yes"
                        cancelBtnText="No"
                        onConfirm={() => navigation()}
                        onCancel={() => setManual_abort(false)}
                        closeOnClickOutside={false}
                        style={{ zIndex: 997 }}
                    >
                        <div style={{ fontSize: '22px' }}>
                            This will stop the testing process
                        </div>
                        <div style={{ fontSize: '22px' }}>
                            Do you want stop the testing?
                        </div>
                    </SweetAlert>
                )}

                {renderResultSweetAlert({ type: 'positive' })}
                {renderResultSweetAlert({ type: 'negative' })}


                {
                    console.log('response_messageresponse_message', response_message, posble_match, manual_abort, time_elapsed)
                }





                {response_message === posble_match &&
                    !manual_abort &&
                    !time_elapsed && (
                        <SweetAlert
                            showCancel
                            title=""
                            cancelBtnBsStyle="danger"
                            cancelBtnText="No"
                            confirmBtnText="Yes"
                            onConfirm={() => ask_show('yes')}
                            onCancel={() => ask_show('no')}
                            closeOnClickOutside={false}
                            style={{ zIndex: 995 }}
                        >
                            <div style={{
                                fontSize: '20px',
                                color: response_message === posble_match ? 'orange' : null
                            }}>
                                Result: {response_message}{" "}{response_value}
                            </div>
                            <div style={{ fontSize: '22px' }}>
                                System is unable to exactly classify this sample. Please choose your result
                            </div>
                        </SweetAlert>
                    )}



                {/* {config.map((data, index) => {
                    if (Number(sample_count) !== Number(data.test_samples) || manual_abort || time_elapsed) return null;

                    const accuracyLabel = res_mode === "ok" ? config[0].positive : res_mode === "ng" ? config[0].negative : 'Training Accuracy';
                    const isFullAccuracy = train_accuracy === 100;
                    const allKeys = Array.from(
                        new Set([
                            ...Object.keys(get_a || {}),
                            ...Object.keys(get_b || {}),
                            ...Object.keys(get_c || {}),
                            ...Object.keys(get_d || {}),
                            ...Object.keys(get_e || {}),
                            ...Object.keys(get_f || {}),
                            ...Object.keys(get_g || {}),
                            ...Object.keys(get_h || {}),
                            ...Object.keys(get_i || {}),
                        ])
                    );

                    return (
                        <div key={index}>
                            <SweetAlert
                                title=""
                                confirmBtnText="Ok"
                                onConfirm={() => isFullAccuracy ? navigateto() : navigate()}
                                style={{ zIndex: 993 }}
                            >
                                <div>Total tested samples: {data.test_samples}</div>
                                <Label>{accuracyLabel} Result</Label>
                                <div className="table-responsive">

                                    <Table bordered style={{ tableLayout: 'auto', width: '100%', fontSize: '14px' }}>


                                        <thead>
                                            <tr>
                                                <th>Camera</th>
                                                <th>Version</th>
                                                <th>System Result</th>
                                                <th>Agreed by QC</th>
                                                <th>Disagreed by QC</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allKeys.map((key) => {
                                                const [camera, version] = key.split('-V');
                                                return (
                                                    <React.Fragment key={key}>
                                                        <tr>
                                                            <td rowSpan="2" style={{ verticalAlign: 'middle', fontWeight: 'bold' }}>{camera}</td>
                                                            <td rowSpan="2" style={{ verticalAlign: 'middle' }}>{version}</td>
                                                            <td>{get_a?.[key] ?? '0'}</td>
                                                            <td>{get_d?.[key] ?? '0'}</td>
                                                            <td>{get_g?.[key] ?? '0'}</td>
                                                        </tr>

                                                        <tr>
                                                            <td>{get_b?.[key] ?? '0'}</td>
                                                            <td>{get_e?.[key] ?? '0'}</td>
                                                            <td>{get_h?.[key] ?? '0'}</td>
                                                        </tr>
                                                    </React.Fragment>
                                                );
                                            })}
                                        </tbody>

                                    </Table>
                                </div>

                                <Label style={{ color: isFullAccuracy ? 'green' : 'red', fontSize: '18px' }}>
                                    {accuracyLabel}: {parseFloat(train_accuracy).toFixed(2)}%
                                </Label>
                                <Label>
                                    {isFullAccuracy ? 'Model is ready for deployment.' :
                                        "Since accuracy is not equal to 100% based on QC's response, system will retrain the model using 'disagreed' samples."}
                                </Label>
                            </SweetAlert>
                        </div>
                    );
                })} */}


                <AccuracyModal
                    config={config}
                    sample_count={sample_count}
                    manual_abort={manual_abort}
                    time_elapsed={time_elapsed}
                    res_mode={res_mode}
                    train_accuracy={train_accuracy}
                    get_a={get_a}
                    get_b={get_b}
                    get_c={get_c}
                    get_d={get_d}
                    get_e={get_e}
                    get_f={get_f}
                    get_g={get_g}
                    get_h={get_h}
                    get_i={get_i}
                    navigate={navigate}
                    navigateto={navigateto}
                />





                {/* {config.map((data, index) => (
                    Number(sample_count) === Number(data.test_samples) &&
                    train_accuracy !== 100 &&
                    !manual_abort &&
                    !time_elapsed && (
                        <div key={index}>
                            <SweetAlert
                                title=""
                                confirmBtnText="Ok"
                                onConfirm={() => navigate()}
                                style={{ zIndex: 993 }}
                            >
                                <div>
                                    Total tested samples: {data.test_samples}
                                </div>
                                <Label>
                                    {res_mode === "ok" ? `${config[0].positive}'s Training Accuracy ` :
                                        res_mode === "ng" ? `${config[0].negative}'s Training Accuracy ` :
                                            'Training Accuracy '} Result
                                </Label>
                                <div className="table-responsive">
                                    <Table>
                                        <thead>
                                            <tr>
                                                <th></th>
                                                <th>{data.positive}</th>
                                                <th>{data.negative}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <th>System result</th>
                                                <td>{get_a}</td>
                                                <td>{get_b}</td>
                                            </tr>
                                            <tr>
                                                <th>Agreed by Qc</th>
                                                <td>{get_d}</td>
                                                <td>{get_e}</td>
                                            </tr>
                                            <tr>
                                                <th>Disagreed by Qc</th>
                                                <td>{get_g}</td>
                                                <td>{get_h}</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </div>
                                <Label style={{ color: 'red', fontSize: '18px' }}>
                                    {res_mode === "ok" ? `${config[0].positive}'s Training Accuracy: ` :
                                        res_mode === "ng" ? `${config[0].negative}'s Training Accuracy: ` :
                                            'Training Accuracy: '}
                                    {parseFloat(train_accuracy).toFixed(2)} %, {" "}
                                </Label>
                                <Label>
                                    {" Since accuracy is not equal to 100% based on QC's response, system will retrain the model for this component using the 'disagreed' samples to improve accuracy."}
                                </Label>
                            </SweetAlert>
                        </div>
                    )
                ))} */}


                {/* {config.map((data, index) => (
                    Number(sample_count) === Number(data.test_samples) &&
                    train_accuracy === 100 &&
                    !manual_abort &&
                    !time_elapsed && (
                        <div key={index}>
                            <SweetAlert
                                title=""
                                confirmBtnText="ok"
                                onConfirm={() => navigateto()}
                                style={{ zIndex: 992 }}
                            >
                                <div>
                                    Total tested samples: {data.test_samples}
                                </div>
                                <Label>
                                    {res_mode === "ok" ? `${config[0].positive}'s Training Accuracy ` :
                                        res_mode === "ng" ? `${config[0].negative}'s Training Accuracy ` :
                                            'Training Accuracy '} Result
                                </Label>
                                <div className="table-responsive">
                                    <Table>
                                        <thead>
                                            <tr>
                                                <th></th>
                                                <th>{data.positive}</th>
                                                <th>{data.negative}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <th>System result</th>
                                                <td>{get_a}</td>
                                                <td>{get_b}</td>
                                            </tr>
                                            <tr>
                                                <th>Agreed by Qc</th>
                                                <td>{get_d}</td>
                                                <td>{get_e}</td>
                                            </tr>
                                            <tr>
                                                <th>Disagreed by Qc</th>
                                                <td>{get_g}</td>
                                                <td>{get_h}</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </div>
                                <Label style={{ color: 'green', fontSize: '18px' }}>
                                    {res_mode === "ok" ? `${config[0].positive}'s Training Accuracy: ` :
                                        res_mode === "ng" ? `${config[0].negative}'s Training Accuracy: ` :
                                            'Training Accuracy: '}
                                    {train_accuracy}%, {" "}
                                </Label>
                                <Label>
                                    Model is ready for deployment.
                                </Label>
                            </SweetAlert>
                        </div>
                    )
                ))} */}

                {timeExtend && (
                    <SweetAlert
                        showCancel
                        title="Do you want to extend the timer?"
                        confirmBtnText="Yes"
                        cancelBtnText="No"
                        onConfirm={() => timerExtention()}
                        onCancel={() => abortTesting()}
                        closeOnClickOutside={false}
                        style={{ zIndex: 999 }}
                    >
                    </SweetAlert>
                )}

                {ReTrain && (
                    <SweetAlert
                        title="Your ReTrain Limit Exceeded"
                        confirmBtnText="OK"
                        onConfirm={() => reTrainLimit()}
                    >
                        <div className='mt-2'>
                            Training has been attempted more than {config[0].training_cycle} times
                        </div>
                    </SweetAlert>
                )}
            </div>
        </>
    );
};

StageAdminAccTesting.propTypes = {
    history: PropTypes.any.isRequired
};

export default StageAdminAccTesting;





