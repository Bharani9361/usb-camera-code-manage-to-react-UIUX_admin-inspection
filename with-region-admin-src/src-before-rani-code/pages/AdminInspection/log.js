import React, { Component } from "react";
import MetaTags from 'react-meta-tags';
import PropTypes from "prop-types"
import { Col, Container, Row, CardTitle, Button, Table, Card, CardBody, Input } from "reactstrap";
import axios from "axios";
import { DatePicker, Space } from 'antd';
import moment from 'moment';
// import 'antd/dist/antd.css';
import { Link } from "react-router-dom";
import Select from 'react-select';
import { options } from "toastr";
import { JsonTable } from 'react-json-to-html';
import urlSocket from "./urlSocket";
import dayjs from 'dayjs';
import PaginationComponent from "./PaginationComponent";
import Breadcrumbs from "components/Common/Breadcrumb";

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
            // options: [
            //     { label: 'All' },
            //     { label: 'configuration' },
            //     { label: 'Manage component' },
            //     { label: 'Training' },
            //     { label: 'Admin accuracy testing' },
            //     // { label: 'Model Info Config' },
            //     { label: 'manage model' },
            //     { label: 'model creation' },
            //     // { label: 'component model version info' },
            //     { label: 'Station Info' },
            //     { label: 'Manage station component' },
            //     { label: 'comp Info page' },
            //     { label: 'Model version Information' },
            //     // { label: 'Live Inspection' },
            // ],
            //chiran
            options: [
                { label: 'All' },
                { label: 'configuration' },
                { label: 'Manage component' },
                { label: 'Training' },
                { label: 'Admin accuracy testing' },
                // { label: 'Model Info Config' },
                { label: 'manage model' },
                { label: 'model creation' },
                // { label: 'component model version info' },
                { label: 'Station Info' },
                { label: 'Manage station component' },
                { label: 'comp Info page' },
                { label: 'Model version Information' },
                { label: 'Manage Stage' },
                { label: 'Stage Manage Model' },
                // { label: 'Live Inspection' },
            ],

            selectedOption: { label: "All" },

            // pagination
            currentPage: 1,
            itemsPerPage: 10,

            expandedRow: null,
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
                    if (filter_data.error === "Tenant not found") {
                        console.log("data error", filter_data.error);
                        this.error_handler(filter_data.error);
                    }
                    else {
                        console.log("filter_data", filter_data, filter_data.length)
                        this.setState({ log_data: filter_data })
                        console.log('this.setState', this.state.log_data)
                    }

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

    submit = async () => {
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
            urlSocket.post('/log_info', { 'activity_type': activity_type, 'start_Date': startDate, 'end_date': endDate },
                // axios.post('https://172.16.1.91:5000/update_config', { '_id': id, 'min_notok_for_training': notok, "min_ok_for_training": ok, 'inspection_type': selectManual_Auto },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    if (data.error === "Tenant not found") {
                        console.log("data error", data.error);
                        this.error_handler(data.error);
                    }
                    else {
                        console.log('min_notok_for_training', data)
                        this.setState({ log_data: data })
                        console.log('this.setState', this.state.log_data)
                    }


                    // window.location.reload(false);             
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error);
        } finally {
            this.setState({
                currentPage: 1,
                expandedRow: null,
            })
        }
    }



    // New Calender code for filter data
    onChange = (date) => {
        if (date) {
            console.log('Date: ', date);
        } else {
            console.log('Clear');
        }
    };

    onRangeChange = (dates, dateStrings) => {
        if (dates) {
            console.log('From: ', dates[0], ', to: ', dates[1]);
            console.log('From: ', dateStrings[0], ', to: ', dateStrings[1]);
            let start_date = dateStrings[0]
            console.log('start_date', start_date)
            let end_date = dateStrings[1]
            console.log('end_date', end_date)
            start_date1 = start_date
            end_date1 = end_date
            this.submit()
        } else {
            console.log('Clear');
        }
    };

    rangePresets = [
        {
            label: 'Yesterday',
            value: [dayjs().subtract(1, 'd'), dayjs().subtract(1, 'd')],
        },
        {
            label: 'Last 7 Days',
            value: [dayjs().add(-7, 'd'), dayjs()],

        },
        {
            label: 'Last 14 Days',
            value: [dayjs().add(-14, 'd'), dayjs()],
        },
        {
            label: 'Last 30 Days',
            value: [dayjs().add(-30, 'd'), dayjs()],
        },
        // {
        //   label: 'Last 90 Days',
        //   value: [dayjs().add(-90, 'd'), dayjs()],
        // },
        {
            label: 'Month to Date',
            value: [dayjs().startOf('M'), dayjs()],
        },
        {
            label: 'Year to Date',
            value: [dayjs().startOf('y'), dayjs()],
        },
    ];


    handlePageChange = (pageNumber) => {
        this.setState({ currentPage: pageNumber, expandedRow: null });
    };

    // 

    toggleRow = index => {
        this.setState(prevState => ({
            expandedRow: prevState.expandedRow === index ? null : index,
        }));
    };

    handleSearch = e => {
        console.log(e, 'e')
        if (e) {
            this.setState({ searchQuery: e });
        }
    };

    filterLogs = () => {
        const { log_data, searchQuery } = this.state;
        if (!searchQuery) return log_data;

        return log_data.filter(data =>
            Object.values(data).some(value =>
                value.toString().toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    };

    renderValue(key, value) {
        // Handle nested objects or arrays recursively
        if (typeof value === "object" && value !== null) {
            if (Array.isArray(value)) {
                return value.map((item, index) => (
                    <div key={index} style={{ marginLeft: "10px", marginBottom: "5px" }}>
                        {/* Recursively handle nested items */}
                        {this.renderValue(key, item)}
                    </div>
                ));
            } else {
                return Object.keys(value).map((nestedKey, index) => (
                    <div key={index} style={{ marginLeft: "10px", marginBottom: "5px" }}>
                        <strong>{nestedKey}:</strong> {this.renderValue(nestedKey, value[nestedKey])}
                    </div>
                ));
            }
        }

        // Wrap all non-object values in a badge
        return (
            <span
                className={`badge ${typeof value === "boolean" ? (value ? "badge-soft-success" : "badge-soft-danger") : "badge-soft-success"}`}
                style={{ margin: "5px" }}
            >
                {typeof value === "boolean" ? (value ? "True" : "False") : value}
            </span>

        );
    }

    renderDetails = (details) => {
        if (!details) return null;

        const entries = Object.entries(details);

        const renderValue = (key, value) => {
            if (typeof value === "object" && value !== null) {
                if (Array.isArray(value)) {
                    return (
                        <div style={{ marginBottom: 0 }}>
                            {value.map((item, index) => (
                                <div key={index} style={{ marginBottom: "5px" }}>
                                    {renderValue(key, item)}
                                </div>
                            ))}
                        </div>
                    );
                } else {
                    return (
                        <table style={{ border: "1px solid lightgrey", marginTop: "5px", width: "100%" }}>
                            <tbody>
                                {Object.entries(value).map(([nestedKey, nestedValue], index) => (
                                    <tr key={index}>
                                        <td style={{ fontWeight: "bold", padding: "5px", border: "1px solid lightgrey" }}>
                                            {nestedKey}:
                                        </td>
                                        <td style={{ border: "1px solid lightgrey", padding: "5px" }}>
                                            {renderValue(nestedKey, nestedValue)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    );
                }
            }

            return (
                <span style={{ fontSize: '12px', fontWeight: 600 }} className={`badge ${typeof value === "boolean" ? value ? "badge-soft-success" : "badge-soft-danger" : "badge-soft-primary"}`} >
                    {typeof value === "boolean" ? (value ? "True" : "False") : value}
                </span>
            );
        };

        return (
            <Table striped bordered hover responsive style={{ border: "1px solid lightgrey" }} >
                <tbody>
                    {entries.map(([key, value], index) => (
                        <tr key={index}>
                            <td style={{ fontWeight: "bold", border: "1px solid lightgrey" }}>
                                {key === "is_checked" ? "allow_users" : key}
                            </td>
                            <td style={{ border: "1px solid lightgrey" }}>{renderValue(key, value)}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        );
    };
    // 


    error_handler = (error) => {
        sessionStorage.removeItem("authUser");
        this.props.history.push("/login");
    }



    render() {
        const { log_data } = this.state;
        // pagination
        const { expandedRow, currentPage, itemsPerPage } = this.state;   //  searchQuery,

        // Calculate indices for slicing the component list
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = log_data.slice(indexOfFirstItem, indexOfLastItem);

        return (
            <React.Fragment>
                <div className="page-content">
                    <MetaTags>
                        <title>Log Information</title>
                    </MetaTags>
                    <Breadcrumbs
                        title="LOG INFO"
                    />
                    <Container fluid>
                        <Card>
                            <CardBody>
                                <Row>
                                    <Col>
                                        <Row className="mb-2 align-items-center">
                                            {/* <Col sm={3} className="">
                                                <div className="search-box">
                                                    <div className="position-relative">
                                                        <Input
                                                            onChange={(e) => this.handleSearch(e.target.value)}
                                                            id="search-user"
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Search..."
                                                            value={this.state.SearchField}
                                                        />
                                                        <i className="bx bx-search-alt search-icon" />
                                                    </div>
                                                </div>
                                            </Col> */}

                                            <Col className="">
                                                <div className="w-100 ">
                                                    <Row>
                                                        <Col>
                                                            <Select
                                                                value={this.state.selectedOption}
                                                                onChange={(e1) => {
                                                                    this.onSelectComponent(e1.label);
                                                                    this.setState({ selectedOption: e1 }, () => {
                                                                        this.submit();
                                                                    });
                                                                }}
                                                                options={this.state.options}
                                                                // getOptionLabel={option => (option.station_name)}
                                                                style={{ maxWidth: '300px', width: '100%' }}
                                                                menuPortalTarget={document.body} // Render dropdown in a portal
                                                                styles={{
                                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Ensure dropdown is above other elements
                                                                }}
                                                            />
                                                        </Col>
                                                        <Col className="text-end">
                                                            <Space direction="vertical" size={12} >

                                                                <RangePicker
                                                                    presets={[
                                                                        {
                                                                            label: <span aria-label="Current Time to End of Day">Today</span>,
                                                                            value: () => [dayjs(), dayjs().endOf('day')], // 5.8.0+ support function
                                                                        },
                                                                        ...this.rangePresets,
                                                                    ]}
                                                                    defaultValue={[dayjs(), dayjs().endOf('day')]}
                                                                    showTime
                                                                    format="YYYY-MM-DD"
                                                                    onChange={this.onRangeChange}
                                                                    onOk={() => this.submit()}
                                                                />
                                                            </Space>
                                                        </Col>
                                                    </Row>
                                                </div>
                                            </Col>
                                        </Row>
                                        {/* <Row md={12}>
                                            <Col sm={6}>
                                                <Row>
                                                    <Col className="text-center mb-2" style={{ fontWeight: 'bold' }}>Information Type</Col>
                                                </Row>
                                                <Select
                                                    value={this.state.selectedOption}
                                                    // onChange={(e1) => this.onSelectComponent(this.setState({ selectedOption: e1.label }), this.setState({ selectedOption: e1 }))}
                                                    onChange={(e1) => {
                                                        this.onSelectComponent(e1.label);
                                                        this.setState({ selectedOption: e1 }, () => {
                                                            this.submit();
                                                        });
                                                    }}
                                                    options={this.state.options}
                                                />
                                            </Col>
                                            <Col sm={6}>
                                                <Space direction="vertical" size={12}
                                                    style={{
                                                        background: '#74788d',
                                                        padding: '10px',
                                                        borderRadius: '10px',
                                                        color: 'white'
                                                    }}
                                                >
                                                    <Row>
                                                        <Col className="mx-2" style={{ fontWeight: 'bold' }}  >Start Date</Col>
                                                        <Col style={{ fontWeight: 'bold' }} >End Date</Col>
                                                    </Row>
                                                    <RangePicker
                                                        presets={[
                                                            {
                                                                label: <span aria-label="Current Time to End of Day">Today</span>,
                                                                value: () => [dayjs(), dayjs().endOf('day')], // 5.8.0+ support function
                                                            },
                                                            ...this.rangePresets,
                                                        ]}
                                                        defaultValue={[dayjs(), dayjs().endOf('day')]}
                                                        showTime
                                                        format="YYYY-MM-DD"
                                                        onChange={this.onRangeChange}
                                                        onOk={() => this.submit()}
                                                    />
                                                </Space>
                                            </Col>
                                        </Row> */}
                                        <div className="table-responsive mt-4">
                                            <Table
                                                className="table mb-0 align-middle table-nowrap table-check"
                                                bordered
                                            >
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>S. No.</th>
                                                        <th>Date and time</th>
                                                        {/* <th>User Info</th> */}
                                                        <th>Component name</th>
                                                        <th>Component code</th>
                                                        <th>Screen Name</th>
                                                        <th>Actions</th>
                                                        <th>Details</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentItems.map((data, index) => (
                                                        <React.Fragment key={index}>
                                                            <tr onClick={() => this.toggleRow(index)}>
                                                                <td style={{ backgroundColor: expandedRow === index ? "#d6d9f9" : "white", }}>
                                                                    {index + 1 + ((currentPage - 1) * 10)}
                                                                </td>
                                                                <td style={{ backgroundColor: expandedRow === index ? "#d6d9f9" : "white", }}>
                                                                    {new Date(data.date_time).toLocaleString()}
                                                                </td>
                                                                <td style={{ backgroundColor: expandedRow === index ? "#d6d9f9" : "white", }}>
                                                                    {data.comp_name}
                                                                </td>
                                                                <td style={{ backgroundColor: expandedRow === index ? "#d6d9f9" : "white", }}>
                                                                    {data.comp_code}
                                                                </td>
                                                                <td style={{ backgroundColor: expandedRow === index ? "#d6d9f9" : "white", }}>
                                                                    {data.screen_name}
                                                                </td>
                                                                <td style={{ backgroundColor: expandedRow === index ? "#d6d9f9" : "white", }}>
                                                                    {data.action}
                                                                </td>
                                                                <td style={{ backgroundColor: expandedRow === index ? "#d6d9f9" : "white", }}>
                                                                    <Button color={expandedRow === index ? "info" : "primary"} size="sm" className="d-flex align-items-center" >
                                                                        {expandedRow === index ? (
                                                                            <>
                                                                                Hide Info{" "}
                                                                                <i className="bx bx-chevron-up ms-1" style={{ fontSize: "20px" }}></i>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                View Info{" "}
                                                                                <i className="bx bx-chevron-down ms-1" style={{ fontSize: "20px" }}></i>
                                                                            </>
                                                                        )}
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                            {expandedRow === index && (
                                                                <tr>
                                                                    <td
                                                                        colSpan="7"
                                                                        style={{
                                                                            backgroundColor:
                                                                                expandedRow === index
                                                                                    ? "#d6d9f9"
                                                                                    : "white",
                                                                            border: "1px solid lightgrey",
                                                                        }}
                                                                    >
                                                                        {this.renderDetails(data.report_data[0])}
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                </tbody>
                                            </Table>
                                            <PaginationComponent
                                                totalItems={log_data.length}
                                                itemsPerPage={itemsPerPage}
                                                currentPage={currentPage}
                                                onPageChange={this.handlePageChange}
                                            />
                                        </div>

                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
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