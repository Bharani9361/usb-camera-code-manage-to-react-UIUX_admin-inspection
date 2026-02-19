

// // // /linear-gradient(to bottom, #ffffff, #f8f9fa)


// // import React, { useEffect, useRef, useState } from "react";
// // import { useLocation, useHistory } from "react-router-dom";
// // import { Container, Button, Col, Row, Card, CardBody } from "reactstrap";
// // import MetaTags from "react-meta-tags";
// // import urlSocket from "./urlSocket";
// // import SweetAlert from "react-bootstrap-sweetalert";

// // const RemoteStg = () => {
// //   const location = useLocation();
// //   const history = useHistory();
// //   const { datas } = location.state || {};
// //   const stages = datas?.stages || [];

// //   const [cameraStreams, setCameraStreams] = useState({});
// //   const videoRefs = useRef({});
// //   const [isCapturing, setIsCapturing] = useState(false);
// //   const [alert, setAlert] = useState(null);

// //   // Setup camera streams for all stages
// //   // useEffect(() => {
// //   //   async function setupAllCameras() {
// //   //     const allStreams = {};

// //   //     for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
// //   //       const stage = stages[stageIndex];
// //   //       const cameras = stage?.camera_selection?.cameras || [];
// //   //       allStreams[stageIndex] = [];

// //   //       const devices = await navigator.mediaDevices.enumerateDevices();

// //   //       for (let cam of cameras) {
// //   //         try {
// //   //           const videoDevice = devices.find((d) => {
// //   //             if (d.kind !== "videoinput") return false;
// //   //             const label = d.label?.toLowerCase() || "";
// //   //             const origLabel = cam.originalLabel?.toLowerCase() || "";
// //   //             const vid = cam.v_id?.toLowerCase() || "";
// //   //             const pid = cam.p_id?.toLowerCase() || "";
// //   //             return (
// //   //               label.includes(origLabel) ||
// //   //               label.includes(vid) ||
// //   //               label.includes(pid)
// //   //             );
// //   //           });

// //   //           const stream = await navigator.mediaDevices.getUserMedia({
// //   //             video: videoDevice
// //   //               ? { deviceId: { exact: videoDevice.deviceId } }
// //   //               : true,
// //   //             audio: false,
// //   //           });

// //   //           allStreams[stageIndex].push(stream);
// //   //         } catch (err) {
// //   //           console.error(`Error accessing ${cam.label}:`, err);
// //   //           allStreams[stageIndex].push(null);
// //   //         }
// //   //       }
// //   //     }

// //   //     setCameraStreams(allStreams);
// //   //   }

// //   //   setupAllCameras();

// //   //   return () => {
// //   //     Object.values(cameraStreams).forEach((streams) => {
// //   //       streams.forEach((s) => s && s.getTracks().forEach((t) => t.stop()));
// //   //     });
// //   //   };
// //   // }, []);

// //    useEffect(() => {
// //     let allStreams = {};

// //     async function setupAllCameras() {
// //       try {
// //         // 🧹 Stop existing streams first
// //         Object.values(cameraStreams).forEach((streams) => {
// //           streams.forEach((s) => s?.getTracks().forEach((t) => t.stop()));
// //         });

// //         // 🎯 Request permission so device labels are visible
// //         await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
// //         const devices = await navigator.mediaDevices.enumerateDevices();

// //         allStreams = {};

// //         for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
// //           const stage = stages[stageIndex];
// //           const cameras = stage?.camera_selection?.cameras || [];
// //           allStreams[stageIndex] = [];

// //           for (let cam of cameras) {
// //             try {
// //               const videoDevice = devices.find((d) => {
// //                 if (d.kind !== "videoinput") return false;
// //                 const label = d.label?.toLowerCase() || "";
// //                 const origLabel = cam.originalLabel?.toLowerCase() || "";
// //                 const vid = cam.v_id?.toLowerCase() || "";
// //                 const pid = cam.p_id?.toLowerCase() || "";
// //                 return (
// //                   label.includes(origLabel) ||
// //                   label.includes(vid) ||
// //                   label.includes(pid)
// //                 );
// //               });

// //               if (!videoDevice) {
// //                 console.warn(`⚠️ No matching device for ${cam.label}`);
// //                 allStreams[stageIndex].push(null);
// //                 continue;
// //               }

// //               const stream = await navigator.mediaDevices.getUserMedia({
// //                 video: { deviceId: { exact: videoDevice.deviceId } },
// //                 audio: false,
// //               });

// //               allStreams[stageIndex].push(stream);
// //             } catch (err) {
// //               console.error(`❌ Error accessing ${cam.label}:`, err);
// //               allStreams[stageIndex].push(null);
// //             }
// //           }
// //         }

// //         setCameraStreams(allStreams);
// //       } catch (error) {
// //         console.error("❌ Camera setup failed:", error);
// //       }
// //     }

// //     setupAllCameras();

// //     // 🧼 Cleanup when unmounting
// //     return () => {
// //       Object.values(allStreams).forEach((streams) =>
// //         streams.forEach((s) => s?.getTracks().forEach((t) => t.stop()))
// //       );
// //     };
// //   }, [stages]); // ✅ run only when stages change

// //   // Attach streams to video elements
// //   useEffect(() => {
// //     const timer = setTimeout(() => {
// //       Object.keys(cameraStreams).forEach((stageIndex) => {
// //         cameraStreams[stageIndex].forEach((stream, camIndex) => {
// //           const videoKey = `${stageIndex}-${camIndex}`;
// //           const video = videoRefs.current[videoKey];
// //           if (video && stream && video.srcObject !== stream) {
// //             video.srcObject = stream;
// //           }
// //         });
// //       });
// //     }, 400);
// //     return () => clearTimeout(timer);
// //   }, [cameraStreams]);

// //   const back = () => history.goBack();

// //   const handleCaptureAll = async () => {
// //     try {
// //       const capturedImages = [];

// //       for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
// //         const stage = stages[stageIndex];
// //         const cameras = stage?.camera_selection?.cameras || [];

// //         for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
// //           const videoKey = `${stageIndex}-${camIndex}`;
// //           const video = videoRefs.current[videoKey];

// //           if (video && video.readyState >= 2) {
// //             const canvas = document.createElement("canvas");
// //             canvas.width = video.videoWidth;
// //             canvas.height = video.videoHeight;
// //             const ctx = canvas.getContext("2d");
// //             ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

// //             const base64Image = canvas.toDataURL("image/jpeg", 0.9);

// //             capturedImages.push({
// //               stage_index: stageIndex,
// //               comp_name: datas.comp_name,
// //               comp_code: datas.comp_code,
// //               comp_id:datas.comp_id,
// //               stage_name: stage.stage_name,
// //               stage_code: stage.stage_code,
// //               camera_label: cameras[camIndex].label || `Camera ${camIndex + 1}`,
// //               camera_id: cameras[camIndex].v_id,
// //               timestamp: new Date().toISOString(),
// //               image: base64Image,
// //             });
// //           } else {
// //             console.warn(`Skipping camera ${camIndex} (not ready)`);
// //           }
// //         }
// //       }

// //       console.log("✅ Captured Images:", capturedImages);
// //       await sendCapturedImages(capturedImages);

// //       setAlert(
// //         <SweetAlert
// //           success
// //           title="Image Capture Successful!"
// //           onConfirm={() => setAlert(null)}
// //         >
// //           {capturedImages.length} image(s) have been captured and saved successfully.
// //         </SweetAlert>
// //       );
// //     } catch (error) {
// //       console.error("❌ Error capturing images:", error);
// //       setAlert(
// //         <SweetAlert danger title="Error!" onConfirm={() => setAlert(null)}>
// //           Failed to capture images. Please try again.
// //         </SweetAlert>
// //       );
// //     }
// //   };

// //   const sendCapturedImages = async (capturedImages) => {
// //     try {
// //       const response = await urlSocket.post("/save_stage_camera_images", { capturedImages });
// //       console.log('responsemulti', response);
// //       console.log("✅ Server response:", response.data);
// //     } catch (err) {
// //       console.error("❌ Error sending captured images:", err);
// //     }
// //   };

// //   const handleStageCameraSync = async () => {
// //   try {
// //     const res = await urlSocket.post("/sync_training_mode_result_train");
// //     console.log('response_stage_sync', res);

// //     if (res?.data) {
// //       console.log(`✅ ${res.data.sts}\nTotal Synced Groups: ${res.data.count}`);
// //       console.table(res.data.synced_groups);
// //       // Optionally show a toast or alert
// //       // alert(`✅ ${res.data.sts}\nSynced Groups: ${res.data.count}`);
// //     } else {
// //       console.warn("⚠️ No response data received from sync API");
// //     }
// //   } catch (err) {
// //     console.error("❌ Error during stage image sync:", err);
// //     // alert("❌ Failed to sync stage camera images.");
// //   }
// // };


// //   return (
// //     <div
// //       className="page-content"
// //       style={{
// //         background: "linear-gradient(to bottom, #ffffff, #f8f9fa)",
// //         height: "100vh",
// //         display: "flex",
// //         flexDirection: "column",
// //         overflow: "hidden",
// //       }}
// //     >
// //       <MetaTags>
// //         <title>Remote Camera Gallery</title>
// //       </MetaTags>

// //       {/* Header */}
// //       <Container fluid className="px-2 px-md-3 pt-2" style={{ flex: "0 0 auto" }}>
// //         <Card
// //           className="mb-3 border-0"
// //           style={{
// //             borderRadius: "12px",
// //             boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
// //             background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
// //             position: "relative",
// //             overflow: "hidden",
// //           }}
// //         >
// //           <div
// //             style={{
// //               position: "absolute",
// //               top: 0,
// //               left: 0,
// //               right: 0,
// //               bottom: 0,
// //               background: "radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)",
// //               pointerEvents: "none",
// //             }}
// //           />

// //           <CardBody className="p-3" style={{ position: "relative", zIndex: 1 }}>
// //             <Row className="align-items-center">
// //               <Col xs={8} md={10} className="d-flex align-items-center">
// //                 <div
// //                   className="d-flex align-items-center justify-content-center me-3"
// //                   style={{
// //                     width: "40px",
// //                     height: "40px",
// //                     borderRadius: "10px",
// //                     backgroundColor: "rgba(255, 255, 255, 0.25)",
// //                     backdropFilter: "blur(10px)",
// //                     fontSize: "18px",
// //                     boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
// //                     border: "1px solid rgba(255, 255, 255, 0.3)",
// //                   }}
// //                 >
// //                   🎥
// //                 </div>
// //                 <h3
// //                   className="mb-0"
// //                   style={{
// //                     fontSize: "clamp(16px, 2.5vw, 20px)",
// //                     fontWeight: "700",
// //                     color: "#ffffff",
// //                     letterSpacing: "-0.02em",
// //                     textShadow: "0 2px 4px rgba(0,0,0,0.1)",
// //                   }}
// //                 >
// //                   Remote Camera Gallery
// //                 </h3>
// //               </Col>

// //               <Col xs={4} md={2} className="d-flex justify-content-end">
// //                 <Button
// //                   color="light"
// //                   size="sm"
// //                   className="d-flex align-items-center"
// //                   style={{
// //                     fontWeight: "600",
// //                     borderRadius: "8px",
// //                     fontSize: "13px",
// //                     padding: "8px 16px",
// //                     backgroundColor: "rgba(255, 255, 255, 0.95)",
// //                     color: "#667eea",
// //                     border: "1.5px solid rgba(255, 255, 255, 0.3)",
// //                     boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
// //                     transition: "all 0.2s ease",
// //                   }}
// //                   onClick={back}
// //                   onMouseEnter={(e) => {
// //                     e.target.style.backgroundColor = "#ffffff";
// //                     e.target.style.transform = "translateY(-1px)";
// //                     e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
// //                   }}
// //                   onMouseLeave={(e) => {
// //                     e.target.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
// //                     e.target.style.transform = "translateY(0)";
// //                     e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
// //                   }}
// //                 >
// //                   <i className="mdi mdi-arrow-left me-2" style={{ fontSize: "14px" }}></i>
// //                   Back
// //                 </Button>
// //               </Col>
// //             </Row>
// //           </CardBody>
// //         </Card>
// //       </Container>

// //       {/* Stages section with horizontal scroll */}
// //       <div
// //         style={{
// //           flex: "1 1 auto",
// //           overflowX: "auto",
// //           overflowY: "hidden",
// //           paddingLeft: "0.5rem",
// //           paddingRight: "0.5rem",
// //           paddingBottom: "1rem",
// //         }}
// //       >
// //         <div
// //           style={{
// //             display: "flex",
// //             gap: "1.5rem",
// //             height: "100%",
// //             paddingBottom: "1rem",
// //           }}
// //         >
// //           {stages.map((stage, stageIndex) => {
// //             const cameras = stage?.camera_selection?.cameras || [];
// //             const streams = cameraStreams[stageIndex] || [];

// //             return (
// //               <div
// //                 key={stage._id.$oid}
// //                 style={{
// //                   minWidth: "400px",
// //                   maxWidth: "500px",
// //                   flex: "0 0 auto",
// //                   display: "flex",
// //                   flexDirection: "column",
// //                   height: "calc(100% - 80px)",
// //                 }}
// //               >
// //                 {/* Stage Header */}
// //                 <Card
// //                   className="mb-3 border-0"
// //                   style={{
// //                     borderRadius: "12px",
// //                     overflow: "hidden",
// //                     boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
// //                     background: "linear-gradient(135deg, #42a5f5 0%, #478ed1 100%)",
// //                     flex: "0 0 auto",
// //                   }}
// //                 >
// //                   <CardBody
// //                     className="py-2 px-3"
// //                     style={{
// //                       display: "flex",
// //                       alignItems: "center",
// //                       justifyContent: "center",
// //                     }}
// //                   >
// //                     <div className="text-center">
// //                       <div
// //                         style={{
// //                           fontSize: "10px",
// //                           fontWeight: "600",
// //                           color: "rgba(255, 255, 255, 0.75)",
// //                           textTransform: "uppercase",
// //                           letterSpacing: "0.6px",
// //                           marginBottom: "4px",
// //                         }}
// //                       >
// //                         Stage Name / Code
// //                       </div>
// //                       <div
// //                         style={{
// //                           fontSize: "15px",
// //                           fontWeight: "700",
// //                           color: "#fff",
// //                         }}
// //                       >
// //                         {stage.stage_name}{" "}
// //                         <span style={{ fontWeight: "600", opacity: 0.9, fontSize: "13px" }}>
// //                           ({stage.stage_code})
// //                         </span>
// //                       </div>
// //                     </div>
// //                     <div className="mx-2">
// //                     <Button
// //                                     size="sm"
// //                                      onClick={handleStageCameraSync}
// //                                     style={{
// //                                       background: "linear-gradient(135deg, #34d399 0%, #059669 100%)",
// //                                       border: "none",
// //                                       borderRadius: "20px",
// //                                       padding: "6px 14px",
// //                                       fontSize: "12px",
// //                                       fontWeight: "600",
// //                                       color: "#fff",
// //                                       boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
// //                                       transition: "all 0.3s ease",
// //                                     }}
// //                                     onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
// //                                     onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
// //                                   >
// //                                     <i className="fa fa-sync-alt me-1" />
// //                                     Training Sync
// //                                   </Button>
// //                                   </div>
// //                   </CardBody>
// //                 </Card>

// //                 {/* Camera Grid - Scrollable */}
// //                 <div
// //                   style={{
// //                     flex: "1 1 auto",
// //                     overflowY: "auto",
// //                     overflowX: "hidden",
// //                   }}
// //                 >
// //                   {/* <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
// //                     {cameras.map((camera, camIndex) => {
// //                       const videoKey = `${stageIndex}-${camIndex}`;
// //                       const hasStream = streams[camIndex] !== null;

// //                       return (
// //                         <Card
// //                           key={camIndex}
// //                           className="border-0"
// //                           style={{
// //                             borderRadius: "10px",
// //                             overflow: "hidden",
// //                             boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
// //                             backgroundColor: "#ffffff",
// //                             transition: "transform 0.2s ease, box-shadow 0.2s ease",
// //                           }}
// //                           onMouseEnter={(e) => {
// //                             e.currentTarget.style.transform = "translateY(-4px)";
// //                             e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)";
// //                           }}
// //                           onMouseLeave={(e) => {
// //                             e.currentTarget.style.transform = "translateY(0)";
// //                             e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
// //                           }}
// //                         >
// //                           <div
// //                             className="px-3 py-2"
// //                             style={{
// //                               background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
// //                             }}
// //                           >
// //                             <h5
// //                               className="mb-0 text-white text-truncate"
// //                               style={{ fontSize: "14px", fontWeight: "600" }}
// //                             >
// //                               {camera.label}
// //                             </h5>
// //                           </div>

// //                           <CardBody className="p-2" style={{ backgroundColor: "#fafafa" }}>
// //                             <div
// //                               style={{
// //                                 position: "relative",
// //                                 width: "100%",
// //                                 paddingBottom: "65%",
// //                                 borderRadius: "6px",
// //                                 overflow: "hidden",
// //                                 backgroundColor: "#000",
// //                               }}
// //                             >
// //                               {hasStream ? (
// //                                 <video
// //                                   ref={(el) => (videoRefs.current[videoKey] = el)}
// //                                   autoPlay
// //                                   playsInline
// //                                   muted
// //                                   className="position-absolute top-0 start-0 w-100 h-100"
// //                                   style={{ objectFit: "cover" }}
// //                                 />
// //                               ) : (
// //                                 <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center flex-column">
// //                                   <i
// //                                     className="mdi mdi-video-off"
// //                                     style={{ fontSize: "32px", color: "#6b7280", marginBottom: "8px" }}
// //                                   />
// //                                   <span style={{ color: "#9ca3af", fontSize: "12px" }}>
// //                                     Camera Not Available
// //                                   </span>
// //                                 </div>
// //                               )}
// //                             </div>
// //                           </CardBody>
// //                         </Card>
// //                       );
// //                     })}
// //                   </div> */}
// //                   <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
// //                     {cameras.map((camera, camIndex) => {
// //                       const videoKey = `${stageIndex}-${camIndex}`;
// //                       const hasStream = streams[camIndex] !== null;

// //                       return (
// //                         <Card
// //                           key={camIndex}
// //                           className="border-0"
// //                           style={{
// //                             borderRadius: "10px",
// //                             overflow: "hidden",
// //                             boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
// //                             backgroundColor: "#ffffff",
// //                             transition: "transform 0.2s ease, box-shadow 0.2s ease",
// //                           }}
// //                           onMouseEnter={(e) => {
// //                             e.currentTarget.style.transform = "translateY(-4px)";
// //                             e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)";
// //                           }}
// //                           onMouseLeave={(e) => {
// //                             e.currentTarget.style.transform = "translateY(0)";
// //                             e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
// //                           }}
// //                         >
// //                           <div
// //                             className="px-3 py-2"
// //                             style={{
// //                               background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
// //                             }}
// //                           >
// //                             <h5
// //                               className="mb-0 text-white text-truncate"
// //                               style={{ fontSize: "14px", fontWeight: "600" }}
// //                             >
// //                               {camera.label}
// //                             </h5>
// //                           </div>

// //                           <CardBody className="p-2" style={{ backgroundColor: "#fafafa" }}>
// //                             <div
// //                               style={{
// //                                 position: "relative",
// //                                 width: "100%",
// //                                 height: "300px", // ✅ Fixed visible height
// //                                 borderRadius: "6px",
// //                                 overflow: "hidden",
// //                                 backgroundColor: "#000",
// //                               }}
// //                             >
// //                               {hasStream ? (
// //                                 <video
// //                                   ref={(el) => (videoRefs.current[videoKey] = el)}
// //                                   autoPlay
// //                                   playsInline
// //                                   muted
// //                                   className="position-absolute top-0 start-0 w-100 h-100"
// //                                   style={{ objectFit: "cover" }}
// //                                 />
// //                               ) : (
// //                                 <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center flex-column">
// //                                   <i
// //                                     className="mdi mdi-video-off"
// //                                     style={{ fontSize: "32px", color: "#6b7280", marginBottom: "8px" }}
// //                                   />
// //                                   <span style={{ color: "#9ca3af", fontSize: "12px" }}>
// //                                     Camera Not Available
// //                                   </span>
// //                                 </div>
// //                               )}
// //                             </div>
// //                           </CardBody>
// //                         </Card>
// //                       );
// //                     })}
// //                   </div>

// //                 </div>
// //               </div>
// //             );
// //           })}
// //         </div>
// //       </div>

// //       {/* Capture Button - Fixed at Bottom */}
// //       <div
// //         style={{
// //           flex: "0 0 auto",
// //           padding: "1rem 0",
// //           background: "linear-gradient(to top, #ffffff, transparent)",
// //         }}
// //       >
// //         <div className="text-center">
// //           <Button
// //             size="lg"
// //             onClick={handleCaptureAll}
// //             style={{
// //               background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
// //               border: "none",
// //               borderRadius: "50px",
// //               padding: "12px 48px",
// //               fontSize: "16px",
// //               fontWeight: "600",
// //               boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
// //               color: "white",
// //               transition: "all 0.3s ease",
// //             }}
// //             onMouseEnter={(e) => {
// //               e.target.style.transform = "scale(1.05)";
// //               e.target.style.boxShadow = "0 6px 16px rgba(0,0,0,0.3)";
// //             }}
// //             onMouseLeave={(e) => {
// //               e.target.style.transform = "scale(1)";
// //               e.target.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";
// //             }}
// //           >
// //             <i className="fa fa-camera me-2" />
// //             Capture All Cameras
// //           </Button>
// //         </div>
// //       </div>

// //       {alert}
// //     </div>
// //   );
// // };

// // export default RemoteStg;



// import React, { useEffect, useRef, useState } from "react";
// import { useLocation, useHistory } from "react-router-dom";
// import { Container, Button, Col, Row, Card, CardBody } from "reactstrap";
// import MetaTags from "react-meta-tags";
// import urlSocket from "./urlSocket";
// import SweetAlert from "react-bootstrap-sweetalert";
// import './index.css'
// import PropTypes from 'prop-types';
// import WebcamCapture from "../WebcamCustom/WebcamCapture";


// const CustomToast = ({ message, type, onClose }) => {
//   const [isVisible, setIsVisible] = useState(true);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsVisible(false);
//       onClose();
//     }, 5000); // Toast disappears after 5 seconds

//     return () => clearTimeout(timer);
//   }, [onClose]);

//   return (
//     isVisible && (
//       <div
//         className={`toast ${type === 'error' ? 'toast-error' : 'toast-success'} show`}
//         style={{
//           position: 'fixed',
//           top: '20px',
//           right: '20px',
//           maxWidth: '350px',
//           zIndex: '9999',
//           borderRadius: '8px',
//           padding: '15px 20px',
//           backgroundColor: type === 'error' ? '#f44336' : '#4caf50',
//           color: 'white',
//           fontWeight: 'bold',
//           boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
//           opacity: 0.9,
//           transition: 'opacity 0.3s ease-in-out',
//           display: 'flex',
//           alignItems: 'center',
//           gap: '10px',
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
//             fontSize: '18px',
//             cursor: 'pointer',
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


// const RemoteStg = () => {
//   const location = useLocation();
//   const history = useHistory();
//   const { datas } = location.state || {};
//   const stages = datas?.stages || [];

//   const [cameraStreams, setCameraStreams] = useState({});

//   const [alert, setAlert] = useState(null);
//   const [toastMessage, setToastMessage] = useState(null);
//   const [toastType, setToastType] = useState(null)
//   const webcamRefs = useRef({});
//   const [isCapturingAll, setIsCapturingAll] = useState(false);
//   const [isSyncing, setIsSyncing] = useState(false);





//   useEffect(() => {
//     let activeStreams = {}; // stageIndex -> [streams]

//     async function setupAllStages() {
//       Object.values(cameraStreams).forEach((streams) =>
//         streams.forEach((s) => s?.getTracks()?.forEach((t) => t.stop()))
//       );

//       // Request permission to list devices
//       await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
//       const devices = await navigator.mediaDevices.enumerateDevices();
//       console.log("Available devices:", devices);

//       const allStreams = {}; // stageIndex -> [streams]

//       for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
//         const stage = stages[stageIndex];
//         const cameras = stage?.camera_selection?.cameras || [];
//         allStreams[stageIndex] = [];

//         for (let cam of cameras) {
//           try {
//             const videoDevice = devices.find((d) => {
//               if (d.kind !== "videoinput") return false;
//               const label = d.label?.toLowerCase() || "";
//               const matchByLabel = cam.originalLabel && label.includes(cam.originalLabel.toLowerCase());
//               const matchByVID = cam.v_id && label.includes(cam.v_id.toLowerCase());
//               const matchByPID = cam.p_id && label.includes(cam.p_id.toLowerCase());
//               return matchByLabel || matchByVID || matchByPID;
//             });

//             console.log(`Matched device for ${cam.label}:`, videoDevice);

//             const stream = videoDevice
//               ? await navigator.mediaDevices.getUserMedia({
//                 video: { deviceId: { exact: videoDevice.deviceId } },
//                 audio: false,
//               })
//               : null;

//             allStreams[stageIndex].push(stream);
//           } catch (err) {
//             console.error(`Error accessing ${cam.label}:`, err);
//             allStreams[stageIndex].push(null);
//           }
//         }
//       }

//       activeStreams = allStreams;
//       setCameraStreams(allStreams);


//       validateMissingPreviews(allStreams);
//     }

//     setupAllStages();

//     return () => {
//       Object.values(activeStreams).forEach((streams) =>
//         streams.forEach((s) => s && s.getTracks().forEach((t) => t.stop()))
//       );
//     };
//   }, [stages]);




//   const validateMissingPreviews = (streamsByStage) => {
//     const messages = [];

//     Object.entries(streamsByStage).forEach(([stageIndex, streams]) => {
//       const stage = stages[stageIndex];
//       const cameras = stage?.camera_selection?.cameras || [];

//       const missingCameras = streams
//         .map((stream, i) => (stream === null ? cameras[i]?.label : null))
//         .filter(Boolean);

//       if (missingCameras.length > 0) {
//         messages.push(`Cameras previews are missing in ${stage.stage_name} -> ${missingCameras.join(", ")}`);
//       }
//     });

//     if (messages.length > 0) {
//       const formattedMessage = messages.map(msg => <div key={msg}>{msg}</div>);
//       setToastMessage(formattedMessage);
//       setToastType("error");
//     }

//   };






//   useEffect(() => {
//     const timer = setTimeout(() => {
//       Object.keys(cameraStreams).forEach((stageIndex) => {
//         cameraStreams[stageIndex].forEach((stream, camIndex) => {
//           const video = webcamRefs.current[camIndex];
//           if (video && stream && video.srcObject !== stream) {
//             video.srcObject = stream;
//           }
//         });
//       });
//     }, 400);
//     return () => clearTimeout(timer);
//   }, [cameraStreams]);

//   const back = () => history.goBack();




//   const handleCaptureAll = async () => {
//     try {
//       setIsCapturingAll(true);
//       const invalidCameras = [];

//       stages.forEach((stage, stageIndex) => {
//         const cameras = stage?.camera_selection?.cameras || [];
//         cameras.forEach((camera, camIndex) => {
//           const webcamInstance = webcamRefs.current[camera.originalLabel];
//           if (!webcamInstance || !webcamInstance.captureZoomedImage || webcamInstance.cameraDisconnected) {
//             invalidCameras.push(`${camera.label} (Stage: ${stage.stage_name})`);
//           }
//         });
//       });

//       if (invalidCameras.length > 0) {
//         const message = invalidCameras.length === 1
//           ? `🚫 Camera "${invalidCameras[0]}" is not showing preview.`
//           : `🚫 ${invalidCameras.length} cameras are not showing preview:\n${invalidCameras.join(", ")}`;

//         setToastMessage(message);
//         setToastType("error");
//         setIsCapturingAll(false);

//         return;
//       }

//       const capturedImages = [];

//       for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
//         const stage = stages[stageIndex];
//         const cameras = stage?.camera_selection?.cameras || [];

//         for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
//           const camera = cameras[camIndex];
//           const webcamInstance = webcamRefs.current[camera.originalLabel];

//           const base64Image = webcamInstance.captureZoomedImage();

//           if (base64Image) {
//             capturedImages.push({
//               stage_index: stageIndex,
//               comp_name: datas.comp_name,
//               comp_code: datas.comp_code,
//               comp_id: datas.comp_id,
//               stage_name: stage.stage_name,
//               stage_code: stage.stage_code,
//               camera_label: camera.label || `Camera ${camIndex + 1}`,
//               camera_id: camera.v_id,
//               timestamp: new Date().toISOString(),
//               image: base64Image,
//             });
//           } else {
//             console.warn(`Camera ${camera.label} returned no image.`);
//             setToastMessage(`🚫 Failed to capture please check the camera connections`);

//             setToastType("error");
//             setIsCapturingAll(false);
//             return;
//           }
//         }
//       }

//       if (capturedImages.length > 0) {
//         console.log("✅ Captured Images:", capturedImages);
//         await sendCapturedImages(capturedImages);
//         setToastMessage(`${capturedImages.length} image(s) have been captured and saved successfully.`);
//         setToastType("success");
//       } else {
//         setToastMessage("⚠️ No images captured. Please check your camera previews.");
//         setToastType("error");
//       }
//     } catch (error) {
//       console.error("❌ Error capturing images:", error);
//       setToastMessage("Failed to capture images. Please try again.");
//       setToastType("error");
//     }
//     finally {
//       setIsCapturingAll(false);
//     }
//   };


//   const sendCapturedImages = async (capturedImages) => {
//     try {
//       const response = await urlSocket.post("/save_stage_camera_images", { capturedImages });
//       console.log('responsemulti', response);
//       console.log("✅ Server response:", response.data);
//     } catch (err) {
//       console.error("❌ Error sending captured images:", err);
//     }
//   };


//   const handleStageCameraSync = async () => {
//     try {
//       setIsSyncing(true);
//       const res = await urlSocket.post("/sync_training_mode_result_train");
//       console.log('response_stage_sync', res);

//       if (res?.data) {
//         console.log(`✅ ${res.data.sts}\nTotal Synced Groups: ${res.data.count}`);
//         console.table(res.data.synced_groups);

//         setToastMessage(`Successfully synced ${res.data.count} Images.`);
//         setToastType('success');
//       } else {
//         console.warn("⚠️ No response data received from sync API");

//         setToastMessage("Failed to sync: No response data received.");
//         setToastType('error');
//       }
//     } catch (err) {
//       console.error("❌ Error during stage image sync:", err);

//       setToastMessage("Error during sync. Please try again.");
//       setToastType('error');
//     }
//     finally {
//       setIsSyncing(false);
//     }
//   };


//   return (
//     <div
//       className="page-content"
//       style={{
//         background: "linear-gradient(to bottom, #ffffff, #f8f9fa)",
//         height: "100vh",
//         display: "flex",
//         flexDirection: "column",
//         overflow: "hidden",
//       }}
//     >
//       <MetaTags>
//         <title>Remote Camera Gallery</title>
//       </MetaTags>

//       {/* Header */}
//       <Container fluid className="px-2 px-md-3 pt-2" style={{ flex: "0 0 auto" }}>
//         <Card
//           className="mb-3 border-0"
//           style={{
//             borderRadius: "12px",
//             boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
//             background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
//             position: "relative",
//             overflow: "hidden",
//           }}
//         >
//           <div
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               background: "radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)",
//               pointerEvents: "none",
//             }}
//           />

//           <CardBody className="p-3" style={{ position: "relative", zIndex: 1 }}>
//             <Row className="align-items-center">
//               <Col xs={8} md={10} className="d-flex align-items-center">
//                 <div
//                   className="d-flex align-items-center justify-content-center me-3"
//                   style={{
//                     width: "40px",
//                     height: "40px",
//                     borderRadius: "10px",
//                     backgroundColor: "rgba(255, 255, 255, 0.25)",
//                     backdropFilter: "blur(10px)",
//                     fontSize: "18px",
//                     boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
//                     border: "1px solid rgba(255, 255, 255, 0.3)",
//                   }}
//                 >
//                   🎥
//                 </div>
//                 <h3
//                   className="mb-0"
//                   style={{
//                     fontSize: "clamp(16px, 2.5vw, 20px)",
//                     fontWeight: "700",
//                     color: "#ffffff",
//                     letterSpacing: "-0.02em",
//                     textShadow: "0 2px 4px rgba(0,0,0,0.1)",
//                   }}
//                 >
//                   Remote Camera Gallery
//                 </h3>
//               </Col>

//               <Col xs={4} md={2} className="d-flex justify-content-end">
//                 <Button
//                   color="light"
//                   size="sm"
//                   className="d-flex align-items-center"
//                   style={{
//                     fontWeight: "600",
//                     borderRadius: "8px",
//                     fontSize: "13px",
//                     padding: "8px 16px",
//                     backgroundColor: "rgba(255, 255, 255, 0.95)",
//                     color: "#667eea",
//                     border: "1.5px solid rgba(255, 255, 255, 0.3)",
//                     boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
//                     transition: "all 0.2s ease",
//                   }}
//                   onClick={back}
//                   onMouseEnter={(e) => {
//                     e.target.style.backgroundColor = "#ffffff";
//                     e.target.style.transform = "translateY(-1px)";
//                     e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
//                   }}
//                   onMouseLeave={(e) => {
//                     e.target.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
//                     e.target.style.transform = "translateY(0)";
//                     e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
//                   }}
//                 >
//                   <i className="mdi mdi-arrow-left me-2" style={{ fontSize: "14px" }}></i>
//                   Back
//                 </Button>
//               </Col>
//             </Row>
//           </CardBody>
//         </Card>
//       </Container>

//       {/* Stages section with vertical layout */}
//       <div
//         style={{
//           flex: "1 1 auto",
//           overflowY: "auto",
//           paddingLeft: "0.5rem",
//           paddingRight: "0.5rem",
//           paddingBottom: "1rem",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             gap: "2rem",
//             paddingBottom: "1rem",
//           }}
//         >
//           <div style={{ display: "flex", justifyContent: "center", width: "100%", marginBottom: "8px" }}>
//             <Button
//               size="sm"
//               onClick={handleStageCameraSync}
//               style={{
//                 background: "linear-gradient(135deg, #34d399 0%, #059669 100%)",
//                 border: "none",
//                 borderRadius: "20px",
//                 padding: "6px 14px",
//                 fontSize: "12px",
//                 fontWeight: "600",
//                 color: "#fff",
//                 boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
//                 transition: "all 0.3s ease",
//               }}
//               onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
//               onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
//             >
//               {isSyncing ? (
//                 <>
//                   <i className="fa fa-spinner fa-spin me-1" /> Syncing...
//                 </>
//               ) : (
//                 <>
//                   <i className="fa fa-sync-alt me-1" /> Training Sync
//                 </>
//               )}
//             </Button>
//           </div>
//           <div
//             style={{
//               display: "flex",
//               flexDirection: "column",
//               gap: "2rem",
//             }}
//           >
//             {(() => {
//               const stageRows = [];
//               let currentRow = [];

//               stages.forEach((stage, i) => {
//                 const cameras = stage?.camera_selection?.cameras || [];
//                 const cameraCount = cameras.length;

//                 if (cameraCount > 3) {
//                   if (currentRow.length > 0) {
//                     stageRows.push([...currentRow]);
//                     currentRow = [];
//                   }
//                   stageRows.push([stage]);
//                 } else {
//                   currentRow.push(stage);
//                   if (currentRow.length === 2) {
//                     stageRows.push([...currentRow]);
//                     currentRow = [];
//                   }
//                 }
//               });

//               if (currentRow.length > 0) stageRows.push([...currentRow]);

//               return stageRows.map((rowStages, rowIndex) => (
//                 <div
//                   key={rowIndex}
//                   style={{
//                     display: "flex",
//                     flexWrap: "nowrap",
//                     gap: "1.5rem",
//                     justifyContent: "center",
//                     alignItems: "flex-start",
//                   }}
//                 >
//                   {rowStages.map((stage, stageIndex) => {
//                     const cameras = stage?.camera_selection?.cameras || [];

//                     return (
//                       <div
//                         key={stage._id.$oid}
//                         style={{
//                           flex: cameras.length > 3 ? "1 1 100%" : "1 1 45%",
//                           minWidth: cameras.length > 3 ? "100%" : "350px",
//                           maxWidth: cameras.length > 3 ? "100%" : "600px",
//                           display: "flex",
//                           flexDirection: "column",
//                         }}
//                       >
//                         <Card className="mb-3 border-0" style={{
//                           borderRadius: "12px",
//                           overflow: "hidden",
//                           boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
//                           background: "linear-gradient(135deg, #42a5f5 0%, #478ed1 100%)"
//                         }}>
//                           <CardBody className="py-2 px-3" style={{ display: "flex", justifyContent: "center" }}>
//                             <div className="text-center">
//                               <div style={{ fontSize: "10px", fontWeight: "600", color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "4px" }}>
//                                 Stage Name / Code
//                               </div>
//                               <div style={{ fontSize: "15px", fontWeight: "700", color: "#fff" }}>
//                                 {stage.stage_name}{" "}
//                                 <span style={{ fontWeight: "600", opacity: 0.9, fontSize: "13px" }}>
//                                   ({stage.stage_code})
//                                 </span>
//                               </div>
//                             </div>
//                           </CardBody>
//                         </Card>

//                         <div style={{
//                           display: "flex",
//                           flexDirection: "row",
//                           gap: "1rem",
//                           overflowX: cameras.length > 3 ? "auto" : "visible",
//                           paddingBottom: "1rem",
//                           justifyContent: cameras.length <= 3 ? "center" : "flex-start",
//                         }}>
//                           {cameras.map((camera, camIndex) => {
//                             return (
//                               <Card
//                                 key={camIndex}
//                                 className="border-0"
//                                 style={{
//                                   borderRadius: "10px",
//                                   overflow: "hidden",
//                                   boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
//                                   backgroundColor: "#ffffff",
//                                   transition: "transform 0.2s ease, box-shadow 0.2s ease",
//                                   flex: "0 0 auto",
//                                   width: "260px",
//                                 }}
//                                 onMouseEnter={(e) => {
//                                   e.currentTarget.style.transform = "translateY(-4px)";
//                                   e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)";
//                                 }}
//                                 onMouseLeave={(e) => {
//                                   e.currentTarget.style.transform = "translateY(0)";
//                                   e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
//                                 }}
//                               >
//                                 <div className="px-3 py-2" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
//                                   <h5 className="mb-0 text-white text-truncate" style={{ fontSize: "14px", fontWeight: "600" }}>
//                                     {camera.label}
//                                   </h5>
//                                 </div>

//                                 <CardBody className="p-2" style={{
//                                   backgroundColor: "#fafafa",
//                                   display: "flex",
//                                   alignItems: "center",
//                                   justifyContent: "center",
//                                   minHeight: "160px",
//                                 }}>
//                                   <div style={{
//                                     position: "relative",
//                                     width: "100%",
//                                     height: "180px",
//                                     borderRadius: "6px",
//                                     overflow: "hidden",
//                                     backgroundColor: "#000",
//                                     boxShadow: "inset 0 0 8px rgba(0,0,0,0.3)",
//                                   }}>
//                                     <WebcamCapture
//                                       ref={(el) => (webcamRefs.current[camera.originalLabel] = el)}
//                                       key={camera.originalLabel}
//                                       resolution={{ width: 640, height: 480 }}
//                                       zoom={1}
//                                       center={{ x: 0.5, y: 0.5 }}
//                                       cameraLabel={camera.originalLabel}
//                                       style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
//                                     />
//                                   </div>
//                                 </CardBody>
//                               </Card>
//                             );
//                           })}
//                         </div>
//                       </div>
//                     );
//                   })}

//                 </div>
//               ));
//             })()}
//           </div>

//         </div>
//       </div>

//       <div className="toast-container" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: '9999', display: 'flex', flexDirection: 'column', gap: '10px' }}>
//         {toastMessage && (
//           <CustomToast
//             message={toastMessage}
//             type={toastType}
//             onClose={() => setToastMessage(null)}
//           />
//         )}
//       </div>
//       <div
//         style={{
//           flex: "0 0 auto",
//           padding: "1rem 0",
//           background: "linear-gradient(to top, #ffffff, transparent)",
//         }}
//       >
//         <div className="text-center">
//           <Button
//             size="lg"
//             onClick={handleCaptureAll}
//             style={{
//               background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
//               border: "none",
//               borderRadius: "50px",
//               padding: "12px 48px",
//               fontSize: "16px",
//               fontWeight: "600",
//               boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
//               color: "white",
//               transition: "all 0.3s ease",
//             }}
//             onMouseEnter={(e) => {
//               e.target.style.transform = "scale(1.05)";
//               e.target.style.boxShadow = "0 6px 16px rgba(0,0,0,0.3)";
//             }}
//             onMouseLeave={(e) => {
//               e.target.style.transform = "scale(1)";
//               e.target.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";
//             }}
//           >
//             {isCapturingAll ? (
//               <>
//                 <i className="fa fa-spinner fa-spin" /> Capturing...
//               </>
//             ) : (
//               <>
//                 <i className="fa fa-camera me-2" /> Capture All Cameras
//               </>
//             )}
//           </Button>
//         </div>
//       </div>

//       {alert}
//     </div>
//   );
// };



// export default RemoteStg;


import React, { useEffect, useRef, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { Container, Button, Col, Row, Card, CardBody } from "reactstrap";
import MetaTags from "react-meta-tags";
import urlSocket from "./urlSocket";
import SweetAlert from "react-bootstrap-sweetalert";
import './index.css'
import PropTypes from 'prop-types';
import WebcamCapture from "../WebcamCustom/WebcamCapture";


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
        className={`toast ${type === 'error' ? 'toast-error' : 'toast-success'} show`}
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
          borderColor: type === 'error' ? '#dc2626' : '#059669',
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
            padding: '0 5px',
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
  onClose: PropTypes.func.isRequired,
};


const RemoteStg = () => {
  const location = useLocation();
  const history = useHistory();
  const { datas } = location.state || {};
  const stages = datas?.stages || [];

  const [cameraStreams, setCameraStreams] = useState({});
  const [alert, setAlert] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState(null)
  const webcamRefs = useRef({});
  const [isCapturingAll, setIsCapturingAll] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    let activeStreams = {};

    async function setupAllStages() {
      Object.values(cameraStreams).forEach((streams) =>
        streams.forEach((s) => s?.getTracks()?.forEach((t) => t.stop()))
      );

      await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log("Available devices:", devices);

      const allStreams = {};

      for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
        const stage = stages[stageIndex];
        const cameras = stage?.camera_selection?.cameras || [];
        allStreams[stageIndex] = [];

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

            console.log(`Matched device for ${cam.label}:`, videoDevice);

            const stream = videoDevice
              ? await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: videoDevice.deviceId } },
                audio: false,
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
      Object.values(activeStreams).forEach((streams) =>
        streams.forEach((s) => s && s.getTracks().forEach((t) => t.stop()))
      );
    };
  }, [stages]);

  const validateMissingPreviews = (streamsByStage) => {
    const messages = [];

    Object.entries(streamsByStage).forEach(([stageIndex, streams]) => {
      const stage = stages[stageIndex];
      const cameras = stage?.camera_selection?.cameras || [];

      const missingCameras = streams
        .map((stream, i) => (stream === null ? cameras[i]?.label : null))
        .filter(Boolean);

      if (missingCameras.length > 0) {
        messages.push(`Cameras previews are missing in ${stage.stage_name} -> ${missingCameras.join(", ")}`);
      }
    });

    if (messages.length > 0) {
      const formattedMessage = messages.map(msg => <div key={msg}>{msg}</div>);
      setToastMessage(formattedMessage);
      setToastType("error");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      Object.keys(cameraStreams).forEach((stageIndex) => {
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

      stages.forEach((stage, stageIndex) => {
        const cameras = stage?.camera_selection?.cameras || [];
        cameras.forEach((camera, camIndex) => {
          const webcamInstance = webcamRefs.current[camera.originalLabel];
          if (!webcamInstance || !webcamInstance.captureZoomedImage || webcamInstance.cameraDisconnected) {
            invalidCameras.push(`${camera.label} (Stage: ${stage.stage_name})`);
          }
        });
      });

      if (invalidCameras.length > 0) {
        const message = invalidCameras.length === 1
          ? `🚫 Camera "${invalidCameras[0]}" is not showing preview.`
          : `🚫 ${invalidCameras.length} cameras are not showing preview:\n${invalidCameras.join(", ")}`;

        setToastMessage(message);
        setToastType("error");
        setIsCapturingAll(false);
        return;
      }

      const capturedImages = [];

      for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
        const stage = stages[stageIndex];
        const cameras = stage?.camera_selection?.cameras || [];

        for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
          const camera = cameras[camIndex];
          const webcamInstance = webcamRefs.current[camera.originalLabel];

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
            });
          } else {
            console.warn(`Camera ${camera.label} returned no image.`);
            setToastMessage(`🚫 Failed to capture please check the camera connections`);
            setToastType("error");
            setIsCapturingAll(false);
            return;
          }
        }
      }

      if (capturedImages.length > 0) {
        console.log("✅ Captured Images:", capturedImages);
        await sendCapturedImages(capturedImages);
        setToastMessage(`${capturedImages.length} image(s) have been captured and saved successfully.`);
        setToastType("success");
      } else {
        setToastMessage("⚠️ No images captured. Please check your camera previews.");
        setToastType("error");
      }
    } catch (error) {
      console.error("❌ Error capturing images:", error);
      setToastMessage("Failed to capture images. Please try again.");
      setToastType("error");
    } finally {
      setIsCapturingAll(false);
    }
  };

  const sendCapturedImages = async (capturedImages) => {
    try {
      const response = await urlSocket.post("/save_stage_camera_images", { capturedImages });
      console.log('responsemulti', response);
      console.log("✅ Server response:", response.data);
    } catch (err) {
      console.error("❌ Error sending captured images:", err);
    }
  };

  const handleStageCameraSync = async () => {
    try {
      setIsSyncing(true);
      const res = await urlSocket.post("/sync_training_mode_result_train");
      console.log('response_stage_sync', res);

      if (res?.data) {
        console.log(`✅ ${res.data.sts}\nTotal Synced Groups: ${res.data.count}`);
        console.table(res.data.synced_groups);
        setToastMessage(`Successfully synced ${res.data.count} Images.`);
        setToastType('success');
      } else {
        console.warn("⚠️ No response data received from sync API");
        setToastMessage("Failed to sync: No response data received.");
        setToastType('error');
      }
    } catch (err) {
      console.error("❌ Error during stage image sync:", err);
      setToastMessage("Error during sync. Please try again.");
      setToastType('error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div
      className="page-content"
      style={{
        backgroundColor: "#f9fafb",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <MetaTags>
        <title>Remote Camera Gallery</title>
      </MetaTags>

      {/* Header */}
      <Container fluid className="px-3 pt-3" style={{ flex: "0 0 auto" }}>
        <Card
          className="mb-2 border"
          style={{
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            backgroundColor: "#ffffff",
            borderColor: "#e5e7eb",
          }}
        >
          <CardBody className="py-2 px-3">
            <Row className="align-items-center">
              <Col xs={8} md={10} className="d-flex align-items-center">
                <div
                  className="d-flex align-items-center justify-content-center me-2"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    backgroundColor: "#f3f4f6",
                    fontSize: "16px",
                  }}
                >
                  🎥
                </div>
                <h3
                  className="mb-0"
                  style={{
                    fontSize: "clamp(15px, 2.5vw, 18px)",
                    fontWeight: "600",
                    color: "#1f2937",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Remote Camera Gallery
                </h3>
              </Col>

              <Col xs={4} md={2} className="d-flex justify-content-end">
                <Button
                  color="light"
                  size="sm"
                  className="d-flex align-items-center"
                  style={{
                    fontWeight: "500",
                    borderRadius: "6px",
                    fontSize: "13px",
                    padding: "6px 14px",
                    backgroundColor: "#f9fafb",
                    color: "#374151",
                    border: "1px solid #d1d5db",
                    transition: "all 0.2s ease",
                  }}
                  onClick={back}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#f3f4f6";
                    e.target.style.borderColor = "#9ca3af";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#f9fafb";
                    e.target.style.borderColor = "#d1d5db";
                  }}
                >
                  <i className="mdi mdi-arrow-left me-1" style={{ fontSize: "14px" }}></i>
                  Back
                </Button>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Container>

      {/* Stages section with vertical layout */}
      <div
        style={{
          flex: "1 1 auto",
          overflowY: "auto",
          paddingLeft: "0.75rem",
          paddingRight: "0.75rem",
          paddingBottom: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            paddingBottom: "1rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: "12px" }}>
            <Button
              size="sm"
              onClick={handleStageCameraSync}
              disabled={isSyncing}
              style={{
                backgroundColor: "#10b981",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: "600",
                color: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                transition: "all 0.2s ease",
                opacity: isSyncing ? 0.7 : 1,
              }}
              onMouseOver={(e) => !isSyncing && (e.currentTarget.style.backgroundColor = "#059669")}
              onMouseOut={(e) => !isSyncing && (e.currentTarget.style.backgroundColor = "#10b981")}
            >
              {isSyncing ? (
                <>
                  <i className="fa fa-spinner fa-spin me-1" /> Syncing...
                </>
              ) : (
                <>
                  <i className="fa fa-sync-alt me-1" /> Training Sync
                </>
              )}
            </Button>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
            }}
          >
            {(() => {
              const stageRows = [];
              let currentRow = [];

              stages.forEach((stage, i) => {
                const cameras = stage?.camera_selection?.cameras || [];
                const cameraCount = cameras.length;

                if (cameraCount > 3) {
                  if (currentRow.length > 0) {
                    stageRows.push([...currentRow]);
                    currentRow = [];
                  }
                  stageRows.push([stage]);
                } else {
                  currentRow.push(stage);
                  if (currentRow.length === 2) {
                    stageRows.push([...currentRow]);
                    currentRow = [];
                  }
                }
              });

              if (currentRow.length > 0) stageRows.push([...currentRow]);

              return stageRows.map((rowStages, rowIndex) => (
                <div
                  key={rowIndex}
                  style={{
                    display: "flex",
                    flexWrap: "nowrap",
                    gap: "1.5rem",
                    justifyContent: "center",
                    alignItems: "flex-start",
                  }}
                >
                  {rowStages.map((stage, stageIndex) => {
                    const cameras = stage?.camera_selection?.cameras || [];

                    return (
                      <div
                        key={stage._id.$oid}
                        style={{
                          flex: cameras.length > 3 ? "1 1 100%" : "1 1 45%",
                          minWidth: cameras.length > 3 ? "100%" : "350px",
                          maxWidth: cameras.length > 3 ? "100%" : "600px",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Card
                          className="mb-2 border"
                          style={{
                            borderRadius: "8px",
                            overflow: "hidden",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                            backgroundColor: "#f8f9fa",
                            borderColor: "#e5e7eb",
                          }}
                        >
                          <CardBody className="py-2 px-3" style={{ display: "flex", justifyContent: "center" }}>
                            <div className="text-center">
                              <div
                                style={{
                                  fontSize: "10px",
                                  fontWeight: "600",
                                  color: "#6b7280",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.6px",
                                  marginBottom: "4px",
                                }}
                              >
                                Stage Name / Code
                              </div>
                              <div style={{ fontSize: "15px", fontWeight: "600", color: "#1f2937" }}>
                                {stage.stage_name}{" "}
                                <span style={{ fontWeight: "500", color: "#6b7280", fontSize: "13px" }}>
                                  ({stage.stage_code})
                                </span>
                              </div>
                            </div>
                          </CardBody>
                        </Card>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: "1rem",
                            overflowX: cameras.length > 3 ? "auto" : "visible",
                            paddingBottom: "1rem",
                            justifyContent: cameras.length <= 3 ? "center" : "flex-start",
                          }}
                        >
                          {cameras.map((camera, camIndex) => {
                            return (
                              <Card
                                key={camIndex}
                                className="border"
                                style={{
                                  borderRadius: "8px",
                                  overflow: "hidden",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
                                  backgroundColor: "#ffffff",
                                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                  flex: "0 0 auto",
                                  width: "260px",
                                  borderColor: "#e5e7eb",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = "translateY(-2px)";
                                  e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = "translateY(0)";
                                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.06)";
                                }}
                              >
                                <div
                                  className="px-3 py-2"
                                  style={{
                                    backgroundColor: "#f3f4f6",
                                    borderBottom: "1px solid #e5e7eb",
                                  }}
                                >
                                  <h5
                                    className="mb-0 text-truncate"
                                    style={{ fontSize: "14px", fontWeight: "600", color: "#374151" }}
                                  >
                                    {camera.label}
                                  </h5>
                                </div>

                                <CardBody
                                  className="p-2"
                                  style={{
                                    backgroundColor: "#fafafa",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    minHeight: "160px",
                                  }}
                                >
                                  <div
                                    style={{
                                      position: "relative",
                                      width: "100%",
                                      height: "180px",
                                      borderRadius: "6px",
                                      overflow: "hidden",
                                      backgroundColor: "#000",
                                      border: "1px solid #e5e7eb",
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
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ));
            })()}
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <div
        className="toast-container"
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: "9999",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {toastMessage && (
          <CustomToast message={toastMessage} type={toastType} onClose={() => setToastMessage(null)} />
        )}
      </div>

      {/* Capture Button - Fixed at Bottom */}
      <div
        style={{
          flex: "0 0 auto",
          padding: "1rem 0",
          backgroundColor: "#ffffff",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <div className="text-center">
          <Button
            size="lg"
            onClick={handleCaptureAll}
            disabled={isCapturingAll}
            style={{
              backgroundColor: "#3b82f6",
              border: "none",
              borderRadius: "8px",
              padding: "12px 48px",
              fontSize: "16px",
              fontWeight: "600",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              color: "white",
              transition: "all 0.2s ease",
              opacity: isCapturingAll ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isCapturingAll) {
                e.target.style.backgroundColor = "#2563eb";
                e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isCapturingAll) {
                e.target.style.backgroundColor = "#3b82f6";
                e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
              }
            }}
          >
            {isCapturingAll ? (
              <>
                <i className="fa fa-spinner fa-spin" /> Capturing...
              </>
            ) : (
              <>
                <i className="fa fa-camera me-2" /> Capture All Cameras
              </>
            )}
          </Button>
        </div>
      </div>

      {alert}
    </div>
  );
};

export default RemoteStg;