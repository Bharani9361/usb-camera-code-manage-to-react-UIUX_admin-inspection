import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

const PREDEFINED_RESOLUTIONS_4_3 = [
    { label: "360p", width: 480, height: 360 },
    { label: "480p", width: 640, height: 480 },
    { label: "720p", width: 960, height: 720 },
    { label: "1080p", width: 1440, height: 1080 },
    { label: "1440p", width: 1920, height: 1440 },
    { label: "4K (2160p)", width: 2880, height: 2160 },
];

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;

const CameraControlPanel = () => {
    const webcamRef = useRef(null);
    const videoTrackRef = useRef(null);
    const [devices, setDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);
    const [availableResolutions, setAvailableResolutions] = useState([]);
    const [resolution, setResolution] = useState(null);
    const [zoom, setZoom] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [snapshotData, setSnapshotData] = useState(null);
    const [cameraConfig, setCameraConfig] = useState(null);

    // Load config from backend on startup
    useEffect(() => {
        // fetch("/api/camera-config")
        //     .then((res) => {
        //         if (!res.ok) throw new Error("No config");
        //         return res.json();
        //     })
        //     .then((config) => {
        //         setZoom(config.zoom || 1);
        //         setResolution(config.resolution || null);
        //         setSelectedDeviceId(config.deviceId || null);
        //     })
        //     .catch(() => {
        //         // No saved config — will fallback later
        //         setZoom(1);
        //     });

        const config = JSON.parse(localStorage.getItem('CameraConfig'));
        console.log('CameraConfig ', config);
        if(config) {
            setCameraConfig(config);
        }
    }, []);


    
    // Fetch available cameras
    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then((allDevices) => {
            const videoDevices = allDevices.filter((d) => d.kind === "videoinput");
            setDevices(videoDevices);
            if (videoDevices.length > 0) {
                setSelectedDeviceId(videoDevices[0].deviceId);
            }
        });
    }, [selectedDeviceId]);

    // Fetch camera capabilities and build supported resolutions list
    useEffect(() => {
        if (!selectedDeviceId) return;
        setIsLoading(true);

        navigator.mediaDevices
            .getUserMedia({
                video: {
                    deviceId: { exact: selectedDeviceId },
                },
            })
            .then((stream) => {
                const videoTrack = stream.getVideoTracks()[0];
                videoTrackRef.current = videoTrack;

                const caps = videoTrack.getCapabilities();
                const supportedRes = PREDEFINED_RESOLUTIONS_4_3.filter(
                    (res) =>
                        (!caps.width || (caps.width.max >= res.width && caps.width.min <= res.width)) &&
                        (!caps.height || (caps.height.max >= res.height && caps.height.min <= res.height))
                );

                setAvailableResolutions(supportedRes);
                setZoom(cameraConfig.zoom || 1);
                setResolution(cameraConfig.resolution || supportedRes[1] || supportedRes[0]);
                // setResolution(supportedRes[1] || supportedRes[0]); // Default to 480p or first
                videoTrack.stop();
                setIsLoading(false);
            })
            .catch((err) => {
                console.error("Error checking resolution support:", err);
                setIsLoading(false);
            });
    }, [selectedDeviceId]);

    // Take high-quality snapshot
    const takeSnapshot = () => {
        const video = webcamRef.current?.video;

        if (!video) {
            alert("Camera not ready");
            return;
        }

        const fullWidth = video.videoWidth;
        const fullHeight = video.videoHeight;

        const canvas = document.createElement("canvas");
        canvas.width = fullWidth;
        canvas.height = fullHeight;
        const ctx = canvas.getContext("2d");

        // Zoom crop
        const zoomedWidth = fullWidth / zoom;
        const zoomedHeight = fullHeight / zoom;
        const sx = (fullWidth - zoomedWidth) / 2;
        const sy = (fullHeight - zoomedHeight) / 2;

        ctx.drawImage(video, sx, sy, zoomedWidth, zoomedHeight, 0, 0, fullWidth, fullHeight);

        const dataUrl = canvas.toDataURL("image/jpeg", 1.0); // Full quality
        setSnapshotData(dataUrl);
    };

    const saveConfig = async () => {
        const payload = {
            deviceId: selectedDeviceId,
            resolution,
            zoom,
        };
        console.log('payload ', payload);

        try {
            localStorage.setItem('CameraConfig', JSON.stringify(payload));
            // const response = await fetch("/api/camera-config", {
            //     method: "POST",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify(payload),
            // });

            // if (!response.ok) throw new Error("Failed to save config");
            alert("Configuration saved successfully ✅");
        } catch (err) {
            console.error(err);
            alert("Failed to save configuration.");
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "1rem" }}>
            <h2>Camera Control Panel</h2>

            {isLoading ? (
                <div style={{ fontSize: "1.2rem", margin: "2rem" }}>🎥 Loading camera...</div>
            ) : (
                <div
                    style={{
                        display: "inline-block",
                        overflow: "hidden",
                        width: '100%',
                        height: 'auto',
                        border: "2px solid #ccc",
                        borderRadius: "8px",
                        background: "#000",
                    }}
                >
                    <div
                        style={{
                            transform: `scale(${zoom})`,
                            transformOrigin: "center",
                            transition: "transform 0.2s ease-in-out",
                        }}
                    >
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{
                                deviceId: selectedDeviceId,
                                width: resolution?.width,
                                height: resolution?.height,
                            }}
                            style={{
                                width: '100%',
                                height: 'auto',
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Controls */}
            <div style={{ marginTop: "1.5rem" }}>
                {/* Camera Selector */}
                <div>
                    <label>Camera: </label>
                    <select
                        value={selectedDeviceId || ""}
                        onChange={(e) => setSelectedDeviceId(e.target.value)}
                    >
                        {devices.map((device) => (
                            <option key={device.deviceId} value={device.deviceId}>
                                {device.label || "Unnamed Camera"}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Resolution Selector */}
                <div style={{ marginTop: "1rem" }}>
                    <label>Resolution: </label>
                    <select
                        value={resolution?.label}
                        onChange={(e) =>
                            setResolution(
                                availableResolutions.find((r) => r.label === e.target.value)
                            )
                        }
                    >
                        {availableResolutions.map((res) => (
                            <option key={res.label} value={res.label}>
                                {res.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Zoom Control */}
                <div style={{ marginTop: "1rem" }}>
                    <label>Zoom: </label>
                    <input
                        type="range"
                        min={MIN_ZOOM}
                        max={MAX_ZOOM}
                        step="0.1"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                    />
                    <span style={{ marginLeft: "1rem" }}>{zoom.toFixed(1)}x</span>
                    <button onClick={() => setZoom(1)} style={{ marginLeft: "1rem" }}>
                        Reset Zoom
                    </button>
                </div>

                {/* Actions */}
                <div style={{ marginTop: "1rem" }}>
                    <button onClick={takeSnapshot} style={{ marginRight: "1rem" }}>
                        📸 Take Snapshot
                    </button>
                    <button onClick={saveConfig}>💾 Save Config</button>
                </div>

                {/* Snapshot Preview */}
                {snapshotData && (
                    <div style={{ marginTop: "2rem" }}>
                        <h4>Snapshot:</h4>
                        <img
                            src={snapshotData}
                            alt="Snapshot"
                            style={{ width: 240, border: "1px solid #ccc" }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CameraControlPanel;
