import React, { Component, createRef } from 'react';
import {
  Container, CardTitle, Button, Table, Label, Row, Col, CardBody, Card,
  FormGroup, Input, Spinner
} from 'reactstrap';
import Webcam from "react-webcam";
import './Css/style.css';
import CountdownTimer from "react-component-countdown-timer";
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
// import 'antd/dist/antd.css';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Image as AntdImage } from 'antd';
import PropTypes from "prop-types";
import Select from 'react-select';
import { DEFAULT_RESOLUTION } from './cameraConfig';
import WebcamCapture from 'pages/WebcamCustom/WebcamCapture';
import FullScreenLoader from 'components/Common/FullScreenLoader';

import urlSocket from "./urlSocket"
// import ImageUrl from './imageUrl'
import { image_url } from './imageUrl';
let ImageUrl = image_url;

var _ = require('lodash');


export class adminAccTesting extends Component {
  static propTypes = { history: PropTypes.any.isRequired }
  constructor(props) {
    super(props);
    this.state = {
      modelData: {},
      config: [],
      showstatus: false,
      res_message: '',
      response_message: '',
      msg: '',
      mssg: '',
      startCapture: true,
      capture_duration: 10,
      testing_duration: 10,
      test_duration: null,
      positive: '',
      negative: '',
      posble_match: '',
      timer: false,
      time_elapsed: false,
      extendTimer: false,
      timeExtend: false,
      show_timer: false,
      show_acc: false,
      showresult: false,
      manual_abort: false,
      collection: null,
      count: 1,
      initvalue1: 1,
      initvalue2: 1,
      sample_count: '0',
      train_accuracy: '0',
      get_a: '0',
      get_b: '0',
      get_c: '0',
      get_d: '0',
      get_e: '0',
      get_f: '0',
      get_g: '0',
      get_h: '0',
      get_i: '0',
      gotoPage: '',
      ReTrain: false,

      show_result_img: false,
      barcode_data: '',
      show_outline: false,
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

      canvasUrl: null,

      slt_od_method: '',
      selectedRegions: [],

      zoom_value: {
        zoom: 1,
        center: { x: 0.5, y: 0.5 }
      },
      full_screen_loading: false,

      imageLoaded: false,
      regionImageLoaded: false,
      compImageLoaded: false,
      regionImagesLoaded: {}, // keyed by index

      approving_model_inprogress: false,
    };

    this.canvasRef = createRef();
    this.canvasRef2 = createRef();
    this.canvasRef3 = createRef();

    this.webcamRef = createRef();


    // this.showOutline = this.showOutline.bind(this);
  }

  componentDidMount() {

    const db_info = JSON.parse(localStorage.getItem('db_info'));
    ImageUrl = `${image_url}${db_info?.db_name}/`

    const zoom_values = JSON.parse(sessionStorage.getItem('zoom_values'));
    if (zoom_values) {
      this.setState({ zoom_value: zoom_values });
    }

    // Retrieve data from localStorage
    const getModelData = localStorage.getItem('modelData');
    console.log('getModelData', getModelData)
    if (getModelData === undefined || getModelData === null) {
      this.props.history.push('comp_info')
      return
    }
    else {
      const parsedModelData = JSON.parse(getModelData);
      if (parsedModelData?.detection_type) {
        this.setState({
          slt_od_method: parsedModelData.detection_type,
          selectedRegions: parsedModelData.regions || []
        });
      }
      const config = parsedModelData.config || [];
      const modelData = parsedModelData.testCompModelVerInfo
      const batch_no = parsedModelData.batch_no  //abort functionality
      const gotoPage = parsedModelData.page
      let test_duration = Number(config[0].train_acc_timer_per_sample) * Number(config[0].test_samples)
      this.showAlertTimer(parseInt(test_duration));


      let region_test_type = '';
      let overall_testing = true
      let region_wise_testing = false
      if (parsedModelData.option) {
        console.log('option value: ', parsedModelData);
        region_test_type = parsedModelData.option;
        overall_testing = parsedModelData.overall_testing;
        region_wise_testing = parsedModelData.region_wise_testing;
      }
      // const region_testing_enabled = (allow_region_test && toggle_region_test);


      // Use the parsedModelData for further processing or set it to the component state
      this.setState({
        modelData, config, positive: config[0].positive, negative: config[0].negative,
        posble_match: config[0].posble_match, capture_duration: Number(config[0].countdown),
        testing_duration: test_duration, show_timer: true, gotoPage,
        region_test_type: region_test_type,
        overall_testing: overall_testing,
        region_wise_testing: region_wise_testing
        // region_testing_enabled: region_testing_enabled
      });
      this.batchInfo(modelData, config, overall_testing, region_wise_testing);
      this.showRefOutline(modelData);

      if (parsedModelData.config[0].inspection_type === 'Manual') {
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

    // Parse the retrieved data

  }

  // componentDidUpdate = (prevProps, prevState) => {
  //   if(this.state.region_wise_testing === true) {
  //     if (!this.canvasRef.current) return;
  //     if (this.state.show_region_popup !== prevState.show_region_popup) {
  //       this.copyRectangle()
  //     }
  //   }
  // }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.response_message && this.canvasRef2.current) {
      console.log('canvasRef2 present 02 : ', this.canvasRef2.current);
      this.copyRectangle()
    }
    if (!this.state.response_message && prevState.response_message !== this.state.response_message) {
      this.setState({
        imageLoaded: false,
        regionImageLoaded: false,
        compImageLoaded: false,
        regionImagesLoaded: {}, // keyed by index
      })
    }
  }

  componentWillUnmount() {
    // Clear the interval to avoid memory leaks
    clearInterval(this.trainingStatusInterval);
    // Remove device change listener
    navigator.mediaDevices.removeEventListener('devicechange', this.checkWebcam);

    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    window.removeEventListener('popstate', this.handlePopState);
    localStorage.removeItem('modelData')
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

  showRefOutline = async (ver_data) => {
    try {
      const response = await urlSocket.post('/check_outline', {
        'comp_id': ver_data.comp_id,
        'model_id': ver_data.model_id,
      }, { mode: 'no-cors' });
      let getInfo = response.data;
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

  batchInfo = (modelData, config, overall_testing, region_wise_testing) => {
    try {
      urlSocket.post('/batch_info',
        {
          modelData,
          config,
          overall_testing,
          region_wise_testing
        },
        { mode: 'no-cors' })
        .then((response) => {
          let data = response.data;
          this.setState({
            batch_id: data.batch_id,
            res_mode: data.res_mode
          })
        })
        .catch((error) => {
          console.log(error)
        })
    } catch (error) {

    }
  }

  getImage = (data1) => {
    if (data1 !== undefined) {
      let baseurl = ImageUrl
      let data2 = data1.filter((data) => {
        return data.type === 'OK'
      })
      let output = ""
      if (data2.length > 0) {
        output = this.showImage(data2[0].image_path)
        // let replace = data2[0].image_path.replaceAll("\\", "/");
        // let result = replace
        // output = baseurl + result
      }
      return output
    }
    else {
      return null
    }
  }

  showAlertTimer = (test_duration) => {
    let second = test_duration - 20
    this.setState({ test_duration: second })
    //counttimer = setTimeout(() => {
    setTimeout(() => {
      this.setState({ extendTimer: true })
    }, second * 1000)
  }

  cont_apiCall = () => {
    this.setState({ showstatus: false, showresult: false })
    // var i = 0;
    // let intervalId = setInterval(() => {
    if (this.state.startCapture) {
      this.apiCall()
    }
    //   i++;
    // }, 1000)
    // this.setState({ intervalId });
  }

  apiCall = () => {
    let message = 'Place the object and press start'
    this.setState({ msg: message, show: true })
  }

  appCall = () => {
    this.setState({ startCapture: true, timer: true, showstatus: false, showresult: false })
    let message = 'Place the object'
    this.setState({ mssg: message, showdata: true })
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

  adminAccTestingAuto = async (event) => {
    this.setState({ showdata: false })
    const { modelData, manual_abort, time_elapsed, batch_id, config, initvalue1 } = this.state;

    if (manual_abort || time_elapsed) {
      return;
    }
    const imageSrc = await this.webcamRef.current.captureZoomedImage();
    // const imageSrc = this.webcam.getScreenshot({ width: DEFAULT_RESOLUTION.width, height: DEFAULT_RESOLUTION.height });
    if (!imageSrc) {
      this.setState({ showdata: true });
      return;
    }
    // let count = this.state.initvalue1++;
    this.setState(prevState => ({ initvalue1: prevState.initvalue1 + 1 }));
    const blob = await fetch(imageSrc).then((res) => res.blob());
    const formData = new FormData();

    const today = new Date();
    const _today = today.toLocaleDateString();
    const time = today.toLocaleTimeString().replace(/:/g, '_');
    const compdata = `${modelData.comp_name}_${modelData.comp_code}_${_today}_${time}`;

    const { comp_name, comp_code, model_name, model_ver, model_id, comp_id, comp_model_id, _id, thres } = modelData;

    formData.append('comp_name', comp_name);
    formData.append('comp_code', comp_code);
    formData.append('model_name', model_name);
    formData.append('model_ver', model_ver);
    formData.append('model_id', model_id);
    formData.append('comp_id', comp_id);
    formData.append('comp_model_id', comp_model_id);
    formData.append('detect_type', this.state.slt_od_method ? this.state.slt_od_method : config[0].detection_type);

    if (this.state?.selectedRegions) {
      formData.append('our_rectangles', JSON.stringify(this.state.comp_info?.rectangles));
      formData.append('selected_regions', JSON.stringify(this.state.selectedRegions));
    }
    formData.append('positive', config[0].positive);
    formData.append('negative', config[0].negative);
    formData.append('posble_match', config[0].posble_match);
    formData.append('upper_bound_conf', config[0].upper_bound_conf)
    formData.append('lower_bound_conf', config[0].lower_bound_conf)
    formData.append('count', initvalue1);
    formData.append('batch_id', batch_id);
    formData.append('_id', _id);
    formData.append('date', _today);
    formData.append('time', time);
    formData.append('thres', thres);
    formData.append('datasets', blob, `${compdata}.png`);

    try {
      const response = await urlSocket.post("/obj_detection_ver", formData, {
        headers: {
          "content-type": "multipart/form-data",
        },
        mode: "no-cors",
      });

      this.setState({
        res_message: response.data.detection_result,
        showstatus: true
      });

      if (response.data.detection_result === 'No Object Found') {
        setTimeout(() => {
          this.appCall();
        }, 1000);
      }
      else if (response.data.detection_result === 'Incorrect Object') {
        setTimeout(() => {
          this.appCall();
        }, 1000);
      }

      else if (response.data.detection_result === "Object Detected" || response.data.detection_result === "") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        let Checking = "Checking ...";
        this.setState({
          res_message: Checking,
          collection: response.data._id,
        });
        let trainAccResultId = response.data._id;
        let logId = response.data.log_id;

        let updated_rectangles = [];
        if (response.data?.updated_rectangles) {
          updated_rectangles = response.data.updated_rectangles
        }

        await urlSocket.post('/result_ver',
          {
            'comp_id': comp_id, 'comp_name': comp_name, 'comp_code': comp_code, 'model_name': model_name, 'model_ver': model_ver,
            'path': response.data.captured_image, 'thres': thres, 'positive': config[0].positive, 'negative': config[0].negative,
            'posble_match': config[0].posble_match, 'trainAccId': trainAccResultId,
            'logId': logId, 'ref_img_path': modelData.datasets[0].image_path, 'type': modelData.type, 'position': modelData.position,
            '_id': modelData._id, 'region_test_type': this.state.region_test_type,
            'overall_testing': this.state.overall_testing, 'region_wise_testing': this.state.region_wise_testing,
            'updated_rectangles': updated_rectangles,
          },
          { mode: 'no-cors' })
          .then(async detection => {
            let stateInsertion = {
              showstatus: false,
              showresult: true,
              response_message: detection.data.status,
              response_value: detection.data.value,
              output_img_path: detection.data.res_img_path,
              sift_matches: detection.data.sift_matches,
              region_results: detection.data.region_results
            }
            console.log('data556 ', detection)
            if (detection.data.region_results && detection.data.res_img_path) {
              // Original and target resolutions
              const originalWidth = 640;
              const originalHeight = 480;
              const targetWidth = DEFAULT_RESOLUTION.width;
              const targetHeight = DEFAULT_RESOLUTION.height;

              // Calculate scaling factors
              const scaleX = targetWidth / originalWidth;
              const scaleY = targetHeight / originalHeight;

              const rectNameMap = new Map(modelData.rectangles.map(rect => [rect.name, rect]));
              let retrivedrectangle = [];

              retrivedrectangle = detection.data.region_results.map((rect, rect_index) => {
                const rectangle_values = rectNameMap.get(rect.name);
                return {
                  name: rect.rectangles.name,
                  status: rect.status,
                  value: rect.value,
                  x: rect.rectangles.coordinates.x / scaleX,
                  y: rect.rectangles.coordinates.y / scaleY,
                  width: rect.rectangles.coordinates.width / scaleX,
                  height: rect.rectangles.coordinates.height / scaleY
                }
              });

              const canvas = this.canvasRef.current;
              const ctx = canvas.getContext('2d');
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              retrivedrectangle.map((rect, rect_id) => {

                const isSelected = rect.status == 'OK';
                if (isSelected) {
                  ctx.lineWidth = 2;
                  ctx.strokeStyle = 'green';
                  ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
                } else {
                  ctx.lineWidth = 2;
                  ctx.strokeStyle = 'red';
                  ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
                }
                ctx.font = 'bold 14px Arial';
                ctx.lineWidth = 3;
                ctx.strokeStyle = 'black';
                ctx.strokeText(rect.name, rect.x + 10, rect.y + 15);
                ctx.fillStyle = 'white';
                ctx.fillText(rect.name, rect.x + 10, rect.y + 15);
              });

              // const canvas2 = this.canvasRef2.current;
              // if (canvas2) {
              //   const canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              //   const ctx2 = canvas2.getContext('2d');
              //   ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
              //   ctx2.putImageData(canvasData, 0, 0);
              // }
              // };


              stateInsertion.canvasUrl = canvas.toDataURL();
              stateInsertion.show_region_webcam = true;
              stateInsertion.show_region_popup = true;
            }

            else if (detection.data.res_img_path) {
              stateInsertion.show_result_img = true;
            }
            if (this.state.region_wise_testing && this.state.overall_testing) {
              stateInsertion.compOnlyResultPath = detection.data.compOnlyResultPath
              stateInsertion.compOnlyResult = detection.data.compOnlyResult
              stateInsertion.compOnlyResultValue = detection.data.compOnlyResultValue
            }
            this.setState(stateInsertion)
          });
      } else {
        this.appCall();
      }
    } catch (error) {
      console.error(error);
    }
  }


  adminAccTesting = async (config) => {
    const { modelData, manual_abort, time_elapsed, batch_id, initvalue1 } = this.state;

    if (manual_abort || time_elapsed) {
      return;
    }
    clearInterval(this.state.intervalId);
    this.setState({ show: false });

    const imageSrc = await this.webcamRef.current.captureZoomedImage();
    // const imageSrc = this.webcam.getScreenshot({ width: DEFAULT_RESOLUTION.width, height: DEFAULT_RESOLUTION.height});
    if (!imageSrc) {
      this.setState({ show: true });
      return;
    }
    // const count = this.state.initvalue1++;
    this.setState(prevState => ({ initvalue1: prevState.initvalue1 + 1 }));
    const blob = await fetch(imageSrc).then((res) => res.blob());
    const formData = new FormData();

    const today = new Date();
    const _today = today.toLocaleDateString();
    const time = today.toLocaleTimeString().replace(/:/g, '_');
    const compdata = `${modelData.comp_name}_${modelData.comp_code}_${_today}_${time}`;

    const { comp_name, comp_code, model_name, model_ver, model_id, comp_id, comp_model_id, _id, thres } = modelData;

    formData.append('comp_name', comp_name);
    formData.append('comp_code', comp_code);
    formData.append('model_name', model_name);
    formData.append('model_ver', model_ver);
    formData.append('model_id', model_id);
    formData.append('comp_id', comp_id);
    formData.append('comp_model_id', comp_model_id);
    formData.append('detect_type', this.state.slt_od_method ? this.state.slt_od_method : config.detection_type);

    if (this.state?.selectedRegions) {
      formData.append('our_rectangles', JSON.stringify(this.state.comp_info?.rectangles));
      formData.append('selected_regions', JSON.stringify(this.state.selectedRegions));
    }


    formData.append('positive', config.positive);
    formData.append('negative', config.negative);
    formData.append('posble_match', config.posble_match);
    formData.append('upper_bound_conf', config.upper_bound_conf)
    formData.append('lower_bound_conf', config.lower_bound_conf)
    formData.append('count', initvalue1);
    formData.append('batch_id', batch_id);
    formData.append('_id', _id);
    formData.append('date', _today);
    formData.append('time', time);
    formData.append('thres', thres);
    formData.append('datasets', blob, `${compdata}.png`);

    try {
      const response = await urlSocket.post("/obj_detection_ver", formData, {
        headers: {
          "content-type": "multipart/form-data",
        },
        mode: "no-cors",
      });

      this.setState({
        res_message: response.data.detection_result,
        showstatus: true
      });

      if (response.data.detection_result === 'No Object Detected') {
        setTimeout(() => {
          this.cont_apiCall();
        }, 1000);
      }
      else if (response.data.detection_result === 'Incorrect Object') {
        setTimeout(() => {
          this.cont_apiCall();
        }, 1000);
      } else if (response.data.detection_result === "Object Detected" || response.data.detection_result === "") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        let Checking = "Checking ...";
        this.setState({
          res_message: Checking,
          collection: response.data._id,
        });
        let trainAccResultId = response.data._id;
        let logId = response.data.log_id;

        let updated_rectangles = [];
        if (response.data?.updated_rectangles) {
          updated_rectangles = response.data.updated_rectangles
        }

        await urlSocket.post('/result_ver',
          {
            'comp_id': comp_id, 'comp_name': comp_name, 'comp_code': comp_code,
            'model_name': model_name, 'model_ver': model_ver, 'path': response.data.captured_image,
            'thres': thres, 'positive': config.positive, 'negative': config.negative,
            'posble_match': config.posble_match, 'trainAccId': trainAccResultId,
            'logId': logId, 'ref_img_path': modelData.datasets[0].image_path,
            'type': modelData.type, 'position': modelData.position, '_id': modelData._id,
            'region_test_type': this.state.region_test_type,
            'overall_testing': this.state.overall_testing,
            'region_wise_testing': this.state.region_wise_testing,
            "updated_rectangles": updated_rectangles,
          },
          { mode: 'no-cors' })
          .then(async detection => {
            let stateInsertion = {
              showstatus: false,
              showresult: true,
              response_message: detection.data.status,
              response_value: detection.data.value,
              output_img_path: detection.data.res_img_path,
              sift_matches: detection.data.sift_matches,
              region_results: detection.data.region_results
            }
            console.log('data556 ', detection)
            if (detection.data.region_results && detection.data.res_img_path) {
              // Original and target resolutions
              const originalWidth = 640;
              const originalHeight = 480;
              const targetWidth = DEFAULT_RESOLUTION.width;
              const targetHeight = DEFAULT_RESOLUTION.height;

              // Calculate scaling factors
              const scaleX = targetWidth / originalWidth;
              const scaleY = targetHeight / originalHeight;

              const rectNameMap = new Map(modelData.rectangles.map(rect => [rect.name, rect]));
              let retrivedrectangle = [];

              retrivedrectangle = detection.data.region_results.map((rect, rect_index) => {
                const rectangle_values = rectNameMap.get(rect.name);
                return {
                  name: rect.rectangles.name,
                  status: rect.status,
                  value: rect.value,
                  x: rect.rectangles.coordinates.x / scaleX,
                  y: rect.rectangles.coordinates.y / scaleY,
                  width: rect.rectangles.coordinates.width / scaleX,
                  height: rect.rectangles.coordinates.height / scaleY
                }
              });

              const canvas = this.canvasRef.current;
              const ctx = canvas.getContext('2d');
              // const img = new Image();
              // img.src = imageSrc;
              // img.onload = () => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              // ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              retrivedrectangle.map((rect, rect_id) => {

                const isSelected = rect.status == 'OK';
                if (isSelected) {
                  ctx.lineWidth = 2;
                  ctx.strokeStyle = 'green';
                  ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
                } else {
                  ctx.lineWidth = 2;
                  ctx.strokeStyle = 'red';
                  ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
                }
                // const textPosX = index === this.state.movingRectangleIndex ? rect.x + 25 : rect.x + 10;
                ctx.font = 'bold 14px Arial';
                ctx.lineWidth = 3;
                ctx.strokeStyle = 'black';
                ctx.strokeText(rect.name, rect.x + 10, rect.y + 15);
                ctx.fillStyle = 'white';
                ctx.fillText(rect.name, rect.x + 10, rect.y + 15);
              });

              // const canvas2 = this.canvasRef2.current;
              // if (canvas2) {
              //   const canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              //   const ctx2 = canvas2.getContext('2d');
              //   ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
              //   ctx2.putImageData(canvasData, 0, 0);
              // }
              // };


              stateInsertion.canvasUrl = canvas.toDataURL();
              stateInsertion.show_region_webcam = true;
              stateInsertion.show_region_popup = true;
            }
            else if (detection.data.res_img_path) {
              stateInsertion.show_result_img = true;
            }
            if (this.state.region_wise_testing && this.state.overall_testing) {
              stateInsertion.compOnlyResultPath = detection.data.compOnlyResultPath
              stateInsertion.compOnlyResult = detection.data.compOnlyResult
              stateInsertion.compOnlyResultValue = detection.data.compOnlyResultValue
            }
            this.setState(
              stateInsertion
              // , () => {
              //   this.setState({show_region_webcam: true})
              // }
            )
          });
      } else {
        this.cont_apiCall();
      }
    } catch (error) {
      console.error(error);
    }
  }


  uniq_object_detection = async () => {
    this.setState({ showdata: false })
    const { modelData, manual_abort, time_elapsed, batch_id, config, initvalue1 } = this.state;
    if (manual_abort || time_elapsed) {
      return;
    }
    // let count = this.state.initvalue1++;
    this.setState(prevState => ({ initvalue1: prevState.initvalue1 + 1 }));
    const imageSrc = await this.webcamRef.current.captureZoomedImage();
    // const imageSrc = this.webcam.getScreenshot({ width: DEFAULT_RESOLUTION.width, height: DEFAULT_RESOLUTION.height});
    const blob = await fetch(imageSrc).then((res) => res.blob());
    const formData = new FormData();

    const today = new Date();
    const _today = today.toLocaleDateString();
    const time = today.toLocaleTimeString().replace(/:/g, '_');
    const compdata = `${modelData.comp_name}_${modelData.comp_code}_${_today}_${time}`;

    const { comp_name, comp_code, model_name, model_ver, model_id, comp_id, comp_model_id, _id, } = modelData;

    formData.append('comp_name', comp_name);
    formData.append('comp_code', comp_code);
    formData.append('model_name', model_name);
    formData.append('model_ver', model_ver);
    formData.append('model_id', model_id);
    formData.append('comp_id', comp_id);
    formData.append('comp_model_id', comp_model_id);
    formData.append('positive', config[0].positive);
    formData.append('negative', config[0].negative);
    formData.append('posble_match', config[0].posble_match);
    formData.append('count', initvalue1);
    formData.append('batch_id', batch_id);
    formData.append('_id', _id);
    formData.append('date', _today);
    formData.append('time', time);
    formData.append('datasets', blob, `${compdata}.png`);
    try {
      const response = await urlSocket.post("/qr_detection", formData, {
        headers: {
          "content-type": "multipart/form-data",
        },
        mode: "no-cors",
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));
      this.setState({ res_message: response.data.detection_result, showstatus: true });

      if (response.data.detection_result === 'No Object Found') {

        // Add a 1-second delay before calling this.appCall();
        setTimeout(() => {
          this.appCall();
        }, 1000);
      } else if (response.data.detection_result === "Data Found") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        let Checking = "Checking ...";
        this.setState({ res_message: Checking, showstatus: true });

        await new Promise((resolve) => setTimeout(resolve, 1000));
        this.setState({
          showstatus: false,
          collection: response.data._id,
          response_message: response.data.status,
          response_value: response.data.value,
          showresult: true,
        });
      } else {
        this.appCall();
      }
    } catch (error) {
      console.error(error);
    }
  }


  ask_show = async (data) => {
    // let count_value = this.state.initvalue2++;
    const { initvalue2 } = this.state;

    this.setState(prevState => ({ initvalue2: prevState.initvalue2 + 1 }));
    this.setState({
      response_message: '', sample_count: initvalue2, show_result_img: false,
      show_region_popup: false
    })
    if (data === 'yes') this.agree_not(this.state.collection, data, this.state.batch_id, this.state.response_message);
    else this.agree_not(this.state.collection, data, this.state.batch_id, this.state.response_message);
  }

  agree_not = (data, datas, batch_id, result) => {
    const { modelData, config } = this.state;
    try {
      urlSocket.post('/agree_not', {
        '_id': data,
        'agree': datas,
        'batch_id': batch_id,
        'config': config,
        'modelData': modelData,
        'result': result
      },
        { mode: 'no-cors' })
        .then((response) => {
          let data = response.data.data;

          let summary_ok = _.map(data, function (o) {
            if (o.result == config[0].positive) {
              return o;
            }

          });

          summary_ok = _.without(summary_ok, undefined)

          if (summary_ok.length !== 0) {
            this.setState({ get_a: summary_ok[0].ok, get_d: summary_ok[0].agree, get_g: summary_ok[0].disagree })
          }
          let summary_notok = _.map(data, function (o) {
            if (o.result == config[0].negative) {

              return o;
            }

          });

          summary_notok = _.without(summary_notok, undefined)

          if (summary_notok.length !== 0) {
            this.setState({ get_b: summary_notok[0].notok, get_e: summary_notok[0].agree, get_h: summary_notok[0].disagree })
          }
          let summary_posbl_match = _.map(data, function (o) {
            if (o.result == config[0].posble_match) {

              return o;
            }

          });
          summary_posbl_match = _.without(summary_posbl_match, undefined)
          if (summary_posbl_match.length !== 0) {
            this.setState({ get_c: summary_posbl_match[0].posbl_match, get_f: summary_posbl_match[0].qc_ok, get_i: summary_posbl_match[0].qc_notok })
          }

          let train_acc = this.findAccuracy();

          this.setState({
            train_accuracy: train_acc,
            show_acc: true
          })

          if (config[0].inspection_type === 'Manual') {

            if (Number(this.state.sample_count) !== Number(config[0].test_samples)) {
              this.cont_apiCall()
            }
            else if (Number(this.state.sample_count) === Number(config[0].test_samples)) {
              if ((train_acc) !== 100) {
                this.callapiLog(config[0].test_samples, this.state.sample_count, config[0].positive, config[0].negative, config[0].posble_match)
                this.trainClick()
              }
              else {
                this.callapiLog(config[0].test_samples, this.state.sample_count, config[0].positive, config[0].negative, config[0].posble_match)
              }
            }
          }
          else {
            if (Number(this.state.sample_count) !== Number(config[0].test_samples)) {
              this.appCall()
            }
            else if (Number(this.state.sample_count) === Number(config[0].test_samples)) {
              if ((train_acc) !== 100) {
                this.callapiLog(config[0].test_samples, this.state.sample_count, config[0].positive, config[0].negative, config[0].posble_match)
                this.trainClick()
              }
              else {
                this.callapiLog(config[0].test_samples, this.state.sample_count, config[0].positive, config[0].negative, config[0].posble_match)
              }
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


  navigateto = async () => {
    this.setState({ approving_model_inprogress: true })
    const {
      modelData, config, gotoPage, batch_id, train_accuracy,
      train_acc_both, train_acc_ok, train_acc_ng
    } = this.state

    try {
      await urlSocket.post('/status_change',
        {
          'modelData': modelData,
          'config': config,
          'batch_id': batch_id,
          'train_accuracy': train_accuracy,
          'train_acc_both': train_acc_both,
          'train_acc_ok': train_acc_ok,
          'train_acc_ng': train_acc_ng
        },
        { mode: 'no-cors' })
        .then((response) => {
          let data = response.data
          this.setState({ startCapture: false })
          if (gotoPage === 'modelcreation') {
            const { history } = this.props
            history.push("/modelCreation")
          }
          else {
            const { history } = this.props
            history.push("/modelVerInfo")
          }
        })
        .catch((error) => {
          console.log(error)
        })
    } catch (error) {
      console.log("----", error)
    } finally {
      this.setState({ approving_model_inprogress: false })
    }
  }

  callapiLog = async (data, datas, positive, negative, posble_match) => {
    const { modelData, config } = this.state
    let comp_name = modelData.comp_name
    let comp_code = modelData.comp_code
    try {
      urlSocket.post('/callapiLog', { 'comp_name': comp_name, 'comp_code': comp_code, 'test_samples': data, 'sample_count': datas, 'positive': positive, 'negative': negative, 'posble_match': posble_match, 'ok': this.state.get_a, 'notok': this.state.get_b, 'agree_ok': this.state.get_d, 'agree_notok': this.state.get_e, 'disagree_ok': this.state.get_g, 'disagree_notok': this.state.get_h, 'possible_match': this.state.get_c, 'ok_possible': this.state.get_f, 'notok_possible': this.state.get_i, 'accuracy': this.state.train_accuracy },
        { mode: 'no-cors' })
        .then((response) => {
          let inspected_data = response.data;
        })
        .catch((error) => {
          console.log(error)
        })
    } catch (error) {
      console.log(error)
    }
  }

  trainClick = async (event) => {
    const {
      modelData, config, batch_id, train_accuracy,
      train_acc_both, train_acc_ok, train_acc_ng
    } = this.state
    try {
      urlSocket.post('/re_train',
        {
          'modelData': modelData,
          'config': config,
          'batch_id': batch_id,
          'train_accuracy': train_accuracy,
          'train_acc_both': train_acc_both,
          'train_acc_ok': train_acc_ok,
          'train_acc_ng': train_acc_ng
        },
        { mode: 'no-cors' })
        .then((response) => {
          let inspected_data = response.data
          if (inspected_data === 'Exceed the Re-Train Limit') {
            this.setState({ ReTrain: true })
          }
        })
        .catch((error) => {
          console.log(error)
        })
    } catch (error) {
      console.log(error)
    }
  }

  navigate = () => {
    this.setState({ startcapture: false })
    const { gotoPage } = this.state;
    if (gotoPage === 'modelcreation') {
      const { history } = this.props;
      history.push("/modelCreation")
    }
    else {
      const { history } = this.props;
      history.push("/modelVerInfo")
    }
  }

  // manual_abortTesting = async (event) => {
  //   this.setState({ startcapture: false, show: false, showdata: false, showstatus: false, showresult: false })
  //   console.log('620 batch_id : ', this.state.batch_id)
  //   const { modelData, config } = this.state
  //   let batch_id = this.state.batch_id
  //   // let comp_data = this.state.comp_info
  //   let comp_name = modelData.comp_name
  //   let comp_code = modelData.comp_code
  //   // positive = config.positive
  //   // negative = config.negative
  //   // posble_match = config.posble_match
  //   //console.log('posble_match407', posble_match)
  //   try {
  //     urlSocket.post('/manual_abort', {
  //       'batch_id': batch_id,
  //       'comp_name': comp_name,
  //       'comp_code': comp_code,
  //       'positive': config[0].positive,
  //       'negative': config[0].negative,
  //       'posble_match': config[0].posble_match
  //     },
  //       { mode: 'no-cors' })
  //       .then((response) => {
  //         let aborted_data = response.data
  //         console.log("aborted_data_326", aborted_data)
  //         this.setState({ auto_abort: aborted_data, manual_abort: true, startcapture: false, show: false, showdata: false })
  //         //this.navigation()
  //       })
  //       .catch((error) => {
  //         console.log(error)
  //       })
  //   } catch (error) {
  //   }
  // }

  manual_abortTesting = async (event) => {
    this.setState({
      startcapture: false,
      // show: false, 
      showdata: false,
      showstatus: false, showresult: false,
      manual_abort: true,
    })
  }

  // navigation = () => {
  //   this.setState({ startcapture: false, show: false });

  //   const { modelData, config, gotoPage, batch_id } = this.state;

  //   try {
  //     urlSocket.post('/manual_abort', {
  //       'batch_id': batch_id,
  //       'comp_name': modelData.comp_name,
  //       'comp_code': modelData.comp_code,
  //       'positive': config[0].positive,
  //       'negative': config[0].negative,
  //       'posble_match': config[0].posble_match
  //     },
  //       { mode: 'no-cors' })
  //       .then((response) => {
  //         let aborted_data = response.data
  //         console.log("aborted_data_326 : ", aborted_data)
  //         this.setState({ auto_abort: aborted_data, showdata: false })
  //       })
  //       .catch((error) => {
  //         console.log(error)
  //       })
  //   } catch (error) {
  //   }
  //   try {
  //     urlSocket.post('/status_update', { 'model_data': modelData, 'status': 'training completed' },
  //       { mode: 'no-cors' })
  //       .then((response) => {
  //         let data = response.data
  //         console.log('abort', data)
  //         this.setState({ startCapture: false })
  //         if (gotoPage === 'modelcreation') {
  //           const { history } = this.props
  //           console.log(this.props)
  //           history.push("/modelCreation")
  //         }
  //         else {
  //           const { history } = this.props
  //           console.log(this.props)
  //           history.push("/modelVerInfo")
  //         }
  //       })
  //       .catch((error) => {
  //         console.log(error)
  //       })
  //   } catch (error) {
  //     console.log("----", error)
  //   }
  // }

  navigation = async () => {
    this.setState({ manual_abort: false, full_screen_loading: true })
    try {
      const { modelData, config, gotoPage, batch_id } = this.state;

      const abortResponse = await urlSocket.post('/manual_abort', {
        'batch_id': batch_id,
        'comp_name': modelData.comp_name,
        'comp_code': modelData.comp_code,
        'positive': config[0].positive,
        'negative': config[0].negative,
        'posble_match': config[0].posble_match,
        'type': modelData.type,
        'position': modelData.position,
      }, { mode: 'no-cors' });

      const aborted_data = abortResponse.data;
      this.setState({ auto_abort: aborted_data, showdata: false });

      // Second API call (only after the first one has completed)
      const statusResponse = await urlSocket.post('/status_update', {
        'model_data': modelData,
        'status': 'training completed'
      }, { mode: 'no-cors' });

      const data = statusResponse.data;
      this.setState({ startCapture: false });

      const { history } = this.props;

      if (gotoPage === 'modelcreation') {
        history.push("/modelCreation");
      } else {
        history.push("/modelVerInfo");
      }

    } catch (error) {
      console.log("----", error);
    }
    finally {
      this.setState({ full_screen_loading: false });
    }
  };

  extendTimer = () => {
    setTimeout(() => {
      this.setState({ show_timer: false })
    }, 1000)
    let test_duration = this.state.testing_duration
    setTimeout(() => {
      this.setState({ testing_duration: test_duration, show_timer: true })
    }, 1000)
    this.setState({ extendTimer: false })
    this.showAlertTimer(test_duration);
  }

  timerExtention = async () => {
    // if (counttimer) {
    //     clearTimeout(counttimer)
    //   }
    this.setState({ timeExtend: false })
    let test_duration = this.state.testing_duration
    this.setState({ testing_duration: test_duration, show_timer: true, show: true });
  }

  abortTesting = async (event) => {
    this.setState({ timeExtend: false });
    this.setState({ startcapture: false, show: false, showdata: false })
    const { modelData, config } = this.state
    let batch_id = this.state.batch_id
    let comp_name = modelData.comp_name
    let comp_code = modelData.comp_code
    try {
      urlSocket.post('/abort', { 'batch_id': batch_id, 'comp_name': comp_name, 'comp_code': comp_code, 'positive': config[0].positive, 'negative': config[0].negative, 'posble_match': config[0].posble_match },
        { mode: 'no-cors' })
        .then((response) => {
          let aborted_data = response.data;
          this.setState({ auto_abort: aborted_data, time_elapsed: true, startcapture: false, show: false, showdata: false })
          //this.navigation()
        })
        .catch((error) => {
          console.log(error)
        })
    } catch (error) {
    }
  }

  reTrainLimit = () => {
    this.setState({ ReTrain: false })
  }

  showImage = (output_img) => {
    let imgurl = ImageUrl
    const parts = output_img.split("/");
    const newPath = parts.slice(1).join("/");

    let startIndex;
    if (newPath.includes("Datasets/")) {
      startIndex = newPath.indexOf("Datasets/");
    } else {
      startIndex = newPath.indexOf("receive/");
    }

    const relativePath = newPath.substring(startIndex);
    console.log('output_img : ', imgurl + relativePath)
    return `${imgurl + relativePath}`
  }

  // findAccuracy() {
  //   // calculate training accuracy based on model's result_mode
  //   const {
  //     res_mode, get_d, get_e, get_h, sample_count
  //   } = this.state;

  //   if (res_mode === "both") {
  //     return ((Number(get_d) + Number(get_e)) / Number(sample_count)) * 100;
  //   } else if (res_mode === "ok") {

  //     if (get_h !== 0) {
  //       return (Number(get_d) / (Number(get_d) + Number(get_h))) * 100;
  //     } else {
  //       return 100;
  //     }

  //   } else {
  //     return ((Number(get_d) + Number(get_e)) / Number(sample_count)) * 100;
  //   }
  // }

  findAccuracy() {
    const { res_mode, get_d, get_e, get_g, get_h, sample_count } = this.state;

    const d = Number(get_d);
    const e = Number(get_e);
    const g = Number(get_g);
    const h = Number(get_h);

    // let train_acc_both = ((d + e) / sample_count) * 100;
    // let train_acc_ok = ( h !== 0 ? (d / (d + h)) * 100 : 100 );
    // let train_acc_ng = ( g !== 0 ? (e / (e + g)) * 100 : 100 );

    let train_acc_both = ((d + e) / sample_count) * 100;
    let ok_acc = (d / (d + h)) * 100;
    let ng_acc = (e / (e + g)) * 100;

    let train_acc_ok = isNaN(ok_acc) ? 0 : ok_acc;
    let train_acc_ng = isNaN(ng_acc) ? 0 : ng_acc;

    this.setState({ train_acc_both, train_acc_ok, train_acc_ng });

    if (res_mode === "ok") {
      return train_acc_ok;
    } else if (res_mode === "ng") {
      return train_acc_ng;
    }

    // For "both" or other cases
    return train_acc_both;
  }

  barcodeTesting = async (config) => {
    const { modelData, manual_abort, time_elapsed, batch_id } = this.state;

    if (manual_abort || time_elapsed) {
      return;
    }

    // Assuming initvalue1 is a state variable
    const { initvalue1 } = this.state;

    // Updating the state with the incremented value
    this.setState(prevState => ({ initvalue1: prevState.initvalue1 + 1 }));

    clearInterval(this.state.intervalId);
    this.setState({ show: false });

    const imageSrc = await this.webcamRef.current.captureZoomedImage();
    // const imageSrc = this.webcam.getScreenshot({ width: DEFAULT_RESOLUTION.width, height: DEFAULT_RESOLUTION.height });
    const blob = await fetch(imageSrc).then((res) => res.blob());
    const formData = new FormData();

    const today = new Date();
    const _today = today.toLocaleDateString();
    const time = today.toLocaleTimeString().replace(/:/g, '_');
    const compdata = `${modelData.comp_name}_${modelData.comp_code}_${_today}_${time}`;

    const { comp_name, comp_code, model_name, model_ver, comp_id, thres } = modelData;

    formData.append('comp_id', comp_id);
    formData.append('count', initvalue1);
    formData.append('batch_id', batch_id);
    formData.append('date', _today);
    formData.append('time', time);
    formData.append('thres', thres);
    formData.append('datasets', blob, `${compdata}.png`);

    try {
      const response = await urlSocket.post("/barcode_compare", formData, {
        headers: {
          "content-type": "multipart/form-data",
        },
        mode: "no-cors",
      });

      this.setState({
        res_message: response.data,
        showstatus: true
      });
      //  else {
      //     this.cont_apiCall();
      //   }
    } catch (error) {
      console.error(error);
    }

  }

  barcodeInfo = (modelData) => {
    try {
      urlSocket.post('/barcode_info', { modelData },
        { mode: 'no-cors' })
        .then((response) => {
          let data = response.data;
          this.setState({ barcode_data: data })
        })
    } catch (error) {
      console.log('error', error)
    }
  }

  showOutline = () => {
    this.setState(prevState => ({
      show_outline: !prevState.show_outline
    }))
  }

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

  // Region Testing
  enableRegionTesting = () => {
    const { modelData } = this.state;
    // disable region_testing checkbox
    const allow_region_test = (modelData && modelData.regionselection);
    // disable if region_selection is false.
    const toggle_region_test = (modelData.regionselection == true);

    // test regions after pression start button, if the following true.
    this.setState(prevState => ({
      test_region: (!prevState.test_region)
    })
    )


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

  copyRectangle = () => {
    try {
      const canvas = this.canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        const canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (this.canvasRef2.current) {
          const canvas2 = this.canvasRef2.current;
          const ctx2 = canvas2.getContext('2d');
          ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
          ctx2.putImageData(canvasData, 0, 0);
        }
      }

    } catch (error) {
      console.warn(error);
    }
  }

  areAllRequiredImagesLoaded = () => {
    const {
      show_result_img,
      show_region_popup,
      region_wise_testing,
      overall_testing,
      region_results
    } = this.state;

    const {
      imageLoaded,
      regionImageLoaded,
      compImageLoaded,
      regionImagesLoaded
    } = this.state;

    if (show_result_img && !imageLoaded) return false;
    if (show_region_popup && !regionImageLoaded) return false;
    if (region_wise_testing && overall_testing && !compImageLoaded) return false;
    if (region_wise_testing) {
      for (let i = 0; i < region_results.length; i++) {
        if (!regionImagesLoaded[i]) return false;
      }
    }

    return true;
  };
  renderResultSweetAlert = ({ type }) => {
    const {
      response_message,
      positive,
      negative,
      manual_abort,
      time_elapsed,
      show_result_img,
      show_region_popup,
      output_img_path,
      region_wise_testing,
      response_value,
      sift_matches,
      modelData,
      compOnlyResult,
      compOnlyResultValue,
      compOnlyResultPath,
      region_results,
      overall_testing
    } = this.state;

    const isPositive = type === 'positive';
    const isNegative = type === 'negative';

    const shouldShowBase =
      response_message === (isPositive ? positive : negative) &&
      !manual_abort &&
      !time_elapsed;

    // ✅ Phase 1: Preload images invisibly if SweetAlert condition is met
    if (shouldShowBase && !this.areAllRequiredImagesLoaded()) {
      return (
        <>
          {show_result_img && (
            <img
              src={this.showImage(output_img_path)}
              style={{ display: 'none' }}
              onLoad={() => this.setState({ imageLoaded: true })}
              alt="preload"
            />
          )}
          {show_region_popup && (
            <img
              src={this.showImage(output_img_path)}
              // src={`${ImageUrl}${output_img_path}`}
              style={{ display: 'none' }}
              onLoad={() => this.setState({ regionImageLoaded: true })}
              alt="preload-region"
            />
          )}
          {region_wise_testing && overall_testing && (
            <img
              src={this.showImage(compOnlyResultPath)}
              // src={`${ImageUrl}${compOnlyResultPath}`}
              style={{ display: 'none' }}
              onLoad={() => this.setState({ compImageLoaded: true })}
              alt="preload-comp"
            />
          )}
          {region_wise_testing &&
            region_results.map((item, index) => (
              !this.state.regionImagesLoaded[index] && (
                <img
                  key={index}
                  src={this.showImage(item.output_img)}
                  // src={`${ImageUrl}${item.output_img}`}
                  style={{ display: 'none' }}
                  onLoad={() =>
                    this.setState(prev => ({
                      regionImagesLoaded: {
                        ...prev.regionImagesLoaded,
                        [index]: true
                      }
                    }))
                  }
                  alt={`preload-region-${index}`}
                />
              )
            ))}
        </>
      );
    }

    // ✅ Phase 2: All images are loaded, now show SweetAlert
    if (!shouldShowBase || !this.areAllRequiredImagesLoaded()) return null;

    const icon = isPositive ? <CheckCircleOutlined style={{ fontSize: 40 }} /> : <CloseCircleOutlined style={{ fontSize: 40 }} />;
    const resultColor = isPositive ? 'green' : 'red';
    const zIndex = isPositive ? 996 : 995;
    const titleSuffix = isPositive ? '01' : '02';

    return (
      <SweetAlert
        showCancel
        title=""
        cancelBtnBsStyle="danger"
        cancelBtnText="No"
        confirmBtnText="Yes"
        onConfirm={() => this.ask_show('yes')}
        onCancel={() => this.ask_show('no')}
        closeOnClickOutside={false}
        style={{ zIndex }}
      >
        {show_result_img && (
          <img
            style={{ width: '100%' }}
            src={this.showImage(output_img_path)}
            onLoad={() => this.setState({ imageLoaded: true })}
            alt="Result"
          />
        )}

        {show_region_popup && (
          <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
            <img
              style={{ width: '100%', height: 'auto' }}
              src={this.showImage(output_img_path)}
              // src={`${ImageUrl}${output_img_path}`}
              onLoad={() => this.setState({ regionImageLoaded: true })}
              alt="Region"
            />

            <canvas
              ref={this.canvasRef2}
              width={640}
              height={480}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: 'auto',
                display: this.state.regionImageLoaded ? 'block' : 'none'
              }}
            />

          </div>
        )}

        <div style={{ fontSize: 20, color: resultColor }}>
          {region_wise_testing
            ? `Result: ${response_message}`
            : `Result: ${response_message} ${response_value}`}
          {icon}
        </div>

        {(modelData.model_name === 'SIFT' || modelData.model_name === 'ANY_SIFT') && (
          <div>Sift Matches: {sift_matches}</div>
        )}

        {region_wise_testing && overall_testing && (
          <div>
            <h5>Component Result</h5>
            <Table striped>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Value</th>
                  <th>Result Image</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{compOnlyResult}</td>
                  <td>{compOnlyResultValue}</td>
                  <td>
                    {!this.state.compImageLoaded && (
                      <img
                        src={this.showImage(compOnlyResultPath)}
                        style={{ display: 'none' }}
                        onLoad={() => this.setState({ compImageLoaded: true })}
                        alt="preload"
                      />
                    )}

                    {this.state.compImageLoaded && (
                      <AntdImage
                        src={this.showImage(compOnlyResultPath)}
                        preview={{ zIndex: 1200 }}
                      />
                    )}

                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        )}

        {region_wise_testing && (
          <div className="d-flex flex-column">
            <h5>Region Results</h5>
            <Table striped>
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Value</th>
                  <th>Result Image</th>
                </tr>
              </thead>
              <tbody>
                {region_results.map((item, index) => (
                  <tr key={index}>
                    <th scope="row">{index + 1}</th>
                    <td>{item.name}</td>
                    <td>{item.status}</td>
                    <td>{item.value}</td>
                    <td>
                      {!this.state.regionImagesLoaded[index] && (
                        <img
                          src={this.showImage(item.output_img)}
                          style={{ display: 'none' }}
                          onLoad={() =>
                            this.setState(prev => ({
                              regionImagesLoaded: {
                                ...prev.regionImagesLoaded,
                                [index]: true
                              }
                            }))
                          }
                          alt="preload"
                        />
                      )}
                      {this.state.regionImagesLoaded[index] && (
                        <AntdImage
                          src={this.showImage(item.output_img)}
                          preview={{ zIndex: 1200 }}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        <div style={{ fontSize: 22 }}>
          Do you agree with the result?
        </div>
      </SweetAlert>
    );
  };

  render() {
    const { modelData, config, barcode_data } = this.state;
    const videoConstraints = {
      width: DEFAULT_RESOLUTION.width, height: DEFAULT_RESOLUTION.height,
      facingMode: "user"
    };
    return (
      <>
        {
          this.state.full_screen_loading || this.state.approving_model_inprogress ?
            <FullScreenLoader />
            : null
        }
        <div className='page-content'>
          <Row className="mb-3">
            <Col xs={9}>
              <div className="d-flex align-items-center justify-content-between">
                <div className="mb-0 mt-2 m-2 font-size-14 fw-bold">ADMIN ACCURACY TESTING</div>
              </div>
            </Col>
            <Col xs={3} className='d-flex align-items-center justify-content-end'>
              {
                this.state.extendTimer ?
                  <button className='btn btn-primary btn-sm me-2 w-md' color="primary" onClick={() => this.extendTimer()}>EXTEND TIMER</button>
                  : null
              }
              <button className='btn btn-primary btn-sm me-2 w-md' color="primary" onClick={() => this.manual_abortTesting()}>ABORT</button>
            </Col>
          </Row>
          <Container fluid>
            <Card>
              <CardBody>
                <div className="table-responsive">
                  <Table bordered hover striped className="text-center">
                    <thead className="thead-dark">
                      <tr>
                        <th>Component Name</th>
                        <th>Component Code</th>
                        <th>Model Name</th>
                        <th>Model Version</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{modelData.comp_name}</td>
                        <td>{modelData.comp_code}</td>
                        <td>{modelData.model_name}</td>
                        <td>{'V'}{' '}{modelData.model_ver}</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>

                <div>
                  {/* section 1- outline & start button */}
                  <div className='d-flex justify-content-end my-2' style={{ height: '30px' }}>
                    {
                      this.state.outline_checkbox ?
                        <div className='d-flex flex-wrap justify-content-start align-items-center gap-3 me-auto'>
                          <FormGroup check>
                            <Label check>
                              <Input
                                type="checkbox"
                                checked={this.state.show_outline}
                                onChange={() => this.showOutline()}
                              />
                              <span style={{ userSelect: 'none' }}>Show Outline</span>
                            </Label>
                          </FormGroup>
                          {
                            this.state.show_outline &&
                            <div className='d-flex align-items-center'>
                              <Label className='my-1'>Outline Color : </Label>
                              <div className='d-flex gap-2'>
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
                        </div> : null
                    }
                    {
                      !this.state.cameraDisconnected &&
                      <div className='d-flex justify-content-center'>
                        {
                          config.map((data, index) => (
                            data.inspection_type === "Manual" && this.state.show ?
                              <Button key={index} className='btn btn-sm w-md' color='primary' onClick={() => this.adminAccTesting(data)}>Start</Button> : null
                          ))
                        }
                      </div>
                    }
                  </div>

                  {/* section 2 - reference image, webcam preview */}
                  <Row>
                    {/* Col 2 - reference image */}
                    <Col lg={6}>
                      <Card>
                        <div className='font-size-14 fw-bold text-center' style={{ color: 'black' }}>REFERENCE IMAGE</div>
                        <img src={modelData.datasets === undefined ? "" : modelData.datasets.length !== 0 ? this.getImage(modelData.datasets) : ""} />
                      </Card>
                    </Col>
                    {/* Col 1 - webcam */}
                    <Col lg={6} >
                      <Card>
                        {/* time, sample completed */}
                        <div className='d-flex justify-content-between align-items-center'>
                          <div className='d-flex gap-2 justify-content-start align-items-center'>
                            <div className='font-size-14 fw-bold'>Time to complete:</div>
                            {
                              this.state.show_timer ?
                                config.map((data, index) => (
                                  <div className='font-size-14 fw-bold' key={index}>
                                    {
                                      Number(this.state.sample_count) !== Number(data.test_samples) === true &&
                                      <CountdownTimer hideDay={true} hideHours={false} count={this.state.testing_duration} onEnd={() => { this.onTimeup() }} />
                                    }
                                  </div>)) : null
                            }
                          </div>
                          <div className='d-flex gap-2 justify-content-end align-items-center'>
                            {
                              config.map((data, index) => (
                                <div className='font-size-14 fw-bold' key={index}><Label>Sample completed: {this.state.sample_count} / {data.test_samples}</Label></div>
                              ))
                            }
                          </div>
                        </div>

                        {/* training accuracy */}
                        <div className='d-flex justify-content-end align-items-center'>
                          {
                            this.state.show_acc ?
                              <div style={{ color: this.state.train_accuracy === 100.00 ? 'green' : 'red' }}>
                                {
                                  this.state.res_mode === "ok" ? `${config[0].positive}'s Training Accuracy: ` :
                                    this.state.res_mode === "ng" ? `${config[0].negative}'s Training Accuracy: ` :
                                      'Training Accuracy: '
                                }
                                {parseFloat(this.state.train_accuracy).toFixed(2)}%
                              </div> : null
                          }
                        </div>

                        <Row>
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
                                          src={this.showImage(this.state.outline_path)}
                                        ></img>
                                        : null
                                    }
                                    <WebcamCapture
                                      ref={this.webcamRef}
                                      resolution={DEFAULT_RESOLUTION}
                                      zoom={this.state.zoom_value?.zoom}
                                      center={this.state.zoom_value?.center}
                                    />
                                    {/* <Webcam
                                      videoConstraints={videoConstraints}
                                      audio={false}
                                      height={'auto'}
                                      screenshotFormat="image/png"
                                      width={'100%'}
                                      ref={node => this.webcam = node}
                                    /> */}
                                    {/* region selection */}
                                    <canvas
                                      ref={this.canvasRef}
                                      width={640}   //1440
                                      height={480}  //1080
                                      style={{
                                        display: (!this.state.show_region_webcam) && 'none',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: 'auto',
                                      }}
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
                                              this.state.res_message === "Barcode is correct" ? 'lightgreen' :
                                                this.state.res_message === "No Object Detected" ? 'yellow' :
                                                  this.state.res_message === "Incorrect Object" ? 'red' :
                                                    this.state.res_message === "Barcode is incorrect" ? 'red' :
                                                      this.state.res_message === "Unable to read Barcode" ? 'white' :
                                                        this.state.res_message === "Checking ..." ? 'lightyellow' :
                                                          null
                                        }}>
                                          {this.state.res_message}
                                        </div> : null
                                    }

                                    {/* {
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
                                    } */}
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

                        {/* qr_check and qr_uniq_check reference 21-03-24 */}
                        {/* <Row style={{ textAlign: 'end' }}>
                          <Col md={6}>
                            {
                              this.state.inspection_type === "Manual" && this.state.show ?
                                (this.state.qr_checking ?
                                  this.state.qruniq_checking ?
                                    <Button id="strtQrUniqCheck" color="primary" onClick={() => this.uniq_btnidentity()}>Start</Button> :
                                    <Button id="strtQrCheck" color="primary" onClick={() => this.uniq_identification()}>Start</Button>
                                  : <Button id="strtbtn" color="primary" onClick={() => this.object_detected()}>Start</Button>)
                                : null
                            }
                          </Col>
                        </Row> */}
                      </Card>
                    </Col>
                  </Row>
                </div>
              </CardBody>
            </Card>
          </Container>

          {
            this.state.time_elapsed ?
              // this.state.alertmsg ?
              <SweetAlert
                //title="Abort - Time Elapsed"
                title="Abort"
                confirmBtnText="Ok"
                onConfirm={() => this.navigation()}
                closeOnClickOutside={false}
                style={{ zIndex: 998 }}
              >
                <div style={{ fontSize: '22px' }}>
                  Testing process aborted
                </div>
              </SweetAlert> : null
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
                onConfirm={() => this.navigation()}
                onCancel={() => this.setState({
                  manual_abort: false
                })}
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

          {this.renderResultSweetAlert({ type: 'positive' })}
          {this.renderResultSweetAlert({ type: 'negative' })}

          {this.state.response_message === this.state.posble_match &&
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
                <div style={{
                  fontSize: '20px',
                  color:
                    this.state.response_message === this.state.posble_match ? 'orange' :
                      null
                }}>
                  Result: {this.state.response_message}{" "}{this.state.response_value}
                </div>
                <div style={{ fontSize: '22px' }}>
                  System is unable to exactly classify this sample. Please choose your result
                </div>
              </SweetAlert>
            )}
          {
            this.state.config.map((data, index) => (
              Number(this.state.sample_count) === Number(data.test_samples) === true &&
              (this.state.train_accuracy) !== 100 &&
              this.state.manual_abort !== true && this.state.time_elapsed !== true &&
              // parseFloat(((Number(this.state.get_d) + Number(this.state.get_e)) / data.test_samples) * 100).toFixed(2) !== 100.00 &&
              <div key={index}>
                <SweetAlert
                  title=""
                  confirmBtnText="Ok"
                  onConfirm={() => this.navigate()}
                  style={{ zIndex: 993 }}
                >
                  <div>
                    Total tested samples: {data.test_samples}
                  </div>{" "}
                  <Label>
                    {
                      // this.state.res_mode === "ok" ? "OK's Training Accuracy: " : "Training Accuracy: "
                      this.state.res_mode === "ok" ? `${config[0].positive}'s Training Accuracy ` :
                        this.state.res_mode === "ng" ? `${config[0].negative}'s Training Accuracy ` :
                          'Training Accuracy '
                    } Result
                  </Label>
                  <div className="table-responsive">
                    <Table>
                      <thead>
                        <tr>
                          <th></th>
                          <th>{data.positive}</th>
                          <th>{data.negative}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th>System result</th>
                          <td>{this.state.get_a}</td>
                          <td>{this.state.get_b}</td>
                        </tr>
                        <tr>
                          <th>Agreed by Qc</th>
                          <td>{this.state.get_d}</td>
                          <td>{this.state.get_e}</td>
                        </tr>
                        <tr>
                          <th>Disagreed byn Qc</th>
                          <td>{this.state.get_g}</td>
                          <td>{this.state.get_h}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                  {/* <div>{data.posble_match}: {this.state.get_c} </div>
                    <div>
                      <Table>
                        <thead>
                          <tr>
                            <th></th>
                            <th>{data.positive}</th>
                            <th>{data.negative}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th>Qc Selection</th>
                            <td>{this.state.get_f}</td>
                            <td>{this.state.get_i}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </div> */}
                  <Label style={{ color: 'red', fontSize: '18px' }}>
                    {
                      // this.state.res_mode === "ok" ? "OK's Training Accuracy: " : "Training Accuracy: "
                      this.state.res_mode === "ok" ? `${config[0].positive}'s Training Accuracy: ` :
                        this.state.res_mode === "ng" ? `${config[0].negative}'s Training Accuracy: ` :
                          'Training Accuracy: '
                    }
                    {parseFloat(this.state.train_accuracy).toFixed(2)} %, {" "}
                  </Label>
                  <Label>
                    {" Since accuracy is not equal to 100% based on QC's response, system will retrain the model for this component using the 'disagreed' samples to improve accuracy."}
                  </Label>
                  {/* Since accuracy is not 100%, model need to be trained again. Press retrain button below to proceed. */}
                </SweetAlert>
              </div>
            ))
          }
          {
            this.state.config.map((data, index) => (
              Number(this.state.sample_count) === Number(data.test_samples) === true &&
              //parseFloat(((Number(this.state.get_d) + Number(this.state.get_e)) / data.test_samples) * 100).toFixed(2) === 100.00 &&
              (this.state.train_accuracy) === 100 &&
              this.state.manual_abort !== true && this.state.time_elapsed !== true &&
              <div key={index}>
                <SweetAlert
                  title=""
                  confirmBtnText="ok"
                  onConfirm={() => this.navigateto()}
                  style={{ zIndex: 992 }}
                >
                  <div>
                    Total tested samples: {data.test_samples}
                  </div>
                  <Label>
                    {
                      // this.state.res_mode === "ok" ? "OK's Training Accuracy: " : "Training Accuracy: " 
                      this.state.res_mode === "ok" ? `${config[0].positive}'s Training Accuracy ` :
                        this.state.res_mode === "ng" ? `${config[0].negative}'s Training Accuracy ` :
                          'Training Accuracy '
                    } Result
                  </Label>
                  <div className="table-responsive">
                    <Table>
                      <thead>
                        <tr>
                          <th></th>
                          <th>{data.positive}</th>
                          <th>{data.negative}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th>System result</th>
                          <td>{this.state.get_a}</td>
                          <td>{this.state.get_b}</td>
                        </tr>
                        <tr>
                          <th>Agreed by Qc</th>
                          <td>{this.state.get_d}</td>
                          <td>{this.state.get_e}</td>
                        </tr>
                        <tr>
                          <th>Disagreed by Qc</th>
                          <td>{this.state.get_g}</td>
                          <td>{this.state.get_h}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                  <Label style={{ color: 'green', fontSize: '18px' }}>
                    {
                      // this.state.res_mode === "ok" ? "OK's Training Accuracy: " : "Training Accuracy: "
                      this.state.res_mode === "ok" ? `${config[0].positive}'s Training Accuracy: ` :
                        this.state.res_mode === "ng" ? `${config[0].negative}'s Training Accuracy: ` :
                          'Training Accuracy: '
                    }
                    {this.state.train_accuracy}%, {" "}
                  </Label>
                  <Label>
                    Model is ready for deployment.
                  </Label>
                </SweetAlert>
              </div>
            ))
          }
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
            this.state.ReTrain ?
              <SweetAlert
                // showCancel
                title="Your ReTrain Limit Exceeded"
                confirmBtnText="OK"
                // cancelBtnText="No"
                onConfirm={() => this.reTrainLimit()}
              // onCancel={() => this.abortTesting()}
              // closeOnClickOutside={false}
              // style={{ zIndex: 1000 }}
              >
                <div className='mt-2'>
                  Training has been attempted more than {this.state.config[0].training_cycle} times
                </div>
                <div className=''>

                </div>
              </SweetAlert> : null
          }
        </div>
      </>
    )
  }
}

export default adminAccTesting