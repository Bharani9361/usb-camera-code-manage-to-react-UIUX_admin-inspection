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
import { Popconfirm, message} from 'antd'
import {DeleteTwoTone} from '@ant-design/icons';
import 'antd/dist/antd.css';
import { v4 as uuidv4 } from 'uuid';

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
        }
    }
    componentDidMount = () => {

        var compData = JSON.parse(sessionStorage.getItem("compData"))

        console.log('compData', compData)

        component_code1 = compData.component_code
        component_name1 = compData.component_name

        if(compData.Status === "training completed"){
            this.setState({showNextButton: true})
        }

        let datasets = compData.datasets

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
                    console.log(data[0].Negative)
                    this.setState({ labelDetails: data, dataset: data[0].datasets, real_: data[0].Positive, fake_: data[0].Negative, dataloaded: true })
                })
                .catch((error) => {

                    console.log(error)
                })
        } catch (error) {

        }
    }

    addImageClick = async (data) => {
        console.log(`datas`, data)
        const imageSrc = this.webcam.getScreenshot();
        let imageArray = [...this.state.imageArray, imageSrc]
        this.setState({ imageArray })
        let imgArray = [...this.state.imgArray, imageSrc]
        this.setState({ imgArray })
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
                
                this.setState({ response_message: response.data, count: this.state.count + 1 })
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
            axios.post('https://172.16.1.91:5000/add_label', { 'comp_name': component_name, 'comp_code': component_code, 'Positive': real, 'Negative': fake },
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
    getImage = (Image_path, type) => {
        let labelDetails = this.state.labelDetails
        if (Image_path === undefined) {
            return ""
        }
        else {
            if (type === labelDetails[0].Positive) {
                let baseurl = 'https://172.16.1.91:8000/'
                let result = Image_path
                let output = baseurl + result
                console.log('output', output)
                // let imageArray = [...this.state.imageArray, output]
                // this.setState({ imageArray })
                return output
            } else {
                return ""
            }
        }

    }
    getNegImage = (Image_path, type) => {
        let labelDetails = this.state.labelDetails
        console.log(type)
        if (Image_path === undefined) {
            return ""
        }
        else {
            if (type === labelDetails[0].Negative) {
                let baseurl = 'https://172.16.1.91:8000/'
                let result = Image_path
                let output = baseurl + result
                return output
            } else {
                return ""
            }
        }

    }

    deleteImageClick = async(data, index, dataLabel) =>{

        let imageArray = [...this.state.imageArray]
        imageArray.splice(index, 1)
        this.setState({ imageArray })

        // console.log(`datas`, data)
        // console.log('dataLabel', dataLabel)
        // message.success('Click on Yes');
        // //const imageSrc = this.webcam.getScreenshot();
        // let imageArray = [...this.state.imageArray, data]
        // this.setState({ imageArray })
        // let imgArray = [...this.state.imgArray, data]
        // this.setState({ imgArray })
        // const blob = await fetch(data).then((res) => res.blob());
        // console.log(blob)
        // const formData = new FormData();
        // let component_code = component_code1
        // console.log('component_code', component_code)
        // let component_name = component_name1
        // let real = this.state.real

        // let compdata = uuidv4();
        // console.log('compdata', compdata)

        // formData.append('comp_name', component_name);
        // formData.append('comp_code', component_code);
        // formData.append('datasetLabel', dataLabel)        
        // formData.append('datasets', blob, compdata + '.png')
        // axios.post('https://172.16.1.91:5000/delete_image', formData, {
        //     headers: {
        //         'content-type': 'multipart/form-data'
        //     },
        //     mode: 'no-cors'
        // })
        //     .then(response => {
        //         console.log('success', response.data);
        //         this.setState({ response_message: response.data, count: this.state.count + 1 })
        //         setTimeout(() => {
        //             this.setState({ response_message: "" })
        //         }, 1000);
        //     })
        //     .catch(error => {
        //         console.log('error', error);
        //     })

    }
    cancel = (e) => {
        console.log(e);
        message.error('Click on No');
    }

    labelClick = (showContent) => {
        let labelDetails = this.state.labelDetails
        console.log(`labeldts`, labelDetails.length)
        if (labelDetails.length === 0) {
            this.setState({ showContent, showCamera: true })
        }
        else {
            this.setState({ showContent, showCamera: true, ButtonClick: true })
        }

    }

    trainClick = async (event) => {

        this.setState({ loading: true })
        // let labelDetails = this.state.labelDetails
        // console.log(`labelDetailes`, labelDetails)
        // let real = labelDetails[0].Positive
        // let fake = labelDetails[0].Negative          
        if (this.state.real !== undefined && this.state.real !== "") 
        {            
            const formData = new FormData();
            let real = this.state.real
            console.log("real", real)
            let fake = this.state.fake
            console.log("fake", fake)
            let component_code = component_code1
            let component_name = component_name1
            let compdata = component_name + "_" + component_code + '_' + this.state.count
            formData.append('comp_name', component_name);
            formData.append('comp_code', component_code);
            formData.append('Positive', real)
            formData.append('Negative', fake)
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
                    this.setState({ response_message: response.data, count: this.state.count + 1, loading: false, showNextButton: true })
                    setTimeout(() => {
                        this.setState({ response_message: "" })
                    }, 2000);
                })
                .catch(error => {
                    console.log('error', error);
                })
        }
        else {
            let labelDetails = this.state.labelDetails
            console.log(`labelDetailes`, labelDetails)
            let Positive = labelDetails[0].Positive
            let Negative = labelDetails[0].Negative
            console.log("real1", Positive)
            console.log("fake1", Negative)

            const formData = new FormData();
            let component_code = component_code1
            let component_name = component_name1
            let compdata = component_name + "_" + component_code + '_' + this.state.count
            formData.append('comp_name', component_name);
            formData.append('comp_code', component_code);
            formData.append('Positive', Positive)
            formData.append('Negative', Negative)
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
                    this.setState({ response_message: response.data, count: this.state.count + 1, loading: false })
                    setTimeout(() => {
                        this.setState({ response_message: "" })
                    }, 2000);
                })
                .catch(error => {
                    console.log('error', error);
                })
        }

    }
    submitForm = () => {
        console.log(this.state.component_name, this.state.component_code)
              
        if (this.state.real !== undefined && this.state.real !== "")
        {
            let Data = {
                component_name: this.state.component_name,
                component_code: this.state.component_code,
                datasets: this.state.datasets,
                Positive: this.state.real,
                Negative:this.state.fake,     
            }
            sessionStorage.removeItem("Data")
            sessionStorage.setItem("Data", JSON.stringify(Data))
            console.log('Data', Data)
        }
        else{
            let Data = {
                component_name: this.state.component_name,
                component_code: this.state.component_code,
                datasets: this.state.datasets,
                Positive: this.state.labelDetails[0].Positive,
                Negative: this.state.labelDetails[0].Negative, 
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
                                                                    <Button color="primary" className="w-md m-1" onClick={() => { this.labelClick(this.state.real_) }}>{this.state.real_}</Button>
                                                                </Col>
                                                            }
                                                            {
                                                                this.state.fake_ !== "" && this.state.fake_ !== undefined &&
                                                                <Col md={12}>
                                                                    <Button color="primary" className="w-md m-1" onClick={() => { this.labelClick(this.state.fake_) }}>{this.state.fake_}</Button>
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
                                                                <label>{this.state.showContent} component</label>
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
                                                        <Row>
                                                            {
                                                                this.state.real_ === this.state.showContent &&
                                                                <div>
                                                                    {
                                                                        this.state.imageArray.map((data, index) => (
                                                                            <Col className="mt-2" key={index}>
                                                                                <img src={data} alt='preview' height={'auto'} width={100} onClick={() => this.setState({ isGallery: true, photoIndex: index })} />
                                                                                <Col>                                                                                
                                                                                <Popconfirm placement="rightBottom" title="Do you want to delete?" onConfirm={() => this.deleteImageClick(data, index, this.state.showContent)} okText="Yes"
                                                                                    cancelText="No" >
                                                                                    <DeleteTwoTone twoToneColor="red" style={{ fontSize: '18px' }} />
                                                                                </Popconfirm></Col>
                                                                            </Col>
                                                                           
                                                                        ))
                                                                    }
                                                                </div>
                                                            }
                                                        </Row>
                                                        <Row>
                                                            {
                                                                //console.log(`fake`, this.state.fake_)
                                                                this.state.fake_ === this.state.showContent &&
                                                                <Row>
                                                                    <div>
                                                                        {
                                                                            this.state.imageArray.map((data, index) => (
                                                                                <Col className="mt-2" key={index}>
                                                                                    <img src={data} alt='preview' height={'auto'} width={100} onClick={() => this.setState({ isGallery: true, photoIndex: index })} />
                                                                                    <Col> <DeleteTwoTone style={{ fontSize: '32px' }} twoToneColor="#eb2f96" onClick={() => this.deleteImageClick(this.state.showContent)}/> </Col>
                                                                                </Col>
                                                                            ))
                                                                        }

                                                                    </div>

                                                                </Row>
                                                            }
                                                        </Row>

                                                    </Card> : null
                                            }
                                            {
                                                this.state.ButtonClick &&
                                                <Card>
                                                    <div>
                                                        <Row>
                                                            {
                                                                this.state.labelDetails[0].Positive === this.state.showContent &&
                                                                <div>
                                                                    {
                                                                        this.state.showCamera ?

                                                                            <Row className="my-3 justify-content-center">

                                                                                <label className="mt-2">
                                                                                    Label Name:{this.state.showContent}  </label>
                                                                                {
                                                                                    //this.state.labelDetails.Positive === this.state.showContent &&
                                                                                    this.state.dataset.map((data, index) => (
                                                                                        // console.log("type", data.type)
                                                                                        this.getImage(data.Image_path, data.type) !== "" &&

                                                                                        <Col className="mt-2" key={index}>
                                                                                            <img src={this.getImage(data.Image_path, data.type)} style={{ width: 100, height: 'auto' }} />
                                                                                        </Col>

                                                                                    ))
                                                                                }
                                                                            </Row>
                                                                            : null

                                                                    }
                                                                </div>

                                                            }
                                                        </Row>
                                                        <Row>
                                                            {
                                                                this.state.labelDetails[0].Negative === this.state.showContent &&
                                                                <div>
                                                                    {
                                                                        this.state.showCamera ?
                                                                            <Row className="mt-3 justify-content-center">
                                                                                <label>
                                                                                    Label Name:{this.state.showContent}  </label>
                                                                                {
                                                                                    //this.state.labelDetails.Negative === this.state.showContent &&

                                                                                    this.state.dataset.map((datas, index) => (
                                                                                        this.getNegImage(datas.Image_path, datas.type) !== "" &&
                                                                                        <Col className="mt-2" key={index}>
                                                                                            <img src={this.getNegImage(datas.Image_path, datas.type)} style={{ width: 100, height: 'auto' }} />
                                                                                        </Col>
                                                                                    ))
                                                                                }
                                                                            </Row> : null
                                                                    }
                                                                </div>
                                                            }
                                                        </Row>
                                                    </div>
                                                </Card>
                                            }
                                            {
                                                this.state.real_ !== "" && this.state.isGallery ? (
                                                    <Lightbox
                                                        mainSrc={this.state.imageArray[this.state.photoIndex]}
                                                        nextSrc={this.state.imageArray[(this.state.photoIndex + 1) % this.state.imageArray.length]}
                                                        prevSrc={
                                                            this.state.imageArray[(this.state.photoIndex + this.state.imageArray.length - 1) % this.state.imageArray.length]
                                                        }
                                                        enableZoom={false}
                                                        onCloseRequest={() => this.setState({ isGallery: false })}
                                                        onMovePrevRequest={() =>
                                                            this.setState({
                                                                photoIndex:
                                                                    (this.state.photoIndex + this.state.imageArray.length - 1) % this.state.imageArray.length,
                                                            })
                                                        }
                                                        onMoveNextRequest={() =>
                                                            this.setState({
                                                                photoIndex: (this.state.photoIndex + 1) % this.state.imageArray.length,
                                                            })
                                                        }
                                                        imageCaption={"Project " + parseFloat(this.state.photoIndex + 1)}
                                                    />
                                                ) : null}
                                            {
                                                this.state.fake_ !== "" && this.state.isgallery ? (
                                                    <Lightbox
                                                        mainSrc={this.state.imgArray[this.state.photoIndex]}
                                                        nextSrc={this.state.imgArray[(this.state.photoIndex + 1) % this.state.imgArray.length]}
                                                        prevSrc={
                                                            this.state.imgArray[(this.state.photoIndex + this.state.imgArray.length - 1) % this.state.imgArray.length]
                                                        }
                                                        enableZoom={false}
                                                        onCloseRequest={() => this.setState({ isgallery: false })}
                                                        onMovePrevRequest={() =>
                                                            this.setState({
                                                                photoIndex:
                                                                    (this.state.photoIndex + this.state.imgArray.length - 1) % this.state.imgArray.length,
                                                            })
                                                        }
                                                        onMoveNextRequest={() =>
                                                            this.setState({
                                                                photoIndex: (this.state.photoIndex + 1) % this.state.imgArray.length,
                                                            })
                                                        }
                                                        imageCaption={"Project " + parseFloat(this.state.photoIndex + 1)}
                                                    />
                                                ) : null}

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
                </React.Fragment>
            );
        }
        else {
            return null
        }
    }
}


export default Training;
