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
// import urlSocket from './urlSocket';
// import ImageUrl from "./imageUrl";
// import dayjs from 'dayjs';
// import Breadcrumbs from "components/Common/Breadcrumb";
// // import CardComp from './Components/CardComp'

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
//             showTable2: false,
//             tbIndex: 0,
//             dateWise_filterdata: [],
//             addCompModal: false,
//             selectedOption: { "comp_name": "ALL", "comp_code": "", "show_all": true },
//             componentList: [

//             ]
//         }
//     }

//     componentDidMount() {
//         var stationData = JSON.parse(sessionStorage.getItem("stationInfo"))
//         // if (start_date1 && end_date1 !== null) {
//         //     if (start_date1 && end_date1) {
//         //         // Set the stored values as the default value
//         //         const defaultValue = [dayjs(start_date1), dayjs(end_date1)];
//         //         this.setState({ defaultValue });
//         //     }
//         // }
//         // else {
//         //     const defaultValue=[dayjs(), dayjs().endOf('day')]
//         //     this.setState({ defaultValue });
//         // }

//         console.log('stationData', stationData)
//         this.setState({ station_info: stationData })
//         this.compListAPICall(stationData)
//         start_date1 = ""
//         end_date1 = ""
//         this.test_api()
//     }

//     test_api = () => {
//         try {
//             urlSocket.post('/test_api',
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let datas = response.data
//                     console.log('detailes88', datas)
//                     //this.setState({ componentList: data, dataloaded: true })
//                     if (datas === 'ok') {
//                         console.log('first', datas)
//                         this.label_config()
//                     }
//                     else {
//                         console.log('first', 'datas')
//                         this.confign()
//                     }
//                 })
//                 .catch((error) => {
//                     console.log(error)
//                     this.confign()
//                 })
//         } catch (error) {
//             console.log("----", error)
//         }
//     }

//     label_config = () => {
//         try {
//             urlSocket.post('/config',
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let data = response.data
//                     console.log('detailes88', data)
//                     this.setState({ config_data: data, config_positive: data[0].positive, config_negative: data[0].negative, config_posble_match: data[0].posble_match })
//                 })
//         } catch (error) {

//         }
//     }

//     confign = (second) => {
//         try {
//             urlSocket.post('/nonSync_config',
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let data = response.data
//                     console.log('config_data73', data)
//                     this.setState({ config_data: data, config_positive: data[0].positive, config_negative: data[0].negative, config_posble_match: data[0].posble_match })
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

//     compListAPICall = (data) => {
//         console.log('data', data)
//         try {
//             urlSocket.post('/inspect_filterData', { 'station_id': data[0]._id },   //changed the url ./active_filterData
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let data = response.data
//                     console.log('detailes', data)
//                     // console.log('componentList', data[1].comp_info)
//                     //  let allData = [{ comp_name: 'ALL', comp_code: "", show_all: true }, ...data[1].comp_info]
//                     let allData = [{ comp_name: 'ALL', comp_code: "", show_all: true }, ...data]
//                     // allData.push(data)
//                     console.log('first', allData)
//                     // this.setState({ componentList: allData, station_info:data[0].station_info, dataloaded: true })
//                     this.setState({ componentList: allData, dataloaded: true })
//                     this.allshowComp(this.state.station_info)
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

//     allshowComp = (data) => {
//         let startDate = this.getDate()
//         let endDate = this.getDate()
//         let comp_name = "ALL"
//         let comp_code = ""
//         let station_id = data[0]._id
//         console.log('station_id', station_id)
//         var dateWiseData = JSON.parse(sessionStorage.getItem("dateWiseData"))
//         console.log('dateWiseData', dateWiseData)
//         this.setState({ dateWiseData })

//         try {
//             urlSocket.post('/filterData', { 'comp_name': comp_name, 'comp_code': comp_code, 'start_Date': startDate, 'end_date': endDate, 'station_id': station_id },
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let filter_data = response.data
//                     console.log("filter_data", filter_data, filter_data.length)
//                     this.setState({ filter_data })
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

//     showComp = async () => {
//         // console.log('startdate', start_date1, 'enddate', end_date1)
//         // console.log('filter_comp_name', this.state.filter_comp_name, 'filer_comp_code', this.state.filter_comp_code)
//         let startDate = start_date1
//         let endDate = end_date1
//         let comp_name = this.state.filter_comp_name
//         let comp_code = this.state.filter_comp_code
//         let station_id = this.state.station_info[0]._id
//         if (startDate === '') {
//             startDate = this.getDate()
//         }
//         if (endDate === '') {
//             endDate = this.getDate()
//         }
//         console.log({ 'comp_name': comp_name, 'comp_code': comp_code, 'start_Date': startDate, 'end_date': endDate })
//         try {
//             urlSocket.post('/filterData', { 'comp_name': comp_name, 'comp_code': comp_code, 'start_Date': startDate, 'end_date': endDate, 'station_id': station_id },
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let filter_data = response.data
//                     console.log("filter_data", filter_data, filter_data.length)
//                     this.setState({ filter_data, startDate, endDate })
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
//         let station_id = this.state.station_info[0]._id
//         if (startDate === '') {
//             startDate = this.getDate()
//         }
//         if (endDate === '') {
//             endDate = this.getDate()
//         }
//         try {
//             urlSocket.post('/dateWise_filterData', { 'comp_name': comp_name, 'comp_code': comp_code, 'start_Date': startDate, 'end_date': endDate, 'station_id': station_id },
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let dateWise_filterdata = response.data
//                     console.log("dataWise_filterdata", dateWise_filterdata)
//                     this.setState({ dateWise_filterdata })
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
//         console.log('incorrecr_obj321', data.incorrect_obj)
//         let station_id = this.state.station_info[0]._id

//         let dropData = {
//             comp_name: this.state.filter_comp_name,
//             comp_code: this.state.filter_comp_code,
//             station_id: station_id,
//             startDate: this.state.startDate,
//             endDate: this.state.endDate
//         }

//         let datas = {
//             comp_name: data.comp_name,
//             comp_code: data.comp_code,
//             station_id: station_id,
//             date: data.date,
//             total: data.total,
//             ok: data.ok,
//             notok: data.notok,
//             posbl_match: data.posbl_match,
//             config_positive: this.state.config_positive,
//             config_negative: this.state.config_negative,
//             config_posble_match: this.state.config_posble_match,
//             no_obj: data.no_obj,
//             incorrect_obj: data.incorrect_obj
//         }

//         sessionStorage.removeItem("timeWiseData")
//         sessionStorage.setItem("timeWiseData", JSON.stringify(datas))
//         sessionStorage.removeItem("dateWiseData")
//         sessionStorage.setItem("dateWiseData", JSON.stringify(dropData))
//     }

//     onSelectComponent = (e) => {
//         console.log('e', e)
//         // var result = [];
//         // var options = e && e.comp_name;
//         // var option = e.comp_code;
//         // console.log('options', options)
//         // this.setState({filter_comp_name: })
//         //var opt;

//         // for (var i=0, iLen=options.length; i<iLen; i++) {
//         //   opt = options[i];
//         //   console.log('opt', opt)
//         //   if (opt.selected) {
//         //     result.push(opt.value || opt.text);
//         //   }
//         // }
//         if (e.show_all) {
//             this.setState({ filter_comp_name: e.comp_name, filter_comp_code: e.comp_code })
//             console.log('Show All', e.comp_name, e.comp_code)
//         } else {
//             this.setState({ filter_comp_name: e.comp_name, filter_comp_code: e.comp_code })
//             console.log('Else')
//         }
//         let startDate = start_date1
//         let endDate = end_date1
//         let comp_name = e.comp_name
//         let comp_code = e.comp_code
//         let station_id = this.state.station_info[0]._id
//         if (startDate === '') {
//             startDate = this.getDate()
//         }

//         if (endDate === '') {
//             endDate = this.getDate()
//         }

//         console.log({ 'comp_name': comp_name, 'comp_code': comp_code, 'start_Date': startDate, 'end_date': endDate })
//         try {
//             urlSocket.post('/filterData', { 'comp_name': comp_name, 'comp_code': comp_code, 'start_Date': startDate, 'end_date': endDate, 'station_id': station_id },
//                 { mode: 'no-cors' })
//                 .then((response) => {
//                     let filter_data = response.data
//                     console.log("filter_data", filter_data, filter_data.length)
//                     this.setState({ filter_data, startDate, endDate })
//                 })
//                 .catch((error) => {
//                     console.log(error)
//                 })
//         } catch (error) {

//         }
//     }

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
//             sessionStorage.setItem("start_date1", JSON.stringify(start_date1))
//             sessionStorage.setItem("end_date1", JSON.stringify(end_date1))
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

//     render() {
//         if (this.state.dataloaded) {
//             return (
//                 <React.Fragment>
//                     <div className="page-content">
//                         <MetaTags>
//                             <title>Inspection Result Details</title>
//                         </MetaTags>
//                         <Breadcrumbs title="INSPECTION RESULT DETAILS" />
//                         <Container fluid>
//                             <Card>
//                                 <CardBody>
//                                     <Row lg={12}>
//                                         <Col sm={4}>
//                                             {/* <Row>
//                                         <Col className="text-center mb-2"  style={{ fontWeight: 'bold' }}>Station Name</Col>
//                                     </Row> */}
//                                             <Select
//                                                 value={this.state.selectedOption}
//                                                 onChange={(e) => this.onSelectComponent(e, this.setState({ selectedOption: e, showTable2: false, tbIndex: 0 }))}
//                                                 options={this.state.componentList}
//                                                 getOptionLabel={option => (option.comp_name + " " + option.comp_code)}
//                                             />
//                                         </Col>
//                                         <Col sm={4} className="d-flex justify-content-end">
//                                             <RangePicker
//                                                 presets={[
//                                                     {
//                                                         label: <span aria-label="Current Time to End of Day">Today</span>,
//                                                         value: () => [dayjs(), dayjs().endOf('day')], // 5.8.0+ support function
//                                                     },
//                                                     ...this.rangePresets,
//                                                 ]}
//                                                 defaultValue={[dayjs(), dayjs().endOf('day')]}
//                                                 // defaultValue={this.state.defaultValue}
//                                                 showTime
//                                                 format="YYYY-MM-DD"
//                                                 onChange={this.onRangeChange}
//                                                 onOk={() => this.showComp(this.setState({
//                                                     showTable2: false,
//                                                     tbIndex: 0
//                                                 }))}
//                                             />
//                                         </Col>
//                                     </Row>
//                                     <div className="table-responsive mt-4">
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
//                                                     this.state.filter_data.map((data, index) => (
//                                                         //  {
//                                                         data.show_all === undefined &&
//                                                         <React.Fragment key={index}>
//                                                             <tr key={index}>
//                                                                 <td style={{ backgroundColor: "white" }} width="15%">{data.comp_name}</td>
//                                                                 <td style={{ backgroundColor: "white" }} width="10%">{data.comp_code}</td>
//                                                                 <td style={{ backgroundColor: "white" }} width="10%">{data.total}</td>
//                                                                 <td style={{ backgroundColor: "white" }} width="10%">{data.ok}</td>
//                                                                 <td style={{ backgroundColor: "white" }} width="10%">{data.notok}</td>
//                                                                 {/* <td width="10%">{data.posbl_match}</td> */}
//                                                                 <td style={{ backgroundColor: "white" }} width="10%">{data.no_obj}</td>
//                                                                 <td style={{ backgroundColor: "white" }} width="10%">{data.incorrect_obj}</td>
//                                                                 <td style={{ backgroundColor: "white" }} width="15%">
//                                                                     <Button size="sm" className="w-md" color="primary" onClick={() => this.editComp(data, this.setState({ showTable2: true, tbIndex: index }))}>DateWise</Button></td>
//                                                             </tr>
//                                                             {
//                                                                 (this.state.tbIndex === index) && this.state.showTable2 &&
//                                                                 <>
//                                                                     <tr key={index} >
//                                                                         <td style={{ backgroundColor: "white" }} colSpan="8">
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
//                                                                                                 <td style={{ backgroundColor: "white" }} width="25%">{data.date}</td>
//                                                                                                 <td style={{ backgroundColor: "white" }} width="10%">{data.total}</td>
//                                                                                                 <td style={{ backgroundColor: "white" }} width="10%">{data.ok}</td>
//                                                                                                 <td style={{ backgroundColor: "white" }} width="10%">{data.notok}</td>
//                                                                                                 {/* <td width="10%">{data.posbl_match}</td> */}
//                                                                                                 <td style={{ backgroundColor: "white" }} width="10%">{data.no_obj}</td>
//                                                                                                 <td style={{ backgroundColor: "white" }} width="10%">{data.incorrect_obj}</td>
//                                                                                                 <td style={{ backgroundColor: "white" }} width="15%">
//                                                                                                     <Link to="/timewise">
//                                                                                                         <Button size="sm" className="w-md" color="primary" onClick={() => this.showDateWiseComp(data)}>
//                                                                                                             View Info
//                                                                                                         </Button>
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

//                                     </div>
//                                     {
//                                         this.state.filter_data.length === 0 ?
//                                             <div className="container" style={{ position: 'relative', height: '20vh' }}>
//                                                 <div className="text-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} >
//                                                     <h5 className="text-secondary">No Records found</h5>
//                                                 </div>
//                                             </div>
//                                             : null
//                                     }

//                                 </CardBody>
//                             </Card>
//                             {/* <Row>
//                                 <Col sm={6} className="mt-4">
//                                     <Select
//                                         value={this.state.selectedOption}
//                                         onChange={(e) => this.onSelectComponent(e, this.setState({ selectedOption: e, showTable2: false, tbIndex: 0 }))}
//                                         options={this.state.componentList}
//                                         getOptionLabel={option => (option.comp_name + " " + option.comp_code)}
//                                     />

//                                 </Col>
//                                 <Col sm={6}>
//                                     <Space direction="vertical" size={12}
//                                         style={{
//                                             gap: '0px',
//                                             background: 'gray',
//                                             padding: '6px',
//                                             borderRadius: '10px',
//                                         }}
//                                     >
//                                         <Row
//                                             style={{
//                                                 padding: '0px 10px',
//                                                 color: 'white',
//                                                 fontWeight: 'bold',
//                                             }}
//                                         >
//                                             <Col>Start Date</Col>
//                                             <Col>End Date</Col>
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
//                                             // defaultValue={this.state.defaultValue}
//                                             showTime
//                                             format="YYYY-MM-DD"
//                                             onChange={this.onRangeChange}
//                                             onOk={() => this.showComp(this.setState({
//                                                 showTable2: false,
//                                                 tbIndex: 0
//                                             }))}
//                                         />
//                                     </Space>
//                                 </Col>
//                             </Row> */}

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
import { Card, Col, Container, Row, CardBody, Table, Button } from 'reactstrap';
import Select from 'react-select';
import { DatePicker, Space } from 'antd';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import urlSocket from './urlSocket';
import Breadcrumbs from 'components/Common/Breadcrumb';
import urlsocket from './urlSocket';
const { RangePicker } = DatePicker;

let start_date1 = '';
let end_date1 = '';

function CRUDComponent () {
  // ------ STATE ------
  const [dataloaded, setDataloaded] = useState(false);
  const [componentList, setComponentList] = useState([]);
  const [config_positive, setConfig_positive] = useState('');
  const [config_negative, setConfig_negative] = useState('');
  const [config_posble_match, setConfig_posble_match] = useState('');
  const [filter_comp_name, setFilter_comp_name] = useState('ALL');
  const [filter_comp_code, setFilter_comp_code] = useState('');
  const [filter_data, setFilter_data] = useState([]);
  const [dateWise_filterdata, setDateWise_filterdata] = useState([]);
  const [station_info, setStation_info] = useState([]);
  const [showTable2, setShowTable2] = useState(false);
  const [tbIndex, setTbIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState({
    comp_name: 'ALL',
    comp_code: '',
    show_all: true
  });
  const [dateWiseData, setDateWiseData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // ============================ MOUNT ===============================
  //   useEffect(() => {
  //     const stationData = JSON.parse(sessionStorage.getItem('stationInfo'));
  //     setStation_info(stationData);

  //     compListAPICall(stationData);

  //     start_date1 = '';
  //     end_date1 = '';

  //     test_api();
  //   }, []);

  useEffect(() => {
    const stationData = JSON.parse(sessionStorage.getItem('stationInfo'));
    console.log('stationData', stationData);

    if (stationData) {
      setStation_info(stationData);
      compListAPICall(stationData);
    } else {
      console.error('No stationInfo found in sessionStorage');
    }

    start_date1 = '';
    end_date1 = '';

    test_api();
  }, []);

  // ======================= API CALLS ==========================
  const test_api = () => {
    urlSocket
      .post('/test_api', { mode: 'no-cors' })
      .then(res => {
        if (res.data === 'ok') label_config();
        else confign();
      })
      .catch(() => confign());
  };

  const label_config = () => {
    urlSocket.post('/config', { mode: 'no-cors' }).then(res => {
      const dt = res.data;
      setConfig_positive(dt[0].positive);
      setConfig_negative(dt[0].negative);
      setConfig_posble_match(dt[0].posble_match);
    });
  };

  const confign = () => {
    urlSocket.post('/nonSync_config', { mode: 'no-cors' }).then(res => {
      const dt = res.data;
      setConfig_positive(dt[0].positive);
      setConfig_negative(dt[0].negative);
      setConfig_posble_match(dt[0].posble_match);
    });
  };

  //   const compListAPICall = data => {
  //     urlSocket
  //       .post(
  //         '/inspect_filterData',
  //         { station_id: data[0]._id },
  //         { mode: 'no-cors' }
  //       )
  //       .then(res => {
  //         let allData = [
  //           { comp_name: 'ALL', comp_code: '', show_all: true },
  //           ...res.data
  //         ];
  //         setComponentList(allData);
  //         setDataloaded(true);

  //         allshowComp(data);
  //       });
  //   };

  const compListAPICall = async stationInfo => {
    if (
      !stationInfo ||
      !Array.isArray(stationInfo) ||
      !stationInfo[0] ||
      !stationInfo[0]._id
    ) {
      console.error('stationInfo missing or invalid:', stationInfo);
      return;
    }

    const station_id = stationInfo[0]._id;

    try {
      const response = await urlsocket.post('/inspect_filterData', {
        station_id
      });

      console.log('responsecompdata', response);

      const allData = [
        { comp_name: 'ALL', comp_code: '', show_all: true },
        ...response.data
      ];

      setComponentList(allData);
      setDataloaded(true);
      allshowComp(stationInfo);
    } catch (err) {
      console.error('API Error:', err);
    }
  };

  const getDate = () => {
    let today = new Date();
    return today.toISOString().slice(0, 10);
  };

  const allshowComp = data => {
    let today = getDate();
    let station_id = data[0]._id;

    const dateWiseDataStore = JSON.parse(
      sessionStorage.getItem('dateWiseData')
    );
    setDateWiseData(dateWiseDataStore);

    urlSocket
      .post(
        '/filterData',
        {
          comp_name: 'ALL',
          comp_code: '',
          start_Date: today,
          end_date: today,
          station_id
        },
        { mode: 'no-cors' }
      )
      .then(res => setFilter_data(res.data));
  };

  const showComp = () => {
    let station_id = station_info[0]._id;

    let startDateVal = start_date1 || getDate();
    let endDateVal = end_date1 || getDate();

    urlSocket
      .post(
        '/filterData',
        {
          comp_name: filter_comp_name,
          comp_code: filter_comp_code,
          start_Date: startDateVal,
          end_date: endDateVal,
          station_id
        },
        { mode: 'no-cors' }
      )
      .then(res => {
        setFilter_data(res.data);
        setStartDate(startDateVal);
        setEndDate(endDateVal);
      });
  };

  const editComp = data => {
    let station_id = station_info[0]._id;
    let startDateVal = start_date1 || getDate();
    let endDateVal = end_date1 || getDate();

    urlSocket
      .post(
        '/dateWise_filterData',
        {
          comp_name: data.comp_name,
          comp_code: data.comp_code,
          start_Date: startDateVal,
          end_date: endDateVal,
          station_id
        },
        { mode: 'no-cors' }
      )
      .then(res => setDateWise_filterdata(res.data));
  };

  const showDateWiseComp = data => {
    let station_id = station_info[0]._id;

    let storeData = {
      comp_name: data.comp_name,
      comp_code: data.comp_code,
      station_id,
      date: data.date,
      total: data.total,
      ok: data.ok,
      notok: data.notok,
      posbl_match: data.posbl_match,
      config_positive,
      config_negative,
      config_posble_match,
      no_obj: data.no_obj,
      incorrect_obj: data.incorrect_obj
    };

    let drop = {
      comp_name: filter_comp_name,
      comp_code: filter_comp_code,
      station_id,
      startDate,
      endDate
    };

    sessionStorage.setItem('timeWiseData', JSON.stringify(storeData));
    sessionStorage.setItem('dateWiseData', JSON.stringify(drop));
  };

  // ========================= SELECT COMP =========================
  const onSelectComponent = e => {
    setSelectedOption(e);
    setFilter_comp_name(e.comp_name);
    setFilter_comp_code(e.comp_code);
    setShowTable2(false);
    setTbIndex(0);

    let station_id = station_info[0]._id;
    let startDateVal = start_date1 || getDate();
    let endDateVal = end_date1 || getDate();

    urlSocket
      .post(
        '/filterData',
        {
          comp_name: e.comp_name,
          comp_code: e.comp_code,
          start_Date: startDateVal,
          end_date: endDateVal,
          station_id
        },
        { mode: 'no-cors' }
      )
      .then(res => {
        setFilter_data(res.data);
        setStartDate(startDateVal);
        setEndDate(endDateVal);
      });
  };

  // ===================== DATE RANGE EVENTS =====================
  const onRangeChange = (dates, dateStrings) => {
    if (dates) {
      start_date1 = dateStrings[0];
      end_date1 = dateStrings[1];

      sessionStorage.setItem('start_date1', JSON.stringify(start_date1));
      sessionStorage.setItem('end_date1', JSON.stringify(end_date1));

      showComp();
      setShowTable2(false);
      setTbIndex(0);
    }
  };

  // ===================== PRESETS =====================
  const rangePresets = [
    {
      label: 'Yesterday',
      value: [dayjs().subtract(1, 'd'), dayjs().subtract(1, 'd')]
    },
    { label: 'Last 7 Days', value: [dayjs().add(-7, 'd'), dayjs()] },
    { label: 'Last 14 Days', value: [dayjs().add(-14, 'd'), dayjs()] },
    { label: 'Last 30 Days', value: [dayjs().add(-30, 'd'), dayjs()] },
    { label: 'Month to Date', value: [dayjs().startOf('M'), dayjs()] },
    { label: 'Year to Date', value: [dayjs().startOf('y'), dayjs()] }
  ];

  // =================== RENDER ====================
  if (!dataloaded) return null;

  return (
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
                  value={selectedOption}
                  onChange={onSelectComponent}
                  options={componentList}
                  getOptionLabel={option =>
                    option.comp_name + ' ' + option.comp_code
                  }
                />
              </Col>

              <Col sm={4} className='d-flex justify-content-end'>
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
                  onOk={showComp}
                />
              </Col>
            </Row>

            {/* ===== TABLE 1 ===== */}
            <div className='table-responsive mt-4'>
              <Table
                bordered
                className='table mb-0 align-middle table-nowrap table-check'
              >
                <thead className='table-light'>
                  <tr>
                    <th>Comp Name</th>
                    <th>Comp Code</th>
                    <th>Total Inspected</th>
                    <th>{config_positive}</th>
                    <th>{config_negative}</th>
                    <th>No object found</th>
                    <th>Incorrect Object</th>
                    <th>More</th>
                  </tr>
                </thead>

                <tbody>
                  {filter_data.map(
                    (data, index) =>
                      data.show_all === undefined && (
                        <React.Fragment key={index}>
                          <tr>
                            <td>{data.comp_name}</td>
                            <td>{data.comp_code}</td>
                            <td>{data.total}</td>
                            <td>{data.ok}</td>
                            <td>{data.notok}</td>
                            <td>{data.no_obj}</td>
                            <td>{data.incorrect_obj}</td>
                            <td>
                              <Button
                                size='sm'
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

                          {/* ======== DATEWISE TABLE ======= */}
                          {tbIndex === index && showTable2 && (
                            <tr>
                              <td colSpan='8'>
                                <Table
                                  bordered
                                  className='table mb-0 align-middle table-nowrap table-check'
                                >
                                  <thead className='table-light'>
                                    <tr>
                                      <th>Date</th>
                                      <th>Total</th>
                                      <th>{config_positive}</th>
                                      <th>{config_negative}</th>
                                      <th>No object found</th>
                                      <th>Incorrect Object</th>
                                      <th>More</th>
                                    </tr>
                                  </thead>

                                  <tbody>
                                    {dateWise_filterdata.map(
                                      (d, i) =>
                                        d.show_all === undefined && (
                                          <tr key={i}>
                                            <td>{d.date}</td>
                                            <td>{d.total}</td>
                                            <td>{d.ok}</td>
                                            <td>{d.notok}</td>
                                            <td>{d.no_obj}</td>
                                            <td>{d.incorrect_obj}</td>
                                            <td>
                                              <Link to='/timewise'>
                                                <Button
                                                  size='sm'
                                                  color='primary'
                                                  onClick={() =>
                                                    showDateWiseComp(d)
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
            </div>

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
          </CardBody>
        </Card>
      </Container>
    </div>
  );
}

CRUDComponent.propTypes = {
  history: PropTypes.any
};

export default CRUDComponent;
