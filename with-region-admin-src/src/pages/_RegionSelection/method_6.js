import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { loadOpenCv } from './loadOpenCv';
import { urlSocket, img_url } from './apiUrls';

const Method_6 = () => {
    const canvasRef = useRef(null);
    const [cvLoaded, setCvLoaded] = useState(false);
    const [rectangles, setRectangles] = useState([]);
    const [selecting, setSelecting] = useState(false);
    const [selectedRectangleIndex, setSelectedRectangleIndex] = useState(null);
    const [editingRectangleIndex, setEditingRectangleIndex] = useState(null);
    const [rectNameInput, setRectNameInput] = useState('');
    const [nestedRectNameInput, setNestedRectNameInput] = useState('');
    const videoRef = useRef(null);
    const animationRef = useRef(null);
    const nestedRectangleRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null);

    useEffect(() => {
        loadOpenCv()
            .then(() => {
                setCvLoaded(true);
            })
            .catch(error => {
                console.error(error);
            });

        return () => {
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (cvLoaded) {
            const video = document.createElement('video');
            video.width = 640;
            video.height = 480;
            video.autoplay = true;
            videoRef.current = video;

            const constraints = { audio: false, video: true };

            navigator.mediaDevices.getUserMedia(constraints)
                .then(stream => {
                    video.srcObject = stream;
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext('2d');

                    const drawFrame = () => {
                        if (!capturedImage) {
                            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        } else {
                            ctx.putImageData(capturedImage, 0, 0);
                        }

                        rectangles.forEach((rect, index) => {
                            ctx.strokeStyle = index === selectedRectangleIndex ? 'blue' : 'red';
                            ctx.lineWidth = 2;
                            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
                            ctx.fillStyle = 'red';
                            ctx.font = '16px Arial';
                            ctx.fillText(rect.name, rect.x + 5, rect.y + 16);

                            rect.nestedRectangles.forEach(nestedRect => {
                                ctx.strokeStyle = 'green';
                                ctx.strokeRect(nestedRect.x, nestedRect.y, nestedRect.width, nestedRect.height);
                                ctx.fillText(nestedRect.name, nestedRect.x + 5, nestedRect.y + 16);
                            });
                        });

                        if (!selecting) {
                            animationRef.current = requestAnimationFrame(drawFrame);
                        }
                    };
                    drawFrame();
                })
                .catch(error => {
                    console.error('Error accessing webcam:', error);
                });
        }
    }, [cvLoaded, rectangles, selectedRectangleIndex, selecting, capturedImage]);

    const handleMouseDown = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const clickedIndex = rectangles.findIndex(rectangle =>
            x >= rectangle.x && x <= rectangle.x + rectangle.width &&
            y >= rectangle.y && y <= rectangle.y + rectangle.height
        );

        if (clickedIndex !== -1) {
            setSelectedRectangleIndex(clickedIndex);
            setEditingRectangleIndex(clickedIndex);

            const clickedNestedRectIndex = rectangles[clickedIndex].nestedRectangles.findIndex(nestedRect =>
                x >= nestedRect.x && x <= nestedRect.x + nestedRect.width &&
                y >= nestedRect.y && y <= nestedRect.y + nestedRect.height
            );
            if (clickedNestedRectIndex !== -1) {
                console.log('Clicked inside nested rectangle:', clickedNestedRectIndex);
            } else {
                setSelecting(true);
                nestedRectangleRef.current = { parentIndex: clickedIndex, x, y, width: 0, height: 0, name: nestedRectNameInput };
            }
        } else {
            setSelecting(true);
            setRectangles(prevRectangles => [...prevRectangles, { x, y, width: 0, height: 0, name: rectNameInput, id: uuidv4(), nestedRectangles: [] }]);
            setSelectedRectangleIndex(rectangles.length);
        }
    };

    const handleMouseMove = (e) => {
        if (selecting) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (nestedRectangleRef.current) {
                nestedRectangleRef.current.width = x - nestedRectangleRef.current.x;
                nestedRectangleRef.current.height = y - nestedRectangleRef.current.y;
            } else {
                setRectangles(prevRectangles => {
                    const updatedRectangles = [...prevRectangles];
                    const lastRectangle = updatedRectangles[updatedRectangles.length - 1];
                    lastRectangle.width = x - lastRectangle.x;
                    lastRectangle.height = y - lastRectangle.y;
                    return updatedRectangles;
                });
            }
        }
    };

    const handleMouseUp = () => {
        if (selecting) {
            if (nestedRectangleRef.current) {
                const { parentIndex, x, y, width, height, name } = nestedRectangleRef.current;
                setRectangles(prevRectangles => {
                    const updatedRectangles = [...prevRectangles];
                    updatedRectangles[parentIndex].nestedRectangles.push({ x, y, width, height, name });
                    return updatedRectangles;
                });
                nestedRectangleRef.current = null;
                setNestedRectNameInput('');
            }
            setSelecting(false);
        }

        console.log('data160 ', rectangles)
    };

    const handleNameChange = (e) => {
        const { value } = e.target;
        setRectangles(prevRectangles => {
            const updatedRectangles = [...prevRectangles];
            if (editingRectangleIndex !== null) {
                updatedRectangles[editingRectangleIndex].name = value;
            }
            return updatedRectangles;
        });
    };

    const handleNameSubmit = () => {
        setEditingRectangleIndex(null);
    };

    const captureImage = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setCapturedImage(imageData);
    };

    const sendCoordinates = async () => {
        const filterDuplicates = (nestedRectangles) => {
            const uniqueRectangles = [];
            const seenCoordinates = new Set();

            nestedRectangles.forEach(rect => {
                const key = `${rect.coordinates.x}-${rect.coordinates.y}-${rect.coordinates.width}-${rect.coordinates.height}-${rect.name}`;
                if (!seenCoordinates.has(key)) {
                    seenCoordinates.add(key);
                    uniqueRectangles.push(rect);
                }
            });

            return uniqueRectangles;
        };

        if (!rectangles || rectangles.length === 0) {
            console.warn('No rectangles to send');
            return;
        }

        const rectsData = rectangles.map(rect => ({
            id: rect.id,
            name: rect.name,
            coordinates: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
            nestedRectangles: filterDuplicates(rect.nestedRectangles.map(nestedRect => ({
                id: nestedRect.id,
                name: nestedRect.name,
                coordinates: { x: nestedRect.x, y: nestedRect.y, width: nestedRect.width, height: nestedRect.height }
            })))
        }));

        try {
            const canvas = canvasRef.current;
            if (!canvas) {
                throw new Error('Canvas not found');
            }

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            if (!blob) {
                throw new Error('Failed to create image blob');
            }

            const formData = new FormData();
            formData.append('image', blob, 'captured_image.png');
            formData.append('rectangles', JSON.stringify(rectsData));

            console.log('rect data', rectsData);
            const response = await urlSocket.post('/rectangles', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Coordinates and image sent successfully:', response.data);
        } catch (error) {
            console.error('Error sending coordinates and image:', error.message);
            console.error(error.response ? error.response.data : error);
        }
    };

    const deleteSelectedRectangle = () => {
        if (selectedRectangleIndex !== null) {
            setRectangles(prevRectangles => prevRectangles.filter((_, index) => index !== selectedRectangleIndex));
            setSelectedRectangleIndex(null);
        }
    };

    return (
        <div className='page-content'>
            <div className='d-flex'>
                <canvas
                    ref={canvasRef}
                    width={640}
                    height={480}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                />
                <div className='d-flex flex-column'>
                    {editingRectangleIndex !== null && (
                        <div style={{ position: 'absolute', top: rectangles[editingRectangleIndex].y, left: rectangles[editingRectangleIndex].x }}>
                            <input
                                type="text"
                                value={rectangles[editingRectangleIndex].name}
                                onChange={handleNameChange}
                                onBlur={handleNameSubmit}
                                autoFocus
                            />
                        </div>
                    )}
                    <input
                        type="text"
                        value={rectNameInput}
                        onChange={(e) => setRectNameInput(e.target.value)}
                        placeholder="Enter rectangle name"
                    />
                    <input
                        type="text"
                        value={nestedRectNameInput}
                        onChange={(e) => setNestedRectNameInput(e.target.value)}
                        placeholder="Enter nested rectangle name"
                    />
                    <button onClick={captureImage}>Capture Image</button>
                    <button onClick={sendCoordinates}>Send Coordinates and Image</button>
                    <button onClick={deleteSelectedRectangle}>Delete Selected Rectangle</button>
                </div>
            </div>

        </div>
    );
};

export default Method_6;