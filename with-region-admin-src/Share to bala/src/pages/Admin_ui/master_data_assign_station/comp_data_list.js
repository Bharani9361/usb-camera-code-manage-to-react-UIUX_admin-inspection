import React, { Component } from "react";
import MetaTags from 'react-meta-tags';
import PropTypes from "prop-types"
import { Card, Container, Row, CardBody, CardTitle, Button} from "reactstrap";
import { Link } from "react-router-dom";
import CompInfoTable from './CompInfoTable'
import SweetAlert from 'react-bootstrap-sweetalert';
import urlSocket from "pages/AdminInspection/urlSocket";
import No_data from 'assets/images/nodata/nodata_graph.jpg';
import Breadcrumbs from "components/Common/Breadcrumb";


class EntryScrn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataloaded: false,
            tbIndex: 0,
            samples_list: [],
            message: '',
            show_msg: false,           
            station_info: [],
            station_comp_info: [],
            station_name: '',
            mac_address: '',
            obj: {}
        }
    }

    componentDidMount() {
        var stationInfo = JSON.parse(sessionStorage.getItem("stationInfo"))
        let station_name = stationInfo.station_name
        console.log('stationInfo', stationInfo, station_name)
        this.setState({ station_info: stationInfo, station_name: station_name })
        this.compInfo()
    }

    compInfo = () => {
        try {
            urlSocket.post('/comp_status_info',
                { mode: 'no-cors' })
                .then((response) => {
                    let data = response.data
                    this.setState({ samples_list: data, dataloaded: true })
                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (error) {
            console.log("----", error)
        }
    }

    submitForm = (data) => {
        console.log('Submitted:', data);
    
        const send_data = [];
        const { station_name, station_info } = this.state;
        const { mac_addrs, stn_ver, _id: station_id } = station_info;
    
        data.forEach((currItem) => {
            if (currItem.checked === true) {
                send_data.push({
                    comp_name: currItem.comp_name,
                    comp_code: currItem.comp_code,
                    comp_id: currItem._id,
                    comp_ver: currItem.comp_ver,
                    station_name,
                    stn_ver,
                    mac_addrs,
                    station_id,
                });
            }
        });
    
        console.log('Processed Data:', send_data);
    
        try {
            urlSocket.post('/crud_station_comp_info', { station_comp_info: send_data, station_id },
                    { mode: 'no-cors' }
                )
                .then((response) => {
                    const { data } = response;
                    console.log('first86', data)
    
                    let message = '';
                    if (data === 'Success') {
                        message = 'Component Assigned Successfully';
                    } else if (data === 'data cleared') {
                        message = 'Component Unassigned Successfully';
                    } else {
                        message = 'Error';
                    }

                    this.setState({ message, show_msg: true });
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        } catch (error) {
            console.error('Unexpected Error:', error);
        }
    };
    
    navigation = () => {
        const { history } = this.props
        console.log(this.props)
        history.push("/station_list")
    }

    backtoStation = () => {
        console.log('close')
    }

    render() {
        if (this.state.dataloaded) {
            return (
                <React.Fragment>
                    <div className="page-content">
                        <MetaTags>
                        <title>Component List | RunOut Admin</title>
                        </MetaTags>
                        <Breadcrumbs title="COMPONENT LIST" isBackButtonEnable={true} gotoBack={() => { this.props.history.push('/station_list') }} />
                        <Container fluid>
                            <Card>
                                <CardBody>
                                    <CardTitle className="mb-0 "><span className="me-2 font-size-12">Station Name :</span>{this.state.station_name}</CardTitle>
                                    <Row className="mt-2"> 
                                        {
                                            this.state.samples_list.length > 0 ?
                                                <CompInfoTable samples={this.state.samples_list} station_info={this.state.station_info} selected_data={(data) => { this.submitForm(data) }} />
                                                :
                                                <div className="container d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
                                                    <div className="text-center">
                                                        <p style={{ fontWeight: 'bold', fontSize: '22px' }}>No Components Available</p>
                                                        <img src={No_data} className="img-fluid h-auto" alt="No Data" style={{ width: '30%' }} />
                                                    </div>
                                                    <div>
                                                        <Link to="/comp_admin"><Button color="primary" >Create or Mastering The Component</Button></Link>
                                                    </div>
                                                </div>
                                        }
                                    </Row>
                                    <div>
                                        {
                                            this.state.show_msg ?
                                                <SweetAlert
                                                    title={this.state.message}
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
EntryScrn.propTypes = {
    history: PropTypes.any.isRequired,
};
export default EntryScrn;
