import { min } from 'lodash'
import urlSocket from 'pages/AdminInspection/urlSocket'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Card, CardBody, Button, Input, Label } from 'reactstrap'
import { makeHeaderBtn } from "store/actions"
import toastr from "toastr"

class sensorConfig extends Component {
    static propTypes = {
        history: PropTypes.any.isRequired,
        dispatch: PropTypes.func.isRequired, // Add dispatch to propType
    }

    constructor(props) {
        super(props);
        this.state = {
            _id: '',
            min: 90, // default min value
            max: 280, // default max value
            tempMin: 90,
            tempMax: 280,
            showButtons: false, // condition to show Submit and Cancel buttons
            minError: '',
            maxError: '',
        };
    }

    componentDidMount = async () => {
        this.props.dispatch(makeHeaderBtn(false));
        await this.getSensorConfig()
    }

    getSensorConfig = async () => {
        const response = await urlSocket.post("/get_sensor_config",
            { headers: { "content-type": "application/json" }, mode: "no-cors" });
        const sensor_config = response.data.sensor_config;
        this.setState({
            _id: sensor_config._id,
            min: sensor_config.min_range,
            max: sensor_config.max_range,
            tempMin: sensor_config.min_range,
            tempMax: sensor_config.max_range,
        })
    }

    // Handle input change and show buttons when values are updated
    handleChange = (e) => {
        const { name, value } = e.target;
        this.setState({ [name]: value, showButtons: true, minError: '', maxError: '' }
            // , () => {
            // this.validateInputs(); }
        );
    };

    // Handle form submit to update min and max values
    handleSubmit = async () => {
        const { minError, maxError } = this.validateInputs();

        // Prevent submission if there are errors
        if (minError || maxError) {
            console.log('Unable to submit');
            return;
        }

        this.setState((prevState) => ({
            min: prevState.tempMin,
            max: prevState.tempMax,
            showButtons: false, // hide buttons after submit
        }), async () => {
            // This callback runs after the state has been updated
            const { _id, min, max } = this.state; // Get updated state values
            const response = await urlSocket.post("/update_sensor_config", {
                '_id': _id,
                'min_range': min,
                'max_range': max,
            }, { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });

            console.log('sensor_config ----- ', response.data);
            this.toastSuccess("Sensor Working Range Updated", "")
        });
    };

    // Handle cancel to revert the changes
    handleCancel = () => {
        this.setState({
            tempMin: this.state.min,
            tempMax: this.state.max,
            showButtons: false, // hide buttons after cancel
            minError: '', // clear error messages
            maxError: '',
        });
    };

    // validateInputs = () => {
    //     const { tempMin, tempMax } = this.state;
    //     let minError = '';
    //     let maxError = '';
    //     if (tempMin < 90) {
    //         minError = 'Min value cannot be less than 90 mm';
    //     }
    //     if (tempMax > 280) {
    //         maxError = 'Max value cannot be greater than 280 mm';
    //     }

    //     // Update the state with error messages
    //     this.setState({ minError, maxError });
    // }

    // Validate min and max inputs
    validateInputs = () => {
        const { tempMin, tempMax } = this.state;
        let minError = '';
        let maxError = '';

        // Validation for min and max ranges
        if (tempMin < 90) {
            minError = '* min value cannot be less than 90 mm';
        } else if (parseInt(tempMin) >= parseInt(tempMax)) {
            minError = '* min value should be less than max value';
        }

        if (tempMax > 280) {
            maxError = '* max value cannot be greater than 280 mm';
        } else if (parseInt(tempMax) <= parseInt(tempMin)) {
            maxError = '* max value should be greater than min value';
        }
        // Update the state with error messages
        this.setState({ minError, maxError });
        return { minError, maxError };
        
    };

    toastSuccess = (title, message) => {
        // title = "Success"
        toastr.options.closeDuration = 8000
        toastr.options.positionClass = "toast-bottom-right"
        toastr.success(message, title)
    }

    toastError = (title, message) => {
        // let title = "Failed"
        toastr.options.closeDuration = 8000
        toastr.options.positionClass = "toast-bottom-right"
        toastr.error(message, title)
    }

    render() {
        return (
            <div className="page-content">
                {/* Header */}
                <h5 className="text-center" style={{fontWeight: 'bold'}}>Sensor Configuration</h5>

                {/* Responsive Card */}
                <Row className="row-eq-height">
                    <Col sm={6} md={4} lg={3}>
                        <Card>
                            <CardBody>
                                {/* Row and Col for layout */}
                                <Row className="align-items-center">
                                    <Col sm="12">
                                    <p style={{fontWeight: 'bold'}}>{`Sensor Working Range Z (90 - 280)`}</p>
                                    </Col>
                                    <Col sm="6">
                                        <Label for="min">{`Min Value(mm)`}</Label>
                                        <Input
                                            type="number"
                                            name="tempMin"
                                            id="min"
                                            value={this.state.tempMin}
                                            onChange={this.handleChange}
                                        />
                                        {this.state.minError &&
                                            (<p style={{ color: 'red', fontSize: '0.9em' }}>
                                                {this.state.minError}
                                            </p>)
                                        }
                                    </Col>
                                    <Col sm="6">
                                        <Label for="max">{`Max Value(mm)`}</Label>
                                        <Input
                                            type="number"
                                            name="tempMax"
                                            id="max"
                                            value={this.state.tempMax}
                                            onChange={this.handleChange}
                                        />
                                        {this.state.maxError && (
                                            <p style={{ color: 'red', fontSize: '0.9em' }}>
                                                {this.state.maxError}
                                            </p>
                                        )}
                                    </Col>
                                </Row>

                                {/* Show buttons if values are modified */}
                                {this.state.showButtons && (
                                    <Row className="mt-3">
                                        <Col className="text-right">
                                            <Button color="primary" onClick={this.handleSubmit}>
                                                Submit
                                            </Button>
                                            {' '}
                                            <Button color="secondary" onClick={this.handleCancel}>
                                                Cancel
                                            </Button>
                                        </Col>
                                    </Row>
                                )}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
               

                {/* Display updated values
                <div className="mt-3">
                    <h4>Current Range:</h4>
                    <p>Min: {this.state.min}</p>
                    <p>Max: {this.state.max}</p>
                </div> */}
            </div>
        )
    }
}
const mapStateToProps = state => {
    const { layoutType, showRightSidebar } = state.Layout;
    return { layoutType, showRightSidebar };
}
export default connect(mapStateToProps)(sensorConfig);
// export default sensorConfig
