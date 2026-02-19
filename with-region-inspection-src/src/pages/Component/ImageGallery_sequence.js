// src/pages/Component/ImageGallery_multi.js
import React from "react";
import PropTypes from "prop-types";
import {
    Row,
    Col,
    Button,
    Spinner,
    Modal,
    ModalHeader,
    ModalBody,
} from "reactstrap";
import { imageUrl } from 'context/urls';
// adjust if needed

const ImageGallery_sequence = ({
    showGallery,
    stages,
    selectedStage,
    setSelectedStage,
    galleryImages,
    loadingGallery,
    selectedImages,
    setSelectedImages,
    previewImage,
    setPreviewImage,
    showPreview,
    setShowPreview,
    loadGalleryImages,
    handleDeleteImage,
    handleBulkDelete,
    selectedCameraLabel,
}) => {
    if (!showGallery) return null;

    const byCam = {};
    galleryImages.forEach((img) => {
        const k = (img.camera_label || "").trim();
        if (!byCam[k]) byCam[k] = [];
        byCam[k].push(img);
    });
    const shown = selectedCameraLabel && byCam[selectedCameraLabel]
        ? byCam[selectedCameraLabel]
        : galleryImages;

    const allIds = shown.map((i) => i.filename);
    const allSel = allIds.every((id) => selectedImages.has(id));

    return (
        <Col lg={6}>
            <div className="d-flex mb-3" style={{ borderBottom: "2px solid #e9ecef" }}>
                {stages.map((st, i) => (
                    <div
                        key={st._id?.$oid || i}
                        className={`stage-tab ${selectedStage === i ? "active" : ""}`}
                        onClick={() => setSelectedStage(i)}
                        style={{
                            padding: "10px 20px",
                            cursor: "pointer",
                            borderBottom:
                                selectedStage === i ? "3px solid #3b82f6" : "none",
                            fontWeight: selectedStage === i ? 600 : 400,
                            color: selectedStage === i ? "#3b82f6" : "#64748b",
                        }}
                    >
                        {st.stage_name}
                    </div>
                ))}
            </div>

            <div
                style={{
                    background: "#fff",
                    borderRadius: 10,
                    padding: 16,
                    boxShadow: "0 2px 6px rgba(0,0,0,.1)",
                    height: "calc(100vh - 200px)",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div style={{ marginBottom: 16 }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 12,
                        }}
                    >
                        <h6
                            style={{
                                margin: 0,
                                fontSize: 16,
                                fontWeight: 600,
                                color: "#111827",
                            }}
                        >
                            Image Gallery ({galleryImages.length})
                        </h6>
                        <Button
                            size="sm"
                            onClick={() => loadGalleryImages(selectedStage)}
                            disabled={loadingGallery}
                            style={{
                                background: "#6366f1",
                                border: "none",
                                borderRadius: 6,
                                padding: "4px 12px",
                                fontSize: 12,
                                fontWeight: 500,
                                color: "#fff",
                            }}
                        >
                            {loadingGallery ? "Loading..." : "Refresh"}
                        </Button>
                    </div>

                    {selectedImages.size > 0 && (
                        <div
                            style={{
                                display: "flex",
                                gap: 6,
                                flexWrap: "wrap",
                                marginBottom: 12,
                            }}
                        >
                            <Button
                                size="sm"
                                color="info"
                                onClick={() =>
                                    allSel
                                        ? setSelectedImages(new Set())
                                        : setSelectedImages(new Set(allIds))
                                }
                            >
                                {allSel ? "Deselect All" : "Select All"}
                            </Button>
                            <Button
                                size="sm"
                                color="danger"
                                onClick={handleBulkDelete}
                            >
                                Delete ({selectedImages.size})
                            </Button>
                            <Button
                                size="sm"
                                color="secondary"
                                onClick={() => setSelectedImages(new Set())}
                            >
                                Clear
                            </Button>
                        </div>
                    )}
                </div>

                <div style={{ flex: 1, overflowY: "auto" }}>
                    {loadingGallery ? (
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
                            <p style={{ fontSize: 14, marginTop: 12 }}>Loading images...</p>
                        </div>
                    ) : shown.length === 0 ? (
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
                            <p style={{ fontSize: 14, fontWeight: 500 }}>
                                {selectedCameraLabel
                                    ? `No images for ${selectedCameraLabel}`
                                    : "No images captured yet"}
                            </p>
                        </div>
                    ) : (
                        <Row className="g-3">
                            {shown.map((img) => {
                                const sel = selectedImages.has(img.filename);
                                const highlight =
                                    !selectedImages.size &&
                                    previewImage?.filename === img.filename;

                                return (
                                    <Col key={img.filename} xs={6} md={4}>
                                        <div
                                            style={{
                                                position: "relative",
                                                borderRadius: 8,
                                                overflow: "hidden",
                                                border: sel
                                                    ? "3px solid #6366f1"
                                                    : highlight
                                                        ? "3px solid #10b981"
                                                        : "1px solid #e5e7eb",
                                                cursor: "pointer",
                                                transition: "all .2s",
                                            }}
                                            onClick={() => {
                                                setPreviewImage(img);
                                                setShowPreview(true);
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = "scale(1.05)";
                                                e.currentTarget.style.boxShadow =
                                                    "0 4px 12px rgba(0,0,0,.15)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = "scale(1)";
                                                e.currentTarget.style.boxShadow = "none";
                                            }}
                                        >
                                            <img
                                                src={`${imageUrl}${img.insp_local_path}`}
                                                alt={img.camera_label}
                                                style={{ width: "100%", height: 120, objectFit: "cover" }}
                                                onError={(e) => (e.target.src = "/fallback.png")}
                                            />

                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const copy = new Set(selectedImages);
                                                    copy.has(img.filename)
                                                        ? copy.delete(img.filename)
                                                        : copy.add(img.filename);
                                                    setSelectedImages(copy);
                                                }}
                                                style={{
                                                    position: "absolute",
                                                    top: 6,
                                                    left: 6,
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: 4,
                                                    background: sel
                                                        ? "#6366f1"
                                                        : "rgba(255,255,255,.85)",
                                                    border: `2px solid ${sel ? "#6366f1" : "#d1d5db"}`,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                {sel && (
                                                    <i
                                                        className="fa fa-check"
                                                        style={{ color: "#fff", fontSize: 11 }}
                                                    />
                                                )}
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteImage(img);
                                                }}
                                                style={{
                                                    position: "absolute",
                                                    top: 6,
                                                    right: 6,
                                                    background: "rgba(239,68,68,.9)",
                                                    border: "none",
                                                    borderRadius: "50%",
                                                    width: 26,
                                                    height: 26,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <i
                                                    className="fa fa-times"
                                                    style={{ color: "#fff", fontSize: 13 }}
                                                />
                                            </button>

                                            {/* Filename overlay */}
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    background: "rgba(0,0,0,.7)",
                                                    padding: "6px 6px 3px",
                                                }}
                                            >
                                                <p
                                                    style={{
                                                        margin: 0,
                                                        fontSize: 10,
                                                        fontWeight: 600,
                                                        color: "#fff",
                                                        textOverflow: "ellipsis",
                                                        overflow: "hidden",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {img.filename}
                                                </p>
                                            </div>
                                        </div>
                                    </Col>
                                );
                            })}
                        </Row>
                    )}
                </div>

                {previewImage && selectedImages.size === 0 && (
                    <div
                        style={{
                            marginTop: 16,
                            padding: 10,
                            background: "#f9fafb",
                            borderRadius: 8,
                            border: "1px solid #e5e7eb",
                            fontSize: 12,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: 4,
                            }}
                        >
                            <strong>{previewImage.camera_label}</strong>
                            <button
                                onClick={() => setPreviewImage(null)}
                                style={{ background: "none", border: "none", fontSize: 16 }}
                            >
                                ×
                            </button>
                        </div>
                        <div style={{ color: "#6b7280" }}>
                            <div>
                                <strong>File:</strong> {previewImage.filename}
                            </div>
                            <div>
                                <strong>Time:</strong>{" "}
                                {new Date(previewImage.timestamp).toLocaleString()}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Modal isOpen={showPreview} toggle={() => setShowPreview(false)} size="lg">
                <ModalHeader toggle={() => setShowPreview(false)}>
                    {previewImage?.camera_label}
                </ModalHeader>
                <ModalBody className="text-center">
                    {previewImage && (
                        <>
                            <img
                                src={`${imageUrl}${previewImage.insp_local_path}`}
                                alt={previewImage.camera_label}
                                style={{ maxWidth: "100%", maxHeight: "70vh" }}
                            />
                            <div className="mt-3 text-start">
                                <p>
                                    <strong>Filename:</strong> {previewImage.filename}
                                </p>
                                <p>
                                    <strong>Camera:</strong> {previewImage.camera_label}
                                </p>
                                <p>
                                    <strong>Timestamp:</strong>{" "}
                                    {new Date(previewImage.timestamp).toLocaleString()}
                                </p>
                                <p>
                                    <strong>Dimensions:</strong> {previewImage.width} x{" "}
                                    {previewImage.height}
                                </p>
                            </div>
                        </>
                    )}
                </ModalBody>
            </Modal>
        </Col>
    );
};


ImageGallery_sequence.propTypes = {
    showGallery: PropTypes.bool.isRequired,
    stages: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.shape({ $oid: PropTypes.string }),
            stage_name: PropTypes.string.isRequired,
        })
    ).isRequired,
    selectedStage: PropTypes.number.isRequired,
    setSelectedStage: PropTypes.func.isRequired,
    galleryImages: PropTypes.arrayOf(
        PropTypes.shape({
            filename: PropTypes.string.isRequired,
            insp_local_path: PropTypes.string.isRequired,
            camera_label: PropTypes.string.isRequired,
            timestamp: PropTypes.string.isRequired,
            width: PropTypes.number,
            height: PropTypes.number,
        })
    ).isRequired,
    loadingGallery: PropTypes.bool.isRequired,
    selectedImages: PropTypes.instanceOf(Set).isRequired,
    setSelectedImages: PropTypes.func.isRequired,
    previewImage: PropTypes.shape({
        filename: PropTypes.string,
        insp_local_path: PropTypes.string,
        camera_label: PropTypes.string,
        timestamp: PropTypes.string,
        width: PropTypes.number,
        height: PropTypes.number,
    }),
    setPreviewImage: PropTypes.func.isRequired,
    showPreview: PropTypes.bool.isRequired,
    setShowPreview: PropTypes.func.isRequired,
    loadGalleryImages: PropTypes.func.isRequired,
    handleDeleteImage: PropTypes.func.isRequired,
    handleBulkDelete: PropTypes.func.isRequired,
    selectedCameraLabel: PropTypes.string,
};

ImageGallery_sequence.defaultProps = {
    previewImage: null,
    selectedCameraLabel: null,
};

export default ImageGallery_sequence;