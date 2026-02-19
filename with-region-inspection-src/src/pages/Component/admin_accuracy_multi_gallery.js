import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Card, CardBody, Modal, ModalBody } from 'reactstrap';
import PropTypes from 'prop-types';
import urlSocket from './urlSocket';
import { imageUrl } from 'context/urls';
console.log('imageUrl', imageUrl);
import { useCallback } from 'react';
import { Popconfirm, Image, Slider, Tooltip, Spin, Input } from 'antd';
import Swal from 'sweetalert2';

const CustomToast = ({ message, type, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        isVisible && (
            <div
                className={`toast ${type === 'error' ? 'toast-error' : 'toast-success'
                    } show`}
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    maxWidth: '350px',
                    zIndex: '9999',
                    borderRadius: '8px',
                    padding: '15px 20px',
                    backgroundColor: type === 'error' ? '#ef4444' : '#10b981',
                    color: 'white',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    opacity: 0.95,
                    transition: 'opacity 0.3s ease-in-out',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    border: '1px solid',
                    borderColor: type === 'error' ? '#dc2626' : '#059669'
                }}
            >
                <span>{message}</span>
                <button
                    onClick={() => {
                        setIsVisible(false);
                        onClose();
                    }}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontSize: '20px',
                        cursor: 'pointer',
                        marginLeft: 'auto',
                        padding: '0 5px'
                    }}
                >
                    ×
                </button>
            </div>
        )
    );
};

CustomToast.propTypes = {
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error']).isRequired,
    onClose: PropTypes.func.isRequired
};



const StageCameraGallery = ({
    compCode,
    compName,
    refreshKey,
    captureProgress,
    setCaptureProgress,
    stages, // Now receiving complete stages array
    captureLimit,
    setRefreshKey,
    completedCamerasState
}) => {
    const [galleryData, setGalleryData] = useState([]);
    const [stagesList, setStagesList] = useState([]);
    const [selectedStage, setSelectedStage] = useState(null);
    const [selectedCamera, setSelectedCamera] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]);
    const [toastMessage, setToastMessage] = useState(null);
    const [toastType, setToastType] = useState('success');

    console.log('completedCameras', completedCamerasState)

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const res = await urlSocket.post('/get_admin_accuracy_images', {
                    comp_code: compCode,
                    comp_name: compName
                });

                const data = res.data.gallery_data || [];
                const completedCameraKeys = completedCamerasState.map(
                    cam => `${cam.stage_name}_${cam.label}`
                );

                const filteredData = data.filter(item =>
                    completedCameraKeys.includes(`${item.stage_name}_${item.camera_label}`)
                );




                setGalleryData(filteredData);

                // Extract unique stages for buttons
                const uniqueStages = [
                    ...new Map(
                        data.map(img => [
                            img.stage_code,
                            { stage_name: img.stage_name, stage_code: img.stage_code }
                        ])
                    ).values()
                ];
                setStagesList(uniqueStages);

                // ✅ Update capture progress from DB (using capture_count field)
                const counts = {};
                data.forEach(item => {
                    const key = `${item.stage_name}_${item.camera_label}`;
                    // Use capture_count from DB if available, otherwise count datasets
                    counts[key] = item.capture_count || item.datasets?.length || 0;
                });

                // Only update if there are actual counts
                if (Object.keys(counts).length > 0) {
                    setCaptureProgress(prev => ({
                        ...prev,
                        ...counts
                    }));
                    console.log('✅ Gallery updated counts from DB:', counts);
                }
            } catch (err) {
                console.error('❌ Error fetching gallery:', err);
            }
        };

        if (compCode && compName) fetchGallery();
    }, [compCode, compName, refreshKey]);

    const getFullImageUrl = path =>
        path ? imageUrl + path.replace(/\\/g, '/') : '';

    const filteredStageImages = selectedStage
        ? galleryData.filter(img => img.stage_code === selectedStage.stage_code)
        : [];

    const filteredCameraImages = selectedCamera
        ? filteredStageImages.filter(
            img => img.camera_label === selectedCamera.camera_label
        )
        : [];

    // Helper function to get the progress key
    const getProgressKey = (stageName, cameraLabel) => {
        return `${stageName}_${cameraLabel}`;
    };

    // Select All per camera
    const handleSelectAll = checked => {
        if (!selectedCamera) return;
        const allPaths = filteredCameraImages.flatMap(cam =>
            cam.datasets.map(img => img.insp_local_path)
        );
        setSelectedImages(checked ? allPaths : []);
    };

    const handleCheckboxToggle = path => {
        setSelectedImages(prev =>
            prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
        );
    };

    // 🧹 Delete Single Image (using backend counts)
    const handleDeleteImage = async imgPath => {
        if (!selectedCamera || !selectedStage) return;

        const key = getProgressKey(
            selectedStage.stage_name,
            selectedCamera.camera_label
        );

        try {
            const res = await urlSocket.post('/admin_accuracy_delete_images', {
                comp_code: compCode,
                comp_name: compName,
                image_paths: [imgPath]
            });

            const { deleted_images = [], updated_counts = {}, message } = res.data;

            if (deleted_images.length === 0) {
                setToastMessage('No matching image found');
                setToastType('warning');
                return;
            }

            // Update gallery data
            setGalleryData(prev =>
                prev.map(cam =>
                    cam.camera_label === selectedCamera.camera_label &&
                        cam.stage_code === selectedStage.stage_code
                        ? {
                            ...cam,
                            datasets: cam.datasets.filter(
                                d => !deleted_images.includes(d.insp_local_path)
                            ),
                            capture_count:
                                (cam.capture_count || cam.datasets.length) -
                                deleted_images.length
                        }
                        : cam
                )
            );

            setSelectedImages(prev => prev.filter(p => !deleted_images.includes(p)));

            // Update progress counts from backend response
            if (updated_counts && Object.keys(updated_counts).length > 0) {
                // setCaptureProgress(prev => ({
                //   ...prev,
                //   ...updated_counts
                // }));
                setCaptureProgress(prev => ({
                    ...prev,
                    [key]: Math.max(0, (prev[key] || 0) - deleted_images.length)
                }));
            } else {
                // fallback safe decrement
                setCaptureProgress(prev => ({
                    ...prev,
                    [key]: Math.max(0, (prev[key] || 0) - deleted_images.length)
                }));
            }

            setToastMessage(message || 'Image deleted successfully');
            setToastType('success');
        } catch (err) {
            console.error('❌ Error deleting image:', err);
            setToastMessage('Failed to delete image');
            setToastType('error');
        }
    };

    // 🧹 Delete Multiple Selected Images (using backend counts)
    const handleDeleteSelected = async () => {
        if (!selectedCamera || !selectedStage || selectedImages.length === 0)
            return;

        const key = getProgressKey(
            selectedStage.stage_name,
            selectedCamera.camera_label
        );

        const deleteCount = selectedImages.length;

        const result = await Swal.fire({
            title: `Delete ${deleteCount} image(s)?`,
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) return;

        try {
            const res = await urlSocket.post('/admin_accuracy_delete_images', {
                comp_code: compCode,
                comp_name: compName,
                image_paths: selectedImages
            });

            const { deleted_images = [], updated_counts = {}, message } = res.data;

            if (deleted_images.length === 0) {
                setToastMessage('No matching images found');
                setToastType('warning');
                return;
            }

            // Update gallery data
            setGalleryData(prev => {
                // Create a deep copy reference to ensure re-render
                const updated = prev.map(cam => {
                    if (
                        cam.camera_label === selectedCamera.camera_label &&
                        cam.stage_code === selectedStage.stage_code
                    ) {
                        const newDatasets = cam.datasets.filter(
                            d => !deleted_images.includes(d.insp_local_path)
                        );
                        return {
                            ...cam,
                            datasets: [...newDatasets], // new reference
                            capture_count: newDatasets.length
                        };
                    }
                    return { ...cam }; // ensure new reference for all
                });
                return [...updated]; // new reference for galleryData
            });
            console.log(
                'deleted_images = [], updated_counts = {},',
                deleted_images,
                updated_counts
            );

            setSelectedImages([]);

            // Update capture progress counts from backend
            if (updated_counts && Object.keys(updated_counts).length > 0) {
                console.log('iamifpart');
                // setCaptureProgress(prev => ({
                //   ...prev,
                //   ...updated_counts
                // }));
                setCaptureProgress(prev => ({
                    ...prev,
                    [key]: Math.max(0, (prev[key] || 0) - deleted_images.length)
                }));
            } else {
                console.log('Iamelsepart');
                setCaptureProgress(prev => ({
                    ...prev,
                    [key]: Math.max(0, (prev[key] || 0) - deleted_images.length)
                }));
            }

            setToastMessage(
                message || `${deleted_images.length} image(s) deleted successfully`
            );
            setToastType('success');
        } catch (err) {
            console.error('❌ Error deleting selected images:', err);
            setToastMessage('Failed to delete selected images');
            setToastType('error');
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                padding: '1rem'
            }}
        >
            {/* Page Title */}
            <h3 style={{ fontWeight: 600, fontSize: 'clamp(18px, 2vw, 22px)' }}>
                Remote Gallery
            </h3>

            {/* Stage Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {stagesList.map(stage => (
                    <Button
                        key={stage.stage_code}
                        color={
                            selectedStage?.stage_code === stage.stage_code
                                ? 'primary'
                                : 'secondary'
                        }
                        onClick={() => {
                            setSelectedStage(stage);
                            setSelectedCamera(null);
                            setSelectedImages([]);
                        }}
                        style={{
                            fontSize: 'clamp(12px, 1.2vw, 14px)',
                            padding: '0.4rem 0.8rem'
                        }}
                    >
                        {stage.stage_name}
                    </Button>
                ))}
            </div>

            {/* Camera Buttons */}
            {selectedStage && (
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        marginTop: '0.75rem'
                    }}
                >
                    {[
                        ...new Map(
                            filteredStageImages.map(cam => [cam.camera_label, cam])
                        ).values()
                    ].map(cam => (
                        <Button
                            key={cam.camera_label}
                            color={
                                selectedCamera?.camera_label === cam.camera_label
                                    ? 'primary'
                                    : 'secondary'
                            }
                            onClick={() => {
                                setSelectedCamera(cam);
                                setSelectedImages([]);
                            }}
                            style={{
                                fontSize: 'clamp(12px, 1.2vw, 14px)',
                                padding: '0.4rem 0.8rem'
                            }}
                        >
                            {cam.camera_label}
                        </Button>
                    ))}
                </div>
            )}

            {/* Gallery Section */}
            {selectedCamera && (
                <div
                    style={{
                        marginTop: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                    }}
                >
                    {/* Header with Select All and Delete */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '0.5rem'
                        }}
                    >
                        <h5 style={{ margin: 0, fontSize: 'clamp(14px, 1.5vw, 16px)' }}>
                            Camera:{' '}
                            <span style={{ color: '#2563eb' }}>
                                {selectedCamera.camera_label}
                            </span>
                        </h5>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                flexWrap: 'wrap'
                            }}
                        >
                            <label
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    whiteSpace: 'nowrap',
                                    fontSize: 'clamp(12px, 1vw, 14px)'
                                }}
                            >
                                <Input
                                    type='checkbox'
                                    checked={
                                        filteredCameraImages.flatMap(cam => cam.datasets).length >
                                        0 &&
                                        selectedImages.length ===
                                        filteredCameraImages.flatMap(cam => cam.datasets).length
                                    }
                                    onChange={e => handleSelectAll(e.target.checked)}
                                />
                                Select All
                            </label>

                            <Button
                                color='danger'
                                size='sm'
                                disabled={selectedImages.length === 0}
                                onClick={handleDeleteSelected}
                                style={{
                                    fontSize: 'clamp(12px, 1vw, 14px)',
                                    padding: '0.35rem 0.75rem'
                                }}
                            >
                                🗑️ Delete Selected
                            </Button>
                        </div>
                    </div>

                    {/* Image Grid */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: '0.5rem'
                        }}
                    >
                        {filteredCameraImages
                            .flatMap(cam => cam.datasets)
                            .map((img, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        position: 'relative',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        backgroundColor: '#fff',
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    {/* Delete Button */}
                                    <Popconfirm
                                        title='Do you really want to delete this image?'
                                        onConfirm={() => handleDeleteImage(img.insp_local_path)}
                                        okText='Yes'
                                        cancelText='No'
                                    >
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: '6px',
                                                right: '6px',
                                                background: 'rgba(0,0,0,0.6)',
                                                color: 'white',
                                                borderRadius: '50%',
                                                width: '22px',
                                                height: '22px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '13px',
                                                cursor: 'pointer',
                                                zIndex: 5
                                            }}
                                            title='Delete Image'
                                        >
                                            🗑️
                                        </div>
                                    </Popconfirm>

                                    {/* Checkbox */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '6px',
                                            left: '6px',
                                            zIndex: 5
                                        }}
                                    >
                                        <Input
                                            type='checkbox'
                                            checked={selectedImages.includes(img.insp_local_path)}
                                            onChange={() => handleCheckboxToggle(img.insp_local_path)}
                                        />
                                    </div>

                                    {/* Image */}
                                    <div
                                        style={{
                                            width: '100%',
                                            aspectRatio: '4/3',
                                            backgroundColor: '#f3f4f6'
                                        }}
                                    >
                                        <Image
                                            src={getFullImageUrl(img.insp_local_path)}
                                            alt={img.filename}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                            onError={e =>
                                            (e.target.src =
                                                'https://via.placeholder.com/300x225?text=No+Image')
                                            }
                                        />
                                    </div>

                                    {/* Image Info */}
                                    <div
                                        style={{
                                            padding: '0.5rem 0.7rem',
                                            fontSize: '0.8rem',
                                            color: '#374151',
                                            backgroundColor: '#fafafa'
                                        }}
                                    >
                                        <div
                                            style={{
                                                fontWeight: 500,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}
                                        >
                                            {img.filename}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '0.7rem',
                                                color: '#6b7280',
                                                marginTop: '0.25rem'
                                            }}
                                        >
                                            {new Date(img.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            <div
                className='toast-container'
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: '9999',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }}
            >
                {toastMessage && (
                    <CustomToast
                        message={toastMessage}
                        type={toastType}
                        onClose={() => setToastMessage(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default StageCameraGallery;

StageCameraGallery.propTypes = {
    compCode: PropTypes.string,
    compName: PropTypes.string,
    stageName: PropTypes.string,
    stageCode: PropTypes.string,
    refreshKey: PropTypes.any,
    captureProgress: PropTypes.any,
    setCaptureProgress: PropTypes.any,
    stages: PropTypes.any,
    captureLimit: PropTypes.any,
    setRefreshKey: PropTypes.any,
    completedCamerasState: PropTypes.any
};
