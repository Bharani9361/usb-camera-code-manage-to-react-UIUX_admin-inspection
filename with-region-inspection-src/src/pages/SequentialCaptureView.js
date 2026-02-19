import React, { useEffect, useState } from 'react';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import WebcamCapture from './WebcamCustom/WebcamCapture';
import {
    Card, Col, Container, Row, CardBody, CardTitle,
    Label, Button, Table, Nav, NavItem, NavLink,
    TabContent, TabPane, Modal, FormGroup, Spinner,
    Input
} from "reactstrap";
import PropTypes from 'prop-types';



// Add this CSS for smooth transitions
const carouselStyles = `
  .camera-carousel-container {
    position: relative;
    width: 100%;
    overflow: hidden;
  }
  
  .camera-slide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
    opacity: 0;
    transform: translateX(100%);
    pointer-events: none;
  }
  
  .camera-slide.active {
    opacity: 1;
    transform: translateX(0);
    pointer-events: auto;
    position: relative;
  }
  
  .camera-slide.prev {
    transform: translateX(-100%);
    opacity: 0;
  }
  
  .image-preload {
    position: absolute;
    opacity: 0;
    pointer-events: none;
    width: 1px;
    height: 1px;
  }
`;

// Preload component for images
const ImagePreloader = ({ images }) => {
    return (
        <div className="image-preload">
            {images.map((src, idx) => (
                src && <img key={idx} src={src} alt="" />
            ))}
        </div>
    );
};
ImagePreloader.propTypes = {
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
};

// Your main component with props
const SequentialCaptureView = ({
    compData,
    cameraList,
    activeCamera,
    currentStageIndex,
    currentStageIndexforButton,
    ref_img_path,
    getReferenceImageForCamera,
    handlePreviousStage,
    handleNextStageAndInspect,
    handleNextComponent,
    showresult,
    response_message,
    cameraDisconnected,
    show_outline,
    getCurrentOutlinePath,
    showImage,
    webcamRef,
    DEFAULT_RESOLUTION,
    zoom_value,
    canvasRef,
    showstatus,
    res_message,
    inspection_type,
    isCountdownActive,
    CountdownTimer,
    capture_duration,
    onTimeupCourse,
    images

}) => {
    const [preloadedImages, setPreloadedImages] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [transitionClass, setTransitionClass] = useState('');


    // Preload all reference images on mount
    useEffect(() => {
        if (!cameraList || cameraList.length === 0) return;

        const imagesToPreload = cameraList.map(camera =>
            getReferenceImageForCamera?.(camera.label, camera.stageName, ref_img_path)
        ).filter(Boolean);

        setPreloadedImages(imagesToPreload);

        // Preload images
        const loadImages = async () => {
            const promises = imagesToPreload.map(src => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => resolve(true);
                    img.onerror = () => resolve(false);
                    img.src = src;
                });
            });

            await Promise.all(promises);
            setIsDataLoaded(true);
        };

        loadImages();
    }, [cameraList, ref_img_path, getReferenceImageForCamera]);

    // Enhanced stage navigation with smooth transition
    const handleNextStageSmooth = () => {
        setTransitionClass('prev');
        setTimeout(() => {
            handleNextStageAndInspect();
            setTransitionClass('');
        }, 500);
    };

    const handlePreviousStageSmooth = () => {
        setTransitionClass('next');
        setTimeout(() => {
            handlePreviousStage();
            setTransitionClass('');
        }, 500);
    };

    return (
        <>
            <style>{carouselStyles}</style>

            {/* Preload images */}
            <ImagePreloader images={preloadedImages} />

            {compData?.capture_mode === 'Sequential' && (
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontWeight: '600', color: '#495057', fontSize: '16px' }}>
                                            <i className="mdi mdi-camera-outline me-2" />
                                            {activeCamera?.stageName}
                                        </span>
                                        <span style={{
                                            backgroundColor: '#007bff',
                                            color: '#ffffff',
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '14px',
                                            fontWeight: '600'
                                        }}>
                                            {currentStageIndexforButton}/{cameraList.length}
                                        </span>
                                        {!isDataLoaded && (
                                            <span style={{
                                                fontSize: '12px',
                                                color: '#666',
                                                fontStyle: 'italic'
                                            }}>
                                                Loading...
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Button
                                            color="secondary"
                                            size="sm"
                                            onClick={handlePreviousStageSmooth}
                                            disabled={currentStageIndex === 0}
                                            style={{
                                                borderRadius: '6px',
                                                fontWeight: '600'
                                            }}
                                        >
                                            <i className="mdi mdi-skip-previous me-1" />
                                            Previous Stage
                                        </Button>

                                        {currentStageIndexforButton === cameraList.length ? (
                                            <Button
                                                color="success"
                                                size="sm"
                                                onClick={handleNextComponent}
                                                style={{
                                                    borderRadius: '6px',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                <i className="mdi mdi-package-variant me-1" />
                                                Next Component
                                            </Button>
                                        ) : (
                                            <Button
                                                color="primary"
                                                size="sm"
                                                onClick={handleNextStageSmooth}
                                                style={{
                                                    borderRadius: '6px',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                <i className="mdi mdi-skip-next me-1" />
                                                Next Stage
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardTitle>

                            <Row>
                                {/* Reference Image Column */}
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
                                            {activeCamera?.label}
                                        </div>
                                    </div>

                                    <div className="camera-carousel-container" style={{
                                        position: 'relative',
                                        width: '100%',
                                        paddingBottom: '75%',
                                        backgroundColor: '#fafafa',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        border: '1px solid #e0e0e0'
                                    }}>
                                        {cameraList.map((camera, index) => {
                                            const refImage = getReferenceImageForCamera(camera.label, camera.stageName, ref_img_path);
                                            const isActive = index === currentStageIndex;

                                            return (
                                                <div
                                                    key={camera.label}
                                                    className={`camera-slide ${isActive ? 'active' : transitionClass}`}
                                                    style={{
                                                        position: isActive ? 'relative' : 'absolute',
                                                        width: '100%',
                                                        height: isActive ? 'auto' : '100%',
                                                        paddingBottom: isActive ? '75%' : '0'
                                                    }}
                                                >
                                                    {refImage ? (
                                                        <img
                                                            src={refImage}
                                                            alt={`Reference for ${camera.label}`}
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
                                            );
                                        })}
                                    </div>
                                </Col>

                                {/* Live Inspection Column */}
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
                                            {activeCamera?.label}
                                        </div>
                                    </div>

                                    <div className="camera-carousel-container" style={{
                                        position: 'relative',
                                        width: '100%',
                                        paddingBottom: '75%',
                                        backgroundColor: '#000',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        border: showresult && response_message && response_message[activeCamera?.label]
                                            ? (response_message[activeCamera?.label] === 'OK' ? '3px solid #52c41a'
                                                : response_message[activeCamera?.label] === 'NG' ? '3px solid #ff4d4f'
                                                    : '1px solid #e0e0e0')
                                            : '1px solid #e0e0e0'
                                    }}>
                                        {/* Render all webcams but show only active one */}
                                        {cameraList.map((camera, index) => {
                                            const isActive = index === currentStageIndex;

                                            return (
                                                <div
                                                    key={camera.originalLabel}
                                                    className={`camera-slide ${isActive ? 'active' : transitionClass}`}
                                                    style={{
                                                        position: isActive ? 'relative' : 'absolute',
                                                        width: '100%',
                                                        height: isActive ? 'auto' : '100%',
                                                        paddingBottom: isActive ? '75%' : '0'
                                                    }}
                                                >
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        width: '100%',
                                                        height: '100%'
                                                    }}>
                                                        {cameraDisconnected && cameraDisconnected[camera.originalLabel] ? (
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
                                                                {/* Outline overlay */}
                                                                {isActive && show_outline && getCurrentOutlinePath && getCurrentOutlinePath(camera.originalLabel) && (
                                                                    <img
                                                                        src={showImage(getCurrentOutlinePath(camera.originalLabel))}
                                                                        alt={`${camera.label} Outline`}
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

                                                                {/* Webcam - keep all mounted for smooth switching */}
                                                                <WebcamCapture
                                                                    ref={(el) => {
                                                                        if (el && webcamRef && webcamRef.current) {
                                                                            webcamRef.current[camera.originalLabel] = el;
                                                                        }
                                                                    }}
                                                                    resolution={DEFAULT_RESOLUTION}
                                                                    videoConstraints={{
                                                                        width: DEFAULT_RESOLUTION.width,
                                                                        height: DEFAULT_RESOLUTION.height,
                                                                    }}
                                                                    zoom={zoom_value?.zoom}
                                                                    center={zoom_value?.center}
                                                                    cameraLabel={camera.originalLabel}
                                                                    style={{
                                                                        position: 'absolute',
                                                                        top: 0,
                                                                        left: 0,
                                                                        width: '100%',
                                                                        height: '100%',
                                                                        objectFit: 'cover',
                                                                        visibility: isActive ? 'visible' : 'hidden'
                                                                    }}
                                                                />

                                                                {/* Canvas Overlay */}
                                                                {isActive && (
                                                                    <canvas
                                                                        ref={(el) => {
                                                                            if (el && canvasRef && canvasRef.current) {
                                                                                canvasRef.current[camera.label] = el;
                                                                            }
                                                                        }}
                                                                        width={640}
                                                                        height={480}
                                                                        style={{
                                                                            position: 'absolute',
                                                                            top: 0,
                                                                            left: 0,
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            zIndex: 1,
                                                                            pointerEvents: 'none'
                                                                        }}
                                                                    />
                                                                )}

                                                                {/* Status overlays - only show for active camera */}
                                                                {isActive && (
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
                                                                        {showstatus && res_message && res_message[camera.label] && (
                                                                            <div style={{
                                                                                color:
                                                                                    res_message[camera.label] === 'Object Detected' ? '#52c41a'
                                                                                        : res_message[camera.label] === 'Barcode is correct' ? '#52c41a'
                                                                                            : res_message[camera.label] === 'No Object Detected' ? '#fadb14'
                                                                                                : res_message[camera.label] === 'Incorrect Object' ? '#ff4d4f'
                                                                                                    : res_message[camera.label] === 'Barcode is incorrect' ? '#ff4d4f'
                                                                                                        : res_message[camera.label] === 'Unable to read Barcode' ? '#ffffff'
                                                                                                            : res_message[camera.label] === 'Checking ...' ? '#fffb8f'
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
                                                                                {res_message[camera.label]}
                                                                            </div>
                                                                        )}

                                                                        {/* Result Icons */}
                                                                        {showresult && response_message && response_message[camera.label] && (
                                                                            <div style={{
                                                                                display: 'flex',
                                                                                flexDirection: 'column',
                                                                                alignItems: 'center',
                                                                                gap: '12px'
                                                                            }}>
                                                                                {response_message[camera.label] === 'OK' && (
                                                                                    <CheckCircleOutlined style={{
                                                                                        fontSize: '80px',
                                                                                        color: '#52c41a',
                                                                                        filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
                                                                                    }} />
                                                                                )}

                                                                                {response_message[camera.label] === 'NG' && (
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
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </div>
            )}
        </>
    );
};
SequentialCaptureView.propTypes = {
    // images: PropTypes.array,

    images: PropTypes.array.isRequired,
    compData: PropTypes.object,
    cameraList: PropTypes.array,
    activeCamera: PropTypes.object,
    currentStageIndex: PropTypes.number,
    currentStageIndexforButton: PropTypes.number,
    ref_img_path: PropTypes.string,
    getReferenceImageForCamera: PropTypes.func,
    handlePreviousStage: PropTypes.func,
    handleNextStageAndInspect: PropTypes.func,
    handleNextComponent: PropTypes.func,
    showresult: PropTypes.bool,
    response_message: PropTypes.string,
    cameraDisconnected: PropTypes.bool,
    show_outline: PropTypes.bool,
    getCurrentOutlinePath: PropTypes.func,
    showImage: PropTypes.bool,
    webcamRef: PropTypes.object,
    DEFAULT_RESOLUTION: PropTypes.object,
    zoom_value: PropTypes.shape({
        zoom: PropTypes.number,
        center: PropTypes.object
    }),
    canvasRef: PropTypes.object,
    showstatus: PropTypes.bool,
    res_message: PropTypes.string,
    inspection_type: PropTypes.string,
    isCountdownActive: PropTypes.bool,
    CountdownTimer: PropTypes.node,
    capture_duration: PropTypes.number,
    onTimeupCourse: PropTypes.func,
};



export default SequentialCaptureView;