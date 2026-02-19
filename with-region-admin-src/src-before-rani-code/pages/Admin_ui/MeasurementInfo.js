import React, { Component, createRef } from "react";
import {
  Container, CardTitle, Button, Row, Col, Offcanvas,
  OffcanvasHeader, OffcanvasBody, Label, Input, Form, Modal,
  ModalHeader, ModalBody, ModalFooter, CardBody, Card,
  CardText, CardHeader,
  Collapse,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Spinne,
  Spinner,
  ButtonGroup,
  Progress,
  Badge,
  Table,
} from "reactstrap";
import urlSocket from "../AdminInspection/urlSocket";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import "assets/css/admin_ui.css";
import PointCloudPlot from "./PointCloudPlot";
import toastr from "toastr";
import { Popconfirm, Button as AntdBtn, Checkbox } from "antd";
import classnames from "classnames"
import CountdownTimer from "react-component-countdown-timer";
import 'components/VerticalLayout/SidebarContent.css';
import { FaEdit, FaTimes, FaTrashAlt } from "react-icons/fa";
import SweetAlert from "react-bootstrap-sweetalert";
import MasterInfoModal from "./Features/MasterInfoModal";
import OneDTwoDRunoutResults from "./Features/OneDTwoDRunoutResults";
import Breadcrumbs from "components/Common/Breadcrumb";



export default class MeasurementInfo extends Component {
  static propTypes = { history: PropTypes.any.isRequired };
  constructor(props) {
    super(props);
    this.state = {
      comp_name: "",
      comp_code: "",
      compModelInfo: [],
      status: false,
      connection: false,
      connecting: false,
      isRightCanvas: false,
      singleshotLoading: false,
      intervalShot: false,
      inspBasedOn: 'rotation',
      counter: false,
      startLeadTime: false,
      numberOfTriggers: 10,
      timeDuration: 2,
      exposure_time: 150,
      measuring_rate: 200,
      noOfRotation: 3,
      leadTime: 3,
      sensorIP: "172.16.1.199",
      temp_insp_type: 'rotation',
      temp_time_duration: 2,
      temp_lead_time: 3,
      temp_no_of_rotation: 3,
      errors: {
        numberOfTriggers: '',
        exposure_time: '',
        measuring_rate: '',
        sensorIP: '',
        temp_time_duration: '',
        temp_lead_time: '',
        temp_no_of_rotation: '',
      },
      testing: false,
      testing_region: [],
      start_test: false,
      test_id: '',
      isMastering: false,
      mastering: '',
      isReboot: false,
      openPopConfirm: false,
      boxes: [],
      draggingBoxId: '',
      isDragging: false,
      col1: true,
      col2: false,
      openPopConfirms: {},
      activeTab: "1",
      appSettingActiveTab: "1",
      end_testing: false,
      showEditInspType: false,
      profileNo: '',
      done_rotation: 0,
      isRotationStarted: 0, // 0 - not started, 1 - in progress, 2 - completed

      capturedFileId: '',
      isLoadingProfile: false,
      isCapturing: false,

      editMode: false,
      showDeleteMaster: false,
      comp_assigned_stations: [],
      showMasterInfo: false,
      regionInfo: [],
      tempValues: {},
      show_one_d_result: false,
      one_d_runout: {},
      two_d_runout: [],
      combinedSensor: false,
      stop_mastering_process: false,
      is_combined_trigger: false,
    };

    this.toggleRightCanvas = this.toggleRightCanvas.bind(this);
    this.t_col1 = this.t_col1.bind(this);
    this.t_col2 = this.t_col2.bind(this);
    this.pointCloudPlotRef = React.createRef(); // Create a ref to the PointCloudPlot component
    this.reconnectionIntervalId = null
  }

  componentDidMount() {
    let data = JSON.parse(sessionStorage.getItem("manageData"));
    // let data = manageData;
    console.log("2510 D : dataSessionStorage : ", data);
    let compInfo = data.compInfo;
    this.setState({
      comp_name: compInfo.comp_name,
      comp_code: compInfo.comp_code,
      compInfo,
      testing: data.test,
      editMode: compInfo?.mastering_status == 'not_started' ? true : false,
      activeTab: compInfo?.mastering_status == 'completed' ? "2" : "1",

    }, () => {
      this.runoutAndRegion(compInfo._id)
    });
    window.addEventListener('beforeunload', this.handleBeforeUnload);

    // Handle navigation within the app
    this.unblock = this.props.history.block((location, action) => {
      if (this.state.editMode) {
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
      return undefined; // Allows navigation if not in editMode
    });
  }

  componentWillUnmount() {

    if (this.state.connection) {
      try {
        this.disconnectSensor('yes');
      } catch (error) {
        console.log('Error in willunmount')
      }
    }
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    if (this.unblock) {
      this.unblock();
    }
    // window.removeEventListener('beforeunload', this.closeWindow);
  }

  runoutAndRegion = async (id) => {
    // if (this.state.testing){
    try {
      const response = await urlSocket.post("/get_region_data", { 'id': id }, {
        mode: "no-cors",
      });
      const data = response.data;

      console.log("testing info data ", data);
      // ********* new one included in 18-09-24 ******************
      this.setState(prevState => ({
        // isRightCanvas: !prevState.isRightCanvas, 
        errors: {
          numberOfTriggers: '',
          exposure_time: '',
          measuring_rate: '',
          sensorIP: '',

          temp_time_duration: '',
          temp_lead_time: '',
          temp_no_of_rotation: '',
        },
        exposure_time: data[0].exposure_time,
        measuring_rate: data[0].measuring_rate,
        numberOfTriggers: data[0].number_of_triggers,
        timeDuration: data[0].time_duration,
        noOfRotation: data[0].no_of_rotation,
        leadTime: data[0].lead_time,
        sensorIP: data[0].sensor_ip,
        inspBasedOn: data[0].insp_based_on,
        compInfo: data[0],
        appSettingActiveTab: "1"
      }));
      // ******************************************

      if (data.length > 0 && data[0].mastering_status == 'completed') {
        const reducedData = data[0].region_datas.map((reg_value, index) => {
          return reg_value
        });
        console.log("testing info reducedData ", reducedData);
        this.setState({ testing_region: reducedData })
        if (this.state.testing) { this.sensor_connect() }
      }
    } catch (error) {
      console.log(error);
    }
  }

  closeWindow = (event) => {
    if (this.state.connection) {
      event.preventDefault();
      event.returnValue = ''; // Prevents the default unload behavior

      // Show Swal confirmation
      Swal.fire({
        title: 'Are you sure?',
        text: 'If you close this page, the sensor will disconnect. Are you sure you want to proceed?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, close it!',
        cancelButtonText: 'No, keep it open',
      }).then((result) => {
        if (result.isConfirmed) {
          // If confirmed, allow the page to close
          window.removeEventListener('beforeunload', this.handleBeforeUnload);
          window.close(); // Or window.location.reload() if reloading
        }
      });

      return ''; // Some browsers require this for preventing unload
    }
  }

  // ********* new one included in 18-09-24 ******************

  handleBeforeUnload = (event) => {
    // Make the API call for sensor disconnection
    this.disconnectSensor();

    // Setting a message for the user (optional)
    event.preventDefault();
    event.returnValue = ""; // Standard for modern browsers

  };

  // ******************************************


  back = () => {
    if (this.state.connection) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'Sensor will be Disconnected',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        allowOutsideClick: true,
        allowEscapeKey: true,
      }).then((result) => {
        if (result.isConfirmed || result.dismiss === Swal.DismissReason.backdrop) {
          // this.disconnectSensor('yes');
          console.log("back is working");
          sessionStorage.removeItem('showSidebar')
          sessionStorage.setItem('showSidebar', false)
          sessionStorage.removeItem("type");
          this.props.history.push("/comp_admin");
        }
      });
    } else {
      console.log("back is working");
      sessionStorage.removeItem('showSidebar')
      sessionStorage.setItem('showSidebar', false)
      sessionStorage.removeItem("type");
      this.props.history.push("/comp_admin");
    }
  };


  sensor_connect = async () => {
    try {
      this.setState({ connecting: true })
      const response = await urlSocket.post("/connection",
        {
          '_id': this.state.compInfo._id,
          'exposure_time': this.state.exposure_time,
          'measuring_rate': this.state.measuring_rate,
          // 'exposure_time': this.state.compInfo.exposure_time,
          // 'measuring_rate': this.state.compInfo.measuring_rate,
        },
        { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
      let connection = response.data;
      console.log("connection : ", connection);
      this.setState({ connecting: false, connection: true, col1: true })
      await Swal.fire({
        title: 'Sensor Connected',
        icon: 'success',
        timer: 2000, // 2 seconds
        timerProgressBar: true,
        didClose: () => Swal.stopTimer()
      });
      clearInterval(this.reconnectionIntervalId);
      this.setState({ isReboot: false });
    } catch (error) {
      this.setState({ connecting: false })
      if (this.reconnectionIntervalId) {
        this.setState({ isReboot: true });
      } else {
        await Swal.fire({
          title: "Failed to connect to the sensor",
          text: 'Please try again',
          icon: 'error',
          timer: 3000, // 3 seconds
          timerProgressBar: true,
          didClose: () => Swal.stopTimer()
        });
      }
      console.log("error", error);
    }
  }

  disconnectSensor = async (value) => {
    try {
      const response = await urlSocket.post("/disconnection", null, {
        headers: {
          "content-type": "multipart/form-data",
        },
      });
      let connection_Sts = response.data;
      this.setState({ connection: false, col1: false });
      if (value) {
        console.log("connection_Sts : ", connection_Sts);
      } else {
        await Swal.fire({
          title: 'Sensor Disconnected',
          icon: 'success',
          timer: 2000, // 2 seconds
          timerProgressBar: true,
          didClose: () => Swal.stopTimer()
        });
        console.log("connection_Sts : ", connection_Sts);
      }
    } catch (error) {
      console.log("error", error);

    }
  }


  triggerSensor = async (shot) => {

    try {

      // this.setState({ singleshotLoading: true })
      const response = await urlSocket.post("/trigger", {
        headers: {
          "content-type": "multipart/form-data",
        },
        mode: "no-cors",
      });

    } catch (error) {
      console.log("error", error);
    }
  }

  intervalTrigger = async () => {
    try {
      if (!this.state.compInfo.time_duration) {
        Swal.fire({
          title: 'Trigger Interval & Time Duration Required',
          icon: 'warning',
          timer: 2000, // 2 seconds
          timerProgressBar: true,
          didClose: () => Swal.stopTimer()
        });
        return;
      }
      this.setState({ intervalShot: true })
      console.log('**testing ', this.state.testing)
      const isTesting = JSON.stringify(this.state.testing)
      const testingRegionString = JSON.stringify(this.state.testing_region)
      const formData = new FormData();
      formData.append('_id', this.state.compInfo._id);
      formData.append('numberOfTriggers', this.state.compInfo.number_of_triggers);
      formData.append('timeDuration', this.state.compInfo.time_duration);
      formData.append('comp_name', this.state.comp_name);
      formData.append('comp_code', this.state.comp_code);
      formData.append('testing', this.state.testing);
      formData.append('testing', isTesting);
      formData.append('testing_region', testingRegionString);
      const response = await urlSocket.post("/num_trigger", formData, {
        headers: {
          "content-type": "multipart/form-data",
        },
        mode: "no-cors",
      });
      let sensor_profile = response.data;
      if (this.state.testing) {
        this.setState({ start_test: true, test_id: sensor_profile })
      }
    } catch (error) {
      this.setState({ intervalShot: false })
    }
  }

  intervalTrigger2 = async () => {
    try {
      if (!this.state.compInfo.time_duration) {
        Swal.fire({
          title: 'Trigger Interval & Time Duration Required',
          icon: 'warning',
          timer: 2000, // 2 seconds
          timerProgressBar: true,
          didClose: () => Swal.stopTimer()
        });
        return;
      }
      this.setState({ intervalShot: true })
      console.log('**testing ', this.state.testing)
      const isTesting = JSON.stringify(this.state.testing)
      const testingRegionString = JSON.stringify(this.state.testing_region)
      const formData = new FormData();
      formData.append('_id', this.state.compInfo._id);
      formData.append('numberOfTriggers', this.state.compInfo.number_of_triggers);
      formData.append('timeDuration', this.state.compInfo.time_duration);
      formData.append('comp_name', this.state.comp_name);
      formData.append('comp_code', this.state.comp_code);
      formData.append('testing', this.state.testing);
      formData.append('testing', isTesting);
      formData.append('testing_region', testingRegionString);
      const response = await urlSocket.post("/num_trigger_2", formData, {
        headers: {
          "content-type": "multipart/form-data",
        },
        mode: "no-cors",
      });
      let sensor_profile = response.data;
      if (this.state.testing) {
        this.setState({ start_test: true, test_id: sensor_profile })
      }
    } catch (error) {
      this.setState({ intervalShot: false })
    }
  }

  changeIntervalStopState = async () => {
    this.setState({ intervalShot: false })
  }

  triggerSensorContly = async (second) => {
    try {
      const response = await urlSocket.post("/trigger_continuously", {
        headers: {
          "content-type": "multipart/form-data",
        },
        mode: "no-cors",
      });
      let sensor_profile = response.data;
      this.setState({ start_test: true })
      console.log("Sensor value : ", sensor_profile);
    } catch (error) {
      console.log("error", error);
      this.setState(prevState => ({
        status: !prevState.status,
        start_test: false
      }));
      await Swal.fire({
        title: 'Continuous trigger failed',
        text: 'Please Try again...',
        icon: 'error',
        timer: 2000, // 2 seconds
        timerProgressBar: true,
        didClose: () => Swal.stopTimer()
      });
    }
  }

  stopTrigger = async () => {
    try {
      const response = await urlSocket.post("/stop", {
        headers: {
          "content-type": "multipart/form-data",
        },
        mode: "no-cors",
      });
      let sensor_sts = response.data;
      console.log("Sensor Stopped sts: ", sensor_sts);
      await Swal.fire({
        title: 'Scanning Stopped',
        icon: 'success',
        timer: 2000, // 2 seconds
        timerProgressBar: true,
        didClose: () => Swal.stopTimer()
      });
      this.setState({
        counter: false,
        start_test: false,
        intervalShot: false
      })
    } catch (error) {
      console.log("error", error);
    }
  }

  sensore_reset = async () => {
    try {
      const response = await urlSocket.post("/reset",
        { '_id': this.state.compInfo._id },
        { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
      console.log("Sensor reset sts: ", response.data);
      this.setState({
        compInfo: response.data.comp_info,
        // isRightCanvas: false,
        // exposure_time: 150, measuring_rate: 200
        exposure_time: 150, measuring_rate: 200
      })
      await Swal.fire({
        title: 'Reset',
        text: 'The sensor has been reset.',
        icon: 'success',
        timer: 2000, // 2 seconds
        timerProgressBar: true,
        didClose: () => Swal.stopTimer()
      });
    } catch (error) {
      console.log("error", error);
      await Swal.fire({
        title: 'Reset Failed!',
        text: 'Try again...',
        icon: 'error',
        timer: 2000, // 2 seconds
        timerProgressBar: true,
        didClose: () => Swal.stopTimer()
      });
    }
  }



  sensore_reboot = async () => {
    this.setState({ openPopConfirm: {} });
    try {
      const response = await urlSocket.post("/reboot", { 'comp_id': this.state.compInfo._id }, {
        headers: {
          "content-type": "multipart/form-data",
        },
        mode: "no-cors",
      });
      let reboot = response.data;
      console.log("Sensor reboot sts: ", reboot);
      if (reboot.status === 'reboot completed') {
        this.setState({
          connection: true
          // isRightCanvas: false 
        })
        await Swal.fire({
          title: 'Reboot',
          text: 'The sensor has been reboot.',
          icon: 'success',
          timer: 2000, // 2 seconds
          timerProgressBar: true,
          didClose: () => Swal.stopTimer()
        });
      }
      else {
        this.setState({
          connection: false
        })
        await Swal.fire({
          title: 'Reboot success',
          text: 'Please Conne',
          icon: 'error',
          timer: 2000, // 2 seconds
          timerProgressBar: true,
          didClose: () => Swal.stopTimer()
        });
      }
    } catch (error) {
      console.log("error", error);
    }
  }



  configUpdate = async (e, value) => {
    if (value) {
      console.log('inside if_______________________')
      try {
        const inputValue = e.target.value;
        let errors = { ...this.state.errors };
        if (value == 1) {
          if (inputValue == '') {
            errors.numberOfTriggers = 'value cannot be set to empty'
          } else if (inputValue < 1) {
            errors.numberOfTriggers = 'value cannot be less than 1'
          } else {
            errors.numberOfTriggers = ''
          }
          this.setState({ numberOfTriggers: inputValue, errors })
        }

        else if (value == 'sensor_ip') {
          if (inputValue == '') {
            errors.sensorIP = 'value cannot be set to empty'
          }
          else {
            errors.sensorIP = ''
          }
          this.setState({ sensorIP: inputValue, errors })
        }
        else if (this.state.connection) {
          if (value == 3) {
            if (inputValue == '') {
              errors.exposure_time = 'value cannot be set to empty'
            } else if (inputValue < 10 || inputValue > 10000) {
              errors.exposure_time = 'enter the value from 10 to 10000'
            } else {
              errors.exposure_time = ''
            }
            this.setState((prevState) => ({
              tempValues: {
                ...prevState.tempValues,
                exposure_time: inputValue,
              },
              errors
            }));
            // this.setState({ exposure_time: inputValue, errors })
          }
          else if (value == 4) {
            if (inputValue == '') {
              errors.measuring_rate = 'value cannot be set to empty'
            } else if (inputValue < 1 || inputValue > 2000) {
              errors.measuring_rate = 'enter the value from 1 to 2000'
            } else {
              errors.measuring_rate = ''
            }
            console.log('first691', errors)
            this.setState((prevState) => ({
              tempValues: {
                ...prevState.tempValues,
                measuring_rate: inputValue,
              },
              errors
            }));
            // this.setState({ measuring_rate: inputValue, errors })
          }
        }


      } catch (error) {
        console.log("error", error);
      }
    }
    else {
      let errors = { ...this.state.errors };
      const { name, value } = e.target;

      const validateInput = (name, value) => {
        if (value === '') {
          return 'value cannot be set to empty';
        } else if (value <= 0 || value > 100) {
          return 'enter the value from 1 to 100';
        }
        return '';
      };

      // Validate the inputs
      errors[name] = validateInput(name, value);
      this.setState({ [name]: value, errors });
      // if (["timeDuration", "noOfRotation", "leadTime"].includes(name)) {
      // }
    }

  }

  // ******************************************


  changeStatus = async () => {

    const isStop = this.state.status;
    this.setState({ status: !isStop })
    if (!isStop) {
      await this.triggerSensorContly();
    } else if (isStop) {
      await this.stopTrigger();
    }
  }

  changeConnection = async () => {
    const isStop = this.state.connection;
    // this.setState({ connection: !isStop})
    if (!isStop) {
      await this.sensor_connect();
    } else if (isStop) {
      await this.disconnectSensor();
    }
  }



  toggleRightCanvas = async () => {
    const { compInfo, exposure_time, measuring_rate } = this.state;
    this.setState(prevState => ({
      isRightCanvas: !prevState.isRightCanvas,
      errors: {
        numberOfTriggers: '',
        exposure_time: '',
        measuring_rate: '',
        sensorIP: '',

        temp_time_duration: '',
        temp_lead_time: '',
        temp_no_of_rotation: '',
      },

      numberOfTriggers: compInfo.number_of_triggers,
      temp_insp_type: this.state.inspBasedOn,
      temp_time_duration: this.state.timeDuration,
      temp_lead_time: this.state.leadTime,
      temp_no_of_rotation: this.state.noOfRotation,
      sensorIP: compInfo.sensor_ip,
      appSettingActiveTab: "1",
      tempValues: {
        exposure_time: exposure_time,
        measuring_rate: measuring_rate,
      }
    }));
  }

  // ******************************************

  toastSuccess = (title, message) => {
    // title = "Success"
    toastr.options.closeDuration = 8000
    toastr.options.positionClass = "toast-bottom-right"
    toastr.success(message, title)
  }

  toastError = (title, message) => {
    // let title = "Failed"
    toastr.options.closeDuration = 8000
    toastr.options.positionClass = "toast-bottom-right"
    toastr.error(message, title)
  }

  applicationConfig = async () => {
    const { errors, compInfo, numberOfTriggers, timeDuration, noOfRotation, leadTime } = this.state;
    const isValid = (
      errors.temp_time_duration === '' &&
      errors.temp_lead_time === '' &&
      errors.temp_no_of_rotation === ''
    );

    if (isValid) {
      this.setState({
        inspBasedOn: this.state.temp_insp_type,
        timeDuration: this.state.temp_time_duration,
        leadTime: this.state.temp_lead_time,
        noOfRotation: this.state.temp_no_of_rotation,
      });
      this.toastSuccess("Application Settings Applied Successfully!", '');
    } else {
      this.toastError("Failed to Submit! Please check your input.", '')
    }
  }

  sensorNetworkSettings = async () => {
    const { errors, compInfo, sensorIP } = this.state;
    const isValid = (errors.sensorIP === '');

    if (isValid) {
      const response = await urlSocket.post("/network_config", {
        '_id': compInfo._id,
        'sensorIP': sensorIP
      }, { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });

      const data = response.data.comp_info;
      console.log('response ', data);
      this.toastSuccess("Network Settings Applied Successfully!", '')
      this.setState({
        compInfo: data,
        sensorIP: data.sensor_ip
      });
    } else {
      this.toastError("Failed to Submit! Please check your input.", '')
    }
  }

  sensorConfig = async () => {
    if (!this.state.connection) {
      console.log('connection required *************');
      return;
    }
    const { errors, tempValues } = this.state;
    const isValid = (errors.exposure_time === '' && errors.measuring_rate === '');
    if (isValid) {
      const response = await urlSocket.post("/sensor_config", {
        '_id': this.state.compInfo._id,
        'ExposureTime': this.state.exposure_time,
        'measuring_rate': this.state.measuring_rate,
        // 'ExposureTime': this.state.exposure_time,
        // 'measuring_rate': this.state.measuring_rate,
        'connection': this.state.connection
      }, { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });

      const data = response.data;
      console.log('response ', data);
      this.toastSuccess("Sensor Settings Applied Successfully!", '')
      this.setState({
        exposure_time: data.exposure_time,
        measuring_rate: data.measuring_rate,
        // exposure_time: data.exposure_time,
        // measuring_rate: data.measuring_rate,
        // compInfo: data,
        // isRightCanvas: false,
      });
    } else {
      this.toastError("Failed to Submit! Please check your input.", '')
    }
  }


  // Box Plot Dragging

  handleDragStart = (id) => {
    this.setState({ draggingBoxId: id, isDragging: true });
  };

  setDraggingBoxId = (id) => {
    this.setState({ draggingBoxId: id });
  };

  setIsDragging = (isDragging) => {
    this.setState({ isDragging });
  };

  setBoxes = newBoxes => {
    console.log('newBoxes', newBoxes)
    this.setState({ boxes: newBoxes });
  };


  t_col1() {
    this.setState((prevState) => ({
      col1: !prevState.col1,
      col2: false, // Set col2 to false to close it when col1 is opened
    }));
  }


  t_col2() {
    const { compInfo } = this.state;
    this.setState({
      col1: false,
      col2: !this.state.col2,
      inspBasedOn: compInfo.insp_based_on,
      noOfRotation: compInfo.no_of_rotation,
      leadTime: compInfo.lead_time,
      timeDuration: compInfo.time_duration
    })
  }

  toggleRegionEdit = (e, item, index) => {
    // Call the toggleRightCanvas function from the PointCloudPlot component
    if (this.pointCloudPlotRef.current) {
      this.pointCloudPlotRef.current.toggleRightCanvas(e, item, index);
    }

  };

  regionDelete = (e, item, index) => {
    if (this.pointCloudPlotRef.current) {
      this.pointCloudPlotRef.current.deleteRegion(e, item, index);
    }
    this.setState({ openPopConfirm: {} });
  }

  togglePopConfirm = async (index, val) => {
    console.log('**********togglePopconfirm ', index, val)
    const popValue = { [index]: val == 0 ? true : false }
    this.setState({ openPopConfirm: popValue })
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
      })
    }
  }
  toggleApplicationSetting(tab) {
    if (this.state.appSettingActiveTab !== tab) {
      this.setState({
        appSettingActiveTab: tab,
      })
    }
  }

  showSettings = () => {
    this.setState(prevState => ({
      showEditInspType: !prevState.showEditInspType
    }))
  }

  triggerSensorContly1 = async (second) => {
    if (this.state.inspBasedOn === "time") {
      this.setState({ counter: true })
    }
    const testingRegionString = JSON.stringify(this.state.testing_region)
    const isTesting = JSON.stringify(this.state.testing)
    const formData = new FormData();
    formData.append('_id', this.state.compInfo._id);
    formData.append('numberOfTriggers', this.state.compInfo.number_of_triggers);
    formData.append('timeDuration', this.state.compInfo.time_duration);
    formData.append('noOfRotation', this.state.compInfo.no_of_rotation);
    formData.append('comp_name', this.state.comp_name);
    formData.append('comp_code', this.state.comp_code);
    formData.append('testing', isTesting);
    formData.append('testing_region', testingRegionString);
    try {
      const response = await urlSocket.post("/trigger_continuously1", formData, {
        headers: {
          "content-type": "multipart/form-data",
        },
        mode: "no-cors",
      });
      let sensor_profile = response.data;
      console.log("Sensor value : ", sensor_profile, this.state.testing);
      if (this.state.testing) {
        this.setState({ test_id: sensor_profile })
      } else {
        this.setState({ mastering: sensor_profile })
      }
      console.log("Sensor value : ", sensor_profile);


      // if (this.state.testing) {
      //   this.setState({ test_id: 'value' })
      // } else {
      //   this.setState({ mastering: 'value' })
      // }
    } catch (error) {
      console.log("error", error);
      if (this.state.inspBasedOn === "time") {
        this.setState({ counter: false })
      }
      if (this.state.status) {
        this.setState({ status: false })
      }
      if (this.state.isMastering) {
        this.setState({ isMastering: false })
      }
      this.setState(prevState => ({
        start_test: false
      }));
      await Swal.fire({
        title: 'Continuous trigger failed',
        text: 'Please Try again...',
        icon: 'error',
        timer: 2000, // 2 seconds
        timerProgressBar: true,
        didClose: () => Swal.stopTimer()
      });
    }
  }

  changeStatus1 = async (val) => {
    const { isMastering } = this.state;

    if (val === 'master') {
      // if (!isMastering) {
      this.setState({ isCapturing: true });
      await this.startMastering();

      // await this.triggerSensorContly1();
      // }
    }
    // else if (isMastering) {
    //   // // after rotation completed
    //   this.setState({ isMastering: false });
    //   // await this.stopTrigger();
    // }
  };

  start_lead_time = () => {
    console.log('startLeadTime')
    this.setState({ startLeadTime: true, isMastering: true })
  }

  onTimeup = () => {
    // // after timer completed - time based
    const isStop = this.state.status;
    // 'end_testing' ==> time_based_mastering_ends
    // to show tolerance setting modal, change end_testing to true
    this.setState({ status: false, counter: false, isRotationStarted: 2 })        // isMastering: false, end_testing: true,
    // this.stopTrigger();
  }

  // ********* new one included in 18-09-24 ******************

  // onTimeup1 = () => {
  //   this.setState({ startLeadTime: false});
  //   this.changeStatus1('master');
  //   // // exist if 'test' button in admin
  //   // if(!this.state.testing) {
  //   //   this.changeStatus1('master')
  //   // } else {
  //   //   this.changeStatus1('test')
  //   // }   
  // }  

  onTimeup1 = () => {
    this.setState({ startLeadTime: false, stop_mastering_process: false });
    if (this.state.inspBasedOn !== 'rotation') {
      this.setIsRotationStarted(1);
      this.changeStatus1('master');
    }
    else {
      this.start_rotation();
    }
  }

  start_rotation = async () => {
    console.log('this.state.compInfo._id', this.state.compInfo._id)
    let id = this.state.compInfo._id
    try {
      const response = await urlSocket.post("/start_rotate", 
        {
          'mastering_type': this.state.inspBasedOn,
          'rotation_count': this.state.noOfRotation,
        }, 
        { mode: "no-cors" });
      const data = response.data
      console.log('data945', data)
    } catch (error) {
      console.log('error', error)
    }
  }

  // ******************************************

  handleRadioChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
    // this.setState({ inspBasedOn: e.target.value });
  };

  disable_end_testing = () => {
    this.setState({ end_testing: false })
  }

  createRegion = () => {
    if (this.pointCloudPlotRef.current) {
      this.pointCloudPlotRef.current.handleBoxSelect();
    }

  }

  changeProfileNo = (value) => {
    this.setState({ profileNo: value })
  }

  setDoneRotation = (val) => {
    this.setState({ done_rotation: val })
  }

  setIsRotationStarted = (val) => {
    this.setState({ isRotationStarted: val })
  }


  startMastering = async () => {
    if (this.state.inspBasedOn === "time") {
      this.setState({ counter: true })
    }
    const formData = new FormData();
    if (this.state.inspBasedOn === 'rotation') {
      formData.append('_id', this.state.compInfo._id);
      formData.append('noOfRotation', this.state.noOfRotation);
    }
    else {
      formData.append('_id', this.state.compInfo._id);
      formData.append('timeDuration', this.state.timeDuration);
    }
    try {
      let response;
      if (this.state.inspBasedOn === 'rotation') {
        response = await urlSocket.post("/master_rotation", formData, {
          headers: {
            "content-type": "multipart/form-data",
          },
          mode: "no-cors",
        });
      }
      else {
        response = await urlSocket.post("/mastering_with_more_profiles", formData, {
          headers: {
            "content-type": "multipart/form-data",
          },
          mode: "no-cors",
        });
      }
      const capturedData = response.data;
      if (capturedData?.is_capturing === "1" && !this.state.stop_mastering_process) {
        this.setState({
          isCapturing: false,
          capturedFileId: capturedData.file_id,
          isLoadingProfile: true,
        });
      }
      console.log("Sensor value : ", capturedData);
      this.setState({ mastering: capturedData });

      if (!this.state.stop_mastering_process) {
        await this.startPlotting();
      }
    }
    catch (error) {
      console.log("error", error);
      if (this.state.inspBasedOn === "time") {
        this.setState({ counter: false })
      }
      if (this.state.isMastering) {
        this.setState({ isMastering: false, isCapturing: false })
      }
      this.setState({ isRotationStarted: 0 });
      await Swal.fire({ 
        // title: 'Mastering Failed', 
        // text: 'please try again...', 
        title: '<span style="font-size: 16px;">Mastering Failed</span>',
        html: `<span style="font-size: 14px;">please try again...</span>`,
        showConfirmButton: false, 
        customClass: {
          icon: 'swal-icon-small',
        },
        icon: 'error', timer: 2000, timerProgressBar: true, didClose: () => Swal.stopTimer() });
    }
  }
  // ***********************************************************************************************************


  startPlotting = async () => {
    try {
      const response = await urlSocket.post("/retrieve_and_process_data", {
        'comp_id': this.state.compInfo._id,
        'captured_file_id': this.state.capturedFileId
      }, { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });

    } catch (error) {
      if (this.state.inspBasedOn === "time") this.setState({ counter: false })
      if (this.state.isMastering) {
        this.setState({ isMastering: false, capturedFileId: '', isLoadingProfile: false })
      }
      this.setState({ isRotationStarted: 0 })
      await Swal.fire({
        // title: 'Mastering Failed',
        // text: 'please try again...',
        title: '<span style="font-size: 16px;">Mastering Failed</span>',
        html: `<span style="font-size: 14px;">please try again...</span>`,
        showConfirmButton: false,
        customClass: {
          icon: 'swal-icon-small',
        },
        icon: 'error', timer: 2000, timerProgressBar: true, didClose: () => Swal.stopTimer()
      });
    }

  }

  completePlotting = async (value, comp_data) => {
    if (value == 1) {
      this.setState({ isMastering: false, capturedFileId: '', isLoadingProfile: false, compInfo: comp_data, editMode: false })
    } else {
      this.setState({ isMastering: false, capturedFileId: '', isLoadingProfile: false })
    }
  }

  toggleAccordion = () => {
    this.setState((prevState) => ({ isAccordionOpen: !prevState.isAccordionOpen }));
  };

  changeEditMode = () => {
    this.setState({ editMode: true });
  }

  enableDeleteMaster = async () => {
    try {
      const { compInfo } = this.state;
      const response = await urlSocket.post("/get_comp_stations_mastered", {
        '_id': compInfo._id,
      }, { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
      this.setState({ showDeleteMaster: true, comp_assigned_stations: response.data });
    } catch (error) {
      console.log(error)
    }
  }

  clearMasterData = async () => {
    try {
      const response = await urlSocket.post("/clear_mastering", {
        '_id': this.state.compInfo._id,
      }, { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
      if (response.data.comp_data) {
        this.setState({ compInfo: response.data.comp_data, testing_region: [] })
      }
    } catch (error) {
      console.log(error)
    }
  }

  clearConfirmCancel = async (value, title_content) => {
    if (value == 'confirm') {
      await this.clearMasterData();
      this.setState({
        showDeleteMaster: false,
        success_dlg: true,
        dynamic_title: title_content,
        comp_assigned_stations: [],
        editMode: true,
      });
    } else if (value == 'cancel') {
      this.setState({
        showDeleteMaster: false,
        error_dlg: true,
        dynamic_title: title_content,
        comp_assigned_stations: []
      })
    }
  }

  enableMasterInfo = async () => {
    try {
      const response = await urlSocket.post("/show_master_info", {
        '_id': this.state.compInfo._id,
      }, { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
      console.log('master_info_____ ', response, response.data.comp_data);
      const region_datas = this.state.compInfo.region_datas.map((region) => ({
        regionName: region.name,
        maxValue: region.max_tolerence,
        minValue: region.min_tolerence,
      }));

      this.setState({
        showMasterInfo: true,
        comp_assigned_stations: response.data,
        regionInfo: region_datas
      })

    } catch (error) {
      console.log(error)
    }
  }

  hideMasterInfo = async () => {
    this.setState({
      showMasterInfo: false, comp_assigned_stations: [], regionInfo: []
    })
  }

  isButtonDisabled = () => {
    const { status, connection, intervalShot, isMastering, editMode } = this.state;
    return status || !connection || intervalShot || isMastering || !editMode;
  };


  // this is 1d sensor function

  singleSensor = () => {
    this.setState(prevState => ({ oneDsensor: !prevState.oneDsensor }), () => {
      console.log('oneDsensor1317', this.state.oneDsensor);
    });
  };

  oneDconnection = async () => {
    try {
      const response = await urlSocket.post("/oneDconnection", {
        '_id': this.state.compInfo._id,
        'exposure_time': this.state.compInfo.exposure_time,
        'measuring_rate': this.state.compInfo.measuring_rate,
      }, { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
      let data = response.data
      console.log('oneDresponse', data.message)
      if (data.message == 'Sensor connected successfully.') {
        this.setState({ combinedSensor: true })
        await Swal.fire({
          title: 'Sensor Connected',
          icon: 'success',
          timer: 2000, // 2 seconds
          timerProgressBar: true,
          didClose: () => Swal.stopTimer()
        });

      }
    } catch (error) {

      await Swal.fire({ title: 'One D Connection Failed', text: 'please try again...', icon: 'error', timer: 2000, timerProgressBar: true, didClose: () => Swal.stopTimer() });
    }
  }

  oneDDisconnection = async () => {
    try {
      const response = await urlSocket.post("/one_d_disconnection",
        { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
      console.log('1d and 2d disconnected', response)
      if (response.data.message === 'Sensor disconnected successfully.') {
        this.setState({ combinedSensor: false })
        await Swal.fire({
          title: 'Sensor DisConnected',
          icon: 'success',
          timer: 2000, // 2 seconds
          timerProgressBar: true,
          didClose: () => Swal.stopTimer()
        });
      }

    } catch (error) {
      await Swal.fire({ title: 'Failed to disconnect', text: 'please try again...', icon: 'error', timer: 2000, timerProgressBar: true, didClose: () => Swal.stopTimer() });
    }
  }

  combinedTest = async () => {
    this.setState({ is_combined_trigger: true })
    console.log('this.state.compInfo._id', this.state.compInfo._id)
    let id = this.state.compInfo._id
    if (this.state.inspBasedOn === 'time') {
      this.start1Dtest()
    } else {
      try {
        const response = await urlSocket.post("/start_rotate2", { '_id': id }, { mode: "no-cors" });
        const data = response.data
        console.log('data945', data)
      } catch (error) {
        console.log('error', error)
      }
    }
  }

  start1Dtest = async () => {
    const formData = new FormData();
    formData.append('timeDuration', this.state.timeDuration);
    formData.append('noOfRotation', this.state.noOfRotation);
    let response;
    try {
      if (this.state.inspBasedOn === 'time') {
        response = await urlSocket.post("/get-data", formData, { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
      }
      else {
        response = await urlSocket.post("/rotate_get-data", formData, { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
      }

      console.log('oneDresponse', response.data);
      this.setState({ capturedFileId: response.data.file_id, })   // ,()=>{this.startPlotting2}

      const one_d_runout = response.data.value;

      let two_d_runout;
      if (response.data.file_id) {
        const response_2 = await urlSocket.post("/filter_region_points",
          {
            'comp_id': this.state.compInfo._id,
            'captured_file_id': response.data.file_id,
            'regions': this.state.compInfo.region_datas,
          },
          { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
        console.log('runoutfrom2d ', response_2);
        two_d_runout = response_2.data.region_data;
      }

      this.setState({
        show_one_d_result: true,
        one_d_runout: one_d_runout,
        two_d_runout: two_d_runout,
        is_combined_trigger: false
      })

    } catch (error) {

      await Swal.fire({ 
        // title: 'Mastering Failed',
        //  text: 'please try again...', 
        title: '<span style="font-size: 16px;">Mastering Failed</span>',
        html: `<span style="font-size: 14px;">please try again...</span>`,
        customClass: {
          icon: 'swal-icon-small',
        },
        icon: 'error', timer: 2000, timerProgressBar: true, didClose: () => Swal.stopTimer() });
    }
  }

  clearBuffer = async () => {
    try {
      const response = await urlSocket.post("/one_d_clear_buffer", { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
      console.log('clearBuffer_________ ', response)
    } catch (error) {
      console.log(error)
    }
  }

  startPlotting2 = async () => {
    try {
      const response = await urlSocket.post("/retrieve_and_process_data", {
        'comp_id': this.state.compInfo._id,
        'captured_file_id': this.state.capturedFileId
      }, { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });

    } catch (error) {
      await Swal.fire({
        //  title: 'Mastering Failed', 
        //  text: 'please try again...', 
        title: '<span style="font-size: 16px;">Mastering Failed</span>',
        html: `<span style="font-size: 14px;">please try again...</span>`,
        customClass: {
          icon: 'swal-icon-small',
        },
         icon: 'error', timer: 2000, timerProgressBar: true, didClose: () => Swal.stopTimer() });
    }
  }

  view3D = async () => {
    try {
      const response = await urlSocket.post("/show_3d", {
        'file_id': this.state.compInfo.captured_file_id,
      }, { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
    } catch (error) {
      console.log(error)
    }
  }

  closeOneDResult = () => {
    this.setState({
      show_one_d_result: false,
      one_d_runout: {},
      two_d_runout: []
    })
  }

  stopMastering = async () => {
    this.setState({
      isMastering: false,
      isRotationStarted: 0,
      startLeadTime: false,
      isCapturing: false,
      counter: false,
      capturedFileId: '',
      isLoadingProfile: false,
      stop_mastering_process: true
    })
    try {
      const response = await urlSocket.post("/stop", {
        // 'file_id': this.state.compInfo.captured_file_id,
      }, { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
      await Swal.fire({
        title: 'Mastering Stopped',
        icon: 'success',
        showConfirmButton: false,
        timer: 2000, // 2 seconds
        timerProgressBar: true,
        allowOutsideClick: false,
        didClose: () => Swal.stopTimer()
      });
    } catch (error) {
      console.log(error)
    }
  }

  toggleStopMastering = () => {
    this.setState({ stop_mastering_process: false })
  }

  render() {
    const { errors } = this.state;
    return (
      <React.Fragment>
        {
          this.state.isReboot ?
            <div className="connection-overlay">
              <div className="connection-text text-center">Connecting...</div>
            </div>
            :
            <div className="page-content">
              <Breadcrumbs title="MEASUREMENT INFORMATION" isBackButtonEnable={true} gotoBack={() => { this.back() }} />
              <Container fluid>

                <Card>
                  <CardBody>
                    <Row className="mb-2">
                      <Col>
                        <CardTitle className="mb-0 "><span className="me-2 font-size-12">Component Name :</span>{this.state.comp_name}</CardTitle>
                        <CardText className="mb-0"><span className="me-2 font-size-11 fw-bold">Component Code :</span>{this.state.comp_code}</CardText>
                      </Col>
                      <Col className="text-end">
                        {/* <CardText className="mb-0 font-size-12 me-1">Capture Master Data</CardText>
                        <ButtonGroup>
                          <Input
                            type="text"
                            value={
                              this.state.inspBasedOn === 'rotation' ? `Rotation Based`
                                : this.state.inspBasedOn === 'time' ? `Time Based` : null
                            }
                            disabled
                          />
                          <Button color="primary"
                            onClick={
                              !this.state.isMastering
                                ? this.toggleRightCanvas
                                : null
                            }
                            style={{
                              cursor: this.state.isMastering ? "not-allowed" : "pointer"
                            }}
                          >
                            <span className="dripicons-document-edit"></span>
                          </Button>
                        </ButtonGroup> */}
                        <CardText className="mb-0"><span className="me-2 font-size-11">Mastered Data: :</span>
                            {
                              this.state.compInfo?.mastering_status === 'completed' ? (
                                <span className="badge badge-soft-success font-size-12">Available</span>
                              ) : this.state.compInfo?.mastering_status === 'not_started' ? (
                                <span className="badge badge-soft-danger font-size-12" pill>Not Available</span>
                              ) : null
                            }
                          </CardText>
                      </Col>
                    </Row>
                    {/* <Row>
                      <Col>
                        <CardText className="mb-1"><span className="mx-2 font-size-11">Mastered Data: :</span>
                          {
                            this.state.compInfo?.mastering_status === 'completed' ? (
                              <span className="badge badge-soft-success font-size-12">Available</span>
                            ) : this.state.compInfo?.mastering_status === 'not_started' ? (
                              <span className="badge badge-soft-danger font-size-12" pill>Not Available</span>
                            ) : null
                          }
                        </CardText>
                      </Col>
                    </Row> */}

                    <CardHeader className="mb-2">
                      <Row className="d-flex align-items-center">
                        {/* <Col>

                          <div className="d-flex align-items-center">
                            <p className='mt-1 ms-2' style={{ fontWeight: 'bold' }}>
                              Rotation Status:
                            </p>

                            <p
                              className={`ms-2 badge ${this.state.isRotationStarted === 0
                                ? "badge-soft-primary"
                                : this.state.isRotationStarted === 1
                                  ? "badge-soft-info"
                                  : this.state.isRotationStarted === 2
                                    ? "badge-soft-success"
                                    : ""
                                }`}
                              style={{ fontWeight: 'bold' }}
                            >
                              {this.state.isRotationStarted === 0
                                ? "Not Started"
                                : this.state.isRotationStarted === 1
                                  ? "In Progress..."
                                  : this.state.isRotationStarted === 2
                                    ? "Completed"
                                    : ""}
                            </p>

                          </div>
                        </Col> */}

                        {/* <Col>
                          <CardTitle className="mb-0 "><span className="me-2 font-size-12">Component Name :</span>{this.state.comp_name}</CardTitle>
                          <CardText className="mb-0 fw-bold"><span className="me-2 font-size-11">Component Code :</span>{this.state.comp_code}</CardText>
                          <CardText className="mb-0"><span className="me-2 font-size-11">Mastered Data: :</span>
                            {
                              this.state.compInfo?.mastering_status === 'completed' ? (
                                <span className="badge badge-soft-success font-size-12">Available</span>
                              ) : this.state.compInfo?.mastering_status === 'not_started' ? (
                                <span className="badge badge-soft-danger font-size-12" pill>Not Available</span>
                              ) : null
                            }
                          </CardText>
                        </Col> */}

                        <Col className="text-end">
                          {
                            this.state.compInfo?.mastering_status === 'completed' ?
                              <>
                                <Button color="primary" className="ms-1 btn-sm btn-label" onClick={() => this.changeEditMode()}
                                  disabled={this.state.status || !this.state.connection || this.state.isMastering}
                                >
                                  Edit
                                  <i className="bx bx-edit label-icon"></i>
                                </Button>
                                <Button color="danger" className="ms-1 btn-sm btn-label" onClick={() => this.enableDeleteMaster()}
                                  disabled={this.state.status || this.state.singleshotLoading || this.state.intervalShot || this.state.isMastering}
                                >
                                  Delete
                                  <i className="bx bx-trash label-icon"></i>
                                </Button>
                                <Button color="info" className="ms-1 btn-sm btn-label" onClick={() => this.enableMasterInfo()}
                                  disabled={this.state.status || this.state.singleshotLoading || this.state.intervalShot || this.state.isMastering}
                                >
                                  Info
                                  <i className="bx bx-info-circle label-icon"></i>
                                </Button>
                              </>
                              : null
                          }

                          {
                            this.state.compInfo?.mastering_status === 'not_started' || this.state.editMode ?
                              <>
                                <Button color="success" className="ms-1 btn-sm btn-label" onClick={this.createRegion}
                                  disabled={this.state.status || this.state.singleshotLoading || this.state.intervalShot || !this.state.connection || this.state.isMastering}
                                >
                                  Create Region
                                  <i className="dripicons-plus label-icon"></i>
                                </Button>

                                {
                                  this.state.connection && this.state.boxes?.length > 0 ?
                                    this.state.isMastering ?
                                      <Button color="danger" className="ms-1 btn-sm" onClick={() => { this.stopMastering() }} >
                                        {
                                          this.state.compInfo?.mastering_status == 'not_started' ? 'Stop Mastering' : 'Stop Re-Mastering'
                                        }
                                      </Button>
                                      :
                                      <Button color="warning" className="ms-1 btn-sm" onClick={() => { this.start_lead_time() }} >
                                        {
                                          this.state.compInfo?.mastering_status == 'not_started' ? 'Start Master' : 'Start Re-Master'
                                        }
                                      </Button>
                                    : null
                                }
                              </>
                              : null
                          }

                        </Col>
                      </Row>
                    </CardHeader>

                    <Row className="d-flex align-items-stretch">
                      <Col>
                        {
                          this.state.startLeadTime &&
                          <div className='d-flex align-items-center justify-content-center h-100' style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                            <div className='d-flex align-items-center me-2'>
                              Lead Time:
                            </div>
                            <div className='d-flex align-items-center'>
                              <CountdownTimer
                                hideDay={true}
                                hideHours={false}
                                count={this.state.leadTime}
                                onEnd={() => { this.onTimeup1() }}
                              />
                            </div>
                          </div>
                        }

                      </Col>

                      <Col>
                        <div
                          className="d-flex align-items-center justify-content-center h-100"
                          style={{
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          <div className="d-flex align-items-center me-2">
                            Rotation Status:
                          </div>
                          <div className="d-flex align-items-center">
                            <p
                              className={`d-flex align-items-center ms-2 badge ${this.state.isRotationStarted === 0
                                ? "badge-soft-primary"
                                : this.state.isRotationStarted === 1
                                  ? "badge-soft-info"
                                  : this.state.isRotationStarted === 2
                                    ? "badge-soft-success"
                                    : ""
                                }`}
                              style={{ fontWeight: 'bold', margin: '0' }}
                            >
                              {this.state.isRotationStarted === 0
                                ? "Not Started"
                                : this.state.isRotationStarted === 1
                                  ? "In Progress..."
                                  : this.state.isRotationStarted === 2
                                    ? "Completed"
                                    : ""}
                            </p>
                          </div>
                        </div>


                      </Col>

                      <Col>
                        {
                          this.state.counter &&
                          <div className='d-flex align-items-center justify-content-center h-100' style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                            <div className='d-flex align-items-center me-2'>
                              Capture Duration:
                            </div>
                            <div className='d-flex align-items-center'>
                              <CountdownTimer
                                hideDay={true}
                                hideHours={false}
                                count={this.state.timeDuration}
                                onEnd={() => { this.onTimeup() }}
                              />
                            </div>
                          </div>
                        }

                        <div>
                          {
                            this.state.inspBasedOn === 'rotation' &&
                            <div className="d-flex justify-content-start">
                              <p className='mt-1' style={{ fontWeight: 'bold' }}>
                                {`Rotation Completed: ${this.state.done_rotation}/${this.state.noOfRotation}`}
                              </p>
                            </div>
                          }
                        </div>
                      </Col>
                    </Row>

                    {
                      this.state.isCapturing &&
                      <div className="d-flex align-items-center justify-content-center">
                        <p className='mt-2 mb-0 ms-2 text-secondary' style={{ fontWeight: 'bold' }}> Capturing... </p>
                      </div>
                    }



                    <Card className="py-2">
                   

                      <div className="container-layout">
                        <div className="right-section">
                          <div className="position-relative">
                            <div className="icon-container">
                              <div className="btn-group">
                                <Button
                                  color={this.state.connection ? 'danger' : 'success'}
                                  // outline={this.state.modelfilter !== 0}
                                  className="btn-sm fw-bold"
                                  onClick={() => {
                                    this.changeConnection();
                                  }}
                                  disabled={this.state.status || this.state.singleshotLoading || this.state.intervalShot || this.state.isMastering || this.state.connecting}
                                >
                                  {
                                    !this.state.connecting ?
                                      this.state.connection ?
                                        <span className="mdi mdi-lan-disconnect fw-bold" >{'  '}Disconnect</span> :
                                        <span className="mdi mdi-lan-connect fw-bold" >{'  '}Connect</span> :
                                      <span className="mdi mdi-lan-connect fw-bold" >{'  '}Connecting...</span>
                                  }
                                </Button>

                                <Button
                                  // outline={this.state.modelfilter !== 0}
                                  className="btn-sm fw-bold"
                                  color="primary" onClick={this.toggleRightCanvas}
                                  disabled={this.state.status || this.state.singleshotLoading || this.state.intervalShot || this.state.isMastering}
                                >
                                  <span className="mdi mdi-cog-outline fw-bold">{'  '}Settings</span>
                                </Button>
                                <Button
                                  color="info"
                                  // outline={this.state.modelfilter !== 1}
                                  className="btn-sm fw-bold"
                                  style={{ cursor: this.state.connection ? 'pointer' : 'not-allowed' }}
                                  onClick={() => { this.triggerSensor() }}
                                  disabled={this.state.status || !this.state.connection || this.state.intervalShot || this.state.isMastering}
                                >
                                  <span className="bx bx-chart fw-bold"></span> {this.state.singleshotLoading ? <Spinner size="sm" /> : 'Single Shot'}
                                </Button>


                                <Button
                                  color={this.state.status ? 'danger' : 'success'}
                                  // outline={this.state.modelfilter !== 0}
                                  className="btn-sm fw-bold"
                                  style={{ cursor: this.state.connection ? 'pointer' : 'not-allowed' }}
                                  onClick={() => { this.changeStatus()}}
                                  disabled={!this.state.connection || this.state.singleshotLoading || this.state.intervalShot || this.state.isMastering}
                                >
                                  {this.state.status ? (
                                    <span className="mdi mdi-stop fw-bold">
                                      {'  '}Stop Capturing
                                    </span>
                                  ) : (
                                    <span className="mdi mdi-play fw-bold">
                                      {'  '}Start Capturing
                                    </span>
                                  )}


                                </Button>
                              </div>

                            </div>
                            {
                              this.state.compInfo && this.state.compInfo._id && !this.state.testing ? (
                                <PointCloudPlot
                                  ref={this.pointCloudPlotRef}
                                  comp_id={this.state.compInfo._id}
                                  regions={this.state.testing_region}

                                  boxes={this.state.boxes}
                                  draggingBoxId={this.state.draggingBoxId}
                                  isDragging={this.state.isDragging}
                                  setBoxes={this.setBoxes}
                                  setDraggingBoxId={this.setDraggingBoxId}
                                  setIsDragging={this.setIsDragging}
                                  stopIntervalShot={this.changeIntervalStopState}

                                  is_mastering={this.state.mastering}
                                  changeContTrigger={this.changeStatus1}
                                  disable_end_testing={this.disable_end_testing}
                                  no_of_rotation={this.state.noOfRotation}
                                  counter={this.state.counter}
                                  end_testing={this.state.end_testing}
                                  compInfo={this.state.compInfo}
                                  onTimeup={this.onTimeup}
                                  startLeadTime={this.state.startLeadTime}
                                  onTimeup1={this.onTimeup1}
                                  changeProfileNo={this.changeProfileNo}
                                  done_rotation={this.state.done_rotation}
                                  isRotationStarted={this.state.isRotationStarted}
                                  setDoneRotation={this.setDoneRotation}
                                  setIsRotationStarted={this.setIsRotationStarted}

                                  capturedFileId={this.state.capturedFileId}
                                  isLoadingProfile={this.state.isLoadingProfile}
                                  completePlotting={this.completePlotting}
                                  exposureTime={this.state.exposure_time}
                                  measuringRate={this.state.measuring_rate}

                                  timeDuration={this.state.timeDuration}
                                  noOfRotation={this.state.noOfRotation}
                                  leadTime={this.state.leadTime}
                                  inspBasedOn={this.state.inspBasedOn}

                                  start1Dtest={this.start1Dtest}

                                  stop_mastering_process={this.state.stop_mastering_process}
                                  toggleStopMastering={this.toggleStopMastering}
                                  isButtonDisabled={this.isButtonDisabled}
                                />
                              ) : null
                            }
                          </div>

                        </div>
                        <div className="left-section">


                          <div>
                            <CardText className="mb-1 font-size-12 me-1">Capture Master Data</CardText>
                            <ButtonGroup>
                              <Input
                                type="text"
                                value={
                                  this.state.inspBasedOn === 'rotation' ? `Rotation Based`
                                    : this.state.inspBasedOn === 'time' ? `Time Based` : null
                                }
                                disabled
                              />
                              <Button color="primary"
                                onClick={
                                  !this.state.isMastering
                                    ? this.toggleRightCanvas
                                    : null
                                }
                                style={{
                                  cursor: this.state.isMastering ? "not-allowed" : "pointer"
                                }}
                              >
                                <span className="dripicons-document-edit"></span>
                              </Button>
                            </ButtonGroup>
                          </div>

                          <div className="accordion my-3" id="accordion">
                            <div className="accordion-item">
                              <h2 className="accordion-header" id="headingOne">
                                <button
                                  className="btn btn-outline-primary w-100"
                                  onClick={this.t_col1}
                                  style={{
                                    cursor: this.isButtonDisabled() ? "not-allowed" : "pointer"
                                  }}
                                  disabled={this.isButtonDisabled()}
                                >
                                  <div className="d-flex justify-content-between">
                                    <div>Regions</div>
                                    <div>
                                      {this.state.col1 ? (
                                        <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368">
                                          <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
                                        </svg>
                                      ) : (
                                        <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368">
                                          <path d="m256-424-56-56 280-280 280 280-56 56-224-223-224 223Z" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              </h2>
                              {this.state.col1 && (
                                <Collapse isOpen={this.state.col1} className="accordion-collapse">
                                  <div className="accordion-body">
                                    <Row>
                                      <div style={{ maxHeight: '300px', overflowY: 'auto', width: '100%' }} className="pe-0 ps-0">
                                        {this.state.boxes.length > 0 ? (
                                          this.state.boxes.map((item, index) => (
                                            <Col
                                              key={index}
                                              style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                // backgroundColor: '#D3E3FD',
                                                background: 'rgb(211 227 253 / 54%)',
                                                color: '#fff',
                                                padding: '8px',
                                                margin: '4px',
                                                borderRadius: '2px',
                                                color: '#556EE6',
                                                width: '100%'
                                              }}
                                            >
                                              <span style={{ fontWeight: '500' }} >{item.name}</span>
                                              <div style={{ display: 'flex', gap: '5px' }}>
                                                <span
                                                  className="dripicons-document-edit"
                                                  style={{
                                                    cursor: this.isButtonDisabled() ? "not-allowed" : "pointer"
                                                  }}
                                                  onClick={
                                                    !this.isButtonDisabled()
                                                      ? (e) => this.toggleRegionEdit(e, item, index)
                                                      : null
                                                  }
                                                ></span>


                                                {!this.isButtonDisabled() ? (
                                                  <Popconfirm
                                                    placement="rightBottom"
                                                    title="Delete this region?"
                                                    onConfirm={(e) => this.regionDelete(e, item, index)}
                                                    onCancel={() => this.togglePopConfirm(index, 1)}
                                                    okText="Yes"
                                                    cancelText="No"
                                                    open={this.state.openPopConfirms[index]}
                                                  >
                                                    <span
                                                      className="dripicons-trash"
                                                      style={{ cursor: "pointer", color: 'red', fontSize: '8px' }}
                                                      onClick={() => this.togglePopConfirm(index, 0)}
                                                    ></span>
                                                  </Popconfirm>
                                                ) : (
                                                  <span
                                                    className="dripicons-trash"
                                                    style={{ cursor: "not-allowed", color: 'red' }}
                                                  ></span>
                                                )}

                                              </div>
                                            </Col>
                                          ))
                                        ) : (
                                          <p className="text-center w-100">No Region Draw</p>
                                        )}
                                      </div>
                                    </Row>
                                  </div>
                                </Collapse>
                              )}
                            </div>
                          </div>
                          {
                            this.state.compInfo?.mastering_status == 'completed' ?
                              <div className="text-end">
                                <Button color="primary" className="btn btn-sm" onClick={() => this.view3D()}>view 3D</Button>
                              </div>
                              : null
                          }
                        </div>
                      </div>




                      {/* <Row>
                        <Col md={10} className="position-relative">
                          <div className="icon-container">
                            <div className="btn-group">
                              <Button
                                color={this.state.connection ? 'danger' : 'success'}
                                outline={this.state.modelfilter !== 0}
                                className="btn-sm"
                                onClick={() => {
                                  this.changeConnection();
                                }}
                                disabled={this.state.status || this.state.singleshotLoading || this.state.intervalShot || this.state.isMastering || this.state.connecting}
                              >
                                {
                                  !this.state.connecting ?
                                    this.state.connection ?
                                      <span className="mdi mdi-lan-disconnect" >{'  '}Disconnect</span> :
                                      <span className="mdi mdi-lan-connect" >{'  '}Connect</span> :
                                    <span className="mdi mdi-lan-connect" >{'  '}Connecting...</span>
                                }
                              </Button>

                              <Button
                                outline={this.state.modelfilter !== 0}
                                className="btn-sm"
                                color="primary" onClick={this.toggleRightCanvas}
                                disabled={this.state.status || this.state.singleshotLoading || this.state.intervalShot || this.state.isMastering}
                              >
                                <span className="mdi mdi-cog-outline">{'  '}Settings</span>
                              </Button>
                              <Button
                                color="warning"
                                outline={this.state.modelfilter !== 1}
                                className="btn-sm"
                                style={{ cursor: this.state.connection ? 'pointer' : 'not-allowed' }}
                                onClick={() => { this.triggerSensor() }}
                                disabled={this.state.status || !this.state.connection || this.state.intervalShot || this.state.isMastering}
                              >
                                {this.state.singleshotLoading ? <Spinner size="sm" /> : 'Single Shot'}
                              </Button>


                              <Button
                                color={this.state.status ? 'danger' : 'success'}
                                outline={this.state.modelfilter !== 0}
                                className="btn-sm"
                                style={{ cursor: this.state.connection ? 'pointer' : 'not-allowed' }}
                                onClick={() => {
                                  this.changeStatus();
                                }}
                                disabled={!this.state.connection || this.state.singleshotLoading || this.state.intervalShot || this.state.isMastering}
                              >
                                {this.state.status ?
                                  <span className="dripicons-media-pause" >{'  '}Stop Capturing</span> :
                                  <span className="dripicons-media-play" >{'  '}Start Capturing</span>}
                              </Button>

                            </div>



                    
                          </div>
                          {
                            this.state.compInfo && this.state.compInfo._id && !this.state.testing ? (
                              <PointCloudPlot
                                ref={this.pointCloudPlotRef}
                                comp_id={this.state.compInfo._id}
                                regions={this.state.testing_region}

                                boxes={this.state.boxes}
                                draggingBoxId={this.state.draggingBoxId}
                                isDragging={this.state.isDragging}
                                setBoxes={this.setBoxes}
                                setDraggingBoxId={this.setDraggingBoxId}
                                setIsDragging={this.setIsDragging}
                                stopIntervalShot={this.changeIntervalStopState}

                                is_mastering={this.state.mastering}
                                changeContTrigger={this.changeStatus1}
                                disable_end_testing={this.disable_end_testing}
                                no_of_rotation={this.state.noOfRotation}
                                counter={this.state.counter}
                                end_testing={this.state.end_testing}
                                compInfo={this.state.compInfo}
                                onTimeup={this.onTimeup}
                                startLeadTime={this.state.startLeadTime}
                                onTimeup1={this.onTimeup1}
                                changeProfileNo={this.changeProfileNo}
                                done_rotation={this.state.done_rotation}
                                isRotationStarted={this.state.isRotationStarted}
                                setDoneRotation={this.setDoneRotation}
                                setIsRotationStarted={this.setIsRotationStarted}

                                capturedFileId={this.state.capturedFileId}
                                isLoadingProfile={this.state.isLoadingProfile}
                                completePlotting={this.completePlotting}
                                exposureTime={this.state.exposure_time}
                                measuringRate={this.state.measuring_rate}

                                timeDuration={this.state.timeDuration}
                                noOfRotation={this.state.noOfRotation}
                                leadTime={this.state.leadTime}
                                inspBasedOn={this.state.inspBasedOn}

                                start1Dtest={this.start1Dtest}

                                stop_mastering_process={this.state.stop_mastering_process}
                                toggleStopMastering={this.toggleStopMastering}
                                isButtonDisabled={this.isButtonDisabled}
                              />
                            ) : null
                          }
                        </Col>
                        <Col md={2} style={{ border: '1px solid #e9e9e9' }}>

                          <div className="accordion my-3" id="accordion">
                            <div className="accordion-item">
                              <h2 className="accordion-header" id="headingOne">
                                <button
                                  className="btn btn-outline-primary w-100"
                                  onClick={this.t_col1}
                                  style={{
                                    cursor: this.isButtonDisabled() ? "not-allowed" : "pointer"
                                  }}
                                  disabled={this.isButtonDisabled()}
                                >
                                  <div className="d-flex justify-content-between">
                                    <div>Regions</div>
                                    <div>
                                      {this.state.col1 ? (
                                        <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368">
                                          <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
                                        </svg>
                                      ) : (
                                        <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368">
                                          <path d="m256-424-56-56 280-280 280 280-56 56-224-223-224 223Z" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              </h2>
                              {this.state.col1 && (
                                <Collapse isOpen={this.state.col1} className="accordion-collapse">
                                  <div className="accordion-body">
                                    <Row>
                                      <div style={{ maxHeight: '300px', overflowY: 'auto', width: '100%' }}>
                                        {this.state.boxes.length > 0 ? (
                                          this.state.boxes.map((item, index) => (
                                            <Col
                                              key={index}
                                              style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                backgroundColor: 'rgb(67, 106, 225)',
                                                color: '#fff',
                                                padding: '10px',
                                                margin: '5px',
                                                borderRadius: '5px',
                                              }}
                                            >
                                              <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                                              <div style={{ display: 'flex', gap: '10px' }}>
                                                <span
                                                  className="dripicons-document-edit"
                                                  style={{
                                                    cursor: this.isButtonDisabled() ? "not-allowed" : "pointer"
                                                  }}
                                                  onClick={
                                                    !this.isButtonDisabled()
                                                      ? (e) => this.toggleRegionEdit(e, item, index)
                                                      : null
                                                  }
                                                ></span>


                                                {!this.isButtonDisabled() ? (
                                                  <Popconfirm
                                                    placement="rightBottom"
                                                    title="Delete this region?"
                                                    onConfirm={(e) => this.regionDelete(e, item, index)}
                                                    onCancel={() => this.togglePopConfirm(index, 1)}
                                                    okText="Yes"
                                                    cancelText="No"
                                                    open={this.state.openPopConfirms[index]}
                                                  >
                                                    <span
                                                      className="dripicons-trash"
                                                      style={{ cursor: "pointer", color: 'red' }}
                                                      onClick={() => this.togglePopConfirm(index, 0)}
                                                    ></span>
                                                  </Popconfirm>
                                                ) : (
                                                  <span
                                                    className="dripicons-trash"
                                                    style={{ cursor: "not-allowed", color: 'red' }}
                                                  ></span>
                                                )}

                                              </div>
                                            </Col>
                                          ))
                                        ) : (
                                          <p className="text-center w-100">No Region Draw</p>
                                        )}
                                      </div>
                                    </Row>
                                  </div>
                                </Collapse>
                              )}
                            </div>
                          </div>
                          {
                            this.state.compInfo?.mastering_status == 'completed' ?
                              <Button color="info" onClick={() => this.view3D()}>view 3D</Button>
                              : null
                          }
                        </Col>
                      </Row> */}

                    </Card>
                  </CardBody>
                </Card>
              </Container>






              <Modal isOpen={this.state.isRightCanvas} toggle={this.toggleRightCanvas}>
                <ModalHeader toggle={this.toggleRightCanvas}>
                  <div style={{ fontWeight: 'bold' }}>
                    <span className="mdi mdi-cog-outline me-2"></span>
                    Settings
                  </div>
                </ModalHeader>
                <ModalBody>
                  <Card
                    className={!this.state.editMode ? "border border-danger" : ""}
                    style={{ background: '#EFF2F7' }}
                  >
                    {
                      !this.state.editMode &&
                      <CardHeader className="bg-transparent border-danger">
                        <p className="my-0 text-danger">
                          <i className="mdi mdi-block-helper me-3"></i>
                          {`switch to edit mode to access this settings`}
                        </p>
                      </CardHeader>
                    }
                    <Nav tabs>
                      <NavItem>
                        <NavLink
                          style={{ cursor: "pointer" }}
                          className={classnames({
                            active: this.state.appSettingActiveTab === "1",
                          })}
                          onClick={() => {
                            this.toggleApplicationSetting("1")
                          }}
                          disabled={this.state.editMode ? false : true}
                        >
                          Application Settings
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          style={{ cursor: "pointer" }}
                          className={classnames({
                            active: this.state.appSettingActiveTab === "2",
                          })}
                          onClick={() => {
                            this.toggleApplicationSetting("2")
                          }}
                          disabled={this.state.editMode ? false : true}
                        >
                          Network Settings
                        </NavLink>
                      </NavItem>
                    </Nav>
                    <TabContent activeTab={this.state.appSettingActiveTab} className="p-3 text-muted">
                      <TabPane tabId="1">
                        <Row>
                          <Col sm="12">
                            <Form>
                              <p style={{ fontWeight: 'bold' }}>{`Choose Inspection Type: `}</p>
                              <div className="my-3">
                                <div className="row">
                                  <Col sm={6} md={6} lg={6}>
                                    <Label>
                                      <Input
                                        className="me-2"
                                        type="radio"
                                        name="temp_insp_type"
                                        value="rotation"
                                        checked={this.state.temp_insp_type === 'rotation'}
                                        onChange={this.handleRadioChange}
                                        disabled={this.state.editMode ? false : true}
                                      />
                                      {`Rotation Based`}
                                    </Label>
                                  </Col>
                                  <Col sm={6} md={6} lg={6}>
                                    <Label>
                                      <Input
                                        className="me-2"
                                        type="radio"
                                        name="temp_insp_type"
                                        value="time"
                                        checked={this.state.temp_insp_type === 'time'}
                                        onChange={this.handleRadioChange}
                                        disabled={this.state.editMode ? false : true}
                                      />
                                      {`Time Based`}
                                    </Label>
                                  </Col>
                                </div>
                              </div>
                              {
                                this.state.temp_insp_type === 'time' &&
                                <>
                                  <div className="row my-3">
                                    <Col sm={6} md={6} lg={6} className="mt-2">
                                      <Label className="">{`Time Duration (seconds)`}</Label>
                                    </Col>
                                    <Col sm={6} md={6} lg={6}>
                                      <Input
                                        type="number"
                                        placeholder="Enter time duration "
                                        name="temp_time_duration"
                                        value={this.state.temp_time_duration}
                                        onChange={(e) => this.configUpdate(e)}
                                        disabled={this.state.editMode ? false : true}
                                      />
                                      {errors?.temp_time_duration && (
                                        <p style={{ color: 'red' }}>*{errors.temp_time_duration}</p>
                                      )}
                                    </Col>
                                  </div>
                                  <div className="row my-3">
                                    <Col sm={6} md={6} lg={6} className="mt-2">
                                      <Label className="">{`Lead Time (seconds)`}</Label>
                                    </Col>
                                    <Col sm={6} md={6} lg={6}>
                                      <Input
                                        type="number"
                                        placeholder="enter lead time here"
                                        name="temp_lead_time"
                                        value={this.state.temp_lead_time}
                                        onChange={(e) => this.configUpdate(e)}
                                        disabled={this.state.editMode ? false : true}
                                      />
                                      {errors?.temp_lead_time && (
                                        <p style={{ color: 'red' }}>*{errors.temp_lead_time}</p>
                                      )}
                                    </Col>
                                  </div>
                                </>
                              }
                              {
                                this.state.temp_insp_type === 'rotation' &&
                                <>
                                  <div className="row my-3">
                                    <Col sm={6} md={6} lg={6} className="mt-2">
                                      <Label className="">{`No. of Rotation`}</Label>
                                    </Col>
                                    <Col sm={6} md={6} lg={6}>
                                      <Input
                                        type="number"
                                        placeholder="Enter no. of rotation "
                                        name="temp_no_of_rotation"
                                        value={this.state.temp_no_of_rotation}
                                        onChange={(e) => this.configUpdate(e)}
                                        disabled={this.state.editMode ? false : true}
                                      />
                                      {errors?.temp_no_of_rotation && (
                                        <p style={{ color: 'red' }}>*{errors.temp_no_of_rotation}</p>
                                      )}
                                    </Col>
                                  </div>
                                  <div className="row my-3">
                                    <Col sm={6} md={6} lg={6} className="mt-2">
                                      <Label className="">{`Lead Time (seconds)`}</Label>
                                    </Col>
                                    <Col sm={6} md={6} lg={6}>
                                      <Input
                                        type="number"
                                        placeholder="enter lead time here"
                                        name="temp_lead_time"
                                        value={this.state.temp_lead_time}
                                        onChange={(e) => this.configUpdate(e)}
                                        disabled={this.state.editMode ? false : true}
                                      />
                                      {errors?.temp_lead_time && (
                                        <p style={{ color: 'red' }}>*{errors.temp_lead_time}</p>
                                      )}
                                    </Col>
                                  </div>

                                </>
                              }
                              <div className="row justify-content-end">
                                <Col>
                                  <div>
                                    <Button color="primary" onClick={() => this.applicationConfig()}
                                      disabled={this.state.editMode ? false : true}
                                    >Apply</Button>
                                  </div>
                                </Col>
                              </div>
                            </Form>
                          </Col>
                        </Row>
                      </TabPane>
                      <TabPane tabId="2">
                        <Row>
                          <Col sm="12">
                            <Row>
                              <Col sm="12">
                                <Form>
                                  <div className="row my-3">
                                    <Col sm={6} md={6} lg={6} className="mt-2">
                                      <Label className="">{`Sensor IP-address`}</Label>
                                    </Col>
                                    <Col sm={6} md={6} lg={6}>
                                      <Input type="text" placeholder="Enter IP-address " value={this.state.sensorIP} onChange={(e) => this.configUpdate(e, 'sensor_ip')}
                                        disabled={this.state.editMode ? false : true}
                                      />
                                      {errors?.sensorIP && (
                                        <p style={{ color: 'red' }}>*{errors.sensorIP}</p>
                                      )}
                                    </Col>
                                  </div>
                                  <div className="row justify-content-end">
                                    <Col>
                                      <div>
                                        <Button color="primary" onClick={() => this.sensorNetworkSettings()}
                                          disabled={this.state.editMode ? false : true}
                                        >Apply</Button>
                                      </div>
                                    </Col>
                                  </div>
                                </Form>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </TabPane>
                    </TabContent>
                  </Card>
                  <Card
                    outline={!this.state.connection}
                    color={!this.state.connection ? "danger" : undefined}
                    className={!this.state.connection ? "border border-danger" : ""}
                    style={{ background: '#EFF2F7' }}
                  >
                    {
                      !this.state.connection &&
                      <CardHeader className="bg-transparent border-danger">
                        <p className="my-0 text-danger">
                          <i className="mdi mdi-block-helper me-3"></i>
                          {`sensor connection required to access this settings`}
                        </p>
                      </CardHeader>
                    }
                    <CardBody>
                      <CardTitle className="h4 mt-0">Sensor Settings</CardTitle>
                    </CardBody>
                    <Nav tabs>
                      {
                        this.state.editMode ?
                          <NavItem>
                            <NavLink
                              style={{ cursor: "pointer" }}
                              className={classnames({
                                active: this.state.activeTab === "1",
                              })}
                              onClick={() => {
                                this.toggle("1")
                              }}
                            >
                              Profile Settings
                            </NavLink>
                          </NavItem>
                          : null
                      }
                      <NavItem>
                        <NavLink
                          style={{ cursor: "pointer" }}
                          className={classnames({
                            active: this.state.activeTab === "2",
                          })}
                          onClick={() => {
                            this.toggle("2")
                          }}
                        >
                          General Settings
                        </NavLink>
                      </NavItem>
                    </Nav>
                    <TabContent activeTab={this.state.activeTab} className="p-3 text-muted">
                      {
                        this.state.editMode ?
                          <TabPane tabId="1">
                            <Row>
                              <Col sm="12">
                                <Form>
                                  <div className="row my-3">
                                    <Col sm={6} md={6} lg={6} className="mt-2">
                                      <Label>{`Exposure Time (µs)`}</Label>
                                    </Col>
                                    <Col sm={6} md={6} lg={6}>
                                      <Input
                                        type="number"
                                        placeholder="Enter Exposure Time "
                                        value={this.state.exposure_time}
                                        onChange={(e) => this.configUpdate(e, 3)}
                                        disabled={!this.state.connection}
                                      />
                                      {errors?.exposure_time && (
                                        <p style={{ color: 'red' }}>*{errors.exposure_time}</p>
                                      )}
                                    </Col>
                                  </div>
                                  <div className="row mb-3">
                                    <Col sm={6} md={6} lg={6} className="mt-2">
                                      <Label>{`Measuring Rate (Hz)`}</Label>
                                    </Col>
                                    <Col sm={6} md={6} lg={6}>
                                      <Input
                                        type="number"
                                        placeholder="Enter Measuring Rate "
                                        value={this.state.measuring_rate}
                                        onChange={(e) => this.configUpdate(e, 4)}
                                        disabled={!this.state.connection}
                                      />
                                      {errors?.measuring_rate && (
                                        <p style={{ color: 'red' }}>*{errors.measuring_rate}</p>
                                      )}
                                    </Col>

                                  </div>
                                  <div className="row justify-content-end">
                                    <Col>
                                      <div>
                                        <Button color="primary" onClick={() => this.sensorConfig()} disabled={!this.state.connection}>Apply</Button>
                                      </div>
                                    </Col>
                                  </div>
                                </Form>
                              </Col>
                            </Row>
                          </TabPane>
                          : null
                      }

                      <TabPane tabId="2">
                        <Row>
                          <Col sm="12">
                            <Form>
                              <div className="row my-3">
                                <Col sm={6} md={6} lg={6} className="mt-2">
                                  <Label>Reset Sensor Settings</Label>
                                </Col>
                                <Col sm={6} md={6} lg={6}>
                                  <Popconfirm
                                    placement="top"
                                    title="Confirm reset of sensor settings?"
                                    onConfirm={(e) => this.sensore_reset()}
                                    onCancel={() => this.togglePopConfirm('reset', 1)}
                                    okText="Yes"
                                    cancelText="No"
                                    open={this.state.openPopConfirms['reset']}
                                  >
                                    <Button
                                      color="info"
                                      style={{ cursor: this.state.connection ? 'pointer' : 'not-allowed', width: '100%' }}
                                      onClick={() => { this.togglePopConfirm('reset', 0) }}
                                      // onClick={() => { this.sensore_reset() }}
                                      disabled={this.state.status || !this.state.connection}
                                    >
                                      Reset
                                    </Button>
                                  </Popconfirm>
                                </Col>
                              </div>
                              <div className="row mb-3">
                                <Col sm={6} md={6} lg={6} className="mt-2">
                                  <Label>Restart</Label>
                                </Col>
                                <Col sm={6} md={6} lg={6}>
                                  <Popconfirm
                                    placement="top"
                                    title="Confirm sensor restart?"
                                    onConfirm={(e) => this.sensore_reboot()}
                                    onCancel={() => this.togglePopConfirm('reboot', 1)}
                                    okText="Yes"
                                    cancelText="No"
                                    open={this.state.openPopConfirms['reboot']}
                                  >
                                    <Button
                                      color="info"
                                      style={{ cursor: this.state.connection ? 'pointer' : 'not-allowed', width: '100%' }}
                                      onClick={() => { this.togglePopConfirm('reboot', 0) }}
                                      disabled={this.state.status || !this.state.connection}
                                    >
                                      Apply
                                    </Button>
                                  </Popconfirm>
                                </Col>
                              </div>
                            </Form>
                          </Col>
                        </Row>
                      </TabPane>

                    </TabContent>
                  </Card>
                </ModalBody>
              </Modal>
            </div>
        }

        {
          this.state.showDeleteMaster ?
            <SweetAlert
              title="Confirm Deletion?"
              warning
              showCancel
              confirmBtnBsStyle="success"
              cancelBtnBsStyle="danger"
              onConfirm={() => this.clearConfirmCancel('confirm', "Master Data Deleted")}
              onCancel={() => this.clearConfirmCancel('cancel', "Cancelled")}
              closeOnClickOutside={false}
              style={{ width: 'auto' }}
            >
              <h5 className="my-2" style={{ fontWeight: 'bold' }}>
                Do you want to delete the mastered data for this component?
              </h5>
              {
                this.state.comp_assigned_stations.length > 0 &&
                <div>
                  <div className="my-2" style={{ fontWeight: 'bold' }}>This component data is removed from following stations.</div>
                  <div className="table-responsive">
                    <Table striped>
                      <thead>
                        <tr>
                          <th>S.No.</th>
                          <th>Station Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.comp_assigned_stations.map((station, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{station}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                </div>
              }
            </SweetAlert> : null
        }


        {this.state.success_dlg ? (
          <SweetAlert
            success
            title={this.state.dynamic_title}
            onConfirm={() => this.setState({ success_dlg: false })}
          >
            {this.state.dynamic_description}
          </SweetAlert>
        ) : null}
        {this.state.error_dlg ? (
          <SweetAlert
            error
            title={this.state.dynamic_title}
            onConfirm={() => this.setState({ error_dlg: false })}
          >
            {this.state.dynamic_description}
          </SweetAlert>
        ) : null}

        <MasterInfoModal
          isOpen={this.state.showMasterInfo}
          toggle={this.hideMasterInfo}
          regions={this.state.regionInfo}
          stations={this.state.comp_assigned_stations}
        />

        <OneDTwoDRunoutResults
          isOpen={this.state.show_one_d_result}
          toggle={this.closeOneDResult}
          oneDRunout={this.state.one_d_runout}
          twoDRunout={this.state.two_d_runout}
        />
      </React.Fragment>
    );
  }
}
















//Beofre - 23-12-24
// // measurement_info.js
// // measurement_info-before-multiple-measurements
// import React, { Component, createRef } from "react";
// import {
//   Container, CardTitle, Button, Row, Col, Offcanvas,
//   OffcanvasHeader, OffcanvasBody, Label, Input, Form, Modal,
//   ModalHeader, ModalBody, ModalFooter, CardBody, Card,
//   CardText, CardHeader,
//   Collapse,
//   Nav,
//   NavItem,
//   NavLink,
//   TabContent,
//   TabPane,
//   Spinne,
//   Spinner,
//   ButtonGroup,
//   Progress,
//   Badge,
//   Table,
  
// } from "reactstrap";
// import urlSocket from "../AdminInspection/urlSocket";
// import PropTypes from "prop-types";
// import Swal from "sweetalert2";
// // Css for Admin_ui
// import "assets/css/admin_ui.css";
// import PointCloudPlot from "./PointCloudPlot";
// import toastr from "toastr";
// import { Popconfirm, Button as AntdBtn,Checkbox } from "antd";
// import classnames from "classnames"
// import CountdownTimer from "react-component-countdown-timer";
// import 'components/VerticalLayout/SidebarContent.css';
// import { FaEdit, FaTimes, FaTrashAlt } from "react-icons/fa";
// // import GraphComponent from "./Features/GraphComponent";
// import SweetAlert from "react-bootstrap-sweetalert";
// import MasterInfoModal from "./Features/MasterInfoModal";
// import OneDTwoDRunoutResults from "./Features/OneDTwoDRunoutResults";
// import manageData from "./sampleCompData";

// export default class MeasurementInfo extends Component {
//   static propTypes = { history: PropTypes.any.isRequired };
//   constructor(props) {
//     super(props);
//     this.state = {
//       comp_name: "",
//       comp_code: "",
//       compModelInfo: [],
//       status: false,
//       connection: false,
//       connecting: false,
//       isRightCanvas: false,
//       singleshotLoading: false,
//       intervalShot: false,

//       inspBasedOn: 'rotation',
//       counter: false,
//       startLeadTime: false,

//       numberOfTriggers: 10,
//       timeDuration: 2,
//       exposure_time: 150,
//       measuring_rate: 200,
//       noOfRotation: 3,
//       leadTime: 3,
//       sensorIP: "172.16.1.199",

//       temp_insp_type: 'rotation',
//       temp_time_duration: 2,
//       temp_lead_time: 3,
//       temp_no_of_rotation: 3,

//       errors: {
//         numberOfTriggers: '',
//         exposure_time: '',
//         measuring_rate: '',
//         sensorIP: '',

//         temp_time_duration: '',
//         temp_lead_time: '',
//         temp_no_of_rotation: '',
//       },

//       // from this is for testing page
//       testing: false,
//       testing_region: [],
//       start_test: false,
//       test_id: '',
//       isMastering: false,
//       mastering: '',
//       isReboot: false,
//       openPopConfirm: false,

//       boxes: [],
//       draggingBoxId: '',
//       isDragging: false,
//       col1: true,
//       col2: false,
//       openPopConfirms: {},
//       activeTab: "1",
//       appSettingActiveTab: "1",
//       end_testing: false,
//       showEditInspType: false,
//       profileNo: '',
//       done_rotation: 0,
//       isRotationStarted: 0, // 0 - not started, 1 - in progress, 2 - completed

//       capturedFileId: '',
//       isLoadingProfile: false,
//       isCapturing: false,

//       editMode: false,
//       showDeleteMaster: false,
//       comp_assigned_stations: [],
//       showMasterInfo: false,
//       regionInfo: [],
//       tempValues: {},
//       show_one_d_result: false,
//       one_d_runout: {},
//       two_d_runout: [],
//       combinedSensor:false,
//       stop_mastering_process: false,
//       is_combined_trigger: false,
//     };

//     this.toggleRightCanvas = this.toggleRightCanvas.bind(this);
//     this.t_col1 = this.t_col1.bind(this);
//     this.t_col2 = this.t_col2.bind(this);
//     this.pointCloudPlotRef = React.createRef(); // Create a ref to the PointCloudPlot component
//     this.reconnectionIntervalId = null
//   }

//   componentDidMount() {    
//     let data = JSON.parse(sessionStorage.getItem("manageData"));
//     // let data = manageData;
//     console.log("2510 D : dataSessionStorage : ", data);
//     let compInfo = data.compInfo;
//     // this.setState({comp_name: compInfo.comp_name, comp_code: compInfo.comp_code, compInfo,testing:data.test, exposure_time:compInfo.exposure_time, measuring_rate: compInfo.measuring_rate},()=>{
//     this.setState({
//       comp_name: compInfo.comp_name,
//       comp_code: compInfo.comp_code,
//       compInfo,
//       testing: data.test,
//       editMode: compInfo?.mastering_status == 'not_started' ? true : false,
//       activeTab: compInfo?.mastering_status == 'completed' ? "2" : "1",

//     }, () => {
//       this.runoutAndRegion(compInfo._id)
//     });
//     window.addEventListener('beforeunload', this.handleBeforeUnload);
//     // window.addEventListener('beforeunload', this.closeWindow);

//     // Handle navigation within the app
//     this.unblock = this.props.history.block((location, action) => {
//       if (this.state.editMode) {
//         return 'You have unsaved changes. Are you sure you want to leave?';
//       }
//       return undefined; // Allows navigation if not in editMode
//     });
//   }

//   componentWillUnmount() {
//     // sessionStorage.removeItem('showSidebar')
//     // sessionStorage.setItem('showSidebar', true)
//     if (this.state.connection) {
//       try {
//         this.disconnectSensor('yes');
//       } catch (error) {
//         console.log('Error in willunmount')
//       }
//     }
//     window.removeEventListener('beforeunload', this.handleBeforeUnload);
//     if (this.unblock) {
//       this.unblock();
//     }
//     // window.removeEventListener('beforeunload', this.closeWindow);
//   }

//   // this is for getting region data from the backend and plotting in the frontend
//   runoutAndRegion = async (id) => {
//     // if (this.state.testing){
//     try {
//       const response = await urlSocket.post("/get_region_data", { 'id': id }, {
//         mode: "no-cors",
//       });
//       const data = response.data;

//       console.log("testing info data ", data);
//       // ********* new one included in 18-09-24 ******************
//       this.setState(prevState => ({
//         // isRightCanvas: !prevState.isRightCanvas, 
//         errors: {
//           numberOfTriggers: '',
//           exposure_time: '',
//           measuring_rate: '',
//           sensorIP: '',

//           temp_time_duration: '',
//           temp_lead_time: '',
//           temp_no_of_rotation: '',
//         },
//         exposure_time: data[0].exposure_time,
//         measuring_rate: data[0].measuring_rate,
//         numberOfTriggers: data[0].number_of_triggers,
//         timeDuration: data[0].time_duration,
//         noOfRotation: data[0].no_of_rotation,
//         leadTime: data[0].lead_time,
//         sensorIP: data[0].sensor_ip,
//         inspBasedOn: data[0].insp_based_on,
//         compInfo: data[0],
//         appSettingActiveTab: "1"
//       }));
//       // ******************************************

//       if (data.length > 0 && data[0].mastering_status == 'completed') {
//         const reducedData = data[0].region_datas.map((reg_value, index) => {
//           return reg_value
//         });
//         console.log("testing info reducedData ", reducedData);
//         this.setState({ testing_region: reducedData })
//         if (this.state.testing) { this.sensor_connect() }
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   }

//   closeWindow = (event) => {
//     if (this.state.connection) {
//       event.preventDefault();
//       event.returnValue = ''; // Prevents the default unload behavior

//       // Show Swal confirmation
//       Swal.fire({
//         title: 'Are you sure?',
//         text: 'If you close this page, the sensor will disconnect. Are you sure you want to proceed?',
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonText: 'Yes, close it!',
//         cancelButtonText: 'No, keep it open',
//       }).then((result) => {
//         if (result.isConfirmed) {
//           // If confirmed, allow the page to close
//           window.removeEventListener('beforeunload', this.handleBeforeUnload);
//           window.close(); // Or window.location.reload() if reloading
//         }
//       });

//       return ''; // Some browsers require this for preventing unload
//       // Swal.fire({
//       //   text: "If you close this page, the sensor will disconnect. ",
//       //   title: 'Are you sure you want to proceed?',
//       //   icon: 'warning',
//       //   showCancelButton: true,
//       //   confirmButtonText: 'OK',
//       //   cancelButtonText: 'Cancel',
//       //   allowOutsideClick: true,
//       //   allowEscapeKey: true,
//       // }).then((result) => {
//       //   if (result.isConfirmed || result.dismiss === Swal.DismissReason.backdrop) {
//       //     this.disconnectSensor('yes');
//       //     console.log("back is working");
//       //     sessionStorage.removeItem("type");
//       //     this.props.history.push("/comp_admin");
//       //   }
//       // });
//     }
//   }

//   // ********* new one included in 18-09-24 ******************

//   handleBeforeUnload = (event) => {
//     // Make the API call for sensor disconnection
//     this.disconnectSensor();

//     // Setting a message for the user (optional)
//     event.preventDefault();
//     event.returnValue = ""; // Standard for modern browsers

//   };

//   // ******************************************


//   back = () => {
//     if (this.state.connection) {
//       Swal.fire({
//         title: 'Are you sure?',
//         text: 'Sensor will be Disconnected',
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonText: 'OK',
//         cancelButtonText: 'Cancel',
//         allowOutsideClick: true,
//         allowEscapeKey: true,
//       }).then((result) => {
//         if (result.isConfirmed || result.dismiss === Swal.DismissReason.backdrop) {
//           // this.disconnectSensor('yes');
//           console.log("back is working");
//           sessionStorage.removeItem('showSidebar')
//           sessionStorage.setItem('showSidebar', false)
//           sessionStorage.removeItem("type");
//           this.props.history.push("/comp_admin");
//         }
//       });
//     } else {
//       console.log("back is working");
//       sessionStorage.removeItem('showSidebar')
//       sessionStorage.setItem('showSidebar', false)
//       sessionStorage.removeItem("type");
//       this.props.history.push("/comp_admin");
//     }
//   };


//   sensor_connect = async () => {
//     try {
//       this.setState({ connecting: true })
//       const response = await urlSocket.post("/connection",
//         {
//           '_id': this.state.compInfo._id,
//           'exposure_time': this.state.exposure_time,
//           'measuring_rate': this.state.measuring_rate,
//           // 'exposure_time': this.state.compInfo.exposure_time,
//           // 'measuring_rate': this.state.compInfo.measuring_rate,
//         },
//         { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
//       let connection = response.data;
//       console.log("connection : ", connection);
//       this.setState({ connecting: false, connection: true, col1: true })
//       await Swal.fire({
//         title: 'Sensor Connected',
//         icon: 'success',
//         timer: 2000, // 2 seconds
//         timerProgressBar: true,
//         didClose: () => Swal.stopTimer()
//       });
//       clearInterval(this.reconnectionIntervalId);
//       this.setState({ isReboot: false });
//     } catch (error) {
//       this.setState({ connecting: false })
//       if (this.reconnectionIntervalId) {
//         this.setState({ isReboot: true });
//       } else {
//         await Swal.fire({
//           title: "Failed to connect to the sensor",
//           text: 'Please try again',
//           icon: 'error',
//           timer: 3000, // 3 seconds
//           timerProgressBar: true,
//           didClose: () => Swal.stopTimer()
//         });
//       }
//       console.log("error", error);
//     }
//   }

//   disconnectSensor = async (value) => {
//     try {
//       const response = await urlSocket.post("/disconnection", null, {
//         headers: {
//           "content-type": "multipart/form-data",
//         },
//       });
//       let connection_Sts = response.data;
//       this.setState({ connection: false, col1: false });
//       if (value) {
//         console.log("connection_Sts : ", connection_Sts);
//       } else {
//         await Swal.fire({
//           title: 'Sensor Disconnected',
//           icon: 'success',
//           timer: 2000, // 2 seconds
//           timerProgressBar: true,
//           didClose: () => Swal.stopTimer()
//         });
//         console.log("connection_Sts : ", connection_Sts);
//       }
//     } catch (error) {
//       console.log("error", error);
//       // await Swal.fire({
//       //   title: "Failed to disconnect from the sensor.",
//       //   text: 'Please try again',
//       //   icon: 'error',
//       //   timer: 2000, // 2 seconds
//       //   timerProgressBar: true,
//       //   didClose: () => Swal.stopTimer()
//       // });
//     }
//   }


//   triggerSensor = async (shot) => {
//     // if(this.state.singleshotLoading) {
//     //   console.log('already scanning ');
//     //   return;
//     // }
//     try {

//       // this.setState({ singleshotLoading: true })
//       const response = await urlSocket.post("/trigger", {
//         headers: {
//           "content-type": "multipart/form-data",
//         },
//         mode: "no-cors",
//       });
//       // this.setState({ singleshotLoading: false })
//       // console.log("Sensor value : ", sensor_profile);

//     } catch (error) {
//       console.log("error", error);
//     }
//   }

//   intervalTrigger = async () => {
//     try {
//       if (!this.state.compInfo.time_duration) {
//         Swal.fire({
//           title: 'Trigger Interval & Time Duration Required',
//           icon: 'warning',
//           timer: 2000, // 2 seconds
//           timerProgressBar: true,
//           didClose: () => Swal.stopTimer()
//         });
//         return;
//       }
//       this.setState({ intervalShot: true })
//       console.log('**testing ', this.state.testing)
//       const isTesting = JSON.stringify(this.state.testing)
//       const testingRegionString = JSON.stringify(this.state.testing_region)
//       const formData = new FormData();
//       formData.append('_id', this.state.compInfo._id);
//       formData.append('numberOfTriggers', this.state.compInfo.number_of_triggers);
//       formData.append('timeDuration', this.state.compInfo.time_duration);
//       formData.append('comp_name', this.state.comp_name);
//       formData.append('comp_code', this.state.comp_code);
//       formData.append('testing', this.state.testing);
//       formData.append('testing', isTesting);
//       formData.append('testing_region', testingRegionString);
//       const response = await urlSocket.post("/num_trigger", formData, {
//         headers: {
//           "content-type": "multipart/form-data",
//         },
//         mode: "no-cors",
//       });
//       let sensor_profile = response.data;
//       if (this.state.testing) {
//         this.setState({ start_test: true, test_id: sensor_profile })
//       }
//     } catch (error) {
//       this.setState({ intervalShot: false })
//     }
//   }

//   intervalTrigger2 = async () => {
//     try {
//       if (!this.state.compInfo.time_duration) {
//         Swal.fire({
//           title: 'Trigger Interval & Time Duration Required',
//           icon: 'warning',
//           timer: 2000, // 2 seconds
//           timerProgressBar: true,
//           didClose: () => Swal.stopTimer()
//         });
//         return;
//       }
//       this.setState({ intervalShot: true })
//       console.log('**testing ', this.state.testing)
//       const isTesting = JSON.stringify(this.state.testing)
//       const testingRegionString = JSON.stringify(this.state.testing_region)
//       const formData = new FormData();
//       formData.append('_id', this.state.compInfo._id);
//       formData.append('numberOfTriggers', this.state.compInfo.number_of_triggers);
//       formData.append('timeDuration', this.state.compInfo.time_duration);
//       formData.append('comp_name', this.state.comp_name);
//       formData.append('comp_code', this.state.comp_code);
//       formData.append('testing', this.state.testing);
//       formData.append('testing', isTesting);
//       formData.append('testing_region', testingRegionString);
//       const response = await urlSocket.post("/num_trigger_2", formData, {
//         headers: {
//           "content-type": "multipart/form-data",
//         },
//         mode: "no-cors",
//       });
//       let sensor_profile = response.data;
//       if (this.state.testing) {
//         this.setState({ start_test: true, test_id: sensor_profile })
//       }
//     } catch (error) {
//       this.setState({ intervalShot: false })
//     }
//   }

//   changeIntervalStopState = async () => {
//     this.setState({ intervalShot: false })
//   }

//   triggerSensorContly = async (second) => {
//     try {
//       const response = await urlSocket.post("/trigger_continuously", {
//         headers: {
//           "content-type": "multipart/form-data",
//         },
//         mode: "no-cors",
//       });
//       let sensor_profile = response.data;
//       this.setState({ start_test: true })
//       console.log("Sensor value : ", sensor_profile);
//     } catch (error) {
//       console.log("error", error);
//       this.setState(prevState => ({
//         status: !prevState.status,
//         start_test: false
//       }));
//       await Swal.fire({
//         title: 'Continuous trigger failed',
//         text: 'Please Try again...',
//         icon: 'error',
//         timer: 2000, // 2 seconds
//         timerProgressBar: true,
//         didClose: () => Swal.stopTimer()
//       });
//     }
//   }

//   stopTrigger = async () => {
//     try {
//       const response = await urlSocket.post("/stop", {
//         headers: {
//           "content-type": "multipart/form-data",
//         },
//         mode: "no-cors",
//       });
//       let sensor_sts = response.data;
//       console.log("Sensor Stopped sts: ", sensor_sts);
//       await Swal.fire({
//         title: 'Scanning Stopped',
//         icon: 'success',
//         timer: 2000, // 2 seconds
//         timerProgressBar: true,
//         didClose: () => Swal.stopTimer()
//       });
//       this.setState({
//         counter: false,
//         start_test: false,
//         intervalShot: false
//       })
//     } catch (error) {
//       console.log("error", error);
//     }
//   }

//   sensore_reset = async () => {
//     try {
//       const response = await urlSocket.post("/reset",
//         { '_id': this.state.compInfo._id },
//         { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
//       console.log("Sensor reset sts: ", response.data);
//       this.setState({
//         compInfo: response.data.comp_info,
//         // isRightCanvas: false,
//         // exposure_time: 150, measuring_rate: 200
//         exposure_time: 150, measuring_rate: 200
//       })
//       await Swal.fire({
//         title: 'Reset',
//         text: 'The sensor has been reset.',
//         icon: 'success',
//         timer: 2000, // 2 seconds
//         timerProgressBar: true,
//         didClose: () => Swal.stopTimer()
//       });
//     } catch (error) {
//       console.log("error", error);
//       await Swal.fire({
//         title: 'Reset Failed!',
//         text: 'Try again...',
//         icon: 'error',
//         timer: 2000, // 2 seconds
//         timerProgressBar: true,
//         didClose: () => Swal.stopTimer()
//       });
//     }
//   }


//   // ********* new one included in 18-09-24 ******************

//   // sensore_reboot = async ()=>{
//   //   this.setState({ openPopConfirm: {} });
//   //   try {
//   //       const response = await urlSocket.post("/reboot", {
//   //         headers: {
//   //           "content-type": "multipart/form-data",
//   //         },
//   //         mode: "no-cors",
//   //       });
//   //       let reboot = response.data;
//   //       console.log("Sensor reboot sts: ", reboot);
//   //       this.setState({
//   //         connection: false
//   //         // isRightCanvas: false
//   //       })
//   //       await Swal.fire({
//   //           title: 'Reboot',
//   //           text: 'The sensor has been reboot.',
//   //           icon: 'success',
//   //           timer: 2000, // 2 seconds
//   //           timerProgressBar: true,
//   //           didClose: () => Swal.stopTimer()
//   //         });
//   //         // this.setState({ isReboot: true });
//   //         // this.reconnectionIntervalId = setInterval(() => { this.disconnectSensor() }, 8000)

//   //     } catch (error) {
//   //       console.log("error", error);
//   //       await Swal.fire({
//   //         title: 'Restart Failed',
//   //         text: 'Try again...',
//   //         icon: 'error',
//   //         timer: 2000, // 2 seconds
//   //         timerProgressBar: true,
//   //         didClose: () => Swal.stopTimer()
//   //       });
//   //     }
//   // }

//   sensore_reboot = async () => {
//     this.setState({ openPopConfirm: {} });
//     try {
//       const response = await urlSocket.post("/reboot", { 'comp_id': this.state.compInfo._id }, {
//         headers: {
//           "content-type": "multipart/form-data",
//         },
//         mode: "no-cors",
//       });
//       let reboot = response.data;
//       console.log("Sensor reboot sts: ", reboot);
//       if (reboot.status === 'reboot completed') {
//         this.setState({
//           connection: true
//           // isRightCanvas: false 
//         })
//         await Swal.fire({
//           title: 'Reboot',
//           text: 'The sensor has been reboot.',
//           icon: 'success',
//           timer: 2000, // 2 seconds
//           timerProgressBar: true,
//           didClose: () => Swal.stopTimer()
//         });
//       }
//       else {
//         this.setState({
//           connection: false
//         })
//         await Swal.fire({
//           title: 'Reboot success',
//           text: 'Please Conne',
//           icon: 'error',
//           timer: 2000, // 2 seconds
//           timerProgressBar: true,
//           didClose: () => Swal.stopTimer()
//         });
//       }
//     } catch (error) {
//       console.log("error", error);
//     }
//   }


//   // configUpdate = async (e, value) => {
//   //   try {
//   //     const inputValue = e.target.value;
//   //     let errors = { ...this.state.errors };
//   //     if (value == 1) {
//   //       if (inputValue == '') {
//   //         errors.numberOfTriggers = 'value cannot be set to empty'
//   //       } else if (inputValue < 1) {
//   //         errors.numberOfTriggers = 'value cannot be less than 1'
//   //       } else {
//   //         errors.numberOfTriggers = ''
//   //       }
//   //       this.setState({ numberOfTriggers: inputValue, errors })
//   //     }
//   //     else if (value == 2) {
//   //       if (inputValue == '') {
//   //         errors.timeDuration = 'value cannot be set to empty'
//   //       } else if (inputValue < 1 || inputValue > 100) {
//   //         errors.timeDuration = 'enter the value from 1 to 100'
//   //       } else {
//   //         errors.timeDuration = ''
//   //       }
//   //       this.setState({ timeDuration: inputValue, errors })
//   //     }
//   //     else if (value == 'sensor_ip') {
//   //       if (inputValue == '') {
//   //         errors.sensorIP = 'value cannot be set to empty'
//   //       }
//   //       // else if (inputValue < 1 || inputValue > 100) {
//   //       //   errors.sensorIP = 'enter the value from 1 to 100'
//   //       // }
//   //       else {
//   //         errors.sensorIP = ''
//   //       }
//   //       this.setState({ sensorIP: inputValue, errors })
//   //     }
//   //     else if (value == 'rotate_count') {
//   //       if (inputValue == '') {
//   //         errors.noOfRotation = 'value cannot be set to empty'
//   //       } else if (inputValue < 1 || inputValue > 100) {
//   //         errors.noOfRotation = 'enter the value from 1 to 100'
//   //       } else {
//   //         errors.noOfRotation = ''
//   //       }
//   //       this.setState({ noOfRotation: inputValue, errors })
//   //     }
//   //     else if (value == 'lead_time') {
//   //       if (inputValue == '') {
//   //         errors.leadTime = 'value cannot be set to empty'
//   //       } else if (inputValue < 1 || inputValue > 100) {
//   //         errors.leadTime = 'enter the value from 1 to 100'
//   //       } else {
//   //         errors.leadTime = ''
//   //       }
//   //       this.setState({ leadTime: inputValue, errors })
//   //     }
//   //     else if (this.state.connection) {
//   //       if (value == 3) {
//   //         if (inputValue == '') {
//   //           errors.exposure_time = 'value cannot be set to empty'
//   //         } else if (inputValue < 10 || inputValue > 10000) {
//   //           errors.exposure_time = 'enter the value from 10 to 10000'
//   //         } else {
//   //           errors.exposure_time = ''
//   //         }
//   //         this.setState({ exposure_time: inputValue, errors })
//   //       } else if (value == 4) {
//   //         if (inputValue == '') {
//   //           errors.measuring_rate = 'value cannot be set to empty'
//   //         } else if (inputValue < 1 || inputValue > 400) {
//   //           errors.measuring_rate = 'enter the value from 1 to 400'
//   //         } else {
//   //           errors.measuring_rate = ''
//   //         }
//   //         this.setState({ measuring_rate: inputValue, errors })
//   //       }
//   //     }
//   //   } catch (error) {
//   //     console.log("error", error);
//   //   }
//   // }


//   configUpdate = async (e, value) => {
//     if (value) {
//       console.log('inside if_______________________')
//       try {
//         const inputValue = e.target.value;
//         let errors = { ...this.state.errors };
//         if (value == 1) {
//           if (inputValue == '') {
//             errors.numberOfTriggers = 'value cannot be set to empty'
//           } else if (inputValue < 1) {
//             errors.numberOfTriggers = 'value cannot be less than 1'
//           } else {
//             errors.numberOfTriggers = ''
//           }
//           this.setState({ numberOfTriggers: inputValue, errors })
//         }

//         else if (value == 'sensor_ip') {
//           if (inputValue == '') {
//             errors.sensorIP = 'value cannot be set to empty'
//           }
//           else {
//             errors.sensorIP = ''
//           }
//           this.setState({ sensorIP: inputValue, errors })
//         }
//         else if (this.state.connection) {
//           if (value == 3) {
//             if (inputValue == '') {
//               errors.exposure_time = 'value cannot be set to empty'
//             } else if (inputValue < 10 || inputValue > 10000) {
//               errors.exposure_time = 'enter the value from 10 to 10000'
//             } else {
//               errors.exposure_time = ''
//             }
//             this.setState((prevState) => ({
//               tempValues: {
//                 ...prevState.tempValues,
//                 exposure_time: inputValue,
//               },
//               errors
//             }));
//             // this.setState({ exposure_time: inputValue, errors })
//           }
//           else if (value == 4) {
//             if (inputValue == '') {
//               errors.measuring_rate = 'value cannot be set to empty'
//             } else if (inputValue < 1 || inputValue > 2000) {
//               errors.measuring_rate = 'enter the value from 1 to 2000'
//             } else {
//               errors.measuring_rate = ''
//             }
//             console.log('first691', errors)
//             this.setState((prevState) => ({
//               tempValues: {
//                 ...prevState.tempValues,
//                 measuring_rate: inputValue,
//               },
//               errors
//             }));
//             // this.setState({ measuring_rate: inputValue, errors })
//           }
//         }


//       } catch (error) {
//         console.log("error", error);
//       }
//     }
//     else {
//       let errors = { ...this.state.errors };
//       const { name, value } = e.target;

//       const validateInput = (name, value) => {
//         if (value === '') {
//           return 'value cannot be set to empty';
//         } else if (value <= 0 || value > 100) {
//           return 'enter the value from 1 to 100';
//         }
//         return '';
//       };

//       // Validate the inputs
//       errors[name] = validateInput(name, value);
//       this.setState({ [name]: value, errors });
//       // if (["timeDuration", "noOfRotation", "leadTime"].includes(name)) {
//       // }
//     }

//   }

//   // ******************************************


//   changeStatus = async () => {

//     const isStop = this.state.status;
//     this.setState({ status: !isStop })
//     if (!isStop) {
//       await this.triggerSensorContly();
//     } else if (isStop) {
//       await this.stopTrigger();
//     }
//   }

//   changeConnection = async () => {
//     const isStop = this.state.connection;
//     // this.setState({ connection: !isStop})
//     if (!isStop) {
//       await this.sensor_connect();
//     } else if (isStop) {
//       await this.disconnectSensor();
//     }
//   }

//   // ********* new one included in 18-09-24 ******************

//   // toggleRightCanvas = async () => {
//   //   const { compInfo } = this.state;
//   //   console.log('compInfo *** ', compInfo)
//   //   this.setState(prevState => ({
//   //     isRightCanvas: !prevState.isRightCanvas,
//   //     errors: { numberOfTriggers: '', timeDuration: '', exposure_time: '', measuring_rate: '', noOfRotation: '', leadTime: '', sensorIP: '' },
//   //     exposure_time: compInfo.exposure_time,
//   //     measuring_rate: compInfo.measuring_rate,
//   //     numberOfTriggers: compInfo.number_of_triggers,
//   //     timeDuration: compInfo.time_duration,
//   //     noOfRotation: compInfo.no_of_rotation,
//   //     leadTime: compInfo.lead_time,
//   //     sensorIP: compInfo.sensor_ip,
//   //     inspBasedOn: compInfo.insp_based_on,
//   //     appSettingActiveTab: "1"
//   //   }));
//   // }

//   toggleRightCanvas = async () => {
//     const { compInfo, exposure_time, measuring_rate } = this.state;
//     this.setState(prevState => ({
//       isRightCanvas: !prevState.isRightCanvas,
//       errors: { 
//         numberOfTriggers: '', 
//         exposure_time: '', 
//         measuring_rate: '', 
//         sensorIP: '',

//         temp_time_duration: '', 
//         temp_lead_time: '', 
//         temp_no_of_rotation: '', 
//       },
//       // exposure_time: compInfo.exposure_time,
//       // measuring_rate: compInfo.measuring_rate,
//       numberOfTriggers: compInfo.number_of_triggers,

//       temp_insp_type: this.state.inspBasedOn,
//       temp_time_duration: this.state.timeDuration,
//       temp_lead_time: this.state.leadTime,
//       temp_no_of_rotation: this.state.noOfRotation,

//       sensorIP: compInfo.sensor_ip,
//       appSettingActiveTab: "1",

//       tempValues: {
//         exposure_time: exposure_time,
//         measuring_rate: measuring_rate,
//       }
//     }));
//   }

//   // ******************************************

//   toastSuccess = (title, message) => {
//     // title = "Success"
//     toastr.options.closeDuration = 8000
//     toastr.options.positionClass = "toast-bottom-right"
//     toastr.success(message, title)
//   }

//   toastError = (title, message) => {
//     // let title = "Failed"
//     toastr.options.closeDuration = 8000
//     toastr.options.positionClass = "toast-bottom-right"
//     toastr.error(message, title)
//   }

//   applicationConfig = async () => {
//     const { errors, compInfo, numberOfTriggers, timeDuration, noOfRotation, leadTime } = this.state;
//     const isValid = (
//       errors.temp_time_duration === '' &&
//       errors.temp_lead_time === '' && 
//       errors.temp_no_of_rotation === ''
//     );

//     if (isValid) {
//       this.setState({
//         inspBasedOn: this.state.temp_insp_type,
//         timeDuration: this.state.temp_time_duration,
//         leadTime: this.state.temp_lead_time,
//         noOfRotation: this.state.temp_no_of_rotation,
//       });
//       this.toastSuccess("Application Settings Applied Successfully!", '');
//     } else {
//       this.toastError("Failed to Submit! Please check your input.", '')
//     }
//   }

//   sensorNetworkSettings = async () => {
//     const { errors, compInfo, sensorIP } = this.state;
//     const isValid = (errors.sensorIP === '');

//     if (isValid) {
//       const response = await urlSocket.post("/network_config", {
//         '_id': compInfo._id,
//         'sensorIP': sensorIP
//       }, { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });

//       const data = response.data.comp_info;
//       console.log('response ', data);
//       this.toastSuccess("Network Settings Applied Successfully!", '')
//       this.setState({
//         compInfo: data,
//         sensorIP: data.sensor_ip
//       });
//     } else {
//       this.toastError("Failed to Submit! Please check your input.", '')
//     }
//   }

//   sensorConfig = async () => {
//     if (!this.state.connection) {
//       console.log('connection required *************');
//       return;
//     }
//     const { errors, tempValues } = this.state;
//     const isValid = (errors.exposure_time === '' && errors.measuring_rate === '');
//     if (isValid) {
//       const response = await urlSocket.post("/sensor_config", {
//         '_id': this.state.compInfo._id,
//         'ExposureTime': this.state.exposure_time,
//         'measuring_rate': this.state.measuring_rate,
//         // 'ExposureTime': this.state.exposure_time,
//         // 'measuring_rate': this.state.measuring_rate,
//         'connection': this.state.connection
//       }, { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });

//       const data = response.data;
//       console.log('response ', data);
//       this.toastSuccess("Sensor Settings Applied Successfully!", '')
//       this.setState({
//         exposure_time: data.exposure_time,
//         measuring_rate: data.measuring_rate,
//         // exposure_time: data.exposure_time,
//         // measuring_rate: data.measuring_rate,
//         // compInfo: data,
//         // isRightCanvas: false,
//       });
//     } else {
//       this.toastError("Failed to Submit! Please check your input.", '')
//     }
//   }


//   // Box Plot Dragging

//   handleDragStart = (id) => {
//     this.setState({ draggingBoxId: id, isDragging: true });
//   };

//   setDraggingBoxId = (id) => {
//     this.setState({ draggingBoxId: id });
//   };

//   setIsDragging = (isDragging) => {
//     this.setState({ isDragging });
//   };

//   setBoxes = newBoxes => {
//     console.log('newBoxes', newBoxes)
//     this.setState({ boxes: newBoxes });
//   };


//   t_col1() {
//     this.setState((prevState) => ({
//       col1: !prevState.col1,
//       col2: false, // Set col2 to false to close it when col1 is opened
//     }));
//   }


//   t_col2() {
//     const { compInfo } = this.state;
//     this.setState({
//       col1: false,
//       col2: !this.state.col2,
//       inspBasedOn: compInfo.insp_based_on,
//       noOfRotation: compInfo.no_of_rotation,
//       leadTime: compInfo.lead_time,
//       timeDuration: compInfo.time_duration
//     })
//   }

//   toggleRegionEdit = (e, item, index) => {
//     // Call the toggleRightCanvas function from the PointCloudPlot component
//     if (this.pointCloudPlotRef.current) {
//       this.pointCloudPlotRef.current.toggleRightCanvas(e, item, index);
//     }

//   };

//   regionDelete = (e, item, index) => {
//     if (this.pointCloudPlotRef.current) {
//       this.pointCloudPlotRef.current.deleteRegion(e, item, index);
//     }
//     this.setState({ openPopConfirm: {} });
//   }

//   togglePopConfirm = async (index, val) => {
//     console.log('**********togglePopconfirm ', index, val)
//     const popValue = { [index]: val == 0 ? true : false }
//     this.setState({ openPopConfirm: popValue })
//   }

//   toggle(tab) {
//     if (this.state.activeTab !== tab) {
//       this.setState({
//         activeTab: tab,
//       })
//     }
//   }
//   toggleApplicationSetting(tab) {
//     if (this.state.appSettingActiveTab !== tab) {
//       this.setState({
//         appSettingActiveTab: tab,
//       })
//     }
//   }

//   showSettings = () => {
//     this.setState(prevState => ({
//       showEditInspType: !prevState.showEditInspType
//     }))
//   }

//   triggerSensorContly1 = async (second) => {
//     if (this.state.inspBasedOn === "time") {
//       this.setState({ counter: true })
//     }
//     const testingRegionString = JSON.stringify(this.state.testing_region)
//     const isTesting = JSON.stringify(this.state.testing)
//     const formData = new FormData();
//     formData.append('_id', this.state.compInfo._id);
//     formData.append('numberOfTriggers', this.state.compInfo.number_of_triggers);
//     formData.append('timeDuration', this.state.compInfo.time_duration);
//     formData.append('noOfRotation', this.state.compInfo.no_of_rotation);
//     formData.append('comp_name', this.state.comp_name);
//     formData.append('comp_code', this.state.comp_code);
//     formData.append('testing', isTesting);
//     formData.append('testing_region', testingRegionString);
//     try {
//       const response = await urlSocket.post("/trigger_continuously1", formData, {
//         headers: {
//           "content-type": "multipart/form-data",
//         },
//         mode: "no-cors",
//       });
//       let sensor_profile = response.data;
//       console.log("Sensor value : ", sensor_profile, this.state.testing);
//       if (this.state.testing) {
//         this.setState({ test_id: sensor_profile })
//       } else {
//         this.setState({ mastering: sensor_profile })
//       }
//       console.log("Sensor value : ", sensor_profile);


//       // if (this.state.testing) {
//       //   this.setState({ test_id: 'value' })
//       // } else {
//       //   this.setState({ mastering: 'value' })
//       // }
//     } catch (error) {
//       console.log("error", error);
//       if (this.state.inspBasedOn === "time") {
//         this.setState({ counter: false })
//       }
//       if (this.state.status) {
//         this.setState({ status: false })
//       }
//       if (this.state.isMastering) {
//         this.setState({ isMastering: false })
//       }
//       this.setState(prevState => ({
//         start_test: false
//       }));
//       await Swal.fire({
//         title: 'Continuous trigger failed',
//         text: 'Please Try again...',
//         icon: 'error',
//         timer: 2000, // 2 seconds
//         timerProgressBar: true,
//         didClose: () => Swal.stopTimer()
//       });
//     }
//   }

//   changeStatus1 = async (val) => {
//     const { isMastering } = this.state;

//     if (val === 'master') {
//       // if (!isMastering) {
//       this.setState({ isCapturing: true });
//       await this.startMastering();
      
//       // await this.triggerSensorContly1();
//       // }
//     }
//     // else if (isMastering) {
//     //   // // after rotation completed
//     //   this.setState({ isMastering: false });
//     //   // await this.stopTrigger();
//     // }
//   };

//   start_lead_time = () => {
//     console.log('startLeadTime')
//     this.setState({ startLeadTime: true, isMastering: true })
//   }

//   onTimeup = () => {
//     // // after timer completed - time based
//     const isStop = this.state.status;
//     // 'end_testing' ==> time_based_mastering_ends
//     // to show tolerance setting modal, change end_testing to true
//     this.setState({ status: false, counter: false, isRotationStarted: 2 })        // isMastering: false, end_testing: true,
//     // this.stopTrigger();
//   }

//   // ********* new one included in 18-09-24 ******************

//   // onTimeup1 = () => {
//   //   this.setState({ startLeadTime: false});
//   //   this.changeStatus1('master');
//   //   // // exist if 'test' button in admin
//   //   // if(!this.state.testing) {
//   //   //   this.changeStatus1('master')
//   //   // } else {
//   //   //   this.changeStatus1('test')
//   //   // }   
//   // }  

//   onTimeup1 = () => {
//     this.setState({ startLeadTime: false, stop_mastering_process: false });
//     if (this.state.inspBasedOn !== 'rotation') {
//       this.setIsRotationStarted(1);
//       this.changeStatus1('master');
//     }
//     else {
//       this.start_rotation();
//     }
//   }

//   start_rotation = async () => {
//     console.log('this.state.compInfo._id', this.state.compInfo._id)
//     let id = this.state.compInfo._id
//     try {
//       const response = await urlSocket.post("/start_rotate", { '_id': id }, { mode: "no-cors" });
//       const data = response.data
//       console.log('data945', data)
//     } catch (error) {
//       console.log('error', error)
//     }
//   }

//   // ******************************************

//   handleRadioChange = (e) => {
//     const { name, value } = e.target;
//     this.setState({ [name]: value });
//     // this.setState({ inspBasedOn: e.target.value });
//   };

//   disable_end_testing = () => {
//     this.setState({ end_testing: false })
//   }

//   createRegion = () => {
//     if (this.pointCloudPlotRef.current) {
//       this.pointCloudPlotRef.current.handleBoxSelect();
//     }

//   }

//   changeProfileNo = (value) => {
//     this.setState({ profileNo: value })
//   }

//   setDoneRotation = (val) => {
//     this.setState({ done_rotation: val })
//   }

//   setIsRotationStarted = (val) => {
//     this.setState({ isRotationStarted: val })
//   }
//   // **************************** new one included 18-09-24 **************************************************

//   // startMastering = async () => {
//   //   if (this.state.compInfo.insp_based_on === "time") {
//   //     this.setState({ counter: true })
//   //   }
//   //   const formData = new FormData();
//   //   formData.append('_id', this.state.compInfo._id);
//   //   formData.append('timeDuration', this.state.compInfo.time_duration);
//   //   try {
//   //     const response = await urlSocket.post("/mastering_with_more_profiles", formData, {
//   //       headers: {
//   //         "content-type": "multipart/form-data",
//   //       },
//   //       mode: "no-cors",
//   //     });
//   //     let sensor_profile = response.data;
//   //     const capturedData = response.data;
//   //     if(capturedData?.is_capturing === "1") {
//   //       this.setState({
//   //         isCapturing: false,
//   //         capturedFileId: capturedData.file_id, 
//   //         isLoadingProfile: true,
//   //       });
//   //     }
//   //     console.log("Sensor value : ", sensor_profile);
//   //     this.setState({ mastering: sensor_profile });

//   //   } catch (error) {
//   //     console.log("error", error);
//   //     if (this.state.compInfo.insp_based_on === "time") {
//   //       this.setState({ counter: false })
//   //     }
//   //     if (this.state.isMastering) {
//   //       this.setState({ isMastering: false, isCapturing: false })
//   //     }
//   //     await Swal.fire({ title: 'Mastering Failed', text: 'please try again...', icon: 'error', timer: 2000, timerProgressBar: true, didClose: () => Swal.stopTimer() });
//   //   }
//   // }

//   startMastering = async () => {
//     if (this.state.inspBasedOn === "time") {
//       this.setState({ counter: true })
//     }
//     const formData = new FormData();
//     if (this.state.inspBasedOn === 'rotation') {
//       formData.append('_id', this.state.compInfo._id);
//       formData.append('noOfRotation', this.state.noOfRotation);
//     }
//     else {
//       formData.append('_id', this.state.compInfo._id);
//       formData.append('timeDuration', this.state.timeDuration);
//     }
//     try {
//       let response;
//       if (this.state.inspBasedOn === 'rotation') {
//         response = await urlSocket.post("/master_rotation", formData, {
//           headers: {
//             "content-type": "multipart/form-data",
//           },
//           mode: "no-cors",
//         });
//       }
//       else {
//         response = await urlSocket.post("/mastering_with_more_profiles", formData, {
//           headers: {
//             "content-type": "multipart/form-data",
//           },
//           mode: "no-cors",
//         });
//       }
//       const capturedData = response.data;
//       if (capturedData?.is_capturing === "1" && !this.state.stop_mastering_process) {
//         this.setState({
//           isCapturing: false,
//           capturedFileId: capturedData.file_id,
//           isLoadingProfile: true,
//         });
//       }
//       console.log("Sensor value : ", capturedData);
//       this.setState({ mastering: capturedData });

//       if(!this.state.stop_mastering_process) {
//         await this.startPlotting();
//       }
//     } 
//     catch (error) {
//       console.log("error", error);
//       if (this.state.inspBasedOn === "time") {
//         this.setState({ counter: false })
//       }
//       if (this.state.isMastering) {
//         this.setState({ isMastering: false, isCapturing: false })
//       }
//       this.setState({ isRotationStarted: 0 });
//       await Swal.fire({ title: 'Mastering Failed', showConfirmButton: false, text: 'please try again...', icon: 'error', timer: 2000, timerProgressBar: true, didClose: () => Swal.stopTimer() });
//     }
//   }
//   // ***********************************************************************************************************


//   startPlotting = async () => {
//     try {
//       const response = await urlSocket.post("/retrieve_and_process_data", {
//         'comp_id': this.state.compInfo._id,
//         'captured_file_id': this.state.capturedFileId
//       }, { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });

//     } catch (error) {
//       if (this.state.inspBasedOn === "time") this.setState({ counter: false })
//       if (this.state.isMastering) {
//         this.setState({ isMastering: false, capturedFileId: '', isLoadingProfile: false })
//       }
//       this.setState({ isRotationStarted: 0 })
//       await Swal.fire({ title: 'Mastering Failed', showConfirmButton: false, text: 'please try again...', icon: 'error', timer: 2000, timerProgressBar: true, didClose: () => Swal.stopTimer() });
//     }

//   }

//   completePlotting = async (value, comp_data) => {
//     if (value == 1) {
//       this.setState({ isMastering: false, capturedFileId: '', isLoadingProfile: false, compInfo: comp_data, editMode: false })
//     } else {
//       this.setState({ isMastering: false, capturedFileId: '', isLoadingProfile: false })
//     }
//   }

//   toggleAccordion = () => {
//     this.setState((prevState) => ({ isAccordionOpen: !prevState.isAccordionOpen }));
//   };

//   changeEditMode = () => {
//     this.setState({ editMode: true });
//   }

//   enableDeleteMaster = async () => {
//     try {
//       const { compInfo } = this.state;
//       const response = await urlSocket.post("/get_comp_stations_mastered", {
//         '_id': compInfo._id,
//       }, { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
//       this.setState({ showDeleteMaster: true, comp_assigned_stations: response.data });
//     } catch (error) {
//       console.log(error)
//     }
//   }

//   clearMasterData = async () => {
//     try {
//       const response = await urlSocket.post("/clear_mastering", {
//         '_id': this.state.compInfo._id,
//       }, { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
//       if (response.data.comp_data) {
//         this.setState({ compInfo: response.data.comp_data, testing_region: [] })
//       }
//     } catch (error) {
//       console.log(error)
//     }
//   }

//   clearConfirmCancel = async (value, title_content) => {
//     if (value == 'confirm') {
//       await this.clearMasterData();
//       this.setState({
//         showDeleteMaster: false,
//         success_dlg: true,
//         dynamic_title: title_content,
//         // dynamic_description: "Your file has been deleted.",
//         comp_assigned_stations: [],
//         editMode: true,
//       });
//     } else if (value == 'cancel') {
//       this.setState({
//         showDeleteMaster: false,
//         error_dlg: true,
//         dynamic_title: title_content,
//         // dynamic_description: "Your imaginary file is safe :)",
//         comp_assigned_stations: []
//       })
//     }
//   }

//   enableMasterInfo = async () => {
//     try {
//       const response = await urlSocket.post("/show_master_info", {
//         '_id': this.state.compInfo._id,
//       }, { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
//       console.log('master_info_____ ', response, response.data.comp_data);
//       const region_datas = this.state.compInfo.region_datas.map((region) => ({
//         regionName: region.name,
//         maxValue: region.max_tolerence,
//         minValue: region.min_tolerence,
//       }));

//       this.setState({
//         showMasterInfo: true,
//         comp_assigned_stations: response.data,
//         regionInfo: region_datas
//       })
//       // if (response.data.comp_data) {
//       //   this.setState({ compInfo: response.data.comp_data })
//       // }
//     } catch (error) {
//       console.log(error)
//     }
//   }

//   hideMasterInfo = async () => {
//     this.setState({
//       showMasterInfo: false, comp_assigned_stations: [], regionInfo: []
//     })
//   }

//   isButtonDisabled = () => {
//     const { status, connection, intervalShot, isMastering, editMode } = this.state;
//     return status || !connection || intervalShot || isMastering || !editMode;
//   };


//   // this is 1d sensor function

//   singleSensor = () => {
//     this.setState(prevState => ({ oneDsensor: !prevState.oneDsensor }), () => {
//       console.log('oneDsensor1317', this.state.oneDsensor);
//     });
//   };

//   oneDconnection =async()=>{
//     try {
//       const response = await urlSocket.post("/oneDconnection",{
//         '_id': this.state.compInfo._id,
//         'exposure_time': this.state.compInfo.exposure_time,
//         'measuring_rate': this.state.compInfo.measuring_rate,
//       },{ headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
//       let data = response.data
//       console.log('oneDresponse', data.message)
//       if(data.message =='Sensor connected successfully.'){
//         this.setState({combinedSensor:true})
//         await Swal.fire({
//           title: 'Sensor Connected',
//           icon: 'success',
//           timer: 2000, // 2 seconds
//           timerProgressBar: true,
//           didClose: () => Swal.stopTimer()
//         });
        
//       }
//     } catch (error) {
     
//       await Swal.fire({ title: 'One D Connection Failed', text: 'please try again...', icon: 'error', timer: 2000, timerProgressBar: true, didClose: () => Swal.stopTimer() });
//     }
//   }

//   oneDDisconnection = async () => {
//     try {
//       const response = await urlSocket.post("/one_d_disconnection",
//         { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
//       console.log('1d and 2d disconnected', response)
//       if(response.data.message === 'Sensor disconnected successfully.'){
//         this.setState({combinedSensor:false})
//         await Swal.fire({
//           title: 'Sensor DisConnected',
//           icon: 'success',
//           timer: 2000, // 2 seconds
//           timerProgressBar: true,
//           didClose: () => Swal.stopTimer()
//         });
//       }
      
//     } catch (error) {
//       await Swal.fire({ title: 'Failed to disconnect', text: 'please try again...', icon: 'error', timer: 2000, timerProgressBar: true, didClose: () => Swal.stopTimer() });
//     }
//   }

//   combinedTest = async () => {
//     this.setState({is_combined_trigger: true})
//     console.log('this.state.compInfo._id', this.state.compInfo._id)
//     let id = this.state.compInfo._id
//     if (this.state.inspBasedOn === 'time') {
//       this.start1Dtest()
//     } else {
//       try {
//         const response = await urlSocket.post("/start_rotate2", { '_id': id }, { mode: "no-cors" });
//         const data = response.data
//         console.log('data945', data)
//       } catch (error) {
//         console.log('error', error)
//       }
//     }
//   }

//   start1Dtest = async()=>{
//     const formData = new FormData();
//     formData.append('timeDuration', this.state.timeDuration);
//     formData.append('noOfRotation', this.state.noOfRotation);
//     let  response;
//     try {
//       if(this.state.inspBasedOn === 'time'){
//          response = await urlSocket.post("/get-data",formData,{ headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
//       }
//       else{
//         response = await urlSocket.post("/rotate_get-data",formData,{ headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
//       }
      
//       console.log('oneDresponse', response.data);
//       this.setState({capturedFileId: response.data.file_id,})   // ,()=>{this.startPlotting2}

//       const one_d_runout = response.data.value;

//       let two_d_runout;
//       if(response.data.file_id) {
//         const response_2 = await urlSocket.post("/filter_region_points",
//           {
//             'comp_id': this.state.compInfo._id,
//             'captured_file_id': response.data.file_id,
//             'regions': this.state.compInfo.region_datas,
//           },
//           { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
//         console.log('runoutfrom2d ', response_2);
//         two_d_runout = response_2.data.region_data;
//       }

//       this.setState({
//         show_one_d_result: true,
//         one_d_runout: one_d_runout,
//         two_d_runout: two_d_runout,
//         is_combined_trigger: false
//       })
      
//     } catch (error) {
     
//       await Swal.fire({ title: 'Mastering Failed', text: 'please try again...', icon: 'error', timer: 2000, timerProgressBar: true, didClose: () => Swal.stopTimer() });
//     }
//   }

//   clearBuffer = async () => {
//     try {
//       const response = await urlSocket.post("/one_d_clear_buffer",{ headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
//       console.log('clearBuffer_________ ', response)
//     } catch (error) {
//       console.log(error)
//     }
//   }

//   startPlotting2 = async () => {
//     try {
//       const response = await urlSocket.post("/retrieve_and_process_data", {
//         'comp_id': this.state.compInfo._id,
//         'captured_file_id': this.state.capturedFileId
//       }, { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });

//     } catch (error) {
//       await Swal.fire({ title: 'Mastering Failed', text: 'please try again...', icon: 'error', timer: 2000, timerProgressBar: true, didClose: () => Swal.stopTimer() });
//     }
//   }

//   view3D = async () => {
//     try {
//       const response = await urlSocket.post("/show_3d", {
//         'file_id': this.state.compInfo.captured_file_id,
//       }, { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
//     } catch (error) {
//       console.log(error)
//     }
//   }

//   closeOneDResult = () => {
//     this.setState({
//       show_one_d_result: false,
//       one_d_runout: {},
//       two_d_runout: []
//     })
//   }
  
//   stopMastering = async () => {
//     this.setState({
//       isMastering: false,
//       isRotationStarted: 0,
//       startLeadTime: false,
//       isCapturing: false,
//       counter: false,
//       capturedFileId: '',
//       isLoadingProfile: false,
//       stop_mastering_process: true
//     })
//     try {
//       const response = await urlSocket.post("/stop", {
//         // 'file_id': this.state.compInfo.captured_file_id,
//       }, { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
//       await Swal.fire({
//         title: 'Mastering Stopped',
//         icon: 'success',
//         showConfirmButton: false,
//         timer: 2000, // 2 seconds
//         timerProgressBar: true,
//         allowOutsideClick: false,
//         didClose: () => Swal.stopTimer()
//       });
//     } catch (error) {
//       console.log(error)
//     }
//   }

//   toggleStopMastering = () => {
//     this.setState({ stop_mastering_process: false })
//   }

//   render() {
//     const { errors } = this.state;
//     return (
//       <>
//         {
//           this.state.isReboot ?
//             <div className="connection-overlay">
//               <div className="connection-text text-center">Connecting...</div>
//             </div>
//             :
//             <div className="page-content">
//               <Container
//                 fluid={true}
//                 style={{
//                   // minHeight: '100vh',
//                   // background: "white",
//                   // userSelect: 'none'
//                 }}
//               >
//                 <div className="d-flex align-items-center justify-content-between pt-2">
//                   <Button onClick={() => this.back()} color="secondary">
//                     <span className="bx bx-left-arrow-alt">{'  '}Back</span>
//                   </Button>
//                   {!this.state.testing ?
//                     <CardTitle className="text-center" style={{ fontSize: 22 }}>MEASUREMENT INFORMATION</CardTitle> :
//                     <CardTitle className="text-center" style={{ fontSize: 22 }}>TESTING </CardTitle>
//                   }
//                   <div>{' '}</div>
//                 </div>

//                 <Row className="mt-2">
//                   <Col md={6} lg={6}>
//                     {/* <div className="ms-2 mt-2 d-flex align-items-center justify-content-between"> */}
//                     <label style={{ fontSize: "16px", fontWeight: "bold" }}>  {/* , padding: "10px", flex: 1 */}
//                       <span style={{ color: "#546cf4" }}> {/* , padding: "10px" */}
//                         Component Name:
//                       </span>{" "}
//                       {this.state.comp_name}
//                       <span className="ms-2" style={{ color: "#546cf4" }}> {/* , padding: "10px" */}
//                         Component Code:
//                       </span>{" "}
//                       {this.state.comp_code}
//                     </label>

//                     <span className="ms-3" style={{ fontWeight: 'bold' }}>Mastered Data:</span>
//                     {
//                       this.state.compInfo?.mastering_status === 'completed' ? (
//                         <Badge color="success" pill>Available</Badge>
//                       ) : this.state.compInfo?.mastering_status === 'not_started' ? (
//                         <Badge color="danger" pill>Not Available</Badge>
//                       ) : null
//                     }
//                     {/* </div> */}
//                   </Col>
//                   <Col md={6} lg={6} className="d-flex">
//                     {
//                       this.state.compInfo?.mastering_status === 'completed' ?
//                         <div>
//                           <Button color="primary" className="ms-2 btn-label" onClick={() => this.changeEditMode()}
//                             disabled={this.state.status || !this.state.connection || this.state.isMastering}  
//                           >
//                             Edit
//                             <i className="bx bx-edit label-icon"></i>
//                           </Button>
//                           <Button color="danger" className="ms-2 btn-label" onClick={() => this.enableDeleteMaster()}
//                             disabled={this.state.status || this.state.singleshotLoading || this.state.intervalShot || this.state.isMastering}  
//                           >
//                             Delete
//                             <i className="bx bx-trash label-icon"></i>
//                           </Button>
//                           <Button color="info" className="ms-2 btn-label" onClick={() => this.enableMasterInfo()}
//                             disabled={this.state.status || this.state.singleshotLoading || this.state.intervalShot || this.state.isMastering}  
//                           >
//                             Info
//                             <i className="bx bx-info-circle label-icon"></i>
//                           </Button>
//                         </div>
//                         : null
//                     }
//                     {
//                       this.state.compInfo?.mastering_status === 'not_started' || this.state.editMode ?
//                         <div>
//                           <Button color="success" className="ms-2 btn-label" onClick={this.createRegion}
//                             disabled={this.state.status || this.state.singleshotLoading || this.state.intervalShot || !this.state.connection || this.state.isMastering}
//                           >
//                             Create Region
//                             <i className="dripicons-plus label-icon"></i>
//                           </Button>
//                           {/* {
//                             this.state.boxes?.length > 0 &&
//                             <Button color="warning" className="ms-2" onClick={() => { this.start_lead_time() }}
//                               style={{ cursor: this.state.status || !this.state.connection || this.state.intervalShot || this.state.isMastering ? "not-allowed" : "pointer" }}
//                               disabled={this.state.status || !this.state.connection || this.state.intervalShot || this.state.isMastering}
//                             >
//                               {
//                                 this.state.isMastering ?
//                                   this.state.compInfo?.mastering_status == 'not_started' ? 'Mastering...' : 'Re-Mastering...'
//                                   :
//                                   this.state.compInfo?.mastering_status == 'not_started' ? 'Master' : 'Re-Master'
//                               }
//                             </Button>
//                           } */}
//                           {
//                             this.state.connection && this.state.boxes?.length > 0 ?
//                             this.state.isMastering ? 
//                             <Button color="danger" className="ms-2" onClick={() => { this.stopMastering() }} >
//                               {
//                                   this.state.compInfo?.mastering_status == 'not_started' ? 'Stop Mastering' : 'Stop Re-Mastering'
//                               }
//                             </Button>
//                             : 
//                             <Button color="warning" className="ms-2" onClick={() => { this.start_lead_time() }} >
//                               {
//                                   this.state.compInfo?.mastering_status == 'not_started' ? 'Start Master' : 'Start Re-Master'
//                               }
//                             </Button>
//                             : null
//                           }
//                         </div>
//                         : null
//                     }
//                   </Col>
//                 </Row>
//                 <div className="d-flex">


//                   {/* justify-content-start  */}
//                   <div className="ms-2 d-flex align-items-center my-2">
//                     <div>

//                     </div>


//                   </div>
//                 </div>



//                 <Modal isOpen={this.state.isRightCanvas} toggle={this.toggleRightCanvas}>
//                   <ModalHeader toggle={this.toggleRightCanvas}>
//                     <div style={{ fontWeight: 'bold' }}>
//                       <span className="mdi mdi-cog-outline me-2"></span>
//                       Settings
//                     </div>
//                   </ModalHeader>
//                   <ModalBody>
//                     <Card
//                       // color={!this.state.editMode ? "danger" : undefined}
//                       className={!this.state.editMode ? "border border-danger" : ""}
//                       style={{ background: '#EFF2F7' }}
//                     >
//                       {
//                         !this.state.editMode &&
//                         <CardHeader className="bg-transparent border-danger">
//                           <p className="my-0 text-danger">
//                             <i className="mdi mdi-block-helper me-3"></i>
//                             {`switch to edit mode to access this settings`}
//                           </p>
//                         </CardHeader>
//                       }
//                       <Nav tabs>
//                         <NavItem>
//                           <NavLink
//                             style={{ cursor: "pointer" }}
//                             className={classnames({
//                               active: this.state.appSettingActiveTab === "1",
//                             })}
//                             onClick={() => {
//                               this.toggleApplicationSetting("1")
//                             }}
//                             disabled={this.state.editMode ? false : true}
//                           >
//                             Application Settings
//                           </NavLink>
//                         </NavItem>
//                         <NavItem>
//                           <NavLink
//                             style={{ cursor: "pointer" }}
//                             className={classnames({
//                               active: this.state.appSettingActiveTab === "2",
//                             })}
//                             onClick={() => {
//                               this.toggleApplicationSetting("2")
//                             }}
//                             disabled={this.state.editMode ? false : true}
//                           >
//                             Network Settings
//                           </NavLink>
//                         </NavItem>
//                       </Nav>
//                       <TabContent activeTab={this.state.appSettingActiveTab} className="p-3 text-muted">
//                         <TabPane tabId="1">
//                           <Row>
//                             <Col sm="12">
//                               <Form>
//                                 <p style={{ fontWeight: 'bold' }}>{`Choose Inspection Type: `}</p>
//                                 <div className="my-3">
//                                   <div className="row">
//                                     <Col sm={6} md={6} lg={6}>
//                                       <Label>
//                                         <Input
//                                           className="me-2"
//                                           type="radio"
//                                           name="temp_insp_type"
//                                           value="rotation"
//                                           checked={this.state.temp_insp_type === 'rotation'}
//                                           onChange={this.handleRadioChange}
//                                           disabled={this.state.editMode ? false : true}
//                                         />
//                                         {`Rotation Based`}
//                                       </Label>
//                                     </Col>
//                                     <Col sm={6} md={6} lg={6}>
//                                       <Label>
//                                         <Input
//                                           className="me-2"
//                                           type="radio"
//                                           name="temp_insp_type"
//                                           value="time"
//                                           checked={this.state.temp_insp_type === 'time'}
//                                           onChange={this.handleRadioChange}
//                                           disabled={this.state.editMode ? false : true}
//                                         />
//                                         {`Time Based`}
//                                       </Label>
//                                     </Col>
//                                   </div>
//                                 </div>
//                                 {
//                                   this.state.temp_insp_type === 'time' &&
//                                   <>
//                                     <div className="row my-3">
//                                       <Col sm={6} md={6} lg={6} className="mt-2">
//                                         <Label className="">{`Time Duration (seconds)`}</Label>
//                                       </Col>
//                                       <Col sm={6} md={6} lg={6}>
//                                         <Input
//                                           type="number"
//                                           placeholder="Enter time duration "
//                                           name="temp_time_duration"
//                                           value={this.state.temp_time_duration}
//                                           onChange={(e) => this.configUpdate(e)}
//                                           disabled={this.state.editMode ? false : true}
//                                         />
//                                         {errors?.temp_time_duration && (
//                                           <p style={{ color: 'red' }}>*{errors.temp_time_duration}</p>
//                                         )}
//                                       </Col>
//                                     </div>
//                                     <div className="row my-3">
//                                       <Col sm={6} md={6} lg={6} className="mt-2">
//                                         <Label className="">{`Lead Time (seconds)`}</Label>
//                                       </Col>
//                                       <Col sm={6} md={6} lg={6}>
//                                         <Input
//                                           type="number"
//                                           placeholder="enter lead time here"
//                                           name="temp_lead_time"
//                                           value={this.state.temp_lead_time}
//                                           onChange={(e) => this.configUpdate(e)}
//                                           disabled={this.state.editMode ? false : true}
//                                         />
//                                         {errors?.temp_lead_time && (
//                                           <p style={{ color: 'red' }}>*{errors.temp_lead_time}</p>
//                                         )}
//                                       </Col>
//                                     </div>
//                                   </>
//                                 }
//                                 {
//                                   this.state.temp_insp_type === 'rotation' &&
//                                   <>
//                                     <div className="row my-3">
//                                       <Col sm={6} md={6} lg={6} className="mt-2">
//                                         <Label className="">{`No. of Rotation`}</Label>
//                                       </Col>
//                                       <Col sm={6} md={6} lg={6}>
//                                         <Input
//                                           type="number"
//                                           placeholder="Enter no. of rotation "
//                                           name="temp_no_of_rotation"
//                                           value={this.state.temp_no_of_rotation}
//                                           onChange={(e) => this.configUpdate(e)}
//                                           disabled={this.state.editMode ? false : true}
//                                         />
//                                         {errors?.temp_no_of_rotation && (
//                                           <p style={{ color: 'red' }}>*{errors.temp_no_of_rotation}</p>
//                                         )}
//                                       </Col>
//                                     </div>
//                                     <div className="row my-3">
//                                       <Col sm={6} md={6} lg={6} className="mt-2">
//                                         <Label className="">{`Lead Time (seconds)`}</Label>
//                                       </Col>
//                                       <Col sm={6} md={6} lg={6}>
//                                         <Input
//                                           type="number"
//                                           placeholder="enter lead time here"
//                                           name="temp_lead_time"
//                                           value={this.state.temp_lead_time}
//                                           onChange={(e) => this.configUpdate(e)}
//                                           disabled={this.state.editMode ? false : true}
//                                         />
//                                         {errors?.temp_lead_time && (
//                                           <p style={{ color: 'red' }}>*{errors.temp_lead_time}</p>
//                                         )}
//                                       </Col>
//                                     </div>

//                                   </>
//                                 }
//                                 <div className="row justify-content-end">
//                                   <Col>
//                                     <div>
//                                       <Button color="primary" onClick={() => this.applicationConfig()}
//                                         disabled={this.state.editMode ? false : true}
//                                       >Apply</Button>
//                                     </div>
//                                   </Col>
//                                 </div>
//                               </Form>
//                             </Col>
//                           </Row>
//                         </TabPane>
//                         <TabPane tabId="2">
//                           <Row>
//                             <Col sm="12">
//                               <Row>
//                                 <Col sm="12">
//                                   <Form>
//                                     <div className="row my-3">
//                                       <Col sm={6} md={6} lg={6} className="mt-2">
//                                         <Label className="">{`Sensor IP-address`}</Label>
//                                       </Col>
//                                       <Col sm={6} md={6} lg={6}>
//                                         <Input type="text" placeholder="Enter IP-address " value={this.state.sensorIP} onChange={(e) => this.configUpdate(e, 'sensor_ip')} 
//                                           disabled={this.state.editMode ? false : true}
//                                         />
//                                         {errors?.sensorIP && (
//                                           <p style={{ color: 'red' }}>*{errors.sensorIP}</p>
//                                         )}
//                                       </Col>
//                                     </div>
//                                     <div className="row justify-content-end">
//                                       <Col>
//                                         <div>
//                                           <Button color="primary" onClick={() => this.sensorNetworkSettings()}
//                                             disabled={this.state.editMode ? false : true}
//                                           >Apply</Button>
//                                         </div>
//                                       </Col>
//                                     </div>
//                                   </Form>
//                                 </Col>
//                               </Row>
//                             </Col>
//                           </Row>
//                         </TabPane>
//                       </TabContent>
//                     </Card>
//                     <Card
//                       outline={!this.state.connection}
//                       color={!this.state.connection ? "danger" : undefined}
//                       className={!this.state.connection ? "border border-danger" : ""}
//                       style={{ background: '#EFF2F7' }}
//                     >
//                       {
//                         !this.state.connection &&
//                         <CardHeader className="bg-transparent border-danger">
//                           <p className="my-0 text-danger">
//                             <i className="mdi mdi-block-helper me-3"></i>
//                             {`sensor connection required to access this settings`}
//                           </p>
//                         </CardHeader>
//                       }
//                       <CardBody>
//                         <CardTitle className="h4 mt-0">Sensor Settings</CardTitle>
//                       </CardBody>
//                       <Nav tabs>
//                         {
//                           this.state.editMode ?
//                             <NavItem>
//                               <NavLink
//                                 style={{ cursor: "pointer" }}
//                                 className={classnames({
//                                   active: this.state.activeTab === "1",
//                                 })}
//                                 onClick={() => {
//                                   this.toggle("1")
//                                 }}
//                               >
//                                 Profile Settings
//                               </NavLink>
//                             </NavItem>
//                             : null
//                         }
//                         <NavItem>
//                           <NavLink
//                             style={{ cursor: "pointer" }}
//                             className={classnames({
//                               active: this.state.activeTab === "2",
//                             })}
//                             onClick={() => {
//                               this.toggle("2")
//                             }}
//                           >
//                             General Settings
//                           </NavLink>
//                         </NavItem>
//                       </Nav>
//                       <TabContent activeTab={this.state.activeTab} className="p-3 text-muted">
//                         {
//                           this.state.editMode ?
//                             <TabPane tabId="1">
//                               <Row>
//                                 <Col sm="12">
//                                   <Form>
//                                     <div className="row my-3">
//                                       <Col sm={6} md={6} lg={6} className="mt-2">
//                                         <Label>{`Exposure Time (µs)`}</Label>
//                                       </Col>
//                                       <Col sm={6} md={6} lg={6}>
//                                         <Input 
//                                           type="number" 
//                                           placeholder="Enter Exposure Time " 
//                                           value={this.state.exposure_time} 
//                                           onChange={(e) => this.configUpdate(e, 3)} 
//                                           disabled={!this.state.connection} 
//                                         />
//                                         {errors?.exposure_time && (
//                                           <p style={{ color: 'red' }}>*{errors.exposure_time}</p>
//                                         )}
//                                       </Col>
//                                     </div>
//                                     <div className="row mb-3">
//                                       <Col sm={6} md={6} lg={6} className="mt-2">
//                                         <Label>{`Measuring Rate (Hz)`}</Label>
//                                       </Col>
//                                       <Col sm={6} md={6} lg={6}>
//                                         <Input 
//                                           type="number" 
//                                           placeholder="Enter Measuring Rate " 
//                                           value={this.state.measuring_rate} 
//                                           onChange={(e) => this.configUpdate(e, 4)} 
//                                           disabled={!this.state.connection} 
//                                         />
//                                         {errors?.measuring_rate && (
//                                           <p style={{ color: 'red' }}>*{errors.measuring_rate}</p>
//                                         )}
//                                       </Col>

//                                     </div>
//                                     <div className="row justify-content-end">
//                                       <Col>
//                                         <div>
//                                           <Button color="primary" onClick={() => this.sensorConfig()} disabled={!this.state.connection}>Apply</Button>
//                                         </div>
//                                       </Col>
//                                     </div>
//                                   </Form>
//                                 </Col>
//                               </Row>
//                             </TabPane>
//                             : null
//                         }

//                         <TabPane tabId="2">
//                           <Row>
//                             <Col sm="12">
//                               <Form>
//                                 <div className="row my-3">
//                                   <Col sm={6} md={6} lg={6} className="mt-2">
//                                     <Label>Reset Sensor Settings</Label>
//                                   </Col>
//                                   <Col sm={6} md={6} lg={6}>
//                                     <Popconfirm
//                                       placement="top"
//                                       title="Confirm reset of sensor settings?"
//                                       onConfirm={(e) => this.sensore_reset()}
//                                       onCancel={() => this.togglePopConfirm('reset', 1)}
//                                       okText="Yes"
//                                       cancelText="No"
//                                       open={this.state.openPopConfirms['reset']}
//                                     >
//                                       <Button
//                                         color="info"
//                                         style={{ cursor: this.state.connection ? 'pointer' : 'not-allowed', width: '100%' }}
//                                         onClick={() => { this.togglePopConfirm('reset', 0) }}
//                                         // onClick={() => { this.sensore_reset() }}
//                                         disabled={this.state.status || !this.state.connection}
//                                       >
//                                         Reset
//                                       </Button>
//                                     </Popconfirm>
//                                   </Col>
//                                 </div>
//                                 <div className="row mb-3">
//                                   <Col sm={6} md={6} lg={6} className="mt-2">
//                                     <Label>Restart</Label>
//                                   </Col>
//                                   <Col sm={6} md={6} lg={6}>
//                                     <Popconfirm
//                                       placement="top"
//                                       title="Confirm sensor restart?"
//                                       onConfirm={(e) => this.sensore_reboot()}
//                                       onCancel={() => this.togglePopConfirm('reboot', 1)}
//                                       okText="Yes"
//                                       cancelText="No"
//                                       open={this.state.openPopConfirms['reboot']}
//                                     >
//                                       <Button
//                                         color="info"
//                                         style={{ cursor: this.state.connection ? 'pointer' : 'not-allowed', width: '100%' }}
//                                         onClick={() => { this.togglePopConfirm('reboot', 0) }}
//                                         disabled={this.state.status || !this.state.connection}
//                                       >
//                                         Apply
//                                       </Button>
//                                     </Popconfirm>
//                                   </Col>
//                                 </div>
//                               </Form>
//                             </Col>
//                           </Row>
//                         </TabPane>

//                       </TabContent>
//                     </Card>
//                   </ModalBody>
//                 </Modal>

//                 <Card className="px-2 py-2">
//                   <Row>
//                     <Col md={3} lg={3}>{''}</Col>
//                     <Col md={3} lg={3}>
//                       <div>
//                         {
//                           this.state.startLeadTime &&
//                           <div className="d-flex justify-content-start">
//                             <p className='mt-1' style={{ fontWeight: 'bold' }}>{`Lead Time: `}</p>
//                             <CountdownTimer 
//                               backgroundColor="#e6e46f" 
//                               hideDay={true} 
//                               hideHours={false}
//                               count={this.state.leadTime} 
//                               // count={this.state.compInfo.lead_time} 
//                               onEnd={() => { this.onTimeup1() }} 
//                             />
//                           </div>
//                         }
//                       </div>
//                       {
//                         this.state.isCapturing &&
//                         <div className="d-flex align-items-center">
//                           <p className='mt-1 ms-2' style={{ fontWeight: 'bold' }}>
//                             Capturing...
//                           </p>
//                         </div>
//                       }
//                     </Col>
//                     <Col md={3} lg={3}>
//                       {
//                         // this.state.compInfo?.insp_based_on === 'rotation' &&
//                         // this.state.isMastering &&
//                         <div className="d-flex align-items-center">
//                           <p className='mt-1 ms-2' style={{ fontWeight: 'bold' }}>
//                             Rotation Status:
//                           </p>
//                           {
//                             this.state.isRotationStarted === 0 ? (
//                               <p className="ms-2 badge badge-soft-primary" style={{ fontWeight: 'bold' }}>
//                                 Not Started
//                               </p>
//                             ) : this.state.isRotationStarted === 1 ? (
//                               <p className="ms-2 badge badge-soft-info" style={{ fontWeight: 'bold' }}>
//                                 In Progress...
//                               </p>
//                             ) : this.state.isRotationStarted === 2 ? (
//                               <p className="ms-2 badge badge-soft-success" style={{ fontWeight: 'bold' }}>
//                                 Completed
//                               </p>
//                             ) : null
//                           }
//                         </div>
//                       }
//                       {/* <div>
//                 <p className='mt-1 ms-2' style={{ fontWeight: 'bold' }}>No. of Profiles Taken: {this.state.profileNo}</p>
//                 </div> */}
//                     </Col>

//                     <Col md={3} lg={3}>
//                       <div>
//                         {
//                           this.state.counter &&
//                           <div className="d-flex justify-content-start">
//                             <p className='mt-1' style={{ fontWeight: 'bold' }}>{`Capture Duration: `}</p>
//                             <CountdownTimer
//                               backgroundColor="#e6e46f"
//                               hideDay={true}
//                               hideHours={false}
//                               count={this.state.timeDuration}
//                               // count={this.state.compInfo.time_duration} 
//                               onEnd={() => { this.onTimeup() }}
//                             />
//                           </div>
//                         }
//                       </div>
//                       <div>
//                         {
//                           this.state.inspBasedOn === 'rotation' && // this.state.compInfo?.insp_based_on === 'rotation' &&
//                           <div className="d-flex justify-content-start">
//                             <p className='mt-1' style={{ fontWeight: 'bold' }}>
//                               {`Rotation Completed: ${this.state.done_rotation}/${this.state.noOfRotation}`}
//                             </p>
//                           </div>
//                         }
//                       </div>
//                     </Col>
//                   </Row>
//                   <Row>
//                     <Col md={2}>
//                       <div className="d-flex flex-wrap">
//                         <div className="btn-group-vertical">
//                           <Button
//                             color={this.state.connection ? 'danger' : 'success'}
//                             outline={this.state.modelfilter !== 0}
//                             className="w-md m-1"
//                             onClick={() => {
//                               this.changeConnection();
//                             }}
//                             disabled={this.state.status || this.state.singleshotLoading || this.state.intervalShot || this.state.isMastering || this.state.connecting}
//                           >
//                             {
//                               !this.state.connecting ?
//                             this.state.connection ?
//                               <span className="mdi mdi-lan-disconnect" >{'  '}Disconnect</span> :
//                               <span className="mdi mdi-lan-connect" >{'  '}Connect</span> :
//                               <span className="mdi mdi-lan-connect" >{'  '}Connecting...</span> 
//                             }
//                           </Button>

//                           <Button
//                             outline={this.state.modelfilter !== 0}
//                             className="w-md m-1"
//                             color="primary" onClick={this.toggleRightCanvas}
//                             disabled={this.state.status || this.state.singleshotLoading || this.state.intervalShot || this.state.isMastering}
//                           >
//                             <span className="mdi mdi-cog-outline">{'  '}Settings</span>
//                           </Button>
//                           <Button
//                             color="warning"
//                             outline={this.state.modelfilter !== 1}
//                             className="m-1"
//                             style={{ cursor: this.state.connection ? 'pointer' : 'not-allowed' }}
//                             onClick={() => { this.triggerSensor() }}
//                             disabled={this.state.status || !this.state.connection || this.state.intervalShot || this.state.isMastering}
//                           >
//                             {this.state.singleshotLoading ? <Spinner size="sm" /> : 'Single Shot'}
//                           </Button>
//                           {/* <Button
//                             color="info"
//                             outline={this.state.modelfilter !== 1}
//                             className="m-1"
//                             style={{ cursor: this.state.connection ? 'pointer' : 'not-allowed' }}
//                             onClick={this.intervalTrigger}
//                             // onClick={this.state.intervalShot ? this.stopTrigger : this.intervalTrigger}
//                             // {this.state.intervalShot ? `Stop` : `Interval Shot`}
//                             disabled={this.state.status || !this.state.connection || this.state.intervalShot || this.state.isMastering}
//                           >
//                             Interval Shot
//                           </Button> */}

//                           <Button
//                             color={this.state.status ? 'danger' : 'success'}
//                             outline={this.state.modelfilter !== 0}
//                             className="w-md m-1"
//                             style={{ cursor: this.state.connection ? 'pointer' : 'not-allowed' }}
//                             onClick={() => {
//                               this.changeStatus();
//                             }}
//                             disabled={!this.state.connection || this.state.singleshotLoading || this.state.intervalShot || this.state.isMastering}
//                           >
//                             {this.state.status ?
//                               <span className="dripicons-media-pause" >{'  '}Stop Capturing</span> :
//                               <span className="dripicons-media-play" >{'  '}Start Capturing</span>}
//                           </Button>
//                           {/* <Button
//                             outline={this.state.modelfilter !== 0}
//                             className="w-md m-1"
//                             color="info" onClick={this.createRegion}
//                             disabled={this.state.status || this.state.singleshotLoading || this.state.intervalShot || !this.state.connection || this.state.isMastering}
//                           >
//                             <span className="dripicons-plus">{'  '}Create Region</span>
//                           </Button> */}
//                         </div>
//                       </div>
//                       <div>
//                         <p className="ms-1 my-2" style={{ fontWeight: 'bold' }}>{`Capture Master Data`}</p>
//                         <ButtonGroup>
//                           <Input
//                             type="text"
//                             value={
//                               this.state.inspBasedOn === 'rotation' ? `Rotation Based`
//                                 : this.state.inspBasedOn === 'time' ? `Time Based` : null
//                             }
//                             disabled
//                           // style={{ width: '200px' }}
//                           />
//                           <Button color="primary" 
//                             // onClick={this.toggleRightCanvas}
//                             onClick={
//                               !this.state.isMastering 
//                                 ? this.toggleRightCanvas
//                                 : null
//                             }
//                             style={{
//                               cursor: this.state.isMastering ? "not-allowed" : "pointer"
//                             }}
//                           >
//                             <span className="dripicons-document-edit"></span>
//                           </Button>
//                         </ButtonGroup>
//                       </div>

//                       <div className="accordion my-3" id="accordion">
//                         <div className="accordion-item">
//                           <h2 className="accordion-header" id="headingOne">
//                             <button
//                               className="btn btn-outline-primary w-100"
//                               onClick={this.t_col1}
//                               style={{
//                                 cursor: this.isButtonDisabled() ? "not-allowed" : "pointer"
//                               }}
//                               disabled={this.isButtonDisabled()}
//                             >
//                               <div className="d-flex justify-content-between">
//                                 <div>Regions</div>
//                                 <div>
//                                   {this.state.col1 ? (
//                                     <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368">
//                                       <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z" />
//                                     </svg>
//                                   ) : (
//                                     <svg height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368">
//                                       <path d="m256-424-56-56 280-280 280 280-56 56-224-223-224 223Z" />
//                                     </svg>
//                                   )}
//                                 </div>
//                               </div>
//                             </button>
//                           </h2>
//                           {this.state.col1 && (
//                             <Collapse isOpen={this.state.col1} className="accordion-collapse">
//                               <div className="accordion-body">
//                                 <Row>
//                                   <div style={{ maxHeight: '300px', overflowY: 'auto', width: '100%' }}>
//                                     {this.state.boxes.length > 0 ? (
//                                       this.state.boxes.map((item, index) => (
//                                         <Col
//                                           key={index}
//                                           style={{
//                                             display: 'flex',
//                                             alignItems: 'center',
//                                             justifyContent: 'space-between',
//                                             backgroundColor: 'rgb(67, 106, 225)',
//                                             color: '#fff',
//                                             padding: '10px',
//                                             margin: '5px',
//                                             borderRadius: '5px',
//                                           }}
//                                         >
//                                           <span style={{ fontWeight: 'bold' }}>{item.name}</span>
//                                           <div style={{ display: 'flex', gap: '10px' }}>
//                                             {/* Region Edit Icon */}
//                                             <span
//                                               className="dripicons-document-edit"
//                                               style={{
//                                                 cursor: this.isButtonDisabled() ? "not-allowed" : "pointer"
//                                               }}
//                                               onClick={
//                                                 !this.isButtonDisabled()
//                                                   ? (e) => this.toggleRegionEdit(e, item, index)
//                                                   : null
//                                               }
//                                             ></span>

//                                             {/* Region Delete Icon */}

//                                             {!this.isButtonDisabled() ? (
//                                               <Popconfirm
//                                                 placement="rightBottom"
//                                                 title="Delete this region?"
//                                                 onConfirm={(e) => this.regionDelete(e, item, index)}
//                                                 onCancel={() => this.togglePopConfirm(index, 1)}
//                                                 okText="Yes"
//                                                 cancelText="No"
//                                                 open={this.state.openPopConfirms[index]}
//                                               >
//                                                 <span
//                                                   className="dripicons-trash"
//                                                   style={{ cursor: "pointer", color: 'red' }}
//                                                   onClick={() => this.togglePopConfirm(index, 0)}
//                                                 ></span>
//                                               </Popconfirm>
//                                             ) : (
//                                               <span
//                                                 className="dripicons-trash"
//                                                 style={{ cursor: "not-allowed", color: 'red' }}
//                                               ></span>
//                                             )}

//                                           </div>
//                                         </Col>
//                                       ))
//                                     ) : (
//                                       <p className="text-center w-100">No Region Draw</p>
//                                     )}
//                                   </div>
//                                 </Row>
//                               </div>
//                             </Collapse>
//                           )}
//                         </div>
//                       </div>
//                       {
//                         this.state.compInfo?.mastering_status == 'completed' ?
//                         <Button color="info" onClick={() => this.view3D()}>view 3D</Button>
//                         : null
//                       }
//                       {/* {
//                         <div>
//                           <Checkbox onChange={this.singleSensor}>1d Sensor </Checkbox>
//                           {
//                             this.state.oneDsensor &&(
//                               <div >
//                                 {this.state.combinedSensor ? 
//                                 <>
//                                 <Button color="danger" className="mx-1" onClick={this.oneDDisconnection}>Disconnect</Button>
//                                 <Button className="mx-1" onClick={this.combinedTest}>
//                                   {
//                                     this.state.is_combined_trigger ? 'Triggering...' : 'Trigger'
//                                   }
//                                 </Button>
//                                 </>:
//                                 <>
//                                 <Button color="success" className="mx-1" onClick={this.oneDconnection}>Connect</Button>    
//                                 </>
//                                 }
//                               </div>
//                             )
//                           }
//                         </div>
//                       } */}
                      

//                       {/* {
//                         this.state.boxes?.length > 0 &&
//                         <div className="d-flex flex-wrap">
//                           <div className="btn-group-vertical">
//                             <Button
//                               outline={this.state.modelfilter !== 0}
//                               className="w-md m-1 my-2"
//                               color="warning"
//                               onClick={() => { this.start_lead_time() }}
//                               // disabled={!this.state.connection}
//                               style={{ cursor: this.state.status || !this.state.connection || this.state.intervalShot || this.state.isMastering ? "not-allowed" : "pointer" }}
//                               disabled={this.state.status || !this.state.connection || this.state.intervalShot || this.state.isMastering}
//                             >
//                               {
//                                 this.state.isMastering ?
//                                   this.state.compInfo?.mastering_status == 'not_started' ? 'Mastering...' : 'Re-Mastering...'
//                                   :
//                                   this.state.compInfo?.mastering_status == 'not_started' ? 'Master' : 'Re-Master'
//                               }
//                             </Button>
//                           </div>
//                         </div>
//                       } */}
//                     </Col>
//                     <Col md={10}>
//                       {
//                         this.state.compInfo && this.state.compInfo._id && !this.state.testing ? (
//                           <PointCloudPlot
//                             ref={this.pointCloudPlotRef}
//                             comp_id={this.state.compInfo._id}
//                             regions={this.state.testing_region}

//                             boxes={this.state.boxes}
//                             draggingBoxId={this.state.draggingBoxId}
//                             isDragging={this.state.isDragging}
//                             setBoxes={this.setBoxes}
//                             setDraggingBoxId={this.setDraggingBoxId}
//                             setIsDragging={this.setIsDragging}
//                             stopIntervalShot={this.changeIntervalStopState}

//                             is_mastering={this.state.mastering}
//                             changeContTrigger={this.changeStatus1}
//                             disable_end_testing={this.disable_end_testing}
//                             no_of_rotation={this.state.noOfRotation}
//                             counter={this.state.counter}
//                             end_testing={this.state.end_testing}
//                             compInfo={this.state.compInfo}
//                             onTimeup={this.onTimeup}
//                             startLeadTime={this.state.startLeadTime}
//                             onTimeup1={this.onTimeup1}
//                             changeProfileNo={this.changeProfileNo}
//                             done_rotation={this.state.done_rotation}
//                             isRotationStarted={this.state.isRotationStarted}
//                             setDoneRotation={this.setDoneRotation}
//                             setIsRotationStarted={this.setIsRotationStarted}

//                             capturedFileId={this.state.capturedFileId}
//                             isLoadingProfile={this.state.isLoadingProfile}
//                             completePlotting={this.completePlotting}
//                             exposureTime={this.state.exposure_time}
//                             measuringRate={this.state.measuring_rate}

//                             timeDuration={this.state.timeDuration}
//                             noOfRotation={this.state.noOfRotation}
//                             leadTime={this.state.leadTime}
//                             inspBasedOn={this.state.inspBasedOn}
                            
//                             start1Dtest={this.start1Dtest}

//                             stop_mastering_process = {this.state.stop_mastering_process}
//                             toggleStopMastering = {this.toggleStopMastering}
//                             isButtonDisabled = {this.isButtonDisabled}
//                           />
//                         ) : null
//                         // (
//                         //   this.state.compInfo && this.state.compInfo._id && (
//                         //     <TestingPointCloud
//                         //       comp_id={this.state.compInfo._id}
//                         //       testRegion={this.state.testing_region}
//                         //       start_test={this.state.start_test}
//                         //       test_id={this.state.test_id}
//                         //       no_of_rotation={this.state.compInfo.no_of_rotation}
//                         //       end_testing={this.state.end_testing}
//                         //       counter={this.state.counter}
//                         //       changeContTrigger={this.changeStatus1}
//                         //       disable_end_testing={this.disable_end_testing}
//                         //       compInfo={this.state.compInfo}
//                         //       onTimeup={this.onTimeup}
//                         //       startLeadTime={this.state.startLeadTime}
//                         //       onTimeup2={this.onTimeup2}
//                         //     />
//                         //   )
//                         // )
//                       }
//                     </Col>
//                     {/* <Col md={10}>
//                       {
//                         this.state.connection &&
//                         <GraphComponent />
//                       }
//                       </Col> */}
//                   </Row>
//                 </Card>
//               </Container>
//             </div>
//         }

//         {
//           this.state.showDeleteMaster ?
//             <SweetAlert
//               title="Confirm Deletion?"
//               warning
//               showCancel
//               confirmBtnBsStyle="success"
//               cancelBtnBsStyle="danger"
//               onConfirm={() => this.clearConfirmCancel('confirm', "Master Data Deleted")}
//               onCancel={() => this.clearConfirmCancel('cancel', "Cancelled")}
//               closeOnClickOutside={false}
//               style={{ width: 'auto' }}
//             >
//               <h5 className="my-2" style={{ fontWeight: 'bold' }}>
//                 Do you want to delete the mastered data for this component?
//               </h5>
//               {
//                 this.state.comp_assigned_stations.length > 0 &&
//                 <div>
//                   <div className="my-2" style={{ fontWeight: 'bold' }}>This component data is removed from following stations.</div>
//                   <div className="table-responsive">
//                     <Table striped>
//                       <thead>
//                         <tr>
//                           <th>S.No.</th>
//                           <th>Station Name</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {this.state.comp_assigned_stations.map((station, index) => (
//                           <tr key={index}>
//                             <td>{index + 1}</td>
//                             <td>{station}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </Table>
//                   </div>

//                 </div>
//               }
//             </SweetAlert> : null
//         }


//         {this.state.success_dlg ? (
//           <SweetAlert
//             success
//             title={this.state.dynamic_title}
//             onConfirm={() => this.setState({ success_dlg: false })}
//           >
//             {this.state.dynamic_description}
//           </SweetAlert>
//         ) : null}
//         {this.state.error_dlg ? (
//           <SweetAlert
//             error
//             title={this.state.dynamic_title}
//             onConfirm={() => this.setState({ error_dlg: false })}
//           >
//             {this.state.dynamic_description}
//           </SweetAlert>
//         ) : null}

//         <MasterInfoModal
//           isOpen={this.state.showMasterInfo}
//           toggle={this.hideMasterInfo}
//           regions={this.state.regionInfo}
//           stations={this.state.comp_assigned_stations}
//         />

//         <OneDTwoDRunoutResults
//           isOpen={this.state.show_one_d_result}
//           toggle={this.closeOneDResult}
//           oneDRunout={this.state.one_d_runout}
//           twoDRunout={this.state.two_d_runout}
//         />
//       </>
//     );
//   }
// }