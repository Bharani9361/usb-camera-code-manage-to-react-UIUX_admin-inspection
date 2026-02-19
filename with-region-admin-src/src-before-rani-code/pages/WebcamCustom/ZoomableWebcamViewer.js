// import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
// import WebcamCapture from './WebcamCapture';
// import { DEFAULT_RESOLUTION } from 'pages/AdminInspection/cameraConfig';
// import PropTypes from 'prop-types';

// const ZoomableWebcamViewer = forwardRef(({ resolution = DEFAULT_RESOLUTION }, ref) => {
//     const webcamRef = useRef();
//     const containerRef = useRef();

//     const [zoom, setZoom] = useState(1);
//     const [relativeOffset, setRelativeOffset] = useState({ x: 0, y: 0 }); // Stored in 0-1 range
//     const [isDragging, setIsDragging] = useState(false);
//     const [dragStart, setDragStart] = useState(null);

//     // Allow parent to call capture
//     useImperativeHandle(ref, () => ({
//         captureZoomedImage: () => captureZoomedImage(),
//     }));

//     // Helper: convert relative offset to pixel offset for display
//     const getPixelOffset = () => {
//         const container = containerRef.current;
//         if (!container) return { x: 0, y: 0 };
//         return {
//             x: relativeOffset.x * container.offsetWidth,
//             y: relativeOffset.y * container.offsetHeight,
//         };
//     };

//     // Drag handlers
//     const handleMouseDown = (e) => {
//         setIsDragging(true);
//         setDragStart({ x: e.clientX, y: e.clientY });
//     };

//     const handleMouseMove = (e) => {
//         if (!isDragging || !dragStart) return;

//         const dx = e.clientX - dragStart.x;
//         const dy = e.clientY - dragStart.y;

//         const container = containerRef.current;
//         const offsetXPercent = dx / container.offsetWidth;
//         const offsetYPercent = dy / container.offsetHeight;

//         setRelativeOffset((prev) => ({
//             x: Math.max(0, Math.min(1 - 1 / zoom, prev.x - offsetXPercent)),
//             y: Math.max(0, Math.min(1 - 1 / zoom, prev.y - offsetYPercent)),
//         }));

//         setDragStart({ x: e.clientX, y: e.clientY });
//     };

//     const handleMouseUp = () => setIsDragging(false);

//     // Capture function with relative offset & zoom
//     const captureZoomedImage = () => {
//         const base64 = webcamRef.current.captureImage();
//         if (!base64) return null;

//         const img = new Image();
//         img.src = base64;

//         return new Promise((resolve) => {
//             img.onload = () => {
//                 const canvas = document.createElement('canvas');
//                 const ctx = canvas.getContext('2d');

//                 const cropW = resolution.width / zoom;
//                 const cropH = resolution.height / zoom;
//                 const cropX = relativeOffset.x * resolution.width;
//                 const cropY = relativeOffset.y * resolution.height;

//                 canvas.width = resolution.width;
//                 canvas.height = resolution.height;

//                 ctx.drawImage(
//                     img,
//                     cropX, cropY, cropW, cropH,
//                     0, 0, resolution.width, resolution.height
//                 );

//                 resolve(canvas.toDataURL('image/png'));
//             };
//         });
//     };

//     // Pixel offset used in rendering
//     const pixelOffset = getPixelOffset();

//     return (
//         <div>
//             <div
//                 ref={containerRef}
//                 onMouseDown={handleMouseDown}
//                 onMouseMove={handleMouseMove}
//                 onMouseUp={handleMouseUp}
//                 onMouseLeave={handleMouseUp}
//                 style={{
//                     overflow: 'hidden',
//                     position: 'relative',
//                     width: '100%',
//                     aspectRatio: `${resolution.width} / ${resolution.height}`,
//                     border: '2px solid #ccc',
//                     borderRadius: '10px',
//                     cursor: isDragging ? 'grabbing' : 'grab',
//                 }}
//             >
//                 <div
//                     style={{
//                         transform: `scale(${zoom}) translate(${-pixelOffset.x / zoom}px, ${-pixelOffset.y / zoom}px)`,
//                         transformOrigin: 'top left',
//                     }}
//                 >
//                     <WebcamCapture ref={webcamRef} resolution={resolution} />
//                 </div>
//             </div>

//             {/* Controls */}
//             <div className="d-flex justify-content-between align-items-center mt-3">
//                 <div className="btn-group">
//                     <button
//                         className="btn btn-secondary"
//                         onClick={() => {
//                             setZoom((z) => Math.max(1, z - 0.25));
//                             setRelativeOffset((prev) => ({
//                                 x: Math.min(prev.x, 1 - 1 / (zoom - 0.25)),
//                                 y: Math.min(prev.y, 1 - 1 / (zoom - 0.25)),
//                             }));
//                         }}
//                     >
//                         -
//                     </button>
//                     <button
//                         className="btn btn-secondary"
//                         onClick={() => {
//                             setZoom((z) => Math.min(4, z + 0.25));
//                             setRelativeOffset((prev) => ({
//                                 x: Math.min(prev.x, 1 - 1 / (zoom + 0.25)),
//                                 y: Math.min(prev.y, 1 - 1 / (zoom + 0.25)),
//                             }));
//                         }}
//                     >
//                         +
//                     </button>
//                 </div>
//                 <button
//                     className="btn btn-outline-secondary"
//                     onClick={() => {
//                         setZoom(1);
//                         setRelativeOffset({ x: 0, y: 0 });
//                     }}
//                 >
//                     Reset
//                 </button>
//             </div>
//         </div>
//     );
// });

// ZoomableWebcamViewer.displayName = 'ZoomableWebcamViewer'; // Set display name for debugging
// ZoomableWebcamViewer.propTypes = {
//     resolution: PropTypes.any, // Define the type of resolution prop if needed
// };

// export default ZoomableWebcamViewer;

// // sample usage of WebcamCapture component
// import React, { Component, createRef } from 'react';
// import WebcamCapture from './WebcamCapture';

// class ZoomableWebcamViewer extends Component {
//   constructor(props) {
//     super(props);
//     this.webcamRef = createRef();
//   }

//   handleCapture = async () => {
//     if (this.webcamRef.current) {
//       const image = await this.webcamRef.current.capture();
//       console.log('Captured Image:', image);
//       // Use the image as needed
//     }
//   };

//   render() {
//     return (
//       <div className="container mt-4">
//         <h4>Zoomable Webcam Preview (Class Component)</h4>
//         <WebcamCapture ref={this.webcamRef} resolution={{ width: 1280, height: 720 }} />
//         <button className="btn btn-primary mt-3" onClick={this.handleCapture}>
//           Capture Image
//         </button>
//       </div>
//     );
//   }
// }

// export default ZoomableWebcamViewer;

// ZoomableWebcamViewer.js
import React, { useRef, useState, forwardRef, useImperativeHandle } from "react";
import WebcamCapture from "./WebcamCapture";
import { DEFAULT_RESOLUTION } from "pages/AdminInspection/cameraConfig";
import PropTypes from "prop-types";

const ZoomableWebcamViewer = forwardRef(({
    zoomVal = 1,
    centerVal = { x: 0.5, y: 0.5 },
    deviceId = undefined,
    cameraLabel = undefined,
    onDisconnect = () => {},
    onCameraReady = () => {},
    width = 640,
    height = 480
}, ref) => {
    const webcamCanvasRef = useRef();
    const [zoom, setZoom] = useState(zoomVal);
    const [center, setCenter] = useState(centerVal);

    const [isDragging, setIsDragging] = useState(false);
    const [startDrag, setStartDrag] = useState(null);

    // Expose capture method to parent of Comp2
    useImperativeHandle(ref, () => ({
        capture: async () => {
            if (webcamCanvasRef.current) {
                const imageData = await webcamCanvasRef.current.captureZoomedImage();
                return imageData;
            }
            return null;
        },
        setZoomAndCenter(newZoom, newCenter) {
            setZoom(newZoom);
            setCenter(newCenter);
        },
        getZoomAndCenter() {
            return { zoom, center };
        }
    }));

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartDrag({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !startDrag) return;
        const dx = e.clientX - startDrag.x;
        const dy = e.clientY - startDrag.y;

        const canvas = e.currentTarget;
        const dxNorm = dx / canvas.offsetWidth;
        const dyNorm = dy / canvas.offsetHeight;

        const zoomedRatio = 1 / zoom;

        setCenter((prev) => ({
            x: Math.max(
                zoomedRatio / 2,
                Math.min(1 - zoomedRatio / 2, prev.x - dxNorm * zoomedRatio)
            ),
            y: Math.max(
                zoomedRatio / 2,
                Math.min(1 - zoomedRatio / 2, prev.y - dyNorm * zoomedRatio)
            ),
        }));

        setStartDrag({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleCapture = async () => {
        const image = await webcamCanvasRef.current.captureZoomedImage();
        console.log("Captured image:", image);
    };

    return (
        <div>
            <div
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{
                    width: "100%",
                    aspectRatio: `${DEFAULT_RESOLUTION.width} / ${DEFAULT_RESOLUTION.height}`,
                    overflow: "hidden",
                    cursor: isDragging ? "grabbing" : "grab",
                }}
            >
                <WebcamCapture
                    ref={webcamCanvasRef}
                    resolution={DEFAULT_RESOLUTION}
                    zoom={zoom}
                    center={center}
                    deviceId={deviceId}
                    cameraLabel={cameraLabel}
                    onDisconnect={onDisconnect}
                    onCameraReady={onCameraReady}
                />
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="btn-group">
                    <button
                        className="btn btn-secondary"
                        onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
                    >
                        -
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
                    >
                        +
                    </button>
                </div>
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => {
                        setZoom(1);
                        setCenter({ x: 0.5, y: 0.5 });
                    }}
                >
                    Reset
                </button>
                {/* <button className="btn btn-primary" onClick={handleCapture}>
                    Capture
                </button> */}
            </div>
        </div>
    );
});

ZoomableWebcamViewer.displayName = "ZoomableWebcamViewer"; // Set display name for debugging
ZoomableWebcamViewer.propTypes = {
    zoomVal: PropTypes.number,
    centerVal: PropTypes.object,
    deviceId: PropTypes.string,
    cameraLabel: PropTypes.string,
    onDisconnect: PropTypes.func,
    onCameraReady: PropTypes.func,
    width: PropTypes.number,
    height: PropTypes.number,
};

export default ZoomableWebcamViewer;
