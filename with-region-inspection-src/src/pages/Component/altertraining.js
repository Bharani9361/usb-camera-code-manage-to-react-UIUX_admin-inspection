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
//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Link } from "react-router-dom";
import { css } from "@emotion/react"
import { MoonLoader } from "react-spinners"
import Lightbox from "react-image-lightbox";

let component_code1 = ""
let component_name1 = ""

class Training extends Component {
    constructor(props) {
        super(props);
        this.state = {
            component_code: "",
            component_name: "",
            _id: "",
            real:"",
            fake: "",
            dataloaded: false,
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
            Datasets: []
        }
    }
    componentDidMount = () => {

        var compData = JSON.parse(sessionStorage.getItem("compData"))

        console.log(compData)

        component_code1 = compData.component_code
        component_name1 = compData.component_name

        let Datasets = compData.Datasets

        if (Datasets === undefined) {
            this.setState({ component_name: component_name1, component_code: component_code1 })
        }
        else {
            this.setState({ component_name: component_name1, component_code: component_code1, Datasets })
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
            axios.post('http://127.0.0.1:5000/getImageDetails', { '_id': id },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log(data[0].Datasets)
                    this.setState({ dataset: data[0].Datasets, dataloaded: true })

                })
                .catch((error) => {

                    console.log(error)
                })
        } catch (error) {

        }
    }

    posClick = async (event) => {
        //event.preventDefault();    
        this.APICall(event)
    }

    APICall = async (event) => {
        const imageSrc = this.webcam.getScreenshot();
        let imageArray = [...this.state.imageArray, imageSrc]
        this.setState({ imageArray })
        const blob = await fetch(imageSrc).then((res) => res.blob());
        console.log(blob)
        const formData = new FormData();
        //formData.append('file', blob)
        // let u_id = uuid()
        // console.log(u_id)    
        let component_code = component_code1
        let component_name = component_name1
        let real = this.state.real

        let compdata = component_name + "_" + component_code

        formData.append('comp_name', component_name);
        formData.append('comp_code', component_code);
        formData.append('positive', real)
        console.log(compdata)
        formData.append('Datasets', blob, compdata + '.png')
        axios.post('http://127.0.0.1:5000/add_image', formData, {
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
    negClick = async (event) => {
        //event.preventDefault();    
        this.AppCall(event)
    }

    AppCall = async (event) => {
        const imageSrc = this.webcam.getScreenshot();
        let imgArray = [...this.state.imgArray, imageSrc]
        this.setState({ imgArray })
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
        formData.append('Datasets', blob, compdata + '.png')
        axios.post('http://127.0.0.1:5000/add_negimage', formData, {
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
    trainClick = async (event) => {
        //event.preventDefault();    
        this.apiCall(event)
    }

    apiCall = async (event) => {

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

        let compdata = component_name + "_" + component_code + '_' + this.state.count

        formData.append('comp_name', component_name);
        formData.append('comp_code', component_code);
        console.log(compdata)
        formData.append('file', blob, compdata + '.png')
        axios.post('http://127.0.0.1:5000/Train', formData, {
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
                }, 1000);
            })
            .catch(error => {
                console.log('error', error);
            })
    }
    submitForm = () => {
        console.log(this.state.component_name, this.state.component_code)

        let compData = {
            component_name: this.state.component_name,
            component_code: this.state.component_code,
        }
        sessionStorage.removeItem("compData")
        sessionStorage.setItem("compData", JSON.stringify(compData))
    }

    getNegImage = (Image_path, type) => {
        console.log(type)
        if (Image_path === undefined) {
            return ""
        }
        else {
            if (type === "Negative") {
                let baseurl = 'http://127.0.0.1:8000/'
                let result = Image_path
                let output = baseurl + result
                return output
            } else {
                return ""
            }
        }

    }
    getImage = (Image_path, type) => {
        if (Image_path === undefined) {
            return ""
        }
        else {
            if (type === "positive") {
                let baseurl = 'http://127.0.0.1:8000/'
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
                                                    <CardTitle className="mb-4">Component Details</CardTitle>
                                                    <div>
                                                        {/* <h1>Face Authentication</h1> */}
                                                        <label>Component Name: {this.state.component_name}</label>
                                                        <br />
                                                        <label>Component Code: {this.state.component_code}</label>

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
                                                        <div style={{ textAlign: "center" }}>

                                                            <div className='screenshots'>
                                                                <div className='controls'>
                                                                    {/* <input id="userid" name="userid" type="text" onChange={(e) => { this.setState({ userid: e.target.value }) }} />
                             */}
                                                                    {/* <button onClick={this.handleClick}>capture</button>                           */}

                                                                </div>
                                                                {/* {
                                this.state.screenshot != null && <img src={this.state.screenshot} alt='preview' />
                              } */}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Form>
                                                                    <div className="row mb-4">

                                                                        <Col sm={12}>
                                                                            <Label>Label Name</Label>
                                                                            <Input
                                                                                type="text"
                                                                                className="form-control"
                                                                                id="horizontal-compname-Input"
                                                                                placeholder="Enter Your"
                                                                                value={this.state.real}
                                                                                onChange={(e) => this.setState({ real: e.target.value })}
                                                                            />
                                                                            {/* { this.state.component_name } */}
                                                                        </Col>
                                                                    </div>

                                                                    <Button
                                                                    //type="submit"
                                                                    color="primary"
                                                                    className="w-md m-1"
                                                                    onClick={() => this.posClick()}
                                                                >
                                                                    positive
                                                                </Button>{" "}
                                                                    <div className="row mb-4">

                                                                        <Col sm={12}>
                                                                            <Label>Label Name</Label>
                                                                            <Input
                                                                                type="text"
                                                                                className="form-control"
                                                                                id="horizontal-compcode-Input"
                                                                                placeholder="Enter Your"
                                                                                value={this.state.fake}
                                                                                onChange={(e) => this.setState({ fake: e.target.value })}
                                                                            />
                                                                        </Col>
                                                                    </div>

                                                                    <Button
                                                                    //type="submit"
                                                                    color="primary"
                                                                    className="w-md m-1"
                                                                    onClick={() => this.negClick()}
                                                                >
                                                                    NEGATIVE
                                                                </Button>{" "}                                                                
                                                                    
                                                                </Form>

                                                    <div className="row justify-content-end">
                                                        <Col sm={12} style={{ textAlign: "center" }}>
                                                            <div>

                                                                <Button
                                                                    //type="submit"
                                                                    color="primary"
                                                                    className="w-md m-1"
                                                                    onClick={() => this.posClick()}
                                                                >
                                                                    POSITIVE
                                                                </Button>{" "}
                                                                <Button
                                                                    //type="submit"
                                                                    color="primary"
                                                                    className="w-md m-1"
                                                                    onClick={() => this.negClick()}
                                                                >
                                                                    NEGATIVE
                                                                </Button>{" "}
                                                                
                                                                {/* <Button
                                //type="submit"
                                color="primary"
                                className="w-md m-1"
                                onClick={() => this.trainClick()}
                              >
                                TRAIN
                              </Button>{" "}
                              <Link to="Testing">
                                <Button
                                  //type="submit"
                                  color="primary"
                                  className="w-md m-1"
                                  onClick={() => this.submitForm()}
                                >
                                  TESTING
                                </Button>
                              </Link> */}

                                                            </div>
                                                        </Col>
                                                    </div>

                                                </CardBody>
                                            </Card>
                                            <Card>
                                                {/* <CardBody>
                      {this.state.imageSrc ? <img src={this.state.imageSrc} alt='preview' /> :null}
                      </CardBody> */}
                                                <Row>
                                                    <label>
                                                        Label Name:  </label>
                                                    {
                                                        this.state.dataset.map((data, index) => (
                                                            // console.log("type", data.type)
                                                            this.getImage(data.Image_path, data.type) !== "" &&

                                                            <Col className="mt-2" key={index}>
                                                                <img src={this.getImage(data.Image_path, data.type)} style={{ width: 100, height: 'auto' }} />
                                                            </Col>

                                                        ))
                                                    }
                                                </Row>
                                                <Row>
                                                    {
                                                        this.state.imageArray.map((data, index) => (
                                                            <Col className="mt-2" key={index}>
                                                                <img src={data} alt='preview' height={'auto'} width={100} onClick={() => this.setState({ isGallery: true, photoIndex: index })} />
                                                            </Col>
                                                        ))
                                                    }
                                                </Row>
                                            </Card>
                                            <Card>
                                                <CardBody>
                                                    <Row>
                                                        <label>
                                                            Label Name: </label>
                                                        {
                                                            this.state.dataset.map((datas, index) => (
                                                                this.getNegImage(datas.Image_path, datas.type) !== "" &&
                                                                <Col className="mt-2" key={index}>
                                                                    <img src={this.getNegImage(datas.Image_path, datas.type)} style={{ width: 100, height: 'auto' }} />
                                                                </Col>

                                                            ))
                                                        }
                                                    </Row>
                                                    <Row>
                                                        {
                                                            this.state.imgArray.map((data, index) => (
                                                                <Col className="mt-2" key={index}>
                                                                    <img src={data} alt='preview' height={'auto'} width={100} onClick={() => this.setState({ isgallery: true, photoIndex: index })} />
                                                                </Col>
                                                            ))
                                                        }
                                                    </Row>
                                                </CardBody>
                                            </Card>
                                            <Card>
                                                <CardBody>
                                                    <div style={{ textAlign: "center" }} >
                                                        <Button color="primary"
                                                            className="w-md m-1"
                                                            onClick={() => this.trainClick()}> TRAIN </Button>
                                                    </div>
                                                </CardBody>
                                            </Card>

                                        </Col>
                                    </Row>
                                    <Link to="/inspect">
                                        <Col xl="12" lg="8" sm="12" style={{ textAlign: "end", fontSize: "22px" }}>
                                            <div onClick={() => this.submitForm()}>Next<i className="dripicons-arrow-right mx-3 pt-2" style={{}} /></div>
                                            {/* <div>Next<i className="dripicons-arrow-right mx-3 pt-2" style={{}} /></div> */}
                                        </Col>
                                    </Link>
                                </Container>
                        }
                        {/* container-fluid */}
                        {this.state.isGallery ? (
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

                        {this.state.isgallery ? (
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



// ###################################################################################################################################################################################

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
//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { Link } from "react-router-dom";
import { css } from "@emotion/react"
import { MoonLoader } from "react-spinners"
import Lightbox from "react-image-lightbox";

let component_code1 = ""
let component_name1 = ""

class Training extends Component {
    constructor(props) {
        super(props);
        this.state = {
            add_label: [

            ],
            showContent: [],
            showCamera: false,
            component_code: "",
            component_name: "",
            _id: "",
            real: "",
            fake: "",
            dataloaded: false,
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
            Datasets: []
        }
    }
    componentDidMount = () => {

        var compData = JSON.parse(sessionStorage.getItem("compData"))

        console.log(compData)

        component_code1 = compData.component_code
        component_name1 = compData.component_name

        let Datasets = compData.Datasets

        if (Datasets === undefined) {
            this.setState({ component_name: component_name1, component_code: component_code1 })
        }
        else {
            this.setState({ component_name: component_name1, component_code: component_code1, Datasets })
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
            axios.post('http://127.0.0.1:5000/getImageDetails', { '_id': id },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log(data[0].Datasets)
                    this.setState({ dataset: data[0].Datasets, dataloaded: true })

                })
                .catch((error) => {

                    console.log(error)
                })
        } catch (error) {

        }
    }

    posClick = async (data) => {
        //event.preventDefault();    
        this.APICall(data)
    }

    APICall = async (data) => {
        console.log(`data1`, data)
        const imageSrc = this.webcam.getScreenshot();
        let imageArray = [...this.state.imageArray, imageSrc]
        this.setState({ imageArray })
        const blob = await fetch(imageSrc).then((res) => res.blob());
        console.log(blob)
        const formData = new FormData();
        //formData.append('file', blob)
        // let u_id = uuid()
        // console.log(u_id)    
        let component_code = component_code1
        let component_name = component_name1
        let real = this.state.real

        let compdata = component_name + "_" + component_code

        formData.append('comp_name', component_name);
        formData.append('comp_code', component_code);
        formData.append('datasetLabel', data)
        console.log(compdata)
        formData.append('Datasets', blob, compdata + '.png')
        axios.post('http://127.0.0.1:5000/add_image', formData, {
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

    trainClick = async (event) => {
        //event.preventDefault();    
        this.apiCall(event)
    }

    apiCall = async (event) => {

        this.setState({ loading: true })
        // const imageSrc = this.webcam.getScreenshot();
        // const blob = await fetch(imageSrc).then((res) => res.blob());
        // console.log(blob)
        const formData = new FormData();
        //formData.append('file', blob)
        // let u_id = uuid()
        // console.log(u_id)    
        let component_code = component_code1
        let component_name = component_name1

        let compdata = component_name + "_" + component_code + '_' + this.state.count

        formData.append('comp_name', component_name);
        formData.append('comp_code', component_code);
        console.log(compdata)
        // formData.append('file', blob, compdata + '.png')
        axios.post('http://127.0.0.1:5000/Train', formData, {
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
                }, 1000);
            })
            .catch(error => {
                console.log('error', error);
            })
    }
    submitForm = () => {
        console.log(this.state.component_name, this.state.component_code)

        let compData = {
            component_name: this.state.component_name,
            component_code: this.state.component_code,
        }
        sessionStorage.removeItem("compData")
        sessionStorage.setItem("compData", JSON.stringify(compData))
    }

    getNegImage = (Image_path, type) => {
        console.log(type)
        if (Image_path === undefined) {
            return ""
        }
        else {
            if (type === "not ok") {
                let baseurl = 'http://127.0.0.1:8000/'
                let result = Image_path
                let output = baseurl + result
                return output
            } else {
                return ""
            }
        }

    }
    getImage = (Image_path, type) => {
        if (Image_path === undefined) {
            return ""
        }
        else {
            if (type === "ok") {
                let baseurl = 'http://127.0.0.1:8000/'
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

    newbtnname = () => {
        let label_name1 = this.state.real
        let label_name2 = this.state.fake

        console.log("name", this.state.real)
        console.log(`add_label`, this.state.add_label.length)
        console.log(`label_name`, label_name1)
        let component_code = component_code1
        let component_name = component_name1
        console.log(`component_name`, component_name)
        try {
            axios.post('http://127.0.0.1:5000/add_label', { 'comp_name': component_name, 'comp_code': component_code, 'label1': label_name1, 'label2': label_name2 },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log(data)
                    if (data === "created") {
                        alert("created")                       
                    }
                    else
                        alert("Already created")

                })
                .catch((error) => {

                    console.log(error)
                })
        } catch (error) {

        }
        if (this.state.add_label.length < 2) {
            let data = { id: this.state.add_label.length + 1, btn_name: label_name1,  }
            let data2 = {id: this.state.add_label.length + 2, btn_name: label_name2, content: []}
            if(label_name1 !== "" && label_name2 !== "")
            {
                let newData = [...this.state.add_label, data, data2]
                console.log(`data`, data)
                this.setState({ add_label: newData, real: "", fake: "" })
            }
            else if(label_name1 !== "")
            {
                let newData = [...this.state.add_label, data]
                console.log(`data`, data)
                this.setState({ add_label: newData, real: "", fake: "" })
            }
            else if(label_name2 !== "")
            {
                let newData = [...this.state.add_label, data2]
                console.log(`data`, data)
                this.setState({ add_label: newData, real: "", fake: "" }) 
            }           
            
        }

    }

    labelClick = (data) => {
        console.log(`object`, data)
        let showContent = data
        console.log(`log`, showContent)
        this.setState({ showContent, showCamera: true })
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
                                                                <Input type="text"   placeholder="Enter Your fake component name" value={this.state.fake} onChange={(e) => this.setState({ fake: e.target.value })} />
                                                            </Col>
                                                        </div>
                                                        <div>

                                                            <Button color="primary" className="w-md m-1" onClick={() => this.newbtnname()}>ADD</Button>
                                                            <div>
                                                                {
                                                                    this.state.add_label.map((data, index) => (
                                                                        <Col className="mt-2" key={index}>
                                                                            <Button color={index ? 'primary' : 'success'} onClick={() => this.labelClick(data)}>{data.btn_name}</Button>{""}

                                                                        </Col>
                                                                    ))
                                                                }

                                                            </div>

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
                                                                {/* <h1>Face Authentication</h1> */}
                                                                <label>{this.state.showContent.btn_name} component</label>

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

                                                                        <Button color="primary" className="w-md m-1" onClick={() => this.posClick(this.state.showContent.btn_name)}>Add</Button>
                                                                    </div>
                                                                </Col>
                                                            </div>

                                                        </CardBody>
                                                    </Card>
                                                    :
                                                    null
                                            }
                                            
                                            <Card>
                                                {/* <CardBody>
                      {this.state.imageSrc ? <img src={this.state.imageSrc} alt='preview' /> :null}
                    </CardBody> */}
                                                <Row>
                                                    <label>
                                                        Label Name:  </label>
                                                    {
                                                        this.state.dataset.map((data, index) => (
                                                            // console.log("type", data.type)
                                                            this.getImage(data.Image_path, data.type) !== "" &&

                                                            <Col className="mt-2" key={index}>
                                                                <img src={this.getImage(data.Image_path, data.type)} style={{ width: 100, height: 'auto' }} />
                                                            </Col>

                                                        ))
                                                    }
                                                </Row>
                                                <Row>
                                                    {
                                                        this.state.imageArray.map((data, index) => (
                                                            <Col className="mt-2" key={index}>
                                                                <img src={data} alt='preview' height={'auto'} width={100} onClick={() => this.setState({ isGallery: true, photoIndex: index })} />
                                                            </Col>
                                                        ))
                                                    }
                                                </Row>
                                            </Card>
                                            <Card>
                                                <CardBody>
                                                    <Row>
                                                        <label>
                                                            Label Name: </label>
                                                        {
                                                            this.state.dataset.map((datas, index) => (
                                                                this.getNegImage(datas.Image_path, datas.type) !== "" &&
                                                                <Col className="mt-2" key={index}>
                                                                    <img src={this.getNegImage(datas.Image_path, datas.type)} style={{ width: 100, height: 'auto' }} />
                                                                </Col>

                                                            ))
                                                        }
                                                    </Row>
                                                    <Row>
                                                        {
                                                            this.state.imgArray.map((data, index) => (
                                                                <Col className="mt-2" key={index}>
                                                                    <img src={data} alt='preview' height={'auto'} width={100} onClick={() => this.setState({ isgallery: true, photoIndex: index })} />
                                                                </Col>
                                                            ))
                                                        }
                                                    </Row>
                                                </CardBody>
                                            </Card>
                                            <Card>
                                                <CardBody>
                                                    <div style={{ textAlign: "center" }} >
                                                        <Button color="primary"
                                                            className="w-md m-1"
                                                            onClick={() => this.trainClick()}> TRAIN </Button>
                                                    </div>
                                                </CardBody>
                                            </Card>

                                        </Col>
                                    </Row>
                                    <Link to="/inspect">
                                        <Col xl="12" lg="8" sm="12" style={{ textAlign: "end", fontSize: "22px" }}>
                                            <div onClick={() => this.submitForm()}>Next<i className="dripicons-arrow-right mx-3 pt-2" style={{}} /></div>
                                            {/* <div>Next<i className="dripicons-arrow-right mx-3 pt-2" style={{}} /></div> */}
                                        </Col>
                                    </Link>
                                </Container>
                        }
                        {/* container-fluid */}
                        {this.state.isGallery ? (
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

                        {this.state.isgallery ? (
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


