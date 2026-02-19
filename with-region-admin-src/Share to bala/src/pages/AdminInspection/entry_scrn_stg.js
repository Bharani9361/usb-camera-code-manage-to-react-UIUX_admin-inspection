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
import Eventall_stg from './Eventall_stg';
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

    // Function: Error handler
    const error_handler = (error) => {
        sessionStorage.removeItem("authUser");
        history.push("/login");
    };

    // Function: fetch component info
    // const compInfo = async () => {
    //     try {
    //         const response = await urlSocket.post('/api/components/comp_status_info', { mode: 'no-cors' });
    //         const data = response.data;
    //         if (data.error === "Tenant not found") {
    //             error_handler(data);
    //         } else {
    //             console.log('samples_list', data);
    //             setSamplesList(data);
    //             setDataloaded(true);
    //         }
    //     } catch (error) {
    //         console.log("----", error);
    //     }
    // };

    // const compInfo = async (mode = 'inspection') => {
    //     try {
    //         // const response = await urlSocket.post('/api/components/comp_status_info_stg', {});
    //         const response = await urlSocket.post('/api/components/comp_status_info_stg', {}, {
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             }
    //         });
    //         const data = response.data;

    //         if (data.error === "Tenant not found") {
    //             error_handler(data);
    //         } else {
    //             console.log(`Component List (${mode})`, data);
    //             setSamplesList(data);
    //             setDataloaded(true);
    //         }
    //     } catch (error) {
    //         console.log("Error fetching components:", error);
    //     }
    // };

    console.log('Rendering EntryScrn component', samples_list);
    const compInfo = async () => {
        try {
            const response = await urlSocket.post('/api/components/comp_status_info_stg', {}, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = response.data;
            console.log('datainspection :>> ', data);

            if (data.error === "Tenant not found") {
                error_handler(data);
            } else {
                console.log('Component List with Stage Details', data);
                setSamplesList(data);
                setDataloaded(true);
            }
        } catch (error) {
            console.log("Error fetching components:", error);
        }
    };

    useEffect(() => {
        const stationInfo = JSON.parse(sessionStorage.getItem("stationInfo"));

        if (stationInfo) {
            setStationInfo(stationInfo);
            setStationName(stationInfo.station_name);
            console.log('stationInfo', stationInfo);


            compInfo(); // fetch only relevant components
        }
    }, []);

    // Navigation helpers
    const navigation = () => history.push("/station_list_stg");
    const backtoStation = () => history.push('/station_list_stg');

    // Function: assign components to station
    const componentAssign = async (send_data) => {
        try {
            const apiEndpoint = '/train_comp_station';


            console.log("Using API endpoint:", apiEndpoint);
            const response = await urlSocket.post(apiEndpoint, {
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
                        history.push("/station_list_stg");
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
    // const submitForm = (data) => {

    //     const { mac_addrs, status, stn_ver, _id: station_id } = station_info;
    //     console.log('station_info in submitForm', station_info);
    //     let bool_ins_type_selected = true;
    //     let profile_selection = true;
    //     let detect_select = true;
    //     let qrbarcode_check = true;
    //     let unselectedCompProf = null;
    //     let detectrequiredComp = null;
    //     let qrbarcode_comp = null;

    //     const send_data = [];

    //     data.forEach(currItem => {
    //         if (currItem.checked !== true) return;

    //         if (currItem.checked_name === undefined) bool_ins_type_selected = false;
    //         if (currItem.profile_name === undefined) { profile_selection = false; unselectedCompProf = currItem.comp_name; }
    //         if (currItem.detect_selection === undefined) { detect_select = false; detectrequiredComp = currItem.comp_name; }
    //         if (currItem.qrbar_check === true && currItem.qrbar_check_type == null) { qrbarcode_check = false; qrbarcode_comp = currItem.comp_name; }

    //         if (currItem.qr_checked === undefined) currItem.qr_checked = false;
    //         if (currItem.qruniq_checked === undefined) currItem.qruniq_checked = false;
    //         if (currItem.timer === undefined) currItem.timer = 10;

    //         send_data.push({
    //             comp_name: currItem.comp_name,
    //             comp_code: currItem.comp_code,
    //             comp_id: currItem._id,
    //             comp_ver: currItem.comp_ver,
    //             inspection_type: currItem.checked_name,
    //             station_name,
    //             stn_ver,
    //             mac_addrs,
    //             station_id,
    //             qr_checking: currItem.qr_checked,
    //             qr_uniq_checking: currItem.qruniq_checked,
    //             timer: currItem.timer,
    //             profile_name: currItem.profile_name,
    //             profile_id: currItem.profile_id,
    //             profile: currItem.profile,
    //             profile_ver: currItem.profile_ver,
    //             ok_allany: currItem.ok_allany,
    //             ok_opt: currItem.ok_opt,
    //             ng_allany: currItem.ng_allany,
    //             ng_opt: currItem.ng_opt,
    //             detect_selection: currItem.detect_selection,
    //             detection_type: currItem.detection_type,
    //             overAll_testing: currItem.overAll_testing,
    //             region_selection: currItem.region_selection,
    //             region_wise_testing: currItem.region_wise_testing,
    //             ...(currItem.qrbar_check === true && { qrbar_check: currItem.qrbar_check, qrbar_check_type: currItem.qrbar_check_type }),
    //             ...(currItem.detect_selection && currItem.detection_type === "Smart Object Locator" && { selected_regions: currItem.selected_regions || [] }),
    //             zoom_value: currItem.zoom_value,
    //         });
    //     });

    //     const showAlert = (title, icon = 'info', timer = 4000) => {
    //         Swal.fire({ title, icon, timer, showConfirmButton: false });
    //     };

    //     if (send_data.length === 0) {
    //         Swal.fire({
    //             title: 'No Components selected',
    //             icon: 'info',
    //             timer: 2000,
    //             confirmButtonText: 'OK',
    //         });

    //         Swal.fire({
    //             title: `No Components selected for this Station`,
    //             text: `Are you sure you want to clear the Components for this Station`,
    //             icon: 'warning',
    //             showCancelButton: true,
    //             cancelButtonText: 'No',
    //             cancelButtonColor: '#28a745',
    //             confirmButtonText: 'Yes',
    //             confirmButtonColor: '#007bff'
    //         }).then(result => {
    //             if (result.isConfirmed) {
    //                 componentAssign(send_data);
    //             }
    //         });
    //         return;
    //     }

    //     if (!profile_selection) {
    //         // Only show warning if the component mode is 'inspection'
    //         const comp = data.find(item => item.comp_name === unselectedCompProf);
    //         if (comp?.mode === 'inspection') {
    //             showAlert(`Profile selection required for "${unselectedCompProf}"`, 'warning');
    //             return;
    //         }
    //     }

    //     if (!bool_ins_type_selected) { showAlert('Choose Manual or Auto', 'info'); return; }
    //     if (!detect_select) { showAlert(`Object Detection method required for "${detectrequiredComp}"`, 'warning'); return; }
    //     if (!qrbarcode_check) { showAlert(`Barcode checking method required for "${qrbarcode_comp}"`, 'warning'); return; }

    //     componentAssign(send_data);
    // };

    const submitForm = (data) => {
        console.log('submitForm data', data);
        const { mac_addrs, status, stn_ver, _id: station_id } = station_info;
        console.log('station_info in submitForm', station_info);

        let profile_selection = true;
        let qrbarcode_check = true;
        let unselectedCompProf = null;
        let qrbarcode_comp = null;
        let mode_missing = false;
        let img_count_missing = false;
        let img_missing_comp = null;
        let mode_missing_comp = null;
        const send_data = [];

        data.forEach(currItem => {
            console.log('currItem', currItem);
            if (currItem.checked !== true) return;

            if (!currItem.capture_mode || currItem.capture_mode.trim() === "") {
                mode_missing = true;
                mode_missing_comp = currItem.comp_name;
                return; // Skip pushing this one
            }
            if (!currItem.capture_count || currItem.capture_count < 1) {
                img_count_missing = true;
                img_missing_comp = currItem.comp_name;
                return;
            }
            if (currItem.profile_name === undefined) {
                profile_selection = false;
                unselectedCompProf = currItem.comp_name;
            }

            if (currItem.qrbar_check === true && currItem.qrbar_check_type == null) {
                qrbarcode_check = false;
                qrbarcode_comp = currItem.comp_name;
            }

            // Set defaults for missing fields
            if (currItem.qr_checked === undefined) currItem.qr_checked = false;
            if (currItem.qruniq_checked === undefined) currItem.qruniq_checked = false;
            if (currItem.timer === undefined) currItem.timer = 10;

            // Build the data structure to send
            send_data.push({
                comp_name: currItem.comp_name,
                comp_code: currItem.comp_code,
                comp_id: currItem.comp_id || currItem._id,  // Use comp_id or _id
                comp_ver: currItem.comp_ver,
                comp_status: currItem.comp_status, // Default to 'Active' if missing
                station_name,
                stn_ver,
                mac_addrs,
                station_id,
                qr_checking: currItem.qr_checked,
                qr_uniq_checking: currItem.qruniq_checked,
                timer: currItem.timer,
                capture_mode: currItem.capture_mode,
                sub_mode:
                    currItem.capture_mode === "Non-Sequential"
                        ? currItem.sub_mode || "Single"
                        : null,
                capture_count: currItem.capture_count,


                region_selection: currItem.region_selection,

                zoom_value: currItem.zoom_value,
                allow_user: currItem.allow_user
                // Include stages data for training
            });
            console.log('send_data', send_data);
        });

        const showAlert = (title, icon = 'info', timer = 4000) => {
            Swal.fire({ title, icon, timer, showConfirmButton: false });
        };
        console.log('mode_missing', mode_missing);

        if (mode_missing) {
            Swal.fire({
                title: `Please select a Capture Mode for "${mode_missing_comp}"`,
                icon: 'warning',
                timer: 3000,
                showConfirmButton: true,
            });
            return;
        }

        if (img_count_missing) {
            Swal.fire({
                title: `Please set a valid Image Count for "${img_missing_comp}"`,
                icon: 'warning',
                timer: 3000,
                showConfirmButton: true,
            });
            return;
        }
        if (send_data.length === 0) {
            Swal.fire({
                title: 'No Components selected',
                icon: 'info',
                timer: 2000,
                showConfirmButton: false,
            });

            Swal.fire({
                title: "No Components selected for this Station",
                text: "Are you sure you want to clear the Components for this Station?",
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

        // Validate profile selection (only for inspection mode)
        // if (!profile_selection) {
        //     const comp = data.find(item => item.comp_name === unselectedCompProf);

        //         showAlert(Profile selection required for "${unselectedCompProf}", 'warning');
        //         return;

        // }

        // Validate barcode checking
        if (!qrbarcode_check) {
            showAlert(`Barcode checking method required for "${qrbarcode_comp}"`, 'warning');
            return;
        }

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
                                    <Eventall_stg
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

