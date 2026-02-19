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
    Button   
} from "reactstrap";
import axios from "axios";
import Webcam from "react-webcam";
import './index.css';
//Import Breadcrumb

import { css } from "@emotion/react"
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import 'antd/dist/antd.css';
import PropTypes from "prop-types";
import CountdownTimer from "react-component-countdown-timer";
import SweetAlert from 'react-bootstrap-sweetalert';

import urlSocket from './urlSocket';
import ImageUrl from "./imageUrl";

import WebcamComponent from './WebcamComponent';
import ResultDisplay from './ResultDisplay';
import ReferenceComponent from './ReferenceComponent';

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
        else {
            this.object_detection()
        }
    }

    cont_apiCall = () => {
        (this.state.placeobj_count > 0
        ? this.setState({ showstatus: false, showresult: true })
        : this.setState({ showstatus: false }) )

        if (this.state.startCapture) {
            this.apiCall()
        }
    }

    apiCall = () => {
        let message = 'Place the object and press start'
        console.log('message', message);
        this.setState({ msg: message, show: true })
    }

    appCall = () => {
        this.setState({ startCapture: true, timer: true, showstatus: false})
        this.setState({showdata: true })
    }

    uniqness_checking = async () => {
        this.setState({ showdata: false, showresult: false })
        const imageSrc = this.webcam.getScreenshot();
        const blob = await fetch(imageSrc).then((res) => res.blob());
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
                    this.setState({ res_message: response.data[0].detection_result, showstatus: true })

                    setTimeout(() => {
                        if (response.data[0].detection_result === 'New Data found') {
                            let Checking = "Checking ..."
                            this.setState({ res_message: Checking, showstatus: true })
                                this.setState({ res_message: Checking })
                            setTimeout(() => {
                                this.setState({ showstatus: false })
                                let testing_result = response.data[0].status

                                if (testing_result === positive) {
                                    let positive = testing_result.replaceAll(testing_result, this.state.config_positive)
                                    this.setState({ response_message: positive, response_value: response.data[0].value, showresult: true })
                                }
                                else if (testing_result === negative) {
                                    let negative = testing_result.replaceAll(testing_result, this.state.config_negative)
                                    this.setState({ response_message: negative, response_value: response.data[0].value, showresult: true })
                                }
                                else if (testing_result === posble_match) {
                                    let posble_match = testing_result.replaceAll(testing_result, this.state.config_posble_match)
                                    console.log('posbl_match563', posble_match)
                                    this.setState({ response_message: posble_match, response_value: response.data[0].value, showresult: true })
                                }
                                    this.appCall()
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

    uniq_object_detection = async (event) => {
        this.setState({ showdata: false, showresult: false })
        const imageSrc = this.webcam.getScreenshot();
        const blob = await fetch(imageSrc).then((res) => res.blob());
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
                this.setState({ res_message: response.data[0].detection_result, showstatus: true })

                setTimeout(() => {
                    if (response.data[0].detection_result === 'Qr Code Found') {
                        let Checking = "Checking ..."
                        this.setState({ res_message: Checking, showstatus: true })
                            this.setState({ res_message: Checking })
                        setTimeout(() => {
                            this.setState({ showstatus: false })
                            let testing_result = response.data[0].status

                            if (testing_result === positive) {
                                let positive = testing_result.replaceAll(testing_result, this.state.config_positive)
                                this.setState({ response_message: positive, response_value: response.data[0].value, showresult: true })
                            }
                            else if (testing_result === negative) {
                                // console.log('testing_result876', testing_result, negative)
                                let negative = testing_result.replaceAll(testing_result, this.state.config_negative)
                                this.setState({ response_message: negative, response_value: response.data[0].value, showresult: true })
                            }
                            else if (testing_result === posble_match) {
                                let posble_match = testing_result.replaceAll(testing_result, this.state.config_posble_match)
                                console.log('posbl_match563', posble_match)
                                this.setState({ response_message: posble_match, response_value: response.data[0].value, showresult: true })
                            }
                                this.appCall()

                        }, 400);
                    }
                    else {
                        this.appCall();
                    }
                }, 300)
            })

    }

    object_detection = async (event) => {
        this.setState({ showdata: false, showresult: false })
        const imageSrc = this.webcam.getScreenshot();
        const blob = await fetch(imageSrc).then((res) => res.blob());
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
        console.log('time', milliseconds)

        let replace = _today + '_' + time.replaceAll(":", "_");

        let compdata = component_name + "_" + component_code + '_' + replace


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

                setTimeout(() => {
                    if (response.data[0].detection_result === "Object Detected") {
                        let Checking = "Checking ..."
                        this.setState({ res_message: Checking, showstatus: true })
                            this.setState({ res_message: Checking })
                        setTimeout(() => {
                            this.setState({ showstatus: false })
                            let testing_result = response.data[0].status
                            console.log('testing_result', testing_result)

                            if (testing_result === positive) {
                                let positive = testing_result.replaceAll(testing_result, this.state.config_positive)
                                this.setState({ response_message: positive, response_value: response.data[0].value, showresult: true })
                            }
                            else if (testing_result === negative) {
                                let negative = testing_result.replaceAll(testing_result, this.state.config_negative)
                                this.setState({ response_message: negative, response_value: response.data[0].value, showresult: true })
                            }
                            else if (testing_result === posble_match) {
                                let posble_match = testing_result.replaceAll(testing_result, this.state.config_posble_match)
                                console.log('posbl_match563', posble_match)
                                this.setState({ response_message: posble_match, response_value: response.data[0].value, showresult: true })
                            }
                                this.appCall()

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
        const imageSrc = this.webcam.getScreenshot();
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
        console.log('fi748rst', _today)
        let test_date = yyyy + '-' + mm + '-' + dd

        let hours = today.getHours()
        let min = today.getMinutes()
        let secc = today.getSeconds()
        let time = hours + ':' + min + ':' + secc
        let replace = _today + '_' + time.replaceAll(":", "_");

        let compdata = component_name + "_" + component_code + '_' + replace


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
                    this.setState({ res_message: response.data[0].detection_result, showstatus: true })
                    setTimeout(() => {
                        this.setState({ res_message: "" })
                    }, 200);

                    setTimeout(() => {
                        if (response.data[0].detection_result === 'New Data found') {
                            let Checking = "Checking ..."
                            this.setState({ res_message: Checking, showstatus: true })
                                this.setState({ res_message: Checking })
                            setTimeout(() => {
                                this.setState({ showstatus: false, show_next: true, show: true })
                                let testing_result = response.data[0].status

                                if (testing_result === positive) {
                                    let positive = testing_result.replaceAll(testing_result, this.state.config_positive)
                                    this.setState({ response_message: positive, response_value: response.data[0].value, showresult: true })
                                }
                                else if (testing_result === negative) {
                                    console.log('testing_result876', testing_result,)
                                    let negative = testing_result.replaceAll(testing_result, this.state.config_negative)
                                    this.setState({ response_message: negative, response_value: response.data[0].value, showresult: true })
                                }
                                else if (testing_result === posble_match) {
                                    let posble_match = testing_result.replaceAll(testing_result, this.state.config_posble_match)
                                    console.log('posbl_match563', posble_match)
                                    this.setState({ response_message: posble_match, response_value: response.data[0].value, showresult: true })
                                }
                                    this.cont_apiCall()
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
        const imageSrc = this.webcam.getScreenshot();
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
        let replace = _today + '_' + time.replaceAll(":", "_");

        let compdata = component_name + "_" + component_code + '_' + replace


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
                this.setState({ res_message: response.data[0].detection_result, showstatus: true })

                setTimeout(() => {
                    if (response.data[0].detection_result === 'Qr Code Found') {
                        let Checking = "Checking ..."
                        this.setState({ res_message: Checking, showstatus: true })
                            this.setState({ res_message: Checking })
                        setTimeout(() => {
                            this.setState({ showstatus: false, show_next: true, show: true })
                            let testing_result = response.data[0].status

                            if (testing_result === positive) {
                                let positive = testing_result.replaceAll(testing_result, this.state.config_positive)
                                this.setState({ response_message: positive, response_value: response.data[0].value, showresult: true })
                            }
                            else if (testing_result === negative) {
                                let negative = testing_result.replaceAll(testing_result, this.state.config_negative)
                                this.setState({ response_message: negative, response_value: response.data[0].value, showresult: true })
                            }
                            else if (testing_result === posble_match) {
                                let posble_match = testing_result.replaceAll(testing_result, this.state.config_posble_match)
                                console.log('posbl_match563', posble_match)
                                this.setState({ response_message: posble_match, response_value: response.data[0].value, showresult: true })
                            }
                                this.cont_apiCall()
                        }, 400);
                    }
                    else {
                        this.cont_apiCall();
                    }
                }, 300)
            })
    }

    object_detected = async (event) => {
        console.log('this.state.placeobj_count >>> <<< ', this.state.placeobj_count)
        this.state.placeobj_count += 1  // to hide the Result at the starting
        clearInterval(this.state.intervalId)
        this.setState({ show: false, msg: false, show_next: false, showplaceobject: false, showresult: false})
        const imageSrc = this.webcam.getScreenshot();
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
        let milliseconds = hours + ':' + min + ':' + secc + '.' + today.getMilliseconds().toString().padStart(3, '0').slice(0, 5);
        console.log('time', time)
        let replace = _today + '_' + time.replaceAll(":", "_");

        let compdata = component_name + "_" + component_code + '_' + replace

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

                    this.setState({ res_message: response.data[0].detection_result, showstatus: true })

                    setTimeout(() => {
                        if (response.data[0].detection_result === "Object Detected") {

                            let Checking = "Checking ..."
                            this.setState({ res_message: Checking, showstatus: true })

                            setTimeout(() => {

                                this.setState({ showstatus: false, show_next: true, show: true })                               
                                let testing_result = response.data[0].status
                                console.log('response >>> ', response)
                                console.log('testing_result', testing_result)

                                if (testing_result === positive) {
                                    let positive = testing_result.replaceAll(testing_result, this.state.config_positive)
                                    this.setState({ response_message: positive, response_value: response.data[0].value, showresult: true })
                                }
                                else if (testing_result === negative) {
                                    console.log('response.data.value <<< >>> ', response.data.value)
                                    let negative = testing_result.replaceAll(testing_result, this.state.config_negative)
                                    this.setState({ response_message: negative, response_value: response.data[0].value, showresult: true })
                                }
                                else if (testing_result === posble_match) {
                                    let posble_match = testing_result.replaceAll(testing_result, this.state.config_posble_match)
                                    console.log('posbl_match563', posble_match)
                                    this.setState({ response_message: posble_match, response_value: response.data[0].value, showresult: true })
                                }
                                    this.cont_apiCall()
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

    getImage = (image_path, type) => {
        if (image_path === undefined) {
            return ""
        }
        let baseurl = ImageUrl
        let output = ''
        if (type === 'OK') {
            let result = image_path.replaceAll("\\", "/");
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
          facingMode: 'user',
        };
        const { showresult, response_message } = this.state;
        const {
          config_positive,
          config_negative,
          config_posble_match,
          datasets,
          getImage,
          capture_duration,
          inspection_type,
          showplaceobject,
          show_next,
          qr_checking,
          qruniq_checking,
        } = this.state;
    
        return (
          <React.Fragment>
            <div className="page-content dis-scrl">
              <MetaTags>
                <title>Form Layouts | Skote - React Admin & Dashboard Template</title>
              </MetaTags>
    
              <Container fluid={true}>
                <Button style={{ backgroundColor: '#556ee6', border: 'none' }} onClick={() => this.goBack()}>
                  Back
                </Button>
                <div style={{ marginBottom: '1.5rem' }}></div>
                <Row>
                  <Col lg={6} md={6} xs={6}>
                    <Card style={{ height: '100%' }}>
                      <CardBody>
                        <CardTitle className="mb-4">Inspection</CardTitle>
                        <div className="containerImg" style={{ position: 'relative' }}>
                          <ResultDisplay
                            showresult={showresult}
                            response_message={response_message}
                            config_positive={config_positive}
                            config_negative={config_negative}
                            response_value={this.state.response_value}
                          />
                          {/* Render the webcam */}
                          <WebcamComponent
                            videoConstraints={videoConstraints}
                            showresult={showresult}
                            response_message={response_message}
                            config_positive={config_positive}
                            config_negative={config_negative}
                            config_posble_match={config_posble_match}
                          />
                          {/* ... Other components based on conditions ... */}
                          {/* <CountdownTimer ... /> */}
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  <Col lg={6} md={6} xs={6}>
                    <Card style={{ height: '100%' }}>
                      <CardBody>
                        <CardTitle className="mb-4">Reference Component</CardTitle>
                        {/* Render the Reference component */}
                        <ReferenceComponent datasets={datasets} getImage={getImage} />
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
                {/* ... Rest of the components ... */}
                {/* <SweetAlert ... /> */}
              </Container>
            </div>
          </React.Fragment>
        );
      }
}
Inspection.propTypes = {
    history: PropTypes.any.isRequired,
};

export default Inspection;

