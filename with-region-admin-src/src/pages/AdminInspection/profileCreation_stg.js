import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import {
    Container, CardTitle, Button, Col, Row, Modal,
    Form, Label, Input, Table, ModalBody, CardBody, Card,
    Spinner, CardText, ButtonGroup, UncontrolledTooltip,
    ModalHeader, FormGroup, ModalFooter
} from 'reactstrap';
import urlSocket from "./urlSocket";
import PropTypes from "prop-types";
import { Link, useHistory } from 'react-router-dom';
import { Switch, Radio, Checkbox, Spin } from 'antd';
import {
    ArrowUpOutlined,
    LoadingOutlined
} from '@ant-design/icons';
import Swal from 'sweetalert2';

const CompInfo = () => {
    const history = useHistory();

    // State declarations
    const [addCompModal, setAddCompModal] = useState(false);
    const [compName, setCompName] = useState("");
    const [compCode, setCompCode] = useState("");
    const [profileName, setProfileName] = useState("");
    const [profileNameError, setProfileNameError] = useState("");
    const [componentList, setComponentList] = useState([]);
    const [modelInfo, setModelInfo] = useState([]);
    const [originalData, setOriginalData] = useState([]);
    const [searchComponentList, setSearchComponentList] = useState([]);
    const [sorting, setSorting] = useState({ field: "", order: "" });
    const [itemsPerPageStock, setItemsPerPageStock] = useState(100);
    const [currentPageStock, setCurrentPageStock] = useState(1);
    const [config, setConfig] = useState([]);
    const [compInfo, setCompInfo] = useState([]);
    const [showStationInfo, setShowStationInfo] = useState(true);
    const [selectedRow, setSelectedRow] = useState(null);
    const [selectedProfile, setSelectedProfile] = useState({});
    const [barcodeCheckType] = useState({
        0: 'only With Correct Barcode',
        1: 'with Both Correct & Incorrect'
    });
    const [detectionType] = useState(['ML', 'DL']);
    const [tabs, setTabs] = useState(false);
    const [selectFilter, setSelectFilter] = useState('');
    const [position, setPosition] = useState('');
    const [profileData, setProfileData] = useState([]);
    const [togglingProfileStatus, setTogglingProfileStatus] = useState({});
    const [isProfileStatusModalOpen, setIsProfileStatusModalOpen] = useState(false);
    const [profileAssignedStations, setProfileAssignedStations] = useState([]);
    const [profileStatusDataTemp, setProfileStatusDataTemp] = useState({});
    const [profileLoading, setProfileLoading] = useState(true);
    const [zoomValue, setZoomValue] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [loadingButtonIndex, setLoadingButtonIndex] = useState(null);
    const [regionList] = useState(['Region 1', 'Region 2', 'Region 3', 'Region 4']);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentDataIndex, setCurrentDataIndex] = useState(null);
    const [modalDetectionType, setModalDetectionType] = useState(null);
    const [modalSelectedRegions, setModalSelectedRegions] = useState([]);
    const [showValidationMsg, setShowValidationMsg] = useState(false);
    const [pageInfo, setPageInfo] = useState('');
    const [qrbarValue, setQrbarValue] = useState(null);
    const [positive, setPositive] = useState(null);
    const [negative, setNegative] = useState(null);
    const [mode, setMode] = useState('training');


    // Component mount effect
    useEffect(() => {
        const initializeComponent = async () => {
            try {
                let data = JSON.parse(sessionStorage.getItem('InfoComp'));
                console.log('data48 ', data);

                const zoom_values = data?.component_info?.zoom_value;
                if (zoom_values) {
                    sessionStorage.setItem('zoom_values', JSON.stringify(zoom_values));
                    setZoomValue(zoom_values);
                    console.log('value applied to state');
                }

                let profile_data = data.component_info;
                setProfileData(profile_data);
                let page_info = data.page_info;

                let initialData = {
                    compName: profile_data.comp_name,
                    compCode: profile_data.comp_code,
                    compInfo: profile_data,
                    pageInfo: page_info,
                };

                if ('qrOrBar_code' in profile_data) {
                    setQrbarValue(profile_data.qrOrBar_code);
                }

                if (page_info === '/entry_scrn') {
                    setShowStationInfo(false);
                }

                if (data.createProf && data.createProf === true) {
                    setAddCompModal(true);
                }

                setCompName(initialData.compName);
                setCompCode(initialData.compCode);
                setCompInfo(initialData.compInfo);
                setPageInfo(initialData.pageInfo);

                await getConfigInfo();
                await gettingBack();
            } catch (error) {
                console.error('/didmount ', error);
            } finally {
                setProfileLoading(false);
            }
        };

        initializeComponent();
    }, []);

    const gettingBack = async () => {
        try {
            let type = JSON.parse(sessionStorage.getItem('profiletype'));
            console.log('type92', type.string, type.value, type.compInfo);
            setProfileData(type.compInfo);
            await fixedOrany(type.string, type.value);
        } catch {
            console.log('this error block running');
            setSelectFilter('');
            setTabs(false);
        }
    };

    const submitForm = async () => {
        setProfileNameError('');
        const trimmedProfileName = profileName.trim().toUpperCase();
        console.log('first26', profileName, trimmedProfileName);

        if (!trimmedProfileName) {
            setProfileNameError('The profile name is required');
            return;
        }

        try {
            const response = await urlSocket.post('/add_profile', {
                profile_name: trimmedProfileName,
                comp_info: compInfo,
                position: position
            }, { mode: 'no-cors' });

            const data = response.data;
            if (data.error === "Tenant not found") {
                console.log("data error", data.error);
                errorHandler(data.error);
            } else {
                console.log('data4784', data);

                if (data === 'Profile name is already created') {
                    setProfileNameError('The profile name is already created');
                } else {
                    setAddCompModal(false);
                    setComponentList(data);
                    setOriginalData(data);
                    setSearchComponentList(data);
                    setProfileName('');
                    setProfileNameError('');
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getProfileInfo = async (comp_info, string) => {
        console.log('comp_info154', comp_info, config, string);
        try {
            const response = await urlSocket.post('/api/stage/get_Profile_info_stg',
                {
                    "comp_info": comp_info,
                    'position': string,
                },
                { mode: 'no-cors' }
            );

            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                errorHandler(response.data.error);
            } else {
                const data = response.data;
                let data1 = data.map(item => ({
                    ...item,
                    detect_selection: item?.detect_selection !== undefined ? item?.detect_selection : false,
                    detection_type: item?.detection_type !== undefined && item?.detection_type !== null
                        ? item?.detection_type
                        : 'ML'
                }));
                console.log('data185', data1);
                setComponentList(data1);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getConfigInfo = async () => {
        try {
            const response = await urlSocket.post('/config', { mode: 'no-cors' });
            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                errorHandler(response.data.error);
            } else {
                const config = response.data;
                console.log('first39', config);
                setConfig(config);
                setPositive(config[0].positive);
                setNegative(config[0].negative);
            }
        } catch (error) {
            console.log('error', error);
        }
    };

    const checkIsAssignedToStations = async (data, checked) => {
        try {
            const response = await urlSocket.post(
                '/profile_assigned_stations',
                { '_id': data._id },
                { mode: 'no-cors' }
            );

            console.log('/profile_assigned_stations ', response.data);
            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                errorHandler(response.data.error);
            } else {
                return response.data.station_list;
            }
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    const changeProfileStatus = async () => {
        setIsProfileStatusModalOpen(false);
        console.log('/profileStatusDataTemp ', profileStatusDataTemp);
        const { data, checked } = profileStatusDataTemp;
        let profile_id = data._id;
        let profile_name = data.profile_name;
        let comp_id = data.comp_id;
        console.log('169 data : ', data, checked);

        try {
            const response = await urlSocket.post('/profile_status_upd',
                {
                    '_id': profile_id,
                    'profile_name': profile_name,
                    'profile_active': checked,
                    'comp_id': comp_id
                },
                { mode: 'no-cors' }
            );

            const responseData = response.data;
            if (responseData.error === "Tenant not found") {
                console.log("data error", responseData.error);
                errorHandler(responseData.error);
            } else {
                console.log('data298', responseData);
                console.log(' componentList', componentList);

                const newProfile = responseData.filter(profile => profile.position === position);
                const profileinfo = newProfile.map((prof, index) => {
                    if (prof._id === componentList[index]._id && prof.profile_active === true) {
                        prof.detect_selection = componentList[index].detect_selection;
                        prof.detection_type = componentList[index].detection_type;
                    } else {
                        prof.detect_selection = false;
                        prof.detection_type = null;
                    }
                    return prof;
                });

                setComponentList(profileinfo);
                setOriginalData(profileinfo);
                setSearchComponentList(profileinfo);
            }
        } catch (error) {
            console.log('error', error);
        } finally {
            setTogglingProfileStatus(prev => ({
                ...prev,
                [data._id]: false
            }));
            setProfileStatusDataTemp({});
        }
    };

    const toggleProfileStatusModal = async () => {
        const { data } = profileStatusDataTemp;
        setIsProfileStatusModalOpen(false);
        setTogglingProfileStatus(prev => ({
            ...prev,
            [data._id]: false
        }));
    };

    const onChange = async (checked, data) => {
        setTogglingProfileStatus(prev => ({
            ...prev,
            [data._id]: true
        }));
        setProfileStatusDataTemp({ data, checked });

        try {
            const station_list = await checkIsAssignedToStations(data, checked);
            const isAssignedToStations = station_list.length > 0;

            if (!isAssignedToStations) {
                await changeProfileStatus();
            } else {
                setProfileAssignedStations(station_list);
                setIsProfileStatusModalOpen(true);
            }
        } catch (error) {
            console.error("Error toggling profile status: ", error);
            setTogglingProfileStatus(prev => ({
                ...prev,
                [data._id]: false
            }));
            setProfileStatusDataTemp({});
        }
    };

    const logComp = (data) => {
        console.log('first', data);
        if (data.datasets === undefined) {
            data.datasets = [];
        }
        let { comp_name, comp_code, _id } = data;

        let datas = {
            component_name: comp_name,
            component_code: comp_code,
            datasets: data.datasets,
            status: data.status,
            positive: data.positive,
            negative: data.negative,
            posble_match: data.posble_match,
            _id,
            config_data: config,
        };
        console.log('datasss', datas);
        sessionStorage.removeItem("compData");
        sessionStorage.setItem("compData", JSON.stringify(datas));

        history.push('/comp_log');
    };

    const manageStation = (data) => {
        console.log('data808', data);

        if (data.acceptance_ratio) {
            data.qrbar_value = qrbarValue ? qrbarValue : undefined;
            data.comp_ver = compInfo.comp_ver;
            data.zoom_value = compInfo?.zoom_value;
            sessionStorage.removeItem("selected_profile");
            sessionStorage.setItem("selected_profile", JSON.stringify(data));

            history.push('/station_data');
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Calculate Acceptance Ratio, before Assigning it to the Station',
                confirmButtonText: 'OK',
            });
        }
    };

    const handleModalClosed = () => {
        console.log("Modal closed. Perform any cleanup or additional actions here.@@@");
        setAddCompModal(false);
        setProfileName('');
        setProfileNameError('');
    };

    const profileInfo = (data) => {
        console.log('data95', data);
        data.page_info = '/profileCreation';
        sessionStorage.removeItem("profile_Info");
        sessionStorage.setItem("profile_Info", JSON.stringify(data));

        history.push('/profileCrud');
    };

    const handleRowSelect = (rowId, data) => {
        console.log('264 data : ', data);
        setSelectedRow(rowId);
        setSelectedProfile(data);
    };

    const back = () => {
        console.log('back is working');
        history.push(pageInfo);
        sessionStorage.removeItem('profiletype');
    };

    const computeProfileRatio = async (prof_data) => {
        console.log('data349 ', prof_data, prof_data.qrbar_check, prof_data.qrbar_check_type);

        if (prof_data.profile_data) {
            if (prof_data.qrbar_check === true &&
                (prof_data.qrbar_check_type === undefined || prof_data.qrbar_check_type === null)) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Barcode Checking Type Required',
                    confirmButtonText: 'OK',
                });
            } else {
                try {
                    const response = await urlSocket.post('/createProfileBatch',
                        {
                            'comp_name': prof_data.comp_name,
                            'comp_code': prof_data.comp_code,
                            'comp_id': prof_data.comp_id,
                            'prof_data': prof_data
                        },
                        { mode: 'no-cors' }
                    );

                    if (response.data.error === "Tenant not found") {
                        console.log("data error", response.data.error);
                        errorHandler(response.data.error);
                    } else {
                        console.log('305response : ', response);
                        prof_data.batch_id = response.data;
                        prof_data.page_info = '/profileCreation';
                    }
                } catch (error) {
                    console.log('error', error);
                }

                if ('qrbar_check' in prof_data) {
                    prof_data.qrbar_value = qrbarValue;
                }

                console.log('data349 prof_data: ', prof_data);

                const data = {
                    current_profile: prof_data,
                    current_comp_info: profileData,
                };

                sessionStorage.removeItem("computeProfData");
                sessionStorage.setItem("computeProfData", JSON.stringify(data));

                history.push('/profile-ratio-handler');
            }
        } else {
            Swal.fire({
                icon: 'info',
                title: 'Add OK and NG models to this profile to continue...',
                confirmButtonText: 'OK',
            });
        }
    };

    const objDetectCheck = (e, data, idx, str) => {
        let compList = [...componentList];
        if (str === '1') {
            compList[idx].detect_selection = e.target.checked;
            if (e.target.checked === false) {
                compList[idx].detection_type = '';
            } else {
                compList[idx].detection_type = config[0].detection_type;
            }
            setComponentList(compList);
            setSearchComponentList(compList);
        }
    };

    const handleObjDetect = (e, data, index) => {
        const selectedOption = e.target.value;
        console.log('data803 ', e, data, index);

        let compList = [...componentList];
        compList[index].detection_type = e.target.value;
        setComponentList(compList);
    };

    const handleObjectDetectionToggle = async (e, rowData, index) => {
        const isChecked = e.target.checked;
        const updated = [...componentList];
        updated[index].detect_selection = isChecked;

        if (!isChecked) {
            updated[index].detection_type = null;
            updated[index].selected_regions = [];
        }

        setComponentList(updated);

        if (isChecked) {
            setModalVisible(true);
            setCurrentDataIndex(index);
            setModalDetectionType(updated[index].detection_type || 'ML');
            setModalSelectedRegions(updated[index].selected_regions || (profileData?.rectangles?.map(region => region.name) || []));
            setShowValidationMsg(false);
        } else {
            updated[index].detection_type = null;
            updated[index].selected_regions = [];
        }

        try {
            await urlSocket.post('/update_detection_status', {
                profile_id: updated[index]._id,
                detect_selection: isChecked,
                detection_type: updated[index].detection_type,
                selected_regions: updated[index].selected_regions
            });
        } catch (error) {
            console.error("Failed to update detection status:", error);
        }

        setComponentList(updated);
        setModalSelectedRegions([]);
    };

    const openDetectionModal = (rowData, index) => {
        setModalVisible(true);
        setCurrentDataIndex(index);
        setModalDetectionType(rowData.detection_type || 'ML');
        setModalSelectedRegions(rowData.selected_regions || profileData?.rectangles?.map(region => region.name) || []);
        setShowValidationMsg(false);
    };

    const handleModalConfirm = async () => {
        if (modalDetectionType === 'Smart Object Locator' && modalSelectedRegions.length === 0) {
            setShowValidationMsg(true);
            return;
        }

        const updated = [...componentList];
        updated[currentDataIndex].detection_type = modalDetectionType;
        updated[currentDataIndex].selected_regions =
            modalDetectionType === 'Smart Object Locator' ? modalSelectedRegions : [];

        try {
            await urlSocket.post('/update_detection_status', {
                profile_id: updated[currentDataIndex]._id,
                detect_selection: true,
                detection_type: updated[currentDataIndex].detection_type,
                selected_regions: updated[currentDataIndex].selected_regions,
            });
            setModalDetectionType(updated[currentDataIndex].detection_type);
            console.log('detection_type: updated[currentDataIndex].detection_type,', updated[currentDataIndex].detection_type);
        } catch (err) {
            console.log("Failed to update detection settings", err);
        }

        setComponentList(updated);
        setModalVisible(false);
        setCurrentDataIndex(null);
        setModalDetectionType(null);
        setModalSelectedRegions([]);
        setShowValidationMsg(false);
    };

    const qrbarCheck = (e, data, idx, str) => {
        console.log('data379 ', e, data, idx, str, componentList);
        let compList = [...componentList];
        console.log('compList : ', compList, typeof compList, Object.keys(componentList).length);
        if (str === '1') {
            compList[idx].qrbar_check = e.target.checked;
            setComponentList(compList);
            setSearchComponentList(compList);
        }
    };

    const handleQRBarcodeCheckType = (e, data, index) => {
        const selectedOption = e.target.value;
        console.log('data803 ', e, data, index);

        let compList = [...componentList];
        compList[index].qrbar_check_type = parseInt(e.target.value);
        setComponentList(compList);
    };

    const fixedOrany = async (string, value) => {
        setIsLoading(true);
        setLoadingButtonIndex(value);

        await getProfileInfo(profileData, string);
        let dataToStore = {
            string: string,
            value: value,
            compInfo: profileData,
        };
        console.log("dataToStore", dataToStore);
        sessionStorage.setItem('profiletype', JSON.stringify(dataToStore));
        setSelectFilter(value);
        setTabs(true);
        setPosition(string);
        setLoadingButtonIndex(null);
        setIsLoading(false);
    };

    const errorHandler = (error) => {
        sessionStorage.removeItem("authUser");
        history.push("/login");
    };

    return (
        <>
            <div className='page-content'>
                <Row className="mb-3">
                    <Col xs={9}>
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="mb-0 mt-2 m-2 font-size-14 fw-bold">PROFILE CREATION</div>
                        </div>
                    </Col>
                    <Col xs={3} className='d-flex align-items-center justify-content-end'>
                        <button className='btn btn-outline-primary btn-sm me-2' color="primary" onClick={back}>
                            Back <i className="mdi mdi-arrow-left"></i>
                        </button>
                    </Col>
                </Row>
                <Container fluid={true}>
                    <Card>
                        <CardBody>
                            {profileLoading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                                    <Spinner color="primary" />
                                    <h5 className="mt-4">
                                        <strong>Loading Profiles...</strong>
                                    </h5>
                                </div>
                            ) : (
                                <>
                                    <Row className="d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-2 mb-2">
                                        <Col xs="12" lg="auto" className="text-left">
                                            <div className="d-flex flex-column">
                                                <div className="d-flex align-items-center mb-1">
                                                    <CardTitle className="mb-0 me-3">
                                                        <span className="me-2 font-size-12">Component Name :</span>
                                                        <strong>{compName}</strong>
                                                    </CardTitle>

                                                    <CardText className="mb-0">
                                                        <span className="me-2 font-size-12">Component Code :</span>
                                                        <strong>{compCode}</strong>
                                                    </CardText>
                                                </div>

                                                <div className='d-flex flex-column align-items-start'>
                                                  

                                                    <div>
                                                        <ButtonGroup>
                                                            <Button
                                                                className='btn btn-sm'
                                                                color="primary"
                                                                outline={selectFilter !== 0}
                                                                onClick={() => fixedOrany('Fixed', 0)}
                                                                disabled={isLoading}
                                                            >
                                                                {isLoading && loadingButtonIndex === 0 ? (
                                                                    <>
                                                                        <Spinner size="sm" className="me-2" />
                                                                        Loading...
                                                                    </>
                                                                ) : (
                                                                    'Fixed position'
                                                                )}
                                                            </Button>
                                                            <Button
                                                                className='btn btn-sm'
                                                                color="primary"
                                                                outline={selectFilter !== 1}
                                                                onClick={() => fixedOrany('any', 1)}
                                                                disabled={isLoading}
                                                            >
                                                                {isLoading && loadingButtonIndex === 1 ? (
                                                                    <>
                                                                        <Spinner size="sm" className="me-2" />
                                                                        Loading...
                                                                    </>
                                                                ) : (
                                                                    'Any position'
                                                                )}
                                                            </Button>
                                                        </ButtonGroup>
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                        {tabs && (
                                            <Col xs="12" lg="auto" className="text-center">
                                                <Button className='btn btn-sm d-flex align-items-center w-sm' color='primary' onClick={() => setAddCompModal(true)}>
                                                    <i className="bx bx-list-plus me-1" style={{ fontSize: '18px' }} /> CREATE PROFILE
                                                </Button>
                                            </Col>
                                        )}
                                    </Row>

                                    {tabs && (
                                        <>
                                            {componentList.length === 0 ? (
                                                <div className="container" style={{ position: 'relative', height: '20vh' }}>
                                                    <div className="text-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                                                        <h5 className="text-secondary">No Profiles Available</h5>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className='table-responsive'>
                                                    <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th>S. No.</th>
                                                                <th>Profile Name</th>
                                                                <th>Profile Status</th>
                                                                <th>Acceptance Ratio</th>
                                                                <th>Object Detection</th>
                                                                <th>Position</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {componentList.map((data, index) => (
                                                                <tr key={index} id="recent-list">
                                                                    <td style={{ backgroundColor: "white" }}>{index + 1}</td>
                                                                    <td style={{ backgroundColor: "white" }}>{data.profile_name}</td>
                                                                    <td style={{ backgroundColor: "white" }}>
                                                                        {togglingProfileStatus?.[data._id] ? (
                                                                            <div className='ms-2'>
                                                                                <Spin indicator={<LoadingOutlined />} />
                                                                            </div>
                                                                        ) : (
                                                                            <Switch
                                                                                checked={data.profile_active}
                                                                                onChange={(e) => onChange(e, data)}
                                                                                checkedChildren="Active"
                                                                                unCheckedChildren="Inactive"
                                                                            />
                                                                        )}
                                                                    </td>
                                                                    <td style={{ backgroundColor: "white", whiteSpace: 'pre' }}>
                                                                        {data.acceptance_ratio ? `${data.acceptance_ratio} %` : `- NA -`}
                                                                    </td>
                                                                    <td style={{ backgroundColor: "white" }}>
                                                                        <div className="align-items-start" style={{ cursor: "pointer" }}>
                                                                            <Checkbox
                                                                                checked={data?.detect_selection || false}
                                                                                onChange={(e) => handleObjectDetectionToggle(e, data, index)}
                                                                            >
                                                                                Enable Object Detection
                                                                            </Checkbox>

                                                                            {data?.detect_selection && (
                                                                                <div style={{ marginTop: 8 }} className='d-flex flex-column'>
                                                                                    <Label>
                                                                                        Method: <strong>{data.detection_type || "Not selected"}</strong>
                                                                                    </Label>

                                                                                    {data.detection_type === 'Smart Object Locator' && (
                                                                                        <Label style={{ color: '#555' }}>
                                                                                            Regions: {data.selected_regions?.length > 0 ? data.selected_regions.join(', ') : 'None'}
                                                                                        </Label>
                                                                                    )}

                                                                                    <span
                                                                                        onClick={() => openDetectionModal(data, index)}
                                                                                        style={{ marginTop: 4, display: 'inline-block', color: '#007bff', cursor: 'pointer' }}
                                                                                    >
                                                                                        ✎ Edit
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td style={{ backgroundColor: "white" }}>{data.position}</td>
                                                                    <td style={{ backgroundColor: "white" }}>
                                                                        <div className="d-flex gap-1 align-items-center" style={{ cursor: "pointer" }}>
                                                                            {data.profile_active !== false && (
                                                                                <>
                                                                                    <Button color="primary" className='btn btn-sm' onClick={() => profileInfo(data)} id={`profile-${data._id}`}>
                                                                                        Profile Info
                                                                                    </Button>
                                                                                    <UncontrolledTooltip placement="top" target={`profile-${data._id}`}>
                                                                                        Manage Profile Info
                                                                                    </UncontrolledTooltip>
                                                                                </>
                                                                            )}
                                                                            {data.profile_active !== false && (
                                                                                <>
                                                                                    <Button color="primary" className='btn btn-sm' onClick={() => computeProfileRatio(data)} id={`test-${data._id}`}>
                                                                                        Calculate Accepatance Ratio
                                                                                    </Button>
                                                                                    <UncontrolledTooltip placement="top" target={`test-${data._id}`}>
                                                                                        Calculate Accepatance Ratio with Profile Test
                                                                                    </UncontrolledTooltip>
                                                                                </>
                                                                            )}
                                                                            {showStationInfo && data.profile_active !== false && (
                                                                                <>
                                                                                    <Button color="primary" className='btn btn-sm' onClick={() => manageStation(data)} id={`station-${data._id}`}>
                                                                                        Station Info
                                                                                    </Button>
                                                                                    <UncontrolledTooltip placement="top" target={`station-${data._id}`}>
                                                                                        Manage Station Info
                                                                                    </UncontrolledTooltip>
                                                                                </>
                                                                            )}
                                                                            <>
                                                                                <Button color="primary" className='btn btn-sm' onClick={() => logComp(data)} id={`log-${data._id}`}>
                                                                                    Log Info
                                                                                </Button>
                                                                                <UncontrolledTooltip placement="top" target={`log-${data._id}`}>
                                                                                    Log Info
                                                                                </UncontrolledTooltip>
                                                                            </>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>

                                                


                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </CardBody>
                    </Card>
                </Container>

                {/* Modal 1 - Profile Status */}
                {isProfileStatusModalOpen && (
                    <Modal isOpen={isProfileStatusModalOpen} toggle={toggleProfileStatusModal} centered>
                        <ModalBody>
                            <p>If you deactivate this profile, it will be deleted from the following stations:</p>
                            <Table responsive striped bordered size="sm">
                                <thead>
                                    <tr>
                                        <th>S.No</th>
                                        <th>Station Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {profileAssignedStations.map((station, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{station}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            <div className='d-flex my-2 justify-content-end gap-2'>
                                <Button size='sm' color="danger" onClick={changeProfileStatus}>
                                    Yes, Deactivate
                                </Button>
                                <Button size='sm' color="secondary" onClick={toggleProfileStatusModal}>
                                    Cancel
                                </Button>
                            </div>
                        </ModalBody>
                    </Modal>
                )}

                {/* Modal 2 - Add Profile */}
                <Modal isOpen={addCompModal} onClosed={handleModalClosed}>
                    <div className="modal-header">
                        <h5 className="modal-title mt-0" id="myModalLabel">
                            Enter Profile Details
                        </h5>
                        <button
                            type="button"
                            onClick={() => setAddCompModal(false)}
                            className="close"
                            data-dismiss="modal"
                            aria-label="Close"
                        >
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <Form>
                            <div className="row mb-4">
                                <Col sm={12}>
                                    <Label for="horizontal-profilename-Input">Profile name</Label>
                                    <Input
                                        type="text"
                                        className="form-control"
                                        id="horizontal-profilename-Input"
                                        placeholder="Enter Your"
                                        value={profileName}
                                        maxLength="40"
                                        onChange={(e) => setProfileName(e.target.value)}
                                    />
                                    {profileNameError && <p className="error-message" style={{ color: "red" }}>{profileNameError}</p>}
                                </Col>
                            </div>
                            <div className="row justify-content-end">
                                <Col sm={9}>
                                    <div className="text-end">
                                        <Button
                                            size='sm'
                                            color="primary"
                                            className="w-md"
                                            onClick={submitForm}
                                        >
                                            ADD
                                        </Button>
                                    </div>
                                </Col>
                            </div>
                        </Form>
                    </div>
                </Modal>

                {/* Modal 3 - Select Object Detection */}
                <Modal isOpen={modalVisible} toggle={() => setModalVisible(false)}>
                    <ModalBody>
                        <h6 className='fw-bold'>Choose Object Detection Method</h6>
                        {detectionType.map((type, i) => (
                            <FormGroup check key={i}>
                                <Label check>
                                    <Input
                                        type="radio"
                                        name="detectMethod"
                                        value={type}
                                        checked={modalDetectionType === type}
                                        onChange={(e) => setModalDetectionType(e.target.value)}
                                    />{' '}
                                    {type}
                                </Label>
                            </FormGroup>
                        ))}

                        {modalDetectionType === 'Smart Object Locator' && (
                            <div style={{ marginTop: '1rem' }}>
                                <div
                                    style={{
                                        backgroundColor: '#f1f1f1',
                                        padding: '12px',
                                        borderRadius: '5px',
                                        border: '1px solid #ccc',
                                        marginBottom: '10px'
                                    }}
                                >
                                    <p style={{ marginBottom: 4 }}>
                                        This mode automatically locates components even if they are <strong>not in their fixed positions</strong>.
                                        Useful when objects <strong>shift/move inside the test image</strong>.
                                    </p>

                                    <div className='p-2 rounded' style={{ backgroundColor: 'white', border: '1px solid #ccc' }}>
                                        <p><strong>Select regions where movement might happen:</strong></p>

                                        {profileData?.rectangles?.map((region, idx) => (
                                            <FormGroup check key={idx}>
                                                <Label check>
                                                    <Input
                                                        type="checkbox"
                                                        checked={modalSelectedRegions.includes(region.name)}
                                                        onChange={(e) => {
                                                            const isChecked = e.target.checked;
                                                            let updated = [...modalSelectedRegions];

                                                            if (isChecked) updated.push(region.name);
                                                            else updated = updated.filter(r => r !== region.name);

                                                            setModalSelectedRegions(updated);
                                                            setShowValidationMsg(false);
                                                        }}
                                                    />{' '}
                                                    {region.name}
                                                </Label>
                                            </FormGroup>
                                        ))}

                                        {showValidationMsg && (
                                            <div style={{ color: 'red', marginTop: 8 }}>
                                                *Please select at least one region for Smart Object Locator to work.
                                            </div>
                                        )}
                                    </div>
                                    <p style={{ fontStyle: 'italic' }}>
                                        You can uncheck regions where components always stay fixed.
                                    </p>
                                </div>
                            </div>
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button size='sm' color="secondary" onClick={() => setModalVisible(false)}>
                            Cancel
                        </Button>
                        <Button size='sm' color="primary" onClick={handleModalConfirm}>
                            Confirm
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        </>
    );
};

CompInfo.propTypes = {
    history: PropTypes.any
};

export default CompInfo;