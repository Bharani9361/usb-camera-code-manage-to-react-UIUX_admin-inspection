

import PropTypes from "prop-types";
import React, {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import Webcam from "react-webcam";
import { DEFAULT_RESOLUTION } from "pages/AdminInspection/cameraConfig";

const WebcamCapture = forwardRef((
  {
    resolution = DEFAULT_RESOLUTION,
    zoom = 1,
    center = { x: 0.5, y: 0.5 },
    style = {},
    deviceId = undefined,
    cameraLabel = undefined,
    onDisconnect = () => { },
    onCameraReady = () => { }
  }, ref) => {
  const webcamRef = useRef();

  const offscreenCanvasRef = useRef();
  const visibleCanvasRef = useRef();
  const animationRef = useRef();
  const [availableCameras, setAvailableCameras] = useState([]);
  const [currentCameraId, setCurrentCameraId] = useState(null);
  const [cameraDisconnected, setCameraDisconnected] = useState(false);

  // Get available cameras
  useEffect(() => {
    const getAvailableCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setAvailableCameras(videoDevices);

        console.log('📹 Available cameras:', videoDevices.map(d => ({
          label: d.label,
          deviceId: d.deviceId
        })));
      } catch (error) {
        console.error('Error getting camera devices:', error);
        setAvailableCameras([]);
      }
    };

    getAvailableCameras();

    // Listen for device changes
    const handleDeviceChange = () => {
      console.log('🔄 Device change detected, re-checking cameras...');
      getAvailableCameras();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, []);

  // Handle camera label changes and validate camera availability
  useEffect(() => {
    if (cameraLabel && availableCameras.length > 0) {
      console.log('🔍 Camera originalLabel changed to:', cameraLabel);
      console.log('🔍 Available cameras:', availableCameras.map(c => c.label));

      // Check if the requested camera is available
      const foundCamera = availableCameras.find(camera =>
        camera.label === cameraLabel ||
        camera.label.includes(cameraLabel) ||
        cameraLabel.includes(camera.label)
      );

      if (foundCamera) {
        console.log('✅ Camera found:', foundCamera.label);
        setCameraDisconnected(false);
        setCurrentCameraId(foundCamera.deviceId);
      } else {
        console.log('❌ Camera not found for label:', cameraLabel);
        setCameraDisconnected(true);
        setTimeout(() => onDisconnect(), 100);
      }
    } else if (cameraLabel && availableCameras.length === 0) {
      console.log('⏳ Waiting for cameras to be enumerated...');
    } else if (!cameraLabel) {
      // No specific camera requested, reset states
      setCameraDisconnected(false);
      setCurrentCameraId(null);
    }
  }, [cameraLabel, availableCameras, onDisconnect]);

  // Expose capture method to parent
  useImperativeHandle(ref, () => ({
    captureZoomedImage,
  }));

  const captureZoomedImage = () => {
    const offCanvas = offscreenCanvasRef.current;
    const cropCanvas = document.createElement('canvas');
    const ctx = cropCanvas.getContext('2d');

    const cropW = resolution.width / zoom;
    const cropH = resolution.height / zoom;
    const cropX = center.x * resolution.width - cropW / 2;
    const cropY = center.y * resolution.height - cropH / 2;

    cropCanvas.width = resolution.width;
    cropCanvas.height = resolution.height;

    ctx.drawImage(
      offCanvas,
      cropX, cropY, cropW, cropH,
      0, 0, resolution.width, resolution.height
    );

    return cropCanvas.toDataURL('image/png');
  };

  useEffect(() => {
    const render = () => {
      const video = webcamRef.current?.video;
      const offCanvas = offscreenCanvasRef.current;
      const visibleCanvas = visibleCanvasRef.current;



      if (video && video.readyState === 4 && offCanvas && visibleCanvas) {
        const offCtx = offCanvas.getContext('2d');
        offCanvas.width = resolution.width;
        offCanvas.height = resolution.height;
        offCtx.drawImage(video, 0, 0, resolution.width, resolution.height);

        const cropW = resolution.width / zoom;
        const cropH = resolution.height / zoom;
        const cropX = center.x * resolution.width - cropW / 2;
        const cropY = center.y * resolution.height - cropH / 2;

        const visCtx = visibleCanvas.getContext('2d');
        visCtx.clearRect(0, 0, visibleCanvas.width, visibleCanvas.height);
        visCtx.drawImage(
          offCanvas,
          cropX, cropY, cropW, cropH,
          0, 0, visibleCanvas.width, visibleCanvas.height
        );
      }

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationRef.current);
  }, [zoom, center, resolution]);

  return (
    <>
      {/* Hidden webcam + canvas - only render if camera is not disconnected */}
      {!cameraDisconnected && <Webcam
        key={`webcam-${cameraLabel || 'default'}`}
        ref={webcamRef}
        audio={false}
        width={1}
        height={1}
        // style={{
        //   visibility: 'hidden',
        //   position: 'absolute',
        //   pointerEvents: 'none',
        //   zIndex: -1,
        //   width: 1,
        //   height: 1,
        // }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -1,
          width: 1,
          height: 1,
        }}



        videoConstraints={(() => {
          const baseConstraints = {
            width: resolution.width,
            height: resolution.height,
            frameRate: { ideal: 30, max: 60 }
          };

          console.log('🎥 Building constraints - cameraLabel:', cameraLabel, 'currentCameraId:', currentCameraId);

          // Use validated camera ID if available
          if (currentCameraId) {
            console.log('✅ Using validated camera:', currentCameraId);
            return {
              ...baseConstraints,
              deviceId: { exact: currentCameraId }
            };
          }

          // Use deviceId from props if no camera label
          if (deviceId && !cameraLabel) {
            console.log('📱 Using deviceId from props:', deviceId);
            return {
              ...baseConstraints,
              deviceId: { exact: deviceId }
            };
          }

          // Default to user-facing camera
          console.log('🔄 Using default camera');
          return {
            ...baseConstraints,
            facingMode: 'user'
          };
        })()}
        onUserMedia={() => {
          onCameraReady();
        }}
        onUserMediaError={(error) => {
          console.error('❌ Camera error:', error.name, error.message);
          console.error('❌ Requested camera:', cameraLabel);

          // If a specific camera was requested and failed, mark as disconnected
          if (cameraLabel) {
            console.log('❌ Specific camera failed:', cameraLabel);
            setCameraDisconnected(true);
            onDisconnect();
          } else {
            // General camera error
            console.log('❌ General camera error');
            onDisconnect();
          }
        }}
      />}

      {!cameraDisconnected && (
        <>
          <canvas
            ref={offscreenCanvasRef}
            width={resolution.width}
            height={resolution.height}
            style={{
              visibility: 'hidden',
              position: 'absolute',
              pointerEvents: 'none',
              zIndex: -1,
              width: 1,
              height: 1,
            }}
          />

          {/* Zoomed preview canvas */}
          <canvas
            ref={visibleCanvasRef}
            width={resolution.width}
            height={resolution.height}
            style={{
              width: '100%',
              height: 'auto',
              display: 'inline-block',
              // border: '2px solid #ccc',
              borderRadius: '10px',
              ...style,
            }}
          />
        </>
      )}

      {/* Show disconnected message when camera is not available */}
      {cameraDisconnected && cameraLabel && (
        <div style={{
          width: '100%',
          height: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          border: '2px dashed #dee2e6',
          borderRadius: '10px',
          color: '#6c757d'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📷</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Camera Disconnected</div>
            <div style={{ fontSize: '14px', marginTop: '5px' }}>
              {cameraLabel} is not available
            </div>
          </div>
        </div>
      )}
    </>
  );
});

WebcamCapture.displayName = "WebcamCapture";
WebcamCapture.propTypes = {
  resolution: PropTypes.any,
  zoom: PropTypes.any,
  center: PropTypes.any,
  style: PropTypes.any,
};


WebcamCapture.displayName = "WebcamCapture";
WebcamCapture.propTypes = {
  resolution: PropTypes.object,
  zoom: PropTypes.number,
  center: PropTypes.object,
  style: PropTypes.object,
  deviceId: PropTypes.string,
  cameraLabel: PropTypes.string,
  onDisconnect: PropTypes.func,
  onCameraReady: PropTypes.func,
};

export default WebcamCapture;



// import React, { forwardRef, useRef, useImperativeHandle } from 'react';
// import Webcam from 'react-webcam';
// import PropTypes from 'prop-types';

// import { DEFAULT_RESOLUTION } from 'pages/AdminInspection/cameraConfig';

// const WebcamCapture = forwardRef(({ resolution = DEFAULT_RESOLUTION }, ref) => {
//   const webcamRef = useRef(null);

//   useImperativeHandle(ref, () => ({
//     captureImage: () => {
//       return webcamRef.current.getScreenshot({
//         width: resolution.width,
//         height: resolution.height,
//       });
//     },
//   }));

//   return (
//     <Webcam
//       ref={webcamRef}
//       audio={false}
//       screenshotFormat="image/png"
//       videoConstraints={{
//         width: resolution.width,
//         height: resolution.height,
//         facingMode: 'user',
//       }}
//       style={{ borderRadius: '10px', width: '100%' }}
//     />
//   );
// });

// WebcamCapture.displayName = 'WebcamCapture'; // Set display name for debugging
// WebcamCapture.propTypes = {
//   resolution: PropTypes.any, // Define the type of resolution prop if needed
// };

// export default WebcamCapture;

// // perfectly zoomable webcam capture component (but all in one)
// const WebcamCapture = forwardRef(
//   ({ resolution = DEFAULT_RESOLUTION }, ref) => {
//     const webcamRef = useRef();
//     const offscreenCanvasRef = useRef();
//     const visibleCanvasRef = useRef();
//     const animationRef = useRef();

//     const [zoom, setZoom] = useState(1);
//     const [center, setCenter] = useState({ x: 0.5, y: 0.5 }); // relative to image

//     const [isDragging, setIsDragging] = useState(false);
//     const [startDrag, setStartDrag] = useState(null);

//     // Expose capture method to parent
//     useImperativeHandle(ref, () => ({
//       captureZoomedImage,
//     }));

//     // Main rendering loop
//     useEffect(() => {
//       const render = () => {
//         const video = webcamRef.current?.video;
//         const offCanvas = offscreenCanvasRef.current;
//         const visibleCanvas = visibleCanvasRef.current;

//         if (
//           video &&
//           video.readyState === 4 &&
//           offCanvas &&
//           visibleCanvas &&
//           resolution
//         ) {
//           const offCtx = offCanvas.getContext('2d');
//           offCanvas.width = resolution.width;
//           offCanvas.height = resolution.height;
//           offCtx.drawImage(video, 0, 0, resolution.width, resolution.height);

//           const cropW = resolution.width / zoom;
//           const cropH = resolution.height / zoom;
//           const cropX = center.x * resolution.width - cropW / 2;
//           const cropY = center.y * resolution.height - cropH / 2;

//           const visCtx = visibleCanvas.getContext('2d');
//           const visW = visibleCanvas.width;
//           const visH = visibleCanvas.height;

//           visCtx.clearRect(0, 0, visW, visH);
//           visCtx.drawImage(
//             offCanvas,
//             cropX,
//             cropY,
//             cropW,
//             cropH,
//             0,
//             0,
//             visW,
//             visH
//           );
//         }

//         animationRef.current = requestAnimationFrame(render);
//       };

//       animationRef.current = requestAnimationFrame(render);
//       return () => cancelAnimationFrame(animationRef.current);
//     }, [zoom, center, resolution]);

//     // Handle drag
//     const handleMouseDown = (e) => {
//       setIsDragging(true);
//       setStartDrag({ x: e.clientX, y: e.clientY });
//     };

//     const handleMouseMove = (e) => {
//       if (!isDragging || !startDrag) return;
//       const dx = e.clientX - startDrag.x;
//       const dy = e.clientY - startDrag.y;

//       const canvas = visibleCanvasRef.current;
//       if (!canvas) return;

//       const dxNorm = dx / canvas.width;
//       const dyNorm = dy / canvas.height;

//       const zoomedRatio = 1 / zoom;

//       setCenter((prev) => ({
//         x: Math.max(
//           zoomedRatio / 2,
//           Math.min(1 - zoomedRatio / 2, prev.x - dxNorm * zoomedRatio)
//         ),
//         y: Math.max(
//           zoomedRatio / 2,
//           Math.min(1 - zoomedRatio / 2, prev.y - dyNorm * zoomedRatio)
//         ),
//       }));

//       setStartDrag({ x: e.clientX, y: e.clientY });
//     };

//     const handleMouseUp = () => setIsDragging(false);

//     // Capture zoomed area at full resolution
//     const captureZoomedImage = () => {
//       const offCanvas = offscreenCanvasRef.current;
//       const cropCanvas = document.createElement('canvas');
//       const ctx = cropCanvas.getContext('2d');

//       const cropW = resolution.width / zoom;
//       const cropH = resolution.height / zoom;
//       const cropX = center.x * resolution.width - cropW / 2;
//       const cropY = center.y * resolution.height - cropH / 2;

//       cropCanvas.width = resolution.width;
//       cropCanvas.height = resolution.height;

//       ctx.drawImage(
//         offCanvas,
//         cropX,
//         cropY,
//         cropW,
//         cropH,
//         0,
//         0,
//         resolution.width,
//         resolution.height
//       );

//       return cropCanvas.toDataURL('image/png');
//     };

//     return (
//       <div>
//         {/* Hidden webcam + offscreen canvas */}
//         <>One</>
//         <Webcam
//           ref={webcamRef}
//           audio={false}
//           width={1}
//           height={1}
//           style={{
//             visibility: 'hidden',
//             position: 'absolute',
//             pointerEvents: 'none',
//             zIndex: -1,
//             width: 1,
//             height: 1,
//           }}
//           videoConstraints={{
//             width: resolution.width,
//             height: resolution.height,
//             facingMode: 'user',
//           }}
//         />

//         <>Two</>
//         <canvas
//           ref={offscreenCanvasRef}
//           width={resolution.width}
//           height={resolution.height}
//           style={{
//             visibility: 'hidden',
//             position: 'absolute',
//             pointerEvents: 'none',
//             zIndex: -1,
//             width: 1,
//             height: 1,
//           }}
//         />

//         <>Three</>
//         {/* Zoomable visible preview */}
//         <div
//           onMouseDown={handleMouseDown}
//           onMouseMove={handleMouseMove}
//           onMouseUp={handleMouseUp}
//           onMouseLeave={handleMouseUp}
//           style={{
//             border: '2px solid #ccc',
//             borderRadius: '10px',
//             aspectRatio: `${resolution.width} / ${resolution.height}`,
//             width: '100%',
//             overflow: 'hidden',
//             cursor: isDragging ? 'grabbing' : 'grab',
//           }}
//         >
//           <canvas
//             ref={visibleCanvasRef}
//             width={resolution.width}
//             height={resolution.height}
//             style={{
//               width: '100%',
//               height: '100%',
//               display: 'block',
//             }}
//           />
//         </div>

//         {/* Zoom Controls */}
//         <div className="d-flex justify-content-between align-items-center mt-3">
//           <div className="btn-group">
//             <button
//               className="btn btn-secondary"
//               onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
//             >
//               -
//             </button>
//             <button
//               className="btn btn-secondary"
//               onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
//             >
//               +
//             </button>
//           </div>
//           <button
//             className="btn btn-outline-secondary"
//             onClick={() => {
//               setZoom(1);
//               setCenter({ x: 0.5, y: 0.5 });
//             }}
//           >
//             Reset
//           </button>
//         </div>
//       </div>
//     );
//   }
// );

// WebcamCapture.displayName = "WebcamCapture";
// WebcamCapture.propTypes = {
//   resolution: PropTypes.any,
//   minZoom: PropTypes.any,
//   maxZoom: PropTypes.any,
//   initialZoom: PropTypes.any,
// };