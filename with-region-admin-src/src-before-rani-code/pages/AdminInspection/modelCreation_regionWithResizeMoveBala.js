import React, { Component, createRef } from 'react'
import urlSocket from "./urlSocket"
import ImageUrl from './imageUrl'
import { 
    Container, CardTitle, Button, Table, Label, Row, Col, CardBody, Modal, Card, Progress, Nav, NavItem, NavLink, TabContent, TabPane, Input, Spinner, FormGroup, ButtonGroup, InputGroup,
    ModalHeader, ModalBody, CardFooter,
    Form,
    ModalFooter
} from 'reactstrap';
import Webcam from "react-webcam";
import "./Css/style.css"
import { v4 as uuidv4 } from 'uuid';
import { Popconfirm, message, Image as Img, Slider, Tooltip, Flex, Spin } from 'antd';
import { ContainerFilled, DeleteTwoTone, DeleteOutlined, CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons';
// import 'antd/dist/antd.css';
import moment from 'moment';
import PropTypes from "prop-types";
import { Link, withRouter } from "react-router-dom";
import Swal from 'sweetalert2';
import { Draggable, Droppable } from 'react-drag-and-drop'
import {JsonTable} from 'react-json-to-html';
import classnames from "classnames"
import { Checkbox } from 'antd';
import { Multiselect } from "multiselect-react-dropdown";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import TrainImages from './adminComponent/TrainImages';
import { FaTrash, FaArrowsAlt, FaExpand, FaEdit, FaTrashAlt, FaSave } from 'react-icons/fa';
import ColorPicker_1 from './colorPicker_1';
import { renderToString } from 'react-dom/server';


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
            rangeValue:0.9,
            img_rotation:false,
            no_of_rotation: 0,
            position:'',
            type:'',

            adding_image: false,

            adding_image: false,
            outline_thres:100,
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
                "Red Outline",
                "Green Outline",
                "Blue Outline",
                "Black Outline",
                "Orange Outline",
                "Yellow Outline",
            ],
            outline_path: '',

            adding_train_image: false,
            show_train_image: false,


            // from this onwards region drawing sections
            region_selection:false,
            imageSrc: null,
            clearCanvasFlag: false,
            cvLoaded: false,
            rectangles: [],
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


            default_testing: 0,
            testing_options: [
                {'option': 0, 'value':'Entire Component'},
                {'option': 1, 'value':'Regions Only'},
                {'option': 2, 'value':'Entire Component with Regions'}
            ],
            overall_testing: true,
            region_wise_testing: false,
            region_testing_required: false,

            zoom: 1, // Initial zoom level

            isPanning: false, // State to track if panning is active
            panStartX: 0, // Initial x position when panning starts
            panStartY: 0, // Initial y position when panning starts

            canvas_width: 640, // initial width
            canvas_height: 480 // initial height
        }

        this.tog_xlarge = this.tog_xlarge.bind(this);
        this.tog_xlarge1 = this.tog_xlarge1.bind(this)

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

    componentDidMount() {
        let compModelInfo = JSON.parse(sessionStorage.getItem('compModelData'));
        let compModelVInfo = JSON.parse(sessionStorage.getItem('compModelVInfo'));
        this.setState({ comp_name: compModelInfo.comp_name, comp_code: compModelInfo.comp_code, model_name: compModelInfo.model_name, position:compModelInfo.position,type:compModelInfo.type,refersh: true })
        this.getModelCreation(compModelVInfo)
        this.getConfigInfo();
        
        this.showRefOutline(compModelInfo, compModelVInfo);

        // Add device change listener
        navigator.mediaDevices.addEventListener('devicechange', this.checkWebcam);
        // Initial check
        this.checkWebcam();

        window.addEventListener('resize', this.updateCanvasSize);
        // Initial size setting
        this.updateCanvasSize();
    }

    // this is for canvas drwaing
    componentDidUpdate(prevProps, prevState) {

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
                // const drawFrame = () => {
                //     ctx.clearRect(0, 0, canvas.width, canvas.height);
                //     ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                //     this.state.rectangles.forEach((rect, index) => {
                //         const isSelected = index === this.state.selectedRectangleIndex;
                //         if (isSelected) {
                //             // Draw double stroke for the selected rectangle
                //             ctx.lineWidth = 4;
                //             ctx.strokeStyle = 'black';
                //             ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

                //             ctx.lineWidth = 2;
                //             ctx.strokeStyle = '#50a5f1';
                //             ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
                //         } else {
                //             ctx.lineWidth = 2;
                //             ctx.strokeStyle = rect.colour;
                //             ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
                //         }
                //         const textPosX = index === this.state.movingRectangleIndex ? rect.x + 25 : rect.x + 10;
                //         ctx.font = 'bold 14px Arial';
                //         ctx.lineWidth = 3;
                //         ctx.strokeStyle = 'black';
                //         ctx.strokeText(rect.name, textPosX, rect.y + 15);
                //         ctx.fillStyle = 'white';
                //         ctx.fillText(rect.name, textPosX, rect.y + 15);

                //         const trashButton = this.trashButtonsRef[index];
                //         if (trashButton) {
                //             trashButton.style.left = `${rect.x + rect.width - 20}px`;
                //             trashButton.style.top = `${rect.y}px`;
                //         }
                //     });
                // };
                //
                if (this.state.showRegion) {
                    this.drawFrame();
                } else {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                }
        }

        // if (prevState.zoom !== this.state.zoom) {
        //     this.updateCanvasSize();
        //     this.drawFrame(); // Redraw after size update
        // }
    }

    componentWillUnmount() {
        // Clear the interval to avoid memory leaks
        clearInterval(this.trainingStatusInterval);

        // Remove device change listener
        navigator.mediaDevices.removeEventListener('devicechange', this.checkWebcam);

        window.removeEventListener('resize', this.updateCanvasSize);
    }
    
    updateCanvasSize = () => {
        if (this.canvasRef.current) {
            this.setState({
                canvas_width: this.canvasRef.current.offsetWidth,
                canvas_height: this.canvasRef.current.offsetHeight
            });
        }
    };

    // updateCanvasSize = () => {
    //     const canvas = this.canvasRef.current;
    //     const container = canvas.parentElement;
        
    //     if (canvas && container) {
    //       canvas.width = container.clientWidth * this.state.zoom;
    //       canvas.height = container.clientHeight * this.state.zoom;
    //     }
    //   };

    drawFrame = () => {
        const canvas = this.canvasRef.current;
        const ctx = canvas.getContext('2d');
        const zoom = this.state.zoom;
        const img = new Image();
        img.src = this.state.imageSrc;
        console.log('**** image ', img.width, img.height);
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

                // //
                // const trashButton = this.trashButtonsRef[index];
                // if (trashButton) {
                //     trashButton.style.left = `${rect.x + rect.width - 20}px`;
                //     trashButton.style.top = `${rect.y}px`;
                // }
                
                // // // Draw the FaTrashAlt icon
                // const iconHtml = renderToString(<FaTrashAlt />);
                // const iconImage = new Image();
                // iconImage.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(iconHtml);
                // iconImage.onload = () => {
                //     ctx.drawImage(iconImage, (rect.x + rect.width - 20) * zoom, rect.y * zoom, 20 * zoom, 20 * zoom);
                // };
                
            });



            // ctx.clearRect(0, 0, canvas.width, canvas.height);
            // ctx.drawImage(img, 0, 0, canvas.width / zoom, canvas.height / zoom); // Adjust image drawing for zoom

            // this.state.rectangles.forEach((rect, index) => {
            //     const isSelected = index === this.state.selectedRectangleIndex;
            //     if (isSelected) {
            //         // Draw double stroke for the selected rectangle
            //         ctx.lineWidth = 4 / zoom;
            //         ctx.strokeStyle = 'black';
            //         ctx.strokeRect(rect.x * zoom, rect.y * zoom, rect.width * zoom, rect.height * zoom);

            //         ctx.lineWidth = 2 / zoom;
            //         ctx.strokeStyle = '#50a5f1';
            //         ctx.strokeRect(rect.x * zoom, rect.y * zoom, rect.width * zoom, rect.height * zoom);
            //     } else {
            //         ctx.lineWidth = 2 / zoom;
            //         ctx.strokeStyle = rect.colour;
            //         ctx.strokeRect(rect.x * zoom, rect.y * zoom, rect.width * zoom, rect.height * zoom);
            //     }

            //     const textPosX = index === this.state.movingRectangleIndex ? rect.x * zoom + 25 : rect.x * zoom + 10;
            //     ctx.font = 'bold 14px Arial';
            //     ctx.lineWidth = 3 / zoom;
            //     ctx.strokeStyle = 'black';
            //     ctx.strokeText(rect.name, textPosX, rect.y * zoom + 15);
            //     ctx.fillStyle = 'white';
            //     ctx.fillText(rect.name, textPosX, rect.y * zoom + 15);

            //     const trashButton = this.trashButtonsRef[index];
            //     if (trashButton) {
            //         trashButton.style.left = `${rect.x * zoom + rect.width * zoom - 20}px`;
            //         trashButton.style.top = `${rect.y * zoom}px`;
            //     }
            // });
        }
    };

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
        this.setState({ webcamLoaded: true})
    }

    showOutline = () => {
        this.setState(prevState => ({
            show_outline: !prevState.show_outline
        }));
    }

    regionSelection = async (e) => {
        
        this.setState({ region_selection: e.target.checked })
        const { compModelVerInfo } = this.state;
        try {
            const response = await urlSocket.post('/region_select', {
                '_id': compModelVerInfo[0]._id, 'region_selection': e.target.checked
            }, { mode: 'no-cors' });
            let data = response.data;
        } catch (error) {
            console.log('error', error)
        }
    }

    imageUrlToBlob = async (imageUrl) => {
        try {
            if (imageUrl !== undefined) {
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                return blob;
            }
        } catch (error) {
            console.log('Error converting image to blob:', error);
        }
    }

    setCanvasBlob = (blob) => {
        if (!this.canvasRef.current) {
            return;
        }
        const canvas = this.canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = blob;
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
    };

    getModelCreation = async (compModelVInfo) => {
        try {
            const response = await urlSocket.post('/getCompModel_ver_info', { 'compModelInfo': compModelVInfo }, { mode: 'no-cors' });
            let default_thres= this.state.rangeValue
            const compModelVerInfo = response.data;

            // Check if regionselection exists
            if (compModelVerInfo.region_selection !== undefined) {
                const image1 = compModelVerInfo.datasets[0];
                const imageurl = this.getImages(image1);
                this.setState({ region_selection: compModelVerInfo.region_selection, imageSrc: imageurl });
            }
            // Check if regionselection is true and rectangles are defined
            if (this.state.region_selection && Array.isArray(compModelVerInfo.rectangles)) {
                // Original and target resolutions
                const originalWidth = 640;
                const originalHeight = 480;
                const targetWidth = 1440;
                const targetHeight = 1080;

                // Calculate scaling factors
                const scaleX = targetWidth / originalWidth;
                const scaleY = targetHeight / originalHeight;

                const retrievedRectangles = compModelVerInfo.rectangles.map((rect) => ({
                    x: rect.coordinates.x / scaleX,
                    y: rect.coordinates.y / scaleY,
                    height: rect.coordinates.height / scaleX,
                    width: rect.coordinates.width / scaleY,
                    id: rect.id,
                    name: rect.name,
                    colour: rect.colour
                }));
                console.log('calleddddddddddddddddddddddddd', compModelVerInfo.rectangles)
                const image1 = compModelVerInfo.datasets[0];
                const imageurl = this.getImages(image1);

                try {
                    // const blob = await this.imageUrlToBlob(imageurl);
                    this.setState({ imageSrc: imageurl, rectangles: retrievedRectangles }
                        // , () => {
                        // this.setCanvasBlob(blob); // Pass the blob here to set on canvas
                        // if (this.canvasRef.current) {
                        //     // Perform any canvas operations if needed
                        // }}
                    );
                } catch (error) {
                    console.log('Error converting image to blob:', error);
                    // Handle error state or recovery logic here
                }
            }

            const myArray = [];
            myArray.push(compModelVerInfo)
            const show_train_image = compModelVerInfo?.sift_train_datasets?.length > 0 ? true : false;
            
            if (compModelVerInfo.thres === undefined){
                console.log('if part works',default_thres)
                this.setState({ compModelVerInfo:myArray, refersh: true, show_train_image: show_train_image,rangeValue:default_thres})
            }
            else{
                this.setState({ compModelVerInfo:myArray, refersh: true, show_train_image: show_train_image,rangeValue:compModelVerInfo.thres  })
            }

            if (compModelVerInfo.training_status === 'training_in_progress') {              
                this.setState({ showTrainingINProgs: true });
                // 
                // // this.fetchTrainingStatus(this.state.compModelVerInfo[0])
                // this.trainingStatusInterval = setInterval(() => this.fetchTrainingStatus(this.state.compModelVerInfo[0]), 5000);
            }
            else if (compModelVerInfo.training_status === 'admin accuracy testing in_progress')   {                
                this.setState({ addAccTestInProg: true})
                this.fetchTrainingStatus(this.state.compModelVerInfo[0]);
            }
            else if(compModelVerInfo.training_status === 'retrain') {
                this.setState({ showRetrain: true})
            }

            if( compModelVerInfo.training_status === 'training_in_progress' || compModelVerInfo.training_status === 'retrain') {
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

    getConfigInfo = async () => {
        try {
            const response = await urlSocket.post('/config', { mode: 'no-cors' });
            const config = response.data;
            this.setState({ config, positive: config[0].positive, negative: config[0].negative, })
            this.getOK(config[0].positive, 0, '1')
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

        if(isNaN(no_of_rotation)) {
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

            const imageSrc = this.webcam.getScreenshot({ width: 1440, height: 1080 });

            if (!imageSrc) {
                console.log('data345 ')
                this.setState({ imageSrcNone: true, adding_image: false });
                return;
            }
            this.setState({ imageSrc: imageSrc });
            const blob = this.dataURLtoBlob(imageSrc);
            const formData = new FormData();
            let imgUuid = uuidv4();
            formData.append('_id', compModelVerInfo[0]._id);
            // formData.append('comp_name', compModelVerInfo[0].comp_name);
            // formData.append('comp_code', compModelVerInfo[0].comp_code);
            // formData.append('comp_id', compModelVerInfo[0].comp_id);
            // formData.append('model_name', compModelVerInfo[0].model_name);
            // formData.append('model_id', compModelVerInfo[0].model_id);
            // formData.append('model_ver', compModelVerInfo[0].model_ver);
            formData.append('labelName', labelName);
            formData.append('image_rotation', this.state.no_of_rotation);
            // formData.append('regionselection',this.state.regionselection);
            formData.append('imgName', blob, imgUuid + '.png');
            // formData.append('type',compModelVerInfo[0].type);
            // formData.append('position',compModelVerInfo[0].position);

            try {
                const response = await urlSocket.post('/addImage', formData, {
                    headers: {
                        'content-type': 'multipart/form-data'
                    },
                    mode: 'no-cors'
                });
                let getInfo = response.data;
                
                if(response.data.comp_model_ver_info_list[0].region_selection !== undefined) {
                    const image1 = response.data.comp_model_ver_info_list[0].datasets[0];
                    const imageurl = this.getImages(image1);
                    this.setState({ region_selection: response.data.comp_model_ver_info_list[0].region_selection, imageSrc: imageurl });
                }

                if (getInfo.message === 'Image successfully added') {
                    this.setState({
                        response_message: getInfo.message,
                        compModelVerInfo: getInfo.comp_model_ver_info_list,
                        refersh: true,
                        images_length: getInfo.img_count,
                        adding_image: false,
                        rectangles:[],
                    });
                    if (this.state.region_selection){
                        // console.log('inside the if statement')
                        // this.tog_xlarge1()
                    }
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

    // start --> add sift train images here
    captureTrainImage = async (labelName) => {
        const { compModelVerInfo } = this.state;
        const sift_train_img = true;
        this.setState({ adding_train_image: true, show_train_image: true })

        const imageSrc = this.webcam.getScreenshot({ width: 1440, height: 1080 });

        if (!imageSrc) {
            this.setState({ imageSrcNone: true, adding_train_image: false });
            return;
        }
        const blob = this.dataURLtoBlob(imageSrc);
        const formData = new FormData();
        let imgUuid = uuidv4();
        formData.append('_id', compModelVerInfo[0]._id);
        formData.append('labelName', labelName);
        formData.append('imgName', blob, imgUuid + '.png');
        formData.append('image_rotation', this.state.no_of_rotation);

        try {
            const response = await urlSocket.post('api1/add_train_image', formData, {
                headers: {
                    'content-type': 'multipart/form-data'
                },
                mode: 'no-cors'
            });
            let getInfo = response.data;

            if (getInfo.message === 'Image successfully added') {
                this.setState({
                    response_message: getInfo.message,
                    compModelVerInfo: getInfo.comp_model_ver_info_list,
                    refersh: true,
                    images_length: getInfo.img_count,
                    adding_train_image: false
                });
            }
            else {
                this.setState({
                    response_message: getInfo.message,
                    adding_train_image: false
                })
            }
            this.imgGlry()
            setTimeout(() => {
                this.setState({ response_message: "" });
            }, 1000);
        } catch (error) {
            console.log('error', error);
        }
    };

    siftImagesTrain = async (version_data) => {
        try {
            const response = await urlSocket.post('api1/train_sift_images', {
                'version_id': version_data._id,
            }, { mode: 'no-cors' });
            const updated_version = response.data;
            
            this.setState({ compModelVerInfo: [updated_version], rangeValue: updated_version.thres});
        } catch (error) {
            console.log('Error Info: ', error)
        }
    }
    // ends here..

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
        this.setState({ compModelVerInfo: updatedCompModelVerInfo, refersh: true,});
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

            if( updatedCompModelVerInfo[0].training_status === 'training_in_progress' ) {
                this.setState({ showTrainingINProgs: true})
            }
            else if( updatedCompModelVerInfo[0].training_status === 'retrain' ) {
                this.setState({ showRetrain: true})
            }
        } catch (error) {
            console.log('Error fetching training status:', error);
        }
    }

    // 04-07-24

    adminAccTest = async (data, model) => {
        if (model && model == 'sift') {
            let count = this.state.initvalue
            let compModelverInfo = {
                config: this.state.config,
                testCompModelVerInfo: data,
                batch_no: count++,
                page: 'modelcreation'
            }
            this.setState({ ask_type_of_testing: true, data_to_testing_page: compModelverInfo })
        } else {
            let count = this.state.initvalue
            let compModelverInfo = {
                config: this.state.config,
                testCompModelVerInfo: data,
                batch_no: count++,
                page: 'modelcreation'
            }
            // Save the data to localStorage
            sessionStorage.removeItem("modelData")
            localStorage.setItem('modelData', JSON.stringify(compModelverInfo));
        }
    }

    closeTestingAskWindow = () => {
        this.setState(prevState => ({
            ask_type_of_testing: (!prevState.ask_type_of_testing)
        }))
    }
    
    changeTestingMode = (e) => {
        this.setState({default_testing: e.target.value})
    }

    continueTesting = () => {
        const { 
            default_testing, testing_options, data_to_testing_page,
            overall_testing, region_wise_testing
         } = this.state;
        let values = {...data_to_testing_page};
        let option = '';
        if (!overall_testing && !region_wise_testing) {
            this.setState({ region_testing_required: true });
        } else {
            if (overall_testing && region_wise_testing) {
                option = 'Entire Component with Regions';
            } else if (overall_testing && !region_wise_testing) {
                option = 'Entire Component';
            } else if (region_wise_testing && !overall_testing) {
                option = 'Regions Only';
            }
            // values.option = testing_options.find(option => option.option == default_testing).value;
            values.option = option;
            values.overall_testing = overall_testing;
            values.region_wise_testing = region_wise_testing;

            sessionStorage.removeItem("modelData")
            localStorage.setItem('modelData', JSON.stringify(values));

            this.props.history.push('/adminAccTesting');
        }
        
    }

    overallTest = (e) => {
        this.setState({ overall_testing: e.target.checked });
    }
    region_wiseTest = (e) => {
        this.setState({ region_wise_testing: e.target.checked });
    }

    // 04-07-24

    // Define the method to handle making the model live
    makeModelLive = async (data, index) => {
        try {
            const response = await urlSocket.post('/model_live', { 'modelData': data }, { mode: 'no-cors' });
            const modelLive = response.data;
            this.setState({ compModelVerInfo: modelLive });
            // Perform any additional actions needed when the model is made live
        } catch (error) {
            console.log('Error making model live:', error);
        }
    }

    // bala changed it on 06/10/23
    activateModel = async (data, index) => {
        try {
            const response = await urlSocket.post('/model_activate', { 'modelData': data }, { mode: 'no-cors' });
            const modelLive = response.data;
            if (modelLive ==="Another Live"){
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
            else{
            this.setState({ compModelVerInfo: modelLive });
            }
            // Perform any additional actions needed when the model is deactivated
        } catch (error) {
            console.log('Error deactivating model:', error);
        }
    }

    activateModel_approv =async(data, index)=>{
        try {
            const response = await urlSocket.post('/model_approv_activate', { 'modelData': data }, { mode: 'no-cors' });
            const modelLive = response.data;
            this.setState({ compModelVerList: modelLive });

            // Perform any additional actions needed when the model is deactivated
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
            const response = await urlSocket.post('/model_deactivate', { 'modelData': data }, { mode: 'no-cors' });
            const modelLive = response.data;
            this.setState({ compModelVerInfo: modelLive });
            // Perform any additional actions needed when the model is deactivated
        } catch (error) {
            console.log('Error deactivating model:', error);
        }
    }

    //  end upto this
    back = () => {
        this.props.history.push("/modelVerInfo")
    }

    live_check = async (data, index) => {
        try {
            const response = await urlSocket.post('/make_live_check', { modelData: data }, { mode: 'no-cors' });
            const data1 = response.data;
    
            if (data1 === 'another live') {
                this.make_live(data);
            } else {
                this.makeModelLive(data);
            }
        } catch (error) {
            console.log("----", error);
        }
    };
    
    make_live = (data) => {
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
            allowEnterKey:false,
        }).then((result) => {
            if (result.isConfirmed) {
                this.makeModelLive(data)
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

    onDrop = async (data) => {
        const droppedData = JSON.parse(data.dragdrop);
        const { compModelVerInfo, selectedList } = this.state;

        try {
            const response = await urlSocket.post('/dragImg', {'compModelInfo': compModelVerInfo[0],'drgImg': droppedData},{ mode: 'no-cors' });
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

    tog_xlarge1 = () => {
        this.setState(prevState => ({
            modal_xlarge1: !prevState.modal_xlarge1,
        }),()=>{
            setTimeout(() => {
                if (this.canvasRef.current) {
                    this.handleMouseDown()
                }
            }, 100);              
        });
        this.removeBodyCss();
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
            if(img.filename === e.target.name) {
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
        if(selectedList.length === 0) {
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
        if(img_path) {
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
        if(img_path) {
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
            formData.append('type',this.state.type);
            formData.append('position',this.state.position);

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

            if(item.imagePathType[idxVal].type === img_label) {
                std_img_paths.push(imgName);
            }
        })

        this.setState({
            selectedImages: updatedSelectedImages,
            img_paths: std_img_paths
        })
    }


    // for image rotation in version wise integrated on 24/01/24

    similarityChange =async (value) =>{
        this.setState({rangeValue:value})
        const { compModelVerInfo } = this.state;
        try{
            const response = await  urlSocket.post('/threshold_changes', { 'comp_name': compModelVerInfo[0].comp_name, 'comp_code': compModelVerInfo[0].comp_code,'model_name':compModelVerInfo[0].model_name,'model_ver':compModelVerInfo[0].model_ver,'thres':value }, { mode: 'no-cors' });
            
            this.setState({compModelVerInfo:response.data})

        }catch (error) {
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

    onoutline_change = async (value) => {
        const { compModelVerInfo } = this.state
        let path = compModelVerInfo[0].datasets[0].image_path
        path = path.substring(0, path.lastIndexOf("/"));
        
        let filename = compModelVerInfo[0].datasets[0].filename
        let [file] = filename.split('.')
        try {
            const response = await urlSocket.post('/outline_changes', { 'path': path, 'filename': file, 'outline': value, 'id': compModelVerInfo[0]._id }, { mode: 'no-cors' });
            
            let getInfo = response.data
            
            this.setState({
                compModelVerInfo: getInfo.comp_model_ver_info_list,
                refersh: true,
            })
        } catch (error) {
            console.log('error1266', error)
        }
        this.setState({ outline_thres: value })
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

    outlinechanges = (e) => {
        
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

    setVersionData = (value) => {
        const show_train_image = value?.sift_train_datasets?.length > 0 ? true : false;
        this.setState({compModelVerInfo: [value], show_train_image: show_train_image})
    }

    changeShowTrainImages = (data) => {
        const value = data === 0 ? false : true;
        this.setState({ show_train_image: value })
    }

    // Region Selection starts here...

    handleMouseDown = (e) => {
        
        const canvas = this.canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const zoom = this.state.zoom;
        
        // Calculate scale factors
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let x, y;

        // if(zoom == 1) {
        //     x = ((e?.clientX - rect.left) * scaleX) / zoom;
        //     y = ((e?.clientY - rect.top) * scaleY) / zoom;
        // } else {
        //     console.log('handleMouseDown --------->  Else')   
        //     x = (e?.clientX - rect.left) * scaleX;
        //     y = (e?.clientY - rect.top) * scaleY;
        // }

        if (e?.type === 'mousedown') {
            if (zoom == 1) {
                x = ((e.clientX - rect.left) * scaleX) / zoom;
                y = ((e.clientY - rect.top) * scaleY) / zoom;
            } else {
                console.log('handleMouseDown ---------> Else (mousedown)');
                x = (e.clientX - rect.left) * scaleX;
                y = (e.clientY - rect.top) * scaleY;
            }
        } else if (e?.type === 'touchstart') {
            if (zoom == 1) {
                x = ((e.touches[0].clientX - rect.left) * scaleX) / zoom;
                y = ((e.touches[0].clientY - rect.top) * scaleY) / zoom;
            } else {
                console.log('handleMouseDown ---------> Else (touchstart)');
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
                if (width < 30 && height < 30) {
                    
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
                            i = i+1;
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
        const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, ''); // Remove any characters that are not alphanumeric
        this.setState({
            inputRectangleName: sanitizedValue,
            existRectangleNameError: false
        });
    }

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
                    editingRectangleIndex: null
                };
            });
        }
    }


    sendCoordinates = async () => {
        const {
            compModelVerInfo, activeGroupData, no_of_rotation
        } = this.state;

        const filterDuplicates = (nestedRectangles) => {

            const uniqueRectangles = [];
            const seenCoordinates = new Set();
            return uniqueRectangles;
        };

        const { rectangles, imageId } = this.state;

        if (!rectangles || rectangles.length === 0) {
            console.warn('No rectangles to send');
            return;
        }


        // const rectsData = rectangles.map(rect => ({
        //     id: rect.id,
        //     name: rect.name,
        //     coordinates: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        //     colour: rect.colour,
        //     // nestedRectangles: filterDuplicates(rect.nestedRectangles.map(nestedRect => ({
        //     //     id: nestedRect.id,
        //     //     name: nestedRect.name,
        //     //     coordinates: { x: nestedRect.x, y: nestedRect.y, width: nestedRect.width, height: nestedRect.height }
        //     // })))
        // }));

        // console.log('**** rectsData ', rectsData);

        // Original and target resolutions
        const originalWidth = 640;
        const originalHeight = 480;
        const targetWidth = 1440;
        const targetHeight = 1080;

        // Calculate scaling factors
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
            // const dataURL = canvas.toDataURL('image/png');
            // if (!canvas) {
            //     throw new Error('Canvas not found');
            // }

            // const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            // if (!blob) {
            //     throw new Error('Failed to create image blob');
            // }

            const formData = new FormData();
            formData.append('_id', compModelVerInfo[0]._id);
            // formData.append('canvas', dataURL);
            // formData.append('image', blob, 'captured_image.png');
            formData.append('rectangles', JSON.stringify(rectsData));
            // formData.append('image_id', imageId); // Add image_id to the form data

            const response = await urlSocket.post('/rectangles', formData, {
                headers: {
                    'content-type': 'multipart/form-data'
                },
                mode: 'no-cors'
            });

            
            if (response.data.success === true) {
                Swal.fire({
                    title: 'Success',
                    text: 'Selected Coordinates saved',
                    icon: 'success',
                    confirmButtonText: 'OK'
                })
            }

            // if (response.ok) {
            //     const responseData = await response.json();
            //     console.log('Coordinates and image sent successfully:', responseData);
            // } else {
            //     console.error('Error sending coordinates and image:', response.statusText);
            // }
        } catch (error) {
            console.error('Error sending coordinates and image:', error.message);
        }
    };


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
    };

    editSelectedRectangle = (clickedIndex) => {
        this.setState({
            editingRectangleIndex: clickedIndex,
            inputRectangleName: this.state.rectangles[clickedIndex].name
        });
    }

    resizeSelectedRectangle = (clickedIndex) => {
        this.setState({ resizingRectangleIndex: clickedIndex });
    };

    moveSelectedRectangle = (clickedIndex) => {
        this.setState({ movingRectangleIndex: clickedIndex });
    };

    handleRectangle = (clickedIndex) => {
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

        // const offsetX = e.clientX - rect.left;
        // const offsetY = e.clientY - rect.top;


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

            // const moveX = moveEvent.clientX - rect.left;
            // const moveY = moveEvent.clientY - rect.top;

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
        // const offsetX = e.clientX - rect.left;
        // const offsetY = e.clientY - rect.top;
        
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

            // const moveX = moveEvent.clientX - rect.left;
            // const moveY = moveEvent.clientY - rect.top;

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
        }))
    }

    // 

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
        console.log('hello from scroll')
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

    render() {
        const { 
            compModelVerInfo, positive, negative, selectFilter, 
            showCamera, showLabelName, reqImgCount, lable_name, 
            webcamEnabled, imageSrcNone, config, showTrainingINProgs, 
            refersh, imgGlr, showGallery, log_data, 
            newGallery, galleryImages,activeTab, customActiveTab,
            uniqueModelVersions, groupedData, activeGroupData,
            showRetrain, addAccTestInProg, selectedImages,
            imageSrc, 
            rectangles, selectedRectangleIndex, resizingRectangleIndex, movingRectangleIndex, rectNameInput, nestedRectNameInput,
            editingRectangleIndex, modal_xlarge1
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
            height: 1080, width: 1440,
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
                    <Container fluid={true} style={{ 
                        // minHeight: '100vh', 
                        background: 'white', 
                        // userSelect: 'none' 
                    }}
                    >
                        <div>
                            <Button className='mt-2' onClick={() => this.back()}>Back</Button>
                            <CardTitle className="text-center" style={{ fontSize: 22, marginTop: '-31px' }}> MODEL CREATION</CardTitle>
                        </div>
                        <div className='mt-5'>
                            <Label style ={{ fontSize: '18px', fontWeight: 'bold'}}>
                                Component Name: {this.state.comp_name} , Component Code: {this.state.comp_code} , Model Name: {this.state.model_name}
                            </Label>
                            <Row>
                                <Col lg={6} >
                                    <Label style={{ fontWeight: 'bold' }}>Similarity Adjustment </Label>
                                    <Slider
                                        min={0.00}
                                        max={1.00}
                                        step={0.01}
                                        value={this.state.rangeValue}
                                        tooltip={{
                                            open: true, 
                                            placement: 'top', 
                                            overlayStyle: { zIndex: 1000},
                                        }}
                                        onChange={this.similarityChange}
                                        marks={marks}
                                    />
                                </Col>
                                {/* Image Rotation */}
                                {
                                    // this.state.activeTab !== '2' && 
                                    // this.state.position !== 'Fixed' && 
                                    // this.state.type !== 'ML' &&
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
                                {
                                    compModelVerInfo[0] && compModelVerInfo[0].model_name === "SIFT" && compModelVerInfo[0].sift_count_avg &&
                                    <Col lg={3}>
                                        {/* SIFT range table */}
                                        {/* <Table bordered className="mt-3">
                                            <tbody>
                                                <tr className="bg-light">
                                                    <td className="font-weight-bold">Similarity Value</td>
                                                    <td>{parseInt(this.state.rangeValue * 100)}%</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-weight-bold">SIFT Matching Points</td>
                                                    <td>{parseInt(compModelVerInfo[0].sift_count_avg)}</td>
                                                </tr>
                                                <tr className="bg-light">
                                                    <td className="font-weight-bold">{config[0]?.positive} Range</td>
                                                    <td>{`${parseInt(((compModelVerInfo[0].thres * 100) * (compModelVerInfo[0].sift_count_avg / 100)))} - ${parseInt((compModelVerInfo[0].sift_count_avg))}`}</td>
                                                </tr>
                                                <tr>
                                                    <td className="font-weight-bold">{config[0]?.negative} Range</td>
                                                    <td>{`0 - ${parseInt(((compModelVerInfo[0].thres * 100) * (compModelVerInfo[0].sift_count_avg / 100)) - 1)}`}</td>
                                                </tr>
                                            </tbody>
                                        </Table> */}
                                    </Col>
                                }
                            </Row>
                        </div>
                        {/* version data in Table */}
                        {
                            refersh ?
                                <div className='table-responsive mt-4'>
                                    <Table striped>
                                        <thead>
                                            <tr>
                                                <th>Model Version</th>
                                                <th>Model Status</th>
                                                <th>Created on</th>
                                                <th>Approved on</th>
                                                <th>Live on</th>
                                                <th>Action</th>
                                                <th>Log</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {compModelVerInfo.map((data, index) => {
                                                 let okCount = [];
                                                 let notokCount = [];
                                                if (data.type === 'DL'){
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
                                                const isDl = data.type !== 'ML' ;
                                                return (
                                                    <tr key={index} id='recent-list'>
                                                        <td>{'V'}{data.model_ver}</td>
                                                        <td>{data.model_status}</td>
                                                        <td>{data.created_on}</td>
                                                        <td>{data.approved_on}</td>
                                                        <td>{data.live_on}</td>
                                                        <td style={{ fontSize: '18px' }}>

                                                            {isInactive && (
                                                                <Button style={{ backgroundColor: 'green', color: 'white' }} onClick={() => this.activateModel(data, index)}>
                                                                    Activate
                                                                </Button>
                                                            )}
                                                            {
                                                                !(data.type === 'ML') &&
                                                                !showTrainingINProgs && !isInactive && !isTrainingInProgress && (
                                                                    isTrainingCompleted ? (
                                                                        <Link to='/adminAccTesting'>
                                                                            <Button style={{ backgroundColor: 'green', color: 'white' }} onClick={() => this.adminAccTest(data)}>
                                                                                Start Admin Accuracy Test
                                                                            </Button>{' '}
                                                                        </Link>
                                                                    ) : (
                                                                        !isTrainingInProgress && isTrainingNotStarted && okCount >= Number(config[0]?.min_ok_for_training) && notokCount >= Number(config[0]?.min_notok_for_training) && (
                                                                            <Button style={{ backgroundColor: 'blue', color: 'white' }} onClick={() => this.train(data)}>
                                                                                Train
                                                                            </Button>
                                                                        )
                                                                    )
                                                                )} {' '}
                                                            {
                                                                data.type === 'ML' && data.datasets.length !== 0 &&
                                                                // data.position === 'Fixed' && data.type === 'ML' && data.datasets.length !== 0 &&
                                                                (
                                                                    <React.Fragment>
                                                                        {data.model_name === 'SIFT' ? (
                                                                            (isTrainingCompleted ? (
                                                                                <Button 
                                                                                    className='me-2' 
                                                                                    style={{ backgroundColor: 'green', color: 'white' }} 
                                                                                    onClick={() => this.adminAccTest(data, 'sift')}
                                                                                >
                                                                                    Start Admin Accuracy Test
                                                                                </Button>
                                                                            ) :
                                                                            <>
                                                                            {
                                                                                isApprovedTrainedModel ? null :
                                                                                <Button className='me-2' color='primary' onClick={() => this.siftImagesTrain(data)}>Train</Button>
                                                                            }
                                                                            </>
                                                                            )
                                                                        ) : <Link to='/adminAccTesting'>
                                                                            <Button style={{ backgroundColor: 'green', color: 'white' }} onClick={() => this.adminAccTest(data)}>
                                                                                Start Admin Accuracy Test
                                                                            </Button>
                                                                        </Link>
                                                                        }
                                                                    </React.Fragment>
                                                                )
                                                            }

                                                            {!isTrainingInProgress && !isAdminAccuracyInProgress && !isInactive && !isRetrain && !showTrainingINProgs && (
                                                                <Button style={{ backgroundColor: 'red', color: 'white' }} onClick={() => this.deactivate(data, index)}>
                                                                    Deactivate
                                                                </Button>
                                                            )} {' '}

                                                            {isAdminAccuracyInProgress && !showTrainingINProgs && !isTrainingInProgress &&(
                                                                <div>
                                                                    <p>Admin Accuracy Testing In_Progress</p>
                                                                    <Link to='/adminAccTesting'>
                                                                        <Button style={{ backgroundColor: 'green', color: 'white' }} onClick={() => this.adminAccTest(data)}>
                                                                            Continue
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                            )}

                                                            {showTrainingINProgs && (
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
                                                            )}
                                                            {
                                                                isRetrain &&
                                                                <div>
                                                                    <Row>
                                                                        <Progress
                                                                            multi
                                                                            style={{
                                                                                height: '17px',
                                                                                fontWeight: 'bold'
                                                                            }}
                                                                        >
                                                                            <Progress
                                                                                bar
                                                                                color="primary"
                                                                                value={100}
                                                                                animated
                                                                            >
                                                                                Training In Queue
                                                                            </Progress>
                                                                        </Progress>
                                                                    </Row>
                                                                </div>
                                                            }
                                                        </td>
                                                        <td><Button onClick={() => this.tog_xlarge()} className="btn btn-primary" data-toggle="modal" data-target=".bs-example-modal-xl">Log</Button></td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </Table>
                                </div> : null
                        }

                        {/* Log Info */}
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
                                    </Nav>):(
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

                                                            {this.state.type !== 'ML' && imgGlr && imgGlr.length > 1 && (
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
                                                {this.state.type !== 'ML' && imgGlr && imgGlr.length > 1 && (
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
                            <div style={{userSelect: 'none'}}>
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
                                                    <div>
                                                        
                                                    </div>
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
                                                                    <Col>
                                                                        <Checkbox
                                                                            type="checkbox"
                                                                            checked={this.state.region_selection}
                                                                            onChange={(e) => this.regionSelection(e)}
                                                                        >Region Selection</Checkbox>
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
                                                                </Col>
                                                                <Col>
                                                                    {
                                                                        // this.state.model_name === 'SIFT' && 
                                                                        compModelVerInfo[0]?.datasets[0]?.image_path &&
                                                                        this.state.region_selection &&
                                                                        <Button className='my-auto' onClick={(e) => { this.tog_xlarge1(e) }} color='info'>Re-Draw or view Region</Button>
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
                                                                                    height: 'auto'
                                                                                }}
                                                                                src={`${ImageUrl + this.state.outline_path}?${Date.now()}`}
                                                                                // src={`${ImageUrl + this.state.comp_info.datasets.white_path}?${Date.now()}`}
                                                                            ></img> : null
                                                                    }
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
                                                        )}
                                                    </div>
                                                    <div>
                                                        {
                                                            this.state.adding_image && this.state.webcamLoaded ?
                                                                <Button color='info' style={{ whiteSpace: 'pre' }} disabled>
                                                                    Adding Images...  <Spin spinning={true}></Spin>
                                                                </Button>
                                                                : 
                                                                (webcamEnabled && this.state.cameraDisconnected === false) &&
                                                                <Button color='primary' onClick={() => this.captureImage(lable_name)}>Add Image</Button>
                                                        }
                                                        {
                                                            this.state.adding_train_image &&
                                                            <Button className='ms-3' color='info' style={{ whiteSpace: 'pre' }} disabled>
                                                                Adding Train Image...  <Spin spinning={true}></Spin>
                                                            </Button>
                                                        }
                                                        {
                                                            this.state.model_name === 'SIFT' &&
                                                            (!this.state.adding_image) && (!this.state.adding_train_image) && this.state.webcamLoaded && this.state.images_length == 1 &&
                                                            <Button className='ms-3' color='info' onClick={() => this.captureTrainImage(lable_name)}>Add Train Image</Button>
                                                        }
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
                                                                                <Button color='danger' onClick={() => this.handleDeleteSelectedImages()}>
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
                                                                                                        <Img src={this.getImages(item.imagePathType[item.used_model_ver.indexOf(parseInt(version))])} alt='Image not there' />
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
                                                this.state.model_name === 'SIFT' &&
                                                <div className='d-flex'>
                                                    <ButtonGroup className='me-3 my-2'>
                                                        <Button color='success' 
                                                            onClick={() => this.changeShowTrainImages(0)}
                                                        >Reference Image</Button>
                                                        <Button className='mx-2' color='info' 
                                                            onClick={() => this.changeShowTrainImages(1)}
                                                        >Sift Train Images</Button>
                                                    </ButtonGroup>
                                                </div>
                                            }
                                            {
                                                this.state.type === 'ML' &&
                                                (

                                                    this.state.show_train_image === true ?
                                                    <TrainImages versionData={compModelVerInfo[0]} setVersionData={(e) => this.setVersionData(e)}/>
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
                                                                            this.state.model_name === 'SIFT' &&
                                                                            ((compModelVerInfo[0]?.sift_train_datasets?.length === 0) || !compModelVerInfo[0]?.sift_train_datasets) &&
                                                                            <Col sm={12} md={12} lg={12} className='d-flex justify-content-end my-2'>
                                                                            <Button color='danger' onClick={() => this.handleDeleteSelectedImages(this.state.compModelVerInfo[0].datasets[0].image_path)}>
                                                                                Delete
                                                                            </Button>
                                                                        </Col>
                                                                        }
                                                                        {
                                                                            compModelVerInfo[0]?.model_name !== 'SIFT' &&
                                                                                <Col sm={12} md={12} lg={12} className='d-flex justify-content-end my-2'>
                                                                                    <Button color='danger' onClick={() => this.handleDeleteSelectedImages(this.state.compModelVerInfo[0].datasets[0].image_path)}>
                                                                                        Delete
                                                                                    </Button>
                                                                                </Col>
                                                                        }
                                                                        
                                                                        <Col sm={6} md={6} lg={6}>
                                                                            <Card className='mt-2' style={{ position: 'relative', backgroundColor: '#f0f0f0', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '2px solid #ddd' }}>
                                                                                <CardTitle className='my-2' style={{ color: '#333', borderBottom: '2px solid #ddd', padding: '0.5rem 1rem' }}>Reference Image</CardTitle>
                                                                                <CardBody>
                                                                                    <Img src={this.getImages({ ...compModelVerInfo[0].datasets[0], image_path: compModelVerInfo[0].datasets[0].image_path })} alt='Image not there' />
                                                                                </CardBody>
                                                                            </Card>
                                                                            {/* {this.state.model_name === 'SIFT' && this.state.region_selection &&
                                                                                <Button onClick={(e) => { this.tog_xlarge1(e) }}>Re-Draw or view Region</Button>
                                                                            } */}
                                                                        </Col>
                                                                    </>
                                                            }
                                                        </Row>
                                                    </>
                                                )
                                            }
                                            {/* {
                                                // this.state.model_name === 'SIFT' && 
                                                this.state.region_selection &&
                                                <Button onClick={(e) => { this.tog_xlarge1(e) }}>Re-Draw or view Region</Button>
                                            } */}
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
                                                
                                            {/* ) : (
                                                
                                            )
                                            } */}
                                        </Col>

                                    </Row>
                                ) : null}
                            </div>
                            {/* Region Selection */}
                            {modal_xlarge1&&
                                <Modal size="xl" isOpen={modal_xlarge1} toggle={this.tog_xlarge1} scrollable={true} 
                                    // style={{maxWidth:'90%'}} 
                                    fullscreen
                                >
                                    <ModalHeader toggle={this.tog_xlarge1}>
                                        <div>
                                            Component Name: {this.state.comp_name} , Component Code: {this.state.comp_code}
                                        </div>
                                    </ModalHeader>
                                    <ModalBody>
                                        <Row>
                                            <Col>
                                                <Card className='mt-2' style={{ position: 'relative', top: '0', zIndex: '1000', backgroundColor: '#f0f0f0', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '2px solid #ddd', flex: '1' }}>
                                                    <CardTitle className='my-2 text-center' style={{ color: '#333', borderBottom: '2px solid #ddd', padding: '0.5rem 1rem' }}>Region Selection</CardTitle>
                                                    <CardBody className='mb-2' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100, borderRadius: '10px' }}>
                                                        {
                                                            imageSrc && (
                                                                <div className='d-flex flex-column'>
                                                                    <div 
                                                                        ref={this.parentDivRef}
                                                                        className='d-flex'
                                                                        style={{ 
                                                                            // width: '100%', height: 'auto', 
                                                                            overflow: 'scroll' }}
                                                                            // onMouseDown={this.scrollMouseDown}
                                                                            // onMouseMove={this.scrollMouseMove}
                                                                            // onMouseUp={this.scrollMouseUp}
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
                                                                                onMouseDown={this.state.showRegion ? this.handleMouseDown : null}
                                                                                onMouseMove={this.state.showRegion ? this.handleMouseMove : null}
                                                                                onMouseUp={this.state.showRegion ? this.handleMouseUp : null}
                                                                                onTouchStart={this.state.showRegion ? this.handleMouseDown : null}
                                                                                onTouchMove={this.state.showRegion ? this.handleMouseMove : null}
                                                                                onTouchEnd={this.state.showRegion ? this.handleMouseUp : null}
                                                                                
                                                                                style={{
                                                                                    borderRadius: '10px',
                                                                                    width: '100%', height: 'auto'
                                                                                }}
                                                                            />
                                                                            {rectangles.map((rect, index) => {
                                                                                // Get the actual size of the canvas
                                                                                const canvas = this.canvasRef.current;
                                                                                if(canvas?.getBoundingClientRect()) {
                                                                                    const canvasRect = canvas?.getBoundingClientRect();
                                                                                    const canvasWidth = canvasRect.width;
                                                                                    const canvasHeight = canvasRect.height;

                                                                                    const buttonSize = (canvasWidth * 640) / 100;// (20 / 640) * canvasWidth;

                                                                                    const baseSize = 20; // Base size in pixels
                                                                                    const handleSize = (18 / canvasWidth) * 100;
                                                                                    const handleSizeW = 16 * (this.state.canvas_width / 640);
                                                                                    const resizeW = 18 * (this.state.canvas_width / 640);
                                                                                    const resizeH = 18 * (this.state.canvas_height / 480);
                                                                                    const movingW = 20 * (this.state.canvas_width / 640);
                                                                                    const movingH = 20 * (this.state.canvas_height / 480);
                                                                                    return (
                                                                                        <React.Fragment key={index}>
                                                                                            {
                                                                                                this.state.showRegion &&
                                                                                                <button
                                                                                                    ref={el => (this.trashButtonsRef[index] = el)}
                                                                                                    onClick={() => this.deleteSelectedRectangle(index)}
                                                                                                    style={{
                                                                                                        position: 'absolute',
                                                                                                        left: `${(rect.x + rect.width - handleSizeW) / 640 * 100}%`,     // rect.x + rect.width - 20,
                                                                                                        top: `${(rect.y) / 480 * 100}%`,                        // rect.y,
                                                                                                        background: 'none',
                                                                                                        border: 'none',
                                                                                                        cursor: 'pointer',
                                                                                                        fontSize: `${handleSizeW}px`,          // '16px',
                                                                                                        color: 'red',
                                                                                                        transform: 'translate(-50%, 0%)'
                                                                                                    }}
                                                                                                >
                                                                                                    <FaTrashAlt />
                                                                                                </button>
                                                                                            }
                                                                                            {selectedRectangleIndex === index && resizingRectangleIndex === index && (
                                                                                                <div
                                                                                                    style={{
                                                                                                        position: 'absolute',
                                                                                                        // left: rect.x + rect.width - 20,
                                                                                                        // top: rect.y + rect.height - 20,
                                                                                                        left: `${(rect.x + rect.width) / 640 * 100}%`, // Convert to percentage
                                                                                                        top: `${(rect.y + rect.height) / 480 * 100}%`, // Convert to percentage
                                                                                                        width: `${resizeW}px`,
                                                                                                        height: `${resizeH}px`,
                                                                                                        background: 'white',
                                                                                                        cursor: 'nwse-resize',
                                                                                                        border: '2px solid black',
                                                                                                        borderRadius: '50%',
                                                                                                        transform: 'translate(-100%, -100%)'
                                                                                                    }}
                                                                                                    onMouseDown={(e) => this.handleResizeStart(e, index)}
                                                                                                    onTouchStart={(e) => this.handleResizeStart(e, index)}
                                                                                                />
                                                                                            )}
                                                                                            {selectedRectangleIndex === index && movingRectangleIndex === index && (
                                                                                                <div
                                                                                                    style={{
                                                                                                        position: 'absolute',
                                                                                                        // left: rect.x,
                                                                                                        // top: rect.y,
                                                                                                        left: `${rect.x / 640 * 100}%`,
                                                                                                        top: `${rect.y / 480 * 100}%`,
                                                                                                        width: `${movingW}px`,
                                                                                                        height: `${movingH}px`,
                                                                                                        background: 'rgba(0, 0, 0, 0.5)',
                                                                                                        cursor: 'move'
                                                                                                    }}
                                                                                                    onMouseDown={(e) => this.handleMoveStart(e, index)}
                                                                                                    onTouchStart={(e) => this.handleMoveStart(e, index)}
                                                                                                />
                                                                                            )}
                                                                                        </React.Fragment>
                                                                                    )
                                                                                }
                                                                                
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                    {/* <div style={{ marginBottom: '10px' }}>
                                                                    </div> */}
                                                                </div>
                                                                
                                                            )}
                                                    </CardBody>
                                                    <CardFooter>
                                                        <InputGroup>
                                                            <Label className='mx-1'>Choose Rectangle Color: </Label>
                                                            <ColorPicker_1 selectedColor={this.state.selectedColor} setSelectedColor={(e) => this.setSelectedColor(e)} />
                                                        </InputGroup>
                                                        <InputGroup className='mx-3 my-3'>
                                                            <Label check className='py-1 px-2' style={{ userSelect: 'none', boxShadow: this.state.showRegion ? '0px 0px 10px 5px green' : '0px 0px 10px 5px #ccc', borderRadius: '5px' }}>
                                                                <Input
                                                                    type="checkbox"
                                                                    checked={this.state.showRegion}
                                                                    onChange={this.handleShowRegion}
                                                                />{' '}
                                                                Show Region
                                                            </Label>
                                                        </InputGroup>
                                                        <Button className='mx-2 my-2' onClick={this.sendCoordinates}>Send Coordinates and Image</Button>
                                                        {/* <ButtonGroup> */}
                                                        <Button className='me-2' color='success' onClick={this.handleZoomIn}>Zoom In</Button>
                                                        <Button className='me-2' color='warning' onClick={this.handleZoomOut}>Zoom Out</Button>
                                                        <Button className='me-2' color='info' onClick={this.handleZoomReset}>Reset</Button>
                                                        {/* </ButtonGroup> */}
                                                    </CardFooter>
                                                </Card>
                                            </Col>
                                            <Col>
                                                <div style={{ height: '30vh', overflowY: 'auto' }}>
                                                    {rectangles.map((rectangle, id_rect) => (
                                                        <div key={id_rect} className='d-flex my-2'>
                                                            <div
                                                                onMouseDown={() => this.handleRectangle(id_rect)}
                                                                className="d-flex item-button w-50 "
                                                                color='info'
                                                            >
                                                                <span className='me-auto'>{rectangle.name}</span>
                                                                <i className='mx-2' style={{ fontSize: '1rem', color: 'black' }}
                                                                    onMouseDown={() => this.moveSelectedRectangle(id_rect)}
                                                                ><FaArrowsAlt /></i>
                                                                <i className='mx-2' style={{ fontSize: '1rem', color: 'black' }}
                                                                    onMouseDown={() => this.resizeSelectedRectangle(id_rect)}
                                                                ><FaExpand /></i>
                                                                <i className="mx-2" style={{ fontSize: '1rem', color: 'black' }}
                                                                    onMouseDown={() => this.editSelectedRectangle(id_rect)}
                                                                ><FaEdit /></i>
                                                                <i className="ms-2" style={{ fontSize: '1rem', color: 'red' }}
                                                                    onMouseDown={() => this.deleteSelectedRectangle(id_rect)}
                                                                ><FaTrash /></i>
                                                            </div>
                                                            {editingRectangleIndex !== null &&
                                                                editingRectangleIndex === id_rect &&
                                                                (
                                                                    <div className='ms-3'>
                                                                        <InputGroup>
                                                                            <Label className='my-auto'>{`Region Name: `}</Label>
                                                                            <Input
                                                                                className='ms-3'
                                                                                type="text"
                                                                                value={this.state.inputRectangleName}
                                                                                onChange={this.handleNameChange}
                                                                                // onBlur={(e) => this.handleNameSubmit(e, id_rect)}
                                                                                maxLength="8"
                                                                                pattern="^[a-zA-Z0-9]{1,8}$"
                                                                                title="Only letters and numbers are allowed, up to 8 characters."
                                                                            />
                                                                            <Button className='' color='success' onMouseDown={() => this.handleNameSubmit(id_rect)}>
                                                                                <FaSave className=' my-auto' style={{ fontSize: '1rem', color: 'white' }} />
                                                                            </Button>
                                                                            {
                                                                                this.state.existRectangleNameError &&
                                                                                <Label className='ms-3 my-auto' style={{ color: 'red' }}>{`* Rectangle Name Already Exists `}</Label>
                                                                            }
                                                                        </InputGroup>

                                                                    </div>
                                                                )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </Col>
                                        </Row>
                                    </ModalBody>
                                </Modal>
                            }
                            <div className='storedImages mt-5' style={{userSelect: 'none'}}>
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
                                            <Col className='scrlHide' sm={6} md={6} style={{ border: '1px solid' }}>
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
                                                {/* <Row className='mt-2' style={{ height: '90vh', overflowY: 'auto' }}> */}
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
                                            </Col>
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
                                                                                    <Button color='danger' onClick={() => this.handleDeleteSelectedImages()}>
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
                                                                                                            <Img src={this.getImages(item.imagePathType[item.used_model_ver.indexOf(parseInt(version))])} alt='Image not there' />
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

                    </Container>
                </div>
                <Modal isOpen={this.state.ask_type_of_testing} toggle={this.closeTestingAskWindow} centered style={{userSelect: 'none'}}>
                    {/* <ModalHeader toggle={this.closeTestingAskWindow}>Selected Option</ModalHeader> */}
                    <ModalBody>
                        {/* <Form>
                            <FormGroup>
                                <Label for="exampleSelect" style={{fontWeight: 'bold'}}>Select Testing Mode</Label>
                                <Input type="select" name="select" id="exampleSelect" 
                                    value={this.state.default_testing} 
                                    onChange={(e) => this.changeTestingMode(e)}
                                >
                                    {
                                        this.state.testing_options.map((option, index) => (
                                            <option key={index} value={option.option}>{option.value}</option>
                                        ))
                                    }
                                </Input>
                            </FormGroup>
                            
                        </Form> */}
                        <h5 style={{fontWeight: 'bold' , textAlign: 'center'}}>Select Testing Mode</h5>
                        <div className='d-flex justify-content-evenly mt-3'>
                            <Checkbox
                                checked={this.state.overall_testing}
                                onChange={(e) => { this.overallTest(e) }}
                            >
                                Overall Testing
                            </Checkbox>
                            <Checkbox
                                checked={this.state.region_wise_testing}
                                onChange={(e) => { this.region_wiseTest(e) }}
                            >
                                Region-Wise Testing
                            </Checkbox>
                        </div>
                        {
                            this.state.region_testing_required &&
                            <div className='d-flex justify-content-center my-2'>
                                <Label className='ms-3 my-auto' style={{ color: 'red' }}>{`* select testing mode to continue... `}</Label>
                            </div>                            
                        }

                        
                        <div className='d-flex mt-3'>
                            <Button className='ms-auto me-2' color='danger'
                                onClick={this.closeTestingAskWindow}
                            >Cancel</Button>
                            <Button className='mx-2' color='success'
                                onClick={() => this.continueTesting()}
                            >Continue</Button>
                        </div>
                    </ModalBody>
                    {/* <ModalFooter>
                        <Button color="secondary" onClick={this.closeTestingAskWindow}>Close</Button>
                    </ModalFooter> */}
                </Modal>
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

