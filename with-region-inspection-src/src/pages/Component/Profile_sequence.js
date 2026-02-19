import React, { useEffect, useRef, useState } from "react";
import WebcamCapture from "pages/WebcamCustom/WebcamCapture";
import { useLocation, useHistory } from "react-router-dom";
import urlSocket from "./urlSocket";
import { ImageUrl, outlineUrl } from "./imageUrl";
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
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    CardText
} from "reactstrap";
import Swal from "sweetalert2";
import { DEFAULT_RESOLUTION } from "./cameraConfig";
import './index.css';
import ImageGallery_sequence from "../Component/ImageGallery_sequence";

const Profile_sequence = () => {
    const location = useLocation();
    const history = useHistory();
    const { datas, completedCameras } = location.state || {};

    const filteredStages = React.useMemo(() => {
        if (!datas?.stages) return [];

        return datas.stages
            .map(stage => {
                const completedCams = stage?.camera_selection?.cameras?.filter(
                    cam => cam.training_status === "admin approved trained model"
                ) || [];

                if (completedCams.length === 0) return null;

                return {
                    ...stage,
                    camera_selection: {
                        ...stage.camera_selection,
                        cameras: completedCams
                    }
                };
            })
            .filter(stage => stage !== null);
    }, [datas?.stages]);

    const stages = filteredStages;

    const [cameraDevices, setCameraDevices] = useState({});
    const webcamRefs = useRef({});
    const [isCapturing, setIsCapturing] = useState(false);
    const [captureStatus, setCaptureStatus] = useState({});
    const [notification, setNotification] = useState("");
    const [selectedCameraLabel, setSelectedCameraLabel] = useState(null);
    const [captureCount, setCaptureCount] = useState(parseInt(datas?.capture_count) || 5);

    const [galleryImages, setGalleryImages] = useState([]);
    const [loadingGallery, setLoadingGallery] = useState(false);
    const [selectedStage, setSelectedStage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [selectedImages, setSelectedImages] = useState(new Set());
    const [currentCapturePreview, setCurrentCapturePreview] = useState(null);
    const [cameraCapturedCounts, setCameraCapturedCounts] = useState({});
    const [isSyncing, setIsSyncing] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [selectedOutlineColor, setSelectedOutlineColor] = useState('White Outline');
    const [showOutline, setShowOutline] = useState(true);


    useEffect(() => {
        if (stages.length === 0) {
            Swal.fire({
                title: "No Completed Cameras",
                text: "No cameras have completed training yet.",
                icon: "warning",
                confirmButtonColor: "#dc3545",
            }).then(() => {
                history.goBack();
            });
        }
    }, [stages, history]);

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
        if (stages.length > 0) {
            setupCameraDevices();
        }
    }, [stages]);

    useEffect(() => {
        const loadAllCounts = async () => {
            const counts = {};
            for (let s = 0; s < stages.length; s++) {
                const stage = stages[s];
                try {
                    const { data } = await urlSocket.post("/get_profile_creation_image", {
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
    }, [stages, datas?.comp_code]);

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
            const { data } = await urlSocket.post("/get_profile_creation_image", {
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
            const { data } = await urlSocket.post("/profile_delete_training_image", {
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
            return urlSocket.post("/profile_delete_training_image", {
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

    // akka method each stage image take completet then next stage

    // const handleManualCapture = async () => {
    //   if (isCapturing) return;

    //   const stage = stages[selectedStage];
    //   if (!stage) return;

    //   const cams = stage?.camera_selection?.cameras || [];
    //   const devIds = cameraDevices[selectedStage] || [];

    //   let stageComplete = true;
    //   for (let c = 0; c < cams.length; c++) {
    //     const key = `${selectedStage}-${c}`;
    //     const cur = cameraCapturedCounts[key] || 0;
    //     if (cur < captureCount) {
    //       stageComplete = false;
    //       break;
    //     }
    //   }

    //   if (stageComplete) {
    //     if (selectedStage < stages.length - 1) {
    //       setSelectedStage(selectedStage + 1);
    //       await new Promise((r) => setTimeout(r, 800));
    //       showNotification(`Stage ${selectedStage + 1} completed! Moving to next stage...`);
    //     } else {
    //       Swal.fire({
    //         title: "All Stages Complete!",
    //         text: "All cameras in all stages have reached the capture limit.",
    //         icon: "success",
    //         confirmButtonColor: "#10b981",
    //       });
    //     }
    //     return;
    //   }

    //   setIsCapturing(true);

    //   try {
    //     // Track new counts locally to avoid stale state issues
    //     const newCounts = { ...cameraCapturedCounts };

    //     const captures = await Promise.all(
    //       cams.map(async (cam, c) => {
    //         const key = `${selectedStage}-${c}`;
    //         const cur = cameraCapturedCounts[key] || 0;

    //         if (cur >= captureCount) return null;

    //         const webcam = webcamRefs.current[cam.originalLabel];
    //         if (!webcam || !devIds[c]) return null;

    //         const b64 = webcam.captureZoomedImage?.();
    //         if (!b64) return null;

    //         setCurrentCapturePreview({
    //           image: b64,
    //           captureNum: cur + 1,
    //           totalCaptures: captureCount,
    //           stageName: stage.stage_name,
    //           stageIndex: selectedStage,
    //           camIndex: c,
    //           cameraLabel: cam.label,
    //           status: "uploading",
    //         });

    //         const blob = dataURLtoBlob(b64);
    //         const fileName = `${stage.stage_name}_${cam.label}_${Date.now()}.png`;
    //         const fd = new FormData();
    //         fd.append("comp_name", datas.comp_name);
    //         fd.append("comp_id", datas.comp_id);
    //         fd.append("comp_code", datas.comp_code);
    //         fd.append("stage_name", stage.stage_name);
    //         fd.append("stage_code", stage.stage_code);
    //         fd.append("img_0", blob, fileName);
    //         fd.append("img_0_label", cam.label);


    //         try {
    //           await urlSocket.post("/remoteMultiCapture", fd);
    //           // Update local tracking
    //           newCounts[key] = (newCounts[key] || 0) + 1;
    //           return { cam: cam.label, status: "success", key };
    //         } catch (e) {
    //           console.error(`Upload failed for ${cam.label}`, e);
    //           return { cam: cam.label, status: "error", key: null };
    //         }
    //       })
    //     );

    //     // Update state with all new counts at once
    //     setCameraCapturedCounts(newCounts);

    //     if (showGallery) {
    //       await loadGalleryImages(selectedStage);
    //     }

    //     // Check if stage is complete using the local newCounts
    //     let nowComplete = true;
    //     for (let c = 0; c < cams.length; c++) {
    //       const key = `${selectedStage}-${c}`;
    //       const cur = newCounts[key] || 0;
    //       if (cur < captureCount) {
    //         nowComplete = false;
    //         break;
    //       }
    //     }

    //     if (nowComplete && selectedStage < stages.length - 1) {
    //       showNotification(`Stage ${selectedStage + 1} completed! Moving to next stage...`);
    //       await new Promise((r) => setTimeout(r, 1500));
    //       setSelectedStage(selectedStage + 1);
    //       await new Promise((r) => setTimeout(r, 800));
    //     } else {
    //       showNotification("Images captured successfully!");
    //     }

    //   } catch (e) {
    //     console.error(e);
    //     Swal.fire("Error", "Capture failed.", "error");
    //   } finally {
    //     setIsCapturing(false);
    //     setCurrentCapturePreview(null);
    //   }
    // };





    const handleManualCapture = async () => {
        if (isCapturing) return;

        const stage = stages[selectedStage];
        if (!stage) return;

        const cams = stage?.camera_selection?.cameras || [];
        const devIds = cameraDevices[selectedStage] || [];

        // Check if CURRENT stage is complete
        let currentStageComplete = true;
        for (let c = 0; c < cams.length; c++) {
            const key = `${selectedStage}-${c}`;
            const cur = cameraCapturedCounts[key] || 0;
            if (cur < captureCount) {
                currentStageComplete = false;
                break;
            }
        }

        // If current stage is complete, find the first incomplete stage
        if (currentStageComplete) {
            let foundIncompleteStage = false;

            for (let stageIdx = 0; stageIdx < stages.length; stageIdx++) {
                const stg = stages[stageIdx];
                const stageCams = stg?.camera_selection?.cameras || [];
                let stageComplete = true;

                for (let c = 0; c < stageCams.length; c++) {
                    const key = `${stageIdx}-${c}`;
                    const cur = cameraCapturedCounts[key] || 0;
                    if (cur < captureCount) {
                        stageComplete = false;
                        break;
                    }
                }

                if (!stageComplete) {
                    // Found an incomplete stage, switch to it
                    setSelectedStage(stageIdx);
                    showNotification(`Current stage complete! Moving to Stage ${stageIdx + 1}...`);
                    foundIncompleteStage = true;
                    return;
                }
            }

            // If no incomplete stage found, all stages are complete
            if (!foundIncompleteStage) {
                Swal.fire({
                    title: "All Stages Complete!",
                    text: "All cameras in all stages have reached the capture limit.",
                    icon: "success",
                    confirmButtonColor: "#10b981",
                });
                return;
            }
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
                        await urlSocket.post("/profile_sequence", fd);
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

            // Check if current stage is now complete using the local newCounts
            let nowComplete = true;
            for (let c = 0; c < cams.length; c++) {
                const key = `${selectedStage}-${c}`;
                const cur = newCounts[key] || 0;
                if (cur < captureCount) {
                    nowComplete = false;
                    break;
                }
            }

            if (nowComplete) {
                // Find next incomplete stage
                let foundIncompleteStage = false;

                for (let stageIdx = 0; stageIdx < stages.length; stageIdx++) {
                    const stg = stages[stageIdx];
                    const stageCams = stg?.camera_selection?.cameras || [];
                    let stageComplete = true;

                    for (let c = 0; c < stageCams.length; c++) {
                        const key = `${stageIdx}-${c}`;
                        const cur = newCounts[key] || 0;
                        if (cur < captureCount) {
                            stageComplete = false;
                            break;
                        }
                    }

                    if (!stageComplete) {
                        showNotification(`Stage ${selectedStage + 1} completed! Moving to Stage ${stageIdx + 1}...`);
                        await new Promise((r) => setTimeout(r, 1500));
                        setSelectedStage(stageIdx);
                        foundIncompleteStage = true;
                        break;
                    }
                }

                if (!foundIncompleteStage) {
                    showNotification("All stages completed!");
                }
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

    const handleManualCapturemode2 = async () => {
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
                await new Promise(r => setTimeout(r, 800));
                showNotification(
                    `Stage ${selectedStage + 1} completed! Moving to next stage...`
                );
            } else {
                Swal.fire({
                    title: 'All Stages Complete!',
                    text: 'All cameras in all stages have reached the capture limit.',
                    icon: 'success',
                    confirmButtonColor: '#10b981'
                });
            }
            return;
        }

        setIsCapturing(true);

        try {
            const newCounts = { ...cameraCapturedCounts };

            const captures = await Promise.all(
                cams.map(async (cam, c) => {
                    const key = `${selectedStage}-${c}`;
                    const webcam = webcamRefs.current[cam.originalLabel];
                    if (!webcam || !devIds[c]) return null;

                    const b64 = webcam.captureZoomedImage?.();
                    if (!b64) return null;

                    setCurrentCapturePreview({
                        image: b64,
                        captureNum: (newCounts[key] || 0) + 1,
                        totalCaptures: captureCount,
                        stageName: stage.stage_name,
                        stageIndex: selectedStage,
                        camIndex: c,
                        cameraLabel: cam.label,
                        status: 'uploading'
                    });

                    const blob = dataURLtoBlob(b64);
                    const fileName = `${stage.stage_name}_${cam.label}_${Date.now()}.png`;
                    const fd = new FormData();
                    fd.append('comp_name', datas.comp_name);
                    fd.append('comp_id', datas.comp_id);
                    fd.append('comp_code', datas.comp_code);
                    fd.append('stage_name', stage.stage_name);
                    fd.append('stage_code', stage.stage_code);
                    fd.append('img_0', blob, fileName);
                    fd.append('img_0_label', cam.label);

                    try {
                        await urlSocket.post('/profile_sequence', fd);
                        // Update local tracking
                        newCounts[key] = (newCounts[key] || 0) + 1;
                        return { cam: cam.label, status: 'success', key };
                    } catch (e) {
                        console.error(`Upload failed for ${cam.label}`, e);
                        return { cam: cam.label, status: 'error', key: null };
                    }
                })
            );

            // Update state with all new counts at once
            setCameraCapturedCounts(newCounts);

            if (showGallery) {
                await loadGalleryImages(selectedStage);
            }

            showNotification(
                `Stage ${selectedStage + 1} images captured successfully!`
            );

            await new Promise(r => setTimeout(r, 1000));

            if (selectedStage < stages.length - 1) {
                setSelectedStage(selectedStage + 1);
            } else {
                showNotification('All stages completed! Returning to first stage...');
                await new Promise(r => setTimeout(r, 1000));
                setSelectedStage(0);
            }
        } catch (e) {
            console.error(e);
            Swal.fire('Error', 'Capture failed.', 'error');
        } finally {
            setIsCapturing(false);
            setCurrentCapturePreview(null);
        }
    };

    const handleStageCameraSync = async () => {
        setIsSyncing(true);
        try {
            const { data } = await urlSocket.post("/profile_image_sync", {
                comp_name: datas.comp_name,
                comp_code: datas.comp_code
            });

            console.log('syncdata', data)
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

    if (stages.length === 0) {
        return null;
    }

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

                {/* <Card className="header-card mb-4">
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
                                            Image Sync
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
                </Card> */}

                <Card className='header-card mb-4'>
                    <CardBody className='py-3'>
                        <Row className='align-items-center g-3'>
                            <Col xs={12} sm={6} lg={4}>
                                <h4
                                    className='mb-0 text-white d-flex align-items-center'
                                    style={{ fontSize: 'clamp(16px, 2.5vw, 20px)' }}
                                >
                                    Remote Camera Gallery
                                </h4>
                            </Col>

                            <Col xs={12} sm={6} lg={4} className='text-center'>
                                <h5
                                    className='mb-0 text-white'
                                    style={{ fontSize: 'clamp(14px, 2vw, 18px)' }}
                                >
                                    Stage {selectedStage + 1} of {stages.length}
                                </h5>
                            </Col>

                            <Col
                                xs={12}
                                lg={4}
                                className='d-flex flex-wrap justify-content-lg-end justify-content-start gap-2'
                            >
                                <Button
                                    size='sm'
                                    color="success"
                                    className="px-4"
                                    onClick={() => {
                                        if (datas.sequential_sub_mode === 'Mode1') {
                                            handleManualCapture();
                                        } else {
                                            handleManualCapturemode2();
                                        }
                                    }}
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
                                <Button
                                    size='sm'
                                    color={showGallery ? 'warning' : 'info'}
                                    outline
                                    onClick={() => setShowGallery(!showGallery)}
                                    style={{ fontSize: 'clamp(11px, 1.5vw, 13px)' }}
                                >
                                    <i
                                        className={`mdi ${showGallery ? 'mdi-camera' : 'mdi-image-multiple'
                                            } me-1`}
                                    />
                                    {showGallery ? 'Hide' : 'Gallery'}
                                </Button>

                                <Button
                                    size='sm'
                                    color='light'
                                    outline
                                    onClick={handleStageCameraSync}
                                    disabled={isSyncing}
                                    style={{ fontSize: 'clamp(11px, 1.5vw, 13px)' }}
                                >
                                    {isSyncing ? (
                                        <>
                                            <i className='fa fa-spinner fa-spin me-1' />
                                            Image Sync...
                                        </>
                                    ) : (
                                        <>
                                            <i className='mdi mdi-sync me-1' />
                                            Image Sync
                                        </>
                                    )}
                                </Button>

                                <Button
                                    size='sm'
                                    color='light'
                                    onClick={back}
                                    style={{ fontSize: 'clamp(11px, 1.5vw, 13px)' }}
                                >
                                    <i className='mdi mdi-arrow-left me-1' />
                                    Back
                                </Button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>

                <Row>
                    <Col lg={showGallery ? 6 : 12}>
                        <Card className="stage-card" style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>





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
                                {/* <div
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "16px",
                                        backgroundColor: "#ffffff",
                                        padding: "8px 14px",
                                        borderRadius: "10px",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                        marginBottom: "16px",
                                        border: "1px solid #e2e8f0"
                                    }}
                                >
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
                                </div> */}
                                <div style={{ display: "flex", width: "100%" }}>
                                    <div
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "16px",
                                            backgroundColor: "#ffffff",
                                            padding: "8px 14px",
                                            borderRadius: "10px",
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                            marginBottom: "16px",
                                            border: "1px solid #e2e8f0",
                                            marginLeft: "auto"
                                        }}
                                    >
                                        {/* ---- Toggle Section ---- */}
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

                                            <span
                                                style={{
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    color: showOutline ? "#10b981" : "#334155",
                                                    transition: "color 0.2s"
                                                }}
                                            >
                                                Show Outline
                                            </span>
                                        </div>

                                        {/* ---- Color Picker Section ---- */}
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
                                            <span
                                                style={{
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    color: "#64748b",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.5px"
                                                }}
                                            >
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
                                                            border:
                                                                selectedOutlineColor === color
                                                                    ? "2px solid #334155"
                                                                    : "2px solid #e2e8f0",
                                                            cursor: showOutline ? "pointer" : "not-allowed",
                                                            boxShadow:
                                                                selectedOutlineColor === color
                                                                    ? "0 3px 8px rgba(0,0,0,0.15)"
                                                                    : "0 1px 3px rgba(0,0,0,0.08)",
                                                            transition: "all 0.2s ease",
                                                            transform:
                                                                selectedOutlineColor === color
                                                                    ? "scale(1.05)"
                                                                    : "scale(1)",
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
                                    </div>
                                </div>


                                {/* <div
                                    style={{
                                        textAlign: "center",
                                        marginBottom: 20,
                                        fontWeight: "600",
                                        fontSize: 16,
                                        color: "#334155",
                                    }}
                                >
                                    Stage {selectedStage + 1} of {stages.length}
                                </div> */}

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
                                            width: `${stages.length * 100}%`,
                                            marginLeft: `-${selectedStage * 100}%`,
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
                                                        <Row>
                                                            <Col xs="12" lg="auto">
                                                                <CardText className="mb-0">
                                                                    <span className="me-2 font-size-12">Stage Name: </span>{stage.stage_name}
                                                                </CardText>
                                                            </Col>
                                                            <Col xs="12" lg="auto">
                                                                <CardText className="mb-0">
                                                                    <span className="me-2 font-size-12">Stage Code: </span>{stage.stage_code}
                                                                </CardText>
                                                            </Col>
                                                        </Row>

                                                        {/* <h6 className="mb-1" style={{ color: '#1e293b', fontWeight: 600 }}>
                                                            Stage Name: {stage.stage_name}/Stage Code: {stage.stage_code}
                                                        </h6> */}

                                                    </div>
                                                    {/* <Badge
                                                        color="success"
                                                        pill
                                                        style={{
                                                            fontSize: 13,
                                                            fontWeight: 600,
                                                            padding: '6px 14px',
                                                            background: '#10b981'
                                                        }}
                                                    >
                                                        <i className="mdi mdi-check-circle me-1" />
                                                        {(stage?.camera_selection?.cameras || []).length} Completed Camera(s)
                                                    </Badge> */}


                                                </div>

                                                <Row>
                                                    {(stage?.camera_selection?.cameras || []).map((cam, cIdx) => {
                                                        const key = `${sIdx}-${cIdx}`;
                                                        const devId = (cameraDevices[sIdx] || [])[cIdx];
                                                        const hasDev = !!devId;
                                                        const captured = cameraCapturedCounts[key] || 0;
                                                        const isAtLimit = captured >= captureCount;
                                                        const outlinePath = getCurrentOutlinePath(cam);

                                                        return (
                                                            <Col md={showGallery ? 6 : 4} key={cIdx} className="mb-3">
                                                                <Card className="camera-card" style={{ borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", border: '2px solid #10b981' }}>
                                                                    <CardHeader className="d-flex justify-content-between align-items-center py-2" style={{ background: '#5889deff', color: '#fff' }}>
                                                                        <span className="fw-bold text-truncate" style={{ maxWidth: 150, fontSize: 14 }}>
                                                                            <i className="mdi mdi-camera me-1" />
                                                                            {cam.label}
                                                                        </span>
                                                                        {/* <Badge color="light" pill style={{ color: '#10b981' }}>
                                                                            <i className="mdi mdi-check" /> Trained
                                                                        </Badge> */}

                                                                        <div
                                                                            className='d-flex align-items-center gap-1 gap-md-2'
                                                                            style={{ flex: '0 0 auto' }}
                                                                        >
                                                                            {captureStatus[key] && (
                                                                                <Badge
                                                                                    color='success'
                                                                                    pill
                                                                                    style={{
                                                                                        fontSize:
                                                                                            'clamp(9px, 1.2vw, 11px)'
                                                                                    }}
                                                                                >
                                                                                    <i className='mdi mdi-check' />
                                                                                </Badge>
                                                                            )}

                                                                            <Badge
                                                                                pill
                                                                                style={{
                                                                                    background: isAtLimit
                                                                                        ? '#10b981'
                                                                                        : '#3b82f6',
                                                                                    color: '#fff',
                                                                                    fontSize: 'clamp(9px, 1.2vw, 11px)',
                                                                                    padding:
                                                                                        'clamp(3px, 0.6vw, 5px) clamp(6px, 1vw, 10px)',
                                                                                    fontWeight: 600,
                                                                                    whiteSpace: 'nowrap'
                                                                                }}
                                                                            >
                                                                                <span className='d-none d-md-inline'>
                                                                                    Captured Image Count:{' '}
                                                                                </span>
                                                                                {captured}/{captureCount}
                                                                            </Badge>
                                                                        </div>
                                                                    </CardHeader>


                                                                    <CardBody className="p-0">


                                                                        <div className="webcam-container" style={{ height: 220, position: "relative", background: '#f8fafc' }}>
                                                                            {hasDev ? (
                                                                                <>
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

                                                                                    {/* <Badge pill style={{ position: 'absolute', top: 10, right: 10, background: '#10b981', zIndex: 10 }}>
                                                                                        <i className="mdi mdi-circle" style={{ fontSize: "8px", marginRight: 4 }} />
                                                                                        Live
                                                                                    </Badge> */}



                                                                                    {/* <div style={{
                                                                                        position: "absolute",
                                                                                        bottom: 10,
                                                                                        left: "50%",
                                                                                        transform: "translateX(-50%)",
                                                                                        background: isAtLimit ? "#10b981" : "#3b82f6",
                                                                                        color: "#fff",
                                                                                        padding: "8px 18px",
                                                                                        borderRadius: "20px",
                                                                                        fontWeight: 700,
                                                                                        fontSize: 14,
                                                                                        boxShadow: "0 4px 12px rgba(0,0,0,.25)",
                                                                                        zIndex: 20,
                                                                                    }}>
                                                                                        <span style={{ fontSize: 11, opacity: 0.9 }}>
                                                                                            Captured Image Count: {captured}/{captureCount}
                                                                                        </span>
                                                                                    </div> */}
                                                                                </>
                                                                            ) : (
                                                                                <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                                                                    <i className="mdi mdi-camera-off" style={{ fontSize: 40 }} />
                                                                                    <small className="mt-2">Camera Not Available</small>
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

export default Profile_sequence;