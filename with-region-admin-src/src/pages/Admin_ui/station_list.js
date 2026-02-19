import React, { Component } from "react";
import MetaTags from 'react-meta-tags';
import PropTypes from "prop-types"
import { Card, Col, Container, Row, CardBody, CardTitle, Label, Button, Form, Input, InputGroup, Modal, Table, UncontrolledTooltip } from "reactstrap";
import { Link } from "react-router-dom";
import { Radio, Space, Checkbox } from 'antd';
import toastr from "toastr";
import SweetAlert from 'react-bootstrap-sweetalert';
import _ from 'lodash';
import urlSocket from "pages/AdminInspection/urlSocket";
import Pagination from 'react-bootstrap/Pagination';
import { makeHeaderBtn } from "store/actions";
import { connect } from "react-redux";
import Breadcrumbs from "components/Common/Breadcrumb";


class StationInfo extends Component {
    _isMounted = false;
    static propTypes = {
        history: PropTypes.any.isRequired,
        dispatch: PropTypes.func.isRequired,
    };
    constructor(props) {
        super(props);
        this.state = {
            dataloaded: false,
            addStationModal: false,
            tbIndex: 0,
            intervalId: '',
            samples_list: [],
            station_info: [],
            device_info: [],
            device_info_a: [],
            device_info_b: [],
            sorting: { field: "", order: "" },
            items_per_page_stock: 100,
            currentPage_stock: 1,
            mesg_show: false,
            alertMsg: false,
            selectedFilter: 1,
            SearchField: '',
            active_inactive: ['Active', 'Inactive'],
            device_position: [{ label: 'Top' },
            { label: 'Bottom' },
            { label: 'Right' },
            { label: 'Left' }
            ],
            selectM_A: 'Active',
            station_name: '',
            message: '',
            mac_address: '',
            station_id: '',
            stn_ver: '',
            deviceId: '',
            search: '',
            obj: {},
            currentPage: 1,
            itemsPerPage: 10,
            edit:false,
            isValidMac: true
        }
    }

    componentDidMount() {

        this.props.dispatch(makeHeaderBtn(false))
        this.setState({ selectedFilter: 1 })
        this.active_inactive('ALL', 1)
    }
   
    active_inactive = (data, selectedFilter) => {
        let active = data
        // let search = " "
        console.log('active', data, selectedFilter)
        this.setState({ selectedFilter, alertMsg: false, SearchField: '' })
        console.log('first61', this.state.SearchField)
        try {
            urlSocket.post('/station_info', { 'status': active },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log("is_active", data)
                    if (data.length === 0 || data === null || data === undefined) {
                        this.setState({ samples_list: [], station_info: [], dataloaded: true,currentPage: 1 })
                    } else {
                        console.log(`object`, data[0].comp_code)
                        this.setState({ samples_list: data, station_info: data, dataloaded: true,currentPage: 1 })
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
        }
        this.setState({ refresh: true })
    }
    
    cancel_deactivation = () => {
        this.setState({ alertMsg: false })
    }

   

    selectActive_inactive = (e) => {
        console.log('first', e.target.value)
        this.setState({ selectM_A: e.target.value })
    }

    toastSuccess = (title, message) => {
        // let title = "Success"
        toastr.options.closeDuration = 8000
        toastr.options.positionClass = "toast-bottom-right"
        toastr.success(message, title)
    }

    toastWarning = (message) => {
        let title = "Failed"
        toastr.options.closeDuration = 8000
        toastr.options.positionClass = "toast-bottom-right"
        toastr.warning('', message)
    }

    toastError = (message) => {
        let title = "Failed"
        toastr.options.closeDuration = 8000
        toastr.options.positionClass = "toast-bottom-right"
        toastr.error(message, title)
    }

    submitForm = () => {
        console.log('sbmited')
        let station_name = this.state.station_name.trim()
        let mac_addrs = this.state.mac_address.trim()
        let status = this.state.selectM_A


        if (station_name === '') {
            this.setState({ message: "Enter the station name", mesg_show: true })
            setTimeout(() => {
                this.setState({ message: "" })
            }, 2000);
            this.toastError("Enter the station name")
        }
        else if (station_name.length < 4 ){
            this.setState({ message: "Station Name should be at least 4 characters", mesg_show: true })
            setTimeout(() => {
                this.setState({ message: "" })
            }, 2000);
            this.toastError("Station Name should be at least 4 characters")
        }
        else if (mac_addrs === '') {
            this.setState({ message: "Enter the mac address", mesg_show: true })
            setTimeout(() => {
                this.setState({ message: "" })
            }, 2000);
            this.toastError("Enter the mac address")
        }
        else if (!this.state.isValidMac){
            this.setState({ message: "Enter the mac address Correctly", mesg_show: true })
            setTimeout(() => {
                this.setState({ message: "" })
            }, 2000);
            this.toastError("Enter the mac address Correctly")
        }
        else if (station_name !== undefined && mac_addrs !== undefined) {
            if (this.state.station_id !== '' && this.state.station_id !== undefined) {
                let _id = this.state.station_id
                let stn_ver = this.state.stn_ver
                console.log('_id157', _id, status)
                if (status === 'Inactive') {
                    this.setState({ alertMsg: true })
                }
                else {
                    try {
                        urlSocket.post('/edit_manage_station_data', { '_id': _id, 'station_name': station_name, 'mac_addrs': mac_addrs, 'status': status, 'stn_ver': stn_ver },
                            { mode: 'no-cors' })
                            .then((response) => {
                                let data = response.data
                                console.log('response', data)
                                if (data === 'Station Name Already Exists') {
                                    this.setState({ message: 'Station Name Already Exists', mesg_show: true })
                                    setTimeout(() => {
                                        this.setState({ message: "" })
                                    }, 2000);
                                    this.toastError('Station Name Already Exists')
                                }
                                else if (data === "Mac Address Already Exists") {
                                    this.setState({ message: 'Mac Address Already Exists', mesg_show: true })
                                    setTimeout(() => {
                                        this.setState({ message: "" })
                                    }, 2000);
                                    this.toastError('Mac Address Already Exists')
                                }
                                else {
                                 
                                    this.setState({ message: 'Success', mesg_show: true,samples_list: data, station_info: data, dataloaded: true,selectedFilter:1  })
                                    setTimeout(() => {
                                        this.setState({ message: "" })
                                    }, 2000);
                                    this.toastSuccess(`"${station_name}" Updated Succesfully`, '')
                                    this.setState({ addStationModal: false,isValidMac:true,edit:false  })
                                }
                            })
                            .catch((error) => {
                                console.log(error);
                                this.toastWarning(`Error on "${station_name}" Updation`)
                            })
                    } catch (error) {
                        console.log("----", error)
                    }                  
                }
            }
            else {
                try {
                    urlSocket.post('/manage_station_data', { 'station_name': station_name, 'mac_addrs': mac_addrs, 'status': status },
                        { mode: 'no-cors' })
                        .then((response) => {
                            let data = response.data
                            console.log('response', data)
                            if (data === 'Station Name Already Exists') {
                                this.setState({ message: 'Station Name Already Exists', mesg_show: true })
                                setTimeout(() => {
                                    this.setState({ message: "" })
                                }, 2000);
                                this.toastError('Station Name Already Exists')
                            }
                            else if (data === "Mac Address Already Exists") {
                                this.setState({ message: 'Mac Address Already Exists', mesg_show: true })
                                setTimeout(() => {
                                    this.setState({ message: "" })
                                }, 2000);
                                this.toastError('Mac Address Already Exists')
                            }
                            else {
                             
                                this.setState({ message: 'Success' })
                                setTimeout(() => {
                                    this.setState({ message: "" })
                                }, 2000);
                                this.toastSuccess(`"${station_name}" Created Succesfully`, '')
                                this.setState({ addStationModal: false, samples_list: data, station_info: data, dataloaded: true,selectedFilter:1,isValidMac:true,edit:false  })
                            }
                        })
                        .catch((error) => {
                            console.log(error);
                            this.toastWarning(`Error on "${station_name}" Updation`)
                        })
                } catch (error) {
                    console.log("----", error)
                }
            }
        }
    }

    actInactChange = () => {
        this.setState({ alertMsg: false })
        let station_name = this.state.station_name.trim()
        let mac_addrs = this.state.mac_address.trim()
        let status = this.state.selectM_A
        let _id = this.state.station_id
        let stn_ver = this.state.stn_ver
        try {
            urlSocket.post('/edit_manage_station_data', { '_id': _id, 'station_name': station_name, 'mac_addrs': mac_addrs, 'status': status, 'stn_ver': stn_ver },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('response', data)
                    if (data === 'Station Name Already Exists') {
                        this.setState({ message: 'Station Name Already Exists', mesg_show: true })
                        setTimeout(() => {
                            this.setState({ message: "" })
                        }, 2000);
                        this.toastError('Station Name Already Exists')
                    }
                    else if (data === "Mac Address Already Exists") {
                        this.setState({ message: 'Mac Address Already Exists', mesg_show: true })
                        setTimeout(() => {
                            this.setState({ message: "" })
                        }, 2000);
                        this.toastError('Mac Address Already Exists')
                    }
                    else {
                        this.setState({ message: 'Success', mesg_show: true })
                        setTimeout(() => {
                            this.setState({ message: "" })
                        }, 2000);
                        this.toastSuccess(`"${station_name}" Status Updated Succesfully`, '')
                        this.setState({ addStationModal: false,isValidMac:true,edit:false  })
                    }
                })
                .catch((error) => {
                    console.log(error);
                    this.toastWarning(`Error on "${station_name}" Updation`)
                })
        } catch (error) {
            console.log("----", error)
        }
        if (this.state.selectedFilter === 1) {
            this.active_inactive('ALL', 1)
        }
        else if (this.state.selectedFilter === 2) {
            this.active_inactive('Active', 2)
        }
        else if (this.state.selectedFilter === 3) {
            this.active_inactive('Inactive', 3)
        }
    }


    device_position = (e, index, device) => {
        console.log('e', e)
        let device_info = [...this.state.device_info_a]
        device_info[index].position = e
        console.log('device_info1048', device_info)
        this.setState({ device_info_a: device_info, device_info_b: device_info })
    }

    manageComp = (data) => {
        console.log('401 data : ', data)
        sessionStorage.removeItem("stationInfo")
        sessionStorage.setItem("stationInfo", JSON.stringify(data))
    }

    createNew = () => {
        this.setState({ addStationModal: true, station_name: '', mac_address: '', selectM_A: 'Active', station_id: '' })
    }

    editStation = (station) => {
        console.log('first', station)
        this.setState({ addStationModal: true, station_name: station.station_name, mac_address: station.mac_addrs, selectM_A: station.status, station_id: station._id, stn_ver: station.stn_ver,edit:true })
    }

    onSearch = (search) => {
        console.log('e', search)
        this.setState({ search, SearchField: search, currentPage_stock: 1,currentPage: 1 })
        setTimeout(() => {
            this.dataListProcess()
        }, 100);
    }

    dataListProcess = () => {
        try {
            let { station_info, search, sorting, currentPage_stock, items_per_page_stock } = this.state
            console.log('serach_componentList', station_info, search, sorting)
            if (search) {
                station_info = station_info.filter(d => d.station_name.toUpperCase().includes(search.toUpperCase()))
            }
            if (sorting.field) {
                const reversed = sorting.order === "asc" ? 1 : -1
                station_info = station_info.sort((a, b) => reversed * a[sorting.field].localeCompare(b[sorting.field]))
            }
            let d = station_info.slice((currentPage_stock - 1) * items_per_page_stock, (currentPage_stock - 1) * items_per_page_stock + items_per_page_stock)
            this.setState({ samples_list: d, totalItems_stock: station_info.length, dataloaded: true })
        } catch (error) {
        }
    }

    handlePageChange = (pageNumber) => {
        this.setState({ currentPage: pageNumber });
      };

    
    
    validateMacAddress = (macAddress) => {
        const macAddressPattern = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;
        return macAddressPattern.test(macAddress);
    };

    handleChange = (e) => {
        const value = e.target.value;
        this.setState({
            mac_address: value,
            isValidMac: this.validateMacAddress(value)
        });
    };

    logstation = (data) => {
        console.log(data, "station");
        if (data.datasets === undefined) {
            data.datasets = [];
        }
        let { station_name, _id } = data;
        console.log(station_name, _id, "station_name");

        let datas = {
            station_name: data.station_name,
            mac_addrs: data.mac_addrs,
            datasets: data.datasets,
            status: data.status,
            stn_ver: data.stn_ver,
            station_id: data._id,
        };
        console.log("datas", datas);
        sessionStorage.removeItem("stationInfo");
        sessionStorage.setItem("stationInfo", JSON.stringify(datas));
        this.setState({
            station_name: station_name,
            station_id: data._id,
        });

        this.props.history.push("/station_log");

    };
      


    render() {
        const { samples_list, currentPage, itemsPerPage } = this.state;
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = samples_list.slice(indexOfFirstItem, indexOfLastItem);
        const startComponent = (currentPage - 1) * itemsPerPage + 1;
        const endComponent = Math.min(currentPage * itemsPerPage, samples_list.length);
        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(samples_list.length / itemsPerPage); i++) {
            pageNumbers.push(i);
        }
        if (this.state.dataloaded) {
            return (
                <React.Fragment>
                    <div className="page-content">
                        <MetaTags> <title>Station Information | RunOut</title> </MetaTags>
                        <Breadcrumbs title="STATION INFORMATION"  />

                        <Container fluid={true} style={{ minHeight: '100vh', background: 'white' }}>
                            <Card>
                                <CardBody>
                                  
                                    <Row className="mb-2">
                                        <Col sm={3}>                                   
                                            <div className="search-box ">
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
                                                    <Button color="primary" className="w-sm btn btn-sm" outline={this.state.selectedFilter !== 1} onClick={() => { this.active_inactive("ALL", 1) }}> ALL </Button>
                                                    <Button color="success" className="w-sm btn btn-sm" outline={this.state.selectedFilter !== 2} onClick={() => { this.active_inactive("Active", 2) }}> Active </Button>
                                                    <Button color="warning" className="w-sm btn btn-sm" outline={this.state.selectedFilter !== 3} onClick={() => { this.active_inactive("Inactive", 3) }}> Inactive </Button>
                                                    <Button color="primary" className="w-sm btn btn-sm d-flex align-items-center" onClick={() => this.createNew()} >
                                                        <i className="bx bx-list-plus me-1" style={{ fontSize: '18px' }} /> Add Station
                                                    </Button>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>                              
                                 
                                    <Row>
                                        <Col>
                                            <div className="table-responsive">
                                                <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>S.No</th>
                                                            <th>Station Name</th>
                                                            <th>Mac Address</th>
                                                            <th>Status</th>
                                                            <th>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            currentItems.map((station, index) => (
                                                                <tr key={index}>
                                                                    <td style={{ backgroundColor: "white" }}>{index + 1}</td>
                                                                    <td style={{ backgroundColor: "white" }}>{station.station_name}</td>
                                                                    <td style={{ backgroundColor: "white" }}>{station.mac_addrs}</td>
                                                                    <td style={{ backgroundColor: "white" }} >
                                                                        {station.status === 'Active' ?
                                                                            <span className="badge badge-soft-success ">{station.status}</span>
                                                                             :
                                                                            <span className="badge badge-soft-danger ">{station.status}</span>
                                                                        }
                                                                    </td>                                                                 
                                                                    <td style={{ backgroundColor: "white" }}>
                                                                        <div className="d-flex gap-1 align-items-center" style={{ cursor: "pointer" }}>
                                                                            {
                                                                                station.status !== 'Inactive' &&
                                                                                <Link to="/comp_data_list">
                                                                                    <Button color="primary" className="btn btn-sm" onClick={() => this.manageComp(station)} id={`manage-${station._id}`}>Manage</Button>
                                                                                    <UncontrolledTooltip placement="top" target={`manage-${station._id}`}>
                                                                                        Manage Component
                                                                                    </UncontrolledTooltip>
                                                                                </Link>
                                                                            }
                                                                            <Button
                                                                                color="primary"
                                                                                className="btn btn-sm d-flex align-items-center"
                                                                                onClick={() => this.logstation(station)}
                                                                                id={`info-${station._id}`}
                                                                            >
                                                                                Log Info
                                                                            </Button>
                                                                            <UncontrolledTooltip
                                                                                placement="top"
                                                                                target={`info-${station._id}`}
                                                                            >
                                                                                Log Info
                                                                            </UncontrolledTooltip>
                                                                            <Button color="primary" className="btn btn-sm d-flex align-items-center" onClick={() => this.editStation(station)} id={`edit-${station._id}`}> <i className="bx bx-edit fs-6 me-2"></i>Edit</Button>
                                                                            <UncontrolledTooltip placement="top" target={`edit-${station._id}`}>
                                                                                Edit Component
                                                                            </UncontrolledTooltip>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        }
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
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>
                        </Container>

                        <Modal isOpen={this.state.addStationModal}>
                            <div className="modal-header">
                                {this.state.edit ?
                                    <h5 className="modal-title mt-0" id="myModalLabel"> Edit Station Details </h5>
                                    :
                                    <h5 className="modal-title mt-0" id="myModalLabel"> Enter Station Details </h5>
                                }
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"
                                    onClick={() => this.setState({ addStationModal: false, isValidMac: true, edit: false })}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <Form>
                                    <div className="row mb-4">
                                        <Col sm={12}>
                                            <Label>Station Name:</Label>
                                            <Input
                                                type="text"
                                                className="form-control"
                                                id="example-number-input"
                                                placeholder="Enter Your"
                                                minLength={4}
                                                maxLength="10"
                                                value={this.state.station_name}
                                                onChange={(e) => this.setState({ station_name: e.target.value })}
                                            />
                                        </Col>
                                        {
                                            (this.state.message !== 'Success' && (this.state.message === 'Enter the station name' || this.state.message === "Station Name should be at least 4 characters")) &&
                                            <Label style={{ color: this.state.message ? 'red' : null }}>{this.state.message}</Label>
                                        }
                                    </div>
                                    <div className="row mb-4">
                                        <Col sm={12}>
                                            <Label>Mac Address:</Label>
                                            <Input
                                                type="text"
                                                className={`form-control ${this.state.isValidMac ? '' : 'is-invalid'}`}
                                                id="horizontal-compname-Input"
                                                placeholder="Mac.Address:XX:XX:XX:XX:XX:XX"
                                                maxLength="17"
                                                value={this.state.mac_address}
                                                onChange={this.handleChange}
                                            />
                                            <Label style={{ fontSize: "10px" }}>Example: AA:BB:CC:DD:EE:FF</Label>
                                            {!this.state.isValidMac && <div className="invalid-feedback">Invalid MAC Address format.</div>}
                                        </Col>
                                        {
                                            (this.state.message !== 'Success' && this.state.message == "Enter the mac address") &&
                                            <Label style={{ color: this.state.message ? 'red' : null }}>{this.state.message}</Label>
                                        }
                                    </div>

                                    <div className="row mb-4">
                                        <Col sm={12}>
                                            <Label>Status:</Label>{' '}
                                            <Radio.Group onChange={this.selectActive_inactive} value={this.state.selectM_A}>
                                                <Space >
                                                    {
                                                        this.state.active_inactive.map((data, index) => (
                                                            <div className='pay_cards' key={index} style={{ background: (this.state.selectM_A !== data) && 'white' }}>
                                                                <Radio value={data}>{data}</Radio>
                                                            </div>
                                                        ))
                                                    }
                                                </Space>
                                            </Radio.Group>
                                        </Col>
                                    </div>


                                    <div className="row justify-content-end">
                                        <Col sm={9}>
                                            <div className="text-end">
                                                <Button color="primary" className="w-md" onClick={() => { this.submitForm() }} >
                                                    Submit
                                                </Button>
                                            </div>
                                        </Col>
                                    </div>
                                </Form>
                            </div>
                        </Modal>
                        {
                            this.state.samples_list.length === 0 ?
                                <div className="text-center"> <h3>No Records found </h3> </div>
                                : null
                        }
                        {this.state.alertMsg ?
                            <SweetAlert
                                showCancel
                                title={<Label style={{ fontSize: 20 }}> Are you sure to deactivate the station {this.state.station_name}
                                    <br />
                                    This will remove the component relationship.
                                </Label>
                                }
                                cancelBtnBsStyle="success"
                                confirmBtnText="Yes"
                                cancelBtnText="No"
                                onConfirm={() => this.actInactChange()}
                                onCancel={() => this.cancel_deactivation()}
                                closeOnClickOutside={false}
                            >
                            </SweetAlert> : null
                        }
                    </div>
                </React.Fragment>
            );
        }
        else {
            return null
        }
    }
}
StationInfo.propTypes = {
    history: PropTypes.any.isRequired,
};

const mapStateToProps=state=>{
    const { layoutType, showRightSidebar,show_sidebar } = state.Layout;
    return { layoutType, showRightSidebar };
  }
export default connect(mapStateToProps)(StationInfo);