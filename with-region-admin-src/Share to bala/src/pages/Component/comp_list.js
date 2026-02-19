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
import { Radio, Space, Checkbox } from 'antd';
// import 'antd/dist/antd.css';
import urlSocket from '../AdminInspection/urlSocket'



class CompInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataloaded: false,
            tbIndex: 0,
            samples_list: []
        }
    }

    componentDidMount() {
        try {
            urlSocket.post('/comp_status_info',
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    console.log('samples_list', data)
                    this.setState({ samples_list: data, dataloaded: true })
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }
    //     var nietos = [];
    // var obj = {};
    // obj["01"] = nieto.label;
    // obj["02"] = nieto.value;
    // nietos.push(obj);

    manageStation = (data) => {
        console.log('data', data)
        sessionStorage.removeItem("InfoComp")
        sessionStorage.setItem("InfoComp", JSON.stringify(data))
    }


    render() {
        if (this.state.dataloaded) {

            return (
                <React.Fragment>
                    <div className="page-content">
                        <MetaTags>
                        </MetaTags>
                        <Container fluid={true} style={{ minHeight: '100vh', background: 'white' }}>
                            <br/>
                            <CardTitle className="text-center"> COMPONENT INFORMATION</CardTitle>
                            <br />
                            <Row><Table striped>
                                <thead>
                                    <tr>
                                        <th>Component Name</th>
                                        <th>Component Code</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.samples_list.map((comp, index) => (
                                            <tr key={index}>
                                                <td>{comp.comp_name}</td>
                                                <td>{comp.comp_code}</td>
                                                <td> <Link to="/station_data"><Button onClick={() => this.manageStation(comp)}>Manage Station</Button></Link></td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </Table>
                            </Row>
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
CompInfo.propTypes = {
    history: PropTypes.any.isRequired,
};
export default CompInfo;