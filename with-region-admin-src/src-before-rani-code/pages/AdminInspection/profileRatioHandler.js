import React, { Component, createRef } from 'react'
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
import { sample } from 'lodash';
import "./Css/style.css";
import "./Css/profileTest.css"
import Select from 'react-select';
import { rectangle } from 'leaflet';
import { DEFAULT_RESOLUTION } from './cameraConfig';
import WebcamCapture from 'pages/WebcamCustom/WebcamCapture';

import urlSocket from "./urlSocket";
import { image_url } from './imageUrl';
let ImageUrl = image_url;
export default class profileRatioHandler extends Component {
    static propTypes = { history: PropTypes.any.isRequired }

    constructor(props) {
        super(props);
        this.state = {
            sample_count: 10,
            get_samp_count: true,
            inspection_type: 'Manual',
            timerValue: 10,
            placeobj_count: 0,

            obj_count: 0,
            set_values: false,
            showresult: false,

            result_key: false,

            ok_count: 0,
            ng_count: 0,
            t_count: 0,

            qrbar_found: 0,
            qrbar_result: 0,
            comp_found: 0,
            comp_result: 0,
            show_outline: false,

            outline_options: [
                { label: "White Outline" },
                { label: "Red Outline" },
                { label: "Green Outline" },
                { label: "Blue Outline" },
                { label: "Black Outline" },
                { label: "Orange Outline" },
                { label: "Yellow Outline" },
            ],
            // default_outline:{label:'White Outline'},
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
            region_selection: false,
            rectangles: [],
            output_Rect: false,
            res_img: null,

            selectedRectangleIndex: null,
            editingRectangleIndex: null,
            selecting: false,
            capturedImage: null,
            clearCanvasFlag: false,

            zoom_value: {
                zoom: 1,
                center: { x: 0.5, y: 0.5 }
            }
        };

        this.toggleModal2 = this.toggleModal2.bind(this);
        this.handleSampleCountChange = this.handleSampleCountChange.bind(this);
        this.canvasRef = createRef();
        this.videoRef = createRef();
        this.trashButtonsRef = createRef([]);
        this.animationRef = createRef();

        this.webcamRef = createRef();
    }

    componentDidMount = () => {
        const db_info = JSON.parse(localStorage.getItem('db_info'));
        ImageUrl = `${image_url}${db_info?.db_name}/`;
        this.fetchData();
    }

    // this is for plotting rectangle
    componentDidUpdate(prevProps, prevState) {

        console.log('this.state.rectangles', this.state.rectangles)
        // Check if the canvasRef or canvas element is null
        if (!this.canvasRef.current) {
            // console.error('canvasRef is null');
            return;
        }
        const canvas = this.canvasRef.current;
        console.log('this.state.showRegion122', canvas);
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

                    const trashButton = this.trashButtonsRef[index];
                    if (trashButton) {
                        trashButton.style.left = `${rect.x + rect.width - 20}px`;
                        trashButton.style.top = `${rect.y}px`;
                    }
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
    }



    fetchData = async () => {
        const zoom_values = JSON.parse(sessionStorage.getItem('zoom_values'));
        if (zoom_values) {
            this.setState({ zoom_value: zoom_values });
        }

        let sessionData = JSON.parse(sessionStorage.getItem("computeProfData"));
        let choosen_prof = sessionData.current_profile;
        let component_data = sessionData.current_comp_info;

        // let ref_img_path = await this.getRefImage(choosen_prof);
        let res_data = await this.getRefImage(choosen_prof);

        console.log('data79 ', choosen_prof, choosen_prof.qrbar_check, choosen_prof.qrbar_check_type, res_data, sessionData);
        this.setState({ region_selection: choosen_prof.region_selection })

        let initialData = {
            choosen_prof,
            ref_img_path: res_data.path,
            config: res_data.config_data,
            page_info: choosen_prof.page_info,
            component_data: component_data
        }
        let count_value = await this.getCountBeforeRefresh(choosen_prof);
        this.showRefOutline(choosen_prof);
        if (count_value !== '') {
            initialData.ok_count = count_value[0].ok;
            initialData.ng_count = count_value[0].notok;
            initialData.t_count = count_value[0].total;
            initialData.obj_count = count_value[0].total;
        }

        this.setState(initialData);

        console.log('data91 ', choosen_prof, choosen_prof?.qrbar_check, choosen_prof?.qrbar_value);
        if (choosen_prof?.qrbar_check === true) {
            this.setState({
                qrbar_show_start: true,
                qrbar: true
            })
        } else {
            this.setState({
                show_start: true
            })
        }

        // Add device change listener
        navigator.mediaDevices.addEventListener('devicechange', this.checkWebcam);
        // Initial check
        this.checkWebcam();

        window.addEventListener('beforeunload', this.handleBeforeUnload);
        window.addEventListener('popstate', this.handlePopState);
        window.history.pushState(null, null, window.location.pathname); // Reset the history state
    }





    componentWillUnmount() {
        // Clear the interval to avoid memory leaks
        clearInterval(this.trainingStatusInterval);
        // Remove device change listener
        navigator.mediaDevices.removeEventListener('devicechange', this.checkWebcam);

        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        window.removeEventListener('popstate', this.handlePopState);
    }

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

    handleBeforeUnload = (e) => {
        // Cancel the event as returning a string will prompt the browser with a default message
        e.preventDefault();
        // Standard message will be shown in most browsers if you return a string
        e.returnValue = '';

        // Your custom message
        const message = 'Are you sure you want to leave?';

        // Some browsers do not display the message, but you can return it
        return message;
    };

    handlePopState = (e) => {
        const { gotoPage } = this.state;
        // Your logic for handling the back button press goes here
        // For example, you can immediately push a new entry onto the history stack
        window.history.pushState(null, null, window.location.pathname);

        // You may choose to show a popup or perform any other action
        // For example:
        if (window.confirm('Are you sure you want to go back?')) {

            this.abort()
            // Perform your action here, for example, navigate back
            // window.history.back();
        } else {
            // Reset the history state to prevent the user from navigating away
            window.history.pushState(null, null, window.location.pathname);
        }
    };

    showRefOutline = async (ver_data) => {
        console.log('data153 ', ver_data);
        try {
            const response = await urlSocket.post('/check_outline', {
                'comp_id': ver_data.comp_id,
                'position': ver_data.position,
            }, { mode: 'no-cors' });
            let getInfo = response.data;
            console.log('data131 ', getInfo);
            if (getInfo.show == 'yes') {
                this.setState({
                    show_outline: true,
                    outline_checkbox: true,
                    comp_info: getInfo.comp_info,
                    outline_path: getInfo.comp_info.datasets.white_path
                })
            } else if (getInfo.show == 'no') {
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

    toggleModal2() {
        this.setState(prevState => ({
            modal2Open: !prevState.modal2Open
        }));
    }

    handleSampleCountChange(value) {
        this.setState({ sample_count: value });
    }

    getRefImage = async (choosen_prof) => {
        console.log('62choosen_prof : ', choosen_prof)
        try {
            const response = await urlSocket.post('/getProfRefImage', {
                'prof_data': choosen_prof
            }, { mode: 'no-cors' });
            const data = response.data;
            return data
        } catch (error) {
            console.log('error : ', error)
            return error
        }
    }

    getCountBeforeRefresh = async (prof_value) => {
        console.log('prof_value.batch_id', prof_value.batch_id)
        try {
            const availCount = await urlSocket.post('/refresh_profile_test',
                { 'batch_id': prof_value.batch_id },
                { mode: 'no-cors' });

            console.log('111availCount :', availCount.data, availCount.data.length)
            if (availCount.data.length > 0) {
                return availCount.data
            } else {
                return ''
            }

        } catch (error) {
            console.log(error);
            return ''
        }
    }

    getImage = (image_path) => {
        let result = image_path.replaceAll("\\", "/");
        //console.log(`result`, result)
        let output = ImageUrl + result
        return output
    }

    showImage = (output_img) => {
        let imgurl = ImageUrl
        const parts = output_img.split("/");
        const newPath = parts.slice(1).join("/");

        let startIndex;
        if (newPath.includes("Datasets/")) {
            startIndex = newPath.indexOf("Datasets/");
        } else {
            startIndex = newPath.indexOf("receive/");
        }

        const relativePath = newPath.substring(startIndex);
        console.log('output_img : ', imgurl + relativePath)
        return `${imgurl + relativePath}`
    }

    handleManualAuto = (e) => {
        this.setState({
            inspection_type: e.target.value,
        });
    };

    handleTimerChange = (value) => {
        this.setState({
            timerValue: value
        });
    };

    objectDetectionOnly = async () => {
        const {
            choosen_prof, config, obj_count, sample_count,
            ok_count, ng_count, t_count
        } = this.state;
        this.setState({ res_img: false, rectangles: [], output_Rect: false })
        console.log('data448 ', choosen_prof.region_selection, this.state.region_selection)

        if (sample_count === null || sample_count === undefined) {
            Swal.fire({
                icon: 'info',
                title: 'No. of Test Samples Required',
                confirmButtonText: 'OK',
            });
        } else if (sample_count <= 0) {
            Swal.fire({
                icon: 'info',
                title: 'The number of test samples must be greater than zero.',
                confirmButtonText: 'OK',
            });
        }
        else {
            const imageSrc = await this.webcamRef.current.captureZoomedImage();
            // const imageSrc = this.webcam.getScreenshot({ width: DEFAULT_RESOLUTION.width, height: DEFAULT_RESOLUTION.height });
            this.setState({ res_img: imageSrc })
            if (!imageSrc) {
                console.log('webcam is not properly connected.')
                return;
            }
            this.setState(prevState => ({ placeobj_count: prevState.placeobj_count + 1 }));
            this.state.placeobj_count += 1  // to hide the Result at the starting
            this.setState({
                show: false, msg: false, show_next: false,
                showplaceobject: false, showresult: false,
                showstatus: false, set_values: true,
                show_start: false
            })

            const blob = await fetch(imageSrc).then((res) => res.blob());
            const formData = new FormData();

            console.log('100data ', choosen_prof, config)

            let component_code = choosen_prof.comp_code
            let component_name = choosen_prof.comp_name

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

            formData.append('comp_name', choosen_prof.comp_name);
            formData.append('comp_code', choosen_prof.comp_code);
            formData.append('comp_id', choosen_prof.comp_id);
            formData.append('obj_detect', choosen_prof.detect_selection);
            formData.append('detect_type', config.detection_type);
            formData.append('positive', config.positive);
            formData.append('negative', config.negative);
            formData.append('posble_match', config.posble_match);
            formData.append('datasets', blob, compdata + '.png')
            formData.append('station_name', this.state.station_name)
            formData.append('station_id', this.state.station_id)
            formData.append('inspected_ondate', test_date)
            formData.append('date', _today)
            formData.append('time', time)
            formData.append('milliseconds', milliseconds)
            formData.append('batch_id', choosen_prof.batch_id)
            // formData.append('prof_data', JSON.stringify(choosen_prof.profile_data));
            formData.append('prof_data', JSON.stringify(choosen_prof));
            formData.append('our_rectangles', JSON.stringify(this.state.component_data.rectangles));
            formData.append('qrbar_result', this.state.qrbar_result)

            try {
                await urlSocket.post('/obj_detection_profile',
                    formData, {
                    headers: {
                        'content-type': 'multipart/form-data'
                    },
                    mode: 'no-cors'
                })
                    .then(async response => {
                        console.log('154response.data : ', response.data);
                        let obj_result = response.data[0].detection_result;

                        this.setState({
                            res_message: response.data[0].detection_result,
                            showstatus: true,
                            comp_found: response.data[0].detection_result === "Object Detected" ? 2 : 1
                        });
                        // show obj detection for 1 sec
                        await new Promise(resolve => setTimeout(resolve, 1500));

                        let updated_rectangles = [];
                        if (response.data[0]?.updated_rectangles) {
                            updated_rectangles = response.data[0].updated_rectangles
                        }

                        setTimeout(() => {
                            if ((choosen_prof.detect_selection == true && obj_result == "Object Detected") ||
                                (choosen_prof.detect_selection == false && obj_result == "")) {
                                let show_ratio = false;
                                let ratio_data;
                                let Checking = "Checking ...";
                                this.setState({ res_message: Checking, showstatus: true });
                                // after object detection
                                urlSocket.post('/overall_result_profile',
                                    {
                                        'comp_id': choosen_prof.comp_id,
                                        'comp_name': choosen_prof.comp_name,
                                        "comp_code": choosen_prof.comp_code,
                                        "batch_id": choosen_prof.batch_id,
                                        "captured_image": response.data[0].captured_image,
                                        "insp_result_id": response.data[0].insp_result_id,
                                        "start_time_with_milliseconds": response.data[0].start_time_with_milliseconds,
                                        "positive": config.positive,
                                        "negative": config.negative,
                                        "posble_match": config.posble_match,
                                        "choosen_prof": JSON.stringify(choosen_prof),
                                        "region_selection": this.state.region_selection,
                                        "updated_rectangles": updated_rectangles,
                                    },
                                    { mode: 'no-cors' })
                                    .then(async detection => {

                                        this.setState({
                                            showstatus: false,
                                            comp_found: 2,
                                            // // // hide place the next object from inspection side
                                            // // show_next: true, 
                                            // show: true
                                        });
                                        if (choosen_prof?.qrbar_check === true) {
                                            this.setState({ qrbar_show_start: true })
                                        } else {
                                            this.setState({ show_start: true })
                                        }

                                        let testing_result = detection.data[0].status;
                                        console.log('data576 ', detection)
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
                                        if (sample_count === null || sample_count === undefined || obj_count + 1 >= sample_count) {
                                            show_ratio = true;
                                            const test_opt_response = await urlSocket.post('/test_opt', {
                                                'batch_id': choosen_prof.batch_id,
                                                'profile_id': choosen_prof._id
                                            }, { mode: 'no-cors' });
                                            ratio_data = test_opt_response.data;

                                            console.log('180response', test_opt_response);
                                        }
                                        if (testing_result === 'OK') {
                                            let updated_ok = ok_count + 1;
                                            let updated_total = updated_ok + ng_count;
                                            this.setState({
                                                response_message: config.positive,
                                                response_value: detection.data[0].value,
                                                showresult: true,
                                                result_key: true,
                                                obj_count: obj_count + 1,
                                                show_ratio,
                                                ratio_data,
                                                show_start: choosen_prof?.qrbar_check === true ? false : true,
                                                qrbar_show_start: choosen_prof?.qrbar_check === true ? true : false,
                                                comp_result: 2,
                                                // show_start: true,
                                                ok_count: updated_ok,
                                                t_count: updated_total
                                            });
                                        }
                                        else if (testing_result === 'NG') {
                                            let updated_ng = ng_count + 1;
                                            let updated_total = ok_count + updated_ng;
                                            this.setState({
                                                response_message: config.negative,
                                                response_value: detection.data[0].value,
                                                showresult: true,
                                                result_key: true,
                                                obj_count: obj_count + 1,
                                                show_ratio,
                                                ratio_data,
                                                show_start: choosen_prof?.qrbar_check === true ? false : true,
                                                qrbar_show_start: choosen_prof?.qrbar_check === true ? true : false,
                                                comp_result: 1,
                                                // show_start: true,

                                                ng_count: updated_ng,
                                                t_count: updated_total
                                            })
                                        }
                                    })
                            }
                            // if (response.data[0].detection_result === "Object Detected") {}
                            else {
                                this.setState({
                                    show_start: choosen_prof?.qrbar_check === true ? false : true,
                                    qrbar_show_start: choosen_prof?.qrbar_check === true ? true : false,
                                    // show_start: true
                                })
                            }
                        }, 500);
                        // 

                        // if (response.data[0].detection_result === "Object Detected") {
                        //     let show_ratio = false;
                        //     let ratio_data;
                        //     let testing_result = response.data[0].status;


                        // } else {

                        // }
                    });

            } catch (error) {
                console.log('error : ', error)
            }
        }
    }

    toggle = () => {
        const { page_info } = this.state;
        this.setState(prevState => ({
            show_ratio: !prevState.show_ratio
        }));
        this.props.history.push(page_info);
    }

    abort = () => {
        const { page_info, choosen_prof } = this.state;
        console.log('back is working');

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
                // Handle user confirmation
                console.log('Testing process aborted');

                urlSocket.post('/abortProfileTest',
                    {
                        'batch_id': choosen_prof.batch_id,
                    },
                    { mode: 'no-cors' })
                    .then(async abortdata => {
                        console.log('579abortdata : ', abortdata)
                    })

                this.props.history.push(page_info);
            } else {
                // Handle user cancellation
                console.log('User canceled');
            }
        });
    }

    navigate = async () => {
        const { page_info, choosen_prof } = this.state;
        try {
            const response = await urlSocket.post('/getCompUpdatedProfile', { 'comp_id': choosen_prof.comp_id }, { mode: 'no-cors' });
            console.log('628response', response, choosen_prof);

            let updateChoosenProf = {};

            if (response.data.length > 0) {
                let profileData = response.data.filter(data_ => data_._id === choosen_prof._id);
                console.log('profileData634', profileData)
                // updateChoosenProf.choosenProf = profileData[0];
                updateChoosenProf.profData = response.data;
            }
            console.log('636updateChoosenProf', updateChoosenProf)
            sessionStorage.setItem("updatedProfile", JSON.stringify(updateChoosenProf));

            this.props.history.push(page_info);
        } catch (error) {
            console.log('error', error)
        }
    }

    find_qrbarcode = async () => {
        const { choosen_prof } = this.state;
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

        // if (inspection_type === 'Manual') {
        this.setState({ qrbar_show_start: false })
        // } else {
        //     this.setState({ qrbar_countdown_active: false })
        // }

        // Wait for 1 second using a promise
        await new Promise(resolve => setTimeout(resolve, 1500));

        const imageSrc = await this.webcamRef.current.captureZoomedImage();
        // const imageSrc = this.webcam.getScreenshot({ width: DEFAULT_RESOLUTION.width, height: DEFAULT_RESOLUTION.height });
        const blob = await fetch(imageSrc).then((res) => res.blob());
        const formData = new FormData();
        let component_code = choosen_prof.comp_name
        let component_name = choosen_prof.comp_code

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

        formData.append('comp_id', choosen_prof.comp_id);
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
                        // showstatus: '',
                        // res_message: '',
                        qrbar_result: 2,
                        // show: inspection_type === 'Manual' ? true : undefined,
                        show_start: true,
                        // isCountdownActive: inspection_type !== 'Manual' ? true : undefined,
                        // showdata: inspection_type !== 'Manual' ? true : undefined            // pause and resume in auto mode
                    })
                }, 1000);
            } else if (code_data === 'Barcode is incorrect') {

                // // Initial state update with conditional logic for qrbar_start_btn or qrbar_countdown_active
                // this.setState({
                //     res_message: code_data,
                //     qrbar_found: 2,
                //     // qrbar_start_btn: inspection_type === 'Manual' ? true : undefined,
                //     // qrbar_countdown_active: inspection_type !== 'Manual' ? true : undefined,
                // });

                // setTimeout(() => {
                //     this.setState({
                //         qrbar_result: 1,
                //         show_start: true,
                //         // showstatus: '',
                //         // res_message: '',
                //         // show: inspection_type === 'Manual' ? true : undefined,
                //         // isCountdownActive: inspection_type !== 'Manual' ? true : undefined,
                //         // showdata: inspection_type !== 'Manual' ? true : undefined                // pause and resume in auto mode
                //     });
                // }, 1000);

                if ((choosen_prof.qrbar_check_type === null) || (choosen_prof.qrbar_check_type === undefined)
                    || (parseInt(choosen_prof.qrbar_check_type) === 1)) {
                    this.setState({
                        res_message: code_data,
                        qrbar_found: 2,
                    });
                    setTimeout(() => {
                        this.setState({
                            qrbar_result: 1,
                            show_start: true,
                        });
                    }, 1000)
                } else if (parseInt(choosen_prof.qrbar_check_type) === 0) {
                    this.setState({
                        res_message: code_data,
                        qrbar_found: 2,
                        qrbar_result: 1,
                        qrbar_show_start: true,
                    })
                }

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
                    // qrbar_start_btn: inspection_type === 'Manual' ? true : false, // Ensure we don't overwrite qrbar_start_btn if not Manual
                    qrbar_show_start: true,
                    // qrbar_countdown_active: inspection_type !== 'Manual' // Set to true if inspection_type is not Manual
                });
            }
        } catch (error) {
            console.log(error)
        }
    }

    object_detected = async (event) => {
        const { resultKey, compData } = this.state;

        this.state.placeobj_count += 1  // to hide the Result at the starting
        clearInterval(this.state.intervalId)
        this.setState({ show: false, msg: false, show_next: false, showplaceobject: false, showresult: false, showstatus: false })
        const imageSrc = await this.webcamRef.current.captureZoomedImage();
        // const imageSrc = this.webcam.getScreenshot({ width: DEFAULT_RESOLUTION.width, height: DEFAULT_RESOLUTION.height });
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
        formData.append('qrbar_result', this.state.qrbar_result)

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
                    this.setState({
                        res_message: response.data[0].detection_result,
                        showstatus: true,
                        comp_found: response.data[0].detection_result === "Object Detected" ? 2 : 1
                    });

                    setTimeout(() => {
                        if (response.data[0].detection_result === "Object Detected") {
                            let Checking = "Checking ..."
                            this.setState({ res_message: Checking, showstatus: true })

                            // after object detection

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

                                    this.setState({
                                        showstatus: false,
                                        comp_found: 2,
                                    })
                                    if (compBarcode) {
                                        this.setState({ show_next: true, show: true, })
                                    }
                                    let testing_result = detection.data[0].status
                                    console.log('response >>> ', response)
                                    console.log('testing_result', testing_result)

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
                                    // this.cont_apiCall()
                                })


                        }
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
        }

    }

    outlinechanges = (e) => {
        console.log('e1349', e.label)
        this.setState({ default_outline: e })
        const { comp_info } = this.state
        if (e.label === 'White Outline') {
            this.setState({ outline_path: comp_info.datasets.white_path })
        }
        else if (e.label === 'Red Outline') {
            this.setState({ outline_path: comp_info.datasets.red_path })
        }
        else if (e.label === 'Green Outline') {
            this.setState({ outline_path: comp_info.datasets.green_path })
        }
        else if (e.label === 'Blue Outline') {
            this.setState({ outline_path: comp_info.datasets.blue_path })
        }
        else if (e.label === 'Black Outline') {
            this.setState({ outline_path: comp_info.datasets.black_path })
        }
        else if (e.label === 'Orange Outline') {
            this.setState({ outline_path: comp_info.datasets.orange_path })
        }
        else if (e.label === 'Yellow Outline') {
            this.setState({ outline_path: comp_info.datasets.yellow_path })
        }

    }

    newOutlineChange = (ot_label) => {
        this.setState({ default_outline: ot_label })
        const { comp_info } = this.state
        if (ot_label === 'White Outline') {
            this.setState({ outline_path: comp_info.datasets.white_path })
        }
        else if (ot_label === 'Red Outline') {
            this.setState({ outline_path: comp_info.datasets.red_path })
        }
        else if (ot_label === 'Green Outline') {
            this.setState({ outline_path: comp_info.datasets.green_path })
        }
        else if (ot_label === 'Blue Outline') {
            this.setState({ outline_path: comp_info.datasets.blue_path })
        }
        else if (ot_label === 'Black Outline') {
            this.setState({ outline_path: comp_info.datasets.black_path })
        }
        else if (ot_label === 'Orange Outline') {
            this.setState({ outline_path: comp_info.datasets.orange_path })
        }
        else if (ot_label === 'Yellow Outline') {
            this.setState({ outline_path: comp_info.datasets.yellow_path })
        }

    }

    render() {
        const {
            choosen_prof, ref_img_path, showresult, response_message, config
        } = this.state;
        return (
            <div className='page-content'>
                <Row className="mb-3">
                    <Col xs={9}>
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="mb-0 mt-2 m-2 font-size-14 fw-bold">PROFILE TESTING</div>
                        </div>
                    </Col>
                    <Col xs={3} className='d-flex align-items-center justify-content-end'>
                        <button className='btn btn-primary btn-sm me-2 w-md' color="primary" onClick={() => this.abort()}>ABORT</button>
                    </Col>
                </Row>
                <Container fluid>
                    <Card>
                        <CardBody>
                            {
                                choosen_prof &&
                                <Table striped bordered>
                                    <thead>
                                        <tr>
                                            <th>Component Name</th>
                                            <th>Profile Name</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{choosen_prof.comp_name}</td>
                                            <td>{choosen_prof.profile_name}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            }

                            <Row>
                                <div className="ms-3 d-flex align-items-start justify-content-start">
                                    <div>
                                        <p style={{ fontWeight: 'bold' }} className="me-3">No. of Test Samples :</p>
                                        <InputNumber
                                            min={0}
                                            value={this.state.sample_count}
                                            onChange={this.handleSampleCountChange}
                                            disabled={this.state.set_values}
                                        />
                                    </div>

                                    <div className='ms-auto me-3'>
                                        <p style={{ fontWeight: 'bold' }} className="me-3">
                                            Sample Completed: {this.state.obj_count} / {this.state.sample_count}
                                        </p>
                                    </div>
                                </div>
                            </Row>
                            {
                                this.state.qrbar &&
                                <Row>
                                    <Col>
                                        <Card className="mb-3">
                                            <CardBody>
                                                <h5 className="">
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
                                                    {
                                                        choosen_prof.detect_selection == true &&
                                                        <>
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
                                                        </>
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
                                                </h5>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row>
                            }
                            {
                                // modelData && modelData.datasets && modelData.datasets.length !== 0 && modelData.datasets[0].white_path ?
                                this.state.outline_checkbox &&
                                <>
                                    <div className='my-3'>
                                        <FormGroup check>
                                            <Label check>
                                                <Input
                                                    type="checkbox"
                                                    checked={this.state.show_outline}
                                                    onChange={() => this.showOutline()}
                                                />
                                                Show Outline
                                            </Label>
                                        </FormGroup>
                                    </div>
                                    {
                                        this.state.show_outline &&
                                        <div className='d-flex align-items-center'>
                                            <Label className='my-1'>Outline Color : </Label>
                                            <div className='mx-3 d-flex'>
                                                {

                                                    this.state.outline_colors.map((otline, otl_id) => (

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
                                                                boxShadow: this.state.default_outline == otline && '0px 0px 5px 2px rgba(0, 0, 0, 0.5)',
                                                                border: otline == "White Outline" ? 'auto' : 'none'
                                                            }}
                                                            outline={this.state.default_outline !== otline}
                                                            onClick={() => { this.newOutlineChange(otline) }}
                                                        ></Button>

                                                    ))
                                                }
                                            </div>
                                        </div>
                                    }

                                </>
                            }
                            <Row>
                                <Col lg={6} md={6} xs={6}>
                                    <Card style={{ height: '100%' }}>
                                        <CardBody>
                                            <CardTitle className="mb-4">Reference Component</CardTitle>
                                            <Row>
                                                <Col lg={8} md={8} xs={8} className="mx-auto">
                                                    <Row>
                                                        {/* 28-02-24 */}
                                                        {
                                                            ref_img_path && <Col>
                                                                <img style={{ height: 'auto', width: '100%', borderRadius: '2rem' }} src={this.showImage(ref_img_path)} />
                                                            </Col>
                                                        }
                                                    </Row>
                                                </Col>
                                            </Row>
                                            {
                                                this.state.config &&
                                                <Row className="tdCntStl">
                                                    <div className="table-responsive sdTblFntSz" style={{ paddingTop: '10px' }}>
                                                        <Table className="table" style={{
                                                            boxShadow: '0px 0px 5px 2px #495057'
                                                        }}>
                                                            <tbody>

                                                                <tr>
                                                                    <td style={{ fontWeight: 'bold', color: 'darkgreen' }}>{config.positive} Samples</td>
                                                                    <td style={{ fontWeight: 'bold', color: 'darkgreen' }}>{this.state.ok_count}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td style={{ fontWeight: 'bold', color: 'darkred' }}>{config.negative} Samples</td>
                                                                    <td style={{ fontWeight: 'bold', color: 'darkred' }}>{this.state.ng_count}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td style={{ fontWeight: 'bold' }}>Samples Completed</td>
                                                                    <td style={{ fontWeight: 'bold' }}>{this.state.t_count}</td>
                                                                </tr>
                                                            </tbody>
                                                        </Table>
                                                    </div>
                                                </Row>
                                            }

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
                                                    this.state.showdata ?
                                                        this.state.resume ?
                                                            <Button onClick={() => this.resumeCountdown()}>
                                                                Resume
                                                            </Button> :
                                                            <Button onClick={() => this.pauseCountdown()}>
                                                                Pause
                                                            </Button>
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
                                                    <div>
                                                        <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
                                                            {
                                                                this.state.show_outline &&
                                                                    // modelData && modelData.datasets && modelData.datasets.length !== 0 && modelData.datasets[0].white_path ?
                                                                    this.state.outline_path ?
                                                                    <img
                                                                        style={{
                                                                            width: '100%',
                                                                            position: 'absolute',
                                                                            height: 'auto'
                                                                        }}
                                                                        // src={this.showImage(modelData.datasets[0].white_path)}
                                                                        src={this.showImage(this.state.outline_path)}
                                                                    // src={`${ImageUrl + this.state.outline_path}?${Date.now()}`}
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
                                                                        response_message === "No Object Detected"
                                                                            ? ''
                                                                            : response_message === config.positive
                                                                                ? '10px solid green'
                                                                                : response_message === config.negative
                                                                                    ? '10px solid red'
                                                                                    : response_message === this.state.config_posble_match
                                                                                        ? '10px solid orange'
                                                                                        : null,
                                                                    borderRadius: '2rem',
                                                                } : {
                                                                    borderRadius: '2rem'
                                                                }}
                                                            />

                                                            <canvas
                                                                ref={this.canvasRef}
                                                                width={640}
                                                                height={480}
                                                                style={{
                                                                    display: (!(this.state.region_selection && this.state.output_Rect)) && 'none',
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: 0,
                                                                    width: '100%',
                                                                    height: 'auto',
                                                                }}
                                                            />



                                                        </div>
                                                        <div className="centered mt-5">
                                                            {
                                                                this.state.showstatus ?
                                                                    <h3
                                                                        className="fsz_resmsg"
                                                                        style={{
                                                                            color:
                                                                                this.state.res_message === "Object Detected" ? 'green' :
                                                                                    this.state.res_message === "Qr Code Found" ? 'green' :
                                                                                        this.state.res_message === 'QR not found' ? 'red' :
                                                                                            this.state.res_message === "No Object Detected" ? 'yellow' :
                                                                                                this.state.res_message === "Incorrect Object" ? 'orange' :
                                                                                                    this.state.res_message === "Checking ..." ? 'lightyellow' :
                                                                                                        this.state.res_message === "Detecting Barcode" ? 'white' :
                                                                                                            this.state.res_message === "Unable to read Barcode" ? 'yellow' :
                                                                                                                this.state.res_message === "Barcode is incorrect" ? 'red' :
                                                                                                                    this.state.res_message === "Barcode is correct" ? 'green' :
                                                                                                                        null,
                                                                            fontWeight: 'bold'
                                                                        }}>
                                                                        {this.state.res_message}
                                                                    </h3> : null
                                                            }
                                                            {
                                                                this.state.showresult ?
                                                                    <h3
                                                                        className="resultMarginTop"
                                                                        style={{
                                                                            fontWeight: 'bold',
                                                                            color:
                                                                                this.state.response_message === "No Objects Detected" ? 'red' :
                                                                                    this.state.response_message === config.positive ? 'green' :
                                                                                        this.state.response_message === config.negative ? 'red' :
                                                                                            // this.state.response_message === this.state.config_posble_match ? 'orange' :
                                                                                            null
                                                                        }}>
                                                                        {this.state.result_key === true &&
                                                                            // <Label className="fsz_resmsg"></Label>
                                                                            `Result : ${this.state.response_message}`
                                                                            // ${this.state.response_value}
                                                                        }
                                                                    </h3> : null
                                                            }
                                                            {
                                                                this.state.showresult ?
                                                                    <div className="containerImg" >
                                                                        <div>
                                                                            {
                                                                                this.state.response_message === config.positive &&
                                                                                <div className="align-self-bottom">
                                                                                    <CheckCircleOutlined className="circsz" style={{ color: 'green' }} />
                                                                                </div>
                                                                            }
                                                                        </div>
                                                                        {
                                                                            this.state.response_message === config.negative &&
                                                                            <div className="align-self-bottom">
                                                                                <CloseCircleOutlined className="circsz" style={{ color: 'red', }} />
                                                                            </div>
                                                                        }
                                                                    </div> : null
                                                            }

                                                        </div>


                                                        {
                                                            this.state.inspection_type === "Manual" && this.state.show_start &&
                                                            <div className='d-flex align-items-center justify-content-center'>
                                                                <h5 style={{ fontWeight: 'bold', margin: 0 }} className="me-3">
                                                                    {
                                                                        this.state.placeobj_count > 0 ?
                                                                            'Place the next object and press'
                                                                            : 'Place the object and press'
                                                                    }


                                                                </h5>
                                                                <Button color='primary' onClick={() => this.objectDetectionOnly()}>Start</Button>
                                                            </div>
                                                        }
                                                        {
                                                            this.state.inspection_type === "Manual" && this.state.qrbar_show_start &&
                                                            <div className='d-flex align-items-center justify-content-center'>
                                                                <h5 style={{ fontWeight: 'bold', margin: 0 }} className="me-3">
                                                                    {
                                                                        this.state.placeobj_count > 0 ?
                                                                            'Place QR/Barcode and press '
                                                                            : 'Place QR/Barcode and press '
                                                                    }


                                                                </h5>
                                                                <Button color='primary' onClick={() => this.find_qrbarcode()}>Start</Button>
                                                            </div>
                                                        }

                                                        {
                                                            this.state.inspection_type === "Manual" && this.state.showplaceobject ?
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

                                        </CardBody>
                                    </Card>
                                </Col>

                            </Row>
                        </CardBody>
                    </Card>
                </Container>

                {
                    this.state.show_ratio &&
                    <Modal isOpen={this.state.show_ratio} toggle={this.toggle} keyboard={false} centered>
                        <ModalHeader toggle={this.toggle} style={{ fontWeight: 'bold', textAlign: 'center' }}>
                            Acceptance Ratio Calculation
                        </ModalHeader>
                        <ModalBody>
                            <p style={{ fontWeight: 'bold' }}>
                                {`Profile's Acceptance Ratio: ${this.state.ratio_data.profile_Ratio}`}
                            </p>
                            <p className='mt-5' style={{ fontWeight: 'bold' }}>
                                {`Algorithm's Acceptance Ratio`}
                            </p>
                            <Table striped bordered hover className='mt-3'>
                                <thead>
                                    <tr>
                                        <th>Algorithm</th>
                                        <th>Ratio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        Object.keys(this.state.ratio_data.algo_ratio).map(key => (
                                            <tr key={key}>
                                                <td>{key}</td>
                                                <td>{this.state.ratio_data.algo_ratio[key]}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </Table>
                        </ModalBody>
                        <ModalFooter>
                            <Button color='primary' onClick={() => this.navigate()}>OK</Button>
                        </ModalFooter>
                    </Modal>
                }
            </div>
        )
    }
}
