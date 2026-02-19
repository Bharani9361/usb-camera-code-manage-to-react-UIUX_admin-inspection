import React, { useEffect, useRef, useState } from 'react';
import WebcamCapture from 'pages/WebcamCustom/WebcamCapture';
import { useLocation, useHistory } from 'react-router-dom';
import urlSocket from './urlSocket';
import ImageUrl from './imageUrl';
import '../Component/RemoteStg.css';
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
  CardText
} from 'reactstrap';
import Swal from 'sweetalert2';
import { DEFAULT_RESOLUTION } from './cameraConfig';
import './index.css';
import ImageGallery_sequence from '../Component/ImageGallery_sequence';

const RemoteStg = () => {
  const location = useLocation();
  const history = useHistory();
  const { datas } = location.state || {};
  const sortedStages = datas?.stages || [];
  console.log('Loaded stages:', sortedStages);
  const [cameraDevices, setCameraDevices] = useState({});
  const webcamRefs = useRef({});
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureStatus, setCaptureStatus] = useState({});
  const [notification, setNotification] = useState('');
  const [selectedCameraLabel, setSelectedCameraLabel] = useState(null);
  const [captureCount, setCaptureCount] = useState(
    parseInt(datas?.capture_count) || 5
  );
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
  // const [stages, setSortedStages] = useState(() =>
  //   [...sortedStages].sort((a, b) => a.comp_position - b.comp_position)
  // );
  // const [stages, setStages] = useState(() =>
  //   [...sortedStages].sort((a, b) => {
  //     if (a.comp_position === null && b.comp_position === null) return 0;
  //     if (a.comp_position === null) return 1;
  //     if (b.comp_position === null) return -1;

  //     // Normal numeric comparison
  //     return a.comp_position - b.comp_position;
  //   })
  // );
  const [stages, setStages] = useState(() =>
    [...sortedStages]
      .filter(stage => stage.comp_position !== null) // Remove null comp_position items
      .sort((a, b) => a.comp_position - b.comp_position) // Sort remaining items
  );
  console.log('stages', stages)


  useEffect(() => {
    async function setupCameraDevices() {
      try {
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const deviceMap = {};
        for (let s = 0; s < stages.length; s++) {
          const stage = stages[s];
          const cams = stage?.camera_selection?.cameras || [];
          deviceMap[s] = [];
          for (let c = 0; c < cams.length; c++) {
            const cam = cams[c];
            const videoDevice = devices.find(d => {
              if (d.kind !== 'videoinput') return false;
              const label = (d.label || '').toLowerCase();
              const orig = (cam.originalLabel || '').toLowerCase();
              const vid = (cam.v_id || '').toLowerCase();
              const pid = (cam.p_id || '').toLowerCase();
              return (
                label.includes(orig) ||
                label.includes(vid) ||
                label.includes(pid)
              );
            });
            deviceMap[s].push(videoDevice ? videoDevice.deviceId : null);
          }
        }
        setCameraDevices(deviceMap);
      } catch (e) {
        console.error('Camera setup failed:', e);
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
          const { data } = await urlSocket.post('/get_training_images', {
            comp_code: datas.comp_code,
            stage_code: stage.stage_code
          });
          const imgs = data.images || [];
          const cams = stage?.camera_selection?.cameras || [];
          cams.forEach((cam, c) => {
            const key = `${s}-${c}`;
            counts[key] = imgs.filter(i => i.camera_label === cam.label).length;
          });
        } catch (e) {
          console.error('loadAllCounts error', e);
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

  const loadGalleryImages = async stageIdx => {
    setLoadingGallery(true);
    setSelectedImages(new Set());
    try {
      const stage = stages[stageIdx];
      const { data } = await urlSocket.post('/get_training_images', {
        comp_code: datas.comp_code,
        stage_code: stage.stage_code
      });
      setGalleryImages(data.images || []);
    } catch (e) {
      console.error(e);
      setGalleryImages([]);
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleDeleteImage = async image => {
    const { isConfirmed } = await Swal.fire({
      title: 'Delete Image?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    });
    if (!isConfirmed) return;
    try {
      const { data } = await urlSocket.post('/delete_training_image', {
        filename: image.filename,
        camera_label: image.camera_label
      });
      if (data.success) {
        Swal.fire('Deleted!', 'Image has been deleted.', 'success');
        const stage = stages[selectedStage];
        const camIdx = stage?.camera_selection?.cameras?.findIndex(
          c => c.label === image.camera_label
        );
        if (camIdx > -1) {
          const key = `${selectedStage}-${camIdx}`;
          setCameraCapturedCounts(prev => ({
            ...prev,
            [key]: Math.max(0, (prev[key] || 0) - 1)
          }));
        }
        loadGalleryImages(selectedStage);
      } else {
        Swal.fire('Error!', 'Failed to delete image', 'error');
      }
    } catch (e) {
      console.error(e);
      Swal.fire('Error!', 'Failed to delete image', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedImages.size) {
      Swal.fire('No Selection', 'Select at least one image.', 'info');
      return;
    }
    const { isConfirmed } = await Swal.fire({
      title: `Delete ${selectedImages.size} image(s)?`,
      text: 'This cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete all!'
    });
    if (!isConfirmed) return;
    const promises = Array.from(selectedImages).map(fn => {
      const img = galleryImages.find(i => i.filename === fn);
      return urlSocket.post('/delete_training_image', {
        filename: fn,
        camera_label: img.camera_label
      });
    });
    const results = await Promise.all(promises);
    const allOk = results.every(r => r.data.success);
    if (allOk) {
      Swal.fire(
        'Deleted!',
        `${selectedImages.size} images removed.`,
        'success'
      );
    } else {
      Swal.fire('Partial', 'Some images failed to delete.', 'warning');
    }
    const stage = stages[selectedStage];
    const cams = stage?.camera_selection?.cameras || [];
    cams.forEach((_, c) => {
      const key = `${selectedStage}-${c}`;
      const deletedForCam = results.filter(r =>
        r.config.data.includes(`"camera_label":"${cams[c].label}"`)
      ).length;
      setCameraCapturedCounts(prev => ({
        ...prev,
        [key]: Math.max(0, (prev[key] || 0) - deletedForCam)
      }));
    });
    loadGalleryImages(selectedStage);
  };

  const toggleImageSelection = fn => {
    const copy = new Set(selectedImages);
    copy.has(fn) ? copy.delete(fn) : copy.add(fn);
    setSelectedImages(copy);
  };

  const showNotification = msg => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const dataURLtoBlob = dataURL => {
    const [_, b64] = dataURL.split(',');
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
  //           await urlSocket.post("/remoteMultiCapture_sequential", fd);
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
            await urlSocket.post("/remoteMultiCapture_sequential", fd);
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

  // const handleManualCapturemode2 = async () => {
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
  //       await new Promise(r => setTimeout(r, 800));
  //       showNotification(
  //         `Stage ${selectedStage + 1} completed! Moving to next stage...`
  //       );
  //     } else {
  //       Swal.fire({
  //         title: 'All Stages Complete!',
  //         text: 'All cameras in all stages have reached the capture limit.',
  //         icon: 'success',
  //         confirmButtonColor: '#10b981'
  //       });
  //     }
  //     return;
  //   }

  //   setIsCapturing(true);

  //   try {
  //     const newCounts = { ...cameraCapturedCounts };

  //     const captures = await Promise.all(
  //       cams.map(async (cam, c) => {
  //         const key = `${selectedStage}-${c}`;
  //         const webcam = webcamRefs.current[cam.originalLabel];
  //         if (!webcam || !devIds[c]) return null;

  //         const b64 = webcam.captureZoomedImage?.();
  //         if (!b64) return null;

  //         setCurrentCapturePreview({
  //           image: b64,
  //           captureNum: (newCounts[key] || 0) + 1,
  //           totalCaptures: captureCount,
  //           stageName: stage.stage_name,
  //           stageIndex: selectedStage,
  //           camIndex: c,
  //           cameraLabel: cam.label,
  //           status: 'uploading'
  //         });

  //         const blob = dataURLtoBlob(b64);
  //         const fileName = `${stage.stage_name}_${cam.label}_${Date.now()}.png`;
  //         const fd = new FormData();
  //         fd.append('comp_name', datas.comp_name);
  //         fd.append('comp_id', datas.comp_id);
  //         fd.append('comp_code', datas.comp_code);
  //         fd.append('stage_name', stage.stage_name);
  //         fd.append('stage_code', stage.stage_code);
  //         fd.append('img_0', blob, fileName);
  //         fd.append('img_0_label', cam.label);

  //         try {
  //           await urlSocket.post('/remoteMultiCapture_sequential', fd);
  //           // Update local tracking
  //           newCounts[key] = (newCounts[key] || 0) + 1;
  //           return { cam: cam.label, status: 'success', key };
  //         } catch (e) {
  //           console.error(`Upload failed for ${cam.label}`, e);
  //           return { cam: cam.label, status: 'error', key: null };
  //         }
  //       })
  //     );

  //     // Update state with all new counts at once
  //     setCameraCapturedCounts(newCounts);

  //     if (showGallery) {
  //       await loadGalleryImages(selectedStage);
  //     }

  //     showNotification(
  //       `Stage ${selectedStage + 1} images captured successfully!`
  //     );

  //     await new Promise(r => setTimeout(r, 1000));

  //     if (selectedStage < stages.length - 1) {
  //       setSelectedStage(selectedStage + 1);
  //     } else {
  //       showNotification('All stages completed! Returning to first stage...');
  //       await new Promise(r => setTimeout(r, 1000));
  //       setSelectedStage(0);
  //     }
  //   } catch (e) {
  //     console.error(e);
  //     Swal.fire('Error', 'Capture failed.', 'error');
  //   } finally {
  //     setIsCapturing(false);
  //     setCurrentCapturePreview(null);
  //   }
  // };


  // const handleManualCapture = async () => {
  //   if (isCapturing) return;

  //   const stage = stages[selectedStage];
  //   if (!stage) return;

  //   const cams = stage?.camera_selection?.cameras || [];
  //   const devIds = cameraDevices[selectedStage] || [];

  //   // Check if current stage is complete BEFORE capturing
  //   let stageComplete = true;
  //   let anyCameraCanCapture = false;

  //   for (let c = 0; c < cams.length; c++) {
  //     const key = `${selectedStage}-${c}`;
  //     const cur = cameraCapturedCounts[key] || 0;
  //     if (cur < captureCount) {
  //       stageComplete = false;
  //       anyCameraCanCapture = true;
  //     }
  //   }

  //   // If stage is complete, move to next stage
  //   if (stageComplete) {
  //     if (selectedStage < stages.length - 1) {
  //       showNotification(`Stage ${selectedStage + 1} completed! Moving to next stage...`);
  //       await new Promise((r) => setTimeout(r, 800));
  //       setSelectedStage(selectedStage + 1);
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

  //   // If no camera can capture, don't proceed
  //   if (!anyCameraCanCapture) {
  //     showNotification("All cameras at capture limit for this stage");
  //     return;
  //   }

  //   setIsCapturing(true);

  //   try {
  //     // Get fresh counts from state at the start
  //     const currentCounts = { ...cameraCapturedCounts };
  //     let capturedAny = false;

  //     // Capture sequentially to avoid race conditions
  //     for (let c = 0; c < cams.length; c++) {
  //       const cam = cams[c];
  //       const key = `${selectedStage}-${c}`;
  //       const cur = currentCounts[key] || 0;

  //       // STRICT CHECK: Skip if this camera has reached the limit
  //       if (cur >= captureCount) {
  //         console.log(`Camera ${cam.label} already at limit: ${cur}/${captureCount}`);
  //         continue;
  //       }

  //       const webcam = webcamRefs.current[cam.originalLabel];
  //       const devId = devIds[c];

  //       if (!webcam || !devId) {
  //         console.log(`Camera ${cam.label} not available`);
  //         continue;
  //       }

  //       const b64 = webcam.captureZoomedImage?.();
  //       if (!b64) {
  //         console.log(`Failed to capture from ${cam.label}`);
  //         continue;
  //       }

  //       setCurrentCapturePreview({
  //         image: b64,
  //         captureNum: cur + 1,
  //         totalCaptures: captureCount,
  //         stageName: stage.stage_name,
  //         stageIndex: selectedStage,
  //         camIndex: c,
  //         cameraLabel: cam.label,
  //         status: "uploading",
  //       });

  //       const blob = dataURLtoBlob(b64);
  //       const fileName = `${stage.stage_name}_${cam.label}_${Date.now()}.png`;
  //       const fd = new FormData();
  //       fd.append("comp_name", datas.comp_name);
  //       fd.append("comp_id", datas.comp_id);
  //       fd.append("comp_code", datas.comp_code);
  //       fd.append("stage_name", stage.stage_name);
  //       fd.append("stage_code", stage.stage_code);
  //       fd.append("img_0", blob, fileName);
  //       fd.append("img_0_label", cam.label);

  //       try {
  //         await urlSocket.post("/remoteMultiCapture_sequential", fd);
  //         // Immediately update count after successful upload
  //         currentCounts[key] = cur + 1;
  //         capturedAny = true;
  //         console.log(`✓ Camera ${cam.label} captured: ${currentCounts[key]}/${captureCount}`);
  //       } catch (e) {
  //         console.error(`✗ Upload failed for ${cam.label}`, e);
  //       }
  //     }

  //     // Update state with all new counts at once
  //     setCameraCapturedCounts(currentCounts);

  //     if (showGallery) {
  //       await loadGalleryImages(selectedStage);
  //     }

  //     // Check if stage is NOW complete using the updated currentCounts
  //     let nowComplete = true;
  //     for (let c = 0; c < cams.length; c++) {
  //       const key = `${selectedStage}-${c}`;
  //       const cur = currentCounts[key] || 0;
  //       if (cur < captureCount) {
  //         nowComplete = false;
  //         break;
  //       }
  //     }

  //     // Only move to next stage if this one is now complete
  //     if (nowComplete) {
  //       if (selectedStage < stages.length - 1) {
  //         showNotification(`Stage ${selectedStage + 1} completed! Moving to next stage...`);
  //         await new Promise((r) => setTimeout(r, 1500));
  //         setSelectedStage(selectedStage + 1);
  //         await new Promise((r) => setTimeout(r, 800));
  //       } else {
  //         // Check if ALL stages are complete
  //         let allStagesComplete = true;
  //         for (let s = 0; s < stages.length; s++) {
  //           const stageCams = stages[s]?.camera_selection?.cameras || [];
  //           for (let c = 0; c < stageCams.length; c++) {
  //             const key = `${s}-${c}`;
  //             const count = currentCounts[key] || 0;
  //             if (count < captureCount) {
  //               allStagesComplete = false;
  //               break;
  //             }
  //           }
  //           if (!allStagesComplete) break;
  //         }

  //         if (allStagesComplete) {
  //           Swal.fire({
  //             title: "🎉 All Stages Complete!",
  //             html: `
  //             <div style="text-align: center;">
  //               <p style="font-size: 16px; margin-bottom: 15px;">
  //                 All cameras in all stages have reached the capture limit!
  //               </p>
  //               <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin-top: 15px;">
  //                 <p style="margin: 0; color: #15803d; font-weight: 600;">
  //                   Total Stages: ${stages.length}
  //                 </p>
  //                 <p style="margin: 5px 0 0 0; color: #15803d; font-weight: 600;">
  //                   Images per Camera: ${captureCount}
  //                 </p>
  //               </div>
  //             </div>
  //           `,
  //             icon: "success",
  //             confirmButtonColor: "#10b981",
  //             confirmButtonText: "Awesome!"
  //           });
  //         } else {
  //           Swal.fire({
  //             title: "Last Stage Complete!",
  //             text: "This stage is complete. Some previous stages may still need images.",
  //             icon: "success",
  //             confirmButtonColor: "#10b981",
  //           });
  //         }
  //       }
  //     } else if (capturedAny) {
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

  const handleManualCapturemode2 = async () => {
    if (isCapturing) return;

    const stage = stages[selectedStage];
    if (!stage) return;

    const cams = stage?.camera_selection?.cameras || [];
    const devIds = cameraDevices[selectedStage] || [];

    setIsCapturing(true);

    try {
      // Get fresh counts from state at the start
      const currentCounts = { ...cameraCapturedCounts };
      let capturedAny = false;

      // Capture sequentially to avoid race conditions
      for (let c = 0; c < cams.length; c++) {
        const cam = cams[c];
        const key = `${selectedStage}-${c}`;
        const cur = currentCounts[key] || 0;

        // STRICT CHECK: Skip if already at limit (Mode 2 also respects limit)
        if (cur >= captureCount) {
          console.log(`Camera ${cam.label} already at limit: ${cur}/${captureCount}`);
          continue;
        }

        const webcam = webcamRefs.current[cam.originalLabel];
        const devId = devIds[c];

        if (!webcam || !devId) {
          console.log(`Camera ${cam.label} not available`);
          continue;
        }

        const b64 = webcam.captureZoomedImage?.();
        if (!b64) {
          console.log(`Failed to capture from ${cam.label}`);
          continue;
        }

        setCurrentCapturePreview({
          image: b64,
          captureNum: cur + 1,
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
          await urlSocket.post('/remoteMultiCapture_sequential', fd);
          // Immediately update count after successful upload
          currentCounts[key] = cur + 1;
          capturedAny = true;
          console.log(`✓ Camera ${cam.label} captured: ${currentCounts[key]}/${captureCount}`);
        } catch (e) {
          console.error(`✗ Upload failed for ${cam.label}`, e);
        }
      }

      // Update state with all new counts at once
      setCameraCapturedCounts(currentCounts);

      if (showGallery) {
        await loadGalleryImages(selectedStage);
      }

      if (capturedAny) {
        showNotification(
          `Stage ${selectedStage + 1} images captured successfully!`
        );
      }

      await new Promise(r => setTimeout(r, 1000));

      // Check if ALL stages are complete before moving
      let allStagesComplete = true;
      for (let s = 0; s < stages.length; s++) {
        const stageCams = stages[s]?.camera_selection?.cameras || [];
        for (let c = 0; c < stageCams.length; c++) {
          const key = `${s}-${c}`;
          const count = currentCounts[key] || 0;
          if (count < captureCount) {
            allStagesComplete = false;
            break;
          }
        }
        if (!allStagesComplete) break;
      }

      if (allStagesComplete) {
        // All stages complete - show special message
        Swal.fire({
          title: "🎉 All Stages Complete!",
          html: `
          <div style="text-align: center;">
            <p style="font-size: 16px; margin-bottom: 15px;">
              All cameras in all stages have reached the capture limit!
            </p>
            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <p style="margin: 0; color: #15803d; font-weight: 600;">
                Total Stages: ${stages.length}
              </p>
              <p style="margin: 5px 0 0 0; color: #15803d; font-weight: 600;">
                Images per Camera: ${captureCount}
              </p>
            </div>
          </div>
        `,
          icon: "success",
          confirmButtonColor: "#10b981",
          confirmButtonText: "Awesome!",
          allowOutsideClick: false
        });
        return;
      }

      if (selectedStage < stages.length - 1) {
        setSelectedStage(selectedStage + 1);
      } else {
        showNotification('Cycle complete! Returning to first stage...');
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
      const { data } = await urlSocket.post(
        '/sync_training_mode_result_train',
        {
          comp_name: datas.comp_name,
          comp_code: datas.comp_code
        }
      );
      console.log('Sync response data:', data);

      // Get image counts for all stages
      const stageCounts = {};
      let totalImages = 0;
      const updatedCounts = { ...cameraCapturedCounts };

      for (let s = 0; s < stages.length; s++) {
        const stage = stages[s];
        try {
          const { data: stageData } = await urlSocket.post('/get_training_images', {
            comp_code: datas.comp_code,
            stage_code: stage.stage_code
          });
          const imgs = stageData.images || [];
          stageCounts[stage.stage_name] = imgs.length;
          totalImages += imgs.length;

          // Update captured counts for each camera in this stage
          const cams = stage?.camera_selection?.cameras || [];
          cams.forEach((cam, c) => {
            const key = `${s}-${c}`;
            const count = imgs.filter(i => i.camera_label === cam.label).length;
            updatedCounts[key] = count;
          });
        } catch (e) {
          console.error(`Error loading images for stage ${stage.stage_name}:`, e);
          stageCounts[stage.stage_name] = 0;
        }
      }

      // Update the camera captured counts state
      setCameraCapturedCounts(updatedCounts);

      // Reload gallery for current stage if visible
      if (showGallery) {
        await loadGalleryImages(selectedStage);
      }

      // Build stage-wise count message
      const stageCountMessage = Object.entries(stageCounts)
        .map(([stageName, count]) => `${stageName}: ${count}`)
        .join(', ');

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
        title: 'Sync Failed',
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const back = () => history.goBack();

  return (
    <div
      className='page-content'
      style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}
    >
      <Container fluid>
        {notification && (
          <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
            <Alert color='success' className='mb-0 shadow-lg'>
              <i className='mdi mdi-check-circle me-2' />
              {notification}
            </Alert>
          </div>
        )}

        {/* Responsive Header Card */}
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
                  color='success'
                  // onClick={handleManualCapture}
                  onClick={() => {
                    if (datas.sequential_sub_mode === 'Mode1') {
                      handleManualCapture();
                    } else {
                      handleManualCapturemode2();
                    }
                  }}
                  disabled={isCapturing}
                  style={{
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: 'clamp(11px, 1.5vw, 13px)'
                  }}
                >
                  {isCapturing ? (
                    <>
                      <Spinner size='sm' className='me-2' />
                      Capturing...
                    </>
                  ) : (
                    <>
                      <i className='mdi mdi-camera me-1' />
                      Capture
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

        <Row className='g-3'>
          {/* Camera Preview Section - Reduced Width */}
          <Col xs={12} lg={showGallery ? 5 : 12} xl={showGallery ? 5 : 12}>
            <Card
              className='stage-card'
              style={{
                border: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              <CardBody
                className='p-3 p-md-4'
                style={{ position: 'relative', backgroundColor: '#fafbfc' }}
              >
                {/* Navigation Buttons */}
                <Button
                  color='primary'
                  size='sm'
                  disabled={selectedStage === 0}
                  onClick={() =>
                    setSelectedStage(prev => Math.max(prev - 1, 0))
                  }
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: 'clamp(5px, 1vw, 10px)',
                    transform: 'translateY(-50%)',
                    borderRadius: '50%',
                    width: 'clamp(36px, 5vw, 44px)',
                    height: 'clamp(36px, 5vw, 44px)',
                    zIndex: 10,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                >
                  <i
                    className='mdi mdi-chevron-left'
                    style={{ fontSize: 'clamp(20px, 3vw, 24px)' }}
                  />
                </Button>

                <Button
                  color='primary'
                  size='sm'
                  disabled={selectedStage === stages.length - 1}
                  onClick={() =>
                    setSelectedStage(prev =>
                      Math.min(prev + 1, stages.length - 1)
                    )
                  }
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: 'clamp(5px, 1vw, 10px)',
                    transform: 'translateY(-50%)',
                    borderRadius: '50%',
                    width: 'clamp(36px, 5vw, 44px)',
                    height: 'clamp(36px, 5vw, 44px)',
                    zIndex: 10,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                >
                  <i
                    className='mdi mdi-chevron-right'
                    style={{ fontSize: 'clamp(20px, 3vw, 24px)' }}
                  />
                </Button>

                {/* Slider Container */}
                <div
                  className='slider-container'
                  style={{
                    overflow: 'hidden',
                    borderRadius: 12,
                    background: '#ffffff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    position: 'relative',
                    padding: 'clamp(15px, 2vw, 20px) clamp(5px, 1vw, 10px)'
                  }}
                >
                  <div
                    className='slider-track'
                    style={{
                      display: 'flex',
                      width: `${stages.length * 100}%`,
                      marginLeft: `-${selectedStage * 100}%`,
                      transition: 'margin-left 0.5s ease-in-out'
                    }}
                  >
                    {stages.map((stage, sIdx) => (
                      <div
                        key={sIdx}
                        style={{
                          width: `${100 / stages.length}%`,
                          flexShrink: 0,
                          padding: '0 clamp(5px, 1vw, 10px)'
                        }}
                      >
                        {/* Stage Header */}
                        <div
                          className='d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 mb-md-4 gap-2'
                          style={{
                            borderBottom: '3px solid #e2e8f0',
                            paddingBottom: 'clamp(8px, 1.5vw, 12px)'
                          }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
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
                          </div>
                          <Badge
                            color='primary'
                            pill
                            style={{
                              fontSize: 'clamp(11px, 1.5vw, 13px)',
                              fontWeight: 600,
                              padding:
                                'clamp(4px, 0.8vw, 6px) clamp(10px, 1.5vw, 14px)',
                              background: '#3b82f6',
                              whiteSpace: 'nowrap',
                              flexShrink: 0
                            }}
                          >
                            {
                              (cameraDevices[sIdx] || []).filter(
                                d => d !== null
                              ).length
                            }
                            /{(stage?.camera_selection?.cameras || []).length}{' '}
                            Cameras
                          </Badge>
                        </div>

                        {/* Camera Grid - Responsive Columns */}
                        <Row className='g-2 g-md-3'>
                          {(stage?.camera_selection?.cameras || []).map(
                            (cam, cIdx) => {
                              const key = `${sIdx}-${cIdx}`;
                              const devId = (cameraDevices[sIdx] || [])[cIdx];
                              const hasDev = !!devId;
                              const captured = cameraCapturedCounts[key] || 0;
                              const isAtLimit = captured >= captureCount;

                              return (
                                <Col
                                  xs={12}
                                  sm={showGallery ? 12 : 6}
                                  md={showGallery ? 12 : 6}
                                  lg={showGallery ? 12 : 4}
                                  xl={showGallery ? 6 : 4}
                                  key={cIdx}
                                >
                                  <Card
                                    className={`camera-card ${captureStatus[key] ? 'captured' : ''
                                      }`}
                                    style={{
                                      borderRadius: 12,
                                      overflow: 'hidden',
                                      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                                      border: '2px solid #e2e8f0',
                                      transition: 'all 0.3s ease'
                                    }}
                                  >
                                    {/* Camera Header */}
                                    <CardHeader
                                      className='d-flex justify-content-between align-items-center py-2 px-2 px-md-3'
                                      style={{
                                        background: '#1e293b',
                                        color: '#fff'
                                      }}
                                    >
                                      <span
                                        className='fw-bold text-truncate'
                                        style={{
                                          maxWidth: '50%',
                                          fontSize: 'clamp(10px, 1.5vw, 12px)',
                                          flex: '0 1 auto'
                                        }}
                                      >
                                        <i className='mdi mdi-camera me-1' />
                                        {cam.label}
                                      </span>

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

                                    {/* Camera Preview - Reduced Height */}
                                    <CardBody className='p-0'>
                                      <div
                                        className='webcam-container'
                                        style={{
                                          height: showGallery
                                            ? 'clamp(180px, 25vw, 220px)'
                                            : 'clamp(180px, 20vw, 240px)',
                                          position: 'relative',
                                          background: '#f8fafc'
                                        }}
                                      >
                                        {hasDev ? (
                                          <WebcamCapture
                                            ref={el => {
                                              if (el)
                                                webcamRefs.current[
                                                  cam.originalLabel
                                                ] = el;
                                            }}
                                            deviceId={devId}
                                            resolution={DEFAULT_RESOLUTION}
                                            videoConstraints={{
                                              width: DEFAULT_RESOLUTION.width,
                                              height: DEFAULT_RESOLUTION.height,
                                            }}
                                            cameraLabel={cam.originalLabel}
                                            style={{
                                              position: 'absolute',
                                              top: 0,
                                              left: 0,
                                              width: '100%',
                                              height: '100%',
                                              objectFit: 'cover',
                                              zIndex: 1
                                            }}
                                          />
                                        ) : (
                                          <div
                                            className='d-flex flex-column align-items-center justify-content-center h-100'
                                            style={{ color: '#94a3b8' }}
                                          >
                                            <i
                                              className='mdi mdi-camera-off'
                                              style={{
                                                fontSize:
                                                  'clamp(32px, 5vw, 40px)'
                                              }}
                                            />
                                            <small
                                              className='mt-2'
                                              style={{
                                                fontWeight: 500,
                                                fontSize:
                                                  'clamp(10px, 1.5vw, 12px)'
                                              }}
                                            >
                                              Camera Not Available
                                            </small>
                                          </div>
                                        )}
                                      </div>
                                    </CardBody>
                                  </Card>
                                </Col>
                              );
                            }
                          )}
                        </Row>
                      </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* Gallery Section - Expanded Width */}
          {showGallery && (
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
          )}
        </Row>
      </Container>
    </div>
  );
};
export default RemoteStg;

