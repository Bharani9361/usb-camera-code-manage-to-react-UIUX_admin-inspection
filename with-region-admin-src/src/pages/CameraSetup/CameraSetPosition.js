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
const CameraSetPosition = () => {
    // State management
    const [connectedCameras, setConnectedCameras] = useState([]);
    const [defaultCamOrder, setDefaultCamOrder] = useState([]);
    const [availableCameras, setAvailableCameras] = useState([]);
    const [showAvailableModal, setShowAvailableModal] = useState(false);
    const [cameraDisconnected, setCameraDisconnected] = useState(false);
    const [editingCamera, setEditingCamera] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [backendcamDetails, setbackendcamDetails] = useState([]);
    const [editForm, setEditForm] = useState({
        positionName: '',
        name: '',
        position: '',
        portNumber: ''
    });

    //  useEffect(async() => {
    //     await getCameraConfiguration()
    // },[])



    //    const getCameraConfiguration = async (availableCameras) => {
    //     try {
    //         const response = await urlSocket.post("http://localhost:7000/get-devices", { mode: 'no-cors' });
    //         console.log('response', response)
    //         setbackendcamDetails(response.data)
           
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

    const saveCamera = () => {
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

    const checkWebcam = useCallback(async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            console.log('devices', devices)
            const videoInputDevices = devices.filter(d => d.kind === 'videoinput');
            console.log('videoInputDevices', videoInputDevices)
            console.log('backendcamDetails', backendcamDetails)

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
            const response = await urlSocket.post("/api/camera/getCamPosition", { mode: 'no-cors' });
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

            const response = await urlSocket.post('/api/camera/assignCamPostion', {
                camera_pos: posChangedCameras
            }, { mode: 'no-cors' });

            if (response.data === 'Success') {
                Swal.fire({
                    title: 'Camera Position Updated Successfully',
                    icon: 'success',
                    showCancelButton: false,
                    confirmButtonText: 'OK'
                });
            } else {
                Swal.fire({ title: 'Error on Submission', icon: 'error' });
            }
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

CameraSetPosition.propTypes = {
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

export default CameraSetPosition;
// import PropTypes from 'prop-types';
// import React, { useState, useEffect, useCallback } from 'react';
// // import { useNavigate } from 'react-router-dom';
// import {
//     Button,
//     CardTitle,
//     Container,
//     ListGroup,
//     ListGroupItem,
//     Table,
//     Modal,
//     ModalHeader,
//     ModalBody,
//     ModalFooter,
//     Badge,
//     Form,
//     FormGroup,
//     Label,
//     Input
// } from 'reactstrap';
// import {
//     DndContext,
//     KeyboardSensor,
//     PointerSensor,
//     useSensor,
//     useSensors,
//     closestCorners,
// } from "@dnd-kit/core";
// import {
//     SortableContext,
//     verticalListSortingStrategy,
//     useSortable
// } from "@dnd-kit/sortable";
// import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import Webcam from 'react-webcam';
// import urlSocket from 'pages/AdminInspection/urlSocket';
// import Swal from 'sweetalert2';

// // Integrated Camera Set Position Component
// const CameraSetPosition = () => {
//     // const navigate = useNavigate();

//     // State management
//     const [connectedCameras, setConnectedCameras] = useState([]);
//     const [defaultCamOrder, setDefaultCamOrder] = useState([]);
//     const [availableCameras, setAvailableCameras] = useState([]);
//     const [showAvailableModal, setShowAvailableModal] = useState(false);
//     const [cameraDisconnected, setCameraDisconnected] = useState(false);
//     const [enableReset, setEnableReset] = useState(false);
//     const [editingCamera, setEditingCamera] = useState(null);
//     const [showEditModal, setShowEditModal] = useState(false);
//     const [editForm, setEditForm] = useState({
//         positionName: '',
//         name: '',
//         position: '',
//         portNumber: ''
//     });

//     // Drag and drop sensors
//     const sensors = useSensors(
//         useSensor(PointerSensor),
//         useSensor(KeyboardSensor, {
//             coordinateGetter: sortableKeyboardCoordinates,
//         })
//     );

 

//     const extractPortInfo = (label) => {
//   let v_id = '', p_id = '', portNumber = '';
//   if (label && label.includes('(') && label.includes(')')) {
//     const portInfo = label.slice(label.indexOf('(') + 1, label.indexOf(')'));
//     const parts = portInfo.split(':');
//     v_id = parts[0] || '';
//     p_id = parts[1] || '';
//     const portMatch = portInfo.match(/port[:\s]*(\d+)|(\d{4,})/i);
//     portNumber = portMatch ? portMatch[1] || portMatch[2] : '';
//   }
//   return { v_id, p_id, portNumber };
// };


//     const handleSaveEditedCamera = () => {
//         // Validate Position Name
//         if (!editForm?.positionName.trim()) {
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Validation Error',
//                 text: 'Camera position name is required'
//             });
//             return;
//         }

//         if (!editForm.name.trim()) {
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Validation Error',
//                 text: 'Camera name is required'
//             });
//             return;
//         }

//         if (!editForm.portNumber.trim()) {
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Validation Error',
//                 text: 'Port number is required'
//             });
//             return;
//         }

//         // Check if position name already exists
//         const positionNameExists = connectedCameras.some(cam => 
//             cam.positionName === editForm.positionName.trim() && cam.id !== editingCamera?.id
//         );

//         if (positionNameExists) {
//             Swal.fire({
//                 icon: 'warning',
//                 title: 'Position Name Conflict',
//                 text: 'This position name is already taken. Please choose a different name.',
//                 showCancelButton: true,
//                 confirmButtonText: 'Choose Different Name',
//                 cancelButtonText: 'Cancel'
//             });
//             return;
//         }

//         saveCamera();
//     };

//     const saveCamera = () => {
//         setConnectedCameras(prevConnected => {
//             const maxId = prevConnected.length > 0 ? Math.max(...prevConnected.map(cam => cam.id)) : 0;
//             // Auto-assign position to the end of the list
//             const autoPosition = prevConnected.length;

//             // Extract or generate port information
//             const portInfo = extractPortInfo(editingCamera.label);

//             const newCamera = {
//                 ...editingCamera,
//                 pos_no: autoPosition, // Auto-assign position
//                 id: maxId + 1,
//                 title: editForm.name,
//                 positionName: editForm.positionName.trim(), // Add position name
//                 customName: editForm.name,
//                 originalCamIndex: editingCamera.camIndex,
//                 v_id: portInfo.v_id,
//                 p_id: portInfo.p_id,
//                 portNumber: editForm.portNumber, // Use the pre-filled port number
//                 customPort: editForm.portNumber !== (portInfo.portNumber || generatePortNumber(editingCamera.camIndex, editingCamera.deviceId))
//             };

//             const updated = [...prevConnected, newCamera];
            
//             // Sort by position and reassign positions to handle conflicts
//             updated.sort((a, b) => a.pos_no - b.pos_no);
//             const finalUpdated = updated.map((camera, index) => ({
//                 ...camera,
//                 pos_no: index
//             }));

//             console.log('After adding edited camera - updated list:', finalUpdated);
//             return finalUpdated;
//         });

//         setShowEditModal(false);
//         setEditingCamera(null);
//         setEditForm({ positionName: '', name: '', position: '', portNumber: '' });
//         setEnableReset(true);

//         Swal.fire({
//             icon: 'success',
//             title: 'Camera Added',
//             text: `${editForm.positionName} has been added to connected cameras`,
//             timer: 2000,
//             showConfirmButton: false
//         });
//     };

//     // Generate a unique port number based on camera index and device ID
//     const generatePortNumber = (camIndex, deviceId) => {
//         // Base port number starting from 8000
//         const basePort = 8000;
//         // Use camera index or generate from deviceId hash
//         const indexPort = camIndex !== undefined ? camIndex : 0;
//         // Create a simple hash from deviceId for uniqueness
//         const deviceHash = deviceId ? deviceId.slice(-4) : '0000';
//         const hashNumber = parseInt(deviceHash, 16) % 1000;

//         return (basePort + indexPort * 10 + (hashNumber % 10)).toString();
//     };

//     // Handle opening edit modal for adding camera
//     const handleAddCameraWithEdit = (camera) => {
//         setEditingCamera(camera);
//         setEditForm({
//             positionName: `Position${connectedCameras.length + 1}`, // Default position name
//             name: camera.label || `Camera ${camera.camIndex + 1}`,
//             position: (connectedCameras.length + 1).toString(),
//             portNumber: camera.portNumber || generatePortNumber(camera.camIndex, camera.deviceId)
//         });
//         setShowEditModal(true);
//         setShowAvailableModal(false);
//     };

//     // Get task position for drag and drop
//     const getTaskPos = (id) => connectedCameras.findIndex((camera) => camera.id === id);

//     // Handle drag end event
//     const handleDragEnd = (event) => {
//         try {
//             const { active, over } = event;

//             if (active.id === over.id) return;

//             setConnectedCameras((cameras) => {
//                 const originalPos = getTaskPos(active.id);
//                 const newPos = getTaskPos(over.id);
//                 const reorderedCameras = arrayMove(cameras, originalPos, newPos);

//                 // Update position numbers after reordering
//                 const updatedCameras = reorderedCameras.map((camera, index) => ({
//                     ...camera,
//                     pos_no: index
//                 }));

//                 console.log('Drag reorder - Full data with indices:', updatedCameras.map((cam, idx) => ({
//                     id: cam.id,
//                     index: idx,
//                     fullData: cam
//                 })));

//                 return updatedCameras;
//             });

//             setEnableReset(true);
//         } catch (error) {
//             console.log('Error Info: ', error);
//         }
//     };

//     const handleRemoveCamera = useCallback((fullCameraData) => {
//         console.log('Remove camera - Full data received:', fullCameraData);
        
//         Swal.fire({
//             title: 'Remove Camera?',
//             html: `
//                 <p>Are you sure you want to remove this camera?</p>
//                 <div style="text-align: left; margin-top: 15px;">
//                     <strong>Camera Details:</strong><br>
//                     ID: ${fullCameraData.id}<br>
//                     Index: ${fullCameraData.index}<br>
//                     Position Name: ${fullCameraData.positionName || 'N/A'}<br>
//                     Label: ${fullCameraData.label || fullCameraData.title}<br>
//                     Port: ${fullCameraData.portNumber}<br>
//                     Device ID: ${fullCameraData.deviceId || 'N/A'}
//                 </div>
//             `,
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonColor: '#d33',
//             cancelButtonColor: '#3085d6',
//             confirmButtonText: 'Yes, remove it!',
//             cancelButtonText: 'Cancel'
//         }).then(async (result) => {
//             if (result.isConfirmed) {
//                 try {
//                     // Call the delete API
//                     const response = await urlSocket.post('/api/camera/delete_camera', {
//                         deviceid: fullCameraData.deviceId
//                     });

//                     if (!response.data.success) {
//                         Swal.fire({
//                             icon: 'error',
//                             title: 'Delete Failed',
//                             text: response.data.message || 'Could not delete the camera from the server.'
//                         });
//                         return;
//                     }
                    
//                     setConnectedCameras(prevCameras => {
//                         const updatedCameras = prevCameras
//                             .filter(camera => camera.id !== fullCameraData.id)
//                             .map((camera, index) => ({
//                                 ...camera,
//                                 pos_no: index
//                             }));
                        
//                         console.log('After removal - Updated cameras:', updatedCameras);
//                         return updatedCameras;
//                     });

//                     setEnableReset(true);

//                     Swal.fire({
//                         icon: 'success',
//                         title: 'Camera Removed',
//                         text: `Camera ${fullCameraData.positionName || fullCameraData.label || fullCameraData.title} has been removed from the list`,
//                         timer: 1500,
//                         showConfirmButton: false
//                     });
//                 } catch (error) {
//                     console.error('Delete error:', error);
//                     Swal.fire({
//                         icon: 'error',
//                         title: 'Server Error',
//                         text: 'Failed to connect to server while deleting camera.'
//                     });
//                 }
//             }
//         });
//     }, []);

//     // Get available cameras that are not in connectedCameras
//     const getAvailableCameras = useCallback(() => {
//         if (!connectedCameras || !availableCameras.length) return [];

//         return availableCameras.filter(availCam => {
//             const isAlreadyConnected = connectedCameras.some(connCam =>
//                 connCam.deviceId === availCam.deviceId && !connCam.isError
//             );
//             return !isAlreadyConnected;
//         });
//     }, [connectedCameras, availableCameras]);

//     // Add camera to connected cameras
//     const addCameraToConnected = useCallback((cameraToAdd) => {
//         console.log('cameraToAdd with full data:', cameraToAdd);
//         setConnectedCameras(prevConnected => {
//             const maxPosNo = prevConnected.length > 0 ? Math.max(...prevConnected.map(cam => cam.pos_no)) : -1;
//             const maxId = prevConnected.length > 0 ? Math.max(...prevConnected.map(cam => cam.id)) : 0;

//             // Extract or generate port information
//             const portInfo = extractPortInfo(cameraToAdd.label);
//             const generatedPort = generatePortNumber(cameraToAdd.camIndex, cameraToAdd.deviceId);

//             const newCamera = {
//                 ...cameraToAdd,
//                 pos_no: maxPosNo + 1,
//                 id: maxId + 1,
//                 title: cameraToAdd.label,
//                 positionName: `Position ${maxPosNo + 2}`, // Default position name
//                 originalCamIndex: cameraToAdd.camIndex,
//                 v_id: portInfo.v_id,
//                 p_id: portInfo.p_id,
//                 portNumber: portInfo.portNumber || generatedPort,
//                 customPort: false
//             };

//             const updated = [...prevConnected, newCamera];
//             console.log('After adding camera - updated list:', updated);
//             return updated;
//         });

//         // Close the modal after adding
//         setShowAvailableModal(false);

//         Swal.fire({
//             icon: 'success',
//             title: 'Camera Added',
//             text: `${cameraToAdd.label} has been added to connected cameras`,
//             timer: 2000,
//             showConfirmButton: false
//         });
//     }, []);

//     const checkWebcam = useCallback(async () => {
//         try {
//             // Now enumerate devices
//             const devices = await navigator.mediaDevices.enumerateDevices();
//             const videoInputDevices = devices.filter(device => device.kind === 'videoinput');

//             if (!videoInputDevices.length) {
//                 setCameraDisconnected(true);
//             } else {
//                 console.log('Available Cameras: ', videoInputDevices);

//                 const newAvailableCameras = videoInputDevices
//                     .map((camera, index) => {
//                         const portInfo = extractPortInfo(camera.label);
//                         const generatedPort = generatePortNumber(index, camera.deviceId);
//                         console.log('generatedPort',portInfo, generatedPort );


//                         return {
//                             deviceId: camera.deviceId,
//                             label: camera.label,
//                             camIndex: index,
//                             pos_no: index,
//                             id: index + 1,
//                             title: camera.label,
//                             positionName: `Position ${index + 1}`, 
//                             originalDeviceId: camera.deviceId,
//                             groupId: camera.groupId,
//                             v_id: portInfo.v_id,
//                             p_id: portInfo.p_id,
//                             portNumber: portInfo.portNumber || generatedPort,
//                             customPort: false
//                         };
//                     });

//                 console.log('Available cameras with full data:', newAvailableCameras);
//                 setAvailableCameras(newAvailableCameras);
//                 await getCameraPosition(newAvailableCameras);
//             }
//         } catch (error) {
//             console.log('Error Info: ', error);
//             Swal.fire({
//                 title: "Camera Error",
//                 text: "Please allow camera access or check camera port",
//                 icon: "error",
//                 confirmButtonText: "OK"
//             });
//         }
//     }, []);

//     const getCameraPosition = async (availableCameras) => {
//         try {
//             const response = await urlSocket.post("/api/camera/getCamPosition", { mode: 'no-cors' });
//             console.log('Server response with camera positions:', response.data.camera_pos);

//             if (response.data.camera_pos) {
//                 const camPositions = response.data.camera_pos.camera_position;
//                 let finalCameraList = [];

//                 camPositions.forEach((serverCam) => {
//                     const matchingCamera = availableCameras.find(availCam =>
//                         availCam.label === serverCam.label &&
//                         availCam.p_id === serverCam.p_id &&
//                         availCam.v_id === serverCam.v_id
//                     );

//                     if (matchingCamera) {
//                         finalCameraList.push({
//                             ...matchingCamera,
//                             pos_no: serverCam.pos_no,
//                             positionName: serverCam.positionName || `Position ${serverCam.pos_no + 1}`, // Include position name from server
//                             originalCamIndex: serverCam.camIndex,
//                             portNumber: serverCam.portNumber || matchingCamera.portNumber,
//                             v_id: serverCam.v_id || matchingCamera.v_id,
//                             p_id: serverCam.p_id || matchingCamera.p_id,
//                             customPort: serverCam.customPort || false
//                         });
//                     } else {
//                         // For unavailable cameras
//                         const portInfo = extractPortInfo(serverCam.label || '');
//                         finalCameraList.push({
//                             deviceId: null,
//                             label: `Camera ${serverCam.camIndex + 1} - This camera is not available in device`,
//                             camIndex: serverCam.camIndex,
//                             pos_no: serverCam.pos_no,
//                             id: serverCam.camIndex + 1,
//                             title: `Camera ${serverCam.camIndex + 1} - Not Available`,
//                             positionName: serverCam.positionName || `Position ${serverCam.pos_no + 1}`, // Include position name
//                             isError: true,
//                             errorMessage: "This camera is not available in device",
//                             originalCamIndex: serverCam.camIndex,
//                             portNumber: serverCam.portNumber || portInfo.portNumber || generatePortNumber(serverCam.camIndex, ''),
//                             v_id: serverCam.v_id || portInfo.v_id || '',
//                             p_id: serverCam.p_id || portInfo.p_id || '',
//                             customPort: serverCam.customPort || false
//                         });
//                     }
//                 });

//                 finalCameraList.sort((a, b) => a.pos_no - b.pos_no);
//                 console.log('Final camera list with full data:', finalCameraList);

//                 setConnectedCameras(finalCameraList);
//                 setDefaultCamOrder(finalCameraList);

//             } else if (response.data === 'no_data') {
//                 // Swal.fire({
//                 //     icon: 'info',
//                 //     title: 'Camera Info not available'
//                 // });
//                 setDefaultCamOrder(availableCameras);
//             }

//         } catch (error) {
//             console.log('Error Info: ', error);
//             Swal.fire({
//                 title: "Camera Is not Set",
//                 text: "Please fix that camera correct port",
//                 icon: "info",
//                 button: "OK"
//             });
//         }
//     };

//     // Assign camera positions with full data logging
//     const assignCamPosition = async () => {
//         try {
//             let posChangedCameras = connectedCameras.map((camera, index) => {
//                 return {
//                     ...camera,
//                     pos_no: index,
//                     positionName: camera.positionName || `Position ${index + 1}`, // Ensure position name is included
//                     portNumber: camera.portNumber || generatePortNumber(camera.camIndex, camera.deviceId),
//                     v_id: camera.v_id || '',
//                     p_id: camera.p_id || ''
//                 };
//             });

//             console.log('Submitting cameras with full data and indices:', posChangedCameras.map((cam, idx) => ({
//                 id: cam.id,
//                 index: idx,
//                 positionName: cam.positionName,
//                 fullData: cam
//             })));
//             console.log('posChangedCameras', posChangedCameras)

//             const response = await urlSocket.post('/api/camera/assignCamPostion', {
//                 camera_pos: posChangedCameras
//             }, { mode: 'no-cors' });

//             if (response.data === 'Success') {
//                 Swal.fire({
//                     title: 'Camera Position Updated Successfully',
//                     icon: 'success',
//                     showCancelButton: false,
//                     confirmButtonText: 'OK'
//                 });
//                 setEnableReset(false);
//             } else {
//                 Swal.fire({
//                     title: 'Error on Submission',
//                     icon: 'error'
//                 });
//             }
//         } catch (error) {
//             console.log('Error Data: ', error);
//             Swal.fire({
//                 title: 'Error on Submission',
//                 text: 'An error occurred while updating camera positions',
//                 icon: 'error'
//             });
//         }
//     };

//     // Reset camera positions
//     const resetCamPosition = () => {
//         Swal.fire({
//             title: 'Reset Camera Positions?',
//             text: 'Are you sure you want to reset the camera positions?',
//             icon: 'warning',
//             showCancelButton: true,
//             confirmButtonText: 'Yes',
//             cancelButtonText: 'No'
//         }).then((result) => {
//             if (result.isConfirmed) {
//                 console.log('Resetting to default camera order:', defaultCamOrder);
//                 setConnectedCameras(defaultCamOrder);
//                 setEnableReset(false);
//             }
//         });
//     };

//     const handleEditFormChange = (field, value) => {
//         setEditForm(prev => ({
//             ...prev,
//             [field]: value
//         }));
//     };

//     // Integrated Task Component (formerly separate)
//     const TaskRow = ({ camera, index }) => {
//         const [showCam, setShowCam] = useState(false);
//         const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: camera.id });

//         const style = {
//             transition,
//             transform: CSS.Transform.toString(transform),
//         };

//         const handleButtonClick = (event) => {
//             event.preventDefault();
//             event.stopPropagation();
//             setShowCam(!showCam);
//         };

//         const handleRemoveCameraClick = (event) => {
//             event.preventDefault();
//             event.stopPropagation();
//             // Send full data with index and ID for deletion
//             handleRemoveCamera({
//                 ...camera,
//                 index,
//                 originalIndex: camera.pos_no
//             });
//         };

//         const showCamera = () => {
//             setShowCam(!showCam);
//         };

//         const videoConstraints = { width: 1440, height: 1080 };

//         return (
//             <>
//                 <tr
//                     ref={setNodeRef}
//                     style={style}
//                     {...attributes}
//                     {...listeners}
//                     className={`droptask ${camera.isError ? 'table-danger' : ''}`}
//                 >
//                     <td>{camera.pos_no + 1}</td>
//                     <td>{camera.id}</td>
//                     <td>
//                         <div>
//                             <strong>{camera.positionName || `Position ${camera.pos_no + 1}`}</strong>
//                             <br />
//                             <small className="text-muted">{camera.title}</small>
//                             {camera.isError && (
//                                 <div>
//                                     <Badge color="danger" className="mt-1">
//                                         {camera.errorMessage}
//                                     </Badge>
//                                 </div>
//                             )}
//                         </div>
//                     </td>
//                     <td>
//                         <span>{camera.portNumber}</span>
//                     </td>
//                     <td>
//                         {!camera.isError && camera.deviceId ? (
//                             <Webcam
//                                 style={{ height: '100px', width: '100px' }}
//                                 videoConstraints={{
//                                     ...videoConstraints,
//                                     deviceId: { exact: camera.deviceId }
//                                 }}
//                                 audio={false}
//                                 onMouseDown={handleButtonClick}
//                             />
//                         ) : (
//                             <div
//                                 style={{
//                                     height: '100px',
//                                     width: '100px',
//                                     backgroundColor: '#f8f9fa',
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     justifyContent: 'center',
//                                     border: '1px solid #dee2e6'
//                                 }}
//                             >
//                                 <i className="mdi mdi-camera-off text-muted"></i>
//                             </div>
//                         )}
//                     </td>
//                     <td>
//                         <div className="d-flex gap-2">
//                             <Button
//                                 color="success"
//                                 size="sm"
//                                 onMouseDown={handleButtonClick}
//                                 disabled={camera.isError || !camera.deviceId}
//                                 title="View Camera"
//                             >
//                                 <i className="mdi mdi-eye"></i>
//                             </Button>
//                             <Button
//                                 color="danger"
//                                 size="sm"
//                                 onMouseDown={handleRemoveCameraClick}
//                                 title="Remove Camera"
//                             >
//                                 <i className="mdi mdi-delete"></i>
//                             </Button>
//                         </div>
//                     </td>
//                 </tr>

//                 {/* Modal for full camera view */}
//                 {showCam && !camera.isError && camera.deviceId && (
//                     <Modal isOpen={showCam} toggle={showCamera} centered size='lg'>
//                         <ModalHeader toggle={showCamera}>
//                             <div>
//                                 <h5>Position: {camera.positionName || `Position ${camera.pos_no + 1}`}</h5>
//                                 <small className="text-muted">
//                                     Label: {camera.title} | Port: {camera.portNumber} | ID: {camera.id} | Index: {index}
//                                 </small>
//                             </div>
//                         </ModalHeader>
//                         <ModalBody>
//                             <div>
//                                 <Webcam
//                                     style={{ width: '100%', height: 'auto' }}
//                                     audio={false}
//                                     videoConstraints={{
//                                         ...videoConstraints,
//                                         deviceId: { exact: camera.deviceId }
//                                     }}
//                                 />
//                             </div>
//                         </ModalBody>
//                         <ModalFooter>
//                             <Button color="info" onClick={showCamera}>Close</Button>
//                         </ModalFooter>
//                     </Modal>
//                 )}
//             </>
//         );
//     };

//     // Effect for component mount/unmount
//     useEffect(() => {
//         const handleDeviceChange = () => {
//             checkWebcam();
//         };

//         navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
//         checkWebcam();

//         return () => {
//             navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
//         };
//     }, [checkWebcam]);

//     const availableCamerasToAdd = getAvailableCameras();

//     return (
//         <div className='page-content'>
//             <Container fluid>
//                 <CardTitle className="text-center" style={{ fontSize: 22, paddingTop: '20px' }}>
//                     Configure Camera Position
//                 </CardTitle>

//                 {/* Add Available Cameras Button */}
//                 <div className="text-center mb-3">
//                     <Button
//                         color="primary"
//                         onClick={() => setShowAvailableModal(true)}
//                         disabled={availableCamerasToAdd.length === 0}
//                     >
//                         Add Available Cameras ({availableCamerasToAdd.length})
//                     </Button>
//                 </div>

//                 {/* Camera List with Drag and Drop */}
//                 {connectedCameras && connectedCameras.length > 0 && (
//                     <div>
//                         <div className='d-flex justify-content-between mb-3'>
//                             <CardTitle>Arrange Camera Positions</CardTitle>
//                             <div className=''>
//                                 {enableReset && (
//                                     <Button color='info' className='me-2' onClick={resetCamPosition}>
//                                         Reset
//                                     </Button>
//                                 )}
//                                 <Button color='primary' onClick={assignCamPosition}>
//                                     Submit
//                                 </Button>
//                             </div>
//                         </div>

//                         <Table bordered style={{ textAlign: 'center' }}>
//                             <thead>
//                                 <tr>
//                                     <th style={{ width: '5%' }}>Position</th>
//                                     <th style={{ width: '5%' }}>Camera</th>
//                                     <th style={{ width: '30%' }}>Position Name</th>
//                                     <th style={{ width: '15%' }}>Camera ID</th>
//                                     <th style={{ width: '25%' }}>Preview</th>
//                                     <th style={{ width: '20%' }}>Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 <DndContext
//                                     sensors={sensors}
//                                     collisionDetection={closestCorners}
//                                     onDragEnd={handleDragEnd}
//                                 >
//                                     <SortableContext items={connectedCameras} strategy={verticalListSortingStrategy}>
//                                         {connectedCameras.map((camera, cameraIndex) => (
//                                             <TaskRow
//                                                 key={camera.id}
//                                                 camera={camera}
//                                                 index={cameraIndex}
//                                             />
//                                         ))}
//                                     </SortableContext>
//                                 </DndContext>
//                             </tbody>
//                         </Table>
//                     </div>
//                 )}

//                 {/* No cameras message */}
//                 {connectedCameras && connectedCameras.length === 0 && (
//                     <div className="text-center text-muted mt-4">
//                         <p>No cameras connected. Use the &quot;Add Available Cameras&quot; button above to add cameras.</p>
//                     </div>
//                 )}

//                 {/* Available Cameras Modal */}
//                 <Modal isOpen={showAvailableModal} toggle={() => setShowAvailableModal(false)} size="lg">
//                     <ModalHeader toggle={() => setShowAvailableModal(false)}>
//                         Available Cameras to Add
//                         <Badge color="info" className="ms-2">
//                             {availableCamerasToAdd.length} Available
//                         </Badge>
//                     </ModalHeader>
//                     <ModalBody>
//                         {availableCamerasToAdd.length > 0 ? (
//                             <ListGroup>
//                                 {availableCamerasToAdd.map((camera, index) => (
//                                     <ListGroupItem
//                                         key={camera.deviceId || index}
//                                         className="d-flex justify-content-between align-items-center"
//                                     >
//                                         <div>
//                                             <strong>{camera.label}</strong>
//                                             <br />
//                                             <small className="text-muted">
//                                                 Device ID: {camera.deviceId}
//                                                 <br />
//                                                 Port: {camera.portNumber}
//                                                 <br />
//                                                 Index: {index}
//                                             </small>
//                                         </div>
//                                         <Button
//                                             color="primary"
//                                             size="sm"
//                                             onClick={() => handleAddCameraWithEdit(camera)}
//                                         >
//                                             Edit & Add
//                                         </Button>
//                                     </ListGroupItem>
//                                 ))}
//                             </ListGroup>
//                         ) : (
//                             <div className="text-center text-muted">
//                                 <p>No available cameras to add</p>
//                                 <small>All detected cameras are already in the connected cameras list</small>
//                             </div>
//                         )}
//                     </ModalBody>
//                     <ModalFooter>
//                         <Button color="secondary" onClick={() => setShowAvailableModal(false)}>
//                             Close
//                         </Button>
//                     </ModalFooter>
//                 </Modal>

//                 {/* Camera Edit Modal */}
//                 <Modal isOpen={showEditModal} toggle={() => setShowEditModal(false)} centered>
//                     <ModalHeader toggle={() => setShowEditModal(false)}>
//                         Configure Camera Details
//                     </ModalHeader>
//                     <ModalBody>
//                         {editingCamera && (
//                             <Form>
//                                 <FormGroup>
//                                     <Label for="cameraPositionName">Camera Position Name *</Label>
//                                     <Input
//                                         type="text"
//                                         id="cameraPositionName"
//                                         placeholder="Enter camera position name"
//                                         value={editForm.positionName}
//                                         onChange={(e) => {
//                                             // remove any spaces from pasted text
//                                             const value = e.target.value.replace(/\s+/g, '');
//                                             handleEditFormChange('positionName', value);
//                                         }}
//                                         onKeyDown={(e) => {
//                                             // block space key entirely
//                                             if (e.key === ' ') {
//                                                 e.preventDefault();
//                                             }
//                                         }}
//                                         invalid={!editForm.positionName.trim()}
//                                     />

//                                     {!editForm.positionName.trim() && (
//                                         <div className="text-danger small mt-1">
//                                             Camera position name is required
//                                         </div>
//                                     )}

//                                 </FormGroup>


//                                 <FormGroup>
//                                     <Label for="cameraName">Camera Name *</Label>
//                                     <Input
//                                         type="text"
//                                         id="cameraName"
//                                         placeholder="Enter camera name"
//                                         value={editForm.name}
//                                         onChange={(e) => handleEditFormChange('name', e.target.value)}
//                                         disabled
//                                     />
//                                 </FormGroup>

//                                 <FormGroup>
//                                     <Label for="cameraPort">Port Number *</Label>
//                                     <Input
//                                         type="text"
//                                         id="cameraPort"
//                                         placeholder="Enter port number"
//                                         value={editForm.portNumber}
//                                         onChange={(e) => handleEditFormChange('portNumber', e.target.value)}
//                                         disabled // This field should be disabled as per your requirement
//                                     />
//                                     <small className="text-muted">
//                                         Default: {editingCamera.portNumber}
//                                     </small>
//                                 </FormGroup>

//                                 {/* Camera Preview */}
//                                 <FormGroup>
//                                     <Label>Camera Preview</Label>
//                                     <div className="border rounded p-2" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                                         {editingCamera.deviceId ? (
//                                             <Webcam
//                                                 style={{ maxWidth: '100%', maxHeight: '100%' }}
//                                                 videoConstraints={{
//                                                     width: 640,
//                                                     height: 480,
//                                                     deviceId: { exact: editingCamera.deviceId }
//                                                 }}
//                                                 audio={false}
//                                             />
//                                         ) : (
//                                             <div className="text-muted">
//                                                 <i className="mdi mdi-camera-off" style={{ fontSize: '2rem' }}></i>
//                                                 <p>Camera not available</p>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </FormGroup>
//                             </Form>
//                         )}
//                     </ModalBody>
//                     <ModalFooter>
//                         <Button color="secondary" onClick={() => setShowEditModal(false)}>
//                             Cancel
//                         </Button>
//                         <Button
//                             color="primary"
//                             onClick={handleSaveEditedCamera}
//                             disabled={!editForm.name.trim() || !editForm.positionName.trim()}
//                         >
//                             Save Camera
//                         </Button>
//                     </ModalFooter>
//                 </Modal>
//             </Container>
//         </div>
//     );
// };

// // CameraSetPosition.propTypes = {
// CameraSetPosition.propTypes = {
//     camera: PropTypes.shape({
//         id: PropTypes.string,
//         pos_no: PropTypes.number,
//         isError: PropTypes.bool,
//         title: PropTypes.string,
//         positionName: PropTypes.string,
//         errorMessage: PropTypes.string,
//         portNumber: PropTypes.string,
//         deviceId: PropTypes.string,
//     }),
//     index: PropTypes.number,
// };

// export default CameraSetPosition;

// // // import PropTypes from 'prop-types';
// // // import React, { useState, useEffect, useCallback } from 'react';
// // // // import { useNavigate } from 'react-router-dom';
// // // import {
// // //     Button,
// // //     CardTitle,
// // //     Container,
// // //     ListGroup,
// // //     ListGroupItem,
// // //     Table,
// // //     Modal,
// // //     ModalHeader,
// // //     ModalBody,
// // //     ModalFooter,
// // //     Badge
// // // } from 'reactstrap';
// // // import {
// // //     DndContext,
// // //     KeyboardSensor,
// // //     PointerSensor,
// // //     useSensor,
// // //     useSensors,
// // //     closestCorners,
// // // } from "@dnd-kit/core";
// // // import {
// // //     SortableContext,
// // //     verticalListSortingStrategy,
// // //     useSortable
// // // } from "@dnd-kit/sortable";
// // // import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
// // // import { CSS } from "@dnd-kit/utilities";
// // // import Webcam from 'react-webcam';
// // // import urlSocket from 'pages/AdminInspection/urlSocket';
// // // import Swal from 'sweetalert2';

// // import PropTypes from 'prop-types';
// // import React, { useState, useEffect, useCallback } from 'react';
// // // import { useNavigate } from 'react-router-dom';
// // import {
// //     Button,
// //     CardTitle,
// //     Container,
// //     ListGroup,
// //     ListGroupItem,
// //     Table,
// //     Modal,
// //     ModalHeader,
// //     ModalBody,
// //     ModalFooter,
// //     Badge,
// //     Form,
// //     FormGroup,
// //     Label,
// //     Input
// // } from 'reactstrap';
// // import {
// //     DndContext,
// //     KeyboardSensor,
// //     PointerSensor,
// //     useSensor,
// //     useSensors,
// //     closestCorners,
// // } from "@dnd-kit/core";
// // import {
// //     SortableContext,
// //     verticalListSortingStrategy,
// //     useSortable
// // } from "@dnd-kit/sortable";
// // import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
// // import { CSS } from "@dnd-kit/utilities";
// // import Webcam from 'react-webcam';
// // import urlSocket from 'pages/AdminInspection/urlSocket';
// // import Swal from 'sweetalert2';

// // // Integrated Camera Set Position Component
// // const CameraSetPosition = () => {
// //     // const navigate = useNavigate();

// //     // State management
// //     const [connectedCameras, setConnectedCameras] = useState([]);
// //     const [defaultCamOrder, setDefaultCamOrder] = useState([]);
// //     const [availableCameras, setAvailableCameras] = useState([]);
// //     const [showAvailableModal, setShowAvailableModal] = useState(false);
// //     const [cameraDisconnected, setCameraDisconnected] = useState(false);
// //     const [enableReset, setEnableReset] = useState(false);
// //     const [editingCamera, setEditingCamera] = useState(null);
// //         const [showEditModal, setShowEditModal] = useState(false);
// //           const [editForm, setEditForm] = useState({
// //         name: '',
// //         position: '',
// //         portNumber: ''
// //     });
// //     // Drag and drop sensors
// //     const sensors = useSensors(
// //         useSensor(PointerSensor),
// //         useSensor(KeyboardSensor, {
// //             coordinateGetter: sortableKeyboardCoordinates,
// //         })
// //     );

// //     // Extract port information from camera label
// //     const extractPortInfo = (label) => {
// //         let v_id = '', p_id = '', portNumber = '';

// //         if (label && label.includes('(') && label.includes(')')) {
// //             const portInfo = label.slice(label.indexOf('(') + 1, label.indexOf(')'));
// //             const parts = portInfo.split(':');
// //             v_id = parts[0] || '';
// //             p_id = parts[1] || '';

// //             // Extract port number - could be in various formats
// //             // Looking for patterns like "port:1234" or just numbers
// //             const portMatch = portInfo.match(/port[:\s]*(\d+)|(\d{4,})/i);
// //             if (portMatch) {
// //                 portNumber = portMatch[1] || portMatch[2];
// //             }
// //         }

// //         return { v_id, p_id, portNumber };
// //     };

// //     const handleSaveEditedCamera = () => {
// //         //  if (!editForm?.positionName.trim()) {
// //         //     Swal.fire({
// //         //         icon: 'error',
// //         //         title: 'Validation Error',
// //         //         text: 'Camera position name is required'
// //         //     });
// //         //     return;
// //         // }
// //         if (!editForm.name.trim()) {
// //             Swal.fire({
// //                 icon: 'error',
// //                 title: 'Validation Error',
// //                 text: 'Camera name is required'
// //             });
// //             return;
// //         }

// //         // if (!editForm.position.trim() || isNaN(editForm.position) || parseInt(editForm.position) < 1) {
// //         //     Swal.fire({
// //         //         icon: 'error',
// //         //         title: 'Validation Error',
// //         //         text: 'Please enter a valid position number (1 or greater)'
// //         //     });
// //         //     return;
// //         // }

// //         if (!editForm.portNumber.trim()) {
// //             Swal.fire({
// //                 icon: 'error',
// //                 title: 'Validation Error',
// //                 text: 'Port number is required'
// //             });
// //             return;
// //         }

// //         // Check if position already exists
// //         const positionExists = connectedCameras.some(cam => 
// //             cam.pos_no === (parseInt(editForm.position) - 1) && cam.id !== editingCamera.id
// //         );

// //         if (positionExists) {
// //             Swal.fire({
// //                 icon: 'warning',
// //                 title: 'Position Conflict',
// //                 text: 'This position is already taken. The camera will be added at the end.',
// //                 showCancelButton: true,
// //                 confirmButtonText: 'Continue',
// //                 cancelButtonText: 'Cancel'
// //             }).then((result) => {
// //                 if (result.isConfirmed) {
// //                     saveCamera();
// //                 }
// //             });
// //         } else {
// //             saveCamera();
// //         }
// //     };


// //     const saveCamera = () => {
// //     setConnectedCameras(prevConnected => {
// //         const maxId = prevConnected.length > 0 ? Math.max(...prevConnected.map(cam => cam.id)) : 0;
// //         // Auto-assign position to the end of the list
// //         const autoPosition = prevConnected.length;

// //         // Extract or generate port information
// //         const portInfo = extractPortInfo(editingCamera.label);

// //         const newCamera = {
// //             ...editingCamera,
// //             pos_no: autoPosition, // Auto-assign position
// //             id: maxId + 1,
// //             title: editForm.name,
// //             customName: editForm.name,
// //             originalCamIndex: editingCamera.camIndex,
// //             v_id: portInfo.v_id,
// //             p_id: portInfo.p_id,
// //             portNumber: editForm.portNumber, // Use the pre-filled port number
// //             customPort: editForm.portNumber !== (portInfo.portNumber || generatePortNumber(editingCamera.camIndex, editingCamera.deviceId))
// //         };

// //         const updated = [...prevConnected, newCamera];
        
// //         // Sort by position and reassign positions to handle conflicts
// //         updated.sort((a, b) => a.pos_no - b.pos_no);
// //         const finalUpdated = updated.map((camera, index) => ({
// //             ...camera,
// //             pos_no: index
// //         }));

// //         console.log('After adding edited camera - updated list:', finalUpdated);
// //         return finalUpdated;
// //     });

// //     setShowEditModal(false);
// //     setEditingCamera(null);
// //     setEditForm({ name: '', position: '', portNumber: '' });
// //     setEnableReset(true);

// //     Swal.fire({
// //         icon: 'success',
// //         title: 'Camera Added',
// //         text: `${editForm.name} has been added to connected cameras`,
// //         timer: 2000,
// //         showConfirmButton: false
// //     });
// // };
// //     // Generate a unique port number based on camera index and device ID
// //     const generatePortNumber = (camIndex, deviceId) => {
// //         // Base port number starting from 8000
// //         const basePort = 8000;
// //         // Use camera index or generate from deviceId hash
// //         const indexPort = camIndex !== undefined ? camIndex : 0;
// //         // Create a simple hash from deviceId for uniqueness
// //         const deviceHash = deviceId ? deviceId.slice(-4) : '0000';
// //         const hashNumber = parseInt(deviceHash, 16) % 1000;

// //         return (basePort + indexPort * 10 + (hashNumber % 10)).toString();
// //     };


// //         // Handle opening edit modal for adding camera
// //     const handleAddCameraWithEdit = (camera) => {
// //         setEditingCamera(camera);
// //         setEditForm({
// //             name: camera.label || `Camera ${camera.camIndex + 1}`,
// //             position: (connectedCameras.length + 1).toString(),
// //             portNumber: camera.portNumber || generatePortNumber(camera.camIndex, camera.deviceId)
// //         });
// //         setShowEditModal(true);
// //         setShowAvailableModal(false);
// //     };

// //     // Get task position for drag and drop
// //     const getTaskPos = (id) => connectedCameras.findIndex((camera) => camera.id === id);

// //     // Handle drag end event
// //     const handleDragEnd = (event) => {
// //         try {
// //             const { active, over } = event;

// //             if (active.id === over.id) return;

// //             setConnectedCameras((cameras) => {
// //                 const originalPos = getTaskPos(active.id);
// //                 const newPos = getTaskPos(over.id);
// //                 const reorderedCameras = arrayMove(cameras, originalPos, newPos);

// //                 // Update position numbers after reordering
// //                 const updatedCameras = reorderedCameras.map((camera, index) => ({
// //                     ...camera,
// //                     pos_no: index
// //                 }));

// //                 console.log('Drag reorder - Full data with indices:', updatedCameras.map((cam, idx) => ({
// //                     id: cam.id,
// //                     index: idx,
// //                     fullData: cam
// //                 })));

// //                 return updatedCameras;
// //             });

// //             setEnableReset(true);
// //         } catch (error) {
// //             console.log('Error Info: ', error);
// //         }
// //     };

   


// // const handleRemoveCamera = useCallback((fullCameraData) => {
// //         console.log('Remove camera - Full data received:', fullCameraData);
        
// //         Swal.fire({
// //             title: 'Remove Camera?',
// //             html: `
// //                 <p>Are you sure you want to remove this camera?</p>
// //                 <div style="text-align: left; margin-top: 15px;">
// //                     <strong>Camera Details:</strong><br>
// //                     ID: ${fullCameraData.id}<br>
// //                     Index: ${fullCameraData.index}<br>
// //                     Label: ${fullCameraData.label || fullCameraData.title}<br>
// //                     Port: ${fullCameraData.portNumber}<br>
// //                     Device ID: ${fullCameraData.deviceId || 'N/A'}
// //                 </div>
// //             `,
// //             icon: 'warning',
// //             showCancelButton: true,
// //             confirmButtonColor: '#d33',
// //             cancelButtonColor: '#3085d6',
// //             confirmButtonText: 'Yes, remove it!',
// //             cancelButtonText: 'Cancel'
// //         }).then(async (result) => {
// //             if (result.isConfirmed) {
// //                 try {
// //                 // Call the delete API
// //                 const response = await urlSocket.post('/api/camera/delete_camera', {
// //                     deviceid: fullCameraData.deviceId
// //                 });

// //                 if (!response.data.success) {
// //                     Swal.fire({
// //                         icon: 'error',
// //                         title: 'Delete Failed',
// //                         text: response.data.message || 'Could not delete the camera from the server.'
// //                     });
// //                     return;
// //                 }
// //                 setConnectedCameras(prevCameras => {
// //                     const updatedCameras = prevCameras
// //                         .filter(camera => camera.id !== fullCameraData.id)
// //                         .map((camera, index) => ({
// //                             ...camera,
// //                             pos_no: index
// //                         }));
                    
// //                     console.log('After removal - Updated cameras:', updatedCameras);
// //                     return updatedCameras;
// //                 });

// //                 setEnableReset(true);

// //                 // Send deletion data to server if needed
// //                 // handleServerDelete(fullCameraData);

// //                 Swal.fire({
// //                     icon: 'success',
// //                     title: 'Camera Removed',
// //                     text: `Camera ${fullCameraData.label || fullCameraData.title} has been removed from the list`,
// //                     timer: 1500,
// //                     showConfirmButton: false
// //                 });
// //             }catch (error) {
// //                 console.error('Delete error:', error);
// //                 Swal.fire({
// //                     icon: 'error',
// //                     title: 'Server Error',
// //                     text: 'Failed to connect to server while deleting camera.'
// //                 });
// //             }
            
// //             }
// //         });
// //     }, []);





// //     // Get available cameras that are not in connectedCameras
// //     const getAvailableCameras = useCallback(() => {
// //         if (!connectedCameras || !availableCameras.length) return [];

// //         return availableCameras.filter(availCam => {
// //             const isAlreadyConnected = connectedCameras.some(connCam =>
// //                 connCam.deviceId === availCam.deviceId && !connCam.isError
// //             );
// //             return !isAlreadyConnected;
// //         });
// //     }, [connectedCameras, availableCameras]);

// //     // Add camera to connected cameras
// //     const addCameraToConnected = useCallback((cameraToAdd) => {
// //         console.log('cameraToAdd with full data:', cameraToAdd);
// //         setConnectedCameras(prevConnected => {
// //             const maxPosNo = prevConnected.length > 0 ? Math.max(...prevConnected.map(cam => cam.pos_no)) : -1;
// //             const maxId = prevConnected.length > 0 ? Math.max(...prevConnected.map(cam => cam.id)) : 0;

// //             // Extract or generate port information
// //             const portInfo = extractPortInfo(cameraToAdd.label);
// //             const generatedPort = generatePortNumber(cameraToAdd.camIndex, cameraToAdd.deviceId);

// //             const newCamera = {
// //                 ...cameraToAdd,
// //                 pos_no: maxPosNo + 1,
// //                 id: maxId + 1,
// //                 title: cameraToAdd.label,
// //                 originalCamIndex: cameraToAdd.camIndex,
// //                 v_id: portInfo.v_id,
// //                 p_id: portInfo.p_id,
// //                 portNumber: portInfo.portNumber || generatedPort,
// //                 customPort: false
// //             };

// //             const updated = [...prevConnected, newCamera];
// //             console.log('After adding camera - updated list:', updated);
// //             return updated;
// //         });

// //         // Close the modal after adding
// //         setShowAvailableModal(false);

// //         Swal.fire({
// //             icon: 'success',
// //             title: 'Camera Added',
// //             text: `${cameraToAdd.label} has been added to connected cameras`,
// //             timer: 2000,
// //             showConfirmButton: false
// //         });
// //     }, []);

// //     const checkWebcam = useCallback(async () => {
// //         try {
// //             // Now enumerate devices
// //             const devices = await navigator.mediaDevices.enumerateDevices();
// //             const videoInputDevices = devices.filter(device => device.kind === 'videoinput');

// //             if (!videoInputDevices.length) {
// //                 setCameraDisconnected(true);
// //             } else {
// //                 console.log('Available Cameras: ', videoInputDevices);

// //                 const newAvailableCameras = videoInputDevices
// //                     .map((camera, index) => {
// //                         const portInfo = extractPortInfo(camera.label);
// //                         const generatedPort = generatePortNumber(index, camera.deviceId);

// //                         return {
// //                             deviceId: camera.deviceId,
// //                             label: camera.label,
// //                             camIndex: index,
// //                             pos_no: index,
// //                             id: index + 1,
// //                             title: camera.label,
// //                             originalDeviceId: camera.deviceId,
// //                             groupId: camera.groupId,
// //                             v_id: portInfo.v_id,
// //                             p_id: portInfo.p_id,
// //                             portNumber: portInfo.portNumber || generatedPort,
// //                             customPort: false
// //                         };
// //                     });

// //                 console.log('Available cameras with full data:', newAvailableCameras);
// //                 setAvailableCameras(newAvailableCameras);
// //                 await getCameraPosition(newAvailableCameras);
// //             }
// //         } catch (error) {
// //             console.log('Error Info: ', error);
// //             Swal.fire({
// //                 title: "Camera Error",
// //                 text: "Please allow camera access or check camera port",
// //                 icon: "error",
// //                 confirmButtonText: "OK"
// //             });
// //         }
// //     }, []);

// //     const getCameraPosition = async (availableCameras) => {
// //         try {
// //             const response = await urlSocket.post("/getCamPosition", { mode: 'no-cors' });
// //             console.log('Server response with camera positions:', response.data.camera_pos);

// //             if (response.data.camera_pos) {
// //                 const camPositions = response.data.camera_pos.camera_position;
// //                 let finalCameraList = [];

// //                 camPositions.forEach((serverCam) => {
// //                     const matchingCamera = availableCameras.find(availCam =>
// //                         availCam.deviceId === serverCam.deviceId &&
// //                         availCam.label === serverCam.label &&
// //                         availCam.p_id === serverCam.p_id &&
// //                         availCam.v_id === serverCam.v_id
// //                     );

// //                     if (matchingCamera) {
// //                         finalCameraList.push({
// //                             ...matchingCamera,
// //                             pos_no: serverCam.pos_no,
// //                             originalCamIndex: serverCam.camIndex,
// //                             portNumber: serverCam.portNumber || matchingCamera.portNumber,
// //                             v_id: serverCam.v_id || matchingCamera.v_id,
// //                             p_id: serverCam.p_id || matchingCamera.p_id,
// //                             customPort: serverCam.customPort || false
// //                         });
// //                     } else {
// //                         // For unavailable cameras
// //                         const portInfo = extractPortInfo(serverCam.label || '');
// //                         finalCameraList.push({
// //                             deviceId: null,
// //                             label: `Camera ${serverCam.camIndex + 1} - This camera is not available in device`,
// //                             camIndex: serverCam.camIndex,
// //                             pos_no: serverCam.pos_no,
// //                             id: serverCam.camIndex + 1,
// //                             title: `Camera ${serverCam.camIndex + 1} - Not Available`,
// //                             isError: true,
// //                             errorMessage: "This camera is not available in device",
// //                             originalCamIndex: serverCam.camIndex,
// //                             portNumber: serverCam.portNumber || portInfo.portNumber || generatePortNumber(serverCam.camIndex, ''),
// //                             v_id: serverCam.v_id || portInfo.v_id || '',
// //                             p_id: serverCam.p_id || portInfo.p_id || '',
// //                             customPort: serverCam.customPort || false
// //                         });
// //                     }
// //                 });

// //                 finalCameraList.sort((a, b) => a.pos_no - b.pos_no);
// //                 console.log('Final camera list with full data:', finalCameraList);

// //                 setConnectedCameras(finalCameraList);
// //                 setDefaultCamOrder(finalCameraList);

// //             } else if (response.data === 'no_data') {
// //                 Swal.fire({
// //                     icon: 'info',
// //                     title: 'Camera Info not available'
// //                 });
// //                 setDefaultCamOrder(availableCameras);
// //             }

// //         } catch (error) {
// //             console.log('Error Info: ', error);
// //             Swal.fire({
// //                 title: "Camera Is not Set",
// //                 text: "Please fix that camera correct port",
// //                 icon: "info",
// //                 button: "OK"
// //             });
// //         }
// //     };

// //     // Assign camera positions with full data logging
// //     const assignCamPosition = async () => {
// //         try {
// //             let posChangedCameras = connectedCameras.map((camera, index) => {
// //                 return {
// //                     ...camera,
// //                     pos_no: index,
// //                     portNumber: camera.portNumber || generatePortNumber(camera.camIndex, camera.deviceId),
// //                     v_id: camera.v_id || '',
// //                     p_id: camera.p_id || ''
// //                 };
// //             });

// //             console.log('Submitting cameras with full data and indices:', posChangedCameras.map((cam, idx) => ({
// //                 id: cam.id,
// //                 index: idx,
// //                 fullData: cam
// //             })));
// //             console.log('posChangedCameras', posChangedCameras)

// //             const response = await urlSocket.post('/assignCamPostion', {
// //                 camera_pos: posChangedCameras
// //             }, { mode: 'no-cors' });

// //             if (response.data === 'Success') {
// //                 Swal.fire({
// //                     title: 'Camera Position Updated Successfully',
// //                     icon: 'success',
// //                     showCancelButton: false,
// //                     confirmButtonText: 'OK'
// //                 });
// //                 setEnableReset(false);
// //             } else {
// //                 Swal.fire({
// //                     title: 'Error on Submission',
// //                     icon: 'error'
// //                 });
// //             }
// //         } catch (error) {
// //             console.log('Error Data: ', error);
// //             Swal.fire({
// //                 title: 'Error on Submission',
// //                 text: 'An error occurred while updating camera positions',
// //                 icon: 'error'
// //             });
// //         }
// //     };

// //     // Reset camera positions
// //     const resetCamPosition = () => {
// //         Swal.fire({
// //             title: 'Reset Camera Positions?',
// //             text: 'Are you sure you want to reset the camera positions?',
// //             icon: 'warning',
// //             showCancelButton: true,
// //             confirmButtonText: 'Yes',
// //             cancelButtonText: 'No'
// //         }).then((result) => {
// //             if (result.isConfirmed) {
// //                 console.log('Resetting to default camera order:', defaultCamOrder);
// //                 setConnectedCameras(defaultCamOrder);
// //                 setEnableReset(false);
// //             }
// //         });
// //     };

// //         const handleEditFormChange = (field, value) => {
// //         setEditForm(prev => ({
// //             ...prev,
// //             [field]: value
// //         }));
// //     };


// //     // Integrated Task Component (formerly separate)
// //     const TaskRow = ({ camera, index }) => {
// //         const [showCam, setShowCam] = useState(false);
// //         const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: camera.id });

// //         const style = {
// //             transition,
// //             transform: CSS.Transform.toString(transform),
// //         };

// //         const handleButtonClick = (event) => {
// //             event.preventDefault();
// //             event.stopPropagation();
// //             setShowCam(!showCam);
// //         };

// //         const handleRemoveCameraClick = (event) => {
// //             event.preventDefault();
// //             event.stopPropagation();
// //             // Send full data with index and ID for deletion
// //             handleRemoveCamera({
// //                 ...camera,
// //                 index,
// //                 originalIndex: camera.pos_no
// //             });
// //         };

// //         const showCamera = () => {
// //             setShowCam(!showCam);
// //         };

// //         const videoConstraints = { width: 1440, height: 1080 };

// //         return (
// //             <>
// //                 <tr
// //                     ref={setNodeRef}
// //                     style={style}
// //                     {...attributes}
// //                     {...listeners}
// //                     className={`droptask ${camera.isError ? 'table-danger' : ''}`}
// //                 >
// //                     <td>{camera.pos_no + 1}</td>
// //                     <td>{camera.id}</td>
// //                     <td>
// //                         <div>
// //                             {camera.title}
// //                             {camera.isError && (
// //                                 <div>
// //                                     <Badge color="danger" className="mt-1">
// //                                         {camera.errorMessage}
// //                                     </Badge>
// //                                 </div>
// //                             )}
// //                         </div>
// //                     </td>
// //                     <td>
// //                         <span>{camera.portNumber}</span>
// //                     </td>
// //                     <td>
// //                         {!camera.isError && camera.deviceId ? (
// //                             <Webcam
// //                                 style={{ height: '100px', width: '100px' }}
// //                                 videoConstraints={{
// //                                     ...videoConstraints,
// //                                     deviceId: { exact: camera.deviceId }
// //                                 }}
// //                                 audio={false}
// //                                 onMouseDown={handleButtonClick}
// //                             />
// //                         ) : (
// //                             <div
// //                                 style={{
// //                                     height: '100px',
// //                                     width: '100px',
// //                                     backgroundColor: '#f8f9fa',
// //                                     display: 'flex',
// //                                     alignItems: 'center',
// //                                     justifyContent: 'center',
// //                                     border: '1px solid #dee2e6'
// //                                 }}
// //                             >
// //                                 <i className="mdi mdi-camera-off text-muted"></i>
// //                             </div>
// //                         )}
// //                     </td>
// //                     <td>
// //                         <div className="d-flex gap-2">
// //                             <Button
// //                                 color="success"
// //                                 size="sm"
// //                                 onMouseDown={handleButtonClick}
// //                                 disabled={camera.isError || !camera.deviceId}
// //                                 title="View Camera"
// //                             >
// //                                 <i className="mdi mdi-eye"></i>
// //                             </Button>
// //                             <Button
// //                                 color="danger"
// //                                 size="sm"
// //                                 onMouseDown={handleRemoveCameraClick}
// //                                 title="Remove Camera"
// //                             >
// //                                 <i className="mdi mdi-delete"></i>
// //                             </Button>
// //                         </div>
// //                     </td>
// //                 </tr>

// //                 {/* Modal for full camera view */}
// //                 {showCam && !camera.isError && camera.deviceId && (
// //                     <Modal isOpen={showCam} toggle={showCamera} centered size='lg'>
// //                         <ModalHeader toggle={showCamera}>
// //                             <div>
// //                                 <h5>Label: {camera.title}</h5>
// //                                 <small className="text-muted">Port: {camera.portNumber} | ID: {camera.id} | Index: {index}</small>
// //                             </div>
// //                         </ModalHeader>
// //                         <ModalBody>
// //                             <div>
// //                                 <Webcam
// //                                     style={{ width: '100%', height: 'auto' }}
// //                                     audio={false}
// //                                     videoConstraints={{
// //                                         ...videoConstraints,
// //                                         deviceId: { exact: camera.deviceId }
// //                                     }}
// //                                 />
// //                             </div>
// //                         </ModalBody>
// //                         <ModalFooter>
// //                             <Button color="info" onClick={showCamera}>Close</Button>
// //                         </ModalFooter>
// //                     </Modal>
// //                 )}
// //             </>
// //         );
// //     };

// //     // Effect for component mount/unmount
// //     useEffect(() => {
// //         const handleDeviceChange = () => {
// //             checkWebcam();
// //         };

// //         navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
// //         checkWebcam();

// //         return () => {
// //             navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
// //         };
// //     }, [checkWebcam]);

// //     const availableCamerasToAdd = getAvailableCameras();

// //     return (
// //         <div className='page-content'>
// //             <Container fluid>
// //                 <CardTitle className="text-center" style={{ fontSize: 22, paddingTop: '20px' }}>
// //                     Configure Camera Position
// //                 </CardTitle>

// //                 {/* Add Available Cameras Button */}
// //                 <div className="text-center mb-3">
// //                     <Button
// //                         color="primary"
// //                         onClick={() => setShowAvailableModal(true)}
// //                         disabled={availableCamerasToAdd.length === 0}
// //                     >
// //                         Add Available Cameras ({availableCamerasToAdd.length})
// //                     </Button>
// //                 </div>

// //                 {/* Camera List with Drag and Drop */}
// //                 {connectedCameras && connectedCameras.length > 0 && (
// //                     <div>
// //                         <div className='d-flex justify-content-between mb-3'>
// //                             <CardTitle>Arrange Camera Positions</CardTitle>
// //                             <div className=''>
// //                                 {enableReset && (
// //                                     <Button color='info' className='me-2' onClick={resetCamPosition}>
// //                                         Reset
// //                                     </Button>
// //                                 )}
// //                                 <Button color='primary' onClick={assignCamPosition}>
// //                                     Submit
// //                                 </Button>
// //                             </div>
// //                         </div>

// //                         <Table bordered style={{ textAlign: 'center' }}>
// //                             <thead>
// //                                 <tr>
// //                                     <th style={{ width: '5%' }}>Position</th>
// //                                     <th style={{ width: '5%' }}>Camera</th>
// //                                     <th style={{ width: '30%' }}>Label</th>
// //                                     <th style={{ width: '15%' }}>Port</th>
// //                                     <th style={{ width: '25%' }}>Preview</th>
// //                                     <th style={{ width: '20%' }}>Actions</th>
// //                                 </tr>
// //                             </thead>
// //                             <tbody>
// //                                 <DndContext
// //                                     sensors={sensors}
// //                                     collisionDetection={closestCorners}
// //                                     onDragEnd={handleDragEnd}
// //                                 >
// //                                     <SortableContext items={connectedCameras} strategy={verticalListSortingStrategy}>
// //                                         {connectedCameras.map((camera, cameraIndex) => (
// //                                             <TaskRow
// //                                                 key={camera.id}
// //                                                 camera={camera}
// //                                                 index={cameraIndex}
// //                                             />
// //                                         ))}
// //                                     </SortableContext>
// //                                 </DndContext>
// //                             </tbody>
// //                         </Table>
// //                     </div>
// //                 )}

// //                 {/* No cameras message */}
// //                 {connectedCameras && connectedCameras.length === 0 && (
// //                     // <div className="text-center text-muted mt-4">
// //                     //     <p>No cameras connected. Use the "Add Available Cameras" button above to add cameras.</p>
// //                     // </div>
// //                     <div className="text-center text-muted mt-4">
// //                         <p>No cameras connected. Use the &quot;Add Available Cameras&quot; button above to add cameras.</p>
// //                     </div>

// //                 )}

// //                 {/* Available Cameras Modal */}
// //                 <Modal isOpen={showAvailableModal} toggle={() => setShowAvailableModal(false)} size="lg">
// //                     <ModalHeader toggle={() => setShowAvailableModal(false)}>
// //                         Available Cameras to Add
// //                         <Badge color="info" className="ms-2">
// //                             {availableCamerasToAdd.length} Available
// //                         </Badge>
// //                     </ModalHeader>
// //                     <ModalBody>
// //                         {availableCamerasToAdd.length > 0 ? (
// //                             <ListGroup>
// //                                 {availableCamerasToAdd.map((camera, index) => (
// //                                     <ListGroupItem
// //                                         key={camera.deviceId || index}
// //                                         className="d-flex justify-content-between align-items-center"
// //                                     >
// //                                         <div>
// //                                             <strong>{camera.label}</strong>
// //                                             <br />
// //                                             <small className="text-muted">
// //                                                 Device ID: {camera.deviceId}
// //                                                 <br />
// //                                                 Port: {camera.portNumber}
// //                                                 <br />
// //                                                 Index: {index}
// //                                             </small>
// //                                         </div>
// //                                         {/* <Button
// //                                             color="success"
// //                                             size="sm"
// //                                             onClick={() => addCameraToConnected(camera)}
// //                                         >
// //                                             Add Camera
// //                                         </Button> */}
// //                                           <Button
// //                                                 color="primary"
// //                                                 size="sm"
// //                                                 onClick={() => handleAddCameraWithEdit(camera)}
// //                                             >
// //                                                Edit & Add 
// //                                             </Button>
// //                                     </ListGroupItem>
// //                                 ))}
// //                             </ListGroup>
// //                         ) : (
// //                             <div className="text-center text-muted">
// //                                 <p>No available cameras to add</p>
// //                                 <small>All detected cameras are already in the connected cameras list</small>
// //                             </div>
// //                         )}
// //                     </ModalBody>
// //                     <ModalFooter>
// //                         <Button color="secondary" onClick={() => setShowAvailableModal(false)}>
// //                             Close
// //                         </Button>
// //                     </ModalFooter>
// //                 </Modal>


// //                       {/* Camera Edit Modal */}
// //                 <Modal isOpen={showEditModal} toggle={() => setShowEditModal(false)} centered>
// //                     <ModalHeader toggle={() => setShowEditModal(false)}>
// //                         Configure Camera Details
// //                     </ModalHeader>
// //                     <ModalBody>
// //                         {editingCamera && (
// //                             <Form>
// //                                 <FormGroup>
// //                                     <Label for="cameraName">Camera Position Name *</Label>
// //                                     <Input
// //                                         type="text"
// //                                         id="CameraPositonName"
// //                                         placeholder="Enter camera Position name"
// //                                         // value={editForm.name}
// //                                         //   value={editForm?.positionName || " "} 
// //                                         onChange={(e) => handleEditFormChange('Position', e.target.value)}

// //                                     />

// //                                     {/* {!editForm.positionName.trim() && (
// //                                         <div className="text-danger small mt-1">Camera position name is required</div>
// //                                     )} */}

// //                                 </FormGroup>
// //                                 <FormGroup>
// //                                     <Label for="cameraName">Camera Name *</Label>
// //                                     <Input
// //                                         type="text"
// //                                         id="cameraName"
// //                                         placeholder="Enter camera name"
// //                                         value={editForm.name}
// //                                         onChange={(e) => handleEditFormChange('name', e.target.value)}
// //                                         disabled
// //                                     // Remove the invalid prop that was disabling the field
// //                                     // invalid={!editForm.name.trim()}
// //                                     />
                                
// //                                 </FormGroup>

                           

// //                                 <FormGroup>
// //                                     <Label for="cameraPort">Port Number *</Label>
// //                                     <Input
// //                                         type="text"
// //                                         id="cameraPort"
// //                                         placeholder="Enter port number"
// //                                         value={editForm.portNumber}
// //                                         onChange={(e) => handleEditFormChange('portNumber', e.target.value)}
// //                                         // Remove the invalid prop that was disabling the field
// //                                         // invalid={!editForm.portNumber.trim()}
// //                                         disabled // This field should be disabled as per your requirement
// //                                     />
// //                                     <small className="text-muted">
// //                                         Default: {editingCamera.portNumber}
// //                                     </small>
// //                                 </FormGroup>

// //                                 {/* Camera Preview */}
// //                                 <FormGroup>
// //                                     <Label>Camera Preview</Label>
// //                                     <div className="border rounded p-2" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
// //                                         {editingCamera.deviceId ? (
// //                                             <Webcam
// //                                                 style={{ maxWidth: '100%', maxHeight: '100%' }}
// //                                                 videoConstraints={{
// //                                                     width: 640,
// //                                                     height: 480,
// //                                                     deviceId: { exact: editingCamera.deviceId }
// //                                                 }}
// //                                                 audio={false}
// //                                             />
// //                                         ) : (
// //                                             <div className="text-muted">
// //                                                 <i className="mdi mdi-camera-off" style={{ fontSize: '2rem' }}></i>
// //                                                 <p>Camera not available</p>
// //                                             </div>
// //                                         )}
// //                                     </div>
// //                                 </FormGroup>
// //                             </Form>
// //                         )}
// //                     </ModalBody>
// //                     <ModalFooter>
// //                         <Button color="secondary" onClick={() => setShowEditModal(false)}>
// //                             Cancel
// //                         </Button>
// //                         <Button
// //                             color="primary"
// //                             onClick={handleSaveEditedCamera}
// //                             disabled={!editForm.name.trim()} // Only disable save if name is empty
// //                         >
// //                             Save Camera
// //                         </Button>
// //                     </ModalFooter>
// //                 </Modal>
// //             </Container>
// //         </div>
// //     );
// // };

// // // CameraSetPosition.propTypes = {
// //     // Add any prop types if needed
// //     CameraSetPosition.propTypes = {
// //   camera: PropTypes.shape({
// //     id: PropTypes.string,
// //     pos_no: PropTypes.number,
// //     isError: PropTypes.bool,
// //     title: PropTypes.string,
// //     errorMessage: PropTypes.string,
// //     portNumber: PropTypes.string,
// //     deviceId: PropTypes.string,
// //   }),
// //   index: PropTypes.number,
// // };
// // // };

// // export default CameraSetPosition;



