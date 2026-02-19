import React, { Component } from "react";
import MetaTags from 'react-meta-tags';
import PropTypes from "prop-types"
import { Col, Container, Row, CardTitle, Button, Table } from "reactstrap";
import axios from "axios";
import { DatePicker } from 'antd';
import moment from 'moment';
import 'antd/dist/antd.css';
import { Link } from "react-router-dom";
import Select from 'react-select';
import { options } from "toastr";
import {JsonTable} from 'react-json-to-html';
import urlSocket from "../AdminInspection/urlSocket";

const { RangePicker } = DatePicker;
let start_date1 = ""
let end_date1 = ""

class LogInfo extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataloaded: false,
            showTable2: false,
            tbIndex: 0,
            log_data: [],
            options: [{ label: 'All' },
            { label: 'configuration' },
            { label: 'Manage component' },
            { label: 'Training' },
            { label: 'Admin accuracy testing' },
            { label: 'Live Inspection' }
            ],

            selectedOption: { label: "All" },
        }
    }

    componentDidMount() {
       
        start_date1 = ""
        end_date1 = ""
        this.allshowComp()
    }

    getDate = () => {
        let today = new Date();
        let yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0!
        let dd = today.getDate();
        return today = yyyy + '-' + mm + '-' + dd
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

    onSelectComponent = (e1) => {
        console.log('e', e1)
    }
    allshowComp = () => {
        let startDate = this.getDate()
        let endDate = this.getDate()
        let activity_type = "All"       
        // var dateWiseData = JSON.parse(sessionStorage.getItem("dateWiseData"))
        // console.log('dateWiseData', dateWiseData)
        // this.setState({dateWiseData})

        try {
            urlSocket.post('/log_info', { 'activity_type': activity_type, 'start_Date': startDate, 'end_date': endDate },
                { mode: 'no-cors' })
                .then((response) => {
                    let filter_data = response.data
                    console.log("filter_data", filter_data, filter_data.length)
                    this.setState({ log_data:filter_data })
                    console.log('this.setState', this.state.log_data)
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

    submit = async() => {
        let select_label = this.state.selectedOption
        let activity_type = select_label.label
        let startDate = start_date1
        let endDate = end_date1
        if (startDate === '') {
            startDate = this.getDate()
        }
        if (endDate === '') {
            endDate = this.getDate()
        }
        try {
            urlSocket.post('/log_info', { 'activity_type': activity_type ,'start_Date': startDate, 'end_date': endDate},
                // axios.post('https://172.16.1.91:5000/update_config', { '_id': id, 'min_notok_for_training': notok, "min_ok_for_training": ok, 'inspection_type': selectManual_Auto },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('min_notok_for_training', data)
                    this.setState({ log_data: data })
                    console.log('this.setState', this.state.log_data)

                    // window.location.reload(false);             
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)

        }
    }

    render() {

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
                                <CardTitle className="text-center">LogInfo</CardTitle>
                            </Col>
                        </Row>
                        <Row md={12}>
                            <Col sm={5}>
                                <Select
                                    value={this.state.selectedOption}
                                    onChange={(e1) => this.onSelectComponent(this.setState({ selectedOption: e1.label }), this.setState({ selectedOption: e1 }))}
                                    options={this.state.options}
                                />
                            </Col>
                            <Col sm={5}>
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
                                    <Button color="primary" className="w-md m-1" onClick={() => this.submit()}>Submit</Button>
                                </div>
                            </Col>
                        </Row>
                        <div className="table-responsive">
                            <Table striped>
                                <thead>
                                    <tr>
                                        <th>Date and time</th>
                                        <th>User Info</th>
                                        <th>Component name</th>
                                        <th>Component code</th>
                                        <th>Screen Name</th>
                                        <th>Actions</th>
                                        <th>Activity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.log_data.map((data, index) => (
                                            <tr key={index}>
                                                <td>{data.date_time}</td>
                                                <td>{data.user_info}</td>
                                                <td>{data.comp_name}</td>
                                                <td>{data.comp_code}</td>
                                                <td>{data.screen_name}</td>
                                                <td>{data.action}</td> 
                                                <td><JsonTable json={data.report_data[0]} /></td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </Table>
                            {/* <JsonTable json={this.state.log_data} /> */}
                        </div>
                    </Container>
                    {/* container-fluid */}
                </div>
            </React.Fragment>
        );
    }
}

LogInfo.propTypes = {
    history: PropTypes.any.isRequired,
};
export default LogInfo;