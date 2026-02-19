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
import { DatePicker } from 'antd';
import moment from 'moment';
import 'antd/dist/antd.css';
// import CardComp from './Components/CardComp'
import urlSocket from "../AdminInspection/urlSocket";

const { RangePicker } = DatePicker;
let start_date1 = ""
let end_date1 = ""


class CRUDComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataloaded: false,
            component_name: "",
            component_code: "",
            config_positive: "",
            config_negative: "",
            config_posble_match: "",
            startDate: "",
            endDate: "",
            filter_comp_name: "ALL",
            filter_comp_code: "",
            filter_data: [],
            dateWiseData: [],
            station_info: [],
            stationList: [],
            station_id: '',
            showTable2: false,
            tbIndex: 0,
            dateWise_filterdata: [],
            addCompModal: false,
            stationSelectedOption: { "station_name": "ALL", "show_all_data": true },
            compSelectedOption: { "comp_name": "ALL", "comp_code": "", "show_all": true },
            componentList: [

            ]
        }
    }

    componentDidMount() {

        this.stationInfo()
        this.compInfo()
        start_date1 = ""
        end_date1 = ""
        try {
            urlSocket.post('/config',
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('config_data', data)
                    this.setState({ config_data: data, config_positive: data[0].positive, config_negative: data[0].negative, config_posble_match: data[0].posble_match })
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }

    onChange(dates, dateStrings) {
        //console.log('From: ', dates[0], ', to: ', dates[1]);
        console.log('From: ', dateStrings[0], ', to: ', dateStrings[1]);
        //console.log('e', e)
        let start_date = dateStrings[0]
        let end_date = dateStrings[1]
        start_date1 = start_date
        end_date1 = end_date
        console.log(start_date1)
        console.log(end_date1)
    }

    stationInfo = () => {
        try {
            urlSocket.post('/uniq_station_filterData',   //changed the url ./active_filterData
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('detailes102', data)
                    let allData = [{ station_name: 'ALL', show_all_data: true }, ...data]
                    // allData.push(data)
                    console.log('first', allData)
                    this.setState({ stationList: allData, dataloaded: true }, this.allshowStation)
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }

    compInfo = () => {
        try {
            urlSocket.post('/uniq_comp_filterData',   //changed the url ./active_filterData
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('detailes122', data)
                    let allData = [{ comp_name: 'ALL', comp_code: "", show_all: true }, ...data]
                    // allData.push(data)
                    console.log('first', allData)
                    this.setState({ componentList: allData, dataloaded: true }, this.allshowComp)

                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }


    compListAPICall = (data) => {
        console.log('data', data)
        try {
            urlSocket.post('/inspect_filterData', { 'station_id': data[0]._id },   //changed the url ./active_filterData
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('detailes', data)
                    console.log('componentList', data[1].comp_info)
                    //  let allData = [{ comp_name: 'ALL', comp_code: "", show_all: true }, ...data[1].comp_info]
                    let allData = [{ comp_name: 'ALL', comp_code: "", show_all: true }, ...data]
                    // allData.push(data)
                    console.log('first', allData)
                    // this.setState({ componentList: allData, station_info:data[0].station_info, dataloaded: true })
                    this.setState({ componentList: allData, dataloaded: true })
                    this.allshowComp(this.state.station_info)
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)

        }
    }

    getDate = () => {
        let today = new Date();
        let yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0!
        let dd = today.getDate();
        return today = yyyy + '-' + mm + '-' + dd
    }

    allshowComp = () => {
        let startDate = this.getDate()
        let endDate = this.getDate()
        let comp_name = "ALL"
        let comp_code = ""
        let station_id = this.state.station_id
        console.log('station_id', station_id)
        var dateWiseData = JSON.parse(sessionStorage.getItem("dateWiseData"))
        console.log('dateWiseData', dateWiseData)
        this.setState({ dateWiseData })

        try {
            urlSocket.post('/admin_filterData', { 'comp_name': comp_name, 'comp_code': comp_code, 'start_Date': startDate, 'end_date': endDate, 'station_id': station_id },
                { mode: 'no-cors' })
                .then((response) => {
                    let filter_data = response.data
                    console.log("filter_data", filter_data, filter_data.length)
                    this.setState({ filter_data })
                })
                .catch((error) => {

                    console.log(error)
                })
        } catch (error) {

        }
    }

    allshowStation = () => {
        let station_name = "ALL"
        try {
            urlSocket.post('/station_filterData', { 'station_name': station_name },
                { mode: 'no-cors' })
                .then((response) => {
                    let filter_data = response.data
                    console.log("filter_data185", filter_data, filter_data.length)
                    let allData = [{ comp_name: 'ALL', comp_code: "", show_all: true }, ...filter_data]
                    console.log('first', allData)
                    this.setState({ componentList: allData, dataloaded: true })
                })
                .catch((error) => {

                    console.log(error)
                })
        } catch (error) {

        }
    }


    showComp = async () => {
        // console.log('startdate', start_date1, 'enddate', end_date1)
        // console.log('filter_comp_name', this.state.filter_comp_name, 'filer_comp_code', this.state.filter_comp_code)
        let startDate = start_date1
        let endDate = end_date1
        let comp_name = this.state.filter_comp_name
        let comp_code = this.state.filter_comp_code
        let station_id = this.state.station_id
        if (startDate === '') {
            startDate = this.getDate()
        }

        if (endDate === '') {
            endDate = this.getDate()
        }

        console.log({ 'station_id': station_id, 'comp_name': comp_name, 'comp_code': comp_code, 'start_Date': startDate, 'end_date': endDate })
        try {
            urlSocket.post('/admin_filterData', { 'comp_name': comp_name, 'comp_code': comp_code, 'start_Date': startDate, 'end_date': endDate, 'station_id': station_id },
                { mode: 'no-cors' })
                .then((response) => {
                    let filter_data = response.data
                    console.log("filter_data", filter_data, filter_data.length)
                    this.setState({ filter_data, startDate, endDate })
                    // var f_data = {'notok':0,'No Objects Detected':0,'ok':0,'Possible Match':0};
                    // for (let i = 0; i < filter_data.length; i++) {
                    //     var _key = filter_data[i].result
                    //     var _value = filter_data[i].count
                    //     console.log('_key', _key, _value)
                    //     f_data[_key] = _value
                    //     f_data["comp_name"]=filter_data[i].comp_name
                    //     f_data["comp_code"]=filter_data[i].comp_code
                    // }                    
                    // console.log('f_data', f_data)
                    // if (data === "created") {
                    //     alert("created")                       
                    // }
                    // else
                    //     alert("Already created")
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {

        }
    }


    editComp = async (data) => {
        console.log('startdate', start_date1, 'enddate', end_date1)
        console.log('filter_compname', data.comp_name, 'filer_comp_code', data.comp_code)
        let startDate = start_date1
        let endDate = end_date1
        let comp_name = data.comp_name
        let comp_code = data.comp_code
        let station_id = data.station_id
        console.log('station_id', station_id)
    
        if (startDate === '') {
            startDate = this.getDate()
        }
        if (endDate === '') {
            endDate = this.getDate()
        }
        if(station_id === undefined){
            station_id = ''
        }
        try {
            urlSocket.post('/dWise_filterData', { 'comp_name': comp_name, 'comp_code': comp_code, 'start_Date': startDate, 'end_date': endDate, 'station_id':station_id },
                { mode: 'no-cors' })
                .then((response) => {
                    let dateWise_filterdata = response.data
                    console.log("dataWise_filterdata", dateWise_filterdata)
                    this.setState({ dateWise_filterdata })
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {

        }
    }

    showDateWiseComp = async (data) => {
        console.log('comp_name', data.comp_name)
        console.log('comp_code', data.comp_code)
        console.log('date', data.date)
        console.log('total', data.total)
        console.log('ok', data.ok)
        console.log('notok', data.notok)
        console.log('posbl_match', data.posbl_match)
        console.log('no_obj', data.no_obj)
        console.log('station_id', data.station_id)
        if(data.station_id === undefined){
            data.station_id = ''
        }
        
        let dropData = {
            comp_name: this.state.filter_comp_name,
            comp_code: this.state.filter_comp_code,
            startDate: this.state.startDate,
            endDate: this.state.endDate
        }

        let datas = {
            comp_name: data.comp_name,
            comp_code: data.comp_code,
            date: data.date,
            total: data.total,
            ok: data.ok,
            notok: data.notok,
            posbl_match: data.posbl_match,
            station_id:data.station_id,
            config_positive: this.state.config_positive,
            config_negative: this.state.config_negative,
            config_posble_match: this.state.config_posble_match,
            no_obj: data.no_obj
        }
        sessionStorage.removeItem("timeWiseData")
        sessionStorage.setItem("timeWiseData", JSON.stringify(datas))
        sessionStorage.removeItem("dateWiseData")
        sessionStorage.setItem("dateWiseData", JSON.stringify(dropData))
    }


    onSelectStation = (e) => {
        console.log('e', e)
        let data = [e]
        console.log('data322', data)

        if (e.show_all_data) {
            this.setState({ filter_station_name: e.station_name, station_id: '' })

            console.log('Show All', e.station_name)
            // try {
            //     axios.post('https://172.16.1.91:5000/station_filterData', { 'station_name': e.station_name },
            //         { mode: 'no-cors' })
            //         .then((response) => {
            //             let filter_data = response.data
            //             console.log("filter_data", filter_data, filter_data.length)
            //             let allData = [{ comp_name: 'ALL', comp_code: "", show_all: true }, ...filter_data]
            //             console.log('first', allData)
            //             this.setState({ componentList: allData, dataloaded: true })
            //         })
            //         .catch((error) => {
            //             console.log(error)
            //         })
            // } catch (error) {

            // }
        } else {
            this.setState({ filter_station_name: e.station_name, station_id: data[0].station_id })

            console.log('Else')
            // try {
            //     axios.post('https://172.16.1.91:5000/station_filterData', { 'station_name': e.station_name },
            //         { mode: 'no-cors' })
            //         .then((response) => {
            //             let filter_data = response.data
            //             console.log("filter_data", filter_data, filter_data.length)
            //             let allData = [{ comp_name: 'ALL', comp_code: "", show_all: true }, ...filter_data]
            //             console.log('first', allData)
            //             this.setState({ componentList: allData, dataloaded: true })
            //         })
            //         .catch((error) => {

            //             console.log(error)
            //         })
            // } catch (error) {

            // }
        }

    }

    onSelectComponent = (e) => {
        console.log('e', e, this.state.stationSelectedOption)
        this.setState({ filter_comp_name: e.comp_name, filter_comp_code: e.comp_code })
        if (e.show_all) {
            console.log('Show All', e.comp_name, e.comp_code)
        this.setState({ filter_comp_name: e.comp_name, filter_comp_code: e.comp_code })

            // try {
            //     axios.post('https://172.16.1.91:5000/station_status_info',
            //         { mode: 'no-cors' })
            //         .then((response) => {
            //             let filter_data = response.data
            //             console.log("filter_data", filter_data, filter_data.length)
            //             let allData = [{ station_name: 'ALL', show_all_data: true }, ...filter_data]
            //             console.log('first', allData)
            //             this.setState({ stationList: allData, dataloaded: true })
            //         })
            //         .catch((error) => {
            //             console.log(error)
            //         })
            // } catch (error) {
            // }
        }
        // else if (this.state.stationSelectedOption.station_name === 'ALL' && e.comp_name !== 'ALL') {
        //     console.log('Else if')
        //     try {
        //         axios.post('https://172.16.1.91:5000/component_filterData', { 'comp_name': e.comp_name, 'comp_id': e.comp_id },
        //             { mode: 'no-cors' })
        //             .then((response) => {
        //                 let filter_data = response.data
        //                 console.log("filter_data392", filter_data, filter_data.length)
        //                 let allData = [{ station_name: 'ALL', show_all_data: true }, ...filter_data]
        //                 console.log('first394', allData)
        //                 this.setState({ stationList: allData, dataloaded: true })
        //             })
        //             .catch((error) => {
        //                 console.log(error)
        //             })
        //     } catch (error) {

        //     }
        // }
        // else if (this.state.stationSelectedOption.station_name !== 'ALL' && e.comp_name !== 'ALL') {
        //     console.log('Else if2')
        //     try {
        //         axios.post('https://172.16.1.91:5000/component_filterData', { 'comp_name': e.comp_name, 'comp_id': e.comp_id },
        //             { mode: 'no-cors' })
        //             .then((response) => {
        //                 let filter_data = response.data
        //                 console.log("filter_data392", filter_data, filter_data.length)
        //                 let allData = [{ station_name: 'ALL', show_all_data: true }, ...filter_data]
        //                 console.log('first394', allData)
        //                 this.setState({ stationList: allData, dataloaded: true })
        //             })
        //             .catch((error) => {
        //                 console.log(error)
        //             })
        //     } catch (error) {

        //     }
        // }
        else {
            this.setState({ filter_comp_name: e.comp_name, filter_comp_code: e.comp_code })
            console.log('Else')
        }
        // console.log('result', result)
        // return result;

    }

    render() {
        if (this.state.dataloaded) {
            return (
                <React.Fragment>
                    <div className="page-content">
                        <MetaTags>
                            <title>Form Layouts | Skote - React Admin & Dashboard Template</title>
                        </MetaTags>
                        <Container fluid={true} style={{ minHeight: '100vh', background: 'white' }}>
                            {/* <Breadcrumbs title="Forms" breadcrumbItem="Form Layouts" /> */}
                            <Row className="p-2">
                                <Col lg={12}>
                                    <CardTitle className="text-center">Inspection Result Details</CardTitle>
                                </Col>
                            </Row>
                            <Row lg={12}>
                                <Col sm={3}>
                                    <Select
                                        value={this.state.stationSelectedOption}
                                        onChange={(e) => this.onSelectStation(e, this.setState({ stationSelectedOption: e }))}
                                        options={this.state.stationList}
                                        getOptionLabel={option => (option.station_name)}
                                    />
                                </Col>
                                <Col sm={3}>
                                    <Select
                                        value={this.state.compSelectedOption}
                                        onChange={(e) => this.onSelectComponent(e, this.setState({ compSelectedOption: e, showTable2: false, tbIndex: 0 }))}
                                        options={this.state.componentList}
                                        getOptionLabel={option => (option.comp_name + " " + option.comp_code)}
                                    />

                                </Col>
                                <Col sm={4}>
                                    {/* <RangePicker
                                        ranges={{
                                            Today: [moment(), moment()],
                                            'This Month': [moment().startOf('month'), moment().endOf('month')],
                                        }}
                                        onChange={this.onChange}
                                    /> */}
                                    <RangePicker
                                        ranges={{
                                            Today: [moment(), moment()],
                                            'This Month': [moment().startOf('month'), moment().endOf('month')],
                                        }}
                                        defaultValue={[moment(), moment()]}
                                        showTime
                                        format="YYYY-MM-DD"
                                        //format="YYYY-MM-DD HH:mm:ss"
                                        onChange={this.onChange}
                                    />
                                </Col>
                                <Col sm={2}>
                                    <div>
                                        <Button color="primary" className="w-md m-1" onClick={() => this.showComp(this.setState({ showTable2: false, tbIndex: 0 }))}>Show Details</Button>
                                    </div>
                                </Col>
                            </Row>

                            <div className="table-responsive">
                                <Table striped>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Code</th>
                                            <th>Total Inspected</th>
                                            <th>{this.state.config_positive}</th>
                                            <th>{this.state.config_negative}</th>
                                            {/* <th>id</th> */}
                                            <th>{this.state.config_posble_match}</th>
                                            <th>No object found</th>
                                            <th>More</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.filter_data.map((data, index) => (
                                                //  {
                                                data.show_all === undefined &&
                                                <React.Fragment key={index}>
                                                    <tr key={index}>
                                                        <td width="25%">{data.comp_name}</td>
                                                        <td width="10%">{data.comp_code}</td>
                                                        <td width="10%">{data.total}</td>
                                                        <td width="10%">{data.ok}</td>
                                                        <td width="10%">{data.notok}</td>
                                                        <td width="10%">{data.posbl_match}</td>
                                                        <td width="10%">{data.no_obj}</td>
                                                        <td width="15%"> <Button onClick={() => this.editComp(data, this.setState({ showTable2: true, tbIndex: index }))}>DateWise</Button></td>
                                                    </tr>
                                                    {
                                                        (this.state.tbIndex === index) && this.state.showTable2 &&
                                                        <>
                                                            <tr key={index} >
                                                                <td colSpan="8">
                                                                    <Table striped>
                                                                        <thead>
                                                                            <tr>
                                                                                <th>Date</th>
                                                                                <th>Total Inspected</th>
                                                                                <th>{this.state.config_positive}</th>
                                                                                <th>{this.state.config_negative}</th>
                                                                                <th>{this.state.config_posble_match}</th>
                                                                                <th>No object found</th>
                                                                                <th>More</th>

                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {
                                                                                this.state.dateWise_filterdata.map((data, index) => (
                                                                                    //  {
                                                                                    data.show_all === undefined &&
                                                                                    <tr key={index}>
                                                                                        <td width="35%">{data.date}</td>
                                                                                        <td width="10%">{data.total}</td>
                                                                                        <td width="10%">{data.ok}</td>
                                                                                        <td width="10%">{data.notok}</td>
                                                                                        <td width="10%">{data.posbl_match}</td>
                                                                                        <td width="10%">{data.no_obj}</td>
                                                                                        <td width="15%"><Link to="/time_wise_report"> <Button onClick={() => this.showDateWiseComp(data)}>View Info</Button></Link></td>
                                                                                    </tr>
                                                                                    //  }   
                                                                                ))
                                                                            }
                                                                        </tbody>
                                                                    </Table>
                                                                </td>
                                                            </tr>
                                                        </>
                                                    }
                                                </React.Fragment>
                                            ))
                                        }
                                    </tbody>
                                </Table>
                                {
                                    this.state.filter_data.length === 0 ?

                                        <div className="text-center">
                                            <h3>No Records found </h3>
                                        </div> : null
                                }
                            </div>

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
CRUDComponent.propTypes = {
    history: PropTypes.any.isRequired,
};
export default CRUDComponent;