import React, { Component } from 'react';
import { Container, CardTitle, Button, Table, Label, Row, Col, CardBody, Card } from 'reactstrap';
import Webcam from "react-webcam";
import urlSocket from "./urlSocket"
import ImageUrl from './imageUrl'
import './Css/style.css';
import CountdownTimer from "react-component-countdown-timer";
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
// import 'antd/dist/antd.css';
import SweetAlert from 'react-bootstrap-sweetalert';
import PropTypes from "prop-types"

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
      show_res_img: false,
      dur:0,
    };
  }

  componentDidMount() {

    // Retrieve data from localStorage
    const getModelData = localStorage.getItem('modelData');
    
    // Parse the retrieved data
    const parsedModelData = JSON.parse(getModelData);
    console.log('2610 D : parsedModelData : ', parsedModelData)
    const config = parsedModelData.config || [];
    const modelData = parsedModelData.testCompModelVerInfo
    const batch_no = parsedModelData.batch_no  //abort functionality
    const gotoPage = parsedModelData.page
    let test_duration = Number(config[0].train_acc_timer_per_sample) * Number(config[0].test_samples)
    this.showAlertTimer(parseInt(test_duration))

    // Use the parsedModelData for further processing or set it to the component state
    this.setState({
      modelData, config, positive: config[0].positive, negative: config[0].negative,
      posble_match: config[0].posble_match, capture_duration: Number(config[0].countdown),
      testing_duration: test_duration, show_timer: true, gotoPage
    });
    this.batchInfo(modelData, config)

    if (parsedModelData.config[0].inspection_type === 'Manual') {
      this.cont_apiCall()
    }
    else {
      if (this.state.startCapture) {
        setTimeout(() => { this.appCall() }, 2000)
      }
    }
  }

  batchInfo = (modelData, config) => {
    console.log('modelData', modelData, config)
    try {
      urlSocket.post('/batch_info', { modelData, config },
        { mode: 'no-cors' })
        .then((response) => {
          let data = response.data
          console.log('data98', data)
          this.setState({ batch_id: data })
        })
        .catch((error) => {
          console.log(error)
        })
    } catch (error) {

    }
  }

  getImage = (data1) => {
    if (data1 !== undefined) {
      console.log('data1', data1)
      let baseurl = ImageUrl
      let data2 = data1.filter((data) => {
        return data.type === 'OK'
      })
      let output = ""
      if (data2.length > 0) {
        console.log('first598', data2[0].image_path)
        let replace = data2[0].image_path.replaceAll("\\", "/");
        let result = replace
        output = baseurl + result
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
    console.log('message', message)
    this.setState({ msg: message, show: true })
  }

  appCall = () => {
    this.setState({ startCapture: true, timer: true, showstatus: false, showresult: false })
    let message = 'Place the object'
    console.log('message', message)
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
    const { modelData, manual_abort, time_elapsed, batch_id, config } = this.state;

    if (manual_abort || time_elapsed) {
      return;
    }

    let count = this.state.initvalue1++;

    const imageSrc = this.webcam.getScreenshot();
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
    formData.append('upper_bound_conf', config[0].upper_bound_conf)
    formData.append('lower_bound_conf', config[0].lower_bound_conf)
    formData.append('count', count);
    formData.append('batch_id', batch_id);
    formData.append('_id', _id);
    formData.append('date', _today);
    formData.append('time', time);
    formData.append('datasets', blob, `${compdata}.png`);

    try {
      const response = await urlSocket.post("/object_detection", formData, {
        headers: {
          "content-type": "multipart/form-data",
        },
        mode: "no-cors",
      });

      console.log(`success`, response.data);

      await new Promise((resolve) => setTimeout(resolve, 2000));
      this.setState({ res_message: response.data.detection_result, showstatus: true });

      if (response.data.detection_result === 'No Object Found') {
        console.log('else_dec_res', this.state.res_message);

        // Add a 1-second delay before calling this.appCall();
        setTimeout(() => {
          this.appCall();
        }, 1000);
      } else if (response.data.detection_result === "Object Detected") {
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
          output_img_path: response.data.res_img_path,
        });
      } else {
        this.appCall();
      }
    } catch (error) {
      console.error(error);
    }
  }


  adminAccTesting = async (config) => {
    const { modelData, manual_abort, time_elapsed, batch_id } = this.state;
    console.log('2610 D : data : modelData', modelData, ' manual_abort : ', manual_abort, ' time_elapsed : ', time_elapsed,' batch_id : ', batch_id)

    if (manual_abort || time_elapsed) {
      return;
    }

    const count = this.state.initvalue1++;
    clearInterval(this.state.intervalId);
    this.setState({ show: false });

    const imageSrc = this.webcam.getScreenshot();
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
    formData.append('positive', config.positive);
    formData.append('negative', config.negative);
    formData.append('posble_match', config.posble_match);
    formData.append('upper_bound_conf', config.upper_bound_conf)
    formData.append('lower_bound_conf', config.lower_bound_conf)
    formData.append('count', count);
    formData.append('batch_id', batch_id);
    formData.append('_id', _id);
    formData.append('date', _today);
    formData.append('time', time);
    formData.append('datasets', blob, `${compdata}.png`);

    try {
      const response = await urlSocket.post("/object_detection", formData, {
        headers: {
          "content-type": "multipart/form-data",
        },
        mode: "no-cors",
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));
      this.setState({ res_message: response.data.detection_result, showstatus: true });      
      if (response.data.detection_result === 'No Object Found') {
        console.log('else_dec_res', this.state.res_message);
        setTimeout(() => {
          this.cont_apiCall();
        }, 1000);
      } else if (response.data.detection_result === "Object Detected") {
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
          output_img_path: response.data.res_img_path,
          // dur:response.data.duration,
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
    const { modelData, manual_abort, time_elapsed, batch_id, config } = this.state;
    if (manual_abort || time_elapsed) {
      return;
    }
    let count = this.state.initvalue1++;
    const imageSrc = this.webcam.getScreenshot();
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
    formData.append('count', count);
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
      console.log(`success`, response.data);

      await new Promise((resolve) => setTimeout(resolve, 2000));
      this.setState({ res_message: response.data.detection_result, showstatus: true });

      if (response.data.detection_result === 'No Object Found') {
        console.log('else_dec_res', this.state.res_message);

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
    let count_value = this.state.initvalue2++
    console.log('yes', data, this.state.sample_count, count_value)
    console.log('2710 D : this.state.collection, data, this.state.batch_id, this.state.response_message : ', this.state.collection, data, this.state.batch_id, this.state.response_message)
    this.setState({ response_message: '', sample_count: count_value })
    if (data === 'yes') this.agree_not(this.state.collection, data, this.state.batch_id, this.state.response_message);
    else this.agree_not(this.state.collection, data, this.state.batch_id, this.state.response_message);
  }

  agree_not = (data, datas, batch_id, result) => {
    const { modelData, config } = this.state;
    //let count = this.state.initvalue
    console.log('batch_id479', batch_id)
    try {
      urlSocket.post('/agree_not', { '_id': data, 'agree': datas, 'batch_id': batch_id, 'config': config, 'modelData': modelData, 'result': result },
        { mode: 'no-cors' })
        .then((response) => {
          let data = response.data
          console.log('config_data485', data)
          let summary_ok = _.map(data, function (o) {
            if (o.result == config[0].positive)
              return o;
          });
          summary_ok = _.without(summary_ok, undefined)
          console.log('summary', summary_ok)
          if (summary_ok.length !== 0) {
            this.setState({ get_a: summary_ok[0].ok, get_d: summary_ok[0].agree, get_g: summary_ok[0].disagree })
          }
          let summary_notok = _.map(data, function (o) {
            if (o.result == config[0].negative)
              return o;
          });
          summary_notok = _.without(summary_notok, undefined)
          console.log('summary', summary_notok)
          if (summary_notok.length !== 0) {
            this.setState({ get_b: summary_notok[0].notok, get_e: summary_notok[0].agree, get_h: summary_notok[0].disagree })
          }
          let summary_posbl_match = _.map(data, function (o) {
            if (o.result == config[0].posble_match)
              return o;
          });
          summary_posbl_match = _.without(summary_posbl_match, undefined)
          if (summary_posbl_match.length !== 0) {
            this.setState({ get_c: summary_posbl_match[0].posbl_match, get_f: summary_posbl_match[0].qc_ok, get_i: summary_posbl_match[0].qc_notok })
          }
          let train_acc = ((Number(this.state.get_d) + Number(this.state.get_e)) / Number(this.state.sample_count)) * 100
          this.setState({ train_accuracy: train_acc, show_acc: true })
          if (config[0].inspection_type === 'Manual') {
            if (Number(this.state.sample_count) !== Number(config[0].test_samples)) {
              this.cont_apiCall()
            }
            else if (Number(this.state.sample_count) === Number(config[0].test_samples)) {
              if ((((Number(this.state.get_d) + Number(this.state.get_e)) / config[0].test_samples) * 100) !== 100) {
                //console.log('first555', this.state.get_d, this.state.get_e, this.state.config[0].test_samples, config[0].test_samples)
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
              if ((((Number(this.state.get_d) + Number(this.state.get_e)) / config[0].test_samples) * 100) !== 100) {
                //console.log('first555', this.state.get_d, this.state.get_e, this.state.config_data[0].test_samples)
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


  navigateto = () => {
    const { modelData, config, gotoPage } = this.state

    try {
      urlSocket.post('/status_change', { 'modelData': modelData, 'config': config },
        { mode: 'no-cors' })
        .then((response) => {
          let data = response.data
          console.log('approved', data)
          this.setState({ startCapture: false })

          if (gotoPage === 'modelcreation') {
            const { history } = this.props
            console.log(this.props)
            history.push("/modelCreation")
          }
          else{
            const { history } = this.props
            console.log(this.props)
            history.push("/modelVerInfo")
          }
        })
        .catch((error) => {
          console.log(error)
        })
    } catch (error) {
      console.log("----", error)
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
          let inspected_data = response.data
          console.log("insp_data", inspected_data)
        })
        .catch((error) => {
          console.log(error)
        })
    } catch (error) {
      console.log(error)
    }
  }

  trainClick = async (event) => {
    const { modelData, config } = this.state
    try {
      urlSocket.post('/re_train', { 'modelData': modelData, 'config': config },
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
    const {gotoPage} = this.state;
    if (gotoPage === 'modelcreation') {
      const { history } = this.props
      console.log(this.props)
      history.push("/modelCreation")
    }
    else{
      const { history } = this.props
      console.log(this.props)
      history.push("/modelVerInfo")
    }
  }

  manual_abortTesting = async (event) => {
    this.setState({ startcapture: false, show: false, showdata: false, showstatus: false, showresult: false })
    console.log('batch_id', this.state.batch_id)
    const { modelData, config } = this.state
    let batch_id = this.state.batch_id
    // let comp_data = this.state.comp_info
    let comp_name = modelData.comp_name
    let comp_code = modelData.comp_code
    // positive = config.positive
    // negative = config.negative
    // posble_match = config.posble_match
    //console.log('posble_match407', posble_match)
    try {
      urlSocket.post('/manual_abort', { 'batch_id': batch_id, 'comp_name': comp_name, 'comp_code': comp_code, 'positive': config[0].positive, 'negative': config[0].negative, 'posble_match': config[0].posble_match },
        { mode: 'no-cors' })
        .then((response) => {
          let aborted_data = response.data
          console.log("aborted_data_326", aborted_data)
          this.setState({ auto_abort: aborted_data, manual_abort: true, startcapture: false, show: false, showdata: false })
          //this.navigation()
        })
        .catch((error) => {
          console.log(error)
        })
    } catch (error) {
    }
  }

  navigation = () => {
    this.setState({ startcapture: false, show: false })
    const { modelData, gotoPage } = this.state
    console.log('modelData', modelData)
    try {
      urlSocket.post('/status_update', { 'model_data': modelData, 'status': 'training completed' },
        { mode: 'no-cors' })
        .then((response) => {
          let data = response.data
          console.log('abort', data)
          this.setState({ startCapture: false })
          if (gotoPage === 'modelcreation') {
            const { history } = this.props
            console.log(this.props)
            history.push("/modelCreation")
          }
          else{
            const { history } = this.props
            console.log(this.props)
            history.push("/modelVerInfo")
          }
        })
        .catch((error) => {
          console.log(error)
        })
    } catch (error) {
      console.log("----", error)
    }
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
    //console.log('test_duration', test_duration)   
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

  abortTesting = async (event) => {
    this.setState({ timeExtend: false })
    console.log('batch_id', this.state.batch_id)
    this.setState({ startcapture: false, show: false, showdata: false })
    const { modelData, config } = this.state
    let batch_id = this.state.batch_id
    // let comp_data = this.state.comp_info
    let comp_name = modelData.comp_name
    let comp_code = modelData.comp_code
    // positive = comp_data.positive
    // console.log('positive', positive)
    // negative = comp_data.negative
    // console.log('negative', negative)
    // posble_match = comp_data.posble_match
    // console.log('posble_match380', posble_match)
    try {
      urlSocket.post('/abort', { 'batch_id': batch_id, 'comp_name': comp_name, 'comp_code': comp_code, 'positive': config[0].positive, 'negative': config[0].negative, 'posble_match': config[0].posble_match },
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

  reTrainLimit = () => {
    this.setState({ ReTrain: false })
  }

  showImage = (output_img) => {
    let imgurl = ImageUrl
    return imgurl + output_img
  }


  render() {
    const { modelData, config } = this.state;
    const videoConstraints = {
      facingMode: "user"
    };

    console.log('object', modelData)
    return (
      <>
        <div className='page-content'>
          <Container fluid={true} style={{ minHeight: '100vh', background: 'white' }}>
            <CardTitle className="text-center" style={{ fontSize: 22, paddingTop: '20px' }}> ADMIN ACCURACY TESTING </CardTitle>
            <Card>
              <div>
                <Label>
                  Component Name: {modelData.comp_name} , Component Code: {modelData.comp_code} , Model Name: {modelData.model_name}
                </Label>
              </div>
            </Card>
            <div>
              <Row>
                <Col lg={6}>
                  <Card>
                    <Row>
                      <Col md={1}>
                        <Button color="primary" onClick={() => this.manual_abortTesting()}>Abort</Button>
                      </Col>
                      <Col md={3}>
                        {
                          this.state.extendTimer ?
                            <Button color="primary" onClick={() => this.extendTimer()}>Extend Timer</Button> : null
                        }
                      </Col>
                      <Col md={5} style={{ textAlign: 'right' }}>
                        <Row style={{ textAlign: 'right' }}>
                          <Col md={6} style={{ textAlign: 'right', paddingTop: '17px' }}>Time to complete:</Col>
                          <Col md={6} style={{ textAlignLast: 'center' }}>
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
                    </Row>
                    <Row>
                      <Col md={12} style={{ textAlign: 'right' }}>
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
                      </Col>
                    </Row>
                    <Row>
                      <Col md={12} style={{ textAlign: 'right' }}>
                        {
                          this.state.show_acc ?

                            <div style={{
                              color:
                                this.state.train_accuracy === 100.00 === true ? 'green' :
                                  this.state.train_accuracy !== 100.00 === true ? 'red' :
                                    null
                            }}>
                              Training accuracy: {parseFloat(this.state.train_accuracy).toFixed(2)}%
                            </div> : null
                        }
                      </Col>
                    </Row>
                    <Row>
                      <div className='containerImg'>
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
                                    this.state.res_message === "No Object Found" ? 'yellow' :
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
                        <Webcam
                          videoConstraints={videoConstraints}
                          audio={false}
                          height={'auto'}
                          screenshotFormat="image/png"
                          width={'100%'}
                          ref={node => this.webcam = node}
                        />
                      </div>
                    </Row>
                    <br />
                    <Row style={{ textAlign: 'end' }}>
                      <Col md={6}>
                        {
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
                <Col lg={6}>
                  <Card>
                    <img src={modelData.datasets === undefined ? "" : modelData.datasets.length !== 0 ? this.getImage(modelData.datasets) : ""} />
                  </Card>
                </Col>
              </Row>
            </div>
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
            {/* SweetAlert for positive result */}
            {this.state.response_message === this.state.positive &&
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
                  style={{ zIndex: 996 }}
                >
                {
                  this.state.output_img_path !== '' &&
                  <div>
                    <img style={{ width: '100%' }} src={this.showImage(this.state.output_img_path)}></img>
                  </div>
                }
                  <div
                    style={{
                      fontSize: '20px',
                      color:
                        this.state.response_message === this.state.positive
                          ? 'green'
                          : null,
                    }}
                  >
                    Result: {this.state.response_message} {this.state.response_value}{' '}
                    <CheckCircleOutlined style={{ fontSize: '40px' }} />
                  </div>
                  <div style={{ fontSize: '22px' }}>
                    Do you agree with the result?
                  </div>
                </SweetAlert>
              )}

            {/* SweetAlert for negative result */}
            {this.state.response_message === this.state.negative &&
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
                {
                  this.state.output_img_path !== '' &&
                  <div>
                    <img style={{ width: '100%' }} src={this.showImage(this.state.output_img_path)}></img>
                  </div>
                }
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
                    Do you agree with the result?
                  </div>
                </SweetAlert>
              )}

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
                (((Number(this.state.get_d) + Number(this.state.get_e)) / data.test_samples) * 100) !== 100 &&
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
                      Training accuracy result
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
                    <div>{data.posble_match}: {this.state.get_c} </div>
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
                    </div>
                    <Label style={{ color: 'red', fontSize: '18px' }}>
                      Training accuracy: {parseFloat(((Number(this.state.get_d) + Number(this.state.get_e)) / data.test_samples) * 100).toFixed(2)} %, {" "}
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
                (((Number(this.state.get_d) + Number(this.state.get_e)) / data.test_samples) * 100) === 100 &&
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
                      Training accuracy result
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
                    <div>{data.posble_match}: {this.state.get_c} </div>
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
                    </div>
                    <Label style={{ color: 'green', fontSize: '18px' }}>
                      Training accuracy: {((Number(this.state.get_d) + Number(this.state.get_e)) / data.test_samples) * 100}%, {" "}
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
                  <div>
                    Training has been attempted more than three times
                  </div>
                </SweetAlert> : null
            }
          </Container>
        </div>
      </>
    )
  }
}

export default adminAccTesting