import React, { Component } from "react";
import MetaTags from 'react-meta-tags';
import PropTypes from "prop-types"
import { Card, Container, CardBody } from "reactstrap";

import Breadcrumbs from "components/Common/Breadcrumb";
import TrainTestConfiguration from "./TrainTestConfiguration";

import "./Css/style.css";

class Configuration extends Component {

    constructor(props) {
        super(props);
    }

    render() {

        return (
            <React.Fragment>
                <div className="page-content">
                    <MetaTags>
                        <title>Configuration Details</title>
                    </MetaTags>
                    <Breadcrumbs 
                        title="CONFIGURATION DETAILS"
                    />
                    <Container fluid>
                        <Card>
                            <CardBody>
                                <TrainTestConfiguration />
                                {/* <Row className="row-eq-height">
                                    <Col sm={6} md={4} lg={3}>
                                        <Card className="shadow-sm border-2 rounded-3">
                                            <CardBody>
                                                <CardTitle>Training Images</CardTitle>
                                                <label>Minimum number of ok images for training:</label>
                                                <Select
                                                    value={this.state.selectedOption}
                                                    onChange={(e1) => this.onSelectComponent(this.setState({ selectedOption: e1.label }), this.setState({ selectedOption: e1 }))}
                                                    options={this.state.options}
                                                />
                                                <label>Minimum number of not ok images for training:</label>
                                                <Select
                                                    value={this.state.selectOption}
                                                    onChange={(e2) => this.selectComponent(this.setState({ selectOption: e2.label }), this.setState({ selectOption: e2 }))}
                                                    options={this.state.option}
                                                />
                                                <Button color="primary" className="w-md m-1" onClick={() => this.submit()}>Submit</Button>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                    <Col sm={6} md={4} lg={3}>
                                        <Card className="shadow-sm border-2 rounded-3">
                                            <CardBody>
                                                <CardTitle>Testing Mode</CardTitle>
                                                <Row>
                                                    <p>Select Testing Mode</p>
                                                    <Radio.Group onChange={this.selectManual_auto} value={this.state.selectM_A}>
                                                        <Space >
                                                            {
                                                                this.state.manual_auto_option.map((data, index) => (
                                                                    <div className='pay_cards' key={index} style={{ background: (this.state.selectM_A !== data) && 'white' }}>
                                                                        <Radio value={data}>{data}</Radio>
                                                                    </div>
                                                                ))
                                                            }
                                                        </Space>
                                                    </Radio.Group>
                                                </Row>
                                                <Row className="mt-3">
                                                    {
                                                        this.state.selectM_A === 'Auto' &&
                                                        <Col>
                                                            <label>
                                                                Countdown:
                                                            </label>
                                                            <div>
                                                                <input
                                                                    className="form-control"
                                                                    type="number"
                                                                    defaultValue={this.state.timer}
                                                                    id="example-number-input"
                                                                    onChange={(e) => this.countdown(e.target.value, this.setState({ timer: e.target.value }))}
                                                                />
                                                            </div>
                                                        </Col>
                                                    }
                                                </Row>
                                                <Row className="mt-2">
                                                    <p>Select Object Detection Type</p>
                                                    <Radio.Group onChange={this.selectDetectionType}
                                                        value={this.state.detectType}
                                                    >
                                                        <Space >
                                                            {
                                                                this.state.detection_type.map((data, index) => (
                                                                    <div className='pay_cards my-1' key={index} >
                                                                        <Radio value={data}>{data}</Radio>
                                                                    </div>
                                                                ))
                                                            }
                                                        </Space>
                                                    </Radio.Group>
                                                </Row>
                                                <br />
                                                <br />
                                            </CardBody>
                                        </Card>
                                    </Col>
                                    <Col sm={6} md={4} lg={3}>
                                        <Card className="shadow-sm border-2 rounded-3">
                                            <CardBody>
                                                <CardTitle>Testing Samples</CardTitle>
                                                <label>
                                                    Minimum no. of test samples
                                                </label>
                                                <div>
                                                    <input
                                                        className="form-control"
                                                        type="number"
                                                        value={this.state.test_samples}
                                                        id="example-number-input"

                                                        onChange={(e) => this.samples(e.target.value)}
                                                        onBlur={this.validateSamples}
                                                    />
                                                    {this.state.errorMessage && <p style={{ color: "red" }}>{this.state.errorMessage}</p>}
                                                </div>
                                            </CardBody>
                                        </Card>
                                        <Card className="shadow-sm border-2 rounded-3">
                                            <CardBody>
                                                <CardTitle>Training Configuration</CardTitle>
                                                <label>
                                                    Training Accuracy Time per sample (seconds):
                                                </label>
                                                <div>
                                                    <input
                                                        className="form-control"
                                                        type="number"
                                                        defaultValue={this.state.timer_samples}
                                                        id="example-number-input"
                                                        onChange={(e) => this.train_timer(e.target.value, this.setState({ timer_samples: e.target.value }))}
                                                    />
                                                </div>
                                                <br />

                                                <label>
                                                    Training Cycle Count:
                                                </label>
                                                <div>
                                                    <input
                                                        className="form-control"
                                                        type="number"
                                                        defaultValue={this.state.trainCycleCount}
                                                        id="example-number-input"
                                                        onChange={(e) => this.cycleCountChange(e.target.value, this.setState({ trainCycleCount: e.target.value }))}
                                                    />
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                    <Col sm={6} md={4} lg={3}>
                                        <Card className="shadow-sm border-2 rounded-3">
                                            <CardBody>
                                                <CardTitle>Label Name</CardTitle>
                                                <div>
                                                    <label>Ok Label Name:</label>
                                                    <input type="text" className="form-control" id="example-number-input" placeholder="Enter Your real component name" defaultValue={this.state.real} onChange={(e) => this.setState({ real: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label>Not Good Label Name:</label>
                                                    <input type="text" className="form-control" id="example-number-input" placeholder="Enter Your fake component name" defaultValue={this.state.fake} onChange={(e) => this.setState({ fake: e.target.value })} />
                                                </div>
                                                <div>
                                                    <Button color="primary" className="w-md m-1" onClick={() => this.submitLabel()}>Submit</Button>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </Col>
                                </Row> */}

                            </CardBody>
                        </Card>
                    </Container>
                </div>
            </React.Fragment>

        );



    }

}

Configuration.propTypes = {
    history: PropTypes.any.isRequired,
};
export default Configuration;



// import React, { Component } from "react";
// import MetaTags from 'react-meta-tags';
// import PropTypes from "prop-types"
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
//     InputGroup, Modal, Table
// } from "reactstrap";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import Select from 'react-select';
// import { Radio, Space, Checkbox, Slider, Tooltip } from 'antd';
// // import 'antd/dist/antd.css';
// import urlSocket from "./urlSocket"
// import { FaEye, FaEyeSlash } from 'react-icons/fa';
// import "./Css/style.css";

// import toastr from "toastr";
// import Breadcrumbs from "components/Common/Breadcrumb";


// class Configuration extends Component {

//     constructor(props) {
//         super(props);
//         this.state = {
//             dataloaded: false,
//             showTable2: false,
//             tbIndex: 0,
//             dateWise_filterdata: [],
//             addCompModal: false,
//             selectFilter: null,
//             manual_qty_corrn: false,
//             password_protect: false,
//             password: '',
//             errorMessage: '',
//             showPassword: false,
//             classify_rej_part: false,
//             // ok:"",
//             // notok:"",
//             config_data: [],
//             deviceInfo: [],
//             options: [
//                 { label: 1 },
//                 { label: 2 },
//                 { label: 3 },
//                 { label: 4 },
//                 { label: 5 },
//                 { label: 6 },
//                 { label: 7 },
//                 { label: 8 },
//                 { label: 9 },
//                 { label: 10 },
//                 { label: 11 },
//                 { label: 12 },
//                 { label: 13 },
//                 { label: 14 },
//                 { label: 15 },
//                 { label: 16 },
//                 { label: 17 },
//                 { label: 18 },
//                 { label: 19 },
//                 { label: 20 },
//             ],
//             option: [
//                 { label: 0 },
//                 { label: 1 },
//                 { label: 2 },
//                 { label: 3 },
//                 { label: 4 },
//                 { label: 5 },
//                 { label: 6 },
//                 { label: 7 },
//                 { label: 8 },
//                 { label: 9 },
//                 { label: 10 },
//                 { label: 11 },
//                 { label: 12 },
//                 { label: 13 },
//                 { label: 14 },
//                 { label: 15 },
//                 { label: 16 },
//                 { label: 17 },
//                 { label: 18 },
//                 { label: 19 },
//                 { label: 20 },
//             ],
//             manual_auto_option: ['Manual', 'Auto'],
//             detection_type: ['ML', 'DL'],
//             classify_rej_parts: ['Mandatory', 'Optional'],
//             selectedOption: { label: 5 },
//             selectOption: { label: 0 },
//             selectM_A: 'Manual',
//             selectM_O: 'Optional',
//             detectType: 'ML',
//             timer: 10,
//             test_samples: null,
//             timer_samples: null,
//             trainCycleCount: null,
//             image_rotation: 14,

//             deviceId: '',
//             real: "",
//             fake: "",
//             posble_match: "",
//             rangeValue: [0.50, 0.75],
//             minValue: 0.50,
//             maxValue: 0.75,
//         }
//         this.handleSubmit = this.handleSubmit.bind(this);
//         this.handleToggleShowPassword = this.handleToggleShowPassword.bind(this);
//     }

//     componentDidMount() {
//         console.log('first', this.state.manual_auto_option)
//         try {
//             urlSocket.post('/config',
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let data = response.data
//                     console.log('min_ok_for_training', data)
//                     let select_min_ok = {
//                         label: data[0].min_ok_for_training
//                     }
//                     let select_min_notok = {
//                         label: data[0].min_notok_for_training
//                     }
//                     const rangeValue = [Number(data[0].lower_bound_conf), Number(data[0].upper_bound_conf)]
//                     const minValue = Number(data[0].lower_bound_conf)
//                     const maxValue = Number(data[0].upper_bound_conf)
//                     console.log('rangeValue', rangeValue)
//                     this.setState(
//                         {
//                             config_data: data,
//                             selectedOption: select_min_ok,
//                             selectOption: select_min_notok,
//                             selectM_A: data[0].inspection_type,
//                             detectType: data[0].detection_type,
//                             timer: data[0].countdown,
//                             test_samples: data[0].test_samples,
//                             timer_samples: data[0].train_acc_timer_per_sample,
//                             trainCycleCount: data[0].train_cycle_count,
//                             image_rotation: data[0].image_rotation,
//                             real: data[0].positive,
//                             fake: data[0].negative,
//                             posble_match: data[0].posble_match,
//                             qr_checking: data[0].qr_checking,
//                             qruniq_checking: data[0].qr_uniq_checking,
//                             manual_qty_corrn: data[0].manual_qty_corrn,
//                             password_protect: data[0].password_protect,
//                             password: data[0].qc_password,
//                             selectM_O: data[0].rej_parts,
//                             classify_rej_part: data[0].classify_rej_part,
//                             rangeValue,
//                             minValue,
//                             maxValue
//                         }
//                     )
//                 })
//                 .catch((error) => {
//                     console.log(error)
//                 })
//         } catch (error) {
//             console.log("----", error)
//         }
//         this.config_fields()
//     }


//     config_fields = (data) => {
//         console.log('data', data)
//         this.setState({ selectFilter: data })
//     }

//     onSelectComponent = (e1) => {
//         console.log('e', e1)
//     }
//     selectComponent = (e2) => {
//         console.log('e', e2)
//     }
//     selectManual_auto = (e) => {
//         console.log('e', e.target.value)
//         this.setState({ selectM_A: e.target.value })
//         let selectManual_Auto = e.target.value
//         let data = this.state.config_data
//         let id = null;

//         if (data.length > 0) {
//             id = data[0]._id
//         }
//         console.log('id', id)
//         try {
//             // axios.post('https://172.16.1.91:5000/update_config', {'_id':id, 'min_notok_for_training': this.state.notok, "min_ok_for_training": this.state.ok },
//             urlSocket.post('/manual_auto', { '_id': id, 'inspection_type': selectManual_Auto },
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let data = response.data
//                     console.log('inspection_type', data)
//                     this.setState({ config_data: data })
//                     // window.location.reload(false);             
//                 })
//                 .catch((error) => {
//                     console.log(error)
//                 })
//         } catch (error) {
//             console.log("----", error)
//         }
//     }

//     selectDetectionType = (e) => {
//         console.log('e', e.target.value)
//         let typeOfDetect = e.target.value;
//         this.setState({ detectType: typeOfDetect })
//         let choosenType = typeOfDetect
//         let data = this.state.config_data
//         let id = null;

//         if (data.length > 0) {
//             id = data[0]._id
//         }
//         console.log('id', id)
//         try {
//             // axios.post('https://172.16.1.91:5000/update_config', {'_id':id, 'min_notok_for_training': this.state.notok, "min_ok_for_training": this.state.ok },
//             urlSocket.post('/objectDetectionType', { '_id': id, 'detectionType': choosenType },
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let data = response.data
//                     console.log('inspection_type', data)
//                     this.setState({ config_data: data })
//                     // window.location.reload(false);             
//                 })
//                 .catch((error) => {
//                     console.log(error)
//                 })
//         } catch (error) {
//             console.log("----", error)
//         }
//     }

//     countdown = (e) => {
//         console.log('e', e)
//         let countdown = e
//         let data = this.state.config_data
//         let id = null;

//         if (data.length > 0) {
//             id = data[0]._id
//         }
//         console.log('id', id)
//         try {
//             urlSocket.post('/timer', { '_id': id, 'countdown': countdown },
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let data = response.data
//                     console.log('config', data)
//                     //this.setState({timer:data[0].countdown})
//                     this.setState({ config_data: data })
//                     // window.location.reload(false);             
//                 })
//                 .catch((error) => {
//                     console.log(error)
//                 })
//         } catch (error) {
//             console.log("----", error)
//         }
//     }

//     samples = (e) => {
//         console.log('e', e)
//         let test_samples = parseInt(e, 10); // Convert input to number
//         let data = this.state.config_data
//         let id = null;

//         if (test_samples === 0 || isNaN(test_samples)) {
//             this.setState({ errorMessage: "0 is not allowed. Please enter a value greater than 0." });
//             return;
//         }
    
//         this.setState({ test_samples, errorMessage: "" });

//         if (data.length > 0) {
//             id = data[0]._id
//         }
//         console.log('id', id)
//         try {
//             urlSocket.post('/test_samples', { '_id': id, 'test_samples': test_samples },
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let data = response.data
//                     console.log('config', data)
//                     //this.setState({timer:data[0].countdown})
//                     this.setState({ config_data: data })
//                     // window.location.reload(false);             
//                 })
//                 .catch((error) => {
//                     console.log(error)
//                 })
//         } catch (error) {
//             console.log("----", error)
//         }
//     }

//     rotations = (e) => {
//         console.log('e', e)
//         let image_rotation = e
//         let data = this.state.config_data
//         let id = null;

//         if (data.length > 0) {
//             id = data[0]._id
//         }
//         console.log('id', id)
//         try {
//             urlSocket.post('/image_rotation', { '_id': id, 'image_rotation': image_rotation },
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let data = response.data
//                     console.log('config', data)
//                     //this.setState({timer:data[0].countdown})
//                     this.setState({ config_data: data })
//                     // window.location.reload(false);             
//                 })
//                 .catch((error) => {
//                     console.log(error)
//                 })
//         } catch (error) {
//             console.log("----", error)
//         }
//     }


//     train_timer = (e) => {
//         console.log('e', e)
//         let timer_samples = e
//         //this.setState({timer_samples:e}) 
//         let data = this.state.config_data
//         let id = null;

//         if (data.length > 0) {
//             id = data[0]._id
//         }
//         console.log('id', id)
//         try {
//             urlSocket.post('/train_acc_timer', { '_id': id, 'train_acc_timer_per_sample': timer_samples },
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let data = response.data
//                     console.log('config', data)
//                     //this.setState({timer:data[0].countdown})
//                     this.setState({ config_data: data })
//                     // window.location.reload(false);             
//                 })
//                 .catch((error) => {
//                     console.log(error)
//                 })
//         } catch (error) {
//             console.log("----", error)
//         }
//     }

//     cycleCountChange = (e) => {
//         console.log('e', e)
//         let trainCycleCount = e
//         //this.setState({trainCycleCount:e}) 
//         let data = this.state.config_data
//         let id = null;

//         if (data.length > 0) {
//             id = data[0]._id
//         }
//         console.log('id', id)
//         try {
//             urlSocket.post('/changeCycleCount', { '_id': id, 'training_cycle': trainCycleCount },
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let data = response.data
//                     console.log('config', data)
//                     //this.setState({timer:data[0].countdown})
//                     this.setState({ config_data: data })
//                     // window.location.reload(false);             
//                 })
//                 .catch((error) => {
//                     console.log(error)
//                 })
//         } catch (error) {
//             console.log("----", error)
//         }
//     }

//     submit = () => {
//         const {config_data } = this.state;
//         let selectnotok_label = this.state.selectOption
//         let notok = selectnotok_label.label
//         let selectok_label = this.state.selectedOption
//         let ok = selectok_label.label
//         console.log('config_data', this.state.config_data)
//         let data = this.state.config_data
//         let id = null;

//         if (data.length > 0) {
//             id = data[0]._id
//         }
//         console.log('id', id)
//         try {
//             urlSocket.post('/update_config', { '_id': id, 'min_notok_for_training': notok, "min_ok_for_training": ok },
//                 // axios.post('https://172.16.1.91:5000/update_config', { '_id': id, 'min_notok_for_training': notok, "min_ok_for_training": ok, 'inspection_type': selectManual_Auto },
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     console.log('408data: ', data)
//                     if (response.data.res_msg == 'Success') {
//                         let data = response.data.config;
//                         this.setState({ config_data: data })
//                         // window.location.reload(false);
//                         this.toastSuccess('Min No. of Images for Training Updated Successfully', '')
//                     } else {
//                         this.toastError('Error on Submission.', '')
//                     }
//                 })
//                 .catch((error) => {
//                     console.log(error)
//                 })
//         } catch (error) {
//             console.log("----", error)
//         }
//     }

//     submitLabel = () => {
//         let real = this.state.real
//         let fake = this.state.fake
//         let posble_match = this.state.posble_match
//         console.log(`real`, real)
//         console.log(`fake`, fake)
//         let data = this.state.config_data
//         let id = null;
//         if (data.length > 0) {
//             id = data[0]._id
//         }
//         console.log('id', id)
//         try {
//             urlSocket.post('/labeling', { '_id': id, 'positive': real, 'negative': fake, 'posble_match': posble_match },
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     console.log('442data: ', data)
//                     if (response.data.res_msg == 'Success') {
//                         let data = response.data.config
//                         this.setState({ config_data: data });
//                         this.toastSuccess('Label Name Updated Successfully', '')
//                     } else {
//                         this.toastError('Error on Label Name Updation.', '')
//                     }
//                 })
//                 .catch((error) => {
//                     console.log(error)
//                 })
//         } catch (error) {
//         }
//     }

//     qr_checking = (e) => {
//         this.setState({ qr_checking: e.target.checked })
//         let data = this.state.config_data
//         let id = null;

//         if (data.length > 0) {
//             id = data[0]._id
//         }
//         console.log('id', id)
//         try {
//             urlSocket.post('/qr_scanner', { '_id': id, 'qr_checking': e.target.checked },
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let data = response.data
//                     this.setState({ config_data: data })
//                     console.log(data)
//                 })
//                 .catch((error) => {
//                     console.log(error)
//                 })
//         } catch (error) {
//         }
//     }

//     qr_uniq_checking = (e) => {
//         this.setState({ qruniq_checking: e.target.checked })
//         let data = this.state.config_data
//         let id = null;

//         if (data.length > 0) {
//             id = data[0]._id
//         }

//         console.log('id', id)
//         try {
//             urlSocket.post('/qr_uniqness', { '_id': id, 'qr_uniq_checking': e.target.checked },
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let data = response.data
//                     this.setState({ config_data: data })
//                     console.log(data)
//                 })
//                 .catch((error) => {
//                     console.log(error)
//                 })
//         } catch (error) {
//         }
//     }

//     qc_manual_correction = (e) => {
//         this.setState({ manual_qty_corrn: e.target.checked })
//     }

//     psw_protect = (e) => {
//         this.setState({ password_protect: e.target.checked })
//     }

//     handleSubmit(event) {
//         event.preventDefault();
//         const { password } = this.state;
//         // if (password.length < 8) {
//         //     this.setState({ errorMessage: 'Password must be at least 8 characters long' });
//         //     console.log('378', this.state.errorMessage)
//         // } else {
//         this.setState({ errorMessage: '' });
//         let data = this.state.config_data
//         let id = null;
//         let manual_qty_corrn = this.state.manual_qty_corrn

//         if (data.length > 0) {
//             id = data[0]._id
//         }
//         console.log('id', id)
//         try {
//             // axios.post('https://172.16.1.91:5000/update_config', {'_id':id, 'min_notok_for_training': this.state.notok, "min_ok_for_training": this.state.ok },
//             urlSocket.post('/qc_correction_psw', { '_id': id, 'qc_password': password, 'manual_qty_corrn': manual_qty_corrn, 'password_protect': this.state.password_protect },
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let data = response.data
//                     console.log('qc_password', data)
//                     this.setState({ config_data: data, errorMessage: 'Password is generated' })
//                     // window.location.reload(false);             
//                 })
//                 .catch((error) => {
//                     console.log(error)
//                 })
//         } catch (error) {
//             console.log("----", error)
//         }
//         // }        
//     }

//     handleToggleShowPassword() {
//         const { showPassword } = this.state;
//         this.setState({ showPassword: !showPassword });
//     }

//     classify_rej = (e) => {
//         this.setState({ classify_rej_part: e.target.checked })
//         let data = this.state.config_data
//         let id = null;

//         if (data.length > 0) {
//             id = data[0]._id
//         }
//         console.log('id', id)
//         try {
//             // axios.post('https://172.16.1.91:5000/update_config', {'_id':id, 'min_notok_for_training': this.state.notok, "min_ok_for_training": this.state.ok },
//             urlSocket.post('/classify_reject_parts', { '_id': id, 'rej_parts': 'Optional', 'classify_rej_part': e.target.checked },
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let data = response.data
//                     console.log('inspection_type', data)
//                     this.setState({ config_data: data, selectM_O: data[0].rej_parts, classify_rej_part: data[0].classify_rej_part })
//                     // window.location.reload(false);             
//                 })
//                 .catch((error) => {
//                     console.log(error)
//                 })
//         } catch (error) {
//             console.log("----", error)
//         }
//     }

//     mand_option = (e) => {
//         console.log('e', e.target.value)
//         this.setState({ selectM_O: e.target.value })
//         let selectMandatory_Option = e.target.value
//         let data = this.state.config_data
//         let id = null;

//         if (data.length > 0) {
//             id = data[0]._id
//         }
//         console.log('id', id)
//         try {
//             // axios.post('https://172.16.1.91:5000/update_config', {'_id':id, 'min_notok_for_training': this.state.notok, "min_ok_for_training": this.state.ok },
//             urlSocket.post('/mandatory_option', { '_id': id, 'rej_parts': selectMandatory_Option, 'classify_rej_part': this.state.classify_rej_part },
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let data = response.data
//                     console.log('inspection_type', data)
//                     this.setState({ config_data: data, selectM_O: data[0].rej_parts, classify_rej_part: data[0].classify_rej_part })
//                     // window.location.reload(false);             
//                 })
//                 .catch((error) => {
//                     console.log(error)
//                 })
//         } catch (error) {
//             console.log("----", error)
//         }
//     }


//     // This function will be called when the slider value changes
//     similarityChange = async (value) => {
//         console.log('value476', value)
//         const minValue = value[0]
//         const maxValue = value[1]
//         this.setState({ rangeValue: value, minValue, maxValue });
//         let data = this.state.config_data
//         let id = null;

//         if (data.length > 0) {
//             id = data[0]._id
//         }
//         try {
//             const response = await urlSocket.post('/similarity_changes', { '_id': id, 'lower_bound_conf': value[0], 'upper_bound_conf': value[1] }, { mode: 'no-cors' });
//             const config = response.data;
//             console.log('config', config)
//             const rangeValue = [Number(config[0].lower_bound_conf), Number(config[0].upper_bound_conf)]
//             const minValue = Number(config[0].lower_bound_conf)
//             const maxValue = Number(config[0].upper_bound_conf)
//             this.setState({ config_data: config, rangeValue, minValue, maxValue })

//         } catch (error) {
//             console.log('error', error)
//         }
//     }

//     toastSuccess = (title, message) => {
//         // title = "Success"
//         toastr.options.closeDuration = 8000
//         toastr.options.positionClass = "toast-bottom-right"
//         toastr.success(message, title)
//     }

//     toastWarning = (message) => {
//         let title = "Failed"
//         toastr.options.closeDuration = 8000
//         toastr.options.positionClass = "toast-bottom-right"
//         toastr.warning(message, title)
//     }

//     toastError = (title, message) => {
//         // let title = "Failed"
//         toastr.options.closeDuration = 8000
//         toastr.options.positionClass = "toast-bottom-right"
//         toastr.error(message, title)
//     }

//     render() {
//         const { password, errorMessage, showPassword } = this.state;
//         const marks = {
//             0: <Tooltip title="Min">0</Tooltip>,
//             1: <Tooltip title="Max">1</Tooltip>,
//         };

//         const tooltipFormatter = (value) => {
//             if (value === 0) {
//                 return 'Min'; // Custom label for the minimum value
//             } else if (value === 1) {
//                 return 'Max'; // Custom label for the maximum value
//             } else {
//                 // Format other values as needed (e.g., display two decimal places)
//                 return (value);
//                 // return (value * 100).toFixed(2) + '%';
//             }
//         };

//         return (
//             <React.Fragment>
//                 <div className="page-content">
//                     <MetaTags>
//                         {/* <title>Form Layouts | Skote - React Admin & Dashboard Template</title> */}
//                     </MetaTags>
//                     <Breadcrumbs 
//                         title="Configuration Details"
//                     />
//                     <Container fluid>
//                         <Card>
//                             <CardBody>
//                                 <Row className="row-eq-height">
//                                     <Col sm={6} md={4} lg={3}>
//                                         <Card style={{
//                                             boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.4)', // Adjust values as needed
//                                             padding: '5px', // Example padding
//                                             background: '#ffffff',
//                                         }}>
//                                             <CardTitle className="text-center" style={{ fontWeight: 'bold' }}>Training Images</CardTitle>
//                                             <CardBody>
//                                                 <label style={{ fontWeight: 'bold' }}>Minimum number of ok images for training:</label>
//                                                 <Select
//                                                     value={this.state.selectedOption}
//                                                     onChange={(e1) => this.onSelectComponent(this.setState({ selectedOption: e1.label }), this.setState({ selectedOption: e1 }))}
//                                                     options={this.state.options}
//                                                 />
//                                                 <br />
//                                                 <label style={{ fontWeight: 'bold' }}>Minimum number of not ok images for training:</label>
//                                                 <Select
//                                                     value={this.state.selectOption}
//                                                     onChange={(e2) => this.selectComponent(this.setState({ selectOption: e2.label }), this.setState({ selectOption: e2 }))}
//                                                     options={this.state.option}
//                                                 />
//                                                 <br />
//                                                 <div>
//                                                     <Button color="primary" className="w-md m-1" onClick={() => this.submit()}>Submit</Button>
//                                                 </div>
//                                             </CardBody>
//                                         </Card>
//                                     </Col>
//                                     <Col sm={6} md={4} lg={3}>
//                                         <Card style={{
//                                             boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.4)', // Adjust values as needed
//                                             padding: '5px', // Example padding
//                                             background: '#ffffff',
//                                         }}>
//                                             <CardTitle className="text-center" style={{ fontWeight: 'bold' }}>Testing Mode</CardTitle>
//                                             <CardBody>
//                                                 <Row>
//                                                     <p style={{ fontWeight: 'bold' }}>Select Testing Mode</p>
//                                                     <Radio.Group onChange={this.selectManual_auto} value={this.state.selectM_A}>
//                                                         <Space >
//                                                             {
//                                                                 this.state.manual_auto_option.map((data, index) => (
//                                                                     <div className='pay_cards' key={index} style={{ background: (this.state.selectM_A !== data) && 'white' }}>
//                                                                         <Radio value={data}>{data}</Radio>
//                                                                     </div>
//                                                                 ))
//                                                             }
//                                                         </Space>
//                                                     </Radio.Group>
//                                                 </Row>
//                                                 <Row className="mt-3">
//                                                     {
//                                                         this.state.selectM_A === 'Auto' &&
//                                                         <Col>
//                                                             <label style={{ fontWeight: 'bold' }}>
//                                                                 Countdown:
//                                                             </label>
//                                                             <div>
//                                                                 <input
//                                                                     className="form-control"
//                                                                     type="number"
//                                                                     defaultValue={this.state.timer}
//                                                                     id="example-number-input"
//                                                                     onChange={(e) => this.countdown(e.target.value, this.setState({ timer: e.target.value }))}
//                                                                 />
//                                                             </div>
//                                                         </Col>
//                                                     }
//                                                 </Row>
//                                                 <Row className="mt-2">
//                                                     <p style={{ fontWeight: 'bold' }}>Select Object Detection Type</p>
//                                                     <Radio.Group onChange={this.selectDetectionType}
//                                                         value={this.state.detectType}
//                                                     >
//                                                         <Space >
//                                                             {
//                                                                 this.state.detection_type.map((data, index) => (
//                                                                     <div className='pay_cards my-1' key={index} >
//                                                                         <Radio value={data}>{data}</Radio>
//                                                                     </div>
//                                                                 ))
//                                                             }
//                                                         </Space>
//                                                     </Radio.Group>
//                                                 </Row>
//                                                 <br />
//                                                 <br />
//                                                 {/* <Row>
//                                             <p style={{ fontWeight: 'bold' }}>QR Scanner</p>
//                                             <div className="form-check">
//                                                 <Checkbox
//                                                     checked={this.state.qr_checking}
//                                                     onChange={(e) => this.qr_checking(e)}
//                                                 >QR Checking</Checkbox>
//                                                 <br />
//                                                 <br />
//                                                 <Checkbox

//                                                     checked={this.state.qruniq_checking}
//                                                     onChange={(e) => this.qr_uniq_checking(e)}
//                                                 >QR Uniqness Checking</Checkbox>
//                                             </div>
                                            
//                                         </Row> */}
//                                                 {/* <CardTitle className="text-center" style={{ fontWeight: 'bold' }}>QR Scanner</CardTitle>
//                                             <CardBody>
//                                                 <div className="form-check">
//                                                     <Checkbox
//                                                         checked={this.state.qr_checking}
//                                                         onChange={(e) => this.qr_checking(e)}
//                                                     >QR Checking</Checkbox>
//                                                     <br />
//                                                     <br />
//                                                     <Checkbox

//                                                         checked={this.state.qruniq_checking}
//                                                         onChange={(e) => this.qr_uniq_checking(e)}
//                                                     >QR Uniqness Checking</Checkbox>
//                                                 </div>
//                                             </CardBody> */}
//                                             </CardBody>
//                                         </Card>
//                                     </Col>
//                                     <Col sm={6} md={4} lg={3}>
//                                         <Card style={{
//                                             boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.4)', // Adjust values as needed
//                                             padding: '5px', // Example padding
//                                             background: '#ffffff',
//                                         }}>
//                                             <CardTitle className="text-center" style={{ fontWeight: 'bold' }}>Testing Samples</CardTitle>
//                                             <CardBody>
//                                                 <label style={{ fontWeight: 'bold' }}>
//                                                     Minimum no. of test samples
//                                                 </label>
//                                                 <div>
//                                                     {/* <input
//                                                 className="form-control"
//                                                 type="number"
//                                                 defaultValue={this.state.test_samples}
//                                                 id="example-number-input"
//                                                 onChange={(e) => this.samples(e.target.value, this.setState({ test_samples: e.target.value }))}
//                                             /> */}
//                                                     <input
//                                                         className="form-control"
//                                                         type="number"
//                                                         value={this.state.test_samples}
//                                                         id="example-number-input"

//                                                         onChange={(e) => this.samples(e.target.value)}
//                                                         onBlur={this.validateSamples}
//                                                     />
//                                                     {this.state.errorMessage && <p style={{ color: "red" }}>{this.state.errorMessage}</p>}
//                                                 </div>
//                                             </CardBody>
//                                         </Card>
//                                         <Card style={{
//                                             boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.4)', // Adjust values as needed
//                                             padding: '5px', // Example padding
//                                             background: '#ffffff',
//                                         }}>
//                                             <CardTitle className="text-center" style={{ fontWeight: 'bold' }}>Training Configuration</CardTitle>
//                                             <CardBody>
//                                                 <label style={{ fontWeight: 'bold' }}>
//                                                     Training Accuracy Time per sample (seconds):
//                                                 </label>
//                                                 <div>
//                                                     <input
//                                                         className="form-control"
//                                                         type="number"
//                                                         defaultValue={this.state.timer_samples}
//                                                         id="example-number-input"
//                                                         onChange={(e) => this.train_timer(e.target.value, this.setState({ timer_samples: e.target.value }))}
//                                                     />
//                                                 </div>
//                                                 <br />

//                                                 <label style={{ fontWeight: 'bold' }}>
//                                                     Training Cycle Count:
//                                                 </label>
//                                                 <div>
//                                                     <input
//                                                         className="form-control"
//                                                         type="number"
//                                                         defaultValue={this.state.trainCycleCount}
//                                                         id="example-number-input"
//                                                         onChange={(e) => this.cycleCountChange(e.target.value, this.setState({ trainCycleCount: e.target.value }))}
//                                                     />
//                                                 </div>
//                                             </CardBody>
//                                         </Card>
//                                     </Col>
//                                     {/* <Col sm={6} md={4} lg={3}>
//                                 <Card style={{
//                                     boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.4)', // Adjust values as needed
//                                     padding: '5px', // Example padding
//                                     background: '#ffffff',
//                                 }}>
//                                     <CardTitle className="text-center" style={{ fontWeight: 'bold' }}>Testing Configuration</CardTitle>
//                                     <CardBody>
//                                         <label style={{ fontWeight: 'bold' }}>
//                                             Training Accuracy Time per sample (seconds):
//                                         </label>
//                                         <div>
//                                             <input
//                                                 className="form-control"
//                                                 type="number"
//                                                 defaultValue={this.state.timer_samples}
//                                                 id="example-number-input"
//                                                 onChange={(e) => this.train_timer(e.target.value, this.setState({ timer_samples: e.target.value }))}
//                                             />
//                                         </div>
//                                         <br />
//                                         <label style={{ fontWeight: 'bold' }}>
//                                             Training Cycle Count:
//                                         </label>
//                                         <div>
//                                             <input
//                                                 className="form-control"
//                                                 type="number"
//                                                 defaultValue={this.state.trainCycleCount}
//                                                 id="example-number-input"
//                                                 onChange={(e) => this.cycleCountChange(e.target.value, this.setState({ trainCycleCount: e.target.value }))}
//                                             />
//                                         </div>
//                                     </CardBody>
//                                 </Card>
//                                 <Button color="primary" className="w-md m-1" outline={this.state.selectFilter !== 3} onClick={() => { this.config_fields(3) }}>Training Configuration</Button>

//                             </Col> */}
//                                     <Col sm={6} md={4} lg={3}>
//                                         <Card style={{
//                                             boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.4)', // Adjust values as needed
//                                             padding: '5px', // Example padding
//                                             background: '#ffffff',
//                                         }}>
//                                             <CardTitle className="text-center" style={{ fontWeight: 'bold' }}>Label Name</CardTitle>
//                                             <CardBody>
//                                                 <div>
//                                                     <label style={{ fontWeight: 'bold' }}>Ok Label Name:</label>
//                                                     <input type="text" className="form-control" id="example-number-input" placeholder="Enter Your real component name" defaultValue={this.state.real} onChange={(e) => this.setState({ real: e.target.value })} />
//                                                 </div>
//                                                 <br />
//                                                 <div>
//                                                     <label style={{ fontWeight: 'bold' }}>Not Good Label Name:</label>
//                                                     <input type="text" className="form-control" id="example-number-input" placeholder="Enter Your fake component name" defaultValue={this.state.fake} onChange={(e) => this.setState({ fake: e.target.value })} />
//                                                 </div>
//                                                 {/* <br />
//                                         <div>
//                                             <label style={{ fontWeight: 'bold' }}>Possible Match Label Name:</label>
//                                             <input type="text" className="form-control" id="example-number-input" placeholder="Enter Your component name" defaultValue={this.state.posble_match} onChange={(e) => this.setState({ posble_match: e.target.value })} />
//                                         </div> */}
//                                                 <br />
//                                                 <div>
//                                                     <Button color="primary" className="w-md m-1" onClick={() => this.submitLabel()}>Submit</Button>
//                                                 </div>
//                                             </CardBody>
//                                         </Card>
//                                     </Col>

//                                     {/* <Col sm={6} md={4} lg={3}>
//                                 <Card style={{
//                                     boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.4)',
//                                     background: '#ffffff',
//                                 }}>
//                                     <CardTitle className="text-center" style={{ fontWeight: 'bold' }}>QR Scanner</CardTitle>
//                                     <CardBody>
//                                         <div className="form-check">
//                                             <Checkbox
//                                                 checked={this.state.qr_checking}
//                                                 onChange={(e) => this.qr_checking(e)}
//                                             >QR Checking</Checkbox>
//                                             <br />
//                                             <br />
//                                             <Checkbox

//                                                 checked={this.state.qruniq_checking}
//                                                 onChange={(e) => this.qr_uniq_checking(e)}
//                                             >QR Uniqness Checking</Checkbox>
//                                         </div>
//                                     </CardBody>
//                                 </Card>
//                             </Col> */}
//                                 </Row>

//                             </CardBody>
//                         </Card>
//                         {/* QC Setting */}
//                         {/* <Row >
//                             <Col sm={6} md={3}>
//                                 <Row>
//                                     <Label> Qc Setting: </Label>
//                                 </Row>
//                                 <Row>
//                                     <Checkbox
//                                         checked={this.state.manual_qty_corrn}
//                                         onChange={(e) => this.qc_manual_correction(e)}
//                                     >Enable Manual Quantity Correction</Checkbox>
//                                 </Row>
//                                 <Row>
//                                     {
//                                         this.state.manual_qty_corrn ?
//                                             <Checkbox
//                                                 checked={this.state.password_protect}
//                                                 onChange={(e) => this.psw_protect(e)}
//                                             >Password Protected</Checkbox> : null
//                                     }
//                                 </Row>
//                                 <Row>
//                                     {
//                                         this.state.password_protect ?
//                                             <div>
//                                                 <form onSubmit={this.handleSubmit}>
//                                                     <label>
//                                                         Enter Password:
//                                                         <div>
//                                                             <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => this.setState({ password: e.target.value })} /> {''}
//                                                             <button type="button" onClick={this.handleToggleShowPassword}>
//                                                                 {showPassword ? <FaEyeSlash /> : <FaEye />}
//                                                             </button>
//                                                         </div>
//                                                     </label>
//                                                     {' '}<button type="submit">Submit</button>
//                                                     {errorMessage && <p>{errorMessage}</p>}
//                                                 </form>
//                                             </div>
//                                             : null
//                                     }
//                                 </Row>
//                             </Col>
//                             <Col sm={6} md={3}>
//                                 <div>
//                                     <Checkbox
//                                         checked={this.state.classify_rej_part}
//                                         onChange={(e) => this.classify_rej(e)}
//                                     >Classification Rejected Parts</Checkbox>
//                                 </div>

//                                 {
//                                     this.state.classify_rej_part ?
//                                         <Radio.Group onChange={this.mand_option} value={this.state.selectM_O}>
//                                             <Space >
//                                                 {
//                                                     this.state.classify_rej_parts.map((data, index) => (
//                                                         <div className='pay_cards' key={index} style={{ background: (this.state.selectM_O !== data) && 'white' }}>
//                                                             <Radio value={data}>{data}</Radio>
//                                                         </div>
//                                                     ))
//                                                 }
//                                             </Space>
//                                         </Radio.Group> : null
//                                 }
//                             </Col>
//                         </Row> */}
//                     </Container>
//                 </div>
//             </React.Fragment>

//         );



//     }

// }

// Configuration.propTypes = {
//     history: PropTypes.any.isRequired,
// };
// export default Configuration;