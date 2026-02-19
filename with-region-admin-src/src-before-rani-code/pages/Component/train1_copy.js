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
import 'antd/dist/antd.css';
import { v4 as uuidv4 } from 'uuid';
import SweetAlert from 'react-bootstrap-sweetalert';
//import { Progress } from 'antd';
import 'antd/dist/antd.css';
import { Steps } from 'antd';

import {
    Progress,
} from "reactstrap"

const { Step } = Steps;
let component_code1 = ""
let component_name1 = ""

class Training extends Component {
    constructor(props) {
        super(props);
        this.state = {
            add_label: [

            ],
            showNextButton: false,
            showContent: [],
            addImage: '',
            showConfig: [],
            showCamera: false,
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
            intervalId:"",
            step1bgcolor:"",
            step2bgcolor:"",
            step3bgcolor:"",
            step4bgcolor:"",
        }
    }
    componentDidMount = () => {

        var compData = JSON.parse(sessionStorage.getItem("compData"))

        console.log('compData', compData)
        console.log('configuration', compData.config_data)
        console.log('ok', compData.config_data[0].min_ok_for_training)
        console.log('notok', compData.config_data[0].min_notok_for_training)

        this.setState({ min_ok: compData.config_data[0].min_ok_for_training, min_not_ok: compData.config_data[0].min_notok_for_training })

        component_code1 = compData.component_code
        component_name1 = compData.component_name

        if (compData.status === "training completed") {
            this.setState({ showNextButton: true })
        }

        let datasets = compData.datasets
        // let length = datasets.length

        if (datasets === undefined) {
            this.setState({ component_name: component_name1, component_code: component_code1 })
        }
        else {
            this.setState({ component_name: component_name1, component_code: component_code1, datasets })
        }
        if (compData._id !== undefined) {

            this.getImageDetaileApi(compData._id)
        } else {
            this.setState({ dataloaded: true })
        }

    };

    getImageDetaileApi = (id) => {
        console.log('id', id)
        try {
            axios.post('https://172.16.1.91:5000/getImageDetails', { '_id': id },
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
        // let imageArray = [...this.state.imageArray, imageSrc]
        // this.setState({ imageArray })
        // let imgArray = [...this.state.imgArray, imageSrc]
        // this.setState({ imgArray })
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
        axios.post('https://172.16.1.91:5000/add_image', formData, {
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


    newbtnname = () => {
        let real = this.state.real
        let fake = this.state.fake
        console.log(`real`, real)
        console.log(`fake`, fake)
        let component_code = component_code1
        let component_name = component_name1
        try {
            axios.post('https://172.16.1.91:5000/add_label', { 'comp_name': component_name, 'comp_code': component_code, 'positive': real, 'negative': fake },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log(data)
                    // if (data === "created") {
                    //     alert("created")
                    // }
                    // else
                    //     alert("Already created")

                })
                .catch((error) => {

                    console.log(error)
                })
        } catch (error) {

        }
        if (real !== "" && fake !== "") {
            this.setState({ real_: real, fake_: fake })
        }
        else if (real !== "") {
            this.setState({ real_: real })
        }
        else if (fake !== "" && fake !== undefined) {
            this.setState({ fake_: fake })
        }

    }

    getImages = (data1) => {
        if (data1 !== undefined) {
            console.log('data1', data1)
            let baseurl = 'https://172.16.1.91:8000/'
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
        axios.post('https://172.16.1.91:5000/delete_image', formData, {
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

    labelClick = (showContent, data) => {
        console.log('data', data)
        this.setState({ showConfig: data })
        let labelDetails = this.state.labelDetails
        console.log(`labeldts`, labelDetails.length)
        if (labelDetails.length === 0) {
            this.setState({ showContent, showCamera: true })
        }
        else {
            this.setState({ showContent, showCamera: true, ButtonClick: true })
        }

        // if(this.state.isEdit){   // on Edit display DIV
        //     // this.setState({ })
        // }else{ // Initial training
        //     // this.setState({ })

        // }
    }
    gettraining_status = (d1, d2) => {
        console.log('d1', d1, d2)
        const formData = new FormData();
        formData.append('comp_name', d2);
        formData.append('comp_code', d1);
        axios.post('https://172.16.1.91:5000/training_status', formData, {
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
            if(this.state.msg === 4){
                clearInterval(this.state.intervalId)
            }
    }

    trainClick = async (event) => {
        //this.setState({showEmtyAlert: true})
        this.setState({ loading: true, flag: true })
        const formData = new FormData();
        let component_code = component_code1
        let component_name = component_name1
        // let labelDetails = this.state.labelDetails
        // console.log(`labelDetailes`, labelDetails)
        // let real = labelDetails[0].positive
        // let fake = labelDetails[0].negative
        if (this.state.real !== undefined && this.state.real !== "") {

            let real = this.state.real
            console.log("real", real)
            let fake = this.state.fake
            console.log("fake", fake)
            let minok = this.state.min_ok
            console.log('minok', minok)
            let minotok = this.state.min_not_ok
            console.log('minotok', minotok)
            let compdata = component_name + "_" + component_code + '_' + this.state.count
            formData.append('comp_name', component_name);
            formData.append('comp_code', component_code);
            formData.append('positive', real)
            formData.append('negative', fake)
            formData.append('min_ok_for_training', minok)
            formData.append('min_notok_for_training', minotok)
            console.log(compdata)
            // formData.append('file', blob, compdata + '.png')
            axios.post('https://172.16.1.91:5000/Train', formData, {
                headers: {
                    'content-type': 'multipart/form-data'
                },
                mode: 'no-cors'
            })
                .then(response => {
                    console.log('success', response.data);
                    if (response.data === 'training completed') {
                        this.setState({ response_message: response.data, count: this.state.count + 1, loading: false, showNextButton: true })
                        setTimeout(() => {
                            this.setState({ response_message: "" })
                        }, 2000);
                    }
                    else {
                        this.setState({ response_message: response.data, count: this.state.count + 1, loading: false })
                    }

                })
                .catch(error => {
                    console.log('error', error);
                })
            // let intervalId = setInterval(() => {
            //     this.gettraining_status(component_code, component_name);
            // }, 1000)
            // this.setState({ intervalId: intervalId });
            // if(this.state.msg === 4){
            //     clearInterval(this.state.intervalId)
            // }
        }
        else {
            let labelDetails = this.state.labelDetails
            console.log(`labelDetailes`, labelDetails)
            let positive = labelDetails[0].positive
            let negative = labelDetails[0].negative
            console.log("real1", positive)
            console.log("fake1", negative)
            let minok = this.state.min_ok
            console.log('minok', minok)
            let minotok = this.state.min_not_ok
            console.log('minotok', minotok)

            // const formData = new FormData();
            // let component_code = component_code1
            // let component_name = component_name1
            let compdata = component_name + "_" + component_code + '_' + this.state.count
            formData.append('comp_name', component_name);
            formData.append('comp_code', component_code);
            formData.append('positive', positive)
            formData.append('negative', negative)
            formData.append('min_ok_for_training', minok)
            formData.append('min_notok_for_training', minotok)
            console.log(compdata)
            // formData.append('file', blob, compdata + '.png')
            axios.post('https://172.16.1.91:5000/Train', formData, {
                headers: {
                    'content-type': 'multipart/form-data'
                },
                mode: 'no-cors'
            })
                .then(response => {
                    console.log('success', response.data);
                    if (response.data === 'training completed') {
                        this.setState({ response_message: response.data, count: this.state.count + 1, loading: false, showNextButton: true })
                        setTimeout(() => {
                            this.setState({ response_message: "" })
                        }, 2000);
                    }
                    else {
                        this.setState({ response_message: response.data, count: this.state.count + 1, loading: false})
                    }
                })
                .catch(error => {
                    console.log('error', error);
                })


        }
        if(this.state.response_message === 'No reference Image Exists under match component please add to start train' && this.state.response_message === "Atleast add min required ok images" && this.state.response_message === "Atleast add min required notok images")
        {
            let intervalId = setInterval(() => {
                this.gettraining_status(component_code, component_name);
            }, 1000)
            this.setState({ intervalId: intervalId });

        }
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
                            <title>Form Layouts | Skote - React Admin & Dashboard Template</title>
                        </MetaTags>
                        {
                            this.state.loading ?
                                <Container fluid>
                                    {
                                        this.state.loading ? <div className="sweet-loading">
                                            <MoonLoader color={'#2f8545'} loading={this.state.loading} css={override} size={75} />
                                            <div className="text-center mt-2">
                                                Training in progress...
                                            </div>
                                        </div> : null
                                    }
                                </Container>
                                :
                                <Container fluid={true}>
                                    <Breadcrumbs title="Forms" breadcrumbItem="Form Layouts" />
                                    <Row>
                                        <Col lg={6}>
                                            <Card>
                                                <CardBody>
                                                    <CardTitle className="mb-4">Add Label</CardTitle>
                                                    <label>Component Name: {this.state.component_name}</label> {" , "}
                                                    <label>Component Code: {this.state.component_code}</label>
                                                    <br />
                                                    <Form>
                                                        <div className="row mb-4">
                                                            <Col sm={6}>
                                                                <Label>Real component name</Label>
                                                                <Input type="text" className="form-control" placeholder="Enter Your real component name" value={this.state.real} onChange={(e) => this.setState({ real: e.target.value })} />
                                                            </Col>
                                                            <Col sm={6}>
                                                                <Label>Fake component name</Label>
                                                                <Input type="text" placeholder="Enter Your fake component name" value={this.state.fake} onChange={(e) => this.setState({ fake: e.target.value })} />
                                                                {/* <Input ref="name" type="text" size="30" placeholder="Name" onChange={this.handleChange.bind(this, "name")}value={this.state.fields["name"]} /> */}
                                                            </Col>
                                                        </div>
                                                        <div>
                                                            <Button color="primary" className="w-md m-1" onClick={() => this.newbtnname()}>ADD</Button>
                                                            {
                                                                this.state.real_ !== "" && this.state.real_ !== undefined &&
                                                                <Col md={12}>
                                                                    <Button color="primary" className="w-md m-1" onClick={() => { this.labelClick(this.state.real_, this.state.min_ok) }}>{this.state.real_}</Button>
                                                                </Col>
                                                            }
                                                            {
                                                                this.state.fake_ !== "" && this.state.fake_ !== undefined &&
                                                                <Col md={12}>
                                                                    <Button color="primary" className="w-md m-1" onClick={() => { this.labelClick(this.state.fake_, this.state.min_not_ok) }}>{this.state.fake_}</Button>
                                                                </Col>
                                                            }

                                                            {/* <div>
                                                                {
                                                                    this.state.add_label.map((data, index) => (
                                                                        <Col className="mt-2" key={index}>
                                                                            <Button color={index ? 'primary' : 'success'} onClick={() => this.labelClick(data)}>{data.btn_name}</Button>{""}
                                                                        </Col>
                                                                    ))
                                                                }
                                                            </div> */}
                                                        </div>
                                                    </Form>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                        <Col lg={6}>
                                            {
                                                this.state.showCamera ?

                                                    <Card>
                                                        <CardBody>
                                                            <CardTitle className="mb-4">Component Details</CardTitle>
                                                            <div>
                                                                <label>{this.state.showContent} component</label> { }
                                                                {
                                                                    this.state.showConfig !== 0 &&
                                                                    <label> {'('} minimum required image: {this.state.showConfig} {')'}</label>

                                                                }

                                                                <br />
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
                                                            Label Name:{this.state.showContent}  </label>
                                                        <Image.PreviewGroup>
                                                            <Row>
                                                                {
                                                                    this.state.real_ === this.state.showContent &&

                                                                    this.state.ImageData.map((data, index) => (

                                                                        data.type === this.state.showContent && //JB

                                                                        <Col className="mt-2" key={index} >
                                                                            {/* <img src={this.getImages(data)} alt='preview' height={'auto'} width={100} onClick={() => this.setState({ isGallery: true, photoIndex: index })} /> */}

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
                                                        <Row>
                                                            {
                                                                //console.log(`fake`, this.state.fake_)
                                                                this.state.fake_ === this.state.showContent &&
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
                                                    <Button color="primary" className="w-md m-1" onClick={() => this.trainClick()}> TRAIN </Button>
                                                </div>
                                            </CardBody>
                                        </Card>
                                        {
                                                this.state.showNextButton ?

                                                <Card>
                                                <CardBody>
                                                    <Link to="/inspect">
                                                        <Col xl="12" lg="8" sm="12" style={{ textAlign: "end", fontSize: "22px" }}>
                                                            <div onClick={() => this.submitForm()}>Next<i className="dripicons-arrow-right mx-3 pt-2" style={{}} /></div>
                                                            {/* <div>Next<i className="dripicons-arrow-right mx-3 pt-2" style={{}} /></div> */}
                                                        </Col>
                                                    </Link>
                                                </CardBody>
                                            </Card>
                                            : null
                                        }

                                    </Row>
                                </Container>
                        }
                    </div>

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
                     <div className="">

                    </div>

                    <Row className="col-lg-6">

                        {
                            this.state.msg === 0 &&
                            <Progress multi>
                        <Progress bar color="primary" value={15} animated></Progress>
                      </Progress>
                        }
                        {
                            this.state.msg === 1 &&
                            <Progress multi>
                        <Progress bar color="success" value={15}>15%</Progress>
                        <Progress bar color="primary" value={15} animated></Progress>
                      </Progress>
                        }
                        {
                            this.state.msg === 2 &&
                            <Progress multi>
                        <Progress bar color="success" value={15}></Progress>
                        <Progress bar color="success" value={15}>30%</Progress>
                        <Progress bar color="primary" value={10} animated></Progress>
                      </Progress>

                        }
                        {
                            this.state.msg === 3 &&
                            <Progress multi>
                        <Progress bar color="success" value={15}></Progress>
                        <Progress bar color="success" value={15}></Progress>
                        <Progress bar color="success" value={10}>40%</Progress>
                        <Progress bar color="primary" value={60} animated></Progress>
                      </Progress>
                        }
                        {
                            this.state.msg === 4 &&
                            <Progress multi>
                        <Progress bar color="success" value={15}></Progress>
                        <Progress bar color="success" value={15}></Progress>
                        <Progress bar color="success" value={10}></Progress>
                        <Progress bar color="success" value={60}>100%</Progress>
                      </Progress>
                        }

                    </Row>
                </React.Fragment>
            );
        }
        else {
            return null
        }
    }
}


export default Training;
