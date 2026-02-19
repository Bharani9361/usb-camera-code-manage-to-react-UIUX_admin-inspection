//Bharani 10-11-25
import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';
import {
    Button,
    CardTitle,
    Container,
    ListGroup,
    ListGroupItem,
    Table,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Badge,
    Form,
    FormGroup,
    Label,
    Input
} from 'reactstrap';
import Webcam from 'react-webcam';
import urlSocket from 'pages/AdminInspection/urlSocket';
import Swal from 'sweetalert2';

// Integrated Camera Set Position Component (Drag-and-Drop removed)
const Cameramanualsetup = () => {
    // State management
    const [connectedCameras, setConnectedCameras] = useState([]);
    const [defaultCamOrder, setDefaultCamOrder] = useState([]);
    const [availableCameras, setAvailableCameras] = useState([]);
    const [showAvailableModal, setShowAvailableModal] = useState(false);
    const [cameraDisconnected, setCameraDisconnected] = useState(false);
    const [editingCamera, setEditingCamera] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    // const [backendcamDetails, setbackendcamDetails] = useState([]);
    const [editForm, setEditForm] = useState({
        positionName: '',
        name: '',
        position: '',
        portNumber: ''
    });

    // useEffect(async () => {
    //     await getCameraConfiguration()
    // }, [])



    // const getCameraConfiguration = async (availableCameras) => {
    //     try {
    //         const response = await urlSocket.post("http://localhost:7000/get-devices", { mode: 'no-cors' });
    //         console.log('response', response)
    //         setbackendcamDetails(response.data)
    //         return response.data

    //     } catch (error) {
    //         console.log('Error Info: ', error);

    //     }
    // };

    const extractPortInfo = (label) => {
        let v_id = '', p_id = '', portNumber = '';
        if (label && label.includes('(') && label.includes(')')) {
            const portInfo = label.slice(label.indexOf('(') + 1, label.indexOf(')'));
            const parts = portInfo.split(':');
            v_id = parts[0] || '';
            p_id = parts[1] || '';
            const portMatch = portInfo.match(/port[:\s]*(\d+)|(\d{4,})/i);
            portNumber = portMatch ? portMatch[1] || portMatch[2] : '';
        }
        return { v_id, p_id, portNumber };
    };

    const handleSaveEditedCamera = () => {

        if (!editForm?.positionName.trim()) {
            Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Camera position name is required' });
            return;
        }
        if (!editForm.name.trim()) {
            Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Camera name is required' });
            return;
        }
        if (!editForm.portNumber.trim()) {
            Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Port number is required' });
            return;
        }

        const positionNameExists = connectedCameras.some(cam =>
            cam.positionName === editForm.positionName.trim() && cam.id !== editingCamera?.id
        );
        if (positionNameExists) {
            Swal.fire({
                icon: 'warning',
                title: 'Position Name Conflict',
                text: 'This position name is already taken. Please choose a different name.',
                showCancelButton: true,
                confirmButtonText: 'Choose Different Name',
                cancelButtonText: 'Cancel'
            });
            return;
        }

        saveCamera();
    };

    // const extractBackendPort = (arr) => {
    //     if (!arr || arr.length === 0) return null;

    //     const deviceId = arr[0].DeviceID || arr[0].PNPDeviceID;
    //     if (!deviceId) return null;

    //     const parts = deviceId.split("\\");
    //     return parts[parts.length - 1];  // "7&CC11A0C&0&0000"
    // }

    const saveCamera = () => {
        // console.log('backend_Detsils for saving:', backendcamDetails)

        // const backendPort = extractBackendPort(backendcamDetails);
        console.log('backend_Detsils for saving:', backendPort)

        setConnectedCameras(prevConnected => {
            const maxId = prevConnected.length > 0 ? Math.max(...prevConnected.map(cam => cam.id)) : 0;
            const autoPosition = prevConnected.length;

            const portInfo = extractPortInfo(editingCamera.label);

            const newCamera = {
                ...editingCamera,
                pos_no: autoPosition,
                id: maxId + 1,
                title: editForm.name,
                positionName: editForm.positionName.trim(),
                customName: editForm.name,
                originalCamIndex: editingCamera.camIndex,
                v_id: portInfo.v_id,
                p_id: portInfo.p_id,
                portNumber: editForm.portNumber,
                backendPort: backendPort,   //  ✅ INSERTED HERE
                customPort: editForm.portNumber !== (portInfo.portNumber || generatePortNumber(editingCamera.camIndex, editingCamera.deviceId))
            };

            const updated = [...prevConnected, newCamera];
            const finalUpdated = updated.map((camera, index) => ({
                ...camera,
                pos_no: index
            }));

            return finalUpdated;
        });

        setShowEditModal(false);
        setEditingCamera(null);
        setEditForm({ positionName: '', name: '', position: '', portNumber: '' });

        Swal.fire({
            icon: 'success',
            title: 'Camera Added',
            text: `${editForm.positionName} has been added to connected cameras`,
            timer: 2000,
            showConfirmButton: false
        });
    };

    const generatePortNumber = (camIndex, deviceId) => {
        const basePort = 8000;
        const indexPort = camIndex !== undefined ? camIndex : 0;
        const deviceHash = deviceId ? deviceId.slice(-4) : '0000';
        const hashNumber = parseInt(deviceHash, 16) % 1000;
        return (basePort + indexPort * 10 + (hashNumber % 10)).toString();
    };

    const handleAddCameraWithEdit = (camera) => {
        setEditingCamera(camera);
        setEditForm({
            positionName: `Position${connectedCameras.length + 1}`,
            name: camera.label || `Camera ${camera.camIndex + 1}`,
            position: (connectedCameras.length + 1).toString(),
            portNumber: camera.portNumber || generatePortNumber(camera.camIndex, camera.deviceId)
        });
        setShowEditModal(true);
        setShowAvailableModal(false);
    };

    const handleRemoveCamera = useCallback((fullCameraData) => {
        Swal.fire({
            title: 'Remove Camera?',
            html: `
                <p>Are you sure you want to remove this camera?</p>
                <div style="text-align: left; margin-top: 15px;">
                    <strong>Camera Details:</strong><br>
                    ID: ${fullCameraData.id}<br>
                    Index: ${fullCameraData.index}<br>
                    Position Name: ${fullCameraData.positionName || 'N/A'}<br>
                    Label: ${fullCameraData.label || fullCameraData.title}<br>
                    Port: ${fullCameraData.portNumber}<br>
                    Device ID: ${fullCameraData.deviceId || 'N/A'}
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, remove it!',
            cancelButtonText: 'Cancel'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await urlSocket.post('/api/camera/delete_camera', {
                        deviceid: fullCameraData.deviceId
                    });

                    if (!response.data.success) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Delete Failed',
                            text: response.data.message || 'Could not delete the camera from the server.'
                        });
                        return;
                    }

                    setConnectedCameras(prev => prev
                        .filter(c => c.id !== fullCameraData.id)
                        .map((c, i) => ({ ...c, pos_no: i }))
                    );

                    Swal.fire({
                        icon: 'success',
                        title: 'Camera Removed',
                        text: `Camera ${fullCameraData.positionName || fullCameraData.label || fullCameraData.title} has been removed`,
                        timer: 1500,
                        showConfirmButton: false
                    });
                } catch (error) {
                    console.error('Delete error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Server Error',
                        text: 'Failed to connect to server while deleting camera.'
                    });
                }
            }
        });
    }, []);

    const getAvailableCameras = useCallback(() => {
        if (!connectedCameras || !availableCameras.length) return [];
        return availableCameras.filter(availCam => {
            const isAlreadyConnected = connectedCameras.some(connCam =>
                connCam.deviceId === availCam.deviceId && !connCam.isError
            );
            return !isAlreadyConnected;
        });
    }, [connectedCameras, availableCameras]);

    const addCameraToConnected = useCallback((cameraToAdd) => {
        setConnectedCameras(prev => {
            const maxPosNo = prev.length > 0 ? Math.max(...prev.map(c => c.pos_no)) : -1;
            const maxId = prev.length > 0 ? Math.max(...prev.map(c => c.id)) : 0;

            const portInfo = extractPortInfo(cameraToAdd.label);
            const generatedPort = generatePortNumber(cameraToAdd.camIndex, cameraToAdd.deviceId);

            const newCamera = {
                ...cameraToAdd,
                pos_no: maxPosNo + 1,
                id: maxId + 1,
                title: cameraToAdd.label,
                positionName: `Position ${maxPosNo + 2}`,
                originalCamIndex: cameraToAdd.camIndex,
                v_id: portInfo.v_id,
                p_id: portInfo.p_id,
                portNumber: portInfo.portNumber || generatedPort,
                customPort: false
            };
            return [...prev, newCamera];
        });

        setShowAvailableModal(false);
        Swal.fire({
            icon: 'success',
            title: 'Camera Added',
            text: `${cameraToAdd.label} has been added`,
            timer: 2000,
            showConfirmButton: false
        });
    }, []);

    const extractBackendPort = (deviceId) => {
        console.log('deviceId', deviceId)
        if (!deviceId) return null;
        const parts = deviceId.split("\\");
        return parts[parts.length - 1];
    }

    const extractVIDPID = (deviceId) => {
        const match = deviceId.match(/VID_([0-9A-F]+)&PID_([0-9A-F]+)/i);
        return match ? { vid: match[1], pid: match[2] } : null;
    }

    // const checkWebcam = useCallback(async () => {
    //     try {
    //         const devices = await navigator.mediaDevices.enumerateDevices();
    //         const videoInputDevices = devices.filter(d => d.kind === 'videoinput');

    //         console.log('videoInputDevices', videoInputDevices);

    //         const backendcamera = await getCameraConfiguration(); // array from backend
    //         console.log('backendcamDetails', backendcamera);

    //         // Preprocess backend cameras -> extract VID, PID, backendPort
    //         const processedBackend = backendcamera.map(c => {
    //             const vp = extractVIDPID(c.DeviceID);
    //             return {
    //                 ...c,
    //                 vid: vp?.vid,
    //                 pid: vp?.pid,
    //                 backendPort: extractBackendPort(c.DeviceID)
    //             };
    //         });

    //         if (!videoInputDevices.length) {
    //             setCameraDisconnected(true);
    //             return;
    //         }
    //         // const backendItem = processedBackend[index];

    //         const newAvailableCameras = videoInputDevices.map((camera, index) => {
    //             const portInfo = extractPortInfo(camera.label);
    //             const generatedPort = generatePortNumber(index, camera.deviceId);

    //             // 🔥 Use index matching instead of VID/PID
    //             const backendItem = processedBackend[index];

    //             return {
    //                 deviceId: camera.deviceId,
    //                 label: camera.label,
    //                 camIndex: index,
    //                 pos_no: index,
    //                 id: index + 1,
    //                 title: camera.label,
    //                 positionName: `Position ${index + 1}`,
    //                 originalDeviceId: camera.deviceId,
    //                 groupId: camera.groupId,

    //                 v_id: portInfo.v_id,
    //                 p_id: portInfo.p_id,
    //                 portNumber: portInfo.portNumber || generatedPort,
    //                 customPort: false,

    //                 // 🔥 backendPort from same index
    //                 backendPort: backendItem?.backendPort || null
    //             };
    //         });

    //         console.log("newAvailableCameras", newAvailableCameras);

    //         setAvailableCameras(newAvailableCameras);
    //         await getCameraPosition(newAvailableCameras);

    //     } catch (error) {
    //         console.log('Error Info: ', error);
    //         Swal.fire({
    //             title: "Camera Error",
    //             text: "Please allow camera access or check camera port",
    //             icon: "error",
    //             confirmButtonText: "OK"
    //         });
    //     }
    // }, []);


    const checkWebcam = useCallback(async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputDevices = devices.filter(d => d.kind === 'videoinput');
            console.log('videoInputDevices', videoInputDevices)
            console.log('backendcamDetails', backendcamDetails)
            // const backendcamera = await getCameraConfiguration()

            if (!videoInputDevices.length) {
                setCameraDisconnected(true);
            } else {
                const newAvailableCameras = videoInputDevices.map((camera, index) => {
                    const portInfo = extractPortInfo(camera.label);
                    const generatedPort = generatePortNumber(index, camera.deviceId);
                    return {
                        deviceId: camera.deviceId,
                        label: camera.label,
                        camIndex: index,
                        pos_no: index,
                        id: index + 1,
                        title: camera.label,
                        positionName: `Position ${index + 1}`,
                        originalDeviceId: camera.deviceId,
                        groupId: camera.groupId,
                        v_id: portInfo.v_id,
                        p_id: portInfo.p_id,
                        portNumber: portInfo.portNumber || generatedPort,
                        customPort: false
                    };
                });
                console.log('newAvailableCameras', newAvailableCameras)
                setAvailableCameras(newAvailableCameras);
                await getCameraPosition(newAvailableCameras);
            }
        } catch (error) {
            console.log('Error Info: ', error);
            Swal.fire({
                title: "Camera Error",
                text: "Please allow camera access or check camera port",
                icon: "error",
                confirmButtonText: "OK"
            });
        }
    }, []);

    const getCameraPosition = async (availableCameras) => {
        try {
            const response = await urlSocket.post("/api/camera/getManualcampostion", { mode: 'no-cors' });
            if (response.data.camera_pos) {
                const camPositions = response.data.camera_pos.camera_position;
                let finalCameraList = [];

                camPositions.forEach(serverCam => {
                    const matchingCamera = availableCameras.find(availCam =>
                        availCam.label === serverCam.label &&
                        availCam.p_id === serverCam.p_id &&
                        availCam.v_id === serverCam.v_id
                    );

                    if (matchingCamera) {
                        finalCameraList.push({
                            ...matchingCamera,
                            pos_no: serverCam.pos_no,
                            positionName: serverCam.positionName || `Position ${serverCam.pos_no + 1}`,
                            originalCamIndex: serverCam.camIndex,
                            portNumber: serverCam.portNumber || matchingCamera.portNumber,
                            v_id: serverCam.v_id || matchingCamera.v_id,
                            p_id: serverCam.p_id || matchingCamera.p_id,
                            customPort: serverCam.customPort || false
                        });
                    } else {
                        const portInfo = extractPortInfo(serverCam.label || '');
                        finalCameraList.push({
                            deviceId: null,
                            label: `Camera ${serverCam.camIndex + 1} - This camera is not available in device`,
                            camIndex: serverCam.camIndex,
                            pos_no: serverCam.pos_no,
                            id: serverCam.camIndex + 1,
                            title: `Camera ${serverCam.camIndex + 1} - Not Available`,
                            positionName: serverCam.positionName || `Position ${serverCam.pos_no + 1}`,
                            isError: true,
                            errorMessage: "This camera is not available in device",
                            originalCamIndex: serverCam.camIndex,
                            portNumber: serverCam.portNumber || portInfo.portNumber || generatePortNumber(serverCam.camIndex, ''),
                            v_id: serverCam.v_id || portInfo.v_id || '',
                            p_id: serverCam.p_id || portInfo.p_id || '',
                            customPort: serverCam.customPort || false
                        });
                    }
                });

                finalCameraList.sort((a, b) => a.pos_no - b.pos_no);
                setConnectedCameras(finalCameraList);
                setDefaultCamOrder(finalCameraList);
            } else if (response.data === 'no_data') {
                setDefaultCamOrder(availableCameras);
            }
        } catch (error) {
            console.log('Error Info: ', error);
            Swal.fire({
                title: "Camera Is not Set",
                text: "Please fix that camera correct port",
                icon: "info",
                button: "OK"
            });
        }
    };

    const assignCamPosition = async () => {
        try {
            const posChangedCameras = connectedCameras.map((camera, index) => ({
                ...camera,
                pos_no: index,
                positionName: camera.positionName || `Position ${index + 1}`,
                portNumber: camera.portNumber || generatePortNumber(camera.camIndex, camera.deviceId),
                v_id: camera.v_id || '',
                p_id: camera.p_id || ''
            }));
            console.log('posChangedCameras', posChangedCameras)

            // const response = await urlSocket.post('/api/camera/assignmanualCamPostion', {
            //     camera_pos: posChangedCameras
            // }, { mode: 'no-cors' });

            // if (response.data === 'Success') {
            //     Swal.fire({
            //         title: 'Camera Position Updated Successfully',
            //         icon: 'success',
            //         showCancelButton: false,
            //         confirmButtonText: 'OK'
            //     });
            // } else {
            //     Swal.fire({ title: 'Error on Submission', icon: 'error' });
            // }
        } catch (error) {
            console.log('Error Data: ', error);
            Swal.fire({
                title: 'Error on Submission',
                text: 'An error occurred while updating camera positions',
                icon: 'error'
            });
        }
    };

    const handleEditFormChange = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    // Simple Row (no DnD)
    const TaskRow = ({ camera, index }) => {
        const [showCam, setShowCam] = useState(false);

        const handleButtonClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowCam(!showCam);
        };

        const handleRemoveCameraClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleRemoveCamera({ ...camera, index, originalIndex: camera.pos_no });
        };

        const videoConstraints = { width: 1440, height: 1080 };

        return (
            <>
                <tr className={camera.isError ? 'table-danger' : ''}>
                    <td>{camera.pos_no + 1}</td>
                    <td>{camera.id}</td>
                    <td>
                        <div>
                            <strong>{camera.positionName || `Position ${camera.pos_no + 1}`}</strong>
                            <br />
                            <small className="text-muted">{camera.title}</small>
                            {camera.isError && (
                                <div>
                                    <Badge color="danger" className="mt-1">
                                        {camera.errorMessage}
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </td>
                    <td>{camera.portNumber}</td>
                    <td>
                        {!camera.isError && camera.deviceId ? (
                            <Webcam
                                style={{ height: '100px', width: '100px' }}
                                videoConstraints={{ ...videoConstraints, deviceId: { exact: camera.deviceId } }}
                                audio={false}
                                onMouseDown={handleButtonClick}
                            />
                        ) : (
                            <div style={{
                                height: '100px',
                                width: '100px',
                                backgroundColor: '#f8f9fa',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #dee2e6'
                            }}>
                                <i className="mdi mdi-camera-off text-muted"></i>
                            </div>
                        )}
                    </td>
                    <td>
                        <div className="d-flex gap-2">
                            <Button
                                color="success"
                                size="sm"
                                onMouseDown={handleButtonClick}
                                disabled={camera.isError || !camera.deviceId}
                                title="View Camera"
                            >
                                <i className="mdi mdi-eye"></i>
                            </Button>
                            <Button
                                color="danger"
                                size="sm"
                                onMouseDown={handleRemoveCameraClick}
                                title="Remove Camera"
                            >
                                <i className="mdi mdi-delete"></i>
                            </Button>
                        </div>
                    </td>
                </tr>

                {showCam && !camera.isError && camera.deviceId && (
                    <Modal isOpen={showCam} toggle={() => setShowCam(false)} centered size='lg'>
                        <ModalHeader toggle={() => setShowCam(false)}>
                            <div>
                                <h5>Position: {camera.positionName || `Position ${camera.pos_no + 1}`}</h5>
                                <small className="text-muted">
                                    Label: {camera.title} | Port: {camera.portNumber} | ID: {camera.id} | Index: {index}
                                </small>
                            </div>
                        </ModalHeader>
                        <ModalBody>
                            <Webcam
                                style={{ width: '100%', height: 'auto' }}
                                audio={false}
                                videoConstraints={{ ...videoConstraints, deviceId: { exact: camera.deviceId } }}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button color="info" onClick={() => setShowCam(false)}>Close</Button>
                        </ModalFooter>
                    </Modal>
                )}
            </>
        );
    };

    useEffect(() => {
        const handleDeviceChange = () => checkWebcam();
        navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
        checkWebcam();
        return () => {
            navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
        };
    }, [checkWebcam]);

    const availableCamerasToAdd = getAvailableCameras();

    return (
        <div className='page-content'>
            <Container fluid>
                <CardTitle className="text-center" style={{ fontSize: 22, paddingTop: '20px' }}>
                    Configure Camera Position
                </CardTitle>

                <div className="text-center mb-3">
                    <Button
                        color="primary"
                        onClick={() => setShowAvailableModal(true)}
                        disabled={availableCamerasToAdd.length === 0}
                    >
                        Add Available Cameras ({availableCamerasToAdd.length})
                    </Button>
                </div>

                {connectedCameras.length > 0 && (
                    <div>
                        <div className='d-flex justify-content-between mb-3'>
                            <CardTitle>Camera List</CardTitle>
                            <Button color='primary' onClick={assignCamPosition}>
                                Submit
                            </Button>
                        </div>

                        <Table bordered style={{ textAlign: 'center' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '5%' }}>Position</th>
                                    <th style={{ width: '5%' }}>Camera</th>
                                    <th style={{ width: '30%' }}>Position Name</th>
                                    <th style={{ width: '15%' }}>Camera ID</th>
                                    <th style={{ width: '25%' }}>Preview</th>
                                    <th style={{ width: '20%' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {connectedCameras.map((camera, idx) => (
                                    <TaskRow key={camera.id} camera={camera} index={idx} />
                                ))}
                            </tbody>
                        </Table>
                    </div>
                )}

                {connectedCameras.length === 0 && (
                    <div className="text-center text-muted mt-4">
                        <p>No cameras connected. Use the &quot;Add Available Cameras&quot; button above to add cameras.</p>
                    </div>
                )}

                {/* Available Cameras Modal */}
                <Modal isOpen={showAvailableModal} toggle={() => setShowAvailableModal(false)} size="lg">
                    <ModalHeader toggle={() => setShowAvailableModal(false)}>
                        Available Cameras to Add
                        <Badge color="info" className="ms-2">
                            {availableCamerasToAdd.length} Available
                        </Badge>
                    </ModalHeader>
                    <ModalBody>
                        {availableCamerasToAdd.length > 0 ? (
                            <ListGroup>
                                {availableCamerasToAdd.map((camera, i) => (
                                    <ListGroupItem
                                        key={camera.deviceId || i}
                                        className="d-flex justify-content-between align-items-center"
                                    >
                                        <div>
                                            <strong>{camera.label}</strong>
                                            <br />
                                            <small className="text-muted">
                                                Device ID: {camera.deviceId}<br />
                                                Port: {camera.portNumber}<br />
                                                Index: {i}
                                            </small>
                                        </div>
                                        <Button
                                            color="primary"
                                            size="sm"
                                            onClick={() => handleAddCameraWithEdit(camera)}
                                        >
                                            Edit & Add
                                        </Button>
                                    </ListGroupItem>
                                ))}
                            </ListGroup>
                        ) : (
                            <div className="text-center text-muted">
                                <p>No available cameras to add</p>
                                <small>All detected cameras are already in the list</small>
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={() => setShowAvailableModal(false)}>
                            Close
                        </Button>
                    </ModalFooter>
                </Modal>

                {/* Edit Camera Modal */}
                <Modal isOpen={showEditModal} toggle={() => setShowEditModal(false)} centered>
                    <ModalHeader toggle={() => setShowEditModal(false)}>
                        Configure Camera Details
                    </ModalHeader>
                    <ModalBody>
                        {editingCamera && (
                            <Form>
                                <FormGroup>
                                    <Label for="cameraPositionName">Camera Position Name *</Label>
                                    <Input
                                        type="text"
                                        id="cameraPositionName"
                                        placeholder="Enter camera position name"
                                        value={editForm.positionName}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\s+/g, '');
                                            handleEditFormChange('positionName', value);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === ' ') e.preventDefault();
                                        }}
                                        invalid={!editForm.positionName.trim()}
                                    />
                                    {!editForm.positionName.trim() && (
                                        <div className="text-danger small mt-1">
                                            Camera position name is required
                                        </div>
                                    )}
                                </FormGroup>

                                <FormGroup>
                                    <Label for="cameraName">Camera Name *</Label>
                                    <Input
                                        type="text"
                                        id="cameraName"
                                        placeholder="Enter camera name"
                                        value={editForm.name}
                                        onChange={(e) => handleEditFormChange('name', e.target.value)}
                                        disabled
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label for="cameraPort">Port Number *</Label>
                                    <Input
                                        type="text"
                                        id="cameraPort"
                                        placeholder="Enter port number"
                                        value={editForm.portNumber}
                                        onChange={(e) => handleEditFormChange('portNumber', e.target.value)}
                                        disabled
                                    />
                                    <small className="text-muted">
                                        Default: {editingCamera.portNumber}
                                    </small>
                                </FormGroup>

                                <FormGroup>
                                    <Label>Camera Preview</Label>
                                    <div className="border rounded p-2" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {editingCamera.deviceId ? (
                                            <Webcam
                                                style={{ maxWidth: '100%', maxHeight: '100%' }}
                                                videoConstraints={{
                                                    width: 640,
                                                    height: 480,
                                                    deviceId: { exact: editingCamera.deviceId }
                                                }}
                                                audio={false}
                                            />
                                        ) : (
                                            <div className="text-muted">
                                                <i className="mdi mdi-camera-off" style={{ fontSize: '2rem' }}></i>
                                                <p>Camera not available</p>
                                            </div>
                                        )}
                                    </div>
                                </FormGroup>
                            </Form>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={() => setShowEditModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            onClick={handleSaveEditedCamera}
                            disabled={!editForm.name.trim() || !editForm.positionName.trim()}
                        >
                            Save Camera
                        </Button>
                    </ModalFooter>
                </Modal>
            </Container>
        </div>
    );
};

Cameramanualsetup.propTypes = {
    camera: PropTypes.shape({
        id: PropTypes.string,
        pos_no: PropTypes.number,
        isError: PropTypes.bool,
        title: PropTypes.string,
        positionName: PropTypes.string,
        errorMessage: PropTypes.string,
        portNumber: PropTypes.string,
        deviceId: PropTypes.string,
    }),
    index: PropTypes.number,
};

export default Cameramanualsetup;
