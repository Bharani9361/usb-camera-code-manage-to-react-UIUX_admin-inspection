import React, { Component } from 'react';
import { Container, CardTitle, Button, Table, Label, Progress, Row, Card, Modal, Col, CardBody, CardText, Spinner, UncontrolledTooltip } from 'reactstrap';
import urlSocket from './urlSocket';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import moment from 'moment';
import Swal from 'sweetalert2';
import "./Css/style.css"
import { JsonTable } from 'react-json-to-html';
import Cookies from 'js-cookie';

import { error } from 'toastr';

import SweetAlert from 'react-bootstrap-sweetalert';
import PaginationComponent from './PaginationComponent';
import AdminTestingOptions from './RegionFunctions/AdminTestingOptions';
import FullScreenLoader from 'components/Common/FullScreenLoader';

export default class ModelVerInfo extends Component {
    static propTypes = { history: PropTypes.any.isRequired };

    constructor(props) {
        super(props);
        this.state = {
            comp_name: '',
            comp_code: '',
            model_name: '',
            compModelVerInfo: [],
            compModelVerList: [],
            config: [],
            showTrainingINProgs: false,
            refresh: true,
            initvalue: 1,
            modal_xlarge: false,
            log_data: [],
            ReTrain: false,
            type: '',

            currentPage: 1,
            itemsPerPage: 10,

            versionLoading: true,

            show_testing_options: false,
            selected_version: null,

            is_creating_version: false,
        };
        // Initialize an array to hold training status intervals
        this.trainingStatusIntervals = [];

        this.intervalId = null;

        this.tog_xlarge = this.tog_xlarge.bind(this)
    }

    componentDidMount() {
        const details = JSON.parse(sessionStorage.getItem('manageData'));
        const component_info = details.compInfo;

        let compModelInfo = JSON.parse(sessionStorage.getItem('compModelData'));
        console.log('compModelInfo', compModelInfo);
        this.setState({
            comp_name: compModelInfo.comp_name,
            comp_code: compModelInfo.comp_code,
            model_name: compModelInfo.model_name,
            type: compModelInfo.type,
            compModelInfo,
            component_info: component_info
        });
        this.getConfigInfo();
        this.getCompModelVerInfo(compModelInfo);
        this.getCompModelVerAllList(compModelInfo);
    }

    componentWillUnmount() {
        // Clear all training status intervals to avoid memory leaks
        this.clearTrainingStatusIntervals();

        // Clear the interval when the component is unmounted
        clearInterval(this.intervalId);
    }

    getConfigInfo = async () => {
        try {
            const response = await urlSocket.post('/config', { mode: 'no-cors' });
            const config = response.data;
            if (config.error === "Tenant not found") {
                console.log("data error", data.error);
                this.error_handler(data.error);
            }
            else {
                console.log('first39', config);
                this.setState({ config, positive: config[0].positive, negative: config[0].negative });
            }

        } catch (error) {
            console.log('error', error);
        }
    };

    getCompModelVerInfo = async (compModelInfo) => {
        console.log('compModelInfo', compModelInfo);
        try {
            const response = await urlSocket.post('/getCompModelVerInfo', { compModelInfo }, { mode: 'no-cors' });
            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                this.error_handler(response.data.error);
            }
            else {
                const compModelVerInfo = response.data;
                console.log('first28', compModelVerInfo);
                this.setState({ compModelVerInfo });
            }
        } catch (error) {
            console.log('error', error);
        }
    };

    // getCompModelVerAllList = async (compModelInfo) => {
    //     console.log('compModelInfo', compModelInfo);
    //     try {
    //         const response = await urlSocket.post('/getCompModelVerList', { compModelInfo }, { mode: 'no-cors' });
    //         const compModelVerList = response.data;
    //         console.log('compModelVerList', compModelVerList);
    //         this.setState({ compModelVerList, refresh: true });

    //         // Clear existing intervals and set new intervals for each item
    //         this.clearTrainingStatusIntervals();
    //         compModelVerList.forEach((data, index) => {
    //             // if any training_in_progress status available this.fetchTrainingStatus function called every 5 sec
    //             this.trainingStatusIntervals[index] = setInterval(() => {
    //                 this.fetchTrainingStatus(data, index);
    //             }, 5000);
    //         });
    //     } catch (error) {
    //         console.log('error', error);
    //     }
    // };

    getCompModelVerAllList = async (compModelInfo) => {
        console.log('compModelInfo', compModelInfo);
        try {
            const response = await urlSocket.post('/getCompModelVerList', { compModelInfo }, { mode: 'no-cors' });
            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                this.error_handler(response.data.error);
            }
            else {
                const compModelVerList = response.data;
                console.log('compModelVerList : ', compModelVerList);

                const compTrainingStatusMap = {};

                compModelVerList.forEach(item => {
                    const { comp_id, training_status } = item;

                    if (!compTrainingStatusMap[comp_id]) {
                        compTrainingStatusMap[comp_id] = false; // default
                    }

                    if (training_status === 'training_in_progress' || training_status === 'training_queued') {
                        compTrainingStatusMap[comp_id] = true; // mark true if found
                    }
                });

                // Save each comp_id's training status as a separate cookie
                Object.entries(compTrainingStatusMap).forEach(([compId, status]) => {
                    Cookies.set(`training_status_${compId}`, status.toString());
                });

                console.log('Training status map:', compTrainingStatusMap);


                this.setState({ compModelVerList, refresh: true });

                this.findInProgress();
            }
        } catch (error) {
            console.log('error', error);
        }
        finally {
            this.setState({ versionLoading: false })
        }
    };

    // async findInProgress() {
    //     const { compModelVerList } = this.state;

    //     clearInterval(this.intervalId);

    //     // Find the next object with in-progress training
    //     const training_version = compModelVerList.find(
    //         object =>
    //             object.training_status === 'training_in_progress' ||
    //             object.training_status === 'training_queued'
    //     );

    //     if (training_version) {
    //         console.log('Found next object with in-progress training:', training_version);

    //         // Set an interval and execute a function periodically
    //         this.intervalId = setInterval(() => {
    //             this.fetchTrainStatus(training_version);
    //         }, 5000); // Set the interval duration (in milliseconds)
    //     } else {
    //         console.log('No more objects with in-progress training found.', training_version);
    //     }
    // }


    async findInProgress() {
        const { compModelVerList } = this.state;

        clearInterval(this.intervalId);

        let training_version;

        if (compModelVerList.some(object => object.training_status === 'training_in_progress')) {
            training_version = compModelVerList.find(object => object.training_status === 'training_in_progress');
        } else if (compModelVerList.some(object => object.training_status === 'training_queued')) {
            training_version = compModelVerList.find(object => object.training_status === 'training_queued');
        }

        if (training_version) {
            console.log('Found next object with in-progress training:', training_version);

            // Set an interval and execute a function periodically
            this.intervalId = setInterval(() => {
                this.fetchTrainStatus(training_version);
            }, 5000); // Set the interval duration (in milliseconds)
        } else {
            console.log('No more objects with in-progress training found.', training_version);
        }
    }

    // train = async (data, index) => {
    //     console.log('data94', data)
    //     console.log('78', this.state.compModelVerList);
    //     const updatedCompModelVerList = [...this.state.compModelVerList];
    //     updatedCompModelVerList[index].training_status_id = 0;
    //     // updatedCompModelVerList[index].training_status = 'training_in_progress'
    //     this.setState({ compModelVerList: updatedCompModelVerList, refresh: true });
    //     // Clear the existing interval for this item
    //     this.clearTrainingStatusInterval(index);

    //     this.trainingStatusIntervals[index] = setInterval(() => this.fetchTrainingStatus(data, index), 5000);

    //     try {
    //         const response = await urlSocket.post('/Train', { compModelVerInfo: data, config: this.state.config }, { mode: 'no-cors' });
    //         console.log('first232', response.data);
    //         if (response.data === 'training completed') {
    //             updatedCompModelVerList[index].training_status_id = 4;
    //             updatedCompModelVerList[index].training_status = 'training completed';
    //             this.setState({ compModelVerList: updatedCompModelVerList, refresh: true });
    //             this.clearTrainingStatusInterval(index);
    //             Swal.fire({
    //                 title: 'Success',
    //                 text: response.data,
    //                 icon: 'success',
    //                 confirmButtonText: 'OK'
    //             })
    //         }
    //         else {
    //             Swal.fire({
    //                 title: 'Error!',
    //                 text: response.data,
    //                 icon: 'error',
    //                 confirmButtonText: 'OK'
    //             })
    //         }

    //     } catch (error) {
    //         console.log('Error starting training:', error);
    //         this.clearTrainingStatusInterval(index);
    //     }
    // };

    startTraining = async (data, index) => {
        console.log('189 Train version : ', data);

        const updatedCompModelVerList = [...this.state.compModelVerList];
        updatedCompModelVerList[index].training_status_id = 0;
        updatedCompModelVerList[index].training_status = 'training_queued';
        // Cookies.set('training_status', updatedCompModelVerList[index].training_status);
        this.setState({ compModelVerList: updatedCompModelVerList, refresh: true });

        clearInterval(this.intervalId);

        this.findInProgress();

        try {
            const response = await urlSocket.post('/Train', { compModelVerInfo: data, config: this.state.config }, { mode: 'no-cors' });
            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                this.error_handler(response.data.error);
            }
            else {
                console.log('first232', response.data);

                console.log('response.data.comp_model_data : ', response.data.comp_model_data)

                this.setState({ compModelVerList: response.data.comp_model_data })

                if (response.data === 'training completed') {
                    console.log('197 response.data.message = ', response.data.message)
                }
                else {
                    // Swal.fire({
                    //     title: 'Error!',
                    //     text: response.data.message,
                    //     icon: 'error',
                    //     confirmButtonText: 'OK'
                    // })
                }
            }
        } catch (error) {
            console.log('Error starting training:', error);
        }
    }

    train = async (data, index) => {

        // 
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger'
            },
            buttonsStyling: false
        })

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
                this.startTraining(data, index)
                swalWithBootstrapButtons.fire(
                    'Training Started',
                    'Please wait while the training process completes.',
                    'success'
                )
            } else if (
                /* Read more about handling dismissals below */
                result.dismiss === Swal.DismissReason.cancel
            ) {
                swalWithBootstrapButtons.fire(
                    'Training Canceled',
                    `You can start the training anytime when you're ready.`,
                    'error'
                )
            }
        })
        //
    };

    clock = (data) => {
        if (data && data !== '00:00:00') {
            // Your initial code
            let st_date = new Date(data).toISOString();
            var time = moment.utc(st_date).format("DD/MM/YYYY HH:mm:ss");
            let start = new Date().toString();
            var endtime = moment.utc(start).format("DD/MM/YYYY HH:mm:ss");

            // Parse the time and endtime strings into Date objects
            var startTime = moment(time, "DD/MM/YYYY HH:mm:ss");
            var endTime = moment(endtime, "DD/MM/YYYY HH:mm:ss");

            // Calculate the difference in milliseconds
            var duration = moment.duration(endTime.diff(startTime));
            console.log('344 Time : Duration : ', duration)

            // Get the days, hours, minutes, and seconds from the duration
            var days = Math.floor(duration.asDays());
            var hours = duration.hours();
            var minutes = duration.minutes();
            var seconds = duration.seconds();

            // Format the result
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
            return '00:00:00'; // Return '00:00:00' if training_start_time is empty
        }
    }

    // fetchTrainingStatus = async (data, index) => {

    //     console.log('** fetch Train Status')

    //     try {
    //         const response = await urlSocket.post('/getTrainingStatusAll', { compModelVerInfo: data }, { mode: 'no-cors' });
    //         const updatedCompModelVerList = response.data;

    //         this.setState({ compModelVerList: updatedCompModelVerList });

    //         if (updatedCompModelVerList[index].training_status === 'training completed') {
    //             updatedCompModelVerList[index].training_status_id = 4;
    //             this.clearTrainingStatusInterval(index);
    //         } else if (updatedCompModelVerList[index].training_status === 'admin approved trained model') {
    //             this.clearTrainingStatusInterval(index);
    //         } else if (updatedCompModelVerList[index].training_status !== 'training_in_progress' && updatedCompModelVerList[index].training_status !== 'retrain') {
    //             this.clearTrainingStatusInterval(index);
    //         }
    //         // this.setState({ refresh: true });
    //     } catch (error) {
    //         console.log('Error fetching training status:', error);
    //     }
    // };

    async fetchTrainStatus(in_progress_ver) {
        const { compModelInfo } = this.state;

        console.log('252 in_progress_ver : ', in_progress_ver)

        try {
            const response = await urlSocket.post('/getTrainStatus', { compModelVerInfo: in_progress_ver, compModelInfo: compModelInfo }, { mode: 'no-cors' });
            const currentversion = response.data.ids;

            console.log('258 currentversion[0] : ', currentversion[0])

            if (
                currentversion[0].training_status === 'training completed' ||
                currentversion[0].training_status === 'admin approved trained model'
            ) {
                // If condition is met, clear the interval and find the next object
                clearInterval(this.intervalId);
                // Cookies.set('training_status', currentversion[0].training_status);
                console.log('Training completed or model approved. Interval cleared.');


                // // Update the state with the new data
                // this.setState(prevState => ({
                //     compModelVerList: prevState.compModelVerList.map(item =>
                //         item.model_ver === currentversion[0].model_ver ? currentversion[0] : item
                //     )
                // }), () => {
                //     // After updating the state, find the next object
                //     this.findInProgress();
                // });

                this.setState({ compModelVerList: response.data.data_list });
                this.findInProgress();
            }
            else if (
                currentversion[0].training_status !== 'training_in_progress' &&
                currentversion[0].training_status !== 'training_queued'
            ) {
                // If condition is met, clear the interval and find the next object
                clearInterval(this.intervalId);
                console.log('Not in progress and Queue');

                // // Update the state with the new data
                // this.setState(prevState => ({
                //     compModelVerList: prevState.compModelVerList.map(item =>
                //         item.model_ver === currentversion[0].model_ver ? currentversion[0] : item
                //     )
                // }), () => {
                //     // After updating the state, find the next object
                //     this.findInProgress();
                // });

                this.setState({ compModelVerList: response.data.data_list });
                this.findInProgress();
            }
            else {
                // this.setState(prevState => ({
                //     compModelVerList: prevState.compModelVerList.map(item =>
                //         item.model_ver === currentversion[0].model_ver ? currentversion[0] : item
                //     )
                // }))
                this.setState({ compModelVerList: response.data.data_list });
            }
        } catch (error) {
            console.log('Error fetching training status:', error);
        }
    }

    // ... Other methods ...

    // Clear all training status intervals
    clearTrainingStatusIntervals = () => {
        this.trainingStatusIntervals.forEach((interval) => {
            clearInterval(interval);
        });
    };

    // Clear a specific training status interval by index
    clearTrainingStatusInterval = (index) => {
        clearInterval(this.trainingStatusIntervals[index]);
    };

    live_check = (data) => {
        try {
            urlSocket.post('/make_live_check', { 'modelData': data },
                { mode: 'no-cors' })
                .then((response) => {
                    let data1 = response.data
                    if (data1.error === "Tenant not found") {
                        console.log("data error", data1.error);
                        this.error_handler(data1.error);
                    }
                    else {
                        console.log('data521', data1)
                        if (data1 === 'another live') {
                            this.make_live(data)
                        }
                        else {
                            this.makeModelLive(data)
                        }
                    }

                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }

    make_live = (data, index) => {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger'
            },
            buttonsStyling: false
        })

        swalWithBootstrapButtons.fire({
            title: 'Are you sure?',
            text: "Another version is currently in live!!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Make Live!',
            cancelButtonText: 'No, cancel!',
            reverseButtons: true,
            allowOutsideClick: false,
            allowEnterKey: false,
        }).then((result) => {
            if (result.isConfirmed) {
                this.makeModelLive(data, index)
                swalWithBootstrapButtons.fire(
                    'LIVE!!',
                    'This Version is Live Now!',
                    'success'
                )
            } else if (
                /* Read more about handling dismissals below */
                result.dismiss === Swal.DismissReason.cancel
            ) {
                swalWithBootstrapButtons.fire(
                    'Cancelled',
                    'This version is in Approved but not in Live',
                    'error'
                )
            }
        })
    }

    // Define the method to handle making the model live
    makeModelLive = async (data, index) => {
        console.log('data203', data)
        try {
            const response = await urlSocket.post('/ManageModel_live', { 'modelData': data }, { mode: 'no-cors' });
            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                this.error_handler(response.data.error);
            }
            else {
                const modelLive = response.data;
                this.setState({ compModelVerList: modelLive });
            }
        } catch (error) {
            console.log('Error making model live:', error);
        }
    }

    // bala changed it on 06/10/23

    activateModel = async (data, index) => {
        try {
            const response = await urlSocket.post('/model_ver_activate', { 'modelData': data }, { mode: 'no-cors' });
            const modelLive = response.data;
            if (modelLive.error === "Tenant not found") {
                console.log("data error", modelLive.error);
                this.error_handler(modelLive.error);
            }
            else {
                console.log('activateModel234', modelLive)
                if (modelLive === "Another Live") {
                    console.log('if statements works 282')
                    const swalWithBootstrapButtons = Swal.mixin({
                        customClass: {
                            confirmButton: 'btn btn-success',
                            cancelButton: 'btn btn-danger'
                        },
                        buttonsStyling: false
                    })

                    swalWithBootstrapButtons.fire({
                        title: 'Are you sure?',
                        text: "Another version is Live,Can we Make this as  Approved?",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No, cancel!',
                        reverseButtons: true
                    }).then((result) => {
                        if (result.isConfirmed) {
                            this.activateModel_approv(data, index)
                            swalWithBootstrapButtons.fire(
                                'Approved!!',
                                'This model is in Approved',
                                'success'
                            )
                        } else if (
                            /* Read more about handling dismissals below */
                            result.dismiss === Swal.DismissReason.cancel
                        ) {
                            swalWithBootstrapButtons.fire(
                                'Cancelled',
                                'Deactivation cancelled',
                                'error'
                            )
                        }
                    })
                }
                else {
                    this.setState({ compModelVerList: modelLive });
                }

                // Perform any additional actions needed when the model is deactivated
            }

        } catch (error) {
            console.log('Error activating model:', error);
        }
    }

    activateModel_approv = async (data, index) => {
        try {
            const response = await urlSocket.post('/model_ver_approv_activate', { 'modelData': data }, { mode: 'no-cors' });
            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                this.error_handler(response.data.error);
            }
            else {
                const modelLive = response.data;
                console.log('deactivateModel221', modelLive)
                this.setState({ compModelVerList: modelLive });

                // Perform any additional actions needed when the model is deactivated
            }

        } catch (error) {
            console.log('Error deactivating model:', error);
        }
    }

    deactivate = (data, index) => {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger'
            },
            buttonsStyling: false
        })

        swalWithBootstrapButtons.fire({
            title: 'Are you sure?',
            text: "Do You want to Deactivate this?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Deactivate!',
            cancelButtonText: 'No, cancel!',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                this.deactivateModel(data, index)
                swalWithBootstrapButtons.fire(
                    'Deactivated!!',
                    'This model is deactivated now',
                    'success'
                )
            } else if (
                /* Read more about handling dismissals below */
                result.dismiss === Swal.DismissReason.cancel
            ) {
                swalWithBootstrapButtons.fire(
                    'Cancelled',
                    'Deactivation cancelled',
                    'error'
                )
            }
        })
    }

    deactivateModel = async (data, index) => {
        try {
            const response = await urlSocket.post('/model_ver_deactivate', { 'modelData': data }, { mode: 'no-cors' });
            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                this.error_handler(response.data.error);
            }
            else {
                const modelLive = response.data;
                console.log('deactivateModel221', modelLive)
                this.setState({ compModelVerList: modelLive });

                // Perform any additional actions needed when the model is deactivated
            }

        } catch (error) {
            console.log('Error deactivating model:', error);
        }
    }
    //  end upto this

    CloseAdminTestOptions = () => {
        this.setState({ show_testing_options: false });
    }

    ContinueAdminTest = (selected_options) => {
        this.setState({ show_testing_options: false });
        console.log('selected options: ', selected_options);

        const data = JSON.parse(JSON.stringify(this.state.selected_version));

        this.GoToAdminTestingPage(data, selected_options);
    }

    StartAdminTest = async (data, index) => {
        const details = JSON.parse(sessionStorage.getItem('manageData'));
        const model_info = details.modelInfo;

        const ask_testing_type = model_info.find(model =>
            model._id === data.model_id && model.region_testing === true
        ) !== undefined;
        console.log('ask_testing_type', ask_testing_type);


        if (ask_testing_type) {
            this.setState({
                show_testing_options: true,
                selected_version: data
            });
        } else {
            this.GoToAdminTestingPage(data);
        }
        // Redirect to the test page
        // window.location.href = '/adminAccTesting';
        // console.log('compModelverInfo271', data)

        // if (data.result_mode === "ok") {
        //     Swal.fire({
        //         title: "This is an OK Model",
        //         text: "Test only with OK images to get better accuracy",
        //         icon: "info",
        //         confirmButtonText: "OK"
        //     });
        // } else if (data.result_mode === "ng") {
        //     Swal.fire({
        //         title: "This is an NG Model",
        //         text: "Test only with NG images to get better accuracy",
        //         icon: "warning",
        //         confirmButtonText: "OK"
        //     });
        // }


        // let count = this.state.initvalue
        // let compModelverInfo = {
        //     config: this.state.config,
        //     testCompModelVerInfo: data,
        //     batch_no: count++,
        //     page: 'modelverinfo'
        // }
        // // Save the data to localStorage
        // sessionStorage.removeItem("modelData")
        // localStorage.setItem('modelData', JSON.stringify(compModelverInfo));

        // console.log('values ', compModelverInfo);

        // this.props.history.push('/adminAccTesting');

        // // Redirect to the test page
        // // window.location.href = '/adminAccTesting';
    }

    GoToAdminTestingPage = (version_data, options = []) => {
        if (version_data.result_mode === "ok") {
            Swal.fire({
                title: "This is an OK Model",
                text: "Test only with OK images to get better accuracy",
                icon: "info",
                confirmButtonText: "OK"
            });
        } else if (version_data.result_mode === "ng") {
            Swal.fire({
                title: "This is an NG Model",
                text: "Test only with NG images to get better accuracy",
                icon: "warning",
                confirmButtonText: "OK"
            });
        }

        let count = this.state.initvalue
        let values = {
            config: this.state.config,
            testCompModelVerInfo: version_data,
            batch_no: count++,
            page: 'modelverinfo'
        }

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

            // include object detection method and regions
            if (options?.testing_mode.includes("region_testing")) {
                values.detection_type = options.detection_type;
                values.regions = options.regions;
            }
        }
        console.log('values123 ', this.state.config);

        sessionStorage.removeItem("modelData")
        localStorage.setItem('modelData', JSON.stringify(values));
        this.props.history.push('/adminAccTesting');
    }

    // gotoCompModelCreation = async () => {
    //     const { history } = this.props;
    //     const {compModelInfo } = this.state;
    //     try {
    //         const response = await urlSocket.post('/compModel_ver_info', { 'compModelInfo': compModelInfo }, { mode: 'no-cors' });
    //         const compModelVerInfo = response.data;
    //         console.log('first20', compModelVerInfo)           
    //         sessionStorage.removeItem("compModelVInfo")
    //         sessionStorage.setItem("compModelVInfo", JSON.stringify(compModelVerInfo))
    //         history.push("/modelCreation");
    //     } catch (error) {
    //         console.log('error', error)
    //     }
    // }


    gotoCompModelCreation = async (compModelVerInfo) => {
        this.setState({ is_creating_version: true })
        const { history } = this.props;
        const { compModelVerList, compModelInfo } = this.state;
        console.log('compModelVerInfo', compModelVerInfo)

        const performModelCreation = async () => {
            console.log('compModelInfocompModelInfocompModelInfo', compModelInfo)
            try {
                const response = await urlSocket.post('/compModel_ver_info', { compModelInfo }, { mode: 'no-cors' });
                const compModelVerInfo = response.data;
                console.log('compModelVerInfo887', compModelVerInfo)
                if (compModelVerInfo.error === "Tenant not found") {
                    console.log("data error", compModelVerInfo.error);
                    this.error_handler(compModelVerInfo.error);
                }
                else {
                    const data = {
                        versionInfo: compModelVerInfo,
                        versionCount: compModelVerList.length
                    }

                    sessionStorage.removeItem("compModelVInfo")
                    sessionStorage.setItem("compModelVInfo", JSON.stringify(data));
                    history.push("/modelCreation");
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        const isTrainingCompleted =
            compModelVerList.slice(-1)[0]?.training_status === 'training completed' ||
            compModelVerList.slice(-1)[0]?.training_status === 'admin approved trained model';

        // // 16-02-24
        // compModelVerList.length === 0 || isTrainingCompleted ?
        await performModelCreation();
        this.setState({ is_creating_version: false })
        // : (() => {
        //     console.log('Previous Version Training is not Completed');
        //     // // 16-02-24
        //     // // Open modal window to show message
        //     // this.setState({ modal: true });
        //     // setTimeout(() => this.setState({ modal: false }), 4000);


        //     // 16-02-24 corrected code.
        //     Swal.fire({
        //         title: 'Previous Version Training is not Completed',
        //         timer: 4000, // Set timer for 4 seconds
        //         icon: 'warning',
        //         timerProgressBar: true,
        //     });

        // })();

    };

    isEdit = (compModelVerInfo) => {
        console.log('/compModelVerInfo ', compModelVerInfo);
        const { compModelVerList } = this.state;
        const { history } = this.props;
        const data = {
            versionInfo: compModelVerInfo,
            versionCount: compModelVerList.length
        }
        // history.push("/modelCreation", { compModelVInfo: compModelVerInfo });
        sessionStorage.removeItem("compModelVInfo")
        sessionStorage.setItem("compModelVInfo", JSON.stringify(data))
        history.push("/modelCreation");
    }

    isView = (compModelVerInfo) => {
        const { compModelVerList } = this.state;
        const { history } = this.props;

        const data = {
            versionInfo: compModelVerInfo,
            versionCount: compModelVerList.length
        }

        sessionStorage.removeItem("compModelVInfo")
        sessionStorage.setItem("compModelVInfo", JSON.stringify(data))
        history.push("/modelCreation");
    }

    tog_xlarge = (data) => {
        this.setState(prevState => ({
            modal_xlarge: !prevState.modal_xlarge,
        }))
        this.log(data)
        this.removeBodyCss()
    }

    removeBodyCss() {
        document.body.classList.add("no_padding")
    }

    log = (data) => {
        console.log('687 data : ', data)
        try {
            urlSocket.post('/model_version_log_info',
                {
                    'comp_name': data.comp_name,
                    'comp_code': data.comp_code,
                    'model_name': data.model_name,
                    'model_version': data.model_ver
                }, { mode: 'no-cors' })
                .then((response) => {
                    let data1 = response.data
                    if (data1.error === "Tenant not found") {
                        console.log("data error", data1.error);
                        this.error_handler(data1.error);
                    }
                    else {
                        console.log('698 log info : ', data1)
                        this.setState({ log_data: data1 })
                    }

                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }


    printCons() {
        console.log('** compModelVerList : ', this.state.compModelVerList)
        console.log('** config : ', this.state.config)
    }

    printRowCont(data) {
        console.log('** compModelVer : ', data)
    }



    startRetrain(data, index) {
        const { compModelVerList } = this.state;

        console.log('* compModelVerList ', compModelVerList)
    }



    reTrainLimit = () => {
        this.setState({ ReTrain: false })
    }

    sampleFuncInLoop(data, index) {
        // console.log('*** printed data, index : ', data, index)
        // console.log('*** this.trainingStatusIntervals[index] : ', this.trainingStatusIntervals[index])

        console.log('**  index : ', index)
    }

    back = () => {
        this.props.history.push('/manageModel');
    }

    handlePageChange = (pageNumber) => {
        this.setState({ currentPage: pageNumber });
    };

    error_handler = (error) => {
        sessionStorage.removeItem("authUser");
        this.props.history.push("/login");
    }

    render() {
        const { compModelVerInfo, compModelVerList, config, refresh, log_data } = this.state;
        // pagination
        const { currentPage, itemsPerPage } = this.state;   // expandedRow, searchQuery,

        // Calculate indices for slicing the component list
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = compModelVerList.slice(indexOfFirstItem, indexOfLastItem);
        return (
            <>
                {
                    this.state.is_creating_version ?
                        <FullScreenLoader />
                        : null
                }
                <div className='page-content'>
                    <Row className="mb-3">
                        <Col xs={9}>
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="mb-0 mt-2 m-2 font-size-14 fw-bold">COMPONENT MODEL VERSION INFORMATION</div>
                            </div>
                        </Col>
                        <Col xs={3} className='d-flex align-items-center justify-content-end'>
                            <button className='btn btn-outline-primary btn-sm me-2' color="primary" onClick={() => this.back()}>Back <i className="mdi mdi-arrow-left"></i></button>
                        </Col>
                    </Row>

                    <Container fluid={true}>
                        <Card>
                            <CardBody>
                                <Row className="d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-2 mb-2">
                                    <Col xs="12" lg="auto" className="text-left">
                                        <CardTitle className="mb-0 "><span className="me-2 font-size-12">Component Name :</span>{this.state.comp_name}</CardTitle>
                                        <CardText className="mb-0"><span className="me-2 font-size-12">Component Code :</span>{this.state.comp_code}</CardText>
                                        <CardText className="mb-0"><span className="me-2 font-size-12">Model Name:</span>{this.state.model_name}</CardText>
                                        <CardText className="mb-0"><span className="me-2 font-size-12">Type:</span>{this.state.type}</CardText>
                                    </Col>
                                    <Col xs="12" lg="auto" className="text-center">
                                        <Button color="primary" className="my-auto shadow-sm btn btn-sm d-flex align-items-center" onClick={() => this.gotoCompModelCreation(compModelVerInfo)}>
                                            <i className="bx bx-list-plus me-1" style={{ fontSize: '18px' }} />
                                            CREATE NEW VERSION
                                        </Button>
                                    </Col>
                                </Row>
                                {
                                    this.state.versionLoading ?
                                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                                            <Spinner color="primary" />
                                            <h5 className="mt-4">
                                                <strong>Loading versions...</strong>
                                            </h5>
                                        </div>
                                        :
                                        compModelVerInfo.length === 0 ?
                                            <div className="container" style={{ position: 'relative', height: '20vh' }}>
                                                <div className="text-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} >
                                                    <h5 className="text-secondary">Model Version Not Available</h5>
                                                </div>
                                            </div>
                                            :
                                            refresh ?
                                                <div className='table-response overflow-auto'>
                                                    <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th>S. No.</th>
                                                                <th>Model Version</th>
                                                                <th>Model Status</th>
                                                                <th>QC Suggestion Available</th>
                                                                {compModelVerList.length > 0 && compModelVerList[0].type !== 'ML' && (
                                                                    <th>Training Cycle Count</th>
                                                                )}
                                                                <th>Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {currentItems.map((data, index) => {
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

                                                                return (
                                                                    <tr key={index} id="recent-list" className={disableVersion ? 'disabled-row' : ''}>
                                                                        <td style={{ backgroundColor: "white" }}>{index + 1 + ((currentPage - 1) * 10)}</td>
                                                                        <td style={{ backgroundColor: "white" }}>{'V '}{data.model_ver}</td>
                                                                        <td style={{ backgroundColor: "white" }}>
                                                                            <span className={data.model_status === 'Live' ? 'badge badge-soft-success' : data.model_status === 'Approved' ? 'badge badge-soft-warning' : data.model_status === 'Draft' ? 'badge badge-soft-info' : 'badge badge-soft-danger'}>
                                                                                {data.model_status}
                                                                            </span>
                                                                        </td>
                                                                        <td style={{ backgroundColor: "white" }}>No</td>
                                                                        {data.type !== 'ML' ?
                                                                            <td style={{ backgroundColor: "white" }}>{data.training_cycle}</td>
                                                                            : null}
                                                                        <td style={{ backgroundColor: "white" }}>
                                                                            <div className="d-flex gap-1 align-items-start" style={{ cursor: "pointer" }}>

                                                                                <>
                                                                                    <Button color="primary" className='btn btn-sm' onClick={() => this.tog_xlarge(data)} data-toggle="modal" data-target=".bs-example-modal-xl" id={`log-${data._id}`}>
                                                                                        Log Info
                                                                                    </Button>
                                                                                    <UncontrolledTooltip placement="top" target={`log-${data._id}`}>
                                                                                        Log Info
                                                                                    </UncontrolledTooltip>
                                                                                </>
                                                                                {data.model_status !== 'Live' ? (
                                                                                    data.model_status !== 'Inactive' && (
                                                                                        <>
                                                                                            <Button color="primary" className='btn btn-sm' onClick={() => this.isEdit(data)} disabled={disableVersion} id={`edit-${data._id}`}>
                                                                                                Edit
                                                                                            </Button>
                                                                                            <UncontrolledTooltip placement="top" target={`edit-${data._id}`}>
                                                                                                Edit Version
                                                                                            </UncontrolledTooltip>
                                                                                        </>
                                                                                    )
                                                                                ) : (
                                                                                    <>
                                                                                        <Button color="primary" className='btn btn-sm' onClick={() => this.isView(data)} disabled={disableVersion} id={`view-${data._id}`}>
                                                                                            View
                                                                                        </Button>
                                                                                        <UncontrolledTooltip placement="top" target={`view-${data._id}`}>
                                                                                            View Version
                                                                                        </UncontrolledTooltip>
                                                                                    </>
                                                                                )}
                                                                                {isInactive && (
                                                                                    <>
                                                                                        <Button color="success" className='btn btn-sm' onClick={() => this.activateModel(data, index)} disabled={disableVersion} id={`activate-${data._id}`}>
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
                                                                                                onClick={() => this.StartAdminTest(data, index)}
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
                                                                                                    onClick={() => this.train(data, index)}
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
                                                                                {/* {!isTrainingInProgress && !isAdminAccuracyInProgress && !isRetrain && !isInactive && (
                                                                            <>
                                                                                <Button color="danger" className='btn btn-sm' onClick={() => this.deactivate(data, index)} disabled={disableVersion} id={`deactivate-${data._id}`}>
                                                                                    Deactivate
                                                                                </Button>
                                                                                <UncontrolledTooltip placement="top" target={`deactivate-${data._id}`}>
                                                                                    Deactivate Version
                                                                                </UncontrolledTooltip>
                                                                            </>
                                                                        )} */}

                                                                                {isAdminAccuracyInProgress && (
                                                                                    disableVersion ?
                                                                                        <div>
                                                                                            <>
                                                                                                <Button color="success" className='btn btn-sm' onClick={() => this.StartAdminTest(data, index)} disabled={disableVersion} id={`continue-${data._id}`}>
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
                                                                                                <Button color="success" className='btn btn-sm' onClick={() => this.StartAdminTest(data, index)} id={`continue-${data._id}`}>
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
                                                                                        <div style={{ 'textAlign': 'center' }}>{data.training_start_time ? this.clock(data.training_start_time) : 'Training started ...'}</div>
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
                                                            })}
                                                        </tbody>
                                                    </Table>
                                                    <PaginationComponent
                                                        totalItems={compModelVerList.length}
                                                        itemsPerPage={itemsPerPage}
                                                        currentPage={currentPage}
                                                        onPageChange={this.handlePageChange}
                                                    />
                                                </div> : null
                                }

                            </CardBody>
                        </Card>

                        {/* <div className='mt-5'>
                            <Label style={{fontSize: '18px', fontWeight: 'bold', marginTop: '0px', marginBottom: '30px'}}>
                                Component Name: {this.state.comp_name} , Component Code: {this.state.comp_code} , Model Name: {this.state.model_name},Type:{this.state.type}
                            </Label>
                        </div> */}
                    </Container>

                    {/* Modal 1 - version log */}
                    <Modal size="xl" isOpen={this.state.modal_xlarge} toggle={this.tog_xlarge} scrollable={true}>
                        <div className="modal-header">
                            <h5 className="modal-title mt-0" id="myExtraLargeModalLabel">Version Log</h5>
                            <Button onClick={() => this.setState({ modal_xlarge: false })} type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </Button>
                        </div>
                        <div className="table-responsive">
                            <Table striped>
                                <thead>
                                    <tr>
                                        <th>Date and time</th>
                                        {/* <th>User Info</th> */}
                                        <th>Component name</th>
                                        <th>Component code</th>
                                        <th>Model Name</th>
                                        <th>Model Version</th>
                                        <th>Screen Name</th>
                                        <th>Actions</th>
                                        <th>Activity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {log_data.map((data, index) => (
                                        <tr key={index}>
                                            <td>{data.date_time}</td>
                                            {/* <td>{data.user_info}</td> */}
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
                        {/* bala changed on 29-09-23 */}
                        <div className="modal-footer">
                            <Button type="button" className="btn btn-secondary" onClick={() => this.setState({ modal_xlarge: false })}>Close</Button>
                        </div>
                    </Modal>
                    {/* Modal 2 */}
                    <Modal isOpen={this.state.modal} centered={true}>
                        <h1 className='bx bx-error-circle'
                            style={{
                                textAlign: 'center',
                                width: '100%',
                                fontSize: '5rem',
                                color: 'red',
                                background: '#fdeded',
                                margin: 'auto',
                                padding: '1rem'
                            }}
                        >
                        </h1>
                        <h5 className='ModalStl'>Previous Version Training is not Completed</h5>
                    </Modal>

                    {/* Modal 3 - training cycle limit */}
                    {
                        this.state.ReTrain ?
                            <SweetAlert
                                title="Your ReTrain Limit Exceeded"
                                confirmBtnText="OK"
                                onConfirm={() => this.reTrainLimit()}
                                style={{ zIndex: 1000 }}
                            >
                                <div className='mt-2'>
                                    Training has been attempted more than {this.state.config[0].train_cycle_count} times
                                </div>
                                <div className=''>

                                </div>
                            </SweetAlert> : null
                    }

                    {/* Modal 4 - select admin testing option */}
                    {
                        this.state.show_testing_options ?
                            <AdminTestingOptions
                                isOpen={this.state.show_testing_options}
                                toggle={this.CloseAdminTestOptions}
                                onContinue={this.ContinueAdminTest}
                                rectangles={this.state.component_info?.rectangles}
                            />
                            : null
                    }
                </div>
            </>
        )
    }
}
