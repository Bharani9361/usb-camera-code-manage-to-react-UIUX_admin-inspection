import React, { useContext, useEffect, useRef, useState } from "react";
import { ListGroup, ListGroupItem, Button, Label, Spinner } from "reactstrap";
import { 
    FaPlug, 
    FaPowerOff, 
    FaCamera, 
    FaPlayCircle, 
    FaStopCircle 
} from 'react-icons/fa';
import toastr from "toastr";

// toast
import { toastError, toastSuccess } from "../customToast";

// contexts
import { AppContext } from "../contexts/Context";

// services
import { executeSensorAction } from "../services/sensorApi";
import { MasteringContext } from "../contexts/MasteringContext";

const SensorOperation = () => {
    const { 
        selectedSensor, updateSelectedSensor, selectedKeys,
        sensorConnected, setConnectedSensor 
    } = useContext(AppContext);

    const { sharedState, startCapturing, stopCapturing } = useContext(MasteringContext);

    const [connectionInProgress, setConnectionInProgress] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    // const [waitCaptureResponse, setWaitCaptureResponse] = useState(false);
    const [disableAll, setDisableAll] = useState(false);

    const [waitResponse, setWaitResponse] = useState({});
    // const [captureInProgress, setCaptureInProgress] = useState(false)

    // this ref and useEffect is not currently used
    const sensorRef = useRef(sensorConnected);
    // Update the ref whenever sensorConnected changes
    useEffect(() => {
        sensorRef.current = sensorConnected;
    }, [sensorConnected]);

    useEffect(() => {
        console.log('sharedState.isMasterRunning ', sharedState.isMasterRunning)
        if(!sharedState.isMasterRunning) {
            setDisableAll(false)
        } else if(sharedState.isMasterRunning) {
            setDisableAll(true)
        }
    }, [sharedState]);

    
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const handleAction = async (action) => {
        try {
            if(waitResponse[action]) {
                return;
            }
            setWaitResponse({ ...waitResponse, [action]: true });

            if(action == "start_capturing") {
                startCapturing();
            } else if(action == "stop_capturing") {
                stopCapturing();
            }

            const isConnectAction = action == "connect";
            const isDisconnectAction = action == "disconnect";

            
            if((isConnectAction || isDisconnectAction) && sensorConnected.sensorName && sensorConnected.sensorName != `${selectedSensor.name}-${selectedSensor.model_name}`) {
                toastError(`${sensorConnected.sensorName} is Already Connected`)
                return;
            }
            if(isConnectAction || isDisconnectAction) {
                setConnectionInProgress(true);
            }
            // if(action == "start_capturing" || action == "stop_capturing") {
            //     setWaitCaptureResponse(true);
            // }
            // if(action == "start_capturing") {
            //     setCaptureInProgress(true)
            // }
            // if(action == "stop_capturing") {
            //     setCaptureInProgress(false)
            // }
            
            const payload = isConnectAction ?
                {
                    'ip_address': selectedSensor.ip_address,
                    'port_number': selectedSensor.port_number
                }
                : {}; // Customize this payload as required
            // // using sensor's type for accessing specific file
            // const result = await executeSensorAction(selectedSensor.type, action, payload);
            // using brand and model name for accessing specific file related to sensor
            const brand_model = `${selectedSensor.brand_name}_${selectedSensor.model_name}`
            const result = await executeSensorAction(brand_model, action, payload);
            toastSuccess(result.data.message)
            if(isConnectAction) {
                let parameter_data = {
                    sensor: selectedSensor,
                    status: true,
                }
                setConnectedSensor(parameter_data);
            } else if(isDisconnectAction) {
                let parameter_data = {
                    status: false,
                }
                setConnectedSensor(parameter_data);
            }
            if(isConnectAction || isDisconnectAction) {
                setConnectionInProgress(false);
            }
            
            // if(action == "start_capturing" || action == "stop_capturing") {
            //     setWaitCaptureResponse(false);
            // }

            if(action == "start_capturing") {
                setIsCapturing(true);
            } else if(action == "stop_capturing") {
                setIsCapturing(false);
            }
            // alert(`${action} successful: ${JSON.stringify(result)}`);
        } 
        catch (error) {
            console.log(`Error executing ${action}: ${error.message}`)
            toastError(`${error.message}`, `Error executing ${action}`)
            // alert(`Error executing ${action}: ${error.message}`);
            setConnectionInProgress(false);

            // if(action == "start_capturing") {
            //     setIsCapturing(false);
            // } else if(action == "stop_capturing") {
            //     setIsCapturing(true);
            // }

            if(action == "start_capturing" || action == "stop_capturing") {
                // setWaitCaptureResponse(false);
                setIsCapturing(false);
                stopCapturing();
            }
        }
        finally {
            setWaitResponse({ });
            // setWaitResponse({ ...waitResponse, [action]: false });
        }
    };

    const isWaitResponse = Object.keys(waitResponse).length > 0;

    return (
        <div>
            {selectedSensor ? (
                <div>
                    <div>
                        <Label style={{ fontWeight: "bold" }}>Selected Sensor:</Label>
                        <div className="mb-2 d-flex justify-content-between">
                            <span>
                                {`${selectedSensor.name}-${selectedSensor.model_name}`}
                                { }
                            </span>
                            <span>
                                {
                                    sensorConnected?.status || isWaitResponse ? null :
                                        <i
                                            className="bx bx-minus-circle"
                                            onClick={() => updateSelectedSensor(null)}
                                            style={{ fontSize: "20px", color: "red", cursor: "pointer" }}
                                        ></i>
                                }
                            </span>
                        </div>
                    </div>
                    <ListGroup>
                        {
                            sensorConnected?.status ?
                                <ListGroupItem>
                                    <Button color="danger" block 
                                        onClick={() => {
                                            if(!waitResponse["disconnect"]) { handleAction("disconnect") }
                                        }}
                                        disabled={isWaitResponse || disableAll || isCapturing}
                                    >
                                        {waitResponse["disconnect"] ? <Spinner className="me-2" size="sm"/> : <FaPowerOff className="me-2" />}
                                        Disconnect
                                    </Button>
                                </ListGroupItem>
                                :
                                <ListGroupItem>
                                    <Button color="primary" block 
                                        onClick={() => {
                                            if(!waitResponse["connect"]) { handleAction("connect") }
                                        }}
                                        disabled={isWaitResponse || disableAll || isCapturing}
                                    >
                                        {waitResponse["connect"] ? <Spinner className="me-2" size="sm"/> : <FaPlug className="me-2" />}
                                        Connect
                                    </Button>
                                </ListGroupItem>
                        }
                        
                       
                        {
                            sensorConnected?.status && selectedKeys?.length == 2 ?
                            <>
                                <ListGroupItem>
                                    <Button color="info" block 
                                        onClick={() => {
                                            if(!waitResponse["single_shot"]) { handleAction("single_shot") }
                                        }}
                                        disabled={isWaitResponse ||disableAll || isCapturing }
                                    >
                                        {
                                            waitResponse["single_shot"] ?
                                            <Spinner className="me-2" size="sm"/>
                                            : <FaCamera className="me-2" />
                                        }
                                        Single Shot
                                    </Button>
                                </ListGroupItem>
                                {
                                    !isCapturing ?
                                    <ListGroupItem>
                                        <Button color="success" block 
                                            onClick={() => {
                                                if(!waitResponse["start_capturing"]) { handleAction("start_capturing") }
                                            }}
                                            disabled={isWaitResponse || disableAll}
                                        >
                                            {waitResponse["start_capturing"] ? <Spinner className="me-2" size="sm"/> : <FaPlayCircle className="me-2" />}
                                            Start Capturing
                                        </Button>
                                    </ListGroupItem>
                                    :
                                    <ListGroupItem>
                                        <Button color="danger" block 
                                            onClick={() => {
                                                if(!waitResponse["stop_capturing"]) { handleAction("stop_capturing") }
                                            }}
                                            disabled={isWaitResponse || disableAll}
                                        >
                                            {waitResponse["stop_capturing"] ? <Spinner className="me-2" size="sm"/> : <FaStopCircle className="me-2" />}
                                            Stop Capturing
                                        </Button>
                                    </ListGroupItem>
                                }
                                
                                
                            </>
                            : null
                        }
                    </ListGroup>
                </div>
            ) : (
                <p>No Sensor selected.</p>
            )}
        </div>
    );
};

export default SensorOperation;
