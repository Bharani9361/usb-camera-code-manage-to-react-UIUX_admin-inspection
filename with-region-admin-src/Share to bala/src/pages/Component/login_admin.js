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
// import 'antd/dist/antd.css';
import urlSocket from "../AdminInspection/urlSocket";

const send_data = []
class LoginAdmin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataloaded: false,
            tbIndex: 0,
            samples_list: [],
            station_info: [],
            active_inactive: ['Active', 'Inactive'],
            selectM_A: 'Active',
            comp_list: false,
            station_name: '',
            mac_address: '',
            station_id: '',
            obj: {}
        }
    }

    componentDidMount() {
        var stationInfo = JSON.parse(sessionStorage.getItem("stationInfo"))
        console.log('first42', stationInfo)
        if (stationInfo.length !== 0) {
            this.setState({ station_info: stationInfo, station_name: stationInfo.station_name, mac_address: stationInfo.mac_addrs, selectM_A: stationInfo.status, station_id: stationInfo._id })
        }
        else {
            this.setState({ station_name: this.state.station_name, mac_address: this.state.mac_addrs, selectM_A: this.state.status })
        }

        try {
            urlSocket.post('/comp_list',
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('samples_list', data)
                    this.setState({ samples_list: data, dataloaded: true })
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }

    samples = (e, data) => {
        this.setState({ comp_list: e })
        console.log('comp_list', e, data.comp_name, data.comp_code)
        const nieto = {
            comp_name: data.comp_name,
            comp_code: data.comp_code
        }
        let datasend = {}
        console.log('datasend', datasend)
        datasend["comp_name"] = nieto.comp_name
        datasend["comp_code"] = nieto.comp_code
        if (e === true) {
            send_data.push(datasend)
            console.log('send_data', send_data)
        }
    }

    samples_All = (e) => {
        console.log('comp_list_all', e)
    }

    selectActive_inactive = (e) => {
        console.log('first', e.target.value)
        this.setState({ selectM_A: e.target.value })
    }

    submitForm = () => {
        console.log('sbmited')
        let station_name = this.state.station_name
        let mac_addrs = this.state.mac_address
        let status = this.state.selectM_A

        if (station_name === '') {
            alert('enter the station name')
        }
        else if (mac_addrs === '') {
            alert('enter the mac address')
        }
        else if (station_name !== undefined && mac_addrs !== undefined) {
            if (this.state.station_info.length !== 0) {
                let _id = this.state.station_info._id
                try {
                    urlSocket.post('/manage_station_data', {'_id':_id, 'station_name': station_name, 'mac_addrs': mac_addrs, 'status': status },
                        { mode: 'no-cors' })
                        .then((response) => {
                            let data = response.data
                            console.log('response', data)
                            // if (data === 'Station Name Already Created') {
                            //     alert('Station Name Already Created')
                            // }
                            // if (data === "Mac Address Already Created") {
                            //     alert('Mac Address Already Created')
                            // }
                        })
                        .catch((error) => {
                            console.log(error)
                        })
                } catch (error) {
                    console.log("----", error)
                }
            }
            else {
                try {
                    urlSocket.post('/manage_station_data', { 'station_name': station_name, 'mac_addrs': mac_addrs, 'status': status },
                        { mode: 'no-cors' })
                        .then((response) => {
                            let data = response.data
                            console.log('response', data)
                            if (data === 'Station Name Already Created') {
                                alert('Station Name Already Created')
                            }
                            if (data === "Mac Address Already Created") {
                                alert('Mac Address Already Created')
                            }
                        })
                        .catch((error) => {
                            console.log(error)
                        })
                } catch (error) {
                    console.log("----", error)
                }
            }
        }
    }


    render() {
        if (this.state.dataloaded) {

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
                                    <CardTitle className="text-center">Entry Screen for Inspection</CardTitle>
                                </Col>
                            </Row>
                            <br />
                            <Row>
                                <Col xl="4"><Label>Station Name:</Label></Col>
                                <Col xl="4"><Input
                                    type="text"
                                    className="form-control"
                                    id="horizontal-compname-Input"
                                    placeholder="Enter Your"
                                    value={this.state.station_name}
                                    onChange={(e) => this.setState({ station_name: e.target.value })}
                                /></Col>
                            </Row>
                            <br />
                            <Row>
                                <Col xl="4"><Label>Mac Address:</Label></Col>
                                <Col xl="4"><Input
                                    type="text"
                                    className="form-control"
                                    id="horizontal-compname-Input"
                                    placeholder="Enter Your"
                                    value={this.state.mac_address}
                                    onChange={(e) => this.setState({ mac_address: e.target.value })}
                                />
                                </Col>
                            </Row>
                            <br />
                            <Row>
                                <Col xl="4"><Label>Status:</Label></Col>
                                <Col xl="4"><Radio.Group onChange={this.selectActive_inactive} value={this.state.selectM_A}>
                                    <Space >
                                        {
                                            this.state.active_inactive.map((data, index) => (
                                                <div className='pay_cards' key={index} style={{ background: (this.state.selectM_A !== data) && 'white' }}>
                                                    <Radio value={data}>{data}</Radio>
                                                </div>
                                            ))
                                        }
                                    </Space>
                                </Radio.Group></Col>
                            </Row>
                            <Row>
                                <div className="text-end">
                                    <Button color="primary" className="w-md m-1" onClick={() => this.submitForm()}>Submit</Button>
                                </div>
                            </Row>
                        </Container>
                        {/* container-fluid */}
                    </div>
                </React.Fragment>
            );
        }
        else {
            return null
        }
    }
}
LoginAdmin.propTypes = {
    history: PropTypes.any.isRequired,
};
export default LoginAdmin;