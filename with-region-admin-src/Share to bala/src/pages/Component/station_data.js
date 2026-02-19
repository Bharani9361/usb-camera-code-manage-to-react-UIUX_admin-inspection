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
import StationInfoTable from './StationInfoTable'
import SweetAlert from 'react-bootstrap-sweetalert';
import urlSocket from "../AdminInspection/urlSocket";


const send_data = []
class StationData extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataloaded: false,
            tbIndex: 0,
            station_list: [],
            message: '',
            man_auto: false,
            show_msg: false,
            active_inactive: ['Active', 'Inactive'],
            selectM_A: 'Active',
            comp_info: [],
            station_comp_info: [],
            comp_name: '',
            comp_code: '',
            station_comp_name: '',
            mac_address: '',
            obj: {}
        }
    }

    componentDidMount() {
        var compInfo = JSON.parse(sessionStorage.getItem("InfoComp"))
        console.log('first', compInfo)
        let comp_name = compInfo.comp_name
        console.log('InfoComp', compInfo, comp_name)
        this.setState({ comp_info: compInfo, comp_name: comp_name, comp_code: compInfo.comp_code })
        this.stationInfo()
    }


    stationInfo = () => {
        try {
            urlSocket.post('/station_status_info',
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('station_list', data)

                    this.setState({ station_list: data, dataloaded: true })
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
        let comp_name = this.state.comp_name
        let comp_code = this.state.comp_code
        var bool_ins_type_selected = true

        data.map((currItem, index) => {
            //console.log('currItem', currItem, index)
            if (currItem.checked === true) {
                var obj = {}
                if (currItem.checked_name === undefined) {
                    console.log('first', currItem.checked_name)
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
                obj['station_name'] = currItem.station_name
                obj['mac_addrs'] = currItem.mac_addrs
                obj['station_id'] = currItem._id
                obj['stn_ver'] = currItem.stn_ver
                obj['comp_name'] = comp_name
                obj['comp_code'] = comp_code
                obj['comp_id'] = this.state.comp_info._id
                obj['datasets'] = this.state.comp_info.datasets
                obj['mod_ver'] = this.state.comp_info.mod_ver
                obj['comp_zip'] = this.state.comp_info.comp_zip
                obj['comp_ver'] = this.state.comp_info.comp_ver
                obj['inspection_type'] = currItem.checked_name
                obj['qr_checking'] = currItem.qr_checked
                obj['qr_uniq_checking'] = currItem.qruniq_checked
                obj['timer'] = currItem.timer
                send_data.push(obj)
                // console.log('first', send_data)
            }
        })
        if (bool_ins_type_selected) {
        try {
            console.log('send_data', send_data)
            urlSocket.post('/crud_comp_station_info', { 'comp_station_info': send_data },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    if (data === 'Success') {
                        this.setState({ message: data, show_msg: true })
                    }
                    else{
                        this.setState({ message: 'Error', show_msg: true })
                    }
                    console.log('samples_list', data)
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
        
    }


    backtoComp = () => {console.log('close')}

    // navigation = () => {
    //     const { history } = this.props
    //     console.log(this.props)
    //     history.push("/comp_list")
    //     /crudcomponent
    // }

    navigation = () => {
        const { history } = this.props
        console.log(this.props)
        history.push("/crudcomponent")
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
                                <Link to="/crudcomponent"><Button onClick={() => this.backtoComp()} >Back</Button></Link>
                            </Col>
                            </Row>
                            <Row>Component Name: {this.state.comp_name}{" "}, Component Code: {this.state.comp_code}</Row>
                            <Row>
                                <StationInfoTable station_data={this.state.station_list} compinfo={this.state.comp_info} selected_data={(data) => { this.submitForm(data) }} />
                            </Row>
                            <div>
                                {
                                    this.state.show_msg ?

                                        <SweetAlert
                                           // showCancel
                                            title="Station Assigned Successfully"
                                            cancelBtnBsStyle="success"
                                            confirmBtnText="OK"
                                            //cancelBtnText="No"
                                            onConfirm={() => this.navigation()}
                                            // onCancel={() => this.setState({
                                            //     show_msg: false
                                            // })}
                                            closeOnClickOutside={false}
                                            style={{ zIndex: 997 }}
                                            timeout={2000}
                                        >
                                            {/* <div style={{ fontSize: '22px' }}>
                                                Success
                                            </div> */}
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
StationData.propTypes = {
    history: PropTypes.any.isRequired,
};
export default StationData;