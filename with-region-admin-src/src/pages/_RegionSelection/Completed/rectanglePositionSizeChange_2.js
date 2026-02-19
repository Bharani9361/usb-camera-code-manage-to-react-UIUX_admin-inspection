// draw different rectangles in the image. 
// crop those images, and display it in the user interface. 
// selected rectangle co-ordinates also shown in the user interface.
// rectangle resizing completed (without boundary check)
// rectangle moving also completed (without boundary check)

import { Image as AntdImage } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Card, CardBody, CardFooter, CardImg, Col, Row } from 'reactstrap';

const Method_2 = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [rectangles, setRectangles] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState(null);
    const [croppedImages, setCroppedImages] = useState([]);

    const [isResizing, setIsResizing] = useState(false);
    const [resizeIndex, setResizeIndex] = useState(null);

    const [isMoving, setIsMoving] = useState(false);
    const [moveIndex, setMoveIndex] = useState(null);
    const [moveStartPoint, setMoveStartPoint] = useState(null);


    const capture = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImageSrc(imageSrc);
    };

    const handleMouseDown = (e) => {
        setIsDrawing(true);
        setStartPoint({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
    };

    const handleMouseUp = (e) => {
        if (isDrawing) {
            const endPoint = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
            if (startPoint) {
                const newRectangle = {
                    startX: startPoint.x,
                    startY: startPoint.y,
                    endX: endPoint.x,
                    endY: endPoint.y,
                    width: endPoint.x - startPoint.x,
                    height: endPoint.y - startPoint.y,
                    name: '', // Initialize with an empty name
                };
                setRectangles([...rectangles, newRectangle]);
                setIsDrawing(false);
                setStartPoint(null);
            }
        }
    };

    const handleMouseMove = (e) => {
        if (isDrawing && startPoint) {
            const currentPoint = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
            drawCanvas(imageSrc, rectangles, startPoint, currentPoint);
        }
    };

    // // First_one (without resizing)
    // const drawCanvas = (imageSrc, rectangles, startPoint = null, currentPoint = null) => {
    //     const canvas = canvasRef.current;
    //     const ctx = canvas.getContext('2d');
    //     const img = new Image();
    //     img.src = imageSrc;
    //     img.onload = () => {
    //         ctx.clearRect(0, 0, canvas.width, canvas.height);
    //         ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    //         rectangles.forEach((rect, index) => {
    //             ctx.beginPath();
    //             ctx.rect(rect.startX, rect.startY, rect.width, rect.height);
    //             ctx.stroke();
    //         });

    //         if (startPoint && currentPoint) {
    //             ctx.beginPath();
    //             ctx.rect(
    //                 startPoint.x,
    //                 startPoint.y,
    //                 currentPoint.x - startPoint.x,
    //                 currentPoint.y - startPoint.y
    //             );
    //             ctx.stroke();
    //         }
    //     };
    // };

    const drawCanvas = (imageSrc, rectangles, startPoint = null, currentPoint = null) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            rectangles.forEach((rect, index) => {
                ctx.beginPath();
                ctx.rect(rect.startX, rect.startY, rect.width, rect.height);
                ctx.stroke();

                // // Render resize handles
                // renderResizeHandles(rect, index);
            });

            if (startPoint && currentPoint) {
                ctx.beginPath();
                ctx.rect(
                    startPoint.x,
                    startPoint.y,
                    currentPoint.x - startPoint.x,
                    currentPoint.y - startPoint.y
                );
                ctx.stroke();
            }
        };
    };


    useEffect(() => {
        if (imageSrc) {
            drawCanvas(imageSrc, rectangles);
        }
    }, [imageSrc, rectangles]);

    const cropImages = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = imageSrc;

        const croppedImages = rectangles.map((rect, index) => {
            canvas.width = rect.width;
            canvas.height = rect.height;
            ctx.drawImage(img, rect.startX, rect.startY, rect.width, rect.height, 0, 0, rect.width, rect.height);
            // return canvas.toDataURL('image/jpeg');
            return {
                src: canvas.toDataURL('image/jpeg'),
                name: rect.name || `Rectangle ${index + 1}`, // Use rectangle number if name is empty
            };
        });

        return croppedImages;
    };

    const displayCroppedImages = () => {
        const croppedImages = cropImages();
        // croppedImages.forEach((src, index) => {
        //     const imgElement = document.createElement('img');
        //     imgElement.src = src;
        //     imgElement.alt = `Cropped Image ${index + 1}`;
        //     document.body.appendChild(imgElement);
        // });
        setCroppedImages(croppedImages);
    };

    const handleNameChange = (e, index) => {
        const newName = e.target.value;
        setRectangles(prevRectangles => {
            const updatedRectangles = [...prevRectangles];
            updatedRectangles[index].name = newName;
            return updatedRectangles;
        });
    };

    // resizing
    const handleMouseDownResize = (e, index) => {
        setIsResizing(true);
        setResizeIndex(index);
    };

    const handleMouseMoveResize = (e) => {
        console.log('mouseMove resizing', isResizing)
        if (isResizing) {
            const updatedRectangles = [...rectangles];
            const rect = updatedRectangles[resizeIndex];
            rect.width = e.nativeEvent.offsetX - rect.startX;
            rect.height = e.nativeEvent.offsetY - rect.startY;
            setRectangles(updatedRectangles);
            drawCanvas(imageSrc, updatedRectangles);
        }
    };

    const handleMouseUpResize = () => {
        console.log('moveUp resizing')
        setIsResizing(false);
        setResizeIndex(null);
    };

    const renderResizeHandles = (rect, index) => {
        const handleSize = 8;
        return (
            <div
                key={index}
                onMouseDown={(e) => handleMouseDownResize(e, index)}
                style={{
                    position: 'absolute',
                    left: rect.endX - handleSize / 2,
                    top: rect.endY - handleSize / 2,
                    width: handleSize,
                    height: handleSize,
                    backgroundColor: 'blue',
                    cursor: 'nwse-resize',
                }}
            />
        );
    };

    // moving rectangle
    const handleMouseDownMove = (e, index) => {
        setIsMoving(true);
        setMoveIndex(index);
        setMoveStartPoint({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
    };

    const handleMouseMoveRectangle = (e) => {
        if (isMoving && moveStartPoint !== null) {
            const updatedRectangles = [...rectangles];
            const rect = updatedRectangles[moveIndex];
            const dx = e.nativeEvent.offsetX;
            const dy = e.nativeEvent.offsetY;
            rect.startX = dx;
            rect.startY = dy;
            rect.endX = rect.width + dx;
            rect.endY = rect.height + dy;
            setMoveStartPoint({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
            setRectangles(updatedRectangles);
            drawCanvas(imageSrc, updatedRectangles);
        }
    };

    const handleMouseUpMove = () => {
        setIsMoving(false);
        setMoveIndex(null);
        setMoveStartPoint(null);
    };

    const getRectangleCoordinates = () => {
        console.log('Rectangle ', rectangles)
    }

    return (
        <div className='page-content'>
            <Webcam
                videoConstraints={{ width: 1440, height: 1080 }}
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
            />
            <button onClick={capture}>Capture photo</button>
            {imageSrc && (
                <div>
                    <div style={{ position: 'relative' }}>
                        <canvas
                            ref={canvasRef}
                            width={640}
                            height={480}
                            onMouseDown={isResizing ? handleMouseDownResize : isMoving ? handleMouseDownMove : handleMouseDown}
                            onMouseMove={isResizing ? handleMouseMoveResize : isMoving ? handleMouseMoveRectangle : handleMouseMove}
                            onMouseUp={isResizing ? handleMouseUpResize : isMoving ? handleMouseUpMove : handleMouseUp}
                        />
                        {rectangles.map((rect, index) => (
                            <div
                                key={index}
                                onMouseDown={(e) => handleMouseDownMove(e, index)}
                                onMouseUp={() => handleMouseUpMove()}
                                style={{
                                    position: 'absolute',
                                    left: rect.startX - 8 / 2,
                                    top: rect.startY - 8 / 2,
                                    width: 8,
                                    height: 8,
                                    backgroundColor: 'red',
                                    cursor: 'move',
                                }}
                            />
                        ))}

                        {rectangles.map((rect, index) => (
                            <div
                                key={index}
                                onMouseDown={(e) => handleMouseDownResize(e, index)}
                                // onMouseMove={(e) => handleMouseMove(e)}
                                onMouseUp={() => handleMouseUpResize()}
                                style={{
                                    position: 'absolute',
                                    left: rect.startX + rect.width - 8 / 2,
                                    top: rect.startY + rect.height - 8 / 2,
                                    width: 8,
                                    height: 8,
                                    backgroundColor: 'blue',
                                    cursor: 'nwse-resize',
                                }}
                            />
                        ))}
                    </div>

                    <div>
                        {rectangles.map((rect, index) => (
                            <div key={index}>
                                Rectangle {index + 1}: ({rect.startX}, {rect.startY}), ({rect.endX}, {rect.endY})
                                <input
                                    type="text"
                                    placeholder="Name for rectangle"
                                    value={rect.name}
                                    onChange={(e) => handleNameChange(e, index)}
                                />
                            </div>
                        ))}
                    </div>

                    <button onClick={displayCroppedImages}>Crop Images</button>
                    <button onClick={getRectangleCoordinates}>Get Rectangle Coordinates</button>

                    <Row>
                        {croppedImages.map((crop_image, crop_img_id) => (
                            <Col sm={6} md={3} lg={3} key={crop_img_id}>
                                <Card style={{ height: 'auto', width: '100%' }}>

                                    <CardBody className='align-items-center'>
                                        <AntdImage
                                            src={crop_image.src}
                                            alt={crop_image.name}
                                            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                        />
                                    </CardBody>
                                    <CardFooter>
                                        {crop_image.name}
                                    </CardFooter>
                                </Card>
                            </Col>

                        ))}
                    </Row>
                </div>
            )}
        </div>
    );
};

export default Method_2;
