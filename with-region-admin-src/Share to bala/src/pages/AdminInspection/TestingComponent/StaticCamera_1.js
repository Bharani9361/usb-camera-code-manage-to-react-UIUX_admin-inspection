// import React, { useRef, useEffect, useState } from 'react';
// import Webcam from 'react-webcam';
// import { Col, Row } from 'reactstrap';

// const StaticCamera_1 = () => {
//     const webcamRef = useRef(null);
//     const [focus, setFocus] = useState(0);
//     const [exposure, setExposure] = useState(0);

//     const setCameraSettings = async (track) => {
//         console.log('data11 ', track)
//         const capabilities = track.getCapabilities();

//         // Set focus mode (auto or manual)
//         if (capabilities.focusMode) {
//             await track.applyConstraints({
//                 advanced: [{ focusMode: 'manual' }]
//             });
//         }

//         // Set exposure mode (auto or manual)
//         if (capabilities.exposureMode) {
//             await track.applyConstraints({
//                 advanced: [{ exposureMode: 'manual' }]
//             });
//         }

//         // Set focus distance (manual focus)
//         if (capabilities.focusDistance) {
//             await track.applyConstraints({
//                 advanced: [{ focusDistance: focus }]
//             });
//         }

//         // Set exposure time (manual exposure)
//         if (capabilities.exposureTime) {
//             await track.applyConstraints({
//                 advanced: [{ exposureTime: exposure }]
//             });
//         }
//     };

//     useEffect(() => {
//         const stream = webcamRef.current.video.srcObject;
//         if (stream) {
//             const track = stream.getVideoTracks()[0];
//             setCameraSettings(track);
//         }
//     }, [focus, exposure]);

//     const handleUserMedia = (stream) => {
//         const track = stream.getVideoTracks()[0];
//         const capabilities = track.getCapabilities();

//         if (capabilities.focusDistance) {
//             setFocus(capabilities.focusDistance.min);
//         }

//         if (capabilities.exposureTime) {
//             setExposure(capabilities.exposureTime.min);
//         }

//         setCameraSettings(track);
//     };

//     return (
//         <div className='page-content'>
//             <Row><Col md={6} lg={6}>
//             <Webcam
//                 audio={false}
//                 ref={webcamRef}
//                 screenshotFormat="image/jpeg"
//                 onUserMedia={handleUserMedia}
//                 videoConstraints={{
//                     width: 1280,
//                     height: 720,
//                     facingMode: 'user'
//                 }}
//             /></Col></Row>
            
//             <div>
//                 <label>Focus</label>
//                 <input
//                     type="range"
//                     min="0"
//                     max="100"
//                     value={focus}
//                     onChange={(e) => setFocus(Number(e.target.value))}
//                 />
//                 <span>{focus}</span>
//             </div>
//             <div>
//                 <label>Exposure</label>
//                 <input
//                     type="range"
//                     min="0"
//                     max="100"
//                     value={exposure}
//                     onChange={(e) => setExposure(Number(e.target.value))}
//                 />
//                 <span>{exposure}</span>
//             </div>
//         </div>
//     );
// };

// export default StaticCamera_1;

//  ********************************************************************************
import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';

const StaticCamera_1 = () => {
  const webcamRef = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [focusDistance, setFocusDistance] = useState(1.0);
  const [exposureTime, setExposureTime] = useState(200); // Default exposure time in milliseconds
  const [errorMessage, setErrorMessage] = useState(null);

  const captureImage = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    console.log(imageSrc);
    // Handle the captured image (e.g., save it or send it to a backend)
  };

  const handleFocusChange = async (value) => {
    setFocusDistance(value);
    await applyCameraSettings();
  };

  const handleExposureChange = async (value) => {
    setExposureTime(value);
    await applyCameraSettings();
  };

  const applyCameraSettings = async () => {
    console.log('calledddddddddddddddddddddd')
    try {
      if (webcamRef.current?.video?.srcObject) {
        const videoTrack = webcamRef.current.video.srcObject.getVideoTracks()[0];
        const settings = {};

        // Apply focus distance if supported
        if (videoTrack.getCapabilities().focusMode?.includes('manual')) {
          settings.focusMode = 'manual';
          settings.focusDistance = focusDistance;
        }

        // Apply exposure time if supported
        if (videoTrack.getCapabilities().exposureMode?.includes('manual')) {
          settings.exposureMode = 'manual';
          settings.exposureTime = exposureTime;
        }

        await videoTrack.applyConstraints(settings); // Apply all settings at once
        setIsCameraReady(true);
      }
    } catch (error) {
      console.error('Error applying video constraints:', error);
      setErrorMessage('Error applying video constraints. Please try again.');
    }
  };

  useEffect(() => {
    const configureCamera = async () => {
      if (webcamRef.current?.video?.srcObject) {
        await applyCameraSettings();
      }
    };

    configureCamera();
  }, [webcamRef, focusDistance, exposureTime]);

  const reloadWebcam = () => {
    setIsCameraReady(false); // Reset camera ready state to force reload
  };

  return (
    <div className='page-content'>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={640}
        height={480}
        onUserMedia={() => setIsCameraReady(true)}
        key={isCameraReady} // Key prop to force reload the Webcam component
      />
      <div>
        <label>Focus Distance:</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={focusDistance}
          onChange={(e) => handleFocusChange(parseFloat(e.target.value))}
          disabled={!isCameraReady}
        />
        <span>{focusDistance}</span>
      </div>
      <div>
        <label>Exposure Time (ms):</label>
        <input
          type="range"
          min={1}
          max={1000}
          step={10}
          value={exposureTime}
          onChange={(e) => handleExposureChange(parseInt(e.target.value))}
          disabled={!isCameraReady}
        />
        <span>{exposureTime}</span>
      </div>
      <button onClick={captureImage} disabled={!isCameraReady}>
        Capture Photo
      </button>
      {errorMessage && <p>{errorMessage}</p>}
      <p>{isCameraReady ? 'Camera is ready' : 'Configuring camera settings...'}</p>
    </div>
  );
};

export default StaticCamera_1;
