import React, { Component } from "react";
import MetaTags from 'react-meta-tags';
import {
    Card,
    Col,
    Container,
    Row,
    CardBody,
    CardTitle,
    Label,
    Button,
    Form,
    Input,
    InputGroup,
    Table,
    Toast,
    ToastHeader,
    ToastBody,
    Spinner,
} from "reactstrap";
import axios from "axios";
import Webcam from "react-webcam";
import Countdown, { CountdownApi } from 'react-countdown';
import PropTypes from "prop-types"
import './index.css';
//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { css } from "@emotion/react"
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import CountdownTimer from "react-component-countdown-timer";
import SweetAlert from 'react-bootstrap-sweetalert';
// import 'antd/dist/antd.css';
import urlSocket from "../AdminInspection/urlSocket";
import { image_url } from '../AdminInspection/imageUrl';
let ImageUrl = image_url;

var _ = require('lodash');

let component_code1 = ""
let component_name1 = ""
let positive = ""
let negative = ""
let posble_match = ""
let config_positive = ""
let config_negative = ""
let config_posble_match = ""
let config_data = []
let counttimer = null
class Inspection extends Component {
    countdownApi = null;
    constructor(props) {
        super(props);
        this.state = {
            component_code: "",
            component_name: "",
            _id: '',
            img_url: '',
            response_message: "",
            res_message: "",
            response_msg: "",
            msg: "",
            mssg: "",
            comp_id: "",
            intervalId: '',
            auto_abort: "",
            qr_code: "",
            deviceId: "",
            showresult: false,
            manual_abort: false,
            showstatus: false,
            collection: null,
            show: false,
            timer: false,
            showdata: false,
            startCapture: true,
            show_timer: false,
            show_acc: false,
            loading: false,
            time_elapsed: false,
            extendTimer: false,
            timeExtend: false,
            datasets: [],
            config_data: [],
            comp_info: [],
            capture_duration: 10,
            testing_duration: 10,
            test_duration: null,
            tab: 0,
            count: 1,
            initvalue1: 1,
            initvalue2: 1,
            sample_count: '0',
            train_accuracy: '0',
            get_a: '0',
            get_b: '0',
            get_c: '0',
            get_d: '0',
            get_e: '0',
            get_f: '0',
            get_g: '0',
            get_h: '0',
            get_i: '0',
            date: Date.now() + 10000
        }
    }

    componentDidMount = () => {
        var compData = JSON.parse(sessionStorage.getItem("compData"))
        this.setState({ comp_info: compData })
        console.log('108', compData)
        // this.device_info()
        component_code1 = compData.component_code
        component_name1 = compData.component_name
        positive = compData.positive
        config_positive = compData.config_data[0].positive
        negative = compData.negative
        config_negative = compData.config_data[0].negative
        posble_match = compData.posble_match
        config_posble_match = compData.config_data[0].posble_match
        config_data = compData.config_data
        console.log('config_data', compData.batch_no, config_data)
        let test_duration = Number(config_data[0].train_acc_timer_per_sample) * Number(config_data[0].test_samples)
        console.log('test_duration', test_duration)
        this.showAlertTimer(parseInt(test_duration))
        console.log('comp_id123', compData._id)
        this.setState({ _id: compData._id, compData: compData, config_data: config_data, capture_duration: Number(config_data[0].countdown) })
        this.setState({ testing_duration: test_duration, show_timer: true })
        try {
            urlSocket.post('/batch_info', { 'comp_id': compData._id, 'comp_name': component_name1, 'comp_code': component_code1, 'batch_no': compData.batch_no, 'min_nof_test_sample': config_data[0].test_samples, 'inspect_type': config_data[0].inspection_type },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('data98', data)
                    this.setState({ batch_id: data })
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log('error', error)
        }
        let datasets = compData.datasets
        console.log(`datasets`, datasets)
        if (datasets === undefined || datasets.length === 0) {
            let comp_name = component_name1
            let comp_code = component_code1
            try {
                urlSocket.post('/comp_filterData', { 'comp_name': comp_name, 'comp_code': comp_code },
                    { mode: 'no-cors' })
                    .then((response) => {
                        let data = response.data
                        console.log(data)
                        let datasets = data[0].datasets
                        console.log(`object`, data[0].datasets)
                        this.setState({ data, datasets })
                    })
                    .catch((error) => {
                        console.log(error)
                    })
            } catch (error) {
            }
            this.setState({ component_name: component_name1, component_code: component_code1 })
        }
        else {
            this.setState({ component_name: component_name1, component_code: component_code1, datasets })
        }
        if (config_data[0].inspection_type === 'Manual') {
            this.cont_apiCall()
        }
        else {
            if (this.state.startCapture) {
                setTimeout(() => { this.appCall() }, 2000)
            }
        }
    };

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

    stopClick = () => {
        this.setState({ startCapture: false })
    }

    showAlertTimer = (test_duration) => {
        let second = test_duration - 20
        this.setState({ test_duration: second })
        //counttimer = setTimeout(() => {
        setTimeout(() => {
            this.setState({ extendTimer: true })
        }, second * 1000)
    }

    extendTimer = () => {
        console.log('first170')
        setTimeout(() => {
            this.setState({ show_timer: false })
        }, 1000)
        let test_duration = this.state.testing_duration
        setTimeout(() => {
            this.setState({ testing_duration: test_duration, show_timer: true })
        }, 1000)
        this.setState({ extendTimer: false })
        this.showAlertTimer(test_duration)
        //console.log('test_duration', test_duration)   
    }

    cont_apiCall = () => {
        this.setState({ showstatus: false, showresult: false })
        var i = 0;
        let intervalId = setInterval(() => {
            if (this.state.startCapture) {
                this.apiCall()
            }
            i++;
        }, 1000)
        this.setState({ intervalId });
    }

    apiCall = () => {
        let message = 'Place the object and press start'
        console.log('message', message)
        this.setState({ msg: message, show: true })
    }

    // handleClick = async (event) => {
    //     //event.preventDefault();
    //     var i = 0;
    //     setInterval(() => {
    //         if (this.state.startCapture) {
    //             this.APICall(event)
    //         }
    //         i++;
    //     }, 1000)
    // }

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

    object_detected = async (event) => {
        //console.log('first222', this.state.initvalue)
        if (this.state.manual_abort !== true && this.state.time_elapsed !== true) {
            let count = this.state.initvalue1++
            clearInterval(this.state.intervalId)
            this.setState({ show: false })
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
            console.log('posble_match246', posble_match)
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
            formData.append('batch_id', this.state.batch_id);
            formData.append('positive', vpositive);
            formData.append('negative', vnegative);
            formData.append('posble_match', vposble_match);
            formData.append('count', count);
            formData.append('datasets', blob, compdata + '.png')
            urlSocket.post('/object_detection', formData, {
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
                    this.setState({ res_message: response.data[0].status, showstatus: true })
                    setTimeout(() => {
                        this.setState({ res_message: "" })
                    }, 2000);

                    setTimeout(() => {
                        if (response.data[0].status === "Object Detected") {
                            console.log('inspected_id', inspected_id)
                            let Checking = "Checking ..."
                            this.setState({ res_message: Checking, showstatus: true })
                            setTimeout(() => {
                                this.setState({ res_message: Checking })
                            }, 1000);
                            if (this.state.config_data[0].qr_checking === true) {
                                console.log('first308', this.state.config_data[0].qr_checking)
                                // setTimeout(() => { this.qr_scanning(inspected_id) }, 1000)
                                // setTimeout(() => {
                                //     this.APCall(inspected_id, test_date, _today, time, this.state.batch_id)
                                // }, 2000);
                            }
                            // else{
                            setTimeout(() => {
                                this.APCall(inspected_id, test_date, _today, time, this.state.batch_id)
                            }, 2000);
                            // }
                        }
                        else {
                            this.cont_apiCall();
                        }
                    }, 3000)
                })
        }
    }

    qr_detected = async (event) => {
        //console.log('first222', this.state.initvalue)
        if (this.state.manual_abort !== true && this.state.time_elapsed !== true) {
            let count = this.state.initvalue1++
            clearInterval(this.state.intervalId)
            this.setState({ show: false })
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
            console.log('posble_match246', posble_match)
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
            formData.append('_id', this.state._id)
            formData.append('batch_id', this.state.batch_id);
            formData.append('positive', vpositive);
            formData.append('negative', vnegative);
            formData.append('posble_match', vposble_match);
            formData.append('count', count);
            formData.append('datasets', blob, compdata + '.png')
            urlSocket.post('/qr_detection', formData, {
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
                    this.setState({ res_message: response.data[0].status, showstatus: true })
                    setTimeout(() => {
                        this.setState({ res_message: "" })
                    }, 2000);

                    setTimeout(() => {
                        if (response.data[0].status === 'Data Found') {
                            console.log('inspected_id', inspected_id)
                            let Checking = "Checking ..."
                            this.setState({ res_message: Checking, showstatus: true })
                            setTimeout(() => {
                                this.setState({ res_message: Checking })
                            }, 1000);
                            if (this.state.config_data[0].qr_checking === true) {
                                console.log('first308', this.state.config_data[0].qr_checking)
                            }
                            // else{
                            setTimeout(() => {
                                this.qrAPCall(inspected_id, test_date, _today, time, this.state.batch_id)
                            }, 2000);
                            // }
                        }
                        else {
                            this.cont_apiCall();
                        }
                    }, 3000)
                })
        }
    }

    qr_btnidentity = async (event) => {
        //console.log('first222', this.state.initvalue)
        if (this.state.manual_abort !== true && this.state.time_elapsed !== true) {
            let count = this.state.initvalue1++
            clearInterval(this.state.intervalId)
            this.setState({ show: false })
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
            console.log('posble_match246', posble_match)
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
            formData.append('_id', this.state._id)
            formData.append('batch_id', this.state.batch_id);
            formData.append('positive', vpositive);
            formData.append('negative', vnegative);
            formData.append('posble_match', vposble_match);
            formData.append('count', count);
            formData.append('datasets', blob, compdata + '.png')
            urlSocket.post('/qr_adminInfo', formData, {
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
                    this.setState({ res_message: response.data[0].status, showstatus: true })
                    setTimeout(() => {
                        this.setState({ res_message: "" })
                    }, 2000);

                    setTimeout(() => {
                        if (response.data[0].status === 'New Data found') {
                            console.log('inspected_id', inspected_id)
                            let Checking = "Checking ..."
                            this.setState({ res_message: Checking, showstatus: true })
                            setTimeout(() => {
                                this.setState({ res_message: Checking })
                            }, 1000);
                            setTimeout(() => {
                                this.qrAPCall(inspected_id, test_date, _today, time, this.state.batch_id)
                            }, 2000);
                        }
                        else {
                            this.cont_apiCall();
                        }
                    }, 3000)
                })
        }
    }


    qrAPCall = async (data, inspected_ondate, date, time, batch_id) => {
        this.setState({ showstatus: false })
        if (this.state.manual_abort !== true && this.state.time_elapsed !== true) {
            console.log('inspected_data', data)
            console.log('inspected_ondate', inspected_ondate)
            console.log('date', date)
            console.log('time', time)
            console.log('batch_id', batch_id)
            console.log('qr_code', this.state.qr_code)
            try {
                urlSocket.post('/qr_testing', { '_id': data, 'inspected_ondate': inspected_ondate, 'date': date, 'time': time, 'batch_id': batch_id },
                    { mode: 'no-cors' })
                    .then((response) => {
                        let inspected_data = response.data
                        console.log("insp_data", inspected_data)
                        // this.setState({ response_msg: inspected_data.status, showresult: true })
                        this.setState({ collection: inspected_data[0]._id, response_message: inspected_data[0].result, response_value: inspected_data[0].match_percent, showresult: true })
                        if (this.state.response_message === 'No Objects Detected') {
                            this.cont_apiCall()
                        }
                        else {
                            console.log('success', response.data[0].result, response.data[0].match_percent);
                            //this.setState({ collection: inspected_data[0]._id, response_message: inspected_data[0].result, response_value: inspected_data[0].match_percent, showresult: true })
                            let testing_result = inspected_data[0].result
                            if (testing_result === positive) {
                                let positive = testing_result.replaceAll(inspected_data[0].result, config_positive)
                                this.setState({ collection: inspected_data[0]._id, response_message: positive, response_value: inspected_data[0].match_percent, showresult: true })
                            }
                            else if (testing_result === negative) {
                                let negative = testing_result.replaceAll(inspected_data[0].result, config_negative)
                                this.setState({ collection: inspected_data[0]._id, response_message: negative, response_value: inspected_data[0].match_percent, showresult: true })
                            }
                            else if (testing_result === posble_match) {
                                let posble_match = testing_result.replaceAll(inspected_data[0].result, config_posble_match)
                                this.setState({ collection: inspected_data[0]._id, response_message: posble_match, response_value: inspected_data[0].match_percent, showresult: true })
                            }
                        }
                    })
                    .catch((error) => {
                        console.log(error)
                    })
            } catch (error) {
            }
        }
    }

    APCall = async (data, inspected_ondate, date, time, batch_id) => {
        this.setState({ showstatus: false })
        if (this.state.manual_abort !== true && this.state.time_elapsed !== true) {
            console.log('inspected_data', data)
            console.log('inspected_ondate', inspected_ondate)
            console.log('date', date)
            console.log('time', time)
            console.log('batch_id', batch_id)
            console.log('qr_code', this.state.qr_code)
            try {
                urlSocket.post('/admin_testing', { '_id': data, 'inspected_ondate': inspected_ondate, 'date': date, 'time': time, 'batch_id': batch_id },
                    { mode: 'no-cors' })
                    .then((response) => {
                        let inspected_data = response.data
                        console.log("insp_data", inspected_data)
                        // this.setState({ response_msg: inspected_data.status, showresult: true })
                        this.setState({ collection: inspected_data[0]._id, response_message: inspected_data[0].result, response_value: inspected_data[0].match_percent, showresult: true })
                        if (this.state.response_message === 'No Objects Detected') {
                            this.cont_apiCall()
                        }
                        else {
                            console.log('success', response.data[0].result, response.data[0].match_percent);
                            //this.setState({ collection: inspected_data[0]._id, response_message: inspected_data[0].result, response_value: inspected_data[0].match_percent, showresult: true })
                            let testing_result = inspected_data[0].result
                            if (testing_result === positive) {
                                let positive = testing_result.replaceAll(inspected_data[0].result, config_positive)
                                this.setState({ collection: inspected_data[0]._id, response_message: positive, response_value: inspected_data[0].match_percent, showresult: true })
                            }
                            else if (testing_result === negative) {
                                let negative = testing_result.replaceAll(inspected_data[0].result, config_negative)
                                this.setState({ collection: inspected_data[0]._id, response_message: negative, response_value: inspected_data[0].match_percent, showresult: true })
                            }
                            else if (testing_result === posble_match) {
                                let posble_match = testing_result.replaceAll(inspected_data[0].result, config_posble_match)
                                this.setState({ collection: inspected_data[0]._id, response_message: posble_match, response_value: inspected_data[0].match_percent, showresult: true })
                            }
                            // this.setState({ response_message: response.data.status, response_value: parseFloat(response.data.value).toFixed(2), showresult: false })
                            // setTimeout(() => {
                            // this.setState({ response_message: "", response_value: ""})
                            // }, 2000);                         
                            // setTimeout(() => {
                            //     this.cont_apiCall()
                            // }, 2000);
                        }
                    })
                    .catch((error) => {
                        console.log(error)
                    })
            } catch (error) {
            }
        }
    }

    uniqness_checking = async () => {
        this.setState({ showdata: false })
        if (this.state.manual_abort !== true && this.state.time_elapsed !== true) {
            let count = this.state.initvalue1++
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
            formData.append('_id', this.state._id)
            formData.append('batch_id', this.state.batch_id);
            formData.append('positive', vpositive);
            formData.append('negative', vnegative);
            formData.append('posble_match', vposble_match);
            formData.append('count', count);
            formData.append('datasets', blob, compdata + '.png')
            urlSocket.post('/qr_adminInfo', formData, {
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
                    this.setState({ res_message: response.data[0].status, showstatus: true })
                    setTimeout(() => {
                        this.setState({ res_message: "" })
                    }, 2000);

                    setTimeout(() => {
                        if (response.data[0].status === 'New Data found') {
                            console.log('inspected_id', inspected_id)
                            let Checking = "Checking ..."
                            this.setState({ res_message: Checking, showstatus: true })
                            setTimeout(() => {
                                this.setState({ res_message: Checking })
                            }, 1000);
                            setTimeout(() => {
                                this.qr_resultCall(inspected_id, test_date, _today, time, this.state.batch_id)
                            }, 2000);
                        }
                        else {
                            this.appCall();
                        }
                    }, 3000)
                })
        }
    }

    uniq_object_detection = async () => {
        this.setState({ showdata: false })
        if (this.state.manual_abort !== true && this.state.time_elapsed !== true) {
            let count = this.state.initvalue1++
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
            formData.append('_id', this.state._id)
            formData.append('batch_id', this.state.batch_id);
            formData.append('positive', vpositive);
            formData.append('negative', vnegative);
            formData.append('posble_match', vposble_match);
            formData.append('count', count);
            formData.append('datasets', blob, compdata + '.png')
            urlSocket.post('https://172.16.1.91:5005/qr_detection', formData, {
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
                    this.setState({ res_message: response.data[0].status, showstatus: true })
                    setTimeout(() => {
                        this.setState({ res_message: "" })
                    }, 2000);

                    setTimeout(() => {
                        if (response.data[0].status === 'Data Found') {
                            console.log('inspected_id', inspected_id)
                            let Checking = "Checking ..."
                            this.setState({ res_message: Checking, showstatus: true })
                            setTimeout(() => {
                                this.setState({ res_message: Checking })
                            }, 1000);
                            setTimeout(() => {
                                this.qr_resultCall(inspected_id, test_date, _today, time, this.state.batch_id)
                            }, 2000);
                        }
                        else {
                            this.appCall();
                        }
                    }, 3000)
                })
        }
    }

    onTimeupCourse = () => {
        this.setState({ timer: true })
        //this.object_detection()
        if (this.state.config_data[0].qr_checking === true) {
            if (this.state.config_data[0].qr_uniq_checking === true) {
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

    onTimeup = () => {
        this.setState({ startcapture: false, show: false, show_timer: false, timeExtend: true })
        // this.abortTesting()
    }

    timerExtention = async () => {
        // if (counttimer) {
        //     clearTimeout(counttimer)
        //   }
        this.setState({ timeExtend: false })
        let test_duration = this.state.testing_duration
        this.setState({ testing_duration: test_duration, show_timer: true })
        console.log('test_duration', test_duration)
    }

    abortTesting = async (event) => {
        this.setState({ timeExtend: false })
        console.log('batch_id', this.state.batch_id)
        this.setState({ startcapture: false, show: false, showdata: false })
        let batch_id = this.state.batch_id
        let comp_data = this.state.comp_info
        let comp_name = comp_data.component_name
        let comp_code = comp_data.component_code
        positive = comp_data.positive
        console.log('positive', positive)
        negative = comp_data.negative
        console.log('negative', negative)
        posble_match = comp_data.posble_match
        console.log('posble_match380', posble_match)
        try {
            urlSocket.post('/abort', { 'batch_id': batch_id, 'comp_name': comp_name, 'comp_code': comp_code, 'positive': positive, 'negative': negative, 'posble_match': posble_match },
                { mode: 'no-cors' })
                .then((response) => {
                    let aborted_data = response.data
                    console.log("aborted_data_326", aborted_data)
                    this.setState({ auto_abort: aborted_data, time_elapsed: true, startcapture: false, show: false, showdata: false })
                    //this.navigation()
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
        }
    }

    manual_abortTesting = async (event) => {
        this.setState({ startcapture: false, show: false, showdata: false, showstatus: false, showresult: false })
        console.log('batch_id', this.state.batch_id)
        let batch_id = this.state.batch_id
        let comp_data = this.state.comp_info
        let comp_name = comp_data.component_name
        let comp_code = comp_data.component_code
        positive = comp_data.positive
        negative = comp_data.negative
        posble_match = comp_data.posble_match
        console.log('posble_match407', posble_match)
        try {
            urlSocket.post('/manual_abort', { 'batch_id': batch_id, 'comp_name': comp_name, 'comp_code': comp_code, 'positive': positive, 'negative': negative, 'posble_match': posble_match },
                { mode: 'no-cors' })
                .then((response) => {
                    let aborted_data = response.data
                    console.log("aborted_data_326", aborted_data)
                    this.setState({ auto_abort: aborted_data, manual_abort: true, startcapture: false, show: false, showdata: false })
                    //this.navigation()
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
        }
    }

    appCall = () => {
        this.setState({ startCapture: true, timer: true, showstatus: false, showresult: false })
        let message = 'Place the object'
        console.log('message', message)
        this.setState({ mssg: message, showdata: true })
    }

    object_detection = async (event) => {
        //console.log('first360', this.state.initvalue)
        this.setState({ showdata: false })
        if (this.state.manual_abort !== true && this.state.time_elapsed !== true) {
            let count = this.state.initvalue1++
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
            formData.append('batch_id', this.state.batch_id);
            formData.append('positive', vpositive);
            formData.append('negative', vnegative);
            formData.append('posble_match', vposble_match);
            formData.append('count', count);
            formData.append('datasets', blob, compdata + '.png')
            urlSocket.post('/object_detection', formData, {
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
                    this.setState({ res_message: response.data[0].status, showstatus: true })
                    setTimeout(() => {
                        this.setState({ res_message: "" })
                    }, 2000);

                    setTimeout(() => {
                        if (response.data[0].status === "Object Detected") {
                            console.log('inspected_id', inspected_id)
                            let Checking = "Checking ..."
                            this.setState({ res_message: Checking, showstatus: true })
                            setTimeout(() => {
                                this.setState({ res_message: Checking })
                            }, 1000);
                            // if (this.state.config_data[0].qr_checking === true) {
                            //     console.log('first308', this.state.config_data[0].qr_checking)
                            //     setTimeout(() => { this.qr_scanning(inspected_id) }, 1000)
                            // }
                            setTimeout(() => {
                                this.resultCall(inspected_id, test_date, _today, time, this.state.batch_id)
                            }, 2000);
                        }
                        else {
                            this.appCall();
                        }
                    }, 3000)
                })
        }
    }

    qr_resultCall = async (data, inspected_ondate, date, time, batch_id) => {
        this.setState({ showstatus: false })
        if (this.state.manual_abort !== true && this.state.time_elapsed !== true) {
            console.log('inspected_data', data)
            console.log('inspected_ondate', inspected_ondate)
            console.log('date', date)
            console.log('time', time)
            console.log('batch_id', batch_id)
            console.log('qr_code', this.state.qr_code)

            try {
                urlSocket.post('/qr_testing', { '_id': data, 'inspected_ondate': inspected_ondate, 'date': date, 'time': time, 'batch_id': batch_id },
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
                            console.log('success', response.data[0].result, response.data[0].match_percent);
                            let testing_result = inspected_data[0].result
                            if (testing_result === positive) {
                                let positive = testing_result.replaceAll(testing_result, config_positive)
                                this.setState({ collection: inspected_data[0]._id, response_message: positive, response_value: inspected_data[0].match_percent, showresult: true })
                            }
                            else if (testing_result === negative) {
                                let negative = testing_result.replaceAll(testing_result, config_negative)
                                this.setState({ collection: inspected_data[0]._id, response_message: negative, response_value: inspected_data[0].match_percent, showresult: true })
                            }
                            else if (testing_result === posble_match) {
                                let posble_match = testing_result.replaceAll(testing_result, config_posble_match)
                                console.log('posbl_match563', posble_match)
                                this.setState({ collection: inspected_data[0]._id, response_message: posble_match, response_value: inspected_data[0].match_percent, showresult: true })
                            }
                            //this.setState({ collection: inspected_data[0]._id, response_message: inspected_data[0].result, response_value: inspected_data[0].match_percent, showresult: true })
                        }
                    })
                    .catch((error) => {
                        console.log(error)
                    })
            } catch (error) {
                console.log(error)
            }
        }
    }

    resultCall = async (data, inspected_ondate, date, time, batch_id) => {
        this.setState({ showstatus: false })
        if (this.state.manual_abort !== true && this.state.time_elapsed !== true) {
            console.log('inspected_data', data)
            console.log('inspected_ondate', inspected_ondate)
            console.log('date', date)
            console.log('time', time)
            console.log('batch_id', batch_id)
            //console.log('qr_code', this.state.qr_code)

            try {
                urlSocket.post('/admin_testing', { '_id': data, 'inspected_ondate': inspected_ondate, 'date': date, 'time': time, 'batch_id': batch_id },
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
                            console.log('success', response.data[0].result, response.data[0].match_percent);
                            let testing_result = inspected_data[0].result
                            if (testing_result === positive) {
                                let positive = testing_result.replaceAll(testing_result, config_positive)
                                this.setState({ collection: inspected_data[0]._id, response_message: positive, response_value: inspected_data[0].match_percent, showresult: true })
                            }
                            else if (testing_result === negative) {
                                let negative = testing_result.replaceAll(testing_result, config_negative)
                                this.setState({ collection: inspected_data[0]._id, response_message: negative, response_value: inspected_data[0].match_percent, showresult: true })
                            }
                            else if (testing_result === posble_match) {
                                let posble_match = testing_result.replaceAll(testing_result, config_posble_match)
                                console.log('posbl_match563', posble_match)
                                this.setState({ collection: inspected_data[0]._id, response_message: posble_match, response_value: inspected_data[0].match_percent, showresult: true })
                            }
                            //this.setState({ collection: inspected_data[0]._id, response_message: inspected_data[0].result, response_value: inspected_data[0].match_percent, showresult: true })
                        }
                    })
                    .catch((error) => {
                        console.log(error)
                    })
            } catch (error) {
                console.log(error)
            }
        }
    }

    agree_not = (data, datas, batch_id, result) => {
        let comp_data = this.state.comp_info
        positive = comp_data.positive
        console.log('positive', positive)
        negative = comp_data.negative
        console.log('negative', negative)
        posble_match = comp_data.posble_match
        console.log('posble_match545', posble_match)
        let comp_name = component_name1
        let comp_code = component_code1
        //let count = this.state.initvalue
        console.log('batch_id479', batch_id)
        try {
            urlSocket.post('/agree_not', { '_id': data, 'agree': datas, 'batch_id': batch_id, 'comp_name': comp_name, 'comp_code': comp_code, 'positive': positive, 'negative': negative, 'result': result, 'posble_match': posble_match },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('config_data485', data)
                    let summary_ok = _.map(data, function (o) {
                        if (o.result == positive)
                            return o;
                    });
                    summary_ok = _.without(summary_ok, undefined)
                    console.log('summary', summary_ok)
                    if (summary_ok.length !== 0) {
                        this.setState({ get_a: summary_ok[0].ok, get_d: summary_ok[0].agree, get_g: summary_ok[0].disagree })
                    }
                    let summary_notok = _.map(data, function (o) {
                        if (o.result == negative)
                            return o;
                    });
                    summary_notok = _.without(summary_notok, undefined)
                    console.log('summary', summary_notok)
                    if (summary_notok.length !== 0) {
                        this.setState({ get_b: summary_notok[0].notok, get_e: summary_notok[0].agree, get_h: summary_notok[0].disagree })
                    }
                    let summary_posbl_match = _.map(data, function (o) {
                        if (o.result == posble_match)
                            return o;
                    });
                    summary_posbl_match = _.without(summary_posbl_match, undefined)
                    if (summary_posbl_match.length !== 0) {
                        this.setState({ get_c: summary_posbl_match[0].posbl_match, get_f: summary_posbl_match[0].qc_ok, get_i: summary_posbl_match[0].qc_notok })
                    }
                    let train_acc = ((Number(this.state.get_d) + Number(this.state.get_e)) / Number(this.state.sample_count)) * 100
                    this.setState({ train_accuracy: train_acc, show_acc: true })
                    if (this.state.config_data[0].inspection_type === 'Manual') {
                        if (Number(this.state.sample_count) !== Number(this.state.config_data[0].test_samples)) {
                            this.cont_apiCall()
                        }
                        else if (Number(this.state.sample_count) === Number(this.state.config_data[0].test_samples)) {
                            if ((((Number(this.state.get_d) + Number(this.state.get_e)) / this.state.config_data[0].test_samples) * 100) !== 100) {
                                //console.log('first555', this.state.get_d, this.state.get_e, this.state.config_data[0].test_samples)
                                this.callapiLog(this.state.config_data[0].test_samples, this.state.sample_count, this.state.config_data[0].positive, this.state.config_data[0].negative, this.state.config_data[0].posble_match)
                                this.trainClick()
                            }
                            else {
                                this.callapiLog(this.state.config_data[0].test_samples, this.state.sample_count, this.state.config_data[0].positive, this.state.config_data[0].negative, this.state.config_data[0].posble_match)
                            }
                        }
                    }
                    else {
                        if (Number(this.state.sample_count) !== Number(this.state.config_data[0].test_samples)) {
                            this.appCall()
                        }
                        else if (Number(this.state.sample_count) === Number(this.state.config_data[0].test_samples)) {
                            if ((((Number(this.state.get_d) + Number(this.state.get_e)) / this.state.config_data[0].test_samples) * 100) !== 100) {
                                //console.log('first555', this.state.get_d, this.state.get_e, this.state.config_data[0].test_samples)
                                this.callapiLog(this.state.config_data[0].test_samples, this.state.sample_count, this.state.config_data[0].positive, this.state.config_data[0].negative, this.state.config_data[0].posble_match)
                                this.trainClick()
                            }
                            else {
                                this.callapiLog(this.state.config_data[0].test_samples, this.state.sample_count, this.state.config_data[0].positive, this.state.config_data[0].negative, this.state.config_data[0].posble_match)
                            }
                        }
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }

    callapiLog = async (data, datas, positive, negative, posble_match) => {
        let comp_name = component_name1
        let comp_code = component_code1
        try {
            urlSocket.post('/callapiLog', { 'comp_name': comp_name, 'comp_code': comp_code, 'test_samples': data, 'sample_count': datas, 'positive': positive, 'negative': negative, 'posble_match': posble_match, 'ok': this.state.get_a, 'notok': this.state.get_b, 'agree_ok': this.state.get_d, 'agree_notok': this.state.get_e, 'disagree_ok': this.state.get_g, 'disagree_notok': this.state.get_h, 'possible_match': this.state.get_c, 'ok_possible': this.state.get_f, 'notok_possible': this.state.get_i, 'accuracy': this.state.train_accuracy },
                { mode: 'no-cors' })
                .then((response) => {
                    let inspected_data = response.data
                    console.log("insp_data", inspected_data)
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log(error)
        }
    }

    ask_show = async (data) => {
        let count_value = this.state.initvalue2++
        console.log('yes', data, this.state.sample_count, count_value)
        this.setState({ response_message: '', sample_count: count_value })
        if (data === 'yes') this.agree_not(this.state.collection, data, this.state.batch_id, this.state.response_message);
        else this.agree_not(this.state.collection, data, this.state.batch_id, this.state.response_message);
    }

    navigate = () => {
        this.setState({ startcapture: false })
        const { history } = this.props
        console.log(this.props)
        history.push("/crudcomponent")
    }

    trainClick = async (event) => {
        let comp_data = this.state.comp_info
        positive = comp_data.positive
        negative = comp_data.negative
        console.log("real1", positive)
        console.log("fake1", negative)
        const formData = new FormData();
        let component_code = component_code1
        let component_name = component_name1
        formData.append('comp_name', component_name);
        formData.append('comp_code', component_code);
        formData.append('positive', positive)
        formData.append('negative', negative)
        urlSocket.post('/re_train', formData, {
            headers: {
                'content-type': 'multipart/form-data'
            },
            mode: 'no-cors'
        })
            .then(response => {
                console.log('success', response.data);
            })
            .catch(error => {
                console.log('error', error);
            })
    }

    navigateto = () => {
        let comp_id = this.state._id
        let comp_name = component_name1
        let comp_code = component_code1

        let comp_ver = this.state.compData.comp_ver
        let mod_ver = this.state.compData.mod_ver

        // if(this.state.compData[0].trained_version !== 0 ){
        //     trained_version = this.state.compData[0].trained_version
        // }

        try {
            urlSocket.post('/status_change', { '_id': comp_id, 'comp_name': comp_name, 'comp_code': comp_code, 'status': 'admin approved trained model', 'comp_ver': comp_ver, 'mod_ver': mod_ver },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('approved', data)
                    this.setState({ startCapture: false })
                    const { history } = this.props
                    console.log(this.props)
                    history.push("/crudcomponent")
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }

    navigation = () => {
        this.setState({ startcapture: false, show: false })
        let comp_id = this.state._id
        console.log('comp_id', comp_id)
        let comp_name = component_name1
        let comp_code = component_code1
        try {
            urlSocket.post('/status_update', { '_id': comp_id, 'comp_name': comp_name, 'comp_code': comp_code, 'status': 'training completed' },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('approved', data)
                    this.setState({ startCapture: false })
                    const { history } = this.props
                    console.log(this.props)
                    history.push("/crudcomponent")
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }

    getImage = (data1) => {
        if (data1 !== undefined) {
            console.log('data1', data1)
            let baseurl = ImageUrl
            let data2 = data1.filter((data) => {
                return data.type === 'OK'
            })
            let output = ""
            if (data2.length > 0) {
                console.log('first598', data2[0].image_path)
                let replace = data2[0].image_path.replaceAll("\\", "/");
                let result = replace
                output = baseurl + result
            }
            return output
        }
        else {
            return null
        }
    }

    // getImage = (image_path, type) => {
    //     console.log(`image_path1232`, image_path, type)
    //     if (image_path === undefined) {
    //         return ""
    //     }
    //     let baseurl = 'https://172.16.1.91:8000/'
    //     let output = ''
    //     if (type === 'OK') {
    //         let result = image_path.replaceAll("\\", "/");
    //         //console.log(`result`, result)
    //         output = baseurl + result
    //     }
    //     return output
    // }

    // getImage = (data1) => {
    //     if (data1 !== undefined) {
    //         console.log('data1', data1)
    //         let baseurl = 'https://172.16.1.91:8000/'
    //         let data2 = data1.filter((data)=>{
    //             return data.type === 'OK'
    //         })
    //         let replace = data2[0].image_path.replaceAll("\\", "/");
    //         let result = replace
    //         let output = baseurl + result
    //         return output
    //     }
    //     else {
    //         return null
    //     }
    // }

    render() {
        const videoConstraints = {
            facingMode: "user"
        };
        const override = css`display: block; margin: 0 auto; border-color: red;`;
        return (
            <React.Fragment>
                <div className="page-content">
                    <MetaTags>
                        <title>Form Layouts | Skote - React Admin & Dashboard Template</title>
                    </MetaTags>

                    <Container fluid={true}>
                        <Breadcrumbs title="Forms" breadcrumbItem="Form Layouts" />
                        <Row>
                            <Col lg={6}>
                                <Card>
                                    <CardBody>
                                        <CardTitle className="mb-4">
                                            <Row>
                                                <Col md={3}>
                                                    Accuracy Testing
                                                </Col>
                                                <Col md={1}>
                                                    <Button color="primary" onClick={() => this.manual_abortTesting()}>Abort</Button>
                                                </Col>
                                                <Col md={3}>
                                                    {
                                                        this.state.extendTimer ?
                                                            <Button color="primary" onClick={() => this.extendTimer()}>Extend Timer</Button> : null
                                                    }
                                                </Col>
                                                <Col md={5} style={{ textAlign: 'right' }}>
                                                    <Row style={{ textAlign: 'right' }}>
                                                        <Col md={6} style={{ textAlign: 'right', paddingTop: '17px' }}>Time to complete:</Col>
                                                        <Col md={6} style={{ textAlignLast: 'center' }}>
                                                            {
                                                                this.state.show_timer ?
                                                                    this.state.config_data.map((data, index) => (
                                                                        <div key={index}>
                                                                            {
                                                                                Number(this.state.sample_count) !== Number(data.test_samples) === true &&
                                                                                <CountdownTimer backgroundColor="#e6e46f" className="mt-2" size={28} hideDay={true} hideHours={false} count={this.state.testing_duration} onEnd={() => { this.onTimeup() }} />
                                                                            }
                                                                        </div>)) : null
                                                            }
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={12} style={{ textAlign: 'right' }}>
                                                    {
                                                        this.state.config_data.map((data, index) => (
                                                            // this.state.show ?
                                                            <div key={index}>
                                                                <Label>
                                                                    Sample completed: {this.state.sample_count} / {data.test_samples}
                                                                </Label>
                                                            </div>
                                                            // : null
                                                        ))
                                                    }
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={12} style={{ textAlign: 'right' }}>
                                                    {
                                                        this.state.show_acc ?
                                                            // Number(this.state.train_accuracy) !== 100?
                                                            <div style={{
                                                                color:
                                                                    this.state.train_accuracy === 100.00 === true ? 'green' :
                                                                        this.state.train_accuracy !== 100.00 === true ? 'red' :
                                                                            null
                                                            }}>
                                                                Training accuracy: {parseFloat(this.state.train_accuracy).toFixed(2)}%
                                                                {/* {this.state.train_accuracy} */}
                                                            </div> : null
                                                    }
                                                </Col>
                                            </Row>

                                        </CardTitle>
                                        <div className="containerImg">
                                            <div className="centered mt-4" >
                                                {
                                                    this.state.show ?
                                                        <div style={{
                                                            color:
                                                                this.state.msg === "Place the object and press start" ? 'white' :
                                                                    null
                                                        }}>
                                                            {this.state.msg}
                                                        </div> : null
                                                }
                                                {
                                                    this.state.showdata ?
                                                        <div style={{
                                                            color:
                                                                this.state.mssg === "Place the object" ? 'white' :
                                                                    null
                                                        }}>
                                                            {this.state.mssg}
                                                        </div> : null
                                                }
                                                {
                                                    this.state.showstatus ?
                                                        <div style={{
                                                            color:
                                                                this.state.res_message === "Object Detected" ? 'lightgreen' :
                                                                    this.state.res_message === "No Object Found" ? 'yellow' :
                                                                        this.state.res_message === "Checking ..." ? 'lightyellow' :
                                                                            null
                                                        }}>
                                                            {this.state.res_message}
                                                        </div> : null
                                                }
                                                {
                                                    this.state.showresult ?
                                                        <div style={{
                                                            // background: "white",
                                                            color:
                                                                this.state.response_message === "No Objects Detected" ? 'red' :
                                                                    this.state.response_message === config_positive ? 'lightgreen' :
                                                                        this.state.response_message === config_negative ? 'red' :
                                                                            this.state.response_message === config_posble_match ? 'orange' :
                                                                                null
                                                        }}>
                                                            <br />
                                                            Result: {this.state.response_message}{" "}{this.state.response_value}
                                                        </div>
                                                        : null
                                                }
                                                {
                                                    this.state.showresult ?
                                                        <div className="containerImg" >
                                                            <div>
                                                                {
                                                                    this.state.response_message === config_positive &&
                                                                    <div className="align-self-bottom">
                                                                        <CheckCircleOutlined style={{ fontSize: '80px' }} />
                                                                    </div>
                                                                }
                                                            </div>
                                                            {
                                                                this.state.response_message === config_negative &&
                                                                <div className="align-self-bottom">
                                                                    <CloseCircleOutlined style={{ color: 'red', fontSize: '80px' }} />
                                                                    {/* <Button className="me-2" color="success" onClick={() => this.acceptClick()} > Yes </Button> */}
                                                                </div>
                                                            }
                                                        </div>
                                                        : null
                                                }
                                                <div className="containerImg" >
                                                    <div>
                                                        {
                                                            this.state.showdata ?
                                                                <CountdownTimer backgroundColor="#f1f1f1" className="mt-2" hideDay={true} hideHours={true} count={this.state.capture_duration} onEnd={() => { this.onTimeupCourse() }} /> : null
                                                        }
                                                    </div>
                                                </div>
                                            </div>

                                            <Webcam
                                                videoConstraints={videoConstraints}
                                                audio={false}
                                                height={'auto'}
                                                screenshotFormat="image/png"
                                                width={'100%'}
                                                ref={node => this.webcam = node}
                                            />
                                        </div>
                                        <Row>
                                            <Col md={6}>
                                                {
                                                    this.state.config_data.map((data, index) => (
                                                        data.inspection_type === "Manual" && this.state.show ?
                                                            <div key={index}>
                                                                {
                                                                    data.qr_checking ?
                                                                        <div>
                                                                            {
                                                                                data.qr_uniq_checking ?
                                                                                    <Button color="primary" onClick={() => this.qr_btnidentity()}>Start</Button> :
                                                                                    <Button color="primary" onClick={() => this.qr_detected()}>Start</Button>
                                                                            }
                                                                        </div> :
                                                                        <Button color="primary" onClick={() => this.object_detected()}>Start</Button>
                                                                }
                                                            </div> : null
                                                    ))
                                                }
                                            </Col>

                                            {/* <Col md={6} style={{ textAlign: 'right' }}>
                                                {
                                                    this.state.config_data.map((data, index) => (
                                                        Number(this.state.sample_count) === Number(data.test_samples) === true &&
                                                        <div key={index}>
                                                            <Label>
                                                                training accuracy percentage : {(this.state.agree_count / data.test_samples) * 100}
                                                            </Label>
                                                        </div>
                                                    ))
                                                }
                                            </Col> */}
                                        </Row>
                                        {
                                            // this.state.config_data.map((data, index) => (
                                            //     data.test_samples === this.state.sample_count && 
                                            //         <div key={index}>
                                            //             {
                                            //                 console.log('calc', this.state.sample_count / data.test_samples)
                                            //             }
                                            //             <Button color="primary">
                                            //             {this.state.sample_count/data.test_samples}
                                            //             </Button>
                                            //             {/* <Button color="primary" onClick={() => this.object_detected()}>Start</Button> */}
                                            //         </div>
                                            // ))
                                        }
                                        {/* <Button color="primary" onClick={() => this.object_detected()}>Start</Button> */}
                                    </CardBody>
                                </Card>
                            </Col>

                            <Col lg={6}>
                                <Card>
                                    <CardBody>
                                        <CardTitle className="mb-4">Reference Component</CardTitle>
                                        <label>Component Name: {this.state.component_name}</label> {" , "}
                                        <label>Component Code: {this.state.component_code}</label>
                                        <br />
                                        <div>
                                            <Row>
                                                {
                                                    <img src={this.state.datasets === undefined ? "" : this.state.datasets.length !== 0 ? this.getImage(this.state.datasets) : ""} />

                                                    // this.state.datasets.map((data, index) => (
                                                    //     this.getImage(data.image_path, data.type) !== "" &&
                                                    //     index === 0 && <Col key={index}>
                                                    //         <img src={this.getImage(data.image_path, data.type)} />
                                                    //     </Col>
                                                    // ))
                                                }
                                            </Row>
                                            {/* <img src={this.state.img_url} width="100%" /> */}
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </Container>

                    {
                        this.state.time_elapsed ?
                            // this.state.alertmsg ?
                            <SweetAlert
                                //title="Abort - Time Elapsed"
                                title="Abort"
                                confirmBtnText="Ok"
                                onConfirm={() => this.navigation()}
                                closeOnClickOutside={false}
                                style={{ zIndex: 998 }}
                            >
                                <div style={{ fontSize: '22px' }}>
                                    Testing process aborted
                                </div>
                            </SweetAlert> : null
                    }
                    {
                        this.state.manual_abort ?
                            // this.state.alertmsg ?
                            <SweetAlert
                                showCancel
                                title="Abort - User Request"
                                cancelBtnBsStyle="success"
                                confirmBtnText="Yes"
                                cancelBtnText="No"
                                onConfirm={() => this.navigation()}
                                onCancel={() => this.setState({
                                    manual_abort: false
                                })}
                                closeOnClickOutside={false}
                                style={{ zIndex: 997 }}
                            >
                                <div style={{ fontSize: '22px' }}>
                                    This will stop the testing process
                                </div>
                                <div style={{ fontSize: '22px' }}>
                                    Do you want stop the testing?
                                </div>
                            </SweetAlert> : null
                    }
                    {
                        this.state.response_message === config_positive &&
                        this.state.manual_abort !== true && this.state.time_elapsed !== true &&
                        <SweetAlert
                            showCancel
                            title=""
                            cancelBtnBsStyle="danger"
                            cancelBtnText="No"
                            confirmBtnText="Yes"
                            onConfirm={() => this.ask_show('yes')}
                            onCancel={() => this.ask_show('no')}
                            closeOnClickOutside={false}
                            style={{ zIndex: 996 }}
                        >
                            <div style={{
                                fontSize: '20px',
                                color:
                                    this.state.response_message === config_positive ? 'green' :
                                        null
                            }}>
                                Result: {this.state.response_message}{" "}{this.state.response_value} <CheckCircleOutlined style={{ fontSize: '40px' }} />
                            </div>
                            <div style={{ fontSize: '22px' }}>
                                Do you agree with the result?
                            </div>
                        </SweetAlert>
                    }
                    {
                        this.state.response_message === config_negative &&
                        this.state.manual_abort !== true && this.state.time_elapsed !== true &&
                        // this.state.alertmsg ?
                        <SweetAlert
                            showCancel
                            title=""
                            cancelBtnBsStyle="danger"
                            cancelBtnText="No"
                            confirmBtnText="Yes"
                            onConfirm={() => this.ask_show('yes')}
                            onCancel={() => this.ask_show('no')}
                            closeOnClickOutside={false}
                            style={{ zIndex: 995 }}
                        >
                            <div style={{
                                fontSize: '20px',
                                color:
                                    this.state.response_message === config_negative ? 'red' :
                                        null
                            }}>
                                Result: {this.state.response_message}{" "}{this.state.response_value} <CloseCircleOutlined style={{ fontSize: '40px' }} />
                            </div>
                            <div style={{ fontSize: '22px' }}>
                                Do you agree with the result?
                            </div>
                        </SweetAlert>
                    }
                    {
                        this.state.response_message === config_posble_match &&
                        this.state.manual_abort !== true && this.state.time_elapsed !== true &&
                        // this.state.alertmsg ?
                        <SweetAlert
                            showCancel
                            title=""
                            cancelBtnBsStyle="danger"
                            cancelBtnText="Not ok"
                            confirmBtnText="Ok"
                            onConfirm={() => this.ask_show('yes')}
                            onCancel={() => this.ask_show('no')}
                            closeOnClickOutside={false}
                            style={{ zIndex: 994 }}
                        >
                            <div style={{
                                fontSize: '20px',
                                color:
                                    this.state.response_message === config_posble_match ? 'orange' :
                                        null
                            }}>
                                Result: {this.state.response_message}{" "}{this.state.response_value}
                            </div>
                            <div style={{ fontSize: '22px' }}>
                                System is unable to exactly classify this sample. Please choose your result
                            </div>
                        </SweetAlert>
                    }
                    {
                        this.state.config_data.map((data, index) => (
                            Number(this.state.sample_count) === Number(data.test_samples) === true &&
                            (((Number(this.state.get_d) + Number(this.state.get_e)) / data.test_samples) * 100) !== 100 &&
                            this.state.manual_abort !== true && this.state.time_elapsed !== true &&
                            // parseFloat(((Number(this.state.get_d) + Number(this.state.get_e)) / data.test_samples) * 100).toFixed(2) !== 100.00 &&
                            <div key={index}>
                                <SweetAlert
                                    title=""
                                    confirmBtnText="Ok"
                                    onConfirm={() => this.navigate()}
                                    style={{ zIndex: 993 }}
                                >
                                    <div>
                                        Total tested samples: {data.test_samples}
                                    </div>{" "}
                                    <Label>
                                        Training accuracy result
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
                                                    <td>{this.state.get_a}</td>
                                                    <td>{this.state.get_b}</td>
                                                </tr>
                                                <tr>
                                                    <th>Agreed by Qc</th>
                                                    <td>{this.state.get_d}</td>
                                                    <td>{this.state.get_e}</td>
                                                </tr>
                                                <tr>
                                                    <th>Disagreed byn Qc</th>
                                                    <td>{this.state.get_g}</td>
                                                    <td>{this.state.get_h}</td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </div>
                                    <div>{data.posble_match}: {this.state.get_c} </div>
                                    <div>
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
                                                    <th>Qc Selection</th>
                                                    <td>{this.state.get_f}</td>
                                                    <td>{this.state.get_i}</td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </div>
                                    <Label style={{ color: 'red', fontSize: '18px' }}>
                                        Training accuracy: {parseFloat(((Number(this.state.get_d) + Number(this.state.get_e)) / data.test_samples) * 100).toFixed(2)} %, {" "}
                                    </Label>
                                    <Label>
                                        {" Since accuracy is not equal to 100% based on QC's response, system will retrain the model for this component using the 'disagreed' samples to improve accuracy."}
                                    </Label>
                                    {/* Since accuracy is not 100%, model need to be trained again. Press retrain button below to proceed. */}
                                </SweetAlert>
                            </div>
                        ))
                    }

                    {
                        this.state.config_data.map((data, index) => (
                            Number(this.state.sample_count) === Number(data.test_samples) === true &&
                            //parseFloat(((Number(this.state.get_d) + Number(this.state.get_e)) / data.test_samples) * 100).toFixed(2) === 100.00 &&
                            (((Number(this.state.get_d) + Number(this.state.get_e)) / data.test_samples) * 100) === 100 &&
                            this.state.manual_abort !== true && this.state.time_elapsed !== true &&
                            <div key={index}>
                                <SweetAlert
                                    title=""
                                    confirmBtnText="ok"
                                    onConfirm={() => this.navigateto()}
                                    style={{ zIndex: 992 }}
                                >
                                    <div>
                                        Total tested samples: {data.test_samples}
                                    </div>
                                    <Label>
                                        Training accuracy result
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
                                                    <td>{this.state.get_a}</td>
                                                    <td>{this.state.get_b}</td>
                                                </tr>
                                                <tr>
                                                    <th>Agreed by Qc</th>
                                                    <td>{this.state.get_d}</td>
                                                    <td>{this.state.get_e}</td>
                                                </tr>
                                                <tr>
                                                    <th>Disagreed by Qc</th>
                                                    <td>{this.state.get_g}</td>
                                                    <td>{this.state.get_h}</td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </div>
                                    <div>{data.posble_match}: {this.state.get_c} </div>
                                    <div>
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
                                                    <th>Qc Selection</th>
                                                    <td>{this.state.get_f}</td>
                                                    <td>{this.state.get_i}</td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </div>
                                    <Label style={{ color: 'green', fontSize: '18px' }}>
                                        Training accuracy: {((Number(this.state.get_d) + Number(this.state.get_e)) / data.test_samples) * 100}%, {" "}
                                    </Label>
                                    <Label>
                                        Model is ready for deployment.
                                    </Label>

                                </SweetAlert>
                            </div>
                        ))
                    }
                    {
                        this.state.timeExtend ?
                            <SweetAlert
                                showCancel
                                title="Do you want to extend the timer?"
                                confirmBtnText="Yes"
                                cancelBtnText="No"
                                onConfirm={() => this.timerExtention()}
                                onCancel={() => this.abortTesting()}
                                closeOnClickOutside={false}
                                style={{ zIndex: 999 }}
                            >
                            </SweetAlert> : null
                    }

                    {/* {                      
                        this.state.config_data.map((data, index) => (
                            <div key={index}>
                                {
                                    Number(this.state.sample_count) === Number(data.test_samples) === true &&
                                    this.callapiLog(data.test_samples, this.state.sample_count)
                                }
                            </div>))
                    } */}
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



