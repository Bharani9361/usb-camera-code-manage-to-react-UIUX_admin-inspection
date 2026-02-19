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
import toastr from "toastr";
import SearchField from "react-search-field";
import SweetAlert from 'react-bootstrap-sweetalert';
import urlSocket from "../AdminInspection/urlSocket"
// import _ from 'lodash'

// import Device from './Camera'

class DeviceInfo extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            dataloaded: false,
            addStationModal: false,
            tbIndex: 0,
            intervalId: '',
            device_info: [],
            device_info_a: [],
            device_info_b: [],
            sorting: { field: "", order: "" },
            items_per_page_stock: 100,
            currentPage_stock: 1,
            selectFilter: null,
            active_inactive: ['Active', 'Inactive'],
            device_position: [{ label: 'Top' },
            { label: 'Bottom' },
            { label: 'Right' },
            { label: 'Left' }
            ],
            // position: { label: 'Top' },           
            alertMsg: false,
            mac_address: '',
            deviceId: '',
            device_name:''
        }
    }

    componentDidMount() {
        this._isMounted = true;
        try {
            urlSocket.post('/deviceInfo',
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('data118', data)       
                    this.setState({ device_name: { label: data[0].device_name}, _id: data[0]._id, position:{label:data[0].device_position}})
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
        }       
        //this.setState({ selectFilter: 1})
    }

    componentWillUnmount = async () => {
        this._isMounted = false;
        clearInterval(this.state.intervalId)
    }

    async device_find(selectFilter) {
        this.setState({ selectFilter })
        let intervalId = await setInterval(() => {
            navigator.mediaDevices.enumerateDevices().then(devices =>
                this.handledevice(devices)
            )
        }, 300)
        this.setState({ intervalId })
    }

    handledevice = (devices) => {
        console.log('devices77', devices)
        let device_info = devices.filter(({ kind }) => kind === 'videoinput')
        console.log('deviceinfo1044', device_info)
        if (device_info.length === 0) {
            this.setState({ alertMsg: true })
            // throw 'No camera found on this device.';
        }
        // else if (this.state.device_info_b.length !== 0) {
        //     this.setState({alertMsg:false})
        //     device_info.map((device_a, index) => {
        //         console.log('device_a1046', device_a)
        //         let position_data = this.state.device_info_b.filter((device_b) => {
        //             return device_b.deviceId === device_a.deviceId
        //         })
        //         // let position_data = _.filter(this.state.device_info_b, e => {
        //         //     return e.deviceId === device_a.deviceId
        //         // })
        //         console.log('position_data782', position_data)
        //         if (position_data[0].position !== undefined) {
        //             device_info[index].position = position_data[0].position
        //         }
        //     })
        //     // console.log('first785', data)
        //     this.setState({ device_info_a: device_info })
        //     console.log('this.state.device_info_athos.stite.', this.state.device_info_a)
        // }
        else {
            this.setState({ device_info_a: device_info, alertMsg: false })
        }
    }

    deviceInfo = (e) => {
        console.log('e322', e)
        let data = this.state.device_info_b
        console.log('data', data)
        let id = null;
        if (this.state._id !== '' && this.state._id !== undefined) {
            id = this.state._id
        }
        try {
            console.log('id', id)
            urlSocket.post('/detected_device', { '_id':id,'device_name': e.label, 'device_id': e.deviceId, 'other_info':e },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('data118', data)       
                    this.setState({ device_name: { label: data[0].device_name}, _id: data[0]._id })
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
        }       
    }

    device_position = (e) => {
        console.log('e117', e)
        let id = null;
        if (this.state._id !== '' && this.state._id !== undefined) {
            id = this.state._id
        }
        
        try {
            urlSocket.post('/device_position', {'_id': id, 'device_position': e.label },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('data118', data)       
                    this.setState({ position: { label: data[0].device_position}, _id: data[0]._id  })
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
                    </MetaTags>
                    <Container fluid={true} style={{ minHeight: '100vh', background: 'white' }}>
                        <br />
                        <div>
                            <CardTitle className="text-center" style={{ fontSize: 28 }}> DEVICE INFORMATION</CardTitle>
                        </div>
                        <Row className="p-2">
                            <Col>
                                <Button color="primary" className="w-md m-1" outline={this.state.selectFilter !== 1} onClick={() => { this.device_find(1) }}> Detected Device </Button>
                                {
                                    this.state.selectFilter === 1 &&
                                    <div>
                                        <div className="row mb-4">
                                            <Col sm={4}>
                                                <Label>Device Info:</Label>{' '}
                                                <Select
                                                    value={this.state.device_name}
                                                    onChange={(e) => this.deviceInfo(e)}
                                                    options={this.state.device_info_a}
                                                    getOptionLabel={option => (option.label)}
                                                    placeholder="Select"
                                                />
                                            </Col>
                                        </div>
                                        <div className="row mb-4">
                                            <Col sm={4}>
                                                <Label>Device Position:</Label>{' '}
                                                <Select
                                                    value={this.state.position}
                                                    onChange={(e) => this.device_position(e, this.setState({ position: e }))}
                                                    options={this.state.device_position}
                                                    getOptionLabel={option => (option.label)}
                                                />
                                            </Col>
                                        </div>
                                    </div>
                                }
                            </Col>
                        </Row>
                        {
                            this.state.alertMsg ?
                                <SweetAlert
                                showCancel
                                cancelBtnBsStyle="success"
                                confirmBtnBsStyle="danger"
                                    title={
                                        <Label style={{ fontSize: 20 }}>
                                            No camera found on this device.
                                        </Label>
                                    }
                                    confirmBtnText="cancel"
                                    cancelBtnText="OK"
                                    onConfirm={() => this.setState({ alertMsg: false })}
                                    onCancel={() => this.setState({
                                        alertMsg: false 
                                    })}
                                    closeOnClickOutside={false}
                                >
                                </SweetAlert> : null
                        }
                    </Container>
                    {/* container-fluid */}
                </div>
            </React.Fragment>
        );
    }
}
DeviceInfo.propTypes = {
    history: PropTypes.any.isRequired,
};
export default DeviceInfo;