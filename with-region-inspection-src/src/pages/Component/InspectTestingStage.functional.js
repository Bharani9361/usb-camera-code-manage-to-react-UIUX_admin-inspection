import React, { useEffect, useRef, useState, useCallback } from "react";
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';

import {
    Card, Col, Container, Row, CardBody, CardTitle,
    Label, Button, Table, Nav, NavItem, NavLink,
    TabContent, TabPane, Form, Input, InputGroup,
    Modal, FormGroup, Spinner,
    CardText
} from "reactstrap";
import axios from "axios";
import Webcam from "react-webcam";
import './index.css';
//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { css } from "@emotion/react"
import { MoonLoader } from "react-spinners"
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

import { v4 as uuidv4 } from 'uuid';
import { batch } from "react-redux";
import PropTypes from "prop-types";
import CountdownTimer from "react-component-countdown-timer";
import SweetAlert from 'react-bootstrap-sweetalert';
import { set } from "lodash";
import urlSocket from './urlSocket';
import ImageUrl from "./imageUrl";
import { DEFAULT_RESOLUTION } from "./cameraConfig";
import WebcamCapture from "pages/WebcamCustom/WebcamCapture";
import FullScreenLoader from "components/Common/FullScreenLoader";

// Keep the module-level mutable variables as before
let component_code1 = ""
let component_name1 = ""
let positive = ""
let negative = ""
let posble_match = ""
let batch_id = ""
let old_ok = 0
let old_ng = 0
let old_total = 0
let old_pm = 0
let ok_count = 0
let ng_count = 0
let ps_match = 0
let t_count = 0


const date = new Date();
let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();
let current_date = `${day}-${month}-${year}`;

const initialState = {
    activeTab: "1",
    component_code: "",
    component_name: "",
    config_positive: "",
    config_negative: "",
    config_posble_match: "",
    response_message: "",
    res_message: "",
    response_msg: "",
    comp_id: "",
    intervalId: "",
    batch_data: [],
    batch_table: [],
    aggbatch_table: [],
    start_time: "",
    end_time: "",
    total_time: "",
    screenshot: null,
    showresult: false,
    showstatus: false,
    show: false,
    startCapture: true,
    loading: false,
    timer: false,
    showModal: false,
    showdata: false,
    alertMsg: false,
    modal_data: {},
    tab: 0,
    tbIndex: 0,
    count: 1,
    timeout: 10,
    img_url: '',
    msg: "",
    mssg: "",
    datasets: [],
    capture_duration: 10,
    config_data: [],
    station_name: '',
    station_id: '',
    deviceId: '',
    interval: '',
    placeobj_count: 0,
    showplaceobject: true,
    result_key: false,
    resultKey: 'Result : ',
    modal_xlarge: false,
    session_detail: false,
    compNo: '',
    report_data: [],
    manage_details: [],
    time_sheet: [],
    total_sn_tmsht: '',
    rtdt_TD: [],
    showDetail: false,
    resume: false,

    qrbar_found: 0,
    qrbar_result: 0,
    comp_found: 0,
    comp_result: 0,
    show_outline: false,

    default_outline: 'White Outline',
    outline_colors: [
        "White Outline",
        "Red Outline",
        "Green Outline",
        "Blue Outline",
        "Black Outline",
        "Orange Outline",
        "Yellow Outline",
    ],
    outline_path: '',
    res_img: null,
    rectangles: [],
    region_selection: true,
    output_Rect: false,

    inspection_started: false,
    zoom_value: {},

    is_loading_models: false,
}

const InspectionTestingStage = (props) => {
    const [state, setState] = useState(initialState);

    // refs
    const tableRef = useRef(null);
    const canvasRef = useRef(null);
    const webcamRef = useRef(null);

    // helper to mimic this.setState merge behaviour
    const mergeState = useCallback((patch) => {
        setState(prev => ({ ...prev, ...patch }));
    }, []);

    // Equivalent of componentDidMount
    useEffect(() => {
        sessionStorage.setItem('showSidebar', true)
        const compData = JSON.parse(sessionStorage.getItem("compData")) || {};
        console.log('data142 ', compData);

        if (compData?.zoom_value) {
            mergeState({ zoom_value: compData.zoom_value });
        }

        const componentData = JSON.parse(sessionStorage.getItem("componentData"));
        mergeState({ componentData });

        document.addEventListener('keydown', handleKeyDown);

        const v_id = compData._id;
        console.log('first', v_id)
        component_code1 = compData.component_code
        component_name1 = compData.component_name
        positive = compData.positive
        negative = compData.negative
        posble_match = compData.posble_match
        const station_name = compData.station_name
        const station_id = compData.station_id
        batch_id = compData.batch_id
        const datasets = compData.datasets
        const inspection_type = compData.inspection_type
        const qr_checking = compData.qr_checking
        const qruniq_checking = compData.qruniq_checking
        const timeout = Number(compData.timer) + '000'

        // fetch counts (non-blocking)
        try {
            urlSocket.post('/refresh_details_count', { 'comp_name': component_name1, "comp_code": component_code1, "batch_id": batch_id }, { mode: 'no-cors' })
                .then((response) => {
                    const batch_data = response.data
                    console.log('refresh_count', batch_data)
                    if (batch_data.length === 0) {
                        ok_count = 0;
                        ng_count = 0;
                        ps_match = 0;
                        t_count = 0;
                    } else {
                        ok_count = Number(batch_data[0].ok);
                        ng_count = Number(batch_data[0].notok);
                        ps_match = Number(batch_data[0].posbl_match);
                        t_count = Number(batch_data[0].total);
                    }
                })
                .catch((error) => console.error(error))
        } catch (error) {
            console.error("----", error)
        }

        try {
            urlSocket.post('/today_count', { 'comp_name': component_name1, "comp_code": component_code1 }, { mode: 'no-cors' })
                .then((response) => {
                    const val = response.data
                    console.log('value from db', val)
                    if (val.length === 0) {
                        old_ng = 0; old_ok = 0; old_total = 0; old_pm = 0;
                    } else {
                        old_ok = val[0].ok;
                        old_ng = val[0].notok;
                        old_total = val[0].total;
                        old_pm = val[0].pm;
                    }
                })
                .catch((error) => console.error(error))
        } catch (error) {
            console.error("----", error)
        }

        mergeState({ timeout, compData, inspection_type, qr_checking, qruniq_checking, capture_duration: Number(compData?.timer), qrbar_check: compData?.qrbar_check, qrbar_check_type: compData?.qrbar_check_type });

        if (datasets === undefined) {
            mergeState({ component_name: component_name1, component_code: component_code1, comp_id: v_id, station_name, station_id })
        } else {
            mergeState({ component_name: component_name1, component_code: component_code1, datasets, comp_id: v_id, station_name, station_id })
        }

        showRefOutline(compData);

        // Add device change listener + initial check
        navigator.mediaDevices.addEventListener('devicechange', checkWebcam);
        checkWebcam();

        barcodeInfo(v_id, inspection_type, compData);
        configuration();

        // cleanup on unmount
        return () => {
            clearInterval(trainingStatusIntervalRef.current);
            navigator.mediaDevices.removeEventListener('devicechange', checkWebcam);
            document.removeEventListener('keydown', handleKeyDown);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // refs for intervals / external handles
    const trainingStatusIntervalRef = useRef();

    // componentDidUpdate equivalent for specific fields
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) { console.error('Failed to get canvas context'); return; }

        if (state.res_img) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            state.rectangles.forEach((rect, index) => {
                ctx.lineWidth = 2;
                ctx.strokeStyle = rect.colour;
                ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
                const textPosX = index === state.movingRectangleIndex ? rect.x + 25 : rect.x + 10;
                ctx.font = 'bold 14px Arial';
                ctx.lineWidth = 3;
                ctx.strokeStyle = 'black';
                ctx.strokeText(rect.name, textPosX, rect.y + 15);
                ctx.fillStyle = 'white';
                ctx.fillText(rect.name, textPosX, rect.y + 15);
            });
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

    }, [state.res_img, state.rectangles]);

    useEffect(() => {
        if (state.capture_duration > 0) {
            console.log(`Countdown value: ${state.capture_duration}`);
        }
    }, [state.capture_duration]);

    // --- Helper functions ported from class (partial) ---
    const checkWebcam = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
            if (!videoInputDevices.length) {
                mergeState({ cameraDisconnected: true });
            } else {
                mergeState({ cameraDisconnected: false });
            }
        } catch (error) {
            console.error('Error checking devices:', error);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'F9') {
            const startButton = document.getElementById('strtbtn');
            if (startButton) startButton.click();
        }
    };

    // The original file contains many large methods (object_detection, uniqness_checking, etc.).
    // For progress and safety, those will be ported next. Below are placeholders so the component renders.

    // Minimal stubs so internal calls from mount don't break. Replace with full implementations next.
    const showRefOutline = (compData) => {
        // TODO: migrate logic from original class method
        console.log('showRefOutline stub', compData?.component_name);
    };

    const barcodeInfo = (v_id, inspection_type, compData) => {
        // TODO: migrate barcodeInfo
        console.log('barcodeInfo stub', v_id);
    };

    const configuration = () => {
        // TODO: migrate configuration/non_sync_config/config
        console.log('configuration stub');
    };

    // Render: reuse the original JSX or a simpler placeholder until full port is complete
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Inspection" breadcrumbItem="Testing Stage (Functional)" />
                    <Row>
                        <Col xs="12">
                            <Card>
                                <CardBody>
                                    <CardTitle>Inspect Testing Stage - Functional (partial)</CardTitle>
                                    <CardText>
                                        This is the functional-component scaffold of `InspectTestingStage`.
                                        I have migrated the initial state, refs, mount/unmount and a few helpers.
                                    </CardText>
                                    <div>
                                        <Button color="primary" id="strtbtn" onClick={() => console.log('Start clicked')}>Start</Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    )
}

export default InspectionTestingStage;
