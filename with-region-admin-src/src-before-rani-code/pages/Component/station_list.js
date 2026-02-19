import React, { Component } from "react";
import MetaTags from 'react-meta-tags';
import PropTypes from "prop-types"
import {
    Card,
    Col,
    Container,
    Row,
    CardBody,
    CardTitle,
    Label,
    Button,
    Form,
    Input,
    InputGroup, Modal, Table
} from "reactstrap";
import axios from "axios";
import { Link } from "react-router-dom";
import Select from 'react-select';
import { Radio, Space, Checkbox } from 'antd';
import 'antd/dist/antd.css';
import toastr from "toastr";
import SearchField from "react-search-field";
import SweetAlert from 'react-bootstrap-sweetalert';
import _ from 'lodash';
import urlSocket from "../AdminInspection/urlSocket";


// import Device from './Camera'

class StationInfo extends Component {
    _isMounted = false;
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
            config_change:'',
            active_inactive: ['Active', 'Inactive'],
            device_position: [{ label: 'Top' },
            { label: 'Bottom' },
            { label: 'Right' },
            { label: 'Left' }
            ],
            // position: { label: 'Top' },
            selectM_A: 'Active',
            station_name: '',
            message: '',
            mac_address: '',
            station_id: '',
            stn_ver: '',
            deviceId: '',
            search: '',
            obj: {}
        }
    }

    componentDidMount() {
        // this._isMounted = true;
        // this.device_find()
        //console.log('position', this.state.device_position)
        this.setState({ selectedFilter: 1 })
        this.active_inactive('ALL', 1)
    }
    // componentWillUnmount = async () => {
    //     this._isMounted = false;
    //     clearInterval(this.state.intervalId)
    // }
    // device_find = async () => {
    //     let intervalId = setInterval(() => { 
    //         navigator.mediaDevices.enumerateDevices().then(devices => 
    //             this.handledevice(devices)
    //         )
    //      }, 300)
    //      this.setState({intervalId})
    // }

    // handledevice = (devices) => {
    //     console.log('devices77', devices)
    //     let device_info = devices.filter(({kind}) => kind === 'videoinput')
    //     console.log('deviceinfo1044', device_info)

    //     if(this.state.device_info_b.length !== 0 ){
    //         device_info.map((device_a, index) => {
    //             console.log('device_a1046', device_a)
    //             let position_data = this.state.device_info_b.filter((device_b) => {
    //                  return device_b.deviceId === device_a.deviceId
    //             })
    //             // let position_data = _.filter(this.state.device_info_b, e => {
    //             //     return e.deviceId === device_a.deviceId
    //             // })
    //             console.log('position_data782', position_data)
    //             if (position_data[0].position !== undefined){
    //                 device_info[index].position = position_data[0].position
    //             }
    //         })
    //         // console.log('first785', data)
    //         this.setState({device_info_a: device_info})
    //         console.log('this.state.device_info_athos.stite.', this.state.device_info_a)
    //     }
    //     else{
    //         this.setState({device_info_a:device_info})
    //     }
    // }

    // submitData = (data) => {
    //     console.log('data63', data)
    //     setTimeout(() => { this.setState({ device_info: data }) }, 100)
    // }

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
                        this.setState({ samples_list: [], station_info: [], dataloaded: true })
                    } else {
                        console.log(`object`, data[0].comp_code)
                        this.setState({ samples_list: data, station_info: data, dataloaded: true })
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
        }
        this.setState({ refresh: true })
    }

    // stationInfo = () => {
    //     try {
    //         axios.post('https://172.16.1.91:5000/station_info',
    //             { mode: 'no-cors' })
    //             .then((response) => {
    //                 let data = response.data
    //                 console.log('samples_list', data)
    //                 this.setState({ samples_list: data, station_info:data, dataloaded: true })
    //             })
    //             .catch((error) => {
    //                 console.log(error)
    //             })
    //     } catch (error) {
    //         console.log("----", error)
    //     }
    // }
    //     var nietos = [];
    // var obj = {};
    // obj["01"] = nieto.label;
    // obj["02"] = nieto.value;
    // nietos.push(obj);

    selectActive_inactive = (e) => {
        console.log('first', e.target.value)
        this.setState({ selectM_A: e.target.value })
    }

    toastSuccess = (message) => {
        let title = "Success"
        toastr.options.closeDuration = 8000
        toastr.options.positionClass = "toast-bottom-right"
        toastr.success(message, title)
    }

    toastWarning = (message) => {
        let title = "Failed"
        toastr.options.closeDuration = 8000
        toastr.options.positionClass = "toast-bottom-right"
        toastr.warning(message, title)
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
        let config_change = this.state.config_change
        // let other_info = this.state.device_info_b
        // console.log('other_info176', other_info)
        // let device = this.state.device
        // console.log('device178', device)

        if (station_name === '') {
            this.setState({ message: "enter the station name", mesg_show: true })
            setTimeout(() => {
                this.setState({ message: "" })
            }, 2000);
            this.toastError("enter the station name")
            // alert('enter the station name')
        }
        else if (mac_addrs === '') {
            this.setState({ message: "enter the mac address", mesg_show: true })
            setTimeout(() => {
                this.setState({ message: "" })
            }, 2000);
            this.toastError("enter the mac address")
            // alert('enter the mac address')
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
                        urlSocket.post('/edit_manage_station_data', { '_id': _id, 'station_name': station_name, 'mac_addrs': mac_addrs, 'status': status, 'config_change':config_change, 'stn_ver': stn_ver },
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
                                    this.toastSuccess('Success')
                                    this.setState({ addStationModal: false })
                                }
                            })
                            .catch((error) => {
                                console.log(error)
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
            }
            else {
                try {
                    urlSocket.post('/manage_station_data', { 'station_name': station_name, 'mac_addrs': mac_addrs, 'status': status, 'config_change': config_change },
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
                                this.toastSuccess('Success')
                                this.setState({ addStationModal: false })
                            }
                        })
                        .catch((error) => {
                            console.log(error)
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
        }
    }

    actInactChange = () => {
        this.setState({ alertMsg: false })
        let station_name = this.state.station_name.trim()
        let mac_addrs = this.state.mac_address.trim()
        let status = this.state.selectM_A
        let _id = this.state.station_id
        let config_change = this.state.config_change
        let stn_ver = this.state.stn_ver
        try {
            urlSocket.post('/edit_manage_station_data', { '_id': _id, 'station_name': station_name, 'mac_addrs': mac_addrs, 'status': status, 'config_change':config_change, 'stn_ver': stn_ver },
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
                        this.toastSuccess('Success')
                        this.setState({ addStationModal: false })
                    }
                })
                .catch((error) => {
                    console.log(error)
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

    // deviceInfo = (e) => {
    //     console.log('e322', e.label)
    //     this.setState({ deviceId: { label: e.label } })
    // }

    device_position = (e, index, device) => {
        console.log('e', e)
        let device_info = [...this.state.device_info_a]
        device_info[index].position = e
        console.log('device_info1048', device_info)
        this.setState({ device_info_a: device_info, device_info_b: device_info })
    }

    manageComp = (data) => {
        console.log('data', data)
        sessionStorage.removeItem("stationInfo")
        sessionStorage.setItem("stationInfo", JSON.stringify(data))
    }

    configure_checking = (e) => {
        console.log('e400', e)
        this.setState({ config_change: e.target.checked})
    }

    createNew = () => {
        this.setState({ addStationModal: true, station_name: '', mac_address: '', selectM_A: 'Active', config_change:false, station_id: '' })
    }

    editStation = (station) => {
        console.log('first', station)
        this.setState({ addStationModal: true, station_name: station.station_name, mac_address: station.mac_addrs, selectM_A: station.status, config_change:station.config_change, station_id: station._id, stn_ver: station.stn_ver })
    }

    onSearch = (search) => {
        console.log('e', search)
        this.setState({ search, SearchField: search, currentPage_stock: 1 })
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
                //   console.log('serach_componentList123', station_info)
            }
            if (sorting.field) {
                const reversed = sorting.order === "asc" ? 1 : -1
                station_info = station_info.sort((a, b) => reversed * a[sorting.field].localeCompare(b[sorting.field]))
            }
            let d = station_info.slice((currentPage_stock - 1) * items_per_page_stock, (currentPage_stock - 1) * items_per_page_stock + items_per_page_stock)
            this.setState({ samples_list: d, totalItems_stock: station_info.length, dataloaded: true })
            // console.log('this.state.', this.state.componentList, this.state.totalItems_stock)
        } catch (error) {
        }
    }


    render() {
        if (this.state.dataloaded) {
            return (
                <React.Fragment>
                    <div className="page-content">
                        <MetaTags>
                        </MetaTags>
                        <Container fluid={true} style={{ minHeight: '100vh', background: 'white' }}>
                            <br />
                            <div>
                                <CardTitle className="text-center" style={{ fontSize: 28 }}> STATION INFORMATION</CardTitle>
                            </div>
                            <Row className="p-2">
                                <Col lg={12} className="text-end">
                                    <Button onClick={() => this.createNew()}>ADD STATION</Button>
                                </Col>
                            </Row>
                            <br />
                            <Row>
                                <Col>
                                    <Button color="primary" className="w-md m-1" outline={this.state.selectedFilter !== 1} onClick={() => { this.active_inactive("ALL", 1) }}> ALL </Button>
                                </Col>
                                <Col>
                                    <Button color="primary" className="w-md m-1" outline={this.state.selectedFilter !== 2} onClick={() => { this.active_inactive("Active", 2) }}> Active </Button>
                                </Col>
                                <Col>
                                    <Button color="primary" className="w-md m-1" outline={this.state.selectedFilter !== 3} onClick={() => { this.active_inactive("Inactive", 3) }}> Inactive </Button>
                                </Col>
                            </Row>
                            <br />
                            {/* <Device selected_data={(data) => { this.submitData(data) }} /> */}
                            <Row>
                                <Col>
                                    <SearchField
                                        placeholder="Search Name"
                                        searchText={this.state.SearchField}
                                        onChange={(e) => this.onSearch(e)}
                                    />
                                </Col>
                            </Row>
                            <Row>
                                <Table striped>
                                    <thead>
                                        <tr>
                                            <th>Station Name</th>
                                            <th>Mac Address</th>
                                            <th>Status</th>
                                            <th></th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.samples_list.map((station, index) => (
                                                <tr key={index}>
                                                    <td>{station.station_name}</td>
                                                    <td>{station.mac_addrs}</td>
                                                    <td>{station.status}</td>
                                                    <td>
                                                        {
                                                            station.status !== 'Inactive' &&
                                                            <Link to="/entry_scrn"><Button onClick={() => this.manageComp(station)} >Manage component</Button></Link>
                                                        }
                                                    </td>
                                                    <td> <Button onClick={() => this.editStation(station)}>Edit</Button></td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </Table>
                            </Row>
                            <Modal
                                isOpen={this.state.addStationModal}
                            // toggle={this.tog_standard}
                            >
                                <div className="modal-header">
                                    <h5 className="modal-title mt-0" id="myModalLabel">
                                        Enter Component Details
                                    </h5>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            this.setState({ addStationModal: false })
                                        }
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
                                                <Label>Station Name:</Label>
                                                <Input
                                                    type="text"
                                                    className="form-control"
                                                    id="example-number-input"
                                                    placeholder="Enter Your"
                                                    maxLength="40"
                                                    value={this.state.station_name}
                                                    onChange={(e) => this.setState({ station_name: e.target.value })}
                                                />
                                            </Col>
                                        </div>
                                        <div className="row mb-4">
                                            <Col sm={12}>
                                                <Label>Mac Address:</Label>
                                                <Input
                                                    type="text"
                                                    className="form-control"
                                                    id="horizontal-compname-Input"
                                                    placeholder="Enter Your"
                                                    maxLength="32"
                                                    value={this.state.mac_address}
                                                    onChange={(e) => this.setState({ mac_address: e.target.value })}
                                                />
                                            </Col>
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

                                        <div className="row mb-4">
                                            <Col sm={12}>
                                                <Checkbox
                                                    checked={this.state.config_change}
                                                    onChange={(e) => this.configure_checking(e)}
                                                >Allow Inspection User to Change Configuration in Station</Checkbox>
                                            </Col>
                                        </div>

                                        <div className="row justify-content-end">
                                            <Col sm={9}>
                                                <div className="text-Left">
                                                    {
                                                        this.state.mesg_show ?
                                                            this.state.message !== 'Success' ?
                                                                <div style={{ color: this.state.message ? 'red' : null }}>
                                                                    <Label>
                                                                        {
                                                                            this.state.message
                                                                        }
                                                                    </Label>
                                                                </div> :
                                                                <div style={{ color: this.state.message ? 'green' : null }}>
                                                                    <Label>
                                                                        {
                                                                            this.state.message
                                                                        }
                                                                    </Label>
                                                                </div> : null
                                                    }
                                                </div>
                                                <div className="text-end">
                                                    {/* <Link to="Camera"> */}
                                                    <Button
                                                        //type="submit"
                                                        color="primary"
                                                        className="w-md"
                                                        onClick={() => { this.submitForm() }}
                                                    >
                                                        Submit
                                                    </Button>
                                                    {/* </Link> */}

                                                </div>
                                            </Col>
                                        </div>
                                    </Form>
                                </div>
                            </Modal>
                            {
                                this.state.samples_list.length === 0 ?
                                    <div className="text-center">
                                        <h3>No Records found </h3>
                                    </div> : null
                            }
                            {this.state.alertMsg ?
                                <SweetAlert
                                    showCancel
                                    title={
                                        <Label style={{ fontSize: 20 }}>
                                            Are you sure to deactivate the station {this.state.station_name}
                                            <br />
                                            This will remove the component relationship.
                                        </Label>
                                    }
                                    cancelBtnBsStyle="success"
                                    confirmBtnText="Yes"
                                    cancelBtnText="No"
                                    onConfirm={() => this.actInactChange()}
                                    onCancel={() => this.active_inactive('ALL', 1)}
                                    closeOnClickOutside={false}
                                >
                                </SweetAlert> : null
                            }
                        </Container>
                        {/* container-fluid */}
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
export default StationInfo;