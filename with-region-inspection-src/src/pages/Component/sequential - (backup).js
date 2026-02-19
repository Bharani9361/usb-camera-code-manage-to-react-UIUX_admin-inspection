// import React, { useEffect, useRef, useState } from "react";
// import Webcam from "react-webcam";
// import WebcamCapture from "pages/WebcamCustom/WebcamCapture";
// import { useLocation, useHistory } from "react-router-dom";
// import urlSocket from "./urlSocket";
// import { 
//   Container, 
//   Button, 
//   Col, 
//   Row, 
//   Card, 
//   CardBody, 
//   CardHeader,
//   Badge,
//   Spinner,
//   Alert
// } from "reactstrap";
// import Swal from "sweetalert2";
// import { DEFAULT_RESOLUTION } from "./cameraConfig";

// const RemoteStg = () => {
//   const location = useLocation();
//   const history = useHistory();
//   const { datas } = location.state || {};

//   const stages = datas?.stages || [];

//   const [cameraDevices, setCameraDevices] = useState({});
//   const webcamRefs = useRef([]);
//   console.log('webcamRefs', webcamRefs)
//   const [isCapturing, setIsCapturing] = useState(false);
//   const [captureStatus, setCaptureStatus] = useState({});
//   const [notification, setNotification] = useState("");

//   // Setup camera device IDs
//   useEffect(() => {
//     async function setupCameraDevices() {
//       try {
//         await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
//         const devices = await navigator.mediaDevices.enumerateDevices();



//         const deviceMap = {};

//         for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
//           const stage = stages[stageIndex];
//           const cameras = stage?.camera_selection?.cameras || [];
//           deviceMap[stageIndex] = [];

//           for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
//             const cam = cameras[camIndex];
//             const videoDevice = devices.find((d) => {
//               if (d.kind !== "videoinput") return false;
//               const label = d.label?.toLowerCase() || "";
//               const origLabel = cam.originalLabel?.toLowerCase() || "";
//               const vid = cam.v_id?.toLowerCase() || "";
//               const pid = cam.p_id?.toLowerCase() || "";
//               return (
//                 label.includes(origLabel) ||
//                 label.includes(vid) ||
//                 label.includes(pid)
//               );
//             });

//             if (!videoDevice) {
//               console.warn(`⚠️ No matching device for ${cam.label}`);
//               deviceMap[stageIndex].push(null);
//             } else {
//               deviceMap[stageIndex].push(videoDevice.deviceId);
//             }
//           }
//         }

//         setCameraDevices(deviceMap);
//       } catch (error) {
//         console.error("❌ Camera setup failed:", error);
//       }
//     }

//     setupCameraDevices();
//   }, [stages]);

//   const showNotification = (message) => {
//     setNotification(message);
//     setTimeout(() => setNotification(""), 3000);
//   };

//   const dataURLtoBlob = (dataURL) => {
//     const arr = dataURL.split(",");
//     const mime = arr[0].match(/:(.*?);/)[1];
//     const bstr = atob(arr[1]);
//     let n = bstr.length;
//     const u8arr = new Uint8Array(n);
//     while (n--) u8arr[n] = bstr.charCodeAt(n);
//     return new Blob([u8arr], { type: mime });
//   };

//   const handleAutoCaptureAll = async () => {
//     if (isCapturing) return;
//     setIsCapturing(true);
//     setCaptureStatus({});

//     try {
//       for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
//         const stage = stages[stageIndex];
//         const cameras = stage?.camera_selection?.cameras || [];
//         const devices = cameraDevices[stageIndex] || [];

//         const formData = new FormData();
//         formData.append("comp_name", datas.comp_name);
//         formData.append("comp_id", datas.comp_id);
//         formData.append("comp_code", datas.comp_code);
//         formData.append("stage_name", stage.stage_name);
//         formData.append("stage_code", stage.stage_code);

//         for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
//           // const cam = cameras[camIndex];
//           // console.log('camsequential', cam)
//           const videoKey = `${stageIndex}-${camIndex}`;
//           // const webcam = webcamRefs.current.captureZoomedImage();
//           const camera = cameras[camIndex];
//           const webcamInstance = webcamRefs.current[camera.originalLabel];

//           const base64Image = webcamInstance.captureZoomedImage();


//           if (!webcamInstance || !devices[camIndex]) {
//             console.warn(`Camera not available: ${camera.label}`);
//             continue;
//           }

//           await new Promise((res) => setTimeout(res, 300));

//           // const imageDataURL = webcamInstance.getScreenshot();
//           if (!base64Image) {
//             console.warn(`Failed to capture from ${camera.label}`);
//             continue;
//           }

//           setCaptureStatus((prev) => ({
//             ...prev,
//             [videoKey]: true,
//           }));

//           const blob = dataURLtoBlob(base64Image);
//           const fileName = `${stage.stage_name}_${camera.label}_${Date.now()}.png`;
//           formData.append(`img_${camIndex}`, blob, fileName);
//           formData.append(`img_${camIndex}_label`, camera.label);
//         }

//         const response = await urlSocket.post("/remoteMultiCapture", formData);
//         const result = response.data;
//         console.log("📸 Uploaded:", result);
//       }

//       Swal.fire({
//         title: "Success!",
//         text: "All stage images were captured and stored successfully.",
//         icon: "success",
//         confirmButtonText: "OK",
//         confirmButtonColor: "#28a745"
//       });
//     } catch (error) {
//       console.error("Capture error:", error);
//       Swal.fire({
//         title: "Error!",
//         text: "An error occurred while capturing images.",
//         icon: "error",
//         confirmButtonText: "Try Again",
//         confirmButtonColor: "#dc3545"
//       });
//     } finally {
//       setIsCapturing(false);
//     }
//   };

//   const handleStageCameraSync = async () => {
//     try {
//       const res = await urlSocket.post("/sync_training_mode_result_train");
//       Swal.fire({
//         title: "Sync Complete!",
//         text: `Total Synced: ${res.data.count}`,
//         icon: "success",
//         confirmButtonColor: "#28a745"
//       });
//     } catch (err) {
//       console.error("❌ Error:", err);
//       Swal.fire({
//         title: "Sync Failed!",
//         text: "Failed to sync training results.",
//         icon: "error",
//         confirmButtonColor: "#dc3545"
//       });
//     }
//   };

//   const back = () => history.goBack();

//   return (
//     <div className="page-content" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
//       <style>
//         {`
//           .camera-card {
//             transition: all 0.3s ease;
//             border: none;
//             box-shadow: 0 2px 8px rgba(0,0,0,0.08);
//           }
//           .camera-card:hover {
//             transform: translateY(-4px);
//             box-shadow: 0 8px 16px rgba(0,0,0,0.12);
//           }
//           .camera-card.captured {
//             border: 2px solid #28a745 !important;
//           }
//           .stage-card {
//             border: none;
//             box-shadow: 0 4px 12px rgba(0,0,0,0.1);
//             margin-bottom: 2rem;
//           }
//           .btn-gradient-primary {
//             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//             border: none;
//             transition: all 0.3s ease;
//           }
//           .btn-gradient-primary:hover {
//             transform: translateY(-2px);
//             box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
//           }
//           .btn-gradient-success {
//             background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);
//             border: none;
//             transition: all 0.3s ease;
//           }
//           .btn-gradient-success:hover {
//             transform: translateY(-2px);
//             box-shadow: 0 6px 20px rgba(86, 171, 47, 0.4);
//           }
//           .header-card {
//             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//             color: white;
//             border: none;
//             box-shadow: 0 4px 12px rgba(0,0,0,0.15);
//           }
//           .webcam-container {
//             position: relative;
//             overflow: hidden;
//             border-radius: 8px;
//             background: #000;
//           }
//           .notification-toast {
//             animation: slideIn 0.3s ease;
//           }
//           @keyframes slideIn {
//             from {
//               transform: translateX(400px);
//               opacity: 0;
//             }
//             to {
//               transform: translateX(0);
//               opacity: 1;
//             }
//           }
//           .camera-status-badge {
//             position: absolute;
//             top: 10px;
//             right: 10px;
//             z-index: 10;
//           }
//         `}
//       </style>

//       <Container fluid>
//         {/* Notification Toast */}
//         {notification && (
//           <div 
//             className="notification-toast"
//             style={{
//               position: "fixed",
//               top: "20px",
//               right: "20px",
//               zIndex: 9999,
//               maxWidth: "300px"
//             }}
//           >
//             <Alert color="success" className="mb-0 shadow-lg">
//               <i className="mdi mdi-check-circle me-2"></i>
//               {notification}
//             </Alert>
//           </div>
//         )}

//         {/* Header */}
//         <Card className="header-card mb-4">
//           <CardBody className="py-3">
//             <Row className="align-items-center">
//               <Col md={4}>
//                 <h3 className="mb-0 text-white">
//                   <i className="mdi mdi-camera-burst me-2"></i>
//                   Remote Camera Gallery
//                 </h3>
//               </Col>
//               <Col md={8} className="text-end">
//                 <Button 
//                   color="light" 
//                   outline 
//                   className="me-2"
//                   onClick={handleStageCameraSync}
//                 >
//                   <i className="mdi mdi-sync me-1"></i>
//                   Training Sync
//                 </Button>
//                 <Button 
//                   color="light"
//                   onClick={back}
//                 >
//                   <i className="mdi mdi-arrow-left me-1"></i>
//                   Back
//                 </Button>
//               </Col>
//             </Row>
//           </CardBody>
//         </Card>

//         {/* Stages */}
//         {stages.map((stage, stageIndex) => {
//           const cameras = stage?.camera_selection?.cameras || [];
//           const devices = cameraDevices[stageIndex] || [];
//           const totalCameras = cameras.length;
//           const activeCameras = devices.filter(d => d !== null).length;

//           return (
//             <Card key={stage._id.$oid} className="stage-card">
//               <CardHeader className="bg-white border-bottom">
//                 <Row className="align-items-center">
//                   <Col md={6}>
//                     <h4 className="mb-0 text-dark">
//                       <i className="mdi mdi-video-box me-2 text-primary"></i>
//                       {stage.stage_name}
//                     </h4>
//                     <small className="text-muted">Stage Code: {stage.stage_code}</small>
//                   </Col>
//                   <Col md={6} className="text-end">
//                     <Badge color="primary" pill className="me-2">
//                       {activeCameras}/{totalCameras} Cameras Active
//                     </Badge>
//                   </Col>
//                 </Row>
//               </CardHeader>
//               <CardBody className="p-4">
//                 <Row>

//                   {cameras.map((camera, camIndex) => {
//   const videoKey = `${stageIndex}-${camIndex}`;
//   const deviceId = devices[camIndex];
//   const hasDevice = !!deviceId;
//   const isCaptured = captureStatus[videoKey];

//   return (
//     <Col lg={4} md={6} key={camIndex} className="mb-4">
//       <Card className={`camera-card ${isCaptured ? "captured" : ""}`}>
//         <CardHeader className="bg-dark text-white d-flex justify-content-between align-items-center py-2">
//           <span className="fw-bold">
//             <i className="mdi mdi-camera me-2"></i>
//             {camera.label}
//           </span>
//           {isCaptured && (
//             <Badge color="success" pill>
//               <i className="mdi mdi-check"></i> Captured
//             </Badge>
//           )}
//         </CardHeader>
//         <CardBody className="p-0">
//           <div className="webcam-container" style={{ height: "240px", position: "relative" }}>
//             {hasDevice ? (
//               <>
//                 {/* <WebcamCapture
//                   ref={(el) => (webcamRefs.current[videoKey] = el)}
//                   videoConstraints={{
//                     deviceId: { exact: deviceId },
//                     width: 1280,
//                     height: 720,
//                   }}
//                   style={{
//                     width: "100%",
//                     height: "100%",
//                     objectFit: "cover",
//                   }}
//                 /> */}
//                 <WebcamCapture
//                   ref={(el) => { if (el) webcamRefs.current[camera.originalLabel] = el; }}
//                   resolution={DEFAULT_RESOLUTION}
//                   // zoom={zoom_value?.zoom}
//                   // center={zoom_value?.center}
//                   cameraLabel={camera.originalLabel}
//                   style={{
//                     position: "absolute",
//                     top: 0,
//                     left: 0,
//                     width: "100%",
//                     height: "100%",
//                     objectFit: "cover"
//                   }}
//                 />
//                 <Badge color="success" pill className="camera-status-badge">
//                   <i className="mdi mdi-circle" style={{ fontSize: "8px" }}></i> Live
//                 </Badge>
//               </>
//             ) : (
//               <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
//                 <i className="mdi mdi-camera-off" style={{ fontSize: "48px" }}></i>
//                 <p className="mt-2 mb-0">Camera Not Available</p>
//               </div>
//             )}
//           </div>
//         </CardBody>
//       </Card>
//     </Col>
//   );
// })}

//                 </Row>
//               </CardBody>
//             </Card>
//           );
//         })}

//         {/* Capture Button */}
//         <div className="text-center py-4">
//           <Button
//             size="lg"
//             className="btn-gradient-success px-5 py-3"
//             onClick={handleAutoCaptureAll}
//             disabled={isCapturing}
//           >
//             {isCapturing ? (
//               <>
//                 <Spinner size="sm" className="me-2" />
//                 Capturing All Cameras...
//               </>
//             ) : (
//               <>
//                 <i className="mdi mdi-camera-burst me-2"></i>
//                 Auto Capture All Cameras
//               </>
//             )}
//           </Button>
//         </div>
//       </Container>
//     </div>
//   );
// };

// export default RemoteStg;


// import React, { useEffect, useRef, useState } from "react";
// import Webcam from "react-webcam";
// import { useLocation, useHistory } from "react-router-dom";
// import { Container, Button, Col, Row, Card, CardBody } from "reactstrap";
// import MetaTags from "react-meta-tags";
// import urlSocket from "./urlSocket";
// import SweetAlert from "react-bootstrap-sweetalert";
// import Swal from "sweetalert2";

// const RemoteStg = () => {
//   const location = useLocation();
//     const history = useHistory();
//   const { datas } = location.state || {};

//   const stages = datas?.stages || [];

//   const [cameraDevices, setCameraDevices] = useState({});
//   const webcamRefs = useRef({});
//   const [isCapturing, setIsCapturing] = useState(false);
//   const [captureStatus, setCaptureStatus] = useState({});
//   const [notification, setNotification] = useState("");

//   // Setup camera device IDs
//   useEffect(() => {
//     async function setupCameraDevices() {
//       try {
//         await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
//         const devices = await navigator.mediaDevices.enumerateDevices();

//         const deviceMap = {};

//         for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
//           const stage = stages[stageIndex];
//           const cameras = stage?.camera_selection?.cameras || [];
//           deviceMap[stageIndex] = [];

//           for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
//             const cam = cameras[camIndex];
//             const videoDevice = devices.find((d) => {
//               if (d.kind !== "videoinput") return false;
//               const label = d.label?.toLowerCase() || "";
//               const origLabel = cam.originalLabel?.toLowerCase() || "";
//               const vid = cam.v_id?.toLowerCase() || "";
//               const pid = cam.p_id?.toLowerCase() || "";
//               return (
//                 label.includes(origLabel) ||
//                 label.includes(vid) ||
//                 label.includes(pid)
//               );
//             });

//             if (!videoDevice) {
//               console.warn(`⚠️ No matching device for ${cam.label}`);
//               deviceMap[stageIndex].push(null);
//             } else {
//               deviceMap[stageIndex].push(videoDevice.deviceId);
//             }
//           }
//         }

//         setCameraDevices(deviceMap);
//       } catch (error) {
//         console.error("❌ Camera setup failed:", error);
//       }
//     }

//     setupCameraDevices();
//   }, [stages]);

//   const showNotification = (message) => {
//     setNotification(message);
//     setTimeout(() => setNotification(""), 2000);
//   };

// // Helper function: convert base64 to Blob
// const dataURLtoBlob = (dataURL) => {
//   const arr = dataURL.split(",");
//   const mime = arr[0].match(/:(.*?);/)[1];
//   const bstr = atob(arr[1]);
//   let n = bstr.length;
//   const u8arr = new Uint8Array(n);
//   while (n--) u8arr[n] = bstr.charCodeAt(n);
//   return new Blob([u8arr], { type: mime });
// };

// //   const handleAutoCaptureAll = async () => {
// //     if (isCapturing) return;
// //     setIsCapturing(true);
// //     setCaptureStatus({});

// //     try {
// //       for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
// //         const stage = stages[stageIndex];
// //         const cameras = stage?.camera_selection?.cameras || [];
// //         const devices = cameraDevices[stageIndex] || [];

// //         for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
// //           const cam = cameras[camIndex];
// //           const videoKey = `${stageIndex}-${camIndex}`;
// //           const webcam = webcamRefs.current[videoKey];

// //           if (!webcam || !devices[camIndex]) {
// //             console.warn(`Camera not available: ${cam.label}`);
// //             continue;
// //           }

// //           await new Promise((res) => setTimeout(res, 300));

// //           // Capture image using Webcam component
// //           const imageDataURL = webcam.getScreenshot();

// //           if (!imageDataURL) {
// //             console.warn(`Failed to capture from ${cam.label}`);
// //             continue;
// //           }

// //           // Update status
// //           setCaptureStatus((prev) => ({
// //             ...prev,
// //             [videoKey]: true,
// //           }));

// //           // Show notification
// //           showNotification(`✓ ${stage.stage_name} - ${cam.label}`);

// //           // Create FormData and upload (simulated)
// //           const formData = new FormData();
// //           formData.append("comp_name", datas.comp_name);
// //           formData.append("comp_id", datas.comp_id);
// //           formData.append("comp_code", datas.comp_code);
// //           formData.append("stage_name", stage.stage_name);
// //           formData.append("stage_code", stage.stage_code);

// //           const blob = dataURLtoBlob(imageDataURL);
// //           const fileName = `${stage.stage_name}_${cam.label}_${Date.now()}.png`;
// //           formData.append(`img_${camIndex}`, blob, fileName);
// //           formData.append(`img_${camIndex}_label`, cam.label);

// //           // Simulated upload
// //           console.log(`✅ Captured: ${stage.stage_name} - ${cam.label}`);

// //           await new Promise((res) => setTimeout(res, 500));
// //         }
// //       }

// //       showNotification("✓ All cameras captured!");
// //       alert("Capture Completed - All stage images captured successfully!");
// //     } catch (error) {
// //       console.error("Capture error:", error);
// //       showNotification("✗ Capture failed");
// //       alert("Capture Failed - An error occurred while capturing images.");
// //     } finally {
// //       setIsCapturing(false);
// //     }
// //   };
// const handleAutoCaptureAll = async () => {
//   if (isCapturing) return;
//   setIsCapturing(true);
//   setCaptureStatus({});

//   try {
//     for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
//       const stage = stages[stageIndex];
//       const cameras = stage?.camera_selection?.cameras || [];
//       const devices = cameraDevices[stageIndex] || [];

//       const formData = new FormData();
//       formData.append("comp_name", datas.comp_name);
//       formData.append("comp_id", datas.comp_id);
//       formData.append("comp_code", datas.comp_code);
//       formData.append("stage_name", stage.stage_name);
//       formData.append("stage_code", stage.stage_code);

//       for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
//         const cam = cameras[camIndex];
//         const videoKey = `${stageIndex}-${camIndex}`;
//         const webcam = webcamRefs.current[videoKey];

//         if (!webcam || !devices[camIndex]) {
//           console.warn(`Camera not available: ${cam.label}`);
//           continue;
//         }

//         await new Promise((res) => setTimeout(res, 300));

//         const imageDataURL = webcam.getScreenshot();
//         if (!imageDataURL) {
//           console.warn(`Failed to capture from ${cam.label}`);
//           continue;
//         }

//         setCaptureStatus((prev) => ({
//           ...prev,
//           [videoKey]: true,
//         }));

//         const blob = dataURLtoBlob(imageDataURL);
//         const fileName = `${stage.stage_name}_${cam.label}_${Date.now()}.png`;
//         formData.append(`img_${camIndex}`, blob, fileName);
//         formData.append(`img_${camIndex}_label`, cam.label);
//       }

//       // ✅ Send to Flask backend using Axios
//       const response = await urlSocket.post("/remoteMultiCapture", formData);
//       const result = response.data;
//       console.log("📸 Uploaded:", result);
//     }

//     Swal.fire({
//       title: "Capture Completed!",
//       text: "All stage images were captured and stored successfully.",
//       icon: "success",
//       confirmButtonText: "OK",
//     });
//   } catch (error) {
//     console.error("Capture error:", error);
//     Swal.fire({
//       title: "Capture Failed!",
//       text: "An error occurred while capturing images.",
//       icon: "error",
//       confirmButtonText: "Try Again",
//     });
//   } finally {
//     setIsCapturing(false);
//   }
// };


//   const handleStageCameraSync = async () => {
//    try {
//     const res = await urlSocket.post("/sync_training_mode_result_train");
//     alert(`✅ ${res.data.sts}\nTotal Synced: ${res.data.count}`);
//   } catch (err) {
//     console.error("❌ Error:", err);
//     alert("❌ Failed to sync training results.");
//   }
//   };

// const back = () => history.goBack();

//   return (
//     <div
//       className="page-content"
//       style={{
//         height: "100vh",
//         backgroundColor: "#f5f5f5",
//         flexDirection: "column",
//         overflowY: "auto",
//       }}
//     >
//       {/* Notification */}
//       {notification && (
//         <div style={{
//           position: "fixed",
//           top: "20px",
//           right: "20px",
//           backgroundColor: "#4CAF50",
//           color: "white",
//           padding: "12px 24px",
//           borderRadius: "4px",
//           zIndex: 1000,
//           boxShadow: "0 4px 6px rgba(0,0,0,0.2)"
//         }}>
//           {notification}
//         </div>
//       )}

//       {/* Header */}
//       <div
//         style={{
//           backgroundColor: "white",
//           padding: "16px 24px",
//           marginBottom: "20px",
//           borderRadius: "4px",
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//           position: "sticky",
//           top: 0,
//           zIndex: 10,
//         }}
//       >
//         <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "600", color: "#333" }}>
//           Remote Camera Gallery
//         </h2>
//            <button style={{
//                 padding: "6px 16px",
//                 backgroundColor: "#2196F3",
//                 color: "white",
//                 border: "none",
//                 borderRadius: "4px",
//                 cursor: "pointer",
//                 fontSize: "13px"
//               }} onClick={handleStageCameraSync}>
//                 Training Sync
//               </button>
//         <button
//           style={{
//             padding: "8px 20px",
//             backgroundColor: "#007bff",
//             color: "white",
//             border: "none",
//             borderRadius: "4px",
//             cursor: "pointer",
//             fontSize: "15px",
//             fontWeight: "500",
//           }}
//           onClick={back}
//         >
//           ← Back
//         </button>

//       </div>

//       {/* Stages */}
//       {stages.map((stage, stageIndex) => {
//         const cameras = stage?.camera_selection?.cameras || [];
//         const devices = cameraDevices[stageIndex] || [];

//         return (
//           <div key={stage._id.$oid} style={{
//             backgroundColor: "white",
//             padding: "20px",
//             marginBottom: "20px",
//             borderRadius: "4px"
//           }}>
//             {/* Stage Header */}
//             <div style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               marginBottom: "20px",
//               paddingBottom: "12px",
//               borderBottom: "2px solid #e0e0e0"
//             }}>
//               <h3 style={{ margin: 0 }}>
//                 {stage.stage_name} ({stage.stage_code})
//               </h3>

//             </div>

//             {/* Cameras Grid */}
//             <div style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
//               gap: "16px"
//             }}>
//               {cameras.map((camera, camIndex) => {
//                 const videoKey = `${stageIndex}-${camIndex}`;
//                 const deviceId = devices[camIndex];
//                 const hasDevice = deviceId !== null;
//                 const isCaptured = captureStatus[videoKey];

//                 return (
//                   <div key={camIndex} style={{
//                     border: isCaptured ? "3px solid #4CAF50" : "1px solid #ddd",
//                     borderRadius: "4px",
//                     overflow: "hidden",
//                     backgroundColor: "#fafafa"
//                   }}>
//                     <div style={{
//                       backgroundColor: "#333",
//                       color: "white",
//                       padding: "8px 12px",
//                       fontSize: "14px",
//                       display: "flex",
//                       justifyContent: "space-between",
//                       alignItems: "center"
//                     }}>
//                       <span>{camera.label}</span>
//                       {isCaptured && <span style={{ color: "#4CAF50" }}>✓</span>}
//                     </div>

//                     <div style={{
//                       position: "relative",
//                       width: "100%",
//                       height: "200px",
//                       backgroundColor: "#000"
//                     }}>
//                       {hasDevice ? (
//                         <Webcam
//                           ref={(el) => (webcamRefs.current[videoKey] = el)}
//                           videoConstraints={{
//                             deviceId: { exact: deviceId }
//                           }}
//                           screenshotFormat="image/png"
//                           style={{
//                             width: "100%",
//                             height: "100%",
//                             objectFit: "cover"
//                           }}
//                         />
//                       ) : (
//                         <div style={{
//                           width: "100%",
//                           height: "100%",
//                           display: "flex",
//                           alignItems: "center",
//                           justifyContent: "center",
//                           color: "#999",
//                           fontSize: "14px"
//                         }}>
//                           Camera Not Available
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         );
//       })}

//       {/* Capture Button */}
//       <div style={{ textAlign: "center", marginTop: "30px", paddingBottom: "30px" }}>
//         <button
//           onClick={handleAutoCaptureAll}
//           disabled={isCapturing}
//           style={{
//             padding: "14px 40px",
//             backgroundColor: isCapturing ? "#ccc" : "#4CAF50",
//             color: "white",
//             border: "none",
//             borderRadius: "4px",
//             fontSize: "16px",
//             cursor: isCapturing ? "not-allowed" : "pointer",
//             fontWeight: "bold"
//           }}
//         >
//           {isCapturing ? "Capturing..." : "📷 Auto Capture All Cameras"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default RemoteStg;

// import React, { useEffect, useRef, useState } from "react";
// import Webcam from "react-webcam";
// import WebcamCapture from "pages/WebcamCustom/WebcamCapture";
// import { useLocation, useHistory } from "react-router-dom";
// import urlSocket from "./urlSocket";
// import {
//   Container,
//   Button,
//   Col,
//   Row,
//   Card,
//   CardBody,
//   CardHeader,
//   Badge,
//   Spinner,
//   Alert,
//   Modal,
//   ModalHeader,
//   ModalBody
// } from "reactstrap";
// import Swal from "sweetalert2";
// import { DEFAULT_RESOLUTION } from "./cameraConfig";

// const RemoteStg = () => {
//   const location = useLocation();
//   const history = useHistory();
//   const { datas } = location.state || {};

//   const stages = datas?.stages || [];

//   const [cameraDevices, setCameraDevices] = useState({});
//   const webcamRefs = useRef([]);
//   const [isCapturing, setIsCapturing] = useState(false);
//   const [captureStatus, setCaptureStatus] = useState({});
//   const [notification, setNotification] = useState("");

//   // Gallery states
//   const [galleryImages, setGalleryImages] = useState([]);
//   const [loadingGallery, setLoadingGallery] = useState(false);
//   const [selectedStage, setSelectedStage] = useState(null);
//   const [previewImage, setPreviewImage] = useState(null);
//   const [showPreview, setShowPreview] = useState(false);

//   // Setup camera device IDs
//   useEffect(() => {
//     async function setupCameraDevices() {
//       try {
//         await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
//         const devices = await navigator.mediaDevices.enumerateDevices();

//         const deviceMap = {};

//         for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
//           const stage = stages[stageIndex];
//           const cameras = stage?.camera_selection?.cameras || [];
//           deviceMap[stageIndex] = [];

//           for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
//             const cam = cameras[camIndex];
//             const videoDevice = devices.find((d) => {
//               if (d.kind !== "videoinput") return false;
//               const label = d.label?.toLowerCase() || "";
//               const origLabel = cam.originalLabel?.toLowerCase() || "";
//               const vid = cam.v_id?.toLowerCase() || "";
//               const pid = cam.p_id?.toLowerCase() || "";
//               return (
//                 label.includes(origLabel) ||
//                 label.includes(vid) ||
//                 label.includes(pid)
//               );
//             });

//             if (!videoDevice) {
//               console.warn(`⚠️ No matching device for ${cam.label}`);
//               deviceMap[stageIndex].push(null);
//             } else {
//               deviceMap[stageIndex].push(videoDevice.deviceId);
//             }
//           }
//         }

//         setCameraDevices(deviceMap);
//       } catch (error) {
//         console.error("❌ Camera setup failed:", error);
//       }
//     }

//     setupCameraDevices();
//   }, [stages]);

//   // Load gallery images when stage is selected
//   useEffect(() => {
//     if (selectedStage !== null) {
//       loadGalleryImages(selectedStage);
//     }
//   }, [selectedStage]);

//   // Set first stage as default
//   useEffect(() => {
//     if (stages.length > 0) {
//       setSelectedStage(0);
//     }
//   }, [stages]);

//   const loadGalleryImages = async (stageIndex) => {
//     setLoadingGallery(true);
//     try {
//       const stage = stages[stageIndex];
//       const response = await urlSocket.post("/get_training_images", {
//         comp_code: datas.comp_code,
//         stage_code: stage.stage_code
//       });

//       setGalleryImages(response.data.images || []);
//     } catch (error) {
//       console.error("Failed to load gallery images:", error);
//       setGalleryImages([]);
//     } finally {
//       setLoadingGallery(false);
//     }
//   };

//   const handleDeleteImage = async (image) => {
//     const result = await Swal.fire({
//       title: "Delete Image?",
//       text: "This action cannot be undone",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#dc3545",
//       cancelButtonColor: "#6c757d",
//       confirmButtonText: "Yes, delete it!"
//     });

//     if (result.isConfirmed) {
//       try {
//         const response = await urlSocket.post("/delete_training_image", {
//           filename: image.filename,
//           camera_label: image.camera_label
//         });

//         if (response.data.success) {
//           Swal.fire("Deleted!", "Image has been deleted.", "success");
//           loadGalleryImages(selectedStage); // Reload gallery
//         } else {
//           Swal.fire("Error!", "Failed to delete image", "error");
//         }
//       } catch (error) {
//         console.error("Delete error:", error);
//         Swal.fire("Error!", "Failed to delete image", "error");
//       }
//     }
//   };

//   const showNotification = (message) => {
//     setNotification(message);
//     setTimeout(() => setNotification(""), 3000);
//   };

//   const dataURLtoBlob = (dataURL) => {
//     const arr = dataURL.split(",");
//     const mime = arr[0].match(/:(.*?);/)[1];
//     const bstr = atob(arr[1]);
//     let n = bstr.length;
//     const u8arr = new Uint8Array(n);
//     while (n--) u8arr[n] = bstr.charCodeAt(n);
//     return new Blob([u8arr], { type: mime });
//   };

//   const handleAutoCaptureAll = async () => {
//     if (isCapturing) return;
//     setIsCapturing(true);
//     setCaptureStatus({});

//     try {
//       for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
//         const stage = stages[stageIndex];
//         const cameras = stage?.camera_selection?.cameras || [];
//         const devices = cameraDevices[stageIndex] || [];

//         const formData = new FormData();
//         formData.append("comp_name", datas.comp_name);
//         formData.append("comp_id", datas.comp_id);
//         formData.append("comp_code", datas.comp_code);
//         formData.append("stage_name", stage.stage_name);
//         formData.append("stage_code", stage.stage_code);

//         for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
//           const videoKey = `${stageIndex}-${camIndex}`;
//           const camera = cameras[camIndex];
//           const webcamInstance = webcamRefs.current[camera.originalLabel];

//           if (!webcamInstance || !devices[camIndex]) {
//             console.warn(`Camera not available: ${camera.label}`);
//             continue;
//           }

//           await new Promise((res) => setTimeout(res, 300));

//           const base64Image = webcamInstance.captureZoomedImage();

//           if (!base64Image) {
//             console.warn(`Failed to capture from ${camera.label}`);
//             continue;
//           }

//           setCaptureStatus((prev) => ({
//             ...prev,
//             [videoKey]: true,
//           }));

//           const blob = dataURLtoBlob(base64Image);
//           const fileName = `${stage.stage_name}_${camera.label}_${Date.now()}.png`;
//           formData.append(`img_${camIndex}`, blob, fileName);
//           formData.append(`img_${camIndex}_label`, camera.label);
//         }

//         const response = await urlSocket.post("/remoteMultiCapture", formData);
//         console.log("📸 Uploaded:", response.data);
//       }

//       Swal.fire({
//         title: "Success!",
//         text: "All stage images were captured and stored successfully.",
//         icon: "success",
//         confirmButtonText: "OK",
//         confirmButtonColor: "#28a745"
//       });

//       // Reload gallery for current stage
//       if (selectedStage !== null) {
//         loadGalleryImages(selectedStage);
//       }
//     } catch (error) {
//       console.error("Capture error:", error);
//       Swal.fire({
//         title: "Error!",
//         text: "An error occurred while capturing images.",
//         icon: "error",
//         confirmButtonText: "Try Again",
//         confirmButtonColor: "#dc3545"
//       });
//     } finally {
//       setIsCapturing(false);
//     }
//   };

//   const handleStageCameraSync = async () => {
//     try {
//       const res = await urlSocket.post("/sync_training_mode_result_train");
//       Swal.fire({
//         title: "Sync Complete!",
//         text: `Total Synced: ${res.data.count}`,
//         icon: "success",
//         confirmButtonColor: "#28a745"
//       });
//     } catch (err) {
//       console.error("❌ Error:", err);
//       Swal.fire({
//         title: "Sync Failed!",
//         text: "Failed to sync training results.",
//         icon: "error",
//         confirmButtonColor: "#dc3545"
//       });
//     }
//   };

//   const back = () => history.goBack();

//   return (
//     <div className="page-content" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
//       <style>
//         {`
//           .camera-card {
//             transition: all 0.3s ease;
//             border: none;
//             box-shadow: 0 2px 8px rgba(0,0,0,0.08);
//           }
//           .camera-card:hover {
//             transform: translateY(-4px);
//             box-shadow: 0 8px 16px rgba(0,0,0,0.12);
//           }
//           .camera-card.captured {
//             border: 2px solid #28a745 !important;
//           }
//           .stage-card {
//             border: none;
//             box-shadow: 0 4px 12px rgba(0,0,0,0.1);
//           }
//           .header-card {
//             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//             color: white;
//             border: none;
//             box-shadow: 0 4px 12px rgba(0,0,0,0.15);
//           }
//           .webcam-container {
//             position: relative;
//             overflow: hidden;
//             border-radius: 8px;
//             background: #000;
//           }
//           .camera-status-badge {
//             position: absolute;
//             top: 10px;
//             right: 10px;
//             z-index: 10;
//           }
//           .gallery-image {
//             width: 100%;
//             height: 180px;
//             object-fit: cover;
//             cursor: pointer;
//             transition: transform 0.2s;
//             border-radius: 8px;
//           }
//           .gallery-image:hover {
//             transform: scale(1.05);
//           }
//           .gallery-item {
//             position: relative;
//             margin-bottom: 1rem;
//           }
//           .delete-btn {
//             position: absolute;
//             top: 8px;
//             right: 8px;
//             z-index: 10;
//             opacity: 0;
//             transition: opacity 0.2s;
//           }
//           .gallery-item:hover .delete-btn {
//             opacity: 1;
//           }
//           .gallery-scroll {
//             max-height: calc(100vh - 200px);
//             overflow-y: auto;
//           }
//           .stage-tab {
//             cursor: pointer;
//             transition: all 0.3s;
//             padding: 10px 20px;
//             border-radius: 8px 8px 0 0;
//             background: #e9ecef;
//             margin-right: 5px;
//           }
//           .stage-tab.active {
//             background: white;
//             font-weight: bold;
//             box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
//           }
//           .stage-tab:hover {
//             background: #dee2e6;
//           }
//         `}
//       </style>

//       <Container fluid>
//         {/* Notification Toast */}
//         {notification && (
//           <div
//             style={{
//               position: "fixed",
//               top: "20px",
//               right: "20px",
//               zIndex: 9999,
//               maxWidth: "300px"
//             }}
//           >
//             <Alert color="success" className="mb-0 shadow-lg">
//               <i className="mdi mdi-check-circle me-2"></i>
//               {notification}
//             </Alert>
//           </div>
//         )}

//         {/* Header */}
//         <Card className="header-card mb-4">
//           <CardBody className="py-3">
//             <Row className="align-items-center">
//               <Col md={4}>
//                 <h3 className="mb-0 text-white">
//                   <i className="mdi mdi-camera-burst me-2"></i>
//                   Remote Camera Gallery
//                 </h3>
//               </Col>
//               <Col md={8} className="text-end">
//                 <Button
//                   color="light"
//                   outline
//                   className="me-2"
//                   onClick={handleStageCameraSync}
//                 >
//                   <i className="mdi mdi-sync me-1"></i>
//                   Training Sync
//                 </Button>
//                 <Button
//                   color="light"
//                   onClick={back}
//                 >
//                   <i className="mdi mdi-arrow-left me-1"></i>
//                   Back
//                 </Button>
//               </Col>
//             </Row>
//           </CardBody>
//         </Card>

//         {/* Stage Tabs */}
//         <div className="d-flex mb-3" style={{ borderBottom: "2px solid #e9ecef" }}>
//           {stages.map((stage, index) => (
//             <div
//               key={stage._id.$oid}
//               className={`stage-tab ${selectedStage === index ? "active" : ""}`}
//               onClick={() => setSelectedStage(index)}
//             >
//               {stage.stage_name}
//             </div>
//           ))}
//         </div>

//         {/* Split Screen Layout */}
//         <Row>
//           {/* Left Side - Image Gallery */}
//           <Col lg={5} xl={4}>
//             <Card className="stage-card">
//               <CardHeader className="bg-white border-bottom">
//                 <h5 className="mb-0">
//                   <i className="mdi mdi-image-multiple me-2 text-primary"></i>
//                   Image Gallery
//                   <Badge color="info" pill className="ms-2">
//                     {galleryImages.length} Images
//                   </Badge>
//                 </h5>
//               </CardHeader>
//               <CardBody className="p-3">
//                 {loadingGallery ? (
//                   <div className="text-center py-5">
//                     <Spinner color="primary" />
//                     <p className="mt-2 text-muted">Loading images...</p>
//                   </div>
//                 ) : galleryImages.length === 0 ? (
//                   <div className="text-center py-5 text-muted">
//                     <i className="mdi mdi-image-off" style={{ fontSize: "48px" }}></i>
//                     <p className="mt-2">No images captured yet</p>
//                   </div>
//                 ) : (
//                   <div className="gallery-scroll">
//                     <Row>
//                       {galleryImages.map((img, idx) => (
//                         <Col md={6} key={idx}>
//                           <div className="gallery-item">
//                             <Button
//                               color="danger"
//                               size="sm"
//                               className="delete-btn"
//                               onClick={() => handleDeleteImage(img)}
//                             >
//                               <i className="mdi mdi-delete"></i>
//                             </Button>
//                             <img
//                               src={img.insp_local_path || "/placeholder.png"}
//                               alt={img.camera_label}
//                               className="gallery-image"
//                               onClick={() => {
//                                 setPreviewImage(img);
//                                 setShowPreview(true);
//                               }}
//                             />
//                             <div className="mt-1">
//                               <small className="text-muted d-block">
//                                 <i className="mdi mdi-camera me-1"></i>
//                                 {img.camera_label}
//                               </small>
//                               <small className="text-muted d-block">
//                                 <i className="mdi mdi-clock-outline me-1"></i>
//                                 {new Date(img.timestamp).toLocaleString()}
//                               </small>
//                             </div>
//                           </div>
//                         </Col>
//                       ))}
//                     </Row>
//                   </div>
//                 )}
//               </CardBody>
//             </Card>
//           </Col>

//           {/* Right Side - Live Cameras */}
//           <Col lg={7} xl={8}>
//             {selectedStage !== null && stages[selectedStage] && (
//               <Card className="stage-card">
//                 <CardHeader className="bg-white border-bottom">
//                   <Row className="align-items-center">
//                     <Col md={8}>
//                       <h4 className="mb-0 text-dark">
//                         <i className="mdi mdi-video-box me-2 text-primary"></i>
//                         {stages[selectedStage].stage_name}
//                       </h4>
//                       <small className="text-muted">
//                         Stage Code: {stages[selectedStage].stage_code}
//                       </small>
//                     </Col>
//                     <Col md={4} className="text-end">
//                       <Badge color="primary" pill>
//                         {(cameraDevices[selectedStage] || []).filter(d => d !== null).length}/
//                         {(stages[selectedStage]?.camera_selection?.cameras || []).length} Cameras
//                       </Badge>
//                     </Col>
//                   </Row>
//                 </CardHeader>
//                 <CardBody className="p-4">
//                   <Row>
//                     {(stages[selectedStage]?.camera_selection?.cameras || []).map((camera, camIndex) => {
//                       const videoKey = `${selectedStage}-${camIndex}`;
//                       const deviceId = (cameraDevices[selectedStage] || [])[camIndex];
//                       const hasDevice = !!deviceId;
//                       const isCaptured = captureStatus[videoKey];

//                       return (
//                         <Col lg={6} md={12} key={camIndex} className="mb-4">
//                           <Card className={`camera-card ${isCaptured ? "captured" : ""}`}>
//                             <CardHeader className="bg-dark text-white d-flex justify-content-between align-items-center py-2">
//                               <span className="fw-bold">
//                                 <i className="mdi mdi-camera me-2"></i>
//                                 {camera.label}
//                               </span>
//                               {isCaptured && (
//                                 <Badge color="success" pill>
//                                   <i className="mdi mdi-check"></i> Captured
//                                 </Badge>
//                               )}
//                             </CardHeader>
//                             <CardBody className="p-0">
//                               <div className="webcam-container" style={{ height: "280px", position: "relative" }}>
//                                 {hasDevice ? (
//                                   <>
//                                     <WebcamCapture
//                                       ref={(el) => { if (el) webcamRefs.current[camera.originalLabel] = el; }}
//                                       resolution={DEFAULT_RESOLUTION}
//                                       cameraLabel={camera.originalLabel}
//                                       style={{
//                                         position: "absolute",
//                                         top: 0,
//                                         left: 0,
//                                         width: "100%",
//                                         height: "100%",
//                                         objectFit: "cover"
//                                       }}
//                                     />
//                                     <Badge color="success" pill className="camera-status-badge">
//                                       <i className="mdi mdi-circle" style={{ fontSize: "8px" }}></i> Live
//                                     </Badge>
//                                   </>
//                                 ) : (
//                                   <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
//                                     <i className="mdi mdi-camera-off" style={{ fontSize: "48px" }}></i>
//                                     <p className="mt-2 mb-0">Camera Not Available</p>
//                                   </div>
//                                 )}
//                               </div>
//                             </CardBody>
//                           </Card>
//                         </Col>
//                       );
//                     })}
//                   </Row>
//                 </CardBody>
//               </Card>
//             )}
//           </Col>
//         </Row>

//         {/* Capture Button */}
//         <div className="text-center py-4">
//           <Button
//             size="lg"
//             color="success"
//             className="px-5 py-3"
//             onClick={handleAutoCaptureAll}
//             disabled={isCapturing}
//           >
//             {isCapturing ? (
//               <>
//                 <Spinner size="sm" className="me-2" />
//                 Capturing All Cameras...
//               </>
//             ) : (
//               <>
//                 <i className="mdi mdi-camera-burst me-2"></i>
//                 Auto Capture All Cameras
//               </>
//             )}
//           </Button>
//         </div>
//       </Container>

//       {/* Image Preview Modal */}
//       <Modal isOpen={showPreview} toggle={() => setShowPreview(false)} size="lg">
//         <ModalHeader toggle={() => setShowPreview(false)}>
//           {previewImage?.camera_label}
//         </ModalHeader>
//         <ModalBody className="text-center">
//           {previewImage && (
//             <>
//               <img
//                 src={previewImage.insp_local_path}
//                 alt={previewImage.camera_label}
//                 style={{ maxWidth: "100%", maxHeight: "70vh" }}
//               />
//               <div className="mt-3 text-start">
//                 <p><strong>Filename:</strong> {previewImage.filename}</p>
//                 <p><strong>Camera:</strong> {previewImage.camera_label}</p>
//                 <p><strong>Timestamp:</strong> {new Date(previewImage.timestamp).toLocaleString()}</p>
//                 <p><strong>Dimensions:</strong> {previewImage.width} x {previewImage.height}</p>
//               </div>
//             </>
//           )}
//         </ModalBody>
//       </Modal>
//     </div>
//   );
// };

// export default RemoteStg;


// import React, { useEffect, useRef, useState } from "react";
// import Webcam from "react-webcam";
// import WebcamCapture from "pages/WebcamCustom/WebcamCapture";
// import { useLocation, useHistory } from "react-router-dom";
// import urlSocket from "./urlSocket";
// import ImageUrl from "./imageUrl";

// import {
//   Container,
//   Button,
//   Col,
//   Row,
//   Card,
//   CardBody,
//   CardHeader,
//   Badge,
//   Spinner,
//   Alert,
//   Modal,
//   ModalHeader,
//   ModalBody
// } from "reactstrap";
// import Swal from "sweetalert2";
// import { DEFAULT_RESOLUTION } from "./cameraConfig";

// const RemoteStg = () => {
//   const location = useLocation();
//   const history = useHistory();
//   const { datas } = location.state || {};

//   const stages = datas?.stages || [];

//   const [cameraDevices, setCameraDevices] = useState({});
//   const webcamRefs = useRef([]);
//   const [isCapturing, setIsCapturing] = useState(false);
//   const [captureStatus, setCaptureStatus] = useState({});
//   const [notification, setNotification] = useState("");

//   // Gallery states
//   const [galleryImages, setGalleryImages] = useState([]);
//   const [loadingGallery, setLoadingGallery] = useState(false);
//   const [selectedStage, setSelectedStage] = useState(null);
//   const [previewImage, setPreviewImage] = useState(null);
//   const [showPreview, setShowPreview] = useState(false);

//   // Setup camera device IDs
//   useEffect(() => {
//     async function setupCameraDevices() {
//       try {
//         await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
//         const devices = await navigator.mediaDevices.enumerateDevices();

//         const deviceMap = {};

//         for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
//           const stage = stages[stageIndex];
//           const cameras = stage?.camera_selection?.cameras || [];
//           deviceMap[stageIndex] = [];

//           for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
//             const cam = cameras[camIndex];
//             const videoDevice = devices.find((d) => {
//               if (d.kind !== "videoinput") return false;
//               const label = d.label?.toLowerCase() || "";
//               const origLabel = cam.originalLabel?.toLowerCase() || "";
//               const vid = cam.v_id?.toLowerCase() || "";
//               const pid = cam.p_id?.toLowerCase() || "";
//               return (
//                 label.includes(origLabel) ||
//                 label.includes(vid) ||
//                 label.includes(pid)
//               );
//             });

//             if (!videoDevice) {
//               console.warn(`⚠️ No matching device for ${cam.label}`);
//               deviceMap[stageIndex].push(null);
//             } else {
//               deviceMap[stageIndex].push(videoDevice.deviceId);
//             }
//           }
//         }

//         setCameraDevices(deviceMap);
//       } catch (error) {
//         console.error("❌ Camera setup failed:", error);
//       }
//     }

//     setupCameraDevices();
//   }, [stages]);

//   // Load gallery images when stage is selected
//   useEffect(() => {
//     if (selectedStage !== null) {
//       loadGalleryImages(selectedStage);
//     }
//   }, [selectedStage]);

//   // Set first stage as default
//   useEffect(() => {
//     if (stages.length > 0) {
//       setSelectedStage(0);
//     }
//   }, [stages]);

//   const loadGalleryImages = async (stageIndex) => {
//     setLoadingGallery(true);
//     try {
//       const stage = stages[stageIndex];
//       const response = await urlSocket.post("/get_training_images", {
//         comp_code: datas.comp_code,
//         stage_code: stage.stage_code
//       });

//       setGalleryImages(response.data.images || []);
//     } catch (error) {
//       console.error("Failed to load gallery images:", error);
//       setGalleryImages([]);
//     } finally {
//       setLoadingGallery(false);
//     }
//   };

//   const handleDeleteImage = async (image) => {
//     const result = await Swal.fire({
//       title: "Delete Image?",
//       text: "This action cannot be undone",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#dc3545",
//       cancelButtonColor: "#6c757d",
//       confirmButtonText: "Yes, delete it!"
//     });

//     if (result.isConfirmed) {
//       try {
//         const response = await urlSocket.post("/delete_training_image", {
//           filename: image.filename,
//           camera_label: image.camera_label
//         });

//         if (response.data.success) {
//           Swal.fire("Deleted!", "Image has been deleted.", "success");
//           loadGalleryImages(selectedStage); // Reload gallery
//         } else {
//           Swal.fire("Error!", "Failed to delete image", "error");
//         }
//       } catch (error) {
//         console.error("Delete error:", error);
//         Swal.fire("Error!", "Failed to delete image", "error");
//       }
//     }
//   };

//   const showNotification = (message) => {
//     setNotification(message);
//     setTimeout(() => setNotification(""), 3000);
//   };

//   const dataURLtoBlob = (dataURL) => {
//     const arr = dataURL.split(",");
//     const mime = arr[0].match(/:(.*?);/)[1];
//     const bstr = atob(arr[1]);
//     let n = bstr.length;
//     const u8arr = new Uint8Array(n);
//     while (n--) u8arr[n] = bstr.charCodeAt(n);
//     return new Blob([u8arr], { type: mime });
//   };

//   const handleAutoCaptureAll = async () => {
//     if (isCapturing) return;
//     setIsCapturing(true);
//     setCaptureStatus({});

//     try {
//       for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
//         const stage = stages[stageIndex];
//         const cameras = stage?.camera_selection?.cameras || [];
//         const devices = cameraDevices[stageIndex] || [];

//         const formData = new FormData();
//         formData.append("comp_name", datas.comp_name);
//         formData.append("comp_id", datas.comp_id);
//         formData.append("comp_code", datas.comp_code);
//         formData.append("stage_name", stage.stage_name);
//         formData.append("stage_code", stage.stage_code);

//         for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
//           const videoKey = `${stageIndex}-${camIndex}`;
//           const camera = cameras[camIndex];
//           const webcamInstance = webcamRefs.current[camera.originalLabel];

//           if (!webcamInstance || !devices[camIndex]) {
//             console.warn(`Camera not available: ${camera.label}`);
//             continue;
//           }

//           await new Promise((res) => setTimeout(res, 300));

//           const base64Image = webcamInstance.captureZoomedImage();

//           if (!base64Image) {
//             console.warn(`Failed to capture from ${camera.label}`);
//             continue;
//           }

//           setCaptureStatus((prev) => ({
//             ...prev,
//             [videoKey]: true,
//           }));

//           const blob = dataURLtoBlob(base64Image);
//           const fileName = `${stage.stage_name}_${camera.label}_${Date.now()}.png`;
//           formData.append(`img_${camIndex}`, blob, fileName);
//           formData.append(`img_${camIndex}_label`, camera.label);
//         }

//         const response = await urlSocket.post("/remoteMultiCapture", formData);
//         console.log("📸 Uploaded:", response.data);
//       }

//       Swal.fire({
//         title: "Success!",
//         text: "All stage images were captured and stored successfully.",
//         icon: "success",
//         confirmButtonText: "OK",
//         confirmButtonColor: "#28a745"
//       });

//       // Reload gallery for current stage
//       if (selectedStage !== null) {
//         loadGalleryImages(selectedStage);
//       }
//     } catch (error) {
//       console.error("Capture error:", error);
//       Swal.fire({
//         title: "Error!",
//         text: "An error occurred while capturing images.",
//         icon: "error",
//         confirmButtonText: "Try Again",
//         confirmButtonColor: "#dc3545"
//       });
//     } finally {
//       setIsCapturing(false);
//     }
//   };

//   const handleStageCameraSync = async () => {
//     try {
//       const res = await urlSocket.post("/sync_training_mode_result_train");
//       Swal.fire({
//         title: "Sync Complete!",
//         text: `Total Synced: ${res.data.count}`,
//         icon: "success",
//         confirmButtonColor: "#28a745"
//       });
//     } catch (err) {
//       console.error("❌ Error:", err);
//       Swal.fire({
//         title: "Sync Failed!",
//         text: "Failed to sync training results.",
//         icon: "error",
//         confirmButtonColor: "#dc3545"
//       });
//     }
//   };

//   const back = () => history.goBack();

//   return (
//     <div className="page-content" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
//       <style>
//         {`
//           .camera-card {
//             transition: all 0.3s ease;
//             border: none;
//             box-shadow: 0 2px 8px rgba(0,0,0,0.08);
//           }
//           .camera-card:hover {
//             transform: translateY(-4px);
//             box-shadow: 0 8px 16px rgba(0,0,0,0.12);
//           }
//           .camera-card.captured {
//             border: 2px solid #28a745 !important;
//           }
//           .stage-card {
//             border: none;
//             box-shadow: 0 4px 12px rgba(0,0,0,0.1);
//           }
//           .header-card {
//             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//             color: white;
//             border: none;
//             box-shadow: 0 4px 12px rgba(0,0,0,0.15);
//           }
//           .webcam-container {
//             position: relative;
//             overflow: hidden;
//             border-radius: 8px;
//             background: #000;
//           }
//           .camera-status-badge {
//             position: absolute;
//             top: 10px;
//             right: 10px;
//             z-index: 10;
//           }
//           .gallery-image {
//             width: 100%;
//             height: 180px;
//             object-fit: cover;
//             cursor: pointer;
//             transition: transform 0.2s;
//             border-radius: 8px;
//           }
//           .gallery-image:hover {
//             transform: scale(1.05);
//           }
//           .gallery-item {
//             position: relative;
//             margin-bottom: 1rem;
//           }
//           .delete-btn {
//             position: absolute;
//             top: 8px;
//             right: 8px;
//             z-index: 10;
//             opacity: 0;
//             transition: opacity 0.2s;
//           }
//           .gallery-item:hover .delete-btn {
//             opacity: 1;
//           }
//           .gallery-scroll {
//             max-height: calc(100vh - 200px);
//             overflow-y: auto;
//           }
//           .stage-tab {
//             cursor: pointer;
//             transition: all 0.3s;
//             padding: 10px 20px;
//             border-radius: 8px 8px 0 0;
//             background: #e9ecef;
//             margin-right: 5px;
//           }
//           .stage-tab.active {
//             background: white;
//             font-weight: bold;
//             box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
//           }
//           .stage-tab:hover {
//             background: #dee2e6;
//           }
//         `}
//       </style>

//       <Container fluid>
//         {/* Notification Toast */}
//         {notification && (
//           <div
//             style={{
//               position: "fixed",
//               top: "20px",
//               right: "20px",
//               zIndex: 9999,
//               maxWidth: "300px"
//             }}
//           >
//             <Alert color="success" className="mb-0 shadow-lg">
//               <i className="mdi mdi-check-circle me-2"></i>
//               {notification}
//             </Alert>
//           </div>
//         )}

//         {/* Header */}
//         <Card className="header-card mb-4">
//           <CardBody className="py-3">
//             <Row className="align-items-center">
//               <Col md={4}>
//                 <h3 className="mb-0 text-white">
//                   <i className="mdi mdi-camera-burst me-2"></i>
//                   Remote Camera Gallery
//                 </h3>
//               </Col>
//               <Col md={8} className="text-end">
//                 <Button
//                   color="light"
//                   outline
//                   className="me-2"
//                   onClick={handleStageCameraSync}
//                 >
//                   <i className="mdi mdi-sync me-1"></i>
//                   Training Sync
//                 </Button>
//                 <Button
//                   color="light"
//                   onClick={back}
//                 >
//                   <i className="mdi mdi-arrow-left me-1"></i>
//                   Back
//                 </Button>
//               </Col>
//             </Row>
//           </CardBody>
//         </Card>


//         {/* Split Screen Layout */}
//         <Row>
//           {/* Left Side - All Stage Camera Previews */}
//           <Col lg={7} xl={8}>
//             <Card className="stage-card">
//               <CardHeader className="bg-white border-bottom">
//                 <Row className="align-items-center">
//                   <Col md={8}>
//                     <h5 className="mb-0">
//                       <i className="mdi mdi-video-box me-2 text-primary"></i>
//                       All Stage Camera Previews
//                     </h5>
//                   </Col>
//                   <Col md={4} className="text-end">
//                     <Button
//                       size="sm"
//                       color="success"
//                       className="px-3"
//                       onClick={handleAutoCaptureAll}
//                       disabled={isCapturing}
//                     >
//                       {isCapturing ? (
//                         <>
//                           <Spinner size="sm" className="me-2" />
//                           Capturing...
//                         </>
//                       ) : (
//                         <>
//                           <i className="mdi mdi-camera-burst me-2"></i>
//                           Auto Capture All
//                         </>
//                       )}
//                     </Button>
//                   </Col>
//                 </Row>
//               </CardHeader>
//               <CardBody className="p-4 gallery-scroll">
//                 {stages.map((stage, stageIndex) => (
//                   <div key={stageIndex} className="mb-4">
//                     <Row className="align-items-center mb-3">
//                       <Col md={8}>
//                         <h4 className="mb-0 text-dark">
//                           {stage.stage_name}
//                         </h4>
//                         <small className="text-muted">
//                           Stage Code: {stage.stage_code}
//                         </small>
//                       </Col>
//                       <Col md={4} className="text-end">
//                         <Badge color="primary" pill>
//                           {(cameraDevices[stageIndex] || []).filter(d => d !== null).length}/
//                           {(stage?.camera_selection?.cameras || []).length} Cameras
//                         </Badge>
//                       </Col>
//                     </Row>
//                     <Row>
//                       {(stage?.camera_selection?.cameras || []).map((camera, camIndex) => {
//                         const videoKey = `${stageIndex}-${camIndex}`;
//                         const deviceId = (cameraDevices[stageIndex] || [])[camIndex];
//                         const hasDevice = !!deviceId;
//                         const isCaptured = captureStatus[videoKey];

//                         return (
//                           <Col lg={6} md={12} key={camIndex} className="mb-4">
//                             <Card className={`camera-card ${isCaptured ? "captured" : ""}`}>
//                               <CardHeader className="bg-dark text-white d-flex justify-content-between align-items-center py-2">
//                                 <span className="fw-bold">
//                                   <i className="mdi mdi-camera me-2"></i>
//                                   {camera.label}
//                                 </span>
//                                 {isCaptured && (
//                                   <Badge color="success" pill>
//                                     <i className="mdi mdi-check"></i> Captured
//                                   </Badge>
//                                 )}
//                               </CardHeader>
//                               <CardBody className="p-0">
//                                 <div className="webcam-container" style={{ height: "280px", position: "relative" }}>
//                                   {hasDevice ? (
//                                     <>
//                                       <WebcamCapture
//                                         ref={(el) => { if (el) webcamRefs.current[camera.originalLabel] = el; }}
//                                         resolution={DEFAULT_RESOLUTION}
//                                         cameraLabel={camera.originalLabel}
//                                         style={{
//                                           position: "absolute",
//                                           top: 0,
//                                           left: 0,
//                                           width: "100%",
//                                           height: "100%",
//                                           objectFit: "cover"
//                                         }}
//                                       />
//                                       <Badge color="success" pill className="camera-status-badge">
//                                         <i className="mdi mdi-circle" style={{ fontSize: "8px" }}></i> Live
//                                       </Badge>
//                                     </>
//                                   ) : (
//                                     <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
//                                       <i className="mdi mdi-camera-off" style={{ fontSize: "48px" }}></i>
//                                       <p className="mt-2 mb-0">Camera Not Available</p>
//                                     </div>
//                                   )}
//                                 </div>
//                               </CardBody>
//                             </Card>
//                           </Col>
//                         );
//                       })}
//                     </Row>
//                   </div>
//                 ))}
//               </CardBody>
//             </Card>
//           </Col>

//           {/* Right Side - Image Gallery */}

//           {/* Stage Tabs */}


//           <Col lg={5} xl={4}>
//             <div className="d-flex mb-3" style={{ borderBottom: "2px solid #e9ecef" }}>
//               {stages.map((stage, index) => (
//                 <div
//                   key={stage._id.$oid}
//                   className={`stage-tab ${selectedStage === index ? "active" : ""}`}
//                   onClick={() => setSelectedStage(index)}
//                 >
//                   {stage.stage_name}
//                 </div>
//               ))}
//             </div>
//             <Card className="stage-card">
//               <CardHeader className="bg-white border-bottom">
//                 <h5 className="mb-0">
//                   <i className="mdi mdi-image-multiple me-2 text-primary"></i>
//                   Image Gallery
//                   <Badge color="info" pill className="ms-2">
//                     {galleryImages.length} Images
//                   </Badge>
//                 </h5>
//               </CardHeader>
//               <CardBody className="p-3">
//                 {loadingGallery ? (
//                   <div className="text-center py-5">
//                     <Spinner color="primary" />
//                     <p className="mt-2 text-muted">Loading images...</p>
//                   </div>
//                 ) : galleryImages.length === 0 ? (
//                   <div className="text-center py-5 text-muted">
//                     <i className="mdi mdi-image-off" style={{ fontSize: "48px" }}></i>
//                     <p className="mt-2">No images captured yet</p>
//                   </div>
//                 ) : (
//                   <div className="gallery-scroll">
//                     {console.log("galleryImages", galleryImages)}
//                     <Row>
//                       {galleryImages.map((img, idx) => (
//                         <Col md={6} key={idx}>
//                           <div className="gallery-item">
//                             <Button
//                               color="danger"
//                               size="sm"
//                               className="delete-btn"
//                               onClick={() => handleDeleteImage(img)}
//                             >
//                               <i className="mdi mdi-delete"></i>
//                             </Button>
//                             <img
//                               src={`${ImageUrl}${img.insp_local_path}`}
//                               alt={img.camera_label}
//                               className="gallery-image"
//                               onClick={() => {
//                                 setPreviewImage(img);
//                                 setShowPreview(true);
//                               }}
//                             />
//                             <div className="mt-1">
//                               <small className="text-muted d-block">
//                                 <i className="mdi mdi-camera me-1"></i>
//                                 {img.camera_label}
//                               </small>
//                               <small className="text-muted d-block">
//                                 <i className="mdi mdi-clock-outline me-1"></i>
//                                 {new Date(img.timestamp).toLocaleString()}
//                               </small>
//                             </div>
//                           </div>
//                         </Col>
//                       ))}
//                     </Row>
//                   </div>
//                 )}
//               </CardBody>
//             </Card>
//           </Col>
//         </Row>
//       </Container>

//       {/* Image Preview Modal */}
//       <Modal isOpen={showPreview} toggle={() => setShowPreview(false)} size="lg">
//         <ModalHeader toggle={() => setShowPreview(false)}>
//           {previewImage?.camera_label}
//         </ModalHeader>
//         <ModalBody className="text-center">
//           {previewImage && (
//             <>
//               <img
//                 src={previewImage.insp_local_path}
//                 alt={previewImage.camera_label}
//                 style={{ maxWidth: "100%", maxHeight: "70vh" }}
//               />
//               <div className="mt-3 text-start">
//                 <p><strong>Filename:</strong> {previewImage.filename}</p>
//                 <p><strong>Camera:</strong> {previewImage.camera_label}</p>
//                 <p><strong>Timestamp:</strong> {new Date(previewImage.timestamp).toLocaleString()}</p>
//                 <p><strong>Dimensions:</strong> {previewImage.width} x {previewImage.height}</p>
//               </div>
//             </>
//           )}
//         </ModalBody>
//       </Modal>
//     </div>
//   );
// };

// export default RemoteStg;


// import React, { useEffect, useRef, useState } from "react";
// import Webcam from "react-webcam";
// import WebcamCapture from "pages/WebcamCustom/WebcamCapture";
// import { useLocation, useHistory } from "react-router-dom";
// import urlSocket from "./urlSocket";
// import ImageUrl from "./imageUrl";

// import {
//   Container,
//   Button,
//   Col,
//   Row,
//   Card,
//   CardBody,
//   CardHeader,
//   Badge,
//   Spinner,
//   Alert,
//   Modal,
//   ModalHeader,
//   ModalBody,
//   Input
// } from "reactstrap";
// import Swal from "sweetalert2";
// import { DEFAULT_RESOLUTION } from "./cameraConfig";

// const RemoteStg = () => {
//   const location = useLocation();
//   const history = useHistory();
//   const { datas } = location.state || {};

//   const stages = datas?.stages || [];

//   const [cameraDevices, setCameraDevices] = useState({});
//   const webcamRefs = useRef([]);
//   const [isCapturing, setIsCapturing] = useState(false);
//   const [captureStatus, setCaptureStatus] = useState({});
//   const [notification, setNotification] = useState("");
//   // ---- add these state variables near the other gallery states ----
//   const [selectedCameraLabel, setSelectedCameraLabel] = useState(null); // null = show all

//   // Gallery states
//   const [galleryImages, setGalleryImages] = useState([]);
//   const [loadingGallery, setLoadingGallery] = useState(false);
//   const [selectedStage, setSelectedStage] = useState(null);
//   const [previewImage, setPreviewImage] = useState(null);
//   const [showPreview, setShowPreview] = useState(false);

//   // Selection state
//   const [selectedImages, setSelectedImages] = useState(new Set());
//   const [selectAll, setSelectAll] = useState(false);

//   // Setup camera device IDs
//   useEffect(() => {
//     async function setupCameraDevices() {
//       try {
//         await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
//         const devices = await navigator.mediaDevices.enumerateDevices();

//         const deviceMap = {};

//         for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
//           const stage = stages[stageIndex];
//           const cameras = stage?.camera_selection?.cameras || [];
//           deviceMap[stageIndex] = [];

//           for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
//             const cam = cameras[camIndex];
//             const videoDevice = devices.find((d) => {
//               if (d.kind !== "videoinput") return false;
//               const label = d.label?.toLowerCase() || "";
//               const origLabel = cam.originalLabel?.toLowerCase() || "";
//               const vid = cam.v_id?.toLowerCase() || "";
//               const pid = cam.p_id?.toLowerCase() || "";
//               return (
//                 label.includes(origLabel) ||
//                 label.includes(vid) ||
//                 label.includes(pid)
//               );
//             });

//             if (!videoDevice) {
//               console.warn(`Warning: No matching device for ${cam.label}`);
//               deviceMap[stageIndex].push(null);
//             } else {
//               deviceMap[stageIndex].push(videoDevice.deviceId);
//             }
//           }
//         }

//         setCameraDevices(deviceMap);
//       } catch (error) {
//         console.error("Camera setup failed:", error);
//       }
//     }

//     setupCameraDevices();
//   }, [stages]);

//   // Load gallery images when stage is selected
//   useEffect(() => {
//     if (selectedStage !== null) {
//       loadGalleryImages(selectedStage);
//     }
//   }, [selectedStage]);

//   // Set first stage as default
//   useEffect(() => {
//     if (stages.length > 0) {
//       setSelectedStage(0);
//     }
//   }, [stages]);

//   // Sync selectAll with actual selection
//   useEffect(() => {
//     if (galleryImages.length > 0) {
//       const allSelected = galleryImages.every(img => selectedImages.has(img.filename));
//       setSelectAll(allSelected);
//     } else {
//       setSelectAll(false);
//     }
//   }, [selectedImages, galleryImages]);

//   const loadGalleryImages = async (stageIndex) => {
//     setLoadingGallery(true);
//     setSelectedImages(new Set()); // Reset selection
//     try {
//       const stage = stages[stageIndex];
//       const response = await urlSocket.post("/get_training_images", {
//         comp_code: datas.comp_code,
//         stage_code: stage.stage_code
//       });

//       setGalleryImages(response.data.images || []);
//     } catch (error) {
//       console.error("Failed to load gallery images:", error);
//       setGalleryImages([]);
//     } finally {
//       setLoadingGallery(false);
//     }
//   };
//   const handleDeleteImage = async (image) => {
//     const result = await Swal.fire({
//       title: "Delete Image?",
//       text: "This action cannot be undone",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#dc3545",
//       cancelButtonColor: "#6c757d",
//       confirmButtonText: "Yes, delete it!"
//     });

//     if (result.isConfirmed) {
//       try {
//         const response = await urlSocket.post("/delete_training_image", {
//           filename: image.filename,
//           camera_label: image.camera_label
//         });

//         if (response.data.success) {
//           Swal.fire("Deleted!", "Image has been deleted.", "success");
//           loadGalleryImages(selectedStage);
//         } else {
//           Swal.fire("Error!", "Failed to delete image", "error");
//         }
//       } catch (error) {
//         console.error("Delete error:", error);
//         Swal.fire("Error!", "Failed to delete image", "error");
//       }
//     }
//   };

//   const handleBulkDelete = async () => {
//     if (selectedImages.size === 0) {
//       Swal.fire("No Selection", "Please select at least one image to delete.", "info");
//       return;
//     }

//     const result = await Swal.fire({
//       title: `Delete ${selectedImages.size} Image(s)?`,
//       text: "This action cannot be undone",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#dc3545",
//       cancelButtonColor: "#6c757d",
//       confirmButtonText: "Yes, delete all!"
//     });

//     if (result.isConfirmed) {
//       try {
//         const deletePromises = Array.from(selectedImages).map(filename => {
//           const image = galleryImages.find(img => img.filename === filename);
//           return urlSocket.post("/delete_training_image", {
//             filename,
//             camera_label: image.camera_label
//           });
//         });

//         const responses = await Promise.all(deletePromises);
//         const allSuccess = responses.every(r => r.data.success);

//         if (allSuccess) {
//           Swal.fire("Deleted!", `${selectedImages.size} images deleted.`, "success");
//           loadGalleryImages(selectedStage);
//         } else {
//           Swal.fire("Partial Success", "Some images failed to delete.", "warning");
//         }
//       } catch (error) {
//         console.error("Bulk delete error:", error);
//         Swal.fire("Error!", "Failed to delete selected images.", "error");
//       }
//     }
//   };

//   const toggleImageSelection = (filename) => {
//     const newSelected = new Set(selectedImages);
//     if (newSelected.has(filename)) {
//       newSelected.delete(filename);
//     } else {
//       newSelected.add(filename);
//     }
//     setSelectedImages(newSelected);
//   };

//   const toggleSelectAll = () => {
//     if (selectAll) {
//       setSelectedImages(new Set());
//     } else {
//       const allFilenames = galleryImages.map(img => img.filename);
//       setSelectedImages(new Set(allFilenames));
//     }
//   };

//   const showNotification = (message) => {
//     setNotification(message);
//     setTimeout(() => setNotification(""), 3000);
//   };

//   const dataURLtoBlob = (dataURL) => {
//     const arr = dataURL.split(",");
//     const mime = arr[0].match(/:(.*?);/)[1];
//     const bstr = atob(arr[1]);
//     let n = bstr.length;
//     const u8arr = new Uint8Array(n);
//     while (n--) u8arr[n] = bstr.charCodeAt(n);
//     return new Blob([u8arr], { type: mime });
//   };

//   // const handleAutoCaptureAll = async () => {
//   //   if (isCapturing) return;
//   //   setIsCapturing(true);
//   //   setCaptureStatus({});

//   //   try {
//   //     for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
//   //       const stage = stages[stageIndex];
//   //       const cameras = stage?.camera_selection?.cameras || [];
//   //       const devices = cameraDevices[stageIndex] || [];

//   //       const formData = new FormData();
//   //       formData.append("comp_name", datas.comp_name);
//   //       formData.append("comp_id", datas.comp_id);
//   //       formData.append("comp_code", datas.comp_code);
//   //       formData.append("stage_name", stage.stage_name);
//   //       formData.append("stage_code", stage.stage_code);

//   //       for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
//   //         const videoKey = `${stageIndex}-${camIndex}`;
//   //         const camera = cameras[camIndex];
//   //         const webcamInstance = webcamRefs.current[camera.originalLabel];

//   //         if (!webcamInstance || !devices[camIndex]) {
//   //           console.warn(`Camera not available: ${camera.label}`);
//   //           continue;
//   //         }

//   //         await new Promise((res) => setTimeout(res, 300));

//   //         const base64Image = webcamInstance.captureZoomedImage();

//   //         if (!base64Image) {
//   //           console.warn(`Failed to capture from ${camera.label}`);
//   //           continue;
//   //         }

//   //         setCaptureStatus((prev) => ({
//   //           ...prev,
//   //           [videoKey]: true,
//   //         }));

//   //         const blob = dataURLtoBlob(base64Image);
//   //         const fileName = `${stage.stage_name}_${camera.label}_${Date.now()}.png`;
//   //         formData.append(`img_${camIndex}`, blob, fileName);
//   //         formData.append(`img_${camIndex}_label`, camera.label);
//   //       }

//   //       const response = await urlSocket.post("/remoteMultiCapture", formData);
//   //       console.log("Uploaded:", response.data);
//   //       if (response.data.error) {
//   //         Swal.fire({
//   //           title: "Error",
//   //           text: response.data.error,
//   //           icon: "error",
//   //           confirmButtonText: "OK",
//   //           confirmButtonColor: "#dc3545",
//   //         });
//   //         break; // Stop the process if the error is encountered
//   //       }
//   //     }



//   //     Swal.fire({
//   //       title: "Success!",
//   //       text: "All stage images were captured and stored successfully.",
//   //       icon: "success",
//   //       confirmButtonText: "OK",
//   //       confirmButtonColor: "#28a745"
//   //     });

//   //     if (selectedStage !== null) {
//   //       loadGalleryImages(selectedStage);
//   //     }
//   //   } catch (error) {
//   //     console.error("Capture error:", error);
//   //     Swal.fire({
//   //       title: "Error!",
//   //       text: "An error occurred while capturing images.",
//   //       icon: "error",
//   //       confirmButtonText: "Try Again",
//   //       confirmButtonColor: "#dc3545"
//   //     });
//   //   } finally {
//   //     setIsCapturing(false);
//   //   }
//   // };
//   const handleAutoCaptureAll = async () => {
//     if (isCapturing) return;
//     setIsCapturing(true);
//     setCaptureStatus({});

//     try {
//       for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
//         const stage = stages[stageIndex];
//         const cameras = stage?.camera_selection?.cameras || [];
//         const devices = cameraDevices[stageIndex] || [];

//         const formData = new FormData();
//         formData.append("comp_name", datas.comp_name);
//         formData.append("comp_id", datas.comp_id);
//         formData.append("comp_code", datas.comp_code);
//         formData.append("stage_name", stage.stage_name);
//         formData.append("stage_code", stage.stage_code);

//         // Sequentially capture images for each camera in a stage
//         for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
//           const camera = cameras[camIndex];
//           const webcamInstance = webcamRefs.current[camera.originalLabel];

//           if (!webcamInstance || !devices[camIndex]) {
//             console.warn(`Camera not available: ${camera.label}`);
//             continue;
//           }

//           await new Promise((res) => setTimeout(res, 300)); // Wait to ensure camera is ready

//           const base64Image = webcamInstance.captureZoomedImage();

//           if (!base64Image) {
//             console.warn(`Failed to capture from ${camera.label}`);
//             continue;
//           }

//           // Update the capture status to show the current image is being captured
//           const videoKey = `${stageIndex}-${camIndex}`;
//           setCaptureStatus((prev) => ({
//             ...prev,
//             [videoKey]: true,
//           }));

//           const blob = dataURLtoBlob(base64Image);
//           const fileName = `${stage.stage_name}_${camera.label}_${Date.now()}.png`;
//           formData.append(`img_${camIndex}`, blob, fileName);
//           formData.append(`img_${camIndex}_label`, camera.label);

//           // Show progress for each camera capture
//           Swal.fire({
//             title: "Capturing Image",
//             text: `Capturing image for ${camera.label} at ${stage.stage_name}...`,
//             icon: "info",
//             showConfirmButton: false,
//             allowOutsideClick: false,
//             didOpen: () => {
//               Swal.showLoading();
//             }
//           });

//           // Capture and upload image to server
//           const response = await urlSocket.post("/remoteMultiCapture_sequential", formData);
//           console.log("Uploaded:", response.data);

//           if (response.data.error) {
//             Swal.fire({
//               title: "Error",
//               text: response.data.error,
//               icon: "error",
//               confirmButtonText: "OK",
//               confirmButtonColor: "#dc3545",
//             });
//             break; // Stop the process if the error is encountered
//           }

//           // Show success for each captured image
//           Swal.fire({
//             title: "Image Captured",
//             text: `Image for ${camera.label} captured successfully.`,
//             icon: "success",
//             confirmButtonText: "OK",
//             confirmButtonColor: "#28a745",
//           });

//           // Proceed to next camera or stage
//         }
//       }

//       // Final success message after capturing all images
//       Swal.fire({
//         title: "Success!",
//         text: "All stage images were captured and stored successfully.",
//         icon: "success",
//         confirmButtonText: "OK",
//         confirmButtonColor: "#28a745",
//       });

//       if (selectedStage !== null) {
//         loadGalleryImages(selectedStage);
//       }
//     } catch (error) {
//       console.error("Capture error:", error);
//       Swal.fire({
//         title: "Error!",
//         text: "An error occurred while capturing images.",
//         icon: "error",
//         confirmButtonText: "Try Again",
//         confirmButtonColor: "#dc3545",
//       });
//     } finally {
//       setIsCapturing(false);
//     }
//   };

//   const handleStageCameraSync = async () => {
//     try {
//       const res = await urlSocket.post("/sync_training_mode_result_train");
//       Swal.fire({
//         title: "Sync Complete!",
//         text: `Total Synced: ${res.data.count}`,
//         icon: "success",
//         confirmButtonColor: "#28a745"
//       });
//     } catch (err) {
//       console.error("Error:", err);
//       Swal.fire({
//         title: "Sync Failed!",
//         text: "Failed to sync training results.",
//         icon: "error",
//         confirmButtonColor: "#dc3545"
//       });
//     }
//   };

//   const back = () => history.goBack();

//   return (
//     <div className="page-content" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
//       <style>
//         {`
//           .camera-card {
//             transition: all 0.3s ease;
//             border: none;
//             box-shadow: 0 2px 8px rgba(0,0,0,0.08);
//           }
//           .camera-card:hover {
//             transform: translateY(-4px);
//             box-shadow: 0 8px 16px rgba(0,0,0,0.12);
//           }
//           .camera-card.captured {
//             border: 2px solid #28a745 !important;
//           }
//           .stage-card {
//             border: none;
//             box-shadow: 0 4px 12px rgba(0,0,0,0.1);
//             height: calc(100vh - 200px);
//             display: flex;
//             flex-direction: column;
//           }
//           .header-card {
//             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//             color: white;
//             border: none;
//             box-shadow: 0 4px 12px rgba(0,0,0,0.15);
//           }
//           .webcam-container {
//             position: relative;
//             overflow: hidden;
//             border-radius: 8px;
//             background: #000;
//           }
//           .camera-status-badge {
//             position: absolute;
//             top: 10px;
//             right: 10px;
//             z-index: 10;
//           }
//           .gallery-image {
//             width: 100%;
//             height: 180px;
//             object-fit: cover;
//             cursor: pointer;
//             transition: transform 0.2s;
//             border-radius: 8px;
//           }
//           .gallery-image:hover {
//             transform: scale(1.05);
//           }
//           .gallery-item {
//             position: relative;
//             margin-bottom: 1rem;
//             border: 2px solid transparent;
//             border-radius: 10px;
//             transition: border 0.2s;
//           }
//           .gallery-item.selected {
//             border-color: #007bff;
//           }
//           .gallery-item:hover {
//             border-color: #dee2e6;
//           }
//           .delete-btn {
//             position: absolute;
//             top: 8px;
//             right: 8px;
//             z-index: 10;
//             background: rgba(220, 53, 69, 0.9);
//             border: none;
//             border-radius: 50%;
//             width: 32px;
//             height: 32px;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             box-shadow: 0 2px 6px rgba(0,0,0,0.2);
//           }
//           .gallery-scroll {
//             flex: 1;
//             overflow-y: auto;
//             padding-right: 8px;
//           }
//           .gallery-scroll::-webkit-scrollbar {
//             width: 6px;
//           }
//           .gallery-scroll::-webkit-scrollbar-thumb {
//             background-color: rgba(0,0,0,.3);
//             border-radius: 3px;
//           }
//           .stage-tab {
//             cursor: pointer;
//             transition: all 0.3s;
//             padding: 10px 20px;
//             border-radius: 8px 8px 0 0;
//             background: #e9ecef;
//             margin-right: 5px;
//           }
//           .stage-tab.active {
//             background: white;
//             font-weight: bold;
//             box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
//           }
//           .stage-tab:hover {
//             background: #dee2e6;
//           }
//           .capture-btn-container {
//             position: sticky;
//             top: 0;
//             background: white;
//             z-index: 10;
//             padding: 1rem 0;
//             border-bottom: 1px solid #dee2e6;
//             margin-bottom: 1rem;
//           }
//           .checkbox-container {
//             position: absolute;
//             top: 8px;
//             left: 8px;
//             z-index: 10;
//             background: rgba(255, 255, 255, 0.9);
//             border-radius: 4px;
//             padding: 2px;
//           }
//         `}
//       </style>

//       <Container fluid>
//         {/* Notification Toast */}
//         {notification && (
//           <div
//             style={{
//               position: "fixed",
//               top: "20px",
//               right: "20px",
//               zIndex: 9999,
//               maxWidth: "300px"
//             }}
//           >
//             <Alert color="success" className="mb-0 shadow-lg">
//               <i className="mdi mdi-check-circle me-2"></i>
//               {notification}
//             </Alert>
//           </div>
//         )}

//         {/* Header */}
//         <Card className="header-card mb-4">
//           <CardBody className="py-3">
//             <Row className="align-items-center">
//               <Col md={4}>
//                 <h3 className="mb-0 text-white">
//                   <i className="mdi mdi-camera-burst me-2"></i>
//                   Remote Camera Gallery
//                 </h3>
//               </Col>
//               <Col md={8} className="text-end">
//                 <Button
//                   color="light"
//                   outline
//                   className="me-2"
//                   onClick={handleStageCameraSync}
//                 >
//                   <i className="mdi mdi-sync me-1"></i>
//                   Training Sync
//                 </Button>
//                 <Button
//                   color="light"
//                   onClick={back}
//                 >
//                   <i className="mdi mdi-arrow-left me-1"></i>
//                   Back
//                 </Button>
//               </Col>
//             </Row>
//           </CardBody>
//         </Card>



//         {/* Split Screen Layout - Equal Width */}
//         <Row>
//           {/* Left Side - All Camera Previews */}
//           <Col lg={6}>
//             <Card className="stage-card">
//               <CardHeader className="bg-white border-bottom pb-0">
//                 <div className="capture-btn-container text-center">
//                   <Button
//                     size="lg"
//                     color="success"
//                     className="px-5"
//                     onClick={handleAutoCaptureAll}
//                     disabled={isCapturing}
//                   >
//                     {isCapturing ? (
//                       <>
//                         <Spinner size="sm" className="me-2" />
//                         Capturing All...
//                       </>
//                     ) : (
//                       <>
//                         <i className="mdi mdi-camera-burst me-2"></i>
//                         Auto Capture All Cameras
//                       </>
//                     )}
//                   </Button>
//                 </div>
//               </CardHeader>
//               <CardBody className="p-3 gallery-scroll">
//                 {stages.map((stage, stageIndex) => (
//                   <div key={stageIndex} className="mb-5">
//                     <Row className="align-items-center mb-3">
//                       <Col>
//                         <h5 className="mb-0 text-dark">
//                           {stage.stage_name}
//                         </h5>
//                         <small className="text-muted">
//                           Stage Code: {stage.stage_code}
//                         </small>
//                       </Col>
//                       <Col xs="auto">
//                         <Badge color="primary" pill>
//                           {(cameraDevices[stageIndex] || []).filter(d => d !== null).length}/
//                           {(stage?.camera_selection?.cameras || []).length}
//                         </Badge>
//                       </Col>
//                     </Row>
//                     <Row>
//                       {(stage?.camera_selection?.cameras || []).map((camera, camIndex) => {
//                         const videoKey = `${stageIndex}-${camIndex}`;
//                         const deviceId = (cameraDevices[stageIndex] || [])[camIndex];
//                         const hasDevice = !!deviceId;
//                         const isCaptured = captureStatus[videoKey];

//                         return (
//                           <Col md={6} key={camIndex} className="mb-3">
//                             <Card className={`camera-card ${isCaptured ? "captured" : ""}`}>
//                               <CardHeader className="bg-dark text-white d-flex justify-content-between align-items-center py-2">
//                                 <span className="fw-bold text-truncate" style={{ maxWidth: '150px' }}>
//                                   <i className="mdi mdi-camera me-1"></i>
//                                   {camera.label}
//                                 </span>
//                                 {isCaptured && (
//                                   <Badge color="success" pill>
//                                     <i className="mdi mdi-check"></i>
//                                   </Badge>
//                                 )}
//                               </CardHeader>
//                               <CardBody className="p-0">
//                                 <div className="webcam-container" style={{ height: "220px", position: "relative" }}>
//                                   {hasDevice ? (
//                                     <>
//                                       <WebcamCapture
//                                         ref={(el) => { if (el) webcamRefs.current[camera.originalLabel] = el; }}
//                                         resolution={DEFAULT_RESOLUTION}
//                                         cameraLabel={camera.originalLabel}
//                                         style={{
//                                           position: "absolute",
//                                           top: 0,
//                                           left: 0,
//                                           width: "100%",
//                                           height: "100%",
//                                           objectFit: "cover"
//                                         }}
//                                       />
//                                       <Badge color="success" pill className="camera-status-badge">
//                                         <i className="mdi mdi-circle" style={{ fontSize: "8px" }}></i> Live
//                                       </Badge>
//                                     </>
//                                   ) : (
//                                     <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
//                                       <i className="mdi mdi-camera-off" style={{ fontSize: "36px" }}></i>
//                                       <small className="mt-1">Not Available</small>
//                                     </div>
//                                   )}
//                                 </div>
//                               </CardBody>
//                             </Card>
//                           </Col>
//                         );
//                       })}
//                     </Row>
//                   </div>
//                 ))}
//               </CardBody>
//             </Card>
//           </Col>
//           {/* ====================  RIGHT SIDE – IMAGE GALLERY (SMALL ICONS) ==================== */}
//           <Col lg={6}>

//             <div className="d-flex mb-3" style={{ borderBottom: "2px solid #e9ecef" }}>
//               {stages.map((stage, index) => (
//                 <div
//                   key={stage._id.$oid}
//                   className={`stage-tab ${selectedStage === index ? "active" : ""}`}
//                   onClick={() => setSelectedStage(index)}
//                 >
//                   {stage.stage_name}
//                 </div>
//               ))}
//             </div>
//             {(() => {
//               const byCamera = {};
//               galleryImages.forEach(img => {
//                 const key = (img.camera_label || "").trim();
//                 if (!byCamera[key]) byCamera[key] = [];
//                 byCamera[key].push(img);
//               });

//               const sortedLabels = Object.keys(byCamera).sort((a, b) => a.localeCompare(b));

//               const shownImages =
//                 selectedCameraLabel && byCamera[selectedCameraLabel]
//                   ? byCamera[selectedCameraLabel]
//                   : galleryImages;

//               const allShownIds = shownImages.map(i => i.filename);
//               const allSelected = allShownIds.every(id => selectedImages.has(id));

//               return (
//                 <div
//                   style={{
//                     backgroundColor: "#fff",
//                     borderRadius: "10px",
//                     padding: "16px",
//                     boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//                     height: "calc(100vh - 200px)",
//                     display: "flex",
//                     flexDirection: "column",
//                   }}
//                 >
//                   {/* Header */}
//                   <div style={{ marginBottom: "16px" }}>
//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
//                       <h6 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#111827" }}>
//                         Image Gallery ({galleryImages.length})
//                       </h6>
//                       <Button
//                         size="sm"
//                         onClick={() => loadGalleryImages()}
//                         disabled={loadingGallery}
//                         style={{
//                           backgroundColor: "#6366f1",
//                           border: "none",
//                           borderRadius: "6px",
//                           padding: "4px 12px",
//                           fontSize: "12px",
//                           fontWeight: "500",
//                           color: "#fff",
//                         }}
//                       >
//                         {loadingGallery ? "Loading..." : "Refresh"}
//                       </Button>
//                     </div>

//                     {/* Camera Tabs */}


//                     {/* Selection Controls */}
//                     {selectedImages.size > 0 && (
//                       <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
//                         <Button size="sm" color="info" onClick={() => allSelected ? setSelectedImages(new Set()) : setSelectedImages(new Set(allShownIds))}>
//                           {allSelected ? "Deselect All" : "Select All"}
//                         </Button>
//                         <Button size="sm" color="danger" onClick={handleBulkDelete}>
//                           Delete ({selectedImages.size})
//                         </Button>
//                         <Button size="sm" color="secondary" onClick={() => setSelectedImages(new Set())}>
//                           Clear
//                         </Button>
//                       </div>
//                     )}
//                   </div>

//                   {/* Images Grid */}
//                   <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
//                     {loadingGallery ? (
//                       <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af" }}>
//                         <Spinner color="primary" />
//                         <p style={{ fontSize: "14px", marginTop: "12px" }}>Loading images...</p>
//                       </div>
//                     ) : shownImages.length === 0 ? (
//                       <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af" }}>
//                         <p style={{ fontSize: "14px", fontWeight: "500" }}>
//                           {selectedCameraLabel ? `No images for ${selectedCameraLabel}` : "No images captured yet"}
//                         </p>
//                       </div>
//                     ) : (
//                       <Row className="g-3">
//                         {shownImages.map(image => {
//                           const isSelected = selectedImages.has(image.filename);
//                           const isSingleHighlight = !selectedImages.size && previewImage?.filename === image.filename;

//                           return (
//                             <Col key={image.filename} xs={6} md={4}>
//                               <div
//                                 style={{
//                                   position: "relative",
//                                   borderRadius: "8px",
//                                   overflow: "hidden",
//                                   border: isSelected ? "3px solid #6366f1" : isSingleHighlight ? "3px solid #10b981" : "1px solid #e5e7eb",
//                                   cursor: "pointer",
//                                   transition: "all 0.2s ease",
//                                 }}
//                                 onClick={() => setPreviewImage(image)}
//                                 onMouseEnter={e => {
//                                   e.currentTarget.style.transform = "scale(1.05)";
//                                   e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
//                                 }}
//                                 onMouseLeave={e => {
//                                   e.currentTarget.style.transform = "scale(1)";
//                                   e.currentTarget.style.boxShadow = "none";
//                                 }}
//                               >
//                                 <img
//                                   src={`${ImageUrl}${image.insp_local_path}`}
//                                   alt={image.camera_label}
//                                   style={{ width: "100%", height: "120px", objectFit: "cover" }}
//                                   onError={e => (e.target.src = "/fallback.png")}
//                                 />

//                                 {/* SMALL CHECKBOX */}
//                                 <div
//                                   onClick={e => {
//                                     e.stopPropagation();
//                                     toggleImageSelection(image.filename);
//                                   }}
//                                   style={{
//                                     position: "absolute",
//                                     top: "6px",
//                                     left: "6px",
//                                     width: "20px",
//                                     height: "20px",
//                                     borderRadius: "4px",
//                                     backgroundColor: isSelected ? "#6366f1" : "rgba(255,255,255,0.85)",
//                                     border: "2px solid " + (isSelected ? "#6366f1" : "#d1d5db"),
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     cursor: "pointer",
//                                   }}
//                                 >
//                                   {isSelected && <i className="fa fa-check" style={{ color: "#fff", fontSize: "11px" }} />}
//                                 </div>

//                                 {/* SMALL EYE */}
//                                 <button
//                                   onClick={e => {
//                                     e.stopPropagation();
//                                     setPreviewImage(image);
//                                     setShowPreview(true);
//                                   }}
//                                   style={{
//                                     position: "absolute",
//                                     top: "6px",
//                                     left: "50%",
//                                     transform: "translateX(-50%)",
//                                     backgroundColor: "rgba(99,102,241,0.9)",
//                                     border: "none",
//                                     borderRadius: "50%",
//                                     width: "26px",
//                                     height: "26px",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     cursor: "pointer",
//                                   }}
//                                 >
//                                   <i className="fa fa-eye" style={{ color: "#fff", fontSize: "13px" }} />
//                                 </button>

//                                 {/* SMALL X */}
//                                 <button
//                                   onClick={e => {
//                                     e.stopPropagation();
//                                     handleDeleteImage(image);
//                                   }}
//                                   style={{
//                                     position: "absolute",
//                                     top: "6px",
//                                     right: "6px",
//                                     backgroundColor: "rgba(239,68,68,0.9)",
//                                     border: "none",
//                                     borderRadius: "50%",
//                                     width: "26px",
//                                     height: "26px",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     cursor: "pointer",
//                                   }}
//                                 >
//                                   <i className="fa fa-times" style={{ color: "#fff", fontSize: "13px" }} />
//                                 </button>

//                                 {/* Filename */}
//                                 <div style={{
//                                   position: "absolute",
//                                   bottom: 0,
//                                   left: 0,
//                                   right: 0,
//                                   background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
//                                   padding: "6px 6px 3px",
//                                 }}>
//                                   <p style={{
//                                     margin: 0,
//                                     fontSize: "10px",
//                                     fontWeight: "600",
//                                     color: "#fff",
//                                     textOverflow: "ellipsis",
//                                     overflow: "hidden",
//                                     whiteSpace: "nowrap",
//                                   }}>
//                                     {image.filename}
//                                   </p>
//                                 </div>
//                               </div>
//                             </Col>
//                           );
//                         })}
//                       </Row>
//                     )}
//                   </div>

//                   {/* Single image details */}
//                   {previewImage && selectedImages.size === 0 && (
//                     <div style={{
//                       marginTop: "16px",
//                       padding: "10px",
//                       backgroundColor: "#f9fafb",
//                       borderRadius: "8px",
//                       border: "1px solid #e5e7eb",
//                       fontSize: "12px"
//                     }}>
//                       <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
//                         <strong>{previewImage.camera_label}</strong>
//                         <button onClick={() => setPreviewImage(null)} style={{ background: "none", border: "none", fontSize: "16px" }}>×</button>
//                       </div>
//                       <div style={{ color: "#6b7280" }}>
//                         <div><strong>File:</strong> {previewImage.filename}</div>
//                         <div><strong>Time:</strong> {new Date(previewImage.timestamp).toLocaleString()}</div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })()}
//           </Col>
//         </Row>
//       </Container>

//       {/* Image Preview Modal */}
//       <Modal isOpen={showPreview} toggle={() => setShowPreview(false)} size="lg">
//         <ModalHeader toggle={() => setShowPreview(false)}>
//           {previewImage?.camera_label}
//         </ModalHeader>
//         <ModalBody className="text-center">
//           {previewImage && (
//             <>
//               <img
//                 src={`${ImageUrl}${previewImage.insp_local_path}`}
//                 alt={previewImage.camera_label}
//                 style={{ maxWidth: "100%", maxHeight: "70vh" }}
//               />
//               <div className="mt-3 text-start">
//                 <p><strong>Filename:</strong> {previewImage.filename}</p>
//                 <p><strong>Camera:</strong> {previewImage.camera_label}</p>
//                 <p><strong>Timestamp:</strong> {new Date(previewImage.timestamp).toLocaleString()}</p>
//                 <p><strong>Dimensions:</strong> {previewImage.width} x {previewImage.height}</p>
//               </div>
//             </>
//           )}
//         </ModalBody>
//       </Modal>
//     </div>
//   );
// };

// export default RemoteStg;


// import React, { useEffect, useRef, useState } from "react";
// import Webcam from "react-webcam";
// import WebcamCapture from "pages/WebcamCustom/WebcamCapture";
// import { useLocation, useHistory } from "react-router-dom";
// import urlSocket from "./urlSocket";
// import ImageUrl from "./imageUrl";

// import {
//   Container,
//   Button,
//   Col,
//   Row,
//   Card,
//   CardBody,
//   CardHeader,
//   Badge,
//   Spinner,
//   Alert,
//   Modal,
//   ModalHeader,
//   ModalBody,
//   Input
// } from "reactstrap";
// import Swal from "sweetalert2";
// import { DEFAULT_RESOLUTION } from "./cameraConfig";

// const RemoteStg = () => {
//   const location = useLocation();
//   const history = useHistory();
//   const { datas } = location.state || {};

//   const stages = datas?.stages || [];

//   const [cameraDevices, setCameraDevices] = useState({});
//   const webcamRefs = useRef([]);
//   const [isCapturing, setIsCapturing] = useState(false);
//   const [captureStatus, setCaptureStatus] = useState({});
//   const [notification, setNotification] = useState("");
//   const [selectedCameraLabel, setSelectedCameraLabel] = useState(null);

//   // NEW: Capture count state
//   const [captureCount, setCaptureCount] = useState(5);

//   // Gallery states
//   const [galleryImages, setGalleryImages] = useState([]);
//   const [loadingGallery, setLoadingGallery] = useState(false);
//   const [selectedStage, setSelectedStage] = useState(null);
//   const [previewImage, setPreviewImage] = useState(null);
//   const [showPreview, setShowPreview] = useState(false);

//   // Selection state
//   const [selectedImages, setSelectedImages] = useState(new Set());
//   const [selectAll, setSelectAll] = useState(false);

//   // Setup camera device IDs
//   useEffect(() => {
//     async function setupCameraDevices() {
//       try {
//         await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
//         const devices = await navigator.mediaDevices.enumerateDevices();

//         const deviceMap = {};

//         for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
//           const stage = stages[stageIndex];
//           const cameras = stage?.camera_selection?.cameras || [];
//           deviceMap[stageIndex] = [];

//           for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
//             const cam = cameras[camIndex];
//             const videoDevice = devices.find((d) => {
//               if (d.kind !== "videoinput") return false;
//               const label = d.label?.toLowerCase() || "";
//               const origLabel = cam.originalLabel?.toLowerCase() || "";
//               const vid = cam.v_id?.toLowerCase() || "";
//               const pid = cam.p_id?.toLowerCase() || "";
//               return (
//                 label.includes(origLabel) ||
//                 label.includes(vid) ||
//                 label.includes(pid)
//               );
//             });

//             if (!videoDevice) {
//               console.warn(`Warning: No matching device for ${cam.label}`);
//               deviceMap[stageIndex].push(null);
//             } else {
//               deviceMap[stageIndex].push(videoDevice.deviceId);
//             }
//           }
//         }

//         setCameraDevices(deviceMap);
//       } catch (error) {
//         console.error("Camera setup failed:", error);
//       }
//     }

//     setupCameraDevices();
//   }, [stages]);

//   // Load gallery images when stage is selected
//   useEffect(() => {
//     if (selectedStage !== null) {
//       loadGalleryImages(selectedStage);
//     }
//   }, [selectedStage]);

//   // Set first stage as default
//   useEffect(() => {
//     if (stages.length > 0) {
//       setSelectedStage(0);
//     }
//   }, [stages]);

//   // Sync selectAll with actual selection
//   useEffect(() => {
//     if (galleryImages.length > 0) {
//       const allSelected = galleryImages.every(img => selectedImages.has(img.filename));
//       setSelectAll(allSelected);
//     } else {
//       setSelectAll(false);
//     }
//   }, [selectedImages, galleryImages]);

//   const loadGalleryImages = async (stageIndex) => {
//     setLoadingGallery(true);
//     setSelectedImages(new Set());
//     try {
//       const stage = stages[stageIndex];
//       const response = await urlSocket.post("/get_training_images", {
//         comp_code: datas.comp_code,
//         stage_code: stage.stage_code
//       });

//       setGalleryImages(response.data.images || []);
//     } catch (error) {
//       console.error("Failed to load gallery images:", error);
//       setGalleryImages([]);
//     } finally {
//       setLoadingGallery(false);
//     }
//   };

//   const handleDeleteImage = async (image) => {
//     const result = await Swal.fire({
//       title: "Delete Image?",
//       text: "This action cannot be undone",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#dc3545",
//       cancelButtonColor: "#6c757d",
//       confirmButtonText: "Yes, delete it!"
//     });

//     if (result.isConfirmed) {
//       try {
//         const response = await urlSocket.post("/delete_training_image", {
//           filename: image.filename,
//           camera_label: image.camera_label
//         });

//         if (response.data.success) {
//           Swal.fire("Deleted!", "Image has been deleted.", "success");
//           loadGalleryImages(selectedStage);
//         } else {
//           Swal.fire("Error!", "Failed to delete image", "error");
//         }
//       } catch (error) {
//         console.error("Delete error:", error);
//         Swal.fire("Error!", "Failed to delete image", "error");
//       }
//     }
//   };

//   const handleBulkDelete = async () => {
//     if (selectedImages.size === 0) {
//       Swal.fire("No Selection", "Please select at least one image to delete.", "info");
//       return;
//     }

//     const result = await Swal.fire({
//       title: `Delete ${selectedImages.size} Image(s)?`,
//       text: "This action cannot be undone",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#dc3545",
//       cancelButtonColor: "#6c757d",
//       confirmButtonText: "Yes, delete all!"
//     });

//     if (result.isConfirmed) {
//       try {
//         const deletePromises = Array.from(selectedImages).map(filename => {
//           const image = galleryImages.find(img => img.filename === filename);
//           return urlSocket.post("/delete_training_image", {
//             filename,
//             camera_label: image.camera_label
//           });
//         });

//         const responses = await Promise.all(deletePromises);
//         const allSuccess = responses.every(r => r.data.success);

//         if (allSuccess) {
//           Swal.fire("Deleted!", `${selectedImages.size} images deleted.`, "success");
//           loadGalleryImages(selectedStage);
//         } else {
//           Swal.fire("Partial Success", "Some images failed to delete.", "warning");
//         }
//       } catch (error) {
//         console.error("Bulk delete error:", error);
//         Swal.fire("Error!", "Failed to delete selected images.", "error");
//       }
//     }
//   };

//   const toggleImageSelection = (filename) => {
//     const newSelected = new Set(selectedImages);
//     if (newSelected.has(filename)) {
//       newSelected.delete(filename);
//     } else {
//       newSelected.add(filename);
//     }
//     setSelectedImages(newSelected);
//   };

//   const toggleSelectAll = () => {
//     if (selectAll) {
//       setSelectedImages(new Set());
//     } else {
//       const allFilenames = galleryImages.map(img => img.filename);
//       setSelectedImages(new Set(allFilenames));
//     }
//   };

//   const showNotification = (message) => {
//     setNotification(message);
//     setTimeout(() => setNotification(""), 3000);
//   };

//   const dataURLtoBlob = (dataURL) => {
//     const arr = dataURL.split(",");
//     const mime = arr[0].match(/:(.*?);/)[1];
//     const bstr = atob(arr[1]);
//     let n = bstr.length;
//     const u8arr = new Uint8Array(n);
//     while (n--) u8arr[n] = bstr.charCodeAt(n);
//     return new Blob([u8arr], { type: mime });
//   };

//   // NEW: Sequential capture with count and image preview
//   const handleAutoCaptureAll = async () => {
//     if (isCapturing) return;

//     // Validate capture count
//     if (!captureCount || captureCount < 1) {
//       Swal.fire("Invalid Count", "Please enter a valid capture count (minimum 1)", "warning");
//       return;
//     }

//     setIsCapturing(true);
//     setCaptureStatus({});

//     try {
//       // Loop through each stage
//       for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
//         const stage = stages[stageIndex];
//         const cameras = stage?.camera_selection?.cameras || [];
//         const devices = cameraDevices[stageIndex] || [];

//         // Loop through each camera in the stage
//         for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
//           const camera = cameras[camIndex];
//           const webcamInstance = webcamRefs.current[camera.originalLabel];

//           if (!webcamInstance || !devices[camIndex]) {
//             console.warn(`Camera not available: ${camera.label}`);
//             continue;
//           }

//           // Capture multiple images for this camera
//           for (let captureNum = 1; captureNum <= captureCount; captureNum++) {
//             await new Promise((res) => setTimeout(res, 300)); // Wait to ensure camera is ready

//             const base64Image = webcamInstance.captureZoomedImage();

//             if (!base64Image) {
//               console.warn(`Failed to capture from ${camera.label}`);
//               continue;
//             }

//             // Update the capture status
//             const videoKey = `${stageIndex}-${camIndex}`;
//             setCaptureStatus((prev) => ({
//               ...prev,
//               [videoKey]: true,
//             }));

//             const blob = dataURLtoBlob(base64Image);
//             const fileName = `${stage.stage_name}_${camera.label}_${Date.now()}.png`;

//             const formData = new FormData();
//             formData.append("comp_name", datas.comp_name);
//             formData.append("comp_id", datas.comp_id);
//             formData.append("comp_code", datas.comp_code);
//             formData.append("stage_name", stage.stage_name);
//             formData.append("stage_code", stage.stage_code);
//             formData.append("img_0", blob, fileName);
//             formData.append("img_0_label", camera.label);

//             // Show progress with image preview
//             Swal.fire({
//               title: `Capturing Image ${captureNum}/${captureCount}`,
//               html: `
//                 <div style="text-align: center;">
//                   <p style="margin-bottom: 12px; font-weight: 600;">
//                     Stage: ${stage.stage_name}<br/>
//                     Camera: ${camera.label}
//                   </p>
//                   <img src="${base64Image}" style="max-width: 100%; max-height: 300px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
//                 </div>
//               `,
//               icon: "info",
//               showConfirmButton: false,
//               allowOutsideClick: false,
//               didOpen: () => {
//                 Swal.showLoading();
//               }
//             });

//             // Upload image to server
//             try {
//               const response = await urlSocket.post("/remoteMultiCapture_sequential", formData);
//               console.log("Uploaded:", response.data);

//               if (response.data.error) {
//                 Swal.fire({
//                   title: "Error",
//                   text: response.data.error,
//                   icon: "error",
//                   confirmButtonText: "OK",
//                   confirmButtonColor: "#dc3545",
//                 });
//                 setIsCapturing(false);
//                 return;
//               }

//               // Show brief success for each image
//               await Swal.fire({
//                 title: "Image Captured",
//                 html: `
//                   <div style="text-align: center;">
//                     <p style="margin-bottom: 12px;">
//                       Image ${captureNum}/${captureCount} for ${camera.label} captured successfully.
//                     </p>
//                     <img src="${base64Image}" style="max-width: 100%; max-height: 200px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
//                   </div>
//                 `,
//                 icon: "success",
//                 timer: 1500,
//                 showConfirmButton: false,
//               });
//             } catch (error) {
//               console.error("Upload error:", error);
//               Swal.fire({
//                 title: "Upload Error",
//                 text: `Failed to upload image ${captureNum} for ${camera.label}`,
//                 icon: "error",
//                 confirmButtonText: "OK",
//                 confirmButtonColor: "#dc3545",
//               });
//               setIsCapturing(false);
//               return;
//             }
//           }

//           // Reset capture status for this camera after all captures
//           const videoKey = `${stageIndex}-${camIndex}`;
//           setCaptureStatus((prev) => ({
//             ...prev,
//             [videoKey]: false,
//           }));
//         }
//       }

//       // Final success message
//       Swal.fire({
//         title: "Success!",
//         text: `All images captured successfully! Total: ${stages.reduce((sum, stage) => sum + (stage?.camera_selection?.cameras?.length || 0), 0) * captureCount} images`,
//         icon: "success",
//         confirmButtonText: "OK",
//         confirmButtonColor: "#28a745",
//       });

//       if (selectedStage !== null) {
//         loadGalleryImages(selectedStage);
//       }
//     } catch (error) {
//       console.error("Capture error:", error);
//       Swal.fire({
//         title: "Error!",
//         text: "An error occurred while capturing images.",
//         icon: "error",
//         confirmButtonText: "Try Again",
//         confirmButtonColor: "#dc3545",
//       });
//     } finally {
//       setIsCapturing(false);
//       setCaptureStatus({});
//     }
//   };

//   const handleStageCameraSync = async () => {
//     try {
//       const res = await urlSocket.post("/sync_training_mode_result_train");
//       Swal.fire({
//         title: "Sync Complete!",
//         text: `Total Synced: ${res.data.count}`,
//         icon: "success",
//         confirmButtonColor: "#28a745"
//       });
//     } catch (err) {
//       console.error("Error:", err);
//       Swal.fire({
//         title: "Sync Failed!",
//         text: "Failed to sync training results.",
//         icon: "error",
//         confirmButtonColor: "#dc3545"
//       });
//     }
//   };

//   const back = () => history.goBack();

//   return (
//     <div className="page-content" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
//       <style>
//         {`
//           .camera-card {
//             transition: all 0.3s ease;
//             border: none;
//             box-shadow: 0 2px 8px rgba(0,0,0,0.08);
//           }
//           .camera-card:hover {
//             transform: translateY(-4px);
//             box-shadow: 0 8px 16px rgba(0,0,0,0.12);
//           }
//           .camera-card.captured {
//             border: 2px solid #28a745 !important;
//           }
//           .stage-card {
//             border: none;
//             box-shadow: 0 4px 12px rgba(0,0,0,0.1);
//             height: calc(100vh - 200px);
//             display: flex;
//             flex-direction: column;
//           }
//           .header-card {
//             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//             color: white;
//             border: none;
//             box-shadow: 0 4px 12px rgba(0,0,0,0.15);
//           }
//           .webcam-container {
//             position: relative;
//             overflow: hidden;
//             border-radius: 8px;
//             background: #000;
//           }
//           .camera-status-badge {
//             position: absolute;
//             top: 10px;
//             right: 10px;
//             z-index: 10;
//           }
//           .gallery-image {
//             width: 100%;
//             height: 180px;
//             object-fit: cover;
//             cursor: pointer;
//             transition: transform 0.2s;
//             border-radius: 8px;
//           }
//           .gallery-image:hover {
//             transform: scale(1.05);
//           }
//           .gallery-item {
//             position: relative;
//             margin-bottom: 1rem;
//             border: 2px solid transparent;
//             border-radius: 10px;
//             transition: border 0.2s;
//           }
//           .gallery-item.selected {
//             border-color: #007bff;
//           }
//           .gallery-item:hover {
//             border-color: #dee2e6;
//           }
//           .delete-btn {
//             position: absolute;
//             top: 8px;
//             right: 8px;
//             z-index: 10;
//             background: rgba(220, 53, 69, 0.9);
//             border: none;
//             border-radius: 50%;
//             width: 32px;
//             height: 32px;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             box-shadow: 0 2px 6px rgba(0,0,0,0.2);
//           }
//           .gallery-scroll {
//             flex: 1;
//             overflow-y: auto;
//             padding-right: 8px;
//           }
//           .gallery-scroll::-webkit-scrollbar {
//             width: 6px;
//           }
//           .gallery-scroll::-webkit-scrollbar-thumb {
//             background-color: rgba(0,0,0,.3);
//             border-radius: 3px;
//           }
//           .stage-tab {
//             cursor: pointer;
//             transition: all 0.3s;
//             padding: 10px 20px;
//             border-radius: 8px 8px 0 0;
//             background: #e9ecef;
//             margin-right: 5px;
//           }
//           .stage-tab.active {
//             background: white;
//             font-weight: bold;
//             box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
//           }
//           .stage-tab:hover {
//             background: #dee2e6;
//           }
//           .capture-btn-container {
//             position: sticky;
//             top: 0;
//             background: white;
//             z-index: 10;
//             padding: 1rem 0;
//             border-bottom: 1px solid #dee2e6;
//             margin-bottom: 1rem;
//           }
//           .checkbox-container {
//             position: absolute;
//             top: 8px;
//             left: 8px;
//             z-index: 10;
//             background: rgba(255, 255, 255, 0.9);
//             border-radius: 4px;
//             padding: 2px;
//           }
//         `}
//       </style>

//       <Container fluid>
//         {/* Notification Toast */}
//         {notification && (
//           <div
//             style={{
//               position: "fixed",
//               top: "20px",
//               right: "20px",
//               zIndex: 9999,
//               maxWidth: "300px"
//             }}
//           >
//             <Alert color="success" className="mb-0 shadow-lg">
//               <i className="mdi mdi-check-circle me-2"></i>
//               {notification}
//             </Alert>
//           </div>
//         )}

//         {/* Header */}
//         <Card className="header-card mb-4">
//           <CardBody className="py-3">
//             <Row className="align-items-center">
//               <Col md={4}>
//                 <h3 className="mb-0 text-white">
//                   <i className="mdi mdi-camera-burst me-2"></i>
//                   Remote Camera Gallery
//                 </h3>
//               </Col>
//               <Col md={8} className="text-end">
//                 <Button
//                   color="light"
//                   outline
//                   className="me-2"
//                   onClick={handleStageCameraSync}
//                 >
//                   <i className="mdi mdi-sync me-1"></i>
//                   Training Sync
//                 </Button>
//                 <Button
//                   color="light"
//                   onClick={back}
//                 >
//                   <i className="mdi mdi-arrow-left me-1"></i>
//                   Back
//                 </Button>
//               </Col>
//             </Row>
//           </CardBody>
//         </Card>

//         {/* Split Screen Layout - Equal Width */}
//         <Row>
//           {/* Left Side - All Camera Previews */}
//           <Col lg={6}>
//             <Card className="stage-card">
//               <CardHeader className="bg-white border-bottom pb-0">
//                 <div className="capture-btn-container">
//                   <Row className="align-items-center">
//                     <Col md={6}>
//                       <div className="d-flex align-items-center gap-2">
//                         <label className="mb-0 fw-bold" style={{ minWidth: "120px" }}>
//                           Images per Camera:
//                         </label>
//                         <Input
//                           type="number"
//                           min="1"
//                           value={captureCount}
//                           onChange={(e) => setCaptureCount(parseInt(e.target.value) || 1)}
//                           style={{ width: "100px" }}
//                           disabled={isCapturing}
//                         />
//                       </div>
//                     </Col>
//                     <Col md={6} className="text-end">
//                       <Button
//                         size="lg"
//                         color="success"
//                         className="px-4"
//                         onClick={handleAutoCaptureAll}
//                         disabled={isCapturing}
//                       >
//                         {isCapturing ? (
//                           <>
//                             <Spinner size="sm" className="me-2" />
//                             Capturing...
//                           </>
//                         ) : (
//                           <>
//                             <i className="mdi mdi-camera-burst me-2"></i>
//                             Capture All ({captureCount}x)
//                           </>
//                         )}
//                       </Button>
//                     </Col>
//                   </Row>
//                 </div>
//               </CardHeader>
//               <CardBody className="p-3 gallery-scroll">
//                 {stages.map((stage, stageIndex) => (
//                   <div key={stageIndex} className="mb-5">
//                     <Row className="align-items-center mb-3">
//                       <Col>
//                         <h5 className="mb-0 text-dark">
//                           {stage.stage_name}
//                         </h5>
//                         <small className="text-muted">
//                           Stage Code: {stage.stage_code}
//                         </small>
//                       </Col>
//                       <Col xs="auto">
//                         <Badge color="primary" pill>
//                           {(cameraDevices[stageIndex] || []).filter(d => d !== null).length}/
//                           {(stage?.camera_selection?.cameras || []).length}
//                         </Badge>
//                       </Col>
//                     </Row>
//                     <Row>
//                       {(stage?.camera_selection?.cameras || []).map((camera, camIndex) => {
//                         const videoKey = `${stageIndex}-${camIndex}`;
//                         const deviceId = (cameraDevices[stageIndex] || [])[camIndex];
//                         const hasDevice = !!deviceId;
//                         const isCaptured = captureStatus[videoKey];

//                         return (
//                           <Col md={6} key={camIndex} className="mb-3">
//                             <Card className={`camera-card ${isCaptured ? "captured" : ""}`}>
//                               <CardHeader className="bg-dark text-white d-flex justify-content-between align-items-center py-2">
//                                 <span className="fw-bold text-truncate" style={{ maxWidth: '150px' }}>
//                                   <i className="mdi mdi-camera me-1"></i>
//                                   {camera.label}
//                                 </span>
//                                 {isCaptured && (
//                                   <Badge color="success" pill>
//                                     <i className="mdi mdi-check"></i>
//                                   </Badge>
//                                 )}
//                               </CardHeader>
//                               <CardBody className="p-0">
//                                 <div className="webcam-container" style={{ height: "220px", position: "relative" }}>
//                                   {hasDevice ? (
//                                     <>
//                                       <WebcamCapture
//                                         ref={(el) => { if (el) webcamRefs.current[camera.originalLabel] = el; }}
//                                         resolution={DEFAULT_RESOLUTION}
//                                         cameraLabel={camera.originalLabel}
//                                         style={{
//                                           position: "absolute",
//                                           top: 0,
//                                           left: 0,
//                                           width: "100%",
//                                           height: "100%",
//                                           objectFit: "cover"
//                                         }}
//                                       />
//                                       <Badge color="success" pill className="camera-status-badge">
//                                         <i className="mdi mdi-circle" style={{ fontSize: "8px" }}></i> Live
//                                       </Badge>
//                                     </>
//                                   ) : (
//                                     <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
//                                       <i className="mdi mdi-camera-off" style={{ fontSize: "36px" }}></i>
//                                       <small className="mt-1">Not Available</small>
//                                     </div>
//                                   )}
//                                 </div>
//                               </CardBody>
//                             </Card>
//                           </Col>
//                         );
//                       })}
//                     </Row>
//                   </div>
//                 ))}
//               </CardBody>
//             </Card>
//           </Col>

//           {/* Right Side - Image Gallery */}
//           <Col lg={6}>
//             <div className="d-flex mb-3" style={{ borderBottom: "2px solid #e9ecef" }}>
//               {stages.map((stage, index) => (
//                 <div
//                   key={stage._id?.$oid || index}
//                   className={`stage-tab ${selectedStage === index ? "active" : ""}`}
//                   onClick={() => setSelectedStage(index)}
//                 >
//                   {stage.stage_name}
//                 </div>
//               ))}
//             </div>

//             {(() => {
//               const byCamera = {};
//               galleryImages.forEach(img => {
//                 const key = (img.camera_label || "").trim();
//                 if (!byCamera[key]) byCamera[key] = [];
//                 byCamera[key].push(img);
//               });

//               const sortedLabels = Object.keys(byCamera).sort((a, b) => a.localeCompare(b));

//               const shownImages =
//                 selectedCameraLabel && byCamera[selectedCameraLabel]
//                   ? byCamera[selectedCameraLabel]
//                   : galleryImages;

//               const allShownIds = shownImages.map(i => i.filename);
//               const allSelected = allShownIds.every(id => selectedImages.has(id));

//               return (
//                 <div
//                   style={{
//                     backgroundColor: "#fff",
//                     borderRadius: "10px",
//                     padding: "16px",
//                     boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//                     height: "calc(100vh - 200px)",
//                     display: "flex",
//                     flexDirection: "column",
//                   }}
//                 >
//                   {/* Header */}
//                   <div style={{ marginBottom: "16px" }}>
//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
//                       <h6 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#111827" }}>
//                         Image Gallery ({galleryImages.length})
//                       </h6>
//                       <Button
//                         size="sm"
//                         onClick={() => loadGalleryImages(selectedStage)}
//                         disabled={loadingGallery}
//                         style={{
//                           backgroundColor: "#6366f1",
//                           border: "none",
//                           borderRadius: "6px",
//                           padding: "4px 12px",
//                           fontSize: "12px",
//                           fontWeight: "500",
//                           color: "#fff",
//                         }}
//                       >
//                         {loadingGallery ? "Loading..." : "Refresh"}
//                       </Button>
//                     </div>

//                     {/* Selection Controls */}
//                     {selectedImages.size > 0 && (
//                       <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
//                         <Button size="sm" color="info" onClick={() => allSelected ? setSelectedImages(new Set()) : setSelectedImages(new Set(allShownIds))}>
//                           {allSelected ? "Deselect All" : "Select All"}
//                         </Button>
//                         <Button size="sm" color="danger" onClick={handleBulkDelete}>
//                           Delete ({selectedImages.size})
//                         </Button>
//                         <Button size="sm" color="secondary" onClick={() => setSelectedImages(new Set())}>
//                           Clear
//                         </Button>
//                       </div>
//                     )}
//                   </div>

//                   {/* Images Grid */}
//                   <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
//                     {loadingGallery ? (
//                       <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af" }}>
//                         <Spinner color="primary" />
//                         <p style={{ fontSize: "14px", marginTop: "12px" }}>Loading images...</p>
//                       </div>
//                     ) : shownImages.length === 0 ? (
//                       <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af" }}>
//                         <p style={{ fontSize: "14px", fontWeight: "500" }}>
//                           {selectedCameraLabel ? `No images for ${selectedCameraLabel}` : "No images captured yet"}
//                         </p>
//                       </div>
//                     ) : (
//                       <Row className="g-3">
//                         {shownImages.map(image => {
//                           const isSelected = selectedImages.has(image.filename);
//                           const isSingleHighlight = !selectedImages.size && previewImage?.filename === image.filename;

//                           return (
//                             <Col key={image.filename} xs={6} md={4}>
//                               <div
//                                 style={{
//                                   position: "relative",
//                                   borderRadius: "8px",
//                                   overflow: "hidden",
//                                   border: isSelected ? "3px solid #6366f1" : isSingleHighlight ? "3px solid #10b981" : "1px solid #e5e7eb",
//                                   cursor: "pointer",
//                                   transition: "all 0.2s ease",
//                                 }}
//                                 onClick={() => setPreviewImage(image)}
//                                 onMouseEnter={e => {
//                                   e.currentTarget.style.transform = "scale(1.05)";
//                                   e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
//                                 }}
//                                 onMouseLeave={e => {
//                                   e.currentTarget.style.transform = "scale(1)";
//                                   e.currentTarget.style.boxShadow = "none";
//                                 }}
//                               >
//                                 <img
//                                   src={`${ImageUrl}${image.insp_local_path}`}
//                                   alt={image.camera_label}
//                                   style={{ width: "100%", height: "120px", objectFit: "cover" }}
//                                   onError={e => (e.target.src = "/fallback.png")}
//                                 />

//                                 {/* Checkbox */}
//                                 <div
//                                   onClick={e => {
//                                     e.stopPropagation();
//                                     toggleImageSelection(image.filename);
//                                   }}
//                                   style={{
//                                     position: "absolute",
//                                     top: "6px",
//                                     left: "6px",
//                                     width: "20px",
//                                     height: "20px",
//                                     borderRadius: "4px",
//                                     backgroundColor: isSelected ? "#6366f1" : "rgba(255,255,255,0.85)",
//                                     border: "2px solid " + (isSelected ? "#6366f1" : "#d1d5db"),
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     cursor: "pointer",
//                                   }}
//                                 >
//                                   {isSelected && <i className="fa fa-check" style={{ color: "#fff", fontSize: "11px" }} />}
//                                 </div>

//                                 {/* Eye Button */}
//                                 <button
//                                   onClick={e => {
//                                     e.stopPropagation();
//                                     setPreviewImage(image);
//                                     setShowPreview(true);
//                                   }}
//                                   style={{
//                                     position: "absolute",
//                                     top: "6px",
//                                     left: "50%",
//                                     transform: "translateX(-50%)",
//                                     backgroundColor: "rgba(99,102,241,0.9)",
//                                     border: "none",
//                                     borderRadius: "50%",
//                                     width: "26px",
//                                     height: "26px",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     cursor: "pointer",
//                                   }}
//                                 >
//                                   <i className="fa fa-eye" style={{ color: "#fff", fontSize: "13px" }} />
//                                 </button>

//                                 {/* Delete Button */}
//                                 <button
//                                   onClick={e => {
//                                     e.stopPropagation();
//                                     handleDeleteImage(image);
//                                   }}
//                                   style={{
//                                     position: "absolute",
//                                     top: "6px",
//                                     right: "6px",
//                                     backgroundColor: "rgba(239,68,68,0.9)",
//                                     border: "none",
//                                     borderRadius: "50%",
//                                     width: "26px",
//                                     height: "26px",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     cursor: "pointer",
//                                   }}
//                                 >
//                                   <i className="fa fa-times" style={{ color: "#fff", fontSize: "13px" }} />
//                                 </button>

//                                 {/* Filename */}
//                                 <div style={{
//                                   position: "absolute",
//                                   bottom: 0,
//                                   left: 0,
//                                   right: 0,
//                                   background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
//                                   padding: "6px 6px 3px",
//                                 }}>
//                                   <p style={{
//                                     margin: 0,
//                                     fontSize: "10px",
//                                     fontWeight: "600",
//                                     color: "#fff",
//                                     textOverflow: "ellipsis",
//                                     overflow: "hidden",
//                                     whiteSpace: "nowrap",
//                                   }}>
//                                     {image.filename}
//                                   </p>
//                                 </div>
//                               </div>
//                             </Col>
//                           );
//                         })}
//                       </Row>
//                     )}
//                   </div>

//                   {/* Single image details */}
//                   {previewImage && selectedImages.size === 0 && (
//                     <div style={{
//                       marginTop: "16px",
//                       padding: "10px",
//                       backgroundColor: "#f9fafb",
//                       borderRadius: "8px",
//                       border: "1px solid #e5e7eb",
//                       fontSize: "12px"
//                     }}>
//                       <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
//                         <strong>{previewImage.camera_label}</strong>
//                         <button onClick={() => setPreviewImage(null)} style={{ background: "none", border: "none", fontSize: "16px" }}>×</button>
//                       </div>
//                       <div style={{ color: "#6b7280" }}>
//                         <div><strong>File:</strong> {previewImage.filename}</div>
//                         <div><strong>Time:</strong> {new Date(previewImage.timestamp).toLocaleString()}</div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })()}
//           </Col>
//         </Row>
//       </Container>

//       {/* Image Preview Modal */}
//       <Modal isOpen={showPreview} toggle={() => setShowPreview(false)} size="lg">
//         <ModalHeader toggle={() => setShowPreview(false)}>
//           {previewImage?.camera_label}
//         </ModalHeader>
//         <ModalBody className="text-center">
//           {previewImage && (
//             <>
//               <img
//                 src={`${ImageUrl}${previewImage.insp_local_path}`}
//                 alt={previewImage.camera_label}
//                 style={{ maxWidth: "100%", maxHeight: "70vh" }}
//               />
//               <div className="mt-3 text-start">
//                 <p><strong>Filename:</strong> {previewImage.filename}</p>
//                 <p><strong>Camera:</strong> {previewImage.camera_label}</p>
//                 <p><strong>Timestamp:</strong> {new Date(previewImage.timestamp).toLocaleString()}</p>
//                 <p><strong>Dimensions:</strong> {previewImage.width} x {previewImage.height}</p>
//               </div>
//             </>
//           )}
//         </ModalBody>
//       </Modal>
//     </div>
//   );
// };

// export default RemoteStg;


// import React, { useEffect, useRef, useState } from "react";
// import Webcam from "react-webcam";
// import WebcamCapture from "pages/WebcamCustom/WebcamCapture";
// import { useLocation, useHistory } from "react-router-dom";
// import urlSocket from "./urlSocket";
// import ImageUrl from "./imageUrl";

// import {
//   Container,
//   Button,
//   Col,
//   Row,
//   Card,
//   CardBody,
//   CardHeader,
//   Badge,
//   Spinner,
//   Alert,
//   Modal,
//   ModalHeader,
//   ModalBody,
//   Input
// } from "reactstrap";
// import Swal from "sweetalert2";
// import { DEFAULT_RESOLUTION } from "./cameraConfig";

// const RemoteStg = () => {
//   const location = useLocation();
//   const history = useHistory();
//   const { datas } = location.state || {};

//   const stages = datas?.stages || [];

//   const [cameraDevices, setCameraDevices] = useState({});
//   const webcamRefs = useRef([]);
//   const [isCapturing, setIsCapturing] = useState(false);
//   const [captureStatus, setCaptureStatus] = useState({});
//   const [notification, setNotification] = useState("");
//   const [selectedCameraLabel, setSelectedCameraLabel] = useState(null);

//   // NEW: Capture count state
//   const [captureCount, setCaptureCount] = useState(5);

//   // Gallery states
//   const [galleryImages, setGalleryImages] = useState([]);
//   const [loadingGallery, setLoadingGallery] = useState(false);
//   const [selectedStage, setSelectedStage] = useState(null);
//   const [previewImage, setPreviewImage] = useState(null);
//   const [showPreview, setShowPreview] = useState(false);

//   // Selection state
//   const [selectedImages, setSelectedImages] = useState(new Set());
//   const [selectAll, setSelectAll] = useState(false);

//   // Capture preview state
//   const [currentCapturePreview, setCurrentCapturePreview] = useState(null);

//   // Setup camera device IDs
//   useEffect(() => {
//     async function setupCameraDevices() {
//       try {
//         await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
//         const devices = await navigator.mediaDevices.enumerateDevices();

//         const deviceMap = {};

//         for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
//           const stage = stages[stageIndex];
//           const cameras = stage?.camera_selection?.cameras || [];
//           deviceMap[stageIndex] = [];

//           for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
//             const cam = cameras[camIndex];
//             const videoDevice = devices.find((d) => {
//               if (d.kind !== "videoinput") return false;
//               const label = d.label?.toLowerCase() || "";
//               const origLabel = cam.originalLabel?.toLowerCase() || "";
//               const vid = cam.v_id?.toLowerCase() || "";
//               const pid = cam.p_id?.toLowerCase() || "";
//               return (
//                 label.includes(origLabel) ||
//                 label.includes(vid) ||
//                 label.includes(pid)
//               );
//             });

//             if (!videoDevice) {
//               console.warn(`Warning: No matching device for ${cam.label}`);
//               deviceMap[stageIndex].push(null);
//             } else {
//               deviceMap[stageIndex].push(videoDevice.deviceId);
//             }
//           }
//         }

//         setCameraDevices(deviceMap);
//       } catch (error) {
//         console.error("Camera setup failed:", error);
//       }
//     }

//     setupCameraDevices();
//   }, [stages]);

//   // Load gallery images when stage is selected
//   useEffect(() => {
//     if (selectedStage !== null) {
//       loadGalleryImages(selectedStage);
//     }
//   }, [selectedStage]);

//   // Set first stage as default
//   useEffect(() => {
//     if (stages.length > 0) {
//       setSelectedStage(0);
//     }
//   }, [stages]);

//   // Sync selectAll with actual selection
//   useEffect(() => {
//     if (galleryImages.length > 0) {
//       const allSelected = galleryImages.every(img => selectedImages.has(img.filename));
//       setSelectAll(allSelected);
//     } else {
//       setSelectAll(false);
//     }
//   }, [selectedImages, galleryImages]);

//   const loadGalleryImages = async (stageIndex) => {
//     setLoadingGallery(true);
//     setSelectedImages(new Set());
//     try {
//       const stage = stages[stageIndex];
//       const response = await urlSocket.post("/get_training_images", {
//         comp_code: datas.comp_code,
//         stage_code: stage.stage_code
//       });

//       setGalleryImages(response.data.images || []);
//     } catch (error) {
//       console.error("Failed to load gallery images:", error);
//       setGalleryImages([]);
//     } finally {
//       setLoadingGallery(false);
//     }
//   };

//   const handleDeleteImage = async (image) => {
//     const result = await Swal.fire({
//       title: "Delete Image?",
//       text: "This action cannot be undone",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#dc3545",
//       cancelButtonColor: "#6c757d",
//       confirmButtonText: "Yes, delete it!"
//     });

//     if (result.isConfirmed) {
//       try {
//         const response = await urlSocket.post("/delete_training_image", {
//           filename: image.filename,
//           camera_label: image.camera_label
//         });

//         if (response.data.success) {
//           Swal.fire("Deleted!", "Image has been deleted.", "success");
//           loadGalleryImages(selectedStage);
//         } else {
//           Swal.fire("Error!", "Failed to delete image", "error");
//         }
//       } catch (error) {
//         console.error("Delete error:", error);
//         Swal.fire("Error!", "Failed to delete image", "error");
//       }
//     }
//   };

//   const handleBulkDelete = async () => {
//     if (selectedImages.size === 0) {
//       Swal.fire("No Selection", "Please select at least one image to delete.", "info");
//       return;
//     }

//     const result = await Swal.fire({
//       title: `Delete ${selectedImages.size} Image(s)?`,
//       text: "This action cannot be undone",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#dc3545",
//       cancelButtonColor: "#6c757d",
//       confirmButtonText: "Yes, delete all!"
//     });

//     if (result.isConfirmed) {
//       try {
//         const deletePromises = Array.from(selectedImages).map(filename => {
//           const image = galleryImages.find(img => img.filename === filename);
//           return urlSocket.post("/delete_training_image", {
//             filename,
//             camera_label: image.camera_label
//           });
//         });

//         const responses = await Promise.all(deletePromises);
//         const allSuccess = responses.every(r => r.data.success);

//         if (allSuccess) {
//           Swal.fire("Deleted!", `${selectedImages.size} images deleted.`, "success");
//           loadGalleryImages(selectedStage);
//         } else {
//           Swal.fire("Partial Success", "Some images failed to delete.", "warning");
//         }
//       } catch (error) {
//         console.error("Bulk delete error:", error);
//         Swal.fire("Error!", "Failed to delete selected images.", "error");
//       }
//     }
//   };

//   const toggleImageSelection = (filename) => {
//     const newSelected = new Set(selectedImages);
//     if (newSelected.has(filename)) {
//       newSelected.delete(filename);
//     } else {
//       newSelected.add(filename);
//     }
//     setSelectedImages(newSelected);
//   };

//   const toggleSelectAll = () => {
//     if (selectAll) {
//       setSelectedImages(new Set());
//     } else {
//       const allFilenames = galleryImages.map(img => img.filename);
//       setSelectedImages(new Set(allFilenames));
//     }
//   };

//   const showNotification = (message) => {
//     setNotification(message);
//     setTimeout(() => setNotification(""), 3000);
//   };

//   const dataURLtoBlob = (dataURL) => {
//     const arr = dataURL.split(",");
//     const mime = arr[0].match(/:(.*?);/)[1];
//     const bstr = atob(arr[1]);
//     let n = bstr.length;
//     const u8arr = new Uint8Array(n);
//     while (n--) u8arr[n] = bstr.charCodeAt(n);
//     return new Blob([u8arr], { type: mime });
//   };

//   // NEW: Sequential capture with count and image preview
//   const handleAutoCaptureAll = async () => {
//     if (isCapturing) return;

//     // Validate capture count
//     if (!captureCount || captureCount < 1) {
//       Swal.fire("Invalid Count", "Please enter a valid capture count (minimum 1)", "warning");
//       return;
//     }

//     setIsCapturing(true);
//     setCaptureStatus({});
//     setCurrentCapturePreview(null);

//     try {
//       // Loop through each stage
//       for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
//         const stage = stages[stageIndex];
//         const cameras = stage?.camera_selection?.cameras || [];
//         const devices = cameraDevices[stageIndex] || [];

//         // Loop through each camera in the stage
//         for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
//           const camera = cameras[camIndex];
//           const webcamInstance = webcamRefs.current[camera.originalLabel];

//           if (!webcamInstance || !devices[camIndex]) {
//             console.warn(`Camera not available: ${camera.label}`);
//             continue;
//           }

//           // Capture multiple images for this camera
//           for (let captureNum = 1; captureNum <= captureCount; captureNum++) {
//             await new Promise((res) => setTimeout(res, 300)); // Wait to ensure camera is ready

//             const base64Image = webcamInstance.captureZoomedImage();

//             if (!base64Image) {
//               console.warn(`Failed to capture from ${camera.label}`);
//               continue;
//             }

//             // Update the capture status and preview
//             const videoKey = `${stageIndex}-${camIndex}`;
//             setCaptureStatus((prev) => ({
//               ...prev,
//               [videoKey]: true,
//             }));

//             // Show captured image preview
//             setCurrentCapturePreview({
//               image: base64Image,
//               captureNum,
//               totalCaptures: captureCount,
//               stageName: stage.stage_name,
//               cameraLabel: camera.label,
//               status: 'uploading'
//             });

//             const blob = dataURLtoBlob(base64Image);
//             const fileName = `${stage.stage_name}_${camera.label}_${Date.now()}.png`;

//             const formData = new FormData();
//             formData.append("comp_name", datas.comp_name);
//             formData.append("comp_id", datas.comp_id);
//             formData.append("comp_code", datas.comp_code);
//             formData.append("stage_name", stage.stage_name);
//             formData.append("stage_code", stage.stage_code);
//             formData.append("img_0", blob, fileName);
//             formData.append("img_0_label", camera.label);

//             // Upload image to server
//             try {
//               const response = await urlSocket.post("/remoteMultiCapture_sequential", formData);
//               console.log("Uploaded:", response.data);

//               if (response.data.error) {
//                 setCurrentCapturePreview(null);
//                 Swal.fire({
//                   title: "Error",
//                   text: response.data.error,
//                   icon: "error",
//                   confirmButtonText: "OK",
//                   confirmButtonColor: "#dc3545",
//                 });
//                 setIsCapturing(false);
//                 return;
//               }

//               // Update status to success
//               setCurrentCapturePreview(prev => ({ ...prev, status: 'success' }));
//               await new Promise(res => setTimeout(res, 500)); // Show success briefly

//             } catch (error) {
//               console.error("Upload error:", error);
//               setCurrentCapturePreview(null);
//               Swal.fire({
//                 title: "Upload Error",
//                 text: `Failed to upload image ${captureNum} for ${camera.label}`,
//                 icon: "error",
//                 confirmButtonText: "OK",
//                 confirmButtonColor: "#dc3545",
//               });
//               setIsCapturing(false);
//               return;
//             }
//           }

//           // Reset capture status for this camera after all captures
//           const videoKey = `${stageIndex}-${camIndex}`;
//           setCaptureStatus((prev) => ({
//             ...prev,
//             [videoKey]: false,
//           }));
//         }
//       }

//       // Final success message
//       setCurrentCapturePreview(null);
//       showNotification(`All images captured successfully! Total: ${stages.reduce((sum, stage) => sum + (stage?.camera_selection?.cameras?.length || 0), 0) * captureCount} images`);

//       if (selectedStage !== null) {
//         loadGalleryImages(selectedStage);
//       }
//     } catch (error) {
//       console.error("Capture error:", error);
//       setCurrentCapturePreview(null);
//       Swal.fire({
//         title: "Error!",
//         text: "An error occurred while capturing images.",
//         icon: "error",
//         confirmButtonText: "Try Again",
//         confirmButtonColor: "#dc3545",
//       });
//     } finally {
//       setIsCapturing(false);
//       setCaptureStatus({});
//     }
//   };

//   const handleStageCameraSync = async () => {
//     try {
//       const res = await urlSocket.post("/sync_training_mode_result_train");
//       Swal.fire({
//         title: "Sync Complete!",
//         text: `Total Synced: ${res.data.count}`,
//         icon: "success",
//         confirmButtonColor: "#28a745"
//       });
//     } catch (err) {
//       console.error("Error:", err);
//       Swal.fire({
//         title: "Sync Failed!",
//         text: "Failed to sync training results.",
//         icon: "error",
//         confirmButtonColor: "#dc3545"
//       });
//     }
//   };

//   const back = () => history.goBack();

//   return (
//     <div className="page-content" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
//       <style>
//         {`
//           .camera-card {
//             transition: all 0.3s ease;
//             border: none;
//             box-shadow: 0 2px 8px rgba(0,0,0,0.08);
//           }
//           .camera-card:hover {
//             transform: translateY(-4px);
//             box-shadow: 0 8px 16px rgba(0,0,0,0.12);
//           }
//           .camera-card.captured {
//             border: 2px solid #28a745 !important;
//           }
//           .stage-card {
//             border: none;
//             box-shadow: 0 4px 12px rgba(0,0,0,0.1);
//             height: calc(100vh - 200px);
//             display: flex;
//             flex-direction: column;
//           }
//           .header-card {
//             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//             color: white;
//             border: none;
//             box-shadow: 0 4px 12px rgba(0,0,0,0.15);
//           }
//           .webcam-container {
//             position: relative;
//             overflow: hidden;
//             border-radius: 8px;
//             background: #000;
//           }
//           .camera-status-badge {
//             position: absolute;
//             top: 10px;
//             right: 10px;
//             z-index: 10;
//           }
//           .gallery-image {
//             width: 100%;
//             height: 180px;
//             object-fit: cover;
//             cursor: pointer;
//             transition: transform 0.2s;
//             border-radius: 8px;
//           }
//           .gallery-image:hover {
//             transform: scale(1.05);
//           }
//           .gallery-item {
//             position: relative;
//             margin-bottom: 1rem;
//             border: 2px solid transparent;
//             border-radius: 10px;
//             transition: border 0.2s;
//           }
//           .gallery-item.selected {
//             border-color: #007bff;
//           }
//           .gallery-item:hover {
//             border-color: #dee2e6;
//           }
//           .delete-btn {
//             position: absolute;
//             top: 8px;
//             right: 8px;
//             z-index: 10;
//             background: rgba(220, 53, 69, 0.9);
//             border: none;
//             border-radius: 50%;
//             width: 32px;
//             height: 32px;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             box-shadow: 0 2px 6px rgba(0,0,0,0.2);
//           }
//           .gallery-scroll {
//             flex: 1;
//             overflow-y: auto;
//             padding-right: 8px;
//           }
//           .gallery-scroll::-webkit-scrollbar {
//             width: 6px;
//           }
//           .gallery-scroll::-webkit-scrollbar-thumb {
//             background-color: rgba(0,0,0,.3);
//             border-radius: 3px;
//           }
//           .stage-tab {
//             cursor: pointer;
//             transition: all 0.3s;
//             padding: 10px 20px;
//             border-radius: 8px 8px 0 0;
//             background: #e9ecef;
//             margin-right: 5px;
//           }
//           .stage-tab.active {
//             background: white;
//             font-weight: bold;
//             box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
//           }
//           .stage-tab:hover {
//             background: #dee2e6;
//           }
//           .capture-btn-container {
//             position: sticky;
//             top: 0;
//             background: white;
//             z-index: 10;
//             padding: 1rem 0;
//             border-bottom: 1px solid #dee2e6;
//             margin-bottom: 1rem;
//           }
//           .checkbox-container {
//             position: absolute;
//             top: 8px;
//             left: 8px;
//             z-index: 10;
//             background: rgba(255, 255, 255, 0.9);
//             border-radius: 4px;
//             padding: 2px;
//           }
//         `}
//       </style>

//       <Container fluid>
//         {/* Notification Toast */}
//         {notification && (
//           <div
//             style={{
//               position: "fixed",
//               top: "20px",
//               right: "20px",
//               zIndex: 9999,
//               maxWidth: "300px"
//             }}
//           >
//             <Alert color="success" className="mb-0 shadow-lg">
//               <i className="mdi mdi-check-circle me-2"></i>
//               {notification}
//             </Alert>
//           </div>
//         )}



//         {/* Header */}
//         <Card className="header-card mb-4">
//           <CardBody className="py-3">
//             <Row className="align-items-center">
//               <Col md={4}>
//                 <h3 className="mb-0 text-white">
//                   <i className="mdi mdi-camera-burst me-2"></i>
//                   Remote Camera Gallery
//                 </h3>
//               </Col>
//               <Col md={8} className="text-end">
//                 <Button
//                   color="light"
//                   outline
//                   className="me-2"
//                   onClick={handleStageCameraSync}
//                 >
//                   <i className="mdi mdi-sync me-1"></i>
//                   Training Sync
//                 </Button>
//                 <Button
//                   color="light"
//                   onClick={back}
//                 >
//                   <i className="mdi mdi-arrow-left me-1"></i>
//                   Back
//                 </Button>
//               </Col>
//             </Row>
//           </CardBody>
//         </Card>

//         <Row>
//           <Col lg={6}>
//             <Card className="stage-card">
//               <CardHeader className="bg-white border-bottom pb-0">
//                 <div className="capture-btn-container">
//                   <Row className="align-items-center">
//                     <Col md={6}>
//                       <div className="d-flex align-items-center gap-2">
//                         <label className="mb-0 fw-bold" style={{ minWidth: "120px" }}>
//                           Images per Camera:
//                         </label>
//                         <Input
//                           type="number"
//                           min="1"
//                           value={captureCount}
//                           onChange={(e) => setCaptureCount(parseInt(datas.capture_count) || 1)}
//                           style={{ width: "100px" }}
//                           disabled={isCapturing}
//                         />
//                       </div>
//                     </Col>
//                     <Col md={6} className="text-end">
//                       <Button
//                         size="lg"
//                         color="success"
//                         className="px-4"
//                         onClick={handleAutoCaptureAll}
//                         disabled={isCapturing}
//                       >
//                         {isCapturing ? (
//                           <>
//                             <Spinner size="sm" className="me-2" />
//                             Capturing...
//                           </>
//                         ) : (
//                           <>
//                             <i className="mdi mdi-camera-burst me-2"></i>
//                             Capture All ({captureCount}x)
//                           </>
//                         )}
//                       </Button>
//                     </Col>
//                   </Row>
//                 </div>
//               </CardHeader>
//               <CardBody className="p-3 gallery-scroll">
//                 {stages.map((stage, stageIndex) => (
//                   <div key={stageIndex} className="mb-5">
//                     <Row className="align-items-center mb-3">
//                       <Col>
//                         <h5 className="mb-0 text-dark">
//                           {stage.stage_name}
//                         </h5>
//                         <small className="text-muted">
//                           Stage Code: {stage.stage_code}
//                         </small>
//                       </Col>
//                       <Col xs="auto">
//                         <Badge color="primary" pill>
//                           {(cameraDevices[stageIndex] || []).filter(d => d !== null).length}/
//                           {(stage?.camera_selection?.cameras || []).length}
//                         </Badge>
//                       </Col>
//                     </Row>
//                     <Row>
//                       {(stage?.camera_selection?.cameras || []).map((camera, camIndex) => {
//                         const videoKey = `${stageIndex}-${camIndex}`;
//                         const deviceId = (cameraDevices[stageIndex] || [])[camIndex];
//                         const hasDevice = !!deviceId;
//                         const isCaptured = captureStatus[videoKey];

//                         return (
//                           <Col md={6} key={camIndex} className="mb-3">
//                             <Card className={`camera-card ${isCaptured ? "captured" : ""}`}>
//                               <CardHeader className="bg-dark text-white d-flex justify-content-between align-items-center py-2">
//                                 <span className="fw-bold text-truncate" style={{ maxWidth: '150px' }}>
//                                   <i className="mdi mdi-camera me-1"></i>
//                                   {camera.label}
//                                 </span>
//                                 {isCaptured && (
//                                   <Badge color="success" pill>
//                                     <i className="mdi mdi-check"></i>
//                                   </Badge>
//                                 )}
//                               </CardHeader>
//                               <CardBody className="p-0">
//                                 <div className="webcam-container" style={{ height: "220px", position: "relative" }}>
//                                   {hasDevice ? (
//                                     <>
//                                       <WebcamCapture
//                                         ref={(el) => { if (el) webcamRefs.current[camera.originalLabel] = el; }}
//                                         resolution={DEFAULT_RESOLUTION}
//                                         cameraLabel={camera.originalLabel}
//                                         style={{
//                                           position: "absolute",
//                                           top: 0,
//                                           left: 0,
//                                           width: "100%",
//                                           height: "100%",
//                                           objectFit: "cover"
//                                         }}
//                                       />
//                                       <Badge color="success" pill className="camera-status-badge">
//                                         <i className="mdi mdi-circle" style={{ fontSize: "8px" }}></i> Live
//                                       </Badge>

//                                       {/* Show capture progress on camera feed */}
//                                       {currentCapturePreview &&
//                                         currentCapturePreview.cameraLabel === camera.label && (
//                                           <div
//                                             style={{
//                                               position: "absolute",
//                                               bottom: "10px",
//                                               left: "50%",
//                                               transform: "translateX(-50%)",
//                                               backgroundColor: "rgba(99, 102, 241, 0.95)",
//                                               color: "white",
//                                               padding: "8px 16px",
//                                               borderRadius: "20px",
//                                               fontWeight: "700",
//                                               fontSize: "14px",
//                                               boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
//                                               zIndex: 20,
//                                               display: "flex",
//                                               alignItems: "center",
//                                               gap: "8px"
//                                             }}
//                                           >
//                                             {currentCapturePreview.status === 'uploading' ? (
//                                               <>
//                                                 <Spinner size="sm" style={{ width: "16px", height: "16px" }} />
//                                                 <span>{currentCapturePreview.captureNum}/{currentCapturePreview.totalCaptures}</span>
//                                               </>
//                                             ) : (
//                                               <>
//                                                 <i className="mdi mdi-check-circle"></i>
//                                                 <span>{currentCapturePreview.captureNum}/{currentCapturePreview.totalCaptures}</span>
//                                               </>
//                                             )}
//                                           </div>
//                                         )}
//                                     </>
//                                   ) : (
//                                     <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
//                                       <i className="mdi mdi-camera-off" style={{ fontSize: "36px" }}></i>
//                                       <small className="mt-1">Not Available</small>
//                                     </div>
//                                   )}
//                                 </div>
//                               </CardBody>
//                             </Card>
//                           </Col>
//                         );
//                       })}
//                     </Row>
//                   </div>
//                 ))}
//               </CardBody>
//             </Card>
//           </Col>

//           {/* Right Side - Image Gallery */}
//           <Col lg={6}>
//             <div className="d-flex mb-3" style={{ borderBottom: "2px solid #e9ecef" }}>
//               {stages.map((stage, index) => (
//                 <div
//                   key={stage._id?.$oid || index}
//                   className={`stage-tab ${selectedStage === index ? "active" : ""}`}
//                   onClick={() => setSelectedStage(index)}
//                 >
//                   {stage.stage_name}
//                 </div>
//               ))}
//             </div>

//             {(() => {
//               const byCamera = {};
//               galleryImages.forEach(img => {
//                 const key = (img.camera_label || "").trim();
//                 if (!byCamera[key]) byCamera[key] = [];
//                 byCamera[key].push(img);
//               });

//               const sortedLabels = Object.keys(byCamera).sort((a, b) => a.localeCompare(b));

//               const shownImages =
//                 selectedCameraLabel && byCamera[selectedCameraLabel]
//                   ? byCamera[selectedCameraLabel]
//                   : galleryImages;

//               const allShownIds = shownImages.map(i => i.filename);
//               const allSelected = allShownIds.every(id => selectedImages.has(id));

//               return (
//                 <div
//                   style={{
//                     backgroundColor: "#fff",
//                     borderRadius: "10px",
//                     padding: "16px",
//                     boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//                     height: "calc(100vh - 200px)",
//                     display: "flex",
//                     flexDirection: "column",
//                   }}
//                 >
//                   {/* Header */}
//                   <div style={{ marginBottom: "16px" }}>
//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
//                       <h6 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#111827" }}>
//                         Image Gallery ({galleryImages.length})
//                       </h6>
//                       <Button
//                         size="sm"
//                         onClick={() => loadGalleryImages(selectedStage)}
//                         disabled={loadingGallery}
//                         style={{
//                           backgroundColor: "#6366f1",
//                           border: "none",
//                           borderRadius: "6px",
//                           padding: "4px 12px",
//                           fontSize: "12px",
//                           fontWeight: "500",
//                           color: "#fff",
//                         }}
//                       >
//                         {loadingGallery ? "Loading..." : "Refresh"}
//                       </Button>
//                     </div>

//                     {/* Selection Controls */}
//                     {selectedImages.size > 0 && (
//                       <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
//                         <Button size="sm" color="info" onClick={() => allSelected ? setSelectedImages(new Set()) : setSelectedImages(new Set(allShownIds))}>
//                           {allSelected ? "Deselect All" : "Select All"}
//                         </Button>
//                         <Button size="sm" color="danger" onClick={handleBulkDelete}>
//                           Delete ({selectedImages.size})
//                         </Button>
//                         <Button size="sm" color="secondary" onClick={() => setSelectedImages(new Set())}>
//                           Clear
//                         </Button>
//                       </div>
//                     )}
//                   </div>

//                   {/* Images Grid */}
//                   <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
//                     {loadingGallery ? (
//                       <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af" }}>
//                         <Spinner color="primary" />
//                         <p style={{ fontSize: "14px", marginTop: "12px" }}>Loading images...</p>
//                       </div>
//                     ) : shownImages.length === 0 ? (
//                       <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af" }}>
//                         <p style={{ fontSize: "14px", fontWeight: "500" }}>
//                           {selectedCameraLabel ? `No images for ${selectedCameraLabel}` : "No images captured yet"}
//                         </p>
//                       </div>
//                     ) : (
//                       <Row className="g-3">
//                         {shownImages.map(image => {
//                           const isSelected = selectedImages.has(image.filename);
//                           const isSingleHighlight = !selectedImages.size && previewImage?.filename === image.filename;

//                           return (
//                             <Col key={image.filename} xs={6} md={4}>
//                               <div
//                                 style={{
//                                   position: "relative",
//                                   borderRadius: "8px",
//                                   overflow: "hidden",
//                                   border: isSelected ? "3px solid #6366f1" : isSingleHighlight ? "3px solid #10b981" : "1px solid #e5e7eb",
//                                   cursor: "pointer",
//                                   transition: "all 0.2s ease",
//                                 }}
//                                 onClick={() => setPreviewImage(image)}
//                                 onMouseEnter={e => {
//                                   e.currentTarget.style.transform = "scale(1.05)";
//                                   e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
//                                 }}
//                                 onMouseLeave={e => {
//                                   e.currentTarget.style.transform = "scale(1)";
//                                   e.currentTarget.style.boxShadow = "none";
//                                 }}
//                               >
//                                 <img
//                                   src={`${ImageUrl}${image.insp_local_path}`}
//                                   alt={image.camera_label}
//                                   style={{ width: "100%", height: "120px", objectFit: "cover" }}
//                                   onError={e => (e.target.src = "/fallback.png")}
//                                 />

//                                 {/* Checkbox */}
//                                 <div
//                                   onClick={e => {
//                                     e.stopPropagation();
//                                     toggleImageSelection(image.filename);
//                                   }}
//                                   style={{
//                                     position: "absolute",
//                                     top: "6px",
//                                     left: "6px",
//                                     width: "20px",
//                                     height: "20px",
//                                     borderRadius: "4px",
//                                     backgroundColor: isSelected ? "#6366f1" : "rgba(255,255,255,0.85)",
//                                     border: "2px solid " + (isSelected ? "#6366f1" : "#d1d5db"),
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     cursor: "pointer",
//                                   }}
//                                 >
//                                   {isSelected && <i className="fa fa-check" style={{ color: "#fff", fontSize: "11px" }} />}
//                                 </div>

//                                 {/* Eye Button */}
//                                 <button
//                                   onClick={e => {
//                                     e.stopPropagation();
//                                     setPreviewImage(image);
//                                     setShowPreview(true);
//                                   }}
//                                   style={{
//                                     position: "absolute",
//                                     top: "6px",
//                                     left: "50%",
//                                     transform: "translateX(-50%)",
//                                     backgroundColor: "rgba(99,102,241,0.9)",
//                                     border: "none",
//                                     borderRadius: "50%",
//                                     width: "26px",
//                                     height: "26px",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     cursor: "pointer",
//                                   }}
//                                 >
//                                   <i className="fa fa-eye" style={{ color: "#fff", fontSize: "13px" }} />
//                                 </button>

//                                 {/* Delete Button */}
//                                 <button
//                                   onClick={e => {
//                                     e.stopPropagation();
//                                     handleDeleteImage(image);
//                                   }}
//                                   style={{
//                                     position: "absolute",
//                                     top: "6px",
//                                     right: "6px",
//                                     backgroundColor: "rgba(239,68,68,0.9)",
//                                     border: "none",
//                                     borderRadius: "50%",
//                                     width: "26px",
//                                     height: "26px",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     cursor: "pointer",
//                                   }}
//                                 >
//                                   <i className="fa fa-times" style={{ color: "#fff", fontSize: "13px" }} />
//                                 </button>

//                                 {/* Filename */}
//                                 <div style={{
//                                   position: "absolute",
//                                   bottom: 0,
//                                   left: 0,
//                                   right: 0,
//                                   background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
//                                   padding: "6px 6px 3px",
//                                 }}>
//                                   <p style={{
//                                     margin: 0,
//                                     fontSize: "10px",
//                                     fontWeight: "600",
//                                     color: "#fff",
//                                     textOverflow: "ellipsis",
//                                     overflow: "hidden",
//                                     whiteSpace: "nowrap",
//                                   }}>
//                                     {image.filename}
//                                   </p>
//                                 </div>
//                               </div>
//                             </Col>
//                           );
//                         })}
//                       </Row>
//                     )}
//                   </div>

//                   {/* Single image details */}
//                   {previewImage && selectedImages.size === 0 && (
//                     <div style={{
//                       marginTop: "16px",
//                       padding: "10px",
//                       backgroundColor: "#f9fafb",
//                       borderRadius: "8px",
//                       border: "1px solid #e5e7eb",
//                       fontSize: "12px"
//                     }}>
//                       <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
//                         <strong>{previewImage.camera_label}</strong>
//                         <button onClick={() => setPreviewImage(null)} style={{ background: "none", border: "none", fontSize: "16px" }}>×</button>
//                       </div>
//                       <div style={{ color: "#6b7280" }}>
//                         <div><strong>File:</strong> {previewImage.filename}</div>
//                         <div><strong>Time:</strong> {new Date(previewImage.timestamp).toLocaleString()}</div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })()}
//           </Col>
//         </Row>
//       </Container >

//       {/* Image Preview Modal */}
//       < Modal isOpen={showPreview} toggle={() => setShowPreview(false)} size="lg" >
//         <ModalHeader toggle={() => setShowPreview(false)}>
//           {previewImage?.camera_label}
//         </ModalHeader>
//         <ModalBody className="text-center">
//           {previewImage && (
//             <>
//               <img
//                 src={`${ImageUrl}${previewImage.insp_local_path}`}
//                 alt={previewImage.camera_label}
//                 style={{ maxWidth: "100%", maxHeight: "70vh" }}
//               />
//               <div className="mt-3 text-start">
//                 <p><strong>Filename:</strong> {previewImage.filename}</p>
//                 <p><strong>Camera:</strong> {previewImage.camera_label}</p>
//                 <p><strong>Timestamp:</strong> {new Date(previewImage.timestamp).toLocaleString()}</p>
//                 <p><strong>Dimensions:</strong> {previewImage.width} x {previewImage.height}</p>
//               </div>
//             </>
//           )}
//         </ModalBody>
//       </Modal >
//     </div >
//   );
// };

// export default RemoteStg;


// import React, { useEffect, useRef, useState } from "react";
// import Webcam from "react-webcam";
// import WebcamCapture from "pages/WebcamCustom/WebcamCapture";
// import { useLocation, useHistory } from "react-router-dom";
// import urlSocket from "./urlSocket";
// import ImageUrl from "./imageUrl";

// import {
//   Container,
//   Button,
//   Col,
//   Row,
//   Card,
//   CardBody,
//   CardHeader,
//   Badge,
//   Spinner,
//   Alert,
//   Modal,
//   ModalHeader,
//   ModalBody,
//   Input
// } from "reactstrap";
// import Swal from "sweetalert2";
// import { DEFAULT_RESOLUTION } from "./cameraConfig";

// const RemoteStg = () => {
//   const location = useLocation();
//   const history = useHistory();
//   const { datas } = location.state || {};

//   const stages = datas?.stages || [];

//   const [cameraDevices, setCameraDevices] = useState({});
//   const webcamRefs = useRef([]);
//   const [isCapturing, setIsCapturing] = useState(false);
//   const [captureStatus, setCaptureStatus] = useState({});
//   const [notification, setNotification] = useState("");
//   const [selectedCameraLabel, setSelectedCameraLabel] = useState(null);

//   // Capture count state - get from datas
//   const [captureCount, setCaptureCount] = useState(parseInt(datas?.capture_count) || 5);

//   // Gallery states
//   const [galleryImages, setGalleryImages] = useState([]);
//   const [loadingGallery, setLoadingGallery] = useState(false);
//   const [selectedStage, setSelectedStage] = useState(null);
//   const [previewImage, setPreviewImage] = useState(null);
//   const [showPreview, setShowPreview] = useState(false);

//   // Selection state
//   const [selectedImages, setSelectedImages] = useState(new Set());
//   const [selectAll, setSelectAll] = useState(false);

//   // Capture preview state - track stage and camera index
//   const [currentCapturePreview, setCurrentCapturePreview] = useState(null);

//   // Setup camera device IDs
//   useEffect(() => {
//     async function setupCameraDevices() {
//       try {
//         await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
//         const devices = await navigator.mediaDevices.enumerateDevices();

//         const deviceMap = {};

//         for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
//           const stage = stages[stageIndex];
//           const cameras = stage?.camera_selection?.cameras || [];
//           deviceMap[stageIndex] = [];

//           for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
//             const cam = cameras[camIndex];
//             const videoDevice = devices.find((d) => {
//               if (d.kind !== "videoinput") return false;
//               const label = d.label?.toLowerCase() || "";
//               const origLabel = cam.originalLabel?.toLowerCase() || "";
//               const vid = cam.v_id?.toLowerCase() || "";
//               const pid = cam.p_id?.toLowerCase() || "";
//               return (
//                 label.includes(origLabel) ||
//                 label.includes(vid) ||
//                 label.includes(pid)
//               );
//             });

//             if (!videoDevice) {
//               console.warn(`Warning: No matching device for ${cam.label}`);
//               deviceMap[stageIndex].push(null);
//             } else {
//               deviceMap[stageIndex].push(videoDevice.deviceId);
//             }
//           }
//         }

//         setCameraDevices(deviceMap);
//       } catch (error) {
//         console.error("Camera setup failed:", error);
//       }
//     }

//     setupCameraDevices();
//   }, [stages]);

//   // Load gallery images when stage is selected
//   useEffect(() => {
//     if (selectedStage !== null) {
//       loadGalleryImages(selectedStage);
//     }
//   }, [selectedStage]);

//   // Set first stage as default
//   useEffect(() => {
//     if (stages.length > 0) {
//       setSelectedStage(0);
//     }
//   }, [stages]);

//   // Sync selectAll with actual selection
//   useEffect(() => {
//     if (galleryImages.length > 0) {
//       const allSelected = galleryImages.every(img => selectedImages.has(img.filename));
//       setSelectAll(allSelected);
//     } else {
//       setSelectAll(false);
//     }
//   }, [selectedImages, galleryImages]);

//   const loadGalleryImages = async (stageIndex) => {
//     setLoadingGallery(true);
//     setSelectedImages(new Set());
//     try {
//       const stage = stages[stageIndex];
//       const response = await urlSocket.post("/get_training_images", {
//         comp_code: datas.comp_code,
//         stage_code: stage.stage_code
//       });

//       setGalleryImages(response.data.images || []);
//     } catch (error) {
//       console.error("Failed to load gallery images:", error);
//       setGalleryImages([]);
//     } finally {
//       setLoadingGallery(false);
//     }
//   };

//   const handleDeleteImage = async (image) => {
//     const result = await Swal.fire({
//       title: "Delete Image?",
//       text: "This action cannot be undone",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#dc3545",
//       cancelButtonColor: "#6c757d",
//       confirmButtonText: "Yes, delete it!"
//     });

//     if (result.isConfirmed) {
//       try {
//         const response = await urlSocket.post("/delete_training_image", {
//           filename: image.filename,
//           camera_label: image.camera_label
//         });

//         if (response.data.success) {
//           Swal.fire("Deleted!", "Image has been deleted.", "success");
//           loadGalleryImages(selectedStage);
//         } else {
//           Swal.fire("Error!", "Failed to delete image", "error");
//         }
//       } catch (error) {
//         console.error("Delete error:", error);
//         Swal.fire("Error!", "Failed to delete image", "error");
//       }
//     }
//   };

//   const handleBulkDelete = async () => {
//     if (selectedImages.size === 0) {
//       Swal.fire("No Selection", "Please select at least one image to delete.", "info");
//       return;
//     }

//     const result = await Swal.fire({
//       title: `Delete ${selectedImages.size} Image(s)?`,
//       text: "This action cannot be undone",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#dc3545",
//       cancelButtonColor: "#6c757d",
//       confirmButtonText: "Yes, delete all!"
//     });

//     if (result.isConfirmed) {
//       try {
//         const deletePromises = Array.from(selectedImages).map(filename => {
//           const image = galleryImages.find(img => img.filename === filename);
//           return urlSocket.post("/delete_training_image", {
//             filename,
//             camera_label: image.camera_label
//           });
//         });

//         const responses = await Promise.all(deletePromises);
//         const allSuccess = responses.every(r => r.data.success);

//         if (allSuccess) {
//           Swal.fire("Deleted!", `${selectedImages.size} images deleted.`, "success");
//           loadGalleryImages(selectedStage);
//         } else {
//           Swal.fire("Partial Success", "Some images failed to delete.", "warning");
//         }
//       } catch (error) {
//         console.error("Bulk delete error:", error);
//         Swal.fire("Error!", "Failed to delete selected images.", "error");
//       }
//     }
//   };

//   const toggleImageSelection = (filename) => {
//     const newSelected = new Set(selectedImages);
//     if (newSelected.has(filename)) {
//       newSelected.delete(filename);
//     } else {
//       newSelected.add(filename);
//     }
//     setSelectedImages(newSelected);
//   };

//   const toggleSelectAll = () => {
//     if (selectAll) {
//       setSelectedImages(new Set());
//     } else {
//       const allFilenames = galleryImages.map(img => img.filename);
//       setSelectedImages(new Set(allFilenames));
//     }
//   };

//   const showNotification = (message) => {
//     setNotification(message);
//     setTimeout(() => setNotification(""), 3000);
//   };

//   const dataURLtoBlob = (dataURL) => {
//     const arr = dataURL.split(",");
//     const mime = arr[0].match(/:(.*?);/)[1];
//     const bstr = atob(arr[1]);
//     let n = bstr.length;
//     const u8arr = new Uint8Array(n);
//     while (n--) u8arr[n] = bstr.charCodeAt(n);
//     return new Blob([u8arr], { type: mime });
//   };

//   // Sequential capture with count and image preview
//   const handleAutoCaptureAll = async () => {
//     if (isCapturing) return;

//     // Validate capture count
//     if (!captureCount || captureCount < 1) {
//       Swal.fire("Invalid Count", "Please enter a valid capture count (minimum 1)", "warning");
//       return;
//     }

//     setIsCapturing(true);
//     setCaptureStatus({});
//     setCurrentCapturePreview(null);

//     try {
//       // Loop through each stage
//       for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
//         const stage = stages[stageIndex];
//         const cameras = stage?.camera_selection?.cameras || [];
//         const devices = cameraDevices[stageIndex] || [];

//         // Loop through each camera in the stage
//         for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
//           const camera = cameras[camIndex];
//           const webcamInstance = webcamRefs.current[camera.originalLabel];

//           if (!webcamInstance || !devices[camIndex]) {
//             console.warn(`Camera not available: ${camera.label}`);
//             continue;
//           }

//           // Capture multiple images for this camera
//           for (let captureNum = 1; captureNum <= captureCount; captureNum++) {
//             await new Promise((res) => setTimeout(res, 300)); // Wait to ensure camera is ready

//             const base64Image = webcamInstance.captureZoomedImage();

//             if (!base64Image) {
//               console.warn(`Failed to capture from ${camera.label}`);
//               continue;
//             }

//             // Update the capture status and preview
//             const videoKey = `${stageIndex}-${camIndex}`;
//             setCaptureStatus((prev) => ({
//               ...prev,
//               [videoKey]: true,
//             }));

//             // Show captured image preview
//             setCurrentCapturePreview({
//               image: base64Image,
//               captureNum,
//               totalCaptures: captureCount,
//               stageName: stage.stage_name,
//               stageIndex: stageIndex,
//               camIndex: camIndex,
//               cameraLabel: camera.label,
//               status: 'uploading'
//             });

//             const blob = dataURLtoBlob(base64Image);
//             const fileName = `${stage.stage_name}_${camera.label}_${Date.now()}.png`;

//             const formData = new FormData();
//             formData.append("comp_name", datas.comp_name);
//             formData.append("comp_id", datas.comp_id);
//             formData.append("comp_code", datas.comp_code);
//             formData.append("stage_name", stage.stage_name);
//             formData.append("stage_code", stage.stage_code);
//             formData.append("img_0", blob, fileName);
//             formData.append("img_0_label", camera.label);

//             // Upload image to server
//             try {
//               const response = await urlSocket.post("/remoteMultiCapture_sequential", formData);
//               console.log("Uploaded:", response.data);

//               if (response.data.error) {
//                 setCurrentCapturePreview(null);
//                 Swal.fire({
//                   title: "Error",
//                   text: response.data.error,
//                   icon: "error",
//                   confirmButtonText: "OK",
//                   confirmButtonColor: "#dc3545",
//                 });
//                 setIsCapturing(false);
//                 return;
//               }

//               // Update status to success
//               setCurrentCapturePreview(prev => ({ ...prev, status: 'success' }));
//               await new Promise(res => setTimeout(res, 500)); // Show success briefly

//             } catch (error) {
//               console.error("Upload error:", error);
//               setCurrentCapturePreview(null);
//               Swal.fire({
//                 title: "Upload Error",
//                 text: `Failed to upload image ${captureNum} for ${camera.label}`,
//                 icon: "error",
//                 confirmButtonText: "OK",
//                 confirmButtonColor: "#dc3545",
//               });
//               setIsCapturing(false);
//               return;
//             }
//           }

//           // Reset capture status for this camera after all captures
//           const videoKey = `${stageIndex}-${camIndex}`;
//           setCaptureStatus((prev) => ({
//             ...prev,
//             [videoKey]: false,
//           }));
//         }
//       }

//       // Final success message
//       setCurrentCapturePreview(null);
//       showNotification(`All images captured successfully! Total: ${stages.reduce((sum, stage) => sum + (stage?.camera_selection?.cameras?.length || 0), 0) * captureCount} images`);

//       if (selectedStage !== null) {
//         loadGalleryImages(selectedStage);
//       }
//     } catch (error) {
//       console.error("Capture error:", error);
//       setCurrentCapturePreview(null);
//       Swal.fire({
//         title: "Error!",
//         text: "An error occurred while capturing images.",
//         icon: "error",
//         confirmButtonText: "Try Again",
//         confirmButtonColor: "#dc3545",
//       });
//     } finally {
//       setIsCapturing(false);
//       setCaptureStatus({});
//     }
//   };

//   const handleStageCameraSync = async () => {
//     try {
//       const res = await urlSocket.post("/sync_training_mode_result_train");
//       Swal.fire({
//         title: "Sync Complete!",
//         text: `Total Synced: ${res.data.count}`,
//         icon: "success",
//         confirmButtonColor: "#28a745"
//       });
//     } catch (err) {
//       console.error("Error:", err);
//       Swal.fire({
//         title: "Sync Failed!",
//         text: "Failed to sync training results.",
//         icon: "error",
//         confirmButtonColor: "#dc3545"
//       });
//     }
//   };

//   const back = () => history.goBack();

//   return (
//     <div className="page-content" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
//       <style>
//         {`
//           .camera-card {
//             transition: all 0.3s ease;
//             border: none;
//             box-shadow: 0 2px 8px rgba(0,0,0,0.08);
//           }
//           .camera-card:hover {
//             transform: translateY(-4px);
//             box-shadow: 0 8px 16px rgba(0,0,0,0.12);
//           }
//           .camera-card.captured {
//             border: 2px solid #28a745 !important;
//           }
//           .stage-card {
//             border: none;
//             box-shadow: 0 4px 12px rgba(0,0,0,0.1);
//             height: calc(100vh - 200px);
//             display: flex;
//             flex-direction: column;
//           }
//           .header-card {
//             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//             color: white;
//             border: none;
//             box-shadow: 0 4px 12px rgba(0,0,0,0.15);
//           }
//           .webcam-container {
//             position: relative;
//             overflow: hidden;
//             border-radius: 8px;
//             background: #000;
//           }
//           .camera-status-badge {
//             position: absolute;
//             top: 10px;
//             right: 10px;
//             z-index: 10;
//           }
//           .gallery-image {
//             width: 100%;
//             height: 180px;
//             object-fit: cover;
//             cursor: pointer;
//             transition: transform 0.2s;
//             border-radius: 8px;
//           }
//           .gallery-image:hover {
//             transform: scale(1.05);
//           }
//           .gallery-item {
//             position: relative;
//             margin-bottom: 1rem;
//             border: 2px solid transparent;
//             border-radius: 10px;
//             transition: border 0.2s;
//           }
//           .gallery-item.selected {
//             border-color: #007bff;
//           }
//           .gallery-item:hover {
//             border-color: #dee2e6;
//           }
//           .delete-btn {
//             position: absolute;
//             top: 8px;
//             right: 8px;
//             z-index: 10;
//             background: rgba(220, 53, 69, 0.9);
//             border: none;
//             border-radius: 50%;
//             width: 32px;
//             height: 32px;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             box-shadow: 0 2px 6px rgba(0,0,0,0.2);
//           }
//           .gallery-scroll {
//             flex: 1;
//             overflow-y: auto;
//             padding-right: 8px;
//           }
//           .gallery-scroll::-webkit-scrollbar {
//             width: 6px;
//           }
//           .gallery-scroll::-webkit-scrollbar-thumb {
//             background-color: rgba(0,0,0,.3);
//             border-radius: 3px;
//           }
//           .stage-tab {
//             cursor: pointer;
//             transition: all 0.3s;
//             padding: 10px 20px;
//             border-radius: 8px 8px 0 0;
//             background: #e9ecef;
//             margin-right: 5px;
//           }
//           .stage-tab.active {
//             background: white;
//             font-weight: bold;
//             box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
//           }
//           .stage-tab:hover {
//             background: #dee2e6;
//           }
//           .capture-btn-container {
//             position: sticky;
//             top: 0;
//             background: white;
//             z-index: 10;
//             padding: 1rem 0;
//             border-bottom: 1px solid #dee2e6;
//             margin-bottom: 1rem;
//           }
//           .checkbox-container {
//             position: absolute;
//             top: 8px;
//             left: 8px;
//             z-index: 10;
//             background: rgba(255, 255, 255, 0.9);
//             border-radius: 4px;
//             padding: 2px;
//           }
//         `}
//       </style>

//       <Container fluid>
//         {/* Notification Toast */}
//         {notification && (
//           <div
//             style={{
//               position: "fixed",
//               top: "20px",
//               right: "20px",
//               zIndex: 9999,
//               maxWidth: "300px"
//             }}
//           >
//             <Alert color="success" className="mb-0 shadow-lg">
//               <i className="mdi mdi-check-circle me-2"></i>
//               {notification}
//             </Alert>
//           </div>
//         )}

//         {/* Header */}
//         <Card className="header-card mb-4">
//           <CardBody className="py-3">
//             <Row className="align-items-center">
//               <Col md={4}>
//                 <h3 className="mb-0 text-white">
//                   <i className="mdi mdi-camera-burst me-2"></i>
//                   Remote Camera Gallery
//                 </h3>
//               </Col>
//               <Col md={8} className="text-end">
//                 <Button
//                   color="light"
//                   outline
//                   className="me-2"
//                   onClick={handleStageCameraSync}
//                 >
//                   <i className="mdi mdi-sync me-1"></i>
//                   Training Sync
//                 </Button>
//                 <Button
//                   color="light"
//                   onClick={back}
//                 >
//                   <i className="mdi mdi-arrow-left me-1"></i>
//                   Back
//                 </Button>
//               </Col>
//             </Row>
//           </CardBody>
//         </Card>

//         <Row>
//           <Col lg={6}>
//             <Card className="stage-card">
//               <CardHeader className="bg-white border-bottom pb-0">
//                 <div className="capture-btn-container">
//                   <Row className="align-items-center">
//                     <Col md={6}>
//                       <div className="d-flex align-items-center gap-2">
//                         <label className="mb-0 fw-bold" style={{ minWidth: "120px" }}>
//                           Images per Camera:
//                         </label>
//                         <Input
//                           type="number"
//                           min="1"
//                           value={captureCount}
//                           onChange={(e) => setCaptureCount(parseInt(datas?.capture_count))}
//                           style={{ width: "100px" }}
//                           disabled={true}
//                         />
//                       </div>
//                     </Col>
//                     <Col md={6} className="text-end">
//                       <Button
//                         size="lg"
//                         color="success"
//                         className="px-4"
//                         onClick={handleAutoCaptureAll}
//                         disabled={isCapturing}
//                       >
//                         {isCapturing ? (
//                           <>
//                             <Spinner size="sm" className="me-2" />
//                             Capturing...
//                           </>
//                         ) : (
//                           <>
//                             <i className="mdi mdi-camera-burst me-2"></i>
//                             Auto Capture All ({captureCount}x)
//                           </>
//                         )}
//                       </Button>
//                     </Col>
//                   </Row>
//                 </div>
//               </CardHeader>
//               <CardBody className="p-3 gallery-scroll">
//                 {stages.map((stage, stageIndex) => (
//                   <div key={stageIndex} className="mb-5">
//                     <Row className="align-items-center mb-3">
//                       <Col>
//                         <h5 className="mb-0 text-dark">
//                           {stage.stage_name}
//                         </h5>
//                         <small className="text-muted">
//                           Stage Code: {stage.stage_code}
//                         </small>
//                       </Col>
//                       <Col xs="auto">
//                         <Badge color="primary" pill>
//                           {(cameraDevices[stageIndex] || []).filter(d => d !== null).length}/
//                           {(stage?.camera_selection?.cameras || []).length}
//                         </Badge>
//                       </Col>
//                     </Row>
//                     <Row>
//                       {(stage?.camera_selection?.cameras || []).map((camera, camIndex) => {
//                         const videoKey = `${stageIndex}-${camIndex}`;
//                         const deviceId = (cameraDevices[stageIndex] || [])[camIndex];
//                         const hasDevice = !!deviceId;
//                         const isCaptured = captureStatus[videoKey];

//                         return (
//                           <Col md={6} key={camIndex} className="mb-3">
//                             <Card className={`camera-card ${isCaptured ? "captured" : ""}`}>
//                               <CardHeader className="bg-dark text-white d-flex justify-content-between align-items-center py-2">
//                                 <span className="fw-bold text-truncate" style={{ maxWidth: '150px' }}>
//                                   <i className="mdi mdi-camera me-1"></i>
//                                   {camera.label}
//                                 </span>
//                                 {isCaptured && (
//                                   <Badge color="success" pill>
//                                     <i className="mdi mdi-check"></i>
//                                   </Badge>
//                                 )}
//                               </CardHeader>
//                               <CardBody className="p-0">
//                                 <div className="webcam-container" style={{ height: "220px", position: "relative" }}>
//                                   {hasDevice ? (
//                                     <>
//                                       <WebcamCapture
//                                         ref={(el) => { if (el) webcamRefs.current[camera.originalLabel] = el; }}
//                                         resolution={DEFAULT_RESOLUTION}
//                                         cameraLabel={camera.originalLabel}
//                                         style={{
//                                           position: "absolute",
//                                           top: 0,
//                                           left: 0,
//                                           width: "100%",
//                                           height: "100%",
//                                           objectFit: "cover"
//                                         }}
//                                       />
//                                       <Badge color="success" pill className="camera-status-badge">
//                                         <i className="mdi mdi-circle" style={{ fontSize: "8px" }}></i> Live
//                                       </Badge>

//                                       {currentCapturePreview &&
//                                         currentCapturePreview.stageIndex === stageIndex &&
//                                         currentCapturePreview.camIndex === camIndex && (
//                                           <div
//                                             style={{
//                                               position: "absolute",
//                                               bottom: "10px",
//                                               left: "50%",
//                                               transform: "translateX(-50%)",
//                                               backgroundColor: "rgba(99, 102, 241, 0.95)",
//                                               color: "white",
//                                               padding: "8px 16px",
//                                               borderRadius: "20px",
//                                               fontWeight: "700",
//                                               fontSize: "14px",
//                                               boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
//                                               zIndex: 20,
//                                               display: "flex",
//                                               alignItems: "center",
//                                               gap: "8px"
//                                             }}
//                                           >
//                                             {currentCapturePreview.status === 'uploading' ? (
//                                               <>
//                                                 <Spinner size="sm" style={{ width: "16px", height: "16px" }} />
//                                                 <span>{currentCapturePreview.captureNum}/{currentCapturePreview.totalCaptures}</span>
//                                               </>
//                                             ) : (
//                                               <>
//                                                 <i className="mdi mdi-check-circle"></i>
//                                                 <span>{currentCapturePreview.captureNum}/{currentCapturePreview.totalCaptures}</span>
//                                               </>
//                                             )}
//                                           </div>
//                                         )}
//                                     </>
//                                   ) : (
//                                     <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
//                                       <i className="mdi mdi-camera-off" style={{ fontSize: "36px" }}></i>
//                                       <small className="mt-1">Not Available</small>
//                                     </div>
//                                   )}
//                                 </div>
//                               </CardBody>
//                             </Card>
//                           </Col>
//                         );
//                       })}
//                     </Row>
//                   </div>
//                 ))}
//               </CardBody>
//             </Card>
//           </Col>

//           {/* Right Side - Image Gallery */}
//           <Col lg={6}>
//             <div className="d-flex mb-3" style={{ borderBottom: "2px solid #e9ecef" }}>
//               {stages.map((stage, index) => (
//                 <div
//                   key={stage._id?.$oid || index}
//                   className={`stage-tab ${selectedStage === index ? "active" : ""}`}
//                   onClick={() => setSelectedStage(index)}
//                 >
//                   {stage.stage_name}
//                 </div>
//               ))}
//             </div>

//             {(() => {
//               const byCamera = {};
//               galleryImages.forEach(img => {
//                 const key = (img.camera_label || "").trim();
//                 if (!byCamera[key]) byCamera[key] = [];
//                 byCamera[key].push(img);
//               });

//               const sortedLabels = Object.keys(byCamera).sort((a, b) => a.localeCompare(b));

//               const shownImages =
//                 selectedCameraLabel && byCamera[selectedCameraLabel]
//                   ? byCamera[selectedCameraLabel]
//                   : galleryImages;

//               const allShownIds = shownImages.map(i => i.filename);
//               const allSelected = allShownIds.every(id => selectedImages.has(id));

//               return (
//                 <div
//                   style={{
//                     backgroundColor: "#fff",
//                     borderRadius: "10px",
//                     padding: "16px",
//                     boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//                     height: "calc(100vh - 200px)",
//                     display: "flex",
//                     flexDirection: "column",
//                   }}
//                 >
//                   {/* Header */}
//                   <div style={{ marginBottom: "16px" }}>
//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
//                       <h6 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#111827" }}>
//                         Image Gallery ({galleryImages.length})
//                       </h6>
//                       <Button
//                         size="sm"
//                         onClick={() => loadGalleryImages(selectedStage)}
//                         disabled={loadingGallery}
//                         style={{
//                           backgroundColor: "#6366f1",
//                           border: "none",
//                           borderRadius: "6px",
//                           padding: "4px 12px",
//                           fontSize: "12px",
//                           fontWeight: "500",
//                           color: "#fff",
//                         }}
//                       >
//                         {loadingGallery ? "Loading..." : "Refresh"}
//                       </Button>
//                     </div>

//                     {/* Selection Controls */}
//                     {selectedImages.size > 0 && (
//                       <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
//                         <Button size="sm" color="info" onClick={() => allSelected ? setSelectedImages(new Set()) : setSelectedImages(new Set(allShownIds))}>
//                           {allSelected ? "Deselect All" : "Select All"}
//                         </Button>
//                         <Button size="sm" color="danger" onClick={handleBulkDelete}>
//                           Delete ({selectedImages.size})
//                         </Button>
//                         <Button size="sm" color="secondary" onClick={() => setSelectedImages(new Set())}>
//                           Clear
//                         </Button>
//                       </div>
//                     )}
//                   </div>

//                   {/* Images Grid */}
//                   <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
//                     {loadingGallery ? (
//                       <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af" }}>
//                         <Spinner color="primary" />
//                         <p style={{ fontSize: "14px", marginTop: "12px" }}>Loading images...</p>
//                       </div>
//                     ) : shownImages.length === 0 ? (
//                       <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af" }}>
//                         <p style={{ fontSize: "14px", fontWeight: "500" }}>
//                           {selectedCameraLabel ? `No images for ${selectedCameraLabel}` : "No images captured yet"}
//                         </p>
//                       </div>
//                     ) : (
//                       <Row className="g-3">
//                         {shownImages.map(image => {
//                           const isSelected = selectedImages.has(image.filename);
//                           const isSingleHighlight = !selectedImages.size && previewImage?.filename === image.filename;

//                           return (
//                             <Col key={image.filename} xs={6} md={4}>
//                               <div
//                                 style={{
//                                   position: "relative",
//                                   borderRadius: "8px",
//                                   overflow: "hidden",
//                                   border: isSelected ? "3px solid #6366f1" : isSingleHighlight ? "3px solid #10b981" : "1px solid #e5e7eb",
//                                   cursor: "pointer",
//                                   transition: "all 0.2s ease",
//                                 }}
//                                 onClick={() => setPreviewImage(image)}
//                                 onMouseEnter={e => {
//                                   e.currentTarget.style.transform = "scale(1.05)";
//                                   e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
//                                 }}
//                                 onMouseLeave={e => {
//                                   e.currentTarget.style.transform = "scale(1)";
//                                   e.currentTarget.style.boxShadow = "none";
//                                 }}
//                               >
//                                 <img
//                                   src={`${ImageUrl}${image.insp_local_path}`}
//                                   alt={image.camera_label}
//                                   style={{ width: "100%", height: "120px", objectFit: "cover" }}
//                                   onError={e => (e.target.src = "/fallback.png")}
//                                 />

//                                 {/* Checkbox */}
//                                 <div
//                                   onClick={e => {
//                                     e.stopPropagation();
//                                     toggleImageSelection(image.filename);
//                                   }}
//                                   style={{
//                                     position: "absolute",
//                                     top: "6px",
//                                     left: "6px",
//                                     width: "20px",
//                                     height: "20px",
//                                     borderRadius: "4px",
//                                     backgroundColor: isSelected ? "#6366f1" : "rgba(255,255,255,0.85)",
//                                     border: "2px solid " + (isSelected ? "#6366f1" : "#d1d5db"),
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     cursor: "pointer",
//                                   }}
//                                 >
//                                   {isSelected && <i className="fa fa-check" style={{ color: "#fff", fontSize: "11px" }} />}
//                                 </div>

//                                 {/* Eye Button */}
//                                 <button
//                                   onClick={e => {
//                                     e.stopPropagation();
//                                     setPreviewImage(image);
//                                     setShowPreview(true);
//                                   }}
//                                   style={{
//                                     position: "absolute",
//                                     top: "6px",
//                                     left: "50%",
//                                     transform: "translateX(-50%)",
//                                     backgroundColor: "rgba(99,102,241,0.9)",
//                                     border: "none",
//                                     borderRadius: "50%",
//                                     width: "26px",
//                                     height: "26px",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     cursor: "pointer",
//                                   }}
//                                 >
//                                   <i className="fa fa-eye" style={{ color: "#fff", fontSize: "13px" }} />
//                                 </button>

//                                 {/* Delete Button */}
//                                 <button
//                                   onClick={e => {
//                                     e.stopPropagation();
//                                     handleDeleteImage(image);
//                                   }}
//                                   style={{
//                                     position: "absolute",
//                                     top: "6px",
//                                     right: "6px",
//                                     backgroundColor: "rgba(239,68,68,0.9)",
//                                     border: "none",
//                                     borderRadius: "50%",
//                                     width: "26px",
//                                     height: "26px",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     cursor: "pointer",
//                                   }}
//                                 >
//                                   <i className="fa fa-times" style={{ color: "#fff", fontSize: "13px" }} />
//                                 </button>

//                                 {/* Filename */}
//                                 <div style={{
//                                   position: "absolute",
//                                   bottom: 0,
//                                   left: 0,
//                                   right: 0,
//                                   background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
//                                   padding: "6px 6px 3px",
//                                 }}>
//                                   <p style={{
//                                     margin: 0,
//                                     fontSize: "10px",
//                                     fontWeight: "600",
//                                     color: "#fff",
//                                     textOverflow: "ellipsis",
//                                     overflow: "hidden",
//                                     whiteSpace: "nowrap",
//                                   }}>
//                                     {image.filename}
//                                   </p>
//                                 </div>
//                               </div>
//                             </Col>
//                           );
//                         })}
//                       </Row>
//                     )}
//                   </div>

//                   {/* Single image details */}
//                   {previewImage && selectedImages.size === 0 && (
//                     <div style={{
//                       marginTop: "16px",
//                       padding: "10px",
//                       backgroundColor: "#f9fafb",
//                       borderRadius: "8px",
//                       border: "1px solid #e5e7eb",
//                       fontSize: "12px"
//                     }}>
//                       <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
//                         <strong>{previewImage.camera_label}</strong>
//                         <button onClick={() => setPreviewImage(null)} style={{ background: "none", border: "none", fontSize: "16px" }}>×</button>
//                       </div>
//                       <div style={{ color: "#6b7280" }}>
//                         <div><strong>File:</strong> {previewImage.filename}</div>
//                         <div><strong>Time:</strong> {new Date(previewImage.timestamp).toLocaleString()}</div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })()}
//           </Col>
//         </Row>
//       </Container>

//       {/* Image Preview Modal */}
//       <Modal isOpen={showPreview} toggle={() => setShowPreview(false)} size="lg">
//         <ModalHeader toggle={() => setShowPreview(false)}>
//           {previewImage?.camera_label}
//         </ModalHeader>
//         <ModalBody className="text-center">
//           {previewImage && (
//             <>
//               <img
//                 src={`${ImageUrl}${previewImage.insp_local_path}`}
//                 alt={previewImage.camera_label}
//                 style={{ maxWidth: "100%", maxHeight: "70vh" }}
//               />
//               <div className="mt-3 text-start">
//                 <p><strong>Filename:</strong> {previewImage.filename}</p>
//                 <p><strong>Camera:</strong> {previewImage.camera_label}</p>
//                 <p><strong>Timestamp:</strong> {new Date(previewImage.timestamp).toLocaleString()}</p>
//                 <p><strong>Dimensions:</strong> {previewImage.width} x {previewImage.height}</p>
//               </div>
//             </>
//           )}
//         </ModalBody>
//       </Modal>
//     </div>
//   );
// };

// export default RemoteStg;



// import React, { useEffect, useRef, useState } from "react";
// import Webcam from "react-webcam";
// import WebcamCapture from "pages/WebcamCustom/WebcamCapture";
// import { useLocation, useHistory } from "react-router-dom";
// import urlSocket from "./urlSocket";
// import ImageUrl from "./imageUrl";

// import {
//   Container,
//   Button,
//   Col,
//   Row,
//   Card,
//   CardBody,
//   CardHeader,
//   Badge,
//   Spinner,
//   Alert,
//   Modal,
//   ModalHeader,
//   ModalBody,
//   Input
// } from "reactstrap";
// import Swal from "sweetalert2";
// import { DEFAULT_RESOLUTION } from "./cameraConfig";

// const RemoteStg = () => {
//   const location = useLocation();
//   const history = useHistory();
//   const { datas } = location.state || {};

//   const stages = datas?.stages || [];

//   const [cameraDevices, setCameraDevices] = useState({});
//   const webcamRefs = useRef([]);
//   const [isCapturing, setIsCapturing] = useState(false);
//   const [captureStatus, setCaptureStatus] = useState({});
//   const [notification, setNotification] = useState("");
//   const [selectedCameraLabel, setSelectedCameraLabel] = useState(null);

//   // Capture count state - get from datas
//   const [captureCount, setCaptureCount] = useState(parseInt(datas?.capture_count) || 5);

//   // Gallery states
//   const [galleryImages, setGalleryImages] = useState([]);
//   const [loadingGallery, setLoadingGallery] = useState(false);
//   const [selectedStage, setSelectedStage] = useState(null);
//   const [previewImage, setPreviewImage] = useState(null);
//   const [showPreview, setShowPreview] = useState(false);

//   // Selection state
//   const [selectedImages, setSelectedImages] = useState(new Set());
//   const [selectAll, setSelectAll] = useState(false);

//   // Capture preview state - track stage and camera index
//   const [currentCapturePreview, setCurrentCapturePreview] = useState(null);

//   // Track camera capture counts
//   const [cameraCapturedCounts, setCameraCapturedCounts] = useState({});

//   // Setup camera device IDs
//   useEffect(() => {
//     async function setupCameraDevices() {
//       try {
//         await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
//         const devices = await navigator.mediaDevices.enumerateDevices();

//         const deviceMap = {};

//         for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
//           const stage = stages[stageIndex];
//           const cameras = stage?.camera_selection?.cameras || [];
//           deviceMap[stageIndex] = [];

//           for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
//             const cam = cameras[camIndex];
//             const videoDevice = devices.find((d) => {
//               if (d.kind !== "videoinput") return false;
//               const label = d.label?.toLowerCase() || "";
//               const origLabel = cam.originalLabel?.toLowerCase() || "";
//               const vid = cam.v_id?.toLowerCase() || "";
//               const pid = cam.p_id?.toLowerCase() || "";
//               return (
//                 label.includes(origLabel) ||
//                 label.includes(vid) ||
//                 label.includes(pid)
//               );
//             });

//             if (!videoDevice) {
//               console.warn(`Warning: No matching device for ${cam.label}`);
//               deviceMap[stageIndex].push(null);
//             } else {
//               deviceMap[stageIndex].push(videoDevice.deviceId);
//             }
//           }
//         }

//         setCameraDevices(deviceMap);
//       } catch (error) {
//         console.error("Camera setup failed:", error);
//       }
//     }

//     setupCameraDevices();
//   }, [stages]);

//   // Load gallery images when stage is selected
//   useEffect(() => {
//     if (selectedStage !== null) {
//       loadGalleryImages(selectedStage);
//     }
//   }, [selectedStage]);

//   // Set first stage as default
//   useEffect(() => {
//     if (stages.length > 0) {
//       setSelectedStage(0);
//     }
//   }, [stages]);

//   // Sync selectAll with actual selection
//   useEffect(() => {
//     if (galleryImages.length > 0) {
//       const allSelected = galleryImages.every(img => selectedImages.has(img.filename));
//       setSelectAll(allSelected);
//     } else {
//       setSelectAll(false);
//     }
//   }, [selectedImages, galleryImages]);

//   // Calculate camera captured counts from gallery images
//   useEffect(() => {
//     const counts = {};

//     stages.forEach((stage, stageIndex) => {
//       const cameras = stage?.camera_selection?.cameras || [];
//       cameras.forEach((camera, camIndex) => {
//         const videoKey = `${stageIndex}-${camIndex}`;

//         // Count images for this camera from gallery
//         const cameraImages = galleryImages.filter(
//           img => img.camera_label === camera.label
//         );

//         counts[videoKey] = cameraImages.length;
//       });
//     });

//     setCameraCapturedCounts(counts);
//   }, [galleryImages, stages]);

//   const loadGalleryImages = async (stageIndex) => {
//     setLoadingGallery(true);
//     setSelectedImages(new Set());
//     try {
//       const stage = stages[stageIndex];
//       const response = await urlSocket.post("/get_training_images", {
//         comp_code: datas.comp_code,
//         stage_code: stage.stage_code
//       });

//       setGalleryImages(response.data.images || []);
//     } catch (error) {
//       console.error("Failed to load gallery images:", error);
//       setGalleryImages([]);
//     } finally {
//       setLoadingGallery(false);
//     }
//   };

//   const handleDeleteImage = async (image) => {
//     const result = await Swal.fire({
//       title: "Delete Image?",
//       text: "This action cannot be undone",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#dc3545",
//       cancelButtonColor: "#6c757d",
//       confirmButtonText: "Yes, delete it!"
//     });

//     if (result.isConfirmed) {
//       try {
//         const response = await urlSocket.post("/delete_training_image", {
//           filename: image.filename,
//           camera_label: image.camera_label
//         });

//         if (response.data.success) {
//           Swal.fire("Deleted!", "Image has been deleted.", "success");
//           loadGalleryImages(selectedStage);
//         } else {
//           Swal.fire("Error!", "Failed to delete image", "error");
//         }
//       } catch (error) {
//         console.error("Delete error:", error);
//         Swal.fire("Error!", "Failed to delete image", "error");
//       }
//     }
//   };

//   const handleBulkDelete = async () => {
//     if (selectedImages.size === 0) {
//       Swal.fire("No Selection", "Please select at least one image to delete.", "info");
//       return;
//     }

//     const result = await Swal.fire({
//       title: `Delete ${selectedImages.size} Image(s)?`,
//       text: "This action cannot be undone",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#dc3545",
//       cancelButtonColor: "#6c757d",
//       confirmButtonText: "Yes, delete all!"
//     });

//     if (result.isConfirmed) {
//       try {
//         const deletePromises = Array.from(selectedImages).map(filename => {
//           const image = galleryImages.find(img => img.filename === filename);
//           return urlSocket.post("/delete_training_image", {
//             filename,
//             camera_label: image.camera_label
//           });
//         });

//         const responses = await Promise.all(deletePromises);
//         const allSuccess = responses.every(r => r.data.success);

//         if (allSuccess) {
//           Swal.fire("Deleted!", `${selectedImages.size} images deleted.`, "success");
//           loadGalleryImages(selectedStage);
//         } else {
//           Swal.fire("Partial Success", "Some images failed to delete.", "warning");
//         }
//       } catch (error) {
//         console.error("Bulk delete error:", error);
//         Swal.fire("Error!", "Failed to delete selected images.", "error");
//       }
//     }
//   };

//   const toggleImageSelection = (filename) => {
//     const newSelected = new Set(selectedImages);
//     if (newSelected.has(filename)) {
//       newSelected.delete(filename);
//     } else {
//       newSelected.add(filename);
//     }
//     setSelectedImages(newSelected);
//   };

//   const toggleSelectAll = () => {
//     if (selectAll) {
//       setSelectedImages(new Set());
//     } else {
//       const allFilenames = galleryImages.map(img => img.filename);
//       setSelectedImages(new Set(allFilenames));
//     }
//   };

//   const showNotification = (message) => {
//     setNotification(message);
//     setTimeout(() => setNotification(""), 3000);
//   };

//   const dataURLtoBlob = (dataURL) => {
//     const arr = dataURL.split(",");
//     const mime = arr[0].match(/:(.*?);/)[1];
//     const bstr = atob(arr[1]);
//     let n = bstr.length;
//     const u8arr = new Uint8Array(n);
//     while (n--) u8arr[n] = bstr.charCodeAt(n);
//     return new Blob([u8arr], { type: mime });
//   };

//   // Sequential capture with count and image preview
//   const handleAutoCaptureAll = async () => {
//     if (isCapturing) return;

//     // Validate capture count
//     if (!captureCount || captureCount < 1) {
//       Swal.fire("Invalid Count", "Please enter a valid capture count (minimum 1)", "warning");
//       return;
//     }

//     // Check if any camera will exceed the limit
//     let willExceedLimit = false;
//     let exceedDetails = "";

//     for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
//       const stage = stages[stageIndex];
//       const cameras = stage?.camera_selection?.cameras || [];

//       for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
//         const camera = cameras[camIndex];
//         const videoKey = `${stageIndex}-${camIndex}`;
//         const currentCount = cameraCapturedCounts[videoKey] || 0;

//         if (currentCount + captureCount > captureCount) {
//           willExceedLimit = true;
//           exceedDetails = `Camera "${camera.label}" already has ${currentCount} images. Cannot capture ${captureCount} more (max: ${captureCount})`;
//           break;
//         }
//       }
//       if (willExceedLimit) break;
//     }

//     if (willExceedLimit) {
//       Swal.fire({
//         title: "Capture Limit Exceeded",
//         text: `Admin does not allow capturing more than ${captureCount} images per camera. ${exceedDetails}`,
//         icon: "error",
//         confirmButtonColor: "#dc3545",
//         confirmButtonText: "OK"
//       });
//       return;
//     }

//     setIsCapturing(true);
//     setCaptureStatus({});
//     setCurrentCapturePreview(null);

//     try {
//       // Loop through each stage
//       for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
//         const stage = stages[stageIndex];
//         const cameras = stage?.camera_selection?.cameras || [];
//         const devices = cameraDevices[stageIndex] || [];

//         // Loop through each camera in the stage
//         for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
//           const camera = cameras[camIndex];
//           const webcamInstance = webcamRefs.current[camera.originalLabel];
//           const videoKey = `${stageIndex}-${camIndex}`;
//           const currentCount = cameraCapturedCounts[videoKey] || 0;

//           if (!webcamInstance || !devices[camIndex]) {
//             console.warn(`Camera not available: ${camera.label}`);
//             continue;
//           }

//           // Check if this camera has reached the limit
//           if (currentCount >= captureCount) {
//             console.log(`Camera ${camera.label} already has ${currentCount} images (limit: ${captureCount})`);
//             continue;
//           }

//           // Calculate how many more images can be captured
//           const remainingCaptures = captureCount - currentCount;
//           const capturesToTake = Math.min(captureCount, remainingCaptures);

//           // Capture images for this camera
//           for (let captureNum = 1; captureNum <= capturesToTake; captureNum++) {
//             await new Promise((res) => setTimeout(res, 300)); // Wait to ensure camera is ready

//             const base64Image = webcamInstance.captureZoomedImage();

//             if (!base64Image) {
//               console.warn(`Failed to capture from ${camera.label}`);
//               continue;
//             }

//             // Update the capture status and preview
//             setCaptureStatus((prev) => ({
//               ...prev,
//               [videoKey]: true,
//             }));

//             // Show captured image preview
//             setCurrentCapturePreview({
//               image: base64Image,
//               captureNum: currentCount + captureNum,
//               totalCaptures: captureCount,
//               stageName: stage.stage_name,
//               stageIndex: stageIndex,
//               camIndex: camIndex,
//               cameraLabel: camera.label,
//               status: 'uploading'
//             });

//             const blob = dataURLtoBlob(base64Image);
//             const fileName = `${stage.stage_name}_${camera.label}_${Date.now()}.png`;

//             const formData = new FormData();
//             formData.append("comp_name", datas.comp_name);
//             formData.append("comp_id", datas.comp_id);
//             formData.append("comp_code", datas.comp_code);
//             formData.append("stage_name", stage.stage_name);
//             formData.append("stage_code", stage.stage_code);
//             formData.append("img_0", blob, fileName);
//             formData.append("img_0_label", camera.label);

//             // Upload image to server
//             try {
//               const response = await urlSocket.post("/remoteMultiCapture_sequential", formData);
//               console.log("Uploaded:", response.data);

//               if (response.data.error) {
//                 setCurrentCapturePreview(null);
//                 Swal.fire({
//                   title: "Error",
//                   text: response.data.error,
//                   icon: "error",
//                   confirmButtonText: "OK",
//                   confirmButtonColor: "#dc3545",
//                 });
//                 setIsCapturing(false);
//                 return;
//               }

//               // Update status to success
//               setCurrentCapturePreview(prev => ({ ...prev, status: 'success' }));
//               await new Promise(res => setTimeout(res, 500)); // Show success briefly

//               // Update the camera count immediately
//               setCameraCapturedCounts(prev => ({
//                 ...prev,
//                 [videoKey]: (prev[videoKey] || 0) + 1
//               }));

//             } catch (error) {
//               console.error("Upload error:", error);
//               setCurrentCapturePreview(null);
//               Swal.fire({
//                 title: "Upload Error",
//                 text: `Failed to upload image ${captureNum} for ${camera.label}`,
//                 icon: "error",
//                 confirmButtonText: "OK",
//                 confirmButtonColor: "#dc3545",
//               });
//               setIsCapturing(false);
//               return;
//             }
//           }

//           // Reset capture status for this camera after all captures
//           setCaptureStatus((prev) => ({
//             ...prev,
//             [videoKey]: false,
//           }));
//         }
//       }

//       // Final success message
//       setCurrentCapturePreview(null);
//       const totalCaptured = stages.reduce((sum, stage) => sum + (stage?.camera_selection?.cameras?.length || 0), 0) * captureCount;
//       showNotification(`All images captured successfully! Total: ${totalCaptured} images`);

//       if (selectedStage !== null) {
//         loadGalleryImages(selectedStage);
//       }
//     } catch (error) {
//       console.error("Capture error:", error);
//       setCurrentCapturePreview(null);
//       Swal.fire({
//         title: "Error!",
//         text: "An error occurred while capturing images.",
//         icon: "error",
//         confirmButtonText: "Try Again",
//         confirmButtonColor: "#dc3545",
//       });
//     } finally {
//       setIsCapturing(false);
//       setCaptureStatus({});
//     }
//   };

//   const handleStageCameraSync = async () => {
//     try {
//       const res = await urlSocket.post("/sync_training_mode_result_train");
//       Swal.fire({
//         title: "Sync Complete!",
//         text: `Total Synced: ${res.data.count}`,
//         icon: "success",
//         confirmButtonColor: "#28a745"
//       });
//     } catch (err) {
//       console.error("Error:", err);
//       Swal.fire({
//         title: "Sync Failed!",
//         text: "Failed to sync training results.",
//         icon: "error",
//         confirmButtonColor: "#dc3545"
//       });
//     }
//   };

//   const back = () => history.goBack();

//   return (
//     <div className="page-content" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
//       <style>
//         {`
//           .camera-card {
//             transition: all 0.3s ease;
//             border: none;
//             box-shadow: 0 2px 8px rgba(0,0,0,0.08);
//           }
//           .camera-card:hover {
//             transform: translateY(-4px);
//             box-shadow: 0 8px 16px rgba(0,0,0,0.12);
//           }
//           .camera-card.captured {
//             border: 2px solid #28a745 !important;
//           }
//           .stage-card {
//             border: none;
//             box-shadow: 0 4px 12px rgba(0,0,0,0.1);
//             height: calc(100vh - 200px);
//             display: flex;
//             flex-direction: column;
//           }
//           .header-card {
//             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//             color: white;
//             border: none;
//             box-shadow: 0 4px 12px rgba(0,0,0,0.15);
//           }
//           .webcam-container {
//             position: relative;
//             overflow: hidden;
//             border-radius: 8px;
//             background: #000;
//           }
//           .camera-status-badge {
//             position: absolute;
//             top: 10px;
//             right: 10px;
//             z-index: 10;
//           }
//           .gallery-image {
//             width: 100%;
//             height: 180px;
//             object-fit: cover;
//             cursor: pointer;
//             transition: transform 0.2s;
//             border-radius: 8px;
//           }
//           .gallery-image:hover {
//             transform: scale(1.05);
//           }
//           .gallery-item {
//             position: relative;
//             margin-bottom: 1rem;
//             border: 2px solid transparent;
//             border-radius: 10px;
//             transition: border 0.2s;
//           }
//           .gallery-item.selected {
//             border-color: #007bff;
//           }
//           .gallery-item:hover {
//             border-color: #dee2e6;
//           }
//           .delete-btn {
//             position: absolute;
//             top: 8px;
//             right: 8px;
//             z-index: 10;
//             background: rgba(220, 53, 69, 0.9);
//             border: none;
//             border-radius: 50%;
//             width: 32px;
//             height: 32px;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             box-shadow: 0 2px 6px rgba(0,0,0,0.2);
//           }
//           .gallery-scroll {
//             flex: 1;
//             overflow-y: auto;
//             padding-right: 8px;
//           }
//           .gallery-scroll::-webkit-scrollbar {
//             width: 6px;
//           }
//           .gallery-scroll::-webkit-scrollbar-thumb {
//             background-color: rgba(0,0,0,.3);
//             border-radius: 3px;
//           }
//           .stage-tab {
//             cursor: pointer;
//             transition: all 0.3s;
//             padding: 10px 20px;
//             border-radius: 8px 8px 0 0;
//             background: #e9ecef;
//             margin-right: 5px;
//           }
//           .stage-tab.active {
//             background: white;
//             font-weight: bold;
//             box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
//           }
//           .stage-tab:hover {
//             background: #dee2e6;
//           }
//           .capture-btn-container {
//             position: sticky;
//             top: 0;
//             background: white;
//             z-index: 10;
//             padding: 1rem 0;
//             border-bottom: 1px solid #dee2e6;
//             margin-bottom: 1rem;
//           }
//           .checkbox-container {
//             position: absolute;
//             top: 8px;
//             left: 8px;
//             z-index: 10;
//             background: rgba(255, 255, 255, 0.9);
//             border-radius: 4px;
//             padding: 2px;
//           }
//         `}
//       </style>

//       <Container fluid>
//         {/* Notification Toast */}
//         {notification && (
//           <div
//             style={{
//               position: "fixed",
//               top: "20px",
//               right: "20px",
//               zIndex: 9999,
//               maxWidth: "300px"
//             }}
//           >
//             <Alert color="success" className="mb-0 shadow-lg">
//               <i className="mdi mdi-check-circle me-2"></i>
//               {notification}
//             </Alert>
//           </div>
//         )}

//         {/* Header */}
//         <Card className="header-card mb-4">
//           <CardBody className="py-3">
//             <Row className="align-items-center">
//               <Col md={4}>
//                 <h3 className="mb-0 text-white">
//                   <i className="mdi mdi-camera-burst me-2"></i>
//                   Remote Camera Gallery
//                 </h3>
//               </Col>
//               <Col md={8} className="text-end">
//                 <Button
//                   color="light"
//                   outline
//                   className="me-2"
//                   onClick={handleStageCameraSync}
//                 >
//                   <i className="mdi mdi-sync me-1"></i>
//                   Training Sync
//                 </Button>
//                 <Button
//                   color="light"
//                   onClick={back}
//                 >
//                   <i className="mdi mdi-arrow-left me-1"></i>
//                   Back
//                 </Button>
//               </Col>
//             </Row>
//           </CardBody>
//         </Card>

//         <Row>
//           <Col lg={6}>
//             <Card className="stage-card">
//               <CardHeader className="bg-white border-bottom pb-0">
//                 <div className="capture-btn-container">
//                   <Row className="align-items-center">
//                     <Col md={6}>
//                       <div className="d-flex align-items-center gap-2">
//                         <label className="mb-0 fw-bold" style={{ minWidth: "120px" }}>
//                           Images per Camera:
//                         </label>
//                         <Input
//                           type="number"
//                           min="1"
//                           value={captureCount}
//                           onChange={(e) => setCaptureCount(parseInt(e.target.value))}
//                           style={{ width: "100px" }}
//                           disabled={true}
//                         />
//                       </div>
//                     </Col>
//                     <Col md={6} className="text-end">
//                       <Button
//                         size="lg"
//                         color="success"
//                         className="px-4"
//                         onClick={handleAutoCaptureAll}
//                         disabled={isCapturing}
//                       >
//                         {isCapturing ? (
//                           <>
//                             <Spinner size="sm" className="me-2" />
//                             Capturing...
//                           </>
//                         ) : (
//                           <>
//                             <i className="mdi mdi-camera-burst me-2"></i>
//                             Auto Capture All ({captureCount}x)
//                           </>
//                         )}
//                       </Button>
//                     </Col>
//                   </Row>
//                 </div>
//               </CardHeader>
//               <CardBody className="p-3 gallery-scroll">
//                 {stages.map((stage, stageIndex) => (
//                   <div key={stageIndex} className="mb-5">
//                     <Row className="align-items-center mb-3">
//                       <Col>
//                         <h5 className="mb-0 text-dark">
//                           {stage.stage_name}
//                         </h5>
//                         <small className="text-muted">
//                           Stage Code: {stage.stage_code}
//                         </small>
//                       </Col>
//                       <Col xs="auto">
//                         <Badge color="primary" pill>
//                           {(cameraDevices[stageIndex] || []).filter(d => d !== null).length}/
//                           {(stage?.camera_selection?.cameras || []).length}
//                         </Badge>
//                       </Col>
//                     </Row>
//                     <Row>
//                       {(stage?.camera_selection?.cameras || []).map((camera, camIndex) => {
//                         const videoKey = `${stageIndex}-${camIndex}`;
//                         const deviceId = (cameraDevices[stageIndex] || [])[camIndex];
//                         const hasDevice = !!deviceId;
//                         const isCaptured = captureStatus[videoKey];
//                         const capturedCount = cameraCapturedCounts[videoKey] || 0;

//                         return (
//                           <Col md={6} key={camIndex} className="mb-3">
//                             <Card className={`camera-card ${isCaptured ? "captured" : ""}`}>
//                               <CardHeader className="bg-dark text-white d-flex justify-content-between align-items-center py-2">
//                                 <span className="fw-bold text-truncate" style={{ maxWidth: '150px' }}>
//                                   <i className="mdi mdi-camera me-1"></i>
//                                   {camera.label}
//                                 </span>
//                                 {isCaptured && (
//                                   <Badge color="success" pill>
//                                     <i className="mdi mdi-check"></i>
//                                   </Badge>
//                                 )}
//                               </CardHeader>
//                               <CardBody className="p-0">
//                                 <div className="webcam-container" style={{ height: "220px", position: "relative" }}>
//                                   {hasDevice ? (
//                                     <>
//                                       <WebcamCapture
//                                         ref={(el) => { if (el) webcamRefs.current[camera.originalLabel] = el; }}
//                                         resolution={DEFAULT_RESOLUTION}
//                                         cameraLabel={camera.originalLabel}
//                                         style={{
//                                           position: "absolute",
//                                           top: 0,
//                                           left: 0,
//                                           width: "100%",
//                                           height: "100%",
//                                           objectFit: "cover"
//                                         }}
//                                       />
//                                       <Badge color="success" pill className="camera-status-badge">
//                                         <i className="mdi mdi-circle" style={{ fontSize: "8px" }}></i> Live
//                                       </Badge>

//                                       {/* Always show the badge if there are captured images */}
//                                       {capturedCount >= captureCount && (
//                                         <div
//                                           style={{
//                                             position: "absolute",
//                                             bottom: "10px",
//                                             left: "50%",
//                                             transform: "translateX(-50%)",
//                                             backgroundColor: "rgba(16, 185, 129, 0.95)",
//                                             color: "white",
//                                             padding: "8px 16px",
//                                             borderRadius: "20px",
//                                             fontWeight: "700",
//                                             fontSize: "14px",
//                                             boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
//                                             zIndex: 20,
//                                             display: "flex",
//                                             alignItems: "center",
//                                             gap: "8px"
//                                           }}
//                                         >
//                                           <i className="mdi mdi-check-circle"></i>
//                                           <span>{capturedCount}/{captureCount}</span>
//                                         </div>
//                                       )}

//                                       {/* Show progress during capture */}
//                                       {currentCapturePreview &&
//                                         currentCapturePreview.stageIndex === stageIndex &&
//                                         currentCapturePreview.camIndex === camIndex &&
//                                         capturedCount < captureCount && (
//                                           <div
//                                             style={{
//                                               position: "absolute",
//                                               bottom: "10px",
//                                               left: "50%",
//                                               transform: "translateX(-50%)",
//                                               backgroundColor: "rgba(99, 102, 241, 0.95)",
//                                               color: "white",
//                                               padding: "8px 16px",
//                                               borderRadius: "20px",
//                                               fontWeight: "700",
//                                               fontSize: "14px",
//                                               boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
//                                               zIndex: 20,
//                                               display: "flex",
//                                               alignItems: "center",
//                                               gap: "8px"
//                                             }}
//                                           >
//                                             {currentCapturePreview.status === 'uploading' ? (
//                                               <>
//                                                 <Spinner size="sm" style={{ width: "16px", height: "16px" }} />
//                                                 <span>{currentCapturePreview.captureNum}/{currentCapturePreview.totalCaptures}</span>
//                                               </>
//                                             ) : (
//                                               <>
//                                                 <i className="mdi mdi-check-circle"></i>
//                                                 <span>{currentCapturePreview.captureNum}/{currentCapturePreview.totalCaptures}</span>
//                                               </>
//                                             )}
//                                           </div>
//                                         )}

//                                     </>
//                                   ) : (
//                                     <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
//                                       <i className="mdi mdi-camera-off" style={{ fontSize: "36px" }}></i>
//                                       <small className="mt-1">Not Available</small>
//                                     </div>
//                                   )}
//                                 </div>
//                               </CardBody>
//                             </Card>
//                           </Col>
//                         );
//                       })}
//                     </Row>
//                   </div>
//                 ))}
//               </CardBody>
//             </Card>
//           </Col>

//           <Col lg={6}>
//             <div className="d-flex mb-3" style={{ borderBottom: "2px solid #e9ecef" }}>
//               {stages.map((stage, index) => (
//                 <div
//                   key={stage._id?.$oid || index}
//                   className={`stage-tab ${selectedStage === index ? "active" : ""}`}
//                   onClick={() => setSelectedStage(index)}
//                 >
//                   {stage.stage_name}
//                 </div>
//               ))}
//             </div>

//             {(() => {
//               const byCamera = {};
//               galleryImages.forEach(img => {
//                 const key = (img.camera_label || "").trim();
//                 if (!byCamera[key]) byCamera[key] = [];
//                 byCamera[key].push(img);
//               });

//               const sortedLabels = Object.keys(byCamera).sort((a, b) => a.localeCompare(b));

//               const shownImages =
//                 selectedCameraLabel && byCamera[selectedCameraLabel]
//                   ? byCamera[selectedCameraLabel]
//                   : galleryImages;

//               const allShownIds = shownImages.map(i => i.filename);
//               const allSelected = allShownIds.every(id => selectedImages.has(id));

//               return (
//                 <div
//                   style={{
//                     backgroundColor: "#fff",
//                     borderRadius: "10px",
//                     padding: "16px",
//                     boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//                     height: "calc(100vh - 200px)",
//                     display: "flex",
//                     flexDirection: "column",
//                   }}
//                 >
//                   {/* Header */}
//                   <div style={{ marginBottom: "16px" }}>
//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
//                       <h6 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#111827" }}>
//                         Image Gallery ({galleryImages.length})
//                       </h6>
//                       <Button
//                         size="sm"
//                         onClick={() => loadGalleryImages(selectedStage)}
//                         disabled={loadingGallery}
//                         style={{
//                           backgroundColor: "#6366f1",
//                           border: "none",
//                           borderRadius: "6px",
//                           padding: "4px 12px",
//                           fontSize: "12px",
//                           fontWeight: "500",
//                           color: "#fff",
//                         }}
//                       >
//                         {loadingGallery ? "Loading..." : "Refresh"}
//                       </Button>
//                     </div>

//                     {selectedImages.size > 0 && (
//                       <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
//                         <Button size="sm" color="info" onClick={() => allSelected ? setSelectedImages(new Set()) : setSelectedImages(new Set(allShownIds))}>
//                           {allSelected ? "Deselect All" : "Select All"}
//                         </Button>
//                         <Button size="sm" color="danger" onClick={handleBulkDelete}>
//                           Delete ({selectedImages.size})
//                         </Button>
//                         <Button size="sm" color="secondary" onClick={() => setSelectedImages(new Set())}>
//                           Clear
//                         </Button>
//                       </div>
//                     )}
//                   </div>

//                   {/* Images Grid */}
//                   <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
//                     {loadingGallery ? (
//                       <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af" }}>
//                         <Spinner color="primary" />
//                         <p style={{ fontSize: "14px", marginTop: "12px" }}>Loading images...</p>
//                       </div>
//                     ) : shownImages.length === 0 ? (
//                       <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af" }}>
//                         <p style={{ fontSize: "14px", fontWeight: "500" }}>
//                           {selectedCameraLabel ? `No images for ${selectedCameraLabel}` : "No images captured yet"}
//                         </p>
//                       </div>
//                     ) : (
//                       <Row className="g-3">
//                         {shownImages.map(image => {
//                           const isSelected = selectedImages.has(image.filename);
//                           const isSingleHighlight = !selectedImages.size && previewImage?.filename === image.filename;

//                           return (
//                             <Col key={image.filename} xs={6} md={4}>
//                               <div
//                                 style={{
//                                   position: "relative",
//                                   borderRadius: "8px",
//                                   overflow: "hidden",
//                                   border: isSelected ? "3px solid #6366f1" : isSingleHighlight ? "3px solid #10b981" : "1px solid #e5e7eb",
//                                   cursor: "pointer",
//                                   transition: "all 0.2s ease",
//                                 }}
//                                 onClick={() => setPreviewImage(image)}
//                                 onMouseEnter={e => {
//                                   e.currentTarget.style.transform = "scale(1.05)";
//                                   e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
//                                 }}
//                                 onMouseLeave={e => {
//                                   e.currentTarget.style.transform = "scale(1)";
//                                   e.currentTarget.style.boxShadow = "none";
//                                 }}
//                               >
//                                 <img
//                                   src={`${ImageUrl}${image.insp_local_path}`}
//                                   alt={image.camera_label}
//                                   style={{ width: "100%", height: "120px", objectFit: "cover" }}
//                                   onError={e => (e.target.src = "/fallback.png")}
//                                 />

//                                 {/* Checkbox */}
//                                 <div
//                                   onClick={e => {
//                                     e.stopPropagation();
//                                     toggleImageSelection(image.filename);
//                                   }}
//                                   style={{
//                                     position: "absolute",
//                                     top: "6px",
//                                     left: "6px",
//                                     width: "20px",
//                                     height: "20px",
//                                     borderRadius: "4px",
//                                     backgroundColor: isSelected ? "#6366f1" : "rgba(255,255,255,0.85)",
//                                     border: "2px solid " + (isSelected ? "#6366f1" : "#d1d5db"),
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     cursor: "pointer",
//                                   }}
//                                 >
//                                   {isSelected && <i className="fa fa-check" style={{ color: "#fff", fontSize: "11px" }} />}
//                                 </div>

//                                 {/* Eye Button */}
//                                 <button
//                                   onClick={e => {
//                                     e.stopPropagation();
//                                     setPreviewImage(image);
//                                     setShowPreview(true);
//                                   }}
//                                   style={{
//                                     position: "absolute",
//                                     top: "6px",
//                                     left: "50%",
//                                     transform: "translateX(-50%)",
//                                     backgroundColor: "rgba(99,102,241,0.9)",
//                                     border: "none",
//                                     borderRadius: "50%",
//                                     width: "26px",
//                                     height: "26px",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     cursor: "pointer",
//                                   }}
//                                 >
//                                   <i className="fa fa-eye" style={{ color: "#fff", fontSize: "13px" }} />
//                                 </button>

//                                 {/* Delete Button */}
//                                 <button
//                                   onClick={e => {
//                                     e.stopPropagation();
//                                     handleDeleteImage(image);
//                                   }}
//                                   style={{
//                                     position: "absolute",
//                                     top: "6px",
//                                     right: "6px",
//                                     backgroundColor: "rgba(239,68,68,0.9)",
//                                     border: "none",
//                                     borderRadius: "50%",
//                                     width: "26px",
//                                     height: "26px",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     cursor: "pointer",
//                                   }}
//                                 >
//                                   <i className="fa fa-times" style={{ color: "#fff", fontSize: "13px" }} />
//                                 </button>

//                                 {/* Filename */}
//                                 <div style={{
//                                   position: "absolute",
//                                   bottom: 0,
//                                   left: 0,
//                                   right: 0,
//                                   background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
//                                   padding: "6px 6px 3px",
//                                 }}>
//                                   <p style={{
//                                     margin: 0,
//                                     fontSize: "10px",
//                                     fontWeight: "600",
//                                     color: "#fff",
//                                     textOverflow: "ellipsis",
//                                     overflow: "hidden",
//                                     whiteSpace: "nowrap",
//                                   }}>
//                                     {image.filename}
//                                   </p>
//                                 </div>
//                               </div>
//                             </Col>
//                           );
//                         })}
//                       </Row>
//                     )}
//                   </div>

//                   {/* Single image details */}
//                   {previewImage && selectedImages.size === 0 && (
//                     <div style={{
//                       marginTop: "16px",
//                       padding: "10px",
//                       backgroundColor: "#f9fafb",
//                       borderRadius: "8px",
//                       border: "1px solid #e5e7eb",
//                       fontSize: "12px"
//                     }}>
//                       <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
//                         <strong>{previewImage.camera_label}</strong>
//                         <button onClick={() => setPreviewImage(null)} style={{ background: "none", border: "none", fontSize: "16px" }}>×</button>
//                       </div>
//                       <div style={{ color: "#6b7280" }}>
//                         <div><strong>File:</strong> {previewImage.filename}</div>
//                         <div><strong>Time:</strong> {new Date(previewImage.timestamp).toLocaleString()}</div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })()}
//           </Col>
//         </Row>
//       </Container>

//       {/* Image Preview Modal */}
//       <Modal isOpen={showPreview} toggle={() => setShowPreview(false)} size="lg">
//         <ModalHeader toggle={() => setShowPreview(false)}>
//           {previewImage?.camera_label}
//         </ModalHeader>
//         <ModalBody className="text-center">
//           {previewImage && (
//             <>
//               <img
//                 src={`${ImageUrl}${previewImage.insp_local_path}`}
//                 alt={previewImage.camera_label}
//                 style={{ maxWidth: "100%", maxHeight: "70vh" }}
//               />
//               <div className="mt-3 text-start">
//                 <p><strong>Filename:</strong> {previewImage.filename}</p>
//                 <p><strong>Camera:</strong> {previewImage.camera_label}</p>
//                 <p><strong>Timestamp:</strong> {new Date(previewImage.timestamp).toLocaleString()}</p>
//                 <p><strong>Dimensions:</strong> {previewImage.width} x {previewImage.height}</p>
//               </div>
//             </>
//           )}
//         </ModalBody>
//       </Modal>
//     </div>
//   );
// };

// export default RemoteStg;




// import React, { useEffect, useRef, useState } from "react";
// import Webcam from "react-webcam";
// import WebcamCapture from "pages/WebcamCustom/WebcamCapture";
// import { useLocation, useHistory } from "react-router-dom";
// import urlSocket from "./urlSocket";
// import ImageUrl from "./imageUrl";

// import {
//   Container,
//   Button,
//   Col,
//   Row,
//   Card,
//   CardBody,
//   CardHeader,
//   Badge,
//   Spinner,
//   Alert,
//   Modal,
//   ModalHeader,
//   ModalBody,
//   Input
// } from "reactstrap";
// import Swal from "sweetalert2";
// import { DEFAULT_RESOLUTION } from "./cameraConfig";

// const RemoteStg = () => {
//   const location = useLocation();
//   const history = useHistory();
//   const { datas } = location.state || {};

//   const stages = datas?.stages || [];

//   const [cameraDevices, setCameraDevices] = useState({});
//   const webcamRefs = useRef([]);
//   const [isCapturing, setIsCapturing] = useState(false);
//   const [captureStatus, setCaptureStatus] = useState({});
//   const [notification, setNotification] = useState("");
//   const [selectedCameraLabel, setSelectedCameraLabel] = useState(null);

//   // Capture count state - get from datas
//   const [captureCount, setCaptureCount] = useState(parseInt(datas?.capture_count) || 5);

//   // Gallery states
//   const [galleryImages, setGalleryImages] = useState([]);
//   const [loadingGallery, setLoadingGallery] = useState(false);
//   const [selectedStage, setSelectedStage] = useState(null);
//   const [previewImage, setPreviewImage] = useState(null);
//   const [showPreview, setShowPreview] = useState(false);

//   // Selection state
//   const [selectedImages, setSelectedImages] = useState(new Set());
//   const [selectAll, setSelectAll] = useState(false);

//   // Capture preview state - track stage and camera index
//   const [currentCapturePreview, setCurrentCapturePreview] = useState(null);

//   // Track camera capture counts
//   const [cameraCapturedCounts, setCameraCapturedCounts] = useState({});


//   // Setup camera device IDs
//   useEffect(() => {
//     async function setupCameraDevices() {
//       try {
//         await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
//         const devices = await navigator.mediaDevices.enumerateDevices();

//         const deviceMap = {};

//         for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
//           const stage = stages[stageIndex];
//           const cameras = stage?.camera_selection?.cameras || [];
//           deviceMap[stageIndex] = [];

//           for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
//             const cam = cameras[camIndex];
//             const videoDevice = devices.find((d) => {
//               if (d.kind !== "videoinput") return false;
//               const label = d.label?.toLowerCase() || "";
//               const origLabel = cam.originalLabel?.toLowerCase() || "";
//               const vid = cam.v_id?.toLowerCase() || "";
//               const pid = cam.p_id?.toLowerCase() || "";
//               return (
//                 label.includes(origLabel) ||
//                 label.includes(vid) ||
//                 label.includes(pid)
//               );
//             });

//             if (!videoDevice) {
//               console.warn(`Warning: No matching device for ${cam.label}`);
//               deviceMap[stageIndex].push(null);
//             } else {
//               deviceMap[stageIndex].push(videoDevice.deviceId);
//             }
//           }
//         }

//         setCameraDevices(deviceMap);
//       } catch (error) {
//         console.error("Camera setup failed:", error);
//       }
//     }

//     setupCameraDevices();
//   }, [stages]);

//   // Load gallery images when stage is selected
//   useEffect(() => {
//     if (selectedStage !== null) {
//       loadGalleryImages(selectedStage);
//     }
//   }, [selectedStage]);

//   // Set first stage as default
//   useEffect(() => {
//     if (stages.length > 0) {
//       setSelectedStage(0);
//     }
//   }, [stages]);

//   // Sync selectAll with actual selection
//   useEffect(() => {
//     if (galleryImages.length > 0) {
//       const allSelected = galleryImages.every(img => selectedImages.has(img.filename));
//       setSelectAll(allSelected);
//     } else {
//       setSelectAll(false);
//     }
//   }, [selectedImages, galleryImages]);

//   // Calculate camera captured counts from ALL gallery images (not just selected stage)
//   useEffect(() => {
//     // We need to load all images from all stages to get accurate counts
//     const loadAllCameraCounts = async () => {
//       const counts = {};

//       // Load images for all stages
//       for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
//         const stage = stages[stageIndex];

//         try {
//           const response = await urlSocket.post("/get_training_images", {
//             comp_code: datas.comp_code,
//             stage_code: stage.stage_code
//           });

//           const stageImages = response.data.images || [];
//           const cameras = stage?.camera_selection?.cameras || [];

//           cameras.forEach((camera, camIndex) => {
//             const videoKey = `${stageIndex}-${camIndex}`;

//             // Count images for this camera
//             const cameraImages = stageImages.filter(
//               img => img.camera_label === camera.label
//             );

//             counts[videoKey] = cameraImages.length;
//           });
//         } catch (error) {
//           console.error(`Failed to load images for stage ${stage.stage_name}:`, error);
//         }
//       }

//       setCameraCapturedCounts(counts);
//     };

//     if (stages.length > 0) {
//       loadAllCameraCounts();
//     }
//   }, [stages, datas.comp_code]);

//   const loadGalleryImages = async (stageIndex) => {
//     setLoadingGallery(true);
//     setSelectedImages(new Set());
//     try {
//       const stage = stages[stageIndex];
//       const response = await urlSocket.post("/get_training_images", {
//         comp_code: datas.comp_code,
//         stage_code: stage.stage_code
//       });

//       setGalleryImages(response.data.images || []);
//     } catch (error) {
//       console.error("Failed to load gallery images:", error);
//       setGalleryImages([]);
//     } finally {
//       setLoadingGallery(false);
//     }
//   };

//   const handleDeleteImage = async (image) => {
//     const result = await Swal.fire({
//       title: "Delete Image?",
//       text: "This action cannot be undone",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#dc3545",
//       cancelButtonColor: "#6c757d",
//       confirmButtonText: "Yes, delete it!"
//     });

//     if (result.isConfirmed) {
//       try {
//         const response = await urlSocket.post("/delete_training_image", {
//           filename: image.filename,
//           camera_label: image.camera_label
//         });

//         if (response.data.success) {
//           Swal.fire("Deleted!", "Image has been deleted.", "success");
//           loadGalleryImages(selectedStage);
//         } else {
//           Swal.fire("Error!", "Failed to delete image", "error");
//         }
//       } catch (error) {
//         console.error("Delete error:", error);
//         Swal.fire("Error!", "Failed to delete image", "error");
//       }
//     }
//   };

//   const handleBulkDelete = async () => {
//     if (selectedImages.size === 0) {
//       Swal.fire("No Selection", "Please select at least one image to delete.", "info");
//       return;
//     }

//     const result = await Swal.fire({
//       title: `Delete ${selectedImages.size} Image(s)?`,
//       text: "This action cannot be undone",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#dc3545",
//       cancelButtonColor: "#6c757d",
//       confirmButtonText: "Yes, delete all!"
//     });

//     if (result.isConfirmed) {
//       try {
//         const deletePromises = Array.from(selectedImages).map(filename => {
//           const image = galleryImages.find(img => img.filename === filename);
//           return urlSocket.post("/delete_training_image", {
//             filename,
//             camera_label: image.camera_label
//           });
//         });

//         const responses = await Promise.all(deletePromises);
//         const allSuccess = responses.every(r => r.data.success);

//         if (allSuccess) {
//           Swal.fire("Deleted!", `${selectedImages.size} images deleted.`, "success");
//           loadGalleryImages(selectedStage);
//         } else {
//           Swal.fire("Partial Success", "Some images failed to delete.", "warning");
//         }
//       } catch (error) {
//         console.error("Bulk delete error:", error);
//         Swal.fire("Error!", "Failed to delete selected images.", "error");
//       }
//     }
//   };

//   const toggleImageSelection = (filename) => {
//     const newSelected = new Set(selectedImages);
//     if (newSelected.has(filename)) {
//       newSelected.delete(filename);
//     } else {
//       newSelected.add(filename);
//     }
//     setSelectedImages(newSelected);
//   };

//   const toggleSelectAll = () => {
//     if (selectAll) {
//       setSelectedImages(new Set());
//     } else {
//       const allFilenames = galleryImages.map(img => img.filename);
//       setSelectedImages(new Set(allFilenames));
//     }
//   };

//   const showNotification = (message) => {
//     setNotification(message);
//     setTimeout(() => setNotification(""), 3000);
//   };

//   const dataURLtoBlob = (dataURL) => {
//     const arr = dataURL.split(",");
//     const mime = arr[0].match(/:(.*?);/)[1];
//     const bstr = atob(arr[1]);
//     let n = bstr.length;
//     const u8arr = new Uint8Array(n);
//     while (n--) u8arr[n] = bstr.charCodeAt(n);
//     return new Blob([u8arr], { type: mime });
//   };

//   // Sequential capture with count and image preview
//   // const handleAutoCaptureAll = async () => {
//   //   if (isCapturing) return;

//   //   // Validate capture count
//   //   if (!captureCount || captureCount < 1) {
//   //     Swal.fire("Invalid Count", "Please enter a valid capture count (minimum 1)", "warning");
//   //     return;
//   //   }

//   //   // Check if any camera will exceed the limit
//   //   let willExceedLimit = false;
//   //   let exceedDetails = "";
//   //   const maxAllowed = captureCount; // or replace with a fixed number if desired


//   //   for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
//   //     const stage = stages[stageIndex];
//   //     const cameras = stage?.camera_selection?.cameras || [];

//   //     for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
//   //       const camera = cameras[camIndex];
//   //       const videoKey = `${stageIndex}-${camIndex}`;
//   //       const currentCount = cameraCapturedCounts[videoKey] || 0;

//   //       // ✅ FIXED: Compare against maxAllowed, not captureCount
//   //       if (currentCount + captureCount > maxAllowed) {
//   //         willExceedLimit = true;
//   //         exceedDetails = `Camera "${camera.label}" already has ${currentCount} images. Cannot capture ${captureCount} more (max: ${maxAllowed})`;
//   //         break;
//   //       }
//   //     }
//   //     if (willExceedLimit) break;
//   //   }


//   //   if (willExceedLimit) {
//   //     Swal.fire({
//   //       title: "Capture Limit Exceeded",
//   //       text: `Admin does not allow capturing more than ${captureCount} images per camera. ${exceedDetails}`,
//   //       icon: "error",
//   //       confirmButtonColor: "#dc3545",
//   //       confirmButtonText: "OK"
//   //     });
//   //     return;
//   //   }

//   //   setIsCapturing(true);
//   //   setCaptureStatus({});
//   //   setCurrentCapturePreview(null);

//   //   try {
//   //     // Loop through each stage
//   //     for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
//   //       const stage = stages[stageIndex];
//   //       const cameras = stage?.camera_selection?.cameras || [];
//   //       const devices = cameraDevices[stageIndex] || [];

//   //       // Loop through each camera in the stage
//   //       for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
//   //         const camera = cameras[camIndex];
//   //         const webcamInstance = webcamRefs.current[camera.originalLabel];
//   //         const videoKey = `${stageIndex}-${camIndex}`;
//   //         const currentCount = cameraCapturedCounts[videoKey] || 0;

//   //         if (!webcamInstance || !devices[camIndex]) {
//   //           console.warn(`Camera not available: ${camera.label}`);
//   //           continue;
//   //         }

//   //         // Check if this camera has reached the limit
//   //         if (currentCount >= captureCount) {
//   //           console.log(`Camera ${camera.label} already has ${currentCount} images (limit: ${captureCount})`);
//   //           continue;
//   //         }

//   //         // Calculate how many more images can be captured
//   //         const remainingCaptures = captureCount - currentCount;
//   //         const capturesToTake = Math.min(captureCount, remainingCaptures);

//   //         // Capture images for this camera
//   //         for (let captureNum = 1; captureNum <= capturesToTake; captureNum++) {
//   //           await new Promise((res) => setTimeout(res, 300)); // Wait to ensure camera is ready

//   //           const base64Image = webcamInstance.captureZoomedImage();

//   //           if (!base64Image) {
//   //             console.warn(`Failed to capture from ${camera.label}`);
//   //             continue;
//   //           }

//   //           // Update the capture status and preview
//   //           setCaptureStatus((prev) => ({
//   //             ...prev,
//   //             [videoKey]: true,
//   //           }));

//   //           // Show captured image preview
//   //           setCurrentCapturePreview({
//   //             image: base64Image,
//   //             captureNum: currentCount + captureNum,
//   //             totalCaptures: captureCount,
//   //             stageName: stage.stage_name,
//   //             stageIndex: stageIndex,
//   //             camIndex: camIndex,
//   //             cameraLabel: camera.label,
//   //             status: 'uploading'
//   //           });

//   //           const blob = dataURLtoBlob(base64Image);
//   //           const fileName = `${stage.stage_name}_${camera.label}_${Date.now()}.png`;

//   //           const formData = new FormData();
//   //           formData.append("comp_name", datas.comp_name);
//   //           formData.append("comp_id", datas.comp_id);
//   //           formData.append("comp_code", datas.comp_code);
//   //           formData.append("stage_name", stage.stage_name);
//   //           formData.append("stage_code", stage.stage_code);
//   //           formData.append("img_0", blob, fileName);
//   //           formData.append("img_0_label", camera.label);

//   //           // Upload image to server
//   //           try {
//   //             const response = await urlSocket.post("/remoteMultiCapture_sequential", formData);
//   //             console.log("Uploaded:", response.data);

//   //             if (response.data.error) {
//   //               setCurrentCapturePreview(null);
//   //               Swal.fire({
//   //                 title: "Error",
//   //                 text: response.data.error,
//   //                 icon: "error",
//   //                 confirmButtonText: "OK",
//   //                 confirmButtonColor: "#dc3545",
//   //               });
//   //               setIsCapturing(false);
//   //               return;
//   //             }

//   //             // Update status to success
//   //             setCurrentCapturePreview(prev => ({ ...prev, status: 'success' }));
//   //             await new Promise(res => setTimeout(res, 500)); // Show success briefly

//   //             // Update the camera count immediately
//   //             setCameraCapturedCounts(prev => ({
//   //               ...prev,
//   //               [videoKey]: (prev[videoKey] || 0) + 1
//   //             }));

//   //           } catch (error) {
//   //             console.error("Upload error:", error);
//   //             setCurrentCapturePreview(null);
//   //             Swal.fire({
//   //               title: "Upload Error",
//   //               text: `Failed to upload image ${captureNum} for ${camera.label}`,
//   //               icon: "error",
//   //               confirmButtonText: "OK",
//   //               confirmButtonColor: "#dc3545",
//   //             });
//   //             setIsCapturing(false);
//   //             return;
//   //           }
//   //         }

//   //         // Reset capture status for this camera after all captures
//   //         setCaptureStatus((prev) => ({
//   //           ...prev,
//   //           [videoKey]: false,
//   //         }));
//   //       }
//   //     }

//   //     // Final success message
//   //     setCurrentCapturePreview(null);
//   //     const totalCaptured = stages.reduce((sum, stage) => sum + (stage?.camera_selection?.cameras?.length || 0), 0) * captureCount;
//   //     showNotification(`All images captured successfully! Total: ${totalCaptured} images`);

//   //     if (selectedStage !== null) {
//   //       loadGalleryImages(selectedStage);
//   //     }
//   //   } catch (error) {
//   //     console.error("Capture error:", error);
//   //     setCurrentCapturePreview(null);
//   //     Swal.fire({
//   //       title: "Error!",
//   //       text: "An error occurred while capturing images.",
//   //       icon: "error",
//   //       confirmButtonText: "Try Again",
//   //       confirmButtonColor: "#dc3545",
//   //     });
//   //   } finally {
//   //     setIsCapturing(false);
//   //     setCaptureStatus({});
//   //   }
//   // };

//   const handleAutoCaptureAll = async () => {
//     if (isCapturing) return;

//     if (!captureCount || captureCount < 1) {
//       Swal.fire("Invalid Count", "Please enter a valid capture count (minimum 1)", "warning");
//       return;
//     }

//     setIsCapturing(true);
//     setCaptureStatus({});
//     setCurrentCapturePreview(null);

//     try {
//       for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
//         const stage = stages[stageIndex];
//         const cameras = stage?.camera_selection?.cameras || [];
//         const devices = cameraDevices[stageIndex] || [];

//         for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
//           const camera = cameras[camIndex];
//           const webcamInstance = webcamRefs.current[camera.originalLabel];
//           const videoKey = `${stageIndex}-${camIndex}`;
//           const currentCount = cameraCapturedCounts[videoKey] || 0;

//           // ✅ Skip only this camera if it’s already at the limit
//           if (currentCount >= captureCount) {
//             console.log(`Skipping ${camera.label} (already ${currentCount}/${captureCount})`);
//             continue;
//           }

//           // ✅ Capture only for cameras that can still take images
//           const remainingCaptures = captureCount - currentCount;
//           const capturesToTake = Math.min(captureCount, remainingCaptures);

//           for (let captureNum = 1; captureNum <= capturesToTake; captureNum++) {
//             await new Promise((res) => setTimeout(res, 300));

//             const base64Image = webcamInstance.captureZoomedImage();
//             if (!base64Image) continue;

//             setCurrentCapturePreview({
//               image: base64Image,
//               captureNum: currentCount + captureNum,
//               totalCaptures: captureCount,
//               stageName: stage.stage_name,
//               stageIndex,
//               camIndex,
//               cameraLabel: camera.label,
//               status: "uploading",
//             });

//             const blob = dataURLtoBlob(base64Image);
//             const fileName = `${stage.stage_name}_${camera.label}_${Date.now()}.png`;

//             const formData = new FormData();
//             formData.append("comp_name", datas.comp_name);
//             formData.append("comp_id", datas.comp_id);
//             formData.append("comp_code", datas.comp_code);
//             formData.append("stage_name", stage.stage_name);
//             formData.append("stage_code", stage.stage_code);
//             formData.append("img_0", blob, fileName);
//             formData.append("img_0_label", camera.label);

//             try {
//               const response = await urlSocket.post("/remoteMultiCapture_sequential", formData);
//               console.log("Uploaded:", response.data);

//               setCurrentCapturePreview(prev => ({ ...prev, status: "success" }));
//               await new Promise(res => setTimeout(res, 500));

//               setCameraCapturedCounts(prev => ({
//                 ...prev,
//                 [videoKey]: (prev[videoKey] || 0) + 1,
//               }));
//             } catch (err) {
//               console.error("Upload error:", err);
//               Swal.fire("Upload Error", `Failed to upload image for ${camera.label}`, "error");
//               continue;
//             }
//           }

//           // After all captures for this camera
//           setCaptureStatus(prev => ({ ...prev, [videoKey]: false }));
//         }
//       }

//       showNotification("Capture completed successfully!");
//       if (selectedStage) loadGalleryImages(selectedStage);

//     } catch (error) {
//       console.error("Capture error:", error);
//       Swal.fire("Error!", "An error occurred while capturing images.", "error");
//     } finally {
//       setIsCapturing(false);
//       setCaptureStatus({});
//       setCurrentCapturePreview(null);
//     }
//   };


//   const handleStageCameraSync = async () => {
//     try {
//       const res = await urlSocket.post("/sync_training_mode_result_train");
//       Swal.fire({
//         title: "Sync Complete!",
//         text: `Total Synced: ${res.data.count}`,
//         icon: "success",
//         confirmButtonColor: "#28a745"
//       });
//     } catch (err) {
//       console.error("Error:", err);
//       Swal.fire({
//         title: "Sync Failed!",
//         text: "Failed to sync training results.",
//         icon: "error",
//         confirmButtonColor: "#dc3545"
//       });
//     }
//   };

//   const back = () => history.goBack();

//   return (
//     <div className="page-content" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
//       <style>
//         {`
//           .camera-card {
//             transition: all 0.3s ease;
//             border: none;
//             box-shadow: 0 2px 8px rgba(0,0,0,0.08);
//           }
//           .camera-card:hover {
//             transform: translateY(-4px);
//             box-shadow: 0 8px 16px rgba(0,0,0,0.12);
//           }
//           .camera-card.captured {
//             border: 2px solid #28a745 !important;
//           }
//           .stage-card {
//             border: none;
//             box-shadow: 0 4px 12px rgba(0,0,0,0.1);
//             height: calc(100vh - 200px);
//             display: flex;
//             flex-direction: column;
//           }
//           .header-card {
//             background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//             color: white;
//             border: none;
//             box-shadow: 0 4px 12px rgba(0,0,0,0.15);
//           }
//           .webcam-container {
//             position: relative;
//             overflow: hidden;
//             border-radius: 8px;
//             background: #000;
//           }
//           .camera-status-badge {
//             position: absolute;
//             top: 10px;
//             right: 10px;
//             z-index: 10;
//           }
//           .gallery-image {
//             width: 100%;
//             height: 180px;
//             object-fit: cover;
//             cursor: pointer;
//             transition: transform 0.2s;
//             border-radius: 8px;
//           }
//           .gallery-image:hover {
//             transform: scale(1.05);
//           }
//           .gallery-item {
//             position: relative;
//             margin-bottom: 1rem;
//             border: 2px solid transparent;
//             border-radius: 10px;
//             transition: border 0.2s;
//           }
//           .gallery-item.selected {
//             border-color: #007bff;
//           }
//           .gallery-item:hover {
//             border-color: #dee2e6;
//           }
//           .delete-btn {
//             position: absolute;
//             top: 8px;
//             right: 8px;
//             z-index: 10;
//             background: rgba(220, 53, 69, 0.9);
//             border: none;
//             border-radius: 50%;
//             width: 32px;
//             height: 32px;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             box-shadow: 0 2px 6px rgba(0,0,0,0.2);
//           }
//           .gallery-scroll {
//             flex: 1;
//             overflow-y: auto;
//             padding-right: 8px;
//           }
//           .gallery-scroll::-webkit-scrollbar {
//             width: 6px;
//           }
//           .gallery-scroll::-webkit-scrollbar-thumb {
//             background-color: rgba(0,0,0,.3);
//             border-radius: 3px;
//           }
//           .stage-tab {
//             cursor: pointer;
//             transition: all 0.3s;
//             padding: 10px 20px;
//             border-radius: 8px 8px 0 0;
//             background: #e9ecef;
//             margin-right: 5px;
//           }
//           .stage-tab.active {
//             background: white;
//             font-weight: bold;
//             box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
//           }
//           .stage-tab:hover {
//             background: #dee2e6;
//           }
//           .capture-btn-container {
//             position: sticky;
//             top: 0;
//             background: white;
//             z-index: 10;
//             padding: 1rem 0;
//             border-bottom: 1px solid #dee2e6;
//             margin-bottom: 1rem;
//           }
//           .checkbox-container {
//             position: absolute;
//             top: 8px;
//             left: 8px;
//             z-index: 10;
//             background: rgba(255, 255, 255, 0.9);
//             border-radius: 4px;
//             padding: 2px;
//           }
//         `}
//       </style>

//       <Container fluid>
//         {/* Notification Toast */}
//         {notification && (
//           <div
//             style={{
//               position: "fixed",
//               top: "20px",
//               right: "20px",
//               zIndex: 9999,
//               maxWidth: "300px"
//             }}
//           >
//             <Alert color="success" className="mb-0 shadow-lg">
//               <i className="mdi mdi-check-circle me-2"></i>
//               {notification}
//             </Alert>
//           </div>
//         )}

//         {/* Header */}
//         <Card className="header-card mb-4">
//           <CardBody className="py-3">
//             <Row className="align-items-center">
//               <Col md={4}>
//                 <h3 className="mb-0 text-white">
//                   <i className="mdi mdi-camera-burst me-2"></i>
//                   Remote Camera Gallery
//                 </h3>
//               </Col>
//               <Col md={8} className="text-end">
//                 <Button
//                   color="light"
//                   outline
//                   className="me-2"
//                   onClick={handleStageCameraSync}
//                 >
//                   <i className="mdi mdi-sync me-1"></i>
//                   Training Sync
//                 </Button>
//                 <Button
//                   color="light"
//                   onClick={back}
//                 >
//                   <i className="mdi mdi-arrow-left me-1"></i>
//                   Back
//                 </Button>
//               </Col>
//             </Row>
//           </CardBody>
//         </Card>

//         <Row>
//           <Col lg={6}>
//             <Card className="stage-card">
//               <CardHeader className="bg-white border-bottom pb-0">
//                 <div className="capture-btn-container">
//                   <Row className="align-items-center">
//                     <Col md={6}>
//                       <div className="d-flex align-items-center gap-2">
//                         <label className="mb-0 fw-bold" style={{ minWidth: "120px" }}>
//                           Images per Camera:
//                         </label>
//                         <Input
//                           type="number"
//                           min="1"
//                           value={captureCount}
//                           onChange={(e) => setCaptureCount(parseInt(e.target.value))}
//                           style={{ width: "100px" }}
//                           disabled={true}
//                         />
//                       </div>
//                     </Col>
//                     <Col md={6} className="text-end">
//                       <Button
//                         size="lg"
//                         color="success"
//                         className="px-4"
//                         onClick={handleAutoCaptureAll}
//                         disabled={isCapturing}
//                       >
//                         {isCapturing ? (
//                           <>
//                             <Spinner size="sm" className="me-2" />
//                             Capturing...
//                           </>
//                         ) : (
//                           <>
//                             <i className="mdi mdi-camera-burst me-2"></i>
//                             Auto Capture All ({captureCount}x)
//                           </>
//                         )}
//                       </Button>
//                     </Col>
//                   </Row>
//                 </div>
//               </CardHeader>
//               <CardBody className="p-3 gallery-scroll">
//                 {stages.map((stage, stageIndex) => (
//                   <div key={stageIndex} className="mb-5">
//                     <Row className="align-items-center mb-3">
//                       <Col>
//                         <h5 className="mb-0 text-dark">
//                           {stage.stage_name}
//                         </h5>
//                         <small className="text-muted">
//                           Stage Code: {stage.stage_code}
//                         </small>
//                       </Col>
//                       <Col xs="auto">
//                         <Badge color="primary" pill>
//                           {(cameraDevices[stageIndex] || []).filter(d => d !== null).length}/
//                           {(stage?.camera_selection?.cameras || []).length}
//                         </Badge>
//                       </Col>
//                     </Row>
//                     <Row>
//                       {(stage?.camera_selection?.cameras || []).map((camera, camIndex) => {
//                         const videoKey = `${stageIndex}-${camIndex}`;
//                         const deviceId = (cameraDevices[stageIndex] || [])[camIndex];
//                         const hasDevice = !!deviceId;
//                         const isCaptured = captureStatus[videoKey];
//                         const capturedCount = cameraCapturedCounts[videoKey] || 0;

//                         return (
//                           <Col md={6} key={camIndex} className="mb-3">
//                             <Card className={`camera-card ${isCaptured ? "captured" : ""}`}>
//                               <CardHeader className="bg-dark text-white d-flex justify-content-between align-items-center py-2">
//                                 <span className="fw-bold text-truncate" style={{ maxWidth: '150px' }}>
//                                   <i className="mdi mdi-camera me-1"></i>
//                                   {camera.label}
//                                 </span>
//                                 {isCaptured && (
//                                   <Badge color="success" pill>
//                                     <i className="mdi mdi-check"></i>
//                                   </Badge>
//                                 )}
//                               </CardHeader>
//                               <CardBody className="p-0">
//                                 <div className="webcam-container" style={{ height: "220px", position: "relative" }}>
//                                   {hasDevice ? (
//                                     <>
//                                       <WebcamCapture
//                                         ref={(el) => { if (el) webcamRefs.current[camera.originalLabel] = el; }}
//                                         resolution={DEFAULT_RESOLUTION}
//                                         cameraLabel={camera.originalLabel}
//                                         style={{
//                                           position: "absolute",
//                                           top: 0,
//                                           left: 0,
//                                           width: "100%",
//                                           height: "100%",
//                                           objectFit: "cover"
//                                         }}
//                                       />
//                                       <Badge color="success" pill className="camera-status-badge">
//                                         <i className="mdi mdi-circle" style={{ fontSize: "8px" }}></i> Live
//                                       </Badge>

//                                       {/* Always show the badge if there are captured images */}
//                                       {capturedCount >= captureCount && (
//                                         <div
//                                           style={{
//                                             position: "absolute",
//                                             bottom: "10px",
//                                             left: "50%",
//                                             transform: "translateX(-50%)",
//                                             backgroundColor: "rgba(16, 185, 129, 0.95)",
//                                             color: "white",
//                                             padding: "8px 16px",
//                                             borderRadius: "20px",
//                                             fontWeight: "700",
//                                             fontSize: "14px",
//                                             boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
//                                             zIndex: 20,
//                                             display: "flex",
//                                             alignItems: "center",
//                                             gap: "8px"
//                                           }}
//                                         >
//                                           <i className="mdi mdi-check-circle"></i>
//                                           <span>{capturedCount}/{captureCount}</span>
//                                         </div>
//                                       )}

//                                       {/* Show progress during capture */}
//                                       {currentCapturePreview &&
//                                         currentCapturePreview.stageIndex === stageIndex &&
//                                         currentCapturePreview.camIndex === camIndex &&
//                                         capturedCount < captureCount && (
//                                           <div
//                                             style={{
//                                               position: "absolute",
//                                               bottom: "10px",
//                                               left: "50%",
//                                               transform: "translateX(-50%)",
//                                               backgroundColor: "rgba(99, 102, 241, 0.95)",
//                                               color: "white",
//                                               padding: "8px 16px",
//                                               borderRadius: "20px",
//                                               fontWeight: "700",
//                                               fontSize: "14px",
//                                               boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
//                                               zIndex: 20,
//                                               display: "flex",
//                                               alignItems: "center",
//                                               gap: "8px"
//                                             }}
//                                           >
//                                             {currentCapturePreview.status === 'uploading' ? (
//                                               <>
//                                                 <Spinner size="sm" style={{ width: "16px", height: "16px" }} />
//                                                 <span>{currentCapturePreview.captureNum}/{currentCapturePreview.totalCaptures}</span>
//                                               </>
//                                             ) : (
//                                               <>
//                                                 <i className="mdi mdi-check-circle"></i>
//                                                 <span>{currentCapturePreview.captureNum}/{currentCapturePreview.totalCaptures}</span>
//                                               </>
//                                             )}
//                                           </div>
//                                         )}

//                                     </>
//                                   ) : (
//                                     <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
//                                       <i className="mdi mdi-camera-off" style={{ fontSize: "36px" }}></i>
//                                       <small className="mt-1">Not Available</small>
//                                     </div>
//                                   )}
//                                 </div>
//                               </CardBody>
//                             </Card>
//                           </Col>
//                         );
//                       })}
//                     </Row>
//                   </div>
//                 ))}
//               </CardBody>
//             </Card>
//           </Col>

//           <Col lg={6}>
//             <div className="d-flex mb-3" style={{ borderBottom: "2px solid #e9ecef" }}>
//               {stages.map((stage, index) => (
//                 <div
//                   key={stage._id?.$oid || index}
//                   className={`stage-tab ${selectedStage === index ? "active" : ""}`}
//                   onClick={() => setSelectedStage(index)}
//                 >
//                   {stage.stage_name}
//                 </div>
//               ))}
//             </div>

//             {(() => {
//               const byCamera = {};
//               galleryImages.forEach(img => {
//                 const key = (img.camera_label || "").trim();
//                 if (!byCamera[key]) byCamera[key] = [];
//                 byCamera[key].push(img);
//               });

//               const sortedLabels = Object.keys(byCamera).sort((a, b) => a.localeCompare(b));

//               const shownImages =
//                 selectedCameraLabel && byCamera[selectedCameraLabel]
//                   ? byCamera[selectedCameraLabel]
//                   : galleryImages;

//               const allShownIds = shownImages.map(i => i.filename);
//               const allSelected = allShownIds.every(id => selectedImages.has(id));

//               return (
//                 <div
//                   style={{
//                     backgroundColor: "#fff",
//                     borderRadius: "10px",
//                     padding: "16px",
//                     boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//                     height: "calc(100vh - 200px)",
//                     display: "flex",
//                     flexDirection: "column",
//                   }}
//                 >
//                   {/* Header */}
//                   <div style={{ marginBottom: "16px" }}>
//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
//                       <h6 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#111827" }}>
//                         Image Gallery ({galleryImages.length})
//                       </h6>
//                       <Button
//                         size="sm"
//                         onClick={() => loadGalleryImages(selectedStage)}
//                         disabled={loadingGallery}
//                         style={{
//                           backgroundColor: "#6366f1",
//                           border: "none",
//                           borderRadius: "6px",
//                           padding: "4px 12px",
//                           fontSize: "12px",
//                           fontWeight: "500",
//                           color: "#fff",
//                         }}
//                       >
//                         {loadingGallery ? "Loading..." : "Refresh"}
//                       </Button>
//                     </div>

//                     {selectedImages.size > 0 && (
//                       <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
//                         <Button size="sm" color="info" onClick={() => allSelected ? setSelectedImages(new Set()) : setSelectedImages(new Set(allShownIds))}>
//                           {allSelected ? "Deselect All" : "Select All"}
//                         </Button>
//                         <Button size="sm" color="danger" onClick={handleBulkDelete}>
//                           Delete ({selectedImages.size})
//                         </Button>
//                         <Button size="sm" color="secondary" onClick={() => setSelectedImages(new Set())}>
//                           Clear
//                         </Button>
//                       </div>
//                     )}
//                   </div>

//                   {/* Images Grid */}
//                   <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
//                     {loadingGallery ? (
//                       <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af" }}>
//                         <Spinner color="primary" />
//                         <p style={{ fontSize: "14px", marginTop: "12px" }}>Loading images...</p>
//                       </div>
//                     ) : shownImages.length === 0 ? (
//                       <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af" }}>
//                         <p style={{ fontSize: "14px", fontWeight: "500" }}>
//                           {selectedCameraLabel ? `No images for ${selectedCameraLabel}` : "No images captured yet"}
//                         </p>
//                       </div>
//                     ) : (
//                       <Row className="g-3">
//                         {shownImages.map(image => {
//                           const isSelected = selectedImages.has(image.filename);
//                           const isSingleHighlight = !selectedImages.size && previewImage?.filename === image.filename;

//                           return (
//                             <Col key={image.filename} xs={6} md={4}>
//                               <div
//                                 style={{
//                                   position: "relative",
//                                   borderRadius: "8px",
//                                   overflow: "hidden",
//                                   border: isSelected ? "3px solid #6366f1" : isSingleHighlight ? "3px solid #10b981" : "1px solid #e5e7eb",
//                                   cursor: "pointer",
//                                   transition: "all 0.2s ease",
//                                 }}
//                                 onClick={() => setPreviewImage(image)}
//                                 onMouseEnter={e => {
//                                   e.currentTarget.style.transform = "scale(1.05)";
//                                   e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
//                                 }}
//                                 onMouseLeave={e => {
//                                   e.currentTarget.style.transform = "scale(1)";
//                                   e.currentTarget.style.boxShadow = "none";
//                                 }}
//                               >
//                                 <img
//                                   src={`${ImageUrl}${image.insp_local_path}`}
//                                   alt={image.camera_label}
//                                   style={{ width: "100%", height: "120px", objectFit: "cover" }}
//                                   onError={e => (e.target.src = "/fallback.png")}
//                                 />

//                                 {/* Checkbox */}
//                                 <div
//                                   onClick={e => {
//                                     e.stopPropagation();
//                                     toggleImageSelection(image.filename);
//                                   }}
//                                   style={{
//                                     position: "absolute",
//                                     top: "6px",
//                                     left: "6px",
//                                     width: "20px",
//                                     height: "20px",
//                                     borderRadius: "4px",
//                                     backgroundColor: isSelected ? "#6366f1" : "rgba(255,255,255,0.85)",
//                                     border: "2px solid " + (isSelected ? "#6366f1" : "#d1d5db"),
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     cursor: "pointer",
//                                   }}
//                                 >
//                                   {isSelected && <i className="fa fa-check" style={{ color: "#fff", fontSize: "11px" }} />}
//                                 </div>

//                                 {/* Eye Button */}
//                                 <button
//                                   onClick={e => {
//                                     e.stopPropagation();
//                                     setPreviewImage(image);
//                                     setShowPreview(true);
//                                   }}
//                                   style={{
//                                     position: "absolute",
//                                     top: "6px",
//                                     left: "50%",
//                                     transform: "translateX(-50%)",
//                                     backgroundColor: "rgba(99,102,241,0.9)",
//                                     border: "none",
//                                     borderRadius: "50%",
//                                     width: "26px",
//                                     height: "26px",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     cursor: "pointer",
//                                   }}
//                                 >
//                                   <i className="fa fa-eye" style={{ color: "#fff", fontSize: "13px" }} />
//                                 </button>

//                                 {/* Delete Button */}
//                                 <button
//                                   onClick={e => {
//                                     e.stopPropagation();
//                                     handleDeleteImage(image);
//                                   }}
//                                   style={{
//                                     position: "absolute",
//                                     top: "6px",
//                                     right: "6px",
//                                     backgroundColor: "rgba(239,68,68,0.9)",
//                                     border: "none",
//                                     borderRadius: "50%",
//                                     width: "26px",
//                                     height: "26px",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     cursor: "pointer",
//                                   }}
//                                 >
//                                   <i className="fa fa-times" style={{ color: "#fff", fontSize: "13px" }} />
//                                 </button>

//                                 {/* Filename */}
//                                 <div style={{
//                                   position: "absolute",
//                                   bottom: 0,
//                                   left: 0,
//                                   right: 0,
//                                   background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
//                                   padding: "6px 6px 3px",
//                                 }}>
//                                   <p style={{
//                                     margin: 0,
//                                     fontSize: "10px",
//                                     fontWeight: "600",
//                                     color: "#fff",
//                                     textOverflow: "ellipsis",
//                                     overflow: "hidden",
//                                     whiteSpace: "nowrap",
//                                   }}>
//                                     {image.filename}
//                                   </p>
//                                 </div>
//                               </div>
//                             </Col>
//                           );
//                         })}
//                       </Row>
//                     )}
//                   </div>

//                   {/* Single image details */}
//                   {previewImage && selectedImages.size === 0 && (
//                     <div style={{
//                       marginTop: "16px",
//                       padding: "10px",
//                       backgroundColor: "#f9fafb",
//                       borderRadius: "8px",
//                       border: "1px solid #e5e7eb",
//                       fontSize: "12px"
//                     }}>
//                       <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
//                         <strong>{previewImage.camera_label}</strong>
//                         <button onClick={() => setPreviewImage(null)} style={{ background: "none", border: "none", fontSize: "16px" }}>×</button>
//                       </div>
//                       <div style={{ color: "#6b7280" }}>
//                         <div><strong>File:</strong> {previewImage.filename}</div>
//                         <div><strong>Time:</strong> {new Date(previewImage.timestamp).toLocaleString()}</div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })()}
//           </Col>
//         </Row>
//       </Container>

//       {/* Image Preview Modal */}
//       <Modal isOpen={showPreview} toggle={() => setShowPreview(false)} size="lg">
//         <ModalHeader toggle={() => setShowPreview(false)}>
//           {previewImage?.camera_label}
//         </ModalHeader>
//         <ModalBody className="text-center">
//           {previewImage && (
//             <>
//               <img
//                 src={`${ImageUrl}${previewImage.insp_local_path}`}
//                 alt={previewImage.camera_label}
//                 style={{ maxWidth: "100%", maxHeight: "70vh" }}
//               />
//               <div className="mt-3 text-start">
//                 <p><strong>Filename:</strong> {previewImage.filename}</p>
//                 <p><strong>Camera:</strong> {previewImage.camera_label}</p>
//                 <p><strong>Timestamp:</strong> {new Date(previewImage.timestamp).toLocaleString()}</p>
//                 <p><strong>Dimensions:</strong> {previewImage.width} x {previewImage.height}</p>
//               </div>
//             </>
//           )}
//         </ModalBody>
//       </Modal>
//     </div>
//   );
// };

// export default RemoteStg;


import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
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
import { DEFAULT_RESOLUTION } from "./cameraConfig";
import './index.css';

const RemoteStg = () => {
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
  const [selectAll, setSelectAll] = useState(false);

  const [currentCapturePreview, setCurrentCapturePreview] = useState(null);

  const [cameraCapturedCounts, setCameraCapturedCounts] = useState({});


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
    if (selectedStage !== null) loadGalleryImages(selectedStage);
  }, [selectedStage]);

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

        // ---- UPDATE COUNT IMMEDIATELY ----
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

        // Refresh gallery
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

    // ---- UPDATE ALL COUNTS ----
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

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(galleryImages.map((i) => i.filename)));
    }
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


  // const handleAutoCaptureAll = async () => {
  //   if (isCapturing) return;
  //   if (!captureCount || captureCount < 1) {
  //     Swal.fire("Invalid Count", "Enter a count ≥ 1", "warning");
  //     return;
  //   }

  //   let blocked = false;
  //   let blockMsg = "";
  //   for (let s = 0; s < stages.length && !blocked; s++) {
  //     const cams = stages[s]?.camera_selection?.cameras || [];
  //     for (let c = 0; c < cams.length; c++) {
  //       const key = `${s}-${c}`;
  //       const cur = cameraCapturedCounts[key] || 0;
  //       if (cur >= captureCount) {
  //         blocked = true;
  //         blockMsg = `${cams[c].label} already has ${cur}/${captureCount} images.`;
  //         break;
  //       }
  //     }
  //   }
  //   if (blocked) {
  //     await Swal.fire({
  //       title: "Capture Limit Reached",
  //       text: `Admin limit is ${captureCount} per camera. ${blockMsg}`,
  //       icon: "error",
  //       confirmButtonColor: "#dc3545",
  //     });
  //     return;
  //   }

  //   setIsCapturing(true);
  //   setCaptureStatus({});
  //   setCurrentCapturePreview(null);

  //   try {
  //     for (let s = 0; s < stages.length; s++) {
  //       const stage = stages[s];
  //       const cams = stage?.camera_selection?.cameras || [];
  //       const devIds = cameraDevices[s] || [];

  //       for (let c = 0; c < cams.length; c++) {
  //         const cam = cams[c];
  //         const key = `${s}-${c}`;
  //         const cur = cameraCapturedCounts[key] || 0;

  //         // skip if already at limit (double-check)
  //         if (cur >= captureCount) continue;

  //         const webcam = webcamRefs.current[cam.originalLabel];
  //         if (!webcam || !devIds[c]) continue;

  //         const remaining = captureCount - cur;
  //         const toTake = Math.min(captureCount, remaining);

  //         for (let n = 1; n <= toTake; n++) {
  //           await new Promise((r) => setTimeout(r, 300));
  //           const b64 = webcam.captureZoomedImage?.();
  //           if (!b64) continue;

  //           setCurrentCapturePreview({
  //             image: b64,
  //             captureNum: cur + n,
  //             totalCaptures: captureCount,
  //             stageName: stage.stage_name,
  //             stageIndex: s,
  //             camIndex: c,
  //             cameraLabel: cam.label,
  //             status: "uploading",
  //           });

  //           const blob = dataURLtoBlob(b64);
  //           const fileName = `${stage.stage_name}_${cam.label}_${Date.now()}.png`;
  //           const fd = new FormData();
  //           fd.append("comp_name", datas.comp_name);
  //           fd.append("comp_id", datas.comp_id);
  //           fd.append("comp_code", datas.comp_code);
  //           fd.append("stage_name", stage.stage_name);
  //           fd.append("stage_code", stage.stage_code);
  //           fd.append("img_0", blob, fileName);
  //           fd.append("img_0_label", cam.label);

  //           try {
  //             const { data } = await urlSocket.post(
  //               "/remoteMultiCapture_sequential",
  //               fd
  //             );
  //             setCurrentCapturePreview((p) => ({ ...p, status: "success" }));
  //             await new Promise((r) => setTimeout(r, 500));

  //             // ---- UPDATE COUNT ----
  //             setCameraCapturedCounts((prev) => ({
  //               ...prev,
  //               [key]: (prev[key] || 0) + 1,
  //             }));
  //           } catch (e) {
  //             console.error(e);
  //             setCurrentCapturePreview(null);
  //             Swal.fire(
  //               "Upload Error",
  //               `Failed to upload image ${n} for ${cam.label}`,
  //               "error"
  //             );
  //             // stop this camera but continue with others
  //             break;
  //           }
  //         }
  //         setCaptureStatus((p) => ({ ...p, [key]: false }));
  //       }
  //     }

  //     showNotification("All captures finished!");
  //     if (selectedStage !== null) loadGalleryImages(selectedStage);
  //   } catch (e) {
  //     console.error(e);
  //     Swal.fire("Error", "Capture failed.", "error");
  //   } finally {
  //     setIsCapturing(false);
  //     setCaptureStatus({});
  //     setCurrentCapturePreview(null);
  //   }
  // };

  const handleAutoCaptureAll = async () => {
    if (isCapturing) return;
    if (!captureCount || captureCount < 1) {
      Swal.fire("Invalid Count", "Enter a count ≥ 1", "warning");
      return;
    }

    let allFull = true;
    let fullCams = [];

    // Check all stages & cameras for full count
    for (let s = 0; s < stages.length; s++) {
      const cams = stages[s]?.camera_selection?.cameras || [];
      for (let c = 0; c < cams.length; c++) {
        const key = `${s}-${c}`;
        const cur = cameraCapturedCounts[key] || 0;
        if (cur < captureCount) {
          allFull = false; // at least one camera can still capture
        } else {
          fullCams.push(`${cams[c].label} (${cur}/${captureCount})`);
        }
      }
    }

    if (allFull) {
      await Swal.fire({
        title: "Capture Limit Reached",
        text: `Admin does not allow capturing more than ${captureCount} images per camera. All cameras have reached the limit.`,
        icon: "warning",
        confirmButtonColor: "#cec80cff",
      });
      return;
    }

    setIsCapturing(true);
    setCaptureStatus({});
    setCurrentCapturePreview(null);

    try {
      for (let s = 0; s < stages.length; s++) {
        const stage = stages[s];
        const cams = stage?.camera_selection?.cameras || [];
        const devIds = cameraDevices[s] || [];

        for (let c = 0; c < cams.length; c++) {
          const cam = cams[c];
          const key = `${s}-${c}`;
          const cur = cameraCapturedCounts[key] || 0;

          // Skip if already full
          if (cur >= captureCount) continue;

          const webcam = webcamRefs.current[cam.originalLabel];
          if (!webcam || !devIds[c]) continue;

          const remaining = captureCount - cur;
          const toTake = Math.min(captureCount, remaining);

          for (let n = 1; n <= toTake; n++) {
            await new Promise((r) => setTimeout(r, 300));
            const b64 = webcam.captureZoomedImage?.();
            if (!b64) continue;

            setCurrentCapturePreview({
              image: b64,
              captureNum: cur + n,
              totalCaptures: captureCount,
              stageName: stage.stage_name,
              stageIndex: s,
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
              const { data } = await urlSocket.post(
                "/remoteMultiCapture",
                fd
              );

              setCurrentCapturePreview((p) => ({ ...p, status: "success" }));
              await new Promise((r) => setTimeout(r, 500));

              setCameraCapturedCounts((prev) => ({
                ...prev,
                [key]: (prev[key] || 0) + 1,
              }));
            } catch (e) {
              console.error(e);
              setCurrentCapturePreview(null);
              Swal.fire(
                "Upload Error",
                `Failed to upload image ${n} for ${cam.label}`,
                "error"
              );
              break;
            }
          }

          setCaptureStatus((p) => ({ ...p, [key]: false }));
        }
      }

      showNotification("Capture completed successfully!");
      if (selectedStage !== null) loadGalleryImages(selectedStage);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "Capture failed.", "error");
    } finally {
      setIsCapturing(false);
      setCaptureStatus({});
      setCurrentCapturePreview(null);
    }
  };

  const handleStageCameraSync = async () => {
    try {
      const { data } = await urlSocket.post("/sync_training_mode_result_train");
      Swal.fire({
        title: "Sync Complete!",
        text: `Synced ${data.count} items`,
        icon: "success",
        confirmButtonColor: "#28a745",
      });
    } catch (e) {
      console.error(e);
      Swal.fire({
        title: "Sync Failed",
        icon: "error",
        confirmButtonColor: "#dc3545",
      });
    }
  };

  const back = () => history.goBack();

  return (
    <div
      className="page-content"
      style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
    >

      <Container fluid>
        {/* Notification */}
        {notification && (
          <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999 }}>
            <Alert color="success" className="mb-0 shadow-lg">
              <i className="mdi mdi-check-circle me-2" />
              {notification}
            </Alert>
          </div>
        )}

        {/* Header */}
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
                <Button color="light" outline className="me-2" onClick={handleStageCameraSync}>
                  <i className="mdi mdi-sync me-1" />
                  Training Sync
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
          {/* LEFT – CAMERAS */}
          <Col lg={6}>
            <Card className="stage-card">
              <CardHeader className="bg-white border-bottom pb-0">
                <div className="capture-btn-container">
                  <Row className="align-items-center">
                    <Col md={6}>
                      <div className="d-flex align-items-center gap-2">
                        <label className="mb-0 fw-bold" style={{ minWidth: 120 }}>
                          Images per Camera:
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
                        onClick={handleAutoCaptureAll}
                        disabled={isCapturing}
                      >
                        {isCapturing ? (
                          <>
                            <Spinner size="sm" className="me-2" />
                            Capturing...
                          </>
                        ) : (
                          <>
                            <i className="mdi mdi-camera-burst me-2" />
                            Auto Capture All ({captureCount}x)
                          </>
                        )}
                      </Button>
                    </Col>
                  </Row>
                </div>
              </CardHeader>

              <CardBody className="p-3 gallery-scroll">
                {stages.map((stage, sIdx) => (
                  <div key={sIdx} className="mb-5">
                    <Row className="align-items-center mb-3">
                      <Col>
                        <h5 className="mb-0 text-dark">{stage.stage_name}</h5>
                        <small className="text-muted">Stage Code: {stage.stage_code}</small>
                      </Col>
                      <Col xs="auto">
                        <Badge color="primary" pill>
                          {(cameraDevices[sIdx] || []).filter((d) => d !== null).length}/
                          {(stage?.camera_selection?.cameras || []).length}
                        </Badge>
                      </Col>
                    </Row>

                    <Row>
                      {(stage?.camera_selection?.cameras || []).map((cam, cIdx) => {
                        const key = `${sIdx}-${cIdx}`;
                        const devId = (cameraDevices[sIdx] || [])[cIdx];
                        const hasDev = !!devId;
                        const captured = cameraCapturedCounts[key] || 0;
                        const isAtLimit = captured >= captureCount;

                        return (
                          <Col md={6} key={cIdx} className="mb-3">
                            <Card className={`camera-card ${captureStatus[key] ? "captured" : ""}`}>
                              <CardHeader className="bg-dark text-white d-flex justify-content-between align-items-center py-2">
                                <span className="fw-bold text-truncate" style={{ maxWidth: 150 }}>
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
                                <div className="webcam-container" style={{ height: 220, position: "relative" }}>
                                  {hasDev ? (
                                    <>
                                      <WebcamCapture
                                        ref={(el) => {
                                          if (el) webcamRefs.current[cam.originalLabel] = el;
                                        }}
                                        resolution={DEFAULT_RESOLUTION}
                                        cameraLabel={cam.originalLabel}
                                        style={{
                                          position: "absolute",
                                          top: 0,
                                          left: 0,
                                          width: "100%",
                                          height: "100%",
                                          objectFit: "cover",
                                        }}
                                      />
                                      <Badge color="success" pill className="camera-status-badge">
                                        <i className="mdi mdi-circle" style={{ fontSize: "8px" }} />
                                        Live
                                      </Badge>

                                      {/* ---- COUNT BADGE (always shown) ---- */}
                                      <div
                                        style={{
                                          position: "absolute",
                                          bottom: 10,
                                          left: "50%",
                                          transform: "translateX(-50%)",
                                          background: isAtLimit
                                            ? "rgba(16,185,129,0.95)"
                                            : "rgba(99,102,241,0.95)",
                                          color: "#fff",
                                          padding: "8px 16px",
                                          borderRadius: "20px",
                                          fontWeight: 700,
                                          fontSize: 14,
                                          boxShadow: "0 4px 12px rgba(0,0,0,.3)",
                                          zIndex: 20,
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 8,
                                        }}
                                      >
                                        {isAtLimit ? (
                                          <>
                                            <i className="mdi mdi-check-circle" />
                                            <span>
                                              {captured}/{captureCount}
                                            </span>
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
                                          <span>
                                            {captured}/{captureCount}
                                          </span>
                                        )}
                                      </div>
                                    </>
                                  ) : (
                                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                                      <i className="mdi mdi-camera-off" style={{ fontSize: 36 }} />
                                      <small className="mt-1">Not Available</small>
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
              </CardBody>
            </Card>
          </Col>

          {/* RIGHT – GALLERY */}
          <Col lg={6}>
            {/* Stage Tabs */}
            <div className="d-flex mb-3" style={{ borderBottom: "2px solid #e9ecef" }}>
              {stages.map((st, i) => (
                <div
                  key={st._id?.$oid || i}
                  className={`stage-tab ${selectedStage === i ? "active" : ""}`}
                  onClick={() => setSelectedStage(i)}
                >
                  {st.stage_name}
                </div>
              ))}
            </div>

            {/* Gallery UI */}
            {(() => {
              const byCam = {};
              galleryImages.forEach((img) => {
                const k = (img.camera_label || "").trim();
                if (!byCam[k]) byCam[k] = [];
                byCam[k].push(img);
              });
              const shown = selectedCameraLabel && byCam[selectedCameraLabel] ? byCam[selectedCameraLabel] : galleryImages;
              const allIds = shown.map((i) => i.filename);
              const allSel = allIds.every((id) => selectedImages.has(id));

              return (
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 10,
                    padding: 16,
                    boxShadow: "0 2px 6px rgba(0,0,0,.1)",
                    height: "calc(100vh - 200px)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Header */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <h6 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#111827" }}>
                        Image Gallery ({galleryImages.length})
                      </h6>
                      <Button
                        size="sm"
                        onClick={() => loadGalleryImages(selectedStage)}
                        disabled={loadingGallery}
                        style={{ background: "#6366f1", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 500, color: "#fff" }}
                      >
                        {loadingGallery ? "Loading..." : "Refresh"}
                      </Button>
                    </div>

                    {selectedImages.size > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                        <Button size="sm" color="info" onClick={() => (allSel ? setSelectedImages(new Set()) : setSelectedImages(new Set(allIds)))}>
                          {allSel ? "Deselect All" : "Select All"}
                        </Button>
                        <Button size="sm" color="danger" onClick={handleBulkDelete}>
                          Delete ({selectedImages.size})
                        </Button>
                        <Button size="sm" color="secondary" onClick={() => setSelectedImages(new Set())}>
                          Clear
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Images */}
                  <div style={{ flex: 1, overflowY: "auto" }}>
                    {loadingGallery ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af" }}>
                        <Spinner color="primary" />
                        <p style={{ fontSize: 14, marginTop: 12 }}>Loading images...</p>
                      </div>
                    ) : shown.length === 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af" }}>
                        <p style={{ fontSize: 14, fontWeight: 500 }}>
                          {selectedCameraLabel ? `No images for ${selectedCameraLabel}` : "No images captured yet"}
                        </p>
                      </div>
                    ) : (
                      <Row className="g-3">
                        {shown.map((img) => {
                          const sel = selectedImages.has(img.filename);
                          const highlight = !selectedImages.size && previewImage?.filename === img.filename;
                          return (
                            <Col key={img.filename} xs={6} md={4}>
                              <div
                                style={{
                                  position: "relative",
                                  borderRadius: 8,
                                  overflow: "hidden",
                                  border: sel ? "3px solid #6366f1" : highlight ? "3px solid #10b981" : "1px solid #e5e7eb",
                                  cursor: "pointer",
                                  transition: "all .2s",
                                }}
                                onClick={() => setPreviewImage(img)}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = "scale(1.05)";
                                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.15)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = "scale(1)";
                                  e.currentTarget.style.boxShadow = "none";
                                }}
                              >
                                <img
                                  src={`${ImageUrl}${img.insp_local_path}`}
                                  alt={img.camera_label}
                                  style={{ width: "100%", height: 120, objectFit: "cover" }}
                                  onError={(e) => (e.target.src = "/fallback.png")}
                                />

                                {/* Checkbox */}
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleImageSelection(img.filename);
                                  }}
                                  style={{
                                    position: "absolute",
                                    top: 6,
                                    left: 6,
                                    width: 20,
                                    height: 20,
                                    borderRadius: 4,
                                    background: sel ? "#6366f1" : "rgba(255,255,255,.85)",
                                    border: `2px solid ${sel ? "#6366f1" : "#d1d5db"}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                  }}
                                >
                                  {sel && <i className="fa fa-check" style={{ color: "#fff", fontSize: 11 }} />}
                                </div>

                                {/* Eye */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewImage(img);
                                    setShowPreview(true);
                                  }}
                                  style={{
                                    position: "absolute",
                                    top: 6,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    background: "rgba(99,102,241,.9)",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: 26,
                                    height: 26,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                  }}
                                >
                                  <i className="fa fa-eye" style={{ color: "#fff", fontSize: 13 }} />
                                </button>

                                {/* Delete */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteImage(img);
                                  }}
                                  style={{
                                    position: "absolute",
                                    top: 6,
                                    right: 6,
                                    background: "rgba(239,68,68,.9)",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: 26,
                                    height: 26,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                  }}
                                >
                                  <i className="fa fa-times" style={{ color: "#fff", fontSize: 13 }} />
                                </button>

                                {/* Filename */}
                                <div
                                  style={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    background: "linear-gradient(to top,rgba(0,0,0,.7),transparent)",
                                    padding: "6px 6px 3px",
                                  }}
                                >
                                  <p
                                    style={{
                                      margin: 0,
                                      fontSize: 10,
                                      fontWeight: 600,
                                      color: "#fff",
                                      textOverflow: "ellipsis",
                                      overflow: "hidden",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {img.filename}
                                  </p>
                                </div>
                              </div>
                            </Col>
                          );
                        })}
                      </Row>
                    )}
                  </div>

                  {/* Single image details */}
                  {previewImage && selectedImages.size === 0 && (
                    <div
                      style={{
                        marginTop: 16,
                        padding: 10,
                        background: "#f9fafb",
                        borderRadius: 8,
                        border: "1px solid #e5e7eb",
                        fontSize: 12,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <strong>{previewImage.camera_label}</strong>
                        <button onClick={() => setPreviewImage(null)} style={{ background: "none", border: "none", fontSize: 16 }}>
                          ×
                        </button>
                      </div>
                      <div style={{ color: "#6b7280" }}>
                        <div>
                          <strong>File:</strong> {previewImage.filename}
                        </div>
                        <div>
                          <strong>Time:</strong> {new Date(previewImage.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </Col>
        </Row>
      </Container>

      {/* Preview Modal */}
      <Modal isOpen={showPreview} toggle={() => setShowPreview(false)} size="lg">
        <ModalHeader toggle={() => setShowPreview(false)}>{previewImage?.camera_label}</ModalHeader>
        <ModalBody className="text-center">
          {previewImage && (
            <>
              <img
                src={`${ImageUrl}${previewImage.insp_local_path}`}
                alt={previewImage.camera_label}
                style={{ maxWidth: "100%", maxHeight: "70vh" }}
              />
              <div className="mt-3 text-start">
                <p>
                  <strong>Filename:</strong> {previewImage.filename}
                </p>
                <p>
                  <strong>Camera:</strong> {previewImage.camera_label}
                </p>
                <p>
                  <strong>Timestamp:</strong> {new Date(previewImage.timestamp).toLocaleString()}
                </p>
                <p>
                  <strong>Dimensions:</strong> {previewImage.width} x {previewImage.height}
                </p>
              </div>
            </>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default RemoteStg;