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
import Inspection from "./testing";


let component_code1 = ""
let component_name1 = ""
// import CardComp from './Components/CardComp'
class InspectionReport extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataloaded: false,
            component_name: "",
            component_code: "",
            addCompModal: false,
            componentList: [

            ]
        }
    }

    componentDidMount() {
        var compData = JSON.parse(sessionStorage.getItem("compData"))

        console.log('compData', compData)

        component_code1 = compData.component_code
        component_name1 = compData.component_name
    }
    

    render() {
        if (this.state.dataloaded) {
        console.log('component', compData.component_name)

            return (
                <React.Fragment>
                    <div className="page-content">
                        <MetaTags>
                            <title>Form Layouts | Skote - React Admin & Dashboard Template</title>
                        </MetaTags>
                        <Container fluid={true} style={{ minHeight: '100vh', background: 'white' }}>
                            {/* <Breadcrumbs title="Forms" breadcrumbItem="Form Layouts" /> */}
                            <Row className="p-2">
                                <Col lg={6}>
                                    <CardTitle className="text-center">Inspection Result Details</CardTitle>
                                </Col>
                                
                            </Row>
                            
                            <div className="table-responsive">

                                <Table striped>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Code</th>
                                            {/* <th>Images</th> */}
                                            {/* <th>id</th> */}
                                            {/* <th>Status</th>
                                            <th>Actions</th> */}

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.compData.map((data, index) => (
                                                <tr key={index}>
                                                    <td>{data.comp_name}</td>
                                                    <td>{data.comp_code}</td>
                                                    {/* <td>
                                                        <Row>
                                                            {
                                                                <img src={this.getImage(data.datasets)} style={{ width: 100, height: 'auto' }} />
                                                            }
                                                        </Row>
                                                    </td> */}
                                                    {/* <td>{data._id}</td> */}
                                                    {/* <td>{data.status}</td>
                                                    <td> <Link to="/training"><Button onClick={() => this.editComp(data)}>Edit</Button></Link></td>
                                                    <td><Button>Inactive</Button></td>
                                                    <td><Button>Publish</Button></td>
                                                    <td><Link to="/inspectResult"><Button onClick={() => this.editComp(data)}>InspectionReport</Button></Link></td>       */}
                                                </tr>
                                            ))
                                        }

                                    </tbody>
                                </Table>
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

export default InspectionReport;