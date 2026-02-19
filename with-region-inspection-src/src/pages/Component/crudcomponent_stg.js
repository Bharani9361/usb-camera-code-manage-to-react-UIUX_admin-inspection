import React, { useState, useEffect, useCallback } from "react";
import MetaTags from 'react-meta-tags';
import PropTypes from "prop-types";
import {
    Card,
    Col,
    Container,
    Row,
    CardBody,
    Table,
    Button,
    Input,
    Modal,
    Spinner,
    ModalBody,
    FormGroup,
    ModalFooter,
    Label
} from "reactstrap";
import { useHistory } from "react-router-dom";
import { Image } from 'antd';
import { Radio, Space, Checkbox, Progress, InputNumber, Steps } from 'antd';

import urlSocket from "./urlSocket";
import ImageUrl from "./imageUrl";
import Swal from "sweetalert2";
import Breadcrumbs from "components/Common/Breadcrumb";
import { toastWarning } from "./ToastComponent";
import FullScreenLoader from "components/Common/FullScreenLoader";

const CRUDComponent = () => {
    const history = useHistory();

    // State declarations
    const [state, setState] = useState({
        dataloaded: false,
        disabled: false,
        component_name: "",
        component_code: "",
        batch_id: "",
        stationList: [],
        label_list: [],
        manual_auto_option: ['Manual', 'Auto'],
        detection_method: ['ML', 'DL'],
        selectM_A: 'Manual',
        timer: 10,
        SearchField: '',
        items_per_page_stock: 100,
        currentPage_stock: 1,
        sorting: { field: "", order: "" },
        search_componentList: [],
        componentList: [],
        progress: [],
        modalVisible: false,
        currentDataIndex: null,
        modalDetectionType: 'ML',
        modalSelectedRegions: [],
        showValidationMsg: false,
        barcode_check_type: {
            0: 'only With Correct Barcode',
            1: 'with Both Correct & Incorrect'
        },
        detectionType: ['ML', 'DL'],
        IsSynching: false,
        is_loading_models: false,
    });

    // Destructure commonly used state values
    const {
        dataloaded,
        disabled,
        stationList,
        componentList,
        search_componentList,
        SearchField,
        progress,
        modalVisible,
        currentDataIndex,
        modalDetectionType,
        modalSelectedRegions,
        showValidationMsg,
        detectionType,
        IsSynching,
        is_loading_models,
        manual_auto_option,
        barcode_check_type
    } = state;

    // Helper function to update state
    const updateState = (updates) => {
        setState(prev => ({ ...prev, ...updates }));
    };

    // Label configuration
    // const labelConfig = useCallback(async () => {
    //     try {
    //         const response = await urlSocket.post('/config', { mode: 'no-cors' });
    //         // You can handle the response if needed
    //     } catch (error) {
    //         console.error('Label config error:', error);
    //     }
    // }, []);

    // Get station info
    const getStationInfo = useCallback(() => {
        const data = JSON.parse(sessionStorage.getItem("stationInfo"));
        console.log('data51', data);

        compInfo(data);
        if (data[0].config_change === false) {
            updateState({ stationList: data, disabled: true, dataloaded: true });
        } else if (data[0].config_change === true) {
            updateState({ stationList: data, disabled: false, dataloaded: true });
        }
    }, []);

    const testFilterData = async (data) => {
        updateState({ IsSynching: true });
        try {
            const payload = {};
            const response = await urlSocket.post('/test_api', payload, { mode: 'no-cors' });
            const datas = response.data;
            console.log('detailes88', datas);

            if (datas === 'ok') {
                newTrainfilterData(data);
                updateState({ SearchField: '' });
            } else {
                toastWarning('Unable to Reach Admin', '');
                updateState({ IsSynching: false });
            }
        } catch (error) {
            console.log('/test_api - unable to reach admin server');
            toastWarning('Unable to Reach Admin', '');
            updateState({ IsSynching: false });
        }
    };

    const compInfo = async (data) => {
        const station_id = data[0]._id;
        console.log('station_id', station_id);
        try {
            const response = await urlSocket.post('/train_comp',
                { 'station_id': station_id },
                { mode: 'no-cors' }
            );
            const filterData = response.data;
            console.log('/newTrainfilterData', filterData);
            updateState({ componentList: filterData });
            // configuration(filterData, true);
        } catch (error) {
            console.log("----", error);
        }
    }


    const newTrainfilterData = async (data) => {
        console.log('data303', data);
        const station_id = data[0]._id;
        console.log('station_id', station_id);
        try {
            const response = await urlSocket.post('/newTrainfilterData',
                { 'station_id': station_id },
                { mode: 'no-cors' }
            );
            const filterData = response.data;
            console.log('/newTrainfilterData', filterData);
            updateState({ componentList: filterData });
            // configuration(filterData, true);
        } catch (error) {
            console.log("----", error);
        } finally {
            updateState({ IsSynching: false });
        }
    };



    const testingComp = async (datas) => {
        console.log("datas_test", datas);

        // Defensive checks
        const captureMode = datas.capture_mode || "Sequential";
        const subMode = datas.sub_mode || "Single";

        if (captureMode === "Non-Sequential") {
            if (subMode === "Single") {
                history.push({
                    pathname: "/remote_single_stg",
                    state: { datas },
                });
            } else if (subMode === "Multi") {
                history.push({
                    pathname: "/remote_stg",
                    state: { datas },
                });
            } else {
                toastWarning("Please select Single or Multi mode before proceeding.", "");
            }
        } else {
            history.push({
                pathname: "/sequential",
                state: { datas },
            });
        }
    };
    const handleAdminAccuracyCapture = (datas) => {
        console.log("Admin Accuracy Data:", datas);

        const captureMode = datas.capture_mode || "Sequential";
        const subMode = datas.sub_mode || "Single";

        const completedCameras = [];

        datas.stages?.forEach((stage) => {
            stage.camera_selection?.cameras?.forEach((cam) => {
                if (cam.training_status?.toLowerCase().trim() === "training completed") {
                    completedCameras.push({
                        stage_name: stage.stage_name,
                        stage_code: stage.stage_code,
                        ...cam,
                    });
                }
            });
        });

        console.log("Capture Mode:", captureMode);
        console.log("Sub Mode:", subMode);
        console.log("Completed Cameras:", completedCameras);

        if (completedCameras.length === 0) {
            toastWarning("No cameras have completed training.", "");
            return;
        }

        if (captureMode === "Non-Sequential") {
            if (subMode === "Single") {
                history.push({
                    pathname: "/admin_accuracy_single",
                    state: { datas, completedCameras },
                });
            } else if (subMode === "Multi") {
                history.push({
                    pathname: "/admin_accuracy_multi",
                    state: { datas, completedCameras },
                });
            } else {
                toastWarning("Please select Single or Multi mode before proceeding.", "");
            }
        } else {
            history.push({
                pathname: "/Admin_accuracy_image",
                state: { datas, completedCameras },
            });
        }
    };
    const handleprofile = (datas) => {
        console.log("Admin Accuracy Data:", datas);

        const captureMode = datas.capture_mode || "Sequential";
        const subMode = datas.sub_mode || "Single";

        const completedCameras = [];

        datas.stages?.forEach((stage) => {
            stage.camera_selection?.cameras?.forEach((cam) => {
                if (cam.training_status?.toLowerCase().trim() === "admin approved trained model") {
                    completedCameras.push({
                        stage_name: stage.stage_name,
                        stage_code: stage.stage_code,
                        ...cam,
                    });
                }
            });
        });

        console.log("Capture Mode:", captureMode);
        console.log("Sub Mode:", subMode);
        console.log("Completed Cameras:", completedCameras);

        if (completedCameras.length === 0) {
            toastWarning("No cameras have completed training.", "");
            return;
        }

        if (captureMode === "Non-Sequential") {
            if (subMode === "Single") {
                history.push({
                    pathname: "/Profile_non_single",
                    state: { datas, completedCameras },
                });
            } else if (subMode === "Multi") {
                history.push({
                    pathname: "/Profile_non_multi",
                    state: { datas, completedCameras },
                });
            } else {
                toastWarning("Please select Single or Multi mode before proceeding.", "");
            }
        } else {
            history.push({
                pathname: "/Profile_sequence",
                state: { datas, completedCameras },
            });
        }
    };




    // Search handler
    // const onSearch = (search) => {
    //     updateState({ search, SearchField: search, currentPage_stock: 1 });
    //     setTimeout(() => {
    //         dataListProcess(search);
    //     }, 100);
    // };

    // // Data list process
    // const dataListProcess = (search = SearchField) => {
    //     try {
    //         let filteredList = [...search_componentList];
    //         console.log('filteredList', filteredList);

    //         if (search) {
    //             filteredList = filteredList.filter(d =>
    //                 d.comp_name.toUpperCase().includes(search.toUpperCase()) ||
    //                 d.comp_code.toUpperCase().includes(search.toUpperCase())
    //             );
    //         }

    //         updateState({ 
    //             componentList: filteredList, 
    //             totalItems_stock: filteredList.length, 
    //             dataloaded: true 
    //         });
    //     } catch (error) {
    //         console.error(error);
    //     }
    // };
    // Search handler
    const onSearch = (search) => {
        updateState({ SearchField: search, currentPage_stock: 1 });

        setTimeout(() => {
            dataListProcess(search);
        }, 100);
    };

    // Data list process
    const dataListProcess = (search = SearchField) => {
        try {
            // ✅ Always start filtering from the full original list
            let baseList = [...state.search_componentList.length ? state.search_componentList : state.componentList];

            let filteredList = baseList;
            console.log('filteredList', filteredList, baseList)

            if (search && search.trim() !== "") {
                filteredList = baseList.filter((d) =>
                    d.comp_name.toUpperCase().includes(search.toUpperCase()) ||
                    d.comp_code.toUpperCase().includes(search.toUpperCase())
                );
            }

            updateState({
                componentList: filteredList,
                totalItems_stock: filteredList.length,
                dataloaded: true,
            });
        } catch (error) {
            console.error("Error in dataListProcess:", error);
        }
    };



    // Component mount effect
    useEffect(() => {
        getStationInfo();
        sessionStorage.removeItem('showSidebar');
        sessionStorage.setItem('showSidebar', false);
    }, []);

    // Render
    if (!dataloaded) {
        return null;
    }

    const updateCompMode = async (updatedComp) => {
        try {
            const res = await urlSocket.post('/update_train_comp_mode', updatedComp);
            console.log('✅ updateCompMode success:', res.data);
        } catch (err) {
            console.error('❌ updateCompMode error:', err);
        }
    };

    const handleModeChange = (index, value) => {
        setState(prev => {
            const updatedList = [...prev.componentList];
            // updatedList[index] = {
            //     ...updatedList[index],
            //     capture_mode: value,
            //     sub_mode: value === 'Sequential' ? null : updatedList[index].sub_mode,
            //     capture_count: updatedList[index].capture_count || 1
            // };]
            updatedList[index] = {
                ...updatedList[index],
                capture_mode: value,
                sub_mode: null,                 // clear Non-Sequential sub mode
                sequential_sub_mode: null,      // clear Sequential sub mode
                capture_count: null             // hide input until chosen
            };

            updateCompMode(updatedList[index]);

            return { ...prev, componentList: updatedList };
        });
    };

    const handleSubModeChange = (index, value) => {
        setState(prev => {
            const updatedList = [...prev.componentList];
            updatedList[index] = {
                ...updatedList[index],
                sub_mode: value,
                capture_count: updatedList[index].capture_count || 1
            };
            updateCompMode(updatedList[index]);

            return { ...prev, componentList: updatedList };
        });
    };


    const handleSequentialSubModeChange = (index, value) => {
        setState(prev => {
            const updatedList = [...prev.componentList];
            updatedList[index] = {
                ...updatedList[index],
                sequential_sub_mode: value,
                capture_count: updatedList[index].capture_count || 1
            };
            updateCompMode(updatedList[index]);

            return { ...prev, componentList: updatedList };
        });
    };


    const handleCaptureCountChange = (index, value) => {
        setState(prev => {
            const updatedList = [...prev.componentList];

            updatedList[index] = {
                ...updatedList[index],
                capture_count: value
            };
            updateCompMode(updatedList[index]);

            return { ...prev, componentList: updatedList };
        });
    };

    const handleCaptureCountBlur = index => {
        const comp = componentList[index];
        updateCompMode(comp);
    };

    const items = [
        {
            title: 'Training',
        },
        {
            title: 'Admin Acc Testing',
        },
        {
            title: 'Profile Testing',
        },
    ];

    // Helper functions
    const isTrainingCompleted = (data) => {
        if (!data?.stages?.length) return false;
        return data.stages.every(stage =>
            stage.camera_selection?.cameras?.every(cam => cam.training_status === "training completed")
        );
    };

    const getTrainingProgress = (data) => {
        if (!data?.stages?.length) return 0;
        const allCams = data.stages.flatMap(stage => stage.camera_selection?.cameras || []);
        const completedCams = allCams.filter(cam => cam.training_status === "training completed").length;
        return Math.round((completedCams / allCams.length) * 100);
    };


    return (
        <React.Fragment>
            {is_loading_models && <FullScreenLoader />}

            <div className="page-content">
                <MetaTags>
                    <title>Component Information</title>
                </MetaTags>
                <Breadcrumbs title="COMPONENT INFORMATION" />

                <Container fluid>
                    <Card>
                        <CardBody>
                            <Row className="d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-2 mb-2">
                                <Col xs="12" lg="auto" className="text-center">
                                    <div className="search-box">
                                        <div className="position-relative">
                                            <Input
                                                onChange={(e) => onSearch(e.target.value)}
                                                id="search-user"
                                                type="text"
                                                className="form-control"
                                                placeholder="Search name or code..."
                                                value={SearchField}
                                            />
                                            <i className="bx bx-search-alt search-icon" />
                                        </div>
                                    </div>
                                </Col>

                                <Col xs="12" lg="auto" className="text-center">
                                    <Button
                                        className="w-lg btn btn-sm"
                                        color='primary'
                                        onClick={() => testFilterData(stationList)}
                                        disabled={IsSynching}
                                    >
                                        {IsSynching ? (
                                            <div className="d-flex align-items-center">
                                                <Spinner size="sm" className="me-2" /> Syncing Component
                                            </div>
                                        ) : (
                                            <>Component Sync</>
                                        )}
                                    </Button>
                                </Col>
                            </Row>

                            {componentList.length === 0 ? (
                                <div className="container" style={{ position: 'relative', height: '20vh' }}>
                                    <div className="text-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                                        <h5 className="text-secondary">No Records Found</h5>
                                    </div>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
                                        <thead className="table-light">
                                            <tr>
                                                <th>S. No.</th>
                                                <th>Name</th>
                                                <th>Code</th>
                                                <th>Capture Image mode</th>
                                                {/* <th>Progress Steps</th? */}
                                                <th>Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {componentList.map((data, index) => (

                                                <tr key={index}>
                                                    {console.log('componentList', componentList)}
                                                    <td style={{ backgroundColor: "white" }}>{index + 1}</td>
                                                    <td style={{ backgroundColor: "white" }}>{data?.comp_name}</td>
                                                    <td style={{ backgroundColor: "white" }}>{data?.comp_code}</td>

                                                    <td key={index} className='bg-white'>
                                                        <Radio.Group
                                                            value={data.capture_mode}
                                                            onChange={e =>
                                                                data.allow_user === true ||
                                                                    data.allow_user === 'true'
                                                                    ? handleModeChange(index, e.target.value)
                                                                    : null
                                                            }
                                                            disabled={
                                                                !(
                                                                    data.allow_user === true ||
                                                                    data.allow_user === 'true'
                                                                )
                                                            }
                                                        >
                                                            <Space direction='vertical'>
                                                                <div
                                                                    style={{
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        gap: 4
                                                                    }}
                                                                >
                                                                    <Radio value='Sequential'>
                                                                        Sequential Mode
                                                                    </Radio>


                                                                    {data.capture_mode === 'Sequential' && (
                                                                        <div style={{ marginLeft: 30, marginTop: 4 }}>

                                                                            <Radio.Group
                                                                                value={data.sequential_sub_mode}
                                                                                onChange={e => handleSequentialSubModeChange(index, e.target.value)}
                                                                            >
                                                                                <Radio value='Mode1'>Mode 1</Radio>
                                                                                <Radio value='Mode2'>Mode 2</Radio>
                                                                            </Radio.Group>

                                                                            {data.sequential_sub_mode && (
                                                                                <div style={{ marginTop: 8 }}>
                                                                                    <Space direction='horizontal' size='small'>
                                                                                        <span style={{ fontSize: 13 }}>Image Count:</span>

                                                                                        <InputNumber
                                                                                            min={1}
                                                                                            placeholder='Enter count'
                                                                                            value={data.capture_count}
                                                                                            onChange={value =>
                                                                                                data.allow_user === true || data.allow_user === 'true'
                                                                                                    ? handleCaptureCountChange(index, value)
                                                                                                    : null
                                                                                            }
                                                                                            onBlur={() =>
                                                                                                data.allow_user === true || data.allow_user === 'true'
                                                                                                    ? handleCaptureCountBlur(index)
                                                                                                    : null
                                                                                            }
                                                                                            disabled={
                                                                                                !(
                                                                                                    data.allow_user === true ||
                                                                                                    data.allow_user === 'true'
                                                                                                )
                                                                                            }
                                                                                            style={{ width: 100 }}
                                                                                        />
                                                                                    </Space>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                </div>

                                                                <div
                                                                    style={{
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        gap: 4
                                                                    }}
                                                                >
                                                                    <Radio value='Non-Sequential'>
                                                                        Non-Sequential
                                                                    </Radio>
                                                                    {data.capture_mode === 'Non-Sequential' && (
                                                                        <div
                                                                            style={{ marginLeft: 30, marginTop: 4 }}
                                                                        >
                                                                            <Radio.Group
                                                                                value={data.sub_mode}
                                                                                onChange={e =>
                                                                                    data.allow_user === true ||
                                                                                        data.allow_user === 'true'
                                                                                        ? handleSubModeChange(
                                                                                            index,
                                                                                            e.target.value
                                                                                        )
                                                                                        : null
                                                                                }
                                                                                disabled={
                                                                                    !(
                                                                                        data.allow_user === true ||
                                                                                        data.allow_user === 'true'
                                                                                    )
                                                                                }
                                                                            >
                                                                                <Space direction='horizontal'>
                                                                                    <Radio value='Single'>Single</Radio>
                                                                                    <Radio value='Multi'>Multi</Radio>
                                                                                </Space>
                                                                            </Radio.Group>

                                                                            {data.sub_mode && (
                                                                                <div style={{ marginTop: 8 }}>
                                                                                    <Space
                                                                                        direction='horizontal'
                                                                                        size='small'
                                                                                    >
                                                                                        <span style={{ fontSize: 13 }}>
                                                                                            Image Count:
                                                                                        </span>

                                                                                        <InputNumber
                                                                                            min={1}
                                                                                            placeholder='Enter count'
                                                                                            value={data.capture_count}
                                                                                            onChange={value =>
                                                                                                data.allow_user === true ||
                                                                                                    data.allow_user === 'true'
                                                                                                    ? handleCaptureCountChange(
                                                                                                        index,
                                                                                                        value
                                                                                                    )
                                                                                                    : null
                                                                                            }
                                                                                            onBlur={() =>
                                                                                                data.allow_user === true ||
                                                                                                    data.allow_user === 'true'
                                                                                                    ? handleCaptureCountBlur(
                                                                                                        index
                                                                                                    )
                                                                                                    : null
                                                                                            }
                                                                                            disabled={
                                                                                                !(
                                                                                                    data.allow_user === true ||
                                                                                                    data.allow_user === 'true'
                                                                                                )
                                                                                            }
                                                                                            style={{ width: 100 }}
                                                                                        />

                                                                                    </Space>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </Space>
                                                        </Radio.Group>
                                                    </td>

                                                    {/* <td style={{ backgroundColor: "white" }}>
                                                        {data.image_sync !== 0 && (
                                                            <Steps
                                                                current={0}
                                                                percent={getTrainingProgress(data)}
                                                                labelPlacement="vertical"
                                                                items={items}
                                                                className=""
                                                            />
                                                        )}
                                                    </td> */}

                                                    <td style={{ backgroundColor: "white" }}>
                                                        {data.image_sync !== 0 && (
                                                            <>
                                                                {/* Main Capture Button - Disabled until all cameras trained */}
                                                                <Button
                                                                    className="w-md btn btn-sm me-2"
                                                                    color="primary"
                                                                    id="inspButton"
                                                                    disabled={isTrainingCompleted(data) || data.stages.length === 0}
                                                                    onClick={() => testingComp(data)}
                                                                >
                                                                    Capture Image
                                                                </Button>

                                                                {/* Other Capture Buttons */}
                                                                <Button
                                                                    className="w-md btn btn-sm me-2"
                                                                    color="primary"
                                                                    onClick={() => handleAdminAccuracyCapture(data)}
                                                                >
                                                                    Admin Accuracy Capture Image
                                                                </Button>

                                                                <Button
                                                                    className="w-md btn btn-sm me-2"
                                                                    color="primary"
                                                                    onClick={() => handleprofile(data)}
                                                                >
                                                                    Profile Test Capture
                                                                </Button>

                                                                {/* Validation Message */}
                                                                {data.image_sync !== 0 && data.stages.length === 0 && (
                                                                    <p className="error-message" style={{ color: "red", marginTop: "5px" }}>
                                                                        Please configure stages in admin side to proceed.
                                                                    </p>
                                                                )}
                                                            </>
                                                        )}
                                                    </td>



                                                </tr>
                                            ))}
                                        </tbody>

                                    </Table>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </Container>


            </div>
        </React.Fragment>
    );
};

CRUDComponent.propTypes = {
};

export default CRUDComponent;