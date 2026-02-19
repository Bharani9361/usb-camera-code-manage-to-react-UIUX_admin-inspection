import React, { Component } from "react";
import MetaTags from 'react-meta-tags';
import { Card, Col, Container, Row, CardBody, CardTitle, Label, Button, Form, Input, } from "reactstrap";
import axios from "axios";
import Webcam from "react-webcam";
//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Link } from "react-router-dom";
import { css } from "@emotion/react"
import { MoonLoader } from "react-spinners"
import Lightbox from "react-image-lightbox";
import { Popconfirm, message, Image } from 'antd'
import { DeleteTwoTone } from '@ant-design/icons';
// import 'antd/dist/antd.css';
import { v4 as uuidv4 } from 'uuid';
import SweetAlert from 'react-bootstrap-sweetalert';
//import { Progress } from 'antd';
// import 'antd/dist/antd.css';
import { Steps } from 'antd';
import PropTypes from "prop-types"
// import Camera from './Camera'
import {
    Progress,
} from "reactstrap"
import urlSocket from "../AdminInspection/urlSocket"
import ImageUrl from "../AdminInspection/imageUrl";

const { Step } = Steps;
let component_code1 = ""
let component_name1 = ""

class Training extends Component {
    constructor(props) {
        super(props);
        this.state = {
            add_label: [],
            showNextButton: false,
            showContent: [],
            config_showContent: [],
            addImage: '',
            showConfig: [],
            showCamera: false,
            startCapture: false,
            component_code: "",
            component_name: "",
            _id: "",
            real: "",
            fake: "",
            real_: "",
            fake_: "",
            dataloaded: false,
            ButtonClick: false,
            label1: "",
            label2: "",
            response_message: "",
            imageSrc: null,
            ImageData: [],
            imageArray: [],
            imgArray: [],
            loading: false,
            tab: 0,
            count: 1,
            counts: 1,
            photoIndex: 0,
            dataset: [],
            datasets: [],
            labelDetails: [],
            postive_label: "",
            negative_label: "",
            min_ok: "",
            min_not_ok: "",
            isEdit: false,
            showEmtyAlert: false,
            flag: false,
            msg: "",
            intervalId: "",
            interval: "",
            deviceId: ''
        }
    }
    componentDidMount = () => {
        this._isMounted = true;
        var compData = JSON.parse(sessionStorage.getItem("compData"))
        // this.device_info()
        console.log('compData', compData)
        console.log('configuration', compData.config_data)
        console.log('ok', compData.config_data[0].min_ok_for_training)
        console.log('notok', compData.config_data[0].min_notok_for_training)
        this.setState({ min_ok: compData.config_data[0].min_ok_for_training, min_not_ok: compData.config_data[0].min_notok_for_training, real: compData.positive, fake: compData.negative, config_real: compData.config_data[0].positive, config_fake: compData.config_data[0].negative, dataloaded: true, qc_changes_uptd:compData.qc_changes_uptd })
        component_code1 = compData.component_code
        component_name1 = compData.component_name
        if (compData.status === "training completed") {
            this.setState({ showNextButton: true })
        }
        let datasets = compData.datasets
        // let length = datasets.length
        if (datasets === undefined) {
            this.setState({ component_name: component_name1, component_code: component_code1, ImageData: [] })
        }
        else {
            this.setState({ component_name: component_name1, component_code: component_code1, datasets, ImageData: datasets })
        }
        if (compData._id !== undefined) {
            this.getImageDetaileApi(compData._id)
        } else {
            this.setState({ dataloaded: true })
        }
    };

    componentWillUnmount = async () => {
        this._isMounted = false;
        clearInterval(this.state.intervalId)
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
                    this.setState({ alertMsg: true, showCamera: false })
                }
                else {
                    this.setState({ device_info_a: device_info, alertMsg: false })
                }
            })
        }
        else if (device_info.length === 0) {
            this.setState({ alertMsg: true, showCamera: false })
        }
        else {
            this.setState({ device_info_a: device_info, alertMsg: false })
        }
    }

    getImageDetaileApi = (id) => {
        console.log('id', id)
        try {
            urlSocket.post('/getImageDetails', { '_id': id },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log(data)
                    console.log(data[0].negative)
                    if (data[0].datasets === undefined) {
                        this.setState({ ImageData: [] })
                    } else {
                        this.setState({ ImageData: data[0].datasets })
                    }
                    // this.setState({ labelDetails: data, ImageData: data[0].datasets, real_: data[0].positive, fake_: data[0].negative, dataloaded: true })
                    this.setState({ labelDetails: data, real_: data[0].positive, fake_: data[0].negative, dataloaded: true })
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {

        }
    }

    // addImageClick = async (data) => {
    //     console.log(`datas`, data)
    //     const imageSrc = this.webcam.getScreenshot();
    //     // let imageArray = [...this.state.imageArray, imageSrc]
    //     // this.setState({ imageArray })
    //     let imgArray = [...this.state.imgArray, imageSrc]
    //     this.setState({ imgArray })
    //     const blob = await fetch(imageSrc).then((res) => res.blob());
    //     console.log(blob)
    //     const formData = new FormData();
    //     let component_code = component_code1
    //     let component_name = component_name1
    //     let real = this.state.real

    //     let compdata = component_name + "_" + component_code

    //     formData.append('comp_name', component_name);
    //     formData.append('comp_code', component_code);
    //     formData.append('datasetLabel', data)
    //     console.log(compdata)
    //     formData.append('datasets', blob, compdata + '.png')
    //     axios.post('https://172.16.1.91:5000/add_image', formData, {
    //         headers: {
    //             'content-type': 'multipart/form-data'
    //         },
    //         mode: 'no-cors'
    //     })
    //         .then(response => {
    //             console.log('success', response.data);
    //             let image = response.data
    //             let imageData =  image[0].datasets
    //             console.log('first',imageData)
    //             this.setState({ response_message: "image are saved", ImageData:imageData })
    //             setTimeout(() => {
    //                 this.setState({ response_message: "" })
    //             }, 1000);
    //         })
    //         .catch(error => {
    //             console.log('error', error);
    //         })
    // }

    addImageClick = async (data) => {
        console.log(`datas`, data)
        const imageSrc = this.webcam.getScreenshot();
        console.log(imageSrc)
        if (imageSrc === null) {
            alert('camera is not connected')
        }
        // let imageArray = [...this.state.imageArray, imageSrc]
        // this.setState({ imageArray })
        // let imgArray = [...this.state.imgArray, imageSrc]
        // this.setState({ imgArray })
        else {
            const blob = await fetch(imageSrc).then((res) => res.blob());
            console.log(blob)
            const formData = new FormData();
            let component_code = component_code1
            let component_name = component_name1
            let real = this.state.real

            let compdata = uuidv4();
            console.log('compdata', compdata)
            formData.append('comp_name', component_name);
            formData.append('comp_code', component_code);
            formData.append('datasetLabel', data)
            formData.append('datasets', blob, compdata + '.png')
            urlSocket.post('/add_image', formData, {
                headers: {
                    'content-type': 'multipart/form-data'
                },
                mode: 'no-cors'
            })
                .then(response => {
                    console.log('success', response.data);
                    let image = response.data
                    let imageData = image[0].datasets
                    console.log('first', imageData)
                    this.setState({ response_message: "image are saved", ImageData: imageData })
                    setTimeout(() => {
                        this.setState({ response_message: "" })
                    }, 1000);
                })
                .catch(error => {
                    console.log('error', error);
                })
        }
    }

    // newbtnname = () => {
    //     let real = this.state.real
    //     let fake = this.state.fake
    //     console.log(`real`, real)
    //     console.log(`fake`, fake)
    //     let component_code = component_code1
    //     let component_name = component_name1
    //     try {
    //         axios.post('https://172.16.1.91:5000/add_label', { 'comp_name': component_name, 'comp_code': component_code, 'positive': real, 'negative': fake },
    //             { mode: 'no-cors' })
    //             .then((response) => {
    //                 let data = response.data
    //                 console.log(data) 
    //                })
    //             .catch((error) => {

    //                 console.log(error)
    //             })
    //     } catch (error) {

    //     }
    //     if (real !== "" && fake !== "") {
    //         this.setState({ real_: real, fake_: fake })
    //     }
    //     else if (real !== "") {
    //         this.setState({ real_: real })
    //     }
    //     else if (fake !== "" && fake !== undefined) {
    //         this.setState({ fake_: fake })
    //     }
    // }

    getImages = (data1) => {
        if (data1 !== undefined) {
            console.log('data1', data1)
            let baseurl = ImageUrl
            let result = data1.image_path
            let output = baseurl + result
            return output
        }
        else {
            return null
        }
    }


    deleteImageClick = async (data, index, dataLabel) => {
        let ImageData = [...this.state.ImageData]
        ImageData.splice(index, 1)
        this.setState({ ImageData })
        let dataset = [...this.state.dataset]
        dataset.splice(index, 1)
        this.setState({ dataset })
        console.log(`datas`, data)
        console.log('dataLabel', dataLabel)
        message.success('Click on Yes');

        const blob = await fetch(data).then((res) => res.blob());
        console.log(blob)
        const formData = new FormData();
        let component_code = component_code1
        console.log('component_code', component_code)
        let component_name = component_name1
        let real = this.state.real

        let compdata = data.image_path;
        console.log('compdata', compdata)

        formData.append('comp_name', component_name);
        formData.append('comp_code', component_code);
        formData.append('datasetLabel', dataLabel)
        formData.append('datasets', compdata)
        urlSocket.post('/delete_image', formData, {
            headers: {
                'content-type': 'multipart/form-data'
            },
            mode: 'no-cors'
        })
            .then(response => {
                console.log('success', response.data);
                this.setState({ response_message: response.data, count: this.state.count + 1 })
                setTimeout(() => {
                    this.setState({ response_message: "" })
                }, 1000);
            })
            .catch(error => {
                console.log('error', error);
            })
    }

    labelClick = (showContent, config_showContent, data) => {
        this.setState({ showConfig: data })
        let labelDetails = this.state.labelDetails
        console.log(`labeldts`, labelDetails.length)
        // this.device_find()
        if (labelDetails.length === 0) {
            this.setState({ showContent, config_showContent, showCamera: true, startCapture: true })
        }
        else {
            this.setState({ showContent, config_showContent, showCamera: true, ButtonClick: true, startCapture: true })
        }
        // if (this.state.alertMsg === false) {
        //     if (labelDetails.length === 0) {
        //         this.setState({ showContent, config_showContent, showCamera: true, startCapture: true })
        //     }
        //     else {
        //         this.setState({ showContent, config_showContent, showCamera: true, ButtonClick: true, startCapture: true })
        //     }
        // }

    }

    gettraining_status = (d1, d2) => {
        console.log('d1', d1, d2)
        const formData = new FormData();
        formData.append('comp_name', d2);
        formData.append('comp_code', d1);
        urlSocket.post('/training_status', formData, {
            headers: {
                'content-type': 'multipart/form-data'
            },
            mode: 'no-cors'
        })
            .then(response => {
                console.log('success1', response.data);
                this.setState({ msg: response.data, flag: true })
            })
            .catch(error => {
                console.log('error', error);
            })
        if (this.state.msg === 4) {
            clearInterval(this.state.intervalId)
        }
    }

    navigateto = () => {
        const { history } = this.props
        console.log(this.props)
        setTimeout(() => {
            history.push("/crudcomponent")
        }, 5000);
        // history.push("/crudcomponent")
    }

    product_checking = async (event) => {
        this.setState({ loading: true })
        clearInterval(this.state.interval)
        if (this.state.real !== undefined && this.state.real !== "") {
            const formData = new FormData();
            let real = this.state.real
            console.log("real", real)
            let fake = this.state.fake
            console.log("fake", fake)
            let minok = this.state.min_ok
            console.log('minok', minok)
            let minotok = this.state.min_not_ok
            console.log('minotok', minotok)
            let component_code = component_code1
            let component_name = component_name1
            let compdata = component_name + "_" + component_code + '_' + this.state.count
            formData.append('comp_name', component_name);
            formData.append('comp_code', component_code);
            formData.append('positive', real)
            formData.append('negative', fake)
            formData.append('min_ok_for_training', minok)
            formData.append('min_notok_for_training', minotok)
            console.log(compdata)
            // formData.append('file', blob, compdata + '.png')
            urlSocket.post('/checking', formData, {
                headers: {
                    'content-type': 'multipart/form-data'
                },
                mode: 'no-cors'
            })
                .then(response => {
                    console.log('success', response.data);
                    if (response.data !== 'No reference Image Exists under match component please add to start train' && response.data !== "Atleast add min required ok images" && response.data !== "Atleast add min required notok images") {
                        this.setState({ loading: true })
                        this.trainClick()
                        this.navigateto()
                    }
                    else {
                        this.setState({ response_message: response.data, count: this.state.count + 1, loading: false })
                    }
                })
                .catch(error => {
                    console.log('error', error);
                })
        }
        // else {
        //     let labelDetails = this.state.labelDetails
        //     console.log(`labelDetailes`, labelDetails)
        //     let positive = labelDetails[0].positive
        //     let negative = labelDetails[0].negative
        //     console.log("real1", positive)
        //     console.log("fake1", negative)
        //     let minok = this.state.min_ok
        //     console.log('minok', minok)
        //     let minotok = this.state.min_not_ok
        //     console.log('minotok', minotok)
        //     const formData = new FormData();
        //     let component_code = component_code1
        //     let component_name = component_name1
        //     let compdata = component_name + "_" + component_code + '_' + this.state.count
        //     formData.append('comp_name', component_name);
        //     formData.append('comp_code', component_code);
        //     formData.append('positive', positive)
        //     formData.append('negative', negative)
        //     formData.append('min_ok_for_training', minok)
        //     formData.append('min_notok_for_training', minotok)
        //     console.log(compdata)
        //     // formData.append('file', blob, compdata + '.png')
        //     axios.post('https://172.16.1.91:5000/checking', formData, {
        //         headers: {
        //             'content-type': 'multipart/form-data'
        //         },
        //         mode: 'no-cors'
        //     })
        //         .then(response => {
        //             if (response.data !== 'No reference Image Exists under match component please add to start train' && response.data !== "Atleast add min required ok images" && response.data !== "Atleast add min required notok images") {                        
        //                 console.log('responsed', response)                        
        //                 this.setState({loading:true})
        //                 // setTimeout(() => {
        //                 //     this.navigateto()
        //                 // }, 50000000);
        //                 this.trainClick()
        //                 this.navigateto()                       
        //             }                    
        //             else {
        //                 this.setState({ response_message: response.data, count: this.state.count + 1, loading: false})
        //                 console.log('response', response)
        //             }
        //         })
        //         .catch(error => {
        //             console.log('error', error);
        //         })      
        // }
    }

    submitData = (data) => {
        console.log('data451', data)
        if (data !== '' && data !== undefined) {
            console.log('ready for camera')
        }
    }

    trainClick = async (event) => {
        //this.setState({showEmtyAlert: true})
        this.setState({ loading: true, flag: true })
        // let labelDetails = this.state.labelDetails
        // console.log(`labelDetailes`, labelDetails)
        // let real = labelDetails[0].positive
        // let fake = labelDetails[0].negative          
        if (this.state.real !== undefined && this.state.real !== "") {
            const formData = new FormData();
            let real = this.state.real
            console.log("real", real)
            let fake = this.state.fake
            console.log("fake", fake)
            let minok = this.state.min_ok
            console.log('minok', minok)
            let minotok = this.state.min_not_ok
            console.log('minotok', minotok)
            let component_code = component_code1
            let component_name = component_name1
            let compdata = component_name + "_" + component_code + '_' + this.state.count
            formData.append('comp_name', component_name);
            formData.append('comp_code', component_code);
            formData.append('positive', real)
            formData.append('negative', fake)
            formData.append('min_ok_for_training', minok)
            formData.append('min_notok_for_training', minotok)
            formData.append('qc_changes_uptd', this.state.qc_changes_uptd)
            console.log(compdata)
            // formData.append('file', blob, compdata + '.png')
            urlSocket.post('/Train', formData, {
                headers: {
                    'content-type': 'multipart/form-data'
                },
                mode: 'no-cors'
            })
                .then(response => {
                    if (response.data !== 'No reference Image Exists under match component please add to start train' && response.data !== "Atleast add min required ok images" && response.data !== "Atleast add min required notok images") {
                        //console.log('hello', hello)
                        this.navigateto()
                        // let intervalId = setInterval(() => {
                        //     this.gettraining_status(component_code, component_name);
                        // }, 1000)
                        // this.setState({ intervalId: intervalId });
                    }
                    console.log('success', response.data);
                    // if (response.data === 'training completed') {
                    //     this.setState({ response_message: response.data, count: this.state.count + 1, loading: false, showNextButton: true })
                    //     setTimeout(() => {
                    //         this.setState({ response_message: "" })
                    //     }, 2000);
                    // }
                    // else {
                    //     this.setState({ response_message: response.data, count: this.state.count + 1, loading: false})
                    //     console.log('hello')                        
                    // }
                })
                .catch(error => {
                    console.log('error', error);
                })
            // let intervalId = setInterval(() => {
            //     this.gettraining_status(component_code, component_name);
            // }, 1000)
            // this.setState({ intervalId: intervalId });           
        }
        // else {
        //     let labelDetails = this.state.labelDetails
        //     console.log(`labelDetailes`, labelDetails)
        //     let positive = labelDetails[0].positive
        //     let negative = labelDetails[0].negative
        //     console.log("real1", positive)
        //     console.log("fake1", negative)
        //     let minok = this.state.min_ok
        //     console.log('minok', minok)
        //     let minotok = this.state.min_not_ok
        //     console.log('minotok', minotok)
        //     const formData = new FormData();
        //     let component_code = component_code1
        //     let component_name = component_name1
        //     let compdata = component_name + "_" + component_code + '_' + this.state.count
        //     formData.append('comp_name', component_name);
        //     formData.append('comp_code', component_code);
        //     formData.append('positive', positive)
        //     formData.append('negative', negative)
        //     formData.append('min_ok_for_training', minok)
        //     formData.append('min_notok_for_training', minotok)
        //     console.log(compdata)
        //     // formData.append('file', blob, compdata + '.png')
        //     axios.post('https://172.16.1.91:5000/Train', formData, {
        //         headers: {
        //             'content-type': 'multipart/form-data'
        //         },
        //         mode: 'no-cors'
        //     })
        //         .then(response => {
        //             if (response.data !== 'No reference Image Exists under match component please add to start train' && response.data !== "Atleast add min required ok images" && response.data !== "Atleast add min required notok images") {
        //                 //console.log('hello', hello)
        //                 this.navigateto()
        //                 // let intervalId = setInterval(() => {
        //                 //     this.gettraining_status(component_code, component_name);
        //                 // }, 1000)
        //                 // this.setState({ intervalId: intervalId });
        //             }
        //             console.log('success', response.data);
        //             // if (response.data === 'training completed') {
        //             //     this.setState({ response_message: response.data, count: this.state.count + 1, loading: false, showNextButton: true })
        //             //     setTimeout(() => {
        //             //         this.setState({ response_message: "" })
        //             //     }, 2000);
        //             // }
        //             // else {
        //             //     this.setState({ response_message: response.data, count: this.state.count + 1, loading: false})
        //             //     console.log('hello')                        
        //             // }
        //         })
        //         .catch(error => {
        //             console.log('error', error);
        //         })
        // }
    }

    backComp = () => {
        console.log('close')
        this._isMounted = false;
        clearInterval(this.state.intervalId)
        const { history } = this.props
        console.log(this.props)
        history.push("/crudcomponent")
    }

    submitForm = () => {
        console.log(this.state.component_name, this.state.component_code)

        if (this.state.real !== undefined && this.state.real !== "") {
            let Data = {
                component_name: this.state.component_name,
                component_code: this.state.component_code,
                datasets: this.state.datasets,
                positive: this.state.real,
                negative: this.state.fake,
            }
            sessionStorage.removeItem("Data")
            sessionStorage.setItem("Data", JSON.stringify(Data))
            console.log('Data', Data)
        }
        else {
            let Data = {
                component_name: this.state.component_name,
                component_code: this.state.component_code,
                datasets: this.state.datasets,
                positive: this.state.labelDetails[0].positive,
                negative: this.state.labelDetails[0].negative,
            }
            sessionStorage.removeItem("Data")
            sessionStorage.setItem("Data", JSON.stringify(Data))
            console.log('Data', Data)
        }
    }

    render() {
        if (this.state.dataloaded) {
            const videoConstraints = {
                facingMode: "user"
            };
            const override = css`display: block; margin: 0 auto; border-color: red;`;
            return (
                <React.Fragment>
                    <div className="page-content">
                        <MetaTags>
                            <title>Training Process</title>
                        </MetaTags>
                        {
                            this.state.loading ?
                                <Container fluid>
                                    {
                                        this.state.loading ? <div className="sweet-loading">
                                            <MoonLoader color={'#2f8545'} loading={this.state.loading} css={override} size={75} />
                                            <div className="text-center mt-2">
                                                Training in Queued...
                                            </div>
                                        </div> : null
                                    }
                                </Container>
                                :
                                <Container fluid={true}>
                                    <Breadcrumbs title="Forms" breadcrumbItem="Training Process" />
                                    <Row lg={6}>
                                        <Col xl={4}>
                                            <Button xl={2} className="w-md m-1" onClick={() => this.backComp()} >Back</Button>
                                        </Col>
                                    </Row>
                                    <br />
                                    <Row>
                                        <Col lg={6}>
                                            <Card>
                                                <CardBody>
                                                    <CardTitle className="mb-4">Capture Image for Training</CardTitle>
                                                    <label>Component Name: {this.state.component_name}</label> {" , "}
                                                    <label>Component Code: {this.state.component_code}</label>
                                                    <br />
                                                    <Form>
                                                        <div className="row mb-4">
                                                            {
                                                                this.state.real !== "" && this.state.real !== undefined &&
                                                                <Col md={12}>
                                                                    <Button color="primary" className="w-md m-1" onClick={() => { this.labelClick(this.state.real, this.state.config_real, this.state.min_ok) }}>{this.state.config_real}</Button>
                                                                </Col>
                                                            }
                                                            {
                                                                this.state.fake !== "" && this.state.fake !== undefined &&
                                                                <Col md={12}>
                                                                    <Button color="primary" className="w-md m-1" onClick={() => { this.labelClick(this.state.fake, this.state.config_fake, this.state.min_not_ok) }}>{this.state.config_fake}</Button>
                                                                </Col>
                                                            }
                                                        </div>
                                                    </Form>
                                                    {/* <Camera />  */}

                                                </CardBody>
                                            </Card>
                                        </Col>
                                        <Col lg={6}>
                                            {
                                                this.state.showCamera ?

                                                    <Card>
                                                        <CardBody>
                                                            <CardTitle className="mb-4">Component Info</CardTitle>
                                                            <div>
                                                                <label>{this.state.config_showContent} component</label> { }
                                                                {
                                                                    this.state.showConfig !== 0 &&
                                                                    <label> {'('} minimum required image: {this.state.showConfig} {')'}</label>
                                                                }
                                                                <br />
                                                                {/* {
                                                                    this.state.startCapture === true &&
                                                                    // setInterval(() => { 
                                                                    <Camera selected_data={(data) => { this.submitData(data) }}/>
                                                                    // }, 500)
                                                                }    */}
                                                                        {/* videoConstraints={{ deviceId: this.state.deviceId }} */}
                                                                
                                                                <div className="containerImg">
                                                                    <Webcam
                                                                        videoConstraints={videoConstraints}
                                                                        audio={false}
                                                                        height={'auto'}
                                                                        screenshotFormat="image/png"
                                                                        width={'100%'}
                                                                        ref={node => this.webcam = node}
                                                                    />

                                                                    <div className="centered">
                                                                        {this.state.response_message}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="row justify-content-end">
                                                                <Col sm={12} style={{ textAlign: "end" }}>
                                                                    <div>
                                                                        <Button color="primary" className="w-md m-1" onClick={() => this.addImageClick(this.state.showContent)}>Add</Button>
                                                                    </div>
                                                                </Col>
                                                            </div>
                                                        </CardBody>
                                                    </Card> : null
                                            }
                                            {
                                                //this.state.ButtonClick &&
                                                this.state.showCamera ?
                                                    <Card>
                                                        <label className="mt-2">
                                                            Label Name:{this.state.config_showContent}  </label>
                                                        <Image.PreviewGroup>
                                                            <Row>
                                                                {
                                                                    this.state.real === this.state.showContent &&
                                                                    this.state.ImageData.map((data, index) => (
                                                                        data.type === this.state.showContent && //JB
                                                                        <Col className="mt-2" key={index} >
                                                                            {/* <img src={this.getImages(data)} alt='preview' height={'auto'} width={100} onClick={() => this.setState({ isGallery: true, photoIndex: index })} /> */}
                                                                            <Image width={100} src={this.getImages(data)}>
                                                                            </Image>
                                                                            {
                                                                                    data.qc_sugstd_on !== null && data.qc_sugstd_on !== undefined &&
                                                                                    <label style={{color: 'red'}}>QC suggested image</label>
                                                                                }
                                                                            <Popconfirm placement="rightBottom" title="Do you want to delete?" onConfirm={() => this.deleteImageClick(data, index, this.state.showContent)} okText="Yes"
                                                                            >
                                                                                {/* cancelText="No" */}
                                                                                <DeleteTwoTone twoToneColor="red" style={{ fontSize: '18px' }} />
                                                                            </Popconfirm>
                                                                        </Col>
                                                                    ))
                                                                }
                                                            </Row>
                                                        </Image.PreviewGroup>
                                                        <Row>
                                                            {
                                                                //console.log(`fake`, this.state.fake_)
                                                                this.state.fake === this.state.showContent &&
                                                                <Image.PreviewGroup>
                                                                    <Row>
                                                                        {
                                                                            this.state.ImageData.map((data, index) => (
                                                                                data.type === this.state.showContent && //JB
                                                                                <Col className="mt-2" key={index}>
                                                                                    {/* <img src={data} alt='preview' height={'auto'} width={100} onClick={() => this.setState({ isGallery: true, photoIndex: index })} /> */}
                                                                                    <Image width={100} src={this.getImages(data)} />
                                                                                    <Popconfirm placement="rightBottom" title="Do you want to delete?" onConfirm={() => this.deleteImageClick(data, index, this.state.showContent)} okText="Yes"
                                                                                    >
                                                                                        {/* cancelText="No" */}
                                                                                        <DeleteTwoTone twoToneColor="red" style={{ fontSize: '18px' }} />
                                                                                    </Popconfirm>
                                                                                </Col>
                                                                            ))
                                                                        }
                                                                    </Row>
                                                                </Image.PreviewGroup>
                                                            }
                                                        </Row>
                                                    </Card> : null
                                            }
                                        </Col>
                                        <Card>
                                            <CardBody>
                                                <div style={{ textAlign: "center" }} >
                                                    <Button color="primary" className="w-md m-1" onClick={() => this.product_checking()}> TRAIN </Button>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </Row>
                                </Container>
                        }
                    </div>
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
                    {
                        this.state.response_message === 'No reference Image Exists under match component please add to start train' &&
                        //this.state.showEmtyAlert && 
                        <SweetAlert
                            danger
                            title={'Alert'}
                            onConfirm={() => this.setState({ response_message: '' })}
                            onCancel={() => this.setState({ response_message: '' })}
                        >
                            {this.state.response_message}
                        </SweetAlert>
                    }
                    {
                        this.state.response_message === "Atleast add min required ok images" &&
                        <SweetAlert
                            danger
                            title={'Alert'}
                            onConfirm={() => this.setState({ response_message: '' })}
                            onCancel={() => this.setState({ response_message: '' })}
                        >
                            you have add minimum {this.state.min_ok} ok images
                        </SweetAlert>
                    }
                    {
                        this.state.response_message === "Atleast add min required notok images" &&
                        <SweetAlert
                            danger
                            title={'Alert'}
                            onConfirm={() => this.setState({ response_message: '' })}
                            onCancel={() => this.setState({ response_message: '' })}
                        >
                            you have add minimum {this.state.min_not_ok} notok images
                        </SweetAlert>
                    }
                </React.Fragment>
            );
        }
        else {
            return null
        }
    }
}
Training.propTypes = {
    history: PropTypes.any.isRequired,
};

export default Training;
