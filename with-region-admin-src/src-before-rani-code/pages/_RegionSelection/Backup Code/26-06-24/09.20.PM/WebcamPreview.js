import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
// import { loadOpenCv } from './loadOpenCv';
import { urlSocket, img_url } from './apiUrls';
import { Button, Input, InputGroup, Label } from 'reactstrap';
import './styleRegion.css';
import { FaTrashAlt, FaExpand, FaArrowsAlt, FaEdit, FaTrash, FaSave } from 'react-icons/fa';

import { useCallback } from 'react';
import Webcam from 'react-webcam';

const WebcamPreview = () => {
    const canvasRef = useRef(null);

    const webcamRef = useRef(null);
    const [imageSrc, setImageSrc] = useState(null);

    const [clearCanvasFlag, setClearCanvasFlag] = useState(false);
    const [cvLoaded, setCvLoaded] = useState(false);
    const [rectangles, setRectangles] = useState([]);
    const [selecting, setSelecting] = useState(false);
    const [selectedRectangleIndex, setSelectedRectangleIndex] = useState(null);
    const [editingRectangleIndex, setEditingRectangleIndex] = useState(null);
    const [resizingRectangleIndex, setResizingRectangleIndex] = useState(null);
    const [movingRectangleIndex, setMovingRectangleIndex] = useState(null);
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
    
    const [selectingRectangle, setSelectingRectangle] = useState('');
    const draggingRectIndexRef = useRef(null);
    const resizingRectIndexRef = useRef(null);


    useEffect(() => {
        // loadOpenCv()
        //     .then(() => {
        //         setCvLoaded(true);
        //     })
        //     .catch(error => {
        //         console.error(error);
        //     });
        setCvLoaded(true);

        return () => {
            // if (videoRef.current) {
            //     videoRef.current.pause();
            //     videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            // }
            // if (animationRef.current) {
            //     cancelAnimationFrame(animationRef.current);
            // }
        };
    }, []);

    useEffect(() => {
        if (imageSrc) {
            // const video = document.createElement('video');
            // video.width = 640;
            // video.height = 480;
            // video.autoplay = true;
            // videoRef.current = video;

            // const constraints = { audio: false, video: true };

            // navigator.mediaDevices.getUserMedia(constraints)
            //     .then(stream => {
            //         video.srcObject = stream;
            //         const canvas = canvasRef.current;
            //         const ctx = canvas.getContext('2d');

            //         const drawFrame = () => {
            //             if (!capturedImage) {
            //                 ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            //             } else {
            //                 ctx.putImageData(capturedImage, 0, 0);
            //             }


            //             rectangles.forEach((rect, index) => {
            //                 ctx.strokeStyle = index === selectedRectangleIndex ? 'blue' : 'red';
            //                 ctx.lineWidth = 2;
            //                 ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
            //                 ctx.fillStyle = 'red';
            //                 ctx.font = '16px Arial';
            //                 ctx.fillText(rect.name, rect.x + 5, rect.y + 16);

            //                 rect.nestedRectangles.forEach(nestedRect => {
            //                     ctx.strokeStyle = 'green';
            //                     ctx.strokeRect(nestedRect.x, nestedRect.y, nestedRect.width, nestedRect.height);
            //                     ctx.fillText(nestedRect.name, nestedRect.x + 5, nestedRect.y + 16);
            //                 });

            //                 const trashButton = trashButtonsRef.current[index];
            //                 if (trashButton) {
            //                     trashButton.style.left = `${rect.x + rect.width - 20}px`;
            //                     trashButton.style.top = `${rect.y}px`;
            //                 }
            //             });

            //             if (!selecting) {
            //                 animationRef.current = requestAnimationFrame(drawFrame);
            //             }
            //         };
            //         drawFrame();
            //     })
            //     .catch(error => {
            //         console.error('Error accessing webcam:', error);
            //     });
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.src = imageSrc;
            img.onload = () => {
                const drawFrame = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
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
                };
                drawFrame();
            }
        }
    }, [
        // cvLoaded, 
        imageSrc, rectangles, selectedRectangleIndex, editingRectangleIndex, selecting, capturedImage, clearCanvasFlag]);

    const handleMouseDown = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const clickedIndex = rectangles.findIndex(rectangle =>
            x >= rectangle.x && x <= rectangle.x + rectangle.width &&
            y >= rectangle.y && y <= rectangle.y + rectangle.height
        );

        console.log('clickedIndex ', clickedIndex);
        setSelectingRectangle(clickedIndex);
        setSelecting(true);
        rectangleRef.current = { x, y, width: 0, height: 0, name: rectNameInput, id: uuidv4(), nestedRectangles: [] }
    };

    const handleMouseMove = (e) => {
        // // Draggable Failed
        // if (isDragging && draggedRectIndex !== null) {
        //     const canvas = canvasRef.current;
        //     const rect = canvas.getBoundingClientRect();
        //     const x = e.clientX - rect.left;
        //     const y = e.clientY - rect.top;
    
        //     setRectangles(prevRectangles => {
        //         const updatedRectangles = [...prevRectangles];
        //         updatedRectangles[draggedRectIndex] = {
        //             ...updatedRectangles[draggedRectIndex],
        //             x: x - dragOffset.x,
        //             y: y - dragOffset.y
        //         };
        //         return updatedRectangles;
        //     });
        // } else 
        if (selecting) {
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
                    setSelectedRectangleIndex(selectingRectangle);
                    setResizingRectangleIndex(null);
                    setMovingRectangleIndex(null);
                } else {
                    setRectangles(prevRectangles => {
                        const updatedRectangles = [...prevRectangles];
                        let updatedname = (!name) ? `${updatedRectangles.length + 1}` : name
                        updatedRectangles.push({ x, y, width, height, name: updatedname, id, nestedRectangles });
                        return updatedRectangles;
                    });
                    rectangleRef.current = null;
                    setRectNameInput('');
                    setSelectedRectangleIndex(rectangles.length);
                    setResizingRectangleIndex(null);
                    setMovingRectangleIndex(null);
                }
            }
            setSelecting(false);
        }
    };

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

    const handleNameSubmit = (e, index) => {
        const isNameFound = rectangles.some(item => item.name === e.target.value);
        // if(isNameFound) {
        //     e.preventDefault();
        // }
        setEditingRectangleIndex(null);
    };

    const captureImage = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImageSrc(imageSrc);

        // const canvas = canvasRef.current;
        // const ctx = canvas.getContext('2d');
        // const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        // setCapturedImage(imageData);

        // canvas.toBlob((blob) => {
        //     if (blob) {
        //         sendImageToApi(blob);
        //     }
        // }, 'image/png');
    };

    const newCaptureImage = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setCapturedImage(imageData);

        canvas.toBlob((blob) => {
            if (blob) {
                sendImageToApi(blob);
            }
        }, 'image/png');
    }

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

    const resizeSelectedRectangle = (clickedIndex) => {
        setResizingRectangleIndex(clickedIndex);
    }
    const moveSelectedRectangle = (clickedIndex) => {
        setMovingRectangleIndex(clickedIndex);
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

    // resizing
    // Debounce function to limit the frequency of function calls
    const debounce = (func, delay) => {
        let timer;
        return function (...args) {
            const context = this;
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(context, args), delay);
        };
    };

    // // Updated handleResizeStart function
    // const handleResizeStart = useCallback((e, index) => {
    //     e.stopPropagation();
    //     e.preventDefault();

    //     const canvas = canvasRef.current;
    //     const rect = canvas.getBoundingClientRect();
    //     const offsetX = e.clientX - rect.left;
    //     const offsetY = e.clientY - rect.top;

    //     const initialRect = rectangles[index];
    //     const startX = initialRect.x + initialRect.width;
    //     const startY = initialRect.y + initialRect.height;

    //     const onMouseMove = debounce((moveEvent) => {
    //         const moveX = moveEvent.clientX - rect.left;
    //         const moveY = moveEvent.clientY - rect.top;

    //         const newWidth = moveX - initialRect.x;
    //         const newHeight = moveY - initialRect.y;

    //         setRectangles(prevRectangles => {
    //             const updatedRectangles = [...prevRectangles];
    //             updatedRectangles[index] = {
    //                 ...initialRect,
    //                 width: newWidth > 0 ? newWidth : 0,
    //                 height: newHeight > 0 ? newHeight : 0
    //             };
    //             return updatedRectangles;
    //         });
    //     }, 80); // Adjust debounce delay as needed (e.g., 20ms)

    //     const onMouseUp = () => {
    //         document.removeEventListener('mousemove', onMouseMove);
    //         document.removeEventListener('mouseup', onMouseUp);
    //     };

    //     document.addEventListener('mousemove', onMouseMove);
    //     document.addEventListener('mouseup', onMouseUp);

    // }, [rectangles]);

    // Move Rectangle
    

    const handleResizeStart = (e, index) => {
        e.stopPropagation();
        e.preventDefault();

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        const initialRect = rectangles[index];
        const initialX = initialRect.x;
        const initialY = initialRect.y;
        const initialWidth = initialRect.width;
        const initialHeight = initialRect.height;

        resizingRectIndexRef.current = index; // Track the current resizing rectangle index

        const onMouseMove = debounce((moveEvent) => {
            if (resizingRectIndexRef.current !== index) return; // Ensure only the intended rectangle is resized

            const moveX = moveEvent.clientX - rect.left;
            const moveY = moveEvent.clientY - rect.top;

            let newWidth = initialWidth + moveX - offsetX;
            let newHeight = initialHeight + moveY - offsetY;

            // Restrict resizing within canvas boundaries
            newWidth = Math.min(newWidth, canvas.width - initialX); // Limit width to canvas width minus current x
            newHeight = Math.min(newHeight, canvas.height - initialY); // Limit height to canvas height minus current y

            requestAnimationFrame(() => {
                setRectangles(prevRectangles => {
                    const updatedRectangles = [...prevRectangles];
                    updatedRectangles[index] = {
                        ...initialRect,
                        width: newWidth > 40 ? newWidth : 40,
                        height: newHeight > 40 ? newHeight : 40
                    };
                    return updatedRectangles;
                });
            });
        }, 1); // Adjust debounce delay as needed (e.g., 20ms)

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            resizingRectIndexRef.current = null; // Reset the resizing rectangle index
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };
    

    
    const handleMoveStart = useCallback((e, index) => {
        e.stopPropagation();
        e.preventDefault();
    
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
    
        const initialRect = rectangles[index];
        const initialX = initialRect.x;
        const initialY = initialRect.y;
    
        draggingRectIndexRef.current = index; // Track the current dragging rectangle index
    
        const onMouseMove = debounce((moveEvent) => {
            if (draggingRectIndexRef.current !== index) return; // Ensure only the intended rectangle is moved
    
            const moveX = moveEvent.clientX - rect.left;
            const moveY = moveEvent.clientY - rect.top;
    
            let newX = initialX + moveX - offsetX;
            let newY = initialY + moveY - offsetY;
    
            // Ensure the rectangle stays within canvas boundaries
            newX = Math.max(0, Math.min(newX, canvas.width - initialRect.width));
            newY = Math.max(0, Math.min(newY, canvas.height - initialRect.height));
    
            requestAnimationFrame(() => {
                setRectangles(prevRectangles => {
                    const updatedRectangles = [...prevRectangles];
                    updatedRectangles[index] = {
                        ...initialRect,
                        x: newX,
                        y: newY
                    };
                    return updatedRectangles;
                });
            });
        }, 1); // Adjust debounce delay as needed (e.g., 20ms)
    
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            draggingRectIndexRef.current = null; // Reset the dragging rectangle index
        };
    
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    
    }, [rectangles]);
    
    
    

    return (
        <div className='page-content'>
            <Webcam
                videoConstraints={{width: 1440, height: 1080}}
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
            />
            <Button className='mx-3 my-3' onClick={captureImage}>Set Image To Canvas</Button>
            {
                imageSrc &&
                <div className='d-flex'>
                    <div style={{ position: 'relative' }}>
                        <canvas
                            ref={canvasRef}
                            width={640}
                            height={480}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                        >
                        </canvas>
                        {rectangles.map((rect, index) => (
                            <React.Fragment key={index}>
                                <button
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
                                {/* Resize icon */}
                                {
                                    selectedRectangleIndex === index && resizingRectangleIndex === index &&
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: rect.x + rect.width - 20,
                                            top: rect.y + rect.height - 20,
                                            width: '18px',
                                            height: '18px',
                                            background: 'white',
                                            cursor: 'nwse-resize',
                                            border: '2px solid black'
                                        }}
                                        onMouseDown={(e) => handleResizeStart(e, index)}
                                    />
                                }

                                {/* Move icon */}
                                {
                                    selectedRectangleIndex === index && movingRectangleIndex === index &&
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: rect.x,
                                            top: rect.y,
                                            width: '20px',
                                            height: '20px',
                                            background: 'rgba(0, 0, 0, 0.5)',
                                            cursor: 'move'
                                        }}
                                        onMouseDown={(e) => handleMoveStart(e, index)}
                                    />
                                }

                            </React.Fragment>
                        ))}
                    </div>
                    <div className='d-flex flex-column ms-3'>
                        {/* <Input className='mx-3 my-3'
                        type="text"
                        value={rectNameInput}
                        onChange={(e) => setRectNameInput(e.target.value)}
                        placeholder="Enter rectangle name"
                    /> */}
                        {/* <input
                        type="text"
                        value={nestedRectNameInput}
                        onChange={(e) => setNestedRectNameInput(e.target.value)}
                        placeholder="Enter nested rectangle name"
                    /> */}
                        <Button className='mx-3 my-3' onClick={newCaptureImage}>Capture Image</Button>
                        <Button className='mx-3 my-3' onClick={sendCoordinates}>Send Coordinates and Image</Button>
                        <Button className='mx-3 my-3' onClick={testImage}>Test Image</Button>
                        {/* <Button className='mx-3 my-3' onClick={testImage}>Test Image</Button> */}
                    </div>
                </div>
            }
            
            {
                rectangles &&
                <div>
                    {rectangles.map((rectangle, id_rect) => (
                        <div key={id_rect} className='d-flex my-2'>
                            <div
                                onMouseDown={() => handleRectangle(id_rect)}
                                className="d-flex item-button w-25"
                                color='info'
                            >
                                <span className='me-auto'>{rectangle.name}</span>
                                <i className='mx-2' style={{ fontSize: '1rem', color: 'black' }}
                                    onMouseDown={() => moveSelectedRectangle(id_rect)}
                                ><FaArrowsAlt /></i>
                                <i className='mx-2' style={{ fontSize: '1rem', color: 'black' }}
                                    onMouseDown={() => resizeSelectedRectangle(id_rect)}
                                ><FaExpand /></i>
                                <i className="mx-2" style={{ fontSize: '1rem', color: 'black' }}
                                    onMouseDown={() => editSelectedRectangle(id_rect)}
                                ><FaEdit /></i>
                                <i className="ms-2" style={{ fontSize: '1rem', color: 'red' }}
                                    onMouseDown={() => deleteSelectedRectangle(id_rect)}
                                ><FaTrash /></i>
                            </div>
                            {editingRectangleIndex !== null &&
                                editingRectangleIndex === id_rect &&
                                (
                                    <div className='ms-3'>
                                        <InputGroup>
                                            <Label className='my-auto'>{`Region Name: `}</Label>
                                            <Input
                                                className='ms-3'
                                                type="text"
                                                value={rectangles[editingRectangleIndex].name}
                                                onChange={handleNameChange}
                                                onBlur={(e) => handleNameSubmit(e, id_rect)}
                                                maxLength="8"
                                                pattern="^[a-zA-Z0-9]{1,8}$"
                                                title="Only letters and numbers are allowed, up to 8 characters."
                                            />
                                            {/* <FaSave className='my-auto' style={{ fontSize: '1rem', color: 'black' }} /> */}
                                        </InputGroup>
                                    </div>
                                )}
                        </div>
                    ))}
                </div>
            }
           
            
        </div>
    );
};

export default WebcamPreview;