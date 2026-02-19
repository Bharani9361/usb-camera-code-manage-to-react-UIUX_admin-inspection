import React, { Component } from "react";
import MetaTags from 'react-meta-tags';
import { Card, Col, Container, Row, CardBody, CardTitle, Label, Button, Form, Input,  Table, } from "reactstrap";
import axios from "axios";
import Webcam from "react-webcam";
import {JsonTable} from 'react-json-to-html';

// commented this due to ant design version upgrade from 4.x to 5.8.4
// import 'antd/dist/antd.css';

import PropTypes from "prop-types"
import urlSocket from './urlSocket';
import ImageUrl from "./imageUrl";


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
           
        }
    }
    componentDidMount = () => {

        var compData = JSON.parse(sessionStorage.getItem("compData"))

        console.log('compData28', compData)
        //console.log('configuration', compData.config_data)
       // console.log('ok', compData.config_data[0].min_ok_for_training)
       // console.log('notok', compData.config_data[0].min_notok_for_training)
        this.compLog(compData)      
    };

    compLog = async(compData) => {
        let comp_code1 = compData.component_code
        let comp_name1 = compData.component_name 
        let comp_id = compData._id
        let station_id = compData.station_id
       
        try {
            urlSocket.post('/complog_liveInspect_info', { 'comp_id': comp_id , 'station_id':station_id},
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
                        <title>Visual Inspection</title>
                    </MetaTags>
                    <Container fluid={true} style={{ minHeight: '100vh', background: 'white' }}>
                        {/* <Breadcrumbs title="Forms" breadcrumbItem="Form Layouts" /> */}
                        <Row className="p-2">
                            <Col lg={12}>
                                <CardTitle className="text-center">LogInfo</CardTitle>
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
                        {
                                this.state.log_data.length === 0 ?
                                    <div className="text-center">
                                        <h3>No Records found </h3>
                                    </div> : null
                            }
                    </Container>
                    {/* container-fluid */}
                </div>
            </React.Fragment>
        );
    }
}
CompLog.propTypes = {
    history: PropTypes.any.isRequired,
};

export default CompLog;
