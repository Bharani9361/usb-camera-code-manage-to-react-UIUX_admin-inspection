import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, Table, Button } from 'reactstrap';
import PropTypes from 'prop-types';

const MasterInfoModal = ({ isOpen, toggle, regions, stations }) => {

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>
                <span  style={{ fontWeight: 'bold' }}>Mastered Data Information</span>
            </ModalHeader>
            <ModalBody>
                <h5 className='mb-3' style={{ fontWeight: 'bold', textAlign: 'center' }}>Region Information</h5>
                <Table bordered>
                    <thead>
                        <tr>
                            <th>S.No</th>
                            <th>Region Name</th>
                            <th>Min Value</th>
                            <th>Max Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {regions?.map((region, index) => (
                            <tr key={index}>
                                <td>{index+1}</td>
                                <td>{region.regionName}</td>
                                <td>{region.minValue}</td>
                                <td>{region.maxValue}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                {
                    stations?.length > 0 &&
                    <div className='my-3'>
                    <h5 className='mb-3' style={{fontWeight: 'bold', textAlign: 'center'}}>Assigned Stations</h5>
                    <Table bordered>
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Station Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stations?.map((station, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{station}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    </div>
                }

               

                <div className='d-flex justify-content-center'>
                <Button color="primary" onClick={toggle}>Close</Button>
                </div>
            </ModalBody>
        </Modal>
    );
};

// PropTypes validation
MasterInfoModal.propTypes = {
    isOpen: PropTypes.any.isRequired,
    toggle: PropTypes.any.isRequired,
    regions: PropTypes.any.isRequired,
    stations: PropTypes.any.isRequired,
};

export default MasterInfoModal;
