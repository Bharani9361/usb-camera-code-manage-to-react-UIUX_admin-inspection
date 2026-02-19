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
// commented this due to ant design version upgrade from 4.x to 5.8.4
// import 'antd/dist/antd.css';
import urlSocket from "./urlSocket"

class DeployConfiguration extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectFilter: null,
            config_data: [],
            manual_auto_option: ['Manual', 'Auto'],
            selectM_A: 'Manual',
            timer: 10,
        }
    }

    componentDidMount() {
        console.log('first', this.state.manual_auto_option)
        try {
            urlSocket.post('/config',
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('min_ok_for_training', data)
                    this.setState({ config_data: data, selectM_A: data[0].inspection_type, timer: data[0].countdown, qr_checking: data[0].qr_checking, qruniq_checking: data[0].qr_uniq_checking })
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
        this.config_fields()
    }

    // configuratiion = () => {
    //     try {
    //         urlSocket.post('/config',
    //             { mode: 'no-cors' })
    //             .then((response) => {
    //                 let data = response.data
    //                 console.log('min_ok_for_training', data)
    //                 this.setState({ config_data: data, selectM_A: data[0].inspection_type, timer: data[0].countdown, qr_checking: data[0].qr_checking, qruniq_checking: data[0].qr_uniq_checking })
    //             })
    //             .catch((error) => {
    //                 console.log(error)
    //             })
    //     } catch (error) {
    //         console.log("----", error)
    //     }
    // }


    config_fields = (data) => {
        console.log('data', data)
        this.setState({ selectFilter: data })
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

    render() {
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
                        </Row>
                    </Container>
                    {/* container-fluid */}
                </div>
            </React.Fragment>
        );
    }
}

DeployConfiguration.propTypes = {
    history: PropTypes.any.isRequired,
};
export default DeployConfiguration;
