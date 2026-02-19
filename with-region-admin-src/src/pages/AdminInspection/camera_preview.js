import React, { Component } from 'react';
import Webcam from 'react-webcam';
import { Button, Row, Col, Label } from 'reactstrap';

class CameraPreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeCameraIndex: 0,
      cameras: [], // array to store available camera devices
      selectedCamera: null,
      selectedCamLabel: null,
    };
  }

  componentDidMount() {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const cameras = devices.filter(device => device.kind === 'videoinput');
        console.log('data19 ', cameras)
        this.setState({ cameras });
      })
      .catch(error => {
        console.error('Error accessing camera devices:', error);
      });
  }

  switchCamera = () => {
    const { activeCameraIndex, cameras } = this.state;
    const nextCameraIndex = (activeCameraIndex + 1) % cameras.length;
    console.log('data26 ', cameras, activeCameraIndex, nextCameraIndex)
    this.setState({ activeCameraIndex: nextCameraIndex });
  }

//   handleCameraChange = event => {
//     const selectedCamera = event.target.value;
  handleCameraChange = (value, value2) => {
    const selectedCamera = value;
    const selectedCamLabel = value2;
    this.setState({ selectedCamera, selectedCamLabel });
  };

  render() {
    const { activeCameraIndex, cameras, selectedCamera, selectedCamLabel } = this.state;
    const activeCamera = cameras[activeCameraIndex];

    return (
      <div className='page-content'>
        <h2>Camera Preview</h2>
        {/* <Button onClick={this.switchCamera}>Switch Camera</Button> */}
        {/* <select onChange={(event) => this.handleCameraChange(event.target.value)} value={selectedCamera}>
            <option value="">Select Camera</option>
            {cameras.map(camera => (
                <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `Camera ${camera.deviceId}`}
                </option>
            ))}
        </select> */}
        {
            !cameras.length ? null :
            <>
            <Row>
                {
                    cameras.map((camera, cam_id) => (
                        <Col className='my-3' sm={3} md={3} lg={3} key={cam_id} onClick={() => this.handleCameraChange(camera.deviceId, camera.label)}>
                        <Webcam
                            style={{ width: '100%', height: 'auto' }}
                            key={camera.deviceId}
                            audio={false}
                            videoConstraints={{ deviceId: camera.deviceId }}
                        />
                        </Col>
                    ))
                }
            </Row>
            </>
            
        }
        {selectedCamera ? (
          <>
          <Label>{selectedCamLabel}</Label>
          <Row>
            <Col sm={6} md={6} lg={6}>
                <Webcam
                  key={selectedCamera}
                  audio={false}
                  videoConstraints={{ deviceId: selectedCamera }}
                />
            </Col>
            
          </Row>
          
          </>
          
        ) : (
          <p>No cameras selected</p>
        )}
      </div>
    );
  }
}

export default CameraPreview;
