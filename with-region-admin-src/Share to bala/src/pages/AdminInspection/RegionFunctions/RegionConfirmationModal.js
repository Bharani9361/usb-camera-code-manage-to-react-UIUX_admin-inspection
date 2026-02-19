// RegionConfirmationModal.js
import PropTypes from 'prop-types';
import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner, Alert, Table } from 'reactstrap';

const RegionConfirmationModal = ({ isOpen, toggle, onConfirm, message, updatingRegions }) => {
    // console.log(' isOpen, toggle, onConfirm, message, updatingRegions ',  isOpen, toggle, onConfirm, message, updatingRegions )
    return (
        <Modal isOpen={isOpen} toggle={toggle} centered size='md' backdrop='static' keyboard={false}>
            {/* <ModalHeader toggle={toggle}>Confirm Changes</ModalHeader> */}
            <ModalBody>
                

                {/*  */}
                <Alert color="warning" className="mb-4">
                    <strong>Do you want to save changes?</strong><br />
                </Alert>

                {
                    message?.version_list?.length > 0 ?
                        <div className="mb-3">
                            <p className='fw-bold'>If you change the region values:</p>
                            <p><strong>{`The following model version's trained data will be removed.`}</strong><br />
                                You will need to train it again.</p>
                            {message?.version_list?.length > 0 ? (
                                <Table bordered size="sm" className="mb-3">
                                    <thead>
                                        <tr>
                                            <th>S. No.</th>
                                            <th>Model Name</th>
                                            <th>Model Version</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {message.version_list.map((v, i) => (
                                            <tr key={i}>
                                                <td>{i + 1}</td>
                                                <td>{v.model_name}</td>
                                                <td>{v.model_ver}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : <p className="text-muted">No versions affected.</p>}
                        </div>
                    : null
                }
                {
                    message?.profile_list?.length > 0 ?
                        <div className="mb-3">
                            <p><strong>{`The following profile(s) will be deleted:`}</strong></p>
                            {message.profile_list.length > 0 ? (
                                <Table bordered size="sm" className="mb-3">
                                    <thead>
                                        <tr>
                                            <th>S. No.</th>
                                            <th>Profile Name</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {message.profile_list.map((p, i) => (
                                            <tr key={i}>
                                                <td>{i + 1}</td>
                                                <td>{p.profile_name}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : <p className="text-muted">No profiles will be deleted.</p>}
                        </div>
                    : null
                }
                {
                    message?.stations_list?.length > 0 ?
                        <div>
                            <p><strong>This component will be removed from the following stations:</strong></p>
                            {message?.stations_list?.length > 0 ? (
                                <Table bordered size="sm">
                                    <thead>
                                        <tr>
                                            <th>S. No.</th>
                                            <th>Station Name</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {message.stations_list.map((s, i) => (
                                            <tr key={i}>
                                                <td>{i + 1}</td>
                                                <td>{s.station_name}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : <p className="text-muted">No stations affected.</p>}
                        </div>
                    : null
                }
                {/*  */}

                {/* {message.message || "Do you want to save the changes to the rectangles?"} */}
                <div className='d-flex justify-content-end'>
                    <Button size='sm' className='me-2 d-flex justify-content-center align-items-center' color="danger" 
                        onClick={onConfirm} disabled={updatingRegions}
                    >
                        {
                            updatingRegions ?
                                <Spinner size="sm" className='me-2' />
                                : null
                        }
                        Yes
                    </Button>
                    <Button size='sm' color="secondary" onClick={toggle}>No</Button>
                </div>
            </ModalBody>
        </Modal>
    );
};

RegionConfirmationModal.propTypes = {
    isOpen: PropTypes.any.isRequired,
    toggle: PropTypes.any.isRequired,
    onConfirm: PropTypes.any.isRequired,
    message: PropTypes.any.isRequired,
    updatingRegions: PropTypes.any.isRequired,
}

export default RegionConfirmationModal;