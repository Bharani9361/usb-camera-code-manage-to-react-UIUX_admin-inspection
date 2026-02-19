import React, { Component } from 'react';
import { 
    Container, CardTitle, Button, 
    Table, Label, Row, Col, 
    CardBody, Card, Modal,
    FormGroup, Input, Spinner
 } from 'reactstrap';
import Webcam from "react-webcam";
import urlSocket from "./urlSocket"
import ImageUrl from './imageUrl'
import './Css/style.css';
import CountdownTimer from "react-component-countdown-timer";
import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
// import 'antd/dist/antd.css';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Switch } from 'antd';
import PropTypes from "prop-types"
import Select from 'react-select';
var _ = require('lodash');



export default class modelAccuracyTesting extends Component {
    static propTypes = { history: PropTypes.any.isRequired }
    constructor(props) {
        super(props);
        this.state = {
            model_data: [],
            model_name: '',
            positive: '',
            negative: '',
            gotoPage: '',
            testing_duration: 10,
            allAny: '',
            config: [],
            show_timer: false,
            showresult: false,
            startCapture: true,
            manual_abort: false,
            sample_count: 0,
            train_accuracy: '0',
            res_message: '',
            response_message: '',
            msg: '',
            mssg: '',
            refImages: [],
            showresultTable: false,
            selectedOption: {}, // To track selected options
            currentModelIndex: 0,
            currentVersionIndex: 0,
            rowVisibility: {}, // Initialize an empty object
            show_summary: false,
            
            retrain_ver_count: 0,
            show_outline: false,

            outline_options:[
                {label: "White Outline"},
                {label: "Red Outline"},
                {label: "Green Outline"},
                {label: "Blue Outline"},
                {label:  "Black Outline"},
                {label: "Orange Outline"},
                {label: "Yellow Outline"},
            ],
            // default_outline:{label:'White Outline'},
            default_outline: 'White Outline',
            outline_colors: [
                "White Outline",
                // "Red Outline",
                // "Green Outline",
                "Blue Outline",
                "Black Outline",
                "Orange Outline",
                "Yellow Outline",
            ],
            outline_path:''
        }
    }

    componentDidMount = () => {
        let modelaccuracytest = JSON.parse(sessionStorage.getItem('model_info_data'));
        console.log('59 model_info_data modelAccuracyModel : ', modelaccuracytest)

        const config = modelaccuracytest.config || [];
        const model_data = modelaccuracytest.testCompModelVerInfo
        const allAny = modelaccuracytest.allAny  //abort functionality
        const gotoPage = modelaccuracytest.page
        const comp_pos = modelaccuracytest.comp_position
        let test_duration = Number(config[0].train_acc_timer_per_sample) * Number(config[0].test_samples)
        console.log('model_data[0]', model_data)
        this.showAlertTimer(parseInt(test_duration))

        this.setState({ 
            model_data, config, positive: config[0].positive, 
            negative: config[0].negative, posble_match: config[0].posble_match, 
            capture_duration: Number(config[0].countdown), 
            testing_duration: test_duration, show_timer: true, gotoPage 
        })
        this.getDatasets(model_data);
        this.new_batchInfo(model_data, config);
        this.showRefOutline(model_data[0].comp_id, comp_pos);

        if (modelaccuracytest.config[0].inspection_type === 'Manual') {
            this.cont_apiCall()
        }
        else {
            if (this.state.startCapture) {
                setTimeout(() => { this.appCall() }, 2000)
            }
        }
        
        // Add device change listener
        navigator.mediaDevices.addEventListener('devicechange', this.checkWebcam);
        // Initial check
        this.checkWebcam();

        window.addEventListener('beforeunload', this.handleBeforeUnload);
        window.addEventListener('popstate', this.handlePopState);
        window.history.pushState(null, null, window.location.pathname); // Reset the history state
    }

    componentWillUnmount() {
        // Clear the interval to avoid memory leaks
        clearInterval(this.trainingStatusInterval);
        // Remove device change listener
        navigator.mediaDevices.removeEventListener('devicechange', this.checkWebcam);

        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        window.removeEventListener('popstate', this.handlePopState);
    }

    checkWebcam = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
            if (!videoInputDevices.length) {
                this.setState({ cameraDisconnected: true }); // Show popup if no webcam is found
            } else {
                this.setState({ cameraDisconnected: false })
            }
        } catch (error) {
            console.error('Error checking devices:', error);
        }
    };

    handleBeforeUnload = (e) => {
        // Cancel the event as returning a string will prompt the browser with a default message
        e.preventDefault();
        // Standard message will be shown in most browsers if you return a string
        e.returnValue = '';

        // Your custom message
        const message = 'Are you sure you want to leave?';

        // Some browsers do not display the message, but you can return it
        return message;
    };

    handlePopState = (e) => {
        const { gotoPage } = this.state;
        // Your logic for handling the back button press goes here
        // For example, you can immediately push a new entry onto the history stack
        window.history.pushState(null, null, window.location.pathname);

        // You may choose to show a popup or perform any other action
        // For example:
        if (window.confirm('Are you sure you want to go back?')) {

            this.setState({
                startcapture: false,
                // show: false, 
                showdata: false,
                showstatus: false, showresult: false,
                manual_abort: true,
            });
            // Perform your action here, for example, navigate back
            // window.history.back();
        } else {
            // Reset the history state to prevent the user from navigating away
            window.history.pushState(null, null, window.location.pathname);
        }
    };

    showRefOutline = async (comp_id, comp_pos) => {
        console.log('data138 ', comp_id);
        if(comp_pos == 0) {
            try {
                const response = await urlSocket.post('/check_outline', {
                    'comp_id': comp_id,
                    'comp_pos': comp_pos,
                }, { mode: 'no-cors' });
                let getInfo = response.data;
                console.log('data131 ', getInfo);
                if (getInfo.show == 'yes') {
                    this.setState({
                        show_outline: true,
                        outline_checkbox: true,
                        comp_info: getInfo.comp_info,
                        outline_path: getInfo.comp_info.datasets.white_path
                    })
                } else if (getInfo.show == 'no') {
                    this.setState({ capture_fixed_refimage: true })
                }
            } catch (error) {
                console.error(error);
            }
        }
    }
    
    showOutline = () => {
        this.setState(prevState => ({
            show_outline: !prevState.show_outline
        }))
    }

    getImage = (data1) => {
        console.log("this function wokr perfectly")
        if (data1 !== undefined) {
            let baseurl = ImageUrl
            let data2 = data1.filter((img) => {
                return img.type === 'OK';
              });
            let output = ""
            if (data2.length > 0) {
                let replace = data2[0].image_path.replaceAll("\\", "/");
                let result = replace
                output = baseurl + result
            }
            return output
        }
        else {
            console.log('data1833', data1)
            return null
        }
    }

    cont_apiCall = (next) => {
        this.setState({ showstatus: false, showresult: false })
        var i = 0;
        if (this.state.startCapture) {
            next ? this.apiCall(next) : this.apiCall()
        }
        let intervalId = setInterval(() => {
            if (this.state.startCapture) {
                // this.apiCall()
            }
            i++;
        }, 1000)
        this.setState({ intervalId });
    }

    apiCall = (next) => {
        let message = 'Place the object and press start'
        console.log('message', message)
        next ? this.setState({ msg: 'Load the next object and Press Start Button', show: true }) :
            this.setState({ msg: message, show: true })
    }

    onTimeup = () => {
        this.setState({ startcapture: false, show: false, show_timer: false, timeExtend: true })
        // this.abortTesting()
    }

    onTimeupCourse = () => {
        this.setState({ timer: true })
        //this.object_detection()
        if (this.state.config[0].qr_checking === true) {
            if (this.state.config[0].qr_uniq_checking === true) {
                this.uniqness_checking()
            }
            else {
                this.uniq_object_detection()
            }
        }
        else {
            this.adminAccTestingAuto()
        }
    }

    appCall = () => {
        this.setState({ startCapture: true, timer: true, showstatus: false, showresult: false })
        let message = 'Place the object'
        console.log('message', message)
        this.setState({ mssg: message, showdata: true })
    }

    showAlertTimer = (test_duration) => {
        let second = test_duration - 20
        this.setState({ test_duration: second })
        //counttimer = setTimeout(() => {
        setTimeout(() => {
            this.setState({ extendTimer: true })
        }, second * 1000)
    }


    new_batchInfo = (model_data, config) => {
        // console.log('169modelData', model_data, config)
        try {
          urlSocket.post('/new_batch_info', { model_data, config },
            { mode: 'no-cors' })
            .then((response) => {
                let data = response.data
                console.log('178 new_batch_info : ', data)
                this.setState({
                    batch_id: data.batch_id,
                    models_res_mode: data.model_result_mode
                })
            })
            .catch((error) => {
              console.log(error)
            })
        } catch (error) {

        }
    }

    async adminAccTesting() {
        this.setState({ msg: '', show: false })
        
        try {
            const { model_data, batch_id, config } = this.state;
            const imageSrc = this.webcam.getScreenshot({ width: 1440, height: 1080});
            if(!imageSrc) {
                this.setState({ msg: "Place the object and press start", show: true });
                return;
            }
            const blob = await fetch(imageSrc).then((res) => res.blob());
            const formData = new FormData();
            const today = new Date();
            const _today = today.toLocaleDateString();
            const time = today.toLocaleTimeString().replace(/:/g, '_');
            const modelVersionListInfo = {};
            const compdata = `${model_data[0].comp_name}_${model_data[0].comp_code}_${_today}_${time}`;
            formData.append('datasets', blob, `${compdata}.png`);
            formData.append('batch_id', batch_id);
            formData.append('comp_name', model_data[0].comp_name);
            formData.append('comp_code', model_data[0].comp_code);
            formData.append('comp_id', model_data[0].comp_id);
            formData.append('model_id', model_data[0].model_id);
            formData.append('model_ver', model_data[0].trained_ver_list[0]);
            formData.append('detect_type', config[0].detection_type);
            formData.append('date', _today);
            formData.append('time', time);

            // this.setState({ msg: '', show: false })

            const objectDetectionResponse = await urlSocket.post("/object_detection_only", formData, {
                headers: {
                    "content-type": "multipart/form-data",
                },
                mode: "no-cors",
            });
            console.log('0211 D : objectDetectionResponse : ', objectDetectionResponse)
            this.setState({
                res_message: objectDetectionResponse.data.detection_result,
                showstatus: true,
                obj_collection_id: objectDetectionResponse.data.inserted_id,
            });

            if (objectDetectionResponse.data.detection_result === 'No Object Detected') {
                setTimeout(() => {
                    let message = 'Place the object and press start';
                    this.setState({ showstatus: false, showresult: false, msg: message, show: true });
                }, 1000);
            }
            else if (objectDetectionResponse.data.detection_result === 'Incorrect Object') {
                setTimeout(() => {
                    let message = 'Place the object and press start';
                    this.setState({ showstatus: false, showresult: false, msg: message, show: true });
                }, 1000);
            }
            else {

                this.setState((prevState) => ({
                    sample_count: prevState.sample_count + 1
                }));

                setTimeout(() => {
                    let Checking = "Checking ...";
                    this.setState({ res_message: Checking, showstatus: true });
                }, 1000);

                const modelDataString = JSON.stringify(model_data);
                const configDataString = JSON.stringify(config[0]);
                const today = new Date();
                const _today = today.toLocaleDateString();
                const time = today.toLocaleTimeString().replace(/:/g, '_');
                formData.append('model_data', modelDataString);
                formData.append('config', configDataString);
                formData.append('inserted_id', objectDetectionResponse.data.inserted_id);
                // formData.append('batch_id', batch_id);
                formData.append('date', _today);
                formData.append('time', time);
                formData.append('comp_id', model_data[0].comp_id);

                try {
                    const modelsAndResultsResponse = await urlSocket.post("/modelsAndResults", formData, {
                        headers: {
                            "content-type": "multipart/form-data",
                        },
                        mode: 'no-cors'
                    });

                    let modelResult = modelsAndResultsResponse.data;
                    console.log('0211 D : modelResult : ', modelResult)

                    setTimeout(() => {
                        let message = 'Place the object and press start';
                        this.setState({
                            showstatus: false, showresult: false, 
                            msg: message,
                            modelVersionListInfo: modelResult, show_version_wise_result: true
                        });
                    }, 1000);
                } catch (error) {
                    console.error(error);
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    adminAccTestingAuto = async (event) => {

        const { modelData, manual_abort, time_elapsed } = this.state;
        const { model_data, config, batch_id} = this.state;

        if (manual_abort || time_elapsed) {
            return;
        }

        // let count = this.state.initvalue1++;

        const imageSrc = this.webcam.getScreenshot({ width: 1440, height: 1080});
        if(!imageSrc) {
            return;
        }
        const blob = await fetch(imageSrc).then((res) => res.blob());
        const formData = new FormData();

        const today = new Date();
        const _today = today.toLocaleDateString();
        const time = today.toLocaleTimeString().replace(/:/g, '_');

        const compdata = `${model_data[0].comp_name}_${model_data[0].comp_code}_${_today}_${time}`;
        formData.append('datasets', blob, `${compdata}.png`);
        formData.append('batch_id', batch_id);
        formData.append('comp_name', model_data[0].comp_name);
        formData.append('comp_code', model_data[0].comp_code);
        formData.append('comp_id', model_data[0].comp_id);
        formData.append('model_id', model_data[0].model_id);
        formData.append('model_ver', model_data[0].trained_ver_list[0]);
        formData.append('detect_type', config[0].detection_type);
        formData.append('date', _today);
        formData.append('time', time);

        this.setState({ mssg: '', showdata: false})

        const response = await urlSocket.post("/object_detection_only", formData, {
            headers: {
                "content-type": "multipart/form-data",
            },
            mode: "no-cors",
        });
        
        this.setState({
            res_message: response.data.detection_result,
            showstatus: true,
            obj_collection_id: response.data.inserted_id,
        });

        if (response.data.detection_result === 'No Object Detected') {
            setTimeout(() => {
                let message = 'Place the object'
                this.setState({ 
                    startCapture: true, timer: true, showstatus: false, showresult: false,
                    mssg: message, showdata: true
                })
            }, 1000);
        }
        else if (response.data.detection_result === 'Incorrect Object') {
            setTimeout(() => {
                let message = 'Place the object'
                this.setState({ 
                    startCapture: true, timer: true, showstatus: false, showresult: false,
                    mssg: message, showdata: true
                })
            }, 1000);
        }
        else if (response.data.detection_result === "Object Detected") {

            this.setState((prevState) => ({
                sample_count: prevState.sample_count + 1
            }));
            
            setTimeout(() => {
                let Checking = "Checking ...";
                this.setState({ res_message: Checking, showstatus: true });
            }, 1000);

            const modelDataString = JSON.stringify(model_data);
            const configDataString = JSON.stringify(config[0]);
            const today = new Date();
            const _today = today.toLocaleDateString();
            const time = today.toLocaleTimeString().replace(/:/g, '_');
            formData.append('model_data', modelDataString);
            formData.append('config', configDataString);
            formData.append('inserted_id', response.data.inserted_id);
            formData.append('date', _today);
            formData.append('time', time);
            formData.append('comp_id', model_data[0].comp_id);

            try {
                const modelsAndResultsResponse = await urlSocket.post("/modelsAndResults", formData, {
                    headers: {
                        "content-type": "multipart/form-data",
                    },
                    mode: 'no-cors'
                });

                let modelResult = modelsAndResultsResponse.data;

                setTimeout(() => {
                    let message = 'Place the object and press start';
                    this.setState({
                        showstatus: false, showresult: false,
                        // msg: message,
                        modelVersionListInfo: modelResult, show_version_wise_result: true
                    });
                }, 1000);
            } catch (error) {
                console.error(error);
            }
        }
    }
    

    getDatasets = async (model_data) => {
        // const { model_data } = this.state;
        // console.log('1910D 183model_data : ', model_data)

        try {
            await urlSocket.post('/getDatasets', { 'modelData': model_data },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('408 model_data refImages : ', data)
                    this.setState({ refImages: data})
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }

    onConfirm = () => {
        this.setState({ showresultTable: false})
    }
    
    // navigateToMngModel() {
        
    //     const { batch_id, config, model_data } = this.state;
    //     const { history } = this.props;

    //     console.log('0811 581batch_id, config : ', batch_id, config, model_data)

    //     try {
    //         urlSocket.post('/manual_abort_mv',
    //             {
    //                 'batch_id': batch_id,
    //                 'comp_name': model_data[0].comp_name,
    //                 'comp_code': model_data[0].comp_code,
    //                 'positive': config[0].positive,
    //                 'negative': config[0].negative,
    //                 'posble_match': config[0].posble_match
    //             },
    //             { mode: 'no-cors' })
    //             .then((response) => {
    //                 let aborted_data = response.data
    //                 console.log("0811aborted_data_326", aborted_data)
    //                 this.setState({ auto_abort: aborted_data, showdata: false })
    //             })
    //             .catch((error) => {
    //                 console.log(error)
    //             })
    //     } catch (error) {
    //         console.log('error600 : ', error)
    //     }
        
    //     this.setState({ startCapture: false, show: false })
    //     try {
    //         urlSocket.post('/status_update', { 'model_datas': model_data, 'status': 'training completed' },
    //             { mode: 'no-cors' })
    //             .then((response) => {
    //                 let data = response.data
    //                 console.log('409abort', data)
    //                 this.setState({ startCapture: false })
    //                 history.push("/manageModel")
    //             })
    //             .catch((error) => {
    //                 console.log(error)
    //             })
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }

    async navigateToMngModel() {
        const { batch_id, config, model_data } = this.state;
        const { history } = this.props;

        console.log('0811 581batch_id, config : ', batch_id, config, model_data)

        try {
            const response = await urlSocket.post('/manual_abort_mv', {
                'batch_id': batch_id,
                'comp_name': model_data[0].comp_name,
                'comp_code': model_data[0].comp_code,
                'positive': config[0].positive,
                'negative': config[0].negative,
                'posble_match': config[0].posble_match,
                'model_data': model_data
            }, { mode: 'no-cors' });

            const aborted_data = response.data;
            console.log("0811aborted_data_326", aborted_data);
            this.setState({ auto_abort: aborted_data, showdata: false });

            // Second API call (only after the first one has completed)
            const statusResponse = await urlSocket.post('/status_update', {
                'model_datas': model_data,
                'status': 'training completed'
            }, { mode: 'no-cors' });

            const data = statusResponse.data;
            console.log('409abort', data);
            this.setState({ startCapture: false });
            history.push("/manageModel");

        } catch (error) {
            console.log('error600 : ', error);
        }

        this.setState({ startCapture: false, show: false });
    }

    renderTableRows() {
        const { modelVersionListInfo, config, models_res_mode } = this.state;

        return (
            <Modal
                size="lg"
                isOpen={true} 
                centered={true}
            >
                <div style={{ padding: '10px'}}>
                    <Table hover bordered style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                        <thead>
                            <tr>
                                <th>S.No.</th>
                                <th>Model</th>
                                <th>Versions</th>
                                <th>Training Accuracy</th>
                                <th>Accuracy Summary Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                Object.entries(modelVersionListInfo).map(([model, versions], modelIndex) => (
                                    Object.entries(versions).map(([version, data], index) => (
                                        <tr key={model + version}>
                                            {
                                                console.log('version_data587: ',data, 'model_data: ', model)
                                            }
                                            {index === 0 && (
                                                <td rowSpan={Object.keys(versions).length}>{modelIndex + 1}</td>
                                            )}
                                            {index === 0 && (
                                                <td rowSpan={Object.keys(versions).length}>{model}</td>
                                            )}
                                            <td>V{version}</td>
                                            <td style={{
                                                color:
                                                    // (((Number(data.getv_d) + Number(data.getv_e)) / config[0].test_samples) * 100 === 100)
                                                    (data.accuracy === 100)
                                                        ? 'green'
                                                        : 'red'
                                            }}>
                                                {parseFloat(data.accuracy).toFixed(2)} % {" "}
                                            </td>
                                            <td>
                                                <Button
                                                    onClick={() => this.toggleRowVisibility(`${model}-${version}`)}
                                                >
                                                    View
                                                </Button>
                                            </td>
                                            {this.state.rowVisibility[`${model}-${version}`] && (
                                                config.map((confdata, confindex) => (
                                                    <SweetAlert
                                                        title=""
                                                        confirmBtnText="Ok"
                                                        onConfirm={() => this.closeAccTable()}
                                                        style={{ zIndex: 999 }}
                                                        key={confindex}
                                                    >
                                                        <div style={{ fontWeight: 'bold' }}>
                                                            <div>
                                                                Model: {model}
                                                            </div>
                                                            <div>
                                                                Version: {version}
                                                            </div>
                                                        </div>
                                                        <Label style={{ fontWeight: 'bold' }}>
                                                            {/* Training accuracy  */}
                                                            {
                                                                models_res_mode[model].mode === "ok" ? `${confdata.positive}'s Training Accuracy ` :
                                                                    models_res_mode[model].mode === "ng" ? `${confdata.negative}'s Training Accuracy ` :
                                                                        'Training Accuracy '
                                                            } Result
                                                        </Label>
                                                        <div>
                                                            Total tested samples: {confdata.test_samples}
                                                        </div>
                                                        <div className="table-responsive">
                                                            <Table>
                                                                <thead>
                                                                    <tr>
                                                                        <th></th>
                                                                        <th>{confdata.positive}</th>
                                                                        <th>{confdata.negative}</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <tr>
                                                                        <th>System result</th>
                                                                        <td>{data.getv_a}</td>
                                                                        <td>{data.getv_b}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th>Agreed by Qc</th>
                                                                        <td>{data.getv_d}</td>
                                                                        <td>{data.getv_e}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th>Disagreed byn Qc</th>
                                                                        <td>{data.getv_g}</td>
                                                                        <td>{data.getv_h}</td>
                                                                    </tr>
                                                                </tbody>
                                                            </Table>
                                                        </div>
                                                        {/* <div>{confdata.posble_match}: {data.getv_c} </div>
                                                        <div>
                                                            <Table>
                                                                <thead>
                                                                    <tr>
                                                                        <th></th>
                                                                        <th>{confdata.positive}</th>
                                                                        <th>{confdata.negative}</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <tr>
                                                                        <th>Qc Selection</th>
                                                                        <td>{data.getv_f}</td>
                                                                        <td>{data.getv_i}</td>
                                                                    </tr>
                                                                </tbody>
                                                            </Table>
                                                        </div> */}
                                                        <Label
                                                            style={{
                                                                fontSize: '18px',
                                                                color:
                                                                    // (((Number(data.getv_d) + Number(data.getv_e)) / confdata.test_samples) * 100 === 100)
                                                                    (data.accuracy === 100)
                                                                        ? 'green'
                                                                        : 'red'
                                                            }}>
                                                            {/* Training accuracy:  */}
                                                            {
                                                                models_res_mode[model].mode === "ok" ? `${confdata.positive}'s Training Accuracy: ` :
                                                                    models_res_mode[model].mode === "ng" ? `${confdata.negative}'s Training Accuracy: ` :
                                                                        'Training Accuracy: '
                                                            }
                                                            {parseFloat( data.accuracy ).toFixed(2)} %, {" "}
                                                        </Label>
                                                        <Label>
                                                            {
                                                                (((Number(data.getv_d) + Number(data.getv_e)) / confdata.test_samples) * 100 === 100)
                                                                    ? "Model is ready for deployment."
                                                                    : "Since accuracy is not equal to 100% based on QC's response, system will retrain the model for this component using the 'disagreed' samples to improve accuracy."
                                                            }
                                                        </Label>
                                                    </SweetAlert>
                                                ))
                                            )}

                                        </tr>

                                    ))
                                ))
                            }
                        </tbody>
                    </Table>
                    <div className='d-flex justify-content-center'>
                        <Button color='primary' onClick={() => this.updateTestedModels()}>OK</Button>
                    </div>
                </div>
            </Modal>
        )
        
    }

    manual_abortTesting = async (event) => {
        this.setState({ 
            startcapture: false, 
            // show: false, 
            showdata: false, 
            showstatus: false, showresult: false,
            manual_abort: true,
        })
    }

    abortTesting = async (event) => {
        this.setState({ timeExtend: false, startcapture: false, show: false, showdata: false })
        const { batch_id, config, model_data } = this.state;

        let comp_name = model_data[0].comp_name
        let comp_code = model_data[0].comp_code

        try {
            urlSocket.post('/abort_mv',
                {
                    'batch_id': batch_id,
                    'comp_name': comp_name,
                    'comp_code': comp_code,
                    'positive': config[0].positive,
                    'negative': config[0].negative,
                    'posble_match': config[0].posble_match
                },
                { mode: 'no-cors' })
                .then((response) => {
                    let aborted_data = response.data
                    console.log("aborted_data_326", aborted_data)
                    this.setState({ auto_abort: aborted_data, time_elapsed: true, startcapture: false, show: false, showdata: false })
                    //this.navigation()
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
        }
    }

    toggleRowVisibility = (rowKey) => {
        this.setState((prevState) => ({
            rowVisibility: {
                ...prevState.rowVisibility,
                [rowKey]: !prevState.rowVisibility[rowKey], // Toggle the visibility
            },
        }));
    };

    closeAccTable = () => {
        this.setState({ rowVisibility: {}})
    }

    onChange = (e, data, model, version) => {
        console.log('2710 D : Switch onchange e : ', e, ' data : ', data.status)
        this.setState((prevState) => ({
            selectedOption: { ...prevState.selectedOption, [model + version]: data.status },
        }));
    }

    handleOptionChange(model, version, selectedValue) {
        this.setState((prevState) => ({
            selectedOption: { ...prevState.selectedOption, [model + version]: selectedValue },
        }));
    }

    getButtonColor(version) {
        const colorMap = {
            "Yes": "success",
            "No": "danger",
        };

        // Use the color map, or a default color if the version is not found in the map
        return colorMap[version];
    }

    renderIcon(selectedOption) {
        return selectedOption === 'Yes' ? (
            <CheckCircleOutlined style={{ fontSize: '30px', color: 'green' }} />
        ) : selectedOption === 'No' ? (
            <CloseCircleOutlined style={{ fontSize: '30px', color: 'red' }} />
        ) : null;
    }

    ask_show = (decision, resMessage) => {
        // Handle user's decision here (e.g., update state or perform some action)
        const { currentModelIndex, currentVersionIndex, modelVersionListInfo } = this.state;
        console.log('0311 D : currentModelIndex, currentVersionIndex : ', currentModelIndex, currentVersionIndex )
        // Access value, status, and _id using indices 0 and 0
        const firstKey = Object.keys(modelVersionListInfo)[currentModelIndex];
        const secondKey = Object.keys(modelVersionListInfo[firstKey])[currentVersionIndex];
        const { value, status, _id } = modelVersionListInfo[firstKey][secondKey];

        console.log('** 729 : status : ', status)

        this.agree_not_mv(_id, decision, this.state.batch_id, status, firstKey, secondKey);
        
        this.setState((prevState) => {
            const { currentModelIndex, currentVersionIndex } = prevState;
            const modelKeys = Object.keys(prevState.modelVersionListInfo);
            const versionKeys = Object.keys(prevState.modelVersionListInfo[modelKeys[currentModelIndex]]);

            if (currentVersionIndex < versionKeys.length - 1) {
                // Move to the next version within the current model
                return {
                    currentVersionIndex: currentVersionIndex + 1,
                };
            } else if (currentModelIndex < modelKeys.length - 1) {
                // Move to the next model
                return {
                    currentModelIndex: currentModelIndex + 1,
                    currentVersionIndex: 0, // Reset to the first version of the new model
                };
            } else {
                // All models and versions have been displayed
                return {
                    currentModelIndex: modelKeys.length,
                    currentVersionIndex: versionKeys.length,
                };
            }
        },);
        
    };

    agree_not_mv = (data, datas, batch_id, result, firstKey, secondKey) => {
        const { model_data, config } = this.state;
        let Id = data;
        console.log('0311 : data, datas, batch_id, result, model_data, config : ', data, datas, batch_id, result, model_data, config)
        try {
            urlSocket.post('/agree_not_mv', { '_id': data, 'agree': datas, 'batch_id': batch_id, 'config': config, 'model_data': model_data, 'result': result },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    let get_a, get_b, get_c, get_d, get_e, get_f, get_g, get_h, get_i;
                    let summary_ok = _.map(data, function (o) {
                        if (o.result == config[0].positive) {
                            return o;
                        }

                    });
                    summary_ok = _.without(summary_ok, undefined)
                    if (summary_ok.length !== 0) {
                        ({ ok: get_a, agree: get_d, disagree: get_g } = summary_ok[0]);
                    }
                    let summary_notok = _.map(data, function (o) {
                        if (o.result == config[0].negative) {
                            return o;
                        }

                    });
                    summary_notok = _.without(summary_notok, undefined)
                    if (summary_notok.length !== 0) {
                        ({ notok: get_b, agree: get_e, disagree: get_h } = summary_notok[0]);
                    }
                    let summary_posbl_match = _.map(data, function (o) {
                        if (o.result == config[0].posble_match) {
                            return o;
                        }

                    });
                    summary_posbl_match = _.without(summary_posbl_match, undefined)
                    if (summary_posbl_match.length !== 0) {
                        ({ posbl_match: get_c, qc_ok: get_f, qc_notok: get_i } = summary_posbl_match[0]);
                    }

                    const { modelVersionListInfo, models_res_mode } = this.state;

                    modelVersionListInfo[firstKey][secondKey] = {
                        ...modelVersionListInfo[firstKey][secondKey],
                        getv_a: get_a !== undefined ? get_a : modelVersionListInfo[firstKey][secondKey].getv_a,
                        getv_b: get_b !== undefined ? get_b : modelVersionListInfo[firstKey][secondKey].getv_b,
                        getv_c: get_c !== undefined ? get_c : modelVersionListInfo[firstKey][secondKey].getv_c,
                        getv_d: get_d !== undefined ? get_d : modelVersionListInfo[firstKey][secondKey].getv_d,
                        getv_e: get_e !== undefined ? get_e : modelVersionListInfo[firstKey][secondKey].getv_e,
                        getv_f: get_f !== undefined ? get_f : modelVersionListInfo[firstKey][secondKey].getv_f,
                        getv_g: get_g !== undefined ? get_g : modelVersionListInfo[firstKey][secondKey].getv_g,
                        getv_h: get_h !== undefined ? get_h : modelVersionListInfo[firstKey][secondKey].getv_h,
                        getv_i: get_i !== undefined ? get_i : modelVersionListInfo[firstKey][secondKey].getv_i,
                    };
                    
                    let { train_acc, both_train_acc, ok_train_acc, ng_train_acc } = this.findAccuracy(
                        models_res_mode[firstKey].mode,
                        modelVersionListInfo[firstKey][secondKey].getv_d,
                        modelVersionListInfo[firstKey][secondKey].getv_e,
                        modelVersionListInfo[firstKey][secondKey].getv_g,
                        modelVersionListInfo[firstKey][secondKey].getv_h,
                        this.state.sample_count
                    );

                    console.log('867 train_acc, both_train_acc, ok_train_acc, ng_train_acc : ', train_acc, both_train_acc, ok_train_acc, ng_train_acc)

                    if (config[0].inspection_type === 'Manual') {
                        if (Number(this.state.sample_count) !== Number(config[0].test_samples)) {
                            this.cont_apiCall('next')
                        }
                        else if (Number(this.state.sample_count) === Number(config[0].test_samples)) {
                            modelVersionListInfo[firstKey][secondKey].accuracy = train_acc;
                            if ( train_acc !== 100) {
                                this.updateTrainingStatus(Id, both_train_acc, ok_train_acc, ng_train_acc);
                            }
                            else if ( train_acc === 100) {
                                this.updateToApproved(Id, both_train_acc, ok_train_acc, ng_train_acc);
                            }
                        }
                    }
                    else {
                        if (Number(this.state.sample_count) !== Number(config[0].test_samples)) {
                            this.appCall()
                        }
                        else if (Number(this.state.sample_count) === Number(config[0].test_samples)) {
                            modelVersionListInfo[firstKey][secondKey].accuracy = train_acc;
                            this.setState({ showdata: false })
                            if ( train_acc !== 100) {
                                this.updateTrainingStatus(Id, both_train_acc, ok_train_acc, ng_train_acc);
                            }
                            else if ( train_acc === 100) {
                                this.updateToApproved(Id, both_train_acc, ok_train_acc, ng_train_acc);
                            }
                        }
                    }

                    this.setState({ modelVersionListInfo, models_res_mode })
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }

    show_versionResults = (data) => {
        const { currentModelIndex, currentVersionIndex, config } = this.state;
        const modelKeys = Object.keys(data);
        if (data[modelKeys[currentModelIndex]] !== undefined) {
            const versionKeys = Object.keys(data[modelKeys[currentModelIndex]]);

            if (currentModelIndex < modelKeys.length && currentVersionIndex < versionKeys.length) {
                const currentModelKey = modelKeys[currentModelIndex];
                const currentVersionKey = versionKeys[currentVersionIndex];
                const currentData = data[currentModelKey][currentVersionKey];
                const status = currentData.status;
                const value = currentData.value;

                return (
                    <SweetAlert
                        showCancel
                        title=""
                        cancelBtnBsStyle="danger"
                        cancelBtnText={status === config[0].posble_match ? "Not Ok" : "No"}
                        confirmBtnText={status === config[0].posble_match ? "Ok" : "Yes"}
                        onConfirm={() => this.ask_show('yes', currentData.status)}
                        onCancel={() => this.ask_show('no', currentData.status)}
                        closeOnClickOutside={false}
                        style={{ zIndex: 995 }}
                    >
                        <div style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                        }}>
                            Model: {currentModelKey}
                        </div>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                        }}>
                            Version: {currentVersionKey}
                        </div>
                        <div
                            style={{
                                fontSize: '20px',
                                color:
                                    status === config[0].negative ? 'red' :
                                        status === config[0].positive ? 'green' :
                                            status === config[0].posble_match ? 'orange' :
                                                null,
                            }}
                        >
                            <div>
                                Result: {status} {value}
                                {
                                    status === config[0].negative ? <CloseCircleOutlined style={{ fontSize: '40px' }} /> :
                                        status === config[0].positive ? <CheckCircleOutlined style={{ fontSize: '40px' }} /> :
                                            status === config[0].posble_match ? <InfoCircleOutlined style={{ fontSize: '40px' }} /> :
                                                null
                                }
                            </div>

                        </div>
                        {
                            status === config[0].negative || status === config[0].positive ?
                                <div style={{ fontSize: '22px' }}>
                                    Do you agree with the result?
                                </div> :
                                status === config[0].posble_match ?
                                    <div style={{ fontSize: '22px' }}>
                                        System is unable to exactly classify this sample. Please choose your result
                                    </div> :
                                    null
                        }

                    </SweetAlert>
                );
            }
            else {// return <div>All models and versions have been displayed.</div>;
            }
        }
        else {
            // this.setState((prevState) => ({
            //     sample_count: prevState.sample_count + 1
            // }));
            if (Number(this.state.sample_count) === Number(config[0].test_samples)) {
                console.log('806 Equal')
                this.setState({ show_summary: true})
            }
            console.log('Else part worked', parseInt(55555555))
            this.setState({ 
                show_version_wise_result: false, show: true,
                currentModelIndex: 0, currentVersionIndex: 0,
            })
            if(config[0].inspection_type === "Auto"){
                this.setState({ showdata: true})
            }
            if(config[0].inspection_type === "Manual"){
                this.setState({ show: true})
            }
        }
        console.log('0311 D : modelVersionListInfo : ', this.state.modelVersionListInfo)
    }

    extendTimer = () => {
        console.log('first170')
        setTimeout(() => {
            this.setState({ show_timer: false })
        }, 1000)
        let test_duration = this.state.testing_duration
        setTimeout(() => {
            this.setState({ testing_duration: test_duration, show_timer: true })
        }, 1000)
        this.setState({ extendTimer: false })
        this.showAlertTimer(test_duration)
    }
    
    timerExtention = async () => {
        // if (counttimer) {
        //     clearTimeout(counttimer)
        //   }
        this.setState({ timeExtend: false })
        let test_duration = this.state.testing_duration

        this.setState({ testing_duration: test_duration, show_timer: true, show: true })
        console.log('test_duration', test_duration)
    }

    updateTrainingStatus(id, both_train_acc, ok_train_acc, ng_train_acc) {

        const { batch_id, model_data } = this.state;

        this.setState((prevState) => ({
            retrain_ver_count: prevState.retrain_ver_count + 1
        }));
          
        try {
            urlSocket.post('/updatetrainstatus', 
            { 
                '_id': id, 
                'batch_id': batch_id,
                'both_train_acc': both_train_acc,
                'ok_train_acc': ok_train_acc,
                'ng_train_acc': ng_train_acc,
                'model_data': model_data,
            },
                { mode: 'no-cors' })
                .then((response) => {
                    const data = response.data;
                })
        }
        catch (error) {
        }
    }

    updateToApproved(id, both_train_acc, ok_train_acc, ng_train_acc) {
        const { batch_id } = this.state;

        try {
            urlSocket.post('/updateToApproved', 
            { 
                '_id': id, 
                'batch_id': batch_id,
                'both_train_acc': both_train_acc,
                'ok_train_acc': ok_train_acc,
                'ng_train_acc': ng_train_acc,
            },
                { mode: 'no-cors' })
                .then((response) => {
                    const data = response.data;
                })
        }
        catch (error) {
            console.log(error)
        }
    }

    updateTestedModels() {
        const { modelVersionListInfo, retrain_ver_count, model_data } = this.state;
        const { history } = this.props
        this.setState({ startCapture: false })

        console.log('updateTestedModels')

        try {
            const response = urlSocket.post('/retraining_models',
                { 'retrain_ver_count': retrain_ver_count, 'model_data': model_data },
                { mode: 'no-cors' })
                ;
            const Data = response.data;
            console.log(' response updateTestedModels : ', Data)
        } catch (error) {
            console.log('error : ', error)
        }

        history.push("/manageModel")

    }

    findAccuracy(res_mode, get_d, get_e, get_g, get_h, sample_count) {
        // const {  } = this.state;
        console.log('res_mode, get_d, get_e, get_g, get_h, sample_count : ', res_mode, get_d, get_e, get_g, get_h, sample_count, this.state.models_res_mode)

        const d = Number(get_d);
        const e = Number(get_e);
        const g = Number(get_g);
        const h = Number(get_h);

        // let both_train_acc = ((d + e) / sample_count) * 100;
        // let ok_train_acc = (h !== 0 ? (d / (d + h)) * 100 : 100);
        // let ng_train_acc = (g !== 0 ? (e / (e + g)) * 100 : 100);
        
        let both_train_acc = ((d + e) / sample_count) * 100;
        let acc_ok = (d / (d + h)) * 100;
        let acc_ng = (e / (e + g)) * 100;

        let ok_train_acc = isNaN(acc_ok) ? 0 : acc_ok;
        let ng_train_acc = isNaN(acc_ng) ? 0 : acc_ng;

        if (res_mode === "ok") {
            let train_acc = ok_train_acc;
            return { train_acc, both_train_acc, ok_train_acc, ng_train_acc };
        } else if(res_mode === "ng") {
            let train_acc = ng_train_acc;
            return { train_acc, both_train_acc, ok_train_acc, ng_train_acc };
        }
        else {
            let train_acc = both_train_acc;
            // For "both" or other cases
            return { train_acc, both_train_acc, ok_train_acc, ng_train_acc };
        }
    }

    cancelAbort = () => {
        const { config } = this.state;
        if (config[0].inspection_type == 'Auto') {
            this.appCall()
        }
        this.setState({
            manual_abort: false,
        })
    }

    outlinechanges = (e) => {
        console.log('e1349', e.label)
        this.setState({ default_outline: e })
        const { comp_info } = this.state
        if (e.label === 'White Outline') {
            this.setState({ outline_path: comp_info.datasets.white_path })
        }
        else if (e.label === 'Red Outline') {
            this.setState({ outline_path: comp_info.datasets.red_path })
        }
        else if (e.label === 'Green Outline') {
            this.setState({ outline_path: comp_info.datasets.green_path })
        }
        else if (e.label === 'Blue Outline') {
            this.setState({ outline_path: comp_info.datasets.blue_path })
        }
        else if (e.label === 'Black Outline') {
            this.setState({ outline_path: comp_info.datasets.black_path })
        }
        else if (e.label === 'Orange Outline') {
            this.setState({ outline_path: comp_info.datasets.orange_path })
        }
        else if (e.label === 'Yellow Outline') {
            this.setState({ outline_path: comp_info.datasets.yellow_path })
        }

    }

    newOutlineChange = (ot_label) => {
        this.setState({ default_outline: ot_label })
        const { comp_info } = this.state
        if (ot_label === 'White Outline') {
            this.setState({ outline_path: comp_info.datasets.white_path })
        }
        else if (ot_label === 'Red Outline') {
            this.setState({ outline_path: comp_info.datasets.red_path })
        }
        else if (ot_label === 'Green Outline') {
            this.setState({ outline_path: comp_info.datasets.green_path })
        }
        else if (ot_label === 'Blue Outline') {
            this.setState({ outline_path: comp_info.datasets.blue_path })
        }
        else if (ot_label === 'Black Outline') {
            this.setState({ outline_path: comp_info.datasets.black_path })
        }
        else if (ot_label === 'Orange Outline') {
            this.setState({ outline_path: comp_info.datasets.orange_path })
        }
        else if (ot_label === 'Yellow Outline') {
            this.setState({ outline_path: comp_info.datasets.yellow_path })
        }

    }

    render() {
        const { model_data, config, refImages, showresultTable, modelVersionListInfo } = this.state;
        const videoConstraints = {
            facingMode: "user"
        };
        // console.log('0111 D : sample_count : ', this.state.sample_count)
        return (
            <div className='page-content'>
                <Container fluid={true} style={{ minHeight: '100vh', background: 'white' }}>
                    <CardTitle className="text-center" style={{ fontSize: 22, paddingTop: '20px' }}> ADMIN ACCURACY TESTING </CardTitle>
                    <Card>
                        <div>
                            <Label style={{ fontSize: '18px', fontWeight: 'bold'}}>
                                Component Name:{model_data[0]?.comp_name} , Component Code:{model_data[0]?.comp_code}
                            </Label>
                        </div>
                    </Card>
                    <div>
                        {
                            // modelData && modelData.datasets && modelData.datasets.length !== 0 && modelData.datasets[0].white_path ?
                            this.state.outline_checkbox &&
                            <>
                                <div className='my-3'>
                                    <FormGroup check>
                                        <Label check>
                                            <Input
                                                type="checkbox"
                                                checked={this.state.show_outline}
                                                onChange={() => this.showOutline()}
                                            />
                                            Show Outline
                                        </Label>
                                    </FormGroup>
                                </div>
                                {
                                    this.state.show_outline &&
                                    <div className='d-flex align-items-center'>
                                        <Label className='my-1'>Outline Color : </Label>
                                        <div className='mx-3 d-flex'>
                                            {

                                                this.state.outline_colors.map((otline, otl_id) => (

                                                    <Button
                                                        key={otl_id}
                                                        className='mx-1'
                                                        style={{
                                                            backgroundColor:
                                                                otline === "White Outline" ? 'white' :
                                                                    otline === "Red Outline" ? 'red' :
                                                                        otline === "Green Outline" ? 'green' :
                                                                            otline === "Blue Outline" ? 'blue' :
                                                                                otline === "Black Outline" ? 'black' :
                                                                                    otline === "Orange Outline" ? 'orange' :
                                                                                        otline === "Yellow Outline" ? 'yellow' : 'gray',
                                                            boxShadow: this.state.default_outline == otline && '0px 0px 5px 2px rgba(0, 0, 0, 0.5)',
                                                            border: otline == "White Outline" ? 'auto' : 'none'
                                                        }}
                                                        outline={this.state.default_outline !== otline}
                                                        onClick={() => { this.newOutlineChange(otline) }}
                                                    ></Button>

                                                ))
                                            }
                                        </div>
                                    </div>
                                }

                            </>
                        }
                        <Row>
                            <Col lg={6} >
                                <Card>
                                    <Row>
                                        <Col md={1} className='mt-2'>
                                            <Button color="primary" onClick={() => this.manual_abortTesting()}>Abort</Button>
                                        </Col>
                                        <Col md={2} className='mt-2'>
                                            {
                                                this.state.extendTimer ?
                                                    <Button color="primary" onClick={() => this.extendTimer()}>Extend Timer</Button> : null
                                            }
                                        </Col>
                                        <Col md={6} >
                                            <Row style={{ textAlign: 'right' }} noGutters>
                                                <Col md={6} style={{ textAlign: 'center', paddingTop: '16px', whiteSpace: 'nowrap', fontSize: '18px' }}>Time to complete:</Col>
                                                <Col md={6} className='ps-0' style={{ textAlignLast: 'center', paddingTop: '0px' }}>
                                                    {
                                                        this.state.show_timer ?
                                                            config.map((data, index) => (
                                                                <div key={index}>
                                                                    {
                                                                        Number(this.state.sample_count) !== Number(data.test_samples) === true &&
                                                                        <CountdownTimer backgroundColor="#e6e46f" className="mt-2" size={28} hideDay={true} hideHours={false} count={this.state.testing_duration} onEnd={() => { this.onTimeup() }} />
                                                                    }
                                                                </div>)) : null
                                                    }
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col md={3} style={{ textAlign: 'right', paddingTop: '17px' }}>
                                            <Row>
                                                {
                                                    config.map((data, index) => (
                                                        // this.state.show ?
                                                        <div key={index}>
                                                            <Label>
                                                                Sample completed: {this.state.sample_count} / {data.test_samples}
                                                            </Label>
                                                        </div>
                                                        // : null
                                                    ))
                                                }
                                            </Row>
                                        </Col>
                                    </Row>

                                    <Row className='mt-3'>
                                        <div className='containerImg'>
                                            {
                                                this.state.cameraDisconnected ?
                                                <div className='my-2' style={{ outline: '2px solid #000', padding: '10px', borderRadius: '5px', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                                                  <div className='d-flex flex-column justify-content-center align-items-center webcam-disconnected' style={{ width: '100%' }}>
                                                    <h5 style={{ fontWeight: 'bold' }}>Webcam Disconnected</h5>
                                                    <Spinner className='mt-2' color="primary" />
                                                    <h6 className='mt-2' style={{ fontWeight: 'bold' }}>Please check your webcam connection....</h6>
                                                  </div>
                                                </div>
                                                :
                                                <>
                                                    <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
                                                        {
                                                            this.state.show_outline &&
                                                            // modelData && modelData.datasets && modelData.datasets.length !== 0 && modelData.datasets[0].white_path ?
                                                            this.state.outline_path ?
                                                            <img
                                                                style={{
                                                                    width: '100%',
                                                                    position: 'absolute',
                                                                    height: 'auto'
                                                                }}
                                                                // src={this.showImage(modelData.datasets[0].white_path)}
                                                                src={`${ImageUrl + this.state.outline_path}?${Date.now()}`}
                                                            ></img>
                                                            : null
                                                        }
                                                        <Webcam
                                                            videoConstraints={videoConstraints}
                                                            audio={false}
                                                            height={'auto'}
                                                            screenshotFormat="image/png"
                                                            width={'100%'}
                                                            ref={node => this.webcam = node}
                                                        />
                                                    </div>

                                                    <div className='centered mt-4'>
                                                        {
                                                            this.state.show ?
                                                                <div style={{
                                                                    color:
                                                                        this.state.msg === "Place the object and press start" ? 'white' :
                                                                            null
                                                                }}>
                                                                    {this.state.msg}
                                                                </div> : null
                                                        }
                                                        {
                                                            this.state.showdata ?
                                                                <div style={{
                                                                    color:
                                                                        this.state.mssg === "Place the object" ? 'white' :
                                                                            null
                                                                }}>
                                                                    {this.state.mssg}
                                                                </div> : null
                                                        }
                                                        {
                                                            this.state.showstatus ?
                                                                <div style={{
                                                                    color:
                                                                        this.state.res_message === "Object Detected" ? 'lightgreen' :
                                                                            this.state.res_message === "No Object Detected" ? 'yellow' :
                                                                                this.state.res_message === "Incorrect Object" ? 'red' :
                                                                                    this.state.res_message === "Checking ..." ? 'lightyellow' :
                                                                                        null
                                                                }}>
                                                                    {this.state.res_message}
                                                                </div> : null
                                                        }

                                                        {
                                                            this.state.showresult ?
                                                                <div style={{
                                                                    // background: "white",
                                                                    color:
                                                                        this.state.response_message === "No Objects Detected" ? 'yellow' :
                                                                            this.state.response_message === config[0].positive ? 'lightgreen' :
                                                                                this.state.response_message === config[0].negative ? 'red' :
                                                                                    this.state.response_message === config[0].posble_match ? 'orange' :
                                                                                        null
                                                                }}>
                                                                    <br />
                                                                    Result: {this.state.response_message}{" "}{this.state.response_value}
                                                                </div>
                                                                : null
                                                        }
                                                        {
                                                            this.state.showresult ?
                                                                <div className="containerImg" >
                                                                    <div>
                                                                        {
                                                                            this.state.response_message === config.positive &&
                                                                            <div className="align-self-bottom">
                                                                                <CheckCircleOutlined style={{ fontSize: '80px' }} />
                                                                            </div>
                                                                        }
                                                                    </div>
                                                                    {
                                                                        this.state.response_message === config.negative &&
                                                                        <div className="align-self-bottom">
                                                                            <CloseCircleOutlined style={{ color: 'red', fontSize: '80px' }} />
                                                                            {/* <Button className="me-2" color="success" onClick={() => this.acceptClick()} > Yes </Button> */}
                                                                        </div>
                                                                    }
                                                                </div>
                                                                : null
                                                        }
                                                        <div className="containerImg" >
                                                            <div>
                                                                {
                                                                    this.state.showdata ?
                                                                        <CountdownTimer backgroundColor="#f1f1f1" className="mt-2" hideDay={true} hideHours={true} count={this.state.capture_duration} onEnd={() => { this.onTimeupCourse() }} /> : null
                                                                }
                                                            </div>
                                                        </div>

                                                    </div>
                                                </>
                                            }
                                           
                                        </div>
                                    </Row>
                                    <br />
                                    <Row style={{ textAlign: 'end' }}>
                                        <Col md={6}>
                                            {
                                                !this.state.cameraDisconnected &&
                                                config.map((data, index) => (
                                                    data.inspection_type === "Manual" && this.state.show ?
                                                        <div key={index}>
                                                            <Button color='primary' onClick={() => this.adminAccTesting(data)}>Start</Button>
                                                        </div> : null
                                                ))
                                            }
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                            <Col lg={6} style={{ textAlign: 'center' }}>
                                <h2 style={{ color: 'black', fontSize: '28px', paddingTop: '20px' }}>Reference Image</h2>
                                <Card>
                                    {
                                        refImages[0] &&
                                        refImages[0]?.datasets?.length !== 0 && (
                                            <img src={this.getImage(refImages[0].datasets)} />
                                        )}
                                </Card>
                            </Col>
                        </Row>
                    </div>
                    {
                        this.state.show_version_wise_result &&
                        this.show_versionResults(modelVersionListInfo)
                    }
                    {
                        this.state.manual_abort ?
                            // this.state.alertmsg ?
                            <SweetAlert
                                showCancel
                                title="Abort - User Request"
                                cancelBtnBsStyle="success"
                                confirmBtnText="Yes"
                                cancelBtnText="No"
                                onConfirm={() => this.navigateToMngModel()}
                                onCancel={() => this.cancelAbort()}
                                closeOnClickOutside={false}
                                style={{ zIndex: 997 }}
                            >
                                <div style={{ fontSize: '22px' }}>
                                    This will stop the testing process
                                </div>
                                <div style={{ fontSize: '22px' }}>
                                    Do you want stop the testing?
                                </div>
                            </SweetAlert> : null
                    }
                    {/* {this.state.response_message === this.state.negative &&
                        this.state.manual_abort !== true &&
                        this.state.time_elapsed !== true && (
                            <SweetAlert
                                showCancel
                                title=""
                                cancelBtnBsStyle="danger"
                                cancelBtnText="No"
                                confirmBtnText="Yes"
                                onConfirm={() => this.ask_show('yes')}
                                onCancel={() => this.ask_show('no')}
                                closeOnClickOutside={false}
                                style={{ zIndex: 995 }}
                            >
                                <div
                                    style={{
                                        fontSize: '20px',
                                        color:
                                            this.state.response_message === this.state.negative
                                                ? 'red'
                                                : null,
                                    }}
                                >
                                    Result: {this.state.response_message} {this.state.response_value}{' '}
                                    <CloseCircleOutlined style={{ fontSize: '40px' }} />
                                </div>
                                <div style={{ fontSize: '22px' }}>
                                    Do you agree with the result? singleOne
                                </div>
                            </SweetAlert>
                        )} */}
                    {
                        this.state.timeExtend ?
                            <SweetAlert
                                showCancel
                                title="Do you want to extend the timer?"
                                confirmBtnText="Yes"
                                cancelBtnText="No"
                                onConfirm={() => this.timerExtention()}
                                onCancel={() => this.abortTesting()}
                                closeOnClickOutside={false}
                                style={{ zIndex: 999 }}
                            >
                            </SweetAlert> : null
                    }
                    {
                        // Number(config[0]?.test_samples) === this.state.sample_count &&
                        this.state.show_summary &&
                        this.renderTableRows()
                    }
                </Container>

            </div>
        )
    }
}
