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
import Eventall from './Eventall'
import SweetAlert from 'react-bootstrap-sweetalert';
import urlSocket from "../AdminInspection/urlSocket"

const send_data = []
class EntryScrn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataloaded: false,
            tbIndex: 0,
            samples_list: [],
            message: '',
            show_msg: false,
            man_auto: false,
            active_inactive: ['Active', 'Inactive'],
            selectM_A: 'Active',
            station_info: [],
            station_comp_info: [],
            station_name: '',
            station_comp_name: '',
            mac_address: '',
            obj: {}
        }
    }

    componentDidMount() {
        var stationInfo = JSON.parse(sessionStorage.getItem("stationInfo"))
        let station_name = stationInfo.station_name
        console.log('stationInfo', stationInfo, station_name)
        this.setState({ station_info: stationInfo, station_name: station_name })
        this.compInfo()
    }

    compInfo = () => {
        try {
            urlSocket.post('/comp_status_info',
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
    //     var nietos = [];
    // var obj = {};
    // obj["01"] = nieto.label;
    // obj["02"] = nieto.value;
    // nietos.push(obj);

    submitForm = (data) => {
        console.log('sbmited', data)
        var send_data = []
        let station_name = this.state.station_name
        let mac_addrs = this.state.station_info.mac_addrs
        let status = this.state.station_info.status
        let stn_ver = this.state.station_info.stn_ver
        console.log('stn_ver', stn_ver)
        var bool_ins_type_selected = true
        // var man_auto = false
        data.map((currItem, index) => {
            //console.log('currItem', currItem, index)
            if (currItem.checked === true) {
                var obj = {}
                if (currItem.checked_name === undefined) {
                    console.log('first', currItem.checked_name, currItem.comp_name)
                    // this.setState({man_auto: true})
                    bool_ins_type_selected = false
                }
                if (currItem.qr_checked === undefined) {
                    console.log('first91', currItem.qr_checked)
                    currItem.qr_checked = false
                    obj['qr_checking'] = currItem.qr_checked
                }
                if (currItem.qruniq_checked === undefined) {
                    console.log('first95', currItem.qruniq_checked)
                    currItem.qruniq_checked = false
                    obj['qr_uniq_checking'] = currItem.qruniq_checked
                }
                if (currItem.timer === undefined) {
                    currItem.timer = 10
                    obj['timer'] = currItem.timer
                }
                //console.log('user', currItem)
                //obj['checked'] = currItem.checked
                obj['comp_name'] = currItem.comp_name
                obj['comp_code'] = currItem.comp_code
                obj['comp_id'] = currItem._id
                obj['datasets'] = currItem.datasets
                obj['mod_ver'] = currItem.mod_ver
                obj['comp_ver'] = currItem.comp_ver
                obj['comp_zip'] = currItem.comp_zip
                obj['inspection_type'] = currItem.checked_name
                obj['station_name'] = station_name
                obj['stn_ver'] = stn_ver
                obj['mac_addrs'] = mac_addrs
                obj['station_id'] = this.state.station_info._id
                obj['qr_checking'] = currItem.qr_checked
                obj['qr_uniq_checking'] = currItem.qruniq_checked
                obj['timer'] = currItem.timer
                send_data.push(obj)
                // console.log('first', send_data)
            }
        })

        console.log('dont cross this')
        if (bool_ins_type_selected) {
            try {
                console.log('send_data', send_data)
                urlSocket.post('/crud_station_comp_info', { 'station_comp_info': send_data },
                    { mode: 'no-cors' })
                    .then((response) => {
                        let data = response.data
                        if (data === 'Success') {
                            this.setState({ message: data, show_msg: true, man_auto: false })
                        }
                        else {
                            this.setState({ message: 'Error', show_msg: true, man_auto: false })
                        }
                        console.log('message', data)
                    })
                    .catch((error) => {
                        console.log(error)
                    })
            } catch (error) {
                console.log("----", error)
            }
        }
        else {
            this.setState({ man_auto: true })
        }


        // data.forEach((user)=>{
        //       // console.log('user', user)
        //       if(user.checked===true){
        //         console.log('user66', user.comp_code)
        //         obj['comp_name'] = user.comp_name
        //         obj['comp_code'] = user.comp_code
        //         data_send.push(obj)
        //         try {
        //             axios.post('https://172.16.1.91:5000/manage_station_data', {'comp_list':data_send},
        //                 { mode: 'no-cors' })
        //                 .then((response) => {
        //                     let data = response.data
        //                     console.log('samples_list', data)
        //                 })
        //                 .catch((error) => {
        //                     console.log(error)
        //                 })
        //         } catch (error) {
        //             console.log("----", error)
        //         }
        //       }
        //     })

    }
    navigation = () => {
        const { history } = this.props
        console.log(this.props)
        history.push("/station_list")
    }

    backtoStation = () => {
        console.log('close')
    }

    render() {
        if (this.state.dataloaded) {
            return (
                <React.Fragment>
                    <div className="page-content">
                        <MetaTags>
                        </MetaTags>
                        <Container fluid={true} style={{ minHeight: '100vh', background: 'white' }}>
                            <br />
                            <Row className="p-2">
                                <Col lg={2} className="text-front">
                                <Link to="/station_list"><Button onClick={() => this.backtoStation()} >Back</Button></Link>
                                </Col>
                            </Row>
                            <Row>
                                <Card>
                                    <CardBody>
                                        <Label>
                                            Station Name: {this.state.station_name}
                                        </Label>
                                    </CardBody>
                                </Card>
                            </Row>
                            <Row>
                                <Eventall samples={this.state.samples_list} station_info={this.state.station_info} selected_data={(data) => { this.submitForm(data) }} />
                            </Row>
                            <div>
                                {
                                    this.state.show_msg ?
                                        <SweetAlert
                                            title="Component Assigned Successfully"
                                            confirmBtnText="OK"
                                            onConfirm={() => this.navigation()}
                                            // onCancel={() => this.setState({
                                            //     show_msg: false
                                            // })}
                                            closeOnClickOutside={false}
                                            style={{ zIndex: 997 }}
                                            timeout={2000}
                                        >
                                        </SweetAlert> : null
                                }
                            </div>
                            <div>
                                {
                                    this.state.man_auto ?
                                        <SweetAlert
                                            title="Choose manual or auto"
                                            confirmBtnText="OK"
                                            onConfirm={() => this.setState({ man_auto: false })}
                                            // onCancel={() => this.setState({
                                            //     show_msg: false
                                            // })}
                                            closeOnClickOutside={false}
                                            style={{ zIndex: 998 }}
                                        // timeout={2000}
                                        >
                                        </SweetAlert> : null
                                }
                            </div>
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
EntryScrn.propTypes = {
    history: PropTypes.any.isRequired,
};
export default EntryScrn;