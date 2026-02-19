// import React, { Component } from "react";
// import MetaTags from 'react-meta-tags';
// import PropTypes from "prop-types"
// import {
//     Card,
//     Col,
//     Container,
//     Row,
//     CardBody,
//     CardTitle,
//     Label,
//     Button,
//     Form,
//     Input,
//     InputGroup, Modal, Table
// } from "reactstrap";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import Select from 'react-select';
// import { DatePicker, Space } from 'antd';
// import moment from 'moment';
// // import 'antd/dist/antd.css';
// // import CardComp from './Components/CardComp'
// import urlSocket from "./urlSocket";
// import dayjs from 'dayjs';
// import PaginationComponent from "./PaginationComponent";
// import Breadcrumbs from "components/Common/Breadcrumb";
// const { RangePicker } = DatePicker;
// let start_date1 = ""
// let end_date1 = ""

// class CRUDComponent extends Component {

//     constructor(props) {
//         super(props);
//         this.state = {
//             dataloaded: false,
//             component_name: "",
//             component_code: "",
//             config_positive: "",
//             config_negative: "",
//             config_posble_match: "",
//             startDate: "",
//             endDate: "",
//             filter_comp_name: "ALL",
//             filter_comp_code: "",
//             filter_data: [],
//             dateWiseData: [],
//             station_info: [],
//             stationList: [],
//             station_id: '',
//             showTable2: false,
//             tbIndex: 0,
//             dateWise_filterdata: [],
//             addCompModal: false,
//             stationSelectedOption: { "station_name": "ALL", "show_all_data": true },
//             compSelectedOption: { "comp_name": "ALL", "comp_code": "", "show_all": true },
//             componentList: [

//             ],

//             // pagination
//             currentPage: 1,
//             itemsPerPage: 10,
//         }
//     }

//     componentDidMount() {

//         this.stationInfo()
//         this.compInfo()
//         start_date1 = ""
//         end_date1 = ""
//         try {
//             urlSocket.post('/config',
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let data = response.data
//                     if (data.error === "Tenant not found") {
//                         console.log("data error", data.error);
//                         this.error_handler(data.error);
//                     }
//                     else {
//                         console.log('config_data', data)
//                         this.setState({ config_data: data, config_positive: data[0].positive, config_negative: data[0].negative, config_posble_match: data[0].posble_match })
//                     }
//                 })
//                 .catch((error) => {
//                     console.log(error)
//                 })
//         } catch (error) {
//             console.log("----", error)
//         }
//     }

//     // onChange(dates, dateStrings) {
//     //     //console.log('From: ', dates[0], ', to: ', dates[1]);
//     //     console.log('From: ', dateStrings[0], ', to: ', dateStrings[1]);
//     //     //console.log('e', e)
//     //     let start_date = dateStrings[0]
//     //     let end_date = dateStrings[1]
//     //     start_date1 = start_date
//     //     end_date1 = end_date
//     //     console.log(start_date1)
//     //     console.log(end_date1)
//     // }

//     stationInfo = () => {
//         try {
//             urlSocket.post('/uniq_station_filterData',   //changed the url ./active_filterData
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let data = response.data
//                     if (data.error === "Tenant not found") {
//                         console.log("data error", data.error);
//                         this.error_handler(data.error);
//                     }
//                     else {
//                         console.log('detailes102', data)
//                         let allData = [{ station_name: 'ALL', show_all_data: true }, ...data]
//                         // allData.push(data)
//                         console.log('first', allData)
//                         this.setState({ stationList: allData, dataloaded: true }, this.allshowStation)
//                     }

//                 })
//                 .catch((error) => {
//                     console.log(error)
//                 })
//         } catch (error) {
//             console.log("----", error)
//         }
//     }

//     compInfo = () => {
//         try {
//             urlSocket.post('/uniq_comp_filterData',   //changed the url ./active_filterData
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let data = response.data
//                     if (data.error === "Tenant not found") {
//                         console.log("data error", data.error);
//                         this.error_handler(data.error);
//                     }
//                     else {
//                         console.log('detailes122', data)
//                         let allData = [{ comp_name: 'ALL', comp_code: "", show_all: true }, ...data]
//                         // allData.push(data)
//                         console.log('first', allData)
//                         this.setState({ componentList: allData, dataloaded: true }, this.allshowComp)
//                     }
//                 })
//                 .catch((error) => {
//                     console.log(error)
//                 })
//         } catch (error) {
//             console.log("----", error)
//         }
//     }

//     compListAPICall = (data) => {
//         console.log('data', data)
//         try {
//             urlSocket.post('/inspect_filterData', { 'station_id': data[0]._id },   //changed the url ./active_filterData
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let data = response.data
//                     if (data.error === "Tenant not found") {
//                         console.log("data error", data.error);
//                         this.error_handler(data.error);
//                     }
//                     else {
//                         console.log('detailes', data)
//                         console.log('componentList', data[1].comp_info)
//                         //  let allData = [{ comp_name: 'ALL', comp_code: "", show_all: true }, ...data[1].comp_info]
//                         let allData = [{ comp_name: 'ALL', comp_code: "", show_all: true }, ...data]
//                         // allData.push(data)
//                         console.log('first', allData)
//                         // this.setState({ componentList: allData, station_info:data[0].station_info, dataloaded: true })
//                         this.setState({ componentList: allData, dataloaded: true })
//                         this.allshowComp(this.state.station_info)
//                     }
//                 })
//                 .catch((error) => {
//                     console.log(error)
//                 })
//         } catch (error) {
//             console.log("----", error)

//         }
//     }

//     getDate = () => {
//         let today = new Date();
//         let yyyy = today.getFullYear();
//         let mm = today.getMonth() + 1; // Months start at 0!
//         let dd = today.getDate();
//         return today = yyyy + '-' + mm + '-' + dd
//     }

//     allshowComp = () => {
//         let startDate = this.getDate()
//         let endDate = this.getDate()
//         let comp_name = "ALL"
//         let comp_code = ""
//         let station_id = this.state.station_id
//         console.log('station_id', station_id)
//         var dateWiseData = JSON.parse(sessionStorage.getItem("dateWiseData"))
//         console.log('dateWiseData', dateWiseData)
//         this.setState({ dateWiseData })

//         try {
//             urlSocket.post('/admin_filterData', { 'comp_name': comp_name, 'comp_code': comp_code, 'start_Date': startDate, 'end_date': endDate, 'station_id': station_id },
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let filter_data = response.data
//                     if (filter_data.error === "Tenant not found") {
//                         console.log("data error", filter_data.error);
//                         this.error_handler(filter_data.error);
//                     }
//                     else {
//                         console.log("filter_data", filter_data, filter_data.length)
//                         this.setState({ filter_data })
//                     }

//                 })
//                 .catch((error) => {

//                     console.log(error)
//                 })
//         } catch (error) {

//         }
//     }

//     allshowStation = () => {
//         let station_name = "ALL"
//         try {
//             urlSocket.post('/station_filterData', { 'station_name': station_name },
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let filter_data = response.data
//                     if (filter_data.error === "Tenant not found") {
//                         console.log("data error", filter_data.error);
//                         this.error_handler(filter_data.error);
//                     }
//                     else {
//                         console.log("filter_data185", filter_data, filter_data.length)
//                         let allData = [{ comp_name: 'ALL', comp_code: "", show_all: true }, ...filter_data]
//                         console.log('first', allData)
//                         this.setState({ componentList: allData, dataloaded: true })
//                     }

//                 })
//                 .catch((error) => {

//                     console.log(error)
//                 })
//         } catch (error) {

//         }
//     }

//     showComp = async () => {
//         // console.log('startdate', start_date1, 'enddate', end_date1)
//         // console.log('filter_comp_name', this.state.filter_comp_name, 'filer_comp_code', this.state.filter_comp_code)
//         let startDate = start_date1
//         let endDate = end_date1
//         let comp_name = this.state.filter_comp_name
//         let comp_code = this.state.filter_comp_code
//         let station_id = this.state.station_id
//         if (startDate === '') {
//             startDate = this.getDate()
//         }

//         if (endDate === '') {
//             endDate = this.getDate()
//         }

//         console.log({ 'station_id': station_id, 'comp_name': comp_name, 'comp_code': comp_code, 'start_Date': startDate, 'end_date': endDate })
//         try {
//             urlSocket.post('/admin_filterData', { 'comp_name': comp_name, 'comp_code': comp_code, 'start_Date': startDate, 'end_date': endDate, 'station_id': station_id },
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let filter_data = response.data
//                     if (filter_data.error === "Tenant not found") {
//                         console.log("data error", filter_data.error);
//                         this.error_handler(filter_data.error);
//                     }
//                     else {
//                         console.log("filter_data", filter_data, filter_data.length)
//                         this.setState({ filter_data, startDate, endDate })
//                     }

//                     // var f_data = {'notok':0,'No Objects Detected':0,'ok':0,'Possible Match':0};
//                     // for (let i = 0; i < filter_data.length; i++) {
//                     //     var _key = filter_data[i].result
//                     //     var _value = filter_data[i].count
//                     //     console.log('_key', _key, _value)
//                     //     f_data[_key] = _value
//                     //     f_data["comp_name"]=filter_data[i].comp_name
//                     //     f_data["comp_code"]=filter_data[i].comp_code
//                     // }
//                     // console.log('f_data', f_data)
//                     // if (data === "created") {
//                     //     alert("created")
//                     // }
//                     // else
//                     //     alert("Already created")
//                 })
//                 .catch((error) => {
//                     console.log(error)
//                 })
//         } catch (error) {

//         }
//     }

//     editComp = async (data) => {
//         console.log('startdate', start_date1, 'enddate', end_date1)
//         console.log('filter_compname', data.comp_name, 'filer_comp_code', data.comp_code)
//         let startDate = start_date1
//         let endDate = end_date1
//         let comp_name = data.comp_name
//         let comp_code = data.comp_code
//         let station_id = data.station_id
//         console.log('station_id', station_id)

//         if (startDate === '') {
//             startDate = this.getDate()
//         }
//         if (endDate === '') {
//             endDate = this.getDate()
//         }
//         if (station_id === undefined) {
//             station_id = ''
//         }
//         try {
//             urlSocket.post('/dWise_filterData', { 'comp_name': comp_name, 'comp_code': comp_code, 'start_Date': startDate, 'end_date': endDate, 'station_id': station_id },
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let dateWise_filterdata = response.data
//                     if (dateWise_filterdata.error === "Tenant not found") {
//                         console.log("data error", dateWise_filterdata.error);
//                         this.error_handler(dateWise_filterdata.error);
//                     }
//                     else {
//                         console.log("dataWise_filterdata", dateWise_filterdata)
//                         this.setState({ dateWise_filterdata })
//                     }

//                 })
//                 .catch((error) => {
//                     console.log(error)
//                 })
//         } catch (error) {

//         }
//     }

//     showDateWiseComp = async (data) => {
//         console.log('comp_name', data.comp_name)
//         console.log('comp_code', data.comp_code)
//         console.log('date', data.date)
//         console.log('total', data.total)
//         console.log('ok', data.ok)
//         console.log('notok', data.notok)
//         console.log('posbl_match', data.posbl_match)
//         console.log('no_obj', data.no_obj)
//         console.log('incorrect_obj', data.incorrect_obj)
//         console.log('station_id', data.station_id)
//         if (data.station_id === undefined) {
//             data.station_id = ''
//         }

//         let dropData = {
//             comp_name: this.state.filter_comp_name,
//             comp_code: this.state.filter_comp_code,
//             startDate: this.state.startDate,
//             endDate: this.state.endDate
//         }

//         let datas = {
//             comp_name: data.comp_name,
//             comp_code: data.comp_code,
//             date: data.date,
//             total: data.total,
//             ok: data.ok,
//             notok: data.notok,
//             posbl_match: data.posbl_match,
//             station_id: data.station_id,
//             config_positive: this.state.config_positive,
//             config_negative: this.state.config_negative,
//             config_posble_match: this.state.config_posble_match,
//             no_obj: data.no_obj,
//             incorrect_obj: data.incorrect_obj,

//         }
//         sessionStorage.removeItem("timeWiseData")
//         sessionStorage.setItem("timeWiseData", JSON.stringify(datas))
//         sessionStorage.removeItem("dateWiseData")
//         sessionStorage.setItem("dateWiseData", JSON.stringify(dropData))
//     }

//     onSelectStation = (e) => {
//         console.log('e', e)
//         let data = [e]
//         console.log('data322', data)

//         if (e.show_all_data) {
//             this.setState({ filter_station_name: e.station_name, station_id: '' }, () => {
//                 this.showComp(this.setState({ showTable2: false, tbIndex: 0 }))
//             })
//         } else {
//             this.setState({ filter_station_name: e.station_name, station_id: data[0].station_id }, () => {
//                 this.showComp(this.setState({ showTable2: false, tbIndex: 0 }))
//             })
//         }
//     }

//     onSelectComponent = (e) => {
//         console.log('e', e, this.state.stationSelectedOption);

//         this.setState({ filter_comp_name: e.comp_name, filter_comp_code: e.comp_code }, () => {
//             this.showComp(this.setState({ showTable2: false, tbIndex: 0 }))
//         })
//     }

//     // New Calender code for filter data
//     onChange = (date) => {
//         if (date) {
//             console.log('Date: ', date);
//         } else {
//             console.log('Clear');
//         }
//     };

//     onRangeChange = (dates, dateStrings) => {
//         if (dates) {
//             console.log('From: ', dates[0], ', to: ', dates[1]);
//             console.log('From: ', dateStrings[0], ', to: ', dateStrings[1]);
//             let start_date = dateStrings[0]
//             console.log('start_date', start_date)
//             let end_date = dateStrings[1]
//             console.log('end_date', end_date)
//             start_date1 = start_date
//             end_date1 = end_date
//             this.showComp(this.setState({
//                 showTable2: false,
//                 tbIndex: 0
//             }))
//         } else {
//             console.log('Clear');
//         }
//     };

//     rangePresets = [
//         {
//             label: 'Yesterday',
//             value: [dayjs().subtract(1, 'd'), dayjs().subtract(1, 'd')],
//         },
//         {
//             label: 'Last 7 Days',
//             value: [dayjs().add(-7, 'd'), dayjs()],

//         },
//         {
//             label: 'Last 14 Days',
//             value: [dayjs().add(-14, 'd'), dayjs()],
//         },
//         {
//             label: 'Last 30 Days',
//             value: [dayjs().add(-30, 'd'), dayjs()],
//         },
//         // {
//         //   label: 'Last 90 Days',
//         //   value: [dayjs().add(-90, 'd'), dayjs()],
//         // },
//         {
//             label: 'Month to Date',
//             value: [dayjs().startOf('M'), dayjs()],
//         },
//         {
//             label: 'Year to Date',
//             value: [dayjs().startOf('y'), dayjs()],
//         },
//     ];

//     handlePageChange = (pageNumber) => {
//         this.setState({ currentPage: pageNumber });
//     };

//     error_handler = (error) => {
//         sessionStorage.removeItem("authUser");
//         this.props.history.push("/login");
//     }

//     render() {
//         const { filter_data } = this.state;
//         // pagination
//         const { currentPage, itemsPerPage } = this.state;   // expandedRow, searchQuery,

//         // Calculate indices for slicing the component list
//         const indexOfLastItem = currentPage * itemsPerPage;
//         const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//         const currentItems = filter_data.slice(indexOfFirstItem, indexOfLastItem);

//         if (this.state.dataloaded) {
//             return (
//                 <React.Fragment>
//                     <div className="page-content">
//                         <MetaTags>
//                             <title>Inspection Result Details</title>
//                         </MetaTags>
//                         <Breadcrumbs
//                             title="INSPECTION RESULT DETAILS"
//                         />

//                         <Container fluid>
//                             <Card>
//                                 <CardBody>
//                                     <Row lg={12}>
//                                         <Col sm={4}>
//                                             {/* <Row>
//                                         <Col className="text-center mb-2"  style={{ fontWeight: 'bold' }}>Station Name</Col>
//                                     </Row> */}
//                                             <Select
//                                                 value={this.state.stationSelectedOption}
//                                                 onChange={(e) => this.onSelectStation(e, this.setState({ stationSelectedOption: e }))}
//                                                 options={this.state.stationList}
//                                                 getOptionLabel={option => (option.station_name)}
//                                             />
//                                         </Col>
//                                         <Col sm={4}>
//                                             {/* <Row>
//                                         <Col className="text-center mb-2"  style={{ fontWeight: 'bold' }}>Component Name</Col>
//                                     </Row> */}
//                                             <Select
//                                                 value={this.state.compSelectedOption}
//                                                 onChange={(e) => this.onSelectComponent(e, this.setState({ compSelectedOption: e, showTable2: false, tbIndex: 0 }))}
//                                                 options={this.state.componentList}
//                                                 getOptionLabel={option => (option.comp_name + " " + option.comp_code)}
//                                             />

//                                         </Col>
//                                         <Col sm={4} className="text-end">
//                                             <RangePicker
//                                                 presets={[
//                                                     {
//                                                         label: <span aria-label="Current Time to End of Day">Today</span>,
//                                                         value: () => [dayjs(), dayjs().endOf('day')], // 5.8.0+ support function
//                                                     },
//                                                     ...this.rangePresets,
//                                                 ]}
//                                                 defaultValue={[dayjs(), dayjs().endOf('day')]}
//                                                 showTime
//                                                 format="YYYY-MM-DD"
//                                                 onChange={this.onRangeChange}
//                                                 onOk={() => this.showComp(this.setState({ showTable2: false, tbIndex: 0 }))}
//                                             />
//                                             {/* <Space direction="vertical" size={12}
//                                         style={{
//                                             background: '#74788d',
//                                             padding: '10px',
//                                             borderRadius: '10px',
//                                             color: 'white'
//                                         }}
//                                     >
//                                         <Row>
//                                             <Col className="mx-2"  style={{ fontWeight: 'bold' }}  >Start Date</Col>
//                                             <Col  style={{ fontWeight: 'bold' }} >End Date</Col>
//                                         </Row>
//                                         <RangePicker
//                                             presets={[
//                                                 {
//                                                     label: <span aria-label="Current Time to End of Day">Today</span>,
//                                                     value: () => [dayjs(), dayjs().endOf('day')], // 5.8.0+ support function
//                                                 },
//                                                 ...this.rangePresets,
//                                             ]}
//                                             defaultValue={[dayjs(), dayjs().endOf('day')]}
//                                             showTime
//                                             format="YYYY-MM-DD"
//                                             onChange={this.onRangeChange}
//                                             onOk={() => this.showComp(this.setState({ showTable2: false, tbIndex: 0 }))}
//                                         />
//                                     </Space> */}
//                                         </Col>
//                                     </Row>

//                                     <div className="table-responsive mt-4">
//                                         <PaginationComponent
//                                             totalItems={filter_data.length}
//                                             itemsPerPage={itemsPerPage}
//                                             currentPage={currentPage}
//                                             onPageChange={this.handlePageChange}
//                                         />
//                                         <Table
//                                             className="table mb-0 align-middle table-nowrap table-check"
//                                             bordered
//                                         >
//                                             <thead className="table-light">
//                                                 <tr>
//                                                     <th>Name</th>
//                                                     <th>Code</th>
//                                                     <th>Total Inspected</th>
//                                                     <th>{this.state.config_positive}</th>
//                                                     <th>{this.state.config_negative}</th>
//                                                     {/* <th>id</th> */}
//                                                     {/* <th>{this.state.config_posble_match}</th> */}
//                                                     <th>No object found</th>
//                                                     <th>Incorrect Object</th>
//                                                     <th>More</th>
//                                                 </tr>
//                                             </thead>
//                                             <tbody>
//                                                 {
//                                                     currentItems.map((data, index) => (
//                                                         //  {
//                                                         data.show_all === undefined &&
//                                                         <React.Fragment key={index}>
//                                                             <tr key={index}>
//                                                                 <td style={{ backgroundColor: "white" }} width="25%">{data.comp_name}</td>
//                                                                 <td style={{ backgroundColor: "white" }} width="10%">{data.comp_code}</td>
//                                                                 <td style={{ backgroundColor: "white" }} width="10%">{data.total}</td>
//                                                                 <td style={{ backgroundColor: "white" }} width="10%">{data.ok}</td>
//                                                                 <td style={{ backgroundColor: "white" }} width="10%">{data.notok}</td>
//                                                                 {/* <td width="10%">{data.posbl_match}</td> */}
//                                                                 <td style={{ backgroundColor: "white" }} width="10%">{data.no_obj}</td>
//                                                                 <td style={{ backgroundColor: "white" }} width="10%">{data.incorrect_obj}</td>
//                                                                 <td style={{ backgroundColor: "white" }} width="15%">
//                                                                     <Button size="sm" className="w-md" color="primary" onClick={() => this.editComp(data, this.setState({ showTable2: true, tbIndex: index }))}>DateWise</Button>
//                                                                 </td>
//                                                             </tr>
//                                                             {
//                                                                 (this.state.tbIndex === index) && this.state.showTable2 &&
//                                                                 <>
//                                                                     <tr key={index} >
//                                                                         <td colSpan="8">
//                                                                             <Table
//                                                                                 className="table mb-0 align-middle table-nowrap table-check"
//                                                                                 bordered
//                                                                             >
//                                                                                 <thead className="table-light">
//                                                                                     <tr>
//                                                                                         <th>Date</th>
//                                                                                         <th>Total Inspected</th>
//                                                                                         <th>{this.state.config_positive}</th>
//                                                                                         <th>{this.state.config_negative}</th>
//                                                                                         {/* <th>{this.state.config_posble_match}</th> */}
//                                                                                         <th>No object found</th>
//                                                                                         <th>Incorrect Object</th>
//                                                                                         <th>More</th>

//                                                                                     </tr>
//                                                                                 </thead>
//                                                                                 <tbody>
//                                                                                     {
//                                                                                         this.state.dateWise_filterdata.map((data, index) => (
//                                                                                             //  {
//                                                                                             data.show_all === undefined &&
//                                                                                             <tr key={index}>
//                                                                                                 <td style={{ backgroundColor: "white" }} width="35%">{data.date}</td>
//                                                                                                 <td style={{ backgroundColor: "white" }} width="10%">{data.total}</td>
//                                                                                                 <td style={{ backgroundColor: "white" }} width="10%">{data.ok}</td>
//                                                                                                 <td style={{ backgroundColor: "white" }} width="10%">{data.notok}</td>
//                                                                                                 {/* <td width="10%">{data.posbl_match}</td> */}
//                                                                                                 <td style={{ backgroundColor: "white" }} width="10%">{data.no_obj}</td>
//                                                                                                 <td style={{ backgroundColor: "white" }} width="10%">{data.incorrect_obj}</td>
//                                                                                                 <td style={{ backgroundColor: "white" }} width="15%">
//                                                                                                     <Link to="/time_wise_report">
//                                                                                                         <Button size="sm" className="w-md" color="primary" onClick={() => this.showDateWiseComp(data)}>View Info</Button>
//                                                                                                     </Link>
//                                                                                                 </td>
//                                                                                             </tr>
//                                                                                             //  }
//                                                                                         ))
//                                                                                     }
//                                                                                 </tbody>
//                                                                             </Table>
//                                                                         </td>
//                                                                     </tr>
//                                                                 </>
//                                                             }
//                                                         </React.Fragment>
//                                                     ))
//                                                 }
//                                             </tbody>
//                                         </Table>
//                                         {
//                                             this.state.filter_data.length === 0 ?

//                                                 <div className="container" style={{ position: 'relative', height: '20vh' }}>
//                                                     <div className="text-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} >
//                                                         <h5 className="text-secondary">No Records found</h5>
//                                                     </div>
//                                                 </div>
//                                                 : null
//                                         }
//                                     </div>
//                                 </CardBody>
//                             </Card>

//                         </Container>
//                         {/* container-fluid */}
//                     </div>
//                 </React.Fragment>
//             );
//         }
//         else {
//             return null
//         }

//     }
// }
// CRUDComponent.propTypes = {
//     history: PropTypes.any.isRequired,
// };
// export default CRUDComponent;

import React, { useState, useEffect } from 'react';
import MetaTags from 'react-meta-tags';
import PropTypes from 'prop-types';
import { Card, Col, Container, Row, CardBody, Button, Table } from 'reactstrap';
import { Link, useHistory } from 'react-router-dom';
import Select from 'react-select';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import PaginationComponent from './PaginationComponent';
import Breadcrumbs from 'components/Common/Breadcrumb';
import urlSocket from './urlSocket';

const { RangePicker } = DatePicker;

let start_date1 = '';
let end_date1 = '';

const CRUDComponent = () => {
  const history = useHistory();

  // State management
  const [dataloaded, setDataloaded] = useState(false);
  const [config_positive, setConfigPositive] = useState('');
  const [config_negative, setConfigNegative] = useState('');
  const [config_posble_match, setConfigPosbleMatch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filter_comp_name, setFilterCompName] = useState('ALL');
  const [filter_comp_code, setFilterCompCode] = useState('');
  const [filter_data, setFilterData] = useState([]);
  const [stationList, setStationList] = useState([]);
  const [station_id, setStationId] = useState('');
  const [showTable2, setShowTable2] = useState(false);
  const [tbIndex, setTbIndex] = useState(0);
  const [dateWise_filterdata, setDateWiseFilterdata] = useState([]);
  const [stationSelectedOption, setStationSelectedOption] = useState({
    station_name: 'ALL',
    show_all_data: true
  });
  const [compSelectedOption, setCompSelectedOption] = useState({
    comp_name: 'ALL',
    comp_code: '',
    show_all: true
  });
  const [componentList, setComponentList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    if (dataloaded) {
      showComp();
    }
  }, [station_id, filter_comp_name, filter_comp_code]);

  // Error handler
  const error_handler = error => {
    sessionStorage.removeItem('authUser');
    history.push('/login');
  };

  // Get current date
  const getDate = () => {
    let today = new Date();
    let yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();
    return `${yyyy}-${mm}-${dd}`;
  };

  // Fetch config data
  const fetchConfig = async () => {
    try {
      const response = await urlSocket.post('/config', { mode: 'no-cors' });
      const data = response.data;

      if (data.error === 'Tenant not found') {
        console.log('data error', data.error);
        error_handler(data.error);
      } else {
        console.log('config_data', data);
        setConfigPositive(data[0].positive);
        setConfigNegative(data[0].negative);
        setConfigPosbleMatch(data[0].posble_match);
      }
    } catch (error) {
      console.log('----', error);
    }
  };

  // Fetch station info
  const stationInfo = async () => {
    try {
      const response = await urlSocket.post('/uniq_station_filterData', {
        mode: 'no-cors'
      });
      const data = response.data;

      if (data.error === 'Tenant not found') {
        console.log('data error', data.error);
        error_handler(data.error);
      } else {
        console.log('detailes102', data);
        const allData = [{ station_name: 'ALL', show_all_data: true }, ...data];
        console.log('first', allData);
        setStationList(allData);
        setDataloaded(true);
        allshowStation();
      }
    } catch (error) {
      console.log('----', error);
    }
  };

  // Fetch component info
  const compInfo = async () => {
    try {
      const response = await urlSocket.post('/uniq_comp_filterData', {
        mode: 'no-cors'
      });
      const data = response.data;

      if (data.error === 'Tenant not found') {
        console.log('data error', data.error);
        error_handler(data.error);
      } else {
        console.log('detailes122', data);
        const allData = [
          { comp_name: 'ALL', comp_code: '', show_all: true },
          ...data
        ];
        console.log('first', allData);
        setComponentList(allData);
        setDataloaded(true);
        allshowComp();
      }
    } catch (error) {
      console.log('----', error);
    }
  };

  // Show all components
  const allshowComp = async () => {
    const startDate = getDate();
    const endDate = getDate();
    const comp_name = 'ALL';
    const comp_code = '';
    const currentStationId = station_id;

    console.log('station_id', currentStationId);
    const dateWiseData = JSON.parse(sessionStorage.getItem('dateWiseData'));
    console.log('dateWiseData', dateWiseData);

    try {
      const response = await urlSocket.post(
        '/admin_filterData',
        {
          comp_name: comp_name,
          comp_code: comp_code,
          start_Date: startDate,
          end_date: endDate,
          station_id: currentStationId
        },
        { mode: 'no-cors' }
      );

      const data = response.data;

      if (data.error === 'Tenant not found') {
        console.log('data error', data.error);
        error_handler(data.error);
      } else {
        console.log('filter_data', data, data.length);
        setFilterData(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Show all stations
  const allshowStation = async () => {
    const station_name = 'ALL';

    try {
      const response = await urlSocket.post(
        '/station_filterData',
        {
          station_name: station_name
        },
        { mode: 'no-cors' }
      );

      const data = response.data;

      if (data.error === 'Tenant not found') {
        console.log('data error', data.error);
        error_handler(data.error);
      } else {
        console.log('filter_data185', data, data.length);
        const allData = [
          { comp_name: 'ALL', comp_code: '', show_all: true },
          ...data
        ];
        console.log('first', allData);
        setComponentList(allData);
        setDataloaded(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Show component data
  const showComp = async () => {
    let currentStartDate = start_date1;
    let currentEndDate = end_date1;
    const comp_name = filter_comp_name;
    const comp_code = filter_comp_code;
    const currentStationId = station_id;

    if (currentStartDate === '') {
      currentStartDate = getDate();
    }
    if (currentEndDate === '') {
      currentEndDate = getDate();
    }

    console.log({
      station_id: currentStationId,
      comp_name: comp_name,
      comp_code: comp_code,
      start_Date: currentStartDate,
      end_date: currentEndDate
    });

    try {
      const response = await urlSocket.post(
        '/admin_filterData',
        {
          comp_name: comp_name,
          comp_code: comp_code,
          start_Date: currentStartDate,
          end_date: currentEndDate,
          station_id: currentStationId
        },
        { mode: 'no-cors' }
      );

      const data = response.data;

      if (data.error === 'Tenant not found') {
        console.log('data error', data.error);
        error_handler(data.error);
      } else {
        console.log('filter_data', data, data.length);
        setFilterData(data);
        setStartDate(currentStartDate);
        setEndDate(currentEndDate);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Edit component (show date-wise data)
  const editComp = async data => {
    console.log('startdate', start_date1, 'enddate', end_date1);
    console.log(
      'filter_compname',
      data.comp_name,
      'filer_comp_code',
      data.comp_code
    );

    let currentStartDate = start_date1;
    let currentEndDate = end_date1;
    const comp_name = data.comp_name;
    const comp_code = data.comp_code;
    let currentStationId = data.station_id;

    console.log('station_id', currentStationId);

    if (currentStartDate === '') {
      currentStartDate = getDate();
    }
    if (currentEndDate === '') {
      currentEndDate = getDate();
    }
    if (currentStationId === undefined) {
      currentStationId = '';
    }

    try {
      const response = await urlSocket.post(
        '/dWise_filterData',
        {
          comp_name: comp_name,
          comp_code: comp_code,
          start_Date: currentStartDate,
          end_date: currentEndDate,
          station_id: currentStationId
        },
        { mode: 'no-cors' }
      );

      const responseData = response.data;

      if (responseData.error === 'Tenant not found') {
        console.log('data error', responseData.error);
        error_handler(responseData.error);
      } else {
        console.log('dataWise_filterdata', responseData);
        setDateWiseFilterdata(responseData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Show date-wise component data
  const showDateWiseComp = data => {
    console.log('comp_name', data.comp_name);
    console.log('comp_code', data.comp_code);
    console.log('date', data.date);
    console.log('total', data.total);
    console.log('ok', data.ok);
    console.log('notok', data.notok);
    console.log('posbl_match', data.posbl_match);
    console.log('no_obj', data.no_obj);
    console.log('incorrect_obj', data.incorrect_obj);
    console.log('station_id', data.station_id);

    if (data.station_id === undefined) {
      data.station_id = '';
    }

    const dropData = {
      comp_name: filter_comp_name,
      comp_code: filter_comp_code,
      startDate: startDate,
      endDate: endDate
    };

    const datas = {
      comp_name: data.comp_name,
      comp_code: data.comp_code,
      date: data.date,
      total: data.total,
      ok: data.ok,
      notok: data.notok,
      posbl_match: data.posbl_match,
      station_id: data.station_id,
      config_positive: config_positive,
      config_negative: config_negative,
      config_posble_match: config_posble_match,
      no_obj: data.no_obj,
      incorrect_obj: data.incorrect_obj
    };

    sessionStorage.removeItem('timeWiseData');
    sessionStorage.setItem('timeWiseData', JSON.stringify(datas));
    sessionStorage.removeItem('dateWiseData');
    sessionStorage.setItem('dateWiseData', JSON.stringify(dropData));
  };

  // Handle station selection
  const onSelectStation = e => {
    console.log('e', e);
    const data = [e];
    console.log('data322', data);

    if (e.show_all_data) {
      // setFilterCompName(e.station_name);
      setFilterCompName('ALL');
      setStationId('');
      setShowTable2(false);
      setTbIndex(0);
      setStationSelectedOption(e);
      // showComp will be called via useEffect
    } else {
      // setFilterCompName(e.station_name);
      setFilterCompName('ALL');

      setStationId(data[0].station_id);
      setShowTable2(false);
      setTbIndex(0);
      setStationSelectedOption(e);
      // showComp will be called via useEffect
    }
  };

  // Handle component selection
  const onSelectComponent = e => {
    console.log('e', e, stationSelectedOption);
    setFilterCompName(e.comp_name);
    setFilterCompCode(e.comp_code);
    setShowTable2(false);
    setTbIndex(0);
    setCompSelectedOption(e);
    // showComp will be called via useEffect
  };

  // Handle date range change
  const onRangeChange = (dates, dateStrings) => {
    if (dates) {
      console.log('From: ', dates[0], ', to: ', dates[1]);
      console.log('From: ', dateStrings[0], ', to: ', dateStrings[1]);
      const start_date = dateStrings[0];
      console.log('start_date', start_date);
      const end_date = dateStrings[1];
      console.log('end_date', end_date);
      start_date1 = start_date;
      end_date1 = end_date;
      setShowTable2(false);
      setTbIndex(0);
      showComp();
    } else {
      console.log('Clear');
    }
  };

  // Range presets for date picker
  const rangePresets = [
    {
      label: 'Yesterday',
      value: [dayjs().subtract(1, 'd'), dayjs().subtract(1, 'd')]
    },
    {
      label: 'Last 7 Days',
      value: [dayjs().add(-7, 'd'), dayjs()]
    },
    {
      label: 'Last 14 Days',
      value: [dayjs().add(-14, 'd'), dayjs()]
    },
    {
      label: 'Last 30 Days',
      value: [dayjs().add(-30, 'd'), dayjs()]
    },
    {
      label: 'Month to Date',
      value: [dayjs().startOf('M'), dayjs()]
    },
    {
      label: 'Year to Date',
      value: [dayjs().startOf('y'), dayjs()]
    }
  ];

  // Handle page change
  const handlePageChange = pageNumber => {
    setCurrentPage(pageNumber);
  };

  // ComponentDidMount equivalent
  useEffect(() => {
    stationInfo();
    compInfo();
    fetchConfig();
    start_date1 = '';
    end_date1 = '';
  }, []);

  // Trigger showComp when filters change
  useEffect(() => {
    if (dataloaded) {
      showComp();
    }
  }, [station_id, filter_comp_name, filter_comp_code]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filter_data.slice(indexOfFirstItem, indexOfLastItem);

  if (!dataloaded) {
    return null;
  }

  return (
    <React.Fragment>
      <div className='page-content'>
        <MetaTags>
          <title>Inspection Result Details</title>
        </MetaTags>
        <Breadcrumbs title='INSPECTION RESULT DETAILS' />

        <Container fluid>
          <Card>
            <CardBody>
              <Row lg={12}>
                <Col sm={4}>
                  <Select
                    value={stationSelectedOption}
                    onChange={onSelectStation}
                    options={stationList}
                    getOptionLabel={option => option.station_name}
                  />
                </Col>
                <Col sm={4}>
                  <Select
                    value={compSelectedOption}
                    onChange={onSelectComponent}
                    options={componentList}
                    getOptionLabel={option =>
                      `${option.comp_name} ${option.comp_code}`
                    }
                  />
                </Col>
                <Col sm={4} className='text-end'>
                  <RangePicker
                    presets={[
                      {
                        label: (
                          <span aria-label='Current Time to End of Day'>
                            Today
                          </span>
                        ),
                        value: () => [dayjs(), dayjs().endOf('day')]
                      },
                      ...rangePresets
                    ]}
                    defaultValue={[dayjs(), dayjs().endOf('day')]}
                    showTime
                    format='YYYY-MM-DD'
                    onChange={onRangeChange}
                    onOk={() => {
                      setShowTable2(false);
                      setTbIndex(0);
                      showComp();
                    }}
                  />
                </Col>
              </Row>

              <div className='table-responsive mt-4'>
                <PaginationComponent
                  totalItems={filter_data.length}
                  itemsPerPage={itemsPerPage}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
                <Table
                  className='table mb-0 align-middle table-nowrap table-check'
                  bordered
                >
                  <thead className='table-light'>
                    <tr>
                      <th>Name</th>
                      <th>Code</th>
                      <th>Total Inspected</th>
                      <th>{config_positive}</th>
                      <th>{config_negative}</th>
                      <th>No object found</th>
                      <th>Incorrect Object</th>
                      <th>More</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map(
                      (data, index) =>
                        data.show_all === undefined && (
                          <React.Fragment key={index}>
                            <tr>
                              <td
                                style={{ backgroundColor: 'white' }}
                                width='25%'
                              >
                                {data.comp_name}
                              </td>
                              <td
                                style={{ backgroundColor: 'white' }}
                                width='10%'
                              >
                                {data.comp_code}
                              </td>
                              <td
                                style={{ backgroundColor: 'white' }}
                                width='10%'
                              >
                                {data.total}
                              </td>
                              <td
                                style={{ backgroundColor: 'white' }}
                                width='10%'
                              >
                                {data.ok}
                              </td>
                              <td
                                style={{ backgroundColor: 'white' }}
                                width='10%'
                              >
                                {data.notok}
                              </td>
                              <td
                                style={{ backgroundColor: 'white' }}
                                width='10%'
                              >
                                {data.no_obj}
                              </td>
                              <td
                                style={{ backgroundColor: 'white' }}
                                width='10%'
                              >
                                {data.incorrect_obj}
                              </td>
                              <td
                                style={{ backgroundColor: 'white' }}
                                width='15%'
                              >
                                <Button
                                  size='sm'
                                  className='w-md'
                                  color='primary'
                                  onClick={() => {
                                    editComp(data);
                                    setShowTable2(true);
                                    setTbIndex(index);
                                  }}
                                >
                                  DateWise
                                </Button>
                              </td>
                            </tr>
                            {tbIndex === index && showTable2 && (
                              <tr>
                                <td colSpan='8'>
                                  <Table
                                    className='table mb-0 align-middle table-nowrap table-check'
                                    bordered
                                  >
                                    <thead className='table-light'>
                                      <tr>
                                        <th>Date</th>
                                        <th>Total Inspected</th>
                                        <th>{config_positive}</th>
                                        <th>{config_negative}</th>
                                        <th>No object found</th>
                                        <th>Incorrect Object</th>
                                        <th>More</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {dateWise_filterdata.map(
                                        (data, idx) =>
                                          data.show_all === undefined && (
                                            <tr key={idx}>
                                              <td
                                                style={{
                                                  backgroundColor: 'white'
                                                }}
                                                width='35%'
                                              >
                                                {data.date}
                                              </td>
                                              <td
                                                style={{
                                                  backgroundColor: 'white'
                                                }}
                                                width='10%'
                                              >
                                                {data.total}
                                              </td>
                                              <td
                                                style={{
                                                  backgroundColor: 'white'
                                                }}
                                                width='10%'
                                              >
                                                {data.ok}
                                              </td>
                                              <td
                                                style={{
                                                  backgroundColor: 'white'
                                                }}
                                                width='10%'
                                              >
                                                {data.notok}
                                              </td>
                                              <td
                                                style={{
                                                  backgroundColor: 'white'
                                                }}
                                                width='10%'
                                              >
                                                {data.no_obj}
                                              </td>
                                              <td
                                                style={{
                                                  backgroundColor: 'white'
                                                }}
                                                width='10%'
                                              >
                                                {data.incorrect_obj}
                                              </td>
                                              <td
                                                style={{
                                                  backgroundColor: 'white'
                                                }}
                                                width='15%'
                                              >
                                                <Link to='/time_wise_report'>
                                                  <Button
                                                    size='sm'
                                                    className='w-md'
                                                    color='primary'
                                                    onClick={() =>
                                                      showDateWiseComp(data)
                                                    }
                                                  >
                                                    View Info
                                                  </Button>
                                                </Link>
                                              </td>
                                            </tr>
                                          )
                                      )}
                                    </tbody>
                                  </Table>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        )
                    )}
                  </tbody>
                </Table>
                {filter_data.length === 0 && (
                  <div
                    className='container'
                    style={{ position: 'relative', height: '20vh' }}
                  >
                    <div
                      className='text-center'
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <h5 className='text-secondary'>No Records found</h5>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </Container>
      </div>
    </React.Fragment>
  );
};

CRUDComponent.propTypes = {
  history: PropTypes.any
};

export default CRUDComponent;
