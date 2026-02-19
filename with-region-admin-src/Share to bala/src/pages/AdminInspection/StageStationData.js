import React, { useState, useEffect } from "react";
import MetaTags from 'react-meta-tags';
import {
    Card,
    Col,
    Container,
    Row,
    CardBody,
    CardTitle,
} from "reactstrap";
import axios from "axios";
import { useHistory } from "react-router-dom"; // v5
import Select from 'react-select';
import { Radio, Space, Checkbox } from 'antd';
import StageStationInfoTable from "./StageStationInfoTable";
import SweetAlert from 'react-bootstrap-sweetalert';
import urlSocket from "./urlSocket";
import Swal from 'sweetalert2';
import Breadcrumbs from "components/Common/Breadcrumb";

const StageStationData = () => {
    const history = useHistory();

    const [dataloaded, setDataloaded] = useState(false);
    const [tbIndex, setTbIndex] = useState(0);
    const [station_list, setStationList] = useState([]);
    const [message, setMessage] = useState('');
    const [man_auto, setManAuto] = useState(false);
    const [show_msg, setShowMsg] = useState(false);
    const [active_inactive] = useState(['Active', 'Inactive']);
    const [selectM_A] = useState('Active');
    const [comp_info, setCompInfo] = useState({});
    const [station_comp_info, setStationCompInfo] = useState([]);
    const [comp_name, setCompName] = useState('');
    const [comp_code, setCompCode] = useState('');
    const [station_comp_name, setStationCompName] = useState('');
    const [mac_address, setMacAddress] = useState('');
    const [obj, setObj] = useState({});
    const [profile_name, setProfileName] = useState('');
    const [profile, setProfile] = useState({});
    const [profile_id, setProfileId] = useState('');
    const [rectangles, setRectangles] = useState([]);

    useEffect(() => {
        const compInfo = JSON.parse(sessionStorage.getItem("selected_profile"));
        if (!compInfo) {
            history.push("/login");
            return;
        }

        console.log('first57 ', compInfo);
        const { comp_name, profile_name, stage_profiles, _id } = compInfo;
        // const rects = compInfo?.profile_data?.ng_model_data?.[0].rectangles || [];
        const rects = compInfo;


        setCompInfo(compInfo);
        setCompName(comp_name);
        setCompCode(compInfo.comp_code);
        setProfileName(profile_name);
        setProfile(stage_profiles);
        setProfileId(_id);
        setRectangles(rects);

        fetchStationInfo();
    }, [history]);

    const fetchStationInfo = () => {
        urlSocket.post('/station_status_info', { mode: 'no-cors' })
            .then((response) => {
                const data = response.data;
                if (data.error === "Tenant not found") {
                    error_handler(data.error);
                } else {
                    console.log('station_list', data);
                    setStationList(data);
                    setDataloaded(true);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const submitForm = (data) => {
        console.log('data856', data)
        const {
            ng_allany, ng_opt, ok_allany, ok_opt, profile_ver,
            overAll_testing, region_selection, region_wise_testing,
            comp_id, comp_ver, stage_profiles
        } = comp_info;

        let send_data = [];
        let bool_ins_type_selected = true;
        let qrbarcode_check = true;
        let qrbarcode_comp = "";

        data.forEach((currItem) => {
            if (currItem.checked) {
                if (!currItem.checked_name) bool_ins_type_selected = false;

                const qr_checked = currItem.qr_checked ?? false;
                const qruniq_checked = currItem.qruniq_checked ?? false;
                const timer = currItem.timer ?? 10;

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
                    inspection_method: currItem.inspection_method,

                    // profile,
                    profile_id,
                    // profile_ver,
                    // ng_allany,
                    // ng_opt,
                    // ok_allany,
                    // ok_opt,
                    stage_profiles,
                    inspection_type: currItem.checked_name,
                    qr_checking: qr_checked,
                    qr_uniq_checking: qruniq_checked,
                    timer,
                    detect_selection: currItem.detect_selection,
                    detection_type: currItem.detection_type,
                    // overAll_testing,
                    // region_selection,
                    // region_wise_testing,
                    // zoom_value: comp_info?.zoom_value,
                };

                if (currItem.detect_selection && currItem.detection_type === "Smart Object Locator") {
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

        if (send_data.length === 0) {
            return Swal.fire({
                title: 'Station Selection Required.',
                icon: 'info',
                timer: 2000,
                showConfirmButton: false,
            });
        }

        if (!bool_ins_type_selected) {
            return setManAuto(true);
        }

        if (!qrbarcode_check) {
            return Swal.fire({
                title: `Barcode checking method required for "${qrbarcode_comp}"`,
                icon: 'warning',
                timer: 4000,
                showConfirmButton: false,
            });
        }

        urlSocket.post('/crud_comp_station_info', { comp_station_info: send_data, comp_id }, { mode: 'no-cors' })
            .then((response) => {
                const data = response.data;
                setMessage(data === 'Success' ? data : 'Error');
                setShowMsg(true);
            })
            .catch((error) => {
                console.error("Submit error:", error);
            });
    };


    // const submitForm = (data) => {
    //     console.log('data856', data);

    //     const { comp_id, comp_ver, stage_profiles } = comp_info;

    //     let send_data = [];
    //     let bool_ins_type_selected = true;
    //     let qrbarcode_check = true;
    //     let qrbarcode_comp = "";

    //     data.forEach((currItem) => {
    //         console.log('currItem', currItem);

    //         if (currItem.checked) {
    //             if (!currItem.checked_name) bool_ins_type_selected = false;

    //             const qr_checked = currItem.qr_checked ?? false;
    //             const qruniq_checked = currItem.qruniq_checked ?? false;
    //             const timer = currItem.timer ?? 10;

    //             if (currItem.qrbar_check && !currItem.qrbar_check_type) {
    //                 qrbarcode_check = false;
    //                 qrbarcode_comp = currItem.station_name;
    //             }

    //             // Loop through all stages and positions for this station
    //             if (stage_profiles) {
    //                 Object.keys(stage_profiles).forEach((stage_name) => {
    //                     const stage = stage_profiles[stage_name];

    //                     Object.keys(stage).forEach((position_name) => {
    //                         const stage_profile = stage[position_name];

    //                         console.log('Processing:', stage_name, position_name);

    //                         const obj = {
    //                             station_name: currItem.station_name,
    //                             mac_addrs: currItem.mac_addrs,
    //                             station_id: currItem._id,
    //                             stn_ver: currItem.stn_ver,
    //                             comp_name,
    //                             comp_code,
    //                             comp_id,
    //                             comp_ver,

    //                             // Stage and position info
    //                             stage_name: stage_name,
    //                             position_name: position_name,
    //                             stage_code: stage_profile.stage_code,

    //                             // Profile data from stage_profile
    //                             profile_id: stage_profile._id,
    //                             profile: stage_profile, // Send the entire stage profile
    //                             ng_allany: stage_profile.ng_allany,
    //                             ng_opt: stage_profile.ng_opt,
    //                             ok_allany: stage_profile.ok_allany,
    //                             ok_opt: stage_profile.ok_opt,

    //                             // Camera/port info
    //                             port: stage_profile.port,
    //                             p_id: stage_profile.p_id,
    //                             v_id: stage_profile.v_id,
    //                             value: stage_profile.value,
    //                             originalLabel: stage_profile.originalLabel,

    //                             inspection_type: currItem.checked_name,
    //                             qr_checking: qr_checked,
    //                             qr_uniq_checking: qruniq_checked,
    //                             timer,
    //                             detect_selection: currItem.detect_selection,
    //                             detection_type: currItem.detection_type,
    //                             overAll_testing: stage_profile.overAll_testing,
    //                             region_wise_testing: stage_profile.region_wise_testing,
    //                             zoom_value: comp_info?.zoom_value,
    //                         };

    //                         if (currItem.detect_selection && currItem.detection_type === "Smart Object Locator") {
    //                             obj.selected_regions = currItem.selected_regions || [];
    //                         }

    //                         if (currItem.qrbar_check) {
    //                             obj.qrbar_check = true;
    //                             obj.qrbar_check_type = currItem.qrbar_check_type;
    //                         }

    //                         send_data.push(obj);
    //                     });
    //                 });
    //             }
    //         }
    //     });

    //     console.log('Prepared send_data:', send_data);

    //     if (send_data.length === 0) {
    //         return Swal.fire({
    //             title: 'Station Selection Required.',
    //             icon: 'info',
    //             timer: 2000,
    //             showConfirmButton: false,
    //         });
    //     }

    //     if (!bool_ins_type_selected) {
    //         return setManAuto(true);
    //     }

    //     if (!qrbarcode_check) {
    //         return Swal.fire({
    //             title: `Barcode checking method required for "${qrbarcode_comp}"`,
    //             icon: 'warning',
    //             timer: 4000,
    //             showConfirmButton: false,
    //         });
    //     }

    //     urlSocket.post('/crud_comp_station_info', { comp_station_info: send_data, comp_id }, { mode: 'no-cors' })
    //         .then((response) => {
    //             const data = response.data;
    //             setMessage(data === 'Success' ? data : 'Error');
    //             setShowMsg(true);
    //         })
    //         .catch((error) => {
    //             console.error("Submit error:", error);
    //         });
    // };


    const backFunction = () => {
        history.push("/profileCreation");
    };

    const error_handler = (error) => {
        sessionStorage.removeItem("authUser");
        history.push("/login");
    };

    if (!dataloaded) {
        return null;
    }

    return (
        <React.Fragment>
            <div className="page-content">
                <MetaTags>
                    {/* Add meta tags if needed */}
                </MetaTags>
                <Breadcrumbs
                    title="COMPONENT STATION LIST"
                    isBackButtonEnable={true}
                    gotoBack={backFunction}
                />
                <Container fluid>
                    <Card>
                        <CardBody>
                            <Row className="d-flex flex-wrap justify-content-start justify-content-lg-between align-items-center gap-2 mb-2">
                                <Col xs="12" lg="auto" className="d-flex">
                                    <CardTitle className="mb-0 me-3">
                                        <span className="me-2 font-size-12">Component Name:</span>{comp_name},
                                    </CardTitle>
                                    <CardTitle className="mb-0">
                                        <span className="me-2 font-size-12">Component Code:</span>{comp_code}
                                    </CardTitle>
                                </Col>
                            </Row>
                            <Row>
                                <StageStationInfoTable
                                    station_data={station_list}
                                    compinfo={comp_info}
                                    selected_data={submitForm}
                                    rectangles={rectangles}
                                />
                            </Row>
                        </CardBody>
                    </Card>
                </Container>

                {/* Success Alert */}
                {show_msg && (
                    <SweetAlert
                        title="Station Assigned Successfully"
                        confirmBtnText="OK"
                        onConfirm={backFunction}
                        closeOnClickOutside={false}
                        style={{ zIndex: 997 }}
                        timeout={2000}
                    />
                )}

                {/* Manual/Auto Alert */}
                {man_auto && (
                    <SweetAlert
                        title="Choose manual or auto"
                        confirmBtnText="OK"
                        onConfirm={() => setManAuto(false)}
                        closeOnClickOutside={false}
                        style={{ zIndex: 998 }}
                    />
                )}
            </div>
        </React.Fragment>
    );
};

export default StageStationData;
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
// } from "reactstrap";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import Select from 'react-select';
// import { Radio, Space, Checkbox } from 'antd';
// // import 'antd/dist/antd.css';
// import StageStationInfoTable from "./StageStationInfoTable";
// import SweetAlert from 'react-bootstrap-sweetalert';
// import urlSocket from "./urlSocket";

// import Swal from 'sweetalert2';
// import Breadcrumbs from "components/Common/Breadcrumb";


// const send_data = []
// class StageStationData extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             dataloaded: false,
//             tbIndex: 0,
//             station_list: [],
//             message: '',
//             man_auto: false,
//             show_msg: false,
//             active_inactive: ['Active', 'Inactive'],
//             selectM_A: 'Active',
//             comp_info: [],
//             station_comp_info: [],
//             comp_name: '',
//             comp_code: '',
//             station_comp_name: '',
//             mac_address: '',
//             obj: {},
//             profile_name: '',
//             profile: {},
//             profile_id: '',
//         }
//     }

//     componentDidMount() {
//         var compInfo = JSON.parse(sessionStorage.getItem("selected_profile"))
//         console.log('first57 ', compInfo)
//         let comp_name = compInfo.comp_name
//         let pro_name = compInfo.profile_name
//         let profile = compInfo.profile_data
//         let profile_id = compInfo._id
//         const rectangles = compInfo?.profile_data?.ng_model_data?.[0].rectangles || [];
//         console.log('profileDetails', pro_name, profile)
//         this.setState({
//             comp_info: compInfo,
//             comp_name: comp_name,
//             comp_code: compInfo.comp_code,
//             profile_name: pro_name,
//             profile: profile,
//             profile_id: profile_id,
//             rectangles: rectangles
//         })
//         this.stationInfo()
//     }


//     stationInfo = () => {
//         try {
//             urlSocket.post('/station_status_info',
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let data = response.data
//                     if (data.error === "Tenant not found") {
//                         console.log("data error", data.error);
//                         this.error_handler(data.error);
//                     }
//                     else {
//                         console.log('station_list', data)

//                         this.setState({ station_list: data, dataloaded: true })
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
//         const { comp_info, comp_name, comp_code, profile_name, profile, profile_id } = this.state;
//         const {
//             ng_allany, ng_opt, ok_allany, ok_opt, profile_ver,
//             overAll_testing, region_selection, region_wise_testing,
//             comp_id, comp_ver
//         } = comp_info;

//         let send_data = [];
//         let bool_ins_type_selected = true;
//         let qrbarcode_check = true;
//         let qrbarcode_comp = "";

//         data.forEach((currItem) => {
//             if (currItem.checked) {
//                 // Validate required field
//                 if (!currItem.checked_name) bool_ins_type_selected = false;

//                 // Default values
//                 const qr_checked = currItem.qr_checked ?? false;
//                 const qruniq_checked = currItem.qruniq_checked ?? false;
//                 const timer = currItem.timer ?? 10;

//                 // QR Barcode check validation
//                 if (currItem.qrbar_check && !currItem.qrbar_check_type) {
//                     qrbarcode_check = false;
//                     qrbarcode_comp = currItem.station_name;
//                 }

//                 const obj = {
//                     station_name: currItem.station_name,
//                     mac_addrs: currItem.mac_addrs,
//                     station_id: currItem._id,
//                     stn_ver: currItem.stn_ver,
//                     comp_name,
//                     comp_code,
//                     comp_id,
//                     comp_ver,
//                     profile_name,
//                     profile,
//                     profile_id,
//                     profile_ver,
//                     ng_allany,
//                     ng_opt,
//                     ok_allany,
//                     ok_opt,
//                     inspection_type: currItem.checked_name,
//                     qr_checking: qr_checked,
//                     qr_uniq_checking: qruniq_checked,
//                     timer,
//                     detect_selection: currItem.detect_selection,
//                     detection_type: currItem.detection_type,
//                     overAll_testing,
//                     region_selection,
//                     region_wise_testing,
//                     zoom_value: this.state.comp_info?.zoom_value,
//                 };

//                 if (currItem.detect_selection && currItem.detection_type == "Smart Object Locator") {
//                     obj.selected_regions = currItem.selected_regions || [];
//                 }

//                 if (currItem.qrbar_check) {
//                     obj.qrbar_check = true;
//                     obj.qrbar_check_type = currItem.qrbar_check_type;
//                 }

//                 send_data.push(obj);
//             }
//         });

//         console.log('Prepared send_data:', send_data);

//         // Handle form validation and send
//         if (send_data.length === 0) {
//             return Swal.fire({
//                 title: 'Station Selection Required.',
//                 icon: 'info',
//                 timer: 2000,
//                 showConfirmButton: false,
//             });
//         }

//         if (!bool_ins_type_selected) {
//             return this.setState({ man_auto: true });
//         }

//         if (!qrbarcode_check) {
//             return Swal.fire({
//                 title: `Barcode checking method required for "${qrbarcode_comp}"`,
//                 icon: 'warning',
//                 timer: 4000,
//                 showConfirmButton: false,
//             });
//         }

//         try {
//             urlSocket.post('/crud_comp_station_info',
//                 { comp_station_info: send_data, comp_id },
//                 { mode: 'no-cors' }
//             )
//                 .then((response) => {
//                     const data = response.data;
//                     this.setState({
//                         message: data === 'Success' ? data : 'Error',
//                         show_msg: true
//                     });
//                 })
//                 .catch((error) => {
//                     console.error("Submit error:", error);
//                 });
//         } catch (error) {
//             console.error("Unexpected error:", error);
//         }
//     };




//     backFunction = () => {
//         console.log('close');
//         this.props.history.push("/profileCreation");
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
//                             title="COMPONENT STATION LIST"
//                             isBackButtonEnable={true}
//                             gotoBack={this.backFunction}
//                         />
//                         <Container fluid>
//                             <Card>
//                                 <CardBody>
//                                     <Row className="d-flex flex-wrap justify-content-start justify-content-lg-between align-items-center gap-2 mb-2">
//                                         <Col xs="12" lg="auto" className="d-flex">
//                                             <CardTitle className="mb-0 me-3"><span className="me-2 font-size-12">Component Name:</span>{this.state.comp_name}, </CardTitle>
//                                             <CardTitle className="mb-0"><span className="me-2 font-size-12">Component Code:</span>{this.state.comp_code}</CardTitle>
//                                         </Col>
//                                     </Row>
//                                     <Row>
//                                         <StageStationInfoTable
//                                             station_data={this.state.station_list}
//                                             compinfo={this.state.comp_info}
//                                             selected_data={(data) => { this.submitForm(data) }}
//                                             rectangles={this.state.rectangles}
//                                         />
//                                     </Row>
//                                 </CardBody>
//                             </Card>
//                         </Container>
//                         <div>
//                             {
//                                 this.state.show_msg ?

//                                     <SweetAlert
//                                         // showCancel
//                                         title="Station Assigned Successfully"
//                                         cancelBtnBsStyle="success"
//                                         confirmBtnText="OK"
//                                         //cancelBtnText="No"
//                                         onConfirm={() => this.backFunction()}
//                                         // onCancel={() => this.setState({
//                                         //     show_msg: false
//                                         // })}
//                                         closeOnClickOutside={false}
//                                         style={{ zIndex: 997 }}
//                                         timeout={2000}
//                                     >
//                                         {/* <div style={{ fontSize: '22px' }}>
//                                                 Success
//                                             </div> */}
//                                     </SweetAlert> : null
//                             }
//                         </div>
//                         <div>
//                             {
//                                 this.state.man_auto ?
//                                     <SweetAlert
//                                         title="Choose manual or auto"
//                                         confirmBtnText="OK"
//                                         onConfirm={() => this.setState({ man_auto: false })}
//                                         // onCancel={() => this.setState({
//                                         //     show_msg: false
//                                         // })}
//                                         closeOnClickOutside={false}
//                                         style={{ zIndex: 998 }}
//                                     // timeout={2000}
//                                     >
//                                     </SweetAlert> : null
//                             }
//                         </div>
//                     </div>
//                 </React.Fragment>
//             );
//         }
//         else {
//             return null
//         }
//     }
// }
// StageStationData.propTypes = {
//     history: PropTypes.any.isRequired,
// };
// export default StageStationData;