import React, { Component } from "react";
import MetaTags from "react-meta-tags";
import {
  Container,
  CardTitle,
  Button,
  Col,
  Row,
  Modal,
  Form,
  Label,
  Input,
  Table,
  FormGroup,
  Spinner,
  Card,
  CardBody,
  UncontrolledTooltip
} from "reactstrap";
import urlSocket from "../AdminInspection/urlSocket";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Switch } from "antd";
// import SearchField from "react-search-field";
// import { TableHeader, PaginationComponent} from "../pages/Tables/DatatableTables"
import Pagination from 'react-bootstrap/Pagination';
import 'bootstrap/dist/css/bootstrap.min.css';

import Swal from "sweetalert2";
// Image import 
import Nodata_admin from "assets/images/nodata/nodata_admin.jpg";
// Css for Admin_ui 
import 'assets/css/admin_ui.css';
import { connect } from "react-redux";
import { makeHeaderBtn } from "store/actions";
import Breadcrumbs from "components/Common/Breadcrumb";


const getBadgeClass = (status) => {
  const badgeClassMap = {
      "No Models Available": "badge-soft-secondary",
      "Draft": "badge-soft-warning",
      "Approved": "badge-soft-success",
      "Live": "badge-soft-info",
  };
  return badgeClassMap[status] || "badge-default"; // Default class if status not found
};

class compInfo extends Component {
  static propTypes = { 
    history: PropTypes.any.isRequired, 
    dispatch: PropTypes.func.isRequired, // Add dispatch to propType
   };

  constructor(props) {
    super(props);
    this.state = {
      addCompModal: false,
      comp_name: "",
      comp_code: "",
      componentNameError: "",
      componentCodeError: "",
      componentList: [],
      model_info: [],
      ver_log: [],
      SearchField: "",
      originalData: [],
      search_componentList: [],
      selectFilter: 0,
      modelfilter: 0,
      filter_compStatus: "all",
      filter_modelStatus: "all",
      sorting: { field: "", order: "" },
      items_per_page_stock: 100,
      currentPage_stock: 1,
      cameraOpen: false,
      isLoading: false,
      currentPage: 1,
      itemsPerPage: 10,
     
    };
  }

  


  // model status color code 


  componentDidMount() {
    this.getComp_info();
    this.props.dispatch(makeHeaderBtn(false))
  }

  bgremovefunction = () => {
    this.setState(prevState => ({
      bgremove: !prevState.bgremove,
    }));
  };

 

  getComp_info = async () => {
    try {
      const response = await urlSocket.post("/get_comp_info", {
        mode: "no-cors",
      });
      const data = response.data;
      // this.statusinfo(data);
      this.setState({ componentList: data, search_componentList: data });
      console.log("data58", data);
    } catch (error) {
      console.log(error);
    }
  };

  getModel_info = async () => {
    try {
      const response = await urlSocket.post("/get_model_info", {
        mode: "no-cors",
      });
      const data = response.data;
      this.setState({ model_info: data });
      console.log("data58", data);
    } catch (error) {
      console.log(error);
    }
  };



  modelInfo = (data,index) => {
    console.log("data95", data,index);
    let test = true ? index === 2 : false
    console.log('test355', test)
    let modelInfo_data = {
      compInfo: data,
      modelInfo: this.state.model_info,
      test:test
    };
    console.log("modelInfo_data", modelInfo_data);
    this.props.dispatch(makeHeaderBtn(true))
    sessionStorage.removeItem("manageData");
    sessionStorage.setItem("manageData", JSON.stringify(modelInfo_data));
    this.props.history.push("/measurement_info");
  };
  
  gotoMultiMeasurement = (data) => {
    let modelInfo_data = {
      compInfo: data,
    };
    this.props.dispatch(makeHeaderBtn(true))
    sessionStorage.removeItem("manageData");
    sessionStorage.setItem("manageData", JSON.stringify(modelInfo_data));
    this.props.history.push("/multi_measurement");
  };

  onChange = async (checked, data) => {
    console.log(`switch to ${checked}`); //boolean convert to string
    let comp_id = data._id;
    let comp_name = data.comp_name;
    let comp_code = data.comp_code;
    try {
      const response = await urlSocket.post(
        "/comp_status_upd",
        {
          _id: comp_id,
          comp_name: comp_name,
          comp_code: comp_code,
          comp_status: checked,
        },
        { mode: "no-cors" }
      );
      const data = response.data;
      console.log("data117", data);

      Swal.fire({
        icon: "success",
        // title: `"${comp_name}" has been set to <span style="color: ${ checked ? "green" : "red" }">${checked ? "Active" : "Inactive"}</span>.`,
        title: '<span style="font-size: 15px;">Confirmation</span>',
        html: `<span style="font-size: 14px;">"${comp_name}" has been set to <span style="color: ${checked ? "green" : "red"}; font-size: 18px; font-weight: 500;">${checked ? "Active" : "Inactive"}</span>.</span>`,
        showConfirmButton: false,
        timer: 4000, // 4 seconds
      });

      // this.setState({ componentList: data,originalData:data,search_componentList:data})
      if (this.state.selectFilter === 1) {
        this.activeOrInactive(true, 1);
      } else if (this.state.selectFilter === 2) {
        this.activeOrInactive(false, 2);
      } else if (this.state.selectFilter === 0) {
        this.activeOrInactive("all", 0);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  statusinfo = data => {
    console.log("componentinfo", data);
    try {
      urlSocket
        .post("/model_status_change", { modelData: data }, { mode: "no-cors" })
        .then(response => {
          let data1 = response.data;
          console.log("model_status_change106", data1);
          this.setState({
            componentList: data1,
            originalData: data1,
            search_componentList: data1,
          });
        })
        .catch(error => {
          console.log(error);
        });
    } catch (error) {
      console.log("----", error);
    }
  };

  logComp = data => {
    console.log("first", data);
    if (data.datasets === undefined) {
      data.datasets = [];
    }
    let { comp_name, comp_code, _id } = data;

    let datas = {
      component_name: comp_name,
      component_code: comp_code,
      datasets: data.datasets,
      status: data.status,
      positive: data.positive,
      negative: data.negative,
      posble_match: data.posble_match,
      _id,
      config_data: this.state.config_data,
    };
    console.log("datas", datas);
    sessionStorage.removeItem("compData");
    sessionStorage.setItem("compData", JSON.stringify(datas));
    this.setState({
      component_code: comp_code,
      component_name: comp_name,
      _id,
    });

    this.props.history.push('/comp_log')

  };

  manageStation = value => {
    console.log("data", value);

    if(value.mastering_status != "completed") {
      Swal.fire({
        icon: 'warning',
        title: 'Complete Mastering before Assigning it to the Station',
        confirmButtonText: 'OK',
      });
      return;
    }

    let data = {
      component_info: value,
      page_info: "/comp_info",
    };

    sessionStorage.removeItem("InfoComp");
    sessionStorage.setItem("InfoComp", JSON.stringify(data));
    this.props.history.push("/station_data");
  };

  info = data => {
    this.setState({ modal_center: true });
    console.log("info button works", data);
    try {
      urlSocket
        .post("/version_info", { comp_id: data._id }, { mode: "no-cors" })
        .then(response => {
          let data1 = response.data;
          console.log("model_status_change207", data1);
          data1.sort((a, b) => a.model_live_ver - b.model_live_ver);
          console.log("data1213", data1);
          this.setState({ ver_log: data1 });
        })
        .catch(error => {
          console.log(error);
        });
    } catch (error) {
      console.log("----", error);
    }
  };

  // integration part for filters and search bar on 20/1/24 by Revathi

  activeOrInactive = (string, value) => {
    console.log("string##", string);
    const { originalData } = this.state;
    console.log("originalData+++", originalData);
    this.setState({ selectFilter: value, filter_compStatus: string ,SearchField: '' });
    let filter_model_sts = this.state.filter_modelStatus;
    console.log("filter_moddel_sts", filter_model_sts);

    try {
      urlSocket
        .post(
          "/active_inactive",
          { is_active: string, model_status: filter_model_sts },
          { mode: "no-cors" }
        )
        .then(response => {
          let data = response.data;
          console.log("is_active", data);

          if (data.length === 0 || data === null || data === undefined) {
            this.setState({ componentList: [], search_componentList: data,currentPage:1 });
          } else {
            this.setState({ componentList: data, search_componentList: data ,currentPage:1});
          }
        })
        .catch(error => {
          console.log(error);
        });
    } catch (error) {}
  };

  modelFilter = (str, value) => {
    console.log("string##", str);
    const { originalData } = this.state;
    console.log("originalData+++", originalData);
    this.setState({ modelfilter: value, filter_modelStatus: str });
    let filter_comp_sts = this.state.filter_compStatus;
    console.log("filter_comp_sts", filter_comp_sts);

    try {
      urlSocket
        .post(
          "/model_status_filter",
          { model_status: str, comp_status: filter_comp_sts },
          { mode: "no-cors" }
        )
        .then(response => {
          let data = response.data;
          console.log("311", data);

          if (data.length === 0 || data === null || data === undefined) {
            this.setState({ componentList: [], search_componentList: data });
          } else {
            this.setState({ componentList: data, search_componentList: data });
          }
        })
        .catch(error => {
          console.log(error);
        });
    } catch (error) {}
  };

  onSearch = search => {
    console.log("e", search);
    // clearTimeout(this.state.timeout)
    this.setState({ search, SearchField: search, currentPage_stock: 1,currentPage: 1 });
    setTimeout(() => {
      this.dataListProcess();
    }, 100);
  };

  dataListProcess = () => {
    try {
      let {
        search_componentList,
        search,
        sorting,
        currentPage_stock,
        items_per_page_stock,
      } = this.state;
      console.log(
        "serach_componentList",
        search_componentList,
        search,
        sorting
      );

      if (search) {
        search_componentList = search_componentList.filter(
          d =>
            d.comp_name.toUpperCase().includes(search.toUpperCase()) ||
            d.comp_code.toUpperCase().includes(search.toUpperCase())
        );
      }

      if (sorting.field) {
        const reversed = sorting.order === "asc" ? 1 : -1;
        search_componentList = search_componentList.sort(
          (a, b) => reversed * a[sorting.field].localeCompare(b[sorting.field])
        );
      }
      let d = search_componentList.slice(
        (currentPage_stock - 1) * items_per_page_stock,
        (currentPage_stock - 1) * items_per_page_stock + items_per_page_stock
      );
      this.setState({
        componentList: d,
        totalItems_stock: search_componentList.length,
        dataloaded: true,
      });
      // console.log('this.state.', this.state.componentList, this.state.totalItems_stock)
    } catch (error) {}
  };

  handleModalClosed() {
    console.log(
      "Modal closed. Perform any cleanup or additional actions here."
    );

    this.setState({
      addCompModal: false, // Optionally close the modal if needed
      comp_name: "", // Reset component name
      comp_code: "", // Reset component code
      componentNameError: "", // Reset error messages
      componentCodeError: "",
      cameraOpen: false, // Ensure camera is closed when modal is closed
      includeCamera: false,
      qr_value: "",
      qr_valueerror: "",
      bgremove: true,
    });
  }

  handleIncludeCameraToggle = () => {
    this.setState(prevState => ({
      includeCamera: !prevState.includeCamera,
      cameraOpen: !prevState.cameraOpen,
      isLoading: true,
      qr_valueerror: "",
      qr_value: "", // Close camera when includeCamera is toggled off
    }));
  };

  handleWebcamLoad = msg => {
    if (msg == "error") {
      console.log("data525 camera disconnected");
      this.setState({ isLoading: true });
    } else {
      console.log("data525 camera connected");
      this.setState({ isLoading: false });
    }
  };

  checkBarCode = async () => {
    this.setState({ qr_not_found: false, qr_valueerror: "" });

    const { comp_name, comp_code } = this.state;

    const formData = new FormData();

    const imageSrc = this.webcam.getScreenshot({ width: 1440, height: 1080 });
    const blob = await fetch(imageSrc).then(res => res.blob());
    const today = new Date();
    const _today = today.toLocaleDateString();
    const time = today.toLocaleTimeString().replace(/:/g, "_");

    const compdata = `${comp_name}_${comp_code}_${_today}_${time}`;

    formData.append("datasets", blob, `${compdata}.png`);

    try {
      await urlSocket
        .post("/qr_add_comp", formData, {
          headers: {
            "content-type": "multipart/form-data",
          },
          mode: "no-cors",
        })
        .then(async qr_result => {
          console.log("qr_result401: ", qr_result.data);

          if (qr_result.data != "QR not found") {
            this.setState({ qr_value: qr_result.data.data });
          } else {
            this.setState({ qr_not_found: true, qr_value: qr_result.data });
          }
        });
    } catch (error) {
      console.log("error401: ", error);
    }
  };

  checkWebcam = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputDevices = devices.filter(
        device => device.kind === "videoinput"
      );
      if (!videoInputDevices.length) {
        this.setState({ webcamEnabled: false, cameraDisconnected: true }); // Show popup if no webcam is found
      } else {
        this.setState({
          webcamEnabled: true,
          cameraDisconnected: false,
          videoInputDevices,
        });
      }
    } catch (error) {
      console.error("Error checking devices:", error);
    }
  };

  handleCameraChange = event => {
    const selectedCamera = event.target.value;
    this.setState({ selectedCamera });
  };


  submitForm = async () => {
    const { comp_name, comp_code, includeCamera, qr_value, bgremove } = this.state;
    console.log('submitForm', comp_name, comp_code, includeCamera, qr_value, bgremove)
    this.setState({
      componentNameError: "",
      componentCodeError: "",
      qr_valueerror: "",
    });
    let qr_data = includeCamera ? qr_value : "";
    // let qr_data = includeCamera ? qr_value.trim().toUpperCase() : 'NA';

    const trimmedComponentName = comp_name.trim().toUpperCase();
    const trimmedComponentCode = comp_code.trim().toUpperCase();

    if (!trimmedComponentName || !trimmedComponentCode) {
      this.setState({
        componentNameError: !trimmedComponentName
          ? "The component name is required"
          : "",
        componentCodeError: !trimmedComponentCode
          ? "The component code is required"
          : "",
      });
    }
    else if (trimmedComponentName.length<3){
      this.setState({
        componentNameError: 'Component name must be at least 3 characters long.',
      });
    }
    else if (trimmedComponentCode.length<1){
      this.setState({
        componentCodeError: 'Component code must be at least 1 characters long.',
      });
    }
    else if (trimmedComponentCode.length > 10){
      this.setState({
        componentCodeError: 'Component code must be less than 10 characters long.',
      });
    }
    else if (trimmedComponentName.length > 40){
      this.setState({
        componentNameError: 'Component name must be less than 40 characters long.',
      });
    }
     else if (trimmedComponentCode.includes("-")) {
      this.setState({
        componentCodeError: 'Component code cannot include the "-" symbol',
      });
    } else if (includeCamera && (!qr_data || qr_data === "QR NOT FOUND")) {
      this.setState({ qr_valueerror: "Proper QR/Bar Code is required" });
    } else {
      try {
        const response = await urlSocket.post(
          "/add_comp",
          {
            comp_name: trimmedComponentName,
            comp_code: trimmedComponentCode,
          },
          { mode: "no-cors" }
        );
        const data = response.data;
        console.log(data);

        if (data === "Comp code is already created") {
          this.setState({
            componentCodeError: "The component code is already created",
          });
        } else if (data === "Comp name is already created") {
          this.setState({
            componentNameError: "The component Name is already created",
          });
        } else if (data === "QR/Bar code is already created") {
          this.setState({ qr_valueerror: "QR/Bar code is already created" });
        } else {
          this.setState({
            addCompModal: false,
            componentList: data,
            originalData: data,
            search_componentList: data,
            comp_name: "",
            comp_code: "",
            componentCodeError: "",
            componentNameError: "",
            SearchField:'',
            selectFilter:0
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  };



validateComponentName = (value) => {
    if (value.length < 3) {
      this.setState({ componentNameError: "Component name must be at least 3 characters long." });
    } else if (value.length > 40) {
      this.setState({ componentNameError: "Component name must be less than 40 characters long." });
    } else {
      this.setState({ componentNameError: "" }); // Clear the error if it's valid
    }
  };

  

  validateComponentCode = (value) => {
    if (value.length < 1) {
      this.setState({ componentCodeError: "Component code must be at least 1 characters long." });
    } else if (value.length > 10) {
      this.setState({ componentCodeError: "Component code must be less than 10 characters long." });
    } else {
      this.setState({ componentCodeError: "" }); // Clear the error if it's valid
    }
  };

  handlePageChange = (pageNumber) => {
    this.setState({ currentPage: pageNumber });
  };
  

  render() {
    const {
      comp_name,
      comp_code,
      componentNameError,
      componentCodeError,
      ver_log,
    } = this.state;

    const { componentList, currentPage, itemsPerPage } = this.state;

    // Calculate indices for slicing the component list
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = componentList.slice(indexOfFirstItem, indexOfLastItem);

    const startComponent = (currentPage - 1) * itemsPerPage + 1;
    const endComponent = Math.min(currentPage * itemsPerPage, componentList.length);

    // Generate page numbers
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(componentList.length / itemsPerPage); i++) {
      pageNumbers.push(i);
    }

    return (
      <React.Fragment>
        <div className="page-content">

          <MetaTags> <title>Inspection | RunOut</title> </MetaTags>
          <Breadcrumbs title="COMPONENT INFORMATION" />

          <Container fluid>

            <Card>
              <CardBody>
                <Row className="mb-2">
                  <Col sm={3}>
                    {/* <Input
                      type="search"
                      placeholder="Search Component Name"
                      autoFocus
                      searchText={this.state.SearchField}
                      onChange={(e) => this.onSearch(e.target.value)}
                      style={{ cursor: "auto", }}
                      classNames="custom-search-field"
                    /> */}
                    <div className="search-box">
                      <div className="position-relative">
                        <Input
                          onChange={(e) => this.onSearch(e.target.value)}
                          id="search-user"
                          type="text"
                          className="form-control"
                          placeholder="Search..."
                          value={this.state.SearchField}
                        />
                        <i className="bx bx-search-alt search-icon" />
                      </div>
                    </div>
                  </Col>
                  <Col>
                    <div className="text-end">
                      <div className="btn-group">
                        <Button color="primary" outline={this.state.selectFilter !== 0} className="w-sm btn btn-sm" onClick={() => { this.activeOrInactive('all', 0) }}>All</Button>
                        <Button color="success" outline={this.state.selectFilter !== 1} className="w-sm btn btn-sm" onClick={() => { this.activeOrInactive(true, 1) }}>Active</Button>
                        <Button color="warning" outline={this.state.selectFilter !== 2} className="w-sm btn btn-sm" onClick={() => { this.activeOrInactive(false, 2) }}>Inactive</Button>
                        <Button color="primary" className="w-sm btn btn-sm d-flex align-items-center" onClick={() => this.setState({ addCompModal: true })} >
                          <i className="bx bx-list-plus me-1" style={{ fontSize: '18px' }} /> Add Component
                        </Button>
                      </div>
                    </div>
                  </Col>
                </Row>


                <Row>
                  <Col>
                    <div className="table-responsive">
                      {this.state.componentList.length === 0 ? (
                        // <div className="container d-flex justify-content-center align-items-center">
                        //   <div className="text-center">
                        //     <img src={Nodata_admin} className="img-sm h-auto" style={{ width: '20%' }} />
                        //     <h5 className="text-secondary">No Data Available</h5>
                        //   </div>
                        // </div>
                        <div className="container" style={{ position: 'relative', minHeight: window.innerHeight }}>
                          <div className="text-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} >
                            <img src={Nodata_admin} className="img-sm h-auto" style={{ width: '20%' }} />
                            <h5 className="text-secondary">No Data Available</h5>
                          </div>
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
                            <thead className="table-light">
                              <tr>
                                <th>S.No</th>
                                <th>Component Name</th>
                                <th>Component Code</th>
                                <th>Component Status</th>
                                <th>Action</th>
                              </tr>

                            </thead>
                            <tbody >
                              {currentItems.map((data, index) => (
                                <tr key={index} id="recent-list" >
                                  <td style={{ backgroundColor: "white" }}>{index + 1}</td>
                                  <td style={{ backgroundColor: "white" }}>{data.comp_name}</td>
                                  <td style={{ backgroundColor: "white" }}>{data.comp_code}</td>
                                  <td style={{ backgroundColor: "white" }}>
                                    <Switch size="md" checked={data.comp_status} checkedChildren="Active" unCheckedChildren="Inactive" onChange={e => this.onChange(e, data)} />
                                  </td>
                                  <td style={{ backgroundColor: "white" }}>
                                    <div className="d-flex gap-1 align-items-center" style={{ cursor: "pointer" }}>
                                      {data.comp_status !== false && (
                                        <>
                                          <Button color="primary" className='btn btn-sm' onClick={() => this.modelInfo(data, 1)} style={{ border: "none" }} id={`teaching-${data._id}`}>
                                            Mastering
                                          </Button>
                                          <UncontrolledTooltip placement="top" target={`teaching-${data._id}`}>
                                            Manage Mastering
                                          </UncontrolledTooltip>
                                        </>
                                      )}

                                      {data.comp_status !== false && (
                                        <>
                                          <Button color="primary" className='btn btn-sm' onClick={() => this.manageStation(data)} id={`station-${data._id}`}>
                                            Station Info
                                          </Button>
                                          <UncontrolledTooltip placement="top" target={`station-${data._id}`}>
                                            Manage Station Info
                                          </UncontrolledTooltip>
                                        </>
                                      )}

                                      <Button color="primary" className='btn btn-sm d-flex align-items-center' onClick={() => this.logComp(data)} id={`info-${data._id}`}>
                                        Log Info
                                      </Button>
                                      <UncontrolledTooltip placement="top" target={`info-${data._id}`}>
                                        Log Info
                                      </UncontrolledTooltip>

                                      <Button color="warning" className='btn btn-sm' onClick={() => this.gotoMultiMeasurement(data)} style={{ border: "none" }} id={`multimeasurement-${data._id}`}>
                                        Measurements
                                      </Button>
                                      <UncontrolledTooltip placement="top" target={`multimeasurement-${data._id}`}>
                                        Manage Multiple Measurements
                                      </UncontrolledTooltip>
                                    </div>
                                  </td>
                                </tr>
                              ))}

                            </tbody>
                          </Table>
                          <div className="d-flex justify-content-between align-items-center mt-3">
                            <div>
                              <span>
                                Showing {currentPage} of {pageNumbers.length} pages
                              </span>
                            </div>
                            <Pagination className="pagination pagination-rounded justify-content-end my-2">
                              <Pagination.Prev
                                onClick={() => this.handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                              />
                              {pageNumbers.map((number) => (
                                <Pagination.Item
                                  key={number}
                                  active={number === currentPage}
                                  onClick={() => this.handlePageChange(number)}
                                >
                                  {number}
                                </Pagination.Item>
                              ))}
                              <Pagination.Next
                                onClick={() => this.handlePageChange(currentPage + 1)}
                                disabled={currentPage === pageNumbers.length}
                              />
                            </Pagination>
                          </div>
                        </div>

                      )}
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>



            <Modal
              isOpen={this.state.addCompModal}
              onClosed={() => this.handleModalClosed()}
            >
              <div className="modal-header">
                <h5 className="modal-title mt-0" id="myModalLabel">
                  Enter Component Details
                </h5>
                <button
                  type="button"
                  onClick={() => this.setState({ addCompModal: false })}
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <Form>
                  <div className="row mb-4">
                    <Col sm={12}>
                      <Label>Component name</Label>
                      <Input
                        type="text"
                        className="form-control"
                        id="horizontal-compname-Input"
                        placeholder="Enter Your Component Name"
                        value={comp_name}
                        maxLength={40}
                        minLength={3}
                        // onChange={this.handleInputChange}
                        onChange={e => {
                          this.setState({ comp_name: e.target.value })
                          this.validateComponentName(e.target.value)
                        }
                        }
                      />
                      {componentNameError && (
                        <p className="error-message" style={{ color: "red" }}>
                          {componentNameError}
                        </p>
                      )}
                    </Col>
                  </div>
                  <div className="row mb-4">
                    <Col sm={12}>
                      <Label>Component code</Label>
                      <Input
                        type="number"
                        className="form-control"
                        id="example-number-input"
                        placeholder="Enter Your Component Code"
                        min={0}
                        maxLength={10}
                        minLength={4}
                        value={comp_code}
                        onChange={e => {
                          const value = e.target.value;
                          if (value.length <= 10) {
                            this.setState({ comp_code: value });
                            this.validateComponentCode(value);
                          }
                        }}
                      />
                      {componentCodeError && (
                        <p className="error-message" style={{ color: "red" }}>
                          {componentCodeError}
                        </p>
                      )}
                    </Col>
                  </div>
                  <div className="row justify-content-end">
                    <Col sm={9}>
                      <div className="text-end">
                        <Button
                          color="primary"
                          className="w-md"
                          onClick={() => this.submitForm()}
                        >
                          ADD
                        </Button>
                      </div>
                    </Col>
                  </div>
                </Form>
              </div>
            </Modal>

            <Modal isOpen={this.state.modal_center} centered={true}>
              <div className="modal-header">
                <h5 className="modal-title mt-0">
                  Component Live version details
                </h5>
                <button
                  type="button"
                  onClick={() => this.setState({ modal_center: false })}
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body table-responsive">
                <Table striped>
                  <thead>
                    <tr>
                      <th>comp name</th>
                      <th>comp code</th>
                      <th>Model Name</th>
                      <th>Model version</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ver_log.map((data, index) => (
                      <tr key={index}>
                        <td>{data.comp_name}</td>
                        <td>{data.comp_code}</td>
                        <td>{data.model_name}</td>
                        <td>{data.model_live_ver}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Modal>
          </Container>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  const { layoutType, showRightSidebar } = state.Layout;
  return { layoutType, showRightSidebar };
}
export default connect(mapStateToProps)(compInfo);