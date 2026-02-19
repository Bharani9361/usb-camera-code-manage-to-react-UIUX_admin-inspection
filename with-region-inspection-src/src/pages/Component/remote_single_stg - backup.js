// // import React, { useEffect, useRef, useState } from "react";
// // import { useLocation, useHistory } from "react-router-dom";
// // import { Container, Button, Col, Row, Card, CardBody, Input } from "reactstrap";
// // import MetaTags from "react-meta-tags";
// // import { v4 as uuidv4 } from "uuid";
// // import urlSocket from "./urlSocket";
// // import WebcamCapture from "../WebcamCustom/WebcamCapture";
// // import PropTypes from 'prop-types';

// // const CustomToast = ({ message, type, onClose }) => {
// //   const [isVisible, setIsVisible] = useState(true);


// //   useEffect(() => {
// //     const timer = setTimeout(() => {
// //       setIsVisible(false);
// //       onClose();
// //     }, 5000);
// //     return () => clearTimeout(timer);
// //   }, [onClose]);

// //   return (
// //     isVisible && (
// //       <div
// //         style={{
// //           position: 'fixed',
// //           top: '20px',
// //           right: '20px',
// //           maxWidth: '350px',
// //           zIndex: '9999',
// //           borderRadius: '8px',
// //           padding: '12px 16px',
// //           backgroundColor: type === 'error' ? '#ef4444' : '#10b981',
// //           color: 'white',
// //           fontWeight: '500',
// //           fontSize: '14px',
// //           boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
// //           display: 'flex',
// //           alignItems: 'center',
// //           justifyContent: 'space-between',
// //           gap: '12px',
// //         }}
// //       >
// //         <span>{message}</span>
// //         <button
// //           onClick={() => {
// //             setIsVisible(false);
// //             onClose();
// //           }}
// //           style={{
// //             background: 'none',
// //             border: 'none',
// //             color: 'white',
// //             fontSize: '20px',
// //             cursor: 'pointer',
// //             padding: '0',
// //             lineHeight: '1',
// //           }}
// //         >
// //           ×
// //         </button>
// //       </div>
// //     )
// //   );
// // };

// // CustomToast.propTypes = {
// //   message: PropTypes.string.isRequired,
// //   type: PropTypes.oneOf(['success', 'error']).isRequired,
// //   onClose: PropTypes.func.isRequired,
// // };

// // const RemoteSingleStg = () => {
// //   const location = useLocation();
// //   const history = useHistory();
// //   const { datas } = location.state || {};
// //   const stages = datas?.stages || [];

// //   const [selectedStageIndex, setSelectedStageIndex] = useState(0);
// //   const [cameraStreams, setCameraStreams] = useState([]);
// //   const [cameraAvailable, setCameraAvailable] = useState(false);
// //   const [galleryImages, setGalleryImages] = useState([]);

// //   const webcamRefs = useRef([]);
// //   const [capturing, setCapturing] = useState(false);
// //   const [isSyncing, setIsSyncing] = useState(false);
// //   const [isCameraValid, setIsCameraValid] = useState(true);
// //   const [toastMessage, setToastMessage] = useState(null);
// //   const [toastType, setToastType] = useState(null);

// //   const selectedStage = stages[selectedStageIndex];
// //   const cameras = selectedStage?.camera_selection?.cameras || [];

// //   useEffect(() => {
// //     let activeStreams = [];

// //     async function setupCameras() {
// //       cameraStreams.forEach((s) => s?.getTracks().forEach((t) => t.stop()));

// //       await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
// //       const devices = await navigator.mediaDevices.enumerateDevices();

// //       const newStreams = [];

// //       for (let cam of cameras) {
// //         try {
// //           const videoDevice = devices.find((d) => {
// //             if (d.kind !== "videoinput") return false;
// //             const label = d.label?.toLowerCase() || "";
// //             const matchByLabel = cam.originalLabel && label.includes(cam.originalLabel.toLowerCase());
// //             const matchByVID = cam.v_id && label.includes(cam.v_id.toLowerCase());
// //             const matchByPID = cam.p_id && label.includes(cam.p_id.toLowerCase());
// //             return matchByLabel || matchByVID || matchByPID;
// //           });

// //           const stream = videoDevice
// //             ? await navigator.mediaDevices.getUserMedia({
// //               video: { deviceId: { exact: videoDevice.deviceId } },
// //               audio: false,
// //             })
// //             : null;

// //           newStreams.push(stream);
// //         } catch (err) {
// //           console.error(`Error accessing ${cam.label}:`, err);
// //           newStreams.push(null);
// //         }
// //       }

// //       activeStreams = newStreams;
// //       setCameraStreams(newStreams);
// //       setCameraAvailable(newStreams.some((s) => s !== null));
// //       validateCameraPreviews(newStreams);
// //     }

// //     setupCameras();

// //     return () => {
// //       activeStreams.forEach((s) => s && s.getTracks().forEach((t) => t.stop()));
// //     };
// //   }, [selectedStageIndex, cameras]);

// //   const validateCameraPreviews = (streams) => {
// //     const missingCameras = streams
// //       .map((stream, index) => stream === null ? cameras[index]?.label : null)
// //       .filter((label) => label !== null);

// //     if (missingCameras.length === 0) {
// //       setIsCameraValid(true);
// //       return;
// //     }
// //     setIsCameraValid(false);

// //     const missingCamerasList = missingCameras.join(", ");
// //     if (missingCameras.length === 1) {
// //       setToastMessage(`The "${missingCamerasList}" is not showing its preview.`);
// //     } else {
// //       setToastMessage(`${missingCameras.length} cameras are not showing previews: ${missingCamerasList}`);
// //     }
// //     setToastType("error");
// //   };

// //   useEffect(() => {
// //     const timer = setTimeout(() => {
// //       cameraStreams.forEach((stream, i) => {
// //         const video = webcamRefs.current[i];
// //         if (video && stream && video.srcObject !== stream) {
// //           video.srcObject = stream;
// //         }
// //       });
// //     }, 400);
// //     return () => clearTimeout(timer);
// //   }, [cameraStreams]);

// //   const handleStageChange = (e) => {
// //     setSelectedStageIndex(parseInt(e.target.value));
// //   };

// //   const back = () => history.goBack();

// //   const dataURLtoBlob = (dataURL) => {
// //     const byteString = atob(dataURL.split(",")[1]);
// //     const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
// //     const ab = new ArrayBuffer(byteString.length);
// //     const ia = new Uint8Array(ab);
// //     for (let i = 0; i < byteString.length; i++) {
// //       ia[i] = byteString.charCodeAt(i);
// //     }
// //     return new Blob([ab], { type: mimeString });
// //   };

// //   const handleCaptureAll = async () => {
// //     if (capturing) return;

// //     const invalidCameras = [];
// //     for (const cam of cameras) {
// //       const webcamInstance = webcamRefs.current[cam.originalLabel];
// //       if (!webcamInstance || !webcamInstance.captureZoomedImage || webcamInstance.cameraDisconnected) {
// //         invalidCameras.push(cam.label);
// //       }
// //     }

// //     if (invalidCameras.length > 0) {
// //       const message = invalidCameras.length === 1
// //         ? `Camera "${invalidCameras[0]}" is not showing preview.`
// //         : `${invalidCameras.length} cameras not showing preview: ${invalidCameras.join(", ")}`;
// //       setToastMessage(message);
// //       setToastType("error");
// //       return;
// //     }

// //     setCapturing(true);

// //     try {
// //       const successfulCameras = [];
// //       const formData = new FormData();

// //       formData.append("comp_name", datas.comp_name);
// //       formData.append("comp_id", datas.comp_id);
// //       formData.append("comp_code", datas.comp_code);
// //       formData.append("stage_name", selectedStage.stage_name);
// //       formData.append("stage_code", selectedStage.stage_code);

// //       for (let i = 0; i < cameras.length; i++) {
// //         const cam = cameras[i];
// //         const webcamInstance = webcamRefs.current[cam.originalLabel];

// //         try {
// //           const imageSrcData = await webcamInstance.captureZoomedImage();
// //           if (!imageSrcData) {
// //             throw new Error(`No image data from ${cam.label}`);
// //           }

// //           const blob = dataURLtoBlob(imageSrcData);
// //           const fileName = `${cam.label}_${uuidv4()}.png`;

// //           const imgObj = new Image();
// //           imgObj.src = imageSrcData;
// //           await new Promise((resolve) => {
// //             imgObj.onload = resolve;
// //             imgObj.onerror = resolve;
// //           });
// //           const width = imgObj.naturalWidth || 0;
// //           const height = imgObj.naturalHeight || 0;

// //           formData.append(`img_${i}`, blob, fileName);
// //           formData.append(`img_${i}_label`, cam.label);
// //           formData.append(`img_${i}_width`, width);
// //           formData.append(`img_${i}_height`, height);

// //           successfulCameras.push(cam.label);
// //         } catch (captureError) {
// //           setToastMessage(`Failed to capture from "${cam.label}"`);
// //           setToastType("error");
// //           setCapturing(false);
// //           return;
// //         }
// //       }

// //       const response = await urlSocket.post("/remoteMultiCapture", formData, {
// //         headers: { "Content-Type": "multipart/form-data" },
// //       });

// //       setToastMessage(`Successfully captured from: ${successfulCameras.join(", ")}`);
// //       setToastType("success");
// //     } catch (error) {
// //       setToastMessage(`Capture failed: ${error.message || "An error occurred"}`);
// //       setToastType("error");
// //     }

// //     setCapturing(false);
// //   };

// //   const handleTrainingSync = async () => {
// //     try {
// //       setIsSyncing(true);
// //       const res = await urlSocket.post("/sync_training_mode_result_train");

// //       if (res?.data?.count > 0) {
// //         setToastMessage(`${res.data.sts} - Total Synced: ${res.data.count}`);
// //         setToastType("success");
// //       } else {
// //         setToastMessage("All components are already synced");
// //         setToastType("success");
// //       }
// //     } catch (err) {
// //       setToastMessage("Error during sync. Please try again.");
// //       setToastType("error");
// //     } finally {
// //       setIsSyncing(false);
// //     }
// //   };

// //   return (
// //     <div
// //       className="page-content"
// //       style={{
// //         backgroundColor: "#f8f9fa",
// //         minHeight: "100vh",
// //         display: "flex",
// //         flexDirection: "column",
// //       }}
// //     >
// //       <MetaTags>
// //         <title>Remote Camera Gallery</title>
// //       </MetaTags>

// //       {/* Header */}
// //       <div style={{ backgroundColor: "#fff", borderBottom: "1px solid #e5e7eb", padding: "12px 0" }}>
// //         <Container fluid className="px-4">
// //           <Row className="align-items-center g-2">
// //             {/* Title */}
// //             <Col xs={12} md={6} lg={2}>
// //               <h5 className="mb-0" style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>
// //                 Remote Camera Gallery
// //               </h5>
// //             </Col>

// //             {/* Stage Selector */}


// //             {/* Stage Selector */}
// //             <Col xs={12} md={6} lg={3}>
// //               <div
// //                 style={{
// //                   backgroundColor: "#f9fafb",
// //                   border: "1px solid #e5e7eb",
// //                   borderRadius: "6px",
// //                   display: "flex",
// //                   alignItems: "center",
// //                   justifyContent: "space-between",
// //                   padding: "6px 10px",
// //                   height: "40px",
// //                 }}
// //               >
// //                 <span
// //                   style={{
// //                     fontSize: "12px",
// //                     color: "#6b7280",
// //                     fontWeight: "500",
// //                     textTransform: "uppercase",
// //                     letterSpacing: "0.3px",
// //                     marginRight: "8px",
// //                     whiteSpace: "nowrap",
// //                   }}
// //                 >
// //                   Slected Stage:
// //                 </span>
// //                 <Input
// //                   type="select"
// //                   value={selectedStageIndex}
// //                   onChange={handleStageChange}
// //                   style={{
// //                     fontSize: "13px",
// //                     borderRadius: "4px",
// //                     border: "1px solid #d1d5db",
// //                     padding: "4px 8px",
// //                     color: "#374151",
// //                     height: "28px",
// //                     width: "70%", // keeps dropdown compact inside box
// //                   }}
// //                 >
// //                   {stages.map((stage, index) => (
// //                     <option key={stage._id.$oid} value={index}>
// //                       {stage.stage_name} ({stage.stage_code})
// //                     </option>
// //                   ))}
// //                 </Input>
// //               </div>
// //             </Col>

// //             {/* Current Stage Info */}
// //             <Col xs={12} md={6} lg={4}>
// //               <div
// //                 style={{
// //                   padding: "8px 12px",
// //                   backgroundColor: "#f9fafb",
// //                   borderRadius: "6px",
// //                   border: "1px solid #e5e7eb",
// //                   display: "flex",
// //                   alignItems: "center",
// //                   justifyContent: "space-between",
// //                   height: "40px",
// //                   whiteSpace: "nowrap",
// //                   overflow: "hidden",
// //                   textOverflow: "ellipsis",
// //                 }}
// //               >
// //                 <span
// //                   style={{
// //                     fontSize: "12px",
// //                     color: "#6b7280",
// //                     fontWeight: "500",
// //                     textTransform: "uppercase",
// //                     letterSpacing: "0.3px",
// //                   }}
// //                 >
// //                   Current Stage:
// //                 </span>

// //                 <span
// //                   style={{
// //                     fontSize: "13px",
// //                     fontWeight: "600",
// //                     color: "#111827",
// //                     marginLeft: "6px",
// //                     overflow: "hidden",
// //                     textOverflow: "ellipsis",
// //                   }}
// //                 >
// //                   {selectedStage?.stage_name}{" "}
// //                   <span style={{ color: "#6b7280", fontWeight: "400" }}>
// //                     ({selectedStage?.stage_code})
// //                   </span>
// //                 </span>
// //               </div>
// //             </Col>


// //             {/* Action Buttons */}
// //             <Col xs={12} md={6} lg={3} className="d-flex gap-2 justify-content-lg-end">
// //               <Button
// //                 size="sm"
// //                 onClick={handleTrainingSync}
// //                 disabled={isSyncing}
// //                 style={{
// //                   backgroundColor: "#10b981",
// //                   border: "none",
// //                   borderRadius: "6px",
// //                   padding: "6px 12px",
// //                   fontSize: "13px",
// //                   fontWeight: "500",
// //                   color: "#fff",
// //                   height: "34px",
// //                 }}
// //               >
// //                 {isSyncing ? (
// //                   <>
// //                     <i className="fa fa-spinner fa-spin me-1" /> Syncing
// //                   </>
// //                 ) : (
// //                   <>
// //                     <i className="fa fa-sync-alt me-1" /> Training  Sync
// //                   </>
// //                 )}
// //               </Button>

// //               <Button
// //                 size="sm"
// //                 onClick={back}
// //                 style={{
// //                   backgroundColor: "#4441e6ff",
// //                   border: "1px solid #d1d5db",
// //                   borderRadius: "6px",
// //                   padding: "6px 12px",
// //                   fontSize: "13px",
// //                   fontWeight: "500",
// //                   color: "#374151",
// //                   height: "34px",
// //                 }}
// //               >
// //                 <i className="mdi mdi-arrow-left me-1" />
// //                 Back
// //               </Button>
// //             </Col>
// //           </Row>
// //         </Container>
// //       </div>

// //       {/* Camera Grid */}
// //       {selectedStage && (
// //         <Container fluid className="px-4 py-4" style={{ flex: "1 1 auto", overflow: "auto" }}>
// //           <Row className="g-3 mb-4">
// //             {cameras.map((camera, index) => (
// //               <Col key={index} xs={12} sm={6} md={4} lg={3}>
// //                 <Card
// //                   className="border-0"
// //                   style={{
// //                     borderRadius: "10px",
// //                     overflow: "hidden",
// //                     boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
// //                     backgroundColor: "#fff",
// //                     transition: "transform 0.2s ease, box-shadow 0.2s ease",
// //                   }}
// //                   onMouseEnter={(e) => {
// //                     e.currentTarget.style.transform = "translateY(-3px)";
// //                     e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
// //                   }}
// //                   onMouseLeave={(e) => {
// //                     e.currentTarget.style.transform = "translateY(0)";
// //                     e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
// //                   }}
// //                 >
// //                   {/* Camera Header */}
// //                   <div
// //                     style={{
// //                       padding: "12px 16px",
// //                       backgroundColor: "#f8f9fa",
// //                       borderBottom: "1px solid #e5e7eb",
// //                       display: "flex",
// //                       alignItems: "center",
// //                       justifyContent: "space-between",
// //                     }}
// //                   >
// //                     <h6
// //                       className="mb-0 text-truncate"
// //                       style={{
// //                         fontSize: "14px",
// //                         fontWeight: "600",
// //                         color: "#1f2937",
// //                         letterSpacing: "0.3px",
// //                       }}
// //                     >
// //                       {camera.label}
// //                     </h6>
// //                     <div
// //                       style={{
// //                         display: "flex",
// //                         alignItems: "center",
// //                         gap: "6px",
// //                       }}
// //                     >
// //                       <span
// //                         style={{
// //                           width: "8px",
// //                           height: "8px",
// //                           borderRadius: "50%",
// //                           backgroundColor: "#10b981",
// //                           animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
// //                         }}
// //                       />
// //                       <span
// //                         style={{
// //                           fontSize: "12px",
// //                           color: "#10b981",
// //                           fontWeight: "600",
// //                           textTransform: "uppercase",
// //                           letterSpacing: "0.5px",
// //                         }}
// //                       >
// //                         Live
// //                       </span>
// //                     </div>
// //                   </div>

// //                   {/* Camera Feed */}
// //                   <CardBody className="p-0">
// //                     <div
// //                       style={{
// //                         position: "relative",
// //                         width: "100%",
// //                         paddingBottom: "75%",
// //                         backgroundColor: "#000",
// //                       }}
// //                     >
// //                       <WebcamCapture
// //                         ref={(el) => (webcamRefs.current[camera.originalLabel] = el)}
// //                         key={camera.originalLabel}
// //                         resolution={{ width: 640, height: 480 }}
// //                         zoom={1}
// //                         center={{ x: 0.5, y: 0.5 }}
// //                         cameraLabel={camera.originalLabel}
// //                         style={{
// //                           position: "absolute",
// //                           top: 0,
// //                           left: 0,
// //                           width: "100%",
// //                           height: "100%",
// //                           objectFit: "cover",
// //                         }}
// //                       />
// //                     </div>
// //                   </CardBody>
// //                 </Card>
// //               </Col>
// //             ))}
// //           </Row>


// //           {/* Capture Button */}
// //           <div className="text-center">
// //             <Button
// //               size="lg"
// //               onClick={handleCaptureAll}
// //               disabled={!cameraAvailable || capturing}
// //               style={{
// //                 backgroundColor: "#6366f1",
// //                 border: "none",
// //                 borderRadius: "8px",
// //                 padding: "12px 32px",
// //                 fontSize: "15px",
// //                 fontWeight: "600",
// //                 color: "#fff",
// //                 opacity: (!cameraAvailable || capturing) ? 0.6 : 1,
// //                 cursor: (!cameraAvailable || capturing) ? "not-allowed" : "pointer",
// //               }}
// //             >
// //               {capturing ? (
// //                 <>
// //                   <i className="fa fa-spinner fa-spin me-2" /> Capturing...
// //                 </>
// //               ) : (
// //                 <>
// //                   <i className="fa fa-camera me-2" /> Capture All Cameras
// //                 </>
// //               )}
// //             </Button>
// //           </div>
// //         </Container>
// //       )}

// //       {/* Toast Notification */}
// //       {toastMessage && (
// //         <CustomToast
// //           message={toastMessage}
// //           type={toastType}
// //           onClose={() => setToastMessage(null)}
// //         />
// //       )}
// //     </div>
// //   );
// // };

// // export default RemoteSingleStg;


// import React, { useEffect, useRef, useState } from "react";
// import { useLocation, useHistory } from "react-router-dom";
// import { Container, Button, Col, Row, Card, CardBody, Input } from "reactstrap";
// import MetaTags from "react-meta-tags";
// import { v4 as uuidv4 } from "uuid";
// import urlSocket from "./urlSocket";
// import WebcamCapture from "../WebcamCustom/WebcamCapture";
// import PropTypes from 'prop-types';

// const CustomToast = ({ message, type, onClose }) => {
//   const [isVisible, setIsVisible] = useState(true);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsVisible(false);
//       onClose();
//     }, 5000);
//     return () => clearTimeout(timer);
//   }, [onClose]);

//   return (
//     isVisible && (
//       <div
//         style={{
//           position: 'fixed',
//           top: '20px',
//           right: '20px',
//           maxWidth: '350px',
//           zIndex: '9999',
//           borderRadius: '8px',
//           padding: '12px 16px',
//           backgroundColor: type === 'error' ? '#ef4444' : '#10b981',
//           color: 'white',
//           fontWeight: '500',
//           fontSize: '14px',
//           boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           gap: '12px',
//         }}
//       >
//         <span>{message}</span>
//         <button
//           onClick={() => {
//             setIsVisible(false);
//             onClose();
//           }}
//           style={{
//             background: 'none',
//             border: 'none',
//             color: 'white',
//             fontSize: '20px',
//             cursor: 'pointer',
//             padding: '0',
//             lineHeight: '1',
//           }}
//         >
//           ×
//         </button>
//       </div>
//     )
//   );
// };

// CustomToast.propTypes = {
//   message: PropTypes.string.isRequired,
//   type: PropTypes.oneOf(['success', 'error']).isRequired,
//   onClose: PropTypes.func.isRequired,
// };

// const RemoteSingleStg = () => {
//   const location = useLocation();
//   const history = useHistory();
//   const { datas } = location.state || {};
//   const stages = datas?.stages || [];

//   const [selectedStageIndex, setSelectedStageIndex] = useState(0);
//   const [cameraStreams, setCameraStreams] = useState([]);
//   const [cameraAvailable, setCameraAvailable] = useState(false);
//   const [galleryImages, setGalleryImages] = useState([]);
//   const [selectedImage, setSelectedImage] = useState(null);

//   const webcamRefs = useRef([]);
//   const [capturing, setCapturing] = useState(false);
//   const [isSyncing, setIsSyncing] = useState(false);
//   const [isCameraValid, setIsCameraValid] = useState(true);
//   const [toastMessage, setToastMessage] = useState(null);
//   const [toastType, setToastType] = useState(null);

//   const selectedStage = stages[selectedStageIndex];
//   const cameras = selectedStage?.camera_selection?.cameras || [];

//   useEffect(() => {
//     let activeStreams = [];

//     async function setupCameras() {
//       cameraStreams.forEach((s) => s?.getTracks().forEach((t) => t.stop()));

//       await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
//       const devices = await navigator.mediaDevices.enumerateDevices();

//       const newStreams = [];

//       for (let cam of cameras) {
//         try {
//           const videoDevice = devices.find((d) => {
//             if (d.kind !== "videoinput") return false;
//             const label = d.label?.toLowerCase() || "";
//             const matchByLabel = cam.originalLabel && label.includes(cam.originalLabel.toLowerCase());
//             const matchByVID = cam.v_id && label.includes(cam.v_id.toLowerCase());
//             const matchByPID = cam.p_id && label.includes(cam.p_id.toLowerCase());
//             return matchByLabel || matchByVID || matchByPID;
//           });

//           const stream = videoDevice
//             ? await navigator.mediaDevices.getUserMedia({
//               video: { deviceId: { exact: videoDevice.deviceId } },
//               audio: false,
//             })
//             : null;

//           newStreams.push(stream);
//         } catch (err) {
//           console.error(`Error accessing ${cam.label}:`, err);
//           newStreams.push(null);
//         }
//       }

//       activeStreams = newStreams;
//       setCameraStreams(newStreams);
//       setCameraAvailable(newStreams.some((s) => s !== null));
//       validateCameraPreviews(newStreams);
//     }

//     setupCameras();

//     return () => {
//       activeStreams.forEach((s) => s && s.getTracks().forEach((t) => t.stop()));
//     };
//   }, [selectedStageIndex, cameras]);

//   const validateCameraPreviews = (streams) => {
//     const missingCameras = streams
//       .map((stream, index) => stream === null ? cameras[index]?.label : null)
//       .filter((label) => label !== null);

//     if (missingCameras.length === 0) {
//       setIsCameraValid(true);
//       return;
//     }
//     setIsCameraValid(false);

//     const missingCamerasList = missingCameras.join(", ");
//     if (missingCameras.length === 1) {
//       setToastMessage(`The "${missingCamerasList}" is not showing its preview.`);
//     } else {
//       setToastMessage(`${missingCameras.length} cameras are not showing previews: ${missingCamerasList}`);
//     }
//     setToastType("error");
//   };

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       cameraStreams.forEach((stream, i) => {
//         const video = webcamRefs.current[i];
//         if (video && stream && video.srcObject !== stream) {
//           video.srcObject = stream;
//         }
//       });
//     }, 400);
//     return () => clearTimeout(timer);
//   }, [cameraStreams]);

//   const handleStageChange = (e) => {
//     setSelectedStageIndex(parseInt(e.target.value));
//   };

//   const back = () => history.goBack();

//   const dataURLtoBlob = (dataURL) => {
//     const byteString = atob(dataURL.split(",")[1]);
//     const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
//     const ab = new ArrayBuffer(byteString.length);
//     const ia = new Uint8Array(ab);
//     for (let i = 0; i < byteString.length; i++) {
//       ia[i] = byteString.charCodeAt(i);
//     }
//     return new Blob([ab], { type: mimeString });
//   };

//   const handleCaptureAll = async () => {
//     if (capturing) return;

//     const invalidCameras = [];
//     for (const cam of cameras) {
//       const webcamInstance = webcamRefs.current[cam.originalLabel];
//       if (!webcamInstance || !webcamInstance.captureZoomedImage || webcamInstance.cameraDisconnected) {
//         invalidCameras.push(cam.label);
//       }
//     }

//     if (invalidCameras.length > 0) {
//       const message = invalidCameras.length === 1
//         ? `Camera "${invalidCameras[0]}" is not showing preview.`
//         : `${invalidCameras.length} cameras not showing preview: ${invalidCameras.join(", ")}`;
//       setToastMessage(message);
//       setToastType("error");
//       return;
//     }

//     setCapturing(true);

//     try {
//       const successfulCameras = [];
//       const formData = new FormData();
//       const capturedImages = [];

//       formData.append("comp_name", datas.comp_name);
//       formData.append("comp_id", datas.comp_id);
//       formData.append("comp_code", datas.comp_code);
//       formData.append("stage_name", selectedStage.stage_name);
//       formData.append("stage_code", selectedStage.stage_code);

//       for (let i = 0; i < cameras.length; i++) {
//         const cam = cameras[i];
//         const webcamInstance = webcamRefs.current[cam.originalLabel];

//         try {
//           const imageSrcData = await webcamInstance.captureZoomedImage();
//           if (!imageSrcData) {
//             throw new Error(`No image data from ${cam.label}`);
//           }

//           const blob = dataURLtoBlob(imageSrcData);
//           const fileName = `${cam.label}_${uuidv4()}.png`;

//           const imgObj = new Image();
//           imgObj.src = imageSrcData;
//           await new Promise((resolve) => {
//             imgObj.onload = resolve;
//             imgObj.onerror = resolve;
//           });
//           const width = imgObj.naturalWidth || 0;
//           const height = imgObj.naturalHeight || 0;

//           formData.append(`img_${i}`, blob, fileName);
//           formData.append(`img_${i}_label`, cam.label);
//           formData.append(`img_${i}_width`, width);
//           formData.append(`img_${i}_height`, height);

//           // Store for gallery display
//           capturedImages.push({
//             id: uuidv4(),
//             src: imageSrcData,
//             cameraLabel: cam.label,
//             timestamp: new Date().toISOString(),
//             width,
//             height,
//             fileName
//           });

//           successfulCameras.push(cam.label);
//         } catch (captureError) {
//           setToastMessage(`Failed to capture from "${cam.label}"`);
//           setToastType("error");
//           setCapturing(false);
//           return;
//         }
//       }

//       const response = await urlSocket.post("/remoteMultiCapture", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       console.log("response", response)

//       // Add captured images to gallery
//       setGalleryImages(prev => [...capturedImages, ...prev]);

//       setToastMessage(`Successfully captured from: ${successfulCameras.join(", ")}`);
//       setToastType("success");
//     } catch (error) {
//       setToastMessage(`Capture failed: ${error.message || "An error occurred"}`);
//       setToastType("error");
//     }

//     setCapturing(false);
//   };

//   const handleTrainingSync = async () => {
//     try {
//       setIsSyncing(true);
//       const res = await urlSocket.post("/sync_training_mode_result_train");

//       if (res?.data?.count > 0) {
//         setToastMessage(`${res.data.sts} - Total Synced: ${res.data.count}`);
//         setToastType("success");
//       } else {
//         setToastMessage("All components are already synced");
//         setToastType("success");
//       }
//     } catch (err) {
//       setToastMessage("Error during sync. Please try again.");
//       setToastType("error");
//     } finally {
//       setIsSyncing(false);
//     }
//   };

//   const handleDeleteImage = (imageId) => {
//     setGalleryImages(prev => prev.filter(img => img.id !== imageId));
//     if (selectedImage?.id === imageId) {
//       setSelectedImage(null);
//     }
//   };

//   return (
//     <div
//       className="page-content"
//       style={{
//         backgroundColor: "#f8f9fa",
//         minHeight: "100vh",
//         display: "flex",
//         flexDirection: "column",
//       }}
//     >
//       <MetaTags>
//         <title>Remote Camera Gallery</title>
//       </MetaTags>

//       {/* Header */}
//       <div style={{ backgroundColor: "#fff", borderBottom: "1px solid #e5e7eb", padding: "12px 0" }}>
//         <Container fluid className="px-4">
//           <Row className="align-items-center g-2">
//             <Col xs={12} md={6} lg={2}>
//               <h5 className="mb-0" style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>
//                 Remote Camera Gallery
//               </h5>
//             </Col>

//             <Col xs={12} md={6} lg={3}>
//               <div
//                 style={{
//                   backgroundColor: "#f9fafb",
//                   border: "1px solid #e5e7eb",
//                   borderRadius: "6px",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   padding: "6px 10px",
//                   height: "40px",
//                 }}
//               >
//                 <span
//                   style={{
//                     fontSize: "12px",
//                     color: "#6b7280",
//                     fontWeight: "500",
//                     textTransform: "uppercase",
//                     letterSpacing: "0.3px",
//                     marginRight: "8px",
//                     whiteSpace: "nowrap",
//                   }}
//                 >
//                   Selected Stage:
//                 </span>
//                 <Input
//                   type="select"
//                   value={selectedStageIndex}
//                   onChange={handleStageChange}
//                   style={{
//                     fontSize: "13px",
//                     borderRadius: "4px",
//                     border: "1px solid #d1d5db",
//                     padding: "4px 8px",
//                     color: "#374151",
//                     height: "28px",
//                     width: "70%",
//                   }}
//                 >
//                   {stages.map((stage, index) => (
//                     <option key={stage._id.$oid} value={index}>
//                       {stage.stage_name} ({stage.stage_code})
//                     </option>
//                   ))}
//                 </Input>
//               </div>
//             </Col>

//             <Col xs={12} md={6} lg={4}>
//               <div
//                 style={{
//                   padding: "8px 12px",
//                   backgroundColor: "#f9fafb",
//                   borderRadius: "6px",
//                   border: "1px solid #e5e7eb",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   height: "40px",
//                   whiteSpace: "nowrap",
//                   overflow: "hidden",
//                   textOverflow: "ellipsis",
//                 }}
//               >
//                 <span
//                   style={{
//                     fontSize: "12px",
//                     color: "#6b7280",
//                     fontWeight: "500",
//                     textTransform: "uppercase",
//                     letterSpacing: "0.3px",
//                   }}
//                 >
//                   Current Stage:
//                 </span>
//                 <span
//                   style={{
//                     fontSize: "13px",
//                     fontWeight: "600",
//                     color: "#111827",
//                     marginLeft: "6px",
//                     overflow: "hidden",
//                     textOverflow: "ellipsis",
//                   }}
//                 >
//                   {selectedStage?.stage_name}{" "}
//                   <span style={{ color: "#6b7280", fontWeight: "400" }}>
//                     ({selectedStage?.stage_code})
//                   </span>
//                 </span>
//               </div>
//             </Col>

//             <Col xs={12} md={6} lg={3} className="d-flex gap-2 justify-content-lg-end">
//               <Button
//                 size="sm"
//                 onClick={handleTrainingSync}
//                 disabled={isSyncing}
//                 style={{
//                   backgroundColor: "#10b981",
//                   border: "none",
//                   borderRadius: "6px",
//                   padding: "6px 12px",
//                   fontSize: "13px",
//                   fontWeight: "500",
//                   color: "#fff",
//                   height: "34px",
//                 }}
//               >
//                 {isSyncing ? (
//                   <>
//                     <i className="fa fa-spinner fa-spin me-1" /> Syncing
//                   </>
//                 ) : (
//                   <>
//                     <i className="fa fa-sync-alt me-1" /> Training Sync
//                   </>
//                 )}
//               </Button>

//               <Button
//                 size="sm"
//                 onClick={back}
//                 style={{
//                   backgroundColor: "#4441e6ff",
//                   border: "1px solid #d1d5db",
//                   borderRadius: "6px",
//                   padding: "6px 12px",
//                   fontSize: "13px",
//                   fontWeight: "500",
//                   color: "#fff",
//                   height: "34px",
//                 }}
//               >
//                 <i className="mdi mdi-arrow-left me-1" />
//                 Back
//               </Button>
//             </Col>
//           </Row>
//         </Container>
//       </div>

//       {/* Split Screen Content */}
//       {selectedStage && (
//         <Container fluid className="px-4 py-4" style={{ flex: "1 1 auto", overflow: "hidden" }}>
//           <Row style={{ height: "100%" }}>

//             {/* RIGHT SIDE - Live Cameras */}
//             <Col xs={12} lg={7} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
//               <div style={{ flex: 1, overflowY: "auto", paddingLeft: "12px" }}>
//                 <Row className="g-3 mb-4">
//                   {cameras.map((camera, index) => (
//                     <Col key={index} xs={12} sm={6}>
//                       <Card
//                         className="border-0"
//                         style={{
//                           borderRadius: "10px",
//                           overflow: "hidden",
//                           boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//                           backgroundColor: "#fff",
//                           transition: "transform 0.2s ease, box-shadow 0.2s ease",
//                         }}
//                         onMouseEnter={(e) => {
//                           e.currentTarget.style.transform = "translateY(-3px)";
//                           e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
//                         }}
//                         onMouseLeave={(e) => {
//                           e.currentTarget.style.transform = "translateY(0)";
//                           e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
//                         }}
//                       >
//                         <div
//                           style={{
//                             padding: "12px 16px",
//                             backgroundColor: "#f8f9fa",
//                             borderBottom: "1px solid #e5e7eb",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "space-between",
//                           }}
//                         >
//                           <h6
//                             className="mb-0 text-truncate"
//                             style={{
//                               fontSize: "14px",
//                               fontWeight: "600",
//                               color: "#1f2937",
//                               letterSpacing: "0.3px",
//                             }}
//                           >
//                             {camera.label}
//                           </h6>
//                           <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
//                             <span
//                               style={{
//                                 width: "8px",
//                                 height: "8px",
//                                 borderRadius: "50%",
//                                 backgroundColor: "#10b981",
//                                 animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
//                               }}
//                             />
//                             <span
//                               style={{
//                                 fontSize: "12px",
//                                 color: "#10b981",
//                                 fontWeight: "600",
//                                 textTransform: "uppercase",
//                                 letterSpacing: "0.5px",
//                               }}
//                             >
//                               Live
//                             </span>
//                           </div>
//                         </div>

//                         <CardBody className="p-0">
//                           <div
//                             style={{
//                               position: "relative",
//                               width: "100%",
//                               paddingBottom: "75%",
//                               backgroundColor: "#000",
//                             }}
//                           >
//                             <WebcamCapture
//                               ref={(el) => (webcamRefs.current[camera.originalLabel] = el)}
//                               key={camera.originalLabel}
//                               resolution={{ width: 640, height: 480 }}
//                               zoom={1}
//                               center={{ x: 0.5, y: 0.5 }}
//                               cameraLabel={camera.originalLabel}
//                               style={{
//                                 position: "absolute",
//                                 top: 0,
//                                 left: 0,
//                                 width: "100%",
//                                 height: "100%",
//                                 objectFit: "cover",
//                               }}
//                             />
//                           </div>
//                         </CardBody>
//                       </Card>
//                     </Col>
//                   ))}
//                 </Row>

//                 {/* Capture Button */}
//                 <div className="text-center pb-3">
//                   <Button
//                     size="lg"
//                     onClick={handleCaptureAll}
//                     disabled={!cameraAvailable || capturing}
//                     style={{
//                       backgroundColor: "#6366f1",
//                       border: "none",
//                       borderRadius: "8px",
//                       padding: "12px 32px",
//                       fontSize: "15px",
//                       fontWeight: "600",
//                       color: "#fff",
//                       opacity: (!cameraAvailable || capturing) ? 0.6 : 1,
//                       cursor: (!cameraAvailable || capturing) ? "not-allowed" : "pointer",
//                     }}
//                   >
//                     {capturing ? (
//                       <>
//                         <i className="fa fa-spinner fa-spin me-2" /> Capturing...
//                       </>
//                     ) : (
//                       <>
//                         <i className="fa fa-camera me-2" /> Capture All Cameras
//                       </>
//                     )}
//                   </Button>
//                 </div>
//               </div>
//             </Col>
//             {/* LEFT SIDE - Image Gallery */}
//             <Col xs={12} lg={5} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
//               <div
//                 style={{
//                   backgroundColor: "#fff",
//                   borderRadius: "10px",
//                   padding: "16px",
//                   boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//                   height: "100%",
//                   display: "flex",
//                   flexDirection: "column",
//                 }}
//               >
//                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
//                   <h6 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#111827" }}>
//                     <i className="fa fa-images me-2" style={{ color: "#6366f1" }} />
//                     Captured Images ({galleryImages.length})
//                   </h6>
//                   {galleryImages.length > 0 && (
//                     <Button
//                       size="sm"
//                       onClick={() => setGalleryImages([])}
//                       style={{
//                         backgroundColor: "#ef4444",
//                         border: "none",
//                         borderRadius: "6px",
//                         padding: "4px 12px",
//                         fontSize: "12px",
//                         fontWeight: "500",
//                         color: "#fff",
//                       }}
//                     >
//                       <i className="fa fa-trash me-1" /> Clear All
//                     </Button>
//                   )}
//                 </div>

//                 <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
//                   {galleryImages.length === 0 ? (
//                     <div
//                       style={{
//                         display: "flex",
//                         flexDirection: "column",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         height: "100%",
//                         color: "#9ca3af",
//                       }}
//                     >
//                       <i
//                         className="fa fa-images"
//                         style={{ fontSize: "64px", marginBottom: "16px", opacity: 0.3 }}
//                       />
//                       <p style={{ fontSize: "14px", fontWeight: "500" }}>No images captured yet</p>
//                       <p style={{ fontSize: "12px" }}>{'Click "Capture All Cameras" to start'}</p>

//                     </div>
//                   ) : (
//                     <Row className="g-3">
//                       {galleryImages.map((image) => (
//                         <Col key={image.id} xs={6} md={4}>
//                           <div
//                             style={{
//                               position: "relative",
//                               borderRadius: "8px",
//                               overflow: "hidden",
//                               border: selectedImage?.id === image.id ? "3px solid #6366f1" : "1px solid #e5e7eb",
//                               cursor: "pointer",
//                               transition: "all 0.2s ease",
//                             }}
//                             onClick={() => setSelectedImage(image)}
//                             onMouseEnter={(e) => {
//                               e.currentTarget.style.transform = "scale(1.05)";
//                               e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
//                             }}
//                             onMouseLeave={(e) => {
//                               e.currentTarget.style.transform = "scale(1)";
//                               e.currentTarget.style.boxShadow = "none";
//                             }}
//                           >
//                             <img
//                               src={image.src}
//                               alt={image.cameraLabel}
//                               style={{
//                                 width: "100%",
//                                 height: "120px",
//                                 objectFit: "cover",
//                               }}
//                             />
//                             <div
//                               style={{
//                                 position: "absolute",
//                                 bottom: 0,
//                                 left: 0,
//                                 right: 0,
//                                 background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
//                                 padding: "8px 8px 4px",
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   margin: 0,
//                                   fontSize: "11px",
//                                   fontWeight: "600",
//                                   color: "#fff",
//                                   textOverflow: "ellipsis",
//                                   overflow: "hidden",
//                                   whiteSpace: "nowrap",
//                                 }}
//                               >
//                                 {image.cameraLabel}
//                               </p>
//                             </div>
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleDeleteImage(image.id);
//                               }}
//                               style={{
//                                 position: "absolute",
//                                 top: "4px",
//                                 right: "4px",
//                                 backgroundColor: "rgba(239, 68, 68, 0.9)",
//                                 border: "none",
//                                 borderRadius: "4px",
//                                 color: "#fff",
//                                 width: "24px",
//                                 height: "24px",
//                                 display: "flex",
//                                 alignItems: "center",
//                                 justifyContent: "center",
//                                 cursor: "pointer",
//                                 fontSize: "12px",
//                               }}
//                             >
//                               <i className="fa fa-times" />
//                             </button>
//                           </div>
//                         </Col>
//                       ))}
//                     </Row>
//                   )}
//                 </div>

//                 {/* Selected Image Preview */}
//                 {selectedImage && (
//                   <div
//                     style={{
//                       marginTop: "16px",
//                       padding: "12px",
//                       backgroundColor: "#f9fafb",
//                       borderRadius: "8px",
//                       border: "1px solid #e5e7eb",
//                     }}
//                   >
//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
//                       <h6 style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#111827" }}>
//                         {selectedImage.cameraLabel}
//                       </h6>
//                       <button
//                         onClick={() => setSelectedImage(null)}
//                         style={{
//                           background: "none",
//                           border: "none",
//                           color: "#6b7280",
//                           fontSize: "18px",
//                           cursor: "pointer",
//                           padding: "0",
//                         }}
//                       >
//                         ×
//                       </button>
//                     </div>
//                     <p style={{ margin: "0 0 8px 0", fontSize: "11px", color: "#6b7280" }}>
//                       <i className="fa fa-clock me-1" />
//                       {new Date(selectedImage.timestamp).toLocaleString()}
//                     </p>
//                     <p style={{ margin: "0", fontSize: "11px", color: "#6b7280" }}>
//                       <i className="fa fa-image me-1" />
//                       {selectedImage.width} × {selectedImage.height}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </Col>


//           </Row>
//         </Container>
//       )}

//       {/* Toast Notification */}
//       {toastMessage && (
//         <CustomToast
//           message={toastMessage}
//           type={toastType}
//           onClose={() => setToastMessage(null)}
//         />
//       )}
//     </div>
//   );
// };

// export default RemoteSingleStg;




// import React, { useEffect, useRef, useState } from "react";
// import { useLocation, useHistory } from "react-router-dom";
// import { Container, Button, Col, Row, Card, CardBody, Input, Spinner } from "reactstrap";
// import MetaTags from "react-meta-tags";
// import { v4 as uuidv4 } from "uuid";
// import urlSocket from "./urlSocket";
// import WebcamCapture from "../WebcamCustom/WebcamCapture";
// import PropTypes from 'prop-types';
// import ImageUrl from "./imageUrl";
// import SweetAlert from "react-bootstrap-sweetalert";



// const CustomToast = ({ message, type, onClose }) => {
//   const [isVisible, setIsVisible] = useState(true);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsVisible(false);
//       onClose();
//     }, 5000);
//     return () => clearTimeout(timer);
//   }, [onClose]);

//   return (
//     isVisible && (
//       <div
//         style={{
//           position: 'fixed',
//           top: '20px',
//           right: '20px',
//           maxWidth: '350px',
//           zIndex: '9999',
//           borderRadius: '8px',
//           padding: '12px 16px',
//           backgroundColor: type === 'error' ? '#ef4444' : '#10b981',
//           color: 'white',
//           fontWeight: '500',
//           fontSize: '14px',
//           boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           gap: '12px',
//         }}
//       >
//         <span>{message}</span>
//         <button
//           onClick={() => {
//             setIsVisible(false);
//             onClose();
//           }}
//           style={{
//             background: 'none',
//             border: 'none',
//             color: 'white',
//             fontSize: '20px',
//             cursor: 'pointer',
//             padding: '0',
//             lineHeight: '1',
//           }}
//         >
//           ×
//         </button>
//       </div>
//     )
//   );
// };

// CustomToast.propTypes = {
//   message: PropTypes.string.isRequired,
//   type: PropTypes.oneOf(['success', 'error']).isRequired,
//   onClose: PropTypes.func.isRequired,
// };

// const RemoteSingleStg = () => {
//   const location = useLocation();
//   const history = useHistory();
//   const { datas } = location.state || {};
//   const stages = datas?.stages || [];

//   const [selectedStageIndex, setSelectedStageIndex] = useState(0);
//   const [cameraStreams, setCameraStreams] = useState([]);
//   const [cameraAvailable, setCameraAvailable] = useState(false);
//   const [galleryImagesByCamera, setGalleryImagesByCamera] = useState({});
//   const [selectedCameraLabel, setSelectedCameraLabel] = useState(null);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [loadingGallery, setLoadingGallery] = useState(false);

//   const webcamRefs = useRef([]);
//   const [capturing, setCapturing] = useState(false);
//   const [isSyncing, setIsSyncing] = useState(false);
//   const [isCameraValid, setIsCameraValid] = useState(true);
//   const [toastMessage, setToastMessage] = useState(null);
//   const [toastType, setToastType] = useState(null);
//   const [alert, setAlert] = useState(null);


//   const selectedStage = stages[selectedStageIndex];
//   const cameras = selectedStage?.camera_selection?.cameras || [];

//   // Fetch images from backend
//   const fetchGalleryImages = async () => {
//     if (!selectedStage) return;

//     setLoadingGallery(true);
//     try {
//       const response = await urlSocket.post("/get_training_images", {
//         comp_code: datas.comp_code,
//         stage_code: selectedStage.stage_code,
//       });

//       if (response?.data?.images) {
//         // Group images by camera_label
//         const groupedImages = {};
//         response.data.images.forEach(img => {
//           const cameraLabel = img.camera_label;
//           if (!groupedImages[cameraLabel]) {
//             groupedImages[cameraLabel] = [];
//           }
//           groupedImages[cameraLabel].push({
//             id: img._id || uuidv4(),
//             filename: img.filename,
//             local_path: img.insp_local_path,
//             cameraLabel: img.camera_label,
//             timestamp: img.timestamp,
//             width: img.width,
//             height: img.height,
//           });
//         });

//         setGalleryImagesByCamera(groupedImages);

//         // Set first camera as selected if not already selected
//         const cameraLabels = Object.keys(groupedImages);
//         if (cameraLabels.length > 0 && !selectedCameraLabel) {
//           setSelectedCameraLabel(cameraLabels[0]);
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching gallery images:", error);
//       setToastMessage("Failed to load gallery images");
//       setToastType("error");
//     } finally {
//       setLoadingGallery(false);
//     }
//   };

//   // Fetch images when stage changes
//   useEffect(() => {
//     fetchGalleryImages();
//   }, [selectedStageIndex]);

//   useEffect(() => {
//     let activeStreams = [];

//     async function setupCameras() {
//       cameraStreams.forEach((s) => s?.getTracks().forEach((t) => t.stop()));

//       await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
//       const devices = await navigator.mediaDevices.enumerateDevices();

//       const newStreams = [];

//       for (let cam of cameras) {
//         try {
//           const videoDevice = devices.find((d) => {
//             if (d.kind !== "videoinput") return false;
//             const label = d.label?.toLowerCase() || "";
//             const matchByLabel = cam.originalLabel && label.includes(cam.originalLabel.toLowerCase());
//             const matchByVID = cam.v_id && label.includes(cam.v_id.toLowerCase());
//             const matchByPID = cam.p_id && label.includes(cam.p_id.toLowerCase());
//             return matchByLabel || matchByVID || matchByPID;
//           });

//           const stream = videoDevice
//             ? await navigator.mediaDevices.getUserMedia({
//               video: { deviceId: { exact: videoDevice.deviceId } },
//               audio: false,
//             })
//             : null;

//           newStreams.push(stream);
//         } catch (err) {
//           console.error(`Error accessing ${cam.label}:`, err);
//           newStreams.push(null);
//         }
//       }

//       activeStreams = newStreams;
//       setCameraStreams(newStreams);
//       setCameraAvailable(newStreams.some((s) => s !== null));
//       validateCameraPreviews(newStreams);
//     }

//     setupCameras();

//     return () => {
//       activeStreams.forEach((s) => s && s.getTracks().forEach((t) => t.stop()));
//     };
//   }, [selectedStageIndex, cameras]);

//   const validateCameraPreviews = (streams) => {
//     const missingCameras = streams
//       .map((stream, index) => stream === null ? cameras[index]?.label : null)
//       .filter((label) => label !== null);

//     if (missingCameras.length === 0) {
//       setIsCameraValid(true);
//       return;
//     }
//     setIsCameraValid(false);

//     const missingCamerasList = missingCameras.join(", ");
//     if (missingCameras.length === 1) {
//       setToastMessage(`The "${missingCamerasList}" is not showing its preview.`);
//     } else {
//       setToastMessage(`${missingCameras.length} cameras are not showing previews: ${missingCamerasList}`);
//     }
//     setToastType("error");
//   };

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       cameraStreams.forEach((stream, i) => {
//         const video = webcamRefs.current[i];
//         if (video && stream && video.srcObject !== stream) {
//           video.srcObject = stream;
//         }
//       });
//     }, 400);
//     return () => clearTimeout(timer);
//   }, [cameraStreams]);

//   const handleStageChange = (e) => {
//     setSelectedStageIndex(parseInt(e.target.value));
//     setSelectedCameraLabel(null);
//     setSelectedImage(null);
//   };

//   const back = () => history.goBack();

//   const dataURLtoBlob = (dataURL) => {
//     const byteString = atob(dataURL.split(",")[1]);
//     const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
//     const ab = new ArrayBuffer(byteString.length);
//     const ia = new Uint8Array(ab);
//     for (let i = 0; i < byteString.length; i++) {
//       ia[i] = byteString.charCodeAt(i);
//     }
//     return new Blob([ab], { type: mimeString });
//   };

//   const handleCaptureAll = async () => {
//     if (capturing) return;

//     const invalidCameras = [];
//     for (const cam of cameras) {
//       const webcamInstance = webcamRefs.current[cam.originalLabel];
//       if (!webcamInstance || !webcamInstance.captureZoomedImage || webcamInstance.cameraDisconnected) {
//         invalidCameras.push(cam.label);
//       }
//     }

//     if (invalidCameras.length > 0) {
//       const message = invalidCameras.length === 1
//         ? `Camera "${invalidCameras[0]}" is not showing preview.`
//         : `${invalidCameras.length} cameras not showing preview: ${invalidCameras.join(", ")}`;
//       setToastMessage(message);
//       setToastType("error");
//       return;
//     }

//     setCapturing(true);

//     try {
//       const successfulCameras = [];
//       const formData = new FormData();

//       formData.append("comp_name", datas.comp_name);
//       formData.append("comp_id", datas.comp_id);
//       formData.append("comp_code", datas.comp_code);
//       formData.append("stage_name", selectedStage.stage_name);
//       formData.append("stage_code", selectedStage.stage_code);

//       for (let i = 0; i < cameras.length; i++) {
//         const cam = cameras[i];
//         const webcamInstance = webcamRefs.current[cam.originalLabel];

//         try {
//           const imageSrcData = await webcamInstance.captureZoomedImage();
//           if (!imageSrcData) {
//             throw new Error(`No image data from ${cam.label}`);
//           }

//           const blob = dataURLtoBlob(imageSrcData);
//           const fileName = `${cam.label}_${uuidv4()}.png`;

//           const imgObj = new Image();
//           imgObj.src = imageSrcData;
//           await new Promise((resolve) => {
//             imgObj.onload = resolve;
//             imgObj.onerror = resolve;
//           });
//           const width = imgObj.naturalWidth || 0;
//           const height = imgObj.naturalHeight || 0;

//           formData.append(`img_${i}`, blob, fileName);
//           formData.append(`img_${i}_label`, cam.label);
//           formData.append(`img_${i}_width`, width);
//           formData.append(`img_${i}_height`, height);

//           successfulCameras.push(cam.label);
//         } catch (captureError) {
//           setToastMessage(`Failed to capture from "${cam.label}"`);
//           setToastType("error");
//           setCapturing(false);
//           return;
//         }
//       }

//       const response = await urlSocket.post("/remoteMultiCapture", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       setToastMessage(`Successfully captured from: ${successfulCameras.join(", ")}`);
//       setToastType("success");

//       // Refresh gallery after capture
//       setTimeout(() => {
//         fetchGalleryImages();
//       }, 1000);
//     } catch (error) {
//       setToastMessage(`Capture failed: ${error.message || "An error occurred"}`);
//       setToastType("error");
//     }

//     setCapturing(false);
//   };

//   const handleTrainingSync = async () => {
//     try {
//       setIsSyncing(true);
//       const res = await urlSocket.post("/sync_training_mode_result_train");

//       if (res?.data?.count > 0) {
//         setToastMessage(`${res.data.sts} - Total Synced: ${res.data.count}`);
//         setToastType("success");
//         // Refresh gallery after sync
//         setTimeout(() => {
//           fetchGalleryImages();
//         }, 1000);
//       } else {
//         setToastMessage("All components are already synced");
//         setToastType("success");
//       }
//     } catch (err) {
//       setToastMessage("Error during sync. Please try again.");
//       setToastType("error");
//     } finally {
//       setIsSyncing(false);
//     }
//   };

//   const handleDeleteImage = async (filename, cameraLabel) => {
//     try {
//       await urlSocket.post("/delete_training_image", {
//         filename,
//         camera_label: cameraLabel,
//       });

//       setGalleryImagesByCamera(prev => {
//         const updated = { ...prev };
//         updated[cameraLabel] = updated[cameraLabel].filter(img => img.filename !== filename);
//         if (updated[cameraLabel].length === 0) {
//           delete updated[cameraLabel];
//         }
//         return updated;
//       });

//       setToastMessage("Image deleted successfully");
//       setToastType("success");
//     } catch (error) {
//       setToastMessage("Failed to delete image");
//       setToastType("error");
//     }
//   };

//   const handleDelete = (e, filename, cameraLabel) => {
//     if (e && e.stopPropagation) e.stopPropagation();

//     setAlert(
//       <SweetAlert
//         warning
//         showCancel
//         confirmBtnText="Yes, delete it!"
//         cancelBtnText="Cancel"
//         confirmBtnBsStyle="danger"
//         title="Are you sure?"
//         onConfirm={() => {
//           setAlert(null);
//           handleDeleteImage(filename, cameraLabel);
//         }}
//         onCancel={() => setAlert(null)}
//         focusCancelBtn
//       >
//         This action cannot be undone.
//       </SweetAlert>
//     );
//   };



//   const selectedCameraImages = selectedCameraLabel
//     ? galleryImagesByCamera[selectedCameraLabel] || []
//     : [];

//   const totalImagesCount = Object.values(galleryImagesByCamera).reduce(
//     (sum, images) => sum + images.length, 0
//   );

//   return (
//     <div
//       className="page-content"
//       style={{
//         backgroundColor: "#f8f9fa",
//         minHeight: "100vh",
//         display: "flex",
//         flexDirection: "column",
//       }}
//     >
//       <MetaTags>
//         <title>Remote Camera Gallery</title>
//       </MetaTags>

//       {/* Header */}
//       <div style={{ backgroundColor: "#fff", borderBottom: "1px solid #e5e7eb", padding: "12px 0" }}>
//         <Container fluid className="px-4">
//           <Row className="align-items-center g-2">
//             <Col xs={12} md={6} lg={2}>
//               <h5 className="mb-0" style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>
//                 Remote Camera Gallery
//               </h5>
//             </Col>

//             <Col xs={12} md={6} lg={3}>
//               <div
//                 style={{
//                   backgroundColor: "#f9fafb",
//                   border: "1px solid #e5e7eb",
//                   borderRadius: "6px",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   padding: "6px 10px",
//                   height: "40px",
//                 }}
//               >
//                 <span
//                   style={{
//                     fontSize: "12px",
//                     color: "#6b7280",
//                     fontWeight: "500",
//                     textTransform: "uppercase",
//                     letterSpacing: "0.3px",
//                     marginRight: "8px",
//                     whiteSpace: "nowrap",
//                   }}
//                 >
//                   Selected Stage:
//                 </span>
//                 <Input
//                   type="select"
//                   value={selectedStageIndex}
//                   onChange={handleStageChange}
//                   style={{
//                     fontSize: "13px",
//                     borderRadius: "4px",
//                     border: "1px solid #d1d5db",
//                     padding: "4px 8px",
//                     color: "#374151",
//                     height: "28px",
//                     width: "70%",
//                   }}
//                 >
//                   {stages.map((stage, index) => (
//                     <option key={stage._id.$oid} value={index}>
//                       {stage.stage_name} ({stage.stage_code})
//                     </option>
//                   ))}
//                 </Input>
//               </div>
//             </Col>

//             <Col xs={12} md={6} lg={4}>
//               <div
//                 style={{
//                   padding: "8px 12px",
//                   backgroundColor: "#f9fafb",
//                   borderRadius: "6px",
//                   border: "1px solid #e5e7eb",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   height: "40px",
//                   whiteSpace: "nowrap",
//                   overflow: "hidden",
//                   textOverflow: "ellipsis",
//                 }}
//               >
//                 <span
//                   style={{
//                     fontSize: "12px",
//                     color: "#6b7280",
//                     fontWeight: "500",
//                     textTransform: "uppercase",
//                     letterSpacing: "0.3px",
//                   }}
//                 >
//                   Current Stage:
//                 </span>
//                 <span
//                   style={{
//                     fontSize: "13px",
//                     fontWeight: "600",
//                     color: "#111827",
//                     marginLeft: "6px",
//                     overflow: "hidden",
//                     textOverflow: "ellipsis",
//                   }}
//                 >
//                   {selectedStage?.stage_name}{" "}
//                   <span style={{ color: "#6b7280", fontWeight: "400" }}>
//                     ({selectedStage?.stage_code})
//                   </span>
//                 </span>
//               </div>
//             </Col>

//             <Col xs={12} md={6} lg={3} className="d-flex gap-2 justify-content-lg-end">
//               <Button
//                 size="sm"
//                 onClick={handleTrainingSync}
//                 disabled={isSyncing}
//                 style={{
//                   backgroundColor: "#10b981",
//                   border: "none",
//                   borderRadius: "6px",
//                   padding: "6px 12px",
//                   fontSize: "13px",
//                   fontWeight: "500",
//                   color: "#fff",
//                   height: "34px",
//                 }}
//               >
//                 {isSyncing ? (
//                   <>
//                     <i className="fa fa-spinner fa-spin me-1" /> Syncing
//                   </>
//                 ) : (
//                   <>
//                     <i className="fa fa-sync-alt me-1" /> Training Sync
//                   </>
//                 )}
//               </Button>

//               <Button
//                 size="sm"
//                 onClick={back}
//                 style={{
//                   backgroundColor: "#4441e6ff",
//                   border: "1px solid #d1d5db",
//                   borderRadius: "6px",
//                   padding: "6px 12px",
//                   fontSize: "13px",
//                   fontWeight: "500",
//                   color: "#fff",
//                   height: "34px",
//                 }}
//               >
//                 <i className="mdi mdi-arrow-left me-1" />
//                 Back
//               </Button>
//             </Col>
//           </Row>
//         </Container>
//       </div>

//       {selectedStage && (
//         <Container fluid className="px-4 py-4" style={{ flex: "1 1 auto", overflow: "hidden" }}>
//           <Row style={{ height: "100%" }}>
//             {alert}



//             <Col xs={12} lg={7} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
//               <div style={{ flex: 1, overflowY: "auto", paddingLeft: "12px" }}>
//                 <Row className="g-3 mb-4">
//                   {cameras.map((camera, index) => (
//                     <Col key={index} xs={12} sm={6}>
//                       <Card
//                         className="border-0"
//                         style={{
//                           borderRadius: "10px",
//                           overflow: "hidden",
//                           boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//                           backgroundColor: "#fff",
//                           transition: "transform 0.2s ease, box-shadow 0.2s ease",
//                         }}
//                         onMouseEnter={(e) => {
//                           e.currentTarget.style.transform = "translateY(-3px)";
//                           e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
//                         }}
//                         onMouseLeave={(e) => {
//                           e.currentTarget.style.transform = "translateY(0)";
//                           e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
//                         }}
//                       >
//                         <div
//                           style={{
//                             padding: "12px 16px",
//                             backgroundColor: "#f8f9fa",
//                             borderBottom: "1px solid #e5e7eb",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "space-between",
//                           }}
//                         >
//                           <h6
//                             className="mb-0 text-truncate"
//                             style={{
//                               fontSize: "14px",
//                               fontWeight: "600",
//                               color: "#1f2937",
//                               letterSpacing: "0.3px",
//                             }}
//                           >
//                             {camera.label}
//                           </h6>
//                           <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
//                             <span
//                               style={{
//                                 width: "8px",
//                                 height: "8px",
//                                 borderRadius: "50%",
//                                 backgroundColor: "#10b981",
//                                 animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
//                               }}
//                             />
//                             <span
//                               style={{
//                                 fontSize: "12px",
//                                 color: "#10b981",
//                                 fontWeight: "600",
//                                 textTransform: "uppercase",
//                                 letterSpacing: "0.5px",
//                               }}
//                             >
//                               Live
//                             </span>
//                           </div>
//                         </div>

//                         <CardBody className="p-0">
//                           <div
//                             style={{
//                               position: "relative",
//                               width: "100%",
//                               paddingBottom: "75%",
//                               backgroundColor: "#000",
//                             }}
//                           >
//                             <WebcamCapture
//                               ref={(el) => (webcamRefs.current[camera.originalLabel] = el)}
//                               key={camera.originalLabel}
//                               resolution={{ width: 640, height: 480 }}
//                               zoom={1}
//                               center={{ x: 0.5, y: 0.5 }}
//                               cameraLabel={camera.originalLabel}
//                               style={{
//                                 position: "absolute",
//                                 top: 0,
//                                 left: 0,
//                                 width: "100%",
//                                 height: "100%",
//                                 objectFit: "cover",
//                               }}
//                             />
//                           </div>
//                         </CardBody>
//                       </Card>
//                     </Col>
//                   ))}
//                 </Row>

//                 {/* Capture Button */}
//                 <div className="text-center pb-3">
//                   <Button
//                     size="lg"
//                     onClick={handleCaptureAll}
//                     disabled={!cameraAvailable || capturing}
//                     style={{
//                       backgroundColor: "#6366f1",
//                       border: "none",
//                       borderRadius: "8px",
//                       padding: "12px 32px",
//                       fontSize: "15px",
//                       fontWeight: "600",
//                       color: "#fff",
//                       opacity: (!cameraAvailable || capturing) ? 0.6 : 1,
//                       cursor: (!cameraAvailable || capturing) ? "not-allowed" : "pointer",
//                     }}
//                   >
//                     {capturing ? (
//                       <>
//                         <i className="fa fa-spinner fa-spin me-2" /> Capturing...
//                       </>
//                     ) : (
//                       <>
//                         <i className="fa fa-camera me-2" /> Capture All Cameras
//                       </>
//                     )}
//                   </Button>
//                 </div>
//               </div>
//             </Col>


//             <Col xs={12} lg={5} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
//               <div
//                 style={{
//                   backgroundColor: "#fff",
//                   borderRadius: "10px",
//                   padding: "16px",
//                   boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//                   height: "100%",
//                   display: "flex",
//                   flexDirection: "column",
//                 }}
//               >
//                 <div style={{ marginBottom: "16px" }}>
//                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
//                     <h6 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#111827" }}>
//                       <i className="fa fa-images me-2" style={{ color: "#6366f1" }} />
//                       Image Gallery ({totalImagesCount})
//                     </h6>
//                     <Button
//                       size="sm"
//                       onClick={fetchGalleryImages}
//                       disabled={loadingGallery}
//                       style={{
//                         backgroundColor: "#6366f1",
//                         border: "none",
//                         borderRadius: "6px",
//                         padding: "4px 12px",
//                         fontSize: "12px",
//                         fontWeight: "500",
//                         color: "#fff",
//                       }}
//                     >
//                       <i className={`fa fa-sync-alt me-1 ${loadingGallery ? 'fa-spin' : ''}`} /> Refresh
//                     </Button>
//                   </div>

//                   {/* Camera Label Tabs */}
//                   {Object.keys(galleryImagesByCamera).length > 0 && (
//                     <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
//                       {Object.keys(galleryImagesByCamera).map(cameraLabel => (
//                         <button
//                           key={cameraLabel}
//                           onClick={() => setSelectedCameraLabel(cameraLabel)}
//                           style={{
//                             padding: "6px 12px",
//                             borderRadius: "6px",
//                             border: selectedCameraLabel === cameraLabel
//                               ? "2px solid #6366f1"
//                               : "1px solid #e5e7eb",
//                             backgroundColor: selectedCameraLabel === cameraLabel
//                               ? "#eef2ff"
//                               : "#fff",
//                             color: selectedCameraLabel === cameraLabel
//                               ? "#6366f1"
//                               : "#6b7280",
//                             fontSize: "12px",
//                             fontWeight: "600",
//                             cursor: "pointer",
//                             transition: "all 0.2s ease",
//                           }}
//                         >
//                           {cameraLabel} ({galleryImagesByCamera[cameraLabel].length})
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 {/* Images Grid */}
//                 <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
//                   {loadingGallery ? (
//                     <div
//                       style={{
//                         display: "flex",
//                         flexDirection: "column",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         height: "100%",
//                         color: "#9ca3af",
//                       }}
//                     >
//                       <Spinner color="primary" />
//                       <p style={{ fontSize: "14px", fontWeight: "500", marginTop: "12px" }}>Loading images...</p>
//                     </div>
//                   ) : selectedCameraImages.length === 0 ? (
//                     <div
//                       style={{
//                         display: "flex",
//                         flexDirection: "column",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         height: "100%",
//                         color: "#9ca3af",
//                       }}
//                     >
//                       <i className="fa fa-images" style={{ fontSize: "64px", marginBottom: "16px", opacity: 0.3 }} />
//                       <p style={{ fontSize: "14px", fontWeight: "500" }}>
//                         {selectedCameraLabel ? `No images for ${selectedCameraLabel}` : "No images captured yet"}
//                       </p>
//                       <p style={{ fontSize: "12px" }}>{`Click Capture All Cameras to start`}</p>
//                     </div>
//                   ) : (
//                     <Row className="g-3">
//                       {console.log("selectedCameraImages", selectedCameraImages)}

//                       {selectedCameraImages.map((image) => (
//                         < Col key={image.id} xs={6} md={4} >
//                           <div
//                             style={{
//                               position: "relative",
//                               borderRadius: "8px",
//                               overflow: "hidden",
//                               border: selectedImage?.id === image.id ? "3px solid #6366f1" : "1px solid #e5e7eb",
//                               cursor: "pointer",
//                               transition: "all 0.2s ease",
//                             }}
//                             onClick={() => setSelectedImage(image)}
//                             onMouseEnter={(e) => {
//                               e.currentTarget.style.transform = "scale(1.05)";
//                               e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
//                             }}
//                             onMouseLeave={(e) => {
//                               e.currentTarget.style.transform = "scale(1)";
//                               e.currentTarget.style.boxShadow = "none";
//                             }}
//                           >
//                             {console.log("{image.local_path", image.local_path)}
//                             <img
//                               src={`${ImageUrl}${image.local_path}`}
//                               alt={image.camera_label}
//                               style={{
//                                 width: "100%",
//                                 height: "120px",
//                                 objectFit: "cover",
//                               }}
//                               onError={(e) => {
//                                 console.error("Image not found:", e.target.src);
//                                 e.target.src = "/fallback.png"; // optional default image
//                               }}
//                             />

//                             <div
//                               style={{
//                                 position: "absolute",
//                                 bottom: 0,
//                                 left: 0,
//                                 right: 0,
//                                 background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
//                                 padding: "8px 8px 4px",
//                               }}
//                             >
//                               <p
//                                 style={{
//                                   margin: 0,
//                                   fontSize: "11px",
//                                   fontWeight: "600",
//                                   color: "#fff",
//                                   textOverflow: "ellipsis",
//                                   overflow: "hidden",
//                                   whiteSpace: "nowrap",
//                                 }}
//                               >
//                                 {image.filename}
//                               </p>
//                             </div>
//                             <button
//                               onClick={(e) => handleDelete(e, image.filename, image.cameraLabel)}

//                               style={{
//                                 position: "absolute",
//                                 top: "4px",
//                                 right: "4px",
//                                 backgroundColor: "rgba(239, 68, 68, 0.9)",
//                                 border: "none",
//                                 borderRadius: "4px",
//                                 color: "#fff",
//                                 width: "24px",
//                                 height: "24px",
//                                 display: "flex",
//                                 alignItems: "center",
//                                 justifyContent: "center",
//                                 cursor: "pointer",
//                                 fontSize: "12px",
//                               }}
//                             >
//                               <i className="fa fa-times" />

//                             </button>

//                           </div>
//                         </Col>
//                       ))}
//                     </Row>
//                   )}
//                 </div>

//                 {/* Selected Image Details */}
//                 {selectedImage && (
//                   <div
//                     style={{
//                       marginTop: "16px",
//                       padding: "12px",
//                       backgroundColor: "#f9fafb",
//                       borderRadius: "8px",
//                       border: "1px solid #e5e7eb",
//                     }}
//                   >
//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
//                       <h6 style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#111827" }}>
//                         {selectedImage.cameraLabel}
//                       </h6>
//                       <button
//                         onClick={() => setSelectedImage(null)}
//                         style={{
//                           background: "none",
//                           border: "none",
//                           color: "#6b7280",
//                           fontSize: "18px",
//                           cursor: "pointer",
//                           padding: "0",
//                         }}
//                       >
//                         ×
//                       </button>
//                     </div>
//                     <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#6b7280" }}>
//                       <i className="fa fa-file me-1" />
//                       {selectedImage.filename}
//                     </p>
//                     <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#6b7280" }}>
//                       <i className="fa fa-clock me-1" />
//                       {new Date(selectedImage.timestamp).toLocaleString()}
//                     </p>
//                     {selectedImage.width && selectedImage.height && (
//                       <p style={{ margin: "0", fontSize: "11px", color: "#6b7280" }}>
//                         <i className="fa fa-image me-1" />
//                         {selectedImage.width} × {selectedImage.height}
//                       </p>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </Col>
//           </Row>
//         </Container>
//       )
//       }

//       {/* Toast Notification */}
//       {
//         toastMessage && (
//           <CustomToast
//             message={toastMessage}
//             type={toastType}
//             onClose={() => setToastMessage(null)}
//           />
//         )
//       }
//     </div >
//   );
// };

// export default RemoteSingleStg;


// import React, { useEffect, useRef, useState } from "react";
// import { useLocation, useHistory } from "react-router-dom";
// import { Container, Button, Col, Row, Card, CardBody, Input, Spinner, Modal, ModalHeader, ModalBody } from "reactstrap";
// import MetaTags from "react-meta-tags";
// import { v4 as uuidv4 } from "uuid";
// import urlSocket from "./urlSocket";
// import WebcamCapture from "../WebcamCustom/WebcamCapture";
// import PropTypes from 'prop-types';
// import ImageUrl from "./imageUrl";
// import SweetAlert from "react-bootstrap-sweetalert";

// const CustomToast = ({ message, type, onClose }) => {
//   const [isVisible, setIsVisible] = useState(true);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsVisible(false);
//       onClose();
//     }, 5000);
//     return () => clearTimeout(timer);
//   }, [onClose]);

//   return (
//     isVisible && (
//       <div
//         style={{
//           position: 'fixed',
//           top: '20px',
//           right: '20px',
//           maxWidth: '350px',
//           zIndex: '9999',
//           borderRadius: '8px',
//           padding: '12px 16px',
//           backgroundColor: type === 'error' ? '#ef4444' : '#10b981',
//           color: 'white',
//           fontWeight: '500',
//           fontSize: '14px',
//           boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           gap: '12px',
//         }}
//       >
//         <span>{message}</span>
//         <button
//           onClick={() => {
//             setIsVisible(false);
//             onClose();
//           }}
//           style={{
//             background: 'none',
//             border: 'none',
//             color: 'white',
//             fontSize: '20px',
//             cursor: 'pointer',
//             padding: '0',
//             lineHeight: '1',
//           }}
//         >
//           ×
//         </button>
//       </div>
//     )
//   );
// };

// CustomToast.propTypes = {
//   message: PropTypes.string.isRequired,
//   type: PropTypes.oneOf(['success', 'error']).isRequired,
//   onClose: PropTypes.func.isRequired,
// };

// const RemoteSingleStg = () => {
//   const location = useLocation();
//   const history = useHistory();
//   const { datas } = location.state || {};
//   const stages = datas?.stages || [];

//   const [selectedStageIndex, setSelectedStageIndex] = useState(0);
//   const [cameraStreams, setCameraStreams] = useState([]);
//   const [cameraAvailable, setCameraAvailable] = useState(false);
//   const [galleryImagesByCamera, setGalleryImagesByCamera] = useState({});
//   const [selectedCameraLabel, setSelectedCameraLabel] = useState(null);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [loadingGallery, setLoadingGallery] = useState(false);

//   // New states for multi-select
//   const [selectedImages, setSelectedImages] = useState([]);
//   const [isSelectionMode, setIsSelectionMode] = useState(false);
//   const [previewModal, setPreviewModal] = useState(false);
//   const [previewImage, setPreviewImage] = useState(null);

//   const webcamRefs = useRef([]);
//   const [capturing, setCapturing] = useState(false);
//   const [isSyncing, setIsSyncing] = useState(false);
//   const [isCameraValid, setIsCameraValid] = useState(true);
//   const [toastMessage, setToastMessage] = useState(null);
//   const [toastType, setToastType] = useState(null);
//   const [alert, setAlert] = useState(null);

//   const selectedStage = stages[selectedStageIndex];
//   const cameras = selectedStage?.camera_selection?.cameras || [];

//   // Fetch images from backend
//   const fetchGalleryImages = async () => {
//     if (!selectedStage) return;

//     setLoadingGallery(true);
//     try {
//       const response = await urlSocket.post("/get_training_images", {
//         comp_code: datas.comp_code,
//         stage_code: selectedStage.stage_code,
//       });

//       if (response?.data?.images) {
//         const groupedImages = {};
//         response.data.images.forEach(img => {
//           const cameraLabel = img.camera_label;
//           if (!groupedImages[cameraLabel]) {
//             groupedImages[cameraLabel] = [];
//           }
//           groupedImages[cameraLabel].push({
//             id: img._id || uuidv4(),
//             filename: img.filename,
//             local_path: img.insp_local_path,
//             cameraLabel: img.camera_label,
//             timestamp: img.timestamp,
//             width: img.width,
//             height: img.height,
//           });
//         });

//         setGalleryImagesByCamera(groupedImages);

//         const cameraLabels = Object.keys(groupedImages);
//         if (cameraLabels.length > 0 && !selectedCameraLabel) {
//           setSelectedCameraLabel(cameraLabels[0]);
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching gallery images:", error);
//       setToastMessage("Failed to load gallery images");
//       setToastType("error");
//     } finally {
//       setLoadingGallery(false);
//     }
//   };

//   useEffect(() => {
//     fetchGalleryImages();
//     setSelectedImages([]);
//     setIsSelectionMode(false);
//   }, [selectedStageIndex]);

//   useEffect(() => {
//     let activeStreams = [];

//     async function setupCameras() {
//       cameraStreams.forEach((s) => s?.getTracks().forEach((t) => t.stop()));

//       await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
//       const devices = await navigator.mediaDevices.enumerateDevices();

//       const newStreams = [];

//       for (let cam of cameras) {
//         try {
//           const videoDevice = devices.find((d) => {
//             if (d.kind !== "videoinput") return false;
//             const label = d.label?.toLowerCase() || "";
//             const matchByLabel = cam.originalLabel && label.includes(cam.originalLabel.toLowerCase());
//             const matchByVID = cam.v_id && label.includes(cam.v_id.toLowerCase());
//             const matchByPID = cam.p_id && label.includes(cam.p_id.toLowerCase());
//             return matchByLabel || matchByVID || matchByPID;
//           });

//           const stream = videoDevice
//             ? await navigator.mediaDevices.getUserMedia({
//               video: { deviceId: { exact: videoDevice.deviceId } },
//               audio: false,
//             })
//             : null;

//           newStreams.push(stream);
//         } catch (err) {
//           console.error(`Error accessing ${cam.label}:`, err);
//           newStreams.push(null);
//         }
//       }

//       activeStreams = newStreams;
//       setCameraStreams(newStreams);
//       setCameraAvailable(newStreams.some((s) => s !== null));
//       validateCameraPreviews(newStreams);
//     }

//     setupCameras();

//     return () => {
//       activeStreams.forEach((s) => s && s.getTracks().forEach((t) => t.stop()));
//     };
//   }, [selectedStageIndex, cameras]);

//   const validateCameraPreviews = (streams) => {
//     const missingCameras = streams
//       .map((stream, index) => stream === null ? cameras[index]?.label : null)
//       .filter((label) => label !== null);

//     if (missingCameras.length === 0) {
//       setIsCameraValid(true);
//       return;
//     }
//     setIsCameraValid(false);

//     const missingCamerasList = missingCameras.join(", ");
//     if (missingCameras.length === 1) {
//       setToastMessage(`The "${missingCamerasList}" is not showing its preview.`);
//     } else {
//       setToastMessage(`${missingCameras.length} cameras are not showing previews: ${missingCamerasList}`);
//     }
//     setToastType("error");
//   };

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       cameraStreams.forEach((stream, i) => {
//         const video = webcamRefs.current[i];
//         if (video && stream && video.srcObject !== stream) {
//           video.srcObject = stream;
//         }
//       });
//     }, 400);
//     return () => clearTimeout(timer);
//   }, [cameraStreams]);

//   const handleStageChange = (e) => {
//     setSelectedStageIndex(parseInt(e.target.value));
//     setSelectedCameraLabel(null);
//     setSelectedImage(null);
//   };

//   const back = () => history.goBack();

//   const dataURLtoBlob = (dataURL) => {
//     const byteString = atob(dataURL.split(",")[1]);
//     const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
//     const ab = new ArrayBuffer(byteString.length);
//     const ia = new Uint8Array(ab);
//     for (let i = 0; i < byteString.length; i++) {
//       ia[i] = byteString.charCodeAt(i);
//     }
//     return new Blob([ab], { type: mimeString });
//   };

//   const handleCaptureAll = async () => {
//     if (capturing) return;

//     const invalidCameras = [];
//     for (const cam of cameras) {
//       const webcamInstance = webcamRefs.current[cam.originalLabel];
//       if (!webcamInstance || !webcamInstance.captureZoomedImage || webcamInstance.cameraDisconnected) {
//         invalidCameras.push(cam.label);
//       }
//     }

//     if (invalidCameras.length > 0) {
//       const message = invalidCameras.length === 1
//         ? `Camera "${invalidCameras[0]}" is not showing preview.`
//         : `${invalidCameras.length} cameras not showing preview: ${invalidCameras.join(", ")}`;
//       setToastMessage(message);
//       setToastType("error");
//       return;
//     }

//     setCapturing(true);

//     try {
//       const successfulCameras = [];
//       const formData = new FormData();

//       formData.append("comp_name", datas.comp_name);
//       formData.append("comp_id", datas.comp_id);
//       formData.append("comp_code", datas.comp_code);
//       formData.append("stage_name", selectedStage.stage_name);
//       formData.append("stage_code", selectedStage.stage_code);

//       for (let i = 0; i < cameras.length; i++) {
//         const cam = cameras[i];
//         const webcamInstance = webcamRefs.current[cam.originalLabel];

//         try {
//           const imageSrcData = await webcamInstance.captureZoomedImage();
//           if (!imageSrcData) {
//             throw new Error(`No image data from ${cam.label}`);
//           }

//           const blob = dataURLtoBlob(imageSrcData);
//           const fileName = `${cam.label}_${uuidv4()}.png`;

//           const imgObj = new Image();
//           imgObj.src = imageSrcData;
//           await new Promise((resolve) => {
//             imgObj.onload = resolve;
//             imgObj.onerror = resolve;
//           });
//           const width = imgObj.naturalWidth || 0;
//           const height = imgObj.naturalHeight || 0;

//           formData.append(`img_${i}`, blob, fileName);
//           formData.append(`img_${i}_label`, cam.label);
//           formData.append(`img_${i}_width`, width);
//           formData.append(`img_${i}_height`, height);

//           successfulCameras.push(cam.label);
//         } catch (captureError) {
//           setToastMessage(`Failed to capture from "${cam.label}"`);
//           setToastType("error");
//           setCapturing(false);
//           return;
//         }
//       }

//       const response = await urlSocket.post("/remoteMultiCapture", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       setToastMessage(`Successfully captured from: ${successfulCameras.join(", ")}`);
//       setToastType("success");

//       setTimeout(() => {
//         fetchGalleryImages();
//       }, 1000);
//     } catch (error) {
//       setToastMessage(`Capture failed: ${error.message || "An error occurred"}`);
//       setToastType("error");
//     }

//     setCapturing(false);
//   };

//   const handleTrainingSync = async () => {
//     try {
//       setIsSyncing(true);
//       const res = await urlSocket.post("/sync_training_mode_result_train");

//       if (res?.data?.count > 0) {
//         setToastMessage(`${res.data.sts} - Total Synced: ${res.data.count}`);
//         setToastType("success");
//         setTimeout(() => {
//           fetchGalleryImages();
//         }, 1000);
//       } else {
//         setToastMessage("All components are already synced");
//         setToastType("success");
//       }
//     } catch (err) {
//       setToastMessage("Error during sync. Please try again.");
//       setToastType("error");
//     } finally {
//       setIsSyncing(false);
//     }
//   };

//   const handleDeleteImage = async (filename, cameraLabel) => {
//     try {
//       await urlSocket.post("/delete_training_image", {
//         filename,
//         camera_label: cameraLabel,
//       });

//       setGalleryImagesByCamera(prev => {
//         const updated = { ...prev };
//         updated[cameraLabel] = updated[cameraLabel].filter(img => img.filename !== filename);
//         if (updated[cameraLabel].length === 0) {
//           delete updated[cameraLabel];
//         }
//         return updated;
//       });

//       setToastMessage("Image deleted successfully");
//       setToastType("success");
//     } catch (error) {
//       setToastMessage("Failed to delete image");
//       setToastType("error");
//     }
//   };

//   const handleDelete = (e, filename, cameraLabel) => {
//     if (e && e.stopPropagation) e.stopPropagation();

//     setAlert(
//       <SweetAlert
//         warning
//         showCancel
//         confirmBtnText="Yes, delete it!"
//         cancelBtnText="Cancel"
//         confirmBtnBsStyle="danger"
//         title="Are you sure?"
//         onConfirm={() => {
//           setAlert(null);
//           handleDeleteImage(filename, cameraLabel);
//         }}
//         onCancel={() => setAlert(null)}
//         focusCancelBtn
//       >
//         This action cannot be undone.
//       </SweetAlert>
//     );
//   };

//   // NEW: Toggle selection mode
//   const toggleSelectionMode = () => {
//     setIsSelectionMode(!isSelectionMode);
//     setSelectedImages([]);
//   };

//   // NEW: Handle image selection
//   const handleImageSelect = (image) => {
//     setSelectedImages(prev => {
//       const isSelected = prev.some(img => img.id === image.id);
//       if (isSelected) {
//         return prev.filter(img => img.id !== image.id);
//       } else {
//         return [...prev, image];
//       }
//     });
//   };

//   // NEW: Select all images for current camera
//   const handleSelectAll = () => {
//     if (selectedImages.length === selectedCameraImages.length) {
//       setSelectedImages([]);
//     } else {
//       setSelectedImages([...selectedCameraImages]);
//     }
//   };

//   // NEW: Delete selected images
//   const handleDeleteSelected = () => {
//     if (selectedImages.length === 0) return;

//     setAlert(
//       <SweetAlert
//         warning
//         showCancel
//         confirmBtnText="Yes, delete them!"
//         cancelBtnText="Cancel"
//         confirmBtnBsStyle="danger"
//         title={`Delete ${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''}?`}
//         onConfirm={async () => {
//           setAlert(null);
//           try {
//             for (const image of selectedImages) {
//               await urlSocket.post("/delete_training_image", {
//                 filename: image.filename,
//                 camera_label: image.cameraLabel,
//               });
//             }

//             setGalleryImagesByCamera(prev => {
//               const updated = { ...prev };
//               selectedImages.forEach(image => {
//                 updated[image.cameraLabel] = updated[image.cameraLabel].filter(
//                   img => img.filename !== image.filename
//                 );
//                 if (updated[image.cameraLabel].length === 0) {
//                   delete updated[image.cameraLabel];
//                 }
//               });
//               return updated;
//             });

//             setToastMessage(`${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''} deleted successfully`);
//             setToastType("success");
//             setSelectedImages([]);
//             setIsSelectionMode(false);
//           } catch (error) {
//             setToastMessage("Failed to delete images");
//             setToastType("error");
//           }
//         }}
//         onCancel={() => setAlert(null)}
//         focusCancelBtn
//       >
//         This action cannot be undone.
//       </SweetAlert>
//     );
//   };

//   // NEW: Handle image preview
//   const handleImagePreview = (e, image) => {
//     if (e && e.stopPropagation) e.stopPropagation();
//     if (!isSelectionMode) {
//       setPreviewImage(image);
//       setPreviewModal(true);
//     }
//   };

//   const selectedCameraImages = selectedCameraLabel
//     ? galleryImagesByCamera[selectedCameraLabel] || []
//     : [];

//   const totalImagesCount = Object.values(galleryImagesByCamera).reduce(
//     (sum, images) => sum + images.length, 0
//   );

//   return (
//     <div
//       className="page-content"
//       style={{
//         backgroundColor: "#f8f9fa",
//         minHeight: "100vh",
//         display: "flex",
//         flexDirection: "column",
//       }}
//     >
//       <MetaTags>
//         <title>Remote Camera Gallery</title>
//       </MetaTags>

//       {/* Header */}
//       <div style={{ backgroundColor: "#fff", borderBottom: "1px solid #e5e7eb", padding: "12px 0" }}>
//         <Container fluid className="px-4">
//           <Row className="align-items-center g-2">
//             <Col xs={12} md={6} lg={2}>
//               <h5 className="mb-0" style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>
//                 Remote Camera Gallery
//               </h5>
//             </Col>

//             <Col xs={12} md={6} lg={3}>
//               <div
//                 style={{
//                   backgroundColor: "#f9fafb",
//                   border: "1px solid #e5e7eb",
//                   borderRadius: "6px",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   padding: "6px 10px",
//                   height: "40px",
//                 }}
//               >
//                 <span
//                   style={{
//                     fontSize: "12px",
//                     color: "#6b7280",
//                     fontWeight: "500",
//                     textTransform: "uppercase",
//                     letterSpacing: "0.3px",
//                     marginRight: "8px",
//                     whiteSpace: "nowrap",
//                   }}
//                 >
//                   Selected Stage:
//                 </span>
//                 <Input
//                   type="select"
//                   value={selectedStageIndex}
//                   onChange={handleStageChange}
//                   style={{
//                     fontSize: "13px",
//                     borderRadius: "4px",
//                     border: "1px solid #d1d5db",
//                     padding: "4px 8px",
//                     color: "#374151",
//                     height: "28px",
//                     width: "70%",
//                   }}
//                 >
//                   {stages.map((stage, index) => (
//                     <option key={stage._id.$oid} value={index}>
//                       {stage.stage_name} ({stage.stage_code})
//                     </option>
//                   ))}
//                 </Input>
//               </div>
//             </Col>

//             <Col xs={12} md={6} lg={4}>
//               <div
//                 style={{
//                   padding: "8px 12px",
//                   backgroundColor: "#f9fafb",
//                   borderRadius: "6px",
//                   border: "1px solid #e5e7eb",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   height: "40px",
//                   whiteSpace: "nowrap",
//                   overflow: "hidden",
//                   textOverflow: "ellipsis",
//                 }}
//               >
//                 <span
//                   style={{
//                     fontSize: "12px",
//                     color: "#6b7280",
//                     fontWeight: "500",
//                     textTransform: "uppercase",
//                     letterSpacing: "0.3px",
//                   }}
//                 >
//                   Current Stage:
//                 </span>
//                 <span
//                   style={{
//                     fontSize: "13px",
//                     fontWeight: "600",
//                     color: "#111827",
//                     marginLeft: "6px",
//                     overflow: "hidden",
//                     textOverflow: "ellipsis",
//                   }}
//                 >
//                   {selectedStage?.stage_name}{" "}
//                   <span style={{ color: "#6b7280", fontWeight: "400" }}>
//                     ({selectedStage?.stage_code})
//                   </span>
//                 </span>
//               </div>
//             </Col>

//             <Col xs={12} md={6} lg={3} className="d-flex gap-2 justify-content-lg-end">
//               <Button
//                 size="sm"
//                 onClick={handleTrainingSync}
//                 disabled={isSyncing}
//                 style={{
//                   backgroundColor: "#10b981",
//                   border: "none",
//                   borderRadius: "6px",
//                   padding: "6px 12px",
//                   fontSize: "13px",
//                   fontWeight: "500",
//                   color: "#fff",
//                   height: "34px",
//                 }}
//               >
//                 {isSyncing ? (
//                   <>
//                     <i className="fa fa-spinner fa-spin me-1" /> Syncing
//                   </>
//                 ) : (
//                   <>
//                     <i className="fa fa-sync-alt me-1" /> Training Sync
//                   </>
//                 )}
//               </Button>

//               <Button
//                 size="sm"
//                 onClick={back}
//                 style={{
//                   backgroundColor: "#4441e6ff",
//                   border: "1px solid #d1d5db",
//                   borderRadius: "6px",
//                   padding: "6px 12px",
//                   fontSize: "13px",
//                   fontWeight: "500",
//                   color: "#fff",
//                   height: "34px",
//                 }}
//               >
//                 <i className="mdi mdi-arrow-left me-1" />
//                 Back
//               </Button>
//             </Col>
//           </Row>
//         </Container>
//       </div>

//       {selectedStage && (
//         <Container fluid className="px-4 py-4" style={{ flex: "1 1 auto", overflow: "hidden" }}>
//           <Row style={{ height: "100%" }}>
//             {alert}

//             <Col xs={12} lg={7} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
//               <div style={{ flex: 1, overflowY: "auto", paddingLeft: "12px" }}>
//                 <Row className="g-3 mb-4">
//                   {cameras.map((camera, index) => (
//                     <Col key={index} xs={12} sm={6}>
//                       <Card
//                         className="border-0"
//                         style={{
//                           borderRadius: "10px",
//                           overflow: "hidden",
//                           boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//                           backgroundColor: "#fff",
//                           transition: "transform 0.2s ease, box-shadow 0.2s ease",
//                         }}
//                         onMouseEnter={(e) => {
//                           e.currentTarget.style.transform = "translateY(-3px)";
//                           e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
//                         }}
//                         onMouseLeave={(e) => {
//                           e.currentTarget.style.transform = "translateY(0)";
//                           e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
//                         }}
//                       >
//                         <div
//                           style={{
//                             padding: "12px 16px",
//                             backgroundColor: "#f8f9fa",
//                             borderBottom: "1px solid #e5e7eb",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "space-between",
//                           }}
//                         >
//                           <h6
//                             className="mb-0 text-truncate"
//                             style={{
//                               fontSize: "14px",
//                               fontWeight: "600",
//                               color: "#1f2937",
//                               letterSpacing: "0.3px",
//                             }}
//                           >
//                             {camera.label}
//                           </h6>
//                           <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
//                             <span
//                               style={{
//                                 width: "8px",
//                                 height: "8px",
//                                 borderRadius: "50%",
//                                 backgroundColor: "#10b981",
//                                 animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
//                               }}
//                             />
//                             <span
//                               style={{
//                                 fontSize: "12px",
//                                 color: "#10b981",
//                                 fontWeight: "600",
//                                 textTransform: "uppercase",
//                                 letterSpacing: "0.5px",
//                               }}
//                             >
//                               Live
//                             </span>
//                           </div>
//                         </div>

//                         <CardBody className="p-0">
//                           <div
//                             style={{
//                               position: "relative",
//                               width: "100%",
//                               paddingBottom: "75%",
//                               backgroundColor: "#000",
//                             }}
//                           >
//                             <WebcamCapture
//                               ref={(el) => (webcamRefs.current[camera.originalLabel] = el)}
//                               key={camera.originalLabel}
//                               resolution={{ width: 640, height: 480 }}
//                               zoom={1}
//                               center={{ x: 0.5, y: 0.5 }}
//                               cameraLabel={camera.originalLabel}
//                               style={{
//                                 position: "absolute",
//                                 top: 0,
//                                 left: 0,
//                                 width: "100%",
//                                 height: "100%",
//                                 objectFit: "cover",
//                               }}
//                             />
//                           </div>
//                         </CardBody>
//                       </Card>
//                     </Col>
//                   ))}
//                 </Row>

//                 {/* Capture Button */}
//                 <div className="text-center pb-3">
//                   <Button
//                     size="lg"
//                     onClick={handleCaptureAll}
//                     disabled={!cameraAvailable || capturing}
//                     style={{
//                       backgroundColor: "#6366f1",
//                       border: "none",
//                       borderRadius: "8px",
//                       padding: "12px 32px",
//                       fontSize: "15px",
//                       fontWeight: "600",
//                       color: "#fff",
//                       opacity: (!cameraAvailable || capturing) ? 0.6 : 1,
//                       cursor: (!cameraAvailable || capturing) ? "not-allowed" : "pointer",
//                     }}
//                   >
//                     {capturing ? (
//                       <>
//                         <i className="fa fa-spinner fa-spin me-2" /> Capturing...
//                       </>
//                     ) : (
//                       <>
//                         <i className="fa fa-camera me-2" /> Capture All Cameras
//                       </>
//                     )}
//                   </Button>
//                 </div>
//               </div>
//             </Col>

//             <Col xs={12} lg={5} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
//               <div
//                 style={{
//                   backgroundColor: "#fff",
//                   borderRadius: "10px",
//                   padding: "16px",
//                   boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//                   height: "100%",
//                   display: "flex",
//                   flexDirection: "column",
//                 }}
//               >
//                 <div style={{ marginBottom: "16px" }}>
//                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
//                     <h6 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#111827" }}>
//                       <i className="fa fa-images me-2" style={{ color: "#6366f1" }} />
//                       Image Gallery ({totalImagesCount})
//                     </h6>
//                     <div style={{ display: "flex", gap: "6px" }}>
//                       <Button
//                         size="sm"
//                         onClick={fetchGalleryImages}
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
//                         <i className={`fa fa-sync-alt me-1 ${loadingGallery ? 'fa-spin' : ''}`} /> Refresh
//                       </Button>
//                     </div>
//                   </div>

//                   {/* Camera Label Tabs */}
//                   {Object.keys(galleryImagesByCamera).length > 0 && (
//                     <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
//                       {Object.keys(galleryImagesByCamera).map(cameraLabel => (
//                         <button
//                           key={cameraLabel}
//                           onClick={() => {
//                             setSelectedCameraLabel(cameraLabel);
//                             setSelectedImages([]);
//                             setIsSelectionMode(false);
//                           }}
//                           style={{
//                             padding: "6px 12px",
//                             borderRadius: "6px",
//                             border: selectedCameraLabel === cameraLabel
//                               ? "2px solid #6366f1"
//                               : "1px solid #e5e7eb",
//                             backgroundColor: selectedCameraLabel === cameraLabel
//                               ? "#eef2ff"
//                               : "#fff",
//                             color: selectedCameraLabel === cameraLabel
//                               ? "#6366f1"
//                               : "#6b7280",
//                             fontSize: "12px",
//                             fontWeight: "600",
//                             cursor: "pointer",
//                             transition: "all 0.2s ease",
//                           }}
//                         >
//                           {cameraLabel} ({galleryImagesByCamera[cameraLabel].length})
//                         </button>
//                       ))}
//                     </div>
//                   )}

//                   {/* Selection Controls */}
//                   {selectedCameraImages.length > 0 && (
//                     <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
//                       <Button
//                         size="sm"
//                         color={isSelectionMode ? "secondary" : "primary"}
//                         onClick={toggleSelectionMode}
//                         style={{
//                           borderRadius: "6px",
//                           padding: "4px 12px",
//                           fontSize: "12px",
//                           fontWeight: "500",
//                         }}
//                       >
//                         <i className={`fa ${isSelectionMode ? 'fa-times' : 'fa-check-square'} me-1`} />
//                         {isSelectionMode ? 'Cancel' : 'Select'}
//                       </Button>

//                       {isSelectionMode && (
//                         <>
//                           <Button
//                             size="sm"
//                             color="info"
//                             onClick={handleSelectAll}
//                             style={{
//                               borderRadius: "6px",
//                               padding: "4px 12px",
//                               fontSize: "12px",
//                               fontWeight: "500",
//                             }}
//                           >
//                             <i className="fa fa-check-double me-1" />
//                             {selectedImages.length === selectedCameraImages.length ? 'Deselect All' : 'Select All'}
//                           </Button>

//                           <Button
//                             size="sm"
//                             color="danger"
//                             onClick={handleDeleteSelected}
//                             disabled={selectedImages.length === 0}
//                             style={{
//                               borderRadius: "6px",
//                               padding: "4px 12px",
//                               fontSize: "12px",
//                               fontWeight: "500",
//                               opacity: selectedImages.length === 0 ? 0.5 : 1,
//                             }}
//                           >
//                             <i className="fa fa-trash me-1" />
//                             Delete ({selectedImages.length})
//                           </Button>
//                         </>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 {/* Images Grid */}
//                 <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
//                   {loadingGallery ? (
//                     <div
//                       style={{
//                         display: "flex",
//                         flexDirection: "column",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         height: "100%",
//                         color: "#9ca3af",
//                       }}
//                     >
//                       <Spinner color="primary" />
//                       <p style={{ fontSize: "14px", fontWeight: "500", marginTop: "12px" }}>Loading images...</p>
//                     </div>
//                   ) : selectedCameraImages.length === 0 ? (
//                     <div
//                       style={{
//                         display: "flex",
//                         flexDirection: "column",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         height: "100%",
//                         color: "#9ca3af",
//                       }}
//                     >
//                       <i className="fa fa-images" style={{ fontSize: "64px", marginBottom: "16px", opacity: 0.3 }} />
//                       <p style={{ fontSize: "14px", fontWeight: "500" }}>
//                         {selectedCameraLabel ? `No images for ${selectedCameraLabel}` : "No images captured yet"}
//                       </p>
//                       <p style={{ fontSize: "12px" }}>{`Click Capture All Cameras to start`}</p>
//                     </div>
//                   ) : (
//                     <Row className="g-3">
//                       {selectedCameraImages.map((image) => {
//                         const isSelected = selectedImages.some(img => img.id === image.id);
//                         return (
//                           <Col key={image.id} xs={6} md={4}>
//                             <div
//                               style={{
//                                 position: "relative",
//                                 borderRadius: "8px",
//                                 overflow: "hidden",
//                                 border: isSelected
//                                   ? "3px solid #6366f1"
//                                   : selectedImage?.id === image.id
//                                     ? "3px solid #10b981"
//                                     : "1px solid #e5e7eb",
//                                 cursor: "pointer",
//                                 transition: "all 0.2s ease",
//                               }}
//                               onClick={() => {
//                                 if (isSelectionMode) {
//                                   handleImageSelect(image);
//                                 } else {
//                                   setSelectedImage(image);
//                                 }
//                               }}
//                               onMouseEnter={(e) => {
//                                 if (!isSelectionMode) {
//                                   e.currentTarget.style.transform = "scale(1.05)";
//                                   e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
//                                 }
//                               }}
//                               onMouseLeave={(e) => {
//                                 if (!isSelectionMode) {
//                                   e.currentTarget.style.transform = "scale(1)";
//                                   e.currentTarget.style.boxShadow = "none";
//                                 }
//                               }}
//                             >
//                               <img
//                                 src={`${ImageUrl}${image.local_path}`}
//                                 alt={image.cameraLabel}
//                                 style={{
//                                   width: "100%",
//                                   height: "120px",
//                                   objectFit: "cover",
//                                 }}
//                                 onError={(e) => {
//                                   console.error("Image not found:", e.target.src);
//                                   e.target.src = "/fallback.png";
//                                 }}
//                               />

//                               {/* Selection Checkbox */}
//                               {isSelectionMode && (
//                                 <div
//                                   style={{
//                                     position: "absolute",
//                                     top: "8px",
//                                     left: "8px",
//                                     width: "24px",
//                                     height: "24px",
//                                     borderRadius: "4px",
//                                     backgroundColor: isSelected ? "#6366f1" : "rgba(255,255,255,0.9)",
//                                     border: isSelected ? "2px solid #6366f1" : "2px solid #d1d5db",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     transition: "all 0.2s ease",
//                                   }}
//                                 >
//                                   {isSelected && (
//                                     <i className="fa fa-check" style={{ color: "#fff", fontSize: "12px" }} />
//                                   )}
//                                 </div>
//                               )}

//                               {/* Preview Button */}
//                               {!isSelectionMode && (
//                                 <button
//                                   onClick={(e) => handleImagePreview(e, image)}
//                                   style={{
//                                     position: "absolute",
//                                     top: "8px",
//                                     left: "8px",
//                                     backgroundColor: "rgba(99, 102, 241, 0.9)",
//                                     border: "none",
//                                     borderRadius: "4px",
//                                     color: "#fff",
//                                     width: "28px",
//                                     height: "28px",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     cursor: "pointer",
//                                     fontSize: "14px",
//                                     transition: "all 0.2s ease",
//                                   }}
//                                   onMouseEnter={(e) => {
//                                     e.currentTarget.style.backgroundColor = "rgba(99, 102, 241, 1)";
//                                   }}
//                                   onMouseLeave={(e) => {
//                                     e.currentTarget.style.backgroundColor = "rgba(99, 102, 241, 0.9)";
//                                   }}
//                                 >
//                                   <i className="fa fa-eye" />
//                                 </button>
//                               )}

//                               <div
//                                 style={{
//                                   position: "absolute",
//                                   bottom: 0,
//                                   left: 0,
//                                   right: 0,
//                                   background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
//                                   padding: "8px 8px 4px",
//                                 }}
//                               >
//                                 <p
//                                   style={{
//                                     margin: 0,
//                                     fontSize: "11px",
//                                     fontWeight: "600",
//                                     color: "#fff",
//                                     textOverflow: "ellipsis",
//                                     overflow: "hidden",
//                                     whiteSpace: "nowrap",
//                                   }}
//                                 >
//                                   {image.filename}
//                                 </p>
//                               </div>

//                               {/* Delete Button */}
//                               {!isSelectionMode && (
//                                 <button
//                                   onClick={(e) => handleDelete(e, image.filename, image.cameraLabel)}
//                                   style={{
//                                     position: "absolute",
//                                     top: "8px",
//                                     right: "8px",
//                                     backgroundColor: "rgba(239, 68, 68, 0.9)",
//                                     border: "none",
//                                     borderRadius: "4px",
//                                     color: "#fff",
//                                     width: "28px",
//                                     height: "28px",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     cursor: "pointer",
//                                     fontSize: "14px",
//                                     transition: "all 0.2s ease",
//                                   }}
//                                   onMouseEnter={(e) => {
//                                     e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 1)";
//                                   }}
//                                   onMouseLeave={(e) => {
//                                     e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.9)";
//                                   }}
//                                 >
//                                   <i className="fa fa-times" />
//                                 </button>
//                               )}
//                             </div>
//                           </Col>
//                         );
//                       })}
//                     </Row>
//                   )}
//                 </div>

//                 {/* Selected Image Details */}
//                 {selectedImage && !isSelectionMode && (
//                   <div
//                     style={{
//                       marginTop: "16px",
//                       padding: "12px",
//                       backgroundColor: "#f9fafb",
//                       borderRadius: "8px",
//                       border: "1px solid #e5e7eb",
//                     }}
//                   >
//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
//                       <h6 style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#111827" }}>
//                         {selectedImage.cameraLabel}
//                       </h6>
//                       <button
//                         onClick={() => setSelectedImage(null)}
//                         style={{
//                           background: "none",
//                           border: "none",
//                           color: "#6b7280",
//                           fontSize: "18px",
//                           cursor: "pointer",
//                           padding: "0",
//                         }}
//                       >
//                         ×
//                       </button>
//                     </div>
//                     <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#6b7280" }}>
//                       <i className="fa fa-file me-1" />
//                       {selectedImage.filename}
//                     </p>
//                     <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#6b7280" }}>
//                       <i className="fa fa-clock me-1" />
//                       {new Date(selectedImage.timestamp).toLocaleString()}
//                     </p>
//                     {selectedImage.width && selectedImage.height && (
//                       <p style={{ margin: "0", fontSize: "11px", color: "#6b7280" }}>
//                         <i className="fa fa-image me-1" />
//                         {selectedImage.width} × {selectedImage.height}
//                       </p>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </Col>
//           </Row>
//         </Container>
//       )}

//       {/* Image Preview Modal */}
//       <Modal
//         isOpen={previewModal}
//         toggle={() => setPreviewModal(false)}
//         size="lg"
//         centered
//       >
//         <ModalHeader toggle={() => setPreviewModal(false)}>
//           Image Preview
//         </ModalHeader>
//         <ModalBody style={{ padding: 0 }}>
//           {previewImage && (
//             <div>
//               <img
//                 src={`${ImageUrl}${previewImage.local_path}`}
//                 alt={previewImage.cameraLabel}
//                 style={{
//                   width: "100%",
//                   height: "auto",
//                   maxHeight: "70vh",
//                   objectFit: "contain",
//                 }}
//                 onError={(e) => {
//                   console.error("Image not found:", e.target.src);
//                   e.target.src = "/fallback.png";
//                 }}
//               />
//               <div style={{ padding: "16px", backgroundColor: "#f9fafb" }}>
//                 <h6 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "#111827" }}>
//                   {previewImage.cameraLabel}
//                 </h6>
//                 <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280" }}>
//                   <i className="fa fa-file me-1" />
//                   {previewImage.filename}
//                 </p>
//                 <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280" }}>
//                   <i className="fa fa-clock me-1" />
//                   {new Date(previewImage.timestamp).toLocaleString()}
//                 </p>
//                 {previewImage.width && previewImage.height && (
//                   <p style={{ margin: "0", fontSize: "12px", color: "#6b7280" }}>
//                     <i className="fa fa-image me-1" />
//                     {previewImage.width} × {previewImage.height}
//                   </p>
//                 )}
//               </div>
//             </div>
//           )}
//         </ModalBody>
//       </Modal>

//       {/* Toast Notification */}
//       {toastMessage && (
//         <CustomToast
//           message={toastMessage}
//           type={toastType}
//           onClose={() => setToastMessage(null)}
//         />
//       )}
//     </div>
//   );
// };

// export default RemoteSingleStg;


// import React, { useEffect, useRef, useState } from "react";
// import { useLocation, useHistory } from "react-router-dom";
// import { Container, Button, Col, Row, Card, CardBody, Input, Spinner, Modal, ModalHeader, ModalBody } from "reactstrap";
// import MetaTags from "react-meta-tags";
// import { v4 as uuidv4 } from "uuid";
// import urlSocket from "./urlSocket";
// import WebcamCapture from "../WebcamCustom/WebcamCapture";
// import PropTypes from 'prop-types';
// import ImageUrl from "./imageUrl";
// import SweetAlert from "react-bootstrap-sweetalert";

// const CustomToast = ({ message, type, onClose }) => {
//   const [isVisible, setIsVisible] = useState(true);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsVisible(false);
//       onClose();
//     }, 5000);
//     return () => clearTimeout(timer);
//   }, [onClose]);

//   return (
//     isVisible && (
//       <div
//         style={{
//           position: 'fixed',
//           top: '20px',
//           right: '20px',
//           maxWidth: '350px',
//           zIndex: '9999',
//           borderRadius: '8px',
//           padding: '12px 16px',
//           backgroundColor: type === 'error' ? '#ef4444' : '#10b981',
//           color: 'white',
//           fontWeight: '500',
//           fontSize: '14px',
//           boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           gap: '12px',
//         }}
//       >
//         <span>{message}</span>
//         <button
//           onClick={() => {
//             setIsVisible(false);
//             onClose();
//           }}
//           style={{
//             background: 'none',
//             border: 'none',
//             color: 'white',
//             fontSize: '20px',
//             cursor: 'pointer',
//             padding: '0',
//             lineHeight: '1',
//           }}
//         >
//           ×
//         </button>
//       </div>
//     )
//   );
// };

// CustomToast.propTypes = {
//   message: PropTypes.string.isRequired,
//   type: PropTypes.oneOf(['success', 'error']).isRequired,
//   onClose: PropTypes.func.isRequired,
// };

// const RemoteSingleStg = () => {
//   const location = useLocation();
//   const history = useHistory();
//   const { datas } = location.state || {};
//   const stages = datas?.stages || [];
//   const [isCameraValid, setIsCameraValid] = useState(true);
//   const [selectedStageIndex, setSelectedStageIndex] = useState(0);
//   const [cameraStreams, setCameraStreams] = useState([]);
//   const [cameraAvailable, setCameraAvailable] = useState(false);
//   const [galleryImagesByCamera, setGalleryImagesByCamera] = useState({});
//   const [selectedCameraLabel, setSelectedCameraLabel] = useState(null);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [loadingGallery, setLoadingGallery] = useState(false);

//   // New states for multi-select
//   const [selectedImages, setSelectedImages] = useState([]);
//   const [previewModal, setPreviewModal] = useState(false);
//   const [previewImage, setPreviewImage] = useState(null);

//   const webcamRefs = useRef([]);
//   const [capturing, setCapturing] = useState(false);
//   const [isSyncing, setIsSyncing] = useState(false);
//   const [toastMessage, setToastMessage] = useState(null);
//   const [toastType, setToastType] = useState(null);
//   const [alert, setAlert] = useState(null);
//   const [deletingImages, setDeletingImages] = useState(false);

//   const selectedStage = stages[selectedStageIndex];
//   const cameras = selectedStage?.camera_selection?.cameras || [];

//   // Fetch images from backend
//   const fetchGalleryImages = async () => {
//     if (!selectedStage) return;

//     setLoadingGallery(true);
//     try {
//       const response = await urlSocket.post("/get_training_images", {
//         comp_code: datas.comp_code,
//         stage_code: selectedStage.stage_code,
//       });

//       if (response?.data?.images) {
//         const groupedImages = {};
//         response.data.images.forEach(img => {
//           const cameraLabel = img.camera_label;
//           if (!groupedImages[cameraLabel]) {
//             groupedImages[cameraLabel] = [];
//           }
//           groupedImages[cameraLabel].push({
//             id: img._id || uuidv4(),
//             filename: img.filename,
//             local_path: img.insp_local_path,
//             cameraLabel: img.camera_label,
//             timestamp: img.timestamp,
//             width: img.width,
//             height: img.height,
//           });
//         });

//         setGalleryImagesByCamera(groupedImages);

//         const cameraLabels = Object.keys(groupedImages);
//         if (cameraLabels.length > 0 && !selectedCameraLabel) {
//           setSelectedCameraLabel(cameraLabels[0]);
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching gallery images:", error);
//       setToastMessage("Failed to load gallery images");
//       setToastType("error");
//     } finally {
//       setLoadingGallery(false);
//     }
//   };

//   useEffect(() => {
//     fetchGalleryImages();
//     setSelectedImages([]);
//   }, [selectedStageIndex]);

//   useEffect(() => {
//     let activeStreams = [];

//     async function setupCameras() {
//       cameraStreams.forEach((s) => s?.getTracks().forEach((t) => t.stop()));

//       await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
//       const devices = await navigator.mediaDevices.enumerateDevices();

//       const newStreams = [];

//       for (let cam of cameras) {
//         try {
//           const videoDevice = devices.find((d) => {
//             if (d.kind !== "videoinput") return false;
//             const label = d.label?.toLowerCase() || "";
//             const matchByLabel = cam.originalLabel && label.includes(cam.originalLabel.toLowerCase());
//             const matchByVID = cam.v_id && label.includes(cam.v_id.toLowerCase());
//             const matchByPID = cam.p_id && label.includes(cam.p_id.toLowerCase());
//             return matchByLabel || matchByVID || matchByPID;
//           });

//           const stream = videoDevice
//             ? await navigator.mediaDevices.getUserMedia({
//               video: { deviceId: { exact: videoDevice.deviceId } },
//               audio: false,
//             })
//             : null;

//           newStreams.push(stream);
//         } catch (err) {
//           console.error(`Error accessing ${cam.label}:`, err);
//           newStreams.push(null);
//         }
//       }

//       activeStreams = newStreams;
//       setCameraStreams(newStreams);
//       setCameraAvailable(newStreams.some((s) => s !== null));
//       validateCameraPreviews(newStreams);
//     }

//     setupCameras();

//     return () => {
//       activeStreams.forEach((s) => s && s.getTracks().forEach((t) => t.stop()));
//     };
//   }, [selectedStageIndex, cameras]);

//   const validateCameraPreviews = (streams) => {
//     const missingCameras = streams
//       .map((stream, index) => stream === null ? cameras[index]?.label : null)
//       .filter((label) => label !== null);

//     if (missingCameras.length === 0) {
//       setIsCameraValid(true);
//       return;
//     }
//     setIsCameraValid(false);

//     const missingCamerasList = missingCameras.join(", ");
//     if (missingCameras.length === 1) {
//       setToastMessage(`The "${missingCamerasList}" is not showing its preview.`);
//     } else {
//       setToastMessage(`${missingCameras.length} cameras are not showing previews: ${missingCamerasList}`);
//     }
//     setToastType("error");
//   };

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       cameraStreams.forEach((stream, i) => {
//         const video = webcamRefs.current[i];
//         if (video && stream && video.srcObject !== stream) {
//           video.srcObject = stream;
//         }
//       });
//     }, 400);
//     return () => clearTimeout(timer);
//   }, [cameraStreams]);

//   const handleStageChange = (e) => {
//     setSelectedStageIndex(parseInt(e.target.value));
//     setSelectedCameraLabel(null);
//     setSelectedImage(null);
//   };

//   const back = () => history.goBack();

//   const dataURLtoBlob = (dataURL) => {
//     const byteString = atob(dataURL.split(",")[1]);
//     const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
//     const ab = new ArrayBuffer(byteString.length);
//     const ia = new Uint8Array(ab);
//     for (let i = 0; i < byteString.length; i++) {
//       ia[i] = byteString.charCodeAt(i);
//     }
//     return new Blob([ab], { type: mimeString });
//   };

//   const handleCaptureAll = async () => {
//     if (capturing) return;

//     const invalidCameras = [];
//     for (const cam of cameras) {
//       const webcamInstance = webcamRefs.current[cam.originalLabel];
//       if (!webcamInstance || !webcamInstance.captureZoomedImage || webcamInstance.cameraDisconnected) {
//         invalidCameras.push(cam.label);
//       }
//     }

//     if (invalidCameras.length > 0) {
//       const message = invalidCameras.length === 1
//         ? `Camera "${invalidCameras[0]}" is not showing preview.`
//         : `${invalidCameras.length} cameras not showing preview: ${invalidCameras.join(", ")}`;
//       setToastMessage(message);
//       setToastType("error");
//       return;
//     }

//     setCapturing(true);

//     try {
//       const successfulCameras = [];
//       const formData = new FormData();

//       formData.append("comp_name", datas.comp_name);
//       formData.append("comp_id", datas.comp_id);
//       formData.append("comp_code", datas.comp_code);
//       formData.append("stage_name", selectedStage.stage_name);
//       formData.append("stage_code", selectedStage.stage_code);

//       for (let i = 0; i < cameras.length; i++) {
//         const cam = cameras[i];
//         const webcamInstance = webcamRefs.current[cam.originalLabel];

//         try {
//           const imageSrcData = await webcamInstance.captureZoomedImage();
//           if (!imageSrcData) {
//             throw new Error(`No image data from ${cam.label}`);
//           }

//           const blob = dataURLtoBlob(imageSrcData);
//           const fileName = `${cam.label}_${uuidv4()}.png`;

//           const imgObj = new Image();
//           imgObj.src = imageSrcData;
//           await new Promise((resolve) => {
//             imgObj.onload = resolve;
//             imgObj.onerror = resolve;
//           });
//           const width = imgObj.naturalWidth || 0;
//           const height = imgObj.naturalHeight || 0;

//           formData.append(`img_${i}`, blob, fileName);
//           formData.append(`img_${i}_label`, cam.label);
//           formData.append(`img_${i}_width`, width);
//           formData.append(`img_${i}_height`, height);

//           successfulCameras.push(cam.label);
//         } catch (captureError) {
//           setToastMessage(`Failed to capture from "${cam.label}"`);
//           setToastType("error");
//           setCapturing(false);
//           return;
//         }
//       }

//       const response = await urlSocket.post("/remoteMultiCapture", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       setToastMessage(`Successfully captured from: ${successfulCameras.join(", ")}`);
//       setToastType("success");

//       setTimeout(() => {
//         fetchGalleryImages();
//       }, 1000);
//     } catch (error) {
//       setToastMessage(`Capture failed: ${error.message || "An error occurred"}`);
//       setToastType("error");
//     }

//     setCapturing(false);
//   };

//   const handleTrainingSync = async () => {
//     try {
//       setIsSyncing(true);
//       const res = await urlSocket.post("/sync_training_mode_result_train");

//       if (res?.data?.count > 0) {
//         setToastMessage(`${res.data.sts} - Total Synced: ${res.data.count}`);
//         setToastType("success");
//         setTimeout(() => {
//           fetchGalleryImages();
//         }, 1000);
//       } else {
//         setToastMessage("All components are already synced");
//         setToastType("success");
//       }
//     } catch (err) {
//       setToastMessage("Error during sync. Please try again.");
//       setToastType("error");
//     } finally {
//       setIsSyncing(false);
//     }
//   };

//   const handleDeleteImage = async (filename, cameraLabel) => {
//     try {
//       await urlSocket.post("/delete_training_image", {
//         filename,
//         camera_label: cameraLabel,
//       });

//       setGalleryImagesByCamera(prev => {
//         const updated = { ...prev };
//         if (updated[cameraLabel]) {
//           updated[cameraLabel] = updated[cameraLabel].filter(
//             img => img.filename !== filename
//           );
//           if (updated[cameraLabel].length === 0) {
//             delete updated[cameraLabel];
//           }
//         }
//         return updated;
//       });

//       setSelectedImages(prev => prev.filter(id => id !== filename));
//       if (previewImage?.filename === filename) {
//         setPreviewImage(null);
//         // setShowPreview(false);
//       }

//       setToastMessage("Image deleted successfully");
//       setToastType("success");
//     } catch (err) {
//       console.error("Delete error:", err);
//       setToastMessage("Failed to delete image");
//       setToastType("error");
//     }
//     finally {
//       setDeletingImages(false);                  // ← stop spinner
//     }
//   };


//   const handleDelete = (e, filename, cameraLabel) => {
//     if (e && e.stopPropagation) e.stopPropagation();

//     setAlert(
//       <SweetAlert
//         warning
//         showCancel
//         confirmBtnText="Yes, delete it!"
//         cancelBtnText="Cancel"
//         confirmBtnBsStyle="danger"
//         title="Are you sure?"
//         onConfirm={() => {
//           setAlert(null);
//           handleDeleteImage(filename, cameraLabel);
//         }}
//         onCancel={() => setAlert(null)}
//         focusCancelBtn
//       >
//         This action cannot be undone.
//       </SweetAlert>
//     );
//   };

//   // Handle image selection
//   const handleImageSelect = (image) => {
//     setSelectedImages(prev => {
//       const isSelected = prev.some(img => img.id === image.id);
//       if (isSelected) {
//         return prev.filter(img => img.id !== image.id);
//       } else {
//         return [...prev, image];
//       }
//     });
//   };

//   // Select all images for current camera
//   const handleSelectAll = () => {
//     if (selectedImages.length === selectedCameraImages.length) {
//       setSelectedImages([]);
//     } else {
//       setSelectedImages([...selectedCameraImages]);
//     }
//   };

//   // Delete selected images
//   const handleDeleteSelected = () => {
//     if (selectedImages.length === 0) return;

//     setAlert(
//       <SweetAlert
//         warning
//         showCancel
//         confirmBtnText="Yes, delete them!"
//         cancelBtnText="Cancel"
//         confirmBtnBsStyle="danger"
//         title={`Delete ${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''}?`}
//         onConfirm={async () => {
//           setAlert(null);
//           setDeletingImages(true);
//           try {
//             for (const image of selectedImages) {
//               await urlSocket.post("/delete_training_image", {
//                 filename: image.filename,
//                 camera_label: image.cameraLabel,
//               });
//             }

//             setGalleryImagesByCamera(prev => {
//               const updated = { ...prev };
//               if (updated[cameraLabel]) {
//                 updated[cameraLabel] = updated[cameraLabel].filter(
//                   img => img.filename !== filename
//                 );
//                 if (updated[cameraLabel].length === 0) {
//                   delete updated[cameraLabel];
//                 }
//               }
//               return updated;
//             });

//             setToastMessage(`${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''} deleted successfully`);
//             setToastType("success");
//             setSelectedImages([]);
//           } catch (error) {
//             setToastMessage("Failed to delete images");
//             setToastType("error");
//           }
//           finally {
//             setDeletingImages(false);            // ← stop spinner
//           }
//         }}
//         onCancel={() => setAlert(null)}
//         focusCancelBtn
//       >
//         This action cannot be undone.
//       </SweetAlert>
//     );
//   };

//   // Handle image preview
//   const handleImagePreview = (e, image) => {
//     if (e && e.stopPropagation) e.stopPropagation();
//     setPreviewImage(image);
//     setPreviewModal(true);
//   };

//   const selectedCameraImages = selectedCameraLabel
//     ? galleryImagesByCamera[selectedCameraLabel] || []
//     : [];

//   const totalImagesCount = Object.values(galleryImagesByCamera).reduce(
//     (sum, images) => sum + images.length, 0
//   );

//   return (
//     <div
//       className="page-content"
//       style={{
//         backgroundColor: "#f8f9fa",
//         minHeight: "100vh",
//         display: "flex",
//         flexDirection: "column",
//       }}
//     >
//       <MetaTags>
//         <title>Remote Camera Gallery</title>
//       </MetaTags>

//       {/* Header */}
//       <div style={{ backgroundColor: "#fff", borderBottom: "1px solid #e5e7eb", padding: "12px 0" }}>
//         <Container fluid className="px-4">
//           <Row className="align-items-center g-2">
//             <Col xs={12} md={6} lg={2}>
//               <h5 className="mb-0" style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>
//                 Remote Camera Gallery
//               </h5>
//             </Col>

//             <Col xs={12} md={6} lg={3}>
//               <div
//                 style={{
//                   backgroundColor: "#f9fafb",
//                   border: "1px solid #e5e7eb",
//                   borderRadius: "6px",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   padding: "6px 10px",
//                   height: "40px",
//                 }}
//               >
//                 <span
//                   style={{
//                     fontSize: "12px",
//                     color: "#6b7280",
//                     fontWeight: "500",
//                     textTransform: "uppercase",
//                     letterSpacing: "0.3px",
//                     marginRight: "8px",
//                     whiteSpace: "nowrap",
//                   }}
//                 >
//                   Selected Stage:
//                 </span>
//                 <Input
//                   type="select"
//                   value={selectedStageIndex}
//                   onChange={handleStageChange}
//                   style={{
//                     fontSize: "13px",
//                     borderRadius: "4px",
//                     border: "1px solid #d1d5db",
//                     padding: "4px 8px",
//                     color: "#374151",
//                     height: "28px",
//                     width: "70%",
//                   }}
//                 >
//                   {stages.map((stage, index) => (
//                     <option key={stage._id.$oid} value={index}>
//                       {stage.stage_name} ({stage.stage_code})
//                     </option>
//                   ))}
//                 </Input>
//               </div>
//             </Col>

//             <Col xs={12} md={6} lg={4}>
//               <div
//                 style={{
//                   padding: "8px 12px",
//                   backgroundColor: "#f9fafb",
//                   borderRadius: "6px",
//                   border: "1px solid #e5e7eb",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   height: "40px",
//                   whiteSpace: "nowrap",
//                   overflow: "hidden",
//                   textOverflow: "ellipsis",
//                 }}
//               >
//                 <span
//                   style={{
//                     fontSize: "12px",
//                     color: "#6b7280",
//                     fontWeight: "500",
//                     textTransform: "uppercase",
//                     letterSpacing: "0.3px",
//                   }}
//                 >
//                   Current Stage:
//                 </span>
//                 <span
//                   style={{
//                     fontSize: "13px",
//                     fontWeight: "600",
//                     color: "#111827",
//                     marginLeft: "6px",
//                     overflow: "hidden",
//                     textOverflow: "ellipsis",
//                   }}
//                 >
//                   {selectedStage?.stage_name}{" "}
//                   <span style={{ color: "#6b7280", fontWeight: "400" }}>
//                     ({selectedStage?.stage_code})
//                   </span>
//                 </span>
//               </div>
//             </Col>

//             <Col xs={12} md={6} lg={3} className="d-flex gap-2 justify-content-lg-end">
//               <Button
//                 size="sm"
//                 onClick={handleTrainingSync}
//                 disabled={isSyncing}
//                 style={{
//                   backgroundColor: "#10b981",
//                   border: "none",
//                   borderRadius: "6px",
//                   padding: "6px 12px",
//                   fontSize: "13px",
//                   fontWeight: "500",
//                   color: "#fff",
//                   height: "34px",
//                 }}
//               >
//                 {isSyncing ? (
//                   <>
//                     <i className="fa fa-spinner fa-spin me-1" /> Syncing
//                   </>
//                 ) : (
//                   <>
//                     <i className="fa fa-sync-alt me-1" /> Training Sync
//                   </>
//                 )}
//               </Button>

//               <Button
//                 size="sm"
//                 onClick={back}
//                 style={{
//                   backgroundColor: "#4441e6ff",
//                   border: "1px solid #d1d5db",
//                   borderRadius: "6px",
//                   padding: "6px 12px",
//                   fontSize: "13px",
//                   fontWeight: "500",
//                   color: "#fff",
//                   height: "34px",
//                 }}
//               >
//                 <i className="mdi mdi-arrow-left me-1" />
//                 Back
//               </Button>
//             </Col>
//           </Row>
//         </Container>
//       </div>

//       {selectedStage && (
//         <Container fluid className="px-4 py-4" style={{ flex: "1 1 auto", overflow: "hidden" }}>
//           <Row style={{ height: "100%" }}>
//             {alert}

//             <Col xs={12} lg={7} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
//               <div style={{ flex: 1, overflowY: "auto", paddingLeft: "12px" }}>
//                 <Row className="g-3 mb-4">
//                   {cameras.map((camera, index) => (
//                     <Col key={index} xs={12} sm={6}>
//                       <Card
//                         className="border-0"
//                         style={{
//                           borderRadius: "10px",
//                           overflow: "hidden",
//                           boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//                           backgroundColor: "#fff",
//                           transition: "transform 0.2s ease, box-shadow 0.2s ease",
//                         }}
//                         onMouseEnter={(e) => {
//                           e.currentTarget.style.transform = "translateY(-3px)";
//                           e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
//                         }}
//                         onMouseLeave={(e) => {
//                           e.currentTarget.style.transform = "translateY(0)";
//                           e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
//                         }}
//                       >
//                         <div
//                           style={{
//                             padding: "12px 16px",
//                             backgroundColor: "#f8f9fa",
//                             borderBottom: "1px solid #e5e7eb",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "space-between",
//                           }}
//                         >
//                           <h6
//                             className="mb-0 text-truncate"
//                             style={{
//                               fontSize: "14px",
//                               fontWeight: "600",
//                               color: "#1f2937",
//                               letterSpacing: "0.3px",
//                             }}
//                           >
//                             {camera.label}
//                           </h6>
//                           <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
//                             <span
//                               style={{
//                                 width: "8px",
//                                 height: "8px",
//                                 borderRadius: "50%",
//                                 backgroundColor: "#10b981",
//                                 animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
//                               }}
//                             />
//                             <span
//                               style={{
//                                 fontSize: "12px",
//                                 color: "#10b981",
//                                 fontWeight: "600",
//                                 textTransform: "uppercase",
//                                 letterSpacing: "0.5px",
//                               }}
//                             >
//                               Live
//                             </span>
//                           </div>
//                         </div>

//                         <CardBody className="p-0">
//                           <div
//                             style={{
//                               position: "relative",
//                               width: "100%",
//                               paddingBottom: "75%",
//                               backgroundColor: "#000",
//                             }}
//                           >
//                             <WebcamCapture
//                               ref={(el) => (webcamRefs.current[camera.originalLabel] = el)}
//                               key={camera.originalLabel}
//                               resolution={{ width: 640, height: 480 }}
//                               zoom={1}
//                               center={{ x: 0.5, y: 0.5 }}
//                               cameraLabel={camera.originalLabel}
//                               style={{
//                                 position: "absolute",
//                                 top: 0,
//                                 left: 0,
//                                 width: "100%",
//                                 height: "100%",
//                                 objectFit: "cover",
//                               }}
//                             />
//                           </div>
//                         </CardBody>
//                       </Card>
//                     </Col>
//                   ))}
//                 </Row>

//                 {/* Capture Button */}
//                 <div className="text-center pb-3">
//                   <Button
//                     size="lg"
//                     onClick={handleCaptureAll}
//                     disabled={!cameraAvailable || capturing}
//                     style={{
//                       backgroundColor: "#6366f1",
//                       border: "none",
//                       borderRadius: "8px",
//                       padding: "12px 32px",
//                       fontSize: "15px",
//                       fontWeight: "600",
//                       color: "#fff",
//                       opacity: (!cameraAvailable || capturing) ? 0.6 : 1,
//                       cursor: (!cameraAvailable || capturing) ? "not-allowed" : "pointer",
//                     }}
//                   >
//                     {capturing ? (
//                       <>
//                         <i className="fa fa-spinner fa-spin me-2" /> Capturing...
//                       </>
//                     ) : (
//                       <>
//                         <i className="fa fa-camera me-2" /> Capture All Cameras
//                       </>
//                     )}
//                   </Button>
//                 </div>
//               </div>
//             </Col>

//             <Col xs={12} lg={5} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
//               <div
//                 style={{
//                   backgroundColor: "#fff",
//                   borderRadius: "10px",
//                   padding: "16px",
//                   boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
//                   height: "100%",
//                   display: "flex",
//                   flexDirection: "column",
//                 }}
//               >
//                 <div style={{ marginBottom: "16px" }}>
//                   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
//                     <h6 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#111827" }}>
//                       <i className="fa fa-images me-2" style={{ color: "#6366f1" }} />
//                       Image Gallery ({totalImagesCount})
//                     </h6>
//                     {selectedStage && (
//                       <div style={{ fontSize: "14px", color: "#374151", fontWeight: 500 }}>
//                         Stage Name/Code:{selectedStage.stage_name} ({selectedStage.stage_code})
//                       </div>
//                     )}
//                     <div style={{ display: "flex", gap: "6px" }}>
//                       <Button
//                         size="sm"
//                         onClick={fetchGalleryImages}
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
//                         <i className={`fa fa-sync-alt me-1 ${loadingGallery ? 'fa-spin' : ''}`} /> Refresh
//                       </Button>
//                     </div>
//                   </div>

//                   {/* Camera Label Tabs */}
//                   {Object.keys(galleryImagesByCamera).length > 0 && (
//                     <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
//                       {Object.keys(galleryImagesByCamera).map(cameraLabel => (
//                         <button
//                           key={cameraLabel}
//                           onClick={() => {
//                             setSelectedCameraLabel(cameraLabel);
//                             setSelectedImages([]);
//                           }}
//                           style={{
//                             padding: "6px 12px",
//                             borderRadius: "6px",
//                             border: selectedCameraLabel === cameraLabel
//                               ? "2px solid #6366f1"
//                               : "1px solid #e5e7eb",
//                             backgroundColor: selectedCameraLabel === cameraLabel
//                               ? "#eef2ff"
//                               : "#fff",
//                             color: selectedCameraLabel === cameraLabel
//                               ? "#6366f1"
//                               : "#6b7280",
//                             fontSize: "12px",
//                             fontWeight: "600",
//                             cursor: "pointer",
//                             transition: "all 0.2s ease",
//                           }}
//                         >
//                           {cameraLabel} ({galleryImagesByCamera[cameraLabel].length})
//                         </button>
//                       ))}
//                     </div>
//                   )}

//                   {/* Selection Controls - Only show when images are selected */}
//                   {selectedImages.length > 0 && (
//                     <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
//                       <Button
//                         size="sm"
//                         color="info"
//                         onClick={handleSelectAll}
//                         style={{
//                           borderRadius: "6px",
//                           padding: "4px 12px",
//                           fontSize: "12px",
//                           fontWeight: "500",
//                         }}
//                       >
//                         <i className="fa fa-check-double me-1" />
//                         {selectedImages.length === selectedCameraImages.length ? 'Deselect All' : 'Select All'}
//                       </Button>

//                       <Button
//                         size="sm"
//                         color="danger"
//                         onClick={handleDeleteSelected}
//                         style={{
//                           borderRadius: "6px",
//                           padding: "4px 12px",
//                           fontSize: "12px",
//                           fontWeight: "500",
//                         }}
//                       >
//                         <i className="fa fa-trash me-1" />
//                         Delete ({selectedImages.length})
//                       </Button>

//                       <Button
//                         size="sm"
//                         color="secondary"
//                         onClick={() => setSelectedImages([])}
//                         style={{
//                           borderRadius: "6px",
//                           padding: "4px 12px",
//                           fontSize: "12px",
//                           fontWeight: "500",
//                         }}
//                       >
//                         <i className="fa fa-times me-1" />
//                         Clear
//                       </Button>
//                     </div>
//                   )}
//                 </div>

//                 {/* Images Grid */}
//                 <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
//                   {loadingGallery || deletingImages ? (
//                     <div
//                       style={{
//                         display: "flex",
//                         flexDirection: "column",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         height: "100%",
//                         color: "#9ca3af",
//                       }}
//                     >
//                       <Spinner color="primary" />
//                       <p style={{ fontSize: "14px", fontWeight: "500", marginTop: "12px" }}>{deletingImages ? "Deleting images..." : "Loading images..."}</p>
//                     </div>
//                   ) : selectedCameraImages.length === 0 ? (
//                     <div
//                       style={{
//                         display: "flex",
//                         flexDirection: "column",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         height: "100%",
//                         color: "#9ca3af",
//                       }}
//                     >
//                       <i className="fa fa-images" style={{ fontSize: "64px", marginBottom: "16px", opacity: 0.3 }} />
//                       <p style={{ fontSize: "14px", fontWeight: "500" }}>
//                         {selectedCameraLabel ? `No images for ${selectedCameraLabel}` : "No images captured yet"}
//                       </p>
//                       <p style={{ fontSize: "12px" }}>{`Click Capture All Cameras to start`}</p>
//                     </div>
//                   ) : (
//                     <Row className="g-3">
//                       {selectedCameraImages.map((image) => {
//                         { console.log("selectedCameraImages", selectedCameraImages) }
//                         const isSelected = selectedImages.some(img => img.id === image.id);
//                         return (
//                           <Col key={image.id} xs={6} md={4}>
//                             <div
//                               style={{
//                                 position: "relative",
//                                 borderRadius: "8px",
//                                 overflow: "hidden",
//                                 border: isSelected
//                                   ? "3px solid #6366f1"
//                                   : selectedImage?.id === image.id
//                                     ? "3px solid #10b981"
//                                     : "1px solid #e5e7eb",
//                                 cursor: "pointer",
//                                 transition: "all 0.2s ease",
//                               }}
//                               onClick={() => {
//                                 setSelectedImage(image);
//                               }}
//                               onMouseEnter={(e) => {
//                                 e.currentTarget.style.transform = "scale(1.05)";
//                                 e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
//                               }}
//                               onMouseLeave={(e) => {
//                                 e.currentTarget.style.transform = "scale(1)";
//                                 e.currentTarget.style.boxShadow = "none";
//                               }}
//                             >
//                               <img
//                                 src={`${ImageUrl}${image.local_path}`}
//                                 alt={image.cameraLabel}
//                                 style={{
//                                   width: "100%",
//                                   height: "120px",
//                                   objectFit: "cover",
//                                 }}
//                                 onError={(e) => {
//                                   console.error("Image not found:", e.target.src);
//                                   e.target.src = "/fallback.png";
//                                 }}
//                               />

//                               {/* Checkbox - Top Left */}
//                               <div
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   handleImageSelect(image);
//                                 }}
//                                 style={{
//                                   position: "absolute",
//                                   top: "8px",
//                                   left: "8px",
//                                   width: "20px",
//                                   height: "20px",
//                                   borderRadius: "4px",
//                                   backgroundColor: isSelected ? "#6366f1" : "rgba(255,255,255,0.9)",
//                                   border: isSelected ? "2px solid #6366f1" : "2px solid #d1d5db",
//                                   display: "flex",
//                                   alignItems: "center",
//                                   justifyContent: "center",
//                                   cursor: "pointer",
//                                   transition: "all 0.2s ease",
//                                 }}
//                                 onMouseEnter={e => {
//                                   if (!isSelected) {
//                                     e.currentTarget.style.backgroundColor = "rgba(255,255,255,1)";
//                                     e.currentTarget.style.borderColor = "#6366f1";
//                                   }
//                                 }}
//                                 onMouseLeave={e => {
//                                   if (!isSelected) {
//                                     e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.9)";
//                                     e.currentTarget.style.borderColor = "#d1d5db";
//                                   }
//                                 }}
//                               >
//                                 {isSelected && (
//                                   <i
//                                     className="fa fa-check"
//                                     style={{ color: "#fff", fontSize: "11px" }}
//                                   />
//                                 )}
//                               </div>
//                               <button
//                                 onClick={e => {
//                                   e.stopPropagation();
//                                   handleImagePreview(e, image);
//                                 }}
//                                 style={{
//                                   position: "absolute",
//                                   top: "8px",
//                                   left: "50%",
//                                   transform: "translateX(-50%)",
//                                   backgroundColor: "rgba(99,102,241,0.9)",
//                                   border: "none",
//                                   borderRadius: "4px",
//                                   color: "#fff",
//                                   width: "24px",
//                                   height: "24px",
//                                   display: "flex",
//                                   alignItems: "center",
//                                   justifyContent: "center",
//                                   cursor: "pointer",
//                                   fontSize: "13px",
//                                   transition: "all 0.2s ease",
//                                 }}
//                                 onMouseEnter={e =>
//                                   (e.currentTarget.style.backgroundColor = "rgba(99,102,241,1)")
//                                 }
//                                 onMouseLeave={e =>
//                                   (e.currentTarget.style.backgroundColor = "rgba(99,102,241,0.9)")
//                                 }
//                               >
//                                 <i className="fa fa-eye" />
//                               </button>

//                               <button
//                                 onClick={e => {
//                                   e.stopPropagation();
//                                   handleDelete(e, image.filename, image.camera_label);   // <-- use the exact field names
//                                 }}
//                                 style={{
//                                   position: "absolute",
//                                   top: "8px",
//                                   right: "8px",
//                                   backgroundColor: "rgba(239,68,68,0.9)",
//                                   border: "none",
//                                   borderRadius: "4px",
//                                   color: "#fff",
//                                   width: "24px",
//                                   height: "24px",
//                                   display: "flex",
//                                   alignItems: "center",
//                                   justifyContent: "center",
//                                   cursor: "pointer",
//                                   fontSize: "13px",
//                                   transition: "all 0.2s ease",
//                                 }}
//                                 onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,1)")}
//                                 onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.9)")}
//                               >
//                                 <i className="fa fa-times" />
//                               </button>

//                               <div
//                                 style={{
//                                   position: "absolute",
//                                   bottom: 0,
//                                   left: 0,
//                                   right: 0,
//                                   background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
//                                   padding: "8px 8px 4px",
//                                 }}
//                               >
//                                 <p
//                                   style={{
//                                     margin: 0,
//                                     fontSize: "11px",
//                                     fontWeight: "600",
//                                     color: "#fff",
//                                     textOverflow: "ellipsis",
//                                     overflow: "hidden",
//                                     whiteSpace: "nowrap",
//                                   }}
//                                 >
//                                   {image.filename}
//                                 </p>
//                               </div>
//                             </div>
//                           </Col>
//                         );
//                       })}
//                     </Row>
//                   )}
//                 </div>

//                 {/* Selected Image Details */}
//                 {selectedImage && selectedImages.length === 0 && (
//                   <div
//                     style={{
//                       marginTop: "16px",
//                       padding: "12px",
//                       backgroundColor: "#f9fafb",
//                       borderRadius: "8px",
//                       border: "1px solid #e5e7eb",
//                     }}
//                   >
//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
//                       <h6 style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#111827" }}>
//                         {selectedImage.cameraLabel}
//                       </h6>
//                       <button
//                         onClick={() => setSelectedImage(null)}
//                         style={{
//                           background: "none",
//                           border: "none",
//                           color: "#6b7280",
//                           fontSize: "18px",
//                           cursor: "pointer",
//                           padding: "0",
//                         }}
//                       >
//                         ×
//                       </button>
//                     </div>
//                     <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#6b7280" }}>
//                       <i className="fa fa-file me-1" />
//                       {selectedImage.filename}
//                     </p>
//                     <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#6b7280" }}>
//                       <i className="fa fa-clock me-1" />
//                       {new Date(selectedImage.timestamp).toLocaleString()}
//                     </p>
//                     {selectedImage.width && selectedImage.height && (
//                       <p style={{ margin: "0", fontSize: "11px", color: "#6b7280" }}>
//                         <i className="fa fa-image me-1" />
//                         {selectedImage.width} × {selectedImage.height}
//                       </p>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </Col>
//           </Row>
//         </Container>
//       )}

//       {/* Image Preview Modal */}
//       <Modal
//         isOpen={previewModal}
//         toggle={() => setPreviewModal(false)}
//         size="lg"
//         centered
//       >
//         <ModalHeader toggle={() => setPreviewModal(false)}>
//           Image Preview
//         </ModalHeader>
//         <ModalBody style={{ padding: 0 }}>
//           {previewImage && (
//             <div>
//               <img
//                 src={`${ImageUrl}${previewImage.local_path}`}
//                 alt={previewImage.cameraLabel}
//                 style={{
//                   width: "100%",
//                   height: "auto",
//                   maxHeight: "70vh",
//                   objectFit: "contain",
//                 }}
//                 onError={(e) => {
//                   console.error("Image not found:", e.target.src);
//                   e.target.src = "/fallback.png";
//                 }}
//               />
//               <div style={{ padding: "16px", backgroundColor: "#f9fafb" }}>
//                 <h6 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "#111827" }}>
//                   {previewImage.cameraLabel}
//                 </h6>
//                 <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280" }}>
//                   <i className="fa fa-file me-1" />
//                   {previewImage.filename}
//                 </p>
//                 <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280" }}>
//                   <i className="fa fa-clock me-1" />
//                   {new Date(previewImage.timestamp).toLocaleString()}
//                 </p>
//                 {previewImage.width && previewImage.height && (
//                   <p style={{ margin: "0", fontSize: "12px", color: "#6b7280" }}>
//                     <i className="fa fa-image me-1" />
//                     {previewImage.width} × {previewImage.height}
//                   </p>
//                 )}
//               </div>
//             </div>
//           )}
//         </ModalBody>
//       </Modal>

//       {/* Toast Notification */}
//       {toastMessage && (
//         <CustomToast
//           message={toastMessage}
//           type={toastType}
//           onClose={() => setToastMessage(null)}
//         />
//       )}
//     </div>
//   );
// };

// export default RemoteSingleStg;


import React, { useEffect, useRef, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
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
} from "reactstrap";
import MetaTags from "react-meta-tags";
import { v4 as uuidv4 } from "uuid";
import urlSocket from "./urlSocket";
import WebcamCapture from "../WebcamCustom/WebcamCapture";
import PropTypes from "prop-types";
import ImageUrl from "./imageUrl";
import SweetAlert from "react-bootstrap-sweetalert";

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
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          maxWidth: "350px",
          zIndex: "9999",
          borderRadius: "8px",
          padding: "12px 16px",
          backgroundColor: type === "error" ? "#ef4444" : "#10b981",
          color: "white",
          fontWeight: "500",
          fontSize: "14px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <span>{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          style={{
            background: "none",
            border: "none",
            color: "white",
            fontSize: "20px",
            cursor: "pointer",
            padding: "0",
            lineHeight: "1",
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
  type: PropTypes.oneOf(["success", "error"]).isRequired,
  onClose: PropTypes.func.isRequired,
};

const RemoteSingleStg = () => {
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
  const [deletingImages, setDeletingImages] = useState(false); // NEW: for instant UI feedback

  // Multi-select & preview
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

  const selectedStage = stages[selectedStageIndex];
  const cameras = selectedStage?.camera_selection?.cameras || [];

  // Fetch images from backend
  const fetchGalleryImages = async () => {
    if (!selectedStage) return;

    setLoadingGallery(true);
    try {
      const response = await urlSocket.post("/get_training_images", {
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
    fetchGalleryImages();
    setSelectedImages([]);
  }, [selectedStageIndex]);

  useEffect(() => {
    let activeStreams = [];

    async function setupCameras() {
      cameraStreams.forEach((s) => s?.getTracks().forEach((t) => t.stop()));

      await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      const devices = await navigator.mediaDevices.enumerateDevices();

      const newStreams = [];

      for (let cam of cameras) {
        try {
          const videoDevice = devices.find((d) => {
            if (d.kind !== "videoinput") return false;
            const label = d.label?.toLowerCase() || "";
            const matchByLabel = cam.originalLabel && label.includes(cam.originalLabel.toLowerCase());
            const matchByVID = cam.v_id && label.includes(cam.v_id.toLowerCase());
            const matchByPID = cam.p_id && label.includes(cam.p_id.toLowerCase());
            return matchByLabel || matchByVID || matchByPID;
          });

          const stream = videoDevice
            ? await navigator.mediaDevices.getUserMedia({
              video: { deviceId: { exact: videoDevice.deviceId } },
              audio: false,
            })
            : null;

          newStreams.push(stream);
        } catch (err) {
          console.error(`Error accessing ${cam.label}:`, err);
          newStreams.push(null);
        }
      }

      activeStreams = newStreams;
      setCameraStreams(newStreams);
      setCameraAvailable(newStreams.some((s) => s !== null));
      validateCameraPreviews(newStreams);
    }

    setupCameras();

    return () => {
      activeStreams.forEach((s) => s && s.getTracks().forEach((t) => t.stop()));
    };
  }, [selectedStageIndex, cameras]);

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
      cameraStreams.forEach((stream, i) => {
        const video = webcamRefs.current[i];
        if (video && stream && video.srcObject !== stream) {
          video.srcObject = stream;
        }
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [cameraStreams]);

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

    const invalidCameras = [];
    for (const cam of cameras) {
      const webcamInstance = webcamRefs.current[cam.originalLabel];
      if (!webcamInstance || !webcamInstance.captureZoomedImage || webcamInstance.cameraDisconnected) {
        invalidCameras.push(cam.label);
      }
    }

    if (invalidCameras.length > 0) {
      const message =
        invalidCameras.length === 1
          ? `Camera "${invalidCameras[0]}" is not showing preview.`
          : `${invalidCameras.length} cameras not showing preview: ${invalidCameras.join(", ")}`;
      setToastMessage(message);
      setToastType("error");
      return;
    }

    setCapturing(true);

    try {
      const successfulCameras = [];
      const formData = new FormData();

      formData.append("comp_name", datas.comp_name);
      formData.append("comp_id", datas.comp_id);
      formData.append("comp_code", datas.comp_code);
      formData.append("stage_name", selectedStage.stage_name);
      formData.append("stage_code", selectedStage.stage_code);

      for (let i = 0; i < cameras.length; i++) {
        const cam = cameras[i];
        const webcamInstance = webcamRefs.current[cam.originalLabel];

        try {
          const imageSrcData = await webcamInstance.captureZoomedImage();
          if (!imageSrcData) {
            throw new Error(`No image data from ${cam.label}`);
          }

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

          formData.append(`img_${i}`, blob, fileName);
          formData.append(`img_${i}_label`, cam.label);
          formData.append(`img_${i}_width`, width);
          formData.append(`img_${i}_height`, height);

          successfulCameras.push(cam.label);
        } catch (captureError) {
          setToastMessage(`Failed to capture from "${cam.label}"`);
          setToastType("error");
          setCapturing(false);
          return;
        }
      }

      const response = await urlSocket.post("/remoteMultiCapture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setToastMessage(`Successfully captured from: ${successfulCameras.join(", ")}`);
      setToastType("success");

      setTimeout(() => {
        fetchGalleryImages();
      }, 1000);
    } catch (error) {
      setToastMessage(`Capture failed: ${error.message || "An error occurred"}`);
      setToastType("error");
    }

    setCapturing(false);
  };

  const handleTrainingSync = async () => {
    try {
      setIsSyncing(true);
      const res = await urlSocket.post("/sync_training_mode_result_train");

      if (res?.data?.count > 0) {
        setToastMessage(`${res.data.sts} - Total Synced: ${res.data.count}`);
        setToastType("success");
        setTimeout(() => {
          fetchGalleryImages();
        }, 1000);
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

  // UPDATED: Instant delete with loading state
  const handleDeleteImage = async (filename, cameraLabel) => {
    setDeletingImages(true);
    try {
      await urlSocket.post("/delete_training_image", {
        filename,
        camera_label: cameraLabel,
      });

      // Remove from UI immediately
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

  // Handle image selection
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

  // Select all images for current camera
  const handleSelectAll = () => {
    if (selectedImages.length === selectedCameraImages.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages([...selectedCameraImages]);
    }
  };

  // UPDATED: Multi-delete with instant UI removal
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
              await urlSocket.post("/delete_training_image", {
                filename: image.filename,
                camera_label: image.cameraLabel,
              });
            }

            // Remove all selected images instantly
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

  // Handle image preview (click thumbnail to preview)
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
      <MetaTags>
        <title>Remote Camera Gallery</title>
      </MetaTags>

      {/* Header */}
      <div style={{ backgroundColor: "#fff", borderBottom: "1px solid #e5e7eb", padding: "12px 0" }}>
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

            <Col xs={12} md={6} lg={4}>
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

            <Col xs={12} md={6} lg={3} className="d-flex gap-2 justify-content-lg-end">
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
                    <i className="fa fa-sync-alt me-1" /> Training Sync
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
          <Row style={{ height: "100%" }}>
            {alert}

            <Col xs={12} lg={7} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1, overflowY: "auto", paddingLeft: "12px" }}>
                <Row className="g-3 mb-4">
                  {cameras.map((camera, index) => (
                    <Col key={index} xs={12} sm={6}>
                      <Card
                        className="border-0"
                        style={{
                          borderRadius: "10px",
                          overflow: "hidden",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                          backgroundColor: "#fff",
                          transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-3px)";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
                        }}
                      >
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
                              fontWeight: "600",
                              color: "#1f2937",
                              letterSpacing: "0.3px",
                            }}
                          >
                            {camera.label}
                          </h6>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor: "#10b981",
                                animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                              }}
                            />
                            <span
                              style={{
                                fontSize: "12px",
                                color: "#10b981",
                                fontWeight: "600",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              Live
                            </span>
                          </div>
                        </div>

                        <CardBody className="p-0">
                          <div
                            style={{
                              position: "relative",
                              width: "100%",
                              paddingBottom: "75%",
                              backgroundColor: "#000",
                            }}
                          >
                            <WebcamCapture
                              ref={(el) => (webcamRefs.current[camera.originalLabel] = el)}
                              key={camera.originalLabel}
                              resolution={{ width: 640, height: 480 }}
                              zoom={1}
                              center={{ x: 0.5, y: 0.5 }}
                              cameraLabel={camera.originalLabel}
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* Capture Button */}
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

            <Col xs={12} lg={5} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "10px",
                  padding: "16px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ marginBottom: "16px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <h6 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#111827" }}>
                      <i className="fa fa-images me-2" style={{ color: "#6366f1" }} />
                      Image Gallery ({totalImagesCount})
                    </h6>
                    {selectedStage && (
                      <div style={{ fontSize: "14px", color: "#374151", fontWeight: 500 }}>
                        Stage Name/Code: {selectedStage.stage_name} ({selectedStage.stage_code})
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "6px" }}>
                      <Button
                        size="sm"
                        onClick={fetchGalleryImages}
                        disabled={loadingGallery}
                        style={{
                          backgroundColor: "#6366f1",
                          border: "none",
                          borderRadius: "6px",
                          padding: "4px 12px",
                          fontSize: "12px",
                          fontWeight: "500",
                          color: "#fff",
                        }}
                      >
                        <i className={`fa fa-sync-alt me-1 ${loadingGallery ? "fa-spin" : ""}`} />{" "}
                        Refresh
                      </Button>
                    </div>
                  </div>

                  {/* Camera Label Tabs */}
                  {Object.keys(galleryImagesByCamera).length > 0 && (
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                      {Object.keys(galleryImagesByCamera).map((cameraLabel) => (
                        <button
                          key={cameraLabel}
                          onClick={() => {
                            setSelectedCameraLabel(cameraLabel);
                            setSelectedImages([]);
                          }}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border:
                              selectedCameraLabel === cameraLabel
                                ? "2px solid #6366f1"
                                : "1px solid #e5e7eb",
                            backgroundColor:
                              selectedCameraLabel === cameraLabel ? "#eef2ff" : "#fff",
                            color: selectedCameraLabel === cameraLabel ? "#6366f1" : "#6b7280",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {cameraLabel} ({galleryImagesByCamera[cameraLabel].length})
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Selection Controls */}
                  {selectedImages.length > 0 && (
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                      <Button
                        size="sm"
                        color="info"
                        onClick={handleSelectAll}
                        style={{
                          borderRadius: "6px",
                          padding: "4px 12px",
                          fontSize: "12px",
                          fontWeight: "500",
                        }}
                      >
                        <i className="fa fa-check-double me-1" />
                        {selectedImages.length === selectedCameraImages.length
                          ? "Deselect All"
                          : "Select All"}
                      </Button>

                      <Button
                        size="sm"
                        color="danger"
                        onClick={handleDeleteSelected}
                        disabled={deletingImages}
                        style={{
                          borderRadius: "6px",
                          padding: "4px 12px",
                          fontSize: "12px",
                          fontWeight: "500",
                        }}
                      >
                        <i className="fa fa-trash me-1" />
                        Delete ({selectedImages.length})
                      </Button>

                      <Button
                        size="sm"
                        color="secondary"
                        onClick={() => setSelectedImages([])}
                        style={{
                          borderRadius: "6px",
                          padding: "4px 12px",
                          fontSize: "12px",
                          fontWeight: "500",
                        }}
                      >
                        <i className="fa fa-times me-1" />
                        Clear
                      </Button>
                    </div>
                  )}
                </div>

                {/* Images Grid */}
                <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
                  {loadingGallery || deletingImages ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        color: "#9ca3af",
                      }}
                    >
                      <Spinner color="primary" />
                      <p style={{ fontSize: "14px", fontWeight: "500", marginTop: "12px" }}>
                        {deletingImages ? "Deleting images..." : "Loading images..."}
                      </p>
                    </div>
                  ) : selectedCameraImages.length === 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        color: "#9ca3af",
                      }}
                    >
                      <i
                        className="fa fa-images"
                        style={{ fontSize: "64px", marginBottom: "16px", opacity: 0.3 }}
                      />
                      <p style={{ fontSize: "14px", fontWeight: "500" }}>
                        {selectedCameraLabel
                          ? `No images for ${selectedCameraLabel}`
                          : "No images captured yet"}
                      </p>
                      <p style={{ fontSize: "12px" }}>Click Capture All Cameras to start</p>
                    </div>
                  ) : (
                    <Row className="g-3">
                      {selectedCameraImages.map((image) => {
                        const isSelected = selectedImages.some((img) => img.id === image.id);
                        return (
                          <Col key={image.id} xs={6} md={4}>
                            <div
                              style={{
                                position: "relative",
                                borderRadius: "8px",
                                overflow: "hidden",
                                border: isSelected
                                  ? "3px solid #6366f1"
                                  : selectedImage?.id === image.id
                                    ? "3px solid #10b981"
                                    : "1px solid #e5e7eb",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                              }}
                              onClick={() => handleImagePreview(null, image)} // Click to preview
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.05)";
                                e.currentTarget.style.boxShadow =
                                  "0 4px 12px rgba(0,0,0,0.15)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.boxShadow = "none";
                              }}
                            >
                              <img
                                src={`${ImageUrl}${image.local_path}`}
                                alt={image.cameraLabel}
                                style={{
                                  width: "100%",
                                  height: "120px",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  console.error("Image not found:", e.target.src);
                                  e.target.src = "/fallback.png";
                                }}
                              />

                              {/* Checkbox - Top Left */}
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleImageSelect(image);
                                }}
                                style={{
                                  position: "absolute",
                                  top: "8px",
                                  left: "8px",
                                  width: "20px",
                                  height: "20px",
                                  borderRadius: "4px",
                                  backgroundColor: isSelected
                                    ? "#6366f1"
                                    : "rgba(255,255,255,0.9)",
                                  border: isSelected ? "2px solid #6366f1" : "2px solid #d1d5db",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,1)";
                                    e.currentTarget.style.borderColor = "#6366f1";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isSelected) {
                                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.9)";
                                    e.currentTarget.style.borderColor = "#d1d5db";
                                  }
                                }}
                              >
                                {isSelected && (
                                  <i
                                    className="fa fa-check"
                                    style={{ color: "#fff", fontSize: "11px" }}
                                  />
                                )}
                              </div>

                              {/* Delete Button - Top Right */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(e, image.filename, image.cameraLabel);
                                }}
                                style={{
                                  position: "absolute",
                                  top: "8px",
                                  right: "8px",
                                  backgroundColor: "rgba(239,68,68,0.9)",
                                  border: "none",
                                  borderRadius: "4px",
                                  color: "#fff",
                                  width: "24px",
                                  height: "24px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  fontSize: "13px",
                                  transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.backgroundColor = "rgba(239,68,68,1)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.9)")
                                }
                              >
                                <i className="fa fa-times" />
                              </button>

                              <div
                                style={{
                                  position: "absolute",
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                                  padding: "8px 8px 4px",
                                }}
                              >
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    color: "#fff",
                                    textOverflow: "ellipsis",
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {image.filename}
                                </p>
                              </div>
                            </div>
                          </Col>
                        );
                      })}
                    </Row>
                  )}
                </div>

                {/* Selected Image Details */}
                {selectedImage && selectedImages.length === 0 && (
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "12px",
                      backgroundColor: "#f9fafb",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <h6 style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#111827" }}>
                        {selectedImage.cameraLabel}
                      </h6>
                      <button
                        onClick={() => setSelectedImage(null)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#6b7280",
                          fontSize: "18px",
                          cursor: "pointer",
                          padding: "0",
                        }}
                      >
                        ×
                      </button>
                    </div>
                    <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#6b7280" }}>
                      <i className="fa fa-file me-1" />
                      {selectedImage.filename}
                    </p>
                    <p style={{ margin: "0 0 4px 0", fontSize: "11px", color: "#6b7280" }}>
                      <i className="fa fa-clock me-1" />
                      {new Date(selectedImage.timestamp).toLocaleString()}
                    </p>
                    {selectedImage.width && selectedImage.height && (
                      <p style={{ margin: "0", fontSize: "11px", color: "#6b7280" }}>
                        <i className="fa fa-image me-1" />
                        {selectedImage.width} × {selectedImage.height}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      )}

      {/* Image Preview Modal */}
      <Modal isOpen={previewModal} toggle={() => setPreviewModal(false)} size="lg" centered>
        <ModalHeader toggle={() => setPreviewModal(false)}>Image Preview</ModalHeader>
        <ModalBody style={{ padding: 0 }}>
          {previewImage && (
            <div>
              <img
                src={`${ImageUrl}${previewImage.local_path}`}
                alt={previewImage.cameraLabel}
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "70vh",
                  objectFit: "contain",
                }}
                onError={(e) => {
                  console.error("Image not found:", e.target.src);
                  e.target.src = "/fallback.png";
                }}
              />
              <div style={{ padding: "16px", backgroundColor: "#f9fafb" }}>
                <h6
                  style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "#111827" }}
                >
                  {previewImage.cameraLabel}
                </h6>
                <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280" }}>
                  <i className="fa fa-file me-1" />
                  {previewImage.filename}
                </p>
                <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280" }}>
                  <i className="fa fa-clock me-1" />
                  {new Date(previewImage.timestamp).toLocaleString()}
                </p>
                {previewImage.width && previewImage.height && (
                  <p style={{ margin: "0", fontSize: "12px", color: "#6b7280" }}>
                    <i className="fa fa-image me-1" />
                    {previewImage.width} × {previewImage.height}
                  </p>
                )}
              </div>
            </div>
          )}
        </ModalBody>
      </Modal>

      {/* Toast Notification */}
      {toastMessage && (
        <CustomToast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};

export default RemoteSingleStg;