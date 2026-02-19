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
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import SweetAlert from 'react-bootstrap-sweetalert';
import 'antd/dist/antd.css';

let component_code1 = ""
let component_name1 = ""
let positive = ""
let negative = ""
let config_data = []
const { confirm } = Modal;
class Inspection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            component_code: "",
            component_name: "",
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
            showbutton: false,
            screenshot: null,
            showresult: false,
            showstatus: false,
            show: false,
            startCapture: true,
            loading: false,
            timer: false,
            alertmsg: false,
            showModal: false,
            showdata: false,
            dialog: false,
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
            comp_info:[],
            screenshot: null,
            startCapture: true,
            loading: false,
            tab: 0,
            count: 1,
            img_url: '',
            datasets: [],
            initvalue1: 1,
            initvalue2: 1,
            collection: null,
            sample_count: 0,
            agree_count: 0,
            accuracy: 0,
            _id: '',
            show_accuracy: false
        }
    }

    componentDidMount = () => {

        var compData = JSON.parse(sessionStorage.getItem("compData"))
        this.setState({comp_info:compData})
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
                    this.setState({ config_data: data, capture_duration: Number(data[0].countdown) })
                    let timeout = Number(data[0].countdown) + '000'
                    this.setState({ timeout: timeout })
                    console.log('timeout', timeout)
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
        this.setState({ showstatus: false, showresult: false, alertmsg: false })
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
                        this.setState({ collection: inspected_data[0]._id, response_message: inspected_data[0].result, response_value: inspected_data[0].match_percent, showresult: true, dialog:true })

                        // this.setState({ response_message: response.data.status, response_value: parseFloat(response.data.value).toFixed(2), showresult: false })
                        // setTimeout(() => {
                        // this.setState({ response_message: "", response_value: "", alertmsg: true})
                        // }, 2000);  
                        // this.setState({alertmsg: true})
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
    }

    appCall = () => {
        //this.webcam.getScreenshot();
        console.log('first', Number(this.state.timeout))
        this.setState({ startCapture: true, timer: true, showstatus: false, showresult: false })
        let message = 'Place the object'
        console.log('message', message)
        this.setState({ mssg: message, showdata: true })
        setTimeout(() => {
            this.setState({ mssg: "" })
        }, Number(this.state.timeout));
        setTimeout(() => {
            this.object_detection()
        }, Number(this.state.timeout));
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
                        if(response.data[0].result === 'notok')
                        {
                            this.ask_show('yes')
                        }
                       
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log(error)
        }
    }

    // ask(question, yes, no) {
    //     if (confirm(question)) yes(), this.agree_not(this.state.collection, 'yes', this.state.batch_id);
    //     else no(), this.agree_not(this.state.collection, 'no', this.state.batch_id);
    // }

    agree_not = (data, datas, batch_id) => {
        let comp_data =  this.state.comp_info
        positive = comp_data.positive
        negative = comp_data.negative 
        //let count = this.state.initvalue
        console.log('batch_id479', batch_id)
        try {
            axios.post('https://172.16.1.91:5000/agree_not', {'_id': data, 'agree': datas, 'batch_id': batch_id, 'positive': positive, 'negative': negative},
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('config_data485', data)
                    let test_sample = this.state.config_data
                    console.log('test_sample', test_sample[0].test_samples)
                    let accuracy = (data[0].agree / test_sample[0].test_samples) * 100
                    console.log('accuracy', accuracy)
                    this.setState({ sample_count: data[0].count, agree_count: data[0].agree, accuracy: accuracy })
                    if (this.state.config_data[0].inspection_type === 'Manual') {
                        this.cont_apiCall()
                    }                    
                    else {
                        this.appCall()
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }

    ask_show(data) {
        console.log('yes', data)        
        //this.setState({response_message: '' })
        // if (data === 'yes') this.agree_not(this.state.collection, data, this.state.batch_id);
        // else this.agree_not(this.state.collection, data, this.state.batch_id);
        confirm({                        
            title: 'Do you Want to delete these items?',            
            icon: <ExclamationCircleOutlined />,
            okText: 'Yes',
            cancelType: 'danger',
            cancelText: 'No',
            content: <div>Some descriptions </div>,            
            onOk() {
                this.agree_not(this.state.collection, 'yes', this.state.batch_id)
            },
            onCancel() {
                this.agree_not(this.state.collection, 'no', this.state.batch_id);
            },
          });
    }

    navigate = () => {
        this.setState({startCapture:false})
        const { history } = this.props
        console.log(this.props)
        history.push("/training")
    }

    navigateto = () => {
        let comp_id = this.state._id
        try {
            axios.post('https://172.16.1.91:5000/status_change', { '_id': comp_id, 'status': 'admin approved trained model' },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('approved', data)
                    this.setState({startCapture:false})
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
                                                <Col md={6}>
                                                    Accuracy Testing
                                                </Col>
                                                <Col md={6} style={{ textAlign: 'right' }}>
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
                                                        this.state.config_data.map((data, index) => (
                                                            this.state.accuracy !== 100 ?
                                                                <div key={index} style={{
                                                                    color:
                                                                        parseFloat((this.state.agree_count / data.test_samples) * 100).toFixed(2) !== 100 === true ? 'red' :
                                                                            null
                                                                }}>
                                                                    <Label>
                                                                        Training accuracy: {parseFloat((this.state.agree_count / data.test_samples) * 100).toFixed(2)}%
                                                                    </Label>
                                                                </div>
                                                                : <div key={index} style={{
                                                                    color:
                                                                        parseFloat((this.state.agree_count / data.test_samples) * 100).toFixed(2) == 100 === true ? 'green' :
                                                                            null
                                                                }}>
                                                                    <Label>
                                                                        Training accuracy: {parseFloat((this.state.agree_count / data.test_samples) * 100).toFixed(2)}%
                                                                    </Label>
                                                                </div>
                                                        ))
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
                    {/* {
                        this.state.response_message === "notok" &&
                        this.state.dialog ? (
                        <SweetAlert
                            showCancel
                            title=""                            
                            cancelBtnBsStyle="danger"
                            cancelBtnText="No"
                            confirmBtnText="yes"
                            onConfirm={() =>this.ask_show('yes')}
                            onCancel={() => this.ask_show('no')}
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
                        ):null
                    } */}
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
                            this.state.accuracy !== 100 &&
                            <div key={index}>
                                <SweetAlert
                                    title="Training accuracy result"
                                    confirmBtnText="Re-train"
                                    onConfirm={() => this.navigate()}
                                >
                                    <Label style={{ color: 'red', fontSize: '18px' }}>
                                        Training accuracy: {parseFloat((this.state.agree_count / data.test_samples) * 100).toFixed(2)} %, {" "}
                                    </Label>
                                    <Label>
                                        Since accuracy is not 100%, model need to be trained again. Press retrain button below to proceed.
                                    </Label>
                                </SweetAlert>
                            </div>
                        ))
                    }
                    {
                        this.state.config_data.map((data, index) => (
                            Number(this.state.sample_count) === Number(data.test_samples) === true &&
                            this.state.accuracy === 100 &&
                            <div key={index}>
                                <SweetAlert
                                    title="Training accuracy result"
                                    confirmBtnText="ok"
                                    onConfirm={() => this.navigateto()}
                                >
                                    <Label style={{ color: 'green', fontSize: '18px' }}>
                                        Training accuracy: {(this.state.agree_count / data.test_samples) * 100}%, {" "}
                                    </Label>
                                    <Label>
                                        Model is ready for deployment.
                                    </Label>
                                </SweetAlert>
                            </div>
                        ))
                    }
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
