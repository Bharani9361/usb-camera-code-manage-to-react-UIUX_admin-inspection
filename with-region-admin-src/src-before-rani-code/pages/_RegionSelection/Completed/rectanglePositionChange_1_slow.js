// we can change rectangle position
// but unable draw rectangle inside the rectangle
// if you want it, change handlemousedown() function
// region comparison work in the backend - completed

import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { loadOpenCv } from '../loadOpenCv';
import { urlSocket, img_url } from '../apiUrls';
import { Button } from 'reactstrap';
import '../styleRegion.css';
import { FaTrashAlt } from 'react-icons/fa';

const RectanglePositionChange = () => {
    const canvasRef = useRef(null);
    const [clearCanvasFlag, setClearCanvasFlag] = useState(false);
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
    const rectangleRef = useRef(null);
    const trashButtonsRef = useRef([]);
    const [capturedImage, setCapturedImage] = useState(null);
    const [testingImage, setTestingImage] = useState(null);
    const [imageId, setImageId] = useState(null);

    const [isDragging, setIsDragging] = useState(false);
    const [draggedRectIndex, setDraggedRectIndex] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });


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

    // useEffect(() => {
    //     if (cvLoaded) {
    //         initializeWebcam();
    //     }
    // }, [cvLoaded]);


    // const initializeWebcam = () => {
    //     const video = document.createElement('video');
    //     video.width = 640;
    //     video.height = 480;
    //     video.autoplay = true;
    //     videoRef.current = video;

    //     const constraints = { audio: false, video: true };

    //     navigator.mediaDevices.getUserMedia(constraints)
    //         .then(stream => {
    //             video.srcObject = stream;
    //         })
    //         .catch(error => {
    //             console.error('Error accessing webcam:', error);
    //         });
    // };

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

                            const trashButton = trashButtonsRef.current[index];
                            if (trashButton) {
                                trashButton.style.left = `${rect.x + rect.width - 20}px`;
                                trashButton.style.top = `${rect.y}px`;
                            }
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
    }, [cvLoaded, rectangles, selectedRectangleIndex, editingRectangleIndex, selecting, capturedImage, clearCanvasFlag]);

    const handleMouseDown = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const clickedIndex = rectangles.findIndex(rectangle =>
            x >= rectangle.x && x <= rectangle.x + rectangle.width &&
            y >= rectangle.y && y <= rectangle.y + rectangle.height
        );

        console.log('clickedIndex ', clickedIndex)

        if (clickedIndex !== -1) {
            setSelectedRectangleIndex(clickedIndex);
            setEditingRectangleIndex(clickedIndex);

            // const clickedNestedRectIndex = rectangles[clickedIndex].nestedRectangles.findIndex(nestedRect =>
            //     x >= nestedRect.x && x <= nestedRect.x + nestedRect.width &&
            //     y >= nestedRect.y && y <= nestedRect.y + nestedRect.height
            // );
            // if (clickedNestedRectIndex !== -1) {
            //     console.log('Clicked inside nested rectangle:', clickedNestedRectIndex);
            // } else {
            //     setSelecting(true);
            //     nestedRectangleRef.current = { parentIndex: clickedIndex, x, y, width: 0, height: 0, name: nestedRectNameInput };
            // }

            // Draggable Failed
            setIsDragging(true);
            setDraggedRectIndex(clickedIndex);
            setDragOffset({ x: x - rectangles[clickedIndex].x, y: y - rectangles[clickedIndex].y });
        } else {
            setSelecting(true);
            rectangleRef.current = { x, y, width: 0, height: 0, name: rectNameInput, id: uuidv4(), nestedRectangles: [] }
        }
    };

    const handleMouseMove = (e) => {
        // Draggable Failed
        if (isDragging && draggedRectIndex !== null) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
    
            setRectangles(prevRectangles => {
                const updatedRectangles = [...prevRectangles];
                updatedRectangles[draggedRectIndex] = {
                    ...updatedRectangles[draggedRectIndex],
                    x: x - dragOffset.x,
                    y: y - dragOffset.y
                };
                return updatedRectangles;
            });
        } else if (selecting) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (nestedRectangleRef.current) {
                nestedRectangleRef.current.width = x - nestedRectangleRef.current.x;
                nestedRectangleRef.current.height = y - nestedRectangleRef.current.y;
            } else {
                rectangleRef.current.width = x - rectangleRef.current.x;
                rectangleRef.current.height = y - rectangleRef.current.y;
            }
        }
    };

    const handleMouseUp = () => {
        if (selecting) {
            if (nestedRectangleRef.current) {
                const { parentIndex, x, y, width, height, name } = nestedRectangleRef.current;
                if (width < 30 && height < 30) {
                    console.log('Rectangle is too small');
                    nestedRectangleRef.current = null;
                    setNestedRectNameInput('');
                } else {
                    setRectangles(prevRectangles => {
                        const updatedRectangles = [...prevRectangles];
                        let updatedname = (!name) ? `${parentIndex + 1}_${updatedRectangles[parentIndex].nestedRectangles.length + 1}` : name;
                        updatedRectangles[parentIndex].nestedRectangles.push({ x, y, width, height, name: updatedname });
                        return updatedRectangles;
                    });
                    nestedRectangleRef.current = null;
                    setNestedRectNameInput('');
                }
                
                
            } else {
                const { x, y, width, height, name, id, nestedRectangles } = rectangleRef.current;
                if (width < 30 && height < 30) {
                    console.log('Rectangle is too small');
                    rectangleRef.current = null;
                    setRectNameInput('');
                } else {
                    setRectangles(prevRectangles => {
                        const updatedRectangles = [...prevRectangles];
                        let updatedname = (!name) ? `${updatedRectangles.length + 1}` : name
                        updatedRectangles.push({ x, y, width, height, name: updatedname, id, nestedRectangles });
                        return updatedRectangles;
                    });
                    rectangleRef.current = null;
                    setRectNameInput('');
                    setSelectedRectangleIndex(rectangles.length)
                }
            }
            setSelecting(false);
        }

        if (isDragging) {
            setIsDragging(false);
            setDraggedRectIndex(null);
        }
    };

    // const handleNameChange = (e) => {
    //     const { value } = e.target;
    //     setRectangles(prevRectangles => {
    //         const updatedRectangles = [...prevRectangles];
    //         if (editingRectangleIndex !== null) {
    //             updatedRectangles[editingRectangleIndex].name = value;
    //         }
    //         return updatedRectangles;
    //     });
    // };

    const handleNameChange = (e) => {
        const { value } = e.target;
        const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, ''); // Remove any characters that are not alphanumeric
        setRectangles(prevRectangles => {
            const updatedRectangles = [...prevRectangles];
            if (editingRectangleIndex !== null) {
                updatedRectangles[editingRectangleIndex].name = sanitizedValue.slice(0, 8); // Limit to 8 characters
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

        canvas.toBlob((blob) => {
            if (blob) {
                sendImageToApi(blob);
            }
        }, 'image/png');
    };

    const sendImageToApi = async (imageBlob) => {
        const formData = new FormData();
        formData.append('image', imageBlob, 'captured_image.png');

        try {
            // const response = await urlSocket.post('/upload-image', formData, {
            //     headers: {
            //         'Content-Type': 'multipart/form-data',
            //     },
            // });

            const response = await fetch('https://172.16.1.172:5005/upload-image', {
                method: 'POST',
                body: formData,
              });

            if (response.ok) {
                const responseData = await response.json();
                console.log('Image successfully sent to the API:', responseData);
                setImageId(responseData.image_id); // Save the image_id from the response
            } else {
                console.error('Error sending image to the API:', response.statusText);
            }
        } catch (error) {
            console.error('Error sending image to the API:', error);
        }
    };

    const testImage = () => {

        setRectangles([]);
        // setSelectedRectangleIndex(null);
        setCapturedImage(null);
        // setEditingRectangleIndex(null);
        // setRectNameInput('');
        // setNestedRectNameInput('');

        // initializeWebcam();

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setTestingImage(imageData);

        canvas.toBlob((blob) => {
            if (blob) {
                testImageToApi(blob);
            }
        }, 'image/png');
    };

    const testImageToApi = async (imageBlob) => {
        const formData = new FormData();
        formData.append('image', imageBlob, 'captured_image.png');
        formData.append('image_id', imageId);

        try {
            // const response = await urlSocket.post('/send-image', formData, {
            //     headers: {
            //         'Content-Type': 'multipart/form-data',
            //     },
            // });

            const response = await fetch('https://172.16.1.172:5005/send-image', {
                method: 'POST',
                body: formData,
              });

            if (response.ok) {
                const responseData = await response.json();
                console.log('Image successfully sent to the API:', responseData);
            } else {
                console.error('Error sending image to the API:', response.statusText);
            }
        } catch (error) {
            console.error('Error sending image to the API:', error);
        }
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

        if (!imageId) {
            console.warn('No image ID available');
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
            formData.append('image_id', imageId); // Add image_id to the form data

            console.log('rect data', rectsData);
            // const response = await urlSocket.post('/rectangles', formData, {
            //     headers: {
            //         'Content-Type': 'multipart/form-data',
            //     },
            // });

            const response = await fetch('https://172.16.1.172:5005/rectangles', {
                method: 'POST',
                body: formData,
              });
            console.log('Coordinates and image sent successfully:', response.data);
        } catch (error) {
            console.error('Error sending coordinates and image:', error.message);
            console.error(error.response ? error.response.data : error);
        }
    };

    const deleteSelectedRectangle = (clickedIndex) => {
        console.log('data400 ', clickedIndex)
        if(clickedIndex !== null && clickedIndex !== undefined && clickedIndex >= 0) {
            console.log('inside if ', clickedIndex)
            setRectangles(prevRectangles => prevRectangles.filter((_, index) => index !== clickedIndex));
        } else {
            if (selectedRectangleIndex !== null) {
                setRectangles(prevRectangles => prevRectangles.filter((_, index) => index !== selectedRectangleIndex));
                setSelectedRectangleIndex(null);
            }
        }
    };

    const editSelectedRectangle = (clickedIndex) => {
        console.log('clicked')
        setEditingRectangleIndex(clickedIndex);
    }

    const deleteAllRectangle = () => {
        setRectangles([]);
    }

    const handleRectangle = (clickedIndex) => {
        setSelectedRectangleIndex(clickedIndex);
    }

    const moveHundred = () => {
        let prevRectangle = [...rectangles]
        const { name } = prevRectangle[selectedRectangleIndex];
        setRectangles(prevRectangles => {
            return prevRectangles.map(rect => {
                if (rect.name === name) {
                    return { ...rect, x: rect.x+100, y: rect.y+100 };
                }
                return rect;
            });
        });
    }

    return (
        <div className='page-content'>
            <div className='d-flex'>
                <div style={{position: 'relative'}}>
                    <canvas
                        ref={canvasRef}
                        width={640}
                        height={480}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                    />
                    {rectangles.map((rect, index) => (
                            <button
                                key={index}
                                ref={el => trashButtonsRef.current[index] = el}
                                onClick={() => deleteSelectedRectangle(index)}
                                style={{
                                    position: 'absolute',
                                    left: rect.x + rect.width - 20,
                                    top: rect.y,
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    color: 'red'
                                }}
                            >
                                <FaTrashAlt />
                            </button>
                    ))}
                    {/* // Draggable Failed_2 */}
                    {/* {rectangles.map((rect, index) => (
                            <div
                                key={index}
                                // onMouseDown={(e) => handleMouseDownOnRectangle(index, e.nativeEvent.offsetX, e.nativeEvent.offsetY)}
                                // onMouseUp={handleMouseUpOnRectangle}
                                // onMouseMove={handleMouseMoveOnRectangle}
                                style={{
                                    position: 'absolute',
                                    left: rect.x,
                                    top: rect.y,
                                    width: rect.width,
                                    height: rect.height,
                                    // border: '2px solid #39ff14',
                                    cursor: 'move',
                                }}
                                draggable={true}
                            >   
                            </div>
                        ))} */}
                </div>
                <div className='d-flex flex-column'>
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
                    <button onClick={() => deleteSelectedRectangle()}>Delete Selected Rectangle</button>
                    <button onClick={() => moveHundred()}>Move Rectangle 100px</button>
                    <button onClick={testImage}>Test Image</button>

                    {/* <button onClick={deleteAllRectangle}>Delete All Rectangle</button> */}
                </div>
            </div>
            {
                rectangles &&
                <div 
                    // className="item-list"
                >
                    {rectangles.map((rectangle, id_rect) => (
                        <div key={id_rect} className='d-flex'>
                            <div
                                onMouseDown={() => handleRectangle(id_rect)}
                                className="d-flex item-button w-25"
                                color='info'
                            >
                                <span className='me-auto'>{rectangle.name}</span>
                                <i className="bx bx-edit mx-2" style={{ fontSize: '1rem', color: 'black' }}
                                    onMouseDown={() => editSelectedRectangle(id_rect)}
                                ></i>
                                <i className="bx bxs-trash ms-2" style={{ fontSize: '1rem', color: 'red' }}
                                    onMouseDown={() => deleteSelectedRectangle(id_rect)}
                                ></i>
                            </div>
                            {editingRectangleIndex !== null &&
                                editingRectangleIndex === id_rect &&
                                (
                                    <div
                                        className='ms-3'
                                    // style={{ position: 'absolute', top: rectangles[editingRectangleIndex].y, left: rectangles[editingRectangleIndex].x }}
                                    >
                                        Region Name:
                                        <input
                                            className='ms-3'
                                            type="text"
                                            value={rectangles[editingRectangleIndex].name}
                                            onChange={handleNameChange}
                                            onBlur={handleNameSubmit}
                                            maxLength="8"
                                            pattern="^[a-zA-Z0-9]{1,8}$"
                                            title="Only letters and numbers are allowed, up to 8 characters."
                                        // autoFocus
                                        />
                                    </div>
                                )}
                        </div>
                    ))}
                </div>
            }
           
            
        </div>
    );
};

export default RectanglePositionChange;
