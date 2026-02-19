import React, { Component } from "react";
import MetaTags from 'react-meta-tags';
import PropTypes from "prop-types"
import { Col, Container, Row, CardTitle, Label, Button, Form, Input, Modal, Table } from "reactstrap";
import axios from "axios";
import { Link } from "react-router-dom";
import { Progress, } from "reactstrap"
import { EditOutlined } from '@ant-design/icons';


// import CardComp from './Components/CardComp'
class CRUDComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataloaded: false,
            component_name: "",
            component_code: "",
            is_active: "",
            showacitve_inactive: false,
            addCompModal: false,
            selectedFilter: null,
            selectFilter: null,
            config_data: [],
            msg: "",
            training_status: [],
            progressList: [],
            train_status_all: "ALL",
            train_status_traincompleted: "training completed",
            train_status_train_progress: "training_in_progress",
            train_status_notstarted: "training_not_started",
            componentList: [

            ]
        }
    }

    componentDidMount() {
        //this.compListAPICall()
        // this.state.selectFilter !==0
        //this.setState({selectFilter:0})        
        // this.active_inactive(true) // changes for 28.04.2022
        // this.setState({ selectedFilter: 1 })// changes for 28.04.2022

        try {
            axios.post('https://172.16.1.91:5000/config',
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('config_data', data)
                    this.setState({ config_data: data })
                })
                .catch((error) => {

                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)

        }
        this.training_fields(this.state.train_status_all, 0)

    }

    compListAPICall = () => {
        try {
            axios.post('https://172.16.1.91:5000/comp_list',
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data

                    //console.log('is_active', data)
                    if (data.length === 0 || data === null || data === undefined) {
                        this.setState({ componentList: [], dataloaded: true })

                    } else {

                        //console.log(`object`, data[0].comp_code)
                        this.setState({ componentList: data, dataloaded: true })
                    }

                })
                .catch((error) => {

                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)

        }
    }

    navigateto = () => {
        const { history } = this.props
        console.log(this.props)
        setTimeout(() => {
            history.push("/crudcomponent")
        }, 5000);
        // history.push("/crudcomponent")
    }

    contApicall = (d) => {
        console.log('first', d)
        setInterval(() => {
            if (d === 2) {
                training_fields = ('training_in_progress', 2)
                //this.gettraining_status("training_in_progress")
            }
        }, 1000)

    }

    gettraining_status = (d1) => {
        console.log('d1', d1)

        // const formData = new FormData();
        // formData.append('comp_name', d2);
        // formData.append('comp_code', d1);
        axios.post('https://172.16.1.91:5000/training_status', { 'progress_status': d1 }, {
            // headers: {
            //     'content-type': 'multipart/form-data'
            // },
            mode: 'no-cors'
        })
            .then(response => {
                console.log('success1', response.data);
                let data = response.data
                // let bar_code = data.training_status 
                // console.log('bar_code', bar_code)
                this.setState({ progressList: data })
            })
            .catch(error => {
                console.log('error', error);
            })
        // if(this.state.msg === 4){
        //     clearInterval(this.state.intervalId)
        // }   
    }


    training_fields = (data, selectFilter) => {
        this.setState({ selectFilter })
        this.setState({ showacitve_inactive: false })


        if (selectFilter === 1) {
            console.log('1.....', selectFilter)
            this.setState({ showacitve_inactive: true })
            this.active_inactive(true, "training completed", 1)
            this.setState({ selectedFilter: 1 })
        }
        // if (selectFilter === 2) {
        //    this.gettraining_status("training_in_progress")
        // }
        else {
            let status = data
            console.log('status', status)
            console.log('selectFilter', selectFilter)
            
            try {
                axios.post('https://172.16.1.91:5000/train_fields', { 'status': status },
                    { mode: 'no-cors' })
                    .then((response) => {
                        let data = response.data
                        // console.log("status", data[15].status)
                        // this.setState({training_status:data})                       
                        if (data.length === 0 || data === null || data === undefined) {
                            this.setState({ componentList: [], dataloaded: true })

                        } else {
                            console.log(`object`, data[0].comp_code)
                            this.setState({ componentList: data, dataloaded: true })
                        }

                        /////////////////////////////////New JB//////////////////////////////////////////////////
                        // if (this.state.selectFilter === 0) {
                        //     this.training_fields(this.state.train_status_all, 0)
                        //     //window.location.reload(true);
                        // }

                        // if (this.state.selectFilter !== 1) {
                        //     this.training_fields(this.state.train_status_traincompleted, 1)
                        // }

                        // if (this.state.selectFilter !== 1 && this.state.showacitve_inactive) {
                        //     if (this.state.selectedFilter !== 1) {
                        //         this.active_inactive(true, "training completed", 1)
                        //     }
                        //     if (this.state.selectedFilter !== 2) {
                        //         this.active_inactive(false, "training completed", 2)
                        //     }
                        //     if (this.state.selectedFilter !== 3) {
                        //         this.active_inactive("ALL", "training completed", 3)
                        //     }
                        // }

                        if (this.state.selectFilter === 2) {
                            this.training_fields(this.state.train_status_train_progress, 2)
                        }
                        // if (this.state.selectFilter !== 3) {
                        //     this.training_fields(this.state.train_status_notstarted, 3)
                        // }

                    })
                    .catch((error) => {

                        console.log(error)
                    })
            } catch (error) {

            }
        }

        this.setState({ refresh: true })
    }

    active_inactive = (data, data1, selectedFilter) => {
        let active = data
        let training_status = data1

        this.setState({ selectedFilter })
        try {
            axios.post('https://172.16.1.91:5000/active_inactive', { 'is_active': active, 'status': training_status },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log("is_active", data)
                    //this.setState({componentList: data})
                    // let datasets = data.datasets

                    // if (datasets.image_path === "") {
                    //     this.setState({ componentList: data, dataloaded: true})
                    // }
                    if (data.length === 0 || data === null || data === undefined) {
                        this.setState({ componentList: [] })

                    } else {
                        console.log(`object`, data[0].comp_code)
                        this.setState({ componentList: data })
                    }

                })
                .catch((error) => {

                    console.log(error)
                })
        } catch (error) {

        }
        this.setState({ refresh: true })
    }

    submitForm = () => {

        console.log(this.state.component_name, this.state.component_code)
        console.log('config_data', this.state.config_data)
        let compData = {
            component_name: this.state.component_name,
            component_code: this.state.component_code,
            config_data: this.state.config_data
        }
        sessionStorage.removeItem("compData")
        sessionStorage.setItem("compData", JSON.stringify(compData))

        let component_name = this.state.component_name
        console.log("component_name", component_name)
        let component_code = this.state.component_code

        if (component_name === "" && component_code === "") {
            alert("The component name and code is empty")
        }
        else if (component_name === "") {
            alert("The component name is empty")
        }
        else if (component_code === "") {
            alert("The component code is empty")
        }
        // else if(component_name !== undefined && component_code !== undefined && component_name !== componentList[0].comp_name && component_code !== componentList[0].comp_code) 
        else if (component_name !== undefined && component_code !== undefined) {
            try {
                axios.post('https://172.16.1.91:5000/add_comp', { 'comp_name': component_name, 'comp_code': component_code },
                    { mode: 'no-cors' })
                    .then((response) => {
                        let data = response.data
                        console.log(data)
                        if (data === "created") {
                            this.navigateto();
                        }
                        else
                            alert(data)
                    })
                    .catch((error) => {

                        console.log(error)
                    })
            } catch (error) {

            }
        }

    }


    onChangeStatus = (value, data) => {
        console.log('data', data)
        console.log('value', value)
        data.is_active = value
        try {
            axios.post('https://172.16.1.91:5000/is_active', { 'comp_name': data.comp_name, 'comp_code': data.comp_code, 'is_active': value },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log("is_active", data[0].is_active)
                    this.setState({ is_active: data[0].is_active })
                })
                .catch((error) => {

                    console.log(error)
                })
        } catch (error) {

        }
        this.setState({ refresh: true })
    }

    navigateto = () => {
        const { history } = this.props
        console.log(this.props)
        history.push("/training")
    }

    editComp = (data) => {
        if (data.datasets === undefined) {
            data.datasets = []
        }
        console.log(`datas`, data)
        let { comp_name, comp_code, _id } = data
        let datas = {
            component_name: comp_name,
            component_code: comp_code,
            datasets: data.datasets,
            status: data.status,
            _id,
            config_data: this.state.config_data
        }
        sessionStorage.removeItem("compData")
        sessionStorage.setItem("compData", JSON.stringify(datas))

        this.setState({ component_code: comp_code, component_name: comp_name, _id })

    }

    getImage = (data1) => {
        if (data1 !== undefined) {
            // console.log('data1', data1)
            let baseurl = 'https://172.16.1.91:8000/'
            let result = data1[0].image_path
            let output = baseurl + result
            return output
        }
        else {
            return null
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

                            {/* <Row>
                                <Col>
                                    <Button color="primary" className="w-md m-1" outline={this.state.selectedFilter !== 1} onClick={() => { this.active_inactive(true, 1) }}> Active </Button>
                                </Col>
                                <Col>
                                    <Button color="primary" className="w-md m-1" outline={this.state.selectedFilter !== 2} onClick={() => { this.active_inactive(false, 2) }}> Inactive </Button>
                                </Col>
                                <Col>
                                    <Button color="primary" className="w-md m-1" outline={this.state.selectedFilter !== 3} onClick={() => { this.active_inactive("ALL", 3) }}> ALL </Button>
                                </Col>
                            </Row> */}

                            <Row>
                                <Col>
                                    <Button color="primary" className="w-md m-1" outline={this.state.selectFilter !== 0} onClick={() => { this.training_fields(this.state.train_status_all, 0) }}>All</Button>
                                </Col>
                                <Col>
                                    <Button color="primary" className="w-md m-1" outline={this.state.selectFilter !== 1} onClick={() => { this.training_fields(this.state.train_status_traincompleted, 1) }}>Training completed</Button>
                                    <div>
                                        {
                                            this.state.showacitve_inactive &&
                                            <Row>
                                                <Col>
                                                    <Button color="primary" className="w-md m-1" outline={this.state.selectedFilter !== 1} onClick={() => { this.active_inactive(true, "training completed", 1) }}> Active </Button>
                                                </Col>
                                                <Col>
                                                    <Button color="primary" className="w-md m-1" outline={this.state.selectedFilter !== 2} onClick={() => { this.active_inactive(false, "training completed", 2) }}> Inactive </Button>
                                                </Col>
                                                <Col>
                                                    <Button color="primary" className="w-md m-1" outline={this.state.selectedFilter !== 3} onClick={() => { this.active_inactive("ALL", "training completed", 3) }}> ALL </Button>
                                                </Col>
                                            </Row>
                                        }
                                    </div>
                                </Col>
                                <Col>
                                    <Button color="primary" className="w-md m-1" outline={this.state.selectFilter !== 2} onClick={() => { this.training_fields(this.state.train_status_train_progress, 2) }}>Training InProgress</Button>
                                </Col>
                                <Col>
                                    <Button color="primary" className="w-md m-1" outline={this.state.selectFilter !== 3} onClick={() => { this.training_fields(this.state.train_status_notstarted, 3) }}>Training not started</Button>
                                </Col>
                            </Row>

                            <div className="table-responsive">

                                <Table striped>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Code</th>
                                            <th>Images</th>
                                            {/* <th>id</th> */}
                                            <th>Training Status</th>
                                            <th>Actions</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.componentList.map((data, index) => (
                                                <tr key={index}>
                                                    <td>{data.comp_name}</td>
                                                    <td>{data.comp_code}</td>
                                                    <td>
                                                        <Row>
                                                            {
                                                                <img src={data.datasets === undefined ? "" : data.datasets.length !== 0 ? this.getImage(data.datasets) : ""} style={{ width: 100, height: 'auto' }} />
                                                                // <img src={data.datasets !== undefined ? this.getImage(data.datasets) : data.datasets.length === 0 ? "" : data.datasets} style={{ width: 100, height: 'auto' }} />
                                                            }
                                                        </Row>
                                                    </td>
                                                    {/* <td>{data._id}</td> */}
                                                    <td>{data.status}
                                                        {
                                                            data.status === "training_in_progress" &&
                                                            // <div>
                                                            //     {
                                                            //         this.state.progressList.map((data, index) => (
                                                            <Row className="col-lg-6">
                                                                {
                                                                    //this.state.msg === 0 &&
                                                                    data.training_status === 0 &&
                                                                    <Progress multi>
                                                                        <Progress bar color="primary" value={15} animated></Progress>
                                                                    </Progress>
                                                                }
                                                                {
                                                                    //this.state.msg === 1 &&
                                                                    data.training_status === 1 &&
                                                                    <Progress multi>
                                                                        <Progress bar color="success" value={15}>15%</Progress>
                                                                        <Progress bar color="primary" value={15} animated></Progress>
                                                                    </Progress>
                                                                }
                                                                {
                                                                    //this.state.msg === 2 &&
                                                                    data.training_status === 2 &&
                                                                    <Progress multi>
                                                                        <Progress bar color="success" value={15}></Progress>
                                                                        <Progress bar color="success" value={15}>30%</Progress>
                                                                        <Progress bar color="primary" value={10} animated></Progress>
                                                                    </Progress>

                                                                }
                                                                {
                                                                    //this.state.msg === 3 &&
                                                                    data.training_status === 3 &&
                                                                    <Progress multi>
                                                                        <Progress bar color="success" value={15}></Progress>
                                                                        <Progress bar color="success" value={15}></Progress>
                                                                        <Progress bar color="success" value={10}>40%</Progress>
                                                                        <Progress bar color="primary" value={60} animated></Progress>
                                                                    </Progress>
                                                                }
                                                                {
                                                                    // this.state.msg === 4 &&
                                                                    data.training_status === 4 &&
                                                                    <Progress multi>
                                                                        <Progress bar color="success" value={15}></Progress>
                                                                        <Progress bar color="success" value={15}></Progress>
                                                                        <Progress bar color="success" value={10}></Progress>
                                                                        <Progress bar color="success" value={60}>100%</Progress>
                                                                    </Progress>
                                                                }

                                                            </Row>
                                                            //         ))

                                                            //     }
                                                            // </div>


                                                        }

                                                    </td>
                                                    <td>
                                                        {
                                                            data.is_active &&
                                                            <Link to="/training"><Button onClick={() => this.editComp(data)} ><EditOutlined />Edit</Button></Link>
                                                        }
                                                    </td>
                                                    <td>
                                                        <div className="square-switch">
                                                            <input type="checkbox" id={"is_active" + index} switch="bool" checked={data.is_active} onChange={(e) => this.onChangeStatus(e.target.checked, data)} />
                                                            <label className="mb-0" htmlFor={"is_active" + index} data-on-label="Yes" data-off-label="No" ></label>
                                                        </div>
                                                    </td>

                                                    {/* <td><Button>Inactive</Button></td>
                                                    <td><Button>Publish</Button></td>
                                                    <td><Link to="/inspectResult"><Button onClick={() => this.editComp(data)}>InspectionReport</Button></Link></td> */}

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
                                                    type="number"
                                                    className="form-control"
                                                    id="example-number-input"
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
                                                        onClick={() => { this.submitForm() }}
                                                    >
                                                        ADD
                                                    </Button>
                                                    {/* </Link> */}

                                                </div>
                                            </Col>
                                        </div>
                                    </Form>
                                </div>
                            </Modal>
                            {
                                this.state.componentList.length === 0 ?

                                    <div className="text-center">
                                        <h3>No Records found </h3>
                                    </div> : null
                            }
                        </Container>
                    </div>
                </React.Fragment>
            );
        }
        else {
            return null
        }

    }
}
CRUDComponent.propTypes = {
    history: PropTypes.any.isRequired,
};
export default CRUDComponent;