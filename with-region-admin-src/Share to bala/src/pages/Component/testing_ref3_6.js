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
} from "reactstrap";
import axios from "axios";
import Webcam from "react-webcam";
import PropTypes from "prop-types"
import './index.css';
//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { css } from "@emotion/react"
import { ClockLoader, MoonLoader } from "react-spinners"
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import CountdownTimer from "react-component-countdown-timer";
import { Popconfirm } from 'antd'
import SweetAlert from 'react-bootstrap-sweetalert';
import 'antd/dist/antd.css';
import { size, truncate } from "lodash";

var _ = require('lodash');

let component_code1 = ""
let component_name1 = ""
let positive = ""
let negative = ""
let config_data = []
class Inspection extends Component {
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
            intervalId: "",
            start_time: "",
            end_time: "",
            total_time: "",
            showbutton: false,
            showresult: false,
            showstatus: false,
            collection: null,
            show: false,
            timer: false,
            showdata: false,
            showtimer: false,
            screenshot: null,
            startCapture: true,
            show_sweetalrt: false,
            show_acc:false,
            dis_acc:false,
            loading: false,
            datasets: [],
            config_data: [],
            comp_info: [],
            quality_checking: [],
            capture_duration: 10,
            testing_duration: 30,
            tab: 0,
            timeout: 10,
            testing_timeout: 300,
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
        }
    }

    componentDidMount = () => {
        var compData = JSON.parse(sessionStorage.getItem("compData"))
        this.setState({ comp_info: compData })
        console.log(compData)
        component_code1 = compData.component_code
        component_name1 = compData.component_name
        positive = compData.positive
        negative = compData.negative
        config_data = compData.config_data
        console.log('config_data', compData.batch_no)
        this.setState({ _id: compData._id })
        try {
            axios.post('https://172.16.1.91:5000/batch_info', { 'comp_id': compData._id, 'batch_no': compData.batch_no, 'min_nof_test_sample': config_data[0].test_samples, 'inspect_type': config_data[0].inspection_type },
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

        }
        let datasets = compData.datasets
        console.log(`datasets`, datasets)
        if (datasets === undefined || datasets.length === 0) {
            let comp_name = component_name1
            let comp_code = component_code1
            try {
                axios.post('https://172.16.1.91:5000/comp_filterData', { 'comp_name': comp_name, 'comp_code': comp_code },
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
        this.configuration()
        // this.handleClick()
    };

    configuration = () => {
        try {
            axios.post('https://172.16.1.91:5000/config',
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('config_data', data)
                    this.setState({ config_data: data, capture_duration: Number(data[0].countdown), testing_duration: Number(data[0].train_acc_timer_per_sample) })
                    let timeout = Number(data[0].countdown) + '000'
                    let testing_timeout = (Number(data[0].test_samples) * Number(data[0].train_acc_timer_per_sample)) / 60
                    this.setState({ timeout: timeout })
                    this.setState({ testing_timeout: testing_timeout, showtimer: true, testingTimer: true })
                    console.log('timeout', timeout, testing_timeout)
                    if (data[0].inspection_type === 'Manual') {
                        this.cont_apiCall()
                    }
                    else {
                        if (this.state.startCapture) {
                            setTimeout(() => { this.appCall() }, 2000)
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


    stopClick = () => {
        this.setState({ startCapture: false })
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
        this.setState({ intervalId: intervalId });
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
        formData.append('count', count);
        formData.append('datasets', blob, compdata + '.png')
        axios.post('https://172.16.1.91:5000/object_detection', formData, {
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
                        setTimeout(() => {
                            this.APCall(inspected_id, test_date, _today, time, this.state.batch_id)
                        }, 2000);
                    }
                    else {
                        this.cont_apiCall();
                    }
                }, 3000)
            })
    }


    APCall = async (data, inspected_ondate, date, time, batch_id) => {
        this.setState({ showstatus: false })
        console.log('inspected_data', data)
        console.log('inspected_ondate', inspected_ondate)
        console.log('date', date)
        console.log('time', time)
        console.log('batch_id', batch_id)
        try {
            axios.post('https://172.16.1.91:5000/admin_testing', { '_id': data, 'inspected_ondate': inspected_ondate, 'date': date, 'time': time, 'batch_id': batch_id },
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
                        this.setState({ collection: inspected_data[0]._id, response_message: inspected_data[0].result, response_value: inspected_data[0].match_percent, showresult: true })
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

    onTimeupCourse = () => {
        this.setState({ timer: true })
        this.object_detection()
    }
    onTimeup = () => {
         this.setState({ startcapture: false })
        this.setState({ testingTimer: true })
        this.abortTesting()
    }
    abortTesting = () => { this.navigate() }

    appCall = () => {
        //this.webcam.getScreenshot();
        console.log('first', Number(this.state.timeout))
        this.setState({ startCapture: true, timer: true, showstatus: false, showresult: false })
        let message = 'Place the object'
        console.log('message', message)
        this.setState({ mssg: message, showdata: true })
        // setTimeout(() => {
        //     this.setState({ mssg: "" })
        // }, Number(this.state.timeout));
        // setTimeout(() => {
        //     this.object_detection()
        // }, Number(this.state.timeout));
    }

    object_detection = async (event) => {
        //console.log('first360', this.state.initvalue)
        let count = this.state.initvalue1++
        this.setState({ showdata: false })
        //this.state.msg = ""
        const imageSrc = this.webcam.getScreenshot();
        const blob = await fetch(imageSrc).then((res) => res.blob());
        // console.log(blob)
        const formData = new FormData();
        let component_code = component_code1
        let component_name = component_name1
        let vpositive = positive
        let vnegative = negative

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
        formData.append('count', count);
        formData.append('datasets', blob, compdata + '.png')
        axios.post('https://172.16.1.91:5000/object_detection', formData, {
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

    resultCall = async (data, inspected_ondate, date, time, batch_id) => {
        this.setState({ showstatus: false })
        console.log('inspected_data', data)
        console.log('inspected_ondate', inspected_ondate)
        console.log('date', date)
        console.log('time', time)
        console.log('batch_id', batch_id)
        try {
            axios.post('https://172.16.1.91:5000/admin_testing', { '_id': data, 'inspected_ondate': inspected_ondate, 'date': date, 'time': time, 'batch_id': batch_id },
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
                        this.setState({ collection: inspected_data[0]._id, response_message: inspected_data[0].result, response_value: inspected_data[0].match_percent, showresult: true })
                        // if(response.data[0].result === 'ok'){
                        //     this.submit(response.data[0].result)
                        // }
                        // else if (response.data[0].result === 'notok'){
                        //     this.submit(response.data[0].result)                            
                        // }
                        // else
                        // {
                        //     this.submit(response.data[0].result)
                        // }
                        // this.setState({ response_message: response.data.status, response_value: parseFloat(response.data.value).toFixed(2), showresult: false })
                        // setTimeout(() => {
                        //     this.setState({ response_message: "", response_value: "" })
                        // }, 2000);
                        // setTimeout(() => {
                        //     this.appCall()
                        // }, 2000);
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log(error)
        }
    }

    // submit = (data) => {
    //     console.log('data', data)
    //     confirmAlert({
    //         title: 'Confirm to submit',
    //         message: 'Are you sure to do this.',
    //         buttons: [
    //             {
    //                 label: 'Yes',
    //                 onClick: () => alert('Click Yes')
    //             },
    //             {
    //                 label: 'No',
    //                 onClick: () => alert('Click No')
    //             }
    //         ]
    //     });
    // }

    // ask(question, yes, no) {
    //     if (confirm(question)) yes(), this.agree_not(this.state.collection, 'yes', this.state.batch_id);
    //     else no(), this.agree_not(this.state.collection, 'no', this.state.batch_id);
    // }

    agree_not = (data, datas, batch_id, result) => {
        let comp_data = this.state.comp_info
        positive = comp_data.positive
        negative = comp_data.negative
        //let count = this.state.initvalue
        console.log('batch_id479', batch_id)
        try {
            axios.post('https://172.16.1.91:5000/agree_not', { '_id': data, 'agree': datas, 'batch_id': batch_id, 'positive': positive, 'negative': negative, 'result': result },
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
                        if (o.result == 'Possible Match')
                            return o;
                    });
                    summary_posbl_match = _.without(summary_posbl_match, undefined)
                    if (summary_posbl_match.length !== 0) {
                        this.setState({ get_c: summary_posbl_match[0].posbl_match, get_f: summary_posbl_match[0].qc_ok, get_i: summary_posbl_match[0].qc_notok })
                    }
                    let train_acc = ((Number(this.state.get_d) + Number(this.state.get_e)) / Number(this.state.sample_count)) * 100
                    // if(train_acc === 100){
                    //     this.setState({show_acc:true})
                    // }
                    // else if(train_acc !== 100){
                    //     this.setState({dis_acc:true})
                    // }
                    this.setState({ train_accuracy: train_acc, show_acc:true })
                    if (this.state.config_data[0].inspection_type === 'Manual') {
                        this.cont_apiCall()
                    }
                    else {
                        if (Number(this.state.sample_count) !== Number(this.state.config_data[0].test_samples)) {
                            this.appCall()
                        }
                        else if (Number(this.state.sample_count) === Number(this.state.config_data[0].test_samples)) {
                            if ((((Number(this.state.get_d) + Number(this.state.get_e)) / this.state.config_data[0].test_samples) * 100) !== 100) {
                                //console.log('first555', this.state.get_d, this.state.get_e, this.state.config_data[0].test_samples)
                                this.trainClick()
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
        axios.post('https://172.16.1.91:5000/re_train', formData, {
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
        try {
            axios.post('https://172.16.1.91:5000/status_change', { '_id': comp_id, 'status': 'admin approved trained model' },
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

    // APICall = async (event) => {
    //     const imageSrc = this.webcam.getScreenshot();
    //     const blob = await fetch(imageSrc).then((res) => res.blob());
    //     console.log(blob)
    //     const formData = new FormData();
    //     //formData.append('file', blob)
    //     // let u_id = uuid()
    //     // console.log(u_id)  
    //     // const date = moment(new Date()).format("DD/MM/YYYY")
    //     // let date = this.getDate()
    //     // let replace = date.replaceAll(":", "_");
    //     // console.log('replace', replace)

    //     // let time = new Date().toLocaleString();

    //     // let today = new Date();
    //     // console.log('date', date)
    //     // let yyyy = today.getFullYear();
    //     // let mm = today.getMonth() + 1; // Months start at 0!
    //     // let dd = today.getDate();
    //     // let _today = dd + '/' + mm + '/' + yyyy

    //     // let hours = today.getHours()
    //     // let min = today.getMinutes()
    //     // let secc = today.getSeconds()
    //     // let time = hours + ':' + min + ':' + secc

    //     // console.log('time', time)
    //     let component_code = component_code1
    //     let component_name = component_name1
    //     let vpositive = positive
    //     let vnegative = negative

    //     let compdata = component_name + "_" + component_code // + '_' + replace

    //     formData.append('comp_name', component_name);
    //     formData.append('comp_code', component_code);
    //     formData.append('positive', vpositive);
    //     formData.append('negative', vnegative);
    //     // formData.append('Inspected_ondate', date)
    //     // formData.append('Inspected_ontime', time)
    //     // formData.append('date', _today)
    //     console.log(compdata)
    //     formData.append('datasets', blob, compdata + '.png')
    //     axios.post('https://172.16.1.91:5000/admin_testing', formData, {
    //         headers: {
    //             'content-type': 'multipart/form-data'
    //         },
    //         mode: 'no-cors'
    //     })
    //         .then(response => {
    //             // this.setState({
    //             //     projects: response.data
    //             // });
    //             console.log(`success`, response.data)
    //             if (response.data.status === undefined && response.data.value === undefined) {
    //                 this.setState({ response_msg: response.data, showresult: true })
    //             }
    //             else {
    //                 console.log('success', response.data.status, response.data.value);
    //                 // this.setState({ response_message: response.data.status, response_value: parseFloat(response.data.value).toFixed(2), showresult: false })
    //                 this.setState({ response_message: response.data.status, response_value: response.data.value, showresult: false })
    //             }
    //             // setTimeout(() => {
    //             //     this.setState({ response_message: "" })
    //             // }, 1000);
    //         })
    // }

    // acceptClick = async (event) => {
    //     this.setState({ startCapture: false })
    //     this.appCall(event)
    // }

    // appCall = async (event) => {
    //     this.setState({ loading: true })
    //     const imageSrc = this.webcam.getScreenshot();
    //     const blob = await fetch(imageSrc).then((res) => res.blob());
    //     console.log(blob)
    //     const formData = new FormData();
    //     //formData.append('file', blob)
    //     // let u_id = uuid()
    //     // console.log(u_id)    
    //     let component_code = component_code1
    //     let component_name = component_name1

    //     let compdata = component_name + "_" + component_code

    //     formData.append('comp_name', component_name);
    //     formData.append('comp_code', component_code);
    //     console.log(compdata)
    //     formData.append('datasets', blob, compdata + '.png')
    //     axios.post('https://172.16.1.91:5000/Accept', formData, {
    //         headers: {
    //             'content-type': 'multipart/form-data'
    //         },
    //         mode: 'no-cors'
    //     })
    //         .then(response => {
    //             // this.setState({
    //             //     projects: response.data
    //             // });
    //             console.log('success', response.data.status, response.data.value);
    //             //this.setState({ response_message: response.data.status, response_value: parseFloat(response.data.value).toFixed(2) })
    //             this.setState({ response_message: response.data, loading: false })
    //             // setTimeout(() => {
    //             //     this.setState({ response_message: "" })
    //             // }, 1000);
    //             this.setState({ startCapture: true })

    //         })
    //         .catch(error => {
    //             console.log('error', error);
    //         })
    // }

    rejectClick = async (event) => {
        this.setState({ startCapture: false })
        this.rejectCall(event)
    }

    rejectCall = async (event) => {
        this.setState({ loading: true })
        const imageSrc = this.webcam.getScreenshot();
        const blob = await fetch(imageSrc).then((res) => res.blob());
        console.log(blob)
        const formData = new FormData();
        //formData.append('file', blob)
        // let u_id = uuid()
        // console.log(u_id)    
        let component_code = component_code1
        let component_name = component_name1
        let compdata = component_name + "_" + component_code
        formData.append('comp_name', component_name);
        formData.append('comp_code', component_code);
        console.log(compdata)
        formData.append('file', blob, compdata + '.png')
        axios.post('https://172.16.1.91:5000/Reject', formData, {
            headers: {
                'content-type': 'multipart/form-data'
            },
            mode: 'no-cors'
        })
            .then(response => {
                // this.setState({
                //     projects: response.data
                // });
                console.log('success', response.data.status, response.data.value);
                //this.setState({ response_message: response.data.status, response_value: parseFloat(response.data.value).toFixed(2) })
                this.setState({ response_message: response.data, loading: false })
                // setTimeout(() => {
                //     this.setState({ response_message: "" })
                // }, 1000);
                this.setState({ startCapture: true })
            })
            .catch(error => {
                console.log('error', error);
            })
    }

    getImage = (image_path, type) => {
        //console.log(`image_path`, image_path)
        if (image_path === undefined) {
            return ""
        }
        let baseurl = 'https://172.16.1.91:8000/'
        let result = image_path
        //console.log(`result`, result)
        let output = baseurl + result
        return output
    }
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
                                                <Col md={7}>
                                                    Accuracy Testing
                                                </Col>
                                                {/* <Col md={2} style={{ textAlign: 'end', verticalAlign:'middle' }}>
                                                    Time to complete
                                                </Col> */}
                                                <Col md={5} style={{ textAlign: 'right' }}>
                                                    <Row style={{textAlign:'right'}}>
                                                        <Col md={6} style={{textAlign:'right', paddingTop:'17px'}}>Time to complete:</Col>
                                                        <Col md={6} style={{textAlignLast:'right'}}>
                                                        {
                                                        this.state.showtimer ?    
                                                        <CountdownTimer backgroundColor="#e6e46f" className="mt-2" size={28} hideDay={true} hideHours={false} count={this.state.testing_duration} onEnd={() => { this.onTimeup() }} />
                                                            : null
                                                    }
                                                        </Col>
                                                    </Row>
                                                    {/* {
                                                        this.state.showtimer ?    
                                                        <CountdownTimer backgroundColor="#e6e46f" className="mt-2" size={28} hideDay={true} hideHours={false} count={this.state.testing_duration} onEnd={() => { this.onTimeup() }} />
                                                            : null
                                                    } */}
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
                                                                    this.state.response_message === "ok" ? 'lightgreen' :
                                                                        this.state.response_message === "notok" ? 'red' :
                                                                            this.state.response_message === "Possible Match" ? 'orange' :
                                                                                null
                                                        }}>
                                                            <br />
                                                            Result: {this.state.response_message}{" "}{this.state.response_value}
                                                        </div> : null
                                                }
                                                {
                                                    this.state.showresult ?
                                                        <div className="containerImg" >
                                                            <div>
                                                                {
                                                                    this.state.response_message === "ok" &&
                                                                    <div className="align-self-bottom">
                                                                        <CheckCircleOutlined style={{ fontSize: '80px' }} />
                                                                    </div>
                                                                }
                                                            </div>
                                                            {
                                                                this.state.response_message === "notok" &&
                                                                <div className="align-self-bottom">
                                                                    <CloseCircleOutlined style={{ color: 'red', fontSize: '80px' }} />
                                                                    {/* <Button className="me-2" color="success" onClick={() => this.acceptClick()} > Yes </Button> */}
                                                                </div>
                                                            }
                                                        </div> : null
                                                }
                                                <div className="containerImg" >
                                                    <div>
                                                        {
                                                            this.state.showdata ?
                                                                <CountdownTimer backgroundColor="#f1f1f1" className="mt-2" hideDay={true} hideHours={true} count={this.state.capture_duration} onEnd={() => { this.onTimeupCourse() }} /> : null
                                                        }
                                                    </div>

                                                    {/* <div>
                                                    {
                                                        this.state.showbutton ?
                                                            <div>
                                                                <Button className="me-2" color="success" onClick={() => this.acceptClick()} > Yes </Button>
                                                                <Button className="me-2" color="danger" onClick={() => this.rejectClick()}> No</Button>
                                                            </div>
                                                             : null
                                                    }
                                                    </div> */}

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
                                                                <Button color="primary" onClick={() => this.object_detected()}>Start</Button>
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
                                                    this.state.datasets.map((data, index) => (
                                                        this.getImage(data.image_path, data.type) !== "" &&
                                                        index === 0 && <Col key={index}>
                                                            <img src={this.getImage(data.image_path, data.type)} />
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
                    </Container>
                    {
                        this.state.response_message === "ok" &&
                        // this.state.alertmsg ?
                        <SweetAlert
                            showCancel
                            title=""
                            cancelBtnBsStyle="danger"
                            cancelBtnText="No"
                            confirmBtnText="yes"
                            onConfirm={() => this.ask_show('yes')}
                            onCancel={() => this.ask_show('no')}
                            closeOnClickOutside={false}
                        >
                            <div style={{
                                fontSize: '20px',
                                color:
                                    this.state.response_message === "ok" ? 'green' :
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
                        this.state.response_message === "notok" &&
                        // this.state.alertmsg ?
                        <SweetAlert
                            showCancel
                            title=""
                            cancelBtnBsStyle="danger"
                            cancelBtnText="No"
                            confirmBtnText="yes"
                            onConfirm={() => this.ask_show('yes')}
                            onCancel={() => this.ask_show('no')}
                            closeOnClickOutside={false}
                        >
                            <div style={{
                                fontSize: '20px',
                                color:
                                    this.state.response_message === "notok" ? 'red' :
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
                        this.state.response_message === "Possible Match" &&
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
                        >
                            <div style={{
                                fontSize: '20px',
                                color:
                                    this.state.response_message === "Possible Match" ? 'orange' :
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

                            // parseFloat(((Number(this.state.get_d) + Number(this.state.get_e)) / data.test_samples) * 100).toFixed(2) !== 100.00 &&
                            <div key={index}>
                                <SweetAlert
                                    title=""
                                    confirmBtnText="Ok"
                                    onConfirm={() => this.navigate()}
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
                                                    <th>Ok</th>
                                                    <th>Not ok</th>
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
                                    <div>Possible Match: {this.state.get_c} </div>
                                    <div>
                                        <Table>
                                            <thead>
                                                <tr>
                                                    <th></th>
                                                    <th>Ok</th>
                                                    <th>Not ok</th>
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
                            <div key={index}>
                                <SweetAlert
                                    title=""
                                    confirmBtnText="ok"
                                    onConfirm={() => this.navigateto()}
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
                                                    <th>Ok</th>
                                                    <th>Not ok</th>
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
                                    <div>Possible Match: {this.state.get_c} </div>
                                    <div>
                                        <Table>
                                            <thead>
                                                <tr>
                                                    <th></th>
                                                    <th>Ok</th>
                                                    <th>Not ok</th>
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
                    {/* {
                        this.state.testing_timeout === 0 === true?
                        <SweetAlert
                        showCancel
                        title="Do you extend the testing time?"
                        cancelBtnBsStyle="danger"
                        cancelBtnText="No"
                        confirmBtnText="Extend"
                        onConfirm={() => this.ask_show('yes')}
                        onCancel={() => this.ask_show('no')}
                        closeOnClickOutside={false}
                    >
                    </SweetAlert>:null
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



