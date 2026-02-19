import React, { Component, createRef } from 'react';
import {
    Container, CardTitle, Button, Table, Row, Col,
    Modal, ModalHeader, ModalBody, ModalFooter,
    Card, CardBody, Spinner,
    FormGroup, Label, Input, InputGroup, InputGroupText,
    CardFooter,
    CardText,
    ButtonGroup
} from 'reactstrap';
import Webcam from "react-webcam";
import { Link } from 'react-router-dom';
import { Dropdown, Menu, Checkbox, Radio, Space, Spin, Slider, Image as AntdImage, Popconfirm } from 'antd';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';
// import 'antd/dist/antd.css';
import PropTypes from "prop-types"
import Swal from 'sweetalert2';
import SweetAlert from "react-bootstrap-sweetalert"
import { FaTrash, FaArrowsAlt, FaExpand, FaEdit, FaTrashAlt, FaSave, FaTimes } from 'react-icons/fa';
import ColorPicker_1 from './colorPicker_1';
import RegionConfirmationModal from './RegionFunctions/RegionConfirmationModal';
import FullScreenLoader from 'components/Common/FullScreenLoader';
import SelectAdminTestMultipleVersions from './RegionFunctions/SelectAdminTestMultipleVersions';
import AdminTestingModal from './RegionFunctions/AdminTestingModal';
import { DEFAULT_RESOLUTION } from './cameraConfig';
import ZoomableWebcamViewer from 'pages/WebcamCustom/ZoomableWebcamViewer';

import urlSocket from "./urlSocket"
// import img_url from './imageUrl';
import { image_url } from './imageUrl';
let img_url = image_url;


export default class manageModel extends Component {
    static propTypes = { history: PropTypes.any.isRequired }
    constructor(props) {
        super(props);
        this.state = {
            comp_name: '',
            comp_code: '',
            modelInfo: [],
            selectedModel: null,
            compModelInfo: [],
            config_change: false,
            setPartialySelected: false,
            setSelectAll: false,
            allAny: null,
            modelaccuracytest: [],
            checkbox: false,
            radiobtn: false,
            anySelected: false,
            config: [],

            modalOpen: false,
            selectedVersions: [],
            selectFilter: '',
            tabs: false,

            webcamEnabled: false,
            imageSrcNone: false,
            adding_image: false,
            images_length: 0,
            outline_thres: 100,
            thresLoad: false,

            outline_type: '3',

            // region selection
            region_testing: false,
            modal_xlarge1: false,
            imageSrc: null,
            clearCanvasFlag: false,
            cvLoaded: false,
            rectangles: [],
            previous_rectangle: [],
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
            canvas_width: 640, // initial width
            canvas_height: 480, // initial height
            zoom: 1, // Initial zoom level
            region_changes: false,

            overall_testing: false,
            region_wise_testing: false,
            testing_mode_required: false,

            modelInfoLoading: true,

            show_region_confirmation: false,
            updating_regions: false,

            region_confirmation_datas: {},

            full_screen_loading: false,
            show_region_edit_modal: false,

            region_selecting: false,
            isCreatingRegion: false,
            zoom_value: {
                center: { x: 0.5, y: 0.5 },
                zoom: 1
            },
            loadingButtonIndex: null,
            isLoading: false,

            trainingStatus: " "
        };
        this.toggleModal = this.toggleModal.bind(this);
        // region selection
        this.tog_xlarge1 = this.tog_xlarge1.bind(this);
        this.parentDivRef = createRef();
        this.canvasRef = createRef();
        this.videoRef = createRef();
        this.animationRef = createRef();
        this.nestedRectangleRef = createRef();
        this.rectangleRef = createRef();
        this.trashButtonsRef = [];
        this.draggingRectIndexRef = createRef();
        this.resizingRectIndexRef = createRef();

        this.webcamRef = createRef();
    }

    async componentDidMount() {
        const db_info = JSON.parse(localStorage.getItem('db_info'));
        img_url = `${image_url}${db_info?.db_name}/`;



        try {
            this.getConfigInfo();
            let data = JSON.parse(sessionStorage.getItem('manageData'));
            console.log("data116 ", data);
            let compInfo = data.compInfo;
            let modelInfo = data.modelInfo;
            console.log('modelInfo', modelInfo)
            const compId = data.compInfo?._id;

            const trainingStatusCookie = Cookies.get(`training_status_${compId}`);
            const trainingStatus = trainingStatusCookie === 'true';

            if (data?.compInfo?.zoom_value) {
                const zoom_values = data?.compInfo?.zoom_value;
                sessionStorage.setItem('zoom_values', JSON.stringify(zoom_values));
                this.setState({ zoom_value: zoom_values });
            }

            this.setState({
                comp_name: compInfo.comp_name,
                comp_code: compInfo.comp_code,
                modelInfo,
                compInfo,
                region_testing: compInfo.region_selection,
                trainingStatus: trainingStatus
            }, () => {
                this.getting_back()
            });

            navigator.mediaDevices.addEventListener('devicechange', this.checkWebcam);
            this.checkWebcam();

            // region selection
            window.addEventListener('resize', this.updateCanvasSize);
            this.updateCanvasSize();
        }
        catch (error) {
            console.error('/didmount ', error)
        }
        finally {
            this.setState({ modelInfoLoading: false })
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.showRegion && !this.state.showRegion) {
            this.setState({
                movingRectangleIndex: null,
                resizingRectangleIndex: null,
                editingRectangleIndex: null,
            });
        }
        // Check if the canvasRef or canvas element is null
        if (!this.canvasRef.current) {
            // console.error('canvasRef is null');
            return;
        }
        const canvas = this.canvasRef.current;
        const ctx = canvas.getContext('2d');
        // Check if getContext returns null
        if (!ctx) {
            console.error('Failed to get canvas context');
            return;
        }
        if (
            this.state.imageSrc &&
            (this.state.imageSrc !== prevState.imageSrc ||
                this.state.rectangles !== prevState.rectangles ||
                this.state.selectedRectangleIndex !== prevState.selectedRectangleIndex ||
                this.state.editingRectangleIndex !== prevState.editingRectangleIndex ||
                this.state.selecting !== prevState.selecting ||
                this.state.capturedImage !== prevState.capturedImage ||
                this.state.clearCanvasFlag !== prevState.clearCanvasFlag ||
                this.state.showRegion !== prevState.showRegion ||
                this.state.capturedImage === prevState.capturedImage ||
                this.canvasRef !== this.canvasRef
            )
        ) {
            if (this.state.showRegion) {
                this.drawFrame();
            } else {
                const img = new Image();
                img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                };
                img.src = this.state.imageSrc;
            }
        }
    }

    componentWillUnmount() {
        clearInterval(this.trainingStatusInterval);
        navigator.mediaDevices.removeEventListener('devicechange', this.checkWebcam);

        // region selection
        window.removeEventListener('resize', this.updateCanvasSize);
    }

    // updating rectangles in state.
    updatingRectangles = async (region_values) => {
        let rectangle_values = [];

        // Original and target resolutions
        const originalWidth = 640;
        const originalHeight = 480;
        const targetWidth = DEFAULT_RESOLUTION.width;
        const targetHeight = DEFAULT_RESOLUTION.height;

        // Calculate scaling factors
        const scaleX = targetWidth / originalWidth;
        const scaleY = targetHeight / originalHeight;

        rectangle_values = region_values.map((rect) => ({
            x: rect.coordinates.x / scaleX,
            y: rect.coordinates.y / scaleY,
            width: rect.coordinates.width / scaleX,
            height: rect.coordinates.height / scaleY,
            id: rect.id,
            name: rect.name,
            colour: rect.colour
        }));

        return rectangle_values
    }

    isRectangleChanged = () => {
        const { previous_rectangle, rectangles } = this.state;
        const prevRectangles = [...previous_rectangle];
        const newRectangles = [...rectangles];
        // let messages = [];
        let is_changed = false;
        // Find deleted rectangles
        prevRectangles.forEach(prev => {
            const exists = newRectangles.some(r => r.id === prev.id);
            if (!exists) {
                // messages.push(`🗑️ Rectangle "${prev.name}" (id: ${prev.id}) was deleted.`);
                is_changed = true;
            }
        });
        // Find new and modified rectangles
        newRectangles.forEach(current => {
            const prev = prevRectangles.find(r => r.id === current.id);

            if (!prev) {
                // messages.push(`➕ Rectangle "${current.name}" (id: ${current.id}) was added.`);
                is_changed = true;
            } else {
                if (prev.name !== current.name) {
                    // messages.push(`✏️ Rectangle ID ${current.id} name changed from "${prev.name}" to "${current.name}".`);
                    is_changed = true;
                }
                const keys = ["x", "y", "width", "height"];
                keys.forEach(key => {
                    if (
                        typeof prev[key] === 'number' &&
                        typeof current[key] === 'number' &&
                        Math.abs(prev[key] - current[key]) > 0.001
                    ) {
                        // messages.push(`📐 Rectangle "${current.name}" (id: ${current.id}) ${key} changed from ${prev[key].toFixed(2)} to ${current[key].toFixed(2)}.`);
                        is_changed = true;
                    }
                });
            }
        });
        console.log('is_changed ', is_changed, prevRectangles, newRectangles)
        return is_changed;
        // return messages.length > 0 ? messages.join("\n") : "✅ No changes detected.";
    }

    checkingRegionChanges = async () => {
        const { compModelInfo, modelInfo, compInfo } = this.state;
        console.log('data276 ', compModelInfo, modelInfo, compInfo);
        try {
            const payload = {
                comp_id: compInfo._id
            };
            const response = await urlSocket.post('/api/regions/regions_assigned_areas', payload);
            console.log('/regions_assigned_areas ', response.data);
            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                this.error_handler(response.data.error);
            }

            return response.data;


        } catch (error) {
            console.error(error);
            return {};
        }
    }


    confirmation_region = async () => {
        console.log('this is wokring')
        try {
            const { region_testing, compInfo, region_confirmation_datas } = this.state;

            // Prepare the payload
            const payload = {
                _id: compInfo._id,
                region_selection: !region_testing, // Toggle the region_testing state
                region_confirmation_datas: region_confirmation_datas,
            };

            console.log('Payload:', payload);

            // Make the API call
            const response = await urlSocket.post('/api/regions/region_select', payload);

            console.log('API Response:', response);
            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                this.error_handler(response.data.error);
            }
            else {
                if (response.data) {
                    this.setState({ region_testing: !region_testing, region_selecting: false, show_region_confirmation: false, });
                    const data = JSON.parse(sessionStorage.getItem('manageData'));
                    if (data && data.compInfo) {
                        data.compInfo.region_selection = !region_testing; // ✅ use the new value here
                        sessionStorage.setItem('manageData', JSON.stringify(data));
                    }
                    // console.log('/regions_assigned_areas ', response.data);
                    await this.getCompModelInfo(compInfo, 'Fixed');
                }
            }
        }
        catch (error) {
            console.log('Error:', error);
        }
    }

    saveRegionChanges = async () => {
        this.setState({ full_screen_loading: true })
        const is_rectangle_changed = this.isRectangleChanged();
        console.log('is_rectangle_changed ', is_rectangle_changed)

        if (is_rectangle_changed) {
            // check regions assigned areas here;
            const data = await this.checkingRegionChanges();
            data.message = "Do you want to save changes?"
            this.setState({
                full_screen_loading: false,
                show_region_confirmation: true,
                region_confirmation_datas: data,
                isCreatingRegion: false,
            });
            // if (data.version_list.length > 0 || data.stations_list.length > 0 || data.profile_list.length > 0) {
            //     return;
            // }

        } else {
            this.setState({ full_screen_loading: false, isCreatingRegion: false });
            Swal.fire({
                title: `No Changes Occured`,
                icon: 'warning',
                showCancelButton: false,
                confirmButtonText: 'OK',
            });
        }
    };

    discardRegionChanges = () => {
        const { previous_rectangle } = this.state;
        const prev_rectangle_values = [...previous_rectangle];
        this.setState({
            show_region_confirmation: false,
            rectangles: prev_rectangle_values,
            modal_xlarge1: false,
            region_confirmation_datas: {},

            // last edited drag, move option not disabled
            selectedRectangleIndex: null,
            editingRectangleIndex: null,
            resizingRectangleIndex: null,
            movingRectangleIndex: null,
        });
        Swal.fire("Changes are not saved", "", "info");
    }



    // rectangles in 04-10-25

    updateCanvasSize = () => {
        if (this.canvasRef.current) {
            this.setState({
                canvas_width: this.canvasRef.current.offsetWidth,
                canvas_height: this.canvasRef.current.offsetHeight
            });
        }
    };

    drawFrame = () => {
        const canvas = this.canvasRef.current;
        const ctx = canvas.getContext('2d');
        const zoom = this.state.zoom;
        const img = new Image();
        img.src = this.state.imageSrc;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            this.state.rectangles.forEach((rect, index) => {
                const isSelected = index === this.state.selectedRectangleIndex;
                if (isSelected) {
                    // Draw double stroke for the selected rectangle
                    ctx.lineWidth = 4;
                    ctx.strokeStyle = 'black';
                    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

                    ctx.lineWidth = 2;
                    ctx.strokeStyle = '#50a5f1';
                    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
                } else {
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = rect.colour;
                    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
                }
                const textPosX = index === this.state.movingRectangleIndex ? rect.x + 25 : rect.x + 10;
                ctx.font = 'bold 14px Arial';
                ctx.lineWidth = 3;
                ctx.strokeStyle = 'black';
                ctx.strokeText(rect.name, textPosX, rect.y + 15);
                ctx.fillStyle = 'white';
                ctx.fillText(rect.name, textPosX, rect.y + 15);

            });
        }
    };

    getting_back = () => {
        try {
            let type = JSON.parse(sessionStorage.getItem('type'));
            this.setState({ compInfo: type.compInfo })
            this.fixedOrany(type.string, type.value)
        }
        catch {
            this.setState({ selectFilter: '', tabs: false })
        }
    }

    getConfigInfo = async () => {
        try {
            const response = await urlSocket.post('/config', { mode: 'no-cors' });
            const config = response.data;
            if (config.error === "Tenant not found") {
                console.log("data error", config.error);
                this.error_handler(config.error);
            }
            else {
                this.setState({ config, positive: config[0].positive, negative: config[0].negative });
            }
        } catch (error) {
            console.log('error', error);
        }
    };

    getCompModelInfo = async (compInfo, string) => {
        try {
            const response = await urlSocket.post('/get_comp_model_info', { 'comp_id': compInfo._id, 'position': string }, { mode: 'no-cors' });
            console.log('data306 ', response.data);
            const zoom_values = response?.data?.comp_info?.zoom_value;
            if (zoom_values) {
                sessionStorage.setItem('zoom_values', JSON.stringify(zoom_values));
                this.setState({ zoom_value: zoom_values });
            }
            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                this.error_handler(response.data.error);
            }
            else {
                const compModelInfo = response.data.comp_model_list;
                this.status_check(compModelInfo)
                const unusedModelIds = response.data.model_info
                    .filter(model => !compModelInfo.some(compModel => compModel.model_id === model._id))
                    .map(model => model._id);

                const filteredModelInfo = response.data.model_info.filter(model => unusedModelIds.includes(model._id));
                const comp_info = response.data.comp_info;
                let prevCompInfo = compInfo;
                prevCompInfo.datasets = comp_info.datasets;

                // 
                const updated_comp_info = response.data.comp_info;
                let updated_rectangles = [];
                if (updated_comp_info?.rectangles) {
                    updated_rectangles = await this.updatingRectangles(updated_comp_info.rectangles);
                }
                // 
                this.setState({
                    compModelInfo,
                    modelInfo: filteredModelInfo,
                    compInfo: prevCompInfo,
                    rectangles: updated_rectangles,
                    previous_rectangle: JSON.parse(JSON.stringify(updated_rectangles)),
                });
            }

        } catch (error) {
            console.log('error', error);
        }
    }

    handleModelSelect = async (model) => {

        if (this.state.selectFilter == 0) {
            try {
                const response = await urlSocket.post('/check_outline', {
                    'comp_id': this.state.compInfo._id,
                    'model_id': model._id,
                }, { mode: 'no-cors' });
                console.log('response.data', response.data);
                let getInfo = response.data;
                if (getInfo.show == 'yes') {
                    this.setState({ selectedModel: model });
                    let compInfo = this.state.compInfo
                    try {
                        const response = await urlSocket.post('/comp_model_info', { 'compInfo': compInfo, 'modelInfo': model }, { mode: 'no-cors' });
                        if (response.data.error === "Tenant not found") {
                            console.log("data error", response.data.error);
                            this.error_handler(response.data.error);
                        }
                        else {
                            let compModelInfo = response.data.comp_model_list;
                            let modelInfo = response.data.model_config_list;

                            const unusedModelIds = modelInfo
                                .filter(model => !compModelInfo.some(compModel => compModel.model_id === model._id && compModel.position === model.position))
                                .map(model => model._id);
                            const filteredModelInfo = modelInfo.filter(model => unusedModelIds.includes(model._id));
                            this.setState({
                                compModelInfo,
                                modelInfo: filteredModelInfo,
                                modelaccuracytest: []
                            });
                        }

                    } catch (error) {
                        console.log('error', error)
                    }

                } else if (getInfo.show == 'no') {
                    this.setState({ capture_fixed_refimage: true });

                    Swal.fire({
                        title: `Create Outline to continue...`,
                        text: 'Before Assigning Models, Create a Common Outline for all Models',
                        icon: 'warning',
                        showCancelButton: false,
                        confirmButtonText: 'OK',
                        cancelButtonText: 'Cancel',
                    });
                }
            } catch (error) {
                console.error(error);
            }
        } else if (this.state.selectFilter == 1) {
            this.setState({ selectedModel: model });
            let compInfo = this.state.compInfo;
            try {
                const response = await urlSocket.post('/comp_model_info', { 'compInfo': compInfo, 'modelInfo': model }, { mode: 'no-cors' });
                if (response.data.error === "Tenant not found") {
                    console.log("data error", response.data.error);
                    this.error_handler(response.data.error);
                }
                else {
                    let compModelInfo = response.data.comp_model_list;
                    let modelInfo = response.data.model_config_list;

                    const unusedModelIds = modelInfo
                        .filter(model => !compModelInfo.some(compModel => compModel.model_id === model._id && compModel.position === model.position))
                        .map(model => model._id);
                    const filteredModelInfo = modelInfo.filter(model => unusedModelIds.includes(model._id));
                    this.setState({
                        compModelInfo,
                        modelInfo: filteredModelInfo,
                        modelaccuracytest: []
                    });
                }

            } catch (error) {
                console.log('error', error)
            }
        }
    };

    includings() {
        Swal.fire({
            title: `Create Outline for Fixed Models to Continue...`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
        });
    }

    goTOModelVerMgmt = (compModelInfo) => {
        sessionStorage.removeItem("compModelData")
        sessionStorage.setItem("compModelData", JSON.stringify(compModelInfo))
        this.props.history.push('/modelVerInfo');
        console.log("compinfo", compModelInfo)
    }

    status_check = (compModelInfo) => {
        console.log('compModelInfo', compModelInfo)
        const { config } = this.state;
        try {
            urlSocket.post('/model_info_check', { 'modelData': compModelInfo },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data;
                    console.log('data1213', data)

                    if (data.error === "Tenant not found") {
                        console.log("data error", data.error);
                        this.error_handler(data.error);
                    }
                    else {
                        this.setState({ compModelInfo: data })
                    }

                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }

    back = () => {
        // sessionStorage.removeItem('type')
        this.props.history.push("/comp_info")
    }

    handleChange = (e, model_type) => {
        const { modelaccuracytest, compModelInfo } = this.state;

        const isChecked = e.target.checked;

        if (e.target.value.training_sts !== "Training Completed" && e.target.value.training_sts !== "No training required") {
            if (model_type == "ML") {
                Swal.fire({
                    icon: 'info',
                    title: 'Oops...',
                    text: "To continue, Add image to this Model's version",
                })
            } else if (model_type == "DL") {
                Swal.fire({
                    icon: 'info',
                    title: 'Oops...',
                    text: 'Training for this model has not been completed!',
                })
            }
        }
        else {
            if (isChecked) {
                // Add row data to the array
                this.setState({
                    modelaccuracytest: [...modelaccuracytest, e.target.value]
                });
            } else {
                // Remove row data from the array
                const updatedRows = modelaccuracytest.filter(row => row !== e.target.value);
                this.setState({
                    modelaccuracytest: updatedRows
                });
            }

            compModelInfo.forEach((data, index) => {
                if (data.model_name === e.target.name) {
                    if (data.checked === e.target.checked) {
                        data.checked = !data.checked;
                    } else {
                        data.checked = e.target.checked;
                    }
                }
            })
            this.setState({ compModelInfo })
        }
    }

    selectAllorAny = (e) => {
        this.setState({ allAny: e.target.value, radiobtn: true });
        if (e.target.value === 'Any') {
            this.setState({ anySelected: true })
        }
        else {
            this.setState({ anySelected: false })
        }
    }

    acctest = (model_testing_data) => {
        const { componentTest, regionTest, selectedData } = model_testing_data;
        let model_info_data = {
            config: this.state.config,
            testCompModelVerInfo: selectedData,
            allAny: this.state.allAny,
            page: 'manageModel',
            comp_position: 1,
            region_testing: this.state.region_testing && regionTest,
        };
        if (this.state.selectFilter == 0) {
            model_info_data['comp_position'] = 0
        }
        if (this.state.region_testing === true && regionTest === true) {
            model_info_data['overall_testing'] = componentTest;
            model_info_data['region_wise_testing'] = regionTest;
        }
        if ('detection_type' in model_testing_data) {
            model_info_data['detection_type'] = model_testing_data.detection_type;
            model_info_data['regions'] = model_testing_data.regions;
        }
        console.log('value: ', componentTest, regionTest, selectedData)
        sessionStorage.removeItem("model_info_data")
        sessionStorage.setItem("model_info_data", JSON.stringify(model_info_data))
        this.props.history.push("/modelAccuracyTesting");


    }

    toggleModal() {
        const { modelaccuracytest } = this.state;
        this.setState({ selectedVersions: [] })

        if (modelaccuracytest.length !== 0) {
            this.setState(prevState => ({
                modalOpen: !prevState.modalOpen,
            }));
        }
        else {
            Swal.fire({
                icon: 'error',
                title: 'Model Selection Required',
                text: 'Select Any Model to Continue...',
            })
        }
    }

    closeModal = () => {
        this.setState(prevState => ({
            modalOpen: !prevState.modalOpen,
        }));

        this.setState({ selectedVersions: [] })
    }

    handleVersionSelect = (modelIndex, versionIndex) => {
        const { selectedVersions } = this.state;
        const isSelected = selectedVersions.some(
            (v) => v.modelIndex === modelIndex && v.versionIndex === versionIndex
        );
        if (isSelected) {
            this.setState({
                selectedVersions: selectedVersions.filter(
                    (v) => !(v.modelIndex === modelIndex && v.versionIndex === versionIndex)
                ),
            });
        } else {
            this.setState({
                selectedVersions: [...selectedVersions, { modelIndex, versionIndex }],
            });
        }
    };

    getSelectedData = () => {
        const { modelaccuracytest, selectedVersions } = this.state;
        const groupedData = new Map();

        selectedVersions.forEach(({ modelIndex, versionIndex }) => {
            const currentItem = modelaccuracytest[modelIndex];
            const { comp_name, model_name } = currentItem;

            const key = `${comp_name}_${model_name}`;

            if (!groupedData.has(key)) {
                groupedData.set(key, {
                    ...currentItem, // Include all fields
                    trained_ver_list: [],
                    version_status: [],
                });
            }
            groupedData.get(key).trained_ver_list.push(currentItem.trained_ver_list[versionIndex]);
            groupedData.get(key).version_status.push(currentItem.version_status[versionIndex]);
        });
        const selectedData = Array.from(groupedData.values());

        return selectedData;
    };



    fixedOrany = async (string, value) => {
        this.setState({ isLoading: true, loadingButtonIndex: value });

        const { compInfo } = this.state;
        try {
            await this.getCompModelInfo(compInfo, string); // Wait for this to finish
            this.setState({
                selectFilter: value,
                tabs: true,
                modelaccuracytest: [],
            });
            let dataToStore = {
                string: string,
                value: value,
                compInfo: compInfo,
            };
            sessionStorage.setItem('type', JSON.stringify(dataToStore));
        } catch (error) {
            console.error('Error in getCompModelInfo:', error);
        } finally {
            this.setState({ isLoading: false, loadingButtonIndex: null });
        }
    };

    createOutline = () => {
        const { compInfo } = this.state;
        let set_data = {
            webcamEnabled: true,
            imageSrcNone: false,
            showOutline: true,
        }
        if (compInfo && compInfo.datasets?.white_path) {
            set_data['images_length'] = 1
        };
        this.setState(set_data);
    }

    closeOutline = () => {
        this.setState(prevState => ({
            webcamEnabled: false,
            imageSrcNone: false,
            showOutline: false,
        }));
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

    captureImage = async (labelName) => {
        const { compInfo } = this.state;
        if (compInfo?.rectangles?.length > 0) {
            Swal.fire({
                title: "Do you want to Delete Drawn Regions?",
                icon: "warning",
                showDenyButton: true,
                // showCancelButton: true,
                confirmButtonColor: 'green',
                confirmButtonText: "Yes",
                denyButtonText: `No`,
                text: "Updating the outline will remove all previously drawn regions."
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await this.deleteDrawnRegions();
                    await this.captureOutlineImage();
                } else if (result.isDenied) {
                    return;
                    // Swal.fire("Changes are not saved", "", "info");
                }
            });
        } else {
            await this.captureOutlineImage();
        }
    };

    captureOutlineImage = async () => {
        this.setState({ adding_image: true })

        const outlineImageSrc = await this.webcamRef.current.capture();
        console.log(outlineImageSrc, 'outlineImageSrc')
        const { zoom, center } = this.webcamRef.current.getZoomAndCenter();
        const zoom_value = { zoom: zoom, center: center };
        console.log(outlineImageSrc, zoom, center, 'zoom, center: ')
        // const outlineImageSrc = this.webcam.getScreenshot({ width: DEFAULT_RESOLUTION.width, height: DEFAULT_RESOLUTION.height });

        if (!outlineImageSrc) {
            this.setState({ imageSrcNone: true });
            return;
        }
        const blob = this.dataURLtoBlob(outlineImageSrc);
        const formData = new FormData();
        let imgUuid = uuidv4();
        formData.append('_id', this.state.compInfo._id);
        formData.append('imgName', blob, imgUuid + '.png');
        formData.append('outline_type', this.state.outline_type);
        formData.append('zoom_value', JSON.stringify(zoom_value));

        sessionStorage.setItem('zoom_values', JSON.stringify(zoom_value));
        this.setState({ zoom_value: zoom_value });


        try {
            const response = await urlSocket.post('/addOutline', formData, {
                headers: {
                    'content-type': 'multipart/form-data'
                },
                mode: 'no-cors'
            });
            let getInfo = response.data;
            if (getInfo.error === "Tenant not found") {
                console.log("data error", getInfo.error);
                this.error_handler(getInfo.error);
            }
            else {
                if (getInfo.message === 'Image successfully added') {
                    this.setState({
                        response_message: getInfo.message,
                        compInfo: getInfo.comp_info[0],
                        images_length: getInfo.img_count,
                        adding_image: false
                    });
                }
                else {
                    this.setState({
                        response_message: getInfo.message,
                        adding_image: false
                    })
                }
                setTimeout(() => {
                    this.setState({ response_message: "" });
                }, 1000);
            }
        } catch (error) {
            console.log('error', error);
        }
    }

    onoutline_change = async (value) => {
        const { compInfo } = this.state;
        this.setState({ thresLoad: true });
        if (compInfo.datasets.image_path) {
            let path = compInfo.datasets.image_path;
            path = path.substring(0, path.lastIndexOf("/"));

            const pathParts = compInfo.datasets.image_path.split('/');
            const filename = pathParts[pathParts.length - 1];
            let [file] = filename.split('.');

            try {
                const response = await urlSocket.post('/comp_outline_change', {
                    'path': path,
                    'filename': file,
                    'outline': value,
                    'id': compInfo._id,
                    'outline_type': this.state.outline_type
                }, { mode: 'no-cors' });
                let getInfo = response.data;
                if (getInfo.error === "Tenant not found") {
                    console.log("data error", getInfo.error);
                    this.error_handler(getInfo.error);
                }
                else {
                    this.setState({
                        compInfo: getInfo.comp_info[0],
                        // refersh: true,
                    })
                }
            } catch (error) {
                console.log('error1266', error)
            }
            this.setState({ outline_thres: value, thresLoad: false, })
        }
    }

    handleSelectChange = (event) => {
        this.setState({
            outline_type: event.target.value // Update the state with the selected value
        });
    }

    // region selection

    removeBodyCss() {
        document.body.classList.add("no_padding")
    }



    regionSelection = async (e) => {
        // const region_testing = e.target.checked;
        const data = await this.checkingRegionChanges();
        data.message = "Do you want to save changes?"
        this.setState({
            full_screen_loading: false,
            region_selecting: true,
            region_confirmation_datas: data,
        });
        console.log('data 895 regiondata', data)

    };


    tog_xlarge1 = async () => {
        if (!this.state.compInfo?.datasets?.image_path) { return; }
        const is_rectangle_changed = this.isRectangleChanged()
        if (this.state.modal_xlarge1 === true && is_rectangle_changed) {
            await Swal.fire({
                title: "Do you want to save changes?",
                icon: "warning",
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonColor: 'green',
                confirmButtonText: "Save",
                denyButtonText: `Don't save`
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await this.saveRegionChanges();
                    this.setState({ isCreatingRegion: false });
                    // await ;
                } else if (result.isDenied) {
                    Swal.fire("Changes are not saved", "", "info");
                    this.setState({
                        rectangles: this.state.unchanges_rectangles,
                        modal_xlarge1: false,
                        region_confirmation_datas: {},

                        // last edited drag, move option not disabled
                        selectedRectangleIndex: null,
                        editingRectangleIndex: null,
                        resizingRectangleIndex: null,
                        movingRectangleIndex: null,
                        isCreatingRegion: false,
                    });
                    // this.setState({ })
                }
            });

            return;
        }
        console.log('823 working')
        this.setState(prevState => ({
            modal_xlarge1: !prevState.modal_xlarge1,

            // last edited drag, move option not disabled
            selectedRectangleIndex: null,
            editingRectangleIndex: null,
            resizingRectangleIndex: null,
            movingRectangleIndex: null,
        }),
            () => {
                if (this.state.modal_xlarge1 === true) {
                    let old_rectangles = [...this.state.rectangles];
                    console.log('image_url1112', `${img_url + this.state.compInfo.datasets.image_path}?timestamp=${new Date().getTime()}`)
                    this.setState({
                        imageSrc: `${this.showImage(this.state.compInfo.datasets.image_path)}?timestamp=${new Date().getTime()}`,
                        unchanges_rectangles: old_rectangles
                    });
                }
                setTimeout(() => {
                    if (this.canvasRef.current) {
                        this.handleMouseDown()
                    }
                }, 100);
            });
        this.removeBodyCss();
        this.setState({ isCreatingRegion: false });
    }

    handleMouseDown = (e) => {
        const canvas = this.canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const zoom = this.state.zoom;

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let x, y;

        if (e?.type === 'mousedown') {
            if (zoom == 1) {
                x = ((e.clientX - rect.left) * scaleX) / zoom;
                y = ((e.clientY - rect.top) * scaleY) / zoom;
            } else {
                x = (e.clientX - rect.left) * scaleX;
                y = (e.clientY - rect.top) * scaleY;
            }
        } else if (e?.type === 'touchstart') {
            if (zoom == 1) {
                x = ((e.touches[0].clientX - rect.left) * scaleX) / zoom;
                y = ((e.touches[0].clientY - rect.top) * scaleY) / zoom;
            } else {
                x = (e.touches[0].clientX - rect.left) * scaleX;
                y = (e.touches[0].clientY - rect.top) * scaleY;
            }
        }
        const clickedIndex = this.state.rectangles.findIndex(rectangle =>
            x >= rectangle.x && x <= rectangle.x + rectangle.width &&
            y >= rectangle.y && y <= rectangle.y + rectangle.height
        );


        this.setState({
            selectingRectangle: clickedIndex,
            selecting: true,
        });

        this.rectangleRef.current = {
            x,
            y,
            width: 0,
            height: 0,
            name: this.state.rectNameInput,
            id: uuidv4(),
            colour: this.state.selectedColor,
        };
    }

    handleMouseMove = (e) => {
        if (this.state.selecting) {
            const canvas = this.canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const zoom = this.state.zoom;

            // Calculate scale factors
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            // let x,y;

            // if(zoom == 1) {
            //     x = ((e.clientX - rect.left) * scaleX) / zoom;
            //     y = ((e.clientY - rect.top) * scaleY) / zoom;
            // } else {
            //     x = (e.clientX - rect.left) * scaleX;
            //     y = (e.clientY - rect.top) * scaleY;
            // }

            let x, y;

            if (e?.type === 'mousemove') {
                if (zoom == 1) {
                    x = ((e.clientX - rect.left) * scaleX) / zoom;
                    y = ((e.clientY - rect.top) * scaleY) / zoom;
                } else {
                    x = (e.clientX - rect.left) * scaleX;
                    y = (e.clientY - rect.top) * scaleY;
                }
            } else if (e?.type === 'touchmove') {
                if (zoom == 1) {
                    x = ((e.touches[0].clientX - rect.left) * scaleX) / zoom;
                    y = ((e.touches[0].clientY - rect.top) * scaleY) / zoom;
                } else {
                    x = (e.touches[0].clientX - rect.left) * scaleX;
                    y = (e.touches[0].clientY - rect.top) * scaleY;
                }
            }

            if (this.nestedRectangleRef.current) {
                this.nestedRectangleRef.current.width = x - this.nestedRectangleRef.current.x;
                this.nestedRectangleRef.current.height = y - this.nestedRectangleRef.current.y;
            } else {
                this.rectangleRef.current.width = x - this.rectangleRef.current.x;
                this.rectangleRef.current.height = y - this.rectangleRef.current.y;
            }
        }
    }

    handleMouseUp = () => {
        if (this.state.selecting) {
            if (this.nestedRectangleRef.current) {
                const { parentIndex, x, y, width, height, name } = this.nestedRectangleRef.current;
                if (width < 30 && height < 30) {

                    this.nestedRectangleRef.current = null;
                    this.setState({ nestedRectNameInput: '' });
                } else {
                    this.setState(prevState => {
                        const updatedRectangles = [...prevState.rectangles];
                        let updatedName = (!name) ? `${parentIndex + 1}_${updatedRectangles[parentIndex].nestedRectangles.length + 1}` : name;
                        updatedRectangles[parentIndex].nestedRectangles.push({ x, y, width, height, name: updatedName });
                        return {
                            rectangles: updatedRectangles,
                            nestedRectNameInput: ''
                        };
                    });
                    this.nestedRectangleRef.current = null;
                }
            } else {
                const { x, y, width, height, name, id, nestedRectangles, colour } = this.rectangleRef.current;
                if (width < 30 || height < 30) {
                    console.log('rectangle is too small.')
                    this.rectangleRef.current = null;
                    this.setState({
                        rectNameInput: '',
                        selectedRectangleIndex: this.state.selectingRectangle,
                        resizingRectangleIndex: null,
                        movingRectangleIndex: null
                    });
                } else {
                    this.setState(prevState => {
                        const updatedRectangles = [...prevState.rectangles];
                        // let updatedName = (!name) ? `${updatedRectangles.length + 1}` : name;
                        let i = 1;
                        let updatedName = `${updatedRectangles.length + i}`;
                        let isNameFound = updatedRectangles.some((item, i) => item.name == updatedName);
                        while (isNameFound) {
                            i = i + 1;
                            updatedName = `${updatedRectangles.length + i}`;
                            isNameFound = updatedRectangles.some((item, i) => item.name == updatedName);
                        }
                        updatedRectangles.push({ x, y, width, height, name: updatedName, id, colour });
                        return {
                            rectangles: updatedRectangles,
                            rectNameInput: '',
                            selectedRectangleIndex: null,
                            resizingRectangleIndex: null,
                            movingRectangleIndex: null
                        };
                    });
                    this.rectangleRef.current = null;
                }
            }
            this.setState({ selecting: false });
        }
    }


    handleNameChange = (e) => {
        const { value } = e.target;
        const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(); // Only A-Z, 0-9, convert to uppercase
        this.setState({
            inputRectangleName: sanitizedValue,
            existRectangleNameError: false,
        });
    };


    handleNameSubmit = (e, index) => {
        const { inputRectangleName, rectangles, editingRectangleIndex } = this.state;
        const isNameFound = rectangles.some((item, i) => item.name === inputRectangleName && i !== editingRectangleIndex);
        if (isNameFound) {
            this.setState({ existRectangleNameError: true });
        } else {
            this.setState(prevState => {
                const updatedRectangles = [...prevState.rectangles];
                if (editingRectangleIndex !== null) {
                    updatedRectangles[editingRectangleIndex].name = inputRectangleName; // Limit to 8 characters
                }
                return {
                    rectangles: updatedRectangles,
                    show_region_edit_modal: false,
                    editingRectangleIndex: null,
                    existRectangleNameError: false,
                    inputRectangleName: '',
                };
            });
        }
    }

    sendCoordinates = async () => {
        const {
            compInfo, activeGroupData, no_of_rotation
        } = this.state;

        const { rectangles, imageId, old_rectangle } = this.state;

        let nameOnly = [];
        let coordinatesOnly = [];
        let nameAndCoordinate = [];
        let newRectangle;
        let deletedRectangle;
        let sendData;
        console.log("rectangles.length ", rectangles)

        if (rectangles.length > old_rectangle.length) {
            console.log('new Region added to the compoenent')
            newRectangle = true
        }

        if (rectangles.length < old_rectangle.length) {
            console.log('new Region added to the compoenent')
            deletedRectangle = true
        }
        let allReplaced = false;
        if (old_rectangle.length > 0 && rectangles.length > 0 && old_rectangle.length === rectangles.length) {
            const oldIds = old_rectangle.map(r => r.id).sort().join(',');
            const newIds = rectangles.map(r => r.id).sort().join(',');
            if (oldIds !== newIds) {
                allReplaced = true;
                console.log('🔄 All regions replaced');
            }
        }


        if (!deletedRectangle) {
            const difff = old_rectangle.map((rect, index) => {
                let coordinates1 = {
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height
                }
                let coordinates2 = {
                    x: rectangles[index].x,
                    y: rectangles[index].y,
                    width: rectangles[index].width,
                    height: rectangles[index].height
                }
                if (rect.id === rectangles[index].id) {
                    if (rect.name !== rectangles[index].name) {
                        if (coordinates1.x !== coordinates2.x ||
                            coordinates1.y !== coordinates2.y ||
                            coordinates1.width !== coordinates2.width ||
                            coordinates1.height !== coordinates2.height) {
                            nameAndCoordinate.push(true)
                        } else {
                            nameOnly.push(true)
                        }
                    }
                    else if (coordinates1.x !== coordinates2.x ||
                        coordinates1.y !== coordinates2.y ||
                        coordinates1.width !== coordinates2.width ||
                        coordinates1.height !== coordinates2.height) {
                        coordinatesOnly.push(true)
                    }
                    else {
                        console.log('no changes in the rectangles')
                    }
                }
            })
        }

        nameAndCoordinate = nameAndCoordinate.some(value => value === true);
        nameOnly = nameOnly.some(value => value === true);
        coordinatesOnly = coordinatesOnly.some(value => value === true);

        if (nameAndCoordinate || nameOnly || coordinatesOnly || newRectangle || deletedRectangle || allReplaced) {
            const swalWithBootstrapButtons = Swal.mixin({
                customClass: {
                    confirmButton: "btn btn-success",
                    cancelButton: "btn btn-danger"
                },
                buttonsStyling: false
            });
            let title, text, cnftext, cltext;
            if (nameAndCoordinate && newRectangle) {
                title = 'Do You want to Continue?'
                text = 'Due to change in Region coordinates and New region created.You need to Train Again.'
                cnftext = 'Coordinates Changed and New Region Added'
                cltext = 'Cancelled'
            }
            else if (nameAndCoordinate) {
                title = 'Do You want to Continue?'
                text = 'Due to change in Region coordinates.You need to Train Again.'
                cnftext = 'Coordinates Changed'
                cltext = 'Cancelled'
            }
            else if (allReplaced || newRectangle) {
                title = 'Do You want to Continue?'
                text = 'New Region is created So,You need to Train Again.'
                cnftext = 'New Region Added'
                cltext = 'Cancelled'
            }
            else if (nameOnly) {
                title = 'Do You want to Continue?'
                text = 'Do you want to Change the Name of the Region'
                cnftext = 'Name Updated'
                cltext = 'Cancelled'
            }
            else if (deletedRectangle) {
                title = 'Do You want to Continue?'
                text = 'Trained region and corresponding model file will also got Deleted'
                cnftext = 'Region Deleted'
                cltext = 'Cancelled'
            }
            swalWithBootstrapButtons.fire({
                title: title,
                text: text,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes",
                cancelButtonText: "No, cancel!",
                reverseButtons: true
            }).then((result) => {
                if (result.isConfirmed) {
                    sendData = true
                    this.send_coordinates_to_backend()
                    swalWithBootstrapButtons.fire({
                        title: "Success!",
                        text: cnftext,
                        icon: "success"
                    });
                } else if (
                    /* Read more about handling dismissals below */
                    result.dismiss === Swal.DismissReason.cancel
                ) {
                    swalWithBootstrapButtons.fire({
                        title: "Cancelled",
                        text: cltext,
                        icon: "error"
                    });
                    sendData = false
                }
            });
        }
        else {
            console.log('correct rectangles')
            this.send_coordinates_to_backend();
        }

        if (!rectangles || rectangles.length === 0) {
            console.warn('No rectangles to send');
            return;
        }

    };

    send_coordinates_to_backend = async () => {
        const {
            compInfo, activeGroupData, no_of_rotation
        } = this.state;
        this.setState({ updating_regions: true })

        const { rectangles, imageId, old_rectangle } = this.state;



        const originalWidth = 640;
        const originalHeight = 480;
        const targetWidth = DEFAULT_RESOLUTION.width;
        const targetHeight = DEFAULT_RESOLUTION.height;


        const scaleX = targetWidth / originalWidth;
        const scaleY = targetHeight / originalHeight;

        const rectsData = rectangles.map(rect => ({
            id: rect.id,
            name: rect.name,
            coordinates: {
                x: rect.x * scaleX,
                y: rect.y * scaleY,
                width: rect.width * scaleX,
                height: rect.height * scaleY
            },
            colour: rect.colour
        }));

        console.log('**** rectsData ', rectsData, scaleX, scaleY);

        try {
            const canvas = this.canvasRef.current;

            // 
            const payload = {
                _id: compInfo._id,
                rectangles: rectsData,
                region_confirmation_datas: this.state.region_confirmation_datas
            }

            const response = await urlSocket.post('/api/regions/save', payload);
            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                this.error_handler(response.data.error);
            }
            else {
                // // this.setState({ modal_xlarge1: false, compInfo: response.data.result });
                this.setState({ compInfo: response.data.result });
                if (response.data.success === true) {
                    const updated_rectangles = [...this.state.rectangles];

                    this.setState({
                        modal_xlarge1: false,
                        compInfo: response.data.result,
                        show_region_confirmation: false,
                        rectangles: updated_rectangles,
                        previous_rectangle: JSON.parse(JSON.stringify(updated_rectangles)),

                        // last edited drag, move option not disabled
                        selectedRectangleIndex: null,
                        editingRectangleIndex: null,
                        resizingRectangleIndex: null,
                        movingRectangleIndex: null,
                    });

                    // ✅ Update sessionStorage
                    const sessionData = JSON.parse(sessionStorage.getItem('manageData'));
                    sessionData.compInfo = response.data.result;
                    sessionStorage.setItem('manageData', JSON.stringify(sessionData));
                    Swal.fire({
                        title: 'Region Values Updated Successfully',
                        icon: 'success',
                        showConfirmButton: false,
                        // confirmButtonText: 'OK'
                    })
                }
            }
        } catch (error) {
            console.error('Error sending coordinates and image:', error.message);
        } finally {
            this.setState({ updating_regions: false, region_confirmation_datas: {} })
        }
    }

    deleteDrawnRegions = async () => {
        let rectsData = [];
        try {
            const formData = new FormData();
            formData.append('_id', this.state.compInfo._id);
            formData.append('rectangles', JSON.stringify(rectsData));

            const payload = {
                _id: this.state.compInfo._id,
                rectangles: rectsData,
            }

            const response = await urlSocket.post('/api/regions/save', payload);
            if (response.data.error === "Tenant not found") {
                console.log("data error", response.data.error);
                this.error_handler(response.data.error);
            }
            else {
                this.setState({ compInfo: response.data.result, rectangles: [] })

                if (response.data.success === true) {
                    Swal.fire({
                        title: 'Drawn Regions Deleted Successfully',
                        // text: 'Drawn Regions Deleted Successfully',
                        icon: 'success',
                        // timer: 1000,
                        showConfirmButton: false,
                        confirmButtonText: 'OK'
                    })
                }
            }
        } catch (error) {
            console.error('Error sending coordinates and image:', error.message);
        }
    }

    deleteSelectedRectangle = (clickedIndex) => {
        const { selectedRectangleIndex } = this.state;

        if (clickedIndex !== null && clickedIndex !== undefined && clickedIndex >= 0) {
            this.setState(prevState => ({
                rectangles: prevState.rectangles.filter((_, index) => index !== clickedIndex)
            }));
        } else {
            if (selectedRectangleIndex !== null) {
                this.setState(prevState => ({
                    rectangles: prevState.rectangles.filter((_, index) => index !== selectedRectangleIndex),
                    selectedRectangleIndex: null
                }));
            }
        }
        this.setState({ editingRectangleIndex: null, inputRectangleName: '', existRectangleNameError: false });
    };



    editSelectedRectangle = (clickedIndex) => {
        console.log("hi")
        this.setState({
            editingRectangleIndex: clickedIndex,
            inputRectangleName: this.state.rectangles[clickedIndex].name,
            show_region_edit_modal: true,
        });
    }

    resizeSelectedRectangle = (clickedIndex) => {
        console.log("resize")
        this.setState({ resizingRectangleIndex: clickedIndex });
    };

    moveSelectedRectangle = (clickedIndex) => {
        this.setState({ movingRectangleIndex: clickedIndex });
    };

    handleRectangle = (clickedIndex) => {
        console.log("hui")
        this.setState({ selectedRectangleIndex: clickedIndex, existRectangleNameError: false });
    };

    debounce = (func, delay) => {
        return function (...args) {
            const context = this;
            clearTimeout(context.timer);
            context.timer = setTimeout(() => func.apply(context, args), delay);
        };
    };

    handleResizeStart = (e, index) => {
        e.stopPropagation();
        e.preventDefault();

        const canvas = this.canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        let offsetX, offsetY;

        if (e.type === 'mousedown' || e.type === 'mousemove') {
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
        } else if (e.type === 'touchstart' || e.type === 'touchmove') {
            offsetX = e.touches[0].clientX - rect.left;
            offsetY = e.touches[0].clientY - rect.top;
        }

        const { rectangles } = this.state;
        const initialRect = rectangles[index];
        const initialX = initialRect.x;
        const initialY = initialRect.y;
        const initialWidth = initialRect.width;
        const initialHeight = initialRect.height;

        this.resizingRectIndexRef.current = index; // Track the current resizing rectangle index

        const onMouseMove = this.debounce((moveEvent) => {
            const { rectangles } = this.state;
            const { resizingRectIndexRef } = this;

            let moveX, moveY;

            if (moveEvent.type === 'mousemove') {
                moveX = moveEvent.clientX - rect.left;
                moveY = moveEvent.clientY - rect.top;
            } else if (moveEvent.type === 'touchmove') {
                moveX = moveEvent.touches[0].clientX - rect.left;
                moveY = moveEvent.touches[0].clientY - rect.top;
            }

            if (resizingRectIndexRef.current !== index) return; // Ensure only the intended rectangle is resized

            let newWidth = initialWidth + moveX - offsetX;
            let newHeight = initialHeight + moveY - offsetY;

            // Restrict resizing within canvas boundaries
            newWidth = Math.min(newWidth, canvas.width - initialX); // Limit width to canvas width minus current x
            newHeight = Math.min(newHeight, canvas.height - initialY); // Limit height to canvas height minus current y

            requestAnimationFrame(() => {
                this.setState(prevState => {
                    const updatedRectangles = [...prevState.rectangles];
                    updatedRectangles[index] = {
                        ...initialRect,
                        width: newWidth > 40 ? newWidth : 40, // Minimum width constraint
                        height: newHeight > 40 ? newHeight : 40, // Minimum height constraint
                    };
                    return { rectangles: updatedRectangles };
                });
            });
        }, 1); // Adjust debounce delay as needed (e.g., 20ms)

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchmove', onMouseMove);
            document.removeEventListener('touchend', onMouseUp);
            this.resizingRectIndexRef.current = null;
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('touchmove', onMouseMove);
        document.addEventListener('touchend', onMouseUp);
    };

    handleMoveStart = (e, index) => {
        e.stopPropagation();
        e.preventDefault();

        const canvas = this.canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        let offsetX, offsetY;

        if (e.type === 'mousedown' || e.type === 'mousemove') {
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
        } else if (e.type === 'touchstart' || e.type === 'touchmove') {
            offsetX = e.touches[0].clientX - rect.left;
            offsetY = e.touches[0].clientY - rect.top;
        }


        const { rectangles } = this.state;
        const initialRect = rectangles[index];
        const initialX = initialRect.x;
        const initialY = initialRect.y;

        this.draggingRectIndexRef.current = index; // Track the current dragging rectangle index

        const onMouseMove = this.debounce((moveEvent) => {
            const { rectangles } = this.state;
            const { draggingRectIndexRef } = this;
            let moveX, moveY;
            if (moveEvent.type === 'mousemove') {
                moveX = moveEvent.clientX - rect.left;
                moveY = moveEvent.clientY - rect.top;
            } else if (moveEvent.type === 'touchmove') {
                moveX = moveEvent.touches[0].clientX - rect.left;
                moveY = moveEvent.touches[0].clientY - rect.top;
            }

            if (draggingRectIndexRef.current !== index) return; // Ensure only the intended rectangle is moved

            let newX = initialX + moveX - offsetX;
            let newY = initialY + moveY - offsetY;

            // Ensure the rectangle stays within canvas boundaries
            newX = Math.max(0, Math.min(newX, canvas.width - initialRect.width));
            newY = Math.max(0, Math.min(newY, canvas.height - initialRect.height));

            requestAnimationFrame(() => {
                this.setState(prevState => {
                    const updatedRectangles = [...prevState.rectangles];
                    updatedRectangles[index] = {
                        ...initialRect,
                        x: newX,
                        y: newY
                    };
                    return { rectangles: updatedRectangles };
                });
            });
        }, 1); // Adjust debounce delay as needed (e.g., 20ms)

        const onEnd = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onEnd);
            document.removeEventListener('touchmove', onMouseMove);
            document.removeEventListener('touchend', onEnd);
            this.draggingRectIndexRef.current = null; // Reset the dragging rectangle index
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchmove', onMouseMove);
        document.addEventListener('touchend', onEnd);
    };

    setSelectedColor(color) {
        this.setState({ selectedColor: color });
    }

    handleShowRegion = () => {
        this.setState(prevState => ({
            showRegion: !prevState.showRegion
        }));
    }

    handleZoomIn = () => {
        // this.setState(prevState => ({ zoom: prevState.zoom * 1.2 }));
        this.setState(prevState => {
            if (prevState.zoom < 1.7) {   // 1.4
                return { zoom: prevState.zoom * 1.2 };
            }
        });

    };

    handleZoomOut = () => {
        // this.setState(prevState => ({ zoom: prevState.zoom / 1.2 }));
        this.setState(prevState => {
            if (prevState.zoom > 0.7) {
                return { zoom: prevState.zoom / 1.2 };
            }
        });
    };

    handleZoomReset = () => {
        this.setState({ zoom: 1 });
    }

    scrollMouseDown = (e) => {
        if (!this.state.showRegion) {
            // Your existing mouse down logic for rectangles
        } else {
            this.setState({
                isPanning: true,
                panStartX: e.clientX,
                panStartY: e.clientY,
            });
        }
    };

    scrollMouseMove = (e) => {
        if (this.state.isPanning) {
            const parentDiv = this.parentDivRef.current;
            parentDiv.scrollLeft -= (e.clientX - this.state.panStartX);
            parentDiv.scrollTop -= (e.clientY - this.state.panStartY);

            this.setState({
                panStartX: e.clientX,
                panStartY: e.clientY,
            });
        }
    };

    scrollMouseUp = () => {
        this.setState({ isPanning: false });
    };

    overallTest = (e) => {
        let state_value = { overall_testing: e.target.checked };
        if (e.target.checked === true) { state_value.testing_mode_required = false }

        this.setState(state_value);
    }
    region_wiseTest = (e) => {
        let state_value = { region_wise_testing: e.target.checked };
        if (e.target.checked === true) { state_value.testing_mode_required = false }
        this.setState(state_value);
    }




    error_handler = (error) => {
        sessionStorage.removeItem("authUser");
        this.props.history.push("/login");
    }

    showImage = (output_img) => {
        const parts = output_img.split("/");
        const newPath = parts.slice(1).join("/");

        let startIndex;
        if (newPath.includes("Datasets/")) {
            startIndex = newPath.indexOf("Datasets/");
        } else {
            startIndex = newPath.indexOf("receive/");
        }

        const relativePath = newPath.substring(startIndex);
        console.log('output_img : ', img_url + relativePath)
        return `${img_url + relativePath}`
    }

    render() {
        // const { compModelInfo, modelInfo, selectedModel } = this.state;
        const {
            compModelInfo, modelInfo, selectedModel,
            allAny, setSelectAll, setPartialySelected, anySelected, modalOpen,
            webcamEnabled, imageSrcNone, compInfo, region_testing, modal_xlarge1,
            imageSrc, rectangles, selectedRectangleIndex, resizingRectangleIndex, movingRectangleIndex, rectNameInput, nestedRectNameInput,
            editingRectangleIndex,
            trainingStatus
        } = this.state;
        const showButton = compModelInfo.some(data => data.training_sts === 'Training Completed' || data.training_sts === 'No training required');
        const types = [...new Set(modelInfo.map(model => model.type))];

        const marks1 = {
            0: 0,
            200: 200
        }

        // Separate models into groups based on type
        const mlModels = modelInfo.filter(model => model.type === 'ML');
        const dlModels = modelInfo.filter(model => model.type === 'DL');


        return (
            <>
                {
                    this.state.full_screen_loading ?
                        <FullScreenLoader />
                        : null
                }
                <div className="page-content">
                    <Row className="mb-3">
                        <Col xs={9}>
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="mb-0 mt-2 m-2 font-size-14 fw-bold">
                                    MODEL INFORMATION
                                </div>
                            </div>
                        </Col>
                        <Col
                            xs={3}
                            className="d-flex align-items-center justify-content-end"
                        >
                            <button
                                className="btn btn-outline-primary btn-sm me-2"
                                color="primary"
                                onClick={() => this.back()}
                            >
                                Back <i className="mdi mdi-arrow-left"></i>
                            </button>
                        </Col>
                    </Row>
                    <Container fluid={true}>
                        <Card>
                            <CardBody>
                                {this.state.modelInfoLoading ? (
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            height: '50vh',
                                        }}
                                    >
                                        <Spinner color="primary" />
                                        <h5 className="mt-4">
                                            <strong>Loading Model Details...</strong>
                                        </h5>
                                    </div>
                                ) : (
                                    <>
                                        <CardTitle className="mb-0 ">
                                            <span className="me-2 font-size-12">
                                                Component Name :
                                            </span>
                                            {this.state.comp_name}
                                        </CardTitle>
                                        <CardText className="mb-0">
                                            <span className="me-2 font-size-12">
                                                Component Code :
                                            </span>
                                            {this.state.comp_code}
                                        </CardText>

                                        <ButtonGroup className='my-2'>
                                            <Button
                                                className='btn btn-sm'
                                                color="primary"
                                                outline={this.state.selectFilter !== 0}
                                                onClick={() => this.fixedOrany('Fixed', 0)}
                                                disabled={this.state.isLoading}
                                            >
                                                {this.state.isLoading && this.state.loadingButtonIndex === 0 ? (
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
                                                outline={this.state.selectFilter !== 1}
                                                onClick={() => this.fixedOrany('any', 1)}
                                                disabled={this.state.isLoading}
                                            >
                                                {this.state.isLoading && this.state.loadingButtonIndex === 1 ? (
                                                    <>
                                                        <Spinner size="sm" className="me-2" />
                                                        Loading...
                                                    </>
                                                ) : (
                                                    'Any position'
                                                )}
                                            </Button>
                                        </ButtonGroup>


                                        {this.state.selectFilter === 0 && (
                                            <div className="my-1 mx-1">
                                                <Checkbox
                                                    checked={this.state.region_testing}
                                                    onChange={(e) => this.regionSelection(e)}
                                                    disabled={this.state.trainingStatus}
                                                >
                                                    Region Selection
                                                </Checkbox>
                                            </div>
                                        )}

                                        {this.state.tabs && (
                                            <>
                                                <div className="d-flex my-3">
                                                    <Dropdown
                                                        overlay={
                                                            <Menu>
                                                                <Menu.SubMenu title="ML Models">
                                                                    {mlModels.length !== 0 ? (
                                                                        mlModels.map((model, idx) => (
                                                                            <Menu.Item
                                                                                key={idx.toString()}
                                                                                onClick={() =>
                                                                                    this.handleModelSelect(model)
                                                                                }
                                                                                className={
                                                                                    selectedModel === model
                                                                                        ? 'ant-menu-item-selected'
                                                                                        : ''
                                                                                }
                                                                            >
                                                                                {model.model_name}
                                                                            </Menu.Item>
                                                                        ))
                                                                    ) : (
                                                                        <Menu.Item key="no-model" disabled>
                                                                            No ML Models available
                                                                        </Menu.Item>
                                                                    )}
                                                                </Menu.SubMenu>
                                                                <Menu.SubMenu title="DL Models">
                                                                    {dlModels.length !== 0 ? (
                                                                        dlModels.map((model, idx) => (
                                                                            <Menu.Item
                                                                                key={idx.toString()}
                                                                                onClick={() =>
                                                                                    this.handleModelSelect(model)
                                                                                }
                                                                                className={
                                                                                    selectedModel === model
                                                                                        ? 'ant-menu-item-selected'
                                                                                        : ''
                                                                                }
                                                                            >
                                                                                {model.model_name}
                                                                            </Menu.Item>
                                                                        ))
                                                                    ) : (
                                                                        <Menu.Item key="no-model" disabled>
                                                                            No DL Models available
                                                                        </Menu.Item>
                                                                    )}
                                                                </Menu.SubMenu>
                                                            </Menu>
                                                        }
                                                        arrow
                                                    >
                                                        <Button className="btn btn-sm" color="info">
                                                            Select a Model to Assign
                                                        </Button>
                                                    </Dropdown>
                                                    {this.state.selectFilter === 0 && (
                                                        <div className="ms-3">
                                                            <Button
                                                                className="btn btn-sm"
                                                                color={
                                                                    this.state.compInfo?.datasets?.white_path
                                                                        ? `success`
                                                                        : `warning`
                                                                }
                                                                onClick={() => this.createOutline()}
                                                                disabled={this.state.trainingStatus}
                                                            >
                                                                {this.state.compInfo?.datasets?.white_path
                                                                    ? `View Outline`
                                                                    : `Add Outline`}
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {this.state.selectFilter === 0 &&
                                                        this.state.region_testing === true &&
                                                        this.state.compInfo?.datasets?.image_path && (
                                                            <div className="ms-3">
                                                                <Button
                                                                    className="btn btn-sm"
                                                                    color={
                                                                        this.state.compInfo?.rectangles
                                                                            ?.length > 0
                                                                            ? `success`
                                                                            : `warning`
                                                                    }
                                                                    onClick={(e) => {
                                                                        this.tog_xlarge1(e);
                                                                    }}
                                                                    disabled={this.state.trainingStatus}
                                                                >
                                                                    {this.state.compInfo?.rectangles?.length >
                                                                        0
                                                                        ? `View Region(s)`
                                                                        : `Draw Region(s)`}
                                                                </Button>
                                                            </div>
                                                        )}
                                                    {showButton && (
                                                        <Button
                                                            color="success"
                                                            className="ms-auto btn btn-sm w-md"
                                                            onClick={this.toggleModal}
                                                        >
                                                            Start Admin Accuracy Testing
                                                        </Button>
                                                    )}
                                                </div>


                                                <div className="table-responsive">
                                                    <Table
                                                        className="table mb-0 align-middle table-nowrap table-check"
                                                        bordered
                                                    >
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th>S. No.</th>
                                                                <th>Model Name</th>
                                                                <th>Model Type</th>
                                                                <th>Model Status</th>
                                                                <th>Model Live Version</th>
                                                                <th>Training Status</th>
                                                                <th>Trained Version list</th>
                                                                <th>Model Version Info</th>
                                                                <th>Admin Test</th>
                                                                {/* <th>Action</th> */}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {compModelInfo.map((data, index) => (
                                                                <tr key={index} id="recent-list">
                                                                    <td style={{ backgroundColor: 'white' }}>
                                                                        {index + 1}
                                                                    </td>
                                                                    <td style={{ backgroundColor: 'white' }}>
                                                                        {data.model_name}
                                                                    </td>
                                                                    <td style={{ backgroundColor: 'white' }}>
                                                                        {data.type}
                                                                    </td>
                                                                    <td style={{ backgroundColor: "white" }}>
                                                                        <span className={data.model_status === 'Live' ? 'badge badge-soft-success' : data.model_status === 'Approved' ? 'badge badge-soft-warning' : data.model_status === 'Draft' ? 'badge badge-soft-info' : 'badge badge-soft-danger'}>
                                                                            {data.model_status}
                                                                        </span>
                                                                    </td>
                                                                    {/* <td>{data.model_live_ver !== "NA" ? `V${data.model_live_ver}` : data.model_live_ver}</td> */}
                                                                    <td style={{ backgroundColor: 'white' }}>
                                                                        {data.model_live_ver &&
                                                                            data.model_live_ver.length > 0 ? (
                                                                            <div
                                                                                style={{
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'space-around',
                                                                                }}
                                                                            >
                                                                                {data.model_live_ver === 'NA'
                                                                                    ? 'NA'
                                                                                    : 'V' +
                                                                                    (Array.isArray(
                                                                                        data.model_live_ver
                                                                                    )
                                                                                        ? data.model_live_ver.join(
                                                                                            ' ,V'
                                                                                        )
                                                                                        : data.model_live_ver)}
                                                                            </div>
                                                                        ) : (
                                                                            <div
                                                                                style={{
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'space-around',
                                                                                }}
                                                                            >
                                                                                NA
                                                                            </div>
                                                                        )}
                                                                    </td>


                                                                    <td style={{ backgroundColor: "white" }}>
                                                                        {
                                                                            (!data.training_sts || data.training_sts === '') ?
                                                                                'NA'
                                                                                : (Array.isArray(data.training_sts) ? data.training_sts.join(' , ') : data.training_sts)
                                                                        }
                                                                    </td>

                                                                    <td style={{ backgroundColor: 'white' }}>
                                                                        {data.trained_ver_list &&
                                                                            data.trained_ver_list.length > 0 ? (
                                                                            <div
                                                                                style={{
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'space-around',
                                                                                }}
                                                                            >
                                                                                {Array.isArray(
                                                                                    data.trained_ver_list
                                                                                ) &&
                                                                                    data.trained_ver_list[0] === 'NA'
                                                                                    ? 'NA'
                                                                                    : 'V' +
                                                                                    (Array.isArray(
                                                                                        data.trained_ver_list
                                                                                    )
                                                                                        ? data.trained_ver_list.join(
                                                                                            ' ,V'
                                                                                        )
                                                                                        : data.trained_ver_list)}
                                                                            </div>
                                                                        ) : (
                                                                            <div
                                                                                style={{
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'space-around',
                                                                                }}
                                                                            >
                                                                                NA
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td style={{ backgroundColor: 'white' }}>
                                                                        <Button
                                                                            color="primary"
                                                                            className="btn btn-sm"
                                                                            onClick={() => {
                                                                                console.log(!data?.region_selection, '!data?.region_selection')
                                                                                if (
                                                                                    !data?.region_selection || // If region_selection is false, allow
                                                                                    !this.state.region_testing || // If showRegion is false, allow
                                                                                    (this.state.region_testing &&
                                                                                        this.state.compInfo?.rectangles
                                                                                            ?.length > 0) // If true, only allow if at least 1 rectangle
                                                                                ) {
                                                                                    this.goTOModelVerMgmt(data);
                                                                                } else {
                                                                                    Swal.fire({
                                                                                        icon: 'warning',
                                                                                        title: 'Region Required',
                                                                                        text: 'At least create one region before managing the model.',
                                                                                    });
                                                                                }
                                                                            }}
                                                                        >
                                                                            Manage
                                                                        </Button>
                                                                    </td>
                                                                    <td style={{ backgroundColor: 'white' }}>
                                                                        <Checkbox
                                                                            name={data.model_name}
                                                                            value={data}
                                                                            checked={data?.checked || false}
                                                                            onChange={(e) =>
                                                                                this.handleChange(e, data.type)
                                                                            }
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                    {compModelInfo.length === 0 && (
                                                        <div
                                                            className="container"
                                                            style={{
                                                                position: 'relative',
                                                                height: '20vh',
                                                            }}
                                                        >
                                                            <div
                                                                className="text-center"
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: '50%',
                                                                    left: '50%',
                                                                    transform: 'translate(-50%, -50%)',
                                                                }}
                                                            >
                                                                <h5 className="text-secondary">
                                                                    Please Select the Model
                                                                </h5>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </CardBody>
                        </Card>
                    </Container>
                </div>

                {/* Modal window for Outline capturing */}
                <Modal
                    isOpen={this.state.showOutline}
                    toggle={() => this.closeOutline()}
                    centered
                    size="xl"
                    style={{ zIndex: 1000 }}
                >
                    <ModalHeader toggle={() => this.closeOutline()}>
                        <div>
                            Component Name: {this.state.comp_name} , Component Code:{' '}
                            {this.state.comp_code}
                        </div>
                    </ModalHeader>
                    <ModalBody>
                        <Row lg={12} className="text-center row-eq-height">
                            <Col sm={6} md={6} lg={6}>
                                <Card
                                    className="mt-2"
                                    style={{
                                        position: 'relative',
                                        backgroundColor: '#f0f0f0',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        border: '2px solid #ddd',
                                        flex: '1',
                                    }}
                                >
                                    <CardTitle
                                        className="my-2"
                                        style={{
                                            color: '#333',
                                            borderBottom: '2px solid #ddd',
                                            padding: '0.5rem 1rem',
                                        }}
                                    >
                                        Capture Outline for Reference
                                    </CardTitle>
                                    <CardBody
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        {webcamEnabled &&
                                            (this.state.cameraDisconnected ? (
                                                <div
                                                    className="my-2"
                                                    style={{
                                                        outline: '2px solid #000',
                                                        padding: '10px',
                                                        borderRadius: '5px',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                    }}
                                                >
                                                    <div
                                                        className="d-flex flex-column justify-content-center align-items-center webcam-disconnected"
                                                        style={{ width: '100%' }}
                                                    >
                                                        <h5 style={{ fontWeight: 'bold' }}>
                                                            Webcam Disconnected
                                                        </h5>
                                                        <Spinner className="mt-2" color="primary" />
                                                        <h6
                                                            className="mt-2"
                                                            style={{ fontWeight: 'bold' }}
                                                        >
                                                            Please check your webcam connection....
                                                        </h6>
                                                    </div>
                                                </div>
                                            ) : (
                                                <ZoomableWebcamViewer
                                                    ref={this.webcamRef}
                                                    zoomVal={this.state.zoom_value?.zoom || 1}
                                                    centerVal={this.state.zoom_value?.center || { x: 0.5, y: 0.5 }}
                                                />

                                            ))}
                                    </CardBody>
                                    <CardFooter>
                                        <div>
                                            <InputGroup className="my-3">
                                                <InputGroupText id="basic-addon1">
                                                    Select Outline Type
                                                </InputGroupText>
                                                <Input
                                                    type="select"
                                                    value={this.state.outline_type}
                                                    onChange={this.handleSelectChange}
                                                >
                                                    <option value="1">Type 1</option>
                                                    <option value="2">Type 2</option>
                                                    <option value="3">Type 3</option>
                                                    <option value="4">Type 4</option>
                                                </Input>
                                            </InputGroup>
                                        </div>
                                        <div>
                                            {this.state.adding_image ? (
                                                <Button
                                                    color="info"
                                                    className="btn btn-sm"
                                                    style={{ whiteSpace: 'pre' }}
                                                    disabled
                                                >
                                                    Adding Outline... <Spin spinning={true}></Spin>
                                                </Button>
                                            ) : (
                                                webcamEnabled &&
                                                this.state.cameraDisconnected === false && (
                                                    <Button
                                                        color="primary"
                                                        className="btn btn-sm"
                                                        onClick={() => this.captureImage()}
                                                    >
                                                        Add Outline
                                                    </Button>
                                                )
                                            )}
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Col>
                            <Col
                                className="scrlHide"
                                sm={6}
                                md={6}
                                lg={6}
                                style={{
                                    // boxShadow: '0px 0px 10px grey',
                                    borderRadius: '5px',
                                    height: '70vh',
                                    overflowY: 'auto',
                                }}
                            >
                                <Row>
                                    {this.state.images_length < 1 ? (
                                        <Col>
                                            <h5
                                                className="my-4"
                                                style={{ fontWeight: 'bold', textAlign: 'center' }}
                                            >
                                                No Outline available. Upload one to display.
                                            </h5>
                                        </Col>
                                    ) : (
                                        <>
                                            <Card
                                                className="mt-2"
                                                style={{
                                                    position: 'relative',
                                                    backgroundColor: '#f0f0f0',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                    border: '2px solid #ddd',
                                                    flex: '1',
                                                }}
                                            >
                                                <div style={{ position: 'absolute', zIndex: '2' }}>
                                                    {this.state.response_message && (
                                                        <Alert
                                                            severity={
                                                                this.state.response_message ===
                                                                    'Image successfully added'
                                                                    ? 'success'
                                                                    : 'error'
                                                            }
                                                        >
                                                            <AlertTitle
                                                                style={{
                                                                    fontWeight: 'bold',
                                                                    margin: 'auto',
                                                                }}
                                                            >
                                                                {this.state.response_message}
                                                            </AlertTitle>
                                                        </Alert>
                                                    )}
                                                </div>
                                                <CardTitle
                                                    className="my-2"
                                                    style={{
                                                        color: '#333',
                                                        borderBottom: '2px solid #ddd',
                                                        padding: '0.5rem 1rem',
                                                    }}
                                                >
                                                    Image Outline Preview
                                                </CardTitle>
                                                <CardBody
                                                    className="mb-2"
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        backgroundColor: 'rgb(42,48,66)',
                                                        zIndex: 100,
                                                        borderRadius: '10px',
                                                    }}
                                                >
                                                    {this.state.thresLoad === false ? (
                                                        <>
                                                            <AntdImage
                                                                key={this.state.outline_thres}
                                                                // src={`${img_url + compInfo.datasets.white_path
                                                                //     }?timestamp=${new Date().getTime()}`}
                                                                src={this.showImage(compInfo.datasets.white_path)}
                                                                alt="Image not there"
                                                            />
                                                        </>

                                                    ) : (
                                                        <Spinner className="mt-2" color="primary" />
                                                    )}
                                                </CardBody>
                                            </Card>
                                        </>
                                    )}
                                </Row>
                            </Col>
                        </Row>
                    </ModalBody>
                </Modal>

                {/* Modal for Admin Accuracy Testing */}
                {
                    this.state.modalOpen ?
                        <SelectAdminTestMultipleVersions
                            modalOpen={this.state.modalOpen}
                            modelaccuracytest={this.state.modelaccuracytest}
                            toggleModal={this.toggleModal}
                            closeModal={this.closeModal}
                            acctest={this.acctest}
                            rectangles={this.state?.rectangles}
                        />
                        : null
                }


                {/* Modal for Region Selection */}
                <Modal
                    size="xl"
                    isOpen={modal_xlarge1}
                    toggle={this.tog_xlarge1}
                    scrollable={true}
                    fullscreen
                >
                    <ModalHeader toggle={this.tog_xlarge1}>
                        <div>
                            Component Name: {this.state.comp_name} , Component Code:{' '}
                            {this.state.comp_code}
                        </div>
                    </ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col xs={12} md={6} lg={6}>
                                <Card
                                    className="mt-2"
                                    style={{
                                        position: 'relative',
                                        top: '0',
                                        zIndex: '1000',
                                        backgroundColor: '#f0f0f0',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        border: '2px solid #ddd',
                                        flex: '1',
                                    }}
                                >
                                    <CardTitle
                                        className="my-2 text-center"
                                        style={{
                                            color: '#333',
                                            borderBottom: '2px solid #ddd',
                                            padding: '0.5rem 1rem',
                                        }}
                                    >
                                        Region Selection
                                    </CardTitle>
                                    <CardBody
                                        className="mb-2"
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            zIndex: 100,
                                            borderRadius: '10px',
                                        }}
                                    >

                                        {imageSrc && (
                                            <div className="d-flex flex-column">
                                                <div
                                                    ref={this.parentDivRef}
                                                    className="d-flex"
                                                    style={{
                                                        // width: '100%', height: 'auto',
                                                        overflow: 'scroll',
                                                    }}

                                                >
                                                    <div
                                                        style={{
                                                            position: 'relative',
                                                            // width: '100%', height: 'auto',
                                                            overflow: 'hidden',
                                                            transform: `scale(${this.state.zoom})`,
                                                            transformOrigin: 'top left',
                                                        }}
                                                    >
                                                        <canvas
                                                            ref={this.canvasRef}
                                                            width={640}
                                                            height={480}
                                                            onMouseDown={
                                                                this.state.showRegion && this.state.isCreatingRegion
                                                                    ? this.handleMouseDown
                                                                    : null
                                                            }
                                                            onMouseMove={
                                                                this.state.showRegion && this.state.isCreatingRegion
                                                                    ? this.handleMouseMove
                                                                    : null
                                                            }
                                                            onMouseUp={
                                                                this.state.showRegion && this.state.isCreatingRegion
                                                                    ? this.handleMouseUp
                                                                    : null
                                                            }
                                                            onTouchStart={
                                                                this.state.showRegion && this.state.isCreatingRegion
                                                                    ? this.handleMouseDown
                                                                    : null
                                                            }
                                                            onTouchMove={
                                                                this.state.showRegion && this.state.isCreatingRegion
                                                                    ? this.handleMouseMove
                                                                    : null
                                                            }
                                                            onTouchEnd={
                                                                this.state.showRegion && this.state.isCreatingRegion
                                                                    ? this.handleMouseUp
                                                                    : null
                                                            }
                                                            style={{
                                                                borderRadius: '10px',
                                                                width: '100%',
                                                                height: 'auto',
                                                            }}
                                                        />
                                                        {rectangles.map((rect, index) => {
                                                            // Get the actual size of the canvas
                                                            const canvas = this.canvasRef.current;
                                                            if (canvas?.getBoundingClientRect()) {
                                                                const canvasRect =
                                                                    canvas?.getBoundingClientRect();
                                                                const canvasWidth = canvasRect.width;
                                                                const canvasHeight = canvasRect.height;

                                                                const buttonSize =
                                                                    (canvasWidth * 640) / 100; // (20 / 640) * canvasWidth;

                                                                const baseSize = 20; // Base size in pixels
                                                                const handleSize = (18 / canvasWidth) * 100;
                                                                const handleSizeW =
                                                                    16 * (this.state.canvas_width / 640);
                                                                const resizeW =
                                                                    18 * (this.state.canvas_width / 640);
                                                                const resizeH =
                                                                    18 * (this.state.canvas_height / 480);
                                                                const movingW =
                                                                    20 * (this.state.canvas_width / 640);
                                                                const movingH =
                                                                    20 * (this.state.canvas_height / 480);
                                                                return (
                                                                    <React.Fragment key={index}>
                                                                        {this.state.showRegion && (
                                                                            <Popconfirm
                                                                                placement="rightBottom"
                                                                                title="Do you want to delete this region?"
                                                                                onConfirm={() =>
                                                                                    this.deleteSelectedRectangle(
                                                                                        index
                                                                                    )
                                                                                }
                                                                                zIndex={1200}
                                                                                okText="Yes"
                                                                                cancelText="No"
                                                                            >
                                                                                <button
                                                                                    className="btn btn-sm"
                                                                                    ref={(el) =>
                                                                                    (this.trashButtonsRef[index] =
                                                                                        el)
                                                                                    }
                                                                                    style={{
                                                                                        position: 'absolute',
                                                                                        left: `${((rect.x +
                                                                                            rect.width -
                                                                                            handleSizeW) /
                                                                                            640) *
                                                                                            100
                                                                                            }%`,
                                                                                        top: `${(rect.y / 480) * 100}%`,
                                                                                        background: 'none',
                                                                                        border: 'none',
                                                                                        cursor: 'pointer',
                                                                                        fontSize: `${handleSizeW}px`,
                                                                                        color: 'red',
                                                                                        transform:
                                                                                            'translate(-50%, 0%)',
                                                                                        zIndex: 10,
                                                                                    }}
                                                                                >
                                                                                    <FaTrashAlt />
                                                                                </button>
                                                                            </Popconfirm>
                                                                        )}

                                                                        {selectedRectangleIndex === index &&
                                                                            resizingRectangleIndex === index && (
                                                                                <div
                                                                                    style={{
                                                                                        position: 'absolute',
                                                                                        // left: rect.x + rect.width - 20,
                                                                                        // top: rect.y + rect.height - 20,
                                                                                        left: `${((rect.x + rect.width) /
                                                                                            640) *
                                                                                            100
                                                                                            }%`, // Convert to percentage
                                                                                        top: `${((rect.y + rect.height) /
                                                                                            480) *
                                                                                            100
                                                                                            }%`, // Convert to percentage
                                                                                        width: `${resizeW}px`,
                                                                                        height: `${resizeH}px`,
                                                                                        background: 'white',
                                                                                        cursor: 'nwse-resize',
                                                                                        border: '2px solid black',
                                                                                        borderRadius: '50%',
                                                                                        transform:
                                                                                            'translate(-100%, -100%)',
                                                                                    }}
                                                                                    onMouseDown={(e) =>
                                                                                        this.handleResizeStart(e, index)
                                                                                    }
                                                                                    onTouchStart={(e) =>
                                                                                        this.handleResizeStart(e, index)
                                                                                    }
                                                                                />
                                                                            )}
                                                                        {selectedRectangleIndex === index &&
                                                                            movingRectangleIndex === index && (
                                                                                <div
                                                                                    style={{
                                                                                        position: 'absolute',
                                                                                        // left: rect.x,
                                                                                        // top: rect.y,
                                                                                        left: `${(rect.x / 640) * 100
                                                                                            }%`,
                                                                                        top: `${(rect.y / 480) * 100}%`,
                                                                                        width: `${movingW}px`,
                                                                                        height: `${movingH}px`,
                                                                                        background:
                                                                                            'rgba(0, 0, 0, 0.5)',
                                                                                        cursor: 'move',
                                                                                    }}
                                                                                    onMouseDown={(e) =>
                                                                                        this.handleMoveStart(e, index)
                                                                                    }
                                                                                    onTouchStart={(e) =>
                                                                                        this.handleMoveStart(e, index)
                                                                                    }
                                                                                />
                                                                            )}
                                                                    </React.Fragment>
                                                                );
                                                            }
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardBody>
                                    <CardFooter>
                                        <InputGroup>
                                            <Label className="mx-1">
                                                Choose Rectangle Color:{' '}
                                            </Label>
                                            <ColorPicker_1
                                                selectedColor={this.state.selectedColor}
                                                setSelectedColor={(e) => this.setSelectedColor(e)}
                                            />
                                        </InputGroup>
                                        <InputGroup className="mx-3 my-3">
                                            <Label
                                                check
                                                className="py-1 px-2"
                                                style={{
                                                    userSelect: 'none',
                                                    boxShadow: this.state.showRegion
                                                        ? '0px 0px 10px 5px green'
                                                        : '0px 0px 10px 5px #ccc',
                                                    borderRadius: '5px',
                                                }}
                                            >
                                                <Input
                                                    type="checkbox"
                                                    checked={this.state.showRegion}
                                                    onChange={this.handleShowRegion}
                                                />{' '}
                                                Show Region
                                            </Label>
                                        </InputGroup>
                                        {/* <Button
                                            className="mx-2 my-2 btn btn-sm"
                                            onClick={this.sendCoordinates}
                                        >
                                            Send Coordinates and Image
                                        </Button> */}
                                        <Button
                                            className="mx-2 my-2 btn btn-sm"
                                            onClick={this.saveRegionChanges}
                                        >
                                            Save Changes
                                        </Button>
                                        {/* <ButtonGroup> */}
                                        <Button
                                            className="me-2 btn btn-sm"
                                            color="success"
                                            onClick={this.handleZoomIn}
                                        >
                                            Zoom In
                                        </Button>
                                        <Button
                                            className="me-2 btn btn-sm"
                                            color="warning"
                                            onClick={this.handleZoomOut}
                                        >
                                            Zoom Out
                                        </Button>
                                        <Button
                                            className="me-2 btn btn-sm"
                                            color="info"
                                            onClick={this.handleZoomReset}
                                        >
                                            Reset
                                        </Button>
                                        <Button
                                            color="primary"
                                            className="me-2 btn btn-sm"
                                            onClick={() => this.setState({ isCreatingRegion: true })}
                                            disabled={!this.state.showRegion} // only allow when Show Region is checked
                                        >
                                            Create Region
                                        </Button>
                                        {/* </ButtonGroup> */}
                                    </CardFooter>
                                </Card>
                            </Col>

                            <Col xs={12} md={6} lg={6}>
                                <div style={{ height: '30vh', overflowY: 'auto' }}>
                                    {rectangles.map((rectangle, id_rect) => (
                                        <div key={id_rect} className="d-flex my-2">
                                            <div
                                                onMouseDown={() => this.handleRectangle(id_rect)}
                                                className="d-flex item-button w-50 h-50"
                                                color="info"
                                            >
                                                <span className="me-auto">{rectangle.name}</span>

                                                <i
                                                    className="mx-2"
                                                    style={{ fontSize: '1rem', color: 'black' }}
                                                    onMouseDown={() => {
                                                        if (this.state.showRegion) {
                                                            this.moveSelectedRectangle(id_rect);
                                                        }
                                                    }}
                                                >
                                                    <FaArrowsAlt />
                                                </i>
                                                <i
                                                    className="mx-2"
                                                    style={{ fontSize: '1rem', color: 'black' }}
                                                    onMouseDown={() => {
                                                        if (this.state.showRegion) {
                                                            this.resizeSelectedRectangle(id_rect);
                                                        }
                                                    }}
                                                >
                                                    <FaExpand />
                                                </i>
                                                <i
                                                    className="mx-2"
                                                    style={{ fontSize: '1rem', color: 'black' }}
                                                    onMouseDown={() => {
                                                        if (this.state.showRegion) {
                                                            this.editSelectedRectangle(id_rect);
                                                        }
                                                    }}
                                                >
                                                    <FaEdit />
                                                </i>
                                                {this.state.showRegion && (
                                                    <Popconfirm
                                                        placement="rightBottom"
                                                        title="Do you want to delete this region?"
                                                        onConfirm={() =>
                                                            this.deleteSelectedRectangle(id_rect)
                                                        }
                                                        zIndex={1200}
                                                        okText="Yes"
                                                        cancelText="No"
                                                    >
                                                        <i
                                                            className="ms-2"
                                                            style={{
                                                                fontSize: '1rem',
                                                                color: 'red',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            <FaTrash />
                                                        </i>
                                                    </Popconfirm>
                                                )}
                                            </div>


                                        </div>
                                    ))}
                                </div>
                            </Col>
                        </Row>
                    </ModalBody>
                </Modal>

                <Modal
                    isOpen={this.state.show_region_edit_modal}
                    toggle={() => this.setState({ show_region_edit_modal: false })}
                    backdrop="static"
                    keyboard={false}
                    centered
                >
                    <ModalBody
                        className="rounded shadow"
                        style={{
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #dee2e6',
                            borderRadius: '1rem',
                        }}
                    >
                        <CardTitle className="fw-bold fs-5 mb-3 text-dark">✏️ Edit Region Name</CardTitle>

                        <InputGroup className="gap-2">
                            <Input
                                type="text"
                                value={this.state.inputRectangleName}
                                onChange={this.handleNameChange}
                                maxLength="8"
                                pattern="^[a-zA-Z0-9]{1,8}$"
                                title="Only letters and numbers allowed, up to 8 characters."
                                className="rounded-3 shadow-sm border-secondary"
                                style={{ backgroundColor: '#fff', color: '#333' }}
                            />

                            <Button
                                size="sm"
                                color="success"
                                className="d-flex align-items-center rounded-3 px-3 shadow-sm"
                                onClick={() => this.handleNameSubmit(this.state.editingRectangleIndex)}
                            >
                                <FaSave className="me-2" />
                                Save
                            </Button>

                            <Button
                                size="sm"
                                color="secondary"
                                className="d-flex align-items-center rounded-3 px-3 shadow-sm"
                                onClick={() => this.setState({
                                    show_region_edit_modal: false,
                                    editingRectangleIndex: null,
                                    existRectangleNameError: false,
                                    inputRectangleName: '',
                                })}
                            >
                                <FaTimes className="me-2" />
                                Cancel
                            </Button>
                        </InputGroup>

                        {this.state.existRectangleNameError && (
                            <Label className="text-danger mt-3 d-block">
                                * Rectangle Name Already Exists
                            </Label>
                        )}
                    </ModalBody>
                </Modal>



                {
                    this.state.show_region_confirmation ?
                        <RegionConfirmationModal
                            isOpen={this.state.show_region_confirmation}
                            toggle={() => this.discardRegionChanges()}
                            onConfirm={() => this.send_coordinates_to_backend()}
                            message={this.state.region_confirmation_datas}
                            updatingRegions={this.state.updating_regions}
                        />
                        : null
                }

                {
                    this.state.region_selecting ?
                        <RegionConfirmationModal
                            isOpen={this.state.region_selecting}
                            toggle={() => { this.setState({ region_selecting: false }) }}
                            onConfirm={() => this.confirmation_region()}
                            message={this.state.region_confirmation_datas}
                            updatingRegions={this.state.updating_regions}
                        />
                        : null
                }


                {this.state.region_changes === true && (
                    <SweetAlert
                        title="Are you sure?"
                        warning
                        showCancel
                        confirmBtnBsStyle="success"
                        cancelBtnBsStyle="danger"
                        onConfirm={() =>
                            this.setState({
                                confirm_both: false,
                                success_dlg: true,
                                dynamic_title: 'Deleted',
                                dynamic_description: 'Your file has been deleted.',
                            })
                        }
                        onCancel={() =>
                            this.setState({
                                confirm_both: false,
                                error_dlg: true,
                                dynamic_title: 'Cancelled',
                                dynamic_description: 'Your imaginary file is safe :)',
                            })
                        }
                    >
                        You won&apos;t be able to revert this!
                    </SweetAlert>
                )}
            </>
        );
    }
}

