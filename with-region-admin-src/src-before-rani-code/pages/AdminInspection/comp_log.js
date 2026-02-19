import React, { Component } from "react";
import MetaTags from 'react-meta-tags';
import { Card, Col, Container, Row, CardBody, CardTitle, Label, Button, Form, Input, Table, } from "reactstrap";
import axios from "axios";
import Webcam from "react-webcam";
import { JsonTable } from 'react-json-to-html';
// import 'antd/dist/antd.css';
import PropTypes from "prop-types"
import urlSocket from './urlSocket'
import PaginationComponent from "./PaginationComponent";
import Breadcrumbs from "components/Common/Breadcrumb";


class CompLog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            component_code: "",
            component_name: "",
            loading: false,
            tab: 0,
            count: 1,
            log_data: [],

            // pagination
            currentPage: 1,
            itemsPerPage: 10,

            expandedRow: null,
        }
    }
    componentDidMount = () => {

        var compData = JSON.parse(sessionStorage.getItem("compData"))

        console.log('compData', compData)
        //console.log('configuration', compData.config_data)
        // console.log('ok', compData.config_data[0].min_ok_for_training)
        // console.log('notok', compData.config_data[0].min_notok_for_training)
        this.compLog(compData)
    };

    compLog = async (compData) => {
        let comp_code1 = compData.component_code
        let comp_name1 = compData.component_name

        try {
            urlSocket.post('/api/components/complog_info', { 'comp_name': comp_name1, 'comp_code': comp_code1 },
                // axios.post('https://172.16.1.91:5000/update_config', { '_id': id, 'min_notok_for_training': notok, "min_ok_for_training": ok, 'inspection_type': selectManual_Auto },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    if (data.error === "Tenant not found") {
                        console.log("data error", data.error);
                        this.error_handler(data.error);
                    }
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
    // bala changed on 29-09-23
    back = () => {
        this.props.history.push("/comp_info")
    }

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
        this.setState({ searchQuery: e.target.value });
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
                        <table striped bordered hover responsive style={{ border: "1px solid lightgrey", marginTop: "5px", width: "100%" }}>
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
        const { log_data, expandedRow } = this.state;
        // pagination
        const { currentPage, itemsPerPage } = this.state;   // expandedRow, searchQuery,

        // Calculate indices for slicing the component list
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = log_data.slice(indexOfFirstItem, indexOfLastItem);

        return (
            <React.Fragment>
                <div className="page-content">
                    <MetaTags>
                        <title>Form Layouts | Skote - React Admin & Dashboard Template</title>
                    </MetaTags>
                    <Breadcrumbs
                        title="COMPONENT LOG INFO"
                        isBackButtonEnable={true}
                        gotoBack={this.back}
                    />
                    <Container fluid>
                        <Card>
                            <CardBody>
                                <Row>
                                    <Col>

                                        <div className="table-responsive">
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
                                                        <th>Activity</th>
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
                                    </Col></Row>
                            </CardBody>
                        </Card>
                    </Container>
                </div>
            </React.Fragment>
        );
    }
}
CompLog.propTypes = {
    history: PropTypes.any.isRequired,
};

export default CompLog;
