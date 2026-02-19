import PropTypes from 'prop-types';
import React, { useState } from 'react';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    FormGroup,
    Label,
    Input,
    ListGroup,
    ListGroupItem
} from 'reactstrap';

const AdminTestingModal = ({ isOpen, toggle, component_models }) => {
    const [componentTest, setComponentTest] = useState(false);
    const [regionTest, setRegionTest] = useState(false);

    const models = [
        { _id: '1', name: 'Model A', region_testing: true },
        { _id: '2', name: 'Model B', region_testing: false },
        { _id: '3', name: 'Model C', region_testing: true },
        { _id: '4', name: 'Model D', region_testing: false },
        { _id: '5', name: 'Model E', region_testing: true },
    ];

    const getFilteredModels = () => {
        if (componentTest && regionTest) {
            return models.filter(model => model.region_testing === true);
        } else if (componentTest) {
            return models;
        } else if (regionTest) {
            return models.filter(model => model.region_testing === true);
        }
        return [];
    };

    const getTestType = () => {
        if (componentTest && regionTest) return 'both_test';
        if (componentTest) return 'component_only_test';
        if (regionTest) return 'region_only_test';
        return null;
    };

    const filteredModels = getFilteredModels();
    const selectedTestType = getTestType();

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Select Admin Testing Type</ModalHeader>
            <ModalBody>
                <FormGroup check inline>
                    <Label check>
                        <Input
                            type="checkbox"
                            checked={componentTest}
                            onChange={() => setComponentTest(!componentTest)}
                        />{' '}
                        Component Test
                    </Label>
                </FormGroup>
                <FormGroup check inline className="ms-3">
                    <Label check>
                        <Input
                            type="checkbox"
                            checked={regionTest}
                            onChange={() => setRegionTest(!regionTest)}
                        />{' '}
                        Region Test
                    </Label>
                </FormGroup>

                <hr />

                {selectedTestType ? (
                    <>
                        <p><strong>Selected Test Type:</strong> {selectedTestType}</p>
                        <ListGroup>
                            {filteredModels.map((model) => (
                                <ListGroupItem key={model._id}>
                                    {model.name} ({model.region_testing ? 'Has Region Testing' : 'Component Only'})
                                </ListGroupItem>
                            ))}
                        </ListGroup>
                    </>
                ) : (
                    <p className="text-danger mt-3">Please select at least one test type.</p>
                )}
            </ModalBody>
            <ModalFooter>
                <Button color="primary" onClick={toggle}>Done</Button>
            </ModalFooter>
        </Modal>
    );
};

AdminTestingModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    component_models: PropTypes.any.isRequired,
};

export default AdminTestingModal;
