import React, { Component } from "react";
import MetaTags from 'react-meta-tags';
import {    Card,    Col,    Container,    Row,    CardBody,    CardTitle,    Label,    Button,    Form,    Input,    InputGroup,} from "reactstrap";
import axios from "axios";
import Webcam from "react-webcam";
import './index.css';
//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { css } from "@emotion/react"
import { MoonLoader } from "react-spinners"

let component_code1 = ""
let component_name1 = ""

class Inspection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            component_code: "",
            component_name: "",
            response_message: "",
            screenshot: null,
            startCapture: true,
            loading: false,
            showresult:false,
            tab: 0,
            count: 1,
            img_url: '',
            Datasets: [],
            x1:null,
            y1:null,
            x2:null,
            y2:null,
        }
            this.webcam = React.createRef();
            this.canvasRef = React.createRef();
            
    }

    componentDidMount = () => {

        var compData = JSON.parse(sessionStorage.getItem("compData"))

        console.log(":::::::", compData)

        component_code1 = compData.component_code
        component_name1 = compData.component_name
        let Datasets = compData.Datasets
        console.log(`datasets`, Datasets)
        if (Datasets === undefined) {
            this.setState({ component_name: component_name1, component_code: component_code1 })
        }
        else {
            this.setState({ component_name: component_name1, component_code: component_code1, Datasets })
        }
        let Rectbox_x1 = compData.x1
        console.log('Rectbox_x1', Rectbox_x1)
        let Rectbox_y1 = compData.y1
        let Rectbox_x2 = compData.x2
        let Rectbox_y2 = compData.y2
        this.setState({x1:Rectbox_x1, y1:Rectbox_y1, x2:Rectbox_x2, y2:Rectbox_y2})

        //this.setState({ img_url: 'http://127.0.0.1:8000/Datasets/component_1001/Positive/component_1001_1.png' })
        // C:\Users\EPRM_ROG\Desktop\comp_Inspect_Api\Datasets\material_567\Positive\material_567_1.png     
        this.handleClick()
        this.rectBox()
    };
    rectBox = async () => {
        console.log("Handpose model loaded.");
        //  Loop and detect hands
        setInterval(() => {
          this.detect();
        }, 10);
      };
    


      detect = async () => {
        // Check data is available
        //console.log(this.state.x1,"..........")
        if (
          typeof this.webcam.current !== "undefined" &&
          this.webcam.current !== null &&
          this.webcam.current.video.readyState === 4
        ) {
          // Get Video Properties
          const video = this.webcam.current.video;
          const videoWidth = this.webcam.current.video.videoWidth;
          const videoHeight = this.webcam.current.video.videoHeight;
          console.log('videoWidth', videoWidth)
          console.log('videoHeight', videoHeight)
    
          // Set video width
        //   this.webcam.current.video.width = videoWidth;
        //   this.webcam.current.video.height = videoHeight;
    
          // Set canvas height and width
          this.canvasRef.current.width = 751;
          this.canvasRef.current.height = 563;
    
          // Make Detections
    
          // Draw mesh
          const ctx = this.canvasRef.current.getContext("2d");
          ctx.rect(this.state.x1, this.state.y1, this.state.x2,  this.state.y2);
          //ctx.rect(20,55,700, 480);
          //ctx.rect(195,159,511,472)
          ctx.lineWidth = "2";
          ctx.strokeStyle = "red";
          ctx.stroke();
          //drawRect(obj, ctx); 
        }
      };


    stopClick = () => {
        this.setState({ startCapture: false })
    }


    handleClick = async (event) => {
        //event.preventDefault();
        var i = 0;
        setInterval(() => {
            if (this.state.startCapture) {
                this.APICall(event)
            }
            i++;
        }, 1000)
    }

    APICall = async (event) => {
        const imageSrc = this.webcam.current.getScreenshot();
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
        formData.append('Datasets', blob, compdata + '.png')
        axios.post('https://49.207.181.236:5000/Testing', formData, {
            headers: {
                'content-type': 'multipart/form-data'
            },
            mode: 'no-cors'
        })
            .then(response => {
                // this.setState({
                //     projects: response.data
                // });
                console.log(`success`, response.data)
                if(response.data.status === undefined && response.data.value === undefined)
                {
                    this.setState({ response_msg: response.data, showresult: true})
                }
                else
                {
                    console.log('success', response.data.status, response.data.value);
                    this.setState({ response_message: response.data.status, response_value: parseFloat(response.data.value).toFixed(2), showresult:false })
                }            
                
                // setTimeout(() => {
                //     this.setState({ response_message: "" })
                // }, 1000);
            })
            .catch(error => {
                console.log('error', error);
            })
    }

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
    //     formData.append('Datasets', blob, compdata + '.png')
    //     axios.post('http://127.0.0.1:5000/Accept', formData, {
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
    // rejectClick = async (event) => {

    //     this.setState({ startCapture: false })
    //     this.rejectCall(event)

    // }

    // rejectCall = async (event) => {
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
    //     formData.append('file', blob, compdata + '.png')
    //     axios.post('http://127.0.0.1:5000/Reject', formData, {
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

    // getImage = (data1) => {
    //     if (data1 !== undefined) {
    //         console.log('data1', data1)
    //         let baseurl = 'http://127.0.0.1:8000/'
    //         let result = data1[0].Image_path
    //         let output = baseurl + result
    //         return output
    //     }
    //     else {
    //         return null
    //     }

    // }

    getImage = (Image_path, type) => {
        console.log(`Image_path`, Image_path)
        if (Image_path === undefined) {
            return ""
        }
        let baseurl = 'https://49.207.181.236:8000/'
        let result = Image_path
        console.log(`result`, result)
        let output = baseurl + result
        return output

    }
    render() {
        // const webcamRef = React.useRef(null); const capture = React.useCallback( () => { const imageSrc = webcamRef.current.getScreenshot(); }, [webcamRef] );
        const videoConstraints = {
            facingMode: "user",
            exact: "environment"
        };
        const override = css`display: block; margin: 0 auto; border-color: red;`;
        return (
            <React.Fragment>
                <div className="page-content">
                    <MetaTags>
                        <title> Dashboard Template</title>
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
                                                <CardTitle className="mb-4">Testing</CardTitle>

                                                <div className="containerImg">
                                                   
                                                    {/* {
                                                        //this.state.response_value>0.90 && this.state.response_value<0.95 ?
                                                        <div>
                                                            <Button className="me-2" color="success" onClick={() => this.acceptClick()} > POSITIVE </Button>
                                                            <Button className="me-2" color="danger" onClick={() => this.rejectClick()}> NEGATIVE </Button>
                                                        </div>
                                                        //: null
                                                    } */}

                                                    <Webcam
                                                        videoConstraints={videoConstraints}
                                                        audio={true}
                                                        height={'auto'}
                                                        screenshotFormat="image/png"
                                                        width={'100%'}
                                                        ref={this.webcam}

                                                        muted={true}
                                                       
                                                        // style={{
                                                        //      position: "absolute",
                                                        //  marginLeft: "auto", marginRight: "auto", left: 0, right: 0, textAlign: "center", zindex: 9, width: 640, height: 480, }}
                                                    />
                                                    
                                                     <div className="centered mt-2" >
                                                        {
                                                            this.state.showresult ?
                                                                <div style={{
                                                                    background: "white",
                                                                    color:
                                                                       this.state.response_msg === "No Objects Detected" ? 'red':
                                                                       null
                                                                }}>
                                                                    {this.state.response_msg}
                                                                </div> :
                                                                <div style={{
                                                                    background: "white",
                                                                    color:
                                                                        this.state.response_message === "Match" ? 'green' :
                                                                            this.state.response_message === "No Match" ? 'red' :
                                                                                this.state.response_message === "Possible Match" ? 'orange' :
                                                                                    null
                                                                }}>
                                                                    {this.state.response_message}{" "}{this.state.response_value}
                                                                </div>
                                                        }                                                        
                                                    </div>
                                                    <canvas
                                                        ref={this.canvasRef}
                                                        style={{ position: "absolute", marginLeft: "auto", marginRight: "auto", left: 0, right: 0, textAlign: "center", zindex: 8, width: "100%", height: "auto", }}
                                                    />
                                                </div>
                                                <div>
                                                    {/* <button type="submit" className="btn btn-primary w-md" onClick={() => this.handleClick()}>
                                                        Submit
                                                    </button>{"  "} */}
                                                    <button type="stop" className="btn btn-primary w-md" onClick={() => this.stopClick()}>
                                                        Stop
                                                    </button>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </Col>

                                    <Col lg={6}>
                                        <Card>
                                            <CardBody>
                                                <CardTitle className="mb-6">Reference Component</CardTitle>
                                                <label>Component Name: {this.state.component_name}</label> {" , "}
                                                <label>Component Code: {this.state.component_code}</label>
                                                <br />
                                                <div>
                                                    <Row>
                                                        {
                                                            this.state.Datasets.map((data, index) => (

                                                                this.getImage(data.Image_path, data.type) !== "" &&
                                                                index === 0 && <Col key={index}>
                                                                    <img src={this.getImage(data.Image_path, data.type)} />
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
                    }
                    {/* container-fluid */}

                </div>
            </React.Fragment>
        );

    }

}

export default Inspection;
