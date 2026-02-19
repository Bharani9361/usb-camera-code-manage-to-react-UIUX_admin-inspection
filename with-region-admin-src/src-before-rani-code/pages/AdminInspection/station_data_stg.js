import React, { useState, useEffect } from "react";
import MetaTags from 'react-meta-tags';
import PropTypes from "prop-types";
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
import StationInfoTable_stg from './StationInfoTable_stg';
import SweetAlert from 'react-bootstrap-sweetalert';
import urlSocket from "./urlSocket";
import Swal from 'sweetalert2';
import Breadcrumbs from "components/Common/Breadcrumb";

const StationData = ({ history }) => {
    const [dataloaded, setDataloaded] = useState(false);
    const [tbIndex, setTbIndex] = useState(0);
    const [stationList, setStationList] = useState([]);
    const [message, setMessage] = useState('');
    const [manAuto, setManAuto] = useState(false);
    const [showMsg, setShowMsg] = useState(false);
    const [activeInactive] = useState(['Active', 'Inactive']);
    const [selectMA, setSelectMA] = useState('Active');
    const [compInfo, setCompInfo] = useState([]);
    const [stationCompInfo, setStationCompInfo] = useState([]);
    const [compName, setCompName] = useState('');
    const [compCode, setCompCode] = useState('');
    const [stationCompName, setStationCompName] = useState('');
    const [macAddress, setMacAddress] = useState('');
    const [obj, setObj] = useState({});
    const [profileName, setProfileName] = useState('');
    const [profile, setProfile] = useState({});
    const [profileId, setProfileId] = useState('');
    const [rectangles, setRectangles] = useState([]);
    const [stages, setStages] = useState([]);
    const [compid, setCompid] = useState('');

    // useEffect(() => {
    //     const compInfo = JSON.parse(sessionStorage.getItem("selected_profile"));
    //     console.log('first57 ', compInfo);

    //     const comp_name = compInfo.comp_name;
    //     const pro_name = compInfo.profile_name;
    //     const profile = compInfo.profile_data;
    //     const profile_id = compInfo._id;
    //     const rectangles = compInfo?.profile_data?.ng_model_data?.[0].rectangles || [];

    //     console.log('profileDetails', pro_name, profile);

    //     setCompInfo(compInfo);
    //     setCompName(comp_name);
    //     setCompCode(compInfo.comp_code);
    //     setProfileName(pro_name);
    //     setProfile(profile);
    //     setProfileId(profile_id);
    //     setRectangles(rectangles);

    //     stationInfo();
    // }, []);

    useEffect(() => {
        const storedData = sessionStorage.getItem('selectedStages');

        const selectedStages = JSON.parse(storedData);
        console.log('Loaded selected stages from session:', selectedStages);
        // You can now use selectedStages for your logic

        try {
            // Parse the stored profile
            const parsedProfile = selectedStages;
            console.log('parsedProfile :>> ', parsedProfile);

            // Ensure it's an array (multiple stages)
            const profilesArray = Array.isArray(parsedProfile) ? parsedProfile : [parsedProfile];
            console.log('profilesArray :>> ', profilesArray);

            // Extract comp info from the first stage (assuming same comp info across stages)
            const comp_name = profilesArray[0]?.comp_name || "";
            const comp_code = profilesArray[0]?.comp_code || "";
            const profile_id = profilesArray[0]?._id || "";
            const profile = profilesArray[0]?.profile_data || {};
            const pro_name = profilesArray[0]?.profile_name || "";
            const comp_id = profilesArray[0]?.comp_id || "";

            // Extract all stages as array of objects
            setCompInfo(parsedProfile);
            setStages(parsedProfile.map(p => ({
                stage_name: p.stage_name,
                stage_code: p.stage_code,
                camera_selection: p.camera_selection?.cameras || [],
            })));
            setCompName(comp_name);
            setCompCode(comp_code);
            setProfileName(pro_name);
            setProfile(profile);
            setProfileId(profile_id);
            // setStages(stages); // array of stage objects
            setCompid(comp_id);


            stationInfo();

        } catch (err) {
            console.error("Error parsing selected_profile:", err);
        }
    }, []);

    const stationInfo = () => {
        try {
            urlSocket.post('/station_status_info', { mode: 'no-cors' })
                .then((response) => {
                    const data = response.data;
                    if (data.error === "Tenant not found") {
                        console.log("data error", data.error);
                        errorHandler(data.error);
                    } else {
                        console.log('station_list', data);
                        setStationList(data);
                        setDataloaded(true);
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        } catch (error) {
            console.log("----", error);
        }
    };

    // const submitForm = (data) => {
    //     console.log('Submitted data:', data);   
    //     const {
    //         ng_allany, ng_opt, ok_allany, ok_opt, profile_ver,
    //         overAll_testing, region_selection, region_wise_testing,
    //         comp_id, comp_ver
    //     } = compInfo;

    //     let send_data = [];
    //     let bool_ins_type_selected = true;
    //     let qrbarcode_check = true;
    //     let qrbarcode_comp = "";

    //     data.forEach((currItem) => {
    //         if (currItem.checked) {
    //             // Validate required field
    //             if (!currItem.checked_name) bool_ins_type_selected = false;

    //             // Default values
    //             const qr_checked = currItem.qr_checked ?? false;
    //             const qruniq_checked = currItem.qruniq_checked ?? false;
    //             const timer = currItem.timer ?? 10;

    //             // QR Barcode check validation
    //             if (currItem.qrbar_check && !currItem.qrbar_check_type) {
    //                 qrbarcode_check = false;
    //                 qrbarcode_comp = currItem.station_name;
    //             }

    //             // const obj = {
    //             //     station_name: currItem.station_name,
    //             //     mac_addrs: currItem.mac_addrs,
    //             //     station_id: currItem._id,
    //             //     stn_ver: currItem.stn_ver,
    //             //     comp_name: compName,
    //             //     comp_code: compCode,
    //             //     comp_id,
    //             //     comp_ver,
    //             //     profile_name: profileName,
    //             //     profile,
    //             //     profile_id: profileId,
    //             //     profile_ver,
    //             //     ng_allany,
    //             //     ng_opt,
    //             //     ok_allany,
    //             //     ok_opt,
    //             //     inspection_type: currItem.checked_name,
    //             //     qr_checking: qr_checked,
    //             //     qr_uniq_checking: qruniq_checked,
    //             //     timer,
    //             //     detect_selection: currItem.detect_selection,
    //             //     detection_type: currItem.detection_type,
    //             //     overAll_testing,
    //             //     region_selection,
    //             //     region_wise_testing,
    //             //     zoom_value: compInfo?.zoom_value,
    //             // };

    //                const obj = {
    //                 station_name: currItem.station_name,
    //                 mac_addrs: currItem.mac_addrs,
    //                 station_id: currItem._id,
    //                 stn_ver: currItem.stn_ver,
    //                 comp_name: compName,
    //                 comp_code: compCode,
    //                 comp_id,
    //                 comp_ver,
    //                 profile_name: profileName,
    //                 profile,
    //                 profile_id: profileId,
    //                 profile_ver,
    //                 ng_allany,
    //                 ng_opt,
    //                 ok_allany,
    //                 ok_opt,
    //                 inspection_type: currItem.checked_name,
    //                 qr_checking: qr_checked,
    //                 qr_uniq_checking: qruniq_checked,
    //                 timer,
    //                 detect_selection: currItem.detect_selection,
    //                 detection_type: currItem.detection_type,
    //                 overAll_testing,
    //                 region_selection,
    //                 region_wise_testing,
    //                 zoom_value: compInfo?.zoom_value,
    //             };

    //             if (currItem.detect_selection && currItem.detection_type === "Smart Object Locator") {
    //                 obj.selected_regions = currItem.selected_regions || [];
    //             }

    //             if (currItem.qrbar_check) {
    //                 obj.qrbar_check = true;
    //                 obj.qrbar_check_type = currItem.qrbar_check_type;
    //             }

    //             send_data.push(obj);
    //         }
    //     });

    //     console.log('Prepared send_data:', send_data);

    //     // Handle form validation and send
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

    //     try {
    //         urlSocket.post('/crud_comp_station_info',
    //             { comp_station_info: send_data, comp_id },
    //             { mode: 'no-cors' }
    //         )
    //             .then((response) => {
    //                 const data = response.data;
    //                 setMessage(data === 'Success' ? data : 'Error');
    //                 setShowMsg(true);
    //             })
    //             .catch((error) => {
    //                 console.error("Submit error:", error);
    //             });
    //     } catch (error) {
    //         console.error("Unexpected error:", error);
    //     }
    // };
    const submitForm = (data) => {
        console.log('Submitted data:', data, compInfo);
        const {

            comp_id, comp_ver
        } = compInfo;

        let send_data = [];
        let bool_ins_type_selected = true;
        let qrbarcode_check = true;
        let qrbarcode_comp = "";
        let mode_missing = false;
        let mode_missing_comp = null;
        let img_count_missing = false;
        let img_missing_comp = null;

        data.forEach((currItem) => {
            console.log('data :>> ', data);
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

                if (!currItem.capture_mode || currItem.capture_mode.trim() === "") {
                    mode_missing = true;
                    mode_missing_comp = compName;
                    return;
                }

                if (!currItem.capture_count || currItem.capture_count < 1) {
                    img_count_missing = true;
                    img_missing_comp = compName;
                    return;
                }

                // const obj = {
                //     station_name: currItem.station_name,
                //     mac_addrs: currItem.mac_addrs,
                //     station_id: currItem._id,
                //     stn_ver: currItem.stn_ver,
                //     comp_name: compName,
                //     comp_code: compCode,
                //     stage_name: stages.stage_name,
                //     stage_code: stages.stage_code,
                //     cameras: cameras,
                //     comp_id,
                //     comp_ver,
                //     profile_name: profileName,
                //     profile,
                //     profile_id: profileId,
                //     profile_ver,
                //     ng_allany,
                //     ng_opt,
                //     ok_allany,
                //     ok_opt,
                //     inspection_type: currItem.checked_name,
                //     qr_checking: qr_checked,
                //     qr_uniq_checking: qruniq_checked,
                //     timer,
                //     detect_selection: currItem.detect_selection,
                //     detection_type: currItem.detection_type,
                //     overAll_testing,
                //     region_selection,
                //     region_wise_testing,
                //     zoom_value: compInfo?.zoom_value,
                // };

                stages.forEach(stage => {
                    console.log('stage in submitForm :>> ', stage);
                    const obj = {
                        station_name: currItem.station_name,
                        mac_addrs: currItem.mac_addrs,
                        station_id: currItem._id,
                        stn_ver: currItem.stn_ver,
                        comp_name: compName,
                        comp_code: compCode,
                        stage_name: stage.stage_name, // from stages array
                        stage_code: stage.stage_code,
                        cameras: stage.camera_selection, // cameras for this stage
                        comp_id: compid,

                        qr_checking: qr_checked,
                        qr_uniq_checking: qruniq_checked,

                        region_selection: stage.region_selection || '',
                        zoom_value: compInfo?.zoom_value || '',
                        capture_mode: currItem.capture_mode,
                        sub_mode:
                            currItem.capture_mode === "Non-Sequential"
                                ? currItem.sub_mode || "Single"
                                : null,
                        capture_count: currItem.capture_count,
                        allow_user: currItem.allow_user || false,
                    };

                    if (currItem.detect_selection && currItem.detection_type === "Smart Object Locator") {
                        obj.selected_regions = currItem.selected_regions || [];
                    }

                    if (currItem.qrbar_check) {
                        obj.qrbar_check = true;
                        obj.qrbar_check_type = currItem.qrbar_check_type;
                    }

                    send_data.push(obj);
                });
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



        if (!qrbarcode_check) {
            return Swal.fire({
                title: `Barcode checking method required for "${qrbarcode_comp}"`,
                icon: 'warning',
                timer: 4000,
                showConfirmButton: false,
            });
        }

        try {
            urlSocket.post('/train_comp_station_data', { comp_station_info: send_data, comp_id }, { mode: 'no-cors' })
                .then(response => {
                    const data = response.data;
                    console.log('Response from API:', data);
                    setMessage(data.success ? 'Success' : 'Error');
                    setShowMsg(true);
                })
                .catch(error => {
                    console.error("Submit error:", error);
                });
        } catch (error) {
            console.error("Unexpected error:", error);
        }
    };


    const backFunction = () => {
        console.log('close');
        history.push("/comp_info");
    };

    const errorHandler = (error) => {
        sessionStorage.removeItem("authUser");
        history.push("/login");
    };

    if (dataloaded) {
        return (
            <React.Fragment>
                <div className="page-content">
                    <MetaTags />
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
                                            <span className="me-2 font-size-12">Component Name:</span>
                                            {compName},{" "}
                                        </CardTitle>
                                        <CardTitle className="mb-0">
                                            <span className="me-2 font-size-12">Component Code:</span>
                                            {compCode}
                                        </CardTitle>
                                    </Col>
                                </Row>
                                <Row>
                                    <StationInfoTable_stg
                                        station_data={stationList}
                                        compinfo={compInfo}
                                        selected_data={(data) => submitForm(data)}
                                        rectangles={rectangles}
                                    />
                                </Row>
                            </CardBody>
                        </Card>
                    </Container>
                    <div>
                        {showMsg && (
                            <SweetAlert
                                title="Station Assigned Successfully"
                                cancelBtnBsStyle="success"
                                confirmBtnText="OK"
                                onConfirm={() => backFunction()}
                                closeOnClickOutside={false}
                                style={{ zIndex: 997 }}
                                timeout={2000}
                            />
                        )}
                    </div>
                </div>
            </React.Fragment>
        );
    } else {
        return null;
    }
};

StationData.propTypes = {
    history: PropTypes.any.isRequired,
};

export default StationData;