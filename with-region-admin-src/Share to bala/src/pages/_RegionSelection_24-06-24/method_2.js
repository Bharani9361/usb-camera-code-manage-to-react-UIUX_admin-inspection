// draw different rectangles in the image. 
// crop those images, and display it in the user interface. 
// selected rectangle co-ordinates also shown in the user interface.

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

    const [activeRectangleIndex, setActiveRectangleIndex] = useState(null);
    const [resizeHandle, setResizeHandle] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });


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

                // Render resize handles
                renderResizeHandles(rect, index);
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

    const handleMouseDownOnRectangle = (index, mouseX, mouseY) => {
        setActiveRectangleIndex(index);
        const rect = rectangles[index];
        setDragOffset({
            x: mouseX - rect.startX,
            y: mouseY - rect.startY
        });
    };

    // const handleMouseUpOnRectangle = () => {
    //     setActiveRectangleIndex(null);
    //     setResizeHandle(null);
    // };

    const handleMouseUpOnRectangle = () => {
        setDragOffset({ x: 0, y: 0 });
        setActiveRectangleIndex(null);
    };

    const renderRectangles = () => {
        return rectangles.map((rect, index) => (
            <div
                key={index}
                onMouseDown={(e) => handleMouseDownOnRectangle(index, e.nativeEvent.offsetX, e.nativeEvent.offsetY)}
                onMouseUp={handleMouseUpOnRectangle}
                onMouseMove={handleMouseMoveOnRectangle}
                style={{
                    position: 'absolute',
                    left: rect.startX,
                    top: rect.startY,
                    width: rect.width,
                    height: rect.height,
                    border: '2px solid #39ff14',
                    cursor: 'move',
                }}
            >
                <span style={{ position: 'absolute', top: '-20px', left: '5px', background: '#000', color: '#fff', padding: '2px 5px', fontSize: '12px' }}>{rect.name}</span>
                {renderResizeHandles(rect, index)}
                {renderSizeAdjustmentUI()} {/* Ensure this is rendered within the rectangle */}
                {/* Additional content for rendering */}
            </div>
        ));
    };

    const handleMouseMoveOnRectangle = (e) => {
        if (activeRectangleIndex !== null && dragOffset !== null) {
            const mouseX = e.nativeEvent.offsetX;
            const mouseY = e.nativeEvent.offsetY;

            const updatedRectangles = rectangles.map((rect, index) => {
                if (index === activeRectangleIndex) {
                    return {
                        ...rect,
                        startX: mouseX - dragOffset.x,
                        startY: mouseY - dragOffset.y,
                        endX: mouseX - dragOffset.x + rect.width,
                        endY: mouseY - dragOffset.y + rect.height
                    };
                } else {
                    return rect;
                }
            });

            setRectangles(updatedRectangles);
        }
    };

    const handleMouseDownOnResizeHandle = (handle) => {
        setResizeHandle(handle);
    };

    const handleMouseUpOnResizeHandle = () => {
        setResizeHandle(null);
    };

    // const renderResizeHandles = (rect, index) => {
    //     const handles = [
    //         { name: 'top-left', cursor: 'nwse-resize', left: rect.startX, top: rect.startY },
    //         { name: 'top-right', cursor: 'nesw-resize', left: rect.endX, top: rect.startY },
    //         { name: 'bottom-left', cursor: 'nesw-resize', left: rect.startX, top: rect.endY },
    //         { name: 'bottom-right', cursor: 'nwse-resize', left: rect.endX, top: rect.endY },
    //     ];

    //     return (
    //         <div key={`handles-${index}`} style={{ position: 'absolute', pointerEvents: 'none' }}>
    //             {handles.map((handle, i) => (
    //                 <div
    //                     key={i}
    //                     style={{
    //                         // position: 'absolute',
    //                         width: '10px',
    //                         height: '10px',
    //                         background: '#ffffff',
    //                         border: '1px solid #000000',
    //                         borderRadius: '50%',
    //                         cursor: handle.cursor,
    //                         left: `${handle.left - 5}px`,
    //                         top: `${handle.top - 5}px`,
    //                     }}
    //                     onMouseDown={() => handleMouseDownOnResizeHandle(handle.name)}
    //                     onMouseUp={handleMouseUpOnResizeHandle}
    //                 />
    //             ))}
    //         </div>
    //     );
    // };

    const renderResizeHandles = (rect, index) => {
        const handles = [
            { name: 'top-left', cursor: 'nwse-resize', left: rect.startX, top: rect.startY },
            { name: 'top-right', cursor: 'nesw-resize', left: rect.startX + rect.width, top: rect.startY },
            { name: 'bottom-left', cursor: 'nesw-resize', left: rect.startX, top: rect.startY + rect.height },
            { name: 'bottom-right', cursor: 'nwse-resize', left: rect.startX + rect.width, top: rect.startY + rect.height },
        ];

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        handles.forEach((handle, i) => {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(handle.left - 5, handle.top - 5, 10, 10);
            ctx.strokeStyle = '#000000';
            ctx.strokeRect(handle.left - 5, handle.top - 5, 10, 10);
        });
    };

    const handleWidthChange = (e) => {
        const newWidth = parseInt(e.target.value, 10);
        if (!isNaN(newWidth) && activeRectangleIndex !== null) {
            setRectangles(prevRectangles => {
                const updatedRectangles = [...prevRectangles];
                updatedRectangles[activeRectangleIndex].width = newWidth;
                return updatedRectangles;
            });
        }
    };

    const handleHeightChange = (e) => {
        const newHeight = parseInt(e.target.value, 10);
        if (!isNaN(newHeight) && activeRectangleIndex !== null) {
            setRectangles(prevRectangles => {
                const updatedRectangles = [...prevRectangles];
                updatedRectangles[activeRectangleIndex].height = newHeight;
                return updatedRectangles;
            });
        }
    };

    const renderSizeAdjustmentUI = () => {
        if (activeRectangleIndex !== null) {
            const selectedRect = rectangles[activeRectangleIndex];
            return (
                <div style={{ marginTop: '10px' }}>
                    <label style={{ marginRight: '10px' }}>Width:</label>
                    <input
                        type="number"
                        value={selectedRect.width}
                        onChange={handleWidthChange}
                        style={{ marginRight: '20px' }}
                    />
                    <label style={{ marginRight: '10px' }}>Height:</label>
                    <input
                        type="number"
                        value={selectedRect.height}
                        onChange={handleHeightChange}
                    />
                </div>
            );
        }
        return null;
    };

    return (
        <div className='page-content'>
            <Webcam
                videoConstraints={{width: 1440, height: 1080}}
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
            />
            <button onClick={capture}>Capture photo</button>
            {imageSrc && (
                <div>
                    <canvas
                        ref={canvasRef}
                        width={640}
                        height={480}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                    />
                    <div>
                        {rectangles.map((rect, index) => (
                            <div key={index}>
                                Rectangle {index + 1}: Start ({rect.startX}, {rect.startY}), End ({rect.endX}, {rect.endY})
                                <input
                                    type="text"
                                    placeholder="Name for rectangle"
                                    value={rect.name}
                                    onChange={(e) => handleNameChange(e, index)}
                                />
                            </div>
                        ))}
                    </div>
                    {/* <button onClick={displayCroppedImages}>Crop Images</button> */}
                    <div>
                        {renderRectangles()}
                        {rectangles.map((rect, index) => (
                            <div
                                key={index}
                                onMouseDown={(e) => handleMouseDownOnRectangle(index, e.nativeEvent.offsetX, e.nativeEvent.offsetY)}
                                onMouseUp={handleMouseUpOnRectangle}
                                onMouseMove={handleMouseMoveOnRectangle}
                                style={{
                                    position: 'absolute',
                                    left: rect.startX,
                                    top: rect.startY,
                                    width: rect.width,
                                    height: rect.height,
                                    border: '2px solid #39ff14',
                                    cursor: 'move',
                                }}
                            >
                                <span style={{ position: 'absolute', top: '-20px', left: '5px', background: '#000', color: '#fff', padding: '2px 5px', fontSize: '12px' }}>{rect.name}</span>
                                {renderResizeHandles(rect, index)}
                                {renderSizeAdjustmentUI()} {/* Ensure this is rendered within the rectangle */}
                            </div>
                        ))}
                    </div>

                    <button onClick={displayCroppedImages}>Crop Images</button>

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
