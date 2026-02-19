import React, { Component, createRef } from "react";
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
// import { Modal } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

// commented this due to ant design version upgrade from 4.x to 5.8.4
// import 'antd/dist/antd.css';

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
// import { TableBody, TableRow } from "@material-ui/core";

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
class Inspection extends Component {
    constructor(props) {
        super(props);
        this.
            state = {
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
            // isCountdownActive: true,
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
        this.tog_xlarge = this.tog_xlarge.bind(this)
        this.table = React.createRef()
        this.canvasRef = createRef();
        this.webcamRef = createRef();

    }

    componentDidMount = () => {
        sessionStorage.setItem('showSidebar', true)
        var compData = JSON.parse(sessionStorage.getItem("compData"))
        console.log('data142 ', compData);

        if (compData?.zoom_value) {
            this.setState({ zoom_value: compData.zoom_value });
        }

        // 
        const componentData = JSON.parse(sessionStorage.getItem("componentData"));
        this.setState({ componentData: componentData });
        // 

        document.addEventListener('keydown', this.handleKeyDown);
        let v_id = compData._id;
        // try {
        //     this.setState({ is_loading_models: true })
        //     urlSocket.post('/load_models_initially', { 'comp_id': compData._id },
        //         { mode: 'no-cors' })
        //         .then((response) => {
        //             console.log('/load_models_initially ', response);
        //         })
        //         .catch((error) => {
        //             console.error('load_models_initially: ', error)
        //         })
        // } catch (error) {
        //     console.error('load_models_initially: ', error)
        // } finally {
        //     this.setState({ is_loading_models: false })
        // }
        console.log('first', v_id)
        component_code1 = compData.component_code
        component_name1 = compData.component_name
        positive = compData.positive
        negative = compData.negative
        posble_match = compData.posble_match
        let station_name = compData.station_name
        let station_id = compData.station_id
        batch_id = compData.batch_id
        let datasets = compData.datasets
        let inspection_type = compData.inspection_type
        let qr_checking = compData.qr_checking
        let qruniq_checking = compData.qruniq_checking
        let timeout = Number(compData.timer) + '000'
        try {
            urlSocket.post('/refresh_details_count', { 'comp_name': component_name1, "comp_code": component_code1, "batch_id": batch_id },
                { mode: 'no-cors' })
                .then((response) => {
                    let batch_data = response.data
                    console.log('refresh_count', batch_data)
                    if (batch_data.length === 0) {
                        ok_count = 0,
                            ng_count = 0,
                            ps_match = 0,
                            t_count = 0
                    }
                    else {
                        ok_count = Number(batch_data[0].ok),
                            ng_count = Number(batch_data[0].notok),
                            ps_match = Number(batch_data[0].posbl_match),
                            t_count = Number(batch_data[0].total)
                    }
                    //this.setState({ componentList: data, dataloaded: true })
                })
                .catch((error) => {
                    console.error(error)
                })
        } catch (error) {
            console.error("----", error)
        }

        try {
            urlSocket.post('/today_count', { 'comp_name': component_name1, "comp_code": component_code1 },
                { mode: 'no-cors' })
                .then((response) => {
                    let val = response.data
                    console.log('value from db', val)
                    console.log('value from db length', val.length)
                    if (val.length === 0) {
                        old_ng = 0,
                            old_ok = 0,
                            old_total = 0,
                            old_pm = 0
                    } else {
                        old_ok = val[0].ok,
                            old_ng = val[0].notok,
                            old_total = val[0].total,
                            old_pm = val[0].pm
                    }


                })
                .catch((error) => {
                    console.error(error)
                })
        }
        catch (error) {
            console.error("----", error)
        }
        this.setState({
            timeout, compData, inspection_type, qr_checking, qruniq_checking, capture_duration: Number(compData.timer),
            qrbar_check: compData.qrbar_check, qrbar_check_type: compData.qrbar_check_type
            // isCountdownActive: true
        })
        console.log('timeout', timeout);

        // console.log(`datasets`, datasets)
        if (datasets === undefined) {
            this.setState({ component_name: component_name1, component_code: component_code1, comp_id: v_id, station_name: station_name, station_id: station_id })
        }
        else {
            this.setState({ component_name: component_name1, component_code: component_code1, datasets, comp_id: v_id, station_name: station_name, station_id: station_id })
        };
        this.showRefOutline(compData);

        // Add device change listener
        navigator.mediaDevices.addEventListener('devicechange', this.checkWebcam);
        // Initial check
        this.checkWebcam();

        this.barcodeInfo(v_id, inspection_type, compData)
        // if (compData.inspection_type === 'Manual') {
        //     this.cont_apiCall()
        // }
        // else {
        //     if (this.state.startCapture) {
        //         this.appCall()
        //     }
        // }
        this.configuration()
    }

    componentDidUpdate(prevProps, prevState) {

        // console.log('this.state.rectangles', this.state.rectangles)
        // Check if the canvasRef or canvas element is null
        if (!this.canvasRef.current) {
            // console.error('canvasRef is null');
            return;
        }
        const canvas = this.canvasRef.current;
        // console.log('this.state.showRegion122', canvas);
        const ctx = canvas.getContext('2d');
        // Check if getContext returns null
        if (!ctx) {
            console.error('Failed to get canvas context');
            return;
        }
        if (
            this.state.res_img &&
            (this.state.res_img !== prevState.res_img ||
                this.state.rectangles !== prevState.rectangles
            )
        ) {
            // const img = new Image();
            // img.src = this.state.res_img;
            // img.onload = () => { //
            const drawFrame = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                this.state.rectangles.forEach((rect, index) => {
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = rect.colour;
                    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
                    const textPosX = index === this.state.movingRectangleIndex ? rect.x + 25 : rect.x + 10;
                    ctx.font = 'bold 14px Arial';
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = 'black';
                    ctx.strokeText(rect.name, textPosX, rect.y + 15);
                    ctx.fillStyle = 'white';
                    ctx.fillText(rect.name, textPosX, rect.y + 15);

                    // const trashButton = this.trashButtonsRef[index];
                    // if (trashButton) {
                    //     trashButton.style.left = `${rect.x + rect.width - 20}px`;
                    //     trashButton.style.top = `${rect.y}px`;
                    // }
                });
            };
            console.log('this.state.showRegion180', this.state.showRegion);
            if (this.state.res_img) {
                drawFrame();
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                //     ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            }
            // };
        }


        // console.log('prevProps, prevState : ', prevProps, prevState )

        if (prevState.capture_duration !== this.state.capture_duration && this.state.capture_duration > 0) {
            console.log(`Countdown value: ${this.state.capture_duration}`);
        }
    }



    componentWillUnmount() {
        // Clear the interval to avoid memory leaks
        clearInterval(this.trainingStatusInterval);
        // Remove device change listener
        navigator.mediaDevices.removeEventListener('devicechange', this.checkWebcam);
        // Remove the event listener when the component is unmounted to avoid memory leaks
        document.removeEventListener('keydown', this.handleKeyDown);
    };

    checkWebcam = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
            if (!videoInputDevices.length) {
                this.setState({ cameraDisconnected: true }); // Show popup if no webcam is found
            } else {
                this.setState({ cameraDisconnected: false })
            }
        } catch (error) {
            console.error('Error checking devices:', error);
        }
    };

    handleKeyDown = (event) => {
        // // Check if the pressed key is the "Enter" key (key code 13)
        // if (event.keyCode === 13) {
        //     // Find the Start button using its attribute (you can also use an ID or another selector)
        //     // const startButton = document.querySelector('[color="primary"]');
        //     const startButton = document.getElementById('strtbtn');

        //     // Trigger the click event of the Start button
        //     if (startButton) {
        //         startButton.click();
        //     }
        // }

        // Check if the pressed key is the "Enter" key (key code 13)
        if (event.key === 'F9') {
            // Find the Start button using its attribute (you can also use an ID or another selector)
            // const startButton = document.querySelector('[color="primary"]');
            const startButton = document.getElementById('strtbtn');

            // Trigger the click event of the Start button
            if (startButton) {
                startButton.click();
            }
        }
    };

    // 21-02-24
    testing_api_call = (second) => {
        try {
            urlSocket.post('/test_api',
                { mode: 'no-cors' })
                .then((response) => {
                    let datas = response.data
                    console.log('detailes88', datas)
                    //this.setState({ componentList: data, dataloaded: true })
                    if (datas === 'ok') {
                        this.config()
                    }
                    else {
                        this.non_sync_config()
                    }
                })
                .catch((error) => {
                    console.log(error)
                    this.non_sync_config()
                })
        } catch (error) {
            console.log("----", error)
        }
    }

    config = () => {
        try {
            console.log('first99')
            urlSocket.post('/config',
                {
                    'comp_name': component_name1,
                    'comp_code': component_code1
                },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('config_data134', data)
                    this.setState({ config_data: data, config_positive: data[0].positive, config_negative: data[0].negative, config_posble_match: data[0].posble_match })
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }

    // 21-02-24
    configuration = () => {
        try {
            console.log('first9911')
            urlSocket.post('/nonSync_config',
                {
                    'comp_name': component_name1,
                    'comp_code': component_code1
                },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('config_data18011', data)
                    if (data.length > 0) {
                        this.setState({ config_data: data, config_positive: data[0].positive, config_negative: data[0].negative, config_posble_match: data[0].posble_match })
                    }
                    else {
                        this.testing_api_call()
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }

    non_sync_config = () => {
        try {
            console.log('first99')
            urlSocket.post('/nonSync_config',
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('config_data180', data)
                    this.setState({ config_data: data, config_positive: data[0].positive, config_negative: data[0].negative, config_posble_match: data[0].posble_match })
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }

    device_info = () => {
        try {
            urlSocket.post('/deviceInfo',
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('data118', data)
                    this.setState({ deviceId: data[0].device_id, _id: data[0]._id, position: { label: data[0].device_position } })
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
        }
    }

    async device_find() {
        let interval = await setInterval(() => {
            navigator.mediaDevices.enumerateDevices().then(devices =>
                this.handledevice(devices)
            )
        }, 300);
        this.setState({ interval })
    }

    handledevice = (devices) => {
        console.log('devices77', devices)
        let device_info = devices.filter(({ kind }) => kind === 'videoinput')
        console.log('deviceinfo1044', device_info)
        if (device_info.length !== 0) {
            device_info.filter((device) => {
                console.log('device', device.deviceId)
                if (device.deviceId !== this.state.deviceId) {
                    this.setState({ alertMsg: true, startCapture: false })
                }
                else {
                    this.setState({ deviceId: device.deviceId, startCapture: true, alertMsg: false })
                }
            })
        }
        else if (device_info.length === 0) {
            this.setState({ alertMsg: true, startCapture: false })
        }
        else {
            this.setState({ deviceId: device.deviceId, startCapture: true, alertMsg: false })
        }
    }


    onTimeupCourse = () => {
        this.setState({ timer: true, isCountdownActive: false })
        if (this.state.compData.qr_checking === true) {
            if (this.state.compData.qruniq_checking === true) {
                this.uniqness_checking()
            }
            else {
                this.uniq_object_detection()
            }
        }
        // else if(this.state.config_data[0].qr_uniq_checking){
        //     this.uniqness_checking()
        // }
        else {
            this.object_detection()
        }
    }

    pauseCountdown = () => {
        // this.setState({showDetail: true, isCountdownActive: false });
        // this.state.resume 
        // ? this.setState({ resume: false})
        // : this.setState({ resume: true})
        console.log('data436 ', this.state.qrbar_check, this.state.isCountdownActive, this.state.qrbar_countdown_active,)
        if (this.state.qrbar_check === true && this.state.isCountdownActive === true) {
            this.setState(prevState => ({
                isCountdownActive: false,
                countdownType: 'comp',
                showDetail: true,
                resume: !prevState.resume
            }));
        } else if (this.state.qrbar_check === true && this.state.qrbar_countdown_active === true) {
            console.log('data445 ')
            this.setState(prevState => ({
                qrbar_countdown_active: false,
                countdownType: 'qrbar',
                showDetail: true,
                resume: !prevState.resume
            }));
        } else {
            this.setState(prevState => ({
                showDetail: true,
                isCountdownActive: false,
                resume: !prevState.resume
            }))
        }
    };

    resumeCountdown = () => {
        // this.setState({  isCountdownActive: true, showDetail: false });
        // this.state.resume 
        // ? this.setState({ resume: false})
        // : this.setState({ resume: true})
        if (this.state.qrbar_check === true && this.state.countdownType === 'comp') {
            this.setState(prevState => ({
                isCountdownActive: true,
                showDetail: false,
                resume: !prevState.resume,
                countdownType: ''
            }));
        } else if (this.state.qrbar_check === true && this.state.countdownType === 'qrbar') {
            this.setState(prevState => ({
                qrbar_countdown_active: true,
                showDetail: false,
                resume: !prevState.resume,
                countdownType: ''
            }));
        } else {
            this.setState(prevState => ({
                isCountdownActive: true,
                showDetail: false,
                resume: !prevState.resume
            }));
        }
    };

    cont_apiCall = () => {
        if (this.state.placeobj_count > 0) {
            if (this.state.res_message === 'No Object Found' || this.state.res_message === 'Incorrect Object') {
                // this.setState({ showstatus: false, showresult: false, result_key:false })
                this.setState({ showstatus: true, showresult: false, result_key: false, showplaceobject: true })
            }
            else if (this.state.res_message === 'QR not found') {
                // this.setState({ showstatus: false, showresult: false, result_key:false })
                this.setState({ showstatus: true, showresult: false, result_key: false, showplaceobject: true })
            }
            else if (this.state.res_message === 'Data Already Exists') {
                // this.setState({ showstatus: false, showresult: false, result_key:false })
                this.setState({ showstatus: true, showresult: false, result_key: false, showplaceobject: true })
            }
            else {
                this.setState({ showstatus: false, showresult: true, result_key: true })
            }
        }
        else {
            this.setState({ showstatus: false })
        }

        if (this.state.startCapture) {
            this.apiCall()
        }
    }

    apiCall = () => {
        // let msgtwo = 'Place the next object and press start'
        let message = 'Place the object and press start'
        console.log('message', message);
        // console.log('this.state.placeobj_count >>>>', this.state.placeobj_count);
        // (this.state.placeobj_count > 0) ? this.setState({ msg: msgtwo, show: true }) : this.setState({ msg: message, show: true })
        this.setState({ msg: message, show: true })
    }

    appCall = () => {
        console.log('data481 after single object detection')
        // NEW CODE
        if (this.state.placeobj_count > 0) {
            if (this.state.res_message === 'No Object Found' || this.state.res_message === 'Incorrect Object') {
                // this.setState({startCapture: true, timer: true,  showdata: true, showstatus: false, showresult: false, result_key:false })
                this.setState({ startCapture: true, timer: true, isCountdownActive: true, showdata: true, showstatus: true, showresult: false, result_key: false })
            }
            else if (this.state.res_message === 'QR not found') {
                // this.setState({startCapture: true, timer: true,  showdata: true, showstatus: false, showresult: false, result_key:false })
                this.setState({ startCapture: true, timer: true, isCountdownActive: true, showdata: true, showstatus: true, showresult: false, result_key: false })
            }
            else if (this.state.res_message === 'Data Already Exists') {
                // this.setState({ startCapture: true, timer: true, showdata: true, showstatus: false, showresult: false, result_key:false }) 
                this.setState({ startCapture: true, timer: true, isCountdownActive: true, showdata: true, showstatus: true, showresult: false, result_key: false })
            }
            else {
                this.setState({ startCapture: true, timer: true, isCountdownActive: true, showdata: true, showstatus: false, showresult: true, result_key: true })
            }
        }
        else {
            this.setState({ startCapture: true, timer: true, isCountdownActive: true, showstatus: false, showdata: true })
        }

        // OLD CODE
        // console.log('first', Number(this.state.timeout))
        // this.setState({ startCapture: true, timer: true, showstatus: false, showresult: false })
        // let message = 'Place the object'
        // console.log('message', message)
        // this.setState({ mssg: message, showdata: true })
        // setTimeout(() => {
        //     this.setState({ mssg: "" })
        // }, Number(this.state.timeout));
    }

    uniqness_checking = async () => {
        const { resultKey, compData } = this.state;
        this.state.placeobj_count += 1  // to hide the Result at the starting
        //clearInterval(this.state.intervalId)
        this.setState({ showdata: false, showresult: false, showstatus: false })
        //this.state.msg = ""
        const imageSrc = await this.webcamRef.current.captureZoomedImage();
        // const imageSrc = this.webcam.getScreenshot({ width: DEFAULT_RESOLUTION.width, height: DEFAULT_RESOLUTION.height});
        const blob = await fetch(imageSrc).then((res) => res.blob());
        // console.log(blob)
        const formData = new FormData();
        let component_code = component_code1
        let component_name = component_name1
        let vpositive = positive
        let vnegative = negative
        let vposble_match = posble_match
        console.log('216', vposble_match)

        let today = new Date();
        let yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0!
        let dd = today.getDate();
        let _today = dd + '/' + mm + '/' + yyyy
        let test_date = yyyy + '-' + mm + '-' + dd

        let hours = today.getHours()
        let min = today.getMinutes()
        let secc = today.getSeconds()
        let time = hours + ':' + min + ':' + secc
        let milliseconds = hours + ':' + min + ':' + secc + '.' + today.getMilliseconds().toString().padStart(3, '0').slice(0, 5);
        let replace = _today + '_' + time.replaceAll(":", "_");

        let compdata = component_name + "_" + component_code + '_' + replace

        //let compdata = component_name + "_" + component_code
        //let compdata = uuidv4();

        formData.append('comp_name', component_name);
        formData.append('comp_code', component_code);
        formData.append('comp_id', this.state.comp_id);
        formData.append('positive', vpositive);
        formData.append('negative', vnegative);
        formData.append('posble_match', vposble_match);
        formData.append('datasets', blob, compdata + '.png')
        formData.append('station_name', this.state.station_name)
        formData.append('station_id', this.state.station_id)
        formData.append('inspected_ondate', test_date)
        formData.append('date', _today)
        formData.append('time', time)
        formData.append('milliseconds', milliseconds)
        formData.append('batch_id', batch_id)
        formData.append('detect_type', compData.detection_type)
        formData.append('qruniq', this.state.qruniq_checking)
        try {
            urlSocket.post('/QRobjectDetectionOnly', formData, {
                headers: {
                    'content-type': 'multipart/form-data'
                },
                mode: 'no-cors'
            })
                .then((response) => {
                    let data = response.data
                    console.log('data237', data)
                    this.setState({ res_message: response.data[0].detection_result, showstatus: true })
                    // setTimeout(() => {
                    //     this.setState({ res_message: "" })
                    // }, 200);

                    setTimeout(() => {
                        if (response.data[0].detection_result === 'New Data found') {
                            let Checking = "Checking ..."
                            this.setState({ res_message: Checking, showstatus: true });

                            urlSocket.post('/inspectionResult',
                                {
                                    'comp_name': component_name,
                                    "comp_code": component_code,
                                    "batch_id": batch_id,
                                    "captured_image": response.data[0].captured_image,
                                    "insp_result_id": response.data[0].insp_result_id,
                                    "start_time_with_milliseconds": response.data[0].start_time_with_milliseconds,
                                    "positive": positive,
                                    "negative": negative,
                                    "posble_match": posble_match,

                                },
                                { mode: 'no-cors' })
                                .then(detection => {
                                    this.setState({ showstatus: false })
                                    let testing_result = detection.data[0].status;
                                    console.log('testing_result', detection)
                                    if (testing_result === positive) {
                                        let positive = testing_result.replaceAll(testing_result, this.state.config_positive)
                                        ok_count++
                                        old_ok++
                                        old_total++
                                        t_count = ok_count + ng_count + ps_match
                                        this.setState({ response_message: positive, response_value: detection.data[0].value, showresult: true, ok_count, t_count, old_ok, old_total, resultKey, result_key: true })
                                    }
                                    else if (testing_result === negative) {
                                        // console.log('testing_result876', testing_result, negative)
                                        let negative = testing_result.replaceAll(testing_result, this.state.config_negative)
                                        ng_count++
                                        old_ng++
                                        old_total++
                                        t_count = ok_count + ng_count + ps_match
                                        this.setState({ response_message: negative, response_value: detection.data[0].value, showresult: true, ng_count, t_count, old_ng, old_total, resultKey, result_key: true })
                                    }
                                    else if (testing_result === posble_match) {
                                        let posble_match = testing_result.replaceAll(testing_result, this.state.config_posble_match)
                                        ps_match++
                                        old_pm++
                                        old_total++
                                        t_count = ok_count + ng_count + ps_match
                                        console.log('posbl_match563', posble_match)
                                        this.setState({ response_message: posble_match, response_value: detection.data[0].value, showresult: true, ps_match, t_count, old_pm, old_total, resultKey, result_key: true })
                                    }
                                    this.appCall()
                                })

                        }
                        else {
                            this.appCall();
                        }
                    }, 300)
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log('error', error)
        }
    }

    handleClick = async (event) => {
        //event.preventDefault();       
        var i = 0;
        let intervalId = setInterval(() => {
            if (this.state.startCapture) {
                this.object_detected(event)
            }
            i++;
        }, 1000)
        this.setState({ intervalId: intervalId });
    }

    getDate = () => {
        let today = new Date();
        let yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0!
        let dd = today.getDate();
        let hours = today.getHours()
        let min = today.getMinutes()
        let secc = today.getSeconds()
        let ms = today.getMilliseconds()
        //let time = hours +':' + min + ':' + secc

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        return today = dd + '/' + mm + '/' + yyyy + '/' + hours + ':' + min + ':' + secc + ':' + ms;
    }

    uniq_object_detection = async (event) => {
        const { resultKey, compData } = this.state;
        this.state.placeobj_count += 1  // to hide the Result at the starting
        //clearInterval(this.state.intervalId)
        this.setState({ showdata: false, showresult: false, showstatus: false })
        //this.state.msg = ""
        const imageSrc = await this.webcamRef.current.captureZoomedImage();
        // const imageSrc = this.webcam.getScreenshot({ width: DEFAULT_RESOLUTION.width, height: DEFAULT_RESOLUTION.height });
        const blob = await fetch(imageSrc).then((res) => res.blob());
        // console.log(blob)
        const formData = new FormData();
        let component_code = component_code1
        let component_name = component_name1
        let vpositive = positive
        let vnegative = negative
        let vposble_match = posble_match
        console.log('216', vposble_match)

        let today = new Date();
        let yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0!
        let dd = today.getDate();
        let _today = dd + '/' + mm + '/' + yyyy
        let test_date = yyyy + '-' + mm + '-' + dd

        let hours = today.getHours()
        let min = today.getMinutes()
        let secc = today.getSeconds()
        let time = hours + ':' + min + ':' + secc
        let milliseconds = hours + ':' + min + ':' + secc + '.' + today.getMilliseconds().toString().padStart(3, '0').slice(0, 5);
        let replace = _today + '_' + time.replaceAll(":", "_");

        let compdata = component_name + "_" + component_code + '_' + replace

        //let compdata = component_name + "_" + component_code
        //let compdata = uuidv4();

        formData.append('comp_name', component_name);
        formData.append('comp_code', component_code);
        formData.append('comp_id', this.state.comp_id);
        formData.append('positive', vpositive);
        formData.append('negative', vnegative);
        formData.append('posble_match', vposble_match);
        formData.append('datasets', blob, compdata + '.png')
        formData.append('station_name', this.state.station_name)
        formData.append('station_id', this.state.station_id)
        formData.append('inspected_ondate', test_date)
        formData.append('date', _today)
        formData.append('time', time)
        formData.append('milliseconds', milliseconds)
        formData.append('batch_id', batch_id)
        formData.append('detect_type', compData.detection_type)
        formData.append('qruniq', this.state.qruniq_checking)
        urlSocket.post('/QRobjectDetectionOnly', formData, {
            headers: {
                'content-type': 'multipart/form-data'
            },
            mode: 'no-cors'
        })
            .then(response => {
                console.log(`success`, response.data)
                console.log('first', response.data[0].status)
                // console.log('_id', response.data[0]._id)
                // let inspected_id = response.data[0]._id
                this.setState({ res_message: response.data[0].detection_result, showstatus: true })

                setTimeout(() => {
                    if (response.data[0].detection_result === 'Qr Code Found') {
                        let Checking = "Checking ...";
                        this.setState({ res_message: Checking, showstatus: true });
                        urlSocket.post('/inspectionResult',
                            {
                                'comp_name': component_name,
                                "comp_code": component_code,
                                "batch_id": batch_id,
                                "captured_image": response.data[0].captured_image,
                                "insp_result_id": response.data[0].insp_result_id,
                                "start_time_with_milliseconds": response.data[0].start_time_with_milliseconds,
                                "positive": positive,
                                "negative": negative,
                                "posble_match": posble_match,
                            },
                            { mode: 'no-cors' })
                            .then(detection => {
                                console.log('data720: ', detection)
                                this.setState({ showstatus: false });
                                let testing_result = detection.data[0].status

                                if (testing_result === positive) {
                                    let positive = testing_result.replaceAll(testing_result, this.state.config_positive)
                                    ok_count++
                                    old_ok++
                                    old_total++
                                    t_count = ok_count + ng_count + ps_match
                                    this.setState({ response_message: positive, response_value: detection.data[0].value, showresult: true, ok_count, t_count, old_ok, old_total, resultKey, result_key: true })
                                }
                                else if (testing_result === negative) {
                                    // console.log('testing_result876', testing_result, negative)
                                    let negative = testing_result.replaceAll(testing_result, this.state.config_negative)
                                    ng_count++
                                    old_ng++
                                    old_total++
                                    t_count = ok_count + ng_count + ps_match
                                    this.setState({ response_message: negative, response_value: detection.data[0].value, showresult: true, ng_count, t_count, old_ng, old_total, resultKey, result_key: true })
                                }
                                else if (testing_result === posble_match) {
                                    let posble_match = testing_result.replaceAll(testing_result, this.state.config_posble_match)
                                    ps_match++
                                    old_pm++
                                    old_total++
                                    t_count = ok_count + ng_count + ps_match
                                    this.setState({ response_message: posble_match, response_value: detection.data[0].value, showresult: true, ps_match, t_count, old_pm, old_total, resultKey, result_key: true })
                                }
                                this.appCall()
                            })
                        setTimeout(() => {


                        }, 400);
                    }
                    else {
                        this.appCall();
                    }
                }, 300)
            })

    }

    uniq_resultCall = async (data, inspected_ondate, date, time, comp_id) => {
        this.setState({ showstatus: false })
        console.log('inspected_data', data)
        console.log('inspected_ondate', inspected_ondate)
        console.log('date', date)
        console.log('time', time)
        try {
            urlSocket.post('/uniq_testing', { '_id': data, 'inspected_ondate': inspected_ondate, 'date': date, 'time': time, 'comp_id': comp_id },
                { mode: 'no-cors' })
                .then((response) => {
                    let inspected_data = response.data
                    console.log("insp_data", inspected_data)
                    // this.setState({ response_msg: inspected_data.status, showresult: true })
                    this.setState({ response_message: inspected_data.status, response_value: inspected_data.value, showresult: true })
                    if (this.state.response_message === 'No Objects Detected') {
                        this.appCall()
                    }
                    else {
                        console.log('success', response.data.status, response.data.value);
                        let testing_result = response.data.status
                        // this.setState({ response_message: response.data.status, response_value: parseFloat(response.data.value).toFixed(2), showresult: false })
                        if (testing_result === positive) {
                            let positive = testing_result.replaceAll(testing_result, this.state.config_positive)
                            this.setState({ response_message: positive, response_value: response.data.value, showresult: true })
                            setTimeout(() => {
                                this.setState({ response_message: "", response_value: "" })
                            }, 200);
                        }
                        else if (testing_result === negative) {
                            console.log('testing_result', testing_result)
                            let negative = testing_result.replaceAll(testing_result, this.state.config_negative)
                            this.setState({ response_message: negative, response_value: response.data.value, showresult: true })
                            setTimeout(() => {
                                this.setState({ response_message: "", response_value: "" })
                            }, 200);
                        }
                        else if (testing_result === posble_match) {
                            let posble_match = testing_result.replaceAll(testing_result, this.state.config_posble_match)
                            console.log('posbl_match563', posble_match)
                            this.setState({ response_message: posble_match, response_value: response.data.value, showresult: true })
                            setTimeout(() => {
                                this.setState({ response_message: "", response_value: "" })
                            }, 200);
                        }
                        setTimeout(() => {
                            this.appCall()
                        }, 200);
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {

        }
    }

    // 04-03-24

    object_detection = async (event) => {
        console.log('print123 1');

        this.setState({ inspection_started: true })
        const { resultKey, compData, inspection_type } = this.state;
        this.state.placeobj_count += 1  // to hide the Result at the starting
        this.setState({ showdata: false, showresult: false, showstatus: false, rectangles: [] })
        //this.state.msg = ""
        const imageSrc = await this.webcamRef.current.captureZoomedImage();
        // const imageSrc = this.webcam.getScreenshot({ width: DEFAULT_RESOLUTION.width, height: DEFAULT_RESOLUTION.height});
        this.setState({ res_img: imageSrc })
        const blob = await fetch(imageSrc).then((res) => res.blob());
        // console.log(blob)
        const formData = new FormData();
        let component_code = component_code1
        let component_name = component_name1
        let vpositive = positive
        let vnegative = negative
        let vposble_match = posble_match
        console.log('216', vposble_match)

        let today = new Date();
        let yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0!
        let dd = today.getDate();
        let _today = dd + '/' + mm + '/' + yyyy
        let test_date = yyyy + '-' + mm + '-' + dd

        let hours = today.getHours()
        let min = today.getMinutes()
        let secc = today.getSeconds()
        let time = hours + ':' + min + ':' + secc
        // let milliseconds = hours + ':' + min + ':' + secc + '.' + today.getMilliseconds();
        let milliseconds = hours + ':' + min + ':' + secc + '.' + today.getMilliseconds().toString().padStart(3, '0').slice(0, 5);
        console.log('time', milliseconds)

        let replace = _today + '_' + time.replaceAll(":", "_");

        let compdata = component_name + "_" + component_code + '_' + replace

        //let compdata = component_name + "_" + component_code
        //let compdata = uuidv4();

        formData.append('comp_name', component_name);
        formData.append('comp_code', component_code);
        formData.append('comp_id', this.state.comp_id);
        formData.append('positive', vpositive);
        formData.append('negative', vnegative);
        formData.append('posble_match', vposble_match);
        formData.append('datasets', blob, compdata + '.png')
        formData.append('station_name', this.state.station_name)
        formData.append('station_id', this.state.station_id)
        formData.append('inspected_ondate', test_date)
        formData.append('date', _today)
        formData.append('time', time)
        formData.append('milliseconds', milliseconds)
        formData.append('batch_id', batch_id)
        formData.append('detect_selection', JSON.stringify(compData.detect_selection));
        formData.append('detect_type', compData.detection_type)
        formData.append('qrbar_result', this.state.qrbar_result)

        if (compData.detection_type == "Smart Object Locator") {
            formData.append('our_rectangles', JSON.stringify(compData?.rectangles));
            formData.append('selected_regions', JSON.stringify(compData?.selected_regions));
        }

        const compBarcode = this.state.barcode_data === null || this.state.barcode_data === undefined;
        try {
            urlSocket.post('/objectDetectionOnly', formData, {
                headers: {
                    'content-type': 'multipart/form-data'
                },
                mode: 'no-cors'
            })
                .then(response => {
                    console.log(`success`, response.data);
                    let obj_result = response.data[0].detection_result;
                    this.setState({
                        res_message: response.data[0].detection_result,
                        showstatus: true,
                        comp_found: response.data[0].detection_result === "Object Detected" ? 2 : 1
                    })

                    let updated_rectangles = [];
                    if (response.data[0]?.updated_rectangles) {
                        updated_rectangles = response.data[0].updated_rectangles
                    }

                    setTimeout(() => {
                        if ((compData.detect_selection == true && obj_result == "Object Detected") ||
                            (compData.detect_selection == false && obj_result == "")) {
                            let Checking = "Checking ..."
                            this.setState({ res_message: Checking, showstatus: true });

                            // after object detection

                            const { overAll_testing, region_selection, region_wise_testing } = this.state.componentData[0];

                            urlSocket.post('/inspectionResult',
                                {
                                    'comp_name': component_name,
                                    "comp_code": component_code,
                                    "batch_id": batch_id,
                                    "captured_image": response.data[0].captured_image,
                                    "insp_result_id": response.data[0].insp_result_id,
                                    "start_time_with_milliseconds": response.data[0].start_time_with_milliseconds,
                                    "positive": positive,
                                    "negative": negative,
                                    "posble_match": posble_match,
                                    "background": compData.background,

                                    "overAll_testing": overAll_testing,
                                    "region_selection": region_selection,
                                    "region_wise_testing": region_wise_testing,
                                    "updated_rectangles": updated_rectangles,
                                },
                                { mode: 'no-cors' })
                                .then(detection => {
                                    console.log('detection : ', detection);

                                    // dropped here
                                    this.setState({ showstatus: false, inspection_started: false })
                                    let testing_result = detection.data[0].status
                                    console.log('testing_result', testing_result)

                                    if (testing_result === positive) {
                                        let positive = testing_result.replaceAll(testing_result, this.state.config_positive)
                                        ok_count++
                                        old_ok++
                                        old_total++
                                        t_count = ok_count + ng_count + ps_match
                                        this.setState({
                                            response_message: positive, response_value: detection.data[0].value, showresult: true, ok_count, t_count, old_ok, old_total, resultKey, result_key: true,
                                            qrbar_countdown_active: compBarcode === false ? true : undefined,
                                            comp_result: compBarcode === false ? 2 : undefined
                                        })
                                    }
                                    else if (testing_result === negative) {
                                        // console.log('testing_result876', testing_result, negative)
                                        let negative = testing_result.replaceAll(testing_result, this.state.config_negative)
                                        ng_count++
                                        old_ng++
                                        old_total++
                                        t_count = ok_count + ng_count + ps_match
                                        this.setState({
                                            response_message: negative, response_value: detection.data[0].value, showresult: true, ng_count, t_count, old_ng, old_total, resultKey, result_key: true,
                                            qrbar_countdown_active: compBarcode === false ? true : undefined,
                                            comp_result: compBarcode === false ? 1 : undefined
                                        })
                                    }
                                    else if (testing_result === posble_match) {
                                        let posble_match = testing_result.replaceAll(testing_result, this.state.config_posble_match)
                                        ps_match++
                                        old_pm++
                                        old_total++
                                        t_count = ok_count + ng_count + ps_match
                                        console.log('posbl_match563', posble_match)
                                        this.setState({
                                            response_message: posble_match, response_value: detection.data[0].value, showresult: true, ps_match, t_count, old_pm, old_total, resultKey, result_key: true,
                                            qrbar_countdown_active: compBarcode === false ? true : undefined,
                                        })
                                    }
                                    if (this.state.region_selection) {
                                        const originalWidth = 640;
                                        const originalHeight = 480;
                                        const targetWidth = DEFAULT_RESOLUTION.width;
                                        const targetHeight = DEFAULT_RESOLUTION.height;

                                        // Calculate scaling factors
                                        const scaleX = targetWidth / originalWidth;
                                        const scaleY = targetHeight / originalHeight;

                                        const retrievedRectangles = detection.data[0].region_results.map((rect) => ({
                                            x: rect.rectangles.coordinates.x / scaleX,
                                            y: rect.rectangles.coordinates.y / scaleY,
                                            height: rect.rectangles.coordinates.height / scaleY,
                                            width: rect.rectangles.coordinates.width / scaleX,
                                            id: rect.rectangles.id,
                                            name: rect.rectangles.name,
                                            colour: rect.result === 'OK' ? 'green' : 'red'
                                        }));
                                        // console.log('re', re)

                                        this.setState({ rectangles: retrievedRectangles, output_Rect: true });
                                    }
                                    if (compBarcode) {
                                        this.appCall()
                                    }
                                })
                        }
                        // if (response.data[0].detection_result === "Object Detected") {}
                        else {
                            if (compBarcode) {
                                this.appCall();
                            } else {
                                this.setState({
                                    comp_found: 1,
                                    isCountdownActive: true,
                                    showdata: true //show 'place the object'
                                })
                            }
                        }
                    }, 500)
                })
        } catch (error) {
            console.error('/API ERROR, OBJECT_DETECTION or INSPECTION_RESULT ', error);
            this.setState({ inspection_started: false })
        }
    }


    // object_detection = async (event) => {
    //     const {resultKey} = this.state;
    //     this.state.placeobj_count += 1  // to hide the Result at the starting
    //     this.setState({ showdata: false, showresult: false, showstatus: false})
    //     //this.state.msg = ""
    //     const imageSrc = await this.webcamRef.current.captureZoomedImage();
    // //     const imageSrc = this.webcam.getScreenshot({ width: 1440, height: 1080});
    //     const blob = await fetch(imageSrc).then((res) => res.blob());
    //     // console.log(blob)
    //     const formData = new FormData();
    //     let component_code = component_code1
    //     let component_name = component_name1
    //     let vpositive = positive
    //     let vnegative = negative
    //     let vposble_match = posble_match
    //     console.log('216', vposble_match)

    //     let today = new Date();
    //     let yyyy = today.getFullYear();
    //     let mm = today.getMonth() + 1; // Months start at 0!
    //     let dd = today.getDate();
    //     let _today = dd + '/' + mm + '/' + yyyy
    //     let test_date = yyyy + '-' + mm + '-' + dd

    //     let hours = today.getHours()
    //     let min = today.getMinutes()
    //     let secc = today.getSeconds()
    //     let time = hours + ':' + min + ':' + secc
    //     // let milliseconds = hours + ':' + min + ':' + secc + '.' + today.getMilliseconds();
    //     let milliseconds = hours + ':' + min + ':' + secc + '.' + today.getMilliseconds().toString().padStart(3, '0').slice(0, 5);
    //     console.log('time', milliseconds)

    //     let replace = _today + '_' + time.replaceAll(":", "_");

    //     let compdata = component_name + "_" + component_code + '_' + replace

    //     //let compdata = component_name + "_" + component_code
    //     //let compdata = uuidv4();

    //     formData.append('comp_name', component_name);
    //     formData.append('comp_code', component_code);
    //     formData.append('comp_id', this.state.comp_id);
    //     formData.append('positive', vpositive);
    //     formData.append('negative', vnegative);
    //     formData.append('posble_match', vposble_match);
    //     formData.append('datasets', blob, compdata + '.png')
    //     formData.append('station_name', this.state.station_name)
    //     formData.append('station_id', this.state.station_id)
    //     formData.append('inspected_ondate', test_date)
    //     formData.append('date', _today)
    //     formData.append('time', time)
    //     formData.append('milliseconds', milliseconds)
    //     formData.append('batch_id', batch_id)
    //     urlSocket.post('/line_object_detected', formData, {
    //         headers: {
    //             'content-type': 'multipart/form-data'
    //         },
    //         mode: 'no-cors'
    //     })
    //         .then(response => {
    //             console.log(`success`, response.data)
    //             console.log('first', response.data[0].status)
    //             console.log('_id', response.data[0]._id)
    //             let inspected_id = response.data[0]._id
    //             this.setState({ res_message: response.data[0].detection_result, showstatus: true })

    //             setTimeout(() => {
    //                 if (response.data[0].detection_result === "Object Detected") {
    //                     let Checking = "Checking ..."
    //                     this.setState({ res_message: Checking, showstatus: true })
    //                         this.setState({ res_message: Checking })
    //                     setTimeout(() => {
    //                         this.setState({ showstatus: false })
    //                         let testing_result = response.data[0].status
    //                         console.log('testing_result', testing_result)

    //                         if (testing_result === positive) {
    //                             let positive = testing_result.replaceAll(testing_result, this.state.config_positive)
    //                             ok_count++
    //                             old_ok++
    //                             old_total++
    //                             t_count=ok_count+ng_count+ps_match
    //                             this.setState({ response_message: positive, response_value: response.data[0].value, showresult: true, ok_count, t_count, old_ok, old_total, resultKey, result_key: true })
    //                         }
    //                         else if (testing_result === negative) {
    //                             // console.log('testing_result876', testing_result, negative)
    //                             let negative = testing_result.replaceAll(testing_result, this.state.config_negative)
    //                             ng_count++
    //                             old_ng++
    //                             old_total++
    //                             t_count=ok_count+ng_count+ps_match
    //                             this.setState({ response_message: negative, response_value: response.data[0].value, showresult: true, ng_count, t_count, old_ng, old_total, resultKey, result_key: true })
    //                         }
    //                         else if (testing_result === posble_match) {
    //                             let posble_match = testing_result.replaceAll(testing_result, this.state.config_posble_match)
    //                             ps_match++
    //                             old_pm++
    //                             old_total++
    //                             t_count=ok_count+ng_count+ps_match
    //                             console.log('posbl_match563', posble_match)
    //                             this.setState({ response_message: posble_match, response_value: response.data[0].value, showresult: true, ps_match, t_count, old_pm, old_total, resultKey, result_key: true })
    //                         }
    //                             this.appCall()

    //                     }, 400);

    //                 }
    //                 else {
    //                     this.appCall();
    //                 }
    //             }, 300)
    //         })
    // }


    uniq_btnidentity = async (event) => {
        const { resultKey, compData } = this.state;
        this.state.placeobj_count += 1  // to hide the Result at the starting
        clearInterval(this.state.intervalId)
        this.setState({ show: false, msg: false, show_next: false, showplaceobject: false, showresult: false, showstatus: false })
        const imageSrc = await this.webcamRef.current.captureZoomedImage();
        // const imageSrc = this.webcam.getScreenshot({ width: DEFAULT_RESOLUTION.width, height: DEFAULT_RESOLUTION.height});
        const blob = await fetch(imageSrc).then((res) => res.blob());
        // console.log(blob)
        const formData = new FormData();
        let component_code = component_code1
        let component_name = component_name1
        let vpositive = positive
        let vnegative = negative
        let vposble_match = posble_match

        let today = new Date();
        let yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months F at 0!
        let dd = today.getDate();
        let _today = dd + '/' + mm + '/' + yyyy
        console.log('fi748rst', _today)
        let test_date = yyyy + '-' + mm + '-' + dd

        let hours = today.getHours()
        let min = today.getMinutes()
        let secc = today.getSeconds()
        let time = hours + ':' + min + ':' + secc;
        let milliseconds = hours + ':' + min + ':' + secc + '.' + today.getMilliseconds().toString().padStart(3, '0').slice(0, 5);
        let replace = _today + '_' + time.replaceAll(":", "_");

        let compdata = component_name + "_" + component_code + '_' + replace

        //let compdata = component_name + "_" + component_code
        //let compdata = uuidv4();

        formData.append('comp_name', component_name);
        formData.append('comp_code', component_code);
        formData.append('comp_id', this.state.comp_id);
        formData.append('positive', vpositive);
        formData.append('negative', vnegative);
        formData.append('posble_match', vposble_match);
        formData.append('datasets', blob, compdata + '.png')
        formData.append('station_name', this.state.station_name)
        formData.append('station_id', this.state.station_id)
        formData.append('inspected_ondate', test_date)
        formData.append('date', _today)
        formData.append('time', time)
        formData.append('milliseconds', milliseconds)
        formData.append('batch_id', batch_id)
        formData.append('detect_type', compData.detection_type)
        formData.append('qruniq', this.state.qruniq_checking)
        try {
            urlSocket.post('/QRobjectDetectionOnly', formData, {
                headers: {
                    'content-type': 'multipart/form-data'
                },
                mode: 'no-cors'
            })
                .then((response) => {
                    let data = response.data
                    console.log('data237', data)
                    this.setState({ res_message: response.data[0].detection_result, showstatus: true })

                    setTimeout(() => {
                        if (response.data[0].detection_result === 'New Data found') {
                            //console.log('inspected_id', inspected_id)
                            let Checking = "Checking ..."
                            this.setState({ res_message: Checking, showstatus: true });

                            urlSocket.post('/inspectionResult',
                                {
                                    'comp_name': component_name,
                                    "comp_code": component_code,
                                    "batch_id": batch_id,
                                    "captured_image": response.data[0].captured_image,
                                    "insp_result_id": response.data[0].insp_result_id,
                                    "start_time_with_milliseconds": response.data[0].start_time_with_milliseconds,
                                    "positive": positive,
                                    "negative": negative,
                                    "posble_match": posble_match,
                                },
                                { mode: 'no-cors' })
                                .then(detection => {
                                    this.setState({ showstatus: false, show_next: true, show: true })
                                    let testing_result = detection.data[0].status

                                    if (testing_result === positive) {
                                        let positive = testing_result.replaceAll(testing_result, this.state.config_positive)
                                        ok_count++
                                        old_ok++
                                        old_total++
                                        t_count = ok_count + ng_count + ps_match
                                        this.setState({ response_message: positive, response_value: detection.data[0].value, showresult: true, ok_count, t_count, old_ok, old_total, resultKey, result_key: true })
                                    }
                                    else if (testing_result === negative) {
                                        console.log('testing_result876', testing_result,)
                                        let negative = testing_result.replaceAll(testing_result, this.state.config_negative)
                                        ng_count++
                                        old_ng++
                                        old_total++
                                        this.setState({ response_message: negative, response_value: detection.data[0].value, showresult: true, ng_count, t_count, old_ng, old_total, resultKey, result_key: true })
                                    }
                                    else if (testing_result === posble_match) {
                                        let posble_match = testing_result.replaceAll(testing_result, this.state.config_posble_match)
                                        console.log('posbl_match563', posble_match)
                                        ps_match++
                                        old_pm++
                                        old_total++
                                        this.setState({ response_message: posble_match, response_value: detection.data[0].value, showresult: true, ps_match, t_count, old_pm, old_total, resultKey, result_key: true })
                                    }
                                    this.cont_apiCall()
                                })
                        }
                        else {
                            this.cont_apiCall();
                        }
                    }, 300)
                })
                .catch((error) => {
                    console.log(error)
                })
            // urlSocket.post('/uniqInfo', formData, {
            //     headers: {
            //         'content-type': 'multipart/form-data'
            //     },
            //     mode: 'no-cors'
            // })
            //     .then((response) => {
            //         let data = response.data
            //         console.log('data237', data)
            //         this.setState({ res_message: response.data[0].detection_result, showstatus: true })

            //         setTimeout(() => {
            //             if (response.data[0].detection_result === 'New Data found') {
            //                 //console.log('inspected_id', inspected_id)
            //                 let Checking = "Checking ..."
            //                 this.setState({ res_message: Checking, showstatus: true })

            //                 setTimeout(() => {
            //                     this.setState({ showstatus: false, show_next: true, show: true })
            //                     let testing_result = response.data[0].status

            //                     if (testing_result === positive) {
            //                         let positive = testing_result.replaceAll(testing_result, this.state.config_positive)
            //                         ok_count++
            //                         old_ok++
            //                         old_total++
            //                         t_count=ok_count+ng_count+ps_match
            //                         this.setState({ response_message: positive, response_value: response.data[0].value, showresult: true,ok_count,t_count,old_ok,old_total, resultKey, result_key: true })
            //                     }
            //                     else if (testing_result === negative) {
            //                         console.log('testing_result876', testing_result,)
            //                         let negative = testing_result.replaceAll(testing_result, this.state.config_negative)
            //                         ng_count++
            //                         old_ng++
            //                         old_total++
            //                         this.setState({ response_message: negative, response_value: response.data[0].value, showresult: true,ng_count,t_count,old_ng,old_total, resultKey, result_key: true })
            //                     }
            //                     else if (testing_result === posble_match) {
            //                         let posble_match = testing_result.replaceAll(testing_result, this.state.config_posble_match)
            //                         console.log('posbl_match563', posble_match)
            //                         ps_match++
            //                         old_pm++
            //                         old_total++
            //                         this.setState({ response_message: posble_match, response_value: response.data[0].value, showresult: true,ps_match,t_count,old_pm,old_total, resultKey, result_key: true })
            //                     }
            //                         this.cont_apiCall()
            //                 }, 400);
            //             }
            //             else {
            //                 this.cont_apiCall();
            //             }
            //         }, 300)
            //     })
            //     .catch((error) => {
            //         console.log(error)
            //     })
        } catch (error) {
            console.log('error', error)
        }
    }

    uniq_identification = async (event) => {
        const { resultKey, compData } = this.state;
        this.state.placeobj_count += 1  // to hide the Result at the starting
        clearInterval(this.state.intervalId)
        this.setState({ show: false, msg: false, show_next: false, showplaceobject: false, showresult: false, showstatus: false })
        const imageSrc = await this.webcamRef.current.captureZoomedImage();
        // const imageSrc = this.webcam.getScreenshot({ width: DEFAULT_RESOLUTION.width, height: DEFAULT_RESOLUTION.height });
        const blob = await fetch(imageSrc).then((res) => res.blob());
        // console.log(blob)
        const formData = new FormData();
        let component_code = component_code1
        let component_name = component_name1
        let vpositive = positive
        let vnegative = negative
        let vposble_match = posble_match

        let today = new Date();
        let yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0!
        let dd = today.getDate();
        let _today = dd + '/' + mm + '/' + yyyy
        let test_date = yyyy + '-' + mm + '-' + dd

        let hours = today.getHours()
        let min = today.getMinutes()
        let secc = today.getSeconds()
        let time = hours + ':' + min + ':' + secc
        let replace = _today + '_' + time.replaceAll(":", "_");

        let compdata = component_name + "_" + component_code + '_' + replace

        //let compdata = component_name + "_" + component_code
        //let compdata = uuidv4();

        formData.append('comp_name', component_name);
        formData.append('comp_code', component_code);
        formData.append('comp_id', this.state.comp_id);
        formData.append('positive', vpositive);
        formData.append('negative', vnegative);
        formData.append('posble_match', vposble_match);
        formData.append('datasets', blob, compdata + '.png')
        formData.append('station_name', this.state.station_name)
        formData.append('station_id', this.state.station_id)
        formData.append('inspected_ondate', test_date)
        formData.append('date', _today)
        formData.append('time', time)
        formData.append('batch_id', batch_id)
        formData.append('detect_type', compData.detection_type)
        formData.append('qruniq', this.state.qruniq_checking)
        urlSocket.post('/QRobjectDetectionOnly', formData, {
            headers: {
                'content-type': 'multipart/form-data'
            },
            mode: 'no-cors'
        })
            .then(response => {
                console.log(`success`, response.data)
                console.log('first', response.data[0].status)
                this.setState({ res_message: response.data[0].detection_result, showstatus: true })

                setTimeout(() => {
                    if (response.data[0].detection_result === 'Qr Code Found') {
                        let Checking = "Checking ..."
                        this.setState({ res_message: Checking, showstatus: true })
                        urlSocket.post('/inspectionResult',
                            {
                                'comp_name': component_name,
                                "comp_code": component_code,
                                "batch_id": batch_id,
                                "captured_image": response.data[0].captured_image,
                                "insp_result_id": response.data[0].insp_result_id,
                                "start_time_with_milliseconds": response.data[0].start_time_with_milliseconds,
                                "positive": positive,
                                "negative": negative,
                                "posble_match": posble_match,
                            },
                            { mode: 'no-cors' })
                            .then(detection => {
                                this.setState({ showstatus: false, show_next: true, show: true })
                                let testing_result = detection.data[0].status

                                if (testing_result === positive) {
                                    let positive = testing_result.replaceAll(testing_result, this.state.config_positive)
                                    ok_count++
                                    old_ok++
                                    old_total++
                                    t_count = ok_count + ng_count + ps_match
                                    this.setState({ response_message: positive, response_value: detection.data.value, showresult: true, ok_count, old_ok, old_total, t_count, resultKey, result_key: true })
                                }
                                else if (testing_result === negative) {
                                    // console.log('testing_result876', testing_result, negative)
                                    let negative = testing_result.replaceAll(testing_result, this.state.config_negative)
                                    ng_count++
                                    old_ng++
                                    old_total++
                                    t_count = ok_count + ng_count + ps_match
                                    this.setState({ response_message: negative, response_value: detection.data.value, showresult: true, ng_count, old_ng, old_total, t_count, resultKey, result_key: true })
                                }
                                else if (testing_result === posble_match) {
                                    let posble_match = testing_result.replaceAll(testing_result, this.state.config_posble_match)
                                    console.log('posbl_match563', posble_match)
                                    ps_match++
                                    old_pm++
                                    old_total++
                                    t_count = ok_count + ng_count + ps_match
                                    this.setState({ response_message: posble_match, response_value: detection.data.value, showresult: true, ps_match, old_pm, old_total, t_count, resultKey, result_key: true })
                                }
                                this.cont_apiCall()
                            })
                    }
                    else {
                        this.cont_apiCall();
                    }
                }, 300)
            })
    }

    uniq_APICall = async (data, inspected_ondate, date, time, comp_id) => {
        this.setState({ showstatus: false, msg: false })
        console.log('inspected_data', data)
        console.log('inspected_ondate', inspected_ondate)
        console.log('date', date)
        console.log('time', time)
        try {
            urlSocket.post('/uniq_testing', { '_id': data, 'inspected_ondate': inspected_ondate, 'date': date, 'time': time, 'comp_id': comp_id },
                { mode: 'no-cors' })
                .then((response) => {
                    let inspected_data = response.data
                    console.log("insp_data", inspected_data)
                    // this.setState({ response_msg: inspected_data.status, showresult: true })
                    this.setState({ response_message: inspected_data.status, response_value: inspected_data.value, showresult: true })
                    if (this.state.response_message === 'No Objects Detected') {
                        this.cont_apiCall()
                    }
                    else {
                        console.log('success', response.data.status, response.data.value);
                        let testing_result = response.data.status
                        // this.setState({ response_message: response.data.status, response_value: parseFloat(response.data.value).toFixed(2), showresult: false })
                        if (testing_result === positive) {
                            let positive = testing_result.replaceAll(testing_result, this.state.config_positive)
                            this.setState({ response_message: positive, response_value: response.data.value, showresult: true })
                            setTimeout(() => {
                                this.setState({ response_message: "", response_value: "" })
                            }, 200);
                        }
                        else if (testing_result === negative) {
                            let negative = testing_result.replaceAll(testing_result, this.state.config_negative)
                            this.setState({ response_message: negative, response_value: response.data.value, showresult: true })
                            setTimeout(() => {
                                this.setState({ response_message: "", response_value: "" })
                            }, 200);
                        }
                        else if (testing_result === posble_match) {
                            let posble_match = testing_result.replaceAll(testing_result, this.state.config_posble_match)
                            console.log('posbl_match563', posble_match)
                            this.setState({ response_message: posble_match, response_value: response.data.value, showresult: true })
                            setTimeout(() => {
                                this.setState({ response_message: "", response_value: "" })
                            }, 200);
                        }
                        setTimeout(() => {
                            this.cont_apiCall()
                        }, 200);
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
        }
    }


    object_detected = async (event) => {
        console.log('print123 2');

        this.setState({ inspection_started: true })
        const { resultKey, compData } = this.state;

        this.state.placeobj_count += 1  // to hide the Result at the starting
        clearInterval(this.state.intervalId)
        this.setState({ show: false, msg: false, show_next: false, showplaceobject: false, showresult: false, showstatus: false, rectangles: [] })
        const imageSrc = await this.webcamRef.current.captureZoomedImage();
        // const imageSrc = this.webcam.getScreenshot({ width: DEFAULT_RESOLUTION.width, height: DEFAULT_RESOLUTION.height });
        this.setState({ res_img: imageSrc })
        const blob = await fetch(imageSrc).then((res) => res.blob());
        const formData = new FormData();
        let component_code = component_code1
        let component_name = component_name1
        let vpositive = positive
        let vnegative = negative
        let vposble_match = posble_match

        let today = new Date();
        let yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0!
        let dd = today.getDate();
        let _today = dd + '/' + mm + '/' + yyyy
        let test_date = yyyy + '-' + mm + '-' + dd

        let hours = today.getHours()
        let min = today.getMinutes()
        let secc = today.getSeconds()
        let time = hours + ':' + min + ':' + secc
        // let milliseconds = hours + ':' + min + ':' + secc + '.' + today.getMilliseconds();
        let milliseconds = hours + ':' + min + ':' + secc + '.' + today.getMilliseconds().toString().padStart(3, '0').slice(0, 5);
        console.log('time', time)
        let replace = _today + '_' + time.replaceAll(":", "_");

        let compdata = component_name + "_" + component_code + '_' + replace

        //let compdata = component_name + "_" + component_code
        //let compdata = uuidv4();

        // console.log('data1566 ', imageSrc, blob)
        console.log('data1566 ', blob)

        formData.append('comp_name', component_name);
        formData.append('comp_code', component_code);
        formData.append('comp_id', this.state.comp_id);
        formData.append('positive', vpositive);
        formData.append('negative', vnegative);
        formData.append('posble_match', vposble_match);
        // formData.append('datasets', blob, `${compdata}_${uuidv4()}` + '.png')
        formData.append('datasets', blob, compdata + '.png')
        formData.append('station_name', this.state.station_name)
        formData.append('station_id', this.state.station_id)
        formData.append('inspected_ondate', test_date)
        formData.append('date', _today)
        formData.append('time', time)
        formData.append('milliseconds', milliseconds)
        formData.append('batch_id', batch_id)
        formData.append('detect_selection', JSON.stringify(compData.detect_selection));
        formData.append('detect_type', compData.detection_type)
        formData.append('qrbar_result', this.state.qrbar_result)
        formData.append('__start_time', today)

        if (compData.detection_type == "Smart Object Locator") {
            formData.append('our_rectangles', JSON.stringify(compData?.rectangles));
            formData.append('selected_regions', JSON.stringify(compData?.selected_regions));
        }

        console.log('data915 ', this.state.barcode_data)

        const compBarcode = this.state.barcode_data === null || this.state.barcode_data === undefined;
        try {
            urlSocket.post('/objectDetectionOnly', formData, {
                headers: {
                    'content-type': 'multipart/form-data'
                },
                mode: 'no-cors'
            })
                .then(response => {
                    console.log(`success`, response.data);
                    let obj_result = response.data[0].detection_result;
                    this.setState({
                        res_message: response.data[0].detection_result,
                        showstatus: true,
                        comp_found: response.data[0].detection_result === "Object Detected" ? 2 : 1
                    });

                    let updated_rectangles = [];
                    if (response.data[0]?.updated_rectangles) {
                        updated_rectangles = response.data[0].updated_rectangles
                    }

                    setTimeout(() => {
                        if ((compData.detect_selection == true && obj_result == "Object Detected") ||
                            (compData.detect_selection == false && obj_result == "")) {
                            let Checking = "Checking ..."
                            this.setState({ res_message: Checking, showstatus: true });

                            const { overAll_testing, region_selection, region_wise_testing } = this.state.componentData[0];

                            const payload = {
                                'comp_name': component_name,
                                "comp_code": component_code,
                                "batch_id": batch_id,
                                "captured_image": response.data[0].captured_image,
                                "insp_result_id": response.data[0].insp_result_id,
                                "start_time_with_milliseconds": response.data[0].start_time_with_milliseconds,
                                "positive": positive,
                                "negative": negative,
                                "posble_match": posble_match,
                                "background": compData.background,

                                "overAll_testing": overAll_testing,
                                "region_selection": region_selection,
                                "region_wise_testing": region_wise_testing,
                                "updated_rectangles": updated_rectangles,
                            }
                            console.log('componentData payload ', payload, this.state.componentData);
                            urlSocket.post('/inspectionResult', payload,
                                { mode: 'no-cors' })
                                .then(detection => {

                                    this.setState({
                                        showstatus: false,
                                        comp_found: 2,
                                        inspection_started: false,
                                    })
                                    if (compBarcode) {
                                        this.setState({ show_next: true, show: true, })
                                    }
                                    let testing_result = detection.data[0].status
                                    console.log('response >>> ', response)
                                    console.log('response >>> ', detection.data)
                                    console.log('testing_result', detection.data[0])

                                    if (testing_result === positive) {
                                        let positive = testing_result.replaceAll(testing_result, this.state.config_positive)
                                        ok_count++
                                        old_ok++
                                        old_total++
                                        console.log('state1', old_ok)
                                        t_count = ok_count + ng_count + ps_match
                                        this.setState({
                                            response_message: positive, response_value: detection.data[0].value, showresult: true, ok_count, t_count, old_ok, old_total, resultKey, result_key: true,
                                            comp_result: 2
                                        });
                                        if (compBarcode === false) {
                                            this.setState({ qrbar_start_btn: true })
                                        }
                                    }
                                    else if (testing_result === negative) {
                                        console.log('response.data.value <<< >>> ', response.data.value)
                                        let negative = testing_result.replaceAll(testing_result, this.state.config_negative)
                                        ng_count++
                                        old_ng++
                                        old_total++
                                        t_count = ok_count + ng_count + ps_match
                                        this.setState({
                                            response_message: negative, response_value: detection.data[0].value, showresult: true, ng_count, t_count, old_ng, old_total, resultKey, result_key: true,
                                            comp_result: 1
                                        })
                                        if (compBarcode === false) {
                                            this.setState({ qrbar_start_btn: true })
                                        }
                                    }
                                    else if (testing_result === posble_match) {
                                        let posble_match = testing_result.replaceAll(testing_result, this.state.config_posble_match)
                                        console.log('posbl_match563', posble_match)
                                        ps_match++
                                        old_pm++
                                        old_total++
                                        t_count = ok_count + ng_count + ps_match
                                        this.setState({ response_message: posble_match, response_value: detection.data[0].value, showresult: true, ps_match, t_count, old_pm, old_total, resultKey, result_key: true })
                                    }
                                    if (this.state.region_selection) {
                                        const originalWidth = 640;
                                        const originalHeight = 480;
                                        const targetWidth = DEFAULT_RESOLUTION.width;
                                        const targetHeight = DEFAULT_RESOLUTION.height;

                                        // Calculate scaling factors
                                        const scaleX = targetWidth / originalWidth;
                                        const scaleY = targetHeight / originalHeight;

                                        const retrievedRectangles = detection.data[0].region_results.map((rect) => ({
                                            x: rect?.rectangles.coordinates.x / scaleX,
                                            y: rect?.rectangles.coordinates.y / scaleY,
                                            height: rect?.rectangles.coordinates.height / scaleY,
                                            width: rect?.rectangles.coordinates.width / scaleX,
                                            id: rect?.rectangles.id,
                                            name: rect?.rectangles.name,
                                            colour: rect?.result === 'OK' ? 'green' : 'red'
                                        }));
                                        // console.log('re', re)

                                        this.setState({ rectangles: retrievedRectangles, output_Rect: true });
                                    }
                                    // this.cont_apiCall()
                                })
                        }
                        // if (response.data[0].detection_result === "Object Detected") {}
                        else {
                            if (compBarcode) {
                                this.cont_apiCall();
                            } else {
                                this.setState({
                                    // showstatus: false,
                                    show: true,
                                    comp_found: 1
                                })
                            }
                        }
                    }, 300) // Object detected time
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log('error', error)
            this.setState({ inspection_started: false })
        }

    }

    resultCall = async (data, inspected_ondate, date, time, comp_id) => {
        this.setState({ showstatus: false })
        console.log('inspected_data', data)
        console.log('inspected_ondate', inspected_ondate)
        console.log('date', date)
        console.log('time', time)
        try {
            urlSocket.post('/Testing', { '_id': data, 'inspected_ondate': inspected_ondate, 'date': date, 'time': time, 'comp_id': comp_id },
                { mode: 'no-cors' })
                .then((response) => {
                    let inspected_data = response.data
                    console.log("insp_data", inspected_data)
                    // this.setState({ response_msg: inspected_data.status, showresult: true })
                    this.setState({ response_message: inspected_data.status, response_value: inspected_data.value, showresult: true })
                    if (this.state.response_message === 'No Objects Detected') {
                        this.appCall()
                    }
                    else {
                        console.log('success', response.data.status, response.data.value);
                        let testing_result = response.data.status
                        // this.setState({ response_message: response.data.status, response_value: parseFloat(response.data.value).toFixed(2), showresult: false })
                        if (testing_result === positive) {
                            let positive = testing_result.replaceAll(testing_result, this.state.config_positive)
                            this.setState({ response_message: positive, response_value: response.data.value, showresult: true })
                            setTimeout(() => {
                                this.setState({ response_message: "", response_value: "" })
                            }, 200);
                        }
                        else if (testing_result === negative) {
                            let negative = testing_result.replaceAll(testing_result, this.state.config_negative)
                            this.setState({ response_message: negative, response_value: response.data.value, showresult: true })
                            setTimeout(() => {
                                this.setState({ response_message: "", response_value: "" })
                            }, 200);
                        }
                        else if (testing_result === posble_match) {
                            let posble_match = testing_result.replaceAll(testing_result, this.state.config_posble_match)
                            console.log('posbl_match563', posble_match)
                            this.setState({ response_message: posble_match, response_value: response.data.value, showresult: true })
                            setTimeout(() => {
                                this.setState({ response_message: "", response_value: "" })
                            }, 200);
                        }
                        setTimeout(() => {
                            this.appCall()
                        }, 200);
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
        }
    }


    APICall = async (data, inspected_ondate, date, time, comp_id) => {
        this.setState({ showstatus: false, msg: false })
        console.log('inspected_data', data)
        console.log('inspected_ondate', inspected_ondate)
        console.log('date', date)
        console.log('time', time)
        try {
            urlSocket.post('/Testing', { '_id': data, 'inspected_ondate': inspected_ondate, 'date': date, 'time': time, 'comp_id': comp_id },
                { mode: 'no-cors' })
                .then((response) => {
                    let inspected_data = response.data
                    console.log("insp_data", inspected_data)
                    // this.setState({ response_msg: inspected_data.status, showresult: true })
                    this.setState({ response_message: inspected_data.status, response_value: inspected_data.value, showresult: true })
                    if (this.state.response_message === 'No Objects Detected') {
                        this.cont_apiCall()
                    }
                    else {
                        console.log('success', response.data.status, response.data.value);
                        let testing_result = response.data.status
                        // this.setState({ response_message: response.data.status, response_value: parseFloat(response.data.value).toFixed(2), showresult: false })
                        if (testing_result === positive) {
                            let positive = testing_result.replaceAll(testing_result, this.state.config_positive)
                            this.setState({ response_message: positive, response_value: response.data.value, showresult: true })
                            setTimeout(() => {
                                this.setState({ response_message: "", response_value: "" })
                            }, 200);
                        }
                        else if (testing_result === negative) {
                            let negative = testing_result.replaceAll(testing_result, this.state.config_negative)
                            this.setState({ response_message: negative, response_value: response.data.value, showresult: true })
                            setTimeout(() => {
                                this.setState({ response_message: "", response_value: "" })
                            }, 200);
                        }
                        else if (testing_result === posble_match) {
                            let posble_match = testing_result.replaceAll(testing_result, this.state.config_posble_match)
                            console.log('posbl_match563', posble_match)
                            this.setState({ response_message: posble_match, response_value: response.data.value, showresult: true })
                            setTimeout(() => {
                                this.setState({ response_message: "", response_value: "" })
                            }, 200);
                        }
                        setTimeout(() => {
                            this.cont_apiCall()
                        }, 200);
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
        }
    }


    getImage = (image_path, type) => {
        if (image_path === undefined) {
            return ""
        }
        let baseurl = ImageUrl
        let output = ''
        if (type === 'ok') {
            let result = image_path.replaceAll("\\", "/");
            //console.log(`result`, result)
            output = baseurl + result
            return output
        }

    }

    test_opt = () => {
        try {
            urlSocket.post('/test_opt', { 'id': batch_id, },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    // console.log('update_status', data)
                })
                .catch((error) => {
                    console.log(error)
                })
        }
        catch (error) {
            console.log("----", error)
        }
    }

    goBack = () => {
        this.test_opt()
        // console.log('batch_id for backend', batch_id)
        // console.log('ngcount for the backend', ng_count)
        // console.log('okcount for the backend', ok_count)
        // console.log('pscount for the backend', ps_match)
        // console.log('totalcount from the userinterface', t_count)
        try {
            urlSocket.post('/update_batch', { 'id': batch_id, 'ok_count': ok_count, 'ng_count': ng_count, 'ps_count': ps_match, 'total': t_count, 'today_total': old_total, 'station_name': this.state.station_name, 'station_id': this.state.station_id },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    // console.log('update_status', data)
                })
                .catch((error) => {
                    console.log(error)
                })
        }
        catch (error) {
            console.log("----", error)
        }
        clearInterval(this.state.intervalId)
        this.setState({ show: false, msg: false })
        ng_count = 0
        ok_count = 0
        ps_match = 0
        t_count = 0
        // sessionStorage.setItem('showSidebar', false)
        this.props.history.push('/crudcomponent')

    }

    // Converting the 24hrs time format into the 12 hrs time format

    convertTo12HourFormat(time) {
        const [hours, minutes, seconds] = time.split(':');
        const parsedHours = parseInt(hours, 10);
        const amPm = parsedHours >= 12 ? 'PM' : 'AM';
        const hour12 = parsedHours === 0 ? 12 : parsedHours > 12 ? parsedHours - 12 : parsedHours;

        return `${hour12}:${minutes}:${seconds} ${amPm}`;
    }

    table_show = (component, index) => {
        console.log('today_detais1232354345560', component, this.table)

        try {
            urlSocket.post('/update_current_details', { 'id': batch_id },
                { mode: 'no-cors' })
                .then((response) => {
                    let req_data = response.data
                    console.log('update_status654321', req_data)
                    // this.setState({ session_detail: true,manage_details:req_data})
                    try {
                        urlSocket.post('/session_details', { "comp_name": component.comp_name, "comp_code": component.comp_code },
                            { mode: 'no-cors' })
                            .then((response) => {
                                const currentDate = new Date();
                                const req_data = response.data.map(item => {
                                    // calculating the Duration with the help of start time and end time from the backend


                                    const startTime = new Date(`${currentDate.toISOString().substr(0, 10)}T${item.sorted_start_time}`);
                                    const endTime = new Date(`${currentDate.toISOString().substr(0, 10)}T${item.sorted_end_time}`);
                                    const durationInSeconds = (endTime - startTime) / 1000;

                                    const hours = String(Math.floor(durationInSeconds / 3600)).padStart(2, '0');
                                    const minutes = String(Math.floor((durationInSeconds % 3600) / 60)).padStart(2, '0');
                                    const seconds = String(Math.floor(durationInSeconds % 60)).padStart(2, '0');

                                    const convertedStartTime = this.convertTo12HourFormat(item.sorted_start_time);
                                    const convertedEndTime = this.convertTo12HourFormat(item.sorted_end_time);

                                    item.duration = `${hours}:${minutes}:${seconds}`;
                                    item.start_time = convertedStartTime;
                                    item.end_time = convertedEndTime;
                                    return item;
                                });
                                // this.setState({ manage_details:req_data, session_detail: true})

                                this.setState({ manage_details: req_data })

                                this.state.compNo === index ?
                                    this.state.session_detail ? this.setState({ session_detail: false }) : this.setState({ session_detail: true })
                                    : this.setState({ session_detail: true })

                                this.setState({ compNo: index })

                            })
                            .catch((error) => {
                                console.log(error)
                            })
                    }
                    catch (error) {
                        console.log("----", error)
                    }

                })
                .catch((error) => {
                    console.log(error)
                })
        }
        catch (error) {
            console.log("----", error)
        }

    }

    formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }


    removeBodyCss = () => {
        document.body.classList.add("no_padding")
    }

    tog_xlarge = () => {
        // const{manage_details}=this.state
        const value = this.state.manage_details
        console.log('tog large called')
        try {
            console.log('today_detais')
            urlSocket.post('/today_detail', { 'id': batch_id },
                { mode: 'no-cors' })
                .then((response) => {
                    let comp_info = response.data["comp_info"]
                    let session_info = response.data["session_info"]
                    // let filteredSessions = comp_info.map(comp => {
                    //     return {
                    //         comp_name: comp.comp_name,
                    //         comp_code: comp.comp_code,
                    //         date: comp.date,
                    //         sessions: session_info.filter(session =>
                    //             session.comp_name === comp.comp_name &&
                    //             session.comp_code === comp.comp_code &&
                    //             session.date === comp.date
                    //         ).map(session => ({
                    //             ...session,
                    //             total_duration: this.formatDuration(
                    //                 new Date(session.sorted_end_time) - new Date(session.sorted_start_time)
                    //             )
                    //         }))
                    //     };
                    // });
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

                        const totalDurationMillis = sessionsForComponent.reduce((total, session) => {
                            console.log('total >>> ', total)
                            console.log('session >>> ', session)
                            console.log('new Date(session.sorted_end_time) ', new Date(session.sorted_end_time))
                            // const sessionDuration = new Date(session.sorted_end_time) - new Date(session.sorted_start_time);
                            const startTime = new Date(`${currentDate.toISOString().substr(0, 10)}T${session.sorted_start_time}`);
                            const endTime = new Date(`${currentDate.toISOString().substr(0, 10)}T${session.sorted_end_time}`);
                            const durationInSeconds = (endTime - startTime) / 1000;
                            totalDurationInSeconds += durationInSeconds;
                            totalNoOfSession += 1;

                            const hours = String(Math.floor(durationInSeconds / 3600)).padStart(2, '0');
                            const minutes = String(Math.floor((durationInSeconds % 3600) / 60)).padStart(2, '0');
                            const seconds = String(Math.floor(durationInSeconds % 60)).padStart(2, '0');

                            const convertedStartTime = this.convertTo12HourFormat(session.sorted_start_time);
                            const convertedEndTime = this.convertTo12HourFormat(session.sorted_end_time);

                            session.duration = `${hours}:${minutes}:${seconds}`;
                            session.sorted_start_time = convertedStartTime;
                            session.sorted_end_time = convertedEndTime;

                            // console.log('sessionDuration', sessionDuration)
                            return session;
                        }, 0);

                        const totalHours = String(Math.floor(totalDurationInSeconds / 3600)).padStart(2, '0');
                        const totalMinutes = String(Math.floor((totalDurationInSeconds % 3600) / 60)).padStart(2, '0');
                        const totalSeconds = String(Math.floor(totalDurationInSeconds % 60)).padStart(2, '0');

                        const totalDuration2 = `${totalHours}:${totalMinutes}:${totalSeconds}`;
                        const NoOfSession = totalNoOfSession;
                        // console.log('totalDurationMillis >>> ', totalDurationMillis)
                        console.log('totalDuration2 >>> ', totalDuration2)
                        // comp.total_duration = this.formatDuration(totalDurationMillis);
                        comp.total_duration = totalDuration2;
                        comp.session_count = NoOfSession;
                    });
                    console.log("total_duration", comp_info)
                    this.setState({ report_data: comp_info })
                })
                .catch((error) => {
                    console.log(error)
                })

            // If Time Sheet tab choosed in Details, call timeSheet()
            if (this.state.activeTab == 2) {
                this.timeSheet();
            }
        } catch (error) {
            console.log("----", error)
        }
        this.setState(prevState => ({
            modal_xlarge: !prevState.modal_xlarge,
        }))
        this.removeBodyCss()
    }

    handleCancel = () => {
        this.setState({ modal_xlarge: false });
    };


    // for nav-bar tab  functionality in the inspection page
    toggle = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab,
            })
        }
    }

    // For the Api call for the time function
    timeSheet = () => {
        console.log('timesheet function is called')
        try {
            console.log('timesheet works')
            urlSocket.post('/time_sheet', { 'id': batch_id },
                { mode: 'no-cors' })
                .then((response) => {
                    const currentDate = new Date();
                    console.log('response.data >>> ', response.data)
                    let totalDurationInSeconds = 0, totalTotal = 0, totalOk = 0, totalNG = 0, totalNoObj = 0, totalincorrect = 0;
                    let time_data = response.data.map(item => {
                        // calculating the Duration with the help of start time and end time from the backend

                        const startTime = new Date(`${currentDate.toISOString().substr(0, 10)}T${item.start_time}`);
                        const endTime = new Date(`${currentDate.toISOString().substr(0, 10)}T${item.end_time}`);
                        const durationInSeconds = (endTime - startTime) / 1000;
                        totalDurationInSeconds += durationInSeconds;
                        totalTotal += item.total;
                        totalOk += item.ok;
                        totalNG += item.notok;
                        totalNoObj += item.no_obj;
                        totalincorrect += item.incorrect_obj;

                        const hours = String(Math.floor(durationInSeconds / 3600)).padStart(2, '0');
                        const minutes = String(Math.floor((durationInSeconds % 3600) / 60)).padStart(2, '0');
                        const seconds = String(Math.floor(durationInSeconds % 60)).padStart(2, '0');

                        const convertedStartTime = this.convertTo12HourFormat(item.start_time);
                        const convertedEndTime = this.convertTo12HourFormat(item.end_time);

                        item.duration = `${hours}:${minutes}:${seconds}`;
                        item.start_time = convertedStartTime;
                        item.end_time = convertedEndTime;
                        return item;
                    });
                    const totalHours = String(Math.floor(totalDurationInSeconds / 3600)).padStart(2, '0');
                    const totalMinutes = String(Math.floor((totalDurationInSeconds % 3600) / 60)).padStart(2, '0');
                    const totalSeconds = String(Math.floor(totalDurationInSeconds % 60)).padStart(2, '0');

                    const totalDuration1 = `${totalHours}:${totalMinutes}:${totalSeconds}`;
                    console.log("timeshet backend works", time_data, totalDuration1)

                    this.setState({ time_sheet: time_data, total_sn_tmsht: time_data.length, totalDuration1, totalOk, totalNG, totalNoObj, totalincorrect, totalTotal, })
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }

    barcodeInfo = (comp_id, inspection_type, comp_inf) => {

        if (comp_inf.qrbar_check === true) {
            if (inspection_type === 'Manual') {
                this.setState({
                    qrbar: true,
                    qrbar_start_btn: true,
                    // qrbar_msg_show: true,
                    // qrbar_msg: 'Place QR/Barcode near Camera',

                    barcode_data: comp_inf.qrOrBar_code
                });
            } else {
                this.setState({
                    qrbar: true,
                    qrbar_countdown_active: true,
                    qrbar_capture_duration: 5,
                    qrbar_pause_resume: true,

                    barcode_data: comp_inf.qrOrBar_code
                })
            }
        } else {
            this.setState({ barcode_data: null })
            if (inspection_type === 'Manual') {
                this.cont_apiCall()
            } else {
                setTimeout(() => { this.appCall() }, 2000)
            }
        }

        // try {
        //     urlSocket.post('/barcode_info', { comp_id },
        //         { mode: 'no-cors' })
        //         .then((response) => {
        //             let data = response.data;
        //             console.log('barcodeInfo', data)
        //             this.setState({ barcode_data: data });

        //             if (inspection_type === 'Manual') {
        //                 if (data === null || data === undefined) {
        //                     this.cont_apiCall()
        //                 } else {
        //                     this.setState({
        //                         qrbar: true,
        //                         qrbar_start_btn: true,
        //                         // qrbar_msg_show: true,
        //                         // qrbar_msg: 'Place QR/Barcode near Camera'
        //                     })
        //                 }
        //             }
        //             else {
        //                 if (this.state.startCapture) {
        //                     if (data === null || data === undefined) {
        //                         setTimeout(() => { this.appCall() }, 2000)
        //                     } else {
        //                         this.setState({
        //                             qrbar: true,
        //                             qrbar_countdown_active: true,
        //                             qrbar_capture_duration: 5
        //                         })
        //                     }
        //                 }
        //             }


        //             return data;
        //         })
        // } catch (error) {
        //     console.log('error', error);
        //     return null
        // }
    }

    find_qrbarcode = async () => {
        const { compData, inspection_type } = this.state;
        this.setState({
            // qrbar_start_btn: false,
            // // qrbar_msg_show: false,
            showstatus: true,
            res_message: 'Detecting Barcode',

            qrbar_found: 0,
            qrbar_result: 0,
            comp_found: 0,
            comp_result: 0,

            showresult: false
        });

        if (inspection_type === 'Manual') {
            this.setState({ qrbar_start_btn: false })
        } else {
            this.setState({ qrbar_countdown_active: false })
        }

        // Wait for 1 second using a promise
        await new Promise(resolve => setTimeout(resolve, 1500));

        const imageSrc = await this.webcamRef.current.captureZoomedImage();
        // const imageSrc = this.webcam.getScreenshot({ width: DEFAULT_RESOLUTION.width, height: DEFAULT_RESOLUTION.height });
        const blob = await fetch(imageSrc).then((res) => res.blob());
        const formData = new FormData();
        let component_code = component_code1
        let component_name = component_name1

        let today = new Date();
        let yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0!
        let dd = today.getDate();
        let _today = dd + '/' + mm + '/' + yyyy
        let test_date = yyyy + '-' + mm + '-' + dd
        let hours = today.getHours()
        let min = today.getMinutes()
        let secc = today.getSeconds()
        let time = hours + ':' + min + ':' + secc
        let milliseconds = hours + ':' + min + ':' + secc + '.' + today.getMilliseconds().toString().padStart(3, '0').slice(0, 5);
        let replace = _today + '_' + time.replaceAll(":", "_");

        let compdata = component_name + "_" + component_code + '_' + replace

        formData.append('comp_id', compData._id);
        formData.append('datasets', blob, compdata + '.png')
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
                this.setState({
                    res_message: code_data,
                    qrbar_found: 2
                });
                setTimeout(() => {
                    // this.setState({
                    //     showstatus: '',
                    //     res_message: '',
                    //     // show: true,
                    //     qrbar_result: 2
                    // });
                    // if (this.state.inspection_type === 'Manual') {
                    //     this.setState({ show: true })
                    // } else {
                    //     this.setState({ isCountdownActive: true })
                    // }
                    this.setState({
                        showstatus: '',
                        res_message: '',
                        qrbar_result: 2,
                        show: inspection_type === 'Manual' ? true : undefined,
                        isCountdownActive: inspection_type !== 'Manual' ? true : undefined,
                        showdata: inspection_type !== 'Manual' ? true : undefined
                    })
                }, 1000);
            } else if (code_data === 'Barcode is incorrect') {
                console.log('data2291 ', this.state.qrbar_check_type)
                if ((this.state.qrbar_check_type === null) || (this.state.qrbar_check_type === undefined) || (parseInt(this.state.qrbar_check_type) === 1)) {
                    console.log('data2291 first if OR')
                    this.setState({
                        res_message: code_data,
                        qrbar_found: 2,
                        // qrbar_start_btn: inspection_type === 'Manual' ? true : undefined,
                        // qrbar_countdown_active: inspection_type !== 'Manual' ? true : undefined,
                    });

                    setTimeout(() => {
                        this.setState({
                            showstatus: '',
                            res_message: '',
                            qrbar_result: 1,
                            show: inspection_type === 'Manual' ? true : undefined,
                            isCountdownActive: inspection_type !== 'Manual' ? true : undefined,
                            showdata: inspection_type !== 'Manual' ? true : undefined
                        });
                    }, 1000);
                } else if (parseInt(this.state.qrbar_check_type) === 0) {
                    console.log('data2291 second elif ')
                    this.setState({
                        res_message: code_data,
                        qrbar_found: 2,
                        qrbar_result: 1,
                        qrbar_start_btn: inspection_type === 'Manual' ? true : false, // Ensure we don't overwrite qrbar_start_btn if not Manual
                        qrbar_countdown_active: inspection_type !== 'Manual' // Set to true if inspection_type is not Manual
                    })
                }
                // this.setState({
                //     res_message: code_data,
                //     // qrbar_start_btn: true,
                //     qrbar_found: 2
                // });
                // if(this.state.inspection_type === 'Manual') {
                //     this.setState({qrbar_start_btn: true})
                // } else {
                //     this.setState({qrbar_countdown_active: true})
                // }

                // Initial state update with conditional logic for qrbar_start_btn or qrbar_countdown_active




            } else if (code_data === 'Unable to read Barcode') {
                // this.setState({
                //     res_message: code_data,
                //     // qrbar_start_btn: true,
                //     qrbar_found: 1,
                // });
                // if (this.state.inspection_type === 'Manual') {
                //     this.setState({ qrbar_start_btn: true })
                // } else {
                //     this.setState({ qrbar_countdown_active: true })
                // };

                this.setState({
                    res_message: code_data,
                    // qrbar_start_btn: true, 
                    qrbar_found: 1,
                    qrbar_start_btn: inspection_type === 'Manual' ? true : false, // Ensure we don't overwrite qrbar_start_btn if not Manual
                    qrbar_countdown_active: inspection_type !== 'Manual' // Set to true if inspection_type is not Manual
                });
            }
        } catch (error) {
            console.log(error)
        }
    }

    showRefOutline = async (comp_data) => {
        console.log('data152 ', comp_data);
        try {
            const response = await urlSocket.post('/check_outline', {
                'comp_id': comp_data._id,
            }, { mode: 'no-cors' });
            let getInfo = response.data;
            console.log('data131 ', getInfo);
            if (getInfo.show == 'yes') {
                this.setState({
                    show_outline: true,
                    outline_checkbox: true,
                    _comp_info: getInfo.comp_info,
                    outline_path: getInfo.comp_info.datasets[0].white_path,
                })
            } else if (getInfo.show == 'any_pos') {
                this.setState({ capture_fixed_refimage: true })
            }
        } catch (error) {
            console.error(error);
        }
    }

    showOutline = () => {
        this.setState(prevState => ({
            show_outline: !prevState.show_outline
        }))
    }

    newOutlineChange = (ot_label) => {
        this.setState({ default_outline: ot_label })
        const { _comp_info } = this.state;
        if (ot_label === 'White Outline') {
            this.setState({ outline_path: _comp_info.datasets[0].white_path })
        }
        else if (ot_label === 'Red Outline') {
            this.setState({ outline_path: _comp_info.datasets[0].red_path })
        }
        else if (ot_label === 'Green Outline') {
            this.setState({ outline_path: _comp_info.datasets[0].green_path })
        }
        else if (ot_label === 'Blue Outline') {
            this.setState({ outline_path: _comp_info.datasets[0].blue_path })
        }
        else if (ot_label === 'Black Outline') {
            this.setState({ outline_path: _comp_info.datasets[0].black_path })
        }
        else if (ot_label === 'Orange Outline') {
            this.setState({ outline_path: _comp_info.datasets[0].orange_path })
        }
        else if (ot_label === 'Yellow Outline') {
            this.setState({ outline_path: _comp_info.datasets[0].yellow_path })
        }

    }

    render() {
        const videoConstraints = {
            width: DEFAULT_RESOLUTION.width,
            height: DEFAULT_RESOLUTION.height,
            facingMode: "user"
        };
        const override = css`display: block; margin: 0 auto; border-color: red;`;
        const { showresult, response_message, resultKey, result_key, session_detail, report_data, manage_details, time_sheet, total_sn_tmsht, totalDuration1, station_name, totalOk, totalNG, totalNoObj, totalincorrect, totalTotal, rtdt_TD, isCountdownActive } = this.state;
        // console.log('session_detail >>> ', session_detail)

        return (
            <>
                {
                    this.state.is_loading_models ?
                        <FullScreenLoader />
                        : null
                }
                <MetaTags>
                    <title>Component Information</title>
                </MetaTags>
                <div className="page-content dis-scrl">
                    <Row className="mb-3">
                        <Col xs={9}>
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="mb-0 mt-2 m-2 font-size-14 fw-bold">
                                    INSPECTION PAGE
                                </div>
                            </div>
                        </Col>
                        <Col
                            xs={3}
                            className="d-flex align-items-center justify-content-end"
                        >
                            {this.state.inspection_type === "Manual" ?
                                <button
                                    className="btn btn-outline-primary btn-sm me-2"
                                    color="primary"
                                    onClick={() => this.tog_xlarge()}
                                    disabled={this.state.inspection_started}
                                >
                                    Details <i className="mdi mdi-file-document-outline"></i>
                                </button>
                                // <Button onClick={() => { this.tog_xlarge() }} >Details</Button>
                                : this.state.showDetail ?
                                    <button
                                        className="btn btn-outline-primary btn-sm me-2"
                                        color="primary"
                                        onClick={() => this.tog_xlarge()}
                                        disabled={this.state.inspection_started}
                                    >
                                        Details <i className="mdi mdi-file-document-outline"></i>
                                    </button>
                                    : null}
                            <button
                                className="btn btn-outline-primary btn-sm me-2"
                                color="primary"
                                onClick={() => this.goBack()}
                                disabled={this.state.inspection_started}
                            >
                                Back <i className="mdi mdi-arrow-left"></i>
                            </button>
                        </Col>
                    </Row>
                    <Container fluid>
                        <Card>
                            <CardBody>
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 flex-wrap">

                                    {/* LEFT SIDE — Component Info */}
                                    <div className="d-flex flex-wrap gap-2 align-items-center">
                                        <div className="px-3 py-1 bg-primary text-white rounded-pill d-flex align-items-center">
                                            <span className="fw-bold me-1">Component Name:</span>
                                            <span>{this.state.component_name}</span>
                                        </div>

                                        <div className="px-3 py-1 bg-primary text-white rounded-pill d-flex align-items-center">
                                            <span className="fw-bold me-1">Component Code:</span>
                                            <span>{this.state.component_code}</span>
                                        </div>
                                    </div>

                                    {/* RIGHT SIDE — Outline Options */}
                                    {this.state.outline_checkbox && (
                                        <div className="d-flex flex-column flex-sm-row align-items-start gap-3 border">

                                            {/* Outline Color Picker */}
                                            {this.state.show_outline && (
                                                <div className="d-flex align-items-center flex-wrap gap-2 p-1 my-auto">
                                                    <Label className="mb-0 fw-bold">Outline Color:</Label>
                                                    <div className="d-flex flex-wrap gap-2">
                                                        {this.state.outline_colors.map((otline, otl_id) => (
                                                            <Button
                                                                key={otl_id}
                                                                className="border-0"
                                                                style={{
                                                                    width: '24px',
                                                                    height: '24px',
                                                                    borderRadius: '50%',
                                                                    backgroundColor:
                                                                        otline === "White Outline" ? '#f9f9f9' ://rani changes start
                                                                            otline === "Red Outline" ? 'red' :
                                                                                otline === "Green Outline" ? 'green' :
                                                                                    otline === "Blue Outline" ? 'blue' :
                                                                                        otline === "Black Outline" ? 'black' :
                                                                                            otline === "Orange Outline" ? 'orange' :
                                                                                                otline === "Yellow Outline" ? 'yellow' : 'gray',
                                                                    // boxShadow: this.state.default_outline === otline ? '0 0 5px 2px rgba(0,0,0,0.5)' : 'none',
                                                                    // border: otline === "White Outline" ? '1px solid #ccc' : 'none'
                                                                    //---rani changes start---
                                                                    boxShadow:
                                                                        otline === "White Outline"
                                                                            ? this.state.default_outline === otline
                                                                                ? '0 0 5px 2px rgba(0, 0, 0, 0.3)' // highlight white when selected
                                                                                : 'inset 0 0 0 1px #ccc, 0 0 5px rgba(0,0,0,0.05)' // normal white box
                                                                            : this.state.default_outline === otline
                                                                                ? '0 0 5px 2px rgba(0,0,0,0.5)' // highlight other colors
                                                                                : 'none',

                                                                    border: otline === "White Outline" ? '1px solid #999' : 'none',
                                                                    //---rani changes end---
                                                                }}
                                                                onClick={() => this.newOutlineChange(otline)}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Show Outline Toggle */}
                                            <div className="p-2 border rounded bg-light d-flex align-items-center">
                                                <FormGroup check className="mb-0">
                                                    <Label check className="d-flex align-items-center mb-0">
                                                        <Input
                                                            type="checkbox"
                                                            checked={this.state.show_outline}
                                                            onChange={() => this.showOutline()}
                                                            className="me-2"
                                                        />
                                                        <span className="fw-bold" style={{ userSelect: "none" }}>Show Outline</span>
                                                    </Label>
                                                </FormGroup>
                                            </div>

                                        </div>
                                    )}


                                </div>



                                {
                                    this.state.qrbar &&
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
                                                                {
                                                                    this.state.compData.detect_selection &&
                                                                    <td>Presence</td>
                                                                }

                                                                <td>Check</td>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>
                                                                    {
                                                                        this.state.qrbar_found === 0 ?
                                                                            <ExclamationCircleOutlined className={`${this.state.qrbar_found === 0 && 'zoom-in'}`} style={{ color: 'deepskyblue', fontSize: '1.5rem' }} /> :
                                                                            this.state.qrbar_found === 1 ?
                                                                                <CloseCircleOutlined className={`${this.state.qrbar_found === 1 && 'zoom-in'}`} style={{ color: 'red', fontSize: '1.5rem' }} /> :
                                                                                this.state.qrbar_found === 2 &&
                                                                                <CheckCircleOutlined className={`${this.state.qrbar_found === 2 && 'zoom-in'}`} style={{ color: 'green', fontSize: '1.5rem' }} />
                                                                    }
                                                                </td>
                                                                <td>
                                                                    {
                                                                        this.state.qrbar_result === 0 ?
                                                                            <ExclamationCircleOutlined className={`${this.state.qrbar_result === 0 && 'zoom-in'}`} style={{ color: 'deepskyblue', fontSize: '1.5rem' }} /> :
                                                                            this.state.qrbar_result === 1 ?
                                                                                <CloseCircleOutlined className={`${this.state.qrbar_result === 1 && 'zoom-in'}`} style={{ color: 'red', fontSize: '1.5rem' }} /> :
                                                                                this.state.qrbar_result === 2 &&
                                                                                <CheckCircleOutlined className={`${this.state.qrbar_result === 2 && 'zoom-in'}`} style={{ color: 'green', fontSize: '1.5rem' }} />
                                                                    }
                                                                </td>
                                                                {
                                                                    this.state.compData.detect_selection &&
                                                                    <td>
                                                                        {
                                                                            this.state.comp_found === 0 ?
                                                                                <ExclamationCircleOutlined className={`${this.state.comp_found === 0 && 'zoom-in'}`} style={{ color: 'deepskyblue', fontSize: '1.5rem' }} /> :
                                                                                this.state.comp_found === 1 ?
                                                                                    <CloseCircleOutlined className={`${this.state.comp_found === 1 && 'zoom-in'}`} style={{ color: 'red', fontSize: '1.5rem' }} /> :
                                                                                    this.state.comp_found === 2 &&
                                                                                    <CheckCircleOutlined className={`${this.state.comp_found === 2 && 'zoom-in'}`} style={{ color: 'green', fontSize: '1.5rem' }} />
                                                                        }
                                                                    </td>
                                                                }

                                                                <td>
                                                                    {
                                                                        this.state.comp_result === 0 ?
                                                                            <ExclamationCircleOutlined className={`${this.state.comp_result === 0 && 'zoom-in'}`} style={{ color: 'deepskyblue', fontSize: '1.5rem' }} /> :
                                                                            this.state.comp_result === 1 ?
                                                                                <CloseCircleOutlined className={`${this.state.comp_result === 1 && 'zoom-in'}`} style={{ color: 'red', fontSize: '1.5rem' }} /> :
                                                                                this.state.comp_result === 2 &&
                                                                                <CheckCircleOutlined className={`${this.state.comp_result === 2 && 'zoom-in'}`} style={{ color: 'green', fontSize: '1.5rem' }} />
                                                                    }
                                                                </td>
                                                            </tr>
                                                            {/* You can add more rows here */}
                                                        </tbody>
                                                    </Table>
                                                    {/* <h5 className="">
                                                Barcode Found:
                                                {
                                                    this.state.qrbar_found === 0 ?
                                                        <ExclamationCircleOutlined className={`ms-3 ${this.state.qrbar_found === 0 && 'zoom-in'}`} style={{ color: 'deepskyblue', fontSize: '1.5rem' }} /> :
                                                        this.state.qrbar_found === 1 ?
                                                            <CloseCircleOutlined className={`ms-3 ${this.state.qrbar_found === 1 && 'zoom-in'}`} style={{ color: 'red', fontSize: '1.5rem' }} /> :
                                                            this.state.qrbar_found === 2 &&
                                                            <CheckCircleOutlined className={`ms-3 ${this.state.qrbar_found === 2 && 'zoom-in'}`} style={{ color: 'green', fontSize: '1.5rem' }} />
                                                }
                                                <span className='ms-3'></span>
                                                Barcode Result:
                                                {
                                                    this.state.qrbar_result === 0 ?
                                                        <ExclamationCircleOutlined className={`ms-3 ${this.state.qrbar_result === 0 && 'zoom-in'}`} style={{ color: 'deepskyblue', fontSize: '1.5rem' }} /> :
                                                        this.state.qrbar_result === 1 ?
                                                            <CloseCircleOutlined className={`ms-3 ${this.state.qrbar_result === 1 && 'zoom-in'}`} style={{ color: 'red', fontSize: '1.5rem' }} /> :
                                                            this.state.qrbar_result === 2 &&
                                                            <CheckCircleOutlined className={`ms-3 ${this.state.qrbar_result === 2 && 'zoom-in'}`} style={{ color: 'green', fontSize: '1.5rem' }} />
                                                }
                                                <span className='ms-3'></span>
                                                Component Found:
                                                {
                                                    this.state.comp_found === 0 ?
                                                        <ExclamationCircleOutlined className={`ms-3 ${this.state.comp_found === 0 && 'zoom-in'}`} style={{ color: 'deepskyblue', fontSize: '1.5rem' }} /> :
                                                        this.state.comp_found === 1 ?
                                                            <CloseCircleOutlined className={`ms-3 ${this.state.comp_found === 1 && 'zoom-in'}`} style={{ color: 'red', fontSize: '1.5rem' }} /> :
                                                            this.state.comp_found === 2 &&
                                                            <CheckCircleOutlined className={`ms-3 ${this.state.comp_found === 2 && 'zoom-in'}`} style={{ color: 'green', fontSize: '1.5rem' }} />
                                                }
                                                <span className='ms-3'></span>
                                                Component Result:
                                                {
                                                    this.state.comp_result === 0 ?
                                                        <ExclamationCircleOutlined className={`ms-3 ${this.state.comp_result === 0 && 'zoom-in'}`} style={{ color: 'deepskyblue', fontSize: '1.5rem' }} /> :
                                                        this.state.comp_result === 1 ?
                                                            <CloseCircleOutlined className={`ms-3 ${this.state.comp_result === 1 && 'zoom-in'}`} style={{ color: 'red', fontSize: '1.5rem' }} /> :
                                                            this.state.comp_result === 2 &&
                                                            <CheckCircleOutlined className={`ms-3 ${this.state.comp_result === 2 && 'zoom-in'}`} style={{ color: 'green', fontSize: '1.5rem' }} />
                                                }
                                            </h5> */}
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    </Row>
                                }

                                <Row>
                                    <Col lg={6} md={6} xs={6}>
                                        <Card style={{ height: '100%' }}>
                                            <CardBody>
                                                <CardTitle className="mb-4">Reference Component</CardTitle>
                                                {/* <div>
                                            <Row>
                                                {
                                                    this.state.datasets.map((data, index) => (
                                                        this.getImage(data.image_path, data.type) !== "" &&
                                                        index === 0 && <Col
                                                            key={index}>
                                                            <img style={{ height: 'auto', width: '100%', borderRadius: '2rem' }} src={this.getImage(data.image_path, data.type)} />
                                                        </Col>
                                                    ))
                                                }
                                            </Row>
                                        </div> */}
                                                <Row>
                                                    <Col lg={8} md={8} xs={8} className="mx-auto">
                                                        <Row>
                                                            {
                                                                this.state.datasets.map((data, index) => (
                                                                    this.getImage(data.image_path, data.type) !== "" &&
                                                                    index === 0 && <Col
                                                                        key={index}>
                                                                        <img style={{ height: 'auto', width: '100%', borderRadius: '2rem' }} src={this.getImage(data.image_path, data.type)} />
                                                                    </Col>
                                                                ))
                                                            }
                                                        </Row>
                                                    </Col>
                                                </Row>
                                                <Row className="tdCntStl">
                                                    <div className="table-responsive sdTblFntSz" style={{ paddingTop: '10px' }}>
                                                        {/* <Table className="table table-striped" style={{ borderRadius: '10px' }}> */}
                                                        <Table className="table" style={{
                                                            boxShadow: '0px 0px 5px 2px #495057'
                                                        }}>
                                                            <tbody>
                                                                <tr>
                                                                    <td></td>
                                                                    <td style={{ fontWeight: 'bold' }}>Total</td>
                                                                    <td style={{ fontWeight: 'bold', color: 'green' }} >{this.state.config_positive}</td>
                                                                    <td style={{ fontWeight: 'bold', color: 'red' }}>{this.state.config_negative}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td style={{ fontWeight: 'bold' }}>Current Session</td>
                                                                    <td style={{ fontWeight: 'bold' }}>{t_count}</td>
                                                                    <td style={{ fontWeight: 'bold', color: 'darkgreen' }}>{ok_count}</td>
                                                                    <td style={{ fontWeight: 'bold', color: 'darkred' }}>{ng_count}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td style={{ fontWeight: 'bold' }}>Today</td>
                                                                    <td style={{ fontWeight: 'bold' }}>{old_total}</td>
                                                                    <td style={{ fontWeight: 'bold', color: 'darkgreen' }}>{old_ok}</td>
                                                                    <td style={{ fontWeight: 'bold', color: 'darkred' }}>{old_ng}</td>
                                                                </tr>
                                                            </tbody>
                                                        </Table>
                                                    </div>
                                                </Row>
                                            </CardBody>
                                        </Card>

                                    </Col>
                                    <Col lg={6} md={6} xs={6}>
                                        <Card style={{ height: '100%' }}>
                                            <CardBody>
                                                {/* <CardTitle className="mb-4">Inspection</CardTitle> */}
                                                <CardTitle className="mb-4 d-flex justify-content-between">
                                                    <p className="my-auto">Inspection</p>
                                                    {
                                                        this.state.showdata || this.state.qrbar_pause_resume ?
                                                            this.state.resume ?
                                                                <button
                                                                    className="btn btn-outline-secondary btn-sm me-2"
                                                                    color="secondary"
                                                                    onClick={() => this.resumeCountdown()}
                                                                >
                                                                    Resume <i className="mdi mdi-play"></i>
                                                                </button> :
                                                                <button
                                                                    className="btn btn-outline-secondary btn-sm me-2"
                                                                    color="secondary"
                                                                    onClick={() => this.pauseCountdown()}
                                                                >
                                                                    Pause <i className="mdi mdi-pause"></i>
                                                                </button>
                                                            : null
                                                    }

                                                </CardTitle>
                                                {
                                                    this.state.cameraDisconnected ?
                                                        <div className='my-2' style={{ outline: '2px solid #000', padding: '10px', borderRadius: '5px', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                                                            <div className='d-flex flex-column justify-content-center align-items-center webcam-disconnected' style={{ width: '100%' }}>
                                                                <h5 style={{ fontWeight: 'bold' }}>Webcam Disconnected</h5>
                                                                <Spinner className='mt-2' color="primary" />
                                                                <h6 className='mt-2' style={{ fontWeight: 'bold' }}>Please check your webcam connection....</h6>
                                                            </div>
                                                        </div>
                                                        :
                                                        <div className="containerImg" style={{ position: 'relative' }}>
                                                            <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
                                                                {
                                                                    this.state.show_outline &&
                                                                        this.state.outline_path ?
                                                                        <img
                                                                            style={{
                                                                                width: '100%',
                                                                                position: 'absolute',
                                                                                height: 'auto'
                                                                            }}
                                                                            src={`${ImageUrl + this.state.outline_path}?${Date.now()}`}
                                                                        // src={`${ImageUrl + this.state._comp_info.datasets[0].white_path}?${Date.now()}`}
                                                                        ></img>
                                                                        : null
                                                                }
                                                                <WebcamCapture
                                                                    ref={this.webcamRef}
                                                                    resolution={DEFAULT_RESOLUTION}
                                                                    zoom={this.state.zoom_value?.zoom}
                                                                    center={this.state.zoom_value?.center}
                                                                    style={this.state.showresult ? {
                                                                        border:
                                                                            response_message === "No Objects Detected"
                                                                                ? ''
                                                                                : response_message === this.state.config_positive
                                                                                    ? '10px solid lightgreen'
                                                                                    : response_message === this.state.config_negative
                                                                                        ? '10px solid red'
                                                                                        : response_message === this.state.config_posble_match
                                                                                            ? '10px solid orange'
                                                                                            : null,
                                                                        borderRadius: '2rem',
                                                                    } : {
                                                                        borderRadius: '2rem'
                                                                    }}
                                                                />
                                                                {/* <Webcam
                                                                    videoConstraints={videoConstraints}
                                                                    audio={false}
                                                                    height={'100%'}
                                                                    screenshotFormat="image/png"
                                                                    width={'100%'}
                                                                    ref={node => this.webcam = node}
                                                                    style={this.state.showresult ? {
                                                                        border:
                                                                            response_message === "No Objects Detected"
                                                                                ? ''
                                                                                : response_message === this.state.config_positive
                                                                                    ? '10px solid lightgreen'
                                                                                    : response_message === this.state.config_negative
                                                                                        ? '10px solid red'
                                                                                        : response_message === this.state.config_posble_match
                                                                                            ? '10px solid orange'
                                                                                            : null,
                                                                        borderRadius: '2rem',
                                                                    } : {
                                                                        borderRadius: '2rem'
                                                                    }}
                                                                /> */}
                                                                <canvas
                                                                    ref={this.canvasRef}
                                                                    width={640}
                                                                    height={480}
                                                                    style={{
                                                                        // display: (!(this.state.region_selection && this.state.output_Rect)) && 'none',
                                                                        position: 'absolute',
                                                                        top: 0,
                                                                        left: 0,
                                                                        width: '100%',
                                                                        height: 'auto',
                                                                    }}
                                                                />
                                                                {/* <Webcam
                                                    videoConstraints={videoConstraints}
                                                    audio={false}
                                                    height={'auto'}
                                                    screenshotFormat="image/png"
                                                    width={'100%'}
                                                    ref={node => this.webcam = node}
                                                /> */}
                                                            </div>
                                                            <div className="centered mt-5">
                                                                {/* {
                                                    this.state.showdata ?
                                                        <div style={{
                                                            color:
                                                                this.state.mssg === "Place the object" ? 'white' :
                                                                    null
                                                        }}>
                                                            {this.state.mssg}
                                                        </div> : null
                                                } */}
                                                                {
                                                                    this.state.showstatus ?
                                                                        <div
                                                                            className="fsz_resmsg"
                                                                            style={{
                                                                                color:
                                                                                    this.state.res_message === "Object Detected" ? 'lightgreen' :
                                                                                        this.state.res_message === "Qr Code Found" ? 'lightgreen' :
                                                                                            this.state.res_message === 'QR not found' ? 'red' :
                                                                                                this.state.res_message === 'Data Already Exists' ? 'red' :
                                                                                                    this.state.res_message === "No Object Found" ? 'yellow' :
                                                                                                        this.state.res_message === "Incorrect Object" ? 'orange' :
                                                                                                            this.state.res_message === "Checking ..." ? 'lightyellow' :
                                                                                                                this.state.res_message === "Detecting Barcode" ? 'white' :
                                                                                                                    this.state.res_message === "Barcode is correct" ? 'green' :
                                                                                                                        this.state.res_message === "Barcode is incorrect" ? 'red' :
                                                                                                                            this.state.res_message === "Unable to read Barcode" ? 'yellow' :
                                                                                                                                null,
                                                                            }}>
                                                                            {this.state.res_message}
                                                                        </div> : null
                                                                }
                                                                {
                                                                    this.state.qrbar_msg_show &&
                                                                    <div className="fsz_resmsg" style={{ color: 'white' }}>
                                                                        {this.state.qrbar_msg}
                                                                    </div>
                                                                }
                                                                {
                                                                    this.state.showresult ?
                                                                        <div
                                                                            className="resultMarginTop"
                                                                            style={{
                                                                                color:
                                                                                    this.state.response_message === "No Objects Detected" ? 'red' :
                                                                                        this.state.response_message === this.state.config_positive ? 'lightgreen' :
                                                                                            this.state.response_message === this.state.config_negative ? 'red' :
                                                                                                this.state.response_message === this.state.config_posble_match ? 'orange' :
                                                                                                    null
                                                                            }}>
                                                                            {/* <br /> */}
                                                                            {result_key === true &&
                                                                                <Label
                                                                                    className="fsz_resmsg"
                                                                                >{resultKey}{this.state.response_message}{" "}{this.state.response_value}</Label>
                                                                            }
                                                                        </div> : null
                                                                }
                                                                {
                                                                    this.state.showresult ?
                                                                        <div className="containerImg" >
                                                                            <div>
                                                                                {
                                                                                    this.state.response_message === this.state.config_positive &&
                                                                                    <div className="align-self-bottom">
                                                                                        <CheckCircleOutlined className="circsz" />
                                                                                    </div>
                                                                                }
                                                                            </div>
                                                                            {
                                                                                this.state.response_message === this.state.config_negative &&
                                                                                <div className="align-self-bottom">
                                                                                    <CloseCircleOutlined className="circsz" style={{ color: 'red', }} />
                                                                                </div>
                                                                            }
                                                                        </div> : null
                                                                }
                                                                {/* <div className="containerImg" >
                                                    <div>
                                                        {
                                                            this.state.showdata ?
                                                                <CountdownTimer backgroundColor="#f1f1f1" className="mt-2" hideDay={true} hideHours={true} count={this.state.capture_duration} onEnd={() => { this.onTimeupCourse() }} /> : null
                                                        }
                                                    </div>
                                                </div> */}

                                                            </div>

                                                            {showresult && (
                                                                <div
                                                                    className="shdwSize"
                                                                    style={{
                                                                        backgroundColor:
                                                                            response_message === "No Objects Detected"
                                                                                ? ''
                                                                                : response_message === this.state.config_positive
                                                                                    ? 'rgba(144, 238, 144, 0.18)' // Lightgreen
                                                                                    : response_message === this.state.config_negative
                                                                                        ? 'rgba(255, 0, 0, 0.18)' // Red
                                                                                        : response_message === this.state.config_posble_match
                                                                                            ? 'rgba(255, 165, 0, 0.18)' // Orange
                                                                                            : 'transparent', // transparent
                                                                    }}
                                                                >
                                                                </div>
                                                            )}
                                                            {this.state.showstatus && (
                                                                <div
                                                                    className="shdwSize"
                                                                    style={{
                                                                        backgroundColor:
                                                                            this.state.res_message === 'Barcode is correct'
                                                                                ? 'rgba(144, 238, 144, 0.18)' // Lightgreen
                                                                                : this.state.res_message === 'Barcode is incorrect'
                                                                                    ? 'rgba(255, 0, 0, 0.18)' // Red
                                                                                    : this.state.res_message === 'Unable to read Barcode'
                                                                                        ? 'transparent' // Orange
                                                                                        : 'transparent', // transparent
                                                                    }}
                                                                >
                                                                </div>
                                                            )}
                                                            {
                                                                // this.state.showdata ?
                                                                this.state.inspection_type !== "Manual" && this.state.isCountdownActive ?
                                                                    <div className="containerImg centered cntDwn_pos" >
                                                                        <div className="cntDwn" >
                                                                            <h3 className="cntDwn_txt"
                                                                            >
                                                                                {
                                                                                    <CountdownTimer backgroundColor="none" className="mt-2" hideDay={true} hideHours={true} count={this.state.capture_duration} onEnd={() => { this.onTimeupCourse() }} />
                                                                                }
                                                                            </h3>
                                                                        </div>
                                                                    </div>
                                                                    : null
                                                            }
                                                            {
                                                                // this.state.showdata ?
                                                                this.state.inspection_type !== "Manual" && this.state.qrbar_countdown_active ?
                                                                    <div className="containerImg centered cntDwn_pos" >
                                                                        <div className="cntDwn" >
                                                                            <h3 className="cntDwn_txt"
                                                                            >
                                                                                {
                                                                                    // <CountdownTimer backgroundColor="none" className="mt-2" hideDay={true} hideHours={true} count={this.state.qrbar_capture_duration} onEnd={() => { this.find_qrbarcode() }} />
                                                                                    <CountdownTimer backgroundColor="none" className="mt-2" hideDay={true} hideHours={true} count={this.state.capture_duration} onEnd={() => { this.find_qrbarcode() }} />
                                                                                }
                                                                            </h3>
                                                                        </div>
                                                                    </div>
                                                                    : null
                                                            }
                                                            {
                                                                this.state.showdata ?
                                                                    <div className="centered plobj-auto-size">
                                                                        <div
                                                                            className="plobj-auto"
                                                                            style={{
                                                                                boxShadow: '0px 0px 5px black',
                                                                                backgroundColor: 'white',
                                                                            }}>
                                                                            <h3
                                                                                className="plobj-auto-txt"
                                                                                style={{
                                                                                    color: 'black',
                                                                                    fontWeight: 'bold',
                                                                                    margin: '0px',
                                                                                }}
                                                                            >
                                                                                {this.state.placeobj_count > 0 ?
                                                                                    'Place the next object' :
                                                                                    'Place the object'
                                                                                }
                                                                            </h3>
                                                                        </div>
                                                                    </div>

                                                                    : null
                                                            }
                                                            {
                                                                this.state.qrbar_countdown_active ?
                                                                    <div className="centered plobj-auto-size">
                                                                        <div
                                                                            className="plobj-auto"
                                                                            style={{
                                                                                boxShadow: '0px 0px 5px black',
                                                                                backgroundColor: 'white',
                                                                            }}>
                                                                            <h3
                                                                                className="plobj-auto-txt"
                                                                                style={{
                                                                                    color: 'black',
                                                                                    fontWeight: 'bold',
                                                                                    margin: '0px',
                                                                                }}
                                                                            >
                                                                                Place QR/Barcode
                                                                                {/* {this.state.placeobj_count > 0 ?
                                                                    'Place the next object' :
                                                                    'Place the object'
                                                                } */}
                                                                            </h3>
                                                                        </div>
                                                                    </div>

                                                                    : null
                                                            }

                                                            {/* <Webcam
                                                videoConstraints={videoConstraints}
                                                audio={false}
                                                height={'100%'}
                                                screenshotFormat="image/png"
                                                width={'100%'}
                                                ref={node => this.webcam = node}
                                                style={this.state.showresult ? {
                                                    border:
                                                        response_message === "No Objects Detected"
                                                            ? ''
                                                            : response_message === this.state.config_positive
                                                                ? '10px solid lightgreen'
                                                                : response_message === this.state.config_negative
                                                                    ? '10px solid red'
                                                                    : response_message === this.state.config_posble_match
                                                                        ? '10px solid orange'
                                                                        : null,
                                                    borderRadius: '2rem',
                                                } : {
                                                    borderRadius: '2rem'
                                                }}
                                            /> */}
                                                            {/* <div style={{
                                                position: 'absolute',
                                                zIndex: '10',

                                            }}>
                                                {
                                                    this.state.showdata ?
                                                        this.state.resume ? <Button
                                                            onClick={() => this.resumeCountdown()}>
                                                            Resume
                                                        </Button> : <Button
                                                            onClick={() => this.pauseCountdown()}
                                                        >
                                                            Pause
                                                        </Button>
                                                        : null
                                                }
                                            </div> */}
                                                            {/* {
                                                this.state.showdata ?
                                                    this.state.resume ? <Button
                                                        onClick={() => this.resumeCountdown()}>
                                                        Resume
                                                    </Button> : <Button
                                                        onClick={() => this.pauseCountdown()}
                                                    >
                                                        Pause
                                                    </Button>
                                                    : null
                                            } */}

                                                            {
                                                                this.state.inspection_type === "Manual" && this.state.qrbar_start_btn ?
                                                                    // this.state.inspection_type === "Manual" && this.state.showplaceobject ?
                                                                    <div className="centered obj_style">
                                                                        <div
                                                                            className="obj_style_pdg"
                                                                            style={{
                                                                                boxShadow: '0px 0px 5px black',
                                                                                borderRadius: '1rem',
                                                                                padding: '10px',
                                                                                // padding: '1rem',
                                                                                backgroundColor: 'white',
                                                                                display: 'flex',
                                                                                justifyContent: 'center',
                                                                                alignItems: 'center',
                                                                            }}>
                                                                            <h3
                                                                                className="stl_plobj_txt"
                                                                                style={{
                                                                                    color: 'black',
                                                                                    fontWeight: 'bold',
                                                                                }}>
                                                                                <div>Place QR/Barcode and</div>
                                                                                <div>
                                                                                    press {
                                                                                        this.state.inspection_type === "Manual" && this.state.qrbar_start_btn ?
                                                                                            (this.state.qr_checking ?
                                                                                                this.state.qruniq_checking ?
                                                                                                    <Button id="strtQrUniqCheck" color="primary" onClick={() => this.uniq_btnidentity()}>Start</Button> :
                                                                                                    <Button id="strtQrCheck" color="primary" onClick={() => this.uniq_identification()}>Start</Button>
                                                                                                : <Button id="strtbtn" color="primary" onClick={() => this.find_qrbarcode()}>Start</Button>)
                                                                                            : null
                                                                                    }
                                                                                </div>
                                                                            </h3>
                                                                        </div>
                                                                    </div>
                                                                    : null
                                                            }


                                                            {
                                                                this.state.inspection_type === "Manual" && this.state.show ?
                                                                    // this.state.inspection_type === "Manual" && this.state.showplaceobject ?
                                                                    <div className="centered obj_style">
                                                                        <div
                                                                            className="obj_style_pdg"
                                                                            style={{
                                                                                boxShadow: '0px 0px 5px black',
                                                                                borderRadius: '1rem',
                                                                                padding: '10px',
                                                                                // padding: '1rem',
                                                                                backgroundColor: 'white',
                                                                                display: 'flex',
                                                                                justifyContent: 'center',
                                                                                alignItems: 'center',
                                                                            }}>
                                                                            <h3
                                                                                className="stl_plobj_txt"
                                                                                style={{
                                                                                    color: 'black',
                                                                                    fontWeight: 'bold',
                                                                                }}>
                                                                                <div>Place the object and</div>
                                                                                <div>
                                                                                    press {
                                                                                        this.state.inspection_type === "Manual" && this.state.show ?
                                                                                            (this.state.qr_checking ?
                                                                                                this.state.qruniq_checking ?
                                                                                                    <Button id="strtQrUniqCheck" color="primary" onClick={() => this.uniq_btnidentity()}>Start</Button> :
                                                                                                    <Button id="strtQrCheck" color="primary" onClick={() => this.uniq_identification()}>Start</Button>
                                                                                                : <Button id="strtbtn" color="primary" onClick={() => this.object_detected()}>Start</Button>)
                                                                                            : null
                                                                                    }
                                                                                </div>
                                                                            </h3>
                                                                        </div>
                                                                    </div>
                                                                    : null
                                                            }


                                                            {
                                                                this.state.show_next ?          // It will work only if it is in Manual
                                                                    <div className="centered obj_style">
                                                                        <div
                                                                            className="obj_style_pdg"
                                                                            style={{
                                                                                boxShadow: '0px 0px 5px black',
                                                                                borderRadius: '1rem',
                                                                                padding: '10px',
                                                                                // padding: '1rem',
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
                                                                                <div>Place the next object and </div>
                                                                                <div>
                                                                                    press
                                                                                    {
                                                                                        this.state.inspection_type === "Manual" && this.state.show ?
                                                                                            (this.state.qr_checking ?
                                                                                                this.state.qruniq_checking ?
                                                                                                    <Button className="stlStrt" id="strtQrUniqCheck" color="primary" onClick={() => this.uniq_btnidentity()}>Start</Button> :
                                                                                                    <Button className="stlStrt" id="strtQrCheck" color="primary" onClick={() => this.uniq_identification()}>Start</Button>
                                                                                                : <Button className="stlStrt" id="strtbtn" color="primary" onClick={() => this.object_detected()}>Start</Button>)
                                                                                            : null
                                                                                    }
                                                                                </div>

                                                                            </h3>
                                                                        </div>
                                                                    </div>
                                                                    : null
                                                            }
                                                        </div>
                                                }



                                                {/* {
                                            this.state.inspection_type === "Manual" && this.state.show ?
                                                <div>
                                                    {
                                                        this.state.qr_checking ?
                                                            <div>
                                                                {
                                                                    this.state.qruniq_checking ?
                                                                        <Button color="primary" onClick={() => this.uniq_btnidentity()}>Start</Button> :
                                                                        <Button color="primary" onClick={() => this.uniq_identification()}>Start</Button>
                                                                }
                                                            </div> :
                                                            <Button id="strtbtn" color="primary" onClick={() => this.object_detected()}>Start</Button>
                                                    }
                                                </div> : null
                                            // ))
                                        } */}
                                            </CardBody>
                                        </Card>
                                    </Col>

                                </Row>
                            </CardBody>
                        </Card>
                    </Container>
                </div>

                {/* modal 1 - details */}
                <Modal size="xl" isOpen={this.state.modal_xlarge}
                    style={{
                        height: '90vh',
                        overflow: 'auto'
                    }}
                >
                    <div className="modal-header">
                        {/* <h5 className="modal-title  mt-0" id="myExtraLargeModalLabel" >
                                    Today&#39;s report <br></br>Date:&nbsp;{current_date}<br></br>Station Name:&nbsp;{station_name}
                                </h5> */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '97%' }}>
                            <h5>Today&#39;s report</h5>
                            <h5>Station Name:&nbsp;{station_name}</h5>
                            <h5>Date:&nbsp;{current_date}</h5>
                        </div>
                        <Button
                            onClick={() =>
                                this.setState({ modal_xlarge: false, session_detail: false })
                            }
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
                                <NavLink style={{ cursor: "pointer" }} className={this.state.activeTab === "1" ? `active` : ``} onClick={() => { this.toggle("1") }}>Inspected Results</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink style={{ cursor: "pointer" }} className={this.state.activeTab === "2" ? `active` : ``} onClick={() => { this.toggle("2"); this.timeSheet() }}>Time Sheet</NavLink>
                            </NavItem>
                        </Nav>
                        <TabContent activeTab={this.state.activeTab} className="p-3 text-muted">
                            <TabPane tabId="1">
                                <div className="table-responsive"
                                    style={{
                                        height: '60vh',
                                        overflowY: 'auto',
                                    }}
                                >
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
                                                {/* <td className="text-center">Total Duration</td> */}
                                                {/* <td>Session</td> */}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report_data.map((component, index) => (
                                                <React.Fragment key={index}>
                                                    {/* <Button onClick={() => { this.table_show(component, this.setState({ tbIndex: index })) }}> */}

                                                    <tr
                                                        key={index}
                                                        onClick={() => { this.table_show(component, index); this.setState({ tbIndex: index }); }}
                                                    >

                                                        <td style={{ display: 'flex', justifyContent: 'space-around' }}>
                                                            <span
                                                                className={`${(this.state.tbIndex === index) && session_detail ? "arrow rotated" : "arrow"}`}
                                                                style={{ color: 'teal' }}
                                                            >
                                                                {/* &#9660; */}
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
                                                        {/* <td className="text-center">{rtdt_TD[index]}</td> */}
                                                        {console.log('count of index TD* ', index)}

                                                        {/* <td className="text-center">{component.totalduration}</td> */}
                                                        {/* <td><Button onClick={() => { this.table_show(component,this.setState({tbIndex:index})) }}>&#9660;</Button></td> */}
                                                        {/* <td> */}
                                                        {/* </td> */}
                                                    </tr>
                                                    {/* </Button> */}
                                                    {(this.state.tbIndex === index) && session_detail && (
                                                        <>
                                                            <tr key={index}>
                                                                <td colSpan='9'>
                                                                    {/* <Table className="table table-striped table-responsive"> */}
                                                                    <div className="table-responsive"
                                                                        style={{
                                                                            height: '300px',
                                                                        }}
                                                                    >
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
                                                                                {manage_details.map((data, index) => (
                                                                                    <tr key={index}>
                                                                                        <td className="text-center">{index + 1}</td>
                                                                                        <td className="text-center">{data.start_time}</td>
                                                                                        <td className="text-center">{data.end_time}</td>
                                                                                        <td className="text-center">{data.duration}</td>
                                                                                        <td className="text-center">{data.total}</td>
                                                                                        <td className="text-center">{data.ok}</td>
                                                                                        <td className="text-center">{data.notok}</td>
                                                                                        <td className="text-center">{data.no_obj}</td>
                                                                                        <td className="text-center">{data.incorrect_obj}</td>
                                                                                    </tr>
                                                                                ))
                                                                                }
                                                                            </tbody>
                                                                        </Table>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </>
                                                    )
                                                    }
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </TabPane>
                            <TabPane tabId='2'>
                                <div className="table-responsive"
                                    style={{
                                        height: '50vh',
                                        overflowY: 'auto',
                                    }}
                                >
                                    <Table className="table table-striped">
                                        <thead
                                            style={{
                                                position: 'sticky',
                                                top: '0',
                                                backgroundColor: 'white',
                                            }}
                                        >
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
                        {
                            this.state.activeTab === "2" ?
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
                                            <td className="text-center">Total Incorrect Object</td></tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="text-center">{total_sn_tmsht}</td>
                                            <td className="text-center">{report_data.length}</td>
                                            <td className="text-center">{totalDuration1}</td>

                                            <td className="text-center">{totalTotal}</td>

                                            {/* <td className="text-center">{totalOk}</td>
                                                    <td className="text-center">{totalNG}</td>
                                                    <td className="text-center">{totalNoObj}</td> */}

                                            <td className="text-center"
                                                style={{
                                                    fontSize: '110%',
                                                    fontWeight: 'bold',
                                                    color: 'black',
                                                    background: '#84b884'
                                                }}>{totalOk}</td>
                                            <td className="text-center"
                                                style={{
                                                    fontSize: '110%',
                                                    fontWeight: 'bold',
                                                    color: 'black',
                                                    background: '#e09191'
                                                }}>{totalNG}</td>
                                            <td className="text-center"
                                                style={{
                                                    fontSize: '110%',
                                                    fontWeight: 'bold',
                                                    color: 'black',
                                                    background: '#adad74'
                                                }}>{totalNoObj}</td>
                                            <td className="text-center"
                                                style={{
                                                    fontSize: '110%',
                                                    fontWeight: 'bold',
                                                    color: 'black',
                                                    background: '#adad74'
                                                }}>{totalincorrect}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                                : null
                        }

                        {/* {
                                this.state.activeTab === "1" ? 
                                    // this.state.tbIndex === '' ? null : (<p>Total Duration:{totalDuration}</p> ) 
                                    null
                                : <p>Total Session : {total_sn_tmsht} Total No. of Components: {report_data.length} Total Duration:{totalDuration1} Total: {totalTotal} Total Ok: {totalOk} Total NG: {totalNG} Total No Obj Found: {totalNoObj}</p>
                            } */}
                        <button
                            type="button"
                            onClick={() =>
                                this.setState({ modal_xlarge: false, session_detail: false })
                            }
                            className="btn btn-secondary"
                            data-dismiss="modal"
                        >
                            Close
                        </button>
                    </div>

                </Modal>

                {
                    this.state.alertMsg ?
                        <SweetAlert
                            title={
                                <Label style={{ fontSize: 20 }}>
                                    No camera found on this device.
                                </Label>
                            }
                            confirmBtnText="OK"
                            onConfirm={() => this.setState({ alertMsg: false })}
                            closeOnClickOutside={false}
                        >
                        </SweetAlert> : null
                }
            </>
        );
    }
}
Inspection.propTypes = {
    history: PropTypes.any.isRequired,
};

export default Inspection;


