import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';

const Method_3 = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [rectangles, setRectangles] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [selectedRectIndex, setSelectedRectIndex] = useState(null);
    const [startPoint, setStartPoint] = useState(null);

    const capture = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImageSrc(imageSrc);
    };

    const handleMouseDown = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;

        if (selectedRectIndex !== null && rectangles[selectedRectIndex]) {
            const rect = rectangles[selectedRectIndex];
            if (
                offsetX >= rect.startX &&
                offsetX <= rect.startX + rect.width &&
                offsetY >= rect.startY &&
                offsetY <= rect.startY + rect.height
            ) {
                setIsResizing(true);
                setStartPoint({ x: offsetX, y: offsetY });
                return;
            }
        }

        setIsDrawing(true);
        setStartPoint({ x: offsetX, y: offsetY });
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
        setIsResizing(false);
    };

    const handleMouseMove = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;
        if (isDrawing && startPoint) {
            const currentPoint = { x: offsetX, y: offsetY };
            drawCanvas(imageSrc, rectangles, startPoint, currentPoint);
        } else if (isResizing && startPoint && selectedRectIndex !== null) {
            const currentPoint = { x: offsetX, y: offsetY };
            resizeRectangle(currentPoint);
        }
    };

    const resizeRectangle = (currentPoint) => {
        const updatedRectangles = [...rectangles];
        const rect = updatedRectangles[selectedRectIndex];

        rect.width = currentPoint.x - rect.startX;
        rect.height = currentPoint.y - rect.startY;

        setRectangles(updatedRectangles);
        drawCanvas(imageSrc, updatedRectangles);
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
                ctx.strokeStyle = index === selectedRectIndex ? 'red' : 'black';
                ctx.stroke();
            });

            if (startPoint && currentPoint) {
                ctx.beginPath();
                ctx.rect(
                    startPoint.x,
                    startPoint.y,
                    currentPoint.x - startPoint.x,
                    currentPoint.y - startPoint.y
                );
                ctx.strokeStyle = 'black';
                ctx.stroke();
            }
        };
    };

    useEffect(() => {
        if (imageSrc) {
            drawCanvas(imageSrc, rectangles);
        }
    }, [imageSrc, rectangles, selectedRectIndex]);

    const handleRectangleClick = (index) => {
        setSelectedRectIndex(index);
    };

    const cropImages = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = imageSrc;

        const croppedImages = rectangles.map(rect => {
            canvas.width = rect.width;
            canvas.height = rect.height;
            ctx.drawImage(img, rect.startX, rect.startY, rect.width, rect.height, 0, 0, rect.width, rect.height);
            return canvas.toDataURL('image/jpeg');
        });

        return croppedImages;
    };

    const displayCroppedImages = () => {
        const croppedImages = cropImages();
        croppedImages.forEach((src, index) => {
            const imgElement = document.createElement('img');
            imgElement.src = src;
            imgElement.alt = `Cropped Image ${index + 1}`;
            document.body.appendChild(imgElement);
        });
    };

    return (
        <div className='page-content'>
            <Webcam
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
                            <div key={index} onClick={() => handleRectangleClick(index)}>
                                Rectangle {index + 1}: Start ({rect.startX}, {rect.startY}), End ({rect.startX + rect.width}, {rect.startY + rect.height})
                            </div>
                        ))}
                    </div>
                    <button onClick={displayCroppedImages}>Crop Images</button>
                </div>
            )}
        </div>
    );
};

export default Method_3;
