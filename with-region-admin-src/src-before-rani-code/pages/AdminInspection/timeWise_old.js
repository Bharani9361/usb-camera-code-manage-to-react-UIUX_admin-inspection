import React, { Component } from "react";
import MetaTags from 'react-meta-tags';
import PropTypes from "prop-types"
import {
    Col,
    Container,
    Row,
    CardTitle,
    Button,
    Table,
    CardText,
    ButtonGroup,
    Card,
    CardBody,
    Modal,
    ModalBody
} from "reactstrap";
import axios from "axios";
import { Link } from "react-router-dom";
import Select from 'react-select';
import { DatePicker } from 'antd';
import moment from 'moment';
// import 'antd/dist/antd.css';
// import CardComp from './Components/CardComp'
import { Image } from 'antd';
import { ImgOverlay } from 'image-overlay-react'
import 'image-overlay-react/dist/index.css'
// import { Modal } from 'antd';
import PaginationComponent from "./PaginationComponent";
import Breadcrumbs from "components/Common/Breadcrumb";

import urlSocket from "../AdminInspection/urlSocket";
// import ImageUrl from "";
import { image_url } from '../AdminInspection/imageUrl';
let ImageUrl = image_url;


const { RangePicker } = DatePicker;


class TimeWiseReport extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showTable2: false,
            tbIndex: 0,
            temp_index: 0,
            filter_comp_name: "",
            filter_comp_code: "",
            config_positive: "",
            config_negative: "",
            config_posble_match: "",
            positive: '',
            negative: '',
            posble_match: '',
            filter_date: "",
            comp_name: "",
            comp_code: "",
            date: "",
            okCount: "",
            notokCount: "",
            totalCount: "",
            posblMatchCount: "",
            no_objCount: "",
            inc_objCount: "",
            station_name: '',
            station_id: '',
            dateWiseData: [],
            timeWise_filterdata: [],
            dataloaded: false,
            showModal: false,
            modal_data: {},
            timeWiseData: [

            ],

            // pagination
            currentPage: 1,
            itemsPerPage: 10,

            selectedFilter: 0,
        }
    }

    componentDidMount() {
        const db_info = JSON.parse(localStorage.getItem('db_info'));
        ImageUrl = `${image_url}${db_info?.db_name}/`;

        var timeWiseData = JSON.parse(sessionStorage.getItem("timeWiseData"))
        var dateWiseData = JSON.parse(sessionStorage.getItem("dateWiseData"))
        console.log('dateWiseData', dateWiseData)
        console.log('comp_name', timeWiseData)
        let ok_Count = timeWiseData.ok
        let notok_Count = timeWiseData.notok
        let total_Count = timeWiseData.total
        let posblMatch_Count = timeWiseData.posbl_match
        let noobj_Count = timeWiseData.no_obj
        let incobj_Count = timeWiseData.incorrect_obj
        let station_id = timeWiseData.station_id
        console.log('station_id78', station_id)
        this.setState({ timeWiseData, station_id, dateWiseData, okCount: ok_Count, notokCount: notok_Count, totalCount: total_Count, posblMatchCount: posblMatch_Count, no_objCount: noobj_Count, inc_objCount: incobj_Count, config_positive: timeWiseData.config_positive, config_negative: timeWiseData.config_negative, config_posble_match: timeWiseData.config_posble_match })
        this.labelData(timeWiseData)
        this.compListAPICall(timeWiseData)
    }


    compListAPICall = (timeWiseData) => {
        //filter_comp_code = this.state.filter_comp_code
        console.log('timeWiseData', timeWiseData)
        let filter_comp_name = timeWiseData.comp_name
        console.log('filter_comp_name', filter_comp_name)
        let filter_comp_code = timeWiseData.comp_code
        let filter_date = timeWiseData.date
        let station_id = timeWiseData.station_id
        try {
            urlSocket.post('/tWise_filterData', { 'comp_name': filter_comp_name, 'comp_code': filter_comp_code, 'date': filter_date, 'station_id': station_id },
                { mode: 'no-cors' })
                .then((response) => {
                    let timeWise_filterdata = response.data
                    if (timeWise_filterdata.error === "Tenant not found") {
                        console.log("data error", data.error);
                        this.error_handler(data.error);
                    }
                    else {
                        console.log("timeWise_filterdata95", timeWise_filterdata)
                        let comp_name = timeWise_filterdata[0].comp_name
                        let comp_code = timeWise_filterdata[0].comp_code
                        let Date = timeWise_filterdata[0].date
                        let result = timeWise_filterdata[0].result
                        let station_name = timeWise_filterdata[0].station_name
                        let station_id = timeWise_filterdata[0].station_id
                        console.log('Result', result)
                        console.log('CompNam...', comp_name)
                        this.setState({ timeWise_filterdata, comp_name, comp_code, date: Date, result, station_name, station_id, dataloaded: true })
                    }

                })
                .catch((error) => {

                    console.log(error)
                })
        } catch (error) {

        }
    }
    labelData = (timeWiseData) => {
        console.log('timeWiseData113', timeWiseData)
        try {
            urlSocket.post('/comp_Data', { 'comp_name': timeWiseData.comp_name, 'comp_code': timeWiseData.comp_code },
                { mode: 'no-cors' })
                .then((response) => {
                    let timeWise_filterdata = response.data
                    if (timeWise_filterdata.error === "Tenant not found") {
                        console.log("data error", data.error);
                        this.error_handler(data.error);
                    }
                    else {
                        console.log("Comp_data", timeWise_filterdata)
                        this.setState({ positive: response.data[0].positive, negative: response.data[0].negative, posble_match: response.data[0].posble_match, dataloaded: true })
                    }

                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {

        }
    }

    status_filter = (status, filterValue) => {
        this.setState({ selectedFilter: filterValue })

        let comp_name = this.state.comp_name
        let comp_code = this.state.comp_code
        let date = this.state.date
        let result = status

        let station_id = this.state.station_id
        console.log('139', station_id)
        if (station_id === undefined) {
            station_id = ''
        }
        try {
            urlSocket.post('/label_filterData', { 'comp_name': comp_name, 'comp_code': comp_code, 'date': date, 'result': result, 'station_id': station_id },
                { mode: 'no-cors' })
                .then((response) => {
                    let filtered_data = response.data
                    if (filtered_data.error === "Tenant not found") {
                        console.log("data error", data.error);
                        this.error_handler(data.error);
                    }
                    else {
                        console.log("152", filtered_data)
                        // let comp_name = timeWise_filterdata[0].comp_name
                        // let comp_code = timeWise_filterdata[0].comp_code
                        // let Date = timeWise_filterdata[0].date
                        // console.log('CompNam...', comp_name)
                        this.setState({ timeWise_filterdata: filtered_data })
                    }

                })
                .catch((error) => {

                    console.log(error)
                })
        } catch (error) {

        }
    }

    backButton = () => {
        let data = {
            startDate: this.state.dateWiseData.startDate,
            endDate: this.state.dateWiseData.endDate,
            comp_name: this.state.dateWiseData.comp_name,
            comp_code: this.state.dateWiseData.comp_code
        }
        console.log('data', data)
        sessionStorage.removeItem("dateWiseData")
        sessionStorage.setItem("dateWiseData", JSON.stringify(data));

        this.props.history.push('/station_report');
    }



    getImage = (data1) => {
        console.log('data1', data1)
        if (data1 !== undefined) {
            console.log('data1', data1)
            let baseurl = ImageUrl
            let replace = data1.replaceAll("\\", "/");
            let result = replace
            console.log('result', result)
            let output = baseurl + result
            return output
        }
        else {
            return null
        }
    }

    onGotoNxtImg = () => {
        try {
            let index = this.state.temp_index + 1
            let allData = this.state.timeWise_filterdata
            console.log(index, allData)
            let selectedData = allData[index]


            let image_src = this.getImage(selectedData.captured_image)

            this.setState({ modal_data: selectedData, image_src, temp_index: index })
        } catch (error) {

        }
    }

    onGotoPrevImg = () => {
        try {
            let index = this.state.temp_index - 1
            let allData = this.state.timeWise_filterdata
            console.log(index, allData)
            let selectedData = allData[index]


            let image_src = this.getImage(selectedData.captured_image)

            this.setState({ modal_data: selectedData, image_src, temp_index: index })
        } catch (error) {

        }
    }

    handlePageChange = (pageNumber) => {
        this.setState({ currentPage: pageNumber });
    };

    error_handler = (error) => {
        sessionStorage.removeItem("authUser");
        this.props.history.push("/login");
    }

    render() {
        const { timeWise_filterdata } = this.state;

        // pagination
        const { currentPage, itemsPerPage } = this.state;   // expandedRow, searchQuery,

        // Calculate indices for slicing the component list
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentItems = timeWise_filterdata.slice(indexOfFirstItem, indexOfLastItem);

        if (this.state.dataloaded) {
            return (
                <React.Fragment>
                    <div className="page-content">
                        <MetaTags>
                            <title>Inspection Result Details</title>
                        </MetaTags>
                        <Breadcrumbs
                            title="TIMEWISE REPORT"
                            isBackButtonEnable={true}
                            gotoBack={this.backButton}
                        />
                        <Container fluid>
                            <Card>
                                <CardBody>
                                    <Row className="d-flex flex-wrap justify-content-center justify-content-lg-between align-items-center gap-2 mb-2">
                                        <Col xs="12" lg="auto" className="text-left">
                                            <CardTitle className="mb-0 "><span className="me-2 font-size-12">Component Name :</span>{this.state.comp_name}</CardTitle>
                                            <CardText className="mb-0"><span className="me-2 font-size-12">Component Code :</span>{this.state.comp_code}</CardText>
                                            <CardText className="mb-0"><span className="me-2 font-size-12">Date:</span>{this.state.date}</CardText>
                                        </Col>
                                        <Col xs="12" lg="auto" className="text-center">
                                            <ButtonGroup>
                                                <Button className='btn btn-sm w-md text-center' color="primary"
                                                    outline={this.state.selectedFilter !== 0}
                                                    onClick={() => { this.status_filter("", 0) }}
                                                >
                                                    Total {"("} {this.state.okCount + this.state.notokCount + this.state.posblMatchCount + this.state.no_objCount + this.state.inc_objCount} {")"}
                                                </Button>
                                                <Button className='btn btn-sm w-md text-center' color="primary"
                                                    outline={this.state.selectedFilter !== 1}
                                                    onClick={() => { this.status_filter(this.state.positive, 1) }}
                                                >
                                                    {this.state.config_positive} {"("} {this.state.okCount} {")"}
                                                </Button>
                                                <Button className='btn btn-sm w-md text-center' color="primary"
                                                    outline={this.state.selectedFilter !== 2}
                                                    onClick={() => { this.status_filter(this.state.negative, 2) }}
                                                >
                                                    {this.state.config_negative} {"("} {this.state.notokCount} {")"}
                                                </Button>
                                                <Button className='btn btn-sm w-md text-center' color="primary"
                                                    outline={this.state.selectedFilter !== 3}
                                                    onClick={() => { this.status_filter("No Object Found", 3) }}
                                                >
                                                    No object found {"("} {this.state.no_objCount} {")"}
                                                </Button>
                                                <Button className='btn btn-sm w-md text-center' color="primary"
                                                    outline={this.state.selectedFilter !== 4}
                                                    onClick={() => { this.status_filter("Incorrect Object", 4) }}
                                                >
                                                    Incorrect Object {"("} {this.state.inc_objCount} {")"}
                                                </Button>
                                            </ButtonGroup>
                                        </Col>
                                    </Row>
                                    {
                                        this.state.timeWise_filterdata.length === 0 ?
                                            <div className="container" style={{ position: 'relative', height: '20vh' }}>
                                                <div className="text-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} >
                                                    <h5 className="text-secondary">No Records Found</h5>
                                                </div>
                                            </div>
                                            :
                                            <div className="table-responsive">
                                                <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
                                                    <thead className="table-light">
                                                        <tr>
                                                            <th>S. No.</th>
                                                            <th>Time</th>
                                                            <th>Station Name</th>
                                                            <th>Result</th>
                                                            <th>Captured Image</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            currentItems.map((data, index) => (

                                                                <tr key={index}>
                                                                    <td className="bg-white">
                                                                        {index + 1 + ((currentPage - 1) * 10)}
                                                                    </td>
                                                                    <td className="bg-white">{data.inspected_ontime}</td>
                                                                    <td className="bg-white">{data.station_name}</td>
                                                                    <td className="bg-white">{data.result}</td>
                                                                    <td className="bg-white">
                                                                        <img
                                                                            onClick={() => this.setState({ showModal: true, modal_data: data, temp_index: (index + ((currentPage - 1) * 10)), image_src: this.getImage(data.captured_image) })}
                                                                            style={{ width: 'auto', height: 100 }}
                                                                            src={this.getImage(data.captured_image)}
                                                                        />
                                                                        {/* <Row>
                                                            <ImgOverlay
                                                                imgSrc={this.getImage(data.captured_image)}
                                                                bgColor='pink'
                                                                position='right'
                                                                width={100}                                                               
                                                            >
                                                                Component Name: {this.state.comp_name}
                                                            </ImgOverlay>
                                                        </Row> */}
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        }
                                                    </tbody>
                                                </Table>
                                                <PaginationComponent
                                                    totalItems={timeWise_filterdata.length}
                                                    itemsPerPage={itemsPerPage}
                                                    currentPage={currentPage}
                                                    onPageChange={this.handlePageChange}
                                                />
                                            </div>
                                    }
                                </CardBody>
                            </Card>
                        </Container>

                        <Modal
                            title="Image"
                            centered
                            isOpen={this.state.showModal}
                            toggle={() => this.setState({ showModal: false })}
                            size="lg" // Adjusts modal size
                        >
                            <div className="modal-header">
                                <h5>Image</h5>
                                <Button
                                    onClick={() =>
                                        this.setState({ showModal: false })
                                    }
                                    type="button"
                                    className="close mt-1"
                                    data-dismiss="modal"
                                    aria-label="Close"
                                >
                                    <span aria-hidden="true">&times;</span>
                                </Button>
                            </div>
                            <ModalBody>
                                <div className="text-center">
                                    <img src={this.state.image_src} alt="Component" className="img-fluid" style={{ maxWidth: "100%", height: "auto" }} />
                                </div>

                                <Row className="mt-3">
                                    <Col md={6} className="text-start">
                                        Component Name: <b>{this.state.comp_name}</b>
                                    </Col>
                                    <Col md={6} className="text-end">
                                        Result:
                                        <span style={{
                                            color: this.state.modal_data.result === "No Object Found" || this.state.modal_data.result === "notok"
                                                ? "red"
                                                : this.state.modal_data.result === "Possible Match"
                                                    ? "orange"
                                                    : "green"
                                        }}>
                                            {this.state.modal_data.result}
                                        </span>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6} className="text-start">Component Code: <b>{this.state.comp_code}</b></Col>
                                    <Col md={6} className="text-end">
                                        Date: <b>{this.state.modal_data.date}{" "}</b>
                                        Time: <b>{this.state.modal_data.inspected_ontime}</b>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6} className="text-start">
                                        {
                                            this.state.temp_index !== 0 && <Button color="primary" onClick={() => this.onGotoPrevImg()} >Previous</Button>
                                        }
                                    </Col>
                                    <Col md={6} className="text-end">
                                        {
                                            this.state.timeWise_filterdata.length !== this.state.temp_index + 1 &&
                                            <Button color="primary" onClick={() => this.onGotoNxtImg()} >Next
                                                {/* {this.state.timeWise_filterdata.length}, {this.state.temp_index} */}
                                            </Button>
                                        }
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12} className="text-center">
                                        ( {this.state.temp_index + 1} / {this.state.timeWise_filterdata.length})
                                    </Col>
                                </Row>

                            </ModalBody>
                        </Modal>
                    </div>
                </React.Fragment>
            );
        }
        else {
            return null
        }
    }
}
TimeWiseReport.propTypes = {
    history: PropTypes.any.isRequired,
};
export default TimeWiseReport;