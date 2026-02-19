import React, { Component } from "react";
import Webcam from "react-webcam";
import { Label } from "reactstrap";

class ExampleCamera extends Component {
    constructor(props) {
        super(props);
        this.state = {
            devices:[]
        }
    }
    
    componetDidMount = async() => {
        () => {
            navigator.mediaDevices.enumerateDevices().then(this.cameraDevices);
          },
     this.cameraDevices()
    }

    handleDevices = () => {
       mediaDevices =>
        this.setState({devices:mediaDevices.filter(({ kind }) => kind === "videoinput")})
        //this.setState({devices})
        console.log('this.state.devices', mediaDevices.filter(({ kind }) => kind === "videoinput"))
    }

    cameraDevices = this.handleDevices.bind(this)

    render() {
        return (
            <div>
               {
                this.cameraDevices()
               }
            </div>
        )
    }

}
export default ExampleCamera;