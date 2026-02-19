import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { Container, Button, Col, Row, Card, CardBody, Input } from 'reactstrap';
import MetaTags from 'react-meta-tags';
import urlSocket from './urlSocket';
import SweetAlert from 'react-bootstrap-sweetalert';
import './index.css';
import PropTypes from 'prop-types';
import WebcamCapture from '../WebcamCustom/WebcamCapture';
import StageCameraGallery from './Profile_non_multi_gallery';
import { ImageUrl, outlineUrl } from "./imageUrl";




const CustomToast = ({ message, type, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        isVisible && (
            <div
                className={`toast ${type === 'error' ? 'toast-error' : 'toast-success'
                    } show`}
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    maxWidth: '350px',
                    zIndex: '9999',
                    borderRadius: '8px',
                    padding: '15px 20px',
                    backgroundColor: type === 'error' ? '#ef4444' : '#10b981',
                    color: 'white',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    opacity: 0.95,
                    transition: 'opacity 0.3s ease-in-out',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    border: '1px solid',
                    borderColor: type === 'error' ? '#dc2626' : '#059669'
                }}
            >
                <span>{message}</span>
                <button
                    onClick={() => {
                        setIsVisible(false);
                        onClose();
                    }}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontSize: '20px',
                        cursor: 'pointer',
                        marginLeft: 'auto',
                        padding: '0 5px'
                    }}
                >
                    ×
                </button>
            </div>
        )
    );
};

CustomToast.propTypes = {
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error']).isRequired,
    onClose: PropTypes.func.isRequired
};

const Profile_non_multi = () => {
    const location = useLocation();
    const history = useHistory();
    const { datas } = location.state || {};
    console.log('multistagedatas', datas);
    const stages = datas?.stages || [];
    console.log('stages', stages);

    const [cameraStreams, setCameraStreams] = useState({});
    const [alert, setAlert] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);
    const [toastType, setToastType] = useState(null);
    const [showGallery, setShowGallery] = useState(false);
    const webcamRefs = useRef({});
    const [isCapturingAll, setIsCapturingAll] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [captureProgress, setCaptureProgress] = useState({});
    const [captureCount, setCaptureCount] = useState(parseInt(datas?.capture_count));
    const [selectedOutlineColor, setSelectedOutlineColor] = useState('White Outline');
    const [showOutline, setShowOutline] = useState(true);

    const isCameraTrainingCompleted = (camera) => {
        return camera?.training_status?.toLowerCase() === 'admin approved trained model';
    };

    useEffect(() => {
        if (stages?.length > 0) {
            const init = {};
            stages.forEach(stage => {
                stage.camera_selection.cameras.forEach(camera => {
                    if (isCameraTrainingCompleted(camera)) {
                        init[`${stage.stage_name}_${camera.label}`] = 0;
                    }
                });
            });
            setCaptureProgress(init);
        }
    }, [stages]);

    useEffect(() => {
        const fetchExistingCounts = async () => {
            try {
                const response = await urlSocket.post('/profile_creation_image_count', {
                    comp_id: datas.comp_id,
                    comp_code: datas.comp_code,
                    comp_name: datas.comp_name
                });

                const counts = response.data.counts || [];
                const countMap = {};

                counts.forEach(item => {
                    const key = `${item.stage_name}_${item.camera_label}`;
                    countMap[key] = item.capture_count || 0;
                });

                setCaptureProgress(prev => ({ ...prev, ...countMap }));
                console.log('📸 Loaded existing capture counts:', countMap);
            } catch (err) {
                console.error('❌ Failed to fetch camera counts:', err);
            }
        };

        if (datas?.comp_id && stages?.length > 0) {
            fetchExistingCounts();
        }
    }, [datas, stages]);

    useEffect(() => {
        let activeStreams = {};

        async function setupAllStages() {
            Object.values(cameraStreams).forEach(streams =>
                streams.forEach(s => s?.getTracks()?.forEach(t => t.stop()))
            );

            await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            const devices = await navigator.mediaDevices.enumerateDevices();
            console.log('Available devices:', devices);

            const allStreams = {};

            for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
                const stage = stages[stageIndex];
                const cameras = stage?.camera_selection?.cameras || [];
                allStreams[stageIndex] = [];

                for (let cam of cameras) {
                    if (!isCameraTrainingCompleted(cam)) {
                        allStreams[stageIndex].push(null);
                        continue;
                    }

                    try {
                        const videoDevice = devices.find(d => {
                            if (d.kind !== 'videoinput') return false;
                            const label = d.label?.toLowerCase() || '';
                            const matchByLabel =
                                cam.originalLabel &&
                                label.includes(cam.originalLabel.toLowerCase());
                            const matchByVID =
                                cam.v_id && label.includes(cam.v_id.toLowerCase());
                            const matchByPID =
                                cam.p_id && label.includes(cam.p_id.toLowerCase());
                            return matchByLabel || matchByVID || matchByPID;
                        });

                        console.log(`Matched device for ${cam.label}:`, videoDevice);

                        const stream = videoDevice
                            ? await navigator.mediaDevices.getUserMedia({
                                video: { deviceId: { exact: videoDevice.deviceId } },
                                audio: false
                            })
                            : null;

                        allStreams[stageIndex].push(stream);
                    } catch (err) {
                        console.error(`Error accessing ${cam.label}:`, err);
                        allStreams[stageIndex].push(null);
                    }
                }
            }

            activeStreams = allStreams;
            setCameraStreams(allStreams);
            validateMissingPreviews(allStreams);
        }

        setupAllStages();

        return () => {
            Object.values(activeStreams).forEach(streams =>
                streams.forEach(s => s && s.getTracks().forEach(t => t.stop()))
            );
        };
    }, [stages]);

    const validateMissingPreviews = streamsByStage => {
        const messages = [];

        Object.entries(streamsByStage).forEach(([stageIndex, streams]) => {
            const stage = stages[stageIndex];
            const cameras = stage?.camera_selection?.cameras || [];

            const missingCameras = streams
                .map((stream, i) => {
                    const camera = cameras[i];
                    if (isCameraTrainingCompleted(camera) && stream === null) {
                        return camera?.label;
                    }
                    return null;
                })
                .filter(Boolean);

            if (missingCameras.length > 0) {
                messages.push(
                    `Camera preview missing in ${stage.stage_name} -> ${missingCameras.join(', ')}`
                );
            }
        });

        if (messages.length > 0) {
            const formattedMessage = messages.map(msg => <div key={msg}>{msg}</div>);
            setToastMessage(formattedMessage);
            setToastType('error');
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            Object.keys(cameraStreams).forEach(stageIndex => {
                cameraStreams[stageIndex].forEach((stream, camIndex) => {
                    const video = webcamRefs.current[camIndex];
                    if (video && stream && video.srcObject !== stream) {
                        video.srcObject = stream;
                    }
                });
            });
        }, 400);
        return () => clearTimeout(timer);
    }, [cameraStreams]);

    const back = () => history.goBack();

    const handleCaptureAll = async () => {
        try {
            setIsCapturingAll(true);
            const invalidCameras = [];
            const capturedImages = [];
            const stageLimit = datas.capture_count;

            for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
                const stage = stages[stageIndex];
                const cameras = stage?.camera_selection?.cameras || [];

                for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
                    const camera = cameras[camIndex];

                    if (!isCameraTrainingCompleted(camera)) {
                        continue;
                    }

                    const key = `${stage.stage_name}_${camera.label}`;
                    const currentCount = captureProgress[key] || 0;

                    if (currentCount >= stageLimit) {
                        invalidCameras.push(
                            `⚠️ Capture limit (${stageLimit}) reached for ${camera.label}`
                        );
                        continue;
                    }

                    const webcamInstance = webcamRefs.current[camera.originalLabel];
                    if (
                        !webcamInstance ||
                        !webcamInstance.captureZoomedImage ||
                        webcamInstance.cameraDisconnected
                    ) {
                        invalidCameras.push(
                            `🚫 Camera disconnected: ${camera.label} (${stage.stage_name})`
                        );
                        continue;
                    }

                    const base64Image = webcamInstance.captureZoomedImage();

                    if (base64Image) {
                        capturedImages.push({
                            stage_index: stageIndex,
                            comp_name: datas.comp_name,
                            comp_code: datas.comp_code,
                            comp_id: datas.comp_id,
                            stage_name: stage.stage_name,
                            stage_code: stage.stage_code,
                            camera_label: camera.label || `Camera ${camIndex + 1}`,
                            camera_id: camera.v_id,
                            timestamp: new Date().toISOString(),
                            image: base64Image,
                            capture_count: currentCount
                        });
                    } else {
                        invalidCameras.push(
                            `⚠️ Failed to capture image from ${camera.label}`
                        );
                    }
                }
            }

            if (invalidCameras.length > 0) {
                setToastMessage(invalidCameras.join('\n'));
                setToastType('warning');
            }

            if (capturedImages.length > 0) {
                await sendCapturedImages(capturedImages);

                const newProgress = { ...captureProgress };
                capturedImages.forEach(img => {
                    const key = `${img.stage_name}_${img.camera_label}`;
                    newProgress[key] = (newProgress[key] || 0) + 1;
                });
                setCaptureProgress(newProgress);

                setToastMessage(
                    `${capturedImages.length} image(s) captured and saved successfully.`
                );
                setToastType('success');
                setRefreshKey(prev => prev + 1);
            } else if (invalidCameras.length === 0) {
                setToastMessage('⚠️ No images captured. Please check your cameras.');
                setToastType('error');
            }
        } catch (error) {
            console.error('❌ Error capturing images:', error);
            setToastMessage('Failed to capture images. Please try again.');
            setToastType('error');
        } finally {
            setIsCapturingAll(false);
        }
    };

    const sendCapturedImages = async capturedImages => {
        try {
            const response = await urlSocket.post('/profile_save_stage_camera_images', {
                capturedImages
            });
            console.log('responsemulti', response);
            console.log('✅ Server response:', response.data);
        } catch (err) {
            console.error('❌ Error sending captured images:', err);
        }
    };

    const handleStageCameraSync = async () => {
        try {
            setIsSyncing(true);

            const res = await urlSocket.post('/sync_training_mode_profile_train', {
                comp_name: datas.comp_name,
                comp_code: datas.comp_code
            });

            console.log('response_stage_sync', res);

            const { sts, count, synced_groups } = res?.data || {};

            if (!res?.data || !sts) {
                console.warn('⚠️ No response data received from sync API');
                setToastMessage('Failed to sync: No response data received.');
                setToastType('error');
                return;
            }

            if (count > 0) {
                console.log(`✅ ${sts}\nTotal Synced Groups: ${count}`);
                if (synced_groups) console.table(synced_groups);

                setToastMessage(`Successfully synced ${count} image group(s) for ${datas.comp_name}.`);
                setToastType('success');

                setCaptureProgress(prev => {
                    const updated = { ...prev };
                    if (Array.isArray(synced_groups) && synced_groups.length > 0) {
                        synced_groups.forEach(group => {
                            const [compName, compCode, stageName, stageCode, cameraLabel] = group;
                            const key = `${stageName}_${cameraLabel}`;
                            updated[key] = 0;
                        });
                    } else {
                        Object.keys(updated).forEach(k => (updated[k] = 0));
                    }
                    return updated;
                });

                setRefreshKey(prev => prev + 1);
            } else {
                console.warn('⚠️ No unsynced records found');
                setToastMessage(`No new images to sync for ${datas.comp_name}.`);
                setToastType('warning');
            }
        } catch (err) {
            console.error('❌ Error during stage image sync:', err);
            setToastMessage('Error during sync. Please try again.');
            setToastType('error');
        } finally {
            setIsSyncing(false);
        }
    };
    const outlineColors = [
        'White Outline',
        'Red Outline',
        'Green Outline',
        'Blue Outline',
        'Black Outline',
        'Orange Outline',
        'Yellow Outline'
    ];

    const colorBadgeStyles = {
        'White Outline': { bg: '#ffffff', text: '#000000' },
        'Red Outline': { bg: '#ef4444', text: '#ffffff' },
        'Green Outline': { bg: '#10b981', text: '#ffffff' },
        'Blue Outline': { bg: '#3b82f6', text: '#ffffff' },
        'Black Outline': { bg: '#1f2937', text: '#ffffff' },
        'Orange Outline': { bg: '#f97316', text: '#ffffff' },
        'Yellow Outline': { bg: '#eab308', text: '#000000' }
    };

    const showImage = (output_img) => {
        console.log("output_img", output_img)
        if (!output_img) return null;

        const imgurl = outlineUrl;

        return imgurl + output_img;
    };

    const getCurrentOutlinePath = (camera) => {
        if (!camera || !camera.outline_paths) return null;

        const colorPathMap = {
            'White Outline': 'white_path',
            'Red Outline': 'red_path',
            'Green Outline': 'green_path',
            'Blue Outline': 'blue_path',
            'Black Outline': 'black_path',
            'Orange Outline': 'orange_path',
            'Yellow Outline': 'yellow_path',
        };

        const pathKey = colorPathMap[selectedOutlineColor];
        return camera.outline_paths[pathKey] || camera.outline_paths.white_path;
    };
    return (
        <div
            className='page-content'
            style={{
                backgroundColor: '#ffffff',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            <MetaTags>
                <title>Remote Camera Gallery</title>
            </MetaTags>

            <div
                style={{
                    padding: '16px 24px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                    borderBottom: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)'
                }}
            >
                <Row className='align-items-center justify-content-between' style={{ margin: 0 }}>
                    <Col xs={12} sm={6} md={8} className='d-flex align-items-center ps-0 mb-3 mb-md-0'>
                        <div>
                            <h5
                                className='mb-0'
                                style={{
                                    fontSize: '18px',
                                    fontWeight: '700',
                                    color: '#111827',
                                    letterSpacing: '-0.3px'
                                }}
                            >
                                Remote Gallery
                            </h5>
                            <p
                                style={{
                                    fontSize: '13px',
                                    color: '#9ca3af',
                                    margin: '4px 0 0 0',
                                    fontWeight: '500'
                                }}
                            >
                                {datas?.comp_name || 'Company'}
                            </p>
                        </div>
                    </Col>

                    <Col xs={12} sm={6} md={4} className='d-flex justify-content-end gap-2 pe-0'>
                        <Button
                            size="sm"
                            onClick={handleStageCameraSync}
                            disabled={isSyncing}
                            style={{
                                backgroundColor: "#10b981",
                                border: "none",
                                borderRadius: "6px",
                                padding: "6px 12px",
                                fontSize: "13px",
                                fontWeight: "500",
                                color: "#fff",
                                height: "34px",
                            }}
                        >
                            {isSyncing ? (
                                <>
                                    <i className="fa fa-spinner fa-spin me-1" /> Syncing
                                </>
                            ) : (
                                <>
                                    <i className="fa fa-sync-alt me-1" /> Image Sync
                                </>
                            )}
                        </Button>

                        <Button
                            size="sm"
                            onClick={() => setShowGallery(!showGallery)}
                            style={{
                                backgroundColor: showGallery ? "#f59e0b" : "#6366f1",
                                border: "none",
                                borderRadius: "6px",
                                padding: "6px 12px",
                                fontSize: "13px",
                                fontWeight: "500",
                                color: "#fff",
                                height: "34px",
                            }}
                        >
                            <i className={`fa ${showGallery ? "fa-camera" : "fa-images"} me-1`} />
                            {showGallery ? "Hide Gallery" : "Show Gallery"}
                        </Button>

                        <Button
                            size="sm"
                            onClick={back}
                            style={{
                                backgroundColor: "#4441e6ff",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                padding: "6px 12px",
                                fontSize: "13px",
                                fontWeight: "500",
                                color: "#fff",
                                height: "34px",
                            }}
                        >
                            <i className="mdi mdi-arrow-left me-1" />
                            Back
                        </Button>
                    </Col>
                </Row>
            </div>

            <div
                style={{
                    flex: '1 1 auto',
                    display: 'flex',
                    overflow: 'hidden',
                    gap: showGallery ? '1px' : '0'
                }}
            >
                <div
                    style={{
                        flex: showGallery ? '1 1 65%' : '1 1 100%',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#fafbfc',
                        borderRight: showGallery ? '1px solid #e5e7eb' : 'none',
                        transition: 'flex 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        overflow: 'hidden'
                    }}
                >
                    <div
                        style={{
                            flex: '1',
                            padding: '20px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '24px'
                        }}
                    >
                        {stages.map((stage, stageIndex) => {
                            const completedCameras = (stage.camera_selection?.cameras || []).filter(
                                camera => isCameraTrainingCompleted(camera)
                            );

                            if (completedCameras.length === 0) {
                                return null;
                            }

                            const stageKeyPrefix = stage.stage_name;
                            const stageLimit = datas.capture_count;

                            return (
                                <div key={stageIndex}>
                                    <div style={{ marginBottom: '14px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                            <div
                                                style={{
                                                    width: '3px',
                                                    height: '16px',
                                                    backgroundColor: '#2563eb',
                                                    borderRadius: '1.5px'
                                                }}
                                            ></div>
                                            <h6
                                                style={{
                                                    fontWeight: '800',
                                                    marginBottom: '0',
                                                    color: '#111827',
                                                    fontSize: '13px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.6px'
                                                }}
                                            >
                                                {stage.stage_name}
                                            </h6>
                                        </div>
                                        <p
                                            style={{
                                                fontSize: '12px',
                                                color: '#6b7280',
                                                margin: '0 0 0 11px',
                                                fontWeight: '500'
                                            }}
                                        >
                                            {stage.stage_code} • <span style={{ color: '#2563eb', fontWeight: '600' }}>{stageLimit}</span> captures
                                        </p>
                                    </div>
                                    <Row className="g-3 mb-3 align-items-center">
                                        <Col md={6}>
                                            <div className="d-flex align-items-center">
                                                <label
                                                    className="mb-0 fw-bold me-2"
                                                    style={{ minWidth: 150, fontSize: "14px", color: "#111827" }}
                                                >
                                                    No.of Capture Image:
                                                </label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={captureCount}
                                                    onChange={(e) => setCaptureCount(parseInt(e.target.value) || 1)}
                                                    style={{
                                                        width: 100,
                                                        height: 38,
                                                        textAlign: "center",
                                                        fontWeight: "600",
                                                        borderRadius: "6px",
                                                    }}
                                                    disabled
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                cursor: "pointer",
                                                gap: 8,
                                                padding: "2px 8px",
                                                borderRadius: "6px",
                                                transition: "background-color 0.2s",
                                                backgroundColor: showOutline ? "#f0fdf4" : "transparent"
                                            }}
                                            onClick={() => setShowOutline(!showOutline)}
                                        >
                                            <div
                                                style={{
                                                    width: 38,
                                                    height: 20,
                                                    borderRadius: 20,
                                                    backgroundColor: showOutline ? "#10b981" : "#cbd5e1",
                                                    position: "relative",
                                                    transition: "background-color 0.3s",
                                                    boxShadow: showOutline ? "0 0 0 3px rgba(16, 185, 129, 0.1)" : "none"
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: 16,
                                                        height: 16,
                                                        background: "#fff",
                                                        borderRadius: "50%",
                                                        position: "absolute",
                                                        top: 2,
                                                        left: showOutline ? 20 : 2,
                                                        transition: "left 0.3s",
                                                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                                                    }}
                                                />
                                            </div>

                                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>

                                                <span style={{
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    color: showOutline ? "#10b981" : "#334155",
                                                    transition: "color 0.2s"
                                                }}>
                                                    Show Outline
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            opacity: showOutline ? 1 : 0.4,
                                            pointerEvents: showOutline ? "auto" : "none",
                                            transition: "opacity 0.3s"
                                        }}
                                    >
                                        <span style={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: "#64748b",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px"
                                        }}>
                                            Outline Color
                                        </span>
                                        <div className="d-flex align-items-center gap-1">
                                            {outlineColors.map((color) => (
                                                <div
                                                    key={color}
                                                    onClick={() => showOutline && setSelectedOutlineColor(color)}
                                                    style={{
                                                        backgroundColor: colorBadgeStyles[color].bg,
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: "5px",
                                                        border: selectedOutlineColor === color
                                                            ? "2px solid #334155"
                                                            : "2px solid #e2e8f0",
                                                        cursor: showOutline ? "pointer" : "not-allowed",
                                                        boxShadow: selectedOutlineColor === color
                                                            ? "0 3px 8px rgba(0,0,0,0.15)"
                                                            : "0 1px 3px rgba(0,0,0,0.08)",
                                                        transition: "all 0.2s ease",
                                                        transform: selectedOutlineColor === color ? "scale(1.05)" : "scale(1)",
                                                        position: "relative"
                                                    }}
                                                >
                                                    {selectedOutlineColor === color && (
                                                        <i
                                                            className="mdi mdi-check"
                                                            style={{
                                                                position: "absolute",
                                                                top: "50%",
                                                                left: "50%",
                                                                transform: "translate(-50%, -50%)",
                                                                color: "#fff",
                                                                fontSize: 13,
                                                                fontWeight: "bold",
                                                                textShadow: "0 1px 3px rgba(0,0,0,0.3)"
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <Row className='g-3'>
                                        {completedCameras.map((camera, camIndex) => {
                                            const key = `${stageKeyPrefix}_${camera.label}`;
                                            const currentCount = captureProgress[key] || 0;
                                            const capturePercentage = (currentCount / stageLimit) * 100;
                                            const outlinePath = getCurrentOutlinePath(camera);


                                            return (
                                                <Col xs={12} sm={6} md={4} key={camIndex}>


                                                    <div
                                                        style={{
                                                            borderRadius: '12px',
                                                            overflow: 'hidden',
                                                            backgroundColor: '#ffffff',
                                                            border: '1px solid #e5e7eb',
                                                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                                            transition: 'all 0.3s ease',
                                                            cursor: 'pointer',
                                                            height: '100%',
                                                            display: 'flex',
                                                            flexDirection: 'column'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                width: '100%',
                                                                aspectRatio: '16/12',
                                                                backgroundColor: '#000',
                                                                position: 'relative',
                                                                overflow: 'hidden',
                                                                flex: '1'
                                                            }}
                                                        >
                                                            {showOutline && outlinePath && (
                                                                <img
                                                                    src={showImage(outlinePath)}
                                                                    alt={`${selectedOutlineColor} outline`}
                                                                    style={{
                                                                        position: "absolute",
                                                                        top: 0,
                                                                        left: 0,
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        objectFit: "contain",
                                                                        zIndex: 2,
                                                                        pointerEvents: "none",
                                                                    }}
                                                                    onError={(e) => {
                                                                        console.error('Outline image failed to load:', outlinePath);
                                                                        e.target.style.display = 'none';
                                                                    }}
                                                                />
                                                            )}
                                                            <WebcamCapture
                                                                ref={el =>
                                                                    (webcamRefs.current[camera.originalLabel] = el)
                                                                }
                                                                key={camera.originalLabel}
                                                                resolution={{ width: 640, height: 480 }}
                                                                zoom={1}
                                                                center={{ x: 0.5, y: 0.5 }}
                                                                cameraLabel={camera.originalLabel}
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover'
                                                                }}
                                                            />

                                                            <div
                                                                style={{
                                                                    position: 'absolute',
                                                                    top: '8px',
                                                                    left: '8px',
                                                                    backgroundColor: 'rgba(16, 185, 129, 0.95)',
                                                                    color: '#fff',
                                                                    fontSize: '10px',
                                                                    padding: '4px 8px',
                                                                    borderRadius: '4px',
                                                                    fontWeight: '800',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '5px',
                                                                    letterSpacing: '0.8px',
                                                                    backdropFilter: 'blur(4px)',
                                                                    border: '1px solid rgba(255,255,255,0.2)'
                                                                }}
                                                            >
                                                                <span style={{
                                                                    width: '6px',
                                                                    height: '6px',
                                                                    backgroundColor: '#fff',
                                                                    borderRadius: '50%',
                                                                    display: 'inline-block',
                                                                    animation: 'pulse 2s infinite'
                                                                }}></span>
                                                                LIVE
                                                            </div>

                                                            <div
                                                                style={{
                                                                    position: 'absolute',
                                                                    bottom: '10px',
                                                                    left: '8px',
                                                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                                                    color: '#fff',
                                                                    fontSize: '12px',
                                                                    padding: '5px 10px',
                                                                    borderRadius: '5px',
                                                                    fontWeight: '600',
                                                                    backdropFilter: 'blur(4px)',
                                                                    border: '1px solid rgba(255,255,255,0.15)'
                                                                }}
                                                            >
                                                                {camera.label}
                                                            </div>

                                                            <div
                                                                style={{
                                                                    position: 'absolute',
                                                                    bottom: '10px',
                                                                    right: '8px',
                                                                    backgroundColor: 'rgba(37, 99, 235, 0.95)',
                                                                    color: '#fff',
                                                                    fontSize: '11px',
                                                                    padding: '6px 10px',
                                                                    borderRadius: '5px',
                                                                    fontWeight: '700',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '5px',
                                                                    letterSpacing: '0.3px',
                                                                    backdropFilter: 'blur(4px)',
                                                                    border: '1px solid rgba(255,255,255,0.2)'
                                                                }}
                                                            >
                                                                <span
                                                                    style={{
                                                                        fontSize: 11,
                                                                        fontWeight: 600,
                                                                        opacity: 0.9,
                                                                        textTransform: "uppercase",
                                                                        letterSpacing: "0.5px",
                                                                    }}
                                                                >
                                                                    Captured Image Count:
                                                                </span>
                                                                <i className='mdi mdi-camera-outline' style={{ fontSize: '13px' }}></i>
                                                                <span>{currentCount}/{stageLimit}</span>
                                                            </div>

                                                            {capturePercentage > 0 && (
                                                                <div
                                                                    style={{
                                                                        position: 'absolute',
                                                                        bottom: '0',
                                                                        left: '0',
                                                                        height: '2px',
                                                                        width: `${capturePercentage}%`,
                                                                        backgroundColor: '#10b981',
                                                                        transition: 'width 0.3s ease'
                                                                    }}
                                                                ></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Col>
                                            );
                                        })}
                                    </Row>
                                </div>
                            );
                        })}
                    </div>

                    <div
                        style={{
                            padding: '14px 20px',
                            borderTop: '1px solid #e5e7eb',
                            backgroundColor: '#ffffff',
                            flex: '0 0 auto',
                            display: 'flex',
                            gap: '10px',
                            boxShadow: '0 -2px 8px rgba(0,0,0,0.04)'
                        }}
                    >
                        <Button
                            onClick={handleCaptureAll}
                            disabled={isCapturingAll}
                            style={{
                                background: isCapturingAll ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                border: 'none',
                                borderRadius: '7px',
                                padding: '10px 16px',
                                fontSize: '13px',
                                fontWeight: '700',
                                color: '#fff',
                                flex: '1',
                                maxWidth: '220px',
                                cursor: isCapturingAll ? 'not-allowed' : 'pointer',
                                opacity: isCapturingAll ? 0.8 : 1,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
                                letterSpacing: '0.3px'
                            }}
                            onMouseEnter={(e) => !isCapturingAll && (e.target.style.transform = 'translateY(-2px)')}
                            onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)')}
                        >
                            {isCapturingAll ? (
                                <>
                                    <i className='fa fa-spinner fa-spin me-2'></i>Capturing...
                                </>
                            ) : (
                                <>
                                    <i className='fa fa-camera me-2'></i>Capture All
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {showGallery && (
                    <div
                        style={{
                            flex: '0 0 35%',
                            backgroundColor: '#ffffff',
                            padding: '20px',
                            overflowY: 'auto',
                            borderLeft: '1px solid #e5e7eb',
                            boxShadow: '-4px 0 12px rgba(0,0,0,0.04)',
                            animation: 'slideIn 0.3s ease'
                        }}
                    >
                        <StageCameraGallery
                            compCode={datas?.comp_code}
                            compName={datas?.comp_name}
                            stages={stages}
                            refreshKey={refreshKey}
                            setRefreshKey={setRefreshKey}
                            captureProgress={captureProgress}
                            setCaptureProgress={setCaptureProgress}
                            captureLimit={datas?.capture_count}
                        />
                    </div>
                )}

                <style>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
            </div>
            <div
                className='toast-container'
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: '9999',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }}
            >
                {toastMessage && (
                    <CustomToast
                        message={toastMessage}
                        type={toastType}
                        onClose={() => setToastMessage(null)}
                    />
                )}
            </div>

            {alert}
        </div>
    );
};
export default Profile_non_multi;