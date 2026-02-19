import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Col, Row } from 'reactstrap';

const CameraControl = () => {
    const webcamRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [focusDistance, setFocusDistance] = useState(0);
    const [focusMax, setFocusMax] = useState(100);
    const [manualFocus, setManualFocus] = useState(false);
    const [autoFocusMode, setAutoFocusMode] = useState('continuous');

    useEffect(() => {
        const getVideo = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
                setStream(mediaStream);
                const videoTrack = mediaStream.getVideoTracks()[0];
                const capabilities = videoTrack.getCapabilities();

                if (capabilities.focusDistance) {
                    setFocusMax(capabilities.focusDistance.max);
                    setManualFocus(true);
                } else {
                    setManualFocus(false);
                }
            } catch (err) {
                console.error('Error accessing the camera', err);
            }
        };

        getVideo();
    }, []);

    const handleFocusChange = async (e) => {
        const mode = e.target.value;
        setAutoFocusMode(mode);
        const videoTrack = stream.getVideoTracks()[0];
        const constraints = {
            advanced: [{ focusMode: mode }],
        };
        try {
            await videoTrack.applyConstraints(constraints);
        } catch (err) {
            console.error('Error applying constraints', err);
        }
    };

    const handleFocusDistanceChange = async (e) => {
        const value = e.target.value;
        setFocusDistance(value);

        const videoTrack = stream.getVideoTracks()[0];
        const constraints = {
            advanced: [{ focusMode: 'manual', focusDistance: value }],
        };
        try {
            await videoTrack.applyConstraints(constraints);
        } catch (err) {
            console.error('Error applying constraints', err);
        }
    };

    return (
        <div className='page-content'>
            <Row>
                <Col md={8} lg={8}>
                    <Webcam audio={false} ref={webcamRef} videoConstraints={{ width: 1280, height: 960 }} style={{ height: 'auto', width: '100%' }} />
                </Col>
            </Row>
            <div>
                <label>
                    Auto Focus:
                    <select value={autoFocusMode} onChange={handleFocusChange}>
                        <option value="continuous">Continuous</option>
                        <option value="single-shot">Single-Shot</option>
                        <option value="manual">Manual</option>
                    </select>
                </label>
            </div>
            {manualFocus && autoFocusMode === 'manual' && (
                <div>
                    <label>
                        Focus Distance:
                        <input
                            type="range"
                            min="0"
                            max={focusMax}
                            value={focusDistance}
                            onChange={handleFocusDistanceChange}
                        />
                    </label>
                </div>
            )}
        </div>
    );
};

export default CameraControl;
