// import React, { Component } from "react";
// import MetaTags from 'react-meta-tags';
// import {
//     Card,
//     Col,
//     Container,
//     Row,
//     CardBody,
//     CardTitle,
//     Label,
//     Button,
//     Form,
//     Input,
//     InputGroup,
// } from "reactstrap";
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
//             tab: 0,
//             count: 1,
//             img_url: '',
//             datasets: []
//         }
//     }

//     componentDidMount = () => {

//         var compData = JSON.parse(sessionStorage.getItem("compData"))
//         console.log(compData)
//         component_code1 = compData.component_code
//         component_name1 = compData.component_name
//         let datasets = compData.datasets
//         console.log(`datasets`, datasets)
//         if (datasets === undefined) {
//             this.setState({ component_name: component_name1, component_code: component_code1 })
//         }
//         else {
//             this.setState({ component_name: component_name1, component_code: component_code1, datasets })
//         }

//         //this.setState({ img_url: 'http://127.0.0.1:8000/Datasets/component_1001/Positive/component_1001_1.png' })
//         // C:\Users\EPRM_ROG\Desktop\comp_Inspect_Api\Datasets\material_567\Positive\material_567_1.png     
//         this.handleClick()
//     };
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
//         }, 2000)
//     }

//     APICall = async (event) => {
//         const imageSrc = this.webcam.getScreenshot();
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
//         formData.append('datasets', blob, compdata + '.png')
//         axios.post('https://172.16.1.91:9095/Testing', formData, {
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

//     acceptClick = async (event) => {

//         this.setState({ startCapture: false })
//         this.appCall(event)

//     }

//     appCall = async (event) => {
//         this.setState({ loading: true })
//         const imageSrc = this.webcam.getScreenshot();
//         const blob = await fetch(imageSrc).then((res) => res.blob());
//         console.log(blob)
//         const formData = new FormData();
//         //formData.append('file', blob)
//         // let u_id = uuid()
//         // console.log(u_id)    
//         let component_code = component_code1
//         let component_name = component_name1

//         let compdata = component_name + "_" + component_code

//         formData.append('comp_name', component_name);
//         formData.append('comp_code', component_code);
//         console.log(compdata)
//         formData.append('Datasets', blob, compdata + '.png')
//         axios.post('https://172.16.1.91:9095/Accept', formData, {
//             headers: {
//                 'content-type': 'multipart/form-data'
//             },
//             mode: 'no-cors'
//         })
//             .then(response => {
//                 // this.setState({
//                 //     projects: response.data
//                 // });
//                 console.log('success', response.data.status, response.data.value);
//                 //this.setState({ response_message: response.data.status, response_value: parseFloat(response.data.value).toFixed(2) })
//                 this.setState({ response_message: response.data, loading: false })
//                 // setTimeout(() => {
//                 //     this.setState({ response_message: "" })
//                 // }, 1000);
//                 this.setState({ startCapture: true })

//             })
//             .catch(error => {
//                 console.log('error', error);
//             })
//     }
//     rejectClick = async (event) => {

//         this.setState({ startCapture: false })
//         this.rejectCall(event)

//     }

//     rejectCall = async (event) => {
//         this.setState({ loading: true })
//         const imageSrc = this.webcam.getScreenshot();
//         const blob = await fetch(imageSrc).then((res) => res.blob());
//         console.log(blob)
//         const formData = new FormData();
//         //formData.append('file', blob)
//         // let u_id = uuid()
//         // console.log(u_id)    
//         let component_code = component_code1
//         let component_name = component_name1

//         let compdata = component_name + "_" + component_code

//         formData.append('comp_name', component_name);
//         formData.append('comp_code', component_code);
//         console.log(compdata)
//         formData.append('file', blob, compdata + '.png')
//         axios.post('https://172.16.1.91:9095/Reject', formData, {
//             headers: {
//                 'content-type': 'multipart/form-data'
//             },
//             mode: 'no-cors'
//         })
//             .then(response => {
//                 // this.setState({
//                 //     projects: response.data
//                 // });
//                 console.log('success', response.data.status, response.data.value);
//                 //this.setState({ response_message: response.data.status, response_value: parseFloat(response.data.value).toFixed(2) })
//                 this.setState({ response_message: response.data, loading: false })
//                 // setTimeout(() => {
//                 //     this.setState({ response_message: "" })
//                 // }, 1000);
//                 this.setState({ startCapture: true })

//             })
//             .catch(error => {
//                 console.log('error', error);
//             })
//     }

//     // getImage = (data1) => {
//     //     if (data1 !== undefined) {
//     //         console.log('data1', data1)
//     //         let baseurl = 'http://127.0.0.1:8000/'
//     //         let result = data1[0].Image_path
//     //         let output = baseurl + result
//     //         return output
//     //     }
//     //     else {
//     //         return null
//     //     }

//     // }

//     getImage = (Image_path, type) => {
//         console.log(`Image_path`, Image_path)
//         if (Image_path === undefined) {
//             return ""
//         }
//         let baseurl = 'https://172.16.1.91:8080/'
//         let result = Image_path
//         console.log(`result`, result)
//         let output = baseurl + result
//         return output

//     }
//     render() {
//         const videoConstraints = {
//             facingMode: "user"
//         };
//         const override = css`display: block; margin: 0 auto; border-color: red;`;
//         return (
//             <React.Fragment>
//                 <div className="page-content">
//                     <MetaTags>
//                         <title>Form Layouts | Skote - React Admin & Dashboard Template</title>
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
//                                                 <div className="centered mt-2" >
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
//                                                                         this.state.response_message === "ok" ? 'green' :
//                                                                             this.state.response_message === "notok" ? 'red' :
//                                                                                 this.state.response_message === "Possible Match" ? 'orange' :
//                                                                                     null
//                                                                 }}>
//                                                                     {this.state.response_message}{" "}{this.state.response_value}
//                                                                 </div>
//                                                         }                                                        
//                                                     </div>
//                                                     {
//                                                         //this.state.response_value>0.90 && this.state.response_value<0.95 ?
//                                                         <div>
//                                                             <Button className="me-2" color="success" onClick={() => this.acceptClick()} > POSITIVE </Button>
//                                                             <Button className="me-2" color="danger" onClick={() => this.rejectClick()}> NEGATIVE </Button>
//                                                         </div>
//                                                         //: null
//                                                     }

//                                                     <Webcam
//                                                         videoConstraints={videoConstraints}
//                                                         audio={false}
//                                                         height={'auto'}
//                                                         screenshotFormat="image/png"
//                                                         width={'100%'}
//                                                         ref={node => this.webcam = node}
//                                                     />
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
//                                                 <CardTitle className="mb-4">Reference Component</CardTitle>
//                                                 <label>Component Name: {this.state.component_name}</label> {" , "}
//                                                 <label>Component Code: {this.state.component_code}</label>
//                                                 <br />
//                                                 <div>
//                                                     <Row>
//                                                         {
//                                                             this.state.Datasets.map((data, index) => (
//                                                                 this.getImage(data.Image_path, data.type) !== "" &&
//                                                                 index === 0 && <Col key={index}>
//                                                                     <img src={this.getImage(data.Image_path, data.type)} />
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

let component_code1 = ""
let component_name1 = ""
let positive = ""
let negative = ""
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
            tab: 0,
            count: 1,
            img_url: '',
            datasets: []
        }
    }

    componentDidMount = () => {

        var compData = JSON.parse(sessionStorage.getItem("compData"))
        console.log(compData)
        component_code1 = compData.component_code
        component_name1 = compData.component_name
        positive = compData.positive
        negative = compData.negative
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

        //this.setState({ img_url: 'http://127.0.0.1:8000/Datasets/component_1001/Positive/component_1001_1.png' })
        // C:\Users\EPRM_ROG\Desktop\comp_Inspect_Api\Datasets\material_567\Positive\material_567_1.png     
        this.handleClick()
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

    // getDate = () => {
    //     let today = new Date();
    //     let yyyy = today.getFullYear();
    //     let mm = today.getMonth() + 1; // Months start at 0!
    //     let dd = today.getDate();
    //     let hours = today.getHours()
    //     let min = today.getMinutes()
    //     let secc = today.getSeconds()
    //     //let time = hours +':' + min + ':' + secc

    //     if (dd < 10) dd = '0' + dd;
    //     if (mm < 10) mm = '0' + mm;

    //     return today = dd + '/' + mm + '/' + yyyy + '/' + hours + ':' + min + ':' + secc;

    // }

    APICall = async (event) => {
        const imageSrc = this.webcam.getScreenshot();
        const blob = await fetch(imageSrc).then((res) => res.blob());
        console.log(blob)
        const formData = new FormData();
        //formData.append('file', blob)
        // let u_id = uuid()
        // console.log(u_id)  
        // const date = moment(new Date()).format("DD/MM/YYYY")
        // let date = this.getDate()
        // let replace = date.replaceAll(":", "_");
        // console.log('replace', replace)

        // let time = new Date().toLocaleString();

        // let today = new Date();
        // console.log('date', date)
        // let yyyy = today.getFullYear();
        // let mm = today.getMonth() + 1; // Months start at 0!
        // let dd = today.getDate();
        // let _today = dd + '/' + mm + '/' + yyyy

        // let hours = today.getHours()
        // let min = today.getMinutes()
        // let secc = today.getSeconds()
        // let time = hours + ':' + min + ':' + secc

        // console.log('time', time)
        let component_code = component_code1
        let component_name = component_name1
        let vpositive = positive
        let vnegative = negative

        let compdata = component_name + "_" + component_code // + '_' + replace

        formData.append('comp_name', component_name);
        formData.append('comp_code', component_code);
        formData.append('positive', vpositive);
        formData.append('negative', vnegative);
        // formData.append('Inspected_ondate', date)
        // formData.append('Inspected_ontime', time)
        // formData.append('date', _today)
        console.log(compdata)
        formData.append('datasets', blob, compdata + '.png')
        axios.post('https://172.16.1.91:5000/admin_testing', formData, {
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
        console.log(`image_path`, image_path)
        if (image_path === undefined) {
            return ""
        }
        let baseurl = 'https://172.16.1.91:8000/'
        let result = image_path
        console.log(`result`, result)
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

export default Inspection;
