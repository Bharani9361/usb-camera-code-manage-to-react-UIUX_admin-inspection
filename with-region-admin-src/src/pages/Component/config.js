import React, { Component } from "react";
import MetaTags from 'react-meta-tags';
import PropTypes from "prop-types"
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
    InputGroup, Modal, Table
} from "reactstrap";
import axios from "axios";
import { Link } from "react-router-dom";
import Select from 'react-select';
import { Radio, Space, Checkbox } from 'antd';
import 'antd/dist/antd.css';
import urlSocket from "../AdminInspection/urlSocket"
import { FaEye, FaEyeSlash } from 'react-icons/fa';


class Configuration extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataloaded: false,
            showTable2: false,
            tbIndex: 0,
            dateWise_filterdata: [],
            addCompModal: false,
            selectFilter: null,
            manual_qty_corrn: false,
            password_protect: false,
            password: '',
            errorMessage: '',
            showPassword: false,
            classify_rej_part: false,
            // ok:"",
            // notok:"",
            config_data: [],
            deviceInfo: [],
            options: [
                { label: 1 },
                { label: 2 },
                { label: 3 },
                { label: 4 },
                { label: 5 },
                { label: 6 },
                { label: 7 },
                { label: 8 },
                { label: 9 },
                { label: 10 },
                { label: 11 },
                { label: 12 },
                { label: 13 },
                { label: 14 },
                { label: 15 },
                { label: 16 },
                { label: 17 },
                { label: 18 },
                { label: 19 },
                { label: 20 },
            ],
            option: [
                { label: 0 },
                { label: 1 },
                { label: 2 },
                { label: 3 },
                { label: 4 },
                { label: 5 },
                { label: 6 },
                { label: 7 },
                { label: 8 },
                { label: 9 },
                { label: 10 },
                { label: 11 },
                { label: 12 },
                { label: 13 },
                { label: 14 },
                { label: 15 },
                { label: 16 },
                { label: 17 },
                { label: 18 },
                { label: 19 },
                { label: 20 },
            ],
            manual_auto_option: ['Manual', 'Auto'],
            classify_rej_parts: ['Mandatory', 'Optional'],
            selectedOption: { label: 5 },
            selectOption: { label: 0 },
            selectM_A: 'Manual',
            selectM_O: 'Optional',
            timer: 10,
            test_samples: 25,
            timer_samples: 30,
            deviceId: '',
            real: "",
            fake: "",
            posble_match: "",
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleToggleShowPassword = this.handleToggleShowPassword.bind(this);
    }

    componentDidMount() {
        console.log('first', this.state.manual_auto_option)
        try {
            urlSocket.post('/config',
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('min_ok_for_training', data)
                    let select_min_ok = {
                        label: data[0].min_ok_for_training
                    }
                    let select_min_notok = {
                        label: data[0].min_notok_for_training
                    }
                    this.setState({ config_data: data, selectedOption: select_min_ok, selectOption: select_min_notok, selectM_A: data[0].inspection_type, timer: data[0].countdown, test_samples: data[0].test_samples, timer_samples: data[0].train_acc_timer_per_sample, real: data[0].positive, fake: data[0].negative, posble_match: data[0].posble_match, qr_checking: data[0].qr_checking, qruniq_checking: data[0].qr_uniq_checking, manual_qty_corrn: data[0].manual_qty_corrn, password_protect: data[0].password_protect, password: data[0].qc_password, selectM_O: data[0].rej_parts, classify_rej_part: data[0].classify_rej_part })
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
        this.config_fields()
    }


    config_fields = (data) => {
        console.log('data', data)
        this.setState({ selectFilter: data })
    }

    onSelectComponent = (e1) => {
        console.log('e', e1)
    }
    selectComponent = (e2) => {
        console.log('e', e2)
    }
    selectManual_auto = (e) => {
        console.log('e', e.target.value)
        this.setState({ selectM_A: e.target.value })
        let selectManual_Auto = e.target.value
        let data = this.state.config_data
        let id = null;

        if (data.length > 0) {
            id = data[0]._id
        }
        console.log('id', id)
        try {
            // axios.post('https://172.16.1.91:5000/update_config', {'_id':id, 'min_notok_for_training': this.state.notok, "min_ok_for_training": this.state.ok },
            urlSocket.post('/manual_auto', { '_id': id, 'inspection_type': selectManual_Auto },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('inspection_type', data)
                    this.setState({ config_data: data })
                    // window.location.reload(false);             
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }

    countdown = (e) => {
        console.log('e', e)
        let countdown = e
        let data = this.state.config_data
        let id = null;

        if (data.length > 0) {
            id = data[0]._id
        }
        console.log('id', id)
        try {
            urlSocket.post('/timer', { '_id': id, 'countdown': countdown },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('config', data)
                    //this.setState({timer:data[0].countdown})
                    this.setState({ config_data: data })
                    // window.location.reload(false);             
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }

    samples = (e) => {
        console.log('e', e)
        let test_samples = e
        let data = this.state.config_data
        let id = null;

        if (data.length > 0) {
            id = data[0]._id
        }
        console.log('id', id)
        try {
            urlSocket.post('/test_samples', { '_id': id, 'test_samples': test_samples },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('config', data)
                    //this.setState({timer:data[0].countdown})
                    this.setState({ config_data: data })
                    // window.location.reload(false);             
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }

    train_timer = (e) => {
        console.log('e', e)
        let timer_samples = e
        //this.setState({timer_samples:e}) 
        let data = this.state.config_data
        let id = null;

        if (data.length > 0) {
            id = data[0]._id
        }
        console.log('id', id)
        try {
            urlSocket.post('/train_acc_timer', { '_id': id, 'train_acc_timer_per_sample': timer_samples },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('config', data)
                    //this.setState({timer:data[0].countdown})
                    this.setState({ config_data: data })
                    // window.location.reload(false);             
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }

    submit = () => {
        let selectnotok_label = this.state.selectOption
        let notok = selectnotok_label.label
        let selectok_label = this.state.selectedOption
        let ok = selectok_label.label
        console.log('config_data', this.state.config_data)
        let data = this.state.config_data
        let id = null;

        if (data.length > 0) {
            id = data[0]._id
        }
        console.log('id', id)
        try {
            urlSocket.post('/update_config', { '_id': id, 'min_notok_for_training': notok, "min_ok_for_training": ok },
                // axios.post('https://172.16.1.91:5000/update_config', { '_id': id, 'min_notok_for_training': notok, "min_ok_for_training": ok, 'inspection_type': selectManual_Auto },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('min_notok_for_training', data)
                    this.setState({ config_data: data })
                    // window.location.reload(false);             
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }

    submitLabel = () => {
        let real = this.state.real
        let fake = this.state.fake
        let posble_match = this.state.posble_match
        console.log(`real`, real)
        console.log(`fake`, fake)
        let data = this.state.config_data
        let id = null;
        if (data.length > 0) {
            id = data[0]._id
        }
        console.log('id', id)
        try {
            urlSocket.post('/labeling', { '_id': id, 'positive': real, 'negative': fake, 'posble_match': posble_match },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    this.setState({ config_data: data })
                    console.log(data)
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
        }
    }

    qr_checking = (e) => {
        this.setState({ qr_checking: e.target.checked })
        let data = this.state.config_data
        let id = null;

        if (data.length > 0) {
            id = data[0]._id
        }
        console.log('id', id)
        try {
            urlSocket.post('/qr_scanner', { '_id': id, 'qr_checking': e.target.checked },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    this.setState({ config_data: data })
                    console.log(data)
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
        }
    }

    qr_uniq_checking = (e) => {
        this.setState({ qruniq_checking: e.target.checked })
        let data = this.state.config_data
        let id = null;

        if (data.length > 0) {
            id = data[0]._id
        }

        console.log('id', id)
        try {
            urlSocket.post('/qr_uniqness', { '_id': id, 'qr_uniq_checking': e.target.checked },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    this.setState({ config_data: data })
                    console.log(data)
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
        }
    }

    qc_manual_correction = (e) => {
        this.setState({ manual_qty_corrn: e.target.checked })
    }

    psw_protect = (e) => {
        this.setState({ password_protect: e.target.checked })
    }

    handleSubmit(event) {
        event.preventDefault();
        const { password } = this.state;
        // if (password.length < 8) {
        //     this.setState({ errorMessage: 'Password must be at least 8 characters long' });
        //     console.log('378', this.state.errorMessage)
        // } else {
        this.setState({ errorMessage: '' });
        let data = this.state.config_data
        let id = null;
        let manual_qty_corrn = this.state.manual_qty_corrn

        if (data.length > 0) {
            id = data[0]._id
        }
        console.log('id', id)
        try {
            // axios.post('https://172.16.1.91:5000/update_config', {'_id':id, 'min_notok_for_training': this.state.notok, "min_ok_for_training": this.state.ok },
            urlSocket.post('/qc_correction_psw', { '_id': id, 'qc_password': password, 'manual_qty_corrn': manual_qty_corrn, 'password_protect': this.state.password_protect },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('qc_password', data)
                    this.setState({ config_data: data, errorMessage: 'Password is generated' })
                    // window.location.reload(false);             
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
        // }        
    }

    handleToggleShowPassword() {
        const { showPassword } = this.state;
        this.setState({ showPassword: !showPassword });
    }

    classify_rej = (e) => {
        this.setState({ classify_rej_part: e.target.checked })
        let data = this.state.config_data
        let id = null;

        if (data.length > 0) {
            id = data[0]._id
        }
        console.log('id', id)
        try {
            // axios.post('https://172.16.1.91:5000/update_config', {'_id':id, 'min_notok_for_training': this.state.notok, "min_ok_for_training": this.state.ok },
            urlSocket.post('/classify_reject_parts', { '_id': id, 'rej_parts': 'Optional', 'classify_rej_part': e.target.checked },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('inspection_type', data)
                    this.setState({ config_data: data, selectM_O: data[0].rej_parts, classify_rej_part: data[0].classify_rej_part })
                    // window.location.reload(false);             
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }

    mand_option = (e) => {
        console.log('e', e.target.value)
        this.setState({ selectM_O: e.target.value })
        let selectMandatory_Option = e.target.value
        let data = this.state.config_data
        let id = null;

        if (data.length > 0) {
            id = data[0]._id
        }
        console.log('id', id)
        try {
            // axios.post('https://172.16.1.91:5000/update_config', {'_id':id, 'min_notok_for_training': this.state.notok, "min_ok_for_training": this.state.ok },
            urlSocket.post('/mandatory_option', { '_id': id, 'rej_parts': selectMandatory_Option, 'classify_rej_part': this.state.classify_rej_part },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('inspection_type', data)
                    this.setState({ config_data: data, selectM_O: data[0].rej_parts, classify_rej_part: data[0].classify_rej_part })
                    // window.location.reload(false);             
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }

    render() {
        const { password, errorMessage, showPassword } = this.state;
        return (
            <React.Fragment>
                <div className="page-content">
                    <MetaTags>
                        {/* <title>Form Layouts | Skote - React Admin & Dashboard Template</title> */}
                    </MetaTags>
                    <Container fluid={true} style={{ minHeight: '100vh', background: 'white' }}>
                        {/* <Breadcrumbs title="Forms" breadcrumbItem="Form Layouts" /> */}
                        <Row className="p-2">
                            <Col lg={12}>
                                <CardTitle className="text-center">Configuration Details</CardTitle>
                            </Col>
                        </Row>
                        <br />

                        <Row>
                            <Col>
                                <Button color="primary" className="w-md m-1" outline={this.state.selectFilter !== 0} onClick={() => { this.config_fields(0) }}>Training Images</Button>
                                <br />
                                {
                                    this.state.selectFilter === 0 &&
                                    <div>
                                        <div>
                                            <Row>
                                                <Col sm={10}>
                                                    <label>Minimum number of ok images for training:</label>
                                                    <Select
                                                        value={this.state.selectedOption}
                                                        onChange={(e1) => this.onSelectComponent(this.setState({ selectedOption: e1.label }), this.setState({ selectedOption: e1 }))}
                                                        options={this.state.options}
                                                    />
                                                </Col>
                                            </Row>
                                        </div>
                                        <br />
                                        <div>
                                            <Row>
                                                <Col sm={10}>
                                                    <label>Minimum number of not ok images for training:</label>
                                                    <Select
                                                        value={this.state.selectOption}
                                                        onChange={(e2) => this.selectComponent(this.setState({ selectOption: e2.label }), this.setState({ selectOption: e2 }))}
                                                        options={this.state.option}
                                                    />
                                                </Col>
                                            </Row>
                                        </div>
                                        <br />
                                        <div>
                                            <Row>
                                                <Col sm={2}>
                                                    <div>
                                                        <Button color="primary" className="w-md m-1" onClick={() => this.submit()}>Submit</Button>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                    </div>
                                }
                            </Col>
                            <Col>
                                <Button color="primary" className="w-md m-1" outline={this.state.selectFilter !== 1} onClick={() => { this.config_fields(1) }}>Testing Mode</Button>
                                <br />{ }<br />
                                {
                                    this.state.selectFilter === 1 &&
                                    <div>
                                        <Row>
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
                                    </div>
                                }
                                <br />
                                {
                                    this.state.selectFilter === 1 &&
                                    this.state.selectM_A === 'Auto' &&
                                    <Row>
                                        <Col sm={5}>
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
                                    </Row>
                                }
                            </Col>
                            <Col>
                                <Button color="primary" className="w-md m-1" outline={this.state.selectFilter !== 2} onClick={() => { this.config_fields(2) }}>Testing Samples</Button>
                                <br /> { } <br />
                                <div>
                                    {
                                        this.state.selectFilter === 2 &&
                                        <Row>
                                            <Col sm={5}>
                                                <label>
                                                    Minimum no. of test samples
                                                </label>
                                                <div>
                                                    <input
                                                        className="form-control"
                                                        type="number"
                                                        defaultValue={this.state.test_samples}
                                                        id="example-number-input"
                                                        onChange={(e) => this.samples(e.target.value, this.setState({ test_samples: e.target.value }))}
                                                    />
                                                </div>
                                                {/* <Button color="primary" className="w-md m-1" outline={this.state.selectedFilter !== 1} onClick={() => { this.active_inactive(true, "training completed", 1) }}> Active </Button> */}
                                            </Col>
                                        </Row>
                                    }
                                </div>
                            </Col>
                            <Col>
                                <Button color="primary" className="w-md m-1" outline={this.state.selectFilter !== 3} onClick={() => { this.config_fields(3) }}>Training accuracy time per sample</Button>
                                <br /> { } <br />
                                <div>
                                    {
                                        this.state.selectFilter === 3 &&
                                        <Row>
                                            <Col sm={5}>
                                                <label>
                                                    Seconds:
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
                                                {/* <Button color="primary" className="w-md m-1" outline={this.state.selectedFilter !== 1} onClick={() => { this.active_inactive(true, "training completed", 1) }}> Active </Button> */}
                                            </Col>
                                        </Row>
                                    }
                                </div>
                            </Col>
                            <Col>
                                <Button color="primary" className="w-md m-1" outline={this.state.selectFilter !== 4} onClick={() => { this.config_fields(4) }}>Label Name</Button>
                                <br />
                                {
                                    this.state.selectFilter === 4 &&
                                    <div>
                                        <div>
                                            <Row>
                                                <Col sm={10}>
                                                    <label>Ok Label Name:</label>
                                                    <input type="text" className="form-control" id="example-number-input" placeholder="Enter Your real component name" defaultValue={this.state.real} onChange={(e) => this.setState({ real: e.target.value })} />
                                                </Col>
                                            </Row>
                                        </div>
                                        <br />
                                        <div>
                                            <Row>
                                                <Col sm={10}>
                                                    <label>Not Good Label Name:</label>
                                                    <input type="text" className="form-control" id="example-number-input" placeholder="Enter Your fake component name" defaultValue={this.state.fake} onChange={(e) => this.setState({ fake: e.target.value })} />
                                                </Col>
                                            </Row>
                                        </div>
                                        <br />
                                        <div>
                                            <Row>
                                                <Col sm={10}>
                                                    <label>Possible Match Label Name:</label>
                                                    <input type="text" className="form-control" id="example-number-input" placeholder="Enter Your component name" defaultValue={this.state.posble_match} onChange={(e) => this.setState({ posble_match: e.target.value })} />
                                                </Col>
                                            </Row>
                                        </div>
                                        <br />
                                        <div>
                                            <Row>
                                                <Col sm={2}>
                                                    <div>
                                                        <Button color="primary" className="w-md m-1" onClick={() => this.submitLabel()}>Submit</Button>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>
                                    </div>
                                }
                            </Col>

                            <Col>
                                <Button color="primary" className="w-md m-1" outline={this.state.selectFilter !== 5} onClick={() => { this.config_fields(5) }}>QR Scanner</Button>
                                {
                                    this.state.selectFilter === 5 &&
                                    <div className="form-check">
                                        <Checkbox
                                            checked={this.state.qr_checking}
                                            onChange={(e) => this.qr_checking(e)}
                                        >QR Checking</Checkbox>

                                        <Checkbox
                                            checked={this.state.qruniq_checking}
                                            onChange={(e) => this.qr_uniq_checking(e)}
                                        >QR Uniqness Checking</Checkbox>
                                    </div>

                                }

                            </Col>


                            {/* <Col>
                            <Button color="primary" className="w-md m-1" outline={this.state.selectFilter !== 5} onClick={() => { this.config_fields(5) }}>Camera Name</Button>
                                <br />
                                {
                                    this.state.selectFilter === 5 &&
                                    <div>
                                        <Col sm={5}>
                                            <label>camera name:</label>
                                            <Select
                                                value={this.state.deviceId}
                                                onChange={(e) => this.device_info(this.setState({ deviceId: e.label }), this.setState({ deviceId: e }))}
                                                options={this.state.deviceInfo}
                                            />
                                        </Col>
                                    </div>
                                }
                            </Col> */}
                        </Row>

                        <br />

                        <Row sm={12}>
                            <Col sm={6}>
                                <Row>
                                    <Label> Qc Setting: </Label>
                                </Row>
                                <Row>
                                    <Checkbox
                                        checked={this.state.manual_qty_corrn}
                                        onChange={(e) => this.qc_manual_correction(e)}
                                    >Enable Manual Quantity Correction</Checkbox>
                                </Row>
                                <Row>
                                    {
                                        this.state.manual_qty_corrn ?
                                            <Checkbox
                                                checked={this.state.password_protect}
                                                onChange={(e) => this.psw_protect(e)}
                                            >Password Protected</Checkbox> : null

                                    }
                                </Row>
                                <Row>
                                    {
                                        this.state.password_protect ?
                                            <div>
                                                <form onSubmit={this.handleSubmit}>
                                                    <label>
                                                        Enter Password:
                                                        <div>
                                                            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => this.setState({ password: e.target.value })} /> {''}
                                                            <button type="button" onClick={this.handleToggleShowPassword}>
                                                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                            </button>
                                                        </div>
                                                    </label>
                                                    {' '}<button type="submit">Submit</button>
                                                    {errorMessage && <p>{errorMessage}</p>}
                                                </form>
                                            </div>
                                            : null
                                    }
                                </Row>
                            </Col>
                            <Col sm={6}>
                                <div>
                                    <Checkbox
                                        checked={this.state.classify_rej_part}
                                        onChange={(e) => this.classify_rej(e)}
                                    >Classification Rejected Parts</Checkbox>
                                </div>

                                {
                                    this.state.classify_rej_part ?
                                        <Radio.Group onChange={this.mand_option} value={this.state.selectM_O}>
                                            <Space >
                                                {
                                                    this.state.classify_rej_parts.map((data, index) => (
                                                        <div className='pay_cards' key={index} style={{ background: (this.state.selectM_O !== data) && 'white' }}>
                                                            <Radio value={data}>{data}</Radio>
                                                        </div>
                                                    ))
                                                }
                                            </Space>
                                        </Radio.Group> : null

                                }
                            </Col>
                        </Row>
                    </Container>
                    {/* container-fluid */}
                </div>
            </React.Fragment>
        );
    }


}

Configuration.propTypes = {
    history: PropTypes.any.isRequired,
};
export default Configuration;