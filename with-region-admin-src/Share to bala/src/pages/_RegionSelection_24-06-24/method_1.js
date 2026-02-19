import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';

const Method_1 = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [rectangles, setRectangles] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState(null);

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
                    width: endPoint.x - startPoint.x,
                    height: endPoint.y - startPoint.y,
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

            rectangles.forEach(rect => {
                ctx.beginPath();
                ctx.rect(rect.startX, rect.startY, rect.width, rect.height);
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
                ctx.stroke();
            }
        };
    };

    useEffect(() => {
        if (imageSrc) {
            drawCanvas(imageSrc, rectangles);
        }
    }, [imageSrc, rectangles]);

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
                </div>
            )}
        </div>
    );
};

export default Method_1;
