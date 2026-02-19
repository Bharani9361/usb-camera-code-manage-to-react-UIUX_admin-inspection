import React, { useEffect, useRef, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import {
    Container,
    Button,
    Col,
    Row,
    Card,
    CardBody,
    Input,
    Spinner,
    Modal,
    ModalHeader,
    ModalBody,
    Toast,
    ToastBody,
    ToastHeader
} from "reactstrap";

import MetaTags from "react-meta-tags";
import { v4 as uuidv4 } from "uuid";
import urlSocket from "./urlSocket";
import WebcamCapture from "../WebcamCustom/WebcamCapture";
import PropTypes from "prop-types";
import ImageUrl from "./imageUrl";
import { imageUrl } from 'context/urls';

import SweetAlert from "react-bootstrap-sweetalert";
import Swal from "sweetalert2";

// New separate component for the gallery
const ImageGallery = ({
    showGallery,
    galleryImagesByCamera,
    selectedCameraLabel,
    setSelectedCameraLabel,
    selectedImages,
    setSelectedImages,
    loadingGallery,
    deletingImages,
    totalImagesCount,
    selectedStage,
    fetchGalleryImages,
    handleSelectAll,
    handleDeleteSelected,
    selectedCameraImages,
    handleImagePreview,
    handleImageSelect,
    handleDelete,
    previewModal,
    setPreviewModal,
    previewImage,
}) => {
    if (!showGallery) return null;

    return (
        <Col xs={12} lg={5} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <div
                style={{
                    backgroundColor: "#fff",
                    borderRadius: "10px",
                    padding: "16px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div style={{ marginBottom: "16px" }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "12px",
                        }}
                    >
                        <h6 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#111827" }}>
                            <i className="fa fa-images me-2" style={{ color: "#6366f1" }} />
                            Image Gallery ({totalImagesCount})
                        </h6>
                        {selectedStage && (
                            <div style={{ fontSize: "14px", color: "#374151", fontWeight: 500 }}>
                                Stage: {selectedStage.stage_name} ({selectedStage.stage_code})
                            </div>
                        )}
                        <div style={{ display: "flex", gap: "6px" }}>
                            <Button
                                size="sm"
                                onClick={fetchGalleryImages}
                                disabled={loadingGallery}
                                style={{
                                    backgroundColor: "#6366f1",
                                    border: "none",
                                    borderRadius: "6px",
                                    padding: "4px 12px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    color: "#fff",
                                }}
                            >
                                <i className={`fa fa-sync-alt me-1 ${loadingGallery ? "fa-spin" : ""}`} />
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {Object.keys(galleryImagesByCamera).length > 0 && (
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                            {Object.keys(galleryImagesByCamera).map((cameraLabel) => (
                                <button
                                    key={cameraLabel}
                                    onClick={() => {
                                        setSelectedCameraLabel(cameraLabel);
                                        setSelectedImages([]);
                                    }}
                                    style={{
                                        padding: "6px 12px",
                                        borderRadius: "6px",
                                        border:
                                            selectedCameraLabel === cameraLabel
                                                ? "2px solid #6366f1"
                                                : "1px solid #e5e7eb",
                                        backgroundColor:
                                            selectedCameraLabel === cameraLabel ? "#eef2ff" : "#fff",
                                        color: selectedCameraLabel === cameraLabel ? "#6366f1" : "#6b7280",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                    }}
                                >
                                    {cameraLabel} ({galleryImagesByCamera[cameraLabel].length})
                                </button>
                            ))}
                        </div>
                    )}

                    {selectedImages.length > 0 && (
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                            <Button
                                size="sm"
                                color="info"
                                onClick={handleSelectAll}
                                style={{
                                    borderRadius: "6px",
                                    padding: "4px 12px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                }}
                            >
                                <i className="fa fa-check-double me-1" />
                                {selectedImages.length === selectedCameraImages.length
                                    ? "Deselect All"
                                    : "Select All"}
                            </Button>

                            <Button
                                size="sm"
                                color="danger"
                                onClick={handleDeleteSelected}
                                disabled={deletingImages}
                                style={{
                                    borderRadius: "6px",
                                    padding: "4px 12px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                }}
                            >
                                <i className="fa fa-trash me-1" />
                                Delete ({selectedImages.length})
                            </Button>

                            <Button
                                size="sm"
                                color="secondary"
                                onClick={() => setSelectedImages([])}
                                style={{
                                    borderRadius: "6px",
                                    padding: "4px 12px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                }}
                            >
                                <i className="fa fa-times me-1" />
                                Clear
                            </Button>
                        </div>
                    )}
                </div>

                <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
                    {loadingGallery || deletingImages ? (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "100%",
                                color: "#9ca3af",
                            }}
                        >
                            <Spinner color="primary" />
                            <p style={{ fontSize: "14px", fontWeight: "500", marginTop: "12px" }}>
                                {deletingImages ? "Deleting images..." : "Loading images..."}
                            </p>
                        </div>
                    ) : selectedCameraImages.length === 0 ? (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "100%",
                                color: "#9ca3af",
                            }}
                        >
                            <i
                                className="fa fa-images"
                                style={{ fontSize: "64px", marginBottom: "16px", opacity: 0.3 }}
                            />
                            <p style={{ fontSize: "14px", fontWeight: "500" }}>
                                {selectedCameraLabel
                                    ? `No images for ${selectedCameraLabel}`
                                    : "No images captured yet"}
                            </p>
                            <p style={{ fontSize: "12px" }}>Click Capture All Cameras to start</p>
                        </div>
                    ) : (
                        <Row className="g-3">
                            {selectedCameraImages.map((image) => {
                                const isSelected = selectedImages.some((img) => img.id === image.id);
                                return (
                                    <Col key={image.id} xs={6} md={4}>
                                        <div
                                            style={{
                                                position: "relative",
                                                borderRadius: "8px",
                                                overflow: "hidden",
                                                border: isSelected
                                                    ? "3px solid #6366f1"
                                                    : "1px solid #e5e7eb",
                                                cursor: "pointer",
                                                transition: "all 0.2s ease",
                                            }}
                                            onClick={() => handleImagePreview(null, image)}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = "scale(1.05)";
                                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = "scale(1)";
                                                e.currentTarget.style.boxShadow = "none";
                                            }}
                                        >
                                            <img
                                                src={`${imageUrl}${image.local_path}`}
                                                alt={image.cameraLabel}
                                                style={{
                                                    width: "100%",
                                                    height: "120px",
                                                    objectFit: "cover",
                                                }}
                                                onError={(e) => {
                                                    console.error("Image not found:", e.target.src);
                                                    e.target.src = "/fallback.png";
                                                }}
                                            />

                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleImageSelect(image);
                                                }}
                                                style={{
                                                    position: "absolute",
                                                    top: "8px",
                                                    left: "8px",
                                                    width: "20px",
                                                    height: "20px",
                                                    borderRadius: "4px",
                                                    backgroundColor: isSelected ? "#6366f1" : "rgba(255,255,255,0.9)",
                                                    border: isSelected ? "2px solid #6366f1" : "2px solid #d1d5db",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    cursor: "pointer",
                                                    transition: "all 0.2s ease",
                                                }}
                                            >
                                                {isSelected && (
                                                    <i className="fa fa-check" style={{ color: "#fff", fontSize: "11px" }} />
                                                )}
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(e, image.filename, image.cameraLabel);
                                                }}
                                                style={{
                                                    position: "absolute",
                                                    top: "8px",
                                                    right: "8px",
                                                    backgroundColor: "rgba(239,68,68,0.9)",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    color: "#fff",
                                                    width: "24px",
                                                    height: "24px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    cursor: "pointer",
                                                    fontSize: "13px",
                                                    transition: "all 0.2s ease",
                                                }}
                                            >
                                                <i className="fa fa-times" />
                                            </button>

                                            <div
                                                style={{
                                                    position: "absolute",
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    background: "rgba(0,0,0,0.7)",
                                                    padding: "8px 8px 4px",
                                                }}
                                            >
                                                <p
                                                    style={{
                                                        margin: 0,
                                                        fontSize: "11px",
                                                        fontWeight: "600",
                                                        color: "#fff",
                                                        textOverflow: "ellipsis",
                                                        overflow: "hidden",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {image.filename}
                                                </p>
                                            </div>
                                        </div>
                                    </Col>
                                );
                            })}
                        </Row>
                    )}
                </div>
            </div>

            <Modal isOpen={previewModal} toggle={() => setPreviewModal(false)} size="lg" centered>
                <ModalHeader toggle={() => setPreviewModal(false)}>Image Preview</ModalHeader>
                <ModalBody style={{ padding: 0 }}>
                    {previewImage && (
                        <div>
                            <img
                                src={`${imageUrl}${previewImage.local_path}`}
                                alt={previewImage.cameraLabel}
                                style={{
                                    width: "100%",
                                    height: "auto",
                                    maxHeight: "70vh",
                                    objectFit: "contain",
                                }}
                                onError={(e) => {
                                    console.error("Image not found:", e.target.src);
                                    e.target.src = "/fallback.png";
                                }}
                            />
                            <div style={{ padding: "16px", backgroundColor: "#f9fafb" }}>
                                <h6 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "#111827" }}>
                                    {previewImage.cameraLabel}
                                </h6>
                                <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280" }}>
                                    <i className="fa fa-file me-1" />
                                    {previewImage.filename}
                                </p>
                                <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280" }}>
                                    <i className="fa fa-clock me-1" />
                                    {new Date(previewImage.timestamp).toLocaleString()}
                                </p>
                                {previewImage.width && previewImage.height && (
                                    <p style={{ margin: "0", fontSize: "12px", color: "#6b7280" }}>
                                        <i className="fa fa-image me-1" />
                                        {previewImage.width} × {previewImage.height}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </ModalBody>
            </Modal>
        </Col>
    );
};
ImageGallery.propTypes = {
    showGallery: PropTypes.bool.isRequired,
    galleryImagesByCamera: PropTypes.objectOf(
        PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                filename: PropTypes.string.isRequired,
                local_path: PropTypes.string.isRequired,
                cameraLabel: PropTypes.string.isRequired,
                timestamp: PropTypes.string.isRequired,
                width: PropTypes.number,
                height: PropTypes.number,
            })
        )
    ).isRequired,
    selectedCameraLabel: PropTypes.string,
    setSelectedCameraLabel: PropTypes.func.isRequired,
    selectedImages: PropTypes.arrayOf(PropTypes.object).isRequired,
    setSelectedImages: PropTypes.func.isRequired,
    loadingGallery: PropTypes.bool.isRequired,
    deletingImages: PropTypes.bool.isRequired,
    totalImagesCount: PropTypes.number.isRequired,
    selectedStage: PropTypes.shape({
        stage_name: PropTypes.string.isRequired,
        stage_code: PropTypes.string.isRequired,
    }).isRequired,
    fetchGalleryImages: PropTypes.func.isRequired,
    handleSelectAll: PropTypes.func.isRequired,
    handleDeleteSelected: PropTypes.func.isRequired,
    selectedCameraImages: PropTypes.arrayOf(PropTypes.object).isRequired,
    handleImagePreview: PropTypes.func.isRequired,
    handleImageSelect: PropTypes.func.isRequired,
    handleDelete: PropTypes.func.isRequired,
    previewModal: PropTypes.bool.isRequired,
    setPreviewModal: PropTypes.func.isRequired,
    previewImage: PropTypes.shape({
        local_path: PropTypes.string,
        cameraLabel: PropTypes.string,
        filename: PropTypes.string,
        timestamp: PropTypes.string,
        width: PropTypes.number,
        height: PropTypes.number,
    }),
};

export default ImageGallery; 