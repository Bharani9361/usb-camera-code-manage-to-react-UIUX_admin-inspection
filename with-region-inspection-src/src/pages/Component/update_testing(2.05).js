// import React, { Component } from "react";
// import MetaTags from 'react-meta-tags';
// import {    Card,    Col,    Container,    Row,    CardBody,    CardTitle,    Label,    Button,    Form,    Input,    InputGroup,} from "reactstrap";
// import axios from "axios";
// import Webcam from "react-webcam";
// import './index.css';
// //Import Breadcrumb
// import Breadcrumbs from "../../components/Common/Breadcrumb";
// import { css } from "@emotion/react"
// import { MoonLoader } from "react-spinners"

// let component_code1 = ""
// let component_name1 = ""

// class Inspection extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             component_code: "",
//             component_name: "",
//             response_message: "",
//             screenshot: null,
//             startCapture: true,
//             loading: false,
//             showresult:false,
//             tab: 0,
//             count: 1,
//             img_url: '',
//             Datasets: [],
//             // x1:null,
//             // y1:null,
//             // x2:null,
//             // y2:null,
//         }
//             // this.webcam = React.createRef();
//             // this.canvasRef = React.createRef();

//     }

//     componentDidMount = () => {

//         var compData = JSON.parse(sessionStorage.getItem("compData"))

//         console.log(":::::::", compData)

//         component_code1 = compData.component_code
//         component_name1 = compData.component_name
//         let Datasets = compData.Datasets
//         console.log(`datasets`, Datasets)
//         if (Datasets === undefined) {
//             this.setState({ component_name: component_name1, component_code: component_code1 })
//         }
//         else {
//             this.setState({ component_name: component_name1, component_code: component_code1, Datasets })
//         }
//         // let Rectbox_x1 = compData.x1
//         // console.log('Rectbox_x1', Rectbox_x1)
//         // let Rectbox_y1 = compData.y1
//         // let Rectbox_x2 = compData.x2
//         // let Rectbox_y2 = compData.y2
//         // this.setState({x1:Rectbox_x1, y1:Rectbox_y1, x2:Rectbox_x2, y2:Rectbox_y2})

//         //this.setState({ img_url: 'http://127.0.0.1:8000/Datasets/component_1001/Positive/component_1001_1.png' })
//         // C:\Users\EPRM_ROG\Desktop\comp_Inspect_Api\Datasets\material_567\Positive\material_567_1.png     
//         this.handleClick()
//         //this.rectBox()
//     };
//     rectBox = async () => {
//         console.log("Handpose model loaded.");
//         //  Loop and detect hands
//         setInterval(() => {
//           this.detect();
//         }, 10);
//       };



//       detect = async () => {
//         // Check data is available
//         //console.log(this.state.x1,"..........")
//         if (
//           typeof this.webcam.current !== "undefined" &&
//           this.webcam.current !== null &&
//           this.webcam.current.video.readyState === 4
//         ) {
//           // Get Video Properties
//           const video = this.webcam.current.video;
//           const videoWidth = this.webcam.current.video.videoWidth;
//           const videoHeight = this.webcam.current.video.videoHeight;

//           // Set video width
//         //   this.webcam.current.video.width = videoWidth;
//         //   this.webcam.current.video.height = videoHeight;

//           // Set canvas height and width
//           this.canvasRef.current.width = videoWidth;
//           this.canvasRef.current.height = videoHeight;

//           // Make Detections

//           // Draw mesh
//           const ctx = this.canvasRef.current.getContext("2d");
//           ctx.rect(this.state.x1, this.state.y1, this.state.x2,  this.state.y2);
//           ctx.lineWidth = "2";
//           ctx.strokeStyle = "red";
//           ctx.stroke();
//           //drawRect(obj, ctx); 
//         }
//       };


//     stopClick = () => {
//         this.setState({ startCapture: false })
//     }


//     handleClick = async (event) => {
//         //event.preventDefault();
//         var i = 0;
//         setInterval(() => {
//             if (this.state.startCapture) {
//                 this.APICall(event)
//             }
//             i++;
//         }, 1000)
//     }

//     APICall = async (event) => {
//         const imageSrc = this.webcam.current.getScreenshot();
//         const blob = await fetch(imageSrc).then((res) => res.blob());
//         console.log(blob)
//         const formData = new FormData();
//         //formData.append('file', blob)
//         // let u_id = uuid()
//         // console.log(u_id)    
//         let component_code = component_code1
//         let component_name = component_name1

//         let compdata = component_name + "_" + component_code + '_' + this.state.count

//         formData.append('comp_name', component_name);
//         formData.append('comp_code', component_code);
//         console.log(compdata)
//         formData.append('Datasets', blob, compdata + '.png')
//         axios.post('https://172.16.1.91:5000/Testing', formData, {
//             headers: {
//                 'content-type': 'multipart/form-data'
//             },
//             mode: 'no-cors'
//         })
//             .then(response => {
//                 // this.setState({
//                 //     projects: response.data
//                 // });
//                 console.log(`success`, response.data)
//                 if(response.data.status === undefined && response.data.value === undefined)
//                 {
//                     this.setState({ response_msg: response.data, showresult: true})
//                 }
//                 else
//                 {
//                     console.log('success', response.data.status, response.data.value);
//                     this.setState({ response_message: response.data.status, response_value: parseFloat(response.data.value).toFixed(2), showresult:false })
//                 }            

//                 // setTimeout(() => {
//                 //     this.setState({ response_message: "" })
//                 // }, 1000);
//             })
//             .catch(error => {
//                 console.log('error', error);
//             })
//     }

//     // acceptClick = async (event) => {

//     //     this.setState({ startCapture: false })
//     //     this.appCall(event)

//     // }

//     // appCall = async (event) => {
//     //     this.setState({ loading: true })
//     //     const imageSrc = this.webcam.getScreenshot();
//     //     const blob = await fetch(imageSrc).then((res) => res.blob());
//     //     console.log(blob)
//     //     const formData = new FormData();
//     //     //formData.append('file', blob)
//     //     // let u_id = uuid()
//     //     // console.log(u_id)    
//     //     let component_code = component_code1
//     //     let component_name = component_name1

//     //     let compdata = component_name + "_" + component_code

//     //     formData.append('comp_name', component_name);
//     //     formData.append('comp_code', component_code);
//     //     console.log(compdata)
//     //     formData.append('Datasets', blob, compdata + '.png')
//     //     axios.post('http://127.0.0.1:5000/Accept', formData, {
//     //         headers: {
//     //             'content-type': 'multipart/form-data'
//     //         },
//     //         mode: 'no-cors'
//     //     })
//     //         .then(response => {
//     //             // this.setState({
//     //             //     projects: response.data
//     //             // });
//     //             console.log('success', response.data.status, response.data.value);
//     //             //this.setState({ response_message: response.data.status, response_value: parseFloat(response.data.value).toFixed(2) })
//     //             this.setState({ response_message: response.data, loading: false })
//     //             // setTimeout(() => {
//     //             //     this.setState({ response_message: "" })
//     //             // }, 1000);
//     //             this.setState({ startCapture: true })

//     //         })
//     //         .catch(error => {
//     //             console.log('error', error);
//     //         })
//     // }
//     // rejectClick = async (event) => {

//     //     this.setState({ startCapture: false })
//     //     this.rejectCall(event)

//     // }

//     // rejectCall = async (event) => {
//     //     this.setState({ loading: true })
//     //     const imageSrc = this.webcam.getScreenshot();
//     //     const blob = await fetch(imageSrc).then((res) => res.blob());
//     //     console.log(blob)
//     //     const formData = new FormData();
//     //     //formData.append('file', blob)
//     //     // let u_id = uuid()
//     //     // console.log(u_id)    
//     //     let component_code = component_code1
//     //     let component_name = component_name1

//     //     let compdata = component_name + "_" + component_code

//     //     formData.append('comp_name', component_name);
//     //     formData.append('comp_code', component_code);
//     //     console.log(compdata)
//     //     formData.append('file', blob, compdata + '.png')
//     //     axios.post('http://127.0.0.1:5000/Reject', formData, {
//     //         headers: {
//     //             'content-type': 'multipart/form-data'
//     //         },
//     //         mode: 'no-cors'
//     //     })
//     //         .then(response => {
//     //             // this.setState({
//     //             //     projects: response.data
//     //             // });
//     //             console.log('success', response.data.status, response.data.value);
//     //             //this.setState({ response_message: response.data.status, response_value: parseFloat(response.data.value).toFixed(2) })
//     //             this.setState({ response_message: response.data, loading: false })
//     //             // setTimeout(() => {
//     //             //     this.setState({ response_message: "" })
//     //             // }, 1000);
//     //             this.setState({ startCapture: true })

//     //         })
//     //         .catch(error => {
//     //             console.log('error', error);
//     //         })
//     // }

//     // getImage = (data1) => {
//     //     if (data1 !== undefined) {
//     //         console.log('data1', data1)
//     //         let baseurl = 'http://127.0.0.1:8000/'
//     //         let result = data1[0].image_path
//     //         let output = baseurl + result
//     //         return output
//     //     }
//     //     else {
//     //         return null
//     //     }

//     // }

//     getImage = (image_path, type) => {
//         console.log(`image_path`, image_path)
//         if (image_path === undefined) {
//             return ""
//         }
//         let baseurl = 'https://172.16.1.91:8000/'
//         let result = image_path
//         console.log(`result`, result)
//         let output = baseurl + result
//         return output

//     }
//     render() {
//         // const webcamRef = React.useRef(null); const capture = React.useCallback( () => { const imageSrc = webcamRef.current.getScreenshot(); }, [webcamRef] );
//         const videoConstraints = {
//             facingMode: "user",
//             exact: "environment"
//         };
//         const override = css`display: block; margin: 0 auto; border-color: red;`;
//         return (
//             <React.Fragment>
//                 <div className="page-content">
//                     <MetaTags>
//                         <title> Dashboard Template</title>
//                     </MetaTags>
//                     {
//                         this.state.loading ?
//                             <Container fluid>
//                                 {
//                                     this.state.loading ? <div className="sweet-loading">
//                                         <MoonLoader color={'#2f8545'} loading={this.state.loading} css={override} size={75} />
//                                         <div className="text-center mt-2">
//                                             Training in progress...
//                                         </div>
//                                     </div> : null
//                                 }
//                             </Container>
//                             :
//                             <Container fluid={true}>
//                                 <Breadcrumbs title="Forms" breadcrumbItem="Form Layouts" />
//                                 <Row>
//                                     <Col lg={6}>
//                                         <Card>
//                                             <CardBody>
//                                                 <CardTitle className="mb-4">Testing</CardTitle>

//                                                 <div className="containerImg">

//                                                     {/* {
//                                                         //this.state.response_value>0.90 && this.state.response_value<0.95 ?
//                                                         <div>
//                                                             <Button className="me-2" color="success" onClick={() => this.acceptClick()} > POSITIVE </Button>
//                                                             <Button className="me-2" color="danger" onClick={() => this.rejectClick()}> NEGATIVE </Button>
//                                                         </div>
//                                                         //: null
//                                                     } */}

//                                                     <Webcam
//                                                         videoConstraints={videoConstraints}
//                                                         audio={true}
//                                                         height={'auto'}
//                                                         screenshotFormat="image/png"
//                                                         width={'100%'}
//                                                         ref={this.webcam}

//                                                         //muted={true}
//                                                         // style={{
//                                                             //  position: "absolute",
//                                                         //  marginLeft: "auto", marginRight: "auto", left: 0, right: 0, textAlign: "center", zindex: 9, width: 640, height: 480, }}
//                                                     />
//                                                      <div className="centered mt-2" >
//                                                         {
//                                                             this.state.showresult ?
//                                                                 <div style={{
//                                                                     background: "white",
//                                                                     color:
//                                                                        this.state.response_msg === "No Objects Detected" ? 'red':
//                                                                        null
//                                                                 }}>
//                                                                     {this.state.response_msg}
//                                                                 </div> :
//                                                                 <div style={{
//                                                                     background: "white",
//                                                                     color:
//                                                                         this.state.response_message === "Match" ? 'green' :
//                                                                             this.state.response_message === "No Match" ? 'red' :
//                                                                                 this.state.response_message === "Possible Match" ? 'orange' :
//                                                                                     null
//                                                                 }}>
//                                                                     {this.state.response_message}{" "}{this.state.response_value}
//                                                                 </div>
//                                                         }                                                        
//                                                     </div>
//                                                     {/* <canvas
//                                                         ref={this.canvasRef}
//                                                         style={{ position: "absolute", marginLeft: "auto", marginRight: "auto", left: 0, right: 0, textAlign: "center", zindex: 8, width: "100%", height: "auto", }}
//                                                     /> */}
//                                                 </div>
//                                                 <div>
//                                                     {/* <button type="submit" className="btn btn-primary w-md" onClick={() => this.handleClick()}>
//                                                         Submit
//                                                     </button>{"  "} */}
//                                                     <button type="stop" className="btn btn-primary w-md" onClick={() => this.stopClick()}>
//                                                         Stop
//                                                     </button>
//                                                 </div>
//                                             </CardBody>
//                                         </Card>
//                                     </Col>

//                                     <Col lg={6}>
//                                         <Card>
//                                             <CardBody>
//                                                 <CardTitle className="mb-6">Reference Component</CardTitle>
//                                                 <label>Component Name: {this.state.component_name}</label> {" , "}
//                                                 <label>Component Code: {this.state.component_code}</label>
//                                                 <br />
//                                                 <div>
//                                                     <Row>
//                                                         {
//                                                             this.state.Datasets.map((data, index) => (

//                                                                 this.getImage(data.image_path, data.type) !== "" &&
//                                                                 index === 0 && <Col key={index}>
//                                                                     <img src={this.getImage(data.image_path, data.type)} />
//                                                                 </Col>

//                                                             ))
//                                                         }
//                                                     </Row>

//                                                     {/* <img src={this.state.img_url} width="100%" /> */}
//                                                 </div>
//                                             </CardBody>
//                                         </Card>
//                                     </Col>
//                                 </Row>
//                             </Container>
//                     }
//                     {/* container-fluid */}

//                 </div>
//             </React.Fragment>
//         );

//     }

// }

// export default Inspection;

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
    Table,
    Form,
    Input,
    InputGroup,
} from "reactstrap";
import axios from "axios";
import Webcam from "react-webcam";
import './index.css';
//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { css } from "@emotion/react"
import { MoonLoader } from "react-spinners"
import { Modal } from 'antd';
import 'antd/dist/antd.css';
import { batch } from "react-redux";
import PropTypes from "prop-types"

let component_code1 = ""
let component_name1 = ""
let positive = ""
let negative = ""
let batch_id = ""
class Inspection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            component_code: "",
            component_name: "",
            response_message: "",
            comp_id:"",
            batch_data: [],
            batch_table:[],
            aggbatch_table:[],
            start_time:"",
            end_time:"",
            total_time:"",
            screenshot: null,
            startCapture: true,
            loading: false,
            showModal: false,
            modal_data: {},
            tab: 0,
            count: 1,
            img_url: '',
            datasets: []
        }
    }

    componentDidMount = () => {

        var compData = JSON.parse(sessionStorage.getItem("compData"))
        console.log(compData)
        let v_id = compData._id
        console.log('first', v_id)
        component_code1 = compData.component_code
        component_name1 = compData.component_name
        positive = compData.positive
        negative = compData.negative
        batch_id = compData.batch_id
        console.log('batch_id', batch_id)
        let datasets = compData.datasets
        // console.log(`datasets`, datasets)
        if (datasets === undefined) {
            this.setState({ component_name: component_name1, component_code: component_code1, comp_id:v_id })
        }
        else {
            this.setState({ component_name: component_name1, component_code: component_code1, datasets, comp_id:v_id })
        }

        //this.setState({ img_url: 'http://127.0.0.1:8000/Datasets/component_1001/positive/component_1001_1.png' })
        // C:\Users\EPRM_ROG\Desktop\comp_Inspect_Api\Datasets\material_567\positive\material_567_1.png     
        this.handleClick()
    };  


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
    
    APICall = async (event) => {
        let starttime = this.getDate()
        console.log('starttime', starttime)
        const imageSrc = this.webcam.getScreenshot();
        const blob = await fetch(imageSrc).then((res) => res.blob());
        // console.log(blob)
        const formData = new FormData();
        //formData.append('file', blob)
        // let u_id = uuid()
        // console.log(u_id)  
        // const date = moment(new Date()).format("DD/MM/YYYY")
        let date = this.getDate()
        let replace = date.replaceAll(":", "_");
        console.log('replace', replace)

        // let time = new Date().toLocaleString();

        let today = new Date();
        console.log('date', date)
        let yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0!
        let dd = today.getDate();
        let _today = dd + '/' + mm + '/' + yyyy

        let hours = today.getHours()
        let min = today.getMinutes()
        let secc = today.getSeconds()
        let time = hours + ':' + min + ':' + secc

        console.log('time', time)
        let component_code = component_code1
        let component_name = component_name1
        let vpositive = positive
        let vnegative = negative
        let batchid = batch_id

        let compdata = component_name + "_" + component_code + '_' + replace

        formData.append('comp_name', component_name);
        formData.append('comp_code', component_code);
        formData.append('comp_id', this.state.comp_id);
        formData.append('positive', vpositive);
        formData.append('negative', vnegative);
        formData.append('inspected_ondate', date)
        formData.append('start_time', date)
        formData.append('inspected_ontime', time)
        formData.append('date', _today)
        formData.append('batch_id', batchid)

        // console.log(compdata)
        formData.append('datasets', blob, compdata + '.png')
        axios.post('https://172.16.1.91:5000/Testing', formData, {
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
                //let date = this.getDate()
                //console.log('endtime', date)
                if (response.data.status === undefined && response.data.value === undefined) {
                    this.setState({ response_msg: response.data, showresult: true })
                }
                else {
                    console.log('success', response.data.status, response.data.value);
                    // this.setState({ response_message: response.data.status, response_value: parseFloat(response.data.value).toFixed(2), showresult: false })
                    this.setState({ response_message: response.data.status, response_value: response.data.value, showresult: false })
                }
                // setTimeout(() => {
                //     this.setState({ response_message: "" })
                // }, 1000);
            })
    }



    stopClick = () => {
        this.setState({ startCapture: false })
        let batchid = batch_id
        console.log('batchid', batchid)

        // console.log({ 'comp_name': comp_name, 'comp_code': comp_code, 'start_Date': startDate, 'end_date': endDate })
        try {
            axios.post('https://172.16.1.91:5000/update_batch', {'_id':batchid },
                { mode: 'no-cors' })
                .then((response) => {
                    let batch_data = response.data
                    console.log("batchdata", batch_data)
                    let batch_table = batch_data[0].batch_info
                    //let old_date = new Date(batch_table[0].start_time).toISOString() 
                    let st_date = new Date(batch_table[0].start_time)  
                    let hr = st_date.getUTCHours()
                    let min = st_date.getUTCMinutes()
                    let secc = st_date.getUTCSeconds()                   
                    let start_time = hr + ':' + min + ':' + (secc.toString().length==1?'0'+secc:secc)
                    console.log('start_time', start_time, secc.toString().length, ' length ', (secc.length==1?'0'+secc:secc))
                    let e_date = new Date(batch_table[0].end_time)
                    
                    let hour = e_date.getUTCHours()
                    let mn = e_date.getUTCMinutes()
                    let sec = e_date.getUTCSeconds()                   
                    let end_time = hour + ':' + mn + ':' + (sec.toString().length==1?'0'+sec:sec)
                    console.log('end_time', end_time)
                    let total_hours = e_date.getTime() - st_date.getTime();
                    console.log('total_hours', total_hours)
                    //let milliseconds = Math.floor((total_hours % 1000) / 100)
                    let seconds = Math.floor((total_hours / 1000) % 60)
                    let minutes = Math.floor((total_hours / (1000 * 60)) % 60)
                    let hours = Math.floor((total_hours / (1000 * 60 * 60)) % 24)

                    hours = (hours < 10) ? "0" + hours : hours;
                    minutes = (minutes < 10) ? "0" + minutes : minutes;
                    seconds = (seconds < 10) ? "0" + seconds : seconds;
                    // let total_time = hours + ":" + minutes + ":" + seconds + "." + milliseconds;
                    let total_time = hours + ":" + minutes + ":" + seconds;
                    console.log('total_time', total_time)
                    let aggbatch_table = batch_data[1].agg_batch
                    console.log('first', batch_table)
                    console.log('second', aggbatch_table)
                    this.setState({ batch_data, batch_table, aggbatch_table, start_time, end_time, total_time})                   
                })
                .catch((error) => {

                    console.log(error)
                })
        } catch (error) {

        }
    }

    acceptClick = async (event) => {

        this.setState({ startCapture: false })
        this.appCall(event)

    }

    appCall = async (event) => {
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
        formData.append('datasets', blob, compdata + '.png')
        axios.post('https://172.16.1.91:5000/Accept', formData, {
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

    // getImage = (data1) => {
    //     if (data1 !== undefined) {
    //         console.log('data1', data1)
    //         let baseurl = 'http://127.0.0.1:8000/'
    //         let result = data1[0].image_path
    //         let output = baseurl + result
    //         return output
    //     }
    //     else {
    //         return null
    //     }

    // }

    getImage = (image_path, type) => {
        // console.log(`image_path`, image_path)
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
                                                    <div className="centered mt-2" >
                                                        {
                                                            this.state.showresult ?
                                                                <div style={{
                                                                    background: "white",
                                                                    color:
                                                                        this.state.response_msg === "No Objects Detected" ? 'red' :
                                                                            null
                                                                }}>
                                                                    {this.state.response_msg}
                                                                </div> :
                                                                <div style={{
                                                                    background: "white",
                                                                    color:
                                                                        this.state.response_message === "ok" ? 'green' :
                                                                            this.state.response_message === "notok" ? 'red' :
                                                                                this.state.response_message === "Possible Match" ? 'orange' :
                                                                                    null
                                                                }}>
                                                                    {this.state.response_message}{" "}{this.state.response_value}
                                                                </div>
                                                        }
                                                    </div>
                                                    {
                                                        //this.state.response_value>0.90 && this.state.response_value<0.95 ?
                                                        // <div>
                                                        //     <Button className="me-2" color="success" onClick={() => this.acceptClick()} > POSITIVE </Button>
                                                        //     <Button className="me-2" color="danger" onClick={() => this.rejectClick()}> NEGATIVE </Button>
                                                        // </div>
                                                        //: null
                                                    }

                                                    <Webcam
                                                        videoConstraints={videoConstraints}
                                                        audio={false}
                                                        height={'auto'}
                                                        screenshotFormat="image/png"
                                                        width={'100%'}
                                                        ref={node => this.webcam = node}
                                                    />
                                                </div>
                                                <div>

                                                    {/* onClick={() => this.setState({ showModal: true, modal_data: data, temp_index: index, image_src: this.getImage(data.captured_image) })} */}
                                                    <Button onClick={() => this.stopClick(this.setState({ showModal: true}))}>stop</Button>
                                                    
                                                </div>

                                            </CardBody>
                                        </Card>
                                    </Col>
                                    <Modal title="Inspection Summary" centered visible={this.state.showModal} onOk={() => {
                                        this.setState({ showModal: false });
                                        this.props.history.push('/crudcomponent')
                                        }} onCancel={() => this.setState({ showModal: false })} width={1000}                                                        >
                                        <div className="table-responsive">
                                            <Table striped>
                                                <thead>
                                                    <tr>
                                                        <th>Component Name</th>
                                                        <th>Component Code</th>                                                        
                                                        <th>Start Time</th>                                                        
                                                        <th>End Time</th>                                                        
                                                        <th>Total Time</th>                                                        
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        this.state.batch_table.map((data, index) => (
                                                            <tr key={index}>
                                                                <td>{data.comp_name}</td>
                                                                <td>{data.comp_code}</td>
                                                                <td>{this.state.start_time}</td>
                                                                <td>{this.state.end_time}</td>
                                                                <td>{this.state.total_time}</td>
                                                            </tr>
                                                        ))
                                                    }

                                                </tbody>
                                            </Table>
                                            <br/>
                                            <Table striped>
                                                <thead>
                                                    <tr>
                                                        <th>No of comp Checked</th>
                                                        <th>OK</th> 
                                                        <th>Not OK</th> 
                                                        <th>Possible Match</th> 
                                                        <th>No Object Detected</th>                                                        
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        this.state.aggbatch_table.map((data, index) => (
                                                            <tr key={index}>
                                                                <td>{data.total}</td>
                                                                <td>{data.ok}</td>
                                                                <td>{data.notok}</td>
                                                                <td>{data.posbl_match}</td>
                                                                <td>{data.no_obj}</td>
                                                            </tr>
                                                        ))
                                                    }

                                                </tbody>
                                            </Table>
                                        </div>
                                    </Modal>

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


