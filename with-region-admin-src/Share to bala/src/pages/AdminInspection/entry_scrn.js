//Chiran

import React, { useState, useEffect } from "react";
import MetaTags from 'react-meta-tags';
import PropTypes from "prop-types";
import {
    Card,
    Col,
    Container,
    Row,
    CardBody,
    CardTitle
} from "reactstrap";
import { useHistory } from "react-router-dom";
import Swal from 'sweetalert2';
import Breadcrumbs from "components/Common/Breadcrumb";
import Eventall from './Eventall';
import SweetAlert from 'react-bootstrap-sweetalert';
import urlSocket from "./urlSocket";
import { Spinner } from "reactstrap";


const EntryScrn = (props) => {
    const history = useHistory();

    // States
    const [dataloaded, setDataloaded] = useState(false);
    const [tbIndex, setTbIndex] = useState(0);
    const [samples_list, setSamplesList] = useState([]);
    const [message, setMessage] = useState('');
    const [show_msg, setShowMsg] = useState(false);
    const [man_auto, setManAuto] = useState(false);
    const [active_inactive] = useState(['Active', 'Inactive']);
    const [selectM_A, setSelectM_A] = useState('Active');
    const [station_info, setStationInfo] = useState([]);
    const [station_comp_info, setStationCompInfo] = useState([]);
    const [station_name, setStationName] = useState('');
    const [station_comp_name, setStationCompName] = useState('');
    const [mac_address, setMacAddress] = useState('');
    const [obj, setObj] = useState({});



        // Lifecycle: componentDidMount
    useEffect(() => {
        const stationInfo = JSON.parse(sessionStorage.getItem("stationInfo"));
        console.log('stationInfo', stationInfo)
        if (stationInfo) {
            setStationInfo(stationInfo);
            setStationName(stationInfo.station_name);
            console.log('stationInfo', stationInfo, stationInfo.station_name);
        }
        compInfo();
    }, []);

    // Function: Error handler
    const error_handler = (error) => {
        sessionStorage.removeItem("authUser");
        history.push("/login");
    };

    // Function: fetch component info
    const compInfo = async () => {
        try {
            const response = await urlSocket.post('/api/components/comp_status_info', { mode: 'no-cors' });
            const data = response.data;
            console.log('data67', data)
            if (data.error === "Tenant not found") {
                error_handler(data);
            } else {
                console.log('samples_list', data);
                setSamplesList(data);
                setDataloaded(true);
            }
        } catch (error) {
            console.log("----", error);
        }
    };



    // Navigation helpers
    const navigation = () => history.push("/station_list_stg");
    const backtoStation = () => history.push('/station_list_stg');

    // Function: assign components to station
    const componentAssign = async (send_data) => {
        console.log('send_data', send_data)
        try {
            const response = await urlSocket.post('/crud_station_comp_info', {
                station_comp_info: send_data,
                station_id: station_info._id
            }, { mode: 'no-cors' });

            const data = response.data;
            if (data.error === "Tenant not found") {
                error_handler(data);
            } else {
                console.log('143 data : ', data);
                if (data === 'Success') {
                    setMessage(data);
                    setShowMsg(true);
                    setManAuto(false);
                } else if (data === 'Cleared') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Components have been Cleared for this Station',
                        confirmButtonText: 'OK',
                    }).then(() => {
                        history.push("/station_list");
                    });
                } else {
                    setMessage('Error');
                    setShowMsg(true);
                    setManAuto(false);
                }
            }
        } catch (error) {
            console.log("----", error);
        }
    };

    // Function: form submit handler
    const submitForm = (data) => {
        console.log('data122data122', data);
        // Avoid shadowing outer `station_name`/`station_info` by destructuring into new local names
        const stName = station_name;
        const { mac_addrs, status, stn_ver, _id: station_id } = station_info || {};
        let bool_ins_type_selected = true;
        let profile_selection = true;
        let detect_select = true;
        let qrbarcode_check = true;
        let unselectedCompProf = null;
        let detectrequiredComp = null;
        let qrbarcode_comp = null;

        const send_data = [];

        data.forEach(currItem => {
            if (currItem.checked !== true) return;

            if (currItem.checked_name === undefined) bool_ins_type_selected = false;
            if (currItem.profile_name === undefined) { profile_selection = false; unselectedCompProf = currItem.comp_name; }
            if (currItem.detect_selection === undefined) { detect_select = false; detectrequiredComp = currItem.comp_name; }
            if (currItem.qrbar_check === true && currItem.qrbar_check_type == null) { qrbarcode_check = false; qrbarcode_comp = currItem.comp_name; }

            if (currItem.qr_checked === undefined) currItem.qr_checked = false;
            if (currItem.qruniq_checked === undefined) currItem.qruniq_checked = false;
            if (currItem.timer === undefined) currItem.timer = 10;

                send_data.push({
                comp_name: currItem.comp_name,
                comp_code: currItem.comp_code,
                comp_id: currItem._id,
                // comp_ver: currItem.comp_ver,
                inspection_type: currItem.checked_name,
                    station_name: stName,
                stn_ver,
                mac_addrs,
                station_id,
                qr_checking: currItem.qr_checked,
                qr_uniq_checking: currItem.qruniq_checked,
                timer: currItem.timer,
                profile_name: currItem.profile_name,
                profile_id: currItem.profile_id,
                stage_profiles: currItem.stage_profiles,
                inspection_method: currItem.inspection_method,
                comp_ver: currItem.comp_ver,
                // profile_ver: currItem.profile_ver,
                // ok_allany: currItem.ok_allany,
                // ok_opt: currItem.ok_opt,
                // ng_allany: currItem.ng_allany,
                // ng_opt: currItem.ng_opt,
                detect_selection: currItem.detect_selection,
                detection_type: currItem.detection_type,
                // overAll_testing: currItem.overAll_testing,
                // region_selection: currItem.region_selection,
                // region_wise_testing: currItem.region_wise_testing,
                ...(currItem.qrbar_check === true && { qrbar_check: currItem.qrbar_check, qrbar_check_type: currItem.qrbar_check_type }),
                ...(currItem.detect_selection && currItem.detection_type === "Smart Object Locator" && { selected_regions: currItem.selected_regions || [] }),
                // zoom_value: currItem.zoom_value,
            });
        });

        const showAlert = (title, icon = 'info', timer = 4000) => {
            Swal.fire({ title, icon, timer, showConfirmButton: false });
        };

        if (send_data.length === 0) {
            Swal.fire({
                title: 'No Components selected',
                icon: 'info',
                timer: 2000,
                confirmButtonText: 'OK',
            });

            Swal.fire({
                title: `No Components selected for this Station`,
                text: `Are you sure you want to clear the Components for this Station`,
                icon: 'warning',
                showCancelButton: true,
                cancelButtonText: 'No',
                cancelButtonColor: '#28a745',
                confirmButtonText: 'Yes',
                confirmButtonColor: '#007bff'
            }).then(result => {
                if (result.isConfirmed) {
                    componentAssign(send_data);
                }
            });
            return;
        }

        if (!profile_selection) { showAlert(`Profile selection required for "${unselectedCompProf}"`, 'warning'); return; }
        if (!bool_ins_type_selected) { showAlert('Choose Manual or Auto', 'info'); return; }
        if (!detect_select) { showAlert(`Object Detection method required for "${detectrequiredComp}"`, 'warning'); return; }
        if (!qrbarcode_check) { showAlert(`Barcode checking method required for "${qrbarcode_comp}"`, 'warning'); return; }

        componentAssign(send_data);
    };

    // Render JSX


    return (
        <React.Fragment>
            <div className="page-content">
                <MetaTags />
                <Breadcrumbs
                    title="STATION COMPONENT LIST"
                    isBackButtonEnable={true}
                    gotoBack={backtoStation}
                />
                <Container fluid>
                    <Card>
                        <CardBody>
                            <CardTitle className="mb-2">
                                <span className="me-2 font-size-12">Station Name:</span> {station_name || 'Loading...'}
                            </CardTitle>
                            <Row>
                                {dataloaded && samples_list.length > 0 ? (
                                    <Eventall
                                        samples={samples_list}
                                        station_info={station_info}
                                        selected_data={submitForm}
                                    />
                                ) : (
                                <Col
                                    xs="12"
                                    className="d-flex flex-column align-items-center justify-content-center py-5 bg-light rounded shadow-sm"
                                    style={{ minHeight: '200px' }}
                                >
                                    {dataloaded ? (
                                        samples_list.length > 0 ? null : (
                                            <>
                                                <i className="bi bi-folder-x text-muted" style={{ fontSize: '3rem' }}></i>
                                                <h5 className="text-muted mt-3">No record found</h5>
                                            </>
                                        )
                                    ) : (
                                        <>
                                            <Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />
                                            <h5 className="text-muted mt-3">Loading components...</h5>
                                        </>
                                    )}
                                </Col>

                                )}
                            </Row>
                        </CardBody>
                    </Card>

                    {show_msg && (
                        <SweetAlert
                            title="Component Assigned Successfully"
                            confirmBtnText="OK"
                            onConfirm={navigation}
                            closeOnClickOutside={false}
                            style={{ zIndex: 997 }}
                            timeout={2000}
                        />
                    )}

                    {man_auto && (
                        <SweetAlert
                            title="Choose manual or auto"
                            confirmBtnText="OK"
                            onConfirm={() => setManAuto(false)}
                            closeOnClickOutside={false}
                            style={{ zIndex: 998 }}
                        />
                    )}
                </Container>
            </div>
        </React.Fragment>
    );
};

EntryScrn.propTypes = {
    history: PropTypes.any
};

export default EntryScrn;



//Bharani
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
// import { Radio, Space, Checkbox } from 'antd';
// // import 'antd/dist/antd.css';
// import Eventall from './Eventall'
// import SweetAlert from 'react-bootstrap-sweetalert';
// import urlSocket from "./urlSocket"

// import Swal from 'sweetalert2';
// import Breadcrumbs from "components/Common/Breadcrumb";

// const send_data = []
// class EntryScrn extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             dataloaded: false,
//             tbIndex: 0,
//             samples_list: [],
//             message: '',
//             show_msg: false,
//             man_auto: false,
//             active_inactive: ['Active', 'Inactive'],
//             selectM_A: 'Active',
//             station_info: [],
//             station_comp_info: [],
//             station_name: '',
//             station_comp_name: '',
//             mac_address: '',
//             obj: {}
//         }
//     }

//     componentDidMount() {
//         var stationInfo = JSON.parse(sessionStorage.getItem("stationInfo"));
//         let station_name = stationInfo.station_name
//         console.log('stationInfo', stationInfo, station_name)
//         this.setState({ station_info: stationInfo, station_name: station_name })
//         this.compInfo()
//     }

//     compInfo = () => {
//         try {
//             urlSocket.post('/comp_status_info',
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let data = response.data
//                     if (response.data.error === "Tenant not found") {
//                         this.error_handler(response.data);
//                     }
//                     else{
//                         console.log('samples_list', data)
//                         this.setState({ samples_list: data, dataloaded: true })
//                     }
//                 })
//                 .catch((error) => {
//                     console.log(error)
//                 })
//         } catch (error) {
//             console.log("----", error)
//         }
//     }
//     //     var nietos = [];
//     // var obj = {};
//     // obj["01"] = nieto.label;
//     // obj["02"] = nieto.value;
//     // nietos.push(obj);

//     submitForm = (data) => {
//         console.log('data81 ', data);

//         const {
//             station_name,
//             station_info: { mac_addrs, status, stn_ver, _id: station_id }
//         } = this.state;

//         let bool_ins_type_selected = true;
//         let profile_selection = true;
//         let detect_select = true;
//         let qrbarcode_check = true;

//         let unselectedCompProf = null;
//         let detectrequiredComp = null;
//         let qrbarcode_comp = null;

//         const send_data = [];

//         data.forEach(currItem => {
//             if (currItem.checked !== true) return;

//             // Validate required fields
//             if (currItem.checked_name === undefined) {
//                 bool_ins_type_selected = false;
//             }
//             if (currItem.profile_name === undefined) {
//                 profile_selection = false;
//                 unselectedCompProf = currItem.comp_name;
//             }
//             if (currItem.detect_selection === undefined) {
//                 detect_select = false;
//                 detectrequiredComp = currItem.comp_name;
//             }
//             if (currItem.qrbar_check === true && (currItem.qrbar_check_type == null)) {
//                 qrbarcode_check = false;
//                 qrbarcode_comp = currItem.comp_name;
//             }

//             // Set defaults if undefined
//             if (currItem.qr_checked === undefined) currItem.qr_checked = false;
//             if (currItem.qruniq_checked === undefined) currItem.qruniq_checked = false;
//             if (currItem.timer === undefined) currItem.timer = 10;

//             // Build object to send
//             send_data.push({
//                 comp_name: currItem.comp_name,
//                 comp_code: currItem.comp_code,
//                 comp_id: currItem._id,
//                 comp_ver: currItem.comp_ver,
//                 inspection_type: currItem.checked_name,
//                 station_name,
//                 stn_ver,
//                 mac_addrs,
//                 station_id,
//                 qr_checking: currItem.qr_checked,
//                 qr_uniq_checking: currItem.qruniq_checked,
//                 timer: currItem.timer,
//                 profile_name: currItem.profile_name,
//                 profile_id: currItem.profile_id,
//                 profile: currItem.profile,
//                 profile_ver: currItem.profile_ver,
//                 ok_allany: currItem.ok_allany,
//                 ok_opt: currItem.ok_opt,
//                 ng_allany: currItem.ng_allany,
//                 ng_opt: currItem.ng_opt,
//                 detect_selection: currItem.detect_selection,
//                 detection_type: currItem.detection_type,
//                 overAll_testing: currItem.overAll_testing,
//                 region_selection: currItem.region_selection,
//                 region_wise_testing: currItem.region_wise_testing,
//                 ...(currItem.qrbar_check === true && {
//                     qrbar_check: currItem.qrbar_check,
//                     qrbar_check_type: currItem.qrbar_check_type,
//                 }),
//                 ...(currItem.detect_selection && currItem.detection_type == "Smart Object Locator" && {
//                     selected_regions: currItem.selected_regions || [],
//                 }),
//                 zoom_value: currItem.zoom_value,
//             });
//         });

//         console.log('182data, send_data, station_name, mac_addrs, status, stn_ver, bool_ins_type_selected : ',
//             data, send_data, station_name, mac_addrs, status, stn_ver, bool_ins_type_selected
//         );

//         const showAlert = (title, icon = 'info', timer = 4000) => {
//             Swal.fire({ title, icon, timer, showConfirmButton: false });
//         };

//         if (send_data.length === 0) {
//             Swal.fire({
//                 title: 'No Components selected',
//                 icon: 'info',
//                 timer: 2000,
//                 confirmButtonText: 'OK',
//             });

//             Swal.fire({
//                 title: `No Components selected for this Station`,
//                 text: `Are you sure you want to clear the Components for this Station`,
//                 icon: 'warning',
//                 showCancelButton: true,
//                 cancelButtonText: 'No',
//                 cancelButtonColor: '#28a745',
//                 confirmButtonText: 'Yes',
//                 confirmButtonColor: '#007bff'
//             }).then(result => {
//                 if (result.isConfirmed) {
//                     this.componentAssign(send_data);
//                 } else {
//                     console.log('Got answer: No');
//                 }
//             });
//             return;
//         }

//         if (!profile_selection) {
//             showAlert(`Profile selection required for "${unselectedCompProf}"`, 'warning');
//             return;
//         }

//         if (!bool_ins_type_selected) {
//             showAlert('Choose Manual or Auto', 'info');
//             return;
//         }

//         if (!detect_select) {
//             showAlert(`Object Detection method required for "${detectrequiredComp}"`, 'warning');
//             return;
//         }

//         if (!qrbarcode_check) {
//             showAlert(`Barcode checking method required for "${qrbarcode_comp}"`, 'warning');
//             return;
//         }

//         // If all validations pass, proceed
//         this.componentAssign(send_data);
//     };
//     // submitForm = (data) => {
//     //     console.log('data81 ', data)
//     //     var send_data = []
//     //     let station_name = this.state.station_name
//     //     let mac_addrs = this.state.station_info.mac_addrs
//     //     let status = this.state.station_info.status
//     //     let stn_ver = this.state.station_info.stn_ver
//     //     var bool_ins_type_selected = true
//     //     var profile_selection = true
//     //     let unselectedCompProf;
//     //     var detect_select = true;
//     //     let detectrequiredComp;
//     //     let qrbarcode_check = true;
//     //     let qrbarcode_comp;

        
//     //     // var man_auto = false
//     //     data.map((currItem, index) => {
//     //         console.log('data98 ', currItem, index)
//     //         if (currItem.checked === true) {
//     //             var obj = {}
//     //             if (currItem.checked_name === undefined) {
//     //                 console.log('first', currItem.checked_name, currItem.comp_name)
//     //                 // this.setState({man_auto: true})
//     //                 bool_ins_type_selected = false
//     //             }
//     //             if (currItem.profile_name === undefined) {
//     //                 console.log('first', currItem.profile_name, currItem.profile_id)
//     //                 // this.setState({man_auto: true})
//     //                 profile_selection = false;
//     //                 unselectedCompProf = currItem.comp_name;
//     //             }

//     //             if (currItem.detect_selection === undefined) {
//     //                 console.log('first', currItem.detect_selection, currItem.profile_id)
//     //                 // this.setState({man_auto: true})
//     //                 detect_select = false;
//     //                 detectrequiredComp = currItem.comp_name;
//     //             }


//     //             if (currItem.qr_checked === undefined) {
//     //                 console.log('first91', currItem.qr_checked)
//     //                 currItem.qr_checked = false
//     //                 obj['qr_checking'] = currItem.qr_checked
//     //             }
//     //             if (currItem.qruniq_checked === undefined) {
//     //                 console.log('first95', currItem.qruniq_checked)
//     //                 currItem.qruniq_checked = false
//     //                 obj['qr_uniq_checking'] = currItem.qruniq_checked
//     //             }
//     //             if (currItem.timer === undefined) {
//     //                 currItem.timer = 10
//     //                 obj['timer'] = currItem.timer
//     //             }
//     //             if (currItem.qrbar_check === true && 
//     //                 (currItem.qrbar_check_type === undefined || currItem.qrbar_check_type === null)) {
//     //                     qrbarcode_check = false;
//     //                     qrbarcode_comp = currItem.comp_name;
//     //             }
                
//     //             //console.log('user', currItem)
//     //             //obj['checked'] = currItem.checked
//     //             obj['comp_name'] = currItem.comp_name
//     //             obj['comp_code'] = currItem.comp_code
//     //             obj['comp_id'] = currItem._id
//     //             // obj['datasets'] = currItem.datasets
//     //             // obj['mod_ver'] = currItem.mod_ver  // old code changes the bala 21_09_23
//     //             // obj['mod_ver'] = currItem.model_ver
//     //             obj['comp_ver'] = currItem.comp_ver
//     //             // obj['comp_zip'] = currItem.comp_zip
//     //             obj['inspection_type'] = currItem.checked_name
//     //             obj['station_name'] = station_name
//     //             obj['stn_ver'] = stn_ver
//     //             obj['mac_addrs'] = mac_addrs
//     //             obj['station_id'] = this.state.station_info._id
//     //             obj['qr_checking'] = currItem.qr_checked
//     //             obj['qr_uniq_checking'] = currItem.qruniq_checked
//     //             obj['timer'] = currItem.timer

//     //             obj['profile_name'] = currItem.profile_name
//     //             obj['profile_id'] = currItem.profile_id
//     //             obj['profile'] = currItem.profile
//     //             obj['profile_ver'] = currItem.profile_ver

//     //             obj['ok_allany'] = currItem.ok_allany
//     //             obj['ok_opt'] = currItem.ok_opt
//     //             obj['ng_allany'] = currItem.ng_allany
//     //             obj['ng_opt'] = currItem.ng_opt
//     //             obj['detect_selection'] = currItem.detect_selection;
//     //             obj['detection_type'] = currItem.detection_type;

//     //             obj['overAll_testing'] = currItem.overAll_testing;
//     //             obj['region_selection'] = currItem.region_selection;
//     //             obj['region_wise_testing'] = currItem.region_wise_testing;

//     //             if ('qrbar_check' in currItem && currItem.qrbar_check === true) {
//     //                 obj['qrbar_check'] = currItem.qrbar_check;
//     //                 obj['qrbar_check_type'] = currItem.qrbar_check_type;
//     //             }

//     //             send_data.push(obj)
//     //             // console.log('first', send_data)
//     //         }
//     //     })

//     //     console.log('182data, send_data, station_name, mac_addrs, status, stn_ver, bool_ins_type_selected : ', data, send_data, station_name, mac_addrs, status, stn_ver, bool_ins_type_selected)

//     //     if(send_data.length !== 0) {
//     //         if (profile_selection) {
//     //             if(bool_ins_type_selected) {
//     //                 if(detect_select) {
//     //                     if(qrbarcode_check) {
//     //                         this.componentAssign(send_data);
//     //                     } else {
//     //                         Swal.fire({
//     //                             title: `Barcode checking method required for "${qrbarcode_comp}"`,
//     //                             icon: 'warning',
//     //                             timer: 4000,
//     //                             showConfirmButton: false,
//     //                         });
//     //                     }
//     //                 } else {
//     //                     Swal.fire({
//     //                         title: `Object Detection method required for "${detectrequiredComp}"`,
//     //                         icon: 'warning',
//     //                         timer: 4000,
//     //                         showConfirmButton: false,
//     //                     });
//     //                 }
//     //             } else {
//     //                 // this.setState({ man_auto: true });
//     //                 Swal.fire({
//     //                     title: 'Choose Manual or Auto',
//     //                     icon: 'info',
//     //                     timer: 4000,
//     //                     showConfirmButton: false,
//     //                 });
//     //             }
                
//     //         }
//     //         else {
//     //             Swal.fire({
//     //                 title: `Profile selection required for "${unselectedCompProf}"`,
//     //                 icon: 'warning',
//     //                 timer: 4000,
//     //                 showConfirmButton: false,
//     //             });
//     //         }
//     //     } else {
//     //         Swal.fire({
//     //             title: 'No Components selected',
//     //             icon: 'info',
//     //             timer: 2000,
//     //             confirmButtonText: 'OK',
//     //             // showConfirmButton: false,
//     //         });
            
//     //         Swal.fire({
//     //             title: `No Components selected for this Station`,
//     //             text: `Are you sure you want to clear the Components for this Station`,
//     //             icon: 'warning',
//     //             showCancelButton: true,
//     //             cancelButtonText: 'No',
//     //             cancelButtonColor: '#28a745',
//     //             confirmButtonText: 'Yes',
//     //             confirmButtonColor: '#007bff'
//     //         }).then((result) => {
//     //             if (result.isConfirmed) {
//     //                 this.componentAssign(send_data);
//     //             } else {
//     //                 console.log('Got answer: No')
//     //             }
//     //         });

//     //         // Components have been successfully removed for this Station.
//     //     }
//     //     // data.forEach((user)=>{
//     //     //       // console.log('user', user)
//     //     //       if(user.checked===true){
//     //     //         console.log('user66', user.comp_code)
//     //     //         obj['comp_name'] = user.comp_name
//     //     //         obj['comp_code'] = user.comp_code
//     //     //         data_send.push(obj)
//     //     //         try {
//     //     //             axios.post('https://172.16.1.91:5000/manage_station_data', {'comp_list':data_send},
//     //     //                 { mode: 'no-cors' })
//     //     //                 .then((response) => {
//     //     //                     let data = response.data
//     //     //                     console.log('samples_list', data)
//     //     //                 })
//     //     //                 .catch((error) => {
//     //     //                     console.log(error)
//     //     //                 })
//     //     //         } catch (error) {
//     //     //             console.log("----", error)
//     //     //         }
//     //     //       }
//     //     //     })

//     // }

//     componentAssign = (send_data) => {
//         const { station_info } = this.state;
//         console.log('/crud_station_comp_info ', send_data, station_info._id)
//         try {
//             urlSocket.post('/crud_station_comp_info', 
//                 { 
//                     'station_comp_info': send_data,
//                     'station_id': station_info._id
//                 },
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let data = response.data;
//                     if (response.data.error === "Tenant not found") {
//                         this.error_handler(response.data);
//                     }
//                     else {
//                         console.log('143 data : ', data)
//                         if (data === 'Success') {
//                             this.setState({ message: data, show_msg: true, man_auto: false })
//                         } else if (data === 'Cleared') {
//                             Swal.fire({
//                                 icon: 'success',
//                                 title: 'Components have been Cleared for this Station',
//                                 confirmButtonText: 'OK',
//                             }).then((result) => {
//                                 if (result.isConfirmed) {
//                                     this.props.history.push("/station_list");
//                                 } else {
//                                     this.props.history.push("/station_list");
//                                 }
//                             })
//                         }
//                         else {
//                             this.setState({ message: 'Error', show_msg: true, man_auto: false })
//                         }
//                         console.log('message', data)
//                     }
                    
//                 })
//                 .catch((error) => {
//                     console.log(error)
//                 })
//         } catch (error) {
//             console.log("----", error)
//         }
//     }
//     navigation = () => {
//         const { history } = this.props
//         console.log(this.props)
//         history.push("/station_list")
//     }

//     backtoStation = () => {
//         console.log('close');
//         this.props.history.push('/station_list');
//     }

//     error_handler = (error) => {
//         sessionStorage.removeItem("authUser");
//         this.props.history.push("/login");
//     }

//     render() {
//         if (this.state.dataloaded) {
//             return (
//                 <React.Fragment>
//                     <div className="page-content">
//                         <MetaTags>
//                         </MetaTags>
//                         <Breadcrumbs
//                             title="STATION COMPONENT LIST"
//                             isBackButtonEnable={true}
//                             gotoBack={this.backtoStation}
//                         />
//                         {/* <Container fluid={true} style={{ minHeight: '100vh', background: 'white' }}> */}
//                         <Container fluid>
//                             <Card>
//                                 <CardBody>
//                                     <CardTitle className="mb-2 "><span className="me-2 font-size-12">Station Name:</span> {this.state.station_name}</CardTitle>
//                                     <Row>
//                                         {/* <Eventall 
//                                             samples={this.state.samples_list} 
//                                             station_info={this.state.station_info} 
//                                             selected_data={(data) => { this.submitForm(data) }} 
//                                         /> */}
//                                         {
//                                             this.state.samples_list && this.state.samples_list.length > 0 ? (
//                                                 <Eventall
//                                                     samples={this.state.samples_list}
//                                                     station_info={this.state.station_info}
//                                                     selected_data={(data) => this.submitForm(data)}
//                                                 />
//                                             ) : <Col xs="12" className="d-flex flex-column align-items-center justify-content-center py-5 bg-light rounded shadow-sm">
//                                                 <i className="bi bi-folder-x text-muted" style={{ fontSize: '3rem' }}></i> {/* Bootstrap Icon */}
//                                                 <h5 className="text-muted mt-3">No record found</h5>
//                                             </Col>
//                                         }
//                                     </Row>

//                                 </CardBody>
//                             </Card>
//                             <div>
//                                 {
//                                     this.state.show_msg ?
//                                         <SweetAlert
//                                             title="Component Assigned Successfully"
//                                             confirmBtnText="OK"
//                                             onConfirm={() => this.navigation()}
//                                             // onCancel={() => this.setState({
//                                             //     show_msg: false
//                                             // })}
//                                             closeOnClickOutside={false}
//                                             style={{ zIndex: 997 }}
//                                             timeout={2000}
//                                         >
//                                         </SweetAlert> : null
//                                 }
//                             </div>
//                             <div>
//                                 {
//                                     this.state.man_auto ?
//                                         <SweetAlert
//                                             title="Choose manual or auto"
//                                             confirmBtnText="OK"
//                                             onConfirm={() => this.setState({ man_auto: false })}
//                                             // onCancel={() => this.setState({
//                                             //     show_msg: false
//                                             // })}
//                                             closeOnClickOutside={false}
//                                             style={{ zIndex: 998 }}
//                                         // timeout={2000}
//                                         >
//                                         </SweetAlert> : null
//                                 }
//                             </div>
//                         </Container>
//                         {/* container-fluid */}
//                     </div>
//                 </React.Fragment>
//             );
//         }
//         else {
//             return null
//         }
//     }
// }
// EntryScrn.propTypes = {
//     history: PropTypes.any.isRequired,
// };
// export default EntryScrn;