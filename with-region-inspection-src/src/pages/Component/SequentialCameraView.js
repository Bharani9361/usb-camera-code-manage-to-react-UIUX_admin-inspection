import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Card,
    CardBody,
    CardTitle,
    Row,
    Col,
    Button,
    Spinner,
    Badge
} from 'reactstrap';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import WebcamCapture from 'pages/WebcamCustom/WebcamCapture';
import { DEFAULT_RESOLUTION } from './cameraConfig';


const SequentialCameraView = ({
    activeCamera,
    onNext,
    compData,
    ref_img_path,
    getReferenceImageForCamera,
    showImage,
    zoom_value,
    show_outline,
    getCurrentOutlinePath,
    cameraDisconnected,
    showstatus,
    res_message,
    showresult,
    response_message,
    inspection_type,
    isCountdownActive,
    CountdownTimer,
    capture_duration,
    onTimeupCourse,
    webcamRef,
    canvasRef,
    show_region_webcam,
    currentStageIndex,
    totalStages,
    capturedCount,
    totalCaptures
}) => {
    if (!activeCamera) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
                fontSize: '18px',
                color: '#999'
            }}>
                No camera selected
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            maxWidth: '1200px',
            margin: '0 auto'
        }}>

            <Card
                style={{
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    borderRadius: '12px',
                    border: 'none'
                }}
            >
                <CardBody>
                    <CardTitle className="mb-3">
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '8px'
                        }}>
                            <span style={{ fontWeight: '600', color: '#495057', fontSize: '16px' }}>
                                <i className="mdi mdi-camera-outline me-2" />
                                {activeCamera.stageName}
                            </span>
                            <Button
                                color="primary"
                                size="sm"
                                onClick={onNext}
                                disabled={capturedCount < totalCaptures}
                                style={{
                                    borderRadius: '6px',
                                    fontWeight: '600'
                                }}
                            >
                                <i className="mdi mdi-skip-next me-1" />
                                Next Stage
                            </Button>
                        </div>
                    </CardTitle>

                    <Row>
                        <Col md={6} xs={12} className="mb-3 mb-md-0">
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#f5f5f5',
                                borderRadius: '8px',
                                textAlign: 'center',
                                marginBottom: '12px'
                            }}>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#333'
                                }}>
                                    REFERENCE IMAGE
                                </div>
                                <div style={{
                                    fontSize: '12px',
                                    color: '#666',
                                    marginTop: '4px'
                                }}>
                                    {activeCamera.label}
                                </div>
                            </div>

                            <div style={{
                                position: 'relative',
                                width: '100%',
                                paddingBottom: '75%',
                                backgroundColor: '#fafafa',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: '1px solid #e0e0e0'
                            }}>
                                {getReferenceImageForCamera && getReferenceImageForCamera(activeCamera.label, activeCamera.stageName, ref_img_path) ? (
                                    <img
                                        src={getReferenceImageForCamera(activeCamera.label, activeCamera.stageName, ref_img_path)}
                                        alt={`Reference for ${activeCamera.label}`}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#999',
                                        fontSize: '14px',
                                        flexDirection: 'column',
                                        gap: '8px'
                                    }}>
                                        <i className="mdi mdi-image-off" style={{ fontSize: '48px' }} />
                                        <span>No reference image</span>
                                    </div>
                                )}
                            </div>
                        </Col>

                        <Col md={6} xs={12}>
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#e3f2fd',
                                borderRadius: '8px',
                                textAlign: 'center',
                                marginBottom: '12px'
                            }}>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#1976d2'
                                }}>
                                    LIVE INSPECTION
                                </div>
                                <div style={{
                                    fontSize: '12px',
                                    color: '#666',
                                    marginTop: '4px'
                                }}>
                                    {activeCamera.label}
                                </div>
                            </div>

                            <div style={{
                                position: 'relative',
                                width: '100%',
                                paddingBottom: '75%',
                                backgroundColor: '#000',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: showresult && response_message && response_message[activeCamera.label]
                                    ? (response_message[activeCamera.label] === 'OK' ? '3px solid #52c41a'
                                        : response_message[activeCamera.label] === 'NG' ? '3px solid #ff4d4f'
                                            : '1px solid #e0e0e0')
                                    : '1px solid #e0e0e0'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%'
                                }}>
                                    {cameraDisconnected && cameraDisconnected[activeCamera.originalLabel] ? (
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            padding: '20px'
                                        }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <i className="mdi mdi-camera-off" style={{ fontSize: '64px', color: '#999', marginBottom: '16px' }} />
                                                <h5 style={{ fontWeight: '600', marginBottom: '16px', color: '#495057' }}>
                                                    Webcam Disconnected
                                                </h5>
                                                <Spinner color="primary" />
                                                <h6 style={{ fontWeight: '500', marginTop: '16px', color: '#6c757d' }}>
                                                    Please check your webcam connection...
                                                </h6>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {show_outline && getCurrentOutlinePath && getCurrentOutlinePath(activeCamera.originalLabel) && (
                                                <img
                                                    src={showImage(getCurrentOutlinePath(activeCamera.originalLabel))}
                                                    alt={`${activeCamera.label} Outline`}
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        zIndex: 2,
                                                        pointerEvents: 'none',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            )}

                                            <WebcamCapture
                                                ref={(el) => {
                                                    if (el && webcamRef && webcamRef.current) {
                                                        webcamRef.current[activeCamera.originalLabel] = el;
                                                    }
                                                }}
                                                resolution={DEFAULT_RESOLUTION}
                                                videoConstraints={{
                                                    width: DEFAULT_RESOLUTION.width,
                                                    height: DEFAULT_RESOLUTION.height,
                                                }}
                                                zoom={zoom_value?.zoom}
                                                center={zoom_value?.center}
                                                cameraLabel={activeCamera.originalLabel}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />

                                            {/* Canvas Overlay */}
                                            <canvas
                                                ref={(el) => {
                                                    if (el && canvasRef && canvasRef.current) {
                                                        canvasRef.current[activeCamera.label] = el;
                                                    }
                                                }}
                                                width={640}
                                                height={480}
                                                style={{
                                                    display: show_region_webcam ? 'block' : 'none',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    zIndex: 1,
                                                    pointerEvents: 'none'
                                                }}
                                            />

                                            {/* Center Overlay Content */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                zIndex: 4,
                                                textAlign: 'center',
                                                width: '90%'
                                            }}>
                                                {/* Status Messages */}
                                                {showstatus && res_message && res_message[activeCamera.label] && (
                                                    <div style={{
                                                        color:
                                                            res_message[activeCamera.label] === 'Object Detected' ? '#52c41a'
                                                                : res_message[activeCamera.label] === 'Barcode is correct' ? '#52c41a'
                                                                    : res_message[activeCamera.label] === 'No Object Detected' ? '#fadb14'
                                                                        : res_message[activeCamera.label] === 'Incorrect Object' ? '#ff4d4f'
                                                                            : res_message[activeCamera.label] === 'Barcode is incorrect' ? '#ff4d4f'
                                                                                : res_message[activeCamera.label] === 'Unable to read Barcode' ? '#ffffff'
                                                                                    : res_message[activeCamera.label] === 'Checking ...' ? '#fffb8f'
                                                                                        : '#ffffff',
                                                        fontSize: '18px',
                                                        fontWeight: 'bold',
                                                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                                                        marginBottom: '12px',
                                                        padding: '8px 16px',
                                                        backgroundColor: 'rgba(0,0,0,0.6)',
                                                        borderRadius: '6px',
                                                        display: 'inline-block'
                                                    }}>
                                                        {res_message[activeCamera.label]}
                                                    </div>
                                                )}

                                                {/* Result Icons */}
                                                {showresult && response_message && response_message[cactiveCameraamera.label] && (
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        gap: '12px'
                                                    }}>
                                                        {response_message[activeCamera.label] === 'OK' && (
                                                            <CheckCircleOutlined style={{
                                                                fontSize: '80px',
                                                                color: '#52c41a',
                                                                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
                                                            }} />
                                                        )}

                                                        {response_message[activeCamera.label] === 'NG' && (
                                                            <CloseCircleOutlined style={{
                                                                fontSize: '80px',
                                                                color: '#ff4d4f',
                                                                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
                                                            }} />
                                                        )}
                                                    </div>
                                                )}

                                                {/* Countdown Timer */}
                                                {inspection_type !== 'Manual' && isCountdownActive && CountdownTimer && (
                                                    <div style={{
                                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                        padding: '12px 20px',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                                        display: 'inline-block'
                                                    }}>
                                                        <CountdownTimer
                                                            backgroundColor="transparent"
                                                            hideDay={true}
                                                            hideHours={true}
                                                            count={capture_duration}
                                                            onEnd={() => onTimeupCourse()}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </div>
    );
};

// PropTypes validation
SequentialCameraView.propTypes = {
    activeCamera: PropTypes.shape({
        label: PropTypes.string,
        originalLabel: PropTypes.string,
        stageName: PropTypes.string
    }),
    onNext: PropTypes.func,
    compData: PropTypes.object,
    ref_img_path: PropTypes.string,
    getReferenceImageForCamera: PropTypes.func,
    showImage: PropTypes.func,
    zoom_value: PropTypes.shape({
        zoom: PropTypes.number,
        center: PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number
        })
    }),
    show_outline: PropTypes.bool,
    getCurrentOutlinePath: PropTypes.func,
    cameraDisconnected: PropTypes.object,
    showstatus: PropTypes.bool,
    res_message: PropTypes.object,
    showresult: PropTypes.bool,
    response_message: PropTypes.object,
    inspection_type: PropTypes.string,
    isCountdownActive: PropTypes.bool,
    CountdownTimer: PropTypes.elementType,
    capture_duration: PropTypes.number,
    onTimeupCourse: PropTypes.func,
    webcamRef: PropTypes.shape({
        current: PropTypes.object
    }),
    canvasRef: PropTypes.shape({
        current: PropTypes.object
    }),
    show_region_webcam: PropTypes.bool,
    currentStageIndex: PropTypes.number,
    totalStages: PropTypes.number,
    capturedCount: PropTypes.number,
    totalCaptures: PropTypes.number
};

// Default props
SequentialCameraView.defaultProps = {
    activeCamera: null,
    onNext: () => { },
    compData: {},
    ref_img_path: '',
    getReferenceImageForCamera: null,
    showImage: null,
    zoom_value: { zoom: 1, center: { x: 0, y: 0 } },
    show_outline: false,
    getCurrentOutlinePath: null,
    cameraDisconnected: {},
    showstatus: false,
    res_message: {},
    showresult: false,
    response_message: {},
    inspection_type: 'Manual',
    isCountdownActive: false,
    CountdownTimer: null,
    capture_duration: 0,
    onTimeupCourse: () => { },
    webcamRef: { current: {} },
    canvasRef: { current: {} },
    show_region_webcam: false,
    currentStageIndex: 0,
    totalStages: 1,
    capturedCount: 0,
    totalCaptures: 0
};

export default SequentialCameraView;



// import React, { useRef, useState, useEffect } from 'react';
// import {
//     Card,
//     CardBody,
//     CardTitle,
//     Row,
//     Col,
//     Button,
//     Spinner,
//     Badge
// } from 'reactstrap';
// import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
// import WebcamCapture from 'pages/WebcamCustom/WebcamCapture';
// import { DEFAULT_RESOLUTION } from './cameraConfig';

// const SequentialCameraView = ({
//     camera,
//     onNext,
//     compData,
//     ref_img_path,
//     getReferenceImageForCamera,
//     showImage,
//     zoom_value,
//     show_outline,
//     getCurrentOutlinePath,
//     cameraDisconnected,
//     showstatus,
//     res_message,
//     showresult,
//     response_message,
//     inspection_type,
//     isCountdownActive,
//     CountdownTimer,
//     capture_duration,
//     onTimeupCourse,
//     webcamRef,
//     canvasRef,
//     show_region_webcam,
//     currentStageIndex,
//     totalStages,
//     capturedCount,
//     totalCaptures
// }) => {
//     if (!camera) {
//         return (
//             <div style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 minHeight: '400px',
//                 fontSize: '18px',
//                 color: '#999'
//             }}>
//                 No camera selected
//             </div>
//         );
//     }

//     return (
//         <div style={{
//             display: 'flex',
//             flexDirection: 'column',
//             gap: '24px',
//             maxWidth: '1200px',
//             margin: '0 auto'
//         }}>
//             {/* Stage Progress Header */}
//             <Card style={{
//                 background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                 border: 'none',
//                 boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
//             }}>
//                 <CardBody className="py-3">
//                     <Row className="align-items-center">
//                         <Col xs={12} md={4}>
//                             <div style={{ color: '#fff' }}>
//                                 <div style={{ fontSize: '14px', opacity: 0.9 }}>Current Stage</div>
//                                 <div style={{ fontSize: '20px', fontWeight: '700' }}>
//                                     {camera.stageName || 'Stage'}
//                                 </div>
//                             </div>
//                         </Col>
//                         <Col xs={12} md={4} className="text-center">
//                             <Badge
//                                 pill
//                                 style={{
//                                     background: 'rgba(255,255,255,0.2)',
//                                     color: '#fff',
//                                     fontSize: '16px',
//                                     fontWeight: '600',
//                                     padding: '8px 20px'
//                                 }}
//                             >
//                                 Stage {currentStageIndex + 1} / {totalStages}
//                             </Badge>
//                         </Col>
//                         <Col xs={12} md={4} className="text-md-end">
//                             <Badge
//                                 pill
//                                 style={{
//                                     background: capturedCount >= totalCaptures ? '#10b981' : 'rgba(255,255,255,0.2)',
//                                     color: '#fff',
//                                     fontSize: '14px',
//                                     fontWeight: '600',
//                                     padding: '6px 16px'
//                                 }}
//                             >
//                                 <i className="mdi mdi-camera me-1" />
//                                 {capturedCount} / {totalCaptures} Captured
//                             </Badge>
//                         </Col>
//                     </Row>
//                 </CardBody>
//             </Card>

//             {/* Main Camera Card */}
//             <Card
//                 style={{
//                     boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
//                     borderRadius: '12px',
//                     border: 'none'
//                 }}
//             >
//                 <CardBody>
//                     <CardTitle className="mb-3">
//                         <div style={{
//                             display: 'flex',
//                             justifyContent: 'space-between',
//                             alignItems: 'center',
//                             padding: '12px',
//                             backgroundColor: '#f8f9fa',
//                             borderRadius: '8px'
//                         }}>
//                             <span style={{ fontWeight: '600', color: '#495057', fontSize: '16px' }}>
//                                 <i className="mdi mdi-camera-outline me-2" />
//                                 {camera.label}
//                             </span>
//                             <Button
//                                 color="primary"
//                                 size="sm"
//                                 onClick={onNext}
//                                 disabled={capturedCount < totalCaptures}
//                                 style={{
//                                     borderRadius: '6px',
//                                     fontWeight: '600'
//                                 }}
//                             >
//                                 <i className="mdi mdi-skip-next me-1" />
//                                 Next Stage
//                             </Button>
//                         </div>
//                     </CardTitle>

//                     <Row>
//                         {/* Reference Image Column */}
//                         <Col md={6} xs={12} className="mb-3 mb-md-0">
//                             <div style={{
//                                 padding: '12px',
//                                 backgroundColor: '#f5f5f5',
//                                 borderRadius: '8px',
//                                 textAlign: 'center',
//                                 marginBottom: '12px'
//                             }}>
//                                 <div style={{
//                                     fontSize: '14px',
//                                     fontWeight: '600',
//                                     color: '#333'
//                                 }}>
//                                     REFERENCE IMAGE
//                                 </div>
//                                 <div style={{
//                                     fontSize: '12px',
//                                     color: '#666',
//                                     marginTop: '4px'
//                                 }}>
//                                     {camera.label}
//                                 </div>
//                             </div>

//                             <div style={{
//                                 position: 'relative',
//                                 width: '100%',
//                                 paddingBottom: '75%',
//                                 backgroundColor: '#fafafa',
//                                 borderRadius: '8px',
//                                 overflow: 'hidden',
//                                 border: '1px solid #e0e0e0'
//                             }}>
//                                 {getReferenceImageForCamera && getReferenceImageForCamera(camera.label, camera.stageName, ref_img_path) ? (
//                                     <img
//                                         src={getReferenceImageForCamera(camera.label, camera.stageName, ref_img_path)}
//                                         alt={`Reference for ${camera.label}`}
//                                         style={{
//                                             position: 'absolute',
//                                             top: 0,
//                                             left: 0,
//                                             width: '100%',
//                                             height: '100%',
//                                             objectFit: 'cover'
//                                         }}
//                                     />
//                                 ) : (
//                                     <div style={{
//                                         position: 'absolute',
//                                         top: 0,
//                                         left: 0,
//                                         width: '100%',
//                                         height: '100%',
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         justifyContent: 'center',
//                                         color: '#999',
//                                         fontSize: '14px',
//                                         flexDirection: 'column',
//                                         gap: '8px'
//                                     }}>
//                                         <i className="mdi mdi-image-off" style={{ fontSize: '48px' }} />
//                                         <span>No reference image</span>
//                                     </div>
//                                 )}
//                             </div>
//                         </Col>

//                         {/* Live Inspection Column */}
//                         <Col md={6} xs={12}>
//                             <div style={{
//                                 padding: '12px',
//                                 backgroundColor: '#e3f2fd',
//                                 borderRadius: '8px',
//                                 textAlign: 'center',
//                                 marginBottom: '12px'
//                             }}>
//                                 <div style={{
//                                     fontSize: '14px',
//                                     fontWeight: '600',
//                                     color: '#1976d2'
//                                 }}>
//                                     LIVE INSPECTION
//                                 </div>
//                                 <div style={{
//                                     fontSize: '12px',
//                                     color: '#666',
//                                     marginTop: '4px'
//                                 }}>
//                                     {camera.label}
//                                 </div>
//                             </div>

//                             {/* Camera Container */}
//                             <div style={{
//                                 position: 'relative',
//                                 width: '100%',
//                                 paddingBottom: '75%',
//                                 backgroundColor: '#000',
//                                 borderRadius: '8px',
//                                 overflow: 'hidden',
//                                 border: showresult && response_message && response_message[camera.label]
//                                     ? (response_message[camera.label] === 'OK' ? '3px solid #52c41a'
//                                         : response_message[camera.label] === 'NG' ? '3px solid #ff4d4f'
//                                             : '1px solid #e0e0e0')
//                                     : '1px solid #e0e0e0'
//                             }}>
//                                 <div style={{
//                                     position: 'absolute',
//                                     top: 0,
//                                     left: 0,
//                                     width: '100%',
//                                     height: '100%'
//                                 }}>
//                                     {cameraDisconnected && cameraDisconnected[camera.originalLabel] ? (
//                                         <div style={{
//                                             width: '100%',
//                                             height: '100%',
//                                             display: 'flex',
//                                             alignItems: 'center',
//                                             justifyContent: 'center',
//                                             backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                                             padding: '20px'
//                                         }}>
//                                             <div style={{ textAlign: 'center' }}>
//                                                 <i className="mdi mdi-camera-off" style={{ fontSize: '64px', color: '#999', marginBottom: '16px' }} />
//                                                 <h5 style={{ fontWeight: '600', marginBottom: '16px', color: '#495057' }}>
//                                                     Webcam Disconnected
//                                                 </h5>
//                                                 <Spinner color="primary" />
//                                                 <h6 style={{ fontWeight: '500', marginTop: '16px', color: '#6c757d' }}>
//                                                     Please check your webcam connection...
//                                                 </h6>
//                                             </div>
//                                         </div>
//                                     ) : (
//                                         <>
//                                             {/* Outline Overlay */}
//                                             {show_outline && getCurrentOutlinePath && getCurrentOutlinePath(camera.originalLabel) && (
//                                                 <img
//                                                     src={showImage(getCurrentOutlinePath(camera.originalLabel))}
//                                                     alt={`${camera.label} Outline`}
//                                                     style={{
//                                                         position: 'absolute',
//                                                         top: 0,
//                                                         left: 0,
//                                                         width: '100%',
//                                                         height: '100%',
//                                                         zIndex: 2,
//                                                         pointerEvents: 'none',
//                                                         objectFit: 'cover'
//                                                     }}
//                                                 />
//                                             )}

//                                             {/* Webcam Component */}
//                                             <WebcamCapture
//                                                 ref={(el) => {
//                                                     if (el && webcamRef && webcamRef.current) {
//                                                         webcamRef.current[camera.originalLabel] = el;
//                                                     }
//                                                 }}
//                                                 resolution={DEFAULT_RESOLUTION}
//                                                 zoom={zoom_value?.zoom}
//                                                 center={zoom_value?.center}
//                                                 cameraLabel={camera.originalLabel}
//                                                 style={{
//                                                     position: 'absolute',
//                                                     top: 0,
//                                                     left: 0,
//                                                     width: '100%',
//                                                     height: '100%',
//                                                     objectFit: 'cover'
//                                                 }}
//                                             />

//                                             {/* Canvas Overlay */}
//                                             <canvas
//                                                 ref={(el) => {
//                                                     if (el && canvasRef && canvasRef.current) {
//                                                         canvasRef.current[camera.label] = el;
//                                                     }
//                                                 }}
//                                                 width={640}
//                                                 height={480}
//                                                 style={{
//                                                     display: show_region_webcam ? 'block' : 'none',
//                                                     position: 'absolute',
//                                                     top: 0,
//                                                     left: 0,
//                                                     width: '100%',
//                                                     height: '100%',
//                                                     zIndex: 1,
//                                                     pointerEvents: 'none'
//                                                 }}
//                                             />

//                                             {/* Center Overlay Content */}
//                                             <div style={{
//                                                 position: 'absolute',
//                                                 top: '50%',
//                                                 left: '50%',
//                                                 transform: 'translate(-50%, -50%)',
//                                                 zIndex: 4,
//                                                 textAlign: 'center',
//                                                 width: '90%'
//                                             }}>
//                                                 {/* Status Messages */}
//                                                 {showstatus && res_message && res_message[camera.label] && (
//                                                     <div style={{
//                                                         color:
//                                                             res_message[camera.label] === 'Object Detected' ? '#52c41a'
//                                                                 : res_message[camera.label] === 'Barcode is correct' ? '#52c41a'
//                                                                     : res_message[camera.label] === 'No Object Detected' ? '#fadb14'
//                                                                         : res_message[camera.label] === 'Incorrect Object' ? '#ff4d4f'
//                                                                             : res_message[camera.label] === 'Barcode is incorrect' ? '#ff4d4f'
//                                                                                 : res_message[camera.label] === 'Unable to read Barcode' ? '#ffffff'
//                                                                                     : res_message[camera.label] === 'Checking ...' ? '#fffb8f'
//                                                                                         : '#ffffff',
//                                                         fontSize: '18px',
//                                                         fontWeight: 'bold',
//                                                         textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
//                                                         marginBottom: '12px',
//                                                         padding: '8px 16px',
//                                                         backgroundColor: 'rgba(0,0,0,0.6)',
//                                                         borderRadius: '6px',
//                                                         display: 'inline-block'
//                                                     }}>
//                                                         {res_message[camera.label]}
//                                                     </div>
//                                                 )}

//                                                 {/* Result Icons */}
//                                                 {showresult && response_message && response_message[camera.label] && (
//                                                     <div style={{
//                                                         display: 'flex',
//                                                         flexDirection: 'column',
//                                                         alignItems: 'center',
//                                                         gap: '12px'
//                                                     }}>
//                                                         {response_message[camera.label] === 'OK' && (
//                                                             <CheckCircleOutlined style={{
//                                                                 fontSize: '80px',
//                                                                 color: '#52c41a',
//                                                                 filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
//                                                             }} />
//                                                         )}

//                                                         {response_message[camera.label] === 'NG' && (
//                                                             <CloseCircleOutlined style={{
//                                                                 fontSize: '80px',
//                                                                 color: '#ff4d4f',
//                                                                 filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
//                                                             }} />
//                                                         )}
//                                                     </div>
//                                                 )}

//                                                 {/* Countdown Timer */}
//                                                 {inspection_type !== 'Manual' && isCountdownActive && CountdownTimer && (
//                                                     <div style={{
//                                                         backgroundColor: 'rgba(255, 255, 255, 0.95)',
//                                                         padding: '12px 20px',
//                                                         borderRadius: '8px',
//                                                         boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
//                                                         display: 'inline-block'
//                                                     }}>
//                                                         <CountdownTimer
//                                                             backgroundColor="transparent"
//                                                             hideDay={true}
//                                                             hideHours={true}
//                                                             count={capture_duration}
//                                                             onEnd={() => onTimeupCourse()}
//                                                         />
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         </>
//                                     )}
//                                 </div>
//                             </div>
//                         </Col>
//                     </Row>
//                 </CardBody>
//             </Card>
//         </div>
//     );
// };

// export default SequentialCameraView;