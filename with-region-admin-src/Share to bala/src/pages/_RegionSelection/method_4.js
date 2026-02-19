
// // draw different rectangles in the image. 
// // crop those images, and display it in the user interface. 
// // selected rectangle co-ordinates also shown in the user interface.

// import React, { useState, useRef, useEffect } from 'react';
// import Webcam from 'react-webcam';

// const Method_2 = () => {
//     const webcamRef = useRef(null);
//     const canvasRef = useRef(null);
//     const [imageSrc, setImageSrc] = useState(null);
//     const [rectangles, setRectangles] = useState([]);
//     const [isDrawing, setIsDrawing] = useState(false);
//     const [startPoint, setStartPoint] = useState(null);

//     const capture = () => {
//         const imageSrc = webcamRef.current.getScreenshot();
//         setImageSrc(imageSrc);
//     };

//     const handleMouseDown = (e) => {
//         setIsDrawing(true);
//         setStartPoint({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
//     };

//     const handleMouseUp = (e) => {
//         if (isDrawing) {
//             const endPoint = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
//             if (startPoint) {
//                 const newRectangle = {
//                     startX: startPoint.x,
//                     startY: startPoint.y,
//                     endX: endPoint.x,
//                     endY: endPoint.y,
//                     width: endPoint.x - startPoint.x,
//                     height: endPoint.y - startPoint.y,
//                 };
//                 setRectangles([...rectangles, newRectangle]);
//                 setIsDrawing(false);
//                 setStartPoint(null);
//             }
//         }
//     };

//     const handleMouseMove = (e) => {
//         if (isDrawing && startPoint) {
//             const currentPoint = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
//             drawCanvas(imageSrc, rectangles, startPoint, currentPoint);
//         }
//     };

//     const drawCanvas = (imageSrc, rectangles, startPoint = null, currentPoint = null) => {
//         const canvas = canvasRef.current;
//         const ctx = canvas.getContext('2d');
//         const img = new Image();
//         img.src = imageSrc;
//         img.onload = () => {
//             ctx.clearRect(0, 0, canvas.width, canvas.height);
//             ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

//             rectangles.forEach(rect => {
//                 ctx.beginPath();
//                 ctx.rect(rect.startX, rect.startY, rect.width, rect.height);
//                 ctx.stroke();
//             });

//             if (startPoint && currentPoint) {
//                 ctx.beginPath();
//                 ctx.rect(
//                     startPoint.x,
//                     startPoint.y,
//                     currentPoint.x - startPoint.x,
//                     currentPoint.y - startPoint.y
//                 );
//                 ctx.stroke();
//             }
//         };
//     };

//     useEffect(() => {
//         if (imageSrc) {
//             drawCanvas(imageSrc, rectangles);
//         }
//     }, [imageSrc, rectangles]);

//     const cropImages = () => {
//         const canvas = document.createElement('canvas');
//         const ctx = canvas.getContext('2d');
//         const img = new Image();
//         img.src = imageSrc;

//         const croppedImages = rectangles.map(rect => {
//             canvas.width = rect.width;
//             canvas.height = rect.height;
//             ctx.drawImage(img, rect.startX, rect.startY, rect.width, rect.height, 0, 0, rect.width, rect.height);
//             return canvas.toDataURL('image/jpeg');
//         });

//         return croppedImages;
//     };

//     const displayCroppedImages = () => {
//         const croppedImages = cropImages();
//         croppedImages.forEach((src, index) => {
//             const imgElement = document.createElement('img');
//             imgElement.src = src;
//             imgElement.alt = `Cropped Image ${index + 1}`;
//             document.body.appendChild(imgElement);
//         });
//     };

//     return (
//         <div className='page-content'>
//             <Webcam
//                 audio={false}
//                 ref={webcamRef}
//                 screenshotFormat="image/jpeg"
//             />
//             <button onClick={capture}>Capture photo</button>
//             {imageSrc && (
//                 <div>
//                     <canvas
//                         ref={canvasRef}
//                         width={640}
//                         height={480}
//                         onMouseDown={handleMouseDown}
//                         onMouseUp={handleMouseUp}
//                         onMouseMove={handleMouseMove}
//                     />
//                     <div>
//                         {rectangles.map((rect, index) => (
//                             <div key={index}>
//                                 Rectangle {index + 1}: Start ({rect.startX}, {rect.startY}), End ({rect.endX}, {rect.endY})
//                             </div>
//                         ))}
//                     </div>
//                     <button onClick={displayCroppedImages}>Crop Images</button>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Method_2;

// // this method with draw rectangle with input name box. 
// // rectangle name not shown in above rectangle.

// // draw different rectangles in the image. 
// // crop those images, and display it in the user interface. 
// // selected rectangle co-ordinates also shown in the user interface.

// import { Image as AntdImage } from 'antd';
// import React, { useState, useRef, useEffect } from 'react';
// import Webcam from 'react-webcam';
// import { Card, CardBody, CardFooter, CardImg, Col, Row } from 'reactstrap';

// const Method_2 = () => {
//     const webcamRef = useRef(null);
//     const canvasRef = useRef(null);
//     const [imageSrc, setImageSrc] = useState(null);
//     const [rectangles, setRectangles] = useState([]);
//     const [isDrawing, setIsDrawing] = useState(false);
//     const [startPoint, setStartPoint] = useState(null);
//     const [croppedImages, setCroppedImages] = useState([])

//     const capture = () => {
//         const imageSrc = webcamRef.current.getScreenshot();
//         setImageSrc(imageSrc);
//     };

//     const handleMouseDown = (e) => {
//         setIsDrawing(true);
//         setStartPoint({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
//     };

//     const handleMouseUp = (e) => {
//         if (isDrawing) {
//             const endPoint = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
//             if (startPoint) {
//                 const newRectangle = {
//                     startX: startPoint.x,
//                     startY: startPoint.y,
//                     endX: endPoint.x,
//                     endY: endPoint.y,
//                     width: endPoint.x - startPoint.x,
//                     height: endPoint.y - startPoint.y,
//                     name: '', // Initialize with an empty name
//                 };
//                 setRectangles([...rectangles, newRectangle]);
//                 setIsDrawing(false);
//                 setStartPoint(null);
//             }
//         }
//     };

//     const handleMouseMove = (e) => {
//         if (isDrawing && startPoint) {
//             const currentPoint = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
//             drawCanvas(imageSrc, rectangles, startPoint, currentPoint);
//         }
//     };

//     const drawCanvas = (imageSrc, rectangles, startPoint = null, currentPoint = null) => {
//         const canvas = canvasRef.current;
//         const ctx = canvas.getContext('2d');
//         const img = new Image();
//         img.src = imageSrc;
//         img.onload = () => {
//             ctx.clearRect(0, 0, canvas.width, canvas.height);
//             ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

//             rectangles.forEach(rect => {
//                 ctx.beginPath();
//                 ctx.rect(rect.startX, rect.startY, rect.width, rect.height);
//                 ctx.stroke();
//             });

//             if (startPoint && currentPoint) {
//                 ctx.beginPath();
//                 ctx.rect(
//                     startPoint.x,
//                     startPoint.y,
//                     currentPoint.x - startPoint.x,
//                     currentPoint.y - startPoint.y
//                 );
//                 ctx.stroke();
//             }
//         };
//     };

//     useEffect(() => {
//         if (imageSrc) {
//             drawCanvas(imageSrc, rectangles);
//         }
//     }, [imageSrc, rectangles]);

//     const cropImages = () => {
//         const canvas = document.createElement('canvas');
//         const ctx = canvas.getContext('2d');
//         const img = new Image();
//         img.src = imageSrc;

//         const croppedImages = rectangles.map(rect => {
//             canvas.width = rect.width;
//             canvas.height = rect.height;
//             ctx.drawImage(img, rect.startX, rect.startY, rect.width, rect.height, 0, 0, rect.width, rect.height);
//             // return canvas.toDataURL('image/jpeg');
//             return {
//                 src: canvas.toDataURL('image/jpeg'),
//                 name: rect.name || `Rectangle ${index + 1}`, // Use rectangle number if name is empty
//             };
//         });

//         return croppedImages;
//     };

//     const displayCroppedImages = () => {
//         const croppedImages = cropImages();
//         // croppedImages.forEach((src, index) => {
//         //     const imgElement = document.createElement('img');
//         //     imgElement.src = src;
//         //     imgElement.alt = `Cropped Image ${index + 1}`;
//         //     document.body.appendChild(imgElement);
//         // });
//         setCroppedImages(croppedImages);
//     };

//     const handleNameChange = (e, index) => {
//         const newName = e.target.value;
//         setRectangles(prevRectangles => {
//             const updatedRectangles = [...prevRectangles];
//             updatedRectangles[index].name = newName;
//             return updatedRectangles;
//         });
//     };

//     return (
//         <div className='page-content'>
//             <Webcam
//                 audio={false}
//                 ref={webcamRef}
//                 screenshotFormat="image/jpeg"
//             />
//             <button onClick={capture}>Capture photo</button>
//             {imageSrc && (
//                 <div>
//                     <canvas
//                         ref={canvasRef}
//                         width={640}
//                         height={480}
//                         onMouseDown={handleMouseDown}
//                         onMouseUp={handleMouseUp}
//                         onMouseMove={handleMouseMove}
//                     />
//                     <div>
//                         {rectangles.map((rect, index) => (
//                             <div key={index}>
//                                 Rectangle {index + 1}: Start ({rect.startX}, {rect.startY}), End ({rect.endX}, {rect.endY})
//                                 <input
//                                     type="text"
//                                     placeholder="Name for rectangle"
//                                     value={rect.name}
//                                     onChange={(e) => handleNameChange(e, index)}
//                                 />
//                             </div>
//                         ))}
//                     </div>
//                     <button onClick={displayCroppedImages}>Crop Images</button>

//                     <Row>
//                         {croppedImages.map((crop_image, crop_img_id) => (
//                             <Col sm={6} md={3} lg={3} key={crop_img_id}>
//                                 <Card style={{ height: 'auto', width: '100%' }}>

//                                     <CardBody className='align-items-center'>
//                                         <AntdImage
//                                             src={crop_image.src}
//                                             alt={crop_image.name}
//                                             style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
//                                         />
//                                     </CardBody>
//                                     <CardFooter>
//                                         {crop_image.name}
//                                     </CardFooter>
//                                 </Card>
//                             </Col>

//                         ))}
//                     </Row>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Method_2;
import React, { useState, useRef, useEffect } from 'react';

const Method_4 = () => {
    return (<div className="page-content">Method_4</div>)
}

export default Method_4;