import React from 'react'
import { Button } from 'reactstrap';
import urlSocket from '../urlSocket';

const ModelInfoConfig = () => {
  const createModelInfo = async () => {
    try {
      const response = urlSocket.post('/modelInfo_config');
      console.log('/modelInfo_config ', response)
    } catch (error) {
      console.log('/modelInfo_config ', error)
    }
  }

  return (
    <div className='page-content'>
      <h5 className='fw-bold'>Model Info Config</h5>
      <>
      {/* <Button size='sm' color='primary' onClick={() => createModelInfo()}>Create Models in Database</Button> */}
      
      </>
    </div>
  )
}

// ModelInfoConfig.propTypes = {
//     versionData: PropTypes.any.isRequired, // Change 'any' to the appropriate type
//     setVersionData: PropTypes.any.isRequired, // Change 'any' to the appropriate type
// };

export default ModelInfoConfig;