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
import Select from 'react-select';
import 'antd/dist/antd.css';



class Configuration extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataloaded: false,
            showTable2: false,
            tbIndex: 0,
            dateWise_filterdata: [],
            addCompModal: false,
            // ok:"",
            // notok:"",
            config_data: [],
            options: [
                { label: 1 },
                { label: 2 },
                { label: 3 },
                { label: 4 },
                { label: 5 },
                { label: 6 },
                { label: 7 },
                { label: 8 },
                { label: 9 },
                { label: 10 },
                { label: 11 },
                { label: 12 },
                { label: 13 },
                { label: 14 },
                { label: 15 },
                { label: 16 },
                { label: 17 },
                { label: 18 },
                { label: 19 },
                { label: 20 },
            ],
            option: [
                { label: 0 },
                { label: 1 },
                { label: 2 },
                { label: 3 },
                { label: 4 },
                { label: 5 },
                { label: 6 },
                { label: 7 },
                { label: 8 },
                { label: 9 },
                { label: 10 },
                { label: 11 },
                { label: 12 },
                { label: 13 },
                { label: 14 },
                { label: 15 },
                { label: 16 },
                { label: 17 },
                { label: 18 },
                { label: 19 },
                { label: 20 },
            ],
            manual_auto_option: [{ label: 'Manual' }, { label: 'Auto' }],
            selectedOption: { label: 5 },
            selectOption: { label: 0 },
            selectM_A: { label: 'Manual' }

        }
    }

    componentDidMount() {
        try {
            axios.post('https://172.16.1.91:5000/config',
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('min_ok_for_training', data)
                    this.setState({ config_data: data })
                })
                .catch((error) => {

                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)

        }

    }

    onSelectComponent = (e1) => {
        console.log('e', e1)
        // let selectedlabel = this.state.selectedOption
        // e1 = selectedlabel.label
        // console.log('e1', e1)
        // return e1
        // try {
        //     axios.post('https://172.16.1.91:5000/config', { 'min_ok_for_training': e1.label },
        //         { mode: 'no-cors' })
        //         .then((response) => {
        //             let data = response.data
        //             console.log('min_ok_for_training', data)                   
        //         })
        //         .catch((error) => {

        //             console.log(error)
        //         })
        // } catch (error) {
        //     console.log("----", error)

        // }
    }
    selectComponent = (e2) => {
        console.log('e', e2)
    }
    selectManual_auto = (e3) => {
        console.log('e', e3, this.state.selectM_A)
        // let selectManual_Auto = this.state.selectM_A         
        // console.log('config_data', this.state.config_data)
        // let data = this.state.config_data
        // let id = null;

        // if(data.length >0){
        //     id = data[0]._id
        // }
        // console.log('id', id)
        // try {
        //     // axios.post('https://172.16.1.91:5000/update_config', {'_id':id, 'min_notok_for_training': this.state.notok, "min_ok_for_training": this.state.ok },
        //     axios.post('https://172.16.1.91:5000/update_config', {'_id':id, 'inspection_type': selectManual_Auto },
        //         { mode: 'no-cors' })
        //         .then((response) => {
        //             let data = response.data
        //             console.log('inspection_type', data)    
        //             this.setState({config_data:data})  
        //             // window.location.reload(false);             
        //         })
        //         .catch((error) => {

        //             console.log(error)
        //         })
        // } catch (error) {
        //     console.log("----", error)

        // }


    }
    submit = () => {
        // console.log('ok', this.state.ok)
        // console.log('notok', this.state.notok)
        //let selectManual_Auto = this.state.selectM_A.label
        let selectnotok_label = this.state.selectOption
        let notok = selectnotok_label.label
        let selectok_label = this.state.selectedOption
        let ok = selectok_label.label
        console.log('config_data', this.state.config_data)
        let data = this.state.config_data
        let id = null;

        if (data.length > 0) {
            id = data[0]._id
        }
        console.log('id', id)
        try {
             axios.post('https://172.16.1.91:5000/update_config', {'_id':id, 'min_notok_for_training': notok, "min_ok_for_training": ok },
           // axios.post('https://172.16.1.91:5000/update_config', { '_id': id, 'min_notok_for_training': notok, "min_ok_for_training": ok, 'inspection_type': selectManual_Auto },
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('min_notok_for_training', data)
                    this.setState({ config_data: data })
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
                                <CardTitle className="text-center">Configuration Details</CardTitle>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={5}>
                                {/* <Select
                                    value={this.state.selectedOption}
                                    onChange={(e1) => this.onSelectComponent(this.setState({ok: e1.label}), this.setState({ selectedOption: e1 }))}
                                    options={this.state.options}
                                /> */}
                                <label>Minimum number of ok images for training:</label>
                                <Select
                                    value={this.state.selectedOption}
                                    onChange={(e1) => this.onSelectComponent(this.setState({ selectedOption: e1.label }), this.setState({ selectedOption: e1 }))}
                                    options={this.state.options}
                                />
                            </Col>
                            </Row>
                            <br/>
                            <Row>
                            <Col sm={5}>
                                {/* <Select
                                    value={this.state.selectOption}
                                    onChange={(e2) => this.selectComponent(this.setState({notok: e2.label}), this.setState({ selectOption: e2 }))}
                                    options={this.state.option}
                                /> */}
                                <label>Minimum number of not ok images for training:</label>
                                <Select
                                    value={this.state.selectOption}
                                    onChange={(e2) => this.selectComponent(this.setState({ selectOption: e2.label }), this.setState({ selectOption: e2 }))}
                                    options={this.state.option}
                                />
                            </Col>
                        </Row>
                        <br />
                        <div className="controls mb-4">
                        <div className="form-check mb-2">
                              <input
                                type="radio"
                                id="radio1"
                                name="toastType"
                                className="form-check-input"
                                value="success"
                                
                              />
                              <Label
                                className="form-check-label"
                                htmlFor="radio1"
                              >
                                Auto
                              </Label>
                            </div>
                            <div className="form-check mb-2">
                              <input
                                type="radio"
                                id="radio1"
                                name="toastType"
                                className="form-check-input"
                                value="success"
                                defaultChecked
                              />
                              <Label
                                className="form-check-label"
                                htmlFor="radio1"
                              >
                                Manual
                              </Label>
                            </div>
                        </div>
                        
                        {/* <Row>
                            <Col sm={5}>
                                <label>Inspection Type:</label>
                                <Select
                                    value={this.state.selectM_A}
                                    onChange={(e3) => this.selectManual_auto(this.setState({ selectM_A: e3.label }), this.setState({ selectM_A: e3 }))}
                                    options={this.state.manual_auto_option}
                                />
                            </Col>
                        </Row>
                        <br/> */}
                        <Row>
                            <Col sm={2}>
                                <div>
                                    <Button color="primary" className="w-md m-1" onClick={() => this.submit()}>Submit</Button>
                                </div>
                            </Col>
                        </Row>


                    </Container>
                    {/* container-fluid */}
                </div>
            </React.Fragment>
        );
    }


}

Configuration.propTypes = {
    history: PropTypes.any.isRequired,
};
export default Configuration;


//ref for input radio button
// <div className="form-check mb-2">
                                    //     <Row>
                                    //         <Col sm={3}>
                                    //             <div className="form-check mb-2">
                                    //                 <input
                                    //                     type="radio"
                                    //                     id="radio1"
                                    //                     name="toastType"
                                    //                     className="form-check-input"
                                    //                     value={this.state.manual}
                                    //                     // defaultChecked
                                    //                     //onChange={(e) => this.setState({ component_name: e.target.value })}
                                    //                     onChange={(e) => this.selectManual_auto(e.target.value, this.setState({ manual: e.target.value }))}
                                    //                 />
                                    //                 <Label
                                    //                     className="form-check-label"
                                    //                     htmlFor="radio1"
                                    //                 >
                                    //                     Manual
                                    //                 </Label>
                                    //             </div>
                                    //         </Col>
                                    //         <Col sm={3}>
                                    //             <div className="form-check mb-2">
                                    //                 <input
                                    //                     type="radio"
                                    //                     id="radio1"
                                    //                     name="toastType"
                                    //                     className="form-check-input"
                                    //                     value={this.state.auto}
                                    //                     onChange={(e) => this.selectManual_auto(e.target.value, this.setState({ auto: e.target.value }))}
                                    //                 />
                                    //                 <Label
                                    //                     className="form-check-label"
                                    //                     htmlFor="radio1"
                                    //                 >
                                    //                     Auto
                                    //                 </Label>
                                    //             </div>
                                    //         </Col>
                                    //     </Row>
                                    // </div>