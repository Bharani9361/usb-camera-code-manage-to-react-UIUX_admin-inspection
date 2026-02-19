import React, { Component } from "react";
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';

import {
    Card,
    Col,
    Container,
    Row,
    CardBody,
    CardTitle,
    Label,
    Button,
    Table,
    Form,
    Input,
    InputGroup,
} from "reactstrap";
import axios from "axios";
import Webcam from "react-webcam";
import './index.css';
//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { css } from "@emotion/react"
import { MoonLoader } from "react-spinners"
import { Modal } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
import { v4 as uuidv4 } from 'uuid';
import { batch } from "react-redux";
import PropTypes from "prop-types";
import CountdownTimer from "react-component-countdown-timer";
import SweetAlert from 'react-bootstrap-sweetalert';
import { set } from "lodash";
import urlSocket from './urlSocket';
import ImageUrl from "./imageUrl";

let component_code1 = ""
let component_name1 = ""
let positive = ""
let negative = ""
let posble_match = ""
let batch_id = ""
class Inspection extends Component {
    constructor(props) {
        super(props);
        this.state = {
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
        }
    }

    componentDidMount = () => {
        var compData = JSON.parse(sessionStorage.getItem("compData"))
        console.log('testing83', compData)
        document.addEventListener('keydown', this.handleKeyDown);
        // this.device_info()
        // this.device_find()
        let v_id = compData._id
        console.log('first', v_id)
        component_code1 = compData.component_code
        component_name1 = compData.component_name
        positive = compData.positive
        negative = compData.negative
        posble_match = compData.posble_match
        let station_name = compData.station_name
        let station_id = compData.station_id
        console.log('posble', posble_match)
        batch_id = compData.batch_id
        console.log('batch_id', batch_id)
        let datasets = compData.datasets
        let inspection_type = compData.inspection_type
        let qr_checking = compData.qr_checking
        let qruniq_checking = compData.qruniq_checking
        let timeout = Number(compData.timer) + '000'
        this.setState({ timeout, compData, inspection_type, qr_checking, qruniq_checking, capture_duration: Number(compData.timer), })
        console.log('timeout', timeout)
        // console.log(`datasets`, datasets)
        if (datasets === undefined) {
            this.setState({ component_name: component_name1, component_code: component_code1, comp_id: v_id, station_name: station_name, station_id: station_id })
        }
        else {
            this.setState({ component_name: component_name1, component_code: component_code1, datasets, comp_id: v_id, station_name: station_name, station_id: station_id })
        }
        if (compData.inspection_type === 'Manual') {
            this.cont_apiCall()
        }
        else {
            if (this.state.startCapture) {
                this.appCall()
            }
        }
        this.testing_api_call()
    }
    
    componentWillUnmount() {
        // Remove the event listener when the component is unmounted to avoid memory leaks
        document.removeEventListener('keydown', this.handleKeyDown);
    };

    handleKeyDown = (event) => {
        // Check if the pressed key is the "Enter" key (key code 13)
        if (event.keyCode === 13) {
            // Find the Start button using its attribute (you can also use an ID or another selector)
            // const startButton = document.querySelector('[color="primary"]');
            const startButton = document.getElementById('strtbtn');

            // Trigger the click event of the Start button
            if (startButton) {
                startButton.click();
            }
        }
    };

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
        }, 300)
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
        this.setState({ timer: true })
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

    cont_apiCall = () => {
        // this.setState({ showstatus: false, showresult: false })
        // this.setState({ showstatus: false, showresult: true })      // Worked
        (this.state.placeobj_count > 0 ? this.setState({ showstatus: false, showresult: true}) : this.setState({ showstatus: false }))
        // var i = 0;
        // let intervalId = setInterval(() => {
            if (this.state.startCapture) {
                this.apiCall()
            }
            // i++;
        // }, 1000)
        // this.setState({ intervalId: intervalId });
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
        //this.webcam.getScreenshot();
        // console.log('first', Number(this.state.timeout))
        // this.setState({ startCapture: true, timer: true, showstatus: false, showresult: false })
        this.setState({ startCapture: true, timer: true, showstatus: false})
        // let message = 'Place the object'
        // console.log('message', message)
        // this.setState({ mssg: message, showdata: true })
        this.setState({showdata: true })
        // setTimeout(() => {
            // this.setState({ mssg: "" })
        // }, Number(this.state.timeout));
        // setTimeout(() => {
        //     if(this.state.config_data[0].qr_checking === true){
        //         if(this.state.config_data[0].qr_uniq_checking === true){
        //             this.uniqness_checking()
        //         }
        //         else{
        //             this.uniq_object_detection()
        //         }
        //     }
        //     // else if(this.state.config_data[0].qr_uniq_checking){
        //     //     this.uniqness_checking()
        //     // }
        //     else{
        //         this.object_detection()
        //     }
        // }, Number(this.state.timeout));
    }

    uniqness_checking = async () => {
        //clearInterval(this.state.intervalId)
        this.setState({ showdata: false, showresult: false })
        //this.state.msg = ""
        const imageSrc = this.webcam.getScreenshot();
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
        try {
            urlSocket.post('/uniqInfo', formData, {
                headers: {
                    'content-type': 'multipart/form-data'
                },
                mode: 'no-cors'
            })
                .then((response) => {
                    let data = response.data
                    console.log('data237', data)
                    // let inspected_id = response.data[0]._id
                    this.setState({ res_message: response.data[0].detection_result, showstatus: true })
                    // setTimeout(() => {
                        // this.setState({ res_message: "" })
                    // }, 200);

                    setTimeout(() => {
                        if (response.data[0].detection_result === 'New Data found') {
                            // console.log('inspected_id', inspected_id)
                            let Checking = "Checking ..."
                            this.setState({ res_message: Checking, showstatus: true })
                            // setTimeout(() => {
                                this.setState({ res_message: Checking })
                            // }, 50);
                            setTimeout(() => {
                                this.setState({ showstatus: false })
                                let testing_result = response.data[0].status

                                if (testing_result === positive) {
                                    let positive = testing_result.replaceAll(testing_result, this.state.config_positive)
                                    this.setState({ response_message: positive, response_value: response.data[0].value, showresult: true })
                                    // setTimeout(() => {
                                        // this.setState({ response_message: "", response_value: "" })
                                    // }, 200);
                                }
                                else if (testing_result === negative) {
                                    // console.log('testing_result876', testing_result, negative)
                                    let negative = testing_result.replaceAll(testing_result, this.state.config_negative)
                                    this.setState({ response_message: negative, response_value: response.data[0].value, showresult: true })
                                    // setTimeout(() => {
                                        // this.setState({ response_message: "", response_value: "" })
                                    // }, 200);
                                }
                                else if (testing_result === posble_match) {
                                    let posble_match = testing_result.replaceAll(testing_result, this.state.config_posble_match)
                                    console.log('posbl_match563', posble_match)
                                    this.setState({ response_message: posble_match, response_value: response.data[0].value, showresult: true })
                                    // setTimeout(() => {
                                        // this.setState({ response_message: "", response_value: "" })
                                    // }, 200);
                                }
                                // setTimeout(() => {
                                    this.appCall()
                                // }, 200);
                                // this.uniq_resultCall(inspected_id, test_date, _today, time, this.state.comp_id)
                            }, 400);
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
        //clearInterval(this.state.intervalId)
        this.setState({ showdata: false, showresult: false })
        //this.state.msg = ""
        const imageSrc = this.webcam.getScreenshot();
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
        urlSocket.post('/uniq_object_detected', formData, {
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
                // setTimeout(() => {
                    // this.setState({ res_message: "" })
                // }, 200);

                setTimeout(() => {
                    if (response.data[0].detection_result === 'Qr Code Found') {
                        // console.log('inspected_id', inspected_id)
                        let Checking = "Checking ..."
                        this.setState({ res_message: Checking, showstatus: true })
                        // setTimeout(() => {
                            this.setState({ res_message: Checking })
                        // }, 50);
                        setTimeout(() => {
                            this.setState({ showstatus: false })
                            let testing_result = response.data[0].status

                            if (testing_result === positive) {
                                let positive = testing_result.replaceAll(testing_result, this.state.config_positive)
                                this.setState({ response_message: positive, response_value: response.data[0].value, showresult: true })
                                // setTimeout(() => {
                                    // this.setState({ response_message: "", response_value: "" })
                                // }, 200);
                            }
                            else if (testing_result === negative) {
                                // console.log('testing_result876', testing_result, negative)
                                let negative = testing_result.replaceAll(testing_result, this.state.config_negative)
                                this.setState({ response_message: negative, response_value: response.data[0].value, showresult: true })
                                // setTimeout(() => {
                                    // this.setState({ response_message: "", response_value: "" })
                                // }, 200);
                            }
                            else if (testing_result === posble_match) {
                                let posble_match = testing_result.replaceAll(testing_result, this.state.config_posble_match)
                                console.log('posbl_match563', posble_match)
                                this.setState({ response_message: posble_match, response_value: response.data[0].value, showresult: true })
                                // setTimeout(() => {
                                    // this.setState({ response_message: "", response_value: "" })
                                // }, 200);
                            }
                            // setTimeout(() => {
                                this.appCall()
                            // }, 200);

                            // this.uniq_resultCall(inspected_id, test_date, _today, time, this.state.comp_id)
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


    object_detection = async (event) => {
        //clearInterval(this.state.intervalId)
        this.setState({ showdata: false, showresult: false })
        //this.state.msg = ""
        const imageSrc = this.webcam.getScreenshot();
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
        urlSocket.post('/line_object_detected', formData, {
            headers: {
                'content-type': 'multipart/form-data'
            },
            mode: 'no-cors'
        })
            .then(response => {
                console.log(`success`, response.data)
                console.log('first', response.data[0].status)
                console.log('_id', response.data[0]._id)
                let inspected_id = response.data[0]._id
                this.setState({ res_message: response.data[0].detection_result, showstatus: true })
                // setTimeout(() => {
                    // this.setState({ res_message: "" })
                // }, 200);

                setTimeout(() => {
                    if (response.data[0].detection_result === "Object Detected") {
                        // console.log('inspected_id', inspected_id)
                        let Checking = "Checking ..."
                        this.setState({ res_message: Checking, showstatus: true })
                        // setTimeout(() => {
                            this.setState({ res_message: Checking })
                        // }, 50);
                        setTimeout(() => {
                            this.setState({ showstatus: false })
                            let testing_result = response.data[0].status
                            console.log('testing_result', testing_result)
                            // this.setState({ response_message: response.data.status, response_value: parseFloat(response.data.value).toFixed(2), showresult: false })
                            // console.log('negative', negative)

                            if (testing_result === positive) {
                                let positive = testing_result.replaceAll(testing_result, this.state.config_positive)
                                this.setState({ response_message: positive, response_value: response.data[0].value, showresult: true })
                                // setTimeout(() => {
                                    // this.setState({ response_message: "", response_value: "" })
                                // }, 200);
                            }
                            else if (testing_result === negative) {
                                // console.log('testing_result876', testing_result, negative)
                                let negative = testing_result.replaceAll(testing_result, this.state.config_negative)
                                this.setState({ response_message: negative, response_value: response.data[0].value, showresult: true })
                                // setTimeout(() => {
                                    // this.setState({ response_message: "", response_value: "" })
                                // }, 200);
                            }
                            else if (testing_result === posble_match) {
                                let posble_match = testing_result.replaceAll(testing_result, this.state.config_posble_match)
                                console.log('posbl_match563', posble_match)
                                this.setState({ response_message: posble_match, response_value: response.data[0].value, showresult: true })
                                // setTimeout(() => {
                                    // this.setState({ response_message: "", response_value: "" })
                                // }, 200);
                            }
                            // setTimeout(() => {
                                this.appCall()
                            // }, 200);

                        }, 400);    // Checking tiem

                    }
                    else {
                        this.appCall();
                    }
                }, 300) // Object detected time
            })
    }


    uniq_btnidentity = async (event) => {
        clearInterval(this.state.intervalId)
        this.setState({ show: false, msg: false, show_next: false, showplaceobject: false, showresult: false })
        //this.state.msg = ""
        const imageSrc = this.webcam.getScreenshot();
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
        console.log('fi748rst', _today)
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
        try {
            urlSocket.post('/uniqInfo', formData, {
                headers: {
                    'content-type': 'multipart/form-data'
                },
                mode: 'no-cors'
            })
                .then((response) => {
                    let data = response.data
                    console.log('data237', data)
                    //let inspected_id = response.data[0]._id
                    this.setState({ res_message: response.data[0].detection_result, showstatus: true })
                    setTimeout(() => {
                        this.setState({ res_message: "" })
                    }, 200);

                    setTimeout(() => {
                        if (response.data[0].detection_result === 'New Data found') {
                            //console.log('inspected_id', inspected_id)
                            let Checking = "Checking ..."
                            this.setState({ res_message: Checking, showstatus: true })
                            // setTimeout(() => {
                                this.setState({ res_message: Checking })
                            // }, 50);
                            setTimeout(() => {
                                // this.setState({ showstatus: false })
                                this.setState({ showstatus: false, show_next: true, show: true })
                                let testing_result = response.data[0].status

                                if (testing_result === positive) {
                                    let positive = testing_result.replaceAll(testing_result, this.state.config_positive)
                                    this.setState({ response_message: positive, response_value: response.data[0].value, showresult: true })
                                    // setTimeout(() => {
                                        // this.setState({ response_message: "", response_value: "" })
                                    // }, 200);
                                }
                                else if (testing_result === negative) {
                                    console.log('testing_result876', testing_result,)
                                    let negative = testing_result.replaceAll(testing_result, this.state.config_negative)
                                    this.setState({ response_message: negative, response_value: response.data[0].value, showresult: true })
                                    // setTimeout(() => {
                                        // this.setState({ response_message: "", response_value: "" })
                                    // }, 200);
                                }
                                else if (testing_result === posble_match) {
                                    let posble_match = testing_result.replaceAll(testing_result, this.state.config_posble_match)
                                    console.log('posbl_match563', posble_match)
                                    this.setState({ response_message: posble_match, response_value: response.data[0].value, showresult: true })
                                    // setTimeout(() => {
                                        // this.setState({ response_message: "", response_value: "" })
                                    // }, 200);
                                }
                                // setTimeout(() => {
                                    this.cont_apiCall()
                                // }, 200);
                                // this.uniq_APICall(inspected_id, test_date, _today, time, this.state.comp_id)
                            }, 400);
                        }
                        else {
                            this.cont_apiCall();
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

    uniq_identification = async (event) => {
        this.state.placeobj_count += 1  // to hide the Result at the starting
        clearInterval(this.state.intervalId)
        this.setState({ show: false, msg: false,  show_next: false, showplaceobject: false, showresult: false})
        //this.state.msg = ""
        const imageSrc = this.webcam.getScreenshot();
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

        urlSocket.post('/uniq_object_detected', formData, {
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
                // setTimeout(() => {
                    // this.setState({ res_message: "" })
                // }, 200);

                setTimeout(() => {
                    if (response.data[0].detection_result === 'Qr Code Found') {
                        // console.log('inspected_id', inspected_id)
                        let Checking = "Checking ..."
                        this.setState({ res_message: Checking, showstatus: true })
                        // setTimeout(() => {
                            this.setState({ res_message: Checking })
                        // }, 50);
                        setTimeout(() => {
                            // this.setState({ showstatus: false })
                            this.setState({ showstatus: false, show_next: true, show: true })
                            let testing_result = response.data[0].status

                            if (testing_result === positive) {
                                let positive = testing_result.replaceAll(testing_result, this.state.config_positive)
                                this.setState({ response_message: positive, response_value: response.data[0].value, showresult: true })
                                // setTimeout(() => {
                                    // this.setState({ response_message: "", response_value: "" })
                                // }, 200);
                            }
                            else if (testing_result === negative) {
                                // console.log('testing_result876', testing_result, negative)
                                let negative = testing_result.replaceAll(testing_result, this.state.config_negative)
                                this.setState({ response_message: negative, response_value: response.data[0].value, showresult: true })
                                // setTimeout(() => {
                                    // this.setState({ response_message: "", response_value: "" })
                                // }, 200);
                            }
                            else if (testing_result === posble_match) {
                                let posble_match = testing_result.replaceAll(testing_result, this.state.config_posble_match)
                                console.log('posbl_match563', posble_match)
                                this.setState({ response_message: posble_match, response_value: response.data[0].value, showresult: true })
                                // setTimeout(() => {
                                    // this.setState({ response_message: "", response_value: "" })
                                // }, 200);
                            }
                            // setTimeout(() => {
                                this.cont_apiCall()
                            // }, 200);
                            //this.uniq_APICall(inspected_id, test_date, _today, time, this.state.comp_id)
                        }, 400);
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


    // object_detected = async (event) => {
    //     clearInterval(this.state.intervalId)
    //     this.setState({ show: false, msg: false })
    //     //this.state.msg = ""
    //     const imageSrc = this.webcam.getScreenshot();
    //     const blob = await fetch(imageSrc).then((res) => res.blob());
    //     // console.log(blob)
    //     const formData = new FormData();
    //     let component_code = component_code1
    //     let component_name = component_name1
    //     let vpositive = positive
    //     let vnegative = negative
    //     let vposble_match = posble_match

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
    //             this.setState({ res_message: response.data[0].status, showstatus: true })
    //             setTimeout(() => {
    //                 this.setState({ res_message: "" })
    //             }, 200);

    //             setTimeout(() => {
    //                 if (response.data[0].status === "Object Detected") {
    //                     console.log('inspected_id', inspected_id)
    //                     let Checking = "Checking ..."
    //                     this.setState({ res_message: Checking, showstatus: true })
    //                     setTimeout(() => {
    //                         this.setState({ res_message: Checking })
    //                     }, 50);
    //                     setTimeout(() => {
    //                         this.APICall(inspected_id, test_date, _today, time, this.state.comp_id)
    //                     }, 200);
    //                 }
    //                 else {
    //                     this.cont_apiCall();
    //                 }
    //             }, 300)
    //         })
    // }

    object_detected = async (event) => {
        // let placeobj_count =  this.state.placeobj_count ++
        console.log('this.state.placeobj_count >>> <<< ', this.state.placeobj_count)
        this.state.placeobj_count += 1  // to hide the Result at the starting
        clearInterval(this.state.intervalId)
        this.setState({ show: false, msg: false, show_next: false, showplaceobject: false, showresult: false})
        //this.state.msg = ""
        const imageSrc = this.webcam.getScreenshot();
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
        try {
            urlSocket.post('/line_object_detected', formData, {
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
                    // setTimeout(() => {
                    //     this.setState({ res_message: "" })
                    // }, 200);

                    setTimeout(() => {
                        if (response.data[0].detection_result === "Object Detected") {
                            // console.log('inspected_id', inspected_id)
                            let Checking = "Checking ..."
                            this.setState({ res_message: Checking, showstatus: true })
                            // setTimeout(() => {
                                this.setState({ res_message: Checking })
                            // }, 50);
                            setTimeout(() => {
                                // this.setState({ showstatus: false, placeobj_count, show_next: true, show: true })                               
                                this.setState({ showstatus: false, show_next: true, show: true })                               
                                let testing_result = response.data[0].status
                                console.log('response >>> ', response)
                                console.log('testing_result', testing_result)
                                // this.setState({ response_message: response.data.status, response_value: parseFloat(response.data.value).toFixed(2), showresult: false })
                                // console.log('negative', negative)

                                if (testing_result === positive) {
                                    let positive = testing_result.replaceAll(testing_result, this.state.config_positive)
                                    this.setState({ response_message: positive, response_value: response.data[0].value, showresult: true })
                                    // setTimeout(() => {
                                    //     this.setState({ response_message: "", response_value: "" })
                                    // }, 3200);
                                }
                                else if (testing_result === negative) {
                                    // console.log('testing_result876', testing_result, negative)
                                    console.log('response.data.value <<< >>> ', response.data.value)
                                    let negative = testing_result.replaceAll(testing_result, this.state.config_negative)
                                    this.setState({ response_message: negative, response_value: response.data[0].value, showresult: true })
                                    // setTimeout(() => {
                                    //     this.setState({ response_message: "", response_value: "" })
                                    // }, 3200);
                                }
                                else if (testing_result === posble_match) {
                                    let posble_match = testing_result.replaceAll(testing_result, this.state.config_posble_match)
                                    console.log('posbl_match563', posble_match)
                                    this.setState({ response_message: posble_match, response_value: response.data[0].value, showresult: true })
                                    // setTimeout(() => {
                                    //     this.setState({ response_message: "", response_value: "" })
                                    // }, 3200);
                                }
                                // setTimeout(() => {
                                    // this.state.show ? this.cont_apiCall() : null
                                    this.cont_apiCall()
                                // }, 3200);
                            }, 400); // Checking time
                        }
                        else {
                            this.cont_apiCall();
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


    // stopClick = () => {
    //     this.setState({ startCapture: false })
    //     let batchid = batch_id
    //     console.log('batchid', batchid)

    //     // console.log({ 'comp_name': comp_name, 'comp_code': comp_code, 'start_Date': startDate, 'end_date': endDate })
    //     try {
    //         axios.post('https://172.16.1.91:5000/update_batch', { '_id': batchid },
    //             { mode: 'no-cors' })
    //             .then((response) => {
    //                 let batch_data = response.data
    //                 console.log("batchdata", batch_data)
    //                 let batch_table = batch_data[0].batch_info
    //                 //let old_date = new Date(batch_table[0].start_time).toISOString() 
    //                 let st_date = new Date(batch_table[0].start_time)
    //                 let hr = st_date.getUTCHours()
    //                 let min = st_date.getUTCMinutes()
    //                 let secc = st_date.getUTCSeconds()
    //                 let start_time = hr + ':' + min + ':' + (secc.toString().length == 1 ? '0' + secc : secc)
    //                 console.log('start_time', start_time, secc.toString().length, ' length ', (secc.length == 1 ? '0' + secc : secc))
    //                 let e_date = new Date(batch_table[0].end_time)

    //                 let hour = e_date.getUTCHours()
    //                 let mn = e_date.getUTCMinutes()
    //                 let sec = e_date.getUTCSeconds()
    //                 let end_time = hour + ':' + mn + ':' + (sec.toString().length == 1 ? '0' + sec : sec)
    //                 console.log('end_time', end_time)
    //                 let total_hours = e_date.getTime() - st_date.getTime();
    //                 console.log('total_hours', total_hours)
    //                 //let milliseconds = Math.floor((total_hours % 1000) / 100)
    //                 let seconds = Math.floor((total_hours / 1000) % 60)
    //                 let minutes = Math.floor((total_hours / (1000 * 60)) % 60)
    //                 let hours = Math.floor((total_hours / (1000 * 60 * 60)) % 24)

    //                 hours = (hours < 10) ? "0" + hours : hours;
    //                 minutes = (minutes < 10) ? "0" + minutes : minutes;
    //                 seconds = (seconds < 10) ? "0" + seconds : seconds;
    //                 // let total_time = hours + ":" + minutes + ":" + seconds + "." + milliseconds;
    //                 let total_time = hours + ":" + minutes + ":" + seconds;
    //                 console.log('total_time', total_time)
    //                 let aggbatch_table = batch_data[1].agg_batch
    //                 console.log('first', batch_table)
    //                 console.log('second', aggbatch_table)
    //                 this.setState({ batch_data, batch_table, aggbatch_table, start_time, end_time, total_time })
    //             })
    //             .catch((error) => {
    //                 console.log(error)
    //             })
    //     } catch (error) {
    //     }
    // }


    getImage = (image_path, type) => {
        // console.log(`image_path`, image_path)
        if (image_path === undefined) {
            return ""
        }
        let baseurl = ImageUrl
        let output = ''
        if (type === 'OK') {
            let result = image_path.replaceAll("\\", "/");
            //console.log(`result`, result)
            output = baseurl + result
        }
        return output
    }

    goBack = () => {
        clearInterval(this.state.intervalId)
        this.setState({ show: false, msg: false })
        sessionStorage.setItem('showSidebar', false)
        this.props.history.push('/crudcomponent')
    }



    render() {
        const videoConstraints = {
            facingMode: "user"
        };
        const override = css`display: block; margin: 0 auto; border-color: red;`;
        const { showresult, response_message } = this.state;

        return (
            <React.Fragment>
                <div className="page-content dis-scrl">
                    <MetaTags>
                        <title>Form Layouts | Skote - React Admin & Dashboard Template</title>
                    </MetaTags>

                    <Container fluid={true}>
                        {/* <Breadcrumbs title="Forms" breadcrumbItem="Form Layouts" /> */}
                        {/* <button className="btn btn-primary" type="submit">Back</button> */}
                        <Button style={{ backgroundColor: '#556ee6', border: 'none' }} onClick={() => { this.goBack() }} >Back</Button>
                        {/* <Link to="/crudcomponent"><Button style={{backgroundColor: '#556ee6', border: 'none'}} onClick={() => {this.goback()}} >Back</Button></Link> */}
                        <div style={{ marginBottom: '1.5rem' }}></div>
                        <Row>
                            <Col lg={6} md={6} xs={6}>
                                <Card style={{ height: '100%' }}>
                                    <CardBody>
                                        <CardTitle className="mb-4">Inspection</CardTitle>
                                        <div className="containerImg" style={{ position: 'relative' }}>
                                            <div className="centered mt-5"
                                                // style={ this.state.show ? {top: '70%'} : {}}
                                                // style={ this.state.show_next ? this.state.placeobj_count > 0 ? {top: '70%'} : {} : {}}
                                            >
                                            
                                                {/* Code for display 'Place the object' in 'Auto' mode */}
                                                {/* {
                                                    this.state.showdata ?
                                                        <div style={{
                                                            color:
                                                                this.state.mssg === "Place the object" ? 'white' :
                                                                    null,
                                                            backgroundColor: 'teal'
                                                        }}>
                                                            {this.state.mssg}
                                                        </div> : null
                                                } */}
                                                

                                                {
                                                    this.state.showstatus ?
                                                        <div style={{
                                                            color:
                                                                this.state.res_message === "Object Detected" ? 'lightgreen' :
                                                                    this.state.res_message === "Qr Code Found" ? 'lightgreen' :
                                                                        this.state.res_message === 'QR not found' ? 'red' :
                                                                            this.state.res_message === "No Object Found" ? 'yellow' :
                                                                                this.state.res_message === "Checking ..." ? 'lightyellow' :
                                                                                    null
                                                        }}>
                                                            {this.state.res_message}
                                                        </div> : null
                                                }
                                                {
                                                    console.log('this.state.showresult >>>> <<<< ', this.state.showresult)
                                                }
                                                {
                                                    this.state.showresult ?
                                                        <div style={{
                                                            // background: "white",
                                                            color:
                                                                this.state.response_message === "No Objects Detected" ? 'red' :
                                                                    this.state.response_message === this.state.config_positive ? 'lightgreen' :
                                                                        this.state.response_message === this.state.config_negative ? 'red' :
                                                                            this.state.response_message === this.state.config_posble_match ? 'orange' :
                                                                                null
                                                        }}>
                                                            <br />
                                                            Result: {this.state.response_message}{" "}{this.state.response_value}
                                                            {console.log('response_message, response_value', this.state.response_message, this.state.response_value)}
                                                        </div> : null
                                                }

                                                {
                                                    this.state.showresult ?
                                                        <div className="containerImg" >
                                                            <div>
                                                                {
                                                                    this.state.response_message === this.state.config_positive &&
                                                                    <div className="align-self-bottom">
                                                                        <CheckCircleOutlined style={{ fontSize: '80px' }} />
                                                                    </div>
                                                                }
                                                            </div>
                                                            {
                                                                this.state.response_message === this.state.config_negative &&
                                                                <div className="align-self-bottom">
                                                                    <CloseCircleOutlined style={{ color: 'red', fontSize: '80px' }} />
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
                                            {
                                                //this.state.response_value>0.90 && this.state.response_value<0.95 ?
                                                // <div>
                                                //     <Button className="me-2" color="success" onClick={() => this.acceptClick()} > POSITIVE </Button>
                                                //     <Button className="me-2" color="danger" onClick={() => this.rejectClick()}> NEGATIVE </Button>
                                                // </div>
                                                //: null
                                            }

                                            {showresult && (
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '96%',
                                                        backgroundColor:
                                                            response_message === "No Objects Detected"
                                                                ? ''
                                                                : response_message === this.state.config_positive
                                                                    ? 'rgba(144, 238, 144, 0.15)' // Lightgreen with 50% transparency
                                                                    : response_message === this.state.config_negative
                                                                        ? 'rgba(255, 0, 0, 0.15)' // Red with 50% transparency
                                                                        : response_message === this.state.config_posble_match
                                                                            ? 'rgba(255, 165, 0, 0.15)' // Orange with 50% transparency
                                                                            : 'transparent', // Default transparent
                                                        borderRadius: '2rem',
                                                        pointerEvents: 'none', // Ensure that the overlay does not interfere with clicks on the underlying elements
                                                        // zIndex: 1 // Ensure the overlay is above the Webcam component
                                                    }}
                                                ></div>
                                                
                                            )}
                                            {
                                                this.state.showdata ? 
                                                <div 
                                                    className="containerImg centered" 
                                                >
                                                    <div style={{ backgroundColor: '#f1f1f1', padding: '0 5px', borderRadius: '5px'}}>
                                                        <h3
                                                            style={{
                                                                color: 'black',
                                                            }}
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
                                                            Place the object
                                                        </h3>
                                                    </div>
                                                </div>
                                                    
                                                    : null
                                            }
                                            {
                                                this.state.inspection_type === "Manual" && this.state.showplaceobject ?
                                                    <div className="centered obj_style">
                                                        <div
                                                            className="obj_style_pdg" 
                                                            style={{
                                                            boxShadow: '0px 0px 5px black',
                                                            borderRadius: '1rem',
                                                            padding: '1rem',
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
                                                                Place the object and press start
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
                                                            padding: '1rem',
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
                                                                Place the next object and press start
                                                            </h3>
                                                        </div>
                                                    </div>
                                                    : null
                                            }
                                            

                                            <Webcam
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
                                                    // zIndex: 2 // Ensure the Webcam component is above the overlay
                                                } : {
                                                    borderRadius: '2rem'
                                                }}
                                            />
                                        </div>
                                        {/* {
                                            console.log('1170', this.state.inspection_type)
                                        } */}
                                        {
                                            // this.state.config_data.map((data, index) => (
                                            this.state.inspection_type === "Manual" && this.state.show ?
                                                // <div key={index}>
                                                <div>
                                                    {
                                                        this.state.qr_checking ?
                                                            <div>
                                                                {
                                                                    this.state.qruniq_checking ?
                                                                        <Button color="primary" onClick={() => this.uniq_btnidentity()}>Start Qr uniqness checking</Button> :
                                                                        <Button color="primary" onClick={() => this.uniq_identification()}>Start Qr check</Button>
                                                                }
                                                            </div> :
                                                            <Button id="strtbtn" color="primary" onClick={() => this.object_detected()}>Start</Button>
                                                    }
                                                </div> : null
                                            // ))
                                        }
                                    </CardBody>
                                </Card>
                            </Col>
                            {/* <Modal title="Inspection Summary" centered visible={this.state.showModal} onOk={() => {
                                this.setState({ showModal: false });
                                this.props.history.push('/crudcomponent')
                            }} onCancel={() => this.setState({ showModal: false })} width={1000}                                                        >
                                <div className="table-responsive">
                                    <Table striped>
                                        <thead>
                                            <tr>
                                                <th>Component Name</th>
                                                <th>Component Code</th>
                                                <th>Start Time</th>
                                                <th>End Time</th>
                                                <th>Total Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                this.state.batch_table.map((data, index) => (
                                                    <tr key={index}>
                                                        <td>{data.comp_name}</td>
                                                        <td>{data.comp_code}</td>
                                                        <td>{this.state.start_time}</td>
                                                        <td>{this.state.end_time}</td>
                                                        <td>{this.state.total_time}</td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </Table>
                                    <br />
                                    <Table striped>
                                        <thead>
                                            <tr>
                                                <th>No of comp Checked</th>
                                                <th>OK</th>
                                                <th>Not OK</th>
                                                <th>Possible Match</th>
                                                <th>No Object Detected</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                this.state.aggbatch_table.map((data, index) => (
                                                    <tr key={index}>
                                                        <td>{data.total}</td>
                                                        <td>{data.ok}</td>
                                                        <td>{data.notok}</td>
                                                        <td>{data.posbl_match}</td>
                                                        <td>{data.no_obj}</td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </Table>
                                </div>
                            </Modal> */}
                            <Col lg={6} md={6} xs={6}>
                                <Card style={{ height: '100%' }}>
                                    <CardBody>
                                        <CardTitle className="mb-4">Reference Component</CardTitle>
                                        {/* <label>Component Name: {this.state.component_name}</label> {" , "}
                                        <label>Component Code: {this.state.component_code}</label>
                                        <br /> */}
                                        {/* <div>
                                            <label>Component Name: {this.state.component_name}</label>
                                            {", "}
                                            <label>Component Code: {this.state.component_code}</label>
                                        </div> */}
                                        <div style={{
                                            position: 'relative'
                                        }}>
                                            <div 
                                                className="obj_style_pdg comp_stl"
                                                style={{
                                                position: 'absolute',
                                                zIndex: '2',
                                                top: '5%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                color: 'black',
                                                backgroundColor: 'white',
                                                borderRadius: '1rem',
                                                padding: '0.5rem 1rem'
                                            }}>
                                                <label className="stl_plobj_txt" style={{margin: '0'}}>Component Name: {this.state.component_name}, Component Code: {this.state.component_code}</label>                                            </div>
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
                                            {/* <img src={this.state.img_url} width="100%" /> */}
                                        </div>

                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
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
                    </Container>
                    {/* container-fluid */}
                </div>
            </React.Fragment>
        );
    }
}
Inspection.propTypes = {
    history: PropTypes.any.isRequired,
};

export default Inspection;


