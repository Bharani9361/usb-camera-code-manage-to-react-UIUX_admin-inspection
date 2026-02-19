import React, { Component } from "react";
import MetaTags from 'react-meta-tags';
import PropTypes from "prop-types"
import { Card, Container, Row, CardBody, CardTitle, Button, CardText, } from "reactstrap";
import { Link } from "react-router-dom";
import StationInfoTable from './StationInfoTable'
import SweetAlert from 'react-bootstrap-sweetalert';
import urlSocket from "pages/AdminInspection/urlSocket";
import No_data from 'assets/images/nodata/nodata_graph.jpg';
import Breadcrumbs from "components/Common/Breadcrumb";

class StationData extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataloaded: false,
            tbIndex: 0,
            station_list: [],
            message: '',           
            show_msg: false,
            comp_info: [],
            station_comp_info: [],
            comp_name: '',
            comp_code: '',
            mac_address: '',
        }
    }

    componentDidMount() {
        var compInfo = JSON.parse(sessionStorage.getItem("InfoComp"))
        console.log('first', compInfo)
        let comp_name = compInfo.component_info.comp_name
        this.setState({ comp_info: compInfo, comp_name: comp_name, comp_code: compInfo.component_info.comp_code })
        this.stationInfo()
    }

    stationInfo = () => {
        try {
            urlSocket.post('/station_status_info',
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    this.setState({ station_list: data, dataloaded: true })
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }

    submitForm = (data) => {
        console.log('Submitted data:', data);
    
        // Destructure necessary state variables for cleaner access
        const {comp_name, comp_code, comp_info: { component_info },} = this.state;  

        // Validate necessary state data
        if (!component_info) {
            console.error('Component info is missing');
            return;
        }
        console.log('component_info', component_info)
        // Filter and map checked items into the desired format
        const send_data = data
            .filter((item) => item.checked)
            .map((currItem) => ({
                station_name: currItem.station_name,
                mac_addrs: currItem.mac_addrs,
                station_id: currItem._id,
                stn_ver: currItem.stn_ver,
                comp_name,
                comp_code,
                comp_id: component_info._id, 
                comp_ver: component_info.comp_ver,         
            }));
    
        console.log('Prepared data for submission:', send_data, component_info._id);
        
        // Make an API call to submit the data
        try {
            urlSocket.post('/crud_comp_station_info', { comp_station_info: send_data, comp_id: component_info._id },
                { mode: 'no-cors' }
            )
                .then((response) => {
                    const { data } = response;
                    console.log('Server response:', data);

                    // Update the state based on the server response
                    if (data === 'Success') {
                        this.setState({ message: 'Component Assigned Successfully', show_msg: true });
                    } else if (data === 'data cleared') {
                        this.setState({ message: 'Component Unassigned Successfully', show_msg: true });
                    } else {
                        this.setState({ message: 'Error', show_msg: true });
                    }
                })
                .catch((error) => {
                    console.error('API Error:', error);
                });
        } catch (error) {
            console.error('Unexpected Error:', error);
        }
        
    };    

    backtoComp = () => { console.log('close') }

    navigation = () => {
        const { history } = this.props
        console.log(this.props)
        history.push("/comp_admin")
    }

    render() {
        if (this.state.dataloaded) {
            return (
                <React.Fragment>
                    <div className="page-content">
                        <MetaTags> <title>Station Info | RunOut</title> </MetaTags>
                        <Breadcrumbs title="STATION INFO" isBackButtonEnable={true} gotoBack={() => { this.props.history.push('/comp_admin') }} />

                        <Container fluid>
                            <Card>
                                <CardBody>
                                    <CardTitle className="mb-0 "><span className="me-2 font-size-12">Component Name :</span>{this.state.comp_name}</CardTitle>
                                    <CardText className="mb-0"><span className="me-2 font-size-12">Component Code :</span>{this.state.comp_code}</CardText>

                                    <Row className="mt-2">
                                        {
                                            this.state.station_list.length > 0 ?
                                                <StationInfoTable station_data={this.state.station_list} compinfo={this.state.comp_info} selected_data={(data) => { this.submitForm(data) }} />
                                                :
                                                <div className="container d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
                                                    <div className="text-center">
                                                        <p style={{ fontWeight: 'bold', fontSize: '22px' }}>No Stations Available</p>
                                                        <img src={No_data} className="img-fluid h-auto" alt="No Data" style={{ width: '30%' }} />
                                                    </div>
                                                    <div>
                                                        <Link to="/station_list"><Button color="primary" >Create Station</Button></Link>
                                                    </div>
                                                </div>
                                        }
                                    </Row>
                                    <div>
                                        {
                                            this.state.show_msg ?
                                                <SweetAlert
                                                    title={this.state.message}
                                                    cancelBtnBsStyle="success"
                                                    confirmBtnText="OK"
                                                    onConfirm={() => this.navigation()}
                                                    closeOnClickOutside={false}
                                                    style={{ zIndex: 997 }}
                                                    timeout={2000}
                                                >
                                                </SweetAlert> : null
                                        }
                                    </div>
                                </CardBody>
                            </Card>
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
StationData.propTypes = {
    history: PropTypes.any.isRequired,
};
export default StationData;
