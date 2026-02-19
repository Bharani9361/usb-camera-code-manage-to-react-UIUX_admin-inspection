import React, { Component } from "react";
import MetaTags from 'react-meta-tags';
import { Card, Col, Container, Row, CardBody, CardTitle, Label, Button, Form, Input, Modal, Table } from "reactstrap";
//Import Breadcrumb
import Breadcrumbs from "../../components/Common/Breadcrumb";

import { Link } from 'react-router-dom'
import axios from "axios";

// import CardComp from './Components/CardComp'
class ComponentAdd extends Component {

    constructor(props) {
        super(props);
        this.state = {
            component_name: "",
            component_code: "",
            addCompModal: false,
            componentList: [

            ]
        }
    }

    componentDidMount() {
        this.compListAPICall()
    }

    compListAPICall = () => {
        try {
            axios.post('http://127.0.0.1:5000/comp_list',
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log(data)
                    this.setState({ componentList: data })
                })
                .catch((error) => {

                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)

        }
    }

    submitForm = () => {
        console.log(this.state.component_name, this.state.component_code)
        let compData = {
            component_name: this.state.component_name,
            component_code: this.state.component_code,
        }
        sessionStorage.removeItem("compData")
        sessionStorage.setItem("compData", JSON.stringify(compData))

        let component_name = this.state.component_name
        console.log("component_name", component_name)
        let component_code = this.state.component_code

        try {
            axios.post('http://127.0.0.1:5000/add_comp', { 'CompName': component_name, 'comp_code': component_code },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log(data)  
                    if(data ==="created")
                    { 
                        this.navigateto();
                }
                    else
                    alert("Already created")             

                })
                .catch((error) => {

                    console.log(error)
                })
        } catch (error) {

        }

    }

    navigateto = () =>
    {
        //this.props.history.push("/camera")   
    }

    editComp = (data) => {
        console.log(`daddasdasta`, data)
        let { CompName, comp_code, _id } = data
        let datas = {
            component_name: CompName,
            component_code: comp_code,
            Datasets: data.Datasets,
            _id
        }
        console.log(`datas`, datas)
        sessionStorage.removeItem("compData")
        sessionStorage.setItem("compData", JSON.stringify(datas))

        this.setState({ component_code: comp_code, component_name: CompName, _id })

    }

    getImage = (data1) => {
        if (data1 === undefined){
            return ""
        }
        console.log('data1', data1)
        let baseurl = 'http://127.0.0.1:8000/'
        let result = data1[0].Image_path
        let output = baseurl + result
        return output

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
                            <Col lg={6}>
                                <CardTitle className="text-center">Component Details</CardTitle>
                            </Col>
                            <Col lg={6} className="text-end">
                                <Button onClick={() => this.setState({ addCompModal: true })}>ADD COMPONENTS</Button>
                            </Col>
                        </Row>

                        {/* <Row>
                            <Col md={12}>
                                {
                                    this.state.componentList.map((data, index) => (
                                        <Row className="text-center" key={index}>
                                            <Col>{data.name}</Col>
                                            <Col>{data.code}</Col>
                                            <Col>{data.status}</Col>
                                            <Col>Edit</Col>
                                            <Col>Inactive</Col>

                                        </Row>
                                    ))
                                }
                            </Col>
                        </Row> */}
                        {/* {
                            this.state.componentList.map((data, index) => (
                                <CardComp key={index} data={data}   />
                            ))
                        } */}
                        <div className="table-responsive">

                            <Table striped>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        {/* <th>Images</th> */}
                                        <th>Code</th>
                                        {/* <th>id</th> */}
                                        <th>Status</th>
                                        <th>Actions</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.componentList.map((data, index) => (
                                            <tr key={index}>
                                                <td>{data.CompName}</td>
                                                <td>
                                                    <Row>
                                                        {
                                                            this.getImage(data.Datasets) !=="" && <img src={this.getImage(data.Datasets)} style={{ width: 100, height: 'auto' }} />
                                                        }
                                                    </Row>
                                                </td>
                                                <td>{data.comp_code}</td>
                                                {/* <td>{data._id}</td> */}
                                                <td>{data.status}</td>
                                                <td> 
                                                    {/* <Link to="training"> */}
                                                    <Button onClick={() => this.editComp(data)}>Edit</Button>
                                                    {/* </Link> */}
                                                    </td>
                                                <td><Button>Inactive</Button></td>
                                                <td><Button>Publish</Button></td>
                                                <td><Button>Report</Button></td>

                                            </tr>
                                        ))
                                    }

                                </tbody>
                            </Table>
                        </div>
                        <Modal
                            isOpen={this.state.addCompModal}
                        // toggle={this.tog_standard}
                        >
                            <div className="modal-header">
                                <h5 className="modal-title mt-0" id="myModalLabel">
                                    Enter Component Details
                                </h5>
                                <button
                                    type="button"
                                    onClick={() =>
                                        this.setState({ addCompModal: false })
                                    }
                                    className="close"
                                    data-dismiss="modal"
                                    aria-label="Close"
                                >
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <Form>
                                    <div className="row mb-4">

                                        <Col sm={12}>
                                            <Label>Component name</Label>
                                            <Input
                                                type="text"
                                                className="form-control"
                                                id="horizontal-compname-Input"
                                                placeholder="Enter Your"
                                                value={this.state.component_name}
                                                onChange={(e) => this.setState({ component_name: e.target.value })}
                                            />
                                            {/* { this.state.component_name } */}
                                        </Col>
                                    </div>
                                    <div className="row mb-4">

                                        <Col sm={12}>
                                            <Label>Component code</Label>
                                            <Input
                                                type="text"
                                                className="form-control"
                                                id="horizontal-comp_code-Input"
                                                placeholder="Enter Your"
                                                value={this.state.component_code}
                                                onChange={(e) => this.setState({ component_code: e.target.value })}
                                            />
                                        </Col>
                                    </div>


                                    <div className="row justify-content-end">
                                        <Col sm={9}>
                                            <div className="text-end">
                                               
                                                {/* <Link to="Camera"> */}
                                                    <Button
                                                        //type="submit"
                                                        color="primary"
                                                        className="w-md"
                                                        onClick={() => this.submitForm()}
                                                    >
                                                        ADD
                                                    </Button>
                                                {/* </Link> */}
                                                
                                            </div>
                                        </Col>
                                    </div>
                                </Form>
                            </div>
                            {/* <div className="modal-footer">
                                <button
                                    type="button"
                                    onClick={() => { this.setState({ addCompModal: false }) }}
                                    className="btn btn-secondary"
                                    data-dismiss="modal"
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                >
                                    Save changes
                                </button>
                            </div> */}
                        </Modal>
                    </Container>
                    {/* container-fluid */}
                </div>
            </React.Fragment>
        );
    }
}

export default ComponentAdd;