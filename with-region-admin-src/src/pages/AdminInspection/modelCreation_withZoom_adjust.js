import React, { Component, createRef } from 'react';

import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import MetaTags from 'react-meta-tags';
import {
    Container, CardTitle, Button, Table, Label, Row, Col, 
    CardBody, Modal, Card, Progress, Nav, NavItem, NavLink, 
    TabContent, TabPane, Spinner, ModalBody, CardText,
    FormGroup,
    Input,
    UncontrolledTooltip
} from 'reactstrap';
import Webcam from "react-webcam";

import { v4 as uuidv4 } from 'uuid';
import { Popconfirm, Image, Slider, Tooltip, Spin } from 'antd';
import { DeleteTwoTone, CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons';
// import 'antd/dist/antd.css';
import moment from 'moment';
import Swal from 'sweetalert2';
import { Draggable, Droppable } from 'react-drag-and-drop'
import { JsonTable } from 'react-json-to-html';
import classnames from "classnames"
import { Checkbox } from 'antd';
import { Multiselect } from "multiselect-react-dropdown";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

import Breadcrumbs from "components/Common/Breadcrumb";
import urlSocket from "./urlSocket"
import ImageUrl from './imageUrl'
import TrainImages from './adminComponent/TrainImages';

import "./Css/style.css"
import AdminTestingOptions from './RegionFunctions/AdminTestingOptions';
import { DEFAULT_RESOLUTION } from './cameraConfig';

let okCount1;
let notokCount1;
class modelCreation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            comp_name: '',
            comp_code: '',
            model_name: '',
            compModelVerInfo: [],
            config: [],
            positive: '',
            negative: '',
            selectFilter: null,
            tabFilter: null,
            showOkButton: false,
            showNotokButton: false,
            showCamera: false,
            showGallery: false,
            showLabelName: '',
            reqImgCount: null,
            lable_name: '',
            webcamEnabled: false,
            imageSrcNone: false,
            showTrainingINProgs: false,
            refersh: false,
            initvalue: 1,
            activeTab: '1',
            customActiveTab: '',
            modal_xlarge: false,
            modal_xlarge1: false,
            isImageHidden: {},
            log_data: [],
            selected: [],
            newGallery: false,
            checkedValues: [],
            selectedList: [],
            hidVer: [],
            selectedCheckBox: [],
            uniqueModelVersions: [],
            groupedData: {},
            activeGroupData: {},
            showRetrain: false,
            addAccTestInProg: false,

            images_length: 0,
            selectedImages: [],
            img_paths: [],
            rangeValue: 0.9,
            img_rotation: false,
            no_of_rotation: 0,
            position: '',
            type: '',

            adding_image: false,

            adding_image: false,
            outline_thres: 100,
            show_outline: false,
            capture_fixed_refimage: false,

            outline_options: [
                { label: "White Outline" },
                { label: "Red Outline" },
                { label: "Green Outline" },
                { label: "Blue Outline" },
                { label: "Black Outline" },
                { label: "Orange Outline" },
                { label: "Yellow Outline" },
            ],
            // default_outline: { label: 'White Outline' },
            default_outline: 'White Outline',
            outline_colors: [
                "White Outline",
                "Blue Outline",
                "Black Outline",
                "Orange Outline",
                "Yellow Outline",
            ],
            outline_path: '',

            adding_train_image: false,
            show_train_image: false,


            // from this onwards region drawing sections
            region_selection: false,
            imageSrc: null,
            clearCanvasFlag: false,
            cvLoaded: false,
            selecting: false,
            selectedRectangleIndex: null,
            editingRectangleIndex: null,
            resizingRectangleIndex: null,
            movingRectangleIndex: null,
            rectNameInput: '',
            nestedRectNameInput: '',
            capturedImage: null,
            testingImage: null,
            imageId: null,
            selectingRectangle: '',
            // from this onward updated canvas state values
            inputRectangleName: null,
            existRectangleNameError: false,
            selectedColor: 'blue',
            showRegion: true,

            testing_options: [
                { 'option': 0, 'value': 'Entire Component' },
                { 'option': 1, 'value': 'Regions Only' },
                { 'option': 2, 'value': 'Entire Component with Regions' }
            ],
            overall_testing: true,
            region_wise_testing: false,
            region_testing_required: false,

            isPanning: false, // State to track if panning is active
            panStartX: 0, // Initial x position when panning starts
            panStartY: 0, // Initial y position when panning starts

            canvas_width: 640, // initial width
            canvas_height: 480, // initial height

            modelVersionLoading: true,
            versionCount: 1,

            show_testing_options: false,
            selected_version: null,

            cameraZoom: 2.5,
        }

        this.tog_xlarge = this.tog_xlarge.bind(this);

        this.parentDivRef = createRef();
        this.canvasRef = createRef();
        this.webcamRef = createRef();
        this.videoRef = createRef();
        this.animationRef = createRef();
        this.nestedRectangleRef = createRef();
        this.rectangleRef = createRef();
        this.trashButtonsRef = [];
        this.draggingRectIndexRef = createRef();
        this.resizingRectIndexRef = createRef();
        this.timer = null;
    }

    // componentDidMount() {
    //     let compModelInfo = JSON.parse(sessionStorage.getItem('compModelData'));
    //     let compModelVInfo = JSON.parse(sessionStorage.getItem('compModelVInfo'));
    //     this.setState({ comp_name: compModelInfo.comp_name, comp_code: compModelInfo.comp_code, model_name: compModelInfo.model_name, position: compModelInfo.position, type: compModelInfo.type, refersh: true })
    //     this.getModelCreation(compModelVInfo)
    //     this.getConfigInfo();

    //     this.showRefOutline(compModelInfo, compModelVInfo);

    //     // Add device change listener
    //     navigator.mediaDevices.addEventListener('devicechange', this.checkWebcam);
    //     // Initial check
    //     this.checkWebcam();

    //     window.addEventListener('resize', this.updateCanvasSize);
    //     // Initial size setting
    //     this.updateCanvasSize();
    // }

    async componentDidMount() {
        console.log('()componentDidMount')
        try {
            let compModelInfo = JSON.parse(sessionStorage.getItem('compModelData'));

            const data = JSON.parse(sessionStorage.getItem('compModelVInfo'));
            const compModelVInfo = data.versionInfo;
            const versionCount = data.versionCount;
            // let compModelVInfo = JSON.parse(sessionStorage.getItem('compModelVInfo'));

            console.log('versionCount ', versionCount, compModelVInfo)

            this.setState({
                comp_name: compModelInfo.comp_name,
                comp_code: compModelInfo.comp_code,
                model_name: compModelInfo.model_name,
                position: compModelInfo.position,
                type: compModelInfo.type,
                refersh: true,
                versionCount: versionCount
            })
            await this.getModelCreation(compModelVInfo)
            await this.getConfigInfo(compModelVInfo.result_mode);

            await this.showRefOutline(compModelInfo, compModelVInfo);

            // Add device change listener
            navigator.mediaDevices.addEventListener('devicechange', this.checkWebcam);
            // Initial check
            await this.checkWebcam();
        }
        catch (error) {
            console.error('/didmount ', error)
        }
        finally {
            this.setState({ modelVersionLoading: false })
        }
    }

    componentWillUnmount() {
        // Clear the interval to avoid memory leaks
        clearInterval(this.trainingStatusInterval);

        // Remove device change listener
        navigator.mediaDevices.removeEventListener('devicechange', this.checkWebcam);
    }

    showRefOutline = async (data1, data2) => {
        try {
            const response = await urlSocket.post('/check_outline', {
                'comp_id': data2.comp_id,
                'model_id': data2.model_id,
            }, { mode: 'no-cors' });
            let getInfo = response.data;
            if (getInfo.show == 'yes') {
                this.setState({
                    show_outline: true,
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

    handleWebcamLoad = () => {
        this.setState({ webcamLoaded: true })
    }

    showOutline = () => {
        this.setState(prevState => ({
            show_outline: !prevState.show_outline
        }));
    }

    getModelCreation = async (compModelVInfo) => {
        try {
            const response = await urlSocket.post('/getCompModel_ver_info', { 'compModelInfo': compModelVInfo }, { mode: 'no-cors' });
            let default_thres = this.state.rangeValue
            const compModelVerInfo = response.data.version_data;

            const myArray = [];
            myArray.push(compModelVerInfo)
            const show_train_image = compModelVerInfo?.sift_train_datasets?.length > 0 ? true : false;

            this.setState({ region_selection: response.data.comp_data.region_selection });
            if (compModelVerInfo.thres === undefined) {
                this.setState({ compModelVerInfo: myArray, refersh: true, show_train_image: show_train_image, rangeValue: default_thres })
            }
            else {
                this.setState({ compModelVerInfo: myArray, refersh: true, show_train_image: show_train_image, rangeValue: compModelVerInfo.thres })
            }

            if (compModelVerInfo.training_status === 'training_in_progress') {
                this.setState({ showTrainingINProgs: true });
            }
            else if (compModelVerInfo.training_status === 'admin accuracy testing in_progress') {
                this.setState({ addAccTestInProg: true })
                this.fetchTrainingStatus(this.state.compModelVerInfo[0]);
            }
            else if (compModelVerInfo.training_status === 'retrain') {
                this.setState({ showRetrain: true })
            }

            if (compModelVerInfo.training_status === 'training_in_progress' || compModelVerInfo.training_status === 'retrain') {
                this.trainingStatusInterval = setInterval(() => this.fetchTrainingStatus(this.state.compModelVerInfo[0]), 5000);
            }
            this.imgGlry()

        } catch (error) {
            console.log('error', error)
        }
    }

    imgGlry = async () => {

        const { compModelVerInfo } = this.state;
        const compModelVInfo = compModelVerInfo[0]
        try {
            const response = await urlSocket.post('/modelImages', { 'compModelInfo': compModelVInfo }, { mode: 'no-cors' });
            const compModelVerInfo = response.data;
            const allModelVersions = compModelVerInfo.reduce((acc, item) => {
                // Combine all used_model_ver arrays into a single array
                acc.push(...item.used_model_ver);
                return acc;
            }, []);

            // Use Set to get unique model versions
            const uniqueModelVersions = [...new Set(allModelVersions)].sort();

            const groupedData = compModelVerInfo.reduce((acc, item) => {
                item.used_model_ver.forEach((version) => {
                    // Check if the version key exists, if not, create it
                    if (!acc[version]) {
                        acc[version] = [];
                    }
                    // Push the item to the array of that version
                    acc[version].push(item);
                });

                return acc;
            }, {});

            // 19-01-23 --> 3 diff setStates
            this.setState({
                imgGlr: compModelVerInfo,
                uniqueModelVersions,
                groupedData, activeGroupData: groupedData
            });
        } catch (error) {
            console.log('error', error)
        }
    }

    getConfigInfo = async (result_mode) => {
        try {
            const response = await urlSocket.post('/config', { mode: 'no-cors' });
            console.log('/config ', response)
            const config = response.data;
            this.setState({ config, positive: config[0].positive, negative: config[0].negative, });

            if (result_mode !== "ng") {
                this.getOK(config[0].positive, 0, '1')
            } else {
                this.getNotok(config[0].negative, 1, '2')
            }

            // this.getOK(config[0].positive, 0, '1')
        } catch (error) {
            console.log('error', error)
        }
    }

    getOK = (ok, tabFilter, tab) => {
        const { config } = this.state;
        let reqImgCount = config[0].min_ok_for_training
        this.setState({ tabFilter, showOkButton: true, showNotokButton: false, showCamera: false, showGallery: false, showLabelName: ok, reqImgCount, activeTab: tab, customActiveTab: '' })
    }

    getNotok = (notok, tabFilter, tab) => {
        const { config } = this.state;
        let reqImgCount = config[0].min_notok_for_training
        this.setState({ tabFilter, showNotokButton: true, showOkButton: false, showCamera: false, showGallery: false, showLabelName: notok, reqImgCount, activeTab: tab, customActiveTab: '' })
    }

    getImgGalleryInfo = (selectFilter, lable_name, tab) => {

        const { activeGroupData, compModelVerInfo } = this.state;
        let img_length = this.imagesLength(activeGroupData, compModelVerInfo[0].model_ver, lable_name);

        this.setState({
            selectFilter, showCamera: false,
            showGallery: true, lable_name,
            customActiveTab: tab,
            images_length: img_length,

            selectedList: [],

            selectedImages: [],
            img_paths: []
        })
        this.imgGlry()
    }

    startLiveCamera = (selectFilter, lable_name, tab) => {

        const { activeGroupData, compModelVerInfo } = this.state;
        let img_length = this.imagesLength(activeGroupData, compModelVerInfo[0].model_ver, lable_name);

        this.setState({
            selectFilter, showCamera: true,
            showGallery: false, lable_name,
            customActiveTab: tab,
            images_length: img_length,
            imageSrcNone: false,

            selectedList: [],

            selectedImages: [],
            img_paths: []
        })
        this.imgGlry()
        // Simulate slow enable process for demonstration
        setTimeout(() => {
            this.setState({ webcamEnabled: true });
        }, 1000);
    }

    captureImage = async (labelName) => {
        const {
            compModelVerInfo, activeGroupData, no_of_rotation
        } = this.state;

        if (isNaN(no_of_rotation)) {
            Swal.fire({
                icon: 'info',
                title: 'No. of rotations required',
                confirmButtonText: 'OK',
            }).then((result) => {
                if (result.isConfirmed) {
                    this.setState({ no_of_rotation: 0 })
                } else {
                    // Handle user cancellation
                    console.log('User canceled');
                }
            });
        } else {
            this.setState({ adding_image: true })

            // const imageSrc = this.webcam.getScreenshot({ width: DEFAULT_RESOLUTION.width, height: DEFAULT_RESOLUTION.height });
            const imageSrc = this.takeSnapshot();
            if (!imageSrc) {
                this.setState({ imageSrcNone: true, adding_image: false });
                return;
            }
            const blob = this.dataURLtoBlob(imageSrc);

            this.setState({ imageSrc: imageSrc });
            const formData = new FormData();
            let imgUuid = uuidv4();
            formData.append('_id', compModelVerInfo[0]._id);
            formData.append('labelName', labelName);
            formData.append('image_rotation', this.state.no_of_rotation);
            formData.append('imgName', blob, imgUuid + '.png');

            try {
                const response = await urlSocket.post('/addImage', formData, {
                    headers: {
                        'content-type': 'multipart/form-data'
                    },
                    mode: 'no-cors'
                });
                let getInfo = response.data;

                // // comp_model_ver region data
                // if (response.data.comp_model_ver_info_list[0].region_selection !== undefined) {
                //     const image1 = response.data.comp_model_ver_info_list[0].datasets[0];
                //     const imageurl = this.getImages(image1);
                //     this.setState({ region_selection: response.data.comp_model_ver_info_list[0].region_selection, imageSrc: imageurl });
                // }

                if (getInfo.message === 'Image successfully added') {
                    this.setState({
                        response_message: getInfo.message,
                        compModelVerInfo: getInfo.comp_model_ver_info_list,
                        refersh: true,
                        images_length: getInfo.img_count,
                        adding_image: false,
                    });
                }
                else {
                    this.setState({
                        response_message: getInfo.message,
                        adding_image: false
                    })
                }
                this.imgGlry()
                setTimeout(() => {
                    this.setState({ response_message: "" });
                }, 1000);
            } catch (error) {
                console.log('error', error);
            }
        }
    };

    dataURLtoBlob = (dataURL) => {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    };

    getImages = (data1) => {
        if (data1 !== undefined) {
            let baseurl = ImageUrl
            let result = data1.image_path
            let output = baseurl + result
            return output
        }
        else {
            return null
        }
    }

    deleteImageClick = async (data, ver, labelName) => {
        try {
            let idxVal = data.used_model_ver.indexOf(ver);
            const { compModelVerInfo, selectedList } = this.state;

            let imgName = data.imagePathType[idxVal].image_path;
            let fileName = data.filename;
            const formData = new FormData();
            formData.append('_id', compModelVerInfo[0]._id);
            formData.append('model_ver', parseInt(data.org_model_ver));
            formData.append('labelName', labelName);
            formData.append('fileName', fileName);
            formData.append('imgName', imgName);
            formData.append('comp_named', compModelVerInfo[0].comp_name);
            formData.append('comp_code', compModelVerInfo[0].comp_code);
            formData.append('comp_id', compModelVerInfo[0].comp_id);
            formData.append('model_name', compModelVerInfo[0].model_name);
            formData.append('model_id', compModelVerInfo[0].model_id);
            formData.append('training_status', compModelVerInfo[0].training_status);
            formData.append('model_status', compModelVerInfo[0].model_status);

            const response = await urlSocket.post('/delete_image', formData, {
                headers: {
                    'content-type': 'multipart/form-data'
                },
                mode: 'no-cors'
            });

            this.setState({
                response_message: response.data.message,
                compModelVerInfo: response.data.comp_model_ver_info_list,
                images_length: response.data.img_count
            });

            // Refresh the gallery data
            await this.imgGlry();

            if (selectedList.length !== 0) {
                // Filter groupedData based on selectedList
                const { imgGlr: updatedImgGlr } = this.state;
                const filteredGroupedData = selectedList.reduce((acc, itemList) => {
                    const version = itemList.value;
                    const itemsForVersion = updatedImgGlr.filter(item => item.used_model_ver.includes(version));
                    acc[version] = itemsForVersion;
                    return acc;
                }, {});

                // Update state with filtered data
                this.setState({ groupedData: filteredGroupedData });
            }

            setTimeout(() => {
                this.setState({ response_message: "" });
            }, 1000);
        } catch (error) {
            console.log('error', error);
        }
    };


    train = async (data) => {
        const updatedCompModelVerInfo = [...this.state.compModelVerInfo];
        updatedCompModelVerInfo[0].training_status_id = 0;
        updatedCompModelVerInfo[0].training_start_time = '00:00:00'
        this.setState({ compModelVerInfo: updatedCompModelVerInfo, refersh: true, });
        this.setState({ showTrainingINProgs: true });
        this.trainingStatusInterval = setInterval(() => this.fetchTrainingStatus(data), 5000);

        try {
            const response = await urlSocket.post('/Train', { 'compModelVerInfo': data, 'config': this.state.config }, { mode: 'no-cors' });
        } catch (error) {
            console.log('Error starting training:', error);
            clearInterval(this.trainingStatusInterval);
        }
    }

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

    fetchTrainingStatus = async (data) => {
        // this.setState({ showTrainingINProgs: true });
        try {
            const response = await urlSocket.post('/getTrainingStatus', { 'compModelVerInfo': data }, { mode: 'no-cors' });
            const updatedCompModelVerInfo = response.data;
            this.setState({ compModelVerInfo: updatedCompModelVerInfo, refersh: true });
            if (updatedCompModelVerInfo[0].training_status === 'training completed') {
                updatedCompModelVerInfo[0].training_status_id = 4;
                updatedCompModelVerInfo[0].training_status = 'training completed';
                this.setState({ showTrainingINProgs: false, refersh: true });
                clearInterval(this.trainingStatusInterval);
            }
            else if (updatedCompModelVerInfo[0].training_status === 'admin approved trained model') {
                this.setState({ showTrainingINProgs: false, refersh: true });
                clearInterval(this.trainingStatusInterval);
            }
            else if (updatedCompModelVerInfo[0].training_status !== 'training_in_progress' && updatedCompModelVerInfo[0].training_status !== 'retrain') {
                this.setState({ showTrainingINProgs: false, showRetrain: false, refersh: true });
                clearInterval(this.trainingStatusInterval);
            }

            if (updatedCompModelVerInfo[0].training_status === 'training_in_progress') {
                this.setState({ showTrainingINProgs: true })
            }
            else if (updatedCompModelVerInfo[0].training_status === 'retrain') {
                this.setState({ showRetrain: true })
            }
        } catch (error) {
            console.log('Error fetching training status:', error);
        }
    }

    // 04-07-24

    CloseAdminTestOptions = () => {
        this.setState({ show_testing_options: false });
    }

    ContinueAdminTest = (selected_options) => {
        this.setState({ show_testing_options: false });
        console.log('selected options: ', selected_options);

        const data = JSON.parse(JSON.stringify(this.state.selected_version));

        this.GoToAdminTestingPage(data, selected_options);
    }

    StartAdminTest = async (data, model) => {
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

        if (options.length > 0) {
            values.overall_testing = false;
            values.region_wise_testing = false;

            if (options.length >= 2) {
                values.option = 'Entire Component with Regions';
                values.overall_testing = true;
                values.region_wise_testing = true;
            } else if (options.includes("component_testing")) {
                values.option = 'Entire Component';
                values.overall_testing = true;
            } else if (options.includes("region_testing")) {
                values.option = 'Regions Only';
                values.region_wise_testing = true;
            }
        }

        sessionStorage.removeItem("modelData")
        localStorage.setItem('modelData', JSON.stringify(values));

        console.log('values ', values);

        this.props.history.push('/adminAccTesting');
    }

    //  end upto this
    back = () => {
        this.props.history.push("/modelVerInfo")
    }

    onDrop = async (data) => {
        const droppedData = JSON.parse(data.dragdrop);
        const { compModelVerInfo, selectedList } = this.state;

        try {
            const response = await urlSocket.post('/dragImg', { 'compModelInfo': compModelVerInfo[0], 'drgImg': droppedData }, { mode: 'no-cors' });
            const getInfo = response.data;
            this.setState({
                response_message: getInfo.message,
                compModelVerInfo: getInfo.comp_model_ver_info_list,
                refersh: true,
                images_length: getInfo.img_count
            })
            // Refresh the gallery data
            await this.imgGlry();

            if (selectedList.length !== 0) {
                // Filter groupedData based on selectedList
                const { imgGlr: updatedImgGlr } = this.state;
                const filteredGroupedData = selectedList.reduce((acc, itemList) => {
                    const version = itemList.value;
                    const itemsForVersion = updatedImgGlr.filter(item => item.used_model_ver.includes(version));
                    acc[version] = itemsForVersion;
                    return acc;
                }, {});

                // Update state with filtered data
                this.setState({ groupedData: filteredGroupedData });
            }
            setTimeout(() => {
                this.setState({ response_message: "" });
            }, 1000);
        } catch (error) {
            console.log('error', error)
        }
    }

    tog_xlarge = () => {
        this.setState(prevState => ({
            modal_xlarge: !prevState.modal_xlarge,
        }))
        this.log()
        this.removeBodyCss()
    }

    // Function for Log info
    log = () => {
        const { compModelVerInfo } = this.state;
        try {
            urlSocket.post('/version_log_info', { 'comp_name': compModelVerInfo[0].comp_name, 'model_name': compModelVerInfo[0].model_name, "comp_code": compModelVerInfo[0].comp_code, "model_ver": compModelVerInfo[0].model_ver },
                { mode: 'no-cors' })
                .then((response) => {
                    let data1 = response.data;
                    this.setState({ log_data: data1 })
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }

    removeBodyCss() {
        document.body.classList.add("no_padding")
    }

    handleChange = (e) => {
        const { imgGlr } = this.state;
        imgGlr.map((img, imgId) => {
            if (img.filename === e.target.name) {
                img.checked = e.target.checked
            }
        })
        this.setState({ imgGlr })
    }

    // shareImgData = () => {
    //     const { imgGlr, compModelVerInfo } = this.state;
    //     imgGlr.map((img, imgId) => {
    //         if(img.checked === true) {
    //             try {
    //                 urlSocket.post('/sharedImage', { 'compModelInfo': compModelVerInfo[0], 'imageData': img },
    //                     { mode: 'no-cors' })
    //                     .then((response) => {
    //                         let data1 = response.data
    //                         // console.log('imageData638 : ', data1.comp_model_ver_info_list)
    //                         console.log('imageData638 : ', data1)
    //                         this.setState({compModelVerInfo:response.data.comp_model_ver_info_list})
    //                         if(this.state.selectedList.length === 0) {
    //                             this.imgGlry()
    //                         }
    //                         else {
    //                             this.imgGlry()
    //                             this.onSelectValues(this.state.selectedList)
    //                         }
    //                     })
    //                     .catch((error) => {
    //                         console.log(error)
    //                     })
    //             } catch (error) {
    //                 console.log(error)
    //             }
    //         }
    //     })
    // }

    shareImgData = async () => {
        const { imgGlr, compModelVerInfo, selectedList } = this.state;

        for (const img of imgGlr) {
            if (img.checked === true) {
                try {
                    const response = await urlSocket.post('/sharedImage', {
                        'compModelInfo': compModelVerInfo[0],
                        'imageData': img
                    }, {
                        mode: 'no-cors'
                    });

                    let data1 = response.data;
                    this.setState({
                        response_message: response.data.message,
                        compModelVerInfo: response.data.comp_model_ver_info_list,
                        images_length: response.data.img_count
                    });
                    setTimeout(() => {
                        this.setState({ response_message: "" });
                    }, 1000);

                } catch (error) {
                    console.log(error);
                }
            }
        }
        // Refresh the gallery data
        await this.imgGlry();

        if (selectedList.length !== 0) {
            // Filter groupedData based on selectedList
            const { imgGlr: updatedImgGlr } = this.state;
            const filteredGroupedData = selectedList.reduce((acc, itemList) => {
                const version = itemList.value;
                const itemsForVersion = updatedImgGlr.filter(item => item.used_model_ver.includes(version));
                acc[version] = itemsForVersion;
                return acc;
            }, {});

            // Update state with filtered data
            this.setState({ groupedData: filteredGroupedData });
        }
    }


    onSelectValues = (selectedList, selectedItem) => {
        const { imgGlr } = this.state;
        this.setState({ selectedList })
        const groupedData = imgGlr.reduce((acc, item) => {
            item.used_model_ver.forEach((version) => {
                // Check if the version key exists, if not, create it
                if (!acc[version]) {
                    acc[version] = [];
                }
                // Push the item to the array of that version
                acc[version].push(item);
            });

            return acc;
        }, {});
        const filteredGroupedData = selectedList.reduce((acc, itemList) => {
            const version = itemList.value;
            if (groupedData[version]) {
                acc[version] = groupedData[version];
            }
            return acc;
        }, {});


        // Update state with filtered data
        this.setState({ groupedData: filteredGroupedData });

    }

    onRemove = (selectedList, selectedItem, index) => {

        const { imgGlr } = this.state;
        if (selectedList.length === 0) {
            const groupedData = imgGlr.reduce((acc, item) => {
                item.used_model_ver.forEach((version) => {
                    // Check if the version key exists, if not, create it
                    if (!acc[version]) {
                        acc[version] = [];
                    }
                    // Push the item to the array of that version
                    acc[version].push(item);
                });

                return acc;
            }, {});
            this.setState({ groupedData })
        }
        else {
            this.setState({ selectedList })
            const groupedData = imgGlr.reduce((acc, item) => {
                item.used_model_ver.forEach((version) => {
                    // Check if the version key exists, if not, create it
                    if (!acc[version]) {
                        acc[version] = [];
                    }
                    // Push the item to the array of that version
                    acc[version].push(item);
                });

                return acc;
            }, {});
            const filteredGroupedData = selectedList.reduce((acc, itemList) => {
                const version = itemList.value;
                if (groupedData[version]) {
                    acc[version] = groupedData[version];
                }
                return acc;
            }, {});

            // Update state with filtered data
            this.setState({ groupedData: filteredGroupedData });
        }
    }

    // not needed
    versionHide = (ids) => {
        const { hidVer } = this.state;
        const index = hidVer.indexOf(ids);
        index !== -1 ? hidVer.splice(index, 1) : hidVer.push(ids);
        this.setState({ hidVer: hidVer })
    }

    imagesLength(activeGroupData, model_ver, lable_name) {

        const labelItemCount = Object.entries(activeGroupData)
            .filter(([version]) => model_ver === parseInt(version))
            .flatMap(([_, items]) => items)
            .filter(item => item.imagePathType[0].type === lable_name)
            .length;

        return labelItemCount;

    }


    handleCheckboxChange = (item, ver) => {
        const { selectedImages, img_paths } = this.state;
        const index = selectedImages.indexOf(item);

        let idxVal = item.used_model_ver.indexOf(parseInt(ver));

        let imgName = item.imagePathType[idxVal].image_path;

        if (index === -1) {
            // If not already selected, add to the array
            this.setState({
                selectedImages: [...selectedImages, item],
                img_paths: [...img_paths, imgName]
            });
        } else {
            // If already selected, remove from the array
            const updatedSelectedImages = [...selectedImages];
            updatedSelectedImages.splice(index, 1);

            const updatedPaths = [...img_paths];
            updatedPaths.splice(index, 1);
            this.setState({
                selectedImages: updatedSelectedImages,
                img_paths: updatedPaths
            });
        }
    };

    handleDeleteSelectedImages = async (img_path) => {
        let img_paths;
        if (img_path) {
            img_paths = [img_path]
        } else {
            img_paths = this.state.img_paths;
        }

        // Check if there are no images selected
        if (img_paths.length === 0) {
            Swal.fire({
                title: 'No items selected',
                icon: 'info',
                timer: 1500,
                showConfirmButton: false,
            });
            return; // Exit the function if no images are selected
        }

        // Show confirmation dialog
        Swal.fire({
            title: `Delete ${img_paths.length} item${img_paths.length > 1 ? 's' : ''}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result.isConfirmed) {
                // If yes
                this.imgDeletion(img_path)
            } else {
                // User clicked Cancel, do nothing or handle accordingly
            }
        });


    };

    imgDeletion = async (img_path) => {
        const {
            selectedImages, compModelVerInfo,
            lable_name, selectedList
        } = this.state;

        let img_paths;
        if (img_path) {
            img_paths = [img_path];
        } else {
            img_paths = this.state.img_paths;
        }

        try {

            const formData = new FormData();
            formData.append('_id', compModelVerInfo[0]._id);
            formData.append('labelName', lable_name);
            // formData.append('img_paths', img_paths);
            formData.append('img_paths', JSON.stringify(img_paths));
            formData.append('type', this.state.type);
            formData.append('position', this.state.position);

            const response = await urlSocket.post('/deleteSelectedImage', formData, {
                headers: {
                    'content-type': 'multipart/form-data'
                },
                mode: 'no-cors'
            });

            this.setState({
                response_message: response.data.message,
                compModelVerInfo: response.data.comp_model_ver_info_list,
                images_length: response.data.img_count
            });

            // Refresh the gallery data
            await this.imgGlry();

            if (selectedList.length !== 0) {
                // Filter groupedData based on selectedList
                const { imgGlr: updatedImgGlr } = this.state;
                const filteredGroupedData = selectedList.reduce((acc, itemList) => {
                    const version = itemList.value;
                    const itemsForVersion = updatedImgGlr.filter(item => item.used_model_ver.includes(version));
                    acc[version] = itemsForVersion;
                    return acc;
                }, {});

                // Update state with filtered data
                this.setState({ groupedData: filteredGroupedData });
            }

            setTimeout(() => {
                this.setState({ response_message: "" });
            }, 1000);
        } catch (error) {
            console.log('error', error);
        }

        // Clear selectedImages array after deletion
        this.setState({ selectedImages: [], img_paths: [] });
    }

    multiImgDelete = (items, img_label) => {
        const { selectedImages, img_paths, compModelVerInfo } = this.state;

        const allSelected = selectedImages.length === items.length;
        const updatedSelectedImages = allSelected ? [] : items;

        let std_img_paths = [];
        let ver = compModelVerInfo[0].model_ver;
        updatedSelectedImages.map((item, itemId) => {
            let idxVal = item.used_model_ver.indexOf(parseInt(ver));
            let imgName = item.imagePathType[idxVal].image_path;

            if (item.imagePathType[idxVal].type === img_label) {
                std_img_paths.push(imgName);
            }
        })

        this.setState({
            selectedImages: updatedSelectedImages,
            img_paths: std_img_paths
        })
    }


    // for image rotation in version wise integrated on 24/01/24

    similarityChange = async (value) => {
        this.setState({ rangeValue: value })
        const { compModelVerInfo } = this.state;
        try {
            const response = await urlSocket.post('/threshold_changes', { 'comp_name': compModelVerInfo[0].comp_name, 'comp_code': compModelVerInfo[0].comp_code, 'model_name': compModelVerInfo[0].model_name, 'model_ver': compModelVerInfo[0].model_ver, 'thres': value }, { mode: 'no-cors' });

            this.setState({ compModelVerInfo: response.data })

        } catch (error) {
            console.log('error', error)
        }

    }




    rotation = (e) => {
        this.setState({ img_rotation: e.target.checked })
        const { compModelVerInfo } = this.state;
        if (e.target.checked === true) {
            this.setState({ no_of_rotation: 1 })
        }
        if (e.target.checked === false) {
            this.setState({ no_of_rotation: 0 })
            // const { no_of_rotation} = this.state;
            try {
                const response = urlSocket.post('/rotation_update', { 'comp_name': compModelVerInfo[0].comp_name, 'comp_code': compModelVerInfo[0].comp_code, 'model_name': compModelVerInfo[0].model_name, 'model_ver': compModelVerInfo[0].model_ver, 'image_rotation': 0 }, { mode: 'no-cors' });

            } catch (error) {
                console.log('error', error)
            }
        }
    }

    rotationUpdate = async (rotate_val) => {
        let value = parseInt(rotate_val);

        // if (isNaN(value) || value < 1) {
        //     console.log('value1 : ', value);
        //     value = 1; // Set to minimum value
        // } 
        if (value > 100) {

            value = 100; // Set to maximum value
        }

        this.setState({ no_of_rotation: value })
        const { compModelVerInfo } = this.state;
        try {
            const response = await urlSocket.post('/rotation_update',
                {
                    'comp_name': compModelVerInfo[0].comp_name,
                    'comp_code': compModelVerInfo[0].comp_code,
                    'model_name': compModelVerInfo[0].model_name,
                    'model_ver': compModelVerInfo[0].model_ver,
                    'image_rotation': value
                }, { mode: 'no-cors' });

            this.setState({ compModelVerInfo: response.data })

        } catch (error) {
            console.log('error', error)
        }
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

    setVersionData = (value) => {
        const show_train_image = value?.sift_train_datasets?.length > 0 ? true : false;
        this.setState({ compModelVerInfo: [value], show_train_image: show_train_image })
    }

    changeShowTrainImages = (data) => {
        const value = data === 0 ? false : true;
        this.setState({ show_train_image: value })
    }

    // image gallery - other versions

    imageSelectAll = (e) => {
        console.log('1st', new Date())
        const isChecked = e.target.checked;
        this.setState((prevState) => {
            const { imgGlr, compModelVerInfo, lable_name, selectedList } = prevState;

            const selectedVersions = selectedList.map((ver) => ver.value);
            const isNoVerSelected = selectedVersions.length === 0;
            const largeSet = new Set(selectedVersions);

            // Check function optimized
            const checkIfAnyExist = (smallArray) =>
                isNoVerSelected || smallArray.some((num) => largeSet.has(num));

            // Use batch updates to improve performance
            const updatedGallery = imgGlr.map((imgVal) => {
                if (
                    imgVal.imagePathType[0].type !== lable_name ||
                    imgVal.used_model_ver.includes(compModelVerInfo[0].model_ver)
                ) {
                    return imgVal;
                }

                return checkIfAnyExist(imgVal.used_model_ver)
                    ? { ...imgVal, checked: isChecked }
                    : imgVal;
            });

            return { imgGlr: updatedGallery };
        });
        console.log('2nd ', new Date())
    };

    getImgPath = (img_path) => {
        return ImageUrl + img_path
    };

    showOtherVersionImages = () => {
        const { imgGlr, lable_name, compModelVerInfo, selectedList } = this.state;

        const selectedVersions = new Set(selectedList.map((ver) => ver.value));
        const isNoVerSelected = selectedVersions.size === 0;
        const currentVersion = compModelVerInfo[0].model_ver;

        // Optimized function for checking version existence
        const checkIfAnyExist = (usedVersions) =>
            isNoVerSelected || usedVersions.some((num) => selectedVersions.has(num));

        let allImageCount = 0;
        let selectedCount = 0;

        const filteredImages = imgGlr.filter((imgVal) => {
            if (imgVal.imagePathType[0].type !== lable_name) return false;
            if (!checkIfAnyExist(imgVal.used_model_ver)) return false;
            if (imgVal.used_model_ver.length === 1 && imgVal.used_model_ver.includes(currentVersion)) return false;

            allImageCount++;

            if (imgVal.used_model_ver.includes(currentVersion) || imgVal.checked) {
                selectedCount++;
            }

            return true;
        });
        const isAllChecked = allImageCount > 0 && allImageCount === selectedCount;
        return (
            <>
                <div className="d-flex justify-content-between my-2">
                    <h5 className="fw-bold">Other Versions</h5>
                    <Button color="primary" className="btn btn-sm w-sm" onClick={this.shareImgData}>
                        Share
                    </Button>
                </div>
                <FormGroup check className="d-flex align-items-center gap-2 my-2">
                    <Input
                        type="checkbox"
                        id="customCheckbox"
                        checked={isAllChecked}
                        onChange={this.imageSelectAll}
                        className="custom-control-input"
                    />
                    <Label
                        for="customCheckbox"
                        className="fw-bold my-auto"
                        style={{ cursor: "pointer", userSelect: "none" }}
                    >
                        Select All
                    </Label>
                </FormGroup>
                <Row className="scroll-design" style={{ height: "70vh", overflowY: "auto" }}>
                    {filteredImages.map((imgVal, imgId) => {
                        const isCurrentVersion = imgVal.used_model_ver.includes(currentVersion);
                        return (
                            <Col md={3} lg={3} key={imgId}>
                                <Draggable type="dragdrop" data={JSON.stringify(imgVal)}>
                                    <Card
                                        style={{
                                            borderRadius: "7px",
                                            border: `2px solid ${isCurrentVersion ? "red" : "green"}`,
                                            background: isCurrentVersion ? "pink" : "transparent",
                                        }}
                                    >
                                        <FormGroup check className="d-flex align-items-center gap-2 mb-2 ms-2">
                                            <Input
                                                type="checkbox"
                                                id={`${imgVal.filename}-${imgId}`}
                                                name={imgVal.filename}
                                                checked={isCurrentVersion || !!imgVal.checked}
                                                onChange={(e) => !isCurrentVersion && this.handleChange(e)}
                                                className="custom-control-input"
                                            />
                                            <Label
                                                for={`${imgVal.filename}-${imgId}`}
                                                className="fw-bold my-auto"
                                                style={{ cursor: "pointer", userSelect: "none" }}
                                            >
                                                Select
                                            </Label>
                                        </FormGroup>
                                        <Image src={this.getImgPath(imgVal.imagePathType[0].image_path)} alt="image not loaded" />
                                        <p className="fw-bold ms-2 mt-2">
                                            {`Used In: ${imgVal.used_model_ver.join(", ")}`}
                                        </p>
                                    </Card>
                                </Draggable>
                            </Col>
                        );
                    })}
                </Row>
            </>
        );
    };

    takeSnapshot = () => {
        const video = this.webcam.video; // Access the webcam video

        if (!video) {
            alert("Camera not ready");
            return;
        }

        const fullWidth = video.videoWidth;
        const fullHeight = video.videoHeight;

        // Create a canvas to draw the zoomed image
        const canvas = document.createElement("canvas");
        canvas.width = fullWidth;
        canvas.height = fullHeight;
        const ctx = canvas.getContext("2d");

        // Apply the zoom factor
        const zoomedWidth = fullWidth / this.state.cameraZoom;
        const zoomedHeight = fullHeight / this.state.cameraZoom;
        const sx = (fullWidth - zoomedWidth) / 2; // X offset for zoomed crop
        const sy = (fullHeight - zoomedHeight) / 2; // Y offset for zoomed crop

        // Draw the zoomed portion of the video onto the canvas
        ctx.drawImage(video, sx, sy, zoomedWidth, zoomedHeight, 0, 0, fullWidth, fullHeight);

        // Convert the canvas content to a data URL (for full quality)
        const dataUrl = canvas.toDataURL("image/jpeg", 1.0);

        // Update state with the captured image data
        return dataUrl;
    };

    handleZoomChange = (e) => {
        this.setState({ cameraZoom: parseFloat(e.target.value) });
    };

    resetZoom = () => {
        this.setState({ cameraZoom: 1 });
    };

    render() {
        const {
            compModelVerInfo, positive, negative, selectFilter,
            showCamera, showLabelName, reqImgCount, lable_name,
            webcamEnabled, config, showTrainingINProgs,
            refersh, imgGlr, showGallery, log_data,
            activeTab, customActiveTab,
            uniqueModelVersions, groupedData, activeGroupData,
            showRetrain, addAccTestInProg, selectedImages,
        } = this.state;
        const marks = {
            0: <Tooltip title="Min">0</Tooltip>,
            1: <Tooltip title="Max">1</Tooltip>,
        };
        const marks1 = {
            0: 0,
            200: 200
        }
        const tooltipFormatter = (value) => {
            if (value === 0) {
                return 'Min'; // Custom label for the minimum value
            } else if (value === 1) {
                return 'Max'; // Custom label for the maximum value
            } else {
                // Format other values as needed (e.g., display two decimal places)
                return (value);
                // return (value * 100).toFixed(2) + '%';
            }
        };

        const videoConstraints = {
            height: DEFAULT_RESOLUTION.height, width: DEFAULT_RESOLUTION.width,
            facingMode: "user"
        };
        // const approvedTrainedModelData = compModelVerInfo.find(data => data.training_status === 'admin approved trained model');
        let diffVal = uniqueModelVersions
            ? uniqueModelVersions
                .filter(ver => ver !== compModelVerInfo[0].model_ver)
                .map(number => ({ label: `Version ${number}`, value: number }))
            : [];

        return (
            <>
                <div className='page-content'>
                    <MetaTags>
                        <title>Component Information</title>
                    </MetaTags>
                    <Breadcrumbs
                        title="MODEL CREATION"
                        isBackButtonEnable={true}
                        gotoBack={this.back}
                    />
                    <Container fluid>
                        <Card>
                            <CardBody>
                                <Row className="d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-2 mb-2">
                                    <Col xs="12" lg="auto" className="text-left">
                                        <CardTitle className="mb-0 "><span className="me-2 font-size-12">Component Name :</span>{this.state.comp_name}</CardTitle>
                                        <CardText className="mb-0"><span className="me-2 font-size-12">Component Code :</span>{this.state.comp_code}</CardText>
                                        <CardText className="mb-0"><span className="me-2 font-size-12">Model Name:</span>{this.state.model_name}</CardText>
                                        <CardText className="mb-0"><span className="me-2 font-size-12">Type:</span>{this.state.type}</CardText>
                                    </Col>
                                </Row>
                                {
                                    this.state.modelVersionLoading ?
                                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                                            <Spinner color="primary" />
                                            <h5 className="mt-4">
                                                <strong>Loading Model Version Details...</strong>
                                            </h5>
                                        </div> 
                                    :
                                        <>
                                            <Row>
                                                <Col lg={6} >
                                                    <Label style={{ fontWeight: 'bold' }}>Similarity Adjustment </Label>
                                                    <Slider min={0.00} max={1.00} step={0.01} value={this.state.rangeValue} 
                                                        tooltip={{ open: true, placement: 'top', overlayStyle: { zIndex: 1000 }}}
                                                        onChange={this.similarityChange} marks={marks}
                                                    />
                                                </Col>
                                                {/* Image Rotation */}
                                                {
                                                    this.state.activeTab !== '2' && this.state.position !== 'Fixed' && this.state.type !== 'ML' &&
                                                    <Col lg={3} >
                                                        <Checkbox style={{
                                                            borderColor: 'slategray', borderWidth: '2px', borderStyle: 'solid', borderRadius: '7px', height: '20px',
                                                            width: '20px'
                                                        }}
                                                            onChange={(e) => this.rotation(e)}
                                                            checked={this.state.img_rotation}
                                                        />
                                                        <Label style={{ fontWeight: 'bold', marginLeft: '5px' }}>Image rotation </Label>
                                                        <Row>
                                                            <Col lg={6}>
                                                                <input
                                                                    type='number'
                                                                    className="form-control"
                                                                    placeholder='Enter No.Of.Rotations'
                                                                    value={this.state.no_of_rotation}
                                                                    onChange={(e) => this.rotationUpdate(e.target.value)}
                                                                    disabled={this.state.img_rotation === false}
                                                                    min={1}
                                                                    max={100}
                                                                >
                                                                </input>
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                }
                                            </Row>
                                            {/* version data in Table */}
                                            {
                                                refersh ?
                                                    <div className='table-responsive mt-2 mb-4'>
                                                        <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
                                                            <thead className="table-light">
                                                                <tr>
                                                                    <th>Model Version</th>
                                                                    <th>Model Status</th>
                                                                    <th>Created on</th>
                                                                    <th>Approved on</th>
                                                                    <th>Live on</th>
                                                                    <th>Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {compModelVerInfo.map((data, index) => {
                                                                    let okCount = [];
                                                                    let notokCount = [];
                                                                    if (data.type === 'DL') {
                                                                        okCount = data.datasets.filter((dataset) => dataset.type === 'OK').length;
                                                                        notokCount = data.datasets.filter((dataset) => dataset.type === 'NG').length;
                                                                        okCount1 = okCount;
                                                                        notokCount1 = notokCount;
                                                                    }

                                                                    const isInactive = data.model_status === 'Inactive';
                                                                    const isTrainingInProgress = data.training_status === 'training_in_progress';
                                                                    // const isApprovedTrainedModel = data.model_status !== 'Live' && approvedTrainedModelData;
                                                                    const isApprovedTrainedModel = (data.training_status === 'admin approved trained model' && data.model_status !== 'Live');
                                                                    const isTrainingCompleted = data.training_status === 'training completed';
                                                                    const isRetrain = data.training_status === 'retrain';
                                                                    const isTrainingNotStarted = data.training_status === 'training_not_started';
                                                                    const isAdminAccuracyInProgress = data.training_status === 'admin accuracy testing in_progress';
                                                                    const isDl = data.type !== 'ML';
                                                                    return (
                                                                        <tr key={index} id='recent-list'>
                                                                            <td style={{ backgroundColor: "white" }}>{'V'}{data.model_ver}</td>
                                                                            <td style={{ backgroundColor: "white" }}>
                                                                                <span className={data.model_status === 'Live' ? 'badge badge-soft-success' : data.model_status === 'Approved' ? 'badge badge-soft-warning' : data.model_status === 'Draft' ? 'badge badge-soft-info' : 'badge badge-soft-danger'}>
                                                                                    {data.model_status}
                                                                                </span>
                                                                            </td>
                                                                            <td style={{ backgroundColor: "white" }}>{data.created_on}</td>
                                                                            <td style={{ backgroundColor: "white" }}>{data.approved_on}</td>
                                                                            <td style={{ backgroundColor: "white" }}>{data.live_on}</td>
                                                                            <td style={{ backgroundColor: "white", fontSize: '18px' }} >

                                                                                <>
                                                                                    <Button color="primary" className='btn btn-sm me-2' onClick={() => this.tog_xlarge()} data-toggle="modal" data-target=".bs-example-modal-xl" id={`log-${data._id}`}>
                                                                                        Log Info
                                                                                    </Button>
                                                                                    <UncontrolledTooltip placement="top" target={`log-${data._id}`}>
                                                                                        Log Info
                                                                                    </UncontrolledTooltip>
                                                                                </>

                                                                                {isInactive && (
                                                                                    <Button style={{ backgroundColor: 'green', color: 'white' }} onClick={() => this.activateModel(data, index)}>
                                                                                        Activate
                                                                                    </Button>
                                                                                )}

                                                                                {
                                                                                    !(data.type === 'ML') &&
                                                                                    // !(data.position === 'Fixed' && data.type === 'ML') &&
                                                                                    !showTrainingINProgs && !isInactive && !isTrainingInProgress && (
                                                                                        isTrainingCompleted ? (
                                                                                            <Button className='btn btn-sm' color='success' onClick={() => this.StartAdminTest(data)}>
                                                                                                Start Admin Accuracy Test
                                                                                            </Button>
                                                                                        ) : (() => {
                                                                                            if (isTrainingInProgress || !isTrainingNotStarted) return null;

                                                                                            const { result_mode } = compModelVerInfo[0];
                                                                                            const minOk = Number(config[0]?.min_ok_for_training);
                                                                                            const minNotOk = Number(config[0]?.min_notok_for_training);

                                                                                            const canTrain =
                                                                                                (result_mode === "both" && okCount >= minOk && notokCount >= minNotOk) ||
                                                                                                (result_mode === "ng" && notokCount >= minNotOk) ||
                                                                                                (result_mode === "ok" && okCount >= minOk);

                                                                                            return canTrain ? (
                                                                                                <Button className='btn btn-sm' color="primary" onClick={() => this.train(data)}>
                                                                                                    Train
                                                                                                </Button>
                                                                                            ) : null;
                                                                                        })()

                                                                                    )
                                                                                } {' '}

                                                                                {/* {!isTrainingInProgress && !isAdminAccuracyInProgress && !isInactive && !isRetrain && !showTrainingINProgs && (
                                                                                    <Button style={{ backgroundColor: 'red', color: 'white' }} onClick={() => this.deactivate(data, index)}>
                                                                                        Deactivate
                                                                                    </Button>
                                                                                )} {' '} */}

                                                                                {isAdminAccuracyInProgress && !showTrainingINProgs && !isTrainingInProgress && (
                                                                                    <div>
                                                                                        <p>Admin Accuracy Testing In_Progress</p>
                                                                                        <Link to='/adminAccTesting'>
                                                                                            <Button className='btn btn-sm' color="success" onClick={() => this.StartAdminTest(data)}>
                                                                                                Continue
                                                                                            </Button>
                                                                                        </Link>
                                                                                    </div>
                                                                                )}

                                                                                {/* training in progress before regions */}
                                                                                {/* {showTrainingINProgs && (
                                                                                    <div>
                                                                                        <Row className="col-lg-6">
                                                                                            {data.training_status_id === 0 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="primary" value={100} animated>Loading...</Progress></Progress>}
                                                                                            {data.training_status_id === 1 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={20}>20%</Progress><Progress bar color="primary" value={80} animated></Progress></Progress>}
                                                                                            {data.training_status_id === 2 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={40}>40%</Progress><Progress bar color="primary" value={60} animated></Progress></Progress>}
                                                                                            {data.training_status_id === 3 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={60}>60%</Progress><Progress bar color="primary" value={40} animated></Progress></Progress>}
                                                                                            {data.training_status_id === 4 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={80}>80%</Progress><Progress bar color="primary" value={20} animated></Progress></Progress>}
                                                                                            {data.training_status_id === 5 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={100}>100%</Progress></Progress>}
                                                                                            <div style={{ 'textAlign': 'center' }}>{data.training_start_time ? this.clock(data.training_start_time) : 'Training started ...'}</div>
                                                                                            <div className='loading-content'>
                                                                                                Training In Progress
                                                                                                <div className="dot-loader">
                                                                                                    <div className="dot"></div>
                                                                                                    <div className="dot"></div>
                                                                                                    <div className="dot"></div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </Row>
                                                                                    </div>
                                                                                )} */}
                                                                                {
                                                                                    (!(this.state.position == 'Fixed'
                                                                                        && this.state.region_selection === true
                                                                                    )) ?
                                                                                        showTrainingINProgs && (
                                                                                            <div>
                                                                                                <Row className="col-lg-6">
                                                                                                    {data.training_status_id === 0 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="primary" value={100} animated>Loading...</Progress></Progress>}
                                                                                                    {data.training_status_id === 1 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={20}>20%</Progress><Progress bar color="primary" value={80} animated></Progress></Progress>}
                                                                                                    {data.training_status_id === 2 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={40}>40%</Progress><Progress bar color="primary" value={60} animated></Progress></Progress>}
                                                                                                    {data.training_status_id === 3 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={60}>60%</Progress><Progress bar color="primary" value={40} animated></Progress></Progress>}
                                                                                                    {data.training_status_id === 4 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={80}>80%</Progress><Progress bar color="primary" value={20} animated></Progress></Progress>}
                                                                                                    {data.training_status_id === 5 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={100}>100%</Progress></Progress>}
                                                                                                    <div style={{ 'textAlign': 'center' }}>{data.training_start_time ? this.clock(data.training_start_time) : 'Training started ...'}</div>
                                                                                                    <div className='loading-content'>
                                                                                                        Training In Progress
                                                                                                        <div className="dot-loader">
                                                                                                            <div className="dot"></div>
                                                                                                            <div className="dot"></div>
                                                                                                            <div className="dot"></div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </Row>
                                                                                            </div>
                                                                                        )
                                                                                        :
                                                                                        showTrainingINProgs && (
                                                                                            <div>
                                                                                                <Row className='d-flex flex-column'>
                                                                                                    <div style={{ 'textAlign': 'start' }}>{data.training_start_time ? this.clock(data.training_start_time) : 'Training started ...'}</div>
                                                                                                    <div className='loading-content'>Training In Progress<div className="dot-loader"><div className="dot"></div><div className="dot"></div></div></div>

                                                                                                    {
                                                                                                        data?.region_selection ?
                                                                                                            <div className='d-flex flex-column'>
                                                                                                                <h5>Regions</h5>
                                                                                                                {data?.rectangles?.map((region, region_id) => (
                                                                                                                    <div key={region_id} className='d-flex flex-column'>
                                                                                                                        <h5>{region_id + 1}. {region.name}</h5>
                                                                                                                        <Row>
                                                                                                                            {region.training_status_id === 0 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="primary" value={100} animated>Loading...</Progress></Progress>}
                                                                                                                            {region.training_status_id === 1 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={20}>20%</Progress><Progress bar color="primary" value={80} animated></Progress></Progress>}
                                                                                                                            {region.training_status_id === 2 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={40}>40%</Progress><Progress bar color="primary" value={60} animated></Progress></Progress>}
                                                                                                                            {region.training_status_id === 3 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={60}>60%</Progress><Progress bar color="primary" value={40} animated></Progress></Progress>}
                                                                                                                            {region.training_status_id === 4 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={80}>80%</Progress><Progress bar color="primary" value={20} animated></Progress></Progress>}
                                                                                                                            {region.training_status_id === 5 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={100}>100%</Progress></Progress>}
                                                                                                                        </Row>
                                                                                                                    </div>
                                                                                                                ))}
                                                                                                            </div>
                                                                                                        : null
                                                                                                    }
                                                                                                    <div className='d-flex flex-column'>
                                                                                                        <h5>Component</h5>
                                                                                                        <Row>
                                                                                                            {data.training_status_id === 0 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="primary" value={100} animated>Loading...</Progress></Progress>}
                                                                                                            {data.training_status_id === 1 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={20}>20%</Progress><Progress bar color="primary" value={80} animated></Progress></Progress>}
                                                                                                            {data.training_status_id === 2 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={40}>40%</Progress><Progress bar color="primary" value={60} animated></Progress></Progress>}
                                                                                                            {data.training_status_id === 3 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={60}>60%</Progress><Progress bar color="primary" value={40} animated></Progress></Progress>}
                                                                                                            {data.training_status_id === 4 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={80}>80%</Progress><Progress bar color="primary" value={20} animated></Progress></Progress>}
                                                                                                            {data.training_status_id === 5 && <Progress multi style={{ height: '17px', fontWeight: 'bold' }}><Progress bar color="success" value={100}>100%</Progress></Progress>}
                                                                                                        </Row>
                                                                                                    </div>
                                                                                                </Row>
                                                                                            </div>
                                                                                        )
                                                                                }
                                                                                {
                                                                                    isRetrain &&
                                                                                    <div>
                                                                                        <Row>
                                                                                            <Progress multi style={{ height: '17px', fontWeight: 'bold' }}>
                                                                                                <Progress bar color="primary" value={100} animated>
                                                                                                    Training In Queue
                                                                                                </Progress>
                                                                                            </Progress>
                                                                                        </Row>
                                                                                    </div>
                                                                                }
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </Table>
                                                    </div> : null
                                            }

                                            {/* After including Navbar tab code  Here */}
                                            <div className={(showTrainingINProgs || showRetrain || addAccTestInProg || compModelVerInfo.some(data => data.model_status === 'Inactive')) ? 'hidden' : ''}>
                                                <div>
                                                    {this.state.type !== 'ML' ? (
                                                        <Nav tabs>
                                                            <React.Fragment>
                                                                {
                                                                    (this.state.compModelVerInfo[0]?.result_mode == 'ok' || this.state.compModelVerInfo[0]?.result_mode == 'both') &&
                                                                    <NavItem style={{ width: '10%' }}>
                                                                        <NavLink
                                                                            style={{
                                                                                cursor: 'pointer',
                                                                                color: activeTab === '1' ? 'green' : '',
                                                                                fontSize: '16px',
                                                                                fontWeight: activeTab === '1' ? 'bolder' : '',
                                                                            }}
                                                                            className={classnames({ active: this.state.activeTab === '1' })}
                                                                            onClick={() => this.getOK(positive, 0, '1')}
                                                                            disabled={showTrainingINProgs}
                                                                        >
                                                                            {positive}
                                                                        </NavLink>
                                                                    </NavItem>
                                                                }
                                                                {
                                                                    (this.state.compModelVerInfo[0]?.result_mode == 'ng' || this.state.compModelVerInfo[0]?.result_mode == 'both') &&
                                                                    <NavItem style={{ width: '10%' }}>
                                                                        <NavLink
                                                                            style={{
                                                                                cursor: 'pointer',
                                                                                color: activeTab === '2' ? 'red' : '',
                                                                                fontSize: '16px',
                                                                                fontWeight: activeTab === '2' ? 'bolder' : '',
                                                                            }}
                                                                            className={classnames({ active: this.state.activeTab === '2' })}
                                                                            onClick={() => this.getNotok(negative, 1, '2')}
                                                                            disabled={showTrainingINProgs}
                                                                        >
                                                                            {negative}
                                                                        </NavLink>
                                                                    </NavItem>
                                                                }
                                                            </React.Fragment>
                                                        </Nav>) : (
                                                        <Nav tabs>
                                                            <React.Fragment>
                                                                <NavItem style={{ width: '25%' }}>
                                                                    <NavLink
                                                                        style={{
                                                                            cursor: 'pointer',
                                                                            color: activeTab === '1' ? 'green' : '',
                                                                            fontSize: '16px',
                                                                            fontWeight: activeTab === '1' ? 'bolder' : '',
                                                                            textAlign: 'center'
                                                                        }}
                                                                        className={classnames({ active: this.state.activeTab === '1' })}
                                                                        onClick={() => this.getOK(positive, 0, '1')}
                                                                        disabled={showTrainingINProgs}
                                                                    >
                                                                        Reference Image
                                                                    </NavLink>
                                                                </NavItem>
                                                            </React.Fragment>
                                                        </Nav>
                                                    )
                                                    }
                                                    <TabContent activeTab={this.state.activeTab}>
                                                        <br /> <br />
                                                        <TabPane tabId="1">
                                                            <div>
                                                                <Nav tabs>
                                                                    {compModelVerInfo.map((data, index) => (
                                                                        data.model_status !== 'Inactive' && (
                                                                            <React.Fragment key={index}>
                                                                                {data.model_status !== 'Live' && (
                                                                                    <NavItem>
                                                                                        <NavLink
                                                                                            style={{
                                                                                                cursor: 'pointer',
                                                                                                color: this.state.customActiveTab === '2' ? 'red' : '',
                                                                                                fontSize: '20px',
                                                                                                fontWeight: this.state.customActiveTab === '2' ? 'bold' : '',
                                                                                            }}
                                                                                            outline={this.state.selectFilter !== 1}
                                                                                            className={classnames({ active: this.state.customActiveTab === '2' })}
                                                                                            onClick={() => this.startLiveCamera(1, 'OK', '2')}
                                                                                        >
                                                                                            Live Camera
                                                                                        </NavLink>
                                                                                    </NavItem>
                                                                                )}

                                                                                {
                                                                                    this.state.type !== 'ML' && 
                                                                                    this.state.versionCount > 1 &&
                                                                                    imgGlr && 
                                                                                    imgGlr.length > 1 && 
                                                                                    (
                                                                                    <NavItem>
                                                                                        <NavLink
                                                                                            style={{
                                                                                                cursor: 'pointer',
                                                                                                color: this.state.customActiveTab === '1' ? 'green' : '',
                                                                                                fontSize: '20px',
                                                                                                fontWeight: this.state.customActiveTab === '1' ? 'bold' : '',
                                                                                            }}
                                                                                            outline={this.state.selectFilter !== 0}
                                                                                            className={classnames({ active: this.state.customActiveTab === '1' })}
                                                                                            onClick={() => this.getImgGalleryInfo(0, 'OK', '1')}
                                                                                        >
                                                                                            Image Gallery
                                                                                        </NavLink>
                                                                                    </NavItem>
                                                                                )}
                                                                            </React.Fragment>
                                                                        )
                                                                    ))}
                                                                </Nav>
                                                            </div>

                                                        </TabPane>

                                                        <TabPane tabId="2">
                                                            <div>
                                                                <Nav tabs>
                                                                    {compModelVerInfo.map((data, index) => (
                                                                        data.model_status !== 'Live' && (
                                                                            <NavItem key={index}>
                                                                                <NavLink
                                                                                    style={{
                                                                                        cursor: "pointer",
                                                                                        color: customActiveTab === '4' ? 'red' : '',
                                                                                        fontSize: '20px',
                                                                                        fontWeight: customActiveTab === '4' ? 'bold' : ''
                                                                                    }}
                                                                                    outline={selectFilter !== 4}
                                                                                    className={classnames({ active: this.state.customActiveTab === "4" })}
                                                                                    onClick={() => this.startLiveCamera(4, 'NG', '4')}
                                                                                >
                                                                                    Live Camera
                                                                                </NavLink>
                                                                            </NavItem>
                                                                        )
                                                                    ))}
                                                                    {
                                                                        this.state.type !== 'ML' &&
                                                                        this.state.versionCount > 1 &&
                                                                        imgGlr &&
                                                                        imgGlr.length > 1 &&
                                                                        (
                                                                            <NavItem>
                                                                                <NavLink
                                                                                    style={{
                                                                                        cursor: "pointer",
                                                                                        color: customActiveTab === '3' ? 'green' : '',
                                                                                        fontSize: '20px',
                                                                                        fontWeight: customActiveTab === '3' ? 'bold' : ''
                                                                                    }}
                                                                                    outline={selectFilter !== 3}
                                                                                    className={classnames({ active: this.state.customActiveTab === "3" })}
                                                                                    onClick={() => this.getImgGalleryInfo(3, 'NG', '3')}
                                                                                >
                                                                                    Image Gallery
                                                                                </NavLink>
                                                                            </NavItem>
                                                                        )}
                                                                </Nav>
                                                            </div>
                                                        </TabPane>
                                                    </TabContent>
                                                </div>
                                                <div style={{ userSelect: 'none' }}>
                                                    {showCamera ? (
                                                        <Row lg={12} className='text-center'>
                                                            <Col sm={6} md={6} lg={6}>
                                                                <Card>
                                                                    <CardBody>
                                                                        {this.state.type === 'ML' &&
                                                                            <>
                                                                                <CardTitle className='mb-4'>
                                                                                    <div>
                                                                                        Capture Image for Reference
                                                                                    </div>
                                                                                </CardTitle>
                                                                            </>
                                                                        }
                                                                        {this.state.type !== 'ML' &&
                                                                            <>
                                                                                <CardTitle className='mb-4'>Capture Image for Training</CardTitle>
                                                                                <label>
                                                                                    {showLabelName} component (minimum required image: {reqImgCount})
                                                                                    No. of Added Images:
                                                                                    {
                                                                                        // showLabelName === 'OK' ? okCount1 : notokCount1
                                                                                        showLabelName == config[0].positive ? okCount1 :
                                                                                            showLabelName == config[0].negative ? notokCount1 :
                                                                                                null
                                                                                    }
                                                                                </label>
                                                                            </>
                                                                        }
                                                                        {
                                                                            this.state.position == 'Fixed' &&
                                                                            <>{
                                                                                <>
                                                                                    <div className='my-3'>
                                                                                        <Row>
                                                                                            <Col>
                                                                                                <Checkbox
                                                                                                    type="checkbox"
                                                                                                    checked={this.state.show_outline}
                                                                                                    onChange={() => this.showOutline()}
                                                                                                >Show Outline</Checkbox>
                                                                                            </Col>
                                                                                        </Row>
                                                                                    </div>

                                                                                    <Row className='my-2'>
                                                                                        <Col>
                                                                                            {
                                                                                                this.state.show_outline &&
                                                                                                <div className='d-flex my-auto'>
                                                                                                    <Label className='my-auto'>Outline Color : </Label>
                                                                                                    <div className='mx-3 d-flex'>
                                                                                                        {

                                                                                                            this.state.outline_colors.map((otline, otl_id) => (

                                                                                                                <Button
                                                                                                                    key={otl_id}
                                                                                                                    className='mx-1'
                                                                                                                    style={{
                                                                                                                        backgroundColor:
                                                                                                                            otline === "White Outline" ? 'white' :
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
                                                                                        </Col>
                                                                                    </Row>
                                                                                </>
                                                                            }</>

                                                                        }

                                                                        <div className="containerImg">
                                                                            {!webcamEnabled && <p className="small-text">Camera is not started. Please wait...</p>}
                                                                            {/* {imageSrcNone ? <p className='small-text'>Camera is not connected</p> : null} */}
                                                                            {webcamEnabled && (
                                                                                this.state.cameraDisconnected ?
                                                                                    <div className='my-2' style={{ outline: '2px solid #000', padding: '10px', borderRadius: '5px', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                                                                                        <div className='d-flex flex-column justify-content-center align-items-center webcam-disconnected' style={{ width: '100%' }}>
                                                                                            <h5 style={{ fontWeight: 'bold' }}>Webcam Disconnected</h5>
                                                                                            <Spinner className='mt-2' color="primary" />
                                                                                            <h6 className='mt-2' style={{ fontWeight: 'bold' }}>Please check your webcam connection....</h6>
                                                                                        </div>
                                                                                    </div>
                                                                                    :

                                                                                    <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
                                                                                        {
                                                                                            this.state.show_outline && this.state.webcamLoaded &&
                                                                                                // this.state.comp_info.datasets.white_path ?
                                                                                                this.state.outline_path ?
                                                                                                <img
                                                                                                    style={{
                                                                                                        width: '100%',
                                                                                                        position: 'absolute',
                                                                                                        height: 'auto',
                                                                                                        zIndex: '1',
                                                                                                    }}
                                                                                                    src={`${ImageUrl + this.state.outline_path}?${Date.now()}`}
                                                                                                // src={`${ImageUrl + this.state.comp_info.datasets.white_path}?${Date.now()}`}
                                                                                                ></img> : null
                                                                                        }
                                                                                        <div
                                                                                            style={{
                                                                                                display: "inline-block",
                                                                                                overflow: "hidden",
                                                                                                width: '100%',
                                                                                                height: 'auto',
                                                                                                // border: "2px solid #ccc",
                                                                                                // borderRadius: "8px",
                                                                                                // background: "#000",
                                                                                            }}
                                                                                        >
                                                                                            <div
                                                                                                style={{
                                                                                                    transform: `scale(${this.state.cameraZoom})`,
                                                                                                    transformOrigin: "center",
                                                                                                    transition: "transform 0.2s ease-in-out",
                                                                                                }}
                                                                                            >
                                                                                                <Webcam
                                                                                                    videoConstraints={videoConstraints}
                                                                                                    audio={false}
                                                                                                    height={'auto'}
                                                                                                    screenshotFormat="image/png"
                                                                                                    width={'100%'}
                                                                                                    ref={node => this.webcam = node}
                                                                                                    style={{ borderRadius: '10px' }}
                                                                                                    onLoadedData={this.handleWebcamLoad}
                                                                                                />
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            {
                                                                                this.state.adding_image && this.state.webcamLoaded ?
                                                                                    <Button className="btn btn-sm w-md" color='info' style={{ whiteSpace: 'pre' }} disabled>
                                                                                        Adding Images...  <Spin spinning={true}></Spin>
                                                                                    </Button>
                                                                                    :
                                                                                    (webcamEnabled && this.state.cameraDisconnected === false) &&
                                                                                    <Button className="btn btn-sm w-md" color='primary' onClick={() => this.captureImage(lable_name)}>Add Image</Button>
                                                                            }
                                                                            {
                                                                                this.state.adding_train_image &&
                                                                                <Button className="btn btn-sm w-md ms-3" color='info' style={{ whiteSpace: 'pre' }} disabled>
                                                                                    Adding Train Image...  <Spin spinning={true}></Spin>
                                                                                </Button>
                                                                            }
                                                                        </div>
                                                                        <div>
                                                                            <label>Zoom: </label>
                                                                            <input
                                                                                type="range"
                                                                                min={1.0}
                                                                                max={3.0}
                                                                                step="0.1"
                                                                                value={this.state.cameraZoom}
                                                                                onChange={this.handleZoomChange}
                                                                            />
                                                                            <span style={{ marginLeft: '1rem' }}>{this.state.cameraZoom.toFixed(1)}x</span>
                                                                            <button onClick={this.resetZoom} style={{ marginLeft: '1rem' }}>
                                                                                Reset Zoom
                                                                            </button>
                                                                        </div>
                                                                    </CardBody>
                                                                </Card>
                                                            </Col>
                                                            <Col className='scrlHide' sm={6} md={6} lg={6} style={{ boxShadow: '0px 0px 10px grey', borderRadius: '5px', height: '70vh', overflowY: 'auto' }}>
                                                                {/* {this.state.type !== 'ML' && this.state.position === 'any' ? ( */}
                                                                {
                                                                    this.state.type === 'DL' &&
                                                                    <Card className='mt-2' style={{ position: 'relative' }}>
                                                                        <div style={{ position: 'absolute', zIndex: '2' }}>
                                                                            {this.state.response_message && (
                                                                                <Alert severity={this.state.response_message === 'Image successfully added' ? 'success' : 'error'}>
                                                                                    <AlertTitle style={{ fontWeight: 'bold', margin: 'auto' }}>{this.state.response_message}</AlertTitle>
                                                                                </Alert>
                                                                            )}
                                                                        </div>
                                                                        {
                                                                            this.state.images_length < 1 ?
                                                                                <Row>
                                                                                    <h5 className='my-3' style={{ fontWeight: 'bold', textAlign: 'center' }}>
                                                                                        No Images available....
                                                                                    </h5>
                                                                                    <br />
                                                                                    <h6 className='my-3' style={{ fontWeight: 'bold', textAlign: 'center' }}>
                                                                                        Add Images from the Live Camera...
                                                                                    </h6>
                                                                                </Row>
                                                                                :
                                                                                Object.entries(activeGroupData).map(([version, items], verId) => {
                                                                                    if (compModelVerInfo[0].model_ver === parseInt(version)) {
                                                                                        let imgCount = 0;
                                                                                        return (
                                                                                            <React.Fragment key={verId}>

                                                                                                <div className='d-flex justify-content-between align-items-center'>
                                                                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                                                        <Checkbox
                                                                                                            style={{
                                                                                                                borderColor: 'slategray',
                                                                                                                borderWidth: '2px',
                                                                                                                borderStyle: 'solid',
                                                                                                                borderRadius: '7px',
                                                                                                                height: '20px',
                                                                                                                width: '20px',
                                                                                                                marginRight: '5px', // Add margin if needed
                                                                                                            }}
                                                                                                            checked={selectedImages.length === items.length}
                                                                                                            onChange={() => {
                                                                                                                this.multiImgDelete(items, lable_name);
                                                                                                            }}
                                                                                                        />
                                                                                                        <span>Select All</span>
                                                                                                    </div>
                                                                                                    <Button className="btn btn-sm w-sm" color='danger' onClick={() => this.handleDeleteSelectedImages()}>
                                                                                                        Delete
                                                                                                    </Button>
                                                                                                </div>

                                                                                                <Row key={verId} className='mt-2'>
                                                                                                    {items.map((item, itemId) => {
                                                                                                        if (item.imagePathType[0].type === lable_name) {
                                                                                                            const isSelected = selectedImages.includes(item);
                                                                                                            return (
                                                                                                                <Col sm={3} md={3} key={itemId}>
                                                                                                                    <Card style={{ borderRadius: '7px' }}>
                                                                                                                        <CardBody style={{ padding: '7px', border: isSelected ? '2px solid red' : '2px solid green', borderRadius: '7px' }}>

                                                                                                                            <div style={{ fontWeight: 'bold', textAlign: 'left', whiteSpace: 'pre' }}>
                                                                                                                                <Checkbox style={{
                                                                                                                                    borderColor: 'slategray', borderWidth: '2px', borderStyle: 'solid', borderRadius: '7px', height: '20px',
                                                                                                                                    width: '20px'
                                                                                                                                }}
                                                                                                                                    checked={isSelected}
                                                                                                                                    onChange={() => this.handleCheckboxChange(item, version)}
                                                                                                                                />
                                                                                                                                {'   '}
                                                                                                                                {imgCount += 1}
                                                                                                                            </div>
                                                                                                                            <Image src={this.getImages(item.imagePathType[item.used_model_ver.indexOf(parseInt(version))])} alt='Image not there' />
                                                                                                                            <div style={{ fontWeight: 'bold', textAlign: 'left' }}>
                                                                                                                                Used In : {item.used_model_ver.join(', ')}
                                                                                                                            </div>
                                                                                                                            <div style={{ textAlign: 'right' }}>
                                                                                                                                <Popconfirm placement="rightBottom" title="Do you want to delete?" onConfirm={() => this.deleteImageClick(item, compModelVerInfo[0].model_ver, lable_name)} okText="Yes">
                                                                                                                                    <DeleteTwoTone twoToneColor="red" style={{ fontSize: '18px', background: 'white', borderRadius: '5px' }} />
                                                                                                                                </Popconfirm>
                                                                                                                            </div>
                                                                                                                        </CardBody>
                                                                                                                    </Card>
                                                                                                                </Col>
                                                                                                            );
                                                                                                        }

                                                                                                    })}
                                                                                                </Row>
                                                                                            </React.Fragment>
                                                                                        )
                                                                                    }

                                                                                })
                                                                        }
                                                                    </Card>
                                                                }
                                                                
                                                                {
                                                                    this.state.type === 'ML' &&
                                                                    (

                                                                        this.state.show_train_image === true ?
                                                                            <TrainImages versionData={compModelVerInfo[0]} setVersionData={(e) => this.setVersionData(e)} />
                                                                            :
                                                                            // For ML (single image adding only)
                                                                            <>
                                                                                <Row >
                                                                                    {
                                                                                        this.state.images_length < 1 ?
                                                                                            <Col>
                                                                                                <h5 className='my-3' style={{ fontWeight: 'bold', textAlign: 'center' }}>
                                                                                                    No Images Preview available....
                                                                                                </h5>
                                                                                                <br />
                                                                                                <h6 className='my-3' style={{ fontWeight: 'bold', textAlign: 'center' }}>
                                                                                                    Add Images from the Live Camera...
                                                                                                </h6>
                                                                                            </Col> :
                                                                                            <>
                                                                                                {
                                                                                                    compModelVerInfo[0]?.model_name !== 'SIFT' &&
                                                                                                    <Col sm={12} md={12} lg={12} className='d-flex justify-content-end my-2'>
                                                                                                        <Button className="btn btn-sm w-sm" color='danger' onClick={() => this.handleDeleteSelectedImages(this.state.compModelVerInfo[0].datasets[0].image_path)}>
                                                                                                            Delete
                                                                                                        </Button>
                                                                                                    </Col>
                                                                                                }

                                                                                                <Col sm={6} md={6} lg={6}>
                                                                                                    <Card className='mt-2' style={{ position: 'relative', backgroundColor: '#f0f0f0', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '2px solid #ddd' }}>
                                                                                                        <CardTitle className='my-2' style={{ color: '#333', borderBottom: '2px solid #ddd', padding: '0.5rem 1rem' }}>Reference Image</CardTitle>
                                                                                                        <CardBody>
                                                                                                            <Image src={this.getImages({ ...compModelVerInfo[0].datasets[0], image_path: compModelVerInfo[0].datasets[0].image_path })} alt='Image not there' />
                                                                                                        </CardBody>
                                                                                                    </Card>
                                                                                                </Col>
                                                                                            </>
                                                                                    }
                                                                                </Row>
                                                                            </>
                                                                    )
                                                                }
                                                                {/* show sift Training Images */}
                                                                {/* {
                                                this.state.type === 'ML' && 
                                                // this.state.images_length == 1 &&
                                                <React.Fragment>
                                                    <InputGroup>
                                                        <Label color='info'>Training Images</Label>
                                                    </InputGroup>
                                                    <Row>
                                                    {
                                                        compModelVerInfo[0]?.datasets
                                                        .filter((train_img, id) => train_img.sift_train_img == '')
                                                        .map((image, img_id) => (
                                                            <Col sm={3} md={3} lg={3} key={img_id}>
                                                                <Card style={{ borderRadius: '7px' }}>
                                                                    <CardBody
                                                                        style={{
                                                                            padding: '7px',
                                                                            border: '2px solid green',
                                                                            borderRadius: '7px'
                                                                        }}
                                                                    >
                                                                        <Image style={{ width: '100%', height: 'auto' }} src={ImageUrl + image.image_path} />
                                                                    </CardBody>
                                                                </Card>
                                                            </Col>    
                                                        ))
                                                    }
                                                    </Row>
                                                </React.Fragment>
                                            } */}
                                                            </Col>

                                                        </Row>
                                                    ) : null}
                                                </div>

                                                <div className='storedImages mt-5' style={{ userSelect: 'none' }}>
                                                    {showGallery && (
                                                        <Card>
                                                            <Row>
                                                                <label style={{ textAlign: 'center' }}>
                                                                    {showLabelName} component (minimum required image: {reqImgCount})
                                                                    No. of Added Images:
                                                                    {
                                                                        showLabelName == config[0].positive ? okCount1 :
                                                                            showLabelName == config[0].negative ? notokCount1 :
                                                                                null
                                                                    }
                                                                </label>
                                                                {/* <Col className='scrlHide' sm={6} md={6} style={{ border: '1px solid' }}>
                                                                    <div>
                                                                        <h5 className='ftOtVer'>
                                                                            Other Versions
                                                                        </h5>
                                                                    </div>
                                                                    <Multiselect
                                                                        onRemove={(selectedList, selectedItem) => this.onRemove(selectedList, selectedItem)}
                                                                        onSelect={(selectedList, selectedItem, index) => this.onSelectValues(selectedList, selectedItem, index)}
                                                                        options={diffVal}
                                                                        displayValue="label"
                                                                        closeOnSelect={false}
                                                                    // selectedValues={}
                                                                    />
                                                                    <Button className='my-2' onClick={() => this.shareImgData()}>Share</Button>
                                                                    <div className='mt-2' style={{ height: '90vh', overflowY: 'auto', padding: '12px' }}>
                                                                        <Row >
                                                                            {Object.entries(groupedData).map(([version, items], verId) => {
                                                                                if (compModelVerInfo[0].model_ver !== parseInt(version)) {
                                                                                    return (
                                                                                        // <div className='my-2' style={{ background: 'lightblue', borderRadius: '7px' }} key={verId}>
                                                                                        <div style={{ background: 'lightcyan', borderRadius: '7px' }} key={verId} >
                                                                                            <div className='my-2' style={{ width: '100%' }} onClick={() => { this.versionHide(verId) }}>
                                                                                                <h5
                                                                                                    style={{
                                                                                                        fontWeight: 'bold', whiteSpace: 'pre', cursor: 'pointer', // Set cursor to pointer
                                                                                                    }}
                                                                                                >
                                                                                                    Version: {version}{' '} {this.state.hidVer.includes(verId) ? (<CaretRightOutlined />) : (<CaretDownOutlined />
                                                                                                    )}
                                                                                                </h5>
                                                                                            </div>
                                                                                            <Row>
                                                                                                {
                                                                                                    // hiddenVersion
                                                                                                    this.state.hidVer.includes(verId) ? null :
                                                                                                        items.map((item, itemId) => {
                                                                                                            if (item.imagePathType[0].type === lable_name) {
                                                                                                                return (
                                                                                                                    <Col sm={3} md={3} key={itemId} className={item.used_model_ver.includes(compModelVerInfo[0].model_ver) ? 'aSltdImg' : ''}>
                                                                                                                        <Draggable type="dragdrop" data={JSON.stringify(item)}>
                                                                                                                            <Card style={item.used_model_ver.includes(compModelVerInfo[0].model_ver) ? { borderRadius: '7px', background: 'pink', border: '2px solid red' } : { borderRadius: '7px', border: '2px solid green' }}>
                                                                                                                                <CardBody style={{ padding: '7px', borderRadius: '7px' }}>
                                                                                                                                    {
                                                                                                                                        item.used_model_ver.includes(compModelVerInfo[0].model_ver) ?
                                                                                                                                            <Checkbox checked={true} />
                                                                                                                                            :
                                                                                                                                            <Checkbox
                                                                                                                                                style={{
                                                                                                                                                    borderColor: 'slategray', borderWidth: '2px', borderStyle: 'solid', borderRadius: '7px', height: '20px',
                                                                                                                                                    width: '20px'
                                                                                                                                                }}
                                                                                                                                                name={item.filename}
                                                                                                                                                value={item}
                                                                                                                                                checked={item?.checked || false}
                                                                                                                                                onChange={(e) => this.handleChange(e)}
                                                                                                                                            />
                                                                                                                                    }
                                                                                                                                    <Img src={this.getImages(item.imagePathType[item.used_model_ver.indexOf(parseInt(version))])} alt='Image not there' />
                                                                                                                                    <div style={{ fontWeight: 'bold', textAlign: 'left' }}>
                                                                                                                                        Used In : {item.used_model_ver.join(', ')}
                                                                                                                                    </div>
                                                                                                                                </CardBody>
                                                                                                                            </Card>
                                                                                                                        </Draggable>
                                                                                                                    </Col>
                                                                                                                )
                                                                                                            }

                                                                                                        })
                                                                                                }
                                                                                            </Row>
                                                                                        </div>
                                                                                    )
                                                                                }
                                                                            })}
                                                                        </Row>
                                                                    </div>
                                                                </Col> */}
                                                                {/*  */}
                                                                <Col className='scrlHide' sm={6} md={6} style={{ border: '1px solid' }}>
                                                                    <Multiselect
                                                                        onRemove={(selectedList, selectedItem) => this.onRemove(selectedList, selectedItem)}
                                                                        onSelect={(selectedList, selectedItem, index) => this.onSelectValues(selectedList, selectedItem, index)}
                                                                        options={diffVal}
                                                                        displayValue="label"
                                                                        closeOnSelect={false}
                                                                        placeholder='select versions...'
                                                                    // selectedValues={}
                                                                    />
                                                                    {/* display all version images */}
                                                                    {
                                                                        imgGlr?.length > 0 ?
                                                                        this.showOtherVersionImages()
                                                                        : null
                                                                    }
                                                                </Col>
                                                                {/*  */}
                                                                <Col className='scrlHide' sm={6} md={6} style={{ border: '1px solid' }}>
                                                                    <Droppable types={['dragdrop']} onDrop={this.onDrop.bind(this)}>
                                                                        <div>
                                                                            <h5 className='ftOtVer'>
                                                                                Active Version
                                                                            </h5>
                                                                        </div>
                                                                        {/* <Row className='mt-2' style={{position: 'relative', height: '90vh', overflowY: 'auto' }}> */}
                                                                        <Card className='mt-2' style={{ position: 'relative', height: '97vh', overflowY: 'auto', overflowX: 'hidden' }}>
                                                                            <div style={{ position: 'absolute', zIndex: '2' }}>
                                                                                {this.state.response_message && (
                                                                                    <Alert severity={this.state.response_message === 'Image successfully added' ? 'success' : 'error'}>
                                                                                        <AlertTitle style={{ fontWeight: 'bold', margin: 'auto' }}>{this.state.response_message}</AlertTitle>
                                                                                    </Alert>
                                                                                )}
                                                                            </div>
                                                                            {
                                                                                this.state.images_length < 1 ?
                                                                                    <Row>
                                                                                        <h5 className='my-3' style={{ fontWeight: 'bold', textAlign: 'center' }}>
                                                                                            Images Not Available...
                                                                                        </h5>
                                                                                    </Row>
                                                                                    :
                                                                                    Object.entries(activeGroupData).map(([version, items], verId) => {
                                                                                        if (compModelVerInfo[0].model_ver === parseInt(version)) {
                                                                                            let imgCount = 0;
                                                                                            return (
                                                                                                <>
                                                                                                    <div className='d-flex justify-content-between align-items-center'>
                                                                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                                                            <Checkbox
                                                                                                                style={{
                                                                                                                    borderColor: 'slategray',
                                                                                                                    borderWidth: '2px',
                                                                                                                    borderStyle: 'solid',
                                                                                                                    borderRadius: '7px',
                                                                                                                    height: '20px',
                                                                                                                    width: '20px',
                                                                                                                    marginRight: '5px', // Add margin if needed
                                                                                                                }}
                                                                                                                checked={selectedImages.length === items.length}
                                                                                                                onChange={() => {
                                                                                                                    this.multiImgDelete(items, lable_name)
                                                                                                                }}
                                                                                                            />
                                                                                                            <span>Select All</span>
                                                                                                        </div>
                                                                                                        <Button className="btn btn-sm w-sm" color='danger' onClick={() => this.handleDeleteSelectedImages()}>
                                                                                                            {/* <i className="bx bx-trash" style={{ fontSize: '1.3rem' }}></i> */}
                                                                                                            Delete
                                                                                                        </Button>
                                                                                                    </div>
                                                                                                    <Row key={verId} className='mt-2'>
                                                                                                        {items.map((item, itemId) => {
                                                                                                            if (item.imagePathType[0].type === lable_name) {
                                                                                                                const isSelected = selectedImages.includes(item);
                                                                                                                return (
                                                                                                                    <Col sm={3} md={3} key={itemId}>
                                                                                                                        <Card style={{ borderRadius: '7px' }}>
                                                                                                                            <CardBody style={{ padding: '7px', border: isSelected ? '2px solid red' : '2px solid green', borderRadius: '7px' }}>

                                                                                                                                <div style={{ fontWeight: 'bold', textAlign: 'left', whiteSpace: 'pre' }}>
                                                                                                                                    <Checkbox style={{
                                                                                                                                        borderColor: 'slategray', borderWidth: '2px', borderStyle: 'solid', borderRadius: '7px', height: '20px',
                                                                                                                                        width: '20px'
                                                                                                                                    }}
                                                                                                                                        checked={isSelected}
                                                                                                                                        onChange={() => this.handleCheckboxChange(item, version)}
                                                                                                                                    />
                                                                                                                                    {'   '}
                                                                                                                                    {imgCount += 1}
                                                                                                                                </div>
                                                                                                                                <Image src={this.getImages(item.imagePathType[item.used_model_ver.indexOf(parseInt(version))])} alt='Image not there' />
                                                                                                                                <div style={{ fontWeight: 'bold', textAlign: 'left' }}>
                                                                                                                                    Used In : {item.used_model_ver.join(', ')}
                                                                                                                                </div>
                                                                                                                                <div style={{ textAlign: 'right' }}>
                                                                                                                                    <Popconfirm placement="rightBottom" title="Do you want to delete?" onConfirm={() => this.deleteImageClick(item, compModelVerInfo[0].model_ver, lable_name)} okText="Yes">
                                                                                                                                        <DeleteTwoTone twoToneColor="red" style={{ fontSize: '18px', background: 'white', borderRadius: '5px' }} />
                                                                                                                                    </Popconfirm>
                                                                                                                                </div>
                                                                                                                            </CardBody>
                                                                                                                        </Card>
                                                                                                                    </Col>
                                                                                                                );
                                                                                                            }

                                                                                                        })}
                                                                                                    </Row>
                                                                                                </>
                                                                                            )
                                                                                        }
                                                                                    })
                                                                            }
                                                                        </Card>
                                                                    </Droppable>
                                                                </Col>
                                                            </Row>
                                                        </Card>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                }
                            </CardBody>
                        </Card>

                    </Container>

                    {/* Modal 4 - select admin testing option */}
                    <AdminTestingOptions
                        isOpen={this.state.show_testing_options}
                        toggle={this.CloseAdminTestOptions}
                        onContinue={this.ContinueAdminTest}
                        options={[
                            { label: 'Overall Image Testing', value: 'component_testing' },
                            { label: 'Region-Wise Image Testing', value: 'region_testing' },
                        ]}
                    />

                    {/* Modal 2 - Log Info */}
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
                                        <th>User Info</th>
                                        <th>Component name</th>
                                        <th>Component code</th>
                                        <th>Model Name</th>
                                        <th>Model version</th>
                                        <th>Screen Name</th>
                                        <th>Actions</th>
                                        <th>Activity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {log_data.map((data, index) => (
                                        <tr key={index}>
                                            <td>{data.date_time}</td>
                                            <td>{data.user_info}</td>
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
                            <Button type="button" className="btn btn-secondary" onClick={() => this.setState({ modal_xlarge: false })}>Close</Button>
                        </div>
                    </Modal>
                </div>
            </>
        );
    }
}
modelCreation.propTypes = {
    history: PropTypes.object.isRequired,
    // location: PropTypes.shape({
    //     state: PropTypes.shape({
    //         // compModelVInfo: PropTypes.object.isRequired, // Validate compModelVerInfo
    //     }).isRequired,
    // }).isRequired,
};
export default withRouter(modelCreation);

