import React, { useContext, useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardTitle,
  Button,
  Progress,
  Row,
  Col,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tooltip 
} from "reactstrap";
import CountdownTimer from "react-component-countdown-timer";
import { FaPlus, FaExclamationCircle, FaCheckCircle } from "react-icons/fa";
import Swal from "sweetalert2";
import { v4 as uuidv4 } from 'uuid'; // Import UUID for unique session ID


import { AppContext } from "../contexts/Context";
import { GraphRefContext } from "../contexts/GraphRefContext";
import { MasteringContext } from "../contexts/MasteringContext";
import { RegionsContext } from "../contexts/RegionsContext";

import { executeSensorAction } from "../services/sensorApi";

import useSocket from "../contexts/useSocket";

import './MasteringStatus.css'

// const MasteringStatus = () => {
//     const { settings } = useContext(AppContext);
//     const [rotationStatus, setRotationStatus] = useState("Not Started");
//     const [progress, setProgress] = useState(0);
//     const [isRotationComplete, setIsRotationComplete] = useState(false);
//     const [leadTime, setLeadTime] = useState(0);
//     const [captureDuration, setCaptureDuration] = useState(0);
//     const [showModal, setShowModal] = useState(false);
//     const [isStopped, setIsStopped] = useState(false);
//     const [highlight, setHighlight] = useState({ leadTime: false, captureDuration: false, rotationStatus: false });

//     const resetAll = () => {
//         setRotationStatus("Not Started");
//         setProgress(0);
//         setIsRotationComplete(false);
//         setLeadTime(0);
//         setCaptureDuration(0);
//         setIsStopped(false);
//         setShowModal(false);
//         setHighlight({ leadTime: false, captureDuration: false, rotationStatus: false });
//     };

//     useEffect(() => {
//         let timer;
//         if (leadTime > 0 && leadTime < 10 && !isStopped) {
//             timer = setTimeout(() => {
//                 setLeadTime((prev) => prev + 1);
//                 setHighlight((prev) => ({ ...prev, leadTime: true }));
//                 setTimeout(() => setHighlight((prev) => ({ ...prev, leadTime: false })), 500);
//             }, 1000);
//         } else if (leadTime === 10 && !isStopped) {
//             setRotationStatus("In Progress");
//             setHighlight((prev) => ({ ...prev, rotationStatus: true }));
//             setTimeout(() => setHighlight((prev) => ({ ...prev, rotationStatus: false })), 500);
//             startCaptureDuration();
//         }
//         return () => clearTimeout(timer);
//     }, [leadTime, isStopped]);

//     useEffect(() => {
//         let timer;
//         if (captureDuration > 0 && captureDuration < 10 && !isStopped) {
//             timer = setTimeout(() => {
//                 setCaptureDuration((prev) => prev + 1);
//                 setHighlight((prev) => ({ ...prev, captureDuration: true }));
//                 setTimeout(() => setHighlight((prev) => ({ ...prev, captureDuration: false })), 500);
//             }, 1000);
//         } else if (captureDuration === 10 && !isStopped) {
//             setRotationStatus("Completed");
//             setHighlight((prev) => ({ ...prev, rotationStatus: true }));
//             setTimeout(() => setHighlight((prev) => ({ ...prev, rotationStatus: false })), 500);
//             startProgressBar();
//         }
//         return () => clearTimeout(timer);
//     }, [captureDuration, isStopped]);

//     const startLeadTime = () => {
//         if (isStopped) resetAll();
//         setLeadTime(1);
//     };

//     const startCaptureDuration = () => {
//         setCaptureDuration(1);
//     };

//     const startProgressBar = () => {
//         let progressValue = 0;
//         const interval = setInterval(() => {
//             if (isStopped) {
//                 clearInterval(interval);
//                 return;
//             }
//             progressValue += 10;
//             setProgress(progressValue);
//             if (progressValue === 100) {
//                 clearInterval(interval);
//                 setIsRotationComplete(true);
//                 setShowModal(true);
//             }
//         }, 500);
//     };

//     const stopProcess = () => {
//         setIsStopped(true);
//         resetAll();
//     };

//     return (
//         <>
//             {/* Row 1: Buttons */}
//             <Row className="mb-1 justify-content-end">
//                 <Col xs="auto" className="me-auto">
//                     <h5>Graph Plotting</h5>
//                 </Col>
//                 <Col xs="auto">
//                     <Button color="primary" onClick={() => console.log("Create Region")}>
//                         <FaPlus className="me-1" /> Create Region
//                     </Button>
//                 </Col>
//                 <Col xs="auto">
//                     <Button color="success" onClick={startLeadTime}>Start Master</Button>
//                 </Col>
//                 <Col xs="auto">
//                     <Button color="danger" onClick={stopProcess}>Stop</Button>
//                 </Col>
//             </Row>

//             {/* Row 2: Timers and Status */}
//             <Row className="mb-1 align-items-center justify-content-between">
//                 <Col xs="auto">
//                     <Label className="me-2">Lead Time:</Label>
//                     <span className={highlight.leadTime ? "text-primary fw-bold" : ""}>
//                         {leadTime === 0 ? "00:00:00" : `00:00:${leadTime.toString().padStart(2, "0")}`}
//                     </span>
//                 </Col>
//                 <Col xs="auto">
//                     <Label className="me-2">Rotation Status:</Label>
//                     <span className={highlight.rotationStatus ? "text-warning fw-bold" : ""}>{rotationStatus}</span>
//                 </Col>
//                 <Col xs="auto">
//                     {isRotationComplete ? (
//                         <>
//                             <Label className="me-2">Rotation Completed:</Label>
//                             <span>Yes</span>
//                         </>
//                     ) : (
//                         <>
//                             <Label className="me-2">Capture Duration:</Label>
//                             <span className={highlight.captureDuration ? "text-success fw-bold" : ""}>
//                                 {captureDuration === 0 ? "00:00:00" : `00:00:${captureDuration.toString().padStart(2, "0")}`}
//                             </span>
//                         </>
//                     )}
//                 </Col>
//             </Row>

//             {/* Progress Bar */}
//             <Row className="mb-1">
//                 <Col>
//                     <Progress value={progress}>{progress}%</Progress>
//                 </Col>
//             </Row>

//             {/* Modal */}
//             <Modal isOpen={showModal} toggle={resetAll}>
//                 <ModalHeader toggle={resetAll}>Completion</ModalHeader>
//                 <ModalBody>All steps are completed successfully!</ModalBody>
//                 <ModalFooter>
//                     <Button color="primary" onClick={resetAll}>Yes</Button>
//                     <Button color="secondary" onClick={resetAll}>No</Button>
//                 </ModalFooter>
//             </Modal>
//         </>
//     );
// };

const MasteringStatus = () => {
    const graphRef = useContext(GraphRefContext);
    // to receive data from socket
    const { socket, data } = useSocket();

    const { 
        componentDetails, settings, selectedSensor, 
        selectedKeys, rotationStatus, setRotationStatus,
        sensorConnected 
    } = useContext(AppContext);

    const { stopFunction, startFunction, sharedState } = useContext(MasteringContext);

    const { selectedMeasurement, selectedRegions, pointDataexist } = useContext(RegionsContext);

    const [leadTime, setLeadTime] = useState(settings.leadTime);
    const [startLeadTime, setStartLeadTime] = useState(false);

    const [captureDuration, setCaptureDuration] = useState(settings.timeDuration);
    const [startCaptureDuration, setStartCaptureDuration] = useState(false);

    const [inspectionType, setInspectionType] = useState(settings.inspectionType);
    const [rotationCount, setRotationCount] = useState(settings.numRotation);

    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [tooltipMsg, setTooltipMsg] = useState("");

    // local variable to find mastering is started or not
    const [masteringSTarted, setMasteringStarted] = useState(false);

    const [isCompletedMeasurement, setIsCompletedMeasurement] = useState(false);

    const [waitResponse, setWaitResponse] = useState({});
    
    // // rotation status, 0(not started), 1(in progress), 2(completed);
    // const [rotationStatus, setRotationStatus] = useState(0);

    const toggleTooltip = () => setTooltipOpen(!tooltipOpen);

    useEffect(() => {
        setLeadTime(settings.leadTime);
        setCaptureDuration(settings.timeDuration);
        setInspectionType(settings.inspectionType);
        setRotationCount(settings.numRotation);
    }, [settings]);

    // useEffect(() => {
    //     if (socket) {
    //         // Listen to specific events for this child
    //         socket.on('mastering_started', (payload) => {
    //             if(payload == 'true') {
    //                 setStartCaptureDuration(true);
    //                 setRotationStatus(1);
    //             }
    //         });

    //         return () => {
    //             // Cleanup the event listener
    //             socket.off('mastering_started');
    //         };
    //     }

    // }, [socket]);

    useEffect(() => {
        if (!sharedState.isMasterRunning) {
            socket.off('mastering_started');
        } else if (sharedState.isMasterRunning) {
            socket.on('mastering_started', handleMasteringStarted);
        }

        return () => {
            if (socket) {
                socket.off('mastering_started');
            }
        };
    }, [sharedState.isMasterRunning]);

    const handleMasteringStarted = (payload) => {
        console.log('___zzz___ mastering_started ', payload, sharedState)
        if(payload.sessionId === sharedState?.currentMasteringId) {
            setStartCaptureDuration(true);
            setRotationStatus(1);
            // setWaitResponse({ ...waitResponse, ["start_master"]: false });
        }
        // if (payload == 'true') {
        // }
    }

    useEffect(() => {
        if(rotationStatus == 0) {
            setStartLeadTime(false);
            setStartCaptureDuration(false);
            setMasteringStarted(false);
        }
    }, [rotationStatus]);

    useEffect(() => {
        if(selectedMeasurement?.mastering_status != "completed") {
            setIsCompletedMeasurement(false);
        } else {
            setIsCompletedMeasurement(true);
        }
    }, [selectedMeasurement])

    const handleAction = async (action, payload) => {
        try {
            // const payload = {}; // Customize this payload as required
            
            // // type used here for connecting sensors. 
            // const result = await executeSensorAction(selectedSensor.type, action, payload);
            // brand and model name used here for connecting sensors.
            const result = await executeSensorAction(`${selectedSensor.brand_name}_${selectedSensor.model_name}`, action, payload);
            // alert(`${action} successful: ${JSON.stringify(result)}`);
        } catch (error) {
            // alert(`Error executing ${action}: ${error.message}`);
        }
    };
    
    const createRegion = () => {
        
        if(graphRef?.current) {
            graphRef.current?.handleBoxSelect()
        }
        // // tool tip message while create button clicked and sensor not selected. not in use.
        // if(selectedKeys?.length == 2) {
        // }
        // else if(selectedKeys?.length == 1) {
        //     setTooltipMsg("Select measurement to create region");
        //     setTooltipOpen(true);
        //     setTimeout(() => setTooltipOpen(false), 2000); // Auto-hide tooltip
        // }
        // else {
        //     setTooltipMsg("Select sensor to create region");
        //     setTooltipOpen(true);
        //     setTimeout(() => setTooltipOpen(false), 2000); // Auto-hide tooltip
        // }
    }
    
    const startLeadTimeAndSocketEvent = () => {
        const value = selectedRegions?.find((region) => {
            if(region.measurement_type?.length < 1) {
                return region
            }
        })
        if(value) {
            Swal.fire({
                title: 'Measurement type Required',
                html: `Measurement type required for <strong>"${value.name}"</strong>. Select measurement type to continue.`,
                icon: 'warning',
                confirmButtonText: 'OK',
            })
            console.log('value306 ', value)
            return;
        };

        

        setMasteringStarted(true);
        setStartLeadTime(true);
        
        const newSessionId = uuidv4(); // Generate a unique session ID
        startFunction(newSessionId);
        socket.emit('start_mastering', { sessionId: newSessionId });
    }
    
    const startMasterProcess = (key) => {
        // setWaitResponse({ ...waitResponse, [key]: true });
        // setStartLeadTime(false);
        // time-based, rotation-based
        const payload = {
            '_id': componentDetails?._id,
            'mastering_type': inspectionType, 
            'capture_duration': captureDuration,
            'rotation_count': rotationCount,
            'newSessionId': sharedState?.currentMasteringId,
        }
        handleAction("start_master", payload);
    }
    
    const startPlottingProcess = () => {
        // setStartCaptureDuration(false);
        setRotationStatus(2);
        // // time-based, rotation-based
        // const payload = {
        //     '_id': componentDetails?._id,
        //     'mastering_type': inspectionType, 
        //     'capture_duration': captureDuration,
        //     'rotation_count': rotationCount,
        // }
        // handleAction("start_master", payload)
    }

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `00:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const leadTimeStyle = () => {
        return startLeadTime ?
        {
            fontSize: '18px', margin: 'auto'
        }
        : {}
    }

    const captureDurationStyle = () => {
        return startCaptureDuration ?
        {
            fontSize: '18px', margin: 'auto'
        }
        : {}
    }

    const stopMasterProcess = () => {
        if(waitResponse["start_master"]) {
            return;
        }
        setStartLeadTime(false);
        setLeadTime(settings.leadTime);

        if(startCaptureDuration) {
            handleAction("stop_capturing")
        }
        setStartCaptureDuration(false);
        setCaptureDuration(settings.timeDuration);
        
        // setRotationStatus(0);

        socket.emit('stop_mastering');
        stopFunction();

        setMasteringStarted(false);
    }

    return (
        <>
        {
            selectedKeys?.length ==  2 ?    
        <>
        
            {/* <Tooltip
                placement="top"
                isOpen={tooltipOpen}
                target="createRegionButton"
                toggle={toggleTooltip}
            >
                    <FaExclamationCircle color="red" className="me-2" />
                    <span>{tooltipMsg}</span>   
            </Tooltip> */}
            {/* Row 1: Buttons */}
            {/* {
                console.log('data376 ', sensorConnected?.status, isCompletedMeasurement)
            } */}
            {
                sensorConnected?.status && pointDataexist && !isCompletedMeasurement ?
                    <Row className="mb-1 justify-content-start">
                        <Col xs="auto">
                            <Button color="primary" onClick={createRegion} 
                                disabled={masteringSTarted || sharedState?.isCapturing}
                            >
                                <FaPlus className="me-1" /> Create Region
                                <span id="createRegionButton"></span>
                            </Button>
                        </Col>
                        {
                            selectedRegions?.length > 0 ?
                                <Col xs="auto">
                                    {
                                        !masteringSTarted ?
                                            <Button color="success" block 
                                                onClick={() => startLeadTimeAndSocketEvent()}
                                                disabled={sharedState?.isCapturing}
                                            >
                                                {
                                                    isCompletedMeasurement ?
                                                        `Start Re-Master`
                                                        : `Start Master`
                                                }

                                            </Button>
                                            :
                                            <Button 
                                                color="danger" 
                                                onClick={() => {
                                                    if(!waitResponse["start_master"]) {
                                                        stopMasterProcess()
                                                    }
                                                }}
                                                disabled={waitResponse["start_master"]}
                                            >
                                                Stop Mastering
                                            </Button>
                                    }
                                </Col>
                                : null
                        }
                    </Row>
                : null
            }
                        

            {/* Row 2: Timers and Status */}
            <Row className="mb-1 align-items-center justify-content-between">
                <Col xs="auto" className="d-flex flex-row">
                {
                    masteringSTarted ?
                    <>
                        <Label className="me-2" style={leadTimeStyle()}>Lead Time:</Label>
                        {
                            startLeadTime ?
                                <span className="fw-bold">
                                    <CountdownTimer
                                        hideDay={true}
                                        hideHours={false}
                                        count={leadTime}
                                        onEnd={() => { startMasterProcess("start_master") }}
                                    />
                                </span>
                                :
                                <span className="text-primary fw-bold">
                                    {formatTime(leadTime)}
                                </span>
                        }
                    </>
                    : null
                }
                    
                </Col>
                <Col xs="auto">
                    <Label className="me-2">Rotation Status:</Label>
                    {
                        rotationStatus == 0 ?
                        <span className="text-warning fw-bold">Not Started</span>
                        : rotationStatus == 1 ?
                        <span className="text-info fw-bold">In Progress</span>
                        : rotationStatus == 2 ?
                        <span className="text-success fw-bold">Completed</span>
                        : null

                    }
                </Col>
                <Col xs="auto" className="d-flex flex-row">
                {
                    masteringSTarted && startCaptureDuration ?
                    // inspectionType && inspectionType == "time-based" ? (
                        <>
                            <Label className="me-2" style={captureDurationStyle()}>Capture Duration:</Label>
                            {
                                startCaptureDuration ?
                                    <span className="fw-bold">
                                        <CountdownTimer
                                            hideDay={true}
                                            hideHours={false}
                                            count={captureDuration}
                                            onEnd={() => { startPlottingProcess() }}
                                        />
                                    </span>
                                    :
                                    <span className="text-success fw-bold">
                                        {formatTime(captureDuration)}
                                    </span>
                            }
                        </>
                    // ) : (
                    //     <>
                    //         <Label className="me-2">Rotation Completed:</Label>
                    //         <span>Yes</span>
                    //     </>
                    // )
                    : null
                }
                </Col>
            </Row>

            {/* Progress Bar */}
            {/* <Row className="mb-1">
                <Col>
                    <Progress value={50}>{50}%</Progress>
                </Col>
            </Row> */}
        </>
        :
        <>
            <div className="no-measurement-container">
                
                    <div className="no-measurement-message">
                        <h5>Select a Measurement from the Sensor</h5>
                        <p>to view the corresponding graph data.</p>
                    </div>
                
            </div>
        </>
        }
        </>
    )
};
  
  
export default MasteringStatus;


// 345