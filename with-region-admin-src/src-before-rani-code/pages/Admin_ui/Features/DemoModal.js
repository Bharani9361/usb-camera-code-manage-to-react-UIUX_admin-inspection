import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input, Label, FormGroup } from "reactstrap";

class DemoModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            radioValue: "option1", // Default radio value
            number1: 10,           // Default number input values
            number2: 20,
            tempRadioValue: "option1", // Temporary state for the modal
            tempNumber1: 10,
            tempNumber2: 20
        };
    }

    toggleModal = () => {
        this.setState({ modal: !this.state.modal });
    };

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({ [name]: value }); // Update temp values (not in main state)
    };

    handleSubmit = () => {
        this.setState({
            radioValue: this.state.tempRadioValue,
            number1: this.state.tempNumber1,
            number2: this.state.tempNumber2
        });
        this.toggleModal(); // Close modal after submit
    };

    render() {
        return (
            <div>
                <Button color="primary" onClick={this.toggleModal}>Edit Values</Button>

                <Modal isOpen={this.state.modal} toggle={this.toggleModal}>
                    <ModalHeader toggle={this.toggleModal}>Edit Your Inputs</ModalHeader>
                    <ModalBody>
                        <FormGroup>
                            <Label>
                                <Input
                                    type="radio"
                                    name="tempRadioValue"
                                    value="option1"
                                    checked={this.state.tempRadioValue === "option1"}
                                    onChange={this.handleInputChange}
                                />{" "}
                                Option 1
                            </Label>
                            <Label>
                                <Input
                                    type="radio"
                                    name="tempRadioValue"
                                    value="option2"
                                    checked={this.state.tempRadioValue === "option2"}
                                    onChange={this.handleInputChange}
                                />{" "}
                                Option 2
                            </Label>
                        </FormGroup>

                        <FormGroup>
                            <Label for="number1">Number 1</Label>
                            <Input
                                type="number"
                                name="tempNumber1"
                                id="number1"
                                value={this.state.tempNumber1}
                                onChange={this.handleInputChange}
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label for="number2">Number 2</Label>
                            <Input
                                type="number"
                                name="tempNumber2"
                                id="number2"
                                value={this.state.tempNumber2}
                                onChange={this.handleInputChange}
                            />
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.handleSubmit}>Submit</Button>
                        <Button color="secondary" onClick={this.toggleModal}>Cancel</Button>
                    </ModalFooter>
                </Modal>

                <div>
                    <h5>Current Values:</h5>
                    <p>Radio: {this.state.radioValue}</p>
                    <p>Number 1: {this.state.number1}</p>
                    <p>Number 2: {this.state.number2}</p>
                </div>
            </div>
        );
    }
}

export default DemoModal;
