import React from "react";
import Webcam from "react-webcam";



const WebcamCapture = () => {
  // console.log('props', props)
  // const data = props
  // const selected_data = data.selected_data
  // console.log('selected_data10', selected_data)
  const [deviceId, setDeviceId] = React.useState({});
  const [devices, setDevices] = React.useState([]);


  const onUserMedia = () => {
    console.log('ready 29', devices.deviceId)
    if (devices.deviceId !== '' && devices.deviceId !== undefined) {
      let data = 'ready for camera'
      this.props.selected_data(data)
    }
    else {
      // selected_data('not support camera')
      console.log('not support camera')
    }
  }

  const handleDevices = React.useCallback(
    mediaDevices =>
      setDevices(mediaDevices.filter(({ kind }) => kind )),
    [setDevices]
    
  );

  React.useEffect(
    () => {
      navigator.mediaDevices.enumerateDevices().then(handleDevices)

    },
    [handleDevices]
  );

  const device_info = () => {
    console.log('device', device)

    selected_data(devices)
  }


  return (
    <>
      {/* {
        devices.deviceId !=='' && devices.deviceId !== undefined?
        
          console.log('37','ready')
       :
         console.log('39','not support camera')
       } */}
      {/* {device_info()} */}
      {devices.map((device, key) => (
            <div key={key}>
              {
                console.log('ready for camera', device)
              }
              <Webcam audio={false} videoConstraints={{ deviceId: device.deviceId  }} />
              {device.label || `Device ${key + 1}`}
            
            </div>
  
          ))}
    </>
  );
};

export default WebcamCapture;

// '38f3e7a868435999aaf2632d3596fd0e94e06c0535dc695e9775eb8548efd11d'