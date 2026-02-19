import React, { useEffect, useRef, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { Container, Button, Col, Row, Card, CardBody } from "reactstrap";
import MetaTags from "react-meta-tags";
import urlSocket from "./urlSocket";
import SweetAlert from "react-bootstrap-sweetalert";
import './index.css'
import PropTypes from 'prop-types';
import WebcamCapture from "../WebcamCustom/WebcamCapture";
import { DEFAULT_RESOLUTION } from "./cameraConfig";


const CustomToast = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 5000); // Toast disappears after 5 seconds

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
          backgroundColor: type === 'error' ? '#f44336' : '#4caf50',
          color: 'white',
          fontWeight: 'bold',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
          opacity: 0.9,
          transition: 'opacity 0.3s ease-in-out',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
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
            fontSize: '18px',
            cursor: 'pointer',
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
  const videoRefs = useRef({});
  const [isCapturing, setIsCapturing] = useState(false);
  const [alert, setAlert] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState(null)
  const webcamRefs = useRef({});

  //   useEffect(() => {
  //   let allStreams = {};

  //   async function setupAllCameras() {
  //     try {
  //       Object.values(cameraStreams).forEach((streams) => {
  //         streams.forEach((s) => s?.getTracks().forEach((t) => t.stop()));
  //       });

  //       await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  //       const devices = await navigator.mediaDevices.enumerateDevices();

  //       allStreams = {};

  //       for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
  //         const stage = stages[stageIndex];
  //         const cameras = stage?.camera_selection?.cameras || [];
  //         allStreams[stageIndex] = [];

  //         for (let cam of cameras) {
  //           try {
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
  //               allStreams[stageIndex].push(null);
  //               continue;
  //             }

  //             const stream = await navigator.mediaDevices.getUserMedia({
  //               video: { deviceId: { exact: videoDevice.deviceId } },
  //               audio: false,
  //             });

  //             allStreams[stageIndex].push(stream);
  //           } catch (err) {
  //             console.error(`❌ Error accessing ${cam.label}:`, err);
  //             allStreams[stageIndex].push(null);
  //           }
  //         }
  //       }

  //       setCameraStreams(allStreams);

  //       validateMissingPreviews(allStreams);
  //     } catch (error) {
  //       console.error("❌ Camera setup failed:", error);
  //       setToastMessage("❌ Failed to access cameras. Please check permissions or connections.");
  //       setToastType("error");
  //     }
  //   }

  //   setupAllCameras();

  //   return () => {
  //     Object.values(allStreams).forEach((streams) =>
  //       streams.forEach((s) => s?.getTracks().forEach((t) => t.stop()))
  //     );
  //   };
  // }, [stages]);



  useEffect(() => {
    let activeStreams = {}; // stageIndex -> [streams]

    async function setupAllStages() {
      // Stop all previous streams
      Object.values(cameraStreams).forEach((streams) =>
        streams.forEach((s) => s?.getTracks()?.forEach((t) => t.stop()))
      );

      // Request permission to list devices
      await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log("Available devices:", devices);

      const allStreams = {}; // stageIndex -> [streams]

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

      // // Optional: set a flag if any camera is available
      // const anyCameraAvailable = Object.values(allStreams).some((streams) =>
      //   streams.some((s) => s !== null)
      // );
      // setCameraAvailable(anyCameraAvailable);

      validateMissingPreviews(allStreams);
    }

    setupAllStages();

    return () => {
      // Cleanup all streams
      Object.values(activeStreams).forEach((streams) =>
        streams.forEach((s) => s && s.getTracks().forEach((t) => t.stop()))
      );
    };
  }, [stages]);




  const validateMissingPreviews = (streamsByStage) => {
    let messages = [];

    Object.entries(streamsByStage).forEach(([stageIndex, streams]) => {
      const stage = stages[stageIndex];
      const cameras = stage?.camera_selection?.cameras || [];

      const missingCameras = streams
        .map((stream, i) => (stream === null ? cameras[i]?.label : null))
        .filter((label) => label !== null);

      if (missingCameras.length > 0) {
        const cameraList = missingCameras.join(", ");
        messages.push(`🔹 **${stage.stage_name}** → ${cameraList}`);
      }
    });

    if (messages.length > 0) {
      const formattedMessage = `⚠️ Missing Camera Previews:\n\n${messages.join("\n")}`;
      setToastMessage(formattedMessage);
      setToastType("error");
    }
  };





  useEffect(() => {
    const timer = setTimeout(() => {
      Object.keys(cameraStreams).forEach((stageIndex) => {
        cameraStreams[stageIndex].forEach((stream, camIndex) => {
          // const videoKey = `${stageIndex}-${camIndex}`;
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
      const capturedImages = [];

      for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
        const stage = stages[stageIndex];
        const cameras = stage?.camera_selection?.cameras || [];

        for (let camIndex = 0; camIndex < cameras.length; camIndex++) {
          const videoKey = `${stageIndex}-${camIndex}`;
          const video = videoRefs.current[videoKey];

          if (video && video.readyState >= 2) {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const base64Image = canvas.toDataURL("image/jpeg", 0.9);

            capturedImages.push({
              stage_index: stageIndex,
              comp_name: datas.comp_name,
              comp_code: datas.comp_code,
              comp_id: datas.comp_id,
              stage_name: stage.stage_name,
              stage_code: stage.stage_code,
              camera_label: cameras[camIndex].label || `Camera ${camIndex + 1}`,
              camera_id: cameras[camIndex].v_id,
              timestamp: new Date().toISOString(),
              image: base64Image,
            });
          } else {
            console.warn(`Skipping camera ${camIndex} (not ready)`);
          }
        }
      }

      console.log("✅ Captured Images:", capturedImages);
      await sendCapturedImages(capturedImages);

      setToastMessage(`${capturedImages.length} image(s) have been captured and saved successfully.`);
      setToastType('success');
    } catch (error) {
      console.error("❌ Error capturing images:", error);
      setToastMessage("Failed to capture images. Please try again.");
      setToastType('error');
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
      const res = await urlSocket.post("/sync_training_mode_result_train");
      console.log('response_stage_sync', res);

      if (res?.data) {
        console.log(`✅ ${res.data.sts}\nTotal Synced Groups: ${res.data.count}`);
        console.table(res.data.synced_groups);

        // Show success toast
        setToastMessage(`Successfully synced ${res.data.count} Images.`);
        setToastType('success');
      } else {
        console.warn("⚠️ No response data received from sync API");

        // Show error toast if no data is received
        setToastMessage("Failed to sync: No response data received.");
        setToastType('error');
      }
    } catch (err) {
      console.error("❌ Error during stage image sync:", err);

      // Show error toast on failure
      setToastMessage("Error during sync. Please try again.");
      setToastType('error');
    }
  };


  return (
    <div
      className="page-content"
      style={{
        background: "linear-gradient(to bottom, #ffffff, #f8f9fa)",
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
      <Container fluid className="px-2 px-md-3 pt-2" style={{ flex: "0 0 auto" }}>
        <Card
          className="mb-3 border-0"
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />

          <CardBody className="p-3" style={{ position: "relative", zIndex: 1 }}>
            <Row className="align-items-center">
              <Col xs={8} md={10} className="d-flex align-items-center">
                <div
                  className="d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(255, 255, 255, 0.25)",
                    backdropFilter: "blur(10px)",
                    fontSize: "18px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                  }}
                >
                  🎥
                </div>
                <h3
                  className="mb-0"
                  style={{
                    fontSize: "clamp(16px, 2.5vw, 20px)",
                    fontWeight: "700",
                    color: "#ffffff",
                    letterSpacing: "-0.02em",
                    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
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
                    fontWeight: "600",
                    borderRadius: "8px",
                    fontSize: "13px",
                    padding: "8px 16px",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    color: "#667eea",
                    border: "1.5px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    transition: "all 0.2s ease",
                  }}
                  onClick={back}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#ffffff";
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
                  }}
                >
                  <i className="mdi mdi-arrow-left me-2" style={{ fontSize: "14px" }}></i>
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
          paddingLeft: "0.5rem",
          paddingRight: "0.5rem",
          paddingBottom: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
            paddingBottom: "1rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", width: "100%", marginBottom: "8px" }}>
            <Button
              size="sm"
              onClick={handleStageCameraSync}
              style={{
                background: "linear-gradient(135deg, #34d399 0%, #059669 100%)",
                border: "none",
                borderRadius: "20px",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#fff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <i className="fa fa-sync-alt me-1" />
              Training Sync
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
                    const streams = cameraStreams[stages.indexOf(stage)] || [];

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
                          className="mb-3 border-0"
                          style={{
                            borderRadius: "12px",
                            overflow: "hidden",
                            boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
                            background: "linear-gradient(135deg, #42a5f5 0%, #478ed1 100%)",
                          }}
                        >
                          <CardBody
                            className="py-2 px-3"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <div className="text-center">
                              <div
                                style={{
                                  fontSize: "10px",
                                  fontWeight: "600",
                                  color: "rgba(255, 255, 255, 0.75)",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.6px",
                                  marginBottom: "4px",
                                }}
                              >
                                Stage Name / Code
                              </div>
                              <div
                                style={{
                                  fontSize: "15px",
                                  fontWeight: "700",
                                  color: "#fff",
                                }}
                              >
                                {stage.stage_name}{" "}
                                <span style={{ fontWeight: "600", opacity: 0.9, fontSize: "13px" }}>
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
                            console.log('camera', camera, camIndex)
                            //  const matchedDevice = camera.value;
                            const matchedDevice = cameraStreams[stageIndex]?.[camIndex];
                            console.log('matchedDevice', matchedDevice);

                            return (
                              <Card
                                key={camIndex}
                                className="border-0"
                                style={{
                                  borderRadius: "10px",
                                  overflow: "hidden",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                  backgroundColor: "#ffffff",
                                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                  flex: "0 0 auto",
                                  width: "260px",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = "translateY(-4px)";
                                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = "translateY(0)";
                                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                                }}
                              >
                                <div
                                  className="px-3 py-2"
                                  style={{
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                  }}
                                >
                                  <h5
                                    className="mb-0 text-white text-truncate"
                                    style={{ fontSize: "14px", fontWeight: "600" }}
                                  >
                                    {camera.label}
                                  </h5>
                                </div>

                                {/* Compact Camera View */}
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
                                      boxShadow: "inset 0 0 8px rgba(0,0,0,0.3)",
                                    }}
                                  >
                                    {matchedDevice ? (
                                      <WebcamCapture
                                        ref={(el) => (webcamRefs.current[`${stageIndex}-${camIndex}`] = el)}
                                        key={matchedDevice}
                                        resolution={DEFAULT_RESOLUTION}
                                        videoConstraints={{
                                          width: DEFAULT_RESOLUTION.width,
                                          height: DEFAULT_RESOLUTION.height,
                                        }}
                                        zoom={1}
                                        center={{ x: 0.5, y: 0.5 }}
                                        stream={matchedDevice}
                                        style={{
                                          position: "absolute",
                                          top: 0,
                                          left: 0,
                                          width: "100%",
                                          height: "100%",
                                          objectFit: "cover",
                                        }}
                                      />
                                    ) : (
                                      <div
                                        key={`no-camera-${camIndex}`}
                                        style={{
                                          position: "absolute",
                                          top: 0,
                                          left: 0,
                                          width: "100%",
                                          height: "100%",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          backgroundColor: "#1f2937",
                                          color: "#fff",
                                          fontSize: "14px",
                                          fontWeight: "600",
                                          border: "2px dashed rgba(255,255,255,0.3)",
                                          borderRadius: "6px",
                                        }}
                                      >
                                        Camera Not Available
                                      </div>
                                    )}
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

      {/* Capture Button - Fixed at Bottom */}
      <div className="toast-container" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: '9999', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {toastMessage && (
          <CustomToast
            message={toastMessage}
            type={toastType}
            onClose={() => setToastMessage(null)}
          />
        )}
      </div>
      <div
        style={{
          flex: "0 0 auto",
          padding: "1rem 0",
          background: "linear-gradient(to top, #ffffff, transparent)",
        }}
      >
        <div className="text-center">
          <Button
            size="lg"
            onClick={handleCaptureAll}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: "50px",
              padding: "12px 48px",
              fontSize: "16px",
              fontWeight: "600",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              color: "white",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.05)";
              e.target.style.boxShadow = "0 6px 16px rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)";
            }}
          >
            <i className="fa fa-camera me-2" />
            Capture All Cameras
          </Button>
        </div>
      </div>

      {alert}
    </div>
  );
};



export default RemoteStg;