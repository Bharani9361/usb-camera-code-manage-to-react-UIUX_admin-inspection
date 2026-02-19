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
} from "reactstrap";
import axios from "axios";
import { Link } from "react-router-dom";
import Select from 'react-select';
import { Radio, Space, Checkbox } from 'antd';
// import 'antd/dist/antd.css';
import StationInfoTable from './StationInfoTable'
import SweetAlert from 'react-bootstrap-sweetalert';
import urlSocket from "./urlSocket";

import Swal from 'sweetalert2';
import Breadcrumbs from "components/Common/Breadcrumb";


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
            obj: {},
            profile_name: '',
            profile: {},
            profile_id: '',
        }
    }

    componentDidMount() {
        var compInfo = JSON.parse(sessionStorage.getItem("selected_profile"))
        console.log('first57 ', compInfo)
        let comp_name = compInfo.comp_name
        let pro_name = compInfo.profile_name
        let profile = compInfo.profile_data
        let profile_id = compInfo._id
        const rectangles = compInfo?.profile_data?.ng_model_data?.[0].rectangles || [];
        console.log('profileDetails', pro_name, profile)
        this.setState({
            comp_info: compInfo,
            comp_name: comp_name,
            comp_code: compInfo.comp_code,
            profile_name: pro_name,
            profile: profile,
            profile_id: profile_id,
            rectangles: rectangles
        })
        this.stationInfo()
    }


    stationInfo = () => {
        try {
            urlSocket.post('/station_status_info',
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    if (data.error === "Tenant not found") {
                        console.log("data error", data.error);
                        this.error_handler(data.error);
                    }
                    else {
                        console.log('station_list', data)

                        this.setState({ station_list: data, dataloaded: true })
                    }
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
        const { comp_info, comp_name, comp_code, profile_name, profile, profile_id } = this.state;
        const {
            ng_allany, ng_opt, ok_allany, ok_opt, profile_ver,
            overAll_testing, region_selection, region_wise_testing,
            comp_id, comp_ver
        } = comp_info;

        let send_data = [];
        let bool_ins_type_selected = true;
        let qrbarcode_check = true;
        let qrbarcode_comp = "";

        data.forEach((currItem) => {
            if (currItem.checked) {
                // Validate required field
                if (!currItem.checked_name) bool_ins_type_selected = false;

                // Default values
                const qr_checked = currItem.qr_checked ?? false;
                const qruniq_checked = currItem.qruniq_checked ?? false;
                const timer = currItem.timer ?? 10;

                // QR Barcode check validation
                if (currItem.qrbar_check && !currItem.qrbar_check_type) {
                    qrbarcode_check = false;
                    qrbarcode_comp = currItem.station_name;
                }

                const obj = {
                    station_name: currItem.station_name,
                    mac_addrs: currItem.mac_addrs,
                    station_id: currItem._id,
                    stn_ver: currItem.stn_ver,
                    comp_name,
                    comp_code,
                    comp_id,
                    comp_ver,
                    profile_name,
                    profile,
                    profile_id,
                    profile_ver,
                    ng_allany,
                    ng_opt,
                    ok_allany,
                    ok_opt,
                    inspection_type: currItem.checked_name,
                    qr_checking: qr_checked,
                    qr_uniq_checking: qruniq_checked,
                    timer,
                    detect_selection: currItem.detect_selection,
                    detection_type: currItem.detection_type,
                    overAll_testing,
                    region_selection,
                    region_wise_testing,
                    zoom_value: this.state.comp_info?.zoom_value,
                };

                if (currItem.detect_selection && currItem.detection_type == "Smart Object Locator") {
                    obj.selected_regions = currItem.selected_regions || [];
                }

                if (currItem.qrbar_check) {
                    obj.qrbar_check = true;
                    obj.qrbar_check_type = currItem.qrbar_check_type;
                }

                send_data.push(obj);
            }
        });

        console.log('Prepared send_data:', send_data);

        // Handle form validation and send
        if (send_data.length === 0) {
            return Swal.fire({
                title: 'Station Selection Required.',
                icon: 'info',
                timer: 2000,
                showConfirmButton: false,
            });
        }

        if (!bool_ins_type_selected) {
            return this.setState({ man_auto: true });
        }

        if (!qrbarcode_check) {
            return Swal.fire({
                title: `Barcode checking method required for "${qrbarcode_comp}"`,
                icon: 'warning',
                timer: 4000,
                showConfirmButton: false,
            });
        }

        try {
            urlSocket.post('/crud_comp_station_info',
                { comp_station_info: send_data, comp_id },
                { mode: 'no-cors' }
            )
                .then((response) => {
                    const data = response.data;
                    this.setState({
                        message: data === 'Success' ? data : 'Error',
                        show_msg: true
                    });
                })
                .catch((error) => {
                    console.error("Submit error:", error);
                });
        } catch (error) {
            console.error("Unexpected error:", error);
        }
    };

    // submitForm = (data) => {
    //     const { comp_info } = this.state;
    //     let ng_allany = comp_info.ng_allany;
    //     let ng_opt = comp_info.ng_opt;
    //     let ok_allany = comp_info.ok_allany;
    //     let ok_opt = comp_info.ok_opt;
    //     let profile_ver = comp_info.profile_ver;
    //     var send_data = []
    //     let comp_name = this.state.comp_name
    //     let comp_code = this.state.comp_code
    //     let qrbarcode_check = true;
    //     let qrbarcode_comp;

    //     console.log('this.state.comp_info 89', this.state.comp_info)
    //     console.log('data stattion data 107', data)
    //     var bool_ins_type_selected = true

    //     data.map((currItem, index) => {
    //         //console.log('currItem', currItem, index)
    //         if (currItem.checked === true) {
    //             var obj = {}
    //             if (currItem.checked_name === undefined) {
    //                 console.log('first', currItem.checked_name)
    //                 // this.setState({man_auto: true})
    //                 bool_ins_type_selected = false
    //             }
    //             if (currItem.qr_checked === undefined) {
    //                 console.log('first91', currItem.qr_checked)
    //                 currItem.qr_checked = false
    //                 obj['qr_checking'] = currItem.qr_checked
    //             }
    //             if (currItem.qruniq_checked === undefined) {
    //                 console.log('first95', currItem.qruniq_checked)
    //                 currItem.qruniq_checked = false
    //                 obj['qr_uniq_checking'] = currItem.qruniq_checked
    //             }
    //             if (currItem.timer === undefined) {
    //                 currItem.timer = 10
    //                 obj['timer'] = currItem.timer
    //             }

    //             if (currItem.qrbar_check === true &&
    //                 (currItem.qrbar_check_type === undefined || currItem.qrbar_check_type === null)) {
    //                 qrbarcode_check = false;
    //                 qrbarcode_comp = currItem.station_name;
    //             }
    //             //console.log('user', currItem)
    //             //obj['checked'] = currItem.checked
    //             obj['station_name'] = currItem.station_name
    //             obj['mac_addrs'] = currItem.mac_addrs
    //             obj['station_id'] = currItem._id
    //             obj['stn_ver'] = currItem.stn_ver
    //             obj['comp_name'] = comp_name
    //             obj['comp_code'] = comp_code
    //             obj['comp_id'] = this.state.comp_info.comp_id

    //             obj['profile_name'] = this.state.profile_name
    //             obj['profile'] = this.state.profile
    //             obj['profile_id'] = this.state.profile_id
    //             obj['profile_ver'] = profile_ver

    //             obj['ng_allany'] = ng_allany
    //             obj['ng_opt'] = ng_opt
    //             obj['ok_allany'] = ok_allany
    //             obj['ok_opt'] = ok_opt

    //             // obj['datasets'] = this.state.comp_info.datasets
    //             // obj['mod_ver'] = this.state.comp_info.mod_ver // old code change to bala 21_09_23
    //             // obj['mod_ver'] = this.state.comp_info.model_live_ver
    //             // obj['comp_zip'] = this.state.comp_info.comp_zip
    //             obj['comp_ver'] = this.state.comp_info.comp_ver
    //             obj['inspection_type'] = currItem.checked_name
    //             obj['qr_checking'] = currItem.qr_checked
    //             obj['qr_uniq_checking'] = currItem.qruniq_checked
    //             obj['timer'] = currItem.timer

    //             obj['detect_selection'] = currItem.detect_selection;
    //             obj['detection_type'] = currItem.detection_type;


    //             obj['overAll_testing'] = comp_info.overAll_testing;
    //             obj['region_selection'] = comp_info.region_selection;
    //             obj['region_wise_testing'] = comp_info.region_wise_testing;

    //             if ('qrbar_check' in currItem && currItem.qrbar_check === true) {
    //                 obj['qrbar_check'] = currItem.qrbar_check;
    //                 obj['qrbar_check_type'] = currItem.qrbar_check_type;
    //             }

    //             send_data.push(obj)
    //             // console.log('first', send_data)
    //         }
    //     })

    //     console.log('148 send_data : ', send_data)

    //     if(send_data.length !== 0) {
    //         if (bool_ins_type_selected) {
    //             if(qrbarcode_check) {
    //                 try {
    //                     console.log('171send_data', send_data)
    //                     urlSocket.post('/crud_comp_station_info', 
    //                         { 'comp_station_info': send_data, 'comp_id': comp_info.comp_id },
    //                         { mode: 'no-cors' })
    //                         .then((response) => {
    //                             let data = response.data
    //                             if (data.error === "Tenant not found") {
    //                                 console.log("data error", data.error);
    //                                 this.error_handler(data.error);
    //                             }
    //                             else{
    //                                  if (data === 'Success') {
    //                                 this.setState({ message: data, show_msg: true })
    //                             }
    //                             else {
    //                                 this.setState({ message: 'Error', show_msg: true })
    //                             }
    //                             console.log('samples_list', data)
    //                             }

    //                         })
    //                         .catch((error) => {
    //                             console.log(error)
    //                         })
    //                 } catch (error) {
    //                     console.log("----", error)
    //                 }
    //             } else {
    //                 Swal.fire({
    //                     title: `Barcode checking method required for "${qrbarcode_comp}"`,
    //                     icon: 'warning',
    //                     timer: 4000,
    //                     showConfirmButton: false,
    //                 });
    //             }
    //         }
    //         else {
    //             this.setState({ man_auto: true })
    //         }
    //     } else {
    //         Swal.fire({
    //             title: 'Station Selection Required.',
    //             icon: 'info',
    //             timer: 2000,
    //             showConfirmButton: false,
    //         });
    //     }



    // }


    backFunction = () => {
        console.log('close');
        this.props.history.push("/profileCreation");
    }

    error_handler = (error) => {
        sessionStorage.removeItem("authUser");
        this.props.history.push("/login");
    }

    render() {
        if (this.state.dataloaded) {
            return (
                <React.Fragment>
                    <div className="page-content">
                        <MetaTags>
                        </MetaTags>
                        <Breadcrumbs
                            title="COMPONENT STATION LIST"
                            isBackButtonEnable={true}
                            gotoBack={this.backFunction}
                        />
                        <Container fluid>
                            <Card>
                                <CardBody>
                                    <Row className="d-flex flex-wrap justify-content-start justify-content-lg-between align-items-center gap-2 mb-2">
                                        <Col xs="12" lg="auto" className="d-flex">
                                            <CardTitle className="mb-0 me-3"><span className="me-2 font-size-12">Component Name:</span>{this.state.comp_name}, </CardTitle>
                                            <CardTitle className="mb-0"><span className="me-2 font-size-12">Component Code:</span>{this.state.comp_code}</CardTitle>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <StationInfoTable
                                            station_data={this.state.station_list}
                                            compinfo={this.state.comp_info}
                                            selected_data={(data) => { this.submitForm(data) }}
                                            rectangles={this.state.rectangles}
                                        />
                                    </Row>
                                </CardBody>
                            </Card>
                        </Container>
                        <div>
                            {
                                this.state.show_msg ?

                                    <SweetAlert
                                        // showCancel
                                        title="Station Assigned Successfully"
                                        cancelBtnBsStyle="success"
                                        confirmBtnText="OK"
                                        //cancelBtnText="No"
                                        onConfirm={() => this.backFunction()}
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