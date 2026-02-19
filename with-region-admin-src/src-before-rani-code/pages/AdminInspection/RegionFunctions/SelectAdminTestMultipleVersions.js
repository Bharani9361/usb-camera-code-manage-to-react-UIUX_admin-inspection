
// console.log('perfect functinality - but ui implementation needed.')
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Modal, ModalHeader, ModalBody, ModalFooter,
    Button, Input, Label, FormGroup
} from 'reactstrap';

const SelectAdminTestMultipleVersions = ({ modalOpen, modelaccuracytest, toggleModal, closeModal, acctest, rectangles=[] }) => {
    console.log('rectangles003 ', rectangles);
    const [componentOnly, setComponentOnly] = useState(false);
    const [regionOnly, setRegionOnly] = useState(false);
    const [visibleModels, setVisibleModels] = useState([]);
    const [selectedVersions, setSelectedVersions] = useState([]);
    const [showVersionRequiredMsg, setShowVersionRequiredMsg] = useState(false);

    const [error, setError] = useState({});
    const [detectionType, setDetectionType] = useState(['ML', 'DL']);
    const [modalDetectionType, setModalDetectionType] = useState(null);
    const [modalSelectedRegions, setModalSelectedRegions] = useState([]);
    const [showValidationMsg, setShowValidationMsg] = useState(false);

    // Reset on open
    useEffect(() => {
        if (modalOpen) {
            setComponentOnly(false);
            setRegionOnly(false);
            setVisibleModels([]);
            setSelectedVersions([]);
        }
    }, [modalOpen]);

    // Filtering logic
    useEffect(() => {
        const filtered = modelaccuracytest.filter(model => {
            if (!componentOnly && !regionOnly) return false;
            if (regionOnly && !model.region_selection) return false;
            return true;
        }).map(model => {
            const draftVersions = model.trained_ver_list
                .map((ver, i) => ({ version: ver, status: model.version_status[i] }))
                .filter(v => v.status === 'Draft');
            return { ...model, draftVersions };
        });
        setVisibleModels(filtered);
    }, [componentOnly, regionOnly, modelaccuracytest]);

    // Handle version checkbox
    const handleVersionToggle = (modelId, modelName, version) => {
        const key = `${modelId}-${modelName}-${version}`;
        setSelectedVersions(prev => {
            const exists = prev.find(v => `${v.modelId}-${v.modelName}-${v.version}` === key);
            if (exists) return prev.filter(v => `${v.modelId}-${v.modelName}-${v.version}` !== key);
            return [...prev, { modelId, modelName, version }];
        });
        setShowVersionRequiredMsg(false);
    };

    // Submit handler
    const handleSubmit = () => {

        const filteredOutput = visibleModels.map(model => {
            const selected = selectedVersions.filter(v => v.modelId === model._id);
            if (selected.length === 0) return null;
            const { trained_ver_list, version_status, ...restOfModel } = model; // Destructure to exclude specific fields
            return {
                ...restOfModel, // Include all other fields from the model
                trained_ver_list: selected.map(v => v.version),
                version_status: selected.map(() => 'Draft')
            };
        }).filter(Boolean);

        if(filteredOutput.length === 0) {
            setShowVersionRequiredMsg(true);
            // return null;
        }
        
        else if (modalDetectionType === 'Smart Object Locator' && modalSelectedRegions.length === 0) {
            setShowValidationMsg(true);
        }
        else if (!modalDetectionType) {
            setError((prev) => ({
                ...prev,
                detection_type: 'Please select an object detection method.'
            }));
        }
        else {
            const result = {
                componentTest: componentOnly,
                regionTest: regionOnly,
                selectedData: filteredOutput,
                // OD and regions
                detection_type: modalDetectionType,
                regions: modalSelectedRegions
            };
            console.log(result, 'result');
            acctest(result);

            closeModal();
        }
    };

    const setComponentOnlyHandler = (value) => {
        setComponentOnly(value);
    }

    const setRegionOnlyHandler = (value) => {
        setRegionOnly(value);
        if(value) {
            // setDetectionType((prev) => [...prev, 'Smart Object Locator']);
            setModalSelectedRegions([]);
            setModalDetectionType(null);
        } else {
            // setDetectionType((prev) => prev.filter(type => type !== 'Smart Object Locator'));
            setModalSelectedRegions([]);
            setModalDetectionType(null);
        }
    }

    const handleObjectDetectionHandler = (value) => {
        setModalDetectionType(value);

        setError((prev) => {
            const newErrorState = { ...prev };
            delete newErrorState['detection_type'];
            return newErrorState;
        });
        
    }

    const handleRegionSelection = (e, region, idx) => {
        const isChecked = e.target.checked;
        setModalSelectedRegions((prev) => {
            if (isChecked) {
                return [...prev, region.name];
            } else {
                return prev.filter((r) => r !== region.name);
            }
        });

        setShowValidationMsg(false);
    }

    const isSubmitDisabled = (!componentOnly && !regionOnly) || selectedVersions.length === 0;

    return (
        <Modal isOpen={modalOpen} toggle={toggleModal} 
            size="md" 
            backdrop='static' keyboard={false}
        >
            <ModalBody>
                {/* <div className='d-flex justify-content-start align-items-center mb-3'>
                    <h5 className='fw-bold'>Select Versions for Admin Accuracy Test</h5>
                </div> */}
                <h6 className='fw-bold mb-3'>Select Versions for Admin Accuracy Test</h6>
                <div className="d-flex gap-4 mb-3" style={{ userSelect: 'none' }}>
                    <FormGroup check>
                        <Label check>
                            <Input
                                type="checkbox"
                                checked={componentOnly}
                                onChange={e => setComponentOnlyHandler(e.target.checked)}
                            />{' '}
                            Overall Image Testing
                        </Label>
                    </FormGroup>
                    <FormGroup check>
                        <Label check>
                            <Input
                                type="checkbox"
                                checked={regionOnly}
                                onChange={e => setRegionOnlyHandler(e.target.checked)}
                            />{' '}
                            Region-Wise Image Testing
                        </Label>
                    </FormGroup>
                </div>

                {(!componentOnly && !regionOnly) && (
                    <div className="text-danger">⚠️ Please select at least one filter option above.</div>
                )}

                {visibleModels.length === 0 && (componentOnly || regionOnly) && (
                    <div className="text-muted">No models available for the selected filters.</div>
                )}

                {visibleModels.map(model => (
                    <div key={model._id} className="mb-3 border-bottom pb-2">
                        <div className="d-flex justify-content-between align-items-center">
                            <strong>{model.comp_name} - {model.model_name}</strong>
                            {/* <Badge pill color={model.region_selection ? 'primary' : 'secondary'}>
                                {model.region_selection ? 'Region' : 'Component'}
                            </Badge> */}
                        </div>
                        {model.draftVersions.length === 0 ? (
                            <div className="text-warning small mt-1">No draft versions available</div>
                        ) : (
                            <div className="mb-1 mt-2 ps-3">
                                {model.draftVersions.map(v => (
                                    <div key={v.version}>
                                        <Label check key={v.version}>
                                            <Input
                                                type="checkbox"
                                                checked={!!selectedVersions.find(sel =>
                                                    sel.modelId === model._id && sel.modelName === model.model_name && sel.version === v.version
                                                )}
                                                onChange={() => handleVersionToggle(model._id, model.model_name, v.version)}
                                            />{' '}
                                            Version {v.version} (Draft)
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                {
                    showVersionRequiredMsg && (
                        <div className="text-danger">⚠️ Please select at least one version to proceed testing</div>
                    )
                }


                {/* Choose Object Detection Method */}
                <h6 className='fw-bold my-3'>Select Object Detection Mode</h6>
                {detectionType.map((type, i) => (
                    <FormGroup check key={i}>
                        <Label check>
                            <Input
                                type="radio"
                                name="detectMethod"
                                value={type}
                                checked={modalDetectionType === type}
                                onChange={(e) => handleObjectDetectionHandler(e.target.value)}
                            />{' '}
                            {type}
                        </Label>
                    </FormGroup>
                ))}
                {error?.detection_type && <div className="text-danger mt-3">{`*${error?.detection_type}`}</div>}

                {modalDetectionType === 'Smart Object Locator' && (
                    <div style={{ marginTop: '1rem' }}>
                        <div
                            style={{
                                backgroundColor: '#f1f1f1',
                                padding: '12px',
                                borderRadius: '5px',
                                border: '1px solid #ccc',
                                marginBottom: '10px'
                            }}
                        >
                            <p style={{ marginBottom: 4 }}>
                                This mode automatically locates components even if they are <strong>not in their fixed positions</strong>.
                                Useful when objects <strong>shift/move inside the test image</strong>.
                            </p>

                            <div className='p-2 rounded' style={{ backgroundColor: 'white', border: '1px solid #ccc' }}>
                                <p><strong>Select regions where movement might happen:</strong></p>

                                {rectangles.map((region, idx) => (
                                    <FormGroup check key={idx}>
                                        <Label check style={{ userSelect: 'none' }}>
                                            <Input
                                                type="checkbox"
                                                checked={modalSelectedRegions.includes(region.name)}
                                                onChange={(e) => handleRegionSelection(e, region, idx)}
                                            />{' '}
                                            {region.name}
                                        </Label>
                                    </FormGroup>
                                ))}

                                {/* Warning message */}
                                {showValidationMsg && (
                                    <div style={{ color: 'red', marginTop: 8 }}>
                                        {`*Please select at least one region for Smart Object Locator to work.`}
                                    </div>
                                )}
                            </div>
                            <p style={{ fontStyle: 'italic' }}>
                                You can uncheck regions where components always stay fixed.
                            </p>
                        </div>
                    </div>
                )}


                <div className='d-flex justify-content-end gap-2 mt-3'>
                    <Button size='sm' color="secondary" onClick={closeModal}>Cancel</Button>
                    <Button size='sm' color="primary" disabled={isSubmitDisabled} onClick={handleSubmit}>Submit</Button>
                </div>
            </ModalBody>
            {/* <ModalFooter>
                <Button size='sm' color="secondary" onClick={closeModal}>Cancel</Button>
                <Button size='sm' color="primary" disabled={isSubmitDisabled} onClick={handleSubmit}>Submit</Button>
            </ModalFooter> */}
        </Modal>
    );
};

SelectAdminTestMultipleVersions.propTypes = {
    modalOpen: PropTypes.bool.isRequired,
    toggleModal: PropTypes.func.isRequired,
    modelaccuracytest: PropTypes.array.isRequired,
    acctest: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    rectangles: PropTypes.any,
};

export default SelectAdminTestMultipleVersions;