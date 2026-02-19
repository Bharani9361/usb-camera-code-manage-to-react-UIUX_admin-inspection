import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Container, CardTitle, Button, Progress, Card, Col, CardBody, CardText, Spinner, UncontrolledTooltip,
    Row, Modal, Table,
    ButtonGroup,


} from 'reactstrap';
import { Multiselect } from "multiselect-react-dropdown";
import urlSocket from './urlSocket';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import moment from 'moment';
import Swal from 'sweetalert2';
import "./Css/style.css";
import { JsonTable } from 'react-json-to-html';
import Cookies from 'js-cookie';
import { error } from 'toastr';
import SweetAlert from 'react-bootstrap-sweetalert';
import PaginationComponent from './PaginationComponent';
import AdminTestingOptions from './RegionFunctions/AdminTestingOptions';
import FullScreenLoader from 'components/Common/FullScreenLoader';

const StageModelVerInfo = ({ history }) => {
    const [stageName, setStageName] = useState('');
    const [stageCode, setStageCode] = useState('');
    const [selectAllCameras, setSelectAllCameras] = useState(false);

    const [compName, setCompName] = useState('');
    const [compCode, setCompCode] = useState('');
    const [modelName, setModelName] = useState('');
    const [compModelVerInfo, setCompModelVerInfo] = useState([]);
    const [compModelVerList, setCompModelVerList] = useState([]);
    const [config, setConfig] = useState([]);
    const [showTrainingINProgs, setShowTrainingINProgs] = useState(false);
    const [expandedRow, setExpandedRow] = useState(null);
    const [refresh, setRefresh] = useState(true);
    const [initvalue, setInitvalue] = useState(1);
    const [modalXlarge, setModalXlarge] = useState(false);
    const [logData, setLogData] = useState([]);
    const [reTrain, setReTrain] = useState(false);
    const [type, setType] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [versionLoading, setVersionLoading] = useState(true);
    const [showTestingOptions, setShowTestingOptions] = useState(false);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [isCreatingVersion, setIsCreatingVersion] = useState(false);
    const [compModelInfo, setCompModelInfo] = useState(null);
    const [componentInfo, setComponentInfo] = useState(null);
    const [positive, setPositive] = useState(null);
    const [negative, setNegative] = useState(null);
    const [stageInfo, setStageInfo] = useState('');
    const [selectedCameras, setSelectedCameras] = useState([]);
    const [editingRowId, setEditingRowId] = useState(null);
    console.log('selectedCameras', selectedCameras)
    const [multiselectedCameras, setMultiSelectedCameras] = useState([]);
    console.log('multiselectedCameras', multiselectedCameras)
    const [infoModal, setInfoModal] = useState(false);
    const [selectedData, setSelectedData] = useState(null);

    // Refs for intervals
    const trainingStatusIntervals = useRef([]);
    const intervalId = useRef(null);
    const multiselectRef = useRef();



    useEffect(() => {
        if (stageInfo?.camera_selection?.cameras) {

            setMultiSelectedCameras(stageInfo.camera_selection.cameras);

        }
    }, [stageInfo]);


    useEffect(() => {
        const totalWithCamera = compModelVerList.filter(item => item.camera).length;
        const totalChecked = compModelVerList.filter(item => item.camera?.checked).length;
        setSelectAllCameras(totalWithCamera > 0 && totalWithCamera === totalChecked);
    }, [compModelVerList]);

    useEffect(() => {
        if (!modalXlarge) {
            setExpandedRow(null);
        }
    }, [modalXlarge]);

    useEffect(() => {
        const initializeComponent = async () => {
            try {
                const details = JSON.parse(sessionStorage.getItem('managestageData'));
                console.log('details', details)
                const component_info = details?.compInfo;
                const stage_info = details?.ManageStage;
                console.log('stage_info', stage_info)

                let compModelInfo = JSON.parse(sessionStorage.getItem('compModelData'));
                console.log('compModelInfo', compModelInfo);
                setCompCode(compModelInfo?.comp_code);
                setCompName(compModelInfo?.comp_name);
                setStageName(compModelInfo?.stage_name);
                setStageCode(compModelInfo?.stage_code);
                setModelName(compModelInfo?.model_name);
                setType(compModelInfo?.type);
                setCompModelInfo(compModelInfo);
                setComponentInfo(component_info);
                setStageInfo(stage_info);

                // await your API calls
                await getConfigInfo();
                await getCompModelVerInfo(compModelInfo);
                await getCompModelVerAllList(compModelInfo);
            } catch (err) {
                console.error("Error initializing component:", err);
            }
        };

        initializeComponent();
    }, []);

    // Component unmount effect
    useEffect(() => {
        return () => {
            clearTrainingStatusIntervals();
            clearInterval(intervalId.current);
        };
    }, []);

    const getConfigInfo = async () => {
        try {
            const response = await urlSocket.post('/config', { mode: 'no-cors' });
            const config = response.data;
            console.log('config ', config);
            if (config.error === "Tenant not found") {
                console.log("data error", config.error);
                errorHandler(config.error);
            } else {
                // console.log('first39', config);
                setConfig(config);
                setPositive(config[0].positive);
                setNegative(config[0].negative);
            }
        } catch (error) {
            console.log('error', error);
        }
    };
    const toggleRow = (index) => {
        setExpandedRow(expandedRow === index ? null : index);
    };

    const getCompModelVerInfo = async (compModelInfo) => {
        console.log('compModelInfo', compModelInfo);
        try {
            const response = await urlSocket.post('/api/stage/getCompModelVerInfo_stg', { compModelInfo }, { mode: 'no-cors' });
            console.log('responsesaaaa', response)
            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                errorHandler(response.data.error);
            } else {
                const compModelVerInfo = response.data;
                console.log('first28', compModelVerInfo);
                setCompModelVerInfo(compModelVerInfo);
            }
        } catch (error) {
            console.log('error', error);
        }
    };
    const closeInfoView = () => {
        setSelectedData(null);
    };
    const getCompModelVerAllList = async (compModelInfo) => {
        console.log('compModelInfo', compModelInfo);
        try {
            const response = await urlSocket.post('/api/stage/getCompModelVerList_stg', { compModelInfo }, { mode: 'no-cors' });
            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                errorHandler(response.data.error);
            } else {
                const compModelVerList = response.data;
                console.log('first 39', compModelVerList);

                const compTrainingStatusMap = {};

                compModelVerList.forEach(item => {
                    const { comp_id, training_status } = item;

                    if (!compTrainingStatusMap[comp_id]) {
                        compTrainingStatusMap[comp_id] = false;
                    }

                    if (training_status === 'training_in_progress' || training_status === 'training_queued') {
                        compTrainingStatusMap[comp_id] = true;
                    }
                });

                Object.entries(compTrainingStatusMap).forEach(([compId, status]) => {
                    Cookies.set(`training_status_${compId}`, status.toString());
                });

                console.log('Training status map:', compTrainingStatusMap);

                setCompModelVerList(compModelVerList);
                setRefresh(true);
                findInProgress(compModelVerList);
            }
        } catch (error) {
            console.log('error', error);
        } finally {
            setVersionLoading(false);

        }
    };
    const singleOrmulticam = async (string, value) => {
    };

    const findInProgress = useCallback((compModelVerList) => {
        clearInterval(intervalId.current);

        let training_version;

        if (compModelVerList.some(object => object.training_status === 'training_in_progress')) {
            training_version = compModelVerList.find(object => object.training_status === 'training_in_progress');
        } else if (compModelVerList.some(object => object.training_status === 'training_queued')) {
            training_version = compModelVerList.find(object => object.training_status === 'training_queued');
        }

        if (training_version) {
            console.log('Found next object with in-progress training:', training_version);
            intervalId.current = setInterval(() => {
                fetchTrainStatus(training_version);
            }, 5000);
        } else {
            console.log('No more objects with in-progress training found.', training_version);
        }
    }, []);

    // const startTraining = async (data, index) => {
    //     console.log('189 Train version : ', data);

    //     const updatedCompModelVerList = [...compModelVerList];
    //     updatedCompModelVerList[index].training_status_id = 0;
    //     updatedCompModelVerList[index].training_status = 'training_queued';
    //     setCompModelVerList(updatedCompModelVerList);
    //     setRefresh(true);

    //     clearInterval(intervalId.current);
    //     findInProgress(updatedCompModelVerList);

    //     try {
    //         const response = await urlSocket.post('/api/stage/Train_stg', { compModelVerInfo: data, config: config }, { mode: 'no-cors' });
    //         if (response.data.error === "Tenant not found") {
    //             console.log("data error", response.data.error);
    //             errorHandler(response.data.error);
    //         } else {
    //             console.log('first232', response.data);
    //             console.log('response.data.comp_model_data : ', response.data.comp_model_data);
    //             setCompModelVerList(response.data.comp_model_data);

    //             if (response.data === 'training completed') {
    //                 console.log('197 response.data.message = ', response.data.message);
    //             }
    //         }
    //     } catch (error) {
    //         console.log('Error starting training:', error);
    //     }
    // };
    const startTraining = async (data, index) => {
        console.log('Train version : ', data);

        // Optimistic UI update
        const updatedCompModelVerList = [...compModelVerList];
        updatedCompModelVerList[index].training_status_id = 0;
        updatedCompModelVerList[index].training_status = 'training_queued';
        setCompModelVerList(updatedCompModelVerList);
        setRefresh(true);

        try {
            const response = await urlSocket.post(
                '/api/stage/Train_stg',
                { compModelVerInfo: [data], config: config },  // ensure it's an array
                { mode: 'no-cors' }
            );

            console.log('Train_stg response:', response.data);

            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                errorHandler(response.data.error);
                return;
            }

            if (response.data.results && response.data.results.length > 0) {
                // Extract the updated comp_model_data for this train_id
                const updatedDocs = response.data.results.flatMap(r => r.comp_model_data);

                // Merge into state
                setCompModelVerList(prevList =>
                    prevList.map(item => {
                        const match = updatedDocs.find(d => d._id === item._id);
                        return match ? { ...item, ...match } : item;
                    })
                );
            }

        } catch (error) {
            console.log('Error starting training:', error);
        }
    };
    const train = async (data, index) => {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger'
            },
            buttonsStyling: false
        });

        swalWithBootstrapButtons.fire({
            title: 'Start Training?',
            text: "Training this version may take some time to complete. Please ensure that you have provided all necessary inputs before proceeding.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Continue',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                startTraining(data, index);
                swalWithBootstrapButtons.fire(
                    'Training Started',
                    'Please wait while the training process completes.',
                    'success'
                );
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire(
                    'Training Canceled',
                    `You can start the training anytime when you're ready.`,
                    'error'
                );
            }
        });
    };

    const clock = (data) => {
        if (data && data !== '00:00:00') {
            let st_date = new Date(data).toISOString();
            var time = moment.utc(st_date).format("DD/MM/YYYY HH:mm:ss");
            let start = new Date().toString();
            var endtime = moment.utc(start).format("DD/MM/YYYY HH:mm:ss");

            var startTime = moment(time, "DD/MM/YYYY HH:mm:ss");
            var endTime = moment(endtime, "DD/MM/YYYY HH:mm:ss");

            var duration = moment.duration(endTime.diff(startTime));
            console.log('344 Time : Duration : ', duration);

            var days = Math.floor(duration.asDays());
            var hours = duration.hours();
            var minutes = duration.minutes();
            var seconds = duration.seconds();

            var result = "";
            if (days > 0) {
                result += days + " Day";
                if (days > 1) {
                    result += "s";
                }
                result += " and ";
            }
            result += hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
            return result;
        } else {
            return '00:00:00';
        }
    };

    const fetchTrainStatus = async (in_progress_ver) => {
        console.log('252 in_progress_ver : ', in_progress_ver);

        try {
            const response = await urlSocket.post('/api/stage/getTrainStatus_stg', { compModelVerInfo: in_progress_ver, compModelInfo: compModelInfo }, { mode: 'no-cors' });
            const currentversion = response.data.ids;

            console.log('258 currentversion[0] : ', currentversion[0]);

            if (
                currentversion[0].training_status === 'training completed' ||
                currentversion[0].training_status === 'admin approved trained model'
            ) {
                clearInterval(intervalId.current);
                console.log('Training completed or model approved. Interval cleared.');
                setCompModelVerList(response.data.data_list);
                findInProgress(response.data.data_list);
            } else if (
                currentversion[0].training_status !== 'training_in_progress' &&
                currentversion[0].training_status !== 'training_queued'
            ) {
                clearInterval(intervalId.current);
                console.log('Not in progress and Queue');
                setCompModelVerList(response.data.data_list);
                findInProgress(response.data.data_list);
            } else {
                setCompModelVerList(response.data.data_list);
            }
        } catch (error) {
            console.log('Error fetching training status:', error);
        }
    };

    const clearTrainingStatusIntervals = () => {
        trainingStatusIntervals.current.forEach((interval) => {
            clearInterval(interval);
        });
    };












    const closeAdminTestOptions = () => {
        setShowTestingOptions(false);
    };

    const continueAdminTest = (selected_options) => {
        setShowTestingOptions(false);
        console.log('selected options: ', selected_options);

        const data = JSON.parse(JSON.stringify(selectedVersion));
        goToAdminTestingPage(data, selected_options);
    };

    // const startAdminTest = async (data, index) => {
    //     const details = JSON.parse(sessionStorage.getItem('managestageData'));
    //     console.log('details443', details)
    //     const model_info = details.modelInfo;

    //     const ask_testing_type = model_info.find(model =>
    //         model._id === data.model_id && model.region_testing === true
    //     ) !== undefined;
    //     console.log('ask_testing_type', ask_testing_type);

    //     if (ask_testing_type) {
    //         setShowTestingOptions(true);
    //         setSelectedVersion(data);
    //     } else {
    //         goToAdminTestingPage(data);
    //     }
    // };




    const startAdminTest = async (data, model) => {
        console.log('startAdminTest', data)
        // const details = JSON.parse(sessionStorage.getItem('manageData'));
        const details = JSON.parse(sessionStorage.getItem('managestageData'));

        console.log('details443', details)
        const model_info = details.modelInfo;

        // const ask_testing_type = model_info.find(model =>
        //     model._id === data.model_id
        //     // && model.region_testing === true
        // ) !== undefined;
        // const ask_testing_type = data.some(item =>
        //     model_info.find(model => model._id === item.model_id)
        // ) !== undefined;
        const ask_testing_type = (Array.isArray(data) ? data : [data]).some(item =>
            model_info.some(model => model._id === item.model_id)
        );


        console.log('ask_testing_type', ask_testing_type)

        if (ask_testing_type) {
            setSelectedVersion(data);
            setShowTestingOptions(true);

        } else {
            goToAdminTestingPage(data);
        }
    };



    const goToAdminTestingPage = (version_data, options = {}) => {
        console.log('options', options, version_data)
        const versionDataArray = Array.isArray(version_data) ? version_data : [version_data];

        if (versionDataArray[0].result_mode === "ok") {
            Swal.fire({
                title: "This is an OK Model",
                text: "Test only with OK images to get better accuracy",
                icon: "info",
                confirmButtonText: "OK"
            });
        } else if (versionDataArray[0].result_mode === "ng") {
            Swal.fire({
                title: "This is an NG Model",
                text: "Test only with NG images to get better accuracy",
                icon: "warning",
                confirmButtonText: "OK"
            });
        }

        let count = initvalue;
        let values = {
            config: config,
            testCompModelVerInfo: versionDataArray,
            batch_no: count++,
            page: 'modelverinfo'
        };


        if (options?.testing_mode?.length > 0) {
            values.overall_testing = false;
            values.region_wise_testing = false;

            if (options.testing_mode.length >= 2) {
                values.option = 'Entire Component with Regions';
                values.overall_testing = true;
                values.region_wise_testing = true;
            } else if (options.testing_mode.includes("component_testing")) {
                values.option = 'Entire Component';
                values.overall_testing = true;
            } else if (options.testing_mode.includes("region_testing")) {
                values.option = 'Regions Only';
                values.region_wise_testing = true;
            }

            if (options?.testing_mode.includes("region_testing")) {
                values.detection_type = options.detection_type;
                values.regions = options.regions;
            }
        }
        console.log('valuevaluess', values)

        sessionStorage.removeItem("modelData");
        localStorage.setItem('modelData', JSON.stringify(values));


        history.push('/StageAdminAccTesting');
    };




    // const goToAdminTestingPage = (version_data, options = []) => {
    //     if (version_data.result_mode === "ok") {
    //         Swal.fire({
    //             title: "This is an OK Model",
    //             text: "Test only with OK images to get better accuracy",
    //             icon: "info",
    //             confirmButtonText: "OK"
    //         });
    //     } else if (version_data.result_mode === "ng") {
    //         Swal.fire({
    //             title: "This is an NG Model",
    //             text: "Test only with NG images to get better accuracy",
    //             icon: "warning",
    //             confirmButtonText: "OK"
    //         });
    //     }

    //     let count = initvalue;
    //     let values = {
    //         config: config,
    //         testCompModelVerInfo: version_data,
    //         batch_no: count++,
    //         page: 'modelverinfo'
    //     };

    //     if (options?.testing_mode?.length > 0) {
    //         values.overall_testing = false;
    //         values.region_wise_testing = false;

    //         if (options.testing_mode.length >= 2) {
    //             values.option = 'Entire Component with Regions';
    //             values.overall_testing = true;
    //             values.region_wise_testing = true;
    //         } else if (options.testing_mode.includes("component_testing")) {
    //             values.option = 'Entire Component';
    //             values.overall_testing = true;
    //         } else if (options.testing_mode.includes("region_testing")) {
    //             values.option = 'Regions Only';
    //             values.region_wise_testing = true;
    //         }

    //         if (options?.testing_mode.includes("region_testing")) {
    //             values.detection_type = options.detection_type;
    //             values.regions = options.regions;
    //         }
    //     }
    //     console.log('values123 ', config);

    //     sessionStorage.removeItem("modelData");
    //     localStorage.setItem('modelData', JSON.stringify(values));
    //     history.push('/StageAdminAccTesting');
    // };




    // const handleCameraToggle = async (data, modelId, cameraValue, checked) => {
    //     try {
    //         const response = await urlSocket.post("/update_camera_checked", {
    //             model_id: modelId,
    //             camera_value: cameraValue,
    //             checked: checked,
    //         });

    //         if (response.data.error === "Tenant not found") {
    //             console.log("data error", response.data.error);
    //             errorHandler(response.data.error);
    //         } else {
    //             // update single stage object
    //             const updatedStage = { ...data.camera, checked };

    //             // update state list
    //             setCompModelVerList((prev) =>
    //                 prev.map((row) =>
    //                     row._id === modelId ? { ...row, camera: updatedStage } : row
    //                 )
    //             );
    //         }
    //     } catch (error) {
    //         console.error("Failed to update camera checked state:", error);
    //     }
    // };

    const handleCameraToggle = async (data, modelId, cameraValue, checked) => {
        try {
            await urlSocket.post("/update_camera_checked", {
                model_id: modelId,
                camera_value: cameraValue,
                checked,
            });

            // update frontend: allow multiple checkboxes now
            setCompModelVerList(prev =>
                prev.map(row =>
                    row._id === modelId
                        ? { ...row, camera: { ...row.camera, checked } }
                        : row
                )
            );

        } catch (error) {
            console.error("Failed to update camera checked state:", error);
        }
    };


    const handleSelectAllCameras = async (checked) => {
        setSelectAllCameras(checked);

        try {
            // Update backend for all models that have a camera
            await Promise.all(
                compModelVerList
                    .filter((item) => item.camera)
                    .map((item) =>
                        urlSocket.post("/update_camera_checked", {
                            model_id: item._id,
                            camera_value: item.camera.value,
                            checked,
                        })
                    )
            );

            // Update frontend state for all
            setCompModelVerList(prev =>
                prev.map(item =>
                    item.camera
                        ? { ...item, camera: { ...item.camera, checked } }
                        : item
                )
            );
        } catch (error) {
            console.error("Failed to update all camera states:", error);
        }
    };


    const gotoCompModelCreation = async (compModelVerInfo) => {
        setIsCreatingVersion(true);
        console.log('compModelVerInfo', compModelVerInfo);

        const performModelCreation = async () => {
            console.log('compModelInfocompModelInfocompModelInfo', compModelInfo, multiselectedCameras);
            try {
                const response = await urlSocket.post('/api/stage/compModel_ver_info_stg', { compModelInfo, cameras: multiselectedCameras, }, { mode: 'no-cors' });
                console.log('_compModelInforesponse', response)
                const compModelVerInfo = response.data;
                if (compModelVerInfo.error === "Tenant not found") {
                    console.log("data error", compModelVerInfo.error);
                    errorHandler(compModelVerInfo.error);
                } else {
                    const data = {
                        versionInfo: compModelVerInfo,
                        versionCount: compModelVerList.length
                    };

                    sessionStorage.removeItem("compModelVInfo");
                    sessionStorage.setItem("compModelVInfo", JSON.stringify(data));
                    // history.push("/StageModelCreation");
                    await getCompModelVerInfo(compModelInfo);
                    await getCompModelVerAllList(compModelInfo);
                    // setMultiSelectedCameras([]);
                    // setMultiSelectedCameras([]);
                    // multiselectRef.current.resetSelectedValues(); // ✅ force clear



                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        const isTrainingCompleted =
            compModelVerList.slice(-1)[0]?.training_status === 'training completed' ||
            compModelVerList.slice(-1)[0]?.training_status === 'admin approved trained model';

        await performModelCreation();

        setIsCreatingVersion(false);
    };

    const stgCamModelInfo = async (compmodelInfo, mode) => {
        try {
            const response = await urlSocket.post('/api/stage/stgCamModelInfo', {
                model: compmodelInfo,
                mode: mode
            });

            const data1 = response.data;

            if (data1.error === "Tenant not found") {
                console.log("data error", data1.error);
                errorHandler(data1.error);
                return null;
            } else {
                console.log('698 log info : ', data1);
                return data1;
            }
        } catch (error) {
            console.error("Error in stgCamModelInfo:", error);
            return null;
        }
    };

    // const isEdit = async (compModelVerInfo,) => {
    //     console.log('/compModelVerInfo ', compModelVerInfo);
    //     let compModel = await stgCamModelInfo(compModelVerInfo, '1')
    //     console.log('compModel785', compModel)

    //     const data = {
    //         compModel: compModel,
    //         versionInfo: compModel,
    //         versionCount: compModelVerList.length,
    //         mode: '1'
    //     };
    //     sessionStorage.removeItem("compModelVInfo");
    //     sessionStorage.setItem("compModelVInfo", JSON.stringify(data));
    //     history.push("/StageModelCreation");


    // };

    const isEdit = async (data) => {

        // reset other rows in DB
        await urlSocket.post("/api/stage/reset_other_cameras", { edit_row_id: data._id });

        // also reset other rows in frontend
        setCompModelVerList(prev =>
            prev.map(row =>
                row._id === data._id
                    ? row
                    : { ...row, camera: { ...row.camera, checked: false } }
            )
        );

        // existing session storage and navigation
        let compModel = await stgCamModelInfo(data, '1');
        const sessionData = {
            compModel,
            versionInfo: compModel,
            versionCount: compModelVerList.length,
            mode: '1'
        };
        sessionStorage.setItem("compModelVInfo", JSON.stringify(sessionData));
        history.push("/StageModelCreation");
    };

    const gotoVersionImgCap = async (compModelInfo) => {
        console.log('compModelInfo', compModelInfo);
        const selectedVersions = compModelVerList.filter(item => item?.camera?.checked === true);

        if (selectedVersions.length === 0) {
            Swal.fire("Warning", "Please select one of the versions before capturing the image.", "warning");


            return; // stop execution
        }
        let compModel = await stgCamModelInfo(compModelInfo, '2')
        console.log('compModel826', compModel)

        const data = {
            compModel: compModel,
            versionInfo: compModel,
            versionCount: compModelVerList.length,
            mode: '2'
        };
        sessionStorage.removeItem("compModelVInfo");
        sessionStorage.setItem("compModelVInfo", JSON.stringify(data));
        history.push("/StageModelCreation");
    };

    const isView = (compModelVerInfo) => {
        const data = {
            versionInfo: compModelVerInfo,
            versionCount: compModelVerList.length
        };

        sessionStorage.removeItem("compModelVInfo");
        sessionStorage.setItem("compModelVInfo", JSON.stringify(data));
        history.push("/StageModelCreation");
    };

    const togXlarge = (data) => {
        setModalXlarge(prev => !prev);
        log(data);
        removeBodyCss();
    };

    const removeBodyCss = () => {
        document.body.classList.add("no_padding");
    };
    const log = (data) => {
        console.log('687 data : ', data);
        try {
            urlSocket.post('/model_version_log_info',
                {
                    'comp_name': data.comp_name,
                    'comp_code': data.comp_code,
                    'stage_name': data.stage_name,
                    'stage_code': data.stage_code,
                    'model_name': data.model_name,
                    'model_version': data.model_ver
                }, { mode: 'no-cors' })
                .then((response) => {
                    let data1 = response.data;
                    if (data1.error === "Tenant not found") {
                        console.log("data error", data1.error);
                        errorHandler(data1.error);
                    } else {
                        console.log('698 log info : ', data1);
                        setLogData(data1);
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        } catch (error) {
            console.log("----", error);
        }
    };

    const printCons = () => {
        console.log('** compModelVerList : ', compModelVerList);
        console.log('** config : ', config);
    };

    const printRowCont = (data) => {
        console.log('** compModelVer : ', data);
    };

    const startRetrain = (data, index) => {
        console.log('* compModelVerList ', compModelVerList);
    };

    const reTrainLimit = () => {
        setReTrain(false);
    };

    const sampleFuncInLoop = (data, index) => {
        console.log('**  index : ', index);
    };

    const back = () => {
        history.push('/StageManageModel');
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const errorHandler = (error) => {
        sessionStorage.removeItem("authUser");
        history.push("/login");
    };
    const onSelectValues = (selectedList, selectedItem, index) => {
        console.log('selectedList, selectedItem, index', selectedList, selectedItem, index)
        setMultiSelectedCameras(selectedList);
        console.log("Selected:", selectedItem);
    };

    const onRemove = (selectedList, removedItem) => {
        setMultiSelectedCameras(selectedList);
        console.log("Removed:", removedItem);
    };




    // Calculate indices for slicing the component list
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = compModelVerList.slice(indexOfFirstItem, indexOfLastItem);

    const filteredItems =
        multiselectedCameras.length > 0
            ? currentItems.filter(item =>
                multiselectedCameras.some(selectedCam => selectedCam.value === item.camera?.value)
            )
            : currentItems;
    console.log('filteredItems', filteredItems)

    const renderValue = (value) => {
        if (value === null || value === undefined) return <span>NA</span>;

        if (typeof value === "object" && !Array.isArray(value)) {
            return (
                <Table striped bordered hover responsive style={{ border: "1px solid lightgrey" }}>
                    <tbody>
                        {Object.entries(value).map(([k, v], idx) => (
                            <tr key={idx}>
                                {/* <td style={{ width: "30%" }}>{k}</td> */}
                                <td style={{ fontWeight: "bold", border: "1px solid lightgrey" }}>
                                    {k === "is_checked" ? "allow_users" : k}
                                </td>
                                <td style={{ border: "1px solid lightgrey" }}>{renderValue(v)}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            );
        }

        if (Array.isArray(value)) {
            return value.map((item, idx) => (
                <div key={idx} className="mb-1">
                    {renderValue(item)}
                </div>
            ));
        }

        return <span style={{ fontSize: '12px', fontWeight: 600 }} className={`badge ${typeof value === "boolean" ? value ? "badge-soft-success" : "badge-soft-danger" : "badge-soft-primary"}`}>{String(value)}</span>;
    };
    return (
        <>
            {isCreatingVersion && <FullScreenLoader />}
            <div className='page-content'>
                <Row className="mb-3">
                    <Col xs={9}>
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="mb-0 mt-2 m-2 font-size-14 fw-bold">COMPONENT MODEL VERSION INFORMATION</div>
                        </div>
                    </Col>
                    <Col xs={3} className='d-flex align-items-center justify-content-end'>
                        <button className='btn btn-outline-primary btn-sm me-2' color="primary" onClick={back}>Back <i className="mdi mdi-arrow-left"></i></button>
                    </Col>
                </Row>

                <Container fluid={true}>
                    <Card>
                        <CardBody>
                            <Row className="d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-2 mb-2">

                                <Row className="d-flex flex-wrap justify-content-start align-items-center gap-3 mb-2">
                                    <Col xs="12" lg="auto">
                                        <CardText className="mb-0">
                                            <span className="me-2 font-size-12">Comp Name :</span>{compName}
                                        </CardText>
                                    </Col>
                                    <Col xs="12" lg="auto">
                                        <CardText className="mb-0">
                                            <span className="me-2 font-size-12">Comp Code :</span>{compCode}
                                        </CardText>
                                    </Col>
                                    <Col xs="12" lg="auto">
                                        <CardText className="mb-0">
                                            <span className="me-2 font-size-12">Stage Name :</span>{stageName}
                                        </CardText>
                                    </Col>
                                    <Col xs="12" lg="auto">
                                        <CardText className="mb-0">
                                            <span className="me-2 font-size-12">Stage Code :</span>{stageCode}
                                        </CardText>
                                    </Col>
                                    <Col xs="12" lg="auto">
                                        <CardText className="mb-0">
                                            <span className="me-2 font-size-12">Model Name :</span>{modelName}
                                        </CardText>
                                    </Col>
                                    <Col xs="12" lg="auto">
                                        <CardText className="mb-0">
                                            <span className="me-2 font-size-12">Type :</span>{type}
                                        </CardText>
                                    </Col>
                                </Row>

                                {console.log('stageInfo?.camera_selection?.cameras', stageInfo?.camera_selection?.cameras)}
                                <Col className='scrlHide' sm={6} md={6} style={{ border: '1px solid' }}>

                                    <Multiselect
                                        ref={multiselectRef}
                                        options={stageInfo?.camera_selection?.cameras || []}
                                        selectedValues={multiselectedCameras}
                                        onSelect={onSelectValues}
                                        onRemove={onRemove}
                                        displayValue="label"
                                        closeOnSelect={false}
                                        placeholder="Select cameras..."
                                    />

                                </Col>

                                <Col xs="12" lg="auto" className="text-center d-flex gap-2 justify-content-center">
                                    <Button
                                        color="primary"
                                        className="my-auto shadow-sm btn btn-sm d-flex align-items-center"
                                        onClick={() => gotoCompModelCreation(compModelVerInfo)}
                                        disabled={multiselectedCameras.length === 0}
                                    >
                                        <i className="bx bx-list-plus me-1" style={{ fontSize: '18px' }} />
                                        CREATE NEW VERSION
                                    </Button>

                                    <Button
                                        color="primary"
                                        className="my-auto shadow-sm btn btn-sm d-flex align-items-center"
                                        onClick={() => gotoVersionImgCap(compModelInfo)}
                                    >
                                        <i className="bx bx-camera me-1" style={{ fontSize: '18px' }} />
                                        IMAGE CAPTURE
                                    </Button>
                                </Col>

                            </Row>
                            {versionLoading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                                    <Spinner color="primary" />
                                    <h5 className="mt-4">
                                        <strong>Loading versions...</strong>
                                    </h5>
                                </div>
                            ) : compModelVerInfo.length === 0 ? (
                                <div className="container" style={{ position: 'relative', height: '20vh' }}>
                                    <div className="text-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} >
                                        <h5 className="text-secondary">Please select the camera then create new version</h5>
                                    </div>
                                </div>
                            ) : refresh ? (
                                <div className='table-response overflow-auto'>
                                    <Table className="table mb-0 align-middle table-nowrap table-check" bordered>

                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ textAlign: "center" }}>
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        checked={selectAllCameras}
                                                        onChange={(e) => handleSelectAllCameras(e.target.checked)}
                                                    />
                                                </th>

                                                <th>S. No.</th>
                                                <th>Model Version</th>
                                                <th>Model Status</th>
                                                <th>QC Suggestion Available</th>
                                                <th>Camera</th> {/* 👈 Always show camera name here */}
                                                {compModelVerList.length > 0 && compModelVerList[0].type !== 'ML' && (
                                                    <th>Training Cycle Count</th>
                                                )}
                                                <th>Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {
                                                console.log('currentItems', currentItems)
                                            }


                                            {


                                                filteredItems.map((data, index) => {

                                                    const okCount = data.datasets.filter((dataset) => dataset.type === 'OK').length;
                                                    const notokCount = data.datasets.filter((dataset) => dataset.type === 'NG').length;

                                                    const isInactive = data.model_status === 'Inactive';
                                                    const isTrainingInProgress = data.training_status === 'training_in_progress';
                                                    const isAdminApproved = data.training_status === 'admin approved trained model';
                                                    const isTrainingNotStarted = data.training_status === 'training_not_started';
                                                    const isTrainingCompleted = data.training_status === 'training completed';
                                                    const isRetrain = data.training_status === 'training_queued';
                                                    const isAdminAccuracyInProgress = data.training_status === 'admin accuracy testing in_progress';
                                                    const isApprovedTrainedModel = data.model_status !== 'Live' && isAdminApproved;
                                                    const isDl = data.type !== 'ML';

                                                    const disableVersion = data.training_cycle > config[0]?.train_cycle_count;


                                                    // Camera-specific flags
                                                    const cameraStatuses = (data.camera_training_status || []).map((cam) => ({
                                                        cameraName: cam.camera_name,
                                                        isTrainingInProgress: cam.training_status === 'training_in_progress',
                                                        isAdminApproved: cam.admin_acc_test === 'admin approved trained model',
                                                        isTrainingNotStarted: cam.training_status === 'training_not_started',
                                                        isTrainingCompleted: cam.training_status === 'training completed',
                                                        isRetrain: cam.training_status === 'training_queued',
                                                        isAdminAccuracyInProgress: cam.admin_acc_test === 'admin accuracy testing in_progress',
                                                        isApprovedTrainedModel: data.model_status !== 'Live' && cam.admin_acc_test === 'admin approved trained model',
                                                    }));

                                                    return (


                                                        <tr key={index} id="recent-list" className={disableVersion ? 'disabled-row' : ''}>
                                                            {/* 👇 Checkbox only */}
                                                            <td style={{ backgroundColor: "white", textAlign: "center" }}>
                                                                {data?.camera ? (
                                                                    <input
                                                                        type="checkbox"
                                                                        className="form-check-input"
                                                                        id={`cam-${data._id}`}
                                                                        value={data?.camera.value || ""}
                                                                        checked={data?.camera.checked === true}
                                                                        onChange={(e) =>
                                                                            handleCameraToggle(
                                                                                data,
                                                                                data._id,
                                                                                data.camera.value,
                                                                                e.target.checked
                                                                            )
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <input type="checkbox" disabled />
                                                                )}
                                                            </td>

                                                            {/* S. No. */}
                                                            <td style={{ backgroundColor: "white" }}>
                                                                {index + 1 + ((currentPage - 1) * 10)}
                                                            </td>

                                                            {/* Model Version */}
                                                            <td style={{ backgroundColor: "white" }}>{'V '}{data.model_ver}</td>

                                                            {/* Model Status */}
                                                            <td style={{ backgroundColor: "white" }}>
                                                                <span className={
                                                                    data.model_status === 'Live'
                                                                        ? 'badge badge-soft-success'
                                                                        : data.model_status === 'Approved'
                                                                            ? 'badge badge-soft-warning'
                                                                            : data.model_status === 'Draft'
                                                                                ? 'badge badge-soft-info'
                                                                                : 'badge badge-soft-danger'
                                                                }>
                                                                    {data.model_status}
                                                                </span>
                                                            </td>

                                                            {/* QC Suggestion */}
                                                            <td style={{ backgroundColor: "white" }}>No</td>

                                                            {/* 👇 Camera Name column */}
                                                            <td style={{ backgroundColor: "white" }}>
                                                                {data?.camera ? data.camera.label : <span className="text-muted">No Camera</span>}
                                                            </td>

                                                            {/* Training Cycle Count (if not ML) */}
                                                            {data.type !== 'ML' && (
                                                                <td style={{ backgroundColor: "white" }}>{data.training_cycle}</td>
                                                            )}



                                                            <td style={{ backgroundColor: "white" }}>
                                                                <div className="d-flex gap-1 align-items-start" style={{ cursor: "pointer" }}>

                                                                    <>
                                                                        <Button color="primary" className='btn btn-sm' onClick={() => togXlarge(data)} data-toggle="modal" data-target=".bs-example-modal-xl" id={`log-${data._id}`}>
                                                                            Log Info
                                                                        </Button>
                                                                        <UncontrolledTooltip placement="top" target={`log-${data._id}`}>
                                                                            Log Info
                                                                        </UncontrolledTooltip>
                                                                    </>
                                                                    {data.model_status !== 'Live' ? (
                                                                        data.model_status !== 'Inactive' && (
                                                                            <>
                                                                                <Button color="primary" className='btn btn-sm' onClick={() => isEdit(data)} disabled={disableVersion} id={`edit-${data._id}`}>
                                                                                    Edit
                                                                                </Button>
                                                                                <UncontrolledTooltip placement="top" target={`edit-${data._id}`}>
                                                                                    Edit Version
                                                                                </UncontrolledTooltip>
                                                                            </>
                                                                        )
                                                                    ) : (
                                                                        <>
                                                                            <Button color="primary" className='btn btn-sm' onClick={() => isView(data)} disabled={disableVersion} id={`view-${data._id}`}>
                                                                                View
                                                                            </Button>
                                                                            <UncontrolledTooltip placement="top" target={`view-${data._id}`}>
                                                                                View Version
                                                                            </UncontrolledTooltip>
                                                                        </>
                                                                    )}
                                                                    {isInactive && (
                                                                        <>
                                                                            <Button color="success" className='btn btn-sm' onClick={() => activateModel(data, index)} disabled={disableVersion} id={`activate-${data._id}`}>
                                                                                Activate
                                                                            </Button>
                                                                            <UncontrolledTooltip placement="top" target={`activate-${data._id}`}>
                                                                                Activate Version
                                                                            </UncontrolledTooltip>
                                                                        </>
                                                                    )}
                                                                    {!isInactive && !isTrainingInProgress && !isAdminApproved && (
                                                                        isTrainingCompleted ? (
                                                                            <>
                                                                                <Button
                                                                                    color="success"
                                                                                    className="btn btn-sm"
                                                                                    onClick={() => startAdminTest(data, index)}
                                                                                    disabled={disableVersion}
                                                                                    id={`admin-test-${data._id}`}
                                                                                >
                                                                                    Start Admin Accuracy Test
                                                                                </Button>
                                                                                <UncontrolledTooltip placement="top" target={`admin-test-${data._id}`}>
                                                                                    Start Admin Accuracy Test
                                                                                </UncontrolledTooltip>
                                                                            </>
                                                                        ) : (() => {
                                                                            if (isAdminAccuracyInProgress || !isTrainingNotStarted || !isDl) return null;

                                                                            const { result_mode, _id } = data;
                                                                            const minOk = Number(config[0]?.min_ok_for_training);
                                                                            const minNotOk = Number(config[0]?.min_notok_for_training);

                                                                            const canTrain =
                                                                                (result_mode === "both" && okCount >= minOk && notokCount >= minNotOk) ||
                                                                                (result_mode === "ok" && okCount >= minOk) ||
                                                                                (result_mode === "ng" && notokCount >= minNotOk);

                                                                            return canTrain ? (
                                                                                <>
                                                                                    <Button
                                                                                        color="primary"
                                                                                        className="btn btn-sm"
                                                                                        onClick={() => train(data, index)}
                                                                                        disabled={disableVersion}
                                                                                        id={`train-${_id}`}
                                                                                    >
                                                                                        Train
                                                                                    </Button>
                                                                                    <UncontrolledTooltip placement="top" target={`train-${_id}`}>
                                                                                        Train
                                                                                    </UncontrolledTooltip>
                                                                                </>
                                                                            ) : null;
                                                                        })()
                                                                    )}

                                                                    {isAdminAccuracyInProgress && (
                                                                        disableVersion ?
                                                                            <div>
                                                                                <>
                                                                                    <Button color="success" className='btn btn-sm' onClick={() => startAdminTest(data, index)} disabled={disableVersion} id={`continue-${data._id}`}>
                                                                                        Continue
                                                                                    </Button>
                                                                                    <UncontrolledTooltip placement="top" target={`continue-${data._id}`}>
                                                                                        Continue Testing
                                                                                    </UncontrolledTooltip>
                                                                                </>
                                                                                <p>Admin Accuracy Testing In_Progress</p>
                                                                            </div>
                                                                            :
                                                                            <div>
                                                                                <>
                                                                                    <Button color="success" className='btn btn-sm' onClick={() => startAdminTest(data, index)} id={`continue-${data._id}`}>
                                                                                        Continue
                                                                                    </Button>
                                                                                    <UncontrolledTooltip placement="top" target={`continue-${data._id}`}>
                                                                                        Continue Testing
                                                                                    </UncontrolledTooltip>
                                                                                </>
                                                                                <p>Admin Accuracy Testing In_Progress</p>
                                                                            </div>
                                                                    )}

                                                                    {isTrainingInProgress && data.model_status !== 'Live' && (
                                                                        <div className="w-100">
                                                                            {data.training_status_id === 0 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="primary" value={100} animated>Loading...</Progress></Progress>}
                                                                            {data.training_status_id === 1 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={20}>20%</Progress><Progress bar color="primary" value={80} animated></Progress></Progress>}
                                                                            {data.training_status_id === 2 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={40}>40%</Progress><Progress bar color="primary" value={60} animated></Progress></Progress>}
                                                                            {data.training_status_id === 3 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={60}>60%</Progress><Progress bar color="primary" value={40} animated></Progress></Progress>}
                                                                            {data.training_status_id === 4 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={80}>80%</Progress><Progress bar color="primary" value={20} animated></Progress></Progress>}
                                                                            {data.training_status_id === 5 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={100}>100%</Progress></Progress>}
                                                                            <div style={{ 'textAlign': 'center' }}>{data.training_start_time ? clock(data.training_start_time) : 'Training started ...'}</div>
                                                                            <div className='d-flex gap-1 justify-content-center'>
                                                                                Training In Progress
                                                                                <div className="dot-loader">
                                                                                    <div className="dot"></div>
                                                                                    <div className="dot"></div>
                                                                                    <div className="dot"></div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {isRetrain &&
                                                                        <div className="w-100">
                                                                            <Progress multi style={{ height: '17px', fontWeight: 'bold' }}>
                                                                                <Progress bar color="primary" value={100} animated>
                                                                                    Training In Queue
                                                                                </Progress>
                                                                            </Progress>
                                                                        </div>
                                                                    }

                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            }
                                        </tbody>
                                    </Table>
                                    <PaginationComponent
                                        totalItems={compModelVerList.length}
                                        itemsPerPage={itemsPerPage}
                                        currentPage={currentPage}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            ) : null}

                        </CardBody>
                    </Card>
                </Container>

                {/* Modal 1 - version log */}
                {/* <Modal size="xl" isOpen={modalXlarge} toggle={togXlarge} scrollable={true}>
                    <div className="modal-header">
                        <h5 className="modal-title mt-0" id="myExtraLargeModalLabel">Version Log</h5>
                        <Button onClick={() => setModalXlarge(false)} type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </Button>
                    </div>
                    <div className="table-responsive">
                        <Table striped>
                            <thead>
                                <tr>
                                    <th>Date and time</th>
                                    <th>Stage name</th>
                                    <th>Stage code</th>
                                    <th>Model Name</th>
                                    <th>Model Version</th>
                                    <th>Screen Name</th>
                                    <th>Actions</th>
                                    <th>Activity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logData.map((data, index) => (
                                    <tr key={index}>
                                        <td>{data.date_time}</td>
                                        <td>{data.comp_name}</td>
                                        <td>{data.comp_code}</td>
                                        <td>{data.model_name}</td>
                                        <td>{data.model_version}</td>
                                        <td>{data.screen_name}</td>
                                        <td>{data.action}</td>
                                        <td><JsonTable json={data.report_data[0]} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                    <div className="modal-footer">
                        <Button type="button" className="btn btn-secondary" onClick={() => setModalXlarge(false)}>Close</Button>
                    </div>
                </Modal> */}

                <Modal size="xl" isOpen={modalXlarge} toggle={() => setModalXlarge(false)} scrollable>
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title mb-0">
                            <i className="mdi mdi-history me-2"></i> Version Log
                        </h5>
                        <Button
                            onClick={() => setModalXlarge(false)}
                            type="button"
                            className="btn-close btn-close-white"
                            aria-label="Close"
                        ></Button>
                    </div>

                    <div className="modal-body">
                        <div className="table-responsive">
                            <Table bordered className="align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Date & Time</th>
                                        <th>Stage Name</th>
                                        <th>Stage Code</th>
                                        <th>Model Name</th>
                                        <th>Model Version</th>
                                        <th>Screen Name</th>
                                        <th>Action</th>
                                        <th>Activity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logData.length > 0 ? (
                                        logData.map((data, index) => (
                                            <React.Fragment key={index}>
                                                <tr>
                                                    <td style={{
                                                        backgroundColor: expandedRow === index ? "#d6d9f9" : "white",
                                                    }} >{data.date_time}</td>
                                                    <td style={{
                                                        backgroundColor: expandedRow === index ? "#d6d9f9" : "white",
                                                    }}>{data.comp_name}</td>
                                                    <td style={{
                                                        backgroundColor: expandedRow === index ? "#d6d9f9" : "white",
                                                    }}>{data.comp_code}</td>
                                                    <td style={{
                                                        backgroundColor: expandedRow === index ? "#d6d9f9" : "white",
                                                    }}>{data.model_name}</td>
                                                    <td style={{
                                                        backgroundColor: expandedRow === index ? "#d6d9f9" : "white",
                                                    }}>{data.model_ver}</td>
                                                    <td style={{
                                                        backgroundColor: expandedRow === index ? "#d6d9f9" : "white",
                                                    }} >{data.screen_name}</td>
                                                    <td style={{
                                                        backgroundColor: expandedRow === index ? "#d6d9f9" : "white",
                                                    }}>
                                                        <span className="badge bg-info text-dark">{data.action}</span>
                                                    </td>
                                                    <td
                                                        style={{
                                                            backgroundColor: expandedRow === index ? "#d6d9f9" : "white",
                                                        }}
                                                    >
                                                        {data.report_data && data.report_data.length > 0 ? (
                                                            <Button
                                                                color={expandedRow === index ? "info" : "primary"}
                                                                size="sm"
                                                                className="d-flex align-items-center"
                                                                onClick={() => toggleRow(index)}
                                                            >
                                                                {expandedRow === index ? (
                                                                    <>
                                                                        Hide Info{" "}
                                                                        <i
                                                                            className="bx bx-chevron-up ms-1"
                                                                            style={{ fontSize: "20px" }}
                                                                        ></i>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        View Info{" "}
                                                                        <i
                                                                            className="bx bx-chevron-down ms-1"
                                                                            style={{ fontSize: "20px" }}
                                                                        ></i>
                                                                    </>
                                                                )}
                                                            </Button>
                                                        ) : (
                                                            <span className="text-muted small">No Data</span>
                                                        )}
                                                    </td>
                                                </tr>

                                                {expandedRow === index && (
                                                    <tr>
                                                        <td colSpan="8" style={{
                                                            backgroundColor:
                                                                expandedRow === index
                                                                    ? "#d6d9f9"
                                                                    : "white",
                                                            border: "1px solid lightgrey",
                                                        }}>
                                                            {data.report_data.map((item, idx) => (
                                                                <Table bordered size="sm" key={idx} style={{ border: "1px solid lightgrey", marginTop: "5px", width: "100%" }}>
                                                                    <tbody>
                                                                        {Object.entries(item).map(([key, value], i) => (
                                                                            <tr key={i}>
                                                                                <td style={{ fontWeight: "bold", padding: "5px", border: "1px solid lightgrey" }}>{key}</td>
                                                                                <td style={{ border: "1px solid lightgrey", padding: "5px" }}>{renderValue(value)}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </Table>
                                                            ))}
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center text-muted py-3">
                                                No log data available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <Button color="secondary" onClick={() => setModalXlarge(false)}>
                            Close
                        </Button>
                    </div>
                </Modal>
                <Modal isOpen={infoModal} toggle={closeInfoView} size="md" centered>
                    <div className="modal-header bg-light">
                        <h5 className="modal-title">Activity Details</h5>
                        <Button
                            type="button"
                            className="btn-close"
                            aria-label="Close"
                            onClick={closeInfoView}
                        ></Button>
                    </div>
                    <div className="modal-body">
                        {selectedData && Object.keys(selectedData).length > 0 ? (
                            <Table bordered size="sm">
                                <tbody>
                                    {Object.entries(selectedData).map(([key, value], i) => (
                                        <tr key={i}>
                                            <th style={{ width: "40%" }}>{key}</th>
                                            <td>{String(value)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <p className="text-muted mb-0">No data available</p>
                        )}
                    </div>
                    <div className="modal-footer">
                        <Button color="secondary" onClick={closeInfoView}>
                            Close
                        </Button>
                    </div>
                </Modal>


                {/* Modal 2 - training cycle limit */}
                {reTrain && (
                    <SweetAlert
                        title="Your ReTrain Limit Exceeded"
                        confirmBtnText="OK"
                        onConfirm={reTrainLimit}
                        style={{ zIndex: 1000 }}
                    >
                        <div className='mt-2'>
                            Training has been attempted more than {config[0]?.train_cycle_count} times
                        </div>
                    </SweetAlert>
                )}

                {/* Modal 3 - select admin testing option */}
                {showTestingOptions && (
                    <AdminTestingOptions
                        isOpen={showTestingOptions}
                        toggle={closeAdminTestOptions}
                        onContinue={continueAdminTest}
                        rectangles={componentInfo?.rectangles}
                        selectedVersiondata={selectedVersion}
                    />
                )}
            </div >
        </>
    );
};

StageModelVerInfo.propTypes = {
    history: PropTypes.any.isRequired
};

export default StageModelVerInfo;
