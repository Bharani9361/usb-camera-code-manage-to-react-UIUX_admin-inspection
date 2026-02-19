import React from 'react';
import { Modal, ModalHeader, ModalBody, Table, Button } from 'reactstrap';
import PropTypes from 'prop-types';

const OneDTwoDRunoutResults = ({
  isOpen,
  toggle,
  oneDRunout,
  twoDRunout,
}) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>
        <span style={{ fontWeight: 'bold' }}>1D and 2D Sensor Runout Results</span>
      </ModalHeader>
      <ModalBody>
        <h5 className="mb-3" style={{ fontWeight: 'bold', textAlign: 'center' }}>
          1D Sensor Result
        </h5>
        <Table bordered>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Min Value</th>
              <th>Max Value</th>
              <th>Runout</th>
            </tr>
          </thead>
          <tbody>
            {oneDRunout?.min_value ? (
              <tr>
                <td>1</td>
                <td>{oneDRunout.min_value}</td>
                <td>{oneDRunout.max_value}</td>
                <td>{oneDRunout.runout}</td>
              </tr>
            ) : (
              <tr>
                <td>1</td>
                <td colSpan={3}>No data available.</td>
              </tr>
            )}
          </tbody>
        </Table>

        <div className="my-3">
          <h5 className="mb-3" style={{ fontWeight: 'bold', textAlign: 'center' }}>
            2D Sensor Result
          </h5>
          <Table bordered>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Region Name</th>
                <th>Min Value</th>
                <th>Max Value</th>
                <th>Runout</th>
              </tr>
            </thead>
            <tbody>
              {twoDRunout?.map((value, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{value.name}</td>
                  <td>{value.min_deviation}</td>
                  <td>{value.max_deviation}</td>
                  <td>{value.runout}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="d-flex justify-content-center">
          <Button color="primary" onClick={toggle}>
            Close
          </Button>
        </div>
      </ModalBody>
    </Modal>
  );
};

OneDTwoDRunoutResults.propTypes = {
  isOpen: PropTypes.any,
  toggle: PropTypes.any,
  oneDRunout: PropTypes.any,
  twoDRunout: PropTypes.any,
};

export default OneDTwoDRunoutResults;