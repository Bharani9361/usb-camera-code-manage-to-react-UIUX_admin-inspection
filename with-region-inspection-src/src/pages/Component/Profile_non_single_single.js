import React, { useEffect, useRef, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import ImageGallery_single from "../Component/ImageGallery_single";
import {
    Container,
    Button,
    Col,
    Row,
    Card,
    CardBody,
    Input,
    Spinner,
    Modal,
    ModalHeader,
    ModalBody,
    Toast,
    ToastBody,
    ToastHeader, Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from "reactstrap";

import MetaTags from "react-meta-tags";
import { v4 as uuidv4 } from "uuid";
import urlSocket from "./urlSocket";
import WebcamCapture from "../WebcamCustom/WebcamCapture";
import { DEFAULT_RESOLUTION } from "./cameraConfig";
import PropTypes from "prop-types";
import { ImageUrl, outlineUrl } from "./imageUrl";
import SweetAlert from "react-bootstrap-sweetalert";
import Swal from "sweetalert2";
import { Badge } from 'antd'


const Profile_non_single = () => {
    const location = useLocation();
    const history = useHistory();
    const { datas } = location.state || {};
    const stages = datas?.stages || [];

    const [selectedStageIndex, setSelectedStageIndex] = useState(0);
    const [cameraStreams, setCameraStreams] = useState([]);
    const [cameraAvailable, setCameraAvailable] = useState(false);
    const [galleryImagesByCamera, setGalleryImagesByCamera] = useState({});
    const [selectedCameraLabel, setSelectedCameraLabel] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loadingGallery, setLoadingGallery] = useState(false);
    const [deletingImages, setDeletingImages] = useState(false);
    const [captureCount, setCaptureCount] = useState(parseInt(datas?.capture_count));
    const [cameraCapturedCounts, setCameraCapturedCounts] = useState({});
    const [capturedCameraIndices, setCapturedCameraIndices] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [previewModal, setPreviewModal] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const webcamRefs = useRef([]);
    const [capturing, setCapturing] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isCameraValid, setIsCameraValid] = useState(true);
    const [toastMessage, setToastMessage] = useState(null);
    const [toastType, setToastType] = useState(null);
    const [alert, setAlert] = useState(null);

    const [selectedOutlineColor, setSelectedOutlineColor] = useState('White Outline');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showOutline, setShowOutline] = useState(true); // Toggle outline visibility

    // NEW STATE: Toggle gallery visibility
    const [showGallery, setShowGallery] = useState(false);

    const selectedStage = stages[selectedStageIndex];

    // MODIFIED: Filter cameras to only show those with training_status === "training completed"
    // Use useMemo to prevent re-creating the array on every render
    const cameras = React.useMemo(() => {
        return (selectedStage?.camera_selection?.cameras || []).filter(
            (camera) => camera.training_status === "admin approved trained model"
        );
    }, [selectedStage?.camera_selection?.cameras]);

    useEffect(() => {
        const newCounts = {};
        cameras.forEach((camera, index) => {
            const cameraImages = galleryImagesByCamera[camera.label] || [];
            newCounts[`${selectedStage?.stage_code}-${camera.label}`] = cameraImages.length;
        });
        setCameraCapturedCounts(newCounts);
    }, [galleryImagesByCamera, selectedStage?.stage_code]);

    const fetchGalleryImages = async () => {
        if (!selectedStage) return;

        setLoadingGallery(true);
        try {
            const response = await urlSocket.post("/get_profile_creation_image", {
                comp_code: datas.comp_code,
                stage_code: selectedStage.stage_code,
            });

            if (response?.data?.images) {
                const groupedImages = {};
                response.data.images.forEach((img) => {
                    const cameraLabel = img.camera_label;
                    if (!groupedImages[cameraLabel]) {
                        groupedImages[cameraLabel] = [];
                    }
                    groupedImages[cameraLabel].push({
                        id: img._id || uuidv4(),
                        filename: img.filename,
                        local_path: img.insp_local_path,
                        cameraLabel: img.camera_label,
                        timestamp: img.timestamp,
                        width: img.width,
                        height: img.height,
                    });
                });

                setGalleryImagesByCamera(groupedImages);

                const cameraLabels = Object.keys(groupedImages);
                if (cameraLabels.length > 0 && !selectedCameraLabel) {
                    setSelectedCameraLabel(cameraLabels[0]);
                }
            }
        } catch (error) {
            console.error("Error fetching gallery images:", error);
            setToastMessage("Failed to load gallery images");
            setToastType("error");
        } finally {
            setLoadingGallery(false);
        }
    };

    useEffect(() => {
        if (showGallery) {
            fetchGalleryImages();
        }
        setSelectedImages([]);
    }, [selectedStageIndex, showGallery]);

    useEffect(() => {
        let activeStreams = [];
        let isMounted = true;

        async function setupCameras() {
            // Stop existing streams
            cameraStreams.forEach((s) => s?.getTracks().forEach((t) => t.stop()));

            // Check if there are cameras to setup
            if (cameras.length === 0) {
                console.log('No trained cameras available');
                if (isMounted) {
                    setCameraStreams([]);
                    setCameraAvailable(false);
                }
                return;
            }

            try {
                // Request permission first
                await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                const devices = await navigator.mediaDevices.enumerateDevices();

                console.log('Available video devices:', devices.filter(d => d.kind === 'videoinput'));
                console.log('Cameras to match:', cameras);

                const newStreams = [];

                for (let cam of cameras) {
                    if (!isMounted) break;

                    try {
                        console.log(`Trying to match camera: ${cam.label}`, {
                            originalLabel: cam.originalLabel,
                            v_id: cam.v_id,
                            p_id: cam.p_id
                        });

                        const videoDevice = devices.find((d) => {
                            if (d.kind !== "videoinput") return false;
                            const label = d.label?.toLowerCase() || "";
                            const matchByLabel = cam.originalLabel && label.includes(cam.originalLabel.toLowerCase());
                            const matchByVID = cam.v_id && label.includes(cam.v_id.toLowerCase());
                            const matchByPID = cam.p_id && label.includes(cam.p_id.toLowerCase());

                            console.log(`Checking device: ${d.label}`, {
                                matchByLabel,
                                matchByVID,
                                matchByPID
                            });

                            return matchByLabel || matchByVID || matchByPID;
                        });

                        if (!videoDevice) {
                            console.warn(`No matching device found for camera: ${cam.label}`);
                            newStreams.push(null);
                            continue;
                        }

                        console.log(`Found matching device for ${cam.label}:`, videoDevice.label);

                        const stream = await navigator.mediaDevices.getUserMedia({
                            video: { deviceId: { exact: videoDevice.deviceId } },
                            audio: false,
                        });

                        console.log(`Stream created successfully for ${cam.label}`);
                        newStreams.push(stream);
                    } catch (err) {
                        console.error(`Error accessing ${cam.label}:`, err);
                        newStreams.push(null);
                    }
                }

                if (!isMounted) {
                    // Cleanup streams if component unmounted during setup
                    newStreams.forEach((s) => s && s.getTracks().forEach((t) => t.stop()));
                    return;
                }

                activeStreams = newStreams;
                setCameraStreams(newStreams);
                setCameraAvailable(newStreams.some((s) => s !== null));
                validateCameraPreviews(newStreams);

                console.log('Camera setup complete:', {
                    totalCameras: cameras.length,
                    successfulStreams: newStreams.filter(s => s !== null).length,
                    failedStreams: newStreams.filter(s => s === null).length
                });
            } catch (err) {
                console.error('Error in setupCameras:', err);
                if (isMounted) {
                    setCameraStreams([]);
                    setCameraAvailable(false);
                }
            }
        }

        setupCameras();

        return () => {
            isMounted = false;
            activeStreams.forEach((s) => s && s.getTracks().forEach((t) => t.stop()));
        };
    }, [selectedStageIndex]);

    const validateCameraPreviews = (streams) => {
        const missingCameras = streams
            .map((stream, index) => (stream === null ? cameras[index]?.label : null))
            .filter((label) => label !== null);

        if (missingCameras.length === 0) {
            setIsCameraValid(true);
            return;
        }
        setIsCameraValid(false);

        const missingCamerasList = missingCameras.join(", ");
        if (missingCameras.length === 1) {
            setToastMessage(`The "${missingCamerasList}" is not showing its preview.`);
        } else {
            setToastMessage(`${missingCameras.length} cameras are not showing previews: ${missingCamerasList}`);
        }
        setToastType("error");
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            console.log('Assigning streams to video elements');
            cameraStreams.forEach((stream, i) => {
                const camera = cameras[i];
                if (!camera) {
                    console.warn(`No camera found at index ${i}`);
                    return;
                }

                const video = webcamRefs.current[camera.originalLabel];
                console.log(`Camera ${camera.label}:`, {
                    hasStream: !!stream,
                    hasVideo: !!video,
                    currentSrcObject: video?.srcObject,
                    streamId: stream?.id
                });

                if (video && stream && video.srcObject !== stream) {
                    video.srcObject = stream;
                    console.log(`Assigned stream to ${camera.label}`);
                }
            });
        }, 400);
        return () => clearTimeout(timer);
    }, [cameraStreams]);

    useEffect(() => {
        fetchGalleryImages();
    }, []);


    const handleStageChange = (e) => {
        setSelectedStageIndex(parseInt(e.target.value));
        setSelectedCameraLabel(null);
        setSelectedImage(null);
    };

    const back = () => history.goBack();

    const dataURLtoBlob = (dataURL) => {
        const byteString = atob(dataURL.split(",")[1]);
        const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    };

    const handleCaptureAll = async () => {
        if (capturing) return;
        if (!captureCount || captureCount < 1) {
            setToastMessage("Invalid capture count. Must be ≥ 1");
            setToastType("error");
            return;
        }

        const camerasAtLimit = [];
        const camerasToCapture = [];

        for (const cam of cameras) {
            const key = cam.label;
            const currentImages = galleryImagesByCamera[key] || [];

            if (currentImages.length >= captureCount) {
                camerasAtLimit.push(cam.label);
            } else {
                camerasToCapture.push(cam);
            }
        }

        if (camerasAtLimit.length === cameras.length) {
            await Swal.fire({
                title: "Capture Limit Reached",
                text: `All cameras already have ${captureCount} image${captureCount > 1 ? "s" : ""}. Delete some before capturing again.`,
                icon: "warning",
                confirmButtonColor: "#cec80cff",
            });
            return;
        }

        if (camerasAtLimit.length > 0) {
            setToastMessage(
                `Skipping ${camerasAtLimit.join(", ")} — already at limit. Capturing from ${camerasToCapture
                    .map((c) => c.label)
                    .join(", ")}.`
            );
            setToastType("warning");
        }

        setCapturing(true);
        setCapturedCameraIndices([]);

        try {
            const successfulCameras = [];
            const failedCameras = [];
            const formData = new FormData();

            formData.append("comp_name", datas.comp_name);
            formData.append("comp_id", datas.comp_id);
            formData.append("comp_code", datas.comp_code);
            formData.append("stage_name", selectedStage.stage_name);
            formData.append("stage_code", selectedStage.stage_code);

            let imgIndex = 0;

            for (const cam of camerasToCapture) {
                const webcamInstance = webcamRefs.current[cam.originalLabel];
                if (!webcamInstance || !webcamInstance.captureZoomedImage || webcamInstance.cameraDisconnected) {
                    failedCameras.push(cam.label);
                    continue;
                }

                try {
                    const imageSrcData = await webcamInstance.captureZoomedImage();
                    if (!imageSrcData) throw new Error("No image data");

                    const blob = dataURLtoBlob(imageSrcData);
                    const fileName = `${cam.label}_${uuidv4()}.png`;

                    const imgObj = new Image();
                    imgObj.src = imageSrcData;
                    await new Promise((resolve) => {
                        imgObj.onload = resolve;
                        imgObj.onerror = resolve;
                    });

                    const width = imgObj.naturalWidth || 0;
                    const height = imgObj.naturalHeight || 0;

                    formData.append(`img_${imgIndex}`, blob, fileName);
                    formData.append(`img_${imgIndex}_label`, cam.label);
                    formData.append(`img_${imgIndex}_width`, width);
                    formData.append(`img_${imgIndex}_height`, height);

                    imgIndex++;
                    successfulCameras.push(cam.label);
                } catch (error) {
                    failedCameras.push(cam.label);
                    console.error(`Capture failed for ${cam.label}:`, error);
                }
            }

            if (successfulCameras.length === 0) {
                setToastMessage("No cameras captured (all at limit or failed)");
                setToastType("error");
                setCapturing(false);
                return;
            }

            await urlSocket.post("/profile_sequence", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setToastMessage(`Captured from: ${successfulCameras.join(", ")}`);
            setToastType("success");

            await fetchGalleryImages();
        } catch (error) {
            console.error(error);
            setToastMessage(`Capture failed: ${error.message || "An error occurred"}`);
            setToastType("error");
        } finally {
            setCapturing(false);
        }
    };

    const handleTrainingSync = async () => {
        try {
            setIsSyncing(true);
            const res = await urlSocket.post('/profile_image_sync', {
                comp_name: datas.comp_name,
                comp_code: datas.comp_code
            });
            if (res?.data?.count > 0) {
                setToastMessage(`${res.data.sts} - Total Synced: ${res.data.count}`);
                setToastType("success");
                if (showGallery) {
                    setTimeout(() => {
                        fetchGalleryImages();
                    }, 1000);
                }
            } else {
                setToastMessage("All components are already synced");
                setToastType("success");
            }
        } catch (err) {
            setToastMessage("Error during sync. Please try again.");
            setToastType("error");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDeleteImage = async (filename, cameraLabel) => {
        setDeletingImages(true);
        try {
            await urlSocket.post("/profile_delete_training_image", {
                filename,
                camera_label: cameraLabel,
            });

            setGalleryImagesByCamera((prev) => {
                const updated = { ...prev };
                if (updated[cameraLabel]) {
                    updated[cameraLabel] = updated[cameraLabel].filter((img) => img.filename !== filename);
                    if (updated[cameraLabel].length === 0) {
                        delete updated[cameraLabel];
                    }
                }
                return updated;
            });

            setSelectedImages((prev) => prev.filter((img) => img.filename !== filename));
            if (previewImage?.filename === filename) {
                setPreviewImage(null);
                setPreviewModal(false);
            }

            setToastMessage("Image deleted successfully");
            setToastType("success");
        } catch (err) {
            console.error("Delete error:", err);
            setToastMessage("Failed to delete image");
            setToastType("error");
        } finally {
            setDeletingImages(false);
        }
    };

    const handleDelete = (e, filename, cameraLabel) => {
        if (e && e.stopPropagation) e.stopPropagation();

        setAlert(
            <SweetAlert
                warning
                showCancel
                confirmBtnText="Yes, delete it!"
                cancelBtnText="Cancel"
                confirmBtnBsStyle="danger"
                title="Are you sure?"
                onConfirm={() => {
                    setAlert(null);
                    handleDeleteImage(filename, cameraLabel);
                }}
                onCancel={() => setAlert(null)}
                focusCancelBtn
            >
                This action cannot be undone.
            </SweetAlert>
        );
    };

    const handleImageSelect = (image) => {
        setSelectedImages((prev) => {
            const isSelected = prev.some((img) => img.id === image.id);
            if (isSelected) {
                return prev.filter((img) => img.id !== image.id);
            } else {
                return [...prev, image];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedImages.length === selectedCameraImages.length) {
            setSelectedImages([]);
        } else {
            setSelectedImages([...selectedCameraImages]);
        }
    };

    const handleDeleteSelected = () => {
        if (selectedImages.length === 0) return;

        setAlert(
            <SweetAlert
                warning
                showCancel
                confirmBtnText="Yes, delete them!"
                cancelBtnText="Cancel"
                confirmBtnBsStyle="danger"
                title={`Delete ${selectedImages.length} image${selectedImages.length > 1 ? "s" : ""}?`}
                onConfirm={async () => {
                    setAlert(null);
                    setDeletingImages(true);
                    try {
                        for (const image of selectedImages) {
                            await urlSocket.post("/profile_delete_training_image", {
                                filename: image.filename,
                                camera_label: image.cameraLabel,
                            });
                        }

                        setGalleryImagesByCamera((prev) => {
                            const updated = { ...prev };
                            selectedImages.forEach((img) => {
                                if (updated[img.cameraLabel]) {
                                    updated[img.cameraLabel] = updated[img.cameraLabel].filter(
                                        (i) => i.filename !== img.filename
                                    );
                                    if (updated[img.cameraLabel].length === 0) {
                                        delete updated[img.cameraLabel];
                                    }
                                }
                            });
                            return updated;
                        });

                        setToastMessage(
                            `${selectedImages.length} image${selectedImages.length > 1 ? "s" : ""} deleted successfully`
                        );
                        setToastType("success");
                        setSelectedImages([]);
                    } catch (error) {
                        setToastMessage("Failed to delete images");
                        setToastType("error");
                    } finally {
                        setDeletingImages(false);
                    }
                }}
                onCancel={() => setAlert(null)}
                focusCancelBtn
            >
                This action cannot be undone.
            </SweetAlert>
        );
    };

    const handleImagePreview = (e, image) => {
        if (e && e.stopPropagation) e.stopPropagation();
        setPreviewImage(image);
        setPreviewModal(true);
    };

    const selectedCameraImages = selectedCameraLabel
        ? galleryImagesByCamera[selectedCameraLabel] || []
        : [];

    const totalImagesCount = Object.values(galleryImagesByCamera).reduce(
        (sum, images) => sum + images.length,
        0
    );

    // NEW: Check if there are any trained cameras to display
    const hasTrainedCameras = cameras.length > 0;

    const outlineColors = [
        'White Outline',
        'Red Outline',
        'Green Outline',
        'Blue Outline',
        'Black Outline',
        'Orange Outline',
        'Yellow Outline'
    ];

    // Color badge mapping
    const colorBadgeStyles = {
        'White Outline': { bg: '#ffffff', text: '#000000' },
        'Red Outline': { bg: '#ef4444', text: '#ffffff' },
        'Green Outline': { bg: '#10b981', text: '#ffffff' },
        'Blue Outline': { bg: '#3b82f6', text: '#ffffff' },
        'Black Outline': { bg: '#1f2937', text: '#ffffff' },
        'Orange Outline': { bg: '#f97316', text: '#ffffff' },
        'Yellow Outline': { bg: '#eab308', text: '#000000' }
    };

    // FIXED: showImage function
    const showImage = (output_img) => {
        console.log("output_img", output_img)
        if (!output_img) return null;

        const imgurl = outlineUrl;

        return imgurl + output_img;
    };

    // FIXED: getCurrentOutlinePath function
    const getCurrentOutlinePath = (camera) => {
        if (!camera || !camera.outline_paths) return null;

        // Map outline color selection to path keys
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
            className="page-content"
            style={{
                backgroundColor: "#f8f9fa",
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <div
                style={{
                    padding: '14px 18px',
                    backgroundColor: '#ffffff',
                    borderBottom: '2px solid #f0f0f0',
                    flex: '0 0 auto'
                }}>
                <Container fluid className="px-4">
                    <Row className="align-items-center g-2">
                        <Col xs={12} md={6} lg={2}>
                            <h5 className="mb-0" style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>
                                Remote Camera Gallery
                            </h5>
                        </Col>

                        <Col xs={12} md={6} lg={3}>
                            <div
                                style={{
                                    backgroundColor: "#f9fafb",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "6px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "6px 10px",
                                    height: "40px",
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "12px",
                                        color: "#6b7280",
                                        fontWeight: "500",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.3px",
                                        marginRight: "8px",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Selected Stage:
                                </span>
                                <Input
                                    type="select"
                                    value={selectedStageIndex}
                                    onChange={handleStageChange}
                                    style={{
                                        fontSize: "13px",
                                        borderRadius: "4px",
                                        border: "1px solid #d1d5db",
                                        padding: "4px 8px",
                                        color: "#374151",
                                        height: "28px",
                                        width: "70%",
                                    }}
                                >
                                    {stages.map((stage, index) => (
                                        <option key={stage._id.$oid} value={index}>
                                            {stage.stage_name} ({stage.stage_code})
                                        </option>
                                    ))}
                                </Input>
                            </div>
                        </Col>

                        <Col xs={12} md={6} lg={3}>
                            <div
                                style={{
                                    padding: "8px 12px",
                                    backgroundColor: "#f9fafb",
                                    borderRadius: "6px",
                                    border: "1px solid #e5e7eb",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    height: "40px",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "12px",
                                        color: "#6b7280",
                                        fontWeight: "500",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.3px",
                                    }}
                                >
                                    Current Stage:
                                </span>
                                <span
                                    style={{
                                        fontSize: "13px",
                                        fontWeight: "600",
                                        color: "#111827",
                                        marginLeft: "6px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {selectedStage?.stage_name}{" "}
                                    <span style={{ color: "#6b7280", fontWeight: "400" }}>
                                        ({selectedStage?.stage_code})
                                    </span>
                                </span>
                            </div>
                        </Col>

                        <Col xs={12} md={6} lg={4} className="d-flex gap-2 justify-content-lg-end">

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
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px" // space between icon and text
                                }}
                            >
                                <i className={`fa ${showGallery ? "fa-camera" : "fa-images"}`} />
                                {showGallery ? "Hide Gallery" : "Show Gallery"}
                            </Button>


                            <Button
                                size="sm"
                                onClick={handleTrainingSync}
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
                </Container>
            </div>

            {selectedStage && (
                <Container fluid className="px-4 py-4" style={{ flex: "1 1 auto", overflow: "hidden" }}>
                    {/* NEW: Show message if no trained cameras */}
                    {!hasTrainedCameras && (
                        <Row className="justify-content-center">
                            <Col xs={12} md={8} lg={6}>
                                <Card className="border-0 shadow-sm" style={{ borderRadius: "10px", backgroundColor: "#fff3cd" }}>
                                    <CardBody className="text-center py-5">
                                        <i className="mdi mdi-alert-circle-outline" style={{ fontSize: "48px", color: "#856404" }} />
                                        <h5 className="mt-3" style={{ color: "#856404", fontWeight: "600" }}>
                                            No Trained Cameras Available
                                        </h5>
                                        <p className="mb-0" style={{ color: "#856404" }}>
                                            This stage has no cameras with completed training status.
                                            Please complete camera training before proceeding.
                                        </p>
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    )}

                    {/* Show content only if there are trained cameras */}
                    {hasTrainedCameras && (
                        <Row style={{ height: "100%" }}>
                            {alert}

                            <Col xs={12} lg={showGallery ? 7 : 12} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                                <div style={{ flex: 1, overflowY: "auto", paddingLeft: "12px" }}>

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

                                    </Row>

                                    {/* --------------------------------------------------------------- */}
                                    {/*  CAMERA GRID – fixed outline + minor UX polish                 */}
                                    {/* --------------------------------------------------------------- */}
                                    <Row className="g-3 mb-4">
                                        {cameras.map((camera, index) => {
                                            const outlinePath = getCurrentOutlinePath(camera);
                                            const outlineImgUrl = outlinePath ? showImage(outlinePath) : null;

                                            return (
                                                <Col
                                                    key={camera.originalLabel}               // 
                                                    xs={12}
                                                    sm={showGallery ? 6 : 4}
                                                    md={showGallery ? 6 : 3}
                                                >
                                                    <Card
                                                        className="border-0"
                                                        style={{
                                                            borderRadius: "10px",
                                                            overflow: "hidden",
                                                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                                                            backgroundColor: "#fff",
                                                            transition: "transform .2s ease, box-shadow .2s ease",
                                                        }}
                                                        onMouseEnter={e => {
                                                            e.currentTarget.style.transform = "translateY(-3px)";
                                                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                                                        }}
                                                        onMouseLeave={e => {
                                                            e.currentTarget.style.transform = "translateY(0)";
                                                            e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
                                                        }}
                                                    >
                                                        {/* ---------- CARD HEADER ---------- */}
                                                        <div
                                                            style={{
                                                                padding: "12px 16px",
                                                                backgroundColor: "#f8f9fa",
                                                                borderBottom: "1px solid #e5e7eb",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "space-between",
                                                            }}
                                                        >
                                                            <h6
                                                                className="mb-0 text-truncate"
                                                                style={{
                                                                    fontSize: "14px",
                                                                    fontWeight: 600,
                                                                    color: "#1f2937",
                                                                    letterSpacing: "0.3px",
                                                                }}
                                                            >
                                                                {camera.label}
                                                            </h6>

                                                            {/* ----- captured-count badge ----- */}
                                                            <span
                                                                style={{
                                                                    fontSize: "13px",
                                                                    fontWeight: 600,
                                                                    color:
                                                                        capturing && capturedCameraIndices.includes(index)
                                                                            ? "#3b82f6"
                                                                            : (galleryImagesByCamera[camera.label] || []).length >= captureCount
                                                                                ? "#10b981"
                                                                                : (galleryImagesByCamera[camera.label] || []).length > 0
                                                                                    ? "#f59e0b"
                                                                                    : "#6b7280",
                                                                    backgroundColor:
                                                                        capturing && capturedCameraIndices.includes(index)
                                                                            ? "#eff6ff"
                                                                            : (galleryImagesByCamera[camera.label] || []).length >= captureCount
                                                                                ? "#d1fae5"
                                                                                : (galleryImagesByCamera[camera.label] || []).length > 0
                                                                                    ? "#fef3c7"
                                                                                    : "#f3f4f6",
                                                                    borderRadius: "8px",
                                                                    padding: "6px 12px",
                                                                    marginLeft: "8px",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "6px",
                                                                    border:
                                                                        capturing && capturedCameraIndices.includes(index)
                                                                            ? "1.5px solid #93c5fd"
                                                                            : (galleryImagesByCamera[camera.label] || []).length >= captureCount
                                                                                ? "1.5px solid #6ee7b7"
                                                                                : (galleryImagesByCamera[camera.label] || []).length > 0
                                                                                    ? "1.5px solid #fcd34d"
                                                                                    : "1.5px solid #e5e7eb",
                                                                    boxShadow:
                                                                        capturing && capturedCameraIndices.includes(index)
                                                                            ? "0 2px 8px rgba(59,130,246,.15)"
                                                                            : (galleryImagesByCamera[camera.label] || []).length >= captureCount
                                                                                ? "0 2px 8px rgba(16,185,129,.15)"
                                                                                : "0 1px 3px rgba(0,0,0,.08)",
                                                                    transition: "all .3s ease",
                                                                    minWidth: "65px",
                                                                    justifyContent: "center",
                                                                }}
                                                            >
                                                                <span
                                                                    style={{
                                                                        fontSize: "11px",
                                                                        fontWeight: 600,
                                                                        color: "#6b7280",
                                                                        textTransform: "uppercase",
                                                                        letterSpacing: "0.5px",
                                                                    }}
                                                                >
                                                                    Captured Image Count
                                                                </span>

                                                                {capturing && capturedCameraIndices.includes(index) ? (
                                                                    <>
                                                                        <Spinner size="sm" style={{ width: 14, height: 14, color: "#3b82f6" }} />
                                                                        <span style={{ letterSpacing: "0.3px" }}>
                                                                            {(galleryImagesByCamera[camera.label] || []).length}/{captureCount}
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <i className="mdi mdi-camera-outline" style={{ color: "#9ca3af", fontSize: "16px" }} />
                                                                        <span style={{ letterSpacing: "0.3px" }}>
                                                                            {(galleryImagesByCamera[camera.label] || []).length}/{captureCount}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </span>


                                                            {/* ----- live indicator ----- */}
                                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                                <span
                                                                    style={{
                                                                        width: "8px",
                                                                        height: "8px",
                                                                        borderRadius: "50%",
                                                                        backgroundColor: "#10b981",
                                                                        animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
                                                                    }}
                                                                />
                                                                <span
                                                                    style={{
                                                                        fontSize: "12px",
                                                                        color: "#10b981",
                                                                        fontWeight: 600,
                                                                        textTransform: "uppercase",
                                                                        letterSpacing: "0.5px",
                                                                    }}
                                                                >
                                                                    Live
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* ---------- CARD BODY (video + outline) ---------- */}
                                                        <CardBody className="p-0">
                                                            <div
                                                                style={{
                                                                    position: "relative",
                                                                    width: "100%",
                                                                    paddingBottom: "75%",   // 4:3 aspect ratio
                                                                    backgroundColor: "#000",
                                                                    overflow: "hidden",
                                                                }}
                                                            >
                                                                {showOutline && outlineImgUrl && (
                                                                    <img
                                                                        src={outlineImgUrl}
                                                                        alt={`${selectedOutlineColor} outline`}
                                                                        style={{
                                                                            position: "absolute",
                                                                            inset: 0,
                                                                            width: "100%",
                                                                            height: "100%",
                                                                            objectFit: "contain",
                                                                            zIndex: 2,
                                                                            pointerEvents: "none",
                                                                            opacity: 0.9,
                                                                        }}
                                                                        onError={(e) => {
                                                                            console.warn("Outline failed to load:", outlineImgUrl);
                                                                            e.currentTarget.style.display = "none";
                                                                        }}
                                                                    />
                                                                )}

                                                                {/* ---- WEBCAM FEED ---- */}
                                                                <WebcamCapture
                                                                    ref={el => (webcamRefs.current[camera.originalLabel] = el)}
                                                                    key={camera.originalLabel}
                                                                    resolution={DEFAULT_RESOLUTION}
                                                                    videoConstraints={{
                                                                        width: DEFAULT_RESOLUTION.width,
                                                                        height: DEFAULT_RESOLUTION.height,
                                                                    }}
                                                                    zoom={1}
                                                                    center={{ x: 0.5, y: 0.5 }}
                                                                    cameraLabel={camera.originalLabel}
                                                                    style={{
                                                                        position: "absolute",
                                                                        inset: 0,
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        objectFit: "cover",
                                                                        zIndex: 1,
                                                                    }}
                                                                />
                                                            </div>
                                                        </CardBody>
                                                    </Card>
                                                </Col>
                                            );
                                        })}
                                    </Row>

                                    <div className="text-center pb-3">
                                        <Button
                                            size="lg"
                                            onClick={handleCaptureAll}
                                            disabled={!cameraAvailable || capturing}
                                            style={{
                                                backgroundColor: "#6366f1",
                                                border: "none",
                                                borderRadius: "8px",
                                                padding: "12px 32px",
                                                fontSize: "15px",
                                                fontWeight: "600",
                                                color: "#fff",
                                                opacity: (!cameraAvailable || capturing) ? 0.6 : 1,
                                                cursor: (!cameraAvailable || capturing) ? "not-allowed" : "pointer",
                                            }}
                                        >
                                            {capturing ? (
                                                <>
                                                    <i className="fa fa-spinner fa-spin me-2" /> Capturing...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fa fa-camera me-2" /> Capture All Cameras
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </Col>
                            <ImageGallery_single
                                showGallery={showGallery}
                                galleryImagesByCamera={galleryImagesByCamera}
                                selectedCameraLabel={selectedCameraLabel}
                                setSelectedCameraLabel={setSelectedCameraLabel}
                                selectedImages={selectedImages}
                                setSelectedImages={setSelectedImages}
                                loadingGallery={loadingGallery}
                                deletingImages={deletingImages}
                                totalImagesCount={totalImagesCount}
                                selectedStage={selectedStage}
                                fetchGalleryImages={fetchGalleryImages}
                                handleSelectAll={handleSelectAll}
                                handleDeleteSelected={handleDeleteSelected}
                                selectedCameraImages={selectedCameraImages}
                                handleImagePreview={handleImagePreview}
                                handleImageSelect={handleImageSelect}
                                handleDelete={handleDelete}
                                previewModal={previewModal}
                                setPreviewModal={setPreviewModal}
                                previewImage={previewImage}
                            />
                        </Row>
                    )}
                </Container>
            )}

            {toastMessage && (
                <Toast
                    message={toastMessage}
                    type={toastType}
                    onClose={() => setToastMessage(null)}
                />
            )}
        </div>
    );
};

export default Profile_non_single;