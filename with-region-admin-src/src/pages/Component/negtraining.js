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

class Negtraining extends Component {
    constructor(props) {
        super(props);
        this.state = {
            component_code: "",
            component_name: "",
            response_message: "",
            imageSrc: null,
            imageArray: [],
            loading: false,
            tab: 0,
            count: 1,
            counts: 1,
            photoIndex: 0,
            datasets: []
        }
    }
    componentDidMount = () => {

        var compData = JSON.parse(sessionStorage.getItem("compData"))

        console.log(compData)

        component_code1 = compData.component_code
        component_name1 = compData.component_name
        let datasets = compData.datasets
        if(datasets === undefined)
        {            
            this.setState({ component_name: component_name1, component_code: component_code1})
        }
        else
        {
            this.setState({ component_name: component_name1, component_code: component_code1, datasets })
        }

        this.setState({ component_name: component_name1, component_code: component_code1 })

    };

    negClick = async (event) => {
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

        let compdata = component_name + "_" + component_code

        formData.append('comp_name', component_name);
        formData.append('comp_code', component_code);
        console.log(compdata)
        formData.append('datasets', blob, compdata + '.png')
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
    //   negClick = async (event) => {
    //     //event.preventDefault();    
    //     this.AppCall(event)
    //   }

    //   AppCall = async (event) => {
    //     const imageSrc = this.webcam.getScreenshot();
    //     console.log(imageSrc)
    //     const blob = await fetch(imageSrc).then((res) => res.blob());
    //     console.log(blob)
    //     const formData = new FormData();
    //     //formData.append('file', blob)
    //     // let u_id = uuid()
    //     // console.log(u_id)    
    //     let component_code = component_code1
    //     let component_name = component_name1

    //     let compdata = component_name + "_" + component_code + '_' + this.state.counts

    //     formData.append('comp_name', component_name);
    //     formData.append('comp_code', component_code);
    //     console.log(compdata)
    //     formData.append('file', blob, compdata + '.png')
    //     axios.post('http://127.0.0.1:5000/add_negimage', formData, {
    //       headers: {
    //         'content-type': 'multipart/form-data'
    //       },
    //       mode: 'no-cors'
    //     })
    //       .then(response => {
    //         console.log('success', response.data);
    //         this.setState({ response_message: response.data, counts: this.state.counts + 1 })
    //         setTimeout(() => {
    //           this.setState({ response_message: "" })
    //         }, 1000);
    //       })
    //       .catch(error => {
    //         console.log('error', error);
    //       })
    //   }
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

    getImage = (image_path, type) => {
        if (image_path === undefined) {
            return ""
        }
        else {
            if (type === "Negative") {
                let baseurl = 'http://127.0.0.1:8000/'
                let result = image_path
                let output = baseurl + result
                return output
            }else{
                return ""
            }
        }

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

                                                <div className="row justify-content-end">
                                                    <Col sm={12} style={{ textAlign: "center" }}>
                                                        <div>

                                                            {/* <Button
                                //type="submit"
                                color="primary"
                                className="w-md m-1"
                                onClick={() => this.posClick()}
                              >
                                POSITIVE
                              </Button>{" "} */}
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
                                                {
                                                    this.state.datasets.map((data, index) => (
                                                        this.getImage(data.image_path, data.type) !== "" &&
                                                        <Col className="mt-2" key={index}>
                                                            <img src={this.getImage(data.image_path, data.type)} style={{ width: 100, height: 'auto' }} />
                                                        </Col>

                                                    ))
                                                }
                                            </Row>
                                            <Row>
                                                {
                                                    this.state.imageArray.map((data, index) => (
                                                        <Col className="mt-2" key={index}>
                                                            <img src={data} alt='preview' height={75} width={'auto'} onClick={() => this.setState({ isGallery: true, photoIndex: index })} />
                                                        </Col>
                                                    ))
                                                }
                                            </Row>
                                        </Card>
                                        <Card>
                                            <CardBody>
                                                <div style={{ textAlign: "center" }} >
                                                    <Button color="primary"
                                                        className="w-md m-1"
                                                        onClick={() => this.trainClick()}>TRAIN NOT OK COMPONENT</Button>
                                                </div>
                                            </CardBody>
                                        </Card>

                                    </Col>
                                </Row>
                                <Link to="/inspect">
                                    <Col xl="12" lg="8" sm="12" style={{ textAlign: "end", fontSize: "22px" }}>
                                        <div onClick={() => this.submitForm()}>Next<i className="dripicons-arrow-right mx-3 pt-2" style={{}} /></div>
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
                </div>
            </React.Fragment>
        );
    }
}


export default Negtraining;
