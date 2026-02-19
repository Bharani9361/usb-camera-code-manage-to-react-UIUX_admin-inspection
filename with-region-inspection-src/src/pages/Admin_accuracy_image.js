import React, { useEffect, useRef, useState } from "react";
import WebcamCapture from "pages/WebcamCustom/WebcamCapture";
import { useLocation, useHistory } from "react-router-dom";
import urlSocket from "./urlSocket";
import ImageUrl from "./imageUrl";
import "../Component/RemoteStg.css";
import {
    Container,
    Button,
    Col,
    Row,
    Card,
    CardBody,
    CardHeader,
    Badge,
    Spinner,
    Alert,
    Modal,
    ModalHeader,
    ModalBody,
    Input,
} from "reactstrap";
import Swal from "sweetalert2";
import { DEFAULT_RESOLUTION } from "../pages/Component/cameraConfig";
import './index.css';
import ImageGallery_sequence from "../Component/ImageGallery_sequence";




const Admin_accuracy_image = () => {
    const location = useLocation();
    const history = useHistory();
    const { datas } = location.state || {};
    const stages = datas?.stages || [];
    const [cameraDevices, setCameraDevices] = useState({});
    const webcamRefs = useRef({});
    const [isCapturing, setIsCapturing] = useState(false);
    const [captureStatus, setCaptureStatus] = useState({});
    const [notification, setNotification] = useState("");
    const [selectedCameraLabel, setSelectedCameraLabel] = useState(null);
    const [captureCount, setCaptureCount] = useState(parseInt(datas?.capture_count) || 5);
    // Gallery
    const [galleryImages, setGalleryImages] = useState([]);
    const [loadingGallery, setLoadingGallery] = useState(false);
    const [selectedStage, setSelectedStage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    // Selection
    const [selectedImages, setSelectedImages] = useState(new Set());
    const [currentCapturePreview, setCurrentCapturePreview] = useState(null);
    const [cameraCapturedCounts, setCameraCapturedCounts] = useState({});
    const [isSyncing, setIsSyncing] = useState(false);

    // NEW STATE: Toggle gallery visibility
    const [showGallery, setShowGallery] = useState(false);

    useEffect(() => {
        async function setupCameraDevices() {
            try {
                await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                const devices = await navigator.mediaDevices.enumerateDevices();
                const deviceMap = {};
                for (let s = 0; s < stages.length; s++) {
                    const stage = stages[s];
                    const cams = stage?.camera_selection?.cameras || [];
                    deviceMap[s] = [];
                    for (let c = 0; c < cams.length; c++) {
                        const cam = cams[c];
                        const videoDevice = devices.find((d) => {
                            if (d.kind !== "videoinput") return false;
                            const label = (d.label || "").toLowerCase();
                            const orig = (cam.originalLabel || "").toLowerCase();
                            const vid = (cam.v_id || "").toLowerCase();
                            const pid = (cam.p_id || "").toLowerCase();
                            return label.includes(orig) || label.includes(vid) || label.includes(pid);
                        });
                        deviceMap[s].push(videoDevice ? videoDevice.deviceId : null);
                    }
                }
                setCameraDevices(deviceMap);
            } catch (e) {
                console.error("Camera setup failed:", e);
            }
        }
        setupCameraDevices();
    }, [stages]);

    useEffect(() => {
        const loadAllCounts = async () => {
            const counts = {};
            for (let s = 0; s < stages.length; s++) {
                const stage = stages[s];
                try {
                    const { data } = await urlSocket.post("/get_training_images", {
                        comp_code: datas.comp_code,
                        stage_code: stage.stage_code,
                    });
                    const imgs = data.images || [];
                    const cams = stage?.camera_selection?.cameras || [];
                    cams.forEach((cam, c) => {
                        const key = `${s}-${c}`;
                        counts[key] = imgs.filter((i) => i.camera_label === cam.label).length;
                    });
                } catch (e) {
                    console.error("loadAllCounts error", e);
                }
            }
            setCameraCapturedCounts(counts);
        };
        if (stages.length) loadAllCounts();
    }, [stages, datas.comp_code]);

    useEffect(() => {
        if (stages.length) setSelectedStage(0);
    }, [stages]);

    useEffect(() => {
        if (selectedStage !== null && showGallery) {
            loadGalleryImages(selectedStage);
        }
    }, [selectedStage, showGallery]);

    const loadGalleryImages = async (stageIdx) => {
        setLoadingGallery(true);
        setSelectedImages(new Set());
        try {
            const stage = stages[stageIdx];
            const { data } = await urlSocket.post("/get_training_images", {
                comp_code: datas.comp_code,
                stage_code: stage.stage_code,
            });
            setGalleryImages(data.images || []);
        } catch (e) {
            console.error(e);
            setGalleryImages([]);
        } finally {
            setLoadingGallery(false);
        }
    };

    const handleDeleteImage = async (image) => {
        const { isConfirmed } = await Swal.fire({
            title: "Delete Image?",
            text: "This action cannot be undone",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, delete it!",
        });
        if (!isConfirmed) return;
        try {
            const { data } = await urlSocket.post("/delete_training_image", {
                filename: image.filename,
                camera_label: image.camera_label,
            });
            if (data.success) {
                Swal.fire("Deleted!", "Image has been deleted.", "success");
                const stage = stages[selectedStage];
                const camIdx = stage?.camera_selection?.cameras?.findIndex(
                    (c) => c.label === image.camera_label
                );
                if (camIdx > -1) {
                    const key = `${selectedStage}-${camIdx}`;
                    setCameraCapturedCounts((prev) => ({
                        ...prev,
                        [key]: Math.max(0, (prev[key] || 0) - 1),
                    }));
                }
                loadGalleryImages(selectedStage);
            } else {
                Swal.fire("Error!", "Failed to delete image", "error");
            }
        } catch (e) {
            console.error(e);
            Swal.fire("Error!", "Failed to delete image", "error");
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedImages.size) {
            Swal.fire("No Selection", "Select at least one image.", "info");
            return;
        }
        const { isConfirmed } = await Swal.fire({
            title: `Delete ${selectedImages.size} image(s)?`,
            text: "This cannot be undone",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Yes, delete all!",
        });
        if (!isConfirmed) return;
        const promises = Array.from(selectedImages).map((fn) => {
            const img = galleryImages.find((i) => i.filename === fn);
            return urlSocket.post("/delete_training_image", {
                filename: fn,
                camera_label: img.camera_label,
            });
        });
        const results = await Promise.all(promises);
        const allOk = results.every((r) => r.data.success);
        if (allOk) {
            Swal.fire("Deleted!", `${selectedImages.size} images removed.`, "success");
        } else {
            Swal.fire("Partial", "Some images failed to delete.", "warning");
        }
        const stage = stages[selectedStage];
        const cams = stage?.camera_selection?.cameras || [];
        cams.forEach((_, c) => {
            const key = `${selectedStage}-${c}`;
            const deletedForCam = results.filter(
                (r) => r.config.data.includes(`"camera_label":"${cams[c].label}"`)
            ).length;
            setCameraCapturedCounts((prev) => ({
                ...prev,
                [key]: Math.max(0, (prev[key] || 0) - deletedForCam),
            }));
        });
        loadGalleryImages(selectedStage);
    };

    const toggleImageSelection = (fn) => {
        const copy = new Set(selectedImages);
        copy.has(fn) ? copy.delete(fn) : copy.add(fn);
        setSelectedImages(copy);
    };

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(""), 3000);
    };

    const dataURLtoBlob = (dataURL) => {
        const [_, b64] = dataURL.split(",");
        const mime = _.match(/:(.*?);/)?.[1];
        const bin = atob(b64);
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        return new Blob([arr], { type: mime });
    };

    const handleManualCapture = async () => {
        if (isCapturing) return;

        const stage = stages[selectedStage];
        if (!stage) return;

        const cams = stage?.camera_selection?.cameras || [];
        const devIds = cameraDevices[selectedStage] || [];

        let stageComplete = true;
        for (let c = 0; c < cams.length; c++) {
            const key = `${selectedStage}-${c}`;
            const cur = cameraCapturedCounts[key] || 0;
            if (cur < captureCount) {
                stageComplete = false;
                break;
            }
        }

        if (stageComplete) {
            if (selectedStage < stages.length - 1) {
                setSelectedStage(selectedStage + 1);
                await new Promise((r) => setTimeout(r, 800));
                showNotification(`Stage ${selectedStage + 1} completed! Moving to next stage...`);
            } else {
                Swal.fire({
                    title: "All Stages Complete!",
                    text: "All cameras in all stages have reached the capture limit.",
                    icon: "success",
                    confirmButtonColor: "#10b981",
                });
            }
            return;
        }

        setIsCapturing(true);

        try {
            // Track new counts locally to avoid stale state issues
            const newCounts = { ...cameraCapturedCounts };

            const captures = await Promise.all(
                cams.map(async (cam, c) => {
                    const key = `${selectedStage}-${c}`;
                    const cur = cameraCapturedCounts[key] || 0;

                    if (cur >= captureCount) return null;

                    const webcam = webcamRefs.current[cam.originalLabel];
                    if (!webcam || !devIds[c]) return null;

                    const b64 = webcam.captureZoomedImage?.();
                    if (!b64) return null;

                    setCurrentCapturePreview({
                        image: b64,
                        captureNum: cur + 1,
                        totalCaptures: captureCount,
                        stageName: stage.stage_name,
                        stageIndex: selectedStage,
                        camIndex: c,
                        cameraLabel: cam.label,
                        status: "uploading",
                    });

                    const blob = dataURLtoBlob(b64);
                    const fileName = `${stage.stage_name}_${cam.label}_${Date.now()}.png`;
                    const fd = new FormData();
                    fd.append("comp_name", datas.comp_name);
                    fd.append("comp_id", datas.comp_id);
                    fd.append("comp_code", datas.comp_code);
                    fd.append("stage_name", stage.stage_name);
                    fd.append("stage_code", stage.stage_code);
                    fd.append("img_0", blob, fileName);
                    fd.append("img_0_label", cam.label);

                    try {
                        await urlSocket.post("/admin_remoteMultiCapture_sequential", fd);
                        // Update local tracking
                        newCounts[key] = (newCounts[key] || 0) + 1;
                        return { cam: cam.label, status: "success", key };
                    } catch (e) {
                        console.error(`Upload failed for ${cam.label}`, e);
                        return { cam: cam.label, status: "error", key: null };
                    }
                })
            );

            // Update state with all new counts at once
            setCameraCapturedCounts(newCounts);

            if (showGallery) {
                await loadGalleryImages(selectedStage);
            }

            // Check if stage is complete using the local newCounts
            let nowComplete = true;
            for (let c = 0; c < cams.length; c++) {
                const key = `${selectedStage}-${c}`;
                const cur = newCounts[key] || 0;
                if (cur < captureCount) {
                    nowComplete = false;
                    break;
                }
            }

            if (nowComplete && selectedStage < stages.length - 1) {
                showNotification(`Stage ${selectedStage + 1} completed! Moving to next stage...`);
                await new Promise((r) => setTimeout(r, 1500));
                setSelectedStage(selectedStage + 1);
                await new Promise((r) => setTimeout(r, 800));
            } else {
                showNotification("Images captured successfully!");
            }

        } catch (e) {
            console.error(e);
            Swal.fire("Error", "Capture failed.", "error");
        } finally {
            setIsCapturing(false);
            setCurrentCapturePreview(null);
        }
    };

    const handleStageCameraSync = async () => {
        setIsSyncing(true);
        try {
            const { data } = await urlSocket.post("/sync_training_mode_adminresult_train", {
                comp_name: datas.comp_name,
                comp_code: datas.comp_code
            });
            if (!data || data.count === undefined || data.count === 0) {
                Swal.fire({
                    title: "Already Synced",
                    text: "All data is already synced to admin side.",
                    icon: "info",
                    confirmButtonColor: "#0288fdff",
                });
            } else {
                Swal.fire({
                    title: "Sync Complete!",
                    text: `Synced ${data.count} items`,
                    icon: "success",
                    confirmButtonColor: "#28a745",
                });
            }
        } catch (e) {
            console.error(e);
            Swal.fire({
                title: "Sync Failed",
                icon: "error",
                confirmButtonColor: "#dc3545",
            });
        } finally {
            setIsSyncing(false);
        }
    };

    const back = () => history.goBack();

    return (
        <div
            className="page-content"
            style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
        >
            <Container fluid>
                {notification && (
                    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999 }}>
                        <Alert color="success" className="mb-0 shadow-lg">
                            <i className="mdi mdi-check-circle me-2" />
                            {notification}
                        </Alert>
                    </div>
                )}

                <Card className="header-card mb-4">
                    <CardBody className="py-3">
                        <Row className="align-items-center">
                            <Col md={4}>
                                <h3 className="mb-0 text-white">
                                    <i className="mdi mdi-camera-burst me-2" />
                                    Remote Camera Gallery
                                </h3>
                            </Col>
                            <Col md={8} className="text-end">
                                <Button
                                    color={showGallery ? "warning" : "info"}
                                    outline
                                    className="me-2"
                                    onClick={() => setShowGallery(!showGallery)}
                                >
                                    <i className={`mdi ${showGallery ? "mdi-camera" : "mdi-image-multiple"} me-1`} />
                                    {showGallery ? "Hide Gallery" : "Show Gallery"}
                                </Button>
                                <Button
                                    color="light"
                                    outline
                                    className="me-2"
                                    onClick={handleStageCameraSync}
                                    disabled={isSyncing}
                                >
                                    {isSyncing ? (
                                        <>
                                            <i className="fa fa-spinner fa-spin me-1" />
                                            Syncing...
                                        </>
                                    ) : (
                                        <>
                                            <i className="mdi mdi-sync me-1" />
                                            Image  Sync
                                        </>
                                    )}
                                </Button>
                                <Button color="light" onClick={back}>
                                    <i className="mdi mdi-arrow-left me-1" />
                                    Back
                                </Button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                <Row>
                    <Col lg={showGallery ? 6 : 12}>
                        <Card className="stage-card" style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                            <CardHeader className="bg-white border-bottom pb-0" style={{ borderRadius: '8px 8px 0 0' }}>
                                <div className="capture-btn-container">
                                    <Row className="align-items-center">
                                        <Col md={6}>
                                            <div className="d-flex align-items-center gap-2">
                                                <label className="mb-0 fw-bold" style={{ minWidth: 120 }}>
                                                    No.of Capture Image:
                                                </label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={captureCount}
                                                    onChange={(e) => setCaptureCount(parseInt(e.target.value) || 1)}
                                                    style={{ width: 100 }}
                                                    disabled={true}
                                                />
                                            </div>
                                        </Col>
                                        <Col md={6} className="text-end">
                                            <Button
                                                size="lg"
                                                color="success"
                                                className="px-4"
                                                onClick={handleManualCapture}
                                                disabled={isCapturing}
                                                style={{ borderRadius: 8, fontWeight: 600 }}
                                            >
                                                {isCapturing ? (
                                                    <>
                                                        <Spinner size="sm" className="me-2" />
                                                        Capturing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="mdi mdi-camera me-2" />
                                                        Capture Image
                                                    </>
                                                )}
                                            </Button>
                                        </Col>
                                    </Row>
                                </div>
                            </CardHeader>

                            <CardBody className="p-4" style={{ position: "relative", backgroundColor: '#fafbfc' }}>
                                <Button
                                    color="primary"
                                    size="sm"
                                    disabled={selectedStage === 0}
                                    onClick={() => setSelectedStage((prev) => Math.max(prev - 1, 0))}
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "10px",
                                        transform: "translateY(-50%)",
                                        borderRadius: "50%",
                                        width: 44,
                                        height: 44,
                                        zIndex: 10,
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 0
                                    }}
                                >
                                    <i className="mdi mdi-chevron-left" style={{ fontSize: 24 }} />
                                </Button>

                                <Button
                                    color="primary"
                                    size="sm"
                                    disabled={selectedStage === stages.length - 1}
                                    onClick={() =>
                                        setSelectedStage((prev) => Math.min(prev + 1, stages.length - 1))
                                    }
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        right: "10px",
                                        transform: "translateY(-50%)",
                                        borderRadius: "50%",
                                        width: 44,
                                        height: 44,
                                        zIndex: 10,
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 0
                                    }}
                                >
                                    <i className="mdi mdi-chevron-right" style={{ fontSize: 24 }} />
                                </Button>

                                <div
                                    style={{
                                        textAlign: "center",
                                        marginBottom: 20,
                                        fontWeight: "600",
                                        fontSize: 16,
                                        color: "#334155",
                                    }}
                                >
                                    Stage {selectedStage + 1} of {stages.length}
                                </div>

                                <div
                                    className="slider-container"
                                    style={{
                                        overflow: "hidden",
                                        borderRadius: 12,
                                        background: "#ffffff",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                        position: "relative",
                                        padding: '20px 10px'
                                    }}
                                >
                                    <div
                                        className="slider-track"
                                        style={{
                                            display: 'flex',
                                            width: `${stages.length * 100}%`,          // keep total width
                                            marginLeft: `-${selectedStage * 100}%`,    // <-- MOVE with margin
                                            transition: 'margin-left 0.5s ease-in-out',
                                        }}
                                    >
                                        {stages.map((stage, sIdx) => (
                                            <div
                                                key={sIdx}
                                                style={{
                                                    width: `${100 / stages.length}%`,
                                                    flexShrink: 0,
                                                    padding: '0 10px',
                                                }}
                                            >
                                                <div
                                                    className="d-flex justify-content-between align-items-center mb-4"
                                                    style={{
                                                        borderBottom: "3px solid #e2e8f0",
                                                        paddingBottom: 12,
                                                    }}
                                                >
                                                    <div>
                                                        <h5 className="mb-1" style={{ color: '#1e293b', fontWeight: 700 }}>
                                                            {stage.stage_name}
                                                        </h5>
                                                        <small style={{ color: '#64748b', fontSize: 12 }}>
                                                            Stage Code: {stage.stage_code}
                                                        </small>
                                                    </div>
                                                    <Badge
                                                        color="primary"
                                                        pill
                                                        style={{
                                                            fontSize: 13,
                                                            fontWeight: 600,
                                                            padding: '6px 14px',
                                                            background: '#3b82f6'
                                                        }}
                                                    >
                                                        {(cameraDevices[sIdx] || []).filter((d) => d !== null).length}/
                                                        {(stage?.camera_selection?.cameras || []).length} Cameras
                                                    </Badge>
                                                </div>

                                                <Row>
                                                    {(stage?.camera_selection?.cameras || []).map((cam, cIdx) => {
                                                        const key = `${sIdx}-${cIdx}`;
                                                        const devId = (cameraDevices[sIdx] || [])[cIdx];
                                                        const hasDev = !!devId;
                                                        const captured = cameraCapturedCounts[key] || 0;
                                                        const isAtLimit = captured >= captureCount;

                                                        return (
                                                            <Col md={showGallery ? 6 : 4} key={cIdx} className="mb-3">
                                                                <Card
                                                                    className={`camera-card ${captureStatus[key] ? "captured" : ""}`}
                                                                    style={{
                                                                        borderRadius: 12,
                                                                        overflow: "hidden",
                                                                        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                                                                        border: '2px solid #e2e8f0',
                                                                        transition: 'all 0.3s ease'
                                                                    }}
                                                                >
                                                                    <CardHeader
                                                                        className="d-flex justify-content-between align-items-center py-2"
                                                                        style={{
                                                                            background: '#1e293b',
                                                                            color: '#fff'
                                                                        }}
                                                                    >
                                                                        <span
                                                                            className="fw-bold text-truncate"
                                                                            style={{ maxWidth: 150, fontSize: 14 }}
                                                                        >
                                                                            <i className="mdi mdi-camera me-1" />
                                                                            {cam.label}
                                                                        </span>
                                                                        {captureStatus[key] && (
                                                                            <Badge color="success" pill>
                                                                                <i className="mdi mdi-check" />
                                                                            </Badge>
                                                                        )}
                                                                    </CardHeader>

                                                                    <CardBody className="p-0">
                                                                        <div
                                                                            className="webcam-container"
                                                                            style={{
                                                                                height: 220,
                                                                                position: "relative",
                                                                                background: '#f8fafc'
                                                                            }}
                                                                        >
                                                                            {hasDev ? (
                                                                                <>
                                                                                    <WebcamCapture
                                                                                        ref={(el) => {
                                                                                            if (el) webcamRefs.current[cam.originalLabel] = el;
                                                                                        }}
                                                                                        deviceId={devId}
                                                                                        resolution={DEFAULT_RESOLUTION}
                                                                                        videoConstraints={{
                                                                                            width: DEFAULT_RESOLUTION.width,
                                                                                            height: DEFAULT_RESOLUTION.height,
                                                                                        }}
                                                                                        cameraLabel={cam.originalLabel}
                                                                                        style={{
                                                                                            position: "absolute",
                                                                                            top: 0,
                                                                                            left: 0,
                                                                                            width: "100%",
                                                                                            height: "100%",
                                                                                            objectFit: "cover",
                                                                                            zIndex: 1,
                                                                                        }}
                                                                                    />

                                                                                    <Badge
                                                                                        pill
                                                                                        className="camera-status-badge"
                                                                                        style={{
                                                                                            position: 'absolute',
                                                                                            top: 10,
                                                                                            right: 10,
                                                                                            background: '#10b981',
                                                                                            color: '#fff',
                                                                                            fontSize: 11,
                                                                                            fontWeight: 600,
                                                                                            padding: '4px 10px',
                                                                                            zIndex: 10
                                                                                        }}
                                                                                    >
                                                                                        <i className="mdi mdi-circle" style={{ fontSize: "8px", marginRight: 4 }} />
                                                                                        Live
                                                                                    </Badge>

                                                                                    <div
                                                                                        style={{
                                                                                            position: "absolute",
                                                                                            bottom: 10,
                                                                                            left: "50%",
                                                                                            transform: "translateX(-50%)",
                                                                                            background: isAtLimit
                                                                                                ? "#10b981"
                                                                                                : "#3b82f6",
                                                                                            color: "#fff",
                                                                                            padding: "8px 18px",
                                                                                            borderRadius: "20px",
                                                                                            fontWeight: 700,
                                                                                            fontSize: 14,
                                                                                            boxShadow: "0 4px 12px rgba(0,0,0,.25)",
                                                                                            zIndex: 20,
                                                                                            display: "flex",
                                                                                            alignItems: "center",
                                                                                            gap: 8,
                                                                                        }}
                                                                                    ><span
                                                                                        style={{
                                                                                            fontSize: 11,
                                                                                            fontWeight: 600,
                                                                                            opacity: 0.9,
                                                                                            textTransform: "uppercase",
                                                                                            letterSpacing: "0.5px",
                                                                                        }}
                                                                                    >
                                                                                            Captured Image Count
                                                                                        </span>
                                                                                        {isAtLimit ? (
                                                                                            <>
                                                                                                <i className="mdi mdi-check-circle" />
                                                                                                <span>{captured}/{captureCount}</span>
                                                                                            </>
                                                                                        ) : currentCapturePreview &&
                                                                                            currentCapturePreview.stageIndex === sIdx &&
                                                                                            currentCapturePreview.camIndex === cIdx ? (
                                                                                            <>
                                                                                                {currentCapturePreview.status === "uploading" ? (
                                                                                                    <Spinner size="sm" style={{ width: 16, height: 16 }} />
                                                                                                ) : (
                                                                                                    <i className="mdi mdi-check-circle" />
                                                                                                )}
                                                                                                <span>
                                                                                                    {currentCapturePreview.captureNum}/{captureCount}
                                                                                                </span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <span>{captured}/{captureCount}</span>
                                                                                        )}
                                                                                    </div>
                                                                                </>
                                                                            ) : (
                                                                                <div className="d-flex flex-column align-items-center justify-content-center h-100" style={{ color: '#94a3b8' }}>
                                                                                    <i className="mdi mdi-camera-off" style={{ fontSize: 40 }} />
                                                                                    <small className="mt-2" style={{ fontWeight: 500 }}>Camera Not Available</small>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </CardBody>
                                                                </Card>
                                                            </Col>
                                                        );
                                                    })}
                                                </Row>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    <ImageGallery_sequence
                        showGallery={showGallery}
                        stages={stages}
                        selectedStage={selectedStage}
                        setSelectedStage={setSelectedStage}
                        galleryImages={galleryImages}
                        loadingGallery={loadingGallery}
                        selectedImages={selectedImages}
                        setSelectedImages={setSelectedImages}
                        previewImage={previewImage}
                        setPreviewImage={setPreviewImage}
                        showPreview={showPreview}
                        setShowPreview={setShowPreview}
                        loadGalleryImages={loadGalleryImages}
                        handleDeleteImage={handleDeleteImage}
                        handleBulkDelete={handleBulkDelete}
                        selectedCameraLabel={selectedCameraLabel}
                    />
                </Row>
            </Container>
        </div>
    );
};
export default Admin_accuracy_image;