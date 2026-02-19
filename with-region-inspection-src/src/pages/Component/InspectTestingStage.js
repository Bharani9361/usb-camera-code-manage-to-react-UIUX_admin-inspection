import React, { useState, useEffect, useRef, useCallback } from "react";
import MetaTags from 'react-meta-tags';
import { useHistory } from 'react-router-dom';
import PropTypes from "prop-types";

import {
    Card, Col, Container, Row, CardBody, CardTitle,
    Label, Button, Table, Nav, NavItem, NavLink,
    TabContent, TabPane, Modal, FormGroup, Spinner,
    Input
} from "reactstrap";
import axios from "axios";
import Webcam from "react-webcam";
import './index.css';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import CountdownTimer from "react-component-countdown-timer";
import SweetAlert from 'react-bootstrap-sweetalert';
import urlSocket from './urlSocket';
import ImageUrl from "./imageUrl";
import { DEFAULT_RESOLUTION } from "./cameraConfig";
import WebcamCapture from "pages/WebcamCustom/WebcamCapture";
import FullScreenLoader from "components/Common/FullScreenLoader";

import { set } from "lodash";
import SequentialCameraView from "./SequentialCameraView";

// Global variables (consider moving to context or proper state management)
let component_code1 = "";
let component_name1 = "";
let positive = "";
let negative = "";
let posble_match = "";
// let batch_id = "";
// let old_ok = 0;
// let old_ng = 0;
// let old_total = 0;
// let old_pm = 0;
// let ok_count = 0;
// let ng_count = 0;
// let ps_match = 0;
// let t_count = 0;

const date = new Date();
let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();
let current_date = `${day}-${month}-${year}`;

const InspectionTestingStage = () => {
    const [oldOk, setOldOk] = useState(0);
    const [oldNg, setOldNg] = useState(0);
    const [oldTotal, setOldTotal] = useState(0);
    const [oldPm, setOldPm] = useState(0);
    const [okCount, setOkCount] = useState(0);
    const [ngCount, setNgCount] = useState(0);
    const [psMatch, setPsMatch] = useState(0);
    const [tCount, setTCount] = useState(0);
    const [batch_id, setBatchId] = useState('');




    const history = useHistory();

    // Refs
    const webcamRef = useRef([]);
    // const canvasRef = useRef(null);
    const canvasRef = useRef({});
    const tableRef = useRef(null);

    // UI State
    const [activeTab, setActiveTab] = useState("1");
    const [showresult, setShowresult] = useState(false);
    const [showstatus, setShowstatus] = useState(false);
    const [show, setShow] = useState(false);
    const [showdata, setShowdata] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [alertMsg, setAlertMsg] = useState(false);
    const [modal_xlarge, setModal_xlarge] = useState(false);
    const [session_detail, setSession_detail] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [loading, setLoading] = useState(false);
    const [is_loading_models, setIs_loading_models] = useState(false);
    const [cameraDisconnected, setCameraDisconnected] = useState(false);

    // Component Data State
    const [component_code, setComponent_code] = useState("");
    const [component_name, setComponent_name] = useState("");
    const [comp_id, setComp_id] = useState("");
    const [compData, setCompData] = useState(null);
    const [componentData, setComponentData] = useState(null);
    const [station_name, setStation_name] = useState("");
    const [station_id, setStation_id] = useState("");
    const [datasets, setDatasets] = useState([]);

    // Configuration State
    const [config_positive, setConfig_positive] = useState("");
    const [config_negative, setConfig_negative] = useState("");
    const [config_posble_match, setConfig_posble_match] = useState("");
    const [config_data, setConfig_data] = useState([]);

    // Inspection State
    const [inspection_type, setInspection_type] = useState("");
    const [inspection_started, setInspection_started] = useState(false);
    const [qr_checking, setQr_checking] = useState(false);
    const [qruniq_checking, setQruniq_checking] = useState(false);
    const [qrbar_check, setQrbar_check] = useState(false);
    const [qrbar_check_type, setQrbar_check_type] = useState(null);

    // Timer State
    const [timer, setTimer] = useState(false);
    const [timeout, setTimeout_val] = useState(10);
    const [capture_duration, setCapture_duration] = useState(10);
    const [isCountdownActive, setIsCountdownActive] = useState(false);
    const [intervalId, setIntervalId] = useState("");

    // Result State
    const [response_message, setResponse_message] = useState("");
    const [response_value, setResponse_value] = useState("");
    const [res_message, setRes_message] = useState("");
    const [result_key, setResult_key] = useState(false);
    const [resultKey] = useState('Result : ');

    // Capture State
    const [startCapture, setStartCapture] = useState(true);
    const [screenshot, setScreenshot] = useState(null);
    const [placeobj_count, setPlaceobj_count] = useState(0);
    const [showplaceobject, setShowplaceobject] = useState(true);
    const [msg, setMsg] = useState("");
    const [mssg, setMssg] = useState("");

    // Barcode/QR State
    const [qrbar, setQrbar] = useState(false);
    const [qrbar_start_btn, setQrbar_start_btn] = useState(false);
    const [qrbar_countdown_active, setQrbar_countdown_active] = useState(false);
    const [qrbar_capture_duration, setQrbar_capture_duration] = useState(5);
    const [qrbar_pause_resume, setQrbar_pause_resume] = useState(false);
    const [qrbar_found, setQrbar_found] = useState(0);
    const [qrbar_result, setQrbar_result] = useState(0);
    const [comp_found, setComp_found] = useState(0);
    const [comp_result, setComp_result] = useState(0);
    const [barcode_data, setBarcode_data] = useState(null);
    const [countdownType, setCountdownType] = useState('');

    // Outline State
    const [show_outline, setShow_outline] = useState(false);
    const [outline_checkbox, setOutline_checkbox] = useState(false);
    const [default_outline, setDefault_outline] = useState('White Outline');
    const [outline_colors] = useState([
        "White Outline", "Red Outline", "Green Outline",
        "Blue Outline", "Black Outline", "Orange Outline", "Yellow Outline"
    ]);
    const [outline_path, setOutline_path] = useState('');
    const [_comp_info, set_comp_info] = useState(null);

    // Region/Rectangle State
    const [rectangles, setRectangles] = useState([]);
    const [region_selection, setRegion_selection] = useState(true);
    const [output_Rect, setOutput_Rect] = useState(false);
    const [res_img, setRes_img] = useState(null);

    // Report/Session State
    const [report_data, setReport_data] = useState([]);
    const [manage_details, setManage_details] = useState([]);
    const [time_sheet, setTime_sheet] = useState([]);
    const [total_sn_tmsht, setTotal_sn_tmsht] = useState('');
    const [totalDuration1, setTotalDuration1] = useState('');
    const [totalOk, setTotalOk] = useState(0);
    const [totalNG, setTotalNG] = useState(0);
    const [totalNoObj, setTotalNoObj] = useState(0);
    const [totalincorrect, setTotalincorrect] = useState(0);
    const [totalTotal, setTotalTotal] = useState(0);
    const [compNo, setCompNo] = useState('');
    const [tbIndex, setTbIndex] = useState(0);

    // Misc State
    const [resume, setResume] = useState(false);
    const [show_next, setShow_next] = useState(false);
    const [zoom_value, setZoom_value] = useState({});
    const [deviceId, setDeviceId] = useState('');
    const [capture_fixed_refimage, setCapture_fixed_refimage] = useState(false);
    const [stationStages, setStationStages] = useState([]);
    const [cameraList, setCameraList] = useState([]);
    const [rectanglesByCamera, setRectanglesByCamera] = useState({});
    const [ref_img_path, setRefImgPath] = useState(null);
    const [currentStageIndex, setCurrentStageIndex] = useState(0);

    // //to fetch the component details new function
    // useEffect(() => {
    //     const fetchCompData = async () => {
    //         try {
    //             const response = await urlSocket.post('/getCompData', {
    //                 comp_name: component_name1,
    //                 comp_code: component_code1
    //             });

    //             const compData = response.data;
    //             console.log('compDatafetch', compData);
    //             if (compData) {
    //                 // setBatchId(compData.batch_id?.$oid || compData.batch_id);
    //                 setBatchId(compData.batch_id);
    //                 console.log("this isthe batch id", compData.batch_id);

    //             }
    //         } catch (err) {
    //             console.error('fetchCompData error:', err);
    //         }
    //     };

    //     fetchCompData();
    // }, [component_name1, component_code1]);


    // useEffect(async () => {
    //     sessionStorage.setItem('showSidebar', true);
    //     const compData = await JSON.parse(sessionStorage.getItem("compData"));
    //     console.log('data142', compData);
    //     if (compData?.zoom_value) {
    //         setZoom_value(compData.zoom_value);
    //     }
    //     const componentData = JSON.parse(sessionStorage.getItem("componentData"));
    //     setShow_outline(true);
    //     setOutline_checkbox(true);
    //     setRefImgPath(compData.datasets)
    //     setOutline_path(compData.datasets)

    //     console.log('componentData', componentData)
    //     setComponentData(componentData);

    //     const stationCompStages = await JSON.parse(sessionStorage.getItem("stationCompStages"));
    //     console.log('stationCompStages', stationCompStages[0]);
    //     setStationStages(stationCompStages[0]);
    //     const data = stationCompStages[0]; // your main object

    //     const stageProfiles = data.stage_profiles;

    //     const result = [];

    //     Object.entries(stageProfiles).forEach(([stageName, positions]) => {
    //         Object.entries(positions).forEach(([label, modelData]) => {

    //             // pick model_ver (use first ng_model_data or ok_model_data)
    //             // const modelVer =
    //             //     modelData?.ng_model_data?.[0]?.model_ver ??
    //             //     modelData?.ok_model_data?.[0]?.model_ver ??
    //             //     null;

    //             result.push({
    //                 stageName: stageName,
    //                 label: label,
    //                 // model_ver: modelVer,
    //                 _id: modelData._id,
    //                 ng_allany: modelData.ng_allany,
    //                 ng_model_data: modelData.ng_model_data,
    //                 ng_opt: modelData.ng_opt,
    //                 ok_allany: modelData.ok_allany,
    //                 ok_opt: modelData.ok_opt,
    //                 ok_model_data: modelData.ok_model_data,
    //                 originalLabel: modelData.originalLabel,
    //                 overAll_testing: modelData.overAll_testing,
    //                 region_wise_testing: modelData.region_wise_testing,
    //                 p_id: modelData.p_id,
    //                 port: modelData.port,
    //                 v_id: modelData.v_id,
    //                 value: modelData.value,
    //                 stage_id: modelData._id,
    //                 stage_code: modelData.stage_code,
    //                 // model_data: modelData
    //             });
    //         });
    //     });

    //     console.log(result, 'resultstageProfiles');
    //     setCameraList(result);



    //     document.addEventListener('keydown', handleKeyDown);

    //     let v_id = compData._id;
    //     component_code1 = compData.component_code;
    //     component_name1 = compData.component_name;
    //     positive = compData.positive;
    //     negative = compData.negative;
    //     posble_match = compData.posble_match;
    //     let station_name_val = compData.station_name;
    //     let station_id_val = compData.station_id;
    //     // batch_id = compData.batch_id;
    //     let datasets_val = compData.datasets;
    //     let inspection_type_val = compData.inspection_type;
    //     let qr_checking_val = compData.qr_checking;
    //     let qruniq_checking_val = compData.qruniq_checking;
    //     let timeout_val = Number(compData.timer) + '000';

    //     // Refresh details count
    //     // refreshDetailsCount();

    //     // Get today count
    //     // getTodayCount();

    //     // Set state
    //     setCompData(compData);
    //     setShow(true)
    //     setInspection_type(inspection_type_val);
    //     setQr_checking(qr_checking_val);
    //     setQruniq_checking(qruniq_checking_val);
    //     setCapture_duration(Number(compData.timer));
    //     setQrbar_check(compData.qrbar_check);
    //     setQrbar_check_type(compData.qrbar_check_type);
    //     setTimeout_val(timeout_val);

    //     if (datasets_val === undefined) {
    //         setComponent_name(component_name1);
    //         setComponent_code(component_code1);
    //         setComp_id(v_id);
    //         setStation_name(station_name_val);
    //         setStation_id(station_id_val);
    //     } else {
    //         setComponent_name(component_name1);
    //         setComponent_code(component_code1);
    //         setDatasets(datasets_val);
    //         setComp_id(v_id);
    //         setStation_name(station_name_val);
    //         setStation_id(station_id_val);
    //     }

    //     // showRefOutline(compData);
    //     checkWebcam();
    //     navigator.mediaDevices.addEventListener('devicechange', checkWebcam);
    //     barcodeInfo(v_id, inspection_type_val, compData);
    //     // configuration();

    //     return () => {
    //         navigator.mediaDevices.removeEventListener('devicechange', checkWebcam);
    //         document.removeEventListener('keydown', handleKeyDown);
    //     };
    // }, []);


    useEffect(() => {
        let isMounted = true; // prevent state update after unmount

        async function init() {
            try {
                sessionStorage.setItem("showSidebar", true);

                const compData = JSON.parse(sessionStorage.getItem("compData"));
                console.log("data142", compData);

                if (!compData || !isMounted) return;

                if (compData?.zoom_value) setZoom_value(compData.zoom_value);
                if (compData.batch_id) { setBatchId(compData.batch_id); }

                const componentData = JSON.parse(sessionStorage.getItem("componentData"));
                console.log('componentData', componentData)
                setShow_outline(true);
                setOutline_checkbox(true);
                setRefImgPath(compData.datasets);
                setOutline_path(compData.datasets);
                setComponentData(componentData);

                const stationCompStages = JSON.parse(sessionStorage.getItem("stationCompStages"));
                console.log("stationCompStages", stationCompStages?.[0]);

                if (stationCompStages?.[0]) {
                    const data = stationCompStages[0];
                    setStationStages(data);

                    const stageProfiles = data.stage_profiles || {};
                    const result = [];

                    Object.entries(stageProfiles).forEach(([stageName, positions]) => {
                        Object.entries(positions).forEach(([label, modelData]) => {
                            result.push({
                                stageName,
                                label,
                                _id: modelData._id,
                                ng_allany: modelData.ng_allany,
                                ng_model_data: modelData.ng_model_data,
                                ng_opt: modelData.ng_opt,
                                ok_allany: modelData.ok_allany,
                                ok_opt: modelData.ok_opt,
                                ok_model_data: modelData.ok_model_data,
                                originalLabel: modelData.originalLabel,
                                overAll_testing: modelData.overAll_testing,
                                region_wise_testing: modelData.region_wise_testing,
                                p_id: modelData.p_id,
                                port: modelData.port,
                                v_id: modelData.v_id,
                                value: modelData.value,
                                stage_id: modelData._id,
                                stage_code: modelData.stage_code,
                            });
                        });
                    });

                    console.log(result, "resultstageProfiles");
                    if (isMounted) setCameraList(result);
                }

                document.addEventListener("keydown", handleKeyDown);

                // assign extracted values
                let v_id = compData._id;
                component_code1 = compData.component_code;
                component_name1 = compData.component_name;
                positive = compData.positive;
                negative = compData.negative;
                posble_match = compData.posble_match;

                let datasets_val = compData.datasets;
                let inspection_type_val = compData.inspection_type;
                let qr_checking_val = compData.qr_checking;
                let qruniq_checking_val = compData.qruniq_checking;
                let timeout_val = Number(compData.timer) * 1000;

                // Set state values safely
                if (!isMounted) return;

                setCompData(compData);
                setShow(true);
                setInspection_type(inspection_type_val);
                setQr_checking(qr_checking_val);
                setQruniq_checking(qruniq_checking_val);
                setCapture_duration(Number(compData.timer));
                setQrbar_check(compData.qrbar_check);
                setQrbar_check_type(compData.qrbar_check_type);
                setTimeout_val(timeout_val);

                setComponent_name(component_name1);
                setComponent_code(component_code1);
                setComp_id(v_id);
                setStation_name(compData.station_name);
                setStation_id(compData.station_id);

                if (datasets_val !== undefined) {
                    setDatasets(datasets_val);
                }

                checkWebcam();
                navigator.mediaDevices.addEventListener("devicechange", checkWebcam);
                barcodeInfo(v_id, inspection_type_val, compData);

            } catch (error) {
                console.error("Error in useEffect init:", error);
            }
        }

        init();

        return () => {
            isMounted = false;
            navigator.mediaDevices.removeEventListener("devicechange", checkWebcam);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);


    useEffect(() => {
        setTCount(okCount + ngCount + psMatch);
        getTodayCount();

    }, []);

    useEffect(() => {
        if (batch_id) {
            refreshDetailsCount();
        }
    }, [batch_id, component_code1, component_name1]);


    useEffect(() => {
        console.log('rectanglesByCamera', rectanglesByCamera);

        if (!canvasRef.current) {
            return;
        }

        // If we have rectangles by camera, draw them
        if (Object.keys(rectanglesByCamera).length > 0) {
            Object.entries(rectanglesByCamera).forEach(([cameraLabel, rectangles]) => {
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

    }, [res_img, rectanglesByCamera]);

    // // Canvas drawing effect
    // useEffect(() => {
    //     if (!canvasRef.current) return;

    //     const canvas = canvasRef.current;
    //     const ctx = canvas.getContext('2d');

    //     if (!ctx) {
    //         console.error('Failed to get canvas context');
    //         return;
    //     }

    //     if (res_img && rectangles.length > 0) {
    //         const drawFrame = () => {
    //             ctx.clearRect(0, 0, canvas.width, canvas.height);
    //             rectangles.forEach((rect, index) => {
    //                 ctx.lineWidth = 2;
    //                 ctx.strokeStyle = rect.colour;
    //                 ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    //                 const textPosX = rect.x + 10;
    //                 ctx.font = 'bold 14px Arial';
    //                 ctx.lineWidth = 3;
    //                 ctx.strokeStyle = 'black';
    //                 ctx.strokeText(rect.name, textPosX, rect.y + 15);
    //                 ctx.fillStyle = 'white';
    //                 ctx.fillText(rect.name, textPosX, rect.y + 15);
    //             });
    //         };

    //         if (res_img) {
    //             drawFrame();
    //         } else {
    //             ctx.clearRect(0, 0, canvas.width, canvas.height);
    //         }
    //     }
    // }, [res_img, rectangles]);

    // Helper Functions
    // const refreshDetailsCount = async () => {
    //     try {
    //         const response = await urlSocket.post('/refresh_details_count', {
    //             'comp_name': component_name1,
    //             "comp_code": component_code1,
    //             "batch_id": batch_id
    //         }, { mode: 'no-cors' });

    //         let batch_data = response.data;
    //         console.log('refresh_count', batch_data);

    //         if (batch_data.length === 0) {
    //             ok_count = 0;
    //             ng_count = 0;
    //             ps_match = 0;
    //             t_count = 0;
    //         } else {
    //             ok_count = Number(batch_data[0].ok);
    //             ng_count = Number(batch_data[0].notok);
    //             ps_match = Number(batch_data[0].posbl_match);
    //             t_count = Number(batch_data[0].total);
    //         }
    //     } catch (error) {
    //         console.error(error);
    //     }
    // };

    // const getTodayCount = async () => {
    //     try {
    //         const response = await urlSocket.post('/today_count', {
    //             'comp_name': component_name1,
    //             "comp_code": component_code1
    //         }, { mode: 'no-cors' });

    //         let val = response.data;
    //         console.log('value from db', val);

    //         if (val.length === 0) {
    //             old_ng = 0;
    //             old_ok = 0;
    //             old_total = 0;
    //             old_pm = 0;
    //         } else {
    //             old_ok = val[0].ok;
    //             old_ng = val[0].notok;
    //             old_total = val[0].total;
    //             old_pm = val[0].pm;
    //         }
    //     } catch (error) {
    //         console.error(error);
    //     }
    // };


    const refreshDetailsCount = async () => {
        try {
            console.log('refreshDetailsCount called with batch:', batch_id);

            const response = await urlSocket.post('/refresh_details_count', {
                comp_name: component_name1,
                comp_code: component_code1,
                batch_id: batch_id
            });

            const batch_data = response.data;
            console.log('refresh_details_count response:', batch_data);

            if (!batch_data || batch_data.length === 0) {
                setOkCount(0);
                setNgCount(0);
                setPsMatch(0);
                setTCount(0);
            } else {
                const row = batch_data[0];
                setOkCount(Number(row.ok));
                setNgCount(Number(row.notok));
                setPsMatch(Number(row.posbl_match));
                setTCount(Number(row.total));
            }
        } catch (err) {
            console.error('refreshDetailsCount ERROR:', err);
        }
    };

    // useEffect(() => {
    //     // if (component_name1 && component_code1) {
    //     // }
    // }, []);

    //   const getTodayCount = async () => {
    //     try {
    //       // const response = await urlSocket.post('/today_count', {
    //       //     'comp_name': component_name1,
    //       //     "comp_code": component_code1
    //       // }, { mode: 'no-cors' });
    //       const response = await urlSocket.post('/today_count', {
    //         comp_name: component_name1,
    //         comp_code: component_code1.toString()
    //       });

    //       let val = response.data;
    //       console.log('value from db', val);

    //       if (val.length === 0) {
    //         old_ng = 0;
    //         old_ok = 0;
    //         old_total = 0;
    //         old_pm = 0;
    //       } else {
    //         old_ok = val[0].ok;
    //         old_ng = val[0].notok;
    //         old_total = val[0].total;
    //         old_pm = val[0].pm;
    //       }
    //     } catch (error) {
    //       console.error(error);
    //     }
    //   };

    const getTodayCount = async () => {
        console.log("firstfirstfirst", component_code1,)
        try {
            const response = await urlSocket.post('/today_count', {
                comp_name: component_name1,
                comp_code: component_code1
            });

            const val = response.data;
            console.log('valvalval', val)

            if (val.length === 0) {
                setOldOk(0);
                setOldNg(0);
                setOldTotal(0);
                setOldPm(0);
            } else {
                setOldOk(val[0].ok);
                setOldNg(val[0].notok);
                setOldTotal(val[0].total);
                setOldPm(val[0].posbl_match);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const checkWebcam = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
            setCameraDisconnected(!videoInputDevices.length);
        } catch (error) {
            console.error('Error checking devices:', error);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'F9') {
            const startButton = document.getElementById('strtbtn');
            if (startButton) {
                startButton.click();
            }
        }
    };



    const getReferenceImageForCamera = useCallback((cameraLabel, stageName, refImage) => {
        console.log('cameraLabel, stage_name', cameraLabel, stageName, refImage);

        if (!refImage || !Array.isArray(refImage)) return "";

        // Normalize label for consistent comparison
        // const normalizedLabel = cameraLabel?.trim().toLowerCase().replace(/\s+/g, "_");
        const normalizedLabel = cameraLabel;

        // Filter all matching entries
        const matchingEntries = refImage.filter(item =>
            item?.camera_label === cameraLabel &&
            item?.stage_name === stageName
        );

        console.log('matchingEntries', matchingEntries);

        if (matchingEntries.length === 0) {
            console.log(`No image found for ${cameraLabel} with stage_name ${stageName}`);
            return "";
        }

        // Return the first matching entry (since they're duplicates)
        const cameraEntry = matchingEntries[0];
        console.log('cameraEntry (first match)', cameraEntry);

        return showImage(cameraEntry.image_path);
    }, []);


    const showImage = (output_img) => {
        console.log('output_img', output_img)
        let imgurl = ImageUrl.img_url;
        // const parts = output_img.split("/");
        // const newPath = parts.slice(1).join("/");
        // let startIndex;
        // if (newPath.includes("Datasets/")) {
        //     startIndex = newPath.indexOf("Datasets/");
        // } else {
        //     startIndex = newPath.indexOf("receive/");
        // }
        // const relativePath = newPath.substring(startIndex);
        console.log('lats_output_img : ', imgurl + output_img);
        return `${imgurl + output_img}`;
    };

    const getCurrentOutlinePath = (cameraOriginalLabel) => {
        console.log("outline_path:", outline_path, "camera:", cameraOriginalLabel);

        if (!outline_path) return null;

        // -------------------------------------------
        // CASE 1: outline_path is a STRING
        // -------------------------------------------
        if (typeof outline_path === "string") {
            return outline_path;
        }

        // -------------------------------------------
        // CASE 2: outline_path is OBJECT or ARRAY
        // -------------------------------------------
        if (cameraOriginalLabel) {
            const selectedCamera = cameraList.find(
                cam => cam.originalLabel === cameraOriginalLabel
            );

            if (!selectedCamera) return null;

            const possibleKeys = [
                selectedCamera.label,
                selectedCamera.originalLabel
            ];

            console.log("Possible keys:", possibleKeys);

            for (const key of possibleKeys) {
                let matched = null;

                if (Array.isArray(outline_path)) {
                    // For ARRAY → match by camera_label
                    matched = outline_path.find(o => o.camera_label === key);
                } else {
                    // For OBJECT → direct key lookup
                    matched = outline_path[key];
                }

                if (matched) {
                    console.log("Matched outline item:", matched);

                    // Map outline color to correct field
                    const outlineMap = {
                        "White Outline": matched.white_path,
                        "Red Outline": matched.red_path,
                        "Green Outline": matched.green_path,
                        "Blue Outline": matched.blue_path,
                        "Black Outline": matched.black_path,
                        "Orange Outline": matched.orange_path,
                        "Yellow Outline": matched.yellow_path,
                    };

                    return outlineMap[default_outline] || matched.white_path;
                }
            }
        }

        // -------------------------------------------
        return null;
    };


    const configuration = async () => {
        try {
            console.log('first9911');
            const response = await urlSocket.post('/nonSync_config', {
                'comp_name': component_name1,
                'comp_code': component_code1
            }, { mode: 'no-cors' });

            let data = response.data;
            console.log('config_data18011', data);

            if (data.length > 0) {
                setConfig_data(data);
                setConfig_positive(data[0].positive);
                setConfig_negative(data[0].negative);
                setConfig_posble_match(data[0].posble_match);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const showRefOutline = async (comp_data) => {
        console.log('data152 ', comp_data);
        try {
            const response = await urlSocket.post('/check_outline', {
                'comp_id': comp_data._id,
            }, { mode: 'no-cors' });

            let getInfo = response.data;
            console.log('data131 ', getInfo);

            if (getInfo.show === 'yes') {
                setShow_outline(true);
                setOutline_checkbox(true);
                set_comp_info(getInfo.comp_info);
                setOutline_path(getInfo.comp_info.datasets[0].white_path);
            } else if (getInfo.show === 'any_pos') {
                setCapture_fixed_refimage(true);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const barcodeInfo = (comp_id, inspection_type_val, comp_inf) => {
        if (comp_inf.qrbar_check === true) {
            if (inspection_type_val === 'Manual') {
                setQrbar(true);
                setQrbar_start_btn(true);
                setBarcode_data(comp_inf.qrOrBar_code);
            } else {
                setQrbar(true);
                setQrbar_countdown_active(true);
                setQrbar_capture_duration(5);
                setQrbar_pause_resume(true);
                setBarcode_data(comp_inf.qrOrBar_code);
            }
        } else {
            setBarcode_data(null);
            if (inspection_type_val === 'Manual') {
                cont_apiCall();
            } else {
                setTimeout(() => { appCall(); }, 2000);
            }
        }
    };

    const cont_apiCall = () => {
        if (placeobj_count > 0) {
            if (res_message === 'No Object Found' || res_message === 'Incorrect Object' ||
                res_message === 'QR not found' || res_message === 'Data Already Exists') {
                setShowstatus(true);
                setShowresult(false);
                setResult_key(false);
                setShowplaceobject(true);
            } else {
                setShowstatus(false);
                setShowresult(true);
                setResult_key(true);
            }
        } else {
            setShowstatus(false);
        }

        if (startCapture) {
            apiCall();
        }
    };

    const apiCall = () => {
        let message = 'Place the object and press start';
        console.log('message', message);
        setMsg(message);
        setShow(true);
    };

    const appCall = () => {
        console.log('data481 after single object detection');

        if (placeobj_count > 0) {
            if (res_message === 'No Object Found' || res_message === 'Incorrect Object' ||
                res_message === 'QR not found' || res_message === 'Data Already Exists') {
                setStartCapture(true);
                setTimer(true);
                setIsCountdownActive(true);
                setShowdata(true);
                setShowstatus(true);
                setShowresult(false);
                setResult_key(false);
            } else {
                setStartCapture(true);
                setTimer(true);
                setIsCountdownActive(true);
                setShowdata(true);
                setShowstatus(false);
                setShowresult(true);
                setResult_key(true);
            }
        } else {
            setStartCapture(true);
            setTimer(true);
            setIsCountdownActive(true);
            setShowstatus(false);
            setShowdata(true);
        }
    };

    const onTimeupCourse = () => {
        setTimer(true);
        setIsCountdownActive(false);

        if (compData.qr_checking === true) {
            if (compData.qruniq_checking === true) {
                uniqness_checking();
            } else {
                uniq_object_detection();
            }
        } else {
            object_detection();
        }
    };

    const pauseCountdown = () => {
        console.log('data436 ', qrbar_check, isCountdownActive, qrbar_countdown_active);

        if (qrbar_check === true && isCountdownActive === true) {
            setIsCountdownActive(false);
            setCountdownType('comp');
            setShowDetail(true);
            setResume(prev => !prev);
        } else if (qrbar_check === true && qrbar_countdown_active === true) {
            console.log('data445 ');
            setQrbar_countdown_active(false);
            setCountdownType('qrbar');
            setShowDetail(true);
            setResume(prev => !prev);
        } else {
            setShowDetail(true);
            setIsCountdownActive(false);
            setResume(prev => !prev);
        }
    };

    const resumeCountdown = () => {
        if (qrbar_check === true && countdownType === 'comp') {
            setIsCountdownActive(true);
            setShowDetail(false);
            setResume(prev => !prev);
            setCountdownType('');
        } else if (qrbar_check === true && countdownType === 'qrbar') {
            setQrbar_countdown_active(true);
            setShowDetail(false);
            setResume(prev => !prev);
            setCountdownType('');
        } else {
            setIsCountdownActive(true);
            setShowDetail(false);
            setResume(prev => !prev);
        }
    };

    const object_detection = async () => {
        console.log('print123 1');
        setInspection_started(true);
        setPlaceobj_count(prev => prev + 1);
        setShowdata(false);
        setShowresult(false);
        setShowstatus(false);
        setRectangles([]);
        setRectanglesByCamera({})
        setResponse_value("")
        setShow(false)




        // const imageSrc = await webcamRef.current.captureZoomedImage();
        // setRes_img(imageSrc);
        // const blob = await fetch(imageSrc).then((res) => res.blob());

        const formData = new FormData();
        let component_code_val = component_code1;
        let component_name_val = component_name1;
        let vpositive = positive;
        let vnegative = negative;
        let vposble_match = posble_match;

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

        let compdata = component_name_val + "_" + component_code_val + '_' + replace;



        const capturedImages = [];

        const camerasToCapture =
            compData.capture_mode === "Sequential"
                ? [cameraList[currentStageIndex]]
                : cameraList;

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
        setRes_img(capturedImages[0].blob);

        formData.append('comp_name', component_name_val);
        formData.append('comp_code', component_code_val);
        formData.append('comp_id', comp_id);
        formData.append('positive', vpositive);
        formData.append('negative', vnegative);
        formData.append('posble_match', vposble_match);
        // formData.append('datasets', blob, compdata + '.png');
        formData.append('station_name', station_name);
        formData.append('station_id', station_id);
        formData.append('inspected_ondate', test_date);
        formData.append('date', _today);
        formData.append('time', time);
        formData.append('milliseconds', milliseconds);
        formData.append('batch_id', batch_id);
        formData.append('detect_selection', JSON.stringify(stationStages.detect_selection));
        formData.append('stage_profiles', JSON.stringify(stationStages.stage_profiles));
        formData.append('detect_type', compData.detection_type);
        formData.append('qrbar_result', qrbar_result);

        capturedImages.forEach((img, idx) => {
            formData.append(`datasets[${idx}]`, img.blob, img.filename);
            formData.append(`camera_labels[${idx}]`, img.label);
            formData.append(`model_versions[${idx}]`, img.version);
            formData.append(`stage_names[${idx}]`, img.stageName);
            formData.append(`stage_codes[${idx}]`, img.stagecode);
            formData.append(`stage_ids[${idx}]`, img.stage_id);
        });


        if (compData.detection_type === "Smart Object Locator") {
            formData.append('our_rectangles', JSON.stringify(compData?.rectangles));
            formData.append('selected_regions', JSON.stringify(compData?.selected_regions));
        }

        const compBarcode = barcode_data === null || barcode_data === undefined;

        try {
            const response = await urlSocket.post('/objectDetectionOnly_stg', formData, {
                headers: { 'content-type': 'multipart/form-data' },
                mode: 'no-cors'
            });

            console.log(`success702`, response.data);
            const resultsByCamera = {};

            response.data[0]?.detection_result.forEach(item => {
                resultsByCamera[item.camera_label] = item.detection_result;
            });

            console.log('resultsByCamera', resultsByCamera);
            let obj_result = resultsByCamera
            setRes_message(resultsByCamera);
            setShowstatus(true);

            const capturedImagesData = response.data[0].captured_image || [];
            const detectionResults = response.data[0].detection_result || [];
            const updatedRectanglesList = response.data[0].updated_rectangles || [];

            const hasNoObject = detectionResults.some(item => item.detection_result === 'No Object Detected');
            const hasIncorrectObject = detectionResults.some(item => item.detection_result === 'Incorrect Object');
            const hasObjectDetected = detectionResults.some(item => item.detection_result === 'Object Detected');



            setTimeout(() => {
                if ((compData.detect_selection === true && hasObjectDetected) ||
                    (compData.detect_selection === false && obj_result === "")) {
                    console.log('compData724', compData)

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
                    setShowstatus(true);


                    const { overAll_testing, region_selection: region_sel, region_wise_testing } = componentData[0];

                    urlSocket.post('/inspectionResult_stg', {
                        'comp_name': component_name_val,
                        "comp_code": component_code_val,
                        "batch_id": batch_id,
                        "captured_image": response.data[0].captured_image,
                        "insp_result_id": response.data[0].insp_result_id,
                        "start_time_with_milliseconds": response.data[0].start_time_with_milliseconds,
                        "positive": positive,
                        "negative": negative,
                        "posble_match": posble_match,
                        "background": compData.background,
                        "overAll_testing": overAll_testing,
                        "region_selection": region_sel,
                        "region_wise_testing": region_wise_testing,
                        "stage_profiles": stationStages.stage_profiles,
                        // "updated_rectangles": updated_rectangles,
                    }, { mode: 'no-cors' })
                        .then(detection => {
                            console.log('detection : ', detection);
                            setShowstatus(false);
                            setInspection_started(false);

                            // let testing_result = detection.data[0].status;
                            // console.log('testing_result', testing_result);


                            const testing_result = {};

                            detection?.data?.prediction.forEach(item => {
                                testing_result[item.camera_label] = item.status;
                            });

                            console.log('testing_result', testing_result);

                            const originalWidth = 640;
                            const originalHeight = 480;
                            const targetWidth = DEFAULT_RESOLUTION.width;
                            const targetHeight = DEFAULT_RESOLUTION.height;

                            const scaleX = targetWidth / originalWidth;
                            const scaleY = targetHeight / originalHeight;
                            const rectanglesByCam = {};
                            detection.data.prediction.forEach((cameraResult) => {
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
                            const final_result = detection?.data?.results?.final_result
                            console.log('final_result', final_result, positive)

                            setResponse_message(testing_result);
                            setShowresult(true);
                            setRectanglesByCamera(rectanglesByCam)
                            setShow(true)
                            setShowdata(true);



                            if (final_result === positive) {
                                let positive_msg = final_result.replaceAll(final_result, config_positive);
                                // ok_count++;
                                // old_ok++;
                                // old_total++;
                                // t_count = ok_count + ng_count + ps_match;

                                setOkCount(prev => prev + 1);
                                setOldOk(prev => prev + 1);
                                setOldTotal(prev => prev + 1);

                                setTCount(prev => prev + 1);


                                // setResponse_message(positive_msg);
                                setResponse_value(final_result);
                                // setShowresult(true);
                                setResult_key(true);
                                setQrbar_countdown_active(compBarcode === false ? true : undefined);
                                setComp_result(compBarcode === false ? 2 : undefined);
                            } else if (final_result === negative) {
                                let negative_msg = final_result.replaceAll(final_result, config_negative);
                                console.log('negative_msg', negative_msg)
                                // ng_count++;
                                // old_ng++;
                                // old_total++;
                                // t_count = ok_count + ng_count + ps_match;
                                setNgCount(prev => prev + 1);
                                setOldNg(prev => prev + 1);
                                setOldTotal(prev => prev + 1);

                                setTCount(prev => prev + 1);


                                // setResponse_message(negative_msg);
                                setResponse_value(final_result);
                                // setResponse_value(detection.data[0].value);
                                // setShowresult(true);
                                setResult_key(true);
                                setQrbar_countdown_active(compBarcode === false ? true : undefined);
                                setComp_result(compBarcode === false ? 1 : undefined);
                            } else if (testing_result === posble_match) {
                                let posble_match_msg = testing_result.replaceAll(testing_result, config_posble_match);
                                // ps_match++;
                                // old_pm++;
                                // old_total++;
                                // t_count = ok_count + ng_count + ps_match;
                                setPsMatch(prev => prev + 1);
                                setOldPm(prev => prev + 1);
                                setOldTotal(prev => prev + 1);

                                // Update total count
                                setTCount(prev => prev + 1);


                                console.log('posbl_match563', posble_match_msg);
                                // setResponse_message(posble_match_msg);
                                setResponse_value(final_result);
                                // setShowresult(true);
                                setResult_key(true);
                                setQrbar_countdown_active(compBarcode === false ? true : undefined);
                            }
                        })



                }
            }, 500);
        } catch (error) {
            console.error('/API ERROR, OBJECT_DETECTION or INSPECTION_RESULT ', error);
            setInspection_started(false);
        }
    };

    // const object_detection = async () => {
    //     console.log('print123 1');
    //     setInspection_started(true);
    //     setPlaceobj_count(prev => prev + 1);
    //     setShowdata(false);
    //     setShowresult(false);
    //     setShowstatus(false);
    //     setRectangles([]);
    //     setRectanglesByCamera({})
    //     setResponse_value("")
    //     setShow(false)

    //     const formData = new FormData();
    //     let component_code_val = component_code1;
    //     let component_name_val = component_name1;
    //     let vpositive = positive;
    //     let vnegative = negative;
    //     let vposble_match = posble_match;

    //     let today = new Date();
    //     let yyyy = today.getFullYear();
    //     let mm = today.getMonth() + 1;
    //     let dd = today.getDate();
    //     let _today = dd + '/' + mm + '/' + yyyy;
    //     let test_date = yyyy + '-' + mm + '-' + dd;

    //     let hours = today.getHours();
    //     let min = today.getMinutes();
    //     let secc = today.getSeconds();
    //     let time = hours + ':' + min + ':' + secc;
    //     let milliseconds = hours + ':' + min + ':' + secc + '.' + today.getMilliseconds().toString().padStart(3, '0').slice(0, 5);
    //     let replace = _today + '_' + time.replaceAll(":", "_");

    //     let compdata = component_name_val + "_" + component_code_val + '_' + replace;

    //     const capturedImages = [];

    //     const camerasToCapture =
    //         compData.capture_mode === "Sequential"
    //             ? [cameraList[currentStageIndex]]
    //             : cameraList;

    //     for (const cam of camerasToCapture) {
    //         console.log('cam', cam)
    //         const labelName = cam.label;
    //         const version = cam.model_ver;
    //         const stagename = cam.stageName;
    //         const stagecode = cam.stage_code;
    //         const stage_id = cam.stage_id;
    //         const originalLabel = cam.originalLabel;
    //         const webcamInstance = webcamRef.current?.[originalLabel];
    //         console.log('webcamInstance', webcamInstance)

    //         if (!webcamInstance || !webcamInstance.captureZoomedImage) {
    //             console.warn(`⚠️ Webcam not ready for ${labelName}`);
    //             continue;
    //         }

    //         const imageSrc = await webcamInstance.captureZoomedImage();
    //         if (!imageSrc) {
    //             console.warn(`⚠️ Failed to capture from ${labelName}`);
    //             continue;
    //         }

    //         const blob = await fetch(imageSrc).then((r) => r.blob());
    //         capturedImages.push({
    //             label: labelName,
    //             version: version,
    //             stageName: stagename,
    //             stagecode: stagecode,
    //             stage_id: stage_id,
    //             blob,
    //             filename: `${labelName}_${Date.now()}.png`,
    //         });
    //         console.log('capturedImages', capturedImages)
    //     }

    //     if (capturedImages.length === 0) {
    //         console.log("❌ No cameras captured images.");
    //         return;
    //     }
    //     setRes_img(capturedImages[0].blob);

    //     formData.append('comp_name', component_name_val);
    //     formData.append('comp_code', component_code_val);
    //     formData.append('comp_id', comp_id);
    //     formData.append('positive', vpositive);
    //     formData.append('negative', vnegative);
    //     formData.append('posble_match', vposble_match);
    //     formData.append('station_name', station_name);
    //     formData.append('station_id', station_id);
    //     formData.append('inspected_ondate', test_date);
    //     formData.append('date', _today);
    //     formData.append('time', time);
    //     formData.append('milliseconds', milliseconds);
    //     formData.append('batch_id', batch_id);
    //     formData.append('detect_selection', JSON.stringify(stationStages.detect_selection));
    //     formData.append('stage_profiles', JSON.stringify(stationStages.stage_profiles));
    //     formData.append('detect_type', compData.detection_type);
    //     formData.append('qrbar_result', qrbar_result);

    //     capturedImages.forEach((img, idx) => {
    //         formData.append(`datasets[${idx}]`, img.blob, img.filename);
    //         formData.append(`camera_labels[${idx}]`, img.label);
    //         formData.append(`model_versions[${idx}]`, img.version);
    //         formData.append(`stage_names[${idx}]`, img.stageName);
    //         formData.append(`stage_codes[${idx}]`, img.stagecode);
    //         formData.append(`stage_ids[${idx}]`, img.stage_id);
    //     });

    //     if (compData.detection_type === "Smart Object Locator") {
    //         formData.append('our_rectangles', JSON.stringify(compData?.rectangles));
    //         formData.append('selected_regions', JSON.stringify(compData?.selected_regions));
    //     }

    //     const compBarcode = barcode_data === null || barcode_data === undefined;

    //     try {
    //         const response = await urlSocket.post('/objectDetectionOnly_stg', formData, {
    //             headers: { 'content-type': 'multipart/form-data' },
    //             mode: 'no-cors'
    //         });

    //         console.log(`success702`, response.data);
    //         const resultsByCamera = {};

    //         response.data[0]?.detection_result.forEach(item => {
    //             resultsByCamera[item.camera_label] = item.detection_result;
    //         });

    //         console.log('resultsByCamera', resultsByCamera);
    //         let obj_result = resultsByCamera
    //         setRes_message(resultsByCamera);
    //         setShowstatus(true);

    //         const capturedImagesData = response.data[0].captured_image || [];
    //         const detectionResults = response.data[0].detection_result || [];
    //         const updatedRectanglesList = response.data[0].updated_rectangles || [];

    //         const hasNoObject = detectionResults.some(item => item.detection_result === 'No Object Detected');
    //         const hasIncorrectObject = detectionResults.some(item => item.detection_result === 'Incorrect Object');
    //         const hasObjectDetected = detectionResults.some(item => item.detection_result === 'Object Detected');

    //         setTimeout(async () => {
    //             if ((compData.detect_selection === true && hasObjectDetected) ||
    //                 (compData.detect_selection === false && obj_result === "")) {
    //                 console.log('compData724', compData)

    //                 let Checking = "Checking ...";
    //                 setRes_message(prev => {
    //                     const updated = { ...prev };
    //                     detectionResults.forEach(item => {
    //                         updated[item.camera_label] = "Checking ...";
    //                     });
    //                     return updated;
    //                 });
    //                 setShowstatus(true);

    //                 const { overAll_testing, region_selection: region_sel, region_wise_testing } = componentData[0];

    //                 try {
    //                     const detection = await urlSocket.post('/inspectionResult_stg', {
    //                         'comp_name': component_name_val,
    //                         "comp_code": component_code_val,
    //                         "batch_id": batch_id,
    //                         "captured_image": response.data[0].captured_image,
    //                         "insp_result_id": response.data[0].insp_result_id,
    //                         "start_time_with_milliseconds": response.data[0].start_time_with_milliseconds,
    //                         "positive": positive,
    //                         "negative": negative,
    //                         "posble_match": posble_match,
    //                         "background": compData.background,
    //                         "overAll_testing": overAll_testing,
    //                         "region_selection": region_sel,
    //                         "region_wise_testing": region_wise_testing,
    //                         "stage_profiles": stationStages.stage_profiles,
    //                     }, { mode: 'no-cors' });

    //                     console.log('detection : ', detection);
    //                     setShowstatus(false);
    //                     setInspection_started(false);

    //                     const testing_result = {};
    //                     detection?.data?.prediction.forEach(item => {
    //                         testing_result[item.camera_label] = item.status;
    //                     });

    //                     console.log('testing_result', testing_result);

    //                     const originalWidth = 640;
    //                     const originalHeight = 480;
    //                     const targetWidth = DEFAULT_RESOLUTION.width;
    //                     const targetHeight = DEFAULT_RESOLUTION.height;

    //                     const scaleX = targetWidth / originalWidth;
    //                     const scaleY = targetHeight / originalHeight;
    //                     const rectanglesByCam = {};

    //                     detection.data.prediction.forEach((cameraResult) => {
    //                         const backendLabel = cameraResult.camera_label.charAt(0).toUpperCase() + cameraResult.camera_label.slice(1);
    //                         console.log('backendLabel', backendLabel, cameraResult)

    //                         const matchingCamera = cameraList.find(cam =>
    //                             cam.label === backendLabel &&
    //                             cam.stageName === cameraResult.stage_name
    //                         );
    //                         console.log('matchingCamera', matchingCamera)

    //                         if (!matchingCamera) {
    //                             console.warn(`⚠️ No matching camera found for ${backendLabel}`);
    //                             return;
    //                         }

    //                         const frontendLabel = matchingCamera.label;
    //                         console.log('frontendLabel', frontendLabel)

    //                         const retrievedRectangles = cameraResult.region_results.map((rect) => ({
    //                             x: rect.rectangles.coordinates.x / scaleX,
    //                             y: rect.rectangles.coordinates.y / scaleY,
    //                             height: rect.rectangles.coordinates.height / scaleY,
    //                             width: rect.rectangles.coordinates.width / scaleX,
    //                             id: rect.rectangles.id,
    //                             name: rect.rectangles.name,
    //                             colour: rect.result === "OK" ? "green" : "red",
    //                             result: rect.result,
    //                             value: rect.value
    //                         }));
    //                         console.log('retrievedRectangles', retrievedRectangles)

    //                         rectanglesByCam[frontendLabel] = retrievedRectangles;
    //                         console.log(`Mapped ${backendLabel} → ${frontendLabel}`);
    //                     });

    //                     const final_result = detection?.data?.results?.final_result
    //                     console.log('final_result', final_result, positive)

    //                     setResponse_message(testing_result);
    //                     setShowresult(true);
    //                     setRectanglesByCamera(rectanglesByCam)
    //                     setShow(true)
    //                     setShowdata(true);

    //                     if (final_result === positive) {
    //                         let positive_msg = final_result.replaceAll(final_result, config_positive);
    //                         ok_count++;
    //                         old_ok++;
    //                         old_total++;
    //                         t_count = ok_count + ng_count + ps_match;
    //                         setResponse_value(final_result);
    //                         setResult_key(true);
    //                         setQrbar_countdown_active(compBarcode === false ? true : undefined);
    //                         setComp_result(compBarcode === false ? 2 : undefined);
    //                     } else if (final_result === negative) {
    //                         let negative_msg = final_result.replaceAll(final_result, config_negative);
    //                         console.log('negative_msg', negative_msg)
    //                         ng_count++;
    //                         old_ng++;
    //                         old_total++;
    //                         t_count = ok_count + ng_count + ps_match;
    //                         setResponse_value(final_result);
    //                         setResult_key(true);
    //                         setQrbar_countdown_active(compBarcode === false ? true : undefined);
    //                         setComp_result(compBarcode === false ? 1 : undefined);
    //                     } else if (testing_result === posble_match) {
    //                         let posble_match_msg = testing_result.replaceAll(testing_result, config_posble_match);
    //                         ps_match++;
    //                         old_pm++;
    //                         old_total++;
    //                         t_count = ok_count + ng_count + ps_match;
    //                         console.log('posbl_match563', posble_match_msg);
    //                         setResponse_value(final_result);
    //                         setResult_key(true);
    //                         setQrbar_countdown_active(compBarcode === false ? true : undefined);
    //                     }

    //                     // ✅ CRITICAL FIX: Move handleNextStage here, AFTER inspectionResult_stg completes
    //                     if (compData.capture_mode === "Sequential") {
    //                         setTimeout(() => {
    //                             handleNextStage();
    //                         }, 800);
    //                     }

    //                 } catch (inspectionError) {
    //                     console.error('Error in inspectionResult_stg:', inspectionError);
    //                     setInspection_started(false);

    //                     // Still proceed to next stage even if inspection fails
    //                     if (compData.capture_mode === "Sequential") {
    //                         setTimeout(() => {
    //                             handleNextStage();
    //                         }, 800);
    //                     }
    //                 }
    //             } else {
    //                 // If detection conditions not met, still move to next stage
    //                 if (compData.capture_mode === "Sequential") {
    //                     setTimeout(() => {
    //                         handleNextStage();
    //                     }, 800);
    //                 }
    //             }
    //         }, 500);

    //     } catch (error) {
    //         console.error('/API ERROR, OBJECT_DETECTION or INSPECTION_RESULT ', error);
    //         setInspection_started(false);

    //         // Even on error, proceed to next stage to avoid getting stuck
    //         if (compData.capture_mode === "Sequential") {
    //             setTimeout(() => {
    //                 handleNextStage();
    //             }, 500);
    //         }
    //     }
    // };




    // const object_detection = async () => {
    //     if (compData.capture_mode === "Sequential" && currentStageIndex >= cameraList.length) {
    //         console.log("⛔ All stages already completed, stopping inspection");
    //         return;
    //     }
    //     console.log('print123 1');
    //     setInspection_started(true);
    //     setPlaceobj_count(prev => prev + 1);
    //     setShowdata(false);
    //     setShowresult(false);
    //     setShowstatus(false);
    //     setRectangles([]);
    //     setRectanglesByCamera({})
    //     setResponse_value("")
    //     setShow(false)

    //     const formData = new FormData();
    //     let component_code_val = component_code1;
    //     let component_name_val = component_name1;
    //     let vpositive = positive;
    //     let vnegative = negative;
    //     let vposble_match = posble_match;

    //     let today = new Date();
    //     let yyyy = today.getFullYear();
    //     let mm = today.getMonth() + 1;
    //     let dd = today.getDate();
    //     let _today = dd + '/' + mm + '/' + yyyy;
    //     let test_date = yyyy + '-' + mm + '-' + dd;

    //     let hours = today.getHours();
    //     let min = today.getMinutes();
    //     let secc = today.getSeconds();
    //     let time = hours + ':' + min + ':' + secc;
    //     let milliseconds = hours + ':' + min + ':' + secc + '.' + today.getMilliseconds().toString().padStart(3, '0').slice(0, 5);
    //     let replace = _today + '_' + time.replaceAll(":", "_");

    //     let compdata = component_name_val + "_" + component_code_val + '_' + replace;

    //     const capturedImages = [];

    //     const camerasToCapture =
    //         compData.capture_mode === "Sequential"
    //             ? [cameraList[currentStageIndex]]
    //             : cameraList;

    //     for (const cam of camerasToCapture) {
    //         console.log('cam', cam)
    //         const labelName = cam.label;
    //         const version = cam.model_ver;
    //         const stagename = cam.stageName;
    //         const stagecode = cam.stage_code;
    //         const stage_id = cam.stage_id;
    //         const originalLabel = cam.originalLabel;
    //         const webcamInstance = webcamRef.current?.[originalLabel];
    //         console.log('webcamInstance', webcamInstance)

    //         if (!webcamInstance || !webcamInstance.captureZoomedImage) {
    //             console.warn(`⚠️ Webcam not ready for ${labelName}`);
    //             continue;
    //         }

    //         const imageSrc = await webcamInstance.captureZoomedImage();
    //         if (!imageSrc) {
    //             console.warn(`⚠️ Failed to capture from ${labelName}`);
    //             continue;
    //         }

    //         const blob = await fetch(imageSrc).then((r) => r.blob());
    //         capturedImages.push({
    //             label: labelName,
    //             version: version,
    //             stageName: stagename,
    //             stagecode: stagecode,
    //             stage_id: stage_id,
    //             blob,
    //             filename: `${labelName}_${Date.now()}.png`,
    //         });
    //         console.log('capturedImages', capturedImages)
    //     }

    //     if (capturedImages.length === 0) {
    //         console.log("❌ No cameras captured images.");
    //         return;
    //     }



    //     setRes_img(capturedImages[0].blob);

    //     formData.append('comp_name', component_name_val);
    //     formData.append('comp_code', component_code_val);
    //     formData.append('comp_id', comp_id);
    //     formData.append('positive', vpositive);
    //     formData.append('negative', vnegative);
    //     formData.append('posble_match', vposble_match);
    //     formData.append('station_name', station_name);
    //     formData.append('station_id', station_id);
    //     formData.append('inspected_ondate', test_date);
    //     formData.append('date', _today);
    //     formData.append('time', time);
    //     formData.append('milliseconds', milliseconds);
    //     formData.append('batch_id', batch_id);
    //     formData.append('detect_selection', JSON.stringify(stationStages.detect_selection));
    //     formData.append('stage_profiles', JSON.stringify(stationStages.stage_profiles));
    //     formData.append('detect_type', compData.detection_type);
    //     formData.append('qrbar_result', qrbar_result);

    //     capturedImages.forEach((img, idx) => {
    //         formData.append(`datasets[${idx}]`, img.blob, img.filename);
    //         formData.append(`camera_labels[${idx}]`, img.label);
    //         formData.append(`model_versions[${idx}]`, img.version);
    //         formData.append(`stage_names[${idx}]`, img.stageName);
    //         formData.append(`stage_codes[${idx}]`, img.stagecode);
    //         formData.append(`stage_ids[${idx}]`, img.stage_id);
    //     });

    //     if (compData.detection_type === "Smart Object Locator") {
    //         formData.append('our_rectangles', JSON.stringify(compData?.rectangles));
    //         formData.append('selected_regions', JSON.stringify(compData?.selected_regions));
    //     }

    //     const compBarcode = barcode_data === null || barcode_data === undefined;

    //     try {
    //         const response = await urlSocket.post('/objectDetectionOnly_stg', formData, {
    //             headers: { 'content-type': 'multipart/form-data' },
    //             mode: 'no-cors'
    //         });

    //         console.log(`success702`, response.data);
    //         const resultsByCamera = {};

    //         response.data[0]?.detection_result.forEach(item => {
    //             resultsByCamera[item.camera_label] = item.detection_result;
    //         });

    //         console.log('resultsByCamera', resultsByCamera);
    //         let obj_result = resultsByCamera
    //         setRes_message(resultsByCamera);
    //         setShowstatus(true);

    //         const capturedImagesData = response.data[0].captured_image || [];
    //         const detectionResults = response.data[0].detection_result || [];
    //         const updatedRectanglesList = response.data[0].updated_rectangles || [];

    //         const hasNoObject = detectionResults.some(item => item.detection_result === 'No Object Detected');
    //         const hasIncorrectObject = detectionResults.some(item => item.detection_result === 'Incorrect Object');
    //         const hasObjectDetected = detectionResults.some(item => item.detection_result === 'Object Detected');

    //         setTimeout(async () => {
    //             if ((compData.detect_selection === true && hasObjectDetected) ||
    //                 (compData.detect_selection === false && obj_result === "")) {
    //                 console.log('compData724', compData)

    //                 let Checking = "Checking ...";
    //                 setRes_message(prev => {
    //                     const updated = { ...prev };
    //                     detectionResults.forEach(item => {
    //                         updated[item.camera_label] = "Checking ...";
    //                     });
    //                     return updated;
    //                 });
    //                 setShowstatus(true);

    //                 const { overAll_testing, region_selection: region_sel, region_wise_testing } = componentData[0];

    //                 try {
    //                     const detection = await urlSocket.post('/inspectionResult_stg', {
    //                         'comp_name': component_name_val,
    //                         "comp_code": component_code_val,
    //                         "batch_id": batch_id,
    //                         "captured_image": response.data[0].captured_image,
    //                         "insp_result_id": response.data[0].insp_result_id,
    //                         "start_time_with_milliseconds": response.data[0].start_time_with_milliseconds,
    //                         "positive": positive,
    //                         "negative": negative,
    //                         "posble_match": posble_match,
    //                         "background": compData.background,
    //                         "overAll_testing": overAll_testing,
    //                         "region_selection": region_sel,
    //                         "region_wise_testing": region_wise_testing,
    //                         "stage_profiles": stationStages.stage_profiles,
    //                     }, { mode: 'no-cors' });

    //                     console.log('detection : ', detection);
    //                     setShowstatus(false);
    //                     setInspection_started(false);

    //                     const testing_result = {};
    //                     detection?.data?.prediction.forEach(item => {
    //                         testing_result[item.camera_label] = item.status;
    //                     });

    //                     console.log('testing_result', testing_result);

    //                     const originalWidth = 640;
    //                     const originalHeight = 480;
    //                     const targetWidth = DEFAULT_RESOLUTION.width;
    //                     const targetHeight = DEFAULT_RESOLUTION.height;

    //                     const scaleX = targetWidth / originalWidth;
    //                     const scaleY = targetHeight / originalHeight;
    //                     const rectanglesByCam = {};

    //                     detection.data.prediction.forEach((cameraResult) => {
    //                         const backendLabel = cameraResult.camera_label.charAt(0).toUpperCase() + cameraResult.camera_label.slice(1);
    //                         console.log('backendLabel', backendLabel, cameraResult)

    //                         const matchingCamera = cameraList.find(cam =>
    //                             cam.label === backendLabel &&
    //                             cam.stageName === cameraResult.stage_name
    //                         );
    //                         console.log('matchingCamera', matchingCamera)

    //                         if (!matchingCamera) {
    //                             console.warn(`⚠️ No matching camera found for ${backendLabel}`);
    //                             return;
    //                         }

    //                         const frontendLabel = matchingCamera.label;
    //                         console.log('frontendLabel', frontendLabel)

    //                         const retrievedRectangles = cameraResult.region_results.map((rect) => ({
    //                             x: rect.rectangles.coordinates.x / scaleX,
    //                             y: rect.rectangles.coordinates.y / scaleY,
    //                             height: rect.rectangles.coordinates.height / scaleY,
    //                             width: rect.rectangles.coordinates.width / scaleX,
    //                             id: rect.rectangles.id,
    //                             name: rect.rectangles.name,
    //                             colour: rect.result === "OK" ? "green" : "red",
    //                             result: rect.result,
    //                             value: rect.value
    //                         }));
    //                         console.log('retrievedRectangles', retrievedRectangles)

    //                         rectanglesByCam[frontendLabel] = retrievedRectangles;
    //                         console.log(`Mapped ${backendLabel} → ${frontendLabel}`);
    //                     });

    //                     const final_result = detection?.data?.results?.final_result
    //                     console.log('final_result', final_result, positive)

    //                     setResponse_message(testing_result);
    //                     setShowresult(true);
    //                     setRectanglesByCamera(rectanglesByCam)
    //                     setShow(true)
    //                     setShowdata(true);

    //                     if (final_result === positive) {
    //                         let positive_msg = final_result.replaceAll(final_result, config_positive);
    //                         ok_count++;
    //                         old_ok++;
    //                         old_total++;
    //                         t_count = ok_count + ng_count + ps_match;
    //                         setResponse_value(final_result);
    //                         setResult_key(true);
    //                         setQrbar_countdown_active(compBarcode === false ? true : undefined);
    //                         setComp_result(compBarcode === false ? 2 : undefined);
    //                     } else if (final_result === negative) {
    //                         let negative_msg = final_result.replaceAll(final_result, config_negative);
    //                         console.log('negative_msg', negative_msg)
    //                         ng_count++;
    //                         old_ng++;
    //                         old_total++;
    //                         t_count = ok_count + ng_count + ps_match;
    //                         setResponse_value(final_result);
    //                         setResult_key(true);
    //                         setQrbar_countdown_active(compBarcode === false ? true : undefined);
    //                         setComp_result(compBarcode === false ? 1 : undefined);
    //                     } else if (testing_result === posble_match) {
    //                         let posble_match_msg = testing_result.replaceAll(testing_result, config_posble_match);
    //                         ps_match++;
    //                         old_pm++;
    //                         old_total++;
    //                         t_count = ok_count + ng_count + ps_match;
    //                         console.log('posbl_match563', posble_match_msg);
    //                         setResponse_value(final_result);
    //                         setResult_key(true);
    //                         setQrbar_countdown_active(compBarcode === false ? true : undefined);
    //                     }

    //                     // ✅ CRITICAL FIX: Move handleNextStage here, AFTER inspectionResult_stg completes
    //                     if (compData.capture_mode === "Sequential") {
    //                         setTimeout(() => {
    //                             handleNextStageAndInspect();
    //                         }, 800);
    //                     }

    //                 } catch (inspectionError) {
    //                     console.error('Error in inspectionResult_stg:', inspectionError);
    //                     setInspection_started(false);

    //                     // Still proceed to next stage even if inspection fails
    //                     if (compData.capture_mode === "Sequential") {
    //                         setTimeout(() => {
    //                             handleNextStageAndInspect();
    //                         }, 800);
    //                     }
    //                 }
    //             } else {
    //                 // If detection conditions not met, still move to next stage
    //                 if (compData.capture_mode === "Sequential") {
    //                     setTimeout(() => {
    //                         handleNextStageAndInspect();
    //                     }, 800);
    //                 }
    //             }
    //         }, 500);

    //     } catch (error) {
    //         console.error('/API ERROR, OBJECT_DETECTION or INSPECTION_RESULT ', error);
    //         setInspection_started(false);

    //         // Even on error, proceed to next stage to avoid getting stuck
    //         if (compData.capture_mode === "Sequential") {
    //             setTimeout(() => {
    //                 handleNextStageAndInspect();
    //             }, 500);
    //         }
    //     }
    // };





    // const handleNextStage = () => {
    //     if (currentStageIndex < cameraList.length - 1) {
    //         setCurrentStageIndex(prev => prev + 1);
    //     } else {
    //         // ✅ Finished all stages
    //         setShow_next(true);
    //         setInspection_started(false);
    //     }
    // }


    // // ✅ NEW: Automatically moves to next stage AND starts inspection
    // const handleNextStageAndInspect = () => {
    //     if (currentStageIndex < cameraList.length - 1) {
    //         setCurrentStageIndex(prev => prev + 1);

    //         // ✅ Automatically trigger inspection for next stage
    //         setTimeout(() => {
    //             object_detection();
    //         }, 1000);

    //     } else {
    //         // ✅ Finished all stages
    //         setShow_next(true);
    //         setInspection_started(false);
    //     }
    // };


    // const handleNextStageAndInspect = () => {
    //     if (currentStageIndex < cameraList.length - 1) {
    //         setCurrentStageIndex(prev => prev + 1);

    //         // ✅ Wait 2 seconds before auto-starting next inspection
    //         setTimeout(() => {
    //             object_detection();
    //         }, 2000); // Adjust delay as needed

    //     } else {
    //         setShow_next(true);
    //         setInspection_started(false);
    //     }
    // };

    // // Keep original for manual next button
    // const handleNextStage = () => {
    //     if (currentStageIndex < cameraList.length - 1) {
    //         setCurrentStageIndex(prev => prev + 1);
    //     } else {
    //         setShow_next(true);
    //         setInspection_started(false);
    //     }
    // };






    const uniqness_checking = async () => {
        setPlaceobj_count(prev => prev + 1);
        setShowdata(false);
        setShowresult(false);
        setShowstatus(false);

        const imageSrc = await webcamRef.current.captureZoomedImage();
        const blob = await fetch(imageSrc).then((res) => res.blob());
        const formData = new FormData();

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

        let compdata = component_name1 + "_" + component_code1 + '_' + replace;

        formData.append('comp_name', component_name1);
        formData.append('comp_code', component_code1);
        formData.append('comp_id', comp_id);
        formData.append('positive', positive);
        formData.append('negative', negative);
        formData.append('posble_match', posble_match);
        formData.append('datasets', blob, compdata + '.png');
        formData.append('station_name', station_name);
        formData.append('station_id', station_id);
        formData.append('inspected_ondate', test_date);
        formData.append('date', _today);
        formData.append('time', time);
        formData.append('milliseconds', milliseconds);
        formData.append('batch_id', batch_id);
        formData.append('detect_type', compData.detection_type);
        formData.append('qruniq', qruniq_checking);

        try {
            const response = await urlSocket.post('/QRobjectDetectionOnly', formData, {
                headers: { 'content-type': 'multipart/form-data' },
                mode: 'no-cors'
            });

            let data = response.data;
            console.log('data237', data);
            setRes_message(response.data[0].detection_result);
            setShowstatus(true);

            setTimeout(() => {
                if (response.data[0].detection_result === 'New Data found') {
                    let Checking = "Checking ...";
                    setRes_message(Checking);
                    setShowstatus(true);

                    urlSocket.post('/inspectionResult', {
                        'comp_name': component_name1,
                        "comp_code": component_code1,
                        "batch_id": batch_id,
                        "captured_image": response.data[0].captured_image,
                        "insp_result_id": response.data[0].insp_result_id,
                        "start_time_with_milliseconds": response.data[0].start_time_with_milliseconds,
                        "positive": positive,
                        "negative": negative,
                        "posble_match": posble_match,
                    }, { mode: 'no-cors' })
                        .then(detection => {
                            setShowstatus(false);
                            let testing_result = detection.data[0].status;

                            if (testing_result === positive) {
                                let positive_msg = testing_result.replaceAll(testing_result, config_positive);
                                // ok_count++;
                                // old_ok++;
                                // old_total++;
                                // t_count = ok_count + ng_count + ps_match;

                                setOkCount(prev => prev + 1);
                                setOldOk(prev => prev + 1);
                                setOldTotal(prev => prev + 1);

                                setTCount(prev => prev + 1);


                                setResponse_message(positive_msg);
                                setResponse_value(detection.data[0].value);
                                setShowresult(true);
                                setResult_key(true);
                            } else if (testing_result === negative) {
                                let negative_msg = testing_result.replaceAll(testing_result, config_negative);
                                // ng_count++;
                                // old_ng++;
                                // old_total++;
                                // t_count = ok_count + ng_count + ps_match;

                                setNgCount(prev => prev + 1);
                                setOldNg(prev => prev + 1);
                                setOldTotal(prev => prev + 1);

                                setTCount(prev => prev + 1);
                                setResponse_message(negative_msg);
                                setResponse_value(detection.data[0].value);
                                setShowresult(true);
                                setResult_key(true);
                            } else if (testing_result === posble_match) {
                                let posble_match_msg = testing_result.replaceAll(testing_result, config_posble_match);
                                // ps_match++;
                                // old_pm++;
                                // old_total++;
                                // t_count = ok_count + ng_count + ps_match;
                                setPsMatch(prev => prev + 1);
                                setOldPm(prev => prev + 1);
                                setOldTotal(prev => prev + 1);

                                // Update total count
                                setTCount(prev => prev + 1);

                                setResponse_message(posble_match_msg);
                                setResponse_value(detection.data[0].value);
                                setShowresult(true);
                                setResult_key(true);
                            }
                            appCall();
                        });
                } else {
                    appCall();
                }
            }, 300);
        } catch (error) {
            console.log('error', error);
        }
    };

    const uniq_object_detection = async () => {
        setPlaceobj_count(prev => prev + 1);
        setShowdata(false);
        setShowresult(false);
        setShowstatus(false);

        const imageSrc = await webcamRef.current.captureZoomedImage();
        const blob = await fetch(imageSrc).then((res) => res.blob());
        const formData = new FormData();

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

        let compdata = component_name1 + "_" + component_code1 + '_' + replace;

        formData.append('comp_name', component_name1);
        formData.append('comp_code', component_code1);
        formData.append('comp_id', comp_id);
        formData.append('positive', positive);
        formData.append('negative', negative);
        formData.append('posble_match', posble_match);
        formData.append('datasets', blob, compdata + '.png');
        formData.append('station_name', station_name);
        formData.append('station_id', station_id);
        formData.append('inspected_ondate', test_date);
        formData.append('date', _today);
        formData.append('time', time);
        formData.append('milliseconds', milliseconds);
        formData.append('batch_id', batch_id);
        formData.append('detect_type', compData.detection_type);
        formData.append('qruniq', qruniq_checking);

        try {
            const response = await urlSocket.post('/QRobjectDetectionOnly', formData, {
                headers: { 'content-type': 'multipart/form-data' },
                mode: 'no-cors'
            });

            console.log(`success`, response.data);
            setRes_message(response.data[0].detection_result);
            setShowstatus(true);

            setTimeout(() => {
                if (response.data[0].detection_result === 'Qr Code Found') {
                    let Checking = "Checking ...";
                    setRes_message(Checking);
                    setShowstatus(true);

                    urlSocket.post('/inspectionResult', {
                        'comp_name': component_name1,
                        "comp_code": component_code1,
                        "batch_id": batch_id,
                        "captured_image": response.data[0].captured_image,
                        "insp_result_id": response.data[0].insp_result_id,
                        "start_time_with_milliseconds": response.data[0].start_time_with_milliseconds,
                        "positive": positive,
                        "negative": negative,
                        "posble_match": posble_match,
                    }, { mode: 'no-cors' })
                        .then(detection => {
                            console.log('data720: ', detection);
                            setShowstatus(false);
                            let testing_result = detection.data[0].status;

                            if (testing_result === positive) {
                                let positive_msg = testing_result.replaceAll(testing_result, config_positive);
                                // ok_count++;
                                // old_ok++;
                                // old_total++;
                                // t_count = ok_count + ng_count + ps_match;

                                setNsetOkCountgCount(prev => prev + 1);
                                setOldOk(prev => prev + 1);
                                setOldTotal(prev => prev + 1);

                                setTCount(prev => prev + 1);

                                setResponse_message(positive_msg);
                                setResponse_value(detection.data[0].value);
                                setShowresult(true);
                                setResult_key(true);
                            } else if (testing_result === negative) {
                                let negative_msg = testing_result.replaceAll(testing_result, config_negative);
                                // ng_count++;
                                // old_ng++;
                                // old_total++;
                                // t_count = ok_count + ng_count + ps_match;

                                setNgCount(prev => prev + 1);
                                setOldNg(prev => prev + 1);
                                setOldTotal(prev => prev + 1);

                                setTCount(prev => prev + 1);


                                setResponse_message(negative_msg);
                                setResponse_value(detection.data[0].value);
                                setShowresult(true);
                                setResult_key(true);
                            } else if (testing_result === posble_match) {
                                let posble_match_msg = testing_result.replaceAll(testing_result, config_posble_match);
                                // ps_match++;
                                // old_pm++;
                                // old_total++;
                                // t_count = ok_count + ng_count + ps_match;

                                setPsMatch(prev => prev + 1);
                                setOldPm(prev => prev + 1);
                                setOldTotal(prev => prev + 1);

                                // Update total count
                                setTCount(prev => prev + 1);

                                setResponse_message(posble_match_msg);
                                setResponse_value(detection.data[0].value);
                                setShowresult(true);
                                setResult_key(true);
                            }
                            appCall();
                        });
                } else {
                    appCall();
                }
            }, 300);
        } catch (error) {
            console.error(error);
        }
    };

    const find_qrbarcode = async () => {
        setShowstatus(true);
        setRes_message('Detecting Barcode');
        setQrbar_found(0);
        setQrbar_result(0);
        setComp_found(0);
        setComp_result(0);
        setShowresult(false);

        if (inspection_type === 'Manual') {
            setQrbar_start_btn(false);
        } else {
            setQrbar_countdown_active(false);
        }

        await new Promise(resolve => setTimeout(resolve, 1500));

        const imageSrc = await webcamRef.current.captureZoomedImage();
        const blob = await fetch(imageSrc).then((res) => res.blob());
        const formData = new FormData();

        let today = new Date();
        let yyyy = today.getFullYear();
        let mm = today.getMonth() + 1;
        let dd = today.getDate();
        let _today = dd + '/' + mm + '/' + yyyy;
        let hours = today.getHours();
        let min = today.getMinutes();
        let secc = today.getSeconds();
        let time = hours + ':' + min + ':' + secc;
        let milliseconds = hours + ':' + min + ':' + secc + '.' + today.getMilliseconds().toString().padStart(3, '0').slice(0, 5);
        let replace = _today + '_' + time.replaceAll(":", "_");

        let compdata = component_name1 + "_" + component_code1 + '_' + replace;

        formData.append('comp_id', compData._id);
        formData.append('datasets', blob, compdata + '.png');

        try {
            const response = await urlSocket.post("/barcode_compare", formData, {
                headers: { "content-type": "multipart/form-data" },
                mode: "no-cors",
            });

            console.log('barcode_detection: ', response.data);
            let code_data = response.data.result;

            if (code_data === 'Barcode is correct') {
                setRes_message(code_data);
                setQrbar_found(2);
                setTimeout(() => {
                    setShowstatus('');
                    setRes_message('');
                    setQrbar_result(2);
                    setShow(inspection_type === 'Manual' ? true : undefined);
                    setIsCountdownActive(inspection_type !== 'Manual' ? true : undefined);
                    setShowdata(inspection_type !== 'Manual' ? true : undefined);
                }, 1000);
            } else if (code_data === 'Barcode is incorrect') {
                console.log('data2291 ', qrbar_check_type);
                if ((qrbar_check_type === null) || (qrbar_check_type === undefined) || (parseInt(qrbar_check_type) === 1)) {
                    setRes_message(code_data);
                    setQrbar_found(2);
                    setTimeout(() => {
                        setShowstatus('');
                        setRes_message('');
                        setQrbar_result(1);
                        setShow(inspection_type === 'Manual' ? true : undefined);
                        setIsCountdownActive(inspection_type !== 'Manual' ? true : undefined);
                        setShowdata(inspection_type !== 'Manual' ? true : undefined);
                    }, 1000);
                } else if (parseInt(qrbar_check_type) === 0) {
                    setRes_message(code_data);
                    setQrbar_found(2);
                    setQrbar_result(1);
                    setQrbar_start_btn(inspection_type === 'Manual' ? true : false);
                    setQrbar_countdown_active(inspection_type !== 'Manual');
                }
            } else if (code_data === 'Unable to read Barcode') {
                setRes_message(code_data);
                setQrbar_found(1);
                setQrbar_start_btn(inspection_type === 'Manual' ? true : false);
                setQrbar_countdown_active(inspection_type !== 'Manual');
            }
        } catch (error) {
            console.log(error);
        }
    };

    const convertTo12HourFormat = (time) => {
        const [hours, minutes, seconds] = time.split(':');
        const parsedHours = parseInt(hours, 10);
        const amPm = parsedHours >= 12 ? 'PM' : 'AM';
        const hour12 = parsedHours === 0 ? 12 : parsedHours > 12 ? parsedHours - 12 : parsedHours;
        return `${hour12}:${minutes}:${seconds} ${amPm}`;
    };

    const formatDuration = (milliseconds) => {
        const seconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getImage = (image_path, type) => {
        if (image_path === undefined) return "";
        let baseurl = ImageUrl;
        let output = '';
        if (type === 'ok') {
            let result = image_path.replaceAll("\\", "/");
            output = baseurl + result;
            return output;
        }
    };

    const goBack = () => {
        test_opt();
        try {
            urlSocket.post('/update_batch', {
                'id': batch_id,
                'ok_count': okCount,
                'ng_count': ngCount,
                'ps_count': psMatch,
                'total': tCount,
                'today_total': oldTotal,
                'station_name': station_name,
                'station_id': station_id
            }, { mode: 'no-cors' });
        } catch (error) {
            console.log(error);
        }

        // ng_count = 0;
        // ok_count = 0;
        // ps_match = 0;
        // t_count = 0;
        setNgCount(0);
        setOkCount(0);
        setPsMatch(0);
        setTCount(0);
        history.push('/crudcomponent');
    };

    const test_opt = async () => {
        try {
            await urlSocket.post('/test_opt', { 'id': batch_id }, { mode: 'no-cors' });
        } catch (error) {
            console.log("----", error);
        }
    };

    const table_show = async (component, index) => {
        console.log('today_detais1232354345560', component);

        try {
            const response = await urlSocket.post('/update_current_details', { 'id': batch_id }, { mode: 'no-cors' });
            let req_data = response.data;
            console.log('update_status654321', req_data);

            const sessionResponse = await urlSocket.post('/session_details', {
                "comp_name": component.comp_name,
                "comp_code": component.comp_code
            }, { mode: 'no-cors' });

            const currentDate = new Date();
            const req_data_processed = sessionResponse.data.map(item => {
                const startTime = new Date(`${currentDate.toISOString().substr(0, 10)}T${item.sorted_start_time}`);
                const endTime = new Date(`${currentDate.toISOString().substr(0, 10)}T${item.sorted_end_time}`);
                const durationInSeconds = (endTime - startTime) / 1000;

                const hours = String(Math.floor(durationInSeconds / 3600)).padStart(2, '0');
                const minutes = String(Math.floor((durationInSeconds % 3600) / 60)).padStart(2, '0');
                const seconds = String(Math.floor(durationInSeconds % 60)).padStart(2, '0');

                const convertedStartTime = convertTo12HourFormat(item.sorted_start_time);
                const convertedEndTime = convertTo12HourFormat(item.sorted_end_time);

                item.duration = `${hours}:${minutes}:${seconds}`;
                item.start_time = convertedStartTime;
                item.end_time = convertedEndTime;
                return item;
            });

            setManage_details(req_data_processed);

            if (compNo === index) {
                setSession_detail(!session_detail);
            } else {
                setSession_detail(true);
            }

            setCompNo(index);
        } catch (error) {
            console.log(error);
        }
    };

    const tog_xlarge = async () => {
        try {
            const response = await urlSocket.post('/today_detail', { 'id': batch_id }, { mode: 'no-cors' });
            let comp_info = response.data["comp_info"];
            let session_info = response.data["session_info"];

            const currentDate = new Date();
            let totalDurationInSeconds = 0;

            comp_info.forEach(comp => {
                const sessionsForComponent = session_info.filter(session =>
                    session.comp_name === comp.comp_name &&
                    session.comp_code === comp.comp_code &&
                    session.date === comp.date
                );

                let totalDurationInSeconds = 0;
                let totalNoOfSession = 0;

                sessionsForComponent.forEach(session => {
                    const startTime = new Date(`${currentDate.toISOString().substr(0, 10)}T${session.sorted_start_time}`);
                    const endTime = new Date(`${currentDate.toISOString().substr(0, 10)}T${session.sorted_end_time}`);
                    const durationInSeconds = (endTime - startTime) / 1000;
                    totalDurationInSeconds += durationInSeconds;
                    totalNoOfSession += 1;

                    const hours = String(Math.floor(durationInSeconds / 3600)).padStart(2, '0');
                    const minutes = String(Math.floor((durationInSeconds % 3600) / 60)).padStart(2, '0');
                    const seconds = String(Math.floor(durationInSeconds % 60)).padStart(2, '0');

                    const convertedStartTime = convertTo12HourFormat(session.sorted_start_time);
                    const convertedEndTime = convertTo12HourFormat(session.sorted_end_time);

                    session.duration = `${hours}:${minutes}:${seconds}`;
                    session.sorted_start_time = convertedStartTime;
                    session.sorted_end_time = convertedEndTime;
                });

                const totalHours = String(Math.floor(totalDurationInSeconds / 3600)).padStart(2, '0');
                const totalMinutes = String(Math.floor((totalDurationInSeconds % 3600) / 60)).padStart(2, '0');
                const totalSeconds = String(Math.floor(totalDurationInSeconds % 60)).padStart(2, '0');

                const totalDuration2 = `${totalHours}:${totalMinutes}:${totalSeconds}`;
                const NoOfSession = totalNoOfSession;

                comp.total_duration = totalDuration2;
                comp.session_count = NoOfSession;
            });

            console.log("total_duration", comp_info);
            setReport_data(comp_info);

            if (activeTab === "2") {
                timeSheet();
            }
        } catch (error) {
            console.log("----", error);
        }

        setModal_xlarge(prev => !prev);
    };

    const timeSheet = async () => {
        console.log('timesheet function is called');
        try {
            const response = await urlSocket.post('/time_sheet', { 'id': batch_id }, { mode: 'no-cors' });
            const currentDate = new Date();

            let totalDurationInSeconds = 0, totalTotal_val = 0, totalOk_val = 0, totalNG_val = 0, totalNoObj_val = 0, totalincorrect_val = 0;

            let time_data = response.data.map(item => {
                const startTime = new Date(`${currentDate.toISOString().substr(0, 10)}T${item.start_time}`);
                const endTime = new Date(`${currentDate.toISOString().substr(0, 10)}T${item.end_time}`);
                const durationInSeconds = (endTime - startTime) / 1000;
                totalDurationInSeconds += durationInSeconds;
                totalTotal_val += item.total;
                totalOk_val += item.ok;
                totalNG_val += item.notok;
                totalNoObj_val += item.no_obj;
                totalincorrect_val += item.incorrect_obj;

                const hours = String(Math.floor(durationInSeconds / 3600)).padStart(2, '0');
                const minutes = String(Math.floor((durationInSeconds % 3600) / 60)).padStart(2, '0');
                const seconds = String(Math.floor(durationInSeconds % 60)).padStart(2, '0');

                const convertedStartTime = convertTo12HourFormat(item.start_time);
                const convertedEndTime = convertTo12HourFormat(item.end_time);

                item.duration = `${hours}:${minutes}:${seconds}`;
                item.start_time = convertedStartTime;
                item.end_time = convertedEndTime;
                return item;
            });

            const totalHours = String(Math.floor(totalDurationInSeconds / 3600)).padStart(2, '0');
            const totalMinutes = String(Math.floor((totalDurationInSeconds % 3600) / 60)).padStart(2, '0');
            const totalSeconds = String(Math.floor(totalDurationInSeconds % 60)).padStart(2, '0');

            const totalDuration1_val = `${totalHours}:${totalMinutes}:${totalSeconds}`;
            console.log("timeshet backend works", time_data, totalDuration1_val);

            setTime_sheet(time_data);
            setTotal_sn_tmsht(time_data.length);
            setTotalDuration1(totalDuration1_val);
            setTotalOk(totalOk_val);
            setTotalNG(totalNG_val);
            setTotalNoObj(totalNoObj_val);
            setTotalincorrect(totalincorrect_val);
            setTotalTotal(totalTotal_val);
        } catch (error) {
            console.log("----", error);
        }
    };

    const toggle = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };

    const showOutline = () => {
        setShow_outline(prev => !prev);
    };

    const newOutlineChange = (ot_label) => {
        setDefault_outline(ot_label);

        if (!_comp_info) return;

        const pathMap = {
            'White Outline': _comp_info.datasets[0].white_path,
            'Red Outline': _comp_info.datasets[0].red_path,
            'Green Outline': _comp_info.datasets[0].green_path,
            'Blue Outline': _comp_info.datasets[0].blue_path,
            'Black Outline': _comp_info.datasets[0].black_path,
            'Orange Outline': _comp_info.datasets[0].orange_path,
            'Yellow Outline': _comp_info.datasets[0].yellow_path
        };

        setOutline_path(pathMap[ot_label] || '');
    };



    //
    const videoConstraints = {
        width: DEFAULT_RESOLUTION.width,
        height: DEFAULT_RESOLUTION.height,
        facingMode: "user"
    };



    const uniqueCameras = cameraList.filter(
        (cam, index, self) =>
            index === self.findIndex((c) =>
                // c.stageName === cam.stageName && c.originalLabel === cam.originalLabel
                c.label === cam.label && c.originalLabel === cam.originalLabel
            )
    );
    console.log('uniqueCameras', uniqueCameras, cameraList)

    const activeCamera = cameraList[currentStageIndex];
    console.log('activeCamera', activeCamera)
    // const SequentialCameraView = ({ camera, onNext }) => (
    //     <Card>
    //         <CardBody>
    //             <h4>{camera.stageName || camera.label}</h4>

    //             <WebcamCapture
    //                 ref={(el) => webcamRef.current[camera.originalLabel] = el}
    //                 resolution={DEFAULT_RESOLUTION}
    //                 zoom={zoom_value?.zoom}
    //                 center={zoom_value?.center}
    //             />

    //             {showstatus && res_message[camera.label] && (
    //                 <h3>{res_message[camera.label]}</h3>
    //             )}

    //             {showresult && response_message[camera.label] && (
    //                 <h2>{response_message[camera.label]}</h2>
    //             )}

    //             {show_next && (
    //                 <Button onClick={onNext}>Next Stage</Button>
    //             )}
    //         </CardBody>
    //     </Card>
    // );

    // SequentialCameraView.propTypes = {
    //     camera: PropTypes.shape({
    //         stageName: PropTypes.string,
    //         label: PropTypes.string,
    //         originalLabel: PropTypes.string,
    //         model_ver: PropTypes.string,
    //         stage_code: PropTypes.string,
    //         stage_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    //     }).isRequired,
    //     onNext: PropTypes.func.isRequired
    // };

    return (
        <>
            {is_loading_models && <FullScreenLoader />}

            <MetaTags>
                <title>Component Information</title>
            </MetaTags>

            <div className="page-content ">
                <Row className="mb-3">
                    <Col xs={9}>
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="mb-0 mt-2 m-2 font-size-14 fw-bold">
                                INSPECTION PAGE
                            </div>
                        </div>
                    </Col>
                    <Col xs={3} className="d-flex align-items-center justify-content-end">
                        {inspection_type === "Manual" ? (
                            <button
                                className="btn btn-outline-primary btn-sm me-2"
                                color="primary"
                                onClick={() => tog_xlarge()}
                                disabled={inspection_started}
                            >
                                Details <i className="mdi mdi-file-document-outline"></i>
                            </button>
                        ) : showDetail ? (
                            <button
                                className="btn btn-outline-primary btn-sm me-2"
                                color="primary"
                                onClick={() => tog_xlarge()}
                                disabled={inspection_started}
                            >
                                Details <i className="mdi mdi-file-document-outline"></i>
                            </button>
                        ) : null}

                        <button
                            className="btn btn-outline-primary btn-sm me-2"
                            color="primary"
                            onClick={() => goBack()}
                            disabled={inspection_started}
                        >
                            Back <i className="mdi mdi-arrow-left"></i>
                        </button>
                    </Col>
                </Row>

                <Container fluid>
                    <Card>
                        <CardBody>
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 flex-wrap">
                                <div className="d-flex flex-wrap gap-2 align-items-center">
                                    <div className="px-3 py-1 bg-primary text-white rounded-pill d-flex align-items-center">
                                        <span className="fw-bold me-1">Component Name:</span>
                                        <span>{component_name}</span>
                                    </div>

                                    <div className="px-3 py-1 bg-primary text-white rounded-pill d-flex align-items-center">
                                        <span className="fw-bold me-1">Component Code:</span>
                                        <span>{component_code}</span>
                                    </div>
                                </div>

                                {outline_checkbox && (
                                    <div className="d-flex flex-column flex-sm-row align-items-start gap-3 border">
                                        {show_outline && (
                                            <div className="d-flex align-items-center flex-wrap gap-2 p-1 my-auto">
                                                <Label className="mb-0 fw-bold">Outline Color:</Label>
                                                <div className="d-flex flex-wrap gap-2">
                                                    {outline_colors.map((otline, otl_id) => (
                                                        <Button
                                                            key={otl_id}
                                                            className="border-0"
                                                            style={{
                                                                width: '24px',
                                                                height: '24px',
                                                                borderRadius: '50%',
                                                                backgroundColor:
                                                                    otline === "White Outline" ? '#f9f9f9' :
                                                                        otline === "Red Outline" ? 'red' :
                                                                            otline === "Green Outline" ? 'green' :
                                                                                otline === "Blue Outline" ? 'blue' :
                                                                                    otline === "Black Outline" ? 'black' :
                                                                                        otline === "Orange Outline" ? 'orange' :
                                                                                            otline === "Yellow Outline" ? 'yellow' : 'gray',
                                                                boxShadow:
                                                                    otline === "White Outline"
                                                                        ? default_outline === otline
                                                                            ? '0 0 5px 2px rgba(0, 0, 0, 0.3)'
                                                                            : 'inset 0 0 0 1px #ccc, 0 0 5px rgba(0,0,0,0.05)'
                                                                        : default_outline === otline
                                                                            ? '0 0 5px 2px rgba(0,0,0,0.5)'
                                                                            : 'none',
                                                                border: otline === "White Outline" ? '1px solid #999' : 'none',
                                                            }}
                                                            onClick={() => newOutlineChange(otline)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="p-2 border rounded bg-light d-flex align-items-center">
                                            <FormGroup check className="mb-0">
                                                <Label check className="d-flex align-items-center mb-0">
                                                    <Input
                                                        type="checkbox"
                                                        checked={show_outline}
                                                        onChange={() => showOutline()}
                                                        className="me-2"
                                                    />
                                                    <span className="fw-bold" style={{ userSelect: "none" }}>Show Outline</span>
                                                </Label>
                                            </FormGroup>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {qrbar && (
                                <Row>
                                    <Col>
                                        <Card className="mb-3">
                                            <CardBody>
                                                <Table style={{ width: '50%', margin: 'auto', textAlign: 'center' }} bordered>
                                                    <thead className="compNamCod_txt">
                                                        <tr>
                                                            <td colSpan="2">Barcode</td>
                                                            <td colSpan="2">Component</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Presence</td>
                                                            <td>Check</td>
                                                            {compData?.detect_selection && <td>Presence</td>}
                                                            <td>Check</td>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                {qrbar_found === 0 ? (
                                                                    <ExclamationCircleOutlined className="zoom-in" style={{ color: 'deepskyblue', fontSize: '1.5rem' }} />
                                                                ) : qrbar_found === 1 ? (
                                                                    <CloseCircleOutlined className="zoom-in" style={{ color: 'red', fontSize: '1.5rem' }} />
                                                                ) : qrbar_found === 2 && (
                                                                    <CheckCircleOutlined className="zoom-in" style={{ color: 'green', fontSize: '1.5rem' }} />
                                                                )}
                                                            </td>
                                                            <td>
                                                                {qrbar_result === 0 ? (
                                                                    <ExclamationCircleOutlined className="zoom-in" style={{ color: 'deepskyblue', fontSize: '1.5rem' }} />
                                                                ) : qrbar_result === 1 ? (
                                                                    <CloseCircleOutlined className="zoom-in" style={{ color: 'red', fontSize: '1.5rem' }} />
                                                                ) : qrbar_result === 2 && (
                                                                    <CheckCircleOutlined className="zoom-in" style={{ color: 'green', fontSize: '1.5rem' }} />
                                                                )}
                                                            </td>
                                                            {compData?.detect_selection && (
                                                                <td>
                                                                    {comp_found === 0 ? (
                                                                        <ExclamationCircleOutlined className="zoom-in" style={{ color: 'deepskyblue', fontSize: '1.5rem' }} />
                                                                    ) : comp_found === 1 ? (
                                                                        <CloseCircleOutlined className="zoom-in" style={{ color: 'red', fontSize: '1.5rem' }} />
                                                                    ) : comp_found === 2 && (
                                                                        <CheckCircleOutlined className="zoom-in" style={{ color: 'green', fontSize: '1.5rem' }} />
                                                                    )}
                                                                </td>
                                                            )}
                                                            <td>
                                                                {comp_result === 0 ? (
                                                                    <ExclamationCircleOutlined className="zoom-in" style={{ color: 'deepskyblue', fontSize: '1.5rem' }} />
                                                                ) : comp_result === 1 ? (
                                                                    <CloseCircleOutlined className="zoom-in" style={{ color: 'red', fontSize: '1.5rem' }} />
                                                                ) : comp_result === 2 && (
                                                                    <CheckCircleOutlined className="zoom-in" style={{ color: 'green', fontSize: '1.5rem' }} />
                                                                )}
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </Table>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row>
                            )}


                            <div style={{ padding: '20px' }}>
                                <Row className="mb-4">
                                    <Col xs={12}>
                                        <Card>
                                            <CardBody>
                                                <CardTitle className="mb-4 d-flex justify-content-between align-items-center">
                                                    {response_value && <span className="d-flex align-items-center gap-2">
                                                        {response_value === 'OK' ? (
                                                            <>
                                                                <i className="mdi mdi-check-circle text-success" style={{ fontSize: '24px' }}></i>
                                                                <span style={{ color: '#28a745', fontWeight: '600' }}>Over-All Result: OK</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="mdi mdi-close-circle text-danger" style={{ fontSize: '24px' }}></i>
                                                                <span style={{ color: '#dc3545', fontWeight: '600' }}>Over-All Result: NG</span>
                                                            </>
                                                        )}
                                                    </span>}
                                                    {inspection_type === "Manual" && show && (
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
                                                                <div style={{ color: 'black', fontWeight: 'bold', marginBottom: '8px' }}>
                                                                    Place the object and
                                                                </div>

                                                                <Button
                                                                    color='primary'
                                                                    size="lg"
                                                                    onClick={() => object_detection()}
                                                                    style={{ whiteSpace: 'nowrap' }}
                                                                >
                                                                    Start
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <Col lg={6} md={6} xs={6}>
                                                        <Card style={{ height: '100%' }}>
                                                            <Row className="tdCntStl">
                                                                <div className="table-responsive sdTblFntSz" style={{ paddingTop: '10px' }}>
                                                                    <Table className="table" style={{ boxShadow: '0px 0px 5px 2px #495057' }}>
                                                                        <tbody>
                                                                            <tr>
                                                                                <td></td>
                                                                                <td style={{ fontWeight: 'bold' }}>Total</td>
                                                                                <td style={{ fontWeight: 'bold', color: 'green' }}>OK</td>
                                                                                <td style={{ fontWeight: 'bold', color: 'red' }}>NG</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td style={{ fontWeight: 'bold' }}>Current Session</td>
                                                                                <td style={{ fontWeight: 'bold' }}>{tCount}</td>
                                                                                <td style={{ fontWeight: 'bold', color: 'darkgreen' }}>{okCount}</td>
                                                                                <td style={{ fontWeight: 'bold', color: 'darkred' }}>{ngCount}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td style={{ fontWeight: 'bold' }}>Today</td>
                                                                                <td style={{ fontWeight: 'bold' }}>{oldTotal}</td>
                                                                                <td style={{ fontWeight: 'bold', color: 'darkgreen' }}>{oldOk}</td>
                                                                                <td style={{ fontWeight: 'bold', color: 'darkred' }}>{oldNg}</td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </Table>
                                                                </div>
                                                            </Row>
                                                        </Card>
                                                    </Col>

                                                </CardTitle>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row>


                                {show_next && (
                                    <div className="centered obj_style">
                                        <div
                                            className="obj_style_pdg"
                                            style={{
                                                boxShadow: '0px 0px 5px black',
                                                borderRadius: '1rem',
                                                padding: '10px',
                                                backgroundColor: 'white',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}>
                                            <h3
                                                className="stl_plobj_txt"
                                                style={{
                                                    color: 'black',
                                                    fontWeight: 'bold'
                                                }}>
                                                <div>Place the next object and</div>
                                                <div>
                                                    press <Button className="stlStrt" id="strtbtn" color="primary" onClick={() => object_detection()}>Start</Button>
                                                </div>
                                            </h3>
                                        </div>
                                    </div>
                                )}




                                {compData?.inspection_method === "Non-Sequential" && (< div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(600px, 1fr))",
                                        gap: "24px"
                                    }}
                                >
                                    {/* {uniqueCameras.map((camera) => ( */}
                                    {cameraList.map((camera) => (
                                        <Card
                                            key={camera.originalLabel}
                                            style={{
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                                borderRadius: "12px"
                                            }}
                                        >
                                            {
                                                console.log('cameracameracamera', camera)
                                            }
                                            <CardBody>
                                                <CardTitle className="mb-3">
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '8px',
                                                        backgroundColor: '#f8f9fa',
                                                        borderRadius: '8px'
                                                    }}>
                                                        <span style={{ fontWeight: '600', color: '#495057' }}>
                                                            {camera.stageName || camera.label}
                                                        </span>

                                                    </div>
                                                </CardTitle>

                                                <Row>
                                                    <Col md={6} xs={12} className="mb-3 mb-md-0">


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
                                                            {
                                                                console.log('camera.label, camera.model_ver, ref_img_path', camera.label, camera.stageName, ref_img_path)
                                                            }
                                                            {getReferenceImageForCamera(camera.label, camera.stageName, ref_img_path) ? (
                                                                <img
                                                                    src={getReferenceImageForCamera(camera.label, camera.stageName, ref_img_path)}
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
                                                    </Col>

                                                    <Col md={6} xs={12}>

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
                                                                LIVE INSPECTION
                                                            </div>
                                                            <div style={{
                                                                fontSize: "12px",
                                                                color: "#666",
                                                                marginTop: "4px"
                                                            }}>
                                                                {camera.label}
                                                            </div>
                                                        </div>

                                                        {/* Camera Container */}
                                                        <div style={{
                                                            position: "relative",
                                                            width: "100%",
                                                            paddingBottom: "75%",
                                                            backgroundColor: "#000",
                                                            borderRadius: "8px",
                                                            overflow: "hidden",
                                                            border: showresult && response_message && response_message[camera.label] ?
                                                                (response_message[camera.label] === "OK" ? '3px solid #52c41a' :
                                                                    response_message[camera.label] === "NG" ? '3px solid #ff4d4f' : '1px solid #e0e0e0')
                                                                : "1px solid #e0e0e0"
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
                                                                        padding: "20px"
                                                                    }}>
                                                                        <div style={{ textAlign: "center" }}>
                                                                            <h5 style={{ fontWeight: "600", marginBottom: "16px" }}>
                                                                                Webcam Disconnected
                                                                            </h5>
                                                                            <Spinner color="primary" />
                                                                            <h6 style={{ fontWeight: "500", marginTop: "16px" }}>
                                                                                Please check your webcam connection...
                                                                            </h6>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        {/* Outline Overlay */}
                                                                        {show_outline && getCurrentOutlinePath && getCurrentOutlinePath(camera.originalLabel) && (
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
                                                                            ref={(el) => {
                                                                                if (el && webcamRef && webcamRef.current) {
                                                                                    webcamRef.current[camera.originalLabel] = el;
                                                                                }
                                                                            }}
                                                                            // ref={(el) => { if (el) webcamRef.current[camera.originalLabel] = el; }}
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


                                                                        {console.log('canvasRef', canvasRef)}
                                                                        {/* Canvas Overlay */}
                                                                        <canvas

                                                                            ref={(el) => { if (el) canvasRef.current[camera.label] = el; }}
                                                                            width={640}
                                                                            height={480}
                                                                            style={{
                                                                                // display: !show_region_webcam ? 'none' : 'block',
                                                                                position: 'absolute',
                                                                                top: 0,
                                                                                left: 0,
                                                                                width: '100%',
                                                                                height: '100%',
                                                                                zIndex: 1,
                                                                                pointerEvents: 'none'
                                                                            }}
                                                                        />

                                                                        {/* Center Overlay Content */}
                                                                        <div style={{
                                                                            position: "absolute",
                                                                            top: "10%",
                                                                            left: "50%",
                                                                            transform: "translate(-50%, -50%)",
                                                                            zIndex: 4,
                                                                            textAlign: "center",
                                                                            width: "90%"
                                                                        }}>
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
                                                                                    fontSize: "18px",
                                                                                    fontWeight: "bold",
                                                                                    textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                                                                                    marginBottom: "12px"
                                                                                }}>
                                                                                    {res_message[camera.label]}
                                                                                </div>
                                                                            )}


                                                                            {showresult && response_message && response_message[camera.label] && (
                                                                                <div style={{
                                                                                    display: "flex",
                                                                                    flexDirection: "column",
                                                                                    alignItems: "left",
                                                                                    gap: "8px"
                                                                                }}>
                                                                                    <span
                                                                                        style={{
                                                                                            fontWeight: "bold",
                                                                                            color: response_message[camera.label] === "OK" ? "#1e5a00ff" : "#e81919ff",
                                                                                            textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                                                                                            fontSize: "15px",
                                                                                        }}
                                                                                        className='mt-5'
                                                                                    >
                                                                                        Result: {response_message[camera.label]}
                                                                                    </span>


                                                                                    {response_message[camera.label] === "OK" && (
                                                                                        <CheckCircleOutlined style={{
                                                                                            fontSize: '60px',
                                                                                            color: '#1e5a00ff',
                                                                                            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
                                                                                        }} />
                                                                                    )}

                                                                                    {response_message[camera.label] === "NG" && (
                                                                                        <CloseCircleOutlined style={{
                                                                                            fontSize: '60px',
                                                                                            color: '#bf171aff',
                                                                                            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
                                                                                        }} />
                                                                                    )}
                                                                                </div>
                                                                            )}



                                                                            {/* Countdown Timer */}
                                                                            {inspection_type !== "Manual" && isCountdownActive && CountdownTimer && (
                                                                                <div style={{
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
                                                                                        onEnd={() => onTimeupCourse()}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>)}


                                {/* {compData?.capture_mode === 'Sequential' && (
                                    // <SequentialCameraView
                                    //     camera={activeCamera}
                                    //     onNext={() => handleNextStage()}
                                    // />
                                    <SequentialCameraView
                                        activeCamera={activeCamera}
                                        onNext={handleNextStage}
                                        compData={compData}
                                        ref_img_path={ref_img_path}
                                        getReferenceImageForCamera={getReferenceImageForCamera}
                                        showImage={showImage}
                                        zoom_value={zoom_value}
                                        show_outline={show_outline}
                                        getCurrentOutlinePath={getCurrentOutlinePath}
                                        cameraDisconnected={cameraDisconnected}
                                        showstatus={showstatus}
                                        res_message={res_message}
                                        showresult={showresult}
                                        response_message={response_message}
                                        inspection_type={inspection_type}
                                        isCountdownActive={isCountdownActive}
                                        CountdownTimer={CountdownTimer}
                                        capture_duration={capture_duration}
                                        onTimeupCourse={onTimeupCourse}
                                        webcamRef={webcamRef}
                                        canvasRef={canvasRef}
                                        // show_region_webcam={show_region_webcam}
                                        currentStageIndex={0}
                                    // totalStages={5}
                                    // capturedCount={3}
                                    // totalCaptures={10}
                                    />
                                )} */}
                            </div>
                        </CardBody>
                    </Card>
                </Container>
            </div >

            {/* Modal for Details */}
            < Modal size="xl" isOpen={modal_xlarge} style={{ height: '90vh', overflow: 'auto' }
            }>
                <div className="modal-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '97%' }}>
                        <h5>Today&#39;s report</h5>
                        <h5>Station Name:&nbsp;{station_name}</h5>
                        <h5>Date:&nbsp;{current_date}</h5>
                    </div>
                    <Button
                        onClick={() => {
                            setModal_xlarge(false);
                            setSession_detail(false);
                        }}
                        type="button"
                        className="close mt-1"
                        data-dismiss="modal"
                        aria-label="Close"
                    >
                        <span aria-hidden="true">&times;</span>
                    </Button>
                </div>
                <div className="modal-body">
                    <Nav tabs>
                        <NavItem>
                            <NavLink
                                style={{ cursor: "pointer" }}
                                className={activeTab === "1" ? `active` : ``}
                                onClick={() => toggle("1")}
                            >
                                Inspected Results
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                style={{ cursor: "pointer" }}
                                className={activeTab === "2" ? `active` : ``}
                                onClick={() => { toggle("2"); timeSheet(); }}
                            >
                                Time Sheet
                            </NavLink>
                        </NavItem>
                    </Nav>

                    <TabContent activeTab={activeTab} className="p-3 text-muted">
                        <TabPane tabId="1">
                            <div className="table-responsive" style={{ height: '60vh', overflowY: 'auto' }}>
                                <Table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <td className="text-center">Comp name</td>
                                            <td className="text-center">Comp Code</td>
                                            <td className="text-center">Total Duration</td>
                                            <td className="text-center">No. Of Sessions</td>
                                            <td className="text-center">Total</td>
                                            <td className="text-center">OK</td>
                                            <td className="text-center">NG</td>
                                            <td className="text-center">No object Found</td>
                                            <td className="text-center">Incorrect object</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report_data.map((component, index) => (
                                            <React.Fragment key={index}>
                                                <tr
                                                    onClick={() => {
                                                        table_show(component, index);
                                                        setTbIndex(index);
                                                    }}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <td style={{ display: 'flex', justifyContent: 'space-around' }}>
                                                        <span
                                                            className={`${(tbIndex === index) && session_detail ? "arrow rotated" : "arrow"}`}
                                                            style={{ color: 'teal' }}
                                                        >
                                                            &#9654;
                                                        </span>
                                                        <span className="text-center">{component.comp_name}</span>
                                                    </td>
                                                    <td className="text-center">{component.comp_code}</td>
                                                    <td className="text-center">{component.total_duration}</td>
                                                    <td className="text-center">{component.session_count}</td>
                                                    <td className="text-center">{component.total}</td>
                                                    <td className="text-center">{component.ok}</td>
                                                    <td className="text-center">{component.notok}</td>
                                                    <td className="text-center">{component.no_obj}</td>
                                                    <td className="text-center">{component.incorrect_obj}</td>
                                                </tr>
                                                {(tbIndex === index) && session_detail && (
                                                    <tr>
                                                        <td colSpan='9'>
                                                            <div className="table-responsive" style={{ height: '300px' }}>
                                                                <Table className="table">
                                                                    <thead style={{
                                                                        position: 'sticky',
                                                                        top: '0',
                                                                        backgroundColor: 'white',
                                                                        margin: '0px'
                                                                    }}>
                                                                        <tr>
                                                                            <td className="text-center">Session No.</td>
                                                                            <td className="text-center">Start Time</td>
                                                                            <td className="text-center">End Time</td>
                                                                            <td className="text-center">Duration (HH:MM:SS)</td>
                                                                            <td className="text-center">Total</td>
                                                                            <td className="text-center">OK</td>
                                                                            <td className="text-center">NG</td>
                                                                            <td className="text-center">No Object Found</td>
                                                                            <td className="text-center">Incorrect object</td>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {manage_details.map((data, idx) => (
                                                                            <tr key={idx}>
                                                                                <td className="text-center">{idx + 1}</td>
                                                                                <td className="text-center">{data.start_time}</td>
                                                                                <td className="text-center">{data.end_time}</td>
                                                                                <td className="text-center">{data.duration}</td>
                                                                                <td className="text-center">{data.total}</td>
                                                                                <td className="text-center">{data.ok}</td>
                                                                                <td className="text-center">{data.notok}</td>
                                                                                <td className="text-center">{data.no_obj}</td>
                                                                                <td className="text-center">{data.incorrect_obj}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </Table>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </TabPane>

                        <TabPane tabId='2'>
                            <div className="table-responsive" style={{ height: '50vh', overflowY: 'auto' }}>
                                <Table className="table table-striped">
                                    <thead style={{
                                        position: 'sticky',
                                        top: '0',
                                        backgroundColor: 'white',
                                    }}>
                                        <tr>
                                            <td className="text-center">Session No.</td>
                                            <td className="text-center">Comp Name</td>
                                            <td className="text-center">Comp Code</td>
                                            <td className="text-center">Start Time</td>
                                            <td className="text-center">End Time</td>
                                            <td className="text-center">Duration (HH:MM:SS)</td>
                                            <td className="text-center">Total</td>
                                            <td className="text-center">OK</td>
                                            <td className="text-center">Not Good</td>
                                            <td className="text-center">No Object Found</td>
                                            <td className="text-center">Incorrect object</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {time_sheet.map((time_data, index) => (
                                            <tr key={index}>
                                                <td className="text-center">{index + 1}</td>
                                                <td className="text-center">{time_data.comp_name}</td>
                                                <td className="text-center">{time_data.comp_code}</td>
                                                <td className="text-center">{time_data.start_time}</td>
                                                <td className="text-center">{time_data.end_time}</td>
                                                <td className="text-center">{time_data.duration}</td>
                                                <td className="text-center">{time_data.total}</td>
                                                <td className="text-center">{time_data.ok}</td>
                                                <td className="text-center">{time_data.notok}</td>
                                                <td className="text-center">{time_data.no_obj}</td>
                                                <td className="text-center">{time_data.incorrect_obj}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </TabPane>
                    </TabContent>
                </div>

                <div className="modal-footer">
                    {activeTab === "2" && (
                        <Table className="table">
                            <thead>
                                <tr>
                                    <td className="text-center">Total No. of Session</td>
                                    <td className="text-center">Total No. of Components</td>
                                    <td className="text-center">Total Duration</td>
                                    <td className="text-center">Total</td>
                                    <td className="text-center">Total Ok</td>
                                    <td className="text-center">Total NG</td>
                                    <td className="text-center">Total No Obj Found</td>
                                    <td className="text-center">Total Incorrect Object</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="text-center">{total_sn_tmsht}</td>
                                    <td className="text-center">{report_data.length}</td>
                                    <td className="text-center">{totalDuration1}</td>
                                    <td className="text-center">{totalTotal}</td>
                                    <td className="text-center" style={{
                                        fontSize: '110%',
                                        fontWeight: 'bold',
                                        color: 'black',
                                        background: '#84b884'
                                    }}>{totalOk}</td>
                                    <td className="text-center" style={{
                                        fontSize: '110%',
                                        fontWeight: 'bold',
                                        color: 'black',
                                        background: '#e09191'
                                    }}>{totalNG}</td>
                                    <td className="text-center" style={{
                                        fontSize: '110%',
                                        fontWeight: 'bold',
                                        color: 'black',
                                        background: '#adad74'
                                    }}>{totalNoObj}</td>
                                    <td className="text-center" style={{
                                        fontSize: '110%',
                                        fontWeight: 'bold',
                                        color: 'black',
                                        background: '#adad74'
                                    }}>{totalincorrect}</td>
                                </tr>
                            </tbody>
                        </Table>
                    )}

                    <button
                        type="button"
                        onClick={() => {
                            setModal_xlarge(false);
                            setSession_detail(false);
                        }}
                        className="btn btn-secondary"
                        data-dismiss="modal"
                    >
                        Close
                    </button>
                </div>
            </Modal >

            {/* Alert for Camera Issues */}
            {
                alertMsg && (
                    <SweetAlert
                        title={
                            <Label style={{ fontSize: 20 }}>
                                No camera found on this device.
                            </Label>
                        }
                        confirmBtnText="OK"
                        onConfirm={() => setAlertMsg(false)}
                        closeOnClickOutside={false}
                    />
                )
            }
        </>
    );
};

export default InspectionTestingStage;



