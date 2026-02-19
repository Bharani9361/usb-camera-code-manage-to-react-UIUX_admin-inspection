import React, { Component } from "react";
import MetaTags from 'react-meta-tags';
import PropTypes from "prop-types"
import {
    Col,
    Container,
    Row,
    CardTitle,
    Button,
    Table
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
import { Modal } from 'antd';
import urlSocket from "../AdminInspection/urlSocket";
import ImageUrl from "../AdminInspection/imageUrl";

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
            config_positive:"",
            config_negative:"",
            config_posble_match:"",
            positive:'',
            negative:'',
            posble_match:'',
            filter_date: "",
            comp_name: "",
            comp_code: "",
            date: "",
            okCount: "",
            notokCount: "",
            totalCount: "",
            posblMatchCount: "",
            no_objCount: "",
            station_name:'',
            station_id:'',
            dateWiseData: [],
            timeWise_filterdata: [],
            dataloaded: false,
            showModal: false,
            modal_data: {},
            timeWiseData: [

            ],

        }
    }

    componentDidMount() {
        var timeWiseData = JSON.parse(sessionStorage.getItem("timeWiseData"))
        var dateWiseData = JSON.parse(sessionStorage.getItem("dateWiseData"))
        console.log('dateWiseData', dateWiseData)
        console.log('comp_name', timeWiseData)
        let ok_Count = timeWiseData.ok
        let notok_Count = timeWiseData.notok
        let total_Count = timeWiseData.total
        let posblMatch_Count = timeWiseData.posbl_match
        let noobj_Count = timeWiseData.no_obj
        let station_id =timeWiseData.station_id
        console.log('station_id78', station_id)
        this.setState({ timeWiseData, station_id, dateWiseData, okCount: ok_Count, notokCount: notok_Count, totalCount: total_Count, posblMatchCount: posblMatch_Count, no_objCount: noobj_Count, config_positive:timeWiseData.config_positive, config_negative:timeWiseData.config_negative, config_posble_match:timeWiseData.config_posble_match })
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
            urlSocket.post('/tWise_filterData', { 'comp_name': filter_comp_name, 'comp_code': filter_comp_code, 'date': filter_date, 'station_id':station_id },
                { mode: 'no-cors' })
                .then((response) => {
                    let timeWise_filterdata = response.data
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
                    console.log("Comp_data", timeWise_filterdata)
                    this.setState({ positive:response.data[0].positive, negative: response.data[0].negative, posble_match:response.data[0].posble_match, dataloaded:true })
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {

        }
    }

    status_filter = (status) => {
        console.log('first131', status)
        let comp_name = this.state.comp_name
        let comp_code = this.state.comp_code
        let date = this.state.date
        let result = status
        console.log('result141', result)
        let station_id = this.state.station_id
        console.log('139', station_id)
        if(station_id === undefined){
            station_id = ''
        }
        try {
            urlSocket.post('/label_filterData', { 'comp_name': comp_name, 'comp_code': comp_code, 'date': date, 'result': result, 'station_id':station_id },
                { mode: 'no-cors' })
                .then((response) => {
                    let filtered_data = response.data
                    console.log("152", filtered_data)
                    // let comp_name = timeWise_filterdata[0].comp_name
                    // let comp_code = timeWise_filterdata[0].comp_code
                    // let Date = timeWise_filterdata[0].date
                    // console.log('CompNam...', comp_name)
                    this.setState({ timeWise_filterdata: filtered_data })
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
        sessionStorage.setItem("dateWiseData", JSON.stringify(data))

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
                            <Row>
                                <Col>
                                    <Link to="/station_report"><Button onClick={() => this.backButton()}>Back</Button></Link>
                                </Col>
                            </Row>
                            <Row className="p-2">
                                <Col lg={12}>
                                    <CardTitle className="text-center">View Info</CardTitle>
                                </Col>
                                <Col>
                                    <label>Component Name: {this.state.comp_name}</label>
                                    <Row><label>Component Code: {this.state.comp_code}</label></Row>
                                    <Row><label>Date: {this.state.date}</label></Row>
                                </Col>
                                <Row>
                                    <Col>
                                        <Button color="primary" className="w-md m-1" onClick={() => { this.status_filter("") }}> Total {"("} {this.state.okCount + this.state.notokCount + this.state.posblMatchCount + this.state.no_objCount} {")"}</Button>
                                    </Col>
                                    <Col>
                                        <Button color="primary" className="w-md m-1" onClick={() => { this.status_filter(this.state.positive) }}> {this.state.config_positive} {"("} {this.state.okCount} {")"}</Button>
                                    </Col>
                                    <Col>
                                        <Button color="primary" className="w-md m-1" onClick={() => { this.status_filter(this.state.negative) }}> {this.state.config_negative} {"("} {this.state.notokCount} {")"}</Button>
                                    </Col>
                                    <Col>
                                        <Button color="primary" className="w-md m-1" onClick={() => { this.status_filter(this.state.posble_match) }}> {this.state.config_posble_match} {"("} {this.state.posblMatchCount} {")"}</Button>
                                    </Col>
                                    <Col>
                                        <Button color="primary" className="w-md m-1" onClick={() => { this.status_filter("No Objects Detected") }}> No object found {"("} {this.state.no_objCount} {")"}</Button>
                                    </Col>
                                </Row>

                            </Row>
                            {
                                console.log('first...', this.state.timeWise_filterdata)
                            }

                            <div className="table-responsive">

                                <Table striped>
                                    <thead>
                                        <tr>
                                            <th>Time</th>
                                            <th>Station Name</th>
                                            <th>Result</th>
                                            <th>Captured Image</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.timeWise_filterdata.map((data, index) => (

                                                <tr key={index}>
                                                    <td>{data.inspected_ontime}</td>
                                                    <td>{data.station_name}</td>
                                                    <td>{data.result}</td>
                                                    <td>
                                                        <img
                                                            onClick={() => this.setState({ showModal: true, modal_data: data, temp_index: index, image_src: this.getImage(data.captured_image) })}
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
                            </div>
                            <Modal title="Image" centered visible={this.state.showModal} onOk={() => this.setState({ showModal: false })} onCancel={() => this.setState({ showModal: false })} width={1000}                                                        >
                                <div className="text-center">
                                    <img src={this.state.image_src} />
                                </div>
                                <Row>
                                    <br />
                                    <div>
                                        <Row>
                                            <Col md={6} className="text-start">
                                                Component Name: <b>{this.state.comp_name}</b>
                                            </Col>
                                            <Col md={6} className="text-end">
                                                Result:
                                                <span style={{ color: (this.state.modal_data.result === ("No Objects Detected") || this.state.modal_data.result === "notok") ? "red" : "green" && (this.state.modal_data.result === "Possible Match") ? "orange" : "green" }}>
                                                    {this.state.modal_data.result}
                                                </span>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={6} className="text-start">Component Code: <b>{this.state.comp_code}</b> </Col>
                                            <Col md={6} className="text-end">Date: <b>{this.state.modal_data.date}  {" "} </b> {""}Time: <b>{this.state.modal_data.inspected_ontime}</b>
                                            </Col>
                                        </Row>
                                    </div>
                                </Row>
                                <Row>
                                    <Col md={6} className="text-start">
                                        {
                                            this.state.temp_index !== 0 && <Button onClick={() => this.onGotoPrevImg()} >Previous</Button>
                                        }
                                    </Col>
                                    <Col md={6} className="text-end">
                                        {
                                            this.state.timeWise_filterdata.length !== this.state.temp_index+1 && 
                                             <Button onClick={() => this.onGotoNxtImg()} >Next 
                                             {/* {this.state.timeWise_filterdata.length}, {this.state.temp_index} */}
                                             </Button>
                                        }
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={12} className="text-center">
                                         ( {this.state.temp_index +1} / {this.state.timeWise_filterdata.length})
                                    </Col>
                                </Row>
                            </Modal>

                            {
                                this.state.timeWise_filterdata.length === 0 ?

                                    <div className="text-center mt-2">
                                        <h3>
                                            No Records found
                                        </h3>

                                    </div> : null
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
TimeWiseReport.propTypes = {
    history: PropTypes.any.isRequired,
};
export default TimeWiseReport;