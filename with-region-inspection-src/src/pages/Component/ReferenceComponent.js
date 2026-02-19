import React from 'react';
import { Col, Row } from "reactstrap";
import PropTypes from 'prop-types';

const ReferenceComponent = ({ datasets, getImage }) => {
    const [data] = datasets;

    return (
        <div style={{ position: 'relative' }}>
            <div
                className="obj_style_pdg comp_stl"
                style={{
                    position: 'absolute',
                    zIndex: '2',
                    top: '5%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'black',
                    backgroundColor: 'white',
                    borderRadius: '1rem',
                    padding: '0.5rem 1rem',
                }}
            >
                <label className="stl_plobj_txt" style={{ margin: '0' }}>
                    Component Name: {data.component_name}, Component Code: {data.component_code}
                </label>
            </div>
            <Row>
                {getImage(data.image_path, data.type) !== '' && (
                    <Col>
                        <img style={{ height: 'auto', width: '100%', borderRadius: '2rem' }} src={getImage(data.image_path, data.type)} />
                    </Col>
                )}
            </Row>
        </div>
    );
};

ReferenceComponent.propTypes = {
    datasets: PropTypes.arrayOf(
        PropTypes.shape({
            component_name: PropTypes.string.isRequired,
            component_code: PropTypes.string.isRequired,
            image_path: PropTypes.string.isRequired,
            type: PropTypes.string.isRequired,
        })
    ).isRequired,
    getImage: PropTypes.func.isRequired,
};

export default ReferenceComponent;